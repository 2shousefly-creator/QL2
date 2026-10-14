import { equipmentUntargetable } from "./airCombatEquipmentStats";
import { mirrorPoint } from "./airCombatMirrorTransform";
import type { AircraftCombatState } from "./airCombatTypes";
import type { CombatWorld, EnemyEntity } from "./airCombatRuntime";

export type AircraftTargetingMode = "hard_lock" | "homing" | "aimed" | "untargeted";
/** Target acquisition is separate from physical contact. Invisibility never removes the hull. */
export function aircraftTargetability(state: AircraftCombatState) {
  const alive = state.currentHp > 0;
  const visible = alive && !((state.activeEffects.invisibility ?? 0) > 0) && !equipmentUntargetable(state);
  return { canAcquire: visible, canMaintain: visible, canTrackExactPosition: visible, collisionEnabled: alive };
}
export function canAcquireDuelTarget(attacker: CombatWorld, defender: CombatWorld, mode: AircraftTargetingMode = "aimed") {
  const target = aircraftTargetability(defender.aircraft);
  return !attacker.aftermath && !defender.destruction && (mode === "untargeted" ? target.collisionEnabled : target.canAcquire);
}
export const canMaintainDuelTarget = canAcquireDuelTarget;
/** Call only for acquisition/retention, never for an already committed collision or area effect. */
export function canTargetEnemy(world: CombatWorld, enemy: EnemyEntity, mode: AircraftTargetingMode = "aimed") {
  return !world.aftermath && enemy.hp > 0 && (mode === "untargeted" || (enemy.forest?.hiddenUntil ?? 0) <= world.elapsed) && (!enemy.aircraftTarget || canAcquireDuelTarget(world, enemy.aircraftTarget.world, mode));
}
/** All active opposing decoys, including Phantom clones; never the caster's own. */
export function duelDecoyTargets(world: CombatWorld) {
  if (world.aftermath) return [];
  return world.enemies.flatMap(enemy => {
    const defender = enemy.aircraftTarget?.world;
    if (!defender || enemy.hp <= 0 || defender.destruction || defender.aircraft.currentHp <= 0) return [];
    return defender.decoys.filter(d => d.active && d.remaining > 0)
      .map(d => ({ ...mirrorPoint(d.x, d.y), id: d.id, ownerId: enemy.id, world: defender }));
  });
}
/** Opposing decoys keep their own identity and are projected into the attacker's coordinates.
 * Collision/absorption remains owned by the existing mirrored interception path. */
export function preferredDuelDecoy(world: CombatWorld, retained?: { world: CombatWorld; id: number }) {
  if (world.aftermath) return null;
  for (const target of world.enemies) {
    const defender = target.aircraftTarget?.world;
    if (!defender || defender.destruction || defender.aircraft.currentHp <= 0) continue;
    const decoys = defender.decoys.filter(d => d.active && d.remaining > 0);
    const decoy = retained?.world === defender ? decoys.find(d => d.id === retained.id) ?? decoys[0] : decoys[0];
    if (decoy) return { ...mirrorPoint(decoy.x, decoy.y), world: defender, id: decoy.id };
  }
  return null;
}
