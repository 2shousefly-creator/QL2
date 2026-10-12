import { AIRCRAFT_CONFIGS, AIRCRAFT_ORDER, CORE_DEFINITIONS, GAMEPLAY_SAFE_RECT as R, stageEnemyConfig } from './airCombatConfig';
import { getEffectiveAircraftStats, gainCombatXp, tickAircraftState } from './airCombatAircraft';
import { allocateSkillPoint, canAllocateSkill, isUltimate } from './airCombatSkillRanks';
import { equipmentState, equipmentRewardsLocked, grantEquipmentReward, selectEquipmentReward, toggleCraftComponent, startEquipmentCraft, tickEquipmentCraft, equipEquipment, extractEquipment } from './airCombatEquipmentState';
import { EQUIPMENT_CATALOG, type EquipmentDefinitionId } from './airCombatEquipmentCatalog';
import { advanceWaitingChest, claimWaitingChest } from './airCombatEquipmentRewards';
import { releaseState } from './airCombatReleaseState';
import { chooseDuelPrimary } from './airCombatDuelCore';
import { getPlayerHitbox, getEnemyHitbox, sweepAircraft, segmentVsAircraft, circleVsAircraft, createHitResult } from './airCombatHitboxes';
import { HIVE_NORMALS,HIVE_MOTHERS } from './airCombatHiveWaves';
import { isElite } from './airCombatWaves';
import { argentRecallOpportunity } from './airCombatArgentRuntime';
import { cinderStacks } from './airCombatCinderRuntime';
import { sylvaState } from './airCombatSylvaRuntime';
import { terraHud } from './airCombatTerraRuntime';
import { castWorldSkill, getWorldSkillAvailability, movePlayerByDelta, ensureCoreSelection, selectCore, rerollCore, bestAvailableRerollSource, type CombatWorld, type EnemyEntity, type ProjectileEntity } from './airCombatRuntime';
import type { SkillId, CoreCard } from './airCombatTypes';

export interface HiveAlly { world:CombatWorld; slot:number; respawn:number; thinkAt:number; skillAt:number; x:number;y:number; allocation:number; target?:number; seen:Map<number,number> }
export interface HiveHazard { id:number; enemyId:number; kind:'blast'|'lane'|'dash'|'pulse'; x:number;y:number;endX:number;endY:number;radius:number; at:number; until:number; damage:number; fired:boolean; pattern:number }
export interface HiveEnemy { basicCooldown?:number; coreOpen?:boolean; slot:number; attack:number; exposedUntil:number; shield:number; shieldBroken:boolean; phase:number; support:number; repairTarget?:number; dash?:{x:number;y:number;endX:number;endY:number;start:number;until:number;hits:Set<CombatWorld>} }
export interface HiveState { allies:HiveAlly[]; hazards:HiveHazard[]; effects:{row:number;x:number;y:number;size:number;at:number;duration:number}[]; majorReady:number; nextHazard:number; lootOwner?:number; ccUntil:number }
export interface HiveHooks { spawn:(w:CombatWorld,type:EnemyEntity['type'])=>EnemyEntity|null; movement:(w:CombatWorld,e:EnemyEntity)=>number; projectile:(w:CombatWorld,p:Partial<ProjectileEntity>&Pick<ProjectileEntity,'owner'|'x'|'y'|'vx'|'vy'|'rawDamage'>)=>ProjectileEntity|null; hit:(w:CombatWorld,damage:number,stun?:number)=>void }
export const hiveRoot=(w:CombatWorld)=>w.hiveHost??w;
const rosters=new WeakMap<CombatWorld,{hive:HiveState|undefined;actors:CombatWorld[]}>();
export const hiveActors=(w:CombatWorld)=>{
 const root=hiveRoot(w),cached=rosters.get(root);
 if(cached&&cached.hive===root.hive)return cached.actors;
 const actors=[root,...(root.hive?.allies.map(a=>a.world)??[])];
 rosters.set(root,{hive:root.hive,actors});return actors;
};
export function createHive(root:CombatWorld,create:(id:CombatWorld['aircraft']['aircraftId'])=>CombatWorld):HiveState {
 const pool=AIRCRAFT_ORDER.filter(id=>id!==root.aircraft.aircraftId);
 const hive:HiveState={allies:[],hazards:[],effects:[],majorReady:0,nextHazard:1,ccUntil:0};
 root.aircraft.hiveSquad=true;
 for(let slot=0;slot<2;slot++){
  const id=pool.splice(Math.min(pool.length-1,Math.floor(root.random()*pool.length)),1)[0],w=create(id);
  w.hiveHost=root;w.stage=root.stage;w.stageId=5;w.aircraft.hiveSquad=true;w.enemies=root.enemies;
  w.nextId=(slot+1)*100000000;w.playerX=R.left+R.width*(slot?.76:.24);w.playerY=R.bottom-90;
  w.initialCoreQueued=true;w.aircraft.pendingMilestones=[1];w.pendingCoreSelections=1;
  hive.allies.push({world:w,slot,respawn:0,thinkAt:.2+slot*.07,skillAt:1,x:w.playerX,y:w.playerY,allocation:0,seen:new Map()});
 }
 return hive;
}
export function hiveFx(w:CombatWorld,row:number,x:number,y:number,size:number,duration=.65){const h=hiveRoot(w).hive;if(!h)return;if(h.effects.length>=96)h.effects.shift();h.effects.push({row,x,y,size,at:hiveRoot(w).elapsed,duration});}
// Keep the earlier skill cadence; ordinary fire is halved again, including escorts.
const slowedNormal=(w:CombatWorld,e:EnemyEntity)=>HIVE_NORMALS.includes(e.type)&&w.stage.waves[w.waveIndex].normalPower!==undefined;
const normalSkill=(e:EnemyEntity)=>['razor_glider','siege_spitter','signal_weaver'].includes(e.type);
const attackInterval=(w:CombatWorld,e:EnemyEntity,seconds:number,skill:boolean)=>seconds*(skill?(slowedNormal(w,e)?2:1):HIVE_NORMALS.includes(e.type)?(slowedNormal(w,e)?8:2):1);
export function initializeHiveEnemy(w:CombatWorld,e:EnemyEntity){
 if(w.stageId!==5)return;
 e.hive={slot:w.spawnedInWave,attack:0,exposedUntil:0,shield:0,shieldBroken:false,phase:1,support:0};
 e.airframeRotation=0; // The generated enemy atlas is authored nose down.
 if(e.type==='boss'){e.hp=e.maxHp=stageEnemyConfig('boss',5).baseHp;e.armor=stageEnemyConfig('boss',5).baseArmor;e.damageScale=1;}
 if(e.type==='aegis_beetle'||e.type==='aegis_regent')e.hive.shield=e.maxHp*.35;
 e.x=R.left+35+(w.spawnedInWave%6)*(R.width-70)/5;
 if(HIVE_MOTHERS.includes(e.type)||e.type==='boss')e.x=R.left+R.width/2;
 const leader=w.enemies.find(n=>n!==e&&n.hp>0&&HIVE_MOTHERS.includes(n.type));
 if(leader&&w.spawnedInWave<7){e.x=leader.x+(w.spawnedInWave%5-2)*38;e.y=leader.y+70;}
 const opening=1.8+(w.spawnedInWave%6)*.25;
 e.fireCooldown=attackInterval(w,e,opening,normalSkill(e));
 if(e.type==='signal_weaver')e.hive.basicCooldown=attackInterval(w,e,opening,false);
}
export function hiveArmorExposed(w:CombatWorld,e:EnemyEntity,contact?:{x:number;y:number}){
 return !!e.hive&&e.hive.exposedUntil>hiveRoot(w).elapsed&&!!contact&&Math.hypot(contact.x-e.x,contact.y-e.y)<=e.radius*.42;
}
export function hiveShieldAbsorb(w:CombatWorld,e:EnemyEntity,raw:number,contact?:{x:number;y:number}):number {
 const h=e.hive;if(!h||h.shield<=0||!contact||contact.y<e.y-e.radius*.1)return raw;
 const used=Math.min(raw,h.shield);h.shield-=used;
 if(h.shield<=0&&!h.shieldBroken){h.shieldBroken=true;e.fireCooldown=.1;hiveFx(w,7,e.x,e.y,e.radius*3);}
 return raw-used;
}
export function hiveMotherDeath(w:CombatWorld,e:EnemyEntity){
 if(!HIVE_MOTHERS.includes(e.type))return;
 hiveFx(w,0,e.x,e.y,640,1.25);
 for(const other of w.enemies)if(other!==e&&other.hp>0&&!isElite(other.type)&&other.type!=='boss'&&!HIVE_MOTHERS.includes(other.type)&&Math.hypot(other.x-e.x,other.y-e.y)<=320){
  const owner=e.hiveKiller??w,damage=Math.min(other.hp,e.maxHp);other.hp-=damage;owner.damageDealt+=damage;other.hiveKiller=owner;other.killProcEligible=false;
 }
}
export function hiveXp(w:CombatWorld,xp:number){
 for(const a of w.hive?.allies??[]){const dead=a.respawn>0||a.world.aircraft.currentHp<=0;gainCombatXp(a.world.aircraft,xp,5);a.world.pendingCoreSelections=a.world.aircraft.pendingMilestones.length;if(dead)a.world.aircraft.currentHp=0;}
}

function equipmentValue(w:CombatWorld,id:EquipmentDefinitionId){
 const d=EQUIPMENT_CATALOG[id],family=Number(id.slice(2));
 const skills=['phantom','astra','cinder','sylva','terra'].includes(w.aircraft.aircraftId);
 const synergy=(skills?[7,8,14,24,31,34,35]:[1,2,9,12,13,26]).includes(family)?3:0;
 const defense=[3,4,16,17,18,25,27,30,33].includes(family)?(w.aircraft.currentHp<getEffectiveAircraftStats(w.aircraft).maxHp*.5?2:1):0;
 const duplicate=equipmentState(w.aircraft).equipped.some(i=>i?.definitionId.slice(2)===id.slice(2))?4:0;
 return (d.rarity==='legendary'?16:d.rarity==='completed'?8:1)+synergy+defense-duplicate;
}
function coreValue(w:CombatWorld,card:CoreCard){
 const c=CORE_DEFINITIONS.find(c=>c.id===card.id)!;const s=w.aircraft,stats=getEffectiveAircraftStats(s);
 let value=2+(card.tier==='diamond'?2:card.tier==='gold'?1:0);
 if(c.aircraftIds?.includes(s.aircraftId))value+=2;
 if(c.system==='resource')value+=s.currentResource<stats.maxResource*.4?3:1;
 if(c.system==='defense')value+=s.currentHp<stats.maxHp*.5?3:.5;
 if(c.system==='attack'||c.system==='skill')value+=1.5;
 if(c.id==='core_224')value+=w.waveIndex<4?3:0;
 if(c.id==='core_228')value+=equipmentState(s).equipped.filter(Boolean).length<3?3:-3;
 if(c.id==='core_227')value+=w.waveIndex<2?2:-2;
 return value;
}
export function manageHiveBuild(a:HiveAlly){
 const w=a.world,s=w.aircraft,dead=a.respawn>0||s.currentHp<=0,ids=AIRCRAFT_CONFIGS[s.aircraftId].skillIds;
 for(let i=0;i<20&&s.skillPoints>0;i++){
  const available=ids.filter(id=>canAllocateSkill(s,id));
  const ult=available.find(isUltimate),basic=available.filter(id=>!isUltimate(id));
  basic.sort((x,y)=>(s.skillRanks[x]??0)-(s.skillRanks[y]??0)||((ids.indexOf(x)-a.allocation+4)%4)-((ids.indexOf(y)-a.allocation+4)%4));
  const id=ult??basic[0];if(!id)break;allocateSkillPoint(s,id);if(!isUltimate(id))a.allocation=(ids.indexOf(id)+1)%4;
 }
 // All transactions use this actor's real offer, history and random stream.
 for(let guard=0;guard<20;guard++){
  const reward=equipmentState(s).rewardChoices?.[0];
  if(reward){const id=[...reward.options].sort((x,y)=>equipmentValue(w,y)-equipmentValue(w,x))[0];if(!id||!selectEquipmentReward(s,id))break;continue;}
  if(releaseState(s).followups.includes('primary')){const slot=ids.reduce((best,id,i)=>!(s.selectedCores.includes('core_097')&&isUltimate(id))&&(s.skillRanks[id]??0)>(s.skillRanks[ids[best]]??0)?i:best,0);chooseDuelPrimary(w,slot);continue;}
  const offers=ensureCoreSelection(w);if(!offers?.length)break;
  let best=[...offers].sort((x,y)=>coreValue(w,y)-coreValue(w,x))[0];
  if(coreValue(w,best)<4){const slot=offers.indexOf(best),source=bestAvailableRerollSource(w,slot);if(source){rerollCore(w,slot,source);best=[...(w.currentCoreChoices??[])].sort((x,y)=>coreValue(w,y)-coreValue(w,x))[0]??best;}}
  if(!selectCore(w,best))break;
 }
 w.pauseReasons.delete('equipmentReward');if(!s.pendingMilestones.length)w.pauseReasons.delete('core');
 const q=equipmentState(s);tickEquipmentCraft(s,w.elapsed);
 if(!q.craftJob&&!equipmentRewardsLocked(s)&&q.components.length>=2){
  const latest=[...q.components].sort((x,y)=>y.instanceId-x.instanceId).slice(0,2);
  for(const item of latest)toggleCraftComponent(s,item.instanceId);startEquipmentCraft(s,w.elapsed);
 }
 const inventory=()=>[...q.completed].sort((x,y)=>equipmentValue(w,y.definitionId)-equipmentValue(w,x.definitionId));
 while(q.equipped.includes(null)&&q.completed.length)equipEquipment(s,inventory()[0].instanceId);
 if(!q.equipped.includes(null)&&q.completed.length&&q.items.VP01>0){
  const next=inventory()[0],worst=Math.min(...q.equipped.map(i=>equipmentValue(w,i!.definitionId)));
  if(equipmentValue(w,next.definitionId)>worst+3){extractEquipment(s);while(q.equipped.includes(null)&&q.completed.length)equipEquipment(s,inventory()[0].instanceId);}
 }
 if(dead)s.currentHp=0;
}

const hit=createHitResult();
function danger(w:CombatWorld,x:number,y:number,a:HiveAlly,horizon=.65){
 const root=hiveRoot(w),dx=x-w.playerX,dy=y-w.playerY,body=getPlayerHitbox(w);let cost=0;
 for(const p of root.projectiles){
  if(p.owner!=='enemy'||p.allegiance==='friendly_hacked')continue;
  const seen=a.seen.get(p.id);if(seen===undefined){a.seen.set(p.id,root.elapsed);continue;}if(root.elapsed-seen<.14)continue;
  // Relative swept trajectory includes travel to the candidate, using real capsule hitboxes.
  if(segmentVsAircraft(p.x,p.y,p.x+p.vx*horizon-dx,p.y+p.vy*horizon-dy,p.radius+3,body,hit).hit)cost+=80+Math.min(150,p.rawDamage);
 }
 for(const z of root.hive!.hazards){if(z.until<root.elapsed)continue;const starts=z.at-root.elapsed;if(starts>horizon+.2)continue;
  if(z.kind==='lane'||z.kind==='dash'){if(segmentVsAircraft(z.x-dx,z.y-dy,z.endX-dx,z.endY-dy,z.radius,body,hit).hit)cost+=250;}
  else if(circleVsAircraft(z.x-dx,z.y-dy,z.radius,body))cost+=220;
 }
 for(const e of root.enemies)if(e.hp>0&&Math.hypot(e.x-x,e.y-y)<e.radius+24)cost+=300;
 for(const actor of hiveActors(root))if(actor!==w&&actor.aircraft.currentHp>0){const d=Math.hypot(actor.playerX-x,actor.playerY-y);if(d<58)cost+=(58-d)*2;}
 return cost;
}
function chooseHiveSkill(a:HiveAlly,target:EnemyEntity|undefined,threat:number):SkillId|undefined {
 const w=a.world,s=w.aircraft,root=hiveRoot(w),stats=getEffectiveAircraftStats(s),ids=AIRCRAFT_CONFIGS[s.aircraftId].skillIds;
 if(!target)return;
 const range=Math.hypot(target.x-w.playerX,target.y-w.playerY),line=Math.abs(target.x-w.playerX)<target.radius+18&&target.y<w.playerY;
 const cluster=root.enemies.filter(e=>e.hp>0&&Math.hypot(e.x-target.x,e.y-target.y)<90).length;
 const durable=target.hp>stats.firepower*5,big=target.type==='boss'||HIVE_MOTHERS.includes(target.type)||isElite(target.type);
 const nearby=root.projectiles.filter(p=>p.owner==='enemy'&&Math.hypot(p.x-w.playerX,p.y-w.playerY)<100).length;
 let best:SkillId|undefined,value=0;
 for(const id of ids){
  if(!getWorldSkillAvailability(w,id).available)continue;
  const defensive=['decoy','armor_shield','invisibility','cinder_fire_shield','argent_guard_stance','terra_reactive_rock_armor','riptide_wellspring'].includes(id);
  if(!defensive&&s.currentResource<stats.maxResource*.24&&threat>30)continue;
  let score=0;
  switch(id){
   case 'decoy':case 'armor_shield':case 'invisibility':case 'cinder_fire_shield':case 'argent_guard_stance':case 'terra_reactive_rock_armor':score=threat>35||nearby>5?8:0;break;
   case 'afterburner':score=threat>120?9:0;break;
   case 'predator_lock':case 'missile_swarm':score=durable&&line?(big?7:cluster>=3?6:3):0;break;
   case 'gravity_anchor':score=cluster>=3&&root.hive!.ccUntil<root.elapsed?8:0;break;
   case 'heavy_bomb':score=durable&&(target.stun>0||cluster>3||nearby>10)?9:0;break;
   case 'sweeping_cannon':score=line&&(cluster>2||big)?5:0;break;
   case 'electronic_interference':score=nearby>7&&root.hive!.ccUntil<root.elapsed?8:0;break;
   case 'focus_laser':score=line&&durable&&threat<30&&s.currentResource>stats.maxResource*.4?7:0;break;
   case 'escort_drone':score=s.currentResource>stats.maxResource*.65&&durable?5:0;break;
   case 'twin_reflection':score=line&&big?6:0;break;
   case 'orbit_reversal':score=nearby>=5||!!w.astra?.orbit?8:0;break;
   case 'stellar_lance':score=line&&durable&&threat<45?7:0;break;
   case 'starfall':score=cluster>=3||big?7:0;break;
   case 'cinder_fuel_barrage':score=line&&(cluster>1||big)?6:0;break;
   case 'cinder_heat_wave':score=range<150&&durable?7:0;break;
   case 'cinder_inferno_beam':score=line&&durable&&threat<40&&cinderStacks(w,target.id)>=3?8:0;break;
   case 'riptide_wellspring':score=s.currentHp<stats.maxHp*.65?8:0;break;
   case 'riptide_tidal_blades':score=range<125&&durable?7:0;break;
   case 'riptide_confluence':score=range<150&&cluster>=2&&root.hive!.ccUntil<root.elapsed?8:0;break;
   case 'riptide_waterform':score=range<150&&(big||cluster>3)?7:0;break;
   case 'argent_blade_cast':score=line&&durable?6:0;break;
   case 'argent_blade_recall':score=argentRecallOpportunity(w,target.x,target.y,target.radius)?9:0;break;
   case 'argent_heavenly_blade_array':score=range<180&&(big||cluster>3)?8:0;break;
   case 'sylva_acid_burst':case 'sylva_parasitic_seed':score=line&&durable?6:0;break;
   case 'sylva_symbiosis':{const active=sylvaState(w).symbiosis;score=active?(active.storedVitality>stats.maxHp*.12&&s.currentHp<stats.maxHp*.65?10:0):s.currentHp<stats.maxHp*.7&&durable?7:0;break;}
   case 'sylva_deathbloom':score=durable&&(sylvaState(w).targets.get(target.id)?.markUntil??0)>w.elapsed?8:0;break;
   case 'terra_seismic_cannon':score=line&&durable&&threat<50&&(terraHud(w)?.pressure??0)>(terraHud(w)?.cap??1)*.4?8:0;break;
   case 'terra_strata_clamp':score=range<200&&durable&&root.hive!.ccUntil<root.elapsed?7:0;break;
   case 'terra_geocore_overdrive':score=big&&durable&&threat<45?7:0;break;
  }
  if(isUltimate(id)&&!durable)score=0;
  if(score>value){value=score;best=id;}
 }
 return best;
}
export function thinkHiveAlly(a:HiveAlly,dt:number){
 const w=a.world,root=hiveRoot(w),h=root.hive!;
 if(root.elapsed>=a.thinkAt){
  a.thinkAt=root.elapsed+.17+root.random()*.09;
  const focus=root.enemies.find(e=>e.hp>0&&e.id===root.playerTargetId)??root.enemies.find(e=>e.hp>0&&(HIVE_MOTHERS.includes(e.type)||e.type==='boss'));
  const support=a.slot===0?root.enemies.find(e=>e.hp>0&&(e.type==='repair_wasp'||e.type==='forge_matron'||e.type==='signal_weaver')):undefined;
  const target=support??focus??root.enemies.filter(e=>e.hp>0).sort((x,y)=>Math.hypot(x.x-w.playerX,x.y-w.playerY)-Math.hypot(y.x-w.playerX,y.y-w.playerY))[0];
  a.target=target?.id;w.playerTargetId=target?.id;
  const close=['riptide','argent'].includes(w.aircraft.aircraftId),reach=250*.65;
  let desiredX=target?.x??R.left+R.width*(a.slot?.72:.28),desiredY=target?Math.min(R.bottom-40,target.y+(close?95:215)):R.bottom-90;
  const loot=equipmentState(root.aircraft).loot.find(l=>!l.collection);
  if(loot&&!equipmentRewardsLocked(w.aircraft)){
   const picker=h.allies.filter(b=>!b.respawn&&!equipmentRewardsLocked(b.world.aircraft)).sort((a,b)=>Math.hypot(a.world.playerX-loot.x,a.world.playerY-loot.y)-Math.hypot(b.world.playerX-loot.x,b.world.playerY-loot.y))[0];
   if(picker===a&&danger(w,loot.x,loot.y,a)<30&&Math.hypot(loot.x-w.playerX,loot.y-w.playerY)<140){desiredX=loot.x;desiredY=loot.y;}
  }
  let best=Infinity,bx=w.playerX,by=w.playerY;
  for(let i=-1;i<16;i++){
   const angle=i<0?Math.atan2(desiredY-w.playerY,desiredX-w.playerX):i*Math.PI/8;
   const length=i<0?Math.min(reach,Math.hypot(desiredX-w.playerX,desiredY-w.playerY)):reach;
   const x=Math.max(R.left+28,Math.min(R.right-28,w.playerX+Math.cos(angle)*length)),y=Math.max(R.top+30,Math.min(R.bottom-30,w.playerY+Math.sin(angle)*length));
   const risk=danger(w,x,y,a),cost=risk+Math.abs(x-desiredX)*.17+Math.abs(y-desiredY)*.1+Math.hypot(x-a.x,y-a.y)*.035;
   if(cost<best){best=cost;bx=x;by=y;}
  }
  a.x=bx;a.y=by;
  if(root.elapsed>=a.skillAt){const id=chooseHiveSkill(a,target,danger(w,w.playerX,w.playerY,a));if(id&&castWorldSkill(w,id).cast){a.skillAt=root.elapsed+.65;if(['gravity_anchor','electronic_interference','riptide_confluence','terra_strata_clamp'].includes(id))h.ccUntil=root.elapsed+1.3;}}
  if(a.seen.size>1600){const live=new Set(root.projectiles.map(p=>p.id));for(const id of a.seen.keys())if(!live.has(id))a.seen.delete(id);}
 }
 const dx=a.x-w.playerX,dy=a.y-w.playerY,d=Math.hypot(dx,dy),step=Math.min(d,250*dt);
 w.playerInputActive=true;
 if(d>.5)movePlayerByDelta(w,dx/d*step,dy/d*step);
}
function hazard(w:CombatWorld,e:EnemyEntity,kind:HiveHazard['kind'],x:number,y:number,endX:number,endY:number,radius:number,delay:number,damage:number,pattern=0){
 const h=w.hive!;if(h.hazards.length>=16)return;
 h.hazards.push({id:h.nextHazard++,enemyId:e.id,kind,x,y,endX,endY,radius,at:w.elapsed+delay,until:w.elapsed+delay+(kind==='lane'?.4:.15),damage,fired:false,pattern});
}
function fan(w:CombatWorld,e:EnemyEntity,h:HiveHooks,angle:number,count:number,spacing:number,speed:number,damage:number){
 for(let i=0;i<count;i++){const a=angle+(i-(count-1)/2)*spacing;h.projectile(w,{owner:'enemy',x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,rawDamage:damage,radius:3.2,sourceEnemyId:e.id,sourceEnemyType:e.type,hiveAmmo:e.type==='razor_glider'||e.type==='razor_marshal'?1:0,color:'#ffad38',lifetime:7});}
}
export function updateHiveEnemy(w:CombatWorld,e:EnemyEntity,dt:number,hooks:HiveHooks):boolean {
 if(!e.hive||!w.hive)return false;const h=e.hive,actors=hiveActors(w).filter(a=>a.aircraft.currentHp>0&&!a.destruction),target=actors[(h.attack+h.slot)%Math.max(1,actors.length)]??w;
 const mother=HIVE_MOTHERS.includes(e.type),boss=e.type==='boss',elite=isElite(e.type),stats=stageEnemyConfig(e.type,5),damage=stats.projectileDamage*e.damageScale;
 if(boss){const phase=Math.min(4,1+Math.floor((1-e.hp/e.maxHp)*4));if(phase!==h.phase){h.phase=phase;w.bossPhase=phase;hiveFx(w,2,e.x,e.y,220,1.1);}}
 h.coreOpen=h.exposedUntil>w.elapsed;
 const leader=w.enemies.find(n=>n.hp>0&&HIVE_MOTHERS.includes(n.type));
 let x=R.left+R.width/2+Math.sin(e.age*.27+e.phaseSeed)*(R.width*.32),y=R.top+65+(h.slot%4)*35;
 if(mother||boss){x=R.left+R.width/2+Math.sin(e.age*.22)*40;y=R.top+95;}
 else if(leader&&e.type==='aegis_beetle'){const guards=w.enemies.filter(n=>n.hp>0&&n.type==='aegis_beetle'),slot=guards.indexOf(e)-(guards.length-1)/2;const fire=w.projectiles.find(p=>p.owner==='player'&&Math.abs(p.x-leader.x)<leader.radius+40);x=Math.max(R.left+20,Math.min(R.right-20,(fire?.x??leader.x)+slot*30));y=leader.y+65+Math.abs(slot)*9;}
 else if(leader){x=leader.x+Math.cos(e.age*.3+h.slot)*100;y=leader.y+Math.sin(e.age*.3+h.slot)*50+(e.type==='repair_wasp'?-45:85);}
 if(h.dash){const oldX=e.x,oldY=e.y,t=Math.min(1,(w.elapsed-h.dash.start)/(h.dash.until-h.dash.start));e.x=h.dash.x+(h.dash.endX-h.dash.x)*t;e.y=h.dash.y+(h.dash.endY-h.dash.y)*t;for(const actor of actors)if(!h.dash.hits.has(actor)&&sweepAircraft(getEnemyHitbox(e),e.x-oldX,e.y-oldY,getPlayerHitbox(actor),hit).hit){h.dash.hits.add(actor);hooks.hit(actor,stats.collisionDamage*e.damageScale);}if(t===1)h.dash=undefined;}
 else{const d=Math.hypot(x-e.x,y-e.y),step=Math.min(d,stats.speed*hooks.movement(w,e)*dt);if(d>0){e.x+=(x-e.x)/d*step;e.y+=(y-e.y)/d*step;}}
 if((e.type==='repair_wasp'||e.type==='forge_matron')&&e.stun<=0&&(e.skillLockedUntil??0)<=w.elapsed){
  const repair=w.enemies.filter(n=>n!==e&&n.hp>0&&n.hp<n.maxHp&&Math.hypot(n.x-e.x,n.y-e.y)<190).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
  h.repairTarget=repair?.id;if(repair)repair.hp=Math.min(repair.maxHp,repair.hp+repair.maxHp*(elite?.009:.005)*dt);
 }else h.repairTarget=undefined;
 // Signal Weaver used to fire its ordinary fan and lane on one timer. Separate
 // clocks preserve independent ordinary-fire and skill frequencies.
 if(h.basicCooldown!==undefined){
  if(h.basicCooldown<=0&&(e.skillLockedUntil??0)<=w.elapsed){fan(w,e,hooks,Math.atan2(target.playerY-e.y,target.playerX-e.x),5,.2,105,damage*.35);h.basicCooldown=attackInterval(w,e,2.8+w.random()*.9,false);}
 }
 if(e.fireCooldown>0||h.dash||(e.skillLockedUntil??0)>w.elapsed)return true;
 const aim=Math.atan2(target.playerY-e.y,target.playerX-e.x);h.attack++;
 const interval=mother?7:boss?Math.max(1.5,3.4-h.phase*.35):elite?3.4:e.type==='repair_wasp'?4.5:2.8+w.random()*.9;
 e.fireCooldown=attackInterval(w,e,interval,normalSkill(e));
 if(mother||boss||elite){
  if(w.elapsed<w.hive.majorReady){e.fireCooldown=.4;return true;}
  w.hive.majorReady=w.elapsed+1.4;
 }
 switch(e.type){
  case 'razor_glider':case 'razor_marshal':{
   const tx=Math.max(R.left+25,Math.min(R.right-25,target.playerX+(h.attack%2?55:-55))),ty=Math.min(R.bottom-60,target.playerY);
   hazard(w,e,'dash',e.x,e.y,tx,ty,15,.95,damage,h.attack);break;
  }
  case 'siege_spitter':case 'bombard_prelate':case 'crucible_ark':{
   const count=e.type==='crucible_ark'?3:elite?3:1;
   for(let i=0;i<count;i++){const actor=actors[i%actors.length]??target;hazard(w,e,'blast',actor.playerX+(i-1)*26,actor.playerY,0,0,elite||mother?48:32,1.25+i*.35,damage*.65,i);}
   if(mother){h.exposedUntil=w.elapsed+3.5;h.coreOpen=true;for(let i=0;i<3;i++){const lx=R.left+R.width*(.2+i*.3);hazard(w,e,'lane',lx,R.top,lx,R.bottom,12,2+i*.4,damage*.45);}}break;
  }
  case 'signal_weaver':case 'disruptor_monarch':{
   const lx=target.playerX;hazard(w,e,'lane',lx,R.top,lx,R.bottom,elite?22:12,1.2,damage*.7,1);if(h.basicCooldown===undefined)fan(w,e,hooks,aim,5,.2,105,damage*.35);break;
  }
  case 'brood_ark':h.exposedUntil=w.elapsed+3;h.coreOpen=true;fan(w,e,hooks,aim,13,.12,85,damage*.22);
   for(let i=-1;i<=1;i++){const a=aim+i*.35,p=hooks.projectile(w,{owner:'enemy',x:e.x,y:e.y,vx:Math.cos(a)*90,vy:Math.sin(a)*90,rawDamage:damage*.35,radius:6,sourceEnemyId:e.id,lifetime:1.6});if(p){p.hiveSplitAt=w.elapsed+1.25;p.hiveAmmo=2;}}break;
  case 'forge_matron':
   if(h.support<2&&w.enemies.filter(n=>n.hp>0).length<30){const helper=hooks.spawn(w,h.support?'swarm_needler':'repair_wasp');if(helper){helper.x=e.x+(h.support?28:-28);helper.y=e.y+35;helper.xp=0;h.support++;}}
   fan(w,e,hooks,aim,7,.18,105,damage*.4);break;
  case 'aegis_beetle':case 'aegis_regent':fan(w,e,hooks,aim,h.shieldBroken?9:elite?7:3,.13,120,damage*(h.shieldBroken?.55:.4));break;
  case 'boss':{
   const phase=h.phase;
   if(phase===4){h.exposedUntil=w.elapsed+1.6;h.coreOpen=true;}
   fan(w,e,hooks,aim,9+phase*2,.15,95+phase*12,damage*.42);
   if(phase===2){for(const actor of actors)hazard(w,e,'blast',actor.playerX,actor.playerY,0,0,42,1.5,damage*.8);}
   else if(phase===3){for(let i=0;i<3;i++)hazard(w,e,'blast',R.left+R.width*(.2+i*.3),R.top+R.height*(.4+(h.attack%3)*.15),0,0,48,1.3+i*.35,damage*.7,i);}
   else{const lx=target.playerX;hazard(w,e,'lane',lx,R.top,lx,R.bottom,18,1.5,damage);}
   if(phase>=3)for(let i=0;i<12;i++)fan(w,e,hooks,i*Math.PI/6+e.age*.13,1,0,85,damage*.3);
   break;
  }
  default:fan(w,e,hooks,aim+(h.attack%2?.11:-.11),e.type==='swarm_needler'?5:3,.16,100,damage*.5);
 }
 return true;
}
export function updateHiveHazards(w:CombatWorld,dt:number,hooks:HiveHooks){
 const h=w.hive;if(!h)return;
 h.effects=h.effects.filter(e=>w.elapsed<e.at+e.duration);
 for(const p of [...w.projectiles])if(p.hiveSplitAt!==undefined&&w.elapsed>=p.hiveSplitAt){p.hiveSplitAt=undefined;p.lifetime=0;const a=Math.atan2(p.vy,p.vx);hiveFx(w,7,p.x,p.y,28,.3);for(let i=-2;i<=2;i++)hooks.projectile(w,{owner:'enemy',x:p.x,y:p.y,vx:Math.cos(a+i*.23)*145,vy:Math.sin(a+i*.23)*145,rawDamage:p.rawDamage*.5,radius:3,sourceEnemyId:p.sourceEnemyId,lifetime:5,hiveAmmo:1});}
 for(const z of h.hazards){if(z.fired||w.elapsed<z.at)continue;z.fired=true;
  const source=w.enemies.find(e=>e.id===z.enemyId&&e.hp>0);if(!source||source.stun>0||(source.skillLockedUntil??0)>w.elapsed)continue;
  if(z.kind==='dash'){source.hive!.dash={x:z.x,y:z.y,endX:z.endX,endY:z.endY,start:w.elapsed,until:w.elapsed+.65,hits:new Set()};fan(w,source,hooks,Math.PI/2,7,.27,90,z.damage*.3);continue;}
  hiveFx(w,z.kind==='pulse'?6:7,z.x,z.y,z.radius*2,.65);
  for(const actor of hiveActors(w))if(actor.aircraft.currentHp>0){const body=getPlayerHitbox(actor),touch=z.kind==='lane'?segmentVsAircraft(z.x,z.y,z.endX,z.endY,z.radius,body,hit).hit:circleVsAircraft(z.x,z.y,z.radius,body);if(touch)hooks.hit(actor,z.damage,z.pattern===1?.5:0);}
  if(z.kind==='blast')for(let i=0;i<6+z.pattern*2;i++){const angle=i*Math.PI*2/(6+z.pattern*2)+z.pattern*.2;hooks.projectile(w,{owner:'enemy',x:z.x,y:z.y,vx:Math.cos(angle)*105,vy:Math.sin(angle)*105,rawDamage:z.damage*.3,radius:3,sourceEnemyId:z.enemyId,lifetime:5});}
 }
 h.hazards=h.hazards.filter(z=>w.elapsed<z.until);
}
export function collectHiveLoot(w:CombatWorld,dt:number){
 if(!w.hive)return;const q=equipmentState(w.aircraft),actors=hiveActors(w);
 for(let i=q.loot.length-1;i>=0;i--){const l=q.loot[i];l.age+=dt;l.y=Math.min(R.bottom-18,l.y+12*dt);
  const picker=actors.find(a=>a.aircraft.currentHp>0&&!equipmentRewardsLocked(a.aircraft)&&Math.hypot(l.x-a.playerX,l.y-a.playerY)<=42);
  if(!picker)continue;
  q.loot.splice(i,1);for(const a of actors)if(!equipmentRewardsLocked(a.aircraft))grantEquipmentReward(a.aircraft,l.definitionId,'hive-shared-drop',l);
 }
}
