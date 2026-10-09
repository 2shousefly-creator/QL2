import { EQUIPMENT_POWER as P } from "./airCombatEquipmentBalance";
import type { AircraftCombatState, EffectiveAircraftStats } from "./airCombatTypes";
import { EQUIPMENT_CATALOG } from "./airCombatEquipmentCatalog";
import { equipmentState, equipmentScale, equipmentEffect } from "./airCombatEquipmentState";
export function canSkillsCrit(s: AircraftCombatState) { return s.selectedCores.includes("core_053") || equipmentScale(s,8)>0; }
export function getTempestJewelledCritDamageBonus(s: AircraftCombatState) { return 0; }
export function equipmentUntargetable(s: AircraftCombatState) {return equipmentScale(s,3)>0 && equipmentEffect(s,3).until>s.coreState.time;}
export function equipmentGeminiMode(s: AircraftCombatState, hp:number, resource:number) {
  const h=s.currentHp/hp,r=s.currentResource/resource;
  return h>.5&&r>.5 ? "offense" : h<=r ? "hp" : "resource";
}
export function applyEquipmentStats(s: AircraftCombatState, stats: EffectiveAircraftStats, temporary: boolean, omittedEffect?: number) {
  let regen=0;
  for(const item of equipmentState(s).equipped)if(item)for(const [key,value] of Object.entries(EQUIPMENT_CATALOG[item.definitionId].stats)) {
    if(key==="resourceRegenPct")regen+=value!;
    else {stats[key as "firepower"]+=value!;if(key==="hpRegen")stats.permanentHpRegenBonus+=value!;}
  }
  stats.bonusResourceRegenPct+=regen;stats.permanentResourceRegenPct+=regen;
  const scale=(id:number)=>id===omittedEffect?0:equipmentScale(s,id),active=(id:number)=>equipmentEffect(s,id).until>s.coreState.time;
  stats.maxHp*=1+P[22].hp*scale(22);stats.maxResource*=1+P[31].maxResourcePct*scale(31);
  stats.criticalDamageMultiplier+=P[36].crit*scale(36);
  if(temporary) {
    if(active(2))stats.bonusFireRatePct+=equipmentEffect(s,2).stacks*P[2].bonusFireRatePct*scale(2);
    if(active(10)){stats.armor+=P[10].armor*scale(10);stats.bonusFireRatePct+=P[10].bonusFireRatePct*scale(10);stats.hpRegen+=P[10].regen*scale(10);}
    if(active(11))stats.bonusFireRatePct+=P[11].bonusFireRatePct*scale(11);
    if(active(14)){const strength=equipmentEffect(s,14).value;stats.bonusFireRatePct+=P[14].bonusFireRatePct*scale(14)*strength;stats.firepower+=P[14].firepower*scale(14)*strength;}
    if(active(20))stats.armor+=P[20].armor*scale(20);
    if(active(32))stats.bonusResourceRegenPct+=P[32].regen*scale(32)*equipmentEffect(s,32).value;
    if(active(26)&&equipmentEffect(s,26).stacks===6)stats.criticalDamageMultiplier+=P[26].crit*scale(26);
    const mode=equipmentGeminiMode(s,stats.maxHp,stats.maxResource);
    if(mode==="hp")stats.totalHpRegenMultiplier*=1+P[28].regen*scale(28);
    if(mode==="resource")stats.totalResourceRegenMultiplier*=1+P[28].regen*scale(28);
  }
  stats.totalFireRateMultiplier*=1+P[9].totalFireRate*scale(9);
}
