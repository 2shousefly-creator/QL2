import type { StageThemeDefinition } from "../../../game/stageThemes";
export type ArchiveVariant = "dossier" | "ranks" | "medals" | "mastery" | "journal" | "identity" | "uniform";
export type ArchivePixiVisualProps = {
  variant: ArchiveVariant;
  theme: StageThemeDefinition;
  transitionKey?: string;
  glow?: string;
  focalY?: number;
};
