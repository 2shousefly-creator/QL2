import { isCoreEligible, SPECIALIZATION_COMPENSATION_EXCLUSIONS } from "./airCombatCoreEligibility";
import { grantEquipmentReward, randomEquipmentId, equipmentRewardsLocked, sacrificeEquipment } from "./airCombatEquipmentState";
import { releaseState } from "./airCombatReleaseState";
import { initializeReleaseCore, removeReleaseCoreState } from "./airCombatSelectionRules";
import { CORE_SYSTEM_LABELS } from "./airCombatCoreSystems";
import { recordCoreMetric } from "./airCombatTelemetry";
import { AIRCRAFT_CONFIGS, CORE_DEFINITIONS, CORE_TIER_CHANCES } from "./airCombatConfig";
import { getEffectiveAircraftStats, syncEffectiveMaxHp } from "./airCombatAircraft";
import { skillsLocked, hasCore } from "./airCombatCoreEffects";
import type { AircraftCombatState, CoreCard, CoreDefinition, CoreTier } from "./airCombatTypes";
const TIERS: CoreTier[] = ["silver", "gold", "diamond"];
const pick = <T>(pool: readonly T[], random: () => number): T | undefined => pool[Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))];
function weightedTier(valid: CoreTier[], random: () => number, state?: AircraftCombatState): CoreTier | undefined {
    const chances = state && hasCore(state,217) ? {silver:.25,gold:.40,diamond:.35} : CORE_TIER_CHANCES;
    let roll = random() * valid.reduce((n, t) => n + chances[t], 0);
    for (const tier of valid) {
        roll -= chances[tier];
        if (roll < 0)
            return tier;
    }
    return valid[valid.length - 1];
}
export function rollCoreTier(_selectionNumber: number, random: () => number = Math.random): CoreTier { return weightedTier(TIERS, random)!; }
const eligible = (state: AircraftCombatState, tier?: CoreTier) => CORE_DEFINITIONS.filter(c => !c.skillId && isCoreEligible(state,c) && !state.selectedCores.includes(c.id) && (!tier || c.tiers[0] === tier));
const normalPool = (s: AircraftCombatState, tier?: CoreTier) => eligible(s,tier).filter(c => !hasCore(s,213) || (releaseState(s).refused[c.id] ?? 0) <= releaseState(s).completedSelections);
export function makeCoreCard(definition: CoreDefinition): CoreCard {
    return { id: definition.id, name: definition.name, description: definition.description, system: definition.system, skillSlot: definition.skillSlot,
        icon: definition.icon, category: definition.category, tier: definition.tiers[0], valueLabel: definition.skillSlot ? `Kỹ năng ${definition.skillSlot}` : CORE_SYSTEM_LABELS[definition.system] };
}
/** selectionNumber retained for callers; queued level is the authority. */
export function generateCoreChoices(state: AircraftCombatState, selectionNumber: number, random: () => number = Math.random): CoreCard[] {
    const level = state.pendingMilestones[0] ?? selectionNumber * 3;
    const skillMilestone = level === 9 || level === 18 || level === 27;
    if (skillMilestone && !skillsLocked(state)) {
        const seen=releaseState(state).seenSkillCoreIds,choices:CoreCard[]=[];
        for(const skill of AIRCRAFT_CONFIGS[state.aircraftId].skillIds){
          const pool=CORE_DEFINITIONS.filter(c=>c.skillId===skill&&!state.selectedCores.includes(c.id)&&!seen.has(c.id));
          const core=pick(pool,random);if(core){seen.add(core.id);choices.push(makeCoreCard(core));}
        }
        return choices;
    }
    const r=releaseState(state),count=!skillMilestone&&hasCore(state,214)?4:3;
    const specializedMilestone=skillMilestone&&skillsLocked(state);
    let tier=specializedMilestone?"diamond" as CoreTier:weightedTier(TIERS,random,state);
    if(!specializedMilestone&&normalPool(state,tier).length<count)tier=weightedTier(TIERS.filter(t=>normalPool(state,t).length>=count),random,state)??tier;
    if(!skillMilestone){
      recordCoreMetric(state,217,tier==="silver"?"silverRolls":tier==="gold"?"goldRolls":"diamondRolls",1);
      recordCoreMetric(state,213,"blocked",eligible(state,tier).length-normalPool(state,tier).length);
    }
    const pool=skillMilestone?eligible(state,tier):normalPool(state,tier),chosen:CoreCard[]=[];r.guaranteedSlot=undefined;
    if(!skillMilestone&&hasCore(state,215)&&r.system){
      const specialized=pool.filter(c=>c.system===r.system);
      if(specialized.length){const core=pick(specialized,random)!;pool.splice(pool.indexOf(core),1);chosen.push(makeCoreCard(core));r.guaranteedSlot=0;recordCoreMetric(state,215,"guaranteed",1);}
      else recordCoreMetric(state,215,"fallbacks",1);
    }
    while(pool.length&&chosen.length<count){const core=pick(pool,random)!;pool.splice(pool.indexOf(core),1);chosen.push(makeCoreCard(core));}
    if(chosen.length===4)recordCoreMetric(state,214,"procs",1);
    return chosen;
}
function rollDiamondBatch(state:AircraftCombatState,count:number,random:()=>number,excluded:ReadonlySet<string>,reserved:ReadonlySet<string>,oldIds:readonly string[]=[]):CoreDefinition[] {
    const batch:CoreDefinition[]=[];
    const pool=()=>eligible(state,"diamond").filter(c=>!excluded.has(c.id)&&!reserved.has(c.id)&&!batch.some(b=>b.id===c.id));
    for(let i=0;i<count;i++){const next=pick(pool().filter(c=>c.id!==oldIds[i]),random);if(next)batch.push(next);}
    if(equipmentRewardsLocked(state)||batch.some(c=>c.id==="core_228")){
      for(let i=0;i<batch.length;i++)if(["core_226","core_227"].includes(batch[i].id)){
        const next=pick(pool().filter(c=>!["core_226","core_227"].includes(c.id)&&c.id!==oldIds[i]),random);
        if(next)batch[i]=next;
      }
    }
    return batch;
}
/** Ownership precedes callbacks; explicit work stack resolves nested conversions immediately. */
export function applyCore(state: AircraftCombatState, card: CoreCard, random: () => number = Math.random, onAcquire?: (id: string) => void, onRemove?: (ids: string[]) => void): boolean {
    const first = CORE_DEFINITIONS.find(c => c.id === card.id);
    if (!first || !isCoreEligible(state,first) || first.tiers[0] !== card.tier || state.selectedCores.includes(first.id))
        return false;
    if (first.skillId && (skillsLocked(state) || !first.aircraftIds?.includes(state.aircraftId)))
        return false;
    type Work = {
        core: CoreDefinition;
    } | {
        tier?: CoreTier; owner?:number;
    };
    const work: Work[] = [{ core: first }];
    const reserved=new Set<string>();
    const queueBatch=(batch:CoreDefinition[])=>{for(const c of batch)reserved.add(c.id);work.push(...batch.slice().reverse().map(core=>({core})));};
    while (work.length) {
        const item = work.pop()!;
        let core: CoreDefinition | undefined;
        if ("core" in item)
            core = item.core;
        else {
            const tier = item.tier ?? weightedTier(TIERS.filter(t => eligible(state, t).length > 0), random);
            if (!tier)
                continue;
            core = pick(eligible(state, tier).filter(c=>!reserved.has(c.id)), random);
        }
        if (!core || state.selectedCores.includes(core.id))
            continue;

        reserved.delete(core.id);
        state.selectedCores.push(core.id);
        if("owner" in item)recordCoreMetric(state,item.owner,"converted",1);
        state.coreState.acquisitions.push({ id: state.coreState.nextAcquisitionId++, kind: "core", coreId: core.id });
        if (core.skillId)
            (state.modifiers.skillCores[core.skillId] ??= []).push(core.id);
        if(core.id==="core_223"||core.id==="core_225"||core.id==="core_226"){
          const count=core.id==="core_223"?1:core.id==="core_225"?2:4;
          if(!equipmentRewardsLocked(state)){
            for(let i=0;i<count;i++)grantEquipmentReward(state,randomEquipmentId("TP",random),core.id);
            if(core.id==="core_226")grantEquipmentReward(state,"VP01",core.id);
            recordCoreMetric(state,Number(core.id.slice(5)),"itemsReceived",count+(core.id==="core_226"?1:0));
          }
        }
        if(core.id==="core_227"&&!equipmentRewardsLocked(state))releaseState(state).waitingChest={remaining:600,claimed:false,cancelled:false};
        if(core.id==="core_228"){
          const chest=releaseState(state).waitingChest;if(chest&&!chest.claimed)chest.cancelled=true;
          sacrificeEquipment(state,random);
        }
        initializeReleaseCore(state, core.id, random);
        syncEffectiveMaxHp(state);
        const after = getEffectiveAircraftStats(state);
        state.currentResource = Math.min(after.maxResource, state.currentResource);
        onAcquire?.(core.id);
        if(core.id==="core_097"){
          const removed=state.selectedCores.filter(id=>CORE_DEFINITIONS.find(c=>c.id===id)?.skillId);
          state.selectedCores=state.selectedCores.filter(id=>!removed.includes(id));
          state.modifiers.skillCores={};state.activeEffects={};state.droneActive=false;
          removeReleaseCoreState(state,removed);
          for(const key of ["lanceChain","whiteHole"])delete state.coreState.timers[key];
          for(const key of ["lanceStack","lanceCastStack","droneUpkeepSpent","droneRecallRefund"])delete state.coreState.stacks[key];
          const batch=rollDiamondBatch(state,removed.length,random,SPECIALIZATION_COMPENSATION_EXCLUSIONS,reserved);
          queueBatch(batch);
        }
        if(core.id==="core_216"){
          const removed=state.selectedCores.filter(id=>id!=="core_216"&&!["core_050","core_051","core_052"].includes(id)&&!CORE_DEFINITIONS.find(c=>c.id===id)?.skillId);
          // Only earned permanent stats survive. Bounty rewards already live in modifiers.
          for(const [id,key] of [["core_046","firepowerFlat"],["core_047","armorFlat"],["core_048","maxHpFlat"]] as const)if(removed.includes(id))state.modifiers[key]+=state.coreState.stacks[id]??0;
          if(removed.includes("core_196"))state.modifiers.criticalDamageMultiplierFlat+=Math.min(.5,(state.coreState.stacks.crimsonCrit??0)*.025);
          onRemove?.(removed);state.selectedCores=state.selectedCores.filter(id=>!removed.includes(id));removeReleaseCoreState(state,removed);syncEffectiveMaxHp(state);
          state.coreState.consumed.add("core_216");
          recordCoreMetric(state,216,"converted",removed.length);
          const replacements=rollDiamondBatch(state,removed.length,random,new Set(["core_216",...(removed.includes("core_097")?["core_097"]:[])]),reserved,removed);
          recordCoreMetric(state,216,"rewards",replacements.length);queueBatch(replacements);
        }
        if (core.id === "core_050")
            work.push({ tier: "gold",owner:50 });
        if (core.id === "core_051")
            work.push({ tier: "diamond",owner:51 });
        if (core.id === "core_052")
            work.push({owner:52}, {owner:52});
    }
    return true;
}

export { createCoreSelectionEvent, getRerollCandidates } from "./airCombatSelectionRules";
export type { CoreSelectionEvent } from "./airCombatSelectionRules";
