import { useState, useMemo, useCallback } from 'react';

export interface Segment {
  id: string;
  label: string;
  weight: number;
  percentage: number;
  color: string;
}

const DEFAULT_SEGMENTS: Segment[] = [
  { id: '1', label: 'Option 1', weight: 1, percentage: 50, color: '#FF5733' },
  { id: '2', label: 'Option 2', weight: 1, percentage: 50, color: '#33FF57' },
];

export function useSegments() {
  const [segments, setSegments] = useState<Segment[]>(DEFAULT_SEGMENTS);

  const totalWeight = useMemo(() => segments.reduce((sum, s) => sum + s.weight, 0), [segments]);

  const updateWeight = useCallback((index: number, weight: number) => {
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

  const updateLabel = useCallback((index: number, label: string) => {
    setSegments(prev => {
      const newSegments = [...prev];
      newSegments[index] = { ...newSegments[index], label };
      return newSegments;
    });
  }, []);

  const updateColor = useCallback((index: number, color: string) => {
    setSegments(prev => {
      const newSegments = [...prev];
      newSegments[index] = { ...newSegments[index], color };
      return newSegments;
    });
  }, []);

  const addSegment = useCallback(() => {
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

  const removeSegment = useCallback((index: number) => {
    setSegments(prev => {
      if (prev.length <= 2) return prev;
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
    updateLabel, 
    updateColor, 
    addSegment, 
    removeSegment, 
    setSegments 
  };
}
