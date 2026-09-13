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
    if (selected) badges.addChild(new Graphics().ellipse(rect.x + rect.width / 2, rect.y + size * .82, size * .4, 8).stroke({ color: 0xffdfa0, width: 2 }));
    if (animal.weak || animal.dead) {
      const g = badges.addChild(new Graphics()), x = rect.x + rect.width - 15, y = rect.y + 25;
      g.circle(x, y, 8).fill(0xa15d48).moveTo(x, y - 4).lineTo(x, y + 1).stroke({ color: 0xffe5b1, width: 2 }).circle(x, y + 4, 1).fill(0xffe5b1);
    }
  }
  tick(bank: MobileTextureBank, clock: number, reduced: boolean, night: boolean, feed: number) {
    for (const bird of this.birds) {
      const { animal, index } = bird, cycle = (clock + index * 2.7) % 24;
      const state: AnimalArtState = animal.dead ? 'dead' : animal.weak ? 'weak'
        : (this.produced.get(animal.species) ?? 0) > clock ? 'produce_ready'
        : night ? 'rest' : reduced || bird.selected ? 'idle'
        : cycle < 8 ? 'walk' : cycle < 13 && feed > 0 ? 'eat' : cycle < 17 ? 'drink' : 'idle';
      const frame = reduced || ['dead', 'weak', 'rest'].includes(state) ? 0 : Math.floor(clock * (state === 'walk' ? 7 : state === 'idle' ? 3 : 5)) % 6;
      const texture = bank.bird(animal.species, state, frame);
      if (texture) bird.image.texture = texture;
      // Motion stays inside the >= 76px hit cell; no drifting visual targets.
      bird.image.position.set(bird.x + (state === 'walk' ? Math.sin(cycle / 8 * Math.PI * 2) * 8 : 0), bird.y + (state === 'walk' ? Math.sin(cycle / 8 * Math.PI) * 3 : 0));
    }
  }
}
