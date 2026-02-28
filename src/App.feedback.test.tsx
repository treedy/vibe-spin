import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, beforeEach, expect } from 'vitest';
import App from './App';

function openFeedbackModal() {
  const feedbackLink = screen.getByRole('link', { name: 'Feedback' });
  fireEvent.click(feedbackLink);
  return feedbackLink;
}

describe('Feedback modal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('opens from footer and closes via button and escape with focus restore', async () => {
    render(<App />);

    const feedbackLink = openFeedbackModal();
    expect(await screen.findByRole('dialog', { name: 'Feedback' })).toBeInTheDocument();
    expect(screen.getByText(/feature request or found a problem/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Feedback' })).not.toBeInTheDocument();
    });
    expect(document.activeElement).toBe(feedbackLink);

    openFeedbackModal();
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Feedback' })).not.toBeInTheDocument();
    });
  });

  test('contains a GitHub link with correct attributes', async () => {
    render(<App />);

    openFeedbackModal();
    await screen.findByRole('dialog', { name: 'Feedback' });

    const githubLink = screen.getByRole('link', { name: /Submit an Issue on GitHub/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/treedy/vibe-spin/issues');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('traps focus and closes on backdrop click', async () => {
    const { container } = render(<App />);

    openFeedbackModal();
    await screen.findByRole('dialog', { name: 'Feedback' });

    const closeIconButton = screen.getByRole('button', { name: 'Close feedback' });
    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(document.activeElement).toBe(closeIconButton);

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(closeButton);

    fireEvent.click(container.querySelector('.app-modal-backdrop') as HTMLElement);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Feedback' })).not.toBeInTheDocument();
    });
  });
});
