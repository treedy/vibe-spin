# Vibe Spin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a playful, interactive spinning wheel web app with real-time segment customization (label, color, weight, percentage).

**Architecture:** A React-based single-page application where a central state (`segments`) drives both a dynamic customization table and an SVG-based wheel. Framer Motion handles the physics and rotation of the wheel.

**Tech Stack:** React, TypeScript, Framer Motion, Vanilla CSS.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/index.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

**Step 1: Initialize the project**
Run: `npm init -y`
Expected: `package.json` created.

**Step 2: Install dependencies**
Run: `npm install react react-dom framer-motion lucide-react`
Run: `npm install -D typescript @types/react @types/react-dom vitest @vitejs/plugin-react vite`
Expected: `node_modules` populated.

**Step 3: Setup Vite and TypeScript**
Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**Step 4: Create entry point and basic App**
Write `src/App.tsx`:
```tsx
import React from 'react';
import './styles.css';

export default function App() {
  return <div className="app"><h1>Vibe Spin</h1></div>;
}
```

**Step 5: Commit**
Run: `git add . && git commit -m "chore: initial scaffold with react and vite"`

---

### Task 2: Segment State & Logic

**Files:**
- Create: `src/hooks/useSegments.ts`
- Create: `src/hooks/useSegments.test.ts`

**Step 1: Write failing test for weight-to-percentage sync**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useSegments } from './useSegments';

test('recalculates percentages when weight changes', () => {
  const { result } = renderHook(() => useSegments());
  act(() => {
    result.current.updateWeight(0, 2); // Change first segment weight to 2
  });
  // Total weight 2+1=3. First segment should be 66.6%
  expect(result.current.segments[0].percentage).toBeCloseTo(66.66, 1);
});
```

**Step 2: Implement `useSegments` hook**
```typescript
import { useState, useMemo } from 'react';

export interface Segment {
  id: string;
  label: string;
  weight: number;
  percentage: number;
  color: string;
}

export function useSegments() {
  const [segments, setSegments] = useState<Segment[]>([
    { id: '1', label: 'Option 1', weight: 1, percentage: 50, color: '#FF5733' },
    { id: '2', label: 'Option 2', weight: 1, percentage: 50, color: '#33FF57' },
  ]);

  const totalWeight = useMemo(() => segments.reduce((sum, s) => sum + s.weight, 0), [segments]);

  const updateWeight = (index: number, weight: number) => {
    const newSegments = [...segments];
    newSegments[index].weight = weight;
    // Recalculate all percentages
    const newTotal = newSegments.reduce((sum, s) => sum + s.weight, 0);
    newSegments.forEach(s => s.percentage = (s.weight / newTotal) * 100);
    setSegments(newSegments);
  };

  return { segments, updateWeight, setSegments };
}
```

**Step 3: Run tests and commit**
Run: `npx vitest run`
Run: `git add src/hooks && git commit -m "feat: add useSegments hook with weight logic"`

---

### Task 3: Dynamic Table Component

**Files:**
- Create: `src/components/SegmentTable.tsx`
- Modify: `src/App.tsx`

**Step 1: Implement the Table UI**
```tsx
import React from 'react';
import { Segment } from '../hooks/useSegments';

export function SegmentTable({ segments, onUpdateWeight }: { 
  segments: Segment[], 
  onUpdateWeight: (i: number, w: number) => void 
}) {
  return (
    <div className="table-container">
      {segments.map((s, i) => (
        <div key={s.id} className="row">
          <input type="color" value={s.color} readOnly />
          <input type="text" value={s.label} readOnly />
          <input 
            type="number" 
            value={s.weight} 
            onChange={(e) => onUpdateWeight(i, Number(e.target.value))} 
          />
          <span>{s.percentage.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Commit**
Run: `git add src/components/SegmentTable.tsx && git commit -m "feat: add segment table component"`

---

### Task 4: The SVG Wheel Component

**Files:**
- Create: `src/components/Wheel.tsx`

**Step 1: Implement SVG-based Wheel**
Use polar coordinates to calculate `path` data for each slice based on segment percentage.

**Step 2: Add Framer Motion rotation**
```tsx
import { motion } from 'framer-motion';
// ... path logic ...
<motion.svg animate={{ rotate: currentRotation }} transition={{ type: 'spring', damping: 20 }}>
  {/* Slices */}
</motion.svg>
```

**Step 3: Commit**
Run: `git add src/components/Wheel.tsx && git commit -m "feat: add animated svg wheel"`

---

### Task 5: Final Assembly & "Game-Show" Styling

**Files:**
- Modify: `src/styles.css`
- Modify: `src/App.tsx`

**Step 1: Add vibrant CSS**
Focus on:
- Gradients for the wheel.
- Bold, centered "SPIN" button.
- Sidebar vs. Main Stage layout.

**Step 2: Add Spin Logic to App.tsx**
```typescript
const spin = () => {
  const winnerIndex = Math.floor(Math.random() * segments.length);
  const extraSpins = 5 * 360;
  const winnerAngle = calculateAngle(winnerIndex);
  setRotation(prev => prev + extraSpins + winnerAngle);
};
```

**Step 3: Final check and commit**
Run: `npm run build`
Run: `git add . && git commit -m "feat: final assembly and styling"`
