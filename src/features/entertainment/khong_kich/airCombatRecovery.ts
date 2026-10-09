import { EQUIPMENT_POWER as P } from "./airCombatEquipmentBalance";
import { equipmentScale } from "./airCombatEquipmentState";
import type { AircraftCombatState } from "./airCombatTypes";
import { getEffectiveAircraftStats } from './airCombatAircraft';

/** Applied at receipt, independently of Max HP and regeneration stat conversion. */
export function getRecoveryReceivedMultiplier(state: AircraftCombatState): number {
  return (1 + P[22].recoveryReceived * equipmentScale(state,22)) * (state.selectedCores.includes("core_200")?1.5:1);
}

export function getHealingReceivedMultiplier(state: AircraftCombatState, maxHp?:number): number {
  const status = state.status;
  const survival=state.aircraftId==='riptide' && (state.skillRanks.riptide_wellspring??0)>=5
    && state.currentHp<(maxHp??getEffectiveAircraftStats(state).maxHp)*.15;
  return getRecoveryReceivedMultiplier(state) *
    (status.healingReceivedUntil > state.coreState.time ? status.healingReceivedMultiplier : 1) * (survival?1.5:1);
}

export function getShieldReceivedMultiplier(state: AircraftCombatState, temporary = true): number {
  return getRecoveryReceivedMultiplier(state);
}
