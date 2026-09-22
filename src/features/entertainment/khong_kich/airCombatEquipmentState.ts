import { EQUIPMENT_CATALOG, equipmentRecipe, type EquipmentDefinitionId, type EquipmentFamilyId } from "./airCombatEquipmentCatalog";
import type { AircraftCombatState, SkillId } from "./airCombatTypes";

export interface EquipmentInstance { instanceId: number; definitionId: EquipmentDefinitionId }
export type EquipmentRewardId = EquipmentDefinitionId | "VP01";
export type AcquisitionEvent = { id: number; kind: "core"; coreId: string } | { id: number; kind: "equipment" | "item"; definitionId: EquipmentRewardId; source: string; x?: number; y?: number };
export interface EquipmentEffectState { stacks: number; until: number; ready: number; value: number; tick: number; count: number; duration: number }
export interface EquipmentMark { until: number; stacks: number; tick: number }
export interface EquipmentVisual { id: number; family: number; x: number; y: number; fromX?: number; fromY?: number; size: number; start: number; duration: number; target?: number; player?: boolean; legendary?: boolean }
export interface EquipmentLoot { id: number; definitionId: EquipmentRewardId; x: number; y: number; age: number; collection?: { age:number; x:number; y:number; source:string } }
export interface EquipmentState {
  nextInstanceId: number;
  components: EquipmentInstance[]; completed: EquipmentInstance[];
  equipped: [EquipmentInstance | null, EquipmentInstance | null, EquipmentInstance | null];
  craftSlots: [EquipmentInstance | null, EquipmentInstance | null];
  items: Record<string, number>; componentPage: number; completedPage: number;
  craftJob?: { resultId: EquipmentDefinitionId; startedUiAt: number; duration: 3 };
  telemetry: Record<string, Record<string, number>>;
  effects: Record<string, EquipmentEffectState>; marks: Record<number, Record<string, EquipmentMark>>;
  eliteDropWave: number; eliteKillsThisWave: number;
  loot: EquipmentLoot[]; visuals: EquipmentVisual[]; nextVisualId: number;
  orb?: { x: number; y: number; until: number; shield: boolean; scale: number };
  meteors: { x: number; y: number; at: number; scale: number }[];
  lastX?: number; lastY?: number;
  hubTarget?: {x:number;y:number};
  fireCast?: { skillId?: SkillId; cast: unknown; at: number; targets: number[] };
  endedSkills: SkillId[];
  presentationGate: Record<string,number>;
}
export function createEquipmentState(): EquipmentState {
  return { nextInstanceId: 1, components: [], completed: [], equipped: [null,null,null], craftSlots: [null,null], items: {}, componentPage: 0, completedPage: 0, telemetry: {}, effects: {}, marks: {}, eliteDropWave: -1, eliteKillsThisWave: 0, loot: [], visuals: [], nextVisualId: 1, meteors: [], endedSkills: [], presentationGate: {} };
}
export const equipmentState = (s: AircraftCombatState): EquipmentState => s.equipment ??= createEquipmentState();
const familyCache = new WeakMap<EquipmentState, {signature:string; families:Map<EquipmentFamilyId, typeof EQUIPMENT_CATALOG[EquipmentDefinitionId]>}>();
export function activeEquipmentFamilies(s: AircraftCombatState) {
  const state=equipmentState(s),signature=state.equipped.map(item=>item?.definitionId??"").join("|");
  const cached=familyCache.get(state);if(cached?.signature===signature)return cached.families;
  const result = new Map<EquipmentFamilyId, typeof EQUIPMENT_CATALOG[EquipmentDefinitionId]>();
  for (const item of equipmentState(s).equipped) if(item) {
    const d=EQUIPMENT_CATALOG[item.definitionId];
    if(d.family && (!result.has(d.family) || d.rarity === "legendary")) result.set(d.family,d);
  }
  familyCache.set(state,{signature,families:result});
  return result;
}
export function equipmentScale(s: AircraftCombatState, family: number): number {
  const d=activeEquipmentFamilies(s).get(`TH${String(family).padStart(2,"0")}`);
  return d ? d.rarity === "legendary" ? 2 : 1 : 0;
}
export function equipmentEffect(s: AircraftCombatState, family: number): EquipmentEffectState {
  return equipmentState(s).effects[family] ??= {stacks:0,until:0,ready:0,value:0,tick:0,count:0,duration:0};
}
export function equipmentMetric(s: AircraftCombatState, family: number, key: string, value: number) {
  if(!Number.isFinite(value) || value <= 0) return;
  const t=equipmentState(s).telemetry[`TH${String(family).padStart(2,"0")}`] ??= {};
  t[key]=(t[key]??0)+value;
}
export function clampEquipmentPages(e: EquipmentState) {
  e.componentPage=Math.max(0,Math.min(e.componentPage,Math.ceil(e.components.length/40)-1));
  e.completedPage=Math.max(0,Math.min(e.completedPage,Math.ceil(e.completed.length/40)-1));
}
/** All reward sources share instance allocation and an explicit acquisition event. */
export function grantEquipmentReward(s: AircraftCombatState, id: EquipmentRewardId, source: string, position?: {x:number;y:number}) {
  const e=equipmentState(s);
  if(id === "VP01") e.items.VP01=(e.items.VP01??0)+1;
  else {
    const item={instanceId:e.nextInstanceId++,definitionId:id};
    (EQUIPMENT_CATALOG[id].rarity === "component" ? e.components : e.completed).push(item);
  }
  s.coreState.acquisitions.push({id:s.coreState.nextAcquisitionId++,kind:id === "VP01" ? "item" : "equipment",definitionId:id,source,...position});
}
export function randomEquipmentId(prefix: "TP"|"TH"|"HL", random:()=>number): EquipmentDefinitionId {
  return `${prefix}${String(1+Math.min(prefix === "TP" ? 7 : 35,Math.floor(random()*(prefix === "TP" ? 8 : 36)))).padStart(2,"0")}`;
}
export function equipEquipment(s: AircraftCombatState, instanceId: number): boolean {
  const e=equipmentState(s), slot=e.equipped.indexOf(null);
  if(slot<0) return false;
  for(const inventory of [e.components,e.completed]) {
    const i=inventory.findIndex(item=>item.instanceId===instanceId);
    if(i>=0) { e.equipped[slot]=inventory.splice(i,1)[0];clampEquipmentPages(e);return true; }
  }
  return false;
}
export function extractEquipment(s: AircraftCombatState): EquipmentInstance[] {
  const e=equipmentState(s), items=e.equipped.filter((i):i is EquipmentInstance=>!!i);
  if(!items.length || !(e.items.VP01>0))return [];
  for(const item of items)(item.definitionId.startsWith("TP")?e.components:e.completed).push(item);
  e.equipped=[null,null,null];e.items.VP01--;
  e.effects={};e.marks={};e.visuals=[];e.presentationGate={};e.orb=undefined;e.meteors=[];e.fireCast=undefined;e.endedSkills=[];
  for(const key of Object.keys(s.coreState.shields))if(key.startsWith("equipment:"))delete s.coreState.shields[key];
  return items;
}
export function toggleCraftComponent(s: AircraftCombatState, id:number) {
  const e=equipmentState(s);if(e.craftJob)return;
  const reserved=e.craftSlots.findIndex(i=>i?.instanceId===id);
  if(reserved>=0){e.components.push(e.craftSlots[reserved]!);e.craftSlots[reserved]=null;}
  else {const i=e.components.findIndex(i=>i.instanceId===id),slot=e.craftSlots.indexOf(null);if(i>=0&&slot>=0)e.craftSlots[slot]=e.components.splice(i,1)[0];}
  clampEquipmentPages(e);
}
export function cancelEquipmentCraft(s: AircraftCombatState) {
  const e=equipmentState(s);for(const item of e.craftSlots)if(item)e.components.push(item);
  e.craftSlots=[null,null];delete e.craftJob;clampEquipmentPages(e);
}
export function startEquipmentCraft(s: AircraftCombatState, uiTime:number) {
  const e=equipmentState(s),[a,b]=e.craftSlots;if(!a||!b||e.craftJob)return;
  const resultId=equipmentRecipe(a.definitionId,b.definitionId);if(resultId)e.craftJob={resultId,startedUiAt:uiTime,duration:3};
}
export function tickEquipmentCraft(s: AircraftCombatState, uiTime:number) {
  const e=equipmentState(s), job=e.craftJob;if(!job || uiTime-job.startedUiAt<job.duration)return;
  e.craftSlots=[null,null];delete e.craftJob;grantEquipmentReward(s,job.resultId,"craft");
}
