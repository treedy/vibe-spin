import { useState, useRef, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'vibe-spin:settings';

export type SoundType = 'spin' | 'win';

const DEBOUNCE_MS: Record<SoundType, number> = {
  spin: 500,
  win: 1000,
};

function loadSoundsEnabled(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed.soundsEnabled !== false;
  } catch {
    return true;
  }
}

function saveSoundsEnabled(value: boolean): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, soundsEnabled: value }));
  } catch {
    // ignore storage errors
  }
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function playSpinSound(ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

function playWinSound(ctx: AudioContext): void {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    const start = ctx.currentTime + i * 0.12;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

export function useAudio() {
  const [soundsEnabled, setSoundsEnabled] = useState<boolean>(loadSoundsEnabled);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastPlayRef = useRef<Partial<Record<SoundType, number>>>({});

  const getOrCreateContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined' || !window.AudioContext) return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const play = useCallback((sound: SoundType): void => {
    if (!soundsEnabled || prefersReducedMotion()) return;

    const now = Date.now();
    const last = lastPlayRef.current[sound] ?? 0;
    if (now - last < DEBOUNCE_MS[sound]) return;
    lastPlayRef.current[sound] = now;

    const ctx = getOrCreateContext();
    if (!ctx) return;

    const dispatch = () => {
      if (sound === 'spin') playSpinSound(ctx);
      else playWinSound(ctx);
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(dispatch).catch(() => undefined);
    } else {
      dispatch();
    }
  }, [soundsEnabled, getOrCreateContext]);

  const toggleSounds = useCallback((): void => {
    setSoundsEnabled(prev => {
      const next = !prev;
      saveSoundsEnabled(next);
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close().catch(() => undefined);
    };
  }, []);

  return { soundsEnabled, toggleSounds, play };
}
