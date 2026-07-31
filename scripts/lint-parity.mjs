// Design <-> code parity gate.
//
// The token pipeline already refuses to let `dist/` drift from `tokens/`. This does the
// same for the other half of the system: the component roster in Figma against the one
// the package actually exports. Without it the two sides are separate implementations
// that a human is expected to keep in step, which is exactly the thing this project
// claims not to rely on.
//
// The Figma side is a committed snapshot (figma/components.json), extracted through the
// plugin channel the same way tokens are — Variables and Code Connect are both gated
// behind plans this project is not on. That means the gate enforces "the committed design
// contract matches the code", and refreshing the snapshot is the deliberate act that
// surfaces a design-side change. It cannot detect an unexported Figma edit, and does not
// claim to.
//
// Known gaps are declared in figma/parity.config.json and act as a ratchet: a gap that is
// listed does not fail the build, but a gap that is NOT listed does — and a listed gap
// that has been closed also fails, so the list can only shrink.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const barrelPath = join(root, 'src', 'index.ts');
const snapshotPath = join(root, 'figma', 'components.json');
const configPath = join(root, 'figma', 'parity.config.json');

// ---------------------------------------------------------------- code side

/** Props that describe layout or content rather than a design-time choice. */
const NON_VARIANT_PROPS = new Set(['className', 'children', 'style']);

function classify(checker, type) {
  const parts = type.isUnion() ? type.types : [type];
  const defined = parts.filter((t) => !(t.flags & ts.TypeFlags.Undefined));
  if (!defined.length) return { kind: 'other' };

  if (defined.every((t) => t.isStringLiteral())) {
    return { kind: 'variant', options: defined.map((t) => t.value) };
  }
  if (defined.every((t) => t.flags & (ts.TypeFlags.BooleanLiteral | ts.TypeFlags.Boolean))) {
    return { kind: 'boolean' };
  }
  return { kind: 'other' };
}

function readCodeSide() {
  const config = ts.parseJsonConfigFileContent(
    ts.readConfigFile(join(root, 'tsconfig.json'), ts.sys.readFile).config,
    ts.sys,
    root,
  );
  const program = ts.createProgram([barrelPath], config.options);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(barrelPath);

  // Value exports whose name is PascalCase — the components the package ships.
  const exported = [];
  source.forEachChild((node) => {
    if (!ts.isExportDeclaration(node) || node.isTypeOnly || !node.exportClause) return;
    if (!ts.isNamedExports(node.exportClause)) return;
    for (const el of node.exportClause.elements) {
      if (el.isTypeOnly) continue;
      const name = el.name.text;
      if (/^[A-Z]/.test(name)) exported.push(name);
    }
  });

  // Own (non-inherited) props of each <Name>Props interface.
  const moduleSymbol = checker.getSymbolAtLocation(source);
  const moduleExports = checker.getExportsOfModule(moduleSymbol);
  const byName = new Map(moduleExports.map((s) => [s.getName(), s]));

  // The barrel re-exports, so every symbol here is an alias whose own declaration is the
  // ExportSpecifier, not the interface. Resolve through it or every props type reads as
  // empty and the gate silently compares nothing.
  const deref = (s) => (s && s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s);

  const components = {};
  for (const name of exported) {
    const propsSymbol = deref(byName.get(`${name}Props`));
    const props = {};

    const decl = propsSymbol?.declarations?.find(ts.isInterfaceDeclaration);
    if (decl) {
      for (const member of decl.members) {
        if (!ts.isPropertySignature(member) || !member.type) continue;
        const propName = member.name.getText();
        if (NON_VARIANT_PROPS.has(propName)) continue;
        const info = classify(checker, checker.getTypeAtLocation(member.type));
        if (info.kind !== 'other') props[propName] = info;
      }
    }
    components[name] = { props, hasPropsType: Boolean(decl) };
  }
  return components;
}

// ---------------------------------------------------------------- comparison

/** Figma "Variant"/"Icon Start" -> code `variant`/`iconStart`. */
const toPropName = (s) =>
  s
    .trim()
    .split(/[\s_-]+/)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join('');

const norm = (s) => String(s).trim().toLowerCase().replace(/[\s_-]+/g, '');

function compare(figma, code, config) {
  const aliases = config.propAliases || {};
  const ignoreCodeOnly = new Set(config.ignoreCodeOnly || []);
  const ignoreFigmaOnly = new Set(config.ignoreFigmaOnly || []);
  // Figma properties that legitimately have no code prop. Two kinds, both real:
  //   - interaction state (Hover, Pressed, Focus) — a CSS pseudo-class, never a prop;
  //   - native element attributes (`disabled`, `required`) — inherited from
  //     ButtonHTMLAttributes and friends, so absent from the component's own props.
  // Figma has to model both as variant axes because they change fills. That is the two
  // media disagreeing about mechanism, not the system drifting.
  const nonPropProperties = config.nonPropProperties || {};
  const findings = [];

  const codeNames = Object.keys(code).filter((n) => !ignoreCodeOnly.has(n));
  const figmaNames = Object.keys(figma).filter((n) => !ignoreFigmaOnly.has(n));

  for (const name of codeNames) {
    if (!figma[name]) findings.push({ kind: 'missing-in-figma', component: name });
  }
  for (const name of figmaNames) {
    if (!code[name]) findings.push({ kind: 'missing-in-code', component: name });
  }

  for (const name of codeNames) {
    const f = figma[name];
    if (!f) continue;
    const alias = aliases[name] || {};
    const codeProps = code[name].props;

    const figmaProps = {};
    for (const [rawName, def] of Object.entries(f.properties || {})) {
      // Figma appends an instance suffix to property keys, e.g. "Variant#12:3".
      const bare = rawName.split('#')[0];
      figmaProps[alias[bare] || toPropName(bare)] = { raw: bare, ...def };
    }

    const native = new Set(nonPropProperties[name] || []);

    for (const [prop, def] of Object.entries(figmaProps)) {
      const c = codeProps[prop];
      if (!c) {
        if (!native.has(prop)) {
          findings.push({ kind: 'prop-missing-in-code', component: name, prop, figmaProp: def.raw });
        }
        continue;
      }
      // A boolean prop whose effect is a fill or stroke change cannot be a Figma BOOLEAN
      // property — those only toggle visibility. The idiom is a True/False variant axis,
      // and it means the same thing.
      const boolAxis =
        def.type === 'VARIANT' &&
        (() => {
          const s = new Set((def.variantOptions || []).map(norm));
          return s.size === 2 && s.has('true') && s.has('false');
        })();

      if (boolAxis) {
        if (c.kind !== 'boolean') {
          findings.push({ kind: 'prop-type-differs', component: name, prop, figma: 'VARIANT True/False', code: c.kind });
        }
      } else if (def.type === 'VARIANT' && c.kind === 'variant') {
        const fOpts = (def.variantOptions || []).map(norm).sort();
        const cOpts = c.options.map(norm).sort();
        if (fOpts.join(',') !== cOpts.join(',')) {
          findings.push({
            kind: 'variant-options-differ',
            component: name,
            prop,
            figma: def.variantOptions,
            code: c.options,
          });
        }
      } else if (def.type === 'BOOLEAN' && c.kind !== 'boolean') {
        findings.push({ kind: 'prop-type-differs', component: name, prop, figma: 'BOOLEAN', code: c.kind });
      } else if (def.type === 'VARIANT' && c.kind !== 'variant') {
        findings.push({ kind: 'prop-type-differs', component: name, prop, figma: 'VARIANT', code: c.kind });
      }
    }

    for (const prop of Object.keys(codeProps)) {
      if (!figmaProps[prop]) {
        findings.push({ kind: 'prop-missing-in-figma', component: name, prop });
      }
    }
  }

  return findings;
}

const key = (f) => [f.kind, f.component, f.prop].filter(Boolean).join(':');

// ---------------------------------------------------------------- run

const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {};
const snapshot = existsSync(snapshotPath) ? JSON.parse(readFileSync(snapshotPath, 'utf8')) : null;

if (!snapshot) {
  console.error(`No Figma snapshot at ${snapshotPath.replace(root, '.')}.`);
  console.error('Extract one through the plugin channel before running the parity gate.');
  process.exit(1);
}

const code = readCodeSide();
const findings = compare(snapshot.components || {}, code, config);

const known = new Set(config.knownGaps || []);
const unexpected = findings.filter((f) => !known.has(key(f)));
const live = new Set(findings.map(key));
const stale = [...known].filter((k) => !live.has(k));

const codeCount = Object.keys(code).filter((n) => !(config.ignoreCodeOnly || []).includes(n)).length;
const figmaCount = Object.keys(snapshot.components || {}).length;
const paired = Object.keys(code).filter((n) => snapshot.components?.[n]).length;

console.log(`Figma snapshot: ${snapshot._meta?.extracted_at || 'unknown date'} (file ${snapshot._meta?.fileKey || '?'})`);
console.log(`Components — code ${codeCount}, Figma ${figmaCount}, paired ${paired} (${codeCount ? Math.round((paired / codeCount) * 100) : 0}% of the code roster)\n`);

if (unexpected.length) {
  console.log(`${unexpected.length} unlisted drift finding(s):`);
  for (const f of unexpected) {
    const detail =
      f.kind === 'variant-options-differ'
        ? ` Figma [${f.figma.join(', ')}] vs code [${f.code.join(', ')}]`
        : f.kind === 'prop-type-differs'
          ? ` Figma ${f.figma} vs code ${f.code}`
          : '';
    console.log(`  ${f.kind}  ${f.component}${f.prop ? '.' + f.prop : ''}${detail}`);
  }
  console.log('');
}

if (stale.length) {
  console.log(`${stale.length} known gap(s) already closed — remove them from parity.config.json:`);
  for (const k of stale) console.log(`  ${k}`);
  console.log('');
}

console.log(`${findings.length} total gap(s), ${known.size} accepted, ${unexpected.length} unlisted, ${stale.length} stale.`);

if (unexpected.length || stale.length) process.exit(1);
console.log('Parity gate PASS.');
