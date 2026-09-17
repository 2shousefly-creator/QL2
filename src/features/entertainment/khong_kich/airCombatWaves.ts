import type { EnemyType } from "./airCombatTypes";
export interface WaveDefinition {
    label: string;
    groups?: readonly (readonly EnemyType[])[];
    normal: number;
    elite: number;
    interval: number;
    cap: number;
    hp: number;
    damage: number;
    armor: number;
    xpBudget: number;
    /** Fixed per-main-enemy reward for stages with an authored XP curve. */
    xpPerKill?: number;
    counts: Partial<Record<EnemyType, number>>;
}
export const COMBAT_WAVES: readonly WaveDefinition[] = [
    { label: "Đợt thường 1", normal: 1, elite: 0, interval: .85, cap: 10, hp: 1, damage: 1, armor: 1, xpBudget: 760, counts: { scout: 16, fighter: 14, kamikaze: 10 } },
    { label: "Đợt thường 2", normal: 2, elite: 0, interval: .72, cap: 12, hp: 1.15, damage: 1.1, armor: 1.05, xpBudget: 1165, counts: { scout: 10, fighter: 14, kamikaze: 10, attacker: 16 } },
    { label: "Tinh Anh 1", normal: 2, elite: 1, interval: 1, cap: 3, hp: 1, damage: 1.15, armor: 1, xpBudget: 700, counts: { elite: 1, iron_fortress: 1, acid_bomber: 1 } },
    { label: "Đợt thường 3", normal: 3, elite: 0, interval: .60, cap: 15, hp: 1.35, damage: 1.2, armor: 1.1, xpBudget: 1500, counts: { scout: 8, fighter: 12, kamikaze: 10, attacker: 14, bomber: 16 } },
    { label: "Đợt thường 4", normal: 4, elite: 0, interval: .50, cap: 18, hp: 1.6, damage: 1.35, armor: 1.18, xpBudget: 1750, counts: { scout: 6, fighter: 10, kamikaze: 10, attacker: 14, bomber: 10, sniper: 10, jammer: 10 } },
    { label: "Tinh Anh 2", normal: 4, elite: 2, interval: 1, cap: 4, hp: 1.35, damage: 1.45, armor: 1.15, xpBudget: 1710, counts: { elite: 1, iron_fortress: 1, acid_bomber: 1, radar_hunter: 1 } },
    { label: "Đợt thường 5", normal: 5, elite: 0, interval: .42, cap: 20, hp: 1.9, damage: 1.5, armor: 1.25, xpBudget: 2545, counts: { scout: 4, fighter: 10, kamikaze: 12, attacker: 12, bomber: 14, sniper: 14, jammer: 14 } },
    { label: "LEVIATHAN X-99", normal: 5, elite: 0, interval: 1, cap: 1, hp: 1, damage: 1, armor: 1, xpBudget: 0, counts: { boss: 1 } },
];
export const isElite = (type: EnemyType): boolean => ["elite", "iron_fortress", "acid_bomber", "radar_hunter", "cyclone_ace", "grid_architect", "prism_sovereign", "mine_warden", "polarity_warden", "swarm_overlord", "arc_reaver_prime"].includes(type);
export function createWaveQueue(index: number, random: () => number, waves: readonly WaveDefinition[] = COMBAT_WAVES): EnemyType[] {
    const wave = waves[index];
    if (wave?.groups) return wave.groups.flat();
    if (!wave)
        return [];
    const queue: EnemyType[] = [];
    for (const [type, count] of Object.entries(wave.counts))
        for (let n = 0; n < count; n++)
            queue.push(type as EnemyType);
    // Elite introductions remain in the requested order. Normal waves use combat RNG.
    if (!wave.elite)
        for (let i = queue.length - 1; i > 0; i--) {
            const j = Math.min(i, Math.floor(random() * (i + 1)));
            [queue[i], queue[j]] = [queue[j], queue[i]];
        }
    return queue;
}
