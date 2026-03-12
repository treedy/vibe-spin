import React from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal';
import {
  DEFAULT_SPIN_DURATION_MS,
  MAX_SPIN_DURATION_MS,
  MIN_SPIN_DURATION_MS,
} from '../hooks/useAudio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
  soundsEnabled: boolean;
  onToggleSounds: () => void;
  celebrationEnabled: boolean;
  onToggleCelebration: () => void;
  spinDurationMs: number | null;
  onSpinDurationChange: (value: number | null) => void;
}

function makeToggleKeyHandler(onToggle: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };
}

export function SettingsModal({
  isOpen,
  onClose,
  triggerRef,
  soundsEnabled,
  onToggleSounds,
  celebrationEnabled,
  onToggleCelebration,
  spinDurationMs,
  onSpinDurationChange,
}: SettingsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Settings"
      {...(triggerRef ? { triggerRef } : {})}
    >
      <div className="privacy-modal-header">
        <h2 className="privacy-modal-title">Settings</h2>
        <button
          className="templates-close-btn"
          onClick={onClose}
          aria-label="Close settings"
        >
          <X size={18} />
        </button>
      </div>
      <div className="privacy-modal-content">
        <div className="settings-row">
          <div className="setting-card">
            <div className="setting-info">
              <span className="setting-value">Sound Effects</span>
            </div>
            <div
              className={`toggle ${soundsEnabled ? 'active' : ''}`}
              role="switch"
              aria-checked={soundsEnabled}
              aria-label="Sound Effects"
              tabIndex={0}
              onClick={onToggleSounds}
              onKeyDown={makeToggleKeyHandler(onToggleSounds)}
            />
          </div>
          <div className="setting-card">
            <div className="setting-info">
              <span className="setting-value">Celebration</span>
            </div>
            <div
              className={`toggle ${celebrationEnabled ? 'active' : ''}`}
              role="switch"
              aria-checked={celebrationEnabled}
              aria-label="Celebration"
              tabIndex={0}
              onClick={onToggleCelebration}
              onKeyDown={makeToggleKeyHandler(onToggleCelebration)}
            />
          </div>
          <div className="setting-card setting-card--stacked">
            <div className="setting-info">
              <span className="setting-value">Spin Duration</span>
              <span className="setting-label">
                Leave blank to keep the classic{' '}
                {(DEFAULT_SPIN_DURATION_MS / 1000).toFixed(1)}s spin
              </span>
            </div>
            <label className="setting-duration-input-wrap">
              <span className="sr-only">Spin Duration (seconds)</span>
              <input
                className="setting-duration-input"
                type="number"
                min={MIN_SPIN_DURATION_MS / 1000}
                max={MAX_SPIN_DURATION_MS / 1000}
                step={1}
                inputMode="numeric"
                aria-label="Spin Duration (seconds)"
                placeholder={`${MIN_SPIN_DURATION_MS / 1000}`}
                value={spinDurationMs == null ? '' : spinDurationMs / 1000}
                onChange={(event) => {
                  const nextValue = event.currentTarget.value;
                  onSpinDurationChange(
                    nextValue === '' ? null : Number(nextValue) * 1000
                  );
                }}
              />
              <span className="setting-duration-suffix">sec</span>
            </label>
          </div>
        </div>
      </div>
      <div className="privacy-modal-actions">
        <button className="header-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
