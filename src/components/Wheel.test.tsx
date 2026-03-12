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
  test('uses provided spin keyframes and 3-phase timing during spin', () => {
    render(
      <Wheel
        segments={segments}
        rotation={2340}
        spinDurationMs={4000}
        spinKeyframes={[0, 810, 1890]}
        isSpinning
      />
    );

    const motionWrapper = screen.getByTestId('wheel-motion');
    expect(JSON.parse(motionWrapper.dataset.animate ?? '{}')).toEqual({
      rotate: [0, 810, 1890, 2340],
    });

    const transition = JSON.parse(motionWrapper.dataset.transition ?? '{}');
    expect(transition.duration).toBe(4);
    expect(transition.times[0]).toBe(0);
    expect(transition.times[1]).toBeCloseTo(0.375, 5);
    expect(transition.times[2]).toBeCloseTo(0.625, 5);
    expect(transition.times[3]).toBe(1);
    expect(transition.ease).toEqual(['easeIn', 'linear', 'easeOut']);

    // Coast phase should correspond to 3 rotations/sec (1080 deg/sec).
    const coastDegrees = 1890 - 810;
    const coastSeconds = 4 - 3;
    expect(coastDegrees / coastSeconds).toBe(1080);
  });

  test('falls back to static rotation when not spinning', () => {
    render(
      <Wheel
        segments={segments}
        rotation={720}
        spinDurationMs={4000}
        spinKeyframes={[0, 810, 1890]}
      />
    );

    const motionWrapper = screen.getByTestId('wheel-motion');
    expect(JSON.parse(motionWrapper.dataset.animate ?? '{}')).toEqual({
      rotate: 720,
    });
    expect(JSON.parse(motionWrapper.dataset.transition ?? '{}')).toEqual({
      duration: 0,
    });
  });
});
