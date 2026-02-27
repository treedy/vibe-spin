import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Layers } from 'lucide-react';
import type { WheelConfig } from '../hooks/useWheels';

interface WheelsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wheels: WheelConfig[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
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

export function WheelsDrawer({
  isOpen,
  onClose,
  wheels,
  activeId,
  onSelect,
  onDelete,
  onNew,
}: WheelsDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      onDelete(id);
    }
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
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
                <Layers size={15} />
                <h2 className="history-drawer-title">My Wheels</h2>
              </div>
              <div className="history-drawer-actions">
                <button className="wheels-new-btn" onClick={onNew}>
                  + New
                </button>
                <button className="history-close-btn" onClick={onClose} aria-label="Close wheels">
                  <X size={18} />
                </button>
              </div>
            </div>

            <p className="history-count">
              {wheels.length} {wheels.length === 1 ? 'wheel' : 'wheels'} saved
            </p>

            <motion.div
              className="history-list"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {wheels.map(wheel => (
                <motion.div
                  key={wheel.id}
                  className={`wheels-item${wheel.id === activeId ? ' wheels-item--active' : ''}`}
                  variants={itemVariants}
                  onClick={() => handleSelect(wheel.id)}
                >
                  <div className="wheels-swatches">
                    {wheel.segments.slice(0, 6).map(seg => (
                      <div
                        key={seg.id}
                        className="wheels-swatch"
                        style={{ background: seg.color }}
                      />
                    ))}
                  </div>
                  <div className="wheels-item-info">
                    <span className="wheels-item-name">{wheel.name}</span>
                    <span className="wheels-item-meta">
                      {wheel.segments.length} segment{wheel.segments.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {wheel.id === activeId && (
                    <span className="wheels-item-badge">Active</span>
                  )}
                  <button
                    className="wheels-item-delete"
                    onClick={e => handleDelete(e, wheel.id, wheel.name)}
                    aria-label={`Delete ${wheel.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
