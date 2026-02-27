import { renderHook, act } from '@testing-library/react';
import { useWheels } from './useWheels';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('useWheels', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a default blank wheel on first load', () => {
    const { result } = renderHook(() => useWheels());
    expect(result.current.wheels).toHaveLength(1);
    expect(result.current.wheels[0]!.name).toBe('My Wheel');
    expect(result.current.wheels[0]!.segments).toHaveLength(3);
  });

  it('activeWheel matches the activeId', () => {
    const { result } = renderHook(() => useWheels());
    expect(result.current.activeWheel.id).toBe(result.current.activeId);
  });

  it('createWheel adds a new wheel and makes it active', () => {
    const { result } = renderHook(() => useWheels());
    act(() => {
      result.current.createWheel();
    });
    expect(result.current.wheels).toHaveLength(2);
    expect(result.current.activeId).toBe(result.current.wheels[1]!.id);
    expect(result.current.wheels[1]!.name).toBe('My Wheel 2');
    expect(result.current.wheels[1]!.segments).toHaveLength(3);
  });

  it('deleteWheel removes the specified wheel', () => {
    const { result } = renderHook(() => useWheels());
    act(() => {
      result.current.createWheel();
    });
    const idToDelete = result.current.wheels[0]!.id;
    act(() => {
      result.current.deleteWheel(idToDelete);
    });
    expect(result.current.wheels).toHaveLength(1);
    expect(result.current.wheels.find(w => w.id === idToDelete)).toBeUndefined();
  });

  it('deleting the active wheel activates the most recent remaining wheel', () => {
    const { result } = renderHook(() => useWheels());
    act(() => {
      result.current.createWheel();
    });
    const firstId = result.current.wheels[0]!.id;
    const secondId = result.current.wheels[1]!.id;
    // Second wheel is active after createWheel; delete it
    act(() => {
      result.current.deleteWheel(secondId);
    });
    expect(result.current.activeId).toBe(firstId);
  });

  it('deleting the last wheel creates a new blank wheel', () => {
    const { result } = renderHook(() => useWheels());
    const id = result.current.wheels[0]!.id;
    act(() => {
      result.current.deleteWheel(id);
    });
    expect(result.current.wheels).toHaveLength(1);
    expect(result.current.wheels[0]!.name).toBe('My Wheel');
    expect(result.current.wheels[0]!.id).not.toBe(id);
  });

  it('renameWheel updates the wheel name', () => {
    const { result } = renderHook(() => useWheels());
    const id = result.current.wheels[0]!.id;
    act(() => {
      result.current.renameWheel(id, 'Custom Name');
    });
    expect(result.current.wheels[0]!.name).toBe('Custom Name');
  });

  it('setActiveId switches the active wheel', () => {
    const { result } = renderHook(() => useWheels());
    act(() => {
      result.current.createWheel();
    });
    const firstId = result.current.wheels[0]!.id;
    act(() => {
      result.current.setActiveId(firstId);
    });
    expect(result.current.activeId).toBe(firstId);
  });

  it('updateWeight recalculates percentages for the active wheel', () => {
    const { result } = renderHook(() => useWheels());
    // Default: 3 equal segments, weight=1 each
    act(() => {
      result.current.updateWeight(0, 2);
    });
    // total = 4, first segment = 2/4 = 50%
    expect(result.current.segments[0]!.percentage).toBeCloseTo(50, 1);
    expect(result.current.segments[1]!.percentage).toBeCloseTo(25, 1);
  });

  it('updateLabel updates label without changing percentages', () => {
    const { result } = renderHook(() => useWheels());
    act(() => {
      result.current.updateLabel(0, 'New Label');
    });
    expect(result.current.segments[0]!.label).toBe('New Label');
    expect(result.current.segments[0]!.percentage).toBeCloseTo(100 / 3, 1);
  });

  it('updateColor updates color without changing percentages', () => {
    const { result } = renderHook(() => useWheels());
    act(() => {
      result.current.updateColor(0, '#ff0000');
    });
    expect(result.current.segments[0]!.color).toBe('#ff0000');
  });

  it('addSegment adds a segment and recalculates percentages', () => {
    const { result } = renderHook(() => useWheels());
    act(() => {
      result.current.addSegment();
    });
    expect(result.current.segments).toHaveLength(4);
    const total = result.current.segments.reduce((sum, s) => sum + s.percentage, 0);
    expect(total).toBeCloseTo(100, 5);
  });

  it('removeSegment removes a segment (min 2 enforced)', () => {
    const { result } = renderHook(() => useWheels());
    act(() => {
      result.current.removeSegment(0);
    });
    expect(result.current.segments).toHaveLength(2);
    // Cannot go below 2
    act(() => {
      result.current.removeSegment(0);
    });
    expect(result.current.segments).toHaveLength(2);
  });

  it('caps wheels at 50 and sets capReached', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWheels());
    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.createWheel();
      }
    });
    expect(result.current.wheels).toHaveLength(50);
    expect(result.current.capReached).toBe(true);
  });

  it('persists wheels to localStorage after debounce', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWheels());
    act(() => {
      result.current.createWheel();
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    const stored = JSON.parse(localStorage.getItem('vibe-spin:wheels')!);
    expect(stored).toHaveLength(2);
  });

  it('persists activeId to localStorage immediately', () => {
    const { result } = renderHook(() => useWheels());
    act(() => {
      result.current.createWheel();
    });
    const newActiveId = result.current.activeId;
    expect(localStorage.getItem('vibe-spin:activeWheelId')).toBe(newActiveId);
  });

  it('loads persisted wheels and activeId from localStorage on mount', () => {
    const now = Date.now();
    const wheels = [
      {
        id: 'wheel-abc',
        name: 'Persisted Wheel',
        segments: [
          { id: 's1', label: 'A', weight: 1, percentage: 50, color: '#fff' },
          { id: 's2', label: 'B', weight: 1, percentage: 50, color: '#000' },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ];
    localStorage.setItem('vibe-spin:wheels', JSON.stringify(wheels));
    localStorage.setItem('vibe-spin:activeWheelId', 'wheel-abc');

    const { result } = renderHook(() => useWheels());
    expect(result.current.wheels).toHaveLength(1);
    expect(result.current.wheels[0]!.name).toBe('Persisted Wheel');
    expect(result.current.activeId).toBe('wheel-abc');
  });

  it('falls back to first wheel if stored activeId is invalid', () => {
    const now = Date.now();
    const wheels = [
      {
        id: 'wheel-1',
        name: 'Wheel 1',
        segments: [
          { id: 's1', label: 'A', weight: 1, percentage: 50, color: '#fff' },
          { id: 's2', label: 'B', weight: 1, percentage: 50, color: '#000' },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ];
    localStorage.setItem('vibe-spin:wheels', JSON.stringify(wheels));
    localStorage.setItem('vibe-spin:activeWheelId', 'nonexistent-id');

    const { result } = renderHook(() => useWheels());
    expect(result.current.activeId).toBe('wheel-1');
  });

  it('returns empty array gracefully if localStorage contains invalid JSON', () => {
    localStorage.setItem('vibe-spin:wheels', 'not-valid-json');
    const { result } = renderHook(() => useWheels());
    expect(result.current.wheels).toHaveLength(1); // creates default blank wheel
  });
});
