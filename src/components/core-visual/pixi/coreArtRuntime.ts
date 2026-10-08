import { Container, Sprite } from "pixi.js";
import type { Application } from "pixi.js";
import { loadCoreArtManifest } from "./coreArtRegistry";
import { acquirePixiTexture, acquireSpriteFrames } from "./pixiAssets";
import type { LoadedSpriteFrames, PixiAssetLease } from "./pixiAssets";
import { createPixiSpriteActor } from "./PixiSpriteActor";
import type { PixiSpriteActor } from "./PixiSpriteActor";
import type { CoreArtEffectId, CoreArtLayerDescriptor, CoreArtPlacement, CoreArtSelection, CoreSpriteAnimationDescriptor } from "./coreArtTypes";

const depth = { background: 0, midground: 10, foreground: 20 };
const clamp = (value: number, min: number, max: number) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : min;
type Layer = { sprite: Sprite; descriptor: CoreArtLayerDescriptor; fade: number };
type Ambient = { actor: PixiSpriteActor; descriptor: CoreSpriteAnimationDescriptor; fade: number };
type Effect = { actor: PixiSpriteActor; age: number; x: number; y: number };
type Pack = {
  root: Container; layers: Layer[]; ambient: Ambient[]; effects: Effect[];
  effectsData: Map<CoreArtEffectId, { descriptor: CoreSpriteAnimationDescriptor; data: LoadedSpriteFrames }>;
  leases: PixiAssetLease<unknown>[]; disposed: boolean;
};

/** Optional enhancement below procedural/UI layers. Uses the owning scene's clock. */
export function createCoreArtRuntime(app: Application, parent: Container) {
  let settleReady: (ready: boolean) => void = () => {};
  const ready = new Promise<boolean>(resolve => { settleReady = resolve; });
  const plane = new Container(); plane.eventMode = "none"; parent.addChildAt(plane, 0);
  let pack: Pack | undefined, key = "", generation = 0, destroyed = false;
  let width = 1, height = 1, reduced = false, time = 0, themeTint = 0xffffff;
  const dispose = (value: Pack | undefined) => {
    if (!value || value.disposed) return; value.disposed = true;
    value.ambient.forEach(item => item.actor.destroy());
    value.effects.forEach(item => item.actor.destroy());
    value.root.destroy({ children: true, texture: false, textureSource: false });
    value.leases.forEach(lease => lease.release()); value.leases.length = 0;
  };
  const style = (sprite: Sprite, descriptor: CoreArtPlacement) => {
    sprite.eventMode = "none"; sprite.zIndex = depth[descriptor.depth];
    sprite.tint = descriptor.tint === "theme" ? themeTint : descriptor.tint ?? 0xffffff;
    sprite.blendMode = descriptor.blendMode ?? "normal";
  };
  const position = (sprite: Sprite, descriptor: CoreArtPlacement) => {
    const drift = reduced ? 0 : clamp(descriptor.parallax ?? 0, 0, 12);
    sprite.position.set(width * (descriptor.position?.x ?? .5) + Math.sin(time * .12) * drift,
      height * (descriptor.position?.y ?? .5) + Math.cos(time * .09) * drift * .4);
  };
  const layout = (value: Pack) => {
    for (const { sprite, descriptor } of value.layers) {
      const overscan = descriptor.fit === "cover" ? clamp(descriptor.parallax ?? 0, 0, 12) * 2 : 0;
      const fit = descriptor.fit === "cover" ? Math.max : Math.min;
      const scale = fit((width + overscan) / sprite.texture.width, (height + overscan) / sprite.texture.height);
      sprite.scale.set(scale); sprite.anchor.set(descriptor.anchor?.x ?? .5, descriptor.anchor?.y ?? .5);
      style(sprite, descriptor); position(sprite, descriptor);
    }
    for (const { actor, descriptor } of value.ambient) { style(actor.sprite, descriptor); position(actor.sprite, descriptor); }
  };
  const renderStatic = () => {
    // Async assets must appear even while the shared ticker is stopped for reduced motion.
    if (destroyed || !reduced) return;
    try { app.render(); } catch { /* Shared WebGL loss handling restores the screen fallback. */ }
  };
  const load = async (selection: CoreArtSelection, request: number) => {
    const manifest = await loadCoreArtManifest(selection);
    if (destroyed || request !== generation) return;
    if (!manifest) { settleReady(false); return; }
    const next: Pack = { root: new Container(), layers: [], ambient: [], effects: [], effectsData: new Map(), leases: [], disposed: false };
    next.root.sortableChildren = true; next.root.eventMode = "none";
    dispose(pack); pack = next; plane.addChild(next.root);
    const active = () => !destroyed && request === generation && !next.disposed;
    const retain = <T,>(lease: PixiAssetLease<T>) => {
      if (!active()) { lease.release(); return false; }
      next.leases.push(lease); return true;
    };
    const publish = () => {
      if (!active()) return;
      layout(next);
      next.layers.forEach(item => { item.sprite.alpha = item.fade * clamp(item.descriptor.opacity ?? 1, 0, 1); });
      next.ambient.forEach(item => { item.actor.sprite.alpha = item.fade * clamp(item.descriptor.opacity ?? 1, 0, 1); });
      renderStatic();
    };
    // Each asset succeeds independently; one broken overlay never hides the fallback.
    const tasks: Promise<void>[] = [];
    for (const descriptor of manifest.layers.slice(0, 8)) {
      if (!descriptor?.src) continue;
      tasks.push((async () => {
        const lease = await acquirePixiTexture(descriptor.src!);
        if (!retain(lease) || !lease.value) return;
        const sprite = new Sprite(lease.value);
        next.root.addChild(sprite); next.layers.push({ sprite, descriptor, fade: reduced ? 1 : 0 });
        publish();
      })());
    }
    for (const descriptor of manifest.animations.slice(0, 12)) {
      if (!descriptor?.source) continue;
      tasks.push((async () => {
        const lease = await acquireSpriteFrames(descriptor.source!, descriptor.animation);
        if (!retain(lease) || !lease.value) return;
        const actor = createPixiSpriteActor(lease.value, descriptor);
        if (!actor) return;
        actor.setReducedMotion(reduced); actor.start();
        next.root.addChild(actor.sprite); next.ambient.push({ actor, descriptor, fade: reduced ? 1 : 0 });
        publish();
      })());
    }
    for (const [id, descriptor] of Object.entries(manifest.vfx ?? {}).slice(0, 5)) {
      if (!descriptor?.source) continue;
      tasks.push((async () => {
        const lease = await acquireSpriteFrames(descriptor.source!, descriptor.animation);
        if (retain(lease) && lease.value) next.effectsData.set(id as CoreArtEffectId, { descriptor, data: lease.value });
      })());
    }
    await Promise.allSettled(tasks);
    if (!active()) { dispose(next); return; }
    publish();
    settleReady(next.layers.length > 0 && next.layers.length === manifest.layers.filter(layer => layer?.src).length);
  };
  return {
    ready,
    update(selection: CoreArtSelection, tint: number) {
      themeTint = tint;
      const nextKey = `${selection.sceneId}/${selection.themeId}/${selection.variant ?? ""}`;
      if (key === nextKey) { if (pack) layout(pack); return; }
      key = nextKey; const request = ++generation;
      // Do not show a previous chapter/day's art while the new selection loads.
      dispose(pack); pack = undefined;
      void load(selection, request).catch(() => { settleReady(false); });
    },
    resize(w: number, h: number) { width = Math.max(1, w); height = Math.max(1, h); if (pack) layout(pack); },
    setReducedMotion(value: boolean) {
      reduced = value;
      if (!pack) return;
      pack.ambient.forEach(item => { item.actor.setReducedMotion(value); if (value) { item.fade = 1; item.actor.sprite.alpha = clamp(item.descriptor.opacity ?? 1, 0, 1); } });
      if (value) {
        pack.layers.forEach(item => { item.fade = 1; item.sprite.alpha = clamp(item.descriptor.opacity ?? 1, 0, 1); });
        pack.effects.forEach(item => item.actor.destroy()); pack.effects.length = 0;
      }
      layout(pack);
    },
    playEffect(id: CoreArtEffectId, x: number, y: number) {
      if (!pack || reduced || pack.effects.length >= 9) return false;
      const effect = pack.effectsData.get(id);
      if (!effect) return false;
      try {
        const actor = createPixiSpriteActor(effect.data, { ...effect.descriptor, loop: false });
        if (!actor) return false;
        style(actor.sprite, effect.descriptor); actor.sprite.position.set(x, y);
        actor.sprite.alpha = clamp(effect.descriptor.opacity ?? 1, 0, 1);
        pack.root.addChild(actor.sprite); pack.effects.push({ actor, age: 0, x, y }); actor.start(); return true;
      } catch { return false; }
    },
    tick(dt: number) {
      if (!pack || reduced) return;
      time += dt;
      for (const item of pack.layers) {
        item.fade = Math.min(1, item.fade + dt / .35);
        item.sprite.alpha = item.fade * clamp(item.descriptor.opacity ?? 1, 0, 1); position(item.sprite, item.descriptor);
      }
      for (const item of pack.ambient) {
        item.fade = Math.min(1, item.fade + dt / .35);
        item.actor.sprite.alpha = item.fade * clamp(item.descriptor.opacity ?? 1, 0, 1);
        item.actor.tick(dt); position(item.actor.sprite, item.descriptor);
      }
      for (let i = pack.effects.length - 1; i >= 0; i--) {
        const effect = pack.effects[i]; effect.age += dt; effect.actor.tick(dt);
        if (effect.actor.completed || effect.age > 10) { effect.actor.destroy(); pack.effects.splice(i, 1); }
      }
    },
    destroy() { destroyed = true; generation++; settleReady(false); dispose(pack); pack = undefined; plane.destroy({ children: true }); },
  };
}
