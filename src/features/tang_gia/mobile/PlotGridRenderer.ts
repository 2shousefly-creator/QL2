import { Container, Graphics } from 'pixi.js';
import { cropArt, propArt, soilArt } from './FarmArtRegistry';
import type { SoilArtState } from './FarmArtRegistry';
import type { MobilePlot, MobileRect } from './mobileTypes';
import type { MobileTextureBank } from './FarmMobileAssets';
import { label, sprite } from './FarmUiLayer';

/** State composition is presentation only: tilled/selected/reset are never saved. */
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
    // On missing assets keep every plot visible, focusable and operable.
    parent.addChild(new Graphics().roundRect(rect.x + 8, rect.y + 16, rect.width - 16, rect.height - 30, 13).fill(plot.status === 'locked' ? 0x84955d : 0xad8057));
  }
  if (moist && plot.status !== 'locked') parent.addChild(new Graphics().roundRect(rect.x + 11, rect.y + 22, rect.width - 22, rect.height - 39, 13).fill({ color: 0x423b32, alpha: .12 + Math.min(100, plot.moisture) / 650 }));
  if (plot.fertilizer) {
    sprite(parent, bank.get(soilArt('fertilized')), patch);
  }
  let plant = null;
  if (plot.cropId) {
    plant = sprite(parent, bank.get(cropArt(plot.cropId, plot.artStage)), { x: rect.x + 7, y: rect.y - 5, width: rect.width - 14, height: rect.height - 8 }, .79);
    if (plant && pulse > 0) plant.scale.set(plant.scale.x * (1 + pulse * .07));
  }
  if (plot.status === 'ready') {
    badges.addChild(new Graphics().ellipse(rect.x + rect.width / 2, rect.y + rect.height * .79, rect.width * .37, 7).stroke({ color: 0xf4d783, width: 3, alpha: .8 }));
  }
  if (selected && !sprite(badges, bank.get(soilArt('selected')), patch)) badges.addChild(new Graphics().roundRect(rect.x + 8, rect.y + 18, rect.width - 16, rect.height - 33, 12).stroke({ color: 0xffe3a0, width: 2.5 }));
  const x = rect.x + rect.width - 24, y = rect.y + rect.height - 26;
  const icon = badges.addChild(new Graphics());
  if (plot.status === 'locked') {
    icon.roundRect(x - 5, y - 1, 12, 10, 2).fill(0xe8d6ac).roundRect(x - 3, y - 7, 8, 10, 4).stroke({ color: 0xe8d6ac, width: 2 });
  } else if (plot.status === 'ready') {
    icon.circle(x, y, 10).fill(0x4d7750).moveTo(x - 5, y).lineTo(x - 1, y + 4).lineTo(x + 6, y - 4).stroke({ color: 0xffecc2, width: 2 });
  } else if (plot.pest) {
    icon.ellipse(x, y, 4, 6).fill(0x9f5442);
    for (const side of [-1, 1]) for (const offset of [-3, 3]) icon.moveTo(x + side * 3, y + offset).lineTo(x + side * 8, y + offset * 2).stroke({ color: 0x864b39, width: 2 });
  } else if (plot.thirsty) sprite(badges, bank.get(propArt('drop')), { x: x - 11, y: y - 12, width: 22, height: 22 });
  else if (plot.status === 'empty') icon.moveTo(x - 4, y).lineTo(x + 4, y).moveTo(x, y - 4).lineTo(x, y + 4).stroke({ color: 0xe9d7b0, width: 2 });
  const number = label(badges, `${plot.index + 1}`, rect.x + 9, rect.y + rect.height - 26, 20, 11, 0xfff0cb, true);
  number.alpha = .9;
  if (selected) {
    const text = plot.status === 'locked' ? 'Chưa mở khóa' : plot.status === 'empty' ? plot.moistureLabel : `${plot.title} · ${plot.timer}`;
    const info = label(badges, text, rect.x + 5, rect.y + 4, rect.width - 10, 10, 0xfff2d5, true);
    badges.addChildAt(new Graphics().roundRect(rect.x + 1, rect.y + 2, rect.width - 2, info.height + 4, 6).fill({ color: 0x203c32, alpha: .92 }), badges.children.indexOf(info));
  }
  return plant;
}
