import type { BoardPoint, GomokuMark } from "../domain/gomokuTypes";
import { BoardCore, otherMark } from "./BoardCore";
import { nearbyMoves, orderedMoves } from "./CandidateGenerator";
import { DIFFICULTY_PROFILES, seededRandom } from "./DifficultyProfiles";
import { evaluatePosition, MATE, MAX_HEURISTIC } from "./PositionEvaluator";
import { winningMoves } from "./ThreatAnalyzer";
import { TacticalSolver, proofPV } from "./TacticalSolver";
import { verifyProof } from "./ProofVerifier";
import { SearchBudget, SearchStopped } from "./SearchBudget";
import { scoreFromTT, scoreToTT, TranspositionTable } from "./TranspositionTable";
import type { AiRequest, SearchResult } from "./aiTypes";

export type SearchOptions = { now?: () => number; cancelled?: () => boolean; onProgress?: (result: SearchResult) => void };
export function search(request: AiRequest, options: SearchOptions = {}): SearchResult {
  const now = options.now ?? (() => performance.now()), start = now();
  const profile = DIFFICULTY_PROFILES[request.difficulty];
  const timeMs = Math.max(1, Math.min(profile.timeMs, request.searchBudget?.timeMs ?? profile.timeMs));
  const maxNodes = Math.max(1, Math.min(profile.nodes, request.searchBudget?.nodes ?? profile.nodes));
  const budget = new SearchBudget(start + timeMs, maxNodes, options.cancelled, now);
  const table = new TranspositionTable(profile.ttEntries);
  const board = new BoardCore(request.stones), side = request.aiMark;
  let result: SearchResult = { move: null, score: 0, completedDepth: 0, nodes: 0, elapsedMs: 0,
    proofStatus: "unknown", principalVariation: [], status: "ok", safety: "none", ttEntries: 0 };
  const publish = () => { result = { ...result, elapsedMs: now() - start, nodes: budget.nodes, ttEntries: table.size };
    options.onProgress?.({ ...result }); };
  if (request.sideToMove !== side || request.playerMark !== otherMark(side) || board.terminal())
    return { ...result, status: "error", errorCode: "invalid_position" };

  // This complete tactical scan happens before publishing ANY fallback, even
  // when the requested search budget is tiny. A host watchdog can terminate it.
  const wins = winningMoves(board, side), blocks = winningMoves(board, otherMark(side));
  result.move = wins[0] ?? blocks[0] ?? nearbyMoves(board, 1)[0] ?? null;
  result.safety = wins.length ? "win" : blocks.length === 1 ? "block" : result.move ? "legal" : "none";
  result.principalVariation = result.move ? [result.move] : [];
  if (wins.length) {
    result.score = MATE - 1; result.proofStatus = "proven_win";
    result.proof = { kind: "win", move: wins[0] }; publish(); return result;
  }
  if (blocks.length > 1) {
    result.score = -MATE + 2; result.proofStatus = "proven_loss";
    result.lossWitness = { opponentWinningSquares: blocks }; publish(); return result;
  }
  publish();
  // With exactly one enemy winning square and no own win, every other move
  // loses immediately. There is no useful root choice to spend a budget on.
  if (!result.move || !board.size || blocks.length === 1) return result;

  const negamax = (turn: GomokuMark, depth: number, alpha: number, beta: number, ply: number, q: number): number => {
    budget.visit();
    const ownWins = winningMoves(board, turn);
    if (ownWins.length) return MATE - ply - 1;
    const opponentWins = winningMoves(board, otherMark(turn));
    if (opponentWins.length > 1) return -MATE + ply + 2;
    if (ply >= 100) throw new SearchStopped();
    if (depth <= 0 && q <= 0 && !opponentWins.length) return evaluatePosition(board, turn);
    const originalAlpha = alpha;
    const cached = depth > 0 ? table.get(board, turn) : undefined;
    if (cached && cached.depth >= depth) {
      const value = scoreFromTT(cached.score, ply);
      if (cached.bound === "EXACT") return value;
      if (cached.bound === "LOWER") alpha = Math.max(alpha, value);
      else beta = Math.min(beta, value);
      if (alpha >= beta) return value;
    }
    const moves = orderedMoves(board, turn, profile.beam, cached?.move, budget);
    const tactical = depth <= 0 ? moves.filter(m => m.forcing) : moves;
    let best = depth <= 0 && !opponentWins.length ? evaluatePosition(board, turn) : -MATE;
    if (depth <= 0 && !opponentWins.length) {
      if (best >= beta) return best;
      alpha = Math.max(alpha, best);
    }
    let bestMove: BoardPoint | undefined;
    for (const { move } of tactical) {
      board.make(move, turn);
      let value: number;
      try { value = board.winningAt(move, turn) ? MATE - ply - 1 :
        -negamax(otherMark(turn), depth - 1, -beta, -alpha, ply + 1, depth <= 0 ? q - 1 : q); }
      finally { board.unmake(move); }
      if (value > best) { best = value; bestMove = move; }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    if (depth > 0) table.set(board, turn, { depth, score: scoreToTT(best, ply), move: bestMove,
      bound: best <= originalAlpha ? "UPPER" : best >= beta ? "LOWER" : "EXACT" });
    return best;
  };

  try {
    const rootMoves = orderedMoves(board, side, profile.beam, undefined, budget);
    const random = seededRandom(`${request.seed}:${request.boardRevision}`);
    // Complete a cheap tactical-safe root pass before expensive extensions.
    // A small device/budget must not fall back to the first adjacent square.
    const bootstrap: Array<{ move: BoardPoint; score: number }> = [];
    for (const { move } of rootMoves) {
      budget.check(); board.make(move, side);
      try { bootstrap.push({ move, score: -negamax(otherMark(side), 0, -MATE, MATE, 1, 0) }); }
      finally { board.unmake(move); }
    }
    bootstrap.sort((a, b) => b.score - a.score);
    if (bootstrap.length) {
      const best = bootstrap[0];
      result = { ...result, move: best.move, score: best.score, completedDepth: 1, principalVariation: [best.move] };
      rootMoves.sort((a, b) => bootstrap.findIndex(i => i.move === a.move) - bootstrap.findIndex(i => i.move === b.move));
      publish();
    }
    if (profile.solverNodes > 0) {
      const solverBudget = new SearchBudget(Math.min(budget.deadline, start + timeMs * profile.solverFraction),
        Math.min(maxNodes, profile.solverNodes), options.cancelled, now);
      // Run VCF before the more expensive VCT so a quiet-threat scan cannot
      // consume the entire tactical budget before a straightforward four chain.
      const solver = new TacticalSolver(solverBudget);
      let tactical = solver.solve(board, side, profile.solverPlies, false);
      if (!tactical.proof && profile.vct) tactical = solver.solve(board, side, profile.solverPlies, true);
      budget.nodes += solverBudget.nodes;
      if (tactical.proof && verifyProof(board, side, tactical.proof, budget)) {
        result = { ...result, move: tactical.proof.move, proof: tactical.proof, proofStatus: "proven_win",
          score: MATE - proofPV(tactical.proof).length, principalVariation: proofPV(tactical.proof) };
        publish(); return result;
      }
    }
    for (let depth = 2; depth <= profile.maxDepth; depth++) {
      const iteration: Array<{ move: BoardPoint; score: number }> = [];
      let rootAlpha = -MATE;
      for (const { move } of rootMoves) {
        budget.check(); board.make(move, side);
        try {
          const score = board.winningAt(move, side) ? MATE - 1 :
            -negamax(otherMark(side), depth - 1, -MATE, profile.variety === 0 ? -rootAlpha : MATE, 1, profile.quiescence);
          iteration.push({ move, score }); rootAlpha = Math.max(rootAlpha, score);
        }
        finally { board.unmake(move); }
      }
      iteration.sort((a, b) => b.score - a.score);
      if (!iteration.length) break;
      const best = iteration[0];
      const tolerance = Math.max(24, Math.abs(best.score)) * profile.variety;
      const choices = Math.abs(best.score) > MAX_HEURISTIC ? [best] : iteration.filter(i =>
        Math.abs(i.score) <= MAX_HEURISTIC && i.score >= best.score - tolerance);
      const selected = choices[Math.floor(random() * choices.length)];
      result = { ...result, move: selected.move, score: selected.score, completedDepth: depth,
        principalVariation: [selected.move] };
      publish(); // Only a complete root iteration replaces the previous result.
      rootMoves.sort((a, b) =>
        iteration.findIndex(i => i.move === a.move) - iteration.findIndex(i => i.move === b.move));
      if (Math.abs(best.score) > MATE - 1000) break; // selective score, NOT proof
    }
  } catch (error) {
    if (!(error instanceof SearchStopped)) throw error;
    result.status = options.cancelled?.() ? "cancelled" : "timeout";
  }
  return { ...result, nodes: budget.nodes, elapsedMs: now() - start, ttEntries: table.size };
}
