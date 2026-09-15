import type { AircraftId } from "./airCombatTypes";

export type AirframePose = "neutral" | "left" | "right";
export interface AirframeArtwork {
  /** Presentation-only horizontal compensation; vertical mounts stay unchanged. */
  scaleX: number;
  anchorX: number;
}

// aircraft-atlas.png: 1254 x 1254. Match the renderer's rounded cell edges.
// Bounds use alpha > 16/255 to exclude almost-invisible export speckles.
// [cell width, visible left, visible right (inclusive)] for all nine poses.
const bounds: Record<AircraftId, Record<AirframePose, readonly [number, number, number]>> = {
  black_eagle: { neutral: [314, 58, 255], left: [313, 97, 272], right: [314, 41, 215] },
  breaker: { neutral: [314, 17, 297], left: [313, 41, 299], right: [314, 13, 271] },
  phantom: { neutral: [314, 29, 285], left: [313, 46, 287], right: [314, 25, 266] },
};
const referenceWidthRatio = 198 / 314; // Viper neutral; unchanged at scaleX = 1.
const normalize = ([width, left, right]: readonly [number, number, number]): AirframeArtwork => ({
  scaleX: referenceWidthRatio * width / (right - left + 1),
  anchorX: (left + right + 1) / (2 * width),
});
const poses = (id: AircraftId): Record<AirframePose, AirframeArtwork> => ({
  neutral: normalize(bounds[id].neutral), left: normalize(bounds[id].left), right: normalize(bounds[id].right),
});
/** Fixed reference visible width for every pose; no frame-dependent size pumping.
 * Never import this artwork compensation into collision or movement code. */
export const PLAYER_ARTWORK: Record<AircraftId, Record<AirframePose, AirframeArtwork>> = {
  black_eagle: poses("black_eagle"), breaker: poses("breaker"), phantom: poses("phantom"),
};
