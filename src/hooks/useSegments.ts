import { useState, useMemo } from 'react';

export interface Segment {
  id: string;
  label: string;
  weight: number;
  percentage: number;
  color: string;
}

export function useSegments() {
  const [segments, setSegments] = useState<Segment[]>([
    { id: '1', label: 'Option 1', weight: 1, percentage: 50, color: '#FF5733' },
    { id: '2', label: 'Option 2', weight: 1, percentage: 50, color: '#33FF57' },
  ]);

  const totalWeight = useMemo(() => segments.reduce((sum, s) => sum + s.weight, 0), [segments]);

  const updateWeight = (index: number, weight: number) => {
    const newSegments = [...segments];
    newSegments[index].weight = weight;
    // Recalculate all percentages
    const newTotal = newSegments.reduce((sum, s) => sum + s.weight, 0);
    newSegments.forEach(s => s.percentage = (s.weight / newTotal) * 100);
    setSegments(newSegments);
  };

  return { segments, updateWeight, setSegments };
}
