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
