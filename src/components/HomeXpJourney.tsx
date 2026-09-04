import React from "react";
import { Crown, Zap } from "lucide-react";
import { GameState, RankStep } from "../game/types";
import { RANK_FAMILIES } from "../game/rankFamilies";
import {
  getCurrentRank,
  getNextRank,
  getRequiredXpTicksForTransition,
  getFinalJourneyXpTargetTicks,
  isXpBarFull,
} from "../game/xpEngine";
import { ensureEnergyState, getEnergyMultiplier, isEnergyActive } from "../game/energyEngine";
import { RankBadge } from "./RankBadge";
import { RankTierProgress } from "./RankTierProgress";

type HomeXpJourneyProps = {
  state: GameState;
  reducedMotion?: boolean;
  hasEnergyBoost?: boolean;
  onOpenRankDetail?: (rankIndex: number) => void;
  className?: string;
};

export const HomeXpJourney: React.FC<HomeXpJourneyProps> = ({
  state,
  reducedMotion = false,
  hasEnergyBoost: hasEnergyBoostProp,
  onOpenRankDetail,
  className = "",
}) => {
  const currentRankIndex = state.progression.currentRankIndex;
  const currentRank: RankStep = getCurrentRank(currentRankIndex);
  const nextRank: RankStep | null = getNextRank(currentRankIndex);

  const currentFamily = RANK_FAMILIES.find((f) => f.id === currentRank.familyId) || RANK_FAMILIES[0];
  const nextFamily = nextRank ? RANK_FAMILIES.find((f) => f.id === nextRank.familyId) || RANK_FAMILIES[0] : null;

  const isMaxRank = !nextRank || currentRankIndex >= 215;
  const finalJourneyTargetTicks = getFinalJourneyXpTargetTicks();
  const totalEarnedTicks = state.progression.totalXpEarnedTicks;
  const xpTicksPerXp = 600_000;

  const isJourneyCompleted = isMaxRank && totalEarnedTicks >= finalJourneyTargetTicks;

  const reqTicks = isMaxRank
    ? finalJourneyTargetTicks
    : getRequiredXpTicksForTransition(currentRankIndex);
  const currentTicks = state.progression.xpIntoCurrentRankTicks;

  const isFull = isMaxRank
    ? isJourneyCompleted
    : isXpBarFull(state) || (reqTicks > 0 && currentTicks >= reqTicks);

  const energyState = ensureEnergyState(state);
  const isOnline = state.time.currentEarningMode === "direct_online";
  const active = isEnergyActive(state, state.time.currentEarningMode);
  const currentMult = isOnline ? getEnergyMultiplier(energyState.percent, active) : 1;
  const hasEnergyBoost = hasEnergyBoostProp !== undefined ? hasEnergyBoostProp : currentMult > 1;

  const remainingTicks = isMaxRank
    ? Math.max(0, finalJourneyTargetTicks - totalEarnedTicks)
    : Math.max(0, reqTicks - currentTicks);
  const nextThresholdTicks = isMaxRank
    ? finalJourneyTargetTicks
    : totalEarnedTicks + remainingTicks;

  const displayCurrentXp = Math.max(0, Math.round(totalEarnedTicks / xpTicksPerXp)).toLocaleString("vi-VN");
  const displayTargetXp = Math.max(0, Math.round(nextThresholdTicks / xpTicksPerXp)).toLocaleString("vi-VN");

  const targetPercentage = isMaxRank
    ? Math.min(100, Math.max(0, (totalEarnedTicks / finalJourneyTargetTicks) * 100))
    : reqTicks > 0
    ? Math.min(100, Math.max(0, (currentTicks / reqTicks) * 100))
    : 100;

  return (
    <div className={`w-full relative select-none ${className}`}>
      {/* Centered % Progress Label above the Bar (No "Kinh nghiệm (XP)" text) */}
      <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold mb-1 text-center">
        <span className={isFull ? "text-amber-300 font-extrabold" : "theme-text-accent font-extrabold"}>
          {isJourneyCompleted ? "MAX" : `${targetPercentage.toFixed(1)}%`}
        </span>
      </div>

      {/* 3-Region Layout on a Single Row - Perfectly Centered */}
      <div className="relative z-10 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3 w-full max-w-full overflow-hidden">
        
        {/* ==================== 1. LEFT ENDPOINT (CURRENT RANK) ==================== */}
        <div className="flex flex-col items-center justify-center text-center w-[50px] sm:w-[58px] shrink-0">
          <button
            type="button"
            onClick={() => onOpenRankDetail?.(currentRank.rankIndex)}
            className="theme-focus flex flex-col items-center justify-center rounded-full focus:outline-none cursor-pointer"
            title={`Xem chi tiết cấp ${currentRank.displayName}`}
          >
            <RankBadge
              badge={currentFamily.badge}
              size={50}
              isCurrent={true}
              className="theme-rank-glow"
            />
          </button>

          {/* Segmented Tier Bar ONLY - Placed sát under badge */}
          {currentFamily.tierCount > 1 && (
            <div className="-mt-0.5">
              <RankTierProgress
                currentTier={currentRank.tier || 1}
                tierCount={currentFamily.tierCount}
                badgeSize={50}
                size="list"
                className="!my-0"
              />
            </div>
          )}
        </div>

        {/* ==================== 2. CENTER (MAIN XP JOURNEY BAR) ==================== */}
        <div className="flex items-center justify-center w-full min-w-0">
          {/* XP Track Container - Increased thickness by 25% (h-[45px] sm:h-[52px]) */}
          <div
            className={`home-xp-command-track relative w-full h-[45px] sm:h-[52px] rounded-none bg-slate-950 border ${
              isFull
                ? "border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(250,204,21,0.5)]"
                : hasEnergyBoost
                ? "border-amber-300 ring-2 ring-amber-400/70 shadow-[0_0_25px_rgba(251,191,36,0.7)]"
                : "theme-progress-track"
            } p-1 overflow-hidden transition-all duration-300 shadow-inner flex items-center`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(targetPercentage)}
            aria-label={`Tiến độ XP từ ${currentRank.displayName} đến ${nextRank?.displayName || "Tối Cao"}: ${displayCurrentXp} XP trên ${displayTargetXp} XP`}
          >
            {/* Background Connector Line */}
            <div
              className={`absolute inset-0 pointer-events-none z-0 ${
                hasEnergyBoost
                  ? "bg-gradient-to-r from-amber-500/15 via-yellow-400/20 to-amber-500/15 animate-pulse"
                  : "theme-bg-soft"
              }`}
            />

            {/* Energy Boost Icon inside XP Bar on Left */}
            {hasEnergyBoost && (
              <div className="absolute left-2 sm:left-2.5 z-30 flex items-center justify-center pointer-events-none">
                <div className="p-1 rounded-full bg-amber-400/20 border border-amber-300/80 shadow-[0_0_12px_rgba(251,191,36,0.85)] bg-slate-950/80 backdrop-blur-xs animate-pulse">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                </div>
              </div>
            )}

            {/* Fill Bar */}
            <div
              className={`h-full rounded-none relative overflow-hidden z-10 transition-[width] duration-1000 linear ${
                isFull
                  ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                  : hasEnergyBoost
                  ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 shadow-[0_0_22px_rgba(251,191,36,0.9)] brightness-110"
                  : "theme-progress-fill"
              }`}
              style={{ width: `${targetPercentage}%` }}
            >
              {/* Shimmer / Energy flow overlay */}
              {!reducedMotion && !isFull && (
                <div
                  className={`absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] ${
                    hasEnergyBoost ? "animate-[shimmer_1.5s_infinite_linear]" : "animate-[shimmer_2.5s_infinite_linear]"
                  }`}
                />
              )}
            </div>

            {/* Overlay Text inside Bar */}
            <div className="absolute inset-0 z-30 flex items-center justify-center font-black text-xs sm:text-sm tracking-wide text-slate-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] pointer-events-none px-1">
              {isMaxRank ? (
                isJourneyCompleted ? (
                  <span className="text-amber-200 font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>Đã Hoàn Tất Hành Trình</span>
                  </span>
                ) : (
                  <span>
                    {displayCurrentXp} / {displayTargetXp} XP
                  </span>
                )
              ) : isFull ? (
                <span className="text-slate-950 font-black uppercase tracking-wider bg-amber-300 px-2.5 py-0.5 rounded text-xs shadow">
                  Sẵn Sàng Thăng Cấp
                </span>
              ) : (
                <span>
                  {displayCurrentXp} / {displayTargetXp} XP
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ==================== 3. RIGHT ENDPOINT (NEXT RANK) ==================== */}
        <div className="flex flex-col items-center justify-center text-center w-[50px] sm:w-[58px] shrink-0">
          {nextRank && nextFamily ? (
            <>
              <button
                type="button"
                onClick={() => onOpenRankDetail?.(nextRank.rankIndex)}
                className="theme-focus flex flex-col items-center justify-center rounded-full focus:outline-none cursor-pointer"
                title={`Xem chi tiết cấp kế tiếp ${nextRank.displayName}`}
              >
                <RankBadge
                  badge={nextFamily.badge}
                  size={50}
                  isLocked={false}
                  className="theme-rank-glow"
                />
              </button>

              {/* Segmented Tier Bar ONLY - Placed sát under badge */}
              {nextFamily.tierCount > 1 && (
                <div className="-mt-0.5">
                  <RankTierProgress
                    currentTier={nextRank.tier || 1}
                    tierCount={nextFamily.tierCount}
                    badgeSize={50}
                    size="list"
                    className="!my-0"
                  />
                </div>
              )}
            </>
          ) : (
            /* Terminal Marker when at MAX Rank (Tổng Tư Lệnh) */
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-[48px] h-[48px] rounded-full bg-slate-900 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-md">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
