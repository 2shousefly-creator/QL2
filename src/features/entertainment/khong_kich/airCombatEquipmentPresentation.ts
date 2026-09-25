import { EQUIPMENT_POWER as P } from "./airCombatEquipmentBalance";
import { releaseState } from "./airCombatReleaseState";
import { WAITING_CHEST_DESCRIPTION } from "./airCombatEquipmentRewards";
import { EQUIPMENT_CATALOG, type EquipmentDefinitionId } from "./airCombatEquipmentCatalog";
import { activeEquipmentFamilies, equipmentState, equipmentEffect, equipmentScale } from "./airCombatEquipmentState";
import { getTempestJewelledCritDamageBonus, equipmentGeminiMode } from "./airCombatEquipmentStats";
import { getEffectiveAircraftStats } from "./airCombatAircraft";
import type { AircraftCombatState } from "./airCombatTypes";
import type { CombatWorld } from "./airCombatRuntime";
import type { StatusPresentation } from "./airCombatPresentation";
const number=(n:number)=>n.toLocaleString("vi-VN",{maximumFractionDigits:2});
const labels:Record<string,string>={bonusDamage:"Sát thương cộng thêm",damage:"Sát thương gây ra",healed:"HP hồi thực tế",resource:"Tài Nguyên hồi thực tế",extraHealing:"HP hồi thêm từ hiệu ứng",extraResource:"Tài Nguyên hồi thêm từ hiệu ứng",procs:"Lần kích hoạt",peak:"Cộng dồn cao nhất",uptime:"Thời gian hiệu lực (giây)",maxStackTime:"Thời gian tối đa cộng dồn (giây)",shields:"Lá chắn tạo",shieldCreated:"Lá chắn đã tạo",shieldAbsorbed:"Lá chắn đã hấp thụ",marks:"Hỏa Ấn đã đặt",explosions:"Hỏa Ấn phát nổ",aoeTargets:"Mục tiêu AoE",targets:"Mục tiêu chịu hiệu ứng",skillCrits:"Kỹ năng chí mạng",echoes:"Tàn Ảnh tạo",merged:"Lần hợp nhất",hits:"Mục tiêu trúng",chains:"Chuỗi sét",charged:"Lần đầy Điện Năng",stacks:"Cộng dồn đã áp",prevented:"Sát thương ngăn chặn",stored:"HP mất đã lưu vào Bộ Đệm",orbs:"Châu tạo",lifeOrbs:"Sinh Châu nhặt",shieldOrbs:"Hộ Châu nhặt",meteors:"Thiên thạch gọi",slows:"Lần làm chậm",cooldown:"Giây hồi chiêu đã giảm",offenseTime:"Thời gian chế độ tấn công (giây)",hpTime:"Thời gian hỗ trợ hồi HP (giây)",resourceTime:"Thời gian hỗ trợ hồi Tài Nguyên (giây)",siphonTime:"Thời gian hút máu (giây)",lowHpHealing:"HP hồi khi dưới 30%",saved:"Tài Nguyên tiết kiệm",basicCooldown:"Giây hồi chiêu giảm bởi đạn thường",criticalCooldown:"Giây hồi chiêu giảm bởi chí mạng"};
export function equipmentTelemetry(s:AircraftCombatState,id:EquipmentDefinitionId):string[] {
  const d=EQUIPMENT_CATALOG[id];if(!d.family)return [];
  const f=Number(d.family.slice(2)),result=Object.entries(equipmentState(s).telemetry[d.family]??{}).map(([key,value])=>`${labels[key]??key}: ${number(value)}`);
  if(f===8)result.unshift(`Synergy hiện tại: +${number(getTempestJewelledCritDamageBonus(s)*100)}% Sát Thương Chí Mạng`);
  if(f===9)result.unshift(`+${number(P[9].rate*equipmentScale(s,9)*100)}% tổng Tốc Độ Bắn từ hiệu ứng`);
  if(f===22)result.unshift(`+${number(getEffectiveAircraftStats(s).maxHp*(1-1/(1+P[22].hp*equipmentScale(s,22))))} Máu Tối Đa từ hiệu ứng`);
  if(f===31)result.unshift(`+${number(P[31].resource*equipmentScale(s,31))} Tài Nguyên Tối Đa từ hiệu ứng`);
  if(f===36)result.unshift(`+${P[36].crit*100*equipmentScale(s,36)}% Sát Thương Chí Mạng từ hiệu ứng`);
  return result;
}
export function equipmentStatuses(w:CombatWorld):StatusPresentation[] {
  const s=w.aircraft,t=s.coreState.time,stats=getEffectiveAircraftStats(s),result:StatusPresentation[]=[];
  const chest=releaseState(s).waitingChest;
  if(chest&&!chest.cancelled)result.push({id:"core_227:chest",group:"buff",name:"Chờ Đợi Xứng Đáng?",icon:{kind:"core",id:"core_227"},description:WAITING_CHEST_DESCRIPTION,source:"Lõi 227",stacks:0,remaining:chest.claimed?Infinity:chest.remaining,duration:500,priority:100,timerKind:"cooldown",showNumericTimer:!chest.claimed,timeLabel:chest.claimed?"Đã mở Rương":undefined,rewardMessage:chest.claimed?`Đã nhận phần thưởng: ${chest.rewardLabel}`:undefined});
  for(const d of activeEquipmentFamilies(s).values()) {
    const f=Number(d.family!.slice(2)),e=equipmentEffect(s,f),active=e.until>t,cooldown=e.ready>t;
    const dynamic=[2,3,4,5,6,10,11,12,13,14,17,18,19,20,21,23,24,25,26,28,29,30,32,33,34,35].includes(f);
    if(!dynamic)continue;
    const charged=[6,12,13,18,23,24].includes(f),mode=f===28?equipmentGeminiMode(s,stats.maxHp,stats.maxResource):f===33?s.currentHp>=stats.maxHp*.5?"offense":"siphon":undefined;
    const ready=[3,4,5,17,19,25].includes(f);
    if(!active&&!cooldown&&!charged&&!mode&&!ready&&!(f===10&&e.stacks>0))continue;
    const cap=f===2?20:f===10?6:f===13?100:f===21?4:f===26?6:0;
    let badge=cap?`${number(f===13?e.value:e.stacks)}/${cap}`:f===6?`${e.count%8}/8`:f===12?`${e.count%5}/5`:f===18?number(e.value):f===23?`${number(e.value/stats.maxHp*100)}%`:f===24?`${number(e.value/stats.maxResource*100)}%`:undefined;
    const remaining=active?e.until-t:cooldown?e.ready-t:Infinity;
    const modeLabel=mode==="offense"?"Tấn công":mode==="hp"?"Hồi HP":mode==="resource"?"Hồi Tài Nguyên":mode==="siphon"?"Hút máu":undefined;
    result.push({id:`equipment:${d.id}`,group:"buff",name:d.name,icon:{kind:"equipment",id:d.id},description:d.effect,source:`${d.rarity==="legendary"?"Trang Bị Huyền Thoại":"Trang Bị"} · ${d.name}`,stacks:e.stacks,badgeText:badge,badgeKind:charged?"charge":"stack",remaining,duration:active?e.duration:cooldown?Math.max(remaining,1):Infinity,priority:active?58:40,timerKind:active?"active":"cooldown",timeLabel:modeLabel??(remaining===Infinity?"Sẵn sàng":undefined),showNumericTimer:!badge&&Number.isFinite(remaining)});
  }
  return result;
}
