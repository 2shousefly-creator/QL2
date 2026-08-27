export class CanvasSurface {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  public cssWidth: number = 0;
  public cssHeight: number = 0;
  public dpr: number = 1;
  public surfaceRevision: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      throw new Error("Could not acquire 2D context from canvas");
    }
    this.ctx = ctx;
  }

  public resize(): boolean {
    const rect = this.canvas.getBoundingClientRect();
    const cssW = Math.max(1, Math.floor(rect.width));
    const cssH = Math.max(1, Math.floor(rect.height));
    const currentDpr = window.devicePixelRatio || 1;

    if (
      this.cssWidth === cssW &&
      this.cssHeight === cssH &&
      this.dpr === currentDpr
    ) {
      return false;
    }

    this.cssWidth = cssW;
    this.cssHeight = cssH;
    this.dpr = currentDpr;

    this.canvas.width = Math.round(cssW * currentDpr);
    this.canvas.height = Math.round(cssH * currentDpr);

    this.surfaceRevision++;
    return true;
  }

  public clear(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
