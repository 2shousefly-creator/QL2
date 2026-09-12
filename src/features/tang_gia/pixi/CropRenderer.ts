import { Container, Sprite, Texture } from 'pixi.js';
import type { CropAssetStage } from '../tangGiaAssetManifest';
import type { FarmWorldTextures } from './FarmWorldAssets';
import type { FarmPlotVisual } from './farmPixiTypes';
export type CropVisualProfile = { stageTextures: Record<CropAssetStage, string>; rootAnchor: [number, number]; baseScale: number; swayAmount: number; swaySpeed: number; leafLag: number; fruitBounce: number; harvestStyle: 'pull' | 'detach' };
const profile = (id: string, harvestStyle: 'pull' | 'detach'): CropVisualProfile => ({
  stageTextures: Object.fromEntries(['seed','sprout','young','mature'].map(s => [s, `crop.${id}.${s}`])) as Record<CropAssetStage, string>,
  rootAnchor: [.5, .95], baseScale: id === 'tomato' ? .82 : .76, swayAmount: .025,
  swaySpeed: id === 'tomato' ? .8 : 1.1, leafLag: .4, fruitBounce: id === 'tomato' ? .012 : .004, harvestStyle,
});
export const CROP_VISUAL_PROFILES = { carrot: profile('carrot', 'pull'), tomato: profile('tomato', 'detach') };
export class CropRenderer {
  readonly root = new Container(); private current = new Sprite(Texture.EMPTY); private previous = new Sprite(Texture.EMPTY);
  private key = ''; private blend = 1; private size = 48; private visual?: FarmPlotVisual; private impulse = 0;
  constructor(private textures: FarmWorldTextures, parent: Container) { parent.addChild(this.root); this.root.addChild(this.previous, this.current); }
  update(v: FarmPlotVisual, size: number, reduced: boolean) {
    this.visual = v; this.size = size; const key = v.cropId ? CROP_VISUAL_PROFILES[v.cropId].stageTextures[v.stage] : '';
    if (key !== this.key) {
      this.previous.texture = this.current.texture; this.previous.visible = !!this.key;
      this.current.texture = key ? this.textures.get(key)! : Texture.EMPTY;
      this.key = key; this.blend = reduced ? 1 : 0;
    }
    this.current.visible = !!key;
    if (reduced) this.blend = 1;
  }
  bounce() { this.impulse = 1; }
  tick(dt: number, time: number, reduced: boolean, tint: number) {
    this.blend = reduced ? 1 : Math.min(1, this.blend + dt / .4);
    this.impulse = Math.max(0, this.impulse - dt * 1.6);
    const v = this.visual, p = v?.cropId ? CROP_VISUAL_PROFILES[v.cropId] : CROP_VISUAL_PROFILES.carrot;
    for (const sprite of [this.previous, this.current]) {
      sprite.anchor.set(...p.rootAnchor); sprite.width = this.size * p.baseScale; sprite.height = this.size * p.baseScale;
      sprite.tint = v?.ready ? 0xfff2c9 : tint;
    }
    this.current.alpha = this.blend; this.previous.alpha = 1 - this.blend; this.previous.visible = this.previous.visible && this.blend < 1;
    const sway = reduced ? 0 : Math.sin(time * p.swaySpeed + (v?.index ?? 0) + p.leafLag) * p.swayAmount;
    this.root.rotation = sway;
    this.root.scale.set(1 + (reduced ? 0 : Math.sin(time * 2.2) * p.fruitBounce + Math.sin(this.impulse * Math.PI * 3) * this.impulse * .04));
  }
}
