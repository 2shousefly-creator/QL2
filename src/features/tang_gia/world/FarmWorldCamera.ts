import type { FarmPoint } from '../farmWorkerTypes';
import { FARM_WORLD } from '../farmWorldLayout';

export const farmCameraSession = { x: 540, y: 410, zoom: 1, initialized: false };

export const MIN_FARM_ZOOM = 0.5;
export const MAX_FARM_ZOOM = 2.2;

export class FarmWorldCamera {
  x = farmCameraSession.x;
  y = farmCameraSession.y;
  zoom = farmCameraSession.zoom;
  width = 1;
  height = 1;

  private targetX = farmCameraSession.x;
  private targetY = farmCameraSession.y;
  private targetZoom = farmCameraSession.zoom;

  private clampPoint(point: FarmPoint): FarmPoint {
    return {
      x: Math.max(80, Math.min(FARM_WORLD.width - 80, point.x)),
      y: Math.max(70, Math.min(FARM_WORLD.height - 70, point.y)),
    };
  }

  private clampZoom(scale: number): number {
    return Math.max(MIN_FARM_ZOOM, Math.min(MAX_FARM_ZOOM, scale));
  }

  world(p: FarmPoint): FarmPoint {
    return {
      x: (p.x - this.width / 2) / this.zoom + this.x,
      y: (p.y - this.height / 2) / this.zoom + this.y,
    };
  }

  screen(p: FarmPoint): FarmPoint {
    return {
      x: (p.x - this.x) * this.zoom + this.width / 2,
      y: (p.y - this.y) * this.zoom + this.height / 2,
    };
  }

  clamp() {
    const clamped = this.clampPoint(this);
    this.x = clamped.x;
    this.y = clamped.y;
    const clampedTarget = this.clampPoint({ x: this.targetX, y: this.targetY });
    this.targetX = clampedTarget.x;
    this.targetY = clampedTarget.y;
    this.save();
  }

  save() {
    Object.assign(farmCameraSession, {
      x: this.x,
      y: this.y,
      zoom: this.zoom,
      initialized: true,
    });
  }

  pan(dx: number, dy: number) {
    this.x -= dx / this.zoom;
    this.y -= dy / this.zoom;
    this.targetX = this.x;
    this.targetY = this.y;
    this.clamp();
  }

  zoomAt(scale: number, point: FarmPoint) {
    const before = this.world(point);
    this.zoom = this.clampZoom(scale);
    this.targetZoom = this.zoom;
    const after = this.world(point);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
    this.targetX = this.x;
    this.targetY = this.y;
    this.clamp();
  }

  smoothZoomAt(scale: number, point?: FarmPoint, instant = false) {
    const anchor = point ?? { x: this.width / 2, y: this.height / 2 };
    const nextZoom = this.clampZoom(scale);
    if (instant) {
      this.zoomAt(nextZoom, anchor);
      return;
    }
    const worldFocus = {
      x: (anchor.x - this.width / 2) / this.targetZoom + this.targetX,
      y: (anchor.y - this.height / 2) / this.targetZoom + this.targetY,
    };
    this.targetZoom = nextZoom;
    this.targetX = worldFocus.x - (anchor.x - this.width / 2) / nextZoom;
    this.targetY = worldFocus.y - (anchor.y - this.height / 2) / nextZoom;
    // Apply an immediate responsive step so button/wheel zoom is felt on frame 1
    this.x += (this.targetX - this.x) * 0.35;
    this.y += (this.targetY - this.y) * 0.35;
    this.zoom += (this.targetZoom - this.zoom) * 0.35;
    this.clamp();
  }

  smoothZoomBy(factor: number, instant = false, point?: FarmPoint) {
    this.smoothZoomAt(this.targetZoom * factor, point, instant);
  }

  resetZoom(instant = false) {
    this.smoothZoomAt(1, { x: this.width / 2, y: this.height / 2 }, instant);
  }

  focus(point: FarmPoint, instant = false) {
    const clamped = this.clampPoint(point);
    this.targetX = clamped.x;
    this.targetY = clamped.y;
    if (instant) {
      this.x = clamped.x;
      this.y = clamped.y;
      this.save();
    }
  }

  isAnimating(): boolean {
    return (
      Math.abs(this.targetX - this.x) > 0.35 ||
      Math.abs(this.targetY - this.y) > 0.35 ||
      Math.abs(this.targetZoom - this.zoom) > 0.002
    );
  }

  tick(dtSeconds: number, reducedMotion = false): boolean {
    if (!this.isAnimating()) return false;
    if (reducedMotion) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.zoom = this.targetZoom;
      this.clamp();
      return true;
    }
    const effectiveDt = dtSeconds > 0 ? Math.min(0.1, dtSeconds) : 1 / 60;
    const factor = 1 - Math.exp(-effectiveDt * 12);
    this.x += (this.targetX - this.x) * factor;
    this.y += (this.targetY - this.y) * factor;
    this.zoom += (this.targetZoom - this.zoom) * factor;

    if (Math.abs(this.targetX - this.x) <= 0.35) this.x = this.targetX;
    if (Math.abs(this.targetY - this.y) <= 0.35) this.y = this.targetY;
    if (Math.abs(this.targetZoom - this.zoom) <= 0.002) this.zoom = this.targetZoom;
    this.clamp();
    return true;
  }
}

export class FarmWorldInput {
  private pointers = new Map<number, FarmPoint>();
  private origin: FarmPoint | null = null;
  private moved = false;
  private blocked = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private camera: FarmWorldCamera,
    private changed: () => void,
    private tap: (point: FarmPoint) => void,
    private manual: () => void
  ) {
    canvas.style.touchAction = 'none';
    canvas.style.pointerEvents = 'auto';
    canvas.style.userSelect = 'none';
    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', this.down);
    canvas.addEventListener('pointermove', this.move);
    canvas.addEventListener('pointerup', this.up);
    canvas.addEventListener('pointercancel', this.cancel);
    canvas.addEventListener('lostpointercapture', this.cancel);
    canvas.addEventListener('wheel', this.wheel, { passive: false });
  }

  setBlocked(blocked: boolean) {
    if (blocked && !this.blocked) {
      this.moved = true;
      this.pointers.clear();
    }
    this.blocked = blocked;
  }

  private point = (e: { clientX: number; clientY: number }) => {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  private down = (e: PointerEvent) => {
    if (this.blocked || e.button > 0) return;
    const p = this.point(e);
    if (!this.pointers.size) {
      this.origin = p;
      this.moved = false;
    } else {
      this.moved = true;
    }
    this.pointers.set(e.pointerId, p);
    this.canvas.style.cursor = 'grabbing';
    try {
      this.canvas.setPointerCapture(e.pointerId);
    } catch {
      // Ignore capture errors on synthetic or non-capturable pointers
    }
  };

  private move = (e: PointerEvent) => {
    if (this.blocked || !this.pointers.has(e.pointerId)) return;
    const next = this.point(e);
    const previous = this.pointers.get(e.pointerId)!;
    if (this.pointers.size > 1) {
      const otherEntry = [...this.pointers.entries()].find(([id]) => id !== e.pointerId);
      if (otherEntry) {
        const pair = otherEntry[1];
        const oldCenter = { x: (previous.x + pair.x) / 2, y: (previous.y + pair.y) / 2 };
        const center = { x: (next.x + pair.x) / 2, y: (next.y + pair.y) / 2 };
        const oldDistance = Math.hypot(previous.x - pair.x, previous.y - pair.y);
        const distance = Math.hypot(next.x - pair.x, next.y - pair.y);
        this.camera.pan(center.x - oldCenter.x, center.y - oldCenter.y);
        if (oldDistance > 4 && distance > 4) {
          this.camera.zoomAt((this.camera.zoom * distance) / oldDistance, center);
        }
        this.moved = true;
        this.manual();
        this.changed();
      }
    } else if (
      this.moved ||
      (this.origin && Math.hypot(next.x - this.origin.x, next.y - this.origin.y) > 7)
    ) {
      this.moved = true;
      this.camera.pan(next.x - previous.x, next.y - previous.y);
      this.manual();
      this.changed();
    }
    this.pointers.set(e.pointerId, next);
  };

  private up = (e: PointerEvent) => {
    if (!this.pointers.has(e.pointerId)) return;
    const tap = !this.blocked && !this.moved && this.pointers.size === 1;
    this.pointers.delete(e.pointerId);
    try {
      if (this.canvas.hasPointerCapture(e.pointerId)) {
        this.canvas.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore release errors
    }
    if (tap) this.tap(this.camera.world(this.point(e)));
    if (!this.pointers.size) {
      this.origin = null;
      this.canvas.style.cursor = 'grab';
    }
  };

  private cancel = (e: PointerEvent) => {
    this.pointers.delete(e.pointerId);
    this.moved = true;
    if (!this.pointers.size) {
      this.origin = null;
      this.canvas.style.cursor = 'grab';
    }
  };

  private wheel = (e: WheelEvent) => {
    if (this.blocked) return;
    e.preventDefault();
    this.manual();
    const rawDelta = e.deltaMode === 1 ? e.deltaY * 28 : e.deltaMode === 2 ? e.deltaY * 120 : e.deltaY;
    const clampedDelta = Math.max(-160, Math.min(160, rawDelta));
    const speed = e.ctrlKey ? 0.0045 : 0.0018;
    const factor = Math.exp(-clampedDelta * speed);
    this.camera.zoomAt(this.camera.zoom * factor, this.point(e));
    this.changed();
  };

  destroy() {
    this.canvas.removeEventListener('pointerdown', this.down);
    this.canvas.removeEventListener('pointermove', this.move);
    this.canvas.removeEventListener('pointerup', this.up);
    this.canvas.removeEventListener('pointercancel', this.cancel);
    this.canvas.removeEventListener('lostpointercapture', this.cancel);
    this.canvas.removeEventListener('wheel', this.wheel);
    this.pointers.clear();
  }
}
