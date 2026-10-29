import { useSyncExternalStore } from "react";
import type { EvolutionStore } from "../engine/store";
/** Progress updates stay in the small inspector, away from editorial content. */
export function WebsiteLab({ store }: { store: EvolutionStore }) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return (
    <details className="developer-controls">
      <summary>LAB</summary>
      <div>
        <label>
          Vývoj <output>{Math.round(snapshot.progress * 100)} %</output>
          <input
            aria-label="Průběh evoluce"
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={snapshot.progress}
            onChange={(e) => store.setManualProgress(Number(e.target.value))}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={snapshot.ambient}
            onChange={(e) => store.setAmbient(e.target.checked)}
          />{" "}
          Ambient motion
        </label>
        <label>
          <input
            type="checkbox"
            checked={snapshot.wireframe}
            onChange={(e) => store.setWireframe(e.target.checked)}
          />{" "}
          Wireframe
        </label>
        {snapshot.manual && (
          <button onClick={store.resumeScroll}>Zpět ke scrollování</button>
        )}
      </div>
    </details>
  );
}
