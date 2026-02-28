import React from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export function TermsModal({ isOpen, onClose, triggerRef }: TermsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Terms of service"
      {...(triggerRef ? { triggerRef } : {})}
    >
      <div className="privacy-modal-header">
        <h2 className="privacy-modal-title">Terms</h2>
        <button className="templates-close-btn" onClick={onClose} aria-label="Close terms of service">
          <X size={18} />
        </button>
      </div>
      <div className="privacy-modal-content">
        <p>
          By using VibeSpin, you agree to these terms. The service is provided as-is for personal and
          commercial use.
        </p>
        <ul>
          <li>No warranties or guarantees are made about availability or accuracy of outcomes.</li>
          <li>VibeSpin is not responsible for decisions made from wheel outcomes.</li>
          <li>You may not use the app for unlawful purposes.</li>
          <li>These terms may be updated at any time; continued use constitutes acceptance.</li>
          <li><strong>Effective date:</strong> January 1, 2026 (placeholder).</li>
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
