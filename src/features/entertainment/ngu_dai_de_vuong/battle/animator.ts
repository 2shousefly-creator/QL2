import { Assets, Container, Rectangle, Sprite, Texture } from 'pixi.js';
import { assetRoot, characterAsset, SPINE_EXPORTS, ANIMATION_NAMES } from '../assets/manifest';
import type { AnimationCommand, AnimationEvent, AnimationName } from './types';
import { animationProfile } from '../data/heroAnimationProfiles';
import { HERO_VISUAL_PROFILES } from '../data/heroVisualProfiles';

export interface CharacterAnimator {
  view: Container;
  play(command: AnimationCommand): void;
  update(dt: number, movement: number, holdVisual?: boolean): void;
  weaponPosition?(): { x: number; y: number };
  destroy(): void;
}
type EventCallback = (token: number, event: AnimationEvent, hitIndex: number) => void;
type RigPart = { name: string; x: number; y: number; width: number; height: number; pivot: number[]; origin?: number[] };
const PARENT_PART:Record<string,string>={head:'torso',hairFront:'head',hairBack:'head',upperArmBack:'torso',lowerArmBack:'upperArmBack',handBack:'lowerArmBack',upperArmFront:'torso',lowerArmFront:'upperArmFront',handFront:'lowerArmFront',weapon:'handFront',upperLegBack:'torso',lowerLegBack:'upperLegBack',footBack:'lowerLegBack',upperLegFront:'torso',lowerLegFront:'upperLegFront',footFront:'lowerLegFront'};
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
  private reaction = 0;
  private profile;
  private floating: number;
  private connected: boolean;
  constructor(texture: Texture, layout: RigPart[], private event: EventCallback, id: string) {
    this.profile = animationProfile(id); this.floating = HERO_VISUAL_PROFILES[id]?.float || 0; this.connected=Boolean(HERO_VISUAL_PROFILES[id]);
    this.view.addChild(this.body);
    for (const part of layout) {
      const frame = new Texture({ source: texture.source, frame: new Rectangle(part.x, part.y, part.width, part.height) });
      const sprite = new Sprite(frame), x = part.pivot[0] - (part.origin?.[0] ?? 80), y = part.pivot[1] - (part.origin?.[1] ?? 207);
      sprite.pivot.set(part.pivot[0], part.pivot[1]); sprite.position.set(x, y);
      this.parts.push({ name: part.name, sprite, x, y }); this.body.addChild(sprite);
    }
  }
  play(command: AnimationCommand) { this.command = command; this.pose = command.name; this.time = 0; this.hit = 0; if (command.name === 'hit') this.reaction = .24; }
  update(dt: number, movement: number) {
    this.time += dt; this.phase += dt; this.reaction = Math.max(0, this.reaction - dt);
    const p = this.profile, moving = this.pose === 'move', dead = this.pose === 'death', stunned = this.pose === 'stun', victory = this.pose === 'victory';
    const motion = this.pose === 'skill2' ? p.skill2 : this.pose === 'skill1' || this.pose === 'jump' ? p.skill1 : p.basicAttack;
    const c = this.command;
    const progress = c ? Math.min(1, this.time / c.duration) : 0;
    const active = ['basicAttack', 'skill1', 'skill2', 'jump'].includes(this.pose);
    // Wind-up, release, impact, follow-through and recovery share the engine's
    // authoritative hit times; pose reaches its impact BEFORE the event fires.
    const smooth = (n: number) => { const x = Math.max(0, Math.min(1, n)); return x * x * (3 - 2 * x); };
    let strike = 0;
    if (active && c) {
      const hitTime = c.impact + Math.min(Math.max(0, Math.floor((this.time - c.impact) / .13)), c.hits - 1) * .13;
      const wind = c.impact * motion.anticipation, releaseStart = Math.max(wind, c.impact - motion.release);
      if (this.time < releaseStart) strike = -.42 * smooth(this.time / Math.max(.01, wind));
      else if (this.time < c.impact) strike = -.42 + 1.42 * smooth((this.time - releaseStart) / Math.max(.01, c.impact - releaseStart));
      else if (this.time < c.impact + (c.hits - 1) * .13) strike = 1 - .6 * Math.sin((this.time - hitTime) / .13 * Math.PI);
      else { const tail = this.time - (c.impact + (c.hits - 1) * .13); const recovery = Math.max(.06, (c.duration - c.impact - (c.hits - 1) * .13) * motion.recovery); strike = tail < .04 ? 1 + tail * 2 : 1.08 * (1 - smooth((tail - .04) / recovery)); }
    }
    const gait = this.phase * p.move.rate * Math.max(.2, movement), walk = moving ? Math.sin(gait) : 0;
    const idle = Math.sin(this.phase * p.idle.rate), react = this.reaction / .24 * p.hitReaction;
    const deathAngle = p.death === 'fall' ? 1.4 : p.death === 'fold' ? .75 : p.death === 'kneel' ? .3 : .12;
    this.body.rotation = dead ? deathAngle * smooth(progress) : stunned ? 0 : (moving ? p.move.lean : idle * p.idle.sway) + strike * motion.lean - react;
    this.body.x = strike * motion.lunge - react * 55;
    this.body.y = -this.floating + (dead ? progress * (p.death === 'dissolve' ? -24 : 30) : -Math.abs(walk) * p.move.bounce + idle * p.idle.bob - Math.max(0,strike) * motion.lift - (this.pose === 'jump' ? Math.sin(progress * Math.PI) * 78 : 0));
    this.body.scale.set(1 + (dead && p.death === 'crumble' ? progress * .15 : 0), dead && ['crumble','fold','kneel'].includes(p.death) ? 1 - progress * .3 : 1 + idle * p.idle.breath);
    this.body.alpha = dead ? 1 - progress * (p.death === 'dissolve' ? .85 : .3) : 1;
    for (const part of this.parts) {
      let rotation = 0, x = part.x, y = part.y;
      const back = /Back/.test(part.name), sign = back ? -1 : 1;
      if (/cape|ribbon|hair|tail|wing|smoke|halo|ornament/.test(part.name)) {
        rotation = Math.sin(this.phase * p.secondary.rate - p.secondary.drag + part.x * .016) * p.secondary.amplitude - strike * motion.twist * .2;
        if (/wing/.test(part.name)) rotation += sign * (moving ? Math.sin(gait * .5) * p.move.wing : idle * .06);
        if (/tail|ribbon/.test(part.name)) x -= strike * motion.lunge * p.secondary.drag;
        if (/smoke|halo/.test(part.name)) y += Math.sin(this.phase * p.secondary.rate + 1) * 5;
      }
      if (/Leg|foot/.test(part.name)) { rotation = walk * .018 * p.move.stride * sign; x += walk * sign * p.move.stride; y -= Math.max(0, walk * sign) * p.move.bounce; }
      if (/Arm|hand|weapon/.test(part.name)) {
        rotation += strike * (part.name === 'weapon' ? motion.weapon : motion.arm) * (back ? -.4 : 1) - walk * .06 * sign;
        x += strike * motion.lunge * .22; y -= Math.max(0,strike) * motion.lift * .4;
        if (victory) { rotation -= p.victory === 'raise' ? .8 : p.victory === 'roar' ? sign * .6 : .13; y -= p.victory === 'float' ? 15 : 0; }
      }
      if(this.connected && /lowerArm|hand|lowerLeg|foot/.test(part.name))rotation*=.25;
      if (part.name === 'head') rotation += stunned ? Math.sin(this.phase * 14) * .025 : victory && p.victory === 'bow' ? .18 : strike * motion.twist * .08 - react;
      if (dead && p.death === 'crumble') { x += sign * progress * 10; rotation += sign * progress * .18; }
      part.sprite.rotation = rotation; part.sprite.position.set(x,y);
      part.sprite.tint = stunned ? 0xb6d4e8 : this.reaction > .15 ? 0xffd2c2 : 0xffffff;
    }
    // Forward kinematics preserves shoulder/elbow/wrist and hip/knee/ankle
    // connections while keeping the source SVG's explicit front/back draw order.
    if(this.connected){
      const resolved=new Set<string>();
      const connect=(part:typeof this.parts[number])=>{
        if(resolved.has(part.name))return;
        const parent=this.parts.find(other=>other.name===PARENT_PART[part.name]);
        if(parent){connect(parent);const angle=parent.sprite.rotation,dx=part.sprite.x-parent.x,dy=part.sprite.y-parent.y;part.sprite.position.set(parent.sprite.x+dx*Math.cos(angle)-dy*Math.sin(angle),parent.sprite.y+dx*Math.sin(angle)+dy*Math.cos(angle));part.sprite.rotation+=angle;}
        resolved.add(part.name);
      };
      for(const part of this.parts)connect(part);
    }
    if (c?.hits) {
      while (this.hit < c.hits && this.time >= c.impact + this.hit * .13) {
        const index = this.hit++;
        this.event(c.token, c.projectile ? 'projectile_spawn' : c.name === 'basicAttack' ? 'basic_hit' : 'skill_hit', index);
      }
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
      let command: AnimationCommand | undefined, index = 0, elapsed = 0, clipTime = 0;
      let activeTrack: ReturnType<typeof spine.state.setAnimation> | undefined;
      let clock: number[] = [], authored: number[] = [], holding = false;
      const pose = new Float32Array(spine.skeleton.bones.length * 6);
      const weaponPoint = {x:0,y:0};
      const fields = ['a','b','c','d','worldX','worldY'] as const;
      let poseReady = false;
      spine.afterUpdateWorldTransforms = () => {
        for(let i=0;i<spine.skeleton.bones.length;i++)for(let j=0;j<fields.length;j++){
          const bone=spine.skeleton.bones[i],field=fields[j];
          if(holding&&poseReady)bone[field]=pose[i*6+j];else pose[i*6+j]=bone[field];
        }
        poseReady=true;
      };
      spine.state.addListener({ event: (entry, e) => {
        if (!command || !command.hits || entry !== activeTrack) return;
        const name = e.data.name as AnimationEvent;
        if (name === 'vfx_burst') event(command.token, name, index);
        else if (['basic_hit', 'skill_hit', 'projectile_spawn'].includes(name) && index < command.hits) event(command.token, name, index++);
      } });
      return {
        view: spine,
        weaponPosition() { spine.getBonePosition('weapon', weaponPoint); return weaponPoint; },
        play(c) {
          command = c; index = 0; elapsed = 0; clipTime = 0;
          const clip = spine.skeleton.data.findAnimation(c.name);
          if (!clip) throw new Error(`Missing animation ${id}.${c.name}`);
          const looping = ['idle', 'move', 'stun', 'victory'].includes(c.name);
          const track = spine.state.setAnimation(0, c.name, looping); activeTrack = track;
          const markers=exported.markers[c.name]||[.45];
          clock=[0,...markers.map((_,i)=>c.impact+i*.13),c.duration];
          authored=[0,...markers,clip.duration];
          // Action markers must never be suppressed or duplicated by an outgoing mix.
          track.mixDuration = c.hits ? 0 : .12;
          track.timeScale = looping ? 1 : clip.duration / c.duration;
        },
        update(dt, movement, holdVisual = false) {
          const c = command;
          if (c?.hits && activeTrack) {
            elapsed = Math.min(c.duration, elapsed + dt);
            let segment = 0;
            while (segment < clock.length - 2 && elapsed > clock[segment + 1]) segment++;
            const t = Math.min(1, Math.max(0, (elapsed - clock[segment]) / Math.max(.001, clock[segment + 1] - clock[segment])));
            const next = authored[segment] + (authored[segment + 1] - authored[segment]) * t;
            activeTrack.timeScale = Math.max(0, next - clipTime) / dt; clipTime = next;
          }
          spine.state.timeScale = c?.name === 'move' ? Math.max(.1, movement) : 1;
          holding=holdVisual;
          spine.update(dt);
        },
        destroy() { spine.state.clearListeners(); spine.state.clearTracks(); spine.destroy({ children: true }); },
      };
    } catch (error) { console.warn(`Spine unavailable for ${id}; using the original layered rig.`, error); }
  }
  const [texture, layout] = await Promise.all([assets.load<Texture>(characterAsset(id,'rig.webp')), assets.load<RigPart[]>(HERO_VISUAL_PROFILES[id] ? characterAsset(id,'rig-layout.json') : `${assetRoot}/rig-layout.json`)]);
  return new RigAnimator(texture, layout, event, id);
}
