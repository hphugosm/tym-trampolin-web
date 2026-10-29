import { describe, expect, it } from 'vitest';
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { createMorphSurface } from './morphGeometry';
import { evaluateEvolution } from './timeline';
import { createRockGeometry } from './geometry';
const state = (p: number) => ({ rounding: Math.min(1, p * 3), flattening: Math.min(1, p * 2), hole: Math.max(0, (p - 0.3) / 0.7), teeth: Math.max(0, (p - 0.6) / 0.4) });
describe('continuous owned morph surface', () => {
  it('preserves ochre flint colors and clears their tint continuously for the metal endpoint', () => {
    const surface = createMorphSurface('low');
    const colors = surface.geometry.getAttribute('color');
    const original = new Float32Array(colors.array);
    try {
      expect(colors.getX(0)).toBeGreaterThan(colors.getZ(0));
      expect(colors.getX(0)).toBeLessThan(1);
      surface.update(evaluateEvolution(0.72));
      expect(colors.getX(0)).toBeGreaterThan(original[0]);
      expect(colors.getX(0)).toBeLessThan(1);
      surface.update(evaluateEvolution(1));
      expect(Array.from(colors.array).every((value) => value === 1)).toBe(true);
      surface.update(evaluateEvolution(0));
      expect(colors.array).toEqual(original);
      expect(surface.geometry.getAttribute('color')).toBe(colors);
    } finally { surface.dispose(); }
  });
  it('keeps the real scroll-driven dimple and aperture transition continuous and reversible', () => {
    const surface = createMorphSurface('low');
    const position = surface.geometry.getAttribute('position');
    let previous: Float32Array | undefined;
    try {
      surface.update(evaluateEvolution(0.5));
      const reference = new Float32Array(position.array);
      for (let step = 300; step <= 650; step++) {
        surface.update(evaluateEvolution(step / 1000));
        const current = position.array;
        let largestChange = 0;
        let finite = true;
        for (let i = 0; i < current.length; i++) {
          finite = finite && Number.isFinite(current[i]);
          if (previous) largestChange = Math.max(largestChange, Math.abs(current[i] - previous[i]));
        }
        expect(finite).toBe(true);
        if (previous) expect(largestChange).toBeLessThan(0.04);
        previous = new Float32Array(current);
      }
      surface.update(evaluateEvolution(0.5));
      expect(position.array).toEqual(reference);
    } finally { surface.dispose(); }
  });
  it('keeps buffers stable, remains finite through a dense sweep and reverses exactly', () => {
    const surface = createMorphSurface();
    const geometry = surface.geometry, position = geometry.getAttribute('position'), normal = geometry.getAttribute('normal'), index = geometry.index;
    const saved = new Map<number, number[]>();
    let previous: number[] | undefined;
    try {
      for (let step = 0; step <= 200; step++) {
        surface.update(state(step / 200));
        const current = Array.from(position.array);
        expect(current.every(Number.isFinite)).toBe(true);
        expect(Array.from(normal.array).every(Number.isFinite)).toBe(true);
        let normalError = 0;
        for (let i = 0; i < normal.count; i++) normalError = Math.max(normalError, Math.abs(Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i)) - 1));
        expect(normalError).toBeLessThan(0.000001);
        if (previous) expect(Math.max(...current.map((x, i) => Math.abs(x - previous![i])))).toBeLessThan(0.11);
        if (step % 40 === 0) saved.set(step, current);
        previous = current;
      }
      for (const [step, expected] of [...saved].reverse()) { surface.update(state(step / 200)); expect(Array.from(position.array)).toEqual(expected); }
      expect(geometry.getAttribute('position')).toBe(position);
      expect(geometry.getAttribute('normal')).toBe(normal);
      expect(geometry.index).toBe(index);
      expect(position.count).toBeLessThan(16000);
    } finally { surface.dispose(); }
  });
  it('starts on the existing stone surface rather than an angle-only extrusion', () => {
    const surface = createMorphSurface('low');
    const reference = createRockGeometry();
    const material = new MeshBasicMaterial({ side: DoubleSide });
    const mesh = new Mesh(reference, material);
    mesh.updateMatrixWorld(true);
    try {
      const position = surface.geometry.getAttribute('position');
      for (const j of [1, 3, 5, 7]) for (const i of [7, 19, 31, 43]) {
        const angle = i / surface.angularSegments * Math.PI * 2;
        const latitude = j / surface.radialSegments * Math.PI / 2;
        const direction = new Vector3(Math.sin(latitude) * Math.cos(angle), Math.sin(latitude) * Math.sin(angle), Math.cos(latitude));
        const hit = new Raycaster(new Vector3(), direction).intersectObject(mesh)[0];
        expect(hit).toBeDefined();
        const actual = new Vector3().fromBufferAttribute(position, j * surface.angularSegments + i);
        expect(actual.distanceTo(hit.point)).toBeLessThan(0.000001);
      }
    } finally { surface.dispose(); reference.dispose(); material.dispose(); }
  });
  it('has twelve broad gear teeth and a physically thin final profile', () => {
    const surface = createMorphSurface();
    try {
      surface.update(state(1));
      const p = surface.geometry.getAttribute('position');
      const ring = surface.radialSegments + 1;
      const radius = Array.from({ length: surface.angularSegments }, (_, i) => Math.hypot(p.getX(ring * surface.angularSegments + i), p.getY(ring * surface.angularSegments + i)));
      const high = radius.map(value => value > 1.35);
      expect(high.filter((value, i) => value && !high[(i + high.length - 1) % high.length])).toHaveLength(12);
      expect(Math.max(...Array.from({ length: p.count }, (_, i) => Math.abs(p.getZ(i))))).toBeCloseTo(0.22, 5);
    } finally { surface.dispose(); }
  });
  it('opens a true axle aperture from an opaque solid', () => {
    const surface = createMorphSurface();
    const material = new MeshBasicMaterial({ side: DoubleSide });
    const mesh = new Mesh(surface.geometry, material);
    mesh.updateMatrixWorld(true);
    const ray = new Raycaster(new Vector3(0.001, 0.001, 5), new Vector3(0, 0, -1));
    try {
      expect(ray.intersectObject(mesh).length).toBeGreaterThan(0);
      surface.update(state(1));
      expect(ray.intersectObject(mesh)).toHaveLength(0);
      ray.set(new Vector3(0.8, 0, 5), new Vector3(0, 0, -1));
      expect(ray.intersectObject(mesh).length).toBeGreaterThan(0);
    } finally { surface.dispose(); material.dispose(); }
  });
  it('recesses the poles continuously before opening and owns independent resources', () => {
    const surface = createMorphSurface('low'), second = createMorphSurface('low');
    let disposed = 0;
    surface.geometry.addEventListener('dispose', () => disposed++);
    try {
      expect(surface.geometry).not.toBe(second.geometry);
      expect(surface.geometry.getAttribute('position').count).toBeLessThan(8000);
      const samples = [0, 0.00001, 0.17999, 0.18, 0.18001];
      let previous: number[] | undefined;
      for (const hole of samples) {
        surface.update({ rounding: 1, flattening: 1, hole, teeth: 0 });
        const current = Array.from(surface.geometry.getAttribute('position').array);
        expect(current.every(Number.isFinite)).toBe(true);
        if (previous && hole !== 0.17999) expect(Math.max(...current.map((x, i) => Math.abs(x - previous![i])))).toBeLessThan(0.001);
        previous = current;
      }
    } finally { surface.dispose(); surface.dispose(); second.dispose(); }
    expect(disposed).toBe(1);
  });
});
