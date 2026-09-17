import { CORE_METRICS, CORE_METRIC_LABELS } from "./airCombatTelemetry";
import { FLAT_CORE_STATS } from "./airCombatCoreEffects";
import { SKILL_BASE_VALUES as B, SKILL_CORE_VALUES as V } from "./airCombatSkillCores";
import { getEffectiveAircraftStats, getSkillRuntimeValues } from "./airCombatAircraft";
import { AIRCRAFT_CONFIGS, SKILL_CONFIGS, getCoreDefinition } from "./airCombatConfig";
import { coreId, coreStackLabel, hasCore, negativeStatusDuration } from "./airCombatCoreEffects";
import type { AircraftCombatState, CoreId, SkillId } from "./airCombatTypes";
import { crowdDamageBonus, isHostileToPlayer, type CombatWorld } from "./airCombatRuntime";

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
  const config = SKILL_CONFIGS[id], v = getSkillRuntimeValues(state, id);
  const free = hasCore(state, 84) && (state.coreState.skillCasts + 1) % 4 === 0;
  const resource = AIRCRAFT_CONFIGS[state.aircraftId].resourceKind === "mana" ? "Mana" : "Điện";
  const detailRows = [id === "escort_drone" ? `Cần ≥${number(v.cost)} Điện · bật không trừ phí` : `Tiêu hao: ${free ? 0 : v.cost} ${resource}`];
  const descriptions: Record<SkillId, string> = {
    decoy: `Phóng ${v.count} đợt Mồi Bẫy, mỗi đợt gồm ${B.decoysPerVolley} mồi. Sau khi bung, mỗi mồi tồn tại ${number(v.duration)} giây, thu hút mục tiêu và hấp thụ đạn địch.`,
    afterburner: `Trong ${number(v.duration)} giây, nhận +${number((hasCore(state,23)?B.upgradedAfterburnerRate:B.afterburnerRate)*100)}% Tốc Độ Bắn. Đạn thường nảy thêm 2 lần, lần lượt gây ${number((hasCore(state,127)?V.bounceFirst:B.bounceFirst)*100)}% và ${number((hasCore(state,127)?V.bounceSecond:B.bounceSecond)*100)}% sát thương gốc.`,
    missile_swarm: `Phóng ${v.count} tên lửa tự tìm mục tiêu. Mỗi tên lửa gây ${number(v.damageMultiplier*100)}% Hỏa Lực. Tên lửa được phóng theo từng cặp trái–phải, lơ lửng trong ${number(B.swarmHover)} giây trước khi khóa mục tiêu và tăng tốc.`,
    armor_shield: `Trong ${number(v.duration)} giây, giảm ${number((1-v.damageTakenMultiplier)*100)}% sát thương nhận vào sau khi tính Giáp.`,
    heavy_bomb: `Phóng một quả bom hạng nặng gây ${number(v.damageMultiplier*100)}% Hỏa Lực lên toàn bộ kẻ địch trên màn hình. BigBang phát nổ sau ${number(B.bombFuse)} giây hoặc ngay khi va chạm.`,
    sweeping_cannon: `Trong ${number(v.duration)} giây, thay đạn thường bằng quạt ${v.count} tia, mỗi tia gây ${number(v.damageMultiplier*100)}% Hỏa Lực. Một mục tiêu trúng thêm tia trong cùng loạt chỉ nhận ${number(v.sideProjectileMultiplier*100)}% sát thương của tia đầu. Bấm lại để kết thúc Oanh Tạc. Hồi chiêu bắt đầu sau khi kỹ năng kết thúc.`,
    invisibility: `Tàng hình trong ${number(v.duration)} giây, để lại một phân thân thu hút đạn địch và lướt theo hướng di chuyển cuối cùng. Nếu không có hướng di chuyển, Phantom lướt lên trên.`,
    focus_laser: `Tụ năng lượng trong ${number(v.charge)} giây, sau đó bắn Laser xuyên mục tiêu trong ${number(v.duration)} giây. Laser gây ${number(v.damageMultiplier*100)}% Hỏa Lực mỗi ${number(B.laserTick)} giây. Phantom ngừng bắn thường trong toàn bộ quá trình sử dụng kỹ năng.`,
    escort_drone: `Triệu hồi HawkEye kế thừa ${number(v.damageMultiplier*100)}% chỉ số của Phantom. HawkEye tiêu hao ${number(v.upkeepPerSecond)} Điện mỗi giây khi hoạt động. Cần ít nhất ${number(v.cost)} Điện để kích hoạt nhưng không mất phí ban đầu. Bấm lại để thu hồi. Hồi chiêu bắt đầu sau khi HawkEye kết thúc.`,
  };
  if(id === "decoy")detailRows.push(`Khoảng cách giữa các đợt: ${number(B.decoyVolleyInterval)} giây`);
  if(id === "escort_drone")detailRows.push(`Hồi Điện: ${number(getEffectiveAircraftStats(state).resourceRegen)}/s`,hawkEyeTimeLabel(hawkEyeDuration(state).remaining));
  const coreRows: string[] = [];
  // The main copy uses effective values; these rows identify each owned upgrade.
  for (const row of [...Array.from({length:27},(_,i)=>19+i), ...Array.from({length:27},(_,i)=>122+i)]) {
    const core = getCoreDefinition(coreId(row));
    if (hasCore(state, row) && core.skillId === id) coreRows.push(core.description);
  }
  if (id === "escort_drone" && state.droneActive && hasCore(state,148)) coreRows.push(`Nếu thu hồi lúc này: hoàn ${number(Math.max(0,Math.min(V.recallRefundCap,(state.coreState.stacks.droneUpkeepSpent || 0)*V.recallRefund,getEffectiveAircraftStats(state).maxResource-state.currentResource)))} Điện.`);
  if (hasCore(state, 53)) coreRows.push("Kỹ năng có thể chí mạng.");
  if (hasCore(state, 96)) coreRows.push("Mỗi lần dùng kỹ năng mất 5% HP hiện tại.");
  return { title: config.name, description: descriptions[id], detailRows, coreRows,
    cooldown: v.cooldown * (1 - getEffectiveAircraftStats(state).cooldownReduction) * (free ? 1.2 : 1) };
}

export function getActiveSkillDuration(world: CombatWorld, id: SkillId) {
  const state = world.aircraft;
  if (id === "escort_drone") {
    if (!state.droneActive) return null;
    const energy = hawkEyeDuration(state);
    // Time estimates are separate from visual progress for this resource-driven toggle.
    return { remaining: energy.remaining ?? 0, duration: energy.remaining ?? 0, progress: energy.progress,
      timeLabel: hawkEyeTimeLabel(energy.remaining) };
  }
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
  return remaining > 0 && duration > 0 && Number.isFinite(duration)
    ? { remaining, duration: Math.max(duration, remaining), progress: Math.min(1, remaining / duration), timeLabel: undefined } : null;
}

export interface StatusPresentation {
  id: string;
  group: "buff" | "debuff";
  name: string;
  icon: { kind: "skill"; id: SkillId } | { kind: "core"; id: CoreId } | { kind: "status"; id: "acid" | "burn" | "stun" | "armor" | "shield" | "skill_lock" | "resource_jam" | "regen_off" | "mark" | "radar" };
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
}

const TIMED_STATUSES = [
  { key: "tacticalRate", row: 71, duration: 5 },
  { key: "reactor", row: 78, duration: 6 },
  { key: "decoyCounter", row: 21, duration: 5 },
  { key: "shieldArmor", row: 30, duration: 6 },
  { key: "hawkRage", row: 44, duration: 3 },
] as const;

// Read canonical runtime timers only. Core 106 deliberately has no entry.
const CORE_COOLDOWN_PRESENTATIONS: readonly {row:number;timer:string;duration:number;shield?:string;active?:string;activeDuration?:number;charge?:string}[] = [
  {row:61,timer:"reactiveArmorCd",duration:10,active:"reactiveArmor",activeDuration:5},
  {row:76,timer:"reactiveShieldCd",duration:10,shield:"reactive"},
  {row:81,timer:"skillShieldCd",duration:6,shield:"skill"},
  {row:83,timer:"counterCd",duration:6,charge:"counter"},
  {row:99,timer:"reserveShieldCd",duration:20,shield:"reserve"},
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
    const recovery=cooldown?`Hồi nội tại: ${seconds(cooldown)}`:"Nội tại đã sẵn sàng";
    add(entry.row,`${label}${label?". ":""}${recovery}.`,{
      remaining:active||cooldown||Infinity,duration:active?(entry.activeDuration??active):entry.duration,
      timerKind:active?"active":cooldown?"cooldown":undefined,showNumericTimer:Boolean(active||cooldown),
      badgeText:charges?String(charges):undefined,badgeKind:charges?"charge":undefined,
      timeLabel:active?label:recovery,priority:active||shieldActive||charges?80:55,
    });
  }
  if(hasCore(s,109)){
    const left=Math.max(0,(c.timers["wing:left_wing"]??0)-c.time),right=Math.max(0,(c.timers["wing:right_wing"]??0)-c.time);
    const pending=[left,right].filter(value=>value>0),remaining=pending.length?Math.min(...pending):Infinity;
    add(109,`Cánh trái: ${left?seconds(left):"Sẵn sàng"}. Cánh phải: ${right?seconds(right):"Sẵn sàng"}.`,{
      badgeText:`${2-pending.length}/2`,badgeKind:"charge",remaining,duration:12,
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
      remaining,duration:active?(boss?1.25:t?.hackMode==="elite"?4:6):18,timerKind:active?"active":cooldown?"cooldown":undefined,
      showNumericTimer:active||cooldown>0,badgeText:active&&!boss?`×${count}`:undefined,badgeKind:active&&!boss?"charge":undefined,
      timeLabel:label,priority:active?85:cooldown?70:45,
    });
  }
  return result;
}

export function getStatusPresentations(world: CombatWorld): StatusPresentation[] {
  const s = world.aircraft, c = s.coreState, result: StatusPresentation[] = [];
  result.push(...coreCooldownStatuses(world), ...skillCoreStatuses(world));
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
    result.push({ id: entry.key, group: "buff", name: core.name, icon: { kind: "core", id: core.id }, description: core.description,
      source: "Lõi", stacks: 1, remaining, duration: entry.duration, priority: 80 });
  }
  for(const row of [107,114,116,118,121])if(hasCore(s,row)){
    const core=getCoreDefinition(coreId(row)),remaining=row===116?(c.timers.comeback??0)-c.time:Infinity;
    if(row===116&&remaining<=0)continue;
    const detail=row===121?`Phản Vật Chất: ${Math.round((c.stacks.antimatter??0)*100)}% / 500%`:row===107?`Graze: ${c.stacks.graze??0}/6`:row===114?`Còn ${c.stacks.linkedShots??0} phát bắn cường hóa`:core.description;
    let badgeText: string | undefined, badgeKind: StatusPresentation["badgeKind"];
    if (row === 107) { badgeText = `${c.stacks.graze ?? 0}/6`; badgeKind = "progress"; }
    if (row === 114) { badgeText = String(c.stacks.linkedShots ?? 0); badgeKind = "charge"; }
    if (row === 118) { badgeText = `+${Math.round(crowdDamageBonus(world) * 100)}%`; badgeKind = "bonus"; }
    if (row === 121) { badgeText = `${Math.round((c.stacks.antimatter ?? 0) * 100)}%`; badgeKind = "percent"; }
    result.push({id:core.id,group:"buff",name:core.name,icon:{kind:"core",id:core.id},
      description:row===118?`${core.description} Hiện tại: +${number(crowdDamageBonus(world) * 100)}%.`:detail===core.description?detail:`${core.description} ${detail}`,
      source:"Lõi",stacks:1,badgeText,badgeKind,remaining,duration:row===116?4:Infinity,priority:row===116||row===114&&(c.stacks.linkedShots??0)>0?80:45});
  }
  for (const row of [112, 119]) if (hasCore(s, row)) {
    const live = row === 112
      ? (world.tactical?.grids ?? []).filter(g => g.until > world.elapsed &&
        world.enemies.some(e => e.id === g.a && isHostileToPlayer(world, e)) &&
        world.enemies.some(e => e.id === g.b && isHostileToPlayer(world, e)))
      : (world.tactical?.fields ?? []).filter(f => f.until > world.elapsed);
    if (!live.length) continue;
    const core = getCoreDefinition(coreId(row));
    result.push({ id: core.id, group: "buff", name: core.name, icon: { kind: "core", id: core.id },
      description: `${core.description} Đang tồn tại: ${live.length}.`, source: "Lõi", stacks: live.length,
      badgeText: `×${live.length}`, badgeKind: "stack", remaining: Math.min(...live.map(v => v.until)) - world.elapsed,
      duration: row === 112 ? 2 : 4, priority: 80 });
  }
  const conditional = [
    { row: 49, on: c.time - c.lastMove >= 2.5 },
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
      badgeText: entry.row === 75 ? `×${entry.stacks}` : undefined,
      badgeKind: entry.row === 75 ? "stack" : undefined,
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
      description:`${core.description} Khiên hiện tại: ${number(overheal.amount)} / ${number(maxHp*.12)}`,
      source:"Lõi",stacks:1,badgeText:String(Math.ceil(overheal.amount)),badgeKind:"shield",remaining:Infinity,duration:Infinity,showNumericTimer:false,priority:105});
  }
  const shields = Object.entries(c.shields).filter(([key])=>key!=="overheal").filter(([, v]) => v.amount > 0 && v.until > c.time);
  if (shields.length) {
    const first = shields.reduce((a, b) => a[1].until < b[1].until ? a : b);
    result.push({ id: "shield", group: "buff", name: "Lá chắn", icon: { kind: "status", id: "shield" },
      description: `Hấp thụ ${Math.ceil(shields.reduce((n, [, v]) => n + v.amount, 0))} sát thương.`, source: "Lõi",
      stacks: 1, remaining: first[1].until - c.time, duration: first[0] === "reserve" ? 4 : first[0] === "overheal" ? Infinity : 3, priority: 95 });
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
    ["stunnedUntil","Choáng","stun","Không thể di chuyển, dùng kỹ năng hoặc bắn thường."],
    ["skillLockedUntil","Khóa kỹ năng","skill_lock","Tạm khóa kỹ năng; vẫn di chuyển và bắn thường."],
    ["resourceJammedUntil","Nhiễu tài nguyên","resource_jam","Giảm hồi tài nguyên; giữ nguyên tài nguyên đang có."],
    ["armorBrokenUntil","Vỡ giáp","armor","Giáp -35%."],
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
    result.push({id:core.id,group:"buff",name:core.name,icon:{kind:"core",id:core.id},description:core.description,source:"Lõi kỹ năng",
      stacks:1,remaining:Infinity,duration:Infinity,priority:85,showNumericTimer:false,...values});
  };
  const activeDecoys=world.decoys.some(d=>!d.clone&&d.active&&d.remaining>0);
  const cover=(c.timers.thermalCover||0)-c.time;
  if(hasCore(s,124)&&(activeDecoys||cover>0))add(124,{remaining:activeDecoys?Infinity:cover,duration:V.thermalTail,badgeText:`−${V.thermalReduction*100}%`,badgeKind:"percent",showNumericTimer:!activeDecoys,timeLabel:activeDecoys?"Duy trì bởi mồi đang hoạt động":undefined});
  const cooling=(c.timers.activeCooling||0)-c.time;
  if(hasCore(s,126)&&cooling>0)add(126,{remaining:cooling,duration:V.coolingDuration,badgeText:`+${V.coolingMana*100}%`,badgeKind:"percent",showNumericTimer:true});
  if(hasCore(s,122))for(const [id,cast] of r.decoyCasts)add(122,{id:`core_122:${id}`,badgeText:`${number(cast.restored/getEffectiveAircraftStats(s).maxResource*100)}%`,badgeKind:"progress",progress:cast.restored/(getEffectiveAircraftStats(s).maxResource*V.decoyRefundCap),timeLabel:`Hồi Mana / giới hạn ${V.decoyRefundCap*100}% mỗi lần dùng`});
  if(hasCore(s,132)&&(s.activeEffects.armor_shield||0)>0)add(132,{remaining:s.activeEffects.armor_shield!,duration:getSkillRuntimeValues(s,"armor_shield").duration,
    badgeText:`${number((c.stacks.shieldRefund||0)/getEffectiveAircraftStats(s).maxResource*100)}%`,badgeKind:"progress",showNumericTimer:true});
  if(hasCore(s,130)){
    for(const salvo of r.salvos)add(130,{id:`core_130:${salvo.id}`,badgeText:`${salvo.data}/${V.dataLimit}`,badgeKind:"stack",progress:salvo.data/V.dataLimit,timeLabel:"Salvo đang bay",description:`${getCoreDefinition(coreId(130)).description} Còn ${salvo.pending+salvo.live.size} tên lửa chưa kết thúc.`});
    const remaining=(c.timers.tacticalData||0)-c.time;
    if(remaining>0)add(130,{remaining,duration:V.dataDuration,badgeText:`+${number(hasCore(s,95)?0:(c.stacks.tacticalData||0)*V.dataCrit*100)}%`,badgeKind:"percent",showNumericTimer:true,description:getCoreDefinition(coreId(130)).description+(hasCore(s,95)?" Nghịch Lý Bạo Kích đang khóa tỷ lệ chí mạng ở 25%.":"")});
  }
  if(hasCore(s,136)&&r.blackHoles.length)add(136,{remaining:Math.max(...r.blackHoles.map(h=>h.until-world.elapsed)),duration:V.holeDuration,showNumericTimer:true});
  const charges=c.stacks.reappearanceShots||0;
  if(hasCore(s,142)&&charges>0)add(142,{badgeText:String(charges),badgeKind:"charge",progress:charges/V.reappearanceCharges,timeLabel:"Còn số lần bắn · không hết hạn"});
  const linger=world.decoys.filter(d=>d.clonePhase==="linger").reduce((n,d)=>Math.max(n,d.remaining),0);
  if(hasCore(s,141)&&linger>0)add(141,{remaining:linger,duration:V.cloneLinger,showNumericTimer:true});
  if(hasCore(s,147)&&s.droneActive)add(147,{remaining:Math.max(0,(c.timers.electronicGuard||0)-c.time),duration:V.guardCycle,timerKind:"cooldown",showNumericTimer:true});
  return result;
}

/** Snapshot for the paused core inventory; no timers or React combat-frame updates. */
export function getCoreTelemetryPresentation(state:AircraftCombatState,id:CoreId):string[] {
  const row=Number(id.slice(5)),c=state.coreState,stats=getEffectiveAircraftStats(state);
  const values=c.telemetry?.[id]??{},lines:string[]=[];
  const resource=stats.resourceKind==="mana"?"Mana":"Điện";
  for(const metric of CORE_METRICS[row]??[]){
    const label=metric==="resource"?`${resource} thực tế đã hồi`:CORE_METRIC_LABELS[metric];
    lines.push(`${label}: ${number(values[metric]??0)}${metric==="cooldown"?" giây":""}`);
  }
  const flat=FLAT_CORE_STATS[id];
  if(flat){
    const names:Partial<Record<keyof typeof stats,string>>={firepower:"Hỏa Lực",armor:"Giáp",fireRate:"Tốc Độ Bắn",maxHp:"Máu Tối Đa",hpRegen:"Hồi Máu mỗi giây",cooldownReduction:"Giảm Hồi Chiêu",criticalChance:"Tỷ Lệ Chí Mạng",criticalDamageMultiplier:"Sát Thương Chí Mạng"};
    const percent=["cooldownReduction","criticalChance","criticalDamageMultiplier"].includes(flat.key);
    lines.push(`Chỉ số từ lõi: +${number(flat.amount*(percent?100:1))}${percent?"%":""} ${names[flat.key]}`);
  }
  const active=(key:string)=>(c.timers[key]??0)>c.time;
  const bonus=(value:number,label:string)=>lines.push(`Đang cung cấp: +${number(value)} ${label}`);
  if(row>=46&&row<=48)bonus(c.stacks[id]??0,row===46?"Hỏa Lực":row===47?"Giáp":"Máu Tối Đa");
  if(row===54)bonus(c.stacks.fireRateConversion??0,"Hỏa Lực từ chuyển đổi Tốc Độ Bắn");
  if(row===96)bonus(30,"% Giảm Hồi Chiêu");
  if(row===105)bonus(25,"% Tỷ Lệ Chí Mạng");
  if(row===91)bonus(Math.min(.4,Math.floor((1-state.currentHp/stats.maxHp)/.02)*.01)*100,"% sát thương");
  if(row===49){const on=c.time-c.lastMove>=2.5;bonus(on?30:0,"% Hỏa Lực");bonus(on?60:0,"% Giáp");}
  if(row===61)bonus(active("reactiveArmor")?25:0,"Giáp");
  if(row===63){const value=state.currentHp<stats.maxHp*.35?20:0;bonus(value,"Hỏa Lực");bonus(value,"Giáp");}
  if(row===66)lines.push(`Cộng dồn: ${c.time-c.lastKill<=3?c.stacks.combo??0:0} / 5`);
  if(row===71)bonus(active("tacticalRate")?.30:0,"Tốc Độ Bắn");
  if(row===75){lines.push(`Cộng dồn: ${c.stacks.slaying??0} / 5`);bonus((c.stacks.slaying??0)*3,"% Hỏa Lực");}
  if(row===78)bonus(active("reactor")?50:0,"% Hồi Tài Nguyên");
  if(row===82)bonus(c.time-c.lastDamage>=4?20:0,"% Tốc Độ Bắn");
  if(row===85)lines.push("Đang cung cấp: +48 Hỏa Lực; −24 Giáp.");
  if(row===86)lines.push("Đang cung cấp: +70% Hồi Tài Nguyên; −35% Tài Nguyên Tối Đa.");
  if(row===87)lines.push("Đang cung cấp: +20% Tỷ Lệ Chí Mạng; +40% Sát Thương Chí Mạng.");
  if(row===94)lines.push("Đang cung cấp: +40% Hỏa Lực; +10% Tỷ Lệ Chí Mạng; −35% Máu Tối Đa.");
  if(row===95)lines.push("Tỷ Lệ Chí Mạng: 25%; +140% Sát Thương Chí Mạng.");
  if(row===97)lines.push("Đang cung cấp: +40% Hỏa Lực; +30% Máu Tối Đa; +30% Giáp.");
  if(row===100){bonus(state.currentHp>stats.maxHp*.7?20:state.currentHp>=stats.maxHp*.3?8:0,"Hỏa Lực");bonus(state.currentHp<stats.maxHp*.3?20:state.currentHp<=stats.maxHp*.7?8:0,"Giáp");}
  const key=({76:"reactive",81:"skill",99:"reserve",104:"overheal"} as Record<number,string>)[row];
  if(key){const shield=c.shields[key];const amount=shield&&shield.until>c.time?shield.amount:0;lines.push(`Khiên hiện tại: ${number(amount)}${row===104?` / ${number(stats.maxHp*.12)}`:""}`);}
  if(row===121)lines.push(`Kho hiện tại: ${number((c.stacks.antimatter??0)*100)}% / 500% Hỏa Lực`);
  if(row===126)bonus(active("activeCooling")?V.coolingMana*100:0,"% Mana Tối Đa hồi dần trong 5s");
  if(row===130){const stacks=active("tacticalData")?c.stacks.tacticalData??0:0;lines.push(`Dữ Liệu đang dùng: ${stacks} / ${V.dataLimit}`);bonus(hasCore(state,95)?0:stacks*V.dataCrit*100,"% Tỷ Lệ Chí Mạng");}
  const status=coreStackLabel(state,id);
  if(status&&!lines.includes(status))lines.push(status);
  if(!lines.length)lines.push("Đang trang bị. Hiệu ứng áp dụng theo mô tả lõi.");
  return lines.map(line=>line.replace(/([\d,]+) %/g,"$1%"));
}
