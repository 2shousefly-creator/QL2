import React from "react";
import {
  getMedalById,
  MEDAL_TIER_STYLES,
  type MedalDefinition,
} from "../../../game/medals/medalCatalog";

type UniformMedalRackProps = {
  selectedMedalIds: string[];
};

export const UniformMedalRack: React.FC<UniformMedalRackProps> = ({ selectedMedalIds }) => {
  const medals = selectedMedalIds
    .slice(0, 6)
    .map((id) => getMedalById(id))
    .filter((medal): medal is MedalDefinition => Boolean(medal));

  if (medals.length === 0) {
    return (
      <div className="grid w-full grid-cols-3 gap-1.5 opacity-45" aria-label="Chưa trưng bày Huân Chương">
        {Array.from({ length: 6 }, (_, index) => (
          <span
            key={index}
            className="h-9 rounded-sm border border-dashed border-slate-300/35 bg-slate-950/20 shadow-inner"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-3 gap-x-1 gap-y-1.5" aria-label={`${medals.length} Huân Chương đang trưng bày`}>
      {medals.map((medal) => {
        const tierStyle = MEDAL_TIER_STYLES[medal.tier];
        return (
          <div
            key={medal.id}
            className="flex min-w-0 flex-col items-center drop-shadow-[0_3px_5px_rgba(0,0,0,0.75)]"
            title={medal.name}
            aria-label={medal.name}
          >
            <div className={`flex h-3.5 w-full items-center justify-center overflow-hidden rounded-[2px] border px-0.5 ${tierStyle.ribbonBg} ${tierStyle.ribbonBorder}`}>
              <span className={`max-w-full truncate text-[6px] font-black leading-none ${tierStyle.ribbonText}`}>
                {medal.name}
              </span>
            </div>
            <span className="-mt-0.5 text-[20px] leading-none select-none">{medal.iconSymbol}</span>
          </div>
        );
      })}
    </div>
  );
};
