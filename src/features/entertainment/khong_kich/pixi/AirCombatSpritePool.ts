import { Container, Sprite, Texture } from "pixi.js";

/** IDs link presentation to runtime entities; sprites never own combat stats. */
export class AirCombatSpritePool {
  private live = new Map<number, Sprite>();
  private free: Sprite[] = [];
  private seen = new Set<number>();
  constructor(private parent: Container, private limit: number) {}
  begin() { this.seen.clear(); }
  get(id: number, texture: Texture): Sprite | null {
    let sprite = this.live.get(id);
    if (!sprite) {
      if (this.live.size >= this.limit) return null;
      sprite = this.free.pop() || new Sprite();
      sprite.anchor.set(0.5);
      this.parent.addChild(sprite);
      this.live.set(id, sprite);
    }
    this.seen.add(id);
    sprite.texture = texture;
    sprite.visible = true;
    sprite.alpha = 1;
    sprite.tint = 0xffffff;
    sprite.blendMode = "normal";
    sprite.rotation = 0;
    return sprite;
  }
  end() {
    for (const [id, sprite] of this.live) {
      if (this.seen.has(id)) continue;
      sprite.visible = false;
      this.live.delete(id);
      this.free.push(sprite);
    }
  }
  destroy() {
    this.live.forEach(sprite => sprite.destroy());
    this.free.forEach(sprite => sprite.destroy());
    this.live.clear(); this.free.length = 0;
  }
}
