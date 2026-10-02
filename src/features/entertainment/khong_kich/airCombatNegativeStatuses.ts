import type { AircraftCombatState } from './airCombatTypes';

// Run-local readers preserve source-owned expiry and avoid copying effects into saves.
const sources = new WeakMap<AircraftCombatState, Map<object, () => Iterable<string>>>();
export function registerNegativeStatusSource(state: AircraftCombatState, owner: object, read: () => Iterable<string>) {
  let readers = sources.get(state);
  if (!readers) { readers = new Map(); sources.set(state, readers); }
  readers.set(owner, read);
}
export function externalNegativeStatusTypes(state: AircraftCombatState): Set<string> {
  const result = new Set<string>();
  for (const read of sources.get(state)?.values() ?? []) for (const type of read()) result.add(type);
  return result;
}
