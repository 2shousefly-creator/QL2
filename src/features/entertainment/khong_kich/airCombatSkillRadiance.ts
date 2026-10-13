import atlas0 from '../../../assets/khong-kich/26.31.2/skills-viper-titan-phantom.png';
import atlas1 from '../../../assets/khong-kich/26.31.2/skills-astra-cinder-riptide.png';
import atlas2 from '../../../assets/khong-kich/26.31.2/skills-argent-sylva-terra.png';
import { AIRCRAFT_CONFIGS, GAMEPLAY_SAFE_RECT as R } from './airCombatConfig';
import { cinderState, cinderWaveRadius } from './airCombatCinderRuntime';
import { cinderFuelCenters, cinderFuelGeometry } from './airCombatCinderFuel';
import { riptideState, riptideBladePoints } from './airCombatRiptideRuntime';
import { argentState } from './airCombatArgentRuntime';
import { sylvaState } from './airCombatSylvaRuntime';
import { terraState } from './airCombatTerraRuntime';
import { isUltimate } from './airCombatSkillRanks';
import type { CombatWorld } from './airCombatRuntime';
import type { SkillId } from './airCombatTypes';
import type { AtlasFrame } from './pixi/airCombatPixiTypes';

export const SKILL_RADIANCE_SOURCES={skillRadiance0:atlas0,skillRadiance1:atlas1,skillRadiance2:atlas2};
const groups:readonly (readonly SkillId[])[]=[
 ['decoy','afterburner','predator_lock','missile_swarm','armor_shield','heavy_bomb','gravity_anchor','sweeping_cannon','invisibility','focus_laser','electronic_interference','escort_drone'],
 ['orbit_reversal','stellar_lance','twin_reflection','starfall','cinder_fire_shield','cinder_fuel_barrage','cinder_heat_wave','cinder_inferno_beam','riptide_wellspring','riptide_tidal_blades','riptide_confluence','riptide_waterform'],
 ['argent_guard_stance','argent_blade_cast','argent_blade_recall','argent_heavenly_blade_array','sylva_symbiosis','sylva_acid_burst','sylva_parasitic_seed','sylva_deathbloom','terra_reactive_rock_armor','terra_seismic_cannon','terra_strata_clamp','terra_geocore_overdrive'],
];
// One four-frame animation per skill; precomputed immutable frames avoid texture churn.
const frames=Object.fromEntries(groups.flatMap((skills,group)=>skills.map((id,index)=>[id,
 Array.from({length:4},(_,phase):AtlasFrame=>({atlas:('skillRadiance'+group) as AtlasFrame['atlas'],rect:[((index%2)*4+phase)/8,Math.floor(index/2)/6,1/8,1/6]}))
]))) as Record<SkillId,AtlasFrame[]>;
export type SkillRadiancePainter=(id:number,frame:AtlasFrame,x:number,y:number,width:number,height:number,rotation:number,alpha:number,additive:boolean)=>void;
export const SKILL_RADIANCE_BUDGET=192;

/** Authored raster animation on real casts, active skills and damage contacts.
 * Pure presentation: combat time, no RNG, no timers, no collision/HP mutations. */
export function paintSkillRadiance(w:CombatWorld,draw:SkillRadiancePainter,reduced:boolean){
 const now=w.elapsed,s=w.aircraft;
 if(s.currentHp<=0||w.destruction)return;
 let count=0;
 const sprite=(id:number,skill:SkillId,x:number,y:number,width:number,height=width,phase=now*7,alpha=.65,rotation=0,hot=true)=>{
  if(count>=SKILL_RADIANCE_BUDGET)return;
  const frame=frames[skill][Math.max(0,Math.min(3,Math.floor(phase)%4))];
  draw(id,frame,x,y,width,height,rotation,alpha,false);count++;
  if(hot&&!reduced&&count<SKILL_RADIANCE_BUDGET){draw(id+1,frame,x,y,width*.92,height*.92,rotation,alpha*.5,true);count++;}
 };
 const aura=(id:number,skill:SkillId,size:number,alpha=.48)=>sprite(id,skill,w.playerX,w.playerY,size,size,reduced?1:now*6,alpha);
 // Every skill has a distinct ignition animation, even when its damage is delayed.
 let ignitions=0,impacts=0;
 for(let i=w.visualEvents.length-1;i>=0;i--){
  const event=w.visualEvents[i],age=now-(event.at??now),skill=event.skillId;if(!skill||age<0)continue;
  if(event.kind==='skill_ignition'&&age<.6&&ignitions++<4){
   const size=isUltimate(skill)?92:66;
   sprite(100000+event.id*4,skill,w.playerX,w.playerY,size,size,age/.6*4,Math.min(1,(1-age/.6)*2));
  }else if(event.kind==='hit'&&age<.32&&impacts++<14){
   const size=Math.min(58,Math.max(24,event.size*1.6));
   sprite(200000+event.id*4,skill,event.x,event.y,size,size,age/.32*4,(1-age/.32)*.9);
  }
 }
 // Skill projectiles retain their original body and exact collision envelope;
 // the animated wake adds luminous detail along their real velocity.
 let trails=0;
 for(const p of w.projectiles){
  if(!p.skillId||p.owner==='enemy'||p.mirrorBorrowed||p.lifetime<=0||trails++>=28)continue;
  const angle=Math.atan2(p.vy,p.vx)+Math.PI/2,speed=Math.max(1,Math.hypot(p.vx,p.vy));
  const width=Math.max(8,Math.min(20,p.radius*2)),length=reduced?20:38;
  sprite(300000+p.id*4,p.skillId,p.x-p.vx/speed*12,p.y-p.vy/speed*12,width,length,reduced?1:now*10,.6,angle,false);
 }
 const active=(id:SkillId)=>(s.activeEffects[id]??0)>0;
 for(const [i,id] of AIRCRAFT_CONFIGS[s.aircraftId].skillIds.entries()){
  if(!active(id))continue;
  if(['armor_shield','invisibility','orbit_reversal','cinder_fire_shield','riptide_wellspring','sylva_symbiosis','argent_guard_stance','terra_reactive_rock_armor','terra_geocore_overdrive'].includes(id))aura(-10-i*4,id,id==='terra_geocore_overdrive'?90:72,.46);
 }
 if(active('afterburner'))for(const side of [-1,1])sprite(-40+side*4,'afterburner',w.playerX+side*12,w.playerY+28,20,48,reduced?1:now*12,.8,Math.PI);
 if(active('sweeping_cannon'))sprite(-50,'sweeping_cannon',w.playerX,w.playerY-23,54,38,reduced?1:now*8,.65);
 if(w.laserCharge>0)sprite(-54,'focus_laser',w.playerX,w.playerY-21,45,54,reduced?1:now*9,.8);
 if(w.laserRemaining>0&&w.laserCharge<=0)sprite(-58,'focus_laser',w.playerX,(w.playerY+R.top)/2,48,w.playerY-R.top,reduced?2:now*12,.65);
 if(s.droneActive)sprite(-62,'escort_drone',w.droneX,w.droneY+13,34,42,reduced?1:now*8,.7);
 for(const d of w.decoys)if(d.active)sprite(400000+d.id*4,s.aircraftId==='phantom'?'invisibility':'decoy',d.x,d.y,32,42,reduced?1:now*8,.5,0,false);
 const lock=w.rankRuntime?.lock,locked=lock&&w.enemies.find(e=>e.id===lock.target&&e.hp>0);
 if(locked)sprite(-66,'predator_lock',locked.x,locked.y,(locked.radius+12)*2,undefined,reduced?1:now*7,.65);
 const anchor=w.rankRuntime?.anchor;
 if(anchor)sprite(-70,'gravity_anchor',anchor.x,anchor.y,86,86,reduced?1:now*8,.7);
 for(const wave of w.rankRuntime?.waves??[])for(let i=0;i<(reduced?4:8);i++){
  const angle=i*Math.PI*2/(reduced?4:8);
  sprite(500000+wave.id*32+i*2,'electronic_interference',wave.originX+Math.cos(angle)*wave.radius,wave.originY+Math.sin(angle)*wave.radius,30,30,reduced?1:now*9,.7,angle,false);
 }
 if(active('twin_reflection'))for(const side of [-1,1])sprite(-80+side*4,'twin_reflection',w.playerX+side*27,w.playerY-5,36,44,reduced?1:now*8,.5);
 if(w.astra?.charge)sprite(-90,'stellar_lance',w.playerX,w.playerY-20,36,66,reduced?1:now*10,.8);
 for(const m of w.astra?.starfall?.pending??[])if(now>=m.at-m.fallDuration){
  const t=Math.max(0,Math.min(1,(now-m.at+m.fallDuration)/m.fallDuration));
  sprite(600000+m.id*4,'starfall',m.x-140*(1-t*t),m.y-520*(1-t*t),m.doom?100:48,m.doom?120:66,t*4,.7);
 }
 if(w.bigBang&&!w.bigBang.resolved&&now>=w.bigBang.fallAt)sprite(-94,'heavy_bomb',w.bigBang.x,w.bigBang.y,95,95,(now-w.bigBang.fallAt)*12,.65);
 if(s.aircraftId==='cinder'){
  const c=cinderState(w);
  if(c.fuel&&now>=c.fuel.land){const f=c.fuel,g=cinderFuelGeometry(f);for(const [i,center] of cinderFuelCenters(f).entries())sprite(-100-i*4,'cinder_fuel_barrage',center.x,center.y,g.radius*2,g.radius*2,reduced?1:now*8,.45);}
  if(c.wave){const radius=(now-c.wave.at)/(c.wave.until-c.wave.at)*cinderWaveRadius(c.wave.x,c.wave.y);for(let i=0;i<8;i++){const a=i*Math.PI/4;sprite(-130-i*4,'cinder_heat_wave',c.wave.x+Math.cos(a)*radius,c.wave.y+Math.sin(a)*radius,52,42,reduced?1:now*8,.65,a,false);}}
  if(c.beam){const b=c.beam,firing=now>=b.fire;const x=firing?b.x:w.playerX,y=firing?b.y:w.playerY;sprite(-166,'cinder_inferno_beam',x,firing?(y+R.top)/2:y-20,firing?100:60,firing?y-R.top:76,reduced?2:now*12,.65);}
 }
 if(s.aircraftId==='riptide'){
  const r=riptideState(w);
  if(r.blades)for(let side=0;side<2;side++){
   const points=riptideBladePoints(w.playerX,w.playerY,now-r.blades.at,side);
   for(const i of [3,6]){const p=points[i],prev=points[i-1];sprite(-350-side*16-i*2,'riptide_tidal_blades',p.x,p.y,32,52,reduced?1:now*8,.6,Math.atan2(p.y-prev.y,p.x-prev.x)+Math.PI/2,false);}
  }
  if(r.confluence)aura(-182,'riptide_confluence',190,.38);
  if(r.waterform)aura(-186,'riptide_waterform',210,.42);
 }
 if(s.aircraftId==='argent'){
  const a=argentState(w);
  for(const b of a.blades.slice(0,24))if(b.phase!=='wait')sprite(700000+b.id*4,b.phase==='recall'?'argent_blade_recall':'argent_blade_cast',b.x,b.y,18,45,reduced?1:now*10,.65,b.angle+Math.PI/2,false);
  for(const [i,e] of (a.array?.emitters??[]).entries())sprite(-200-i*4,'argent_heavenly_blade_array',e.x,e.y,48,60,reduced?1:now*8,.65);
 }
 if(s.aircraftId==='sylva'){
  const a=sylvaState(w);
  for(const z of a.zones.slice(0,3))sprite(800000+z.id*4,'sylva_acid_burst',z.x,z.y,210,210,reduced?1:now*6,.32);
  for(const [i,f] of a.flights.entries()){
   const t=Math.max(0,Math.min(1,(now-f.at)/Math.max(.01,f.hitAt-f.at))),dx=f.x-f.fromX,dy=f.y-f.fromY;
   sprite(-230-i*4,f.skill,f.fromX+dx*t,f.fromY+dy*t,38,48,reduced?1:now*9,.7,Math.atan2(dy,dx)+Math.PI/2);
  }
  for(const [i,seed] of [...(a.bloom?.seeds.values()??[])].slice(0,12).entries())sprite(-250-i*4,'sylva_deathbloom',seed.entity.x,seed.entity.y,60,75,reduced?1:now*6,.6);
 }
 if(s.aircraftId==='terra'){
  const t=terraState(w);
  if(t.cannon)sprite(-310,'terra_seismic_cannon',w.playerX,w.playerY-25,70,95,reduced?1:now*9,.65);
  if(t.clamp)sprite(-314,'terra_strata_clamp',t.clamp.x,t.clamp.y,150,130,reduced?1:now*7,.6);
 }
}
