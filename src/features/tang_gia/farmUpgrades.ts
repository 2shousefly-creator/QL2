import { RANK_STEPS } from "../../game/rankBuilder";
import type { RankStep } from "../../game/types";
import type {
  FarmSaveState,
  FarmUpgradeId,
  FarmUpgradesState,
} from "./farmTypes";

export const MAX_FARM_UPGRADE_LEVEL = 5;

export type FarmUpgradeDefinition = {
  id: FarmUpgradeId;
  name: string;
  shortLabel: string;
  subtitle: string;
  accentColor: string;
  costs: readonly [number, number, number, number, number];
  requiredRankIndices: readonly [number, number, number, number, number];
  effectSummary: (level: number) => string;
};

const WELL_WATER_BONUS = [0, 10, 18, 26, 35, 45] as const;
const WELL_MOISTURE_LOSS_SCALE = [1, 0.9, 0.82, 0.74, 0.66, 0.56] as const;
const TROUGH_DURATION_SCALE = [1, 1.15, 1.3, 1.48, 1.68, 1.9] as const;
const WAREHOUSE_GOLD_SCALE = [1, 1.05, 1.1, 1.16, 1.23, 1.32] as const;
const WAREHOUSE_XP_SCALE = [1, 1.04, 1.08, 1.13, 1.18, 1.25] as const;
const WORKER_SPEED_SCALE = [1, 1.18, 1.36, 1.56, 1.78, 2.05] as const;
const WORKER_DURATION_SCALE = [1, 0.88, 0.78, 0.68, 0.58, 0.48] as const;

export const FARM_UPGRADE_DEFINITIONS: readonly FarmUpgradeDefinition[] = [
  {
    id: "well",
    name: "Giếng Khoan Hậu Cần",
    shortLabel: "Giếng Tưới",
    subtitle: "Tăng độ ẩm mỗi lần tưới và giữ ẩm đất bền lâu hơn.",
    accentColor: "#0284c7",
    costs: [160, 420, 960, 2100, 4400],
    requiredRankIndices: [0, 8, 20, 40, 70],
    effectSummary: (level) => {
      const bonus = WELL_WATER_BONUS[clampUpgradeLevel(level)];
      const keepPct = Math.round((1 - WELL_MOISTURE_LOSS_SCALE[clampUpgradeLevel(level)]) * 100);
      return level <= 0
        ? "Chưa nâng cấp (+0% tưới, bốc hơi mặc định)"
        : `+${bonus}% độ ẩm/lần tưới · giảm ${keepPct}% bốc hơi`;
    },
  },
  {
    id: "trough",
    name: "Máng Ăn Cải Tiến",
    shortLabel: "Máng Ăn",
    subtitle: "Giúp khẩu phần ăn trong chuồng duy trì bền lâu hơn.",
    accentColor: "#d97706",
    costs: [200, 520, 1180, 2600, 5200],
    requiredRankIndices: [0, 10, 24, 46, 78],
    effectSummary: (level) => {
      const gainPct = Math.round((TROUGH_DURATION_SCALE[clampUpgradeLevel(level)] - 1) * 100);
      return level <= 0
        ? "Chưa nâng cấp (tốc độ tiêu hao cám cơ bản)"
        : `Máng ăn lâu cạn hơn +${gainPct}%`;
    },
  },
  {
    id: "warehouse",
    name: "Kho Bảo Quản Nông Sản",
    shortLabel: "Nhà Kho",
    subtitle: "Gia tăng giá trị Vàng và Kinh nghiệm khi thu hoạch & bán trứng.",
    accentColor: "#059669",
    costs: [240, 640, 1450, 3200, 6400],
    requiredRankIndices: [4, 14, 30, 54, 88],
    effectSummary: (level) => {
      const lv = clampUpgradeLevel(level);
      const goldPct = Math.round((WAREHOUSE_GOLD_SCALE[lv] - 1) * 100);
      const xpPct = Math.round((WAREHOUSE_XP_SCALE[lv] - 1) * 100);
      return level <= 0
        ? "Chưa nâng cấp (+0% Vàng, +0% XP)"
        : `+${goldPct}% Vàng · +${xpPct}% Kinh nghiệm`;
    },
  },
  {
    id: "boots",
    name: "Giày & Nông Cụ Nhân Công",
    shortLabel: "Nông Cụ",
    subtitle: "Tăng tốc độ di chuyển và rút ngắn thao tác cho nhân công.",
    accentColor: "#7c3aed",
    costs: [220, 580, 1300, 2900, 5800],
    requiredRankIndices: [2, 12, 26, 50, 82],
    effectSummary: (level) => {
      const lv = clampUpgradeLevel(level);
      const speedPct = Math.round((WORKER_SPEED_SCALE[lv] - 1) * 100);
      const timeCutPct = Math.round((1 - WORKER_DURATION_SCALE[lv]) * 100);
      return level <= 0
        ? "Chưa nâng cấp (tốc độ làm việc tiêu chuẩn)"
        : `+${speedPct}% tốc chạy · -${timeCutPct}% thời gian thao tác`;
    },
  },
];

export const FARM_UPGRADE_MAP = Object.fromEntries(
  FARM_UPGRADE_DEFINITIONS.map((def) => [def.id, def])
) as Record<FarmUpgradeId, FarmUpgradeDefinition>;

export function clampUpgradeLevel(level: number | undefined | null): number {
  if (typeof level !== "number" || !Number.isFinite(level)) return 0;
  return Math.max(0, Math.min(MAX_FARM_UPGRADE_LEVEL, Math.floor(level)));
}

export function createDefaultUpgrades(): FarmUpgradesState {
  return {
    well: 0,
    trough: 0,
    warehouse: 0,
    boots: 0,
  };
}

export function getFarmUpgrades(farm?: FarmSaveState | null): FarmUpgradesState {
  const raw = farm?.upgrades;
  if (!raw) return createDefaultUpgrades();
  return {
    well: clampUpgradeLevel(raw.well),
    trough: clampUpgradeLevel(raw.trough),
    warehouse: clampUpgradeLevel(raw.warehouse),
    boots: clampUpgradeLevel(raw.boots),
  };
}

export function getWellWaterBonus(farm?: FarmSaveState | null): number {
  return WELL_WATER_BONUS[clampUpgradeLevel(farm?.upgrades?.well)];
}

export function getSoilMoistureLossMultiplier(farm?: FarmSaveState | null): number {
  return WELL_MOISTURE_LOSS_SCALE[clampUpgradeLevel(farm?.upgrades?.well)];
}

export function getTroughDurationMultiplier(farm?: FarmSaveState | null): number {
  return TROUGH_DURATION_SCALE[clampUpgradeLevel(farm?.upgrades?.trough)];
}

export function getWarehouseGoldMultiplier(farm?: FarmSaveState | null): number {
  return WAREHOUSE_GOLD_SCALE[clampUpgradeLevel(farm?.upgrades?.warehouse)];
}

export function getWarehouseXpMultiplier(farm?: FarmSaveState | null): number {
  return WAREHOUSE_XP_SCALE[clampUpgradeLevel(farm?.upgrades?.warehouse)];
}

export function getWorkerSpeedMultiplier(farm?: FarmSaveState | null): number {
  return WORKER_SPEED_SCALE[clampUpgradeLevel(farm?.upgrades?.boots)];
}

export function getWorkerDurationMultiplier(farm?: FarmSaveState | null): number {
  return WORKER_DURATION_SCALE[clampUpgradeLevel(farm?.upgrades?.boots)];
}

export function getFarmUpgradeCost(
  id: FarmUpgradeId,
  currentLevel: number
): number | null {
  const lv = clampUpgradeLevel(currentLevel);
  if (lv >= MAX_FARM_UPGRADE_LEVEL) return null;
  return FARM_UPGRADE_MAP[id]?.costs[lv] ?? null;
}

export function getFarmUpgradeRequiredRankStep(
  id: FarmUpgradeId,
  nextLevel: number
): RankStep | null {
  if (nextLevel < 1 || nextLevel > MAX_FARM_UPGRADE_LEVEL) return null;
  const rankIdx = FARM_UPGRADE_MAP[id]?.requiredRankIndices[nextLevel - 1] ?? 0;
  return RANK_STEPS[Math.min(RANK_STEPS.length - 1, Math.max(0, rankIdx))] ?? null;
}

export function canUpgradeFarmBuilding(
  farm: FarmSaveState,
  id: FarmUpgradeId,
  currentRankIndex: number
): {
  canUpgrade: boolean;
  reason?: string;
  cost: number | null;
  currentLevel: number;
  nextLevel: number;
  requiredRankStep: RankStep | null;
} {
  const currentLevel = getFarmUpgrades(farm)[id];
  if (currentLevel >= MAX_FARM_UPGRADE_LEVEL) {
    return {
      canUpgrade: false,
      reason: "Đã đạt cấp tối đa",
      cost: null,
      currentLevel,
      nextLevel: currentLevel,
      requiredRankStep: null,
    };
  }
  const nextLevel = currentLevel + 1;
  const cost = getFarmUpgradeCost(id, currentLevel);
  const requiredRankStep = getFarmUpgradeRequiredRankStep(id, nextLevel);
  if (requiredRankStep && currentRankIndex < requiredRankStep.rankIndex) {
    return {
      canUpgrade: false,
      reason: `Yêu cầu quân hàm ${requiredRankStep.displayName}`,
      cost,
      currentLevel,
      nextLevel,
      requiredRankStep,
    };
  }
  if (cost !== null && farm.gold < cost) {
    return {
      canUpgrade: false,
      reason: `Cần ${cost} Vàng`,
      cost,
      currentLevel,
      nextLevel,
      requiredRankStep,
    };
  }
  return {
    canUpgrade: true,
    cost,
    currentLevel,
    nextLevel,
    requiredRankStep,
  };
}

export function purchaseFarmUpgrade(
  farm: FarmSaveState,
  id: FarmUpgradeId,
  currentRankIndex: number
): {
  success: boolean;
  message: string;
  newLevel?: number;
  costPaid?: number;
} {
  const check = canUpgradeFarmBuilding(farm, id, currentRankIndex);
  if (!check.canUpgrade || check.cost === null) {
    return {
      success: false,
      message: check.reason || "Không thể nâng cấp công trình lúc này.",
    };
  }
  const def = FARM_UPGRADE_MAP[id];
  farm.gold = Math.max(0, farm.gold - check.cost);
  const upgrades = getFarmUpgrades(farm);
  upgrades[id] = check.nextLevel;
  farm.upgrades = upgrades;

  return {
    success: true,
    newLevel: check.nextLevel,
    costPaid: check.cost,
    message: `Đã nâng cấp ${def.name} lên Cấp ${check.nextLevel}!`,
  };
}

export function getAffordableUpgradeCount(
  farm: FarmSaveState,
  currentRankIndex: number
): number {
  let count = 0;
  for (const def of FARM_UPGRADE_DEFINITIONS) {
    if (canUpgradeFarmBuilding(farm, def.id, currentRankIndex).canUpgrade) {
      count += 1;
    }
  }
  return count;
}
