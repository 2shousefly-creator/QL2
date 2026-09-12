import type { MobileHit, MobileRect } from './mobileTypes';

const contains = (r: MobileRect, x: number, y: number) => x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;
/** A single dispatch path: pointerup or keyboard semantic activation, never both. */
export class FarmMobileInput {
  private down: { pointer: number; x: number; y: number; lastY: number; id?: string; dragged: boolean; scroll: boolean } | null = null;
  private hits: MobileHit[] = [];
  private scrollRegion: MobileRect | null = null;
  constructor(private canvas: HTMLCanvasElement, private scroll: (dy: number) => void,
    private pressed: (id: string | null) => void) {
    canvas.style.pointerEvents = 'auto'; canvas.style.touchAction = 'pan-x pinch-zoom';
    canvas.addEventListener('pointerdown', this.start);
    canvas.addEventListener('pointermove', this.move);
    canvas.addEventListener('pointerup', this.end);
    canvas.addEventListener('pointercancel', this.cancel);
    canvas.addEventListener('lostpointercapture', this.cancel);
    canvas.addEventListener('wheel', this.wheel, { passive: false });
  }
  update(hits: MobileHit[], region: MobileRect | null) { this.hits = hits; this.scrollRegion = region; }
  private point(event: PointerEvent | WheelEvent) {
    const bounds = this.canvas.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }
  private start = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) { this.cancel(); return; }
    const { x, y } = this.point(event);
    // Preserve the browser's edge navigation gesture.
    if (x < 12 || x > this.canvas.clientWidth - 12) return;
    const hit = [...this.hits].reverse().find(hit => contains(hit, x, y));
    this.down = { pointer: event.pointerId, x, y, lastY: y, id: hit?.action.id, dragged: false,
      scroll: !!this.scrollRegion && contains(this.scrollRegion, x, y) };
    this.canvas.setPointerCapture(event.pointerId);
    this.pressed(hit?.action.id ?? null);
  };
  private move = (event: PointerEvent) => {
    const down = this.down; if (!down || down.pointer !== event.pointerId) return;
    const { x, y } = this.point(event);
    if (Math.hypot(x - down.x, y - down.y) > 10) down.dragged = true;
    if (down.dragged) { this.pressed(null); if (down.scroll) this.scroll(down.lastY - y); }
    down.lastY = y;
  };
  private end = (event: PointerEvent) => {
    const down = this.down; if (!down || down.pointer !== event.pointerId) return;
    const { x, y } = this.point(event);
    const hit = this.hits.find(hit => hit.action.id === down.id && contains(hit, x, y));
    this.cancel();
    if (!down.dragged && Math.hypot(x - down.x, y - down.y) <= 10 && hit && !hit.action.reason) hit.action.run();
  };
  private cancel = () => { this.down = null; this.pressed(null); };
  private wheel = (event: WheelEvent) => {
    const { x, y } = this.point(event);
    if (!this.scrollRegion || !contains(this.scrollRegion, x, y)) return;
    event.preventDefault(); this.scroll(event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.scrollRegion.height : 1));
  };
  destroy() {
    this.canvas.removeEventListener('pointerdown', this.start); this.canvas.removeEventListener('pointermove', this.move);
    this.canvas.removeEventListener('pointerup', this.end); this.canvas.removeEventListener('pointercancel', this.cancel);
    this.canvas.removeEventListener('lostpointercapture', this.cancel); this.canvas.removeEventListener('wheel', this.wheel);
    this.down = null;
  }
}
