import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { HistoryDrawer } from './HistoryDrawer';
import type { SpinEntry } from '../hooks/useSpinHistory';

const noop = () => {};

const makeEntry = (overrides: Partial<SpinEntry> = {}): SpinEntry => ({
  id: '1',
  wheelName: 'Lunch Wheel',
  label: 'Pizza',
  color: '#ff0000',
  ts: Date.now(),
  ...overrides,
});

describe('HistoryDrawer', () => {
  test('renders wheel name with preserved capitalization', () => {
    const entry = makeEntry({ wheelName: 'Lunch Wheel' });
    render(<HistoryDrawer isOpen history={[entry]} onClose={noop} onClearHistory={noop} />);
    expect(screen.getByText('Lunch Wheel')).toBeInTheDocument();
  });

  test('renders mixed-case wheel name without forced uppercase', () => {
    const entry = makeEntry({ wheelName: 'MyWheel' });
    render(<HistoryDrawer isOpen history={[entry]} onClose={noop} onClearHistory={noop} />);
    const el = screen.getByText('MyWheel');
    expect(el).toBeInTheDocument();
    expect(el).not.toHaveStyle({ textTransform: 'uppercase' });
  });

  test('renders all-caps wheel name as stored', () => {
    const entry = makeEntry({ wheelName: 'ALL CAPS' });
    render(<HistoryDrawer isOpen history={[entry]} onClose={noop} onClearHistory={noop} />);
    expect(screen.getByText('ALL CAPS')).toBeInTheDocument();
  });

  test('renders spin label as stored', () => {
    const entry = makeEntry({ label: 'Deep Ocean' });
    render(<HistoryDrawer isOpen history={[entry]} onClose={noop} onClearHistory={noop} />);
    expect(screen.getByText('Deep Ocean')).toBeInTheDocument();
  });
});
