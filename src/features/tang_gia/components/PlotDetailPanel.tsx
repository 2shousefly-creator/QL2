import React from "react";
import type { RankStep } from "../../../game/types";
import { CROP_CATALOG, FARM_PLOT_UNLOCKS, FERTILIZER_CATALOG } from "../farmCatalog";
import type { FarmPlotState, FarmSaveState, ItemQuality } from "../farmTypes";
import {
  getCropHarvestPreview,
  getPlotWateringInfo,
  getRankNameForDisplay,
  rankAtLeast,
} from "../farmEngine";
import type { CanonicalWeatherSlot } from "../weatherEngine";
import {
  getQualityProbabilities,
  QUALITY_CONFIG,
  WEATHER_METADATA,
} from "../weatherEngine";

interface PlotDetailPanelProps {
  farm: FarmSaveState;
  plot: FarmPlotState;
  plotIndex: number;
  currentRank: RankStep;
  currentWeatherSlot: CanonicalWeatherSlot;
  now: number;
}

const QUALITY_ORDER: ItemQuality[] = ["thuong", "tot", "hiem", "hoan_my"];

function formatCompactCountdown(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

const Chip: React.FC<{ children: React.ReactNode; tone?: string }> = ({
  children,
  tone = "border-slate-700 bg-slate-950/70 text-slate-300",
}) => (
  <span
    className={`rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold leading-none ${tone}`}
  >
    {children}
  </span>
);

export const PlotDetailPanel: React.FC<PlotDetailPanelProps> = ({
  farm,
  plot,
  plotIndex,
  currentRank,
  currentWeatherSlot,
  now,
}) => {
  const header = (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-300">
        Chi tiết ô đất #{plotIndex + 1}
      </span>
      <span className="text-[9px] font-bold text-slate-500">Cập nhật trực tiếp</span>
    </div>
  );

  if (plot.status === "empty") {
    return (
      <section className="mb-2 rounded-xl border border-amber-500/50 bg-slate-900/95 px-3 py-2 shadow-xl backdrop-blur-md">
        {header}
        <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
          <strong className="text-slate-100">Ô đất trống</strong>
          <span className="font-extrabold text-emerald-300">Chọn Trồng Cây bên dưới</span>
        </div>
      </section>
    );
  }

  if (plot.status === "locked") {
    const unlock = FARM_PLOT_UNLOCKS.find((entry) => entry.plotIndex === plotIndex);
    const hasRank = rankAtLeast(currentRank, unlock?.requiredRank ?? null);
    const hasGold = farm.gold >= (unlock?.gold || 0);
    return (
      <section className="mb-2 rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 shadow-xl backdrop-blur-md">
        {header}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <strong className="mr-auto text-[11px] text-slate-100">Ô đất đang khóa</strong>
          <Chip tone={hasRank ? "border-emerald-700 bg-emerald-950 text-emerald-300" : "border-rose-800 bg-rose-950 text-rose-300"}>
            Hạng: {getRankNameForDisplay(unlock?.requiredRank ?? null)}
          </Chip>
          <Chip tone={hasGold ? "border-emerald-700 bg-emerald-950 text-emerald-300" : "border-rose-800 bg-rose-950 text-rose-300"}>
            🪙 {(unlock?.gold || 0).toLocaleString("vi-VN")}
          </Chip>
          <Chip>{hasRank && hasGold ? "Đủ điều kiện" : "Chưa đủ điều kiện"}</Chip>
        </div>
      </section>
    );
  }

  const crop = CROP_CATALOG.find((entry) => entry.id === plot.cropId);
  const fertilizer = FERTILIZER_CATALOG.find(
    (entry) => entry.id === plot.fertilizerId
  );
  const watering = getPlotWateringInfo(plot, now);
  const weather = WEATHER_METADATA[currentWeatherSlot.weather];

  if (plot.status === "growing") {
    const totalMs = Math.max(1, plot.growthEndsAt - plot.plantedAt);
    const progress = Math.max(
      0,
      Math.min(1, (now - plot.plantedAt) / totalMs)
    );
    const waterStatus = watering.canWaterNow
      ? "Có thể tưới"
      : watering.stageStatuses.includes("upcoming")
        ? "Sắp tới"
        : watering.stageStatuses.includes("missed")
          ? "Đã bỏ lỡ"
          : "Đã đủ nước";
    const probabilities = getQualityProbabilities(
      plot.weatherExposure?.cool || 0
    );
    const wateringGoldBonus = watering.wateredCount * 2;
    const fertilizerXpBonus = Math.round((plot.fertilizerXpBonusPct || 0) * 100);
    const rainGoldBonus = Math.round((plot.rainGoldBonusPct || 0) * 1000) / 10;
    const weatherTimeReduction = Math.round(
      ((plot.weatherExposure?.sunny || 0) +
        (plot.weatherExposure?.calm || 0)) *
        20
    ) / 10;
    const fertilizerTimeReduction = Math.round(
      (plot.growthTimeReductionPct || 0) * 1000
    ) / 10;

    return (
      <section
        className="mb-2 space-y-1.5 rounded-xl border border-emerald-500/45 bg-slate-900/95 px-3 py-2 shadow-xl backdrop-blur-md"
        aria-live="polite"
      >
        {header}
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <strong className="truncate text-slate-100">{crop?.name || "Cây trồng"}</strong>
          <span className="shrink-0 font-mono font-black text-amber-300">
            {Math.round(progress * 100)}% · còn {formatCompactCountdown(plot.growthEndsAt - now)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          <Chip tone="border-sky-700 bg-sky-950 text-sky-300">
            💧 {watering.wateredCount}/3 · {waterStatus}
          </Chip>
          <Chip>{fertilizer ? `✨ ${fertilizer.name}` : "Không dùng phân"}</Chip>
          <Chip>{weather.icon} {weather.name}</Chip>
        </div>
        <div className="flex flex-wrap gap-1">
          {fertilizerXpBonus > 0 && <Chip>+{fertilizerXpBonus}% XP</Chip>}
          {(wateringGoldBonus > 0 || rainGoldBonus > 0) && (
            <Chip>+{wateringGoldBonus + rainGoldBonus}% Vàng</Chip>
          )}
          {(fertilizerTimeReduction > 0 || weatherTimeReduction > 0) && (
            <Chip>
              Giảm TG {fertilizerTimeReduction + weatherTimeReduction}%
            </Chip>
          )}
        </div>
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap text-[9px]">
          <span className="shrink-0 font-extrabold text-slate-400">Tỷ lệ phẩm chất:</span>
          {QUALITY_ORDER.map((quality) => (
            <Chip key={quality}>
              {QUALITY_CONFIG[quality].name} {Math.round(probabilities[quality] * 1000) / 10}%
            </Chip>
          ))}
        </div>
      </section>
    );
  }

  const preview = getCropHarvestPreview(farm, plotIndex, plot);
  return (
    <section className="mb-2 space-y-1.5 rounded-xl border border-amber-400/60 bg-slate-900/95 px-3 py-2 shadow-xl backdrop-blur-md">
      {header}
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <strong className="truncate text-slate-100">{crop?.name || "Cây trồng"}</strong>
        <span className="shrink-0 font-black text-amber-300">
          {preview ? QUALITY_CONFIG[preview.quality].name : "Thường"}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Chip tone="border-amber-700 bg-amber-950 text-amber-300">
          🪙 {preview?.goldEarned.toLocaleString("vi-VN") || 0}
        </Chip>
        <Chip tone="border-cyan-700 bg-cyan-950 text-cyan-300">
          ⚡ {preview?.xpEarned.toLocaleString("vi-VN") || 0} XP
        </Chip>
        <span className="ml-auto text-[9px] font-bold text-slate-500">
          Thu hoạch bằng nút bên dưới
        </span>
      </div>
      {preview && (
        <div className="flex flex-wrap gap-1">
          <Chip>Tưới +{preview.wateredBonusGold} Vàng / +{preview.wateredBonusXp} XP</Chip>
          <Chip>Phân +{preview.fertilizerBonusXp} XP</Chip>
          <Chip>Mưa +{preview.rainBonusGold} Vàng</Chip>
          <Chip>Phẩm chất ×{preview.qualityMultiplier}</Chip>
        </div>
      )}
    </section>
  );
};
