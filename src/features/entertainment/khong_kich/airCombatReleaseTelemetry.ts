import type { AircraftCombatState } from "./airCombatTypes";
import { releaseState } from "./airCombatReleaseState";
import { arsenalBonuses, activeNegativeStatusTypes, hasAbsorbShield, expansionState } from "./airCombatExpansion";
import { CORE_SYSTEM_LABELS } from "./airCombatCoreSystems";
import { getCoreDefinition, SKILL_CONFIGS } from "./airCombatConfig";
import { getEffectiveAircraftStats } from "./airCombatAircraft";
import { hasCore } from "./airCombatCoreEffects";
import { recordCoreMetric } from "./airCombatTelemetry";
const number=(n:number)=>n.toLocaleString("vi-VN",{maximumFractionDigits:2});
export function releaseTelemetry(state:AircraftCombatState,row:number):string[]{
  const c=state.coreState,stats=getEffectiveAircraftStats(state),r=releaseState(state),expansion=expansionState(state),lines:string[]=[];
  const descriptions:Record<number,string>={
    169:state.currentResource/stats.maxResource>.7?"+10 Hỏa Lực":state.currentResource/stats.maxResource<.3?"+0,7 HP/s":"+0,2 Tốc Độ Bắn",
    172:c.stacks.capacitorCharge?"Đã tích điện":"Chưa tích đủ điện",179:`Sai Số: ${c.stacks.error??0}/10 · +${(c.stacks.error??0)*2}% Chí Mạng`,
    183:`+${Math.min(40,activeNegativeStatusTypes(state).size*20)} Giáp`,187:`Đang tích ${number(c.stacks.recoil??0)} sát thương`,188:"+15% Tỷ Lệ Chí Mạng",
    192:hasAbsorbShield(state)?"+15% mọi sát thương":"+14 Giáp",193:`Chuỗi: ${expansion.sequence.filter(cast=>c.time-cast.at<=7).length}/3 kỹ năng`,
    196:`+${number(Math.min(.5,(c.stacks.crimsonCrit??0)*.025)*100)}% Sát Thương Chí Mạng / 50%`,197:`Nợ còn lại: ${number(expansion.debt.reduce((n,d)=>n+d.amount*d.ticks,0))}`,
    199:`Cộng dồn quá tải: ${c.stacks.overclock??0}/3`,202:expansion.primarySkill?`Chủ lực: ${SKILL_CONFIGS[expansion.primarySkill].name}`:"Đang chờ chọn kỹ năng",
    204:`Khiên chờ hồi quy: ${expansion.returns.length}`,209:c.stacks.lastStand?"Tử Thủ đang hoạt động":"Chưa kích hoạt Tử Thủ",
  };
  if(descriptions[row])lines.push(descriptions[row]);
  if(row===201){const counts={attack:0,defense:0,resource:0,utility:0};for(const id of state.selectedCores){const core=getCoreDefinition(id);if(core.system!=="skill")counts[core.system]++;}const b=arsenalBonuses(state);lines.push(...Object.entries(counts).map(([system,count])=>`${CORE_SYSTEM_LABELS[system as keyof typeof counts]}: ${count}`),`Bắn thường +${number(b.basic*100)}% · Kỹ năng +${number(b.skill*100)}% · Giảm sát thương ${number(b.reduction*100)}%`);}
  if(row===208)lines.push(`+${number(stats.dualHpBonus??0)} HP/s từ Tế Bào Song Năng`,`+${number(stats.dualResourceBonus??0)} Tài Nguyên/s từ Tế Bào Song Năng`);
  if(row===213)lines.push(...Object.entries(r.refused).map(([id,expiry])=>`${id.slice(5)}: còn ${Math.max(0,expiry-r.completedSelections)} lượt chọn thường`));
  if(row===215)lines.push(r.system?`Hệ đã chọn: ${CORE_SYSTEM_LABELS[r.system]}`:"Đang chờ chọn Hệ");
  if(row===216)lines.push("Đã sử dụng · Giữ lại chỉ số vĩnh viễn đã kiếm được từ các Lõi chuyển đổi.");
  if(row===218)lines.push(`Reroll Dự Trữ: ${r.reserve} / ${hasCore(state,212)?4:3}`);
  if(row===219)lines.push(`Nhiệt: ${number(r.heat)} / 100`);
  if(row===220)lines.push(`Bóng đang hoạt động: ${r.ghosts.length} · Sẵn sàng sau ${number(Math.max(0,r.ghostReady-c.time))} giây`);
  if(row===221)lines.push(r.mark?`Dấu đang tích ${number(r.mark.damage)} sát thương thực nhận`:`Hồi lại sau ${number(Math.max(0,r.markReady-c.time))} giây`);
  if(row===222)lines.push(r.mode==="small"?"Thu Nhỏ: kích thước/hitbox ×0,5; +25 điểm % Giảm Hồi Chiêu (cap 80%); +50% Hồi Tài Nguyên":"Khổng Lồ: kích thước/hitbox ×1,5; +30% Máu Tối Đa; +30% Hỏa Lực",`Roll kế tiếp: ${number(Math.max(0,r.nextMode-c.time))} giây`);
  return lines;
}

/** Uptime is measured by the simulation clock, never by inventory rendering. */
export function tickCoreTelemetry(s:AircraftCombatState,dt:number){
  const c=s.coreState,stats=getEffectiveAircraftStats(s),now=c.time;
  const uptime=(row:number,active:boolean)=>{if(active)recordCoreMetric(s,row,"uptime",dt);};
  const timed=(row:number,key:string)=>recordCoreMetric(s,row,"uptime",Math.min(dt,Math.max(0,(c.timers[key]??0)-(now-dt))));
  uptime(49,now-c.lastMove>=2.5);timed(61,"reactiveArmor");uptime(63,s.currentHp<stats.maxHp*.35);
  uptime(66,now-c.lastKill<=3&&(c.stacks.combo??0)>0);timed(71,"tacticalRate");uptime(75,(c.stacks.slaying??0)>0);uptime(91,s.currentHp<stats.maxHp);
  timed(116,"comeback");timed(170,"earlyArmor");timed(175,"alternating");timed(178,"magneticBrake");timed(181,"skillExhaust");timed(186,"confluence");
  recordCoreMetric(s,100,s.currentHp>stats.maxHp*.7?"firepowerTime":s.currentHp<stats.maxHp*.3?"armorTime":"regenTime",dt);
  recordCoreMetric(s,169,s.currentResource/stats.maxResource>.7?"firepowerTime":s.currentResource/stats.maxResource<.3?"regenTime":"fireRateTime",dt);
  const negative=activeNegativeStatusTypes(s).size;
  uptime(183,negative>0);uptime(203,negative>0);
  if(hasCore(s,183)){const entry=c.telemetry.core_183??={};entry.peak=Math.max(entry.peak??0,Math.min(40,negative*20));if(negative)recordCoreMetric(s,183,negative===1?"armorTime":"shieldTime",dt);}
  if((c.timers.alternatingSkill??0)>now)recordCoreMetric(s,191,"firepowerTime",dt);
  if((c.timers.alternatingBasic??0)>now)recordCoreMetric(s,191,"fireRateTime",dt);
  recordCoreMetric(s,192,hasAbsorbShield(s)?"shieldTime":"armorTime",dt);
  const stand=hasCore(s,209)&&!!c.stacks.lastStand;
  if(stand&&!c.stacks.telemetryLastStand)recordCoreMetric(s,209,"procs",1);
  c.stacks.telemetryLastStand=stand?1:0;uptime(209,stand);
}
