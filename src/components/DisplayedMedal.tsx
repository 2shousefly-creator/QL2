import React from "react";
import { soundManager } from "../game/audio";
import {
  getMedalById,
  MEDAL_TIER_STYLES,
  type MedalDefinition,
} from "../game/medals/medalCatalog";

type DisplayedMedalProps = {
  medal: MedalDefinition;
  itemHeight: number;
  onSelectMedal?: (medal: MedalDefinition) => void;
};

type DisplayedMedalColumnProps = {
  medalIds: string[];
  badgeSize?: number;
  onSelectMedal?: (medal: MedalDefinition) => void;
  className?: string;
};

const formatMedalName = (name: string): { line1: string; line2?: string } => {
  const words = name.trim().split(/\s+/);
  if (words.length <= 2) return { line1: name };

  const mid = Math.ceil(words.length / 2);
  return {
    line1: words.slice(0, mid).join(" "),
    line2: words.slice(mid).join(" "),
  };
};

export const DisplayedMedal: React.FC<DisplayedMedalProps> = ({
  medal,
  itemHeight,
  onSelectMedal,
}) => {
  const formatted = formatMedalName(medal.name);
  const tierStyle = MEDAL_TIER_STYLES[medal.tier];

  const content = (
    <>
      <div className={`${tierStyle.ribbonBg} border ${tierStyle.ribbonBorder} rounded-xs px-1.5 h-6 sm:h-7 min-w-[44px] max-w-full w-auto inline-flex flex-col items-center justify-center shadow-md shadow-black/50`}>
        <span className="block text-[8px] sm:text-[9px] font-bold text-white text-center leading-[1.1] truncate max-w-[70px] sm:max-w-[76px] select-none tracking-tight drop-shadow-sm">
          {formatted.line1}
        </span>
        {formatted.line2 && (
          <span className="block text-[8px] sm:text-[9px] font-bold text-white text-center leading-[1.1] truncate max-w-[70px] sm:max-w-[76px] select-none tracking-tight drop-shadow-sm">
            {formatted.line2}
          </span>
        )}
      </div>

      <span className="text-[32px] sm:text-[38px] leading-none filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] -mt-0.5 select-none">
        {medal.iconSymbol}
      </span>
    </>
  );

  const sharedClassName =
    "w-full flex flex-col items-center justify-center transition-transform hover:scale-110 active:scale-95 focus:outline-none group shrink-0";

  if (!onSelectMedal) {
    return (
      <div
        className={sharedClassName}
        style={{ height: `${itemHeight}px` }}
        title={medal.name}
        aria-label={medal.name}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        soundManager.playClick();
        onSelectMedal(medal);
      }}
      className={`${sharedClassName} cursor-pointer`}
      style={{ height: `${itemHeight}px` }}
      title={medal.name}
    >
      {content}
    </button>
  );
};

export const DisplayedMedalColumn: React.FC<DisplayedMedalColumnProps> = ({
  medalIds,
  badgeSize = 224,
  onSelectMedal,
  className = "",
}) => {
  const medals = medalIds
    .map((id) => getMedalById(id))
    .filter((medal): medal is MedalDefinition => Boolean(medal));

  if (medals.length === 0) return null;

  const itemHeight = badgeSize / 3;

  return (
    <div
      className={`w-20 sm:w-22 flex flex-col items-center justify-start z-20 shrink-0 ${className}`}
      style={{ height: `${badgeSize}px` }}
    >
      {medals.map((medal) => (
        <DisplayedMedal
          key={medal.id}
          medal={medal}
          itemHeight={itemHeight}
          onSelectMedal={onSelectMedal}
        />
      ))}
    </div>
  );
};
