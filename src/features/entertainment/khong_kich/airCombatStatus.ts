import type { AircraftCombatState } from "./airCombatTypes";
import { negativeStatusDuration } from "./airCombatCoreEffects";

export type AttackTag = "basic" | "burst" | "needle_pair" | "scissor" | "suppressive_gate" | "kamikaze_dash" | "carpet_bomb" | "rail" | "emp" | "elite_execution" | "shock_clamp" | "acid" | "radar_lock" | "boss_wing" | "boss_fan" | "boss_sonic" | "boss_lane" | "boss_dash" | "boss_missile" | "boss_emp" | "boss_crossfire" | "boss_suppressive";
export interface StatusPayload { stun?: number; skillLock?: number; resourceJam?: number; resourceMultiplier?: number; armorBreak?: number; regenDisable?: number }
export interface AttackMetadata { sourceEnemyId?: number; sourceEnemyType?: import("./airCombatTypes").EnemyType; attackTag?: AttackTag; majorBossAttack?: boolean; payload?: StatusPayload }
export type MarkName = "hunterMark" | "suppression" | "corrosion" | "targetLock" | "hunted";
export interface PlayerCombatStatus {
  stunnedUntil: number; skillLockedUntil: number; resourceJammedUntil: number;
  armorBrokenUntil: number; regenDisabledUntil: number; durations: Record<string,number>;
  jams: { until: number; multiplier: number }[];
  marks: Partial<Record<MarkName, { count: number; until: number; hits:number[]; window:number; sourceEnemyId?: number }>>;
}
export const createPlayerStatus = (): PlayerCombatStatus => ({ stunnedUntil: 0, skillLockedUntil: 0, resourceJammedUntil: 0, armorBrokenUntil: 0, regenDisabledUntil: 0, durations: {}, jams: [], marks: {} });
export function applyPlayerStatus(state: AircraftCombatState, payload: StatusPayload): void {
  const s = state.status, now = state.coreState.time;
  for (const [key, seconds] of [["stunnedUntil", payload.stun], ["skillLockedUntil", payload.skillLock], ["armorBrokenUntil", payload.armorBreak], ["regenDisabledUntil", payload.regenDisable]] as const) {
    const duration = negativeStatusDuration(state, seconds ?? 0);
    if (duration > 0) { s[key] = Math.max(s[key], now + duration); s.durations[key] = s[key]-now; }
  }
  const duration = negativeStatusDuration(state, payload.resourceJam ?? 0);
  if (duration > 0) {
    s.jams = s.jams.filter(j => j.until > now);
    const multiplier = payload.resourceMultiplier ?? .5;
    const same = s.jams.find(j => j.multiplier === multiplier);
    if (same) same.until = Math.max(same.until, now + duration);
    else s.jams.push({ until: now + duration, multiplier });
    s.resourceJammedUntil = Math.max(s.resourceJammedUntil, now + duration);
    s.durations.resourceJammedUntil=s.resourceJammedUntil-now;
  }
}
export function addStatusMark(state: AircraftCombatState, name: MarkName, duration: number, sourceEnemyId?: number): number {
  const seconds = negativeStatusDuration(state, duration);
  if (seconds <= 0) return 0;
  const old = state.status.marks[name], now = state.coreState.time;
  const hits=old && old.sourceEnemyId===sourceEnemyId ? old.hits.filter(t=>now-t<=seconds) : [];
  hits.push(now);
  const count=hits.length;
  state.status.marks[name] = { count, hits, window:seconds, until: now + seconds, sourceEnemyId };
  return count;
}
export const playerStunned = (state: AircraftCombatState) => state.status.stunnedUntil > state.coreState.time;
export const playerSkillLocked = (state: AircraftCombatState) => playerStunned(state) || state.status.skillLockedUntil > state.coreState.time;

export function tickPlayerStatus(state:AircraftCombatState):void {
 const now=state.coreState.time,s=state.status;
 s.jams=s.jams.filter(j=>j.until>now);
 for(const [name,mark] of Object.entries(s.marks)) {
  if(!mark || mark.until<=now)delete s.marks[name as MarkName];
  else {mark.hits=mark.hits.filter(t=>now-t<=mark.window);mark.count=mark.hits.length;}
 }
}
