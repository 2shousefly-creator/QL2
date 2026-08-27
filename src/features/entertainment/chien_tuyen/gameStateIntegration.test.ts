import { TROOP_TYPES } from "./types";
import {
  enqueueTraining,
  quickFinishBarracksUpgrade,
  quickFinishTraining,
  recordBattleCasualty,
  reserveBattleUnits,
  settleActiveBattle,
  startBarracksUpgrade,
  startTroopUpgrade,
} from "./profileEngine";
import {
  creditSharedGold,
  getSharedGold,
  setSharedGold,
  spendSharedGold,
} from "./sharedGold";
import { createInitialGameState } from "../../../storage/GameRepository";
import { LocalGameRepository } from "../../../storage/LocalGameRepository";
import { sanitizeAndMigrateState } from "../../../storage/migrations";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`✓ ${message}`);
}

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

async function run(): Promise<void> {
  console.log("=== CHIẾN TUYẾN GAMESTATE INTEGRATION TESTS ===");

  const fresh = createInitialGameState("Integration QA");
  assert(fresh.schemaVersion >= 9, "new saves use the V2-aware GameState schema");
  assert(fresh.chienTuyen?.version === 2, "new saves contain a top-level Chiến Tuyến V2 profile");

  const partialRaw = JSON.parse(JSON.stringify(fresh)) as Record<string, any>;
  partialRaw.chienTuyen = {
    version: 2,
    barracksLevel: 6,
    troopLevels: { infantry: 4 },
    readyCounts: { infantry: 3 },
    highestClearedFloor: 8,
    highestUnlockedFloor: 9,
    selectedFloor: 8,
    battleSpeed: 4,
    tutorialCompleted: true,
  };
  const sanitizedPartial = sanitizeAndMigrateState(partialRaw);
  assert(sanitizedPartial.chienTuyen?.barracksLevel === 6, "V2 sanitizer preserves valid partial profile progress");
  assert(sanitizedPartial.chienTuyen?.troopLevels.infantry === 4, "V2 sanitizer preserves valid troop levels");
  assert(
    TROOP_TYPES.every((troopType) => Number.isFinite(sanitizedPartial.chienTuyen?.readyCounts[troopType])),
    "V2 sanitizer fills every troop count without dropping the profile",
  );

  const legacyRaw = JSON.parse(JSON.stringify(fresh)) as Record<string, any>;
  legacyRaw.progression.currentRankIndex = 5;
  legacyRaw.farm.gold = 0;
  legacyRaw.farm.inventory.gold = 0;
  legacyRaw.chienTuyen = {
    version: 1,
    selectedDeckId: "armored_spearhead",
    selectedCommanderId: "defense_commander",
    customDecks: [{ id: "legacy", cardIds: ["old-card"] }],
  };
  const migratedLegacy = sanitizeAndMigrateState(legacyRaw);
  assert(migratedLegacy.chienTuyen?.version === 2, "legacy Chiến Tuyến V1 resets to a safe V2 starter profile");
  assert(migratedLegacy.progression.currentRankIndex === 5, "Chiến Tuyến migration preserves rank progress");
  assert(migratedLegacy.farm?.gold === 0, "Chiến Tuyến migration preserves a valid zero Gold balance");
  assert(!("gold" in migratedLegacy.farm!.inventory), "Chiến Tuyến migration removes the legacy Gold mirror");
  assert(!("selectedDeckId" in migratedLegacy.chienTuyen), "legacy deck data is not mapped into the V2 army");

  const memoryStorage = createMemoryStorage();
  const runtime = globalThis as typeof globalThis & {
    window?: Window;
    localStorage?: Storage;
  };
  const previousWindow = runtime.window;
  const previousLocalStorage = runtime.localStorage;
  Object.defineProperty(runtime, "window", {
    configurable: true,
    value: { localStorage: memoryStorage, indexedDB: undefined },
  });
  Object.defineProperty(runtime, "localStorage", {
    configurable: true,
    value: memoryStorage,
  });

  try {
    const repository = new LocalGameRepository();
    const persisted = createInitialGameState("Repository QA");
    assert(persisted.chienTuyen, "repository fixture has a V2 profile");
    persisted.chienTuyen.barracksLevel = 7;
    persisted.chienTuyen.troopLevels.infantry = 5;
    persisted.chienTuyen.readyCounts.infantry = 11;
    persisted.chienTuyen.highestClearedFloor = 12;
    persisted.chienTuyen.highestUnlockedFloor = 13;
    await repository.save(persisted);
    const reloaded = await repository.load();
    assert(reloaded?.chienTuyen?.version === 2, "LocalGameRepository load keeps the top-level V2 profile");
    assert(reloaded?.chienTuyen?.barracksLevel === 7, "repository migration preserves Barracks progress");
    assert(reloaded?.chienTuyen?.readyCounts.infantry === 11, "repository migration preserves ready troop counts");
    assert(reloaded?.chienTuyen?.highestUnlockedFloor === 13, "repository migration preserves tower progress");
  } finally {
    if (previousWindow === undefined) delete runtime.window;
    else Object.defineProperty(runtime, "window", { configurable: true, value: previousWindow });
    if (previousLocalStorage === undefined) delete runtime.localStorage;
    else Object.defineProperty(runtime, "localStorage", { configurable: true, value: previousLocalStorage });
  }

  const wallet = createInitialGameState("Gold QA");
  assert(wallet.farm, "Gold fixture has a farm wallet");
  wallet.farm.gold = 7;
  (wallet.farm.inventory as any).gold = 99;
  assert(getSharedGold(wallet) === 7, "farm.gold is the canonical shared Gold source");
  assert(spendSharedGold(wallet, 7), "shared Gold can spend the exact available balance");
  assert(wallet.farm.gold === 0, "spending to zero updates the canonical balance");
  assert(!("gold" in wallet.farm.inventory), "shared Gold transactions remove a legacy mirror");
  assert(!spendSharedGold(wallet, 1), "insufficient shared Gold rejects without going negative");
  assert(wallet.farm.gold === 0, "rejected spend preserves a valid zero balance");
  const creditedBalance = creditSharedGold(wallet, 3);
  assert(creditedBalance === 3, "shared Gold credit returns the new balance");
  assert(getSharedGold(wallet) === 3, "credit updates canonical Gold");
  assert(setSharedGold(wallet, 0) === 0, "explicit zero is not replaced by a fallback balance");
  assert(getSharedGold(wallet) === 0, "shared Gold reads zero correctly");

  const partialWallet = { farm: { gold: 5 } } as any;
  assert(setSharedGold(partialWallet, 4) === 4, "shared Gold repairs a partial legacy farm wallet");
  assert(partialWallet.farm.gold === 4 && partialWallet.farm.inventory === undefined, "partial wallet keeps one canonical Gold field");

  const trainingState = createInitialGameState("Atomic training QA");
  assert(trainingState.chienTuyen, "atomic training fixture has a profile");
  setSharedGold(trainingState, 100);
  const queued = enqueueTraining(trainingState.chienTuyen, "infantry", 1_000, { jobId: "atomic-training" });
  assert(queued.ok && spendSharedGold(trainingState, queued.costGold), "training transaction debits its canonical cost once");
  trainingState.chienTuyen = queued.profile;
  assert(getSharedGold(trainingState) === 90 && trainingState.chienTuyen.trainingJobs.length === 1, "training debit and enqueue commit together");
  const duplicateQueue = enqueueTraining(trainingState.chienTuyen, "infantry", 1_000, { jobId: "atomic-training" });
  const duplicateGoldBefore = getSharedGold(trainingState);
  if (duplicateQueue.ok && spendSharedGold(trainingState, duplicateQueue.costGold)) trainingState.chienTuyen = duplicateQueue.profile;
  assert(!duplicateQueue.ok && getSharedGold(trainingState) === duplicateGoldBefore, "duplicate training job cannot debit Gold twice");
  const readyBeforeQuick = trainingState.chienTuyen.readyCounts.infantry;
  const quick = quickFinishTraining(trainingState.chienTuyen, "atomic-training", 2_000);
  assert(quick.ok && spendSharedGold(trainingState, quick.costGold), "quick finish debits its computed Gold cost once");
  trainingState.chienTuyen = quick.profile;
  assert(getSharedGold(trainingState) === 60 && trainingState.chienTuyen.readyCounts.infantry === readyBeforeQuick + 1, "quick finish and ready-count credit commit together");

  const troopUpgradeState = createInitialGameState("Atomic troop upgrade QA");
  assert(troopUpgradeState.chienTuyen, "troop-upgrade fixture has a profile");
  troopUpgradeState.chienTuyen.barracksLevel = 2;
  setSharedGold(troopUpgradeState, 20);
  const troopUpgrade = startTroopUpgrade(troopUpgradeState.chienTuyen, "infantry", 3_000, { jobId: "atomic-troop-upgrade" });
  assert(troopUpgrade.ok && spendSharedGold(troopUpgradeState, troopUpgrade.costGold), "troop upgrade debits exactly once");
  troopUpgradeState.chienTuyen = troopUpgrade.profile;
  assert(getSharedGold(troopUpgradeState) === 10 && troopUpgradeState.chienTuyen.troopUpgradeJobs.infantry?.id === "atomic-troop-upgrade", "troop-upgrade job and debit commit together");

  const barracksUpgradeState = createInitialGameState("Atomic Barracks QA");
  assert(barracksUpgradeState.chienTuyen, "Barracks-upgrade fixture has a profile");
  setSharedGold(barracksUpgradeState, 20);
  const barracksUpgrade = startBarracksUpgrade(barracksUpgradeState.chienTuyen, 10, 4_000, { jobId: "atomic-barracks-upgrade" });
  assert(barracksUpgrade.ok && spendSharedGold(barracksUpgradeState, barracksUpgrade.costGold), "Barracks upgrade debits exactly once");
  barracksUpgradeState.chienTuyen = barracksUpgrade.profile;
  assert(getSharedGold(barracksUpgradeState) === 10 && barracksUpgradeState.chienTuyen.barracksUpgradeJob?.id === "atomic-barracks-upgrade", "Barracks job and debit commit together");

  const barracksQuickState = createInitialGameState("Atomic Barracks quick-finish QA");
  assert(barracksQuickState.chienTuyen, "Barracks quick-finish fixture has a profile");
  setSharedGold(barracksQuickState, 100);
  const activeBarracksJob = startBarracksUpgrade(barracksQuickState.chienTuyen, 10, 4_500, { jobId: "quick-barracks-upgrade" });
  assert(activeBarracksJob.ok && spendSharedGold(barracksQuickState, activeBarracksJob.costGold), "Barracks quick-finish fixture starts one paid job");
  barracksQuickState.chienTuyen = activeBarracksJob.profile;
  setSharedGold(barracksQuickState, 0);
  const unaffordableBarracksQuick = quickFinishBarracksUpgrade(barracksQuickState.chienTuyen, 4_501);
  if (unaffordableBarracksQuick.ok && spendSharedGold(barracksQuickState, unaffordableBarracksQuick.costGold)) {
    barracksQuickState.chienTuyen = unaffordableBarracksQuick.profile;
  }
  assert(
    getSharedGold(barracksQuickState) === 0 && barracksQuickState.chienTuyen.barracksLevel === 1 && barracksQuickState.chienTuyen.barracksUpgradeJob?.id === "quick-barracks-upgrade",
    "insufficient Gold leaves the Barracks level and job unchanged",
  );
  setSharedGold(barracksQuickState, unaffordableBarracksQuick.costGold);
  const affordableBarracksQuick = quickFinishBarracksUpgrade(barracksQuickState.chienTuyen, 4_502);
  assert(affordableBarracksQuick.ok && spendSharedGold(barracksQuickState, affordableBarracksQuick.costGold), "Barracks quick-finish debits its computed cost once");
  barracksQuickState.chienTuyen = affordableBarracksQuick.profile;
  assert(
    getSharedGold(barracksQuickState) === 0 && barracksQuickState.chienTuyen.barracksLevel === 2 && barracksQuickState.chienTuyen.barracksUpgradeJob === null,
    "Barracks quick-finish debit, level application, job clear, and canonical Gold commit together",
  );
  const duplicateBarracksQuick = quickFinishBarracksUpgrade(barracksQuickState.chienTuyen, 4_503);
  assert(!duplicateBarracksQuick.ok && getSharedGold(barracksQuickState) === 0, "Barracks timer race cannot double-level or double-charge");

  const settlementState = createInitialGameState("Atomic settlement QA");
  assert(settlementState.chienTuyen, "settlement fixture has a profile");
  setSharedGold(settlementState, 0);
  const singleInfantry = { assignments: [{ slotId: "front_center" as const, troopType: "infantry" as const }] };
  const lockedAttempt = reserveBattleUnits(settlementState.chienTuyen, 2, singleInfantry, 5_000, { battleId: "locked-floor" });
  assert(!lockedAttempt.ok && lockedAttempt.error === "floor_locked", "locked floor reservation is rejected without consuming troops");
  const floorOne = reserveBattleUnits(settlementState.chienTuyen, 1, singleInfantry, 5_100, { battleId: "floor-one" });
  assert(floorOne.ok, "floor 1 reservation succeeds");
  settlementState.chienTuyen = floorOne.profile;
  const floorOneWin = settleActiveBattle(settlementState.chienTuyen, "victory", 5_200);
  assert(floorOneWin.ok && floorOneWin.value?.rewardGold === 25, "floor 1 first clear produces its one-time reward");
  settlementState.chienTuyen = floorOneWin.profile;
  creditSharedGold(settlementState, floorOneWin.value?.rewardGold ?? 0);
  assert(getSharedGold(settlementState) === 25 && settlementState.chienTuyen.highestUnlockedFloor === 2, "first-clear credit and sequential floor unlock commit together");
  const duplicateSettlement = settleActiveBattle(settlementState.chienTuyen, "victory", 5_300);
  if (duplicateSettlement.ok) creditSharedGold(settlementState, duplicateSettlement.value?.rewardGold ?? 0);
  assert(!duplicateSettlement.ok && getSharedGold(settlementState) === 25, "settlement retry cannot credit first-clear Gold twice");
  const floorTwo = reserveBattleUnits(settlementState.chienTuyen, 2, singleInfantry, 5_400, { battleId: "floor-two" });
  assert(floorTwo.ok, "floor 2 becomes reservable only after floor 1 victory");
  const floorTwoWin = settleActiveBattle(floorTwo.profile, "victory", 5_500);
  assert(floorTwoWin.ok && floorTwoWin.profile.highestUnlockedFloor === 3, "sequential victory unlocks exactly the next floor");

  const abandonState = createInitialGameState("Abandon QA");
  assert(abandonState.chienTuyen, "abandon fixture has a profile");
  const twoUnitFormation = { assignments: [
    { slotId: "front_left" as const, troopType: "infantry" as const },
    { slotId: "front_center" as const, troopType: "armor" as const },
  ] };
  const reservedForAbandon = reserveBattleUnits(abandonState.chienTuyen, 1, twoUnitFormation, 6_000, { battleId: "abandon-battle" });
  assert(reservedForAbandon.ok && reservedForAbandon.value, "abandon fixture reserves two units");
  const deadInfantryId = reservedForAbandon.value.deployedUnits.find((unit) => unit.troopType === "infantry")?.instanceId ?? "";
  const casualty = recordBattleCasualty(reservedForAbandon.profile, deadInfantryId, 6_100);
  assert(casualty.ok, "abandon fixture persists its casualty before settlement");
  const abandoned = settleActiveBattle(casualty.profile, "abandon", 6_200);
  assert(abandoned.ok && abandoned.value?.casualtyInstanceIds.includes(deadInfantryId), "abandon preserves casualties and returns only survivors");
  assert(abandoned.profile.readyCounts.infantry === 1 && abandoned.profile.readyCounts.armor === 1, "abandon loses the dead infantry and fully returns the surviving armor");
  assert(abandoned.profile.highestClearedFloor === 0, "abandon never grants tower progress");

  const floorFiftyState = createInitialGameState("Floor 50 QA");
  assert(floorFiftyState.chienTuyen, "floor-50 fixture has a profile");
  floorFiftyState.chienTuyen.highestClearedFloor = 49;
  floorFiftyState.chienTuyen.highestUnlockedFloor = 50;
  floorFiftyState.chienTuyen.claimedFirstClearFloors = Array.from({ length: 49 }, (_, index) => index + 1);
  const floorFifty = reserveBattleUnits(floorFiftyState.chienTuyen, 50, singleInfantry, 7_000, { battleId: "floor-fifty" });
  assert(floorFifty.ok, "floor 50 reservation succeeds after sequential progress");
  const towerWin = settleActiveBattle(floorFifty.profile, "victory", 7_100);
  assert(towerWin.ok && towerWin.value?.rewardGold === 800, "floor 50 grants the canonical first-clear reward");
  assert(towerWin.profile.highestClearedFloor === 50 && towerWin.profile.highestUnlockedFloor === 51 && !towerWin.profile.towerCompleted, "floor 50 victory unlocks floor 51 without completing the expanded tower");

  const floorHundredState = createInitialGameState("Floor 100 QA");
  assert(floorHundredState.chienTuyen, "floor-100 fixture has a profile");
  floorHundredState.chienTuyen.highestClearedFloor = 99;
  floorHundredState.chienTuyen.highestUnlockedFloor = 100;
  floorHundredState.chienTuyen.claimedFirstClearFloors = Array.from({ length: 99 }, (_, index) => index + 1);
  const floorHundred = reserveBattleUnits(floorHundredState.chienTuyen, 100, singleInfantry, 8_000, { battleId: "floor-hundred" });
  assert(floorHundred.ok, "floor 100 reservation succeeds after sequential progress");
  const finalWin = settleActiveBattle(floorHundred.profile, "victory", 8_100);
  assert(finalWin.ok && finalWin.profile.highestClearedFloor === 100 && finalWin.profile.highestUnlockedFloor === 100 && finalWin.profile.towerCompleted, "floor 100 victory completes the tower without creating floor 101");

  console.log("CHIẾN TUYẾN GAMESTATE INTEGRATION TESTS PASSED");
}

await run();
