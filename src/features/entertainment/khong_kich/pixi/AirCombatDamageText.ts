import { Container, Text, TextStyle } from "pixi.js";
import { DamageLabelPool, DAMAGE_LABEL_SECONDS } from "../airCombatFeedback";
import type { CombatWorld } from "../airCombatRuntime";

export class AirCombatDamageText {
  readonly root = new Container();
  private pool = new DamageLabelPool();
  private normal = new TextStyle({ fontFamily: "Arial", fontSize: 13, fontWeight: "500", fill: 0xfde047, stroke: { color: 0x151c29, width: 3 } });
  private critical = new TextStyle({ fontFamily: "Arial", fontSize: 13, fontWeight: "800", fill: 0xff4d55, stroke: { color: 0x310d17, width: 3 } });
  private shielded = new TextStyle({ fontFamily: "Arial", fontSize: 13, fontWeight: "500", fill: 0xffffff, stroke: { color: 0x325777, width: 3 } });
  private sprites = this.pool.labels.map(() => {
    const text = new Text({ text: "", style: this.normal, resolution: 2 });
    text.anchor.set(0.5); text.visible = false; this.root.addChild(text);
    return text;
  });
  private revisions = new Uint32Array(this.sprites.length);

  update(world: CombatWorld, delta: number, reducedMotion: boolean) {
    this.pool.update(world, delta);
    for (let i = 0; i < this.sprites.length; i++) {
      const label = this.pool.labels[i], text = this.sprites[i];
      text.visible = label.active;
      if (!label.active) continue;
      if (this.revisions[i] !== label.revision) {
        this.revisions[i] = label.revision;
        text.style = label.critical ? this.critical : label.shielded ? this.shielded : this.normal;
        text.text = label.text;
      }
      const progress = label.age / DAMAGE_LABEL_SECONDS;
      text.position.set(label.x + label.offset * (reducedMotion ? 0.4 : 0.4 + progress), label.y - progress * (reducedMotion ? 7 : 24));
      text.alpha = Math.min(1, (1 - progress) * 2);
      text.scale.set((label.critical ? 1.2 : 1) * (reducedMotion ? 1 : 1 + 0.16 * Math.max(0, 1 - label.age / 0.12)));
    }
  }

  destroy() { this.root.destroy({ children: true }); }
}
