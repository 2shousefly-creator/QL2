import { BoardPoint } from "../domain/gomokuTypes";
import { ViewportController } from "../world/ViewportController";
import { cssPointToWorld } from "../world/CoordinateConversion";

const TAP_MOVE_THRESHOLD_PX = 8;

type PointerRecord = {
  id: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  currentX: number;
  currentY: number;
};

type GestureMode = "idle" | "tap_candidate" | "panning" | "pinching";

export class PointerGestureController {
  private canvas: HTMLCanvasElement;
  private viewportController: ViewportController;
  private onTapPlace: (point: BoardPoint) => void;
  private onRequestRender: () => void;

  private activePointers = new Map<number, PointerRecord>();
  private mode: GestureMode = "idle";

  // Pinch tracking variables
  private pinchInitialDistance = 0;
  private pinchLastMidpoint = { x: 0, y: 0 };

  constructor(
    canvas: HTMLCanvasElement,
    viewportController: ViewportController,
    onTapPlace: (point: BoardPoint) => void,
    onRequestRender: () => void
  ) {
    this.canvas = canvas;
    this.viewportController = viewportController;
    this.onTapPlace = onTapPlace;
    this.onRequestRender = onRequestRender;

    this.attach();
  }

  private attach(): void {
    const el = this.canvas;
    el.style.touchAction = "none";

    el.addEventListener("pointerdown", this.handlePointerDown);
    el.addEventListener("pointermove", this.handlePointerMove);
    el.addEventListener("pointerup", this.handlePointerUp);
    el.addEventListener("pointercancel", this.handlePointerCancel);
    el.addEventListener("lostpointercapture", this.handlePointerCancel);
    el.addEventListener("wheel", this.handleWheel, { passive: false });
  }

  public detach(): void {
    const el = this.canvas;
    el.removeEventListener("pointerdown", this.handlePointerDown);
    el.removeEventListener("pointermove", this.handlePointerMove);
    el.removeEventListener("pointerup", this.handlePointerUp);
    el.removeEventListener("pointercancel", this.handlePointerCancel);
    el.removeEventListener("lostpointercapture", this.handlePointerCancel);
    el.removeEventListener("wheel", this.handleWheel);
  }

  private handlePointerDown = (e: PointerEvent): void => {
    try {
      this.canvas.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if capture fails in edge cases
    }

    const rect = this.canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;

    const record: PointerRecord = {
      id: e.pointerId,
      startX: cssX,
      startY: cssY,
      lastX: cssX,
      lastY: cssY,
      currentX: cssX,
      currentY: cssY,
    };

    this.activePointers.set(e.pointerId, record);

    if (this.activePointers.size === 1) {
      this.mode = "tap_candidate";
    } else if (this.activePointers.size === 2) {
      this.mode = "pinching";
      this.initPinch();
    }
  };

  private handlePointerMove = (e: PointerEvent): void => {
    const record = this.activePointers.get(e.pointerId);
    if (!record) return;

    const rect = this.canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;

    const dx = cssX - record.lastX;
    const dy = cssY - record.lastY;

    record.lastX = record.currentX;
    record.lastY = record.currentY;
    record.currentX = cssX;
    record.currentY = cssY;

    if (this.mode === "tap_candidate") {
      const distFromStart = Math.hypot(cssX - record.startX, cssY - record.startY);
      if (distFromStart > TAP_MOVE_THRESHOLD_PX) {
        this.mode = "panning";
      }
    }

    if (this.mode === "panning") {
      this.viewportController.panCss(dx, dy);
      this.onRequestRender();
    } else if (this.mode === "pinching" && this.activePointers.size >= 2) {
      this.updatePinch();
      this.onRequestRender();
    }
  };

  private handlePointerUp = (e: PointerEvent): void => {
    const record = this.activePointers.get(e.pointerId);
    this.activePointers.delete(e.pointerId);

    try {
      if (this.canvas.hasPointerCapture(e.pointerId)) {
        this.canvas.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    if (this.mode === "tap_candidate" && record) {
      const rect = this.canvas.getBoundingClientRect();
      const cssX = e.clientX - rect.left;
      const cssY = e.clientY - rect.top;

      const world = cssPointToWorld(
        cssX,
        cssY,
        this.viewportController.getSnapshot().worldToCss
      );

      // Integer coordinates are cell centers. Include the whole square, with
      // exact boundaries consistently choosing the cell to the right/bottom.
      const targetX = Math.floor(world.x + 0.5);
      const targetY = Math.floor(world.y + 0.5);
      this.onTapPlace({ x: targetX, y: targetY });
    }

    if (this.activePointers.size === 0) {
      this.mode = "idle";
    } else if (this.activePointers.size === 1) {
      this.mode = "panning"; // Remaining pointer transitions to pan
    }
  };

  private handlePointerCancel = (e: PointerEvent): void => {
    this.activePointers.delete(e.pointerId);
    if (this.activePointers.size === 0) {
      this.mode = "idle";
    }
  };

  private handleWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;

    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    this.viewportController.zoomAtCss(cssX, cssY, factor);
    this.onRequestRender();
  };

  private initPinch(): void {
    const records = Array.from(this.activePointers.values());
    if (records.length < 2) return;

    const p1 = records[0];
    const p2 = records[1];

    this.pinchInitialDistance = Math.hypot(p2.currentX - p1.currentX, p2.currentY - p1.currentY);
    this.pinchLastMidpoint = {
      x: (p1.currentX + p2.currentX) / 2,
      y: (p1.currentY + p2.currentY) / 2,
    };
  }

  private updatePinch(): void {
    const records = Array.from(this.activePointers.values());
    if (records.length < 2) return;

    const p1 = records[0];
    const p2 = records[1];

    const currentDistance = Math.hypot(p2.currentX - p1.currentX, p2.currentY - p1.currentY);
    const currentMidpoint = {
      x: (p1.currentX + p2.currentX) / 2,
      y: (p1.currentY + p2.currentY) / 2,
    };

    if (this.pinchInitialDistance > 0) {
      const zoomFactor = currentDistance / this.pinchInitialDistance;
      const panDx = currentMidpoint.x - this.pinchLastMidpoint.x;
      const panDy = currentMidpoint.y - this.pinchLastMidpoint.y;

      this.viewportController.panCss(panDx, panDy);
      this.viewportController.zoomAtCss(currentMidpoint.x, currentMidpoint.y, zoomFactor);

      this.pinchInitialDistance = currentDistance;
      this.pinchLastMidpoint = currentMidpoint;
    }
  }
}
