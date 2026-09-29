import { Container, Sprite } from "pixi.js";
import type { ProjectileEntity } from "../airCombatRuntime";
import { getAmmoVisualKey, getMissileVisual, missileRenderRotation } from "../airCombatAmmo";
import type { AirCombatAssets } from "./AirCombatPixiAssets";
import { getMissilePose } from "../airCombatMissilePresentation";

/** Reused roots own body/glow only; shared world-space exhaust cannot bend with the root. */
class MissileVisualNode {
  root=new Container(); body=new Sprite(); reactor=new Sprite();
  halo=new Sprite(); highlight=new Sprite();
  glows=[new Sprite(),new Sprite()];
  constructor(assets:AirCombatAssets) {
    this.halo.texture=this.highlight.texture=assets.effect("charge");
    this.halo.anchor.set(.5);this.highlight.anchor.set(.5);
    this.halo.blendMode=this.highlight.blendMode="add";
    this.root.addChild(this.halo);
    for(let i=0;i<2;i++) {
      this.glows[i].texture=assets.effect("charge");this.glows[i].anchor.set(.5);
      this.glows[i].blendMode="add";
      this.root.addChild(this.glows[i]);
    }
    this.body.anchor.set(.5);this.root.addChild(this.body);
    this.reactor.texture=assets.effect("charge");this.reactor.anchor.set(.5);this.reactor.blendMode="add";
    this.root.addChild(this.reactor,this.highlight);
  }
  update(p:ProjectileEntity,assets:AirCombatAssets,reducedMotion:boolean) {
    const visual=getMissileVisual(p)!;
    this.root.visible=true;this.root.position.set(p.x,p.y);this.root.rotation=missileRenderRotation(getMissilePose(p,reducedMotion).heading);
    this.body.texture=assets.effect(getAmmoVisualKey(p)!);this.body.width=visual.width;this.body.height=visual.height;
    const friendly=p.owner!=="enemy",tint=visual.engineNozzles[0]?.tint??0xffffff;
    this.halo.visible=this.highlight.visible=friendly;
    this.halo.tint=tint;this.halo.width=visual.width*1.7;this.halo.height=visual.height*1.35;
    this.halo.alpha=reducedMotion?.25:.38;
    this.highlight.tint=tint;this.highlight.width=visual.width*.5;this.highlight.height=visual.height*.8;this.highlight.alpha=.6;
    const powered=p.missileState==="powered";
    for(let i=0;i<2;i++) {
      const nozzle=visual.engineNozzles[i],glow=this.glows[i];
      glow.visible=!!nozzle;
      if(!nozzle)continue;
      glow.position.set(nozzle.x,nozzle.y);glow.width=nozzle.flameWidth*(friendly?2.6:2);glow.height=nozzle.flameWidth*(friendly?3.2:2);
      glow.tint=nozzle.tint;glow.alpha=(powered?(friendly?.8:.65):(friendly?.3:.18))*(reducedMotion?.65:1);
    }
    this.reactor.visible=p.bigBang;
    this.reactor.position.set(0,-9.4);this.reactor.width=15;this.reactor.height=4;
    this.reactor.tint=0xffbc4d;this.reactor.alpha=reducedMotion?.25:.23+.12*Math.sin(p.missileAge*(p.fuseStarted?15:4));
  }
}
export class AirCombatMissilePool {
  private live=new Map<number,MissileVisualNode>();private free:MissileVisualNode[]=[];private seen=new Set<number>();
  constructor(private parent:Container,private assets:AirCombatAssets,private limit:number){}
  begin(){this.seen.clear();}
  render(p:ProjectileEntity,reducedMotion:boolean){
    let node=this.live.get(p.id);
    if(!node){if(this.live.size>=this.limit)return;node=this.free.pop()??new MissileVisualNode(this.assets);this.parent.addChild(node.root);this.live.set(p.id,node);}
    this.seen.add(p.id);node.update(p,this.assets,reducedMotion);
  }
  end(){for(const [id,node] of this.live)if(!this.seen.has(id)){node.root.visible=false;this.live.delete(id);this.free.push(node);}}
  destroy(){for(const node of [...this.live.values(),...this.free])node.root.destroy({children:true});this.live.clear();this.free.length=0;}
}
