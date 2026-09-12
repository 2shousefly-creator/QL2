import type { Container } from 'pixi.js';
import type { FarmAnchor } from './farmPixiTypes';
export class FarmCamera {
  private current = { x: 0, y: 0, scale: 1 };
  private from = { ...this.current }; private target = { ...this.current }; private elapsed = 1;
  constructor(private root: Container) {}
  focus(anchor: FarmAnchor | undefined, width: number, height: number, reduced: boolean) {
    const scale = anchor && !reduced ? 1.055 : 1;
    const next = { scale, x: anchor ? (width / 2 - anchor.x) * (scale - 1) : 0, y: anchor ? (height / 2 - anchor.y) * (scale - 1) : 0 };
    if (JSON.stringify(next) !== JSON.stringify(this.target)) { this.from = { ...this.current }; this.target = next; this.elapsed = reduced ? 1 : 0; }
    if (reduced) { this.current = { ...next }; this.apply(width, height); }
  }
  private apply(w: number, h: number) { this.root.pivot.set(w / 2, h / 2); this.root.position.set(w / 2 + this.current.x, h / 2 + this.current.y); this.root.scale.set(this.current.scale); }
  tick(dt: number, w: number, h: number) {
    this.elapsed = Math.min(1, this.elapsed + dt / .35); const t = this.elapsed * this.elapsed * (3 - 2 * this.elapsed);
    for (const key of ['x', 'y', 'scale'] as const) this.current[key] = this.from[key] + (this.target[key] - this.from[key]) * t;
    this.apply(w, h);
  }
}
