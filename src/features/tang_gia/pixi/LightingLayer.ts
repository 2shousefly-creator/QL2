import { Container, Sprite } from 'pixi.js';
import type { FarmWorldTextures } from './FarmWorldAssets';
const mix = (a: number, b: number, t: number) => {
  let result = 0; for (const shift of [16, 8, 0]) result |= Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t) << shift; return result;
};
export class LightingLayer {
  night = 0; rain = 0; private moon: Sprite; private window: Sprite; private initialized = false;
  constructor(textures: FarmWorldTextures, parent: Container) {
    this.moon = parent.addChild(new Sprite(textures.get('vfx.light')!)); this.window = parent.addChild(new Sprite(textures.get('vfx.light')!));
    for (const s of [this.moon, this.window]) { s.anchor.set(.5); s.blendMode = 'add'; s.eventMode = 'none'; }
  }
  tick(dt: number, phase: string, weather: string, reduced: boolean, w: number, h: number) {
    const step = reduced || !this.initialized ? 1 : Math.min(1, dt / 1.1); this.initialized = true;
    this.night += ((phase === 'night' ? 1 : 0) - this.night) * step;
    this.rain += ((weather === 'rain' ? 1 : 0) - this.rain) * step;
    this.moon.position.set(w * .82, h * .07); this.moon.width = 110; this.moon.height = 110;
    this.moon.alpha = .25 + .35 * this.night; this.moon.tint = mix(0xffe8a0, 0xc5dcff, this.night);
    this.window.position.set(w * .824, h * .115); this.window.width = w * .13; this.window.height = h * .1; this.window.alpha = this.night * .75;
  }
  get tint() { return mix(mix(0xffffff, 0xb2c7d0, this.rain * .5), 0x647797, this.night * .75); }
}
