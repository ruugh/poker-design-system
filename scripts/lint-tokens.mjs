// Hardcode metric for the case narrative: counts raw literals in the component layer.
// stylelint is the CI gate (pass/fail); this prints the number behind "% hardcode -> 0".

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = resolve(root, 'src');

function walk(dir) {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.css') ? [p] : [];
  });
}

const CHECKS = [
  { label: 'raw hex colours', re: /#[0-9a-f]{3,8}\b/gi },
  { label: 'rgb()/hsl() literals', re: /\b(rgb|rgba|hsl|hsla)\(/gi },
  { label: 'raw px in spacing', re: /\b(padding|margin|gap|border-radius|inset)[^;{]*:[^;{]*\b\d+px\b/gi },
  { label: 'primitive vars in components', re: /var\(--(slate|teal|jade|rose|amber|violet|azure)-/gi },
];

let total = 0, decls = 0;
const files = walk(srcDir);
for (const f of files) {
  const css = readFileSync(f, 'utf8');
  decls += (css.match(/[^{};]+:[^{};]+;/g) || []).length;
  for (const c of CHECKS) {
    const n = (css.match(c.re) || []).length;
    if (n) { total += n; console.log(`  ${n}  ${c.label}  (${f.replace(root, '.')})`); }
  }
}

const pct = decls ? ((total / decls) * 100).toFixed(1) : '0.0';
console.log(`\n${files.length} component file(s), ${decls} declarations, ${total} hardcoded literals — ${pct}% hardcode`);
if (total > 0) process.exit(1);
