import aircraft from "../../../assets/khong-kich/astra/aircraft.svg";
import effects from "../../../assets/khong-kich/astra/effects.svg";
import skills from "../../../assets/khong-kich/astra/skills.svg";
import combatVfx from "../../../assets/khong-kich/astra/combat-vfx.svg";
import type { CombatWorld } from "./airCombatRuntime";
import type { TacticalPainter } from "./airCombatTacticalVisuals";
import type { AtlasFrame } from "./pixi/airCombatPixiTypes";
import { hasCore } from "./airCombatCoreEffects";
import { GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import { orbitBulletPosition, orbitConvergencePosition } from "./airCombatAstra";
export const ASTRA_ART={aircraft,effects,skills,combatVfx};
export const ASTRA_SKILL_CELLS={orbit_reversal:0,stellar_lance:1,starfall:2} as const;
const cell=(column:number,row:number):AtlasFrame=>({atlas:"astraVfx",rect:[column/4,row/3,1/4,1/3]});
const shared=(column:number,row:number):AtlasFrame=>({atlas:"vfx",rect:[column/4,row/4,1/4,1/4]});
export const ASTRA_VFX_FRAMES={
  astra_meteor:cell(0,0),astra_meteor1:cell(1,0),astra_meteor2:cell(2,0),astra_meteor3:cell(3,0),
  astra_reticle:cell(0,1),astra_segments:cell(1,1),astra_scorch:cell(2,1),astra_flame:cell(3,1),
  astra_flame1:cell(0,2),astra_corona:cell(1,2),astra_trail:cell(2,2),astra_debris:cell(3,2),
  astra_flash:shared(1,3),astra_explosion0:shared(0,1),astra_explosion1:shared(1,1),astra_explosion2:shared(2,1),
  astra_fire:shared(3,2),astra_smoke:shared(1,2),astra_sparks:shared(0,2),astra_shockwave:shared(3,3),
};
export type AstraVisualKey=keyof typeof ASTRA_VFX_FRAMES;
export interface AstraPainter extends TacticalPainter {
  impactFallback?:boolean;
  sprite(id:number,key:AstraVisualKey,x:number,y:number,width:number,height:number,rotation:number,alpha:number):void;
}
const clamp=(t:number)=>Math.max(0,Math.min(1,t));
/** Shared world state feeds Canvas and Pixi. Sprite bounds never participate in damage. */
export function paintAstra(w:CombatWorld,p:AstraPainter,reduced:boolean) {
  const r=w.astra;if(!r||w.ended)return;const now=w.elapsed;
  for(const f of r.flashes){const a=1-(now-f.at)/.2;p.circle(f.x,f.y,7,0xffebbf,a*.6,true);}
  if(r.orbit){
    const radius=hasCore(w.aircraft,150)?92:72;
    p.circle(w.playerX,w.playerY,radius,0xff9138,.8);p.circle(w.playerX,w.playerY,radius-4,0xffdfab,.22);
    for(let i=0;i<12;i++){const a=i*Math.PI/6+(reduced?0:now*.5),a2=a+.22;
      p.line(w.playerX+Math.cos(a)*(radius-7),w.playerY+Math.sin(a)*(radius-7),w.playerX+Math.cos(a2)*(radius-7),w.playerY+Math.sin(a2)*(radius-7),0xffce88,.7,2);}
    for(let i=0;i<r.orbit.captured;i++){
      const {x,y}=orbitBulletPosition(w.playerX,w.playerY,radius,i,r.orbit.captured,now);
      p.circle(x,y,5,0xff792b,.35,true);p.circle(x,y,2,0xfff2cf,1,true);
    }
    p.label?.(w.playerX,w.playerY+radius+12,`${r.orbit.captured}/${hasCore(w.aircraft,150)?22:16}`,0xffd397,9);
  }
  for(const release of r.orbitReleases??[])for(const b of release.bullets)if(!b.fired){
    const q=orbitConvergencePosition(release,b,w.playerX,w.playerY,now);
    if(!reduced){const tail=orbitConvergencePosition(release,b,w.playerX,w.playerY,now-.035);p.line(tail.x,tail.y,q.x,q.y,0xffb76c,.65,2);}
    p.circle(q.x,q.y,5,0xff8a38,.35,true);p.circle(q.x,q.y,2,0xfff2cf,1,true);
  }
  if(r.charge){
    const t=clamp((now-r.charge.startedAt)/Math.max(.001,r.charge.duration));
    const x=w.playerX,y=w.playerY-20,wide=hasCore(w.aircraft,160)?1.55:1;
    p.line(x,Math.max(y,GAMEPLAY_SAFE_RECT.top),x,GAMEPLAY_SAFE_RECT.top,0xffa455,.13+t*.12,7*wide);
    p.line(x,Math.max(y,GAMEPLAY_SAFE_RECT.top),x,GAMEPLAY_SAFE_RECT.top,0xffe2b0,.45+t*.35,1.2);
    p.circle(x,y,7+t*7,0xffaa4b,.22+t*.2,true);
    p.circle(x,y,2+t*4,0xfff8df,.6+t*.4,true);
    for(let i=0;i<(reduced?1:3);i++){
      const radius=7+(1-t)*(17+i*9);
      p.sprite(-1-i,"astra_segments",x,y,radius*2,radius*2,reduced?0:now*(i%2?2:-2),.2+t*.5);
    }
    if(!reduced)for(let i=0;i<6;i++){
      const a=-Math.PI+i*Math.PI/5,progress=(t*1.6+i/6)%1,rad=12+(1-progress)*37;
      p.line(x+Math.cos(a)*rad,y+Math.sin(a)*rad,x+Math.cos(a)*(rad-7),y+Math.sin(a)*(rad-7),0xffd28a,(.25+t*.65)*progress,1.5);
    }
    if(t>.82)p.sprite(-10,"astra_flash",x,y,26,26,0,(t-.82)/.18);
  }
  // Reuse a fixed number of persistent sprites per field instead of emitting particles each frame.
  for(const z of r.burns){
    const alpha=clamp((z.until-now)/.8),id=z.id*32,size=z.radius*2;
    p.sprite(id,"astra_scorch",z.x,z.y,size,size,0,alpha*.9);
    p.sprite(id+1,"astra_corona",z.x,z.y,size,size,0,alpha*.28);
    for(let i=0;i<(reduced?2:3);i++){
      const a=i*Math.PI*2/3+z.id,rad=z.radius*.38,x=z.x+Math.cos(a)*rad,y=z.y+Math.sin(a)*rad;
      const frame=reduced?0:Math.floor(now*9+i)%2;
      p.sprite(id+2+i,frame?"astra_flame1":"astra_flame",x,y-z.radius*.12,z.radius*.65,z.radius*.86,0,alpha*.82);
    }
    if(!reduced)p.sprite(id+6,"astra_smoke",z.x,z.y-z.radius*.35,z.radius*1.3,z.radius,0,alpha*.18);
  }
  for(const m of r.starfall?.pending??[]) {
    const t=clamp(1-(m.at-now)),id=m.id*32;
    const pulse=reduced?1:.93+.07*Math.sin(t*t*48),lockSize=(56-12*Math.min(1,t/.35))*pulse;
    p.sprite(id,"astra_reticle",m.x,m.y,lockSize,lockSize,0,.6+t*.4);
    p.sprite(id+1,"astra_segments",m.x,m.y,lockSize,lockSize,reduced?0:(1-t)*1.4,.35+t*.55);
    const fly=1-t,x=m.x-80*fly,y=m.y-150*fly,angle=-Math.atan2(80,150);
    const dx=80/170,dy=150/170;
    // The hot rock sits near the bottom of the texture; place that leading edge on the trajectory.
    const cx=x-dx*29,cy=y-dy*29;
    p.sprite(id+2,"astra_trail",x-dx*(reduced?24:47),y-dy*(reduced?24:47),reduced?14:22,reduced?48:94,angle,.65);
    if(!reduced)p.sprite(id+3,"astra_smoke",x-dx*65,y-dy*65,40,58,angle,.24);
    const frames:AstraVisualKey[]=["astra_meteor","astra_meteor1","astra_meteor2","astra_meteor3"];
    p.sprite(id+4,frames[reduced?0:Math.floor(now*14+m.id)%4],cx,cy,43.2,86.4,angle,Math.min(1,t*3+.3));
    p.sprite(id+5,"astra_corona",x,y,33,29,angle,.6);
  }
  // Canvas fallback uses the same local frame pipeline; Pixi handles these events in its VFX pool.
  if(p.impactFallback){
    for(const i of r.impacts){
      const t=clamp((now-i.at)/.75),alpha=1-t,size=i.radius*2,id=i.id*32;
      const frames:AstraVisualKey[]=["astra_flash","astra_explosion0","astra_explosion1","astra_explosion2","astra_fire"];
      p.sprite(id,frames[Math.min(4,Math.floor(t*5))],i.x,i.y,size*(.7+t*.65),size*(.7+t*.65),0,alpha);
      p.sprite(id+1,"astra_shockwave",i.x,i.y,size*(1+t),size*(1+t),0,alpha*.8);
      p.sprite(id+2,"astra_fire",i.x,i.y,size*.65,size*.65,0,alpha*.7);
      if(!reduced){p.sprite(id+3,"astra_debris",i.x,i.y,size*(.5+t),size*(.5+t),t,alpha);p.sprite(id+4,"astra_smoke",i.x,i.y,size,size,0,alpha*.35);p.sprite(id+5,"astra_sparks",i.x,i.y,size*1.2,size*1.2,0,alpha);}
    }
    for(const e of w.visualEvents)if(e.kind==="astra_lance_impact"&&e.at!==undefined&&now-e.at<.22){
      const alpha=1-(now-e.at)/.22,id=e.id*32;
      p.sprite(id,"astra_explosion0",e.x,e.y,e.size,e.size,0,alpha);
      p.sprite(id+1,"astra_shockwave",e.x,e.y,e.size,e.size,0,alpha*.7);
      if(!reduced)p.sprite(id+2,"astra_sparks",e.x,e.y,e.size,e.size,0,alpha);
    }
  }
}
