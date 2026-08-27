import { BoardPoint, Stone, StoneBounds } from "./gomokuTypes";
import { coordKey } from "./CoordKey";

export class SparseGomokuBoard {
  private stonesMap: Map<string, Stone>;

  constructor(stones: readonly Stone[] = []) {
    this.stonesMap = new Map();
    for (const stone of stones) {
      this.stonesMap.set(coordKey(stone.x, stone.y), stone);
    }
  }

  public get size(): number {
    return this.stonesMap.size;
  }

  public has(point: BoardPoint): boolean {
    return this.stonesMap.has(coordKey(point.x, point.y));
  }

  public get(point: BoardPoint): Stone | undefined {
    return this.stonesMap.get(coordKey(point.x, point.y));
  }

  public place(stone: Stone): SparseGomokuBoard {
    const nextStones = [...this.stonesMap.values(), stone];
    return new SparseGomokuBoard(nextStones);
  }

  public entries(): IterableIterator<Stone> {
    return this.stonesMap.values();
  }

  public toMoveList(): readonly Stone[] {
    return Array.from(this.stonesMap.values()).sort((a, b) => a.ply - b.ply);
  }

  public getBounds(): StoneBounds {
    if (this.stonesMap.size === 0) {
      return { minX: -5, maxX: 5, minY: -5, maxY: 5 };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const stone of this.stonesMap.values()) {
      if (stone.x < minX) minX = stone.x;
      if (stone.x > maxX) maxX = stone.x;
      if (stone.y < minY) minY = stone.y;
      if (stone.y > maxY) maxY = stone.y;
    }

    return { minX, maxX, minY, maxY };
  }
}
