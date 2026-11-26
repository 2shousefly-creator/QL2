import type { FarmPoint } from '../farmWorkerTypes';
import { FARM_PEN } from '../farmWorldLayout';

// A convex paddock, inset by the largest animal's footprint. It excludes the
// barn and water trough; every interpolated position stays inside the fence.
const YARD = { left: FARM_PEN.left + 1.1, right: 14.3, top: 9.8, bottom: FARM_PEN.bottom - 1.8 };
export class FarmAnimalMotion {
  position: FarmPoint;
  moving = false;
  facingLeft = false;
  walkPhase = 0;
  private seed = 1;
  private start: FarmPoint;
  private target: FarmPoint;
  private startedAt = 0;
  private duration = 0;
  private control: FarmPoint = { x: 0, y: 0 };
  private strides = 1;
  private nextAt = 0;
  private paused = false;
  constructor(id: string) {
    for (const char of id) this.seed = (Math.imul(this.seed, 31) + char.charCodeAt(0)) >>> 0;
    this.position = this.nextPoint();
    this.start = { ...this.position };
    this.target = { ...this.position };
  }
  private random() {
    this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }
  private nextPoint() {
    return {
      x: YARD.left + this.random() * (YARD.right - YARD.left),
      y: YARD.top + this.random() * (YARD.bottom - YARD.top),
    };
  }
  update(now: number, pause: boolean) {
    if (pause) {
      this.paused = true;
      this.moving = false;
      this.walkPhase = 0;
      return;
    }
    if (this.paused) {
      this.paused = false;
      this.nextAt = now + 450;
      this.duration = 0;
    }
    if (this.duration > 0) {
      const rawT = Math.min(1, Math.max(0, (now - this.startedAt) / this.duration));
      const t = rawT * rawT * (3 - 2 * rawT);
      const u = 1 - t;
      this.position.x = u*u*this.start.x + 2*u*t*this.control.x + t*t*this.target.x;
      this.position.y = u*u*this.start.y + 2*u*t*this.control.y + t*t*this.target.y;
      const dx = u*(this.control.x-this.start.x) + t*(this.target.x-this.control.x);
      const dy = u*(this.control.y-this.start.y) + t*(this.target.y-this.control.y);
      if (Math.abs(dx - dy) > 0.03) this.facingLeft = dx < dy;
      this.moving = rawT < 1;
      this.walkPhase = t * this.strides * Math.PI * 2;
      if (rawT === 1) {
        this.duration = 0;
        this.walkPhase = 0;
        this.nextAt = now + 1500 + this.random() * 2800;
      }
    } else if (now >= this.nextAt) {
      this.start = { ...this.position };
      this.target = this.nextPoint();
      const dx = this.target.x - this.start.x;
      const dy = this.target.y - this.start.y;
      // All three points stay inside the paddock, including through turns.
      const bend = this.random() - 0.5;
      this.control = {
        x: Math.min(YARD.right, Math.max(YARD.left, this.start.x + dx / 2 - dy * bend)),
        y: Math.min(YARD.bottom, Math.max(YARD.top, this.start.y + dy / 2 + dx * bend)),
      };
      this.strides = Math.max(1, Math.round(Math.hypot(dx, dy) * 3));
      this.facingLeft = dx - dy < 0;
      this.duration = Math.max(1100, (Math.hypot(dx, dy) / 0.3) * 1000);
      this.startedAt = now;
      this.moving = true;
      this.walkPhase = 0;
    }
  }
}
