import { MAX_TOWER_FLOOR } from "./config";
import { getTroopStats } from "./troopCatalog";
import type {
  BossDefinition,
  BossId,
  EnemyFormationAssignment,
  FormationSlotId,
  TowerChapterDefinition,
  TowerFloorDefinition,
  TroopStats,
  TroopType,
} from "./types";

export const BOSS_FLOORS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

export const TOWER_CHAPTERS: readonly TowerChapterDefinition[] = [
  { chapter: 1, name: "Cửa Ngõ Xanh", floors: [1, 10], focus: "Nhập môn cân bằng, Tank, Heal, AoE, SPEED, Control và Rage", theme: "chapter_1", particle: "dust" },
  { chapter: 2, name: "Vành Đai Sa Mạc", floors: [11, 20], focus: "Duplicate, sustain, bunker và tốc chiến", theme: "chapter_2", particle: "sand" },
  { chapter: 3, name: "Thung Lũng Sương", floors: [21, 30], focus: "Tempo, ám sát hàng sau và target priority", theme: "chapter_3", particle: "fog" },
  { chapter: 4, name: "Vùng Độc Địa", floors: [31, 40], focus: "Debuff, Control, Anti-Heal và AoE", theme: "chapter_4", particle: "toxic" },
  { chapter: 5, name: "Pháo Đài Thép", floors: [41, 50], focus: "Tank, Reflect, Shield và bunker", theme: "chapter_5", particle: "sparks" },
  { chapter: 6, name: "Thành Phố Đổ Nát", floors: [51, 60], focus: "Heal, Shield và Anti-Sustain hybrid", theme: "chapter_6", particle: "embers" },
  { chapter: 7, name: "Căn Cứ Tuyết", floors: [61, 70], focus: "Single-target, Anti-Tank và Marksman", theme: "chapter_7", particle: "snow" },
  { chapter: 8, name: "Vùng Nhiễu Sóng", floors: [71, 80], focus: "Rage denial, Silence, Stun và Timeline disruption", theme: "chapter_8", particle: "electric" },
  { chapter: 9, name: "Biển Lửa", floors: [81, 90], focus: "Damage race, Burst, AoE và fast carry", theme: "chapter_9", particle: "ash" },
  { chapter: 10, name: "Đỉnh Tối Cao", floors: [91, 100], focus: "Hybrid endgame, counter chéo và synergy cao", theme: "chapter_10", particle: "lightning" },
] as const;

export const BOSS_BY_ID: Readonly<Record<BossId, BossDefinition>> = {
  armored_war_machine: { id: "armored_war_machine", name: "Chiến Xa Bọc Thép", icon: "🛡️", role: "Pure Tank", targetPriority: "front_first", passiveId: "armor_early_reduction", baseTroopType: "armor", hpMultiplier: 4.8, attackMultiplier: 1.55, defenseMultiplier: 1.15, speedMultiplier: 1.10 },
  firepower_fortress: { id: "firepower_fortress", name: "Pháo Đài Hỏa Lực", icon: "💥", role: "AoE Artillery", targetPriority: "back_first", passiveId: "artillery_row_blast", baseTroopType: "artillery", hpMultiplier: 11.5, attackMultiplier: 1.65, defenseMultiplier: 1.45, speedMultiplier: 1.05 },
  special_ops_ghost: { id: "special_ops_ghost", name: "Bóng Ma Đặc Nhiệm", icon: "🥷", role: "Assassin / Backline", targetPriority: "back_first", passiveId: "commando_early_crit", baseTroopType: "commando", hpMultiplier: 9.5, attackMultiplier: 1.65, defenseMultiplier: 1.50, speedMultiplier: 1.05 },
  chemical_destroyer: { id: "chemical_destroyer", name: "Kẻ Hủy Diệt Hóa Học", icon: "☣️", role: "Debuff / Control", targetPriority: "front_first", passiveId: "chemical_round_aoe", baseTroopType: "chemical", hpMultiplier: 9.5, attackMultiplier: 1.70, defenseMultiplier: 1.60, speedMultiplier: 1.10 },
  armored_commander: { id: "armored_commander", name: "Thống Lĩnh Thiết Giáp", icon: "🏯", role: "Defense / Reflect", targetPriority: "front_first", passiveId: "engineer_reflect", baseTroopType: "engineer", hpMultiplier: 5.5, attackMultiplier: 1.70, defenseMultiplier: 1.50, speedMultiplier: 1.15 },
  chief_medic: { id: "chief_medic", name: "Tổng Y Sĩ", icon: "⚕️", role: "Sustain / Heal", targetPriority: "front_first", passiveId: "medic_casualty_care", baseTroopType: "medic", hpMultiplier: 8.0, attackMultiplier: 1.60, defenseMultiplier: 1.60, speedMultiplier: 1.15 },
  ultimate_hunter: { id: "ultimate_hunter", name: "Thợ Săn Tối Thượng", icon: "🎯", role: "Single-target / Anti-Tank / Execute", targetPriority: "front_first", passiveId: "anti_tank_max_hp_hit", baseTroopType: "anti_tank", hpMultiplier: 7.5, attackMultiplier: 1.75, defenseMultiplier: 1.80, speedMultiplier: 1.15 },
  signal_overlord: { id: "signal_overlord", name: "Chúa Tể Nhiễu Sóng", icon: "📡", role: "Rage / Silence / Control", targetPriority: "front_first", passiveId: "electronic_rage_interference", baseTroopType: "electronic_warfare", hpMultiplier: 8.0, attackMultiplier: 1.70, defenseMultiplier: 1.80, speedMultiplier: 1.15 },
  annihilation_airstrike: { id: "annihilation_airstrike", name: "Không Kích Hủy Diệt", icon: "✈️", role: "High DPS / Air scaling / AoE", targetPriority: "front_first", passiveId: "air_force_attack_growth", baseTroopType: "air_force", hpMultiplier: 11.5, attackMultiplier: 1.85, defenseMultiplier: 1.90, speedMultiplier: 1.20 },
  supreme_commander: { id: "supreme_commander", name: "Tổng Chỉ Huy Tối Cao", icon: "👑", role: "Final Hybrid Commander", targetPriority: "front_first", passiveId: "air_force_attack_growth", baseTroopType: "air_force", hpMultiplier: 12.5, attackMultiplier: 2.00, defenseMultiplier: 2.10, speedMultiplier: 1.20 },
};

export const BOSS_CATALOG = BOSS_BY_ID;

interface FloorSeed { title: string; problem: string; front: readonly TroopType[]; back: readonly TroopType[]; }

const FLOOR_SEEDS: readonly FloorSeed[] = [
  { title: "Cân bằng nhập môn", problem: "Công thủ cân bằng.", front: ["infantry", "pioneer"], back: ["marksman", "medic"] },
  { title: "Tường trước - hỏa lực sau", problem: "Tuyến trước cứng, tuyến sau gây damage.", front: ["armor", "infantry"], back: ["marksman", "artillery"] },
  { title: "Tank - Hồi Máu", problem: "Giới thiệu duplicate và sustain.", front: ["armor", "infantry"], back: ["medic", "medic"] },
  { title: "Pháo kép", problem: "AoE kép.", front: ["pioneer", "guard"], back: ["artillery", "artillery"] },
  { title: "Tốc chiến", problem: "Timeline support + assassin.", front: ["infantry", "scout"], back: ["commando", "medic"] },
  { title: "Bào hồi phục", problem: "Anti-Heal/Anti-Shield.", front: ["pioneer", "forensic_medic"], back: ["marksman", "medic"] },
  { title: "Khống chế cơ bản", problem: "Control mở đường cho DPS.", front: ["pioneer", "chemical"], back: ["guard", "marksman"] },
  { title: "Bức tường phản đòn", problem: "Punish single-target.", front: ["engineer", "infantry"], back: ["guard", "artillery"] },
  { title: "Nhiễu Nộ", problem: "Anti-Ultimate + Control.", front: ["armor", "electronic_warfare"], back: ["special_ops", "marksman"] },
  { title: "BOSS - Chiến Xa Bọc Thép", problem: "Solo Boss · Phòng thủ cực cao.", front: [], back: [] },
  { title: "Song Thiết Giáp", problem: "Double tank bảo kê carry.", front: ["armor", "armor"], back: ["medic", "marksman"] },
  { title: "Song Phản Đòn", problem: "Reflect + mitigation.", front: ["engineer", "engineer"], back: ["divine_medic", "marksman"] },
  { title: "Hai tầng hồi phục", problem: "Heal + Rescue.", front: ["armor", "pioneer"], back: ["medic", "divine_medic"] },
  { title: "Săn Tank", problem: "Anti-Tank + execute + anti-sustain.", front: ["anti_tank", "infantry"], back: ["marksman", "forensic_medic"] },
  { title: "Bunker Pháo", problem: "Bunker bảo vệ double AoE.", front: ["armor", "guard"], back: ["artillery", "artillery"] },
  { title: "Đột Kích Hỗn Hợp", problem: "Tempo + burst phối hợp.", front: ["scout", "infantry"], back: ["commando", "marksman"] },
  { title: "Độc Huyết", problem: "Debuff + anti-heal.", front: ["pioneer", "forensic_medic"], back: ["chemical", "marksman"] },
  { title: "Mạng Khống Chế", problem: "Stun/Silence + Rage denial.", front: ["pioneer", "special_ops"], back: ["chemical", "electronic_warfare"] },
  { title: "Khóa Ultimate", problem: "Double Nhiễu bảo kê scaling.", front: ["electronic_warfare", "electronic_warfare"], back: ["guard", "air_force"] },
  { title: "BOSS - Pháo Đài Hỏa Lực", problem: "Solo Boss · Pháo kích áp lực lớn.", front: [], back: [] },
  { title: "Săn Hàng Sau", problem: "Tempo + backline focus.", front: ["scout", "infantry"], back: ["commando", "marksman"] },
  { title: "Không Kích Sớm", problem: "Bảo kê carry scaling.", front: ["scout", "pioneer"], back: ["air_force", "medic"] },
  { title: "Trinh Sát - Võ Sư", problem: "Timeline + đấu sĩ kỹ thuật.", front: ["scout", "martial_artist"], back: ["commando", "marksman"] },
  { title: "Cắt Hậu Tuyến", problem: "Anti-sustain + assassin.", front: ["infantry", "forensic_medic"], back: ["commando", "chemical"] },
  { title: "Bẫy Theo Dõi", problem: "Tank câu giờ cho mark.", front: ["armor", "special_ops"], back: ["commando", "marksman"] },
  { title: "Khóa Lượt", problem: "Hard CC cho scaling carry.", front: ["pioneer", "pioneer"], back: ["chemical", "air_force"] },
  { title: "Song Xạ Thủ", problem: "Reflect tank + sustained DPS.", front: ["engineer", "guard"], back: ["marksman", "marksman"] },
  { title: "Sát Thủ - Không Kích", problem: "Burst + scaling có bảo kê.", front: ["armor", "medic"], back: ["commando", "air_force"] },
  { title: "Nhịp Nhanh - Khóa Nộ", problem: "Tempo + control + scaling.", front: ["electronic_warfare", "special_ops"], back: ["scout", "air_force"] },
  { title: "BOSS - Bóng Ma Đặc Nhiệm", problem: "Solo Boss · Sát thương nhanh, săn tuyến sau.", front: [], back: [] },
  { title: "Song Hóa Học", problem: "Debuff diện rộng.", front: ["pioneer", "chemical"], back: ["chemical", "forensic_medic"] },
  { title: "Hai Đặc Nhiệm", problem: "Mark nhiều target + Silence/Stun.", front: ["special_ops", "special_ops"], back: ["electronic_warfare", "chemical"] },
  { title: "Độc Bền Bỉ", problem: "Tank/mitigation giữ debuffer sống.", front: ["armor", "divine_medic"], back: ["forensic_medic", "chemical"] },
  { title: "Reflect Nhiễm Độc", problem: "Reflect + phòng thủ + anti-heal.", front: ["engineer", "armor"], back: ["forensic_medic", "chemical"] },
  { title: "Choáng Kép", problem: "Control liên tục.", front: ["pioneer", "pioneer"], back: ["special_ops", "marksman"] },
  { title: "Khóa Nộ Độc", problem: "Rage denial + scaling.", front: ["electronic_warfare", "electronic_warfare"], back: ["chemical", "air_force"] },
  { title: "Chống Burst", problem: "Shield + Rescue + debuff.", front: ["guard", "divine_medic"], back: ["chemical", "forensic_medic"] },
  { title: "Săn Tank Nhiễm Độc", problem: "Anti-tank + execute + burst.", front: ["anti_tank", "forensic_medic"], back: ["marksman", "commando"] },
  { title: "Tốc Độc", problem: "Timeline + control + burst.", front: ["scout", "chemical"], back: ["special_ops", "commando"] },
  { title: "BOSS - Kẻ Hủy Diệt Hóa Học", problem: "Solo Boss · Bào mòn và khống chế.", front: [], back: [] },
  { title: "Song Thiết Giáp Bunker", problem: "Siêu phòng thủ.", front: ["armor", "armor"], back: ["guard", "medic"] },
  { title: "Công Binh - Tiên Phong", problem: "Reflect + bền bỉ + mitigation.", front: ["engineer", "pioneer"], back: ["guard", "divine_medic"] },
  { title: "Ba Lớp Tuyến Trước", problem: "Frontline dày, một carry.", front: ["armor", "engineer", "anti_tank"], back: ["marksman"] },
  { title: "Giáp Kép - Carry", problem: "Tank kéo dài trận cho scaling.", front: ["armor", "armor"], back: ["forensic_medic", "air_force"] },
  { title: "Pháo Sau Tường Thép", problem: "AoE sau hai tank.", front: ["engineer", "armor"], back: ["artillery", "artillery"] },
  { title: "Song Vệ Binh", problem: "Shield kép + scaling.", front: ["armor", "guard"], back: ["guard", "air_force"] },
  { title: "Hồi Phục Pháo Đài", problem: "Heal + mitigation + DPS.", front: ["armor", "divine_medic"], back: ["medic", "marksman"] },
  { title: "Reflect Khóa Hồi", problem: "Reflect + anti-sustain + control.", front: ["engineer", "forensic_medic"], back: ["special_ops", "air_force"] },
  { title: "Tường Thép Khóa Nộ", problem: "Tank dày + Rage denial.", front: ["armor", "engineer"], back: ["electronic_warfare", "marksman"] },
  { title: "BOSS - Thống Lĩnh Thiết Giáp", problem: "Solo Boss · HP/DEF cao, phản đòn.", front: [], back: [] },
  { title: "Hai Nguồn Hồi", problem: "Sustain cho carry scale.", front: ["armor", "divine_medic"], back: ["medic", "air_force"] },
  { title: "Song Quân Y", problem: "Heal spam + reflect wall.", front: ["engineer", "infantry"], back: ["medic", "medic"] },
  { title: "Song Thần Y", problem: "Mitigation kép + team heal.", front: ["pioneer", "divine_medic"], back: ["divine_medic", "air_force"] },
  { title: "Phá Sustain Chủ Động", problem: "Anti-heal + anti-Rage + double threat.", front: ["forensic_medic", "electronic_warfare"], back: ["commando", "marksman"] },
  { title: "Không Quân - Xạ Thủ", problem: "Tempo + protection + hai nguồn sát thương.", front: ["scout", "divine_medic"], back: ["air_force", "marksman"] },
  { title: "Pháo Đài Hồi Máu", problem: "Bunker kinh điển.", front: ["armor", "guard"], back: ["medic", "artillery"] },
  { title: "Phản Đòn - Chống Hồi", problem: "Reflect + mitigation + anti-heal.", front: ["engineer", "divine_medic"], back: ["forensic_medic", "marksman"] },
  { title: "Áp Chế Cứu Thương", problem: "Control + assassin + cleanse/heal.", front: ["pioneer", "special_ops"], back: ["medic", "commando"] },
  { title: "Tempo Không Kích", problem: "Timeline + anti-sustain + anti-Rage.", front: ["electronic_warfare", "forensic_medic"], back: ["scout", "air_force"] },
  { title: "BOSS - Tổng Y Sĩ", problem: "Solo Boss · Khả năng duy trì và hồi phục.", front: [], back: [] },
  { title: "Song Chống Tăng", problem: "Punish player tank-heavy.", front: ["anti_tank", "anti_tank"], back: ["infantry", "marksman"] },
  { title: "Xạ Thủ Kép Sau Giáp", problem: "Single-target focus.", front: ["armor", "anti_tank"], back: ["marksman", "marksman"] },
  { title: "Reflect Săn Tank", problem: "Anti-frontline + reflect.", front: ["engineer", "anti_tank"], back: ["forensic_medic", "marksman"] },
  { title: "Khóa Mục Tiêu", problem: "CC + anti-tank + finisher.", front: ["pioneer", "anti_tank"], back: ["special_ops", "marksman"] },
  { title: "Săn Nhanh", problem: "Tempo + two single-target threats.", front: ["scout", "anti_tank"], back: ["commando", "marksman"] },
  { title: "Bunker Song Xạ", problem: "Shielded sustained DPS.", front: ["armor", "guard"], back: ["marksman", "marksman"] },
  { title: "Reflect Song Xạ", problem: "Reflect + mitigation + carry.", front: ["engineer", "divine_medic"], back: ["marksman", "marksman"] },
  { title: "Khóa Ultimate Song Xạ", problem: "Silence/Rage denial + finisher.", front: ["special_ops", "electronic_warfare"], back: ["marksman", "marksman"] },
  { title: "Diệt Tank - Diệt Hồi", problem: "Anti-sustain + anti-tank + scaling.", front: ["forensic_medic", "chemical"], back: ["anti_tank", "air_force"] },
  { title: "BOSS - Thợ Săn Tối Thượng", problem: "Solo Boss · Săn Tank, single-target mạnh.", front: [], back: [] },
  { title: "Điện Tử - Võ Sư", problem: "Khóa Rage + đấu sĩ kỹ thuật.", front: ["electronic_warfare", "martial_artist"], back: ["special_ops", "pioneer"] },
  { title: "Nhiễu Độc", problem: "Debuff nhiều lớp.", front: ["electronic_warfare", "chemical"], back: ["special_ops", "forensic_medic"] },
  { title: "Tempo Nhiễu", problem: "Đẩy lượt mình, chậm Ultimate địch.", front: ["scout", "electronic_warfare"], back: ["commando", "air_force"] },
  { title: "Shield Nhiễu Kép", problem: "Rage denial + Shield + scaling.", front: ["guard", "electronic_warfare"], back: ["electronic_warfare", "air_force"] },
  { title: "Theo Dõi Kép", problem: "Tank câu giờ cho mark/control.", front: ["armor", "special_ops"], back: ["special_ops", "forensic_medic"] },
  { title: "Khống Chế Hóa Học", problem: "Stun + shred + anti-Rage.", front: ["pioneer", "chemical"], back: ["chemical", "electronic_warfare"] },
  { title: "Reflect Nhiễu Sustain", problem: "Punish carry + anti-sustain.", front: ["engineer", "electronic_warfare"], back: ["forensic_medic", "marksman"] },
  { title: "Trinh Sát Võ Thuật Nhiễu", problem: "Timeline + đấu sĩ + anti-Rage.", front: ["scout", "martial_artist"], back: ["electronic_warfare", "commando"] },
  { title: "Bảo Kê Nhiễu", problem: "Mitigation + control + scaling.", front: ["divine_medic", "electronic_warfare"], back: ["special_ops", "air_force"] },
  { title: "BOSS - Chúa Tể Nhiễu Sóng", problem: "Solo Boss · Khóa Nộ và kiểm soát nhịp trận.", front: [], back: [] },
  { title: "Pháo Kép Tăng Tốc", problem: "AoE race rất nhanh.", front: ["scout", "pioneer"], back: ["artillery", "artillery"] },
  { title: "Sát Thủ Kép Tăng Tốc", problem: "Burst + anti-heal.", front: ["scout", "forensic_medic"], back: ["commando", "commando"] },
  { title: "Không Quân Kép Bảo Kê", problem: "Double late carry.", front: ["guard", "medic"], back: ["air_force", "air_force"] },
  { title: "Tam Hỏa Lực", problem: "Ba nguồn DPS, rất ít phòng thủ.", front: ["scout", "marksman"], back: ["artillery", "air_force"] },
  { title: "Sát Thương Thuần", problem: "Burst + AoE + execute.", front: ["forensic_medic", "marksman"], back: ["commando", "artillery"] },
  { title: "Không Kích Võ Thuật Nhiễu", problem: "Tempo + anti-Rage + đấu sĩ/scaling.", front: ["scout", "electronic_warfare"], back: ["air_force", "martial_artist"] },
  { title: "Mưa Pháo Độc", problem: "AoE + shred + control.", front: ["pioneer", "chemical"], back: ["artillery", "artillery"] },
  { title: "Song Xạ - Sát Thủ", problem: "Single-target pressure liên tục.", front: ["scout", "commando"], back: ["marksman", "marksman"] },
  { title: "Hỏa Lực Lai Debuff", problem: "Debuff mở cửa cho two-carry.", front: ["chemical", "forensic_medic"], back: ["air_force", "commando"] },
  { title: "BOSS - Không Kích Hủy Diệt", problem: "Solo Boss · Carry tăng tiến, áp lực sát thương cao.", front: [], back: [] },
  { title: "Tường Thép - Không Kích", problem: "Tank/heal/anti-heal/scaling hybrid.", front: ["armor", "forensic_medic"], back: ["medic", "air_force"] },
  { title: "Reflect - Theo Dõi", problem: "Reflect + Shield + Control + finisher.", front: ["engineer", "guard"], back: ["special_ops", "marksman"] },
  { title: "Tempo Tối Đa", problem: "Fast carry duo + anti-Rage.", front: ["scout", "electronic_warfare"], back: ["commando", "air_force"] },
  { title: "Khống Chế Toàn Diện", problem: "Stun + Silence + shred + anti-sustain.", front: ["pioneer", "chemical"], back: ["special_ops", "forensic_medic"] },
  { title: "Chống Tank Có Bảo Kê", problem: "Tank + anti-tank + mitigation + execute.", front: ["armor", "anti_tank"], back: ["divine_medic", "marksman"] },
  { title: "Reflect Không Kích", problem: "Reflect + anti-Rage + sustain + scaling.", front: ["engineer", "electronic_warfare"], back: ["medic", "air_force"] },
  { title: "Săn Hậu Tuyến Cuối", problem: "Tempo + anti-heal + burst/execute.", front: ["scout", "forensic_medic"], back: ["marksman", "commando"] },
  { title: "Song Thiết Giáp - Pháo", problem: "Final bunker AoE.", front: ["armor", "armor"], back: ["divine_medic", "artillery"] },
  { title: "Bài Kiểm Tra Tổng Hợp", problem: "Rage denial + control + shred + scaling.", front: ["electronic_warfare", "special_ops"], back: ["chemical", "air_force"] },
  { title: "BOSS - Tổng Chỉ Huy Tối Cao", problem: "Final Solo Boss · Chỉ số toàn diện cao nhất.", front: [], back: [] },
] as const;

const BOSS_BY_FLOOR: Readonly<Record<(typeof BOSS_FLOORS)[number], BossId>> = {
  10: "armored_war_machine", 20: "firepower_fortress", 30: "special_ops_ghost", 40: "chemical_destroyer", 50: "armored_commander",
  60: "chief_medic", 70: "ultimate_hunter", 80: "signal_overlord", 90: "annihilation_airstrike", 100: "supreme_commander",
};

const BOSS_REWARDS: Readonly<Record<(typeof BOSS_FLOORS)[number], number>> = {
  10: 50, 20: 100, 30: 200, 40: 400, 50: 800, 60: 900, 70: 1000, 80: 1200, 90: 1400, 100: 1800,
};

function clampFloor(floorNumber: number): number {
  return Math.min(MAX_TOWER_FLOOR, Math.max(1, Math.floor(Number.isFinite(floorNumber) ? floorNumber : 1)));
}

export function getEnemyLevel(floorNumber: number): number {
  const floor = clampFloor(floorNumber);
  return Math.min(54, Math.max(1, Math.round(1 + ((floor - 1) * 53) / 99)));
}

export function getRecommendedLevel(floorNumber: number): number {
  const floor = clampFloor(floorNumber);
  return Math.min(54, getEnemyLevel(floor) + (isBossFloor(floor) ? 1 : 0));
}

export function getFloorStatMultiplier(_floorNumber: number): number { return 1; }

export function getFirstClearGold(floorNumber: number): number {
  const floor = clampFloor(floorNumber);
  if (isBossFloor(floor)) return BOSS_REWARDS[floor];
  if (floor <= 19) return 25;
  if (floor <= 39) return 45;
  if (floor <= 59) return 65;
  if (floor <= 79) return 85;
  return 105;
}

function rowSlots(row: "front" | "back", count: number): readonly FormationSlotId[] {
  if (count <= 1) return [`${row}_center`];
  if (count === 2) return [`${row}_left`, `${row}_right`];
  return [`${row}_left`, `${row}_center`, `${row}_right`];
}

function troopAssignments(row: "front" | "back", troopTypes: readonly TroopType[], level: number, statMultiplier: number): EnemyFormationAssignment[] {
  const slots = rowSlots(row, troopTypes.length);
  return troopTypes.map((troopType, index) => ({ slotId: slots[index], troopType, bossId: null, level, statMultiplier }));
}

function makeFloor(seed: FloorSeed, index: number): TowerFloorDefinition {
  const floorNumber = index + 1;
  const chapter = Math.ceil(floorNumber / 10);
  const enemyLevel = getEnemyLevel(floorNumber);
  const statMultiplier = getFloorStatMultiplier(floorNumber);
  const bossId = isBossFloor(floorNumber) ? BOSS_BY_FLOOR[floorNumber] : null;
  const enemyFormation: EnemyFormationAssignment[] = bossId
    ? [{ slotId: "front_center", troopType: null, bossId, level: enemyLevel, statMultiplier }]
    : [
        ...troopAssignments("front", seed.front, enemyLevel, statMultiplier),
        ...troopAssignments("back", seed.back, enemyLevel, statMultiplier),
      ];
  return {
    floorNumber, recommendedLevel: getRecommendedLevel(floorNumber), enemyLevel, statMultiplier,
    firstClearGold: getFirstClearGold(floorNumber), isBoss: Boolean(bossId), bossId, chapter,
    theme: TOWER_CHAPTERS[chapter - 1].theme, title: seed.title, archetype: seed.problem, enemyFormation,
  };
}

if (FLOOR_SEEDS.length !== MAX_TOWER_FLOOR) throw new Error(`Tower catalog has ${FLOOR_SEEDS.length} floors; expected ${MAX_TOWER_FLOOR}.`);

export const TOWER_FLOORS: readonly TowerFloorDefinition[] = FLOOR_SEEDS.map(makeFloor);
export const TOWER_FLOOR_CATALOG = TOWER_FLOORS;

export function isBossFloor(floorNumber: number): floorNumber is (typeof BOSS_FLOORS)[number] {
  return (BOSS_FLOORS as readonly number[]).includes(floorNumber);
}

export function getTowerFloor(floorNumber: number): TowerFloorDefinition | undefined {
  if (!Number.isInteger(floorNumber) || floorNumber < 1 || floorNumber > MAX_TOWER_FLOOR) return undefined;
  return TOWER_FLOORS[floorNumber - 1];
}

export function getBossDefinition(bossId: BossId): BossDefinition { return BOSS_BY_ID[bossId]; }

export function getBossStats(bossId: BossId, level: number, floorMultiplier = 1): TroopStats {
  const boss = getBossDefinition(bossId);
  const base = getTroopStats(boss.baseTroopType, level);
  const multiplier = Number.isFinite(floorMultiplier) && floorMultiplier > 0 ? floorMultiplier : 1;
  return {
    maxHp: Math.round(base.maxHp * boss.hpMultiplier * multiplier), attack: Math.round(base.attack * boss.attackMultiplier * multiplier),
    defense: Math.round(base.defense * boss.defenseMultiplier * multiplier), critChance: base.critChance,
    speed: Math.round(base.speed * boss.speedMultiplier),
  };
}
