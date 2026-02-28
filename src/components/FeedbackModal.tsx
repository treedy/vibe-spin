import React from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export function FeedbackModal({ isOpen, onClose, triggerRef }: FeedbackModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Feedback"
      {...(triggerRef ? { triggerRef } : {})}
    >
      <div className="privacy-modal-header">
        <h2 className="privacy-modal-title">Feedback</h2>
        <button className="templates-close-btn" onClick={onClose} aria-label="Close feedback">
          <X size={18} />
        </button>
      </div>
      <div className="privacy-modal-content">
        <p>
          We&apos;d love to hear from you! Have a feature request or found a problem?
        </p>
        <ul>
          <li>
            <strong>Submit an Issue</strong> on our GitHub repository for bug reports and feature
            requests.
          </li>
          <li>The project is open-source and contributions are welcome.</li>
        </ul>
        <p>
          <a
            href="https://github.com/treedy/vibe-spin/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            Submit an Issue on GitHub →
          </a>
        </p>
      </div>
      <div className="privacy-modal-actions">
        <button className="header-btn" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
