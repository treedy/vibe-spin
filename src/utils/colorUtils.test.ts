import { describe, it, expect } from 'vitest';
import { nextSegmentColor, DEFAULT_COLOR_PALETTE } from './colorUtils';

describe('nextSegmentColor', () => {
  it('returns the first palette color when there are no segments', () => {
    expect(nextSegmentColor([])).toBe(DEFAULT_COLOR_PALETTE[0]);
  });

  it('cycles through the palette based on segment count', () => {
    const segments = [{ color: DEFAULT_COLOR_PALETTE[0]! }];
    expect(nextSegmentColor(segments)).toBe(DEFAULT_COLOR_PALETTE[1]);
  });

  it('avoids the same color as the last segment', () => {
    // Force a scenario where the cycle index would land on the last segment's color
    const palette = ['#aaa', '#bbb', '#ccc'];
    // 1 segment → index 1 → '#bbb', last color is '#bbb' → should skip to '#ccc'
    const segments = [{ color: '#bbb' }];
    expect(nextSegmentColor(segments, palette)).toBe('#ccc');
  });

  it('wraps around correctly when index exceeds palette length', () => {
    const palette = ['#111', '#222', '#333'];
    // 3 segments → index 0 → '#111'
    const segments = [{ color: '#333' }, { color: '#111' }, { color: '#222' }];
    // index = 3 % 3 = 0 → '#111', last is '#222' → no collision → '#111'
    expect(nextSegmentColor(segments, palette)).toBe('#111');
  });

  it('uses a custom palette when provided', () => {
    const palette = ['#custom1', '#custom2'];
    expect(nextSegmentColor([], palette)).toBe('#custom1');
    expect(nextSegmentColor([{ color: '#custom1' }], palette)).toBe('#custom2');
  });

  it('falls back to DEFAULT_COLOR_PALETTE when palette is empty', () => {
    expect(nextSegmentColor([], [])).toBe(DEFAULT_COLOR_PALETTE[0]);
  });

  it('does not skip when last segment color differs from candidate', () => {
    const palette = ['#aaa', '#bbb'];
    const segments = [{ color: '#aaa' }];
    // index 1 → '#bbb', last is '#aaa' → no collision → '#bbb'
    expect(nextSegmentColor(segments, palette)).toBe('#bbb');
  });
});
