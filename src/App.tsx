import React, { useState, useCallback, useTransition } from 'react';
import './styles.css';
import { useSegments, type Segment } from './hooks/useSegments';
import { useSpinHistory } from './hooks/useSpinHistory';
import { SegmentTable } from './components/SegmentTable';
import { Wheel } from './components/Wheel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { TemplatesModal } from './components/TemplatesModal';
import { formatRelativeTime } from './utils/timeFormat';
import { Share2, Settings, User } from 'lucide-react';

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

const WHEEL_NAME = 'Decision Wheel';


export default function App() {
  const {
    segments,
    updateWeight,
    updatePercentage,
    updateLabel,
    updateColor,
    addSegment,
    removeSegment,
    setSegments
  } = useSegments();
  const { history, addEntry, clearHistory } = useSpinHistory();
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [celebrationEnabled, setCelebrationEnabled] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const recentSessions = history.slice(0, 4);

  const loadPreset = useCallback((presetSegments: Segment[]) => {
    startTransition(() => {
      setSegments(presetSegments);
      setWinner(null);
    });
  }, [setSegments]);

  const loadTemplate = useCallback((templateSegments: Segment[]) => {
    startTransition(() => {
      setSegments(templateSegments);
      setWinner(null);
      setIsDirty(false);
    });
  }, [setSegments]);

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
    setTimeout(() => {
      if (winningSegment) {
        setWinner(winningSegment.label);
        addEntry({ label: winningSegment.label, color: winningSegment.color, wheelName: WHEEL_NAME });
      } else {
        setWinner(null);
      }
      setIsSpinning(false);
    }, 1500);
  }, [isSpinning, rotation, segments, addEntry]);

  const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);

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
          <div className="logo-text">DECISION<span>WHEEL</span></div>
        </div>
        <div className="nav-links">
          <a href="#">My Wheels</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setTemplatesOpen(true); }}>Templates</a>
          <a href="#">History</a>
        </div>
        <div className="nav-actions">
          <button className="new-wheel-btn">New Wheel</button>
          <button className="avatar-btn">
            <User size={18} />
          </button>
        </div>
      </nav>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">DECISION <span>STUDIO</span></h1>
          <p className="page-subtitle">Configure your game-show wheel with custom weightings and neon styles.</p>
        </div>
        <div className="header-actions">
          <button className="header-btn">
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
          {winner ? (
            <div className="winner-overlay">
              🎉 Winner: {winner}
            </div>
          ) : null}
        </div>

        {/* Segments Panel */}
        <div className="segments-panel">
          <div className="segments-header">
            <h2 className="segments-title">Segments</h2>
            <p className="segments-subtitle">Manage labels, colors and winning weights</p>
          </div>

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
                className={`toggle ${soundEnabled ? 'active' : ''}`}
                onClick={() => setSoundEnabled(!soundEnabled)}
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
          </div>
        </div>
      </main>

      {/* Recent Sessions */}
      <section className="recent-section">
        <div className="recent-header">
          <h3 className="recent-title">Recent Sessions</h3>
          <button className="view-history-link" onClick={() => setHistoryOpen(true)}>View Full History</button>
        </div>
        <div className="recent-grid">
          {recentSessions.length === 0 ? (
            <p className="recent-empty">Spin the wheel to start tracking history.</p>
          ) : (
            recentSessions.map(entry => (
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

      {/* Footer */}
      <footer className="app-footer">
        <span>© 2024 Decision Wheel Studio. Gamified Choices.</span>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Feedback</a>
        </div>
      </footer>
    </div>
  );
}
