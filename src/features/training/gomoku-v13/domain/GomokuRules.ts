import { BoardPoint, GomokuMark, Stone } from "./gomokuTypes";
import { isValidCoord } from "./CoordKey";

export const GOMOKU_RULE_ID = "ql2-infinite-freestyle-v1" as const;
export type RuleBoard = { get(point: BoardPoint): Pick<Stone, "mark"> | undefined };

export const DIRECTIONS = [
  [1, 0],  // Horizontal
  [0, 1],  // Vertical
  [1, 1],  // Diagonal \
  [1, -1]  // Diagonal /
] as const;

export function checkWinAt(
  board: RuleBoard,
  lastPoint: BoardPoint,
  mark: GomokuMark
): BoardPoint[] | null {
  if (!isValidCoord(lastPoint.x, lastPoint.y) || board.get(lastPoint)?.mark !== mark) return null;
  for (const [dx, dy] of DIRECTIONS) {
    const line: BoardPoint[] = [{ x: lastPoint.x, y: lastPoint.y }];

    // Forward direction
    let step = 1;
    while (true) {
      const p = { x: lastPoint.x + dx * step, y: lastPoint.y + dy * step };
      if (!isValidCoord(p.x, p.y)) break;
      const stone = board.get(p);
      if (stone && stone.mark === mark) {
        line.push(p);
        step++;
      } else {
        break;
      }
    }

    // Backward direction
    step = 1;
    while (true) {
      const p = { x: lastPoint.x - dx * step, y: lastPoint.y - dy * step };
      if (!isValidCoord(p.x, p.y)) break;
      const stone = board.get(p);
      if (stone && stone.mark === mark) {
        line.unshift(p);
        step++;
      } else {
        break;
      }
    }

    if (line.length >= 5) {
      return line;
    }
  }

  return null;
}
