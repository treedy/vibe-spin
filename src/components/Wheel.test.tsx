import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Wheel } from './Wheel';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      animate,
      transition,
      children,
    }: {
      animate: unknown;
      transition: unknown;
      children: React.ReactNode;
    }) => (
      <div
        data-testid="wheel-motion"
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
      >
        {children}
      </div>
    ),
  },
}));

const segments = [
  {
    id: 'segment-1',
    label: 'Option 1',
    percentage: 50,
    weight: 1,
    color: '#257bf4',
  },
  {
    id: 'segment-2',
    label: 'Option 2',
    percentage: 50,
    weight: 1,
    color: '#00f2ff',
  },
];

describe('Wheel', () => {
  test('uses duration-based keyframes with a linear top-speed section', () => {
    const { rerender } = render(
      <Wheel segments={segments} rotation={0} spinDurationMs={4000} />
    );

    rerender(
      <Wheel
        segments={segments}
        rotation={1800}
        spinDurationMs={4000}
        isSpinning
      />
    );

    const motionWrapper = screen.getByTestId('wheel-motion');
    expect(JSON.parse(motionWrapper.dataset.animate ?? '{}')).toEqual({
      rotate: [0, 324, 1476, 1800],
    });
    const transition = JSON.parse(motionWrapper.dataset.transition ?? '{}');
    expect(transition.duration).toBe(4);
    expect(transition.ease).toBe('linear');
    expect(transition.times[0]).toBe(0);
    expect(transition.times[1]).toBeCloseTo(0.18, 5);
    expect(transition.times[2]).toBeCloseTo(0.82, 5);
    expect(transition.times[3]).toBe(1);
  });
});
