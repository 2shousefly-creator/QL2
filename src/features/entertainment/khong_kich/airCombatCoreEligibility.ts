import type { AircraftCombatState, CoreDefinition } from "./airCombatTypes";
import { equipmentRewardsLocked } from "./airCombatEquipmentState";
/** Shared by initial choices, rerolls, conversions and Pandora. Ownership is checked by callers. */
export function isCoreEligible(s:AircraftCombatState,c:CoreDefinition) {
  const retired=new Set([3,4,6,9,10,12,15,16,18,56,213,215].map(n=>`core_${String(n).padStart(3,"0")}`));
  const level=s.pendingMilestones[0]??s.level;
  if(c.skillId || retired.has(c.id))return false;
  if(["core_211","core_212","core_214","core_218"].includes(c.id)&&level>=15)return false;
  if(c.id==="core_217"&&level!==1&&level!==7)return false;
  return (!c.aircraftIds||c.aircraftIds.includes(s.aircraftId)) &&
    !(equipmentRewardsLocked(s)&&["core_223","core_224","core_225","core_226","core_227"].includes(c.id));
}
