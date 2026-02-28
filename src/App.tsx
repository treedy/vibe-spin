import React, { useState, useCallback, useTransition, useEffect, useRef, useMemo } from 'react';
import './styles.css';
import type { Segment } from './hooks/useSegments';
import { useWheels, DEFAULT_SPIN_DURATION_MS } from './hooks/useWheels';
import { useSpinHistory } from './hooks/useSpinHistory';
import { usePalettes } from './hooks/usePalettes';
import { SegmentTable } from './components/SegmentTable';
import { Wheel } from './components/Wheel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { WheelsDrawer } from './components/WheelsDrawer';
import { TemplatesModal } from './components/TemplatesModal';
import { PalettesPanel } from './components/PalettesPanel';
import { PrivacyModal } from './components/PrivacyModal';
import { TermsModal } from './components/TermsModal';
import { formatRelativeTime } from './utils/timeFormat';
import { encodeWheel, decodeWheel } from './utils/permalink';
import { useAudio } from './hooks/useAudio';
import { Share2, Settings, User, Menu, X } from 'lucide-react';

const PRESETS = [
  { name: 'Lunch', segments: [
    { id: 'l1', label: 'Pizza', weight: 1, percentage: 33.3, color: '#FF5733' },
    { id: 'l2', label: 'Sushi', weight: 1, percentage: 33.3, color: '#33FF57' },
    { id: 'l3', label: 'Tacos', weight: 1, percentage: 33.3, color: '#3357FF' },
  ]},
  { name: 'Truth or Dare', segments: [
    { id: 'td1', label: 'Truth', weight: 1, percentage: 50, color: '#f43f5e' },
    { id: 'td2', label: 'Dare', weight: 1, percentage: 50, color: '#6366f1' },
  ]},
  { name: 'Monochromatic Blue', segments: [
    { id: 'l1', label: 'Deep Ocean', weight: 10, percentage: 25, color: '#1a5fb4' },
    { id: 'l2', label: 'Electric Sky', weight: 10, percentage: 25, color: '#3584e4' },
    { id: 'l3', label: 'Neon Cobalt', weight: 10, percentage: 25, color: '#62a0ea' },
    { id: 'l4', label: 'Cyan Flash', weight: 10, percentage: 25, color: '#00f2ff' },
  ]},
];

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
    setSegments,
    updateSpinDuration,
  } = useWheels();
  const { history, addEntry, clearHistory } = useSpinHistory();
  const { palettes, createPalette, deletePalette, getColorsForSegments } = usePalettes();
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerColor, setWinnerColor] = useState<string | null>(null);

  const winnerStyle = useMemo((): React.CSSProperties | null => {
    if (!winnerColor) return null;
    return {
      color: winnerColor,
    } as React.CSSProperties;
  }, [winnerColor]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { soundsEnabled, toggleSounds, play } = useAudio();
  const [celebrationEnabled, setCelebrationEnabled] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [wheelsOpen, setWheelsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [showCapToast, setShowCapToast] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const privacyTriggerRef = useRef<HTMLAnchorElement>(null);
  const termsTriggerRef = useRef<HTMLAnchorElement>(null);

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
    navigator.clipboard.writeText(url).then(() => {
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    }).catch(() => {
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    });
  }, [activeWheel.name, segments]);

  const recentSpins = history.slice(0, 4);

  const loadPreset = useCallback((presetSegments: Segment[]) => {
    startTransition(() => {
      setSegments(presetSegments);
      setWinner(null);
      setWinnerColor(null);
    });
  }, [setSegments]);

  const loadTemplate = useCallback((templateSegments: Segment[]) => {
    startTransition(() => {
      setSegments(templateSegments);
      setWinner(null);
      setWinnerColor(null);
      setIsDirty(false);
    });
  }, [setSegments]);

  const handleApplyPalette = useCallback((paletteId: string) => {
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
  }, [segments, getColorsForSegments, setSegments]);

  const handleSavePalette = useCallback((name: string, colors: string[]) => {
    createPalette(name, colors);
  }, [createPalette]);

  const handleUpdateWeight = useCallback((i: number, v: number) => { setIsDirty(true); updateWeight(i, v); }, [updateWeight]);
  const handleUpdatePercentage = useCallback((i: number, v: number) => { setIsDirty(true); updatePercentage(i, v); }, [updatePercentage]);
  const handleUpdateLabel = useCallback((i: number, v: string) => { setIsDirty(true); updateLabel(i, v); }, [updateLabel]);
  const handleUpdateColor = useCallback((i: number, v: string) => { setIsDirty(true); updateColor(i, v); }, [updateColor]);
  const handleAddSegment = useCallback(() => { setIsDirty(true); addSegment(); }, [addSegment]);
  const handleRemoveSegment = useCallback((i: number) => { setIsDirty(true); removeSegment(i); }, [removeSegment]);

  const spin = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);
    setWinnerColor(null);
    play('spin');
    
    const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
    const randomWeight = Math.random() * totalWeight;

    let currentWeight = 0;
    let winnerIndex = 0;
    for (let i = 0; i < segments.length; i++) {
      currentWeight += segments[i]!.weight;
      if (randomWeight <= currentWeight) {
        winnerIndex = i;
        break;
      }
    }

    let winnerStartAngle = 0;
    for (let i = 0; i < winnerIndex; i++) {
      winnerStartAngle += (segments[i]!.percentage / 100) * 360;
    }
    const winnerAngle = (segments[winnerIndex]!.percentage / 100) * 360;
    const margin = winnerAngle * 0.1;
    const randomOffset = margin + Math.random() * (winnerAngle - margin * 2);
    const targetAngle = winnerStartAngle + randomOffset;

    const extraSpins = 5 * 360;
    const targetRotation = 270 - targetAngle;
    const finalRotation = rotation + extraSpins + (targetRotation - (rotation % 360));

    setRotation(finalRotation);

    const winningSegment = segments[winnerIndex];
    const wheelName = activeWheel.name;
    const spinDurationMs = activeWheel.spinDurationMs ?? DEFAULT_SPIN_DURATION_MS;
    setTimeout(() => {
      if (winningSegment) {
        setWinner(winningSegment.label);
        setWinnerColor(winningSegment.color);
        addEntry({ label: winningSegment.label, color: winningSegment.color, wheelName });
        play('win');
      } else {
        setWinner(null);
        setWinnerColor(null);
      }
      setIsSpinning(false);
    }, spinDurationMs);
  }, [isSpinning, rotation, segments, addEntry, activeWheel.name, activeWheel.spinDurationMs, play]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(tag) || (e.target as HTMLElement).isContentEditable) return;
      if (isSpinning || isPending) return;
      e.preventDefault();
      spin();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [spin, isSpinning, isPending]);

  const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
  const spinDurationSec = Math.round(activeWheel.spinDurationMs / 1000);

  return (
    <div className="app">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-logo">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="logo-text">VIBE<span>SPIN</span></div>
        </div>
        <div className="nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); setWheelsOpen(true); }}>My Wheels</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setTemplatesOpen(true); }}>Templates</a>
        </div>
        <div className="nav-actions">
          <button className="new-wheel-btn" onClick={createWheel}>New Wheel</button>
          <button className="avatar-btn">
            <User size={18} />
          </button>
          <button
            className="hamburger-btn"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileMenuOpen(o => !o)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">
          <button
            className="mobile-nav-link"
            onClick={() => { setWheelsOpen(true); setMobileMenuOpen(false); }}
          >
            My Wheels
          </button>
          <button
            className="mobile-nav-link"
            onClick={() => { setTemplatesOpen(true); setMobileMenuOpen(false); }}
          >
            Templates
          </button>
          <button
            className="mobile-nav-link mobile-nav-new-wheel"
            onClick={() => { createWheel(); setMobileMenuOpen(false); }}
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
          <button className="header-btn">
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
              onSpin={spin}
              disabled={isSpinning || isPending}
              spinDurationMs={activeWheel.spinDurationMs}
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
          {winner && winnerStyle ? (
            <div
              className="winner-overlay"
              style={winnerStyle}
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
                  onChange={e => setEditNameValue(e.target.value)}
                  onBlur={() => {
                    const name = editNameValue.trim() || activeWheel.name;
                    renameWheel(activeId, name);
                    setIsEditingName(false);
                  }}
                  onKeyDown={e => {
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
            <p className="segments-subtitle">Manage labels, colors and weights</p>
          </div>

          <PalettesPanel
            palettes={palettes}
            currentColors={segments.map(s => s.color)}
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
            presets={PRESETS}
            onLoadPreset={loadPreset}
          />

          <div className="table-footer">
            <span>Total Weight Sum: <strong>{totalWeight}</strong></span>
            <span>Total %: <strong>100.0%</strong></span>
          </div>

          {/* Settings Row */}
          <div className="settings-row">
            <div className="setting-card">
              <div className="setting-info">
                <span className="setting-label">Sound Effects</span>
                <span className="setting-value">Game Show Neon</span>
              </div>
              <div
                className={`toggle ${soundsEnabled ? 'active' : ''}`}
                onClick={toggleSounds}
              />
            </div>
            <div className="setting-card">
              <div className="setting-info">
                <span className="setting-label">Celebration</span>
                <span className="setting-value">Neon Confetti</span>
              </div>
              <div
                className={`toggle ${celebrationEnabled ? 'active' : ''}`}
                onClick={() => setCelebrationEnabled(!celebrationEnabled)}
              />
            </div>
            <div className="setting-card setting-card--full">
              <div className="setting-info">
                <span className="setting-label">Spin Duration</span>
                <span className="setting-value">{spinDurationSec}s</span>
              </div>
              <input
                className="spin-duration-slider"
                type="range"
                min={2}
                max={60}
                step={1}
                value={spinDurationSec}
                onChange={e => updateSpinDuration(Number(e.target.value) * 1000)}
                aria-label="Spin duration in seconds"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Recent Spins */}
      <section className="recent-section">
        <div className="recent-header">
          <h3 className="recent-title">Recent Spins</h3>
          <button className="view-history-link" onClick={() => setHistoryOpen(true)}>View Full History</button>
        </div>
        <div className="recent-grid">
          {recentSpins.length === 0 ? (
            <p className="recent-empty">Spin the wheel to start tracking history.</p>
          ) : (
            recentSpins.map(entry => (
              <div key={entry.id} className="session-card">
                <div className="session-icon session-icon--color" style={{ background: entry.color + '26' }}>
                  <div className="session-color-dot" style={{ background: entry.color }} />
                </div>
                <div className="session-info">
                  <span className="session-name">{entry.label}</span>
                  <span className="session-time">{formatRelativeTime(entry.ts)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

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
        onNew={() => { createWheel(); setWheelsOpen(false); }}
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

      {showCapToast && (
        <div className="toast toast--warning">
          Maximum 50 wheels reached. Delete a wheel to create a new one.
        </div>
      )}

      {showCopiedToast && (
        <div className="toast toast--success">
          Copied!
        </div>
      )}

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
          <a href="#">Feedback</a>
        </div>
      </footer>
    </div>
  );
}
