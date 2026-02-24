import React from 'react';
import type { Segment } from '../hooks/useSegments';

export function SegmentTable({ segments, onUpdateWeight, onUpdateLabel, onUpdateColor }: { 
  segments: Segment[], 
  onUpdateWeight: (i: number, w: number) => void,
  onUpdateLabel: (i: number, l: string) => void,
  onUpdateColor: (i: number, c: string) => void
}) {
  return (
    <div className="table-container">
      {segments.map((s, i) => (
        <div key={s.id} className="row">
          <input 
            type="color" 
            value={s.color} 
            onChange={(e) => onUpdateColor(i, e.target.value)} 
          />
          <input 
            type="text" 
            value={s.label} 
            onChange={(e) => onUpdateLabel(i, e.target.value)} 
          />
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
