import React from "react";
import { TROOP_BY_TYPE } from "../troopCatalog";
import type { TroopType } from "../types";

interface TroopIconProps {
  troopType: TroopType;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  className?: string;
  /** Omit for a decorative icon when surrounding UI already names the troop. */
  accessibleLabel?: string;
}

const SIZE_CLASS = {
  small: "h-8 w-8 text-base rounded-xl",
  medium: "h-11 w-11 text-xl rounded-2xl",
  large: "h-16 w-16 text-3xl rounded-[1.25rem]",
} as const;

export const TroopIcon: React.FC<TroopIconProps> = ({
  troopType,
  size = "medium",
  showLabel = false,
  className = "",
  accessibleLabel,
}) => {
  const troop = TROOP_BY_TYPE[troopType];
  const decorative = !showLabel && !accessibleLabel;
  return (
    <span
      className={`inline-flex min-w-0 items-center gap-2 ${className}`}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={accessibleLabel}
      role={accessibleLabel ? "img" : undefined}
    >
      <span
        className={`relative inline-flex shrink-0 items-center justify-center border-2 border-white/70 bg-white shadow-[0_5px_0_rgba(15,23,42,.18)] ${SIZE_CLASS[size]}`}
        style={{ boxShadow: `0 5px 0 color-mix(in srgb, ${troop.color} 45%, #0f172a 25%)`, background: `color-mix(in srgb, ${troop.color} 18%, white)` }}
        aria-hidden="true"
      >
        {troop.icon}
      </span>
      {showLabel && <span className="truncate text-xs font-black text-slate-800">{troop.shortName}</span>}
    </span>
  );
};
