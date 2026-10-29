import { clampProgress } from './timeline';

export interface EvolutionSnapshot {
  progress: number;
  scrollProgress: number;
  manual: boolean;
  ambient: boolean;
  surfaceFragments: boolean;
  wireframe: boolean;
}

/** A per-experience store. No React state updates inside the instancing loop. */
export function createEvolutionStore() {
  let snapshot: EvolutionSnapshot = { progress: 0, scrollProgress: 0, manual: false, ambient: true, surfaceFragments: false, wireframe: false };
  const listeners = new Set<() => void>();
  const publish = (next: EvolutionSnapshot) => {
    if (next.progress === snapshot.progress && next.scrollProgress === snapshot.scrollProgress && next.manual === snapshot.manual && next.ambient === snapshot.ambient && next.surfaceFragments === snapshot.surfaceFragments && next.wireframe === snapshot.wireframe) return;
    snapshot = next;
    listeners.forEach((listener) => listener());
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    setScrollProgress: (progress: number) => {
      const p = clampProgress(progress);
      publish({ ...snapshot, scrollProgress: p, progress: snapshot.manual ? snapshot.progress : p });
    },
    setManualProgress: (progress: number) => publish({ ...snapshot, manual: true, progress: clampProgress(progress) }),
    setAmbient: (ambient: boolean) => publish({ ...snapshot, ambient }),
    setSurfaceFragments: (surfaceFragments: boolean) => publish({ ...snapshot, surfaceFragments }),
    setWireframe: (wireframe: boolean) => publish({ ...snapshot, wireframe }),
    resumeScroll: () => publish({ ...snapshot, manual: false, progress: snapshot.scrollProgress }),
  };
}

export type EvolutionStore = ReturnType<typeof createEvolutionStore>;
