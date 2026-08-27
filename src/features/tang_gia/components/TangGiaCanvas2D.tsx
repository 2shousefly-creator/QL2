import React from "react";
import {
  AnimalTypeId,
  CropId,
  FarmPlotState,
  PenAnimalState,
} from "../farmTypes";
import {
  ANIMAL_CATALOG,
  CROP_CATALOG,
  FARM_PLOT_UNLOCKS,
} from "../farmCatalog";
import {
  getAnimalCapacity,
  getRankBadgeDefinition,
  rankAtLeast,
  getPendingWateringCount,
  getPlotWateringInfo,
} from "../farmEngine";
import { CanonicalWeatherSlot } from "../weatherEngine";
import { RankStep } from "../../../game/types";
import { RankBadge } from "../../../components/RankBadge";
import { Lock, Sparkles, Droplets, Utensils, CheckCircle2, Coins, Zap, Plus, CloudRain, Sun, Wind, Moon } from "lucide-react";
import { LivestockPen2D } from "./LivestockPen2D";
import { RainOverlay } from "./RainOverlay";
import {
  CROP_NAME_FONT_SIZE_PX,
  CropVisualStage,
  HARVEST_CROP_QUALITY_COLORS,
  getCropVisualScale,
  getCropVisualStage,
  getFarmVisualTheme,
} from "../farmVisualTheme";
import type { PlotHarvestPresentation } from "../farmPresentation";
import {
  TANG_GIA_ASSETS,
  getCropAsset,
  getSoilAsset,
  type SoilAssetState,
} from "../tangGiaAssetManifest";

interface TangGiaCanvas2DProps {
  plots: FarmPlotState[];
  penAnimals: PenAnimalState[];
  eggCount: number;
  penFeedBuffValue: number;
  activeFeedSpeedBonus?: number;
  penStarvationStartedAt?: number | null;
  selectedPlotIndex: number | null;
  selectedAnimalId: string | null;
  contextMode: "none" | "garden" | "pen";
  gold?: number;
  currentRank?: RankStep;
  currentWeatherSlot?: CanonicalWeatherSlot;
  harvestPresentations?: readonly PlotHarvestPresentation[];
  onGardenTap: () => void;
  onPlotTap: (index: number) => void;
  onPenTap: () => void;
  onAnimalTap: (instanceId: string) => void;
  onOpenEggStorage: () => void;
  onOpenFeedModal?: () => void;
  isTroughInfoOpen?: boolean;
  onOpenTroughInfo?: () => void;
  onCloseTroughInfo?: () => void;
  now: number;
}

const CropGrowthVisual: React.FC<{
  stage: CropVisualStage;
  progress: number;
  cropId?: CropId | null;
  cropName?: string;
}> = ({ stage, progress, cropId = null, cropName }) => {
  const [failedAsset, setFailedAsset] = React.useState<string | null>(null);
  const asset =
    stage === "seed"
      ? TANG_GIA_ASSETS.sharedSeed
      : cropId
        ? getCropAsset(cropId, stage)
        : null;
  const label = stage === "seed"
    ? "Hạt giống"
    : `${cropName || "Cây trồng"} - ${
        stage === "sprout" ? "mầm cây" : stage === "young" ? "cây non" : "cây trưởng thành"
      }`;
  const visualScale = getCropVisualScale(progress);
  const fallback = stage === "seed" ? "🌰" : stage === "sprout" ? "🌱" : "🪴";

  return (
    <div
      role="img"
      aria-label={label}
      className="relative h-11 w-11 sm:h-12 sm:w-12 overflow-visible drop-shadow-md"
      data-crop-stage={stage}
    >
      {asset && failedAsset !== asset ? (
        <div
          data-crop-plant="true"
          data-crop-scale={visualScale.toFixed(3)}
          className="absolute inset-0 h-full w-full"
          style={{
            transform: `scale(${visualScale})`,
            transformOrigin: "50% 65%",
            transition: "transform 1000ms linear",
          }}
        >
          <img
            src={asset}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={`h-full w-full object-contain ${
              stage === "seed" ? "farm-seed-pulse" : "animate-crop-gentle"
            }`}
            onError={() => setFailedAsset(asset)}
          />
        </div>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-3xl" aria-hidden="true">
          {fallback}
        </span>
      )}
    </div>
  );
};

export const TangGiaCanvas2D: React.FC<TangGiaCanvas2DProps> = ({
  plots,
  penAnimals,
  eggCount,
  penFeedBuffValue,
  activeFeedSpeedBonus = 0,
  penStarvationStartedAt = null,
  selectedPlotIndex,
  selectedAnimalId,
  contextMode,
  gold = 0,
  currentRank,
  currentWeatherSlot,
  harvestPresentations = [],
  onGardenTap,
  onPlotTap,
  onPenTap,
  onAnimalTap,
  onOpenEggStorage,
  onOpenFeedModal,
  isTroughInfoOpen,
  onOpenTroughInfo,
  onCloseTroughInfo,
  now,
}) => {
  // Helper to format countdown timer
  const formatCountdown = (ms: number): string => {
    if (ms <= 0) return "0s";
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (hours > 0) {
      return `${hours}h:${mins.toString().padStart(2, "0")}m`;
    }
    if (mins > 0) {
      return `${mins}m:${secs.toString().padStart(2, "0")}s`;
    }
    return `${secs}s`;
  };

  // Grid row mapping for 3x3 plots:
  // Top row: Plots 7, 8, 9 (indices 6, 7, 8)
  // Mid row: Plots 4, 5, 6 (indices 3, 4, 5)
  // Bot row: Plots 1, 2, 3 (indices 0, 1, 2)
  const orderedPlotIndices = [6, 7, 8, 3, 4, 5, 0, 1, 2];

  const getAnimalEmoji = (animalId: AnimalTypeId) => {
    switch (animalId) {
      case "chicken":
        return "🐓";
      case "duck":
        return "🦆";
      case "quail":
        return "🐦";
      case "goose":
        return "🪿";
      case "muscovy_duck":
        return "🦆";
      case "turkey":
        return "🦃";
      case "guinea_fowl":
        return "🐥";
      case "pheasant":
        return "🕊️";
      case "peafowl":
        return "🦚";
      case "ostrich":
        return "🦤";
      default:
        return "🐥";
    }
  };

  const isNight = currentWeatherSlot?.phase === "night";
  const weatherType = currentWeatherSlot?.weather || "sunny";
  const visualTheme = getFarmVisualTheme(currentWeatherSlot);

  const getPlotBgStyle = (
    isUnlocked: boolean,
    isSelected: boolean,
    isReady: boolean,
  ): React.CSSProperties => {
    return {
      background: isUnlocked ? "transparent" : visualTheme.plotBackground,
      borderColor: isSelected
        ? "#fcd34d"
        : isReady
        ? "#34d399"
        : visualTheme.plotBorder,
    };
  };

  const getPlotBorderClass = (
    isUnlocked: boolean,
    isSelected: boolean,
    isReady: boolean
  ) => {
    if (!isUnlocked) {
      return "opacity-70 hover:opacity-85 saturate-75";
    }
    if (isSelected) {
      return "border-amber-300 ring-2 ring-amber-300/70 shadow-xl scale-[1.02]";
    }
    if (isReady) {
      return "border-emerald-400 ring-2 ring-emerald-400/50 shadow-xl shadow-emerald-500/25 animate-pulse";
    }
    return "hover:brightness-110";
  };

  return (
    <div
      className="w-full relative min-h-[500px] sm:min-h-[540px] rounded-3xl border-2 border-emerald-700/60 p-3 sm:p-4 overflow-hidden shadow-2xl flex flex-col justify-between select-none transition-colors duration-1000"
      style={{
        backgroundColor: "#74b96f",
        backgroundImage: `url(${TANG_GIA_ASSETS.background})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        borderColor: visualTheme.sceneBorder,
      }}
    >
      {/* --- SCENE BACKGROUND (FARM PATHS, FIELD ROWS, BARN & VEGETATION) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15)_0%,transparent_70%)]" />
      </div>
      {/* --- DAY/NIGHT AMBIENT OVERLAY --- */}
      {isNight ? (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-indigo-950/45 via-slate-950/35 to-slate-950/50 z-[1] transition-opacity duration-1000">
          {/* Subtle twinkling stars */}
          <div className="absolute top-2 left-6 text-amber-200/50 text-[8px] animate-pulse">✦</div>
          <div className="absolute top-8 right-14 text-amber-200/40 text-[10px] animate-pulse">✦</div>
          <div className="absolute top-4 right-1/3 text-sky-200/40 text-[6px] animate-pulse">✦</div>
        </div>
      ) : (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-amber-400/10 via-transparent to-transparent z-[1] transition-opacity duration-1000" />
      )}

      {/* --- WEATHER ATMOSPHERE OVERLAYS (BACKGROUND AMBIENT) --- */}
      {weatherType === "rain" && (
        <div
          className={`absolute inset-0 pointer-events-none z-[1] transition-opacity duration-1000 ${
            isNight ? "bg-slate-950/25" : "bg-sky-950/15"
          }`}
        />
      )}

      {weatherType === "sunny" && !isNight && (
        <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
          {/* Warm Sunbeam glow from top-right */}
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-gradient-to-br from-amber-300/20 via-yellow-400/10 to-transparent blur-2xl" />
        </div>
      )}

      {weatherType === "cool" && (
        <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
          {/* Cool breeze soft tint */}
          <div className="absolute inset-0 bg-teal-900/10" />
        </div>
      )}

      {/* --- MAIN SCENE CONTENT (GARDEN & PEN ON ONE SCREEN) --- */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-stretch gap-3 sm:gap-4 my-auto">
        {/* --- LEFT / MAIN SECTION: 3x3 GARDEN PLOTS --- */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onGardenTap();
          }}
          className={`flex-1 rounded-2xl p-2 sm:p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
            contextMode === "garden"
              ? "ring-2 ring-amber-400/70 bg-emerald-900/30 backdrop-blur-[2px] shadow-lg shadow-emerald-900/30"
              : "hover:bg-emerald-900/20"
          }`}
        >
          {/* Garden Header Wooden Sign */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onGardenTap();
            }}
            className="w-full flex items-center justify-between mb-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 border border-amber-600/70 shadow-md cursor-pointer hover:border-amber-400/80 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🪴</span>
              <span className="text-xs font-black text-amber-100 uppercase tracking-wide">
                Vườn Cây
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-200/90 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-700/60">
              Đất Phù Sa
            </span>
          </div>

          {/* 3x3 Soil Plot Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full my-auto">
            {orderedPlotIndices.map((plotIndex) => {
              const plot = plots[plotIndex] || { status: "locked" };
              const isUnlocked = plot.status !== "locked";
              const unlockConfig = FARM_PLOT_UNLOCKS.find(
                (u) => u.plotIndex === plotIndex
              );

              const cropId =
                plot.status === "growing" || plot.status === "ready"
                  ? plot.cropId
                  : null;

              const cropDef = cropId
                ? CROP_CATALOG.find((c) => c.id === cropId)
                : null;

              let remainingMs = 0;
              let progress = 0;
              let isReady = plot.status === "ready";

              if (plot.status === "growing" && cropDef) {
                remainingMs = Math.max(0, plot.growthEndsAt - now);
                const totalMs = Math.max(
                  1,
                  plot.plantedAt && plot.growthEndsAt > plot.plantedAt
                    ? plot.growthEndsAt - plot.plantedAt
                    : cropDef.growthMs
                );
                const elapsedMs = Math.max(0, totalMs - remainingMs);
                progress = Math.min(1.0, Math.max(0.0, elapsedMs / totalMs));
                if (remainingMs <= 0) {
                  isReady = true;
                  progress = 1.0;
                }
              } else if (plot.status === "ready") {
                progress = 1.0;
                isReady = true;
              }

              const isSelected =
                contextMode === "garden" && selectedPlotIndex === plotIndex;
              const wateringInfo = getPlotWateringInfo(plot, now);
              const cropStage = getCropVisualStage(progress);
              const soilState: SoilAssetState = plot.status === "empty"
                ? "empty"
                : plot.status === "growing" && wateringInfo.canWaterNow
                  ? "need_water"
                  : "planted";
              const harvestPresentation = harvestPresentations.find(
                (entry) => entry.plotIndex === plotIndex
              );

              return (
                <div
                  key={`plot-${plotIndex}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlotTap(plotIndex);
                  }}
                  className={`relative rounded-2xl p-1.5 sm:p-2 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-visible aspect-square border-2 shadow-md ${getPlotBorderClass(
                    isUnlocked,
                    isSelected,
                    isReady
                  )}`}
                  style={{
                    ...getPlotBgStyle(isUnlocked, isSelected, isReady),
                    zIndex: isSelected ? 30 : cropStage === "young" || cropStage === "mature" ? 10 : 1,
                  }}
                >
                  {isUnlocked && (
                    <img
                      src={getSoilAsset(soilState)}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      data-soil-state={soilState}
                      className="pointer-events-none absolute inset-0 h-full w-full object-contain transition-[filter] duration-500"
                    />
                  )}
                  {harvestPresentation &&
                    harvestPresentation.glowUntil > harvestPresentation.startedAt && (
                      <div
                        data-harvest-glow="true"
                        className="farm-harvest-glow pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <CropGrowthVisual
                          stage="mature"
                          progress={1}
                          cropId={harvestPresentation.cropId}
                        />
                      </div>
                    )}
                  {harvestPresentation && (
                    <div
                      key={harvestPresentation.id}
                      data-floating-harvest-reward="true"
                      data-quality={harvestPresentation.quality}
                      className="farm-floating-harvest-reward pointer-events-none absolute inset-x-0 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center text-[10px] font-black leading-tight drop-shadow-[0_2px_3px_rgba(2,6,23,0.95)]"
                      style={{
                        color:
                          HARVEST_CROP_QUALITY_COLORS[
                            harvestPresentation.quality
                          ],
                      }}
                      role="status"
                      aria-label={`Nhận ${harvestPresentation.goldAwarded} Vàng và ${harvestPresentation.xpAwarded} XP`}
                    >
                      <span>🪙 {harvestPresentation.goldAwarded.toLocaleString("vi-VN")}</span>
                      <span>⚡ {harvestPresentation.xpAwarded.toLocaleString("vi-VN")}</span>
                    </div>
                  )}
                  {/* Top Plot Badge / Countdown Timer */}
                  <div className="relative z-30 flex items-center justify-center w-full min-h-[16px] -mt-0.5 overflow-visible">
                    {isUnlocked && cropId && (
                      <div className="text-[10px] font-black drop-shadow flex items-center justify-center">
                        {!isReady && (
                          <span className="font-mono text-amber-300 font-black text-[9px] sm:text-[10px]">
                            {formatCountdown(remainingMs)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Center Content */}
                  {!isUnlocked ? (
                    (() => {
                      const reqRank = unlockConfig?.requiredRank || null;
                      const hasRank = currentRank ? rankAtLeast(currentRank, reqRank) : false;
                      const goldCost = unlockConfig?.gold || 0;
                      const hasGold = gold >= goldCost;
                      const requiredBadge = getRankBadgeDefinition(reqRank);

                      return (
                        <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center">
                          {/* Distinct, clean Lock Badge */}
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center mb-1 shadow-inner ${
                              hasRank && hasGold
                                ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 animate-pulse"
                                : "bg-slate-900/90 border border-slate-800 text-slate-400"
                            }`}
                          >
                            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          </div>

                          {/* Clean, compact unlock requirement */}
                          {!hasRank ? (
                            <div className="flex items-center justify-center gap-1">
                              {requiredBadge && (
                                <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                                  <RankBadge badge={requiredBadge} size={14} />
                                </div>
                              )}
                              <span className="text-[10px] font-extrabold text-slate-400">
                                🪙{goldCost}
                              </span>
                            </div>
                          ) : !hasGold ? (
                            <div className="flex items-center justify-center gap-0.5">
                              <span className="text-[10px] font-extrabold text-amber-400/80">
                                🪙{goldCost}
                              </span>
                            </div>
                          ) : (
                            <div className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center gap-0.5">
                              <span className="text-[10px] font-black text-emerald-300">
                                🪙{goldCost}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : plot.status === "empty" ? (
                    /* Empty Unlocked Plot: friendly centered "+" badge */
                    <div className="relative z-10 my-auto flex flex-col items-center justify-center gap-1 select-none pointer-events-none">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-950/50 border border-amber-500/30 flex items-center justify-center text-amber-300/80 shadow-inner">
                        <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-200/70 tracking-tight leading-none">
                        Trồng cây
                      </span>
                    </div>
                  ) : (
                    <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center w-full">
                      {/* Shared seed followed by crop-specific sprout, young and mature sprites. */}
                      <div className="relative flex items-center justify-center min-h-[40px] sm:min-h-[44px]">
                        <div className="relative inline-block">
                          <CropGrowthVisual
                            stage={cropStage}
                            progress={progress}
                            cropId={cropId}
                            cropName={cropDef?.name}
                          />

                          {/* Water drop icon indicator floating next to crop when watering is available */}
                          {plot.status === "growing" && wateringInfo.canWaterNow && (
                            <div className="absolute -top-1 -right-2 z-20 flex items-center justify-center bg-sky-500 text-white p-1 rounded-full shadow-lg border border-sky-200 animate-bounce">
                              <Droplets className="w-3.5 h-3.5 fill-current text-white" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Plant Name (when growing) */}
                      {!isReady && (
                        <span
                          data-crop-name="true"
                          className="relative z-10 max-w-full font-black leading-tight text-slate-100 mt-0.5 line-clamp-1"
                          style={{ fontSize: `${CROP_NAME_FONT_SIZE_PX}px` }}
                        >
                          {cropDef?.name || "Cây"}
                        </span>
                      )}

                      {/* Tag Boost / Fertilizer / 3-Stage Water Indicators (when growing) */}
                      {!isReady && (
                        <div className="relative z-10 mt-0.5 flex items-center justify-center gap-1 whitespace-nowrap overflow-hidden min-h-[16px]">
                          {/* 3-Stage Watering Indicators */}
                          <div
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-950/90 border border-slate-700/80 shadow-sm shrink-0"
                            title={`Tưới nước: ${wateringInfo.wateredCount}/3 mốc (${wateringInfo.stageStatuses
                              .map(
                                (s, idx) =>
                                  `Mốc ${idx + 1}: ${
                                    s === "watered"
                                      ? "Đã tưới (+2%)"
                                      : s === "ready"
                                      ? "Đang mở"
                                      : s === "missed"
                                      ? "Bỏ lỡ"
                                      : "Sắp tới"
                                  }`
                              )
                              .join(", ")})`}
                          >
                            <Droplets className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                            <div className="flex items-center gap-0.5">
                              {wateringInfo.stageStatuses.map((st, idx) => (
                                <span
                                  key={idx}
                                  className={`w-1.5 h-1.5 rounded-full inline-block ${
                                    st === "watered"
                                      ? "bg-sky-400 shadow-sm shadow-sky-400"
                                      : st === "ready"
                                      ? "bg-amber-400 animate-pulse ring-1 ring-amber-300"
                                      : st === "missed"
                                      ? "bg-rose-500/60"
                                      : "bg-slate-600"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {plot.fertilizerId && (
                            <span
                              className="text-[9px] font-black px-1 py-0.5 rounded-md bg-amber-950/90 text-amber-300 border border-amber-700/80 flex items-center gap-0.5 shadow-sm shrink-0"
                              title="Đã bón phân"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            </span>
                          )}
                        </div>
                      )}

                      {/* Crop name inherits the harvested quality color above the CTA. */}
                      {isReady && (
                        <div className="relative z-10 mt-0.5 flex flex-col items-center justify-center w-full gap-0.5">
                          <div
                            data-crop-name="true"
                            data-harvest-crop-name="true"
                            data-quality={plot.rolledQuality || "thuong"}
                            className="max-w-full truncate font-black leading-tight drop-shadow-md"
                            style={{
                              fontSize: `${CROP_NAME_FONT_SIZE_PX}px`,
                              color:
                                HARVEST_CROP_QUALITY_COLORS[
                                  plot.rolledQuality || "thuong"
                                ],
                            }}
                          >
                            {cropDef?.name || "Cây trồng"}
                          </div>
                          <div className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 font-black text-[9px] sm:text-[10px] shadow-md border border-amber-200 flex items-center justify-center gap-1 active:scale-95 transition-transform animate-pulse w-full max-w-[84px]">
                            <Sparkles className="w-2.5 h-2.5 text-slate-950 fill-current shrink-0" />
                            <span className="leading-none whitespace-nowrap">Thu hoạch</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- RIGHT SECTION: LIVESTOCK PEN --- */}
        <LivestockPen2D
          penAnimals={penAnimals}
          eggCount={eggCount}
          penFeedBuffValue={penFeedBuffValue}
          activeFeedSpeedBonus={activeFeedSpeedBonus}
          penStarvationStartedAt={penStarvationStartedAt}
          selectedAnimalId={selectedAnimalId}
          contextMode={contextMode}
          maxCapacity={currentRank ? getAnimalCapacity(currentRank) : 2}
          onPenTap={onPenTap}
          onAnimalTap={onAnimalTap}
          onOpenEggStorage={onOpenEggStorage}
          onOpenFeedModal={onOpenFeedModal}
          isTroughInfoOpen={isTroughInfoOpen}
          onOpenTroughInfo={onOpenTroughInfo}
          onCloseTroughInfo={onCloseTroughInfo}
          currentWeatherSlot={currentWeatherSlot}
          now={now}
        />
      </div>

      {/* --- FOREGROUND RAIN OVERLAY (Falls over garden plots & livestock pen + splashes) --- */}
      {weatherType === "rain" && <RainOverlay isNight={isNight} />}
    </div>
  );
};

// Also export as TangGiaCanvas3D for seamless backward compatibility
export const TangGiaCanvas3D = TangGiaCanvas2D;
