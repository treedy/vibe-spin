import React, {
  lazy,
  Suspense,
  useState,
  useCallback,
  useTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useMemo,
} from 'react';
import './styles.css';
import type { Segment } from './hooks/useSegments';
import { useWheels } from './hooks/useWheels';
import { useSpinHistory } from './hooks/useSpinHistory';
import { usePalettes } from './hooks/usePalettes';
import { SegmentTable } from './components/SegmentTable';
import { Wheel } from './components/Wheel';
import { PalettesPanel } from './components/PalettesPanel';
import { formatRelativeTime } from './utils/timeFormat';
import { encodeWheel, decodeWheel } from './utils/permalink';
import { DEFAULT_SPIN_DURATION_MS, useAudio } from './hooks/useAudio';
import { Share2, Settings, User, Menu, X } from 'lucide-react';

const RESET_TOAST_DURATION = 5000;
const COPIED_TOAST_DURATION = 2000;

const HistoryDrawer = lazy(() =>
  import('./components/HistoryDrawer').then((module) => ({
    default: module.HistoryDrawer,
  }))
);
const WheelsDrawer = lazy(() =>
  import('./components/WheelsDrawer').then((module) => ({
    default: module.WheelsDrawer,
  }))
);
const TemplatesModal = lazy(() =>
  import('./components/TemplatesModal').then((module) => ({
    default: module.TemplatesModal,
  }))
);
const PrivacyModal = lazy(() =>
  import('./components/PrivacyModal').then((module) => ({
    default: module.PrivacyModal,
  }))
);
const TermsModal = lazy(() =>
  import('./components/TermsModal').then((module) => ({
    default: module.TermsModal,
  }))
);
const FeedbackModal = lazy(() =>
  import('./components/FeedbackModal').then((module) => ({
    default: module.FeedbackModal,
  }))
);
const SettingsModal = lazy(() =>
  import('./components/SettingsModal').then((module) => ({
    default: module.SettingsModal,
  }))
);

export default function App() {
  const {
    wheels,
    activeId,
    activeWheel,
    capReached,
    setActiveId,
    createWheel,
    deleteWheel,
    renameWheel,
    segments,
    updateWeight,
    updatePercentage,
    updateLabel,
    updateColor,
    addSegment,
    removeSegment,
    resetWeights,
    reorderSegments,
    setSegments,
  } = useWheels();
  const { history, addEntry, clearHistory } = useSpinHistory();
  const { palettes, createPalette, deletePalette, getColorsForSegments } =
    usePalettes();
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerColor, setWinnerColor] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPending, startTransition] = useTransition();
  const {
    soundsEnabled,
    toggleSounds,
    celebrationEnabled,
    toggleCelebration,
    spinDurationMs,
    updateSpinDurationMs,
    play,
  } = useAudio();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [wheelsOpen, setWheelsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [showCapToast, setShowCapToast] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [showResetToast, setShowResetToast] = useState(false);
  const [currentSpinDurationMs, setCurrentSpinDurationMs] = useState(
    DEFAULT_SPIN_DURATION_MS
  );
  const prevSegmentsRef = useRef<Segment[] | null>(null);
  const copiedToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const resetToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const privacyTriggerRef = useRef<HTMLAnchorElement>(null);
  const termsTriggerRef = useRef<HTMLAnchorElement>(null);
  const feedbackTriggerRef = useRef<HTMLAnchorElement>(null);
  const settingsTriggerRef = useRef<HTMLButtonElement>(null);
  const isSpinningRef = useRef(isSpinning);
  const isPendingRef = useRef(isPending);
  const segmentsRef = useRef(segments);
  const totalWeightRef = useRef(0);
  const activeWheelNameRef = useRef(activeWheel.name);

  isSpinningRef.current = isSpinning;
  isPendingRef.current = isPending;
  segmentsRef.current = segments;
  activeWheelNameRef.current = activeWheel.name;

  useEffect(() => {
    if (!capReached) return;
    setShowCapToast(true);
    const t = setTimeout(() => setShowCapToast(false), 4000);
    return () => clearTimeout(t);
  }, [capReached]);

  // Parse ?wheel= URL parameter on mount and override state if valid
  const hasProcessedUrl = useRef(false);
  useEffect(() => {
    if (hasProcessedUrl.current) return;
    hasProcessedUrl.current = true;
    const param = new URLSearchParams(window.location.search).get('wheel');
    if (!param) return;
    const shared = decodeWheel(param);
    if (!shared) return;
    const parsed = shared.segments.map((s, i) => ({
      id: `shared-${i}`,
      label: s.label,
      weight: s.weight,
      percentage: 0,
      color: s.color,
    }));
    startTransition(() => {
      renameWheel(activeId, shared.name);
      setSegments(parsed);
    });
  }, [activeId, renameWheel, setSegments]);

  const handleShare = useCallback(() => {
    const encoded = encodeWheel(activeWheel.name, segments);
    const url = `${window.location.origin}${window.location.pathname}?wheel=${encoded}`;

    const showCopiedToast = () => {
      if (copiedToastTimerRef.current)
        clearTimeout(copiedToastTimerRef.current);
      setShowCopiedToast(true);
      copiedToastTimerRef.current = setTimeout(
        () => setShowCopiedToast(false),
        COPIED_TOAST_DURATION
      );
    };

    navigator.clipboard
      .writeText(url)
      .then(showCopiedToast)
      .catch(showCopiedToast);
  }, [activeWheel.name, segments]);

  const recentSpins = useMemo(() => history.slice(0, 4), [history]);
  const currentColors = useMemo(
    () => segments.map((segment) => segment.color),
    [segments]
  );
  const effectiveSpinDurationMs = spinDurationMs ?? DEFAULT_SPIN_DURATION_MS;

  const loadTemplate = useCallback(
    (templateSegments: Segment[]) => {
      startTransition(() => {
        setSegments(templateSegments);
        setWinner(null);
        setWinnerColor(null);
        setIsDirty(false);
      });
    },
    [setSegments]
  );

  const handleApplyPalette = useCallback(
    (paletteId: string) => {
      const newColors = getColorsForSegments(paletteId, segments.length);
      if (newColors.length === 0) return;
      startTransition(() => {
        const updatedSegments = segments.map((seg, i) => ({
          ...seg,
          color: newColors[i]!,
        }));
        setSegments(updatedSegments);
        setIsDirty(true);
      });
    },
    [segments, getColorsForSegments, setSegments]
  );

  const handleSavePalette = useCallback(
    (name: string, colors: string[]) => {
      createPalette(name, colors);
    },
    [createPalette]
  );

  const handleUpdateWeight = useCallback(
    (i: number, v: number) => {
      setIsDirty(true);
      updateWeight(i, v);
    },
    [updateWeight]
  );
  const handleUpdatePercentage = useCallback(
    (i: number, v: number) => {
      setIsDirty(true);
      updatePercentage(i, v);
    },
    [updatePercentage]
  );
  const handleUpdateLabel = useCallback(
    (i: number, v: string) => {
      setIsDirty(true);
      updateLabel(i, v);
    },
    [updateLabel]
  );
  const handleUpdateColor = useCallback(
    (i: number, v: string) => {
      setIsDirty(true);
      updateColor(i, v);
    },
    [updateColor]
  );
  const handleReorderSegments = useCallback(
    (from: number, to: number) => {
      setIsDirty(true);
      reorderSegments(from, to);
    },
    [reorderSegments]
  );
  const handleResetWeights = useCallback(() => {
    prevSegmentsRef.current = segments;
    setIsDirty(true);
    resetWeights();
    if (resetToastTimerRef.current) clearTimeout(resetToastTimerRef.current);
    setShowResetToast(true);
    resetToastTimerRef.current = setTimeout(
      () => setShowResetToast(false),
      RESET_TOAST_DURATION
    );
  }, [segments, resetWeights]);

  const handleUndoReset = useCallback(() => {
    if (prevSegmentsRef.current) {
      setSegments(prevSegmentsRef.current);
      prevSegmentsRef.current = null;
    }
    if (resetToastTimerRef.current) clearTimeout(resetToastTimerRef.current);
    setShowResetToast(false);
  }, [setSegments]);

  const handleAddSegment = useCallback(() => {
    setIsDirty(true);
    addSegment();
  }, [addSegment]);
  const handleRemoveSegment = useCallback(
    (i: number) => {
      setIsDirty(true);
      removeSegment(i);
    },
    [removeSegment]
  );
  const totalWeight = useMemo(
    () => segments.reduce((sum, s) => sum + s.weight, 0),
    [segments]
  );
  totalWeightRef.current = totalWeight;

  const spin = useCallback(() => {
    if (isSpinningRef.current) return;

    const currentSegments = segmentsRef.current;
    const currentTotalWeight = totalWeightRef.current;
    if (
      currentSegments.length === 0 ||
      !Number.isFinite(currentTotalWeight) ||
      currentTotalWeight <= 0
    ) {
      return;
    }

    setIsSpinning(true);
    isSpinningRef.current = true;
    setWinner(null);
    setWinnerColor(null);
    play('spin');
    setCurrentSpinDurationMs(effectiveSpinDurationMs);

    const randomWeight = Math.random() * currentTotalWeight;

    let currentWeight = 0;
    let winnerIndex = 0;
    for (let i = 0; i < currentSegments.length; i++) {
      currentWeight += currentSegments[i]!.weight;
      if (randomWeight <= currentWeight) {
        winnerIndex = i;
        break;
      }
    }

    let winnerStartAngle = 0;
    for (let i = 0; i < winnerIndex; i++) {
      winnerStartAngle += (currentSegments[i]!.percentage / 100) * 360;
    }

    const winnerAngle = (currentSegments[winnerIndex]!.percentage / 100) * 360;
    const margin = winnerAngle * 0.1;
    const randomOffset = margin + Math.random() * (winnerAngle - margin * 2);
    const targetAngle = winnerStartAngle + randomOffset;

    const extraSpins = 5 * 360;
    const targetRotation = 270 - targetAngle;
    setRotation((currentRotation) => {
      const normalizedRotation = currentRotation % 360;
      return (
        currentRotation + extraSpins + (targetRotation - normalizedRotation)
      );
    });

    const winningSegment = currentSegments[winnerIndex];
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    spinTimeoutRef.current = setTimeout(() => {
      if (winningSegment) {
        setWinner(winningSegment.label);
        setWinnerColor(winningSegment.color);
        addEntry({
          label: winningSegment.label,
          color: winningSegment.color,
          wheelName: activeWheelNameRef.current,
        });
        play('win');
      } else {
        setWinner(null);
        setWinnerColor(null);
      }
      setIsSpinning(false);
      isSpinningRef.current = false;
    }, effectiveSpinDurationMs);
  }, [addEntry, effectiveSpinDurationMs, play]);

  const handleSpinHotkey = useEffectEvent((event: KeyboardEvent) => {
    if (event.code !== 'Space') return;
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName;
    if (tag && ['INPUT', 'TEXTAREA', 'BUTTON'].includes(tag)) return;
    if (
      target?.isContentEditable ||
      isSpinningRef.current ||
      isPendingRef.current
    ) {
      return;
    }
    event.preventDefault();
    spin();
  });

  useEffect(() => {
    return () => {
      if (copiedToastTimerRef.current)
        clearTimeout(copiedToastTimerRef.current);
      if (resetToastTimerRef.current) clearTimeout(resetToastTimerRef.current);
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => handleSpinHotkey(event);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="app">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-logo">
          <div className="logo-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="logo-text">
            VIBE<span>SPIN</span>
          </div>
        </div>
        <div className="nav-links">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setWheelsOpen(true);
            }}
          >
            My Wheels
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setTemplatesOpen(true);
            }}
          >
            Templates
          </a>
        </div>
        <div className="nav-actions">
          <button className="new-wheel-btn" onClick={createWheel}>
            New Wheel
          </button>
          <button className="avatar-btn">
            <User size={18} />
          </button>
          <button
            className="hamburger-btn"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          <button
            className="mobile-nav-link"
            onClick={() => {
              setWheelsOpen(true);
              setMobileMenuOpen(false);
            }}
          >
            My Wheels
          </button>
          <button
            className="mobile-nav-link"
            onClick={() => {
              setTemplatesOpen(true);
              setMobileMenuOpen(false);
            }}
          >
            Templates
          </button>
          <button
            className="mobile-nav-link mobile-nav-new-wheel"
            onClick={() => {
              createWheel();
              setMobileMenuOpen(false);
            }}
          >
            New Wheel
          </button>
        </nav>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="header-actions page-header-right">
          <button className="header-btn" onClick={handleShare}>
            <Share2 size={16} />
            Share
          </button>
          <button
            ref={settingsTriggerRef}
            className="header-btn"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main>
        {/* Wheel Card */}
        <div className="wheel-card">
          <div className="wheel-container">
            <Wheel
              segments={segments}
              rotation={rotation}
              isSpinning={isSpinning}
              spinDurationMs={
                isSpinning ? currentSpinDurationMs : effectiveSpinDurationMs
              }
              onSpin={spin}
              disabled={isSpinning || isPending}
            />
          </div>
          <button
            className="spin-button"
            onClick={spin}
            disabled={isSpinning || isPending}
          >
            Spin the Wheel
          </button>
          <span className="spin-hint">Press space or click to spin</span>
          {winner && winnerColor ? (
            <div
              className="winner-overlay"
              style={{ color: winnerColor }}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              🎉 Winner: {winner}
            </div>
          ) : null}
        </div>

        {/* Segments Panel */}
        <div className="segments-panel">
          <div className="segments-header">
            <div className="segments-title-row">
              {isEditingName ? (
                <input
                  className="wheel-name-input"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  onBlur={() => {
                    const name = editNameValue.trim() || activeWheel.name;
                    renameWheel(activeId, name);
                    setIsEditingName(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const name = editNameValue.trim() || activeWheel.name;
                      renameWheel(activeId, name);
                      setIsEditingName(false);
                    }
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                  autoFocus
                />
              ) : (
                <span
                  className="wheel-name-display"
                  onClick={() => {
                    setEditNameValue(activeWheel.name);
                    setIsEditingName(true);
                  }}
                  title="Click to rename"
                >
                  {activeWheel.name}
                </span>
              )}
              <h2 className="segments-title">Segments</h2>
            </div>
            <p className="segments-subtitle">
              Manage labels, colors and weights
            </p>
          </div>

          <PalettesPanel
            palettes={palettes}
            currentColors={currentColors}
            onApplyPalette={handleApplyPalette}
            onSavePalette={handleSavePalette}
            onDeletePalette={deletePalette}
          />

          <SegmentTable
            segments={segments}
            onUpdateWeight={handleUpdateWeight}
            onUpdatePercentage={handleUpdatePercentage}
            onUpdateLabel={handleUpdateLabel}
            onUpdateColor={handleUpdateColor}
            onAddSegment={handleAddSegment}
            onRemoveSegment={handleRemoveSegment}
            onReorderSegments={handleReorderSegments}
            onResetWeights={handleResetWeights}
          />

          <div className="table-footer">
            <span>
              Total Weight Sum: <strong>{totalWeight}</strong>
            </span>
            <span>
              Total %: <strong>100.0%</strong>
            </span>
          </div>
        </div>
      </main>

      {/* Recent Spins */}
      <section className="recent-section">
        <div className="recent-header">
          <h3 className="recent-title">Recent Spins</h3>
          <button
            className="view-history-link"
            onClick={() => setHistoryOpen(true)}
          >
            View Full History
          </button>
        </div>
        <div className="recent-grid">
          {recentSpins.length === 0 ? (
            <p className="recent-empty">
              Spin the wheel to start tracking history.
            </p>
          ) : (
            recentSpins.map((entry) => (
              <div key={entry.id} className="session-card">
                <div
                  className="session-icon session-icon--color"
                  style={{ background: entry.color + '26' }}
                >
                  <div
                    className="session-color-dot"
                    style={{ background: entry.color }}
                  />
                </div>
                <div className="session-info">
                  <span className="session-name">{entry.label}</span>
                  <span className="session-time">
                    {formatRelativeTime(entry.ts)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Suspense fallback={null}>
        <TemplatesModal
          isOpen={templatesOpen}
          isDirty={isDirty}
          onClose={() => setTemplatesOpen(false)}
          onLoadTemplate={loadTemplate}
        />

        <HistoryDrawer
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          history={history}
          onClearHistory={clearHistory}
        />

        <WheelsDrawer
          isOpen={wheelsOpen}
          onClose={() => setWheelsOpen(false)}
          wheels={wheels}
          activeId={activeId}
          onSelect={setActiveId}
          onDelete={deleteWheel}
          onNew={() => {
            createWheel();
            setWheelsOpen(false);
          }}
        />

        <PrivacyModal
          isOpen={privacyOpen}
          onClose={() => setPrivacyOpen(false)}
          triggerRef={privacyTriggerRef}
        />
        <TermsModal
          isOpen={termsOpen}
          onClose={() => setTermsOpen(false)}
          triggerRef={termsTriggerRef}
        />
        <FeedbackModal
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          triggerRef={feedbackTriggerRef}
        />

        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          triggerRef={settingsTriggerRef}
          soundsEnabled={soundsEnabled}
          onToggleSounds={toggleSounds}
          celebrationEnabled={celebrationEnabled}
          onToggleCelebration={toggleCelebration}
          spinDurationMs={spinDurationMs}
          onSpinDurationChange={updateSpinDurationMs}
        />
      </Suspense>

      {showResetToast && (
        <div className="toast toast--info">
          Weights reset to 1.
          <button className="toast-undo-btn" onClick={handleUndoReset}>
            Undo
          </button>
        </div>
      )}

      {showCapToast && (
        <div className="toast toast--warning">
          Maximum 50 wheels reached. Delete a wheel to create a new one.
        </div>
      )}

      {showCopiedToast && <div className="toast toast--success">Copied!</div>}

      {/* Footer */}
      <footer className="app-footer">
        <span>© 2026 Tawdball Tech. Gamified Choices.</span>
        <div className="footer-links">
          <a
            href="#"
            ref={privacyTriggerRef}
            onClick={(e) => {
              e.preventDefault();
              setPrivacyOpen(true);
            }}
          >
            Privacy
          </a>
          <a
            href="#"
            ref={termsTriggerRef}
            onClick={(e) => {
              e.preventDefault();
              setTermsOpen(true);
            }}
          >
            Terms
          </a>
          <a
            href="#"
            ref={feedbackTriggerRef}
            onClick={(e) => {
              e.preventDefault();
              setFeedbackOpen(true);
            }}
          >
            Feedback
          </a>
        </div>
      </footer>
    </div>
  );
}
