import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { SegmentTable } from './SegmentTable';
import type { Segment } from '../hooks/useSegments';

const noop = () => {};

const makeSegment = (overrides: Partial<Segment> = {}): Segment => ({
  id: '1',
  label: 'Pizza',
  weight: 1,
  percentage: 50,
  color: '#ff0000',
  ...overrides,
});

describe('SegmentTable', () => {
  test('renders segment label with preserved capitalization', () => {
    const segments = [makeSegment({ id: '1', label: 'Lunch Wheel' }), makeSegment({ id: '2', label: 'Sushi' })];
    render(
      <SegmentTable
        segments={segments}
        onUpdateWeight={noop}
        onUpdatePercentage={noop}
        onUpdateLabel={noop}
        onUpdateColor={noop}
        onAddSegment={noop}
        onRemoveSegment={noop}
      />
    );
    expect(screen.getByDisplayValue('Lunch Wheel')).toBeInTheDocument();
  });

  test('renders mixed-case segment label as stored', () => {
    const segments = [makeSegment({ id: '1', label: 'MySegment' }), makeSegment({ id: '2', label: 'Other' })];
    render(
      <SegmentTable
        segments={segments}
        onUpdateWeight={noop}
        onUpdatePercentage={noop}
        onUpdateLabel={noop}
        onUpdateColor={noop}
        onAddSegment={noop}
        onRemoveSegment={noop}
      />
    );
    const input = screen.getByDisplayValue('MySegment');
    expect(input).toBeInTheDocument();
    expect(input).not.toHaveStyle({ textTransform: 'uppercase' });
  });

  test('renders all-caps segment label as stored', () => {
    const segments = [makeSegment({ id: '1', label: 'ALL CAPS' }), makeSegment({ id: '2', label: 'Other' })];
    render(
      <SegmentTable
        segments={segments}
        onUpdateWeight={noop}
        onUpdatePercentage={noop}
        onUpdateLabel={noop}
        onUpdateColor={noop}
        onAddSegment={noop}
        onRemoveSegment={noop}
      />
    );
    expect(screen.getByDisplayValue('ALL CAPS')).toBeInTheDocument();
  });
});
