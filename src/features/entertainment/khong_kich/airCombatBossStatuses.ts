import { AIRCRAFT_CONFIGS, SKILL_CONFIGS, getCoreDefinition } from './airCombatConfig';
import { getSkillRuntimeValues } from './airCombatAircraft';
import { coreId, hasCore } from './airCombatCoreEffects';
import { CINDER_BURN } from './airCombatCinderConfig';
import { cinderState, cinderTargetHazards } from './airCombatCinderRuntime';
import { argentState } from './airCombatArgentRuntime';
import { riptideState, riptideSuppressed } from './airCombatRiptideRuntime';
import { sylvaState } from './airCombatSylvaRuntime';
import { terraState } from './airCombatTerraRuntime';
import { gravityAnchorValues } from './airCombatGravityAnchor';
import { circleVsAircraft, getEnemyHitbox } from './airCombatHitboxes';
import { activeEquipmentFamilies } from './airCombatEquipmentState';
import { EQUIPMENT_POWER as P } from './airCombatEquipmentBalance';
import { SKILL_CORE_VALUES as V } from './airCombatSkillCores';
import { statusDuration } from './airCombatStatusTiming';
import { canTargetEnemy } from './airCombatTargetability';
import { isHostileToPlayer, type CombatWorld, type EnemyEntity } from './airCombatRuntime';
import type { StatusPresentation } from './airCombatPresentation';
import type { SkillId, PassiveId } from './airCombatTypes';

const percent = (ratio:number) => `${Math.round(ratio*100)}%`;

/** Per-target snapshots only: never infer application from a learned skill, cast,
 * cooldown, visual event, or a different enemy. Runtime owns immunity and expiry. */
export function getBossStatusPresentations(world:CombatWorld):StatusPresentation[] {
 const actors=[world,...(world.hive?.allies.map(a=>a.world)??[])];
 const shared=new Set(['stun','missile-burn','burnArmorUntil','weakUntil','weakDebuffUntil','armorBrokenUntil','skillLockedUntil','gravity-armor']);
 const result=new Map<string,StatusPresentation>();
 for(const e of world.enemies.filter(e=>e.type==='boss'&&!e.aircraftTarget&&isHostileToPlayer(world,e)))for(const actor of actors){
  for(const status of bossStatuses(actor,e)){
   const key=status.id.slice(('boss:'+e.id+':').length);
   const id=shared.has(key)||key.startsWith('combat:')?status.id:status.id+':'+actor.aircraft.aircraftId;
   if(!result.has(id))result.set(id,{...status,id,source:status.source==='Trang bị'?AIRCRAFT_CONFIGS[actor.aircraft.aircraftId].name+' · Trang bị':status.source});
  }
 }
 return [...result.values()];
}
function bossStatuses(w:CombatWorld,e:EnemyEntity):StatusPresentation[] {
 const now=w.elapsed,s=w.aircraft,time=s.coreState.time,result:StatusPresentation[]=[];
 if(e.hp<=0)return result;
 const add=(id:string,name:string,description:string,icon:StatusPresentation['icon'],remaining:number,duration:number,stacks?:number,source=AIRCRAFT_CONFIGS[s.aircraftId].name)=>{
  if(!(remaining>0))return;
  const timed=Number.isFinite(remaining)&&Number.isFinite(duration)&&duration>0;
  result.push({id:`boss:${e.id}:${id}`,group:'debuff',name,description,icon,source,stacks:stacks??1,
   badgeText:stacks===undefined?undefined:stacks.toLocaleString('vi-VN',{maximumFractionDigits:1}),badgeKind:stacks===undefined?undefined:'stack',
   remaining,duration,priority:100,timer:timed?{phase:'active',remaining,total:Math.max(remaining,duration)}:{phase:'indefinite',remaining:Infinity,total:Infinity}});
 };
 const skill=(id:string,name:string,description:string,skillId:SkillId|PassiveId,remaining:number,duration:number,stacks?:number)=>add(id,name,description,{kind:'skill',id:skillId},remaining,duration,stacks);
 const generic=(key:string,name:string,description:string,icon:Extract<StatusPresentation['icon'],{kind:'status'}>['id'],remaining:number,duration:number)=>
  add(key,name,description,{kind:'status',id:icon},remaining,statusDuration(e,key,duration),undefined,'Trạng thái trên Boss');
 // Shared enemy fields are authoritative even when a skill has already ended.
 generic('stun','Choáng','Boss tạm ngừng hành động.','stun',e.stun,2);
 skill('missile-burn','Thiêu đốt','Sát thương thiêu đốt từ Mưa Tên Lửa.','missile_swarm',e.burn,statusDuration(e,'burn',5));
 generic('burnArmorUntil','Giáp bị nung chảy','Giảm 30% Giáp.','armor',(e.burnArmorUntil??0)-time,6);
 generic('weakUntil','Suy yếu Giáp','Giảm 8% Giáp.','armor',e.weakUntil-time,4);
 generic('weakDebuffUntil','Khai thác điểm yếu','Giảm 15% Giáp.','armor',(e.weakDebuffUntil??0)-time,5);
 generic('armorBrokenUntil','Vỡ Giáp','Giảm 30% Giáp do đòn đánh đã áp dụng.','armor',(e.armorBrokenUntil??0)-now,4);
 generic('skillLockedUntil','Khóa kỹ năng','Boss đang chịu khóa kỹ năng.','skill_lock',(e.skillLockedUntil??0)-now,2.2);

 const fire=cinderState(w),c=fire.targets.get(e.id);
 if(c?.entity===e){
  if(c.burn>0)skill('cinder-burn','Cháy','Sát thương Cháy theo số cộng dồn hiện tại.','cinder_thermal_round',c.until-now,CINDER_BURN.duration,c.burn);
  skill('cinder-blaze','Bùng Cháy','Sát thương Cháy nhận vào tăng 50%.','cinder_inferno_beam',c.blazeUntil-now,8);
  if(c.slow<1)skill('cinder-slow','Quầng Nhiệt · Làm chậm',`Giảm ${percent(1-c.slow)} tốc độ di chuyển.`, 'cinder_heat_wave',c.slowUntil-now,statusDuration(c,'slowUntil',3));
  // Cinder never applies its root to bosses; do not synthesize one from stacks.
  skill('astra-mark','Dấu Sao','Đòn kỹ năng trực tiếp kế tiếp kích hoạt Dấu Sao.','astra_stellar_mark',c.markUntil-now,4);
 }
 for(const hazard of cinderTargetHazards(w,e))skill(hazard.id,SKILL_CONFIGS[hazard.skill].name,'Boss đang trong vùng gây sát thương theo thời gian.',hazard.skill,hazard.remaining,hazard.duration);
 for(const spread of fire.spreads){const source=spread.sources.find(v=>v.id===e.id&&v.remaining>0);
  if(source)skill('cinder-spread:'+spread.id,'Cháy Lan','Boss là nguồn phát các xung Cháy Lan.','cinder_heat_wave',source.next+source.remaining-1-now,4);
 }
 const newestBurn=w.astra?.burns.filter(z=>z.until>now&&circleVsAircraft(z.x,z.y,z.radius,getEnemyHitbox(e))).at(-1);
 if(newestBurn)skill('astra-burn','Tinh Hỏa','Boss đang trong vùng Tinh Hỏa; vùng mới nhất quyết định sát thương.','starfall',newestBurn.until-now,4);

 const ranks=w.rankRuntime,lock=ranks?.lock,anchor=ranks?.anchor,interference=ranks?.interference.get(e.id);
 if(lock&&!lock.decoy&&lock.target===e.id&&canTargetEnemy(w,e,'hard_lock'))skill('predator-lock','Khóa Săn Mồi','Dấu khóa mục tiêu và số đòn đang tích lũy.','predator_lock',lock.until-now,lock.startedAt===undefined?getSkillRuntimeValues(s,'predator_lock').duration+lock.extended:lock.until-lock.startedAt,lock.stacks);
 if(interference&&(interference.movement<1||interference.firing<1||interference.projectile<1))skill('interference','Nhiễu Điện Tử',`Di chuyển -${percent(1-interference.movement)} · Tốc độ bắn -${percent(1-interference.firing)} · Tốc độ đạn -${percent(1-interference.projectile)}.`, 'electronic_interference',interference.until-now,3);
 if(anchor&&Math.hypot(e.x-anchor.x,e.y-anchor.y)<=gravityAnchorValues(anchor.rank).radius)skill('gravity-slow','Neo Trọng Lực · Làm chậm','Giảm 35% tốc độ di chuyển trong vùng.','gravity_anchor',anchor.until-now,s.activeEffectDurations?.gravity_anchor??5);
 const expansion=e.expansionMarks;
 if((expansion?.gravityArmor??0)>0)skill('gravity-armor','Neo Trọng Lực · Giảm Giáp',`Giảm ${percent(expansion!.gravityArmor)} Giáp.`, 'gravity_anchor',(expansion?.gravityArmorUntil??0)-now,1.5);
 const fx=w.skillCores.enemyEffects.get(e.id);
 skill('laser-armor','Laser · Giảm Giáp',`Giảm ${percent(V.laserArmorReduction)} Giáp.`, 'focus_laser',(fx?.armorUntil??0)-now,V.laserArmorDuration);
 skill('titan-weaken','Dư chấn · Suy yếu',`Giảm ${percent(V.weakenReduction)} sát thương gây ra.`, 'heavy_bomb',(fx?.weakenUntil??0)-now,V.weakenDuration);
 skill('titan-mark','Dấu Oanh Tạc',`Nhận thêm ${percent(V.markBonus)} sát thương trực tiếp từ Breaker.`, 'heavy_bomb',(fx?.markUntil??0)-now,V.markDuration);
 if(w.skillCores.syncTarget===e.id)skill('hawk-sync','Đồng Bộ Mục Tiêu',`Nhận thêm ${percent(V.syncBonus)} sát thương trực tiếp từ Phantom.`, 'escort_drone',w.skillCores.syncUntil-now,V.syncDuration);

 const earth=terraState(w).targets.get(e.id);
 if(earth?.entity===e){
  skill('terra-root','Kẹp Sơn · Trói','Boss bị giữ vị trí.','terra_strata_clamp',earth.rootUntil-now,statusDuration(earth,'rootUntil',1));
  // Terra stun is represented once by e.stun, the timer actually consumed by AI.
  skill('terra-suppress','Trấn Sơn','Giảm 20% sát thương gây ra.','terra_strata_clamp',earth.suppressUntil-now,statusDuration(earth,'suppressUntil',5));
  skill('terra-mark','Rạn Địa','Pháo Địa Chấn tiêu dấu khi trúng và hồi Máu cho Terra.','terra_strata_clamp',earth.markUntil-now,statusDuration(earth,'markUntil',3));
 }
 const metal=argentState(w),armor=metal.armorMarks.get(e.id),control=metal.controls.get(e.id);
 if(armor?.entity===e)skill('argent-mark','Kim Ấn','Giảm 15% Giáp; làm mới thời gian, không cộng dồn.','argent_heavenly_blade_array',armor.until-now,armor.duration);
 if(control?.entity===e){
  skill('argent-root','Ghim Chặt','Boss bị giữ vị trí.','argent_blade_recall',control.rootUntil-now,statusDuration(control,'rootUntil',.8));
  if(control.slow<1)skill('argent-slow','Ghim Chặt · Làm chậm',`Giảm ${percent(1-control.slow)} tốc độ di chuyển.`, 'argent_blade_recall',control.slowUntil-now,statusDuration(control,'slowUntil',1));
 }
 const water=riptideState(w),slow=water.slows.get(e.id);
 if(slow?.entity===e)for(const [id,value] of slow.sources)if(value.multiplier<1)skill('riptide-slow:'+id,SKILL_CONFIGS[id].name+' · Làm chậm',`Giảm ${percent(1-value.multiplier)} tốc độ di chuyển; dùng mức làm chậm mạnh nhất.`,id,value.until-now,value.duration);
 if(riptideSuppressed(w,e)&&water.confluence)skill('riptide-suppress','Áp Chế Thủy Lực','Gây ít hơn 25% sát thương lên Riptide khi còn trong vùng Hội Thủy.','riptide_confluence',water.confluence.until-now,water.confluence.until-water.confluence.at);
 const life=sylvaState(w),d=life.targets.get(e.id);
 if(d?.entity===e){
  if(d.flat>0)skill('sylva-flat','Đạn Axit · Ăn mòn',`Trừ ${d.flat} Giáp, không dưới 0.`, 'sylva_acid_rounds',d.flatUntil-now,statusDuration(d,'flatUntil',5),d.flat);
  skill('sylva-acid','Nổ Axit · Giảm Giáp','Giảm 25% Giáp.','sylva_acid_burst',d.acidUntil-now,statusDuration(d,'acidUntil',5));
  skill('sylva-mark','Dấu Ký Sinh',`Nhận thêm ${10+2*d.markRank}% sát thương từ Sylva.`, 'sylva_parasitic_seed',d.markUntil-now,statusDuration(d,'markUntil',5));
  skill('sylva-root','Ký Sinh · Trói','Boss bị giữ vị trí.','sylva_parasitic_seed',d.rootUntil-now,statusDuration(d,'rootUntil',1));
  if(d.slow<1)skill('sylva-slow','Độc Trệ',`Giảm ${percent(1-d.slow)} tốc độ di chuyển.`, 'sylva_acid_burst',d.slowUntil-now,statusDuration(d,'slowUntil',1));
  skill('sylva-suppress-move','Sinh Trưởng · Làm chậm','Giảm 50% tốc độ di chuyển.','sylva_deathbloom',d.suppressMoveUntil-now,statusDuration(d,'suppressUntil',3));
  skill('sylva-suppress-fire','Sinh Trưởng · Áp chế','Giảm 25% tốc độ bắn.','sylva_deathbloom',d.suppressUntil-now,statusDuration(d,'suppressUntil',3));
 }
 const bloom=life.bloom;
 if(bloom?.seeds.get(e.id)?.entity===e)skill('sylva-seed','Hạt Diệt Sinh','Ghi nhận Máu mất để tính sát thương khi hạt kết thúc.','sylva_deathbloom',bloom.until-now,bloom.until-bloom.at);
 for(const zone of life.zones){
  const inside=!zone.ended&&canTargetEnemy(w,e,'untargeted')&&Math.hypot(e.x-zone.x,e.y-zone.y)<=170,tail=zone.tails.get(e);
  if(inside)skill('sylva-zone:'+zone.id,'Vùng Axit','Boss đang nhận sát thương theo thời gian trong vùng Axit.','sylva_acid_burst',zone.until-now,zone.until-zone.at);
  else if(tail)skill('sylva-tail:'+zone.id,'Axit Bám Dính','Sát thương Axit tiếp tục sau khi rời vùng.','sylva_acid_burst',tail.until-now,2);
 }

 // Core and equipment marks are shared by every aircraft. Proc counters and
 // ready times are deliberately absent; only applied target effects qualify.
 const core=(row:number,key:string,remaining:number,duration:number)=>{const def=getCoreDefinition(coreId(row));add(key,def.name,def.description,{kind:'core',id:def.id},remaining,duration,undefined,'Lõi');};
 if(w.skillCores.bountyTarget===e.id)core(149,'bounty',w.skillCores.bountyUntil-now,5);
 const death=s.coreState.release?.mark;
 if(death?.target===e.id)core(221,'death-mark',death.until-now,4);
 for(const [key,row,duration] of [['preliminary',185,4],['skillPhase',207,5],['gunPhase',207,5],['criticalLock',194,4],['shieldBroken',180,4]] as const){
  if(key==='skillPhase'&&!hasCore(s,207))continue;
  core(row,key,(expansion?.[key]??0)-time,duration);
 }
 const marks=s.equipment?.marks[e.id],families=activeEquipmentFamilies(s);
 for(const [family,duration] of [[5,8],[7,4],[15,5],[24,2],[36,4]] as const){
  const mark=marks?.[family],def=families.get(`TH${String(family).padStart(2,'0')}`);
  if(!mark||!def||mark.until<=time||((family===15||family===36)&&mark.stacks<=0))continue;
  const scale=def.rarity==='legendary'?2:1;
  const description=family===5?'Dấu Nhiên Liệu: tích đủ 4 đòn thường để kích nổ.':family===7?`Nhận thêm ${percent(P[7].vulnerability*scale)} sát thương.`:family===15?`Giảm ${P[15].armor*scale*mark.stacks} Giáp. ${mark.stacks===4?'Đủ cộng dồn: tăng sát thương trực tiếp nhận vào.':''}`:family===24?`Giảm ${percent(P[24].slow*mark.stacks)} tốc độ di chuyển.`:`Chảy Máu: ${mark.stacks} cộng dồn.${mark.stacks===3?' Tăng sát thương trực tiếp nhận vào.':''}`;
  add('equipment:'+family,def.name,description,{kind:'equipment',id:def.id},mark.until-time,duration,[5,15,36].includes(family)?mark.stacks:undefined,'Trang bị');
 }
 const combatNames:Record<string,string>={corrosion:'Ăn mòn',hunterMark:'Dấu săn mồi',suppression:'Áp chế',targetLock:'Khóa radar'};
 for(const [key,mark] of Object.entries(e.combatMarks??{}))add('combat:'+key,combatNames[key]??key,'Dấu từ đòn đánh đang có hiệu lực trên Boss.',{kind:'status',id:'mark'},mark.until-now,statusDuration(mark,'until',4),mark.count,'Đòn đánh');
 return result;
}
