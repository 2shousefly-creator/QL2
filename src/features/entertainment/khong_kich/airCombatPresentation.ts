import { getEffectiveAircraftStats, getSkillRuntimeValues } from "./airCombatAircraft";
import { AIRCRAFT_CONFIGS, SKILL_CONFIGS, getCoreDefinition } from "./airCombatConfig";
import { coreId, hasCore, negativeStatusDuration } from "./airCombatCoreEffects";
import type { AircraftCombatState, CoreId, SkillId } from "./airCombatTypes";
import type { CombatWorld } from "./airCombatRuntime";

const number = (value: number) => value.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
export function getSkillTooltipModel(state: AircraftCombatState, id: SkillId) {
  const config = SKILL_CONFIGS[id], v = getSkillRuntimeValues(state, id);
  const free = hasCore(state, 84) && (state.coreState.skillCasts + 1) % 4 === 0;
  const resource = AIRCRAFT_CONFIGS[state.aircraftId].resourceKind === "mana" ? "Mana" : "Điện";
  const detailRows = [id === "escort_drone" ? "Cần ≥5 Điện · bật không trừ phí" : `Tiêu hao: ${free ? 0 : v.cost} ${resource}`];
  if (v.duration) detailRows.push(`Duy trì: ${number(v.duration)}s${id === "focus_laser" ? " bắn" : id === "decoy" ? " mỗi mồi" : ""}`);
  if (v.damageMultiplier && id !== "escort_drone") detailRows.push(`${number(v.damageMultiplier * 100)}% Hỏa lực/${id === "focus_laser" ? "nhịp (0,25s)" : id === "heavy_bomb" ? "địch" : id === "sweeping_cannon" ? "tia" : "tên lửa"}`);
  const descriptions: Record<SkillId, string> = {
    decoy: "Thả mồi hút mục tiêu và hấp thụ đạn.",
    afterburner: "Tăng tốc bắn; đạn thường nảy thêm hai mục tiêu.",
    missile_swarm: "Phóng lần lượt từng cặp trái–phải. Lơ lửng 0,35s, tìm mục tiêu, xoay rồi tăng tốc. Cặp tiếp theo xuất hiện khi cặp trước bắt đầu bay.",
    armor_shield: "Giảm sát thương nhận vào sau khi tính Giáp.",
    heavy_bomb: "Tên lửa chậm gây nổ toàn màn hình khi va chạm hoặc sau 3s bay.",
    sweeping_cannon: "Thay đạn thường bằng quạt tia. Bấm lại để kết thúc; hồi chiêu bắt đầu khi kết thúc.",
    invisibility: "Tàng hình, để lại phân thân hút đạn và lướt theo hướng di chuyển cuối; mặc định lướt lên.",
    focus_laser: "Tụ năng lượng rồi bắn xuyên. Ngừng bắn thường trong toàn bộ kỹ năng.",
    escort_drone: "Triệu hồi HawkEye; bấm lại để thu hồi hoặc tự tắt khi hết Điện. Hồi chiêu bắt đầu khi kết thúc.",
  };
  switch (id) {
    case "decoy": detailRows.push(`${v.count} đợt × 10 mồi · cách đợt 0,75s`); break;
    case "afterburner": detailRows.push(`+${hasCore(state, 23) ? 130 : 80}% tốc bắn · nảy 75% → 56,25%`); break;
    case "missile_swarm": detailRows.push(`${v.count} tên lửa · ${v.count / 2} mỗi bên · ${v.count / 2} cặp`); break;
    case "armor_shield": detailRows.push(`Giảm ${number((1 - v.damageTakenMultiplier) * 100)}% sát thương`); break;
    case "sweeping_cannon": detailRows.push(`${v.count} tia · trúng thêm cùng loạt: ${number(v.sideProjectileMultiplier * 100)}% viên đầu`); break;
    case "focus_laser": detailRows.push(`Tụ: ${number(v.charge)}s`); break;
    case "escort_drone": detailRows.push(`Kế thừa ${number(v.damageMultiplier * 100)}% chỉ số · tiêu hao ${v.upkeepPerSecond} Điện/s`); break;
  }
  // Secondary mechanics only; numerical upgrades above already come from runtime.
  for (const row of [21, 24, 27, 30, 33, 35, 38, 44]) {
    const core = getCoreDefinition(coreId(row));
    if (hasCore(state, row) && core.skillId === id) detailRows.push(core.description);
  }
  if (hasCore(state, 53)) detailRows.push("Kỹ năng có thể chí mạng.");
  if (hasCore(state, 96)) detailRows.push("Mỗi lần dùng kỹ năng mất 6% HP hiện tại.");
  return { title: config.name, description: descriptions[id], detailRows,
    cooldown: v.cooldown * (1 - getEffectiveAircraftStats(state).cooldownReduction) * (free ? 1.2 : 1) };
}

export function getActiveSkillDuration(world: CombatWorld, id: SkillId) {
  const state = world.aircraft;
  if (id === "escort_drone") return null;
  const v = getSkillRuntimeValues(state, id);
  let remaining = state.activeEffects[id] || 0;
  let duration = state.activeEffectDurations?.[id] ?? v.duration + (id === "focus_laser" ? v.charge : 0);
  if (id === "decoy") {
    // The last surviving mồi / pending volley is authoritative, including early destruction.
    duration = v.duration + (v.count - 1) * .75;
    remaining = Math.max(0, ...world.decoys.filter(d => !d.clone).map(d => d.remaining),
      world.decoyVolleys > 0 ? world.decoyVolleyCd + (world.decoyVolleys - 1) * .75 + v.duration : 0);
  }
  if (id === "focus_laser") remaining = world.laserCharge + world.laserRemaining;
  return remaining > 0 && duration > 0 && Number.isFinite(duration) ? { remaining, duration: Math.max(duration, remaining) } : null;
}

export interface StatusPresentation {
  id: string;
  group: "buff" | "debuff";
  name: string;
  icon: { kind: "skill"; id: SkillId } | { kind: "core"; id: CoreId } | { kind: "status"; id: "acid" | "burn" | "stun" | "armor" | "shield" };
  description: string;
  source: string;
  stacks: number;
  remaining: number;
  duration: number;
  priority: number;
}

const TIMED_STATUSES = [
  { key: "reactiveArmor", row: 61, duration: 4 },
  { key: "tacticalRate", row: 71, duration: 4 },
  { key: "reactor", row: 78, duration: 6 },
  { key: "decoyCounter", row: 21, duration: 4 },
  { key: "shieldArmor", row: 30, duration: 5 },
  { key: "hawkRage", row: 44, duration: 3 },
] as const;

export function getStatusPresentations(world: CombatWorld): StatusPresentation[] {
  const s = world.aircraft, c = s.coreState, result: StatusPresentation[] = [];
  const maxHp = getEffectiveAircraftStats(s).maxHp;
  for (const id of AIRCRAFT_CONFIGS[s.aircraftId].skillIds) {
    const timer = getActiveSkillDuration(world, id);
    if (timer || id === "escort_drone" && s.droneActive) {
      const model = getSkillTooltipModel(s, id);
      result.push({ id: `skill:${id}`, group: "buff", name: model.title, icon: { kind: "skill", id },
        description: [model.description, ...model.detailRows.slice(1)].join(" "), source: "Kỹ năng", stacks: 1,
        remaining: timer?.remaining ?? Infinity, duration: timer?.duration ?? Infinity, priority: 100 });
    }
  }
  for (const entry of TIMED_STATUSES) {
    const remaining = (c.timers[entry.key] || 0) - c.time;
    if (remaining <= 0) continue;
    const core = getCoreDefinition(coreId(entry.row));
    result.push({ id: entry.key, group: "buff", name: core.name, icon: { kind: "core", id: core.id }, description: core.description,
      source: "Lõi", stacks: 1, remaining, duration: entry.duration, priority: 80 });
  }
  const conditional = [
    { row: 49, on: c.time - c.lastMove >= 3 },
    { row: 60, on: c.time - c.lastDamage >= 4 },
    { row: 62, on: s.currentHp < maxHp * .2 },
    { row: 63, on: s.currentHp < maxHp * .35 },
    { row: 75, on: (c.stacks.slaying || 0) > 0, stacks: c.stacks.slaying },
    { row: 82, on: c.time - c.lastDamage >= 4 },
    { row: 83, on: (c.stacks.counter || 0) > 0, stacks: c.stacks.counter },
    { row: 92, on: c.time - c.lastDamage >= 5 },
    { row: 100, on: s.currentHp > maxHp * .7 || s.currentHp < maxHp * .3 },
  ];
  for (const entry of conditional) if (entry.on && hasCore(s, entry.row)) {
    const core = getCoreDefinition(coreId(entry.row));
    result.push({ id: core.id, group: "buff", name: core.name, icon: { kind: "core", id: core.id }, description: core.description,
      source: "Lõi · hiệu ứng có điều kiện", stacks: entry.stacks || 1, remaining: Infinity, duration: Infinity, priority: 60 });
  }
  if (hasCore(s, 66) && c.time - c.lastKill <= 3 && (c.stacks.combo || 0) > 0) {
    const core = getCoreDefinition(coreId(66));
    result.push({ id: "combo", group: "buff", name: core.name, icon: { kind: "core", id: core.id }, description: core.description,
      source: "Lõi", stacks: c.stacks.combo, remaining: 3 - (c.time - c.lastKill), duration: 3, priority: 70 });
  }
  const shields = Object.entries(c.shields).filter(([, v]) => v.amount > 0 && v.until > c.time);
  if (shields.length) {
    const first = shields.reduce((a, b) => a[1].until < b[1].until ? a : b);
    result.push({ id: "shield", group: "buff", name: "Lá chắn", icon: { kind: "status", id: "shield" },
      description: `Hấp thụ ${Math.ceil(shields.reduce((n, [, v]) => n + v.amount, 0))} sát thương.`, source: "Lõi",
      stacks: shields.length, remaining: first[1].until - c.time, duration: first[0] === "reserve" ? 4 : first[0] === "overheal" ? Infinity : 3, priority: 95 });
  }
  const acid = (c.timers.acidArmor || 0) - c.time;
  if (acid > 0) result.push({ id: "acidArmor", group: "debuff", name: "Ăn mòn", icon: { kind: "status", id: "acid" },
    description: "Giảm 30% Giáp của chiến đấu cơ.", source: "Địch · vùng axit", stacks: 1, remaining: acid,
    duration: negativeStatusDuration(s, 1.1), priority: 110 });
  // Aggregate the same status across live targets; show the earliest expiry, never sum timers.
  const enemyStates = [
    { id: "burn" as const, name: "Địch bị thiêu đốt", description: "70% Hỏa lực/s và giảm 30% Giáp; trúng mới làm mới 5s.", duration: 5, read: (e: CombatWorld["enemies"][number]) => e.burn },
    { id: "armor" as const, name: "Địch bị suy yếu", description: "Giảm 8% Giáp của địch.", duration: 4, read: (e: CombatWorld["enemies"][number]) => e.weakUntil - c.time },
    { id: "stun" as const, name: "Địch bị choáng", description: "Tạm ngừng hành động của địch.", duration: 4, read: (e: CombatWorld["enemies"][number]) => e.stun },
  ];
  for (const entry of enemyStates) {
    const timers = world.enemies.filter(e => e.hp > 0).map(entry.read).filter(t => t > 0);
    if (timers.length) result.push({ id: `enemy:${entry.id}`, group: "debuff", name: entry.name, icon: { kind: "status", id: entry.id },
      description: entry.description, source: "Hiệu ứng trên địch", stacks: timers.length, remaining: Math.min(...timers), duration: entry.duration, priority: 50 });
  }
  return result.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
}
