import type { TroopType, UltimateDefinition } from "./types";

/** Rage earned by the acting unit after one completed basic attack. */
export const BASIC_ATTACK_RAGE_GAIN = 10;

/** Unified Timeline rebalance tuning shared by config, engine, UI and tests. */
export const INFANTRY_ULTIMATE_HEAL_MISSING_HP_RATIO = 0.20;
export const INFANTRY_ULTIMATE_PROTECTION_ACTION_TURNS = 2;
export const ARTILLERY_ULTIMATE_WAVE_ATTACK_RATIO = 0.45;
export const ARMOR_ULTIMATE_DEFENSE_BONUS_RATIO = 1.00;
export const ARMOR_ULTIMATE_ACTION_TURNS = 3;
export const COMMANDO_ULTIMATE_ATTACK_RATIO = 1.40;
export const COMMANDO_ULTIMATE_MISSING_HP_RATIO = 0.30;
export const COMMANDO_ULTIMATE_MAX_HITS = 2;
export const MEDIC_ULTIMATE_HEAL_MAX_HP_RATIO = 0.28;
export const ANTI_TANK_ULTIMATE_ATTACK_RATIO = 1.20;
export const ANTI_TANK_ULTIMATE_MAX_HP_RATIO = 0.23;
export const ENGINEER_ULTIMATE_HEAL_MISSING_HP_RATIO = 0.15;
export const ENGINEER_ULTIMATE_REFLECT_RATIO = 0.75;
export const GUARD_ULTIMATE_SHIELD_MAX_HP_RATIO = 0.13;
export const GUARD_ULTIMATE_SHIELD_ACTION_TURNS = 2;
export const AIR_FORCE_ULTIMATE_BASE_ATTACK_RATIO = 1.20;
export const AIR_FORCE_ULTIMATE_ATTACK_RATIO_PER_STACK = 0.08;
export const PIONEER_ULTIMATE_ATTACK_RATIO = 1.20;
export const PIONEER_ULTIMATE_STUN_CHANCE = 0.70;
export const PIONEER_ULTIMATE_STUN_ACTIONS = 1;
export const CHEMICAL_ULTIMATE_ATTACK_RATIO = 0.35;
export const CHEMICAL_ULTIMATE_STUN_CHANCE = 0.40;
export const CHEMICAL_ULTIMATE_STUN_ACTIONS = 2;
export const SCOUT_ULTIMATE_TIMELINE_MULTIPLIER = 0.50;
export const MARKSMAN_ULTIMATE_ATTACK_RATIO = 1.35;
export const MARKSMAN_ULTIMATE_EXECUTE_ATTACK_RATIO = 2.25;
export const MARKSMAN_ULTIMATE_EXECUTE_HP_THRESHOLD = 0.30;
export const ELECTRONIC_ULTIMATE_ATTACK_RATIO = 0.40;
export const ELECTRONIC_ULTIMATE_RAGE_DRAIN = 20;
export const SPECIAL_OPS_ULTIMATE_ATTACK_RATIO = 1.20;
export const SPECIAL_OPS_ULTIMATE_CONTROL_CHANCE = 0.35;
export const SPECIAL_OPS_ULTIMATE_CONTROL_ACTION_TURNS = 2;
export const DIVINE_MEDIC_ULTIMATE_HEAL_MAX_HP_RATIO = 0.20;
export const FORENSIC_ULTIMATE_ATTACK_RATIO = 0.30;
export const FORENSIC_ULTIMATE_NORMAL_MULTIPLIER = 0.60;
export const FORENSIC_ULTIMATE_MARKED_MULTIPLIER = 0.40;
export const FORENSIC_ULTIMATE_ACTION_TURNS = 2;
export const MARTIAL_ARTIST_PHI_LONG_ATTACK_RATIO = 1.30;
export const MARTIAL_ARTIST_GIANG_LONG_ATTACK_RATIO = 1.90;

export const ULTIMATE_CONFIG: Readonly<Record<TroopType, UltimateDefinition>> = {
  infantry: {
    ultimateId: "infantry_ultimate",
    ultimateRageRequired: 60,
    name: "QUYẾT TÂM BẤT DIỆT",
    description: "Hồi 20% HP đã mất. Trong 2 Lượt Hành Động tiếp theo, HP không thể giảm dưới 10%.",
    implemented: true,
  },
  artillery: {
    ultimateId: "artillery_ultimate",
    ultimateRageRequired: 60,
    name: "TỌA ĐỘ HỦY DIỆT",
    description: "Bắn 3 đợt pháo vào toàn bộ kẻ địch. Mỗi đợt gây sát thương bằng 45% ATK.",
    implemented: true,
  },
  armor: {
    ultimateId: "armor_ultimate",
    ultimateRageRequired: 50,
    name: "THẾ THỦ",
    description: "Thiết Giáp vào thế thủ, tăng thêm 100% DEF trong 3 Lượt Hành Động tiếp theo.",
    implemented: true,
  },
  commando: {
    ultimateId: "commando_ultimate",
    ultimateRageRequired: 40,
    name: "NHẤT KÍCH TẤT SÁT",
    description: "Tấn công kẻ địch thấp máu ưu tiên Hàng Sau, gây 140% ATK cộng thêm 30% lượng Máu mục tiêu đã mất. Nếu kết liễu, Đặc Công trở về vị trí ban đầu rồi lập tức lao tới tấn công thêm tối đa 1 mục tiêu mới bằng cùng Ultimate.",
    implemented: true,
  },
  medic: {
    ultimateId: "medic_ultimate",
    ultimateRageRequired: 60,
    name: "CỨU THƯƠNG",
    description: "Hồi máu cho 2 đồng minh có % Máu thấp nhất, mỗi mục tiêu nhận lượng hồi bằng 28% Máu Tối Đa của Quân Y. Đồng thời xóa toàn bộ hiệu ứng bất lợi có thể thanh tẩy trên 2 mục tiêu.",
    implemented: true,
  },
  anti_tank: {
    ultimateId: "anti_tank_ultimate",
    ultimateRageRequired: 50,
    name: "ĐẠN XUYÊN PHÁ",
    description: "Gây 120% ATK cộng thêm 23% Máu Tối Đa của mục tiêu. Khi đánh Boss, phần % Máu cộng thêm tối đa bằng 125% ATK hiện tại. Nếu mục tiêu còn sống, giảm 30% DEF của mục tiêu trong 2 Lượt Hành Động tiếp theo.",
    implemented: true,
  },
  engineer: {
    ultimateId: "engineer_ultimate",
    ultimateRageRequired: 50,
    name: "LỲ ĐÒN",
    description: "Hồi lại 15% Máu đã mất. Khiêu khích toàn bộ kẻ địch trong 1 Lượt Hành Động tiếp theo, tăng tỷ lệ Phản Đòn tăng từ 50% lên 75% trong thời gian này",
    implemented: true,
  },
  chemical: {
    ultimateId: "chemical_ultimate",
    ultimateRageRequired: 60,
    name: "BÙNG NỔ ĐỘC DƯỢC",
    description: "Gây sát thương bằng 35% ATK lên toàn bộ kẻ địch và có 40% xác suất làm Choáng kẻ địch trong 2 Lượt Hành Động kế tiếp",
    implemented: true,
  },
  air_force: {
    ultimateId: "air_force_ultimate",
    ultimateRageRequired: 40,
    name: "TÊN LỬA ĐỊNH HƯỚNG",
    description: "Tấn công kẻ địch gần nhất mà Không Quân vừa gây sát thương bằng 120% ATK cộng thêm 8% ATK cho mỗi cộng dồn Thống Trị Bầu Trời.",
    implemented: true,
  },
  guard: {
    ultimateId: "guard_ultimate",
    ultimateRageRequired: 60,
    name: "BẢO HỘ LINH HỒN",
    description: "Tạo Lá Chắn bằng 13% Máu Tối Đa của Vệ Binh cho toàn bộ đồng minh trong 2 Lượt Hành Động tiếp theo.",
    implemented: true,
  },
  pioneer: {
    ultimateId: "pioneer_ultimate",
    ultimateRageRequired: 40,
    name: "HẠ ĐO VÁN",
    description: " Nhắm vào kẻ địch sắp hành động sớm nhất trên Thanh Thứ Tự, gây sát thương 120% ATK và có 70% xác suất khiến mục tiêu bị Choáng, mất 1 Lượt Hành Động kế tiếp.",
    implemented: true,
  },
  scout: {
    ultimateId: "scout_ultimate",
    ultimateRageRequired: 40,
    name: "MỞ ĐƯỜNG",
    description: "Rút ngắn 50% quãng chờ còn lại đến lượt hành động tiếp theo của toàn bộ đồng minh trên Thanh Thứ Tự.",
    implemented: true,
  },
  marksman: {
    ultimateId: "marksman_ultimate",
    ultimateRageRequired: 50,
    name: "PHÁT BẮN KẾT LIỄU",
    description: "Bắn mục tiêu gần nhất mà Xạ Thủ vừa gây sát thương bằng 135% ATK; nếu mục tiêu còn dưới 30% Máu, sát thương tăng lên thành 225% ATK.",
    implemented: true,
  },
  electronic_warfare: {
    ultimateId: "electronic_warfare_ultimate",
    ultimateRageRequired: 60,
    name: "XUNG ĐIỆN TỪ",
    description: "Phát một xung điện từ gây sát thương bằng 40% ATK lên toàn bộ kẻ địch và giảm 20 Nộ của mục tiêu, không thể làm Nộ giảm dưới 0.",
    implemented: true,
  },
  special_ops: {
    ultimateId: "special_ops_ultimate",
    ultimateRageRequired: 50,
    name: "ÁP CHẾ",
    description: "Gây sát thương 120% ATK lên toàn bộ kẻ địch. Mục tiêu có dấu ấn Theo Dõi có 35% xác suất bị Choáng trong 2 Lượt Hành Động tiếp theo; mục tiêu không có Theo Dõi có 35% xác suất bị Câm Lặng trong 2 Lượt Hành Động tiếp theo.",
    implemented: true,
  },
  divine_medic: {
    ultimateId: "divine_medic_ultimate",
    ultimateRageRequired: 60,
    name: "CHỮA LÀNH",
    description: "Hồi máu cho toàn bộ đồng minh còn sống bằng 20% Máu Tối Đa của Thần Y.",
    implemented: true,
  },
  forensic_medic: {
    ultimateId: "forensic_medic_ultimate",
    ultimateRageRequired: 50,
    name: "ĐAU ĐỚN THỂ XÁC",
    description: "Gây sát thương bằng 30% ATK lên toàn bộ kẻ địch và giảm 40% lượng hồi máu và lá chắn trong 2 Lượt Hành Động tiếp theo. Mục tiêu đang có Mùi Máu bị giảm 60% thay vì 40%.",
    implemented: true,
  },
  martial_artist: {
    ultimateId: "martial_artist_ultimate",
    ultimateRageRequired: 30,
    name: "SONG LONG TRẢO THỦ",
    description: "Luân phiên Phi Long (130% ATK) và Giáng Long (190% ATK, phá toàn bộ buff có thể xóa nếu mục tiêu còn sống) lên kẻ địch đang có ATK hiện tại cao nhất.",
    implemented: true,
  },
};

export function getMartialArtistUltimateName(stance: "phi_long" | "giang_long" = "phi_long"): string {
  return stance === "giang_long" ? "GIÁNG LONG" : "PHI LONG";
}

export function getMartialArtistUltimateDescription(stance: "phi_long" | "giang_long" = "phi_long"): string {
  return stance === "giang_long"
    ? "30 Nộ · Tấn công kẻ địch có ATK hiện tại cao nhất, gây 190% ATK. Sau sát thương, xóa toàn bộ buff có lợi trên mục tiêu còn sống. Sau khi thi triển, chuyển về Phi Long và Nộ trở về 0."
    : "30 Nộ · Tấn công kẻ địch có ATK hiện tại cao nhất, gây 130% ATK. Sau khi thi triển, chuyển sang Giáng Long và Nộ trở về 0.";
}

export function getUltimateConfig(troopType: TroopType): UltimateDefinition {
  return ULTIMATE_CONFIG[troopType];
}

export function hasImplementedUltimate(troopType: TroopType | null): troopType is TroopType {
  return Boolean(troopType && ULTIMATE_CONFIG[troopType].implemented);
}
