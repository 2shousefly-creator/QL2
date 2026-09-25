import type { CombatWorld } from "./airCombatRuntime";
import type { StatusPresentation } from "./airCombatPresentation";
import { getCoreDefinition } from "./airCombatConfig";
import { coreId, hasCore } from "./airCombatCoreEffects";
import { getEffectiveAircraftStats } from "./airCombatAircraft";
import { activeNegativeStatusTypes, expansionState, hasAbsorbShield } from "./airCombatExpansion";
import { releaseState, overheated } from "./airCombatReleaseState";
import { CORE_SYSTEM_LABELS } from "./airCombatCoreSystems";

export function expansionStatuses(w: CombatWorld): StatusPresentation[] {
  const s=w.aircraft,c=s.coreState,r=expansionState(s),stats=getEffectiveAircraftStats(s),result:StatusPresentation[]=[];
  const remaining=(key:string)=>Math.max(0,(c.timers[key]??0)-c.time);
  const add=(row:number,detail:string,values:Partial<StatusPresentation>={})=>{
    if(!hasCore(s,row))return;
    const core=getCoreDefinition(coreId(row));
    result.push({id:core.id,group:"buff",name:core.name,icon:{kind:"core",id:core.id},source:"Lõi",description:`${core.description} ${detail}`,
      stacks:1,remaining:Infinity,duration:Infinity,priority:65,timeLabel:detail,...values});
  };
  const timed=(row:number,key:string,duration:number,cd?:string,cdDuration=duration)=>{
    const active=remaining(key),cooldown=cd?remaining(cd):0;
    if(!active&&!cooldown)return;
    add(row,active?"Đang hiệu lực":"Đang hồi nội tại",{remaining:active||cooldown,duration:active?duration:cdDuration,
      timerKind:active?"active":"cooldown",timeLabel:undefined,showNumericTimer:true});
  };
  const ratio=s.currentResource/stats.maxResource;
  add(169,ratio>.7?"+40 Hỏa Lực":ratio<.3?"+2,5 Hồi Máu/s":"+0,45 Tốc Độ Bắn",{badgeText:ratio>.7?"HL":ratio<.3?"HP":"TB"});
  timed(170,"earlyArmor",3,"earlyArmorCd",10);
  timed(171,"safetyLatch",2);
  const charge=c.stacks.capacitorCharge??0,charging=r.fullSince===undefined?0:Math.min(2,c.time-r.fullSince);
  add(172,charge?"Đã tích Tụ Điện":`Tích điện: ${charging.toFixed(1)} / 2s`,{badgeText:`${charge}/1`,badgeKind:"charge",progress:charge?1:charging/2});
  timed(174,"shockPadRegen",4,"shockPadCd",15);
  timed(175,"alternating",5);
  timed(119,"timeRecovery",4);
  if(c.stacks.breathing)add(176,"Đang hồi 1% Máu Tối Đa/s");
  timed(178,"magneticBrake",3,"magneticBrakeCd",20);
  add(179,`Sai Số: +${(c.stacks.error??0)*2}% Tỷ Lệ Chí Mạng`,{badgeText:`${c.stacks.error??0}`,badgeKind:"stack",progress:Math.min(1,(c.stacks.error??0)*.02)});
  timed(181,"skillExhaust",4);
  add(182,ratio>.7?"+15% Max Resource · +10% Skill Damage":"+15% Max Resource");
  timed(168,"shiftDiscount",5);
  timed(218,"ultimateAftershock",8);
  const negative=activeNegativeStatusTypes(s).size;
  if(negative)add(183,`+${Math.min(60,20+negative*20)} Giáp`,{badgeText:`+${Math.min(60,20+negative*20)}`,badgeKind:"bonus"});
  const immune=remaining("celestial"),ready=remaining("celestialReady");
  add(184,immune?"Bảo Hộ Thiên Giới":ready?"Đang hồi nội tại":"Sẵn sàng",{remaining:immune||ready||Infinity,duration:immune?3:15,timerKind:immune?"active":"cooldown",showNumericTimer:!!(immune||ready),timeLabel:immune?"Miễn sát thương và khống chế":ready?undefined:"Sẵn sàng"});
  timed(186,"confluence",8,"confluenceCd",16);
  add(187,`Đã tích ${Math.round(c.stacks.recoil??0)} sát thương`,{badgeText:String(Math.round(c.stacks.recoil??0)),badgeKind:"charge",progress:(c.stacks.recoil??0)/Math.max(1,stats.firepower*3)});
  add(192,hasAbsorbShield(s)?"Có Lá chắn: +20% mọi sát thương":"Không có Lá chắn: +25 Giáp",{badgeText:hasAbsorbShield(s)?"+20%":"+25"});
  timed(195,"blackBox",4,"blackBoxCd",22);
  add(196,`+${(c.stacks.crimsonCrit??0)*5}% Sát Thương Chí Mạng / +75% Sát Thương Chí Mạng`,{badgeText:`+${(c.stacks.crimsonCrit??0)*5}%`,badgeKind:"bonus",progress:(c.stacks.crimsonCrit??0)/15});
  const debt=r.debt.reduce((sum,d)=>sum+d.amount*d.ticks,0);
  if(debt>0)add(197,`Sát Thương Trì Hoãn còn nợ: ${Math.ceil(debt)}. Hạ quái thường: ${c.stacks.debtKills??0}/15.`,{group:"debuff",badgeText:String(Math.ceil(debt)),badgeKind:"shield",remaining:Math.max(...r.debt.map(d=>d.next+(d.ticks-1)-c.time)),duration:4,priority:120});
  if(c.stacks.satellites)add(198,"Vệ tinh đang bảo vệ",{badgeText:`${c.stacks.satellites}/3`,badgeKind:"charge",remaining:remaining("satellites"),duration:5});
  add(199,`Kỹ năng kế tiếp +${(c.stacks.overclock??0)*18}% sát thương kỹ năng`,{badgeText:`${c.stacks.overclock??0}/3`,badgeKind:"stack",progress:(c.stacks.overclock??0)/3});
  if(negative)add(203,"Khống chế cứng chỉ khóa di chuyển; +35% mọi sát thương, -25% sát thương nhận vào.");
  add(204,`Đã ngăn ${Math.round(c.stacks.armorMeter??0)} / ${Math.round(stats.maxHp*.25)} damage`,{progress:(c.stacks.armorMeter??0)/(stats.maxHp*.25),badgeText:`${Math.round(c.stacks.armorMeter??0)}`,badgeKind:"progress"});
  if(c.stacks.lastStand)add(209,"Tử Thủ: +150 Giáp, +40% Hồi Tài Nguyên, −20 điểm phần trăm Giảm Hồi Chiêu, -15% mọi sát thương.");
  const release=releaseState(s);
  if(release.reserve>0)add(212,`Reroll Dự Trữ: ${release.reserve}`,{badgeText:String(release.reserve),badgeKind:"charge",priority:45});
  add(217,release.pendingGuaranteedDiamondSelection?"Milestone kế tiếp: 100% Kim Cương":"20% Bạc / 40% Vàng / 40% Kim Cương");
  const hot=overheated(s);
  add(219,hot?"QUÁ NHIỆT · ngừng bắn và khóa kỹ năng":release.heat>=50?"+25% mọi sát thương":"Nhiệt nòng súng",{
    group:hot?"debuff":"buff",badgeText:`${Math.ceil(release.heat)}`,progress:release.heat/100,
    remaining:hot?release.overheatUntil-c.time:Infinity,duration:hot?3:Infinity,showNumericTimer:hot,priority:hot?150:85});
  const ghostTime=Math.max(0,...release.ghosts.map(g=>g.until-c.time)),ghostCd=Math.max(0,release.ghostReady-c.time);
  add(220,ghostTime?"Bóng đang bắn":ghostCd?"Đang hồi nội tại":"READY",{badgeText:ghostTime?"BÓNG":ghostCd?undefined:"READY",remaining:ghostTime||ghostCd||Infinity,duration:ghostTime?3.5:10,timerKind:ghostTime?"active":"cooldown",showNumericTimer:!!(ghostTime||ghostCd),priority:80});
  const markTime=release.mark?Math.max(0,release.mark.until-c.time):0,markCd=Math.max(0,release.markReady-c.time);
  add(221,markTime?"Dấu Ấn đang tích sát thương":markCd?"Đang hồi nội tại":"Sẵn sàng đánh dấu",{remaining:markTime||markCd||Infinity,duration:markTime?4:16,timerKind:markTime?"active":"cooldown",showNumericTimer:!!(markTime||markCd),priority:85});
  add(222,release.mode==="small"?"THU NHỎ · +25 điểm phần trăm Giảm Hồi Chiêu · +50% Hồi Tài Nguyên":"KHỔNG LỒ · +30% Máu Tối Đa · +30% Hỏa Lực",{badgeText:release.mode==="small"?"NHỎ":"LỚN",remaining:Math.max(0,release.nextMode-c.time),duration:60,showNumericTimer:true,priority:80});
  return result;
}
