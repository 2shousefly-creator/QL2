import React from "react";
import { HeartPulse, Shield, Sparkles, Swords, Zap } from "lucide-react";
import { formatStatValue, getStatQuality, getTroopStatRatio, type DisplayStatKey } from "../statDisplay";
import { getTroopStats } from "../troopCatalog";
import type { TroopType } from "../types";

export function TroopStatBars({ troopType, level, compact = false }: { troopType: TroopType; level: number; compact?: boolean }) {
  const stats = getTroopStats(troopType, level);
  const rows: Array<{ key: DisplayStatKey; label: string; value: number; icon: typeof HeartPulse; color: string }> = [
    { key: "maxHp", label: "HP", value: stats.maxHp, icon: HeartPulse, color: "#22a866" },
    { key: "attack", label: "ATK", value: stats.attack, icon: Swords, color: "#f97316" },
    { key: "defense", label: "DEF", value: stats.defense, icon: Shield, color: "#0ea5e9" },
    { key: "critChance", label: "CRIT", value: stats.critChance, icon: Sparkles, color: "#d946ef" },
    { key: "speed", label: "SPEED", value: stats.speed, icon: Zap, color: "#06b6d4" },
  ];
  return <div className={`ct-v2-card-stat-bars ${compact ? "is-compact" : ""}`}>
    {rows.map((row) => {
      const Icon = row.icon;
      const ratio = getTroopStatRatio(troopType, level, row.key);
      const formatted = formatStatValue(row.key, row.value);
      return <div key={row.key} aria-label={`${row.label} ${formatted}, ${getStatQuality(ratio)}`}>
        <Icon aria-hidden="true" /><span>{row.label}</span><i aria-hidden="true"><b style={{ width: `${ratio * 100}%`, background: row.color }} /></i><strong>{formatted}</strong>
      </div>;
    })}
  </div>;
}
