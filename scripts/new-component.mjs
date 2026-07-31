// Scaffolds a component that is born inside the gates: token-only CSS, typed props,
// a story with states + an edge case, and a test file. Adding the Nth component is a
// mechanical step, not a judgement call — that is what lets the roster scale.
//
//   npm run new:component -- Drawer
//   npm run new:component -- Drawer --el=section --variants=quiet,raised --sizes=sm,md
//   npm run new:component -- Popover --radix=@radix-ui/react-popover

import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const componentsDir = join(root, 'src', 'components');
const barrelPath = join(root, 'src', 'index.ts');

// ---------------------------------------------------------------- argv

const argv = process.argv.slice(2);
const name = argv.find((a) => !a.startsWith('--'));
const flag = (k, d = '') => {
  const hit = argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.slice(k.length + 3) : d;
};
const has = (k) => argv.includes(`--${k}`);

if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
  console.error('Usage: npm run new:component -- <PascalCaseName> [--el=div] [--variants=a,b] [--sizes=sm,md] [--radix=pkg] [--force]');
  process.exit(1);
}

const EL_TYPES = {
  div: ['HTMLDivElement', 'HTMLAttributes'],
  span: ['HTMLSpanElement', 'HTMLAttributes'],
  section: ['HTMLElement', 'HTMLAttributes'],
  nav: ['HTMLElement', 'HTMLAttributes'],
  ul: ['HTMLUListElement', 'HTMLAttributes'],
  li: ['HTMLLIElement', 'HTMLAttributes'],
  p: ['HTMLParagraphElement', 'HTMLAttributes'],
  button: ['HTMLButtonElement', 'ButtonHTMLAttributes'],
};

const el = flag('el', 'div');
if (!EL_TYPES[el]) {
  console.error(`Unknown --el=${el}. Pick one of: ${Object.keys(EL_TYPES).join(', ')}`);
  process.exit(1);
}
const [domType, attrType] = EL_TYPES[el];

const list = (k) => flag(k).split(',').map((s) => s.trim()).filter(Boolean);
const variants = list('variants');
const sizes = list('sizes');
const radix = flag('radix');

// ---------------------------------------------------------------- naming

const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const block = `pm-${kebab}`;
const cssFile = `${kebab}.css`;

const paths = {
  tsx: join(componentsDir, `${name}.tsx`),
  css: join(componentsDir, cssFile),
  stories: join(componentsDir, `${name}.stories.tsx`),
  test: join(componentsDir, `${name}.test.tsx`),
};

const clashes = Object.values(paths).filter(existsSync);
if (clashes.length && !has('force')) {
  console.error(`Refusing to overwrite:\n${clashes.map((p) => `  ${p.replace(root, '.')}`).join('\n')}\nPass --force if that is really what you want.`);
  process.exit(1);
}

// ---------------------------------------------------------------- templates

const cap = (s) => s[0].toUpperCase() + s.slice(1);

const typeLines = [];
if (variants.length) typeLines.push(`export type ${name}Variant = ${variants.map((v) => `'${v}'`).join(' | ')};`);
if (sizes.length) typeLines.push(`export type ${name}Size = ${sizes.map((v) => `'${v}'`).join(' | ')};`);

const propLines = [];
if (variants.length) propLines.push(`  /** visual role — see the variant blocks in ${cssFile} */\n  variant?: ${name}Variant;`);
if (sizes.length) propLines.push(`  size?: ${name}Size;`);
propLines.push('  children: ReactNode;');

const destructured = [
  ...(variants.length ? [`variant = '${variants[0]}'`] : []),
  ...(sizes.length ? [`size = '${sizes[sizes.length > 1 ? 1 : 0]}'`] : []),
  'className',
  'children',
  '...rest',
].join(', ');

const clsParts = [
  `'${block}'`,
  ...(variants.length ? [`\`${block}--\${variant}\``] : []),
  ...(sizes.length ? [`\`${block}--\${size}\``] : []),
  'className',
].join(', ');

const tsx = `import type { ReactNode, ${attrType} } from 'react';
import './${cssFile}';

${typeLines.length ? typeLines.join('\n') + '\n\n' : ''}export interface ${name}Props extends ${attrType}<${domType}> {
${propLines.join('\n')}
}

/** TODO: one line — what this component is for and which screen pattern it serves. */
export function ${name}({ ${destructured} }: ${name}Props) {
  const cls = [${clsParts}].filter(Boolean).join(' ');
  return (
    <${el} className={cls} {...rest}>
      {children}
    </${el}>
  );
}
`;

const variantCss = variants.length
  ? `\n/* Variants — each one earns its place; no variant without a job. */\n` +
    variants
      .map(
        (v) => `.${block}--${v} {\n  background-color: var(--color-surface-${v === variants[0] ? 'base' : 'raised'});\n  color: var(--color-text-primary);\n}`,
      )
      .join('\n')
  : '';

const sizeCss = sizes.length
  ? `\n\n/* Sizes — padding steps come off the scale, never off the eye. */\n` +
    sizes
      .map(
        (s, i) => `.${block}--${s} {\n  padding: var(--pad-${i === 0 ? 'control' : 'block'});\n}`,
      )
      .join('\n')
  : '';

const css = `/* ${name} — TODO: one line on the pattern this serves.
   Every value below is a token. Raw hex, px and primitive vars are blocked by the gate. */

.${block} {
  display: flex;
  align-items: center;
  gap: var(--gap-inline);
  padding: var(--pad-control);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.5;
  background-color: var(--color-surface-base);
  color: var(--color-text-primary);
}

.${block}:focus-visible {
  outline: none;
  box-shadow: 0 0 0 0.1875rem var(--color-focus-ring);
}
${variantCss}${sizeCss}
`;

const argTypeLines = [
  ...(variants.length
    ? [`    variant: { control: 'select', options: [${variants.map((v) => `'${v}'`).join(', ')}] },`]
    : []),
  ...(sizes.length
    ? [`    size: { control: 'inline-radio', options: [${sizes.map((v) => `'${v}'`).join(', ')}] },`]
    : []),
];

const variantsStory = variants.length
  ? `
export const Variants: Story = {
  render: () => (
    <div className="pm-row">
${variants.map((v) => `      <${name} variant="${v}">${cap(v)}</${name}>`).join('\n')}
    </div>
  ),
};
`
  : '';

const sizesStory = sizes.length
  ? `
export const Sizes: Story = {
  render: () => (
    <div className="pm-row">
${sizes.map((s) => `      <${name} size="${s}">${s.toUpperCase()}</${name}>`).join('\n')}
    </div>
  ),
};
`
  : '';

const stories = `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  parameters: {
    docs: { description: { component: 'TODO: one sentence — this lands in the autodocs page.' } },
  },
  args: { children: '${name}' },${argTypeLines.length ? `\n  argTypes: {\n${argTypeLines.join('\n')}\n  },` : ''}
};
export default meta;
type Story = StoryObj<typeof ${name}>;

export const Playground: Story = {};
${variantsStory}${sizesStory}
// Edge case — the layout has to survive real content, not just the happy label.
export const LongContent: Story = {
  args: { children: 'Sleeping players — reactivation campaign, 1,284 recipients' },
};
`;

const test = `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders its children', () => {
    render(<${name}>Sleeping players</${name}>);
    expect(screen.getByText('Sleeping players')).toBeInTheDocument();
  });

  it('keeps a caller className alongside the block class', () => {
    const { container } = render(<${name} className="custom">Open tables</${name}>);
    expect(container.firstElementChild).toHaveClass('${block}', 'custom');
  });

  // TODO: replace this with a behaviour test — keyboard, ARIA, state transitions.
  // Rendering is not coverage; the gate only means the file compiles.
});
`;

// ---------------------------------------------------------------- write

writeFileSync(paths.tsx, tsx);
writeFileSync(paths.css, css);
writeFileSync(paths.stories, stories);
writeFileSync(paths.test, test);

// Barrel — append in the same shape as the existing entries.
const exportedTypes = [`${name}Props`, ...(variants.length ? [`${name}Variant`] : []), ...(sizes.length ? [`${name}Size`] : [])];
const barrelEntry = `\nexport { ${name} } from './components/${name}';\nexport type { ${exportedTypes.join(', ')} } from './components/${name}';\n`;

const barrel = readFileSync(barrelPath, 'utf8');
if (!barrel.includes(`from './components/${name}'`)) {
  writeFileSync(barrelPath, barrel.replace(/\s*$/, '\n') + barrelEntry);
}

// ---------------------------------------------------------------- report

const rel = (p) => p.replace(root, '.').replace(/\\/g, '/');
console.log(`Scaffolded ${name}:`);
for (const p of Object.values(paths)) console.log(`  + ${rel(p)}`);
console.log(`  ~ ${rel(barrelPath)}`);
if (radix) {
  console.log(`\nHeadless behaviour requested: install and wrap it —`);
  console.log(`  npm i ${radix}`);
  console.log(`  then swap the <${el}> root for the primitive's parts, keeping the .${block} classes.`);
}
console.log(`\nNext: fill the three TODOs (component doc line, CSS pattern line, behaviour test), then`);
console.log(`  npm run verify && npm test`);
