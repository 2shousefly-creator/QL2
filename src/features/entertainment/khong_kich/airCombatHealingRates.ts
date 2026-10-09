import type { AircraftCombatState, EffectiveAircraftStats } from './airCombatTypes';
import { EQUIPMENT_POWER as P } from './airCombatEquipmentBalance';
import { equipmentScale } from './airCombatEquipmentState';

// Raw rates shared by settlement and the read-only HUD summary. Receipt modifiers
// belong to healAircraft / the summary, never these source formulas.
export function coreHealingRate(s:AircraftCombatState, stats:EffectiveAircraftStats, row:number):number {
 const c=s.coreState;
 if(s.status.regenDisabledUntil>c.time)return 0;
 if(row===62)return s.currentHp<stats.maxHp*.22?Math.max(0,stats.maxHp-s.currentHp)*.01:0;
 if(row===92)return stats.maxHp*(c.time-c.lastDamage>=3.5?.018:.002);
 return 0;
}
export function expansionHealingRate(stats:EffectiveAircraftStats,row:number):number {
 return row===176?stats.maxHp*.01:row===76?stats.maxHp*.10/4:0;
}
export function equipmentHealingRate(s:AircraftCombatState,stats:EffectiveAircraftStats,family:number):number {
 const scale=equipmentScale(s,family);
 if(family===3)return (s.equipment?.effects[3]?.value??0)/1.5;
 if(family===27)return Math.max(0,stats.maxHp-s.currentHp)*P[27].regen*scale;
 if(family===29)return stats.maxHp*P[29].heal*scale/3;
 return 0;
}
