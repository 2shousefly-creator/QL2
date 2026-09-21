import React from "react";
import { Swords, Shield, Gauge, HeartPulse, BatteryCharging, Timer, Crosshair, Zap } from "lucide-react";
import type { EffectiveAircraftStats } from "./airCombatTypes";

export function CombatStatChips({ stats, baseline, healingReceived = 1, onInspect }: { onInspect?: (id: string, title: React.ReactNode, text: React.ReactNode) => void; stats: EffectiveAircraftStats; baseline?: EffectiveAircraftStats; healingReceived?: number }) {
  const keys = ["firepower", "armor", "fireRate", "hpRegen", "resourceRegen", "cooldownReduction", "criticalChance", "criticalDamageMultiplier"] as const;
  const resource = stats.resourceKind === "mana" ? "Mana" : "Điện";
  const chips = [
    { label: "Hỏa lực", value: stats.firepower.toFixed(0), Icon: Swords },
    { label: "Giáp", value: stats.armor.toFixed(0), Icon: Shield },
    { label: "Tốc độ bắn", value: `${stats.fireRate.toFixed(1)}/s`, Icon: Gauge },
    { label: "Hồi HP", value: `${(stats.hpRegen * healingReceived).toFixed(1)}/s`, Icon: HeartPulse },
    { label: `Hồi ${resource}`, value: `${stats.resourceRegen.toFixed(1)}/s`, Icon: BatteryCharging },
    { label: "Giảm hồi chiêu", value: `${Math.round(stats.cooldownReduction * 100)}%`, Icon: Timer },
    { label: "Tỷ lệ chí mạng", value: `${Math.round(stats.criticalChance * 100)}%`, Icon: Crosshair },
    { label: "Sát thương chí mạng", value: `${Math.round(stats.criticalDamageMultiplier * 100)}%`, Icon: Zap },
  ];
  const descriptions = [
    "Hỏa Lực thể hiện khả năng gây sát thương của chiến cơ từ bắn thường và kỹ năng.",
    <>Giáp giúp bạn giảm sát thương phải nhận từ hỏa lực của kẻ thù. Hiện tại bạn đang nhận giảm <strong className="air-tooltip-value">{((1-100/(100+Math.max(-80,stats.armor)))*100).toLocaleString("vi-VN",{maximumFractionDigits:1})}%</strong> sát thương.</>,
    "Số lần khai hỏa đạn thường trong 1 giây.", "Số HP hồi lại mỗi 1 giây.", `Số ${resource} hồi lại mỗi 1 giây.`,
    <>Các kỹ năng của bạn được giảm <strong className="air-tooltip-value">{Math.round(stats.cooldownReduction*100)}%</strong> thời gian hồi chiêu, tối đa lên tới <strong className="air-tooltip-value">80%</strong>.</>,
    <>Chiến cơ có <strong className="air-tooltip-value">{Math.round(stats.criticalChance*100)}%</strong> xác suất gây chí mạng trong mỗi đòn tấn công.</>,
    <>Khi chí mạng, lượng sát thương gây ra bằng <strong className="air-tooltip-value">{Math.round(stats.criticalDamageMultiplier*100)}%</strong> so với đòn thông thường.</>,
  ];
  return <div className="combat-stat-chips" aria-label="Chỉ số chiến đấu">
    {chips.map(({ label, value, Icon }, index) => {
      const key = keys[index], delta = baseline ? stats[key] - baseline[key] : 0;
      const direction = key === "hpRegen" && healingReceived < 1 ? "debuff" : Math.abs(delta) < 1e-5 * Math.max(1, Math.abs(baseline?.[key] ?? 0)) ? "neutral" : delta > 0 ? "buff" : "debuff";
      const content = <><Icon aria-hidden="true" /><span className="sr-only">{label}: </span><span>{value}</span></>;
      if (onInspect) return <button type="button" key={label} className="combat-stat-chip" data-stat-change={direction} data-combat-tooltip-trigger="hub" aria-label={`${label}: ${value}`}
        onClick={()=>onInspect(key,<>{label}: <strong className="air-tooltip-value">{value}</strong></>,descriptions[index])}>{content}</button>;
      return <span key={label} className="combat-stat-chip" data-stat-change={direction} title={`${label}: ${value}`}>
      <Icon aria-hidden="true" /><span className="sr-only">{label}: </span><span>{value}</span>
    </span>; })}
  </div>;
}

export function AircraftSelectionStats({ stats }: { stats: EffectiveAircraftStats }) {
  const entries = [
    ["HP", stats.maxHp.toFixed(0)], ["Giáp", stats.armor.toFixed(0)],
    ["Hỏa lực", stats.firepower.toFixed(0)], ["Tốc bắn", `${stats.fireRate.toFixed(1)}/s`],
    ["Hồi HP", `${stats.hpRegen.toFixed(1)}/s`], [stats.resourceKind === "mana" ? "Hồi Mana" : "Hồi Energy", `${stats.resourceRegen.toFixed(1)}/s`],
    ["Tỷ lệ chí mạng", `${Math.round(stats.criticalChance * 100)}%`], ["ST chí mạng", `${Math.round(stats.criticalDamageMultiplier * 100)}%`],
  ];
  return <dl className="combat-selection-stats">{entries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
