/**
 * Produces a stable pseudo-random float in [0, 1) from an immutable event key.
 * This helper has no mutable/global RNG state, so replaying the same event is safe.
 */
export function deterministicRandom(...parts: Array<string | number>): number {
  const key = parts.map((part) => String(part)).join("\u001f");
  let hash = 2166136261;

  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  hash += hash << 13;
  hash ^= hash >>> 7;
  hash += hash << 3;
  hash ^= hash >>> 17;
  hash += hash << 5;

  return (hash >>> 0) / 4294967296;
}

export function getEggQualityRandom(
  weatherSeed: number,
  animalInstanceId: string,
  cycleStartedAt: number,
  eggDoneAt: number
): number {
  return deterministicRandom(
    weatherSeed,
    "egg",
    animalInstanceId,
    cycleStartedAt,
    eggDoneAt
  );
}
