import type { CombatWorld } from "../airCombatRuntime";
import type { AirframeArtwork, AirframePose } from "../airCombatArtwork";

export interface AirCombatPresentation {
  render(world: CombatWorld, delta: number, reducedMotion: boolean): void;
  destroy(): void;
}

export interface AtlasFrame {
  atlas: "aircraft" | "fortress" | "vfx" | "ammo" | "basicAmmo" | "healingCross";
  /** Normalized source rectangle, independent of generator output resolution. */
  rect: readonly [number, number, number, number];
}

export interface AircraftVisualDefinition {
  neutral: AtlasFrame;
  left: AtlasFrame;
  right: AtlasFrame;
  size: number;
  artwork: Record<AirframePose, AirframeArtwork>;
  tint: number;
}
