import type { BoardPoint, GomokuDifficulty, GomokuMark } from "../domain/gomokuTypes";
import type { SearchStone } from "./BoardCore";
import type { ProofStatus, WinProof } from "./TacticalSolver";
import { GOMOKU_RULE_ID } from "../domain/GomokuRules";
export const AI_PROTOCOL_VERSION = 1 as const;
export type AiIdentity = {
  protocolVersion: 1; ruleId: typeof GOMOKU_RULE_ID; matchId: string; requestId: string;
  boardRevision: number; sideToMove: GomokuMark; aiMark: GomokuMark;
};
export type AiRequest = AiIdentity & {
  playerMark: GomokuMark; difficulty: GomokuDifficulty; stones: readonly SearchStone[];
  seed: string; searchBudget?: { timeMs?: number; nodes?: number };
};
export type SearchResult = {
  move: BoardPoint | null; score: number; completedDepth: number; nodes: number; elapsedMs: number;
  proofStatus: ProofStatus; principalVariation: BoardPoint[]; proof?: WinProof;
  lossWitness?: { opponentWinningSquares: BoardPoint[] };
  status: "ok" | "cancelled" | "timeout" | "error"; errorCode?: string;
  safety: "win" | "block" | "legal" | "none"; ttEntries: number;
};
export type AiResponse = AiIdentity & SearchResult & { kind: "progress" | "result" };
export const identityOf = (r: AiIdentity): AiIdentity => ({ protocolVersion: r.protocolVersion, ruleId: r.ruleId,
  matchId: r.matchId, requestId: r.requestId, boardRevision: r.boardRevision, sideToMove: r.sideToMove, aiMark: r.aiMark });
export function sameIdentity(a: AiIdentity, b: AiIdentity): boolean {
  return a.protocolVersion === b.protocolVersion && a.ruleId === b.ruleId && a.matchId === b.matchId &&
    a.requestId === b.requestId && a.boardRevision === b.boardRevision && a.sideToMove === b.sideToMove && a.aiMark === b.aiMark;
}
