import React from "react";
import { DisplayedMedal } from "../../../components/DisplayedMedal";
import {
  getMedalById,
  type MedalDefinition,
} from "../../../game/medals/medalCatalog";

type UniformMedalRackProps = {
  medalIds: string[];
  onSelectMedal: (medal: MedalDefinition) => void;
};

export const UNIFORM_MEDALS_PER_ROW = 4;
export const UNIFORM_MEDAL_SCALE = 0.5;

const HOME_MEDAL_COLUMN_WIDTH = 80;
const HOME_MEDAL_COLUMN_HEIGHT = 224;
const HOME_MEDAL_ITEM_HEIGHT = HOME_MEDAL_COLUMN_HEIGHT / 3;

export type UniformMedalLayout = {
  rowCount: number;
  scaledWidth: number;
  scaledHeight: number;
};

export function getUniformMedalLayout(medalCount: number): UniformMedalLayout {
  const safeCount = Math.max(0, Math.floor(medalCount));
  const rowCount = Math.ceil(safeCount / UNIFORM_MEDALS_PER_ROW);

  return {
    rowCount,
    scaledWidth: HOME_MEDAL_COLUMN_WIDTH * UNIFORM_MEDALS_PER_ROW * UNIFORM_MEDAL_SCALE,
    scaledHeight: HOME_MEDAL_ITEM_HEIGHT * rowCount * UNIFORM_MEDAL_SCALE,
  };
}

export const UniformMedalRack: React.FC<UniformMedalRackProps> = ({
  medalIds,
  onSelectMedal,
}) => {
  const medals = medalIds
    .map((id) => getMedalById(id))
    .filter((medal): medal is MedalDefinition => Boolean(medal));

  if (medals.length === 0) return null;

  const layout = getUniformMedalLayout(medals.length);

  return (
    <div
      className="relative z-20"
      style={{ width: `${layout.scaledWidth}px`, height: `${layout.scaledHeight}px` }}
      aria-label={`${medals.length} Huân Chương đã mở khóa`}
      data-uniform-medal-rack="true"
      data-medals-per-row={UNIFORM_MEDALS_PER_ROW}
      data-uniform-medal-scale={UNIFORM_MEDAL_SCALE}
    >
      <div
        className="absolute left-0 top-0 grid origin-top-left"
        style={{
          width: `${HOME_MEDAL_COLUMN_WIDTH * UNIFORM_MEDALS_PER_ROW}px`,
          gridTemplateColumns: `repeat(${UNIFORM_MEDALS_PER_ROW}, ${HOME_MEDAL_COLUMN_WIDTH}px)`,
          gridAutoRows: `${HOME_MEDAL_ITEM_HEIGHT}px`,
          transform: `scale(${UNIFORM_MEDAL_SCALE})`,
        }}
      >
        {medals.map((medal) => (
          <DisplayedMedal
            key={medal.id}
            medal={medal}
            itemHeight={HOME_MEDAL_ITEM_HEIGHT}
            onSelectMedal={onSelectMedal}
          />
        ))}
      </div>
    </div>
  );
};
