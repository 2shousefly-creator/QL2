import { TrainingDifficulty } from "../../types";
import {
  FormationShapeId,
  FormationTransformProtocol,
} from "./formationTypes";

export type ShapeDefinition = {
  id: FormationShapeId;
  name: string;
  orientable: boolean;
  colorClass: string;
  bgClass: string;
  borderClass: string;
};

export const FORMATION_SHAPES: Record<FormationShapeId, ShapeDefinition> = {
  circle: {
    id: "circle",
    name: "Hình Tròn",
    orientable: false,
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/20",
    borderClass: "border-emerald-500/40",
  },
  triangle: {
    id: "triangle",
    name: "Tam Giác Hướng",
    orientable: true,
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/20",
    borderClass: "border-amber-500/40",
  },
  square: {
    id: "square",
    name: "Hình Vuông",
    orientable: false,
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/20",
    borderClass: "border-blue-500/40",
  },
  diamond: {
    id: "diamond",
    name: "Hình Thoi",
    orientable: false,
    colorClass: "text-purple-400",
    bgClass: "bg-purple-500/20",
    borderClass: "border-purple-500/40",
  },
  hexagon: {
    id: "hexagon",
    name: "Hình Lục Giác",
    orientable: false,
    colorClass: "text-cyan-400",
    bgClass: "bg-cyan-500/20",
    borderClass: "border-cyan-500/40",
  },
  chevron: {
    id: "chevron",
    name: "Mũi Tên Chevron",
    orientable: true,
    colorClass: "text-rose-400",
    bgClass: "bg-rose-500/20",
    borderClass: "border-rose-500/40",
  },
  hollow_circle: {
    id: "hollow_circle",
    name: "Vòng Tròn Rỗng",
    orientable: false,
    colorClass: "text-teal-400",
    bgClass: "bg-teal-500/20",
    borderClass: "border-teal-500/40",
  },
  rounded_plus: {
    id: "rounded_plus",
    name: "Dấu Cộng Bo Góc",
    orientable: false,
    colorClass: "text-indigo-400",
    bgClass: "bg-indigo-500/20",
    borderClass: "border-indigo-500/40",
  },
  star: {
    id: "star",
    name: "Tia Tám Hướng",
    orientable: true,
    colorClass: "text-amber-300",
    bgClass: "bg-amber-400/20",
    borderClass: "border-amber-400/40",
  },
};

export type FormationDifficultyConfig = {
  difficulty: TrainingDifficulty;
  label: string;
  gridRows: number;
  gridColumns: number;
  roundCount: number;
  pieceCounts: number[];
  shapePoolSize: number;
  orientationEnabled: boolean;
  orientedPieceRatioByRound?: number[];
  lockedCellCounts: number[];
  decoyPieceCounts: number[];
  previewMsByRound: number[];
  assembleMsByRound: number[];
  recoveryCharges: number;
  shuffleMode: "tray" | "mixed" | "board_scramble";
  transformProtocols?: FormationTransformProtocol[];
  allowSwap: boolean;
  rewardXp: 10 | 30 | 50;
  description: string;
};

export const EASY_FORMATION_CONFIG: FormationDifficultyConfig = {
  difficulty: "easy",
  label: "Dễ",
  gridRows: 3,
  gridColumns: 3,
  roundCount: 5,
  pieceCounts: [3, 4, 5, 6, 6],
  shapePoolSize: 4,
  orientationEnabled: false,
  lockedCellCounts: [0, 0, 0, 0, 0],
  decoyPieceCounts: [0, 0, 0, 0, 0],
  previewMsByRound: [6000, 5500, 5000, 4500, 4000],
  assembleMsByRound: [30000, 30000, 28000, 28000, 26000],
  recoveryCharges: 2,
  shuffleMode: "tray",
  allowSwap: true,
  rewardXp: 10,
  description: "Lưới 3×3 · 5 Vòng · Không hướng/ô khóa · 2 lượt sửa. Thưởng 10 XP.",
};

export const MEDIUM_FORMATION_CONFIG: FormationDifficultyConfig = {
  difficulty: "medium",
  label: "Vừa",
  gridRows: 4,
  gridColumns: 4,
  roundCount: 6,
  pieceCounts: [6, 7, 8, 9, 10, 10],
  shapePoolSize: 6,
  orientationEnabled: true,
  orientedPieceRatioByRound: [0.25, 0.35, 0.4, 0.5, 0.6, 0.7],
  lockedCellCounts: [0, 1, 1, 2, 2, 3],
  decoyPieceCounts: [0, 0, 1, 1, 2, 2],
  previewMsByRound: [5500, 5000, 4500, 4200, 3800, 3500],
  assembleMsByRound: [35000, 35000, 33000, 32000, 30000, 28000],
  recoveryCharges: 1,
  shuffleMode: "mixed",
  allowSwap: true,
  rewardXp: 30,
  description: "Lưới 4×4 · 6 Vòng · Có hướng quân, ô khóa & quân mồi · 1 lượt sửa. Thưởng 30 XP.",
};

export const HARD_FORMATION_CONFIG: FormationDifficultyConfig = {
  difficulty: "hard",
  label: "Khó",
  gridRows: 5,
  gridColumns: 5,
  roundCount: 7,
  pieceCounts: [10, 12, 13, 14, 15, 16, 17],
  shapePoolSize: 9,
  orientationEnabled: true,
  orientedPieceRatioByRound: [0.5, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85],
  lockedCellCounts: [2, 3, 3, 4, 4, 5, 5],
  decoyPieceCounts: [1, 2, 2, 3, 3, 4, 4],
  previewMsByRound: [5000, 4500, 4000, 3600, 3300, 3000, 2800],
  assembleMsByRound: [40000, 38000, 36000, 34000, 32000, 30000, 28000],
  recoveryCharges: 0,
  shuffleMode: "board_scramble",
  transformProtocols: [
    "identity",
    "identity",
    "rotate90",
    "identity",
    "mirrorHorizontal",
    "rotate180",
    "mirrorVertical",
  ],
  allowSwap: true,
  rewardXp: 50,
  description: "Lưới 5×5 · 7 Vòng · Biến đổi mật lệnh (Xoay/Đối xứng), mồi & ô khóa dày · Không sửa. Thưởng 50 XP.",
};

export const FORMATION_CONFIGS: Record<TrainingDifficulty, FormationDifficultyConfig> = {
  easy: EASY_FORMATION_CONFIG,
  medium: MEDIUM_FORMATION_CONFIG,
  hard: HARD_FORMATION_CONFIG,
};
