import type { AnimalTypeId, CropId, FeedTypeId, FertilizerTypeId } from '../farmTypes';

/** Original vector atlases authored at the mobile sprite size, rasterized by Pixi. */
export const CROP_FRAMES = ['seed_icon', 'seed_item', 'seeded', 'sprout', 'young', 'growing', 'mature', 'yield'] as const;
export const ANIMAL_STATES = ['idle', 'walk', 'eat', 'drink', 'rest', 'produce_ready', 'weak', 'dead'] as const;
export type AnimalArtState = typeof ANIMAL_STATES[number];
export const SOIL_STATES = ['locked', 'empty_dry', 'empty_moist', 'tilled_dry', 'tilled_moist', 'seeded', 'seeded_moist', 'fertilized', 'growing_stage_1', 'growing_stage_2', 'growing_stage_3', 'mature', 'ready_to_harvest', 'post_harvest_reset', 'selected'] as const;
export type SoilArtState = typeof SOIL_STATES[number];
export const PROP_NAMES = ['shelter', 'trough', 'water', 'nest', 'hay', 'bush', 'stone', 'flowers', 'watering', 'granule', 'drop', 'spark', 'coin', 'basket', 'store', 'herd'] as const;
const root = '/assets/tanggia/topdown-v3';
export const artFrame = (sheet: string, column = 0, row = 0) => `${root}/${sheet}.svg#frame=${column},${row}`;
export const cropArt = (id: CropId, stage: typeof CROP_FRAMES[number]) => artFrame(`crop-${id}`, CROP_FRAMES.indexOf(stage));
export const animalArt = (id: AnimalTypeId, state: AnimalArtState = 'idle', frame = 0) => artFrame(`animal-${id}`, frame % 6, ANIMAL_STATES.indexOf(state));
export const soilArt = (state: SoilArtState) => artFrame('soil', SOIL_STATES.indexOf(state) % 5, Math.floor(SOIL_STATES.indexOf(state) / 5));
export const propArt = (name: typeof PROP_NAMES[number]) => artFrame('props', PROP_NAMES.indexOf(name) % 8, Math.floor(PROP_NAMES.indexOf(name) / 8));
export const itemArt = (id: FeedTypeId | FertilizerTypeId | string) => artFrame(`item-${id}`);
