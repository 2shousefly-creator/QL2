import { Rectangle, Texture } from 'pixi.js';
import { UI_SKIN_URLS } from '../../../components/core-visual/pixi/UiSkinAtlas';
import { acquirePixiTexture } from '../../../components/core-visual/pixi/pixiAssets';
import type { PixiAssetLease } from '../../../components/core-visual/pixi/pixiAssets';
import { animalArt, cropArt, propArt, soilArt, itemArt } from './FarmArtRegistry';
import type { AnimalArtState } from './FarmArtRegistry';
import type { AnimalTypeId } from '../farmTypes';
import type { FarmMobileModel } from './mobileTypes';

const base = (path: string) => path.startsWith(import.meta.env.BASE_URL)
  ? path : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
const sourceUrl = (path: string) => base(path.split('#')[0]);

/** Lease both sections of the continuous world; only occupied crop/species atlases. */
export function mobileSources(model: FarmMobileModel): Record<string, string> {
  const sources: Record<string, string> = {};
  const add = (path: string) => { const url = sourceUrl(path); sources[url] = url; };
  if (model.sheet) Object.values(UI_SKIN_URLS).forEach(add);
  add(propArt('bush'));
  add(soilArt('empty_dry'));
  for (const plot of model.snapshot.plots) if (plot.cropId) add(cropArt(plot.cropId, plot.artStage));
  add(itemArt('chicken_egg'));
  for (const animal of model.snapshot.animals) { add(animalArt(animal.species)); add(itemArt(`${animal.species}_egg`)); }
  for (const row of model.sheet?.rows ?? []) if (row.icon) add(row.icon);
  for (const action of model.toolbar) if (action.icon) add(action.icon);
  for (const event of model.events) if (event.cropId) add(cropArt(event.cropId, 'yield'));
  return sources;
}

/** Own frame views separately from leased sources. Asset errors cannot mutate gameplay. */
export class MobileTextureBank {
  readonly textures = new Map<string, Texture>();
  readonly failed = new Set<string>();
  private leases = new Map<string, PixiAssetLease<Texture>>();
  private frames = new Map<string, Texture>();
  private requests = new Map<string, Promise<void>>();
  private desired = new Set<string>();
  private disposed = false;
  constructor(private changed: () => void) {}
  request(sources: Record<string, string>) {
    this.desired = new Set(Object.values(sources));
    for (const url of this.failed) if (!this.desired.has(url)) this.failed.delete(url);
    for (const [url, lease] of this.leases) if (!this.desired.has(url)) {
      for (const [key, frame] of this.frames) if (key.startsWith(`${url}#`)) { frame.destroy(false); this.frames.delete(key); }
      this.textures.delete(url); this.leases.delete(url); lease.release();
    }
    for (const url of this.desired) {
      if (this.leases.has(url) || this.requests.has(url) || this.failed.has(url)) continue;
      const request = acquirePixiTexture(url).then(lease => {
        if (this.disposed || !this.desired.has(url)) { lease.release(); return; }
        if (!lease.value) { lease.release(); this.failed.add(url); }
        else { this.leases.set(url, lease); this.textures.set(url, lease.value); }
        this.changed();
      }).finally(() => this.requests.delete(url));
      this.requests.set(url, request);
    }
  }
  get(path: string): Texture | undefined {
    const url = sourceUrl(path), source = this.textures.get(url);
    if (!source) return undefined;
    const frame = path.split('#frame=')[1];
    if (!frame) return source;
    const key = `${url}#${frame}`;
    if (!this.frames.has(key)) {
      const [column, row] = frame.split(',').map(Number);
      if (![column, row].every(value => Number.isInteger(value) && value >= 0)
        || (column + 1) * 96 > source.width || (row + 1) * 96 > source.height) return undefined;
      this.frames.set(key, new Texture({ source: source.source, frame: new Rectangle(column * 96, row * 96, 96, 96) }));
    }
    return this.frames.get(key);
  }
  bird(species: AnimalTypeId, state: AnimalArtState, frame: number) { return this.get(animalArt(species, state, frame)); }
  retry() { this.failed.clear(); this.request(Object.fromEntries([...this.desired].map(url => [url, url]))); }
  destroy() {
    this.disposed = true;
    this.frames.forEach(frame => frame.destroy(false)); this.frames.clear();
    this.leases.forEach(lease => lease.release()); this.leases.clear(); this.textures.clear();
  }
}
