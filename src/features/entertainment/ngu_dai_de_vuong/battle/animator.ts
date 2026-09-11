import { Assets, Container, Rectangle, Sprite, Texture } from 'pixi.js';
import { assetRoot, SPINE_EXPORTS, ANIMATION_NAMES } from '../assets/manifest';
import type { AnimationCommand, AnimationEvent, AnimationName } from './types';

export interface CharacterAnimator {
  view: Container;
  play(command: AnimationCommand): void;
  update(dt: number, movement: number): void;
  destroy(): void;
}
type EventCallback = (token: number, event: AnimationEvent, hitIndex: number) => void;
type RigPart = { name: string; x: number; y: number; width: number; height: number; pivot: number[] };
export class AssetScope {
  private loaded = new Map<string, Promise<any>>();
  load<T = any>(url: string): Promise<T> { if (!this.loaded.has(url)) this.loaded.set(url, Assets.load(url)); return this.loaded.get(url)!; }
  async destroy() { const urls = [...this.loaded.keys()]; await Promise.allSettled([...this.loaded.values()]); await Promise.allSettled(urls.map(url => Assets.unload(url))); this.loaded.clear(); }
}
export class RigAnimator implements CharacterAnimator {
  view = new Container();
  private body = new Container();
  private parts: { name: string; sprite: Sprite; x: number; y: number }[] = [];
  private command?: AnimationCommand;
  private time = 0;
  private phase = 0;
  private hit = 0;
  private pose: AnimationName = 'idle';
  constructor(texture: Texture, layout: RigPart[], private event: EventCallback) {
    this.view.addChild(this.body);
    for (const part of layout) {
      const frame = new Texture({ source: texture.source, frame: new Rectangle(part.x, part.y, part.width, part.height) });
      const sprite = new Sprite(frame), x = part.pivot[0] - 80, y = part.pivot[1] - 207;
      sprite.pivot.set(part.pivot[0], part.pivot[1]); sprite.position.set(x, y);
      this.parts.push({ name: part.name, sprite, x, y }); this.body.addChild(sprite);
    }
  }
  play(command: AnimationCommand) { this.command = command; this.pose = command.name; this.time = 0; this.hit = 0; }
  update(dt: number, movement: number) {
    this.time += dt; this.phase += dt * (this.pose === 'move' ? Math.max(.2, movement) * 10 : 2.6);
    const c = this.command;
    if (c?.hits) {
      // A shared named-event contract gives exported Spine and original fallback rigs identical impact timing.
      while (this.hit < c.hits && this.time >= c.impact + this.hit * .13) {
        const index = this.hit++;
        this.event(c.token, c.projectile ? 'projectile_spawn' : c.name === 'basicAttack' ? 'basic_hit' : 'skill_hit', index);
      }
    }
    const progress = c ? Math.min(1, this.time / c.duration) : 0;
    const active = ['basicAttack', 'skill1', 'skill2', 'jump'].includes(this.pose);
    const strike = active ? Math.sin(progress * Math.PI) : 0;
    const walk = this.pose === 'move' ? Math.sin(this.phase) : 0;
    const dead = this.pose === 'death', stunned = this.pose === 'stun', victory = this.pose === 'victory';
    const blend = 1 - Math.exp(-dt * 16);
    this.body.rotation += ((dead ? 1.38 * progress : this.pose === 'knockback' ? -.24 : strike * .1) - this.body.rotation) * blend;
    this.body.y += ((dead ? 10 : this.pose === 'jump' ? -Math.sin(progress * Math.PI) * 90 : stunned ? 0 : -Math.abs(walk) * 5 + Math.sin(this.phase) * 1.2) - this.body.y) * blend;
    this.body.alpha = dead ? 1 - progress * .28 : 1;
    for (const p of this.parts) {
      let rotation = 0, x = p.x, y = p.y;
      if (/cape|ribbon|hairBack/.test(p.name)) rotation = Math.sin(this.phase + p.x) * (this.pose === 'move' ? .08 : .025) - strike * .1;
      if (/Leg|foot/.test(p.name)) { const sign = /Back/.test(p.name) ? -1 : 1; rotation = walk * .13 * sign; x += walk * sign * 8; y -= Math.max(0, walk * sign) * 4; }
      if (/ArmFront|handFront|weapon/.test(p.name)) { rotation = -strike * .38 - (victory ? .22 + Math.sin(this.phase) * .06 : 0); x += strike * 9; y -= strike * 10; }
      if (p.name === 'head') rotation = stunned ? Math.sin(this.phase * 4) * .03 : strike * .08;
      p.sprite.rotation += (rotation - p.sprite.rotation) * blend;
      p.sprite.x += (x - p.sprite.x) * blend; p.sprite.y += (y - p.sprite.y) * blend;
      p.sprite.tint = stunned ? 0xa1cde4 : 0xffffff;
    }
  }
  destroy() { for (const p of this.parts) p.sprite.texture.destroy(false); this.view.destroy({ children: true }); }
}
export async function createAnimator(id: string, assets: AssetScope, event: EventCallback): Promise<CharacterAnimator> {
  const exported = SPINE_EXPORTS[id];
  if (exported) {
    try {
      const { Spine } = await import('@esotericsoftware/spine-pixi-v8');
      await Promise.all([assets.load(exported.skeleton), assets.load(exported.atlas)]);
      const spine = Spine.from({ skeleton: exported.skeleton, atlas: exported.atlas, scale: exported.scale ?? 1, autoUpdate: false });
      const missing = ANIMATION_NAMES.filter(name => !spine.skeleton.data.findAnimation(name));
      if (missing.length) { spine.destroy({ children: true }); throw new Error(`Incomplete Spine animations: ${missing.join(', ')}`); }
      spine.state.data.defaultMix = .14;
      if (exported.skin) { spine.skeleton.setSkinByName(exported.skin); spine.skeleton.setSlotsToSetupPose(); }
      let command: AnimationCommand | undefined, index = 0;
      spine.state.addListener({ event: (_entry, e) => {
        if (!command || !command.hits) return;
        const name = e.data.name as AnimationEvent;
        if (name === 'vfx_burst') event(command.token, name, index);
        else if (['basic_hit', 'skill_hit', 'projectile_spawn'].includes(name) && index < command.hits) event(command.token, name, index++);
      } });
      return {
        view: spine,
        play(c) {
          command = c; index = 0;
          const clip = spine.skeleton.data.findAnimation(c.name);
          if (!clip) throw new Error(`Missing animation ${id}.${c.name}`);
          const looping = ['idle', 'move', 'stun', 'victory'].includes(c.name);
          const track = spine.state.setAnimation(0, c.name, looping);
          track.timeScale = looping ? 1 : clip.duration / c.duration;
        },
        update(dt, movement) { spine.state.timeScale = command?.name === 'move' ? Math.max(.1, movement) : 1; spine.update(dt); },
        destroy() { spine.state.clearListeners(); spine.state.clearTracks(); spine.destroy({ children: true }); },
      };
    } catch (error) { console.warn(`Spine unavailable for ${id}; using the original layered rig.`, error); }
  }
  const [texture, layout] = await Promise.all([assets.load<Texture>(`${assetRoot}/${id}/rig.webp`), assets.load<RigPart[]>(`${assetRoot}/rig-layout.json`)]);
  return new RigAnimator(texture, layout, event);
}
