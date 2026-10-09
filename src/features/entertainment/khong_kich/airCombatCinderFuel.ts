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

