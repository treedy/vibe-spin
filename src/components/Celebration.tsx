import React, { useRef, useEffect } from 'react';

const CELEBRATION_DURATION_MS = 4000;
const FADE_START_MS = 3000;

const CONFETTI_COLORS = [
  '#257bf4',
  '#00f2ff',
  '#ff4d6d',
  '#ffd60a',
  '#06d6a0',
  '#ff9f1c',
  '#c77dff',
  '#ffffff',
];

type Shape = 'rect' | 'circle' | 'ribbon';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  width: number;
  height: number;
  shape: Shape;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
}

function getParticleCount(): number {
  if (typeof window === 'undefined') return 100;
  const isMobile = window.innerWidth < 768;
  const lowPower =
    typeof navigator !== 'undefined' &&
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency < 4;
  if (isMobile || lowPower) return 60;
  return 120;
}

function createParticle(canvasWidth: number): Particle {
  const shapes: Shape[] = ['rect', 'circle', 'ribbon'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)] ?? 'rect';
  const size = 6 + Math.random() * 8;
  return {
    x: Math.random() * canvasWidth,
    y: -10 - Math.random() * 40,
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 3,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
    color:
      CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] ??
      '#257bf4',
    width: shape === 'ribbon' ? size * 0.4 : size,
    height: shape === 'ribbon' ? size * 2.5 : size,
    shape,
    opacity: 1,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.05 + Math.random() * 0.05,
  };
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  if (p.shape === 'circle') {
    ctx.beginPath();
    ctx.ellipse(0, 0, p.width / 2, p.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
  }

  ctx.restore();
}

interface CelebrationProps {
  isCelebrating: boolean;
}

export function Celebration({ isCelebrating }: CelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!isCelebrating) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const count = getParticleCount();
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(canvas.width)
    );
    startTimeRef.current = null;

    function tick(timestamp: number) {
      if (!canvas || !ctx) return;

      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fadeProgress = Math.max(
        0,
        (elapsed - FADE_START_MS) / (CELEBRATION_DURATION_MS - FADE_START_MS)
      );

      for (const p of particlesRef.current) {
        p.wobble += p.wobbleSpeed;
        p.vx += Math.sin(p.wobble) * 0.1;
        p.vy += 0.1;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - fadeProgress);
        drawParticle(ctx, p);
      }

      if (elapsed < CELEBRATION_DURATION_MS) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [isCelebrating]);

  if (!isCelebrating) return null;

  return (
    <canvas ref={canvasRef} className="celebration-canvas" aria-hidden="true" />
  );
}
