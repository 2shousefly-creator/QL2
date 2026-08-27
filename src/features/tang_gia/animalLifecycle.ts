import type { AnimalDefinition, PenAnimalState } from "./farmTypes";

export const PEN_STARVATION_DURATION_MS = 12 * 60 * 60 * 1000;
export const ANIMAL_MIN_VISUAL_SCALE = 0.35;
export const ANIMAL_MAX_VISUAL_SCALE = 1.5;
export const ANIMAL_MIN_OVERLAY_SCALE = 0.5;
export const ANIMAL_MAX_OVERLAY_SCALE = 1;
export const ANIMAL_FOOT_ORIGIN_RATIO = 0.78;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function isAnimalDead(animal: PenAnimalState): boolean {
  return Number.isFinite(animal.deathAt) && animal.deathAt !== null;
}

export function getAnimalLifeRemainingRatio(
  animal: PenAnimalState,
  animalDefinition: AnimalDefinition,
  now: number
): number {
  if (isAnimalDead(animal)) return 0;
  const lifespanMs = Math.max(1, animalDefinition.lifespanMs);
  const lifeEndsAt = Number.isFinite(animal.lifeEndsAt)
    ? animal.lifeEndsAt
    : now;
  return clamp01(Math.max(0, lifeEndsAt - now) / lifespanMs);
}

export function getAnimalAgeProgress(
  animal: PenAnimalState,
  animalDefinition: AnimalDefinition,
  now: number
): number {
  const lifespanMs = Math.max(1, animalDefinition.lifespanMs);
  const lifeStartedAt = Number.isFinite(animal.lifeStartedAt)
    ? animal.lifeStartedAt
    : animal.lifeEndsAt - lifespanMs;
  // An early starvation death freezes the visual at its actual age instead
  // of making the animal jump instantly to the maximum old-age scale.
  const ageTimestamp = isAnimalDead(animal) ? animal.deathAt! : now;
  return clamp01(Math.max(0, ageTimestamp - lifeStartedAt) / lifespanMs);
}

export type AnimalLifeBarTone = "green" | "yellow" | "red" | "dead";

export function getAnimalLifeBarTone(lifeRemainingRatio: number): AnimalLifeBarTone {
  const ratio = clamp01(lifeRemainingRatio);
  if (ratio <= 0) return "dead";
  if (ratio >= 0.6) return "green";
  if (ratio >= 0.2) return "yellow";
  return "red";
}

export function getAnimalVisualScale(
  animal: PenAnimalState,
  animalDefinition: AnimalDefinition,
  now: number
): number {
  const ageProgress = getAnimalAgeProgress(animal, animalDefinition, now);
  return Math.min(
    ANIMAL_MAX_VISUAL_SCALE,
    Math.max(
      ANIMAL_MIN_VISUAL_SCALE,
      ANIMAL_MIN_VISUAL_SCALE +
        ageProgress * (ANIMAL_MAX_VISUAL_SCALE - ANIMAL_MIN_VISUAL_SCALE)
    )
  );
}

/**
 * Keeps labels readable while still following the animal's age-based size.
 * The animal itself grows from 0.35x to 1.50x; overlays only grow 0.50x to 1x.
 */
export function getAnimalOverlayScale(animalScale: number): number {
  const safeScale = Number.isFinite(animalScale)
    ? animalScale
    : ANIMAL_MIN_VISUAL_SCALE;
  const growthT = clamp01(
    (safeScale - ANIMAL_MIN_VISUAL_SCALE) /
      (ANIMAL_MAX_VISUAL_SCALE - ANIMAL_MIN_VISUAL_SCALE)
  );
  return (
    ANIMAL_MIN_OVERLAY_SCALE +
    growthT * (ANIMAL_MAX_OVERLAY_SCALE - ANIMAL_MIN_OVERLAY_SCALE)
  );
}

/** Ground shadows follow the full age scale, independently from facing. */
export function getAnimalShadowScale(animalScale: number): number {
  const safeScale = Number.isFinite(animalScale)
    ? animalScale
    : ANIMAL_MIN_VISUAL_SCALE;
  return Math.min(
    ANIMAL_MAX_VISUAL_SCALE,
    Math.max(ANIMAL_MIN_VISUAL_SCALE, safeScale)
  );
}

/**
 * Positions the shadow immediately below the scaled visual feet. The sprite's
 * stable foot origin is shared with the age-scale wrapper.
 */
export function getAnimalShadowTopOffset(
  spriteHeightPx: number,
  animalScale: number
): number {
  const safeHeight = Math.max(
    1,
    Number.isFinite(spriteHeightPx) ? spriteHeightPx : 1
  );
  const shadowScale = getAnimalShadowScale(animalScale);
  const feetOffsetPx =
    safeHeight * (1 - ANIMAL_FOOT_ORIGIN_RATIO) * shadowScale;
  const dynamicGapPx = 0.5 + shadowScale * 0.75;
  return feetOffsetPx + dynamicGapPx;
}

export interface AnimalOverlayOffsets {
  headOffsetPx: number;
  feetOffsetPx: number;
  gapPx: number;
}

/**
 * Derives the head/feet anchors from the actual SVG height and current animal
 * scale. The sprite's 78% transform origin is its stable foot position.
 */
export function getAnimalOverlayOffsets(
  spriteHeightPx: number,
  animalScale: number
): AnimalOverlayOffsets {
  const safeHeight = Math.max(
    1,
    Number.isFinite(spriteHeightPx) ? spriteHeightPx : 1
  );
  const safeScale = Math.min(
    ANIMAL_MAX_VISUAL_SCALE,
    Math.max(
      ANIMAL_MIN_VISUAL_SCALE,
      Number.isFinite(animalScale) ? animalScale : ANIMAL_MIN_VISUAL_SCALE
    )
  );
  const overlayScale = getAnimalOverlayScale(safeScale);
  return {
    headOffsetPx: safeHeight * ANIMAL_FOOT_ORIGIN_RATIO * safeScale,
    feetOffsetPx: safeHeight * (1 - ANIMAL_FOOT_ORIGIN_RATIO) * safeScale,
    gapPx: 1.5 + overlayScale * 1.5,
  };
}

/** Canonical facing resolver: target delta, never stale inertial velocity. */
export function getAnimalFacingForDelta(
  dx: number,
  currentFacing: "left" | "right",
  epsilon = 0.02
): "left" | "right" {
  const safeDx = Number.isFinite(dx) ? dx : 0;
  const safeEpsilon = Math.max(
    0,
    Number.isFinite(epsilon) ? epsilon : 0.02
  );
  if (safeDx > safeEpsilon) return "right";
  if (safeDx < -safeEpsilon) return "left";
  return currentFacing;
}

export function getAnimalAgeMovementMultiplier(
  animal: PenAnimalState,
  animalDefinition: AnimalDefinition,
  now: number
): number {
  if (isAnimalDead(animal)) return 0;
  const ratio = getAnimalLifeRemainingRatio(animal, animalDefinition, now);
  if (ratio >= 0.6) return 1.35;
  if (ratio >= 0.2) return 1;
  return 0.8;
}

export function getLivingAnimalCount(animals: readonly PenAnimalState[]): number {
  return animals.reduce((count, animal) => count + (isAnimalDead(animal) ? 0 : 1), 0);
}

export function getNormalTroughDurationMs(livingAnimalCount: number): number {
  const count = Math.min(5, Math.max(0, Math.floor(livingAnimalCount)));
  return count > 0 ? (13 - count) * 60 * 60 * 1000 : 0;
}

export function getStarvationDeadlineAt(starvationStartedAt: number | null | undefined): number | null {
  return Number.isFinite(starvationStartedAt) && starvationStartedAt !== null
    ? starvationStartedAt + PEN_STARVATION_DURATION_MS
    : null;
}

export function getPenDangerRatio(
  starvationStartedAt: number | null | undefined,
  now: number
): number {
  const deadlineAt = getStarvationDeadlineAt(starvationStartedAt);
  if (deadlineAt === null) return 0;
  return clamp01(Math.max(0, deadlineAt - now) / PEN_STARVATION_DURATION_MS);
}

export function isAnimalEggCycleFeedBuffed(
  animal: PenAnimalState,
  penFeedBuffValue: number,
  activeFeedSpeedBonus: number
): boolean {
  return (
    !isAnimalDead(animal) &&
    penFeedBuffValue > 0 &&
    activeFeedSpeedBonus > 0 &&
    animal.isBuffed === true
  );
}

export function formatAnimalEggCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(
    0,
    Math.ceil(Math.max(0, Number.isFinite(remainingMs) ? remainingMs : 0) / 1000)
  );
  const pad2 = (value: number) => String(value).padStart(2, "0");

  if (totalSeconds >= 60 * 60) {
    const hours = Math.floor(totalSeconds / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;
    return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  }

  if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${pad2(minutes)}:${pad2(seconds)}`;
  }

  return pad2(totalSeconds);
}
