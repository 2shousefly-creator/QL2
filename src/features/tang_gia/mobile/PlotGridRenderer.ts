import { Container, Graphics } from 'pixi.js';
import { cropArt, propArt, soilArt } from './FarmArtRegistry';
import type { SoilArtState } from './FarmArtRegistry';
import type { MobilePlot, MobileRect } from './mobileTypes';
import type { MobileTextureBank } from './FarmMobileAssets';
import { label, sprite } from './FarmUiLayer';

/** State composition is presentation only; all text uses the canonical projection. */
export function drawMobilePlot(parent: Container, badges: Container, bank: MobileTextureBank, plot: MobilePlot,
  rect: MobileRect, selected: boolean, reset: boolean, pulse: number) {
  const moist = plot.moisture >= 60;
  const state: SoilArtState = plot.status === 'locked' ? 'locked' : reset ? 'post_harvest_reset'
    : plot.status === 'empty' ? selected ? moist ? 'tilled_moist' : 'tilled_dry' : moist ? 'empty_moist' : 'empty_dry'
    : plot.artStage === 'seeded' ? moist ? 'seeded_moist' : 'seeded'
    : plot.status === 'ready' ? 'ready_to_harvest' : plot.artStage === 'mature' ? 'mature'
    : plot.artStage === 'growing' ? 'growing_stage_3' : plot.artStage === 'young' ? 'growing_stage_2' : 'growing_stage_1';
  const patch = { ...rect, y: rect.y + 3 };
  if (!sprite(parent, bank.get(soilArt(state)), patch)) {
    parent.addChild(new Graphics().roundRect(rect.x + 8, rect.y + 16, rect.width - 16, rect.height - 30, 13).fill(plot.status === 'locked' ? 0x77ac4b : 0xba754b));
  }
  if (moist && plot.status !== 'locked') parent.addChild(new Graphics().roundRect(rect.x + 11, rect.y + 22, rect.width - 22, rect.height - 39, 13).fill({ color: 0x602f20, alpha: .12 }));
  if (plot.fertilizer) sprite(parent, bank.get(soilArt('fertilized')), patch);
  const plant = plot.cropId ? sprite(parent, bank.get(cropArt(plot.cropId, plot.artStage)),
    { x: rect.x + 4, y: rect.y + 6, width: rect.width - 8, height: rect.height - 23 }, .79) : null;
  if (plant && pulse > 0) plant.scale.set(plant.scale.x * (1 + pulse * .07));
  if (selected && !sprite(badges, bank.get(soilArt('selected')), patch)) badges.addChild(new Graphics().roundRect(rect.x + 8, rect.y + 18, rect.width - 16, rect.height - 33, 12).stroke({ color: 0xffe3a0, width: 2.5 }));

  const g = badges.addChild(new Graphics());
  const centerText = (text: string, y: number, size: number, color = 0xfff8e5, mono = false) => {
    const node = label(badges, text, rect.x + 4, y, rect.width - 8, size, color, true);
    node.style.wordWrap = false;
    if (mono) node.style.fontFamily = 'ui-monospace, SFMono-Regular, monospace';
    if (node.width > rect.width - 8) node.scale.set((rect.width - 8) / node.width);
    node.x = rect.x + (rect.width - node.width) / 2;
    return node;
  };
  if (plot.cropId) {
    const ready = plot.status === 'ready';
    g.roundRect(rect.x + 3, rect.y + 1, rect.width - 6, 18, 7).fill({ color: ready ? 0x297d35 : 0x243e2c, alpha: .94 });
    centerText(ready ? 'THU HOẠCH' : plot.timer, rect.y + 2, 11, ready ? 0xffed9a : 0xffffff, !ready);
    g.roundRect(rect.x + 1, rect.y + rect.height - 31, rect.width - 2, 30, 7).fill({ color: 0x263d29, alpha: .9 });
    centerText(plot.title, rect.y + rect.height - 31, 12);
  } else if (plot.status === 'locked') {
    const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2 - 8;
    g.roundRect(x - 7, y, 14, 12, 3).fill(0xffefbc).roundRect(x - 5, y - 8, 10, 13, 5).stroke({ color: 0xffefbc, width: 2 });
    g.roundRect(rect.x + 3, rect.y + rect.height - 25, rect.width - 6, 22, 6).fill({ color: 0x294d30, alpha: .9 });
    centerText('Chưa mở khóa', rect.y + rect.height - 23, 11);
  } else {
    g.roundRect(rect.x + 4, rect.y + rect.height - 43, rect.width - 8, 42, 7).fill({ color: 0x3b4927, alpha: .82 });
    centerText('Trống · Gieo hạt', rect.y + rect.height - 40, 11);
  }
  if (plot.status !== 'locked') {
    const moisture = Math.round(Math.max(0, Math.min(100, plot.moisture)));
    const x = rect.x + 17, y = rect.y + rect.height - 10, bar = Math.max(12, rect.width - 56);
    const color = moisture < 30 ? 0xff9457 : moisture < 60 ? 0xffd567 : 0x56d8f3;
    sprite(badges, bank.get(propArt('drop')), { x: rect.x + 3, y: y - 8, width: 15, height: 16 });
    g.roundRect(x, y - 2, bar, 4, 2).fill(0x667557);
    if (moisture > 0) g.roundRect(x, y - 2, Math.max(2, bar * moisture / 100), 4, 2).fill(color);
    label(badges, `${moisture}%`, x + bar + 4, y - 7, 33, 10, 0xffffff, true);
  }
  // Number and secondary statuses stay out of the timer/name/moisture bands.
  g.circle(rect.x + 11, rect.y + 30, 8).fill({ color: 0x395a2e, alpha: .85 });
  label(badges, `${plot.index + 1}`, rect.x + 7, rect.y + 23, 15, 10, 0xfff4cb, true);
  if (plot.pest) {
    const x = rect.x + rect.width - 12, y = rect.y + 31;
    g.circle(x, y, 9).fill(0xffd49a).ellipse(x, y, 3, 5).fill(0xa23b31);
    for (const side of [-1, 1]) for (const offset of [-2, 2]) g.moveTo(x + side * 2, y + offset).lineTo(x + side * 6, y + offset * 2).stroke({ color: 0xa23b31, width: 1.5 });
  }
  if (plot.fertilizer) {
    const x = rect.x + rect.width - 12, y = rect.y + (plot.pest ? 51 : 31);
    g.circle(x, y, 8).fill(0x41974a).poly([x, y - 5, x + 2, y - 1, x + 5, y, x + 1, y + 2, x, y + 5, x - 2, y + 1, x - 5, y, x - 1, y - 2]).fill(0xffe595);
  }
  return plant;
}
