import type { AircraftCombatState } from "./airCombatTypes";

/** Run-local 26.10.1 state. No profile or save migration. */
export interface ReleaseCoreState {
  aimShots?: number;
  aimBonusReady?: boolean;
  waitingChest?: { remaining:number; claimed:boolean; cancelled:boolean; rewardLabel?:string };
  pendingGuaranteedDiamondSelection?: boolean;
  reserve: number;
  followups: "primary"[];
  mode?: "small" | "giant";
  nextMode: number;
  heat: number;
  overheatUntil: number;
  lastSkillEnd: number;
  lastCast?: number;
  hadActiveSkill: boolean;
  ghostReady: number;
  ghosts: { id: number; x: number; y: number; angle: number; until: number; fireIn: number }[];
  markReady: number;
  mark?: { target: number; until: number; damage: number };
  misses: number;
  aimReady: boolean;
}
export const releaseState = (s: AircraftCombatState): ReleaseCoreState => s.coreState.release ??= {
  reserve: 0, followups: [], nextMode: Infinity,
  heat: 0, overheatUntil: 0, lastSkillEnd: s.coreState.time, hadActiveSkill: false,
  ghostReady: Infinity, ghosts: [], markReady: Infinity, misses: 0, aimReady: false,
};
export const playerAirframeScale = (s: AircraftCombatState) => !s.selectedCores.includes("core_222") ? 1 : s.coreState.release?.mode === "small" ? .5 : s.coreState.release?.mode === "giant" ? 1.5 : 1;
export const overheated = (s: AircraftCombatState) => s.selectedCores.includes("core_219") && (s.coreState.release?.overheatUntil ?? 0) > s.coreState.time;
