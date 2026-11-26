import { getRankRole } from "../rankRoles";
import { RANK_STEP_STORIES } from "../rankStories";
import { FARM_PLOT_COUNT } from "../../features/tang_gia/farmCatalog";
import { GameState, JournalEvent, JournalState, TrainingGameId } from "../types";
import { MEDAL_CATALOG } from "../medals/medalCatalog";
import { MASTERY_CONFIGS } from "../mastery/masteryConfig";

export function ensureJournalState(draft: GameState): JournalState {
  if (!draft.journal) {
    draft.journal = { events: [] };
  }
  if (!draft.journal.events) {
    draft.journal.events = [];
  }
  return draft.journal;
}

export function addJournalEvent(
  draft: GameState,
  eventData: {
    key: string;
    type: JournalEvent["type"];
    category: JournalEvent["category"];
    title: string;
    description: string;
    iconSymbol?: string;
    occurredAt?: number | null;
    dateUnknown?: boolean;
    relatedId?: string;
    metadata?: Record<string, any>;
  }
): boolean {
  const journal = ensureJournalState(draft);
  const exists = journal.events.some((e) => e.key === eventData.key);
  if (exists) return false; // Deduplicated idempotently

  const newEvent: JournalEvent = {
    id: `jrn_${eventData.key}_${Date.now()}`,
    key: eventData.key,
    type: eventData.type,
    category: eventData.category,
    title: eventData.title,
    description: eventData.description,
    iconSymbol: eventData.iconSymbol,
    occurredAt: eventData.occurredAt ?? null,
    dateUnknown: eventData.dateUnknown ?? (eventData.occurredAt ? false : true),
    relatedId: eventData.relatedId,
    metadata: eventData.metadata,
  };

  journal.events.unshift(newEvent);
  return true;
}

export function recordAppointments(draft: GameState, before: number, after: number, required: number, at: number | null): void {
  if (required <= 0 || before === after) return;
  const index = draft.progression.currentRankIndex;
  for (const ratio of [0.5, 0.75]) {
    if (before >= required * ratio || after < required * ratio) continue;
    const role = getRankRole(index, ratio);
    const earlier = getRankRole(index, ratio - 0.01);
    if (role.primaryTitle === earlier.primaryTitle && role.secondaryTitle === earlier.secondaryTitle) continue;
    addJournalEvent(draft, {
      key: "appointment:" + index + ":" + ratio,
      type: "appointment", category: "rank", relatedId: String(index),
      title: (ratio === 0.5 ? "Kiêm nhiệm · " + role.secondaryTitle : "Nhậm chức · " + role.primaryTitle),
      description: "Đạt " + ratio * 100 + "% EXP tại " + role.unitDisplayName + ".",
      occurredAt: at,
    });
  }
}

export function recordJournalPromotion(
  draft: GameState,
  rankIndex: number,
  rankName: string,
  kind: "onboarding" | "minor" | "major",
  timestamp: number,
  correctCount?: number,
  totalQuestions?: number,
  retries?: number
): void {
  const key = `promotion:${rankIndex}`;
  let desc = "Được thăng cấp trong quân ngũ";
  if (kind === "onboarding" || rankIndex === 0) {
    desc = "Khởi đầu hành trình binh nghiệp";
  } else if (kind === "major") {
    desc = RANK_STEP_STORIES[rankIndex].title;
  }

  if (correctCount !== undefined && totalQuestions !== undefined) {
    const isPerfectFirstTry = correctCount === totalQuestions && (!retries || retries === 0);
    const scoreStr = isPerfectFirstTry
      ? `Thủ khoa ${correctCount}/${totalQuestions} câu`
      : `Đúng ${correctCount}/${totalQuestions} câu`;
    const retryStr = retries && retries > 0
      ? `Thi lại ${retries} lần`
      : `Không thi lại`;
    desc = `${desc} (${scoreStr} • ${retryStr})`;
  }

  addJournalEvent(draft, {
    key,
    type: "promotion",
    category: "rank",
    title: `⭐ ${rankName}`,
    description: desc,
    iconSymbol: "⭐",
    occurredAt: timestamp,
    dateUnknown: false,
    relatedId: String(rankIndex),
    metadata: {
      correctCount,
      totalQuestions,
      retries,
    },
  });
}

export function recordJournalMedalUnlocked(
  draft: GameState,
  medalId: string,
  timestamp: number
): void {
  const key = `medal:${medalId}`;
  const mDef = MEDAL_CATALOG.find((m) => m.id === medalId);

  addJournalEvent(draft, {
    key,
    type: "medal_unlocked",
    category: "medal",
    title: mDef ? `${mDef.iconSymbol} ${mDef.name}` : `🎖️ Huân Chương`,
    description: mDef ? mDef.description : "Nhận Huân Chương Binh Nghiệp",
    iconSymbol: mDef?.iconSymbol || "🎖️",
    occurredAt: timestamp,
    dateUnknown: false,
    relatedId: medalId,
  });
}

export function recordJournalMasteryReached(
  draft: GameState,
  gameId: TrainingGameId,
  level: number,
  timestamp: number
): void {
  const key = `mastery:${gameId}:${level}`;
  const mCfg = MASTERY_CONFIGS[gameId];
  const gameName = mCfg ? mCfg.gameName : gameId;
  const stageCfg = mCfg?.stages[level];
  const stageTitle = stageCfg ? stageCfg.title : `Level ${level}`;
  const isMax = level === 5;

  addJournalEvent(draft, {
    key,
    type: "mastery_reached",
    category: "mastery",
    title: `🏅 ${gameName}`,
    description: isMax
      ? `Mastery V — ${stageTitle} (Tối Đa)`
      : `Mastery ${level} — ${stageTitle}`,
    iconSymbol: "🏅",
    occurredAt: timestamp,
    dateUnknown: false,
    relatedId: `${gameId}_lvl_${level}`,
  });
}

/**
 * Automatically backfills history from existing save state
 * in an idempotent, deterministic manner.
 */
export function backfillJournalEvents(draft: GameState): void {
  ensureJournalState(draft);

  backfillRankPromotions(draft);

  // 2. Backfill Unlocked Medals
  const unlockedMedalIds = draft.medals?.unlockedMedalIds || [];
  const unlockedAtMap = draft.medals?.unlockedAtMap || {};
  for (const medalId of unlockedMedalIds) {
    const key = `medal:${medalId}`;
    const mDef = MEDAL_CATALOG.find((m) => m.id === medalId);
    const ts = unlockedAtMap[medalId];
    const occurredAt = ts && ts > 0 ? ts : null;

    addJournalEvent(draft, {
      key,
      type: "medal_unlocked",
      category: "medal",
      title: mDef ? `${mDef.iconSymbol} ${mDef.name}` : `🎖️ Huân Chương`,
      description: mDef ? mDef.description : "Nhận Huân Chương Binh Nghiệp",
      iconSymbol: mDef?.iconSymbol || "🎖️",
      occurredAt,
      dateUnknown: !occurredAt,
      relatedId: medalId,
    });
  }

  // 3. Backfill Mastery Achievements
  const masteryMap = draft.mastery || {};
  for (const [gameIdStr, mState] of Object.entries(masteryMap)) {
    if (!mState || mState.level <= 0) continue;
    const gameId = gameIdStr as TrainingGameId;
    const mCfg = MASTERY_CONFIGS[gameId];
    const gameName = mCfg ? mCfg.gameName : gameIdStr;

    for (let lvl = 1; lvl <= mState.level; lvl++) {
      const key = `mastery:${gameId}:${lvl}`;
      const stageCfg = mCfg?.stages[lvl];
      const stageTitle = stageCfg ? stageCfg.title : `Level ${lvl}`;
      const isMax = lvl === 5;

      addJournalEvent(draft, {
        key,
        type: "mastery_reached",
        category: "mastery",
        title: `🏅 ${gameName}`,
        description: isMax
          ? `Mastery V — ${stageTitle} (Tối Đa)`
          : `Mastery ${lvl} — ${stageTitle}`,
        iconSymbol: "🏅",
        occurredAt: null,
        dateUnknown: true,
        relatedId: `${gameId}_lvl_${lvl}`,
      });
    }
  }

  // 4. Backfill Special Training Milestones
  const global = draft.globalStats;
  if (
    global?.hasCompletedHardTrainingFirstTime ||
    (global?.hardCompletedMinigames && global.hardCompletedMinigames.length > 0)
  ) {
    addJournalEvent(draft, {
      key: "training:hard_first_win",
      type: "training_milestone",
      category: "training",
      title: "🎯 Thao Trường Thử Thách",
      description: "Hoàn thành xuất sắc bài huấn luyện ở độ khó Khó lần đầu tiên",
      iconSymbol: "🎯",
      occurredAt: null,
      dateUnknown: true,
    });
  }

  // 5. Backfill Farm Milestones
  if ((draft.farm?.unlockedPlotCount ?? 0) >= FARM_PLOT_COUNT) {
    addJournalEvent(draft, {
      key: "farm:all_" + FARM_PLOT_COUNT + "_plots",
      type: "farm_milestone",
      category: "farm",
      title: "🌱 Khai Hoang Toàn Bộ Nông Trại",
      description: "Đã mở toàn bộ " + FARM_PLOT_COUNT + " ô đất tăng gia sản xuất",
      iconSymbol: "🌱",
      occurredAt: null,
      dateUnknown: true,
    });
  }

  const penCap = global?.maxAnimalCapacityUnlocked || draft.farm?.penAnimals?.length || 0;
  if (penCap >= 5) {
    addJournalEvent(draft, {
      key: "farm:max_pen_capacity",
      type: "farm_milestone",
      category: "farm",
      title: "🐓 Chuồng Trại Sung Túc",
      description: "Đạt sức chứa tối đa 5/5 gia súc gia cầm trong chuồng nuôi",
      iconSymbol: "🐓",
      occurredAt: null,
      dateUnknown: true,
    });
  }

  if (global?.fertilizerTypesUsed && global.fertilizerTypesUsed.length > 0) {
    addJournalEvent(draft, {
      key: "farm:fertilizer_used",
      type: "farm_milestone",
      category: "farm",
      title: "✨ Bón Phân Năng Suất",
      description: "Bón phân chăm sóc cây trồng phát triển vượt bậc",
      iconSymbol: "✨",
      occurredAt: null,
      dateUnknown: true,
    });
  }
}

export function backfillRankPromotions(draft: GameState): void {
  // 1. Backfill Rank Promotions
  const history = draft.progression?.promotionHistory || [];
  for (const h of history) {
    const key = `promotion:${h.rankIndex}`;
    const occurredAt = h.achievedAt && h.achievedAt > 0 ? h.achievedAt : null;
    const isAcademy = h.rankIndex === 0;

    let desc = "Được thăng cấp trong quân ngũ";
    if (isAcademy) {
      desc = "Khởi đầu hành trình binh nghiệp";
    } else if (h.promotionKind === "major") {
      desc = RANK_STEP_STORIES[h.rankIndex].title;
    }

    const cCount = h.challenge?.correctCount;
    const tQuestions = h.challenge?.totalQuestions;
    const rCount = h.challenge?.retries;

    if (cCount !== undefined && tQuestions !== undefined) {
      const isPerfectFirstTry = cCount === tQuestions && (!rCount || rCount === 0);
      const scoreStr = isPerfectFirstTry
        ? `Thủ khoa ${cCount}/${tQuestions} câu`
        : `Đúng ${cCount}/${tQuestions} câu`;
      const retryStr = rCount && rCount > 0
        ? `Thi lại ${rCount} lần`
        : `Không thi lại`;
      desc = `${desc} (${scoreStr} • ${retryStr})`;
    }

    addJournalEvent(draft, {
      key,
      type: "promotion",
      category: "rank",
      title: `⭐ ${h.rankName}`,
      description: desc,
      iconSymbol: "⭐",
      occurredAt,
      dateUnknown: !occurredAt,
      relatedId: String(h.rankIndex),
      metadata: {
        correctCount: cCount,
        totalQuestions: tQuestions,
        retries: rCount,
      },
    });
  }
}
