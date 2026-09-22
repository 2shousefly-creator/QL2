import type { AircraftCombatState, EffectiveAircraftStats } from "./airCombatTypes";
import { EQUIPMENT_CATALOG } from "./airCombatEquipmentCatalog";
import { equipmentState, equipmentScale, equipmentEffect } from "./airCombatEquipmentState";
export function canSkillsCrit(s: AircraftCombatState) { return s.selectedCores.includes("core_053") || equipmentScale(s,8)>0; }
export function getTempestJewelledCritDamageBonus(s: AircraftCombatState) { return s.selectedCores.includes("core_053") ? .5*equipmentScale(s,8) : 0; }
export function equipmentUntargetable(s: AircraftCombatState) {return equipmentScale(s,3)>0 && equipmentEffect(s,3).until>s.coreState.time;}
export function equipmentGeminiMode(s: AircraftCombatState, hp:number, resource:number) {
  const h=s.currentHp/hp,r=s.currentResource/resource;
  return h>.5&&r>.5 ? "offense" : h<=r ? "hp" : "resource";
}
export function applyEquipmentStats(s: AircraftCombatState, stats: EffectiveAircraftStats, temporary: boolean, omittedEffect?: number) {
  let regen=0;
  for(const item of equipmentState(s).equipped)if(item)for(const [key,value] of Object.entries(EQUIPMENT_CATALOG[item.definitionId].stats)) {
    if(key==="resourceRegenPct")regen+=value!;
    else stats[key as "firepower"]+=value!;
  }
  stats.resourceRegen*=1+regen;
  const scale=(id:number)=>id===omittedEffect?0:equipmentScale(s,id),active=(id:number)=>equipmentEffect(s,id).until>s.coreState.time;
  stats.maxHp*=1+.15*scale(22);stats.maxResource*=1+.12*scale(31);
  stats.criticalDamageMultiplier+=getTempestJewelledCritDamageBonus(s)+.45*scale(36);
  if(temporary) {
    if(active(2))stats.fireRate+=equipmentEffect(s,2).stacks*.03*scale(2);
    if(equipmentEffect(s,10).stacks>=15){stats.armor+=40*scale(10);stats.fireRate+=.35*scale(10);stats.hpRegen+=scale(10);}
    if(active(11))stats.fireRate+=.6*scale(11);
    if(active(14)){stats.fireRate+=.7*scale(14);stats.firepower+=35*scale(14);}
    if(active(20))stats.armor+=40*scale(20);
    if(active(32))stats.resourceRegen*=1+.3*scale(32);
    if(s.currentHp>=stats.maxHp*.5)stats.firepower*=1+.1*scale(33);
    const mode=equipmentGeminiMode(s,stats.maxHp,stats.maxResource);
    if(mode==="hp")stats.hpRegen*=1+.15*scale(28);
    if(mode==="resource")stats.resourceRegen*=1+.15*scale(28);
  }
  stats.fireRate*=1+.25*scale(9);
}
