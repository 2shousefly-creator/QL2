import { Container, Graphics, Sprite } from 'pixi.js';
import { AnimalVisualAI } from './AnimalVisualAI';
import type { PenRoamArea } from './AnimalVisualAI';
import type { MobileAnimal, MobileHit } from './mobileTypes';
import type { MobileTextureBank } from './FarmMobileAssets';
import { worldText } from './RetainedPlotRenderer';
import type { Text } from 'pixi.js';
import { penFeedingAnchors } from './PenPropsRenderer';

type Bird = { root: Container; hud: Container; image: Sprite; badge: Container; animal: MobileAnimal; ai: AnimalVisualAI; hit: MobileHit; size: number; phase: number; title: Text; timer: Text; icons: Text; life: Graphics; selection: Graphics; frameKey: string };
/** Persistent actors and tap regions share the exact same pen-local coordinates. */
export class LivestockRenderer {
  readonly root = new Container();
  readonly hud = new Container();
  private birds = new Map<string, Bird>();
  private produced = new Map<string, number>();
  private eggCounts = new Map<string, number>();
  private area: PenRoamArea = { x: 82, y: 242, width: 1, height: 1, ...penFeedingAnchors(320) };
  private viewport = 1;
  private origin = 0;
  constructor(parent: Container, hudParent: Container) { parent.addChild(this.root); hudParent.addChild(this.hud); this.root.sortableChildren = true; this.hud.sortableChildren = true; }
  sync(bank: MobileTextureBank, animals: readonly MobileAnimal[], width: number, extent: number,
    origin: number, viewport: number, selected: string | null, clock: number, select: (id: string) => void) {
    this.origin = origin; this.viewport = viewport;
    this.root.y = origin;
    this.area = { x: 82, y: 242, width: Math.max(1, width - 164), height: Math.max(1, extent - 315), ...penFeedingAnchors(width) };
    const ids = new Set(animals.map(animal => animal.id));
    for (const [id, bird] of this.birds) if (!ids.has(id)) { bird.root.destroy({ children: true }); bird.hud.destroy({ children: true }); this.birds.delete(id); }
    const hits: MobileHit[] = [];
    animals.forEach((animal, index) => {
      const previous = this.eggCounts.get(animal.species);
      if (previous !== undefined && animal.storedEggs > previous) this.produced.set(animal.species, clock + 2.5);
      this.eggCounts.set(animal.species, animal.storedEggs);
      let bird = this.birds.get(animal.id);
      if (!bird) {
        const root = this.root.addChild(new Container());
        const hud = this.hud.addChild(new Container());
        const image = root.addChild(new Sprite()); image.anchor.set(.5, .82);
        bird = { root, hud, image, badge: hud.addChild(new Container()), animal, ai: new AnimalVisualAI(animal, this.area),
          size: 80, phase: index * 1.73, title: worldText(hud, 11), timer: worldText(hud, 11), icons: worldText(hud, 11),
          life: hud.addChild(new Graphics().roundRect(-23, 0, 46, 5, 2.5).fill(0xffffff)),
          selection: root.addChild(new Graphics().ellipse(0, 0, 30, 7).stroke({ color: 0xffeb91, width: 2.5 })), frameKey: '', hit: { x: 0, y: 0, width: 64, height: 64, action: { id: `animal-${animal.id}`, label: '', run: () => select(animal.id) } } };
        bird.badge.addChild(new Graphics().roundRect(-25, 0, 50, 7, 3.5).fill(0x344b45).stroke({ color: 0xfff5cc, width: 1 }));
        this.birds.set(animal.id, bird);
      }
      bird.animal = animal; bird.ai.fit(this.area);
      bird.size = (animal.species === 'ostrich' || animal.species === 'peafowl' ? 92 : animal.species === 'quail' ? 66 : 82) * (.72 + animal.scale * .28);
      bird.hit.action = { id: `animal-${animal.id}`, label: `${animal.title}. ${animal.dead ? 'Đã chết' : animal.weak ? 'Thiếu ăn' : animal.timer}. Tuổi thọ ${animal.lifeRemaining}`, run: () => select(animal.id) };
      bird.selection.visible = selected === animal.id;
      bird.title.text = animal.title; bird.title.position.set(0, 10);
      bird.timer.text = animal.dead ? 'Đã chết' : animal.timer; bird.timer.position.set(0, 25);
      bird.timer.style.fontFamily = 'ui-monospace, SFMono-Regular, monospace';
      // Numeric glyphs stay centered at x=0. Icon width never shifts the countdown.
      bird.icons.anchor.set(1, 0); bird.icons.position.set(-bird.timer.width / 2 - 3, 25);
      bird.icons.visible = !animal.dead;
      const ratio = animal.lifeRatio;
      bird.life.tint = animal.dead ? 0x62616a : ratio >= .6 ? 0x55dc6c : ratio >= .4 ? 0xffd85c : ratio >= .2 ? 0xff973f : 0xf35855;
      bird.life.scale.x = ratio;
      bird.life.position.set(-23 * (1 - ratio), -bird.size * .82 - 7);
      bird.badge.y = -bird.size * .82 - 8;
      hits.push(bird.hit);
    });
    return hits;
  }
  scroll(origin: number, viewport: number, worldOrigin: number) { this.origin = origin; this.viewport = viewport; this.root.y = worldOrigin; this.hud.y = worldOrigin; }
  tick(bank: MobileTextureBank, dt: number, clock: number, reduced: boolean, night: boolean, feed: number) {
    for (const bird of this.birds.values()) {
      const { animal, ai } = bird;
      let state = ai.tick(animal, this.area, dt, clock, reduced, night, feed);
      if (!animal.dead && !animal.weak && state !== 'walk' && (this.produced.get(animal.species) ?? 0) > clock) state = 'produce_ready';
      const frame = reduced || animal.dead ? 0 : Math.floor((clock + bird.phase) * (state === 'walk' ? 8 : state === 'rest' || state === 'weak' ? 2 : 4)) % 6;
      const key = `${animal.species}:${state}:${frame}`;
      if (bird.frameKey !== key || !bird.image.visible) {
        const texture = bank.bird(animal.species, state, frame);
        bird.image.visible = !!texture;
        if (texture) { if (bird.image.texture !== texture) bird.image.texture = texture; bird.frameKey = key; }
      }
      bird.icons.text = feed > 0 ? '⚡🥚' : '🥚';
      bird.life.alpha = !reduced && !animal.dead && animal.lifeRatio < .1 ? .7 + Math.sin(clock * 3 + bird.phase) * .3 : 1;
      bird.image.scale.set(bird.size / 96 * ai.facing, bird.size / 96);
      bird.root.position.set(ai.x, ai.y); bird.root.zIndex = ai.y;
      bird.hud.position.copyFrom(bird.root.position); bird.hud.zIndex = ai.y;
      bird.root.visible = this.origin + ai.y + 46 > 0 && this.origin + ai.y - bird.size < this.viewport;
      bird.hud.visible = bird.root.visible;
      // Mutate the hit objects already held by input/semantics; no React update per frame.
      const top = Math.max(0, this.origin + ai.y - bird.size * .78);
      const bottom = Math.min(this.viewport, this.origin + ai.y + 12);
      bird.hit.x = ai.x - Math.max(48, bird.size * .8) / 2;
      bird.hit.y = top; bird.hit.width = Math.max(48, bird.size * .8);
      bird.hit.height = bottom - top >= 44 ? bottom - top : 0;
    }
  }
}
