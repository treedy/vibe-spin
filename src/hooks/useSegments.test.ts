import { renderHook, act } from '@testing-library/react';
import { useSegments } from './useSegments';
import { describe, it, expect } from 'vitest';

describe('useSegments', () => {
  it('recalculates percentages when weight changes', () => {
    const { result } = renderHook(() => useSegments());
    act(() => {
      result.current.updateWeight(0, 2); // Change first segment weight to 2
    });
    // Total weight 2+1=3. First segment should be 66.6%
    expect(result.current.segments[0].percentage).toBeCloseTo(66.66, 1);
  });

  describe('updatePercentage', () => {
    it('sets the target segment to the specified percentage', () => {
      const { result } = renderHook(() => useSegments());
      act(() => {
        result.current.updatePercentage(0, 25);
      });
      expect(result.current.segments[0].percentage).toBeCloseTo(25, 1);
      expect(result.current.segments[1].percentage).toBeCloseTo(75, 1);
    });

    it('all percentages still sum to 100 after update', () => {
      const { result } = renderHook(() => useSegments());
      act(() => {
        result.current.updatePercentage(0, 40);
      });
      const total = result.current.segments.reduce((sum, s) => sum + s.percentage, 0);
      expect(total).toBeCloseTo(100, 5);
    });

    it('clamps percentage to a minimum of 0.01', () => {
      const { result } = renderHook(() => useSegments());
      act(() => {
        result.current.updatePercentage(0, 0);
      });
      expect(result.current.segments[0].percentage).toBeCloseTo(0.01, 1);
    });

    it('clamps percentage to a maximum of 99.99', () => {
      const { result } = renderHook(() => useSegments());
      act(() => {
        result.current.updatePercentage(0, 100);
      });
      expect(result.current.segments[0].percentage).toBeCloseTo(99.99, 1);
    });
  });
});
