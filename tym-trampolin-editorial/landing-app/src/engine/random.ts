/** Small seeded PRNG. Randomness is evaluated only during scene construction. */
export function createRandom(seed = 21): () => number {
  let state = Number.isFinite(seed) ? seed >>> 0 : 21;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
