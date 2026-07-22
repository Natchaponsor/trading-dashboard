/** Deterministic PRNG so seeded data is stable across reloads. */
export function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Random = ReturnType<typeof mulberry32>;

export function randInt(rng: Random, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function randFloat(rng: Random, min: number, max: number) {
  return rng() * (max - min) + min;
}

export function pick<T>(rng: Random, arr: readonly T[]): T {
  return arr[randInt(rng, 0, arr.length - 1)];
}

export function chance(rng: Random, probability: number) {
  return rng() < probability;
}

export function gaussian(rng: Random, mean: number, stdDev: number) {
  const u1 = Math.max(rng(), 1e-9);
  const u2 = rng();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}
