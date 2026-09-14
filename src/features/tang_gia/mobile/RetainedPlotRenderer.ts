import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { cropArt, soilArt } from './FarmArtRegistry';
import type { SoilArtState } from './FarmArtRegistry';
import type { MobilePlot, MobileRect } from './mobileTypes';
import type { MobileTextureBank } from './FarmMobileAssets';

/** Center glyphs independently of adjacent icons, without a background capsule. */
export function worldText(parent: Container, size: number, color = 0xffffff) {
  const text = parent.addChild(new Text({ text: '', style: {
    fontFamily: 'system-ui, sans-serif', fontSize: size, fontWeight: '600', fill: color,
    stroke: { color: 0x284c32, width: 2.5 }, lineHeight: size * 1.25,
  } }));
  text.anchor.set(.5, 0);
  return text;
}

/** A timer tick changes Text.text and bar scale only; all display objects survive. */
export class RetainedPlotRenderer {
  readonly root = new Container();
  readonly hud = new Container();
  private soil = this.root.addChild(new Sprite(Texture.EMPTY));
  private fallback = this.root.addChild(new Graphics());
  private fertilizer = this.root.addChild(new Sprite(Texture.EMPTY));
  private crop = this.root.addChild(new Sprite(Texture.EMPTY));
  private selected = this.hud.addChild(new Graphics());
  private timer = worldText(this.hud, 11);
  private title = worldText(this.hud, 12, 0xfff9d7);
  private number = worldText(this.hud, 10);
  private status = worldText(this.hud, 12, 0xffea85);
  private moistureTrack = this.hud.addChild(new Graphics());
  private moistureFill = this.hud.addChild(new Graphics());
  private moisture = worldText(this.hud, 10);
  private plot?: MobilePlot;
  private rect?: MobileRect;
  private cropFrame = '';
  constructor(parent: Container, hudParent: Container) { parent.addChild(this.root); hudParent.addChild(this.hud); }
  sync(bank: MobileTextureBank, plot: MobilePlot, rect: MobileRect, selected: boolean, reset: boolean) {
    this.root.position.set(rect.x, rect.y); this.hud.position.copyFrom(this.root.position);
    const w = rect.width, h = rect.height;
    if (!this.rect || this.rect.width !== w || this.rect.height !== h) {
      this.rect = rect;
      this.fallback.clear().roundRect(8, 19, w - 16, h - 30, 13).fill(0xc87d48);
      for (const image of [this.soil, this.fertilizer]) { image.position.set(0, 3); image.width = w; image.height = h; }
      this.crop.anchor.set(.5, .79); this.crop.position.set(w / 2, 6 + (h - 23) * .79);
      this.selected.clear().roundRect(8, 19, w - 16, h - 32, 12).stroke({ color: 0xfff0a1, width: 2.5 });
      this.timer.position.set(w / 2, 1); this.title.position.set(w / 2, h - 32);
      this.number.position.set(12, 27); this.status.position.set(w - 15, 27);
      this.moistureTrack.clear().roundRect(18, h - 11, w - 53, 5, 2.5).fill(0x305744);
      this.moistureFill.clear().roundRect(0, 0, w - 53, 5, 2.5).fill(0xffffff);
      this.moistureFill.position.set(18, h - 11); this.moisture.position.set(w - 17, h - 17);
      this.cropFrame = '';
    }
    const moist = plot.moisture >= 60;
    const state: SoilArtState = plot.status === 'locked' ? 'locked' : reset ? 'post_harvest_reset'
      : plot.status === 'empty' ? selected ? moist ? 'tilled_moist' : 'tilled_dry' : moist ? 'empty_moist' : 'empty_dry'
      : plot.artStage === 'seeded' ? moist ? 'seeded_moist' : 'seeded'
      : plot.status === 'ready' ? 'ready_to_harvest' : plot.artStage === 'mature' ? 'mature'
      : plot.artStage === 'growing' ? 'growing_stage_3' : plot.artStage === 'young' ? 'growing_stage_2' : 'growing_stage_1';
    const texture = bank.get(soilArt(state));
    if (texture && this.soil.texture !== texture) { this.soil.texture = texture; this.soil.width = w; this.soil.height = h; }
    this.soil.visible = !!texture; this.fallback.visible = !texture;
    const fertile = bank.get(soilArt('fertilized'));
    if (fertile && this.fertilizer.texture !== fertile) { this.fertilizer.texture = fertile; this.fertilizer.width = w; this.fertilizer.height = h; }
    this.fertilizer.visible = plot.fertilizer && !!fertile;
    this.selected.visible = selected;
    this.timer.text = plot.status === 'ready' ? 'THU HOẠCH' : plot.timer;
    this.timer.tint = plot.status === 'ready' ? 0xffee80 : 0xffffff;
    const title = plot.cropId ? plot.title : plot.status === 'locked' ? 'Chưa mở khóa' : 'Trống · Gieo hạt';
    if (this.title.text !== title) { this.title.text = title; this.title.scale.set(1); }
    if (this.title.width > w - 6) this.title.scale.set(this.title.scale.x * (w - 6) / this.title.width);
    this.number.text = String(plot.index + 1);
    this.status.text = [plot.pest ? '🐞' : '', plot.fertilizer ? '✦' : ''].join('');
    const moisture = Math.round(Math.max(0, Math.min(100, plot.moisture)));
    this.moisture.text = `${moisture}%`;
    this.moistureFill.tint = moisture < 30 ? 0xff9457 : moisture < 60 ? 0xffd567 : 0x56d8f3;
    this.moistureFill.scale.x = moisture / 100;
    for (const node of [this.moisture, this.moistureFill, this.moistureTrack]) node.visible = plot.status !== 'locked';
    if (this.plot?.cropId !== plot.cropId || this.plot?.artStage !== plot.artStage) this.cropFrame = '';
    this.plot = plot;
  }
  tick(bank: MobileTextureBank, clock: number, reduced: boolean) {
    const plot = this.plot, rect = this.rect;
    if (!plot || !rect || !plot.cropId) { this.crop.visible = false; return; }
    const phase = plot.index * 1.73 + plot.cropId.length * .37;
    const frame = reduced || plot.artStage === 'seeded' ? 0 : Math.floor(clock * 4 + phase) % 6;
    const key = cropArt(plot.cropId, plot.artStage, frame);
    if (this.cropFrame !== key || !this.crop.visible) {
      const texture = bank.get(key); this.crop.visible = !!texture;
      if (texture) {
        if (this.crop.texture !== texture) this.crop.texture = texture;
        this.crop.scale.set(Math.min((rect.width - 8) / 96, (rect.height - 23) / 96));
        this.cropFrame = key;
      }
    }
  }
  destroy() { this.root.destroy({ children: true }); this.hud.destroy({ children: true }); }
}
