"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSegments = useSegments;
const react_1 = require("react");
const DEFAULT_SEGMENTS = [
    { id: '1', label: 'Deep Ocean', weight: 10, percentage: 25, color: '#1a5fb4' },
    { id: '2', label: 'Electric Sky', weight: 10, percentage: 25, color: '#3584e4' },
    { id: '3', label: 'Neon Cobalt', weight: 10, percentage: 25, color: '#62a0ea' },
    { id: '4', label: 'Cyan Flash', weight: 10, percentage: 25, color: '#00f2ff' },
];
function useSegments() {
    const [segments, setSegments] = (0, react_1.useState)(DEFAULT_SEGMENTS);
    const totalWeight = (0, react_1.useMemo)(() => segments.reduce((sum, s) => sum + s.weight, 0), [segments]);
    const updateWeight = (0, react_1.useCallback)((index, weight) => {
        setSegments(prev => {
            const newSegments = [...prev];
            newSegments[index] = { ...newSegments[index], weight };
            const newTotal = newSegments.reduce((sum, s) => sum + s.weight, 0);
            return newSegments.map(s => ({
                ...s,
                percentage: (s.weight / newTotal) * 100
            }));
        });
    }, []);
    const updateLabel = (0, react_1.useCallback)((index, label) => {
        setSegments(prev => {
            const newSegments = [...prev];
            newSegments[index] = { ...newSegments[index], label };
            return newSegments;
        });
    }, []);
    const updateColor = (0, react_1.useCallback)((index, color) => {
        setSegments(prev => {
            const newSegments = [...prev];
            newSegments[index] = { ...newSegments[index], color };
            return newSegments;
        });
    }, []);
    const addSegment = (0, react_1.useCallback)(() => {
        const id = Math.random().toString(36).substring(2, 11);
        setSegments(prev => {
            const newSegments = [
                ...prev,
                { id, label: `Option ${prev.length + 1}`, weight: 1, percentage: 0, color: '#6366f1' }
            ];
            const total = newSegments.reduce((sum, s) => sum + s.weight, 0);
            return newSegments.map(s => ({
                ...s,
                percentage: (s.weight / total) * 100
            }));
        });
    }, []);
    const updatePercentage = (0, react_1.useCallback)((index, percentage) => {
        // Clamp to (0, 100) exclusive to avoid division by zero and zero weights
        const p = Math.min(Math.max(percentage, 0.01), 99.99);
        setSegments(prev => {
            const othersWeight = prev.reduce((sum, s, i) => i !== index ? sum + s.weight : sum, 0);
            // w_i = p * W_others / (100 - p)
            const newWeight = (p * othersWeight) / (100 - p);
            const newSegments = [...prev];
            newSegments[index] = { ...newSegments[index], weight: newWeight };
            const newTotal = newSegments.reduce((sum, s) => sum + s.weight, 0);
            return newSegments.map(s => ({
                ...s,
                percentage: (s.weight / newTotal) * 100
            }));
        });
    }, []);
    const removeSegment = (0, react_1.useCallback)((index) => {
        setSegments(prev => {
            if (prev.length <= 2)
                return prev;
            const newSegments = prev.filter((_, i) => i !== index);
            const total = newSegments.reduce((sum, s) => sum + s.weight, 0);
            return newSegments.map(s => ({
                ...s,
                percentage: (s.weight / total) * 100
            }));
        });
    }, []);
    return {
        segments,
        updateWeight,
        updatePercentage,
        updateLabel,
        updateColor,
        addSegment,
        removeSegment,
        setSegments
    };
}
//# sourceMappingURL=useSegments.js.map