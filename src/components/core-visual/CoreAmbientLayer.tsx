import React from "react";
import { CoreVfx } from "./CoreVfx";
import type { CoreSceneVariant, CoreVfxType } from "./coreVisualTypes";

const RECIPES: Record<CoreSceneVariant, readonly CoreVfxType[]> = {
  home: ["haze", "glow", "dust"], journey: ["haze", "route"], farm: ["haze", "dust"],
  dossier: ["scan"], uniform: ["glow"], ranks: ["glow"], medals: ["dust"],
  mastery: ["scan"], journal: ["haze"], identity: ["glow"],
};
export function CoreAmbientLayer({ variant, density = "quiet", reducedMotion }: {
  variant: CoreSceneVariant; density?: "quiet" | "standard" | "none"; reducedMotion?: boolean;
}) {
  if (density === "none") return null;
  const effects = density === "quiet" ? RECIPES[variant].slice(0, 1) : RECIPES[variant];
  return <div className="core-ambient" aria-hidden="true">{effects.map(type => <CoreVfx key={type} type={type} reducedMotion={reducedMotion} />)}</div>;
}
