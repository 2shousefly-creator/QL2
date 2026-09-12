import { useDeferredPixiLayer } from "../../../components/core-visual/pixi/useDeferredPixiLayer";
import { getJourneyChapterForRank } from "../../../game/etaEngine";
import { getStageTheme } from "../../../game/stageThemes";
import { getAnimalVisualScale, isAnimalDead } from "../animalLifecycle";
import type { FarmVisualEvent, FarmPlotVisual, FarmAnimalVisual } from "../pixi/farmPixiTypes";
import { CoreVfx } from "../../../components/core-visual/CoreVfx";
import "../../../styles/core-farm.css";
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
  getCropGrowthProgress,
  getCurrentCropRemainingDurationMs,
  hasCropFertilizer,
  getRankBadgeDefinition,
  rankAtLeast,
} from "../farmEngine";
import { CanonicalWeatherSlot } from "../weatherEngine";
import { RankStep } from "../../../game/types";
import { RankBadge } from "../../../components/RankBadge";
import { Lock, Sparkles } from "lucide-react";
import { LivestockPen2D } from "./LivestockPen2D";
import { RainOverlay } from "./RainOverlay";
import {
  CROP_NAME_FONT_SIZE_PX,
  CropVisualStage,
  HARVEST_CROP_QUALITY_COLORS,
  getCropVisualMetrics,
  getCropVisualScale,
  getCropVisualStage,
  getFarmVisualTheme,
} from "../farmVisualTheme";
import type { PlotHarvestPresentation } from "../farmPresentation";
import {
  getSoilMoistureBand,
  getSoilMoisturePresentation,
} from "../soilMoistureEngine";
import {
  getFarmBackgroundAsset,
  getCropAsset,
  getSoilAsset,
  type SoilAssetState,
} from "../tangGiaAssetManifest";
import { getPestPresentation } from "../pestEngine";

const loadFarmPixi = () => import("../pixi/FarmPixiLayer");

interface TangGiaCanvas2DProps {
  visualEvents?: readonly FarmVisualEvent[];
  reducedMotion?: boolean;
  plots: FarmPlotState[];
  penAnimals: PenAnimalState[];
  eggCount: number;
  penFeedBuffValue: number;
  penFeedEmptyAt?: number | null;
  activeFeedSpeedBonus?: number;
  penStarvationStartedAt?: number | null;
  selectedPlotIndex: number | null;
  selectedAnimalId: string | null;
  contextMode: "none" | "garden" | "pen";
  gold?: number;
  currentRank?: RankStep;
  currentWeatherSlot?: CanonicalWeatherSlot;
  weatherSeed?: number;
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
  const asset = cropId ? getCropAsset(cropId, stage) : null;
  const label = stage === "seed"
    ? `Hạt giống ${cropName || "cây trồng"}`
    : `${cropName || "Cây trồng"} - ${
        stage === "sprout" ? "mầm cây" : stage === "young" ? "cây non" : "cây trưởng thành"
      }`;
  const visualScale = getCropVisualScale(progress);
  const visualMetrics = getCropVisualMetrics(stage);
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
            transformOrigin: `${visualMetrics.rootAnchorXPercent}% ${visualMetrics.rootAnchorYPercent}%`,
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

const SoilMoistureBlock: React.FC<{ moisture: number }> = ({ moisture }) => {
  const value = Math.max(0, Math.min(100, moisture));
  const presentation = getSoilMoisturePresentation(value);
  return (
    <div className="pointer-events-none flex w-full flex-col items-center gap-px">
      <div
        className="relative mx-auto h-[7px] w-[32px] sm:w-[38px]"
        data-moisture-anchor="bar"
      >
        <span className="absolute right-full mr-0.5 top-1/2 -translate-y-1/2 text-[7px]">💧</span>
        <div className="h-full w-full overflow-hidden rounded-full border border-slate-300/50 bg-slate-950/80 shadow-inner">
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ${presentation.barClass}`}
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="absolute left-full ml-0.5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[6px] font-black text-slate-100">
          {Math.round(value)}%
        </span>
      </div>
      <span className={`whitespace-nowrap text-[5px] sm:text-[6px] font-black leading-tight ${presentation.textClass}`}>
        {presentation.icon} {presentation.label}
      </span>
    </div>
  );
};

export const TangGiaCanvas2D: React.FC<TangGiaCanvas2DProps> = ({
  visualEvents = [],
  reducedMotion = false,
  plots,
  penAnimals,
  eggCount,
  penFeedBuffValue,
  penFeedEmptyAt = null,
  activeFeedSpeedBonus = 0,
  penStarvationStartedAt = null,
  selectedPlotIndex,
  selectedAnimalId,
  contextMode,
  gold = 0,
  currentRank,
  currentWeatherSlot,
  weatherSeed = 133742,
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
  const pixi = useDeferredPixiLayer(loadFarmPixi, reducedMotion);
  const [worldLoaded, setWorldLoaded] = React.useState(false);
  const worldReady = pixi.ready && worldLoaded;
  const [visualQuality, setVisualQuality] = React.useState<"low" | "medium" | "high">("high");
  const worldPlots = plots.flatMap<FarmPlotVisual>((plot, index) => {
    if (index > 2 || plot.status === "locked") return [];
    const cropId = plot.status === "growing" || plot.status === "ready" ? plot.cropId : null;
    if (cropId && cropId !== "carrot" && cropId !== "tomato") return [];
    return [{ index, cropId, stage: getCropVisualStage(plot.status === "ready" ? 1 : plot.status === "growing" ? getCropGrowthProgress(plot) : 0), moisture: plot.soilMoisture, ready: plot.status === "ready", pest: !!getPestPresentation(plot, now), fertilizer: hasCropFertilizer(plot) }];
  });
  const worldAnimals = penAnimals.flatMap<FarmAnimalVisual>(animal => {
    const species = animal.animalTypeId;
    if (species !== "chicken" && species !== "duck") return [];
    const definition = ANIMAL_CATALOG.find(entry => entry.id === species)!;
    return [{ id: animal.instanceId, species, dead: isAnimalDead(animal), scale: getAnimalVisualScale(animal, definition, now), eggReady: !isAnimalDead(animal) && animal.nextEggAt <= now, cycle: animal.cycleStartedAt ?? animal.addedAt }];
  });
  // Helper to format countdown timer
  const formatCountdown = (ms: number | null | undefined): string => {
    if (ms === null || ms === undefined || !Number.isFinite(ms)) {
      return "Đang tính...";
    }
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
  const sceneBackgroundAsset = getFarmBackgroundAsset(currentWeatherSlot);

  const getPlotBgStyle = (
    _isUnlocked: boolean,
    isSelected: boolean,
    isReady: boolean,
  ): React.CSSProperties => {
    return {
      background: "transparent",
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
      data-core-motion={pixi.reducedMotion ? "reduced" : undefined}
      data-pixi-ready={worldReady}
      data-weather={weatherType} data-night={isNight}
      className="core-farm-scene w-full relative min-h-[500px] sm:min-h-[540px] rounded-3xl border-2 border-emerald-700/60 p-3 sm:p-4 overflow-hidden shadow-2xl flex flex-col justify-between select-none transition-colors duration-1000"
      style={{
        backgroundColor: "#74b96f",
        backgroundImage: `url(${sceneBackgroundAsset})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        borderColor: visualTheme.sceneBorder,
      }}
    >
      <div className="core-farm-pixi" aria-hidden="true">
        {pixi.Layer && <pixi.Layer visualProps={{
          theme: getStageTheme(getJourneyChapterForRank(currentRank?.rankIndex ?? 0).themeId),
          plots: worldPlots, animals: worldAnimals, feed: penFeedBuffValue, starving: penStarvationStartedAt != null && penFeedBuffValue <= 0, eggCount, quality: visualQuality,
          selectedAnimalId, contextMode, onPlotTap, onPenTap, onAnimalTap, onEggTap: onOpenEggStorage,
          weather: weatherType, phase: isNight ? "night" : "day", weatherSeed, selectedPlotIndex,
          readyPlotIndices: plots.flatMap((plot, index) => plot.status === "ready" ? [index] : []),
          pestPlotIndices: plots.flatMap((plot, index) => getPestPresentation(plot, now) ? [index] : []),
          events: [...harvestPresentations.map(entry => ({ id: entry.id, plotIndex: entry.plotIndex, startedAt: entry.startedAt, cropId: entry.cropId, kind: "harvest" as const })), ...visualEvents].filter(event => event.kind === "egg" || worldPlots.some(p => p.index === event.plotIndex)).slice(-18),
        }} reducedMotion={pixi.reducedMotion} onWorldLoading={() => setWorldLoaded(false)} onReady={() => { setWorldLoaded(true); pixi.onReady(); }} onUnavailable={pixi.onUnavailable} />}
      </div>
      {!worldReady && <>
      <div className="core-farm-atmosphere" aria-hidden="true">
        <CoreVfx type="haze" themeAware={false} reducedMotion={reducedMotion} />
        {(isNight || weatherType === "sunny") && <CoreVfx type="dust" themeAware={false} reducedMotion={reducedMotion} />}
      </div>
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

      </>}
      <label className="relative z-10 mb-2 ml-auto flex items-center gap-2 rounded-lg bg-slate-950/65 px-2 py-1 text-[10px] text-amber-100">
        Chi tiết cảnh
        <select aria-label="Mức chi tiết cảnh nông trại" value={visualQuality} onChange={e => setVisualQuality(e.target.value as typeof visualQuality)} className="rounded bg-slate-900 px-1 py-0.5 text-amber-100">
          <option value="high">Cao</option><option value="medium">Vừa</option><option value="low">Thấp</option>
        </select>
      </label>
      {/* --- MAIN SCENE CONTENT (GARDEN & PEN ON ONE SCREEN) --- */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-stretch gap-3 sm:gap-4 my-auto">
        {/* --- LEFT / MAIN SECTION: 3x3 GARDEN PLOTS --- */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onGardenTap();
          }}
          data-world-section={worldReady || undefined}
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

              let remainingMs: number | null = 0;
              let progress = 0;
              let isReady = plot.status === "ready";

              if (plot.status === "growing" && cropDef) {
                remainingMs = getCurrentCropRemainingDurationMs(
                  plot,
                  now,
                  weatherSeed
                );
                progress = getCropGrowthProgress(plot);
              } else if (plot.status === "ready") {
                progress = 1.0;
                isReady = true;
              }

              const isSelected =
                contextMode === "garden" && selectedPlotIndex === plotIndex;
              const cropStage = getCropVisualStage(progress);
              const cropVisualMetrics = getCropVisualMetrics(cropStage);
              const cropVisualScale = getCropVisualScale(progress);
              const soilState: SoilAssetState = !isUnlocked || plot.status === "empty"
                ? "empty"
                : plot.soilMoisture < 20
                  ? "need_water"
                  : "planted";
              const harvestPresentation = harvestPresentations.find(
                (entry) => entry.plotIndex === plotIndex
              );
              const pestPresentation = getPestPresentation(plot, now);

              return (
                <div
                  key={`plot-${plotIndex}`}
                  data-farm-plot={plotIndex + 1}
                  data-farm-plot-index={plotIndex}
                  data-world-plot={worldReady && worldPlots.some(p => p.index === plotIndex) || undefined}
                  role="button" tabIndex={0}
                  aria-label={`Ô đất ${plotIndex + 1}: ${cropDef?.name || (isUnlocked ? "Đất trống" : "Chưa mở khóa")}${isReady ? ", có thể thu hoạch" : ""}`}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onPlotTap(plotIndex); } }}
                  data-crop-ready={isReady}
                  data-selected={isSelected ? "true" : undefined}
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
                  {!(worldReady && worldPlots.some(p => p.index === plotIndex)) && <img
                    src={getSoilAsset(soilState)}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    data-soil-state={soilState}
                    data-locked-soil={!isUnlocked || undefined}
                    className={`pointer-events-none absolute inset-0 h-full w-full object-contain transition-[filter] duration-500 ${
                      isUnlocked ? "" : "brightness-75 saturate-75"
                    }`}
                  />}
                  {!(worldReady && worldPlots.some(p => p.index === plotIndex)) && harvestPresentation && <CoreVfx key={harvestPresentation.id} type="spark" themeAware={false} reducedMotion={reducedMotion} />}
                  {!(worldReady && worldPlots.some(p => p.index === plotIndex)) && harvestPresentation &&
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
                    <div className="relative z-10 my-auto flex w-full items-center justify-center">
                      <SoilMoistureBlock moisture={plot.soilMoisture} />
                    </div>
                  ) : (
                    <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center w-full">
                      <div className="relative flex min-h-[40px] items-center justify-center overflow-visible sm:min-h-[44px]">
                        <div className="relative inline-block">
                          {plot.status === "growing" && (
                            <span
                              className={`absolute left-1/2 z-30 -translate-x-1/2 translate-y-0 whitespace-nowrap rounded-md bg-slate-950/85 px-1 py-0.5 text-[8px] font-black leading-none shadow-md ${
                                getSoilMoistureBand(plot.soilMoisture) === "barren"
                                  ? "text-red-300"
                                  : "font-mono text-amber-300"
                              }`}
                              style={{
                                bottom: `${cropVisualMetrics.countdownLiftPx * cropVisualScale}px`,
                              }}
                              data-growth-countdown="crop-anchored"
                              data-crop-countdown-anchor="crop-top"
                            >
                              {getSoilMoistureBand(plot.soilMoisture) === "barren"
                                ? "Ngừng sinh trưởng"
                                : formatCountdown(remainingMs)}
                            </span>
                          )}
                          {worldReady && worldPlots.some(p => p.index === plotIndex) ? <div className="h-11 w-11 sm:h-12 sm:w-12" aria-hidden="true" /> : <CropGrowthVisual
                            stage={cropStage}
                            progress={progress}
                            cropId={cropId}
                            cropName={cropDef?.name}
                          />}
                        </div>
                      </div>

                      <div className="relative z-10 mt-0.5 w-full text-center">
                        <span
                          data-crop-name="true"
                          data-quality={isReady ? plot.rolledQuality || "thuong" : undefined}
                          className="relative inline-block max-w-full truncate font-black leading-tight drop-shadow-md"
                          style={{
                            fontSize: `${CROP_NAME_FONT_SIZE_PX}px`,
                            color: isReady
                              ? HARVEST_CROP_QUALITY_COLORS[plot.rolledQuality || "thuong"]
                              : "#f1f5f9",
                          }}
                        >
                          {hasCropFertilizer(plot) && (
                            <span
                              className="absolute right-full mr-1 text-amber-300"
                              title="Đã bón phân"
                              aria-label="Đã bón phân"
                            >
                              ✨
                            </span>
                          )}
                          {cropDef?.name || "Cây trồng"}
                        </span>
                      </div>

                      <div className="relative z-10 mt-0.5 w-full">
                        <SoilMoistureBlock moisture={plot.soilMoisture} />
                      </div>

                      {pestPresentation && (
                        <div
                          className={`relative z-10 mt-px w-full whitespace-nowrap text-center text-[6px] font-black leading-tight sm:text-[7px] ${
                            pestPresentation.status === "warning"
                              ? "text-amber-200"
                              : pestPresentation.status === "outbreak"
                                ? "text-lime-200"
                                : pestPresentation.status === "damaging"
                                  ? "text-orange-300"
                                  : "text-red-300"
                          }`}
                          data-pest-status={pestPresentation.status}
                        >
                          {pestPresentation.label}
                        </div>
                      )}

                      {isReady && (
                        <div
                          className={`relative z-10 mt-0.5 flex w-full max-w-[84px] items-center justify-center gap-1 rounded-lg border px-2 py-0.5 text-[9px] font-black shadow-md sm:text-[10px] ${
                            plot.qualityPenalty === "common_only"
                              ? "border-red-300 bg-gradient-to-r from-red-600 to-rose-600 text-white"
                              : "border-amber-200 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950"
                          }`}
                        >
                            <Sparkles className="w-2.5 h-2.5 text-slate-950 fill-current shrink-0" />
                            <span className="leading-none whitespace-nowrap">Thu hoạch</span>
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
          pixiWorld={worldReady}
          penAnimals={penAnimals}
          eggCount={eggCount}
          penFeedBuffValue={penFeedBuffValue}
          penFeedEmptyAt={penFeedEmptyAt}
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
      {!worldReady && weatherType === "rain" && <RainOverlay isNight={isNight} reducedMotion={reducedMotion} />}
    </div>
  );
};

// Also export as TangGiaCanvas3D for seamless backward compatibility
export const TangGiaCanvas3D = TangGiaCanvas2D;
