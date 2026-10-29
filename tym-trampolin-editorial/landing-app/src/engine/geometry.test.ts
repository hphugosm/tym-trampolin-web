import { describe, expect, it } from 'vitest';
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3, type BufferGeometry } from 'three';
import { createGearGeometry, createRockGeometry } from './geometry';

function expectHealthySurface(geometry: BufferGeometry) {
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  expect(position.count).toBeGreaterThan(100);
  expect(normal.count).toBe(position.count);
  for (let i = 0; i < position.count; i++) {
    expect([position.getX(i), position.getY(i), position.getZ(i)].every(Number.isFinite)).toBe(true);
    const length = Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i));
    expect(length).toBeCloseTo(1, 5);
  }
  geometry.computeBoundingBox();
  expect(geometry.boundingBox!.getSize(new Vector3()).length()).toBeGreaterThan(2);
}

describe('procedural owned geometries', () => {
  it('reproduces rock geometry for a seed and changes its silhouette for another seed', () => {
    const rock = createRockGeometry(21), same = createRockGeometry(21), different = createRockGeometry(84);
    try {
      expect(rock).not.toBe(same);
      expect(Array.from(rock.getAttribute('position').array)).toEqual(Array.from(same.getAttribute('position').array));
      expect(Array.from(rock.getAttribute('position').array)).not.toEqual(Array.from(different.getAttribute('position').array));
      expectHealthySurface(rock);
      // Every shared edge must connect: each quantized vertex appears on multiple triangles.
      const vertices = new Map<string, number>();
      const position = rock.getAttribute('position');
      for (let i = 0; i < position.count; i++) {
        const key = [position.getX(i), position.getY(i), position.getZ(i)].map(x => x.toFixed(5)).join(',');
        vertices.set(key, (vertices.get(key) ?? 0) + 1);
      }
      expect([...vertices.values()].every(count => count >= 3)).toBe(true);
    } finally { rock.dispose(); same.dispose(); different.dispose(); }
  });

  it('shapes a thin, pointed handaxe with a broad lower body and closed radial surface', () => {
    const rock = createRockGeometry();
    const material = new MeshBasicMaterial({ side: DoubleSide });
    try {
      rock.computeBoundingBox();
      const size = rock.boundingBox!.getSize(new Vector3());
      expect(size.y / size.x).toBeGreaterThan(1.8);
      expect(size.y / size.x).toBeLessThan(2.1);
      expect(size.z / size.x).toBeLessThan(0.55);
      const position = rock.getAttribute('position');
      let crownWidth = 0, lowerWidth = 0;
      for (let i = 0; i < position.count; i++) {
        if (position.getY(i) > 1.3) crownWidth = Math.max(crownWidth, Math.abs(position.getX(i)));
        if (position.getY(i) < 0) lowerWidth = Math.max(lowerWidth, Math.abs(position.getX(i)));
      }
      expect(crownWidth).toBeLessThan(lowerWidth * 0.23);
      const mesh = new Mesh(rock, material);
      mesh.updateMatrixWorld(true);
      const ray = new Raycaster();
      // The morph relies on a single outward intersection from an interior origin.
      for (let i = 0; i < 240; i++) {
        const y = 1 - 2 * (i + 0.5) / 240;
        const radius = Math.sqrt(1 - y * y);
        const angle = i * Math.PI * (3 - Math.sqrt(5));
        ray.set(new Vector3(), new Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
        const hits = ray.intersectObject(mesh);
        expect(hits.length).toBeGreaterThan(0);
        // Triangle seams may report the same surface intersection twice.
        expect(hits.every(hit => Math.abs(hit.distance - hits[0].distance) < 1e-6)).toBe(true);
        expect(hits[0].face!.normal.dot(ray.ray.direction)).toBeGreaterThan(0);
      }
    } finally { rock.dispose(); material.dispose(); }
  });

  it('keeps the gear axle visibly open while the surrounding annulus is solid', () => {
    const gear = createGearGeometry();
    const material = new MeshBasicMaterial({ side: DoubleSide });
    try {
      expectHealthySurface(gear);
      const mesh = new Mesh(gear, material);
      mesh.updateMatrixWorld(true);
      const ray = new Raycaster(new Vector3(0, 0, 5), new Vector3(0, 0, -1));
      expect(ray.intersectObject(mesh)).toHaveLength(0);
      ray.set(new Vector3(0.8, 0, 5), new Vector3(0, 0, -1));
      expect(ray.intersectObject(mesh).length).toBeGreaterThan(0);
    } finally { gear.dispose(); material.dispose(); }
  });
});
