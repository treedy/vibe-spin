import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Segment } from '../hooks/useSegments';

interface WheelProps {
  segments: Segment[];
  rotation: number;
  isSpinning?: boolean;
  onSpin?: () => void;
  disabled?: boolean;
}

const RADIUS = 100;
const CENTER_X = 100;
const CENTER_Y = 100;

export const Wheel: React.FC<WheelProps> = React.memo(({ segments, rotation, isSpinning, onSpin, disabled }) => {
  const slices = useMemo(() => {
    let currentAngle = 0;
    return segments.map((segment) => {
      const sliceAngle = (segment.percentage / 100) * 360;
      const x1 = (CENTER_X + RADIUS * Math.cos((Math.PI * currentAngle) / 180)).toFixed(2);
      const y1 = (CENTER_Y + RADIUS * Math.sin((Math.PI * currentAngle) / 180)).toFixed(2);

      currentAngle += sliceAngle;

      const x2 = (CENTER_X + RADIUS * Math.cos((Math.PI * currentAngle) / 180)).toFixed(2);
      const y2 = (CENTER_Y + RADIUS * Math.sin((Math.PI * currentAngle) / 180)).toFixed(2);

      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      const pathData = `M ${CENTER_X} ${CENTER_Y} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return {
        id: segment.id,
        pathData,
        color: segment.color,
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
        transition={{ type: 'spring', damping: 20, stiffness: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <svg
          viewBox="0 0 200 200"
          style={{ width: '100%', height: '100%', display: 'block', filter: 'drop-shadow(0 0 20px rgba(37, 123, 244, 0.3))' }}
        >
          {slices.map((slice) => (
            <path
              key={slice.id}
              d={slice.pathData}
              fill={slice.color}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />
          ))}
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
