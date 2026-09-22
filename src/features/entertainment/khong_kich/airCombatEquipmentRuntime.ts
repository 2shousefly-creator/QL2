import { isElite } from "./airCombatWaves";
import type { CombatWorld, EnemyEntity } from "./airCombatRuntime";
import type { AircraftCombatState, SkillId } from "./airCombatTypes";
import { getEffectiveAircraftStats } from "./airCombatAircraft";
import { createAbsorbShield } from "./airCombatExpansion";
import { AIRCRAFT_CONFIGS } from "./airCombatConfig";
import { GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import { activeEquipmentFamilies, equipmentState, equipmentEffect, equipmentScale, equipmentMetric, grantEquipmentReward, randomEquipmentId, type EquipmentMark } from "./airCombatEquipmentState";
import { equipmentGeminiMode } from "./airCombatEquipmentStats";
import { recordCoreMetric } from "./airCombatTelemetry";

export const EQUIPMENT_PICKUP_RADIUS = 42;
export interface EquipmentHooks {
  damage: (w:CombatWorld,e:EnemyEntity,raw:number,family:number)=>number;
  heal: (w:CombatWorld,raw:number)=>number;
  hostile: (w:CombatWorld,e:EnemyEntity)=>boolean;
  elite: (e:EnemyEntity)=>boolean;
}
type Context={w:CombatWorld;s:AircraftCombatState;h:EquipmentHooks;k:number;t:number;f:number};
export interface EquipmentHit { enemy:EnemyEntity; basic:boolean; primary:boolean; skill:boolean; critical:boolean; direct:boolean; damage:number; skillId?:SkillId; cast?:unknown }
interface EquipmentEffectHooks { hit?:(c:Context,hit:EquipmentHit)=>void; cast?:(c:Context,id:SkillId)=>void; damaged?:(c:Context,hp:number,total:number)=>void; kill?:(c:Context,e:EnemyEntity)=>void; tick?:(c:Context,dt:number)=>void }
const mark=(s:AircraftCombatState,e:EnemyEntity,f:number):EquipmentMark=>(equipmentState(s).marks[e.id]??={})[f]??={until:0,stacks:0,tick:0};
const metric=(c:Context,key:string,n=1)=>equipmentMetric(c.s,c.f,key,n);
function peak(c:Context,value:number) {const t=equipmentState(c.s).telemetry[`TH${String(c.f).padStart(2,"0")}`]??={};t.peak=Math.max(t.peak??0,value);}
export function equipmentFx(w:CombatWorld,family:number,x=w.playerX,y=w.playerY,size=55,duration=.6,target?:number,from?:{x:number;y:number}) {
  const e=equipmentState(w.aircraft);
  const gate=`${family}:${target??"player"}`;
  if(duration<1 && (e.presentationGate[gate]??-Infinity)>w.elapsed)return;
  e.presentationGate[gate]=w.elapsed+.08;
  if(duration>1 && target!==undefined)e.visuals=e.visuals.filter(v=>v.family!==family||v.target!==target);
  // Bounded presentation only; gameplay events and telemetry are never dropped.
  if(e.visuals.length>=180)e.visuals.shift();
  e.visuals.push({id:e.nextVisualId++,family,x,y,size,start:w.elapsed,duration,target,player:target===-1,legendary:equipmentScale(w.aircraft,family)===2,fromX:from?.x,fromY:from?.y});
}
function activate(c:Context,seconds:number,stacks?:number) {
  const e=equipmentEffect(c.s,c.f);e.until=c.t+seconds;e.duration=seconds;if(stacks!==undefined)e.stacks=stacks;
  metric(c,"procs");equipmentFx(c.w,c.f,c.w.playerX,c.w.playerY,62,Math.min(seconds,1),-1);
}
function stack(c:Context,gain:number,max:number,seconds:number) {const e=equipmentEffect(c.s,c.f);e.stacks=Math.min(max,(e.until>c.t?e.stacks:0)+gain);e.until=c.t+seconds;e.duration=seconds;peak(c,e.stacks);}
function heal(c:Context,amount:number,key="healed") {if(c.s.currentHp<=0)return 0;const actual=c.h.heal(c.w,amount);metric(c,key,actual);return actual;}
function resource(c:Context,amount:number) {const max=getEffectiveAircraftStats(c.s).maxResource,before=c.s.currentResource;c.s.currentResource=Math.min(max,before+amount);metric(c,"resource",c.s.currentResource-before);metric(c,"procs");equipmentFx(c.w,c.f);}
function shield(c:Context,amount:number,seconds:number) {const sh=createAbsorbShield(c.s,`equipment:${c.f}`,amount,seconds);metric(c,"shieldCreated",sh.amount);metric(c,"shields");activate(c,seconds);}
function reduceCooldown(c:Context,seconds:number,ids:readonly SkillId[],key="cooldown") {for(const id of ids){const before=c.s.cooldowns[id]??0;c.s.cooldowns[id]=Math.max(0,before-seconds);metric(c,key,before-c.s.cooldowns[id]!);}}
function damage(c:Context,e:EnemyEntity,raw:number,from?:{x:number;y:number}) {const actual=c.h.damage(c.w,e,raw,c.f);metric(c,"damage",actual);if(actual>0)metric(c,"hits");equipmentFx(c.w,c.f,e.x,e.y,48,.55,e.id,from);return actual;}
const nearby=(c:Context,x:number,y:number,r=Infinity)=>c.w.enemies.filter(e=>c.h.hostile(c.w,e)&&Math.hypot(e.x-x,e.y-y)<=r).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y));
const hp=(c:Context)=>getEffectiveAircraftStats(c.s).maxHp;
const power=(c:Context)=>getEffectiveAircraftStats(c.s).firepower;
const ready=(c:Context)=>equipmentEffect(c.s,c.f).ready<=c.t;

/** One dispatch per resolved family, regardless of physical-copy count. */
const EFFECTS:Readonly<Record<number,EquipmentEffectHooks>>={
  1:{hit(c,h){if(h.direct)equipmentFx(c.w,1,h.enemy.x,h.enemy.y,30,.2,h.enemy.id);}},
  2:{hit(c,h){if(h.basic)stack(c,.5,60,4);},cast(c){stack(c,5,60,4);},damaged(c,_hp,total){if(total>0)equipmentEffect(c.s,2).stacks=Math.max(0,equipmentEffect(c.s,2).stacks-5);}},
  3:{damaged(c,lost){if(lost>0&&c.s.currentHp<hp(c)*.4&&ready(c)){
    const e=equipmentEffect(c.s,3);e.value=(hp(c)-c.s.currentHp)*.12*c.k;activate(c,2);e.ready=c.t+62;
    // Existing homing and target acquisitions consult the shared untargetable helper.
    for(const p of c.w.projectiles)if(p.owner==="enemy"&&p.targetId===0)p.targetId=null;
  }},tick(c,dt){const e=equipmentEffect(c.s,3),step=Math.min(dt,Math.max(0,e.until-(c.t-dt)));if(step>0)heal(c,e.value*step/2);}},
  4:{damaged(c,lost,total){if(total>0&&c.s.currentHp<hp(c)*.6&&ready(c)){shield(c,hp(c)*.15*c.k,8);equipmentEffect(c.s,4).ready=c.t+68;}}},
  5:{hit(c,h){const e=equipmentEffect(c.s,5),m=mark(c.s,h.enemy,5);
    if(h.skill&&h.direct){const cast=equipmentState(c.s).fireCast;
      const same=cast&&(h.cast?cast.cast===h.cast:cast.at===c.t&&cast.skillId===h.skillId);
      if((ready(c)&&!same)||same){if(!same){e.ready=c.t+10;equipmentState(c.s).fireCast={cast:h.cast,skillId:h.skillId,at:c.t,targets:[]};}const armed=equipmentState(c.s).fireCast!;if(!armed.targets.includes(h.enemy.id)){armed.targets.push(h.enemy.id);m.until=c.t+8;m.stacks=0;metric(c,"marks");equipmentFx(c.w,5,h.enemy.x,h.enemy.y,52,8,h.enemy.id);}}}
    if(h.primary&&m.until>c.t&&++m.stacks>=6){m.until=0;metric(c,"explosions");const x=h.enemy.x,y=h.enemy.y;damage(c,h.enemy,power(c)*2.4*c.k);for(const target of nearby(c,x,y,100))if(target!==h.enemy){damage(c,target,power(c)*1.8*c.k);metric(c,"aoeTargets");}equipmentFx(c.w,5,x,y,200,.8);}
  }},
  6:{hit(c,h){if(h.basic&&++equipmentEffect(c.s,6).count%10===0)resource(c,getEffectiveAircraftStats(c.s).maxResource*.025*c.k);}},
  7:{hit(c,h){if(h.skill&&h.direct&&h.enemy.hp>0){mark(c.s,h.enemy,7).until=c.t+3;metric(c,"targets");equipmentFx(c.w,7,h.enemy.x,h.enemy.y,50,3,h.enemy.id);}}},
  8:{hit(c,h){if(h.skill&&h.critical){metric(c,"skillCrits");equipmentFx(c.w,8,h.enemy.x,h.enemy.y,58,.5,h.enemy.id);}}},
  9:{hit(c,h){if(h.basic)equipmentFx(c.w,9,h.enemy.x,h.enemy.y,30,.3,h.enemy.id);}},
  10:{damaged(c,_lost,total){if(total>0){const e=equipmentEffect(c.s,10);e.stacks=Math.min(15,e.stacks+1);e.until=c.t+5;e.tick=c.t+5.5;e.duration=5;peak(c,e.stacks);equipmentFx(c.w,10,c.w.playerX,c.w.playerY,56,.6,-1);}},tick(c){const e=equipmentEffect(c.s,10);while(e.stacks>0&&c.t>=e.tick&&c.t>e.until){e.stacks--;e.tick+=.5;}}},
  11:{cast(c){activate(c,5);}},
  12:{hit(c,h){if(!h.primary||++equipmentEffect(c.s,12).count%7)return;metric(c,"echoes",2);const targets=nearby(c,c.w.playerX,c.w.playerY,180).filter(e=>e!==h.enemy).slice(0,2);
    if(!targets.length){metric(c,"merged");damage(c,h.enemy,power(c)*1.1*c.k,{x:c.w.playerX,y:c.w.playerY});}
    else for(let i=0;i<2;i++)damage(c,targets[i%targets.length],power(c)*.75*c.k,{x:c.w.playerX+(i?28:-28),y:c.w.playerY});
  }},
  13:{hit(c,h){if(!h.primary)return;const e=equipmentEffect(c.s,13);
    if(e.value>=100){e.value=0;metric(c,"chains");const used=new Set<number>();let next:EnemyEntity|undefined=h.enemy,from={x:c.w.playerX,y:c.w.playerY};
      for(let i=0;i<4*c.k&&next;i++){used.add(next.id);damage(c,next,power(c)*.9*c.k,from);from={x:next.x,y:next.y};next=nearby(c,from.x,from.y).find(e=>!used.has(e.id));}}
    else {const before=e.value;e.value=Math.min(100,e.value+8);if(before<100&&e.value===100)metric(c,"charged");}
  }},
  14:{kill(c,e){if(e.expansionKillingHit?.skill)activate(c,6);}},
  15:{hit(c,h){if(!h.critical)return;const m=mark(c.s,h.enemy,15);m.stacks=Math.min(3,(m.until>c.t?m.stacks:0)+1);m.until=c.t+4;metric(c,"stacks");peak(c,m.stacks);if(m.stacks===1)metric(c,"targets");equipmentFx(c.w,15,h.enemy.x,h.enemy.y,48,4,h.enemy.id);}},
  16:{},
  17:{damaged(c,lost){if(lost>0&&ready(c)){shield(c,hp(c)*.09*c.k,4);equipmentEffect(c.s,17).ready=c.t+12;}}},
  18:{damaged(c,lost){if(lost>0){const e=equipmentEffect(c.s,18),before=e.value;e.value=Math.min(hp(c)*.12,e.value+lost*.2);e.until=c.t+3;e.duration=3;metric(c,"stored",e.value-before);}},tick(c){const e=equipmentEffect(c.s,18);if(e.value>0&&c.t>=e.until){heal(c,e.value*.5*c.k);e.value=0;metric(c,"procs");equipmentFx(c.w,18);}}},
  19:{damaged(c,lost){if(lost>0&&ready(c)){resource(c,getEffectiveAircraftStats(c.s).maxResource*.06*c.k);equipmentEffect(c.s,19).ready=c.t+5;}}},
  20:{cast(c){activate(c,5);}},
  21:{hit(c,h){if(h.critical)stack(c,1,3,3);}},
  22:{},
  23:{damaged(c,lost){const e=equipmentEffect(c.s,23);e.value+=lost;const q=equipmentState(c.s);
    if(e.value>=hp(c)*.12&&!q.orb){const a=c.w.random()*Math.PI*2,r=45+c.w.random()*40;let dx=Math.cos(a)*r,dy=Math.sin(a)*r;
      if(c.w.playerX+dx<GAMEPLAY_SAFE_RECT.left+12||c.w.playerX+dx>GAMEPLAY_SAFE_RECT.right-12)dx=-dx;
      if(c.w.playerY+dy<GAMEPLAY_SAFE_RECT.top+12||c.w.playerY+dy>GAMEPLAY_SAFE_RECT.bottom-12)dy=-dy;
      q.orb={x:c.w.playerX+dx,y:c.w.playerY+dy,until:c.t+7,shield:c.w.random()<.5,scale:c.k};e.value=0;metric(c,"orbs");}
  }},
  24:{tick(c){const e=equipmentEffect(c.s,24),targets=nearby(c,c.w.playerX,c.w.playerY).sort((a,b)=>b.hp-a.hp);if(e.value>=getEffectiveAircraftStats(c.s).maxResource*.35&&targets.length){e.value=0;const target=targets[0];equipmentState(c.s).meteors.push({x:target.x,y:target.y,at:c.t+.6,scale:c.k});equipmentFx(c.w,24,target.x,target.y,140,.6);metric(c,"meteors");}}},
  25:{damaged(c,lost){if(lost>0&&c.s.currentHp<hp(c)*.3&&ready(c)){reduceCooldown(c,6*c.k,AIRCRAFT_CONFIGS[c.s.aircraftId].skillIds);shield(c,hp(c)*.1*c.k,4);equipmentEffect(c.s,25).ready=c.t+40;}}},
  26:{hit(c,h){if(h.critical)stack(c,1,5,5);}},
  27:{tick(c,dt){heal(c,Math.max(0,hp(c)-c.s.currentHp)*.02*c.k*dt);}},
  28:{tick(c,dt){const stats=getEffectiveAircraftStats(c.s);metric(c,`${equipmentGeminiMode(c.s,stats.maxHp,stats.maxResource)}Time`,dt);}},
  29:{tick(c,dt){const e=equipmentEffect(c.s,29),step=Math.min(dt,Math.max(0,e.until-(c.t-dt)));if(step>0)heal(c,hp(c)*.05*c.k*step/3);}},
  30:{hit(c,h){if(!h.critical)return;const e=equipmentEffect(c.s,30);if(c.t>=e.tick){e.tick=c.t+1;e.value=0;}const low=c.s.currentHp<hp(c)*.3,k=c.k*(low?2:1),budget=hp(c)*.006*k,received=c.s.status.healingReceivedUntil>c.t?c.s.status.healingReceivedMultiplier:1,amount=Math.min(hp(c)*.002*k,Math.max(0,budget-e.value)/Math.max(Number.EPSILON,received));const actual=heal(c,amount);e.value+=actual;if(actual>0){metric(c,"procs");if(low)metric(c,"lowHpHealing",actual);equipmentFx(c.w,30);}}},
  31:{cast(c){equipmentFx(c.w,31);}},
  32:{kill(c){activate(c,5);}},
  33:{hit(c,h){if(c.s.currentHp<hp(c)*.5)heal(c,h.damage*.02*c.k);},tick(c,dt){metric(c,c.s.currentHp<hp(c)*.5?"siphonTime":"offenseTime",dt);}},
  34:{cast(c,id){reduceCooldown(c,3*c.k,AIRCRAFT_CONFIGS[c.s.aircraftId].skillIds.filter(s=>s!==id));equipmentFx(c.w,34);}},
  35:{hit(c,h){if(!h.primary)return;const id=AIRCRAFT_CONFIGS[c.s.aircraftId].skillIds.slice().sort((a,b)=>(c.s.cooldowns[b]??0)-(c.s.cooldowns[a]??0))[0];reduceCooldown(c,(h.critical?1:.25)*c.k,[id],h.critical?"criticalCooldown":"basicCooldown");equipmentFx(c.w,35);}},
  36:{hit(c,h){if(!h.critical)return;const m=mark(c.s,h.enemy,36);if(m.until<=c.t){m.stacks=0;m.tick=c.t+1;}m.stacks=Math.min(3,m.stacks+1);m.until=c.t+5;metric(c,"stacks");equipmentFx(c.w,36,h.enemy.x,h.enemy.y,50,5,h.enemy.id);}},
};
function contexts(w:CombatWorld,h:EquipmentHooks):Context[] {return [...activeEquipmentFamilies(w.aircraft).values()].map(d=>({w,s:w.aircraft,h,k:d.rarity==="legendary"?2:1,t:w.aircraft.coreState.time,f:Number(d.family!.slice(2))}));}
export function equipmentOnHit(w:CombatWorld,h:EquipmentHooks,hit:EquipmentHit) {for(const c of contexts(w,h))EFFECTS[c.f]?.hit?.(c,hit);}
export function equipmentOnCast(w:CombatWorld,h:EquipmentHooks,id:SkillId) {for(const c of contexts(w,h))EFFECTS[c.f]?.cast?.(c,id);}
export function equipmentOnDamage(w:CombatWorld,h:EquipmentHooks,hp:number,total:number) {for(const c of contexts(w,h))EFFECTS[c.f]?.damaged?.(c,hp,total);}
export function equipmentResourceSpent(s:AircraftCombatState,amount:number) {if(equipmentScale(s,24))equipmentEffect(s,24).value+=amount;}
export function equipmentSkillEnd(s:AircraftCombatState) {if(equipmentScale(s,29)){const e=equipmentEffect(s,29);e.until=s.coreState.time+3;e.duration=3;equipmentMetric(s,29,"procs",1);}}
export function equipmentArmorMultiplier(s:AircraftCombatState,e:EnemyEntity) {const m=equipmentState(s).marks[e.id]?.[15];return m&&m.until>s.coreState.time?1-.1*equipmentScale(s,15)*m.stacks:1;}
export function equipmentOutgoing(s:AircraftCombatState,e:EnemyEntity,basic:boolean,skill:boolean,direct:boolean) {
  const t=s.coreState.time,stats=getEffectiveAircraftStats(s),factors:[number,number][]=[],bonuses:[number,number][]=[];
  const factor=(id:number,n:number)=>{if(n)factors.push([id,1+n]);};
  if(direct)factor(1,.16*equipmentScale(s,1));
  if(skill){factor(7,.06*equipmentScale(s,7));factor(34,.12*equipmentScale(s,34));}
  const mark=equipmentState(s).marks[e.id]?.[7];if(mark&&mark.until>t)factor(7,.12*equipmentScale(s,7));
  if(equipmentEffect(s,26).until>t)factor(26,.03*equipmentScale(s,26)*equipmentEffect(s,26).stacks);
  if(equipmentGeminiMode(s,stats.maxHp,stats.maxResource)==="offense")factor(28,.1*equipmentScale(s,28));
  if(basic){if(equipmentScale(s,9))bonuses.push([9,Math.min(e.hp*.03*equipmentScale(s,9),e.type==="boss"||isElite(e.type)?stats.firepower*.4*equipmentScale(s,9):Infinity)]);if(equipmentScale(s,22))bonuses.push([22,stats.maxHp*.01*equipmentScale(s,22)]);}
  return {factors,bonuses,multiplier:factors.reduce((n,[,f])=>n*f,1),bonus:bonuses.reduce((n,[,v])=>n+v,0)};
}
export function equipmentIncoming(s:AircraftCombatState) {return (1-.12*equipmentScale(s,16))*(1-(equipmentEffect(s,21).until>s.coreState.time?.04*equipmentScale(s,21)*equipmentEffect(s,21).stacks:0));}
export function equipmentOnKill(w:CombatWorld,h:EquipmentHooks,e:EnemyEntity) {
  const s=w.aircraft,q=equipmentState(s);
  if(!e.auxiliary&&!e.rewardless&&e.expiresAt===undefined){
    if(q.eliteDropWave!==w.waveIndex){q.eliteDropWave=w.waveIndex;q.eliteKillsThisWave=0;}
    const elite=h.elite(e),boost=s.selectedCores.includes("core_224");
    if(elite||e.type!=="boss"){
      const first=elite&&q.eliteKillsThisWave++===0,base=first?1:elite?.20:.04,chance=first?1:boost?(elite?.30:.06):base,roll=w.random();
      if(roll<chance){q.loot.push({id:w.nextId++,definitionId:randomEquipmentId("TP",w.random),x:e.x,y:e.y,age:0});if(boost&&roll>=base){recordCoreMetric(s,224,"extraDrops",1);recordCoreMetric(s,224,elite?"eliteDrops":"normalDrops",1);}}
      if(!elite&&w.random()<.04)q.loot.push({id:w.nextId++,definitionId:"VP01",x:e.x+10,y:e.y,age:0});
    }
  }
  if(e.killProcEligible!==false)for(const c of contexts(w,h))EFFECTS[c.f]?.kill?.(c,e);
  delete q.marks[e.id];
}
export function tickEquipment(w:CombatWorld,dt:number,h:EquipmentHooks) {
  const s=w.aircraft,q=equipmentState(s),t=s.coreState.time,cs=contexts(w,h);
  for(const key of Object.keys(q.presentationGate))if(q.presentationGate[key]<t-1)delete q.presentationGate[key];
  if(q.eliteDropWave!==w.waveIndex){q.eliteDropWave=w.waveIndex;q.eliteKillsThisWave=0;}
  if(equipmentScale(s,13)&&q.lastX!==undefined){const e=equipmentEffect(s,13),before=e.value;e.value=Math.min(100,e.value+Math.hypot(w.playerX-q.lastX,w.playerY-q.lastY!)/6);if(before<100&&e.value===100)equipmentMetric(s,13,"charged",1);}
  q.lastX=w.playerX;q.lastY=w.playerY;
  for(const c of cs){
    EFFECTS[c.f]?.tick?.(c,dt);const e=equipmentEffect(s,c.f),step=Math.min(dt,Math.max(0,e.until-(t-dt)));
    if(step>0)metric(c,"uptime",step);
    if((c.f===2&&e.stacks===60&&step>0)||(c.f===10&&e.stacks===15))metric(c,"maxStackTime",dt);
    if(c.f===9)metric(c,"uptime",dt);
    if(c.f!==10&&e.until<=t)e.stacks=0;
  }
  for(const e of w.enemies){const m=q.marks[e.id]?.[36];if(m&&m.until>=t-dt&&h.hostile(w,e)){while(m.tick<=t&&m.tick<=m.until){m.tick+=1;const c=cs.find(c=>c.f===36);if(c)damage(c,e,power(c)*.45*c.k*m.stacks);}}}
  for(let i=q.meteors.length-1;i>=0;i--){const m=q.meteors[i];if(t<m.at)continue;q.meteors.splice(i,1);const c=cs.find(c=>c.f===24);if(!c)continue;
    for(const e of nearby(c,m.x,m.y,70)){damage(c,e,power(c)*2.2*m.scale);const slow=mark(s,e,24);slow.until=t+2;slow.stacks=m.scale;metric(c,"slows");}equipmentFx(w,24,m.x,m.y,140,.9);}
  if(q.orb){const orb=q.orb,c=cs.find(c=>c.f===23);if(orb.until<=t||!c)q.orb=undefined;
    else if(Math.hypot(w.playerX-orb.x,w.playerY-orb.y)<=EQUIPMENT_PICKUP_RADIUS){if(orb.shield){shield(c,hp(c)*.06*orb.scale,4);metric(c,"shieldOrbs");}else{heal(c,hp(c)*.04*orb.scale);metric(c,"lifeOrbs");}equipmentFx(w,23,orb.x,orb.y,70,.7);q.orb=undefined;}}
  for(let i=q.loot.length-1;i>=0;i--){
    const l=q.loot[i];l.age+=dt;
    if(l.collection){
      l.collection.age+=dt;const progress=Math.min(1,l.collection.age/.45),ease=progress*progress*(3-2*progress),target=q.hubTarget??{x:257,y:24};
      l.x=l.collection.x+(target.x-l.collection.x)*ease;l.y=l.collection.y+(target.y-l.collection.y)*ease;
      if(progress===1){grantEquipmentReward(s,l.definitionId,l.collection.source,l);q.loot.splice(i,1);}
    }else{
      l.y+=22*dt;
      if(l.y>=GAMEPLAY_SAFE_RECT.bottom||Math.hypot(l.x-w.playerX,l.y-w.playerY)<=EQUIPMENT_PICKUP_RADIUS)l.collection={age:0,x:l.x,y:l.y,source:l.y>=GAMEPLAY_SAFE_RECT.bottom?"auto-pickup":"pickup"};
    }
  }
  q.visuals=q.visuals.filter(v=>w.elapsed<v.start+v.duration);
}
export function equipmentSlow(s:AircraftCombatState,e:EnemyEntity) {const m=equipmentState(s).marks[e.id]?.[24];return m&&m.until>s.coreState.time?1-.25*m.stacks:1;}
