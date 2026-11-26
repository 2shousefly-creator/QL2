import React from "react";
import { RankBadge } from "./RankBadge";
import { RankStep } from "../game/types";
import { RANK_FAMILIES } from "../game/rankFamilies";

type RankPresentationProps = {
  rankStep: RankStep;
  badgeSize?: number;
  isCurrent?: boolean;
  isLocked?: boolean;
  showName?: boolean;
  customName?: string;
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
  customName,
  className = "",
  leftMedalsNode,
  rightMedalsNode,
}) => {
  const family = RANK_FAMILIES.find((f) => f.id === rankStep.familyId) || RANK_FAMILIES[0];

  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* 1. PNG Badge with Medals */}
      <div className="relative flex items-center justify-center">
        {leftMedalsNode && (
          <div
            className="absolute right-full mr-1.5 sm:mr-2.5 z-20 flex items-center justify-center"
            style={{ top: "50%", transform: "translateY(-50%)" }}
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
            style={{ top: "50%", transform: "translateY(-50%)" }}
          >
            {rightMedalsNode}
          </div>
        )}
      </div>

      {/* 3. Current Rank Name */}
      {showName && (
        <h2 className="mt-2 font-black text-slate-100 tracking-wide text-xl sm:text-2xl drop-shadow">
          {customName || rankStep.displayName}
        </h2>
      )}
    </div>
  );
};
