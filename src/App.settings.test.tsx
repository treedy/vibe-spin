import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, beforeEach, expect } from 'vitest';
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

  test('opens from Settings button and closes via button', async () => {
    render(<App />);

    openSettingsModal();
    expect(await screen.findByRole('dialog', { name: 'Settings' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();
    });
  });

  test('closes on Escape key', async () => {
    render(<App />);

    openSettingsModal();
    await screen.findByRole('dialog', { name: 'Settings' });

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();
    });
  });

  test('closes on backdrop click', async () => {
    const { container } = render(<App />);

    openSettingsModal();
    await screen.findByRole('dialog', { name: 'Settings' });

    fireEvent.click(container.querySelector('.app-modal-backdrop') as HTMLElement);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();
    });
  });

  test('restores focus to Settings button after close', async () => {
    render(<App />);

    const settingsBtn = openSettingsModal();
    await screen.findByRole('dialog', { name: 'Settings' });

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();
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

    const celebrationToggle = screen.getByRole('switch', { name: 'Celebration' });
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

    const stored = JSON.parse(localStorage.getItem('vibe-spin:settings') ?? '{}') as Record<string, unknown>;
    expect(stored.soundsEnabled).toBe(false);

    const celebrationToggle = screen.getByRole('switch', { name: 'Celebration' });
    fireEvent.click(celebrationToggle);

    const stored2 = JSON.parse(localStorage.getItem('vibe-spin:settings') ?? '{}') as Record<string, unknown>;
    expect(stored2.celebrationEnabled).toBe(false);
  });

  test('inline settings row is no longer visible in the main UI', () => {
    render(<App />);
    // The toggles should NOT appear outside the modal
    expect(screen.queryByRole('switch', { name: 'Sound Effects' })).not.toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: 'Celebration' })).not.toBeInTheDocument();
  });
});
