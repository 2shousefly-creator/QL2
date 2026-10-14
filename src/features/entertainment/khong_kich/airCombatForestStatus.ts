import type { CombatWorld } from './airCombatRuntime';
import type { StatusPresentation } from './airCombatPresentation';
import { hasCore } from './airCombatCoreEffects';
export function forestStatuses(w:CombatWorld):StatusPresentation[]{
 if(w.stageId!==6)return [];
 const s=w.aircraft.status,now=w.aircraft.coreState.time,result:StatusPresentation[]=[];
 const timed=[
  ['forestRootUntil','Trói Chân','forest_root','Dừng di chuyển; vẫn bắn và dùng kỹ năng nếu không chịu khóa khác.'],
  ['forestStunUntil','Choáng','forest_stun',hasCore(w.aircraft,203)?'Không thể di chuyển; Ý Chí Bất Khuất cho phép bắn và dùng kỹ năng.':'Không thể di chuyển, bắn hoặc kích hoạt kỹ năng.'],
  ['forestArmorUntil','Ăn Mòn','forest_acid','Giảm 30% Giáp; mức giảm không cộng dồn.'],
  ['skillLockedUntil','Câm Lặng','forest_silence','Khóa kích hoạt kỹ năng mới; giữ các ngoại lệ và kỹ năng đang hoạt động.'],
  ['resourceJammedUntil','Nhiễu Sinh Học','forest_resource_jam',`Giảm ${Math.round((1-Math.min(1,...s.jams.filter(j=>j.until>now).map(j=>j.multiplier)))*100)}% tốc độ hồi tài nguyên; giữ nguyên tài nguyên hiện có.`],
  ['healingReceivedUntil','Nhiễm Độc','forest_poison',`Giảm ${Math.round((1-s.healingReceivedMultiplier)*100)}% hiệu quả hồi phục; mức giảm không cộng dồn.`],
 ] as const;
 for(const [key,name,id,description] of timed){const until=s[key]??0;if(until>now)result.push({id:key,name,description,icon:{kind:'forest',id},group:'debuff',source:'Sinh vật Dạ Lâm',stacks:1,remaining:until-now,duration:s.durations[key]??4,priority:115});}
 if((s.forestResistUntil??0)>now&&Math.max(s.forestRootUntil??0,s.forestStunUntil??0)<=now)result.push({id:'forest-resist',name:'Kháng Khống Chế Dạ Lâm',description:'Kháng Trói và Choáng từ sinh vật Màn 6 trong 1 giây; vẫn nhận sát thương và debuff mềm.',icon:{kind:'forest',id:'forest_control_resist'},group:'buff',source:'Dạ Lâm',stacks:1,remaining:s.forestResistUntil!-now,duration:1,priority:115});
 return result;
}
