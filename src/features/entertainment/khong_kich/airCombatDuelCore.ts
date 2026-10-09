import { isUltimate } from "./airCombatSkillRanks";
import { AIRCRAFT_CONFIGS, CORE_DEFINITIONS } from "./airCombatConfig";
import { isCoreEligible } from "./airCombatCoreEligibility";
import { generateCoreChoices, createCoreSelectionEvent } from "./airCombatCoreSelection";
import { equipmentScale } from "./airCombatEquipmentState";
import { getEffectiveAircraftStats } from "./airCombatAircraft";
import { COPY_CONVERSIONS, isSoloCoreEligible } from "./airCombatDuelCorePolicy";
import { expansionState } from "./airCombatExpansion";
import { releaseState } from "./airCombatReleaseState";
import { selectCore, type CombatWorld } from "./airCombatRuntime";
import type { AircraftCombatState, CoreCard, CoreDefinition } from "./airCombatTypes";
import type { SoloRule } from "./airCombatDuelRules";

export function setDuelCoreContext(player: AircraftCombatState, opponent: AircraftCombatState, level: number, rule: SoloRule) {
  for (const state of [player, opponent]) {
    state.duel!.selectionLevel = level;
    state.duel!.allowedCoreIds = undefined;
  }
  if (rule === "copy") {
    const pool = new Set(CORE_DEFINITIONS.filter(c => !COPY_CONVERSIONS.has(c.id) && isSoloCoreEligible(c)
      && isCoreEligible(player, c) && isCoreEligible(opponent, c)).map(c => c.id));
    player.duel!.allowedCoreIds = pool; opponent.duel!.allowedCoreIds = pool;
  }
}
export function syncDuelEncounters(player: AircraftCombatState, opponent: AircraftCombatState) {
  const ids = new Set([...player.coreState.encounteredCoreIds, ...opponent.coreState.encounteredCoreIds]);
  player.coreState.encounteredCoreIds = new Set(ids); opponent.coreState.encounteredCoreIds = new Set(ids);
}
export function offerDuelCores(world: CombatWorld, round: number): CoreCard[] {
  world.currentCoreChoices = generateCoreChoices(world.aircraft, round, world.random);
  world.coreSelectionEvent = createCoreSelectionEvent(world.aircraft, world.currentCoreChoices);
  return world.currentCoreChoices;
}
/** Score known mechanic metadata, never localized description text. */
export function scoreSoloCoreForAI(core: CoreDefinition, state: AircraftCombatState, opponent: AircraftCombatState) {
  const stats = getEffectiveAircraftStats(state), enemy = getEffectiveAircraftStats(opponent);
  const owned = state.selectedCores.map(id => CORE_DEFINITIONS.find(c => c.id === id));
  const defenseBuild = state.aircraftId === "breaker" || owned.filter(c => c?.system === "defense").length >= 2;
  let score = 1 + (core.aircraftIds?.includes(state.aircraftId) ? .5 : 0);
  if (core.system === "attack") score += defenseBuild ? .35 : .75;
  if (core.system === "defense") score += defenseBuild ? .8 : enemy.firepower > stats.firepower ? .6 : .35;
  if (core.system === "resource") score += stats.resourceRegen < 5 ? .9 : .45;
  if (core.system === "skill") score += .55;
  if (["core_001", "core_002", "core_007", "core_008", "core_013", "core_014", "core_115"].includes(core.id)) score += .5;
  if (["core_057", "core_088"].includes(core.id)) score += enemy.armor / 180;
  if (core.id === "core_053" && equipmentScale(state, 8)) score += .65;
  if (core.id === "core_192" && (owned.some(c => c?.id === "core_081" || c?.id === "core_200") || equipmentScale(state, 21))) score += .65;
  if (core.id === "core_208" && (stats.hpRegen > 2 || stats.resourceRegen > 5)) score += .65;
  if (core.id === "core_201") score += new Set(owned.map(c => c?.system)).size * .18;
  if (core.id === "core_214" || core.id === "core_217") score += state.duel!.selectionLevel <= 7 ? .6 : 0;
  return score;
}
export function chooseDuelAICore(world: CombatWorld, opponent: AircraftCombatState, round: number) {
  const cards = offerDuelCores(world, round);
  const best = cards.map(card => ({ card, score: scoreSoloCoreForAI(CORE_DEFINITIONS.find(c => c.id === card.id)!, world.aircraft, opponent) }))
    .sort((a, b) => b.score - a.score)[0];
  if (best) selectCore(world, best.card);
  // Core202's own follow-up is a legal build choice, separate from Skill Point allocation.
  if (releaseState(world.aircraft).followups.includes("primary")) {
    const ids = AIRCRAFT_CONFIGS[world.aircraft.aircraftId].skillIds;
    const slot = ids.reduce((best, id, i) => !(world.aircraft.selectedCores.includes("core_097")&&isUltimate(id)) && (world.aircraft.skillRanks[id] ?? 0) > (world.aircraft.skillRanks[ids[best]] ?? 0) ? i : best, 0);
    chooseDuelPrimary(world, slot);
  }
}
export function chooseDuelPrimary(world: CombatWorld, slot: number) {
  const id = AIRCRAFT_CONFIGS[world.aircraft.aircraftId].skillIds[slot];
  if (!id || (world.aircraft.selectedCores.includes("core_097")&&isUltimate(id)) || !releaseState(world.aircraft).followups.includes("primary")) return;
  expansionState(world.aircraft).primarySkill = id;
  expansionState(world.aircraft).primaryPending = false;
  releaseState(world.aircraft).followups = releaseState(world.aircraft).followups.filter(x => x !== "primary");
  world.pauseReasons.delete("primarySkill");
}
