import { BoardPoint, GomokuDifficulty, GomokuMark } from "../domain/gomokuTypes";

export type AiRequest = {
  requestId: string;
  matchId: string;
  difficulty: GomokuDifficulty;
  aiMark: GomokuMark;
  playerMark: GomokuMark;
  stones: Array<{
    x: number;
    y: number;
    mark: GomokuMark;
  }>;
  seed: string;
  timeBudgetMs: number;
};

export type AiResponse = {
  requestId: string;
  matchId: string;
  move: BoardPoint | null;
  completedDepth: number;
  nodes: number;
  elapsedMs: number;
  status: "ok" | "cancelled" | "timeout" | "error";
};
