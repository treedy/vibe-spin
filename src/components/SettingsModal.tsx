import React from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
  soundsEnabled: boolean;
  onToggleSounds: () => void;
  celebrationEnabled: boolean;
  onToggleCelebration: () => void;
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
}: SettingsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Settings"
      triggerRef={triggerRef}
    >
      <div className="privacy-modal-header">
        <h2 className="privacy-modal-title">Settings</h2>
        <button className="templates-close-btn" onClick={onClose} aria-label="Close settings">
          <X size={18} />
        </button>
      </div>
      <div className="privacy-modal-content">
        <div className="settings-row">
          <div className="setting-card">
            <div className="setting-info">
              <span className="setting-label">Sound Effects</span>
              <span className="setting-value">Game Show Neon</span>
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
              <span className="setting-label">Celebration</span>
              <span className="setting-value">Neon Confetti</span>
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
        </div>
      </div>
      <div className="privacy-modal-actions">
        <button className="header-btn" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
