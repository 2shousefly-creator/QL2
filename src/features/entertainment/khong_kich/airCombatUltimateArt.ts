import atlas from "../../../assets/khong-kich/26.25.0/compat/v2-ultimate-vfx-atlas.png";
import type { AtlasFrame } from "./pixi/airCombatPixiTypes";
import type { CombatWorld, ProjectileEntity } from "./airCombatRuntime";
import { skillRank } from "./airCombatSkillRanks";
import { VIPER_ULTIMATE_SIZE } from "./airCombatAmmo";
import { getMissilePose } from "./airCombatMissilePresentation";
import { FLIGHT_BODY_FRAMES } from './airCombatFlightArt';
import { aircraftBuffPoint } from './airCombatBuffArt';
export const ULTIMATE_ART = atlas;
const frame=(index:number):AtlasFrame=>({atlas:"ultimateVfx",rect:[index%4/4,Math.floor(index/4)/7,1/4,1/7]});
export const ULTIMATE_FRAMES={
 ultimateViperMissile:FLIGHT_BODY_FRAMES.ultimateViperMissile,ultimateViperExhaust:frame(1),ultimateViperLaunch:frame(2),ultimateViperIntercept:frame(3),
 ultimateViperImpact:frame(4),ultimateViperBurn:frame(5),ultimateViperData:frame(6),ultimateTitanShell:frame(7),
 ultimateTitanTrail:frame(8),ultimateTitanMuzzle:frame(9),ultimateTitanImpact:frame(10),ultimateHawk:frame(11),
 ultimateHawkGate:frame(12),ultimateHawkDock:frame(13),ultimateHawkEngine:frame(14),ultimateHawkBolt:frame(15),
 ultimateHawkRage:frame(16),ultimateHawkSync:frame(17),ultimateMeteor:frame(18),ultimateMeteorTrail:frame(19),
 ultimateMeteorTarget:frame(20),ultimateMeteorImpact:frame(21),ultimateDoom:frame(22),ultimateDoomTarget:frame(23),
 ultimateDoomImpact:frame(24),ultimateInterferenceBand:frame(25),ultimateDisintegrate:frame(26),
};
export type UltimateVisualKey=keyof typeof ULTIMATE_FRAMES;
export type UltimatePainter=(id:number,key:UltimateVisualKey,x:number,y:number,width:number,height:number,rotation:number,alpha:number,additive?:boolean)=>void;
export const ultimateBody=(key:UltimateVisualKey)=>["ultimateViperMissile","ultimateTitanShell","ultimateHawk","ultimateHawkBolt","ultimateMeteor","ultimateDoom"].includes(key);
export function ultimateProjectileVisual(p:ProjectileEntity):UltimateVisualKey|undefined {
 if(p.mirrorBorrowed)return undefined;
 if(p.skillId==="missile_swarm"&&p.projectileKind==="missile")return "ultimateViperMissile";
 if(p.skillId==="sweeping_cannon")return "ultimateTitanShell";
 if(p.owner==="drone"&&p.skillId==="escort_drone")return "ultimateHawkBolt";
 return undefined;
}
/** Shared presentation only: stable IDs use bounded Pixi pools and the Canvas atlas fallback. */
export function paintUltimates(w:CombatWorld,draw:UltimatePainter,reduced:boolean) {
 const now=w.elapsed,s=w.aircraft;
 for(const p of w.projectiles){
  const key=ultimateProjectileVisual(p);if(!key)continue;
  const missile=key==="ultimateViperMissile",titan=key==="ultimateTitanShell";
  const angle=missile?getMissilePose(p,reduced).heading+Math.PI/2:Math.atan2(p.vy,p.vx)+Math.PI/2;
  const dx=Math.sin(angle),dy=-Math.cos(angle),width=missile?VIPER_ULTIMATE_SIZE.width:titan?12:11*.8,height=missile?VIPER_ULTIMATE_SIZE.height:titan?30:26*.8,id=p.id*8;
  const trail:UltimateVisualKey=missile?"ultimateViperExhaust":titan?"ultimateTitanTrail":"ultimateHawkEngine";
  const length=missile?(p.missileState==="powered"?48:20):titan?38:27*.8;
  // Missile wake is world-space shared history; this dedicated pool owns its body.
  if(!missile)draw(id+1,trail,p.x-dx*height*.65,p.y-dy*height*.65,width,length*(reduced?.85:1.3),angle,.95);
  draw(id+3,key,p.x,p.y,width*1.65,height*1.2,angle,reduced?.22:.34,true);
  draw(id,key,p.x,p.y,width,height,angle,1);
  draw(id+4,key,p.x,p.y,width*.65,height*.85,angle,.45,true);
 }
 if(s.droneActive){
  const rage=(s.coreState.timers.hawkRage??0)>s.coreState.time;
  const target=w.enemies.find(e=>e.id===w.droneTargetId&&e.hp>0),angle=target?Math.atan2(target.y-w.droneY,target.x-w.droneX)+Math.PI/2:0;
  const dx=Math.sin(angle),dy=-Math.cos(angle);
  draw(-1,"ultimateHawkEngine",w.droneX-dx*23,w.droneY-dy*23,20,rage?42:29,angle,.85);
  if(rage){
   const point=aircraftBuffPoint(w,1);
   draw(-2,"ultimateHawkRage",w.droneX-dx*17,w.droneY-dy*17,14,20,angle,.9);
   draw(-3,"ultimateHawkRage",point.x,point.y,14*point.scale,20*point.scale,0,.7);
  }
  if(s.dronePhase!=="active"){
   const deploy=s.dronePhase==="deploying",progress=1-(s.droneTransitionRemaining??0)/(deploy?.4:.38);
   draw(-4,deploy?"ultimateHawkGate":"ultimateHawkDock",w.playerX,w.playerY,62,62,0,.5+Math.sin(progress*Math.PI)*.5);
  }
  draw(-5,"ultimateHawk",w.droneX,w.droneY,37,37,angle,w.droneInvulnerability>0?.7:1);
 }
 const sync=w.skillCores.syncTarget;
 if(sync!==null&&w.skillCores.syncUntil>now){
  const target=w.enemies.find(e=>e.id===sync&&e.hp>0);
  if(target){const size=target.radius*2+22;draw(-6,"ultimateHawkSync",target.x,target.y,size,size,0,.85);}
 }
 for(const e of w.enemies)if((e.burnArmorUntil??0)>now&&skillRank(s,"missile_swarm")>=3){
  const size=e.radius*2+12;draw(e.id*8+3,"ultimateViperBurn",e.x,e.y,size,size,0,.6);
 }
 for(const m of w.astra?.starfall?.pending??[]){
  const fallAt=m.at-m.fallDuration,t=Math.max(0,Math.min(1,(now-fallAt)/m.fallDuration)),id=m.id*8;
  const size=m.doom?104:43,radius=m.doom?110:skillRank(s,"starfall")>=2?65:45;
  const target=m.doom?"ultimateDoomTarget":"ultimateMeteorTarget";
  // Reticle survives the flight, but only the runtime may move its ground point.
  draw(id,target,m.x,m.y,radius*2,radius*2,0,now<fallAt?.65:.95);
  if(now+1e-8<fallAt)continue;
  // A 200ms light-speed streak. The star does not exist during the aiming phase.
  const travel=1-t*t,x=m.x-140*travel,y=m.y-520*travel,angle=-Math.atan2(140,520);
  const dx=140/Math.hypot(140,520),dy=520/Math.hypot(140,520),trail=reduced?size*1.5:Math.max(230,size*3.5);
  draw(id+1,"ultimateMeteorTrail",x-dx*trail*.4,y-dy*trail*.4,size*.75,trail,angle,.95,true);
  if(!reduced){
   draw(id+2,"ultimateMeteorTrail",x-dx*trail*.5-7,y-dy*trail*.5,size*.22,trail*1.5,angle,.65,true);
   draw(id+3,"ultimateMeteorTrail",x-dx*trail*.5+7,y-dy*trail*.5,size*.16,trail*1.8,angle,.8,true);
  }
  const body=m.doom?"ultimateDoom":"ultimateMeteor";
  draw(id+5,body,x,y,size*1.65,size*1.65,angle,reduced?.18:.48,true);
  draw(id+4,body,x,y,size,size,angle,1);
  draw(id+6,body,x,y,size*.65,size*.65,angle,.85,true);
 }
 for(const impact of w.astra?.impacts??[]){
  const age=now-impact.at,t=age/.75;if(t<0||t>=1)continue;
  const size=impact.radius*2,key=impact.doom?"ultimateDoomImpact":"ultimateMeteorImpact",id=impact.id*8;
  const blast=.35+Math.min(1,age/.12)*.8,fade=(1-t)*(1-t);
  draw(id,key,impact.x,impact.y,size*blast,size*blast,0,1-t);
  // Hot impact core, expanding shock front, then a slower dissipating corona.
  draw(id+1,key,impact.x,impact.y,size*.6,size*.6,0,Math.max(0,1-age/.22)*(reduced?.3:.95),true);
  if(!reduced){
   const ring=.65+Math.sqrt(t)*1.15;
   draw(id+2,impact.doom?"ultimateDoomTarget":"ultimateMeteorTarget",impact.x,impact.y,size*ring,size*ring,0,fade*.85,true);
   draw(id+3,key,impact.x,impact.y,size*(.9+t*.6),size*(.9+t*.6),.45,fade*.6,true);
   draw(id+4,"ultimateMeteorTrail",impact.x,impact.y-size*.3,size*.28,size*(1.5-t),0,Math.max(0,1-age/.3)*.65,true);
   draw(id+5,"ultimateMeteorTrail",impact.x,impact.y,size*.12,size*1.9,Math.PI/2,Math.max(0,1-age/.18)*.85,true);
  }
 }
 for(const e of w.visualEvents){
  if(e.kind!=="ultimate_effect"||!e.ultimateEffect)continue;
  const age=now-(e.at??now),duration=e.ultimateEffect==="ultimateHawkDock"?.38:e.ultimateEffect==="ultimateViperData"?.5:.28;
  if(age<0||age>=duration)continue;
  const progress=age/duration,size=e.size*(reduced?1:.75+progress*.4);
  draw(-100000-e.id,e.ultimateEffect,e.x,e.y,size,size,0,1-progress);
 }
}
