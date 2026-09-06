import { BoardPoint, Stone } from "../domain/gomokuTypes";

export const STONE_DRAW_DURATION_MS = 300;
export const WIN_CELEBRATION_MS = 3000;

// The rules return an ordered, contiguous line. Keep that domain data intact.
export function selectWinningFive(
  winningLine: readonly BoardPoint[] | null,
  lastMove: BoardPoint | null
): readonly BoardPoint[] {
  if (!winningLine || winningLine.length < 5) return [];
  const lastIndex = lastMove
    ? winningLine.findIndex((p) => p.x === lastMove.x && p.y === lastMove.y)
    : -1;
  const start = Math.max(0, Math.min(lastIndex - 2, winningLine.length - 5));
  return winningLine.slice(start, start + 5);
}

export type WinCelebration = Readonly<{
  matchId: string;
  startedAtMs: number;
  points: readonly BoardPoint[];
}>;

// Remember observed plies separately from active strokes so camera redraws never
// restart a finished animation. Multiple strokes can overlap when AI replies fast.
export class StoneDrawAnimations {
  private matchId: string | null = null;
  private observedPly = 0;
  private active = new Map<number, { startedAtMs: number; durationMs: number }>();

  public snapshot(
    matchId: string,
    stones: readonly Stone[],
    now: number,
    reducedMotion: boolean
  ): ReadonlyMap<number, number> {
    if (matchId !== this.matchId) {
      this.matchId = matchId;
      this.observedPly = 0;
      this.active.clear();
    }

    for (const stone of stones) {
      if (stone.ply > this.observedPly) {
        this.active.set(stone.ply, {
          startedAtMs: now,
          durationMs: reducedMotion ? 100 : STONE_DRAW_DURATION_MS,
        });
        this.observedPly = stone.ply;
      }
    }

    const progress = new Map<number, number>();
    for (const [ply, animation] of this.active) {
      const elapsed = Math.max(0, now - animation.startedAtMs);
      const duration = reducedMotion ? Math.min(100, animation.durationMs) : animation.durationMs;
      if (elapsed >= duration) {
        this.active.delete(ply);
      } else {
        progress.set(ply, elapsed / duration);
      }
    }
    return progress;
  }
}
