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

/** Shared inner silhouette; both ends remain chamfered even at a near-zero fill. */
export function angularBarPolygon(x: number, y: number, width: number, height: number, ratio = 1): number[] {
  const fillWidth=width*Math.max(0,Math.min(1,ratio));
  if(fillWidth<=0 || height<=0)return [];
  const cut=Math.min(3,fillWidth*.45,height*.5),right=x+fillWidth,bottom=y+height;
  return [x+cut,y,right,y,right,bottom-cut,right-cut,bottom,x,bottom,x,y+cut];
}
