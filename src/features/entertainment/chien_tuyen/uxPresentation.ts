import { MAX_BARRACKS_LEVEL, MAX_FORMATION_UNITS, MAX_SAME_TROOP_TYPE } from "./config";
import { BOSS_FLOORS } from "./towerFloorCatalog";
import type { BattleSide, TroopType } from "./types";

export type ArmyRoleFilter = "all" | "tank" | "fighter" | "dps" | "support" | "control";

export const ARMY_ROLE_FILTERS: ReadonlyArray<{ id: ArmyRoleFilter; label: string }> = [
  { id: "all", label: "TẤT CẢ" },
  { id: "tank", label: "TANKER" },
  { id: "dps", label: "DPS" },
  { id: "support", label: "SUPPORT" },
  { id: "fighter", label: "ĐẤU SĨ" },
  { id: "control", label: "KHỐNG CHẾ" },
];

export const TROOP_ROLE_FILTERS: Readonly<Record<TroopType, readonly ArmyRoleFilter[]>> = {
  infantry: ["fighter"],
  artillery: ["dps"],
  armor: ["tank"],
  commando: ["dps"],
  medic: ["support"],
  anti_tank: ["fighter"],
  engineer: ["tank"],
  chemical: ["control"],
  air_force: ["dps"],
  guard: ["support"],
  pioneer: ["fighter", "control"],
  scout: ["support"],
  marksman: ["dps"],
  electronic_warfare: ["support", "control"],
  special_ops: ["control"],
  divine_medic: ["support"],
  forensic_medic: ["support", "control"],
  martial_artist: ["fighter"],
};

export interface TroopStrategyCopy {
  strengths: readonly string[];
  weaknesses: readonly string[];
}

export const TROOP_STRATEGY_COPY: Readonly<Record<TroopType, TroopStrategyCopy>> = {
  infantry: {
    strengths: ["Công thủ cân bằng", "Ổn định đầu và giữa trận"],
    weaknesses: ["Không có thế mạnh cực đoan"],
  },
  artillery: {
    strengths: ["Sát thương diện rộng rất mạnh"],
    weaknesses: ["Mỏng và dễ bị ám sát"],
  },
  armor: {
    strengths: ["Chống chịu cao nhất đầu trận"],
    weaknesses: ["Sát thương thấp", "SPEED thấp"],
  },
  commando: {
    strengths: ["Dồn sát thương hàng sau", "SPEED rất cao"],
    weaknesses: ["Mỏng", "Yếu nếu không kết liễu sớm"],
  },
  medic: {
    strengths: ["Hồi máu và Thanh Tẩy"],
    weaknesses: ["Sát thương thấp", "Cần được bảo vệ"],
  },
  anti_tank: {
    strengths: ["Khắc chế Tank và Boss", "Khả năng chống chịu khá"],
    weaknesses: ["Kém hiệu quả hơn trước mục tiêu ít HP"],
  },
  engineer: {
    strengths: ["HP cực cao", "Phản sát thương"],
    weaknesses: ["Sát thương đánh thường thấp"],
  },
  chemical: {
    strengths: ["Giảm DEF diện rộng", "Khống chế nhiều mục tiêu"],
    weaknesses: ["Sát thương trực tiếp thấp"],
  },
  air_force: {
    strengths: ["Tăng tiến mạnh cuối trận", "SPEED cao"],
    weaknesses: ["Yếu đầu trận", "Cần được bảo vệ"],
  },
  guard: {
    strengths: ["Tạo Khiên cho toàn đội"],
    weaknesses: ["Sát thương thấp", "SPEED thấp"],
  },
  pioneer: {
    strengths: ["Đấu sĩ có khống chế", "Gián đoạn quân sắp hành động"],
    weaknesses: ["Sát thương không cao"],
  },
  scout: {
    strengths: ["SPEED rất cao", "Tăng nhịp hành động của đội"],
    weaknesses: ["Damage không cao", "Không hồi máu hay tạo Khiên"],
  },
  marksman: {
    strengths: ["Bám mục tiêu càng lâu càng mạnh", "Kết liễu mục tiêu thấp HP"],
    weaknesses: ["SPEED thấp", "Phòng thủ thấp"],
  },
  electronic_warfare: {
    strengths: ["Giảm Nộ nhận từ đòn thường", "Rút Nộ diện rộng"],
    weaknesses: ["Không có burst", "Kém hiệu quả trước đội ít phụ thuộc Ultimate"],
  },
  special_ops: {
    strengths: ["Khống chế diện rộng", "Thiết lập Theo Dõi để phân nhánh hiệu ứng"],
    weaknesses: ["Sát thương rất thấp", "SPEED thấp"],
  },
  divine_medic: {
    strengths: ["Bảo vệ đồng minh nguy cấp", "Hồi máu toàn đội"],
    weaknesses: ["Sát thương cực thấp", "Không Thanh Tẩy"],
  },
  forensic_medic: {
    strengths: ["Khắc chế hồi máu và Khiên", "Debuff diện rộng"],
    weaknesses: ["DPS thấp", "Ít giá trị trước đội không có sustain"],
  },
  martial_artist: {
    strengths: ["Chặn trọn chuỗi sát thương", "Luân phiên dồn sát thương và phá buff"],
    weaknesses: ["Cần tích đủ 4 tầng Đỡ Đòn", "Không phải Tank chính"],
  },
};

const PRIMARY_ROLE: Readonly<Record<TroopType, { icon: string; label: string }>> = {
  infantry: { icon: "⚔", label: "Đấu sĩ" },
  artillery: { icon: "⚔", label: "DPS" },
  armor: { icon: "🛡", label: "Tank" },
  commando: { icon: "⚔", label: "DPS" },
  medic: { icon: "✚", label: "Hỗ trợ" },
  anti_tank: { icon: "🎯", label: "Chống Tank" },
  engineer: { icon: "🛡", label: "Tank" },
  chemical: { icon: "✦", label: "Khống chế" },
  air_force: { icon: "⚔", label: "DPS" },
  guard: { icon: "✚", label: "Hỗ trợ" },
  pioneer: { icon: "✦", label: "Đấu sĩ/Khống chế" },
  scout: { icon: "⏩", label: "Hỗ trợ/Timeline" },
  marksman: { icon: "🎯", label: "DPS" },
  electronic_warfare: { icon: "📡", label: "Hỗ trợ/Khống chế" },
  special_ops: { icon: "⌖", label: "Khống chế" },
  divine_medic: { icon: "✚", label: "Hỗ trợ" },
  forensic_medic: { icon: "✚↓", label: "Hỗ trợ/Khống chế" },
  martial_artist: { icon: "🥋", label: "Đấu sĩ" },
};

export function troopMatchesArmyFilter(troopType: TroopType, filter: ArmyRoleFilter): boolean {
  return filter === "all" || TROOP_ROLE_FILTERS[troopType].includes(filter);
}

/** Filters first, then stably moves troops with a positive available count up. */
export function filterAndSortDeploymentTroops(
  troopTypes: readonly TroopType[],
  availableCounts: Partial<Record<TroopType, number>>,
  filter: ArmyRoleFilter,
): TroopType[] {
  return troopTypes
    .filter((troopType) => troopMatchesArmyFilter(troopType, filter))
    .map((troopType, catalogIndex) => ({
      troopType,
      catalogIndex,
      available: Math.max(0, availableCounts[troopType] ?? 0) > 0,
    }))
    .sort((left, right) =>
      Number(right.available) - Number(left.available) ||
      left.catalogIndex - right.catalogIndex
    )
    .map(({ troopType }) => troopType);
}

export function getPrimaryRolePresentation(troopType: TroopType): { icon: string; label: string } {
  return PRIMARY_ROLE[troopType];
}

export function getSpeedTier(speed: number): "Chậm" | "Trung Bình" | "Nhanh" | "Rất Nhanh" {
  if (speed <= 34) return "Chậm";
  if (speed <= 49) return "Trung Bình";
  if (speed <= 64) return "Nhanh";
  return "Rất Nhanh";
}

export function getTimelineSidePresentation(side: BattleSide): { badge: string; label: string; marker: string } {
  return side === "player"
    ? { badge: "TA", label: "Phe Ta", marker: "▲" }
    : { badge: "ĐỊCH", label: "Phe Địch", marker: "▼" };
}

export function getFormationTutorialCopy(): string {
  return `Kéo thả hoặc chạm binh chủng rồi chạm ô. Tối đa ${MAX_FORMATION_UNITS} quân, mỗi binh chủng tối đa ${MAX_SAME_TROOP_TYPE} quân.`;
}

export function getTutorialSteps(): ReadonlyArray<{ title: string; text: string }> {
  return [
    {
      title: "THÁP 100 TẦNG",
      text: `Chinh phục 100 tầng. Boss xuất hiện ở mỗi tầng thứ 10 (${BOSS_FLOORS.join(", ")}). Đội địch ở một số tầng có thể dùng nhiều quân cùng loại; hãy xem trước đội hình để tìm cách khắc chế.`,
    },
    {
      title: "DOANH TRẠI & QUÂN SỐ",
      text: "Đào tạo quân ở Doanh Trại, nâng cấp từng binh chủng và mở thêm ô đào tạo khi cấp Hành Trình tăng.",
    },
    { title: "BỐ TRÍ ĐỘI HÌNH", text: getFormationTutorialCopy() },
    {
      title: "THANH THỨ TỰ HÀNH ĐỘNG",
      text: "Cả hai đội dùng chung một Thanh Thứ Tự. Lượt Hành Động là lượt riêng của từng quân trên thanh này. SPEED càng cao, quân càng nhận Lượt Hành Động thường xuyên hơn. Lượt Trận là vòng tổng thể, dùng cho Áp Lực Chiến Trường và tiến trình trận. Kỹ năng có thời lượng theo Lượt Hành Động, không theo Lượt Trận.",
    },
    {
      title: "TỬ TRẬN LÀ MẤT QUÂN",
      text: "Quân sống sót sẽ trở về. Quân tử trận mất vĩnh viễn, kể cả khi tải lại giữa trận; chỉ lần vượt đầu nhận Vàng.",
    },
  ];
}

export function getTroopUpgradeLockCopy(level: number, barracksLevel: number): { title: string; description: string } {
  if (level >= MAX_BARRACKS_LEVEL) {
    return { title: "Đã đạt cấp tối đa", description: "Binh chủng này đã đạt cấp tối đa." };
  }
  const requiredLevel = Math.min(MAX_BARRACKS_LEVEL, Math.max(level + 1, barracksLevel));
  return {
    title: "Đã đạt giới hạn hiện tại",
    description: `Nâng Doanh Trại lên Lv${requiredLevel} để tiếp tục nâng cấp.`,
  };
}
