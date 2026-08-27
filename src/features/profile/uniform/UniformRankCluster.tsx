import React from "react";
import { RankBadge } from "../../../components/RankBadge";
import { RankTierProgress } from "../../../components/RankTierProgress";
import type { RankFamily } from "../../../game/types";

type UniformRankClusterProps = {
  family: RankFamily;
  filledSegments: number;
  isCurrent: boolean;
};

export const UniformRankCluster: React.FC<UniformRankClusterProps> = ({
  family,
  filledSegments,
  isCurrent,
}) => {
  const badgeSize = 96;

  return (
    <div
      className="flex flex-col items-center"
      style={{ width: `${badgeSize}px` }}
      aria-label={`Cụm Huy Hiệu ${family.name}`}
    >
      <RankBadge
        badge={family.badge}
        size={badgeSize}
        isCurrent={isCurrent}
        ariaLabel={`Huy Hiệu cấp bậc ${family.name}`}
        className="drop-shadow-[0_5px_7px_rgba(0,0,0,0.65)]"
      />
      <div className="mt-1 flex w-full justify-center">
        <RankTierProgress
          currentTier={filledSegments}
          tierCount={family.tierCount}
          badgeSize={badgeSize}
          size="hero"
          showSingleTier={true}
          className="!my-0"
        />
      </div>
    </div>
  );
};
