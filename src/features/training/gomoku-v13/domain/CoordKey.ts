import { BoardPoint, CoordKey } from "./gomokuTypes";

export function coordKey(x: number, y: number): CoordKey {
  return `${x}:${y}`;
}

export function parseCoordKey(key: CoordKey): BoardPoint {
  const parts = key.split(":");
  return {
    x: parseInt(parts[0], 10),
    y: parseInt(parts[1], 10),
  };
}

export function isValidCoord(x: number, y: number): boolean {
  return Number.isSafeInteger(x) && Number.isSafeInteger(y);
}
