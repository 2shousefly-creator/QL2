import { argentState, argentMovement } from './airCombatArgentRuntime';
import { riptideState, riptideMovement, riptideSuppressed } from './airCombatRiptideRuntime';
import { gravityAnchorValues } from "./airCombatGravityAnchor";
import { resolveTooltipValues } from "./airCombatTooltipValues";
import { getRecoveryReceivedMultiplier } from "./airCombatRecovery";
import { resolveSkillCooldown } from "./airCombatStatResolvers";
import { skillRank, SKILL_RANKS, isUltimate, ultimateCastDisabled } from "./airCombatSkillRanks";
import { astraOrbitProtectionActive } from "./airCombatAstra";
import { equipmentStatuses } from "./airCombatEquipmentPresentation";
import type { EquipmentRewardId } from "./airCombatEquipmentState";
import { canSkillsCrit, getTempestJewelledCritDamageBonus } from "./airCombatEquipmentStats";
import { expansionStatuses } from "./airCombatExpansionStatus";
import { releaseTelemetry } from "./airCombatReleaseTelemetry";
import { expansionState } from "./airCombatExpansion";
import { BOUNTY_REWARDS, CORE_METRICS, CORE_METRIC_LABELS } from "./airCombatTelemetry";
import { FLAT_CORE_STATS } from "./airCombatCoreEffects";
import { SKILL_BASE_VALUES as B, SKILL_CORE_VALUES as V } from "./airCombatSkillCores";
import { getEffectiveAircraftStats, getSkillRuntimeValues, getCore208Contribution } from "./airCombatAircraft";
import { AIRCRAFT_CONFIGS, SKILL_CONFIGS, getCoreDefinition } from "./airCombatConfig";
import { coreId, coreStackLabel, hasCore, negativeStatusDuration } from "./airCombatCoreEffects";
import type { AircraftCombatState, CoreId, SkillId } from "./airCombatTypes";
import { crowdDamageBonus, isHostileToPlayer, type CombatWorld } from "./airCombatRuntime";

export function formatCooldownSeconds(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}s` : `${rounded.toFixed(1).replace(".", ",")}s`;
}

export function formatSkillCellCooldown(seconds:number):string {
  const safe=Math.max(0,seconds);
  if(safe>=1)return `${Math.max(1,Math.round(safe))}s`;
  return `${Math.max(.1,Math.round(safe*10)/10).toFixed(1).replace(".",",")}s`;
}

const amount = (value:number) => Math.round(value).toLocaleString("vi-VN");
const number = (value: number) => value.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
function hawkEyeDuration(state: AircraftCombatState) {
  const stats = getEffectiveAircraftStats(state);
  const netDrain = getSkillRuntimeValues(state, "escort_drone").upkeepPerSecond - stats.resourceRegen;
  const energy = Math.max(0, state.currentResource);
  const estimate = netDrain > 0 ? energy / netDrain : null;
  return {
    progress: stats.maxResource > 0 ? Math.max(0, Math.min(1, energy / stats.maxResource)) : 0,
    remaining: estimate !== null && Number.isFinite(estimate) ? estimate : null,
  };
}
function hawkEyeTimeLabel(remaining: number | null) {
  return remaining === null ? "Duy trì: Không giới hạn với mức hồi Điện hiện tại" : `Duy trì ước tính: ${number(remaining)}s`;
}
export function getSkillTooltipModel(state: AircraftCombatState, id: SkillId) {
 const config=SKILL_CONFIGS[id],v=getSkillRuntimeValues(state,id),rank=skillRank(state,id),rows=SKILL_RANKS[id];
 const free=hasCore(state,84)&&(state.coreState.skillCasts+1)%4===0;
 const stats=getEffectiveAircraftStats(state);
 const castMultiplier=state.coreState.deferredCooldowns[id]??(free?1.1:1);
 const cooldown=resolveSkillCooldown(v.cooldown,stats.skillHaste,castMultiplier);
 const resource=AIRCRAFT_CONFIGS[state.aircraftId].resourceKind==="mana"?"Mana":"Điện";
 const detailRows=[isUltimate(id)?"Kỹ Năng Tối Thượng":"Kỹ Năng Cơ Bản",
  `Yêu cầu Tài Nguyên: ${number(id==="escort_drone"?v.cost:free?0:v.cost)} ${resource}`,
  "Giá trị quy đổi theo chỉ số hiện tại, trước chí mạng, Giáp mục tiêu và các hệ số sát thương theo tình huống."];
 const coreRows:string[]=[];
 if(ultimateCastDisabled(state,id))coreRows.push("Tập Trung Chuyên Môn: khóa dùng chủ động Kỹ Năng Tối Thượng; cấp và nội tại vẫn giữ nguyên.");
 if(hasCore(state,97)&&!isUltimate(id))coreRows.push("Tập Trung Chuyên Môn: +20% Sát Thương Kỹ Năng; chi phí đã giảm 20%, hồi chiêu cơ bản đã giảm 25%.");
 if(canSkillsCrit(state))coreRows.push("Kỹ năng có thể chí mạng.");
 if(hasCore(state,190))coreRows.push("Nén Năng Lượng: +20% Sát Thương Kỹ Năng; chi phí đã gồm +10%.");
 if(expansionState(state).primarySkill===id)coreRows.push("Chủ Lực: +20% Sát Thương Kỹ Năng; chi phí và hồi chiêu cơ bản đã giảm 20%.");
 const rankRows=rows.map(row=>({...row,displayDescription:resolveTooltipValues(row.upgradeDescription,
  {stats,currentHp:state.currentHp,skillCost:v.cost})}));
 return {title:config.name,description:rank?effectiveSkillDescription(state,id):"Chưa học kỹ năng. Có thể giữ Điểm Kỹ Năng để đầu tư sau.",detailRows,coreRows,rank,rankRows,
  cooldown};
}
function effectiveSkillDescription(s:AircraftCombatState,id:SkillId):string {
 const rank=skillRank(s,id), stats=getEffectiveAircraftStats(s);
 return resolveTooltipValues(SKILL_RANKS[id][rank-1].description, {stats,currentHp:s.currentHp,
   skillCost:getSkillRuntimeValues(s,id).cost});
}

export function getActiveSkillDuration(world: CombatWorld, id: SkillId) {
  const state = world.aircraft;
  if (id === "escort_drone") {
    if (!state.droneActive) return null;
    if(state.dronePhase!=="active")return {remaining:state.droneTransitionRemaining??0,duration:state.dronePhase==="deploying"?.4:.38,progress:undefined,timeLabel:state.dronePhase==="deploying"?"Đang triển khai HawkEye":"Đang thu hồi · hồi chiêu sau docking"};
    const energy = hawkEyeDuration(state);
    // Time estimates are separate from visual progress for this resource-driven toggle.
    return { remaining: energy.remaining ?? 0, duration: energy.remaining ?? 0, progress: energy.progress,
      timeLabel: hawkEyeTimeLabel(energy.remaining) };
  }
  if(id==='argent_guard_stance'){
    const g=argentState(world).guard;if(!g)return null;
    const active=g.beatUntil>world.elapsed;
    return {remaining:active?g.beatUntil-world.elapsed:0,duration:.75,progress:active?(g.beatUntil-world.elapsed)/.75:0,timeLabel:active?'Nhịp đỡ 99%':'Thế chờ đòn · '+g.remaining+' lượt'};
  }
  if(id==='argent_blade_recall'&&argentState(world).recall)return {remaining:0,duration:0,progress:undefined,timeLabel:'Đang thu Phiến'};
  const v = getSkillRuntimeValues(state, id);
  let remaining = state.activeEffects[id] || 0;
  let duration = state.activeEffectDurations?.[id] ?? v.duration + (id === "focus_laser" ? v.charge : 0);
  if (id === "decoy") {
    // The last surviving mồi / pending volley is authoritative, including early destruction.
    duration = .45 + v.duration + (v.count - 1) * B.decoyVolleyInterval;
    remaining = Math.max(0, ...world.decoys.filter(d => !d.clone).map(d => d.remaining + (d.active ? 0 : Math.max(0, .45-d.flightAge))),
      world.decoyVolleys > 0 ? world.decoyVolleyCd + (world.decoyVolleys - 1) * B.decoyVolleyInterval + .45 + v.duration : 0);
  }
  if (id === "focus_laser") remaining = world.laserCharge + world.laserRemaining;
  if (id === "heavy_bomb") {
    const bomb=world.bigBang;
    if(bomb&&!bomb.resolved){remaining=Math.max(0,bomb.impactAt-world.elapsed);duration=3;}
  }
  if (id === "missile_swarm" && state.coreState.deferredCooldowns[id]!==undefined) {
    const salvo=world.skillCores.salvos.find(s=>s.pending>0);
    if(salvo)return {remaining:0,duration:0,progress:salvo.pending/salvo.total,timeLabel:"Đang phóng loạt tên lửa chính"};
  }
  if (id === "stellar_lance" && !world.astra?.charge && state.coreState.deferredCooldowns[id]!==undefined)
    return {remaining:0,duration:0,progress:undefined,timeLabel:"Đòn Thương chính đang bay"};
  return remaining > 0 && duration > 0 && Number.isFinite(duration)
    ? { remaining, duration: Math.max(duration, remaining), progress: Math.min(1, remaining / duration), timeLabel: undefined } : null;
}

export interface StatusPresentation {
  id: string;
  group: "buff" | "debuff";
  name: string;
  icon: { kind: "equipment" | "item"; id: EquipmentRewardId } | { kind: "skill"; id: SkillId } | { kind: "core"; id: CoreId } | { kind: "status"; id: "acid" | "burn" | "stun" | "armor" | "shield" | "skill_lock" | "resource_jam" | "regen_off" | "mark" | "radar" };
  description: string;
  source: string;
  stacks: number;
  /** Explicit mechanic semantics, independent of whether the current value is 1. */
  badgeText?: string;
  badgeKind?: "stack" | "progress" | "charge" | "percent" | "bonus" | "shield";
  remaining: number;
  duration: number;
  progress?: number;
  timeLabel?: string;
  priority: number;
  timerKind?: "active" | "cooldown";
  showNumericTimer?: boolean;
  rewardMessage?: string;
}

const TIMED_STATUSES = [
  { key: "tacticalRate", row: 71, duration: 6 },
  { key: "reactor", row: 78, duration: 6 },
  { key: "decoyCounter", row: 21, duration: 5 },
  { key: "shieldArmor", row: 30, duration: 6 },
  { key: "hawkRage", row: 44, duration: 3 },
  { key: "whiteHole", row: 155, duration: 5 },
] as const;

// Read canonical runtime timers only. Core 106 deliberately has no entry.
const CORE_COOLDOWN_PRESENTATIONS: readonly {row:number;timer:string;duration:number;shield?:string;active?:string;activeDuration?:number;charge?:string}[] = [
  {row:61,timer:"reactiveArmorCd",duration:10,active:"reactiveArmor",activeDuration:5},
  {row:76,timer:"reactiveShieldCd",duration:10,shield:"reactive"},
  {row:81,timer:"skillShieldCd",duration:10,shield:"skill"},
  {row:83,timer:"counterCd",duration:15,active:"counterActive",activeDuration:5},
  {row:149,timer:"bountyCooldown",duration:20,active:"bountyMark",activeDuration:5},
  {row:99,timer:"reserveShieldCd",duration:15,shield:"reserve"},
  {row:200,timer:"recycleShieldCd",duration:6,shield:"recycled"},
];
const seconds = (value:number) => `${Math.max(0,value).toFixed(1).replace(".",",")}s`;
function coreCooldownStatuses(world:CombatWorld):StatusPresentation[] {
  const s=world.aircraft,c=s.coreState,result:StatusPresentation[]=[];
  const add=(row:number,detail:string,values:Partial<StatusPresentation>)=>{
    const core=getCoreDefinition(coreId(row));
    result.push({id:core.id,group:"buff",name:core.name,icon:{kind:"core",id:core.id},
      description:`${core.description} ${detail}`,source:"Lõi",stacks:1,remaining:Infinity,duration:Infinity,priority:55,...values});
  };
  for(const entry of CORE_COOLDOWN_PRESENTATIONS){
    if(!hasCore(s,entry.row))continue;
    const cooldown=Math.max(0,(c.timers[entry.timer]??0)-c.time);
    const active=entry.active?Math.max(0,(c.timers[entry.active]??0)-c.time):0;
    const shield=entry.shield?c.shields[entry.shield]:undefined;
    const shieldActive=Boolean(shield&&shield.amount>0&&shield.until>c.time);
    const charges=entry.charge?(c.stacks[entry.charge]??0):0;
    if(!cooldown&&!active&&!shieldActive&&!charges)continue;
    const label=active?`Đang hoạt động: ${seconds(active)}`:shieldActive?"Khiên đang hoạt động (lượng khiên ở biểu tượng Lá chắn)":charges?`Còn ${charges} phát bắn cường hóa`:"";
    const recovery=active||shieldActive?"Hồi nội tại bắt đầu sau hiệu ứng":cooldown?`Hồi nội tại: ${seconds(cooldown)}`:"Nội tại đã sẵn sàng";
    add(entry.row,`${label}${label?". ":""}${recovery}.`,{
      remaining:active||(shieldActive?shield!.until-c.time:cooldown)||Infinity,duration:active?(entry.activeDuration??active):shieldActive?(shield!.duration??4):entry.duration,
      timerKind:active||shieldActive?"active":cooldown?"cooldown":undefined,showNumericTimer:Boolean(active||shieldActive||cooldown),
      badgeText:charges?String(charges):undefined,badgeKind:charges?"charge":undefined,
      timeLabel:active?label:recovery,priority:active||shieldActive||charges?80:55,
    });
  }
  if(hasCore(s,109)){
    const left=Math.max(0,(c.timers["wing:left_wing"]??0)-c.time),right=Math.max(0,(c.timers["wing:right_wing"]??0)-c.time);
    const pending=[left,right].filter(value=>value>0),remaining=pending.length?Math.min(...pending):Infinity;
    add(109,`Cánh trái: ${left?seconds(left):"Sẵn sàng"}. Cánh phải: ${right?seconds(right):"Sẵn sàng"}.`,{
      badgeText:`${2-pending.length}/2`,badgeKind:"charge",remaining,duration:8,
      timerKind:pending.length?"cooldown":undefined,showNumericTimer:Boolean(pending.length),
      timeLabel:pending.length?`Cánh hồi gần nhất: ${seconds(remaining)}`:"Hai cánh sẵn sàng",priority:pending.length?55:45,
    });
  }
  if(hasCore(s,113)){
    const cooldown=Math.max(0,(c.timers.futureDebt??0)-c.time),pending=Boolean(c.stacks.borrowPending);
    const label=pending?"Chờ kỹ năng kết thúc để trả nợ":cooldown?`Hồi nội tại: ${seconds(cooldown)}`:"Sẵn sàng · có thể vay kỹ năng đang hồi";
    add(113,label,{remaining:!pending&&cooldown?cooldown:Infinity,duration:18,
      showNumericTimer:!pending&&cooldown>0,timerKind:!pending&&cooldown?"cooldown":undefined,
      timeLabel:label,priority:pending?80:cooldown?55:45});
  }
  if(hasCore(s,120)){
    const t=world.tactical,active=Boolean(t?.hackMode&&t.hackEnd>world.elapsed);
    const boss=t?.hackMode==="boss_stun",cooldown=Math.max(0,(c.timers.controlOverride??0)-c.time);
    const remaining=active?t!.hackEnd-world.elapsed:cooldown||Infinity;
    const count=(t?.hackTargets??[]).filter(id=>world.enemies.some(e=>e.id===id&&e.hp>0)).length;
    const label=active?`${boss?"Boss đang bị choáng":"Đang chiếm quyền"}: ${seconds(remaining)}`:cooldown?`Hồi chiêu: ${seconds(cooldown)}`:"Sẵn sàng";
    add(120,`${label}. Khi đợt đã xuất hiện hết địch và chỉ còn mục tiêu bị hack, hiệu ứng kết thúc sớm để tiếp tục dọn đợt.`,{
      remaining,duration:active?(boss?2:t?.hackMode==="elite"?9:12):13,timerKind:active?"active":cooldown?"cooldown":undefined,
      showNumericTimer:active||cooldown>0,badgeText:active&&!boss?`×${count}`:undefined,badgeKind:active&&!boss?"charge":undefined,
      timeLabel:label,priority:active?85:cooldown?70:45,
    });
  }
  return result;
}

export function getStatusPresentations(world: CombatWorld): StatusPresentation[] {
  const s = world.aircraft, c = s.coreState, result: StatusPresentation[] = [];
  const argent=argentState(world),guard=argent.guard;
  if(guard)result.push({id:'argent:guard',group:'buff',name:guard.beatUntil>world.elapsed?'Nhịp đỡ 99%':'Thế Đỡ · Chờ đòn',description:'Đòn hợp lệ mở một nhịp 0,75 giây; không giảm damage liên tục toàn bộ thế. Còn '+guard.remaining+' lượt. Không đỡ DoT/sát thương chuẩn và không miễn khống chế.',icon:{kind:'skill',id:'argent_guard_stance'},source:'Thế Đỡ',stacks:guard.remaining,badgeText:guard.remaining+' lượt',remaining:guard.until-world.elapsed,duration:8,priority:110});
  if(argent.temper>0&&argent.temperUntil>world.elapsed)result.push({id:'argent:temper',group:'buff',name:'Tôi Kim',description:'S3 hợp lệ kế tiếp tiêu toàn bộ tầng; Phiến đầu trúng mỗi mục tiêu thêm 40% Hỏa Lực mỗi tầng, tối đa 120%.',icon:{kind:'skill',id:'argent_guard_stance'},source:'Thế Đỡ',stacks:argent.temper,badgeText:argent.temper+'/3',remaining:argent.temperUntil-world.elapsed,duration:6,priority:109});
  const water=riptideState(world).waterform;
  if(water)result.push({id:'riptide:charge',group:'buff',name:'Thủy áp',description:'Nhịp gây sát thương hợp lệ tích sức mạnh nổ; trần hồi Máu 35% Máu tối đa mỗi cast.',icon:{kind:'skill',id:'riptide_waterform'},source:'Thủy Thể',stacks:water.charge,badgeText:water.charge+'/16',remaining:water.until-world.elapsed,duration:8,priority:110});
  const rival=world.duel?.opponent??world.mirage?.mirror?.context.world??world.duelOpponent?.context.world;
  const target=rival?.enemies.find(e=>e.aircraftTarget?.world===world);
  if(rival&&target){
   const metal=argentState(rival).controls.get(target.id);
   if(metal&&argentMovement(rival,target)<1){const root=metal.rootUntil>rival.elapsed;result.push({id:'argent:control',group:'debuff',name:root?'Ghim Chặt':'Khóa Trận',description:root?'Tạm giữ vị trí; vẫn có thể bắn và dùng kỹ năng theo luật chung.':'Giảm '+Math.round((1-metal.slow)*100)+'% tốc độ di chuyển.',icon:{kind:'skill',id:root?'argent_blade_recall':'argent_heavenly_blade_array'},source:'Argent đối phương',stacks:1,remaining:(root?metal.rootUntil:metal.slowUntil)-rival.elapsed,duration:root?.8:2,priority:110});}

   const slow=riptideState(rival).slows.get(target.id);
   if(slow&&riptideMovement(rival,target)<1)for(const [id,value] of slow.sources)if(value.until>rival.elapsed)result.push({id:'riptide:slow:'+id,group:'debuff',name:'Dòng nước làm chậm',description:'Giảm '+Math.round((1-value.multiplier)*100)+'% tốc độ di chuyển; áp dụng slow mạnh nhất, không cộng dồn.',icon:{kind:'skill',id},source:'Riptide đối phương',stacks:1,remaining:value.until-rival.elapsed,duration:2,priority:100});
   if(riptideSuppressed(rival,target))result.push({id:'riptide:pressure',group:'debuff',name:'Áp Chế Thủy Lực',description:'Gây ít hơn 25% sát thương lên Riptide sở hữu Hội Thủy khi còn trong bán kính 170.',icon:{kind:'skill',id:'riptide_confluence'},source:'Riptide đối phương',stacks:1,remaining:riptideState(rival).confluence!.until-rival.elapsed,duration:2.3,priority:100});
  }
  result.push(...coreCooldownStatuses(world), ...skillCoreStatuses(world), ...expansionStatuses(world), ...equipmentStatuses(world));
  if (world.duel) {
    const addDuelStatus = (id: string, name: string, description: string, icon: StatusPresentation["icon"], remaining = Infinity, group: "buff" | "debuff" = "debuff") => {
      result.push({ id, name, description, icon, group, source: "SOLO", stacks: 1, remaining, duration: Number.isFinite(remaining) ? Math.max(3, remaining) : Infinity, priority: 115 });
    };
    if (world.duel.multiplier > 1) addDuelStatus("duel:damage", world.duel.multiplier >= 2 ? "TỬ CHIẾN" : "CUỒNG CHIẾN", `Sát thương hai bên tăng ${Math.round((world.duel.multiplier - 1) * 100)}%.`, { kind: "status", id: "mark" }, Infinity, "buff");
    if (s.duel?.healingBlocked) addDuelStatus("duel:no-heal", "SUDDEN DEATH", "Không thể hồi Máu trong hiệp phụ.", { kind: "status", id: "regen_off" });
    const opponent = world.duel.opponent;
    const target = opponent?.enemies.find(e => e.aircraftTarget?.world === world);
    if (opponent && target) {
      const interference = opponent.rankRuntime?.interference.get(target.id);
      if (interference && interference.until > opponent.elapsed) addDuelStatus("duel:interference", "Nhiễu Điện Tử", `Di chuyển -${Math.round((1 - interference.movement) * 100)}% · Tốc độ bắn -${Math.round((1 - interference.firing) * 100)}%.`, { kind: "skill", id: "electronic_interference" }, interference.until - opponent.elapsed);
      if (target.burn > 0) addDuelStatus("duel:burn", "Thiêu đốt", "Đang nhận sát thương thiêu đốt từ đối thủ.", { kind: "status", id: "burn" }, target.burn);
      const anchor = opponent.rankRuntime?.anchor;
      if (anchor && Math.hypot(target.x - anchor.x, target.y - anchor.y) <= gravityAnchorValues(anchor.rank).radius) addDuelStatus("duel:anchor", "Neo Trọng Lực", "Giảm tốc độ di chuyển và bị hút về tâm vùng ảnh hưởng.", { kind: "skill", id: "gravity_anchor" }, Math.max(0, anchor.until - opponent.elapsed));
      const laserArmor = opponent.skillCores.enemyEffects.get(target.id)?.armorUntil ?? 0;
      if (laserArmor > opponent.elapsed) addDuelStatus("duel:laser-armor", "Giáp bị suy yếu", "Giảm Giáp do Focus Laser của đối thủ.", { kind: "status", id: "armor" }, laserArmor - opponent.elapsed);
    }
  }
  if(hasCore(s,208)){
    const core=getCoreDefinition("core_208");
    result.push({id:core.id,group:"buff",name:core.name,icon:{kind:"core",id:core.id},description:`${core.description} ${core208LiveLabel(s)}`,source:"Lõi",stacks:1,remaining:Infinity,duration:Infinity,priority:45});
  }
  const maxHp = getEffectiveAircraftStats(s).maxHp;
  for (const id of AIRCRAFT_CONFIGS[s.aircraftId].skillIds) {
    const timer = getActiveSkillDuration(world, id);
    if (timer) {
      const model = getSkillTooltipModel(s, id);
      result.push({ id: `skill:${id}`, group: "buff", name: model.title, icon: { kind: "skill", id },
        description: [model.description, ...model.detailRows.slice(1), ...model.coreRows].join(" "), source: "Kỹ năng", stacks: 1,
        remaining: timer.remaining, duration: timer.duration, progress: timer.progress, timeLabel: timer.timeLabel, priority: 100 });
    }
  }
  for (const entry of TIMED_STATUSES) {
    const remaining = (c.timers[entry.key] || 0) - c.time;
    if (remaining <= 0) continue;
    const core = getCoreDefinition(coreId(entry.row));
    const skill=core.skillId,model=skill?getSkillTooltipModel(s,skill):undefined;
    result.push({ id: entry.key, group: "buff", name: model?.title??core.name, icon: skill?{kind:"skill",id:skill}:{ kind: "core", id: core.id }, description:model?.description??core.description,
      source: skill?"Kỹ năng":"Lõi", stacks: 1, remaining, duration: entry.duration, priority: 80 });
  }
  for(const row of [107,114,116,118,121])if(hasCore(s,row)){
    const core=getCoreDefinition(coreId(row)),remaining=[114,116].includes(row)?(c.timers.sameTarget??0)-c.time:Infinity;
    if([114,116].includes(row)&&remaining<=0)continue;
    const detail=row===121?`Phản Vật Chất: ${Math.round((c.stacks.antimatter??0)*100)}% Hỏa Lực / 350% Hỏa Lực`:row===107?`Graze: ${c.stacks.graze??0}/5`:[114,116].includes(row)?coreStackLabel(s,core.id)??core.description:core.description;
    let badgeText: string | undefined, badgeKind: StatusPresentation["badgeKind"];
    if (row === 107) { badgeText = `${c.stacks.graze ?? 0}/5`; badgeKind = "progress"; }
    if ([114,116].includes(row)) { badgeText = `${Math.min(4,Math.floor((c.stacks.sameTargetHits??0)/5))}/4`; badgeKind = "charge"; }
    if (row === 118) { badgeText = `+${Math.round(crowdDamageBonus(world) * 100)}%`; badgeKind = "bonus"; }
    if (row === 121) { badgeText = `${Math.round((c.stacks.antimatter ?? 0) * 100)}%`; badgeKind = "percent"; }
    result.push({id:core.id,group:"buff",name:core.name,icon:{kind:"core",id:core.id},
      description:row===118?`${core.description} Hiện tại: +${number(crowdDamageBonus(world) * 100)}% mọi sát thương.`:detail===core.description?detail:`${core.description} ${detail}`,
      source:"Lõi",stacks:1,badgeText,badgeKind,remaining,duration:[114,116].includes(row)?3:Infinity,priority:[114,116].includes(row)?80:45});
  }
  for (const row of [112]) if (hasCore(s, row)) {
    const live = (world.tactical?.grids ?? []).filter(g => g.until > world.elapsed &&
        world.enemies.some(e => e.id === g.a && isHostileToPlayer(world, e)) &&
        world.enemies.some(e => e.id === g.b && isHostileToPlayer(world, e)));
    if (!live.length) continue;
    const core = getCoreDefinition(coreId(row));
    result.push({ id: core.id, group: "buff", name: core.name, icon: { kind: "core", id: core.id },
      description: `${core.description} Đang tồn tại: ${live.length}.`, source: "Lõi", stacks: live.length,
      badgeText: `×${live.length}`, badgeKind: "stack", remaining: Math.min(...live.map(v => v.until)) - world.elapsed,
      duration: 2.5, priority: 80 });
  }
  const conditional = [
    { row: 49, on: c.time - c.lastMove >= 2 },
    { row: 60, on: c.time - c.lastDamage >= 4 },
    { row: 62, on: s.status.regenDisabledUntil<=c.time && s.currentHp < maxHp * .2 },
    { row: 63, on: s.currentHp < maxHp * .35 },
    { row: 75, on: (c.stacks.slaying || 0) > 0, stacks: c.stacks.slaying },
    { row: 82, on: c.time - c.lastDamage >= 4 },
    { row: 92, on: s.status.regenDisabledUntil<=c.time && c.time - c.lastDamage >= 5 },
    { row: 100, on: true },
  ];
  for (const entry of conditional) if (entry.on && hasCore(s, entry.row)) {
    const core = getCoreDefinition(coreId(entry.row));
    result.push({ id: core.id, group: "buff", name: core.name, icon: { kind: "core", id: core.id },
      description: [core.description, coreStackLabel(s, core.id)].filter(Boolean).join(" "),
      source: "Lõi · hiệu ứng có điều kiện", stacks: entry.stacks || 1,
      badgeText: entry.row === 75 ? `×${entry.stacks}` : entry.row===82?"+1":undefined,
      badgeKind: entry.row === 75 ? "stack" : entry.row===82?"bonus":undefined,
      remaining: Infinity, duration: Infinity, priority: 80 });
  }
  if (hasCore(s, 66) && c.time - c.lastKill <= 3 && (c.stacks.combo || 0) > 0) {
    const core = getCoreDefinition(coreId(66));
    result.push({ id: "combo", group: "buff", name: core.name, icon: { kind: "core", id: core.id }, description: core.description,
      source: "Lõi", stacks: c.stacks.combo, badgeText: `×${c.stacks.combo}`, badgeKind: "stack",
      remaining: 3 - (c.time - c.lastKill), duration: 3, priority: 80 });
  }
  const overheal=c.shields.overheal;
  if(hasCore(s,104) && overheal && overheal.amount>0 && overheal.until>c.time){
    const core=getCoreDefinition(coreId(104));
    result.push({id:core.id,group:"buff",name:core.name,icon:{kind:"core",id:core.id},
      description:`${core.description} Khiên hiện tại: ${amount(overheal.amount)} / ${amount(maxHp*.15)}`,
      source:"Lõi",stacks:1,badgeText:String(Math.round(overheal.amount)),badgeKind:"shield",remaining:overheal.until-c.time,duration:6,timerKind:"active",showNumericTimer:true,priority:105});
  }
  const shields = Object.entries(c.shields).filter(([key])=>key!=="overheal").filter(([, v]) => v.amount > 0 && v.until > c.time);
  if (shields.length) {
    const first = shields.reduce((a, b) => a[1].until < b[1].until ? a : b);
    result.push({ id: "shield", group: "buff", name: "Lá chắn", icon: { kind: "status", id: "shield" },
      description: `Lá chắn còn ${Math.round(shields.reduce((n, [, v]) => n + v.amount, 0))} Máu hấp thụ.${hasCore(s,200) ? ` Tái Chế Lá Chắn: dung lượng +50%; các lớp hiện tại đã hấp thụ ${amount(shields.reduce((n,[,v])=>n+(v.absorbed??0),0))} sát thương. Khi từng lớp kết thúc, phát nổ bằng 160% lượng lớp đó đã hấp thụ trong bán kính 120px.` : ""}`, source: "Lõi",
      stacks: 1, remaining: first[1].until - c.time, duration: first[1].duration ?? (first[0] === "reserve" ? 4 : 3), priority: 95 });
  }
  const acid = (c.timers.acidArmor || 0) - c.time;
  if (acid > 0) result.push({ id: "acidArmor", group: "debuff", name: "Ăn mòn", icon: { kind: "status", id: "acid" },
    description: "Giảm 30% Giáp của chiến đấu cơ.", source: "Địch · vùng axit", stacks: 1, remaining: acid,
    duration: negativeStatusDuration(s, 1.1), priority: 110 });
  // Aggregate the same status across live targets; show the earliest expiry, never sum timers.
  const enemyStates = [
    { id: "burn" as const, name: "Địch bị thiêu đốt", description: "60% Hỏa lực/s trong 4s; trúng mới làm mới thời gian.", duration: 4, read: (e: CombatWorld["enemies"][number]) => e.burn },
    { id: "armor" as const, name: "Địch bị suy yếu", description: "Giảm 8% Giáp của địch.", duration: 4, read: (e: CombatWorld["enemies"][number]) => e.weakUntil - c.time },
    { id: "armor" as const, name: "Giáp địch bị nung chảy", description: "Giảm 20% Giáp trong 5s; trúng mới làm mới thời gian.", duration: 5, read: (e: CombatWorld["enemies"][number]) => e.burnArmorUntil - c.time },
    { id: "armor" as const, name: "Điểm yếu bị khai thác", description: "Giảm 15% Giáp trong 5s.", duration: 5, read: (e: CombatWorld["enemies"][number]) => e.weakDebuffUntil - c.time },
    { id: "stun" as const, name: "Địch bị choáng", description: "Tạm ngừng hành động của địch.", duration: 4, read: (e: CombatWorld["enemies"][number]) => e.stun },
  ];
  for (const entry of enemyStates) {
    const timers = world.enemies.filter(e => e.hp > 0).map(entry.read).filter(t => t > 0);
    if (timers.length) result.push({ id: `enemy:${entry.id}:${entry.name}`, group: "debuff", name: entry.name, icon: { kind: "status", id: entry.id },
      description: `${entry.description} Số địch đang chịu hiệu ứng: ${timers.length}.`, source: "Hiệu ứng trên địch",
      stacks: timers.length, badgeText: `×${timers.length}`, badgeKind: "stack", remaining: Math.min(...timers), duration: entry.duration, priority: 50 });
  }
  const status=s.status;
  const timed = [
    ["stunnedUntil","Choáng","stun",hasCore(s,203)?"Không thể di chuyển; Nhiễu Chủ Động vẫn cho bắn thường và dùng kỹ năng.":"Không thể di chuyển, dùng kỹ năng hoặc bắn thường."],
    ["skillLockedUntil","Khóa kỹ năng","skill_lock","Tạm khóa kỹ năng; vẫn di chuyển và bắn thường."],
    ["resourceJammedUntil","Nhiễu tài nguyên","resource_jam","Giảm hồi tài nguyên; giữ nguyên tài nguyên đang có."],
    ["armorBrokenUntil","Vỡ giáp","armor","-35% Giáp."],
    ["regenDisabledUntil","Ngừng tái tạo","regen_off","Hồi HP theo thời gian bị vô hiệu."],
  ] as const;
  if(status.healingReceivedUntil>c.time) result.push({id:status.healingReceivedMultiplier===0?"healing_block":"healing_reduction",group:"debuff",name:status.healingReceivedMultiplier===0?"HỒI MÁU BỊ CHẶN":"HỒI MÁU -60%",icon:{kind:"status",id:"regen_off"},description:"Mưa Axit giảm mọi hồi máu nhận vào, kể cả lượng chuyển thành khiên dư.",source:"Tempest Crown · Mưa Axit",stacks:1,remaining:status.healingReceivedUntil-c.time,duration:status.durations.healingReceivedUntil??4,priority:115});
  for(const [key,name,icon,description] of timed) if(status[key]>c.time) result.push({id:key,group:"debuff",name,icon:{kind:"status",id:icon},description,source:"Đòn địch",stacks:1,remaining:status[key]-c.time,duration:status.durations[key]??4,priority:110});
  const markNames={hunterMark:"Dấu săn mồi",suppression:"Áp chế",corrosion:"Ăn mòn",targetLock:"Khóa radar",hunted:"Bị truy sát"};
  // All five player marks accumulate hits via addStatusMark. Trigger/reset at a
  // threshold (including Hunted at 2) is not a hard single-instance status.
  for(const [key,mark] of Object.entries(status.marks)) if(mark && mark.until>c.time) result.push({id:key,group:"debuff",name:markNames[key as keyof typeof markNames],icon:{kind:"status",id:key==="corrosion"?"acid":key==="targetLock"?"radar":"mark"},description:`Dấu hiện tại: ${mark.count}. Tiếp tục trúng đòn có thể kích hoạt đòn trừng phạt.`,source:"Đòn địch",stacks:mark.count,badgeText:`×${mark.count}`,badgeKind:"stack",remaining:mark.until-c.time,duration:mark.window,priority:100});
  return result.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
}

function skillCoreStatuses(world:CombatWorld):StatusPresentation[] {
  const s=world.aircraft,c=s.coreState,r=world.skillCores,result:StatusPresentation[]=[];
  const add=(row:number,values:Partial<StatusPresentation>)=>{
    const core=getCoreDefinition(coreId(row));
    const id=core.skillId!;const model=getSkillTooltipModel(s,id);
    result.push({id:`skill-rank:${row}`,group:"buff",name:model.title,icon:{kind:"skill",id},description:model.description,source:"Kỹ năng",
      stacks:1,remaining:Infinity,duration:Infinity,priority:85,showNumericTimer:false,...values});
  };
  if(astraOrbitProtectionActive(world))add(153,{badgeText:"−35%",badgeKind:"percent",timeLabel:world.astra?.orbit?"Bảo hộ · bắt giữ Tinh Đạn":"Bảo hộ · hội tụ và bắn trả"});
  const activeDecoys=world.decoys.some(d=>!d.clone&&d.active&&d.remaining>0);
  const cover=(c.timers.thermalCover||0)-c.time;
  if((skillRank(s, "decoy") >= 4)&&(activeDecoys||cover>0))add(124,{remaining:activeDecoys?Infinity:cover,duration:V.thermalTail,badgeText:`−${V.thermalReduction*100}%`,badgeKind:"percent",showNumericTimer:!activeDecoys,timeLabel:activeDecoys?"Duy trì bởi mồi đang hoạt động":undefined});
  if((skillRank(s, "decoy") >= 3))for(const [id,cast] of r.decoyCasts)add(122,{id:`core_122:${id}`,badgeText:`${number(cast.restored/getEffectiveAircraftStats(s).maxResource*100)}%`,badgeKind:"progress",progress:cast.restored/(getEffectiveAircraftStats(s).maxResource*V.decoyRefundCap),timeLabel:`Hồi Mana / giới hạn ${V.decoyRefundCap*100}% mỗi lần dùng`});
  if((skillRank(s, "armor_shield") >= 4)&&(s.activeEffects.armor_shield||0)>0)add(132,{remaining:s.activeEffects.armor_shield!,duration:getSkillRuntimeValues(s,"armor_shield").duration,
    badgeText:`${number((c.stacks.shieldRefund||0)/getEffectiveAircraftStats(s).maxResource*100)}%`,badgeKind:"progress",showNumericTimer:true});
  if((skillRank(s, "missile_swarm") >= 3)){
    for(const salvo of r.salvos)add(130,{id:`core_130:${salvo.id}`,badgeText:`${salvo.data}/${V.dataLimit}`,badgeKind:"stack",progress:salvo.data/V.dataLimit,timeLabel:"Salvo đang bay",description:`${getSkillTooltipModel(s,"missile_swarm").description} Còn ${salvo.pending+salvo.live.size} tên lửa chưa kết thúc.`});
    const remaining=(c.timers.tacticalData||0)-c.time;
    if(remaining>0)add(130,{remaining,duration:V.dataDuration,badgeText:`+${number(hasCore(s,95)?0:(c.stacks.tacticalData||0)*V.dataCrit*100)}%`,badgeKind:"percent",showNumericTimer:true,description:getSkillTooltipModel(s,"missile_swarm").description+(hasCore(s,95)?" Nghịch Lý Bạo Kích đang khóa tỷ lệ chí mạng ở 25%.":"")});
  }
  const reappearance=(c.timers.reappearanceBuff||0)-c.time;
  if((skillRank(s, "invisibility") >= 5)&&reappearance>0)add(142,{remaining:reappearance,duration:V.reappearanceDuration,showNumericTimer:true,timeLabel:"Cửa sổ bắn cường hóa"});
  const linger=world.decoys.filter(d=>d.clonePhase==="linger").reduce((n,d)=>Math.max(n,d.remaining),0);
  if((skillRank(s, "invisibility") >= 4)&&linger>0)add(141,{remaining:linger,duration:V.cloneLinger,showNumericTimer:true});
  return result;
}

/** Snapshot for the paused core inventory; no timers or React combat-frame updates. */
export function getCoreTelemetryPresentation(state:AircraftCombatState,id:CoreId):string[] {
  const row=Number(id.slice(5)),c=state.coreState,stats=getEffectiveAircraftStats(state);
  if(row===210)return [];
  if(row===227){const chest=state.coreState.release?.waitingChest;return chest?.claimed?[`Đã nhận phần thưởng: ${chest.rewardLabel}`]:[chest?.cancelled?"Đã hủy bởi Cái Giá Phải Trả":`Còn ${number(chest?.remaining??500)} giây chiến đấu`];}
  if(row===228)return ["Đã nhận 2 Trang Bị Huyền Thoại thuộc 2 family khác nhau. Mọi nguồn nhận Trang Bị đã khóa tới hết run."];
  if(row>=223){const t=c.telemetry?.[id]??{};return row===224?[`Trang bị rơi thêm: ${t.extraDrops??0}`,`Quái thường: ${t.normalDrops??0} · Tinh Anh: ${t.eliteDrops??0}`]:[`Trang Bị/Vật Phẩm đã nhận: ${t.itemsReceived??0}`];}
  const values=c.telemetry?.[id]??{},lines:string[]=[];
  if(row===160)return [`Tia Sao Băng đã bắn: ${values.procs??0}`,`Mục tiêu trúng lần đầu mỗi tia: ${values.hits??0}`,`Sát thương tia thực tế: ${amount(values.damage??0)}`];
  const resource=stats.resourceKind==="mana"?"Mana":"Điện";
  const labels:Record<number,Record<string,string>>={
    100:{firepowerTime:"Thời gian +20 Hỏa Lực (giây)",armorTime:"Thời gian +20 Giáp (giây)",regenTime:"Thời gian +8 Hỏa Lực / +8 Giáp (giây)"},
    179:{peak:"Cộng dồn cao nhất",consumed:"Lần chí mạng xóa Sai Số"},
    183:{peak:"Giáp cộng thêm cao nhất",armorTime:"Thời gian +20 Giáp (giây)",shieldTime:"Thời gian +40 Giáp (giây)"},
    191:{firepowerTime:"Thời gian Pha Kỹ Năng (giây)",fireRateTime:"Thời gian Pha Bắn Thường (giây)"},
    197:{accumulated:"Sát thương đã trì hoãn",peak:"Nợ sát thương cao nhất"},
    198:{granted:"Vệ tinh đã tạo",shots:"Phát bắn khi hết hạn"},200:{shieldCreated:"Dung lượng khiên cộng thêm"},
    209:{cooldown:"Giây Hồi Chiêu tăng thêm do mất Điểm Hồi Kỹ Năng"},
    212:{converted:"Token dư chuyển thành dự trữ"},213:{blocked:"Lượt xuất hiện đã chặn"},
    214:{picks:"Lần chọn ô thứ 4–5"},215:{picks:"Lần chọn ô bảo đảm"},
    216:{converted:"Lõi đã chuyển đổi",rewards:"Lõi Kim Cương đã nhận"},
  };
  for(const metric of CORE_METRICS[row]??[]){
    const label=labels[row]?.[metric]??(metric==="resource"?`${resource} thực tế đã hồi`:CORE_METRIC_LABELS[metric]);
    lines.push(`${label}: ${number(values[metric]??0)}${metric==="cooldown"?" giây":""}`);
  }
  const flat=FLAT_CORE_STATS[id];
  if(flat){
    const names:Partial<Record<keyof typeof stats,string>>={firepower:"Hỏa Lực",armor:"Giáp",bonusFireRatePct:"Tốc Độ Bắn Cộng Thêm",maxHp:"Máu Tối Đa",hpRegen:"Hồi Máu mỗi giây",skillHaste:"Điểm Hồi Kỹ Năng",criticalChance:"Tỷ Lệ Chí Mạng",criticalDamageMultiplier:"Sát Thương Chí Mạng"};
    const percent=["bonusFireRatePct","criticalChance","criticalDamageMultiplier"].includes(flat.key);
    lines.push(`Chỉ số từ lõi: +${number(flat.amount*(percent?100:1))}${percent?"%":""} ${names[flat.key]}`);
  }
  const active=(key:string)=>(c.timers[key]??0)>c.time;
  const bonus=(value:number,label:string)=>lines.push(`Đang cung cấp: +${number(value)} ${label}`);
  if(row>=46&&row<=48)bonus(c.stacks[id]??0,row===46?"Hỏa Lực":row===47?"Giáp":"Máu Tối Đa");
  if(row===54)bonus(((c.stacks.fireRateConversion??1)-1)*100,"% Basic Damage từ chuyển đổi Tốc Độ Bắn");
  if(row===96)bonus(67,"Điểm Hồi Kỹ Năng");
  if(row===105)bonus(25,"% Tỷ Lệ Chí Mạng");
  if(row===91)bonus(Math.min(.6,Math.max(0,1-state.currentHp/stats.maxHp)*.6)*100,"% mọi sát thương");
  if(row===49){const on=c.time-c.lastMove>=2;bonus(on?30:0,"% Hỏa Lực");bonus(on?60:0,"% Giáp");}
  if(row===61)bonus(active("reactiveArmor")?45:0,"Giáp");
  if(row===63){const on=state.currentHp<stats.maxHp*.35;bonus(on?50:0,"Hỏa Lực");bonus(on?35:0,"Giáp");}
  if(row===66)lines.push(`Cộng dồn: ${c.time-c.lastKill<=4?c.stacks.combo??0:0} / 5`);
  if(row===71)bonus(active("tacticalRate")?36:0,"% Tốc Độ Bắn Cộng Thêm");
  if(row===75){lines.push(`Cộng dồn: ${c.stacks.slaying??0} / 5`);bonus((c.stacks.slaying??0)*4,"% Hỏa Lực");}
  if(row===78)bonus(active("reactor")?50:0,"% Hồi Tài Nguyên");
  if(row===82)bonus(c.time-c.lastDamage>=4?72:0,"% Tốc Độ Bắn Cộng Thêm");
  if(row===56)lines.push("Đang cung cấp: +3% Tỷ Lệ Chí Mạng; +22% Sát Thương Chí Mạng (trước giới hạn).");
  if(row===111)lines.push("Tốc độ đạn thường: 1440 px/s.");
  if(row===149)BOUNTY_REWARDS.forEach((reward,index)=>{const count=c.stacks[`bountyReward:${index}`]??0;if(count)lines.push(`+${number(count*reward.amount*("percent" in reward?100:1))}${"percent" in reward?"%":""} ${reward.label} (${count} lần)`);});
  if(row===85)lines.push("Đang cung cấp: +70 Hỏa Lực; −45 Giáp.");
  if(row===86)lines.push("Đang cung cấp: +80% Hồi Tài Nguyên; −50% Tài Nguyên Tối Đa.");
  if(row===74)lines.push("Đang cung cấp: +15% Tỷ Lệ Chí Mạng; giảm 0,3s hồi chiêu ba Skill cơ bản/đòn chí mạng.");
  if(row===87)lines.push("Đang cung cấp: +25% Tỷ Lệ Chí Mạng; +40% Sát Thương Chí Mạng.");
  if(row===94)lines.push("Đang cung cấp: +50% Hỏa Lực; +25% Tỷ Lệ Chí Mạng; −40% Máu Tối Đa.");
  if(row===95)lines.push("25% Tỷ Lệ Chí Mạng; +100% Sát Thương Chí Mạng.");
  if(row===97)lines.push("Khóa chủ động Kỹ Năng Tối Thượng; 3 kỹ năng thường +20% sát thương, -25% hồi chiêu cơ bản, -20% chi phí.");
  if(row===100){bonus(state.currentHp>stats.maxHp*.7?45:state.currentHp>=stats.maxHp*.3?22:0,"Hỏa Lực");bonus(state.currentHp<stats.maxHp*.3?45:state.currentHp<=stats.maxHp*.7?22:0,"Giáp");}
  const key=({76:"reactive",81:"skill",99:"reserve",104:"overheal"} as Record<number,string>)[row];
  if(key){const shield=c.shields[key];const amount=shield&&shield.until>c.time?shield.amount:0;lines.push(`Khiên hiện tại: ${Math.round(amount).toLocaleString("vi-VN")}${row===104?` / ${Math.round(stats.maxHp*.15*getRecoveryReceivedMultiplier(state)).toLocaleString("vi-VN")}`:""}`);}
  if(row===121)lines.push(`Kho hiện tại: ${number((c.stacks.antimatter??0)*100)}% Hỏa Lực / 350% Hỏa Lực`);
  if(row===126)bonus(active("activeCooling")?V.coolingMana*100:0,"% Mana Tối Đa hồi dần trong 5s");
  if(row===130){const stacks=active("tacticalData")?c.stacks.tacticalData??0:0;lines.push(`Dữ Liệu đang dùng: ${stacks} / ${V.dataLimit}`);bonus(hasCore(state,95)?0:stacks*V.dataCrit*100,"% Tỷ Lệ Chí Mạng");}
  if(row===208&&hasCore(state,208))lines.push(core208LiveLabel(state));
  lines.push(...releaseTelemetry(state,row));
  const status=coreStackLabel(state,id);
  if(status&&!lines.includes(status))lines.push(status);
  if(!lines.length)lines.push("Đang trang bị. Hiệu ứng áp dụng theo mô tả lõi.");
  return lines.map(line=>line.replace(/([\d,]+) %/g,"$1%"));
}

function core208LiveLabel(state:AircraftCombatState):string {
  const contribution=getCore208Contribution(state);
  const format=(value:number)=>value.toLocaleString("vi-VN",{maximumFractionDigits:1});
  return `Hiện nhận từ Lõi: +${format(contribution.hpRegen)} Hồi Máu/s · +${format(contribution.resourceRegen)} Hồi Tài Nguyên/s`;
}
