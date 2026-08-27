import { RANK_FAMILIES } from "../../../game/rankFamilies";
import { RANK_STEPS } from "../../../game/rankBuilder";
import type { GameState, RankFamily, RankStep } from "../../../game/types";

export function getUnlockedUniformFamilies(state: GameState): RankFamily[] {
  const historyFamilyIds = new Set(
    (state.progression.promotionHistory ?? []).map((entry) => entry.familyId)
  );

  return RANK_FAMILIES.filter((family) => {
    const firstStep = RANK_STEPS.find((step) => step.familyId === family.id);
    return Boolean(
      historyFamilyIds.has(family.id) ||
      (firstStep && firstStep.rankIndex <= state.progression.currentRankIndex)
    );
  });
}

export function getUniformFamilyAchievedAt(state: GameState, familyId: string): number | null {
  const achievedTimes = (state.progression.promotionHistory ?? [])
    .filter((entry) => entry.familyId === familyId && typeof entry.achievedAt === "number")
    .map((entry) => entry.achievedAt as number)
    .filter((value) => Number.isFinite(value) && value > 0);

  return achievedTimes.length > 0 ? Math.min(...achievedTimes) : null;
}

export function getUniformFilledSegments(
  family: RankFamily,
  currentRank: RankStep,
  isCurrentFamily: boolean
): number {
  if (family.tierCount === 1) return 1;
  if (!isCurrentFamily) return family.tierCount;
  return Math.max(1, Math.min(family.tierCount, currentRank.tier ?? 1));
}
