import { type BufferGeometry, Vector3 } from 'three';
import { createRandom } from './random';

export interface FragmentData {
  count: number;
  sourcePositions: Float32Array;
  targetPositions: Float32Array;
  scatter: Float32Array;
  rotations: Float32Array;
  scales: Float32Array;
}

type Point = [number, number, number];

/** Area-weighted triangle sampling works with both indexed and non-indexed meshes. */
function surfaceSamples(geometry: BufferGeometry, count: number, random: () => number): Point[] {
  const position = geometry.getAttribute('position');
  if (!position || position.itemSize < 3) throw new Error('Fragment sampling requires a 3D position attribute.');
  const index = geometry.getIndex();
  const vertexCount = index ? index.count : position.count;
  if (vertexCount % 3 !== 0) throw new Error('Fragment sampling requires triangle geometry.');
  const a = new Vector3(), b = new Vector3(), c = new Vector3();
  const ab = new Vector3(), ac = new Vector3();
  const cumulative: number[] = [];
  let total = 0;
  const read = (offset: number, output: Vector3) => output.fromBufferAttribute(position, index ? index.getX(offset) : offset);
  for (let i = 0; i < vertexCount; i += 3) {
    read(i, a); read(i + 1, b); read(i + 2, c);
    const area = ab.subVectors(b, a).cross(ac.subVectors(c, a)).length() * 0.5;
    if (!Number.isFinite(area)) throw new Error('Fragment geometry contains invalid coordinates.');
    total += area;
    cumulative.push(total);
  }
  if (!(total > 0)) throw new Error('Fragment geometry has no non-degenerate surface.');
  const samples: Point[] = [];
  for (let i = 0; i < count; i++) {
    const pick = random() * total;
    let low = 0, high = cumulative.length - 1;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (cumulative[middle] <= pick) low = middle + 1; else high = middle;
    }
    read(low * 3, a); read(low * 3 + 1, b); read(low * 3 + 2, c);
    const root = Math.sqrt(random()), other = random();
    const u = 1 - root, v = root * (1 - other), w = root * other;
    samples.push([a.x * u + b.x * v + c.x * w, a.y * u + b.y * v + c.y * w, a.z * u + b.z * v + c.z * w]);
  }
  // Angular ranking keeps nearby surface regions moving in related directions.
  return samples.sort((p, q) => Math.atan2(p[1], p[0]) - Math.atan2(q[1], q[0]) || p[2] - q[2]);
}

/** One-time CPU-only sampling; count is clamped to the prototype's 900-instance budget. */
export function sampleFragments(source: BufferGeometry, target: BufferGeometry, requestedCount: number, seed = 21): FragmentData {
  if (!Number.isFinite(requestedCount) || requestedCount < 1) throw new Error('Fragment count must be a positive finite number.');
  const count = Math.min(900, Math.max(1, Math.floor(requestedCount)));
  const random = createRandom(seed);
  const sources = surfaceSamples(source, count, random);
  const targets = surfaceSamples(target, count, random);
  const data: FragmentData = {
    count, sourcePositions: new Float32Array(count * 3), targetPositions: new Float32Array(count * 3),
    scatter: new Float32Array(count * 3), rotations: new Float32Array(count * 3), scales: new Float32Array(count),
  };
  for (let i = 0; i < count; i++) {
    data.sourcePositions.set(sources[i], i * 3);
    data.targetPositions.set(targets[i], i * 3);
    data.scatter.set([(random() - 0.5) * 3.4, (random() - 0.5) * 3.5, (random() - 0.5) * 2.2], i * 3);
    data.rotations.set([(random() - 0.5) * Math.PI * 4, (random() - 0.5) * Math.PI * 4, (random() - 0.5) * Math.PI * 4], i * 3);
    data.scales[i] = 0.04 + random() * 0.07;
  }
  return data;
}
