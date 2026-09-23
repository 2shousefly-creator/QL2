import type { AircraftCombatState, CoreDefinition } from "./airCombatTypes";
import { equipmentRewardsLocked } from "./airCombatEquipmentState";
/** Shared by initial choices, rerolls, conversions and Pandora. Ownership is checked by callers. */
export function isCoreEligible(s:AircraftCombatState,c:CoreDefinition) {
  return (!c.aircraftIds||c.aircraftIds.includes(s.aircraftId)) &&
    !(equipmentRewardsLocked(s)&&["core_223","core_224","core_225","core_226","core_227"].includes(c.id));
}
export const SPECIALIZATION_COMPENSATION_EXCLUSIONS = new Set([18,86,93,96,97,119,121,198,199,202,208].map(n=>`core_${String(n).padStart(3,"0")}`));
