import type { CombatWorld } from "../airCombatRuntime";
import type { AirframeArtwork, AirframePose } from "../airCombatArtwork";

export interface AirCombatPresentation {
  render(world: CombatWorld, delta: number, reducedMotion: boolean): void;
  destroy(): void;
}

export interface AtlasFrame {
  atlas: "bigBangVfx" | "cinderAircraft" | "cinderVfx" | "cinderProjectiles" | "cinderIcons" | "cinderFeedback" | "stage4Enemy" | "stage4Boss" | "stage4Vfx" | "stage3Enemy" | "stage3Boss" | "stage3Vfx" | "stage3Emissive" | "ultimateVfx" | "rankedVfx" | "rankedProjectiles" | "equipmentIcons" | "equipmentVfx" | "astraVfx" | "astraAircraft" | "astraEffects" | "aircraft" | "fortress" | "vfx" | "ammo" | "basicAmmo" | "healingCross" | "stage2Enemy" | "stage2Vfx" | "stage2Elite";
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
