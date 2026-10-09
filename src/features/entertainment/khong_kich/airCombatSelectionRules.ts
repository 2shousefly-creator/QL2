import { createAbsorbShield } from "./airCombatExpansion";
import { getEffectiveAircraftStats } from "./airCombatAircraft";
import { isCoreOfferable, canCommitCoreOffers } from "./airCombatCoreEligibility";
import type { AircraftCombatState, CoreCard, CoreDefinition, CoreTier } from "./airCombatTypes";
import { CORE_DEFINITIONS } from "./airCombatCoreCatalog";
import { hasCore } from "./airCombatCoreEffects";
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
  context: { kind: "normal"; tier: CoreTier; guaranteedDiamond?: boolean };
}
export type RerollSource = "main" | "extra" | "reserve";
export const reserveCap = (s: AircraftCombatState) => 5;
export function createCoreSelectionEvent(state: AircraftCombatState, choices: CoreCard[]): CoreSelectionEvent {
  for(const card of choices)state.coreState.encounteredCoreIds.add(card.id);
  const kind="normal" as const;
  const extraAvailable=kind==="normal"&&hasCore(state,212);
  if(extraAvailable)recordCoreMetric(state,212,"granted",1);
  return {originalChoiceIds:choices.map(c=>c.id),currentChoiceIds:choices.map(c=>c.id),seenChoiceIds:choices.map(c=>c.id),rerollUsedBySlot:choices.map(()=>false),extraAvailable,extraUsed:false,
    context:{kind,tier:choices[0]?.tier??"silver",guaranteedDiamond:!!releaseState(state).pendingGuaranteedDiamondSelection}};
}
function rerollPool(state: AircraftCombatState,event: CoreSelectionEvent,slot: number) {
  const displayed=CORE_DEFINITIONS.filter(c=>event.currentChoiceIds.some((id,i)=>i!==slot&&id===c.id));
  let pool=CORE_DEFINITIONS.filter(c=>isCoreOfferable(state,c)&&!event.seenChoiceIds.includes(c.id)&&
    c.tiers[0]===event.context.tier&&canCommitCoreOffers(state,[...displayed,c]));
  if(event.context.kind!=="normal")return {pool,skipped:0,alternative:false};
  const r=releaseState(state);
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
  if(source==="reserve"&&(releaseState(state).reserve<=0))return [];
  return rerollPool(state,event,slot).pool;
}
export function spendReroll(state:AircraftCombatState,event:CoreSelectionEvent,slot:number,source:RerollSource,random:()=>number):CoreCard|undefined {
  const pool=getRerollCandidates(state,event,slot,source),next=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];if(!next)return;
  const old=event.currentChoiceIds[slot],r=releaseState(state),normal=event.context.kind==="normal";
  if(normal&&hasCore(state,211)){const info=rerollPool(state,event,slot);recordCoreMetric(state,211,"procs",1);recordCoreMetric(state,211,"alternatives",info.alternative?1:0);recordCoreMetric(state,211,"skipped",info.skipped);}
  if(source==="main")event.rerollUsedBySlot[slot]=true;
  if(source==="extra"){event.extraUsed=true;recordCoreMetric(state,212,"spent",1);}
  if(source==="reserve"){r.reserve--;recordCoreMetric(state,212,"spent",1);}
  if(normal&&slot>=3)recordCoreMetric(state,214,"rerolls",1);
  event.currentChoiceIds[slot]=next.id;event.seenChoiceIds.push(next.id);
  state.coreState.encounteredCoreIds.add(next.id);

  return makeCoreCard(next);
}
export function closeCoreSelection(state:AircraftCombatState,event:CoreSelectionEvent,slot:number){
  if(event.context.kind!=="normal")return;
  const r=releaseState(state);
  if(event.context.guaranteedDiamond)r.pendingGuaranteedDiamondSelection=false;
  if(slot>=3)recordCoreMetric(state,214,"picks",1);
}
export function rollUnstableMode(state:AircraftCombatState,random:()=>number){
  const hpBefore=getEffectiveAircraftStats(state).maxHp,ratio=state.currentHp/hpBefore;
  const r=releaseState(state),previous=r.mode;r.mode=previous?(previous==="small"?"giant":"small"):(random()<.5?"small":"giant");r.nextMode=state.coreState.time+60;
  recordCoreMetric(state,222,r.mode==="small"?"smallRolls":"giantRolls",1);syncEffectiveMaxHp(state);
  if(previous){state.currentHp=Math.min(state.coreState.syncedMaxHp??hpBefore,(state.coreState.syncedMaxHp??hpBefore)*ratio);const sh=createAbsorbShield(state,"unstableGuard",getEffectiveAircraftStats(state).maxHp*.10,4);sh.coreRow=222;recordCoreMetric(state,222,"shieldCreated",sh.amount);}
}
export function initializeReleaseCore(state:AircraftCombatState,id:string,random:()=>number){
  const r=releaseState(state);
  if(id==="core_178")state.coreState.timers.magneticBrakeCd=state.coreState.time;
  if(id==="core_202"&&!r.followups.includes("primary"))r.followups.push("primary");
  if(id==="core_212"){r.reserve=Math.min(5,r.reserve+1);recordCoreMetric(state,212,"granted",1);}
  if(id==="core_217")r.pendingGuaranteedDiamondSelection=true;
  if(id==="core_219"){r.heat=0;r.overheatUntil=0;r.lastSkillEnd=state.coreState.time;}
  if(id==="core_220")r.ghostReady=state.coreState.time;
  if(id==="core_221")r.markReady=state.coreState.time+16;
  if(id==="core_222")rollUnstableMode(state,random);
}
export function removeReleaseCoreState(state:AircraftCombatState,ids:string[]){
  const r=releaseState(state);
  if(ids.includes("core_227"))r.waitingChest=undefined;
  if(ids.includes("core_217"))r.pendingGuaranteedDiamondSelection=false;
  if(ids.includes("core_218"))delete state.coreState.timers.ultimateAftershock;
  r.reserve=Math.min(r.reserve,reserveCap(state));
  r.followups=r.followups.filter(()=>!ids.includes("core_202"));
  if(ids.includes("core_219")){r.heat=0;r.overheatUntil=0;}
  if(ids.includes("core_220")){r.ghosts=[];r.ghostReady=Infinity;}
  if(ids.includes("core_221")){r.mark=undefined;r.markReady=Infinity;}
  if(ids.includes("core_222")){r.mode=undefined;r.nextMode=Infinity;}
  if(ids.includes("core_210")){r.misses=0;r.aimReady=false;r.aimShots=0;r.aimBonusReady=false;}
}
