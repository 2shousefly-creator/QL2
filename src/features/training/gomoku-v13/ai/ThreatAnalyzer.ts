import { DIRECTIONS } from "../domain/GomokuRules";
import { isValidCoord } from "../domain/CoordKey";
import type { BoardPoint, GomokuMark } from "../domain/gomokuTypes";
import { BoardCore, pointKey } from "./BoardCore";

export type LineWindow = { direction: number; stones: BoardPoint[]; empty: BoardPoint[] };
export type Threat = {
  kind: "open_four" | "single_four" | "open_three" | "closed_three";
  direction: number; stones: BoardPoint[]; gain?: BoardPoint;
  winningSquares: BoardPoint[]; continuations: Array<{ move: BoardPoint; wins: BoardPoint[] }>;
  defensiveSquares: BoardPoint[];
};
export const uniquePoints = (points: readonly BoardPoint[]): BoardPoint[] =>
  [...new Map(points.map(p => [pointKey(p), p])).values()];

/** Every length-five segment with our stones and no opponent; never invent edges. */
export function lineWindows(board: BoardCore, mark: GomokuMark, pivot?: BoardPoint): LineWindow[] {
  const seen = new Set<string>();
  const windows: LineWindow[] = [];
  const anchors = pivot ? [pivot] : [...board.entries()].filter(s => s.mark === mark);
  for (const anchor of anchors) for (let direction = 0; direction < DIRECTIONS.length; direction++) {
    const [dx, dy] = DIRECTIONS[direction];
    for (let start = -4; start <= 0; start++) {
      const x = anchor.x + dx * start, y = anchor.y + dy * start;
      const key = `${direction}:${x}:${y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const stones: BoardPoint[] = [], empty: BoardPoint[] = [];
      let blocked = false;
      for (let k = 0; k < 5; k++) {
        const p = { x: x + dx * k, y: y + dy * k };
        if (!isValidCoord(p.x, p.y)) { blocked = true; break; }
        const occupant = board.get(p);
        if (!occupant) empty.push(p);
        else if (occupant.mark === mark) stones.push(p);
        else { blocked = true; break; }
      }
      if (!blocked && stones.length) windows.push({ direction, stones, empty });
    }
  }
  return windows;
}

/** Exact W for >=5: any winning placement contains a five-window with one hole. */
export function winningMoves(board: BoardCore, mark: GomokuMark): BoardPoint[] {
  return board.immediateWins(mark);
}

export function analyzeThreats(board: BoardCore, mark: GomokuMark, pivot?: BoardPoint, includeThrees = true): Threat[] {
  const groups = new Map<string, LineWindow[]>();
  for (const w of lineWindows(board, mark, pivot)) {
    if (w.stones.length !== 4 && (!includeThrees || w.stones.length !== 3)) continue;
    const key = `${w.direction}:${w.stones.map(pointKey).sort().join(";")}`;
    const list = groups.get(key) ?? [];
    list.push(w); groups.set(key, list);
  }
  const threats: Threat[] = [];
  for (const group of groups.values()) {
    const first = group[0];
    const holes = uniquePoints(group.flatMap(w => w.empty));
    if (first.stones.length === 4) {
      threats.push({ kind: holes.length >= 2 ? "open_four" : "single_four", direction: first.direction,
        stones: first.stones, gain: pivot, winningSquares: holes, continuations: [], defensiveSquares: holes });
      continue;
    }
    const continuations: Threat["continuations"] = [];
    for (const move of holes) {
      board.make(move, mark);
      try {
        const wins = uniquePoints(lineWindows(board, mark, move).filter(w => w.direction === first.direction &&
          w.stones.length === 4 && first.stones.every(s => w.stones.some(p => pointKey(p) === pointKey(s))))
          .map(w => w.empty[0]));
        if (wins.length) continuations.push({ move, wins });
      } finally { board.unmake(move); }
    }
    if (!continuations.length) continue;
    const open = continuations.filter(c => c.wins.length >= 2);
    const effective = open.length ? open : continuations;
    // Verify cost squares by replaying the continuations after a defender move.
    const costs = uniquePoints(effective.flatMap(c => [c.move, ...c.wins])).filter(cost => {
      board.make(cost, mark === "X" ? "O" : "X");
      try {
        return effective.every(c => {
          if (!board.legal(c.move)) return true;
          board.make(c.move, mark);
          try {
            const remaining = c.wins.filter(p => {
              if (!board.legal(p)) return false;
              board.make(p, mark);
              try { return board.winningAt(p, mark); } finally { board.unmake(p); }
            });
            return remaining.length < (open.length ? 2 : 1);
          } finally { board.unmake(c.move); }
        });
      } finally { board.unmake(cost); }
    });
    threats.push({ kind: open.length ? "open_three" : "closed_three", direction: first.direction,
      stones: first.stones, gain: pivot, winningSquares: [], continuations: effective, defensiveSquares: costs });
  }
  return threats;
}

// Shared cost squares mean the named threats are NOT an independent fork.
// This is move ordering information, never a proof of victory.
export function independentThreats(a: Threat, b: Threat): boolean {
  return a.direction !== b.direction && !a.defensiveSquares.some(p => b.defensiveSquares.some(q => pointKey(p) === pointKey(q)));
}

export function lineNeighborhood(points: readonly BoardPoint[]): BoardPoint[] {
  const result: BoardPoint[] = [];
  for (const p of points) for (const [dx, dy] of DIRECTIONS) for (let k = -4; k <= 4; k++) {
    const q = { x: p.x + dx * k, y: p.y + dy * k };
    if (isValidCoord(q.x, q.y)) result.push(q);
  }
  return uniquePoints(result);
}
