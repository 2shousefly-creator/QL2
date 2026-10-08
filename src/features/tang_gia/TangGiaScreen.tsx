import { CommandMenuProvider } from "../../components/core-visual/CommandMenuContext";
import type { FarmVisualEvent } from "./pixi/farmPixiTypes";
import React, { useState, useEffect, useRef } from "react";
import { GameState } from "../../game/types";
import { getCurrentRank } from "../../game/xpEngine";
import { applyFarmXpReward } from "./farmXpReward";
import {
  ANIMAL_CATALOG,
  CROP_CATALOG,
  EGG_INFO_MAP,
  FARM_PLOT_UNLOCKS,
  FEED_CATALOG,
  FERTILIZER_CATALOG,
} from "./farmCatalog";
import { addAnimalToPen, applyFertilizerToGrowingCrop, canWaterPlot, clearPlot, consumePendingAnimalDeathNotification, createDefaultFarmState, dismissAnimal, feedPenBuff, getRankNameForDisplay, harvestAllReadyCrops, harvestPlot, hasCropFertilizer, plantSeedWithFertilizer, rankAtLeast, sellAllEggs, sellEggs, sellInventoryItem, settleFarmState, treatPestOnSelectedPlot, waterSelectedPlot } from "./farmEngine";
import { isAnimalDead } from "./animalLifecycle";
import {
  AnimalTypeId,
  CropId,
  EggTypeId,
  FeedTypeId,
  FertilizerTypeId,
  FarmSaveState,
  AnimalDeathNotificationSummary,
} from "./farmTypes";
import {
  getCanonicalWeatherSlot,
} from "./weatherEngine";
import { evaluateMedalUnlocks, recordCropHarvestForMedals, recordEggSale, recordFarmGoldEarned, recordFeedBagsUsed, recordFertilizerUsed, recordPerfectFarmItemSale, recordWatering } from "../../game/medals/medalEngine";
import { TangGiaCanvas2D } from "./components/TangGiaCanvas2D";
import { FarmToolIcon } from "./mobile/FarmToolIcon";
import { FarmXpProgressBar } from "./components/FarmXpProgressBar";
import { FarmStoreModal } from "./components/FarmStoreModal";
import { KhoModal, KhoTabType } from "./components/KhoModal";
import { PlantSeedModal } from "./components/PlantSeedModal";
import { EnterPenModal } from "./components/EnterPenModal";
import { FeedModal } from "./components/FeedModal";
import { TroughInfoModal } from "./components/TroughInfoModal";
import { WeatherHUD } from "./components/WeatherHUD";
import { WeatherModal } from "./components/WeatherModal";
import { ApplyFertilizerModal } from "./components/ApplyFertilizerModal";
import {
  RewardSummaryModal,
  RewardSummaryData,
} from "./components/RewardSummaryModal";
import { ConfirmationDialog, ModalButton, OverlayBody, OverlayFooter, OverlayHeader, OverlayPortal } from "../../components/overlay/AppOverlay";
import {
  HARVEST_ALL_CROP_GLOW_DURATION_MS,
  HARVEST_REWARD_FLOAT_DURATION_MS,
  getFarmHarvestAllActionMode,
  getFarmPresentationState,
  type PlotHarvestPresentation,
} from "./farmPresentation";
import { CheckCircle2, Droplets, Egg, Package, Sparkles, Sprout, Store, Trash2, UserX, Wheat } from "lucide-react";
import { MIN_PLANTING_SOIL_MOISTURE } from "./soilMoistureEngine";
import { canTreatPest } from "./pestEngine";
import FarmMobilePresentation from "./mobile/FarmMobilePresentation";
import { adaptFarmMobile } from "./mobile/FarmMobileAdapter";
import { FARM_MOBILE_REQUESTED } from "./mobile/mobileGate";

interface TangGiaScreenProps {
  gameState: GameState;
  onUpdateGameState: (
    updater: ((draft: GameState) => void) | GameState
  ) => void;
  onTroughInfoToggle?: (isOpen: boolean) => void;
  pushTarget?: { section: 'garden' | 'pen'; nonce: number } | null;
}

type FarmDialog = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm?: () => void;
};
type StoreTab = "crop" | "fertilizer" | "animal" | "feed";
export type FarmPrimaryModal =
  | { type: "store"; tab: StoreTab }
  | { type: "inventory"; tab: KhoTabType }
  | { type: "plant"; plotIndex: number }
  | { type: "apply-fertilizer"; plotIndex: number }
  | { type: "enter-pen" | "feed" | "trough" | "weather" }
  | { type: "reward"; summary: RewardSummaryData }
  | { type: "dialog"; dialog: FarmDialog };

function getAnimalDeathNotificationCopy(
  summary: AnimalDeathNotificationSummary,
  offline: boolean
): string {
  const prefix = summary.total === 1
    ? `Có 1 Vật Nuôi đã chết${offline ? " trong lúc bạn vắng mặt" : ""}.`
    : `Có ${summary.total} Vật Nuôi đã chết${offline ? " trong lúc bạn vắng mặt" : ""}.`;
  const breakdown = [
    summary.oldAge > 0 ? `${summary.oldAge} do tuổi già` : null,
    summary.starvation > 0 ? `${summary.starvation} do thiếu thức ăn` : null,
  ].filter(Boolean).join(" · ");
  return breakdown ? `${prefix} ${breakdown}.` : prefix;
}

export const TangGiaScreen: React.FC<TangGiaScreenProps> = ({
  gameState,
  onUpdateGameState,
  onTroughInfoToggle,
  pushTarget,
}) => {
  const currentRank = getCurrentRank(gameState.progression.currentRankIndex);
  const [mobileActive, setMobileActive] = useState(FARM_MOBILE_REQUESTED);

  // Active timestamp
  const [now, setNow] = useState(Date.now());

  // Farm save state fallback
  const farmState: FarmSaveState = gameState.farm
    ? { ...gameState.farm }
    : createDefaultFarmState();

  // Selection states & context mode
  const [contextMode, setContextMode] = useState<"none" | "garden" | "pen">(
    "none"
  );
  useEffect(() => {
    if (pushTarget) setContextMode(pushTarget.section);
  }, [pushTarget]);
  const [selectedPlotIndex, setSelectedPlotIndex] = useState<number | null>(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);

  // Replacing this union atomically unmounts the previous owner and its children.
  const [farmModal, setFarmModal] = useState<FarmPrimaryModal | null>(null);
  const farmModalRef = useRef<FarmPrimaryModal | null>(null);
  const openFarmModal = (modal: FarmPrimaryModal) => {
    farmModalRef.current = modal;
    setFarmModal(modal);
  };
  const closeFarmModal = () => {
    farmModalRef.current = null;
    setFarmModal(null);
  };
  const openFarmDialog = (dialog: FarmDialog) => openFarmModal({ type: "dialog", dialog });
  const dialogConfig = farmModal?.type === "dialog" ? farmModal.dialog : null;

  const currentWeatherSlot = getCanonicalWeatherSlot(
    now,
    farmState.weatherSeed ?? 133742
  );
  const presentationState = getFarmPresentationState(farmState, now);
  const plantingPlot = farmModal?.type === "plant"
    ? farmState.plots[farmModal.plotIndex]
    : null;
  const selectedPlotLastFertilizerId = plantingPlot?.status === "empty"
    ? plantingPlot.lastFertilizerId
    : undefined;

  useEffect(() => {
    onTroughInfoToggle?.(farmModal?.type === "trough");
    return () => onTroughInfoToggle?.(false);
  }, [farmModal?.type, onTroughInfoToggle]);

  const [visualEvents, setVisualEvents] = useState<FarmVisualEvent[]>([]);
  const visualMounted = useRef(true);
  useEffect(() => { visualMounted.current = true; return () => { visualMounted.current = false; }; }, []);
  useEffect(() => {
    if (!visualEvents.length) return;
    const timer = window.setTimeout(() => setVisualEvents([]), 1600);
    return () => window.clearTimeout(timer);
  }, [visualEvents]);
  const [harvestPresentations, setHarvestPresentations] = useState<
    PlotHarvestPresentation[]
  >([]);
  const [isHarvestingAll, setIsHarvestingAll] = useState(false);
  const harvestAllLockRef = useRef(false);
  const harvestPresentationTimersRef = useRef<number[]>([]);

  const showRewardSummary = (summary: RewardSummaryData) => {
    openFarmModal({ type: "reward", summary });
  };

  const queueHarvestPresentations = (
    entries: readonly PlotHarvestPresentation[]
  ) => {
    if (entries.length === 0) return;
    const ids = new Set(entries.map((entry) => entry.id));
    setHarvestPresentations((current) => [
      ...current.filter((entry) => !ids.has(entry.id)),
      ...entries,
    ]);
    const timer = window.setTimeout(() => {
      setHarvestPresentations((current) =>
        current.filter((entry) => !ids.has(entry.id))
      );
    }, HARVEST_REWARD_FLOAT_DURATION_MS);
    harvestPresentationTimersRef.current.push(timer);
  };

  useEffect(() => {
    return () => {
      harvestPresentationTimersRef.current.forEach((timer) =>
        window.clearTimeout(timer)
      );
      harvestPresentationTimersRef.current = [];
      harvestAllLockRef.current = false;
    };
  }, []);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalEggCount = Object.values(farmState.inventory.eggs || {}).reduce(
    (acc, val) => acc + (val || 0),
    0
  );
  const harvestableCropCount = presentationState.plots.filter(
    (plot) => plot.status === "ready"
  ).length;
  const harvestAllActionMode = getFarmHarvestAllActionMode(
    harvestableCropCount
  );
  // The 1-second ticker is presentation-only. Persistence happens at boundaries.
  useEffect(() => {
    const settleAtBoundary = (currentNow: number) => {
      onUpdateGameState((draft) => {
        if (!draft.farm) {
          draft.farm = createDefaultFarmState(currentNow);
        }
        const settlement = settleFarmState(draft.farm, currentNow);
        const pendingOfflineDeaths = consumePendingAnimalDeathNotification(
          draft.farm
        );
        if (pendingOfflineDeaths) {
          const message = getAnimalDeathNotificationCopy(
            pendingOfflineDeaths,
            true
          );
          setTimeout(() => showToast(message), 0);
        } else if (settlement.newDeaths.total > 0) {
          const message = getAnimalDeathNotificationCopy(
            settlement.newDeaths,
            false
          );
          setTimeout(() => showToast(message), 0);
        }
      });
    };

    settleAtBoundary(Date.now());
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      const currentNow = Date.now();
      setNow(currentNow);
      settleAtBoundary(currentNow);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Helper to safely mutate farm state & settle offline/wallclock
  const updateFarm = (
    mutator: (farm: FarmSaveState, draft: GameState) => {
      goldEarned?: number;
      xpEarned?: number;
      message?: string;
      summaryData?: RewardSummaryData;
      plotRewards?: PlotHarvestPresentation[];
      visualEvent?: FarmVisualEvent;
    } | void,
    transactionNow: number = Date.now()
  ) => {
    onUpdateGameState((draft) => {
      if (!draft.farm) {
        draft.farm = createDefaultFarmState(transactionNow);
      }
      const settlement = settleFarmState(draft.farm, transactionNow);
      const pendingOfflineDeaths = consumePendingAnimalDeathNotification(
        draft.farm
      );
      const res = mutator(draft.farm, draft);

      if (pendingOfflineDeaths) {
        const message = getAnimalDeathNotificationCopy(
          pendingOfflineDeaths,
          true
        );
        setTimeout(() => showToast(message), 0);
      } else if (settlement.newDeaths.total > 0) {
        const message = getAnimalDeathNotificationCopy(
          settlement.newDeaths,
          false
        );
        setTimeout(() => showToast(message), 0);
      }

      if (res) {
        if (res.visualEvent) {
          const event = res.visualEvent;
          queueMicrotask(() => {
            if (visualMounted.current) setVisualEvents(current => [...current.filter(item => item.id !== event.id), event].slice(-9));
          });
        }
        let displayedXp = res.summaryData?.xpEarned ?? 0;
        if (res.xpEarned && res.xpEarned > 0) {
          displayedXp = applyFarmXpReward(draft, res.xpEarned).displayedXp;
        }
        if (res.goldEarned && res.goldEarned > 0) {
          recordFarmGoldEarned(draft, res.goldEarned);
        }
        if (res.message) {
          const msg = res.message;
          setTimeout(() => showToast(msg), 0);
        }
        if (res.summaryData) {
          const summary = {
            ...res.summaryData,
            xpEarned: displayedXp,
          };
          setTimeout(() => showRewardSummary(summary), 0);
        }
        if (res.plotRewards?.length) {
          const rewards = res.plotRewards;
          setTimeout(() => queueHarvestPresentations(rewards), 0);
        }
      }
    });
  };

  const showToast = (msg: string) => {
    setTimeout(() => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
    }, 0);
  };

  const showLowMoistureDialog = () => {
    openFarmDialog({
      title: "Đất Thiếu Nước",
      message: "Đất đang thiếu nước trầm trọng, hãy tưới nước trước rồi trồng cây sau",
      confirmLabel: "Đã Hiểu",
      onConfirm: () =>
        closeFarmModal(),
    });
  };

  const openStore = (tab?: StoreTab) =>
    openFarmModal({ type: "store", tab: tab ?? (contextMode === "pen" ? "animal" : "crop") });

  const openKho = (tab?: KhoTabType) =>
    openFarmModal({ type: "inventory", tab: tab ?? (contextMode === "pen" ? "animal" : "crop") });

  // --- STORE ACTIONS (Support multi-quantity) ---
  const handleBuyCrop = (cropId: CropId, quantity: number = 1) => {
    const crop = CROP_CATALOG.find((c) => c.id === cropId);
    if (!crop) return;

    if (!rankAtLeast(currentRank, crop.requiredRank)) {
      showToast(
        `Chưa đủ quân hàm yêu cầu (${getRankNameForDisplay(crop.requiredRank)})!`
      );
      return;
    }

    const buyCount = Math.max(1, quantity);
    const totalCost = crop.seedCostGold * buyCount;

    if (farmState.gold < totalCost) {
      showToast("Không đủ Vàng để mua!");
      return;
    }

    updateFarm((farm) => {
      farm.gold -= totalCost;
      farm.inventory.seeds[cropId] = (farm.inventory.seeds[cropId] || 0) + buyCount;
    });

    showToast(`Đã mua ${buyCount} Hạt giống ${crop.name} (-${totalCost.toLocaleString("vi-VN")} Vàng)!`);
  };

  const handleBuyFertilizer = (fertilizerId: FertilizerTypeId, quantity: number = 1) => {
    const fert = FERTILIZER_CATALOG.find((f) => f.id === fertilizerId);
    if (!fert) return;

    if (!rankAtLeast(currentRank, fert.requiredRank)) {
      showToast(
        `Chưa đủ quân hàm yêu cầu (${getRankNameForDisplay(fert.requiredRank)})!`
      );
      return;
    }

    const buyCount = Math.max(1, quantity);
    const totalCost = fert.purchaseGold * buyCount;

    if (farmState.gold < totalCost) {
      showToast("Không đủ Vàng để mua!");
      return;
    }

    updateFarm((farm) => {
      farm.gold -= totalCost;
      if (!farm.inventory.fertilizer) {
        farm.inventory.fertilizer = createDefaultFarmState().inventory.fertilizer;
      }
      farm.inventory.fertilizer[fertilizerId] =
        (farm.inventory.fertilizer[fertilizerId] || 0) + buyCount;
    });

    showToast(`Đã mua ${buyCount} ${fert.name} (-${totalCost.toLocaleString("vi-VN")} Vàng)!`);
  };

  const handleBuyAnimal = (animalId: AnimalTypeId, quantity: number = 1) => {
    const animal = ANIMAL_CATALOG.find((a) => a.id === animalId);
    if (!animal) return;

    if (!rankAtLeast(currentRank, animal.requiredRank)) {
      showToast(
        `Chưa đủ quân hàm yêu cầu (${getRankNameForDisplay(animal.requiredRank)})!`
      );
      return;
    }

    const buyCount = Math.max(1, quantity);
    const totalCost = animal.purchaseGold * buyCount;

    if (farmState.gold < totalCost) {
      showToast("Không đủ Vàng để mua!");
      return;
    }

    updateFarm((farm) => {
      farm.gold -= totalCost;
      farm.inventory.animals[animalId] =
        (farm.inventory.animals[animalId] || 0) + buyCount;
    });

    showToast(`Đã mua ${buyCount} ${animal.name}! Đã thêm vào Kho / Vật Nuôi.`);
  };

  const handleBuyFeed = (feedId: FeedTypeId, quantity: number = 1) => {
    const feedDef = FEED_CATALOG.find((f) => f.id === feedId);
    if (!feedDef) return;

    if (!rankAtLeast(currentRank, feedDef.requiredRank)) {
      showToast(
        `Chưa đủ quân hàm yêu cầu (${getRankNameForDisplay(feedDef.requiredRank)})!`
      );
      return;
    }

    const buyCount = Math.max(1, quantity);
    const totalCost = feedDef.costGold * buyCount;

    if (farmState.gold < totalCost) {
      showToast("Không đủ Vàng để mua!");
      return;
    }

    updateFarm((farm) => {
      farm.gold -= totalCost;
      farm.inventory.feed[feedId] = (farm.inventory.feed[feedId] || 0) + buyCount;
      return { message: `Đã mua ${buyCount} ${feedDef.name} (-${totalCost.toLocaleString("vi-VN")} Vàng)!` };
    });
  };

  // --- KHO SELLING ACTIONS ---
  const handleSellItem = (
    category: "seeds" | "fertilizer" | "animals" | "feed",
    itemId: string,
    count: number
  ) => {
    updateFarm((farm) => {
      const res = sellInventoryItem(farm, category, itemId, count);
      return { message: res.message };
    });
  };

  // --- GARDEN ACTIONS ---
  const handleHarvestSinglePlotForIndex = (plotIndex: number) => {
    const currentNow = Date.now();
    updateFarm((farm, draft) => {
      const readyPlot = farm.plots[plotIndex];
      if (!readyPlot || readyPlot.status !== "ready") {
        return { message: "Ô đất chưa sẵn sàng thu hoạch!" };
      }
      const cropId = readyPlot.cropId;
      const res = harvestPlot(farm, plotIndex, currentNow);
      if (res) {
        recordCropHarvestForMedals(
          draft,
          res.hasFertilizer
        );
        recordPerfectFarmItemSale(draft, res.quality === "hoan_my" ? 1 : 0);
        return {
          goldEarned: res.goldEarned,
          xpEarned: res.xpEarned,
          plotRewards: [
            {
              id: `harvest-${plotIndex}-${currentNow}`,
              plotIndex,
              cropId,
              quality: res.quality,
              goldAwarded: res.goldEarned,
              xpAwarded: res.xpEarned,
              startedAt: currentNow,
              glowUntil: currentNow,
            },
          ],
        };
      } else {
        return { message: "Ô đất chưa sẵn sàng thu hoạch!" };
      }
    }, currentNow);
  };

  const handleGardenTap = () => {
    if (selectedAnimalId !== null) {
      setContextMode("none");
      setSelectedPlotIndex(null);
      setSelectedAnimalId(null);
      return;
    }
    setContextMode("garden");
    setSelectedAnimalId(null);
    if (selectedPlotIndex === null) {
      setSelectedPlotIndex(0);
    }
  };

  const handlePlotTap = (index: number) => {
    setContextMode("garden");
    setSelectedPlotIndex(index);
    setSelectedAnimalId(null);
  };

  const handleOpenPlantModal = () => {
    const selectedPlot = selectedPlotIndex === null
      ? null
      : presentationState.plots[selectedPlotIndex];
    if (
      !selectedPlot ||
      selectedPlot.status !== "empty"
    ) return;
    if (selectedPlot.soilMoisture < MIN_PLANTING_SOIL_MOISTURE) {
      showLowMoistureDialog();
      return;
    }
    if (selectedPlotIndex !== null) openFarmModal({ type: "plant", plotIndex: selectedPlotIndex });
  };

  const handlePlantSeedWithFertilizer = (
    cropId: CropId,
    fertilizerId: FertilizerTypeId | null
  ) => {
    const modal = farmModalRef.current;
    if (modal?.type !== "plant") return;
    const plotIndex = modal.plotIndex;
    closeFarmModal();

    const currentNow = Date.now();

    updateFarm((farm, draft) => {
      const res = plantSeedWithFertilizer(
        farm,
        plotIndex,
        cropId,
        fertilizerId,
        currentNow
      );
      if (res.success && fertilizerId) {
        recordFertilizerUsed(draft, fertilizerId);
      }
      if (
        !res.success &&
        res.message === "Đất đang thiếu nước trầm trọng, hãy tưới nước trước rồi trồng cây sau"
      ) {
        // This is a transaction result; modal replacement itself is synchronous.
        setTimeout(showLowMoistureDialog, 0);
        return;
      }
      if (res.message) {
        return { message: res.message, visualEvent: res.success ? {
          id: `sow-${plotIndex}-${currentNow}`, plotIndex, kind: 'sow', cropId, startedAt: currentNow,
        } : undefined };
      }
    }, currentNow);
  };

  const handleWaterPlot = () => {
    if (selectedPlotIndex === null) return;
    const currentNow = Date.now();
    updateFarm((farm, draft) => {
      const result = waterSelectedPlot(
        farm,
        selectedPlotIndex,
        currentNow
      );
      if (result.success) recordWatering(draft, 1);
      return { message: result.message, visualEvent: result.success ? {
        id: `water-${selectedPlotIndex}-${currentNow}`, plotIndex: selectedPlotIndex, kind: "water", startedAt: currentNow,
      } : undefined };
    }, currentNow);
  };

  const handleTreatPest = () => {
    if (selectedPlotIndex === null) return;
    const currentNow = Date.now();
    updateFarm((farm) => {
      const result = treatPestOnSelectedPlot(
        farm,
        selectedPlotIndex,
        currentNow
      );
      return { message: result.message, visualEvent: result.success ? {
        id: `pest-${selectedPlotIndex}-${currentNow}`, plotIndex: selectedPlotIndex, kind: "pest", startedAt: currentNow,
      } : undefined };
    }, currentNow);
  };

  const handleApplyFertilizer = (fertilizerId: FertilizerTypeId) => {
    const modal = farmModalRef.current;
    if (modal?.type !== "apply-fertilizer") return;
    const plotIndex = modal.plotIndex;
    closeFarmModal();
    const currentNow = Date.now();
    updateFarm((farm, draft) => {
      const result = applyFertilizerToGrowingCrop(
        farm,
        plotIndex,
        fertilizerId,
        currentNow
      );
      if (result.success) recordFertilizerUsed(draft, fertilizerId);
      return { message: result.message, visualEvent: result.success ? {
        id: `fertilizer-${plotIndex}-${currentNow}`, plotIndex, kind: "fertilizer", startedAt: currentNow, fertilizerId,
      } : undefined };
    }, currentNow);
  };

  const handleHarvestSinglePlot = () => {
    if (selectedPlotIndex === null) return;
    handleHarvestSinglePlotForIndex(selectedPlotIndex);
  };

  const handleHarvestAll = () => {
    if (
      harvestAllActionMode !== "harvest_all" ||
      harvestAllLockRef.current
    ) {
      return;
    }
    harvestAllLockRef.current = true;
    setIsHarvestingAll(true);
    const currentNow = Date.now();

    updateFarm((farm, draft) => {
      const res = harvestAllReadyCrops(farm, currentNow);
      if (res.harvestedCount > 0) {
        for (const detail of res.details) {
          recordCropHarvestForMedals(
            draft,
            detail.hasFertilizer
          );
        }
        recordPerfectFarmItemSale(
          draft,
          res.details.filter((detail) => detail.quality === "hoan_my").length,
        );
        return {
          goldEarned: res.totalGold,
          xpEarned: res.totalXp,
          plotRewards: res.details.map((detail) => ({
            id: `harvest-all-${detail.plotIndex}-${currentNow}`,
            plotIndex: detail.plotIndex,
            cropId: detail.cropId,
            quality: detail.quality,
            goldAwarded: detail.goldAwarded,
            xpAwarded: detail.xpAwarded,
            startedAt: currentNow,
            glowUntil: currentNow + HARVEST_ALL_CROP_GLOW_DURATION_MS,
          })),
        };
      } else {
        return { message: "Không có cây nào sẵn sàng thu hoạch!" };
      }
    }, currentNow);

    const unlockTimer = window.setTimeout(() => {
      harvestAllLockRef.current = false;
      setIsHarvestingAll(false);
    }, HARVEST_ALL_CROP_GLOW_DURATION_MS);
    harvestPresentationTimersRef.current.push(unlockTimer);
  };

  const handleClearPlot = () => {
    if (selectedPlotIndex === null) return;
    const plot = farmState.plots[selectedPlotIndex];
    if (!plot || plot.status === "locked" || plot.status === "empty") {
      showToast("Ô đất đang trống!");
      return;
    }

    openFarmDialog({
      title: "Xúc Đất Dọn Cây",
      message: `Bạn có chắc muốn xúc đất dọn bỏ cây ở Ô đất #${
        selectedPlotIndex + 1
      }? Cây sẽ bị xóa để lấy đất gieo hạt mới.`,
      confirmLabel: "Dọn Đất",
      onConfirm: () => {
        updateFarm((farm) => {
          clearPlot(farm, selectedPlotIndex);
        });
        showToast(`Đã xúc đất dọn sạch Ô đất #${selectedPlotIndex + 1}!`);
        closeFarmModal();
      },
    });
  };

  const handleUnlockPlot = (plotIndex: number) => {
    setContextMode("garden");
    setSelectedPlotIndex(plotIndex);
    setSelectedAnimalId(null);

    const config = FARM_PLOT_UNLOCKS.find((u) => u.plotIndex === plotIndex);
    if (!config) return;

    if (!rankAtLeast(currentRank, config.requiredRank)) {
      showToast(
        `Chưa đủ quân hàm mở khóa (${getRankNameForDisplay(
          config.requiredRank
        )})!`
      );
      return;
    }

    if (farmState.gold < config.gold) {
      showToast(`Cần ${config.gold} Vàng để mở khóa ô đất này!`);
      return;
    }

    openFarmDialog({
      title: "Mở Khóa Ô Đất Mới",
      message: `Mở khóa Ô đất #${plotIndex + 1} với chi phí ${
        config.gold
      } Vàng?`,
      confirmLabel: "Mở Khóa",
      onConfirm: () => {
        const unlockedAt = Date.now();
        updateFarm((farm) => {
          farm.gold -= config.gold;
          farm.unlockedPlotCount = Math.max(
            farm.unlockedPlotCount || 0,
            plotIndex + 1
          );
          farm.plots[plotIndex] = {
            status: "empty",
            soilMoisture: 100,
            soilMoistureUpdatedAt: unlockedAt,
          };
          return { visualEvent: { id: `unlock-${plotIndex}-${unlockedAt}`, plotIndex, kind: 'unlock', startedAt: unlockedAt } };
        }, unlockedAt);
        showToast(`Đã mở khóa thành công Ô đất #${plotIndex + 1}!`);
        closeFarmModal();
      },
    });
  };

  // --- PEN ACTIONS ---
  const handlePenTap = () => {
    if (selectedAnimalId !== null) {
      setContextMode("none");
      setSelectedPlotIndex(null);
      setSelectedAnimalId(null);
      return;
    }
    setContextMode("pen");
    setSelectedPlotIndex(null);
  };

  const handleAnimalTap = (instanceId: string) => {
    setContextMode("pen");
    setSelectedPlotIndex(null);
    setSelectedAnimalId(instanceId);
  };

  const handleEnterPen = (animalId: AnimalTypeId) => {
    const currentNow = Date.now();
    updateFarm((farm, draft) => {
      const res = addAnimalToPen(farm, animalId, currentNow, currentRank);
      if (res.success) {
        evaluateMedalUnlocks(draft);
      }
      return { message: res.message };
    }, currentNow);
  };

  const handleFeedPen = (feedId: FeedTypeId, quantity: number = 1) => {
    const currentNow = Date.now();
    updateFarm((farm, draft) => {
      const res = feedPenBuff(farm, feedId, quantity, currentNow);
      if (res.success && res.quantityFed) {
        recordFeedBagsUsed(draft, res.quantityFed);
      }
      return { message: res.message, visualEvent: res.success ? {
        id: `feed-${currentNow}`, plotIndex: -1, kind: 'feed', startedAt: currentNow,
      } : undefined };
    }, currentNow);
  };

  const handleSellEggsSingle = (eggTypeId: EggTypeId, count: number) => {
    updateFarm((farm, draft) => {
      const res = sellEggs(farm, eggTypeId, count);
      if (res.soldCount > 0) {
        recordEggSale(draft, res.soldCount);
        recordPerfectFarmItemSale(draft, res.soldByQuality.hoan_my);
        const eggInfo = EGG_INFO_MAP[eggTypeId];
        return {
          visualEvent: { id: `egg-${Date.now()}`, plotIndex: -1, kind: "egg", startedAt: Date.now() },
          goldEarned: res.goldEarned,
          xpEarned: res.xpEarned,
          summaryData: {
            title: "Tổng Kết Bán Trứng",
            iconType: "egg_sale",
            itemsSummary: [
              { name: eggInfo?.name || "Trứng", count: res.soldCount, icon: "🥚" },
            ],
            goldEarned: res.goldEarned,
            xpEarned: res.xpEarned,
            soldByQuality: res.soldByQuality,
            qualityBreakdown: res.qualityBreakdown,
            rainBonusGold: res.totalRainBonusGold,
            message: `Giao dịch thành công ${res.soldCount} ${eggInfo?.name || "trứng"}!`,
          },
        };
      }
    });
  };

  const handleSellAllEggsQuick = () => {
    if (totalEggCount <= 0) {
      showToast("Kho trứng hiện đang trống!");
      return;
    }

    updateFarm((farm, draft) => {
      const res = sellAllEggs(farm);
      if (res.totalCount > 0) {
        recordEggSale(draft, res.totalCount);
        recordPerfectFarmItemSale(draft, res.soldByQuality.hoan_my);
        return {
          visualEvent: { id: `egg-all-${Date.now()}`, plotIndex: -1, kind: "egg", startedAt: Date.now() },
          goldEarned: res.totalGold,
          xpEarned: res.totalXp,
          summaryData: {
            title: "Tổng Kết Bán Tất Cả Trứng",
            iconType: "egg_sale",
            itemsSummary: [
              { name: "Tổng số trứng đã bán", count: res.totalCount, icon: "🥚" },
            ],
            goldEarned: res.totalGold,
            xpEarned: res.totalXp,
            soldByQuality: res.soldByQuality,
            qualityBreakdown: res.qualityBreakdown,
            rainBonusGold: res.totalRainBonusGold,
            message: `Đã bán toàn bộ ${res.totalCount} quả trứng trong kho!`,
          },
        };
      }
    });
  };

  const handleDismissAnimal = () => {
    if (!selectedAnimalId) {
      showToast("Vui lòng chạm chọn 1 con thú trong chuồng để đuổi!");
      return;
    }

    const animal = farmState.penAnimals.find(
      (a) => a.instanceId === selectedAnimalId
    );
    const animalDef = ANIMAL_CATALOG.find(
      (a) => a.id === animal?.animalTypeId
    );
    const dead = Boolean(animal && isAnimalDead(animal));

    openFarmDialog({
      title: dead ? "Dọn Vật Nuôi" : "Đuổi Vật Nuôi",
      message: dead
        ? `Dọn ${animalDef?.name || "vật nuôi"} đã chết để giải phóng ô chuồng? Hành động này không hoàn Trứng, Vàng hoặc XP.`
        : `Bạn có chắc muốn đuổi con ${
            animalDef?.name || "vật nuôi"
          } này khỏi chuồng để nhường chỗ cho thú mới?`,
      confirmLabel: dead ? "Dọn" : "Đuổi Thú",
      onConfirm: () => {
        updateFarm((farm) => {
          dismissAnimal(farm, selectedAnimalId);
        });
        setSelectedAnimalId(null);
        setContextMode("none");
        showToast(dead ? "Đã dọn vật nuôi chết và giải phóng ô chuồng!" : "Đã đuổi vật nuôi khỏi chuồng!");
        closeFarmModal();
      },
    });
  };

  // Selected plot information
  const currentSelectedPlot =
    selectedPlotIndex !== null
      ? presentationState.plots[selectedPlotIndex]
      : null;
  const canWaterSelectedPlot = currentSelectedPlot
    ? canWaterPlot(currentSelectedPlot)
    : false;
  const canTreatSelectedPlot = canTreatPest(currentSelectedPlot);
  const canApplyFertilizer =
    currentSelectedPlot?.status === "growing" &&
    !hasCropFertilizer(currentSelectedPlot);
  const currentSelectedAnimal = selectedAnimalId
    ? presentationState.penAnimals.find(
        (animal) => animal.instanceId === selectedAnimalId
      ) ?? null
    : null;
  const currentSelectedAnimalIsDead = Boolean(
    currentSelectedAnimal && isAnimalDead(currentSelectedAnimal)
  );

  const handleClearSelection = () => {
    setContextMode("none");
    setSelectedPlotIndex(null);
    setSelectedAnimalId(null);
  };

  return (
    <CommandMenuProvider kind="logistics" reducedMotion={gameState.settings.reducedMotion}>
    <div
      onClick={handleClearSelection}
      data-farm-reduced-motion={gameState.settings.reducedMotion ? "true" : undefined}
      className={`command-art-menu command-art-logistics command-screen logistics-command-screen w-full max-w-5xl mx-auto p-2 sm:p-4 space-y-3 font-sans pb-36 relative ${mobileActive ? 'farm-graphics-screen' : FARM_MOBILE_REQUESTED ? 'overflow-y-auto h-full' : ''}`}
    >
      {/* --- HUD HEADER (STICKY) --- */}
      {farmModal?.type !== "trough" && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleClearSelection();
          }}
          className="logistics-hud command-panel sticky top-0 z-50 w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-xl backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-base sm:text-lg shadow-md shrink-0">
              🪙
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                Ví Vàng
              </div>
              <div className="text-base sm:text-lg font-black text-amber-300 font-mono leading-none">
                {farmState.gold.toLocaleString()}{" "}
                <span className="text-[10px] sm:text-xs text-amber-400">Vàng</span>
              </div>
            </div>
          </div>

          {/* Center Weather HUD */}
          <WeatherHUD
            currentSlot={currentWeatherSlot}
            onOpenWeatherModal={() => openFarmModal({ type: "weather" })}
          />

          {/* Action Buttons Header */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Kho Button with Badge */}
            <button aria-label="Kho"
              onClick={(e) => {
                e.stopPropagation();
                handleClearSelection();
                openKho();
              }}
              className="relative px-2.5 sm:px-3 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-amber-300 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <FarmToolIcon mobile={mobileActive} name="warehouse" className="w-3.5 h-3.5 sm:w-4 sm:h-4" legacy={<Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />} />
              <span className={mobileActive ? "farm-entry-label" : "hidden sm:inline"}>Kho</span>
              {totalEggCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white font-black text-[10px] shadow-md animate-bounce">
                  {totalEggCount}
                </span>
              )}
            </button>

            {/* Store Button */}
            <button aria-label="Cửa Hàng"
              onClick={(e) => {
                e.stopPropagation();
                handleClearSelection();
                openStore();
              }}
              className="px-2.5 sm:px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <FarmToolIcon mobile={mobileActive} name="store" className="w-3.5 h-3.5 sm:w-4 sm:h-4" legacy={<Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} />
              <span className={mobileActive ? "farm-entry-label" : "hidden sm:inline"}>{mobileActive ? "Cửa hàng" : "Cửa Hàng"}</span>
            </button>
          </div>
        </div>
      )}

      <FarmXpProgressBar gameState={gameState} />

      {/* --- MAIN 2D TOP-DOWN SCENE (SINGLE SCREEN) --- */}
      {mobileActive ? (<FarmMobilePresentation
        bridge={{
          snapshot: adaptFarmMobile(gameState, farmState, presentationState, currentRank, currentWeatherSlot, now),
          modal: farmModal, openModal: openFarmModal,
          selectedPlot: selectedPlotIndex, selectedAnimal: selectedAnimalId,
          selectPlot: index => {
            if (farmState.plots[index]?.status === "locked") handleUnlockPlot(index);
            else handlePlotTap(index);
          }, selectAnimal: handleAnimalTap,
        }}
        toast={toastMessage} events={[...visualEvents, ...harvestPresentations.map(event => ({
          id: event.id, plotIndex: event.plotIndex, kind: 'harvest' as const, cropId: event.cropId, startedAt: event.startedAt,
        }))]} reducedMotion={gameState.settings.reducedMotion}
        onGardenTap={handleGardenTap} onPenTap={handlePenTap}
        pushTarget={pushTarget} onExit={() => { closeFarmModal(); setMobileActive(false); }}
      />) : <TangGiaCanvas2D
        reducedMotion={gameState.settings.reducedMotion}
        plots={presentationState.plots}
        penAnimals={presentationState.penAnimals}
        eggCount={totalEggCount}
        penFeedBuffValue={presentationState.penFeedBuffValue}
        penFeedEmptyAt={presentationState.penFeedEmptyAt}
        activeFeedSpeedBonus={presentationState.activeFeedSpeedBonus}
        penStarvationStartedAt={presentationState.penStarvationStartedAt}
        selectedPlotIndex={selectedPlotIndex}
        selectedAnimalId={selectedAnimalId}
        contextMode={contextMode}
        gold={farmState.gold}
        currentRank={currentRank}
        currentWeatherSlot={currentWeatherSlot}
        weatherSeed={farmState.weatherSeed ?? 133742}
        harvestPresentations={harvestPresentations}
        visualEvents={visualEvents}
        onGardenTap={handleGardenTap}
        onPlotTap={(index) => {
          const plot = farmState.plots[index];
          if (plot && plot.status === "locked") {
            handleUnlockPlot(index);
          } else {
            handlePlotTap(index);
          }
        }}
        onPenTap={handlePenTap}
        onAnimalTap={handleAnimalTap}
        onOpenEggStorage={() => {
          handleClearSelection();
          openKho("egg");
        }}
        onOpenFeedModal={() => openFarmModal({ type: "feed" })}
        isTroughInfoOpen={farmModal?.type === "trough"}
        onOpenTroughInfo={() => openFarmModal({ type: "trough" })}
        onCloseTroughInfo={closeFarmModal}
        now={now}
      />}

      {/* --- CONTEXTUAL BOTTOM TOOLBAR --- */}
      {contextMode !== "none" && farmModal?.type !== "trough" && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px)+0.5rem)] left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div data-farm-context={contextMode} data-farm-selection={selectedPlotIndex !== null || selectedAnimalId !== null ? "selected" : "none"} className="logistics-action-toolbar bg-slate-900/95 border-2 border-amber-500/80 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex items-center justify-around gap-1.5">
            {/* TOOLBAR FOR GARDEN MODE */}
            {contextMode === "garden" && (
              <>
                {/* Store */}
                <button
                  onClick={() => openStore("crop")}
                  className="h-14 flex-1 rounded-xl border border-slate-700/80 bg-slate-800 hover:bg-slate-700 text-slate-200 flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                >
                  <FarmToolIcon mobile={mobileActive} name="store" className="w-4 h-4 shrink-0" legacy={<Store className="w-4 h-4 text-amber-400 shrink-0" />} />
                  <span className="text-[10px] font-extrabold leading-none">Cửa Hàng</span>
                </button>

                {/* Context-sensitive crop slot: plant only on Empty, treat at Pest warning+. */}
                {currentSelectedPlot?.status === "empty" ? (
                  <button
                    onClick={handleOpenPlantModal}
                    className="h-14 flex-1 rounded-xl border border-slate-700/80 bg-slate-800 text-slate-200 shadow-sm transition-all hover:bg-slate-700 active:scale-95 flex flex-col items-center justify-center gap-1"
                  >
                    <FarmToolIcon mobile={mobileActive} name="plant" className="w-4 h-4 shrink-0" legacy={<Sprout className="w-4 h-4 shrink-0 text-emerald-400" />} />
                    <span className="text-[10px] font-extrabold leading-none">Trồng Cây</span>
                  </button>
                ) : canTreatSelectedPlot ? (
                  <button
                    onClick={handleTreatPest}
                    data-pest-action="selected-plot"
                    className="h-14 flex-1 rounded-xl border border-lime-400/80 bg-gradient-to-r from-lime-500 to-emerald-600 text-slate-950 font-black shadow-sm shadow-lime-500/20 transition-all hover:from-lime-400 hover:to-emerald-500 active:scale-95 flex flex-col items-center justify-center gap-1"
                  >
                    <FarmToolIcon mobile={mobileActive} name="pest" legacy={<span className="text-base leading-none" aria-hidden="true">🐛</span>} />
                    <span className="text-[10px] font-extrabold leading-none">Diệt Sâu</span>
                  </button>
                ) : null}

                {/* Water selected plot */}
                <button
                  disabled={!canWaterSelectedPlot}
                  onClick={handleWaterPlot}
                  data-water-action="selected-plot"
                  className={`h-14 flex-1 rounded-xl border flex flex-col items-center justify-center gap-1 shadow-sm transition-all ${
                    canWaterSelectedPlot
                      ? "border-sky-400 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black shadow-sky-500/20 active:scale-95 animate-pulse"
                      : "border-slate-800/80 bg-slate-900/60 text-slate-600 cursor-not-allowed opacity-60"
                  }`}
                >
                  <FarmToolIcon mobile={mobileActive} name="water" className="w-4 h-4 shrink-0" legacy={<Droplets
                    className={`w-4 h-4 shrink-0 ${
                      canWaterSelectedPlot ? "text-slate-950" : "text-slate-600"
                    }`}
                  />} />
                  <span className="text-[10px] font-extrabold leading-none">Tưới Nước</span>
                </button>

                <button
                  disabled={!canApplyFertilizer}
                  onClick={() => selectedPlotIndex !== null && openFarmModal({ type: "apply-fertilizer", plotIndex: selectedPlotIndex })}
                  data-fertilizer-action="selected-plot"
                  className={`h-14 flex-1 rounded-xl border flex flex-col items-center justify-center gap-1 shadow-sm transition-all ${
                    canApplyFertilizer
                      ? "border-amber-500/70 bg-slate-800 text-amber-200 hover:bg-slate-700 active:scale-95"
                      : "border-slate-800/80 bg-slate-900/60 text-slate-600 cursor-not-allowed opacity-60"
                  }`}
                >
                  <FarmToolIcon mobile={mobileActive} name="fertilizer" className="w-4 h-4 shrink-0" legacy={<Sparkles className={`h-4 w-4 ${canApplyFertilizer ? "text-amber-400" : "text-slate-600"}`} />} />
                  <span className="text-[10px] font-extrabold leading-none">Bón Phân</span>
                </button>

                {/* Single harvest is scoped to the selected ready plot. */}
                <button
                  disabled={currentSelectedPlot?.status !== "ready"}
                  onClick={handleHarvestSinglePlot}
                  data-harvest-action="single"
                  className={`h-14 flex-1 rounded-xl border flex flex-col items-center justify-center gap-1 shadow-sm transition-all ${
                    currentSelectedPlot?.status === "ready"
                      ? currentSelectedPlot.qualityPenalty === "common_only"
                        ? "border-red-300 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-red-500/20 active:scale-95 animate-pulse"
                        : "border-amber-400 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-amber-500/20 active:scale-95 animate-pulse"
                      : "border-slate-800/80 bg-slate-900/60 text-slate-600 cursor-not-allowed opacity-60"
                  }`}
                >
                  <FarmToolIcon mobile={mobileActive} name="harvest" className="w-4 h-4 shrink-0" legacy={<Sparkles
                    className={`w-4 h-4 shrink-0 ${
                      currentSelectedPlot?.status === "ready" ? "text-slate-950" : "text-slate-600"
                    }`}
                  />} />
                  <span className="text-[10px] font-extrabold leading-none">Thu Hoạch</span>
                </button>

                {harvestAllActionMode === "harvest_all" ? (
                  <button
                    disabled={isHarvestingAll}
                    onClick={handleHarvestAll}
                    data-harvest-action="all"
                    className="h-14 flex-1 rounded-xl border border-orange-300 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-sm shadow-orange-500/25 transition-all hover:from-orange-400 hover:to-amber-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FarmToolIcon mobile={mobileActive} name="harvest" className="mx-auto h-4 w-4" legacy={<Sparkles className="mx-auto h-4 w-4" />} />
                    <span className="mt-1 block text-[9px] font-black leading-none">
                      Thu Hoạch Tất Cả
                    </span>
                  </button>
                ) : (
                  <button
                    disabled={
                      !currentSelectedPlot ||
                      currentSelectedPlot.status === "empty" ||
                      currentSelectedPlot.status === "locked"
                    }
                    onClick={handleClearPlot}
                    data-harvest-action="clear-plot"
                    className={`h-14 flex-1 rounded-xl border flex flex-col items-center justify-center gap-1 shadow-sm transition-all ${
                      currentSelectedPlot &&
                      currentSelectedPlot.status !== "empty" &&
                      currentSelectedPlot.status !== "locked"
                        ? "border-slate-700/80 bg-slate-800 hover:bg-red-950/80 hover:border-red-700/80 text-slate-200 hover:text-red-300 active:scale-95"
                        : "border-slate-800/80 bg-slate-900/60 text-slate-600 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <FarmToolIcon mobile={mobileActive} name="clear" className="w-4 h-4 shrink-0" legacy={<Trash2
                      className={`w-4 h-4 shrink-0 ${
                        currentSelectedPlot &&
                        currentSelectedPlot.status !== "empty" &&
                        currentSelectedPlot.status !== "locked"
                          ? "text-red-400"
                          : ""
                      }`}
                    />} />
                    <span className="text-[10px] font-extrabold leading-none">Xúc Đất</span>
                  </button>
                )}
              </>
            )}

            {/* TOOLBAR FOR PEN MODE */}
            {contextMode === "pen" && (
              <>
                {/* Store */}
                <button
                  onClick={() => openStore("animal")}
                  className="h-14 flex-1 rounded-xl border border-slate-700/80 bg-slate-800 hover:bg-slate-700 text-slate-200 flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                >
                  <FarmToolIcon mobile={mobileActive} name="store" className="w-4 h-4 shrink-0" legacy={<Store className="w-4 h-4 text-amber-400 shrink-0" />} />
                  <span className="text-[10px] font-extrabold leading-none">Cửa Hàng</span>
                </button>

                {/* Enter Pen */}
                <button
                  onClick={() => openFarmModal({ type: "enter-pen" })}
                  className="h-14 flex-1 rounded-xl border border-slate-700/80 bg-slate-800 hover:bg-slate-700 text-slate-200 flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                >
                  <FarmToolIcon mobile={mobileActive} name="herd" legacy={<span className="text-base leading-none shrink-0">🐓</span>} />
                  <span className="text-[10px] font-extrabold leading-none">Thả Nuôi</span>
                </button>

                {/* Feed Pen */}
                <button
                  onClick={() => openFarmModal({ type: "feed" })}
                  className="h-14 flex-1 rounded-xl border border-slate-700/80 bg-slate-800 hover:bg-slate-700 text-slate-200 flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                >
                  <FarmToolIcon mobile={mobileActive} name="feed" className="w-4 h-4 shrink-0" legacy={<Wheat className="w-4 h-4 text-emerald-400 shrink-0" />} />
                  <span className="text-[10px] font-extrabold leading-none">Cho Ăn</span>
                </button>

                {/* Sell Eggs */}
                <button
                  onClick={handleSellAllEggsQuick}
                  className={`h-14 flex-1 rounded-xl border flex flex-col items-center justify-center gap-1 shadow-sm transition-all ${
                    totalEggCount > 0
                      ? "border-amber-400 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-amber-500/20 active:scale-95 animate-pulse"
                      : "border-slate-700/80 bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95"
                  }`}
                >
                  <FarmToolIcon mobile={mobileActive} name="egg" className="w-4 h-4 shrink-0" legacy={<Egg
                    className={`w-4 h-4 shrink-0 ${
                      totalEggCount > 0 ? "text-slate-950" : "text-amber-400"
                    }`}
                  />} />
                  <span className="text-[10px] font-extrabold leading-none">Bán Trứng</span>
                </button>

                {/* Dismiss Animal */}
                <button
                  disabled={!selectedAnimalId}
                  onClick={handleDismissAnimal}
                  className={`h-14 flex-1 rounded-xl border flex flex-col items-center justify-center gap-1 shadow-sm transition-all ${
                    selectedAnimalId
                      ? "border-slate-700/80 bg-slate-800 hover:bg-red-950/80 hover:border-red-700/80 text-slate-200 hover:text-red-300 active:scale-95"
                      : "border-slate-800/80 bg-slate-900/60 text-slate-600 cursor-not-allowed opacity-60"
                  }`}
                >
                  {currentSelectedAnimalIsDead ? <FarmToolIcon mobile={mobileActive} name="clear" className="w-4 h-4 shrink-0" legacy={<Trash2
                    className={`w-4 h-4 shrink-0 ${
                      selectedAnimalId ? "text-red-400" : ""
                    }`}
                  />} /> : <FarmToolIcon mobile={mobileActive} name="dismiss" className="w-4 h-4 shrink-0" legacy={<UserX
                    className={`w-4 h-4 shrink-0 ${
                      selectedAnimalId ? "text-red-400" : ""
                    }`}
                  />} />}
                  <span className="text-[10px] font-extrabold leading-none">
                    {currentSelectedAnimalIsDead ? "Dọn" : "Đuổi"}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- TOAST POPUP --- */}
      {toastMessage && (
        <OverlayPortal>
          <div className="app-overlay-toast modal-design modal-toast flex items-center gap-2" data-modal-archetype="info" role="status">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </OverlayPortal>
      )}

      {/* --- CONFIRMATION DIALOG MODAL --- */}
      {dialogConfig && (
        <ConfirmationDialog status="warning" theme="farm"
          onClose={() => closeFarmModal()}
          labelledBy="farm-confirmation-title"
          panelClassName="text-center"
        >
            <OverlayHeader>
            <h3 id="farm-confirmation-title" className="modal-title">
              {dialogConfig.title}
            </h3>
            </OverlayHeader>
            <OverlayBody>
            <p className="text-xs text-[var(--modal-text)] leading-relaxed">
              {dialogConfig.message}
            </p>
            </OverlayBody>
            <OverlayFooter className="flex items-center" data-stack-actions="true">
              <ModalButton variant="ghost"
                onClick={() =>
                  closeFarmModal()
                }
                className="flex-1"
              >
                Hủy Bỏ
              </ModalButton>
              <ModalButton variant="primary"
                onClick={() => {
                  if (dialogConfig.onConfirm) dialogConfig.onConfirm();
                }}
                className="flex-1"
              >
                {dialogConfig.confirmLabel || "Xác Nhận"}
              </ModalButton>
            </OverlayFooter>
        </ConfirmationDialog>
      )}

      {/* --- ALL GAME MODALS --- */}
      {farmModal?.type === "store" && (
        <FarmStoreModal
          mobileVisual={mobileActive}
          isOpen={true}
          onClose={closeFarmModal}
          gold={farmState.gold}
          currentRank={currentRank}
          inventory={farmState.inventory}
          initialTab={farmModal.tab}
          onBuyCrop={handleBuyCrop}
          onBuyAnimal={handleBuyAnimal}
          onBuyFeed={handleBuyFeed}
          onBuyFertilizer={handleBuyFertilizer}
        />
      )}

      {farmModal?.type === "inventory" && (
        <KhoModal
          mobileVisual={mobileActive}
          isOpen={true}
          onClose={closeFarmModal}
          inventory={farmState.inventory}
          eggQualityInventory={farmState.eggQualityInventory}
          initialTab={farmModal.tab}
          onSellItem={handleSellItem}
          onSellEggs={handleSellEggsSingle}
          onSellAllEggs={handleSellAllEggsQuick}
          onOpenStore={openStore}
        />
      )}

      {farmModal?.type === "plant" && (
        <PlantSeedModal
          key={farmModal.plotIndex}
          isOpen={true}
          onClose={closeFarmModal}
          inventory={farmState.inventory}
          initialFertilizerId={selectedPlotLastFertilizerId}
          onSelectSeedWithFertilizer={handlePlantSeedWithFertilizer}
          onOpenStore={() => openStore("crop")}
        />
      )}

      {farmModal?.type === "apply-fertilizer" && (
        <ApplyFertilizerModal
          key={farmModal.plotIndex}
          isOpen={true}
          onClose={closeFarmModal}
          inventory={farmState.inventory}
          onConfirm={handleApplyFertilizer}
          onOpenStore={() => openStore("fertilizer")}
        />
      )}

      {farmModal?.type === "enter-pen" && (
        <EnterPenModal
          isOpen={true}
          onClose={closeFarmModal}
          inventory={farmState.inventory}
          penAnimals={farmState.penAnimals}
          currentRank={currentRank}
          onEnterPen={handleEnterPen}
          onOpenStore={() => openStore("animal")}
        />
      )}

      {farmModal?.type === "feed" && (
        <FeedModal
          isOpen={true}
          onClose={closeFarmModal}
          inventory={farmState.inventory}
          penFeedBuffValue={presentationState.penFeedBuffValue}
          activeFeedSpeedBonus={presentationState.activeFeedSpeedBonus}
          onSelectFeed={handleFeedPen}
          onOpenStore={() => openStore("feed")}
        />
      )}

      {farmModal?.type === "reward" && (
        <RewardSummaryModal
          isOpen={true}
          onClose={closeFarmModal}
          data={farmModal.summary}
        />
      )}

      {farmModal?.type === "trough" && (
        <TroughInfoModal
          isOpen={true}
          onClose={closeFarmModal}
          onFeed={mobileActive ? () => openFarmModal({ type: "feed" }) : undefined}
          penAnimals={presentationState.penAnimals}
          penFeedBuffValue={presentationState.penFeedBuffValue}
          penFeedEmptyAt={presentationState.penFeedEmptyAt}
          activeFeedSpeedBonus={presentationState.activeFeedSpeedBonus}
          penStarvationStartedAt={presentationState.penStarvationStartedAt}
          now={now}
        />
      )}

      {farmModal?.type === "weather" && (
        <WeatherModal
          isOpen={true}
          onClose={closeFarmModal}
          currentSlot={currentWeatherSlot}
        />
      )}
    </div>
    </CommandMenuProvider>
  );
};
