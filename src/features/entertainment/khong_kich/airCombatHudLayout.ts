import { AIR_COMBAT_WORLD } from "./airCombatConfig";

// World units: the DOM battle wrapper is 360 × 720, the combat surface 360 × 640.
export const BOSS_HUD_HEIGHT = 26;
export const STATUS_ICON_SIZE = 22;
export const STATUS_STRIP_HEIGHT = 50;
export const BOSS_VISUAL_WIDTH_SCALE = 2.9;
// Shipped square fortress atlas: frame [0, 0, .56, .51], rounded to pixels.
export const BOSS_VISUAL_ASPECT = 640 / 702;
export const topOverlayBottom = (boss: boolean) => AIR_COMBAT_WORLD.hudHeight + (boss ? BOSS_HUD_HEIGHT : 0) + STATUS_STRIP_HEIGHT;
export const bossMinCenterY = (radius: number) => topOverlayBottom(true) + Math.max(radius, radius * BOSS_VISUAL_WIDTH_SCALE * BOSS_VISUAL_ASPECT / 2) + 8;

/** Intersect a chamfered full bar with its left-to-right fill; all layers share its silhouette. */
export function angularBarPolygon(x: number, y: number, width: number, height: number, ratio = 1): number[] {
  const bevel = Math.min(3, height / 2), right = x + width * Math.max(0, Math.min(1, ratio));
  const points = [[x + bevel, y], [x + width, y], [x + width - bevel, y + height], [x, y + height]];
  const clipped: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    if (a[0] <= right) clipped.push(...a);
    if ((a[0] <= right) !== (b[0] <= right)) {
      const t = (right - a[0]) / (b[0] - a[0]);
      clipped.push(right, a[1] + t * (b[1] - a[1]));
    }
  }
  return clipped;
}
