import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Clock } from 'lucide-react';
import type { SpinEntry } from '../hooks/useSpinHistory';
import { formatRelativeTime, formatAbsoluteTime } from '../utils/timeFormat';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: SpinEntry[];
  onClearHistory: () => void;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export function HistoryDrawer({ isOpen, onClose, history, onClearHistory }: HistoryDrawerProps) {
  const handleClear = () => {
    if (window.confirm('Clear all spin history? This cannot be undone.')) {
      onClearHistory();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="history-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="history-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="history-drawer-header">
              <div className="history-drawer-title-group">
                <Clock size={15} />
                <h2 className="history-drawer-title">Spin History</h2>
              </div>
              <div className="history-drawer-actions">
                {history.length > 0 && (
                  <button className="history-clear-btn" onClick={handleClear}>
                    <Trash2 size={13} />
                    Clear
                  </button>
                )}
                <button className="history-close-btn" onClick={onClose} aria-label="Close history">
                  <X size={18} />
                </button>
              </div>
            </div>

            <p className="history-count">
              {history.length} {history.length === 1 ? 'spin' : 'spins'} recorded
            </p>

            {history.length === 0 ? (
              <div className="history-empty">
                <span className="history-empty-icon">🎡</span>
                <p>No spins yet. Give the wheel a spin!</p>
              </div>
            ) : (
              <motion.div
                className="history-list"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {history.map(entry => (
                  <motion.div key={entry.id} className="history-entry" variants={itemVariants}>
                    <div className="history-swatch" style={{ background: entry.color }} />
                    <div className="history-entry-info">
                      <span className="history-entry-label">{entry.label}</span>
                      <span className="history-entry-wheel">{entry.wheelName}</span>
                    </div>
                    <div className="history-entry-time">
                      <span className="history-entry-relative">{formatRelativeTime(entry.ts)}</span>
                      <span className="history-entry-absolute">{formatAbsoluteTime(entry.ts)}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
