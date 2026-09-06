import React, { useEffect, useState } from "react";
import { Check, Sparkles, Store, X } from "lucide-react";
import { FERTILIZER_CATALOG } from "../farmCatalog";
import type { FarmInventory, FertilizerTypeId } from "../farmTypes";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";

interface ApplyFertilizerModalProps {
  isOpen: boolean;
  inventory: FarmInventory;
  onClose: () => void;
  onConfirm: (fertilizerId: FertilizerTypeId) => void;
  onOpenStore?: () => void;
}

export const ApplyFertilizerModal: React.FC<ApplyFertilizerModalProps> = ({
  isOpen,
  inventory,
  onClose,
  onConfirm,
  onOpenStore,
}) => {
  const [selectedId, setSelectedId] = useState<FertilizerTypeId | null>(null);

  useEffect(() => {
    if (isOpen) setSelectedId(null);
  }, [isOpen]);

  if (!isOpen) return null;
  const ownedFertilizers = FERTILIZER_CATALOG.filter(
    (fertilizer) => (inventory.fertilizer?.[fertilizer.id] || 0) > 0
  );

  return (
    <AppModal theme="farm" archetype="transaction"
      onClose={onClose}
      closeOnBackdrop
      labelledBy="apply-fertilizer-title"
    >
        <OverlayHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--modal-reward)]" />
            <div>
              <h3 id="apply-fertilizer-title" className="modal-title">Bón Phân</h3>
              <p className="modal-copy">Chọn 1 loại phân đang sở hữu</p>
            </div>
          </div>
          <ModalButton variant="icon" onClick={onClose} aria-label="Đóng bón phân">
            <X className="h-4 w-4" />
          </ModalButton>
        </OverlayHeader>

        <OverlayBody>
          {ownedFertilizers.length === 0 ? (
            <div className="space-y-3 py-8 text-center">
              <p className="text-sm font-bold text-[var(--modal-text)]">Kho chưa có phân bón</p>
              {onOpenStore && (
                <button
                  onClick={onOpenStore}
                  className="modal-control app-overlay-button mx-auto flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950"
                >
                  <Store className="h-4 w-4" /> Đến Cửa Hàng
                </button>
              )}
            </div>
          ) : (
            ownedFertilizers.map((fertilizer) => {
              const selected = selectedId === fertilizer.id;
              return (
                <button
                  key={fertilizer.id}
                  onClick={() => setSelectedId(fertilizer.id)}
                  className={`modal-control app-overlay-button flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left ${
                    selected
                      ? "modal-control border-amber-400 bg-amber-500/10"
                      : "modal-control border-slate-700 bg-slate-800/70"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-2xl">{fertilizer.icon}</span>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-[var(--modal-text)]">{fertilizer.name}</div>
                      <div className="text-xs font-semibold text-[var(--modal-success)]">
                        {fertilizer.xpBonusPct > 0 && `+${Math.round(fertilizer.xpBonusPct * 100)}% XP`}
                        {fertilizer.xpBonusPct > 0 && fertilizer.growthTimeReductionPct > 0 && " · "}
                        {fertilizer.growthTimeReductionPct > 0 && `-${Math.round(fertilizer.growthTimeReductionPct * 100)}% workload còn lại`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--modal-text)]">
                    x{inventory.fertilizer[fertilizer.id] || 0}
                    {selected && <Check className="h-4 w-4 text-[var(--modal-reward)]" />}
                  </div>
                </button>
              );
            })
          )}
        </OverlayBody>

        <OverlayFooter>
          <ModalButton variant="primary"
            disabled={!selectedId}
            onClick={() => selectedId && onConfirm(selectedId)}
            className="w-full"
          >
            Xác Nhận Bón Phân
          </ModalButton>
        </OverlayFooter>
    </AppModal>
  );
};
