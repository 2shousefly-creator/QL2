import { AIR_COMBAT_LIMITS } from "./airCombatConfig";
import { resolveSkillCooldown } from "./airCombatStatResolvers";
import React from "react";
import { Swords, Shield, Gauge, HeartPulse, BatteryCharging, Timer, Crosshair, Zap } from "lucide-react";
import { CoreDescription } from "./CoreDescription";
import type { EffectiveAircraftStats } from "./airCombatTypes";

export function CombatStatChips({ stats, baseline, healing, onInspect }: { onInspect?: (id: string, title: React.ReactNode, text: React.ReactNode) => void; stats: EffectiveAircraftStats; baseline?: EffectiveAircraftStats; healing?: {current:number;baseline:number} }) {
  const keys = ["firepower", "armor", "fireRate", "hpRegen", "resourceRegen", "skillHaste", "criticalChance", "criticalDamageMultiplier"] as const;
  const resource = stats.resourceKind === "mana" ? "Mana" : "Điện";
  const chips = [
    { label: "Hỏa lực", value: stats.firepower.toFixed(0), Icon: Swords },
    { label: "Giáp", value: stats.armor.toFixed(0), Icon: Shield },
    { label: "Tốc độ bắn", value: `${stats.fireRate.toFixed(2).replace(".", ",")}/s`, Icon: Gauge },
    { label: "Hồi HP", value: `${(healing?.current ?? stats.hpRegen).toFixed(1).replace(".",",")}/s`, Icon: HeartPulse },
    { label: `Hồi ${resource}`, value: `${stats.resourceRegen.toFixed(1)}/s`, Icon: BatteryCharging },
    { label: "Hồi kỹ năng", value: stats.skillHaste.toLocaleString("vi-VN"), Icon: Timer },
    { label: "Tỷ lệ chí mạng", value: `${Math.round(stats.criticalChance * 100)}%`, Icon: Crosshair },
    { label: "Sát thương chí mạng", value: `${Math.round(stats.criticalDamageMultiplier * 100)}%`, Icon: Zap },
  ];
  const semanticValues = [
    `${stats.firepower.toFixed(0)} Hỏa Lực`, `${stats.armor.toFixed(0)} Giáp`, `${stats.fireRate.toFixed(2).replace(".", ",")} Tốc Độ Bắn`,
    `${(healing?.current ?? stats.hpRegen).toFixed(1).replace(".",",")} Hồi Máu/s`, `${stats.resourceRegen.toFixed(1)} Hồi Tài Nguyên/s`,
    `${stats.skillHaste.toLocaleString("vi-VN")} Điểm Hồi Kỹ Năng`, `${Math.round(stats.criticalChance * 100)}% Tỷ Lệ Chí Mạng`, `${Math.round(stats.criticalDamageMultiplier * 100)}% Sát Thương Chí Mạng`,
  ];
  const descriptions = [
    "Hỏa Lực thể hiện khả năng gây sát thương của chiến cơ từ bắn thường và kỹ năng.",
    `Giáp giảm ${((1-100/(100+Math.max(-80,stats.armor)))*100).toLocaleString("vi-VN",{maximumFractionDigits:1})}% sát thương nhận vào từ kẻ địch.`,
    "Số lần khai hỏa đạn thường trong 1 giây.", "Tổng tốc độ hồi Máu liên tục và định kỳ đang hoạt động, đã tính hiệu ứng tăng/giảm hồi phục. Không bao gồm hồi Máu tức thời hoặc hút Máu từ sát thương.", `Số ${resource} hồi lại mỗi 1 giây.`,
    "Hồi Chiêu = Hồi Chiêu Cơ Bản × 100 / (100 + Điểm Hồi Kỹ Năng).",
    `Chiến cơ có ${Math.round(stats.criticalChance*100)}% Tỷ Lệ Chí Mạng cho mỗi đòn có thể chí mạng.`,
    `Chiến cơ có ${Math.round(stats.criticalDamageMultiplier*100)}% Sát Thương Chí Mạng: đòn chí mạng gây ${Math.round(stats.criticalDamageMultiplier*100)}% sát thương của đòn không chí mạng tương ứng.`,
  ];
  const number=(value:number,digits=2)=>value.toLocaleString("vi-VN",{maximumFractionDigits:digits});
  const hasteMultiplier=resolveSkillCooldown(1,stats.skillHaste);
  const details:Partial<Record<typeof keys[number],string[]>>={
    fireRate:[`Tốc Độ Bắn: ${stats.fireRate.toFixed(2).replace(".",",")} phát/giây`,
      `Tốc Độ Bắn Cơ Bản: ${number(stats.baseFireRate)}`,`Tỷ Lệ Tốc Độ Bắn: ${number(stats.fireRateRatio,3)}`,
      `Tốc Độ Bắn Cộng Thêm: +${number(stats.bonusFireRatePct*100)}%`,`Tốc Độ Bắn Cộng Thêm mỗi cấp: +${number(stats.fireRateGrowthPct*100)}%`,
      `Giới hạn Tốc Độ Bắn: ${AIR_COMBAT_LIMITS.maxFireRate.toFixed(2).replace(".",",")} phát/giây`,
      ...(stats.totalFireRateMultiplier!==1?[`Điều chỉnh Tổng Tốc Độ Bắn: ${stats.totalFireRateMultiplier>1?"+":""}${number((stats.totalFireRateMultiplier-1)*100)}%`]:[])],
    skillHaste:[`Điểm Hồi Kỹ Năng: ${number(stats.skillHaste)}`,`Tần suất sử dụng kỹ năng: +${number(stats.skillHaste)}%`,
      `Hệ số Hồi Chiêu: ×${number(hasteMultiplier,3)}`,`Tương đương giảm khoảng ${number((1-hasteMultiplier)*100)}% thời gian Hồi Chiêu`,
      "Hồi Chiêu = Hồi Chiêu Cơ Bản × 100 / (100 + Điểm Hồi Kỹ Năng)."],
  };
  return <div className="combat-stat-chips" aria-label="Chỉ số chiến đấu">
    {chips.map(({ label, value, Icon }, index) => {
      const key = keys[index], delta = key === "hpRegen" && healing ? healing.current - healing.baseline : baseline ? stats[key] - baseline[key] : 0;
      const direction = Math.abs(delta) < 1e-5 * Math.max(1, Math.abs(key === "hpRegen" && healing ? healing.baseline : baseline?.[key] ?? 0)) ? "neutral" : delta > 0 ? "buff" : "debuff";
      const content = <><Icon aria-hidden="true" /><span className="sr-only">{label}: </span><span>{value}</span></>;
      if (onInspect) return <button type="button" key={label} className="combat-stat-chip" data-stat-change={direction} data-combat-tooltip-trigger="hub" aria-label={`${label}: ${value}`}
        onClick={()=>onInspect(key,<CoreDescription text={semanticValues[index]}/>,details[key]?<>{details[key]!.map(line=><span key={line} style={{display:"block"}}>{line}</span>)}</>:<CoreDescription text={descriptions[index]}/>)}>{content}</button>;
      return <span key={label} className="combat-stat-chip" data-stat-change={direction} title={`${label}: ${value}`}>
      <Icon aria-hidden="true" /><span className="sr-only">{label}: </span><span>{value}</span>
    </span>; })}
  </div>;
}

export function AircraftSelectionStats({ stats }: { stats: EffectiveAircraftStats }) {
  const entries = [
    ["HP", stats.maxHp.toFixed(0)], ["Giáp", stats.armor.toFixed(0)],
    ["Hỏa lực", stats.firepower.toFixed(0)], ["Tốc bắn", `${stats.fireRate.toFixed(2).replace(".", ",")}/s`],
    ["Hồi HP", `${stats.hpRegen.toFixed(1)}/s`], [stats.resourceKind === "mana" ? "Hồi Mana" : "Hồi Energy", `${stats.resourceRegen.toFixed(1)}/s`],
    ["Tỷ lệ chí mạng", `${Math.round(stats.criticalChance * 100)}%`], ["ST chí mạng", `${Math.round(stats.criticalDamageMultiplier * 100)}%`],
  ];
  return <dl className="combat-selection-stats">{entries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
