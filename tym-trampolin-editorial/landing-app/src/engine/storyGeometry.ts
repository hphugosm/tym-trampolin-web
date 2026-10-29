import { Color, Sphere, Vector3 } from "three";
import { createMorphSurface } from "./morphGeometry";
import { evaluateEvolution } from "./timeline";

export interface StorySurfaceState {
  from: number;
  to: number;
  mix: number;
  stoneProgress: number;
}
const clamp = (v: number) =>
  Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
const index = (v: number) =>
  Number.isFinite(v) ? Math.max(0, Math.min(4, Math.round(v))) : 0;
const white = new Color("#F3F5F9");
const steel = new Color("#7C8494");
const blue = new Color("#173DA5");
const electric = new Color("#2455FF");
const graphite = new Color("#252A34");
const bulbFrost = new Color("#DCE7FF");

/** Authored axial profiles avoid the sparse oblique triangles of ray sampling.
 * The profile coordinate allocates rings to the narrow screw/nozzle as well as
 * the broad crown, so small manufactured details survive on the low tier.
 */
type Profile = ReadonlyArray<readonly [number, number, number]>;
const bulbProfile: Profile = [
  [0, 1.48, 0],
  [0.04, 1.46, 0.19],
  [0.1, 1.34, 0.49],
  [0.18, 1.1, 0.76],
  [0.27, 0.78, 0.94],
  [0.35, 0.43, 1.0],
  [0.43, 0.08, 0.94],
  [0.51, -0.22, 0.73],
  [0.57, -0.43, 0.48],
  [0.61, -0.55, 0.34],
  [0.64, -0.61, 0.31],
  [0.67, -0.63, 0.34],
  [0.69, -0.67, 0.34],
  [0.71, -0.7, 0.29],
  [0.73, -0.74, 0.34],
  [0.75, -0.78, 0.29],
  [0.77, -0.82, 0.34],
  [0.79, -0.86, 0.29],
  [0.81, -0.9, 0.34],
  [0.83, -0.94, 0.29],
  [0.85, -0.98, 0.34],
  [0.87, -1.02, 0.29],
  [0.9, -1.08, 0.3],
  [0.92, -1.12, 0.27],
  [0.95, -1.15, 0.17],
  [0.97, -1.2, 0.16],
  [1, -1.22, 0],
];
const rocketProfile: Profile = [
  [0, 1.68, 0],
  [0.05, 1.6, 0.08],
  [0.12, 1.42, 0.2],
  [0.21, 1.12, 0.33],
  [0.3, 0.78, 0.4],
  [0.37, 0.58, 0.42],
  [0.43, 0.3, 0.42],
  [0.5, -0.04, 0.42],
  [0.57, -0.37, 0.42],
  [0.64, -0.64, 0.42],
  [0.72, -0.88, 0.42],
  [0.78, -1.03, 0.42],
  [0.81, -1.07, 0.44],
  [0.84, -1.12, 0.44],
  [0.86, -1.15, 0.3],
  [0.9, -1.25, 0.26],
  [0.95, -1.39, 0.36],
  [0.98, -1.42, 0.36],
  [1, -1.42, 0],
];
/** Shape-preserving cubic interpolation gives C1 glass/nose silhouettes.
 * Weighted harmonic slopes stop at extrema, preventing neck overshoot. Metal
 * threads and nozzle bands retain deliberately sharp linear axial sections.
 */
function sampleProfile(profile: Profile, t: number): [number, number] {
  let k = 0;
  while (k < profile.length - 2 && profile[k + 1][0] < t) k++;
  const a = profile[k],
    b = profile[k + 1];
  const h = b[0] - a[0];
  const q = Math.max(0, Math.min(1, (t - a[0]) / h));
  const smooth = profile === bulbProfile ? b[0] <= 0.64 : b[0] <= 0.37;
  const value = (axis: 1 | 2) => {
    if (!smooth) return a[axis] + (b[axis] - a[axis]) * q;
    const slope = (i: number) => {
      const left = Math.max(0, i - 1),
        right = Math.min(profile.length - 1, i + 1);
      if (left === i || right === i)
        return (
          (profile[right][axis] - profile[left][axis]) /
          (profile[right][0] - profile[left][0])
        );
      const h0 = profile[i][0] - profile[left][0],
        h1 = profile[right][0] - profile[i][0];
      const d0 = (profile[i][axis] - profile[left][axis]) / h0;
      const d1 = (profile[right][axis] - profile[i][axis]) / h1;
      if (d0 * d1 <= 0) return 0;
      const w0 = 2 * h1 + h0,
        w1 = h1 + 2 * h0;
      return (w0 + w1) / (w0 / d0 + w1 / d1);
    };
    const q2 = q * q,
      q3 = q2 * q;
    return (
      (2 * q3 - 3 * q2 + 1) * a[axis] +
      (q3 - 2 * q2 + q) * h * slope(k) +
      (-2 * q3 + 3 * q2) * b[axis] +
      (q3 - q2) * h * slope(k + 1)
    );
  };
  return [value(1), Math.max(0, value(2))];
}
function latheTarget(
  vertices: Float32Array,
  colors: Float32Array,
  n: number,
  r: number,
  shape: number,
) {
  const rings = 2 * (r + 1) + 4;
  for (let j = 0; j < rings; j++) {
    const t = j < rings - 2 ? j / (rings - 3) : j === rings - 2 ? 1 : 0;
    const [y, body] = sampleProfile(
      shape === 2 ? bulbProfile : rocketProfile,
      t,
    );
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      let radius = body;
      let tint =
        shape === 2
          ? y < -1.13
            ? graphite
            : y < -0.61
              ? steel
              : bulbFrost
          : white;
      if (shape === 4) {
        // Four swept fins with broad faces and beveled angular shoulders.
        // A finite angular width gives clean planar wedges rather than spikes.
        const a = Math.abs(Math.sin(angle * 2));
        const finWidth = Math.max(0, 1 - a / 0.24);
        const bevel = Math.min(1, finWidth * 1.4);
        const span =
          y < -0.34 && y > -1.15
            ? Math.min(1, (-0.34 - y) / 0.55) *
              Math.min(1, (y + 1.15) / 0.07) *
              0.62
            : 0;
        radius += span * bevel;
        tint =
          y < -1.16 ? graphite : span * bevel > 0.035 || y > 0.8 ? blue : white;
      }
      const offset = (j * n + i) * 3;
      vertices[offset] = Math.cos(angle) * radius;
      vertices[offset + 1] = y;
      vertices[offset + 2] = -Math.sin(angle) * radius;
      colors[offset] = tint.r;
      colors[offset + 1] = tint.g;
      colors[offset + 2] = tint.b;
    }
  }
}

/** Extruded square package and sixteen broad rectangular edge contacts. */
function chipTarget(
  vertices: Float32Array,
  colors: Float32Array,
  n: number,
  r: number,
) {
  const rings = 2 * (r + 1) + 4;
  const boxEnd = (
    dx: number,
    dy: number,
    x0: number,
    x1: number,
    y0: number,
    y1: number,
  ) => {
    const ax = Math.abs(dx) < 1e-9 ? -Infinity : Math.min(x0 / dx, x1 / dx);
    const bx = Math.abs(dx) < 1e-9 ? Infinity : Math.max(x0 / dx, x1 / dx);
    const ay = Math.abs(dy) < 1e-9 ? -Infinity : Math.min(y0 / dy, y1 / dy);
    const by = Math.abs(dy) < 1e-9 ? Infinity : Math.max(y0 / dy, y1 / dy);
    if (
      (Math.abs(dx) < 1e-9 && (x0 > 0 || x1 < 0)) ||
      (Math.abs(dy) < 1e-9 && (y0 > 0 || y1 < 0))
    )
      return 0;
    return Math.max(ax, ay, 0) <= Math.min(bx, by) ? Math.min(bx, by) : 0;
  };
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2,
      dx = Math.cos(angle),
      dy = Math.sin(angle);
    const square =
      1 / Math.pow(Math.abs(dx) ** 14 + Math.abs(dy) ** 14, 1 / 14);
    const pack = 0.86 * square,
      die = 0.36 * square;
    let outer = pack;
    for (let p = 0; p < 4; p++) {
      const c = -0.6 + p * 0.4;
      outer = Math.max(
        outer,
        boxEnd(dx, dy, 0.82, 1.16, c - 0.13, c + 0.13),
        boxEnd(dx, dy, -1.16, -0.82, c - 0.13, c + 0.13),
        boxEnd(dx, dy, c - 0.13, c + 0.13, 0.82, 1.16),
        boxEnd(dx, dy, c - 0.13, c + 0.13, -1.16, -0.82),
      );
    }
    const set = (j: number, radius: number, z: number, tint: Color) => {
      const offset = (j * n + i) * 3;
      vertices[offset] = dx * radius;
      vertices[offset + 1] = dy * radius;
      vertices[offset + 2] = z;
      colors[offset] = tint.r;
      colors[offset + 1] = tint.g;
      colors[offset + 2] = tint.b;
    };
    for (let j = 0; j <= r; j++) {
      const t = j / r;
      let radius: number, front: number;
      if (t <= 0.25) {
        radius = (die * t) / 0.25;
        front = 0.22;
      } else if (t <= 1 / 3) {
        const q = (t - 0.25) * 12;
        radius = die + 0.015 * square * q;
        front = 0.22 - 0.09 * q;
      } else if (t <= 7 / 12) {
        const q = (t - 1 / 3) * 4;
        radius = die + 0.015 * square + (pack - die - 0.015 * square) * q;
        front = 0.13;
      } else if (t <= 2 / 3) {
        radius = pack;
        front = 0.13 - (t - 7 / 12) * 12 * 0.065;
      } else {
        radius = pack + (outer - pack) * (t - 2 / 3) * 3;
        front = 0.065;
      }
      const isPin = radius > pack + 0.002;
      set(j, radius, front, t <= 0.25 ? electric : isPin ? steel : graphite);
      set(
        r + 3 + (r - j),
        radius,
        isPin ? -0.065 : -0.13,
        isPin ? steel : graphite,
      );
    }
    const edgeTint = outer > pack + 0.002 ? steel : graphite;
    set(r + 1, outer, 0.04, edgeTint);
    set(r + 2, outer, -0.04, edgeTint);
    set(rings - 2, 0, -0.13, graphite);
    set(rings - 1, 0, 0.22, electric);
  }
}

/**
 * One indexed mesh throughout the story. Original annular coordinates retain the
 * gear aperture; later cached radial solids collapse it continuously to a pole.
 * Lathed volumes are sampled once; the chip uses explicit planar cap rings.
 * Vertex colors are linear RGB, as expected by Three.js MeshStandardMaterial.
 */
export function createStorySurface(
  quality: "standard" | "low" = "standard",
  seed = 21,
) {
  const surface = createMorphSurface(
    quality,
    seed,
    quality === "low"
      ? { angular: 144, radial: 16 }
      : { angular: 192, radial: 24 },
  );
  const { geometry } = surface;
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const color = geometry.getAttribute("color");
  const targets: Float32Array[] = [];
  const pigments: Float32Array[] = [];
  surface.update(evaluateEvolution(0));
  targets[0] = Float32Array.from(position.array);
  pigments[0] = Float32Array.from(color.array);
  surface.update(evaluateEvolution(1));
  targets[1] = Float32Array.from(position.array);
  // White keeps the scene's blue metal tint independent of vertex pigment.
  pigments[1] = new Float32Array(position.array.length).fill(1);
  for (let shape = 2; shape <= 4; shape++) {
    const vertices = new Float32Array(position.array.length);
    const colors = new Float32Array(position.array.length);
    if (shape === 3) {
      chipTarget(
        vertices,
        colors,
        surface.angularSegments,
        surface.radialSegments,
      );
      targets[shape] = vertices;
      pigments[shape] = colors;
      continue;
    }
    latheTarget(
      vertices,
      colors,
      surface.angularSegments,
      surface.radialSegments,
      shape,
    );
    targets[shape] = vertices;
    pigments[shape] = colors;
  }
  geometry.boundingSphere = new Sphere(new Vector3(), 2.3);
  let disposed = false;
  const update = (state: StorySurfaceState) => {
    if (disposed) return;
    const from = index(state.from),
      to = index(state.to),
      t = clamp(state.mix);
    if (from === 0) {
      surface.update(evaluateEvolution(state.stoneProgress));
      return;
    }
    const a = targets[from],
      b = targets[to],
      ca = pigments[from],
      cb = pigments[to];
    const positions = position.array,
      colors = color.array;
    for (let k = 0; k < positions.length; k++) {
      positions[k] = a[k] + (b[k] - a[k]) * t;
      colors[k] = ca[k] + (cb[k] - ca[k]) * t;
    }
    position.needsUpdate = true;
    color.needsUpdate = true;
    geometry.computeVertexNormals();
    // Collapsed poles deliberately have zero-area triangles. Supply finite unit
    // normals for those vertices without touching their fixed buffer identity.
    for (let v = 0; v < normal.count; v++) {
      if (Math.hypot(normal.getX(v), normal.getY(v), normal.getZ(v)) < 1e-8)
        normal.setXYZ(
          v,
          0,
          from === 2 || from === 4 ? (v < surface.angularSegments ? 1 : -1) : 0,
          from === 2 || from === 4 ? 0 : v < surface.angularSegments ? 1 : -1,
        );
    }
    normal.needsUpdate = true;
  };
  update({ from: 0, to: 1, mix: 0, stoneProgress: 0 });
  return {
    geometry,
    update,
    angularSegments: surface.angularSegments,
    radialSegments: surface.radialSegments,
    dispose: () => {
      if (!disposed) {
        disposed = true;
        surface.dispose();
      }
    },
  };
}
