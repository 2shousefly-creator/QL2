import { DamageTextLayout } from "../airCombatDamageLayout";
import { mirrorPoint } from "../airCombatMirrorTransform";
import { Container, Text, TextStyle } from "pixi.js";
import { DamageLabelPool, DAMAGE_LABEL_SECONDS, NORMAL_DAMAGE_FONT_SIZE, CINDER_TOTAL_FONT_SIZE, cinderBurnLabels } from "../airCombatFeedback";
import { GAMEPLAY_SAFE_RECT } from '../airCombatConfig';
import type { CombatWorld } from "../airCombatRuntime";

export class AirCombatDamageText {
  readonly root = new Container();
  private pool = new DamageLabelPool();
  private normal = new TextStyle({ fontFamily: "Arial", fontSize: NORMAL_DAMAGE_FONT_SIZE, fontWeight: "500", fill: 0xfde047, stroke: { color: 0x151c29, width: 3 } });
  private critical = new TextStyle({ fontFamily: "Arial", fontSize: NORMAL_DAMAGE_FONT_SIZE, fontWeight: "800", fill: 0xff4d55, stroke: { color: 0x310d17, width: 3 } });
  private shielded = new TextStyle({ fontFamily: "Arial", fontSize: NORMAL_DAMAGE_FONT_SIZE, fontWeight: "500", fill: 0xffffff, stroke: { color: 0x325777, width: 3 } });
  private burnStyle = new TextStyle({fontFamily:'Arial',fontSize:CINDER_TOTAL_FONT_SIZE,fontWeight:'500',fill:0xffd179,stroke:{color:0x382013,width:1.2}});
  private totals: {number:Text;icon:Text}[] = [];
  private sprites = this.pool.labels.map(() => {
    const text = new Text({ text: "", style: this.normal, resolution: 2 });
    text.anchor.set(0.5); text.visible = false; this.root.addChild(text);
    return text;
  });
  private revisions = new Uint32Array(this.sprites.length);

  update(world: CombatWorld, delta: number, reducedMotion: boolean, rotated = false, layout = new DamageTextLayout()) {
    this.pool.update(world, delta);
    const totals=cinderBurnLabels(world,rotated);
    for(let i=0;i<Math.max(totals.length,this.totals.length);i++){
      const label=totals[i];let view=this.totals[i];
      if(!view&&label){
        const number=new Text({text:'',style:this.burnStyle,resolution:2});number.anchor.set(.5);
        const icon=new Text({text:'🔥',style:this.burnStyle,resolution:2});icon.anchor.set(1,.5);
        view={number,icon};this.totals.push(view);this.root.addChild(number,icon);
      }
      if(!view)continue;
      view.number.visible=view.icon.visible=!!label;
      if(!label)continue;
      view.number.text=label.text;
      const half=view.number.width/2,gap=2;
      const x=Math.max(GAMEPLAY_SAFE_RECT.left+half+view.icon.width+gap+1,Math.min(GAMEPLAY_SAFE_RECT.right-half-1,label.x));
      const iconSpace=view.icon.width+gap;
      const placed=layout.place(x-iconSpace/2,label.y,view.number.width+iconSpace+2,Math.max(view.number.height,view.icon.height)+2);
      if(!placed){view.number.visible=view.icon.visible=false;continue;}
      const numberX=placed.x+iconSpace/2;
      view.number.position.set(numberX,placed.y);view.icon.position.set(numberX-half-gap,placed.y);
      view.number.alpha=view.icon.alpha=label.alpha;
    }
    for (let i = 0; i < this.sprites.length; i++) {
      const label = this.pool.labels[i], text = this.sprites[i];
      text.visible = label.active;
      if (!label.active) continue;
      if (this.revisions[i] !== label.revision) {
        this.revisions[i] = label.revision;
        text.style = label.critical ? this.critical : label.damageKind === "shield" ? this.shielded : this.normal;
        text.text = label.text;
      }
      const progress = label.age / DAMAGE_LABEL_SECONDS;
      const position = rotated ? mirrorPoint(label.x, label.y) : label;
      text.scale.set((label.critical ? 1.2 : 1) * (reducedMotion ? 1 : 1 + 0.16 * Math.max(0, 1 - label.age / 0.12)));
      const placed=layout.place(position.x + label.offset * (reducedMotion ? 0.4 : 0.4 + progress),
        position.y - (rotated?20:0) - progress * (reducedMotion ? 7 : 24),text.width+2,text.height+2);
      if(!placed){text.visible=false;continue;}
      text.position.set(placed.x,placed.y);
      text.alpha = Math.min(1, (1 - progress) * 2);
    }
  }

  destroy() { this.root.destroy({ children: true }); }
}
