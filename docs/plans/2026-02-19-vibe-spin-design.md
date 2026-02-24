# Vibe Spin - Game-Show Style Decision Wheel

A playful, interactive web app that lets users create, customize, and spin a wheel to randomly select a segment.

## 1. Project Overview
- **Core Concept:** A game-show style spinning wheel with real-time customization.
- **Key Features:**
  - Interactive wheel with bouncy physics.
  - Dynamic table syncing "Weight" and "Percentage" for each segment.
  - Predefined wheel presets (e.g., "Team Lunch", "Truth or Dare").
  - Simple, vibrant aesthetics with a focus on responsiveness.

## 2. Technical Stack
- **Framework:** React (TypeScript) for component-based UI and state synchronization.
- **Styling:** Vanilla CSS for custom, high-fidelity "game-show" look.
- **Animations:** Framer Motion for wheel rotation, deceleration, and physics.
- **State Management:** React `useState` and `useMemo` for weight-to-percentage calculations.

## 3. Component Architecture
### Sidebar (Control Panel)
- **Preset Selector:** Dropdown to load pre-defined segment lists.
- **Segment Table:**
  - `Color Picker`: Small circular swatch.
  - `Label`: Text input for segment name.
  - `Weight`: Numeric input (probability weight).
  - `Percentage`: Read-only/Editable numeric input (share of 100%).
- **Add/Remove Segment:** Buttons to manage the list size.

### Main Stage (Wheel Display)
- **The Wheel (SVG):**
  - Dynamically generated paths based on segment weights.
  - Centered rotation point.
- **The Ticker (Pointer):** A fixed triangular indicator at the top of the wheel.
- **The "SPIN" Button:** A large, prominent button located below the wheel.
- **Result Banner:** A simple, high-contrast overlay displaying the winner name.

## 4. Key Logic & Data Flow
- **Single Source of Truth:** `segments: Array<{ id: string, label: string, weight: number, color: string }>`
- **Synchronization Logic:**
  - `Total Weight = Sum(all weights)`
  - `Percentage = (Segment Weight / Total Weight) * 100`
  - Updating a weight triggers a recalculation of all percentages.
  - Updating a percentage updates that segment's weight relative to the sum of all other weights.
- **Spin Physics:**
  - Randomly select winner angle before starting rotation.
  - Spin at least 5 full rotations (1800°) + winner offset.
  - Use `ease-out` transition or Framer Motion's `inertia` for a natural stop.
  - A "click" sound effect triggers when the ticker crosses a segment boundary (rotation % (360/N) === 0).

## 5. UI/UX Style
- **Aesthetic:** High-contrast colors, bold typography (Sans-serif), and playful gradients.
- **Animations:** Bouncy entrances for the Result Banner and smooth transitions for table updates.
- **Responsiveness:** Two-column layout on desktop; single-column (Controls above Wheel) on mobile.

## 6. Testing Strategy
- **Unit Tests:** Verify weight-to-percentage calculation logic.
- **Component Tests:** Ensure adding/removing segments updates the SVG wheel correctly.
- **Integration Tests:** Confirm the "SPIN" button triggers the rotation and eventually displays a winner.
