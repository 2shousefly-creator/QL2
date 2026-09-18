import type { AircraftCombatState } from "./airCombatTypes";

export const BOUNTY_REWARDS = [
  {key:"firepowerFlat",amount:8,label:"Hỏa Lực"}, {key:"armorFlat",amount:8,label:"Giáp"},
  {key:"maxHpFlat",amount:35,label:"Máu Tối Đa"}, {key:"cooldownReduction",amount:.03,label:"Giảm Hồi Chiêu",percent:true},
  {key:"hpRegen",amount:.3,label:"Hồi Máu mỗi giây"}, {key:"criticalChanceFlat",amount:.03,label:"Tỷ Lệ Chí Mạng",percent:true},
  {key:"criticalDamageMultiplierFlat",amount:.06,label:"Sát Thương Chí Mạng",percent:true}, {key:"fireRateFlat",amount:.12,label:"Tốc Độ Bắn"},
] as const;
export const CORE_METRIC_LABELS = {
  crits:"Số chí mạng khi trang bị",
  bonusDamage:"Sát thương cộng thêm thực tế", prevented:"Sát thương đã ngăn chặn", saved:"Tài nguyên đã tiết kiệm",
  uptime:"Thời gian hiệu ứng (giây)", extraTime:"Thời gian bổ sung (giây)", chargeSaved:"Thời gian tụ đã tiết kiệm (giây)",
  shots:"Phát bắn hưởng hiệu ứng", targets:"Số mục tiêu chịu hiệu ứng", extraProjectiles:"Đạn/mồi bổ sung đã phóng",
  extraCooldown:"Hồi chiêu cộng thêm (giây)", debuffSaved:"Thời gian debuff đã giảm (giây)", controlBlocked:"Hiệu ứng khống chế đã chặn",
  pierceOne:"Hit xuyên thứ nhất", pierceTwo:"Hit xuyên thứ hai", pierceOneDamage:"Sát thương xuyên thứ nhất", pierceTwoDamage:"Sát thương xuyên thứ hai",
  marks:"Mục tiêu đã đánh dấu", successes:"Tiền thưởng hoàn thành", rewards:"Phần thưởng đã nhận", converted:"Lõi đã nhận từ chuyển đổi",
  peakBonus:"Bonus sát thương cao nhất (%)",
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
  150:["blocked"],151:["bonusDamage"],152:["resource"],153:["bonusDamage"],154:["cooldown"],155:["procs","bonusDamage"],
  156:["chargeSaved"],157:["bonusDamage"],158:["bonusDamage"],159:["damage","hits"],160:["hits"],161:["saved"],
  162:["bonusDamage"],163:["hits"],164:["resource"],165:["cooldown"],166:["targets"],167:["damage"],
  19:["extraProjectiles","extraTime"],20:["cooldown"],21:["procs","bonusDamage"],22:["extraTime"],23:["shots"],24:["controlBlocked","prevented"],
  25:["extraProjectiles"],26:["bonusDamage"],28:["prevented"],29:["extraTime"],30:["procs","uptime"],31:["cooldown"],32:["bonusDamage"],33:["targets","uptime"],
  34:["bonusDamage"],35:["prevented"],36:["extraProjectiles","damage"],37:["extraTime"],39:["saved"],40:["shots","damage"],41:["chargeSaved","bonusDamage"],42:["saved"],43:["saved"],44:["procs","uptime"],45:["bonusDamage"],
  50:["converted"],51:["converted"],52:["converted"],53:["procs","bonusDamage"],56:["crits"],57:["bonusDamage"],58:["procs","targets"],
  65:["prevented"],67:["bonusDamage"],68:["bonusDamage"],69:["bonusDamage"],72:["procs","prevented"],79:["extraProjectiles","damage"],80:["procs","damage"],
  82:["uptime"],83:["procs","shots","bonusDamage"],84:["procs","saved","extraCooldown"],88:["bonusDamage"],89:["hits","damage"],98:["debuffSaved"],
  101:["bonusDamage"],102:["bonusDamage"],103:["prevented"],110:["prevented"],111:["shots"],115:["bonusDamage"],117:["procs"],118:["peakBonus","bonusDamage"],119:["targets","uptime"],
  124:["prevented"],125:["cooldown"],127:["bonusDamage"],128:["cooldown"],133:["cooldown"],135:["bonusDamage"],137:["cooldown"],139:["pierceOne","pierceTwo","pierceOneDamage","pierceTwoDamage"],
  141:["extraTime"],142:["shots","bonusDamage"],144:["targets"],145:["bonusDamage"],146:["procs","targets","bonusDamage"],149:["marks","successes","rewards","bonusDamage"],
  78:["resource"],126:["resource"],
  27:["damage"],38:["healed"],62:["healed"],64:["healed"],70:["cooldown"],73:["damage"],74:["cooldown"],
  76:["shieldCreated","shieldAbsorbed"],77:["healed","cooldown"],81:["shieldCreated","shieldAbsorbed"],
  90:["procs","healed"],92:["healed"],93:["cooldown"],99:["shieldCreated","shieldAbsorbed","procs"],104:["shieldCreated","shieldAbsorbed"],
  105:["damage","hits"],106:["damage","launched","hits"],107:["grazes","resource"],108:["scraps","healed"],
  112:["damage"],120:["hacked","bossStuns"],121:["damage"],122:["resource"],123:["damage"],129:["blocked"],
  131:["blocked"],132:["resource"],134:["damage"],136:["damage","blocked"],138:["healed"],140:["damage"],143:["executes"],147:["blocked"],148:["resource"],
};
