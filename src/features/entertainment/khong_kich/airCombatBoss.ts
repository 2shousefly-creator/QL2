/** Raw damage before Armor/Core mitigation; no vulnerability multiplier. */
export const BOSS_TUNING = {
 phase1: {wing:180,fan:140,sonic:300,dash:0,lane:0,missile:0,fanCount:7,rings:1,safeArc:42,ringInterval:.75,sonicWarning:.75,ringSpeed:190,dashWarning:.8,laneWarning:.7,dangerousLanes:2,missiles:0,missileSpeed:185,wingInterval:1.4,fanInterval:7.5,recovery:1.6,speedScale:1,cadence:1},
 phase2: {wing:210,fan:160,sonic:340,dash:500,lane:380,missile:190,fanCount:7,rings:2,safeArc:30,ringInterval:.68,sonicWarning:.65,ringSpeed:205,dashWarning:.8,laneWarning:.7,dangerousLanes:2,missiles:4,missileSpeed:185,wingInterval:1.3,fanInterval:6.5,recovery:1.1,speedScale:1,cadence:1},
 phase3: {wing:240,fan:180,sonic:380,dash:575,lane:430,missile:210,fanCount:7,rings:3,safeArc:22,ringInterval:.58,sonicWarning:.57,ringSpeed:220,dashWarning:.7,laneWarning:.6,dangerousLanes:3,missiles:6,missileSpeed:195,wingInterval:1.05,fanInterval:5.5,recovery:.85,speedScale:1,cadence:1},
 enrage: {wing:260,fan:200,sonic:400,dash:600,lane:450,missile:220,fanCount:7,rings:3,safeArc:18,ringInterval:.5,sonicWarning:.5,ringSpeed:235,dashWarning:.65,laneWarning:.52,dangerousLanes:3,missiles:6,missileSpeed:195,wingInterval:1.05,fanInterval:5.5,recovery:.65,speedScale:1.15,cadence:.8},
} as const;
export type BossTuning = (typeof BOSS_TUNING)[keyof typeof BOSS_TUNING];
export type BossMajorAttack = "sonic" | "dash" | "lane_laser" | "homing_missiles" | "emp" | "fan";
export type BossComboId = "sonic_wing" | "pincer_sweep" | "lane_wing" | "emp_pincer" | "ram_sweep" | "sonic_emp" | "lane_ram";
export interface BossAttackState {
 majorAttack: BossMajorAttack | null; majorCooldown:number; majorAge:number; sequenceStep:number;
 fanCount:number; missilesPending:number; missileIndex:number; missileCooldown:number; missileTuning:BossTuning;
 dashDamage:number; dashHitPlayer:boolean;
 comboId?:BossComboId; comboSteps?:{at:number;attack:BossMajorAttack}[]; comboTimer?:number;
 patternRemaining?:number; patternTimer?:number; patternIndex?:number;
 fanPending?:number; fanTimer?:number; fanIndex?:number; fanReverse?:boolean;
 punishmentFollowup?:number;
}
export function getBossTuning(ratio:number):BossTuning { return ratio<.15?BOSS_TUNING.enrage:ratio<.35?BOSS_TUNING.phase3:ratio<.7?BOSS_TUNING.phase2:BOSS_TUNING.phase1; }
export const SONIC_RING_SPEED=190;
export const SONIC_RING_THICKNESS=12;
export const SONIC_ACTIVE_SECONDS=3.6;
export const LANE_ACTIVE_SECONDS=.35;
