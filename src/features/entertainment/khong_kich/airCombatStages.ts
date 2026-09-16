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
const groupsA: EnemyType[][] = [
  ["orbit_wasp", "orbit_wasp"], ["arc_reaver", "arc_reaver"], ["mine_seeder"],
  ["orbit_wasp", "arc_reaver"], ["arc_reaver", "mine_seeder"],
  ["orbit_wasp", "mine_seeder"], ["orbit_wasp", "arc_reaver", "mine_seeder"],
];
const groupsB: EnemyType[][] = [
  ["magnetic_leech"], ["prism_manta"], ["swarm_carrier"],
  ["mine_seeder", "magnetic_leech"], ["swarm_carrier", "arc_reaver"],
  ["prism_manta", "orbit_wasp"], ["mine_seeder", "swarm_carrier"],
  ["prism_manta", "arc_reaver", "orbit_wasp"],
];
function magneticWave(label: string, xpBudget: number, groups: EnemyType[][], elite = 0, advanced = false): WaveDefinition {
  const counts: Partial<Record<EnemyType, number>> = {};
  for (const type of groups.flat()) counts[type] = (counts[type] ?? 0) + 1;
  return { label, normal: advanced ? 3 : 1, elite, interval: 1.3, cap: elite ? 1 : 3,
    hp: advanced ? 1.35 : 1, armor: advanced ? 1.1 : 1, damage: advanced ? 1.2 : 1,
    xpBudget, counts, groups };
}
export const AIR_COMBAT_STAGES: readonly AirCombatStageDefinition[] = [
  { id: 1, key: "leviathan_front", displayName: "LEVIATHAN FRONT", localizedName: "PHÒNG TUYẾN LEVIATHAN",
    shortDescription: "Né hỏa lực trực diện. Đánh bại pháo đài bay Leviathan.", bossName: "Leviathan",
    unlockAfterStage: null, theme: "FRONTLINE · FIREPOWER", accent: "#38bdf8", available: true,
    runtime: "leviathan", waves: COMBAT_WAVES, scaling: STAGE_ONE_SCALING },
  { id: 2, key: "magnetic_storm", displayName: "MAGNETIC STORM", localizedName: "BÃO TỪ",
    shortDescription: "Làm chủ quỹ đạo, đạn quay trở lại và vùng không gian bị kiểm soát bởi từ trường.",
    bossName: "Tempest Crown", unlockAfterStage: 1, theme: "ORBIT · RETURN · CONTROL", accent: "#a78bfa", available: true,
    runtime: "magnetic", scaling: { normal: scale(STAGE_ONE_SCALING.normal, 1.15, 1.10, 1.12),
      elite: scale(STAGE_ONE_SCALING.elite, 1.15, 1.15, 1.12), boss: scale(STAGE_ONE_SCALING.boss, 1.18, 1.18, 1.12) },
    waves: [magneticWave("WAVE 1 · QUỸ ĐẠO", 1925, groupsA),
      magneticWave("TINH ANH · CYCLONE ACE", 700, [["cyclone_ace"]], 1),
      magneticWave("WAVE 3 · KIỂM SOÁT", 5795, groupsB, 0, true),
      magneticWave("TINH ANH · GRID ARCHITECT", 1710, [["grid_architect"]], 2, true),
      magneticWave("BOSS · TEMPEST CROWN", 0, [["boss"]])] },
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
