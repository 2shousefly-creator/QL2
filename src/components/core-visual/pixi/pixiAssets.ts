import { Assets } from "pixi.js";
import type { Texture, Spritesheet } from "pixi.js";

export type PixiAssetDescriptor = { id: string; src: string; kind: "texture" | "spritesheet" };
export type PixiSpriteSheetDescriptor = PixiAssetDescriptor & { kind: "spritesheet" };
type SceneAsset = Texture | Spritesheet;
// Retain in the shared Assets cache: no scene may unload another scene's texture.
// Import this helper only from a lazy scene, and acquire only that scene's assets.
const pending = new Map<string, Promise<SceneAsset>>();
export async function loadPixiAssetBundle(descriptors: readonly PixiAssetDescriptor[]) {
  const entries = await Promise.all(descriptors.map(async ({ id, src }) => {
    let request = pending.get(src);
    if (!request) {
      request = Assets.load<SceneAsset>(src);
      pending.set(src, request);
      void request.finally(() => pending.delete(src)).catch(() => undefined);
    }
    try { return [id, await request] as const; }
    catch { return [id, null] as const; }
  }));
  return new Map<string, SceneAsset | null>(entries);
}
