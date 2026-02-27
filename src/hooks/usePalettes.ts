import { useState, useCallback, useEffect } from 'react';
import { DEFAULT_PALETTES, type Palette } from '../data/palettes';

const PALETTES_KEY = 'vibe-spin:palettes';

function genId(): string {
  return crypto.randomUUID();
}

function loadCustomPalettes(): Palette[] {
  try {
    const raw = localStorage.getItem(PALETTES_KEY);
    return raw ? (JSON.parse(raw) as Palette[]) : [];
  } catch {
    return [];
  }
}

function saveCustomPalettes(palettes: Palette[]): void {
  localStorage.setItem(PALETTES_KEY, JSON.stringify(palettes));
}

export function usePalettes() {
  const [customPalettes, setCustomPalettes] = useState<Palette[]>(loadCustomPalettes);

  // All palettes: defaults + custom
  const palettes = [...DEFAULT_PALETTES, ...customPalettes];

  // Persist custom palettes on change
  useEffect(() => {
    saveCustomPalettes(customPalettes);
  }, [customPalettes]);

  const createPalette = useCallback((name: string, colors: string[]): Palette => {
    const newPalette: Palette = {
      id: genId(),
      name,
      colors,
      createdAt: Date.now(),
      isDefault: false,
    };
    setCustomPalettes(prev => [...prev, newPalette]);
    return newPalette;
  }, []);

  const deletePalette = useCallback((id: string) => {
    setCustomPalettes(prev => prev.filter(p => p.id !== id));
  }, []);

  const getPaletteById = useCallback((id: string): Palette | undefined => {
    return palettes.find(p => p.id === id);
  }, [palettes]);

  /**
   * Get colors for applying to segments.
   * Uses cyclic mapping: if segments > colors, colors repeat.
   */
  const getColorsForSegments = useCallback((paletteId: string, segmentCount: number): string[] => {
    const palette = palettes.find(p => p.id === paletteId);
    if (!palette || palette.colors.length === 0 || segmentCount === 0) return [];

    const colors = palette.colors;
    const result: string[] = [];
    for (let i = 0; i < segmentCount; i++) {
      const color = colors[i % colors.length];
      if (color) result.push(color);
    }
    return result;
  }, [palettes]);

  return {
    palettes,
    customPalettes,
    defaultPalettes: DEFAULT_PALETTES,
    createPalette,
    deletePalette,
    getPaletteById,
    getColorsForSegments,
  };
}
