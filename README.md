# Poker Manager — Design System

Single source of truth for the Poker Manager CRM. Design tokens defined once in
Figma reach production code automatically — no hand-copying hex values, no drift
between what the designer sees and what ships.

> Companion to the **[design-docs AI pipeline](../design-docs)** case: that project
> keeps documentation in sync with Figma; this one keeps *code* in sync. Two halves
> of the same delivery chain.

## The chain

```
Figma Variables ─▶ Tokens Studio ─▶ tokens/*.json ─▶ Style Dictionary v5 ─▶ dist/tokens.{css,ts,json}
   (3 collections)   (GitHub sync)    (DTCG set, in git)  + @tokens-studio/sd-transforms   │
                                                                                            ▼
                                                          React components ─▶ Storybook ─▶ Chromatic
                                                                 ▲
                                                     stylelint gate: 0 literals
```

The source of truth is a **W3C DTCG token set** in Tokens Studio format (`tokens/`):
per-set files (`primitives`, `scale`, `semantic-light/dark`, `typography`, brand sets),
plus `$themes.json` (Colour scheme × Brand) and `$metadata.json`. That is exactly the
shape the Tokens Studio Figma plugin reads and writes over its GitHub sync — so a
designer editing a variable and pushing lands here with **no format translation**.

A colour change in Figma is one sync + one PR. It lands in the CSS variables, the
typed TS constants, the docs JSON, every component, and the deployed Storybook —
together, or not at all.

## Token architecture — three layers

| Layer | Where | Modes | Used by |
|---|---|---|---|
| **Primitive** | `slate-600`, `teal-600`, `plum-600` | one | nobody directly — hidden from the Figma picker, forbidden in component CSS |
| **Semantic** | `color-surface-page`, `color-text-primary` | **light / dark** × **brand** | components and layouts |
| **Scale** | `space-16`, `radius-lg`, `pad-card` | one | spacing, radii |

### White-label: a brand axis on top of light/dark

`[data-brand="plum"]` re-points every semantic token that resolves to the `teal`
ramp onto another ramp (`plum`), keeping the step number — while neutrals and status
colours never move. So a whole second brand identity (a different club's colours,
down to the dark sidebar tint) is **one attribute, zero component changes**, and it
composes with light/dark into four rendered themes. A red danger badge stays red
under any brand; only the brand-tinted surfaces swap. Add a brand by dropping a ramp
into `tokens/_source.json` and naming it in `brandThemes` — the override blocks are
generated automatically.

**Why modes live on the semantic layer, not the primitives.** A primitive is a fixed
fact: `teal-600` is always `#00809C`, every theme, every platform. Themes are a
*semantic* decision ("what is a raised surface here"), so a third mode —
high-contrast, or a white-label club skin — is added without touching a single
primitive. See [`tokens-spec.md`](tokens-spec.md) for the full rationale and the
OKLCH ramp construction.

**Light and dark carry elevation differently.** In light, `surface/quiet` and
`surface/raised` share a colour (both white) and separate by shadow — you can't go
brighter than white. In dark, shadows don't read, so elevation is carried by
*lightness*: `slate-950 → slate-900`. Same token, different mechanics — exactly what
the semantic layer exists to express.

## Build

```bash
npm install
npm run build:tokens     # tokens/_source.json -> dist/tokens.{css,ts,json}
npm run lint:css         # stylelint gate: fails on any raw hex / px / primitive var
npm run lint:tokens      # prints the hardcode metric (currently 0.0%)
```

### Three targets, one source

- **`dist/tokens.css`** — `:root` holds primitives + scale + light semantic; a
  `[data-theme="dark"]` block re-points *only* the semantic vars. Runtime theming
  is a single attribute flip; primitives never move.
- **`dist/tokens.ts`** — typed constants plus `ColorToken` / `SpaceToken` /
  `TypographyToken` union types. A token name that doesn't exist fails to compile,
  so a typo can't reach production as a silent `undefined`.
- **`dist/tokens.json`** — flat resolved map (both modes) that feeds the docs and
  the Storybook token reference.

## The zero-hardcode gate

The metric "% hardcode → 0" isn't a claim, it's an enforced rule. `.stylelintrc.json`
rejects, in the component layer:

- raw hex colours (`color-no-hex`)
- `rgb()` / `hsl()` literals on colour properties
- raw `px` / `rem` on `padding` / `margin` / `gap` / `border-radius` / `inset`
- **primitive variables** (`var(--slate-600)`) — components speak semantic tokens only

`npm run lint:tokens` counts every literal and exits non-zero if any remain — the
number the case reports. CI runs both on every PR (Ф6).

## Install & use

Published to GitHub Packages as `@ruugh/poker-design-system` (versioned with
Changesets; a merge to `main` cuts the release).

```bash
npm install @ruugh/poker-design-system
```

```tsx
import '@ruugh/poker-design-system/tokens.css'; // the CSS variables (themes)
import '@ruugh/poker-design-system/styles.css';  // component styles
import { Button, Modal } from '@ruugh/poker-design-system';
import { color } from '@ruugh/poker-design-system/tokens'; // typed token constants

<html data-theme="dark" data-brand="plum">
  <Button variant="primary">Add transaction</Button>
```

`react` and `react-dom` are peers; the Radix primitives ship as dependencies. The
bundle is ESM + CJS with type definitions, built by tsup — react and Radix stay
external so a consumer's copies are reused.

## CI

Two workflows run on every push and PR (`.github/workflows/`):

**`ci.yml`** — the correctness gate:
1. `build:tokens` rebuilds `dist/` from `tokens/_source.json`, then **fails if `dist/`
   drifted**. This is what makes the source file authoritative — a hand-edited or stale
   `dist/` can't merge.
2. `lint:css` + `lint:tokens` — the zero-hardcode gate.
3. `typecheck` — `tsc --noEmit`.
4. `build-storybook` — the deployable bundle compiles.

**`chromatic.yml`** — visual regression. Every PR gets a diff of all five components in
both themes; TurboSnap re-snapshots only what changed.

### Wiring Chromatic (one-time)

1. Link this repo at [chromatic.com](https://www.chromatic.com) → copy the project token.
2. GitHub repo → Settings → Secrets and variables → Actions → new secret
   `CHROMATIC_PROJECT_TOKEN`.

Until the secret exists the Chromatic job no-ops on forks and skips gracefully; `ci.yml`
stays green regardless. Run it locally any time with `npm run chromatic` (needs the token
in the environment).

## Status

- ✅ Ф1 — token architecture, OKLCH ramps, WCAG audit (0 fails, both themes)
- ✅ Ф2 — three collections live in Figma, type scale 17 → 12, screens migrated
- ✅ Ф3 — Style Dictionary build, three targets, zero-hardcode gate
- ✅ Ф4 — components (Button, Input, Card, Badge, Modal) with states
- ✅ Ф5 — Storybook with a11y + light/dark + brand toggle + token reference (`npm run storybook`, port 6107)
- ✅ Ф6 — GitHub Actions: build + drift gate + lint + typecheck + Storybook; Chromatic visual diff
- ✅ Ф7 — the loop, run live: token change in Figma → PR #1 → Chromatic visual diff gate
- ✅ Expansion — 12 components (Button, Input, Select, Checkbox, Switch, Card, Badge, Avatar, Tabs, Tooltip, Table, Modal) + white-label brand axis

## Components

Twelve components, each styled through semantic tokens only, with states and real
product content. Highlights:

- **Table** — compound (`Table.Head/Body/Row/Header/Cell`), sortable headers,
  selected/hover rows, tabular numerics, sign-coloured amounts.
- **Button** — four variants × two sizes, `loading`, icon slots.
- **Tabs** — arrow-key roving focus, full ARIA tab/tabpanel wiring.
- **Modal** — focus trap, Esc, `aria-modal`, scrim, portal.
- **Input / Select** — label, hint, error state, `aria-describedby`/`aria-invalid`.

## Storybook

```bash
npm run storybook        # dev, http://localhost:6107
npm run build-storybook  # static build for deploy
```

Every component ships stories for each state plus edge cases (long labels, error
fields, empty). The theme toggle in the toolbar flips `data-theme` — the same
mechanism production uses. **Foundations/Tokens** reads `dist/tokens.json` directly,
so the token reference can't drift from what the components consume. The a11y addon
runs axe on every story.

## Design/code parity gate

Tokens flow Figma → code and CI refuses to let `dist/` drift from `tokens/`. The component
roster needs the same protection, or the Figma library and the React package quietly become
two implementations that a human is expected to keep in step.

`npm run lint:parity` compares a committed snapshot of the Figma components
(`figma/components.json`) against what `src/index.ts` actually exports, reading the prop
types through the TypeScript compiler rather than by pattern-matching source. It reports:

- a component that exists on one side only;
- a Figma property with no matching prop (and the reverse);
- a variant whose options have diverged from the prop's string-literal union;
- a property whose type no longer matches (`BOOLEAN` vs a union, and so on).

**Accepted gaps are a ratchet.** `figma/parity.config.json` lists the gaps that are known
and tolerated. An unlisted gap fails the build. A *listed* gap that has since been closed
also fails, so the list can only ever shrink — the count is a debt number, not a mute
button.

### What it does and does not prove

The Figma side is a snapshot extracted through the plugin channel
(`figma/extract-components.js`), because neither Variables nor component metadata are
available over REST on this plan, and Code Connect — the supported way to bind Figma
components to code — needs an Organization or Enterprise plan. So the gate enforces *the
committed design contract matches the code*; re-running the extractor is the deliberate act
that surfaces a design-side change. It cannot see an unexported Figma edit, and does not
claim to.

### Current state

The Figma file contains **zero** components — the design-system board and every screen are
built from plain frames, so a designer can copy pixels out of the system but cannot assemble
a screen from it. All 20 shipped components are therefore listed as accepted gaps. Closing
them means building real component sets whose variant properties match the prop unions in
the code, and deleting a line from the config each time one lands.
