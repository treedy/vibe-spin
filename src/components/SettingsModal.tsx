import React, { useRef, useState } from 'react';
import { X, Download, Upload } from 'lucide-react';
import { Modal } from './Modal';
import {
  DEFAULT_SPIN_DURATION_MS,
  MAX_CUSTOM_SPIN_DURATION_MS,
  MIN_CUSTOM_SPIN_DURATION_MS,
} from '../hooks/useAudio';
import { APP_VERSION_METADATA } from '../version';

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

interface ExportPayload {
  version: 1;
  exportedAt: string;
  wheels: unknown[];
  activeWheelId: string;
  palettes: unknown[];
  settings: Record<string, unknown>;
}

function isValidExportPayload(data: unknown): data is ExportPayload {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    d.version === 1 &&
    Array.isArray(d.wheels) &&
    Array.isArray(d.palettes) &&
    typeof d.settings === 'object' &&
    d.settings !== null
  );
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importPayload, setImportPayload] = useState<ExportPayload | null>(
    null
  );

  const handleExport = () => {
    const wheels = JSON.parse(localStorage.getItem('vibe-spin:wheels') ?? '[]');
    const activeWheelId = localStorage.getItem('vibe-spin:activeWheelId') ?? '';
    const palettes = JSON.parse(
      localStorage.getItem('vibe-spin:palettes') ?? '[]'
    );
    const settings = JSON.parse(
      localStorage.getItem('vibe-spin:settings') ?? '{}'
    );

    const payload: ExportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      wheels,
      activeWheelId,
      palettes,
      settings,
    };

    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibe-spin-export-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    e.currentTarget.value = '';

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as unknown;
        if (!isValidExportPayload(parsed)) {
          setImportError(
            'Invalid export file. Please choose a valid Vibe-Spin export.'
          );
          setImportPayload(null);
          return;
        }
        setImportError(null);
        setImportPayload(parsed);
      } catch {
        setImportError(
          'Could not parse file. Make sure it is a valid JSON export.'
        );
        setImportPayload(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importPayload) return;
    localStorage.setItem(
      'vibe-spin:wheels',
      JSON.stringify(importPayload.wheels)
    );
    localStorage.setItem(
      'vibe-spin:activeWheelId',
      importPayload.activeWheelId ?? ''
    );
    localStorage.setItem(
      'vibe-spin:palettes',
      JSON.stringify(importPayload.palettes)
    );
    localStorage.setItem(
      'vibe-spin:settings',
      JSON.stringify(importPayload.settings)
    );
    window.location.reload();
  };

  const handleCancelImport = () => {
    setImportPayload(null);
    setImportError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Settings"
      disableBackdropClose
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
                Leave blank for default{' '}
                {(DEFAULT_SPIN_DURATION_MS / 1000).toFixed(1)}s spin
              </span>
            </div>
            <label className="setting-duration-input-wrap">
              <span className="sr-only">Spin Duration (seconds)</span>
              <input
                className="setting-duration-input"
                type="number"
                min={MIN_CUSTOM_SPIN_DURATION_MS / 1000}
                max={MAX_CUSTOM_SPIN_DURATION_MS / 1000}
                step={1}
                inputMode="numeric"
                aria-label="Spin Duration (seconds)"
                placeholder={`${DEFAULT_SPIN_DURATION_MS / 1000}`}
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

        <div className="settings-data-section">
          <span className="setting-label">Data</span>
          <div className="settings-data-actions">
            <button
              className="header-btn settings-data-btn"
              onClick={handleExport}
              aria-label="Export All"
            >
              <Download size={15} />
              Export All
            </button>
            <button
              className="header-btn settings-data-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Import"
            >
              <Upload size={15} />
              Import
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            aria-hidden="true"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {importError && (
            <p className="settings-import-error" role="alert">
              {importError}
            </p>
          )}
          {importPayload && (
            <div
              className="settings-import-confirm"
              role="region"
              aria-label="Confirm import"
            >
              <p className="settings-import-confirm-text">
                Importing will erase <strong>ALL</strong> current data (wheels,
                palettes, settings). This cannot be undone. Continue?
              </p>
              <div className="settings-import-confirm-actions">
                <button
                  className="header-btn"
                  onClick={handleCancelImport}
                  aria-label="Cancel import"
                >
                  Cancel
                </button>
                <button
                  className="header-btn settings-import-confirm-ok"
                  onClick={handleConfirmImport}
                  aria-label="Yes, Overwrite"
                >
                  Yes, Overwrite
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="privacy-modal-actions">
        <span className="settings-version">
          v{APP_VERSION_METADATA.appVersion}
        </span>
        <button className="header-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
