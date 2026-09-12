import { Rectangle, Texture } from 'pixi.js';
import { acquirePixiTexture } from '../../../components/core-visual/pixi/pixiAssets';
import type { PixiAssetLease } from '../../../components/core-visual/pixi/pixiAssets';
import { FARM_WORLD_ASSETS, TANG_GIA_ASSETS } from '../tangGiaAssetManifest';
import type { FarmMobileModel } from './mobileTypes';

const base = (path: string) => path.startsWith(import.meta.env.BASE_URL)
  ? path : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
export const mobileAssetUrl = (name: string) => base(`/assets/tanggia/mobile-v2/${name}.webp`);

/** Resident assets follow the active tab and open sheet, not the entire catalog. */
export function mobileSources(model: FarmMobileModel): Record<string, string> {
  const sources: Record<string, string> = {};
  const add = (path: string) => { sources[base(path)] = base(path); };
  const prefix = model.tab === 'garden' ? 'garden' : 'pen';
  add(mobileAssetUrl(`${prefix}-ground`)); add(mobileAssetUrl(`${prefix}-rear`));
  for (const path of Object.values(FARM_WORLD_ASSETS.vfx)) add(path);
  if (model.tab === 'garden') {
    for (const path of Object.values(TANG_GIA_ASSETS.soil)) add(path);
    for (const plot of model.snapshot.plots) if (plot.cropId) add(TANG_GIA_ASSETS.crops[plot.cropId][plot.stage]);
  } else {
    for (const path of Object.values(FARM_WORLD_ASSETS.pen)) add(path);
    for (const animal of model.snapshot.animals) {
      if (animal.species === 'chicken' || animal.species === 'duck') add(FARM_WORLD_ASSETS.animals[animal.species]);
    }
  }
  for (const row of model.sheet?.rows ?? []) if (row.icon) add(row.icon);
  for (const event of model.events) {
    if (event.kind === 'sow' && event.cropId) add(TANG_GIA_ASSETS.crops[event.cropId].seed);
  }
  return sources;
}

/** Per-mount ownership. A late result cannot repopulate a destroyed scene. */
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
  get(path: string) { return this.textures.get(base(path)); }
  bird(species: 'chicken' | 'duck', row: number, column: number): Texture | undefined {
    const url = base(FARM_WORLD_ASSETS.animals[species]), source = this.textures.get(url);
    if (!source) return undefined;
    const key = `${url}#${row}:${column}`;
    if (!this.frames.has(key)) this.frames.set(key, new Texture({ source: source.source,
      frame: new Rectangle(column * source.width / 6, row * source.height / 4, source.width / 6, source.height / 4) }));
    return this.frames.get(key);
  }
  retry() { this.failed.clear(); this.request(Object.fromEntries([...this.desired].map(url => [url, url]))); }
  destroy() {
    this.disposed = true;
    this.frames.forEach(frame => frame.destroy(false)); this.frames.clear();
    this.leases.forEach(lease => lease.release()); this.leases.clear(); this.textures.clear();
  }
}
