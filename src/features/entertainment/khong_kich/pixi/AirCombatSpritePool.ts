import { Container, Sprite, Texture } from "pixi.js";
import { GeneratedRigPool } from './GeneratedRigPool';

/** IDs link presentation to runtime entities; sprites never own combat stats. */
export class AirCombatSpritePool {
  private live = new Map<number, Sprite>();
  private free: Sprite[] = [];
  private seen = new Set<number>();
  private rigs:GeneratedRigPool;
  private time=0;
  private reduced=true;
  constructor(private parent: Container, private limit: number) { this.rigs=new GeneratedRigPool(parent,Math.min(limit,96)); }
  begin(time=0,reduced=true) { this.time=time;this.reduced=reduced;this.seen.clear();this.rigs.begin(time,reduced); }
  shatterAt(x:number,y:number,time:number,reduced:boolean) {
    let selected:number|undefined,nearest=40;
    for(const [id,sprite] of this.live){const distance=Math.hypot(sprite.x-x,sprite.y-y);if(distance<nearest){nearest=distance;selected=id;}}
    if(selected!==undefined)this.rigs.shatter(selected,time,reduced);
  }
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
    sprite.renderable = true;
    sprite.anchor.set(.5);
    sprite.alpha = 1;
    sprite.tint = 0xffffff;
    sprite.blendMode = "normal";
    sprite.rotation = 0;
    return sprite;
  }
  end() {
    for (const [id, sprite] of this.live) {
      if (this.seen.has(id)) { this.rigs.draw(id,sprite,this.time,this.reduced);continue; }
      sprite.visible = false;
      this.live.delete(id);
      this.free.push(sprite);
    }
    this.rigs.end();
  }
  destroy() {
    this.rigs.destroy();
    this.live.forEach(sprite => sprite.destroy());
    this.free.forEach(sprite => sprite.destroy());
    this.live.clear(); this.free.length = 0;
  }
}
