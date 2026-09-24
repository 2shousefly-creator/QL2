import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import type { SkillId } from "./airCombatTypes";
import { skillRank } from "./airCombatSkillRanks";
import { getEffectiveAircraftStats, getSkillRuntimeValues, endAircraftSkill } from "./airCombatAircraft";
import { expansionState, finishExpansionSkill } from "./airCombatExpansion";
export interface RankRuntimeHooks {
 hostile(w:CombatWorld,e:EnemyEntity):boolean;
 elite(e:EnemyEntity):boolean;
 priority(w:CombatWorld):EnemyEntity|null;
 projectile(w:CombatWorld,p:Partial<ProjectileEntity>&Pick<ProjectileEntity,"owner"|"x"|"y"|"vx"|"vy"|"rawDamage">):ProjectileEntity|null;
 damage(w:CombatWorld,e:EnemyEntity,raw:number,id:SkillId,procFree?:boolean):number;
 remove(w:CombatWorld,index:number):void;
 blockable(p:ProjectileEntity):boolean;
 displace(w:CombatWorld,e:EnemyEntity,x:number,y:number):void;
 pulse(w:CombatWorld,x:number,y:number,size:number):void;
}
interface Interference {until:number; movement:number; firing:number; projectile:number; waves:Set<number>;cast:number}
interface Pulse {at:number;wave:number;x?:number;y?:number;radius:number;relay:boolean;cast:number;rank:number;emitterId?:number}
export interface RankRuntime {
 lock?:{target:number;until:number;stacks:number;extended:number;cast:number;killed?:boolean};
 anchor?:{x:number;y:number;until:number;next:number;rank:number;affected:Set<number>;destroyed:number;inner:Map<number,number>};
 interference:Map<number,Interference>;
 projectileSlows:Map<number,{until:number;multiplier:number}>;
 pulses:Pulse[];
 twinVolleys:Map<number,Map<number,{side:number;at:number;done:boolean}>>;
 twinShots:number;
}
export const rankRuntime=(w:CombatWorld):RankRuntime=>w.rankRuntime??={interference:new Map(),projectileSlows:new Map(),pulses:[],twinVolleys:new Map(),twinShots:0};
export function beginRankSkill(w:CombatWorld,id:SkillId,h:RankRuntimeHooks) {
 const r=rankRuntime(w),rank=skillRank(w.aircraft,id),target=h.priority(w);
 if(id==="predator_lock"){r.lock=target?{target:target.id,until:w.elapsed+getSkillRuntimeValues(w.aircraft,id).duration,stacks:0,extended:0,cast:w.nextId++}:undefined;if(!r.lock)endAircraftSkill(w.aircraft,id);}
 if(id==="gravity_anchor")r.anchor={x:target?.x??w.playerX,y:target?.y??w.playerY-140,until:w.elapsed+getSkillRuntimeValues(w.aircraft,id).duration,next:w.elapsed+.5,rank,affected:new Set(),destroyed:0,inner:new Map()};
 if(id==="electronic_interference") {
  const cast=w.nextId++,times=rank>=5?[0,.8,1.6]:rank>=2?[0,1]:[0];
  times.forEach((delay,wave)=>r.pulses.push({at:w.elapsed+delay,wave,radius:210,relay:false,cast,rank}));
 }
 if(id==="twin_reflection")r.twinShots=0;
}
export function collapseAnchor(w:CombatWorld,h:RankRuntimeHooks,natural:boolean) {
 const r=rankRuntime(w),a=r.anchor;if(!a)return;
 const radius=120*(a.rank>=2?1.25:1),power=getEffectiveAircraftStats(w.aircraft).firepower;
 const mass=a.rank>=4?Math.min(4,a.affected.size*.25+a.destroyed*.10):0;
 for(const e of w.enemies)if(h.hostile(w,e)&&Math.hypot(e.x-a.x,e.y-a.y)<=radius+e.radius){
  if(natural&&a.rank>=5&&e.type!=="boss")h.displace(w,e,(a.x-e.x)*(h.elite(e)?.45:.8),(a.y-e.y)*(h.elite(e)?.45:.8));
  h.damage(w,e,power*(2.5+mass)*(a.rank>=5&&(a.inner.get(e.id)??0)>=2?1.5:1),"gravity_anchor");
 }
 h.pulse(w,a.x,a.y,radius*2);r.anchor=undefined;endAircraftSkill(w.aircraft,"gravity_anchor");
}
export function rankEnemyMovement(w:CombatWorld,e:EnemyEntity) {
 const r=rankRuntime(w),i=r.interference.get(e.id),a=r.anchor;
 return Math.min(i&&i.until>w.elapsed?i.movement:1,a&&Math.hypot(e.x-a.x,e.y-a.y)<=120*(a.rank>=2?1.25:1)?.65:1);
}
export function rankEnemyFireRate(w:CombatWorld,e:EnemyEntity) {const i=rankRuntime(w).interference.get(e.id);return i&&i.until>w.elapsed?i.firing:1;}
export function rankProjectileSpeed(w:CombatWorld,p:ProjectileEntity,h:RankRuntimeHooks) {
 if(p.owner!=="enemy"||p.allegiance==="friendly_hacked")return 1;
 const r=rankRuntime(w),i=p.sourceEnemyId===undefined?undefined:r.interference.get(p.sourceEnemyId),slow=r.projectileSlows.get(p.id),a=r.anchor;
 return Math.min(i&&i.until>w.elapsed?i.projectile:1,slow&&slow.until>w.elapsed?slow.multiplier:1,a&&h.blockable(p)&&Math.hypot(p.x-a.x,p.y-a.y)<=120*(a.rank>=2?1.25:1)?.6:1);
}
export function rankDirectMultiplier(w:CombatWorld,e:EnemyEntity,id?:SkillId) {
 const l=rankRuntime(w).lock,s=w.aircraft;
 let m=l&&l.target===e.id&&l.until>w.elapsed&&skillRank(s,"predator_lock")>=2?1.15:1;
 if(id==="predator_lock"&&skillRank(s,id)>=4&&e.hp<e.maxHp*.4)m*=1.5;
 return m;
}
export function rankArmorMultiplier(w:CombatWorld,e:EnemyEntity) {
 const until=e.expansionMarks?.gravityArmorUntil??0;
 return until>w.elapsed?1-(e.expansionMarks?.gravityArmor??0):1;
}
export function predatorBasicHit(w:CombatWorld,e:EnemyEntity,h:RankRuntimeHooks,belowThreshold:boolean) {
 const l=rankRuntime(w).lock,rank=skillRank(w.aircraft,"predator_lock");
 if(!l||l.until<=w.elapsed||l.target!==e.id||!h.hostile(w,e))return;
 l.stacks+=rank>=4&&belowThreshold?2:1;
 if(l.stacks<(rank>=5?4:5))return;l.stacks=0;
 const power=getEffectiveAircraftStats(w.aircraft).firepower*(rank>=2?2.4:2);
 for(let i=0;i<(rank>=3?2:1);i++)h.projectile(w,{owner:"player",source:"skill",skillId:"predator_lock",x:w.playerX+(i?12:-12),y:w.playerY-20,vx:0,vy:-320,rawDamage:power*(i?.7:1),radius:4.5,homing:true,targetId:e.id,turnRate:8,color:"#fda4af",rankCast:l.cast});
}
export function rankProjectileHit(w:CombatWorld,p:ProjectileEntity,e:EnemyEntity,h:RankRuntimeHooks) {
 const r=rankRuntime(w),l=r.lock;
 if(p.skillId==="predator_lock"&&l&&p.rankCast===l.cast&&l.target===e.id&&skillRank(w.aircraft,"predator_lock")>=5&&(h.elite(e)||e.type==="boss")){
  const extra=Math.min(.4,4-l.extended);l.extended+=extra;l.until+=extra;
 }
 if(p.twinSide!==undefined&&p.rankVolley!==undefined&&skillRank(w.aircraft,"twin_reflection")>=3){
  const volley=r.twinVolleys.get(p.rankVolley);if(!volley)return;
  const old=volley.get(e.id);
  if(old&&!old.done&&old.side!==p.twinSide&&w.elapsed-old.at<=.6){old.done=true;h.damage(w,e,getEffectiveAircraftStats(w.aircraft).firepower*1.2,"twin_reflection",true);h.pulse(w,e.x,e.y,32);}
  else if(!old)volley.set(e.id,{side:p.twinSide,at:w.elapsed,done:false});
 }
}
export function echoTwinShot(w:CombatWorld,main:ProjectileEntity,h:RankRuntimeHooks) {
 const s=w.aircraft,r=rankRuntime(w),rank=skillRank(s,"twin_reflection");
 if(!rank||(s.activeEffects.twin_reflection??0)<=0)return;
 const empowered=rank>=4&&r.twinShots>0&&r.twinShots%5===0;r.twinShots++;
 const volley=w.nextId++;r.twinVolleys.set(volley,new Map());
 for(const side of [-1,1])h.projectile(w,{owner:"player",source:"basic",skillId:"twin_reflection",x:main.x+side*27,y:main.y+8,vx:main.vx*(empowered?1.4:1),vy:main.vy*(empowered?1.4:1),rawDamage:main.rawDamage,echoScale:(rank>=2?.30:.25)*(empowered?1.75:1),radius:empowered?4.2:2.8,penetrationRemaining:rank>=2?1:0,penetrationMultiplier:.6,color:"#fdba74",twinSide:side,rankVolley:volley,procFree:true});
}
export function tickRankSkills(w:CombatWorld,dt:number,h:RankRuntimeHooks) {
 const r=rankRuntime(w),s=w.aircraft,now=w.elapsed;
 if(r.lock){const l=r.lock,target=w.enemies.find(e=>e.id===l.target&&h.hostile(w,e));
  if(l.until<=now)r.lock=undefined;
  else if(!target){const next=l.killed&&skillRank(s,"predator_lock")>=5?h.priority(w):null;if(next){l.target=next.id;l.until+=3;l.stacks=0;l.killed=false;}else r.lock=undefined;}
  if(r.lock)s.activeEffects.predator_lock=Math.max(.001,r.lock.until-now);else endAircraftSkill(s,"predator_lock");
 }
 const a=r.anchor;
 if(a){
  s.activeEffects.gravity_anchor=Math.max(.001,a.until-now);
  const radius=120*(a.rank>=2?1.25:1),inner=radius*.3;
  for(const e of w.enemies)if(h.hostile(w,e)){
   const d=Math.hypot(e.x-a.x,e.y-a.y);if(d>radius+e.radius)continue;
   if(d<=inner) a.inner.set(e.id,(a.inner.get(e.id)??0)+dt);
   if(a.rank>=3){const m=e.expansionMarks??={};m.gravityArmorUntil=now+1.5;m.gravityArmor=d<=inner?.35:.25;}
   if(e.type!=="boss"&&d>.01){a.affected.add(e.id);const force=(a.rank>=2?40+100*(1-d/radius):35)*(h.elite(e)?.3:1)*dt,step=Math.min(d,force);h.displace(w,e,(a.x-e.x)/d*step,(a.y-e.y)/d*step);}
  }
  for(let i=w.projectiles.length-1;i>=0;i--){const p=w.projectiles[i],d=Math.hypot(p.x-a.x,p.y-a.y);if(!h.blockable(p)||d>radius)continue;
   if(a.rank>=2&&d<=inner&&a.destroyed<20){a.destroyed++;h.remove(w,i);continue;}
   if(d>0){p.vx+=(a.x-p.x)/d*24*dt;p.vy+=(a.y-p.y)/d*24*dt;}
  }
  while(a.next<=Math.min(now,a.until)+1e-8){a.next+=.5;for(const e of w.enemies)if(h.hostile(w,e)&&Math.hypot(e.x-a.x,e.y-a.y)<=radius+e.radius)h.damage(w,e,getEffectiveAircraftStats(s).firepower*.35,"gravity_anchor");}
  if(now>=a.until)collapseAnchor(w,h,true);
 }
 const due=r.pulses.filter(p=>p.at<=now);r.pulses=r.pulses.filter(p=>p.at>now);
 for(const p of due){const emitter=p.emitterId===undefined?undefined:w.enemies.find(e=>e.id===p.emitterId&&e.hp>0);const x=emitter?.x??p.x??w.playerX,y=emitter?.y??p.y??w.playerY;h.pulse(w,x,y,p.radius*2);
  for(const e of w.enemies)if(h.hostile(w,e)&&Math.hypot(e.x-x,e.y-y)<=p.radius+e.radius){
   let i=r.interference.get(e.id);if(!i||i.cast!==p.cast){i={until:now+3,movement:.75,firing:.8,projectile:.7,waves:new Set(),cast:p.cast};r.interference.set(e.id,i);}
   if(!p.relay)i.waves.add(p.wave);
   const max=p.rank>=5&&i.waves.size>=3,resonant=p.rank>=3&&i.waves.size>=2;
   Object.assign(i,{until:now+(max?2:3),movement:max?.45:resonant?.6:.75,firing:max?.55:resonant?.65:.8,projectile:max?.35:resonant?.5:.7});
   if(!p.relay)h.damage(w,e,getEffectiveAircraftStats(s).firepower*(p.wave===0?1:.7),"electronic_interference");
   if(!p.relay&&p.wave===0&&p.rank>=4)r.pulses.push({...p,at:now+.5,x:e.x,y:e.y,emitterId:e.id,radius:70,relay:true});
  }
  for(const bullet of w.projectiles)if(bullet.owner==="enemy"&&bullet.allegiance!=="friendly_hacked"&&Math.hypot(bullet.x-x,bullet.y-y)<=p.radius){const emitter=bullet.sourceEnemyId===undefined?undefined:r.interference.get(bullet.sourceEnemyId);r.projectileSlows.set(bullet.id,{until:emitter?.until??now+3,multiplier:emitter?.projectile??.7});}
 }
 if(r.pulses.length)s.activeEffects.electronic_interference=Math.max(.001,...r.pulses.map(p=>p.at-now));
 if(!r.pulses.length){endAircraftSkill(s,"electronic_interference");finishExpansionSkill(s,expansionState(s).casts.electronic_interference);}
 for(const [id,i] of r.interference)if(i.until<=now||!w.enemies.some(e=>e.id===id&&e.hp>0))r.interference.delete(id);
 for(const [id,i] of r.projectileSlows)if(i.until<=now||!w.projectiles.some(p=>p.id===id))r.projectileSlows.delete(id);
 for(const [id] of r.twinVolleys)if(!w.projectiles.some(p=>p.rankVolley===id))r.twinVolleys.delete(id);
}
