import { BoardPoint, Stone } from "../domain/gomokuTypes";
import { coordKey } from "../domain/CoordKey";

export function generateCandidates(
  stones: readonly Stone[],
  radius: number = 2
): BoardPoint[] {
  if (stones.length === 0) {
    return [{ x: 0, y: 0 }];
  }

  const occupied = new Set<string>();
  for (const s of stones) {
    occupied.add(coordKey(s.x, s.y));
  }

  const candidateNeighborCounts = new Map<string, { point: BoardPoint; neighbors: number }>();

  for (const s of stones) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (dx === 0 && dy === 0) continue;
        const cx = s.x + dx;
        const cy = s.y + dy;
        const key = coordKey(cx, cy);

        if (!occupied.has(key)) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          const weight = dist === 1 ? 2 : 1;
          const existing = candidateNeighborCounts.get(key);

          if (existing) {
            existing.neighbors += weight;
          } else {
            candidateNeighborCounts.set(key, { point: { x: cx, y: cy }, neighbors: weight });
          }
        }
      }
    }
  }

  // Sort candidates by neighbor density descending
  const candidatesList = Array.from(candidateNeighborCounts.values());
  candidatesList.sort((a, b) => b.neighbors - a.neighbors);

  return candidatesList.map((item) => item.point);
}
