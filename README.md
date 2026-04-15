# 🎡 Vibe Spin

> A game-show style decision wheel — customise, spin, and let fate decide.

Vibe Spin is an interactive, browser-based spinning wheel app built for fun and indecision. Create named wheel presets with fully customisable segments (label, weight, colour), spin with satisfying physics-based animation, share your wheel via URL, and track every result in the built-in spin history. The neon-cyberpunk aesthetic makes every spin feel like a TV game show moment.

---

## Features

- **Multiple named wheels** — create, rename, duplicate, and switch between as many wheels as you like
- **Customisable segments** — set each segment's label, colour, and probability weight; percentages sync automatically
- **Custom colour palettes** — save and apply your own palettes across wheels
- **Physics-based spin** — three-phase animation (ramp-up → coast → ramp-down) with configurable duration
- **Spin history** — every result is logged and viewable in the history drawer
- **Shareable URLs** — encode the entire wheel state in a query parameter and share a link
- **Audio & celebration effects** — ticker clicks and winner fanfare (toggle in Settings)
- **Keyboard shortcut** — press <kbd>Space</kbd> to spin without touching the mouse
- **Predefined templates** — load curated wheel presets (e.g. "Team Lunch", "Truth or Dare") in one click
- **Settings persistence** — all preferences are saved to `localStorage` automatically

---

## Tech Stack

| Layer           | Technology                   |
| --------------- | ---------------------------- |
| Framework       | React 19 + TypeScript        |
| Build tool      | Vite 7                       |
| Animations      | Framer Motion 12             |
| Icons           | Lucide React                 |
| Unit tests      | Vitest 4                     |
| E2E tests       | Playwright                   |
| Linter          | ESLint 9 + TypeScript ESLint |
| Formatter       | Prettier                     |
| Package manager | pnpm 10                      |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm install -g pnpm`)

### Installation

```bash
git clone https://github.com/treedy/vibe-spin.git
cd vibe-spin
pnpm install
```

---

## Development

Start the Vite dev server with hot-module replacement:

```bash
pnpm dev
```

The app is served at `http://localhost:5173` by default.

---

## Build

Compile TypeScript and produce an optimised production bundle:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

Output is written to `dist/`.

---

## Testing

### Unit tests (Vitest)

```bash
pnpm test:unit
```

Runs all Vitest tests in `src/` once (no watch mode).

### End-to-end tests (Playwright)

```bash
pnpm test:e2e
```

Runs the full Playwright suite from `tests/`.

### Visual regression tests (Playwright screenshots)

`tests/visual.spec.ts` captures baseline screenshots of four main UI states and
compares them on every subsequent run to catch visual regressions:

| Test                                  | Description                          |
| ------------------------------------- | ------------------------------------ |
| `idle wheel`                          | Full page – no spin performed yet    |
| `palettes panel open`                 | Palettes dropdown expanded           |
| `history drawer`                      | History side-drawer open             |
| `after spin – winner overlay visible` | Winner banner displayed after a spin |

Baseline PNG files are committed in
`tests/__screenshots__/visual.spec.ts-snapshots/` and are tagged with the
browser and OS (e.g. `idle-wheel-chromium-linux.png`).

#### Regenerating baselines

Run the following command whenever you make intentional UI changes and need to
update the stored reference images:

```bash
# Regenerate baselines for the default Chromium project
pnpm test:e2e --update-snapshots --project=chromium
```

> **Tip:** After updating baselines, review the diff in your PR to confirm only
> expected pixels changed, then commit the updated PNG files.

### Run all tests

```bash
pnpm test
```

Executes unit tests and e2e tests sequentially via `scripts/run-tests.js`.

---

## Linting

```bash
pnpm lint
```

Runs ESLint over `src/**/*.{ts,tsx}` with zero allowed warnings.

To auto-format all files with Prettier:

```bash
pnpm format
```

---

## Project Structure

```
vibe-spin/
├── docs/
│   └── plans/                  # Design documents and planning notes
│       └── 2026-02-19-vibe-spin-design.md
├── src/
│   ├── components/             # React UI components
│   │   ├── Wheel.tsx           # SVG spinning wheel
│   │   ├── SegmentTable.tsx    # Segment editor (label, weight, colour)
│   │   ├── PalettesPanel.tsx   # Colour palette management
│   │   ├── HistoryDrawer.tsx   # Spin history drawer
│   │   ├── WheelsDrawer.tsx    # Wheel management drawer
│   │   ├── TemplatesModal.tsx  # Predefined wheel templates
│   │   ├── SettingsModal.tsx   # App settings (audio, spin duration)
│   │   └── Modal.tsx           # Base modal wrapper
│   ├── data/
│   │   ├── palettes.ts         # Built-in colour palettes
│   │   └── templates.ts        # Built-in wheel templates
│   ├── hooks/
│   │   ├── useWheels.ts        # Wheel CRUD and active-wheel state
│   │   ├── useSegments.ts      # Per-segment state helpers
│   │   ├── useSpinHistory.ts   # Spin result tracking
│   │   ├── usePalettes.ts      # Palette state and persistence
│   │   └── useAudio.ts         # Sound effects and audio settings
│   ├── utils/                  # Pure utility functions
│   ├── App.tsx                 # Root component and orchestration
│   └── styles.css              # Global CSS (neon-cyberpunk theme)
├── tests/                      # Playwright e2e test specs
│   ├── vibe-spin.spec.ts       # General e2e tests
│   ├── visual.spec.ts          # Visual regression screenshot tests
│   └── __screenshots__/        # Committed baseline PNG files
├── index.html                  # Vite HTML entry point
├── vite.config.ts
├── playwright.config.ts
└── package.json
```

---

## Contributing

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feat/my-new-feature
   ```
2. Make your changes and ensure all tests pass:
   ```bash
   pnpm test
   ```
3. Run the linter with zero warnings:
   ```bash
   pnpm lint
   ```
4. Open a **Pull Request** against `main` with a clear description of the change.

Please keep PRs focused — one feature or fix per PR makes review faster and merges cleaner.

---

## License

This project is licensed under the **ISC License**.
