import { terraHud, terraState } from './airCombatTerraRuntime';
import { sylvaState } from './airCombatSylvaRuntime';
import { argentArrayActive, argentState } from './airCombatArgentRuntime';
import React from 'react';
import { CoreDescription } from './CoreDescription';
import { PASSIVES, PASSIVE_LEVELS, passiveTier, passiveMetrics } from './airCombatPassives';
import { resolveTooltipValues } from './airCombatTooltipValues';
import { SkillIcon } from './SkillIcon';
import { cinderState } from './airCombatCinderRuntime';
import { getEffectiveAircraftStats } from './airCombatAircraft';
import type { AircraftCombatState } from './airCombatTypes';
import type { CombatWorld } from './airCombatRuntime';
export function PassiveDetails({state,world,heading=true}:{state:AircraftCombatState;world?:CombatWorld;heading?:boolean}){
 const p=PASSIVES[state.aircraftId],tier=passiveTier(state.level),runtime=world?cinderState(world):undefined;
 const stats=getEffectiveAircraftStats(state),metrics=passiveMetrics(state),number=(n:number)=>n.toLocaleString('vi-VN',{maximumFractionDigits:1});
 // Only tier progressions are collapsed; distinct bounce hits and formula operands are preserved.
 const currentDescription=p.description.replace('1/2/3/4 Giáp',String(tier+1)+' Giáp').replace(/\d+(?:,\d+)?(?:\/\d+(?:,\d+)?)+%/g,values=>values.slice(0,-1).split('/')[tier]+'%')
   .replace(' ở cấp chiến cơ 1/6/11/16','');
 const primaryBasis=metrics.lastPrimaryBeforeCrit??stats.firepower;
 const followupFactor=state.selectedCores.includes("core_229")?.55:1;
 const description=resolveTooltipValues(currentDescription.replace(/(\d+)% sát thương trước chí mạng/,(_,percent:string)=>`${number(primaryBasis*Number(percent)/100*followupFactor)} (${percent}% sát thương trước chí mạng)`),{stats,currentHp:state.currentHp});
 return <div className='air-passive-details'>
 {heading&&<div className='air-tooltip-heading'><h3>{p.name}</h3></div>}
 <p>Nội Tại · Bậc {tier+1} · Cấp chiến cơ {state.level}</p>
 <p><CoreDescription text={description}/></p>
 {state.aircraftId==='black_eagle'&&<p>Quy đổi Bắn Bồi theo {metrics.lastPrimaryBeforeCrit===undefined?'đạn cơ bản hiện tại':'đòn chính trúng gần nhất'}, trước Giáp của mục tiêu.</p>}
 {world&&<div className='air-tooltip-details'>
  <strong>Thống kê trận / vòng hiện tại</strong>
  {state.aircraftId==='terra'?<p>Địa Áp: {number(terraHud(world)?.pressure??0)} / {number(terraHud(world)?.cap??0)}. Chỉ ghi nhận Máu thực tế mất do sát thương.</p>:state.aircraftId==='sylva'?<p>Giảm {tier+1} Giáp mỗi viên trúng · Cộng dồn được làm mới về 5 giây. Nội tại không tự gây sát thương.</p>:state.aircraftId==='phantom'?<p>Điện đã hồi: {number(metrics.resource)}</p>:<>
   <p>Sát thương nội tại lên Máu: {number(metrics.damage)} · lên Lá Chắn: {number(metrics.shieldDamage)}</p>
   <p>Số lần gây sát thương nội tại: {metrics.hits}</p>
   {state.aircraftId==='cinder'&&<p>Sát thương Cháy lên Máu: {number(metrics.burnDamage)} · lên Lá Chắn: {number(metrics.burnShieldDamage)}. Tính Cháy từ đòn đánh và kỹ năng.</p>}
   <p>Tổng sát thương đã gây ra: {number(metrics.damage+metrics.shieldDamage+metrics.burnDamage+metrics.burnShieldDamage)}</p>
  </>}
 </div>}
 <div className='air-tooltip-details'>Tự mở theo cấp chiến cơ, không cần điểm kỹ năng hoặc tài nguyên.</div>
 <div className='air-rank-preview'>{PASSIVE_LEVELS.map((level,i)=><section key={level} data-unlocked={i<=tier} data-current={i===tier}><strong><SkillIcon id={p.id} className="air-skill-upgrade-icon"/>Cấp chiến cơ {level}</strong><p><CoreDescription text={resolveTooltipValues(state.aircraftId==='terra'?`Trần Địa Áp: ${Math.round(p.coefficients[i]*100)}% Máu tối đa. Ghi nhận 100% Máu thực mất; sau 4 giây không mất Máu, giảm 20% trần mỗi giây.`:state.aircraftId==='sylva'?`${p.coefficients[i]} Giáp mỗi lần trúng; làm mới toàn bộ cộng dồn về 5 giây; Tinh Anh tối đa 120, Boss 80 Giáp.`:state.aircraftId==='phantom'?'8 Điện/giây, tối đa 40 Điện':Math.round(p.coefficients[i]*100)+'% '+(state.aircraftId==='breaker'?'Giáp hiện tại':(state.aircraftId==='black_eagle'||state.aircraftId==='riptide')?'đòn chính trước chí mạng và giảm trừ':'Hỏa Lực')+(state.aircraftId==='cinder'?`; Cháy đủ 6 cộng dồn: ${[35,40,45,50][i]}% Hỏa Lực mỗi giây.`:''),{stats,currentHp:state.currentHp})}/></p></section>)}</div>
 {world&&state.aircraftId==='argent'&&<p>Sinh Nhận: {argentState(world).progress}/4 loạt trúng{argentArrayActive(world)?' · Tạm ngừng trong kiếm trận':''}.</p>}
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
 <span className='air-passive-caption'>{a.aircraftId==='terra'?Math.round((terraHud(world)?.pressure??0)/Math.max(1,terraHud(world)?.cap??1)*100)+'% Địa Áp':a.aircraftId==='argent'?(argentArrayActive(world)?'Tạm ngừng · ':'')+argentState(world).progress+'/4':battery?(b.phase==='charging'?Math.floor(b.charge)+'%':b.phase==='ready'?'Sẵn sàng':b.phase==='feeding'?'Nạp Điện':'Chờ nguội'):'Nội Tại'}</span></button>;
}
