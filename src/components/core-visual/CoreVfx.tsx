import React from "react";
import type { CoreVfxType } from "./coreVisualTypes";

type CoreVfxProps = {
  type: CoreVfxType;
  intensity?: "low" | "medium";
  reducedMotion?: boolean;
  themeAware?: boolean;
  className?: string;
};
/** At most six motes; all animation is CSS opacity/transform, never React frames. */
export const CoreVfx: React.FC<CoreVfxProps> = ({ type, intensity = "low", reducedMotion, themeAware = true, className = "" }: CoreVfxProps) => {
  return (
    <div aria-hidden="true" data-core-motion={reducedMotion ? "reduced" : undefined}
      data-intensity={intensity} data-theme-aware={themeAware}
      className={`core-vfx core-vfx--${type} ${className}`}>
      {(type === "dust" || type === "spark") && Array.from({ length: type === "spark" ? 4 : 6 }, (_, i) => <i key={i} />)}
    </div>
  );
}
