import type { AnimalArtState } from './FarmArtRegistry';
import type { MobileAnimal, MobileRect } from './mobileTypes';

const aquatic = new Set(['duck', 'muscovy_duck', 'goose']);
const regal = new Set(['turkey', 'peafowl']);
export type PenRoamArea = MobileRect & { troughX: number; waterX: number; troughY: number; waterY: number };
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Transient visual state only. One instance survives snapshot, selection and scroll updates.
 * Normal roaming stays in the inset yard. Eat/drink approaches extend to the
 * shared prop anchors above it, with the beak aligned to the feed/water surface.
 */
export class AnimalVisualAI {
  x: number; y: number; targetX: number; targetY: number;
  facing = 1;
  action: AnimalArtState = 'walk';
  actionStartedAt = 0;
  pauseDuration = 0;
  speed: number;
  private nextAction: AnimalArtState = 'idle';
  private seed = 2166136261;
  constructor(animal: MobileAnimal, area: PenRoamArea) {
    for (const char of animal.id) this.seed = Math.imul(this.seed ^ char.charCodeAt(0), 16777619) >>> 0;
    this.speed = animal.species === 'ostrich' ? 27 : aquatic.has(animal.species) ? 16 : regal.has(animal.species) ? 14 : 21;
    this.x = area.x + this.random() * area.width;
    this.y = area.y + this.random() * area.height;
    this.targetX = this.x; this.targetY = this.y;
    this.choose(animal, area, 0, false, 0);
  }
  private random() {
    this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }
  fit(area: PenRoamArea) {
    const approachY = Math.min(area.y, area.troughY, area.waterY);
    this.x = clamp(this.x, area.x, area.x + area.width);
    this.y = clamp(this.y, approachY, area.y + area.height);
    this.targetX = clamp(this.targetX, area.x, area.x + area.width);
    this.targetY = clamp(this.targetY, approachY, area.y + area.height);
  }
  private choose(animal: MobileAnimal, area: PenRoamArea, clock: number, night: boolean, feed: number) {
    const choice = this.random();
    this.nextAction = night ? 'rest' : feed > 0 && choice < .22 ? 'eat'
      : aquatic.has(animal.species) && choice < .65 ? 'drink' : regal.has(animal.species) || choice > .75 ? 'idle' : 'eat';
    if (this.nextAction === 'drink' || this.nextAction === 'eat' && feed > 0 && choice < .22) {
      this.targetX = clamp((this.nextAction === 'drink' ? area.waterX : area.troughX) + (this.random() - .5) * 24, area.x, area.x + area.width);
      this.targetY = this.nextAction === 'drink' ? area.waterY : area.troughY;
    } else {
      // Prefer a clearly visible stride, never a tiny periodic offset around a cell.
      for (let attempt = 0; attempt < 8; attempt++) {
        this.targetX = area.x + this.random() * area.width;
        this.targetY = area.y + this.random() * area.height;
        const distance = Math.hypot(this.targetX - this.x, this.targetY - this.y);
        if (distance >= Math.min(animal.species === 'ostrich' ? 140 : 85, Math.max(area.width, area.height) * .6)) break;
      }
    }
    this.action = 'walk'; this.actionStartedAt = clock;
  }
  tick(animal: MobileAnimal, area: PenRoamArea, dt: number, clock: number, reduced: boolean, night: boolean, feed: number): AnimalArtState {
    if (animal.dead) return 'dead';
    if (animal.weak) return 'weak';
    if (reduced) return 'idle';
    if (this.action !== 'walk') {
      if (clock - this.actionStartedAt >= this.pauseDuration) this.choose(animal, area, clock, night, feed);
      else return this.action;
    }
    const dx = this.targetX - this.x, dy = this.targetY - this.y, distance = Math.hypot(dx, dy);
    const step = this.speed * (night ? .65 : 1) * dt;
    if (distance <= Math.max(.5, step)) {
      this.x = this.targetX; this.y = this.targetY;
      this.action = this.nextAction; this.actionStartedAt = clock;
      this.pauseDuration = night ? 6 + this.random() * 7 : 1 + this.random() * 3 + (regal.has(animal.species) ? 1 : 0);
    } else {
      this.x += dx / distance * step; this.y += dy / distance * step;
      if (Math.abs(dx) > .1) this.facing = dx < 0 ? -1 : 1;
    }
    return this.action;
  }
}
