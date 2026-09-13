import { Container, Graphics, Sprite } from 'pixi.js';
import { animalArt } from './FarmArtRegistry';
import type { AnimalArtState } from './FarmArtRegistry';
import type { MobileAnimal, MobileRect } from './mobileTypes';
import type { MobileTextureBank } from './FarmMobileAssets';
import { label, sprite } from './FarmUiLayer';

type Bird = { image: Sprite; animal: MobileAnimal; index: number; x: number; y: number; selected: boolean };
/** Finite visual clips and bounded walking. Never writes animal state, food or timers. */
export class LivestockRenderer {
  private birds: Bird[] = [];
  private produced = new Map<string, number>();
  private eggCounts = new Map<string, number>();
  clear() { this.birds = []; }
  noteEggs(animals: readonly MobileAnimal[], clock: number) {
    for (const animal of animals) {
      const previous = this.eggCounts.get(animal.species);
      if (previous !== undefined && animal.storedEggs > previous) this.produced.set(animal.species, clock + 2.5);
      this.eggCounts.set(animal.species, animal.storedEggs);
    }
  }
  draw(parent: Container, badges: Container, bank: MobileTextureBank, animal: MobileAnimal, index: number, rect: MobileRect, selected: boolean) {
    const size = Math.min(rect.width - 6, (animal.species === 'ostrich' || animal.species === 'peafowl' ? 94 : animal.species === 'quail' ? 65 : 82) * (.72 + animal.scale * .28));
    const image = sprite(parent, bank.get(animalArt(animal.species)), { x: rect.x + (rect.width - size) / 2, y: rect.y, width: size, height: size }, .82);
    if (image) this.birds.push({ image, animal, index, x: image.x, y: image.y, selected });
    else label(badges, animal.title, rect.x + 4, rect.y + 25, rect.width - 8, 13);
    if (selected) {
      badges.addChild(new Graphics().ellipse(rect.x + rect.width / 2, rect.y + size * .82, size * .4, 8).stroke({ color: 0xffdfa0, width: 2 }));
      badges.addChild(new Graphics().roundRect(rect.x + 2, rect.y + 95, rect.width - 4, 40, 6).fill({ color: 0x223c31, alpha: .9 }));
      label(badges, `${animal.title} · ${animal.timer}\nTuổi thọ: ${animal.lifeRemaining}`, rect.x + 7, rect.y + 99, rect.width - 14, 10, 0xfff1cf, true);
    }
    if (animal.weak || animal.dead) {
      const g = badges.addChild(new Graphics()), x = rect.x + rect.width - 15, y = rect.y + 25;
      g.circle(x, y, 8).fill(0xa15d48).moveTo(x, y - 4).lineTo(x, y + 1).stroke({ color: 0xffe5b1, width: 2 }).circle(x, y + 4, 1).fill(0xffe5b1);
    }
  }
  tick(bank: MobileTextureBank, clock: number, reduced: boolean, night: boolean, feed: number) {
    for (const bird of this.birds) {
      const { animal, index } = bird, cycle = (clock + index * 2.7) % 30;
      // A closed route with real pauses: forage, water, then the shaded resting spot.
      const walking = cycle < 6 || cycle >= 11 && cycle < 17 || cycle >= 21 && cycle < 27;
      const state: AnimalArtState = animal.dead ? 'dead' : animal.weak ? 'weak'
        : (this.produced.get(animal.species) ?? 0) > clock ? 'produce_ready'
        : night ? 'rest' : reduced || bird.selected ? 'idle'
        : walking ? 'walk' : cycle < 11 && feed > 0 ? 'eat' : cycle >= 17 && cycle < 21 ? 'drink' : 'idle';
      const frame = reduced || ['dead', 'weak'].includes(state) ? 0 : Math.floor(clock * (state === 'walk' ? 7 : state === 'idle' || state === 'rest' ? 3 : 5)) % 6;
      const texture = bank.bird(animal.species, state, frame);
      if (texture) bird.image.texture = texture;
      const smooth = (t: number) => t * t * (3 - 2 * t);
      let dx = -18, dy = -5, facing = 1;
      if (cycle < 6) { const t = smooth(cycle / 6); dx = -18 + t * 36; dy = -5 + t * 17; }
      else if (cycle < 11) { dx = 18; dy = 12; }
      else if (cycle < 17) { const t = smooth((cycle - 11) / 6); dx = 18 - t * 34; dy = 12 + t * 14; facing = -1; }
      else if (cycle < 21) { dx = -16; dy = 26; facing = -1; }
      else if (cycle < 27) { const t = smooth((cycle - 21) / 6); dx = -16 - t * 2; dy = 26 - t * 31; facing = -1; }
      if (reduced || night || animal.dead || animal.weak || bird.selected) { dx = 0; dy = 0; facing = 1; }
      bird.image.scale.x = Math.abs(bird.image.scale.x) * facing;
      bird.image.position.set(bird.x + dx, bird.y + dy);
    }
  }
}
