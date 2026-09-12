import type { FarmAnimalVisual } from './farmPixiTypes';
export type AnimalBehavior = 'idle' | 'wander' | 'look' | 'peck' | 'eat' | 'drink' | 'scratch' | 'flap' | 'rest' | 'sleep' | 'layEgg' | 'weak' | 'dead';
export const PEN_POIS = { trough: { x: .29, y: .69 }, water: { x: .73, y: .66 }, nest: { x: .82, y: .43 }, shade: { x: .28, y: .42 }, grass: { x: .48, y: .73 } };
/** Local visual clock only. Never writes a save, a lifecycle field, or a reward. */
export class AnimalVisualAI {
  x: number; y: number; facing = 1; behavior: AnimalBehavior = 'idle';
  private seed = 1; private wait = 1; private target: { x: number; y: number }; private arrival: AnimalBehavior = 'idle'; private cycle: number;
  constructor(readonly id: string, cycle: number) {
    for (const char of id) this.seed = (Math.imul(this.seed, 31) + char.charCodeAt(0)) >>> 0;
    this.x = .35 + this.random() * .3; this.y = .48 + this.random() * .24;
    this.target = { x: this.x, y: this.y }; this.wait = .5 + this.random() * 4; this.cycle = cycle;
  }
  private random() { this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0; return this.seed / 4294967296; }
  private go(poi: { x: number; y: number }, after: AnimalBehavior) {
    this.target = { x: poi.x + (this.random() - .5) * .06, y: poi.y + (this.random() - .5) * .04 };
    this.arrival = after; this.behavior = 'wander';
  }
  tick(dt: number, animal: FarmAnimalVisual, feed: number, starving: boolean, night: boolean, rain: boolean, reduced: boolean) {
    if (animal.dead) { this.behavior = 'dead'; return; }
    if (reduced) { this.behavior = starving ? 'weak' : night ? 'sleep' : 'idle'; return; }
    if (starving) { this.behavior = 'weak'; this.wait = 1; return; }
    if (this.behavior === 'weak' || this.behavior === 'dead') this.behavior = 'idle';
    if (feed <= 0 && (this.behavior === 'eat' || this.arrival === 'eat')) { this.behavior = 'idle'; this.arrival = 'idle'; this.wait = .5; }
    if (animal.cycle !== this.cycle) { this.cycle = animal.cycle; this.go(PEN_POIS.nest, 'layEgg'); }
    if (night && this.behavior !== 'sleep' && this.arrival !== 'sleep') this.go(PEN_POIS.shade, 'sleep');
    if (!night && this.behavior === 'sleep') { this.behavior = 'look'; this.wait = 1; }
    if (this.behavior === 'wander') {
      const dx = this.target.x - this.x, dy = this.target.y - this.y, distance = Math.hypot(dx, dy);
      const step = dt * (animal.species === 'duck' ? .037 : .047) * (night ? .5 : 1);
      if (distance <= step) { this.x = this.target.x; this.y = this.target.y; this.behavior = this.arrival; this.arrival = 'idle'; this.wait = 2 + this.random() * 4; }
      else { this.x += dx / distance * step; this.y += dy / distance * step; if (Math.abs(dx) > .005) this.facing = dx > 0 ? 1 : -1; }
      return;
    }
    if (this.behavior === 'sleep') return;
    this.wait -= dt; if (this.wait > 0) return;
    const choice = this.random(); this.wait = 2 + this.random() * 5;
    if (animal.eggReady) this.go(PEN_POIS.nest, 'layEgg');
    else if (rain && choice < .45) this.go(PEN_POIS.shade, 'rest');
    else if (feed > 0 && choice < .22) this.go(PEN_POIS.trough, 'eat');
    else if (choice < (animal.species === 'duck' ? .55 : .36)) this.go(PEN_POIS.water, 'drink');
    else if (choice < .66) this.go(PEN_POIS.grass, animal.species === 'chicken' ? 'peck' : 'flap');
    else if (choice < .8) { this.behavior = animal.species === 'chicken' ? 'scratch' : 'look'; }
    else this.go({ x: .2 + this.random() * .6, y: .45 + this.random() * .32 }, 'look');
  }
}
