import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Plus, Trash2, Check, ChevronDown, X } from 'lucide-react';
import type { Palette as PaletteType } from '../data/palettes';

interface PalettesPanelProps {
  palettes: PaletteType[];
  currentColors: string[];
  onApplyPalette: (paletteId: string) => void;
  onSavePalette: (name: string, colors: string[]) => void;
  onDeletePalette: (id: string) => void;
}

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 28 },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: { duration: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.025, type: 'spring' as const, stiffness: 350, damping: 26 },
  }),
};

export function PalettesPanel({
  palettes,
  currentColors,
  onApplyPalette,
  onSavePalette,
  onDeletePalette,
}: PalettesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState('');

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
    setShowSaveForm(false);
    setSaveName('');
  }, []);

  const handleApply = useCallback((id: string) => {
    onApplyPalette(id);
    setIsOpen(false);
  }, [onApplyPalette]);

  const handleSave = useCallback(() => {
    const name = saveName.trim() || `Custom ${Date.now()}`;
    onSavePalette(name, currentColors);
    setShowSaveForm(false);
    setSaveName('');
  }, [saveName, currentColors, onSavePalette]);

  const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeletePalette(id);
  }, [onDeletePalette]);

  const defaultPalettes = palettes.filter(p => p.isDefault);
  const customPalettes = palettes.filter(p => !p.isDefault);

  return (
    <div className="palettes-panel">
      <button
        className="palettes-trigger"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Palette size={15} />
        <span>Palettes</span>
        <ChevronDown
          size={14}
          className={`palettes-chevron ${isOpen ? 'palettes-chevron--open' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="palettes-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="palettes-dropdown"
              role="listbox"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="palettes-header">
                <span className="palettes-header-title">Color Palettes</span>
                <button
                  className="palettes-close-btn"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close palettes"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Current colors preview */}
              <div className="palettes-current">
                <div className="palettes-current-label">Current</div>
                <div className="palettes-swatches palettes-swatches--current">
                  {currentColors.slice(0, 8).map((color, i) => (
                    <div
                      key={i}
                      className="palette-swatch"
                      style={{ background: color }}
                      title={color}
                    />
                  ))}
                  {currentColors.length > 8 && (
                    <span className="palettes-more">+{currentColors.length - 8}</span>
                  )}
                </div>
              </div>

              {/* Save current as palette */}
              {showSaveForm ? (
                <div className="palettes-save-form">
                  <input
                    type="text"
                    className="palettes-save-input"
                    placeholder="Palette name..."
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') setShowSaveForm(false);
                    }}
                    autoFocus
                  />
                  <button className="palettes-save-confirm" onClick={handleSave}>
                    <Check size={14} />
                  </button>
                  <button
                    className="palettes-save-cancel"
                    onClick={() => setShowSaveForm(false)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  className="palettes-save-btn"
                  onClick={() => setShowSaveForm(true)}
                >
                  <Plus size={14} />
                  Save current as palette
                </button>
              )}

              <div className="palettes-divider" />

              {/* Default palettes */}
              <div className="palettes-section">
                <div className="palettes-section-title">Built-in</div>
                <div className="palettes-list">
                  {defaultPalettes.map((palette, i) => (
                    <motion.button
                      key={palette.id}
                      className="palette-item"
                      custom={i}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => handleApply(palette.id)}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="palettes-swatches">
                        {palette.colors.slice(0, 6).map((color, j) => (
                          <div
                            key={j}
                            className="palette-swatch"
                            style={{ background: color }}
                          />
                        ))}
                      </div>
                      <span className="palette-item-name">{palette.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Custom palettes */}
              {customPalettes.length > 0 && (
                <div className="palettes-section">
                  <div className="palettes-section-title">Custom</div>
                  <div className="palettes-list">
                    {customPalettes.map((palette, i) => (
                      <motion.div
                        key={palette.id}
                        className="palette-item palette-item--custom"
                        custom={i + defaultPalettes.length}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div
                          className="palette-item-main"
                          onClick={() => handleApply(palette.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleApply(palette.id); }}
                        >
                          <div className="palettes-swatches">
                            {palette.colors.slice(0, 6).map((color, j) => (
                              <div
                                key={j}
                                className="palette-swatch"
                                style={{ background: color }}
                              />
                            ))}
                          </div>
                          <span className="palette-item-name">{palette.name}</span>
                        </div>
                        <button
                          className="palette-delete-btn"
                          onClick={e => handleDelete(e, palette.id)}
                          aria-label={`Delete ${palette.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
