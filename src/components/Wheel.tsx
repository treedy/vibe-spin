import React from 'react';
import { motion } from 'framer-motion';
import type { Segment } from '../hooks/useSegments';

interface WheelProps {
  segments: Segment[];
  rotation: number;
}

export const Wheel: React.FC<WheelProps> = ({ segments, rotation }) => {
  const radius = 100;
  const centerX = 100;
  const centerY = 100;

  let currentAngle = 0;

  return (
    <div className="wheel-wrapper">
      <motion.svg
        viewBox="0 0 200 200"
        animate={{ rotate: rotation }}
        transition={{ type: 'spring', damping: 20, stiffness: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        {segments.map((segment) => {
          const sliceAngle = (segment.percentage / 100) * 360;
          const x1 = centerX + radius * Math.cos((Math.PI * currentAngle) / 180);
          const y1 = centerY + radius * Math.sin((Math.PI * currentAngle) / 180);
          
          currentAngle += sliceAngle;
          
          const x2 = centerX + radius * Math.cos((Math.PI * currentAngle) / 180);
          const y2 = centerY + radius * Math.sin((Math.PI * currentAngle) / 180);
          
          const largeArcFlag = sliceAngle > 180 ? 1 : 0;
          const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

          return (
            <path
              key={segment.id}
              d={pathData}
              fill={segment.color}
              stroke="white"
              strokeWidth="0.5"
            />
          );
        })}
      </motion.svg>
      <div className="ticker" />
    </div>
  );
};
