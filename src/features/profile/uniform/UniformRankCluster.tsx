import React from "react";
import { RankBadge } from "../../../components/RankBadge";
import type { RankFamily } from "../../../game/types";
import { UniformProgressBar } from "./UniformProgressBar";

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
  return (
    <div className="flex w-24 flex-col items-center" aria-label={`Cụm Huy Hiệu ${family.name}`}>
      <RankBadge
        badge={family.badge}
        size={76}
        isCurrent={isCurrent}
        ariaLabel={`Huy Hiệu cấp bậc ${family.name}`}
        className="drop-shadow-[0_5px_7px_rgba(0,0,0,0.65)]"
      />
      <div className="-mt-1.5 w-full rounded-md border border-black/50 bg-slate-950/65 p-1 shadow-lg backdrop-blur-sm">
        <UniformProgressBar
          totalSegments={family.tierCount}
          filledSegments={filledSegments}
          accentColor={family.badge.symbolPalette === "goldPlatinum" ? "#fff7cc" : family.badge.symbolPalette}
        />
      </div>
    </div>
  );
};
