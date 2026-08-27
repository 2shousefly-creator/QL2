import React, { useId } from "react";
import type { UniformArtConfig } from "./uniformArtCatalog";

type UniformShoulderBoardProps = {
  config: UniformArtConfig;
  side: "left" | "right";
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
  const shineId = `shoulder_shine_${uid}`;
  const count = Math.max(0, Math.min(4, config.shoulderMarkCount));

  const renderMark = () => {
    if (config.shoulderMarkType === "none") return null;

    if (config.shoulderMarkType === "bar") {
      const gap = 9;
      const startY = 28 - ((count - 1) * gap) / 2;
      return (
        <g fill={config.shoulderPalette.mark}>
          {Array.from({ length: count }, (_, index) => (
            <rect key={index} x="40" y={startY + index * gap - 2.5} width="40" height="5" rx="2.5" />
          ))}
        </g>
      );
    }

    if (config.shoulderMarkType === "chevron") {
      const gap = 10;
      const startY = 18 - ((count - 1) * gap) / 2;
      return (
        <g fill="none" stroke={config.shoulderPalette.mark} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
          {Array.from({ length: count }, (_, index) => {
            const y = startY + index * gap;
            return <path key={index} d={`M 43 ${y} L 60 ${y + 9} L 77 ${y}`} />;
          })}
        </g>
      );
    }

    if (config.shoulderMarkType === "supreme_star") {
      return (
        <g>
          <circle cx="60" cy="28" r="16" fill="none" stroke={config.shoulderPalette.mark} strokeWidth="1.5" opacity="0.7" />
          <circle cx="60" cy="28" r="12.5" fill={config.shoulderPalette.backgroundDeep} stroke={config.shoulderPalette.highlight} strokeWidth="1" />
          <polygon points={getStarPoints(60, 28, 11, 4.8)} fill={config.shoulderPalette.mark} />
          <circle cx="60" cy="28" r="2.4" fill="#fff7cc" />
        </g>
      );
    }

    const gap = count === 4 ? 18 : 21;
    const startX = 60 - ((count - 1) * gap) / 2;
    return (
      <g fill={config.shoulderPalette.mark}>
        {Array.from({ length: count }, (_, index) => (
          <polygon key={index} points={getStarPoints(startX + index * gap, 28, 8, 3.5)} />
        ))}
      </g>
    );
  };

  return (
    <div
      className="w-full drop-shadow-[0_5px_8px_rgba(0,0,0,0.65)]"
      style={{ transform: `rotate(${side === "left" ? -7 : 7}deg)` }}
      role="img"
      aria-label={`Cầu vai ${config.shoulderMarkType === "none" ? "không ký hiệu" : `có ${count} ký hiệu`}`}
    >
      <svg viewBox="0 0 120 56" className="block h-auto w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={config.shoulderPalette.highlight} />
            <stop offset="38%" stopColor={config.shoulderPalette.background} />
            <stop offset="100%" stopColor={config.shoulderPalette.backgroundDeep} />
          </linearGradient>
          <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 8 9 Q 12 5 18 5 L 103 11 Q 111 12 112 20 L 109 40 Q 108 47 101 48 L 18 51 Q 10 51 9 44 L 5 17 Q 4 12 8 9 Z"
          fill={`url(#${gradientId})`}
          stroke={config.shoulderPalette.border}
          strokeWidth={config.visualGroup === "supreme" ? 3 : 2.2}
        />
        <path
          d="M 14 13 L 102 17 Q 106 17 106 21 L 104 39 L 17 45 Z"
          fill="none"
          stroke={`url(#${shineId})`}
          strokeWidth="2"
          opacity="0.9"
        />
        {config.trimLevel >= 3 && (
          <path d="M 16 47 L 102 44" stroke={config.shoulderPalette.mark} strokeWidth="1.4" opacity="0.75" />
        )}
        {renderMark()}
      </svg>
    </div>
  );
};
