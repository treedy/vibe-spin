import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, beforeEach, expect } from 'vitest';
import App from './App';

function openPrivacyModal() {
  const privacyLink = screen.getByRole('link', { name: 'Privacy' });
  fireEvent.click(privacyLink);
  return privacyLink;
}

describe('Privacy modal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('opens from footer and closes via button and escape with focus restore', async () => {
    render(<App />);

    const privacyLink = openPrivacyModal();
    expect(await screen.findByRole('dialog', { name: 'Privacy policy' })).toBeInTheDocument();
    expect(screen.getByText(/runs entirely in your browser/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Privacy policy' })).not.toBeInTheDocument();
    });
    expect(document.activeElement).toBe(privacyLink);

    openPrivacyModal();
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Privacy policy' })).not.toBeInTheDocument();
    });
  });

  test('traps focus and closes on backdrop click', async () => {
    const { container } = render(<App />);

    openPrivacyModal();
    await screen.findByRole('dialog', { name: 'Privacy policy' });

    const closeIconButton = screen.getByRole('button', { name: 'Close privacy policy' });
    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(document.activeElement).toBe(closeIconButton);

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(closeButton);

    fireEvent.click(container.querySelector('.app-modal-backdrop') as HTMLElement);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Privacy policy' })).not.toBeInTheDocument();
    });
  });
});
