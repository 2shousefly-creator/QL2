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
  add(169,ratio>.7?"Hỏa Lực +10":ratio<.3?"Hồi Máu +0,7/s":"Tốc Độ Bắn +0,2/s",{badgeText:ratio>.7?"HL":ratio<.3?"HP":"TB"});
  timed(170,"earlyArmor",1.5,"earlyArmorCd",15);
  timed(171,"safetyLatch",1.5);
  const charge=c.stacks.capacitorCharge??0,charging=r.fullSince===undefined?0:Math.min(3,c.time-r.fullSince);
  const hawk=remaining("capacitorHawk");
  add(172,hawk?"HawkEye giảm 15% Điện tiêu hao mỗi giây":charge?"Đã tích Tụ Điện":`Tích điện: ${charging.toFixed(1)} / 3s`,{badgeText:hawk?"−15%":`${charge}/1`,badgeKind:"charge",progress:hawk?hawk/3:charge?1:charging/3,remaining:hawk||Infinity,duration:hawk?3:Infinity,showNumericTimer:!!hawk});
  timed(174,"shockPadActive",0,"shockPadCd",15);
  timed(175,"alternating",4);
  if(c.stacks.breathing)add(176,"Đang hồi 0,75% Máu Tối Đa/s");
  timed(178,"magneticBrake",1.2,"magneticBrakeCd",12);
  add(179,`Sai Số: +${(c.stacks.error??0)*2}% Tỷ Lệ Chí Mạng`,{badgeText:`${c.stacks.error??0}/10`,badgeKind:"stack",progress:(c.stacks.error??0)/10});
  timed(181,"skillExhaust",3);
  timed(182,"reserveBattery",4,"reserveBatteryCd",18);
  const negative=activeNegativeStatusTypes(s).size;
  if(negative)add(183,`Giáp +${Math.min(40,negative*20)}`,{badgeText:`+${Math.min(40,negative*20)}`,badgeKind:"bonus"});
  const immune=remaining("celestial"),ready=remaining("celestialReady");
  add(184,immune?"Bảo Hộ Thiên Giới":ready?"Đang hồi nội tại":"Sẵn sàng",{remaining:immune||ready||Infinity,duration:immune?2.5:18,timerKind:immune?"active":"cooldown",showNumericTimer:!!(immune||ready),timeLabel:immune?"Miễn sát thương và khống chế":ready?undefined:"Sẵn sàng"});
  timed(186,"confluence",6,"confluenceCd",20);
  add(187,`Đã tích ${Math.round(c.stacks.recoil??0)} sát thương`,{badgeText:String(Math.round(c.stacks.recoil??0)),badgeKind:"charge",progress:(c.stacks.recoil??0)/Math.max(1,stats.firepower*1.2)});
  const nextSkill=remaining("alternatingSkill"),basicFire=remaining("alternatingBasic");
  if(nextSkill||basicFire)add(191,nextSkill?"Lần gây sát thương kỹ năng kế tiếp +20%":"Sát thương bắn thường +20%",{remaining:nextSkill||basicFire,duration:nextSkill?5:4,showNumericTimer:true});
  add(192,hasAbsorbShield(s)?"Có Lá chắn: +15% mọi sát thương":"Không có Lá chắn: +14 Giáp",{badgeText:hasAbsorbShield(s)?"+15%":"+14"});
  const sequence=r.sequence.filter(cast=>c.time-cast.at<=7),triple=remaining("tripleRegen");
  add(193,triple?"Hồi Tài Nguyên +25%":`Đã dùng ${sequence.length}/3 kỹ năng`,{badgeText:`${sequence.length}/3`,badgeKind:"progress",remaining:triple||(sequence.length?7-c.time+sequence[0].at:Infinity),duration:triple?5:7,showNumericTimer:true});
  timed(195,"blackBox",4,"blackBoxCd",20);
  add(196,`Sát Thương Chí Mạng +${(c.stacks.crimsonCrit??0)*2.5}% / 50%`,{badgeText:`+${(c.stacks.crimsonCrit??0)*2.5}%`,badgeKind:"bonus",progress:(c.stacks.crimsonCrit??0)/20});
  const debt=r.debt.reduce((sum,d)=>sum+d.amount*d.ticks,0);
  if(debt>0)add(197,`Sát Thương Trì Hoãn còn nợ: ${Math.ceil(debt)}. Hạ quái thường: ${c.stacks.debtKills??0}/12.`,{group:"debuff",badgeText:String(Math.ceil(debt)),badgeKind:"shield",remaining:Math.max(...r.debt.map(d=>d.next+(d.ticks-1)-c.time)),duration:3,priority:120});
  if(c.stacks.satellites)add(198,"Vệ tinh đang bảo vệ",{badgeText:`${c.stacks.satellites}/3`,badgeKind:"charge",remaining:remaining("satellites"),duration:4});
  add(199,`Kỹ năng kế tiếp +${(c.stacks.overclock??0)*18}% sát thương`,{badgeText:`${c.stacks.overclock??0}/3`,badgeKind:"stack",progress:(c.stacks.overclock??0)/3});
  if(negative)add(203,"Khống chế cứng chỉ khóa di chuyển; +35% sát thương, -25% sát thương nhận vào.");
  if(r.returns.length)add(204,"Không mất Máu để tái tạo Lá chắn",{badgeText:String(r.returns.length),badgeKind:"charge",remaining:Math.min(...r.returns.map(p=>p.at-c.time)),duration:2});
  if(c.stacks.lastStand)add(209,"Tử Thủ: +150 Giáp, +40% Hồi Tài Nguyên, +20% Giảm Hồi Chiêu, -15% sát thương.");
  const release=releaseState(s);
  if(release.system)add(215,CORE_SYSTEM_LABELS[release.system],{badgeText:CORE_SYSTEM_LABELS[release.system],priority:30});
  if(release.reserve>0)add(218,`Reroll Dự Trữ: ${release.reserve}`,{badgeText:String(release.reserve),badgeKind:"charge",priority:45});
  const hot=overheated(s);
  add(219,hot?"QUÁ NHIỆT · ngừng bắn và khóa kỹ năng":release.heat>=50?"+20% mọi sát thương":"Nhiệt nòng súng",{
    group:hot?"debuff":"buff",badgeText:`${Math.ceil(release.heat)}`,progress:release.heat/100,
    remaining:hot?release.overheatUntil-c.time:Infinity,duration:hot?3:Infinity,showNumericTimer:hot,priority:hot?150:85});
  const ghostTime=Math.max(0,...release.ghosts.map(g=>g.until-c.time)),ghostCd=Math.max(0,release.ghostReady-c.time);
  add(220,ghostTime?"Bóng đang bắn":ghostCd?"Đang hồi nội tại":"READY",{badgeText:ghostTime?"BÓNG":ghostCd?undefined:"READY",remaining:ghostTime||ghostCd||Infinity,duration:ghostTime?3:10,timerKind:ghostTime?"active":"cooldown",showNumericTimer:!!(ghostTime||ghostCd),priority:80});
  const markTime=release.mark?Math.max(0,release.mark.until-c.time):0,markCd=Math.max(0,release.markReady-c.time);
  add(221,markTime?"Dấu Ấn đang tích sát thương":markCd?"Đang hồi nội tại":"Sẵn sàng đánh dấu",{remaining:markTime||markCd||Infinity,duration:markTime?3:20,timerKind:markTime?"active":"cooldown",showNumericTimer:!!(markTime||markCd),priority:85});
  add(222,release.mode==="small"?"THU NHỎ · +25 điểm % Giảm Hồi Chiêu · +50% Hồi Tài Nguyên":"KHỔNG LỒ · +30% Máu Tối Đa · +30% Hỏa Lực",{badgeText:release.mode==="small"?"NHỎ":"LỚN",remaining:Math.max(0,release.nextMode-c.time),duration:60,showNumericTimer:true,priority:80});
  return result;
}
