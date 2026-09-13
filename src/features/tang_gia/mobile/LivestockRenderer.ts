import { Container, Graphics, Sprite } from 'pixi.js';
import { animalArt } from './FarmArtRegistry';
import { AnimalVisualAI } from './AnimalVisualAI';
import type { PenRoamArea } from './AnimalVisualAI';
import type { MobileAnimal, MobileHit } from './mobileTypes';
import type { MobileTextureBank } from './FarmMobileAssets';
import { label } from './FarmUiLayer';

type Bird = { root: Container; image: Sprite; badge: Container; animal: MobileAnimal; ai: AnimalVisualAI; hit: MobileHit; size: number; phase: number };
/** Persistent actors and tap regions share the exact same pen-local coordinates. */
export class LivestockRenderer {
  readonly root = new Container();
  private birds = new Map<string, Bird>();
  private produced = new Map<string, number>();
  private eggCounts = new Map<string, number>();
  private area: PenRoamArea = { x: 48, y: 145, width: 1, height: 1, troughX: 70, waterX: 160 };
  private viewport = 1;
  private origin = 0;
  constructor(parent: Container) { parent.addChild(this.root); this.root.sortableChildren = true; }
  sync(bank: MobileTextureBank, animals: readonly MobileAnimal[], width: number, extent: number,
    origin: number, viewport: number, selected: string | null, clock: number, select: (id: string) => void) {
    this.origin = origin; this.viewport = viewport;
    this.root.y = origin;
    this.area = { x: 54, y: 150, width: Math.max(1, width - 108), height: Math.max(1, extent - 295), troughX: 73, waterX: width / 2 };
    const ids = new Set(animals.map(animal => animal.id));
    for (const [id, bird] of this.birds) if (!ids.has(id)) { bird.root.destroy({ children: true }); this.birds.delete(id); }
    const hits: MobileHit[] = [];
    animals.forEach((animal, index) => {
      const previous = this.eggCounts.get(animal.species);
      if (previous !== undefined && animal.storedEggs > previous) this.produced.set(animal.species, clock + 2.5);
      this.eggCounts.set(animal.species, animal.storedEggs);
      let bird = this.birds.get(animal.id);
      if (!bird) {
        const root = this.root.addChild(new Container());
        const image = root.addChild(new Sprite()); image.anchor.set(.5, .82);
        bird = { root, image, badge: root.addChild(new Container()), animal, ai: new AnimalVisualAI(animal, this.area),
          size: 80, phase: index * 1.73, hit: { x: 0, y: 0, width: 64, height: 64, action: { id: `animal-${animal.id}`, label: '', run: () => select(animal.id) } } };
        this.birds.set(animal.id, bird);
      }
      bird.animal = animal; bird.ai.fit(this.area);
      bird.size = (animal.species === 'ostrich' || animal.species === 'peafowl' ? 92 : animal.species === 'quail' ? 66 : 82) * (.72 + animal.scale * .28);
      bird.hit.action = { id: `animal-${animal.id}`, label: `${animal.title}. ${animal.dead ? 'Đã chết' : animal.weak ? 'Thiếu ăn' : animal.timer}. Tuổi thọ ${animal.lifeRemaining}`, run: () => select(animal.id) };
      bird.badge.removeChildren().forEach(node => node.destroy({ children: true }));
      if (selected === animal.id) {
        bird.badge.addChild(new Graphics().ellipse(0, 0, bird.size * .34, 7).stroke({ color: 0xffeb91, width: 2.5 }));
        const badgeWidth = Math.min(138, width - 112);
        bird.badge.addChild(new Graphics().roundRect(-badgeWidth / 2, 9, badgeWidth, 37, 8).fill({ color: 0x173f2b, alpha: .94 }));
        const title = label(bird.badge, `${animal.title} · ${animal.timer}\nTuổi thọ: ${animal.lifeRemaining}`, -badgeWidth / 2 + 5, 12, badgeWidth - 10, 10, 0xfff6d9, true);
        title.style.align = 'center';
      }
      if (animal.weak || animal.dead) {
        bird.badge.addChild(new Graphics().circle(24, -42, 9).fill(0xc44b36));
        label(bird.badge, '!', 21, -50, 12, 13, 0xffffff, true);
      }
      const texture = bank.get(animalArt(animal.species));
      if (texture) bird.image.texture = texture;
      bird.image.visible = !!texture;
      if (!texture) label(bird.badge, animal.title, -30, -34, 60, 12, 0x173f2b, true);
      hits.push(bird.hit);
    });
    return hits;
  }
  tick(bank: MobileTextureBank, dt: number, clock: number, reduced: boolean, night: boolean, feed: number) {
    for (const bird of this.birds.values()) {
      const { animal, ai } = bird;
      let state = ai.tick(animal, this.area, dt, clock, reduced, night, feed);
      if (!animal.dead && !animal.weak && state !== 'walk' && (this.produced.get(animal.species) ?? 0) > clock) state = 'produce_ready';
      const frame = reduced || animal.dead ? 0 : Math.floor((clock + bird.phase) * (state === 'walk' ? 8 : state === 'rest' || state === 'weak' ? 2 : 4)) % 6;
      const texture = bank.bird(animal.species, state, frame);
      if (texture) { bird.image.texture = texture; bird.image.visible = true; }
      bird.image.scale.set(bird.size / 96 * ai.facing, bird.size / 96);
      bird.root.position.set(ai.x, ai.y); bird.root.zIndex = ai.y;
      bird.root.visible = this.origin + ai.y + 46 > 0 && this.origin + ai.y - bird.size < this.viewport;
      // Mutate the hit objects already held by input/semantics; no React update per frame.
      const top = Math.max(0, this.origin + ai.y - bird.size * .78);
      const bottom = Math.min(this.viewport, this.origin + ai.y + 12);
      bird.hit.x = ai.x - Math.max(48, bird.size * .8) / 2;
      bird.hit.y = top; bird.hit.width = Math.max(48, bird.size * .8);
      bird.hit.height = bottom - top >= 44 ? bottom - top : 0;
    }
  }
}
