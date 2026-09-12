import { Container, Sprite, Texture } from 'pixi.js';
import { FARM_WORLD_ASSETS, TANG_GIA_ASSETS } from '../tangGiaAssetManifest';
import type { FarmVisualEvent } from '../pixi/farmPixiTypes';
import type { FarmMobileTab, MobileRect } from './mobileTypes';
import type { MobileTextureBank } from './FarmMobileAssets';

type Burst = { sprite: Sprite; elapsed: number; duration: number; x: number; y: number; vx: number; vy: number; size: number; gravity: number };
/** Fixed-size pool; authoritative events only. Finishing an effect has no callback. */
export class FarmMobileVfx {
  private root = new Container();
  private seen = new Set<string>();
  private pool: Burst[] = [];
  constructor(parent: Container, private bank: MobileTextureBank, initial: readonly FarmVisualEvent[]) {
    parent.addChild(this.root); this.root.eventMode = 'none';
    initial.forEach(event => this.seen.add(event.id));
    for (let i = 0; i < 48; i++) {
      const sprite = this.root.addChild(new Sprite(Texture.EMPTY)); sprite.anchor.set(.5); sprite.visible = false;
      this.pool.push({ sprite, elapsed: 2, duration: 1, x: 0, y: 0, vx: 0, vy: 0, size: 8, gravity: 0 });
    }
  }
  receive(events: readonly FarmVisualEvent[], tab: FarmMobileTab, plots: readonly MobileRect[], width: number, height: number, scroll: number, reduced: boolean) {
    for (const event of events) {
      if (this.seen.has(event.id)) continue;
      this.seen.add(event.id); if (this.seen.size > 128) this.seen.delete(this.seen.values().next().value!);
      const pen = event.kind === 'feed' || event.kind === 'egg';
      if (reduced || Date.now() - event.startedAt > 1800 || pen !== (tab === 'pen')) continue;
      const plot = plots[event.plotIndex]; if (!pen && !plot) continue;
      const reward = event.kind === 'harvest' || event.kind === 'egg';
      const path = event.kind === 'water' ? FARM_WORLD_ASSETS.vfx.water
        : event.kind === 'feed' ? FARM_WORLD_ASSETS.pen.grain
        : event.kind === 'egg' ? FARM_WORLD_ASSETS.pen.egg
        : event.cropId && event.kind === 'sow' ? TANG_GIA_ASSETS.crops[event.cropId].seed
        : event.kind === 'harvest' && event.cropId === 'carrot' ? FARM_WORLD_ASSETS.vfx.carrot
        : event.kind === 'harvest' && event.cropId === 'tomato' ? FARM_WORLD_ASSETS.vfx.tomato
        : event.kind === 'pest' ? FARM_WORLD_ASSETS.vfx.leaf : FARM_WORLD_ASSETS.vfx.light;
      const texture = this.bank.get(path); if (!texture) continue;
      const x = pen ? event.kind === 'feed' ? 68 : width * .78 : plot.x + plot.width / 2;
      const y = pen ? height - 55 : plot.y + plot.height * .6 - scroll;
      const count = reward ? 3 : 10;
      for (let index = 0; index < count; index++) {
        const particle = this.pool.find(item => item.elapsed >= item.duration); if (!particle) break;
        particle.sprite.texture = texture;
        particle.sprite.tint = event.kind === 'fertilizer' ? 0xe7d78c : event.kind === 'unlock' ? 0xbfa074 : 0xffffff;
        Object.assign(particle, { elapsed: -index * .025, duration: reward ? 1.2 : .8,
          x: x + Math.sin(index * 2.4) * 12, y: y - (event.kind === 'water' || event.kind === 'sow' || event.kind === 'feed' ? 38 : 0),
          vx: reward ? -30 - index * 8 : Math.cos(index * 2.4) * 22,
          vy: reward ? -45 : event.kind === 'water' || event.kind === 'feed' ? 38 : -20,
          size: reward ? 25 : event.kind === 'sow' ? 15 : 8, gravity: reward ? 0 : 65 });
      }
    }
  }
  clear() { this.pool.forEach(particle => { particle.elapsed = particle.duration; particle.sprite.visible = false; }); }
  tick(delta: number, reduced: boolean) {
    if (reduced) { this.clear(); return; }
    for (const particle of this.pool) {
      particle.elapsed += delta; const age = particle.elapsed;
      particle.sprite.visible = age >= 0 && age < particle.duration;
      if (!particle.sprite.visible) continue;
      particle.sprite.position.set(particle.x + particle.vx * age, particle.y + particle.vy * age + .5 * particle.gravity * age * age);
      particle.sprite.scale.set(particle.size / Math.max(particle.sprite.texture.width, particle.sprite.texture.height));
      particle.sprite.alpha = Math.min(1, (particle.duration - age) * 3);
    }
  }
}
