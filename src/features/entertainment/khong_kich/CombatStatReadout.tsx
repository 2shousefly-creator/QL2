import React from "react";
import { Swords, Shield, Gauge, HeartPlus, Gem, Timer, Crosshair, Zap } from "lucide-react";
import type { EffectiveAircraftStats } from "./airCombatTypes";

export function CombatStatChips({ stats }: { stats: EffectiveAircraftStats }) {
  const resource = stats.resourceKind === "mana" ? "Mana" : "Energy";
  const chips = [
    { label: "Hỏa lực", value: stats.firepower.toFixed(0), Icon: Swords },
    { label: "Giáp", value: stats.armor.toFixed(0), Icon: Shield },
    { label: "Tốc độ bắn", value: `${stats.fireRate.toFixed(1)}/s`, Icon: Gauge },
    { label: "Hồi HP", value: `${stats.hpRegen.toFixed(1)}/s`, Icon: HeartPlus },
    { label: `Hồi ${resource}`, value: `${stats.resourceRegen.toFixed(1)}/s`, Icon: Gem },
    { label: "Giảm hồi chiêu", value: `${Math.round(stats.cooldownReduction * 100)}%`, Icon: Timer },
    { label: "Tỷ lệ chí mạng", value: `${Math.round(stats.criticalChance * 100)}%`, Icon: Crosshair },
    { label: "Sát thương chí mạng", value: `${Math.round(stats.criticalDamageMultiplier * 100)}%`, Icon: Zap },
  ];
  return <div className="combat-stat-chips" aria-label="Chỉ số chiến đấu">
    {chips.map(({ label, value, Icon }) => <span key={label} className="combat-stat-chip" title={`${label}: ${value}`}>
      <Icon aria-hidden="true" /><span className="sr-only">{label}: </span><span>{value}</span>
    </span>)}
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
