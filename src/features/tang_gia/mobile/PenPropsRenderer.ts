import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { itemArt, propArt } from './FarmArtRegistry';
import { worldText } from './RetainedPlotRenderer';
import type { MobileTextureBank } from './FarmMobileAssets';
import type { FarmMobileSnapshot, MobileHit } from './mobileTypes';

/** One shared layout for art, input, FX and the upper edge of the roaming area. */
export const PEN_PROPS_Y = 139;
export function penFeedingAnchors(width: number) {
  const size = Math.min(84, (width - 64) / 3);
  // Peck frames put the beak about 14 pixels above the foot origin.
  return { troughX: 72, waterX: width / 2, troughY: PEN_PROPS_Y + size * .36 + 14,
    waterY: PEN_PROPS_Y + size * .46 + 14 };
}
export class PenPropsRenderer {
  readonly root = new Container();
  readonly hud = new Container();
  private images = ['trough', 'water', 'nest'].map(() => this.root.addChild(new Sprite(Texture.EMPTY)));
  private grain = this.root.addChild(new Graphics());
  private eggs = Array.from({ length: 3 }, () => this.root.addChild(new Sprite(Texture.EMPTY)));
  private feedLabel = worldText(this.hud, 10);
  private eggLabel = worldText(this.hud, 11);
  private track = this.hud.addChild(new Graphics());
  private fill = this.hud.addChild(new Graphics());
  private empty = worldText(this.hud, 13);
  private geometry = '';
  private grainCount = -1;
  constructor(parent: Container, hudParent: Container) { parent.addChild(this.root); hudParent.addChild(this.hud); }
  sync(bank: MobileTextureBank, s: FarmMobileSnapshot, width: number) {
    const y = PEN_PROPS_Y, size = Math.min(84, (width - 64) / 3);
    const centers = [72, width / 2, width - 72];
    const key = `${width}`;
    const resized = key !== this.geometry;
    if (resized) {
      this.geometry = key;
      this.track.clear().roundRect(39, y + 61, 66, 7, 3.5).fill(0x344b45).stroke({ color: 0xfff2bd, width: 1 });
      this.fill.clear().roundRect(0, 0, 62, 5, 2.5).fill(0xffffff); this.fill.position.set(41, y + 62);
      this.feedLabel.position.set(72, y + 72); this.eggLabel.position.set(width - 72, y + 66);
      this.empty.position.set(width / 2, y + 118);
    }
    (['trough', 'water', 'nest'] as const).forEach((name, i) => {
      const image = this.images[i], texture = bank.get(propArt(name));
      image.visible = !!texture;
      if (texture && image.texture !== texture) image.texture = texture;
      image.position.set(centers[i] - size / 2, y); image.width = size; image.height = size;
    });
    const grainCount = Math.ceil(s.feed / 5);
    if (grainCount !== this.grainCount || resized) {
      this.grainCount = grainCount; this.grain.clear();
      for (let i = 0; i < grainCount; i++) this.grain.ellipse(51 + i * 11 % 42, y + size * .36 + i * 7 % 6, 2, 1.4).fill(i % 2 ? 0xffdf67 : 0xe8b23b);
    }
    const species = s.animals.find(a => a.storedEggs > 0)?.species ?? 'chicken';
    const egg = bank.get(itemArt(`${species}_egg`));
    this.eggs.forEach((image, i) => {
      image.visible = !!egg && i < s.eggs;
      if (egg && image.texture !== egg) image.texture = egg;
      image.position.set(width - 95 + i * 12, y + 21); image.width = 27; image.height = 30;
    });
    const danger = s.feed <= 0 && s.dangerRemaining !== null && s.animals.some(a => !a.dead);
    this.fill.scale.x = Math.max(0, Math.min(1, danger ? s.dangerRatio : s.feed / 100));
    this.fill.tint = danger ? 0xf45c4d : 0x66df68;
    this.feedLabel.text = danger ? `Nguy hiểm · ${s.dangerRemaining}` : s.feed > 0 ? `Thức ăn ${s.feedLabel}` : 'Hết thức ăn';
    this.feedLabel.style.fill = danger ? 0xff9e81 : 0xfff8d5;
    this.feedLabel.scale.set(1); if (this.feedLabel.width > 110) this.feedLabel.scale.set(110 / this.feedLabel.width);
    this.eggLabel.text = `${s.eggs} trứng`;
    this.empty.text = s.animals.length ? '' : 'Chạm chuồng để thả vật nuôi';
  }
  hits(width: number, trough: () => void, pen: () => void, eggs: () => void): MobileHit[] {
    return [
      { x: 28, y: PEN_PROPS_Y, width: 88, height: 94, action: { id: 'trough', label: 'Máng ăn · Nạp Thức Ăn', run: trough } },
      { x: width / 2 - 40, y: PEN_PROPS_Y, width: 80, height: 80, action: { id: 'water-basin', label: 'Máng nước', run: pen } },
      { x: width - 116, y: PEN_PROPS_Y, width: 88, height: 90, action: { id: 'nest', label: 'Tổ trứng · Mở kho trứng', run: eggs } },
      { x: width / 2 - 64, y: 26, width: 128, height: 85, action: { id: 'shelter', label: 'Chuồng nuôi', run: pen } },
    ];
  }
}
