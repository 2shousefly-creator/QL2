import { Container, Sprite } from "pixi.js";
import type { AirCombatAssets, VisualKey } from "./AirCombatPixiAssets";

interface Effect { sprite: Sprite; age: number; duration: number; size: number; drift: number; smoke: boolean; aspect: number; important: boolean }
export class AirCombatVfx {
  private active: Effect[] = [];
  private free: Effect[] = [];
  constructor(private root: Container, private assets: AirCombatAssets) {}
  spawn(key: VisualKey, x: number, y: number, size: number, duration = .45, tint = 0xffffff, drift = 0, delay = 0, rotation = 0, aspect = 1) {
    const important = key === "shield" || key === "shockwave" || key === "laser" || key.endsWith("Explosion");
    if (this.active.length >= 80) {
      if (!important) return;
      const index = this.active.findIndex(effect => !effect.important);
      if (index < 0) return;
      const replaced = this.active.splice(index, 1)[0];
      replaced.sprite.visible = false; this.free.push(replaced);
    }
    const effect = this.free.pop() || { sprite: new Sprite(), age: 0, duration: 0, size: 0, drift: 0, smoke: false, aspect: 1, important: false };
    const smoke = key === "smoke" || key === "damageSmoke";
    Object.assign(effect, { age: -delay, duration, size, drift, smoke, aspect, important });
    const sprite = effect.sprite;
    sprite.texture = this.assets.effect(key);
    sprite.anchor.set(.5); sprite.position.set(x, y); sprite.rotation = rotation;
    sprite.tint = tint; sprite.alpha = smoke ? .5 : 1; sprite.visible = delay === 0;
    sprite.blendMode = smoke ? "normal" : "add";
    sprite.width = size; sprite.height = size * aspect;
    this.root.addChild(sprite); this.active.push(effect);
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
