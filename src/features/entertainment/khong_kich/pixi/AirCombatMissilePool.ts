import { Container, Sprite } from "pixi.js";
import type { ProjectileEntity } from "../airCombatRuntime";
import { getAmmoVisualKey, getMissileVisual, missileRenderRotation } from "../airCombatAmmo";
import type { AirCombatAssets } from "./AirCombatPixiAssets";

/** Reused roots own all body/engine transforms; smoke is deliberately outside this tree. */
class MissileVisualNode {
  root=new Container(); body=new Sprite(); reactor=new Sprite();
  flames=[new Sprite(),new Sprite()]; glows=[new Sprite(),new Sprite()];
  constructor(assets:AirCombatAssets) {
    for(let i=0;i<2;i++) {
      this.flames[i].texture=assets.engineFlame;this.flames[i].anchor.set(.5,0);
      this.glows[i].texture=assets.effect("charge");this.glows[i].anchor.set(.5);
      this.flames[i].blendMode=this.glows[i].blendMode="add";
      this.root.addChild(this.flames[i],this.glows[i]);
    }
    this.body.anchor.set(.5);this.root.addChild(this.body);
    this.reactor.texture=assets.effect("charge");this.reactor.anchor.set(.5);this.reactor.blendMode="add";
    this.root.addChild(this.reactor);
  }
  update(p:ProjectileEntity,assets:AirCombatAssets,reducedMotion:boolean) {
    const visual=getMissileVisual(p)!;
    this.root.visible=true;this.root.position.set(p.x,p.y);this.root.rotation=missileRenderRotation(p.heading);
    this.body.texture=assets.effect(getAmmoVisualKey(p)!);this.body.width=visual.width;this.body.height=visual.height;
    const powered=p.missileState==="powered",thrust=.45+.55*Math.min(1,p.speed/Math.max(1,p.cruiseSpeed));
    for(let i=0;i<2;i++) {
      const nozzle=visual.engineNozzles[i],flame=this.flames[i],glow=this.glows[i];
      flame.visible=!!nozzle && powered;glow.visible=!!nozzle;
      if(!nozzle)continue;
      flame.position.set(nozzle.x,nozzle.y);flame.width=nozzle.flameWidth;
      flame.height=nozzle.flameLength*thrust*(reducedMotion?1:1+Math.sin(p.missileAge*24)*.05);
      flame.tint=p.bigBang?0xffffff:nozzle.tint;flame.alpha=.95;
      glow.position.set(nozzle.x,nozzle.y);glow.width=nozzle.flameWidth*2;glow.height=nozzle.flameWidth*2;
      glow.tint=nozzle.tint;glow.alpha=powered?.65:.18;
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
