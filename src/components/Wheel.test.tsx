import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, test, vi, afterEach } from 'vitest';
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

  describe('segment tooltips', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    test('tooltip does not appear immediately on mouse enter', () => {
      vi.useFakeTimers();
      const { container } = render(
        <Wheel segments={segments} rotation={0} spinDurationMs={4000} />
      );

      const path = container.querySelector(
        '[data-segment-id="segment-1"]'
      ) as Element;
      fireEvent.mouseEnter(path, { clientX: 100, clientY: 100 });

      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    test('tooltip appears after 500 ms hover delay', () => {
      vi.useFakeTimers();
      const { container } = render(
        <Wheel segments={segments} rotation={0} spinDurationMs={4000} />
      );

      const path = container.querySelector(
        '[data-segment-id="segment-1"]'
      ) as Element;
      fireEvent.mouseEnter(path, { clientX: 100, clientY: 100 });

      act(() => {
        vi.advanceTimersByTime(499);
      });
      expect(screen.queryByRole('tooltip')).toBeNull();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByRole('tooltip')).toHaveTextContent('Option 1');
    });

    test('tooltip shows full label (not truncated)', () => {
      vi.useFakeTimers();
      const longSegments = [
        {
          id: 'seg-long',
          label: 'A Very Long Label That Would Be Truncated',
          percentage: 10,
          weight: 1,
          color: '#257bf4',
        },
        ...Array.from({ length: 9 }, (_, i) => ({
          id: `seg-${i}`,
          label: `Seg ${i}`,
          percentage: 10,
          weight: 1,
          color: '#00f2ff',
        })),
      ];
      const { container } = render(
        <Wheel segments={longSegments} rotation={0} spinDurationMs={4000} />
      );

      const path = container.querySelector(
        '[data-segment-id="seg-long"]'
      ) as Element;
      fireEvent.mouseEnter(path, { clientX: 100, clientY: 100 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'A Very Long Label That Would Be Truncated'
      );
    });

    test('tooltip hides when mouse leaves the segment', () => {
      vi.useFakeTimers();
      const { container } = render(
        <Wheel segments={segments} rotation={0} spinDurationMs={4000} />
      );

      const path = container.querySelector(
        '[data-segment-id="segment-1"]'
      ) as Element;
      fireEvent.mouseEnter(path, { clientX: 100, clientY: 100 });
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      fireEvent.mouseLeave(path);
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    test('hover timer is canceled when mouse leaves before delay', () => {
      vi.useFakeTimers();
      const { container } = render(
        <Wheel segments={segments} rotation={0} spinDurationMs={4000} />
      );

      const path = container.querySelector(
        '[data-segment-id="segment-1"]'
      ) as Element;
      fireEvent.mouseEnter(path, { clientX: 100, clientY: 100 });
      fireEvent.mouseLeave(path);

      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    test('tooltip does not appear while spinning', () => {
      vi.useFakeTimers();
      const { container } = render(
        <Wheel
          segments={segments}
          rotation={0}
          spinDurationMs={4000}
          isSpinning
        />
      );

      const path = container.querySelector(
        '[data-segment-id="segment-1"]'
      ) as Element;
      fireEvent.mouseEnter(path, { clientX: 100, clientY: 100 });

      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    test('tooltip hides when spinning starts mid-hover', () => {
      vi.useFakeTimers();
      const { container, rerender } = render(
        <Wheel segments={segments} rotation={0} spinDurationMs={4000} />
      );

      const path = container.querySelector(
        '[data-segment-id="segment-1"]'
      ) as Element;
      fireEvent.mouseEnter(path, { clientX: 100, clientY: 100 });
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      rerender(
        <Wheel
          segments={segments}
          rotation={0}
          spinDurationMs={4000}
          isSpinning
        />
      );
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    test('tooltip appears after 500 ms long-press on touch', () => {
      vi.useFakeTimers();
      const { container } = render(
        <Wheel segments={segments} rotation={0} spinDurationMs={4000} />
      );

      const path = container.querySelector(
        '[data-segment-id="segment-1"]'
      ) as Element;
      fireEvent.pointerDown(path, {
        pointerType: 'touch',
        clientX: 100,
        clientY: 100,
      });

      act(() => {
        vi.advanceTimersByTime(499);
      });
      expect(screen.queryByRole('tooltip')).toBeNull();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByRole('tooltip')).toHaveTextContent('Option 1');
    });

    test('long-press tooltip hides on pointer up', () => {
      vi.useFakeTimers();
      const { container } = render(
        <Wheel segments={segments} rotation={0} spinDurationMs={4000} />
      );

      const path = container.querySelector(
        '[data-segment-id="segment-1"]'
      ) as Element;
      fireEvent.pointerDown(path, {
        pointerType: 'touch',
        clientX: 100,
        clientY: 100,
      });
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      fireEvent.pointerUp(path, { pointerType: 'touch' });
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    test('long-press is canceled when touch moves past threshold', () => {
      vi.useFakeTimers();
      const { container } = render(
        <Wheel segments={segments} rotation={0} spinDurationMs={4000} />
      );

      const path = container.querySelector(
        '[data-segment-id="segment-1"]'
      ) as Element;
      fireEvent.pointerDown(path, {
        pointerType: 'touch',
        clientX: 100,
        clientY: 100,
      });
      // Move more than 8px
      fireEvent.pointerMove(path, {
        pointerType: 'touch',
        clientX: 110,
        clientY: 110,
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    test('mouse hover does not trigger long-press path', () => {
      vi.useFakeTimers();
      const { container } = render(
        <Wheel segments={segments} rotation={0} spinDurationMs={4000} />
      );

      const path = container.querySelector(
        '[data-segment-id="segment-1"]'
      ) as Element;
      // Mouse pointerDown should NOT start a long-press timer
      fireEvent.pointerDown(path, {
        pointerType: 'mouse',
        clientX: 100,
        clientY: 100,
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });
      // Tooltip should not have appeared via long-press for mouse
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });
});
