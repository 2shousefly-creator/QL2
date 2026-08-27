import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Award, ShieldCheck, Sparkles } from "lucide-react";
import { getPlayerFamily, getPlayerRank } from "../../game/selectors";
import { soundManager } from "../../game/audio";
import type { GameState } from "../../game/types";
import { getUniformArtConfig } from "./uniform/uniformArtCatalog";
import { UniformPortrait } from "./uniform/UniformPortrait";
import { UniformRankSelector } from "./uniform/UniformRankSelector";
import {
  getUnlockedUniformFamilies,
  getUniformFamilyAchievedAt,
  getUniformFilledSegments,
} from "./uniform/uniformSelectors";

type UniformScreenProps = {
  state: GameState;
  onBack?: () => void;
};

const formatAchievedDate = (timestamp: number): string => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(timestamp));
};

export const UniformScreen: React.FC<UniformScreenProps> = ({ state, onBack }) => {
  const currentRank = getPlayerRank(state);
  const currentFamily = getPlayerFamily(state);
  const unlockedFamilies = useMemo(
    () => getUnlockedUniformFamilies(state),
    [state.progression.currentRankIndex, state.progression.promotionHistory]
  );
  const [selectedFamilyId, setSelectedFamilyId] = useState(currentFamily.id);

  useEffect(() => {
    setSelectedFamilyId(currentFamily.id);
  }, [currentFamily.id]);

  const selectedFamily =
    unlockedFamilies.find((family) => family.id === selectedFamilyId) ?? currentFamily;
  const isCurrentFamily = selectedFamily.id === currentFamily.id;
  const artConfig = getUniformArtConfig(selectedFamily.id);
  const filledSegments = getUniformFilledSegments(selectedFamily, currentRank, isCurrentFamily);
  const achievedAt = getUniformFamilyAchievedAt(state, selectedFamily.id);
  const selectedMedalIds = (state.medals?.selectedMedalIds ?? []).slice(0, 6);

  const handleSelectFamily = (familyId: string) => {
    soundManager.playClick();
    setSelectedFamilyId(familyId);
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 px-4 pb-10 pt-4 select-none">
      <header className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onBack();
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-slate-300 transition hover:border-amber-400 hover:text-amber-300"
            aria-label="Quay lại Hồ Sơ"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black uppercase tracking-[0.14em] text-slate-100">Quân Phục</h1>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-xs text-slate-400">Quân phục binh nghiệp theo cấp bậc đã đạt</p>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/95 p-4 shadow-xl">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl"
          style={{ backgroundColor: artConfig.shoulderPalette.glow }}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Đang xem</p>
            <h2 className="truncate text-xl font-black text-slate-100">{selectedFamily.name}</h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">Nghi thức: {artConfig.groupLabel}</p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
              isCurrentFamily
                ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                : "border-sky-400/50 bg-sky-500/15 text-sky-300"
            }`}
          >
            {isCurrentFamily ? "Hiện tại" : "Đã mở khóa"}
          </span>
        </div>

        <div className="relative mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            {isCurrentFamily ? currentRank.displayName : selectedFamily.name}
          </span>
          {achievedAt && <span>Đạt ngày {formatAchievedDate(achievedAt)}</span>}
        </div>
      </section>

      <UniformPortrait
        config={artConfig}
        family={selectedFamily}
        filledSegments={filledSegments}
        isCurrent={isCurrentFamily}
        selectedMedalIds={selectedMedalIds}
      />

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-xl border border-slate-700/70 bg-slate-900/65 p-2.5 text-slate-400">
          <span className="mb-1 flex items-center gap-1.5 font-bold text-slate-200">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> Huy Hiệu
          </span>
          Cầu vai và Huy Hiệu đồng bộ theo quân hàm đang xem.
        </div>
        <div className="rounded-xl border border-slate-700/70 bg-slate-900/65 p-2.5 text-slate-400">
          <span className="mb-1 flex items-center gap-1.5 font-bold text-slate-200">
            <Award className="h-3.5 w-3.5 text-amber-400" /> Huân Chương
          </span>
          {selectedMedalIds.length > 0
            ? `${selectedMedalIds.length} Huân Chương đang trưng bày.`
            : "Chưa chọn Huân Chương trưng bày."}
        </div>
      </div>

      <UniformRankSelector
        families={unlockedFamilies}
        selectedFamilyId={selectedFamily.id}
        currentFamilyId={currentFamily.id}
        onSelectFamily={handleSelectFamily}
      />
    </div>
  );
};
