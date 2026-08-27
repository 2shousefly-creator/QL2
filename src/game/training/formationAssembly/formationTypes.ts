import { TrainingDifficulty } from "../../types";

export type FormationTransformProtocol =
  | "identity"
  | "rotate90"
  | "rotate180"
  | "mirrorHorizontal"
  | "mirrorVertical";

export type FormationOrientation = 0 | 90 | 180 | 270;

export type FormationShapeId =
  | "circle"
  | "triangle"
  | "square"
  | "diamond"
  | "hexagon"
  | "chevron"
  | "hollow_circle"
  | "rounded_plus"
  | "star";

export type FormationPieceDefinition = {
  id: string;
  shapeId: FormationShapeId;
  orientable: boolean;
  targetOrientation: FormationOrientation;
  isDecoy: boolean;
};

export type FormationCell = {
  row: number;
  column: number;
};

export type FormationPlacement = {
  pieceId: string;
  cell: FormationCell;
  orientation: FormationOrientation;
};

export type FormationRound = {
  index: number;
  rows: number;
  columns: number;
  protocol: FormationTransformProtocol;
  lockedCells: FormationCell[];
  pieces: FormationPieceDefinition[];
  targetPlacements: FormationPlacement[];
  previewMs: number;
  assembleMs: number;
};

export type FormationScenario = {
  id: string;
  seed: string;
  difficulty: TrainingDifficulty;
  rounds: FormationRound[];
};

export type FormationBoardPieceState = {
  pieceId: string;
  cell: FormationCell | null; // null if piece is in reserve tray
  orientation: FormationOrientation;
};

export type FormationBoardState = {
  placements: Record<string, FormationBoardPieceState>;
};

export type FormationRunStatus =
  | "ready"
  | "countdown"
  | "previewing"
  | "transitioning"
  | "assembling"
  | "checking"
  | "round_success"
  | "recovering"
  | "won"
  | "failed"
  | "interrupted"
  | "aborted";

export type FormationRun = {
  id: string;
  seed: string;
  difficulty: TrainingDifficulty;
  status: FormationRunStatus;
  scenario: FormationScenario;
  currentRoundIndex: number;
  boardState: FormationBoardState;
  selectedPieceId: string | null;
  phaseStartedAtPerformanceMs: number | null;
  deadlineAtPerformanceMs: number | null;
  recoveriesRemaining: number;
  checksPerformed: number;
  swapsPerformed: number;
  rotationsPerformed: number;
  dragActions: number;
  tapPlaceActions: number;
  completedRounds: number;
  startedAtPerformanceMs: number;
  completedAtPerformanceMs: number | null;
  resetReason: string | null;
  recoveryNotice?: string | null;
};

export type FormationEvaluation = {
  correct: boolean;
  correctPlacements: number;
  wrongPositionCount: number;
  wrongOrientationCount: number;
  decoyOnBoardCount: number;
  missingTargetCount: number;
  extraPieceCount: number;
};

export type FormationResult = {
  runId: string;
  gameId: "formation_assembly";
  difficulty: TrainingDifficulty;
  victory: boolean;
  completedRounds: number;
  totalRounds: number;
  score: number;
  perfectWin: boolean;
  wrongPositionCount: number;
  wrongOrientationCount: number;
  decoyPlacementCount: number;
  swapsPerformed: number;
  rotationsPerformed: number;
  actionsPerformed: number;
  checksPerformed: number;
  recoveriesUsed: number;
  timeoutCount: number;
  elapsedRealMs: number;
  completedAtEpochMs: number;
};
