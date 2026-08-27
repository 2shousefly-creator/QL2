import { TrainingDifficulty } from "../types";

export type TrainingDifficultyConfig = {
  id: TrainingDifficulty;
  label: string;
  rewardXp: 10 | 30 | 50;
  laneCount: 2 | 3 | 4;
  bpmSegments: number[];
  noteCountRange: [number, number];
  activeDurationRangeMs: [number, number];
  spawnTravelMs: number;
  perfectWindowMs: number;
  goodWindowMs: number;
  minimumNoteGapMs: number;
  holdNoteRatioRange: [number, number];
  chordRatioRange: [number, number];
  winConditions: {
    minAccuracy: number; // Percentage 0-100
    minHitRate: number;  // Percentage 0-100
    maxMiss: number;
    minHoldCompletion?: number;  // Percentage 0-100
    minChordCompletion?: number; // Percentage 0-100
  };
  keyboardKeys: string[];
  keyboardLabels: string[];
  description: string;
  confirmWarning: string;
};

export const TRAINING_DIFFICULTIES: Record<TrainingDifficulty, TrainingDifficultyConfig> = {
  easy: {
    id: "easy",
    label: "Dễ",
    rewardXp: 10,
    laneCount: 2,
    bpmSegments: [82],
    noteCountRange: [22, 28],
    activeDurationRangeMs: [30000, 42000],
    spawnTravelMs: 1800,
    perfectWindowMs: 150,
    goodWindowMs: 280,
    minimumNoteGapMs: 500,
    holdNoteRatioRange: [0, 0],
    chordRatioRange: [0, 0],
    winConditions: {
      minAccuracy: 70,
      minHitRate: 75,
      maxMiss: 6,
    },
    keyboardKeys: ["KeyD", "KeyK"],
    keyboardLabels: ["D / ←", "K / →"],
    description: "2 làn · Nốt đơn · Tốc độ thong thả. Phù hợp để làm quen.",
    confirmWarning: "Chiến thắng sẽ khóa phần thưởng hôm nay ở mức 10 XP.",
  },
  medium: {
    id: "medium",
    label: "Vừa",
    rewardXp: 30,
    laneCount: 3,
    bpmSegments: [104, 112, 118],
    noteCountRange: [45, 55],
    activeDurationRangeMs: [45000, 60000],
    spawnTravelMs: 1100,
    perfectWindowMs: 90,
    goodWindowMs: 160,
    minimumNoteGapMs: 280,
    holdNoteRatioRange: [0, 0],
    chordRatioRange: [0, 0],
    winConditions: {
      minAccuracy: 80,
      minHitRate: 82,
      maxMiss: 7,
    },
    keyboardKeys: ["KeyD", "Space", "KeyK"],
    keyboardLabels: ["D / ←", "Space / ↓", "K / →"],
    description: "3 làn · Nốt đơn · Tốc độ rơi nhanh & nhịp dồn. Thử thách phản xạ.",
    confirmWarning: "Chiến thắng sẽ khóa phần thưởng hôm nay ở mức 30 XP.",
  },
  hard: {
    id: "hard",
    label: "Khó",
    rewardXp: 50,
    laneCount: 4,
    bpmSegments: [132, 144, 156],
    noteCountRange: [75, 90],
    activeDurationRangeMs: [60000, 80000],
    spawnTravelMs: 750,
    perfectWindowMs: 60,
    goodWindowMs: 105,
    minimumNoteGapMs: 160,
    holdNoteRatioRange: [0, 0],
    chordRatioRange: [0, 0],
    winConditions: {
      minAccuracy: 88,
      minHitRate: 90,
      maxMiss: 5,
    },
    keyboardKeys: ["KeyD", "KeyF", "KeyJ", "KeyK"],
    keyboardLabels: ["D", "F", "J", "K"],
    description: "4 làn · Nốt đơn · Tốc độ rơi rất nhanh & mật độ dồn dập. Đỉnh cao kỹ năng.",
    confirmWarning: "Chiến thắng sẽ khóa phần thưởng hôm nay ở mức 50 XP.",
  },
};
