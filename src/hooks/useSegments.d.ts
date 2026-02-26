export interface Segment {
    id: string;
    label: string;
    weight: number;
    percentage: number;
    color: string;
}
export declare function useSegments(): {
    segments: Segment[];
    updateWeight: (index: number, weight: number) => void;
    updatePercentage: (index: number, percentage: number) => void;
    updateLabel: (index: number, label: string) => void;
    updateColor: (index: number, color: string) => void;
    addSegment: () => void;
    removeSegment: (index: number) => void;
    setSegments: import("react").Dispatch<import("react").SetStateAction<Segment[]>>;
};
//# sourceMappingURL=useSegments.d.ts.map