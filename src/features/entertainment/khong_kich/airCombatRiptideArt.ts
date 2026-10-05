import aircraft from '../../../assets/khong-kich/riptide/aircraft.png';
import icons from '../../../assets/khong-kich/riptide/icons.png';
import vfx from '../../../assets/khong-kich/riptide/vfx.png';
import type { AtlasFrame } from './pixi/airCombatPixiTypes';
import type { CombatWorld } from './airCombatRuntime';
import { riptideState, riptideBladePoints, riptideMovement, riptideSuppressed } from './airCombatRiptideRuntime';
import { RIPTIDE } from './airCombatRiptideConfig';

export const RIPTIDE_ART={aircraft,icons,vfx};
export const RIPTIDE_ICON_CELLS={riptide_afterwash:[0,0],riptide_wellspring:[1,0],riptide_tidal_blades:[2,0],riptide_confluence:[0,1],riptide_waterform:[1,1]} as const;
export const RIPTIDE_FRAMES={
 riptide_body:{atlas:'riptideAircraft',rect:[0,0,1,1]},
 riptide_ring:{atlas:'riptideVfx',rect:[0,0,.5,.5]},
 riptide_slash:{atlas:'riptideVfx',rect:[.5,0,.5,.5]},
 riptide_basic_ammo:{atlas:'riptideVfx',rect:[0,.5,.5,.5]},
 riptide_splash:{atlas:'riptideVfx',rect:[.5,.5,.5,.5]},
 riptide_pressure:{atlas:'riptideIcons',rect:[2/3,.5,1/3,.5]},
} as const satisfies Record<string,AtlasFrame>;
export type RiptideVisualKey=keyof typeof RIPTIDE_FRAMES;
export const RIPTIDE_SPRITE_BUDGET=384;
export type RiptidePainter=(id:number,key:RiptideVisualKey,x:number,y:number,width:number,height:number,rotation:number,alpha:number,additive:boolean)=>void;
/** Reuses preloaded water textures; time/charge/hit sets come only from the owner runtime. */
export function paintRiptide(w:CombatWorld,paint:RiptidePainter,reduced:boolean) {
 const s=riptideState(w),now=w.elapsed;let index=0;
 const draw=(key:RiptideVisualKey,x:number,y:number,width:number,height=width,rotation=0,alpha=1,additive=false)=>{
  if(index<RIPTIDE_SPRITE_BUDGET)paint(-700000-index++,key,x,y,width,height,rotation,Math.min(1,alpha),additive);
 };
 const ring=(x:number,y:number,r:number,alpha:number,angle=0,additive=false)=>draw('riptide_ring',x,y,r*2/.88,r*2/.88,angle,alpha,additive);
 // A dark water body preserves texture; the narrow additive layer lights only its crest.
 const crest=(x:number,y:number,width:number,height:number,angle:number,alpha:number)=>{
  draw('riptide_basic_ammo',x,y,width,height,angle,alpha);
  draw('riptide_basic_ammo',x,y,width*.48,height*.94,angle,alpha*(reduced?.5:.85),true);
 };
 // Fixed trail samples, no particles or wall-clock state. Each lane stays inside its skill radius.
 const current=(lane:number,count:number,time:number,radius:number,inward:boolean,alpha:number)=>{
  const phase=(time*(inward?.9:.38)+lane/count)%1,segments=reduced?3:6;
  for(let j=segments-1;j>=0;j--){
   const age=j*.035,p=(phase-age+1)%1;
   const angle=lane*Math.PI*2/count+(inward?p*1.65:time*.8-age*3.5+Math.sin(p*Math.PI*2+lane)*.12);
   const r=inward?26+(radius-40)*(1-p):radius*(.48+.38*(lane%2)) + Math.sin(p*Math.PI*2+lane)*7;
   const x=w.playerX+Math.cos(angle)*r,y=w.playerY+Math.sin(angle)*r;
   const tangent=angle+(inward?2.05:Math.PI/2),fade=(1-j/segments)*alpha*(inward?Math.sin(p*Math.PI):1);
   draw('riptide_basic_ammo',x,y,j===0?10:7,j===0?29:22,tangent+Math.PI/2,fade);
   if(j===0)draw('riptide_basic_ammo',x,y,5,25,tangent+Math.PI/2,fade*.85,true);
  }
 };
 if(w.aircraft.aircraftId==='riptide'&&w.aircraft.currentHp>0) {
  const flow=reduced?0:Math.sin(now*3)*.1;
  draw('riptide_basic_ammo',w.playerX,w.playerY-3,7,17,0,.5+flow);
  for(const side of [-1,1])draw('riptide_basic_ammo',w.playerX+side*5,w.playerY+23,5,18,Math.PI,.32);
  if((w.aircraft.coreState.timers.riptideSurvivalCue??0)>w.aircraft.coreState.time)ring(w.playerX,w.playerY,27,reduced?.35:.65,-now);
 }
 const well=s.wellspring;if(well) {
  const phase=(now-well.at)%1;
  for(let i=0;i<2;i++){const angle=i*Math.PI+now*.7,r=30-phase*18;draw('riptide_basic_ammo',w.playerX+Math.cos(angle)*r,w.playerY+Math.sin(angle)*r,8,18,angle-Math.PI/2,.55);}
  if(well.rank>=4)for(const side of [-1,1])draw('riptide_slash',w.playerX+side*14,w.playerY,24,42,side*Math.PI/2,.65);
 }
 const blades=s.blades;if(blades) {
  const elapsed=Math.min(1.2,now-blades.at);
  for(let side=0;side<2;side++) {
   if(!reduced)for(let trail=2;trail>=1;trail--){
    if(elapsed<trail*.024)continue;
    const wake=riptideBladePoints(w.playerX,w.playerY,elapsed-trail*.024,side);
    for(let j=2;j<wake.length;j+=2){const a=wake[j-1],b=wake[j];draw('riptide_basic_ammo',(a.x+b.x)/2,(a.y+b.y)/2,19,Math.hypot(b.x-a.x,b.y-a.y)+23,Math.atan2(b.y-a.y,b.x-a.x)+Math.PI/2,.26/trail,true);}
   }
   const points=riptideBladePoints(w.playerX,w.playerY,elapsed,side);
   for(let j=1;j<points.length;j++) {const a=points[j-1],b=points[j];crest((a.x+b.x)/2,(a.y+b.y)/2,RIPTIDE.bladeHalfWidth*2,Math.hypot(b.x-a.x,b.y-a.y)+20,Math.atan2(b.y-a.y,b.x-a.x)+Math.PI/2,.98);}
   const tip=points[points.length-1],angle=elapsed/RIPTIDE.bladePass*Math.PI+side*Math.PI;
   draw('riptide_slash',tip.x,tip.y,35,35,angle,1);
   draw('riptide_slash',tip.x,tip.y,35,35,angle,reduced?.32:.65,true);
  }
  if(blades.rank>=3)for(const e of w.enemies)if(e.hp>0&&blades.hits[0].has(e.id)&&!blades.hits[1].has(e.id))ring(e.x,e.y,18,.45);
 }
 const con=s.confluence;if(con) {
  const time=reduced?0:now-con.at;
  if(!con.exploded) {
   ring(w.playerX,w.playerY,RIPTIDE.confluenceRadius,s.waterform?.32:.5,time*.24);
   ring(w.playerX,w.playerY,RIPTIDE.confluenceRadius,s.waterform?.2:.32,time*.24,true);
   const lanes=reduced?3:5;
   for(let i=0;i<lanes;i++)current(i,lanes,time,RIPTIDE.confluenceRadius,true,s.waterform?.65:.9);
   for(let i=0;i<3;i++){const angle=i*Math.PI*2/3+time*.9,phase=(time*1.1+i/3)%1,r=30+(1-phase)*110;
    draw('riptide_slash',w.playerX+Math.cos(angle)*r,w.playerY+Math.sin(angle)*r,38,62,angle+Math.PI/2,.72);}
   const coreRadius=22+(1-(now-con.at)/RIPTIDE.pullDuration)*20;
   ring(w.playerX,w.playerY,coreRadius,.78,-time);
   ring(w.playerX,w.playerY,coreRadius,reduced?.2:.38,-time,true);
  }else crest(w.playerX,w.playerY,20,28,reduced?0:Math.sin(time*10)*.08,.98);
 }
 const water=s.waterform;if(water) {
  const time=reduced?0:now-water.at,overlap=con?.78:1;
  ring(w.playerX,w.playerY,RIPTIDE.waterRadius,.55*overlap,time*.2);
  ring(w.playerX,w.playerY,RIPTIDE.waterRadius,(reduced?.18:.32)*overlap,time*.2,true);
  const lanes=reduced?3:5+water.rank;
  for(let i=0;i<lanes;i++)current(i,lanes,time,RIPTIDE.waterRadius,false,.8*overlap);
  draw('riptide_body',w.playerX,w.playerY,88+water.rank*5,88+water.rank*5,0,.22+water.rank*.05);
  draw('riptide_body',w.playerX,w.playerY,88+water.rank*5,88+water.rank*5,0,(reduced?.08:.13)+water.rank*.025,true);
  for(let i=0;i<water.rank+1;i++){const angle=(i/(water.rank+1))*Math.PI*2+time*.55,x=w.playerX+Math.cos(angle)*24,y=w.playerY+Math.sin(angle)*24;
   draw('riptide_slash',x,y,25,43,angle,.9);draw('riptide_slash',x,y,25,43,angle,reduced?.2:.38,true);}
  for(let i=0;i<4;i++)if(water.charge>i*4)crest(w.playerX+(i-1.5)*5,w.playerY,5,13,0,Math.min(1,(water.charge-i*4)/4));
 }
 for(const e of w.enemies)if(e.hp>0) {
  if(riptideMovement(w,e)<1)draw('riptide_slash',e.x,e.y+7,e.radius*2.4,14,0,.6);
  if(riptideSuppressed(w,e))draw('riptide_pressure',e.x,e.y-e.radius-9,14,14,0,.85);
 }
 for(const e of s.effects) {
  const p=Math.max(0,Math.min(1,(now-e.at)/e.life)),alpha=(1-p)*(reduced?.45:.8);
  if(e.kind==='heal'||e.kind==='cleanse')ring(e.x,e.y,e.radius*(1-p*.8),alpha);
  else if(e.kind==='refund'||e.kind==='leech'){draw('riptide_basic_ammo',e.x+(w.playerX-e.x)*p,e.y+(w.playerY-e.y)*p,7,13,0,alpha);}
  else if(e.kind==='pulse'){ring(e.x,e.y,e.radius,alpha*.6);ring(e.x,e.y,e.radius,alpha*(reduced?.15:.4),0,true);}
  else {const radius=e.radius*(.65+p*.35);draw('riptide_splash',e.x,e.y,radius*2/.88,radius*2/.88,0,alpha*(.4+.6*e.strength));ring(e.x,e.y,radius,alpha*.3);
   if(e.kind==='burst'||e.kind==='impact')ring(e.x,e.y,radius,alpha*(reduced?.2:.55)*(.4+.6*e.strength),0,true);}
 }
 if(w.aircraft.aircraftId==='riptide'&&w.destruction){const p=Math.min(1,(now-w.destruction.at)/.8);draw('riptide_splash',w.playerX,w.playerY,70+p*50,70+p*50,0,.7*(1-p));}
}
