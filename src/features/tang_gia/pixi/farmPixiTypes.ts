import type { StageThemeDefinition } from '../../../game/stageThemes';
import type { CropAssetStage } from '../tangGiaAssetManifest';
import type { CropId } from '../farmTypes';
import type { FarmWorldTextures } from './FarmWorldAssets';
export type FarmVisualEvent = { id: string; plotIndex: number; kind: 'harvest' | 'water' | 'fertilizer' | 'pest' | 'egg' | 'sow' | 'feed' | 'unlock'; startedAt: number; cropId?: CropId; fertilizerId?: string };
export type FarmAnchor = { x: number; y: number; radius: number; width: number; height: number };
export type FarmPlotVisual = { index: number; cropId: 'carrot' | 'tomato' | null; stage: CropAssetStage; moisture: number; ready: boolean; pest: boolean; fertilizer: boolean };
export type FarmAnimalVisual = { id: string; species: 'chicken' | 'duck'; dead: boolean; scale: number; eggReady: boolean; cycle: number };
export type FarmPixiVisualProps = {
  theme: StageThemeDefinition; weather: string; phase: 'day' | 'night'; weatherSeed: number;
  selectedPlotIndex: number | null; selectedAnimalId: string | null; contextMode: 'none' | 'garden' | 'pen';
  readyPlotIndices: readonly number[]; pestPlotIndices: readonly number[];
  plots: readonly FarmPlotVisual[]; animals: readonly FarmAnimalVisual[];
  feed: number; starving: boolean; eggCount: number; quality: 'low' | 'medium' | 'high';
  events: readonly FarmVisualEvent[]; anchors?: Readonly<Record<number, FarmAnchor>>; penAnchor?: FarmAnchor;
  onPlotTap(index: number): void; onPenTap(): void; onAnimalTap(id: string): void; onEggTap(): void;
};
export type FarmSceneProps = FarmPixiVisualProps & { textures: FarmWorldTextures };
