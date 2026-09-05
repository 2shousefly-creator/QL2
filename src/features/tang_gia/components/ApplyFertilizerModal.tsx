import React, { useEffect, useState } from "react";
import { Check, Sparkles, Store, X } from "lucide-react";
import { FERTILIZER_CATALOG } from "../farmCatalog";
import type { FarmInventory, FertilizerTypeId } from "../farmTypes";
import { AppModal, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";

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
    <AppModal
      onClose={onClose}
      closeOnBackdrop
      labelledBy="apply-fertilizer-title"
      panelClassName="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl"
    >
        <OverlayHeader className="flex items-center justify-between gap-2 border-b border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <div>
              <h3 id="apply-fertilizer-title" className="text-sm font-black text-slate-100">Bón Phân</h3>
              <p className="text-xs text-slate-400">Chọn 1 loại phân đang sở hữu</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-800 p-2 text-slate-400" aria-label="Đóng bón phân">
            <X className="h-4 w-4" />
          </button>
        </OverlayHeader>

        <OverlayBody className="space-y-2 p-4">
          {ownedFertilizers.length === 0 ? (
            <div className="space-y-3 py-8 text-center">
              <p className="text-sm font-bold text-slate-300">Kho chưa có phân bón</p>
              {onOpenStore && (
                <button
                  onClick={onOpenStore}
                  className="mx-auto flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950"
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
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left ${
                    selected
                      ? "border-amber-400 bg-amber-500/10"
                      : "border-slate-700 bg-slate-800/70"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-2xl">{fertilizer.icon}</span>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-black text-slate-100">{fertilizer.name}</div>
                      <div className="text-[10px] font-semibold text-emerald-300">
                        {fertilizer.xpBonusPct > 0 && `+${Math.round(fertilizer.xpBonusPct * 100)}% XP`}
                        {fertilizer.xpBonusPct > 0 && fertilizer.growthTimeReductionPct > 0 && " · "}
                        {fertilizer.growthTimeReductionPct > 0 && `-${Math.round(fertilizer.growthTimeReductionPct * 100)}% workload còn lại`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-black text-slate-300">
                    x{inventory.fertilizer[fertilizer.id] || 0}
                    {selected && <Check className="h-4 w-4 text-amber-400" />}
                  </div>
                </button>
              );
            })
          )}
        </OverlayBody>

        <OverlayFooter className="border-t border-slate-800 p-4">
          <button
            disabled={!selectedId}
            onClick={() => selectedId && onConfirm(selectedId)}
            className="w-full rounded-2xl bg-amber-500 py-3 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Xác Nhận Bón Phân
          </button>
        </OverlayFooter>
    </AppModal>
  );
};
