import { Container, Sprite, Texture } from 'pixi.js';
import type { FarmWorldTextures } from './FarmWorldAssets';
import type { FarmAnchor, FarmVisualEvent } from './farmPixiTypes';
type Particle = { sprite: Sprite; age: number; life: number; delay: number; x: number; y: number; vx: number; vy: number; gravity: number; size: number; kind: string };
/** A fixed pool shared by every action; no per-frame object allocation. */
export class FarmVfxManager {
  readonly root = new Container(); private pool: Particle[] = []; private seen = new Set<string>();
  constructor(private textures: FarmWorldTextures, parent: Container, initial: readonly FarmVisualEvent[]) {
    parent.addChild(this.root); this.root.eventMode = 'none'; initial.forEach(e => this.seen.add(e.id));
    for (let i = 0; i < 96; i++) { const sprite = this.root.addChild(new Sprite(Texture.EMPTY)); sprite.anchor.set(.5); sprite.visible = false; this.pool.push({ sprite, age: 2, life: 1, delay: 0, x: 0, y: 0, vx: 0, vy: 0, gravity: 0, size: 1, kind: '' }); }
  }
  receive(events: readonly FarmVisualEvent[], anchors: Readonly<Record<number, FarmAnchor>>, pen: FarmAnchor | undefined, reduced: boolean, bounce: (index: number) => void) {
    for (const event of events) {
      // These actions have dedicated presentation in the gated mobile renderer.
      if (event.kind === 'sow' || event.kind === 'feed' || event.kind === 'unlock') continue;
      if (this.seen.has(event.id)) continue;
      const a = event.kind === 'egg' ? pen : anchors[event.plotIndex]; if (!a) continue;
      this.seen.add(event.id); if (this.seen.size > 96) this.seen.delete(this.seen.values().next().value!);
      if (Date.now() - event.startedAt > 1800) continue;
      bounce(event.plotIndex); if (reduced) continue;
      const dense = event.fertilizerId?.includes('premium') || event.fertilizerId?.includes('super');
      const count = event.kind === 'water' ? 22 : event.kind === 'fertilizer' && dense ? 24 : 16;
      for (let i = 0; i < count; i++) {
        const p = this.pool.find(p => p.age >= p.life + p.delay); if (!p) break;
        const reward = event.kind === 'harvest' && i < 3 || event.kind === 'egg' && i < 2;
        const key = reward ? event.kind === 'egg' ? 'pen.egg' : `vfx.${event.cropId === 'tomato' ? 'tomato' : 'carrot'}` : `vfx.${event.kind === 'water' ? i < 12 ? 'water' : 'ripple' : event.kind === 'pest' ? i === 0 ? 'pest' : 'leaf' : event.kind === 'fertilizer' ? 'fertilizer' : 'dust'}`;
        p.sprite.texture = this.textures.get(key)!; p.sprite.visible = true; p.sprite.blendMode = event.kind === 'fertilizer' ? 'add' : 'normal';
        p.sprite.tint = event.kind === 'fertilizer' ? dense ? 0xe6c7ff : 0xc8da8a : event.kind === 'harvest' && !reward ? 0xb59867 : 0xffffff;
        p.age = 0; p.life = reward ? 1.3 : .8; p.delay = i * .024; p.kind = reward ? 'reward' : event.kind;
        p.x = a.x + (event.kind === 'water' && i < 12 ? -18 : Math.sin(i * 2.4) * a.width * .17);
        p.y = a.y + (event.kind === 'water' && i < 12 ? -a.height * .65 : event.kind === 'fertilizer' ? -a.height * .45 : 0);
        p.vx = reward ? 35 + i * 10 : event.kind === 'water' ? 22 : Math.cos(i * 2.4) * 22;
        p.vy = reward ? -85 : event.kind === 'water' || event.kind === 'fertilizer' ? 60 : -25 - i * 2;
        p.gravity = reward ? -25 : event.kind === 'water' ? 130 : 45;
        p.size = reward ? 28 : event.kind === 'water' && i < 12 ? 10 : event.kind === 'pest' && i === 0 ? 18 : 7 + i % 3;
      }
    }
  }
  tick(dt: number, reduced: boolean) {
    for (const p of this.pool) {
      if (reduced) p.age = p.life + p.delay;
      p.age += dt; const age = p.age - p.delay;
      p.sprite.visible = age >= 0 && age < p.life;
      if (!p.sprite.visible) continue;
      p.sprite.position.set(p.x + p.vx * age, p.y + p.vy * age + p.gravity * age * age / 2);
      p.sprite.width = p.size * (p.kind === 'reward' ? 1 - age * .3 : 1); p.sprite.height = p.kind === 'water' ? p.size * 1.5 : p.sprite.width;
      p.sprite.alpha = Math.min(1, (p.life - age) * 3); p.sprite.rotation = p.kind === 'water' ? -.2 : age * .3;
    }
  }
}
