# Vibe Spin - Agent Guide

Welcome to the **Vibe Spin** project. This document provides essential context for AI agents (Gemini, Codex, Claude, etc.) to understand the codebase, architecture, and development standards.

## 1. Project Overview
**Vibe Spin** is a playful, interactive game-show style decision wheel. Users can create, customize, and spin a wheel to randomly select a segment.

- **Core Concept:** Real-time synchronization between a customization table (weights/percentages) and a dynamic SVG wheel.
- **Primary Goal:** High-fidelity animations, responsive design, and intuitive UX.

## 2. Tech Stack
- **Framework:** React 19 (TypeScript)
- **Bundler:** Vite 7
- **Styling:** Vanilla CSS (Preference for custom, high-fidelity "game-show" looks over utility frameworks like Tailwind).
- **Animations:** Framer Motion 12 (Used for wheel rotation, deceleration, and UI transitions).
- **Icons:** Lucide React
- **Testing:** Vitest + React Testing Library + JSDOM

## 3. Core Architecture
The application follows a single-source-of-truth pattern:
- **State Management:** A custom hook `useSegments` manages the `segments` array.
- **Synchronization Logic:**
  - `Weight` is the input; `Percentage` is derived.
  - Updating a segment's weight triggers a recalculation of all percentages to ensure they sum to 100%.
- **Component Breakdown:**
  - `App.tsx`: Main layout and spin logic.
  - `Wheel.tsx`: SVG-based wheel that generates paths dynamically based on segment weights. Uses Framer Motion for physics-based spinning.
  - `SegmentTable.tsx`: UI for managing segment labels, colors, and weights.

## 4. Key Logic & Math
- **SVG Paths:** Segments are drawn as SVG `<path>` elements using polar-to-cartesian coordinate conversion.
- **Spin Physics:** The wheel uses Framer Motion's `animate` with a randomized destination angle (including multiple full rotations) and a smooth `easeOut` or `spring` transition.
- **Weight Sync:** `Percentage = (Segment Weight / Total Weight) * 100`.

## 5. Directory Structure
- `src/components/`: UI components (Wheel, SegmentTable).
- `src/hooks/`: Business logic and state (useSegments).
- `src/styles.css`: All global and component styles.
- `docs/plans/`: Contains detailed design and implementation plans (Precedence: READ THESE FIRST for feature implementation).

## 6. Development Workflow
- **Dev Server:** `npm run dev` (Runs `vite`)
- **Build:** `npm run build` (Runs `tsc && vite build`)
- **Test:** `npm test` (Runs `vitest`)
- **Preview:** `npm run preview` (Runs `vite preview`)
- **Linting:** Standard TypeScript/React patterns.

## 7. Agent Rules & Conventions
- **Styling:** Use **Vanilla CSS** in `src/styles.css`. Do not add Tailwind or other CSS frameworks unless explicitly requested.
- **Types:** Ensure strict TypeScript typing for all components and hooks.
- **Testing:** Always add or update tests in `src/hooks/*.test.ts` or `src/components/*.test.tsx` when modifying logic.
- **Documentation:** Maintain the plans in `docs/plans/` if significant architectural changes are made.
- **React Code:** When adding or changing React code, the `vercel-react-best-practices` Skill must be used.

## 8. Frontend Design
- **Always invoke the `frontend-design` skill** before writing any frontend code. No exceptions.

### Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

### Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server if needed. It serves at `http://localhost:5173/`
- If the server is already running, do not start a second instance.

### Screenshot Workflow
- **Always screenshot from localhost:** Use the `playwright-cli` skill to take screenshots and save them in the `temp_screenshots` directory.
- After screenshotting, read the PNG from `temp_screenshots/` with the Read tool.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

### Output Defaults
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

### Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

### Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
