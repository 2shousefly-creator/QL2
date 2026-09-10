import type { CSSProperties, ReactNode } from "react";

export type CoreSceneVariant = "home" | "journey" | "farm" | "dossier" | "uniform" | "ranks" | "medals" | "mastery" | "journal" | "identity";
export type CoreVfxType = "glow" | "dust" | "scan" | "pulse" | "shine" | "haze" | "spark" | "route";
export type CoreMaterial = "steel" | "dossier" | "ceremonial" | "record";
/** A future image/sprite-sheet can be supplied without changing the screen tree. */
export type CoreSceneLayer = {
  id: string;
  depth: "background" | "midground" | "foreground";
  src?: string;
  node?: ReactNode;
  className?: string;
  style?: CSSProperties;
};
