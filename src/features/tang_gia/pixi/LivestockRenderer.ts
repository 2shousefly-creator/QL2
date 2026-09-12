import { Container, Graphics, Sprite } from 'pixi.js';
import { AnimalVisualAI, PEN_POIS } from './AnimalVisualAI';
import type { FarmWorldTextures } from './FarmWorldAssets';
import type { FarmAnchor, FarmAnimalVisual, FarmPixiVisualProps } from './farmPixiTypes';
export class LivestockRenderer {
  readonly root = new Container(); private floor: Sprite; private back: Sprite; private front: Sprite;
  private sorted = new Container(); private actors = new Map<string, { root: Container; sprite: Sprite; shadow: Sprite; selected: Graphics; ai: AnimalVisualAI; visual: FarmAnimalVisual; clock: number }>();
  private props: { sprite: Sprite; x: number; y: number; width: number; height: number }[] = [];
  private trough: Sprite; private food: Sprite; private eggs: Sprite[] = [];
  private anchor?: FarmAnchor;
  constructor(private textures: FarmWorldTextures, parent: Container) {
    parent.addChild(this.root); this.root.sortableChildren = true;
    const make = (key: string, root = this.root) => { const s = root.addChild(new Sprite(textures.get(key)!)); s.anchor.set(.5, .85); return s; };
    this.floor = make('pen.ground'); this.floor.anchor.set(.5); this.floor.zIndex = -2;
    this.back = make('pen.fence'); this.back.zIndex = -1;
    this.root.addChild(this.sorted); this.sorted.sortableChildren = true;
    this.front = make('pen.fence'); this.front.zIndex = 2;
    for (const p of [
      { key: 'shelter', x: .25, y: .44, width: .35, height: .42 },
      { key: 'water', x: .76, y: .69, width: .26, height: .16 },
      { key: 'nest', x: .82, y: .44, width: .17, height: .13 },
    ]) this.props.push({ ...p, sprite: make(`pen.${p.key}`, this.sorted) });
    this.trough = make('pen.trough', this.sorted);
    // Empty trough and grain are independent authored textures, driven by real feed.
    this.food = make('pen.grain', this.sorted); this.food.anchor.set(.5);
    for (let i = 0; i < 3; i++) this.eggs.push(make('pen.egg', this.sorted));
  }
  update(props: FarmPixiVisualProps) {
    this.anchor = props.penAnchor; this.root.visible = !!this.anchor;
    const ids = new Set(props.animals.map(a => a.id));
    for (const [id, actor] of this.actors) if (!ids.has(id)) { actor.root.destroy({ children: true }); this.actors.delete(id); }
    for (const animal of props.animals) {
      let actor = this.actors.get(animal.id);
      if (!actor) {
        const root = this.sorted.addChild(new Container());
        const shadow = root.addChild(new Sprite(this.textures.get('vfx.light')!)); shadow.anchor.set(.5); shadow.blendMode = 'multiply'; shadow.tint = 0x273128;
        const sprite = root.addChild(new Sprite(this.textures.get(`animal.${animal.species}.0.0`)!)); sprite.anchor.set(.5, .86);
        const selected = root.addChild(new Graphics());
        actor = { root, shadow, sprite, selected, ai: new AnimalVisualAI(animal.id, animal.cycle), visual: animal, clock: 0 }; this.actors.set(animal.id, actor);
      }
      actor.visual = animal; actor.selected.clear();
      if (props.selectedAnimalId === animal.id) actor.selected.ellipse(0, 0, 22, 7).stroke({ color: 0xffdf9b, width: 1.5 });
    }
    if (!this.anchor) return;
    const a = this.anchor, w = a.width, h = a.height; this.root.position.set(a.x - w / 2, a.y - h / 2);
    this.floor.position.set(w * .5, h * .6); this.floor.width = w * .96; this.floor.height = h * .75;
    for (const [fence, y] of [[this.back, .4], [this.front, .91]] as const) { fence.position.set(w * .5, h * y); fence.width = w * .96; fence.height = h * .19; }
    for (const p of this.props) { p.sprite.position.set(w * p.x, h * p.y); p.sprite.width = w * p.width; p.sprite.height = h * p.height; p.sprite.zIndex = p.y * h; }
    this.trough.position.set(w * PEN_POIS.trough.x, h * .72); this.trough.width = w * .26; this.trough.height = h * .16; this.trough.zIndex = h * .72;
    this.food.position.set(w * PEN_POIS.trough.x, h * .65); this.food.width = w * .2; this.food.height = h * .045; this.food.zIndex = h * .72 + 1; this.food.alpha = props.feed > 0 ? 1 : 0; this.food.width *= Math.min(1, Math.max(0, props.feed) / 100) * .65 + .35;
    this.eggs.forEach((egg, i) => { egg.visible = props.eggCount > i; egg.position.set(w * (.81 + i * .025), h * (.44 + i * .025)); egg.width = w * .09; egg.height = h * .085; egg.zIndex = h * .48 + i; });
  }
  tick(dt: number, props: FarmPixiVisualProps, reduced: boolean, tint: number) {
    if (!this.anchor) return;
    const { width: w, height: h } = this.anchor;
    for (const actor of this.actors.values()) {
      const v = actor.visual; actor.ai.tick(dt, v, props.feed, props.starving, props.phase === 'night', props.weather === 'rain', reduced);
      const ai = actor.ai; actor.clock += dt;
      const row = ai.behavior === 'wander' ? 1 : ['peck','eat','scratch'].includes(ai.behavior) ? 2 : ai.behavior === 'drink' ? 3 : 0;
      const still = reduced || ['sleep','rest','dead','weak','layEgg'].includes(ai.behavior);
      const column = still ? 0 : Math.floor(actor.clock * (ai.behavior === 'idle' ? 3 : 12)) % 6;
      actor.sprite.texture = this.textures.get(`animal.${v.species}.${row}.${column}`)!;
      const size = 56 * v.scale;
      actor.sprite.width = size; actor.sprite.height = size; actor.sprite.scale.x = Math.abs(actor.sprite.scale.x) * ai.facing;
      actor.sprite.tint = v.dead ? 0x7d817c : props.starving ? 0xbdb797 : tint;
      actor.sprite.rotation = v.dead ? ai.facing * Math.PI * .4 : !reduced && ai.behavior === 'flap' ? Math.sin(actor.clock * 8) * .06 : 0;
      actor.sprite.scale.y *= ai.behavior === 'sleep' || ai.behavior === 'layEgg' ? .77 : 1;
      actor.root.position.set(ai.x * w, ai.y * h); actor.root.zIndex = ai.y * h;
      actor.shadow.width = size * .72; actor.shadow.height = size * .22; actor.shadow.alpha = .4;
    }
    for (const s of [this.floor, this.back, this.front, this.trough, ...this.props.map(p => p.sprite)]) s.tint = tint;
  }
  hit(x: number, y: number): string | 'egg' | null {
    if (!this.anchor) return null;
    const a = this.anchor, lx = x - (a.x - a.width / 2), ly = y - (a.y - a.height / 2);
    if (Math.hypot(lx - a.width * .82, ly - a.height * .44) < 22) return 'egg';
    for (const [id, actor] of [...this.actors].sort((a, b) => b[1].ai.y - a[1].ai.y)) {
      const size = Math.max(28, 56 * actor.visual.scale);
      if (Math.abs(lx - actor.root.x) < size / 2 && ly >= actor.root.y - size && ly <= actor.root.y + 10) return id;
    }
    return null;
  }
}
