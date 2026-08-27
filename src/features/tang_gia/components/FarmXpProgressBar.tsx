import React from "react";
import type { GameState } from "../../../game/types";
import {
  getFinalJourneyXpTargetTicks,
  getNextRank,
  getRequiredXpTicksForTransition,
  isXpBarFull,
} from "../../../game/xpEngine";

interface FarmXpProgressBarProps {
  gameState: GameState;
}

export function getFarmPlayerXpPercentage(gameState: GameState): number {
  const rankIndex = gameState.progression.currentRankIndex;
  const isMaxRank = getNextRank(rankIndex) === null;
  const requiredTicks = isMaxRank
    ? getFinalJourneyXpTargetTicks()
    : getRequiredXpTicksForTransition(rankIndex);
  const currentTicks = isMaxRank
    ? gameState.progression.totalXpEarnedTicks
    : gameState.progression.xpIntoCurrentRankTicks;
  if (requiredTicks <= 0) return 100;
  return Math.min(100, Math.max(0, (currentTicks / requiredTicks) * 100));
}

export function formatFarmXpPercentage(percentage: number): string {
  const safePercentage = Math.min(
    100,
    Math.max(0, Number.isFinite(percentage) ? percentage : 0)
  );
  return safePercentage.toLocaleString("vi-VN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export const FarmXpProgressBar: React.FC<FarmXpProgressBarProps> = ({
  gameState,
}) => {
  const percentage = getFarmPlayerXpPercentage(gameState);
  const formattedPercentage = formatFarmXpPercentage(percentage);
  const isFull = isXpBarFull(gameState) || percentage >= 100;

  return (
    <section
      data-farm-player-xp="global"
      className="rounded-2xl border border-amber-500/40 bg-slate-900/95 px-3 py-2 shadow-lg"
      aria-label="Tiến độ XP người chơi"
    >
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-amber-200">
          XP Người Chơi
        </span>
        <div
          className="relative h-3 flex-1 overflow-hidden rounded-full border border-amber-300/40 bg-slate-950 shadow-inner"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <div
            data-farm-xp-fill="yellow"
            data-xp-transition="global-state-target"
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-yellow-300 transition-[width] duration-[600ms] ease-out motion-reduce:transition-none"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span
          data-farm-xp-percent="one-decimal"
          className={`w-12 shrink-0 text-right font-mono text-xs font-black ${
            isFull ? "text-yellow-200" : "text-amber-300"
          }`}
        >
          {formattedPercentage}%
        </span>
      </div>
    </section>
  );
};
