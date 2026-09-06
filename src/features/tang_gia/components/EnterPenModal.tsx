import React from "react";
import { RankStep } from "../../../game/types";
import { RANK_STEPS } from "../../../game/rankBuilder";
import { ANIMAL_CATALOG } from "../farmCatalog";
import { getAnimalCapacity } from "../farmEngine";
import { AnimalTypeId, FarmInventory, AnimalInstance } from "../farmTypes";
import { Home, X, AlertCircle, Store, ShoppingBag } from "lucide-react";
import { AppModal, ModalButton, OverlayBody, OverlayHeader } from "../../../components/overlay/AppOverlay";

interface EnterPenModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: FarmInventory;
  penAnimals: AnimalInstance[];
  currentRank: RankStep;
  onEnterPen: (animalId: AnimalTypeId) => void;
  onOpenStore?: () => void;
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

export const EnterPenModal: React.FC<EnterPenModalProps> = ({
  isOpen,
  onClose,
  inventory,
  penAnimals,
  currentRank,
  onEnterPen,
  onOpenStore,
}) => {
  if (!isOpen) return null;

  const capacity = getAnimalCapacity(currentRank);
  const currentCount = penAnimals.length;
  const isFull = currentCount >= capacity;

  const nextRankWithCapacity = RANK_STEPS.find((step) => getAnimalCapacity(step) > capacity);
  const nextRankName = nextRankWithCapacity
    ? (nextRankWithCapacity.tier !== null ? `${nextRankWithCapacity.familyName} ${nextRankWithCapacity.tier}` : nextRankWithCapacity.familyName)
    : "quân hàm tiếp theo";

  // Filter ONLY animals that user currently owns
  const ownedAnimals = ANIMAL_CATALOG.filter(
    (animal) => (inventory.animals[animal.id] || 0) > 0
  );

  return (
    <AppModal theme="farm" archetype="transaction"
      onClose={onClose}
      closeOnBackdrop
      labelledBy="enter-pen-title"
    >
        {/* Header */}
        <OverlayHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="modal-status-icon">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 id="enter-pen-title" className="modal-title">
                Nhập Chuồng Vật Nuôi
              </h3>
              <p className="modal-copy">
                Sức chứa chuồng:{" "}
                <span
                  className={`font-bold ${
                    isFull ? "text-[var(--modal-danger)]" : "text-[var(--modal-reward)]"
                  }`}
                >
                  {currentCount}/{capacity} con
                </span>
              </p>
            </div>
          </div>

          <ModalButton variant="icon"
            onClick={onClose}
            aria-label="Đóng nhập chuồng"
          >
            <X className="w-4 h-4" />
          </ModalButton>
        </OverlayHeader>

        {/* Quick Store Link Bar */}
        {onOpenStore && (
          <div className="app-overlay__toolbar bg-slate-850/60 border-b border-slate-800 text-xs shrink-0">
            <span className="text-[var(--modal-muted)] font-medium">
              Thú trong kho: <strong className="text-[var(--modal-reward)] font-bold">{ownedAnimals.length}</strong> loại
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

        {/* Warning banner if pen is full */}
        {isFull && (
          <div className="p-3 bg-red-500/10 border-b border-red-500/30 flex items-center gap-2.5 text-[var(--modal-danger)] text-xs font-semibold shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-[var(--modal-danger)]" />
            <span>
              Chuồng đã đạt sức chứa tối đa {capacity} con! Thăng cấp {nextRankName} để mở thêm vị trí.
            </span>
          </div>
        )}

        {/* Animals List */}
        <OverlayBody>
          {ownedAnimals.length === 0 ? (
            <div className="py-8 px-4 text-center space-y-3 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">
                🐣
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-[var(--modal-text)] text-sm">
                  Chưa Có Vật Nuôi Nào Trong Kho
                </h4>
                <p className="text-xs text-[var(--modal-muted)] max-w-xs mx-auto">
                  Bạn chưa mua con giống nào. Ghé Cửa Hàng để chọn mua các con giống phù hợp!
                </p>
              </div>
              {onOpenStore && (
                <button
                  onClick={() => {
                    onOpenStore();
                  }}
                  className="modal-control app-overlay-button mt-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Đến Cửa Hàng Vật Nuôi</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ownedAnimals.map((animal) => {
                const ownedCount = inventory.animals[animal.id] || 0;
                const canPlace = ownedCount > 0 && !isFull;

                return (
                  <button
                    key={animal.id}
                    disabled={!canPlace}
                    onClick={() => {
                      onEnterPen(animal.id);
                      onClose();
                    }}
                    className={`modal-control app-overlay-button p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer shadow-sm group ${
                      canPlace
                        ? "modal-control bg-slate-850 hover:bg-slate-800 border-slate-750 hover:border-amber-500/60 active:scale-95"
                        : "modal-control bg-slate-900/60 border-slate-800 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                        {getAnimalEmoji(animal.id)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-[var(--modal-text)] truncate">
                          {animal.name}
                        </h4>
                        <div className="text-xs text-[var(--modal-muted)] mt-0.5 space-y-0.5">
                          <div>
                            Bán trứng: <span className="text-[var(--modal-success)] font-bold">🪙{animal.eggSellGold.toLocaleString("vi-VN")}</span>
                          </div>
                          <div>
                            XP trứng: <span className="text-[var(--modal-reward)] font-bold">⚡{animal.eggSellXp.toLocaleString("vi-VN")} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-[var(--modal-reward)] border border-amber-500/30 text-xs font-semibold">
                        x{ownedCount}
                      </span>
                      {canPlace && (
                        <span className="text-xs font-bold text-[var(--modal-reward)] opacity-0 group-hover:opacity-100 transition-opacity">
                          Thả nuôi →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </OverlayBody>
    </AppModal>
  );
};

