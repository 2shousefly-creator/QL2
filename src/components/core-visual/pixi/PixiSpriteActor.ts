import { AnimatedSprite } from "pixi.js";
import type { Ticker } from "pixi.js";
import type { CoreSpriteAnimationDescriptor } from "./coreArtTypes";
import type { LoadedSpriteFrames } from "./pixiAssets";

/** Manual clock only: no Ticker.shared subscription and no React/gameplay state. */
export function createPixiSpriteActor(data: LoadedSpriteFrames, descriptor: CoreSpriteAnimationDescriptor, onComplete?: () => void) {
  if (!data.frames.length || data.frames.some(texture => texture.destroyed)) return null;
  const sprite = new AnimatedSprite({ textures: [...data.frames], autoUpdate: false });
  const fps = descriptor.fps ?? data.fps ?? 12;
  sprite.animationSpeed = (Number.isFinite(fps) ? Math.max(1, Math.min(60, fps)) : 12) / 60;
  sprite.loop = descriptor.loop ?? data.loop ?? true;
  sprite.anchor.set(descriptor.anchor?.x ?? .5, descriptor.anchor?.y ?? .5);
  sprite.scale.set(descriptor.scale ?? 1);
  if (typeof descriptor.tint === "number") sprite.tint = descriptor.tint;
  sprite.eventMode = "none";
  let reduced = false, running = false, completed = false, resumeFrame = 0;
  const clock = { deltaTime: 0 } as Ticker;
  sprite.onComplete = () => {
    completed = true; running = false;
    try { onComplete?.(); } catch { /* Presentation callback cannot break the scene. */ }
  };
  const actor = {
    sprite,
    get completed() { return completed; },
    start(restart = true) {
      completed = false; running = true;
      if (restart) resumeFrame = 0;
      if (!reduced) sprite.gotoAndPlay(restart ? 0 : sprite.currentFrame);
    },
    stop() { running = false; sprite.stop(); },
    setReducedMotion(value: boolean) {
      if (reduced === value) return;
      reduced = value;
      if (value) {
        resumeFrame = sprite.currentFrame;
        sprite.gotoAndStop(Math.max(0, Math.min(data.frames.length - 1, Math.floor(descriptor.staticFrame ?? 0))));
      } else if (running && !completed) sprite.gotoAndPlay(resumeFrame);
    },
    tick(seconds: number) {
      if (reduced || !running) return;
      clock.deltaTime = Math.min(.1, Math.max(0, seconds)) * 60;
      sprite.update(clock);
    },
    destroy() { sprite.onComplete = undefined; sprite.destroy({ texture: false, textureSource: false }); },
  };
  return actor;
}
export type PixiSpriteActor = NonNullable<ReturnType<typeof createPixiSpriteActor>>;
