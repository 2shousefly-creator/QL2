import { Container, Sprite } from 'pixi.js';
import type { FarmWorldTextures } from './FarmWorldAssets';
export type EnvironmentLayerProfile = { texture: string; x: number; y: number; width: number; height: number; parallax: number; opacity?: number };
export const ENVIRONMENT_LAYERS: readonly EnvironmentLayerProfile[] = [
  { texture: 'sky', x: .5, y: .5, width: 1.08, height: 1.08, parallax: 0 },
  { texture: 'cloud', x: .23, y: .08, width: .65, height: .18, parallax: .05 },
  { texture: 'farHill', x: .5, y: .15, width: 1.12, height: .3, parallax: .08 },
  { texture: 'farTree', x: .52, y: .24, width: 1.12, height: .28, parallax: .12 },
  { texture: 'field', x: .5, y: .7, width: 1.12, height: .82, parallax: .35 },
  { texture: 'path', x: .62, y: .61, width: .43, height: .77, parallax: .35 },
  { texture: 'building', x: .82, y: .17, width: .32, height: .26, parallax: .2 },
];
export class EnvironmentRenderer {
  readonly root = new Container(); readonly front = new Container();
  private layers: { sprite: Sprite; profile: EnvironmentLayerProfile }[] = [];
  constructor(textures: FarmWorldTextures, parent: Container, front: Container) {
    parent.addChild(this.root); front.addChild(this.front);
    for (const profile of ENVIRONMENT_LAYERS) this.layers.push({ profile, sprite: this.root.addChild(new Sprite(textures.get(`environment.${profile.texture}`)!)) });
    for (const x of [.02, .98]) {
      const profile = { texture: 'foreground', x, y: .99, width: .32, height: .16, parallax: 1 };
      this.layers.push({ profile, sprite: this.front.addChild(new Sprite(textures.get('environment.foreground')!)) });
    }
    this.layers.forEach(({ sprite }) => { sprite.anchor.set(.5); sprite.eventMode = 'none'; });
  }
  tick(time: number, w: number, h: number, reduced: boolean, quality: string, tint: number) {
    for (const { sprite, profile: p } of this.layers) {
      const drift = reduced || quality === 'low' ? 0 : p.parallax * 10;
      sprite.position.set(w * p.x + Math.sin(time * .12 + p.x) * drift, h * p.y + Math.cos(time * .09) * drift * .25);
      sprite.width = w * p.width; sprite.height = h * p.height; sprite.tint = tint;
      sprite.rotation = p.texture === 'foreground' && !reduced ? Math.sin(time * .6 + p.x) * .018 : 0;
    }
  }
}
