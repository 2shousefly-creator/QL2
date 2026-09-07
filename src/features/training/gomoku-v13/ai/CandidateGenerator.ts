import { isValidCoord } from "../domain/CoordKey";
import type { BoardPoint, GomokuMark } from "../domain/gomokuTypes";
import { BoardCore, otherMark, pointKey, samePoint } from "./BoardCore";
import { moveFeatures } from "./PositionEvaluator";
import { winningMoves } from "./ThreatAnalyzer";
import type { SearchBudget } from "./SearchBudget";

export function nearbyMoves(board: BoardCore, radius = 2): BoardPoint[] {
  if (!board.size) return [{ x: 0, y: 0 }];
  const points = new Map<string, BoardPoint>();
  for (const s of board.entries()) for (let dx = -radius; dx <= radius; dx++) for (let dy = -radius; dy <= radius; dy++) {
    const p = { x: s.x + dx, y: s.y + dy };
    if (isValidCoord(p.x, p.y) && board.legal(p)) points.set(pointKey(p), p);
  }
  return [...points.values()];
}

export type OrderedMove = { move: BoardPoint; score: number; forcing: boolean };
export function orderedMoves(board: BoardCore, side: GomokuMark, beam: number, preferred?: BoardPoint,
  budget?: SearchBudget): OrderedMove[] {
  const wins = winningMoves(board, side);
  if (wins.length) return wins.map(move => ({ move, score: 1_000_000, forcing: true }));
  const blocks = winningMoves(board, otherMark(side));
  if (blocks.length) return blocks.map(move => ({ move, score: 900000, forcing: true }));
  const all = nearbyMoves(board).map(move => {
    budget?.check();
    const attack = moveFeatures(board, move, side), defense = moveFeatures(board, move, otherMark(side));
    return { move, score: attack.score + defense.score + (samePoint(move, preferred) ? 500000 : 0),
      forcing: attack.forcing || defense.forcing };
  }).sort((a, b) => b.score - a.score || a.move.x - b.move.x || a.move.y - b.move.y);
  // Beam affects quiet search only, so its numerical result stays selective.
  return all.filter((item, index) => item.forcing || index < beam);
}
