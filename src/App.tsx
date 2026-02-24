import React from 'react';
import './styles.css';
import { useSegments } from './hooks/useSegments';
import { SegmentTable } from './components/SegmentTable';

export default function App() {
  const { segments, updateWeight } = useSegments();

  return (
    <div className="app">
      <header>
        <h1>Vibe Spin</h1>
      </header>
      <main>
        <div className="controls">
          <SegmentTable segments={segments} onUpdateWeight={updateWeight} />
        </div>
        <div className="wheel-container">
          {/* Wheel will be added in Task 4 */}
          <div className="wheel-placeholder">Wheel Placeholder</div>
        </div>
      </main>
    </div>
  );
}
