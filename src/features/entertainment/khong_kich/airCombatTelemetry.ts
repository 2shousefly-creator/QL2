import type { AircraftCombatState } from "./airCombatTypes";

export const BOUNTY_REWARDS = [
  {key:"firepowerFlat",amount:8,label:"Hỏa Lực"}, {key:"armorFlat",amount:8,label:"Giáp"},
  {key:"maxHpFlat",amount:35,label:"Máu Tối Đa"}, {key:"cooldownReduction",amount:.03,label:"Giảm Hồi Chiêu",percent:true},
  {key:"hpRegen",amount:.3,label:"Hồi Máu mỗi giây"}, {key:"criticalChanceFlat",amount:.03,label:"Tỷ Lệ Chí Mạng",percent:true},
  {key:"criticalDamageMultiplierFlat",amount:.06,label:"Sát Thương Chí Mạng",percent:true}, {key:"fireRateFlat",amount:.12,label:"Tốc Độ Bắn"},
] as const;
export const CORE_METRIC_LABELS = {
  debtPaid:"Nợ hồi chiêu đã trả (giây)",
  granted:"Token đã nhận", spent:"Token đã dùng", discarded:"Token bỏ do đầy kho", peak:"Giá trị cao nhất",
  remembered:"ID đã ghi nhớ", alternatives:"Reroll tìm được Hệ khác", skipped:"Ứng viên cùng Hệ đã bỏ qua", rerolls:"Reroll ô thứ 4", picks:"Lần chọn ô đặc biệt", guaranteed:"Ô bảo đảm đã tạo", fallbacks:"Lần hết ứng viên Hệ",
  silverRolls:"Lượt Bạc", goldRolls:"Lượt Vàng", diamondRolls:"Lượt Kim Cương", smallRolls:"Lần Thu Nhỏ", giantRolls:"Lần Khổng Lồ",
  smallTime:"Thời gian Thu Nhỏ (giây)", giantTime:"Thời gian Khổng Lồ (giây)", firepowerTime:"Thời gian Hỏa Lực (giây)", regenTime:"Thời gian Hồi Phục (giây)", fireRateTime:"Thời gian Tốc Bắn (giây)", armorTime:"Thời gian Giáp (giây)", shieldTime:"Thời gian Khiên (giây)",
  heatCast:"Nhiệt từ cast", heatToggle:"Nhiệt từ kỹ năng bật/tắt", heatBasic:"Nhiệt từ bắn thường", overheats:"Lần Quá Nhiệt", overheatTime:"Thời gian Quá Nhiệt (giây)", endedSkills:"Kỹ năng buộc kết thúc",
  accumulated:"Sát thương đã tích lũy", detonations:"Lần nổ thường", earlyDetonations:"Lần nổ kết liễu sớm", hpPaid:"HP đã trả", damageStored:"Sát thương đã tích trữ", debtCleared:"Nợ sát thương đã xóa", extraDamage:"Sát thương nhận thêm", extraResource:"Tài nguyên đã trả thêm", stacks:"Cộng dồn đã nhận", consumed:"Lần tiêu hao", shieldBreaks:"Khiên địch đã phá", shieldBonus:"Sát thương khiên cộng thêm", extraPierce:"Hit xuyên bổ sung", extraPierceDamage:"Sát thương xuyên bổ sung", gunPhases:"Pha Súng tạo", skillPhases:"Pha Kỹ Năng tạo", returned:"Khiên hồi quy thành công",

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
  46:["procs"],47:["procs"],48:["procs"],49:["uptime"],59:["shots","bonusDamage"],60:["shots","bonusDamage"],61:["procs","uptime","prevented"],63:["uptime"],66:["stacks","uptime","bonusDamage"],71:["procs","uptime"],75:["stacks","uptime"],91:["uptime","bonusDamage"],96:["hpPaid"],100:["firepowerTime","armorTime","regenTime"],109:["hits","prevented"],113:["procs","extraCooldown","debtPaid"],114:["shots","bonusDamage"],116:["procs","uptime","bonusDamage"],130:["stacks"],
  168:["procs","hits","damage"],169:["firepowerTime","regenTime","fireRateTime"],170:["procs","uptime","prevented"],171:["procs","prevented"],172:["procs","consumed","resource","saved"],173:["procs","healed"],174:["procs","resource"],175:["procs","uptime","bonusDamage"],176:["uptime","healed"],177:["hits","prevented"],178:["targets","uptime"],179:["stacks","peak","consumed"],180:["shieldBreaks","shieldBonus","bonusDamage"],181:["procs","uptime","resource"],182:["procs","resource"],183:["uptime","peak","armorTime","shieldTime"],184:["procs","prevented","controlBlocked"],185:["marks","consumed","bonusDamage"],186:["procs","uptime","bonusDamage"],187:["damageStored","procs","damage","peak"],189:["launched","hits","damage"],190:["bonusDamage","extraResource"],191:["procs","firepowerTime","fireRateTime","bonusDamage"],192:["shieldTime","armorTime","bonusDamage","prevented"],193:["procs","cooldown","resource"],194:["procs","targets","bonusDamage"],195:["procs","healed"],196:["procs"],197:["accumulated","debtCleared","healed","peak"],198:["granted","blocked","shots","damage","hits"],199:["procs","detonations","bonusDamage","damage"],200:["shieldCreated","shieldAbsorbed","detonations","damage"],202:["bonusDamage","saved","cooldown"],203:["uptime","bonusDamage","prevented","controlBlocked"],204:["returned","shieldCreated","shieldAbsorbed"],205:["bonusDamage","extraDamage"],206:["bonusDamage","extraPierce","extraPierceDamage"],207:["gunPhases","skillPhases","consumed","bonusDamage"],208:["healed","resource"],209:["procs","uptime","prevented","resource","cooldown"],
  211:["procs","alternatives","skipped"],212:["granted","spent","converted"],213:["remembered","blocked"],214:["procs","picks","rerolls"],215:["guaranteed","picks","fallbacks"],216:["converted","rewards"],217:["silverRolls","goldRolls","diamondRolls"],218:["granted","spent","discarded","peak"],219:["heatCast","heatToggle","heatBasic","uptime","bonusDamage","overheats","overheatTime","endedSkills"],220:["procs","uptime","shots","hits","damage"],221:["marks","accumulated","detonations","earlyDetonations","executes","damage","cooldown"],222:["smallRolls","giantRolls","smallTime","giantTime","resource","cooldown"],
  150:["blocked"],151:["bonusDamage"],152:["resource"],153:["bonusDamage"],154:["cooldown"],155:["procs","bonusDamage"],
  156:["chargeSaved"],157:["bonusDamage"],158:["bonusDamage"],159:["procs","bonusDamage"],160:["hits"],161:["saved"],
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
