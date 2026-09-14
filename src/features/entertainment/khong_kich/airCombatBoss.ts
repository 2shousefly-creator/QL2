/** Damage is raw, before player armor and Core mitigation. */
export const BOSS_TUNING = {
    phase1: { wing: 180, fan: 140, sonic: 300, dash: 0, lane: 0, missile: 0,
        fanCount: 7, rings: 1, safeArc: 100, ringInterval: .75, dashWarning: 1,
        laneWarning: 1.1, dangerousLanes: 2, missiles: 0, missileSpeed: 180,
        wingInterval: 1.4, fanInterval: 7.5, recovery: 2.2, speedScale: 1, cadence: 1 },
    phase2: { wing: 210, fan: 160, sonic: 340, dash: 500, lane: 380, missile: 190,
        fanCount: 9, rings: 2, safeArc: 80, ringInterval: .70, dashWarning: 1,
        laneWarning: 1.1, dangerousLanes: 2, missiles: 4, missileSpeed: 180,
        wingInterval: 1.3, fanInterval: 6.5, recovery: 1.5, speedScale: 1, cadence: 1 },
    phase3: { wing: 240, fan: 180, sonic: 380, dash: 575, lane: 430, missile: 210,
        fanCount: 11, rings: 3, safeArc: 62, ringInterval: .65, dashWarning: .88,
        laneWarning: .90, dangerousLanes: 3, missiles: 6, missileSpeed: 205,
        wingInterval: 1.05, fanInterval: 5.5, recovery: 1.1, speedScale: 1, cadence: 1 },
    enrage: { wing: 260, fan: 200, sonic: 400, dash: 600, lane: 450, missile: 220,
        fanCount: 11, rings: 3, safeArc: 62, ringInterval: .55, dashWarning: .88,
        laneWarning: .80, dangerousLanes: 3, missiles: 6, missileSpeed: 205,
        wingInterval: 1.05, fanInterval: 5.5, recovery: 1.1, speedScale: 1.15, cadence: .8 },
} as const;
export type BossTuning = (typeof BOSS_TUNING)[keyof typeof BOSS_TUNING];
export type BossMajorAttack = "sonic" | "dash" | "lane_laser" | "homing_missiles";
export interface BossAttackState {
    majorAttack: BossMajorAttack | null;
    majorCooldown: number;
    majorAge: number;
    sequenceStep: number;
    fanCount: number;
    missilesPending: number;
    missileIndex: number;
    missileCooldown: number;
    missileTuning: BossTuning;
    dashDamage: number;
    dashHitPlayer: boolean;
}
export function getBossTuning(hpRatio: number): BossTuning {
    return hpRatio < .15 ? BOSS_TUNING.enrage : hpRatio < .35 ? BOSS_TUNING.phase3
        : hpRatio < .7 ? BOSS_TUNING.phase2 : BOSS_TUNING.phase1;
}
export const SONIC_RING_SPEED = 190;
export const SONIC_RING_THICKNESS = 12;
export const SONIC_ACTIVE_SECONDS = 3.6;
export const LANE_ACTIVE_SECONDS = .35;
