import { normalizeCropReward } from "../farmEconomy";
import { FarmMarketArt } from './FarmMarketArt';
import { animalArt, cropArt, itemArt, propArt } from '../mobile/FarmArtRegistry';
import './farm-market.css';
import React, { useState, useEffect, useRef } from "react";
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
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";

interface FarmStoreModalProps {
  rewardScale?: number;
  isOpen: boolean;
  mobileVisual?: boolean;
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
  rewardScale = 1,
  isOpen,
  mobileVisual = false,
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
  const buyQuantityPristineRef = useRef(true);
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
      buyQuantityPristineRef.current = true;
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
    buyQuantityPristineRef.current = true;
  };

  const handleBuyQuantityQuickAdjust = (delta: number) => {
    const wasPristine = buyQuantityPristineRef.current;
    buyQuantityPristineRef.current = false;
    setBuyQuantity((current) =>
      adjustIntegerQuantity(
        wasPristine && delta > 0 ? 0 : current,
        delta,
        1,
        maxAffordable
      )
    );
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
        className={`farm-market-owned text-xs shrink-0 ${
          isOwned
            ? "text-[var(--modal-reward)] font-semibold"
            : "text-[var(--modal-muted)]"
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
        <ModalButton
          disabled
          className="shrink-0"
        >
          <Lock className="w-3 h-3 text-amber-400/80 shrink-0" />
          <span>Khóa</span>
        </ModalButton>
      );
    }

    if (canBuy) {
      return (
        <ModalButton variant="primary"
          onClick={onOpenBuy}
          className="shrink-0"
        >
          <ShoppingBag className="w-3 h-3 shrink-0" />
          <span>Mua</span>
        </ModalButton>
      );
    }

    return (
      <ModalButton
        disabled
        className="shrink-0"
      >
        <span>Thiếu Vàng</span>
      </ModalButton>
    );
  };

  if (!isOpen) return null;

  const totalBuyCost = buyModalData ? buyQuantity * buyModalData.unitCostGold : 0;
  const canAffordBuy = gold >= totalBuyCost;

  return (
    <>
      <AppModal theme="farm" archetype="transaction"
        overlayClassName={mobileVisual ? "farm-market" : undefined}
        onClose={onClose}
        closeOnBackdrop
        labelledBy="farm-store-title"
      >
          {/* Modal Header (Sticky / Fixed at top of modal) */}
          <OverlayHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-base sm:text-lg shrink-0">
                <FarmMarketArt enabled={mobileVisual} art={propArt("store")}>🪙</FarmMarketArt>
              </div>
              <div>
                <h3 id="farm-store-title" className="modal-title">
                  Cửa Hàng Tăng Gia
                </h3>
                <p className="modal-copy flex items-center gap-1 mt-0.5">
                  Ví Vàng:{" "}
                  <span className="font-bold text-[var(--modal-reward)] font-mono">
                    🪙{gold.toLocaleString("vi-VN")}
                  </span>
                </p>
              </div>
            </div>

            <ModalButton variant="icon"
              onClick={onClose}
              title="Đóng cửa hàng"
              aria-label="Đóng cửa hàng"
            >
              <X className="w-4 h-4" />
            </ModalButton>
          </OverlayHeader>
        <p className="px-4 py-2 text-xs text-slate-400">Phần thưởng mỗi ô được cân theo quy mô khu vườn. Phẩm chất, thời tiết và vật tư đã dùng còn ảnh hưởng đến thưởng.</p>

          {/* 4 Tabs (Sticky under Header, horizontal scroll on narrow mobile) */}
          <div className="farm-market-tabs farm-market-tabs--four flex sm:grid sm:grid-cols-4 gap-1 p-1.5 bg-slate-900 border-b border-slate-800 text-xs overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
            <button
              aria-pressed={activeTab === "crop"}
              onClick={() => setActiveTab("crop")}
              className={`modal-control app-overlay-button flex-1 sm:flex-initial py-1.5 px-2.5 sm:px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${
                activeTab === "crop"
                  ? "modal-control bg-amber-500 text-slate-950 shadow-sm"
                  : "modal-control text-[var(--modal-muted)] hover:text-[var(--modal-text)] hover:bg-slate-800"
              }`}
            >
              <FarmMarketArt enabled={mobileVisual} art={cropArt("carrot", "seed_item")}><span>🌱</span></FarmMarketArt><span>Cây Trồng</span>
            </button>

            <button
              aria-pressed={activeTab === "fertilizer"}
              onClick={() => setActiveTab("fertilizer")}
              className={`modal-control app-overlay-button flex-1 sm:flex-initial py-1.5 px-2.5 sm:px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${
                activeTab === "fertilizer"
                  ? "modal-control bg-amber-500 text-slate-950 shadow-sm"
                  : "modal-control text-[var(--modal-muted)] hover:text-[var(--modal-text)] hover:bg-slate-800"
              }`}
            >
              <FarmMarketArt enabled={mobileVisual} art={itemArt("fertilizer_growth_normal")}><span>✨</span></FarmMarketArt><span>Phân Bón</span>
            </button>

            <button
              aria-pressed={activeTab === "animal"}
              onClick={() => setActiveTab("animal")}
              className={`modal-control app-overlay-button flex-1 sm:flex-initial py-1.5 px-2.5 sm:px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${
                activeTab === "animal"
                  ? "modal-control bg-amber-500 text-slate-950 shadow-sm"
                  : "modal-control text-[var(--modal-muted)] hover:text-[var(--modal-text)] hover:bg-slate-800"
              }`}
            >
              <FarmMarketArt enabled={mobileVisual} art={animalArt("chicken")}><span>🐥</span></FarmMarketArt><span>Vật Nuôi</span>
            </button>

            <button
              aria-pressed={activeTab === "feed"}
              onClick={() => setActiveTab("feed")}
              className={`modal-control app-overlay-button flex-1 sm:flex-initial py-1.5 px-2.5 sm:px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${
                activeTab === "feed"
                  ? "modal-control bg-amber-500 text-slate-950 shadow-sm"
                  : "modal-control text-[var(--modal-muted)] hover:text-[var(--modal-text)] hover:bg-slate-800"
              }`}
            >
              <FarmMarketArt enabled={mobileVisual} art={itemArt("feed_normal")}><span>🌾</span></FarmMarketArt><span>Thức Ăn</span>
            </button>
          </div>

          {/* Tab Content List (Scrollable Area) */}
          <OverlayBody>
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
                    className={`farm-market-card p-2 sm:p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 relative overflow-hidden transition-all ${
                      hasRank
                        ? "bg-slate-800/40 hover:bg-slate-800/70 border-slate-800"
                        : "modal-section opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center shrink-0">
                        <FarmMarketArt enabled={mobileVisual} art={cropArt(crop.id, "mature")}><img loading="lazy" decoding="async" fetchPriority="low"
                          src={getCropAsset(crop.id, "mature")}
                          alt=""
                          aria-hidden="true"
                          className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
                        /></FarmMarketArt>
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-xs sm:text-sm text-[var(--modal-text)] truncate">
                            {crop.name}
                          </h4>
                          {renderOwnedBadge(ownedCount)}
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs text-[var(--modal-text)]">
                          <div className="truncate">
                            Giá: <span className="font-bold text-[var(--modal-reward)]">{formatPrice(crop.seedCostGold)}</span>
                          </div>
                          <div className="truncate">
                            Thu: <span className="font-semibold text-[var(--modal-success)]">🪙{normalizeCropReward(crop.harvestGold, crop.harvestXp, { productivity: rewardScale, inputGold: crop.seedCostGold }).gold.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="truncate">
                            TG: <span className="font-mono font-medium text-[var(--modal-info)]">{formatTimeVN(crop.growthMs)}</span>
                          </div>
                          <div className="truncate">
                            XP: <span className="font-semibold text-[var(--modal-reward)]">⚡+{(crop.harvestXp * rewardScale).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>

                        {!hasRank && (
                          <div className="text-xs text-[var(--modal-reward)] font-semibold pt-0.5 truncate">
                            Yêu cầu: <span className="text-[var(--modal-reward)]">{rankName}</span>
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
                            <FarmMarketArt enabled={mobileVisual} art={cropArt(crop.id, "mature")}><img loading="lazy" decoding="async" fetchPriority="low"
                              src={getCropAsset(crop.id, "mature")}
                              alt=""
                              aria-hidden="true"
                              className="h-8 w-8 object-contain"
                            /></FarmMarketArt>
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
                    className={`farm-market-card p-2 sm:p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 relative overflow-hidden transition-all ${
                      hasRank
                        ? "bg-slate-800/40 hover:bg-slate-800/70 border-slate-800"
                        : "modal-section opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                        <FarmMarketArt enabled={mobileVisual} art={itemArt(fert.id)}><img loading="lazy" decoding="async" fetchPriority="low"
                          src={getFertilizerAsset(fert.id)}
                          alt=""
                          aria-hidden="true"
                          className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
                        /></FarmMarketArt>
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-xs sm:text-sm text-[var(--modal-text)] truncate">
                            {fert.name}
                          </h4>
                          {renderOwnedBadge(ownedCount)}
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs text-[var(--modal-text)]">
                          <div className="truncate">
                            Giá: <span className="font-bold text-[var(--modal-reward)]">{formatPrice(fert.purchaseGold)}</span>
                          </div>
                          <div className="truncate text-[var(--modal-success)] font-semibold col-span-1">
                            {fert.category === "nutrition" && `⚡ +${Math.round(fert.xpBonusPct * 100)}% XP`}
                            {fert.category === "growth" && `⏱️ -${Math.round(fert.growthTimeReductionPct * 100)}% TG`}
                            {fert.category === "premium" && `✨ +${Math.round(fert.xpBonusPct * 100)}% XP & -${Math.round(fert.growthTimeReductionPct * 100)}% TG`}
                          </div>
                        </div>

                        {!hasRank && (
                          <div className="text-xs text-[var(--modal-reward)] font-semibold pt-0.5 truncate">
                            Yêu cầu: <span className="text-[var(--modal-reward)]">{rankName}</span>
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
                            <FarmMarketArt enabled={mobileVisual} art={itemArt(fert.id)}><img loading="lazy" decoding="async" fetchPriority="low"
                              src={getFertilizerAsset(fert.id)}
                              alt=""
                              aria-hidden="true"
                              className="h-8 w-8 object-contain"
                            /></FarmMarketArt>
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
                    className={`farm-market-card p-2 sm:p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 relative overflow-hidden transition-all ${
                      hasRank
                        ? "bg-slate-800/40 hover:bg-slate-800/70 border-slate-800"
                        : "modal-section opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                        <FarmMarketArt enabled={mobileVisual} art={animalArt(animal.id)}>{getAnimalEmoji(animal.id)}</FarmMarketArt>
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-xs sm:text-sm text-[var(--modal-text)] truncate">
                            {animal.name}
                          </h4>
                          {renderOwnedBadge(ownedCount)}
                        </div>

                        <div
                          data-animal-store-stats="compact-two-column"
                          className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs text-[var(--modal-text)]"
                        >
                          <div className="truncate">
                            Mở: <span className="font-semibold text-violet-300">{rankName}</span>
                          </div>
                          <div className="truncate">
                            Giá: <span className="font-bold text-[var(--modal-reward)]">{formatPrice(animal.purchaseGold)}</span>
                          </div>
                          <div className="truncate">
                            Đẻ trứng: <span className="font-mono font-medium text-[var(--modal-info)]">{formatTimeVN(animal.eggIntervalMs)}</span>
                          </div>
                          <div data-animal-lifespan="hours" className="truncate">
                            Tuổi thọ: <span className="font-semibold text-[var(--modal-danger)]">{formatLifespanHours(animal.lifespanMs)}</span>
                          </div>
                          <div className="truncate">
                            Giá trứng: <span className="font-semibold text-[var(--modal-success)]">🪙{animal.eggSellGold.toLocaleString("vi-VN")}</span>
                          </div>
                          <div className="truncate">
                            XP: <span className="font-semibold text-[var(--modal-reward)]">⚡+{animal.eggSellXp}</span>
                          </div>
                        </div>

                        {!hasRank && (
                          <div className="text-xs text-[var(--modal-reward)] font-semibold pt-0.5 truncate">
                            Yêu cầu: <span className="text-[var(--modal-reward)]">{rankName}</span>
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
                          icon: <FarmMarketArt enabled={mobileVisual} art={animalArt(animal.id)}>{getAnimalEmoji(animal.id)}</FarmMarketArt>,
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
                    className={`farm-market-card p-2 sm:p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 relative overflow-hidden transition-all ${
                      hasRank
                        ? "bg-slate-800/40 hover:bg-slate-800/70 border-slate-800"
                        : "modal-section opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                        <FarmMarketArt enabled={mobileVisual} art={itemArt(feed.id)}><img loading="lazy" decoding="async" fetchPriority="low"
                          src={getFeedAsset(feed.id)}
                          alt=""
                          aria-hidden="true"
                          className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
                        /></FarmMarketArt>
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-xs sm:text-sm text-[var(--modal-text)] truncate">
                            {feed.name}
                          </h4>
                          {renderOwnedBadge(ownedCount)}
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs text-[var(--modal-text)]">
                          <div className="truncate">
                            Giá: <span className="font-bold text-[var(--modal-reward)]">{formatPrice(feed.costGold)}</span>
                          </div>
                          <div className="truncate">
                            Máng: <span className="font-semibold text-[var(--modal-info)]">🥣 +{feed.buffAmount}%</span>
                          </div>
                          <div className="truncate col-span-2">
                            Tốc độ đẻ trứng: <span className="font-semibold text-[var(--modal-success)]">⚡ +{feed.speedBonusPercent}%</span>
                          </div>
                        </div>

                        {!hasRank && (
                          <div className="text-xs text-[var(--modal-reward)] font-semibold pt-0.5 truncate">
                            Yêu cầu: <span className="text-[var(--modal-reward)]">{rankName}</span>
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
                            <FarmMarketArt enabled={mobileVisual} art={itemArt(feed.id)}><img loading="lazy" decoding="async" fetchPriority="low"
                              src={getFeedAsset(feed.id)}
                              alt=""
                              aria-hidden="true"
                              className="h-8 w-8 object-contain"
                            /></FarmMarketArt>
                          ),
                          unitCostGold: feed.costGold,
                          ownedCount,
                          requiredRankName: rankName,
                        })
                    )}
                  </div>
                );
              })}
          </OverlayBody>
      </AppModal>

      {/* QUANTITY BUY CONFIRMATION (owned by Store) */}
      {buyModalData && (
        <AppModal size="compact" theme="farm" archetype="transaction"
        overlayClassName={mobileVisual ? "farm-market" : undefined}
          layer="nested"
          onClose={() => setBuyModalData(null)}
          closeOnBackdrop
          ariaLabel={`Mua ${buyModalData.name}`}
        >
            {/* Header */}
            <OverlayHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="modal-status-icon">
                  {buyModalData.icon}
                </div>
                <div>
                  <h4 className="modal-title">
                    Mua {buyModalData.name}
                  </h4>
                  <p className="modal-copy mt-0.5">
                    Đang sở hữu: <span className="font-bold text-[var(--modal-success)]">{buyModalData.ownedCount}</span>
                  </p>
                </div>
              </div>

              <ModalButton variant="icon"
                onClick={() => setBuyModalData(null)}
                aria-label="Đóng chọn số lượng mua"
              >
                <X className="w-4 h-4" />
              </ModalButton>
            </OverlayHeader>

            <OverlayBody>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--modal-text)] block text-center">
                Chọn số lượng muốn mua:
              </label>

              {/* Stepper + Input */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    buyQuantityPristineRef.current = false;
                    setBuyQuantity((prev) => Math.max(1, prev - 1));
                  }}
                  disabled={buyQuantity <= 1}
                  aria-label="Giảm số lượng mua 1"
                  className="modal-control app-overlay-button app-overlay-button--icon w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--modal-text)] font-bold flex items-center justify-center border border-slate-700 transition-all active:scale-95 cursor-pointer"
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
                    buyQuantityPristineRef.current = false;
                    const val = parseInt(e.target.value, 10);
                    if (isNaN(val)) {
                      setBuyQuantity(1);
                    } else {
                      setBuyQuantity(adjustIntegerQuantity(val, 0, 1, maxAffordable));
                    }
                  }}
                  className="w-20 sm:w-24 text-center py-1.5 sm:py-2 bg-slate-950 border border-slate-700 rounded-xl text-[var(--modal-reward)] font-semibold text-base sm:text-lg font-mono focus:outline-none focus:border-amber-400"
                />

                <button
                  type="button"
                  onClick={() => {
                    buyQuantityPristineRef.current = false;
                    setBuyQuantity((prev) => Math.min(maxAffordable, prev + 1));
                  }}
                  disabled={buyQuantity >= maxAffordable}
                  aria-label="Tăng số lượng mua 1"
                  className="modal-control app-overlay-button app-overlay-button--icon w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--modal-text)] font-bold flex items-center justify-center border border-slate-700 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick adjustment buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[-10, -5, 5, 10].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    disabled={delta < 0 ? buyQuantity <= 1 : buyQuantity >= maxAffordable}
                    onClick={() => handleBuyQuantityQuickAdjust(delta)}
                    aria-label={`${delta < 0 ? "Giảm" : "Tăng"} số lượng mua ${Math.abs(delta)}`}
                    className="modal-control app-overlay-button min-h-10 rounded-xl border border-slate-700 bg-slate-800 px-1.5 text-xs font-bold text-[var(--modal-text)] transition-all hover:bg-slate-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 sm:text-xs"
                  >
                    {delta > 0 ? "+" : ""}{delta}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={buyQuantity >= maxAffordable}
                onClick={() => {
                  buyQuantityPristineRef.current = false;
                  setBuyQuantity(maxAffordable);
                }}
                aria-label={`Chọn số lượng mua tối đa ${maxAffordable}`}
                className="modal-control app-overlay-button min-h-10 w-full rounded-xl border border-amber-500/40 bg-amber-500/20 px-2 text-xs font-bold text-[var(--modal-reward)] transition-all hover:bg-amber-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
              >
                Tối đa ({maxAffordable})
              </button>
            </div>

            {/* Cost Calculation Box */}
            <div className="modal-section space-y-1 text-xs text-[var(--modal-text)]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--modal-muted)] text-xs">Đơn giá:</span>
                <span className="font-bold text-[var(--modal-reward)]">
                  {formatPrice(buyModalData.unitCostGold)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--modal-muted)] text-xs">Ví Vàng hiện có:</span>
                <span className="font-bold text-[var(--modal-text)] font-mono">
                  🪙{gold.toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-1 flex items-center justify-between font-semibold text-xs sm:text-sm">
                <span className="text-[var(--modal-text)]">Tổng thanh toán:</span>
                <span
                  className={`font-mono ${
                    canAffordBuy ? "text-[var(--modal-reward)]" : "text-[var(--modal-danger)]"
                  }`}
                >
                  {formatPrice(totalBuyCost)}
                </span>
              </div>
            </div>
            </OverlayBody>

            {/* Action Buttons */}
            <OverlayFooter className="flex items-center" data-stack-actions="true">
              <ModalButton variant="ghost"
                type="button"
                onClick={() => setBuyModalData(null)}
                className="flex-1"
              >
                Hủy Bỏ
              </ModalButton>
              <ModalButton variant="primary"
                type="button"
                disabled={!canAffordBuy || buyQuantity <= 0}
                onClick={handleConfirmBuy}
                className="flex-1"
              >
                Mua ({buyQuantity})
              </ModalButton>
            </OverlayFooter>
        </AppModal>
      )}
    </>
  );
};
