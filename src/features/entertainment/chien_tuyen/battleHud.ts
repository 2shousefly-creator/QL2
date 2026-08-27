import type { BattleUnit, ShieldEntry } from "./types";

export interface HealthShieldFill {
  hpPercent: number;
  shieldPercent: number;
  overflowShieldPercent: number;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function getTotalShield(shields: readonly ShieldEntry[]): number {
  return shields.reduce((sum, shield) => sum + Math.max(0, Number.isFinite(shield.amount) ? shield.amount : 0), 0);
}

export function getHealthShieldFill(currentHp: number, maxHp: number, totalShield: number): HealthShieldFill {
  const safeMax = Math.max(1, Number.isFinite(maxHp) ? maxHp : 1);
  const hp = Math.max(0, Math.min(safeMax, Number.isFinite(currentHp) ? currentHp : 0));
  const shield = Math.max(0, Number.isFinite(totalShield) ? totalShield : 0);
  const freeHpSpace = Math.max(0, safeMax - hp);
  const normalShield = Math.min(shield, freeHpSpace);
  const overflowShield = Math.max(0, shield - normalShield);
  return {
    hpPercent: clampPercent((hp / safeMax) * 100),
    shieldPercent: clampPercent((normalShield / safeMax) * 100),
    overflowShieldPercent: clampPercent((overflowShield / safeMax) * 100),
  };
}

export function getRageFillPercent(rage: number, ultimateRageRequired: number): number {
  const required = Math.max(1, Number.isFinite(ultimateRageRequired) ? ultimateRageRequired : 1);
  return clampPercent((Math.max(0, Number.isFinite(rage) ? rage : 0) / required) * 100);
}

export interface BattleStatusRailItem {
  id: string;
  icon: string;
  label: string;
  tone: "danger" | "warning" | "buff" | "growth" | "shield" | "guard";
}

export interface BattleStatusRail {
  visible: BattleStatusRailItem[];
  overflow: number;
  all: BattleStatusRailItem[];
}

export function getBattleStatusRail(unit: BattleUnit, _round?: number, visibleLimit = 3): BattleStatusRail {
  const items: BattleStatusRailItem[] = [];
  if (unit.troopType === "martial_artist") {
    const stacks = Math.max(0, Math.min(4, Math.floor(unit.martialArtistGuardStacks ?? 0)));
    items.push({ id: "martial-guard", icon: `🥋${stacks}/4`, label: `Đỡ Đòn ${stacks}/4${stacks >= 4 ? " · Sẵn sàng chặn chuỗi sát thương kế tiếp" : ""}`, tone: "guard" });
  }
  const statuses = unit.statuses ?? [];
  const stun = statuses.find((status) => status.type === "stun" && (status.remainingActionTurns ?? 1) > 0);
  if (stun) {
    const duration = Math.max(0, stun.remainingActionTurns ?? 0);
    items.push({ id: "stun", icon: "💫", label: `Choáng · còn ${duration} HĐ. Mất Lượt Hành Động khi hiệu ứng còn hiệu lực.`, tone: "danger" });
  }
  const silence = statuses.find((status) => status.type === "silence" && (status.remainingActionTurns ?? 1) > 0);
  if (silence) items.push({ id: "silence", icon: "…", label: `Câm Lặng · còn ${Math.max(0, silence.remainingActionTurns ?? 0)} HĐ. Không thể dùng Ultimate trong các Lượt Hành Động còn lại của hiệu ứng. Vẫn có thể đánh thường và Nội tại vẫn hoạt động.`, tone: "danger" });
  if (statuses.some((status) => status.type === "tracking")) items.push({ id: "tracking", icon: "⌖", label: "Đang bị Đặc Nhiệm Theo Dõi.", tone: "warning" });
  const rescue = statuses.find((status) => status.type === "rescue");
  if (rescue) items.push({ id: "rescue", icon: "✚🛡", label: "Giảm 35% sát thương nhận vào cho đến Lượt Hành Động kế tiếp của Thần Y.", tone: "buff" });
  const forensic = statuses.filter((status) => status.type === "forensic_suppression");
  if (forensic.length > 0) {
    const strongest = Math.min(...forensic.map((status) => status.healingReceivedMultiplier ?? 1));
    const passiveOnly = forensic.every((status) => status.effectKind === "forensic_passive");
    items.push({ id: "forensic", icon: "✚↓", label: passiveOnly
      ? "Giảm 40% hồi máu và lá chắn mới nhận cho đến Lượt Hành Động kế tiếp của Pháp Y."
      : `Giảm hồi máu và lá chắn mới nhận ${Math.round((1 - strongest) * 100)}% · còn ${Math.max(...forensic.map((status) => status.remainingActionTurns ?? 0))} HĐ.`, tone: "danger" });
  }
  const defenseDown = statuses.find((status) => status.type === "anti_tank_defense_down");
  if (defenseDown) items.push({ id: "defense-down", icon: "🛡↓", label: `Giảm DEF · còn ${Math.max(0, defenseDown.remainingActionTurns ?? 0)} HĐ. DEF bị giảm trong số Lượt Hành Động còn lại của mục tiêu.`, tone: "danger" });
  if (unit.corrosionStacks > 0) items.push({ id: "corrosion", icon: `☣${unit.corrosionStacks}`, label: `Ăn Mòn ${unit.corrosionStacks}/3`, tone: "danger" });
  const toughness = statuses.find((status) => status.type === "engineer_toughness");
  if (toughness) items.push({ id: "taunt", icon: "❗", label: "Khiêu Khích và tăng Phản Đòn", tone: "warning" });
  const deathRefusal = statuses.find((status) => status.type === "infantry_death_refusal");
  if (deathRefusal) items.push({ id: "death-refusal", icon: "☠̸", label: "Từ Chối Tử Thần", tone: "buff" });
  if (unit.armorUltimateDefenseBonus > 0 && unit.armorUltimateExpiresAfterActionTurn !== null) {
    items.push({ id: "armor-stance", icon: "🛡", label: `Thế Thủ · còn ${Math.max(0, unit.armorUltimateExpiresAfterActionTurn - unit.actionTurnCount)} HĐ`, tone: "buff" });
  }
  if (unit.passiveId === "air_force_attack_growth" && unit.passiveStacks > 0) {
    items.push({ id: "air-growth", icon: `✨${unit.passiveStacks}`, label: `Thống Trị Bầu Trời ×${unit.passiveStacks}`, tone: "growth" });
  }
  if (unit.passiveId === "marksman_focus" && unit.focusStacks > 0) {
    items.push({ id: "marksman-focus", icon: `🎯${unit.focusStacks}`, label: `Ngắm Chuẩn ${unit.focusStacks}/4`, tone: "growth" });
  }
  const totalShield = getTotalShield(unit.shields);
  if (totalShield > 0) items.push({ id: "shield", icon: "◆", label: `Khiên ${Math.round(totalShield)}`, tone: "shield" });
  const limit = Math.max(0, Math.floor(visibleLimit));
  return { visible: items.slice(0, limit), overflow: Math.max(0, items.length - limit), all: items };
}
