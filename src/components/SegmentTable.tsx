import React from 'react';
import type { Segment } from '../hooks/useSegments';
import { Trash2, Plus } from 'lucide-react';

interface SegmentRowProps {
  segment: Segment;
  index: number;
  onUpdateWeight: (i: number, w: number) => void;
  onUpdateLabel: (i: number, l: string) => void;
  onUpdateColor: (i: number, c: string) => void;
  onRemoveSegment: (i: number) => void;
  canRemove: boolean;
}

const SegmentRow: React.FC<SegmentRowProps> = React.memo(({ 
  segment, 
  index, 
  onUpdateWeight, 
  onUpdateLabel, 
  onUpdateColor, 
  onRemoveSegment,
  canRemove 
}) => {
  return (
    <div className="row">
      <input 
        type="color" 
        value={segment.color} 
        onChange={(e) => onUpdateColor(index, e.target.value)} 
      />
      <input 
        type="text" 
        value={segment.label} 
        onChange={(e) => onUpdateLabel(index, e.target.value)} 
      />
      <input 
        type="number" 
        value={segment.weight} 
        onChange={(e) => onUpdateWeight(index, Number(e.target.value))} 
      />
      <button 
        className="remove-btn" 
        onClick={() => onRemoveSegment(index)} 
        disabled={!canRemove}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
});

SegmentRow.displayName = 'SegmentRow';

export const SegmentTable: React.FC<{
  segments: Segment[],
  onUpdateWeight: (i: number, w: number) => void,
  onUpdateLabel: (i: number, l: string) => void,
  onUpdateColor: (i: number, c: string) => void,
  onAddSegment: () => void,
  onRemoveSegment: (i: number) => void
}> = ({ segments, onUpdateWeight, onUpdateLabel, onUpdateColor, onAddSegment, onRemoveSegment }) => {
  const canRemove = segments.length > 2;

  return (
    <div className="table-container">
      {segments.map((s, i) => (
        <SegmentRow
          key={s.id}
          segment={s}
          index={i}
          onUpdateWeight={onUpdateWeight}
          onUpdateLabel={onUpdateLabel}
          onUpdateColor={onUpdateColor}
          onRemoveSegment={onRemoveSegment}
          canRemove={canRemove}
        />
      ))}
      <button className="add-btn" onClick={onAddSegment}>
        <Plus size={16} /> Add Option
      </button>
    </div>
  );
};
