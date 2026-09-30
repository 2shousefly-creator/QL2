import { AIRCRAFT_CONFIGS } from "./airCombatConfig";
import { getEffectiveAircraftStats, levelUpAircraft, syncEffectiveMaxHp } from "./airCombatAircraft";
import { allocateSkillPoint, canAllocateSkill } from "./airCombatSkillRanks";
import { equipmentState } from "./airCombatEquipmentState";
import type { EquipmentDefinitionId } from "./airCombatEquipmentCatalog";
import type { AircraftCombatState, SkillId } from "./airCombatTypes";
import type { SoloRule } from "./airCombatDuelRules";

export function advanceDuelAircraftToLevel(state: AircraftCombatState, level: number) {
  // levelUpAircraft grants stats/points only; gainCombatXp owns Campaign milestones.
  while (state.level < level) levelUpAircraft(state);
}
export function allocateDuelSkill(player: AircraftCombatState, opponent: AircraftCombatState, id: SkillId) {
  const slot = AIRCRAFT_CONFIGS[player.aircraftId].skillIds.indexOf(id);
  const other = AIRCRAFT_CONFIGS[opponent.aircraftId].skillIds[slot];
  if (!other || !canAllocateSkill(player, id) || !canAllocateSkill(opponent, other)) return false;
  allocateSkillPoint(player, id); allocateSkillPoint(opponent, other);
  return true;
}
export function grantDuelEquipment(player: AircraftCombatState, opponent: AircraftCombatState, round: number, rule: SoloRule, random: () => number) {
  const pick = (state: AircraftCombatState) => {
    const owned = new Set(equipmentState(state).equipped.filter(Boolean).map(i => i!.definitionId.slice(2)));
    const pool = Array.from({ length: 36 }, (_, i) => String(i + 1).padStart(2, "0")).filter(id => !owned.has(id));
    return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
  };
  const shared = round <= 6 ? pick(player) : undefined;
  for (const state of [player, opponent]) {
    const e = equipmentState(state);
    if (round <= 6) {
      const family = state === player || rule === "copy" ? shared! : pick(state);
      e.equipped[round - 1] = { instanceId: e.nextInstanceId++, definitionId: `TH${family}` as EquipmentDefinitionId };
    } else {
      for (const slot of [(round - 7) * 2, (round - 7) * 2 + 1]) {
        const item = e.equipped[slot];
        if (item) item.definitionId = `HL${item.definitionId.slice(2)}` as EquipmentDefinitionId;
      }
    }
    syncEffectiveMaxHp(state);
    const stats = getEffectiveAircraftStats(state);
    state.currentHp = stats.maxHp; state.currentResource = stats.maxResource;
  }
}
