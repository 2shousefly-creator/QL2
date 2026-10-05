import { soundManager } from '../../../game/audio';
import type { CombatWorld } from './airCombatRuntime';
import { riptideState } from './airCombatRiptideRuntime';

const states=new WeakMap<CombatWorld,{last:number;ambience:number;shot:number;blade?:number}>();
/** Presentation consumes bounded events on the match clock, never setInterval.
 * Voices last <=120ms; pausing stops all queued/ambient water voices immediately. */
export function playRiptideAudio(w:CombatWorld,paused:boolean) {
 if(paused){soundManager.stopWater();return;}
 let s=states.get(w);if(!s){s={last:0,ambience:0,shot:0};states.set(w,s);}
 const water=riptideState(w);
 if(w.aircraft.aircraftId==='riptide'&&w.aircraft.basicShotsFired>s.shot){s.shot=w.aircraft.basicShotsFired;soundManager.playWater('shot');}
 if(water.blades&&s.blade!==water.blades.id){s.blade=water.blades.id;soundManager.playWater('slash');}
 const events=water.effects.filter(e=>e.id>s!.last);
 if(events.length){s.last=Math.max(...events.map(e=>e.id));const burst=events.some(e=>e.kind==='burst'),impact=events.some(e=>e.kind==='impact'||e.kind==='afterwash');
  if(burst)soundManager.playWater('burst');else if(impact)soundManager.playWater('impact');else if(events.some(e=>e.kind==='heal'))soundManager.playWater('heal');}
 if(w.elapsed>=s.ambience){s.ambience=w.elapsed+.12;
  if(water.confluence&&!water.confluence.exploded)soundManager.playWater('pull',Math.min(1,(w.elapsed-water.confluence.at)/1.5));
  else if(water.waterform)soundManager.playWater('body');}
}
