import { skillRank } from "./airCombatSkillRanks";
import { celestialProtection } from "./airCombatExpansion";
import type { AircraftCombatState } from "./airCombatTypes";
import { recordCoreMetric } from "./airCombatTelemetry";
import { hasCore, negativeStatusDuration } from "./airCombatCoreEffects";

export type AttackTag = "crimson_barrage" | "iron_suppression" | "radar_bombardment" | "basic" | "burst" | "needle_pair" | "scissor" | "suppressive_gate" | "kamikaze_dash" | "carpet_bomb" | "rail" | "emp" | "elite_execution" | "shock_clamp" | "acid" | "radar_lock" | "boss_wing" | "boss_fan" | "boss_sonic" | "boss_lane" | "boss_dash" | "boss_missile" | "boss_emp" | "boss_crossfire" | "boss_suppressive";
export interface StatusPayload { stun?: number; skillLock?: number; resourceJam?: number; resourceMultiplier?: number; armorBreak?: number; regenDisable?: number; healingReduction?: number; healingReceivedMultiplier?: number }
export type Allegiance = "player" | "hostile" | "friendly_hacked";
export type DamageDelivery = "direct_projectile" | "aircraft_collision" | "explosive_aoe" | "area_hazard" | "beam" | "shockwave";
export interface AttackMetadata { capturable?:boolean; allegiance?:Allegiance; delivery?:DamageDelivery; sourceEnemyId?: number; sourceEnemyType?: import("./airCombatTypes").EnemyType; attackTag?: AttackTag; majorBossAttack?: boolean; payload?: StatusPayload }
export type MarkName = "hunterMark" | "suppression" | "corrosion" | "targetLock" | "hunted";
export interface PlayerCombatStatus {
  stunnedUntil: number; skillLockedUntil: number; resourceJammedUntil: number;
  armorBrokenUntil: number; regenDisabledUntil: number; durations: Record<string,number>;
  healingReceivedUntil: number; healingReceivedMultiplier: number;
  jams: { until: number; multiplier: number }[];
  marks: Partial<Record<MarkName, { count: number; until: number; hits:number[]; window:number; sourceEnemyId?: number }>>;
}
export const createPlayerStatus = (): PlayerCombatStatus => ({ stunnedUntil: 0, skillLockedUntil: 0, resourceJammedUntil: 0, armorBrokenUntil: 0, regenDisabledUntil: 0, healingReceivedUntil: 0, healingReceivedMultiplier: 1, durations: {}, jams: [], marks: {} });
export function applyPlayerStatus(state: AircraftCombatState, payload: StatusPayload): void {
  if (Object.values(payload).some(value => typeof value === "number" && value > 0) && celestialProtection(state)) {recordCoreMetric(state,184,"controlBlocked",1);return;}
  const s = state.status, now = state.coreState.time;
  for (const [key, seconds] of [["stunnedUntil", payload.stun], ["skillLockedUntil", payload.skillLock], ["armorBrokenUntil", payload.armorBreak], ["regenDisabledUntil", payload.regenDisable]] as const) {
    if(key==="stunnedUntil"&&hardControlImmune(state))continue;
    recordStatusMitigation(state,seconds??0,s[key]);
    const duration = negativeStatusDuration(state, seconds ?? 0);
    if (duration > 0) { s[key] = Math.max(s[key], now + duration); s.durations[key] = s[key]-now; }
  }
  recordStatusMitigation(state,payload.healingReduction??0,now);
  const healingDuration = negativeStatusDuration(state, payload.healingReduction ?? 0);
  if (healingDuration > 0) {
    s.healingReceivedMultiplier = Math.min(s.healingReceivedUntil > now ? s.healingReceivedMultiplier : 1, payload.healingReceivedMultiplier ?? 1);
    s.healingReceivedUntil = now + healingDuration;
    s.durations.healingReceivedUntil = healingDuration;
  }
  recordStatusMitigation(state,payload.resourceJam??0,s.jams.find(j=>j.multiplier===(payload.resourceMultiplier??.5))?.until??0);
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
  if (duration > 0 && celestialProtection(state)) {recordCoreMetric(state,184,"controlBlocked",1);return 0;}
  recordStatusMitigation(state,duration,state.coreState.time);
  const seconds = negativeStatusDuration(state, duration);
  if (seconds <= 0) return 0;
  const old = state.status.marks[name], now = state.coreState.time;
  const hits=old && old.sourceEnemyId===sourceEnemyId ? old.hits.filter(t=>now-t<=seconds) : [];
  hits.push(now);
  const count=hits.length;
  state.status.marks[name] = { count, hits, window:seconds, until: now + seconds, sourceEnemyId };
  return count;
}
const hardControlImmune = (state:AircraftCombatState) => skillRank(state,"afterburner")>=5&&(state.activeEffects.afterburner??0)>0;
export const playerStunned = (state: AircraftCombatState) => !hardControlImmune(state)&&state.status.stunnedUntil > state.coreState.time;
export const playerSkillLocked = (state: AircraftCombatState) => (playerStunned(state) && !hasCore(state,203)) || state.status.skillLockedUntil > state.coreState.time;

export function tickPlayerStatus(state:AircraftCombatState):void {
 const now=state.coreState.time,s=state.status;
 s.jams=s.jams.filter(j=>j.until>now);
 for(const [name,mark] of Object.entries(s.marks)) {
  if(!mark || mark.until<=now)delete s.marks[name as MarkName];
  else {mark.hits=mark.hits.filter(t=>now-t<=mark.window);mark.count=mark.hits.length;}
 }
}

/** Compare the resolved expiry against the same application without Core 098.
 * Existing longer effects do not manufacture saved duration. UI never records metrics. */
function recordStatusMitigation(state:AircraftCombatState,seconds:number,priorUntil:number) {
  if(seconds<=0)return;
  const now=state.coreState.time,without=seconds*(hasCore(state,116)?.9:1),withCore=negativeStatusDuration(state,seconds);
  recordCoreMetric(state,98,"debuffSaved",Math.max(priorUntil,now+without)-Math.max(priorUntil,now+withCore));
}
