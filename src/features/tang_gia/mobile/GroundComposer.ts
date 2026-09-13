import { Container, Graphics } from 'pixi.js';
import type { MobileTextureBank } from './FarmMobileAssets';
import type { FarmMobileTab, MobileRect } from './mobileTypes';
import { propArt } from './FarmArtRegistry';
import { sprite } from './FarmUiLayer';

/** Ground coordinates are CSS pixels from MobileLayoutController, never image cover.
 * Static geometry is retained across snapshot/HUD redraws; only viewport/tab changes rebuild it.
 */
export class GroundComposer {
  readonly root = new Container();
  private key = '';
  constructor(parent: Container) { parent.addChild(this.root); }
  draw(tab: FarmMobileTab, width: number, height: number, plots: readonly MobileRect[], bank: MobileTextureBank) {
    const key = `${tab}:${width}:${height}:${!!bank.get(propArt('bush'))}`;
    if (key === this.key) return;
    this.key = key;
    this.root.removeChildren().forEach(node => node.destroy({ children: true }));
    const g = this.root.addChild(new Graphics());
    g.rect(0, 0, width, height).fill(0x8da16b);
    // Low, scattered grass and trampled earth: nothing represents sky or horizon.
    for (let i = 0; i < 40; i++) {
      const x = i * 83 % width, y = i * 137 % height;
      g.ellipse(x, y, 18 + i % 5 * 9, 9 + i % 3 * 6).fill({ color: i % 2 ? 0xb1b97e : 0x6f8d59, alpha: .25 });
    }
    if (tab === 'garden') {
      const first = plots[0], last = plots[plots.length - 1];
      if (first && last) {
        // Shared earth bed joins all nine patches to the farm. Paths follow the real grid.
        g.roundRect(first.x - 9, first.y + 6, width - 2 * (first.x - 9), last.y + last.height - first.y - 2, 19).fill(0xb59d70);
        for (let row = 1; row < Math.ceil(plots.length / 3); row++) {
          const y = plots[row * 3]?.y;
          if (y !== undefined) g.rect(first.x - 8, y - 3, width - first.x * 2 + 16, 12).fill(0xc8b382);
        }
        g.moveTo(width / 2, last.y + last.height - 3).lineTo(width / 2, height).stroke({ width: 30, color: 0xc8b382 });
      }
    } else {
      g.roundRect(20, 26, width - 40, height - 52, 30).fill(0xc2ac7b);
      g.roundRect(29, 41, width - 58, height - 85, 26).fill(0xcdb88a);
      for (let i = 0; i < 25; i++) {
        const x = 37 + i * 79 % Math.max(1, width - 80), y = 105 + i * 51 % Math.max(1, height - 210);
        g.moveTo(x, y).lineTo(x + 6, y - 3).moveTo(x + 4, y + 4).lineTo(x + 12, y + 1).stroke({ color: 0xe6cd90, width: 1.5 });
      }
    }
    // Fence is a plan boundary, with a gate at the bottom and low vertical side rails.
    for (const x of [12, width - 12]) {
      g.moveTo(x + 2, 20).lineTo(x + 2, height - 20).stroke({ color: 0x68764c, width: 8, alpha: .3 });
      g.moveTo(x, 16).lineTo(x, height - 22).stroke({ color: 0xba9967, width: 5 });
      for (let y = 22; y < height - 12; y += 38) {
        g.roundRect(x - 4, y, 8, 14, 2).fill(0x9a7a50);
        g.roundRect(x - 4, y, 8, 7, 2).fill(0xd8bd86);
      }
    }
    for (const y of [19, height - 19]) {
      const segments = y === 19 ? [[12, width - 12]] : [[12, width / 2 - 26], [width / 2 + 26, width - 12]];
      for (const [left, right] of segments) {
        g.moveTo(left, y).lineTo(right, y).stroke({ color: 0xb29260, width: 5 });
        for (let x = left; x <= right; x += 36) g.roundRect(x - 4, y - 5, 8, 12, 2).fill(0xd4b47e);
      }
    }
    const place = (name: Parameters<typeof propArt>[0], x: number, y: number, size: number) => sprite(this.root, bank.get(propArt(name)), { x, y, width: size, height: size });
    place('bush', -20, -10, 66); place('bush', width - 49, -8, 65);
    place('flowers', width - 47, height - 67, 44); place('stone', 6, height - 67, 33);
    if (tab === 'garden') { place('watering', width / 2 + 30, height - 64, 46); place('hay', 30, 3, 38); }
    else { place('shelter', width / 2 - 64, 15, 128); place('hay', 26, 35, 53); place('hay', width - 78, 42, 48); }
  }
}
