import { CanvasSurface } from "./CanvasSurface";
import { GomokuFrameSnapshot } from "./FrameSnapshot";

export class GomokuSceneRenderer {
  private surface: CanvasSurface;

  constructor(surface: CanvasSurface) {
    this.surface = surface;
  }

  public render(snapshot: GomokuFrameSnapshot): void {
    const { ctx, canvas } = this.surface;
    const { dpr, cssWidth, cssHeight, worldToCss } = snapshot;

    // 1. Reset backing transform & clear background
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#090d16"; // Dark slate tactical desk background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const m = worldToCss;
    const scale = m.a; // CSS pixels per world unit

    // 2. Compute visible world bounds using inverse matrix
    const inv = m.inverse();
    const cornersCss = [
      new DOMPoint(0, 0),
      new DOMPoint(cssWidth, 0),
      new DOMPoint(cssWidth, cssHeight),
      new DOMPoint(0, cssHeight),
    ];
    const cornersWorld = cornersCss.map((p) => p.matrixTransform(inv));

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const p of cornersWorld) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    const startX = Math.floor(minX) - 2;
    const endX = Math.ceil(maxX) + 2;
    const startY = Math.floor(minY) - 2;
    const endY = Math.ceil(maxY) + 2;

    // 3. Apply COMBINED DPR AND WORLD MATRIX exactly once
    ctx.setTransform(
      dpr * m.a,
      dpr * m.b,
      dpr * m.c,
      dpr * m.d,
      dpr * m.e,
      dpr * m.f
    );

    // 4. Draw Grid Lines in World Space
    const gridLineWidthCss = 1;
    ctx.lineWidth = gridLineWidthCss / scale;
    ctx.strokeStyle = "#1e293b"; // Muted grid line color
    ctx.beginPath();

    for (let x = startX; x <= endX; x++) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y++) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // 5. Draw Star Points (Hoshi) at key coordinates (0,0), (-4,-4), (4,4), etc.
    const starPoints = [
      { x: 0, y: 0 },
      { x: -4, y: -4 },
      { x: 4, y: -4 },
      { x: -4, y: 4 },
      { x: 4, y: 4 },
      { x: -8, y: -8 },
      { x: 8, y: -8 },
      { x: -8, y: 8 },
      { x: 8, y: 8 },
    ];
    ctx.fillStyle = "#38bdf8"; // Cyan star point dot
    const starRadiusWorld = 3 / scale;
    for (const sp of starPoints) {
      if (sp.x >= startX && sp.x <= endX && sp.y >= startY && sp.y <= endY) {
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, starRadiusWorld, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 6. Draw Stones (X and O) in World Space
    const stoneRadius = 0.36; // World units
    const strokeWidthWorld = 3.5 / scale;

    for (const stone of snapshot.stones) {
      if (
        stone.x < startX - 1 ||
        stone.x > endX + 1 ||
        stone.y < startY - 1 ||
        stone.y > endY + 1
      ) {
        continue;
      }

      ctx.lineWidth = strokeWidthWorld;

      if (stone.mark === "X") {
        // Draw X
        ctx.strokeStyle = "#06b6d4"; // Vibrant cyan
        const r = stoneRadius * 0.85;
        ctx.beginPath();
        ctx.moveTo(stone.x - r, stone.y - r);
        ctx.lineTo(stone.x + r, stone.y + r);
        ctx.moveTo(stone.x + r, stone.y - r);
        ctx.lineTo(stone.x - r, stone.y + r);
        ctx.stroke();
      } else {
        // Draw O
        ctx.strokeStyle = "#f43f5e"; // Crimson red
        ctx.beginPath();
        ctx.arc(stone.x, stone.y, stoneRadius * 0.85, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 7. Draw Last Move Highlight
    if (snapshot.lastMove) {
      const lm = snapshot.lastMove;
      ctx.lineWidth = 2.5 / scale;
      ctx.strokeStyle = "#f59e0b"; // Gold ring
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, stoneRadius * 1.15, 0, Math.PI * 2);
      ctx.stroke();

      // Small center dot
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, 2.5 / scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 8. Draw Keyboard Cursor
    if (snapshot.cursor) {
      const c = snapshot.cursor;
      ctx.lineWidth = 2 / scale;
      ctx.strokeStyle = "#38bdf8";
      const s = 0.45;
      ctx.strokeRect(c.x - s, c.y - s, s * 2, s * 2);
    }

    // 9. Draw Winning Line
    if (snapshot.winningLine && snapshot.winningLine.length >= 2) {
      const first = snapshot.winningLine[0];
      const last = snapshot.winningLine[snapshot.winningLine.length - 1];

      ctx.lineWidth = 6 / scale;
      ctx.strokeStyle = "#10b981"; // Emerald green
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }

    // 10. Restore transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
