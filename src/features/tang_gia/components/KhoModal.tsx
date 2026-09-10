import React, { useState, useEffect, useRef } from "react";
import {
  ANIMAL_CATALOG,
  CROP_CATALOG,
  EGG_INFO_MAP,
  FEED_CATALOG,
  FERTILIZER_CATALOG,
} from "../farmCatalog";
import { applyQualityMultiplier, getItemSellPrice } from "../farmEngine";
import { AnimalTypeId, EggQualityInventory, EggTypeId, FarmInventory, ItemQuality } from "../farmTypes";
import { QUALITY_CONFIG } from "../weatherEngine";
import { adjustIntegerQuantity } from "../../../utils/quantityInput";
import { Coins, Minus, Package, Plus, ShoppingBag, X } from "lucide-react";
import {
  getCropAsset,
  getFeedAsset,
  getFertilizerAsset,
} from "../tangGiaAssetManifest";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";

export type KhoTabType = "crop" | "fertilizer" | "animal" | "feed" | "egg";

interface KhoModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: FarmInventory;
  eggQualityInventory?: EggQualityInventory;
  initialTab?: KhoTabType;
  onSellItem: (
    category: "seeds" | "fertilizer" | "animals" | "feed",
    itemId: string,
    count: number
  ) => void;
  onSellEggs: (eggTypeId: EggTypeId, count: number) => void;
  onSellAllEggs: () => void;
  onOpenStore?: (tab: "crop" | "fertilizer" | "animal" | "feed") => void;
}

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

const eggTypes: EggTypeId[] = [
  "chicken_egg",
  "duck_egg",
  "quail_egg",
  "goose_egg",
  "muscovy_duck_egg",
  "turkey_egg",
  "guinea_fowl_egg",
  "pheasant_egg",
  "peafowl_egg",
  "ostrich_egg",
];

const QUALITY_ORDER: ItemQuality[] = ["thuong", "tot", "hiem", "hoan_my"];

interface PendingSellState {
  category: "seeds" | "fertilizer" | "animals" | "feed" | "eggs";
  itemId: string;
  name: string;
  icon: string | React.ReactNode;
  ownedCount: number;
  unitSellGold: number;
  unitSellXp?: number;
}

export const KhoModal: React.FC<KhoModalProps> = ({
  isOpen,
  onClose,
  inventory,
  eggQualityInventory,
  initialTab = "crop",
  onSellItem,
  onSellEggs,
  onSellAllEggs,
  onOpenStore,
}) => {
  const [activeTab, setActiveTab] = useState<KhoTabType>(initialTab);
  const [sellModalData, setSellModalData] = useState<PendingSellState | null>(null);
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const sellQuantityPristineRef = useRef(true);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSellModalData(null);
      setSellQuantity(1);
      sellQuantityPristineRef.current = true;
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const totalEggs = eggTypes.reduce(
    (acc, id) => acc + (inventory.eggs?.[id] || 0),
    0
  );

  const ownedCrops = CROP_CATALOG.filter(
    (c) => (inventory.seeds?.[c.id] || 0) > 0
  );

  const ownedFertilizers = FERTILIZER_CATALOG.filter(
    (f) => (inventory.fertilizer?.[f.id] || 0) > 0
  );

  const ownedAnimals = ANIMAL_CATALOG.filter(
    (a) => (inventory.animals?.[a.id] || 0) > 0
  );

  const ownedFeed = FEED_CATALOG.filter(
    (f) => (inventory.feed?.[f.id] || 0) > 0
  );

  const ownedEggs = eggTypes.filter(
    (id) => (inventory.eggs?.[id] || 0) > 0
  );

  const openSellModal = (item: PendingSellState) => {
    setSellModalData(item);
    setSellQuantity(1);
    sellQuantityPristineRef.current = true;
  };

  const handleSellQuantityQuickAdjust = (delta: number) => {
    const wasPristine = sellQuantityPristineRef.current;
    sellQuantityPristineRef.current = false;
    setSellQuantity((current) =>
      adjustIntegerQuantity(
        wasPristine && delta > 0 ? 0 : current,
        delta,
        1,
        sellModalData?.ownedCount ?? 1
      )
    );
  };

  const handleConfirmSell = () => {
    if (!sellModalData) return;
    const count = Math.max(1, Math.min(sellModalData.ownedCount, sellQuantity));

    if (sellModalData.category === "eggs") {
      onSellEggs(sellModalData.itemId as EggTypeId, count);
    } else {
      onSellItem(sellModalData.category, sellModalData.itemId, count);
    }
    setSellModalData(null);
  };

  return (
    <>
      <AppModal theme="farm" archetype="transaction"
        onClose={onClose}
        closeOnBackdrop
        labelledBy="farm-inventory-title"
      >
          {/* Modal Header */}
        <OverlayHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="modal-status-icon">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 id="farm-inventory-title" className="modal-title">
                Kho Tăng Gia
              </h3>
              <p className="modal-copy">
                Quản lý vật phẩm nông trại & bán thu hồi Vàng
              </p>
            </div>
          </div>

          <ModalButton variant="icon"
            onClick={onClose}
            aria-label="Đóng kho tăng gia"
          >
            <X className="w-4 h-4" />
          </ModalButton>
        </OverlayHeader>

        {/* 5 Tabs in exact required order: Cây Trồng | Phân Bón | Vật Nuôi | Thức Ăn | Trứng */}
        <div className="grid grid-cols-5 gap-1 p-2 bg-slate-900/95 border-b border-slate-800/60 text-xs sm:text-xs">
          <button
            onClick={() => setActiveTab("crop")}
            className={`modal-control app-overlay-button py-2 px-1 rounded-xl font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === "crop"
                ? "modal-control bg-amber-500 text-slate-950 shadow-md font-semibold"
                : "modal-control text-[var(--modal-muted)] hover:text-[var(--modal-text)] hover:bg-slate-800/60"
            }`}
          >
            <span>🌱</span>
            <span className="truncate">Cây Trồng</span>
          </button>

          <button
            onClick={() => setActiveTab("fertilizer")}
            className={`modal-control app-overlay-button py-2 px-1 rounded-xl font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === "fertilizer"
                ? "modal-control bg-amber-500 text-slate-950 shadow-md font-semibold"
                : "modal-control text-[var(--modal-muted)] hover:text-[var(--modal-text)] hover:bg-slate-800/60"
            }`}
          >
            <span>✨</span>
            <span className="truncate">Phân Bón</span>
          </button>

          <button
            onClick={() => setActiveTab("animal")}
            className={`modal-control app-overlay-button py-2 px-1 rounded-xl font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === "animal"
                ? "modal-control bg-amber-500 text-slate-950 shadow-md font-semibold"
                : "modal-control text-[var(--modal-muted)] hover:text-[var(--modal-text)] hover:bg-slate-800/60"
            }`}
          >
            <span>🐥</span>
            <span className="truncate">Vật Nuôi</span>
          </button>

          <button
            onClick={() => setActiveTab("feed")}
            className={`modal-control app-overlay-button py-2 px-1 rounded-xl font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === "feed"
                ? "modal-control bg-amber-500 text-slate-950 shadow-md font-semibold"
                : "modal-control text-[var(--modal-muted)] hover:text-[var(--modal-text)] hover:bg-slate-800/60"
            }`}
          >
            <span>🌾</span>
            <span className="truncate">Thức Ăn</span>
          </button>

          <button
            onClick={() => setActiveTab("egg")}
            className={`modal-control app-overlay-button py-2 px-1 rounded-xl font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 relative ${
              activeTab === "egg"
                ? "modal-control bg-amber-500 text-slate-950 shadow-md font-semibold"
                : "modal-control text-[var(--modal-muted)] hover:text-[var(--modal-text)] hover:bg-slate-800/60"
            }`}
          >
            <span>🥚</span>
            <span className="truncate">Trứng</span>
            {totalEggs > 0 && (
              <span
                className={`ml-0.5 px-1 py-0.2 rounded-full text-xs font-semibold ${
                  activeTab === "egg"
                    ? "bg-slate-950 text-[var(--modal-reward)]"
                    : "bg-rose-500 text-[var(--modal-text)] animate-pulse"
                }`}
              >
                {totalEggs}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <OverlayBody>
          {/* TAB 1: CÂY TRỒNG (Seeds) */}
          {activeTab === "crop" && (
            <>
              {ownedCrops.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-800/80 flex items-center justify-center text-3xl">
                    🌱
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[var(--modal-text)]">
                      Kho chưa có hạt giống nào
                    </p>
                    <p className="text-xs text-[var(--modal-muted)] max-w-xs">
                      Hãy ghé Cửa Hàng để mua hạt giống hoặc nhận thưởng khi thăng quân hàm!
                    </p>
                  </div>
                  {onOpenStore && (
                    <button
                      onClick={() => {
                        onOpenStore("crop");
                      }}
                      className="modal-control app-overlay-button px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Đến Cửa Hàng Hạt Giống</span>
                    </button>
                  )}
                </div>
              ) : (
                ownedCrops.map((crop) => {
                  const count = inventory.seeds?.[crop.id] || 0;
                  const sellGold = getItemSellPrice("seeds", crop.id);

                  return (
                    <div
                      key={crop.id}
                      className="p-3 rounded-2xl bg-slate-850/70 border border-slate-800/60 flex items-center justify-between gap-3 shadow-sm hover:border-slate-750 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-800/80 flex items-center justify-center shrink-0">
                          <img loading="lazy" decoding="async" fetchPriority="low"
                            src={getCropAsset(crop.id, "seed")}
                            alt=""
                            aria-hidden="true"
                            className="h-10 w-10 object-contain"
                          />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-[var(--modal-text)] truncate">
                              {crop.name}
                            </h4>
                            <span className="text-xs font-semibold text-[var(--modal-success)] bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                              Sở hữu: {count}
                            </span>
                          </div>
                          <div className="text-xs text-[var(--modal-text)] space-y-0.5">
                            <div>
                              Giá bán lại:{" "}
                              <span className="font-bold text-[var(--modal-reward)]">
                                🪙{sellGold.toLocaleString("vi-VN")} Vàng/hạt
                              </span>{" "}
                              <span className="text-xs text-[var(--modal-muted)]">(70% giá gốc)</span>
                            </div>
                            <div className="text-xs text-[var(--modal-muted)]">
                              Thu hoạch: <span className="text-[var(--modal-success)] font-bold">🪙{crop.harvestGold}</span> |{" "}
                              <span className="text-[var(--modal-reward)] font-bold">⚡{crop.harvestXp} XP</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          openSellModal({
                            category: "seeds",
                            itemId: crop.id,
                            name: `Hạt giống ${crop.name}`,
                            icon: (
                              <img loading="lazy" decoding="async" fetchPriority="low"
                                src={getCropAsset(crop.id, "seed")}
                                alt=""
                                aria-hidden="true"
                                className="app-overlay-button h-8 w-8 object-contain"
                              />
                            ),
                            ownedCount: count,
                            unitSellGold: sellGold,
                          })
                        }
                        className="modal-control px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 border border-slate-750 hover:border-amber-500/40 text-[var(--modal-reward)] font-semibold text-xs shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        Bán
                      </button>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 2: PHÂN BÓN (Fertilizer) */}
          {activeTab === "fertilizer" && (
            <>
              {ownedFertilizers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-800/80 flex items-center justify-center text-3xl">
                    ✨
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[var(--modal-text)]">
                      Kho chưa có phân bón nào
                    </p>
                    <p className="text-xs text-[var(--modal-muted)] max-w-xs">
                      Ghé Cửa Hàng để mua phân bón tăng trưởng và dinh dưỡng tăng năng suất vụ mùa!
                    </p>
                  </div>
                  {onOpenStore && (
                    <button
                      onClick={() => {
                        onOpenStore("fertilizer");
                      }}
                      className="modal-control app-overlay-button px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Đến Cửa Hàng Phân Bón</span>
                    </button>
                  )}
                </div>
              ) : (
                ownedFertilizers.map((fert) => {
                  const count = inventory.fertilizer?.[fert.id] || 0;
                  const sellGold = getItemSellPrice("fertilizer", fert.id);

                  return (
                    <div
                      key={fert.id}
                      className="p-3 rounded-2xl bg-slate-850/70 border border-slate-800/60 flex items-center justify-between gap-3 shadow-sm hover:border-slate-750 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-800/80 flex items-center justify-center text-2xl shrink-0">
                          <img loading="lazy" decoding="async" fetchPriority="low"
                            src={getFertilizerAsset(fert.id)}
                            alt=""
                            aria-hidden="true"
                            className="h-11 w-11 object-contain"
                          />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-[var(--modal-text)] truncate">
                              {fert.name}
                            </h4>
                            <span className="text-xs font-semibold text-[var(--modal-success)] bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                              Sở hữu: {count}
                            </span>
                          </div>
                          <div className="text-xs text-[var(--modal-text)] space-y-0.5">
                            <div>
                              Giá bán lại:{" "}
                              <span className="font-bold text-[var(--modal-reward)]">
                                🪙{sellGold.toLocaleString("vi-VN")} Vàng/bao
                              </span>{" "}
                              <span className="text-xs text-[var(--modal-muted)]">(70% giá gốc)</span>
                            </div>
                            <div className="text-xs text-[var(--modal-success)] font-medium truncate">
                              {fert.category === "nutrition" && `+${Math.round(fert.xpBonusPct * 100)}% XP`}
                              {fert.category === "growth" && `-${Math.round(fert.growthTimeReductionPct * 100)}% thời gian`}
                              {fert.category === "premium" && `+${Math.round(fert.xpBonusPct * 100)}% XP & -${Math.round(fert.growthTimeReductionPct * 100)}% TG`}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          openSellModal({
                            category: "fertilizer",
                            itemId: fert.id,
                            name: fert.name,
                            icon: (
                              <img loading="lazy" decoding="async" fetchPriority="low"
                                src={getFertilizerAsset(fert.id)}
                                alt=""
                                aria-hidden="true"
                                className="app-overlay-button h-9 w-9 object-contain"
                              />
                            ),
                            ownedCount: count,
                            unitSellGold: sellGold,
                          })
                        }
                        className="modal-control px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 border border-slate-750 hover:border-amber-500/40 text-[var(--modal-reward)] font-semibold text-xs shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        Bán
                      </button>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 3: VẬT NUÔI (Animals) */}
          {activeTab === "animal" && (
            <>
              {ownedAnimals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-800/80 flex items-center justify-center text-3xl">
                    🐥
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[var(--modal-text)]">
                      Kho chưa có con giống nào
                    </p>
                    <p className="text-xs text-[var(--modal-muted)] max-w-xs">
                      Mua con giống tại Cửa Hàng để thả vào chuồng đẻ trứng hoặc bán kiếm lời!
                    </p>
                  </div>
                  {onOpenStore && (
                    <button
                      onClick={() => {
                        onOpenStore("animal");
                      }}
                      className="modal-control app-overlay-button px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Đến Cửa Hàng Vật Nuôi</span>
                    </button>
                  )}
                </div>
              ) : (
                ownedAnimals.map((animal) => {
                  const count = inventory.animals?.[animal.id] || 0;
                  const sellGold = getItemSellPrice("animals", animal.id);

                  return (
                    <div
                      key={animal.id}
                      className="p-3 rounded-2xl bg-slate-850/70 border border-slate-800/60 flex items-center justify-between gap-3 shadow-sm hover:border-slate-750 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-800/80 flex items-center justify-center text-2xl shrink-0">
                          {getAnimalEmoji(animal.id)}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-[var(--modal-text)] truncate">
                              {animal.name}
                            </h4>
                            <span className="text-xs font-semibold text-[var(--modal-reward)] bg-amber-500/15 border border-amber-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                              Sở hữu: {count} con
                            </span>
                          </div>
                          <div className="text-xs text-[var(--modal-text)] space-y-0.5">
                            <div>
                              Giá bán lại:{" "}
                              <span className="font-bold text-[var(--modal-reward)]">
                                🪙{sellGold.toLocaleString("vi-VN")} Vàng/con
                              </span>{" "}
                              <span className="text-xs text-[var(--modal-muted)]">(70% giá gốc)</span>
                            </div>
                            <div className="text-xs text-[var(--modal-muted)]">
                              Trứng: <span className="text-[var(--modal-success)] font-bold">🪙{animal.eggSellGold}</span> |{" "}
                              <span className="text-purple-300 font-bold">⚡{animal.eggSellXp} XP</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          openSellModal({
                            category: "animals",
                            itemId: animal.id,
                            name: `Vật nuôi ${animal.name}`,
                            icon: getAnimalEmoji(animal.id),
                            ownedCount: count,
                            unitSellGold: sellGold,
                          })
                        }
                        className="modal-control app-overlay-button px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 border border-slate-750 hover:border-amber-500/40 text-[var(--modal-reward)] font-semibold text-xs shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        Bán
                      </button>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 4: THỨC ĂN (Feed) */}
          {activeTab === "feed" && (
            <>
              {ownedFeed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-800/80 flex items-center justify-center text-3xl">
                    🌾
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[var(--modal-text)]">
                      Kho chưa có thức ăn nào
                    </p>
                    <p className="text-xs text-[var(--modal-muted)] max-w-xs">
                      Mua thức ăn để tăng tốc độ đẻ trứng cho đàn vật nuôi trong chuồng!
                    </p>
                  </div>
                  {onOpenStore && (
                    <button
                      onClick={() => {
                        onOpenStore("feed");
                      }}
                      className="modal-control app-overlay-button px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Đến Cửa Hàng Thức Ăn</span>
                    </button>
                  )}
                </div>
              ) : (
                ownedFeed.map((feed) => {
                  const count = inventory.feed?.[feed.id] || 0;
                  const sellGold = getItemSellPrice("feed", feed.id);

                  return (
                    <div
                      key={feed.id}
                      className="p-3 rounded-2xl bg-slate-850/70 border border-slate-800/60 flex items-center justify-between gap-3 shadow-sm hover:border-slate-750 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-800/80 flex items-center justify-center text-2xl shrink-0">
                          <img loading="lazy" decoding="async" fetchPriority="low"
                            src={getFeedAsset(feed.id)}
                            alt=""
                            aria-hidden="true"
                            className="h-11 w-11 object-contain"
                          />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-[var(--modal-text)] truncate">
                              {feed.name}
                            </h4>
                            <span className="text-xs font-semibold text-[var(--modal-success)] bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                              Sở hữu: {count}
                            </span>
                          </div>
                          <div className="text-xs text-[var(--modal-text)] space-y-0.5">
                            <div>
                              Giá bán lại:{" "}
                              <span className="font-bold text-[var(--modal-reward)]">
                                🪙{sellGold.toLocaleString("vi-VN")} Vàng/bao
                              </span>{" "}
                              <span className="text-xs text-[var(--modal-muted)]">(70% giá gốc)</span>
                            </div>
                            <div className="text-xs text-[var(--modal-success)] font-medium">
                              Tăng tốc: +{feed.speedBonusPercent}% | Máng ăn: +{feed.buffAmount}%
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          openSellModal({
                            category: "feed",
                            itemId: feed.id,
                            name: feed.name,
                            icon: (
                              <img loading="lazy" decoding="async" fetchPriority="low"
                                src={getFeedAsset(feed.id)}
                                alt=""
                                aria-hidden="true"
                                className="app-overlay-button h-9 w-9 object-contain"
                              />
                            ),
                            ownedCount: count,
                            unitSellGold: sellGold,
                          })
                        }
                        className="modal-control px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 border border-slate-750 hover:border-amber-500/40 text-[var(--modal-reward)] font-semibold text-xs shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        Bán
                      </button>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 5: TRỨNG (Eggs) */}
          {activeTab === "egg" && (
            <>
              {ownedEggs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-800/80 flex items-center justify-center text-3xl">
                    🥚
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[var(--modal-text)]">
                      Kho trứng hiện đang trống
                    </p>
                    <p className="text-xs text-[var(--modal-muted)] max-w-xs">
                      Nuôi và cho gia cầm ăn tại chuồng để thu hoạch trứng tươi ngon!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Quick summary header - without redundant sell button */}
                  <div className="p-3 bg-slate-850/80 border border-slate-800/60 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[var(--modal-muted)] font-medium">
                        Tổng sản lượng trứng lưu kho:
                      </div>
                      <div className="text-sm font-semibold text-[var(--modal-reward)]">
                        {totalEggs} quả trứng
                      </div>
                    </div>
                  </div>

                  {/* Egg list - display only, without individual action buttons */}
                  {ownedEggs.map((typeId) => {
                    const info = EGG_INFO_MAP[typeId];
                    const count = inventory.eggs?.[typeId] || 0;
                    const storedSlots = eggQualityInventory?.[typeId];
                    const trackedCount = QUALITY_ORDER.reduce(
                      (sum, quality) => sum + (storedSlots?.[quality]?.count || 0),
                      0
                    );
                    const untrackedNormalCount = Math.max(0, count - trackedCount);
                    const qualityRows = QUALITY_ORDER.map((quality) => {
                      const config = QUALITY_CONFIG[quality];
                      const storedCount = storedSlots?.[quality]?.count || 0;
                      const qualityCount =
                        storedCount + (quality === "thuong" ? untrackedNormalCount : 0);
                      const rainGoldBonus = storedSlots?.[quality]?.rainGoldBonus || 0;
                      const baseGold = qualityCount * info.sellGold + rainGoldBonus;
                      const baseXp = qualityCount * info.sellXp;
                      const gold = applyQualityMultiplier(
                        baseGold,
                        config.multiplier
                      );
                      const xp = applyQualityMultiplier(
                        baseXp,
                        config.multiplier
                      );

                      return {
                        quality,
                        config,
                        count: qualityCount,
                        baseGold,
                        qualityBonusGold: gold - baseGold,
                        baseXp,
                        qualityBonusXp: xp - baseXp,
                      };
                    }).filter((row) => row.count > 0);

                    return (
                      <div
                        key={typeId}
                        className="p-3 rounded-2xl bg-slate-850/70 border border-slate-800/60 space-y-2.5 shadow-sm hover:border-slate-750 transition-all"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-800/80 flex items-center justify-center text-2xl shrink-0">
                              🥚
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm text-[var(--modal-text)] truncate">
                                  {info.name}
                                </h4>
                                <span className="text-xs font-semibold text-[var(--modal-reward)] bg-amber-500/15 border border-amber-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                                  {count} quả
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs font-bold text-[var(--modal-text)]">
                                <span className="text-[var(--modal-reward)] flex items-center gap-1">
                                  🪙 {info.sellGold} Vàng/quả
                                </span>
                                <span className="text-purple-400 flex items-center gap-1">
                                  ⚡ {info.sellXp} XP/quả
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 border-t border-slate-800/70 pt-2">
                          {qualityRows.map((row) => (
                            <div
                              key={row.quality}
                              className="flex items-center justify-between gap-2 rounded-xl bg-slate-900/70 px-2.5 py-1.5 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 font-semibold ${row.config.badgeClass}`}>
                                  <span>{row.config.icon}</span>
                                  <span>{row.config.name}</span>
                                  <span>×{row.config.multiplier}</span>
                                </span>
                                <span className="font-semibold text-[var(--modal-text)]">x{row.count}</span>
                              </div>
                              <div className="flex flex-wrap justify-end gap-x-2 gap-y-0.5 text-right font-semibold whitespace-nowrap">
                                <span className="text-[var(--modal-reward)]">
                                  +{row.baseGold.toLocaleString("vi-VN")} 🪙{" "}
                                  <strong style={{ color: row.config.color }}>
                                    (+{row.qualityBonusGold.toLocaleString("vi-VN")})
                                  </strong>
                                </span>
                                <span className="text-purple-300">
                                  +{row.baseXp.toLocaleString("vi-VN")} XP{" "}
                                  <strong style={{ color: row.config.color }}>
                                    (+{row.qualityBonusXp.toLocaleString("vi-VN")})
                                  </strong>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </OverlayBody>

        {/* Modal Footer - Single primary "Bán Tất Cả Trứng" button at bottom */}
        {activeTab === "egg" && totalEggs > 0 && (
          <OverlayFooter>
            <ModalButton variant="primary"
              onClick={() => {
                onSellAllEggs();
              }}
              className="w-full"
            >
              <Coins className="w-4 h-4" />
              <span>Bán Tất Cả Trứng ({totalEggs} quả)</span>
            </ModalButton>
          </OverlayFooter>
        )}
      </AppModal>

    {/* QUANTITY SELL CONFIRMATION (owned by Inventory) */}
    {sellModalData && (
      <AppModal size="compact" theme="farm" archetype="transaction"
        layer="nested"
        onClose={() => setSellModalData(null)}
        closeOnBackdrop
        ariaLabel={`Bán ${sellModalData.name}`}
      >
          {/* Popup Title */}
          <OverlayHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="modal-status-icon">
                {sellModalData.icon}
              </div>
              <div>
                <h4 className="modal-title">
                  Bán {sellModalData.name}
                </h4>
                <p className="modal-copy">
                  Đang có: <span className="font-bold text-[var(--modal-reward)]">{sellModalData.ownedCount}</span>
                </p>
              </div>
            </div>

            <ModalButton variant="icon"
              onClick={() => setSellModalData(null)}
              aria-label="Đóng chọn số lượng bán"
            >
              <X className="w-4 h-4" />
            </ModalButton>
          </OverlayHeader>

          <OverlayBody>

          {/* Quantity Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[var(--modal-text)] block text-center">
              Chọn số lượng muốn bán:
            </label>

            {/* Stepper + Input */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  sellQuantityPristineRef.current = false;
                  setSellQuantity((prev) => Math.max(1, prev - 1));
                }}
                disabled={sellQuantity <= 1}
                aria-label="Giảm số lượng bán 1"
                className="modal-control app-overlay-button app-overlay-button--icon w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--modal-text)] font-bold flex items-center justify-center border border-slate-750 transition-all active:scale-95 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                max={sellModalData.ownedCount}
                value={sellQuantity}
                onChange={(e) => {
                  sellQuantityPristineRef.current = false;
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val)) {
                    setSellQuantity(1);
                  } else {
                    setSellQuantity(adjustIntegerQuantity(val, 0, 1, sellModalData.ownedCount));
                  }
                }}
                className="w-24 text-center py-2 bg-slate-950 border border-slate-750 rounded-xl text-[var(--modal-reward)] font-semibold text-lg font-mono focus:outline-none focus:border-amber-400"
              />

              <button
                type="button"
                onClick={() => {
                  sellQuantityPristineRef.current = false;
                  setSellQuantity((prev) =>
                    Math.min(sellModalData.ownedCount, prev + 1)
                  );
                }}
                disabled={sellQuantity >= sellModalData.ownedCount}
                aria-label="Tăng số lượng bán 1"
                className="modal-control app-overlay-button app-overlay-button--icon w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--modal-text)] font-bold flex items-center justify-center border border-slate-750 transition-all active:scale-95 cursor-pointer"
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
                  disabled={delta < 0 ? sellQuantity <= 1 : sellQuantity >= sellModalData.ownedCount}
                  onClick={() => handleSellQuantityQuickAdjust(delta)}
                  aria-label={`${delta < 0 ? "Giảm" : "Tăng"} số lượng bán ${Math.abs(delta)}`}
                  className="modal-control app-overlay-button min-h-10 rounded-xl border border-slate-750 bg-slate-800/80 px-2 text-xs font-bold text-[var(--modal-text)] transition-all hover:bg-slate-750 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {delta > 0 ? "+" : ""}{delta}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={sellQuantity >= sellModalData.ownedCount}
              onClick={() => {
                sellQuantityPristineRef.current = false;
                setSellQuantity(sellModalData.ownedCount);
              }}
              aria-label={`Chọn số lượng bán tối đa ${sellModalData.ownedCount}`}
              className="modal-control app-overlay-button min-h-10 w-full rounded-xl border border-amber-500/30 bg-amber-500/20 px-2 text-xs font-bold text-[var(--modal-reward)] transition-all hover:bg-amber-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tối đa ({sellModalData.ownedCount})
            </button>
          </div>

          {/* Earnings Calculation Box */}
          <div className="modal-section space-y-1.5 text-xs text-[var(--modal-text)]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--modal-muted)]">Đơn giá bán:</span>
              <span className="font-bold text-[var(--modal-reward)]">
                🪙{sellModalData.unitSellGold.toLocaleString("vi-VN")} Vàng
              </span>
            </div>
            {sellModalData.unitSellXp !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--modal-muted)]">XP mỗi quả:</span>
                <span className="font-bold text-purple-300">
                  ⚡{sellModalData.unitSellXp.toLocaleString("vi-VN")} XP
                </span>
              </div>
            )}
            <div className="border-t border-slate-800/70 pt-1.5 flex items-center justify-between font-semibold text-sm">
              <span className="text-[var(--modal-text)]">Tổng thu về:</span>
              <div className="flex items-center gap-2">
                <span className="text-[var(--modal-reward)] font-mono">
                  🪙{(sellQuantity * sellModalData.unitSellGold).toLocaleString("vi-VN")} Vàng
                </span>
                {sellModalData.unitSellXp !== undefined && (
                  <span className="text-purple-300 font-mono text-xs">
                    (+{(sellQuantity * sellModalData.unitSellXp).toLocaleString("vi-VN")} XP)
                  </span>
                )}
              </div>
            </div>
          </div>
          </OverlayBody>

          {/* Action Buttons */}
          <OverlayFooter className="flex items-center" data-stack-actions="true">
            <ModalButton variant="ghost"
              type="button"
              onClick={() => setSellModalData(null)}
              className="flex-1"
            >
              Hủy Bỏ
            </ModalButton>
            <ModalButton variant="primary"
              type="button"
              onClick={handleConfirmSell}
              className="flex-1"
            >
              Xác Nhận Bán ({sellQuantity})
            </ModalButton>
          </OverlayFooter>
      </AppModal>
    )}
  </>
);
};
