import { useState, useCallback } from 'react';

export interface SpinEntry {
  id: string;
  wheelName: string;
  label: string;
  color: string;
  ts: number;
}

const STORAGE_KEY = 'vibe-spin:history';
const MAX_ENTRIES = 200;

function loadHistory(): SpinEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SpinEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: SpinEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useSpinHistory() {
  const [history, setHistory] = useState<SpinEntry[]>(loadHistory);

  const addEntry = useCallback((entry: Omit<SpinEntry, 'id' | 'ts'>) => {
    const newEntry: SpinEntry = {
      ...entry,
      id: crypto.randomUUID(),
      ts: Date.now(),
    };
    setHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, MAX_ENTRIES);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, addEntry, clearHistory };
}
