import type { Segment } from '../hooks/useSegments';

export interface SharedWheel {
  name: string;
  segments: Array<{ label: string; weight: number; color: string }>;
}

export function encodeWheel(name: string, segments: Segment[]): string {
  const data: SharedWheel = {
    name,
    segments: segments.map(({ label, weight, color }) => ({ label, weight, color })),
  };
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

export function decodeWheel(param: string): SharedWheel | null {
  try {
    const json = decodeURIComponent(atob(param));
    const data = JSON.parse(json) as unknown;
    if (
      typeof data !== 'object' ||
      data === null ||
      typeof (data as SharedWheel).name !== 'string' ||
      !Array.isArray((data as SharedWheel).segments)
    ) {
      return null;
    }
    const shared = data as SharedWheel;
    const validSegments = shared.segments.every(
      s =>
        typeof s.label === 'string' &&
        typeof s.weight === 'number' &&
        typeof s.color === 'string'
    );
    return validSegments ? shared : null;
  } catch {
    return null;
  }
}
