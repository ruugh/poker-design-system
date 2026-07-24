# Poker Manager — Design System

Single source of truth for the Poker Manager CRM. Design tokens defined once in
Figma reach production code automatically — no hand-copying hex values, no drift
between what the designer sees and what ships.

> Companion to the **[design-docs AI pipeline](../design-docs)** case: that project
> keeps documentation in sync with Figma; this one keeps *code* in sync. Two halves
> of the same delivery chain.

## The chain

```
Figma Variables ──▶ tokens/_source.json ──▶ Style Dictionary ──▶ dist/tokens.{css,ts,json}
   (3 collections)     (export, in git)        (build)              │
                                                                    ▼
                                              React components ──▶ Storybook ──▶ Chromatic
                                                     ▲
                                          stylelint gate: 0 literals
```

A colour change in Figma is one export + one PR. It lands in the CSS variables, the
typed TS constants, the docs JSON, every component, and the deployed Storybook —
together, or not at all.

## Token architecture — three layers

| Layer | Where | Modes | Used by |
|---|---|---|---|
| **Primitive** | `slate-600`, `teal-600` | one | nobody directly — hidden from the Figma picker, forbidden in component CSS |
| **Semantic** | `color-surface-page`, `color-text-primary` | **light / dark** | components and layouts |
| **Scale** | `space-16`, `radius-lg`, `pad-card` | one | spacing, radii |

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

## Status

- ✅ Ф1 — token architecture, OKLCH ramps, WCAG audit (0 fails, both themes)
- ✅ Ф2 — three collections live in Figma, type scale 17 → 12, screens migrated
- ✅ Ф3 — Style Dictionary build, three targets, zero-hardcode gate
- ⬜ Ф4 — components (Button, Input, Card, Badge, Modal) with states
- ⬜ Ф5 — Storybook + deploy
- ⬜ Ф6 — GitHub Actions + Chromatic
- ⬜ Ф7 — the loop: token change in Figma → PR → visual diff → deploy
