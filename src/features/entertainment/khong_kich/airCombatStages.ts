import { COMBAT_WAVES, type WaveDefinition } from "./airCombatWaves";
import type { AirCombatCampaignProgress, EnemyType } from "./airCombatTypes";

export interface AirCombatStageDefinition {
  id: number; key: string; displayName: string; localizedName: string;
  shortDescription: string; bossName: string; unlockAfterStage: number | null;
  theme: string; accent: string; available: boolean;
  runtime: "leviathan" | "magnetic";
  waves: readonly WaveDefinition[];
}
// Authored introductions followed by bounded mixed groups. Counts below own
// every main-enemy slot; helper entities never enter these queues.
function magneticWave(label: string, counts: Partial<Record<EnemyType, number>>, xpPerKill: number,
  cap: number, normal: number, elite = 0, introductions: EnemyType[][] = []): WaveDefinition {
  const remaining = { ...counts }, groups: EnemyType[][] = [];
  const size = normal === 1 ? 5 : normal === 2 ? 6 : normal === 3 ? 8 : 9;
  const recipes: EnemyType[][] = normal >= 5 ? [
    ["magnetic_leech", "mine_seeder", "orbit_wasp", "arc_reaver"],
    ["swarm_carrier", "prism_manta", "orbit_wasp"],
    ["mine_seeder", "arc_reaver", "prism_manta", "swarm_carrier"],
  ] : introductions.length ? introductions : [Object.keys(counts) as EnemyType[]];
  const types = Object.keys(remaining) as EnemyType[];
  let formation = 0;
  while (types.some(type => (remaining[type] ?? 0) > 0)) {
    const group: EnemyType[] = [], recipe = recipes[formation++ % recipes.length];
    for (let pass = 0; group.length < size; pass++) {
      const choices = pass < 2 ? recipe : types;
      let added = false;
      for (const type of choices) if ((remaining[type] ?? 0) > 0 && group.length < size) {
        group.push(type); remaining[type]!--; added = true;
      }
      if (!added && pass >= 2) break;
    }
    groups.push(group);
  }
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const baseline = counts.boss ? COMBAT_WAVES[7]
    : COMBAT_WAVES.find(wave => elite ? wave.elite === elite : !wave.elite && !wave.counts.boss && wave.normal === normal)!;
  return { label, counts, groups: elite || counts.boss ? undefined : groups,
    normal, elite, interval: .25, cap, hp: baseline.hp, armor: baseline.armor, damage: baseline.damage,
    xpPerKill, xpBudget: total * xpPerKill };
}
export const MAGNETIC_WAVES: readonly WaveDefinition[] = [
  magneticWave("WAVE 1 · QUỸ ĐẠO", { orbit_wasp: 14, arc_reaver: 11, mine_seeder: 10 }, 10, 12, 1, 0,
    [["orbit_wasp", "orbit_wasp", "orbit_wasp"], ["arc_reaver", "arc_reaver", "arc_reaver"], ["mine_seeder", "mine_seeder"]]),
  magneticWave("WAVE 2 · LĂNG KÍNH", { orbit_wasp: 12, arc_reaver: 10, mine_seeder: 9, magnetic_leech: 7, prism_manta: 7 }, 11, 14, 2, 0,
    [["magnetic_leech", "prism_manta"]]),
  magneticWave("WAVE 3 · MAGNETIC TRIAD", { cyclone_ace: 1, prism_sovereign: 1, mine_warden: 1 }, 80, 3, 2, 1),
  magneticWave("WAVE 4 · BẦY ĐÀN", { orbit_wasp: 12, arc_reaver: 10, mine_seeder: 9, magnetic_leech: 8, prism_manta: 9, swarm_carrier: 7 }, 12, 17, 3, 0,
    [["swarm_carrier", "orbit_wasp", "prism_manta"]]),
  magneticWave("WAVE 5 · MAGNETIC EXECUTION", { grid_architect: 1, polarity_warden: 1, swarm_overlord: 1, arc_reaver_prime: 1 }, 110, 4, 4, 2),
  magneticWave("WAVE 6 · TÂM BÃO", { orbit_wasp: 16, arc_reaver: 14, mine_seeder: 12, magnetic_leech: 10, prism_manta: 10, swarm_carrier: 8 }, 14, 20, 5),
  magneticWave("WAVE 7 · TEMPEST CROWN", { boss: 1 }, 0, 1, 5),
];
export const AIR_COMBAT_STAGES: readonly AirCombatStageDefinition[] = [
  { id: 1, key: "leviathan_front", displayName: "LEVIATHAN FRONT", localizedName: "PHÒNG TUYẾN LEVIATHAN",
    shortDescription: "Né hỏa lực trực diện. Đánh bại pháo đài bay Leviathan.", bossName: "Leviathan",
    unlockAfterStage: null, theme: "FRONTLINE · FIREPOWER", accent: "#38bdf8", available: true,
    runtime: "leviathan", waves: COMBAT_WAVES },
  { id: 2, key: "magnetic_storm", displayName: "MAGNETIC STORM", localizedName: "BÃO TỪ",
    shortDescription: "Làm chủ quỹ đạo, đạn quay trở lại và vùng không gian bị kiểm soát bởi từ trường.",
    bossName: "Tempest Crown", unlockAfterStage: 1, theme: "ORBIT · RETURN · CONTROL", accent: "#a78bfa", available: true,
    runtime: "magnetic", waves: MAGNETIC_WAVES },
  { id: 3, key: "stormbreaker", displayName: "STORMBREAKER", localizedName: "",
    shortDescription: "Chiến trường tiếp theo đang được chuẩn bị.", bossName: "", unlockAfterStage: 2,
    theme: "SẮP RA MẮT", accent: "#64748b", available: false, runtime: "magnetic", waves: [] },
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
