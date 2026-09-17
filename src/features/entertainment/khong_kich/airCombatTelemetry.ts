import type { AircraftCombatState } from "./airCombatTypes";

export const CORE_METRIC_LABELS = {
  damage: "Sát thương đã gây", healed: "HP thực tế đã hồi", shieldCreated: "Khiên đã tạo",
  shieldAbsorbed: "Sát thương khiên đã hấp thụ", resource: "Tài nguyên thực tế đã hồi",
  cooldown: "Tổng giây hồi chiêu đã giảm", blocked: "Đạn đã phá", executes: "Mục tiêu đã kết liễu",
  procs: "Số lần kích hoạt", hits: "Số lần trúng", launched: "Tên lửa đã phóng",
  grazes: "Số Graze", scraps: "Scrap đã nhặt", hacked: "Mục tiêu đã chiếm quyền", bossStuns: "Số lần choáng Boss",
} as const;
export type CoreMetric = keyof typeof CORE_METRIC_LABELS;
/** Counters belong only to the aircraft of this run; never to the saved profile. */
export function recordCoreMetric(state: AircraftCombatState, row: number | undefined, metric: CoreMetric, amount: number): void {
  if (!row || !(amount > 0) || !Number.isFinite(amount)) return;
  const id = `core_${String(row).padStart(3, "0")}`;
  if (!state.selectedCores.includes(id)) return;
  const telemetry = state.coreState.telemetry ??= {};
  const entry = telemetry[id] ??= {};
  entry[metric] = (entry[metric] ?? 0) + amount;
}
export const CORE_METRICS: Record<number, readonly CoreMetric[]> = {
  78:["resource"],126:["resource"],
  27:["damage"],38:["healed"],62:["healed"],64:["healed"],70:["cooldown"],73:["damage"],74:["cooldown"],
  76:["shieldCreated","shieldAbsorbed"],77:["healed","cooldown"],81:["shieldCreated","shieldAbsorbed"],
  90:["procs","healed"],92:["healed"],93:["cooldown"],99:["shieldCreated","shieldAbsorbed","resource"],104:["shieldCreated","shieldAbsorbed"],
  105:["damage","hits"],106:["damage","launched","hits"],107:["grazes","resource"],108:["scraps","healed"],
  112:["damage"],120:["hacked","bossStuns"],121:["damage"],122:["resource"],123:["damage"],129:["blocked"],
  131:["blocked"],132:["resource"],134:["damage"],136:["damage","blocked"],138:["healed"],140:["damage"],143:["executes"],147:["blocked"],148:["resource"],
};
