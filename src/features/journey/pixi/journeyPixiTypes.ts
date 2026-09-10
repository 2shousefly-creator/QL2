import type { StageThemeDefinition } from "../../../game/stageThemes";
export type JourneyPixiVisualProps = {
  theme: StageThemeDefinition;
  chapters: Array<{ id: string; status: "completed" | "current" | "upcoming"; progressPercent: number }>;
  currentChapterId: string;
};
export type JourneySceneProps = JourneyPixiVisualProps & { rowCenters: number[] };
// Logical anchors are deterministic by index; DOM row centers only project the
// vertical campaign bands into the existing variable-height document flow.
export const JOURNEY_MAP_LAYOUT = { width: 1000, bandHeight: 480, anchorX: [52, 92, 48, 88, 56, 94, 46, 82] } as const;
