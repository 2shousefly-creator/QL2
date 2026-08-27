import { getTroopStats } from "./troopCatalog";
import { TROOP_TYPES, type BattleUnit, type TroopStats, type TroopType } from "./types";

export type DisplayStatKey = "maxHp" | "attack" | "defense" | "critChance" | "speed";

const rosterMaximumCache = new Map<string, number>();
let rosterSpeedRangeCache: { minimum: number; maximum: number } | null = null;

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function getRosterStatMaximumAtLevel(level: number, key: DisplayStatKey): number {
  if (key === "critChance") return 1;
  if (key === "speed") return getRosterSpeedRange().maximum;
  const safeLevel = Math.max(1, Math.floor(Number.isFinite(level) ? level : 1));
  const cacheKey = `${safeLevel}:${key}`;
  const cached = rosterMaximumCache.get(cacheKey);
  if (cached !== undefined) return cached;
  const maximum = Math.max(1, ...TROOP_TYPES.map((troopType) => getTroopStats(troopType, safeLevel)[key]));
  rosterMaximumCache.set(cacheKey, maximum);
  return maximum;
}

/** Compatibility alias for callers that already pass the comparison level. */
export function getRosterStatMaximum(key: DisplayStatKey, level = 1): number {
  return getRosterStatMaximumAtLevel(level, key);
}

export function getRosterSpeedRange(): { minimum: number; maximum: number } {
  if (rosterSpeedRangeCache) return rosterSpeedRangeCache;
  const speeds = TROOP_TYPES.map((troopType) => getTroopStats(troopType, 1).speed);
  rosterSpeedRangeCache = {
    minimum: Math.min(...speeds),
    maximum: Math.max(...speeds),
  };
  return rosterSpeedRangeCache;
}

export function getDisplayStatRatio(value: number, level: number, key: DisplayStatKey): number {
  if (key === "critChance") return clampRatio(value);
  if (key === "speed") {
    const { minimum, maximum } = getRosterSpeedRange();
    if (maximum <= minimum) return 1;
    const rangeRatio = clampRatio((value - minimum) / (maximum - minimum));
    return 0.1 + rangeRatio * 0.9;
  }
  return clampRatio(value / getRosterStatMaximumAtLevel(level, key));
}

export function getTroopStatRatio(troopType: TroopType, level: number, key: DisplayStatKey): number {
  const stats = getTroopStats(troopType, level);
  return getDisplayStatRatio(stats[key], level, key);
}

export function getBattleStatRatio(unit: BattleUnit, key: DisplayStatKey): number {
  const value = key === "maxHp" ? unit.maxHp : unit[key as keyof Pick<TroopStats, "attack" | "defense" | "critChance" | "speed">];
  return getDisplayStatRatio(Number(value), unit.level, key);
}

export function isBattleStatAboveRoster(unit: BattleUnit, key: DisplayStatKey, value?: number): boolean {
  if (key === "critChance" || key === "speed") return false;
  const current = value ?? (key === "maxHp" ? unit.maxHp : Number(unit[key]));
  return current > getRosterStatMaximumAtLevel(unit.level, key) + 1e-6;
}

export function getStatQuality(ratio: number): "Thấp" | "Trung bình" | "Cao" | "Rất cao" {
  const safeRatio = clampRatio(ratio);
  if (safeRatio < 0.34) return "Thấp";
  if (safeRatio < 0.58) return "Trung bình";
  if (safeRatio < 0.82) return "Cao";
  return "Rất cao";
}

export function formatStatValue(key: DisplayStatKey, value: number): string {
  if (key === "critChance") {
    return `${Math.round(value * 100)}%`;
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(1);
}

export function formatUpgradeStat(before: number, after: number): { beforeStr: string; afterStr: string; diffStr: string } {
  const diff = after - before;
  const hasDecimal = !Number.isInteger(before) || !Number.isInteger(after) || !Number.isInteger(diff);
  if (hasDecimal) {
    return {
      beforeStr: before.toFixed(1),
      afterStr: after.toFixed(1),
      diffStr: `+${diff.toFixed(1)}`,
    };
  }
  return {
    beforeStr: String(before),
    afterStr: String(after),
    diffStr: `+${diff}`,
  };
}

