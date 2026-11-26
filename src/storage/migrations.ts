import { gameConfig } from "../game/config";
import { getRequiredXpTicksForTransition } from "../game/xpEngine";
import { EarningActivityBucket, GameState, JournalEvent, PromotionHistoryEntry } from "../game/types";
import { legacySteps, legacyFamilyStarts, legacyXpTotals } from "../game/legacyRankLayout";
import { RANK_STEPS } from "../game/rankBuilder";
import { createOnboardingHistoryEntry } from "../game/promotionEngine";
import {
  createDefaultFarmState,
  migrateFarmState,
} from "../features/tang_gia/farmMigration";
import { ensureMedalAndMasteryState, evaluateMedalUnlocks } from "../game/medals/medalEngine";
import { backfillJournalEvents, backfillRankPromotions, recordAppointments } from "../game/journal/journalEngine";
import { sanitizeCouponState } from "../game/coupons/couponEngine";
import { sanitizePersistedEnergyState } from "./energyPersistence";

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function optionalNonNegativeInteger(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : undefined;
}

function sanitizeJournalEvents(rawJournal: unknown): JournalEvent[] {
  if (!isRecord(rawJournal) || !Array.isArray(rawJournal.events)) return [];

  const validTypes = new Set<JournalEvent["type"]>([
    "promotion",
    "appointment",
    "medal_unlocked",
    "mastery_reached",
    "training_milestone",
    "farm_milestone",
  ]);
  const validCategories = new Set<JournalEvent["category"]>([
    "rank",
    "medal",
    "mastery",
    "farm",
    "training",
  ]);

  return rawJournal.events.flatMap((rawEvent, index): JournalEvent[] => {
    if (!isRecord(rawEvent)) return [];
    const rawType = String(rawEvent.type || "");
    const type: JournalEvent["type"] = validTypes.has(rawType as JournalEvent["type"])
      ? rawType as JournalEvent["type"]
      : rawEvent.category === "rank"
        ? "promotion"
        : "training_milestone";
    const rawCategory = String(rawEvent.category || "");
    const category: JournalEvent["category"] = validCategories.has(rawCategory as JournalEvent["category"])
      ? rawCategory as JournalEvent["category"]
      : type === "promotion"
        ? "rank"
        : "training";
    const occurredAtCandidate = rawEvent.occurredAt ?? rawEvent.timestamp ?? rawEvent.createdAt;
    const occurredAt = occurredAtCandidate === null
      ? null
      : Number.isFinite(Number(occurredAtCandidate))
        ? Number(occurredAtCandidate)
        : null;
    const metadata = isRecord(rawEvent.metadata) ? { ...rawEvent.metadata } : {};
    if (rawEvent.passed !== undefined && metadata.passed === undefined) {
      metadata.passed = Boolean(rawEvent.passed);
    }

    const fallbackIdentity = String(rawEvent.id || `${index}`);
    const key = String(rawEvent.key || `legacy-journal:${fallbackIdentity}`);
    return [{
      id: String(rawEvent.id || `jrn_${key}`),
      key,
      type,
      category,
      title: String(rawEvent.title || "Kết quả Sát Hạch"),
      description: String(rawEvent.description || "Kết quả được giữ lại từ dữ liệu cũ"),
      ...(rawEvent.iconSymbol ? { iconSymbol: String(rawEvent.iconSymbol) } : {}),
      occurredAt,
      dateUnknown: rawEvent.dateUnknown === undefined ? occurredAt === null : Boolean(rawEvent.dateUnknown),
      ...(rawEvent.relatedId !== undefined ? { relatedId: String(rawEvent.relatedId) } : {}),
      ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
    }];
  });
}

/**
 * Legacy V15 XP curve calculation: round(90 + 18n + 1.5n^2)
 * Used strictly for migrating saves prior to catalogVersion 16.
 */
function legacyRequiredXpV15(rankIndex: number): number {
  if (rankIndex >= legacySteps.length - 1) {
    return 0;
  }
  return Math.round(90 + 18 * rankIndex + 1.5 * rankIndex * rankIndex);
}

function legacyRequiredXpTicksV15(rankIndex: number): number {
  return legacyRequiredXpV15(rankIndex) * gameConfig.xpTicksPerXp;
}

function legacyTotalXpToReachRankV15(rankIndex: number): number {
  if (rankIndex <= 0) return 0;
  const maxTransition = Math.min(rankIndex, legacySteps.length - 1);
  let total = 0;
  for (let i = 0; i < maxTransition; i++) {
    total += legacyRequiredXpV15(i);
  }
  return total;
}

function legacyTotalXpTicksToReachRankV15(rankIndex: number): number {
  return legacyTotalXpToReachRankV15(rankIndex) * gameConfig.xpTicksPerXp;
}

import { createDefaultTrainingState, createEmptyGomokuStats, createEmptyMarchRhythmDifficultyStats, createEmptySignalCommandDifficultyStats, createEmptySupplyRouteDifficultyStats, createEmptyRadarTrackingStats } from "../game/training/trainingDefaults";
import { getTrainingDateKey } from "../game/training/trainingClock";

export function migrate196RankIndexTo216(oldIdx: number): number {
  if (oldIdx <= 0) return 0;
  if (oldIdx <= 160) {
    // Ranks 0..160 (Học Viên up to Thống Soái bậc 14) are identical in 196 and 216 layouts
    return oldIdx;
  }
  if (oldIdx <= 176) {
    // 161..176: Nguyên Soái (endgame_2) tiers 1..16 -> map to 177..192 in 216 layout
    return oldIdx + 16;
  }
  if (oldIdx <= 194) {
    // 177..194: Đại Nguyên Soái (endgame_3) tiers 1..18 -> map to 195..212 in 216 layout
    return oldIdx + 18;
  }
  // 195 (or above 195 in 196 layout): Tổng Tư Lệnh (endgame_4) -> map to 215 in 216 layout
  return 215;
}

export function mapRankBySemanticOr196Index(
  rawIndex: number,
  familyId?: string,
  tier?: number | null,
  rankName?: string
): number {
  // If valid familyId exists in legacySteps, use semantic lookup
  if (familyId && typeof familyId === "string" && familyId !== "unknown") {
    const exactMatch = legacySteps.find(
      (s) =>
        s.familyId === familyId &&
        (tier !== undefined && tier !== null
          ? s.tier === tier
          : s.tier === null || s.tier === 1)
    );
    if (exactMatch) {
      return exactMatch.rankIndex;
    }
    const familyMatch = legacySteps.find((s) => s.familyId === familyId);
    if (familyMatch) {
      return familyMatch.rankIndex;
    }
  }

  // If rankName matches displayName or shortName in current legacySteps
  if (rankName && typeof rankName === "string") {
    const nameMatch = legacySteps.find(
      (s) =>
        s.displayName === rankName ||
        s.shortName === rankName ||
        s.familyName === rankName
    );
    if (nameMatch) {
      return nameMatch.rankIndex;
    }
  }

  // Fallback to numeric 196 -> 216 migration
  return migrate196RankIndexTo216(rawIndex);
}

export function detectRankLayoutVersion(
  obj: Record<string, any>
): "layout216" | "layout196" | "legacy132" {
  const rawCatalogVersion = Number(obj.catalogVersion) || 0;

  // 1. Explicit layout version marker
  if (
    Number(obj.progression?.rankLayoutVersion) === 216 ||
    Number(obj.rankLayoutVersion) === 216
  ) {
    return "layout216";
  }

  // 2. Inspect promotion history signatures
  const rawHistory = Array.isArray(obj.progression?.promotionHistory)
    ? obj.progression.promotionHistory
    : [];

  for (const h of rawHistory) {
    if (!h || typeof h !== "object") continue;
    const fId = String(h.familyId || "");
    const rIdx = Number(h.rankIndex);

    // 216 signatures:
    if (fId === "endgame_grand_marshal") {
      return "layout216";
    }
    if (fId === "endgame_2" && rIdx >= 177) {
      return "layout216";
    }
    if (fId === "endgame_3" && rIdx >= 195) {
      return "layout216";
    }
    if (fId === "endgame_4" && rIdx === 215) {
      return "layout216";
    }

    // 196 signatures:
    if (fId === "endgame_2" && rIdx < 177 && rIdx >= 161) {
      return "layout196";
    }
    if (fId === "endgame_3" && rIdx < 195 && rIdx >= 177) {
      return "layout196";
    }
    if (fId === "endgame_4" && rIdx === 195) {
      return "layout196";
    }
  }

  // 3. Current rank index exceeding 195 max boundary of layout 196
  const currIdx = Number(obj.progression?.currentRankIndex) || 0;
  if (currIdx > 195) {
    return "layout216";
  }

  const ceremonyIdx = Number(obj.ui?.pendingPromotionCeremony?.promotedRankIndex) || 0;
  if (ceremonyIdx > 195) {
    return "layout216";
  }

  // 4. Legacy catalog check (< 14 is 132-step legacy layout)
  if (rawCatalogVersion < 14) {
    return "legacy132";
  }

  if (rawCatalogVersion === 17) return "layout216";

  // Otherwise, default safely to layout196
  return "layout196";
}

export function migrateLegacyRankIndexToV14(oldIdx: number): number {
  if (oldIdx <= 0) return 0;
  if (oldIdx >= 132) return legacySteps.length - 1;

  let familyId = "academy";
  let tier: number | null = null;

  if (oldIdx <= 2) { familyId = "enlisted_1"; tier = oldIdx; }
  else if (oldIdx <= 4) { familyId = "enlisted_2"; tier = oldIdx - 2; }
  else if (oldIdx <= 8) { familyId = "enlisted_3"; tier = oldIdx - 4; }
  else if (oldIdx <= 12) { familyId = "nco_1"; tier = oldIdx - 8; }
  else if (oldIdx <= 18) { familyId = "nco_2"; tier = oldIdx - 12; }
  else if (oldIdx <= 24) { familyId = "nco_3"; tier = oldIdx - 18; }
  else if (oldIdx <= 32) { familyId = "junior_1"; tier = oldIdx - 24; }
  else if (oldIdx <= 40) { familyId = "junior_2"; tier = oldIdx - 32; }
  else if (oldIdx <= 48) { familyId = "junior_3"; tier = oldIdx - 40; }
  else if (oldIdx <= 56) { familyId = "junior_4"; tier = oldIdx - 48; }
  else if (oldIdx <= 64) { familyId = "field_1"; tier = oldIdx - 56; }
  else if (oldIdx <= 72) { familyId = "field_2"; tier = oldIdx - 64; }
  else if (oldIdx <= 80) { familyId = "field_3"; tier = oldIdx - 72; }
  else if (oldIdx <= 88) { familyId = "field_4"; tier = oldIdx - 80; }
  else if (oldIdx <= 98) { familyId = "general_1"; tier = oldIdx - 88; }
  else if (oldIdx <= 108) { familyId = "general_2"; tier = oldIdx - 98; }
  else if (oldIdx <= 118) { familyId = "general_3"; tier = oldIdx - 108; }
  else if (oldIdx <= 128) { familyId = "general_4"; tier = oldIdx - 118; }
  else if (oldIdx === 129) { familyId = "endgame_1"; tier = 1; }
  else if (oldIdx === 130) { familyId = "endgame_2"; tier = 1; }
  else if (oldIdx === 131) { familyId = "endgame_3"; tier = 1; }

  const match = legacySteps.find((s) => s.familyId === familyId && s.tier === tier);
  return match ? match.rankIndex : oldIdx;
}

export function sanitizeAndMigrateState(rawObj: unknown, migrationNow: number = Date.now()): GameState {
  const now = migrationNow;
  if (!rawObj || typeof rawObj !== "object") {
    throw new Error("Invalid state object");
  }

  const obj = rawObj as Record<string, any>;
  const rawCatalogVersion = Number(obj.catalogVersion) || 0;
  const isV15 = rawCatalogVersion >= 15;
  const isV16 = rawCatalogVersion >= 16;

  const familyLayout = Number(obj.progression?.rankLayoutVersion) === 24 || rawCatalogVersion >= 18;
  const detectedLayout = familyLayout ? null : detectRankLayoutVersion(obj);
  const maxRankIdx = (familyLayout ? RANK_STEPS : legacySteps).length - 1;

  function sourceIndex(raw: unknown, history?: Record<string, any>): number {
    const idx = Math.max(0, Math.trunc(Number(raw) || 0));
    if (familyLayout || detectedLayout === "layout216") return Math.min(idx, maxRankIdx);
    if (detectedLayout === "legacy132") return migrateLegacyRankIndexToV14(idx);
    return history
      ? mapRankBySemanticOr196Index(idx, history.familyId, history.tier, history.rankName)
      : migrate196RankIndexTo216(idx);
  }

  const rankIndex = sourceIndex(obj.progression?.currentRankIndex);
  const familyIndex = (index: number) => familyLayout ? index : legacySteps[index].familyIndex;
  const isFamilyStart = (index: number) => familyLayout || legacyFamilyStarts[familyIndex(index)] === index;
  const sourceTotalTicks = (index: number) => legacyXpTotals[index] * gameConfig.xpTicksPerXp;
  const sourceRequiredTicks = (index: number) => familyLayout
    ? getRequiredXpTicksForTransition(index)
    : index === maxRankIdx ? 0 : sourceTotalTicks(index + 1) - sourceTotalTicks(index);

  let xpTicks = Number(obj.progression?.xpIntoCurrentRankTicks);
  if (isNaN(xpTicks) || xpTicks < 0) {
    xpTicks = 0;
  }

  let totalXpTicks = Number(obj.progression?.totalXpEarnedTicks);
  if (isNaN(totalXpTicks) || totalXpTicks < 0) {
    totalXpTicks = xpTicks;
  }

  if (!isV16) {
    // If saved state was from catalogVersion < 15, scale xpTicks & totalXpTicks by 1.5 to bring to v15 scale first
    if (!isV15) {
      xpTicks = Math.round(xpTicks * 1.5);
      totalXpTicks = Math.round(totalXpTicks * 1.5);
    }

    if (rankIndex >= maxRankIdx) {
      // Final rank: Tổng Tư Lệnh (rankIndex 215)
      const oldFinalLegStartTicks = legacyTotalXpTicksToReachRankV15(maxRankIdx);
      const finalLegSpanTicks = 999_999 * gameConfig.xpTicksPerXp;
      
      let rawProgress = totalXpTicks >= oldFinalLegStartTicks
        ? totalXpTicks - oldFinalLegStartTicks
        : xpTicks;
      
      const oldFinalLegProgressTicks = Math.max(
        0,
        Math.min(finalLegSpanTicks, isNaN(rawProgress) ? 0 : rawProgress)
      );

      const newFinalLegStartTicks = sourceTotalTicks(maxRankIdx);
      totalXpTicks = newFinalLegStartTicks + oldFinalLegProgressTicks;
      xpTicks = oldFinalLegProgressTicks;
    } else {
      // Standard rank transition (rankIndex < 215)
      const oldRequiredTicks = legacyRequiredXpTicksV15(rankIndex);
      const newRequiredTicks = sourceRequiredTicks(rankIndex);

      let progressRatio = oldRequiredTicks > 0 ? xpTicks / oldRequiredTicks : 0;
      progressRatio = Math.max(0, Math.min(1, isNaN(progressRatio) ? 0 : progressRatio));

      const newXpIntoCurrentRankTicks = Math.round(progressRatio * newRequiredTicks);
      const newBaseXpForCurrentRankTicks = sourceTotalTicks(rankIndex);

      xpTicks = newXpIntoCurrentRankTicks;
      totalXpTicks = newBaseXpForCurrentRankTicks + newXpIntoCurrentRankTicks;
    }
  } else {
    // Save is already catalogVersion >= 16 (idempotent path)
    const reqTicks = sourceRequiredTicks(rankIndex);
    if (rankIndex < maxRankIdx && xpTicks > reqTicks) {
      xpTicks = reqTicks;
    }
  }

  if (!familyLayout) {
    xpTicks += sourceTotalTicks(rankIndex) - sourceTotalTicks(legacyFamilyStarts[familyIndex(rankIndex)]);
  }

  const createdAt = Number(obj.player?.createdAt) || now;

  // Migrate promotion history
  const rawHistory = Array.isArray(obj.progression?.promotionHistory)
    ? obj.progression.promotionHistory
    : [];

  const archivedTierExams = familyLayout
    ? obj.progression?.archivedTierExams
    : rawHistory.filter((h: unknown) => isRecord(h) && !isFamilyStart(sourceIndex(h.rankIndex, h)));
  const migratedHistory: PromotionHistoryEntry[] = [];
  const seenRankIndexes = new Set<number>();

  for (const h of rawHistory) {
    if (!h || typeof h !== "object") continue;

    const source = sourceIndex(h.rankIndex, h);
    if (!isFamilyStart(source)) continue;
    const rIdx = familyIndex(source);
    if (seenRankIndexes.has(rIdx)) continue;
    seenRankIndexes.add(rIdx);

    const step = RANK_STEPS[rIdx] || RANK_STEPS[0];
    const achievedAt = h.achievedAt !== undefined ? (h.achievedAt ? Number(h.achievedAt) : null) : (h.promotedAt ? Number(h.promotedAt) : null);

    const isAcademy = rIdx === 0;

    let challenge: PromotionHistoryEntry["challenge"] = null;
    if (!isAcademy && (
      h.challenge ||
      h.challengeDurationMs ||
      h.correctCount !== undefined ||
      h.totalQuestions !== undefined ||
      h.retries !== undefined ||
      h.passed !== undefined
    )) {
      const configuredDurationMs = Number(h.challenge?.configuredDurationMs || h.challengeDurationMs) || 120_000;
      const elapsedRealMs = typeof h.challenge?.elapsedRealMs === "number" ? Math.max(0, h.challenge.elapsedRealMs) : null;
      const bubbleReductionMs = Math.max(0, Number(h.challenge?.bubbleReductionMs || h.bubbleReductionMs) || 0);

      let bubbleHitCount: number | null = null;
      if (typeof h.challenge?.bubbleHitCount === "number") {
        bubbleHitCount = Math.max(0, h.challenge.bubbleHitCount);
      } else if (bubbleReductionMs > 0 && bubbleReductionMs % 1000 === 0) {
        bubbleHitCount = bubbleReductionMs / 1000;
      }

      challenge = {
        configuredDurationMs,
        elapsedRealMs,
        bubbleHitCount,
        bubbleReductionMs,
        ...(optionalNonNegativeInteger(h.challenge?.correctCount ?? h.correctCount) !== undefined
          ? { correctCount: optionalNonNegativeInteger(h.challenge?.correctCount ?? h.correctCount) }
          : {}),
        ...(optionalNonNegativeInteger(h.challenge?.totalQuestions ?? h.totalQuestions) !== undefined
          ? { totalQuestions: optionalNonNegativeInteger(h.challenge?.totalQuestions ?? h.totalQuestions) }
          : {}),
        ...(optionalNonNegativeInteger(h.challenge?.retries ?? h.retries) !== undefined
          ? { retries: optionalNonNegativeInteger(h.challenge?.retries ?? h.retries) }
          : {}),
        ...((h.challenge?.passed ?? h.passed) !== undefined
          ? { passed: Boolean(h.challenge?.passed ?? h.passed) }
          : {}),
        ...(isRecord(h.challenge?.metadata ?? h.metadata)
          ? { metadata: { ...(h.challenge?.metadata ?? h.metadata) } }
          : {}),
      };
    }

    const entry: PromotionHistoryEntry = {
      id: String(h.id || `hist_rank_${rIdx}_${achievedAt || now}`),
      rankIndex: rIdx,
      rankName: String(step.displayName),
      familyId: String(step.familyId),
      tier: step.tier,
      achievedAt,
      source: isAcademy ? "onboarding" : (h.source || "promotion"),
      promotionKind: isAcademy ? "onboarding" : "major",
      badgeCatalogVersionAtAchievement: Number(h.badgeCatalogVersionAtAchievement) || gameConfig.catalogVersion,
      storyCatalogVersionAtAchievement: Number(h.storyCatalogVersionAtAchievement) || gameConfig.catalogVersion,
      challenge,
    };

    migratedHistory.push(entry);
  }

  // Only synthesize onboarding for saves with no history. Existing history is
  // authoritative and must retain its exact count and order.
  if (rawHistory.length === 0 && !seenRankIndexes.has(0)) {
    migratedHistory.push(createOnboardingHistoryEntry(createdAt));
  }

  const migratedJournalEvents = sanitizeJournalEvents(obj.journal).flatMap(event => {
    if (familyLayout || event.type !== "promotion") return [event];
    const match = /^promotion:(\d+)$/.exec(event.key);
    const sourceId = match?.[1] ?? event.relatedId;
    if (sourceId === undefined || !/^\d+$/.test(sourceId)) return [event];
    const source = sourceIndex(sourceId);
    if (!isFamilyStart(source)) return [];
    const index = familyIndex(source);
    return [{ ...event, key: "promotion:" + index, relatedId: String(index), title: "⭐ " + RANK_STEPS[index].displayName }];
  });
  const hadJournalEvents = migratedJournalEvents.length > 0;

  const migratedRankRetries: Record<number, number> = {};
  for (const [key, val] of Object.entries(obj.progression?.rankRetries ?? {})) {
    const source = sourceIndex(key);
    if (isFamilyStart(source)) migratedRankRetries[familyIndex(source)] = Number(val) || 0;
  }

  // Migrate recent earning activity buckets
  const rawBuckets = Array.isArray(obj.time?.recentEarningActivity) ? obj.time.recentEarningActivity : [];
  const recentEarningActivity: EarningActivityBucket[] = rawBuckets
    .filter((b) => b && typeof b.dayKeyUtc === "string")
    .map((b) => ({
      dayKeyUtc: String(b.dayKeyUtc),
      directOnlineMs: Math.max(0, Number(b.directOnlineMs) || 0),
      delegationMs: Math.max(0, Number(b.delegationMs) || 0),
    }));

  let pendingCeremony = null;
  if (obj.ui?.pendingPromotionCeremony) {
    const source = sourceIndex(obj.ui.pendingPromotionCeremony.promotedRankIndex);
    if (isFamilyStart(source)) pendingCeremony = {
      promotedRankIndex: familyIndex(source),
      promotedAt: Number(obj.ui.pendingPromotionCeremony.promotedAt) || now,
      promotionKind: "major" as const,
    };
  }

  const state: GameState = {
    schemaVersion: gameConfig.schemaVersion,
    catalogVersion: gameConfig.catalogVersion,
    player: {
      id: String(obj.player?.id || "player_migrated"),
      displayName: String(obj.player?.displayName || "Chiến sĩ"),
      avatarSeed: String(obj.player?.avatarSeed || "avatar_1"),
      createdAt,
    },
    energy: sanitizePersistedEnergyState(obj.energy, now),
    progression: {
      rankLayoutVersion: gameConfig.rankLayoutVersion,
      currentRankIndex: familyIndex(rankIndex),
      xpIntoCurrentRankTicks: xpTicks,
      totalXpEarnedTicks: Math.max(0, totalXpTicks),
      lastPromotionAt: obj.progression?.lastPromotionAt ? Number(obj.progression.lastPromotionAt) : null,
      promotionHistory: migratedHistory,
      ...(Array.isArray(archivedTierExams) && archivedTierExams.length ? { archivedTierExams } : {}),
      rankRetries: migratedRankRetries,
    },
    time: {
      lastSettledAt: typeof obj.time?.lastSettledAt === "number" && obj.time.lastSettledAt > 0 ? Number(obj.time.lastSettledAt) : now,
      lastOpenedAt: now,
      currentEarningMode: obj.time?.currentEarningMode === "direct_online" ? "direct_online" : "delegation",
      directOnlineTimeMs: Math.max(0, Number(obj.time?.directOnlineTimeMs) || 0),
      delegationTimeMs: Math.max(0, Number(obj.time?.delegationTimeMs) || 0),
      recentEarningActivity,
    },
    training: {
      trainingTimingOffsetMs: Number(obj.training?.trainingTimingOffsetMs) || 0,
      dailyReward: {
        lastClaimDateKey: obj.training?.dailyReward?.lastClaimDateKey ? String(obj.training.dailyReward.lastClaimDateKey) : null,
        lastClaimedAt: obj.training?.dailyReward?.lastClaimedAt ? Number(obj.training.dailyReward.lastClaimedAt) : null,
        lastClaimedGameId: (() => {
          const rawId = obj.training?.dailyReward?.lastClaimedGameId;
          if (rawId === "equipment_inspection") return "legacy_removed_equipment_inspection";
          if (["march_rhythm", "signal_command", "formation_assembly", "supply_route", "gomoku_infinite", "radar_tracking", "shooting_range", "chess", "legacy_removed_equipment_inspection"].includes(rawId)) {
            return rawId;
          }
          return null;
        })(),
        lastClaimedDifficulty: ["easy", "medium", "hard"].includes(obj.training?.dailyReward?.lastClaimedDifficulty)
          ? obj.training.dailyReward.lastClaimedDifficulty
          : null,
        lastNominalRewardXp: [10, 30, 50, 70].includes(obj.training?.dailyReward?.lastNominalRewardXp)
          ? obj.training.dailyReward.lastNominalRewardXp
          : 0,
        lastCreditedRewardXpTicks: Math.max(0, Number(obj.training?.dailyReward?.lastCreditedRewardXpTicks) || 0),
        claimRunId: obj.training?.dailyReward?.claimRunId ? String(obj.training.dailyReward.claimRunId) : null,
        lastObservedEpochMs: Number(obj.training?.dailyReward?.lastObservedEpochMs) || now,
        lastObservedTrainingDateKey: String(obj.training?.dailyReward?.lastObservedTrainingDateKey || getTrainingDateKey(now)),
      },
      marchRhythm: {
        easy: {
          plays: Math.max(0, Number(obj.training?.marchRhythm?.easy?.plays) || 0),
          wins: Math.max(0, Number(obj.training?.marchRhythm?.easy?.wins) || 0),
          bestScore: Math.max(0, Number(obj.training?.marchRhythm?.easy?.bestScore) || 0),
          bestAccuracy: Math.max(0, Number(obj.training?.marchRhythm?.easy?.bestAccuracy) || 0),
          bestHitRate: Math.max(0, Number(obj.training?.marchRhythm?.easy?.bestHitRate) || 0),
          bestCombo: Math.max(0, Number(obj.training?.marchRhythm?.easy?.bestCombo) || 0),
          lastPlayedAt: obj.training?.marchRhythm?.easy?.lastPlayedAt ? Number(obj.training.marchRhythm.easy.lastPlayedAt) : null,
          lastWonAt: obj.training?.marchRhythm?.easy?.lastWonAt ? Number(obj.training.marchRhythm.easy.lastWonAt) : null,
        },
        medium: {
          plays: Math.max(0, Number(obj.training?.marchRhythm?.medium?.plays) || 0),
          wins: Math.max(0, Number(obj.training?.marchRhythm?.medium?.wins) || 0),
          bestScore: Math.max(0, Number(obj.training?.marchRhythm?.medium?.bestScore) || 0),
          bestAccuracy: Math.max(0, Number(obj.training?.marchRhythm?.medium?.bestAccuracy) || 0),
          bestHitRate: Math.max(0, Number(obj.training?.marchRhythm?.medium?.bestHitRate) || 0),
          bestCombo: Math.max(0, Number(obj.training?.marchRhythm?.medium?.bestCombo) || 0),
          lastPlayedAt: obj.training?.marchRhythm?.medium?.lastPlayedAt ? Number(obj.training.marchRhythm.medium.lastPlayedAt) : null,
          lastWonAt: obj.training?.marchRhythm?.medium?.lastWonAt ? Number(obj.training.marchRhythm.medium.lastWonAt) : null,
        },
        hard: {
          plays: Math.max(0, Number(obj.training?.marchRhythm?.hard?.plays) || 0),
          wins: Math.max(0, Number(obj.training?.marchRhythm?.hard?.wins) || 0),
          bestScore: Math.max(0, Number(obj.training?.marchRhythm?.hard?.bestScore) || 0),
          bestAccuracy: Math.max(0, Number(obj.training?.marchRhythm?.hard?.bestAccuracy) || 0),
          bestHitRate: Math.max(0, Number(obj.training?.marchRhythm?.hard?.bestHitRate) || 0),
          bestCombo: Math.max(0, Number(obj.training?.marchRhythm?.hard?.bestCombo) || 0),
          lastPlayedAt: obj.training?.marchRhythm?.hard?.lastPlayedAt ? Number(obj.training.marchRhythm.hard.lastPlayedAt) : null,
          lastWonAt: obj.training?.marchRhythm?.hard?.lastWonAt ? Number(obj.training.marchRhythm.hard.lastWonAt) : null,
        },
      },
      signalCommand: {
        easy: {
          runsStarted: Math.max(0, Number(obj.training?.signalCommand?.easy?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.signalCommand?.easy?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.signalCommand?.easy?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.signalCommand?.easy?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.signalCommand?.easy?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.signalCommand?.easy?.bestScore) || 0),
          bestAccuracy: Math.max(0, Number(obj.training?.signalCommand?.easy?.bestAccuracy) || 0),
          longestSequenceCompleted: Math.max(0, Number(obj.training?.signalCommand?.easy?.longestSequenceCompleted) || 0),
          mostRoundsCompleted: Math.max(0, Number(obj.training?.signalCommand?.easy?.mostRoundsCompleted) || 0),
          perfectWins: Math.max(0, Number(obj.training?.signalCommand?.easy?.perfectWins) || 0),
          fastestWinningRunMs: obj.training?.signalCommand?.easy?.fastestWinningRunMs ? Number(obj.training.signalCommand.easy.fastestWinningRunMs) : null,
          lastPlayedAt: obj.training?.signalCommand?.easy?.lastPlayedAt ? Number(obj.training.signalCommand.easy.lastPlayedAt) : null,
          lastWonAt: obj.training?.signalCommand?.easy?.lastWonAt ? Number(obj.training.signalCommand.easy.lastWonAt) : null,
        },
        medium: {
          runsStarted: Math.max(0, Number(obj.training?.signalCommand?.medium?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.signalCommand?.medium?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.signalCommand?.medium?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.signalCommand?.medium?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.signalCommand?.medium?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.signalCommand?.medium?.bestScore) || 0),
          bestAccuracy: Math.max(0, Number(obj.training?.signalCommand?.medium?.bestAccuracy) || 0),
          longestSequenceCompleted: Math.max(0, Number(obj.training?.signalCommand?.medium?.longestSequenceCompleted) || 0),
          mostRoundsCompleted: Math.max(0, Number(obj.training?.signalCommand?.medium?.mostRoundsCompleted) || 0),
          perfectWins: Math.max(0, Number(obj.training?.signalCommand?.medium?.perfectWins) || 0),
          fastestWinningRunMs: obj.training?.signalCommand?.medium?.fastestWinningRunMs ? Number(obj.training.signalCommand.medium.fastestWinningRunMs) : null,
          lastPlayedAt: obj.training?.signalCommand?.medium?.lastPlayedAt ? Number(obj.training.signalCommand.medium.lastPlayedAt) : null,
          lastWonAt: obj.training?.signalCommand?.medium?.lastWonAt ? Number(obj.training.signalCommand.medium.lastWonAt) : null,
        },
        hard: {
          runsStarted: Math.max(0, Number(obj.training?.signalCommand?.hard?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.signalCommand?.hard?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.signalCommand?.hard?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.signalCommand?.hard?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.signalCommand?.hard?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.signalCommand?.hard?.bestScore) || 0),
          bestAccuracy: Math.max(0, Number(obj.training?.signalCommand?.hard?.bestAccuracy) || 0),
          longestSequenceCompleted: Math.max(0, Number(obj.training?.signalCommand?.hard?.longestSequenceCompleted) || 0),
          mostRoundsCompleted: Math.max(0, Number(obj.training?.signalCommand?.hard?.mostRoundsCompleted) || 0),
          perfectWins: Math.max(0, Number(obj.training?.signalCommand?.hard?.perfectWins) || 0),
          fastestWinningRunMs: obj.training?.signalCommand?.hard?.fastestWinningRunMs ? Number(obj.training.signalCommand.hard.fastestWinningRunMs) : null,
          lastPlayedAt: obj.training?.signalCommand?.hard?.lastPlayedAt ? Number(obj.training.signalCommand.hard.lastPlayedAt) : null,
          lastWonAt: obj.training?.signalCommand?.hard?.lastWonAt ? Number(obj.training.signalCommand.hard.lastWonAt) : null,
        },
        lastRecordedRunId: obj.training?.signalCommand?.lastRecordedRunId ? String(obj.training.signalCommand.lastRecordedRunId) : null,
      },
      formationAssembly: {
        easy: {
          runsStarted: Math.max(0, Number(obj.training?.formationAssembly?.easy?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.formationAssembly?.easy?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.formationAssembly?.easy?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.formationAssembly?.easy?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.formationAssembly?.easy?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.formationAssembly?.easy?.bestScore) || 0),
          mostRoundsCompleted: Math.max(0, Number(obj.training?.formationAssembly?.easy?.mostRoundsCompleted) || 0),
          fastestWinningRunMs: obj.training?.formationAssembly?.easy?.fastestWinningRunMs ? Number(obj.training.formationAssembly.easy.fastestWinningRunMs) : null,
          perfectWins: Math.max(0, Number(obj.training?.formationAssembly?.easy?.perfectWins) || 0),
          fewestActionsInWin: obj.training?.formationAssembly?.easy?.fewestActionsInWin ? Number(obj.training.formationAssembly.easy.fewestActionsInWin) : null,
          lastPlayedAt: obj.training?.formationAssembly?.easy?.lastPlayedAt ? Number(obj.training.formationAssembly.easy.lastPlayedAt) : null,
          lastWonAt: obj.training?.formationAssembly?.easy?.lastWonAt ? Number(obj.training.formationAssembly.easy.lastWonAt) : null,
        },
        medium: {
          runsStarted: Math.max(0, Number(obj.training?.formationAssembly?.medium?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.formationAssembly?.medium?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.formationAssembly?.medium?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.formationAssembly?.medium?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.formationAssembly?.medium?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.formationAssembly?.medium?.bestScore) || 0),
          mostRoundsCompleted: Math.max(0, Number(obj.training?.formationAssembly?.medium?.mostRoundsCompleted) || 0),
          fastestWinningRunMs: obj.training?.formationAssembly?.medium?.fastestWinningRunMs ? Number(obj.training.formationAssembly.medium.fastestWinningRunMs) : null,
          perfectWins: Math.max(0, Number(obj.training?.formationAssembly?.medium?.perfectWins) || 0),
          fewestActionsInWin: obj.training?.formationAssembly?.medium?.fewestActionsInWin ? Number(obj.training.formationAssembly.medium.fewestActionsInWin) : null,
          lastPlayedAt: obj.training?.formationAssembly?.medium?.lastPlayedAt ? Number(obj.training.formationAssembly.medium.lastPlayedAt) : null,
          lastWonAt: obj.training?.formationAssembly?.medium?.lastWonAt ? Number(obj.training.formationAssembly.medium.lastWonAt) : null,
        },
        hard: {
          runsStarted: Math.max(0, Number(obj.training?.formationAssembly?.hard?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.formationAssembly?.hard?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.formationAssembly?.hard?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.formationAssembly?.hard?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.formationAssembly?.hard?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.formationAssembly?.hard?.bestScore) || 0),
          mostRoundsCompleted: Math.max(0, Number(obj.training?.formationAssembly?.hard?.mostRoundsCompleted) || 0),
          fastestWinningRunMs: obj.training?.formationAssembly?.hard?.fastestWinningRunMs ? Number(obj.training.formationAssembly.hard.fastestWinningRunMs) : null,
          perfectWins: Math.max(0, Number(obj.training?.formationAssembly?.hard?.perfectWins) || 0),
          fewestActionsInWin: obj.training?.formationAssembly?.hard?.fewestActionsInWin ? Number(obj.training.formationAssembly.hard.fewestActionsInWin) : null,
          lastPlayedAt: obj.training?.formationAssembly?.hard?.lastPlayedAt ? Number(obj.training.formationAssembly.hard.lastPlayedAt) : null,
          lastWonAt: obj.training?.formationAssembly?.hard?.lastWonAt ? Number(obj.training.formationAssembly.hard.lastWonAt) : null,
        },
        lastRecordedRunId: obj.training?.formationAssembly?.lastRecordedRunId ? String(obj.training.formationAssembly.lastRecordedRunId) : null,
      },
      supplyRoute: {
        easy: {
          runsStarted: Math.max(0, Number(obj.training?.supplyRoute?.easy?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.supplyRoute?.easy?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.supplyRoute?.easy?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.supplyRoute?.easy?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.supplyRoute?.easy?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.supplyRoute?.easy?.bestScore) || 0),
          mostRoundsCompleted: Math.max(0, Number(obj.training?.supplyRoute?.easy?.mostRoundsCompleted) || 0),
          fastestWinningRunMs: obj.training?.supplyRoute?.easy?.fastestWinningRunMs ? Number(obj.training.supplyRoute.easy.fastestWinningRunMs) : null,
          perfectWins: Math.max(0, Number(obj.training?.supplyRoute?.easy?.perfectWins) || 0),
          fewestRotationsInWin: obj.training?.supplyRoute?.easy?.fewestRotationsInWin ? Number(obj.training.supplyRoute.easy.fewestRotationsInWin) : null,
          bestRotationEfficiency: Math.max(0, Number(obj.training?.supplyRoute?.easy?.bestRotationEfficiency) || 0),
          mostDepotsConnectedInRound: Math.max(0, Number(obj.training?.supplyRoute?.easy?.mostDepotsConnectedInRound) || 0),
          lastPlayedAt: obj.training?.supplyRoute?.easy?.lastPlayedAt ? Number(obj.training.supplyRoute.easy.lastPlayedAt) : null,
          lastWonAt: obj.training?.supplyRoute?.easy?.lastWonAt ? Number(obj.training.supplyRoute.easy.lastWonAt) : null,
        },
        medium: {
          runsStarted: Math.max(0, Number(obj.training?.supplyRoute?.medium?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.supplyRoute?.medium?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.supplyRoute?.medium?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.supplyRoute?.medium?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.supplyRoute?.medium?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.supplyRoute?.medium?.bestScore) || 0),
          mostRoundsCompleted: Math.max(0, Number(obj.training?.supplyRoute?.medium?.mostRoundsCompleted) || 0),
          fastestWinningRunMs: obj.training?.supplyRoute?.medium?.fastestWinningRunMs ? Number(obj.training.supplyRoute.medium.fastestWinningRunMs) : null,
          perfectWins: Math.max(0, Number(obj.training?.supplyRoute?.medium?.perfectWins) || 0),
          fewestRotationsInWin: obj.training?.supplyRoute?.medium?.fewestRotationsInWin ? Number(obj.training.supplyRoute.medium.fewestRotationsInWin) : null,
          bestRotationEfficiency: Math.max(0, Number(obj.training?.supplyRoute?.medium?.bestRotationEfficiency) || 0),
          mostDepotsConnectedInRound: Math.max(0, Number(obj.training?.supplyRoute?.medium?.mostDepotsConnectedInRound) || 0),
          lastPlayedAt: obj.training?.supplyRoute?.medium?.lastPlayedAt ? Number(obj.training.supplyRoute.medium.lastPlayedAt) : null,
          lastWonAt: obj.training?.supplyRoute?.medium?.lastWonAt ? Number(obj.training.supplyRoute.medium.lastWonAt) : null,
        },
        hard: {
          runsStarted: Math.max(0, Number(obj.training?.supplyRoute?.hard?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.supplyRoute?.hard?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.supplyRoute?.hard?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.supplyRoute?.hard?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.supplyRoute?.hard?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.supplyRoute?.hard?.bestScore) || 0),
          mostRoundsCompleted: Math.max(0, Number(obj.training?.supplyRoute?.hard?.mostRoundsCompleted) || 0),
          fastestWinningRunMs: obj.training?.supplyRoute?.hard?.fastestWinningRunMs ? Number(obj.training.supplyRoute.hard.fastestWinningRunMs) : null,
          perfectWins: Math.max(0, Number(obj.training?.supplyRoute?.hard?.perfectWins) || 0),
          fewestRotationsInWin: obj.training?.supplyRoute?.hard?.fewestRotationsInWin ? Number(obj.training.supplyRoute.hard.fewestRotationsInWin) : null,
          bestRotationEfficiency: Math.max(0, Number(obj.training?.supplyRoute?.hard?.bestRotationEfficiency) || 0),
          mostDepotsConnectedInRound: Math.max(0, Number(obj.training?.supplyRoute?.hard?.mostDepotsConnectedInRound) || 0),
          lastPlayedAt: obj.training?.supplyRoute?.hard?.lastPlayedAt ? Number(obj.training.supplyRoute.hard.lastPlayedAt) : null,
          lastWonAt: obj.training?.supplyRoute?.hard?.lastWonAt ? Number(obj.training.supplyRoute.hard.lastWonAt) : null,
        },
        lastRecordedRunId: obj.training?.supplyRoute?.lastRecordedRunId ? String(obj.training.supplyRoute.lastRecordedRunId) : null,
      },
      gomoku: {
        easy: {
          matchesStarted: Math.max(0, Number(obj.training?.gomoku?.easy?.matchesStarted) || 0),
          matchesFinished: Math.max(0, Number(obj.training?.gomoku?.easy?.matchesFinished) || 0),
          wins: Math.max(0, Number(obj.training?.gomoku?.easy?.wins) || 0),
          losses: Math.max(0, Number(obj.training?.gomoku?.easy?.losses) || 0),
          resignations: Math.max(0, Number(obj.training?.gomoku?.easy?.resignations) || 0),
          interruptions: Math.max(0, Number(obj.training?.gomoku?.easy?.interruptions) || 0),
          winsAsX: Math.max(0, Number(obj.training?.gomoku?.easy?.winsAsX) || 0),
          winsAsO: Math.max(0, Number(obj.training?.gomoku?.easy?.winsAsO) || 0),
          winsGoingFirst: Math.max(0, Number(obj.training?.gomoku?.easy?.winsGoingFirst) || 0),
          winsGoingSecond: Math.max(0, Number(obj.training?.gomoku?.easy?.winsGoingSecond) || 0),
          lossesGoingFirst: Math.max(0, Number(obj.training?.gomoku?.easy?.lossesGoingFirst) || 0),
          lossesGoingSecond: Math.max(0, Number(obj.training?.gomoku?.easy?.lossesGoingSecond) || 0),
          shortestWinMoveCount: obj.training?.gomoku?.easy?.shortestWinMoveCount ? Number(obj.training.gomoku.easy.shortestWinMoveCount) : null,
          longestMatchMoveCount: Math.max(0, Number(obj.training?.gomoku?.easy?.longestMatchMoveCount) || 0),
          fastestWinMs: obj.training?.gomoku?.easy?.fastestWinMs ? Number(obj.training.gomoku.easy.fastestWinMs) : null,
          totalPlayerMoves: Math.max(0, Number(obj.training?.gomoku?.easy?.totalPlayerMoves) || 0),
          totalAiMoves: Math.max(0, Number(obj.training?.gomoku?.easy?.totalAiMoves) || 0),
          lastPlayedAt: obj.training?.gomoku?.easy?.lastPlayedAt ? Number(obj.training.gomoku.easy.lastPlayedAt) : null,
          lastWonAt: obj.training?.gomoku?.easy?.lastWonAt ? Number(obj.training.gomoku.easy.lastWonAt) : null,
        },
        medium: {
          matchesStarted: Math.max(0, Number(obj.training?.gomoku?.medium?.matchesStarted) || 0),
          matchesFinished: Math.max(0, Number(obj.training?.gomoku?.medium?.matchesFinished) || 0),
          wins: Math.max(0, Number(obj.training?.gomoku?.medium?.wins) || 0),
          losses: Math.max(0, Number(obj.training?.gomoku?.medium?.losses) || 0),
          resignations: Math.max(0, Number(obj.training?.gomoku?.medium?.resignations) || 0),
          interruptions: Math.max(0, Number(obj.training?.gomoku?.medium?.interruptions) || 0),
          winsAsX: Math.max(0, Number(obj.training?.gomoku?.medium?.winsAsX) || 0),
          winsAsO: Math.max(0, Number(obj.training?.gomoku?.medium?.winsAsO) || 0),
          winsGoingFirst: Math.max(0, Number(obj.training?.gomoku?.medium?.winsGoingFirst) || 0),
          winsGoingSecond: Math.max(0, Number(obj.training?.gomoku?.medium?.winsGoingSecond) || 0),
          lossesGoingFirst: Math.max(0, Number(obj.training?.gomoku?.medium?.lossesGoingFirst) || 0),
          lossesGoingSecond: Math.max(0, Number(obj.training?.gomoku?.medium?.lossesGoingSecond) || 0),
          shortestWinMoveCount: obj.training?.gomoku?.medium?.shortestWinMoveCount ? Number(obj.training.gomoku.medium.shortestWinMoveCount) : null,
          longestMatchMoveCount: Math.max(0, Number(obj.training?.gomoku?.medium?.longestMatchMoveCount) || 0),
          fastestWinMs: obj.training?.gomoku?.medium?.fastestWinMs ? Number(obj.training.gomoku.medium.fastestWinMs) : null,
          totalPlayerMoves: Math.max(0, Number(obj.training?.gomoku?.medium?.totalPlayerMoves) || 0),
          totalAiMoves: Math.max(0, Number(obj.training?.gomoku?.medium?.totalAiMoves) || 0),
          lastPlayedAt: obj.training?.gomoku?.medium?.lastPlayedAt ? Number(obj.training.gomoku.medium.lastPlayedAt) : null,
          lastWonAt: obj.training?.gomoku?.medium?.lastWonAt ? Number(obj.training.gomoku.medium.lastWonAt) : null,
        },
        hard: {
          matchesStarted: Math.max(0, Number(obj.training?.gomoku?.hard?.matchesStarted) || 0),
          matchesFinished: Math.max(0, Number(obj.training?.gomoku?.hard?.matchesFinished) || 0),
          wins: Math.max(0, Number(obj.training?.gomoku?.hard?.wins) || 0),
          losses: Math.max(0, Number(obj.training?.gomoku?.hard?.losses) || 0),
          resignations: Math.max(0, Number(obj.training?.gomoku?.hard?.resignations) || 0),
          interruptions: Math.max(0, Number(obj.training?.gomoku?.hard?.interruptions) || 0),
          winsAsX: Math.max(0, Number(obj.training?.gomoku?.hard?.winsAsX) || 0),
          winsAsO: Math.max(0, Number(obj.training?.gomoku?.hard?.winsAsO) || 0),
          winsGoingFirst: Math.max(0, Number(obj.training?.gomoku?.hard?.winsGoingFirst) || 0),
          winsGoingSecond: Math.max(0, Number(obj.training?.gomoku?.hard?.winsGoingSecond) || 0),
          lossesGoingFirst: Math.max(0, Number(obj.training?.gomoku?.hard?.lossesGoingFirst) || 0),
          lossesGoingSecond: Math.max(0, Number(obj.training?.gomoku?.hard?.lossesGoingSecond) || 0),
          shortestWinMoveCount: obj.training?.gomoku?.hard?.shortestWinMoveCount ? Number(obj.training.gomoku.hard.shortestWinMoveCount) : null,
          longestMatchMoveCount: Math.max(0, Number(obj.training?.gomoku?.hard?.longestMatchMoveCount) || 0),
          fastestWinMs: obj.training?.gomoku?.hard?.fastestWinMs ? Number(obj.training.gomoku.hard.fastestWinMs) : null,
          totalPlayerMoves: Math.max(0, Number(obj.training?.gomoku?.hard?.totalPlayerMoves) || 0),
          totalAiMoves: Math.max(0, Number(obj.training?.gomoku?.hard?.totalAiMoves) || 0),
          lastPlayedAt: obj.training?.gomoku?.hard?.lastPlayedAt ? Number(obj.training.gomoku.hard.lastPlayedAt) : null,
          lastWonAt: obj.training?.gomoku?.hard?.lastWonAt ? Number(obj.training.gomoku.hard.lastWonAt) : null,
        },
        lastRecordedRunId: obj.training?.gomoku?.lastRecordedRunId ? String(obj.training.gomoku.lastRecordedRunId) : null,
      },
      radarTracking: {
        easy: {
          runsStarted: Math.max(0, Number(obj.training?.radarTracking?.easy?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.radarTracking?.easy?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.radarTracking?.easy?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.radarTracking?.easy?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.radarTracking?.easy?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.radarTracking?.easy?.bestScore) || 0),
          bestAccuracy: Math.max(0, Number(obj.training?.radarTracking?.easy?.bestAccuracy) || 0),
          mostRoundsCompleted: Math.max(0, Number(obj.training?.radarTracking?.easy?.mostRoundsCompleted) || 0),
          fastestWinningRunMs: obj.training?.radarTracking?.easy?.fastestWinningRunMs ? Number(obj.training.radarTracking.easy.fastestWinningRunMs) : null,
          perfectWins: Math.max(0, Number(obj.training?.radarTracking?.easy?.perfectWins) || 0),
          lastPlayedAt: obj.training?.radarTracking?.easy?.lastPlayedAt ? Number(obj.training.radarTracking.easy.lastPlayedAt) : null,
          lastWonAt: obj.training?.radarTracking?.easy?.lastWonAt ? Number(obj.training.radarTracking.easy.lastWonAt) : null,
        },
        medium: {
          runsStarted: Math.max(0, Number(obj.training?.radarTracking?.medium?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.radarTracking?.medium?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.radarTracking?.medium?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.radarTracking?.medium?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.radarTracking?.medium?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.radarTracking?.medium?.bestScore) || 0),
          bestAccuracy: Math.max(0, Number(obj.training?.radarTracking?.medium?.bestAccuracy) || 0),
          mostRoundsCompleted: Math.max(0, Number(obj.training?.radarTracking?.medium?.mostRoundsCompleted) || 0),
          fastestWinningRunMs: obj.training?.radarTracking?.medium?.fastestWinningRunMs ? Number(obj.training.radarTracking.medium.fastestWinningRunMs) : null,
          perfectWins: Math.max(0, Number(obj.training?.radarTracking?.medium?.perfectWins) || 0),
          lastPlayedAt: obj.training?.radarTracking?.medium?.lastPlayedAt ? Number(obj.training.radarTracking.medium.lastPlayedAt) : null,
          lastWonAt: obj.training?.radarTracking?.medium?.lastWonAt ? Number(obj.training.radarTracking.medium.lastWonAt) : null,
        },
        hard: {
          runsStarted: Math.max(0, Number(obj.training?.radarTracking?.hard?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.radarTracking?.hard?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.radarTracking?.hard?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.radarTracking?.hard?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.radarTracking?.hard?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.radarTracking?.hard?.bestScore) || 0),
          bestAccuracy: Math.max(0, Number(obj.training?.radarTracking?.hard?.bestAccuracy) || 0),
          mostRoundsCompleted: Math.max(0, Number(obj.training?.radarTracking?.hard?.mostRoundsCompleted) || 0),
          fastestWinningRunMs: obj.training?.radarTracking?.hard?.fastestWinningRunMs ? Number(obj.training.radarTracking.hard.fastestWinningRunMs) : null,
          perfectWins: Math.max(0, Number(obj.training?.radarTracking?.hard?.perfectWins) || 0),
          lastPlayedAt: obj.training?.radarTracking?.hard?.lastPlayedAt ? Number(obj.training.radarTracking.hard.lastPlayedAt) : null,
          lastWonAt: obj.training?.radarTracking?.hard?.lastWonAt ? Number(obj.training.radarTracking.hard.lastWonAt) : null,
        },
        lastRecordedRunId: obj.training?.radarTracking?.lastRecordedRunId ? String(obj.training.radarTracking.lastRecordedRunId) : null,
      },
      chess: {
        easy: {
          matchesStarted: Math.max(0, Number(obj.training?.chess?.easy?.matchesStarted) || 0),
          matchesFinished: Math.max(0, Number(obj.training?.chess?.easy?.matchesFinished) || 0),
          wins: Math.max(0, Number(obj.training?.chess?.easy?.wins) || 0),
          losses: Math.max(0, Number(obj.training?.chess?.easy?.losses) || 0),
          draws: Math.max(0, Number(obj.training?.chess?.easy?.draws) || 0),
          resignations: Math.max(0, Number(obj.training?.chess?.easy?.resignations) || 0),
          interruptions: Math.max(0, Number(obj.training?.chess?.easy?.interruptions) || 0),
          winsAsWhite: Math.max(0, Number(obj.training?.chess?.easy?.winsAsWhite) || 0),
          winsAsBlack: Math.max(0, Number(obj.training?.chess?.easy?.winsAsBlack) || 0),
          winsGoingFirst: Math.max(0, Number(obj.training?.chess?.easy?.winsGoingFirst) || 0),
          winsGoingSecond: Math.max(0, Number(obj.training?.chess?.easy?.winsGoingSecond) || 0),
          shortestWinMoveCount: obj.training?.chess?.easy?.shortestWinMoveCount ? Number(obj.training.chess.easy.shortestWinMoveCount) : null,
          longestMatchMoveCount: Math.max(0, Number(obj.training?.chess?.easy?.longestMatchMoveCount) || 0),
          fastestWinMs: obj.training?.chess?.easy?.fastestWinMs ? Number(obj.training.chess.easy.fastestWinMs) : null,
          totalPlayerMoves: Math.max(0, Number(obj.training?.chess?.easy?.totalPlayerMoves) || 0),
          totalAiMoves: Math.max(0, Number(obj.training?.chess?.easy?.totalAiMoves) || 0),
          lastPlayedAt: obj.training?.chess?.easy?.lastPlayedAt ? Number(obj.training.chess.easy.lastPlayedAt) : null,
          lastWonAt: obj.training?.chess?.easy?.lastWonAt ? Number(obj.training.chess.easy.lastWonAt) : null,
        },
        medium: {
          matchesStarted: Math.max(0, Number(obj.training?.chess?.medium?.matchesStarted) || 0),
          matchesFinished: Math.max(0, Number(obj.training?.chess?.medium?.matchesFinished) || 0),
          wins: Math.max(0, Number(obj.training?.chess?.medium?.wins) || 0),
          losses: Math.max(0, Number(obj.training?.chess?.medium?.losses) || 0),
          draws: Math.max(0, Number(obj.training?.chess?.medium?.draws) || 0),
          resignations: Math.max(0, Number(obj.training?.chess?.medium?.resignations) || 0),
          interruptions: Math.max(0, Number(obj.training?.chess?.medium?.interruptions) || 0),
          winsAsWhite: Math.max(0, Number(obj.training?.chess?.medium?.winsAsWhite) || 0),
          winsAsBlack: Math.max(0, Number(obj.training?.chess?.medium?.winsAsBlack) || 0),
          winsGoingFirst: Math.max(0, Number(obj.training?.chess?.medium?.winsGoingFirst) || 0),
          winsGoingSecond: Math.max(0, Number(obj.training?.chess?.medium?.winsGoingSecond) || 0),
          shortestWinMoveCount: obj.training?.chess?.medium?.shortestWinMoveCount ? Number(obj.training.chess.medium.shortestWinMoveCount) : null,
          longestMatchMoveCount: Math.max(0, Number(obj.training?.chess?.medium?.longestMatchMoveCount) || 0),
          fastestWinMs: obj.training?.chess?.medium?.fastestWinMs ? Number(obj.training.chess.medium.fastestWinMs) : null,
          totalPlayerMoves: Math.max(0, Number(obj.training?.chess?.medium?.totalPlayerMoves) || 0),
          totalAiMoves: Math.max(0, Number(obj.training?.chess?.medium?.totalAiMoves) || 0),
          lastPlayedAt: obj.training?.chess?.medium?.lastPlayedAt ? Number(obj.training.chess.medium.lastPlayedAt) : null,
          lastWonAt: obj.training?.chess?.medium?.lastWonAt ? Number(obj.training.chess.medium.lastWonAt) : null,
        },
        hard: {
          matchesStarted: Math.max(0, Number(obj.training?.chess?.hard?.matchesStarted) || 0),
          matchesFinished: Math.max(0, Number(obj.training?.chess?.hard?.matchesFinished) || 0),
          wins: Math.max(0, Number(obj.training?.chess?.hard?.wins) || 0),
          losses: Math.max(0, Number(obj.training?.chess?.hard?.losses) || 0),
          draws: Math.max(0, Number(obj.training?.chess?.hard?.draws) || 0),
          resignations: Math.max(0, Number(obj.training?.chess?.hard?.resignations) || 0),
          interruptions: Math.max(0, Number(obj.training?.chess?.hard?.interruptions) || 0),
          winsAsWhite: Math.max(0, Number(obj.training?.chess?.hard?.winsAsWhite) || 0),
          winsAsBlack: Math.max(0, Number(obj.training?.chess?.hard?.winsAsBlack) || 0),
          winsGoingFirst: Math.max(0, Number(obj.training?.chess?.hard?.winsGoingFirst) || 0),
          winsGoingSecond: Math.max(0, Number(obj.training?.chess?.hard?.winsGoingSecond) || 0),
          shortestWinMoveCount: obj.training?.chess?.hard?.shortestWinMoveCount ? Number(obj.training.chess.hard.shortestWinMoveCount) : null,
          longestMatchMoveCount: Math.max(0, Number(obj.training?.chess?.hard?.longestMatchMoveCount) || 0),
          fastestWinMs: obj.training?.chess?.hard?.fastestWinMs ? Number(obj.training.chess.hard.fastestWinMs) : null,
          totalPlayerMoves: Math.max(0, Number(obj.training?.chess?.hard?.totalPlayerMoves) || 0),
          totalAiMoves: Math.max(0, Number(obj.training?.chess?.hard?.totalAiMoves) || 0),
          lastPlayedAt: obj.training?.chess?.hard?.lastPlayedAt ? Number(obj.training.chess.hard.lastPlayedAt) : null,
          lastWonAt: obj.training?.chess?.hard?.lastWonAt ? Number(obj.training.chess.hard.lastWonAt) : null,
        },
        lastRecordedRunId: obj.training?.chess?.lastRecordedRunId ? String(obj.training.chess.lastRecordedRunId) : null,
      },
      shootingRange: {
        easy: {
          runsStarted: Math.max(0, Number(obj.training?.shootingRange?.easy?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.shootingRange?.easy?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.shootingRange?.easy?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.shootingRange?.easy?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.shootingRange?.easy?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.shootingRange?.easy?.bestScore) || 0),
          bestAccuracy: Math.max(0, Number(obj.training?.shootingRange?.easy?.bestAccuracy) || 0),
          targetsDestroyed: Math.max(0, Number(obj.training?.shootingRange?.easy?.targetsDestroyed) || 0),
          fastestWinningRunMs: obj.training?.shootingRange?.easy?.fastestWinningRunMs ? Number(obj.training.shootingRange.easy.fastestWinningRunMs) : null,
          perfectWins: Math.max(0, Number(obj.training?.shootingRange?.easy?.perfectWins) || 0),
          lastPlayedAt: obj.training?.shootingRange?.easy?.lastPlayedAt ? Number(obj.training.shootingRange.easy.lastPlayedAt) : null,
          lastWonAt: obj.training?.shootingRange?.easy?.lastWonAt ? Number(obj.training.shootingRange.easy.lastWonAt) : null,
        },
        medium: {
          runsStarted: Math.max(0, Number(obj.training?.shootingRange?.medium?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.shootingRange?.medium?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.shootingRange?.medium?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.shootingRange?.medium?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.shootingRange?.medium?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.shootingRange?.medium?.bestScore) || 0),
          bestAccuracy: Math.max(0, Number(obj.training?.shootingRange?.medium?.bestAccuracy) || 0),
          targetsDestroyed: Math.max(0, Number(obj.training?.shootingRange?.medium?.targetsDestroyed) || 0),
          fastestWinningRunMs: obj.training?.shootingRange?.medium?.fastestWinningRunMs ? Number(obj.training.shootingRange.medium.fastestWinningRunMs) : null,
          perfectWins: Math.max(0, Number(obj.training?.shootingRange?.medium?.perfectWins) || 0),
          lastPlayedAt: obj.training?.shootingRange?.medium?.lastPlayedAt ? Number(obj.training.shootingRange.medium.lastPlayedAt) : null,
          lastWonAt: obj.training?.shootingRange?.medium?.lastWonAt ? Number(obj.training.shootingRange.medium.lastWonAt) : null,
        },
        hard: {
          runsStarted: Math.max(0, Number(obj.training?.shootingRange?.hard?.runsStarted) || 0),
          runsFinished: Math.max(0, Number(obj.training?.shootingRange?.hard?.runsFinished) || 0),
          wins: Math.max(0, Number(obj.training?.shootingRange?.hard?.wins) || 0),
          failures: Math.max(0, Number(obj.training?.shootingRange?.hard?.failures) || 0),
          interruptions: Math.max(0, Number(obj.training?.shootingRange?.hard?.interruptions) || 0),
          bestScore: Math.max(0, Number(obj.training?.shootingRange?.hard?.bestScore) || 0),
          bestAccuracy: Math.max(0, Number(obj.training?.shootingRange?.hard?.bestAccuracy) || 0),
          targetsDestroyed: Math.max(0, Number(obj.training?.shootingRange?.hard?.targetsDestroyed) || 0),
          fastestWinningRunMs: obj.training?.shootingRange?.hard?.fastestWinningRunMs ? Number(obj.training.shootingRange.hard.fastestWinningRunMs) : null,
          perfectWins: Math.max(0, Number(obj.training?.shootingRange?.hard?.perfectWins) || 0),
          lastPlayedAt: obj.training?.shootingRange?.hard?.lastPlayedAt ? Number(obj.training.shootingRange.hard.lastPlayedAt) : null,
          lastWonAt: obj.training?.shootingRange?.hard?.lastWonAt ? Number(obj.training.shootingRange.hard.lastWonAt) : null,
        },
        lastRecordedRunId: obj.training?.shootingRange?.lastRecordedRunId ? String(obj.training.shootingRange.lastRecordedRunId) : null,
      },
    },
    connection: {
      lastVerifiedOnlineAt: obj.connection?.lastVerifiedOnlineAt ? Number(obj.connection.lastVerifiedOnlineAt) : null,
    },
    ui: {
      onboardingCompleted: Boolean(obj.ui?.onboardingCompleted),
      lastSeenDelegationReportAt: obj.ui?.lastSeenDelegationReportAt ? Number(obj.ui.lastSeenDelegationReportAt) : null,
      interruptedPromotionChallenge: obj.ui?.interruptedPromotionChallenge || null,
      pendingPromotionCeremony: pendingCeremony,
    },
    settings: {
      soundEnabled: obj.settings?.soundEnabled !== false,
      reducedMotion: Boolean(obj.settings?.reducedMotion),
      compactNumbers: Boolean(obj.settings?.compactNumbers),
      notificationsEnabled: obj.settings?.notificationsEnabled !== false,
      notificationPreferences: {
        xpReady: obj.settings?.notificationPreferences?.xpReady !== false,
        cropReady: obj.settings?.notificationPreferences?.cropReady !== false,
        feedEmpty: obj.settings?.notificationPreferences?.feedEmpty !== false,
      },
    },
    farm: obj.farm
      ? migrateFarmState(obj.farm, now)
      : createDefaultFarmState(now),
    medals: obj.medals ? obj.medals : { unlockedMedalIds: [], unlockedAtMap: {}, selectedMedalIds: [] },
    mastery: obj.mastery ? obj.mastery : {},
    globalStats: obj.globalStats ? obj.globalStats : undefined,
    journal: { events: migratedJournalEvents },
    coupons: sanitizeCouponState(obj.coupons),
  };

  ensureMedalAndMasteryState(state);
  evaluateMedalUnlocks(state);
  if (!hadJournalEvents) backfillJournalEvents(state);
  else if (!familyLayout) backfillRankPromotions(state);

  // Both tiered saves and previously converted saves can lack an earned appointment.
  // The saved EXP proves the milestone, but does not establish its date.
  recordAppointments(state, 0, xpTicks, getRequiredXpTicksForTransition(state.progression.currentRankIndex), null);

  return state;
}
