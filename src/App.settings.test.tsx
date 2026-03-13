import React from 'react';
import {
  DEFAULT_SPIN_DURATION_MS,
  MIN_CUSTOM_SPIN_DURATION_MS,
  MAX_CUSTOM_SPIN_DURATION_MS,
} from './hooks/useAudio';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, test, beforeEach, afterEach, expect, vi } from 'vitest';
import App from './App';

function openSettingsModal() {
  const settingsBtn = screen.getByRole('button', { name: /settings/i });
  fireEvent.click(settingsBtn);
  return settingsBtn;
}

describe('Settings modal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('opens from Settings button and closes via button', async () => {
    render(<App />);

    openSettingsModal();
    expect(
      await screen.findByRole('dialog', { name: 'Settings' })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Settings' })
      ).not.toBeInTheDocument();
    });
  });

  test('closes on Escape key', async () => {
    render(<App />);

    openSettingsModal();
    await screen.findByRole('dialog', { name: 'Settings' });

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Settings' })
      ).not.toBeInTheDocument();
    });
  });

  test('backdrop click does NOT close the Settings modal', async () => {
    const { container } = render(<App />);

    openSettingsModal();
    await screen.findByRole('dialog', { name: 'Settings' });

    fireEvent.click(
      container.querySelector('.app-modal-backdrop') as HTMLElement
    );
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Settings' })
      ).toBeInTheDocument();
    });
  });

  test('restores focus to Settings button after close', async () => {
    render(<App />);

    const settingsBtn = openSettingsModal();
    await screen.findByRole('dialog', { name: 'Settings' });

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Settings' })
      ).not.toBeInTheDocument();
    });
    expect(document.activeElement).toBe(settingsBtn);
  });

  test('Sound Effects toggle is present and toggleable', async () => {
    render(<App />);

    openSettingsModal();
    await screen.findByRole('dialog', { name: 'Settings' });

    const soundToggle = screen.getByRole('switch', { name: 'Sound Effects' });
    expect(soundToggle).toBeInTheDocument();
    expect(soundToggle).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(soundToggle);
    expect(soundToggle).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(soundToggle);
    expect(soundToggle).toHaveAttribute('aria-checked', 'true');
  });

  test('Celebration toggle is present and toggleable', async () => {
    render(<App />);

    openSettingsModal();
    await screen.findByRole('dialog', { name: 'Settings' });

    const celebrationToggle = screen.getByRole('switch', {
      name: 'Celebration',
    });
    expect(celebrationToggle).toBeInTheDocument();
    expect(celebrationToggle).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(celebrationToggle);
    expect(celebrationToggle).toHaveAttribute('aria-checked', 'false');
  });

  test('toggle state persists in localStorage', async () => {
    render(<App />);

    openSettingsModal();
    await screen.findByRole('dialog', { name: 'Settings' });

    const soundToggle = screen.getByRole('switch', { name: 'Sound Effects' });
    fireEvent.click(soundToggle);

    const stored = JSON.parse(
      localStorage.getItem('vibe-spin:settings') ?? '{}'
    ) as Record<string, unknown>;
    expect(stored.soundsEnabled).toBe(false);

    const celebrationToggle = screen.getByRole('switch', {
      name: 'Celebration',
    });
    fireEvent.click(celebrationToggle);

    const stored2 = JSON.parse(
      localStorage.getItem('vibe-spin:settings') ?? '{}'
    ) as Record<string, unknown>;
    expect(stored2.celebrationEnabled).toBe(false);
  });

  test('spin duration persists in localStorage when customized', async () => {
    render(<App />);

    openSettingsModal();
    await screen.findByRole('dialog', { name: 'Settings' });

    const spinDurationInput = screen.getByRole('spinbutton', {
      name: 'Spin Duration (seconds)',
    });
    fireEvent.change(spinDurationInput, {
      target: { value: String(MIN_CUSTOM_SPIN_DURATION_MS / 1000) },
    });

    const stored = JSON.parse(
      localStorage.getItem('vibe-spin:settings') ?? '{}'
    ) as Record<string, unknown>;
    expect(stored.spinDurationMs).toBe(MIN_CUSTOM_SPIN_DURATION_MS);
  });

  test('default spin timing remains unchanged until duration is customized', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Spin the Wheel' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEFAULT_SPIN_DURATION_MS - 1);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.getByRole('status')).toHaveTextContent('Option 1');
  });

  test('custom spin duration controls when the winner is revealed', async () => {
    render(<App />);

    openSettingsModal();
    await screen.findByRole('dialog', { name: 'Settings' });

    const spinDurationInput = screen.getByRole('spinbutton', {
      name: 'Spin Duration (seconds)',
    });
    fireEvent.change(spinDurationInput, {
      target: { value: String(MAX_CUSTOM_SPIN_DURATION_MS / 1000) },
    });

    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    fireEvent.click(screen.getByRole('button', { name: 'Spin the Wheel' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(MAX_CUSTOM_SPIN_DURATION_MS - 1);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.getByRole('status')).toHaveTextContent('Option 1');
  });

  test('inline settings row is no longer visible in the main UI', () => {
    render(<App />);
    // The toggles should NOT appear outside the modal
    expect(
      screen.queryByRole('switch', { name: 'Sound Effects' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('switch', { name: 'Celebration' })
    ).not.toBeInTheDocument();
  });

  describe('Export All', () => {
    test('Export All button is visible in the Settings modal', async () => {
      render(<App />);
      openSettingsModal();
      await screen.findByRole('dialog', { name: 'Settings' });

      expect(
        screen.getByRole('button', { name: 'Export All' })
      ).toBeInTheDocument();
    });

    test('clicking Export All triggers a JSON file download', async () => {
      const createObjectURL = vi.fn().mockReturnValue('blob:mock-export-url');
      const revokeObjectURL = vi.fn();
      vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

      localStorage.setItem(
        'vibe-spin:wheels',
        JSON.stringify([{ id: 'w1', name: 'Wheel 1', segments: [] }])
      );
      localStorage.setItem('vibe-spin:activeWheelId', 'w1');

      render(<App />);
      openSettingsModal();
      await screen.findByRole('dialog', { name: 'Settings' });

      fireEvent.click(screen.getByRole('button', { name: 'Export All' }));

      expect(createObjectURL).toHaveBeenCalledOnce();
      const blob: Blob = createObjectURL.mock.calls[0]![0] as Blob;
      expect(blob.type).toBe('application/json');
      expect(clickSpy).toHaveBeenCalledOnce();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-export-url');
    });

    test('exported JSON contains wheels, palettes, settings but not history', async () => {
      const blobs: Blob[] = [];
      vi.stubGlobal('URL', {
        ...URL,
        createObjectURL: vi.fn((b: Blob) => {
          blobs.push(b);
          return 'blob:mock';
        }),
        revokeObjectURL: vi.fn(),
      });
      vi.spyOn(HTMLAnchorElement.prototype, 'click');

      localStorage.setItem(
        'vibe-spin:wheels',
        JSON.stringify([{ id: 'w1', name: 'Test Wheel', segments: [] }])
      );
      localStorage.setItem('vibe-spin:activeWheelId', 'w1');
      localStorage.setItem(
        'vibe-spin:palettes',
        JSON.stringify([{ id: 'p1', name: 'Palette' }])
      );
      localStorage.setItem(
        'vibe-spin:history',
        JSON.stringify([{ id: 'h1', label: 'Entry' }])
      );

      render(<App />);
      openSettingsModal();
      await screen.findByRole('dialog', { name: 'Settings' });

      fireEvent.click(screen.getByRole('button', { name: 'Export All' }));

      expect(blobs).toHaveLength(1);
      const text = await blobs[0]!.text();
      const payload = JSON.parse(text) as Record<string, unknown>;

      expect(payload.version).toBe(1);
      expect(payload.exportedAt).toBeDefined();
      expect(Array.isArray(payload.wheels)).toBe(true);
      expect(Array.isArray(payload.palettes)).toBe(true);
      expect(typeof payload.settings).toBe('object');
      expect(payload).not.toHaveProperty('history');
    });

    test('exported filename includes the current date', async () => {
      const anchors: HTMLAnchorElement[] = [];
      vi.stubGlobal('URL', {
        ...URL,
        createObjectURL: vi.fn(() => 'blob:mock'),
        revokeObjectURL: vi.fn(),
      });
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
        function (this: HTMLAnchorElement) {
          anchors.push(this);
        }
      );

      render(<App />);
      openSettingsModal();
      await screen.findByRole('dialog', { name: 'Settings' });

      fireEvent.click(screen.getByRole('button', { name: 'Export All' }));

      expect(anchors).toHaveLength(1);
      const date = new Date().toISOString().slice(0, 10);
      expect(anchors[0]!.download).toBe(`vibe-spin-export-${date}.json`);
    });
  });

  describe('Import', () => {
    const validPayload = {
      version: 1,
      exportedAt: '2026-01-01T00:00:00.000Z',
      wheels: [{ id: 'w1', name: 'Imported Wheel', segments: [] }],
      activeWheelId: 'w1',
      palettes: [],
      settings: { soundsEnabled: true },
    };

    /** Replaces the global FileReader with a synchronous stub. */
    function stubFileReader(content: string) {
      class SyncFileReader {
        result: string | null = null;
        onload: ((e: { target: { result: string } }) => void) | null = null;
        readAsText(_file: Blob) {
          this.result = content;
          this.onload?.({ target: { result: content } });
        }
      }
      vi.stubGlobal('FileReader', SyncFileReader);
    }

    /** Simulates the user picking a file via the hidden input. */
    function pickFile(content: string, name = 'export.json') {
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File([content], name, { type: 'application/json' });
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        configurable: true,
      });
      fireEvent.change(fileInput);
    }

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    test('Import button is visible in the Settings modal', async () => {
      render(<App />);
      openSettingsModal();
      await screen.findByRole('dialog', { name: 'Settings' });

      expect(
        screen.getByRole('button', { name: 'Import' })
      ).toBeInTheDocument();
    });

    test('valid import file shows inline confirmation', async () => {
      stubFileReader(JSON.stringify(validPayload));
      localStorage.setItem(
        'vibe-spin:wheels',
        JSON.stringify(validPayload.wheels)
      );
      localStorage.setItem(
        'vibe-spin:activeWheelId',
        validPayload.activeWheelId
      );

      render(<App />);
      openSettingsModal();
      await screen.findByRole('dialog', { name: 'Settings' });

      pickFile(JSON.stringify(validPayload));

      await waitFor(() => {
        expect(
          screen.getByRole('region', { name: 'Confirm import' })
        ).toBeInTheDocument();
      });
      expect(
        screen.getByRole('button', { name: 'Yes, Overwrite' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel import' })
      ).toBeInTheDocument();
    });

    test('confirming import writes localStorage keys and reloads', async () => {
      const reloadSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { ...window.location, reload: reloadSpy },
        configurable: true,
        writable: true,
      });

      stubFileReader(JSON.stringify(validPayload));
      localStorage.setItem(
        'vibe-spin:wheels',
        JSON.stringify(validPayload.wheels)
      );
      localStorage.setItem(
        'vibe-spin:activeWheelId',
        validPayload.activeWheelId
      );

      render(<App />);
      openSettingsModal();
      await screen.findByRole('dialog', { name: 'Settings' });

      pickFile(JSON.stringify(validPayload));
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Yes, Overwrite' })
        ).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole('button', { name: 'Yes, Overwrite' }));

      expect(
        JSON.parse(localStorage.getItem('vibe-spin:wheels') ?? '[]')
      ).toEqual(validPayload.wheels);
      expect(localStorage.getItem('vibe-spin:activeWheelId')).toBe('w1');
      expect(
        JSON.parse(localStorage.getItem('vibe-spin:palettes') ?? '[]')
      ).toEqual(validPayload.palettes);
      expect(
        JSON.parse(localStorage.getItem('vibe-spin:settings') ?? '{}')
      ).toEqual(validPayload.settings);
      expect(reloadSpy).toHaveBeenCalledOnce();
    });

    test('cancelling import clears the confirmation and writes nothing', async () => {
      const existingWheels = [
        {
          id: 'old',
          name: 'Old Wheel',
          segments: [
            { id: 's1', label: 'A', weight: 1, percentage: 100, color: '#fff' },
          ],
          createdAt: 0,
          updatedAt: 0,
        },
      ];
      localStorage.setItem('vibe-spin:wheels', JSON.stringify(existingWheels));

      stubFileReader(JSON.stringify(validPayload));

      render(<App />);
      openSettingsModal();
      await screen.findByRole('dialog', { name: 'Settings' });

      pickFile(JSON.stringify(validPayload));
      await waitFor(() =>
        expect(
          screen.getByRole('region', { name: 'Confirm import' })
        ).toBeInTheDocument()
      );

      fireEvent.click(screen.getByRole('button', { name: 'Cancel import' }));

      expect(
        screen.queryByRole('region', { name: 'Confirm import' })
      ).not.toBeInTheDocument();
      // Original wheels still intact
      expect(
        JSON.parse(localStorage.getItem('vibe-spin:wheels') ?? '[]')
      ).toEqual(existingWheels);
    });

    test('invalid JSON shows an error and no confirmation', async () => {
      const badContent = 'not valid json {{{';
      stubFileReader(badContent);

      render(<App />);
      openSettingsModal();
      await screen.findByRole('dialog', { name: 'Settings' });

      pickFile(badContent, 'bad.json');

      await waitFor(() =>
        expect(screen.getByRole('alert')).toBeInTheDocument()
      );
      expect(
        screen.queryByRole('region', { name: 'Confirm import' })
      ).not.toBeInTheDocument();
    });

    test('JSON with wrong shape shows an error and no confirmation', async () => {
      const badPayload = JSON.stringify({ version: 2, wheels: 'not-an-array' });
      stubFileReader(badPayload);

      render(<App />);
      openSettingsModal();
      await screen.findByRole('dialog', { name: 'Settings' });

      pickFile(badPayload, 'bad.json');

      await waitFor(() =>
        expect(screen.getByRole('alert')).toBeInTheDocument()
      );
      expect(
        screen.queryByRole('region', { name: 'Confirm import' })
      ).not.toBeInTheDocument();
    });
  });
});
