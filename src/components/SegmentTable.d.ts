import React from 'react';
import type { Segment } from '../hooks/useSegments';
interface Preset {
    name: string;
    segments: Segment[];
}
export declare const SegmentTable: React.FC<{
    segments: Segment[];
    onUpdateWeight: (i: number, w: number) => void;
    onUpdatePercentage: (i: number, p: number) => void;
    onUpdateLabel: (i: number, l: string) => void;
    onUpdateColor: (i: number, c: string) => void;
    onAddSegment: () => void;
    onRemoveSegment: (i: number) => void;
    presets?: Preset[];
    onLoadPreset?: (segments: Segment[]) => void;
}>;
export {};
//# sourceMappingURL=SegmentTable.d.ts.map