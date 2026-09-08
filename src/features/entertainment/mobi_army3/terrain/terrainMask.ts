import type { MapDefinition } from "../types";
import { clamp } from "../config";
export interface DirtyRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
/** Two world units per cell. 0 air, 1 earth, 2 indestructible rock. No GPU reads. */
export class TerrainMask {
  readonly cell = 2;
  readonly cols: number;
  readonly rows: number;
  readonly data: Uint8Array;
  revision = 0;
  dirty: DirtyRect[] = [];
  constructor(readonly map: MapDefinition) {
    this.cols = Math.ceil(map.width / this.cell);
    this.rows = Math.ceil(map.height / this.cell);
    this.data = new Uint8Array(this.cols * this.rows);
    for (let x = 0; x < this.cols; x++) {
      const wx = x * this.cell;
      if (map.gaps.some(([a, b]) => wx >= a && wx <= b)) continue;
      const y = Math.ceil(this.initialSurface(wx) / this.cell);
      for (let row = y; row < this.rows; row++)
        this.data[row * this.cols + x] = 1;
    }
    for (const r of map.rock)
      for (
        let y = Math.floor(r.y / 2);
        y < Math.min(this.rows, (r.y + r.height) / 2);
        y++
      ) {
        for (
          let x = Math.floor(r.x / 2);
          x < Math.min(this.cols, (r.x + r.width) / 2);
          x++
        )
          this.data[y * this.cols + x] = 2;
      }
    this.dirty.push({ x: 0, y: 0, width: map.width, height: map.height });
  }
  initialSurface(x: number): number {
    const points = this.map.surface;
    for (let i = 1; i < points.length; i++) {
      const [bx, by] = points[i];
      const [ax, ay] = points[i - 1];
      if (x <= bx) return ay + (by - ay) * clamp((x - ax) / (bx - ax), 0, 1);
    }
    return points[points.length - 1][1];
  }
  material(x: number, y: number): number {
    if (
      !Number.isFinite(x + y) ||
      x < 0 ||
      y < 0 ||
      x >= this.map.width ||
      y >= this.map.height
    )
      return 0;
    return this.data[Math.floor(y / 2) * this.cols + Math.floor(x / 2)];
  }
  solidAt(x: number, y: number) {
    return this.material(x, y) > 0;
  }
  surface(x: number, from = 0): number | null {
    for (
      let y = Math.max(0, Math.floor(from / 2) * 2);
      y < this.map.height;
      y += 2
    )
      if (this.solidAt(x, y)) return y;
    return null;
  }
  crater(cx: number, cy: number, radius: number): void {
    if (!Number.isFinite(cx + cy + radius) || radius <= 0) return;
    radius = Math.min(radius, 200);
    const x0 = Math.max(0, Math.floor((cx - radius) / 2)),
      x1 = Math.min(this.cols - 1, Math.ceil((cx + radius) / 2));
    const y0 = Math.max(0, Math.floor((cy - radius) / 2)),
      y1 = Math.min(this.rows - 1, Math.ceil((cy + radius) / 2));
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        if (
          (x * 2 - cx) ** 2 + (y * 2 - cy) ** 2 <= radius ** 2 &&
          this.data[y * this.cols + x] === 1
        )
          this.data[y * this.cols + x] = 0;
      }
    this.revision++;
    this.dirty.push({
      x: x0 * 2,
      y: y0 * 2,
      width: (x1 - x0 + 1) * 2,
      height: (y1 - y0 + 1) * 2,
    });
    if (this.dirty.length > 24)
      this.dirty = [
        { x: 0, y: 0, width: this.map.width, height: this.map.height },
      ];
  }
  bodyClear(x: number, feet: number, radius: number, height: number): boolean {
    for (let y = feet - height; y < feet - 2; y += 4)
      for (let dx = -radius; dx <= radius; dx += 4)
        if (this.solidAt(x + dx, y)) return false;
    return true;
  }
  support(x: number, y: number, radius: number): boolean {
    return [-radius * 0.6, 0, radius * 0.6].some((dx) =>
      this.solidAt(x + dx, y + 2),
    );
  }
}
