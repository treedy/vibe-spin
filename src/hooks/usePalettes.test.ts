import { renderHook, act } from '@testing-library/react';
import { usePalettes } from './usePalettes';
import { DEFAULT_PALETTES } from '../data/palettes';
import { describe, it, expect, beforeEach } from 'vitest';

describe('usePalettes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default palettes on first load', () => {
    const { result } = renderHook(() => usePalettes());
    expect(result.current.palettes.length).toBeGreaterThanOrEqual(DEFAULT_PALETTES.length);
    expect(result.current.defaultPalettes).toEqual(DEFAULT_PALETTES);
  });

  it('custom palettes are empty on first load', () => {
    const { result } = renderHook(() => usePalettes());
    expect(result.current.customPalettes).toHaveLength(0);
  });

  it('createPalette adds a new custom palette', () => {
    const { result } = renderHook(() => usePalettes());
    let newPalette;
    act(() => {
      newPalette = result.current.createPalette('My Custom', ['#ff0000', '#00ff00', '#0000ff']);
    });
    expect(result.current.customPalettes).toHaveLength(1);
    expect(result.current.customPalettes[0]!.name).toBe('My Custom');
    expect(result.current.customPalettes[0]!.colors).toEqual(['#ff0000', '#00ff00', '#0000ff']);
    expect(result.current.customPalettes[0]!.isDefault).toBe(false);
  });

  it('deletePalette removes a custom palette', () => {
    const { result } = renderHook(() => usePalettes());
    let newPalette;
    act(() => {
      newPalette = result.current.createPalette('ToDelete', ['#fff']);
    });
    expect(result.current.customPalettes).toHaveLength(1);
    
    act(() => {
      result.current.deletePalette(result.current.customPalettes[0]!.id);
    });
    expect(result.current.customPalettes).toHaveLength(0);
  });

  it('getPaletteById returns the correct palette', () => {
    const { result } = renderHook(() => usePalettes());
    const palette = result.current.getPaletteById(DEFAULT_PALETTES[0]!.id);
    expect(palette).toEqual(DEFAULT_PALETTES[0]);
  });

  it('getPaletteById returns undefined for non-existent id', () => {
    const { result } = renderHook(() => usePalettes());
    const palette = result.current.getPaletteById('non-existent-id');
    expect(palette).toBeUndefined();
  });

  it('getColorsForSegments returns colors cyclically when segments > colors', () => {
    const { result } = renderHook(() => usePalettes());
    // Use first default palette
    const paletteId = DEFAULT_PALETTES[0]!.id;
    const paletteColors = DEFAULT_PALETTES[0]!.colors;
    
    const colors = result.current.getColorsForSegments(paletteId, 8);
    expect(colors).toHaveLength(8);
    // First colors match palette
    expect(colors[0]).toBe(paletteColors[0]);
    expect(colors[1]).toBe(paletteColors[1]);
    // Colors cycle
    expect(colors[6]).toBe(paletteColors[0]); // 6 % 6 = 0
    expect(colors[7]).toBe(paletteColors[1]); // 7 % 6 = 1
  });

  it('getColorsForSegments returns subset when segments < colors', () => {
    const { result } = renderHook(() => usePalettes());
    const paletteId = DEFAULT_PALETTES[0]!.id;
    const paletteColors = DEFAULT_PALETTES[0]!.colors;
    
    const colors = result.current.getColorsForSegments(paletteId, 3);
    expect(colors).toHaveLength(3);
    expect(colors[0]).toBe(paletteColors[0]);
    expect(colors[1]).toBe(paletteColors[1]);
    expect(colors[2]).toBe(paletteColors[2]);
  });

  it('getColorsForSegments returns empty array for invalid palette', () => {
    const { result } = renderHook(() => usePalettes());
    const colors = result.current.getColorsForSegments('invalid-id', 5);
    expect(colors).toEqual([]);
  });

  it('getColorsForSegments returns empty array for zero segments', () => {
    const { result } = renderHook(() => usePalettes());
    const colors = result.current.getColorsForSegments(DEFAULT_PALETTES[0]!.id, 0);
    expect(colors).toEqual([]);
  });

  it('getColorsForSegments returns empty array for palette with empty colors array', () => {
    const emptyPalette = {
      id: 'empty-colors',
      name: 'Empty Palette',
      colors: [],
      createdAt: Date.now(),
      isDefault: false,
    };
    localStorage.setItem('vibe-spin:palettes', JSON.stringify([emptyPalette]));

    const { result } = renderHook(() => usePalettes());
    const colors = result.current.getColorsForSegments('empty-colors', 5);
    expect(colors).toEqual([]);
  });

  it('persists custom palettes to localStorage', () => {
    const { result } = renderHook(() => usePalettes());
    act(() => {
      result.current.createPalette('Persisted', ['#123456']);
    });
    
    const stored = JSON.parse(localStorage.getItem('vibe-spin:palettes')!);
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Persisted');
  });

  it('loads custom palettes from localStorage on mount', () => {
    const customPalette = {
      id: 'custom-test',
      name: 'Loaded Palette',
      colors: ['#aabbcc'],
      createdAt: Date.now(),
      isDefault: false,
    };
    localStorage.setItem('vibe-spin:palettes', JSON.stringify([customPalette]));

    const { result } = renderHook(() => usePalettes());
    expect(result.current.customPalettes).toHaveLength(1);
    expect(result.current.customPalettes[0]!.name).toBe('Loaded Palette');
  });

  it('handles invalid localStorage JSON gracefully', () => {
    localStorage.setItem('vibe-spin:palettes', 'not-valid-json');
    const { result } = renderHook(() => usePalettes());
    expect(result.current.customPalettes).toHaveLength(0);
    expect(result.current.palettes.length).toBe(DEFAULT_PALETTES.length);
  });

  it('palettes array contains both default and custom palettes', () => {
    const { result } = renderHook(() => usePalettes());
    act(() => {
      result.current.createPalette('Custom1', ['#111']);
      result.current.createPalette('Custom2', ['#222']);
    });
    
    expect(result.current.palettes.length).toBe(DEFAULT_PALETTES.length + 2);
  });
});
