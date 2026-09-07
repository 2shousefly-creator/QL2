import type { BoardPoint, GomokuMark } from "../domain/gomokuTypes";
import { BoardCore } from "./BoardCore";
import { DIRECTIONS } from "../domain/GomokuRules";
import { isValidCoord } from "../domain/CoordKey";

export const MATE = 1_000_000;
export const MAX_HEURISTIC = 100_000;
export function moveFeatures(board: BoardCore, move: BoardPoint, side: GomokuMark): { score: number; forcing: boolean } {
  // Fast hypothetical local scan for ordering only. Threat labels/certificates
  // remain in ThreatAnalyzer; do not run make/unmake for every quiet candidate.
  let twos = 0, threeDirections = 0, completions = 0;
  for (const [dx, dy] of DIRECTIONS) {
    const line: number[] = [];
    for (let k = -4; k <= 4; k++) {
      const p = { x: move.x + dx * k, y: move.y + dy * k }, mark = board.get(p)?.mark;
      line.push(!isValidCoord(p.x, p.y) ? -1 : k === 0 || mark === side ? 1 : mark ? -1 : 0);
    }
    const holes = new Set<number>();
    let three = false;
    for (let start = 0; start <= 4; start++) {
      let count = 0, hole = -1, blocked = false;
      for (let i = start; i < start + 5; i++) {
        if (line[i] < 0) { blocked = true; break; }
        if (line[i] === 1) count++; else hole = i;
      }
      if (blocked) continue;
      if (count === 5) return { score: MATE, forcing: true };
      if (count === 4) holes.add(hole);
      else if (count === 3) three = true;
      else if (count === 2) twos++;
    }
    completions += holes.size;
    if (three) threeDirections++;
  }
  return { score: (completions >= 2 ? 80000 : completions ? 18000 : threeDirections * 1200) + twos * 12,
    forcing: completions > 0 || threeDirections >= 2 };
}

/** Static window potential only; no heuristic value is a proof or mate score. */
export function evaluatePosition(board: BoardCore, side: GomokuMark): number {
  return Math.max(-MAX_HEURISTIC, Math.min(MAX_HEURISTIC, board.evaluate(side)));
}
