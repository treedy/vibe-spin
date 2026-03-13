import { useState, useRef, useCallback, useEffect } from 'react';

const CELEBRATION_DURATION_MS = 4000;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function useCelebration(celebrationEnabled: boolean) {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerCelebration = useCallback(() => {
    if (!celebrationEnabled || prefersReducedMotion()) return;

    setIsCelebrating(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsCelebrating(false);
    }, CELEBRATION_DURATION_MS);
  }, [celebrationEnabled]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { triggerCelebration, isCelebrating };
}
