import React, { useId } from "react";
import type { UniformArtConfig } from "./uniformArtCatalog";

type UniformShoulderBoardProps = {
  config: UniformArtConfig;
  side: "wearer-left" | "wearer-right";
};

const getStarPoints = (cx: number, cy: number, outerRadius: number, innerRadius: number): string => {
  return Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    return `${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`;
  }).join(" ");
};

export const UniformShoulderBoard: React.FC<UniformShoulderBoardProps> = ({ config, side }) => {
  const uid = useId().replace(/:/g, "_");
  const gradientId = `shoulder_${uid}`;
  const insetId = `shoulder_inset_${uid}`;
  const count = Math.max(0, Math.min(4, config.shoulderMarkCount));
  const outerEdgeIsRight = side === "wearer-left";

  const renderMark = () => {
    if (config.shoulderMarkType === "none") return null;

    if (config.shoulderMarkType === "vertical_bar") {
      const outerX = outerEdgeIsRight ? 105 : 23;
      const direction = outerEdgeIsRight ? -1 : 1;
      return (
        <g fill={config.shoulderPalette.mark}>
          {Array.from({ length: count }, (_, index) => {
            const x = outerX + direction * index * 10;
            return <rect key={index} x={x - 2.5} y="13" width="5" height="22" rx="2" />;
          })}
        </g>
      );
    }

    if (config.shoulderMarkType === "chevron") {
      const outerTipX = outerEdgeIsRight ? 107 : 21;
      const direction = outerEdgeIsRight ? -1 : 1;
      return (
        <g
          fill="none"
          stroke={config.shoulderPalette.mark}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {Array.from({ length: count }, (_, index) => {
            const tipX = outerTipX + direction * index * 10;
            const armX = tipX + direction * 11;
            return <path key={index} d={`M ${armX} 13 L ${tipX} 24 L ${armX} 35`} />;
          })}
        </g>
      );
    }

    if (config.shoulderMarkType === "supreme_star") {
      return (
        <g>
          <circle cx="64" cy="24" r="15" fill={config.shoulderPalette.backgroundDeep} stroke={config.shoulderPalette.mark} strokeWidth="1.5" opacity="0.96" />
          <circle cx="64" cy="24" r="12.5" fill="none" stroke={config.shoulderPalette.highlight} strokeWidth="1" opacity="0.75" />
          <polygon points={getStarPoints(64, 24, 11, 4.7)} fill={config.shoulderPalette.mark} />
          <circle cx="64" cy="24" r="2.2" fill="#fff7cc" />
        </g>
      );
    }

    const gap = count === 4 ? 18 : 21;
    const startX = 64 - ((count - 1) * gap) / 2;
    return (
      <g fill={config.shoulderPalette.mark}>
        {Array.from({ length: count }, (_, index) => (
          <polygon key={index} points={getStarPoints(startX + index * gap, 24, 7.4, 3.2)} />
        ))}
      </g>
    );
  };

  const innerFastenerX = outerEdgeIsRight ? 18 : 110;

  return (
    <div
      className="w-full drop-shadow-[0_3px_3px_rgba(0,0,0,0.38)]"
      style={{ transform: `rotate(${outerEdgeIsRight ? 8 : -8}deg)` }}
      role="img"
      aria-label={`Cầu vai ${side === "wearer-left" ? "trái" : "phải"} của người mặc, ${
        config.shoulderMarkType === "none" ? "không ký hiệu" : `${count} ký hiệu`
      }`}
    >
      <svg viewBox="0 0 128 48" className="block h-auto w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={config.shoulderPalette.highlight} />
            <stop offset="40%" stopColor={config.shoulderPalette.background} />
            <stop offset="100%" stopColor={config.shoulderPalette.backgroundDeep} />
          </linearGradient>
          <linearGradient id={insetId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={config.shoulderPalette.highlight} stopOpacity="0.24" />
            <stop offset="100%" stopColor={config.shoulderPalette.backgroundDeep} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <path
          d="M 8 17 Q 9 10 18 9 L 110 13 Q 119 14 120 22 L 118 32 Q 117 39 109 40 L 18 43 Q 10 43 9 36 Z"
          fill={`url(#${gradientId})`}
          stroke={config.shoulderPalette.border}
          strokeWidth={config.visualGroup === "supreme" ? 2.4 : 1.6}
          strokeLinejoin="round"
        />
        <path
          d="M 15 19 L 109 18 Q 113 18 113 22 L 111 34 L 17 38 Z"
          fill={`url(#${insetId})`}
          stroke={config.shoulderPalette.highlight}
          strokeWidth="0.7"
          strokeOpacity="0.24"
        />
        <circle
          cx={innerFastenerX}
          cy="25"
          r="3.1"
          fill={config.shoulderPalette.backgroundDeep}
          stroke={config.shoulderPalette.border}
          strokeWidth="1"
          opacity="0.85"
        />
        {renderMark()}
      </svg>
    </div>
  );
};
