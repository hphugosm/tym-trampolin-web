import { describe, expect, it } from 'vitest';
import { BoxGeometry, BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';
import { createGearGeometry, createRockGeometry } from './geometry';
import { sampleFragments } from './sampling';

function withSurfaces(test: (source: BufferGeometry, target: BufferGeometry) => void) {
  const source = createRockGeometry(), target = createGearGeometry();
  try { test(source, target); } finally { source.dispose(); target.dispose(); }
}

describe('fragment sampling', () => {
  it('returns repeatable spatial pairs and bounded transforms inside the source surfaces', () => withSurfaces((source, target) => {
    const first = sampleFragments(source, target, 180, 32);
    const repeat = sampleFragments(source, target, 180, 32);
    const alternate = sampleFragments(source, target, 180, 33);
    expect(first).toEqual(repeat);
    expect(first.sourcePositions).not.toEqual(alternate.sourcePositions);
    expect(first.sourcePositions).not.toBe(repeat.sourcePositions);
    for (const [geometry, positions] of [[source, first.sourcePositions], [target, first.targetPositions]] as const) {
      geometry.computeBoundingBox();
      const bounds = geometry.boundingBox!.clone().expandByScalar(1e-5);
      for (let i = 0; i < positions.length; i += 3) {
        expect(bounds.containsPoint(new Vector3().fromArray(positions, i))).toBe(true);
      }
    }
    for (const buffer of [first.sourcePositions, first.targetPositions, first.scatter, first.rotations, first.scales]) {
      expect([...buffer].every(Number.isFinite)).toBe(true);
    }
    expect(Math.max(...first.scales)).toBeLessThanOrEqual(0.111);
    expect(Math.min(...first.scales)).toBeGreaterThanOrEqual(0.039);
    expect(Math.max(...first.scatter.map(Math.abs))).toBeLessThan(1.76);
  }));

  it('samples triangle area proportionally, including indexed geometry', () => {
    // Two distant triangles have a 1:16 area ratio; uniform triangle picking would fail this test.
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0, 10, 0, 0, 14, 0, 0, 10, 4, 0], 3));
    geometry.setIndex([0, 1, 2, 3, 4, 5]);
    try {
      const result = sampleFragments(geometry, geometry, 900);
      let largeTriangleCount = 0;
      for (let i = 0; i < result.count; i++) {
        if (result.sourcePositions[i * 3] >= 10) largeTriangleCount++;
        expect(result.sourcePositions[i * 3 + 2]).toBe(0);
      }
      expect(largeTriangleCount / result.count).toBeGreaterThan(0.9);
      expect(largeTriangleCount / result.count).toBeLessThan(0.98);
    } finally { geometry.dispose(); }
  });

  it('enforces the instance budget and rejects invalid counts and empty surfaces', () => {
    const box = new BoxGeometry(), empty = new BufferGeometry();
    try {
      expect(sampleFragments(box, box, 5000).count).toBe(900);
      expect(sampleFragments(box, box, 4.9).count).toBe(4);
      for (const count of [0, -2, NaN, Infinity]) expect(() => sampleFragments(box, box, count)).toThrow();
      expect(() => sampleFragments(empty, box, 10)).toThrow();
      const flat = new BufferGeometry();
      try {
        flat.setAttribute('position', new Float32BufferAttribute(new Float32Array(9), 3));
        expect(() => sampleFragments(flat, box, 10)).toThrow();
      } finally { flat.dispose(); }
    } finally { box.dispose(); empty.dispose(); }
  });
});
