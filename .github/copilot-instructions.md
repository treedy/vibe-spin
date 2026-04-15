# Copilot Instructions for vibe-spin

## Project Overview

**vibe-spin** is a game-show style spinning wheel web app with a neon-cyberpunk aesthetic. Users create and manage multiple named wheels, each with customizable segments, colors, and weights. Key features: physics-based spin animation, spin history tracking, shareable URLs, audio/celebration effects, and localStorage persistence.

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5 (strict mode) |
| Framework | React 19 |
| Build tool | Vite 7 |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Unit tests | Vitest 4 + jsdom + @testing-library/react |
| E2E tests | Playwright |
| Linter | ESLint 9 + @typescript-eslint |
| Formatter | Prettier 3 |
| Git hooks | Husky + lint-staged |
| Package manager | **pnpm** (always use `pnpm`, never `npm`) |

## Commands

```bash
pnpm dev            # start Vite dev server (localhost:5173)
pnpm build          # tsc type-check + Vite production build → dist/
pnpm lint           # ESLint with zero-warnings policy
pnpm format         # Prettier auto-format
pnpm test:unit      # Vitest (single run, no watch)
pnpm test:e2e       # Playwright tests
pnpm test           # unit + e2e sequentially
```

Always run `pnpm build` after changes to catch TypeScript errors. Run `pnpm lint` before committing.

## Code Style & Conventions

- **Prettier**: single quotes, semicolons, ES5 trailing commas
- **TypeScript**: full strict mode including `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`; prefix intentionally unused variables with `_`
- **CSS**: Vanilla CSS only — no Tailwind, no CSS-in-JS, no CSS frameworks
- **Animations**: use Framer Motion's `animate` API for all motion
- **React**: React 19 patterns — use `useTransition` for non-urgent state, lazy-load heavy modals via `React.lazy`/`Suspense`
- **Hooks rules**: `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps` are both errors

## Architecture & Key Patterns

### Directory layout
```
src/
  components/   # React components (.tsx), co-located unit tests (.test.tsx)
  hooks/        # Custom React hooks, co-located unit tests (.test.ts)
  utils/        # Pure utility functions, co-located unit tests (.test.ts)
  data/         # Static data (palettes, templates)
  App.tsx        # Root component — wires all hooks and lazy modals
  styles.css     # Global neon theme
tests/            # Playwright E2E specs
```

### State management
All state lives in custom hooks. There is no external state library.
- `useWheels` — wheel CRUD, segment editing, localStorage persistence (`vibe-spin:wheels`, `vibe-spin:activeWheelId`)
- `useSpinHistory` — spin result history
- `usePalettes` — color palette management
- `useAudio` — sound effects; settings stored in `vibe-spin:settings`
- `useCelebration` — celebration overlay state

### LocalStorage keys
All keys are namespaced under `vibe-spin:` (e.g. `vibe-spin:wheels`, `vibe-spin:activeWheelId`, `vibe-spin:settings`).

### Segment data model
```ts
{ id: string; label: string; weight: number; percentage: number; color: string }
```
Weights and percentages are kept in sync via `recalcPercentages()`.

### Wheel limits
`MAX_WHEELS = 50`; persistence is debounced at 500 ms.

### Shareable URLs
Wheel state is encoded in query params via `src/utils/permalink.ts`.

## Testing Conventions

- **Unit tests**: co-located with source files (`*.test.ts` / `*.test.tsx`), run with Vitest in jsdom
- **E2E tests**: live in `tests/` and run with Playwright
- Test setup file: `src/test-setup.ts`
- Vitest excludes `tests/**` (Playwright only)
- Always write unit tests for new hooks and utility functions following the existing co-location pattern

## CI Workflows

- **lint.yml** — runs `pnpm lint` on push/PR to main/master
- **playwright.yml** — runs Playwright E2E on push/PR; uploads `playwright-report` artifact

## Important Notes

- The `dist/` directory is the production build output — do not hand-edit it
- Never commit secrets or sensitive data
- Use `pnpm` exclusively; no `npm` or `yarn` commands
- ESLint enforces **zero warnings** — fix all lint issues before committing
