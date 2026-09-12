import { Container, Sprite } from 'pixi.js';
import type { FarmWorldTextures } from './FarmWorldAssets';
export class WeatherRenderer {
  readonly root = new Container(); private rain: Sprite[] = []; private ripples: Sprite[] = []; private motes: Sprite[] = []; private butterflies: Sprite[] = []; private mist: Sprite;
  constructor(textures: FarmWorldTextures, parent: Container) {
    parent.addChild(this.root); this.root.eventMode = 'none';
    const make = (key: string) => { const s = this.root.addChild(new Sprite(textures.get(`vfx.${key}`)!)); s.anchor.set(.5); return s; };
    for (let i = 0; i < 72; i++) this.rain.push(make('rain'));
    for (let i = 0; i < 12; i++) this.ripples.push(make('ripple'));
    for (let i = 0; i < 22; i++) { const s = make('firefly'); s.blendMode = 'add'; this.motes.push(s); }
    for (let i = 0; i < 2; i++) this.butterflies.push(make('butterfly'));
    this.mist = make('dust');
  }
  tick(time: number, w: number, h: number, rain: number, night: number, reduced: boolean, quality: string, seed: number) {
    const limit = reduced ? 8 : quality === 'low' ? 16 : quality === 'medium' ? 36 : 72;
    const t = reduced ? 0 : time, offset = ((seed % 997) + 997) % 997 / 997;
    this.rain.forEach((s, i) => {
      s.visible = rain > .01 && i < limit; const depth = i % 3;
      s.position.set((((i * .618 + offset) * w - t * (8 + depth * 7)) % w + w) % w, (((i * .383 + offset) * h + t * (85 + depth * 60)) % h + h) % h);
      s.width = 1.5 + depth * .5; s.height = 10 + depth * 7; s.rotation = .14; s.alpha = rain * (.13 + depth * .07);
    });
    this.ripples.forEach((s, i) => {
      const age = (t * .8 + i * .37) % 1; s.visible = rain > .01 && i < limit / 6;
      s.position.set(w * ((i * .27 + .16) % 1), h * (i < 2 ? .2 : .55 + (i * .07) % .4));
      s.width = 5 + age * 17; s.height = 2 + age * 5; s.alpha = rain * (1 - age) * .35;
    });
    this.motes.forEach((s, i) => {
      s.visible = i < (quality === 'low' ? 5 : quality === 'medium' ? 12 : 22);
      const star = i < 8; const y = star ? .02 + i * .013 : .4 + (i * .087) % .55;
      s.position.set(w * ((i * .618 + offset) % 1) + (star ? 0 : Math.sin(t * .2 + i) * 9), h * y + (star ? 0 : Math.cos(t * .3 + i) * 6));
      s.width = s.height = star ? 4 : 5 + night * 4; s.tint = star ? 0xd6e5ff : 0xeaff9d;
      s.alpha = (star ? night : .25 + night * .5) * (.5 + .25 * Math.sin(t * 1.2 + i)) * (1 - rain * .7);
    });
    this.butterflies.forEach((s, i) => {
      s.visible = quality !== 'low' && !reduced; s.alpha = (1 - night) * (1 - rain);
      s.position.set(w * (.18 + i * .55) + Math.sin(t * .21 + i) * 22, h * .48 + Math.cos(t * .31 + i) * 12);
      s.width = 12 * (.45 + Math.abs(Math.sin(t * 6))); s.height = 8; s.rotation = Math.sin(t * .6) * .15;
    });
    this.mist.position.set(w * .5 + Math.sin(t * .07) * 12, h * .66); this.mist.width = w * 1.3; this.mist.height = h * .17; this.mist.alpha = night * .09 + rain * .035;
  }
}
