import { GameState, JourneyChapterId, RankFamily } from "./types";
import { JOURNEY_CHAPTERS } from "./journeyChapters";
import {
  formatApproximateEta,
  getChapterStatus,
  getEtaToNextRankFamily,
  getJourneyChapterProgress,
  getNextFamilyStartRankIndex,
} from "./etaEngine";
import {
  getCurrentRank,
  getFinalJourneyXpTarget,
  getFinalJourneyXpTargetTicks,
} from "./xpEngine";
import { RANK_FAMILIES } from "./rankFamilies";
import { RANK_STEPS } from "./rankBuilder";

export type JourneyFamilyNodeViewModel = {
  family: RankFamily;
  isCompleted: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
  currentTier: number | null;
  tierCount: number;
};

export type JourneyChapterViewModel = {
  id: JourneyChapterId;
  title: string;
  shortTitle: string;
  rankRangeLabel: string;
  status: "completed" | "current" | "upcoming";
  progressRatio: number;
  progressPercent: number;
  currentRankName: string | null;
  nextFamilyName: string | null;
  tierLabel: string | null;
  milestoneStatusLabel: string | null;
  etaLabel: string | null;
  etaSourceLabel: "7_day" | "lifetime" | "initial_fallback" | null;
  familyNodes: JourneyFamilyNodeViewModel[];
};

export type JourneyMapViewModel = {
  currentChapterId: JourneyChapterId;
  currentRankName: string;
  currentRankIndex: number;
  chapters: JourneyChapterViewModel[];
};

export function buildJourneyMapViewModel(state: GameState, nowMs: number): JourneyMapViewModel {
  const currentRankIndex = state.progression.currentRankIndex;
  const currentRank = getCurrentRank(currentRankIndex);
  const currentFamily = RANK_FAMILIES.find((f) => f.id === currentRank.familyId) || RANK_FAMILIES[0];

  const nextFamilyStartIdx = getNextFamilyStartRankIndex(currentRankIndex);
  const nextFamily = nextFamilyStartIdx !== null ? RANK_FAMILIES.find((f) => f.id === RANK_STEPS[nextFamilyStartIdx].familyId) : null;

  const etaInfo = getEtaToNextRankFamily(state, nowMs);

  const chapters: JourneyChapterViewModel[] = JOURNEY_CHAPTERS.map((chapter) => {
    const status = getChapterStatus(state, chapter);
    const progressRatio = getJourneyChapterProgress(state, chapter);
    const progressPercent = Math.round(progressRatio * 100);

    const isCurrentChapter = status === "current";

    const familyNodes: JourneyFamilyNodeViewModel[] = chapter.familyIds.map((famId) => {
      const family = RANK_FAMILIES.find((f) => f.id === famId) || RANK_FAMILIES[0];
      const isCurrentFam = isCurrentChapter && currentFamily.id === famId;

      // Find if player has passed this family or upcoming
      // A family is completed if currentRankIndex is past the last step of this family
      const familySteps = RANK_STEPS.filter((s) => s.familyId === famId);
      const lastStepIndex = familySteps[familySteps.length - 1]?.rankIndex ?? -1;
      const firstStepIndex = familySteps[0]?.rankIndex ?? 999;

      const isCompletedFam = currentRankIndex > lastStepIndex;
      const isUpcomingFam = currentRankIndex < firstStepIndex;

      let currentTier: number | null = null;
      if (isCurrentFam) {
        currentTier = currentRank.tier;
      } else if (isCompletedFam) {
        currentTier = family.tierCount;
      }

      return {
        family,
        isCompleted: isCompletedFam,
        isCurrent: isCurrentFam,
        isUpcoming: isUpcomingFam,
        currentTier,
        tierCount: family.tierCount,
      };
    });

    let milestoneStatusLabel: string | null = null;
    let tierLabel: string | null = null;
    let etaLabel: string | null = null;
    let etaSourceLabel: "7_day" | "lifetime" | "initial_fallback" | null = null;

    if (isCurrentChapter) {
      if (currentRankIndex >= RANK_STEPS.length - 1) {
        if (state.progression.totalXpEarnedTicks >= getFinalJourneyXpTargetTicks()) {
          milestoneStatusLabel = "Đã hoàn tất toàn bộ hành trình";
        } else {
          const displayCurr = Math.floor(state.progression.totalXpEarnedTicks / 600_000);
          const displayTarget = getFinalJourneyXpTarget();
          const approxEta = formatApproximateEta(etaInfo?.etaMs ?? null);
          milestoneStatusLabel = `Hoàn tất hành trình: ${displayCurr} / ${displayTarget} XP · Dự kiến khoảng ${approxEta}`;
          etaLabel = approxEta;
          etaSourceLabel = etaInfo?.sourceLabel ?? null;
        }
      } else {
        // Remaining tier count rule:
        // Multi-tier & not last tier: "Còn N bậc"
        // Multi-tier & last tier: "Đã ở bậc cuối"
        // Single-tier: "Còn 1 cột mốc"
        if (currentFamily.tierCount > 1) {
          const remTiers = currentFamily.tierCount - (currentRank.tier || 1);
          if (remTiers > 0) {
            tierLabel = `Còn ${remTiers} bậc`;
          } else {
            tierLabel = "Đã ở bậc cuối";
          }
        } else {
          tierLabel = "Còn 1 cột mốc";
        }

        const nextName = nextFamily ? nextFamily.name : "Kế tiếp";
        const approxEta = formatApproximateEta(etaInfo?.etaMs ?? null);

        milestoneStatusLabel = `Quân hàm tiếp theo: ${nextName} · ${tierLabel} · Dự kiến khoảng ${approxEta}`;
        etaLabel = approxEta;
        etaSourceLabel = etaInfo?.sourceLabel ?? null;
      }
    }

    const startOrd = chapter.startRankIndex + 1;
    const endOrd = chapter.endRankIndex + 1;
    const rankRangeLabel = startOrd === endOrd ? `Cấp ${startOrd}` : `Cấp ${startOrd}–${endOrd}`;

    return {
      id: chapter.id,
      title: chapter.title,
      shortTitle: chapter.shortTitle,
      rankRangeLabel,
      status,
      progressRatio,
      progressPercent,
      currentRankName: isCurrentChapter ? currentRank.displayName : null,
      nextFamilyName: isCurrentChapter && nextFamily ? nextFamily.name : null,
      tierLabel: isCurrentChapter ? tierLabel : null,
      milestoneStatusLabel,
      etaLabel,
      etaSourceLabel,
      familyNodes,
    };
  });

  const currentChapterObj = JOURNEY_CHAPTERS.find(
    (c) => currentRankIndex >= c.startRankIndex && currentRankIndex <= c.endRankIndex
  ) || JOURNEY_CHAPTERS[0];

  return {
    currentChapterId: currentChapterObj.id,
    currentRankName: currentRank.displayName,
    currentRankIndex,
    chapters,
  };
}
