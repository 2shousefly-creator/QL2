import {
  BASE_CRIT_CHANCE,
  CRIT_DAMAGE_MULTIPLIER,
  FORMATION_SLOT_DEFINITIONS,
  applyDefenseFormula,
  getBattlePressureMultiplier,
  getMaxBarracksLevel,
  getMaxBarracksLevelFromRankIndex,
  getQuickFinishCost,
  getRequiredRankIndexForBarracksLevel,
  getTrainingSlotCount,
} from "./config";
import { validateFormation } from "./profileEngine";
import { hashMatchSeed, nextSeededRandom, shuffleSeeded, sortWithSeededTies } from "./rng";
import { creditSharedGold, getSharedGold, setSharedGold, spendSharedGold } from "./sharedGold";
import { getTroopStatRatio, type DisplayStatKey } from "./statDisplay";
import {
  LEGACY_CHIEN_TUYEN_STORAGE_KEY,
  clearLegacyChienTuyenProfile,
  createProfileFromLegacyStorage,
  hasLegacyChienTuyenProfile,
  readLegacyChienTuyenProfile,
} from "./storage";
import { TROOP_BY_TYPE, TROOP_CATALOG_LIST, getTroopStats } from "./troopCatalog";
import { FORMATION_SLOTS, TROOP_TYPES, type FormationTemplate } from "./types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAILED: ${message}`);
}

function equal<T>(actual: T, expected: T, message: string): void {
  assert(Object.is(actual, expected), `${message}; expected ${String(expected)}, got ${String(actual)}`);
}

console.log("=== CHIẾN TUYẾN V2 DOMAIN TESTS ===");

equal(BASE_CRIT_CHANCE, 0.25, "central base Crit chance is 25 percent");
equal(CRIT_DAMAGE_MULTIPLIER, 1.9, "central Crit Damage multiplier is 190 percent total damage");

equal(TROOP_TYPES.length, 18, "exactly eighteen canonical troop types");
equal(TROOP_CATALOG_LIST.length, 18, "catalog contains each troop once");
assert(TROOP_TYPES.every((type) => TROOP_BY_TYPE[type].id === type), "catalog is complete and keyed canonically");

const canonicalLevelOne = {
  infantry: [1050, 115, 38, 0.25, 44],
  artillery: [780, 125, 17, 0.25, 48],
  armor: [1500, 40, 80, 0.25, 30],
  commando: [800, 150, 30, 0.25, 76],
  medic: [900, 30, 16, 0.25, 50],
  anti_tank: [1100, 109, 40, 0.25, 42],
  engineer: [1500, 38, 45, 0.25, 32],
  chemical: [900, 102, 34, 0.25, 42],
  air_force: [850, 121, 19, 0.25, 66],
  guard: [1000, 25, 24, 0.25, 34],
  pioneer: [1150, 75, 48, 0.25, 40],
  scout: [1000, 87, 40, 0.25, 68],
  marksman: [810, 130, 19, 0.25, 38],
  electronic_warfare: [990, 119, 46, 0.25, 47],
  special_ops: [1303, 51, 64, 0.25, 35],
  divine_medic: [890, 32, 16, 0.25, 39],
  forensic_medic: [1090, 56, 40, 0.25, 58],
  martial_artist: [1050, 100, 40, 0.25, 54],
} as const;
for (const troopType of TROOP_TYPES) {
  const stats = getTroopStats(troopType, 1);
  const expected = canonicalLevelOne[troopType];
  assert(
    [stats.maxHp, stats.attack, stats.defense, stats.critChance, stats.speed].every((value, index) => value === expected[index]),
    `${troopType} has canonical level-one stats`
  );
  const maxStats = getTroopStats(troopType, 54);
  const definition = TROOP_BY_TYPE[troopType];
  equal(maxStats.maxHp, stats.maxHp + definition.growth.maxHp * 53, `${troopType} fixed HP growth`);
  equal(maxStats.attack, stats.attack + definition.growth.attack * 53, `${troopType} fixed ATK growth`);
  equal(maxStats.defense, stats.defense + definition.growth.defense * 53, `${troopType} fixed DEF growth`);
  equal(maxStats.critChance, stats.critChance, `${troopType} Crit does not grow`);
  equal(maxStats.speed, stats.speed, `${troopType} Speed does not grow`);
}

const canonicalGrowth = {
  infantry: [52, 7, 1.5],
  artillery: [35, 8, 1],
  armor: [65, 1, 2],
  commando: [39, 10, 1],
  medic: [47, 1, 1],
  anti_tank: [49, 7, 1],
  engineer: [78, 1, 1.5],
  chemical: [41, 7, 1],
  air_force: [37, 9, 1],
  guard: [52, 1, 1.5],
  pioneer: [53, 3, 2],
  scout: [50, 4, 1],
  marksman: [37, 9, 1],
  electronic_warfare: [51, 7, 1],
  special_ops: [61, 1, 2],
  divine_medic: [47, 1, 1],
  forensic_medic: [54, 4, 1],
  martial_artist: [51, 6, 1.5],
} as const;
const canonicalRoles = {
  infantry: "Đấu sĩ cân bằng · Công thủ toàn diện",
  artillery: "Pháo kích diện rộng · Hỏa lực cao",
  armor: "Tank thuần · Cực kỳ cứng cáp",
  anti_tank: "Xuyên phá tanker · Khắc chế mục tiêu nhiều HP",
  engineer: "Tank phản đòn · Máu cực cao",
  medic: "Hồi phục · Thanh tẩy hiệu ứng xấu",
  commando: "Ám sát hàng sau · Sốc sát thương",
  guard: "Bảo hộ · Tạo Khiên cho đồng đội",
  air_force: "Carry cuối trận · Càng đánh càng mạnh",
  pioneer: "Đấu sĩ khống chế · Làm gián đoạn kẻ địch",
  chemical: "Debuff diện rộng · Bào mòn và gây Choáng",
  scout: "Hỗ trợ Timeline · Đẩy lượt đồng minh",
  marksman: "DPS đơn mục tiêu · Kết liễu",
  electronic_warfare: "Chống Nộ · Làm chậm Ultimate",
  special_ops: "Đánh dấu · Câm Lặng / Choáng",
  divine_medic: "Giảm sát thương · Hồi máu toàn đội",
  forensic_medic: "Giảm hồi máu · Giảm Khiên",
  martial_artist: "Đấu sĩ kỹ thuật · Đỡ Đòn và Phá Buff",
} as const;
for (const troopType of TROOP_TYPES) {
  const growth = TROOP_BY_TYPE[troopType].growth;
  const expected = canonicalGrowth[troopType];
  equal(growth.maxHp, expected[0], `${troopType} HP growth`);
  equal(growth.attack, expected[1], `${troopType} ATK growth`);
  equal(growth.defense, expected[2], `${troopType} DEF growth`);
  equal(TROOP_BY_TYPE[troopType].role, canonicalRoles[troopType], `${troopType} role copy`);
}

const airLevelTwo = getTroopStats("air_force", 2);
equal(airLevelTwo.maxHp, 887, "Air Force level-two HP");
equal(airLevelTwo.attack, 130, "Air Force level-two ATK");
equal(airLevelTwo.defense, 20, "Air Force level-two DEF");
equal(airLevelTwo.critChance, 0.25, "Air Force level-two Crit");
equal(airLevelTwo.speed, 66, "Air Force level-two Speed");
equal(TROOP_BY_TYPE.air_force.targetPriority, "front_first", "Air Force prioritizes front row");
equal(TROOP_BY_TYPE.marksman.targetPriority, "front_first", "Marksman prioritizes front row");
equal(TROOP_BY_TYPE.infantry.passive.id, "infantry_missing_hp_damage", "Infantry old stacking passive is fully replaced");
equal(TROOP_BY_TYPE.air_force.passive.id, "air_force_attack_growth", "Air Force old damage multiplier passive is fully replaced");
equal(Number(TROOP_BY_TYPE.chemical.passive.parameters.currentAttackRatio), 0.15, "Chemical catalog AoE ratio is fifteen percent");
equal(Number(TROOP_BY_TYPE.chemical.passive.parameters.defenseReductionPerStack), 0.05, "Chemical catalog corrosion is five percent per stack");

const displayStatKeys: readonly DisplayStatKey[] = ["maxHp", "attack", "defense", "critChance", "speed"];
assert(
  TROOP_TYPES.every((troopType) => displayStatKeys.every((key) => getTroopStatRatio(troopType, 1, key) >= 0 && getTroopStatRatio(troopType, 1, key) <= 1)),
  "all stat bars stay within their normalized range"
);
equal(getTroopStatRatio("commando", 1, "speed"), 1, "SPEED 76 is the clear roster maximum");
assert(getTroopStatRatio("armor", 1, "attack") < 0.35, "pure-tank ATK bar stays intentionally short");
equal(getRequiredRankIndexForBarracksLevel(1), 0, "barracks level one starts at the first rank");
equal(getRequiredRankIndexForBarracksLevel(2), 4, "barracks level two requires the fifth rank step");
equal(getRequiredRankIndexForBarracksLevel(54), 212, "barracks level fifty-four starts at rank index 212");

equal(FORMATION_SLOTS.length, 6, "formation has exactly six slots");
equal(FORMATION_SLOT_DEFINITIONS.filter((slot) => slot.row === "front").length, 3, "formation has three front slots");
equal(FORMATION_SLOT_DEFINITIONS.filter((slot) => slot.row === "back").length, 3, "formation has three back slots");
const legalFormation: FormationTemplate = { assignments: [
  { slotId: "front_left", troopType: "armor" },
  { slotId: "front_center", troopType: "guard" },
  { slotId: "back_left", troopType: "artillery" },
  { slotId: "back_center", troopType: "medic" },
] };
assert(validateFormation(legalFormation, { armor: 1, guard: 1, artillery: 1, medic: 1 }).valid, "one-to-four unique troop types are legal");
assert(!validateFormation({ assignments: [...legalFormation.assignments, { slotId: "front_right", troopType: "guard" }] }).valid, "five deployed troops are illegal");
assert(!validateFormation({ assignments: [
  { slotId: "front_left", troopType: "armor" },
  { slotId: "front_center", troopType: "armor" },
] }).valid, "two of the same troop type are illegal");
assert(!validateFormation({ assignments: [
  { slotId: "front_left", troopType: "armor" },
  { slotId: "front_left", troopType: "guard" },
] }).valid, "duplicate formation slots are illegal");

equal(getMaxBarracksLevel(1), 1, "journey level 1 unlocks Barracks 1");
equal(getMaxBarracksLevel(4), 1, "journey level 4 still unlocks Barracks 1");
equal(getMaxBarracksLevel(5), 2, "journey level 5 unlocks Barracks 2");
equal(getMaxBarracksLevel(216), 54, "journey level 216 unlocks Barracks 54");
equal(getMaxBarracksLevelFromRankIndex(215), 54, "zero-based final rank index maps to Barracks 54");
equal(getTrainingSlotCount(1), 5, "Barracks 1 has five slots");
equal(getTrainingSlotCount(4), 6, "Barracks 4 has six slots");
equal(getTrainingSlotCount(7), 7, "Barracks 7 has seven slots");
equal(getTrainingSlotCount(22), 12, "Barracks 22 has twelve slots");
equal(getTrainingSlotCount(54), 12, "training slots cap at twelve through Barracks 54");
equal(getQuickFinishCost(1), 1, "quick finish minimum is one Gold");
equal(getQuickFinishCost(120_001), 2, "quick finish rounds remaining seconds upward");
equal(getQuickFinishCost(999_999_999), 500, "quick finish caps at five hundred Gold");

equal(getBattlePressureMultiplier(10), 1, "round 10 has no pressure");
equal(getBattlePressureMultiplier(11), 1.05, "round 11 has five percent pressure");
equal(getBattlePressureMultiplier(20), 1.5, "round 20 has fifty percent pressure");
equal(getBattlePressureMultiplier(30), 2, "round 30 has one hundred percent pressure");
equal(applyDefenseFormula(100, 100), 50, "positive DEF uses LoL mitigation branch");
equal(applyDefenseFormula(100, -100), 150, "negative DEF uses LoL amplification branch");

const wallet = { farm: undefined } as Parameters<typeof getSharedGold>[0];
equal(getSharedGold(wallet), 0, "missing farm reads as zero Gold");
equal(setSharedGold(wallet, 7.9), 7, "set Gold normalizes to a nonnegative integer");
equal(wallet.farm?.gold, 7, "set writes the canonical farm Gold balance");
assert(spendSharedGold(wallet, 5), "valid debit succeeds");
equal(getSharedGold(wallet), 2, "debit is applied exactly once");
assert(!spendSharedGold(wallet, 3), "overspend is rejected");
equal(getSharedGold(wallet), 2, "rejected debit never makes Gold negative");
equal(creditSharedGold(wallet, 4), 6, "credit applies once");
equal(wallet.farm?.gold, 6, "credit leaves one canonical Gold field");

const legacyValues = new Map<string, string>([[LEGACY_CHIEN_TUYEN_STORAGE_KEY, JSON.stringify({ version: 1, selectedDeckId: "old" })]]);
const legacyStorage = {
  getItem: (key: string) => legacyValues.get(key) ?? null,
  removeItem: (key: string) => { legacyValues.delete(key); },
};
assert(hasLegacyChienTuyenProfile(legacyStorage), "legacy V1 key can be detected without becoming V2 source-of-truth");
assert((readLegacyChienTuyenProfile(legacyStorage) as { version: number }).version === 1, "legacy profile can be inspected for compatibility");
equal(createProfileFromLegacyStorage(123, legacyStorage)?.version, 2, "legacy key maps to a fresh V2 starter profile");
assert(clearLegacyChienTuyenProfile(legacyStorage), "legacy key can be cleared after repository migration");
assert(!hasLegacyChienTuyenProfile(legacyStorage), "legacy cleanup is idempotent and scoped to its own key");

const seed = hashMatchSeed("fixed-seed");
const rollA = nextSeededRandom(seed);
const rollB = nextSeededRandom(seed);
equal(rollA.value, rollB.value, "seeded roll is deterministic");
assert(JSON.stringify(shuffleSeeded([1, 2, 3, 4], seed)) === JSON.stringify(shuffleSeeded([1, 2, 3, 4], seed)), "seeded shuffle is deterministic");
const tied = sortWithSeededTies([{ id: "a", speed: 50 }, { id: "b", speed: 50 }, { id: "c", speed: 40 }], (item) => item.speed, seed);
equal(tied.values[2].id, "c", "seeded tie shuffle preserves descending score groups");

console.log("CHIẾN TUYẾN V2 DOMAIN TESTS PASSED");
