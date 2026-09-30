export type SoloRule = "random" | "copy";
export type SoloPhase = "reveal" | "round_setup" | "core_selection" | "countdown" | "combat" | "round_result" | "sudden_death" | "match_result";
export const DUEL_LEVELS = [1, 6, 11, 16, 18, 18, 18, 18, 18] as const;
export const DUEL_CORE_CONTEXTS = [1, 7, 11, 15] as const;
export const DUEL_PREP_SECONDS = 7;
export const DUEL_ROUND_SECONDS = 180;
export const DUEL_WINS = 5;
export const duelDamageMultiplier = (elapsed: number, suddenDeath: boolean) => suddenDeath || elapsed >= 150 ? 2 : elapsed >= 120 ? 1.5 : 1;
