import { describe, it, expect } from 'vitest';
import { encodeWheel, decodeWheel } from './permalink';
import type { Segment } from '../hooks/useSegments';

const makeSegments = (): Segment[] => [
  { id: 's1', label: 'Alpha', weight: 2, percentage: 40, color: '#ff0000' },
  { id: 's2', label: 'Beta', weight: 3, percentage: 60, color: '#00ff00' },
];

describe('encodeWheel', () => {
  it('returns a non-empty string', () => {
    expect(encodeWheel('Test', makeSegments())).toBeTruthy();
  });

  it('produces a valid base64 string', () => {
    const encoded = encodeWheel('Test', makeSegments());
    expect(() => atob(encoded)).not.toThrow();
  });
});

describe('decodeWheel', () => {
  it('round-trips name and segments', () => {
    const segments = makeSegments();
    const encoded = encodeWheel('My Wheel', segments);
    const decoded = decodeWheel(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded!.name).toBe('My Wheel');
    expect(decoded!.segments).toHaveLength(2);
    expect(decoded!.segments[0]).toEqual({ label: 'Alpha', weight: 2, color: '#ff0000' });
    expect(decoded!.segments[1]).toEqual({ label: 'Beta', weight: 3, color: '#00ff00' });
  });

  it('strips id and percentage fields from encoded segments', () => {
    const encoded = encodeWheel('W', makeSegments());
    const decoded = decodeWheel(encoded);
    expect(decoded!.segments[0]).not.toHaveProperty('id');
    expect(decoded!.segments[0]).not.toHaveProperty('percentage');
  });

  it('returns null for invalid base64', () => {
    expect(decodeWheel('not-valid-base64!!!')).toBeNull();
  });

  it('returns null for valid base64 but invalid JSON', () => {
    expect(decodeWheel(btoa('not json'))).toBeNull();
  });

  it('returns null when segments array is missing', () => {
    const bad = btoa(encodeURIComponent(JSON.stringify({ name: 'x' })));
    expect(decodeWheel(bad)).toBeNull();
  });

  it('returns null when a segment is missing required fields', () => {
    const bad = btoa(
      encodeURIComponent(
        JSON.stringify({ name: 'x', segments: [{ label: 'A', weight: 1 }] })
      )
    );
    expect(decodeWheel(bad)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(decodeWheel('')).toBeNull();
  });
});
