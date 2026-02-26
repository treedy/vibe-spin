import { renderHook, act } from '@testing-library/react';
import { useSpinHistory } from './useSpinHistory';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('useSpinHistory', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('starts with empty history when localStorage is empty', () => {
    const { result } = renderHook(() => useSpinHistory());
    expect(result.current.history).toHaveLength(0);
  });

  it('adds a new entry and persists it to localStorage', () => {
    const { result } = renderHook(() => useSpinHistory());
    act(() => {
      result.current.addEntry({ label: 'Pizza', color: '#ff5733', wheelName: 'Lunch' });
    });
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].label).toBe('Pizza');
    expect(result.current.history[0].color).toBe('#ff5733');
    expect(result.current.history[0].wheelName).toBe('Lunch');
    expect(result.current.history[0].id).toBeTruthy();
    expect(result.current.history[0].ts).toBeGreaterThan(0);

    const stored = JSON.parse(localStorage.getItem('vibe-spin:history')!);
    expect(stored).toHaveLength(1);
    expect(stored[0].label).toBe('Pizza');
  });

  it('prepends new entries so newest is first', () => {
    const { result } = renderHook(() => useSpinHistory());
    act(() => {
      result.current.addEntry({ label: 'First', color: '#aaa', wheelName: 'W' });
    });
    act(() => {
      result.current.addEntry({ label: 'Second', color: '#bbb', wheelName: 'W' });
    });
    expect(result.current.history[0].label).toBe('Second');
    expect(result.current.history[1].label).toBe('First');
  });

  it('caps history at 200 entries', () => {
    const { result } = renderHook(() => useSpinHistory());
    act(() => {
      for (let i = 0; i < 205; i++) {
        result.current.addEntry({ label: `Item ${i}`, color: '#fff', wheelName: 'W' });
      }
    });
    expect(result.current.history).toHaveLength(200);
  });

  it('clearHistory wipes state and localStorage', () => {
    const { result } = renderHook(() => useSpinHistory());
    act(() => {
      result.current.addEntry({ label: 'Pizza', color: '#ff5733', wheelName: 'Lunch' });
    });
    act(() => {
      result.current.clearHistory();
    });
    expect(result.current.history).toHaveLength(0);
    expect(localStorage.getItem('vibe-spin:history')).toBeNull();
  });

  it('loads persisted history from localStorage on mount', () => {
    const stored = [
      { id: 'abc', label: 'Sushi', color: '#33ff57', wheelName: 'Lunch', ts: 1000 },
    ];
    localStorage.setItem('vibe-spin:history', JSON.stringify(stored));

    const { result } = renderHook(() => useSpinHistory());
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].label).toBe('Sushi');
  });

  it('returns empty history if localStorage contains invalid JSON', () => {
    localStorage.setItem('vibe-spin:history', 'not-valid-json');
    const { result } = renderHook(() => useSpinHistory());
    expect(result.current.history).toHaveLength(0);
  });
});
