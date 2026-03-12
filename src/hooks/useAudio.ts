import { useState, useRef, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'vibe-spin:settings';
export const DEFAULT_SPIN_DURATION_MS = 1500;
export const MIN_SPIN_DURATION_MS = 2000;
export const MAX_SPIN_DURATION_MS = 10000;

export type SoundType = 'spin' | 'win';

type StoredSettings = {
  soundsEnabled?: boolean;
  celebrationEnabled?: boolean;
  spinDurationMs?: number | null;
};

const DEBOUNCE_MS: Record<SoundType, number> = {
  spin: 500,
  win: 1000,
};

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function readSettings(): StoredSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSettings) : {};
  } catch {
    return {};
  }
}

function saveSettings(settings: StoredSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}

function saveSettingsPatch(patch: Partial<StoredSettings>): void {
  const nextSettings = { ...readSettings(), ...patch };
  if (patch.spinDurationMs == null) {
    delete nextSettings.spinDurationMs;
  }
  saveSettings(nextSettings);
}

function clampSpinDurationMs(value: number): number {
  return Math.min(MAX_SPIN_DURATION_MS, Math.max(MIN_SPIN_DURATION_MS, value));
}

function loadSoundsEnabled(): boolean {
  return readSettings().soundsEnabled !== false;
}

function saveSoundsEnabled(value: boolean): void {
  saveSettingsPatch({ soundsEnabled: value });
}

function loadCelebrationEnabled(): boolean {
  return readSettings().celebrationEnabled !== false;
}

function saveCelebrationEnabled(value: boolean): void {
  saveSettingsPatch({ celebrationEnabled: value });
}

function loadSpinDurationMs(): number | null {
  const spinDurationMs = readSettings().spinDurationMs;
  if (
    typeof spinDurationMs !== 'number' ||
    !Number.isFinite(spinDurationMs) ||
    spinDurationMs < MIN_SPIN_DURATION_MS ||
    spinDurationMs > MAX_SPIN_DURATION_MS
  ) {
    return null;
  }

  return spinDurationMs;
}

function saveSpinDurationMs(value: number | null): void {
  saveSettingsPatch({
    spinDurationMs:
      value == null ? null : clampSpinDurationMs(Math.round(value)),
  });
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
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
  const [soundsEnabled, setSoundsEnabled] =
    useState<boolean>(loadSoundsEnabled);
  const [celebrationEnabled, setCelebrationEnabled] = useState<boolean>(
    loadCelebrationEnabled
  );
  const [spinDurationMs, setSpinDurationMs] = useState<number | null>(
    loadSpinDurationMs
  );
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastPlayRef = useRef<Partial<Record<SoundType, number>>>({});

  const getOrCreateContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    const audioWindow = window as AudioWindow;
    const AudioCtxClass =
      audioWindow.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioCtxClass) return null;
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioCtxClass();
    }
    return audioCtxRef.current;
  }, []);

  const play = useCallback(
    (sound: SoundType): void => {
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
        ctx
          .resume()
          .then(dispatch)
          .catch(() => undefined);
      } else {
        dispatch();
      }
    },
    [soundsEnabled, getOrCreateContext]
  );

  const toggleSounds = useCallback((): void => {
    setSoundsEnabled((prev) => {
      const next = !prev;
      saveSoundsEnabled(next);
      return next;
    });
  }, []);

  const toggleCelebration = useCallback((): void => {
    setCelebrationEnabled((prev) => {
      const next = !prev;
      saveCelebrationEnabled(next);
      return next;
    });
  }, []);

  const updateSpinDurationMs = useCallback((value: number | null): void => {
    setSpinDurationMs(() => {
      const nextValue =
        value == null ? null : clampSpinDurationMs(Math.round(value));
      saveSpinDurationMs(nextValue);
      return nextValue;
    });
  }, []);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close().catch(() => undefined);
    };
  }, []);

  return {
    soundsEnabled,
    toggleSounds,
    celebrationEnabled,
    toggleCelebration,
    spinDurationMs,
    updateSpinDurationMs,
    play,
  };
}
