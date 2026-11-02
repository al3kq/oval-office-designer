import { useEffect, useRef, useState } from 'react';
import { encodeShareHash, exportDesign, importDesignFile } from '../model/codec';
import { useStore } from '../model/store';
import SharePopover from './SharePopover';

export default function Toolbar() {
  const design = useStore((state) => state.design);
  const past = useStore((state) => state.past);
  const future = useStore((state) => state.future);
  const loadDesign = useStore((state) => state.loadDesign);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const resetToEra = useStore((state) => state.resetToEra);
  const toast = useStore((state) => state.toast);
  const showToast = useStore((state) => state.showToast);
  const quality = useStore((state) => state.quality);
  const setQuality = useStore((state) => state.setQuality);
  const [name, setName] = useState(design.name);
  const [sharing, setSharing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => setName(design.name), [design.name]);

  function commitName() {
    if (name !== design.name) loadDesign({ ...design, name });
  }

  async function share() {
    if (sharing) {
      setSharing(false);
      return;
    }
    setSharing(true);
    const url = `${location.origin}${location.pathname}#${encodeShareHash(design)}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied');
    } catch {
      showToast('Copy the link above');
    }
  }

  async function importFile(file: File | undefined) {
    if (!file) return;
    const imported = await importDesignFile(file);
    if (imported) loadDesign(imported);
    else showToast('Not a valid Oval Office design');
  }

  async function screenshot() {
    // Keep the screenshot entry point in the lazily loaded 3D scene chunk.
    const { captureScreenshot } = await import('../three/Scene');
    const image = captureScreenshot();
    if (!image) {
      showToast('Screenshot unavailable');
      return;
    }
    const slug = design.name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'oval-office';
    const link = document.createElement('a');
    link.href = image;
    link.download = `${slug}.png`;
    link.click();
  }

  return (
    <header className="toolbar">
      <div className="toolbar-brand">Oval Office Designer</div>
      <input
        className="toolbar-name"
        aria-label="Design name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={commitName}
        onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }}
      />
      <div className="toolbar-actions">
        <button type="button" className="toolbar-button" onClick={undo} disabled={!past.length}>Undo</button>
        <button type="button" className="toolbar-button" onClick={redo} disabled={!future.length}>Redo</button>
        <button type="button" className="toolbar-button" onClick={resetToEra} disabled={!design.eraId}>Reset to era</button>
        <button type="button" className="toolbar-button" onClick={() => void screenshot()}>Screenshot</button>
        <label className="toolbar-quality">Quality
          <select value={quality} onChange={(event) => setQuality(event.target.value as 'high' | 'low')} aria-label="Graphics quality">
            <option value="high">High</option><option value="low">Low</option>
          </select>
        </label>
        <div className="share-wrap">
          <button type="button" className="toolbar-button" onClick={share} aria-expanded={sharing}>Share</button>
          {sharing && <SharePopover />}
        </div>
        <button type="button" className="toolbar-button" onClick={() => exportDesign(design)}>Export JSON</button>
        <button type="button" className="toolbar-button" onClick={() => fileInput.current?.click()}>Import JSON</button>
        <input
          ref={fileInput}
          className="toolbar-file-input"
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(event) => {
            void importFile(event.currentTarget.files?.[0]);
            event.currentTarget.value = '';
          }}
        />
      </div>
      <div className="toolbar-toast" role="status" aria-live="polite">{toast}</div>
    </header>
  );
}
