import { CoreScene } from "../../components/core-visual/CoreScene";
import "../../styles/core-records.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getPlayerFamily, getPlayerRank } from "../../game/selectors";
import { soundManager } from "../../game/audio";
import type { GameState } from "../../game/types";
import type { MedalDefinition } from "../../game/medals/medalCatalog";
import { MedalInspectModal } from "../../components/MedalInspectModal";
import { getUniformArtConfig } from "./uniform/uniformArtCatalog";
import { loadUniformSprites } from "./uniform/loadUniformSprites";
import { UniformPortrait } from "./uniform/UniformPortrait";
import { UniformRankSelector } from "./uniform/UniformRankSelector";
import {
  getUnlockedUniformFamilies,
  getUniformFamilyAchievedAt,
  getUniformFilledSegments,
} from "./uniform/uniformSelectors";
import { CommandHeader } from "../../components/military/MilitaryUI";

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
  const [previewStatus, setPreviewStatus] = useState("");
  const previewRequest = useRef(0);
  const neighborInFlight = useRef<Promise<void>>(Promise.resolve());
  const [inspectingMedal, setInspectingMedal] = useState<MedalDefinition | null>(null);

  useEffect(() => {
    previewRequest.current += 1;
    setSelectedFamilyId(currentFamily.id);
    setPreviewStatus("");
    return () => { previewRequest.current += 1; };
  }, [currentFamily.id]);

  useEffect(() => {
    let cancelled = false;
    let cancelIdle: (() => void) | undefined;
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const canPreload = () => !connection?.saveData && !["slow-2g", "2g"].includes(connection?.effectiveType ?? "");
    const index = unlockedFamilies.findIndex((family) => family.id === selectedFamilyId);
    const neighbors = [unlockedFamilies[index + 1], unlockedFamilies[index - 1]].filter(Boolean);
    const scheduleNext = () => {
      if (cancelled || previewStatus || !canPreload()) return;
      const family = neighbors.shift();
      if (!family) return;
      const warm = () => {
        neighborInFlight.current = neighborInFlight.current.then(async () => {
          if (!cancelled && canPreload()) await loadUniformSprites(family.id, "low");
        }).catch(() => undefined);
        void neighborInFlight.current.then(scheduleNext);
      };
      if ("requestIdleCallback" in window) {
        const id = window.requestIdleCallback(warm);
        cancelIdle = () => window.cancelIdleCallback(id);
      } else {
        const id = setTimeout(warm, 1500);
        cancelIdle = () => clearTimeout(id);
      }
    };
    // Visible family first; speculative requests are serialized and idle-only.
    void loadUniformSprites(selectedFamilyId, "high").then(scheduleNext).catch(() => undefined);
    return () => { cancelled = true; cancelIdle?.(); };
  }, [selectedFamilyId, unlockedFamilies, previewStatus]);

  const selectedFamily =
    unlockedFamilies.find((family) => family.id === selectedFamilyId) ?? currentFamily;
  const isCurrentFamily = selectedFamily.id === currentFamily.id;
  const artConfig = getUniformArtConfig(selectedFamily.id);
  const filledSegments = getUniformFilledSegments(selectedFamily, currentRank, isCurrentFamily);
  const achievedAt = getUniformFamilyAchievedAt(state, selectedFamily.id);
  const unlockedMedalIds = state.medals?.unlockedMedalIds ?? [];

  const handleSelectFamily = async (familyId: string) => {
    soundManager.playClick();
    const request = ++previewRequest.current;
    setPreviewStatus("Đang tải quân phục…");
    try {
      await loadUniformSprites(familyId);
      if (request !== previewRequest.current) return;
      setSelectedFamilyId(familyId);
      setPreviewStatus("");
    } catch {
      if (request === previewRequest.current) {
        setPreviewStatus("Chưa tải được quân phục. Vui lòng chọn lại để thử lại.");
      }
    }
  };

  return (
    <CoreScene variant="uniform" reducedMotion={state.settings.reducedMotion} className="command-screen uniform-archive-screen mx-auto w-full max-w-lg space-y-4 px-4 pb-10 pt-4 select-none">
      <CommandHeader
        title="Quân Phục"
        subtitle="Lễ phục theo quân hàm đã đạt"
        icon={<ShieldCheck />}
        action={onBack ? (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onBack();
            }}
            className="military-button military-button--icon theme-focus focus:outline-none"
            aria-label="Quay lại Hồ Sơ"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : undefined}
      />

      <section className="command-panel relative overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/95 p-4 shadow-xl">
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Đang xem</p>
            <h2 className="truncate text-xl font-black text-slate-100">{selectedFamily.name}</h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">Nghi thức: {artConfig.groupLabel}</p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
              isCurrentFamily
                ? "theme-badge"
                : "border-sky-400/50 bg-sky-500/15 text-sky-300"
            }`}
          >
            {isCurrentFamily ? "Hiện tại" : "Đã mở khóa"}
          </span>
        </div>

        <div className="relative mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="theme-icon-accent h-3.5 w-3.5" />
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
        unlockedMedalIds={unlockedMedalIds}
        onSelectMedal={setInspectingMedal}
      />

      <UniformRankSelector
        families={unlockedFamilies}
        selectedFamilyId={selectedFamily.id}
        currentFamilyId={currentFamily.id}
        onSelectFamily={handleSelectFamily}
      />

      <p role="status" className={previewStatus ? "text-center text-xs text-slate-400" : "sr-only"}>
        {previewStatus}
      </p>

      <MedalInspectModal medal={inspectingMedal} onClose={() => setInspectingMedal(null)} />
    </CoreScene>
  );
};
