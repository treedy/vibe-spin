import React from 'react';
import type { Segment } from '../hooks/useSegments';
interface WheelProps {
    segments: Segment[];
    rotation: number;
    isSpinning?: boolean;
    onSpin?: () => void;
    disabled?: boolean;
}
export declare const Wheel: React.FC<WheelProps>;
export {};
//# sourceMappingURL=Wheel.d.ts.map