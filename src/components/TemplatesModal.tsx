import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TEMPLATES } from '../data/templates';
import type { Segment } from '../hooks/useSegments';

interface TemplatesModalProps {
  isOpen: boolean;
  isDirty: boolean;
  onClose: () => void;
  onLoadTemplate: (segments: Segment[]) => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 340, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 16,
    transition: { duration: 0.18 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, type: 'spring' as const, stiffness: 300, damping: 24 },
  }),
};

export function TemplatesModal({ isOpen, isDirty, onClose, onLoadTemplate }: TemplatesModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleLoad = (segments: Segment[]) => {
    if (isDirty) {
      const ok = window.confirm(
        'Loading this template will replace your current wheel. Continue?'
      );
      if (!ok) return;
    }
    onLoadTemplate(segments);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="templates-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="templates-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Wheel Templates"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="templates-modal-header">
              <div>
                <h2 className="templates-modal-title">Templates</h2>
                <p className="templates-modal-subtitle">Choose a preset to load instantly</p>
              </div>
              <button
                className="templates-close-btn"
                onClick={onClose}
                aria-label="Close templates"
              >
                <X size={18} />
              </button>
            </div>

            {/* Grid */}
            <div className="templates-grid">
              {TEMPLATES.map((template, i) => (
                <motion.button
                  key={template.id}
                  className="template-card"
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => handleLoad(template.segments)}
                  whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Mini swatch preview */}
                  <div className="template-swatches">
                    {template.segments.map((seg) => (
                      <div
                        key={seg.id}
                        className="template-swatch"
                        style={{ background: seg.color, flex: seg.weight }}
                        title={seg.label}
                      />
                    ))}
                  </div>

                  <div className="template-card-body">
                    <span className="template-card-name">{template.name}</span>
                    <span className="template-card-desc">{template.description}</span>
                    <span className="template-card-count">
                      {template.segments.length} segment{template.segments.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
