import React, { useId } from "react";
import type { BadgeDefinition } from "../game/types";
import {
  getClosedWreathGeometry,
  getFiveBranchStarWreathGeometry,
  getFivePointStarPoints,
  getLeafPath,
  getLowerLaurelGeometry,
  getRankBadgeGeometry,
  getStarCluster,
  LAUREL_VARIANTS,
  type LaurelGeometry,
  type RankBadgeVisualFamily,
} from "./rankBadgeGeometry";

type RankBadgeProps = {
  badge: BadgeDefinition;
  size?: number;
  isLocked?: boolean;
  isCurrent?: boolean;
  className?: string;
  ariaLabel?: string;
};

type LaurelHalfProps = {
  geometry: LaurelGeometry;
  color: string;
  stemWidth: number;
};

const SMALL_SPROUT_GEOMETRY: LaurelGeometry = {
  stemPath: "M 47,96 C 42.5,92 38.5,87 36.5,81",
  leafPaths: [
    getLeafPath({ x: 44.5, y: 92.5 }, { x: -0.9, y: -0.45 }, 5.2, 1.35),
    getLeafPath({ x: 41.8, y: 89 }, { x: -0.75, y: -0.65 }, 4.7, 1.2),
    getLeafPath({ x: 39.7, y: 85.4 }, { x: -0.75, y: -0.65 }, 4, 1.05),
  ],
};

const MATURE_LOWER_LAUREL_GEOMETRY = getLowerLaurelGeometry();
const CLOSED_WREATH_GEOMETRY = getClosedWreathGeometry("general");
const GUARDIAN_WREATH_GEOMETRY = getClosedWreathGeometry("endgame");
const FIVE_BRANCH_STAR_WREATH_GEOMETRY = getFiveBranchStarWreathGeometry();
const MIRROR_AROUND_CENTER = "translate(128 0) scale(-1 1)";

const LaurelHalf: React.FC<LaurelHalfProps> = ({ geometry, color, stemWidth }) => (
  <g>
    <path
      d={geometry.stemPath}
      fill="none"
      stroke={color}
      strokeWidth={stemWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {geometry.leafPaths.map((path, index) => (
      <path key={index} d={path} fill={color} />
    ))}
  </g>
);

const MirroredLaurel: React.FC<LaurelHalfProps> = (props) => (
  <g>
    <LaurelHalf {...props} />
    <g transform={MIRROR_AROUND_CENTER}>
      <LaurelHalf {...props} />
    </g>
  </g>
);

const V2_BASE_COLORS: Record<RankBadgeVisualFamily, string> = {
  junior_officer: "#245b37",
  field_officer: "#132a46",
  general: "#8f2431",
  guardian: "#0a101b",
  supreme_commander: "#991f2d",
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

  const badge: BadgeDefinition = rawBadge || {
    id: "fallback",
    shape: "roundedSquare",
    symbol: "stars",
    symbolCount: 1,
    starLayout: "center",
    basePalette: "steel",
    framePalette: "#94a3b8",
    symbolPalette: "#e2e8f0",
    glossLevel: 1,
    embossDepth: 1,
  };

  const geometry = getRankBadgeGeometry(badge);
  const isV2Badge = geometry.visualFamily !== null;

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
  const filterLegacyShadow = `legacyShadow_${uid}`;
  const filterV2Shadow = `v2Shadow_${uid}`;

  const getLegacyBaseFill = () => {
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

  const getLegacySymbolFill = () => {
    if (badge.symbolPalette === "goldPlatinum") return `url(#${gradGoldPlatinum})`;
    if (badge.symbolPalette === "#facc15" || badge.symbolPalette === "#eab308") {
      return `url(#${gradGold})`;
    }
    return badge.symbolPalette;
  };

  const baseFill = geometry.visualFamily
    ? V2_BASE_COLORS[geometry.visualFamily]
    : getLegacyBaseFill();
  const goldFill = `url(#${gradGold})`;
  const frameFill =
    geometry.visualFamily === "guardian" || geometry.visualFamily === "supreme_commander"
      ? goldFill
      : isV2Badge
      ? "#f8fafc"
      : badge.framePalette;
  const symbolFill = isV2Badge ? goldFill : getLegacySymbolFill();

  const renderV2Ornament = () => {
    switch (geometry.ornament) {
      case "small_sprouts":
        return (
          <g>
            <circle
              cx={geometry.center.x}
              cy={geometry.center.y}
              r="30.5"
              fill="none"
              stroke="#f8fafc"
              strokeWidth="2.2"
            />
            <MirroredLaurel
              geometry={SMALL_SPROUT_GEOMETRY}
              color="#f8fafc"
              stemWidth={1.35}
            />
          </g>
        );
      case "mature_lower_laurel":
        return (
          <g>
            <circle
              cx={geometry.center.x}
              cy={geometry.center.y}
              r="30.5"
              fill="none"
              stroke="#f8fafc"
              strokeWidth="2.2"
            />
            <MirroredLaurel
              geometry={MATURE_LOWER_LAUREL_GEOMETRY}
              color="#f8fafc"
              stemWidth={LAUREL_VARIANTS.field.stemWidth}
            />
          </g>
        );
      case "closed_wreath": {
        const variant = geometry.visualFamily === "guardian" ? "endgame" : "general";
        return (
          <MirroredLaurel
            geometry={variant === "endgame" ? GUARDIAN_WREATH_GEOMETRY : CLOSED_WREATH_GEOMETRY}
            color={goldFill}
            stemWidth={LAUREL_VARIANTS[variant].stemWidth}
          />
        );
      }
      case "five_branch_star_wreath":
        return (
          <g>
            {FIVE_BRANCH_STAR_WREATH_GEOMETRY.map((branch, branchIndex) => (
              <g key={branchIndex}>
                <path
                  d={branch.stemPath}
                  fill="none"
                  stroke={goldFill}
                  strokeWidth="1.35"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {branch.leafPaths.map((path, leafIndex) => (
                  <path key={leafIndex} d={path} fill={goldFill} />
                ))}
              </g>
            ))}
          </g>
        );
      default:
        return null;
    }
  };

  const renderShape = () => {
    if (geometry.sideCount && geometry.outerPoints.length > 0) {
      return (
        <g>
          <polygon
            points={geometry.outerPointsAttribute}
            fill={baseFill}
            stroke={frameFill}
            strokeWidth={geometry.outerStrokeWidth}
            strokeLinejoin="round"
          />
          {renderV2Ornament()}
        </g>
      );
    }

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
        }
        if (barsCount === 2) {
          return (
            <g>
              <rect x="30" y="40" width="68" height="18" rx="4" fill={symbolFill} />
              <rect x="30" y="70" width="68" height="18" rx="4" fill={symbolFill} />
            </g>
          );
        }
        return (
          <g>
            <rect x="30" y="30" width="68" height="16" rx="3" fill={symbolFill} />
            <rect x="30" y="56" width="68" height="16" rx="3" fill={symbolFill} />
            <rect x="30" y="82" width="68" height="16" rx="3" fill={symbolFill} />
          </g>
        );
      }

      case "chevrons": {
        const count = badge.symbolCount;
        if (count === 1) {
          return (
            <path
              d="M 28 43 L 64 85 L 100 43 L 82 43 L 64 64 L 46 43 Z"
              fill={symbolFill}
            />
          );
        }
        if (count === 2) {
          return (
            <g>
              <path d="M 28 32 L 64 68 L 100 32 L 82 32 L 64 50 L 46 32 Z" fill={symbolFill} />
              <path d="M 28 60 L 64 96 L 100 60 L 82 60 L 64 78 L 46 60 Z" fill={symbolFill} />
            </g>
          );
        }
        return (
          <g>
            <path d="M 28 27 L 64 57 L 100 27 L 82 27 L 64 42 L 46 27 Z" fill={symbolFill} />
            <path d="M 28 49 L 64 79 L 100 49 L 82 49 L 64 64 L 46 49 Z" fill={symbolFill} />
            <path d="M 28 71 L 64 101 L 100 71 L 82 71 L 64 86 L 46 71 Z" fill={symbolFill} />
          </g>
        );
      }

      case "stars": {
        const cluster = getStarCluster({
          count: badge.symbolCount,
          center: geometry.center,
          availableRadius: geometry.safeStarRadius,
          starRadius: geometry.starRadius,
        });

        return (
          <g>
            {cluster.centers.map((center, index) => (
              <polygon
                key={index}
                points={getFivePointStarPoints(center, cluster.starRadius)}
                fill={symbolFill}
              />
            ))}
          </g>
        );
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
        preserveAspectRatio="xMidYMid meet"
        width={size}
        height={size}
        className={`w-full h-full transition-all duration-300 ${
          isLocked ? "opacity-35 grayscale filter" : isV2Badge ? "" : "drop-shadow-xl"
        }`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradSteel} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="40%" stopColor="#e2e8f0" />
            <stop offset="80%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id={gradCharcoal} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="35%" stopColor="#1e293b" />
            <stop offset="75%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id={gradSilver} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id={gradNavy} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="35%" stopColor="#0f172a" />
            <stop offset="75%" stopColor="#090d16" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id={gradGreen} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="35%" stopColor="#166534" />
            <stop offset="70%" stopColor="#14532d" />
            <stop offset="100%" stopColor="#052e16" />
          </linearGradient>
          <linearGradient id={gradSapphire} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="35%" stopColor="#1e40af" />
            <stop offset="70%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
          <linearGradient id={gradRuby} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#be123c" />
            <stop offset="35%" stopColor="#9f1239" />
            <stop offset="70%" stopColor="#881337" />
            <stop offset="100%" stopColor="#4c0519" />
          </linearGradient>
          <linearGradient id={gradObsidian} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="40%" stopColor="#1e293b" />
            <stop offset="80%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id={gradCrimson} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="30%" stopColor="#dc2626" />
            <stop offset="70%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>
          <linearGradient id={gradGold} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="52%" stopColor="#f6c945" />
            <stop offset="100%" stopColor="#d6a51d" />
          </linearGradient>
          <linearGradient id={gradGoldPlatinum} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <filter id={filterLegacyShadow} x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.6" />
          </filter>
          <filter id={filterV2Shadow} x="-12%" y="-12%" width="124%" height="124%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.8" floodColor="#000000" floodOpacity="0.34" />
          </filter>
        </defs>

        <g filter={`url(#${isV2Badge ? filterV2Shadow : filterLegacyShadow})`}>
          {renderShape()}
        </g>
        {renderSymbols()}
      </svg>
    </div>
  );
};
