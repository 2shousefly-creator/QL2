import type { CoreConversionSource } from "./airCombatEquipmentState";
import { isCoreEligible, isCoreOfferable, hasCoreRewardCapacity, canCommitCoreOffers, randomGrantCandidates, pandoraConvertibleCoreIds, planPandoraReplacements } from "./airCombatCoreEligibility";
import { queueEquipmentChoice, grantEquipmentReward, randomEquipmentId, equipmentRewardsLocked, sacrificeEquipment } from "./airCombatEquipmentState";
import { releaseState } from "./airCombatReleaseState";
import { initializeReleaseCore, removeReleaseCoreState } from "./airCombatSelectionRules";
import { CORE_SYSTEM_LABELS } from "./airCombatCoreSystems";
import { recordCoreMetric } from "./airCombatTelemetry";
import { AIRCRAFT_CONFIGS, CORE_DEFINITIONS, CORE_TIER_CHANCES } from "./airCombatConfig";
import { getEffectiveAircraftStats, syncEffectiveMaxHp } from "./airCombatAircraft";
import { hasCore } from "./airCombatCoreEffects";
import type { AircraftCombatState, CoreCard, CoreDefinition, CoreTier } from "./airCombatTypes";
const TIERS: CoreTier[] = ["silver", "gold", "diamond"];
const pick = <T>(pool: readonly T[], random: () => number): T | undefined => pool[Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))];
function weightedTier(valid: CoreTier[], random: () => number, state?: AircraftCombatState, chaos=false): CoreTier | undefined {
    const chances = chaos || state && hasCore(state,217) ? {silver:.20,gold:.30,diamond:.50} : CORE_TIER_CHANCES;
    let roll = random() * valid.reduce((n, t) => n + chances[t], 0);
    for (const tier of valid) {
        roll -= chances[tier];
        if (roll < 0)
            return tier;
    }
    return valid[valid.length - 1];
}
export function rollCoreTier(_selectionNumber: number, random: () => number = Math.random): CoreTier { return weightedTier(TIERS, random)!; }
const eligible = (state: AircraftCombatState, tier?: CoreTier) => CORE_DEFINITIONS.filter(c => isCoreOfferable(state,c) && (!tier || c.tiers[0] === tier));
const normalPool = eligible;
export function makeCoreCard(definition: CoreDefinition): CoreCard {
    return { id: definition.id, name: definition.name, description: definition.description, availability:definition.availability, system: definition.system, skillSlot: definition.skillSlot,
        icon: definition.icon, category: definition.category, tier: definition.tiers[0], valueLabel: definition.skillSlot ? `Kỹ năng ${definition.skillSlot}` : CORE_SYSTEM_LABELS[definition.system] };
}
/** selectionNumber retained for callers; queued level is the authority. */
export function generateCoreChoices(state: AircraftCombatState, selectionNumber: number, random: () => number = Math.random): CoreCard[] {
    const count=hasCore(state,214)?5:3;
    const guaranteed=!!releaseState(state).pendingGuaranteedDiamondSelection;
    let tier:CoreTier|undefined=guaranteed?"diamond":weightedTier(TIERS,random,state);
    if(!guaranteed&&normalPool(state,tier).length<count)tier=weightedTier(TIERS.filter(t=>normalPool(state,t).length>=count),random,state)??tier;
    // At exhaustion use the largest remaining tier, without resurrecting old offers.
    if(!guaranteed&&normalPool(state,tier).length<count && !TIERS.some(t=>normalPool(state,t).length>=count))
      tier=TIERS.reduce((best,t)=>normalPool(state,t).length>normalPool(state,best).length?t:best,tier!);
    const pool=normalPool(state,tier),chosen:CoreDefinition[]=[];
    recordCoreMetric(state,217,tier==="silver"?"silverRolls":tier==="gold"?"goldRolls":"diamondRolls",1);
    while(pool.length&&chosen.length<count){
      const core=pick(pool,random)!;pool.splice(pool.indexOf(core),1);
      if(canCommitCoreOffers(state,[...chosen,core]))chosen.push(core);
    }
    if(chosen.length===5)recordCoreMetric(state,214,"procs",1);
    for(const core of chosen)state.coreState.encounteredCoreIds.add(core.id);
    return chosen.map(makeCoreCard);
}

function rollChaosBatch(state:AircraftCombatState,random:()=>number,reserved:ReadonlySet<string>):CoreDefinition[] {
    const pool=randomGrantCandidates(state,undefined,reserved);
    const pairs=pool.map(first=>({first,seconds:randomGrantCandidates(state,undefined,new Set([...reserved,first.id]))
      .filter(second=>canCommitCoreOffers(state,[first,second],reserved))})).filter(pair=>pair.seconds.length>0);
    const tier=weightedTier(TIERS.filter(t=>pairs.some(pair=>pair.first.tiers[0]===t)),random,state,true);
    const pair=pick(pairs.filter(pair=>pair.first.tiers[0]===tier),random);if(!pair)return [];
    state.coreState.encounteredCoreIds.add(pair.first.id);
    const secondTier=weightedTier(TIERS.filter(t=>pair.seconds.some(c=>c.tiers[0]===t)),random,state,true);
    const second=pick(pair.seconds.filter(c=>c.tiers[0]===secondTier),random)!;
    state.coreState.encounteredCoreIds.add(second.id);
    // Resolve Pandora before another random reward can increase its conversion count.
    return [pair.first,second].sort((a,b)=>Number(b.id==="core_216")-Number(a.id==="core_216"));
}
/** Ownership precedes callbacks; explicit work stack resolves nested conversions immediately. */
export function applyCore(state: AircraftCombatState, card: CoreCard, random: () => number = Math.random, onAcquire?: (id: string) => void, onRemove?: (ids: string[]) => void): boolean {
    const first = CORE_DEFINITIONS.find(c => c.id === card.id);
    if (!first || !isCoreEligible(state,first) || first.tiers[0] !== card.tier || state.selectedCores.includes(first.id) || !hasCoreRewardCapacity(state,first))
        return false;
    type Work = {
        core: CoreDefinition; owner?:number; conversionSourceCoreId?:CoreConversionSource;
    } | {
        tier?: CoreTier; owner?:number; conversionSourceCoreId?:CoreConversionSource;
    };
    const transactionId=state.coreState.nextAcquisitionId;
    const work: Work[] = [{ core: first }];
    const reserved=new Set<string>();
    const queueBatch=(batch:CoreDefinition[],owner?:number,conversionSourceCoreId?:CoreConversionSource)=>{for(const c of batch){reserved.add(c.id);state.coreState.encounteredCoreIds.add(c.id);}work.push(...batch.slice().reverse().map(core=>({core,owner,conversionSourceCoreId})));};
    while (work.length) {
        const item = work.pop()!;
        let core: CoreDefinition | undefined;
        if ("core" in item)
            core = item.core;
        else {
            const tier = item.tier ?? weightedTier(TIERS.filter(t => randomGrantCandidates(state,t,reserved).length > 0), random,state);
            if (!tier)
                continue;
            core = pick(randomGrantCandidates(state,tier,reserved), random);
        }
        if (!core || state.selectedCores.includes(core.id))
            continue;

        // Plan the entire Pandora transaction before changing ownership or earned stats.
        const removed=core.id==="core_216"?pandoraConvertibleCoreIds(state):[];
        const replacements=core.id==="core_216"?planPandoraReplacements(state,reserved,random):[];
        const chaos=core.id==="core_052"?rollChaosBatch(state,random,new Set([...reserved,core.id])):[];
        if(replacements===null||(core.id==="core_052"&&chaos.length!==2)){if(core===first)return false;continue;}
        reserved.delete(core.id);
        state.coreState.encounteredCoreIds.add(core.id);
        state.selectedCores.push(core.id);
        if("owner" in item)recordCoreMetric(state,item.owner,"converted",1);
        state.coreState.acquisitions.push({ transactionId, id: state.coreState.nextAcquisitionId++, createdAtMs: performance.now(), kind: "core", coreId: core.id, conversionSourceCoreId:item.conversionSourceCoreId });
        if(core.id==="core_223"||core.id==="core_224"||core.id==="core_225"||core.id==="core_226"){
          const count=core.id==="core_223"?2:core.id==="core_224"?2:core.id==="core_225"?4:6;
          if(!equipmentRewardsLocked(state)){
            const choices=core.id==="core_223"?2:core.id==="core_225"?2:core.id==="core_226"?3:0;
            let finalChoice:ReturnType<typeof queueEquipmentChoice>|undefined;
            for(let i=0;i<choices;i++)finalChoice=queueEquipmentChoice(state,"TP",3,1,core.id,random,transactionId);
            for(let i=choices;i<count;i++){const reward=randomEquipmentId("TP",random);if(finalChoice)(finalChoice.afterRewards??=[]).push(reward);else grantEquipmentReward(state,reward,core.id,undefined,transactionId);}
            if(core.id==="core_226"&&finalChoice)(finalChoice.afterRewards??=[]).push("VP01");
            recordCoreMetric(state,Number(core.id.slice(5)),"itemsReceived",count+(core.id==="core_226"?1:0));
          }
        }
        if(core.id==="core_227"&&!equipmentRewardsLocked(state)){grantEquipmentReward(state,randomEquipmentId("TP",random),core.id,undefined,transactionId);releaseState(state).waitingChest={remaining:500,claimed:false,cancelled:false};}
        if(core.id==="core_228"){
          const chest=releaseState(state).waitingChest;if(chest&&!chest.claimed)chest.cancelled=true;
          sacrificeEquipment(state,random,transactionId);
        }
        initializeReleaseCore(state, core.id, random);
        syncEffectiveMaxHp(state);
        const after = getEffectiveAircraftStats(state);
        state.currentResource = Math.min(after.maxResource, state.currentResource);
        onAcquire?.(core.id);
        if(core.id==="core_216"){
          for(const id of removed)state.coreState.encounteredCoreIds.add(id);
          // Only earned permanent stats survive. Bounty rewards already live in modifiers.
          for(const [id,key] of [["core_046","firepowerFlat"],["core_047","armorFlat"],["core_048","maxHpFlat"]] as const)if(removed.includes(id)){state.modifiers[key]+=state.coreState.stacks[id]??0;if(id==="core_046")state.modifiers.bonusFireRatePct+=Math.floor((state.coreState.stacks[id]??0)/50)*.1;}
          if(removed.includes("core_196"))state.modifiers.criticalDamageMultiplierFlat+=Math.min(.50,(state.coreState.stacks.crimsonCrit??0)*.05);
          onRemove?.(removed);state.selectedCores=state.selectedCores.filter(id=>!removed.includes(id));removeReleaseCoreState(state,removed);syncEffectiveMaxHp(state);
          state.coreState.consumed.add("core_216");
          recordCoreMetric(state,216,"converted",removed.length);
          recordCoreMetric(state,216,"rewards",replacements.length);queueBatch(replacements,undefined,"core_216");
        }
        if (core.id === "core_050")
            work.push({ tier: "gold",owner:50,conversionSourceCoreId:"core_050" });
        if (core.id === "core_051")
            work.push({ tier: "diamond",owner:51,conversionSourceCoreId:"core_051" });
        if (core.id === "core_052")queueBatch(chaos,52,"core_052");
    }
    return true;
}

export { createCoreSelectionEvent, getRerollCandidates } from "./airCombatSelectionRules";
export type { CoreSelectionEvent } from "./airCombatSelectionRules";
