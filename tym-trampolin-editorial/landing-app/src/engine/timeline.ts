/** Morph geometry is a pure function of scroll; ambient motion belongs to the scene. */
export type Phase = 'stone' | 'rounding' | 'wheel' | 'teeth' | 'gear';

export const PHASES: ReadonlyArray<{ id: Phase; label: string; start: number; end: number }> = [
  { id: 'stone', label: 'Kámen', start: 0, end: 0.15 },
  { id: 'rounding', label: 'Zaoblení', start: 0.15, end: 0.35 },
  { id: 'wheel', label: 'Kamenné kolo', start: 0.35, end: 0.60 },
  { id: 'teeth', label: 'Ozubení', start: 0.60, end: 0.85 },
  { id: 'gear', label: 'Kovové kolo', start: 0.85, end: 1 },
];

export interface EvolutionState {
  progress: number;
  phase: Phase;
  morph: number;
  rounding: number;
  flattening: number;
  hole: number;
  teeth: number;
  metalness: number;
  roughness: number;
  transferAmount: number;
  backgroundMix: number;
  modelScale: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
}

/** Invalid input resets before it can poison geometry or GPU matrices. */
export function clampProgress(progress: number): number {
  return Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
}

export function smoothstep(start: number, end: number, progress: number): number {
  const t = clampProgress((progress - start) / (end - start));
  return t * t * (3 - 2 * t);
}

export function evaluateEvolution(progress: number): EvolutionState {
  const p = clampProgress(progress);
  const transferAmount = smoothstep(0.18, 0.83, p);
  const material = smoothstep(0.60, 0.85, p);
  return {
    progress: p,
    phase: p < 0.15 ? 'stone' : p < 0.35 ? 'rounding' : p < 0.60 ? 'wheel' : p < 0.85 ? 'teeth' : 'gear',
    morph: clampProgress(p / 0.85),
    rounding: smoothstep(0.15, 0.35, p),
    flattening: smoothstep(0.25, 0.60, p),
    hole: smoothstep(0.35, 0.60, p),
    teeth: smoothstep(0.60, 0.85, p),
    metalness: 0.02 + 0.84 * material,
    roughness: 0.90 - 0.65 * material,
    transferAmount,
    backgroundMix: smoothstep(0.45, 0.80, p),
    modelScale: 0.98 + 0.10 * transferAmount,
    rotationX: 0.18 - 0.06 * transferAmount,
    rotationY: -0.25 + 0.05 * transferAmount,
    rotationZ: 0.08 - 0.12 * transferAmount,
  };
}
