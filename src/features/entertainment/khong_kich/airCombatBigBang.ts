import type { CombatWorld } from './airCombatRuntime';
import type { ExpansionCast } from './airCombatExpansion';

/** World ownership separates simultaneous casts, including mirrored Titan duels. */
export interface BigBangCast {
  id: number;
  at: number;
  fallAt: number;
  impactAt: number;
  x: number;
  y: number;
  rank: number;
  rawDamage: number;
  expansionCast?: ExpansionCast;
  resolved: boolean;
}

/** Split at the impact before advancing any actor/attack queue past that instant. */
export function bigBangStep(worlds: readonly CombatWorld[], seconds: number): number {
  let step = seconds;
  for (const world of worlds) {
    const cast = world.bigBang;
    if (cast && !cast.resolved) {
      const left = cast.impactAt - world.elapsed;
      if (left > 1e-8) step = Math.min(step, left);
    }
    for (const shock of world.skillCores.aftershocks) {
      const left = shock.at - world.elapsed;
      if (left > 1e-8) step = Math.min(step, left);
    }
  }
  return step;
}
