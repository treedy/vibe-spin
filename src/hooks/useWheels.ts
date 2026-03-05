import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Segment } from './useSegments';
import { nextSegmentColor } from '../utils/colorUtils';

const WHEELS_KEY = 'vibe-spin:wheels';
const ACTIVE_KEY = 'vibe-spin:activeWheelId';
const MAX_WHEELS = 50;
const DEBOUNCE_MS = 500;

export interface WheelConfig {
  id: string;
  name: string;
  segments: Segment[];
  createdAt: number;
  updatedAt: number;
}

interface WheelsState {
  wheels: WheelConfig[];
  activeId: string;
}

function genId(): string {
  return crypto.randomUUID();
}

function makeDefaultSegments(): Segment[] {
  const pct = 100 / 3;
  return [
    { id: genId(), label: 'Option 1', weight: 1, percentage: pct, color: '#257bf4' },
    { id: genId(), label: 'Option 2', weight: 1, percentage: pct, color: '#00f2ff' },
    { id: genId(), label: 'Option 3', weight: 1, percentage: pct, color: '#6366f1' },
  ];
}

function makeNewWheelName(wheels: WheelConfig[]): string {
  if (wheels.length === 0) return 'My Wheel';
  return `My Wheel ${wheels.length + 1}`;
}

function makeBlankWheel(name: string): WheelConfig {
  const now = Date.now();
  return { id: genId(), name, segments: makeDefaultSegments(), createdAt: now, updatedAt: now };
}

function loadWheels(): WheelConfig[] {
  try {
    const raw = localStorage.getItem(WHEELS_KEY);
    return raw ? (JSON.parse(raw) as WheelConfig[]) : [];
  } catch {
    return [];
  }
}

function saveWheels(wheels: WheelConfig[]): void {
  localStorage.setItem(WHEELS_KEY, JSON.stringify(wheels));
}

function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

function saveActiveId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

function recalcPercentages(segments: Segment[]): Segment[] {
  const total = segments.reduce((sum, s) => sum + s.weight, 0);
  if (total === 0) return segments;
  return segments.map(s => ({ ...s, percentage: (s.weight / total) * 100 }));
}

function initState(): WheelsState {
  const stored = loadWheels();
  if (stored.length > 0) {
    const savedId = loadActiveId();
    const activeId =
      savedId && stored.some(w => w.id === savedId) ? savedId : stored[0]!.id;
    return { wheels: stored, activeId };
  }
  const blank = makeBlankWheel('My Wheel');
  return { wheels: [blank], activeId: blank.id };
}

export function useWheels() {
  const [{ wheels, activeId }, setState] = useState<WheelsState>(initState);
  const [capReached, setCapReached] = useState(false);

  const activeWheel = useMemo(
    () => wheels.find(w => w.id === activeId) ?? wheels[0]!,
    [wheels, activeId]
  );

  // Debounced auto-save for wheels array
  useEffect(() => {
    const timer = setTimeout(() => saveWheels(wheels), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [wheels]);

  // Persist active ID immediately on change
  useEffect(() => {
    saveActiveId(activeId);
  }, [activeId]);

  const setActiveId = useCallback((id: string) => {
    setState(prev => ({ ...prev, activeId: id }));
  }, []);

  const createWheel = useCallback(() => {
    setState(prev => {
      if (prev.wheels.length >= MAX_WHEELS) {
        setCapReached(true);
        return prev;
      }
      setCapReached(false);
      const name = makeNewWheelName(prev.wheels);
      const newWheel = makeBlankWheel(name);
      return { wheels: [...prev.wheels, newWheel], activeId: newWheel.id };
    });
  }, []);

  const deleteWheel = useCallback((id: string) => {
    setState(prev => {
      const filtered = prev.wheels.filter(w => w.id !== id);
      if (filtered.length === 0) {
        const blank = makeBlankWheel('My Wheel');
        return { wheels: [blank], activeId: blank.id };
      }
      const newActiveId =
        prev.activeId === id ? filtered[filtered.length - 1]!.id : prev.activeId;
      return { wheels: filtered, activeId: newActiveId };
    });
  }, []);

  const renameWheel = useCallback((id: string, name: string) => {
    setState(prev => ({
      ...prev,
      wheels: prev.wheels.map(w =>
        w.id === id ? { ...w, name, updatedAt: Date.now() } : w
      ),
    }));
  }, []);

  const updateSegments = useCallback((updater: (prev: Segment[]) => Segment[]) => {
    setState(prev => ({
      ...prev,
      wheels: prev.wheels.map(w =>
        w.id === prev.activeId
          ? { ...w, segments: updater(w.segments), updatedAt: Date.now() }
          : w
      ),
    }));
  }, []);

  const updateWeight = useCallback(
    (index: number, weight: number) => {
      updateSegments(prev => {
        const newSegments = [...prev];
        const current = newSegments[index];
        if (!current) return prev;
        newSegments[index] = { ...current, weight };
        return recalcPercentages(newSegments);
      });
    },
    [updateSegments]
  );

  const updateLabel = useCallback(
    (index: number, label: string) => {
      updateSegments(prev => {
        const newSegments = [...prev];
        const current = newSegments[index];
        if (!current) return prev;
        newSegments[index] = { ...current, label };
        return newSegments;
      });
    },
    [updateSegments]
  );

  const updateColor = useCallback(
    (index: number, color: string) => {
      updateSegments(prev => {
        const newSegments = [...prev];
        const current = newSegments[index];
        if (!current) return prev;
        newSegments[index] = { ...current, color };
        return newSegments;
      });
    },
    [updateSegments]
  );

  const updatePercentage = useCallback(
    (index: number, percentage: number) => {
      const p = Math.min(Math.max(percentage, 0.01), 99.99);
      updateSegments(prev => {
        const othersWeight = prev.reduce((sum, s, i) => (i !== index ? sum + s.weight : sum), 0);
        const newWeight = (p * othersWeight) / (100 - p);
        const newSegments = [...prev];
        const current = newSegments[index];
        if (!current) return prev;
        newSegments[index] = { ...current, weight: newWeight };
        return recalcPercentages(newSegments);
      });
    },
    [updateSegments]
  );

  const addSegment = useCallback(() => {
    updateSegments(prev => {
      const id = genId();
      const newSegments = [
        ...prev,
        { id, label: `Option ${prev.length + 1}`, weight: 1, percentage: 0, color: nextSegmentColor(prev) },
      ];
      return recalcPercentages(newSegments);
    });
  }, [updateSegments]);

  const removeSegment = useCallback(
    (index: number) => {
      updateSegments(prev => {
        if (prev.length <= 2) return prev;
        const newSegments = prev.filter((_, i) => i !== index);
        return recalcPercentages(newSegments);
      });
    },
    [updateSegments]
  );

  const setSegments = useCallback(
    (segments: Segment[]) => {
      updateSegments(() => recalcPercentages(segments));
    },
    [updateSegments]
  );

  const resetWeights = useCallback(() => {
    updateSegments(prev => recalcPercentages(prev.map(s => ({ ...s, weight: 1 }))));
  }, [updateSegments]);

  const reorderSegments = useCallback(
    (fromIndex: number, toIndex: number) => {
      updateSegments(prev => {
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) return prev;
        const newSegments = [...prev];
        const [moved] = newSegments.splice(fromIndex, 1);
        newSegments.splice(toIndex, 0, moved!);
        return newSegments;
      });
    },
    [updateSegments]
  );

  return {
    wheels,
    activeId,
    activeWheel,
    capReached,
    setActiveId,
    createWheel,
    deleteWheel,
    renameWheel,
    segments: activeWheel.segments,
    updateWeight,
    updatePercentage,
    updateLabel,
    updateColor,
    addSegment,
    removeSegment,
    resetWeights,
    reorderSegments,
    setSegments,
  };
}
