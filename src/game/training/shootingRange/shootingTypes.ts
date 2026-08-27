import { TrainingDifficulty } from "../../types";

export type ShootingTarget = {
  id: string;
  x: number; // 5 to 95 (%)
  y: number; // 15 to 70 (%)
  depth: number; // 0.2 (far/small) to 1.0 (near/large)
  radiusPx: number; // base size scaled by depth
  velocityX: number; // percentage per sec
  velocityY: number; // percentage per sec
  isBreaking?: boolean;
  breakProgress?: number; // 0..1
  hitPointsRing?: number; // 1..10
  hitPointOffset?: { x: number; y: number };
  hitTimeMs?: number;
};

export type ShootingRunState = {
  id: string;
  difficulty: TrainingDifficulty;
  status: "ready" | "playing" | "won" | "lost" | "interrupted";
  startedAtPerfMs: number | null;
  score: number;
  shotsFired: number;
  hits: number;
  targetsSpawned: number;
  targetsDestroyed: number;
  lastShotPerfMs: number | null;
  targets: ShootingTarget[];
};

export type ShootingRunResult = {
  score: number;
  accuracy: number; // 0 to 1
  hits: number;
  shotsFired: number;
  targetsDestroyed: number;
  targetsSpawned: number;
  elapsedRealMs: number;
  victory: boolean;
  perfectWin: boolean;
};

export type ShootingDifficultyConfig = {
  id: TrainingDifficulty;
  label: string;
  durationMs: number;
  initialTargets: number;
  maxTargetsSpawned: number;
  targetSpeedMultiplier: number;
  minScoreToWin: number;
  minAccuracyToWin: number; // 0.0 to 1.0
  fireCooldownMs: number;
};
