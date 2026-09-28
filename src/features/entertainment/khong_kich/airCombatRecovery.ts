import { EQUIPMENT_POWER as P } from "./airCombatEquipmentBalance";
import { equipmentScale } from "./airCombatEquipmentState";
import type { AircraftCombatState } from "./airCombatTypes";

/** Applied at receipt, independently of Max HP and regeneration stat conversion. */
export function getRecoveryReceivedMultiplier(state: AircraftCombatState): number {
  return 1 + P[22].recoveryReceived * equipmentScale(state, 22);
}

export function getHealingReceivedMultiplier(state: AircraftCombatState): number {
  const status = state.status;
  return getRecoveryReceivedMultiplier(state) *
    (status.healingReceivedUntil > state.coreState.time ? status.healingReceivedMultiplier : 1);
}

export function getShieldReceivedMultiplier(state: AircraftCombatState, temporary = true): number {
  return getRecoveryReceivedMultiplier(state) *
    (temporary && state.selectedCores.includes("core_200") ? 1.5 : 1);
}
