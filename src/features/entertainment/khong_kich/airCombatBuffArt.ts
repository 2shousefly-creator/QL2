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
/** Small fixed hardpoints instead of a filled overlay across the fuselage. */
export function aircraftBuffPoint(w:CombatWorld,slot=0){
 const scale=playerAirframeScale(w.aircraft);
 return {x:w.playerX+(slot===0?0:slot===1?-11:11)*scale,y:w.playerY+(slot===0?-27:26)*scale,scale};
}
export function compactBuffPlacement(w:CombatWorld,key:string,x:number,y:number,width:number,height:number):[number,number,number,number]{
 const slot=nodes[key];
 if(slot===undefined||Math.hypot(x-w.playerX,y-w.playerY)>48*playerAirframeScale(w.aircraft))return [x,y,width,height];
 const point=aircraftBuffPoint(w,slot);
 return [point.x,point.y,Math.min(width,16*point.scale),Math.min(height,22*point.scale)];
}
