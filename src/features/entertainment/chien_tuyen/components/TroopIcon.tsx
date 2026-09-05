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
  state?: "normal" | "selected" | "active" | "targetable" | "disabled" | "defeated" | "ally" | "enemy";
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
  state = "normal",
}) => {
  const troop = TROOP_BY_TYPE[troopType];
  const decorative = !showLabel && !accessibleLabel;
  return (
    <span
      className={`ct-v2-troop-icon-wrap inline-flex min-w-0 items-center gap-2 ${className}`}
      data-troop-icon-state={state}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={accessibleLabel}
      role={accessibleLabel ? "img" : undefined}
    >
      <span
        className={`ct-v2-troop-icon relative inline-flex shrink-0 items-center justify-center border-2 ${SIZE_CLASS[size]}`}
        style={{ "--ct-troop-color": troop.color } as React.CSSProperties}
        aria-hidden="true"
      >
        <span className="ct-v2-troop-icon__glyph">{troop.icon}</span>
        {state !== "normal" && (
          <span className="ct-v2-troop-icon__state">
            {state === "selected" ? "✓" : state === "active" ? "!" : state === "targetable" ? "◎" : state === "disabled" ? "×" : state === "defeated" ? "☠" : state === "ally" ? "A" : "Đ"}
          </span>
        )}
      </span>
      {showLabel && <span className="truncate text-xs font-black text-slate-100">{troop.shortName}</span>}
    </span>
  );
};
