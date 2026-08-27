export function hashMatchSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) || 0x6d2b79f5;
}

export function nextSeededRandom(state: number): { value: number; state: number } {
  let next = (state >>> 0) || 0x6d2b79f5;
  next ^= next << 13;
  next ^= next >>> 17;
  next ^= next << 5;
  next >>>= 0;
  return { value: next / 0x1_0000_0000, state: next || 0x6d2b79f5 };
}

export function shuffleSeeded<T>(values: readonly T[], initialState: number): { values: T[]; state: number } {
  const shuffled = [...values];
  let state = initialState;
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const roll = nextSeededRandom(state);
    state = roll.state;
    const swapIndex = Math.floor(roll.value * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return { values: shuffled, state };
}

export function rollSeededChance(
  state: number,
  chance: number
): { success: boolean; value: number; state: number } {
  const roll = nextSeededRandom(state);
  const normalizedChance = Number.isFinite(chance) ? Math.min(1, Math.max(0, chance)) : 0;
  return { success: roll.value < normalizedChance, value: roll.value, state: roll.state };
}

export function pickSeeded<T>(
  values: readonly T[],
  state: number
): { value: T | undefined; index: number; state: number } {
  if (values.length === 0) return { value: undefined, index: -1, state: state >>> 0 };
  const roll = nextSeededRandom(state);
  const index = Math.min(values.length - 1, Math.floor(roll.value * values.length));
  return { value: values[index], index, state: roll.state };
}

/** Seeded Fisher-Yates tie breaker while preserving non-tied group ordering. */
export function sortWithSeededTies<T>(
  values: readonly T[],
  score: (value: T) => number,
  initialState: number,
  direction: "asc" | "desc" = "desc"
): { values: T[]; state: number } {
  const groups = new Map<number, T[]>();
  for (const value of values) {
    const numericScore = Number.isFinite(score(value)) ? score(value) : 0;
    const group = groups.get(numericScore) ?? [];
    group.push(value);
    groups.set(numericScore, group);
  }
  const orderedScores = [...groups.keys()].sort((a, b) => direction === "desc" ? b - a : a - b);
  const result: T[] = [];
  let state = initialState;
  for (const groupScore of orderedScores) {
    const shuffled = shuffleSeeded(groups.get(groupScore) ?? [], state);
    result.push(...shuffled.values);
    state = shuffled.state;
  }
  return { values: result, state };
}
