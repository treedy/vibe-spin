import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, beforeEach, expect } from 'vitest';
import App from './App';

function openTermsModal() {
  const termsLink = screen.getByRole('link', { name: 'Terms' });
  fireEvent.click(termsLink);
  return termsLink;
}

describe('Terms modal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('opens from footer and closes via button and escape with focus restore', async () => {
    render(<App />);

    const termsLink = openTermsModal();
    expect(await screen.findByRole('dialog', { name: 'Terms of service' })).toBeInTheDocument();
    expect(screen.getByText(/service is provided as-is/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Terms of service' })).not.toBeInTheDocument();
    });
    expect(document.activeElement).toBe(termsLink);

    openTermsModal();
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Terms of service' })).not.toBeInTheDocument();
    });
  });

  test('traps focus and closes on backdrop click', async () => {
    const { container } = render(<App />);

    openTermsModal();
    await screen.findByRole('dialog', { name: 'Terms of service' });

    const closeIconButton = screen.getByRole('button', { name: 'Close terms of service' });
    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(document.activeElement).toBe(closeIconButton);

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(closeButton);

    fireEvent.click(container.querySelector('.app-modal-backdrop') as HTMLElement);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Terms of service' })).not.toBeInTheDocument();
    });
  });
});
