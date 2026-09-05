import React from "react";
import { EGG_INFO_MAP } from "../farmCatalog";
import { EggTypeId, FarmInventory } from "../farmTypes";
import { Egg, X, Coins, Zap } from "lucide-react";
import { AppModal, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";

interface EggStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: FarmInventory;
  onSellEggs: (eggTypeId: EggTypeId, count: number) => void;
  onSellAllEggs?: () => void;
}

export const EggStorageModal: React.FC<EggStorageModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onSellEggs,
  onSellAllEggs,
}) => {
  if (!isOpen) return null;

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

  const totalEggs = eggTypes.reduce(
    (acc, id) => acc + (inventory.eggs[id] || 0),
    0
  );

  return (
    <AppModal
      onClose={onClose}
      closeOnBackdrop
      labelledBy="egg-storage-title"
      panelClassName="app-overlay--spaced w-full max-w-lg bg-slate-900 border border-slate-800/70 rounded-3xl shadow-2xl animate-in fade-in duration-200"
    >
        {/* Modal Header */}
        <OverlayHeader className="bg-slate-850/90 border-b border-slate-800/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Egg className="w-5 h-5" />
            </div>
            <div>
              <h3 id="egg-storage-title" className="font-extrabold text-base text-slate-100">
                Kho Trứng Trại
              </h3>
              <p className="text-xs text-slate-400">
                Tổng số trứng trong kho:{" "}
                <span className="font-bold text-amber-300">{totalEggs} quả</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="app-overlay-button app-overlay-button--icon w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Đóng kho trứng"
          >
            <X className="w-4 h-4" />
          </button>
        </OverlayHeader>

        {/* Eggs List - Information Only, No per-row action buttons */}
        <OverlayBody className="space-y-3 divide-y divide-slate-800/60">
          {eggTypes.filter(typeId => (inventory.eggs[typeId] || 0) > 0).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-2">
              <Egg className="w-12 h-12 text-slate-600 animate-pulse" />
              <p className="text-sm font-medium">Kho trứng hiện đang trống</p>
            </div>
          ) : (
            eggTypes
              .filter(typeId => (inventory.eggs[typeId] || 0) > 0)
              .map((typeId) => {
                const info = EGG_INFO_MAP[typeId];
                const count = inventory.eggs[typeId] || 0;

                return (
                  <div
                    key={typeId}
                    className="pt-3 first:pt-0 flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-800/80 flex items-center justify-center text-2xl shrink-0">
                        🥚
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <h4 className="truncate font-extrabold text-sm text-slate-100">
                          {info.name}
                        </h4>

                        <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                          <span className="text-amber-400 flex items-center gap-1">
                            🪙 {info.sellGold} Vàng/quả
                          </span>
                          <span className="text-purple-400 flex items-center gap-1">
                            ⚡ {info.sellXp} XP/quả
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-auto min-w-[74px] shrink-0 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-right shadow-inner">
                      <div className="text-xl font-black leading-none text-amber-300">
                        {count.toLocaleString("vi-VN")}
                      </div>
                      <div className="mt-1 text-[9px] font-extrabold uppercase tracking-widest text-amber-200/70">
                        quả trứng
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </OverlayBody>

        {/* Modal Footer - Single primary "Bán tất cả trứng" button */}
        {onSellAllEggs && totalEggs > 0 && (
          <OverlayFooter className="bg-slate-850/90 border-t border-slate-800/60">
            <button
              onClick={() => {
                onSellAllEggs();
              }}
              className="app-overlay-button w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>Bán Tất Cả Trứng ({totalEggs} quả)</span>
            </button>
          </OverlayFooter>
        )}
    </AppModal>
  );
};
