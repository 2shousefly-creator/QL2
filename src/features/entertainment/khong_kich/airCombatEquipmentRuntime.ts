import { EQUIPMENT_POWER as P } from "./airCombatEquipmentBalance";
import { advanceWaitingChest } from "./airCombatEquipmentRewards";
import { isElite } from "./airCombatWaves";
import type { CombatWorld, EnemyEntity } from "./airCombatRuntime";
import type { AircraftCombatState, SkillId } from "./airCombatTypes";
import { getEffectiveAircraftStats } from "./airCombatAircraft";
import { createAbsorbShield } from "./airCombatExpansion";
import { AIRCRAFT_CONFIGS } from "./airCombatConfig";
import { GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import { activeEquipmentFamilies, equipmentState, canGrantEquipmentReward, equipmentRewardsLocked, equipmentEffect, equipmentScale, equipmentMetric, grantEquipmentReward, randomEquipmentId, type EquipmentMark } from "./airCombatEquipmentState";
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
  2:{hit(c,h){if(h.basic)stack(c,1,20,4);},cast(c){stack(c,5,20,4);},damaged(c,_hp,total){if(total>0)equipmentEffect(c.s,2).stacks=Math.max(0,equipmentEffect(c.s,2).stacks-5);}},
  3:{damaged(c){if(c.s.currentHp<hp(c)*.4&&ready(c)){
    const e=equipmentEffect(c.s,3);e.value=(hp(c)-c.s.currentHp)*P[3].heal*c.k;activate(c,1.5);e.ready=c.t+40;e.bonusUntil=c.t+5.5;
    for(const p of c.w.projectiles)if(p.owner==="enemy"&&p.targetId===0)p.targetId=null;
  }},tick(c,dt){const e=equipmentEffect(c.s,3),step=Math.min(dt,Math.max(0,e.until-(c.t-dt)));if(step>0)heal(c,e.value*step/1.5);}},
  4:{damaged(c){if(c.s.currentHp<hp(c)*.6&&ready(c)){shield(c,hp(c)*P[4].shield*c.k,8);equipmentEffect(c.s,4).ready=Infinity;}},tick(c){const e=equipmentEffect(c.s,4),sh=c.s.coreState.shields["equipment:4"];if(e.ready===Infinity&&(!sh||sh.amount<=0||sh.until<=c.t))e.ready=c.t+60;}},
  5:{hit(c,h){const e=equipmentEffect(c.s,5),m=mark(c.s,h.enemy,5);
    if(h.skill&&h.direct){if(m.until<=c.t)m.stacks=0;m.until=c.t+8;metric(c,"marks");equipmentFx(c.w,5,h.enemy.x,h.enemy.y,52,8,h.enemy.id);}
    if(h.basic&&m.until>c.t&&++m.stacks>=4){m.until=0;metric(c,"explosions");const x=h.enemy.x,y=h.enemy.y;damage(c,h.enemy,power(c)*P[5].hit*c.k);for(const target of nearby(c,x,y,100))if(target!==h.enemy){damage(c,target,power(c)*P[5].area*c.k);metric(c,"aoeTargets");}e.bonusUntil=c.t+4;equipmentFx(c.w,5,x,y,200,.8);}
  }},
  6:{hit(c,h){if(h.primary&&++equipmentEffect(c.s,6).count%8===0){resource(c,getEffectiveAircraftStats(c.s).maxResource*P[6].resource*c.k);equipmentEffect(c.s,6).bonusUntil=c.t+4;}}},
  7:{hit(c,h){if(h.skill&&h.direct&&h.enemy.hp>0){mark(c.s,h.enemy,7).until=c.t+4;metric(c,"targets");equipmentFx(c.w,7,h.enemy.x,h.enemy.y,50,4,h.enemy.id);}}},
  8:{hit(c,h){if(h.skill&&h.critical){metric(c,"skillCrits");equipmentFx(c.w,8,h.enemy.x,h.enemy.y,58,.5,h.enemy.id);}}},
  9:{hit(c,h){if(h.basic)equipmentFx(c.w,9,h.enemy.x,h.enemy.y,24,.18,h.enemy.id);}},
  10:{damaged(c,_lost,total){if(total<=0)return;const e=equipmentEffect(c.s,10);
    if(e.until>c.t){const extra=Math.min(.5,3-e.value);e.until+=extra;e.value+=extra;return;}
    e.stacks=Math.min(6,e.stacks+1);peak(c,e.stacks);if(e.stacks===6){activate(c,8,0);e.value=0;}
  }},
  11:{cast(c){activate(c,6);}},
  12:{hit(c,h){if(!h.primary||++equipmentEffect(c.s,12).count%5)return;metric(c,"echoes",2);const targets=nearby(c,c.w.playerX,c.w.playerY).filter(e=>e!==h.enemy).slice(0,2);
    if(!targets.length){metric(c,"merged");damage(c,h.enemy,power(c)*P[12].merged*c.k,{x:c.w.playerX,y:c.w.playerY});}
    else for(let i=0;i<2;i++)damage(c,targets[i%targets.length],power(c)*P[12].echo*c.k,{x:c.w.playerX+(i?28:-28),y:c.w.playerY});
  }},
  13:{hit(c,h){if(!h.primary)return;const e=equipmentEffect(c.s,13);
    if(e.value>=100){e.value=0;metric(c,"chains");const used=new Set<number>();let next:EnemyEntity|undefined=h.enemy,from={x:c.w.playerX,y:c.w.playerY};
      for(let i=0;i<4;i++){const target=next??h.enemy;damage(c,target,power(c)*P[13].damage*c.k*(next?1:P[13].returnRatio*c.k),from);used.add(target.id);from={x:target.x,y:target.y};next=nearby(c,from.x,from.y).find(e=>!used.has(e.id));}}
    else {const before=e.value;e.value=Math.min(100,e.value+8);if(before<100&&e.value===100)metric(c,"charged");}
  }},
  14:{kill(c,e){if(e.expansionKillingHit?.skill){activate(c,8);equipmentEffect(c.s,14).value=1;}},hit(c,h){if(h.skill&&h.direct&&(h.enemy.type==="boss"||c.h.elite(h.enemy))){const e=equipmentEffect(c.s,14);e.value=e.until>c.t?Math.max(.5,e.value):.5;activate(c,8);}}},
  15:{hit(c,h){if(!h.critical)return;const m=mark(c.s,h.enemy,15);m.stacks=Math.min(4,(m.until>c.t?m.stacks:0)+1);m.until=c.t+5;metric(c,"stacks");peak(c,m.stacks);if(m.stacks===1)metric(c,"targets");equipmentFx(c.w,15,h.enemy.x,h.enemy.y,48,5,h.enemy.id);}},
  16:{},
  17:{damaged(c,lost){if(lost>0&&ready(c)){shield(c,hp(c)*P[17].shield*c.k,5);equipmentEffect(c.s,17).ready=c.t+10;}}},
  18:{damaged(c,lost){if(lost>0){const e=equipmentEffect(c.s,18),before=e.value;e.value=Math.min(hp(c)*P[18].cap*c.k,e.value+lost*P[18].stored*c.k);e.until=c.t+2.5;e.duration=2.5;metric(c,"stored",e.value-before);}},tick(c){const e=equipmentEffect(c.s,18);if(e.value>0&&c.t>=e.until){heal(c,e.value*P[18].heal*c.k);e.value=0;e.bonusUntil=c.t+4;metric(c,"procs");equipmentFx(c.w,18);}}},
  19:{damaged(c,lost){if(lost>0&&ready(c)){resource(c,getEffectiveAircraftStats(c.s).maxResource*P[19].resource*c.k);equipmentEffect(c.s,19).ready=c.t+4;}}},
  20:{cast(c){activate(c,5);}},
  21:{hit(c,h){if(h.critical)stack(c,1,4,3.5);}},
  22:{},
  23:{damaged(c,lost){const e=equipmentEffect(c.s,23);e.value+=lost;const q=equipmentState(c.s);
    if(e.value>=hp(c)*.10&&!q.orb){const a=c.w.random()*Math.PI*2,r=45+c.w.random()*40;let dx=Math.cos(a)*r,dy=Math.sin(a)*r;
      if(c.w.playerX+dx<GAMEPLAY_SAFE_RECT.left+12||c.w.playerX+dx>GAMEPLAY_SAFE_RECT.right-12)dx=-dx;
      if(c.w.playerY+dy<GAMEPLAY_SAFE_RECT.top+12||c.w.playerY+dy>GAMEPLAY_SAFE_RECT.bottom-12)dy=-dy;
      q.orb={x:c.w.playerX+dx,y:c.w.playerY+dy,until:c.t+7,shield:c.w.random()<.5,scale:c.k};e.value-=hp(c)*.10;metric(c,"orbs");}
  }},
  24:{tick(c){const e=equipmentEffect(c.s,24),targets=nearby(c,c.w.playerX,c.w.playerY).sort((a,b)=>b.hp-a.hp);if(e.value>=getEffectiveAircraftStats(c.s).maxResource*.30&&targets.length){e.value-=getEffectiveAircraftStats(c.s).maxResource*.30;const target=targets[0];equipmentState(c.s).meteors.push({x:target.x,y:target.y,at:c.t+.6,scale:c.k});equipmentFx(c.w,24,target.x,target.y,140,.6);metric(c,"meteors");}}},
  25:{damaged(c){if(c.s.currentHp<hp(c)*.35&&ready(c)){reduceCooldown(c,P[25].cooldown*c.k,AIRCRAFT_CONFIGS[c.s.aircraftId].skillIds);shield(c,hp(c)*P[25].shield*c.k,5);const e=equipmentEffect(c.s,25);e.ready=c.t+25;e.bonusUntil=c.t+6;}}},
  26:{hit(c,h){if(h.critical)stack(c,1,6,6);}},
  27:{tick(c,dt){heal(c,Math.max(0,hp(c)-c.s.currentHp)*P[27].regen*c.k*dt);}},
  28:{tick(c,dt){const stats=getEffectiveAircraftStats(c.s);metric(c,`${equipmentGeminiMode(c.s,stats.maxHp,stats.maxResource)}Time`,dt);}},
  29:{tick(c,dt){const e=equipmentEffect(c.s,29),step=Math.min(dt,Math.max(0,e.until-(c.t-dt)));if(step>0){const amount=hp(c)*P[29].heal*c.k*step/3,received=c.s.status.healingReceivedUntil>c.t?c.s.status.healingReceivedMultiplier:1,actual=heal(c,amount),excess=Math.max(0,amount*received-actual);if(excess>0){const old=c.s.coreState.shields["equipment:29"],before=old&&old.until>c.t?old.amount:0;const amplification=c.s.selectedCores.includes("core_200")?1.5:1;const sh=old&&old.until>c.t?old:createAbsorbShield(c.s,"equipment:29",0,3);sh.amount=Math.min(hp(c)*P[29].shield*c.k*amplification,before+excess*amplification);sh.capacity=Math.max(sh.capacity??0,sh.amount);sh.until=c.t+3;metric(c,"shieldCreated",Math.max(0,sh.amount-before));}}}},
  30:{hit(c,h){if(!h.critical)return;const e=equipmentEffect(c.s,30);if(c.t>=e.tick){e.tick=c.t+1;e.value=0;}const low=c.s.currentHp<hp(c)*.3,budget=hp(c)*P[30].cap*c.k*(low?2:1),received=c.s.status.healingReceivedUntil>c.t?c.s.status.healingReceivedMultiplier:1,amount=Math.min(hp(c)*P[30].heal*c.k,Math.max(0,budget-e.value)/Math.max(Number.EPSILON,received));const actual=heal(c,amount);e.value+=actual;if(actual>0){metric(c,"procs");if(low)metric(c,"lowHpHealing",actual);equipmentFx(c.w,30);}}},
  31:{cast(c){equipmentFx(c.w,31);}},
  32:{kill(c){activate(c,6);equipmentEffect(c.s,32).value=1;},hit(c,h){if(h.skill&&h.direct&&(h.enemy.type==="boss"||c.h.elite(h.enemy))){const e=equipmentEffect(c.s,32);e.value=e.until>c.t?Math.max(.5,e.value):.5;activate(c,6);}}},
  33:{hit(c,h){if(c.s.currentHp<hp(c)*.5)heal(c,h.damage*P[33].heal*c.k);},tick(c,dt){metric(c,c.s.currentHp<hp(c)*.5?"siphonTime":"offenseTime",dt);}},
  34:{cast(c,id){reduceCooldown(c,P[34].cooldown*c.k,AIRCRAFT_CONFIGS[c.s.aircraftId].skillIds.filter(s=>s!==id));equipmentFx(c.w,34);}},
  35:{hit(c,h){if(!h.basic)return;const id=AIRCRAFT_CONFIGS[c.s.aircraftId].skillIds.slice().sort((a,b)=>(c.s.cooldowns[b]??0)-(c.s.cooldowns[a]??0))[0];const e=equipmentEffect(c.s,35);if(c.t>=e.tick){e.tick=c.t+1;e.value=0;}const reduction=Math.min((h.critical?P[35].critical:P[35].cooldown)*c.k,Math.max(0,P[35].cap*c.k-e.value),c.s.cooldowns[id]??0);e.value+=reduction;e.progress=(e.progress??0)+reduction;if(e.progress>=4){e.progress-=4;e.empowered=true;}reduceCooldown(c,reduction,[id],h.critical?"criticalCooldown":"basicCooldown");if(reduction>0)equipmentFx(c.w,35);}},
  36:{hit(c,h){if(!h.critical)return;const m=mark(c.s,h.enemy,36);if(m.until<=c.t){m.stacks=0;m.tick=c.t+1;}m.stacks=Math.min(3,m.stacks+1);m.until=c.t+4;metric(c,"stacks");equipmentFx(c.w,36,h.enemy.x,h.enemy.y,50,4,h.enemy.id);}},
};
function contexts(w:CombatWorld,h:EquipmentHooks):Context[] {return [...activeEquipmentFamilies(w.aircraft).values()].map(d=>({w,s:w.aircraft,h,k:d.rarity==="legendary"?2:1,t:w.aircraft.coreState.time,f:Number(d.family!.slice(2))}));}
export function equipmentOnHit(w:CombatWorld,h:EquipmentHooks,hit:EquipmentHit) {for(const c of contexts(w,h))EFFECTS[c.f]?.hit?.(c,hit);}
export function equipmentOnCast(w:CombatWorld,h:EquipmentHooks,id:SkillId) {for(const c of contexts(w,h))EFFECTS[c.f]?.cast?.(c,id);}
export function equipmentOnDamage(w:CombatWorld,h:EquipmentHooks,hp:number,total:number) {for(const c of contexts(w,h))EFFECTS[c.f]?.damaged?.(c,hp,total);}
export function equipmentResourceSpent(s:AircraftCombatState,amount:number) {if(equipmentScale(s,24))equipmentEffect(s,24).value+=amount;}
export function equipmentSkillEnd(s:AircraftCombatState) {if(equipmentScale(s,29)){const e=equipmentEffect(s,29);if(e.ready>s.coreState.time)return;e.ready=s.coreState.time+3;e.until=s.coreState.time+3;e.duration=3;equipmentMetric(s,29,"procs",1);}}
export function equipmentArmor(s:AircraftCombatState,e:EnemyEntity) {const m=equipmentState(s).marks[e.id]?.[15];return e.armor-(m&&m.until>s.coreState.time?P[15].armor*equipmentScale(s,15)*m.stacks:0);}
export function equipmentOutgoing(s:AircraftCombatState,e:EnemyEntity,basic:boolean,skill:boolean,direct:boolean) {
  const t=s.coreState.time,stats=getEffectiveAircraftStats(s),factors:[number,number][]=[],bonuses:[number,number][]=[];
  const factor=(id:number,n:number)=>{if(n)factors.push([id,1+n]);};
  const scale=(id:number)=>equipmentScale(s,id),active=(id:number)=>equipmentEffect(s,id).until>t;
  const marks=equipmentState(s).marks[e.id];
  if(direct)factor(1,P[1].damage*scale(1));
  if(skill){factor(7,P[7].skill*scale(7));factor(34,P[34].skill*scale(34));if(active(14))factor(14,P[14].skill*scale(14)*equipmentEffect(s,14).value);if(active(32))factor(32,P[32].skill*scale(32));if(s.currentResource>stats.maxResource*.8)factor(31,P[31].skill*scale(31));}
  if(marks?.[7]?.until>t)factor(7,P[7].vulnerability*scale(7));
  if(direct&&marks?.[15]?.until>t&&marks[15].stacks===4)factor(15,P[15].vulnerability*scale(15));
  if(marks?.[36]?.until>t&&marks[36].stacks===3)factor(36,P[36].vulnerability*scale(36));
  if(active(26))factor(26,P[26].damage*scale(26)*equipmentEffect(s,26).stacks);
  if(equipmentGeminiMode(s,stats.maxHp,stats.maxResource)==="offense")factor(28,P[28].damage*scale(28));
  if(s.currentHp>=stats.maxHp*.5)factor(33,P[33].damage*scale(33));
  if(active(10))factor(10,P[10].damage*scale(10));
  if(active(21)&&equipmentEffect(s,21).stacks===4)factor(21,P[21].damage*scale(21));
  const atlas=s.coreState.shields["equipment:17"];if(atlas&&atlas.amount>0&&atlas.until>t)factor(17,P[17].damage*scale(17));
  for(const id of [3,18,23,25] as const)if((equipmentEffect(s,id).bonusUntil??0)>t&&(id!==3||!active(3)))factor(id,P[id].damage*scale(id));
  if(basic){if(active(2)&&equipmentEffect(s,2).stacks===20)factor(2,P[2].basic*scale(2));if(active(11))factor(11,P[11].basic*scale(11));if(scale(9))bonuses.push([9,Math.min(e.hp*P[9].currentHp*scale(9),e.type==="boss"||isElite(e.type)?stats.firepower*P[9].eliteCap*scale(9):Infinity)]);if(scale(22))bonuses.push([22,stats.maxHp*P[22].damage*scale(22)]);}
  return {factors,bonuses,multiplier:factors.reduce((n,[,f])=>n*f,1),bonus:bonuses.reduce((n,[,v])=>n+v,0)};
}
export function equipmentIncoming(s:AircraftCombatState) {
  const active=(id:number)=>equipmentEffect(s,id).until>s.coreState.time;
  return (1-P[16].reduction*equipmentScale(s,16))*(1-(active(21)?P[21].reduction*equipmentScale(s,21)*equipmentEffect(s,21).stacks:0))*(1-(active(20)?P[20].reduction*equipmentScale(s,20):0))*(1-(s.currentHp<getEffectiveAircraftStats(s).maxHp*.5?P[33].reduction*equipmentScale(s,33):0));
}
export function equipmentPreventedDamage(w:CombatWorld,h:EquipmentHooks,prevented:number){
  const c=contexts(w,h).find(c=>c.f===16);if(!c||prevented<=0)return;
  const e=equipmentEffect(c.s,16);e.value+=prevented;metric(c,"prevented",prevented);
  while(e.value>=hp(c)*.12){e.value-=hp(c)*.12;metric(c,"procs");for(const target of nearby(c,w.playerX,w.playerY,150))damage(c,target,power(c)*P[16].damage*c.k);}
}
/** Snapshot once for the next damaging cast, including delayed/channeled hits. */
export function equipmentConsumeSkillBonus(s:AircraftCombatState):number {
  let bonus=1;const fire=equipmentEffect(s,5),time=equipmentEffect(s,35);
  if((fire.bonusUntil??0)>s.coreState.time&&equipmentScale(s,5)){bonus*=1+P[5].skill*equipmentScale(s,5);fire.bonusUntil=0;}
  if(time.empowered&&equipmentScale(s,35)){bonus*=1+P[35].skill*equipmentScale(s,35);time.empowered=false;}
  return bonus;
}
export function equipmentOnKill(w:CombatWorld,h:EquipmentHooks,e:EnemyEntity) {
  const s=w.aircraft,q=equipmentState(s);
  if(!e.auxiliary&&!e.rewardless&&e.expiresAt===undefined&&e.type!=="boss"){
    q.pendingDrops.push({x:e.x,y:e.y,elite:h.elite(e),wave:w.waveIndex});
    advanceWaitingChest(s,h.elite(e)?8:1);
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
    if([3,4,25].includes(c.f)&&s.currentHp>0)EFFECTS[c.f]?.damaged?.(c,0,0);
    EFFECTS[c.f]?.tick?.(c,dt);const e=equipmentEffect(s,c.f),step=Math.min(dt,Math.max(0,e.until-(t-dt)));
    if(step>0)metric(c,"uptime",step);
    if((c.f===2&&e.stacks===20&&step>0)||(c.f===10&&e.until>t))metric(c,"maxStackTime",dt);
    if(c.f===9)metric(c,"uptime",dt);
    if(c.f!==10&&e.until<=t)e.stacks=0;
  }
  for(const e of w.enemies){const m=q.marks[e.id]?.[36];if(m&&m.until>=t-dt&&h.hostile(w,e)){while(m.tick<=t&&m.tick<=m.until){m.tick+=1;const c=cs.find(c=>c.f===36);if(c)damage(c,e,power(c)*P[36].bleed*c.k*m.stacks);}}}
  for(let i=q.meteors.length-1;i>=0;i--){const m=q.meteors[i];if(t<m.at)continue;q.meteors.splice(i,1);const c=cs.find(c=>c.f===24);if(!c)continue;
    const targets=nearby(c,m.x,m.y,80);for(const e of targets){damage(c,e,power(c)*P[24].damage*m.scale);const slow=mark(s,e,24);slow.until=t+2;slow.stacks=m.scale;metric(c,"slows");}if(targets.length)resource(c,getEffectiveAircraftStats(s).maxResource*P[24].resource*m.scale);equipmentFx(w,24,m.x,m.y,160,.9);}
  if(q.orb){const orb=q.orb,c=cs.find(c=>c.f===23);if(orb.until<=t||!c)q.orb=undefined;
    else if(Math.hypot(w.playerX-orb.x,w.playerY-orb.y)<=EQUIPMENT_PICKUP_RADIUS){if(orb.shield){shield(c,hp(c)*P[23].shield*orb.scale,5);metric(c,"shieldOrbs");}else{heal(c,hp(c)*P[23].heal*orb.scale);metric(c,"lifeOrbs");}equipmentEffect(s,23).bonusUntil=t+4;equipmentFx(w,23,orb.x,orb.y,70,.7);q.orb=undefined;}}
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
export function equipmentSlow(s:AircraftCombatState,e:EnemyEntity) {const m=equipmentState(s).marks[e.id]?.[24];return m&&m.until>s.coreState.time?1-P[24].slow*m.stacks:1;}

/** Resolve the entire frame's kills together, before any pause or wave transition. */
export function flushEquipmentDrops(w:CombatWorld) {
  const s=w.aircraft,q=equipmentState(s),pending=q.pendingDrops.splice(0);
  for(const wave of new Set(pending.map(e=>e.wave))){
    const kills=pending.filter(e=>e.wave===wave),elites=kills.filter(e=>e.elite);
    if(q.eliteDropWave!==wave){q.eliteDropWave=wave;q.eliteKillsThisWave=0;}
    const first=q.eliteKillsThisWave===0&&elites.length?elites[0]:undefined;
    for(const e of kills){
      const chances=e===first?[.10,.35,1,.10]:e.elite?[.05,.35,.10,.02]:[.005,.015,.0025,.0005];
      const boost=s.selectedCores.includes("core_224")&&!equipmentRewardsLocked(s)?1.75:1;
      for(const [index,prefix] of (["VP01","TP","TH","HL"] as const).entries()){
        const roll=w.random(),base=chances[index];
        if(roll>=Math.min(1,base*boost)||!canGrantEquipmentReward(s,prefix==="VP01"?prefix:`${prefix}01`))continue;
        const definitionId=prefix==="VP01"?prefix:randomEquipmentId(prefix,w.random);
        q.loot.push({id:w.nextId++,definitionId,x:e.x+(index-1.5)*9,y:e.y+(index%2)*7,age:0});
        if(boost>1&&roll>=base){recordCoreMetric(s,224,"extraDrops",1);recordCoreMetric(s,224,e.elite?"eliteDrops":"normalDrops",1);}
      }
    }
    q.eliteKillsThisWave+=elites.length;
  }
}
