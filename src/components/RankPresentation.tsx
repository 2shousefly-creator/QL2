import React from "react";
import { RankBadge } from "./RankBadge";
import { RankTierProgress } from "./RankTierProgress";
import { RankStep } from "../game/types";
import { RANK_FAMILIES } from "../game/rankFamilies";

type RankPresentationProps = {
  rankStep: RankStep;
  badgeSize?: number;
  isCurrent?: boolean;
  isLocked?: boolean;
  showName?: boolean;
  showTierLabel?: boolean;
  showProgress?: boolean;
  customName?: string;
  animateNewTier?: boolean;
  className?: string;
  leftMedalsNode?: React.ReactNode;
  rightMedalsNode?: React.ReactNode;
};

export const RankPresentation: React.FC<RankPresentationProps> = ({
  rankStep,
  badgeSize = 140,
  isCurrent = false,
  isLocked = false,
  showName = true,
  showTierLabel = false,
  showProgress = true,
  customName,
  animateNewTier = false,
  className = "",
  leftMedalsNode,
  rightMedalsNode,
}) => {
  const family = RANK_FAMILIES.find((f) => f.id === rankStep.familyId) || RANK_FAMILIES[0];
  const hasTierBar = showProgress && rankStep.tierCount > 1 && rankStep.tier !== null;

  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* 1. SVG Badge with Medals */}
      <div className="relative flex items-center justify-center">
        {leftMedalsNode && (
          <div
            className="absolute right-full mr-1.5 sm:mr-2.5 z-20 flex items-center justify-center"
            style={{ top: 0 }}
          >
            {leftMedalsNode}
          </div>
        )}
        <RankBadge
          badge={family.badge}
          size={badgeSize}
          isCurrent={isCurrent}
          isLocked={isLocked}
          ariaLabel={`Huy hiệu ${family.name}, cấp hiện tại ${rankStep.displayName}`}
        />
        {rightMedalsNode && (
          <div
            className="absolute left-full ml-1.5 sm:ml-2.5 z-20 flex items-center justify-center"
            style={{ top: 0 }}
          >
            {rightMedalsNode}
          </div>
        )}
      </div>

      {/* Container matching badge width for tier bar */}
      {hasTierBar && (
        <div className="flex flex-col items-center mt-1 sm:mt-1.5 relative z-10">
          {/* 2. Tier Progress Bar directly under badge */}
          <RankTierProgress
            currentTier={rankStep.tier!}
            tierCount={rankStep.tierCount}
            badgeSize={badgeSize}
            animateNewTier={animateNewTier}
            size={badgeSize >= 120 ? "hero" : "list"}
          />

          {showTierLabel && (
            <span className="theme-text-accent text-[11px] font-semibold tracking-wider opacity-90 uppercase mt-0.5">
              Bậc {rankStep.tier}/{rankStep.tierCount}
            </span>
          )}
        </div>
      )}

      {/* 3. Current Rank Name */}
      {showName && (
        <h2 className="mt-2 font-black text-slate-100 tracking-wide text-xl sm:text-2xl drop-shadow">
          {customName || rankStep.displayName}
        </h2>
      )}
    </div>
  );
};
