import { CoreVfx } from "../../../components/core-visual/CoreVfx";
import React from "react";
import type { MedalDefinition } from "../../../game/medals/medalCatalog";
import type { RankFamily } from "../../../game/types";
import type { UniformArtConfig } from "./uniformArtCatalog";
import { UniformMedalRack } from "./UniformMedalRack";
import { UniformRankCluster } from "./UniformRankCluster";
import { UniformShoulderBoard } from "./UniformShoulderBoard";

type UniformPortraitProps = {
  config: UniformArtConfig;
  family: RankFamily;
  filledSegments: number;
  isCurrent: boolean;
  unlockedMedalIds: string[];
  onSelectMedal: (medal: MedalDefinition) => void;
};

export const UniformPortrait: React.FC<UniformPortraitProps> = ({
  config,
  family,
  filledSegments,
  isCurrent,
  unlockedMedalIds,
  onSelectMedal,
}) => {
  return (
    <div className="core-uniform-display relative mx-auto aspect-[3/4] min-h-[430px] w-full max-w-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/95 via-slate-950/90 to-black shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
      <div
        className="pointer-events-none absolute inset-x-[8%] top-[6%] h-[44%] rounded-full blur-3xl"
        style={{ backgroundColor: config.glow }}
      />

      <img
        src={config.uniformSrc}
        width={840}
        height={1120}
        className="pointer-events-none absolute inset-0 h-full w-full object-fill"
        alt={`Quân phục ${family.name}, chỉ hiển thị cổ, vai, ngực và hai tay áo`}
        draggable={false}
        fetchPriority="high"
      />

      <CoreVfx key={family.id} type="shine" className="core-uniform-shine" />

      {/* Viewer-left shoulder is the wearer's right shoulder. */}
      <div className="absolute left-[2%] top-[16%] w-[30%]">
        <UniformShoulderBoard config={config} side="wearer-right" />
      </div>
      {/* Viewer-right shoulder is the wearer's left shoulder. */}
      <div className="absolute right-[2%] top-[16%] w-[30%]">
        <UniformShoulderBoard config={config} side="wearer-left" />
      </div>

      {/* Wearer's right chest appears on the viewer's left. */}
      <div className="absolute left-[2%] top-[30%]">
        <UniformMedalRack medalIds={unlockedMedalIds} onSelectMedal={onSelectMedal} />
      </div>

      {/* Scale the existing badge/progress cluster as one unit so its internal visual language stays unchanged. */}
      <div
        className="absolute right-[13%] top-[31%] origin-top-right"
        style={{ transform: "scale(0.8)" }}
        data-uniform-rank-scale="0.8"
      >
        <UniformRankCluster family={family} filledSegments={filledSegments} isCurrent={isCurrent} />
      </div>
    </div>
  );
};
