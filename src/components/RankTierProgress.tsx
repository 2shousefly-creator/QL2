import React from "react";
import type { BadgeDefinition, TierCount } from "../game/types";
import {
  DEFAULT_RANK_BADGE_OUTER_WIDTH_RATIO,
  getRankBadgeOuterWidthRatio,
} from "./rankBadgeGeometry";

type RankTierProgressProps = {
  currentTier: number;
  tierCount: TierCount;
  badge?: BadgeDefinition;
  badgeSize?: number;
  size?: "hero" | "list" | "ceremony" | "sm" | "md";
  animateNewTier?: boolean;
  showSingleTier?: boolean;
  className?: string;
};

export const RankTierProgress: React.FC<RankTierProgressProps> = ({
  currentTier,
  tierCount,
  badge,
  badgeSize,
  size = "hero",
  animateNewTier = false,
  showSingleTier = false,
  className = "",
}) => {
  // Home keeps its existing multi-tier behavior; Uniform can opt into the
  // required single completed segment for Học Viên and Tổng Tư Lệnh.
  if (tierCount <= 1 && !showSingleTier) {
    return null;
  }

  // Height and sizing based on variant
  let heightClass = "h-3.5";
  if (size === "list" || size === "sm") heightClass = "h-2.5";
  if (size === "ceremony") heightClass = "h-4";

  const segments = Array.from({ length: tierCount }, (_, i) => i + 1);

  // The discrete tier bar shares the badge's exact visible outer-border metric.
  // Both siblings read the same responsive badge-size variable, so caller CSS
  // cannot resize one without the other.
  const outerWidthRatio = badge
    ? getRankBadgeOuterWidthRatio(badge)
    : DEFAULT_RANK_BADGE_OUTER_WIDTH_RATIO;
  const widthStyle: React.CSSProperties | undefined = badgeSize
    ? {
        width: `calc(var(--rank-badge-size, ${badgeSize}px) * ${outerWidthRatio})`,
      }
    : undefined;

  return (
    <div
      className={`relative z-10 mx-auto my-0 ${badgeSize ? "" : "w-full max-w-full"} ${className}`}
      style={widthStyle}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={tierCount}
      aria-valuenow={currentTier}
      aria-label={`Thanh bậc hiện tại: ${currentTier} trên ${tierCount}`}
    >
      <div className={`w-full ${heightClass} shadow-sm`}>
        <svg
          className="w-full h-full block"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox={`0 0 ${tierCount * 100} 100`}
          style={{ overflow: "visible" }}
        >
          {/* Discrete markers represent rank tiers rather than XP fill segments. */}
          {segments.map((tierNum, idx) => {
            const isLit = tierNum <= currentTier;
            const isNewlyLit = isLit && tierNum === currentTier && animateNewTier;

            return (
              <g key={tierNum} className={isNewlyLit ? "animate-pulse" : ""}>
                <rect
                  x={idx * 100}
                  y={0}
                  width={100}
                  height={100}
                  fill={isLit ? "var(--theme-progress, #fbbf24)" : "rgba(30, 41, 59, 0.85)"}
                />
                {/* Specular top highlight on lit nodes */}
                {isLit && (
                  <rect
                    x={idx * 100}
                    y={0}
                    width={100}
                    height={15}
                    fill="rgba(255, 255, 255, 0.4)"
                  />
                )}
              </g>
            );
          })}

          {/* Single shared black divider line between adjacent nodes */}
          {Array.from({ length: tierCount - 1 }, (_, i) => i + 1).map((divIdx) => (
            <line
              key={`div-${divIdx}`}
              x1={divIdx * 100}
              y1={0}
              x2={divIdx * 100}
              y2={100}
              stroke="#020617"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Outer Border matching divider stroke width */}
          <rect
            x={0}
            y={0}
            width={tierCount * 100}
            height={100}
            fill="none"
            stroke="#020617"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
};
