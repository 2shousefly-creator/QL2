import React from "react";
import type { UniformArtConfig } from "./uniformArtCatalog";

type UniformShoulderBoardProps = {
  config: UniformArtConfig;
  side: "wearer-left" | "wearer-right";
};

export const UniformShoulderBoard: React.FC<UniformShoulderBoardProps> = ({ config, side }) => {
  const mirror = side === "wearer-left";
  return (
    <img
      src={config.shoulderSrc}
      width={512}
      height={192}
      draggable={false}
      className="pointer-events-none block h-auto w-full drop-shadow-[0_3px_3px_rgba(0,0,0,0.38)]"
      style={{ transform: `rotate(${mirror ? 16 : -16}deg) scaleX(${mirror ? -1 : 1})` }}
      alt={`Cầu vai ${mirror ? "trái" : "phải"} của người mặc, ${config.shoulderDescription}`}
    />
  );
};
