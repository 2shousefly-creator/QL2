import { coordKey, isValidCoord } from "../domain/CoordKey";
import { checkWinAt, DIRECTIONS, GOMOKU_RULE_ID } from "../domain/GomokuRules";
import type { BoardPoint, GomokuMark } from "../domain/gomokuTypes";

export type SearchStone = BoardPoint & { mark: GomokuMark };
export const otherMark = (mark: GomokuMark): GomokuMark => mark === "X" ? "O" : "X";
export const pointKey = (p: BoardPoint): string => coordKey(p.x, p.y);
export const samePoint = (a: BoardPoint | null | undefined, b: BoardPoint | null | undefined): boolean =>
  !!a && !!b && a.x === b.x && a.y === b.y;

type WindowState = { x: number; y: number; dx: number; dy: number; X: number; O: number; hole?: BoardPoint };
const WINDOW_WEIGHTS = [0, 1, 12, 180, 3500, 0];

function hashStone(stone: SearchStone, seed: number): number {
  let h = seed;
  for (const c of `${stone.x}:${stone.y}:${stone.mark}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Mutable search position; the UI snapshot and immutable game board stay separate. */
export class BoardCore {
  private cells = new Map<string, SearchStone>();
  private hashA = 0;
  private hashB = 0;
  private windows = new Map<string, WindowState>();
  private wins = { X: new Map<string, { point: BoardPoint; count: number }>(), O: new Map<string, { point: BoardPoint; count: number }>() };
  private potential = { X: 0, O: 0 };
  constructor(stones: readonly SearchStone[] = []) { stones.forEach(s => this.make(s, s.mark)); }
  get size(): number { return this.cells.size; }
  get(p: BoardPoint): SearchStone | undefined { return this.cells.get(pointKey(p)); }
  legal(p: BoardPoint): boolean { return isValidCoord(p.x, p.y) && !this.get(p); }
  entries(): IterableIterator<SearchStone> { return this.cells.values(); }
  make(p: BoardPoint, mark: GomokuMark): void {
    if (!this.legal(p) || (mark !== "X" && mark !== "O")) throw new Error("invalid_position");
    const s = { x: p.x, y: p.y, mark };
    this.cells.set(pointKey(p), s);
    this.updateWindows(p, mark, 1);
    this.hashA ^= hashStone(s, 2166136261);
    this.hashB ^= hashStone(s, 3339675911);
  }
  unmake(p: BoardPoint): void {
    const s = this.get(p);
    if (!s) throw new Error("unbalanced_unmake");
    this.hashA ^= hashStone(s, 2166136261);
    this.hashB ^= hashStone(s, 3339675911);
    this.cells.delete(pointKey(p));
    this.updateWindows(p, s.mark, -1);
  }
  key(side: GomokuMark): string { return `${GOMOKU_RULE_ID}:${side}:${this.hashA >>> 0}:${this.hashB >>> 0}`; }
  // Verify TT collisions against the full, order-independent position.
  signature(): string { return [...this.cells.values()].map(s => `${pointKey(s)}:${s.mark}`).sort().join(";"); }
  winningAt(p: BoardPoint, mark: GomokuMark): boolean { return checkWinAt(this, p, mark) !== null; }
  terminal(): boolean { return [...this.cells.values()].some(s => this.winningAt(s, s.mark)); }
  immediateWins(side: GomokuMark): BoardPoint[] { return [...this.wins[side].values()].map(w => w.point); }
  evaluate(side: GomokuMark): number { return this.potential[side] - this.potential[otherMark(side)]; }

  private adjustWindow(w: WindowState, delta: number): void {
    for (const side of ["X", "O"] as const) {
      if (w[otherMark(side)] !== 0 || w[side] === 0) continue;
      this.potential[side] += delta * WINDOW_WEIGHTS[w[side]];
      if (w[side] !== 4) continue;
      if (delta > 0) {
        w.hole = undefined;
        for (let k = 0; k < 5; k++) {
          const p = { x: w.x + w.dx * k, y: w.y + w.dy * k };
          if (!this.get(p)) { w.hole = p; break; }
        }
      }
      if (!w.hole) throw new Error("invalid_window");
      const key = pointKey(w.hole), previous = this.wins[side].get(key);
      const count = (previous?.count ?? 0) + delta;
      if (count > 0) this.wins[side].set(key, { point: w.hole, count });
      else this.wins[side].delete(key);
    }
  }
  private updateWindows(p: BoardPoint, side: GomokuMark, delta: 1 | -1): void {
    for (let direction = 0; direction < DIRECTIONS.length; direction++) {
      const [dx, dy] = DIRECTIONS[direction];
      for (let offset = -4; offset <= 0; offset++) {
        const x = p.x + dx * offset, y = p.y + dy * offset;
        if (!isValidCoord(x, y) || !isValidCoord(x + dx * 4, y + dy * 4)) continue;
        const key = `${direction}:${x}:${y}`;
        const w = this.windows.get(key) ?? { x, y, dx, dy, X: 0, O: 0 };
        this.adjustWindow(w, -1);
        w[side] += delta;
        this.adjustWindow(w, 1);
        if (w.X + w.O === 0) this.windows.delete(key);
        else this.windows.set(key, w);
      }
    }
  }
}
