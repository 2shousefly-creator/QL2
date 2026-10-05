import { soundManager } from '../../../game/audio';
import type { CombatWorld } from './airCombatRuntime';
import { argentState } from './airCombatArgentRuntime';
const consumed=new WeakMap<CombatWorld,number>();
export function playArgentAudio(w:CombatWorld,paused:boolean){
 const effects=argentState(w).effects,last=consumed.get(w)??0,events=effects.filter(e=>e.id>last&&e.at<=w.elapsed);
 if(events.length)consumed.set(w,Math.max(...events.map(e=>e.id)));
 if(paused){soundManager.stopMetal();return;}
 if(events.some(e=>e.kind==='summon'))soundManager.playMetal('summon');
 else if(events.some(e=>e.kind==='break'))soundManager.playMetal('heavy');
 else if(events.some(e=>e.kind==='wave'))soundManager.playMetal('volley');
 else if(events.some(e=>e.kind==='mark'))soundManager.playMetal('mark');
 else if(events.some(e=>e.kind==='reunion'))soundManager.playMetal('reunion');
 else if(events.some(e=>e.kind==='guard'||e.kind==='stance'))soundManager.playMetal('guard');
 else if(events.some(e=>e.kind==='recall'||e.kind==='join'))soundManager.playMetal('recall');
 else if(events.some(e=>e.kind==='launch'||e.kind==='impact'))soundManager.playMetal('slash');
}
