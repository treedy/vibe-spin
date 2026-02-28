import React, { useState, useRef, useCallback } from 'react';
import type { Segment } from '../hooks/useSegments';
import { Trash2, Plus, Palette, RotateCcw } from 'lucide-react';

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
  const [inputPct, setInputPct] = useState<string | null>(null);
  const inputPctRef = useRef<string | null>(null);

  const handleEnterBlur = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.currentTarget.blur(); }
  }, []);

  const setDraft = (v: string | null) => {
    inputPctRef.current = v;
    setInputPct(v);
  };

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
        type="text"
        className="label-input"
        value={segment.label}
        onChange={(e) => onUpdateLabel(index, e.target.value)}
        onKeyDown={handleEnterBlur}
      />
      <input
        type="color"
        className="color-swatch"
        value={segment.color}
        onChange={(e) => onUpdateColor(index, e.target.value)}
      />
      <input
        type="number"
        className="weight-input"
        value={segment.weight}
        onChange={(e) => onUpdateWeight(index, Number(e.target.value))}
        onKeyDown={handleEnterBlur}
        min="1"
      />
      <input
        type="number"
        className="pct-input"
        value={inputPct !== null ? inputPct : segment.percentage.toFixed(1)}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setDraft(segment.percentage.toFixed(1))}
        onBlur={commitPercentage}
        onKeyDown={handleEnterBlur}
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

interface Preset {
  name: string;
  segments: Segment[];
}

export const SegmentTable: React.FC<{
  segments: Segment[],
  onUpdateWeight: (i: number, w: number) => void,
  onUpdatePercentage: (i: number, p: number) => void,
  onUpdateLabel: (i: number, l: string) => void,
  onUpdateColor: (i: number, c: string) => void,
  onAddSegment: () => void,
  onRemoveSegment: (i: number) => void,
  onResetWeights?: () => void,
  presets?: Preset[],
  onLoadPreset?: (segments: Segment[]) => void
}> = ({ segments, onUpdateWeight, onUpdatePercentage, onUpdateLabel, onUpdateColor, onAddSegment, onRemoveSegment, onResetWeights, presets, onLoadPreset }) => {
  const canRemove = segments.length > 2;

  return (
    <div className="table-container">
      {/* Preset Row */}
      {presets && presets.length > 0 && (
        <div className="preset-row">
          {presets.map(p => (
            <button key={p.name} className="preset-btn" onClick={() => onLoadPreset?.(p.segments)}>
              {p.name}
              <Palette size={14} />
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="row header">
        <div className="col">Segment</div>
        <div className="col">Color</div>
        <div className="col">Weight</div>
        <div className="col">%</div>
        <div className="col">Action</div>
      </div>

      {/* Rows */}
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

      {/* Add Segment Button */}
      <button className="add-segment-row" onClick={onAddSegment}>
        <Plus size={16} />
        {segments.length === 0 ? 'Add your first segment' : 'Add segment'}
      </button>

      {/* Reset Weights Button */}
      {onResetWeights && (
        <button className="reset-weights-btn" onClick={onResetWeights}>
          <RotateCcw size={14} />
          Reset Weights
        </button>
      )}
    </div>
  );
};
