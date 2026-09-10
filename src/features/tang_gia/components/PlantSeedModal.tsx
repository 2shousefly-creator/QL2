import React, { useState } from "react";
import { CROP_CATALOG, FERTILIZER_CATALOG } from "../farmCatalog";
import { CropId, FertilizerTypeId, FarmInventory } from "../farmTypes";
import { Sprout, X, Store, ShoppingBag, ArrowLeft, Sparkles, Check } from "lucide-react";
import { getCropAsset } from "../tangGiaAssetManifest";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";

interface PlantSeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: FarmInventory;
  initialFertilizerId?: FertilizerTypeId | null;
  onSelectSeedWithFertilizer: (cropId: CropId, fertilizerId: FertilizerTypeId | null) => void;
  onOpenStore?: () => void;
}

export const PlantSeedModal: React.FC<PlantSeedModalProps> = ({
  isOpen,
  onClose,
  inventory,
  initialFertilizerId,
  onSelectSeedWithFertilizer,
  onOpenStore,
}) => {
  const [selectedCropId, setSelectedCropId] = useState<CropId | null>(null);
  // The screen mounts one fresh wizard per opening; inventory ticks never reset a step.
  const [selectedFertilizerId, setSelectedFertilizerId] = useState<FertilizerTypeId | null>(() =>
    initialFertilizerId && (inventory.fertilizer?.[initialFertilizerId] ?? 0) > 0
      ? initialFertilizerId
      : null
  );
  const rememberedFertilizer = initialFertilizerId
    ? FERTILIZER_CATALOG.find((fertilizer) => fertilizer.id === initialFertilizerId)
    : null;
  const rememberedFertilizerCount = rememberedFertilizer
    ? inventory.fertilizer?.[rememberedFertilizer.id] || 0
    : 0;

  if (!isOpen) return null;

  // Filter ONLY seeds that user currently owns
  const ownedCrops = CROP_CATALOG.filter(
    (crop) => (inventory.seeds[crop.id] || 0) > 0
  );

  // Show owned fertilizers plus an unavailable remembered preference so the
  // fallback is transparent and never silently replaces the saved choice.
  const visibleFertilizers = FERTILIZER_CATALOG.filter(
    (fert) =>
      (inventory.fertilizer?.[fert.id] || 0) > 0 ||
      fert.id === rememberedFertilizer?.id
  );

  const selectedCrop = selectedCropId
    ? CROP_CATALOG.find((c) => c.id === selectedCropId)
    : null;
  const selectedFertilizer = selectedFertilizerId
    ? FERTILIZER_CATALOG.find((fertilizer) => fertilizer.id === selectedFertilizerId)
    : null;

  const handleConfirmPlanting = () => {
    if (!selectedCropId) return;
    onSelectSeedWithFertilizer(selectedCropId, selectedFertilizerId);
  };

  const requestClose = () => {
    setSelectedCropId(null);
    setSelectedFertilizerId(null);
    onClose();
  };

  return (
    <AppModal theme="farm" archetype="transaction"
      onClose={requestClose}
      closeOnBackdrop
      labelledBy="plant-seed-title"
    >
        {/* Header */}
        <OverlayHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {selectedCrop ? (
              <ModalButton variant="icon"
                onClick={() => setSelectedCropId(null)}
                aria-label="Quay lại chọn hạt giống"
              >
                <ArrowLeft className="w-4 h-4" />
              </ModalButton>
            ) : (
              <div className="modal-status-icon">
                <Sprout className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 id="plant-seed-title" className="modal-title">
                {selectedCrop ? `Trồng Cây · Bước 2 (${selectedCrop.name})` : "Trồng Cây · Bước 1"}
              </h3>
              <p className="modal-copy">
                {selectedCrop ? "Chọn loại phân bón trước khi gieo hạt" : "Chọn loại hạt giống để gieo lên ô đất"}
              </p>
            </div>
          </div>

          <ModalButton variant="icon"
            onClick={() => {
              requestClose();
            }}
            aria-label="Đóng chọn hạt giống"
          >
            <X className="w-4 h-4" />
          </ModalButton>
        </OverlayHeader>

        {/* STEP 1: Select Crop */}
        {!selectedCrop ? (
          <>
            {/* Action Header bar: Quick store link */}
            {onOpenStore && (
              <div className="app-overlay__toolbar bg-slate-850/60 border-b border-slate-800 text-xs">
                <span className="text-[var(--modal-muted)] font-medium">
                  Sở hữu: <strong className="text-[var(--modal-success)] font-bold">{ownedCrops.length}</strong> loại hạt giống
                </span>
                <button
                  onClick={() => {
                    onOpenStore();
                  }}
                  className="modal-control app-overlay-button px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[var(--modal-reward)] font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Mua Tại Cửa Hàng</span>
                </button>
              </div>
            )}

            {/* Content List */}
            <OverlayBody>
              {ownedCrops.length === 0 ? (
                <div className="py-8 px-4 text-center space-y-3 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">
                    🌾
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-[var(--modal-text)] text-sm">
                      Chưa Có Hạt Giống Nào Đã Mua
                    </h4>
                    <p className="text-xs text-[var(--modal-muted)] max-w-xs mx-auto">
                      Bạn chưa sở hữu hạt giống trong kho. Hãy ghé Cửa Hàng để mua các hạt giống phong phú!
                    </p>
                  </div>
                  {onOpenStore && (
                    <button
                      onClick={() => {
                        onOpenStore();
                      }}
                      className="modal-control app-overlay-button mt-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Đến Cửa Hàng Cây Trồng</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ownedCrops.map((crop) => {
                    const count = inventory.seeds[crop.id] || 0;

                    return (
                      <button
                        key={crop.id}
                        onClick={() => setSelectedCropId(crop.id)}
                        className="modal-control app-overlay-button p-3 rounded-2xl border border-slate-750 hover:border-emerald-500/60 bg-slate-850 hover:bg-slate-800 text-left flex items-center justify-between gap-3 transition-all active:scale-95 cursor-pointer shadow-sm group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <img loading="lazy" decoding="async" fetchPriority="low"
                              src={getCropAsset(crop.id, "seed")}
                              alt=""
                              aria-hidden="true"
                              className="h-9 w-9 object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs text-[var(--modal-text)] truncate">
                              {crop.name}
                            </h4>
                            <div className="text-xs text-[var(--modal-muted)] mt-0.5 space-y-0.5">
                              <div>
                                Thu hoạch: <span className="text-[var(--modal-success)] font-bold">🪙{crop.harvestGold.toLocaleString("vi-VN")}</span>
                              </div>
                              <div>
                                Kinh nghiệm: <span className="text-[var(--modal-reward)] font-bold">⚡{crop.harvestXp.toLocaleString("vi-VN")} XP</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-[var(--modal-success)] border border-emerald-500/30 text-xs font-semibold">
                            x{count}
                          </span>
                          <span className="text-xs font-bold text-[var(--modal-success)] opacity-0 group-hover:opacity-100 transition-opacity">
                            Chọn →
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </OverlayBody>
          </>
        ) : (
          /* STEP 2: Fertilizer Selection */
          <>
          <OverlayBody>
            <div className="p-3 bg-slate-850 border border-slate-750 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img decoding="async"
                  src={getCropAsset(selectedCrop.id, "seed")}
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <h4 className="font-semibold text-sm text-[var(--modal-text)]">{selectedCrop.name}</h4>
                  <p className="text-xs text-[var(--modal-success)] font-semibold">
                    Còn {inventory.seeds[selectedCrop.id]} hạt giống
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--modal-text)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[var(--modal-reward)]" />
                <span>Chọn Phân Bón Kèm Theo (Tùy Chọn)</span>
              </label>

              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs">
                <div className="font-semibold text-[var(--modal-success)]">
                  {selectedFertilizer
                    ? `Đang chọn: ${selectedFertilizer.name}`
                    : "Đang chọn: Không dùng phân bón"}
                </div>
                <div className="mt-1 text-xs font-semibold text-[var(--modal-text)]">
                  {selectedFertilizer
                    ? [
                        selectedFertilizer.growthTimeReductionPct > 0
                          ? `Giảm ${Math.round(selectedFertilizer.growthTimeReductionPct * 100)}% thời gian sinh trưởng`
                          : null,
                        selectedFertilizer.xpBonusPct > 0
                          ? `Thưởng +${Math.round(selectedFertilizer.xpBonusPct * 100)}% XP`
                          : null,
                      ].filter(Boolean).join(" · ")
                    : "Cây sẽ dùng thời gian sinh trưởng và XP tiêu chuẩn."}
                </div>
              </div>

              {rememberedFertilizer && rememberedFertilizerCount <= 0 && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-[var(--modal-reward)]">
                  Đã ghi nhớ {rememberedFertilizer.name}, nhưng hiện đã hết. Lần gieo này đang dùng “Không dùng phân bón”; lựa chọn đã ghi nhớ vẫn được giữ cho lần sau.
                </div>
              )}

              {/* No fertilizer option */}
              <button
                onClick={() => setSelectedFertilizerId(null)}
                className={`modal-control app-overlay-button w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  selectedFertilizerId === null
                    ? "modal-control bg-amber-500/10 border-amber-400 text-[var(--modal-reward)]"
                    : "modal-control bg-slate-850 border-slate-750 text-[var(--modal-text)] hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <img decoding="async"
                    src={getCropAsset(selectedCrop.id, "seed")}
                    alt=""
                    aria-hidden="true"
                    className="h-7 w-7 object-contain"
                  />
                  <div>
                    <div className="font-bold text-xs">Không dùng phân bón</div>
                    <div className="text-xs text-[var(--modal-muted)]">Gieo hạt với thời gian và sản lượng chuẩn</div>
                  </div>
                </div>
                {selectedFertilizerId === null && <Check className="w-4 h-4 text-[var(--modal-reward)]" />}
              </button>

              {/* Owned fertilizers and an unavailable remembered preference */}
              {visibleFertilizers.map((fert) => {
                const isSelected = selectedFertilizerId === fert.id;
                const count = inventory.fertilizer[fert.id] || 0;
                const isOutOfStock = count <= 0;

                return (
                  <button
                    key={fert.id}
                    disabled={isOutOfStock}
                    onClick={() => !isOutOfStock && setSelectedFertilizerId(fert.id)}
                    className={`modal-control app-overlay-button w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "modal-control bg-amber-500/10 border-amber-400 text-[var(--modal-reward)]"
                        : isOutOfStock
                        ? "modal-control bg-slate-900 border-slate-800 text-[var(--modal-muted)] cursor-not-allowed opacity-75"
                        : "modal-control bg-slate-850 border-slate-750 text-[var(--modal-text)] hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{fert.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">{fert.name}</div>
                        <div className="text-xs text-[var(--modal-success)] font-medium">
                          {fert.category === "nutrition" && `+${Math.round(fert.xpBonusPct * 100)}% XP`}
                          {fert.category === "growth" && `-${Math.round(fert.growthTimeReductionPct * 100)}% thời gian`}
                          {fert.category === "premium" && `+${Math.round(fert.xpBonusPct * 100)}% XP & -${Math.round(fert.growthTimeReductionPct * 100)}% thời gian`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-xs font-bold text-[var(--modal-text)]">
                        {isOutOfStock ? "Hết" : `x${count}`}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[var(--modal-reward)]" />}
                    </div>
                  </button>
                );
              })}
            </div>

          </OverlayBody>
          <OverlayFooter>
            <ModalButton variant="primary"
              onClick={handleConfirmPlanting}
              className="w-full"
            >
              🚀 Trồng Cây Ngay
            </ModalButton>
          </OverlayFooter>
          </>
        )}
    </AppModal>
  );
};
