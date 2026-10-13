import { activeEquipmentFamilies, equipmentEffect } from './airCombatEquipmentState';
import { getEffectiveAircraftStats } from './airCombatAircraft';
import { astraOrbitProtectionActive } from './airCombatAstra';
import { getStatusPresentations } from './airCombatPresentation';
import type { CombatWorld } from './airCombatRuntime';
import { playerAirframeScale } from './airCombatReleaseState';

const nodes:Record<string,number>={
 argent_guard:0,argent_guard_hit:0,argent_heart:1,
 sylva_tissue:0,sylva_storage:1,sylva_armor:2,sylva_buff:0,sylva_heal:0,
 riptide_wellspring_effect:0,riptide_water_shell:1,
 armor:0,armorCrack:0,shield:2,coreCracks:0,coreField:1,mechanism:0,charge:0,chargeReady:0,regenerate:2,
 guardian0:0,guardian1:1,guardian2:2,guardian3:0,
 charge0:0,charge1:0,charge2:0,charge3:0,
 passive_battery:1,battery_arc0:1,battery_arc1:2,
 pressure0:0,pressure1:0,pressure2:0,pressure3:0,
};
/** Suppress only the former caster hardpoints; target/area art keeps its geometry. */
export function isAircraftBuffVisual(w:CombatWorld,key:string,x:number,y:number){
 return nodes[key]!==undefined&&Math.hypot(x-w.playerX,y-w.playerY)<=48*playerAirframeScale(w.aircraft);
}

export const AIRCRAFT_BUFF_BRIGHTNESS=1.3;
const snapshots=new WeakMap<CombatWorld,{at:number;until:number;active:boolean}>();
/** Reuse live status semantics, excluding cooldown/ready-only badges. Bounded to
 * 10 reads/sec per actor; combat time freezes on pause and rewinds invalidate it. */
export function aircraftBuffBrightness(w:CombatWorld){
 if(w.destruction||w.aircraft.currentHp<=0)return 1;
 const s=w.aircraft;
 if(astraOrbitProtectionActive(w)||Object.values(s.activeEffects).some(value=>(value??0)>0)
  ||Object.values(s.coreState.shields).some(shield=>shield.amount>0&&shield.until>s.coreState.time))return AIRCRAFT_BUFF_BRIGHTNESS;
 let snapshot=snapshots.get(w);
 if(!snapshot||w.elapsed<snapshot.at||w.elapsed>=snapshot.until){
  const equipmentActive=[...activeEquipmentFamilies(s).values()].some(item=>{
   const family=Number(item.family!.slice(2)),effect=equipmentEffect(s,family);
   return family===28||family===33||(family===27&&s.currentHp<getEffectiveAircraftStats(s).maxHp)
    ||(family===10&&effect.stacks>0)||(family===13&&effect.value>0);
  });
  const buffs=getStatusPresentations(w).filter(status=>status.group==='buff'&&status.timerKind!=='cooldown'
   &&status.remaining>0&&(Number.isFinite(status.remaining)||status.priority>=58));
  snapshot={at:w.elapsed,until:w.elapsed+Math.min(.1,...buffs.map(status=>status.remaining)),active:equipmentActive||buffs.length>0};
  snapshots.set(w,snapshot);
 }
 return snapshot.active?AIRCRAFT_BUFF_BRIGHTNESS:1;
}
