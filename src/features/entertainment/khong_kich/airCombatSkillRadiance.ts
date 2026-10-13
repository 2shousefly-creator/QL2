import { SKILL_VFX_FRAMES as frames } from './airCombatSkillVfxFrames';
import { getMissileVisual } from './airCombatAmmo';
export { SKILL_RADIANCE_SOURCES } from './airCombatSkillVfxFrames';
import { GAMEPLAY_SAFE_RECT as R } from './airCombatConfig';
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
  if(hot&&!reduced&&count<SKILL_RADIANCE_BUDGET){draw(id+1,frame,x,y,width*.82,height*.82,rotation,Math.min(1,alpha*.8),true);count++;}
 };
 // Complete the impact/recast/end phases that previously only had ignition or
 // sustained art. These sprites consume real effect records; no damage is inferred.
 const burst=(id:number,skill:SkillId,x:number,y:number,size:number,at:number,life:number,power=1)=>{
  const age=now-at,duration=Math.min(.36,life),t=age/duration;
  if(t<0||t>=1)return;
  const scale=.55+Math.min(1,t*5)*.6,alpha=(1-t)**.7;
  sprite(id,skill,x,y,size*scale,size*scale,Math.min(3,t*4),alpha,0,true);
  if(!reduced&&power>1){
   // Thin raster energy rays escape the central flash without filling the body.
   for(let i=0;i<2;i++)sprite(id+2+i*2,skill,x,y,size*.13,size*(1.35+t*.6),Math.min(3,t*4),alpha*.65,i*Math.PI/2+.35,true);
  }
 };
 // Every skill has a distinct ignition animation, even when its damage is delayed.
 let ignitions=0,impacts=0;
 for(let i=w.visualEvents.length-1;i>=0;i--){
  const event=w.visualEvents[i],age=now-(event.at??now),skill=event.skillId;if(!skill||age<0)continue;
  if(event.kind==='skill_ignition'&&age<.6&&ignitions++<4){
   if(['afterburner','sweeping_cannon','armor_shield','invisibility','orbit_reversal','cinder_fire_shield','riptide_wellspring','riptide_waterform','sylva_symbiosis','argent_guard_stance','terra_reactive_rock_armor','terra_geocore_overdrive'].includes(skill))continue;
   const size=isUltimate(skill)?92:66;
   sprite(100000+event.id*4,skill,w.playerX,w.playerY-32,Math.min(32,size),Math.min(38,size),age/.6*4,Math.min(1,(1-age/.6)*2));
  }else if(event.kind==='hit'&&age<.32&&impacts++<14){
   const size=Math.min(58,Math.max(24,event.size*1.6));
   sprite(200000+event.id*4,skill,event.x,event.y,size,size,age/.32*4,(1-age/.32)*.9);
  }
 }
 let accents=0;
 const rankSkills:Record<string,SkillId>={lock_complete:'predator_lock',micro_impact:'predator_lock',anchor_collapse:'gravity_anchor',twin_convergence:'twin_reflection',interference_destroy:'electronic_interference',interference_hit:'electronic_interference'};
 const ultimateSkills:Record<string,SkillId>={ultimateViperImpact:'missile_swarm',ultimateViperIntercept:'missile_swarm',ultimateTitanImpact:'sweeping_cannon',ultimateHawkDock:'escort_drone'};
 for(let i=w.visualEvents.length-1;i>=0&&accents<12;i--){
  const e=w.visualEvents[i],skill=e.kind==='rank_effect'?rankSkills[e.rankEffect??'']:e.kind==='ultimate_effect'?ultimateSkills[e.ultimateEffect??'']:undefined;
  if(!skill||now-(e.at??now)>.36)continue;
  burst(-20000000-e.id*8,skill,e.x,e.y,Math.min(210,Math.max(30,e.size*1.3)),e.at??now,.36,e.rankEffect==='anchor_collapse'?2:1);accents++;
 }
 if(s.aircraftId==='riptide')for(const e of riptideState(w).effects.slice(-12)){
  if(!['heal','cleanse','impact','burst'].includes(e.kind))continue;
  const skill:SkillId=e.skillId??(e.kind==='heal'||e.kind==='cleanse'?'riptide_wellspring':e.kind==='impact'?'riptide_tidal_blades':'riptide_confluence');
  burst(-30000000-e.id*8,skill,e.x,e.y,Math.min(300,e.radius*2),e.at,e.life,e.kind==='burst'?2:1);
 }
 if(s.aircraftId==='argent')for(const e of argentState(w).effects.slice(-12)){
  if(!['guard','break','cross','reunion','join','summon','wave'].includes(e.kind))continue;
  const skill:SkillId=e.kind==='guard'||e.kind==='break'?'argent_guard_stance':e.kind==='summon'||e.kind==='wave'?'argent_heavenly_blade_array':'argent_blade_recall';
  burst(-40000000-e.id*8,skill,e.x,e.y,e.size*1.5,e.at,e.life,e.kind==='cross'||e.kind==='reunion'?2:1);
 }
 if(s.aircraftId==='sylva')for(const [i,e] of sylvaState(w).effects.slice(-12).entries()){
  if(!['heal','acidExplosion','root','bloom','tree'].includes(e.kind))continue;
  const skill:SkillId=e.kind==='heal'?'sylva_symbiosis':e.kind==='acidExplosion'?'sylva_acid_burst':e.kind==='root'||e.kind==='bloom'?'sylva_parasitic_seed':'sylva_deathbloom';
  burst(-50000000-i*8,skill,e.x,e.y,e.size*1.35,e.at,e.life,e.kind==='tree'||e.kind==='acidExplosion'?2:1);
 }
 if(s.aircraftId==='terra')for(const [i,e] of terraState(w).effects.slice(-12).entries()){
  if(!['armorHit','armorDissolve','regenerate','coreOpen','coreEnd','cannon','cannonImpact','clampImpact','shardImpact'].includes(e.kind))continue;
  const skill:SkillId=e.kind==='cannon'||e.kind==='cannonImpact'?'terra_seismic_cannon':e.kind==='clampImpact'?'terra_strata_clamp':e.kind==='coreOpen'||e.kind==='coreEnd'?'terra_geocore_overdrive':'terra_reactive_rock_armor';
  if(e.kind==='cannon'){
   const age=now-e.at;if(age>=0&&age<.28)sprite(-60000000-i*8,skill,e.x,e.y,e.size*1.2,e.height??e.size,Math.min(3,age/.28*4),1-age/.28);
  }else burst(-60000000-i*8,skill,e.x,e.y,e.size*1.35,e.at,e.life,e.kind==='clampImpact'||e.kind==='cannonImpact'?2:1);
 }
 // Skill projectiles retain their original body and exact collision envelope;
 // the animated wake adds luminous detail along their real velocity.
 let trails=0;
 for(const p of w.projectiles){
  if(!p.skillId||p.owner==='enemy'||p.mirrorBorrowed||p.lifetime<=0||getMissileVisual(p)||trails++>=28)continue;
  const angle=Math.atan2(p.vy,p.vx)+Math.PI/2,speed=Math.max(1,Math.hypot(p.vx,p.vy));
  const width=Math.max(8,Math.min(20,p.radius*2)),length=reduced?20:38;
  sprite(300000+p.id*4,p.skillId,p.x-p.vx/speed*12,p.y-p.vy/speed*12,width,length,reduced?1:now*10,.6,angle,false);
 }
 const active=(id:SkillId)=>(s.activeEffects[id]??0)>0;
 if(w.laserCharge>0)sprite(-54,'focus_laser',w.playerX,w.playerY-34,18,26,reduced?1:now*9,.8);
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
 if(w.astra?.charge)sprite(-90,'stellar_lance',w.playerX,w.playerY-34,18,30,reduced?1:now*10,.8);
 for(const m of w.astra?.starfall?.pending??[])if(now>=m.at-m.fallDuration){
  const t=Math.max(0,Math.min(1,(now-m.at+m.fallDuration)/m.fallDuration));
  sprite(600000+m.id*4,'starfall',m.x-140*(1-t*t),m.y-520*(1-t*t),m.doom?100:48,m.doom?120:66,t*4,.7);
 }
 if(w.bigBang&&!w.bigBang.resolved&&now>=w.bigBang.fallAt)sprite(-94,'heavy_bomb',w.bigBang.x,w.bigBang.y,95,95,(now-w.bigBang.fallAt)*12,.65);
 if(s.aircraftId==='cinder'){
  const c=cinderState(w);
  if(c.fuel&&now>=c.fuel.land){const f=c.fuel,g=cinderFuelGeometry(f);for(const [i,center] of cinderFuelCenters(f).entries())sprite(-100-i*4,'cinder_fuel_barrage',center.x,center.y,g.radius*2,g.radius*2,reduced?1:now*8,.45);}
  if(c.wave){const radius=(now-c.wave.at)/(c.wave.until-c.wave.at)*cinderWaveRadius(c.wave.x,c.wave.y);for(let i=0;i<8;i++){const a=i*Math.PI/4;sprite(-130-i*4,'cinder_heat_wave',c.wave.x+Math.cos(a)*radius,c.wave.y+Math.sin(a)*radius,52,42,reduced?1:now*8,.65,a,false);}}
  if(c.beam){const b=c.beam,firing=now>=b.fire;const x=firing?b.x:w.playerX,y=firing?b.y:w.playerY;sprite(-166,'cinder_inferno_beam',x,firing?(y+R.top)/2:y-35,firing?100:20,firing?y-R.top:30,reduced?2:now*12,.65);}
 }
 if(s.aircraftId==='riptide'){
  const r=riptideState(w);
  if(r.blades)for(let side=0;side<2;side++){
   const points=riptideBladePoints(w.playerX,w.playerY,now-r.blades.at,side);
   for(const i of [3,6]){const p=points[i],prev=points[i-1];sprite(-350-side*16-i*2,'riptide_tidal_blades',p.x,p.y,32,52,reduced?1:now*8,.6,Math.atan2(p.y-prev.y,p.x-prev.x)+Math.PI/2,false);}
  }
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
  if(t.cannon)sprite(-310,'terra_seismic_cannon',w.playerX,w.playerY-38,24,32,reduced?1:now*9,.65);
  if(t.clamp)sprite(-314,'terra_strata_clamp',t.clamp.x,t.clamp.y,150,130,reduced?1:now*7,.6);
 }
}
