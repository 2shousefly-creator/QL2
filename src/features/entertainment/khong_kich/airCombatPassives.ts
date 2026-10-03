import type { AircraftId, PassiveId, AircraftCombatState } from './airCombatTypes';
export const PASSIVE_LEVELS=[1,6,11,16] as const;
export const passiveTier=(level:number)=>level>=16?3:level>=11?2:level>=6?1:0;
export const PASSIVES:Record<AircraftId,{id:PassiveId;name:string;coefficients:readonly number[];description:string}>={
 black_eagle:{id:'viper_follow_up',name:'Bắn Bồi',coefficients:[.2,.3,.4,.5],description:'+10% chí mạng. Đòn chính chí mạng phóng đạn bồi vào chính mục tiêu: 20/30/40/50% sát thương trước chí mạng; hồi chiêu riêng 0,5 giây, không chí mạng, không đổi mục tiêu hoặc tự kích hoạt lại.'},
 breaker:{id:'titan_alloy_rounds',name:'Đạn Hợp Kim',coefficients:[.21,.24,.27,.3],description:'Đòn bắn chính cộng 21/24/27/30% Giáp hiện tại thành sát thương thông thường không chí mạng. Oanh Tạc chỉ đạn giữa nhận sát thương cộng thêm; không thêm vào kỹ năng hoặc đạn phụ.'},
 phantom:{id:'phantom_backup_battery',name:'Pin Dự Phòng',coefficients:[8,8,8,8],description:'Pin riêng sạc +1,5%/giây; đầy và Điện dưới 10% thì tiêu hao 20% pin/giây trong 5 giây, nạp 8 Điện cố định/giây (tối đa 40). Chờ nguội 5 giây rồi sạc lại. Khởi đầu mỗi trận/vòng: 0%.'},
 astra:{id:'astra_stellar_mark',name:'Ấn Tinh Tú',coefficients:[.5,.7,.9,1.1],description:'Đòn chính đặt một ấn 4 giây. Kỹ năng gây sát thương trực tiếp (kể cả Song Tinh/phản chiếu) tiêu ấn gây thêm 50/70/90/110% Hỏa Lực thông thường không chí mạng. Mỗi mục tiêu hồi chiêu riêng 6 giây từ khi nổ, không đặt ấn trong hồi chiêu riêng; Sát thương kéo dài từ lõi hoặc trang bị không kích nổ.'},
 cinder:{id:'cinder_thermal_round',name:'Đạn Hỏa Nhiệt',coefficients:[.25,.35,.45,.55],description:'Đòn chính đầu tiên và sau mỗi hồi chiêu riêng 3 giây trên từng mục tiêu gây thêm 25/35/45/55% Hỏa Lực thông thường không chí mạng và +1 Cháy. Trong hồi chiêu riêng, nội tại không gây sát thương cộng thêm, không thêm hoặc làm mới Cháy. Cháy: tổng 35/40/45/50% Hỏa Lực mỗi giây khi đủ 6 cộng dồn ở cấp chiến cơ 1/6/11/16; mỗi cộng dồn bằng 1/6 mức đó, gây sát thương mỗi 0,5 giây; tối đa 6 cộng dồn, tồn tại 6 giây; sát thương chuẩn vẫn bị khiên hấp thụ và không xuyên bất khả xâm phạm.'}
};
export const passiveCoefficient=(s:AircraftCombatState)=>PASSIVES[s.aircraftId].coefficients[passiveTier(s.level)];

export interface PassiveMetrics { damage:number; shieldDamage:number; burnDamage:number; burnShieldDamage:number; resource:number; hits:number; lastPrimaryBeforeCrit?:number }
const metrics = new WeakMap<AircraftCombatState, PassiveMetrics>();
export function passiveMetrics(state:AircraftCombatState):PassiveMetrics {
 let value=metrics.get(state);
 if(!value){value={damage:0,shieldDamage:0,burnDamage:0,burnShieldDamage:0,resource:0,hits:0};metrics.set(state,value);}
 return value;
}
export function recordPassiveDamage(state:AircraftCombatState,hp:number,shield:number,burn=false){
 const m=passiveMetrics(state);
 if(burn){m.burnDamage+=Math.max(0,hp);m.burnShieldDamage+=Math.max(0,shield);}
 else {m.damage+=Math.max(0,hp);m.shieldDamage+=Math.max(0,shield);if(hp+shield>0)m.hits++;}
}
