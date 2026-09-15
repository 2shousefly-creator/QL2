import type { CombatWorld } from "../airCombatRuntime";

export interface AirCombatPresentation {
  render(world: CombatWorld, delta: number, reducedMotion: boolean): void;
  destroy(): void;
}

export interface AtlasFrame {
  atlas: "aircraft" | "fortress" | "vfx" | "ammo";
  /** Normalized source rectangle, independent of generator output resolution. */
  rect: readonly [number, number, number, number];
}

export interface AircraftVisualDefinition {
  neutral: AtlasFrame;
  left: AtlasFrame;
  right: AtlasFrame;
  size: number;
  tint: number;
}
