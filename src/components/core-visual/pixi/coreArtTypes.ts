import type { BLEND_MODES, SpritesheetData, Texture } from "pixi.js";
import type { JourneyStageThemeId } from "../../../game/types";

export type CoreArtSceneId = "home" | "journey" | "farm" | "uniform" | "archive" | "training" | "entertainment";
export type CoreArchiveVariant = "dossier" | "ranks" | "medals" | "mastery" | "journal" | "identity";
export type CoreArtSelection = { sceneId: CoreArtSceneId; themeId: JourneyStageThemeId; variant?: CoreArchiveVariant | "day" | "night" };
export type CoreArtPoint = { x: number; y: number };
export type CoreArtDepth = "background" | "midground" | "foreground";
export type CoreArtPlacement = {
  depth: CoreArtDepth;
  /** Normalized viewport position and texture pivot; center is portrait-crop safe. */
  position?: CoreArtPoint;
  anchor?: CoreArtPoint;
  opacity?: number;
  parallax?: number;
  tint?: number | "theme";
  blendMode?: Extract<BLEND_MODES, "normal" | "add" | "multiply" | "screen">;
};
export type CoreArtLayerDescriptor = CoreArtPlacement & { id: string; src: string | null; fit: "cover" | "contain" };
/** The Asset Bible's regular left-to-right strip/grid metadata. */
export type CoreSpriteStripData = {
  id: string; image?: string; frameWidth: number; frameHeight: number;
  animations: Record<string, { frames: number[]; fps: number; loop: boolean }>;
};
export type CoreSpriteSource =
  | { kind: "textures"; textures: readonly Texture[] }
  | { kind: "frames"; urls: readonly string[] }
  | { kind: "spritesheet"; imageSrc: string; jsonSrc: string }
  | { kind: "spritesheet"; imageSrc: string; data: SpritesheetData | CoreSpriteStripData };
export type CoreSpriteAnimationDescriptor = CoreArtPlacement & {
  id: string; source: CoreSpriteSource | null; animation: string;
  fps?: number; loop?: boolean; scale?: number; staticFrame?: number;
};
export type CoreArtEffectId = "water" | "harvest" | "fertilizer" | "pest" | "rain-splash";
export type CoreArtSceneManifest = {
  sceneId: CoreArtSceneId;
  version: 1;
  layers: readonly (CoreArtLayerDescriptor | null)[];
  animations: readonly (CoreSpriteAnimationDescriptor | null)[];
  /** Preloaded only with the active scene; effects play on presentation events. */
  vfx?: Partial<Record<CoreArtEffectId, CoreSpriteAnimationDescriptor | null>>;
};
