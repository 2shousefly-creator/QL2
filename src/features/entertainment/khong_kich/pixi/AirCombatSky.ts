import { Container, Graphics, Sprite } from "pixi.js";
import type { AirCombatAssets } from "./AirCombatPixiAssets";
import type { CombatWorld } from "../airCombatRuntime";
import { getTerrainWorld, terrainColor, type TerrainShape } from "../airCombatTerrain";

function paint(graphics: Graphics, shapes: TerrainShape[]) {
  graphics.clear();
  for (const shape of shapes) {
    const p = shape.points;
    if (shape.kind === "line") {
      graphics.moveTo(p[0], p[1]);
      for (let i = 2; i < p.length; i += 2) graphics.lineTo(p[i], p[i + 1]);
      graphics.stroke({ color: shape.color, width: shape.width });
    } else {
      if (shape.kind === "rect") graphics.rect(p[0], p[1], p[2], p[3]);
      else if (shape.kind === "ellipse") graphics.ellipse(p[0], p[1], p[2], p[3]);
      else graphics.poly(p);
      graphics.fill(shape.color);
    }
  }
}

export class AirCombatSky {
  readonly root = new Container();
  private atmosphere = new Graphics().rect(0, 0, 360, 640).fill(0xffffff);
  private terrain = Array.from({ length: 3 }, () => ({ root: new Container(), ground: new Graphics(), landmarks: new Graphics(), revision: -1 }));
  private clouds: { sprite: Sprite; speed: number; alpha: number; haze: boolean }[] = [];
  private wind = new Graphics();
  constructor(assets: AirCombatAssets) {
    this.root.addChild(new Graphics().rect(0, 0, 360, 640).fill(0x3b5547));
    for (const segment of this.terrain) {
      segment.root.addChild(segment.ground, segment.landmarks);
      this.root.addChild(segment.root);
    }
    this.atmosphere.tint = 0x244c69;
    this.atmosphere.alpha = .24;
    this.root.addChild(this.atmosphere);
    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < 4; i++) {
        const sprite = new Sprite(assets.effect(i % 2 ? "haze" : "cloud"));
        sprite.anchor.set(0.5);
        sprite.position.set(((i * 137 + layer * 67) % 460) - 50, i * 230 - 160);
        sprite.width = 190 + layer * 62;
        sprite.height = sprite.width * (i%2?.52:.7);
        sprite.rotation=(i%3-1)*.16;
        sprite.alpha = [0.13, 0.17, 0.11][layer];
        this.root.addChild(sprite);
        this.clouds.push({ sprite, speed: i % 2 ? 4 + layer * 2 : 5 + layer * 12, alpha: sprite.alpha, haze: i % 2 === 1 });
      }
    }
    for (let i = 0; i < 18; i++) {
      const x = (i * 73) % 360, y = (i * 131) % 780 - 100;
      this.wind.moveTo(x, y).lineTo(x - 2, y + 18).stroke({ color: 0xd4e7f4, width: 0.6, alpha: 0.055 });
    }
    this.root.addChild(this.wind);
  }
  update(delta: number, world: CombatWorld, reducedMotion: boolean) {
    const terrain = getTerrainWorld(world, reducedMotion);
    for (let i = 0; i < this.terrain.length; i++) {
      const view = this.terrain[i], segment = terrain.segments[i];
      if (view.revision !== segment.revision) {
        paint(view.ground, segment.ground); paint(view.landmarks, segment.landmarks);
        if(view.revision<0)view.root.cacheAsTexture({resolution:1,antialias:true});
        else view.root.updateCacheTexture();
        view.revision = segment.revision;
      }
      view.root.y = segment.y;
    }
    this.atmosphere.tint = world.stage.runtime === "magnetic" ? 0x101d58 : terrainColor(0x244c69, 0x1e354e, terrain.bossAtmosphere);
    this.atmosphere.alpha = world.stage.runtime === "magnetic" ? .68 : .24 + terrain.bossAtmosphere * .06;
    this.wind.visible = !reducedMotion;
    this.wind.y = (this.wind.y + delta * 62) % 80;
    for (const cloud of this.clouds) {
      cloud.sprite.alpha = cloud.alpha * (1 - terrain.bossAtmosphere * (cloud.haze ? .2 : .6));
      cloud.sprite.y += delta * cloud.speed * (reducedMotion ? 0.08 : 1);
      if (cloud.sprite.y > 850) cloud.sprite.y -= 1100;
    }
  }
}
