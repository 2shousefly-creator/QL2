import { isSoloCoreEligible } from "./airCombatDuelCorePolicy";
import type { AircraftCombatState, CoreDefinition } from "./airCombatTypes";
import { equipmentRewardsLocked } from "./airCombatEquipmentState";
import { CORE_DEFINITIONS } from "./airCombatCoreCatalog";
/** Shared by initial choices, rerolls, conversions and Pandora. Ownership is checked by callers. */
export function isCoreEligible(s:AircraftCombatState,c:CoreDefinition) {
  const retired=new Set([3,4,6,9,10,12,15,16,18,56,189,191,193,213,215].map(n=>`core_${String(n).padStart(3,"0")}`));
  const level=s.duel?.selectionLevel??s.pendingMilestones[0]??s.level;
  if(s.duel && (!isSoloCoreEligible(c) || (s.duel.allowedCoreIds && !s.duel.allowedCoreIds.has(c.id))))return false;
  if(c.skillId || retired.has(c.id))return false;
  if(["core_211","core_212","core_214","core_149","core_227"].includes(c.id)&&level>=15)return false;
  if(["core_046","core_047","core_048"].includes(c.id)&&level!==1&&level!==7)return false;
  if(["core_216","core_218"].includes(c.id)&&level<7)return false;
  if(c.id==="core_217"&&level!==1&&level!==7)return false;
  return (!c.aircraftIds||c.aircraftIds.includes(s.aircraftId)) &&
    !(equipmentRewardsLocked(s)&&["core_223","core_224","core_225","core_226","core_227"].includes(c.id));
}

const CONVERSIONS = new Set(["core_050", "core_051", "core_052"]);
const EQUIPMENT_REWARDS = new Set(["core_223", "core_224", "core_225", "core_226", "core_227"]);
const EMPTY: ReadonlySet<string> = new Set();

export function pandoraConvertibleCoreIds(state: AircraftCombatState): string[] {
  return state.selectedCores.filter(id => id !== "core_216" && !CONVERSIONS.has(id) && !CORE_DEFINITIONS.find(c => c.id === id)?.skillId);
}

/** Reservations are future encounters, not ownership; never relax the run-wide filter. */
export function isCoreOfferable(state: AircraftCombatState, core: CoreDefinition, reserved: ReadonlySet<string> = EMPTY): boolean {
  return isCoreEligible(state, core) && !state.selectedCores.includes(core.id) &&
    !state.coreState.encounteredCoreIds.has(core.id) && !reserved.has(core.id) &&
    !(reserved.has("core_228") && EQUIPMENT_REWARDS.has(core.id)) &&
    hasCoreRewardCapacity(state, core, reserved);
}

export function randomGrantCandidates(state: AircraftCombatState, tier?: string, reserved: ReadonlySet<string> = EMPTY): CoreDefinition[] {
  return CORE_DEFINITIONS.filter(c => (!tier || c.tiers[0] === tier) &&
    !(c.id === "core_228" && [...reserved].some(id => EQUIPMENT_REWARDS.has(id))) && isCoreOfferable(state, c, reserved));
}

export function getPandoraReplacementCandidates(state: AircraftCombatState, reserved: ReadonlySet<string> = EMPTY): CoreDefinition[] {
  return randomGrantCandidates(state, "diamond", new Set([...reserved, "core_216"]));
}

/** Core228 and equipment rewards cannot occupy the same conversion batch. */
export function compatibleRewardCount(pool: readonly CoreDefinition[]): number {
  return Math.max(pool.filter(c => c.id !== "core_228").length, pool.filter(c => !EQUIPMENT_REWARDS.has(c.id)).length);
}

export function canOfferPandora(state: AircraftCombatState, reserved: ReadonlySet<string> = EMPTY): boolean {
  return planPandoraReplacements(state, reserved) !== null;
}

/** One complete-batch planner for both the safety gate and the actual conversion. */
export function planPandoraReplacements(state: AircraftCombatState, reserved: ReadonlySet<string> = EMPTY, random?: () => number): CoreDefinition[] | null {
  const count=pandoraConvertibleCoreIds(state).length;
  if(count===0)return [];
  const available=getPandoraReplacementCandidates(state,reserved);
  if(compatibleRewardCount(available)<count)return null;
  const search=(batch:CoreDefinition[],pool:CoreDefinition[]):CoreDefinition[]|null=>{
    if(batch.length===count)return batch;
    if(compatibleRewardCount(pool)<count-batch.length)return null;
    const offset=random?Math.min(pool.length-1,Math.max(0,Math.floor(random()*pool.length))):0;
    const ordered=[...pool.slice(offset),...pool.slice(0,offset)];
    for(let i=0;i<ordered.length;i++){
      const core=ordered[i],next=[...batch,core],excluded=new Set([...reserved,...next.map(c=>c.id)]);
      if(!next.every(c=>hasCoreRewardCapacity(state,c,excluded)))continue;
      const remaining=ordered.slice(i+1).filter(c=>
        !(core.id==="core_228"&&EQUIPMENT_REWARDS.has(c.id))&&!(EQUIPMENT_REWARDS.has(core.id)&&c.id==="core_228"));
      const result=search(next,remaining);if(result)return result;
    }
    return null;
  };
  return search([],available);
}

/** Also used for displayed cards: deliberately does not reject the card's own encounter. */
export function hasCoreRewardCapacity(state: AircraftCombatState, core: CoreDefinition, reserved: ReadonlySet<string> = EMPTY): boolean {
  if (!CONVERSIONS.has(core.id) && core.id !== "core_216") return true;
  // Each recursive conversion excludes itself, so nested rewards are finite.
  const excluded = new Set([...reserved, core.id]);
  if (core.id === "core_216") return canOfferPandora(state, excluded);
  const tier = core.id === "core_050" ? "gold" : core.id === "core_051" ? "diamond" : undefined;
  const candidates=randomGrantCandidates(state,tier,excluded);
  if(core.id!=="core_052")return candidates.length>0;
  const ordinary=candidates.filter(c=>!CONVERSIONS.has(c.id)&&c.id!=="core_216");
  if(compatibleRewardCount(ordinary)>=2)return true;
  return candidates.some((first,i)=>candidates.slice(i+1).some(second=>
    compatibleRewardCount([first,second])===2&&canCommitCoreOffers(state,[first,second],excluded)));
}

/** Showing another card must not spend the last reward of an already displayed conversion. */
export function canCommitCoreOffers(state: AircraftCombatState, cards: readonly CoreDefinition[], excluded: ReadonlySet<string> = EMPTY): boolean {
  const reserved = new Set([...excluded,...cards.map(c => c.id)]);
  return cards.every(c => hasCoreRewardCapacity(state, c, reserved));
}
