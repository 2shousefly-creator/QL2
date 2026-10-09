import { skillRank } from "./airCombatSkillRanks";
import { playerAirframeScale } from "./airCombatReleaseState";
import aircraft from "../../../assets/khong-kich/astra/aircraft.png";
import effects from "../../../assets/khong-kich/26.25.0/compat/astra-effects.png";
import combatVfx from "../../../assets/khong-kich/26.25.0/compat/astra-combat-vfx.png";
import type { CombatWorld } from "./airCombatRuntime";
import type { TacticalPainter } from "./airCombatTacticalVisuals";
import type { AtlasFrame } from "./pixi/airCombatPixiTypes";
import { hasCore } from "./airCombatCoreEffects";
import { GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import { astraOrbitProtectionActive, meteorSpearEndpoints, orbitBulletPosition, orbitConvergencePosition } from "./airCombatAstra";
export const ASTRA_ART={aircraft,effects,combatVfx};
const cell=(column:number,row:number):AtlasFrame=>({atlas:"astraVfx",rect:[column/4,row/4,1/4,1/4]});
const shared=(column:number,row:number):AtlasFrame=>({atlas:"vfx",rect:[column/4,row/4,1/4,1/4]});
export const ASTRA_VFX_FRAMES={
  astra_guard:cell(0,3),astra_spearBeam:cell(1,3),astra_spearTip:cell(2,3),
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
export const STELLAR_TRACK_STYLE={sheath:0xffa455,core:0xffe2b0,width:7,coreWidth:1.2} as const;
const clamp=(t:number)=>Math.max(0,Math.min(1,t));
/** Shared world state feeds Canvas and Pixi. Sprite bounds never participate in damage. */
export function paintAstra(w:CombatWorld,p:AstraPainter,reduced:boolean) {
  const r=w.astra;if(!r||w.ended)return;const now=w.elapsed;
  if(astraOrbitProtectionActive(w)) {
    const size=92*playerAirframeScale(w.aircraft);
    p.sprite(-30,"astra_guard",w.playerX,w.playerY,size,size,reduced?0:Math.sin(now*.8)*.12,.9);
  }
  for(const beam of r.meteorSpears??[]) {
    if(now<beam.warningStartsAt||now>=beam.beamEndsAt)continue;
    const {start,end}=meteorSpearEndpoints(beam),dx=end.x-start.x,dy=end.y-start.y;
    if(now<beam.beamStartsAt){
      p.line(start.x,start.y,end.x,end.y,STELLAR_TRACK_STYLE.sheath,.25,STELLAR_TRACK_STYLE.width);
      p.line(start.x,start.y,end.x,end.y,STELLAR_TRACK_STYLE.core,.8,STELLAR_TRACK_STYLE.coreWidth);
    } else {
      const width=beam.projectileHitboxWidth*2,angle=Math.atan2(dy,dx)+Math.PI/2;
      const alpha=Math.min(1,(beam.beamEndsAt-now)/.15),id=beam.id*32;
      // A square spear illustration cannot be stretched into a full-height beam.
      // Continuous light layers retain the captured trajectory and authored width.
      const pulse=reduced?1:1+Math.sin((now-beam.beamStartsAt)*22)*.04;
      p.line(start.x,start.y,end.x,end.y,0xff9a38,alpha*.14,width*2.6*pulse);
      p.line(start.x,start.y,end.x,end.y,0xffc46b,alpha*.36,width*1.55*pulse);
      p.line(start.x,start.y,end.x,end.y,0xffe8b5,alpha*.9,width);
      p.line(start.x,start.y,end.x,end.y,0xffffff,alpha,width*.48);
      p.sprite(id,"astra_corona",start.x,start.y,width*2.4,width*2.4,angle,alpha*.85);
      const travel=reduced?1:clamp((now-beam.beamStartsAt)/.09);
      p.sprite(id+1,"astra_flash",start.x+dx*travel,start.y+dy*travel,width*2,width*2,angle,alpha);
    }
  }
  for(const f of r.flashes){const a=1-(now-f.at)/.2;p.circle(f.x,f.y,7,0xffebbf,a*.6,true);}
  if(r.orbit){
    const radius=(skillRank(w.aircraft, "orbit_reversal") >= 2)?92:72;
    p.circle(w.playerX,w.playerY,radius,0xff9138,.8);p.circle(w.playerX,w.playerY,radius-4,0xffdfab,.22);
    for(let i=0;i<12;i++){const a=i*Math.PI/6+(reduced?0:now*.5),a2=a+.22;
      p.line(w.playerX+Math.cos(a)*(radius-7),w.playerY+Math.sin(a)*(radius-7),w.playerX+Math.cos(a2)*(radius-7),w.playerY+Math.sin(a2)*(radius-7),0xffce88,.7,2);}
    for(let i=0;i<r.orbit.captured;i++){
      const {x,y}=orbitBulletPosition(w.playerX,w.playerY,radius,i,r.orbit.captured,now);
      p.circle(x,y,5,0xff792b,.35,true);p.circle(x,y,2,0xfff2cf,1,true);
    }
    p.label?.(w.playerX,w.playerY+radius+12,`${r.orbit.captured}/${(skillRank(w.aircraft, "orbit_reversal") >= 2)?22:16}`,0xffd397,9);
  }
  for(const release of r.orbitReleases??[])for(const b of release.bullets)if(!b.fired){
    const q=orbitConvergencePosition(release,b,w.playerX,w.playerY,now);
    if(!reduced){const tail=orbitConvergencePosition(release,b,w.playerX,w.playerY,now-.035);p.line(tail.x,tail.y,q.x,q.y,0xffb76c,.65,2);}
    p.circle(q.x,q.y,5,0xff8a38,.35,true);p.circle(q.x,q.y,2,0xfff2cf,1,true);
  }
  if(r.charge){
    const t=clamp((now-r.charge.startedAt)/Math.max(.001,r.charge.duration));
    const x=w.playerX,y=w.playerY-20*playerAirframeScale(w.aircraft);
    p.line(x,Math.max(y,GAMEPLAY_SAFE_RECT.top),x,GAMEPLAY_SAFE_RECT.top,STELLAR_TRACK_STYLE.sheath,.13+t*.12,STELLAR_TRACK_STYLE.width);
    p.line(x,Math.max(y,GAMEPLAY_SAFE_RECT.top),x,GAMEPLAY_SAFE_RECT.top,STELLAR_TRACK_STYLE.core,.45+t*.35,STELLAR_TRACK_STYLE.coreWidth);
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
  // Canvas fallback uses the same local frame pipeline; Pixi handles these events in its VFX pool.
  if(p.impactFallback){
    for(const e of w.visualEvents)if(e.kind==="astra_lance_impact"&&e.at!==undefined&&now-e.at<.22){
      const alpha=1-(now-e.at)/.22,id=e.id*32;
      p.sprite(id,"astra_explosion0",e.x,e.y,e.size,e.size,0,alpha);
      p.sprite(id+1,"astra_shockwave",e.x,e.y,e.size,e.size,0,alpha*.7);
      if(!reduced)p.sprite(id+2,"astra_sparks",e.x,e.y,e.size,e.size,0,alpha);
    }
  }
}
