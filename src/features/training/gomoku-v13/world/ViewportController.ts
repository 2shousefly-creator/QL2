import { BoardPoint, StoneBounds } from "../domain/gomokuTypes";
import {
  clampScale,
  createViewportMatrix,
  DEFAULT_CELL_SCALE,
  ViewportState,
} from "./ViewportMatrix";
import { cssPointToWorld } from "./CoordinateConversion";

export class ViewportController {
  private matrix: DOMMatrix;
  private revision: number = 0;

  constructor(
    initialScale: number = DEFAULT_CELL_SCALE,
    initialTx: number = 0,
    initialTy: number = 0
  ) {
    this.matrix = createViewportMatrix(initialScale, initialTx, initialTy);
  }

  public getSnapshot(): ViewportState {
    return {
      worldToCss: this.matrix,
      revision: this.revision,
    };
  }

  public panCss(dx: number, dy: number): void {
    if (dx === 0 && dy === 0) return;
    const m = this.matrix;
    this.matrix = createViewportMatrix(m.a, m.e + dx, m.f + dy);
    this.revision++;
  }

  public zoomAtCss(anchorX: number, anchorY: number, factor: number): void {
    if (factor === 1) return;
    const oldMatrix = this.matrix;
    const worldAnchor = cssPointToWorld(anchorX, anchorY, oldMatrix);

    const oldScale = oldMatrix.a;
    const newScale = clampScale(oldScale * factor);
    if (newScale === oldScale) return;

    const tx = anchorX - worldAnchor.x * newScale;
    const ty = anchorY - worldAnchor.y * newScale;

    this.matrix = createViewportMatrix(newScale, tx, ty);
    this.revision++;
  }

  public centerWorldPoint(
    point: BoardPoint,
    viewportWidth: number,
    viewportHeight: number
  ): void {
    const scale = this.matrix.a;
    const tx = viewportWidth / 2 - point.x * scale;
    const ty = viewportHeight / 2 - point.y * scale;

    this.matrix = createViewportMatrix(scale, tx, ty);
    this.revision++;
  }

  public fitWorldBounds(
    bounds: StoneBounds,
    viewportWidth: number,
    viewportHeight: number
  ): void {
    const centerWorldX = (bounds.minX + bounds.maxX) / 2;
    const centerWorldY = (bounds.minY + bounds.maxY) / 2;
    this.centerWorldPoint(
      { x: centerWorldX, y: centerWorldY },
      viewportWidth,
      viewportHeight
    );
  }

  public resizeViewport(
    oldWidth: number,
    oldHeight: number,
    newWidth: number,
    newHeight: number
  ): void {
    if (oldWidth <= 0 || oldHeight <= 0 || newWidth <= 0 || newHeight <= 0) {
      return;
    }
    const worldCenter = cssPointToWorld(
      oldWidth / 2,
      oldHeight / 2,
      this.matrix
    );

    const scale = this.matrix.a;
    const tx = newWidth / 2 - worldCenter.x * scale;
    const ty = newHeight / 2 - worldCenter.y * scale;

    this.matrix = createViewportMatrix(scale, tx, ty);
    this.revision++;
  }
}
