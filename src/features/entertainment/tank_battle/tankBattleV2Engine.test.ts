import { LANE_Y, TANK_V2_DISPLAY, TANK_V2_MAP } from "./tankBattleV2Config";
import {
  applyCombatXp,
  calculatePhysicalDamage,
  createCoreChoice,
  getAiSpawnStats,
  makeLaneWaypoints,
  resolveFourWayDirection,
  totalXpToLevel18,
  updateStructureImmunity,
} from "./tankBattleV2Engine";
import {
  createTankBattleV2World,
  setTankV2Direction,
  updateTankBattleV2World,
} from "./tankBattleV2Runtime";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`✓ ${message}`);
}

function randomSequence(values: number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length] ?? 0.1;
}

console.log("=== TANK BATTLE V2 TESTS ===");

assert(resolveFourWayDirection(50, 20, 58) === "right", "dominant horizontal drag resolves right");
assert(resolveFourWayDirection(-50, 20, 58) === "left", "dominant horizontal drag resolves left");
assert(resolveFourWayDirection(20, -50, 58) === "up", "dominant vertical drag resolves up");
assert(resolveFourWayDirection(20, 50, 58) === "down", "dominant vertical drag resolves down");
assert(resolveFourWayDirection(4, 4, 58) === null, "joystick dead zone returns neutral");

assert(TANK_V2_MAP.width === 1440 && TANK_V2_MAP.height === 720, "logical map is landscape for vertical portrait rotation");
assert(TANK_V2_DISPLAY.mapWidth === 720 && TANK_V2_DISPLAY.mapHeight === 1440, "display map remains 720x1440 portrait");
assert(LANE_Y.top < LANE_Y.mid && LANE_Y.mid < LANE_Y.bottom, "three lane centerlines are distinct");
for (const lane of ["top", "mid", "bottom"] as const) {
  const allyPath = makeLaneWaypoints(lane, "ally");
  assert(allyPath.every((point) => point.y === LANE_Y[lane]), `${lane} lane keeps one dedicated logical track`);
  assert(allyPath[allyPath.length - 1].x > allyPath[0].x, `${lane} allied path advances toward enemy HQ`);
}

assert(Math.abs(calculatePhysicalDamage(100, 70) - 58.8235) < 0.01, "positive DEF uses LoL resistance formula");
assert(calculatePhysicalDamage(100, -20) > 100, "negative DEF increases physical damage");

const zeroStats = getAiSpawnStats(0);
assert(zeroStats.hp === 300 && zeroStats.atk === 40 && zeroStats.def === 30, "AI 00:00 snapshot is 300/40/30");
const maxStats = getAiSpawnStats(600);
assert(maxStats.hp === 1500 && maxStats.atk === 100 && maxStats.def === 70, "AI 10:00 snapshot caps at 1500/100/70");
assert(JSON.stringify(getAiSpawnStats(900)) === JSON.stringify(maxStats), "AI scaling does not exceed 10-minute cap");
assert(totalXpToLevel18() === 2380, "XP curve totals 2380 XP to Lv18");

const world = createTankBattleV2World(randomSequence([0.1, 0.3, 0.7, 0.9]));
assert(world.waveIndex === 1, "wave 1 spawns immediately at 00:00");
assert(world.units.filter((unit) => unit.faction === "ally").length === 9, "first wave spawns 9 allied tanks");
assert(world.units.filter((unit) => unit.faction === "enemy").length === 9, "first wave spawns 9 enemy tanks");

const laneCenters: number[] = [];
for (const lane of ["top", "mid", "bottom"] as const) {
  const laneUnits = world.units.filter((unit) => unit.faction === "ally" && unit.lane === lane);
  assert(laneUnits.length === 3, `${lane} lane receives 3 allied tanks`);
  assert(new Set(laneUnits.map((unit) => `${unit.x}:${unit.y}`)).size === 3, `${lane} lane spawn slots do not overlap`);
  const center = laneUnits.reduce((sum, unit) => sum + unit.y, 0) / laneUnits.length;
  laneCenters.push(center);
  assert(Math.abs(center - LANE_Y[lane]) < 0.001, `${lane} squad spawns around its own lane center`);
}
assert(new Set(laneCenters).size === 3, "allied first wave is distributed across three separate lanes");

const movementWorld = createTankBattleV2World(() => 0.2);
const startX = movementWorld.player.x;
const startY = movementWorld.player.y;
setTankV2Direction(movementWorld, "right");
updateTankBattleV2World(movementWorld, 1 / 30);
assert(movementWorld.player.x > startX && movementWorld.player.y === startY, "player can move immediately from spawn without being collision-locked");
setTankV2Direction(movementWorld, null);
const stoppedX = movementWorld.player.x;
updateTankBattleV2World(movementWorld, 1 / 30);
assert(movementWorld.player.x === stoppedX, "releasing joystick stops player immediately");

const t1 = world.structures.find((structure) => structure.id === "enemy-mid-t1")!;
const t2 = world.structures.find((structure) => structure.id === "enemy-mid-t2")!;
const t3 = world.structures.find((structure) => structure.id === "enemy-mid-t3")!;
assert(!t1.immune && t2.immune && t3.immune, "tower chain starts T1 vulnerable, T2/T3 immune");
t1.alive = false;
updateStructureImmunity(world.structures);
assert(!t2.immune && t3.immune, "destroying T1 unlocks T2 only");
t2.alive = false;
updateStructureImmunity(world.structures);
assert(!t3.immune, "destroying T2 unlocks T3");
t3.alive = false;
updateStructureImmunity(world.structures);
assert(!world.structures.find((structure) => structure.id === "enemy-hq")!.immune, "destroying any T3 unlocks HQ");

const levelWorld = createTankBattleV2World(() => 0.1);
const player = levelWorld.player;
const coreMilestones = applyCombatXp(player, 2380);
assert(player.level === 18, "player hard caps at Lv18");
assert(player.stats.maxHp === 1620 && player.stats.atk === 118 && player.stats.def === 81, "Lv18 fixed-value base stats equal 1620/118/81");
assert(coreMilestones.join(",") === "3,6,9,12,15,18", "all six Core milestones trigger from XP overflow");

const coreWorld = createTankBattleV2World(randomSequence([0.6, 0.1, 0.3, 0.7, 0.9]));
const choice = createCoreChoice(coreWorld.player, randomSequence([0.6, 0.1, 0.3, 0.7, 0.9]));
assert(choice.choices.length === 3, "Core selection returns exactly three choices");
assert(choice.choices.every((core) => core.rarity === choice.rarity), "all three Core cards share one rolled rarity");
assert(new Set(choice.choices.map((core) => core.id)).size === 3, "Core choice IDs are unique within a selection");

const sixthGoldWorld = createTankBattleV2World(() => 0.6);
sixthGoldWorld.player.selectedCoreIds = ["piercing_round", "reactive_armor", "military_turbo", "siege_round", "charge_shield"];
const sixthGold = createCoreChoice(sixthGoldWorld.player, () => 0.6);
assert(sixthGold.rarity === "gold" && sixthGold.choices.length === 3, "sixth consecutive Gold roll still has three eligible cards");
assert(sixthGold.choices.every((core) => !sixthGoldWorld.player.selectedCoreIds.includes(core.id)), "Gold unique Core never reappears after ownership");

const sixthDiamondWorld = createTankBattleV2World(() => 0.95);
sixthDiamondWorld.player.selectedCoreIds = ["dual_cannon", "explosive_warhead", "mobile_fortress", "overdrive", "battle_regeneration"];
const sixthDiamond = createCoreChoice(sixthDiamondWorld.player, () => 0.95);
assert(sixthDiamond.rarity === "diamond" && sixthDiamond.choices.length === 3, "sixth consecutive Diamond roll still has three eligible cards");
assert(sixthDiamond.choices.every((core) => !sixthDiamondWorld.player.selectedCoreIds.includes(core.id)), "Diamond unique Core never reappears after ownership");

const respawnWorld = createTankBattleV2World(() => 0.2);
respawnWorld.player.level = 6;
respawnWorld.player.xp = 42;
respawnWorld.player.selectedCoreIds = ["reinforced_barrel"];
respawnWorld.player.alive = false;
respawnWorld.player.hp = 0;
respawnWorld.player.respawnRemaining = 0.02;
updateTankBattleV2World(respawnWorld, 1 / 30);
assert(respawnWorld.player.alive && respawnWorld.player.hp === respawnWorld.player.stats.maxHp, "respawn restores full HP");
assert(respawnWorld.player.level === 6 && respawnWorld.player.xp === 42 && respawnWorld.player.selectedCoreIds[0] === "reinforced_barrel", "respawn preserves Level, XP and Core");
assert(respawnWorld.player.spawnProtectionRemaining > 1.9, "respawn grants about 2 seconds protection");

const waveWorld = createTankBattleV2World(() => 0.2);
waveWorld.units = [];
waveWorld.elapsedSeconds = 29.99;
waveWorld.nextWaveAt = 30;
updateTankBattleV2World(waveWorld, 1 / 30);
assert(waveWorld.waveIndex === 2, "next synchronized wave spawns at 30 seconds");
assert(waveWorld.units.filter((unit) => unit.faction === "ally").length === 9, "30-second wave again spawns 9 allied units");

console.log("Tank Battle V2 tests passed.");
