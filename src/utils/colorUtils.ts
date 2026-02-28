/**
 * Utility for deterministic, palette-cycling color assignment to wheel segments.
 */

/** 12 high-contrast colors used as the default palette when none is provided. */
export const DEFAULT_COLOR_PALETTE: string[] = [
  '#e63946', '#f4a261', '#e9c46a', '#2a9d8f',
  '#264653', '#8338ec', '#ff006e', '#fb5607',
  '#ffbe0b', '#3a86ff', '#06d6a0', '#ef476f',
];

/**
 * Picks the next color for a new segment.
 *
 * Strategy:
 * 1. Use `palette[segments.length % palette.length]` as the candidate (deterministic cycling).
 * 2. If the candidate matches the last segment's color and the palette has more than one
 *    color, advance one position to avoid adjacent duplicates.
 *
 * @param segments - Current list of segments (read-only; only `.color` is used).
 * @param palette  - Optional palette to cycle through. Falls back to DEFAULT_COLOR_PALETTE.
 * @returns A hex color string for the next segment.
 */
export function nextSegmentColor(
  segments: { color: string }[],
  palette?: string[]
): string {
  const colors = palette && palette.length > 0 ? palette : DEFAULT_COLOR_PALETTE;
  const baseIndex = segments.length % colors.length;
  const candidate = colors[baseIndex]!;

  const lastColor = segments.length > 0 ? segments[segments.length - 1]!.color : null;

  if (
    lastColor &&
    candidate.toLowerCase() === lastColor.toLowerCase() &&
    colors.length > 1
  ) {
    return colors[(baseIndex + 1) % colors.length]!;
  }

  return candidate;
}
