import type { TerrainMask } from "../terrain/terrainMask";
import type { Assets } from "./assets";
export class TerrainRenderer {
  private canvas = document.createElement("canvas");
  private ctx: CanvasRenderingContext2D;
  private tile = document.createElement("canvas");
  private pattern: CanvasPattern | null;
  constructor(
    private terrain: TerrainMask,
    assets: Assets,
  ) {
    this.canvas.width = terrain.cols;
    this.canvas.height = terrain.rows;
    this.ctx = this.canvas.getContext("2d")!;
    this.tile.width = 80;
    this.tile.height = 80;
    this.tile
      .getContext("2d")!
      .drawImage(assets.atlas, ...assets.manifest.frames.soil, 0, 0, 80, 80);
    this.pattern = this.ctx.createPattern(this.tile, "repeat");
  }
  update() {
    const t = this.terrain,
      c = this.ctx;
    for (const rect of t.dirty.splice(0)) {
      const x0 = Math.max(0, Math.floor(rect.x / 2)),
        y0 = Math.max(0, Math.floor(rect.y / 2));
      const width = Math.min(t.cols - x0, Math.ceil(rect.width / 2)),
        height = Math.min(t.rows - y0, Math.ceil(rect.height / 2));
      if (width <= 0 || height <= 0) continue;
      c.clearRect(x0, y0, width, height);
      c.fillStyle = this.pattern ?? "#6e5138";
      c.fillRect(x0, y0, width, height);
      // Dirty rectangle only: one CPU alpha mask, same cells as collision.
      const pixels = c.getImageData(x0, y0, width, height);
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          const material = t.data[(y0 + y) * t.cols + x0 + x],
            i = (y * width + x) * 4;
          if (!material) pixels.data[i + 3] = 0;
          else if (material === 2) {
            const shade =
              (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3;
            pixels.data[i] = shade * 0.7;
            pixels.data[i + 1] = shade * 0.85;
            pixels.data[i + 2] = shade;
          } else if (y0 + y > 0 && !t.data[(y0 + y - 1) * t.cols + x0 + x]) {
            pixels.data[i] = 160;
            pixels.data[i + 1] = 151;
            pixels.data[i + 2] = 78;
          }
        }
      c.putImageData(pixels, x0, y0);
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.canvas,
      0,
      0,
      this.terrain.map.width,
      this.terrain.map.height,
    );
  }
  destroy() {
    this.canvas.width = 0;
    this.canvas.height = 0;
    this.tile.width = 0;
    this.tile.height = 0;
    this.pattern = null;
  }
}
