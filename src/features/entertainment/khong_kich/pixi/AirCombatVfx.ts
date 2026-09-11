import { Container, Sprite } from "pixi.js";
import type { AirCombatAssets, VisualKey } from "./AirCombatPixiAssets";

interface Effect { sprite: Sprite; age: number; duration: number; size: number; drift: number }
export class AirCombatVfx {
  private active: Effect[] = [];
  private free: Effect[] = [];
  constructor(private root: Container, private assets: AirCombatAssets) {}
  spawn(key: VisualKey, x: number, y: number, size: number, duration = 0.45, tint = 0xffffff, drift = 0, delay = 0) {
    if (this.active.length >= 80) return;
    const effect = this.free.pop() || { sprite: new Sprite(), age: 0, duration: 0, size: 0, drift: 0 };
    Object.assign(effect, { age: -delay, duration, size, drift });
    const sprite = effect.sprite;
    sprite.texture = this.assets.effect(key);
    sprite.anchor.set(0.5); sprite.position.set(x, y);
    sprite.tint = tint; sprite.alpha = 1; sprite.visible = delay === 0;
    sprite.width = sprite.height = size;
    this.root.addChild(sprite);
    this.active.push(effect);
  }
  update(delta: number) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const effect = this.active[i];
      effect.age += delta;
      if (effect.age < 0) continue;
      effect.sprite.visible = true;
      const t = effect.age / effect.duration;
      effect.sprite.alpha = Math.max(0, 1 - t);
      effect.sprite.width = effect.sprite.height = effect.size * (0.55 + t * 0.85);
      effect.sprite.y += effect.drift * delta;
      if (t >= 1) {
        effect.sprite.visible = false;
        this.active.splice(i, 1); this.free.push(effect);
      }
    }
  }
  destroy() {
    [...this.active, ...this.free].forEach(e => e.sprite.destroy());
    this.active.length = 0; this.free.length = 0;
  }
}
