// Build pipeline: Figma export (tokens/_source.json) -> Style Dictionary -> dist/*
//
// Emits three targets from ONE source of truth:
//   dist/tokens.css   :root (light) + [data-theme="dark"], semantic vars reference primitives
//   dist/tokens.ts    typed constants + union types (a wrong token name fails at compile time)
//   dist/tokens.json  flat resolved map (both modes) for docs and the Storybook token page
//
// Style Dictionary owns colour + dimension transforms and CSS reference output.
// Typography is emitted directly (composite type styles map cleanly to CSS utility classes).

import StyleDictionary from 'style-dictionary';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = JSON.parse(readFileSync(resolve(root, 'tokens/_source.json'), 'utf8'));
const dist = resolve(root, 'dist');
mkdirSync(dist, { recursive: true });

const WEIGHT = { Regular: 400, Medium: 500, SemiBold: 600, 'Semi Bold': 600, Bold: 700 };
const kebab = (s) => s.toLowerCase().replace(/[\s/]+/g, '-');

// ---- 1. Resolve the Figma export into flat models --------------------------
const primitives = {};                       // "slate-600" -> "#757d85"
for (const [ramp, steps] of Object.entries(src.primitives))
  for (const [step, hex] of Object.entries(steps)) primitives[`${ramp}-${step}`] = hex;

const semantic = {};                         // "surface-page" -> { light, dark, refLight, refDark }
for (const [name, m] of Object.entries(src.semantic)) {
  const key = kebab(name), refL = kebab(m.light), refD = kebab(m.dark);
  semantic[key] = { light: primitives[refL], dark: primitives[refD], refLight: refL, refDark: refD };
}

const scale = {};                            // "space-16" -> {value, unit, group}
for (const [group, items] of Object.entries(src.scale))
  for (const [k, v] of Object.entries(items)) {
    const unit = group === 'radius' ? (v >= 999 ? 'px' : 'px') : 'rem';
    scale[`${group}-${kebab(k)}`] = { value: v, unit, group };
  }

// ---- 2. Style Dictionary token trees ---------------------------------------
// Primitives + semantic live under distinct roots so names come out as
// `slate-600` (private) vs `color-surface-page` (public API).
function colorTree(mode) {
  const t = {};
  for (const [ramp, steps] of Object.entries(src.primitives)) {
    t[ramp] = {};
    for (const [step, hex] of Object.entries(steps)) t[ramp][step] = { value: hex, type: 'color' };
  }
  t.color = {};
  for (const [name, m] of Object.entries(src.semantic)) {
    const parts = kebab(name).split('-');
    const ref = mode === 'dark' ? kebab(m.dark) : kebab(m.light);
    let node = t.color;
    for (let i = 0; i < parts.length - 1; i++) node = node[parts[i] ??= {}] ?? (node[parts[i]] = {});
    node[parts[parts.length - 1]] = { value: `{${ref.replace('-', '.')}}`, type: 'color' };
  }
  return t;
}

function scaleTree() {
  const t = {};
  for (const [name, s] of Object.entries(scale)) {
    const [group, ...rest] = name.split('-');
    (t[group] ??= {})[rest.join('-')] = {
      value: s.unit === 'rem' ? `${s.value / 16}rem` : `${s.value}px`, type: 'dimension'
    };
  }
  return t;
}

StyleDictionary.registerFormat({
  name: 'pm/css-vars',
  format: ({ dictionary, options }) => {
    const lines = dictionary.allTokens
      .filter(options.filter || (() => true))
      .map((t) => {
        const ref = t.original.value;
        // emit var() reference for semantic -> primitive so runtime theming cascades
        if (options.refs && typeof ref === 'string' && ref.startsWith('{'))
          return `  --${t.name}: var(--${ref.slice(1, -1).replace('.', '-')});`;
        return `  --${t.name}: ${t.value};`;
      });
    return `${options.selector} {\n${lines.join('\n')}\n}`;
  },
});

const cssName = { type: 'name', name: 'pm/kebab', transform: (t) => t.path.join('-') };
StyleDictionary.registerTransform(cssName);

async function buildCss(mode, selector, filter) {
  const sd = new StyleDictionary({
    tokens: { ...colorTree(mode), ...(mode === 'light' ? scaleTree() : {}) },
    log: { verbosity: 'silent' },
    platforms: {
      css: {
        transforms: ['pm/kebab', 'color/css'],
        files: [{ destination: 'x.css', format: 'pm/css-vars', options: { selector, refs: true, filter } }],
      },
    },
  });
  const { output } = (await sd.formatPlatform('css'))[0];
  return output;
}

// ---- 3. CSS: light :root (primitives + scale + semantic) + dark overrides ---
const isSemantic = (t) => t.path[0] === 'color';
const lightCss = await buildCss('light', ':root');
const darkCss = await buildCss('dark', ':root[data-theme="dark"], .theme-dark', isSemantic);

// Elevation: composite shadows, themed. Injected into the light :root and the dark block.
const elevation = Object.fromEntries(
  Object.entries(src.elevation).filter(([k]) => !k.startsWith('_'))
);
const shadowVars = (mode) =>
  Object.entries(elevation).map(([k, v]) => `  --shadow-${k}: ${v[mode]};`).join('\n');
const lightWithShadow = lightCss.replace(/\n}$/, `\n${shadowVars('light')}\n}`);
const darkWithShadow = darkCss.replace(/\n}$/, `\n${shadowVars('dark')}\n}`);

// ---- 3b. White-label brand axis ---------------------------------------------
// For each brand theme, re-point every semantic token whose alias resolves to the
// `from` ramp onto the `to` ramp, keeping the step. Neutrals/status never move.
// Emitted as [data-brand] blocks, once per theme mode so it stacks with light/dark.
const brandThemes = Object.fromEntries(
  Object.entries(src.brandThemes || {}).filter(([k]) => !k.startsWith('_'))
);
function brandBlock(brandName, cfg, mode, selector) {
  const lines = [];
  for (const [name, m] of Object.entries(src.semantic)) {
    const ref = kebab(mode === 'dark' ? m.dark : m.light);       // e.g. "teal-600"
    if (!ref.startsWith(cfg.from + '-')) continue;               // only brand-family tokens
    const swapped = ref.replace(new RegExp('^' + cfg.from + '-'), cfg.to + '-');
    lines.push(`  --color-${kebab(name)}: var(--${swapped});`);
  }
  return lines.length ? `${selector} {\n${lines.join('\n')}\n}` : '';
}
const brandCss = [];
for (const [brandName, cfg] of Object.entries(brandThemes)) {
  brandCss.push(brandBlock(brandName, cfg, 'light', `:root[data-brand="${brandName}"], .brand-${brandName}`));
  brandCss.push(brandBlock(brandName, cfg, 'dark',
    `:root[data-brand="${brandName}"][data-theme="dark"], .brand-${brandName}.theme-dark`));
}
const brandSection = brandCss.filter(Boolean).join('\n\n');

// ---- 4. Typography (emitted directly) --------------------------------------
const typeStyles = Object.entries(src.text).map(([name, s]) => {
  const cls = kebab(name);
  const weight = WEIGHT[s.style] ?? 400;
  const ls = typeof s.letterSpacing === 'string' && s.letterSpacing.endsWith('%')
    ? `${(parseFloat(s.letterSpacing) / 100).toFixed(3)}em` : '0';
  const tc = s.case === 'UPPER' ? '\n  text-transform: uppercase;' : '';
  return { cls, name, family: s.family, weight, size: s.size, lh: s.lineHeight, ls, tc };
});
const typeCss = typeStyles.map((t) =>
  `.type-${t.cls} {\n  font-family: var(--font-${t.family === 'Inter' ? 'sans' : 'display'});` +
  `\n  font-weight: ${t.weight};\n  font-size: ${+(t.size / 16).toFixed(4)}rem;` +
  `\n  line-height: ${t.lh === 'AUTO' ? 'normal' : +(t.lh / t.size).toFixed(3)};\n  letter-spacing: ${t.ls};${t.tc}\n}`
).join('\n\n');

const fontVars = `:root {\n  --font-sans: 'Inter', system-ui, sans-serif;\n` +
  `  --font-display: 'Plus Jakarta Sans', var(--font-sans);\n}`;

const banner = `/* PM Design System tokens — GENERATED by scripts/build-tokens.mjs.\n` +
  `   Source: tokens/_source.json (Figma ${src._meta.source}). Do not edit by hand. */\n`;
writeFileSync(resolve(dist, 'tokens.css'),
  [banner, fontVars, lightWithShadow, darkWithShadow,
    brandSection ? '/* White-label brand themes */' : '', brandSection,
    '/* Type styles */', typeCss, ''].filter(Boolean).join('\n\n'));

// ---- 5. tokens.ts — typed constants + union types --------------------------
const q = (s) => `'${s}'`;
const tsColor = Object.keys(semantic).map((k) => `  '${k}': 'var(--color-${k})',`).join('\n');
const tsSpace = Object.entries(scale).map(([k, s]) =>
  `  '${k}': 'var(--${k})',`).join('\n');
const tsType = typeStyles.map((t) => `  '${t.cls}': 'type-${t.cls}',`).join('\n');
const ts =
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
`;
writeFileSync(resolve(dist, 'tokens.ts'), ts);

// ---- 6. tokens.json — flat resolved map (both modes) for docs --------------
const json = {
  _meta: { generated_from: 'tokens/_source.json', figma: src._meta.source, extracted_at: src._meta.extracted_at },
  primitives,
  semantic: Object.fromEntries(Object.entries(semantic).map(([k, v]) =>
    [k, { light: v.light, dark: v.dark, refLight: v.refLight, refDark: v.refDark }])),
  scale: Object.fromEntries(Object.entries(scale).map(([k, s]) => [k, s.value])),
  elevation: Object.fromEntries(Object.entries(elevation).map(([k, v]) => [k, { light: v.light, dark: v.dark }])),
  typography: Object.fromEntries(typeStyles.map((t) =>
    [t.cls, { family: t.family, weight: t.weight, size: t.size, lineHeight: t.lh }])),
};
writeFileSync(resolve(dist, 'tokens.json'), JSON.stringify(json, null, 2) + '\n');

console.log(`built dist/tokens.{css,ts,json} — ` +
  `${Object.keys(primitives).length} primitives, ${Object.keys(semantic).length} semantic, ` +
  `${Object.keys(scale).length} scale, ${typeStyles.length} type styles`);
