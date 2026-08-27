import { BoardPoint, GomokuMark, Stone } from "./gomokuTypes";
import { SparseGomokuBoard } from "./SparseBoard";

export const DIRECTIONS = [
  [1, 0],  // Horizontal
  [0, 1],  // Vertical
  [1, 1],  // Diagonal \
  [1, -1]  // Diagonal /
] as const;

export function checkWinAt(
  board: SparseGomokuBoard,
  lastPoint: BoardPoint,
  mark: GomokuMark
): BoardPoint[] | null {
  for (const [dx, dy] of DIRECTIONS) {
    const line: BoardPoint[] = [{ x: lastPoint.x, y: lastPoint.y }];

    // Forward direction
    let step = 1;
    while (true) {
      const p = { x: lastPoint.x + dx * step, y: lastPoint.y + dy * step };
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
