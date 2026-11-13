import type { RankStep } from "../../game/types";
import { ANIMAL_CATALOG } from "./farmCatalog";
import { deterministicRandom } from "./deterministicRandom";
import {
  applyFertilizerToGrowingCrop,
  plantSeedWithFertilizer,
  treatPestOnSelectedPlot,
  waterSelectedPlot,
} from "./farmEngine";
import type {
  AnimalTypeId,
  CropId,
  EggTypeId,
  FarmAlmanacState,
  FarmLogisticsOrder,
  FarmLogisticsOrderKind,
  FarmLogisticsState,
  FarmSaveState,
  FeedTypeId,
  FertilizerTypeId,
  ItemQuality,
} from "./farmTypes";
import { MIN_PLANTING_SOIL_MOISTURE } from "./soilMoistureEngine";

export * from "./farmUpgrades";

export const MAX_DAILY_ORDER_REROLLS = 1;
export const DAILY_LOGISTICS_BONUS = {
  gold: 200,
  xp: 60,
  fertilizerId: "fertilizer_nutrition_good" as FertilizerTypeId,
  fertilizerCount: 1,
} as const;

const VIETNAM_OFFSET_MS = 7 * 3600 * 1000;

export function getVietnamDateKey(now: number = Date.now()): string {
  const shifted = new Date(now + VIETNAM_OFFSET_MS);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getEggAnimalTypeId(eggTypeId: EggTypeId): AnimalTypeId | null {
  return ANIMAL_CATALOG.find((entry) => entry.eggTypeId === eggTypeId)?.id ?? null;
}

export function createDefaultAlmanac(): FarmAlmanacState {
  return {
    crops: {},
    animals: {},
    totalWaters: 0,
    totalPestsTreated: 0,
    totalFertilizersApplied: 0,
    totalOrdersClaimed: 0,
  };
}

export function ensureFarmAlmanac(farm: FarmSaveState): FarmAlmanacState {
  if (!farm.almanac) {
    farm.almanac = createDefaultAlmanac();
  }
  return farm.almanac;
}

export function recordAlmanacCropHarvest(
  farm: FarmSaveState,
  cropId: CropId,
  quality: ItemQuality,
  goldEarned: number
): void {
  const almanac = ensureFarmAlmanac(farm);
  const existing = almanac.crops[cropId] ?? { count: 0, perfectCount: 0, goldEarned: 0 };
  existing.count += 1;
  if (quality === "hoan_my") existing.perfectCount += 1;
  existing.goldEarned += Math.max(0, Math.round(goldEarned));
  almanac.crops[cropId] = existing;
}

export function recordAlmanacEggSale(
  farm: FarmSaveState,
  animalTypeId: AnimalTypeId,
  count: number,
  perfectCount: number,
  goldEarned: number
): void {
  if (count <= 0 && goldEarned <= 0) return;
  const almanac = ensureFarmAlmanac(farm);
  const existing = almanac.animals[animalTypeId] ?? {
    count: 0,
    perfectCount: 0,
    goldEarned: 0,
  };
  existing.count += Math.max(0, Math.round(count));
  existing.perfectCount += Math.max(0, Math.round(perfectCount));
  existing.goldEarned += Math.max(0, Math.round(goldEarned));
  almanac.animals[animalTypeId] = existing;
}

export function recordAlmanacCare(
  farm: FarmSaveState,
  type: "water" | "pest" | "fertilizer" | "order",
  count: number = 1
): void {
  if (count <= 0) return;
  const almanac = ensureFarmAlmanac(farm);
  if (type === "water") almanac.totalWaters += count;
  else if (type === "pest") almanac.totalPestsTreated += count;
  else if (type === "fertilizer") almanac.totalFertilizersApplied += count;
  else if (type === "order") almanac.totalOrdersClaimed += count;
}

function buildLogisticsOrderForSlot(
  farm: FarmSaveState,
  dateKey: string,
  slotIndex: number,
  variantOffset: number = 0
): FarmLogisticsOrder {
  const plotCount = Math.max(2, farm.unlockedPlotCount || 2);
  const livingAnimals = farm.penAnimals.filter((a) => a.deathAt === null).length;
  const seed = farm.weatherSeed ?? 133742;
  const roll = deterministicRandom(seed, "order", dateKey, slotIndex, variantOffset);

  if (slotIndex === 0) {
    const baseTarget = Math.max(3, Math.min(12, Math.round(plotCount * 0.75 + roll * 3)));
    const rewardGold = 65 + baseTarget * 15;
    const rewardXp = 18 + baseTarget * 4;
    const fertId: FertilizerTypeId =
      roll > 0.5 ? "fertilizer_growth_normal" : "fertilizer_nutrition_normal";
    return {
      id: `${dateKey}_harvest_${slotIndex}_v${variantOffset}`,
      kind: "harvest",
      title: "Tiếp Tế Nông Sản",
      description: `Thu hoạch ${baseTarget} lượt cây trồng trong khu vườn Tăng Gia.`,
      target: baseTarget,
      progress: 0,
      rewardGold,
      rewardXp,
      bonusSupply: { category: "fertilizer", id: fertId, count: 1 },
      claimed: false,
    };
  }

  if (slotIndex === 1) {
    const target = Math.max(4, Math.min(16, Math.round(plotCount * 0.9 + roll * 4)));
    const rewardGold = 55 + target * 11;
    const rewardXp = 16 + target * 3;
    const fertId: FertilizerTypeId =
      roll > 0.55 ? "fertilizer_growth_medium" : "fertilizer_nutrition_normal";
    return {
      id: `${dateKey}_care_${slotIndex}_v${variantOffset}`,
      kind: "care",
      title: "Chăm Sóc Đồng Ruộng",
      description: `Thực hiện ${target} lần tưới nước, diệt sâu hoặc bón phân.`,
      target,
      progress: 0,
      rewardGold,
      rewardXp,
      bonusSupply: { category: "fertilizer", id: fertId, count: 1 },
      claimed: false,
    };
  }

  const target =
    livingAnimals > 0
      ? Math.max(2, Math.min(8, Math.round(livingAnimals * 0.8 + 2 + roll * 2)))
      : Math.max(2, Math.min(5, Math.round(2 + roll * 2)));
  const rewardGold = 70 + target * 18;
  const rewardXp = 22 + target * 4;
  const feedId: FeedTypeId = roll > 0.5 ? "feed_good" : "feed_normal";
  return {
    id: `${dateKey}_livestock_${slotIndex}_v${variantOffset}`,
    kind: "livestock",
    title: "Bảo Đảm Chuồng Trại",
    description:
      livingAnimals > 0
        ? `Cho ăn, thả thú hoặc bán ${target} lượt vật nuôi/trứng.`
        : `Thả vật nuôi vào chuồng, cho ăn hoặc bán trứng (${target} lượt).`,
    target,
    progress: 0,
    rewardGold,
    rewardXp,
    bonusSupply: { category: "feed", id: feedId, count: 1 },
    claimed: false,
  };
}

export function ensureLogisticsOrders(
  farm: FarmSaveState,
  now: number = Date.now()
): FarmLogisticsState {
  const dateKey = getVietnamDateKey(now);
  if (
    farm.logisticsOrders &&
    farm.logisticsOrders.dateKey === dateKey &&
    farm.logisticsOrders.orders.length === 3
  ) {
    return farm.logisticsOrders;
  }
  const fresh: FarmLogisticsState = {
    dateKey,
    rerollsUsed: 0,
    bonusClaimed: false,
    orders: [
      buildLogisticsOrderForSlot(farm, dateKey, 0, 0),
      buildLogisticsOrderForSlot(farm, dateKey, 1, 0),
      buildLogisticsOrderForSlot(farm, dateKey, 2, 0),
    ],
  };
  farm.logisticsOrders = fresh;
  return fresh;
}

export function recordLogisticsProgress(
  farm: FarmSaveState,
  kind: FarmLogisticsOrderKind,
  amount: number = 1,
  now: number = Date.now()
): void {
  if (amount <= 0) return;
  const state = ensureLogisticsOrders(farm, now);
  for (const order of state.orders) {
    if (order.kind !== kind || order.claimed) continue;
    order.progress = Math.min(order.target, order.progress + amount);
  }
}

export function rerollLogisticsOrder(
  farm: FarmSaveState,
  orderId: string,
  now: number = Date.now()
): { success: boolean; message: string } {
  const state = ensureLogisticsOrders(farm, now);
  if (state.rerollsUsed >= MAX_DAILY_ORDER_REROLLS) {
    return {
      success: false,
      message: "Bạn đã dùng hết lượt đổi nhiệm vụ miễn phí hôm nay.",
    };
  }
  const slotIndex = state.orders.findIndex((order) => order.id === orderId);
  if (slotIndex < 0) {
    return { success: false, message: "Không tìm thấy đơn hậu cần này." };
  }
  if (state.orders[slotIndex].claimed) {
    return { success: false, message: "Đơn này đã nhận thưởng rồi!" };
  }
  state.rerollsUsed += 1;
  state.orders[slotIndex] = buildLogisticsOrderForSlot(
    farm,
    state.dateKey,
    slotIndex,
    state.rerollsUsed
  );
  return { success: true, message: "Đã làm mới đơn hậu cần!" };
}

export function claimLogisticsOrder(
  farm: FarmSaveState,
  orderId: string,
  now: number = Date.now()
): {
  success: boolean;
  message: string;
  goldEarned: number;
  xpEarned: number;
  bonusLabel?: string;
} {
  const state = ensureLogisticsOrders(farm, now);
  const order = state.orders.find((entry) => entry.id === orderId);
  if (!order) {
    return {
      success: false,
      message: "Không tìm thấy đơn hậu cần.",
      goldEarned: 0,
      xpEarned: 0,
    };
  }
  if (order.claimed) {
    return {
      success: false,
      message: "Đơn hậu cần này đã nhận thưởng rồi!",
      goldEarned: 0,
      xpEarned: 0,
    };
  }
  if (order.progress < order.target) {
    return {
      success: false,
      message: `Chưa hoàn thành (${order.progress}/${order.target}).`,
      goldEarned: 0,
      xpEarned: 0,
    };
  }

  order.claimed = true;
  farm.gold += order.rewardGold;
  let bonusLabel: string | undefined;
  if (order.bonusSupply) {
    if (order.bonusSupply.category === "fertilizer") {
      farm.inventory.fertilizer[order.bonusSupply.id as FertilizerTypeId] =
        (farm.inventory.fertilizer[order.bonusSupply.id as FertilizerTypeId] || 0) +
        order.bonusSupply.count;
      bonusLabel = `+${order.bonusSupply.count} phân bón`;
    } else if (order.bonusSupply.category === "feed") {
      farm.inventory.feed[order.bonusSupply.id as FeedTypeId] =
        (farm.inventory.feed[order.bonusSupply.id as FeedTypeId] || 0) +
        order.bonusSupply.count;
      bonusLabel = `+${order.bonusSupply.count} cám`;
    }
  }
  recordAlmanacCare(farm, "order", 1);

  return {
    success: true,
    goldEarned: order.rewardGold,
    xpEarned: order.rewardXp,
    bonusLabel,
    message: `Hoàn tất "${order.title}": +${order.rewardGold} Vàng, +${order.rewardXp} EXP${bonusLabel ? ` (${bonusLabel})` : ""}!`,
  };
}

export function claimLogisticsDailyBonus(
  farm: FarmSaveState,
  now: number = Date.now()
): {
  success: boolean;
  message: string;
  goldEarned: number;
  xpEarned: number;
} {
  const state = ensureLogisticsOrders(farm, now);
  if (state.bonusClaimed) {
    return {
      success: false,
      message: "Thưởng tổng kết 3/3 hôm nay đã được nhận!",
      goldEarned: 0,
      xpEarned: 0,
    };
  }
  if (!state.orders.every((order) => order.claimed)) {
    return {
      success: false,
      message: "Hãy hoàn thành và nhận cả 3 đơn trong ngày trước!",
      goldEarned: 0,
      xpEarned: 0,
    };
  }
  state.bonusClaimed = true;
  farm.gold += DAILY_LOGISTICS_BONUS.gold;
  farm.inventory.fertilizer[DAILY_LOGISTICS_BONUS.fertilizerId] =
    (farm.inventory.fertilizer[DAILY_LOGISTICS_BONUS.fertilizerId] || 0) +
    DAILY_LOGISTICS_BONUS.fertilizerCount;

  return {
    success: true,
    goldEarned: DAILY_LOGISTICS_BONUS.gold,
    xpEarned: DAILY_LOGISTICS_BONUS.xp,
    message: `Nhận thưởng hoàn thành 3/3 đơn: +${DAILY_LOGISTICS_BONUS.gold} Vàng, +${DAILY_LOGISTICS_BONUS.xp} EXP & +1 Phân Dinh Dưỡng Tốt!`,
  };
}

export function getReadyLogisticsClaimCount(
  farm: FarmSaveState,
  now: number = Date.now()
): number {
  const state = farm.logisticsOrders;
  if (!state || state.dateKey !== getVietnamDateKey(now)) return 0;
  let count = state.orders.filter((o) => !o.claimed && o.progress >= o.target).length;
  if (!state.bonusClaimed && state.orders.length === 3 && state.orders.every((o) => o.claimed)) {
    count += 1;
  }
  return count;
}

export function waterAllThirstyPlots(
  farm: FarmSaveState,
  now: number,
  maxMoistureExclusive: number = 95
): {
  success: boolean;
  wateredCount: number;
  wateredPlotIndices: number[];
  moistureAddedTotal: number;
  message: string;
} {
  const wateredPlotIndices: number[] = [];
  let moistureAddedTotal = 0;

  for (let i = 0; i < farm.plots.length; i++) {
    const plot = farm.plots[i];
    if (!plot || plot.status === "locked") continue;
    if (plot.soilMoisture >= maxMoistureExclusive) continue;
    const res = waterSelectedPlot(farm, i, now);
    if (res.success) {
      wateredPlotIndices.push(i);
      moistureAddedTotal += res.moistureAdded;
    }
  }

  if (wateredPlotIndices.length > 0) {
    recordAlmanacCare(farm, "water", wateredPlotIndices.length);
    recordLogisticsProgress(farm, "care", wateredPlotIndices.length, now);
  }

  return {
    success: wateredPlotIndices.length > 0,
    wateredCount: wateredPlotIndices.length,
    wateredPlotIndices,
    moistureAddedTotal,
    message:
      wateredPlotIndices.length > 0
        ? `Đã tưới đồng loạt ${wateredPlotIndices.length} ô đất (+${Math.round(moistureAddedTotal / wateredPlotIndices.length)}% TB/ô).`
        : "Các ô đất đều đang đủ độ ẩm!",
  };
}

export function treatAllPestPlots(
  farm: FarmSaveState,
  now: number
): {
  success: boolean;
  treatedCount: number;
  treatedPlotIndices: number[];
  message: string;
} {
  const treatedPlotIndices: number[] = [];
  for (let i = 0; i < farm.plots.length; i++) {
    const res = treatPestOnSelectedPlot(farm, i, now);
    if (res.success) {
      treatedPlotIndices.push(i);
    }
  }

  if (treatedPlotIndices.length > 0) {
    recordAlmanacCare(farm, "pest", treatedPlotIndices.length);
    recordLogisticsProgress(farm, "care", treatedPlotIndices.length, now);
  }

  return {
    success: treatedPlotIndices.length > 0,
    treatedCount: treatedPlotIndices.length,
    treatedPlotIndices,
    message:
      treatedPlotIndices.length > 0
        ? `Đã diệt sâu đồng loạt ${treatedPlotIndices.length} ô cây!`
        : "Hiện chưa có ô cây nào cần diệt sâu.",
  };
}

export function replantAllRememberedPlots(
  farm: FarmSaveState,
  now: number,
  rankIndex: number,
  includeFertilizer: boolean = false
): {
  success: boolean;
  plantedCount: number;
  skippedNoSeed: number;
  skippedDry: number;
  plantedEntries: Array<{
    plotIndex: number;
    cropId: CropId;
    fertilizerId: FertilizerTypeId | null;
  }>;
  message: string;
} {
  const plantedEntries: Array<{
    plotIndex: number;
    cropId: CropId;
    fertilizerId: FertilizerTypeId | null;
  }> = [];
  let skippedNoSeed = 0;
  let skippedDry = 0;

  for (let i = 0; i < farm.plots.length; i++) {
    const plot = farm.plots[i];
    if (!plot || plot.status !== "empty" || !plot.lastCropId) continue;
    if (plot.soilMoisture < MIN_PLANTING_SOIL_MOISTURE) {
      skippedDry += 1;
      continue;
    }
    const seedOwned = farm.inventory.seeds[plot.lastCropId] || 0;
    if (seedOwned <= 0) {
      skippedNoSeed += 1;
      continue;
    }

    const desiredFert = includeFertilizer ? plot.lastFertilizerId ?? null : null;
    const effectiveFert =
      desiredFert && (farm.inventory.fertilizer?.[desiredFert] || 0) > 0
        ? desiredFert
        : null;

    const res = plantSeedWithFertilizer(
      farm,
      i,
      plot.lastCropId,
      effectiveFert,
      now,
      rankIndex,
      "manual"
    );
    if (res.success) {
      plantedEntries.push({
        plotIndex: i,
        cropId: plot.lastCropId,
        fertilizerId: effectiveFert,
      });
      if (effectiveFert) {
        recordAlmanacCare(farm, "fertilizer", 1);
        recordLogisticsProgress(farm, "care", 1, now);
      }
    }
  }

  let message = "Không có ô trống nào có thể gieo lại hạt nhớ.";
  if (plantedEntries.length > 0) {
    message = `Đã gieo lại ${plantedEntries.length} ô đất từ vụ trước!`;
  } else if (skippedDry > 0 && skippedNoSeed === 0) {
    message = `Có ${skippedDry} ô đất quá khô (<20% ẩm), hãy tưới nước trước khi gieo lại!`;
  } else if (skippedNoSeed > 0) {
    message = "Đã hết hạt giống cũ trong kho để gieo lại!";
  }

  return {
    success: plantedEntries.length > 0,
    plantedCount: plantedEntries.length,
    skippedNoSeed,
    skippedDry,
    plantedEntries,
    message,
  };
}

export function fertilizeAllGrowingPlots(
  farm: FarmSaveState,
  fertilizerId: FertilizerTypeId,
  now: number,
  currentRank: RankStep
): {
  success: boolean;
  fertilizedCount: number;
  fertilizedPlotIndices: number[];
  message: string;
} {
  const fertilizedPlotIndices: number[] = [];
  for (let i = 0; i < farm.plots.length; i++) {
    const plot = farm.plots[i];
    if (!plot || plot.status !== "growing") continue;
    const res = applyFertilizerToGrowingCrop(
      farm,
      i,
      fertilizerId,
      now,
      currentRank
    );
    if (res.success) {
      fertilizedPlotIndices.push(i);
    } else if ((farm.inventory.fertilizer?.[fertilizerId] || 0) <= 0) {
      break;
    }
  }

  if (fertilizedPlotIndices.length > 0) {
    recordAlmanacCare(farm, "fertilizer", fertilizedPlotIndices.length);
    recordLogisticsProgress(farm, "care", fertilizedPlotIndices.length, now);
  }

  return {
    success: fertilizedPlotIndices.length > 0,
    fertilizedCount: fertilizedPlotIndices.length,
    fertilizedPlotIndices,
    message:
      fertilizedPlotIndices.length > 0
        ? `Đã bón phân đồng loạt cho ${fertilizedPlotIndices.length} ô cây!`
        : "Không có ô cây đang lớn nào có thể bón thêm phân này.",
  };
}
