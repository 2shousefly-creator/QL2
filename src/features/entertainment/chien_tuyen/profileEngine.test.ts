import {
  STARTER_READY_COUNTS,
  canUseEmergencyTraining,
  createAutoFormation,
  createDefaultChienTuyenProfile,
  enqueueTraining,
  quickFinishTraining,
  quickFinishBarracksUpgrade,
  recordBattleCasualty,
  recoverInterruptedBattle,
  reserveBattleUnits,
  sanitizeChienTuyenProfile,
  settleActiveBattle,
  settleExpiredJobs,
  startBarracksUpgrade,
  startTroopUpgrade,
  validateFormation,
} from "./profileEngine";
import { TROOP_TYPES, type ChienTuyenProfileV2, type FormationTemplate } from "./types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAILED: ${message}`);
}

function equal<T>(actual: T, expected: T, message: string): void {
  assert(Object.is(actual, expected), `${message}; expected ${String(expected)}, got ${String(actual)}`);
}

function totalReady(profile: ChienTuyenProfileV2): number {
  return TROOP_TYPES.reduce((sum, type) => sum + profile.readyCounts[type], 0);
}

console.log("=== CHIẾN TUYẾN V2 PROFILE TESTS ===");

const createdAt = 1_000;
const starter = createDefaultChienTuyenProfile(createdAt);
equal(starter.version, 2, "new profile is version 2");
equal(starter.barracksLevel, 1, "new Barracks starts at level 1");
equal(totalReady(starter), 6, "starter army contains exactly six units");
assert(TROOP_TYPES.every((type) => starter.troopLevels[type] === 1), "all eleven troop types are level 1 and available immediately");
assert(JSON.stringify(starter.readyCounts) === JSON.stringify(STARTER_READY_COUNTS), "starter composition is canonical 2/1/1/1/1");
equal(starter.highestUnlockedFloor, 1, "only floor 1 starts unlocked");
assert(!("gold" in starter), "profile never stores a private Gold wallet");

const migratedOld = sanitizeChienTuyenProfile({ version: 1, selectedDeckId: "legacy", selectedCommanderId: "legacy" }, 2_000);
equal(migratedOld.version, 2, "V1 migrates to V2");
equal(totalReady(migratedOld), 6, "V1 migration receives starter army rather than converting decks");
const sanitized = sanitizeChienTuyenProfile({
  ...starter,
  barracksLevel: 3,
  troopLevels: { ...starter.troopLevels, infantry: 99, armor: -5 },
  readyCounts: { ...starter.readyCounts, infantry: -9, armor: 4.8 },
  highestClearedFloor: 4,
  highestUnlockedFloor: 2,
  selectedFloor: 99,
}, 2_000);
equal(sanitized.troopLevels.infantry, 3, "troop level clamps to Barracks level");
equal(sanitized.troopLevels.armor, 1, "troop level never falls below one");
equal(sanitized.readyCounts.infantry, 0, "ready count never becomes negative");
equal(sanitized.readyCounts.armor, 4, "ready count is normalized to an integer");
equal(sanitized.highestUnlockedFloor, 5, "sequential unlock is repaired from highest clear");
equal(sanitized.selectedFloor, 5, "selected floor clamps to unlocked range");

const queued = enqueueTraining(starter, "infantry", 10_000, { jobId: "train-one" });
assert(queued.ok && queued.value, "training enqueue succeeds when a slot is free");
equal(queued.costGold, 10, "infantry training costs ten shared Gold");
equal(queued.value.completeAt, 3_610_000, "level-one infantry training takes one hour");
equal(queued.profile.readyCounts.infantry, 2, "enqueue does not award unit early");
const beforeComplete = settleExpiredJobs(queued.profile, 3_609_999);
equal(beforeComplete.profile.trainingJobs.length, 1, "offline rehydrate before timestamp keeps job active");
equal(beforeComplete.profile.readyCounts.infantry, 2, "early rehydrate does not award unit");
const afterComplete = settleExpiredJobs(queued.profile, 3_610_000);
equal(afterComplete.profile.trainingJobs.length, 0, "offline rehydrate at timestamp frees slot");
equal(afterComplete.profile.readyCounts.infantry, 3, "offline completion awards exactly one unit");
equal(afterComplete.completed.trainingJobIds[0], "train-one", "completion summary reports stable job id");
const afterCompleteAgain = settleExpiredJobs(afterComplete.profile, 99_000);
equal(afterCompleteAgain.profile.readyCounts.infantry, 3, "offline completion is idempotent");

const artilleryQueue = enqueueTraining(starter, "artillery", 20_000, { jobId: "quick-one" });
assert(artilleryQueue.ok, "artillery training enqueues");
const quick = quickFinishTraining(artilleryQueue.profile, "quick-one", 20_001);
assert(quick.ok, "quick finish finds active job");
equal(quick.costGold, 30, "one-hour training costs thirty Gold to quick-finish immediately");
equal(quick.profile.readyCounts.artillery, 2, "quick finish awards exactly one troop");
assert(!quickFinishTraining(quick.profile, "quick-one", 20_002).ok, "same job cannot quick-finish twice");

const softlocked = createDefaultChienTuyenProfile(0);
for (const type of TROOP_TYPES) softlocked.readyCounts[type] = 0;
assert(canUseEmergencyTraining(softlocked, 0), "emergency recruit appears below three total units with insufficient Gold");
assert(!canUseEmergencyTraining(softlocked, 10), "emergency recruit is hidden when cheapest troop is affordable");
const emergency = enqueueTraining(softlocked, "infantry", 50_000, { emergency: true, availableGold: 0, jobId: "emergency-one" });
assert(emergency.ok && emergency.value?.emergency, "authorized emergency infantry training starts");
equal(emergency.costGold, 0, "emergency recruit is free");
equal(emergency.value!.completeAt, 110_000, "emergency recruit takes sixty seconds");
assert(!enqueueTraining(softlocked, "guard", 50_000, { emergency: true, availableGold: 0 }).ok, "emergency cannot train a premium troop type");

const lockedUpgrade = startTroopUpgrade(starter, "infantry", 60_000);
assert(!lockedUpgrade.ok && lockedUpgrade.error === "barracks_level_required", "troop cannot exceed Barracks level");
const barracksTwo = { ...starter, barracksLevel: 2 };
const troopUpgrade = startTroopUpgrade(barracksTwo, "infantry", 60_000, { jobId: "upgrade-infantry" });
assert(troopUpgrade.ok && troopUpgrade.value, "troop upgrade starts below Barracks cap");
equal(troopUpgrade.costGold, 10, "target levels 2-8 cost ten Gold");
const troopBefore = settleExpiredJobs(troopUpgrade.profile, troopUpgrade.value.completeAt - 1);
equal(troopBefore.profile.troopLevels.infantry, 1, "troop level does not change before absolute timestamp");
const troopAfter = settleExpiredJobs(troopUpgrade.profile, troopUpgrade.value.completeAt);
equal(troopAfter.profile.troopLevels.infantry, 2, "expired troop upgrade applies once");
equal(Object.keys(troopAfter.profile.troopUpgradeJobs).length, 0, "completed troop upgrade job is removed");

assert(!startBarracksUpgrade(starter, 4, 70_000).ok, "journey level 4 cannot start Barracks 2");
const barracksUpgrade = startBarracksUpgrade(starter, 5, 70_000, { jobId: "barracks-two" });
assert(barracksUpgrade.ok && barracksUpgrade.value, "journey level 5 unlocks Barracks 2 upgrade");
const barracksQuick = quickFinishBarracksUpgrade(barracksUpgrade.profile, 70_001);
assert(barracksQuick.ok && barracksQuick.value, "active Barracks job can quick-finish");
assert(barracksQuick.costGold > 0, "Barracks quick-finish reuses the remaining-time Gold formula");
equal(barracksQuick.profile.barracksLevel, 2, "Barracks quick-finish applies the target level exactly once");
assert(barracksQuick.profile.barracksUpgradeJob === null, "Barracks quick-finish clears the active job");
assert(!quickFinishBarracksUpgrade(barracksQuick.profile, 70_002).ok, "same Barracks job cannot charge or level twice");
const barracksAfter = settleExpiredJobs(barracksUpgrade.profile, barracksUpgrade.value.completeAt);
equal(barracksAfter.profile.barracksLevel, 2, "expired Barracks job applies target level");
assert(barracksAfter.profile.barracksUpgradeJob === null, "completed Barracks job is removed");

const formation: FormationTemplate = { assignments: [
  { slotId: "front_left", troopType: "infantry" },
  { slotId: "front_center", troopType: "armor" },
  { slotId: "back_left", troopType: "artillery" },
] };
assert(validateFormation(formation, starter.readyCounts).valid, "battle formation is available");
const reserved = reserveBattleUnits(starter, 1, formation, 80_000, { battleId: "battle-one" });
assert(reserved.ok && reserved.value, "battle reserve succeeds on unlocked floor");
equal(reserved.profile.readyCounts.infantry, 1, "reserve removes infantry immediately");
equal(reserved.profile.readyCounts.armor, 0, "reserve removes armor immediately");
equal(reserved.profile.activeBattleRecovery?.deployedUnits.length, 3, "recovery snapshot records every reserved instance");
const casualtyId = reserved.value.deployedUnits.find((unit) => unit.troopType === "armor")!.instanceId;
const casualty = recordBattleCasualty(reserved.profile, casualtyId, 80_500);
assert(casualty.ok, "casualty records during battle");
equal(casualty.profile.activeBattleRecovery?.casualtyInstanceIds.length, 1, "casualty is persisted once");
const casualtyAgain = recordBattleCasualty(casualty.profile, casualtyId, 80_600);
equal(casualtyAgain.profile.activeBattleRecovery?.casualtyInstanceIds.length, 1, "duplicate casualty record is idempotent");
const defeated = settleActiveBattle(casualtyAgain.profile, "defeat", 81_000);
assert(defeated.ok && defeated.value, "defeat settles active battle");
equal(defeated.profile.readyCounts.infantry, 2, "surviving infantry returns full to count");
equal(defeated.profile.readyCounts.artillery, 1, "surviving artillery returns full to count");
equal(defeated.profile.readyCounts.armor, 0, "dead armor remains permanently lost");
equal(defeated.value.rewardGold, 0, "defeat has no reward");
assert(defeated.profile.activeBattleRecovery === null, "settlement clears recovery snapshot");
assert(!settleActiveBattle(defeated.profile, "defeat", 81_001).ok, "settlement cannot return survivors twice");

const crashReserved = reserveBattleUnits(starter, 1, formation, 90_000, { battleId: "crash-one" });
const crashCasualtyId = crashReserved.value!.deployedUnits[0].instanceId;
const crashRecorded = recordBattleCasualty(crashReserved.profile, crashCasualtyId, 90_500);
const recovered = recoverInterruptedBattle(crashRecorded.profile, 91_000);
equal(recovered.profile.readyCounts.infantry, 1, "crash recovery does not resurrect recorded casualty");
equal(recovered.profile.readyCounts.armor, 1, "crash recovery returns survivor");
equal(recovered.profile.highestClearedFloor, 0, "crash recovery grants no floor progress");
const recoveredAgain = recoverInterruptedBattle(recovered.profile, 91_001);
equal(totalReady(recoveredAgain.profile), totalReady(recovered.profile), "crash recovery cannot duplicate survivors");

const victoryReserved = reserveBattleUnits(starter, 1, formation, 100_000, { battleId: "victory-one" });
const victory = settleActiveBattle(victoryReserved.profile, "victory", 101_000);
assert(victory.ok && victory.value?.firstClear, "first victory marks first clear");
equal(victory.value!.rewardGold, 25, "floor 1 first clear returns the configured shared-Gold credit request");
equal(victory.profile.highestClearedFloor, 1, "victory clears current floor");
equal(victory.profile.highestUnlockedFloor, 2, "victory unlocks next floor");
const replayReserved = reserveBattleUnits(victory.profile, 1, formation, 102_000, { battleId: "replay-one" });
const replay = settleActiveBattle(replayReserved.profile, "victory", 103_000);
equal(replay.value!.rewardGold, 0, "replay of claimed floor cannot farm Gold");
assert(!replay.value!.firstClear, "replay is not first clear");

const auto = createAutoFormation(starter.readyCounts, null);
assert(validateFormation(auto, starter.readyCounts).valid, "timeout auto-deploy produces a legal available formation");
assert(auto.assignments.length > 0 && auto.assignments.length <= 4, "timeout never auto-loses with an available army");
equal(new Set(auto.assignments.map((entry) => entry.troopType)).size, auto.assignments.length, "auto-deploy never duplicates a troop type");


const fourUnitFormation: FormationTemplate = { assignments: [
  { slotId: "front_left", troopType: "infantry" },
  { slotId: "front_center", troopType: "armor" },
  { slotId: "back_left", troopType: "artillery" },
  { slotId: "back_center", troopType: "medic" },
] };
assert(validateFormation(fourUnitFormation, { infantry: 2, armor: 2, artillery: 2, medic: 2 }).valid, "formation accepts four units");
const fiveUnitFormation: FormationTemplate = { assignments: [...fourUnitFormation.assignments, { slotId: "front_right", troopType: "guard" }] };
assert(!validateFormation(fiveUnitFormation).valid, "formation rejects five units after the update");

const oldV2 = JSON.parse(JSON.stringify(starter)) as Record<string, any>;
delete oldV2.troopLevels.pioneer;
delete oldV2.readyCounts.pioneer;
oldV2.highestClearedFloor = 7;
oldV2.barracksLevel = 3;
const oldV2Loaded = sanitizeChienTuyenProfile(oldV2, 120_000);
equal(oldV2Loaded.troopLevels.pioneer, 1, "old V2 profile gains Pioneer level one");
equal(oldV2Loaded.readyCounts.pioneer, 0, "old V2 profile gains zero ready Pioneer");
equal(oldV2Loaded.highestClearedFloor, 7, "old V2 migration preserves tower progress");
equal(oldV2Loaded.barracksLevel, 3, "old V2 migration preserves Barracks progress");

const legacyRecoveryRaw = JSON.parse(JSON.stringify(starter)) as Record<string, any>;
for (const type of TROOP_TYPES) legacyRecoveryRaw.readyCounts[type] = 0;
legacyRecoveryRaw.activeBattleRecovery = {
  battleId: "legacy-five", floorNumber: 1, startedAt: 1, status: "active", casualtyInstanceIds: [],
  formation: { assignments: [
    { instanceId: "legacy-1", slotId: "front_left", troopType: "infantry" },
    { instanceId: "legacy-2", slotId: "front_center", troopType: "armor" },
    { instanceId: "legacy-3", slotId: "front_right", troopType: "guard" },
    { instanceId: "legacy-4", slotId: "back_left", troopType: "artillery" },
    { instanceId: "legacy-5", slotId: "back_center", troopType: "medic" },
  ] },
  deployedUnits: [
    { instanceId: "legacy-1", slotId: "front_left", troopType: "infantry", level: 1 },
    { instanceId: "legacy-2", slotId: "front_center", troopType: "armor", level: 1 },
    { instanceId: "legacy-3", slotId: "front_right", troopType: "guard", level: 1 },
    { instanceId: "legacy-4", slotId: "back_left", troopType: "artillery", level: 1 },
    { instanceId: "legacy-5", slotId: "back_center", troopType: "medic", level: 1 },
  ],
};
const legacyLoaded = sanitizeChienTuyenProfile(legacyRecoveryRaw, 130_000);
equal(legacyLoaded.activeBattleRecovery?.deployedUnits.length, 5, "profile migration preserves legacy five-unit recovery");
equal(legacyLoaded.activeBattleRecovery?.formation.assignments.length, 4, "legacy recovery display formation is sanitized to four");
const legacyRecovered = recoverInterruptedBattle(legacyLoaded, 131_000);
equal(totalReady(legacyRecovered.profile), 5, "legacy recovery returns all five historical survivors without loss");

console.log("CHIẾN TUYẾN V2 PROFILE TESTS PASSED");
