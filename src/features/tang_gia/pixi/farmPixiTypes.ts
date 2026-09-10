import type { StageThemeDefinition } from "../../../game/stageThemes";
export type FarmVisualEvent = { id: string; plotIndex: number; kind: "harvest" | "water" | "fertilizer"; startedAt: number };
export type FarmAnchor = { x: number; y: number; radius: number };
export type FarmPixiVisualProps = {
  theme: StageThemeDefinition;
  weather: string;
  phase: "day" | "night";
  weatherSeed: number;
  selectedPlotIndex: number | null;
  readyPlotIndices: readonly number[];
  pestPlotIndices: readonly number[];
  events: readonly FarmVisualEvent[];
  anchors?: Readonly<Record<number, FarmAnchor>>;
  penAnchor?: FarmAnchor;
};
