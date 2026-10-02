import React from 'react';
import { CoreDescription } from './CoreDescription';
import { PASSIVES, PASSIVE_LEVELS, passiveTier, passiveCoefficient } from './airCombatPassives';
import { SkillIcon } from './SkillIcon';
import { cinderState } from './airCombatCinderRuntime';
import { getEffectiveAircraftStats } from './airCombatAircraft';
import type { AircraftCombatState } from './airCombatTypes';
import type { CombatWorld } from './airCombatRuntime';
export function PassiveDetails({state,world,heading=true}:{state:AircraftCombatState;world?:CombatWorld;heading?:boolean}){
 const p=PASSIVES[state.aircraftId],tier=passiveTier(state.level),runtime=world?cinderState(world):undefined;
 return <div className='air-passive-details'>
 {heading&&<div className='air-tooltip-heading'><h3>{p.name}</h3></div>}
 <p>Nội Tại · Bậc {tier+1} · Cấp chiến cơ {state.level}</p>
 <p><CoreDescription text={p.description}/></p>
 <div className='air-tooltip-details'>Tự mở theo cấp chiến cơ, không cần điểm kỹ năng hoặc tài nguyên.</div>
 <div className='air-rank-preview'>{PASSIVE_LEVELS.map((level,i)=><section key={level} data-unlocked={i<=tier} data-current={i===tier}><strong>◆ Cấp chiến cơ {level}</strong><p><CoreDescription text={state.aircraftId==='phantom'?'8 Điện/giây, tối đa 40 Điện':Math.round(p.coefficients[i]*100)+'% '+(state.aircraftId==='breaker'?'Giáp hiện tại':state.aircraftId==='black_eagle'?'đòn chính trước chí mạng':'Hỏa Lực')}/></p></section>)}</div>
 {state.aircraftId==='breaker'&&<p><CoreDescription text={'Đang cộng '+Number((getEffectiveAircraftStats(state).armor*passiveCoefficient(state)).toFixed(1))+' sát thương mỗi đòn chính.'}/></p>}
 {runtime&&state.aircraftId==='phantom'&&<p>Pin {runtime.battery.charge.toFixed(1)}% · {batteryLabel(runtime.battery.phase)} {runtime.battery.remaining>0?runtime.battery.remaining.toFixed(1)+' giây':''}. Điện hiện tại: {state.currentResource.toFixed(1)}.</p>}
 {(state.aircraftId==='astra'||state.aircraftId==='cinder')&&<p>Hồi chiêu được tính độc lập trên từng mục tiêu; xem dấu ấn/Cháy tại mục tiêu.</p>}
 </div>;
}
const batteryLabel=(phase:string)=>({charging:'Đang sạc pin',ready:'Sẵn sàng',feeding:'Đang nạp Điện',cooling:'Chờ nguội'}[phase]??phase);
export function PassiveCell({world,onInspect}:{world:CombatWorld;onInspect:()=>void}){
 const a=world.aircraft,p=PASSIVES[a.aircraftId],s=cinderState(world),b=s.battery,cd=Math.max(0,s.followReady-world.elapsed);
 const battery=a.aircraftId==='phantom',progress=b.phase==='feeding'?b.remaining/5:b.phase==='cooling'?1-b.remaining/5:b.charge/100;
 return <button type='button' className='air-passive-trigger' data-combat-tooltip-trigger='passive' aria-label={p.name+' · Xem nội tại'} onPointerDown={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()} onClick={onInspect}>
 <span className='air-passive-frame'><SkillIcon id={p.id} className='air-passive-icon'/>{a.aircraftId==='black_eagle'&&cd>0&&<span className='air-passive-mask' style={{height:cd/.5*100+'%'}}/>}{battery&&<span className='air-passive-progress' style={{width:progress*100+'%'}}/>}</span>
 <span className='air-passive-caption'>{battery?(b.phase==='charging'?Math.floor(b.charge)+'%':b.phase==='ready'?'Sẵn sàng':b.phase==='feeding'?'Nạp Điện':'Chờ nguội'):'Nội Tại'}</span></button>;
}
