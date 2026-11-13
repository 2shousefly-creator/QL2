import { ArrowUpCircle, Coins, Droplets, Footprints, Lock, Utensils, Warehouse, X } from "lucide-react";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";
import type { RankStep } from "../../../game/types";
import {
  FARM_UPGRADE_DEFINITIONS,
  MAX_FARM_UPGRADE_LEVEL,
  canUpgradeFarmBuilding,
  getFarmUpgrades,
} from "../farmEnhancements";
import type { FarmSaveState, FarmUpgradeId } from "../farmTypes";

interface FarmUpgradesModalProps {
  isOpen: boolean;
  farm: FarmSaveState;
  currentRank: RankStep;
  onClose: () => void;
  onUpgrade: (id: FarmUpgradeId) => void;
}

function BuildingIcon({ id }: { id: FarmUpgradeId }) {
  if (id === "well") return <Droplets className="h-5 w-5 text-sky-300" />;
  if (id === "trough") return <Utensils className="h-5 w-5 text-amber-300" />;
  if (id === "warehouse") return <Warehouse className="h-5 w-5 text-emerald-300" />;
  return <Footprints className="h-5 w-5 text-violet-300" />;
}

export function FarmUpgradesModal({
  isOpen,
  farm,
  currentRank,
  onClose,
  onUpgrade,
}: FarmUpgradesModalProps) {
  if (!isOpen) return null;

  const upgrades = getFarmUpgrades(farm);

  return (
    <AppModal
      theme="farm"
      archetype="transaction"
      size="standard"
      onClose={onClose}
      closeOnBackdrop
      labelledBy="farm-upgrades-title"
    >
      <OverlayHeader className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="modal-status-icon flex items-center justify-center rounded-xl border border-emerald-300/35 bg-emerald-400/15 p-2 text-emerald-200">
            <ArrowUpCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 id="farm-upgrades-title" className="text-base font-extrabold text-amber-50 truncate">
              Nâng Cấp Hạ Tầng Tăng Gia
            </h2>
            <p className="text-xs text-emerald-100/80">
              Vàng hiện có: <strong className="text-amber-300">{farm.gold.toLocaleString("vi-VN")} 🪙</strong> · {currentRank.shortName}
            </p>
          </div>
        </div>
        <ModalButton variant="icon" aria-label="Đóng nâng cấp" onClick={onClose}>
          <X className="h-4 w-4" />
        </ModalButton>
      </OverlayHeader>

      <OverlayBody className="space-y-2.5">
        {FARM_UPGRADE_DEFINITIONS.map((def) => {
          const level = upgrades[def.id];
          const check = canUpgradeFarmBuilding(farm, def.id, currentRank.rankIndex);
          const isMax = level >= MAX_FARM_UPGRADE_LEVEL;
          return (
            <div
              key={def.id}
              className="rounded-xl border border-emerald-200/20 bg-emerald-950/50 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/30">
                    <BuildingIcon id={def.id} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-extrabold text-amber-50">{def.name}</h3>
                      <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-200">
                        Cấp {level}/{MAX_FARM_UPGRADE_LEVEL}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-emerald-100/75">{def.subtitle}</p>
                    <p className="mt-1.5 text-xs font-semibold text-emerald-200">
                      Hiện tại: {def.effectSummary(level)}
                    </p>
                    {!isMax && (
                      <p className="mt-0.5 text-xs font-semibold text-amber-200/95">
                        Cấp {check.nextLevel}: {def.effectSummary(check.nextLevel)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/10 pt-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: MAX_FARM_UPGRADE_LEVEL }, (_, i) => (
                    <span
                      key={i}
                      className={`h-2 w-5 rounded-sm ${
                        i < level ? "bg-amber-400" : "bg-white/15"
                      }`}
                    />
                  ))}
                </div>
                {isMax ? (
                  <span className="rounded-lg bg-emerald-500/25 px-3 py-1 text-xs font-bold text-emerald-200">
                    Tối đa
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    {!check.canUpgrade && check.reason && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-200">
                        <Lock className="h-3 w-3" /> {check.reason}
                      </span>
                    )}
                    <ModalButton
                      variant={check.canUpgrade ? "primary" : "ghost"}
                      disabled={!check.canUpgrade}
                      onClick={() => onUpgrade(def.id)}
                      className="!min-h-0 !px-3 !py-1.5 !text-xs"
                    >
                      <Coins className="mr-1 inline h-3.5 w-3.5" />
                      {check.cost?.toLocaleString("vi-VN")} Vàng
                    </ModalButton>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </OverlayBody>

      <OverlayFooter className="flex justify-end">
        <ModalButton variant="ghost" onClick={onClose}>
          Đóng
        </ModalButton>
      </OverlayFooter>
    </AppModal>
  );
}
