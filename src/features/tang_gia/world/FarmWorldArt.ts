import { Rectangle, Texture } from 'pixi.js';
import { acquirePixiTexture, type PixiAssetLease } from '../../../components/core-visual/pixi/pixiAssets';
import rawManifest from './farmWorldManifest.json';
export type FarmArtClip = { row: number; column?: number; frames: number; loop?: boolean; fps?: number };
type Atlas = { file: string; cell: number; size: number; columns: number; anchor: number[]; clips: Record<string, FarmArtClip> };
export const farmArtManifest = rawManifest as { revision: string; assets: Record<string, Atlas> };
export class FarmWorldArt {
  private leases = new Map<string, PixiAssetLease<Texture>>();
  private frames = new Map<string, Texture>();
  private pending = new Set<string>();
  private wanted = new Set<string>();
  private disposed = false;
  private retryEpoch = 0;
  failed = new Set<string>();
  constructor(private changed: () => void) {}
  request(ids: Set<string>) {
    this.wanted = ids;
    for (const [id, lease] of this.leases) if (!ids.has(id)) { for (const [key, texture] of this.frames) if (key.startsWith(id + ':')) { texture.destroy(false); this.frames.delete(key); } this.leases.delete(id); lease.release(); }
    for (const id of ids) {
      if (this.leases.has(id) || this.pending.has(id) || this.failed.has(id)) continue;
      const atlas = farmArtManifest.assets[id]; if (!atlas) { this.failed.add(id); continue; }
      this.pending.add(id);
      acquirePixiTexture(`${import.meta.env.BASE_URL}assets/tanggia/rework-2026-10/${atlas.file}${this.retryEpoch ? `?retry=${this.retryEpoch}` : ""}`).then(lease => {
        if (this.disposed || !this.wanted.has(id)) { lease.release(); return; }
        if (!lease.value) { this.failed.add(id); lease.release(); }
        else this.leases.set(id, lease);
        this.changed();
      }).catch(() => { this.failed.add(id); this.changed(); }).finally(() => this.pending.delete(id));
    }
  }
  frame(id: string, clip: string, index: number): Texture | undefined {
    const atlas = farmArtManifest.assets[id], source = this.leases.get(id)?.value;
    if (!atlas || !source) return;
    const definition = atlas.clips[clip]; if (!definition) return;
    const column = definition.loop === false ? Math.min(definition.frames - 1, Math.max(0, index)) : Math.max(0, index) % definition.frames;
    const key = `${id}:${clip}:${column}`;
    if (!this.frames.has(key)) this.frames.set(key, new Texture({ source: source.source, frame: new Rectangle((column + (definition.column ?? 0)) * atlas.cell + 2, definition.row * atlas.cell + 2, atlas.size, atlas.size) }));
    return this.frames.get(key);
  }
  prop(index: number) { return this.frame('environment', `prop${index}`, 0); }
  retry() { this.retryEpoch++; this.failed.clear(); this.request(this.wanted); }
  destroy() { this.disposed = true; this.frames.forEach(x => x.destroy(false)); this.frames.clear(); this.leases.forEach(x => x.release()); this.leases.clear(); }
}
