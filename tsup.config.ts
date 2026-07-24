import { defineConfig } from 'tsup';

// Bundles the component library for distribution:
//   lib/index.{mjs,js,d.ts} — components + types (ESM + CJS)
//   lib/index.css           — every component's styles, bundled
//   lib/tokens.{mjs,js,d.ts} — the typed token constants
// react, react-dom and the Radix primitives stay external (peer/deps), so a
// consumer's copies are reused rather than duplicated.
export default defineConfig({
  entry: { index: 'src/index.ts', tokens: 'dist/tokens.ts' },
  format: ['esm', 'cjs'],
  outDir: 'lib',
  dts: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
});
