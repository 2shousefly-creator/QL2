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
    169:state.currentResource/stats.maxResource>.7?"+40 Hỏa Lực":state.currentResource/stats.maxResource<.3?"+2,5 Hồi Máu/s":"+0,45 Tốc Độ Bắn",
    172:c.stacks.capacitorCharge?"Đã tích điện":"Chưa tích đủ điện",179:`Sai Số: ${c.stacks.error??0} · +${(c.stacks.error??0)*2}% Tỷ Lệ Chí Mạng`,
    183:`+${Math.min(60,20+activeNegativeStatusTypes(state).size*20)} Giáp`,187:`Đang tích ${number(c.stacks.recoil??0)} sát thương`,188:"+15% Tỷ Lệ Chí Mạng · +50% Sát Thương Chí Mạng",
    192:hasAbsorbShield(state)?"+20% mọi sát thương":"+25 Giáp",
    196:`+${number(Math.min(.75,(c.stacks.crimsonCrit??0)*.05)*100)}% Sát Thương Chí Mạng / +75% Sát Thương Chí Mạng`,197:`Nợ còn lại: ${number(expansion.debt.reduce((n,d)=>n+d.amount*d.ticks,0))}`,
    199:`Cộng dồn quá tải: ${c.stacks.overclock??0}/3`,202:expansion.primarySkill?`Chủ lực: ${SKILL_CONFIGS[expansion.primarySkill].name}`:"Đang chờ chọn kỹ năng",
    204:`Tiến độ Armor/Shield: ${number(c.stacks.armorMeter??0)} / ${number(stats.maxHp*.25)}`,209:c.stacks.lastStand?"Tử Thủ đang hoạt động":"Chưa kích hoạt Tử Thủ",
  };
  if(descriptions[row])lines.push(descriptions[row]);
  if(row===201){const counts={attack:0,defense:0,resource:0,utility:0};for(const id of state.selectedCores){const core=getCoreDefinition(id);if(core.system!=="skill")counts[core.system]++;}const b=arsenalBonuses(state);lines.push(...Object.entries(counts).map(([system,count])=>`${CORE_SYSTEM_LABELS[system as keyof typeof counts]}: ${count}`),`+${number(b.basic*100)}% sát thương đạn thường · +${number(b.skill*100)}% sát thương kỹ năng · ${number(b.reduction*100)}% Giảm Sát Thương`);}
  if(row===208)lines.push(`+${number(stats.dualHpBonus??0)} Hồi Máu/s từ Tế Bào Song Năng`,`+${number(stats.dualResourceBonus??0)} Hồi Tài Nguyên/s từ Tế Bào Song Năng`);
  if(row===216)lines.push("Đã sử dụng · Giữ lại chỉ số vĩnh viễn đã kiếm được từ các Lõi chuyển đổi.");
  if(row===212)lines.push(`Reroll Dự Trữ: ${r.reserve} / 5`);
  if(row===218)lines.push(`Dư Chấn Tối Hậu còn ${number(Math.max(0,(c.timers.ultimateAftershock??0)-c.time))}s`);
  if(row===219)lines.push(`Nhiệt: ${number(r.heat)} / 100`);
  if(row===220)lines.push(`Bóng đang hoạt động: ${r.ghosts.length} · Sẵn sàng sau ${number(Math.max(0,r.ghostReady-c.time))} giây`);
  if(row===221)lines.push(r.mark?`Dấu đang tích ${number(r.mark.damage)} sát thương thực nhận`:`Hồi lại sau ${number(Math.max(0,r.markReady-c.time))} giây`);
  if(row===222)lines.push(r.mode==="small"?"Thu Nhỏ: kích thước/hitbox ×0,5; +25 điểm phần trăm Giảm Hồi Chiêu (cap 60%); +50% Hồi Tài Nguyên":"Khổng Lồ: kích thước/hitbox ×1,5; +30% Máu Tối Đa; +30% Hỏa Lực",`Roll kế tiếp: ${number(Math.max(0,r.nextMode-c.time))} giây`);
  return lines;
}

/** Uptime is measured by the simulation clock, never by inventory rendering. */
export function tickCoreTelemetry(s:AircraftCombatState,dt:number){
  const c=s.coreState,stats=getEffectiveAircraftStats(s),now=c.time;
  const uptime=(row:number,active:boolean)=>{if(active)recordCoreMetric(s,row,"uptime",dt);};
  const timed=(row:number,key:string)=>recordCoreMetric(s,row,"uptime",Math.min(dt,Math.max(0,(c.timers[key]??0)-(now-dt))));
  uptime(49,now-c.lastMove>=2.5);timed(61,"reactiveArmor");uptime(63,s.currentHp<stats.maxHp*.35);
  uptime(66,now-c.lastKill<=4&&(c.stacks.combo??0)>0);timed(71,"tacticalRate");uptime(75,(c.stacks.slaying??0)>0);uptime(91,s.currentHp<stats.maxHp);
  timed(98,"comeback");timed(114,"sameTarget");timed(116,"sameTarget");timed(218,"ultimateAftershock");timed(119,"timeRecovery");timed(170,"earlyArmor");timed(175,"alternating");timed(178,"magneticBrake");timed(181,"skillExhaust");timed(186,"confluence");
  recordCoreMetric(s,100,s.currentHp>stats.maxHp*.7?"firepowerTime":s.currentHp<stats.maxHp*.3?"armorTime":"regenTime",dt);
  recordCoreMetric(s,169,s.currentResource/stats.maxResource>.7?"firepowerTime":s.currentResource/stats.maxResource<.3?"regenTime":"fireRateTime",dt);
  const negative=activeNegativeStatusTypes(s).size;
  uptime(183,negative>0);uptime(203,negative>0);
  if(hasCore(s,183)){const entry=c.telemetry.core_183??={};entry.peak=Math.max(entry.peak??0,Math.min(60,20+negative*20));if(negative)recordCoreMetric(s,183,negative===1?"armorTime":"shieldTime",dt);}
  recordCoreMetric(s,192,hasAbsorbShield(s)?"shieldTime":"armorTime",dt);
  const stand=hasCore(s,209)&&!!c.stacks.lastStand;
  if(stand&&!c.stacks.telemetryLastStand)recordCoreMetric(s,209,"procs",1);
  c.stacks.telemetryLastStand=stand?1:0;uptime(209,stand);
}
