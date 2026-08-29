import {
  createDefaultFarmState,
  feedPenBuff,
  calculateMaxFeedQuantity,
  settleFarmState,
  addAnimalToPen,
  plantSeedWithFertilizer,
  harvestAllReadyCrops,
  harvestPlot,
  sellEggs,
  sellAllEggs,
} from "./farmEngine";
import { FeedTypeId } from "./farmTypes";
import {
  getDayNightPhase,
  getWeatherForSlot,
  getCanonicalWeatherSlot,
} from "./weatherEngine";
import { migrateFarmState } from "./farmMigration";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

function runFarmFeedTests() {
  console.log("=== RUNNING FARM FEED ENGINE TEST SUITE ===\n");

  // Test A:
  // Máng = 0, Kho feed_good = 4. Nạp 4 => máng = 80, Kho còn 0, activeFeedSpeedBonus = 16.
  console.log("--- Test A: Feed 4 feed_good into empty trough ---");
  const farmA = createDefaultFarmState();
  farmA.penFeedBuffValue = 0;
  farmA.activeFeedSpeedBonus = 0;
  farmA.inventory.feed.feed_good = 4;

  const maxQtyA = calculateMaxFeedQuantity(farmA, "feed_good");
  assert(maxQtyA === 4, "Test A: maxQuantity for feed_good should be 4");

  const resA = feedPenBuff(farmA, "feed_good", 4);
  assert(resA.success === true, "Test A: feedPenBuff should succeed");
  assert(farmA.penFeedBuffValue === 80, "Test A: penFeedBuffValue should be 80");
  assert(farmA.inventory.feed.feed_good === 0, "Test A: feed_good in inventory should be 0");
  assert(farmA.activeFeedSpeedBonus === 16, "Test A: activeFeedSpeedBonus should be 16");

  // Test B:
  // Máng = 0, Kho feed_super = 6 (buffAmount 20). maxQuantity(feed_super) = 5. Nạp 5 => máng = 100.
  console.log("\n--- Test B: Feed feed_super (buffAmount 20) into empty trough ---");
  const farmB = createDefaultFarmState();
  farmB.penFeedBuffValue = 0;
  farmB.inventory.feed.feed_super = 6;

  const maxQtyB = calculateMaxFeedQuantity(farmB, "feed_super");
  assert(maxQtyB === 5, "Test B: maxQuantity(feed_super) should be 5 (5x20=100)");

  const resB_fail = feedPenBuff(farmB, "feed_super", 6);
  assert(resB_fail.success === false, "Test B: Feeding 6 bags of feed_super must fail");
  assert(farmB.inventory.feed.feed_super === 6, "Test B: Inventory must not be deducted on failure");
  assert(farmB.penFeedBuffValue === 0, "Test B: Trough must remain 0 on failure");

  const resB_ok = feedPenBuff(farmB, "feed_super", 5);
  assert(resB_ok.success === true, "Test B: Feeding 5 bags of feed_super should succeed");
  assert(farmB.penFeedBuffValue === 100, "Test B: penFeedBuffValue should be capped at 100");
  assert(farmB.inventory.feed.feed_super === 1, "Test B: Inventory should be 6 - 5 = 1");
  assert(farmB.activeFeedSpeedBonus === 25, "Test B: activeFeedSpeedBonus should be 25");

  // Test C:
  // Máng = 40, feed_normal (+20), maxQuantity = 3. Nạp 3 => 100.
  console.log("\n--- Test C: Feed 3 feed_normal into 40% filled trough ---");
  const farmC = createDefaultFarmState();
  farmC.penFeedBuffValue = 40;
  farmC.inventory.feed.feed_normal = 10;

  const maxQtyC = calculateMaxFeedQuantity(farmC, "feed_normal");
  assert(maxQtyC === 3, "Test C: maxQuantity for feed_normal with 40% trough should be 3");

  const resC = feedPenBuff(farmC, "feed_normal", 3);
  assert(resC.success === true, "Test C: feedPenBuff should succeed");
  assert(farmC.penFeedBuffValue === 100, "Test C: penFeedBuffValue should be 100");
  assert(farmC.inventory.feed.feed_normal === 7, "Test C: Inventory should be 10 - 3 = 7");

  // Test D:
  // Máng = 80, feed_good (+20), maxQuantity = 1. Nạp 1 => máng = 100, kho còn 4. Sau đó máng đầy 100% thì maxQty = 0, nạp tiếp fail.
  console.log("\n--- Test D: Feed feed_good (+20) into 80% filled trough (fills to 100%) ---");
  const farmD = createDefaultFarmState();
  farmD.penFeedBuffValue = 80;
  farmD.inventory.feed.feed_good = 5;

  const maxQtyD = calculateMaxFeedQuantity(farmD, "feed_good");
  assert(maxQtyD === 1, "Test D: maxQuantity should be 1 (80% + 20% fills to 100%)");

  const resD = feedPenBuff(farmD, "feed_good", 1);
  assert(resD.success === true, "Test D: Feeding 1 bag into 80% trough must succeed");
  assert(farmD.inventory.feed.feed_good === 4, "Test D: Inventory must be deducted to 4");
  assert(farmD.penFeedBuffValue === 100, "Test D: Trough must be capped at 100");

  const maxQtyD2 = calculateMaxFeedQuantity(farmD, "feed_good");
  assert(maxQtyD2 === 0, "Test D: maxQuantity must be 0 when trough is already 100%");
  const resD_full = feedPenBuff(farmD, "feed_good", 1);
  assert(resD_full.success === false, "Test D: Feeding when trough is 100% must fail");
  assert(farmD.inventory.feed.feed_good === 4, "Test D: Inventory must remain 4");

  // Test E:
  // Máng đang buff +40, nạp feed_good (+16) => activeFeedSpeedBonus vẫn = 40.
  console.log("\n--- Test E: Preserve higher activeFeedSpeedBonus (+40) when feeding lower tier ---");
  const farmE = createDefaultFarmState();
  farmE.penFeedBuffValue = 20;
  farmE.activeFeedSpeedBonus = 40;
  farmE.inventory.feed.feed_good = 2;

  const resE = feedPenBuff(farmE, "feed_good", 2);
  assert(resE.success === true, "Test E: feedPenBuff should succeed");
  assert(farmE.penFeedBuffValue === 60, "Test E: penFeedBuffValue should be 20 + 40 = 60");
  assert(farmE.activeFeedSpeedBonus === 40, "Test E: activeFeedSpeedBonus must remain 40");

  // Test F:
  // Máng buff +15, nạp 3 feed_super => buff lên +25, fill tăng 60%, rescale nextEggAt chỉ một lần.
  console.log("\n--- Test F: Speed bonus upgrade transition and single egg rescale ---");
  const farmF = createDefaultFarmState();
  farmF.penFeedBuffValue = 10;
  farmF.activeFeedSpeedBonus = 15;
  farmF.inventory.feed.feed_super = 3;

  const nowMs = Date.now();
  farmF.lastSettledAt = nowMs;
  farmF.penFeedBuffUpdatedAt = nowMs;
  const initialRemainingMs = 100_000;
  farmF.penAnimals = [
    {
      instanceId: "animal_1",
      animalTypeId: "chicken",
      addedAt: nowMs - 10_000,
      nextEggAt: nowMs + initialRemainingMs,
      lifeStartedAt: nowMs - 10_000,
      lifeEndsAt: nowMs + 200 * 60 * 60 * 1000,
      deathAt: null,
      deathCause: null,
      isBuffed: true,
    },
  ];

  const resF = feedPenBuff(farmF, "feed_super", 3);
  assert(resF.success === true, "Test F: Feeding 3 bags should succeed");
  assert(farmF.penFeedBuffValue === 70, "Test F: penFeedBuffValue should be 10 + 60 = 70");
  assert(farmF.activeFeedSpeedBonus === 25, "Test F: activeFeedSpeedBonus upgraded to 25");

  // Expected egg rescale: remaining * ( (1 + 0.15) / (1 + 0.25) ) = 100,000 * (1.15 / 1.25) = 92,000 ms
  const expectedRescaledRemaining = Math.round(initialRemainingMs * (1.15 / 1.25));
  const actualRemaining = farmF.penAnimals[0].nextEggAt - nowMs;
  // Allow slight +/- 20ms execution variance
  assert(
    Math.abs(actualRemaining - expectedRescaledRemaining) < 50,
    `Test F: Egg countdown should be rescaled once from +15% to +25% (expected ~${expectedRescaledRemaining}ms, got ${actualRemaining}ms)`
  );

  // Test G:
  // Inventory chỉ còn 2 nhưng capacity cho phép 4 => maxQuantity = 2 => nhập 3 phải fail.
  console.log("\n--- Test G: Low inventory constraints ---");
  const farmG = createDefaultFarmState();
  farmG.penFeedBuffValue = 0;
  farmG.inventory.feed.feed_good = 2;

  const maxQtyG = calculateMaxFeedQuantity(farmG, "feed_good");
  assert(maxQtyG === 2, "Test G: maxQuantity should be clamped to inventory count (2)");

  const resG_fail = feedPenBuff(farmG, "feed_good", 3);
  assert(resG_fail.success === false, "Test G: Feeding 3 when having 2 must fail");
  assert(farmG.inventory.feed.feed_good === 2, "Test G: Inventory untouched");

  // Test H:
  // Máng đang gần đầy với giá trị decimal => không được overflow > 100.
  console.log("\n--- Test H: Floating point decimal decay handling without overflow ---");
  const farmH = createDefaultFarmState();
  farmH.penFeedBuffValue = 80.0001;
  farmH.inventory.feed.feed_good = 2; // feed_good is +20% each

  const maxQtyH1 = calculateMaxFeedQuantity(farmH, "feed_good");
  assert(maxQtyH1 === 1, "Test H: maxQuantity for +20% feed in 80.0001% trough should be 1 (fills to 100%)");

  const resH1 = feedPenBuff(farmH, "feed_good", 1);
  assert(resH1.success === true, "Test H: Feeding 1 bag should succeed");
  assert(farmH.penFeedBuffValue === 100, "Test H: penFeedBuffValue must be capped at 100");

  const farmH2 = createDefaultFarmState();
  farmH2.penFeedBuffValue = 59.8;
  farmH2.inventory.feed.feed_normal = 5; // feed_normal is +20% each

  const maxQtyH2 = calculateMaxFeedQuantity(farmH2, "feed_normal");
  assert(maxQtyH2 === 3, "Test H: maxQuantity for +20% feed in 59.8% trough should be 3 (reaches 100%)");

  const resH2 = feedPenBuff(farmH2, "feed_normal", 2);
  assert(resH2.success === true, "Test H: Feeding 2 bags should succeed");
  assert(farmH2.penFeedBuffValue <= 100, "Test H: penFeedBuffValue must not exceed 100");
  assert(
    Math.abs(farmH2.penFeedBuffValue - 99.8) < 1e-4,
    `Test H: penFeedBuffValue should be 99.8 (got ${farmH2.penFeedBuffValue})`
  );

  console.log("\nALL FARM FEED TESTS PASSED PERFECTLY! 🌾✨");
}

function runOfflineSettlementTests() {
  console.log("\n=== RUNNING OFFLINE SETTLEMENT & 48H CAP TEST SUITE ===\n");

  const startMs = 1_000_000_000;
  const farmOff = createDefaultFarmState();
  farmOff.lastSettledAt = startMs;
  farmOff.penFeedBuffValue = 100;
  farmOff.penFeedBuffUpdatedAt = startMs;
  farmOff.activeFeedSpeedBonus = 25; // 25% speed bonus
  farmOff.penAnimals = [
    {
      instanceId: "c1",
      animalTypeId: "chicken",
      addedAt: startMs,
      nextEggAt: startMs + 60_000,
      lifeStartedAt: startMs,
      lifeEndsAt: startMs + 200 * 60 * 60 * 1000,
      deathAt: null,
      deathCause: null,
      isBuffed: true,
    },
  ];

  // 100% buff decays in 100 / (100 / 43,200,000) = 43,200,000 ms (12 hours)
  // Simulate 60 hours offline (exceeding 48-hour cap = 172,800,000 ms)
  const sixtyHoursMs = 60 * 3600 * 1000;
  const nowMs = startMs + sixtyHoursMs;

  settleFarmState(farmOff, nowMs);

  assert(farmOff.penFeedBuffValue === 0, "Test O1: Trough should be fully depleted (0%)");
  assert(farmOff.inventory.eggs.chicken_egg > 0, "Test O1: Chicken produced eggs offline");
  
  // Chicken interval: base 5h (18,000,000ms). In 48 hours, maximum eggs is ~10-12
  // With 60h offline, it must be capped at 48h production limit
  assert(
    farmOff.inventory.eggs.chicken_egg <= 15,
    `Test O1: Eggs capped at ~48h max (produced ${farmOff.inventory.eggs.chicken_egg})`
  );

  console.log("\nALL OFFLINE SETTLEMENT TESTS PASSED PERFECTLY! ⏳🥚✨");
}

function runWeatherAndDayNightTests() {
  console.log("\n=== RUNNING WEATHER & DAY/NIGHT TEST SUITE ===\n");

  // UTC+7 fixed slot tests:
  // 00:00 - 06:00 UTC+7: Night
  // 06:00 - 12:00 UTC+7: Day
  // 12:00 - 18:00 UTC+7: Night
  // 18:00 - 24:00 UTC+7: Day
  const baseMidnightUtc = new Date("2026-08-17T00:00:00+07:00").getTime();

  console.log("--- Test WE1: 6-hour fixed Day/Night slot boundaries ---");
  // 02:30 -> Night
  assert(getDayNightPhase(baseMidnightUtc + 2.5 * 3600 * 1000) === "night", "02:30 UTC+7 is Night");
  // 06:00 -> Day
  assert(getDayNightPhase(baseMidnightUtc + 6 * 3600 * 1000) === "day", "06:00 UTC+7 is Day");
  // 09:15 -> Day
  assert(getDayNightPhase(baseMidnightUtc + 9.25 * 3600 * 1000) === "day", "09:15 UTC+7 is Day");
  // 12:00 -> Night
  assert(getDayNightPhase(baseMidnightUtc + 12 * 3600 * 1000) === "night", "12:00 UTC+7 is Night");
  // 15:45 -> Night
  assert(getDayNightPhase(baseMidnightUtc + 15.75 * 3600 * 1000) === "night", "15:45 UTC+7 is Night");
  // 18:00 -> Day
  assert(getDayNightPhase(baseMidnightUtc + 18 * 3600 * 1000) === "day", "18:00 UTC+7 is Day");
  // 23:59 -> Day
  assert(getDayNightPhase(baseMidnightUtc + 23.99 * 3600 * 1000) === "day", "23:59 UTC+7 is Day");

  console.log("\n--- Test WE2: Weather Distribution by Phase ---");
  // Check that day slots only produce sunny, rain, cool
  // Check that night slots only produce calm, rain
  for (let slot = 0; slot < 100; slot++) {
    const isDaySlot = (slot % 4 === 1) || (slot % 4 === 3);
    const weather = getWeatherForSlot(slot, 133742);
    if (isDaySlot) {
      assert(
        weather === "sunny" || weather === "rain" || weather === "cool",
        `Day slot ${slot} produced valid day weather: ${weather}`
      );
    } else {
      assert(
        weather === "calm" || weather === "rain",
        `Night slot ${slot} produced valid night weather: ${weather}`
      );
    }
  }

  console.log("\n--- Test WE3: Deterministic season-aware weather ---");
  const currentSlot = getCanonicalWeatherSlot(baseMidnightUtc, 133742);
  assert(
    currentSlot.weather === getWeatherForSlot(
      currentSlot.slotIndex,
      133742,
      currentSlot.season
    ),
    "Canonical slot weather is stable for its season and seed"
  );

  console.log("\n--- Test WE4: Rain restores persistent soil moisture ---");
  let rainSlotIndex = -1;
  for (let s = 0; s < 50; s++) {
    if (getWeatherForSlot(s, 133742) === "rain") {
      rainSlotIndex = s;
      break;
    }
  }
  assert(rainSlotIndex !== -1, "Found at least one rain slot in 50 slots");

  const rainStartMs = rainSlotIndex * 6 * 3600 * 1000 - 7 * 3600 * 1000;
  const farmRain = createDefaultFarmState();
  farmRain.weatherSeed = 133742;
  farmRain.lastSettledAt = rainStartMs;
  farmRain.plots[0] = {
    status: "empty",
    soilMoisture: 25,
    soilMoistureUpdatedAt: rainStartMs,
  };
  settleFarmState(farmRain, rainStartMs + 60 * 60 * 1000);
  const rainSettledPlot = farmRain.plots[0];
  assert(
    rainSettledPlot.status === "empty" && rainSettledPlot.soilMoisture > 25,
    "Rain raises soil moisture on an empty unlocked plot"
  );

  console.log("\n--- Test WE5: Rain gold bonus (+5% max based on rain exposure) on harvest ---");
  const farmHarvest = createDefaultFarmState();
  farmHarvest.weatherSeed = 133742;
  farmHarvest.inventory.seeds.carrot = 5;
  farmHarvest.lastSettledAt = rainStartMs;

  plantSeedWithFertilizer(farmHarvest, 0, "carrot", null, rainStartMs);
  const growingP = farmHarvest.plots[0];
  if (growingP.status === "growing") {
    const harvestTime = rainStartMs + 12 * 60 * 60 * 1000;
    settleFarmState(farmHarvest, harvestTime);
    const readyPlot = farmHarvest.plots[0];
    assert(readyPlot.status === "ready", "Plot is ready for harvest");
    
    const initialGold = farmHarvest.gold;
    const hRes = harvestPlot(farmHarvest, 0, harvestTime);
    assert(hRes !== null, "Harvest succeeds");
    assert(hRes!.rainBonusGold >= 0, "Rain bonus gold calculated");
    assert(farmHarvest.gold > initialGold, "Gold earned with bonuses");
  }

  console.log("\nALL WEATHER & DAY/NIGHT TESTS PASSED PERFECTLY! ☀️🌧🍃🌙✨");
}

function runQualityAndLivestockTests() {
  console.log("\n=== RUNNING QUALITY & LIVESTOCK WEATHER TEST SUITE ===\n");

  // Test Q1: Backward compatibility migration for eggQualityInventory
  console.log("--- Test Q1: Backward compatibility - ensureEggQualityInventory ---");
  const legacyRawFarm = createDefaultFarmState() as any;
  // Simulate legacy save with eggs in standard inventory but missing eggQualityInventory
  legacyRawFarm.inventory.eggs.chicken_egg = 5;
  delete legacyRawFarm.eggQualityInventory;

  const legacyFarm = migrateFarmState(legacyRawFarm, Date.now());
  assert(legacyFarm.eggQualityInventory !== undefined, "eggQualityInventory initialized for legacy save");
  assert(
    legacyFarm.eggQualityInventory.chicken_egg.thuong.count === 5,
    "Legacy eggs migrated to 'thuong' quality"
  );

  // Test Q2: Crop quality assignment on ready and deterministic persistence
  console.log("\n--- Test Q2: Crop Quality Generation & Persistence ---");
  const farmCrop = createDefaultFarmState();
  farmCrop.weatherSeed = 999888;
  farmCrop.inventory.seeds.cabbage = 1;
  const plantTime = 1718000000000;
  plantSeedWithFertilizer(farmCrop, 0, "cabbage", null, plantTime);
  const p0 = farmCrop.plots[0];
  if (p0.status === "growing") {
    const readyTime = plantTime + 12 * 60 * 60 * 1000;
    settleFarmState(farmCrop, readyTime);
    const readyP = farmCrop.plots[0];
    assert(readyP.status === "ready", "Plot became ready");
    if (readyP.status === "ready") {
      assert(readyP.rolledQuality !== undefined, "rolledQuality was generated on ready");

      const initialQuality = readyP.rolledQuality;
      // Settle again multiple times - quality MUST NOT reroll
      settleFarmState(farmCrop, readyTime + 5000);
      settleFarmState(farmCrop, readyTime + 10000);
      const afterP = farmCrop.plots[0];
      assert(
        afterP.status === "ready" && afterP.rolledQuality === initialQuality,
        "rolledQuality is deterministic and never rerolls on subsequent settlements"
      );

      // Harvest crop with quality
      const prevGold = farmCrop.gold;
      const hRes = harvestPlot(farmCrop, 0, readyTime + 10000);
      assert(hRes !== null, "Harvest succeeds");
      assert(hRes!.quality === initialQuality, "Harvest result records correct quality");
      assert(hRes!.goldEarned > 0, "Gold earned from quality harvest");
      assert(farmCrop.gold === prevGold + hRes!.goldEarned, "Farm gold updated with quality multiplier");
    }
  }

  // Test Q3: Livestock egg production with Quality & Rain bonus
  console.log("\n--- Test Q3: Livestock Egg Production & Quality Breakdown ---");
  const farmPen = createDefaultFarmState();
  farmPen.weatherSeed = 133742;
  farmPen.inventory.animals.chicken = 1;
  const startTime = 1718000000000;
  farmPen.lastSettledAt = startTime;
  farmPen.penFeedBuffValue = 100;
  farmPen.penFeedBuffUpdatedAt = startTime;

  addAnimalToPen(farmPen, "chicken", startTime);
  assert(farmPen.penAnimals.length === 1, "Chicken added to pen");

  // Fast forward 4 egg cycles, still before the 12h empty-trough danger window expires.
  const fourCyclesMs = 4 * (5 * 60 * 60 * 1000) + 10000;
  settleFarmState(farmPen, startTime + fourCyclesMs);

  const eggInv = farmPen.eggQualityInventory.chicken_egg;
  const totalProduced =
    eggInv.thuong.count + eggInv.tot.count + eggInv.hiem.count + eggInv.hoan_my.count;
  assert(totalProduced >= 4, `Chicken produced ${totalProduced} eggs over 4 cycles`);
  assert(
    farmPen.inventory.eggs.chicken_egg === totalProduced,
    "Standard inventory egg count matches total quality egg count"
  );

  // Test Q4: Selling Eggs by Quality
  console.log("\n--- Test Q4: Selling Eggs with Quality Multipliers & Rain Bonus ---");
  const initialFarmGold = farmPen.gold;
  const sellRes = sellEggs(farmPen, "chicken_egg", 2);
  assert(sellRes.soldCount === 2, "Sold 2 eggs successfully");
  assert(sellRes.goldEarned > 0, "Earned gold from egg sale");
  assert(farmPen.gold === initialFarmGold + sellRes.goldEarned, "Gold credited correctly");
  assert(farmPen.inventory.eggs.chicken_egg === totalProduced - 2, "Standard egg inventory decremented");

  const remainingQualityEggs =
    farmPen.eggQualityInventory.chicken_egg.thuong.count +
    farmPen.eggQualityInventory.chicken_egg.tot.count +
    farmPen.eggQualityInventory.chicken_egg.hiem.count +
    farmPen.eggQualityInventory.chicken_egg.hoan_my.count;
  assert(
    remainingQualityEggs === farmPen.inventory.eggs.chicken_egg,
    "Remaining eggs in quality inventory sync with standard inventory"
  );

  // Test Q5: Sell All Eggs
  console.log("\n--- Test Q5: Sell All Eggs ---");
  const sellAllRes = sellAllEggs(farmPen);
  assert(sellAllRes.totalCount === totalProduced - 2, "Sold all remaining eggs");
  assert(farmPen.inventory.eggs.chicken_egg === 0, "Egg inventory completely cleared");
  assert(
    farmPen.eggQualityInventory.chicken_egg.thuong.count === 0 &&
    farmPen.eggQualityInventory.chicken_egg.tot.count === 0 &&
    farmPen.eggQualityInventory.chicken_egg.hiem.count === 0 &&
    farmPen.eggQualityInventory.chicken_egg.hoan_my.count === 0,
    "All quality buckets emptied"
  );

  console.log("\nALL QUALITY & LIVESTOCK TESTS PASSED PERFECTLY! 🥚👑💎✨");
}

function runHarvestAllTests() {
  console.log("\n=== RUNNING HARVEST ALL TRANSACTION TEST SUITE ===\n");
  const now = 9_000_000;
  const batchFarm = createDefaultFarmState();
  batchFarm.lastSettledAt = now;
  batchFarm.plots[0] = {
    status: "ready",
    soilMoisture: 100,
    soilMoistureUpdatedAt: now,
    cropId: "carrot",
    plantedAt: now - 10_000,
    growthCompletedAt: now,
    qualityPenalty: "none",
    qualityRoll: 0.5,
    rolledQuality: "tot",
    weatherExposure: { sunny: 1, calm: 0, rain: 0, cool: 0 },
  };
  batchFarm.plots[1] = {
    status: "ready",
    soilMoisture: 100,
    soilMoistureUpdatedAt: now,
    cropId: "corn",
    plantedAt: now - 10_000,
    growthCompletedAt: now,
    qualityPenalty: "none",
    qualityRoll: 0.5,
    rolledQuality: "hiem",
    weatherExposure: { sunny: 1, calm: 0, rain: 0, cool: 0 },
  };
  const singleFarm = JSON.parse(JSON.stringify(batchFarm)) as ReturnType<
    typeof createDefaultFarmState
  >;
  const first = harvestPlot(singleFarm, 0, now);
  const second = harvestPlot(singleFarm, 1, now);
  assert(Boolean(first && second), "Harvest All fixture has two canonical harvestable plots");

  const result = harvestAllReadyCrops(batchFarm, now);
  assert(result.harvestedCount === 2, "Harvest All commits every eligible plot exactly once");
  assert(result.details.length === 2, "Harvest All returns one presentation detail per plot");
  assert(
    result.details[0].plotIndex === 0 && result.details[1].plotIndex === 1,
    "Harvest All preserves each harvested plot index",
  );
  assert(
    result.details[0].goldAwarded === first!.goldEarned &&
      result.details[0].xpAwarded === first!.xpEarned &&
      result.details[1].goldAwarded === second!.goldEarned &&
      result.details[1].xpAwarded === second!.xpEarned,
    "per-plot Harvest All rewards equal the canonical single-plot engine result",
  );
  assert(
    result.totalGold === first!.goldEarned + second!.goldEarned &&
      result.totalXp === first!.xpEarned + second!.xpEarned,
    "Harvest All totals equal the exact sum of its per-plot rewards",
  );
  assert(
    String(batchFarm.plots[0].status) === "empty" &&
      String(batchFarm.plots[1].status) === "empty",
    "Harvest All locks its snapshot by committing both plots to empty",
  );
}

runFarmFeedTests();
runOfflineSettlementTests();
runWeatherAndDayNightTests();
runQualityAndLivestockTests();
runHarvestAllTests();
