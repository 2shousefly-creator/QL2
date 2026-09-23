import { isCoreEligible } from "./airCombatCoreEligibility";
import type { AircraftCombatState, CoreCard, CoreDefinition, CoreTier, SkillId } from "./airCombatTypes";
import { CORE_DEFINITIONS } from "./airCombatCoreCatalog";
import { hasCore, skillsLocked } from "./airCombatCoreEffects";
import { syncEffectiveMaxHp } from "./airCombatAircraft";
import { releaseState } from "./airCombatReleaseState";
import { recordCoreMetric } from "./airCombatTelemetry";
import { makeCoreCard } from "./airCombatCoreSelection";

export interface CoreSelectionEvent {
  originalChoiceIds: string[];
  currentChoiceIds: string[];
  seenChoiceIds: string[];
  rerollUsedBySlot: boolean[];
  extraAvailable: boolean;
  extraUsed: boolean;
  guaranteedSlot?: number;
  context: { kind: "normal" | "skill" | "specialization"; tier: CoreTier; skillIdsBySlot?: (SkillId | undefined)[] };
}
export type RerollSource = "main" | "extra" | "reserve";
export const reserveCap = (s: AircraftCombatState) => hasCore(s,212) ? 4 : 3;
export function createCoreSelectionEvent(state: AircraftCombatState, choices: CoreCard[]): CoreSelectionEvent {
  const skillId=CORE_DEFINITIONS.find(c=>c.id===choices[0]?.id)?.skillId;
  const milestone=state.pendingMilestones[0];
  const kind=skillId?"skill":[9,18,27].includes(milestone)?"specialization":"normal";
  const extraAvailable=kind==="normal"&&hasCore(state,212);
  if(extraAvailable)recordCoreMetric(state,212,"granted",1);
  return {originalChoiceIds:choices.map(c=>c.id),currentChoiceIds:choices.map(c=>c.id),seenChoiceIds:choices.map(c=>c.id),rerollUsedBySlot:choices.map(()=>false),extraAvailable,extraUsed:false,
    guaranteedSlot:kind!=="normal"?undefined:releaseState(state).guaranteedSlot,context:{kind,tier:choices[0].tier,skillIdsBySlot:choices.map(card=>CORE_DEFINITIONS.find(c=>c.id===card.id)?.skillId)}};
}
function rerollPool(state: AircraftCombatState,event: CoreSelectionEvent,slot: number) {
  let pool=CORE_DEFINITIONS.filter(c=>isCoreEligible(state,c)&&!state.selectedCores.includes(c.id)&&!event.seenChoiceIds.includes(c.id)&&
    (event.context.kind==="skill"?c.skillId===event.context.skillIdsBySlot?.[slot]&&!releaseState(state).seenSkillCoreIds.has(c.id)&&!skillsLocked(state):!c.skillId&&c.tiers[0]===event.context.tier));
  if(event.context.kind!=="normal")return {pool,skipped:0,alternative:false};
  const r=releaseState(state);
  if(hasCore(state,213))pool=pool.filter(c=>(r.refused[c.id]??0)<=r.completedSelections);
  if(event.guaranteedSlot===slot&&hasCore(state,215)&&r.system){const specific=pool.filter(c=>c.system===r.system);if(specific.length)return {pool:specific,skipped:0,alternative:false};}
  const system=CORE_DEFINITIONS.find(c=>c.id===event.currentChoiceIds[slot])?.system;
  const alternatives=pool.filter(c=>c.system!==system);
  if(hasCore(state,211)&&alternatives.length)return {pool:alternatives,skipped:pool.length-alternatives.length,alternative:true};
  return {pool,skipped:0,alternative:false};
}
export function getRerollCandidates(state:AircraftCombatState,event:CoreSelectionEvent,slot:number,source:RerollSource="main"):CoreDefinition[]{
  if(!Number.isInteger(slot)||slot<0||slot>=event.currentChoiceIds.length)return [];
  if(source==="main"&&event.rerollUsedBySlot[slot])return [];
  if(source!=="main"&&event.context.kind!=="normal")return [];
  if(source==="extra"&&(!event.extraAvailable||event.extraUsed))return [];
  if(source==="reserve"&&(!hasCore(state,218)||releaseState(state).reserve<=0))return [];
  return rerollPool(state,event,slot).pool;
}
export function spendReroll(state:AircraftCombatState,event:CoreSelectionEvent,slot:number,source:RerollSource,random:()=>number):CoreCard|undefined {
  const pool=getRerollCandidates(state,event,slot,source),next=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];if(!next)return;
  const old=event.currentChoiceIds[slot],r=releaseState(state),normal=event.context.kind==="normal";
  if(normal&&hasCore(state,211)){const info=rerollPool(state,event,slot);recordCoreMetric(state,211,"procs",1);recordCoreMetric(state,211,"alternatives",info.alternative?1:0);recordCoreMetric(state,211,"skipped",info.skipped);}
  if(normal&&hasCore(state,213)){
    const blocked=CORE_DEFINITIONS.filter(c=>!c.skillId&&c.tiers[0]===event.context.tier&&isCoreEligible(state,c)&&!state.selectedCores.includes(c.id)&&!event.seenChoiceIds.includes(c.id)&&(r.refused[c.id]??0)>r.completedSelections).length;
    recordCoreMetric(state,213,"blocked",blocked);
    r.refused[old]=r.completedSelections+3;recordCoreMetric(state,213,"remembered",1);
  }
  if(source==="main")event.rerollUsedBySlot[slot]=true;
  if(source==="extra"){event.extraUsed=true;recordCoreMetric(state,212,"spent",1);}
  if(source==="reserve"){r.reserve--;recordCoreMetric(state,218,"spent",1);}
  if(normal&&slot===3)recordCoreMetric(state,214,"rerolls",1);
  event.currentChoiceIds[slot]=next.id;event.seenChoiceIds.push(next.id);
  if(next.skillId)r.seenSkillCoreIds.add(next.id);
  return makeCoreCard(next);
}
export function closeCoreSelection(state:AircraftCombatState,event:CoreSelectionEvent,slot:number){
  if(event.context.kind!=="normal")return;
  const r=releaseState(state);
  if(hasCore(state,218)){
    const unusedMain=event.rerollUsedBySlot.filter(used=>!used).length;
    const extra=event.extraAvailable&&!event.extraUsed?1:0,earned=unusedMain+extra;
    const capacity=Math.max(0,reserveCap(state)-r.reserve),accepted=Math.min(earned,capacity);r.reserve+=accepted;
    recordCoreMetric(state,218,"granted",accepted);recordCoreMetric(state,218,"discarded",earned-accepted);
    recordCoreMetric(state,212,"converted",Math.min(extra,Math.max(0,capacity-unusedMain)));
    const entry=state.coreState.telemetry.core_218??={};entry.peak=Math.max(entry.peak??0,r.reserve);
  }
  if(slot===3)recordCoreMetric(state,214,"picks",1);
  if(slot===event.guaranteedSlot)recordCoreMetric(state,215,"picks",1);
  r.completedSelections++;
  for(const [id,expiry] of Object.entries(r.refused))if(expiry<=r.completedSelections)delete r.refused[id];
}
export function rollUnstableMode(state:AircraftCombatState,random:()=>number){
  const r=releaseState(state);r.mode=random()<.5?"small":"giant";r.nextMode=state.coreState.time+60;
  recordCoreMetric(state,222,r.mode==="small"?"smallRolls":"giantRolls",1);syncEffectiveMaxHp(state);
}
export function initializeReleaseCore(state:AircraftCombatState,id:string,random:()=>number){
  const r=releaseState(state);
  if(id==="core_202"&&!r.followups.includes("primary"))r.followups.push("primary");
  if(id==="core_215"&&!r.followups.includes("system"))r.followups.push("system");
  if(id==="core_219"){r.heat=0;r.overheatUntil=0;r.lastSkillEnd=state.coreState.time;}
  if(id==="core_220")r.ghostReady=state.coreState.time+10;
  if(id==="core_221")r.markReady=state.coreState.time+20;
  if(id==="core_222")rollUnstableMode(state,random);
}
export function removeReleaseCoreState(state:AircraftCombatState,ids:string[]){
  const r=releaseState(state);
  if(ids.includes("core_227"))r.waitingChest=undefined;
  if(ids.includes("core_213"))r.refused={};
  if(ids.includes("core_215")){r.system=undefined;r.guaranteedSlot=undefined;}
  if(ids.includes("core_218"))r.reserve=0;
  r.reserve=Math.min(r.reserve,reserveCap(state));
  r.followups=r.followups.filter(f=>!ids.includes(f==="primary"?"core_202":"core_215"));
  if(ids.includes("core_219")){r.heat=0;r.overheatUntil=0;}
  if(ids.includes("core_220")){r.ghosts=[];r.ghostReady=Infinity;}
  if(ids.includes("core_221")){r.mark=undefined;r.markReady=Infinity;}
  if(ids.includes("core_222")){r.mode=undefined;r.nextMode=Infinity;}
  if(ids.includes("core_210")){r.misses=0;r.aimReady=false;}
}
