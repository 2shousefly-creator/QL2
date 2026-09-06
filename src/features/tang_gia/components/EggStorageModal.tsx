import React from "react";
import { EGG_INFO_MAP } from "../farmCatalog";
import { EggTypeId, FarmInventory } from "../farmTypes";
import { Coins, Egg, X } from "lucide-react";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";

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
    <AppModal theme="farm" archetype="transaction"
      onClose={onClose}
      closeOnBackdrop
      labelledBy="egg-storage-title"
    >
        {/* Modal Header */}
        <OverlayHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="modal-status-icon">
              <Egg className="w-5 h-5" />
            </div>
            <div>
              <h3 id="egg-storage-title" className="modal-title">
                Kho Trứng Trại
              </h3>
              <p className="modal-copy">
                Tổng số trứng trong kho:{" "}
                <span className="font-bold text-[var(--modal-reward)]">{totalEggs} quả</span>
              </p>
            </div>
          </div>

          <ModalButton variant="icon"
            onClick={onClose}
            aria-label="Đóng kho trứng"
          >
            <X className="w-4 h-4" />
          </ModalButton>
        </OverlayHeader>

        {/* Eggs List - Information Only, No per-row action buttons */}
        <OverlayBody className="divide-y divide-slate-800/60">
          {eggTypes.filter(typeId => (inventory.eggs[typeId] || 0) > 0).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--modal-muted)] space-y-2">
              <Egg className="w-12 h-12 text-[var(--modal-muted)] animate-pulse" />
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
                        <h4 className="truncate font-semibold text-sm text-[var(--modal-text)]">
                          {info.name}
                        </h4>

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

                    <div className="ml-auto min-w-[74px] shrink-0 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-right shadow-inner">
                      <div className="text-xl font-semibold leading-none text-[var(--modal-reward)]">
                        {count.toLocaleString("vi-VN")}
                      </div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-[var(--modal-reward)]">
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
  );
};
