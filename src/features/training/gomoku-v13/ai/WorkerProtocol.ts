import { isValidCoord } from "../domain/CoordKey";
import { GOMOKU_RULE_ID } from "../domain/GomokuRules";
import { AI_PROTOCOL_VERSION, sameIdentity, type AiRequest, type AiResponse, type SearchResult } from "./aiTypes";
import { DIFFICULTY_PROFILES } from "./DifficultyProfiles";

export function validRequest(r: AiRequest): boolean {
  return !!r && r.protocolVersion === AI_PROTOCOL_VERSION && r.ruleId === GOMOKU_RULE_ID &&
    typeof r.matchId === "string" && typeof r.requestId === "string" && typeof r.seed === "string" &&
    Object.hasOwn(DIFFICULTY_PROFILES, r.difficulty) && (r.aiMark === "X" || r.aiMark === "O") &&
    r.sideToMove === r.aiMark && r.playerMark === (r.aiMark === "X" ? "O" : "X") &&
    Array.isArray(r.stones) && r.boardRevision === r.stones.length && r.stones.every(s => !!s &&
      isValidCoord(s.x, s.y) && (s.mark === "X" || s.mark === "O")) &&
    (!r.searchBudget || [r.searchBudget.timeMs, r.searchBudget.nodes].every(n => n === undefined || (Number.isFinite(n) && n > 0)));
}
export function validResponse(r: AiResponse, request: AiRequest): boolean {
  return !!r && sameIdentity(r, request) && (r.kind === "progress" || r.kind === "result") &&
    ["ok", "cancelled", "timeout", "error"].includes(r.status) &&
    ["win", "block", "legal", "none"].includes(r.safety) &&
    ["proven_win", "proven_loss", "unknown"].includes(r.proofStatus) &&
    Number.isFinite(r.score) && Number.isFinite(r.elapsedMs) && r.elapsedMs >= 0 &&
    [r.completedDepth, r.nodes, r.ttEntries].every(n => Number.isSafeInteger(n) && n >= 0) &&
    Array.isArray(r.principalVariation) && r.principalVariation.every(p => p && isValidCoord(p.x, p.y)) &&
    (r.move === null ? r.kind === "result" && r.status !== "ok" : r.safety !== "none" &&
      isValidCoord(r.move?.x, r.move?.y) && !request.stones.some(s => s.x === r.move!.x && s.y === r.move!.y));
}
export function emptyResult(status: SearchResult["status"], errorCode?: string): SearchResult {
  return { status, errorCode, move: null, score: 0, completedDepth: 0, nodes: 0, elapsedMs: 0,
    proofStatus: "unknown", principalVariation: [], safety: "none", ttEntries: 0 };
}
