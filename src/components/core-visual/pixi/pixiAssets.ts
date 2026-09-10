import { Assets, Spritesheet, Texture } from "pixi.js";
import type { SpritesheetData } from "pixi.js";
import type { CoreSpriteSource, CoreSpriteStripData } from "./coreArtTypes";

export type PixiAssetDescriptor = { id: string; src: string; kind: "texture" | "spritesheet" };
export type PixiSpriteSheetDescriptor = PixiAssetDescriptor & { kind: "spritesheet" };
type SceneAsset = Texture | Spritesheet;
// Retain in the shared Assets cache: no scene may unload another scene's texture.
// Import this helper only from a lazy scene, and acquire only that scene's assets.
const pending = new Map<string, Promise<SceneAsset>>();
const retained = new Set<string>();
export async function loadPixiAssetBundle(descriptors: readonly PixiAssetDescriptor[]) {
  const entries = await Promise.all(descriptors.map(async ({ id, src }) => {
    try {
      retained.add(src);
      await unloading.get(src);
      let request = pending.get(src);
      if (!request) {
        request = Assets.load<SceneAsset>(src);
        pending.set(src, request);
        void request.finally(() => pending.delete(src)).catch(() => undefined);
      }
      return [id, await request] as const;
    }
    catch { return [id, null] as const; }
  }));
  return new Map<string, SceneAsset | null>(entries);
}

export type PixiAssetLease<T> = { value: T | null; release(): void };
type TextureEntry = { refs: number; owned: boolean; promise: Promise<Texture | null>; timer?: ReturnType<typeof setTimeout> };
const textures = new Map<string, TextureEntry>();
const unloading = new Map<string, Promise<void>>();
const idle = new Set<string>();
const evict = (src: string) => {
  const entry = textures.get(src);
  if (!entry || entry.refs) return;
  clearTimeout(entry.timer); idle.delete(src); textures.delete(src);
  // Serialize unload/reacquire for the same URL. Never destroy borrowed textures.
  const task = entry.promise.then(async value => { if (value && entry.owned && !retained.has(src)) await Assets.unload(src); }).catch(() => undefined);
  unloading.set(src, task);
  void task.then(() => { if (unloading.get(src) === task) unloading.delete(src); });
};
/** All production-art texture consumers must hold a lease for their display lifetime. */
export async function acquirePixiTexture(src: string): Promise<PixiAssetLease<Texture>> {
  let entry = textures.get(src);
  if (!entry) {
    const created: TextureEntry = { refs: 0, owned: false, promise: Promise.resolve(null) };
    created.promise = (async () => {
      try {
        await unloading.get(src);
        created.owned = !Assets.cache.has(src);
        const texture = await Assets.load<Texture>(src);
        return texture instanceof Texture && texture.width > 0 && texture.height > 0 ? texture : null;
      } catch { return null; }
    })();
    textures.set(src, created); entry = created;
  }
  entry.refs++; clearTimeout(entry.timer); idle.delete(src);
  let released = false;
  return { value: await entry.promise, release() {
    if (released) return; released = true;
    entry!.refs--;
    if (!entry!.refs) {
      idle.add(src); entry!.timer = setTimeout(() => evict(src), 15_000);
      // A short back-navigation cache, capped at two idle images rather than all scenes.
      while (idle.size > 2) evict(idle.values().next().value!);
    }
  } };
}

const jsonRequests = new Map<string, Promise<unknown>>();
async function loadJson(src: string) {
  let request = jsonRequests.get(src);
  if (!request) {
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 15_000);
    request = fetch(src, { signal: abort.signal }).then(response => {
      if (!response.ok) throw new Error("Unavailable art metadata"); return response.json();
    }).finally(() => clearTimeout(timeout));
    jsonRequests.set(src, request);
    void request.finally(() => jsonRequests.delete(src)).catch(() => undefined);
  }
  return request;
}
function sheetData(raw: SpritesheetData | CoreSpriteStripData, texture: Texture): SpritesheetData {
  if ("frameWidth" in raw) {
    const { frameWidth: w, frameHeight: h } = raw;
    if (!Number.isInteger(w) || !Number.isInteger(h) || w <= 0 || h <= 0 || w > texture.width || h > texture.height) throw new Error("Invalid strip size");
    const columns = Math.floor(texture.width / w), count = columns * Math.floor(texture.height / h);
    if (count > 512) throw new Error("Oversized strip");
    const frames: SpritesheetData["frames"] = {}, animations: Record<string, string[]> = {};
    for (const [name, animation] of Object.entries(raw.animations)) {
      if (!animation.frames.length || animation.frames.some(index => !Number.isInteger(index) || index < 0 || index >= count)) continue;
      animations[name] = animation.frames.map(index => {
        const key = `frame-${index}`;
        frames[key] = { frame: { x: index % columns * w, y: Math.floor(index / columns) * h, w, h } };
        return key;
      });
    }
    return { frames, animations, meta: { scale: 1 } };
  }
  if (!raw.frames || !raw.meta || Object.keys(raw.frames).length > 512) throw new Error("Invalid atlas");
  // Multi-packs would resolve unversioned URLs behind the manifest's back.
  if (raw.meta.related_multi_packs?.length) throw new Error("Use separate scene atlases");
  for (const value of Object.values(raw.frames)) {
    const f = value.frame;
    if (!f || ![f.x, f.y, f.w, f.h].every(Number.isFinite) || f.x < 0 || f.y < 0 || f.w <= 0 || f.h <= 0 || f.x + f.w > texture.width || f.y + f.h > texture.height) throw new Error("Invalid atlas frame");
  }
  return raw;
}
export type LoadedSpriteFrames = { frames: readonly Texture[]; fps?: number; loop?: boolean };
/** Image URL is explicitly imported by Vite; JSON's old meta.image is never fetched. */
export async function acquireSpriteFrames(source: CoreSpriteSource, animation: string): Promise<PixiAssetLease<LoadedSpriteFrames>> {
  const leases: PixiAssetLease<Texture>[] = [];
  let sheet: Spritesheet | undefined, released = false;
  const release = () => {
    if (released) return; released = true;
    sheet?.destroy(false); // Frame views only; the leased image source remains shared.
    leases.forEach(lease => lease.release());
  };
  try {
    if (source.kind === "textures") {
      const frames = source.textures;
      return { value: frames.length && frames.every(frame => frame instanceof Texture && !frame.destroyed) ? { frames } : null, release };
    }
    if (source.kind === "frames") {
      leases.push(...await Promise.all(source.urls.map(acquirePixiTexture)));
      const frames = leases.map(lease => lease.value);
      return { value: frames.length && frames.every((frame): frame is Texture => frame !== null) ? { frames: frames as Texture[] } : null, release };
    }
    const image = await acquirePixiTexture(source.imageSrc); leases.push(image);
    if (!image.value) return { value: null, release };
    const raw = ("data" in source ? source.data : await loadJson(source.jsonSrc)) as SpritesheetData | CoreSpriteStripData;
    sheet = new Spritesheet({ texture: image.value, data: sheetData(raw, image.value) });
    await sheet.parse();
    const frames = sheet.animations[animation];
    const settings = "frameWidth" in raw ? raw.animations[animation] : undefined;
    return { value: frames?.length ? { frames, fps: settings?.fps, loop: settings?.loop } : null, release };
  } catch { release(); return { value: null, release }; }
}
