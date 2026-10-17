import type { FarmPoint } from '../farmWorkerTypes';
import { FARM_WORLD } from '../farmWorldLayout';
export const farmCameraSession = { x: 540, y: 410, zoom: 1, initialized: false };
export class FarmWorldCamera {
  x = farmCameraSession.x; y = farmCameraSession.y; zoom = farmCameraSession.zoom;
  width = 1; height = 1;
  world(p: FarmPoint): FarmPoint { return { x: (p.x - this.width / 2) / this.zoom + this.x, y: (p.y - this.height / 2) / this.zoom + this.y }; }
  screen(p: FarmPoint): FarmPoint { return { x: (p.x - this.x) * this.zoom + this.width / 2, y: (p.y - this.y) * this.zoom + this.height / 2 }; }
  clamp() { this.x = Math.max(80, Math.min(FARM_WORLD.width - 80, this.x)); this.y = Math.max(70, Math.min(FARM_WORLD.height - 70, this.y)); this.save(); }
  save() { Object.assign(farmCameraSession, { x: this.x, y: this.y, zoom: this.zoom, initialized: true }); }
  pan(dx: number, dy: number) { this.x -= dx / this.zoom; this.y -= dy / this.zoom; this.clamp(); }
  zoomAt(scale: number, point: FarmPoint) { const before = this.world(point); this.zoom = Math.max(.5, Math.min(1.9, scale)); const after = this.world(point); this.x += before.x - after.x; this.y += before.y - after.y; this.clamp(); }
  focus(point: FarmPoint) { this.x = point.x; this.y = point.y; this.clamp(); }
}
/** Pointer capture and a gesture-wide cancellation flag prevent a drag/pinch
 * release from becoming a farm command. All input is applied to one camera. */
export class FarmWorldInput {
  private pointers = new Map<number, FarmPoint>();
  private origin: FarmPoint | null = null;
  private moved = false;
  private blocked = false;
  constructor(private canvas: HTMLCanvasElement, private camera: FarmWorldCamera, private changed: () => void, private tap: (point: FarmPoint) => void, private manual: () => void) {
    canvas.style.touchAction = 'none';
    canvas.style.pointerEvents = 'auto';
    canvas.addEventListener('pointerdown', this.down); canvas.addEventListener('pointermove', this.move);
    canvas.addEventListener('pointerup', this.up); canvas.addEventListener('pointercancel', this.cancel); canvas.addEventListener('lostpointercapture', this.cancel);
    canvas.addEventListener('wheel', this.wheel, { passive: false });
  }
  setBlocked(blocked: boolean) { if (blocked && !this.blocked) { this.moved = true; this.pointers.clear(); } this.blocked = blocked; }
  private point = (e: { clientX: number; clientY: number }) => { const r = this.canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  private down = (e: PointerEvent) => { if (this.blocked || e.button > 0) return; const p = this.point(e); if (!this.pointers.size) { this.origin = p; this.moved = false; } else this.moved = true; this.pointers.set(e.pointerId, p); this.canvas.setPointerCapture(e.pointerId); };
  private move = (e: PointerEvent) => {
    if (this.blocked || !this.pointers.has(e.pointerId)) return;
    const next = this.point(e), previous = this.pointers.get(e.pointerId)!;
    if (this.pointers.size > 1) {
      const pair = [...this.pointers.entries()].find(([id]) => id !== e.pointerId)![1];
      const oldCenter = { x: (previous.x + pair.x) / 2, y: (previous.y + pair.y) / 2 }, center = { x: (next.x + pair.x) / 2, y: (next.y + pair.y) / 2 };
      const oldDistance = Math.hypot(previous.x - pair.x, previous.y - pair.y), distance = Math.hypot(next.x - pair.x, next.y - pair.y);
      this.camera.pan(center.x - oldCenter.x, center.y - oldCenter.y);
      if (oldDistance > 2) this.camera.zoomAt(this.camera.zoom * distance / oldDistance, center);
      this.moved = true; this.manual(); this.changed();
    } else if (this.moved || this.origin && Math.hypot(next.x - this.origin.x, next.y - this.origin.y) > 8) {
      this.moved = true; this.camera.pan(next.x - previous.x, next.y - previous.y); this.manual(); this.changed();
    }
    this.pointers.set(e.pointerId, next);
  };
  private up = (e: PointerEvent) => { if (!this.pointers.has(e.pointerId)) return; const tap = !this.blocked && !this.moved && this.pointers.size === 1; this.pointers.delete(e.pointerId); if (this.canvas.hasPointerCapture(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId); if (tap) this.tap(this.camera.world(this.point(e))); if (!this.pointers.size) this.origin = null; };
  private cancel = (e: PointerEvent) => { this.pointers.delete(e.pointerId); this.moved = true; };
  private wheel = (e: WheelEvent) => { if (this.blocked) return; e.preventDefault(); this.manual(); this.camera.zoomAt(this.camera.zoom * Math.exp(-e.deltaY * .0015), this.point(e)); this.changed(); };
  destroy() { this.canvas.removeEventListener('pointerdown', this.down); this.canvas.removeEventListener('pointermove', this.move); this.canvas.removeEventListener('pointerup', this.up); this.canvas.removeEventListener('pointercancel', this.cancel); this.canvas.removeEventListener('lostpointercapture', this.cancel); this.canvas.removeEventListener('wheel', this.wheel); this.pointers.clear(); }
}
