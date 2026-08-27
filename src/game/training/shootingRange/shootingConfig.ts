import { TrainingDifficulty } from "../../types";
import { ShootingDifficultyConfig } from "./shootingTypes";

export const SHOOTING_DIFFICULTY_CONFIGS: Record<TrainingDifficulty, ShootingDifficultyConfig> = {
  easy: {
    id: "easy",
    label: "Dễ",
    durationMs: 60000,
    initialTargets: 3,
    maxTargetsSpawned: 10,
    targetSpeedMultiplier: 1.0,
    minScoreToWin: 65,
    minAccuracyToWin: 0.75,
    fireCooldownMs: 1000,
  },
  medium: {
    id: "medium",
    label: "Vừa",
    durationMs: 60000,
    initialTargets: 3,
    maxTargetsSpawned: 10,
    targetSpeedMultiplier: 1.35,
    minScoreToWin: 80,
    minAccuracyToWin: 0.90,
    fireCooldownMs: 1000,
  },
  hard: {
    id: "hard",
    label: "Khó",
    durationMs: 60000,
    initialTargets: 3,
    maxTargetsSpawned: 10,
    targetSpeedMultiplier: 1.65,
    minScoreToWin: 98,
    minAccuracyToWin: 1.0,
    fireCooldownMs: 1000,
  },
};
