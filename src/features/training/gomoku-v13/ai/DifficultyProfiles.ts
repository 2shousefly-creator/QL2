import type { GomokuDifficulty } from "../domain/gomokuTypes";

export type DifficultyProfile = Readonly<{
  version: 1; timeMs: number; nodes: number; maxDepth: number; beam: number;
  quiescence: number; ttEntries: number; solverFraction: number; solverNodes: number;
  solverPlies: number; vct: boolean; variety: number;
}>;
export const DIFFICULTY_PROFILES: Readonly<Record<GomokuDifficulty, DifficultyProfile>> = Object.freeze({
  easy: Object.freeze({ version: 1, timeMs: 200, nodes: 1200, maxDepth: 2, beam: 6,
    quiescence: 0, ttEntries: 2000, solverFraction: 0, solverNodes: 0, solverPlies: 0, vct: false, variety: 0.2 }),
  medium: Object.freeze({ version: 1, timeMs: 800, nodes: 12000, maxDepth: 4, beam: 10,
    quiescence: 2, ttEntries: 12000, solverFraction: 0.2, solverNodes: 2000, solverPlies: 9, vct: false, variety: 0.04 }),
  hard: Object.freeze({ version: 1, timeMs: 2800, nodes: 60000, maxDepth: 10, beam: 16,
    quiescence: 4, ttEntries: 40000, solverFraction: 0.4, solverNodes: 10000, solverPlies: 25, vct: true, variety: 0 }),
});

export function seededRandom(seed: string): () => number {
  let value = 2166136261;
  for (const c of seed) value = Math.imul(value ^ c.charCodeAt(0), 16777619);
  return () => { value ^= value << 13; value ^= value >>> 17; value ^= value << 5; return (value >>> 0) / 4294967296; };
}
