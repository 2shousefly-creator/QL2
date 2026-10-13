import type { CombatWorld } from './airCombatRuntime';
import { playerAirframeScale } from './airCombatReleaseState';

export type GeneratedMechanismPainter=(id:number,asset:string,x:number,y:number,width:number,height:number,alpha:number,charge:number)=>void;
/** Keep weapon charging distinct from the shared aircraft buff glow. */
export function paintGeneratedMechanisms(w:CombatWorld,paint:GeneratedMechanismPainter,_reduced:boolean) {
 if(w.destruction||w.aircraft.currentHp<=0||w.laserCharge<=0)return;
 const scale=playerAirframeScale(w.aircraft);
 paint(-1300005,'focus_laser',w.playerX,w.playerY-27*scale,14*scale,22*scale,.35,1);
}
