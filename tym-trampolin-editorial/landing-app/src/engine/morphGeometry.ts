import {
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  Sphere,
  Vector3,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  DoubleSide,
} from "three";
import { createRockGeometry } from "./geometry";

export interface MorphParameters {
  rounding: number;
  flattening: number;
  hole: number;
  teeth: number;
}
export interface MorphSurface {
  geometry: BufferGeometry;
  update: (parameters: MorphParameters) => void;
  dispose: () => void;
  readonly angularSegments: number;
  readonly radialSegments: number;
}
const clamp = (x: number) =>
  Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * A closed, fixed annular parameterization. At hole=0 the two inner rims and
 * their wall collapse onto the axis, giving a capped solid. Opening the hole
 * expands those same vertices continuously: no boolean, remesh, or model swap.
 * The degenerate axis wall is deliberate and never contributes visible area.
 */
export function createMorphSurface(
  quality: "standard" | "low" = "standard",
  seed = 21,
  resolution?: { angular: number; radial: number },
): MorphSurface {
  const angularSegments = resolution?.angular ?? (quality === "low" ? 96 : 144);
  const radialSegments = resolution?.radial ?? (quality === "low" ? 8 : 12);
  const n = angularSegments,
    r = radialSegments;
  // Front, two outer bevel/wall rings, back, two inner wall rings.
  const rings = 2 * (r + 1) + 4;
  const positions = new Float32Array(rings * n * 3);
  const normals = new Float32Array(positions.length);
  const colors = new Float32Array(positions.length).fill(1);
  const indices: number[] = [];
  for (let j = 0; j < rings; j++)
    for (let i = 0; i < n; i++) {
      const a = j * n + i,
        b = j * n + ((i + 1) % n);
      const c = ((j + 1) % rings) * n + i,
        d = ((j + 1) % rings) * n + ((i + 1) % n);
      indices.push(a, c, b, b, c, d);
    }
  const geometry = new BufferGeometry();
  const position = new BufferAttribute(positions, 3).setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", position);
  geometry.setAttribute(
    "normal",
    new BufferAttribute(normals, 3).setUsage(DynamicDrawUsage),
  );
  const colorAttribute = new BufferAttribute(colors, 3).setUsage(
    DynamicDrawUsage,
  );
  geometry.setAttribute("color", colorAttribute);
  geometry.setIndex(indices);
  // Conservative static bound avoids allocations during every scroll update.
  geometry.boundingSphere = new Sphere(new Vector3(), 2.2);
  // Sample the established faceted stone once. Its silhouette varies in all
  // three dimensions; extruding an angle-only rock radius causes polar bands.
  const sourcePositions = new Float32Array(positions.length);
  const sourceNormals = new Float32Array(positions.length);
  const sourceColors = new Float32Array(positions.length).fill(1);
  const sourceGeometry = createRockGeometry(seed);
  const stoneColors = sourceGeometry.getAttribute("color");
  const sourceMaterial = new MeshBasicMaterial({ side: DoubleSide });
  const sourceMesh = new Mesh(sourceGeometry, sourceMaterial);
  const ray = new Raycaster();
  const direction = new Vector3();
  sourceMesh.updateMatrixWorld(true);
  const sample = (j: number, i: number, x: number, y: number, z: number) => {
    direction.set(x, y, z).normalize();
    ray.set(new Vector3(), direction);
    const intersection = ray.intersectObject(sourceMesh)[0];
    const point = intersection?.point ?? direction.clone().multiplyScalar(1.25);
    const offset = (j * n + i) * 3;
    sourcePositions[offset] = point.x;
    sourcePositions[offset + 1] = point.y;
    sourcePositions[offset + 2] = point.z;
    const normal = intersection?.face?.normal ?? direction;
    sourceNormals[offset] = normal.x;
    sourceNormals[offset + 1] = normal.y;
    sourceNormals[offset + 2] = normal.z;
    if (intersection?.face && stoneColors) {
      const { a, b, c } = intersection.face;
      const weights = intersection.barycoord;
      const u = weights?.x ?? 1 / 3,
        v = weights?.y ?? 1 / 3,
        w = weights?.z ?? 1 / 3;
      sourceColors[offset] =
        stoneColors.getX(a) * u +
        stoneColors.getX(b) * v +
        stoneColors.getX(c) * w;
      sourceColors[offset + 1] =
        stoneColors.getY(a) * u +
        stoneColors.getY(b) * v +
        stoneColors.getY(c) * w;
      sourceColors[offset + 2] =
        stoneColors.getZ(a) * u +
        stoneColors.getZ(b) * v +
        stoneColors.getZ(c) * w;
    }
  };
  try {
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      for (let j = 0; j <= r; j++) {
        const latitude = ((j / r) * Math.PI) / 2;
        const x = Math.sin(latitude) * Math.cos(angle);
        const y = Math.sin(latitude) * Math.sin(angle);
        const z = j === r ? 0 : Math.cos(latitude);
        sample(j, i, x, y, z);
        sample(r + 3 + (r - j), i, x, y, -z);
      }
      sample(r + 1, i, Math.cos(angle), Math.sin(angle), 0);
      sample(r + 2, i, Math.cos(angle), Math.sin(angle), 0);
      sample(rings - 2, i, 0, 0, -1);
      sample(rings - 1, i, 0, 0, 1);
    }
  } finally {
    sourceGeometry.dispose();
    sourceMaterial.dispose();
  }
  // Immutable material coordinates advect with the surface during the morph.
  geometry.setAttribute(
    "aRestPosition",
    new BufferAttribute(sourcePositions, 3),
  );
  // Polygonal tooth profile: broad flat tips and root valleys, sloped shoulders.
  const toothRadius = (angle: number) => {
    const u = ((angle / (Math.PI * 2)) * 12) % 1;
    const keys = [1.18, 1.18, 1.42, 1.42, 1.18];
    const s = u * 4,
      k = Math.min(3, Math.floor(s));
    // Intersect a ray with a polygon edge, preserving actual flat tooth tips.
    const a = (k * Math.PI) / 24,
      b = ((k + 1) * Math.PI) / 24;
    const theta = (u * Math.PI) / 6;
    const ax = keys[k] * Math.cos(a),
      ay = keys[k] * Math.sin(a);
    const bx = keys[k + 1] * Math.cos(b),
      by = keys[k + 1] * Math.sin(b);
    return (
      (ax * by - ay * bx) /
      (Math.cos(theta) * (by - ay) - Math.sin(theta) * (bx - ax))
    );
  };
  let disposed = false;
  const update = (parameters: MorphParameters) => {
    if (disposed) return;
    const rounding = clamp(parameters.rounding),
      flat = clamp(parameters.flattening);
    const hole = clamp(parameters.hole),
      teeth = clamp(parameters.teeth);
    const opening = clamp((hole - 0.18) / 0.82);
    const inner = opening * opening * (3 - 2 * opening) * 0.43;
    const recess = clamp(hole / 0.18);
    const recessAmount = recess * recess * (3 - 2 * recess);
    const depth = mix(0.98, 0.22, flat);
    const sourceBlend = 1 - (1 - rounding) * (1 - flat);
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      const outer = mix(1.31, toothRadius(angle), teeth);
      const frontOuter = outer - 0.045 * flat;
      const frontInner = inner * (1 + 0.035 / 0.43);
      const set = (j: number, radius: number, z: number) => {
        const offset = (j * n + i) * 3;
        // Source -> rounded volume -> lathed disc. Flattening also completes
        // the source blend, making each public parameter safe independently.
        positions[offset] = mix(
          sourcePositions[offset],
          Math.cos(angle) * radius,
          sourceBlend,
        );
        positions[offset + 1] = mix(
          sourcePositions[offset + 1],
          Math.sin(angle) * radius,
          sourceBlend,
        );
        positions[offset + 2] = mix(
          sourcePositions[offset + 2],
          z,
          sourceBlend,
        );
      };
      for (let j = 0; j <= r; j++) {
        const t = j / r;
        const radius = mix(
          outer * Math.sin((t * Math.PI) / 2),
          mix(frontInner, frontOuter, t),
          flat,
        );
        const cap = mix(depth * Math.cos((t * Math.PI) / 2), depth, flat);
        // The two poles meet as a dimple before the aperture expands.
        // A circular hub is authored in physical radius, independent of tooth
        // length. The broad plate stays exactly planar instead of acquiring
        // the wavy reflections of a collar tied to angularly varying t-rings.
        const hubBlend = clamp((radius - 0.56) / 0.11);
        const machining =
          (resolution ? 1 : 0) *
          teeth *
          flat *
          0.02 *
          (1 - hubBlend * hubBlend * (3 - 2 * hubBlend));
        const z =
          (cap + machining) *
          (1 - recessAmount * Math.pow(1 - t, 4) * (1 - opening));
        set(j, radius, z);
        set(r + 3 + (r - j), radius, -z);
      }
      set(r + 1, outer, depth * 0.78 * flat);
      set(r + 2, outer, -depth * 0.78 * flat);
      const innerDepth = depth * (1 - recessAmount * (1 - opening)) * 0.78;
      set(rings - 2, inner, -innerDepth);
      set(rings - 1, inner, innerDepth);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    // Preserve the established source's coarse facets without derivative
    // normals from the very slender polar-grid triangles. Fade continuously
    // into smooth recomputed normals as the volume rounds and flattens.
    const normal = geometry.getAttribute("normal");
    for (let i = 0; i < normal.count; i++) {
      const offset = i * 3;
      let x = mix(sourceNormals[offset], normal.getX(i), sourceBlend);
      let y = mix(sourceNormals[offset + 1], normal.getY(i), sourceBlend);
      let z = mix(sourceNormals[offset + 2], normal.getZ(i), sourceBlend);
      const length = Math.hypot(x, y, z);
      if (length > 0.000001) {
        x /= length;
        y /= length;
        z /= length;
      } else {
        x = 0;
        y = 0;
        z = i < n ? 1 : -1;
      }
      normal.setXYZ(i, x, y, z);
      // Flint pigmentation follows the same surface; metal retains its original tint.
      colors[offset] = mix(sourceColors[offset], 1, teeth);
      colors[offset + 1] = mix(sourceColors[offset + 1], 1, teeth);
      colors[offset + 2] = mix(sourceColors[offset + 2], 1, teeth);
    }
    normal.needsUpdate = true;
    colorAttribute.needsUpdate = true;
  };
  update({ rounding: 0, flattening: 0, hole: 0, teeth: 0 });
  return {
    geometry,
    update,
    angularSegments,
    radialSegments,
    dispose: () => {
      if (!disposed) {
        disposed = true;
        geometry.dispose();
      }
    },
  };
}
