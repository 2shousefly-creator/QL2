import React, { useId } from "react";
import { BadgeDefinition } from "../game/types";

type RankBadgeProps = {
  badge: BadgeDefinition;
  size?: number;
  isLocked?: boolean;
  isCurrent?: boolean;
  className?: string;
  ariaLabel?: string;
};

// Math helper for regular 5-sided pentagon
const getPentagonPoints = (cx: number, cy: number, r: number): string => {
  const pts: string[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
};

// Math helper for regular 6-sided hexagon
const getHexagonPoints = (cx: number, cy: number, r: number): string => {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 3;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
};

// Math helper for regular 10-sided decagon
const getDecagonPoints = (cx: number, cy: number, r: number): string => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
};

// Math helper for 5-pointed star
const getStarPoints = (cx: number, cy: number, rOuter: number, rInner: number): string => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
};

// Normalized starburst generator: Ensures every N-pointed badge has its outer bottom edge (including stroke)
// align EXACTLY at y = 117.0 (target bottom = 114.5 + stroke/2), matching the square / roundedSquare base.
const getNormalizedBurst = (
  n: number,
  targetSpan = 106,
  strokeWidth = 5,
  rInnerRatio = 0.74,
  startAngleOffset = -Math.PI / 2
) => {
  const unitPts: { x: number; y: number }[] = [];
  const count = n * 2;
  let unitXMin = Infinity;
  let unitXMax = -Infinity;
  let unitYMin = Infinity;
  let unitYMax = -Infinity;

  for (let i = 0; i < count; i++) {
    const r = i % 2 === 0 ? 1.0 : rInnerRatio;
    const angle = startAngleOffset + (i * Math.PI) / n;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    unitPts.push({ x, y });
    if (x < unitXMin) unitXMin = x;
    if (x > unitXMax) unitXMax = x;
    if (y < unitYMin) unitYMin = y;
    if (y > unitYMax) unitYMax = y;
  }

  const unitW = unitXMax - unitXMin;
  const unitH = unitYMax - unitYMin;

  const targetMaxW = targetSpan - strokeWidth; // 101
  const targetMaxH = 106 - strokeWidth; // 101
  const scale = Math.min(targetMaxW / unitW, targetMaxH / unitH);

  // Exact target bottom for all badge paths (with stroke 5, outer edge is 114.5 + 2.5 = 117.0)
  const targetPathBottom = 114.5;
  const cy = targetPathBottom - unitYMax * scale;
  const cx = 64; // Perfectly centered on horizontal axis

  const points = unitPts
    .map((p) => `${(cx + p.x * scale).toFixed(1)},${(cy + p.y * scale).toFixed(1)}`)
    .join(" ");

  return {
    points,
    cx,
    cy,
    rOuter: scale,
    rInner: scale * rInnerRatio,
    innerCircleR: 30.5,
  };
};

export const RankBadge: React.FC<RankBadgeProps> = ({
  badge: rawBadge,
  size = 128,
  isLocked = false,
  isCurrent = false,
  className = "",
  ariaLabel,
}) => {
  const uid = useId().replace(/:/g, "_");

  // Fallback badge definition if undefined or invalid object passed
  const badge = rawBadge || {
    id: "fallback",
    name: "Tân Binh",
    shape: "shield",
    basePalette: "steel",
    framePalette: "#94a3b8",
    symbolPalette: "#e2e8f0",
    symbols: ["star"],
  };

  // Gradient IDs
  const gradSteel = `steel_${uid}`;
  const gradCharcoal = `charcoal_${uid}`;
  const gradSilver = `silver_${uid}`;
  const gradNavy = `navy_${uid}`;
  const gradGreen = `green_${uid}`;
  const gradSapphire = `sapphire_${uid}`;
  const gradRuby = `ruby_${uid}`;
  const gradObsidian = `obsidian_${uid}`;
  const gradCrimson = `crimson_${uid}`;
  const gradGold = `gold_${uid}`;
  const gradGoldPlatinum = `goldPlatinum_${uid}`;
  const filterShadow = `shadow_${uid}`;

  // Resolve base fill color/gradient
  const getBaseFill = () => {
    switch (badge.basePalette) {
      case "steel":
        return `url(#${gradSteel})`;
      case "charcoal":
        return `url(#${gradCharcoal})`;
      case "silver":
        return `url(#${gradSilver})`;
      case "navy":
        return `url(#${gradNavy})`;
      case "green":
        return `url(#${gradGreen})`;
      case "sapphire":
        return `url(#${gradSapphire})`;
      case "ruby":
        return `url(#${gradRuby})`;
      case "obsidian":
        return `url(#${gradObsidian})`;
      case "crimson":
        return `url(#${gradCrimson})`;
      default:
        return badge.basePalette;
    }
  };

  // Resolve symbol fill color/gradient
  const getSymbolFill = () => {
    if (badge.symbolPalette === "goldPlatinum") return `url(#${gradGoldPlatinum})`;
    if (badge.symbolPalette === "#facc15" || badge.symbolPalette === "#eab308") return `url(#${gradGold})`;
    return badge.symbolPalette;
  };

  const baseFill = getBaseFill();
  const frameFill = badge.framePalette;
  const symbolFill = getSymbolFill();

  // Precompute normalized starburst info for exact bottom alignment across all shapes (y = 117.0)
  const getBurstInfo = () => {
    switch (badge.shape) {
      case "burst5":
      case "pentagon":
        return getNormalizedBurst(5, 106, 5, 0.74);
      case "burst6":
      case "hexagon":
        return getNormalizedBurst(6, 106, 5, 0.74);
      case "burst7":
        return getNormalizedBurst(7, 106, 5, 0.74);
      case "burst8":
        return getNormalizedBurst(8, 106, 5, 0.74);
      case "burst9":
        return getNormalizedBurst(9, 106, 5, 0.74);
      case "burst10":
        return getNormalizedBurst(10, 106, 5, 0.74);
      case "burst11":
        return getNormalizedBurst(11, 106, 5, 0.74);
      case "burst12":
        return getNormalizedBurst(12, 106, 5, 0.74);
      default:
        return null;
    }
  };

  const burstInfo = getBurstInfo();
  const shapeCX = burstInfo ? burstInfo.cx : 64;
  const shapeCY = burstInfo ? burstInfo.cy : 64;

  // Render Base Shape Paths
  const renderShape = () => {
    switch (badge.shape) {
      case "square":
        return (
          <rect
            x="13.5"
            y="13.5"
            width="101"
            height="101"
            rx="0"
            fill={baseFill}
            stroke={frameFill}
            strokeWidth="5"
          />
        );
      case "roundedSquare":
        return (
          <rect
            x="13.5"
            y="13.5"
            width="101"
            height="101"
            rx="10"
            fill={baseFill}
            stroke={frameFill}
            strokeWidth="5"
          />
        );
      case "burst5":
      case "pentagon":
      case "burst6":
      case "hexagon":
      case "burst7": {
        const info = burstInfo!;
        return (
          <g>
            <polygon
              points={info.points}
              fill={baseFill}
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Outline Circle Center (White) - Outline only, no fill */}
            <circle
              cx={info.cx}
              cy={info.cy}
              r={info.innerCircleR}
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
            />
          </g>
        );
      }
      case "burst8":
      case "burst9":
      case "burst10":
      case "burst11":
      case "burst12": {
        const info = burstInfo!;
        return (
          <g>
            <polygon
              points={info.points}
              fill={baseFill}
              stroke={frameFill}
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {badge.innerLayer === "decagon10" ? (
              <polygon
                points={getDecagonPoints(info.cx, info.cy, 32.5)}
                fill={`url(#${gradObsidian})`}
                stroke={frameFill}
                strokeWidth="3"
                strokeLinejoin="round"
              />
            ) : badge.innerLayer === "star5" || badge.innerLayer === "pentagon5" ? (
              <polygon
                points={getStarPoints(info.cx, info.cy, 32.5, 14.5)}
                fill="none"
                stroke={frameFill}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            ) : (
              <circle
                cx={info.cx}
                cy={info.cy}
                r={info.innerCircleR}
                fill="none"
                stroke={frameFill}
                strokeWidth="3.5"
              />
            )}
          </g>
        );
      }
      default:
        return (
          <rect
            x="13.5"
            y="13.5"
            width="101"
            height="101"
            rx="10"
            fill={baseFill}
            stroke={frameFill}
            strokeWidth="5"
          />
        );
    }
  };

  // Render Inner Symbols
  const renderSymbols = () => {
    switch (badge.symbol) {
      case "smile":
        return (
          <g transform="translate(64, 64)">
            <circle cx="0" cy="0" r="30" fill="none" stroke="#475569" strokeWidth="3.5" opacity="0.6" />
            <circle cx="-14" cy="-10" r="4.5" fill={symbolFill} />
            <circle cx="14" cy="-10" r="4.5" fill={symbolFill} />
            <path
              d="M -16 8 Q 0 24 16 8"
              fill="none"
              stroke={symbolFill}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </g>
        );

      case "horizontalBars": {
        const barsCount = badge.symbolCount;
        if (barsCount === 1) {
          return <rect x="30" y="54" width="68" height="20" rx="4" fill={symbolFill} />;
        } else if (barsCount === 2) {
          return (
            <g>
              <rect x="30" y="40" width="68" height="18" rx="4" fill={symbolFill} />
              <rect x="30" y="70" width="68" height="18" rx="4" fill={symbolFill} />
            </g>
          );
        } else {
          return (
            <g>
              <rect x="30" y="30" width="68" height="16" rx="3" fill={symbolFill} />
              <rect x="30" y="56" width="68" height="16" rx="3" fill={symbolFill} />
              <rect x="30" y="82" width="68" height="16" rx="3" fill={symbolFill} />
            </g>
          );
        }
      }

      case "chevrons": {
        const count = badge.symbolCount;
        if (count === 1) {
          // Hạ Sĩ (1 Chevron) - Thicker, perfectly centered at (64, 64)
          return (
            <path
              d="M 28 43 L 64 85 L 100 43 L 82 43 L 64 64 L 46 43 Z"
              fill={symbolFill}
            />
          );
        } else if (count === 2) {
          // Trung Sĩ (2 Chevrons) - Thicker, perfectly centered at (64, 64)
          return (
            <g>
              <path
                d="M 28 32 L 64 68 L 100 32 L 82 32 L 64 50 L 46 32 Z"
                fill={symbolFill}
              />
              <path
                d="M 28 60 L 64 96 L 100 60 L 82 60 L 64 78 L 46 60 Z"
                fill={symbolFill}
              />
            </g>
          );
        } else {
          // Thượng Sĩ (3 Chevrons) - Thicker, perfectly centered at (64, 64)
          return (
            <g>
              <path
                d="M 28 27 L 64 57 L 100 27 L 82 27 L 64 42 L 46 27 Z"
                fill={symbolFill}
              />
              <path
                d="M 28 49 L 64 79 L 100 49 L 82 49 L 64 64 L 46 49 Z"
                fill={symbolFill}
              />
              <path
                d="M 28 71 L 64 101 L 100 71 L 82 71 L 64 86 L 46 71 Z"
                fill={symbolFill}
              />
            </g>
          );
        }
      }

      case "stars": {
        const layout = badge.starLayout || "center";
        const cx = shapeCX;
        const cy = shapeCY;

        // Special prominent single star for Tổng Tư Lệnh
        if (badge.id === "badge_endgame_4") {
          return (
            <g>
              <polygon
                points={getStarPoints(cx, cy, 15.5, 6.8)}
                fill={`url(#${gradGoldPlatinum})`}
              />
            </g>
          );
        }

        // Stars for Cấp Úy, Cấp Tá, Cấp Tướng, Cấp Tối Cao
        const OFFICER_STAR_R_OUTER = 9.5;
        const OFFICER_STAR_R_INNER = 4.2;

        if (layout === "center" || badge.symbolCount === 1) {
          // 1 star: exactly centered at (cx, cy)
          return (
            <polygon
              points={getStarPoints(cx, cy, OFFICER_STAR_R_OUTER, OFFICER_STAR_R_INNER)}
              fill={symbolFill}
            />
          );
        } else if (layout === "horizontal2" || badge.symbolCount === 2) {
          // 2 stars: horizontal balanced, center of cluster at (cx, cy)
          return (
            <g>
              <polygon points={getStarPoints(cx - 12.75, cy, OFFICER_STAR_R_OUTER, OFFICER_STAR_R_INNER)} fill={symbolFill} />
              <polygon points={getStarPoints(cx + 12.75, cy, OFFICER_STAR_R_OUTER, OFFICER_STAR_R_INNER)} fill={symbolFill} />
            </g>
          );
        } else if (layout === "triangle3" || badge.symbolCount === 3) {
          // 3 stars: 1 top + 2 bottom (balanced triangle pointing up, centroid at (cx, cy))
          return (
            <g>
              <polygon points={getStarPoints(cx, cy - 11.05, OFFICER_STAR_R_OUTER, OFFICER_STAR_R_INNER)} fill={symbolFill} />
              <polygon points={getStarPoints(cx - 11.05, cy + 5.525, OFFICER_STAR_R_OUTER, OFFICER_STAR_R_INNER)} fill={symbolFill} />
              <polygon points={getStarPoints(cx + 11.05, cy + 5.525, OFFICER_STAR_R_OUTER, OFFICER_STAR_R_INNER)} fill={symbolFill} />
            </g>
          );
        } else if (layout === "grid4" || badge.symbolCount === 4) {
          // 4 stars: 2x2 grid, center of cluster exactly at (cx, cy)
          return (
            <g>
              <polygon points={getStarPoints(cx - 11.05, cy - 11.05, OFFICER_STAR_R_OUTER, OFFICER_STAR_R_INNER)} fill={symbolFill} />
              <polygon points={getStarPoints(cx + 11.05, cy - 11.05, OFFICER_STAR_R_OUTER, OFFICER_STAR_R_INNER)} fill={symbolFill} />
              <polygon points={getStarPoints(cx - 11.05, cy + 11.05, OFFICER_STAR_R_OUTER, OFFICER_STAR_R_INNER)} fill={symbolFill} />
              <polygon points={getStarPoints(cx + 11.05, cy + 11.05, OFFICER_STAR_R_OUTER, OFFICER_STAR_R_INNER)} fill={symbolFill} />
            </g>
          );
        }

        return null;
      }

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative z-0 inline-flex items-center justify-center select-none ${
        isCurrent && !isLocked ? "theme-rank-glow" : ""
      } ${className}`}
      style={{
        width: `var(--rank-badge-size, ${size}px)`,
        height: `var(--rank-badge-size, ${size}px)`,
      }}
      role="img"
      aria-label={ariaLabel || `Huy hiệu ${badge.id}`}
    >
      <svg
        viewBox="0 0 128 128"
        width={size}
        height={size}
        className={`w-full h-full transition-all duration-300 ${
          isLocked ? "opacity-35 grayscale filter" : "drop-shadow-xl"
        }`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 1. Steel / Metallic Pale Silver */}
          <linearGradient id={gradSteel} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="40%" stopColor="#e2e8f0" />
            <stop offset="80%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          {/* Charcoal Black Gradient */}
          <linearGradient id={gradCharcoal} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="35%" stopColor="#1e293b" />
            <stop offset="75%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* 2. Cool Silver */}
          <linearGradient id={gradSilver} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          {/* 3. Deep Dark Navy */}
          <linearGradient id={gradNavy} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="35%" stopColor="#0f172a" />
            <stop offset="75%" stopColor="#090d16" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* 4. Darker Green Army for Cấp Úy */}
          <linearGradient id={gradGreen} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="35%" stopColor="#166534" />
            <stop offset="70%" stopColor="#14532d" />
            <stop offset="100%" stopColor="#052e16" />
          </linearGradient>

          {/* 5. Darker Sapphire Blue for Cấp Tá */}
          <linearGradient id={gradSapphire} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="35%" stopColor="#1e40af" />
            <stop offset="70%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>

          {/* 6. Darker Ruby Red for Cấp Tướng */}
          <linearGradient id={gradRuby} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#be123c" />
            <stop offset="35%" stopColor="#9f1239" />
            <stop offset="70%" stopColor="#881337" />
            <stop offset="100%" stopColor="#4c0519" />
          </linearGradient>

          {/* 7. Obsidian Black */}
          <linearGradient id={gradObsidian} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="40%" stopColor="#1e293b" />
            <stop offset="80%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* 8. Deep Crimson Red */}
          <linearGradient id={gradCrimson} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="30%" stopColor="#dc2626" />
            <stop offset="70%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>

          {/* 9. Gold Gradient */}
          <linearGradient id={gradGold} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* 10. Gold Platinum Gradient */}
          <linearGradient id={gradGoldPlatinum} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Drop Shadow */}
          <filter id={filterShadow} x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Base Shape */}
        <g filter={`url(#${filterShadow})`}>
          {renderShape()}
        </g>

        {/* Inner Symbols */}
        {renderSymbols()}
      </svg>
    </div>
  );
};
