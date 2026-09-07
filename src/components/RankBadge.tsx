import React, { useState } from "react";
import type { BadgeDefinition } from "../game/types";
import { RANK_FAMILIES } from "../game/rankFamilies";
import {
  DEFAULT_RANK_BADGE_OUTER_WIDTH_RATIO,
  getRankBadgeAsset,
} from "../game/rankBadgeAssets";

type RankBadgeProps = {
  badge: BadgeDefinition;
  size?: number;
  isLocked?: boolean;
  isCurrent?: boolean;
  className?: string;
  ariaLabel?: string;
};

export const RankBadge: React.FC<RankBadgeProps> = ({
  badge,
  size = 128,
  isLocked = false,
  isCurrent = false,
  className = "",
  ariaLabel,
}) => {
  const asset = getRankBadgeAsset(badge?.id);
  const [failedSrc, setFailedSrc] = useState<string>();
  const familyName = RANK_FAMILIES.find((family) => family.badge.id === badge?.id)?.name;
  const hasImage = asset && asset.src !== failedSrc;
  const label = ariaLabel || (familyName ? `Huy hiệu ${familyName}` : "Huy hiệu chưa có ảnh");
  const classes = new Set(className.split(/\s+/).filter(Boolean));
  if (isCurrent && !isLocked) classes.add("theme-rank-glow");

  return (
    <div
      className={`relative z-0 inline-flex min-w-0 shrink-0 items-center justify-center select-none ${[...classes].join(" ")}`}
      style={{
        width: `var(--rank-badge-size, ${size}px)`,
        height: `var(--rank-badge-size, ${size}px)`,
        aspectRatio: "1 / 1",
      }}
      role="img"
      aria-label={label}
    >
      {hasImage ? (
        <img
          src={asset.src}
          width={224}
          height={224}
          alt=""
          aria-hidden="true"
          draggable={false}
          onError={() => setFailedSrc(asset.src)}
          className={`block h-full w-full object-contain transition-all duration-300 ${
            isLocked ? "opacity-35 grayscale" : ""
          }`}
          style={{ imageRendering: "auto" }}
        />
      ) : (
        <span
          aria-hidden="true"
          style={{
            width: `${DEFAULT_RANK_BADGE_OUTER_WIDTH_RATIO * 100}%`,
            height: `${DEFAULT_RANK_BADGE_OUTER_WIDTH_RATIO * 100}%`,
          }}
          className={`flex items-center justify-center border border-dashed border-slate-400 bg-slate-800/30 text-slate-400 ${
            isLocked ? "opacity-35" : ""
          }`}
        >
          ?
        </span>
      )}
    </div>
  );
};
