import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Segment } from '../hooks/useSegments';

interface WheelProps {
  segments: Segment[];
  rotation: number;
}

const RADIUS = 100;
const CENTER_X = 100;
const CENTER_Y = 100;

export const Wheel: React.FC<WheelProps> = React.memo(({ segments, rotation }) => {
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
      {/* rendering-animate-svg-wrapper: Animate the div, not the SVG */}
      <motion.div
        animate={{ rotate: rotation }}
        transition={{ type: 'spring', damping: 20, stiffness: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <svg
          viewBox="0 0 200 200"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          {slices.map((slice) => (
            <path
              key={slice.id}
              d={slice.pathData}
              fill={slice.color}
              stroke="white"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </motion.div>
      <div className="ticker" />
    </div>
  );
});

Wheel.displayName = 'Wheel';
