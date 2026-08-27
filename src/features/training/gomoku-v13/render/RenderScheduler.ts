export class RenderScheduler {
  private requested = false;
  private animFrameId: number | null = null;
  private renderCallback: () => void;

  constructor(renderCallback: () => void) {
    this.renderCallback = renderCallback;
  }

  public request(): void {
    if (this.requested) return;
    this.requested = true;

    this.animFrameId = requestAnimationFrame(() => {
      this.requested = false;
      this.animFrameId = null;
      this.renderCallback();
    });
  }

  public cancel(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.requested = false;
  }
}
