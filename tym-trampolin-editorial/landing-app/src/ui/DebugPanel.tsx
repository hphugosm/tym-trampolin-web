import { useState, useSyncExternalStore } from 'react';
import type { EvolutionStore } from '../engine/store';
import type { QualityProfile } from '../engine/quality';
import { evaluateEvolution } from '../engine/timeline';

export function DebugPanel({ store, quality }: { store: EvolutionStore; quality: QualityProfile }) {
  const { progress, manual, ambient, surfaceFragments, wireframe } = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const morph = evaluateEvolution(progress).morph;
  const [open, setOpen] = useState(false);
  return <aside className={`debug-panel ${open ? '' : 'is-collapsed'}`} aria-label="Ovládání prototypu">
    <button className="debug-heading" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="debug-controls">
      <span><i /> LAB / OVLÁDÁNÍ</span><span aria-hidden="true">{open ? '−' : '+'}</span>
    </button>
    <div id="debug-controls" hidden={!open}>
      <div className="debug-label"><label htmlFor="progress">Průběh transformace</label><output htmlFor="progress" aria-live="off">{Math.round(progress * 100).toString().padStart(3, '0')}%</output></div>
      <input id="progress" type="range" min="0" max="1000" step="1" value={Math.round(progress * 1000)} aria-valuetext={`${Math.round(progress * 100)} procent`} onChange={(event) => store.setManualProgress(Number(event.target.value) / 1000)} />
      <div className="debug-morph"><span>Morph</span><output aria-label="Aktuální hodnota morphingu" aria-live="off">{morph.toFixed(3)}</output></div>
      <fieldset className="debug-options"><legend className="sr-only">Zobrazení scény</legend>
        <label><input type="checkbox" checked={ambient} onChange={(event) => store.setAmbient(event.target.checked)} /> Ambientní pohyb</label>
        <label><input type="checkbox" checked={surfaceFragments} onChange={(event) => store.setSurfaceFragments(event.target.checked)} /> Povrchové úlomky</label>
        <label><input type="checkbox" checked={wireframe} onChange={(event) => store.setWireframe(event.target.checked)} /> Wireframe</label>
      </fieldset>
      <div className="debug-meta"><span>12 ZUBŮ · SEED 21</span><span>{quality.label}</span></div>
      <button className={`sync-button ${manual ? 'is-manual' : ''}`} onClick={store.resumeScroll} disabled={!manual}>
        <span aria-hidden="true">{manual ? '↻' : '↕'}</span> {manual ? 'Zpět k ovládání scrollem' : 'Synchronizováno se scrollem'}
      </button>
    </div>
  </aside>;
}
