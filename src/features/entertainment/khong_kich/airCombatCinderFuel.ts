import { GAMEPLAY_SAFE_RECT } from './airCombatConfig';
import { cinderValues } from './airCombatCinderConfig';

export const CINDER_FUEL_OFFSETS = [-126, -42, 42, 126] as const;
export interface CinderFuelPosition { x: number; y: number; rank: number }
export const cinderFuelCenters = (fuel: CinderFuelPosition) =>
  CINDER_FUEL_OFFSETS.map(dx => ({ x: fuel.x + dx, y: fuel.y }));

/** World units only. Collision and both renderers consume this exact footprint. */
export function cinderFuelGeometry(fuel: CinderFuelPosition) {
  const radius = cinderValues('cinder_fuel_barrage', fuel.rank).radius;
  return {
    radius, centers: cinderFuelCenters(fuel), wall: fuel.rank >= 5,
    left: Math.max(GAMEPLAY_SAFE_RECT.left, fuel.x + CINDER_FUEL_OFFSETS[0] - radius),
    right: Math.min(GAMEPLAY_SAFE_RECT.right, fuel.x + CINDER_FUEL_OFFSETS[3] + radius),
    top: fuel.y - radius, bottom: fuel.y + radius,
  };
}

const atlases = new Map<boolean, HTMLCanvasElement>();
/** Four cached surface frames, shared by Canvas and Pixi. No padding or trim:
 * the opaque rim touches the cell bounds and the pivot is exactly (0.5, 0.5).
 * Only interior combustion changes; the footprint is invariant across frames.
 */
export function cinderFuelAtlas(wall: boolean): HTMLCanvasElement {
  const cached = atlases.get(wall);
  if (cached) return cached;
  const width = wall ? 664 : 160, height = wall ? 176 : 160;
  const atlas = document.createElement('canvas');
  atlas.width = width * 4; atlas.height = height;
  const ctx = atlas.getContext('2d')!;
  for (let frame = 0; frame < 4; frame++) {
    ctx.save(); ctx.translate(frame * width, 0);
    const outline = (inset: number) => {
      ctx.beginPath();
      if (wall) ctx.rect(inset, inset, width - inset * 2, height - inset * 2);
      else ctx.arc(width / 2, height / 2, width / 2 - inset, 0, Math.PI * 2);
    };
    outline(0); ctx.clip();
    // The entire damage area has visible fuel beneath the fire, including wall joins.
    ctx.fillStyle = '#ffac39'; ctx.fillRect(0, 0, width, height);
    outline(3); ctx.fillStyle = '#803014'; ctx.fill();
    const bed = ctx.createLinearGradient(0, 0, 0, height);
    bed.addColorStop(0, '#b83b0c'); bed.addColorStop(.45, '#ed6512'); bed.addColorStop(1, '#8f280b');
    outline(6); ctx.fillStyle = bed; ctx.fill();
    // Bounded, staggered tongues and glowing eddies fill the whole surface.
    const columns = wall ? 22 : 6;
    for (let row = 0; row < 5; row++) for (let col = 0; col < columns; col++) {
      const seed = col * 17 + row * 31;
      const x = (col + .35 + (row % 2) * .45) * width / columns;
      const y = (row + .65) * height / 5;
      const phase = (frame + seed % 4) * Math.PI / 2;
      const sway = Math.sin(phase) * 5, reach = 13 + (seed % 9) + Math.cos(phase) * 4;
      ctx.beginPath(); ctx.ellipse(x, y, 12, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ff941e'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 9, y);
      ctx.bezierCurveTo(x - 14, y - 10, x + sway, y - reach, x + sway - 2, y - reach - 9);
      ctx.bezierCurveTo(x + 15, y - reach + 4, x + 12, y - 2, x + 5, y + 3);
      ctx.closePath(); ctx.fillStyle = '#ffb72f'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + sway * .3, y - 3, 3, 7, .2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe6a0'; ctx.fill();
    }
    // Draw the rim last, inside the footprint, so animation never erases its edge.
    outline(1.5); ctx.lineWidth = 3; ctx.strokeStyle = '#ffd278'; ctx.stroke();
    ctx.restore();
  }
  atlases.set(wall, atlas);
  return atlas;
}
