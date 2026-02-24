import React, { useState, useRef, useCallback } from 'react';
import type { Segment } from '../hooks/useSegments';
import { Trash2, Plus } from 'lucide-react';

interface SegmentRowProps {
  segment: Segment;
  index: number;
  onUpdateWeight: (i: number, w: number) => void;
  onUpdatePercentage: (i: number, p: number) => void;
  onUpdateLabel: (i: number, l: string) => void;
  onUpdateColor: (i: number, c: string) => void;
  onRemoveSegment: (i: number) => void;
  canRemove: boolean;
}

const SegmentRow: React.FC<SegmentRowProps> = React.memo(({
  segment,
  index,
  onUpdateWeight,
  onUpdatePercentage,
  onUpdateLabel,
  onUpdateColor,
  onRemoveSegment,
  canRemove
}) => {
  // rerender-use-ref-transient-values + rerender-functional-setstate:
  // Keep state for controlled display; mirror to ref so commitPercentage
  // reads the always-current value without capturing stale state in its closure.
  const [inputPct, setInputPct] = useState<string | null>(null);
  const inputPctRef = useRef<string | null>(null);

  const setDraft = (v: string | null) => {
    inputPctRef.current = v;
    setInputPct(v);
  };

  // Stable callback — reads ref, not state, so deps are [index, onUpdatePercentage]
  const commitPercentage = useCallback(() => {
    const draft = inputPctRef.current;
    if (draft !== null) {
      const val = parseFloat(draft);
      if (!isNaN(val)) {
        onUpdatePercentage(index, val);
      }
      setDraft(null);
    }
  }, [index, onUpdatePercentage]);

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
      <input
        type="number"
        className="pct-input"
        value={inputPct !== null ? inputPct : segment.percentage.toFixed(1)}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setDraft(segment.percentage.toFixed(1))}
        onBlur={commitPercentage}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
        min="0.01"
        max="99.99"
        step="0.1"
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
  onUpdatePercentage: (i: number, p: number) => void,
  onUpdateLabel: (i: number, l: string) => void,
  onUpdateColor: (i: number, c: string) => void,
  onAddSegment: () => void,
  onRemoveSegment: (i: number) => void
}> = ({ segments, onUpdateWeight, onUpdatePercentage, onUpdateLabel, onUpdateColor, onAddSegment, onRemoveSegment }) => {
  const canRemove = segments.length > 2;

  return (
    <div className="table-container">
      {segments.map((s, i) => (
        <SegmentRow
          key={s.id}
          segment={s}
          index={i}
          onUpdateWeight={onUpdateWeight}
          onUpdatePercentage={onUpdatePercentage}
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
