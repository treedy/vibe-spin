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
});
