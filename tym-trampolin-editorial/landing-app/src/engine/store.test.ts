import { describe, expect, it, vi } from 'vitest';
import { createEvolutionStore } from './store';

describe('evolution progress store', () => {
  it('freezes manual progress while retaining the latest scroll and resumes there', () => {
    const store = createEvolutionStore();
    store.setScrollProgress(0.2);
    expect(store.getSnapshot()).toMatchObject({ progress: 0.2, scrollProgress: 0.2, manual: false });
    store.setManualProgress(0.75);
    store.setScrollProgress(0.4);
    store.setScrollProgress(0.1);
    expect(store.getSnapshot()).toMatchObject({ progress: 0.75, scrollProgress: 0.1, manual: true });
    store.resumeScroll();
    expect(store.getSnapshot()).toMatchObject({ progress: 0.1, scrollProgress: 0.1, manual: false });
    store.setScrollProgress(0.5);
    expect(store.getSnapshot()).toMatchObject({ progress: 0.5, scrollProgress: 0.5, manual: false });
  });

  it('changes debug flags without changing either progress source', () => {
    const store = createEvolutionStore();
    const listener = vi.fn();
    store.subscribe(listener);
    expect(store.getSnapshot()).toMatchObject({ ambient: true, surfaceFragments: false, wireframe: false });
    store.setScrollProgress(0.2);
    store.setManualProgress(0.6);
    store.setAmbient(false);
    store.setSurfaceFragments(true);
    store.setWireframe(true);
    const snapshot = store.getSnapshot();
    expect(snapshot).toEqual({ progress: 0.6, scrollProgress: 0.2, manual: true, ambient: false, surfaceFragments: true, wireframe: true });
    store.setAmbient(false);
    store.setSurfaceFragments(true);
    store.setWireframe(true);
    expect(store.getSnapshot()).toBe(snapshot);
    expect(listener).toHaveBeenCalledTimes(5);
    store.resumeScroll();
    expect(store.getSnapshot()).toMatchObject({ progress: 0.2, ambient: false, surfaceFragments: true, wireframe: true });
  });

  it('clamps invalid or overscrolled input before publishing either source', () => {
    const store = createEvolutionStore();
    store.setScrollProgress(2);
    expect(store.getSnapshot()).toMatchObject({ progress: 1, scrollProgress: 1 });
    store.setScrollProgress(-1);
    expect(store.getSnapshot()).toMatchObject({ progress: 0, scrollProgress: 0 });
    for (const invalid of [NaN, Infinity, -Infinity]) {
      store.setScrollProgress(0.6);
      store.setScrollProgress(invalid);
      expect(store.getSnapshot()).toMatchObject({ progress: 0, scrollProgress: 0, manual: false });
      store.setManualProgress(0.8);
      store.setManualProgress(invalid);
      expect(store.getSnapshot()).toMatchObject({ progress: 0, scrollProgress: 0, manual: true });
      store.resumeScroll();
    }
    store.setManualProgress(3);
    expect(store.getSnapshot().progress).toBe(1);
    store.setManualProgress(-3);
    expect(store.getSnapshot().progress).toBe(0);
  });

  it('notifies active subscribers and stops notifying after unsubscribe', () => {
    const store = createEvolutionStore();
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribe = store.subscribe(first);
    store.subscribe(second);
    store.setScrollProgress(0.2);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    unsubscribe();
    unsubscribe();
    store.setManualProgress(0.7);
    store.setScrollProgress(0.4);
    store.resumeScroll();
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(4);
  });

  it('preserves snapshot identity and emits nothing when values are unchanged', () => {
    const store = createEvolutionStore();
    const listener = vi.fn();
    store.subscribe(listener);
    const initial = store.getSnapshot();
    store.setScrollProgress(0);
    store.resumeScroll();
    expect(store.getSnapshot()).toBe(initial);
    expect(listener).not.toHaveBeenCalled();

    store.setManualProgress(0.5);
    const manual = store.getSnapshot();
    store.setManualProgress(0.5);
    store.setScrollProgress(0);
    expect(store.getSnapshot()).toBe(manual);
    expect(listener).toHaveBeenCalledTimes(1);

    // Switching source must publish even if its displayed progress is identical.
    store.setScrollProgress(0.5);
    store.resumeScroll();
    expect(store.getSnapshot()).toMatchObject({ progress: 0.5, scrollProgress: 0.5, manual: false });
    expect(listener).toHaveBeenCalledTimes(3);
    const resumed = store.getSnapshot();
    store.resumeScroll();
    store.setScrollProgress(0.5);
    expect(store.getSnapshot()).toBe(resumed);
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
