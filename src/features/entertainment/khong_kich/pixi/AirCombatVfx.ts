import { Container, Sprite } from "pixi.js";
import type { AirCombatAssets, VisualKey } from "./AirCombatPixiAssets";
import { healingCrossPlacement, lightningPath } from "../airCombatProcVisuals";

interface Effect { key?:VisualKey; startX?:number; startY?:number; targetX?:number; targetY?:number; sprite: Sprite; age: number; duration: number; size: number; drift: number; smoke: boolean; aspect: number; important: boolean; opacity: number }
export class AirCombatVfx {
  private active: Effect[] = [];
  private free: Effect[] = [];
  constructor(private root: Container, private assets: AirCombatAssets) {}
  spawn(key: VisualKey, x: number, y: number, size: number, duration = .45, tint = 0xffffff, drift = 0, delay = 0, rotation = 0, aspect = 1, opacity = 1) {
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
    const effect = this.free.pop() || { sprite: new Sprite(), age: 0, duration: 0, size: 0, drift: 0, smoke: false, aspect: 1, important: false, opacity: 1 };
    const smoke = key === "smoke" || key === "damageSmoke";
    Object.assign(effect, { age: -delay, duration, size, drift, smoke, aspect, important, opacity, key, targetX:undefined,targetY:undefined,startX:x,startY:y });
    const sprite = effect.sprite;
    sprite.texture = this.assets.effect(key);
    sprite.anchor.set(.5); sprite.position.set(x, y); sprite.rotation = rotation;
    sprite.tint = tint; sprite.alpha = (smoke ? .5 : 1) * opacity; sprite.visible = delay === 0;
    sprite.blendMode = smoke ? "normal" : "add";
    sprite.width = size; sprite.height = size * aspect;
    this.root.addChild(sprite); this.active.push(effect);
  }
  attract(key:VisualKey,x:number,y:number,targetX:number,targetY:number,size:number,duration:number,tint:number) {
    const count=this.active.length;
    this.spawn(key,x,y,size,duration,tint);
    if(this.active.length>count){const e=this.active[this.active.length-1];e.targetX=targetX;e.targetY=targetY;}
  }
  streak(x: number, y: number, fromX: number, fromY: number, tint = 0xa5f3fc, size = 3, duration = .16, opacity = 1) {
    const length = Math.hypot(x - fromX, y - fromY);
    if (length < 1) return;
    this.spawn("laser", (x + fromX) / 2, (y + fromY) / 2, size, duration, tint, 0, 0,
      Math.atan2(y - fromY, x - fromX) + Math.PI / 2, length / size, opacity);
  }
  /** Reserve a complete proc so pool saturation cannot drop just its inner core. */
  private reserveProc(count: number) {
    while (this.active.length + count > 80) {
      const index = this.active.findIndex(effect => !effect.important);
      const removed = this.active.splice(index < 0 ? 0 : index, 1)[0];
      removed.sprite.visible = false; this.free.push(removed);
    }
  }
  lanceImpact(x:number,y:number,size:number,reducedMotion:boolean) {
    this.reserveProc(reducedMotion?3:4);
    this.spawn("charge",x,y,size*.6,.08,0xfff5df);
    this.spawn("smallExplosion",x,y,size,.18,0xffc37c);
    this.spawn("shockwave",x,y,size,.2,0xffdcb0);
    if(!reducedMotion)this.spawn("sparks",x,y,size*.9,.19,0xffe4b9);
  }
  starfallImpact(x:number,y:number,size:number,reducedMotion:boolean) {
    // At most eight pooled layers per meteor; persistent burn art uses another pool.
    this.reserveProc(reducedMotion?4:8);
    this.spawn("charge",x,y,size*.8,.1,0xfff5d9);
    this.spawn("largeExplosion",x,y,size*1.25,.48,0xffbb76);
    this.spawn("shockwave",x,y,size*1.8,.42,0xffc273);
    this.spawn("fire",x,y,size*.75,.38,0xffaa52,0,.09);
    if(!reducedMotion){
      this.spawn("astra_debris",x,y,size*1.45,.5,0xffffff);
      this.spawn("sparks",x,y,size*1.4,.38,0xffd897);
      this.spawn("smoke",x,y,size*1.15,.6,0x9c8279,-12,.04);
      this.spawn("charge",x,y,size*.5,.23,0xff9c4e,0,.13);
    }
  }
  lightning(id: number, fromX: number, fromY: number, x: number, y: number, reducedMotion: boolean) {
    const path = lightningPath(id, fromX, fromY, x, y, reducedMotion);
    this.reserveProc((path.length - 1) * 2 + 3);
    for (const core of [false, true]) for (let i = 1; i < path.length; i++) {
      const a = path[i - 1], b = path[i];
      this.streak(b.x, b.y, a.x, a.y, core ? 0xeaffff : 0x22bfff, core ? 2.7 : 6.5, .23, core ? 1 : .65);
    }
    this.spawn("charge", x, y, 16, .18, 0xeaffff);
    this.spawn("sparks", x, y, reducedMotion ? 16 : 24, .23, 0x67e8f9);
    this.spawn("charge", fromX, fromY, 10, .12, 0xa5f3fc);
  }
  healing(id: number, x: number, y: number, reducedMotion: boolean) {
    const count = reducedMotion ? 1 : 3;
    this.reserveProc(count);
    for (let i = 0; i < count; i++) {
      const placement = healingCrossPlacement(id, i, reducedMotion);
      this.spawn("healingCross", x + placement.x, y + placement.y, placement.size, .7, 0xffffff, placement.drift);
    }
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
      effect.sprite.alpha = (effect.smoke ? Math.min(1, t * 8) * (1 - t) * .65 : (1 - t) ** 1.4) * effect.opacity;
      const scale = effect.aspect !== 1 || effect.key === "laser" || effect.key === "healingCross" ? 1 : effect.smoke ? .35 + t * 1.5 : .6 + Math.sqrt(t) * .65;
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
