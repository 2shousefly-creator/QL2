import type { AiIdentity } from "../ai/aiTypes";

export type GomokuDifficulty = "easy" | "medium" | "hard";
export type GomokuMark = "X" | "O";
export type GomokuActor = "player" | "ai";

export type BoardPoint = Readonly<{
  x: number;
  y: number;
}>;

export type Stone = Readonly<{
  x: number;
  y: number;
  mark: GomokuMark;
  actor: GomokuActor;
  ply: number;
}>;

export type CoordKey = string;

export type StoneBounds = Readonly<{
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}>;

export type MatchPhase =
  | "setup"
  | "starter_reveal"
  | "player_turn"
  | "ai_turn"
  | "paused"
  | "player_won"
  | "ai_won"
  | "resigned"
  | "interrupted"
  | "error";

export type GomokuMatchState = Readonly<{
  matchId: string;
  seed: string;
  difficulty: GomokuDifficulty;
  playerMark: GomokuMark;
  aiMark: GomokuMark;
  startingActor: GomokuActor;
  phase: MatchPhase;
  stones: readonly Stone[];
  lastMove: Stone | null;
  winningLine: readonly BoardPoint[] | null;
  aiRequestId: string | null;
  aiRequest: AiIdentity | null;
  aiRetries: number;
  resultCommitted: boolean;
  startedAtEpochMs: number;
}>;

export type GomokuCommand =
  | { type: "START_MATCH"; difficulty: GomokuDifficulty; playerMark: GomokuMark }
  | { type: "FINISH_STARTER_REVEAL" }
  | { type: "PLAYER_PLACE"; point: BoardPoint }
  | { type: "AI_BEGIN"; identity: AiIdentity }
  | { type: "AI_PLACE"; point: BoardPoint; identity: AiIdentity }
  | { type: "AI_FAILED"; identity: AiIdentity }
  | { type: "AI_RETRY" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESIGN" }
  | { type: "INTERRUPT"; reason: string };

export type GomokuResult = Readonly<{
  matchId: string;
  gameId: "gomoku_infinite";
  difficulty: GomokuDifficulty;
  outcome: "player_win" | "ai_win" | "resigned" | "interrupted" | "aborted";
  playerMark: GomokuMark;
  aiMark: GomokuMark;
  startingActor: GomokuActor;
  totalMoves: number;
  playerMoves: number;
  aiMoves: number;
  winningLine: readonly BoardPoint[] | null;
  completedAtEpochMs: number;
  activeDurationMs: number;
}>;
