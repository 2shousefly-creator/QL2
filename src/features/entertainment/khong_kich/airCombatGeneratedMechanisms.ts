import type { CombatWorld } from './airCombatRuntime';
import { playerAirframeScale } from './airCombatReleaseState';

export type GeneratedMechanismPainter=(id:number,asset:string,x:number,y:number,width:number,height:number,alpha:number,charge:number)=>void;
/** Caster mechanisms read active effects. Existing target/projectile painters own every shot. */
export function paintGeneratedMechanisms(w:CombatWorld,paint:GeneratedMechanismPainter,reduced:boolean) {
  if(w.destruction||w.aircraft.currentHp<=0)return;
  const effects=w.aircraft.activeEffects,scale=playerAirframeScale(w.aircraft);
  const draw=(id:number,asset:string,width:number,height:number,alpha:number,charge=1,y=0)=>paint(id,asset,w.playerX,w.playerY+y*scale,width*scale,height*scale,alpha,charge);
  if((effects.afterburner??0)>0)draw(-1300001,'afterburner',61,65,.85);
  if((effects.sweeping_cannon??0)>0)draw(-1300002,'sweeping_cannon',74,70,.9);
  if((effects.armor_shield??0)>0)draw(-1300003,'armor_shield',78,78,reduced?.55:.68);
  if((effects.invisibility??0)>0)draw(-1300004,'invisibility',62,65,.24,.6);
  if(w.laserCharge>0)draw(-1300005,'focus_laser',24,48,.35,1,-23);
}
