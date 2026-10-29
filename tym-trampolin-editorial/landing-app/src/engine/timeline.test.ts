import { describe, expect, it } from 'vitest';
import { clampProgress, evaluateEvolution, PHASES } from './timeline';

describe('continuous deterministic morph timeline', () => {
  it('clamps overscroll and safely handles nonfinite input', () => {
    expect(clampProgress(-5)).toBe(0);
    expect(clampProgress(5)).toBe(1);
    expect(clampProgress(0.37)).toBe(0.37);
    for (const value of [NaN, Infinity, -Infinity]) expect(evaluateEvolution(value)).toEqual(evaluateEvolution(0));
  });

  it('starts with a complete matte stone and finishes with stable metal gear parameters', () => {
    expect(evaluateEvolution(0)).toMatchObject({ phase: 'stone', morph: 0, rounding: 0, flattening: 0, hole: 0, teeth: 0, metalness: 0.02, roughness: 0.9, transferAmount: 0, backgroundMix: 0 });
    expect(evaluateEvolution(1)).toMatchObject({ phase: 'gear', morph: 1, rounding: 1, flattening: 1, hole: 1, teeth: 1, transferAmount: 1, backgroundMix: 1 });
    expect(evaluateEvolution(1).metalness).toBeCloseTo(0.86);
    expect(evaluateEvolution(1).roughness).toBeCloseTo(0.25);
    const { progress: _start, ...start } = evaluateEvolution(0.85);
    const { progress: _end, ...end } = evaluateEvolution(1);
    expect(start).toEqual(end);
  });

  it('uses the requested phase boundaries and monotonic deformation windows', () => {
    expect(PHASES.map(phase => phase.id)).toEqual(['stone', 'rounding', 'wheel', 'teeth', 'gear']);
    for (const phase of PHASES) expect(evaluateEvolution(phase.start).phase).toBe(phase.id);
    expect(evaluateEvolution(0.15).rounding).toBe(0);
    expect(evaluateEvolution(0.25).rounding).toBeCloseTo(0.5);
    expect(evaluateEvolution(0.35).rounding).toBe(1);
    expect(evaluateEvolution(0.35).hole).toBe(0);
    expect(evaluateEvolution(0.475).hole).toBeCloseTo(0.5);
    expect(evaluateEvolution(0.60).hole).toBe(1);
    expect(evaluateEvolution(0.60).teeth).toBe(0);
    expect(evaluateEvolution(0.725).teeth).toBeCloseTo(0.5);
    expect(evaluateEvolution(0.725).metalness).toBeCloseTo(0.44);
    expect(evaluateEvolution(0.85).teeth).toBe(1);
  });

  it('reproduces identical geometric parameters when scrubbing backwards', () => {
    const states = Array.from({ length: 1001 }, (_, index) => evaluateEvolution(index / 1000));
    for (let index = 1000; index >= 0; index--) expect(evaluateEvolution(index / 1000)).toEqual(states[index]);
  });

  it('keeps a dense sweep finite, bounded and monotonic for deformation channels', () => {
    let previous = evaluateEvolution(0);
    for (let i = 0; i <= 5000; i++) {
      const state = evaluateEvolution(i / 5000);
      for (const value of Object.values(state)) if (typeof value === 'number') expect(Number.isFinite(value)).toBe(true);
      for (const key of ['morph', 'rounding', 'flattening', 'hole', 'teeth', 'transferAmount', 'backgroundMix'] as const) {
        expect(state[key]).toBeGreaterThanOrEqual(previous[key]);
        expect(state[key]).toBeLessThanOrEqual(1);
      }
      previous = state;
    }
  });

  it('has continuous numeric values at every transition boundary', () => {
    for (const boundary of [0, 0.15, 0.18, 0.25, 0.35, 0.45, 0.60, 0.80, 0.83, 0.85, 1]) {
      const before = evaluateEvolution(boundary - 1e-6);
      const after = evaluateEvolution(boundary + 1e-6);
      for (const key of Object.keys(before) as Array<keyof typeof before>) {
        const a = before[key];
        const b = after[key];
        if (typeof a === 'number' && typeof b === 'number') expect(Math.abs(a - b)).toBeLessThan(0.0001);
      }
    }
  });
});
