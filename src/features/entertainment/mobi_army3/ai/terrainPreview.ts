import type { TerrainMask } from "../terrain/terrainMask";
/** Copy-on-write overlay: forecasting never deforms the live battle mask. */
export class TerrainPreview {
  readonly cell: TerrainMask["cell"];
  readonly map: TerrainMask["map"];
  private erased = new Set<number>();
  constructor(private base: TerrainMask) {
    this.cell = base.cell;
    this.map = base.map;
  }
  material(x: number, y: number) {
    const value = this.base.material(x, y);
    if (value !== 1) return value;
    return this.erased.has(
      Math.floor(y / 2) * this.base.cols + Math.floor(x / 2),
    )
      ? 0
      : 1;
  }
  solidAt(x: number, y: number) {
    return this.material(x, y) > 0;
  }
  crater(cx: number, cy: number, radius: number) {
    const x0 = Math.max(0, Math.floor((cx - radius) / 2)),
      x1 = Math.min(this.base.cols - 1, Math.ceil((cx + radius) / 2));
    const y0 = Math.max(0, Math.floor((cy - radius) / 2)),
      y1 = Math.min(this.base.rows - 1, Math.ceil((cy + radius) / 2));
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++)
        if (
          (x * 2 - cx) ** 2 + (y * 2 - cy) ** 2 <= radius ** 2 &&
          this.base.data[y * this.base.cols + x] === 1
        )
          this.erased.add(y * this.base.cols + x);
  }
}
