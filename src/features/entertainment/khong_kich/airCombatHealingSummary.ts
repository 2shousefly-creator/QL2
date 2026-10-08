import type { CombatWorld } from './airCombatRuntime';
import { AIRCRAFT_CONFIGS } from './airCombatConfig';
import { getEffectiveAircraftStats } from './airCombatAircraft';
import { getHealingReceivedMultiplier } from './airCombatRecovery';
import { hasCore } from './airCombatCoreEffects';
import { equipmentScale } from './airCombatEquipmentState';
import { coreHealingRate, expansionHealingRate, equipmentHealingRate } from './airCombatHealingRates';
import { terraHealingRate } from './airCombatTerraRuntime';
import { riptideHealingRate } from './airCombatRiptideRuntime';

/** Current capacity before missing-HP clamping; never settles a receipt or proc. */
export function getHealingSummary(w:CombatWorld):{current:number;baseline:number} {
 const s=w.aircraft,c=s.coreState,stats=getEffectiveAircraftStats({...s,coreState:{...c,stacks:{...c.stacks}}}),config=AIRCRAFT_CONFIGS[s.aircraftId];
 const baseline=config.hpRegen.base+config.hpRegen.growth*(s.level-1);
 if(s.currentHp<=0||s.duel?.healingBlocked)return {current:0,baseline};
 let raw=stats.hpRegen+terraHealingRate(w,stats.maxHp)+riptideHealingRate(w,stats.firepower);
 const repair=c.emergencyRepair;
 if((s.activeEffects.invisibility??0)>0&&repair&&repair.remaining>0&&repair.durationRemaining>0)raw+=repair.rate;
 for(const row of [62,92])if(hasCore(s,row))raw+=coreHealingRate(s,stats,row);
 if(hasCore(s,176)&&c.stacks.breathing)raw+=expansionHealingRate(stats,176);
 if(hasCore(s,195)&&(c.timers.blackBox??0)>c.time)raw+=expansionHealingRate(stats,195);
 for(const family of [3,27,29])if(equipmentScale(s,family)>0&&(family===27||(s.equipment?.effects[family]?.until??0)>c.time))raw+=equipmentHealingRate(s,stats,family);
 return {current:Math.max(0,raw*getHealingReceivedMultiplier(s,stats.maxHp)),baseline};
}
