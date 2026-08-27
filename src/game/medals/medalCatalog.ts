import { GameState, TrainingGameId } from "../types";
import { gameConfig } from "../config";
import { getPlayerRank } from "../selectors";
import { getAnimalCapacity } from "../../features/tang_gia/farmEngine";
import { RANK_STEPS } from "../rankBuilder";
import { getRequiredXpTicksForTransition, getTotalXpTicksToReachRank } from "../xpEngine";

export type MedalCategory = "journey" | "training" | "farm";
export type MedalTier = 1 | 2 | 3 | 4;

export function getLifetimeXpTicks(state: GameState): number {
  const currentRank = getPlayerRank(state);
  let baseTicks = 0;
  if (currentRank && typeof currentRank.rankIndex === "number") {
    baseTicks = getTotalXpTicksToReachRank(currentRank.rankIndex);
  }
  const inRankTicks = state.progression?.xpIntoCurrentRankTicks || 0;
  const recordedTotal = state.progression?.totalXpEarnedTicks || 0;
  return Math.max(recordedTotal, baseTicks + inRankTicks);
}

export function getLifetimeXp(state: GameState): number {
  const ticks = getLifetimeXpTicks(state);
  return Math.floor(ticks / gameConfig.xpTicksPerXp);
}

export function hasReachedLifetimeXp(state: GameState, requiredLifetimeXp: number): boolean {
  const ticks = getLifetimeXpTicks(state);
  return ticks >= requiredLifetimeXp * gameConfig.xpTicksPerXp;
}

export function getUniqueSuccessfulMinigames(state: GameState): string[] {
  const set = new Set<string>();
  const global = state.globalStats;
  if (global?.successfulMinigames) {
    global.successfulMinigames.forEach((id) => set.add(id));
  }
  if (global?.hardCompletedMinigames) {
    global.hardCompletedMinigames.forEach((id) => set.add(id));
  }
  if (global?.minigameWinStreaks) {
    for (const id in global.minigameWinStreaks) {
      const s = global.minigameWinStreaks[id];
      if (s && (s.easy > 0 || s.medium > 0 || s.hard > 0)) {
        set.add(id);
      }
    }
  }
  if (global?.bestMinigameWinStreaks) {
    for (const id in global.bestMinigameWinStreaks) {
      const s = global.bestMinigameWinStreaks[id];
      if (s && (s.easy > 0 || s.medium > 0 || s.hard > 0)) {
        set.add(id);
      }
    }
  }
  if (state.mastery) {
    for (const id in state.mastery) {
      const m = state.mastery[id as TrainingGameId];
      if (m && (m.level > 0 || m.stageSuccessfulCount > 0 || m.stageMediumOrHigherCount > 0 || m.stageHardCount > 0)) {
        set.add(id);
      }
    }
  }
  return Array.from(set);
}

export function getUniqueHardCompletedMinigames(state: GameState): string[] {
  const set = new Set<string>();
  const global = state.globalStats;
  if (global?.hardCompletedMinigames) {
    global.hardCompletedMinigames.forEach((id) => set.add(id));
  }
  if (global?.minigameWinStreaks) {
    for (const id in global.minigameWinStreaks) {
      const s = global.minigameWinStreaks[id];
      if (s && s.hard > 0) {
        set.add(id);
      }
    }
  }
  if (global?.bestMinigameWinStreaks) {
    for (const id in global.bestMinigameWinStreaks) {
      const s = global.bestMinigameWinStreaks[id];
      if (s && s.hard > 0) {
        set.add(id);
      }
    }
  }
  if (state.mastery) {
    for (const id in state.mastery) {
      const m = state.mastery[id as TrainingGameId];
      if (m && (m.level >= 2 || m.hasAchieved20HardStreakInStage5 || m.stageHardCount > 0 || m.currentHardWinStreak > 0)) {
        set.add(id);
      }
    }
  }
  return Array.from(set);
}

export type MedalDefinition = {
  id: string;
  category: MedalCategory;
  categoryName: string;
  name: string;
  iconSymbol: string; // Emoji / Icon badge
  description: string;
  conditionHint: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
  targetValue: number;
  tier: MedalTier;
  getProgress: (state: GameState) => { current: number; target: number; isUnlocked: boolean };
};

export type MedalTierStyle = {
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
  ribbonBg: string;
  ribbonBorder: string;
  ribbonText: string;
  tierName: string;
};

export const MEDAL_TIER_STYLES: Record<MedalTier, MedalTierStyle> = {
  1: {
    bgGradient: "from-emerald-950/40 via-emerald-900/10 to-slate-900",
    borderColor: "border-emerald-500/40",
    glowColor: "rgba(16, 185, 129, 0.35)",
    textColor: "text-emerald-300",
    ribbonBg: "bg-emerald-700",
    ribbonBorder: "border-emerald-500/40",
    ribbonText: "text-white",
    tierName: "Bậc 1 - Xanh lá",
  },
  2: {
    bgGradient: "from-sky-950/40 via-sky-900/10 to-slate-900",
    borderColor: "border-sky-500/40",
    glowColor: "rgba(14, 165, 233, 0.35)",
    textColor: "text-sky-300",
    ribbonBg: "bg-sky-700",
    ribbonBorder: "border-sky-500/40",
    ribbonText: "text-white",
    tierName: "Bậc 2 - Xanh lam",
  },
  3: {
    bgGradient: "from-purple-950/40 via-purple-900/10 to-slate-900",
    borderColor: "border-purple-500/40",
    glowColor: "rgba(168, 85, 247, 0.35)",
    textColor: "text-purple-300",
    ribbonBg: "bg-purple-700",
    ribbonBorder: "border-purple-500/40",
    ribbonText: "text-white",
    tierName: "Bậc 3 - Tím",
  },
  4: {
    bgGradient: "from-amber-950/40 via-amber-900/10 to-slate-900",
    borderColor: "border-amber-500/40",
    glowColor: "rgba(245, 158, 11, 0.35)",
    textColor: "text-amber-300",
    ribbonBg: "bg-amber-700",
    ribbonBorder: "border-amber-500/40",
    ribbonText: "text-white",
    tierName: "Bậc 4 - Cam",
  },
};

export const MEDAL_CATALOG: MedalDefinition[] = [
  // --- A. HÀNH TRÌNH & ỦY THÁC ---
  {
    id: "ben_bi",
    category: "journey",
    categoryName: "Hành Trình & Ủy Thác",
    name: "Bền Bỉ",
    iconSymbol: "🎖️",
    description: "Đã tích lũy đạt 5.000 XP trong hành trình binh nghiệp",
    conditionHint: "Tích lũy tổng cộng 5.000 XP",
    bgGradient: MEDAL_TIER_STYLES[1].bgGradient,
    borderColor: MEDAL_TIER_STYLES[1].borderColor,
    glowColor: MEDAL_TIER_STYLES[1].glowColor,
    textColor: MEDAL_TIER_STYLES[1].textColor,
    targetValue: 5000,
    tier: 1,
    getProgress: (state) => {
      const current = getLifetimeXp(state);
      const target = 5000;
      return { current, target, isUnlocked: hasReachedLifetimeXp(state, target) };
    },
  },
  {
    id: "duong_dai_khong_nghi",
    category: "journey",
    categoryName: "Hành Trình & Ủy Thác",
    name: "Đường Dài Không Nghỉ",
    iconSymbol: "🎖️",
    description: "Tích lũy đạt 500.000 XP - Một chặng đường dài vượt mỏi mệt",
    conditionHint: "Tích lũy tổng cộng 500.000 XP",
    bgGradient: MEDAL_TIER_STYLES[2].bgGradient,
    borderColor: MEDAL_TIER_STYLES[2].borderColor,
    glowColor: MEDAL_TIER_STYLES[2].glowColor,
    textColor: MEDAL_TIER_STYLES[2].textColor,
    targetValue: 500000,
    tier: 2,
    getProgress: (state) => {
      const current = getLifetimeXp(state);
      const target = 500000;
      return { current, target, isUnlocked: hasReachedLifetimeXp(state, target) };
    },
  },
  {
    id: "van_gio_kien_tri",
    category: "journey",
    categoryName: "Hành Trình & Ủy Thác",
    name: "Vạn Giờ Kiên Trì",
    iconSymbol: "🎖️",
    description: "Tích lũy đạt 1.000.000 XP - Ý chí sắt đá không thể lay chuyển",
    conditionHint: "Tích lũy tổng cộng 1.000.000 XP",
    bgGradient: MEDAL_TIER_STYLES[3].bgGradient,
    borderColor: MEDAL_TIER_STYLES[3].borderColor,
    glowColor: MEDAL_TIER_STYLES[3].glowColor,
    textColor: MEDAL_TIER_STYLES[3].textColor,
    targetValue: 1000000,
    tier: 3,
    getProgress: (state) => {
      const current = getLifetimeXp(state);
      const target = 1000000;
      return { current, target, isUnlocked: hasReachedLifetimeXp(state, target) };
    },
  },
  {
    id: "lao_lang",
    category: "journey",
    categoryName: "Hành Trình & Ủy Thác",
    name: "Lão Làng",
    iconSymbol: "🎖️",
    description: "Tích lũy đạt 2.000.000 XP - Biểu tượng kỳ cựu của quân ngũ",
    conditionHint: "Tích lũy tổng cộng 2.000.000 XP",
    bgGradient: MEDAL_TIER_STYLES[4].bgGradient,
    borderColor: MEDAL_TIER_STYLES[4].borderColor,
    glowColor: MEDAL_TIER_STYLES[4].glowColor,
    textColor: MEDAL_TIER_STYLES[4].textColor,
    targetValue: 2000000,
    tier: 4,
    getProgress: (state) => {
      const current = getLifetimeXp(state);
      const target = 2000000;
      return { current, target, isUnlocked: hasReachedLifetimeXp(state, target) };
    },
  },

  // --- B. HUẤN LUYỆN ---
  {
    id: "lan_dau_xuat_sac",
    category: "training",
    categoryName: "Huấn Luyện",
    name: "Lần Đầu Xuất Sắc",
    iconSymbol: "🎖️",
    description: "Hoàn thành xuất sắc một bài huấn luyện ở độ khó Khó lần đầu tiên",
    conditionHint: "Chiến thắng 1 minigame ở mức Khó",
    bgGradient: MEDAL_TIER_STYLES[2].bgGradient,
    borderColor: MEDAL_TIER_STYLES[2].borderColor,
    glowColor: MEDAL_TIER_STYLES[2].glowColor,
    textColor: MEDAL_TIER_STYLES[2].textColor,
    targetValue: 1,
    tier: 2,
    getProgress: (state) => {
      const hardList = getUniqueHardCompletedMinigames(state);
      const hasCompleted = !!(state.globalStats?.hasCompletedHardTrainingFirstTime || hardList.length > 0);
      return { current: hasCompleted ? 1 : 0, target: 1, isUnlocked: hasCompleted };
    },
  },
  {
    id: "toan_khoa_huan_luyen",
    category: "training",
    categoryName: "Huấn Luyện",
    name: "Toàn Khoa Huấn Luyện",
    iconSymbol: "🎖️",
    description: "Chiến thắng ít nhất 1 lần ở tất cả 6 môn huấn luyện",
    conditionHint: "Hoàn thành thành công 6/6 minigame",
    bgGradient: MEDAL_TIER_STYLES[1].bgGradient,
    borderColor: MEDAL_TIER_STYLES[1].borderColor,
    glowColor: MEDAL_TIER_STYLES[1].glowColor,
    textColor: MEDAL_TIER_STYLES[1].textColor,
    targetValue: 6,
    tier: 1,
    getProgress: (state) => {
      const current = getUniqueSuccessfulMinigames(state).length;
      return { current: Math.min(current, 6), target: 6, isUnlocked: current >= 6 };
    },
  },
  {
    id: "luc_mon_tinh_thong",
    category: "training",
    categoryName: "Huấn Luyện",
    name: "Lục Môn Tinh Thông",
    iconSymbol: "🎖️",
    description: "Chiến thắng ở độ khó Khó trong cả 6 môn huấn luyện",
    conditionHint: "Thắng mức Khó ở cả 6 minigame",
    bgGradient: MEDAL_TIER_STYLES[4].bgGradient,
    borderColor: MEDAL_TIER_STYLES[4].borderColor,
    glowColor: MEDAL_TIER_STYLES[4].glowColor,
    textColor: MEDAL_TIER_STYLES[4].textColor,
    targetValue: 6,
    tier: 4,
    getProgress: (state) => {
      const current = getUniqueHardCompletedMinigames(state).length;
      return { current: Math.min(current, 6), target: 6, isUnlocked: current >= 6 };
    },
  },
  {
    id: "kho_luyen_thanh_tai",
    category: "training",
    categoryName: "Huấn Luyện",
    name: "Khổ Luyện Thành Tài",
    iconSymbol: "🎖️",
    description: "Tích lũy 1.000 lượt huấn luyện thành công trên thao trường",
    conditionHint: "Đạt 1.000 lượt thắng huấn luyện",
    bgGradient: MEDAL_TIER_STYLES[3].bgGradient,
    borderColor: MEDAL_TIER_STYLES[3].borderColor,
    glowColor: MEDAL_TIER_STYLES[3].glowColor,
    textColor: MEDAL_TIER_STYLES[3].textColor,
    targetValue: 1000,
    tier: 3,
    getProgress: (state) => {
      const current = state.globalStats?.totalTrainingSuccesses || 0;
      return { current, target: 1000, isUnlocked: current >= 1000 };
    },
  },
  {
    id: "thich_nghi_hoan_hao",
    category: "training",
    categoryName: "Huấn Luyện",
    name: "Thích Nghi Hoàn Hảo",
    iconSymbol: "🎖️",
    description: "Đạt chuỗi thắng 20 lần ở độ khó Vừa trong cùng một minigame",
    conditionHint: "Đạt chuỗi thắng 20 lần ở độ khó Vừa trong 1 minigame",
    bgGradient: MEDAL_TIER_STYLES[3].bgGradient,
    borderColor: MEDAL_TIER_STYLES[3].borderColor,
    glowColor: MEDAL_TIER_STYLES[3].glowColor,
    textColor: MEDAL_TIER_STYLES[3].textColor,
    targetValue: 20,
    tier: 3,
    getProgress: (state) => {
      const streaks = state.globalStats?.minigameWinStreaks || {};
      const bestStreaks = state.globalStats?.bestMinigameWinStreaks || {};
      let maxStreak = 0;
      for (const gameId in streaks) {
        if (streaks[gameId] && typeof streaks[gameId].medium === "number") {
          maxStreak = Math.max(maxStreak, streaks[gameId].medium);
        }
      }
      for (const gameId in bestStreaks) {
        if (bestStreaks[gameId] && typeof bestStreaks[gameId].medium === "number") {
          maxStreak = Math.max(maxStreak, bestStreaks[gameId].medium);
        }
      }
      return { current: maxStreak, target: 20, isUnlocked: maxStreak >= 20 };
    },
  },
  {
    id: "khong_the_ngan_can",
    category: "training",
    categoryName: "Huấn Luyện",
    name: "Không Thể Ngăn Cản",
    iconSymbol: "🎖️",
    description: "Đạt chuỗi thắng 20 lần ở độ khó Khó trong cùng một minigame",
    conditionHint: "Đạt chuỗi thắng 20 lần ở độ khó Khó trong 1 minigame",
    bgGradient: MEDAL_TIER_STYLES[4].bgGradient,
    borderColor: MEDAL_TIER_STYLES[4].borderColor,
    glowColor: MEDAL_TIER_STYLES[4].glowColor,
    textColor: MEDAL_TIER_STYLES[4].textColor,
    targetValue: 20,
    tier: 4,
    getProgress: (state) => {
      const streaks = state.globalStats?.minigameWinStreaks || {};
      const bestStreaks = state.globalStats?.bestMinigameWinStreaks || {};
      let maxStreak = 0;
      for (const gameId in streaks) {
        if (streaks[gameId] && typeof streaks[gameId].hard === "number") {
          maxStreak = Math.max(maxStreak, streaks[gameId].hard);
        }
      }
      for (const gameId in bestStreaks) {
        if (bestStreaks[gameId] && typeof bestStreaks[gameId].hard === "number") {
          maxStreak = Math.max(maxStreak, bestStreaks[gameId].hard);
        }
      }
      if (state.mastery) {
        for (const gId in state.mastery) {
          const mState = state.mastery[gId as TrainingGameId];
          if (mState) {
            if (mState.currentHardWinStreak) {
              maxStreak = Math.max(maxStreak, mState.currentHardWinStreak);
            }
            if (mState.hasAchieved20HardStreakInStage5) {
              maxStreak = Math.max(maxStreak, 20);
            }
          }
        }
      }
      return { current: maxStreak, target: 20, isUnlocked: maxStreak >= 20 };
    },
  },
  {
    id: "thien_xa",
    category: "training",
    categoryName: "Huấn Luyện",
    name: "Thiện Xạ",
    iconSymbol: "🎖️",
    description: "Đạt cấp Mastery tối đa (Mastery V — Bách Phát Bách Trúng) môn Bắn Súng",
    conditionHint: "Đạt Mastery V ở minigame Bắn Súng",
    bgGradient: MEDAL_TIER_STYLES[4].bgGradient,
    borderColor: MEDAL_TIER_STYLES[4].borderColor,
    glowColor: MEDAL_TIER_STYLES[4].glowColor,
    textColor: MEDAL_TIER_STYLES[4].textColor,
    targetValue: 5,
    tier: 4,
    getProgress: (state) => {
      const lvl = state.mastery?.shooting_range?.level || 0;
      return { current: lvl, target: 5, isUnlocked: lvl >= 5 };
    },
  },
  {
    id: "bac_thay_caro",
    category: "training",
    categoryName: "Huấn Luyện",
    name: "Bậc Thầy Caro",
    iconSymbol: "🎖️",
    description: "Đạt cấp Mastery tối đa (Mastery V — Đại Kỳ Thủ) môn Cờ Caro",
    conditionHint: "Đạt Mastery V ở minigame Cờ Caro",
    bgGradient: MEDAL_TIER_STYLES[4].bgGradient,
    borderColor: MEDAL_TIER_STYLES[4].borderColor,
    glowColor: MEDAL_TIER_STYLES[4].glowColor,
    textColor: MEDAL_TIER_STYLES[4].textColor,
    targetValue: 5,
    tier: 4,
    getProgress: (state) => {
      const lvl = state.mastery?.gomoku_infinite?.level || 0;
      return { current: lvl, target: 5, isUnlocked: lvl >= 5 };
    },
  },
  {
    id: "mat_dieu_hau",
    category: "training",
    categoryName: "Huấn Luyện",
    name: "Mắt Diều Hâu",
    iconSymbol: "🎖️",
    description: "Đạt cấp Mastery tối đa (Mastery V — Mắt Thần) môn Mắt Thần Radar",
    conditionHint: "Đạt Mastery V ở minigame Mắt Thần Radar",
    bgGradient: MEDAL_TIER_STYLES[4].bgGradient,
    borderColor: MEDAL_TIER_STYLES[4].borderColor,
    glowColor: MEDAL_TIER_STYLES[4].glowColor,
    textColor: MEDAL_TIER_STYLES[4].textColor,
    targetValue: 5,
    tier: 4,
    getProgress: (state) => {
      const lvl = state.mastery?.radar_tracking?.level || 0;
      return { current: lvl, target: 5, isUnlocked: lvl >= 5 };
    },
  },
  {
    id: "bac_thay_dieu_lenh",
    category: "training",
    categoryName: "Huấn Luyện",
    name: "Bậc Thầy Điều Lệnh",
    iconSymbol: "🎖️",
    description: "Đạt cấp Mastery tối đa (Mastery V — Chỉ Huy Đội Hình) môn Xếp Đội Hình",
    conditionHint: "Đạt Mastery V ở minigame Xếp Đội Hình",
    bgGradient: MEDAL_TIER_STYLES[4].bgGradient,
    borderColor: MEDAL_TIER_STYLES[4].borderColor,
    glowColor: MEDAL_TIER_STYLES[4].glowColor,
    textColor: MEDAL_TIER_STYLES[4].textColor,
    targetValue: 5,
    tier: 4,
    getProgress: (state) => {
      const lvl = state.mastery?.formation_assembly?.level || 0;
      return { current: lvl, target: 5, isUnlocked: lvl >= 5 };
    },
  },
  {
    id: "bac_thay_mat_ngu",
    category: "training",
    categoryName: "Huấn Luyện",
    name: "Bậc Thầy Mật Ngữ",
    iconSymbol: "🎖️",
    description: "Đạt cấp Mastery tối đa (Mastery V — Mật Ngữ Tinh Thông) môn Mật Lệnh Tín Hiệu",
    conditionHint: "Đạt Mastery V ở minigame Mật Lệnh Tín Hiệu",
    bgGradient: MEDAL_TIER_STYLES[4].bgGradient,
    borderColor: MEDAL_TIER_STYLES[4].borderColor,
    glowColor: MEDAL_TIER_STYLES[4].glowColor,
    textColor: MEDAL_TIER_STYLES[4].textColor,
    targetValue: 5,
    tier: 4,
    getProgress: (state) => {
      const lvl = state.mastery?.signal_command?.level || 0;
      return { current: lvl, target: 5, isUnlocked: lvl >= 5 };
    },
  },
  {
    id: "nhanh_tay_le_mat",
    category: "training",
    categoryName: "Huấn Luyện",
    name: "Nhanh Tay Lẹ Mắt",
    iconSymbol: "🎖️",
    description: "Đạt cấp Mastery tối đa (Mastery V — Nhịp Hoàn Hảo) môn Nhịp Hành Quân",
    conditionHint: "Đạt Mastery V ở minigame Nhịp Hành Quân",
    bgGradient: MEDAL_TIER_STYLES[4].bgGradient,
    borderColor: MEDAL_TIER_STYLES[4].borderColor,
    glowColor: MEDAL_TIER_STYLES[4].glowColor,
    textColor: MEDAL_TIER_STYLES[4].textColor,
    targetValue: 5,
    tier: 4,
    getProgress: (state) => {
      const lvl = state.mastery?.march_rhythm?.level || 0;
      return { current: lvl, target: 5, isUnlocked: lvl >= 5 };
    },
  },

  // --- C. TĂNG GIA ---
  {
    id: "duoc_mua",
    category: "farm",
    categoryName: "Tăng Gia",
    name: "Được Mùa",
    iconSymbol: "🎖️",
    description: "Tích lũy thu hoạch 250 lần nông sản trong khu tăng gia",
    conditionHint: "Thu hoạch tổng cộng 250 cây trồng",
    bgGradient: MEDAL_TIER_STYLES[1].bgGradient,
    borderColor: MEDAL_TIER_STYLES[1].borderColor,
    glowColor: MEDAL_TIER_STYLES[1].glowColor,
    textColor: MEDAL_TIER_STYLES[1].textColor,
    targetValue: 250,
    tier: 1,
    getProgress: (state) => {
      const totalCrop = Math.max(
        state.globalStats?.totalCropHarvests || 0,
        state.globalStats?.fullyWateredCropHarvests || 0,
        state.globalStats?.perfectCropHarvests || 0,
        state.globalStats?.fertilizerCropHarvests || 0
      );
      return { current: Math.min(totalCrop, 250), target: 250, isUnlocked: totalCrop >= 250 };
    },
  },
  {
    id: "chuong_trai_du_day",
    category: "farm",
    categoryName: "Tăng Gia",
    name: "Chuồng Trại Đủ Đầy",
    iconSymbol: "🎖️",
    description: "Mở khóa 5 sức chứa tối đa của chuồng nuôi",
    conditionHint: "Mở khóa 5 sức chứa tối đa của chuồng nuôi",
    bgGradient: MEDAL_TIER_STYLES[3].bgGradient,
    borderColor: MEDAL_TIER_STYLES[3].borderColor,
    glowColor: MEDAL_TIER_STYLES[3].glowColor,
    textColor: MEDAL_TIER_STYLES[3].textColor,
    targetValue: 5,
    tier: 3,
    getProgress: (state) => {
      const currentRank = getPlayerRank(state);
      const cap = getAnimalCapacity(currentRank);
      const recordedMax = state.globalStats?.maxAnimalCapacityUnlocked || 0;
      const current = Math.max(cap, recordedMax);
      const target = 5;
      return { current, target, isUnlocked: current >= target };
    },
  },
  {
    id: "ban_tay_cham_soc",
    category: "farm",
    categoryName: "Tăng Gia",
    name: "Bàn Tay Chăm Sóc",
    iconSymbol: "🎖️",
    description: "Thu hoạch 1 nông sản đã được tưới nước đầy đủ cả 3 đợt trong chu kỳ",
    conditionHint: "Thu hoạch cây trồng tưới đủ 3 lần đợt tưới",
    bgGradient: MEDAL_TIER_STYLES[1].bgGradient,
    borderColor: MEDAL_TIER_STYLES[1].borderColor,
    glowColor: MEDAL_TIER_STYLES[1].glowColor,
    textColor: MEDAL_TIER_STYLES[1].textColor,
    targetValue: 1,
    tier: 1,
    getProgress: (state) => {
      const current = Math.max(
        state.globalStats?.fullyWateredCropHarvests || 0,
        state.globalStats?.perfectCropHarvests || 0
      );
      return { current, target: 1, isUnlocked: current >= 1 };
    },
  },
  {
    id: "vu_mua_hoan_hao",
    category: "farm",
    categoryName: "Tăng Gia",
    name: "Vụ Mùa Hoàn Hảo",
    iconSymbol: "🎖️",
    description: "Thu hoạch 1 nông sản đạt đủ 3 đợt tưới nước VÀ bón phân hoàn hảo",
    conditionHint: "Thu hoạch cây trồng tưới 3 đợt + có phân bón",
    bgGradient: MEDAL_TIER_STYLES[1].bgGradient,
    borderColor: MEDAL_TIER_STYLES[1].borderColor,
    glowColor: MEDAL_TIER_STYLES[1].glowColor,
    textColor: MEDAL_TIER_STYLES[1].textColor,
    targetValue: 1,
    tier: 1,
    getProgress: (state) => {
      let current = state.globalStats?.perfectCropHarvests || 0;
      if (current === 0 && state.farm?.plots) {
        const hasReadyPerfect = state.farm.plots.some(
          (p) =>
            p.status === "ready" &&
            (p.wateringCount !== undefined ? p.wateringCount : (p.wateredBoostApplied ? 1 : 0)) >= 3 &&
            (!!p.fertilizerId || (p.fertilizerXpBonusPct || 0) > 0)
        );
        if (hasReadyPerfect) current = 1;
      }
      return { current: Math.min(current, 1), target: 1, isUnlocked: current >= 1 };
    },
  },
  {
    id: "mua_tren_ca_khu_vuon",
    category: "farm",
    categoryName: "Tăng Gia",
    name: "Mưa Cả Khu Vườn",
    iconSymbol: "🎖️",
    description: "Thực hiện hành động 'Tưới tất cả' tưới cùng lúc cho cả 9 ô đất",
    conditionHint: "Tưới nước cho 9 ô đất trong 1 lượt",
    bgGradient: MEDAL_TIER_STYLES[3].bgGradient,
    borderColor: MEDAL_TIER_STYLES[3].borderColor,
    glowColor: MEDAL_TIER_STYLES[3].glowColor,
    textColor: MEDAL_TIER_STYLES[3].textColor,
    targetValue: 1,
    tier: 3,
    getProgress: (state) => {
      const current = state.globalStats?.waterAll9PlotsCount || 0;
      return { current, target: 1, isUnlocked: current >= 1 };
    },
  },
  {
    id: "bac_thay_canh_tac",
    category: "farm",
    categoryName: "Tăng Gia",
    name: "Bậc Thầy Canh Tác",
    iconSymbol: "🎖️",
    description: "Tích lũy thu hoạch 1.000 vụ mùa cây trồng trong khu tăng gia",
    conditionHint: "Thu hoạch tổng cộng 1.000 cây trồng",
    bgGradient: MEDAL_TIER_STYLES[3].bgGradient,
    borderColor: MEDAL_TIER_STYLES[3].borderColor,
    glowColor: MEDAL_TIER_STYLES[3].glowColor,
    textColor: MEDAL_TIER_STYLES[3].textColor,
    targetValue: 1000,
    tier: 3,
    getProgress: (state) => {
      const totalCrop = Math.max(
        state.globalStats?.totalCropHarvests || 0,
        state.globalStats?.fullyWateredCropHarvests || 0,
        state.globalStats?.perfectCropHarvests || 0,
        state.globalStats?.fertilizerCropHarvests || 0
      );
      return { current: Math.min(totalCrop, 1000), target: 1000, isUnlocked: totalCrop >= 1000 };
    },
  },
  {
    id: "tu_cung_tu_cap",
    category: "farm",
    categoryName: "Tăng Gia",
    name: "Tự Cung Tự Cấp",
    iconSymbol: "🎖️",
    description: "Tích lũy kiếm được 30.000 Vàng từ các hoạt động Tăng Gia sản xuất",
    conditionHint: "Thu về 30.000 Vàng từ nông trại",
    bgGradient: MEDAL_TIER_STYLES[3].bgGradient,
    borderColor: MEDAL_TIER_STYLES[3].borderColor,
    glowColor: MEDAL_TIER_STYLES[3].glowColor,
    textColor: MEDAL_TIER_STYLES[3].textColor,
    targetValue: 30000,
    tier: 3,
    getProgress: (state) => {
      const current = state.globalStats?.farmGoldEarned || 0;
      return { current, target: 30000, isUnlocked: current >= 30000 };
    },
  },
  {
    id: "kho_luong_sung_tuc",
    category: "farm",
    categoryName: "Tăng Gia",
    name: "Kho Lương Sung Túc",
    iconSymbol: "🎖️",
    description: "Đạt tổng số 3.000 lần thu hoạch cây trồng và bán trứng gia cầm",
    conditionHint: "Tổng 3.000 lần thu hoạch nông sản + bán trứng",
    bgGradient: MEDAL_TIER_STYLES[3].bgGradient,
    borderColor: MEDAL_TIER_STYLES[3].borderColor,
    glowColor: MEDAL_TIER_STYLES[3].glowColor,
    textColor: MEDAL_TIER_STYLES[3].textColor,
    targetValue: 3000,
    tier: 3,
    getProgress: (state) => {
      const totalCrop = Math.max(
        state.globalStats?.totalCropHarvests || 0,
        state.globalStats?.fullyWateredCropHarvests || 0,
        state.globalStats?.perfectCropHarvests || 0,
        state.globalStats?.fertilizerCropHarvests || 0
      );
      const eggsSold = state.globalStats?.totalEggsSold || 0;
      const current = Math.max(
        state.globalStats?.totalCropHarvestsPlusEggSales || 0,
        totalCrop + eggsSold
      );
      return { current: Math.min(current, 3000), target: 3000, isUnlocked: current >= 3000 };
    },
  },
  {
    id: "nuoc_noi_du_day",
    category: "farm",
    categoryName: "Tăng Gia",
    name: "Nước Nôi Đủ Đầy",
    iconSymbol: "🎖️",
    description: "Tích lũy tưới nước cho cây trồng tổng cộng 2.000 lần",
    conditionHint: "Tưới nước cho cây tổng cộng 2.000 lần",
    bgGradient: MEDAL_TIER_STYLES[3].bgGradient,
    borderColor: MEDAL_TIER_STYLES[3].borderColor,
    glowColor: MEDAL_TIER_STYLES[3].glowColor,
    textColor: MEDAL_TIER_STYLES[3].textColor,
    targetValue: 2000,
    tier: 3,
    getProgress: (state) => {
      const fullyWatered = state.globalStats?.fullyWateredCropHarvests || 0;
      const waterAll9 = state.globalStats?.waterAll9PlotsCount || 0;
      const recordedWatering = state.globalStats?.totalWateringCount || 0;
      const current = Math.max(recordedWatering, fullyWatered * 3 + waterAll9 * 9);
      return { current, target: 2000, isUnlocked: current >= 2000 };
    },
  },
  {
    id: "dat_mau_mo",
    category: "farm",
    categoryName: "Tăng Gia",
    name: "Đất Màu Mỡ",
    iconSymbol: "🎖️",
    description: "Tích lũy sử dụng phân bón cho cây trồng tổng cộng 2.000 lần",
    conditionHint: "Sử dụng phân bón cho cây tổng cộng 2.000 lần",
    bgGradient: MEDAL_TIER_STYLES[3].bgGradient,
    borderColor: MEDAL_TIER_STYLES[3].borderColor,
    glowColor: MEDAL_TIER_STYLES[3].glowColor,
    textColor: MEDAL_TIER_STYLES[3].textColor,
    targetValue: 2000,
    tier: 3,
    getProgress: (state) => {
      const perfect = state.globalStats?.perfectCropHarvests || 0;
      const fertHarvests = state.globalStats?.fertilizerCropHarvests || 0;
      const fertTypes = (state.globalStats?.fertilizerTypesUsed || []).length;
      const recordedFert = state.globalStats?.totalFertilizerUsedCount || 0;
      const current = Math.max(recordedFert, fertHarvests, perfect, fertTypes);
      return { current: Math.min(current, 2000), target: 2000, isUnlocked: current >= 2000 };
    },
  },
  {
    id: "ga_de_trung_vang",
    category: "farm",
    categoryName: "Tăng Gia",
    name: "Gà Đẻ Trứng Vàng",
    iconSymbol: "🎖️",
    description: "Tích lũy bán tổng cộng 2.000 quả trứng",
    conditionHint: "Bán tổng cộng 2.000 quả trứng",
    bgGradient: MEDAL_TIER_STYLES[3].bgGradient,
    borderColor: MEDAL_TIER_STYLES[3].borderColor,
    glowColor: MEDAL_TIER_STYLES[3].glowColor,
    textColor: MEDAL_TIER_STYLES[3].textColor,
    targetValue: 2000,
    tier: 3,
    getProgress: (state) => {
      const current = state.globalStats?.totalEggsSold || 0;
      return { current: Math.min(current, 2000), target: 2000, isUnlocked: current >= 2000 };
    },
  },
  {
    id: "may_man_doi_doi",
    category: "farm",
    categoryName: "Tăng Gia",
    name: "May Mắn Đổi Đời",
    iconSymbol: "🎖️",
    description: "Bán thành công ít nhất 1 cây trồng hoặc quả trứng phẩm chất Hoàn Mỹ",
    conditionHint: "Bán 1 nông sản phẩm chất Hoàn Mỹ",
    bgGradient: MEDAL_TIER_STYLES[4].bgGradient,
    borderColor: MEDAL_TIER_STYLES[4].borderColor,
    glowColor: MEDAL_TIER_STYLES[4].glowColor,
    textColor: MEDAL_TIER_STYLES[4].textColor,
    targetValue: 1,
    tier: 4,
    getProgress: (state) => {
      const current = state.globalStats?.perfectFarmItemsSold || 0;
      return { current: Math.min(current, 1), target: 1, isUnlocked: current >= 1 };
    },
  },
  {
    id: "an_no_ngu_ky",
    category: "farm",
    categoryName: "Tăng Gia",
    name: "Ăn No Ngủ Kỹ",
    iconSymbol: "🎖️",
    description: "Đã nạp và tiêu thụ tổng cộng 2.000 bao thức ăn cho vật nuôi",
    conditionHint: "Cho vật nuôi ăn tổng cộng 2.000 bao thức ăn",
    bgGradient: MEDAL_TIER_STYLES[3].bgGradient,
    borderColor: MEDAL_TIER_STYLES[3].borderColor,
    glowColor: MEDAL_TIER_STYLES[3].glowColor,
    textColor: MEDAL_TIER_STYLES[3].textColor,
    targetValue: 2000,
    tier: 3,
    getProgress: (state) => {
      const current = state.globalStats?.totalFeedBagsUsed || 0;
      return { current: Math.min(current, 2000), target: 2000, isUnlocked: current >= 2000 };
    },
  },
];

export function getMedalById(id: string): MedalDefinition | undefined {
  return MEDAL_CATALOG.find((m) => m.id === id);
}
