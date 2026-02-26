import { renderHook, act } from '@testing-library/react';
import { useSegments } from './useSegments';
import { describe, it, expect } from 'vitest';

describe('useSegments', () => {
  it('recalculates percentages when weight changes', () => {
    const { result } = renderHook(() => useSegments());
    act(() => {
      result.current.updateWeight(0, 2); // Change first segment weight to 2
    });
    // Total weight 2+10+10+10=32. First segment should be 6.25%
    expect(result.current.segments[0]!.percentage).toBeCloseTo(6.25, 2);
  });

  describe('updatePercentage', () => {
    it('sets the target segment to the specified percentage', () => {
      const { result } = renderHook(() => useSegments());
      act(() => {
        result.current.updatePercentage(0, 25);
      });
      expect(result.current.segments[0]!.percentage).toBeCloseTo(25, 1);
      // With four equal-weight segments, the remaining 75% is split
      // evenly across the other three segments => 25% each.
      expect(result.current.segments[1]!.percentage).toBeCloseTo(25, 1);
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
      expect(result.current.segments[0]!.percentage).toBeCloseTo(0.01, 1);
    });

    it('clamps percentage to a maximum of 99.99', () => {
      const { result } = renderHook(() => useSegments());
      act(() => {
        result.current.updatePercentage(0, 100);
      });
      expect(result.current.segments[0]!.percentage).toBeCloseTo(99.99, 1);
    });
  });
});
