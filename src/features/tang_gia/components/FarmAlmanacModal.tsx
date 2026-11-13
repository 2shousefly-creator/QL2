import { useState } from "react";
import { BookOpen, Bird, Sparkles, Wheat, X } from "lucide-react";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";
import { ANIMAL_CATALOG, CROP_CATALOG } from "../farmCatalog";
import { ensureFarmAlmanac } from "../farmEnhancements";
import type { FarmSaveState } from "../farmTypes";
import { animalArt, cropArt } from "../mobile/FarmArtRegistry";
import { FarmMarketArt } from "./FarmMarketArt";

interface FarmAlmanacModalProps {
  isOpen: boolean;
  farm: FarmSaveState;
  onClose: () => void;
}

export function FarmAlmanacModal({ isOpen, farm, onClose }: FarmAlmanacModalProps) {
  const [tab, setTab] = useState<"crops" | "animals">("crops");
  if (!isOpen) return null;

  const almanac = ensureFarmAlmanac(farm);
  const discoveredCrops = CROP_CATALOG.filter((c) => (almanac.crops[c.id]?.count ?? 0) > 0).length;
  const discoveredAnimals = ANIMAL_CATALOG.filter((a) => (almanac.animals[a.id]?.count ?? 0) > 0).length;

  return (
    <AppModal
      theme="farm"
      archetype="info"
      size="wide"
      panelClassName="farm-market"
      onClose={onClose}
      closeOnBackdrop
      labelledBy="farm-almanac-title"
    >
      <OverlayHeader className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="modal-status-icon flex items-center justify-center rounded-xl border border-amber-300/35 bg-amber-400/15 p-2 text-amber-200">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 id="farm-almanac-title" className="text-base font-extrabold text-amber-50 truncate">
              Sổ Tay Nông Sản & Thành Tích
            </h2>
            <p className="text-xs text-emerald-100/80">
              Cây trồng: {discoveredCrops}/{CROP_CATALOG.length} · Vật nuôi: {discoveredAnimals}/{ANIMAL_CATALOG.length}
            </p>
          </div>
        </div>
        <ModalButton variant="icon" aria-label="Đóng sổ tay" onClick={onClose}>
          <X className="h-4 w-4" />
        </ModalButton>
      </OverlayHeader>

      <OverlayBody className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-emerald-950/55 px-3 py-2">
            <div className="text-[11px] text-emerald-100/75">Lượt tưới nước</div>
            <div className="text-sm font-extrabold text-sky-300">{almanac.totalWaters.toLocaleString("vi-VN")}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-emerald-950/55 px-3 py-2">
            <div className="text-[11px] text-emerald-100/75">Lượt diệt sâu</div>
            <div className="text-sm font-extrabold text-rose-300">{almanac.totalPestsTreated.toLocaleString("vi-VN")}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-emerald-950/55 px-3 py-2">
            <div className="text-[11px] text-emerald-100/75">Lượt bón phân</div>
            <div className="text-sm font-extrabold text-emerald-300">{almanac.totalFertilizersApplied.toLocaleString("vi-VN")}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-emerald-950/55 px-3 py-2">
            <div className="text-[11px] text-emerald-100/75">Đơn hậu cần xong</div>
            <div className="text-sm font-extrabold text-amber-300">{almanac.totalOrdersClaimed.toLocaleString("vi-VN")}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("crops")}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              tab === "crops"
                ? "border-amber-300/60 bg-emerald-800/80 text-amber-100"
                : "border-white/15 bg-black/25 text-emerald-100/75"
            }`}
          >
            <Wheat className="h-3.5 w-3.5" /> Cây Trồng ({discoveredCrops}/{CROP_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("animals")}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              tab === "animals"
                ? "border-amber-300/60 bg-emerald-800/80 text-amber-100"
                : "border-white/15 bg-black/25 text-emerald-100/75"
            }`}
          >
            <Bird className="h-3.5 w-3.5" /> Vật Nuôi ({discoveredAnimals}/{ANIMAL_CATALOG.length})
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {tab === "crops"
            ? CROP_CATALOG.map((crop) => {
                const record = almanac.crops[crop.id];
                const unlocked = (record?.count ?? 0) > 0;
                return (
                  <div
                    key={crop.id}
                    className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                      unlocked
                        ? "border-emerald-300/30 bg-emerald-950/60"
                        : "border-white/10 bg-black/25 opacity-65"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-emerald-900/45 [&_.farm-market-art]:!h-11 [&_.farm-market-art]:!w-11 ${
                        unlocked ? "" : "grayscale"
                      }`}
                    >
                      <FarmMarketArt art={cropArt(crop.id, "ready")} enabled />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-amber-50">{crop.name}</span>
                        {unlocked && record && (
                          <span className="text-xs font-bold text-emerald-300">×{record.count}</span>
                        )}
                      </div>
                      {unlocked && record ? (
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-emerald-100/85">
                          <span>🪙 {record.goldEarned.toLocaleString("vi-VN")} Vàng</span>
                          {record.perfectCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-amber-300">
                              <Sparkles className="h-3 w-3" /> {record.perfectCount} Hoàn Mỹ
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="mt-0.5 text-[11px] text-emerald-100/60">Chưa từng thu hoạch</p>
                      )}
                    </div>
                  </div>
                );
              })
            : ANIMAL_CATALOG.map((animal) => {
                const record = almanac.animals[animal.id];
                const unlocked = (record?.count ?? 0) > 0;
                return (
                  <div
                    key={animal.id}
                    className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                      unlocked
                        ? "border-amber-300/30 bg-emerald-950/60"
                        : "border-white/10 bg-black/25 opacity-65"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-emerald-900/45 [&_.farm-market-art]:!h-11 [&_.farm-market-art]:!w-11 ${
                        unlocked ? "" : "grayscale"
                      }`}
                    >
                      <FarmMarketArt art={animalArt(animal.id, "idle")} enabled />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-amber-50">{animal.name}</span>
                        {unlocked && record && (
                          <span className="text-xs font-bold text-amber-200">{record.count} trứng</span>
                        )}
                      </div>
                      {unlocked && record ? (
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-emerald-100/85">
                          <span>🪙 {record.goldEarned.toLocaleString("vi-VN")} Vàng</span>
                          {record.perfectCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-amber-300">
                              <Sparkles className="h-3 w-3" /> {record.perfectCount} Hoàn Mỹ
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="mt-0.5 text-[11px] text-emerald-100/60">Chưa từng bán trứng</p>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      </OverlayBody>

      <OverlayFooter className="flex justify-end">
        <ModalButton variant="ghost" onClick={onClose}>
          Đóng
        </ModalButton>
      </OverlayFooter>
    </AppModal>
  );
}
