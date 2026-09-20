import type { CoreSystem } from "./airCombatTypes";

/** Explicit catalog assignments are independent of legacy category, tiers and RNG.
 * Future precedence: named skill → resource economy → survival → damage → utility.
 */
export const CORE_SYSTEM_LABELS: Record<CoreSystem, string> = {
  attack: "Tấn Công", defense: "Phòng Thủ", resource: "Tài Nguyên",
  skill: "Kỹ Năng", utility: "Đa Dụng",
};
export const CORE_SYSTEM_COLORS: Record<CoreSystem, string> = {
  attack: "#ef4444", defense: "#22c55e", resource: "#3b82f6",
  skill: "#f97316", utility: "#a855f7",
};
