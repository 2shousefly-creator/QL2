import { Container, Graphics, Sprite } from "pixi.js";
import type { AirCombatAssets } from "./AirCombatPixiAssets";

export class AirCombatSky {
  readonly root = new Container();
  private atmosphere = new Graphics().rect(0, 0, 360, 640).fill(0x234660);
  private clouds: { sprite: Sprite; speed: number }[] = [];
  private wind = new Graphics();
  constructor(assets: AirCombatAssets) {
    this.root.addChild(this.atmosphere);
    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < 4; i++) {
        const sprite = new Sprite(assets.effect(i % 2 ? "haze" : "cloud"));
        sprite.anchor.set(0.5);
        sprite.position.set(((i * 137 + layer * 67) % 460) - 50, i * 230 - 160);
        sprite.width = 190 + layer * 62;
        sprite.height = sprite.width * 0.7;
        sprite.alpha = [0.13, 0.17, 0.11][layer];
        this.root.addChild(sprite);
        this.clouds.push({ sprite, speed: 5 + layer * 12 });
      }
    }
    for (let i = 0; i < 18; i++) {
      const x = (i * 73) % 360, y = (i * 131) % 780 - 100;
      this.wind.moveTo(x, y).lineTo(x - 2, y + 18).stroke({ color: 0xd4e7f4, width: 0.6, alpha: 0.055 });
    }
    this.root.addChild(this.wind);
  }
  update(delta: number, elapsed: number, boss: boolean, reducedMotion: boolean) {
    this.atmosphere.tint = boss ? 0xb49bad : elapsed > 130 ? 0xc2d7ef : 0xffffff;
    this.wind.visible = !reducedMotion;
    this.wind.y = (this.wind.y + delta * 21) % 80;
    for (const cloud of this.clouds) {
      cloud.sprite.y += delta * cloud.speed * (reducedMotion ? 0.08 : 1);
      if (cloud.sprite.y > 850) cloud.sprite.y -= 1100;
    }
  }
}
