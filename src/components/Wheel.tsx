import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Segment } from '../hooks/useSegments';
import { DEFAULT_SPIN_DURATION_MS } from '../hooks/useWheels';

interface WheelProps {
  segments: Segment[];
  rotation: number;
  isSpinning?: boolean;
  onSpin?: () => void;
  disabled?: boolean;
  spinDurationMs?: number;
}

const RADIUS = 100;
const CENTER_X = 100;
const CENTER_Y = 100;
const LABEL_RADIUS = 62;
const MIN_ANGLE_FOR_LABEL = 15;
const FONT_SIZE_NORMAL = 8;
const FONT_SIZE_SMALL = 6.5;
const FONT_THRESHOLD_ANGLE = 30;
const MAX_CHARS_WIDE = 12;   // sliceAngle >= 90°
const MAX_CHARS_MEDIUM = 9;  // sliceAngle >= 45°
const MAX_CHARS_NARROW = 7;  // sliceAngle >= 30°
const MAX_CHARS_TINY = 5;    // sliceAngle >= MIN_ANGLE_FOR_LABEL

function truncateLabel(label: string, sliceAngle: number): string {
  const maxChars = sliceAngle >= 90 ? MAX_CHARS_WIDE
    : sliceAngle >= 45 ? MAX_CHARS_MEDIUM
    : sliceAngle >= FONT_THRESHOLD_ANGLE ? MAX_CHARS_NARROW
    : MAX_CHARS_TINY;
  return label.length > maxChars ? label.slice(0, maxChars - 1) + '…' : label;
}

export const Wheel: React.FC<WheelProps> = React.memo(({ segments, rotation, isSpinning, onSpin, disabled, spinDurationMs = DEFAULT_SPIN_DURATION_MS }) => {
  const slices = useMemo(() => {
    let currentAngle = 0;
    return segments.map((segment) => {
      const sliceAngle = (segment.percentage / 100) * 360;
      const startAngle = currentAngle;
      const x1 = (CENTER_X + RADIUS * Math.cos((Math.PI * currentAngle) / 180)).toFixed(2);
      const y1 = (CENTER_Y + RADIUS * Math.sin((Math.PI * currentAngle) / 180)).toFixed(2);

      currentAngle += sliceAngle;

      const x2 = (CENTER_X + RADIUS * Math.cos((Math.PI * currentAngle) / 180)).toFixed(2);
      const y2 = (CENTER_Y + RADIUS * Math.sin((Math.PI * currentAngle) / 180)).toFixed(2);

      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      const pathData = `M ${CENTER_X} ${CENTER_Y} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      const midAngle = startAngle + sliceAngle / 2;

      return {
        id: segment.id,
        pathData,
        color: segment.color,
        label: segment.label,
        midAngle,
        sliceAngle,
        showLabel: sliceAngle >= MIN_ANGLE_FOR_LABEL,
      };
    });
  }, [segments]);

  return (
    <div className="wheel-wrapper">
      {/* Ticker/Pointer - Rounded pill shape */}
      <div className="ticker">
        <svg width="16" height="40" viewBox="0 0 16 40" fill="none">
          <rect x="0" y="0" width="16" height="40" rx="8" fill="white" />
        </svg>
      </div>

      {/* Wheel */}
      <motion.div
        animate={{ rotate: rotation }}
        transition={{ type: 'spring', duration: spinDurationMs / 1000, bounce: 0.1 }}
        style={{ width: '100%', height: '100%' }}
      >
        <svg
          viewBox="0 0 200 200"
          style={{ width: '100%', height: '100%', display: 'block', filter: 'drop-shadow(0 0 20px rgba(37, 123, 244, 0.3))' }}
        >
          <defs>
            <filter id="labelDrop" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.6" />
            </filter>
          </defs>
          {slices.map((slice) => (
            <path
              key={slice.id}
              d={slice.pathData}
              fill={slice.color}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />
          ))}
          {slices.map((slice) =>
            slice.showLabel ? (
              <text
                key={`label-${slice.id}`}
                x={CENTER_X + LABEL_RADIUS}
                y={CENTER_Y}
                transform={`rotate(${slice.midAngle}, ${CENTER_X}, ${CENTER_Y})`}
                filter={"url(#labelDrop)"}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.92)"
                fontSize={slice.sliceAngle >= FONT_THRESHOLD_ANGLE ? FONT_SIZE_NORMAL : FONT_SIZE_SMALL}
                fontWeight="600"
                fontFamily="inherit"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {truncateLabel(slice.label, slice.sliceAngle)}
              </text>
            ) : null
          )}
        </svg>
      </motion.div>

      {/* Center Button */}
      <button
        className="wheel-center-btn"
        onClick={onSpin}
        disabled={disabled}
      >
        <span className="wheel-center-label">Ready</span>
        <span className="wheel-center-text">{isSpinning ? '...' : 'SPIN'}</span>
      </button>
    </div>
  );
});

Wheel.displayName = 'Wheel';
