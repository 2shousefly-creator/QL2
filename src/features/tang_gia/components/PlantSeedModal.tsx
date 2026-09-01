import React, { useEffect, useState } from "react";
import { CROP_CATALOG, FERTILIZER_CATALOG } from "../farmCatalog";
import { CropId, FertilizerTypeId, FarmInventory } from "../farmTypes";
import { Sprout, X, Store, ShoppingBag, ArrowLeft, Sparkles, Check } from "lucide-react";
import { getCropAsset } from "../tangGiaAssetManifest";

interface PlantSeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: FarmInventory;
  onSelectSeedWithFertilizer: (cropId: CropId, fertilizerId: FertilizerTypeId | null) => void;
  onOpenStore?: () => void;
}

export const PlantSeedModal: React.FC<PlantSeedModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onSelectSeedWithFertilizer,
  onOpenStore,
}) => {
  const [selectedCropId, setSelectedCropId] = useState<CropId | null>(null);
  const [selectedFertilizerId, setSelectedFertilizerId] = useState<FertilizerTypeId | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCropId(null);
    setSelectedFertilizerId(null);
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter ONLY seeds that user currently owns
  const ownedCrops = CROP_CATALOG.filter(
    (crop) => (inventory.seeds[crop.id] || 0) > 0
  );

  // Owned fertilizers
  const ownedFertilizers = FERTILIZER_CATALOG.filter(
    (fert) => (inventory.fertilizer?.[fert.id] || 0) > 0
  );

  const selectedCrop = selectedCropId
    ? CROP_CATALOG.find((c) => c.id === selectedCropId)
    : null;

  const handleConfirmPlanting = () => {
    if (!selectedCropId) return;
    onSelectSeedWithFertilizer(selectedCropId, selectedFertilizerId);
    setSelectedCropId(null);
    setSelectedFertilizerId(null);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSelectedCropId(null);
        setSelectedFertilizerId(null);
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh] cursor-default"
      >
        {/* Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-750 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {selectedCrop ? (
              <button
                onClick={() => setSelectedCropId(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-base text-slate-100">
                {selectedCrop ? `Bón Phân Bón (${selectedCrop.name})` : "Hạt Giống Đã Mua"}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedCrop ? "Chọn loại phân bón trước khi gieo hạt" : "Chọn loại hạt giống để gieo lên ô đất"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedCropId(null);
              setSelectedFertilizerId(null);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: Select Crop */}
        {!selectedCrop ? (
          <>
            {/* Action Header bar: Quick store link */}
            {onOpenStore && (
              <div className="px-4 py-2 bg-slate-850/60 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  Sở hữu: <strong className="text-emerald-400 font-bold">{ownedCrops.length}</strong> loại hạt giống
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenStore();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-[11px] flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Mua Tại Cửa Hàng</span>
                </button>
              </div>
            )}

            {/* Content List */}
            <div className="p-3.5 overflow-y-auto space-y-2.5 flex-1 max-h-[60vh]">
              {ownedCrops.length === 0 ? (
                <div className="py-8 px-4 text-center space-y-3 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">
                    🌾
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-200 text-sm">
                      Chưa Có Hạt Giống Nào Đã Mua
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Bạn chưa sở hữu hạt giống trong kho. Hãy ghé Cửa Hàng để mua các hạt giống phong phú!
                    </p>
                  </div>
                  {onOpenStore && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenStore();
                      }}
                      className="mt-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
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
                        className="p-3 rounded-2xl border border-slate-750 hover:border-emerald-500/60 bg-slate-850 hover:bg-slate-800 text-left flex items-center justify-between gap-3 transition-all active:scale-95 cursor-pointer shadow-sm group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <img
                              src={getCropAsset(crop.id, "seed")}
                              alt=""
                              aria-hidden="true"
                              className="h-9 w-9 object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs text-slate-100 truncate">
                              {crop.name}
                            </h4>
                            <div className="text-[10px] text-slate-400 mt-0.5 space-y-0.5">
                              <div>
                                Thu hoạch: <span className="text-emerald-400 font-bold">🪙{crop.harvestGold.toLocaleString("vi-VN")}</span>
                              </div>
                              <div>
                                Kinh nghiệm: <span className="text-amber-300 font-bold">⚡{crop.harvestXp.toLocaleString("vi-VN")} XP</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                            x{count}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Chọn →
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* STEP 2: Fertilizer Selection */
          <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
            <div className="p-3 bg-slate-850 border border-slate-750 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={getCropAsset(selectedCrop.id, "seed")}
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-100">{selectedCrop.name}</h4>
                  <p className="text-[11px] text-emerald-400 font-semibold">
                    Còn {inventory.seeds[selectedCrop.id]} hạt giống
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Chọn Phân Bón Kèm Theo (Tùy Chọn)</span>
              </label>

              {/* No fertilizer option */}
              <button
                onClick={() => setSelectedFertilizerId(null)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  selectedFertilizerId === null
                    ? "bg-amber-500/10 border-amber-400 text-amber-200"
                    : "bg-slate-850 border-slate-750 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={getCropAsset(selectedCrop.id, "seed")}
                    alt=""
                    aria-hidden="true"
                    className="h-7 w-7 object-contain"
                  />
                  <div>
                    <div className="font-bold text-xs">Không dùng phân bón</div>
                    <div className="text-[10px] text-slate-400">Gieo hạt với thời gian và sản lượng chuẩn</div>
                  </div>
                </div>
                {selectedFertilizerId === null && <Check className="w-4 h-4 text-amber-400" />}
              </button>

              {/* Owned fertilizers */}
              {ownedFertilizers.map((fert) => {
                const isSelected = selectedFertilizerId === fert.id;
                const count = inventory.fertilizer[fert.id] || 0;

                return (
                  <button
                    key={fert.id}
                    onClick={() => setSelectedFertilizerId(fert.id)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-400 text-amber-200"
                        : "bg-slate-850 border-slate-750 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{fert.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">{fert.name}</div>
                        <div className="text-[10px] text-emerald-400 font-medium">
                          {fert.category === "nutrition" && `+${Math.round(fert.xpBonusPct * 100)}% XP`}
                          {fert.category === "growth" && `-${Math.round(fert.growthTimeReductionPct * 100)}% thời gian`}
                          {fert.category === "premium" && `+${Math.round(fert.xpBonusPct * 100)}% XP & -${Math.round(fert.growthTimeReductionPct * 100)}% thời gian`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-300">
                        x{count}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleConfirmPlanting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all mt-2"
            >
              🚀 Trồng Cây Ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
