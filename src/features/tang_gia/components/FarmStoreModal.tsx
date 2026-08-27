import React, { useState, useEffect } from "react";
import { RankStep } from "../../../game/types";
import {
  ANIMAL_CATALOG,
  CROP_CATALOG,
  FEED_CATALOG,
  FERTILIZER_CATALOG,
} from "../farmCatalog";
import {
  getRankNameForDisplay,
  rankAtLeast,
} from "../farmEngine";
import {
  AnimalTypeId,
  CropId,
  FeedTypeId,
  FertilizerTypeId,
  FarmInventory,
} from "../farmTypes";
import { X, Lock, ShoppingBag, Minus, Plus } from "lucide-react";
import { adjustIntegerQuantity } from "../../../utils/quantityInput";
import {
  getCropAsset,
  getFeedAsset,
  getFertilizerAsset,
} from "../tangGiaAssetManifest";
import { FARM_UI_SPRITE_VARS } from "../farmUiTheme";

interface FarmStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  gold: number;
  currentRank: RankStep;
  inventory: FarmInventory;
  initialTab?: "crop" | "fertilizer" | "animal" | "feed";
  onBuyCrop: (cropId: CropId, quantity?: number) => void;
  onBuyAnimal: (animalId: AnimalTypeId, quantity?: number) => void;
  onBuyFeed: (feedId: FeedTypeId, quantity?: number) => void;
  onBuyFertilizer: (fertilizerId: FertilizerTypeId, quantity?: number) => void;
}

const formatTimeVN = (ms: number): string => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hStr = String(hours).padStart(2, "0");
  const mStr = String(minutes).padStart(2, "0");
  return `${hStr}h${mStr}m`;
};

const formatLifespanHours = (ms: number): string =>
  `${Math.max(0, Math.round(ms / (60 * 60 * 1000))).toLocaleString("vi-VN")} giờ`;

const formatPrice = (goldCost: number): string => {
  if (goldCost === 0) return "Miễn phí";
  return `🪙${goldCost.toLocaleString("vi-VN")} Vàng`;
};

const getAnimalEmoji = (id: AnimalTypeId) => {
  switch (id) {
    case "chicken": return "🐓";
    case "duck": return "🦆";
    case "quail": return "🐦";
    case "goose": return "🪿";
    case "muscovy_duck": return "🦆";
    case "turkey": return "🦃";
    case "guinea_fowl": return "🐥";
    case "pheasant": return "🕊️";
    case "peafowl": return "🦚";
    case "ostrich": return "🦤";
    default: return "🐥";
  }
};

interface PendingBuyState {
  category: "crop" | "fertilizer" | "animal" | "feed";
  itemId: string;
  name: string;
  icon: string | React.ReactNode;
  unitCostGold: number;
  ownedCount: number;
  requiredRankName: string;
}

export const FarmStoreModal: React.FC<FarmStoreModalProps> = ({
  isOpen,
  onClose,
  gold,
  currentRank,
  inventory,
  initialTab = "crop",
  onBuyCrop,
  onBuyAnimal,
  onBuyFeed,
  onBuyFertilizer,
}) => {
  const [activeTab, setActiveTab] = useState<"crop" | "fertilizer" | "animal" | "feed">(initialTab);
  const [buyModalData, setBuyModalData] = useState<PendingBuyState | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const maxAffordable = buyModalData
    ? buyModalData.unitCostGold > 0
      ? Math.max(1, Math.min(999, Math.floor(gold / buyModalData.unitCostGold)))
      : 99
    : 1;

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setBuyModalData(null);
      setBuyQuantity(1);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!buyModalData) return;
    setBuyQuantity((current) =>
      adjustIntegerQuantity(current, 0, 1, maxAffordable)
    );
  }, [buyModalData?.itemId, maxAffordable]);

  const openBuyDialog = (item: PendingBuyState) => {
    setBuyModalData(item);
    setBuyQuantity(1);
  };

  const handleConfirmBuy = () => {
    if (!buyModalData) return;
    const qty = adjustIntegerQuantity(buyQuantity, 0, 1, maxAffordable);
    switch (buyModalData.category) {
      case "crop":
        onBuyCrop(buyModalData.itemId as CropId, qty);
        break;
      case "fertilizer":
        onBuyFertilizer(buyModalData.itemId as FertilizerTypeId, qty);
        break;
      case "animal":
        onBuyAnimal(buyModalData.itemId as AnimalTypeId, qty);
        break;
      case "feed":
        onBuyFeed(buyModalData.itemId as FeedTypeId, qty);
        break;
    }
    setBuyModalData(null);
  };

  const renderOwnedBadge = (ownedCount: number) => {
    const isOwned = ownedCount > 0;
    return (
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 border transition-all ${
          isOwned
            ? "bg-amber-400 text-slate-950 font-extrabold border-amber-300 shadow-xs"
            : "font-medium text-slate-400 bg-slate-800/80 border-slate-700/50"
        }`}
      >
        Sở hữu: {ownedCount}
      </span>
    );
  };

  const renderBuyButton = (
    _cost: number,
    canBuy: boolean,
    hasRank: boolean,
    _hasGold: boolean,
    onOpenBuy: () => void
  ) => {
    if (!hasRank) {
      return (
        <button
          disabled
          className="farm-ui-secondary-button h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl font-bold text-[11px] sm:text-xs shrink-0 bg-slate-800/70 text-slate-500 border border-slate-700/50 cursor-not-allowed flex items-center justify-center gap-1 min-w-[62px] sm:min-w-[68px]"
        >
          <Lock className="w-3 h-3 text-amber-400/80 shrink-0" />
          <span>Khóa</span>
        </button>
      );
    }

    if (canBuy) {
      return (
        <button
          onClick={onOpenBuy}
          className="farm-ui-primary-button h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-xl font-black text-[11px] sm:text-xs shrink-0 transition-all flex items-center justify-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 active:scale-95 shadow-sm shadow-amber-500/20 cursor-pointer border border-amber-300/80 min-w-[62px] sm:min-w-[68px]"
        >
          <ShoppingBag className="w-3 h-3 shrink-0" />
          <span>Mua</span>
        </button>
      );
    }

    return (
      <button
        disabled
        className="farm-ui-secondary-button h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl font-bold text-[10px] sm:text-[11px] shrink-0 bg-slate-800/60 text-slate-500 border border-slate-700/40 cursor-not-allowed flex items-center justify-center min-w-[62px] sm:min-w-[68px]"
      >
        <span>Thiếu Vàng</span>
      </button>
    );
  };

  if (!isOpen) return null;

  const totalBuyCost = buyModalData ? buyQuantity * buyModalData.unitCostGold : 0;
  const canAffordBuy = gold >= totalBuyCost;

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="farm-ui-shell bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] cursor-default relative"
          style={FARM_UI_SPRITE_VARS}
        >
          {/* Modal Header (Sticky / Fixed at top of modal) */}
          <div className="farm-ui-header px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-base sm:text-lg shrink-0">
                🪙
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-100 leading-tight">
                  Cửa Hàng Tăng Gia
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  Ví Vàng:{" "}
                  <span className="font-bold text-amber-400 font-mono">
                    🪙{gold.toLocaleString("vi-VN")}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng cửa hàng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Tabs (Sticky under Header, horizontal scroll on narrow mobile) */}
          <div className="farm-ui-tabs flex sm:grid sm:grid-cols-4 gap-1 p-1.5 bg-slate-900 border-b border-slate-800 text-[11px] overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
            <button
              onClick={() => setActiveTab("crop")}
              data-active={activeTab === "crop"}
              className={`farm-ui-tab flex-1 sm:flex-initial py-1.5 px-2.5 sm:px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${
                activeTab === "crop"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <span>🌱 Cây Trồng</span>
            </button>

            <button
              onClick={() => setActiveTab("fertilizer")}
              data-active={activeTab === "fertilizer"}
              className={`farm-ui-tab flex-1 sm:flex-initial py-1.5 px-2.5 sm:px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${
                activeTab === "fertilizer"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <span>✨ Phân Bón</span>
            </button>

            <button
              onClick={() => setActiveTab("animal")}
              data-active={activeTab === "animal"}
              className={`farm-ui-tab flex-1 sm:flex-initial py-1.5 px-2.5 sm:px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${
                activeTab === "animal"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <span>🐥 Vật Nuôi</span>
            </button>

            <button
              onClick={() => setActiveTab("feed")}
              data-active={activeTab === "feed"}
              className={`farm-ui-tab flex-1 sm:flex-initial py-1.5 px-2.5 sm:px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${
                activeTab === "feed"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <span>🌾 Thức Ăn</span>
            </button>
          </div>

          {/* Tab Content List (Scrollable Area) */}
          <div className="farm-ui-content p-2 sm:p-3 overflow-y-auto space-y-2 flex-1 overscroll-contain">
            {/* TAB 1: CROPS */}
            {activeTab === "crop" &&
              CROP_CATALOG.map((crop) => {
                const hasRank = rankAtLeast(currentRank, crop.requiredRank);
                const hasGold = gold >= crop.seedCostGold;
                const canBuy = hasRank && hasGold;
                const ownedCount = inventory.seeds[crop.id] || 0;
                const rankName = getRankNameForDisplay(crop.requiredRank);

                return (
                  <div
                    key={crop.id}
                    className={`farm-ui-card p-2 sm:p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 relative overflow-hidden transition-all ${
                      hasRank
                        ? "bg-slate-800/40 hover:bg-slate-800/70 border-slate-800"
                        : "bg-slate-900/60 border-slate-800/60 opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="farm-ui-icon-slot w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center shrink-0">
                        <img
                          src={getCropAsset(crop.id, "mature")}
                          alt=""
                          aria-hidden="true"
                          className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-100 truncate">
                            {crop.name}
                          </h4>
                          {renderOwnedBadge(ownedCount)}
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-300">
                          <div className="truncate">
                            Giá: <span className="font-bold text-amber-400">{formatPrice(crop.seedCostGold)}</span>
                          </div>
                          <div className="truncate">
                            Thu: <span className="font-semibold text-emerald-400">🪙{crop.harvestGold.toLocaleString("vi-VN")}</span>
                          </div>
                          <div className="truncate">
                            TG: <span className="font-mono font-medium text-sky-300">{formatTimeVN(crop.growthMs)}</span>
                          </div>
                          <div className="truncate">
                            XP: <span className="font-semibold text-amber-300">⚡+{crop.harvestXp}</span>
                          </div>
                        </div>

                        {!hasRank && (
                          <div className="text-[10px] text-amber-400 font-semibold pt-0.5 truncate">
                            Yêu cầu: <span className="text-amber-300">{rankName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {renderBuyButton(
                      crop.seedCostGold,
                      canBuy,
                      hasRank,
                      hasGold,
                      () =>
                        openBuyDialog({
                          category: "crop",
                          itemId: crop.id,
                          name: `Hạt giống ${crop.name}`,
                          icon: (
                            <img
                              src={getCropAsset(crop.id, "mature")}
                              alt=""
                              aria-hidden="true"
                              className="h-8 w-8 object-contain"
                            />
                          ),
                          unitCostGold: crop.seedCostGold,
                          ownedCount,
                          requiredRankName: rankName,
                        })
                    )}
                  </div>
                );
              })}

            {/* TAB 2: FERTILIZER */}
            {activeTab === "fertilizer" &&
              FERTILIZER_CATALOG.map((fert) => {
                const hasRank = rankAtLeast(currentRank, fert.requiredRank);
                const hasGold = gold >= fert.purchaseGold;
                const canBuy = hasRank && hasGold;
                const ownedCount = inventory.fertilizer?.[fert.id] || 0;
                const rankName = getRankNameForDisplay(fert.requiredRank);

                return (
                  <div
                    key={fert.id}
                    className={`farm-ui-card p-2 sm:p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 relative overflow-hidden transition-all ${
                      hasRank
                        ? "bg-slate-800/40 hover:bg-slate-800/70 border-slate-800"
                        : "bg-slate-900/60 border-slate-800/60 opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="farm-ui-icon-slot w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                        <img
                          src={getFertilizerAsset(fert.id)}
                          alt=""
                          aria-hidden="true"
                          className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-100 truncate">
                            {fert.name}
                          </h4>
                          {renderOwnedBadge(ownedCount)}
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-300">
                          <div className="truncate">
                            Giá: <span className="font-bold text-amber-400">{formatPrice(fert.purchaseGold)}</span>
                          </div>
                          <div className="truncate text-emerald-400 font-semibold col-span-1">
                            {fert.category === "nutrition" && `⚡ +${Math.round(fert.xpBonusPct * 100)}% XP`}
                            {fert.category === "growth" && `⏱️ -${Math.round(fert.growthTimeReductionPct * 100)}% TG`}
                            {fert.category === "premium" && `✨ +${Math.round(fert.xpBonusPct * 100)}% XP & -${Math.round(fert.growthTimeReductionPct * 100)}% TG`}
                          </div>
                        </div>

                        {!hasRank && (
                          <div className="text-[10px] text-amber-400 font-semibold pt-0.5 truncate">
                            Yêu cầu: <span className="text-amber-300">{rankName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {renderBuyButton(
                      fert.purchaseGold,
                      canBuy,
                      hasRank,
                      hasGold,
                      () =>
                        openBuyDialog({
                          category: "fertilizer",
                          itemId: fert.id,
                          name: fert.name,
                          icon: (
                            <img
                              src={getFertilizerAsset(fert.id)}
                              alt=""
                              aria-hidden="true"
                              className="h-8 w-8 object-contain"
                            />
                          ),
                          unitCostGold: fert.purchaseGold,
                          ownedCount,
                          requiredRankName: rankName,
                        })
                    )}
                  </div>
                );
              })}

            {/* TAB 3: ANIMALS */}
            {activeTab === "animal" &&
              ANIMAL_CATALOG.map((animal) => {
                const hasRank = rankAtLeast(currentRank, animal.requiredRank);
                const hasGold = gold >= animal.purchaseGold;
                const canBuy = hasRank && hasGold;
                const ownedCount = inventory.animals[animal.id] || 0;
                const rankName = getRankNameForDisplay(animal.requiredRank);

                return (
                  <div
                    key={animal.id}
                    className={`farm-ui-card p-2 sm:p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 relative overflow-hidden transition-all ${
                      hasRank
                        ? "bg-slate-800/40 hover:bg-slate-800/70 border-slate-800"
                        : "bg-slate-900/60 border-slate-800/60 opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="farm-ui-icon-slot w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                        {getAnimalEmoji(animal.id)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-100 truncate">
                            {animal.name}
                          </h4>
                          {renderOwnedBadge(ownedCount)}
                        </div>

                        <div
                          data-animal-store-stats="compact-two-column"
                          className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-300"
                        >
                          <div className="truncate">
                            Mở: <span className="font-semibold text-violet-300">{rankName}</span>
                          </div>
                          <div className="truncate">
                            Giá: <span className="font-bold text-amber-400">{formatPrice(animal.purchaseGold)}</span>
                          </div>
                          <div className="truncate">
                            Đẻ trứng: <span className="font-mono font-medium text-sky-300">{formatTimeVN(animal.eggIntervalMs)}</span>
                          </div>
                          <div data-animal-lifespan="hours" className="truncate">
                            Tuổi thọ: <span className="font-semibold text-rose-200">{formatLifespanHours(animal.lifespanMs)}</span>
                          </div>
                          <div className="truncate">
                            Giá trứng: <span className="font-semibold text-emerald-400">🪙{animal.eggSellGold.toLocaleString("vi-VN")}</span>
                          </div>
                          <div className="truncate">
                            XP: <span className="font-semibold text-amber-300">⚡+{animal.eggSellXp}</span>
                          </div>
                        </div>

                        {!hasRank && (
                          <div className="text-[10px] text-amber-400 font-semibold pt-0.5 truncate">
                            Yêu cầu: <span className="text-amber-300">{rankName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {renderBuyButton(
                      animal.purchaseGold,
                      canBuy,
                      hasRank,
                      hasGold,
                      () =>
                        openBuyDialog({
                          category: "animal",
                          itemId: animal.id,
                          name: `Con giống ${animal.name}`,
                          icon: getAnimalEmoji(animal.id),
                          unitCostGold: animal.purchaseGold,
                          ownedCount,
                          requiredRankName: rankName,
                        })
                    )}
                  </div>
                );
              })}

            {/* TAB 4: FEED */}
            {activeTab === "feed" &&
              FEED_CATALOG.map((feed) => {
                const hasRank = rankAtLeast(currentRank, feed.requiredRank);
                const hasGold = gold >= feed.costGold;
                const canBuy = hasRank && hasGold;
                const ownedCount = inventory.feed[feed.id] || 0;
                const rankName = getRankNameForDisplay(feed.requiredRank);

                return (
                  <div
                    key={feed.id}
                    className={`farm-ui-card p-2 sm:p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 relative overflow-hidden transition-all ${
                      hasRank
                        ? "bg-slate-800/40 hover:bg-slate-800/70 border-slate-800"
                        : "bg-slate-900/60 border-slate-800/60 opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="farm-ui-icon-slot w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                        <img
                          src={getFeedAsset(feed.id)}
                          alt=""
                          aria-hidden="true"
                          className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-100 truncate">
                            {feed.name}
                          </h4>
                          {renderOwnedBadge(ownedCount)}
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-300">
                          <div className="truncate">
                            Giá: <span className="font-bold text-amber-400">{formatPrice(feed.costGold)}</span>
                          </div>
                          <div className="truncate">
                            Máng: <span className="font-semibold text-sky-300">🥣 +{feed.buffAmount}%</span>
                          </div>
                          <div className="truncate col-span-2">
                            Tốc độ đẻ trứng: <span className="font-semibold text-emerald-400">⚡ +{feed.speedBonusPercent}%</span>
                          </div>
                        </div>

                        {!hasRank && (
                          <div className="text-[10px] text-amber-400 font-semibold pt-0.5 truncate">
                            Yêu cầu: <span className="text-amber-300">{rankName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {renderBuyButton(
                      feed.costGold,
                      canBuy,
                      hasRank,
                      hasGold,
                      () =>
                        openBuyDialog({
                          category: "feed",
                          itemId: feed.id,
                          name: feed.name,
                          icon: (
                            <img
                              src={getFeedAsset(feed.id)}
                              alt=""
                              aria-hidden="true"
                              className="h-8 w-8 object-contain"
                            />
                          ),
                          unitCostGold: feed.costGold,
                          ownedCount,
                          requiredRankName: rankName,
                        })
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* QUANTITY BUY POPUP DIALOG (Independent Fullscreen Overlay) */}
      {buyModalData && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setBuyModalData(null);
          }}
          className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="farm-ui-shell farm-ui-dialog w-full max-w-sm my-auto bg-slate-900 border border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto cursor-default relative animate-in zoom-in-95 duration-150"
            style={FARM_UI_SPRITE_VARS}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="farm-ui-icon-slot w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                  {buyModalData.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-100 leading-tight">
                    Mua {buyModalData.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Đang sở hữu: <span className="font-bold text-emerald-400">{buyModalData.ownedCount}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setBuyModalData(null)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block text-center">
                Chọn số lượng muốn mua:
              </label>

              {/* Stepper + Input */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setBuyQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={buyQuantity <= 1}
                  aria-label="Giảm số lượng mua 1"
                  className="farm-ui-secondary-button w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-bold flex items-center justify-center border border-slate-700 transition-all active:scale-95 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={1}
                  max={maxAffordable}
                  value={buyQuantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (isNaN(val)) {
                      setBuyQuantity(1);
                    } else {
                      setBuyQuantity(adjustIntegerQuantity(val, 0, 1, maxAffordable));
                    }
                  }}
                  className="farm-ui-input w-20 sm:w-24 text-center py-1.5 sm:py-2 bg-slate-950 border border-slate-700 rounded-xl text-amber-300 font-black text-base sm:text-lg font-mono focus:outline-none focus:border-amber-400"
                />

                <button
                  type="button"
                  onClick={() =>
                    setBuyQuantity((prev) => Math.min(maxAffordable, prev + 1))
                  }
                  disabled={buyQuantity >= maxAffordable}
                  aria-label="Tăng số lượng mua 1"
                  className="farm-ui-secondary-button w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-bold flex items-center justify-center border border-slate-700 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Relative quick adjustment buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[-10, -5, 5, 10].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    disabled={delta < 0 ? buyQuantity <= 1 : buyQuantity >= maxAffordable}
                    onClick={() =>
                      setBuyQuantity((current) =>
                        adjustIntegerQuantity(current, delta, 1, maxAffordable)
                      )
                    }
                    aria-label={`${delta < 0 ? "Giảm" : "Tăng"} số lượng mua ${Math.abs(delta)}`}
                    className="farm-ui-secondary-button min-h-10 rounded-xl border border-slate-700 bg-slate-800 px-1.5 text-[11px] font-bold text-slate-300 transition-all hover:bg-slate-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 sm:text-xs"
                  >
                    {delta > 0 ? "+" : ""}{delta}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={buyQuantity >= maxAffordable}
                onClick={() => setBuyQuantity(maxAffordable)}
                aria-label={`Chọn số lượng mua tối đa ${maxAffordable}`}
                className="min-h-10 w-full rounded-xl border border-amber-500/40 bg-amber-500/20 px-2 text-[11px] font-bold text-amber-300 transition-all hover:bg-amber-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
              >
                Tối đa ({maxAffordable})
              </button>
            </div>

            {/* Cost Calculation Box */}
            <div className="farm-ui-summary bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 sm:p-3 space-y-1 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Đơn giá:</span>
                <span className="font-bold text-amber-400">
                  {formatPrice(buyModalData.unitCostGold)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Ví Vàng hiện có:</span>
                <span className="font-bold text-slate-200 font-mono">
                  🪙{gold.toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-1 flex items-center justify-between font-extrabold text-xs sm:text-sm">
                <span className="text-slate-200">Tổng thanh toán:</span>
                <span
                  className={`font-mono ${
                    canAffordBuy ? "text-amber-300" : "text-rose-400"
                  }`}
                >
                  {formatPrice(totalBuyCost)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setBuyModalData(null)}
                className="farm-ui-secondary-button flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={!canAffordBuy || buyQuantity <= 0}
                onClick={handleConfirmBuy}
                className="farm-ui-primary-button flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Mua ({buyQuantity})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
