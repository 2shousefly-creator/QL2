import type { EnemyType } from "./airCombatTypes";
export interface WaveDefinition {
    label: string;
    normal: number;
    elite: number;
    interval: number;
    cap: number;
    hp: number;
    damage: number;
    armor: number;
    xp: number;
    counts: Partial<Record<EnemyType, number>>;
}
export const COMBAT_WAVES: readonly WaveDefinition[] = [
    { label: "Đợt thường 1", normal: 1, elite: 0, interval: .95, cap: 8, hp: 1, damage: 1, armor: 1, xp: 1, counts: { scout: 12, fighter: 10, kamikaze: 8 } },
    { label: "Đợt thường 2", normal: 2, elite: 0, interval: .85, cap: 10, hp: 1.15, damage: 1.1, armor: 1.05, xp: 1.15, counts: { scout: 8, fighter: 10, kamikaze: 8, attacker: 10 } },
    { label: "Tinh Anh 1", normal: 2, elite: 1, interval: 1, cap: 3, hp: 1, damage: 1, armor: 1, xp: 230, counts: { elite: 1, iron_fortress: 1, acid_bomber: 1 } },
    { label: "Đợt thường 3", normal: 3, elite: 0, interval: .75, cap: 12, hp: 1.35, damage: 1.2, armor: 1.1, xp: 1.3, counts: { scout: 6, fighter: 10, kamikaze: 8, attacker: 10, bomber: 8 } },
    { label: "Đợt thường 4", normal: 4, elite: 0, interval: .68, cap: 14, hp: 1.6, damage: 1.35, armor: 1.18, xp: 1.45, counts: { scout: 6, fighter: 8, kamikaze: 8, attacker: 10, bomber: 6, sniper: 5, jammer: 5 } },
    { label: "Tinh Anh 2", normal: 4, elite: 2, interval: 1, cap: 4, hp: 1.35, damage: 1.2, armor: 1.15, xp: 320, counts: { elite: 1, iron_fortress: 1, acid_bomber: 1, radar_hunter: 1 } },
    { label: "Đợt thường 5", normal: 5, elite: 0, interval: .6, cap: 16, hp: 1.9, damage: 1.5, armor: 1.25, xp: 1.6, counts: { scout: 4, fighter: 8, kamikaze: 8, attacker: 8, bomber: 8, sniper: 7, jammer: 7 } },
    { label: "LEVIATHAN X-99", normal: 5, elite: 0, interval: 1, cap: 1, hp: 1, damage: 1, armor: 1, xp: 0, counts: { boss: 1 } },
];
export const isElite = (type: EnemyType): boolean => ["elite", "iron_fortress", "acid_bomber", "radar_hunter"].includes(type);
export function createWaveQueue(index: number, random: () => number): EnemyType[] {
    const wave = COMBAT_WAVES[index];
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
