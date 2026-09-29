import { stormbreakerSkyTile } from "../airCombatStage3Art";
import { magneticFlight, stormTile } from "../airCombatMagneticSky";
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
  private mirage: Sprite;
  private mirageNext: Sprite;
  private stormbreaker: Sprite;
  private stormbreakerNext: Sprite;
  private storm: Sprite;
  private stormNext: Sprite;
  private stormWind = new Graphics();
  private stormShade = new Graphics().rect(0,0,360,640).fill({color:0x030819,alpha:.22});
  private atmosphere = new Graphics().rect(0, 0, 360, 640).fill(0xffffff);
  private terrain = Array.from({ length: 3 }, () => ({ root: new Container(), ground: new Graphics(), landmarks: new Graphics(), revision: -1 }));
  private clouds: { sprite: Sprite; speed: number; alpha: number; haze: boolean }[] = [];
  private wind = new Graphics();
  constructor(assets: AirCombatAssets) {
    this.root.addChild(new Graphics().rect(0, 0, 360, 640).fill(0x3b5547));
    this.mirage = new Sprite(assets.mirageSky); this.mirageNext = new Sprite(assets.mirageSky);
    for(const sprite of [this.mirage,this.mirageNext]){sprite.anchor.set(.5);sprite.width=408;sprite.height=702;sprite.visible=false;}
    this.stormbreaker = new Sprite(assets.stormbreakerSky);
    this.stormbreakerNext = new Sprite(assets.stormbreakerSky);
    for(const sprite of [this.stormbreaker,this.stormbreakerNext]){sprite.anchor.set(.5);sprite.width=408;sprite.height=702;sprite.visible=false;}
    this.storm = new Sprite(assets.magneticStorm);
    this.storm.position.set(-24,-30); this.storm.width=408; this.storm.height=702;
    this.stormNext = new Sprite(assets.magneticStorm); this.stormNext.width = 408; this.stormNext.height = 702;
    this.storm.anchor.set(.5); this.stormNext.anchor.set(.5);
    this.storm.x = this.stormNext.x = 180;
    this.storm.visible=false; this.stormShade.visible=false;
    for (const segment of this.terrain) {
      segment.root.addChild(segment.ground, segment.landmarks);
      this.root.addChild(segment.root);
    }
    this.atmosphere.tint = 0x244c69;
    this.atmosphere.alpha = .24;
    this.root.addChild(this.atmosphere, this.storm, this.stormNext, this.stormShade, this.stormbreaker, this.stormbreakerNext, this.mirage, this.mirageNext);
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
    this.root.addChild(this.wind, this.stormWind);
  }
  update(delta: number, world: CombatWorld, reducedMotion: boolean) {
    this.mirage.visible=this.mirageNext.visible=!!world.mirage;
    if(world.mirage){
      this.storm.visible=this.stormNext.visible=this.stormWind.visible=this.stormShade.visible=this.wind.visible=this.atmosphere.visible=this.stormbreaker.visible=this.stormbreakerNext.visible=false;
      for(const view of this.terrain)view.root.visible=false;
      for(const cloud of this.clouds)cloud.sprite.visible=false;
      for(let i=0;i<2;i++){const tile=stormbreakerSkyTile(world.elapsed*(reducedMotion?.25:.7),false,i),sprite=i?this.mirageNext:this.mirage;sprite.x=tile.x;sprite.y=tile.y;sprite.scale.y=Math.abs(sprite.scale.y)*(tile.flipped?-1:1);}
      return;
    }
    const stormbreaker=!!world.stormbreaker;
    this.stormbreaker.visible=this.stormbreakerNext.visible=stormbreaker;
    if(stormbreaker){
      this.storm.visible=this.stormNext.visible=this.stormWind.visible=this.stormShade.visible=this.wind.visible=this.atmosphere.visible=false;
      for(const view of this.terrain)view.root.visible=false;
      for(let i=0;i<2;i++){const tile=stormbreakerSkyTile(world.elapsed,reducedMotion,i),sprite=i?this.stormbreakerNext:this.stormbreaker;sprite.x=tile.x;sprite.y=tile.y;sprite.scale.y=Math.abs(sprite.scale.y)*(tile.flipped?-1:1);}
      for(const cloud of this.clouds) cloud.sprite.visible=false;
      return;
    }
    for(const cloud of this.clouds) cloud.sprite.visible=true;
    const magnetic = !!world.magnetic;
    this.storm.visible = magnetic; this.stormNext.visible = magnetic; this.stormWind.visible = magnetic; this.stormShade.visible = magnetic;
    this.atmosphere.visible = !magnetic;
    for (const view of this.terrain) view.root.visible = !magnetic;
    if (magnetic) {
      const distance = magneticFlight(world, reducedMotion);
      for (let i = 0; i < 2; i++) {
        const tile = stormTile(distance, i), sprite = i ? this.stormNext : this.storm;
        sprite.y = tile.y + 350; sprite.scale.y = Math.abs(sprite.scale.y) * (tile.flipped ? -1 : 1);
      }
      this.wind.visible = false;
      this.stormWind.clear();
      for (let i = 0; i < 24; i++) {
        const x = (i * 73) % 360, y = (i * 131 + distance * 2.5) % 760 - 60;
        this.stormWind.moveTo(x, y).lineTo(x - 3, y + 27).stroke({ color: 0xa5d8ff, width: .8, alpha: reducedMotion ? .07 : .14 });
      }
      for (let i = 0; i < this.clouds.length; i++) {
        const cloud = this.clouds[i];
        cloud.sprite.alpha = cloud.alpha * .65;
        cloud.sprite.tint = cloud.haze ? 0x8f85cb : 0x49849c;
        cloud.sprite.y = (i * 183 + distance * 1.45) % 1000 - 180;
      }
      return;
    }
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
    this.atmosphere.tint = terrainColor(0x244c69, 0x1e354e, terrain.bossAtmosphere);
    this.atmosphere.alpha = .24 + terrain.bossAtmosphere * .06;
    this.wind.visible = !reducedMotion;
    this.wind.y = (this.wind.y + delta * 62) % 80;
    for (const cloud of this.clouds) {
      cloud.sprite.alpha = cloud.alpha * (1 - terrain.bossAtmosphere * (cloud.haze ? .2 : .6));
      cloud.sprite.y += delta * cloud.speed * (reducedMotion ? 0.08 : 1);
      if (cloud.sprite.y > 850) cloud.sprite.y -= 1100;
    }
  }
}
