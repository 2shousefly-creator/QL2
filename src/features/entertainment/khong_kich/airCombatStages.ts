import { COMBAT_WAVES, isElite, type WaveDefinition } from "./airCombatWaves";
import type { AirCombatCampaignProgress, EnemyType } from "./airCombatTypes";

type TierScale = { hp: number; armor: number; damage: number };
export interface AirCombatStageDefinition {
  id: number; key: string; displayName: string; localizedName: string;
  shortDescription: string; bossName: string; unlockAfterStage: number | null;
  theme: string; accent: string; available: boolean;
  runtime: "leviathan" | "magnetic";
  waves: readonly WaveDefinition[];
  scaling: Record<"normal" | "elite" | "boss", TierScale>;
}
export const STAGE_ONE_SCALING = {
  normal: { hp: .78, armor: .78, damage: .72 },
  elite: { hp: .82, armor: .82, damage: .78 },
  boss: { hp: .85, armor: .85, damage: .80 },
};
const scale = (base: TierScale, hp: number, armor: number, damage: number): TierScale =>
  ({ hp: base.hp * hp, armor: base.armor * armor, damage: base.damage * damage });
// Authored introductions followed by bounded mixed groups. Counts below own
// every main-enemy slot; helper entities never enter these queues.
function magneticWave(label: string, counts: Partial<Record<EnemyType, number>>, xpPerKill: number,
  cap: number, normal: number, elite = 0, introductions: EnemyType[][] = []): WaveDefinition {
  const remaining = { ...counts }, groups: EnemyType[][] = [];
  for (const group of introductions) {
    groups.push(group);
    for (const type of group) remaining[type] = (remaining[type] ?? 0) - 1;
  }
  const types = Object.keys(remaining) as EnemyType[];
  while (types.some(type => (remaining[type] ?? 0) > 0)) {
    const group: EnemyType[] = [];
    for (const type of types) if ((remaining[type] ?? 0) > 0) {
      group.push(type); remaining[type] = (remaining[type] ?? 0) - 1;
    }
    groups.push(group);
  }
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const baseline = counts.boss ? COMBAT_WAVES[7]
    : COMBAT_WAVES.find(wave => elite ? wave.elite === elite : !wave.elite && !wave.counts.boss && wave.normal === normal)!;
  return { label, counts, groups: elite || counts.boss ? undefined : groups,
    normal, elite, interval: .65, cap, hp: baseline.hp, armor: baseline.armor, damage: baseline.damage,
    xpPerKill, xpBudget: total * xpPerKill };
}
export const MAGNETIC_WAVES: readonly WaveDefinition[] = [
  magneticWave("WAVE 1 · QUỸ ĐẠO", { orbit_wasp: 14, arc_reaver: 11, mine_seeder: 10 }, 10, 8, 1, 0,
    [["orbit_wasp", "orbit_wasp", "orbit_wasp"], ["arc_reaver", "arc_reaver", "arc_reaver"], ["mine_seeder", "mine_seeder"]]),
  magneticWave("WAVE 2 · LĂNG KÍNH", { orbit_wasp: 12, arc_reaver: 10, mine_seeder: 9, magnetic_leech: 7, prism_manta: 7 }, 11, 9, 2, 0,
    [["magnetic_leech", "prism_manta"]]),
  magneticWave("WAVE 3 · CYCLONE ACE", { cyclone_ace: 3 }, 80, 2, 2, 1),
  magneticWave("WAVE 4 · BẦY ĐÀN", { orbit_wasp: 12, arc_reaver: 10, mine_seeder: 9, magnetic_leech: 8, prism_manta: 9, swarm_carrier: 7 }, 12, 10, 3, 0,
    [["swarm_carrier", "orbit_wasp", "prism_manta"]]),
  magneticWave("WAVE 5 · GRID ARCHITECT", { grid_architect: 4 }, 110, 2, 4, 2),
  magneticWave("WAVE 6 · TÂM BÃO", { orbit_wasp: 16, arc_reaver: 14, mine_seeder: 12, magnetic_leech: 10, prism_manta: 10, swarm_carrier: 8 }, 14, 11, 5),
  magneticWave("WAVE 7 · TEMPEST CROWN", { boss: 1 }, 0, 1, 5),
];
export const AIR_COMBAT_STAGES: readonly AirCombatStageDefinition[] = [
  { id: 1, key: "leviathan_front", displayName: "LEVIATHAN FRONT", localizedName: "PHÒNG TUYẾN LEVIATHAN",
    shortDescription: "Né hỏa lực trực diện. Đánh bại pháo đài bay Leviathan.", bossName: "Leviathan",
    unlockAfterStage: null, theme: "FRONTLINE · FIREPOWER", accent: "#38bdf8", available: true,
    runtime: "leviathan", waves: COMBAT_WAVES, scaling: STAGE_ONE_SCALING },
  { id: 2, key: "magnetic_storm", displayName: "MAGNETIC STORM", localizedName: "BÃO TỪ",
    shortDescription: "Làm chủ quỹ đạo, đạn quay trở lại và vùng không gian bị kiểm soát bởi từ trường.",
    bossName: "Tempest Crown", unlockAfterStage: 1, theme: "ORBIT · RETURN · CONTROL", accent: "#a78bfa", available: true,
    runtime: "magnetic", scaling: { normal: scale(STAGE_ONE_SCALING.normal, 1.15, 1.10, 1.12),
      elite: scale(STAGE_ONE_SCALING.elite, 1.15, 1.10, 1.12), boss: scale(STAGE_ONE_SCALING.boss, 1.18, 1.10, 1.12) },
    waves: MAGNETIC_WAVES },
  { id: 3, key: "stormbreaker", displayName: "STORMBREAKER", localizedName: "",
    shortDescription: "Chiến trường tiếp theo đang được chuẩn bị.", bossName: "", unlockAfterStage: 2,
    theme: "SẮP RA MẮT", accent: "#64748b", available: false, runtime: "magnetic", waves: [], scaling: STAGE_ONE_SCALING },
];
export const getAirCombatStage = (id: number) => AIR_COMBAT_STAGES.find(stage => stage.id === id);
export const isStageUnlocked = (id: number, progress: AirCombatCampaignProgress) => {
  const stage = getAirCombatStage(id);
  return !!stage && (stage.unlockAfterStage === null || progress.highestStageCleared >= stage.unlockAfterStage);
};
export const isStageCleared = (id: number, progress: AirCombatCampaignProgress) => progress.highestStageCleared >= id;
export const canLaunchStage = (id: number, progress: AirCombatCampaignProgress) => !!getAirCombatStage(id)?.available && isStageUnlocked(id, progress);
export function defaultSelectedStage(progress: AirCombatCampaignProgress): number {
  const unlocked = AIR_COMBAT_STAGES.filter(s => isStageUnlocked(s.id, progress));
  return [...unlocked].reverse().find(s => !isStageCleared(s.id, progress))?.id ?? unlocked.at(-1)?.id ?? 1;
}
export function normalizeCampaign(raw: unknown, legacyBossClears = 0): AirCombatCampaignProgress {
  const value = raw && typeof raw === "object" ? raw as Partial<AirCombatCampaignProgress> : {};
  // Old bossClears was incremented only by the resolved Leviathan victory pipeline.
  const highest = typeof value.highestStageCleared === "number" && Number.isSafeInteger(value.highestStageCleared)
    ? Math.max(0, value.highestStageCleared) : legacyBossClears > 0 ? 1 : 0;
  const progress: AirCombatCampaignProgress = { version: 1, highestStageCleared: highest };
  progress.lastSelectedStage = isStageUnlocked(value.lastSelectedStage ?? -1, progress)
    ? value.lastSelectedStage : defaultSelectedStage(progress);
  return progress;
}
export const stageEnemyScale = (stage: AirCombatStageDefinition, type: EnemyType) => stage.scaling[type === "boss" ? "boss" : isElite(type) ? "elite" : "normal"];
