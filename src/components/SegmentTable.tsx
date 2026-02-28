import React, { useState, useRef, useCallback } from 'react';
import type { Segment } from '../hooks/useSegments';
import { Trash2, Plus, Palette, RotateCcw, GripVertical } from 'lucide-react';

interface SegmentRowProps {
  segment: Segment;
  index: number;
  totalCount: number;
  isDragging: boolean;
  isDragOver: boolean;
  onUpdateWeight: (i: number, w: number) => void;
  onUpdatePercentage: (i: number, p: number) => void;
  onUpdateLabel: (i: number, l: string) => void;
  onUpdateColor: (i: number, c: string) => void;
  onRemoveSegment: (i: number) => void;
  canRemove: boolean;
  onDragStart: (i: number) => void;
  onDragOver: (i: number) => void;
  onDrop: (i: number) => void;
  onDragEnd: () => void;
  onMoveUp: (i: number) => void;
  onMoveDown: (i: number) => void;
}

const SegmentRow: React.FC<SegmentRowProps> = React.memo(({
  segment,
  index,
  totalCount,
  isDragging,
  isDragOver,
  onUpdateWeight,
  onUpdatePercentage,
  onUpdateLabel,
  onUpdateColor,
  onRemoveSegment,
  canRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown,
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(index);
  }, [index, onDragOver]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDrop(index);
  }, [index, onDrop]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onMoveUp(index);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onMoveDown(index);
    }
  }, [index, onMoveUp, onMoveDown]);

  const rowClasses = [
    'row',
    isDragging ? 'row--dragging' : '',
    isDragOver ? 'row--drag-over' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={rowClasses}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={onDragEnd}
    >
      <button
        className="drag-handle"
        aria-label={`Drag to reorder ${segment.label}`}
        onKeyDown={handleKeyDown}
        onMouseDown={(e) => e.preventDefault()}
        tabIndex={0}
      >
        <GripVertical size={16} />
      </button>
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
        aria-label={`Remove ${segment.label}`}
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
  onReorderSegments: (from: number, to: number) => void,
  onResetWeights?: () => void,
  presets?: Preset[],
  onLoadPreset?: (segments: Segment[]) => void
}> = ({ segments, onUpdateWeight, onUpdatePercentage, onUpdateLabel, onUpdateColor, onAddSegment, onRemoveSegment, onReorderSegments, onResetWeights, presets, onLoadPreset }) => {
  const canRemove = segments.length > 2;
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    dragIndexRef.current = index;
    setDraggingIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((toIndex: number) => {
    const fromIndex = dragIndexRef.current;
    if (fromIndex !== null && fromIndex !== toIndex) {
      onReorderSegments(fromIndex, toIndex);
    }
    dragIndexRef.current = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, [onReorderSegments]);

  const handleDragEnd = useCallback(() => {
    dragIndexRef.current = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleMoveUp = useCallback((index: number) => {
    if (index > 0) onReorderSegments(index, index - 1);
  }, [onReorderSegments]);

  const handleMoveDown = useCallback((index: number) => {
    if (index < segments.length - 1) onReorderSegments(index, index + 1);
  }, [onReorderSegments, segments.length]);

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
        <div className="col" />
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
          totalCount={segments.length}
          isDragging={draggingIndex === i}
          isDragOver={dragOverIndex === i && draggingIndex !== i}
          onUpdateWeight={onUpdateWeight}
          onUpdatePercentage={onUpdatePercentage}
          onUpdateLabel={onUpdateLabel}
          onUpdateColor={onUpdateColor}
          onRemoveSegment={onRemoveSegment}
          canRemove={canRemove}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
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
