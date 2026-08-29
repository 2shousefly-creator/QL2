import { GameState, TrainingGameId, TrainingDifficulty } from "../types";
import { MEDAL_CATALOG, getLifetimeXp, getUniqueSuccessfulMinigames, getUniqueHardCompletedMinigames } from "./medalCatalog";
import { MASTERY_CONFIGS } from "../mastery/masteryConfig";
import { recordJournalMedalUnlocked, recordJournalMasteryReached, addJournalEvent } from "../journal/journalEngine";

export function reconcileAllMedals(draft: GameState): void {
  if (!draft.medals) return;
  const medalsState = draft.medals;
  const validIds = new Set(MEDAL_CATALOG.map((m) => m.id));

  // Purge any non-existent medal IDs while preserving all legitimate unlocked medals
  if (Array.isArray(medalsState.unlockedMedalIds)) {
    medalsState.unlockedMedalIds = medalsState.unlockedMedalIds.filter((id) => validIds.has(id));
  }
  if (Array.isArray(medalsState.selectedMedalIds)) {
    medalsState.selectedMedalIds = medalsState.selectedMedalIds.filter(
      (id) => validIds.has(id) && medalsState.unlockedMedalIds.includes(id)
    );
  }
}

export function ensureMedalAndMasteryState(draft: GameState): void {
  if (!draft.medals) {
    draft.medals = {
      unlockedMedalIds: [],
      unlockedAtMap: {},
      selectedMedalIds: [],
    };
  }
  if (!draft.medals.unlockedMedalIds) draft.medals.unlockedMedalIds = [];
  if (!draft.medals.unlockedAtMap) draft.medals.unlockedAtMap = {};
  if (!draft.medals.selectedMedalIds) draft.medals.selectedMedalIds = [];

  if (!draft.mastery) {
    draft.mastery = {};
  }

  if (!draft.globalStats) {
    draft.globalStats = {
      lifetimeXp: getLifetimeXp(draft),
      totalTrainingSuccesses: 0,
      successfulMinigames: [],
      hardCompletedMinigames: [],
      totalCropHarvests: 0,
      maxAnimalCapacityUnlocked: draft.farm?.penAnimals?.length || 1,
      fullyWateredCropHarvests: 0,
      perfectCropHarvests: 0,
      waterAll9PlotsCount: 0,
      fertilizerTypesUsed: [],
      farmGoldEarned: 0,
      totalCropHarvestsPlusEggSales: 0,
      hasCompletedHardTrainingFirstTime: false,
      totalWateringCount: 0,
      totalFertilizerUsedCount: 0,
      totalEggsSold: 0,
      perfectFarmItemsSold: 0,
      totalFeedBagsUsed: 0,
      minigameWinStreaks: {},
      bestMinigameWinStreaks: {},
    };
  } else {
    draft.globalStats.lifetimeXp = getLifetimeXp(draft);
  }
  if (!draft.globalStats.successfulMinigames) draft.globalStats.successfulMinigames = [];
  if (!draft.globalStats.hardCompletedMinigames) draft.globalStats.hardCompletedMinigames = [];
  if (!draft.globalStats.fertilizerTypesUsed) draft.globalStats.fertilizerTypesUsed = [];
  if (draft.globalStats.totalWateringCount === undefined) draft.globalStats.totalWateringCount = 0;
  if (draft.globalStats.totalFertilizerUsedCount === undefined) draft.globalStats.totalFertilizerUsedCount = 0;
  if (draft.globalStats.totalEggsSold === undefined) draft.globalStats.totalEggsSold = 0;
  if (draft.globalStats.perfectFarmItemsSold === undefined) draft.globalStats.perfectFarmItemsSold = 0;
  if (draft.globalStats.totalFeedBagsUsed === undefined) draft.globalStats.totalFeedBagsUsed = 0;
  if (draft.globalStats.fertilizerCropHarvests === undefined) draft.globalStats.fertilizerCropHarvests = 0;
  if (!draft.globalStats.minigameWinStreaks) draft.globalStats.minigameWinStreaks = {};
  if (!draft.globalStats.bestMinigameWinStreaks) draft.globalStats.bestMinigameWinStreaks = {};

  // Reconcile list of unique minigames passed
  const uniqueSuccessful = getUniqueSuccessfulMinigames(draft);
  uniqueSuccessful.forEach((gameId) => {
    if (!draft.globalStats!.successfulMinigames.includes(gameId as TrainingGameId)) {
      draft.globalStats!.successfulMinigames.push(gameId as TrainingGameId);
    }
  });

  const uniqueHard = getUniqueHardCompletedMinigames(draft);
  uniqueHard.forEach((gameId) => {
    if (!draft.globalStats!.hardCompletedMinigames.includes(gameId as TrainingGameId)) {
      draft.globalStats!.hardCompletedMinigames.push(gameId as TrainingGameId);
    }
  });

  if (uniqueHard.length > 0 && !draft.globalStats.hasCompletedHardTrainingFirstTime) {
    draft.globalStats.hasCompletedHardTrainingFirstTime = true;
  }

  // Check existing plots in farm for fertilizer types or ready stats
  if (draft.farm?.plots) {
    for (const plot of draft.farm.plots) {
      if (plot.status === "growing" || plot.status === "ready") {
        if (plot.fertilizerId && !draft.globalStats.fertilizerTypesUsed.includes(plot.fertilizerId)) {
          draft.globalStats.fertilizerTypesUsed.push(plot.fertilizerId);
        }
      }
    }
  }

  // Reconcile crop and egg totals
  const totalCrop = Math.max(
    draft.globalStats.totalCropHarvests || 0,
    draft.globalStats.fullyWateredCropHarvests || 0,
    draft.globalStats.perfectCropHarvests || 0,
    draft.globalStats.fertilizerCropHarvests || 0
  );
  draft.globalStats.totalCropHarvests = totalCrop;

  const totalCropPlusEggs = Math.max(
    draft.globalStats.totalCropHarvestsPlusEggSales || 0,
    totalCrop + (draft.globalStats.totalEggsSold || 0)
  );
  draft.globalStats.totalCropHarvestsPlusEggSales = totalCropPlusEggs;

  draft.globalStats.totalFertilizerUsedCount = Math.max(
    draft.globalStats.totalFertilizerUsedCount || 0,
    draft.globalStats.fertilizerTypesUsed.length,
    draft.globalStats.perfectCropHarvests || 0,
    draft.globalStats.fertilizerCropHarvests || 0
  );

  draft.globalStats.totalWateringCount = Math.max(
    draft.globalStats.totalWateringCount || 0,
    (draft.globalStats.fullyWateredCropHarvests || 0) * 3,
    (draft.globalStats.waterAll9PlotsCount || 0) * 9
  );

  reconcileAllMedals(draft);
}

export function evaluateMedalUnlocks(draft: GameState): string[] {
  ensureMedalAndMasteryState(draft);

  const newlyUnlocked: string[] = [];

  for (const medalDef of MEDAL_CATALOG) {
    const isAlreadyUnlocked = draft.medals!.unlockedMedalIds.includes(medalDef.id);
    if (isAlreadyUnlocked) continue;

    const { isUnlocked } = medalDef.getProgress(draft);
    if (isUnlocked) {
      draft.medals!.unlockedMedalIds.push(medalDef.id);
      draft.medals!.unlockedAtMap[medalDef.id] = Date.now();
      newlyUnlocked.push(medalDef.id);
      recordJournalMedalUnlocked(draft, medalDef.id, Date.now());

      // If user has fewer than 6 medals displayed, auto select it for convenience
      if (draft.medals!.selectedMedalIds.length < 6 && !draft.medals!.selectedMedalIds.includes(medalDef.id)) {
        draft.medals!.selectedMedalIds.push(medalDef.id);
      }

      // Trigger congratulatory popup
      draft.ui.pendingMedalUnlockPopup = medalDef.id;
    }
  }

  return newlyUnlocked;
}

export function recordTrainingRunForMasteryAndMedals(
  draft: GameState,
  gameId: TrainingGameId,
  difficulty: TrainingDifficulty,
  victory: boolean
): void {
  ensureMedalAndMasteryState(draft);

  const global = draft.globalStats!;

  // Track per-game, per-difficulty win streaks
  if (!global.minigameWinStreaks) global.minigameWinStreaks = {};
  if (!global.minigameWinStreaks[gameId]) {
    global.minigameWinStreaks[gameId] = { easy: 0, medium: 0, hard: 0 };
  }
  if (!global.bestMinigameWinStreaks) global.bestMinigameWinStreaks = {};
  if (!global.bestMinigameWinStreaks[gameId]) {
    global.bestMinigameWinStreaks[gameId] = { easy: 0, medium: 0, hard: 0 };
  }

  if (victory) {
    global.totalTrainingSuccesses = (global.totalTrainingSuccesses || 0) + 1;
    if (!global.successfulMinigames.includes(gameId)) {
      global.successfulMinigames.push(gameId);
    }

    const currentStreak = (global.minigameWinStreaks[gameId][difficulty] || 0) + 1;
    global.minigameWinStreaks[gameId][difficulty] = currentStreak;
    global.bestMinigameWinStreaks[gameId][difficulty] = Math.max(
      global.bestMinigameWinStreaks[gameId][difficulty] || 0,
      currentStreak
    );

    if (difficulty === "hard") {
      if (!global.hardCompletedMinigames.includes(gameId)) {
        global.hardCompletedMinigames.push(gameId);
      }
      if (!global.hasCompletedHardTrainingFirstTime) {
        global.hasCompletedHardTrainingFirstTime = true;
        addJournalEvent(draft, {
          key: "training:hard_first_win",
          type: "training_milestone",
          category: "training",
          title: "🎯 Thao Trường Thử Thách",
          description: "Hoàn thành xuất sắc bài huấn luyện ở độ khó Khó lần đầu tiên",
          iconSymbol: "🎯",
          occurredAt: Date.now(),
          dateUnknown: false,
        });
      }
    }
  } else {
    // Reset streak for this minigame and difficulty on failure/loss
    global.minigameWinStreaks[gameId][difficulty] = 0;
  }

  // Update Mastery state
  const mConfig = MASTERY_CONFIGS[gameId];
  if (mConfig) {
    let mState = draft.mastery![gameId];
    if (!mState) {
      mState = {
        level: 0,
        stageSuccessfulCount: 0,
        stageMediumOrHigherCount: 0,
        stageHardCount: 0,
        currentHardWinStreak: 0,
      };
      draft.mastery![gameId] = mState;
    }

    if (mState.level < 5) {
      if (victory) {
        mState.stageSuccessfulCount++;
        if (difficulty === "medium" || difficulty === "hard") {
          mState.stageMediumOrHigherCount++;
        }
        if (difficulty === "hard") {
          mState.stageHardCount++;
          mState.currentHardWinStreak++;
          if (mState.level === 4 && mState.currentHardWinStreak >= 20) {
            mState.hasAchieved20HardStreakInStage5 = true;
          }
        }
      } else {
        // Reset hard streak on failure
        mState.currentHardWinStreak = 0;
      }

      // Check stage progression
      const nextStageLevel = mState.level + 1;
      const targetStageCfg = mConfig.stages[nextStageLevel];

      if (targetStageCfg) {
        let isStageTargetMet = false;

        if (nextStageLevel === 1) {
          isStageTargetMet = mState.stageSuccessfulCount >= targetStageCfg.targetSuccessfulCount;
        } else if (nextStageLevel === 2) {
          isStageTargetMet =
            mState.stageSuccessfulCount >= targetStageCfg.targetSuccessfulCount &&
            mState.stageMediumOrHigherCount >= targetStageCfg.targetMediumOrHigherCount;
        } else if (nextStageLevel === 3) {
          isStageTargetMet =
            mState.stageSuccessfulCount >= targetStageCfg.targetSuccessfulCount &&
            mState.stageHardCount >= targetStageCfg.targetHardCount;
        } else if (nextStageLevel === 4) {
          isStageTargetMet =
            mState.stageSuccessfulCount >= targetStageCfg.targetSuccessfulCount &&
            mState.stageHardCount >= targetStageCfg.targetHardCount;
        } else if (nextStageLevel === 5) {
          isStageTargetMet =
            mState.stageSuccessfulCount >= targetStageCfg.targetSuccessfulCount &&
            mState.stageHardCount >= targetStageCfg.targetHardCount &&
            (mState.currentHardWinStreak >= targetStageCfg.targetHardWinStreak || !!mState.hasAchieved20HardStreakInStage5);
        }

        if (isStageTargetMet) {
          mState.level = nextStageLevel;
          recordJournalMasteryReached(draft, gameId, nextStageLevel, Date.now());
          // RESET STAGE COUNTERS ON LEVEL UP!
          mState.stageSuccessfulCount = 0;
          mState.stageMediumOrHigherCount = 0;
          mState.stageHardCount = 0;
          mState.currentHardWinStreak = 0;
          mState.hasAchieved20HardStreakInStage5 = false;
        }
      }
    }
  }

  evaluateMedalUnlocks(draft);
}

export function recordCropHarvestForMedals(
  draft: GameState,
  hasFertilizer: boolean
): void {
  ensureMedalAndMasteryState(draft);
  const global = draft.globalStats!;

  global.totalCropHarvests = (global.totalCropHarvests || 0) + 1;
  global.totalCropHarvestsPlusEggSales = (global.totalCropHarvestsPlusEggSales || 0) + 1;

  if (hasFertilizer) {
    global.fertilizerCropHarvests = (global.fertilizerCropHarvests || 0) + 1;
  }

  evaluateMedalUnlocks(draft);
}

export function recordWatering(draft: GameState, count: number = 1): void {
  ensureMedalAndMasteryState(draft);
  draft.globalStats!.totalWateringCount = (draft.globalStats!.totalWateringCount || 0) + count;
  evaluateMedalUnlocks(draft);
}

export function recordFertilizerUsed(draft: GameState, fertilizerId: string): void {
  ensureMedalAndMasteryState(draft);
  draft.globalStats!.totalFertilizerUsedCount = (draft.globalStats!.totalFertilizerUsedCount || 0) + 1;
  const list = draft.globalStats!.fertilizerTypesUsed;
  if (!list.includes(fertilizerId)) {
    list.push(fertilizerId);
  }
  evaluateMedalUnlocks(draft);
}

export function recordFarmGoldEarned(draft: GameState, amount: number): void {
  ensureMedalAndMasteryState(draft);
  draft.globalStats!.farmGoldEarned = (draft.globalStats!.farmGoldEarned || 0) + amount;
  evaluateMedalUnlocks(draft);
}

export function recordEggSale(draft: GameState, eggCount: number = 1): void {
  ensureMedalAndMasteryState(draft);
  draft.globalStats!.totalEggsSold = (draft.globalStats!.totalEggsSold || 0) + eggCount;
  draft.globalStats!.totalCropHarvestsPlusEggSales = (draft.globalStats!.totalCropHarvestsPlusEggSales || 0) + eggCount;
  evaluateMedalUnlocks(draft);
}

/** Records only completed farm sale transactions that contained Perfect items. */
export function recordPerfectFarmItemSale(
  draft: GameState,
  perfectItemCount: number,
): void {
  ensureMedalAndMasteryState(draft);
  const soldCount = Number.isFinite(perfectItemCount)
    ? Math.max(0, Math.trunc(perfectItemCount))
    : 0;
  if (soldCount <= 0) return;
  draft.globalStats!.perfectFarmItemsSold =
    (draft.globalStats!.perfectFarmItemsSold || 0) + soldCount;
  evaluateMedalUnlocks(draft);
}

/** Records the exact number of feed bags consumed by a successful feed action. */
export function recordFeedBagsUsed(draft: GameState, quantity: number): void {
  ensureMedalAndMasteryState(draft);
  const consumed = Number.isFinite(quantity)
    ? Math.max(0, Math.trunc(quantity))
    : 0;
  if (consumed <= 0) return;
  draft.globalStats!.totalFeedBagsUsed =
    (draft.globalStats!.totalFeedBagsUsed || 0) + consumed;
  evaluateMedalUnlocks(draft);
}

export function recordPenCapacity(draft: GameState, capacity: number): void {
  ensureMedalAndMasteryState(draft);
  if (capacity > (draft.globalStats!.maxAnimalCapacityUnlocked || 0)) {
    draft.globalStats!.maxAnimalCapacityUnlocked = capacity;
  }
  evaluateMedalUnlocks(draft);
}
