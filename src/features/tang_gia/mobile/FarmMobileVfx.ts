import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { cropArt, propArt } from './FarmArtRegistry';
import type { FarmVisualEvent } from '../pixi/farmPixiTypes';
import type { MobileRect } from './mobileTypes';
import type { MobileTextureBank } from './FarmMobileAssets';

type Burst = { sprite: Sprite; elapsed: number; duration: number; x: number; y: number; vx: number; vy: number; size: number; gravity: number; bounce: boolean; ground: number };
type Splash = { x: number; y: number; age: number; water: boolean };
/** Fixed 64-particle pool and 9 splash slots. Only confirmed canonical actions emit FX. */
export class FarmMobileVfx {
  private root = new Container();
  private rings = this.root.addChild(new Graphics());
  private can = this.root.addChild(new Sprite(Texture.EMPTY));
  private canAge = 2;
  private seen = new Set<string>();
  private pool: Burst[] = [];
  private splashes: Splash[] = [];
  private scroll = 0;
  constructor(parent: Container, private bank: MobileTextureBank, initial: readonly FarmVisualEvent[]) {
    parent.addChild(this.root); this.root.eventMode = 'none'; this.can.anchor.set(.5); this.can.visible = false;
    initial.forEach(event => this.seen.add(event.id));
    for (let i = 0; i < 64; i++) {
      const sprite = this.root.addChild(new Sprite(Texture.EMPTY)); sprite.anchor.set(.5); sprite.visible = false;
      this.pool.push({ sprite, elapsed: 2, duration: 1, x: 0, y: 0, vx: 0, vy: 0, size: 8, gravity: 0, bounce: false, ground: 0 });
    }
  }
  receive(events: readonly FarmVisualEvent[], plots: readonly MobileRect[], width: number, height: number, scroll: number, reduced: boolean) {
    const shift = this.scroll - scroll;
    if (shift) { this.pool.forEach(p => { p.y += shift; p.ground += shift; }); this.splashes.forEach(p => p.y += shift); this.can.y += shift; }
    this.scroll = scroll;
    for (const event of events) {
      if (this.seen.has(event.id)) continue;
      const pen = event.kind === 'feed' || event.kind === 'egg';
      if (Date.now() - event.startedAt > 1800) { this.remember(event.id); continue; }
      const plot = plots[event.plotIndex]; if (!pen && !plot) { this.remember(event.id); continue; }
      const reward = event.kind === 'harvest' || event.kind === 'egg';
      const path = event.kind === 'water' ? propArt('drop')
        : event.kind === 'feed' || event.kind === 'fertilizer' || event.kind === 'sow' ? propArt('granule')
        : event.kind === 'egg' ? propArt('coin') // Sale feedback, not a second egg collection.
        : event.kind === 'harvest' && event.cropId ? cropArt(event.cropId, 'yield') : propArt('spark');
      const texture = this.bank.get(path); if (!texture) continue; // Retry when the lease arrives.
      this.remember(event.id);
      const x = pen ? event.kind === 'feed' ? 72 : width - 72 : plot.x + plot.width / 2;
      const y = pen ? height - 65 : plot.y + plot.height * .63 - scroll;
      this.splashes.push({ x, y, age: 0, water: event.kind === 'water' });
      if (this.splashes.length > 9) this.splashes.shift();
      if (event.kind === 'water') {
        const canTexture = this.bank.get(propArt('watering'));
        if (canTexture && !reduced) { this.can.texture = canTexture; this.can.position.set(x - 22, y - 46); this.can.width = 58; this.can.height = 58; this.canAge = 0; }
      }
      const count = reduced ? 1 : reward ? 5 : 14;
      for (let index = 0; index < count; index++) {
        const particle = this.pool.find(item => item.elapsed >= item.duration); if (!particle) break;
        particle.sprite.texture = texture;
        particle.sprite.tint = event.kind === 'fertilizer' ? 0xe7cf91 : event.kind === 'sow' ? 0xa68054 : 0xffffff;
        const falling = ['water', 'sow', 'feed', 'fertilizer'].includes(event.kind);
        Object.assign(particle, { elapsed: -index * .025, duration: reduced ? .5 : reward ? 1.2 : .95,
          x: x + Math.sin(index * 2.4) * 15, y: y - (falling ? 40 : 0), ground: y + 7,
          vx: reduced ? 0 : Math.cos(index * 2.4) * (reward ? 30 : 19),
          vy: reduced ? 0 : reward ? -70 : falling ? 35 : -20,
          size: reward ? 35 : event.kind === 'water' ? 19 : 22,
          gravity: reduced ? 0 : reward ? 55 : 170, bounce: !reduced && ['sow', 'fertilizer', 'feed'].includes(event.kind) });
      }
    }
  }
  private remember(id: string) { this.seen.add(id); if (this.seen.size > 128) this.seen.delete(this.seen.values().next().value!); }
  clear() { this.pool.forEach(p => { p.elapsed = p.duration; p.sprite.visible = false; }); this.splashes = []; this.rings.clear(); this.can.visible = false; this.canAge = 2; }
  tick(delta: number, reduced: boolean) {
    this.canAge += delta; this.can.visible = !reduced && this.canAge < .75;
    if (this.can.visible) { this.can.rotation = -.3 + Math.sin(this.canAge * 5) * .12; this.can.alpha = Math.min(1, (.75 - this.canAge) * 5); }
    this.rings.clear();
    for (const splash of this.splashes) {
      splash.age += delta;
      if (splash.age >= 1) continue;
      const radius = reduced ? 20 : 12 + splash.age * 22;
      this.rings.ellipse(splash.x, splash.y, radius, radius * .3).stroke({ color: splash.water ? 0xbbdde0 : 0xf4da95, width: 2, alpha: (1 - splash.age) * .8 });
    }
    for (const particle of this.pool) {
      particle.elapsed += delta; const age = particle.elapsed;
      particle.sprite.visible = age >= 0 && age < particle.duration;
      if (!particle.sprite.visible) continue;
      let y = particle.y + particle.vy * age + .5 * particle.gravity * age * age;
      if (particle.bounce && y > particle.ground) y = particle.ground - Math.abs(Math.sin((y - particle.ground) / 12)) * 5 * (1 - age);
      particle.sprite.position.set(particle.x + particle.vx * age, y);
      const pop = reduced ? 1 : 1 + Math.sin(Math.min(1, age * 4) * Math.PI) * .2;
      particle.sprite.scale.set(particle.size * pop / Math.max(particle.sprite.texture.width, particle.sprite.texture.height));
      particle.sprite.alpha = Math.min(1, (particle.duration - age) * 3);
    }
  }
}
