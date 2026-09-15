/** Applied once at player impact, before Armor/Core mitigation. */
export const BOSS_DAMAGE_MULTIPLIER = 1.10;
/** Unscaled baseline raw damage; no vulnerability multiplier. */
export const BOSS_TUNING = {
 phase1: {wing:180,fan:140,sonic:300,dash:0,lane:0,missile:0,fanCount:7,rings:1,safeArc:32,ringInterval:0.75,sonicWarning:0.68,ringSpeed:195,dashWarning:0.75,laneWarning:0.62,laneCount:0,laneSteps:0,laneActive:0,laneRecovery:0,suppressiveBudget:14,missiles:0,missileSpeed:185,wingInterval:1.1,fanInterval:7.5,recovery:1.2,speedScale:1,cadence:1},
 phase2: {wing:210,fan:160,sonic:340,dash:500,lane:380,missile:190,fanCount:9,rings:2,safeArc:20,ringInterval:0.58,sonicWarning:0.57,ringSpeed:215,dashWarning:0.74,laneWarning:0.62,laneCount:5,laneSteps:2,laneActive:0.3,laneRecovery:0.18,suppressiveBudget:24,missiles:6,missileSpeed:185,wingInterval:0.85,fanInterval:6.5,recovery:0.75,speedScale:1,cadence:1},
 phase3: {wing:240,fan:180,sonic:380,dash:575,lane:430,missile:210,fanCount:11,rings:3,safeArc:12,ringInterval:0.48,sonicWarning:0.5,ringSpeed:230,dashWarning:0.62,laneWarning:0.5,laneCount:7,laneSteps:3,laneActive:0.28,laneRecovery:0.14,suppressiveBudget:36,missiles:8,missileSpeed:195,wingInterval:0.64,fanInterval:5.5,recovery:0.5,speedScale:1,cadence:1},
 enrage: {wing:260,fan:200,sonic:400,dash:600,lane:450,missile:220,fanCount:13,rings:3,safeArc:9,ringInterval:0.42,sonicWarning:0.44,ringSpeed:245,dashWarning:0.52,laneWarning:0.43,laneCount:8,laneSteps:4,laneActive:0.26,laneRecovery:0.1,suppressiveBudget:46,missiles:10,missileSpeed:195,wingInterval:0.5,fanInterval:5.5,recovery:0.34,speedScale:1.15,cadence:.8},
} as const;
export type BossTuning = (typeof BOSS_TUNING)[keyof typeof BOSS_TUNING];
export type BossMajorAttack = "sonic" | "dash" | "lane_laser" | "homing_missiles" | "emp" | "fan" | "crossfire_curtain";
export type BossComboId = "sonic_wing" | "pincer_sweep" | "lane_wing" | "emp_pincer" | "ram_sweep" | "sonic_emp" | "lane_ram" | "fan_wing" | "crossfire_hunt" | "sonic_crossfire" | "ram_curtain";
export interface BossAttackState {
 majorAttack: BossMajorAttack | null; majorCooldown:number; majorAge:number; sequenceStep:number;
 fanCount:number; missilesPending:number; missileIndex:number; missileCooldown:number; missileTuning:BossTuning;
 dashDamage:number; dashHitPlayer:boolean;
 comboId?:BossComboId; comboSteps?:BossMajorAttack[]; followupRemaining?:number; stepResolved?:boolean;
 suppressiveClock?:number; suppressiveIndex?:number; oppositeShotTimer?:number; oppositeSide?:number;
 crossfirePending?:number; crossfireTimer?:number; crossfireCenter?:number; crossfireWidth?:number;
 patternWaiting?:boolean;
 patternRemaining?:number; patternTimer?:number; patternIndex?:number;
 fanPending?:number; fanTimer?:number; fanIndex?:number; fanReverse?:boolean;
 punishmentFollowup?:number;
}
export function getBossTuning(ratio:number):BossTuning { return ratio<.15?BOSS_TUNING.enrage:ratio<.35?BOSS_TUNING.phase3:ratio<.7?BOSS_TUNING.phase2:BOSS_TUNING.phase1; }
export const SONIC_RING_SPEED=190;
export const SONIC_RING_THICKNESS=12;
export const SONIC_ACTIVE_SECONDS=3.6;
export const LANE_ACTIVE_SECONDS=.35;
