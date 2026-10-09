import { GAMEPLAY_SAFE_RECT } from './airCombatConfig';
import type { AircraftCombatState } from './airCombatTypes';
import { hasCore } from './airCombatCoreEffects';
import { SKILL_CORE_VALUES } from './airCombatSkillCores';

export const PHANTOM_LASER_WIDTH = 48;
export const PHANTOM_LASER_VISUAL_WIDTH = 66;
export const HAWKEYE_PROJECTILE_RADIUS = 2.8 * .8;

/** Phantom and HawkEye resolve all basic-shot speed changes at firing time. */
export function playerBasicProjectileSpeed(state: AircraftCombatState): number {
  const reappearance = (state.coreState.timers.reappearanceBuff ?? 0) > state.coreState.time;
  return 2 * (hasCore(state,54)?1.5:1) * (hasCore(state, 206) ? .8 : 1) * (hasCore(state, 111) ? 1440 : 480)
    * (reappearance ? 1 + SKILL_CORE_VALUES.reappearanceSpeedBonus : 1);
}

/** A forward beam always reaches the arena edge, regardless of caster position. */
export function phantomLaserBounds(x: number, y: number) {
  return { left: x - PHANTOM_LASER_WIDTH / 2, right: x + PHANTOM_LASER_WIDTH / 2,
    top: GAMEPLAY_SAFE_RECT.top, bottom: y, height: Math.max(1, y - GAMEPLAY_SAFE_RECT.top) };
}
