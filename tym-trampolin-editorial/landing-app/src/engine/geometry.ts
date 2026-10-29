import { BufferGeometry, Color, ExtrudeGeometry, Float32BufferAttribute, Path, Shape } from 'three';

/** A closed, bifacial handaxe: pointed crown, broad heel and thin chipped edges.
 * Build shared points first, then expand triangles so each flake has a flat normal.
 * The stable, origin-containing shell also supports the morph's radial sampling.
 */
export function createRockGeometry(seed = 21): BufferGeometry {
  const phase = (Number.isFinite(seed) ? seed : 21) * 0.031;
  const sectors = 16;
  const profiles = [
    [-1.38, 0.39, 0.19], [-1.16, 0.66, 0.29], [-0.82, 0.82, 0.36],
    [-0.43, 0.85, 0.40], [-0.03, 0.77, 0.38], [0.35, 0.64, 0.33],
    [0.72, 0.49, 0.27], [1.05, 0.32, 0.20], [1.36, 0.15, 0.105],
    [1.55, 0.055, 0.045],
  ];
  const vertices: number[][] = [];
  for (let row = 0; row < profiles.length; row++) {
    const [height, width, depth] = profiles[row];
    for (let i = 0; i < sectors; i++) {
      // Keep side cutting edges aligned; offset face vertices into broad flake scars.
      const angle = i * Math.PI * 2 / sectors
        + 0.065 * Math.sin(row * 2.3 + i * 1.7 + phase) * Math.abs(Math.sin(i * Math.PI / 8));
      const edge = Math.abs(Math.cos(angle));
      const chip = 1 + 0.035 * Math.sin(row * 3.1 + i * 2.4 + phase);
      const ridge = 1 + 0.065 * Math.sin(row * 2.7 + i * 1.9 + phase);
      vertices.push([
        Math.cos(angle) * width * chip + 0.035 * Math.sin(height * 1.3),
        height,
        Math.sin(angle) * depth * (1 - 0.25 * edge) * ridge,
      ]);
    }
  }
  const heel = vertices.push([0, -1.52, 0]) - 1;
  const tip = vertices.push([0.025, 1.68, 0]) - 1;
  const positions: number[] = [];
  const triangle = (a: number, b: number, c: number) => {
    positions.push(...vertices[a], ...vertices[b], ...vertices[c]);
  };
  for (let row = 0; row < profiles.length - 1; row++) {
    for (let i = 0; i < sectors; i++) {
      const next = (i + 1) % sectors;
      const a = row * sectors + i, b = row * sectors + next;
      const c = (row + 1) * sectors + i, d = (row + 1) * sectors + next;
      // Alternate the diagonal to keep the flaking from reading as regular stripes.
      if ((row + i) % 2) { triangle(a, c, b); triangle(b, c, d); }
      else { triangle(a, c, d); triangle(a, d, b); }
    }
  }
  for (let i = 0; i < sectors; i++) {
    const next = (i + 1) % sectors;
    triangle(heel, i, next);
    triangle(tip, (profiles.length - 1) * sectors + next, (profiles.length - 1) * sectors + i);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  const colors = new Float32Array(positions.length);
  const color = new Color();
  for (let i = 0; i < positions.length; i += 3) {
    const [x, y, z] = positions.slice(i, i + 3);
    const light = 0.49 + 0.055 * Math.sin(x * 5.1 + y * 3.2 + z * 4.8 + phase);
    color.setRGB(light * 1.13, light * 1.01, light * 0.78);
    colors.set([color.r, color.g, color.b], i);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

/** A beveled, solid 12-tooth gear with a genuine round axle opening. */
export function createGearGeometry(): BufferGeometry {
  const shape = new Shape();
  const teeth = 12;
  // Four points per tooth create flat tips and readable shoulders.
  const pointsPerTooth = 4;
  for (let i = 0; i < teeth * pointsPerTooth; i++) {
    const angle = (i / (teeth * pointsPerTooth)) * Math.PI * 2;
    const radius = i % 4 === 1 || i % 4 === 2 ? 1.42 : 1.2;
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  shape.closePath();
  const hole = new Path();
  hole.absarc(0, 0, 0.43, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.29, steps: 1, bevelEnabled: true, bevelSegments: 2,
    bevelSize: 0.045, bevelThickness: 0.035, curveSegments: 40,
  });
  geometry.translate(0, 0, -0.145);
  geometry.rotateX(0.12);
  geometry.rotateY(-0.18);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
