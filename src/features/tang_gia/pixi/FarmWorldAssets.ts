import { Rectangle, Texture } from 'pixi.js';
import { acquirePixiTexture } from '../../../components/core-visual/pixi/pixiAssets';
import { FARM_WORLD_ASSETS, TANG_GIA_ASSETS } from '../tangGiaAssetManifest';
import type { FarmPixiVisualProps } from './farmPixiTypes';
export type FarmWorldTextures = Map<string, Texture>;
export function worldAssetSources(props: FarmPixiVisualProps) {
  const result: Record<string, string> = {};
  for (const [group, assets] of Object.entries(FARM_WORLD_ASSETS)) {
    if (group === 'animals') continue;
    for (const [name, src] of Object.entries(assets)) result[`${group}.${name}`] = src;
  }
  for (const [name, src] of Object.entries(TANG_GIA_ASSETS.soil)) result[`soil.${name}`] = src;
  for (const crop of new Set(props.plots.map(p => p.cropId))) {
    if (crop) for (const [stage, src] of Object.entries(TANG_GIA_ASSETS.crops[crop])) result[`crop.${crop}.${stage}`] = src;
  }
  for (const species of new Set(props.animals.map(a => a.species))) result[`animal.${species}`] = FARM_WORLD_ASSETS.animals[species];
  return result;
}
export async function loadWorldTextures(sources: Record<string, string>) {
  const entries = await Promise.all(Object.entries(sources).map(async ([key, src]) => ({ key, lease: await acquirePixiTexture(src) })));
  const textures: FarmWorldTextures = new Map();
  const frames: Texture[] = [];
  const release = () => { frames.forEach(t => t.destroy(false)); entries.forEach(e => e.lease.release()); };
  if (entries.some(e => !e.lease.value)) { release(); throw new Error('Farm world asset unavailable'); }
  for (const { key, lease } of entries) {
    const texture = lease.value!; textures.set(key, texture);
    if (key.startsWith('animal.')) for (let row = 0; row < 4; row++) for (let column = 0; column < 6; column++) {
      const frame = new Texture({ source: texture.source, frame: new Rectangle(column * 256, row * 256, 256, 256) });
      frames.push(frame); textures.set(`${key}.${row}.${column}`, frame);
    }
  }
  return { textures, release };
}
