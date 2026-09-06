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
    ctx.fillStyle = "#f5efdf"; // Warm paper
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // A deterministic, inexpensive paper wash; no per-frame random particles.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const wash = ctx.createLinearGradient(0, 0, cssWidth, cssHeight);
    wash.addColorStop(0, "rgba(255, 252, 242, 0.35)");
    wash.addColorStop(0.5, "rgba(231, 220, 198, 0)");
    wash.addColorStop(1, "rgba(190, 166, 125, 0.12)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

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
    ctx.strokeStyle = "rgba(141, 127, 105, 0.42)";
    ctx.beginPath();

    for (let x = startX; x <= endX; x++) {
      ctx.moveTo(x + 0.5, startY);
      ctx.lineTo(x + 0.5, endY);
    }
    for (let y = startY; y <= endY; y++) {
      ctx.moveTo(startX, y + 0.5);
      ctx.lineTo(endX, y + 0.5);
    }
    ctx.stroke();

    // 5. Winning cell underglow, below the ink so both marks stay legible.
    const highlight = snapshot.winningHighlight;
    if (highlight) {
      for (const point of highlight.points) {
        const halo = ctx.createRadialGradient(point.x, point.y, 0.1, point.x, point.y, 0.65);
        halo.addColorStop(0, `rgba(215, 170, 52, ${0.16 + highlight.pulse * 0.12})`);
        halo.addColorStop(1, "rgba(215, 170, 52, 0)");
        ctx.fillStyle = halo;
        ctx.fillRect(point.x - 0.65, point.y - 0.65, 1.3, 1.3);
        ctx.fillStyle = `rgba(234, 195, 85, ${0.12 + highlight.pulse * 0.12})`;
        ctx.fillRect(point.x - 0.46, point.y - 0.46, 0.92, 0.92);
      }
    }

    // 6. Draw Stones (X and O) in World Space
    const stoneRadius = 0.33; // Inset from the cell boundaries at +/-0.5
    const strokeWidthWorld = 3.5 / scale;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
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

      const progress = snapshot.stoneDraws?.get(stone.ply) ?? 1;
      const r = stoneRadius;
      if (stone.mark === "X") {
        ctx.strokeStyle = "#245aa8";
        const first = Math.min(1, progress * 2);
        const second = Math.max(0, progress * 2 - 1);
        ctx.beginPath();
        if (first > 0) {
          ctx.moveTo(stone.x - r, stone.y - r);
          ctx.lineTo(stone.x - r + 2 * r * first, stone.y - r + 2 * r * first);
        }
        if (second > 0) {
          ctx.moveTo(stone.x + r, stone.y - r);
          ctx.lineTo(stone.x + r - 2 * r * second, stone.y - r + 2 * r * second);
        }
        ctx.stroke();
      } else if (progress > 0) {
        ctx.strokeStyle = "#c94a4a";
        ctx.beginPath();
        ctx.arc(stone.x, stone.y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.stroke();
      }
    }

    // Fine cell outlines emphasize exactly five cells without crossing the ink.
    if (highlight) {
      ctx.lineWidth = 1.5 / scale;
      ctx.strokeStyle = `rgba(153, 112, 26, ${0.55 + highlight.pulse * 0.3})`;
      for (const point of highlight.points) {
        ctx.strokeRect(point.x - 0.45, point.y - 0.45, 0.9, 0.9);
      }
    }

    // 7. A small ochre corner bracket leaves the pen strokes unobstructed.
    if (snapshot.lastMove && !highlight) {
      const lm = snapshot.lastMove;
      ctx.lineWidth = 1.5 / scale;
      ctx.strokeStyle = "#a77a29";
      ctx.beginPath();
      ctx.moveTo(lm.x + 0.24, lm.y - 0.43);
      ctx.lineTo(lm.x + 0.43, lm.y - 0.43);
      ctx.lineTo(lm.x + 0.43, lm.y - 0.24);
      ctx.stroke();
    }

    // 8. Keyboard selection follows the cell, not the grid intersection.
    if (snapshot.cursor && (snapshot.phase === "player_turn" || snapshot.phase === "ai_turn")) {
      const c = snapshot.cursor;
      ctx.lineWidth = 1.5 / scale;
      ctx.strokeStyle = "rgba(36, 90, 168, 0.6)";
      const halfSize = 0.43;
      ctx.strokeRect(c.x - halfSize, c.y - halfSize, halfSize * 2, halfSize * 2);
    }

    // 10. Restore transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
