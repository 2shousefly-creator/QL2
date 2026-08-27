import { TrainingDifficulty } from "../../types";

export type RadarRoundPhase =
  | "target_cue"
  | "neutral"
  | "tracking"
  | "selection"
  | "feedback"
  | "complete"
  | "failed";

export type RadarObject = {
  id: string;
  x: number; // normalized 0..1 relative to canvas center radius (circle or box)
  y: number; // normalized 0..1
  vx: number; // normalized speed per second
  vy: number;
  radius: number; // normalized radius (e.g. 0.03)
};

export type ScheduledDirectionChange = {
  objectId: string;
  triggerTimeMs: number; // relative to start of tracking
  angleDeltaRad: number;
  applied: boolean;
};

export type OcclusionZone = {
  x: number; // normalized center
  y: number;
  radius: number; // normalized radius e.g. 0.15
  pulseOffset: number;
};

export type RadarRoundConfig = {
  roundIndex: number;
  objectCount: number;
  targetCount: number;
  cueMs: number;
  trackingMs: number;
  speedMin: number;
  speedMax: number;
  directionChangesCount: number;
  maxDirectionDegrees: number;
  hasOcclusion: boolean;
};

export type EasyRadarConfig = {
  roundCount: 5;
  objectCounts: readonly [8, 8, 9, 9, 10];
  targetCounts: readonly [2, 2, 2, 2, 2];
  cueMs: readonly [2200, 2100, 2000, 1900, 1800];
  trackingMs: readonly [5500, 6000, 6500, 7000, 7500];
  speedMin: 0.12;
  speedMax: 0.18;
  directionChanges: false;
  occlusion: false;
  recoveryCharges: 2;
};

export type MediumRadarConfig = {
  roundCount: 6;
  objectCounts: readonly [10, 11, 11, 12, 12, 13];
  targetCounts: readonly [3, 3, 3, 3, 3, 3];
  cueMs: readonly [1900, 1800, 1700, 1600, 1500, 1500];
  trackingMs: readonly [7000, 7500, 8000, 8500, 9000, 9500];
  speedMin: 0.17;
  speedMax: 0.245;
  directionChangeCounts: readonly [0, 1, 1, 2, 2, 3];
  directionChangeMaxDegrees: 28;
  occlusion: false;
  recoveryCharges: 1;
};

export type HardRadarConfig = {
  roundCount: 7;
  objectCounts: readonly [13, 14, 14, 15, 16, 17, 18];
  targetCounts: readonly [4, 4, 4, 4, 5, 5, 5];
  cueMs: readonly [1800, 1700, 1600, 1500, 1500, 1400, 1400];
  trackingMs: readonly [8500, 9000, 9500, 10000, 10500, 11000, 12000];
  speedMin: 0.205;
  speedMax: 0.30;
  directionChangeCounts: readonly [1, 2, 2, 3, 3, 4, 4];
  directionChangeMaxDegrees: 38;
  occlusion: true;
  occlusionStartRoundIndex: 3;
  maxOcclusionZones: 2;
  maxSingleOcclusionMs: 700;
  recoveryCharges: 0;
};

export const EASY_RADAR_CONFIG: EasyRadarConfig = {
  roundCount: 5,
  objectCounts: [8, 8, 9, 9, 10],
  targetCounts: [2, 2, 2, 2, 2],
  cueMs: [2200, 2100, 2000, 1900, 1800],
  trackingMs: [5500, 6000, 6500, 7000, 7500],
  speedMin: 0.12,
  speedMax: 0.18,
  directionChanges: false,
  occlusion: false,
  recoveryCharges: 2,
};

export const MEDIUM_RADAR_CONFIG: MediumRadarConfig = {
  roundCount: 6,
  objectCounts: [10, 11, 11, 12, 12, 13],
  targetCounts: [3, 3, 3, 3, 3, 3],
  cueMs: [1900, 1800, 1700, 1600, 1500, 1500],
  trackingMs: [7000, 7500, 8000, 8500, 9000, 9500],
  speedMin: 0.17,
  speedMax: 0.245,
  directionChangeCounts: [0, 1, 1, 2, 2, 3],
  directionChangeMaxDegrees: 28,
  occlusion: false,
  recoveryCharges: 1,
};

export const HARD_RADAR_CONFIG: HardRadarConfig = {
  roundCount: 7,
  objectCounts: [13, 14, 14, 15, 16, 17, 18],
  targetCounts: [4, 4, 4, 4, 5, 5, 5],
  cueMs: [1800, 1700, 1600, 1500, 1500, 1400, 1400],
  trackingMs: [8500, 9000, 9500, 10000, 10500, 11000, 12000],
  speedMin: 0.205,
  speedMax: 0.30,
  directionChangeCounts: [1, 2, 2, 3, 3, 4, 4],
  directionChangeMaxDegrees: 38,
  occlusion: true,
  occlusionStartRoundIndex: 3,
  maxOcclusionZones: 2,
  maxSingleOcclusionMs: 700,
  recoveryCharges: 0,
};

export type RadarRunState = {
  id: string;
  difficulty: TrainingDifficulty;
  currentRoundIndex: number; // 0..roundCount-1
  totalRounds: number;
  recoveryChargesLeft: number;
  initialRecoveryCharges: number;
  trialSeed: number;
  trialCountForRound: number; // resets or increments on recovery use
  completedRounds: number;
  correctSelectionsTotal: number;
  possibleTargetsTotal: number;
  startTimeMs: number;
};

export type RadarRunResult = {
  runId: string;
  difficulty: TrainingDifficulty;
  victory: boolean;
  score: number;
  accuracy: number; // 0..100
  completedRounds: number;
  totalRounds: number;
  recoveriesUsed: number;
  elapsedRealMs: number;
  perfectWin: boolean;
};
