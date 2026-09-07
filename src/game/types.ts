import type { FarmSaveState } from "../features/tang_gia/farmTypes";
import type { ChienTuyenProfileV2 } from "../features/entertainment/chien_tuyen/types";

export type TierCount = 1 | 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20;

export type RankCategory =
  | "academy"
  | "enlisted"
  | "nco"
  | "junior_officer"
  | "field_officer"
  | "general"
  | "endgame";

export type BadgeShape =
  | "square"
  | "roundedSquare"
  | "pentagon"
  | "hexagon"
  | "heptagon"
  | "octagon"
  | "nonagon"
  | "burst5"
  | "burst6"
  | "burst7"
  | "burst8"
  | "burst9"
  | "burst10"
  | "burst11"
  | "burst12"
  | "medal8"
  | "medal10";

export type BadgeSymbol = "smile" | "horizontalBars" | "chevrons" | "stars";
export type StarLayout = "center" | "horizontal2" | "triangle3" | "grid4";

export type BadgeDefinition = {
  id: string;
  shape: BadgeShape;
  symbol: BadgeSymbol;
  symbolCount: 1 | 2 | 3 | 4;
  starLayout?: StarLayout;
  basePalette: string;
  framePalette: string;
  symbolPalette: string;
  innerLayer?: "none" | "burst5" | "pentagon5" | "star5" | "decagon10";
  glossLevel: 1 | 2 | 3;
  embossDepth: 1 | 2 | 3;
};

export type RankFamily = {
  id: string;
  name: string;
  tierCount: TierCount;
  showTierNumber: boolean;
  category: RankCategory;
  badge: BadgeDefinition;
};

export type RankStep = {
  id: string;
  rankIndex: number;
  ordinal: number;
  familyId: string;
  familyName: string;
  tier: number | null;
  tierCount: TierCount;
  displayName: string;
  shortName: string;
  storyId: string;
};

export type PromotionTransitionStory = {
  fromFamilyId: string;
  toFamilyId: string;
  title: string;
  paragraphs: string[];
};

export type RankStepStory = {
  id: string;
  rankIndex: number;
  title: string;
  subtitle?: string;
  paragraphs: string[];
};

export type PromotionHistoryEntry = {
  id: string;
  rankIndex: number;
  rankName: string;
  familyId: string;
  tier: number | null;
  achievedAt: number | null;
  source: "onboarding" | "promotion" | "legacy_reconstructed";
  promotionKind: "onboarding" | "minor" | "major";
  badgeCatalogVersionAtAchievement: number;
  storyCatalogVersionAtAchievement: number;
  challenge: null | {
    configuredDurationMs: number;
    elapsedRealMs: number | null;
    bubbleHitCount: number | null;
    bubbleReductionMs: number | null;
    correctCount?: number;
    totalQuestions?: number;
    retries?: number;
    passed?: boolean;
    metadata?: Record<string, unknown>;
  };
};

export type EarningMode = "direct_online" | "delegation";

export type EarningActivityBucket = {
  dayKeyUtc: string; // YYYY-MM-DD
  directOnlineMs: number;
  delegationMs: number;
};

export type JourneyChapterId =
  | "beginning"
  | "soldier"
  | "nco"
  | "company_officer"
  | "field_officer"
  | "general"
  | "supreme_command"
  | "supreme_sovereign";

export type JourneyStageThemeId =
  | "training_dawn"
  | "simple_barracks"
  | "organized_assembly"
  | "map_room"
  | "command_room"
  | "ceremonial_abstract"
  | "supreme_obsidian"
  | "supreme_sovereign";

export type JourneyChapterDefinition = {
  id: JourneyChapterId;
  title: string;
  shortTitle: string;
  startRankIndex: number;
  endRankIndex: number;
  familyIds: string[];
  themeId: JourneyStageThemeId;
};

export type TabType =
  | "home"
  | "journey"
  | "training"
  | "entertainment"
  | "ranks"
  | "profile"
  | "tang_gia"
  | "medals"
  | "mastery"
  | "idCard"
  | "journal"
  | "uniform";

export type TrainingGameId =
  | "march_rhythm"
  | "signal_command"
  | "formation_assembly"
  | "gomoku_infinite"
  | "radar_tracking"
  | "shooting_range";

export type ShootingRangeDifficultyStats = {
  runsStarted: number;
  runsFinished: number;
  wins: number;
  failures: number;
  interruptions: number;
  bestScore: number;
  bestAccuracy: number;
  targetsDestroyed: number;
  fastestWinningRunMs: number | null;
  perfectWins: number;
  lastPlayedAt: number | null;
  lastWonAt: number | null;
};

export type ShootingRangeStats = {
  easy: ShootingRangeDifficultyStats;
  medium: ShootingRangeDifficultyStats;
  hard: ShootingRangeDifficultyStats;
  lastRecordedRunId: string | null;
};

export type ChessOutcome =
  | "player_win"
  | "ai_win"
  | "draw"
  | "resigned"
  | "interrupted";

export type ChessDifficultyStats = {
  matchesStarted: number;
  matchesFinished: number;
  wins: number;
  losses: number;
  draws: number;
  resignations: number;
  interruptions: number;
  winsAsWhite: number;
  winsAsBlack: number;
  winsGoingFirst: number;
  winsGoingSecond: number;
  shortestWinMoveCount: number | null;
  longestMatchMoveCount: number;
  fastestWinMs: number | null;
  totalPlayerMoves: number;
  totalAiMoves: number;
  lastPlayedAt: number | null;
  lastWonAt: number | null;
};

export type ChessStats = {
  easy: ChessDifficultyStats;
  medium: ChessDifficultyStats;
  hard: ChessDifficultyStats;
  lastRecordedRunId: string | null;
};

export type HistoricalTrainingRewardSourceId =
  | TrainingGameId
  | "chess"
  | "supply_route"
  | "legacy_removed_equipment_inspection";

export type TrainingDifficulty = "easy" | "medium" | "hard";

export type GomokuMark = "X" | "O";
export type GomokuSide = "player" | "ai";

export type GomokuDifficultyStats = {
  matchesStarted: number;
  matchesFinished: number;
  wins: number;
  losses: number;
  resignations: number;
  interruptions: number;
  winsAsX: number;
  winsAsO: number;
  winsGoingFirst: number;
  winsGoingSecond: number;
  lossesGoingFirst: number;
  lossesGoingSecond: number;
  shortestWinMoveCount: number | null;
  longestMatchMoveCount: number;
  fastestWinMs: number | null;
  totalPlayerMoves: number;
  totalAiMoves: number;
  lastPlayedAt: number | null;
  lastWonAt: number | null;
};

export type GomokuStats = {
  easy: GomokuDifficultyStats;
  medium: GomokuDifficultyStats;
  hard: GomokuDifficultyStats;
  lastRecordedRunId: string | null;
};

export type DailyTrainingRewardState = {
  lastClaimDateKey: string | null;
  lastClaimedAt: number | null;
  lastClaimedGameId: HistoricalTrainingRewardSourceId | null;
  lastClaimedDifficulty: TrainingDifficulty | null;
  lastNominalRewardXp: 10 | 30 | 50 | 0;
  lastCreditedRewardXpTicks: number;
  claimRunId: string | null;
  lastObservedEpochMs: number;
  lastObservedTrainingDateKey: string | null;
};

export type MarchRhythmDifficultyStats = {
  plays: number;
  wins: number;
  bestScore: number;
  bestAccuracy: number;
  bestHitRate: number;
  bestCombo: number;
  lastPlayedAt: number | null;
  lastWonAt: number | null;
};

export type MarchRhythmStats = {
  easy: MarchRhythmDifficultyStats;
  medium: MarchRhythmDifficultyStats;
  hard: MarchRhythmDifficultyStats;
};

export type SignalCommandDifficultyStats = {
  runsStarted: number;
  runsFinished: number;
  wins: number;
  failures: number;
  interruptions: number;
  bestScore: number;
  bestAccuracy: number;
  longestSequenceCompleted: number;
  mostRoundsCompleted: number;
  perfectWins: number;
  fastestWinningRunMs: number | null;
  lastPlayedAt: number | null;
  lastWonAt: number | null;
};

export type SignalCommandStats = {
  easy: SignalCommandDifficultyStats;
  medium: SignalCommandDifficultyStats;
  hard: SignalCommandDifficultyStats;
  lastRecordedRunId: string | null;
};

export type FormationDifficultyStats = {
  runsStarted: number;
  runsFinished: number;
  wins: number;
  failures: number;
  interruptions: number;
  bestScore: number;
  mostRoundsCompleted: number;
  fastestWinningRunMs: number | null;
  perfectWins: number;
  fewestActionsInWin: number | null;
  lastPlayedAt: number | null;
  lastWonAt: number | null;
};

export type FormationAssemblyStats = {
  easy: FormationDifficultyStats;
  medium: FormationDifficultyStats;
  hard: FormationDifficultyStats;
  lastRecordedRunId: string | null;
};

export type SupplyRouteDifficultyStats = {
  runsStarted: number;
  runsFinished: number;
  wins: number;
  failures: number;
  interruptions: number;
  bestScore: number;
  mostRoundsCompleted: number;
  fastestWinningRunMs: number | null;
  perfectWins: number;
  fewestRotationsInWin: number | null;
  bestRotationEfficiency: number;
  mostDepotsConnectedInRound: number;
  lastPlayedAt: number | null;
  lastWonAt: number | null;
};

export type SupplyRouteStats = {
  easy: SupplyRouteDifficultyStats;
  medium: SupplyRouteDifficultyStats;
  hard: SupplyRouteDifficultyStats;
  lastRecordedRunId: string | null;
};

export type RadarTrackingDifficultyStats = {
  runsStarted: number;
  runsFinished: number;
  wins: number;
  failures: number;
  interruptions: number;
  bestScore: number;
  bestAccuracy: number;
  mostRoundsCompleted: number;
  fastestWinningRunMs: number | null;
  perfectWins: number;
  lastPlayedAt: number | null;
  lastWonAt: number | null;
};

export type RadarTrackingStats = {
  easy: RadarTrackingDifficultyStats;
  medium: RadarTrackingDifficultyStats;
  hard: RadarTrackingDifficultyStats;
  lastRecordedRunId: string | null;
};

export type TrainingState = {
  trainingTimingOffsetMs: number;
  dailyReward: DailyTrainingRewardState;
  marchRhythm: MarchRhythmStats;
  signalCommand: SignalCommandStats;
  formationAssembly: FormationAssemblyStats;
  supplyRoute: SupplyRouteStats;
  gomoku: GomokuStats;
  radarTracking: RadarTrackingStats;
  shootingRange?: ShootingRangeStats;
  chess?: ChessStats;
  equipmentInspection?: never;
};

export type MedalState = {
  unlockedMedalIds: string[];
  unlockedAtMap: Record<string, number>;
  selectedMedalIds: string[]; // max 6
};

export type MinigameMasteryState = {
  level: number; // 0 to 5
  stageSuccessfulCount: number;
  stageMediumOrHigherCount: number;
  stageHardCount: number;
  currentHardWinStreak: number;
  hasAchieved20HardStreakInStage5?: boolean;
};

export type MasteryState = Record<TrainingGameId, MinigameMasteryState>;

export type GlobalStatsState = {
  lifetimeXp: number;
  totalTrainingSuccesses: number;
  successfulMinigames: string[];
  hardCompletedMinigames: string[];
  totalCropHarvests: number;
  maxAnimalCapacityUnlocked: number;
  fullyWateredCropHarvests: number;
  perfectCropHarvests: number;
  waterAll9PlotsCount: number;
  fertilizerTypesUsed: string[];
  farmGoldEarned: number;
  totalCropHarvestsPlusEggSales: number;
  hasCompletedHardTrainingFirstTime: boolean;
  fertilizerCropHarvests?: number;
  totalWateringCount?: number;
  totalFertilizerUsedCount?: number;
  totalEggsSold?: number;
  perfectFarmItemsSold?: number;
  totalFeedBagsUsed?: number;
  minigameWinStreaks?: Record<string, Record<TrainingDifficulty, number>>;
  bestMinigameWinStreaks?: Record<string, Record<TrainingDifficulty, number>>;
};

export type JournalCategory = "rank" | "medal" | "mastery" | "farm" | "training";

export type JournalEvent = {
  id: string;
  key: string;
  type: "promotion" | "medal_unlocked" | "mastery_reached" | "training_milestone" | "farm_milestone";
  category: JournalCategory;
  title: string;
  description: string;
  iconSymbol?: string;
  occurredAt?: number | null;
  dateUnknown?: boolean;
  relatedId?: string;
  metadata?: Record<string, any>;
};

export type JournalState = {
  events: JournalEvent[];
};

export type EnergyState = {
  percent: number;
  lastUpdatedAt: number;
  lastResetDate: string;
};

export type CouponState = {
  redeemedCodes: string[];
  redeemedAt?: Record<string, number>;
};

export type GameState = {
  schemaVersion: number;
  catalogVersion: number;
  player: {
    id: string;
    displayName: string;
    avatarSeed: string;
    createdAt: number;
  };
  energy?: EnergyState;
  progression: {
    rankLayoutVersion?: number;
    currentRankIndex: number;
    xpIntoCurrentRankTicks: number;
    totalXpEarnedTicks: number;
    lastPromotionAt: number | null;
    promotionHistory: PromotionHistoryEntry[];
    rankRetries?: Record<number, number>;
  };
  time: {
    lastSettledAt: number;
    lastOpenedAt: number;
    currentEarningMode: EarningMode;
    directOnlineTimeMs: number;
    delegationTimeMs: number;
    recentEarningActivity: EarningActivityBucket[];
  };
  training: TrainingState;
  medals?: MedalState;
  mastery?: Partial<MasteryState>;
  globalStats?: GlobalStatsState;
  journal?: JournalState;
  connection: {
    lastVerifiedOnlineAt: number | null;
  };
  ui: {
    onboardingCompleted: boolean;
    lastSeenDelegationReportAt: string | number | null;
    interruptedPromotionChallenge?: {
      reason: string;
      interruptedAt: number;
    } | null;
    pendingPromotionCeremony?: {
      promotedRankIndex: number;
      promotedAt: number;
      promotionKind: "minor" | "major";
    } | null;
    pendingMedalUnlockPopup?: string | null;
  };
  settings: {
    soundEnabled: boolean;
    reducedMotion: boolean;
    compactNumbers: boolean;
    notificationsEnabled: boolean;
  };
  farm?: FarmSaveState;
  chienTuyen?: ChienTuyenProfileV2;
  coupons?: CouponState;
};

export type ChallengeBubble = {
  id: string;
  spawnedAtPerformanceMs: number;
  expiresAtPerformanceMs: number;
  xPercent: number;
  yPercent: number;
  sizePx: number;
  status: "active" | "popped_by_player" | "expired";
};

export type PromotionChallengeSession = {
  id: string;
  startedAtPerformanceMs: number;
  durationMs: number;
  bonusReductionMs: number;
  bubbleHitCount: number;
  lastSuccessfulHeartbeatPerformanceMs: number;
  nextBubbleWaveAtPerformanceMs: number;
  bubbles: ChallengeBubble[];
  resetReason: string | null;
};

export type NewlyUnlockedMedalInfo = {
  id: string;
  name: string;
  description: string;
  iconSymbol: string;
};

export type DelegationReportData = {
  id: string;
  elapsedMs: number;
  earnedXp: number;
  previousXp: number;
  newXp: number;
  requiredXp: number;
  isFullNow: boolean;
  wasFullBefore: boolean;
  currentRankName: string;

  readyCropCount: number;
  pendingWateringCount: number;
  growingCropCount: number;
  eggInventoryTotal: number;
  feedEmpty: boolean;

  newlyUnlockedMedals: NewlyUnlockedMedalInfo[];

  topPriority: "xp_full" | "watering" | "harvest" | "animal_egg" | "medals" | "continue";
};

