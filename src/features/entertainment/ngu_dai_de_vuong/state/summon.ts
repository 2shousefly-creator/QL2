import { SUMMON_TABLE } from '../data';
const expected = { hero: 1, shard: 20, S: 1, A: 3, B: 8, C: 20, bottles: 47 };
export function unitRandom(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Summon random value must be in [0, 1).');
  return value;
}
export function pickUniform<T>(items: readonly T[], value: number): T {
  if (!items.length) throw new Error('Summon pool is empty.');
  return items[Math.floor(unitRandom(value) * items.length)];
}
export function weightedReward(value: number) {
  if (SUMMON_TABLE.length !== 7 || new Set(SUMMON_TABLE.map(r => r.id)).size !== 7 || SUMMON_TABLE.some(r => expected[r.id as keyof typeof expected] !== r.weight) || SUMMON_TABLE.reduce((sum, r) => sum + r.weight, 0) !== 100) throw new Error('V1 summon table must use 1/20/1/3/8/20/47.');
  const point = unitRandom(value) * 100;
  let boundary = 0;
  for (const row of SUMMON_TABLE) { boundary += row.weight; if (point < boundary) return row; }
  throw new Error('Invalid summon distribution.');
}
