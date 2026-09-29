import atlas from "../../../assets/khong-kich/v2/ultimate-vfx-atlas.svg";
import type { AtlasFrame } from "./pixi/airCombatPixiTypes";
import type { CombatWorld, ProjectileEntity } from "./airCombatRuntime";
import { skillRank } from "./airCombatSkillRanks";
import { VIPER_ULTIMATE_SIZE } from "./airCombatAmmo";
import { getMissilePose } from "./airCombatMissilePresentation";
export const ULTIMATE_ART = atlas;
const frame=(index:number):AtlasFrame=>({atlas:"ultimateVfx",rect:[index%4/4,Math.floor(index/4)/7,1/4,1/7]});
export const ULTIMATE_FRAMES={
 ultimateViperMissile:frame(0),ultimateViperExhaust:frame(1),ultimateViperLaunch:frame(2),ultimateViperIntercept:frame(3),
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
  const dx=Math.sin(angle),dy=-Math.cos(angle),width=missile?VIPER_ULTIMATE_SIZE.width:titan?12:11,height=missile?VIPER_ULTIMATE_SIZE.height:titan?30:26,id=p.id*8;
  const trail:UltimateVisualKey=missile?"ultimateViperExhaust":titan?"ultimateTitanTrail":"ultimateHawkEngine";
  const length=missile?(p.missileState==="powered"?48:20):titan?38:27;
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
  if(rage){draw(-2,"ultimateHawkRage",w.droneX,w.droneY,60,60,reduced?0:Math.sin(now*3)*.06,.9);draw(-3,"ultimateHawkRage",w.playerX,w.playerY,55,55,0,.5);}
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
  const t=Math.max(0,Math.min(1,1-(m.at-now)/m.fallDuration)),id=m.id*8;
  const size=m.doom?104:43,radius=m.doom?110:skillRank(s,"starfall")>=2?65:45;
  draw(id,m.doom?"ultimateDoomTarget":"ultimateMeteorTarget",m.x,m.y,radius*2,radius*2,0,.45+t*.45);
  const x=m.x-80*(1-t),y=m.y-150*(1-t),angle=-Math.atan2(80,150),dx=80/170,dy=150/170;
  draw(id+1,"ultimateMeteorTrail",x-dx*size*.65,y-dy*size*.65,size*.75,size*(reduced?1.2:2.35),angle,.95);
  if(m.doom&&!reduced){draw(id+2,"ultimateMeteorTrail",x-dx*size,y-dy*size,size*.9,size*2.2,angle-.05,.4);draw(id+3,"ultimateMeteorTrail",x-dx*size,y-dy*size,size*.7,size*2.4,angle+.07,.45);}
  draw(id+5,m.doom?"ultimateDoom":"ultimateMeteor",x,y,size*1.2,size*1.2,angle,reduced?.2:.3,true);
  draw(id+4,m.doom?"ultimateDoom":"ultimateMeteor",x,y,size,size,angle,.6+t*.4);
  draw(id+6,m.doom?"ultimateDoom":"ultimateMeteor",x,y,size*.65,size*.65,angle,.4,true);
 }
 for(const impact of w.astra?.impacts??[]){
  const age=now-impact.at,t=age/.75;if(t<0||t>=1)continue;
  const size=impact.radius*2,key=impact.doom?"ultimateDoomImpact":"ultimateMeteorImpact",id=impact.id*8;
  draw(id,key,impact.x,impact.y,size*(.5+Math.min(1,t*3)*.5),size*(.5+Math.min(1,t*3)*.5),0,1-t);
  if(impact.doom&&age>.1)draw(id+1,"ultimateDoomTarget",impact.x,impact.y,size*(.75+t*.3),size*(.75+t*.3),0,(1-t)*.75);
  if(!reduced&&age>.08)draw(id+2,key,impact.x,impact.y,size*(.7+t*.5),size*(.7+t*.5),.45,(1-t)*.4);
 }
 for(const e of w.visualEvents){
  if(e.kind!=="ultimate_effect"||!e.ultimateEffect)continue;
  const age=now-(e.at??now),duration=e.ultimateEffect==="ultimateHawkDock"?.38:e.ultimateEffect==="ultimateViperData"?.5:.28;
  if(age<0||age>=duration)continue;
  const progress=age/duration,size=e.size*(reduced?1:.75+progress*.4);
  draw(-100000-e.id,e.ultimateEffect,e.x,e.y,size,size,0,1-progress);
 }
}
