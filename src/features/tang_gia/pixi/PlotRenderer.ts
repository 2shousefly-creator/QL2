import { Container, Graphics, Sprite } from 'pixi.js';
import { CropRenderer } from './CropRenderer';
import type { FarmWorldTextures } from './FarmWorldAssets';
import type { FarmAnchor, FarmPlotVisual } from './farmPixiTypes';
export class PlotRenderer {
  readonly root = new Container(); private views = new Map<number, { root: Container; soil: Sprite; wet: Sprite; nutrient: Sprite; shadow: Sprite; crop: CropRenderer; pest: Sprite; ready: Sprite; ring: Graphics; v: FarmPlotVisual; anchor: FarmAnchor }>();
  constructor(private textures: FarmWorldTextures, parent: Container) { parent.addChild(this.root); }
  update(plots: readonly FarmPlotVisual[], anchors: Readonly<Record<number, FarmAnchor>>, selected: number | null, reduced: boolean) {
    const active = new Set(plots.map(p => p.index));
    for (const [id, view] of this.views) if (!active.has(id)) { view.root.destroy({ children: true }); this.views.delete(id); }
    for (const v of plots) {
      const anchor = anchors[v.index]; if (!anchor) continue;
      let view = this.views.get(v.index);
      if (!view) {
        const root = this.root.addChild(new Container());
        const sprite = (key: string) => { const s = root.addChild(new Sprite(this.textures.get(key)!)); s.anchor.set(.5); return s; };
        const shadow = sprite('vfx.light'); shadow.tint = 0x253820; shadow.blendMode = 'multiply';
        const soil = sprite('soil.empty'), wet = sprite('vfx.ripple'), nutrient = sprite('vfx.fertilizer');
        const crop = new CropRenderer(this.textures, root); const pest = sprite('vfx.pest'), ready = sprite('vfx.light');
        const ring = root.addChild(new Graphics());
        view = { root, soil, wet, nutrient, shadow, crop, pest, ready, ring, v, anchor }; this.views.set(v.index, view);
      }
      view.v = v; view.anchor = anchor; view.root.position.set(anchor.x, anchor.y);
      view.soil.texture = this.textures.get(`soil.${!v.cropId ? 'empty' : v.moisture < 20 ? 'need_water' : 'planted'}`)!;
      view.soil.width = anchor.width; view.soil.height = anchor.height;
      view.shadow.width = anchor.width * .9; view.shadow.height = anchor.height * .3; view.shadow.y = anchor.height * .24; view.shadow.alpha = .45;
      view.wet.width = anchor.width * .55; view.wet.height = anchor.height * .22; view.wet.y = anchor.height * .2; view.wet.alpha = v.moisture >= 60 ? .2 : 0;
      view.nutrient.width = anchor.width * .7; view.nutrient.height = anchor.height * .23; view.nutrient.y = anchor.height * .19; view.nutrient.tint = 0xc5d889; view.nutrient.alpha = v.fertilizer ? .16 : 0;
      view.crop.root.y = anchor.height * .17; view.crop.update(v, anchor.width, reduced);
      view.pest.visible = v.pest; view.pest.width = 14; view.pest.height = 10;
      view.ready.width = 18; view.ready.height = 18; view.ready.blendMode = 'add'; view.ready.visible = v.ready;
      view.ring.clear(); if (selected === v.index) view.ring.ellipse(0, anchor.height * .2, anchor.width * .4, anchor.height * .2).stroke({ color: 0xffdfa0, width: 1.5, alpha: .65 });
    }
  }
  bounce(index: number) { this.views.get(index)?.crop.bounce(); }
  tick(dt: number, time: number, reduced: boolean, tint: number) {
    for (const [i, view] of this.views) {
      view.soil.tint = view.v.moisture >= 60 ? 0xb6b9b2 : tint;
      view.crop.tick(dt, time, reduced, tint);
      view.pest.position.set(Math.sin((reduced ? 0 : time) * .9 + i) * view.anchor.width * .15, -view.anchor.height * .14);
      view.pest.rotation = reduced ? 0 : Math.sin(time * 2 + i) * .12;
      view.ready.position.set(view.anchor.width * .17, -view.anchor.height * .23);
      view.ready.alpha = reduced ? .5 : .35 + .2 * Math.sin(time * 1.8 + i);
    }
  }
}
