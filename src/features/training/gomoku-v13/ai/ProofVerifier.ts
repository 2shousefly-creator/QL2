import { DIRECTIONS, checkWinAt } from "../domain/GomokuRules";
import { isValidCoord } from "../domain/CoordKey";
import type { BoardPoint, GomokuMark } from "../domain/gomokuTypes";
import { BoardCore, otherMark, pointKey, samePoint } from "./BoardCore";
import type { WinProof, FourProof } from "./TacticalSolver";
import type { SearchBudget } from "./SearchBudget";

// Intentionally independent of ThreatAnalyzer's window scanner and solver's
// move generation. Every empty along a possible five is tried using game rules.
export function oracleRegion(points: readonly BoardPoint[]): BoardPoint[] {
  const pointsByKey = new Map<string, BoardPoint>();
  for (const p of points) for (const [dx, dy] of DIRECTIONS) for (let offset = -4; offset <= 4; offset++) {
    const q = { x: p.x + offset * dx, y: p.y + offset * dy };
    if (isValidCoord(q.x, q.y)) pointsByKey.set(pointKey(q), q);
  }
  return [...pointsByKey.values()];
}
export function oracleWins(board: BoardCore, side: GomokuMark, budget?: SearchBudget): BoardPoint[] {
  const wins: BoardPoint[] = [];
  for (const p of oracleRegion([...board.entries()])) {
    budget?.check();
    if (!board.legal(p)) continue;
    board.make(p, side);
    try { if (checkWinAt(board, p, side)) wins.push(p); } finally { board.unmake(p); }
  }
  return wins;
}
function fourSupport(proof: FourProof): BoardPoint[] {
  if (proof.kind === "win") return [proof.move];
  if (proof.kind === "fork") return [proof.move, ...proof.wins];
  return [proof.move, proof.reply, ...fourSupport(proof.next)];
}

export function verifyProof(board: BoardCore, side: GomokuMark, proof: WinProof, budget?: SearchBudget): boolean {
  budget?.visit();
  if (!board.legal(proof.move)) return false;
  board.make(proof.move, side);
  try {
    const won = checkWinAt(board, proof.move, side) !== null;
    if (proof.kind === "win") return won;
    if (won || oracleWins(board, otherMark(side), budget).length) return false;
    const wins = oracleWins(board, side, budget);
    if (proof.kind === "fork") return proof.wins.length >= 2 &&
      new Set(proof.wins.map(pointKey)).size === proof.wins.length &&
      proof.wins.every(p => wins.some(q => samePoint(p, q)));
    if (proof.kind !== "three") {
      if (wins.length !== 1 || !samePoint(wins[0], proof.reply)) return false;
      board.make(proof.reply, otherMark(side));
      try { return !checkWinAt(board, proof.reply, otherMark(side)) && verifyProof(board, side, proof.next, budget); }
      finally { board.unmake(proof.reply); }
    }
    if (wins.length || !verifyProof(board, side, proof.otherwise, budget)) return false;
    const region = oracleRegion([...board.entries(), ...fourSupport(proof.otherwise)]).filter(p => board.legal(p));
    if (new Set(proof.overrides.map(r => pointKey(r.reply))).size !== proof.overrides.length ||
      proof.overrides.some(r => !region.some(p => samePoint(p, r.reply)))) return false;
    for (const reply of region) {
      board.make(reply, otherMark(side));
      try {
        if (checkWinAt(board, reply, otherMark(side))) return false;
        const branch = proof.overrides.find(r => samePoint(r.reply, reply))?.next ?? proof.otherwise;
        if (!verifyProof(board, side, branch, budget)) return false;
      } finally { board.unmake(reply); }
    }
    // Any point outside region is too far along every winning direction from
    // every stone in the default VCF certificate to affect a five, a forced
    // reply, or a gain. The verified default therefore covers infinitely many
    // remaining legal replies; no finite-board assumption is introduced.
    return true;
  } finally { board.unmake(proof.move); }
}
