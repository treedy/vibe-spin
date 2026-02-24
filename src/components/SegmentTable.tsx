import React from 'react';
import type { Segment } from '../hooks/useSegments';
import { Trash2, Plus } from 'lucide-react';

export function SegmentTable({ segments, onUpdateWeight, onUpdateLabel, onUpdateColor, onAddSegment, onRemoveSegment }: { 
  segments: Segment[], 
  onUpdateWeight: (i: number, w: number) => void,
  onUpdateLabel: (i: number, l: string) => void,
  onUpdateColor: (i: number, c: string) => void,
  onAddSegment: () => void,
  onRemoveSegment: (i: number) => void
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
          <button 
            className="remove-btn" 
            onClick={() => onRemoveSegment(i)} 
            disabled={segments.length <= 2}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button className="add-btn" onClick={onAddSegment}>
        <Plus size={16} /> Add Option
      </button>
    </div>
  );
}
