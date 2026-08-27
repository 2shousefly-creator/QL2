import { TrainingGameId } from "../types";

export type MasteryStageConfig = {
  stage: number; // 1 to 5
  stageName: string; // "Mastery I — ..."
  title: string; // e.g. "Bắt Nhịp"
  targetSuccessfulCount: number;
  targetMediumOrHigherCount: number;
  targetHardCount: number;
  targetHardWinStreak: number;
  unlockedMedalId?: string;
};

export type MinigameMasteryConfig = {
  gameId: TrainingGameId;
  gameName: string;
  iconName: string; // for UI rendering
  stages: Record<number, MasteryStageConfig>;
};

export const MASTERY_CONFIGS: Record<TrainingGameId, MinigameMasteryConfig> = {
  march_rhythm: {
    gameId: "march_rhythm",
    gameName: "Nhịp Hành Quân",
    iconName: "Activity",
    stages: {
      1: {
        stage: 1,
        stageName: "Mastery I — Nhập Môn",
        title: "Bắt Nhịp",
        targetSuccessfulCount: 10,
        targetMediumOrHigherCount: 0,
        targetHardCount: 0,
        targetHardWinStreak: 0,
      },
      2: {
        stage: 2,
        stageName: "Mastery II — Thành Thạo",
        title: "Giữ Nhịp",
        targetSuccessfulCount: 50,
        targetMediumOrHigherCount: 25,
        targetHardCount: 0,
        targetHardWinStreak: 0,
      },
      3: {
        stage: 3,
        stageName: "Mastery III — Chuyên Gia",
        title: "Nhịp Chuẩn",
        targetSuccessfulCount: 150,
        targetMediumOrHigherCount: 0,
        targetHardCount: 50,
        targetHardWinStreak: 0,
      },
      4: {
        stage: 4,
        stageName: "Mastery IV — Tinh Nhuệ",
        title: "Nhịp Tốt",
        targetSuccessfulCount: 300,
        targetMediumOrHigherCount: 0,
        targetHardCount: 100,
        targetHardWinStreak: 0,
      },
      5: {
        stage: 5,
        stageName: "Mastery V — Tinh Thông",
        title: "Nhịp Hoàn Hảo",
        targetSuccessfulCount: 500,
        targetMediumOrHigherCount: 0,
        targetHardCount: 300,
        targetHardWinStreak: 20,
        unlockedMedalId: "nhanh_tay_le_mat",
      },
    },
  },
  signal_command: {
    gameId: "signal_command",
    gameName: "Mật Lệnh Tín Hiệu",
    iconName: "BrainCircuit",
    stages: {
      1: {
        stage: 1,
        stageName: "Mastery I — Nhập Môn",
        title: "Làm Quen Tín Hiệu",
        targetSuccessfulCount: 10,
        targetMediumOrHigherCount: 0,
        targetHardCount: 0,
        targetHardWinStreak: 0,
      },
      2: {
        stage: 2,
        stageName: "Mastery II — Thành Thạo",
        title: "Người Giải Mã",
        targetSuccessfulCount: 50,
        targetMediumOrHigherCount: 25,
        targetHardCount: 0,
        targetHardWinStreak: 0,
      },
      3: {
        stage: 3,
        stageName: "Mastery III — Chuyên Gia",
        title: "Tín Hiệu Viên",
        targetSuccessfulCount: 150,
        targetMediumOrHigherCount: 0,
        targetHardCount: 50,
        targetHardWinStreak: 0,
      },
      4: {
        stage: 4,
        stageName: "Mastery IV — Tinh Nhuệ",
        title: "Mật Ngữ Tinh Nhuệ",
        targetSuccessfulCount: 300,
        targetMediumOrHigherCount: 0,
        targetHardCount: 100,
        targetHardWinStreak: 0,
      },
      5: {
        stage: 5,
        stageName: "Mastery V — Tinh Thông",
        title: "Mật Ngữ Tinh Thông",
        targetSuccessfulCount: 500,
        targetMediumOrHigherCount: 0,
        targetHardCount: 300,
        targetHardWinStreak: 20,
        unlockedMedalId: "bac_thay_mat_ngu",
      },
    },
  },
  formation_assembly: {
    gameId: "formation_assembly",
    gameName: "Xếp Đội Hình",
    iconName: "Grid3X3",
    stages: {
      1: {
        stage: 1,
        stageName: "Mastery I — Nhập Môn",
        title: "Vào Hàng",
        targetSuccessfulCount: 10,
        targetMediumOrHigherCount: 0,
        targetHardCount: 0,
        targetHardWinStreak: 0,
      },
      2: {
        stage: 2,
        stageName: "Mastery II — Thành Thạo",
        title: "Giữ Hàng Ngũ",
        targetSuccessfulCount: 50,
        targetMediumOrHigherCount: 25,
        targetHardCount: 0,
        targetHardWinStreak: 0,
      },
      3: {
        stage: 3,
        stageName: "Mastery III — Chuyên Gia",
        title: "Đội Hình Chuẩn",
        targetSuccessfulCount: 150,
        targetMediumOrHigherCount: 0,
        targetHardCount: 50,
        targetHardWinStreak: 0,
      },
      4: {
        stage: 4,
        stageName: "Mastery IV — Tinh Nhuệ",
        title: "Điều Lệnh Tinh Nhuệ",
        targetSuccessfulCount: 300,
        targetMediumOrHigherCount: 0,
        targetHardCount: 100,
        targetHardWinStreak: 0,
      },
      5: {
        stage: 5,
        stageName: "Mastery V — Tinh Thông",
        title: "Chỉ Huy Đội Hình",
        targetSuccessfulCount: 500,
        targetMediumOrHigherCount: 0,
        targetHardCount: 300,
        targetHardWinStreak: 20,
        unlockedMedalId: "bac_thay_dieu_lenh",
      },
    },
  },
  radar_tracking: {
    gameId: "radar_tracking",
    gameName: "Mắt Thần Radar",
    iconName: "Eye",
    stages: {
      1: {
        stage: 1,
        stageName: "Mastery I — Nhập Môn",
        title: "Quan Sát Viên",
        targetSuccessfulCount: 10,
        targetMediumOrHigherCount: 0,
        targetHardCount: 0,
        targetHardWinStreak: 0,
      },
      2: {
        stage: 2,
        stageName: "Mastery II — Thành Thạo",
        title: "Theo Dấu",
        targetSuccessfulCount: 50,
        targetMediumOrHigherCount: 25,
        targetHardCount: 0,
        targetHardWinStreak: 0,
      },
      3: {
        stage: 3,
        stageName: "Mastery III — Chuyên Gia",
        title: "Trắc Thủ Radar",
        targetSuccessfulCount: 150,
        targetMediumOrHigherCount: 0,
        targetHardCount: 50,
        targetHardWinStreak: 0,
      },
      4: {
        stage: 4,
        stageName: "Mastery IV — Tinh Nhuệ",
        title: "Radar Tinh Nhuệ",
        targetSuccessfulCount: 300,
        targetMediumOrHigherCount: 0,
        targetHardCount: 100,
        targetHardWinStreak: 0,
      },
      5: {
        stage: 5,
        stageName: "Mastery V — Tinh Thông",
        title: "Mắt Thần",
        targetSuccessfulCount: 500,
        targetMediumOrHigherCount: 0,
        targetHardCount: 300,
        targetHardWinStreak: 20,
        unlockedMedalId: "mat_dieu_hau",
      },
    },
  },
  gomoku_infinite: {
    gameId: "gomoku_infinite",
    gameName: "Cờ Caro",
    iconName: "Swords",
    stages: {
      1: {
        stage: 1,
        stageName: "Mastery I — Nhập Môn",
        title: "Kỳ Thủ Tập Sự",
        targetSuccessfulCount: 10,
        targetMediumOrHigherCount: 0,
        targetHardCount: 0,
        targetHardWinStreak: 0,
      },
      2: {
        stage: 2,
        stageName: "Mastery II — Thành Thạo",
        title: "Kỳ Thủ",
        targetSuccessfulCount: 50,
        targetMediumOrHigherCount: 25,
        targetHardCount: 0,
        targetHardWinStreak: 0,
      },
      3: {
        stage: 3,
        stageName: "Mastery III — Chuyên Gia",
        title: "Cao Thủ",
        targetSuccessfulCount: 150,
        targetMediumOrHigherCount: 0,
        targetHardCount: 50,
        targetHardWinStreak: 0,
      },
      4: {
        stage: 4,
        stageName: "Mastery IV — Tinh Nhuệ",
        title: "Chiến Lược Gia",
        targetSuccessfulCount: 300,
        targetMediumOrHigherCount: 0,
        targetHardCount: 100,
        targetHardWinStreak: 0,
      },
      5: {
        stage: 5,
        stageName: "Mastery V — Tinh Thông",
        title: "Đại Kỳ Thủ",
        targetSuccessfulCount: 500,
        targetMediumOrHigherCount: 0,
        targetHardCount: 300,
        targetHardWinStreak: 20,
        unlockedMedalId: "bac_thay_caro",
      },
    },
  },
  shooting_range: {
    gameId: "shooting_range",
    gameName: "Bắn Súng",
    iconName: "Target",
    stages: {
      1: {
        stage: 1,
        stageName: "Mastery I — Nhập Môn",
        title: "Xạ Thủ Tập Sự",
        targetSuccessfulCount: 10,
        targetMediumOrHigherCount: 0,
        targetHardCount: 0,
        targetHardWinStreak: 0,
      },
      2: {
        stage: 2,
        stageName: "Mastery II — Thành Thạo",
        title: "Xạ Thủ",
        targetSuccessfulCount: 50,
        targetMediumOrHigherCount: 25,
        targetHardCount: 0,
        targetHardWinStreak: 0,
      },
      3: {
        stage: 3,
        stageName: "Mastery III — Chuyên Gia",
        title: "Xạ Thủ Kỳ Cựu",
        targetSuccessfulCount: 150,
        targetMediumOrHigherCount: 0,
        targetHardCount: 50,
        targetHardWinStreak: 0,
      },
      4: {
        stage: 4,
        stageName: "Mastery IV — Tinh Nhuệ",
        title: "Xạ Thủ Tinh Nhuệ",
        targetSuccessfulCount: 300,
        targetMediumOrHigherCount: 0,
        targetHardCount: 100,
        targetHardWinStreak: 0,
      },
      5: {
        stage: 5,
        stageName: "Mastery V — Tinh Thông",
        title: "Bách Phát Bách Trúng",
        targetSuccessfulCount: 500,
        targetMediumOrHigherCount: 0,
        targetHardCount: 300,
        targetHardWinStreak: 20,
        unlockedMedalId: "thien_xa",
      },
    },
  },
};

export function getMasteryTitleForMinigame(gameId: TrainingGameId, level: number): string {
  const cfg = MASTERY_CONFIGS[gameId];
  if (!cfg || level <= 0) return "Chưa đạt Mastery";
  const stageCfg = cfg.stages[level];
  if (!stageCfg) return "Chưa đạt Mastery";
  if (level === 5) return `Mastery V — ${stageCfg.title} (TỐI ĐA)`;
  return `${stageCfg.stageName.split(" — ")[0]} — ${stageCfg.title}`;
}
