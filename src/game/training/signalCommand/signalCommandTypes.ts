import { TrainingDifficulty } from "../../types";

export type SignalId =
  | "circle"
  | "triangle"
  | "diamond"
  | "square"
  | "hexagon"
  | "hollow_circle"
  | "star_8"
  | "chevron"
  | "rounded_plus";

export type SingleSignalToken = {
  type: "single";
  signalId: SignalId;
};

export type PairSignalToken = {
  type: "pair";
  signalIds: readonly [SignalId, SignalId];
};

export type SignalCommandToken = SingleSignalToken | PairSignalToken;

export type SignalCommandProtocol = "forward" | "reverse";

export type SignalCommandRound = {
  index: number; // 0..roundCount-1
  protocol: SignalCommandProtocol;
  tokens: SignalCommandToken[];
  presentationFlashMs: number;
  presentationGapMs: number;
  inputDeadlineMs: number;
  pairInputWindowMs: number;
};

export type SignalCommandScenario = {
  id: string;
  seed: string;
  difficulty: TrainingDifficulty;
  signalIds: SignalId[]; // tiles on the board
  rounds: SignalCommandRound[];
};

export type SignalCommandRunStatus =
  | "ready"
  | "countdown"
  | "round_intro"
  | "presenting"
  | "awaiting_input"
  | "round_success"
  | "recovering"
  | "won"
  | "failed"
  | "interrupted"
  | "aborted";

export type SignalCommandRun = {
  id: string;
  seed: string;
  difficulty: TrainingDifficulty;
  status: SignalCommandRunStatus;
  scenario: SignalCommandScenario;
  currentRoundIndex: number;
  phaseStartedAtPerformanceMs: number | null;
  inputDeadlineAtPerformanceMs: number | null;
  expectedTokenIndex: number;
  pendingPair: null | {
    tokenIndex: number;
    firstSignalId: SignalId;
    startedAtPerformanceMs: number;
  };
  recoveriesRemaining: number;
  errors: number;
  timeoutCount: number;
  completedRounds: number;
  correctCellInputs: number;
  wrongCellInputs: number;
  startedAtPerformanceMs: number;
  completedAtPerformanceMs: number | null;
  resetReason: string | null;
  lastJudgementText?: {
    text: string;
    color: string;
    key: number;
  };
};

export type SignalCommandResult = {
  runId: string;
  gameId: "signal_command";
  difficulty: TrainingDifficulty;
  victory: boolean;
  completedRounds: number;
  totalRounds: number;
  longestSequenceCompleted: number;
  correctCellInputs: number;
  wrongCellInputs: number;
  timeoutCount: number;
  recoveriesUsed: number;
  pairTokensCompleted: number;
  reverseRoundsCompleted: number;
  accuracy: number;
  score: number;
  perfectWin: boolean;
  elapsedRealMs: number;
  completedAtEpochMs: number;
};

export type SignalTileDefinition = {
  id: SignalId;
  label: string;
  shortName: string;
  colorName: string;
  bgNormal: string;
  bgActive: string;
  borderNormal: string;
  borderActive: string;
  glowColor: string;
  shortcutNum: string;
  shortcutKey: string;
};
