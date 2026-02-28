/**
 * Predefined color palettes for wheel segments.
 * Colors are applied cyclically when segment count differs from palette size.
 */

export interface Palette {
  id: string;
  name: string;
  colors: string[]; // hex color strings in order
  createdAt: number;
  isDefault?: boolean;
}

/**
 * Built-in palettes that ship with the app.
 * These cannot be deleted by users.
 */
export const DEFAULT_PALETTES: Palette[] = [
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    colors: ['#ff00ff', '#00ffff', '#ff0080', '#8000ff', '#00ff80', '#ffff00'],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    colors: ['#1a5fb4', '#3584e4', '#62a0ea', '#00f2ff', '#0d4a8f', '#2e7fd9'],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'sunset-blaze',
    name: 'Sunset Blaze',
    colors: ['#ff6b35', '#f7931e', '#ffc107', '#ff4757', '#e84118', '#ff9f43'],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'forest-calm',
    name: 'Forest Calm',
    colors: ['#2d5a27', '#4ade80', '#22c55e', '#16a34a', '#84cc16', '#10b981'],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'candy-pop',
    name: 'Candy Pop',
    colors: ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#fb7185'],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: ['#1a1a2e', '#4a4a6a', '#7a7a9a', '#aaaacc', '#d0d0e8', '#f0f0ff'],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'retro-arcade',
    name: 'Retro Arcade',
    colors: ['#e63946', '#f4a261', '#e9c46a', '#2a9d8f', '#264653', '#8338ec'],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    colors: ['#ffd6e0', '#c9f0ff', '#d4f5d4', '#fff4c4', '#e8d4f8', '#ffecd6'],
    createdAt: 0,
    isDefault: true,
  },
];
