// Build pipeline: Tokens Studio DTCG source (tokens/*.json) -> Style Dictionary v5
// (+ @tokens-studio/sd-transforms) -> dist/*
//
// Source is an authentic Tokens Studio set: per-set files, $themes.json (Colour
// scheme × Brand), $metadata.json (set order). This is the same shape the Tokens
// Studio Figma plugin reads and writes over its GitHub sync — so a designer editing
// a variable and pushing lands here with no format translation.
//
// Emits three targets from that one source of truth:
//   dist/tokens.css   :root (light) + [data-theme="dark"] + [data-brand] overrides
//   dist/tokens.ts    typed constants + union types (a wrong token name fails to compile)
//   dist/tokens.json  flat resolved map (both modes) for docs and the Storybook token page

import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

register(StyleDictionary); // adds the `tokens-studio` preprocessor + transform group

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const T = resolve(root, 'tokens');
const dist = resolve(root, 'dist');
mkdirSync(dist, { recursive: true });
const load = (f) => JSON.parse(readFileSync(resolve(T, f), 'utf8'));

const metadata = load('$metadata.json');
const kebab = (s) => s.toLowerCase().replace(/[\s/]+/g, '-');
const refToVar = (r) => '--' + r.replace(/[{}]/g, '').replace(/\./g, '-'); // {teal.600} -> --teal-600
const isRef = (v) => typeof v === 'string' && v.startsWith('{');

// ---- flatten a DTCG node into { "a-b-c": { $value, $type } } ----------------
function flatten(node, prefix = [], out = {}) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && ('$value' in v)) out[[...prefix, k].join('-')] = v;
    else if (v && typeof v === 'object') flatten(v, [...prefix, k], out);
  }
  return out;
}

// ---- models parsed from the Tokens Studio sets -----------------------------
const primPaints = flatten(load('primitives.json'));           // "teal-600" -> {$value:'#..'}
const primitives = Object.fromEntries(
  Object.entries(primPaints).map(([k, t]) => [k, t.$value]));

const scaleRaw = flatten(load('scale.json'));                  // "space-16" -> {$value:'16px'}
const scale = {};
for (const [k, t] of Object.entries(scaleRaw)) {
  const group = k.split('-')[0];
  const px = parseFloat(t.$value);
  scale[k] = { value: px, group, css: group === 'radius' ? `${px}px` : `${px / 16}rem` };
}

const semLight = flatten(load('semantic-light.json'));         // "color-surface-page" -> {$value:'{slate.50}'}
const semDark = flatten(load('semantic-dark.json'));
const semantic = {};
for (const key of Object.keys(semLight)) {
  const name = key.replace(/^color-/, '');
  const refL = semLight[key].$value, refD = semDark[key].$value;
  semantic[name] = {
    refLight: refL.replace(/[{}]/g, '').replace('.', '-'),
    refDark: refD.replace(/[{}]/g, '').replace('.', '-'),
    light: primitives[refL.replace(/[{}]/g, '').replace('.', '-')],
    dark: primitives[refD.replace(/[{}]/g, '').replace('.', '-')],
  };
}

const brandOverride = flatten(load('brand-ace-high.json'));    // "color-brand-base" -> {$value:'{plum.600}'}
const elevLight = flatten(load('elevation-light.json'));
const elevDark = flatten(load('elevation-dark.json'));
const typeRaw = load('typography.json');

// ---- Style Dictionary: resolve + emit the colour layer ----------------------
// SD (with the tokens-studio preprocessor) owns reference resolution and colour
// normalisation; the custom format keeps semantic->primitive as a live var() so
// runtime theming cascades instead of being flattened to hex.
StyleDictionary.registerFormat({
  name: 'pm/css-vars',
  format: ({ dictionary, options }) => {
    const lines = dictionary.allTokens
      .filter(options.filter || (() => true))
      .map((t) => {
        const orig = t.original.$value ?? t.original.value;      // ref or literal, pre-resolve
        if (options.refs && isRef(orig)) return `  --${t.name}: var(${refToVar(orig)});`;
        return `  --${t.name}: ${t.$value ?? t.value};`;          // DTCG resolved value
      });
    return `${options.selector} {\n${lines.join('\n')}\n}`;
  },
});

async function buildColorCss(sources, selector, { filter, refs = true } = {}) {
  const sd = new StyleDictionary({
    source: sources.map((f) => resolve(T, f)),
    preprocessors: ['tokens-studio'],
    usesDtcg: true,
    log: { verbosity: 'silent', warnings: 'disabled' },
    platforms: {
      css: {
        transforms: ['name/kebab', 'color/css'],
        files: [{ destination: 'x.css', format: 'pm/css-vars', options: { selector, refs, filter } }],
      },
    },
  });
  const { output } = (await sd.formatPlatform('css'))[0];
  return output;
}

// scale is dimension-only; emit rem/px by group with a tiny direct renderer
const scaleCss = Object.entries(scale)
  .map(([k, s]) => `  --${k}: ${s.css};`).join('\n');

const onlySemantic = (t) => t.path[0] === 'color';
const primFilter = (t) => t.path[0] !== 'color';

// light :root = primitives + semantic-light (+ scale appended)
let lightCss = await buildColorCss(['primitives.json', 'semantic-light.json'], ':root');
lightCss = lightCss.replace(/\n}$/, `\n${scaleCss}\n}`);
// dark = semantic overrides only
const darkCss = await buildColorCss(
  ['primitives.json', 'semantic-dark.json'], ':root[data-theme="dark"], .theme-dark',
  { filter: onlySemantic });

// elevation shadows, themed
const shadowVars = (set) => Object.entries(set)
  .map(([k, t]) => `  --shadow-${k.replace(/^shadow-/, '')}: ${t.$value};`).join('\n');
const lightWithShadow = lightCss.replace(/\n}$/, `\n${shadowVars(elevLight)}\n}`);
const darkWithShadow = darkCss.replace(/\n}$/, `\n${shadowVars(elevDark)}\n}`);

// ---- white-label brand blocks ----------------------------------------------
// The Ace High set re-points every brand-family token onto the plum ramp; emit it
// per mode so [data-brand] stacks with light/dark. The step per mode comes from
// the matching semantic token, so light/dark brand shades stay correct.
function brandBlock(mode, selector) {
  const lines = [];
  for (const [key, t] of Object.entries(brandOverride)) {
    const name = key.replace(/^color-/, '');
    const swap = t.$extensions?.['com.poker.brandSwap'];
    if (!swap) continue;
    const semRef = mode === 'dark' ? semantic[name].refDark : semantic[name].refLight; // e.g. teal-600
    if (!semRef.startsWith(swap.from + '-')) continue;      // this mode isn't brand-family: no swap
    const swapped = semRef.replace(new RegExp('^' + swap.from + '-'), swap.to + '-');
    lines.push(`  --color-${name}: var(--${swapped});`);
  }
  return lines.length ? `${selector} {\n${lines.join('\n')}\n}` : '';
}
const brandSection = [
  brandBlock('light', ':root[data-brand="plum"], .brand-plum'),
  brandBlock('dark', ':root[data-brand="plum"][data-theme="dark"], .brand-plum.theme-dark'),
].filter(Boolean).join('\n\n');

// ---- typography ------------------------------------------------------------
const WEIGHT = { Regular: 400, Medium: 500, SemiBold: 600, 'Semi Bold': 600, Bold: 700 };
const typeStyles = [];
(function walk(node, prefix = []) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    if (v.$type === 'typography') typeStyles.push({ name: [...prefix, k].join('/'), v: v.$value });
    else if (typeof v === 'object') walk(v, [...prefix, k]);
  }
})(typeRaw);
const typeModel = typeStyles.map(({ name, v }) => {
  const cls = kebab(name);
  const weight = WEIGHT[v.fontWeight] ?? 400;
  const size = parseFloat(v.fontSize);
  const lh = v.lineHeight === 'AUTO' ? 'AUTO' : parseFloat(v.lineHeight);
  const ls = typeof v.letterSpacing === 'string' && v.letterSpacing.endsWith('%')
    ? `${(parseFloat(v.letterSpacing) / 100).toFixed(3)}em` : '0';
  const tc = v.textCase === 'uppercase' ? '\n  text-transform: uppercase;' : '';
  return { cls, name, family: v.fontFamily, weight, size, lh, ls, tc };
});
const typeCss = typeModel.map((t) =>
  `.type-${t.cls} {\n  font-family: var(--font-${t.family === 'Inter' ? 'sans' : 'display'});` +
  `\n  font-weight: ${t.weight};\n  font-size: ${+(t.size / 16).toFixed(4)}rem;` +
  `\n  line-height: ${t.lh === 'AUTO' ? 'normal' : +(t.lh / t.size).toFixed(3)};\n  letter-spacing: ${t.ls};${t.tc}\n}`
).join('\n\n');

const fontVars = `:root {\n  --font-sans: 'Inter', system-ui, sans-serif;\n` +
  `  --font-display: 'Plus Jakarta Sans', var(--font-sans);\n}`;

const banner = `/* PM Design System tokens — GENERATED by scripts/build-tokens.mjs.\n` +
  `   Source: tokens/ (Tokens Studio DTCG set). Do not edit by hand. */\n`;
writeFileSync(resolve(dist, 'tokens.css'),
  [banner, fontVars, lightWithShadow, darkWithShadow,
    brandSection ? '/* White-label brand themes */' : '', brandSection,
    '/* Type styles */', typeCss, ''].filter(Boolean).join('\n\n'));

// ---- tokens.ts -------------------------------------------------------------
const tsColor = Object.keys(semantic).map((k) => `  '${k}': 'var(--color-${k})',`).join('\n');
const tsSpace = Object.keys(scale).map((k) => `  '${k}': 'var(--${k})',`).join('\n');
const tsType = typeModel.map((t) => `  '${t.cls}': 'type-${t.cls}',`).join('\n');
writeFileSync(resolve(dist, 'tokens.ts'),
`// PM Design System tokens — GENERATED by scripts/build-tokens.mjs. Do not edit by hand.
// Every value is a CSS custom property; a name absent from the union fails to compile.

export const color = {
${tsColor}
} as const;
export type ColorToken = keyof typeof color;

export const space = {
${tsSpace}
} as const;
export type SpaceToken = keyof typeof space;

export const typography = {
${tsType}
} as const;
export type TypographyToken = keyof typeof typography;
`);

// ---- tokens.json -----------------------------------------------------------
writeFileSync(resolve(dist, 'tokens.json'), JSON.stringify({
  _meta: { generated_from: 'tokens/ (Tokens Studio DTCG set)', sets: metadata.tokenSetOrder },
  primitives,
  semantic: Object.fromEntries(Object.entries(semantic).map(([k, v]) =>
    [k, { light: v.light, dark: v.dark, refLight: v.refLight, refDark: v.refDark }])),
  scale: Object.fromEntries(Object.entries(scale).map(([k, s]) => [k, s.value])),
  elevation: {
    raised: { light: elevLight['raised']?.$value, dark: elevDark['raised']?.$value },
    overlay: { light: elevLight['overlay']?.$value, dark: elevDark['overlay']?.$value },
  },
  typography: Object.fromEntries(typeModel.map((t) =>
    [t.cls, { family: t.family, weight: t.weight, size: t.size, lineHeight: t.lh }])),
}, null, 2) + '\n');

console.log(`built dist/tokens.{css,ts,json} — ${Object.keys(primitives).length} primitives, ` +
  `${Object.keys(semantic).length} semantic, ${Object.keys(scale).length} scale, ` +
  `${typeModel.length} type styles`);
