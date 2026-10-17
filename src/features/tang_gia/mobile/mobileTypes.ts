import type { CropAssetStage } from '../tangGiaAssetManifest';
import type { AnimalTypeId, CropId, ItemQuality } from '../farmTypes';
import type { FarmVisualEvent } from '../pixi/farmPixiTypes';
import type { CROP_FRAMES } from './FarmArtRegistry';

export type FarmMobileTab = 'garden' | 'pen';
export type MobileRect = { x: number; y: number; width: number; height: number };
export type MobileAction = { id: string; label: string; run(): void; reason?: string; primary?: boolean; icon?: string };
export type MobileRow = { id: string; title: string; detail?: string; icon?: string; accent?: string; action?: MobileAction };
export type MobileSheet = { id: string; title: string; description?: string; rows: MobileRow[]; tabs?: MobileAction[]; actions?: MobileAction[]; close(): void };
export type MobilePlot = {
  index: number; status: 'locked' | 'empty' | 'growing' | 'ready';
  cropId: CropId | null; stage: CropAssetStage; title: string; timer: string;
  artStage: typeof CROP_FRAMES[number];
  moisture: number; moistureLabel: string; thirsty: boolean; fertilizer: boolean; pest: boolean;
  quality?: ItemQuality; plantedAt?: number; detail?: string; rewardLabel?: string;
};
export type MobileAnimal = { id: string; species: AnimalTypeId; title: string; timer: string; lifeRemaining: string; lifeRatio: number; dead: boolean; weak: boolean; scale: number; storedEggs: number };
export type FarmMobileSnapshot = {
  worker?: import("../farmWorkerTypes").FarmWorkerState;
  now: number;
  gold: string; xp: number; weatherLabel: string; weatherDescription: string;
  weather: string; phase: 'day' | 'night'; plots: readonly MobilePlot[];
  animals: readonly MobileAnimal[]; feed: number; feedLabel: string; feedRemaining: string;
  feedBonus: number; dangerRemaining: string | null; dangerRatio: number; capacity: number; eggs: number;
};
export type FarmMobileModel = {
  blocked?: boolean; pushTarget?: { section: FarmMobileTab; nonce: number } | null;
  snapshot: FarmMobileSnapshot; tab: FarmMobileTab; selectedPlot: number | null;
  selectedAnimal: string | null; sheet: MobileSheet | null; toast: string | null;
  quality: 'low' | 'medium' | 'high'; events: readonly FarmVisualEvent[];
  selectTab(tab: FarmMobileTab): void; selectPlot(index: number): void;
  selectAnimal(id: string): void; openPen(): void; openTrough(): void;
  openWeather(): void; openEggs(): void; toolbar: MobileAction[];
};
export type MobileHit = MobileRect & { action: MobileAction; scroll?: boolean };
