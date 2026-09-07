import type { BoardPoint, GomokuMark } from "../domain/gomokuTypes";
import { BoardCore, otherMark, pointKey, samePoint } from "./BoardCore";
import { nearbyMoves } from "./CandidateGenerator";
import { analyzeThreats, lineNeighborhood, winningMoves } from "./ThreatAnalyzer";
import { SearchBudget, SearchStopped } from "./SearchBudget";

export type FourProof =
  | { kind: "win"; move: BoardPoint }
  | { kind: "fork"; move: BoardPoint; wins: BoardPoint[] }
  | { kind: "four"; move: BoardPoint; reply: BoardPoint; next: FourProof };
export type WinProof = FourProof
  | { kind: "forcing"; move: BoardPoint; reply: BoardPoint; next: WinProof }
  | { kind: "three"; move: BoardPoint; otherwise: FourProof; overrides: Array<{ reply: BoardPoint; next: WinProof }> };
export type ProofStatus = "proven_win" | "proven_loss" | "unknown";
export type TacticalResult = { status: ProofStatus; proof?: WinProof; nodes: number };

export function proofPoints(proof: WinProof): BoardPoint[] {
  if (proof.kind === "win") return [proof.move];
  if (proof.kind === "fork") return [proof.move, ...proof.wins];
  if (proof.kind === "three") return [proof.move, ...proofPoints(proof.otherwise),
    ...proof.overrides.flatMap(r => [r.reply, ...proofPoints(r.next)])];
  return [proof.move, proof.reply, ...proofPoints(proof.next)];
}
export function proofPV(proof: WinProof): BoardPoint[] {
  if (proof.kind === "win") return [proof.move];
  if (proof.kind === "fork") return [proof.move, proof.wins[0], proof.wins[1]];
  if (proof.kind === "three") {
    const branch = proof.overrides[0];
    return branch ? [proof.move, branch.reply, ...proofPV(branch.next)] : [proof.move];
  }
  return [proof.move, proof.reply, ...proofPV(proof.next)];
}

/** Replay a VCF certificate in a position with an additional defensive stone. */
function replayFour(board: BoardCore, side: GomokuMark, proof: FourProof, budget: SearchBudget): boolean {
  budget.visit();
  if (!board.legal(proof.move)) return false;
  board.make(proof.move, side);
  try {
    const won = board.winningAt(proof.move, side);
    if (proof.kind === "win") return won;
    if (won || winningMoves(board, otherMark(side)).length) return false;
    const wins = winningMoves(board, side);
    if (proof.kind === "fork") return proof.wins.length >= 2 && proof.wins.every(p => wins.some(q => samePoint(p, q)));
    if (wins.length !== 1 || !samePoint(wins[0], proof.reply)) return false;
    board.make(proof.reply, otherMark(side));
    try { return !board.winningAt(proof.reply, otherMark(side)) && replayFour(board, side, proof.next, budget); }
    finally { board.unmake(proof.reply); }
  } finally { board.unmake(proof.move); }
}

/** AND/OR continuous threat search. Failure/cutoff is always unknown.
 * VCT enumerates all meaningful defenses, plus one symbolic outside class:
 * outside the five-line neighborhood of the default VCF strategy, a single
 * defender stone cannot block it or join any five at any of its future nodes.
 * See ProofVerifier and docs/gomoku-ai.md for the equivalence argument.
 */
export class TacticalSolver {
  private cache = new Map<string, { signature: string; proof: WinProof }>();
  constructor(private budget: SearchBudget) {}

  solve(board: BoardCore, side: GomokuMark, plies: number, vct: boolean): TacticalResult {
    try {
      if (board.terminal()) return { status: "unknown", nodes: this.budget.nodes };
      const proof = this.attack(board, side, plies, vct ? 2 : 0);
      return { status: proof ? "proven_win" : "unknown", proof: proof ?? undefined, nodes: this.budget.nodes };
    } catch (error) {
      if (!(error instanceof SearchStopped)) throw error;
      return { status: "unknown", nodes: this.budget.nodes };
    }
  }

  private attack(board: BoardCore, side: GomokuMark, plies: number, quietSteps: number): WinProof | null {
    this.budget.visit();
    if (plies < 1) return null;
    const wins = winningMoves(board, side);
    if (wins.length) return { kind: "win", move: wins[0] };
    const enemy = otherMark(side), blocks = winningMoves(board, enemy);
    if (blocks.length > 1) return null;
    const cacheKey = `${board.key(side)}:${plies}:${quietSteps}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.signature === board.signature()) return cached.proof;
    const moves = blocks.length ? blocks : nearbyMoves(board);
    const gains: Array<{ move: BoardPoint; rank: number }> = [];
    for (const move of moves) {
      this.budget.check();
      board.make(move, side);
      try {
        const threats = analyzeThreats(board, side, move, quietSteps > 0);
        const fours = threats.filter(t => t.winningSquares.length);
        const threes = threats.filter(t => t.kind === "open_three");
        const winCount = new Set(fours.flatMap(t => t.winningSquares.map(pointKey))).size;
        if (fours.length || threes.length) gains.push({ move, rank: (winCount >= 2 ? 1000 : winCount * 100) + threes.length });
      } finally { board.unmake(move); }
    }
    gains.sort((a, b) => b.rank - a.rank || a.move.x - b.move.x || a.move.y - b.move.y);
    for (const { move } of gains) {
      this.budget.visit();
      let proof: WinProof | null = null;
      board.make(move, side);
      try {
        if (winningMoves(board, enemy).length) continue; // opponent wins before our threat
        const nextWins = winningMoves(board, side);
        if (nextWins.length >= 2) proof = { kind: "fork", move, wins: nextWins };
        else if (nextWins.length === 1 && plies >= 3) {
          const reply = nextWins[0];
          board.make(reply, enemy);
          try {
            if (!board.winningAt(reply, enemy)) {
              const next = this.attack(board, side, plies - 2, quietSteps);
              if (next) proof = quietSteps === 0
                ? { kind: "four", move, reply, next: next as FourProof }
                : { kind: "forcing", move, reply, next };
            }
          } finally { board.unmake(reply); }
        } else if (quietSteps > 0 && plies >= 5) {
          const otherwise = this.attack(board, side, plies - 2, 0) as FourProof | null;
          if (!otherwise) continue;
          const defenses = lineNeighborhood([...board.entries(), ...proofPoints(otherwise)]).filter(p => board.legal(p));
          const overrides: Array<{ reply: BoardPoint; next: WinProof }> = [];
          let all = true;
          for (const reply of defenses) {
            this.budget.check();
            board.make(reply, enemy);
            try {
              if (board.winningAt(reply, enemy)) { all = false; break; }
              if (replayFour(board, side, otherwise, this.budget)) continue;
              const next = this.attack(board, side, plies - 2, quietSteps - 1);
              if (!next) { all = false; break; }
              overrides.push({ reply, next });
            } finally { board.unmake(reply); }
          }
          if (all) proof = { kind: "three", move, otherwise, overrides };
        }
      } finally { board.unmake(move); }
      if (proof) {
        if (this.cache.size >= 1000) this.cache.clear();
        this.cache.set(cacheKey, { signature: board.signature(), proof });
        return proof;
      }
    }
    return null;
  }
}
