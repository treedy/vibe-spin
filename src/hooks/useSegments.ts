import { useState, useMemo, useCallback } from 'react';
import { nextSegmentColor } from '../utils/colorUtils';

export interface Segment {
  id: string;
  label: string;
  weight: number;
  percentage: number;
  color: string;
}

const DEFAULT_SEGMENTS: Segment[] = [
  { id: '1', label: 'Deep Ocean', weight: 10, percentage: 25, color: '#1a5fb4' },
  { id: '2', label: 'Electric Sky', weight: 10, percentage: 25, color: '#3584e4' },
  { id: '3', label: 'Neon Cobalt', weight: 10, percentage: 25, color: '#62a0ea' },
  { id: '4', label: 'Cyan Flash', weight: 10, percentage: 25, color: '#00f2ff' },
];

export function useSegments() {
  const [segments, setSegments] = useState<Segment[]>(DEFAULT_SEGMENTS);

  const totalWeight = useMemo(() => segments.reduce((sum, s) => sum + s.weight, 0), [segments]);

  const updateWeight = useCallback((index: number, weight: number) => {
    setSegments(prev => {
      const newSegments = [...prev];
      const current = newSegments[index];
      if (!current) return prev;
      newSegments[index] = { ...current, weight };

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
      const current = newSegments[index];
      if (!current) return prev;
      newSegments[index] = { ...current, label };
      return newSegments;
    });
  }, []);

  const updateColor = useCallback((index: number, color: string) => {
    setSegments(prev => {
      const newSegments = [...prev];
      const current = newSegments[index];
      if (!current) return prev;
      newSegments[index] = { ...current, color };
      return newSegments;
    });
  }, []);

  const addSegment = useCallback(() => {
    const id = Math.random().toString(36).substring(2, 11);
    setSegments(prev => {
      const newSegments = [
        ...prev,
        { id, label: `Option ${prev.length + 1}`, weight: 1, percentage: 0, color: nextSegmentColor(prev) }
      ];
      const total = newSegments.reduce((sum, s) => sum + s.weight, 0);
      return newSegments.map(s => ({
        ...s,
        percentage: (s.weight / total) * 100
      }));
    });
  }, []);

  const updatePercentage = useCallback((index: number, percentage: number) => {
    // Clamp to (0, 100) exclusive to avoid division by zero and zero weights
    const p = Math.min(Math.max(percentage, 0.01), 99.99);
    setSegments(prev => {
      const othersWeight = prev.reduce((sum, s, i) => i !== index ? sum + s.weight : sum, 0);
      // w_i = p * W_others / (100 - p)
      const newWeight = (p * othersWeight) / (100 - p);
      const newSegments = [...prev];
      const current = newSegments[index];
      if (!current) return prev;
      newSegments[index] = { ...current, weight: newWeight };
      const newTotal = newSegments.reduce((sum, s) => sum + s.weight, 0);
      return newSegments.map(s => ({
        ...s,
        percentage: (s.weight / newTotal) * 100
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
    updatePercentage,
    updateLabel,
    updateColor,
    addSegment,
    removeSegment,
    setSegments
  };
}
