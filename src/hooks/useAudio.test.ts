import { renderHook, act } from '@testing-library/react';
import { useAudio } from './useAudio';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Minimal Web Audio API mock
function makeAudioContextMock() {
  return {
    state: 'running' as AudioContextState,
    currentTime: 0,
    destination: {},
    createOscillator: vi.fn(() => ({
      connect: vi.fn(),
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      type: 'sine',
      start: vi.fn(),
      stop: vi.fn(),
    })),
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    })),
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

describe('useAudio', () => {
  let AudioContextMock: ReturnType<typeof makeAudioContextMock>;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    AudioContextMock = makeAudioContextMock();
    // Must use function keyword so it can be used as a constructor
    vi.stubGlobal('AudioContext', vi.fn(function() { return AudioContextMock; }));
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults soundsEnabled to true when nothing is stored', () => {
    const { result } = renderHook(() => useAudio());
    expect(result.current.soundsEnabled).toBe(true);
  });

  it('loads persisted soundsEnabled=false from localStorage', () => {
    localStorage.setItem('vibe-spin:settings', JSON.stringify({ soundsEnabled: false }));
    const { result } = renderHook(() => useAudio());
    expect(result.current.soundsEnabled).toBe(false);
  });

  it('toggleSounds flips soundsEnabled and persists to localStorage', () => {
    const { result } = renderHook(() => useAudio());
    act(() => { result.current.toggleSounds(); });
    expect(result.current.soundsEnabled).toBe(false);
    const stored = JSON.parse(localStorage.getItem('vibe-spin:settings')!);
    expect(stored.soundsEnabled).toBe(false);

    act(() => { result.current.toggleSounds(); });
    expect(result.current.soundsEnabled).toBe(true);
  });

  it('play does nothing when soundsEnabled is false', () => {
    localStorage.setItem('vibe-spin:settings', JSON.stringify({ soundsEnabled: false }));
    const { result } = renderHook(() => useAudio());
    act(() => { result.current.play('spin'); });
    expect(AudioContextMock.createOscillator).not.toHaveBeenCalled();
  });

  it('play does nothing when prefers-reduced-motion is set', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const { result } = renderHook(() => useAudio());
    act(() => { result.current.play('spin'); });
    expect(AudioContextMock.createOscillator).not.toHaveBeenCalled();
  });

  it('play spin creates oscillator and triggers audio', () => {
    const { result } = renderHook(() => useAudio());
    act(() => { result.current.play('spin'); });
    expect(AudioContextMock.createOscillator).toHaveBeenCalled();
  });

  it('play win creates multiple oscillators for chord', () => {
    const { result } = renderHook(() => useAudio());
    act(() => { result.current.play('win'); });
    expect(AudioContextMock.createOscillator).toHaveBeenCalledTimes(4);
  });

  it('play is debounced - rapid calls do not overlap', () => {
    const { result } = renderHook(() => useAudio());
    act(() => {
      result.current.play('spin');
      result.current.play('spin');
      result.current.play('spin');
    });
    // Only the first call should have triggered audio
    expect(AudioContextMock.createOscillator).toHaveBeenCalledTimes(1);
  });

  it('play resumes suspended AudioContext before playing', async () => {
    AudioContextMock.state = 'suspended';
    const { result } = renderHook(() => useAudio());
    await act(async () => { result.current.play('spin'); });
    expect(AudioContextMock.resume).toHaveBeenCalled();
  });

  it('toggleSounds preserves other settings in localStorage', () => {
    localStorage.setItem('vibe-spin:settings', JSON.stringify({ otherSetting: 42, soundsEnabled: true }));
    const { result } = renderHook(() => useAudio());
    act(() => { result.current.toggleSounds(); });
    const stored = JSON.parse(localStorage.getItem('vibe-spin:settings')!);
    expect(stored.otherSetting).toBe(42);
    expect(stored.soundsEnabled).toBe(false);
  });
});
