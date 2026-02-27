import React from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export function PrivacyModal({ isOpen, onClose, triggerRef }: PrivacyModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Privacy policy"
      {...(triggerRef ? { triggerRef } : {})}
    >
      <div className="privacy-modal-header">
        <h2 className="privacy-modal-title">Privacy</h2>
        <button className="templates-close-btn" onClick={onClose} aria-label="Close privacy policy">
          <X size={18} />
        </button>
      </div>
      <div className="privacy-modal-content">
        <p>
          VibeSpin runs entirely in your browser. We do not require accounts and we do not send your
          wheel data to any server.
        </p>
        <ul>
          <li><strong>Data collected:</strong> none is transmitted off your device.</li>
          <li><strong>Storage:</strong> wheel state is saved in your browser&apos;s localStorage only.</li>
          <li><strong>Cookies:</strong> none.</li>
          <li><strong>Third-party services:</strong> none.</li>
          <li>
            <strong>Contact:</strong>{' '}
            <a href="https://github.com/treedy/vibe-spin/issues">open an issue on GitHub</a>.
          </li>
        </ul>
      </div>
      <div className="privacy-modal-actions">
        <button className="header-btn" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
