import { gameConfig } from "../game/config";
import { GameState } from "../game/types";
import { createOnboardingHistoryEntry } from "../game/promotionEngine";
import { createDefaultTrainingState } from "../game/training/trainingDefaults";
import { createDefaultFarmState } from "../features/tang_gia/farmMigration";
import { createDefaultChienTuyenProfile } from "../features/entertainment/chien_tuyen/profileEngine";
import { getLocalDateString } from "../game/energyEngine";

export interface GameRepository {
  load(): Promise<GameState | null>;
  save(state: GameState): Promise<void>;
  export(): Promise<string>;
  import(raw: string): Promise<GameState>;
  clear(): Promise<void>;
}

export function createInitialGameState(displayName: string = "Chiến sĩ"): GameState {
  const now = Date.now();
  return {
    schemaVersion: gameConfig.schemaVersion,
    catalogVersion: gameConfig.catalogVersion,
    player: {
      id: "player_" + Math.random().toString(36).substring(2, 9),
      displayName,
      avatarSeed: "avatar_1",
      createdAt: now,
    },
    energy: {
      percent: 100,
      lastUpdatedAt: now,
      lastResetDate: getLocalDateString(now),
    },
    progression: {
      currentRankIndex: 0, // Starts at Học Viên
      xpIntoCurrentRankTicks: 0, // Starts at 0 XP
      totalXpEarnedTicks: 0,
      lastPromotionAt: null,
      promotionHistory: [createOnboardingHistoryEntry(now)],
      rankRetries: {},
    },
    time: {
      lastSettledAt: now,
      lastOpenedAt: now,
      currentEarningMode: "direct_online",
      directOnlineTimeMs: 0,
      delegationTimeMs: 0,
      recentEarningActivity: [],
    },
    training: createDefaultTrainingState(now),
    connection: {
      lastVerifiedOnlineAt: now,
    },
    ui: {
      onboardingCompleted: false,
      lastSeenDelegationReportAt: null,
      interruptedPromotionChallenge: null,
      pendingPromotionCeremony: null,
    },
    settings: {
      soundEnabled: true,
      reducedMotion: false,
      compactNumbers: false,
      notificationsEnabled: true,
    },
    farm: createDefaultFarmState(now),
    chienTuyen: createDefaultChienTuyenProfile(now),
    coupons: { redeemedCodes: [], redeemedAt: {} },
  };
}
