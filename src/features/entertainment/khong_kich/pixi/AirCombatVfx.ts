import { Container, Sprite } from "pixi.js";
import type { AirCombatAssets, VisualKey } from "./AirCombatPixiAssets";

interface Effect { key?:VisualKey; startX?:number; startY?:number; targetX?:number; targetY?:number; sprite: Sprite; age: number; duration: number; size: number; drift: number; smoke: boolean; aspect: number; important: boolean }
export class AirCombatVfx {
  private active: Effect[] = [];
  private free: Effect[] = [];
  constructor(private root: Container, private assets: AirCombatAssets) {}
  spawn(key: VisualKey, x: number, y: number, size: number, duration = .45, tint = 0xffffff, drift = 0, delay = 0, rotation = 0, aspect = 1) {
    const important = key === "shield" || key === "shockwave" || key === "laser" || key.endsWith("Explosion");
    if (this.active.length >= 80) {
      if (!important) return;
      let index = this.active.findIndex(effect => !effect.important);
      if(index<0 && key==="smallExplosion" && duration<=.18) {
        // A new direct contact always gets its primary flash, even when every
        // slot is occupied by important effects; recycle the oldest burst.
        index=this.active.findIndex(effect=>effect.key==="smallExplosion" && effect.duration<=.18);
        if(index<0)index=0;
      }
      if (index < 0) return;
      const replaced = this.active.splice(index, 1)[0];
      replaced.sprite.visible = false; this.free.push(replaced);
    }
    const effect = this.free.pop() || { sprite: new Sprite(), age: 0, duration: 0, size: 0, drift: 0, smoke: false, aspect: 1, important: false };
    const smoke = key === "smoke" || key === "damageSmoke";
    Object.assign(effect, { age: -delay, duration, size, drift, smoke, aspect, important, key, targetX:undefined,targetY:undefined,startX:x,startY:y });
    const sprite = effect.sprite;
    sprite.texture = this.assets.effect(key);
    sprite.anchor.set(.5); sprite.position.set(x, y); sprite.rotation = rotation;
    sprite.tint = tint; sprite.alpha = smoke ? .5 : 1; sprite.visible = delay === 0;
    sprite.blendMode = smoke ? "normal" : "add";
    sprite.width = size; sprite.height = size * aspect;
    this.root.addChild(sprite); this.active.push(effect);
  }
  attract(key:VisualKey,x:number,y:number,targetX:number,targetY:number,size:number,duration:number,tint:number) {
    const count=this.active.length;
    this.spawn(key,x,y,size,duration,tint);
    if(this.active.length>count){const e=this.active[this.active.length-1];e.targetX=targetX;e.targetY=targetY;}
  }
  streak(x: number, y: number, fromX: number, fromY: number, tint = 0xa5f3fc, size = 3, duration = .16) {
    const length = Math.hypot(x - fromX, y - fromY);
    if (length < 1) return;
    this.spawn("laser", (x + fromX) / 2, (y + fromY) / 2, size, duration, tint, 0, 0,
      Math.atan2(y - fromY, x - fromX) + Math.PI / 2, length / size);
  }
  update(delta: number) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const effect = this.active[i];
      effect.age += delta;
      if (effect.age < 0) continue;
      effect.sprite.visible = true;
      const t = Math.min(1, effect.age / effect.duration);
      if(effect.key?.endsWith("Explosion")) {
        const frames:VisualKey[]=effect.key==="bossExplosion"?["charge","largeExplosion","bossExplosion","fire"]:["muzzle","smallExplosion","mediumExplosion","fire"];
        effect.sprite.texture=this.assets.effect(frames[Math.min(3,Math.floor(t*4))]);
      }
      if(effect.targetX!==undefined && effect.targetY!==undefined){const ease=t*t;effect.sprite.x=effect.startX!+(effect.targetX-effect.startX!)*ease;effect.sprite.y=effect.startY!+(effect.targetY-effect.startY!)*ease;}
      effect.sprite.alpha = effect.smoke ? Math.min(1, t * 8) * (1 - t) * .65 : (1 - t) ** 1.4;
      const scale = effect.aspect !== 1 ? 1 : effect.smoke ? .35 + t * 1.5 : .6 + Math.sqrt(t) * .65;
      effect.sprite.width = effect.size * scale;
      effect.sprite.height = effect.size * effect.aspect * scale;
      effect.sprite.y += effect.drift * delta;
      if (t >= 1) {
        effect.sprite.visible = false; this.active.splice(i, 1); this.free.push(effect);
      }
    }
  }
  destroy() {
    [...this.active, ...this.free].forEach(e => e.sprite.destroy());
    this.active.length = 0; this.free.length = 0;
  }
}
