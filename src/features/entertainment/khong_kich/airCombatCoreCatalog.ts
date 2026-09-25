import { SKILL_CORE_DESCRIPTIONS } from "./airCombatSkillCores";
import type { CoreDefinition } from "./airCombatTypes";

// Canonical 26.13.0 Appendix A. Retired IDs remain stable but are excluded by eligibility.
export const CORE_DEFINITIONS: readonly CoreDefinition[] = [
  {
    "id": "core_001",
    "name": "Hỏa Lực Đồng Bộ",
    "description": "+25 Hỏa Lực, +36% Tốc Độ Bắn Cộng Thêm.",
    "system": "attack",
    "icon": "core:core_001",
    "category": "offense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_002",
    "name": "Khung Hộ Vệ",
    "description": "+270 Máu Tối Đa, +25 Giáp.",
    "system": "defense",
    "icon": "core:core_002",
    "category": "offense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_003",
    "name": "Tinh chỉnh cò súng",
    "description": "+18% Tốc Độ Bắn Cộng Thêm",
    "system": "attack",
    "icon": "core:core_003",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_004",
    "name": "Khung thân gia cố",
    "description": "+160 Máu Tối Đa",
    "system": "defense",
    "icon": "core:core_004",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_005",
    "name": "Hệ Tái Tạo Chiến Thuật",
    "description": "+2 Hồi Máu/s, +12 Điểm Hồi Kỹ Năng, +15% Hồi Tài Nguyên.",
    "system": "defense",
    "icon": "core:core_005",
    "category": "offense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_006",
    "name": "Tái tạo",
    "description": "+6 Điểm Hồi Kỹ Năng",
    "system": "utility",
    "icon": "core:core_006",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_007",
    "name": "Hỏa Lực Tăng Áp",
    "description": "+40 Hỏa Lực, +58% Tốc Độ Bắn Cộng Thêm.",
    "system": "attack",
    "icon": "core:core_007",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_008",
    "name": "Khung Hợp Kim Chiến Đấu",
    "description": "+400 Máu Tối Đa, +40 Giáp.",
    "system": "defense",
    "icon": "core:core_008",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_009",
    "name": "Bộ nạp liên thanh",
    "description": "Nhận +29% Tốc Độ Bắn Cộng Thêm.",
    "system": "attack",
    "icon": "core:core_009",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_010",
    "name": "Khung thân chiến đấu",
    "description": "+260 Máu Tối Đa",
    "system": "defense",
    "icon": "core:core_010",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_011",
    "name": "Tái Tạo Nano",
    "description": "+3 Hồi Máu/s, +18 Điểm Hồi Kỹ Năng, +25% Hồi Tài Nguyên.",
    "system": "defense",
    "icon": "core:core_011",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_012",
    "name": "Rút ngắn thời gian",
    "description": "+12 Điểm Hồi Kỹ Năng",
    "system": "utility",
    "icon": "core:core_012",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_013",
    "name": "Nền Tảng Hủy Diệt",
    "description": "+60 Hỏa Lực, +87% Tốc Độ Bắn Cộng Thêm.",
    "system": "attack",
    "icon": "core:core_013",
    "category": "offense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_014",
    "name": "Pháo Đài Kim Cương",
    "description": "+650 Máu Tối Đa, +60 Giáp.",
    "system": "defense",
    "icon": "core:core_014",
    "category": "offense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_015",
    "name": "Buồng bắn siêu tốc",
    "description": "Nhận +72% Tốc Độ Bắn Cộng Thêm.",
    "system": "attack",
    "icon": "core:core_015",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_016",
    "name": "Khung thân bất hoại",
    "description": "+520 Máu Tối Đa",
    "system": "defense",
    "icon": "core:core_016",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_017",
    "name": "Tái Tạo Lượng Tử",
    "description": "+4,5 Hồi Máu/s, +25 Điểm Hồi Kỹ Năng, +35% Hồi Tài Nguyên.",
    "system": "defense",
    "icon": "core:core_017",
    "category": "offense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_018",
    "name": "Đồng hồ nghịch thời",
    "description": "Nhận 25 Điểm Hồi Kỹ Năng.",
    "system": "utility",
    "icon": "core:core_018",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_019",
    "name": "Nâng cấp Mồi Bẫy",
    "description": "Mồi Bẫy phóng thêm 1 đợt và mỗi mồi tồn tại thêm 1 giây — tổng cộng 4 đợt, mỗi mồi tồn tại 2,5 giây.",
    "system": "skill",
    "icon": "core:core_019",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "black_eagle"
    ],
    "skillSlot": 1,
    "skillId": "decoy"
  },
  {
    "id": "core_020",
    "name": "Chuẩn bị Bẫy",
    "description": "Hồi Chiêu Mồi Bẫy còn 11 giây trước khi áp Điểm Hồi Kỹ Năng và các modifier Hồi Chiêu khác.",
    "system": "skill",
    "icon": "core:core_020",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "black_eagle"
    ],
    "skillSlot": 1,
    "skillId": "decoy"
  },
  {
    "id": "core_021",
    "name": "Phản công",
    "description": "Sau đợt Mồi Bẫy cuối cùng, gây thêm 30% mọi sát thương trong 5 giây.",
    "system": "skill",
    "icon": "core:core_021",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "black_eagle"
    ],
    "skillSlot": 1,
    "skillId": "decoy"
  },
  {
    "id": "core_022",
    "name": "Cuồng Nộ Kéo Dài",
    "description": "Điên Cuồng kéo dài thêm 3 giây, tổng cộng 10 giây.",
    "system": "skill",
    "icon": "core:core_022",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "black_eagle"
    ],
    "skillSlot": 2,
    "skillId": "afterburner"
  },
  {
    "id": "core_023",
    "name": "Quá Tải",
    "description": "Điên Cuồng nhận thêm +105% Tốc Độ Bắn Cộng Thêm, nâng tổng hiệu ứng từ +120% lên +225% Tốc Độ Bắn Cộng Thêm.",
    "system": "skill",
    "icon": "core:core_023",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "black_eagle"
    ],
    "skillSlot": 2,
    "skillId": "afterburner"
  },
  {
    "id": "core_024",
    "name": "Không Thể Ngăn Cản",
    "description": "Trong Điên Cuồng, miễn nhiễm khống chế và giảm 10% sát thương nhận vào.",
    "system": "skill",
    "icon": "core:core_024",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "black_eagle"
    ],
    "skillSlot": 2,
    "skillId": "afterburner"
  },
  {
    "id": "core_025",
    "name": "Kho Tên Lửa",
    "description": "Mưa Tên Lửa phóng tổng cộng 16 tên lửa.",
    "system": "skill",
    "icon": "core:core_025",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "black_eagle"
    ],
    "skillSlot": 3,
    "skillId": "missile_swarm"
  },
  {
    "id": "core_026",
    "name": "Tên lửa hủy diệt",
    "description": "Mỗi tên lửa của Mưa Tên Lửa gây 325% Hỏa Lực.",
    "system": "skill",
    "icon": "core:core_026",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "black_eagle"
    ],
    "skillSlot": 3,
    "skillId": "missile_swarm"
  },
  {
    "id": "core_027",
    "name": "Tên lửa tầm nhiệt",
    "description": "Tên lửa gây thiêu đốt 60% Hỏa Lực mỗi giây trong 4 giây và giảm 20% Giáp trong 5 giây. Trúng lại làm mới thời gian.",
    "system": "skill",
    "icon": "core:core_027",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "black_eagle"
    ],
    "skillSlot": 3,
    "skillId": "missile_swarm"
  },
  {
    "id": "core_028",
    "name": "Bất tử hộ thân",
    "description": "Khiên Năng Lượng giảm tổng cộng 85% sát thương nhận vào.",
    "system": "skill",
    "icon": "core:core_028",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "breaker"
    ],
    "skillSlot": 1,
    "skillId": "armor_shield"
  },
  {
    "id": "core_029",
    "name": "Trường Lực Bền Bỉ",
    "description": "Khiên Năng Lượng kéo dài thêm 3 giây, tổng cộng 9 giây.",
    "system": "skill",
    "icon": "core:core_029",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "breaker"
    ],
    "skillSlot": 1,
    "skillId": "armor_shield"
  },
  {
    "id": "core_030",
    "name": "Kiên Cố",
    "description": "Khi Khiên kết thúc, nhận +60% Giáp trong 6 giây.",
    "system": "skill",
    "icon": "core:core_030",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "breaker"
    ],
    "skillSlot": 1,
    "skillId": "armor_shield"
  },
  {
    "id": "core_031",
    "name": "Tử thần cận kề",
    "description": "Hồi Chiêu BigBang còn 15 giây trước khi áp Điểm Hồi Kỹ Năng và các modifier Hồi Chiêu khác.",
    "system": "skill",
    "icon": "core:core_031",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "breaker"
    ],
    "skillSlot": 2,
    "skillId": "heavy_bomb"
  },
  {
    "id": "core_032",
    "name": "Tận Diệt",
    "description": "BigBang gây thêm 500% Hỏa Lực, nâng sát thương lên 1900% Hỏa Lực.",
    "system": "skill",
    "icon": "core:core_032",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "breaker"
    ],
    "skillSlot": 2,
    "skillId": "heavy_bomb"
  },
  {
    "id": "core_033",
    "name": "Sóng Xung Kích",
    "description": "BigBang gây choáng 4 giây với mọi mục tiêu, kể cả Tinh Anh và Boss.",
    "system": "skill",
    "icon": "core:core_033",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "breaker"
    ],
    "skillSlot": 2,
    "skillId": "heavy_bomb"
  },
  {
    "id": "core_034",
    "name": "Pháo Nặng",
    "description": "Mỗi tia Oanh Tạc gây thêm 20% Hỏa Lực, nâng sát thương lên 80% Hỏa Lực.",
    "system": "skill",
    "icon": "core:core_034",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "breaker"
    ],
    "skillSlot": 3,
    "skillId": "sweeping_cannon"
  },
  {
    "id": "core_035",
    "name": "Pháo đài kiên cố",
    "description": "Trong khi Oanh Tạc hoạt động, nhận +35% Giáp.",
    "system": "skill",
    "icon": "core:core_035",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "breaker"
    ],
    "skillSlot": 3,
    "skillId": "sweeping_cannon"
  },
  {
    "id": "core_036",
    "name": "Bắn mọi ngóc ngách",
    "description": "Oanh Tạc bắn thêm 2 tia, tổng cộng 7 tia mỗi loạt.",
    "system": "skill",
    "icon": "core:core_036",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "breaker"
    ],
    "skillSlot": 3,
    "skillId": "sweeping_cannon"
  },
  {
    "id": "core_037",
    "name": "Dư Ảnh Kéo Dài",
    "description": "Phân Ảnh kéo dài thêm 1,5 giây, tổng cộng 3,5 giây.",
    "system": "skill",
    "icon": "core:core_037",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "phantom"
    ],
    "skillSlot": 1,
    "skillId": "invisibility"
  },
  {
    "id": "core_038",
    "name": "Sửa chữa khẩn cấp",
    "description": "Trong thời gian tàng hình, hồi dần 25% lượng Máu đã mất tại thời điểm kích hoạt.",
    "system": "skill",
    "icon": "core:core_038",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "phantom"
    ],
    "skillSlot": 1,
    "skillId": "invisibility"
  },
  {
    "id": "core_039",
    "name": "Thanh Thoát",
    "description": "Giảm 15 Điện tiêu hao của Phân Ảnh, còn 10 Điện.",
    "system": "skill",
    "icon": "core:core_039",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "phantom"
    ],
    "skillSlot": 1,
    "skillId": "invisibility"
  },
  {
    "id": "core_040",
    "name": "Thống khổ kéo dài",
    "description": "Laser Hủy Diệt bắn thêm 1 giây, tổng cộng 3 giây.",
    "system": "skill",
    "icon": "core:core_040",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "phantom"
    ],
    "skillSlot": 2,
    "skillId": "focus_laser"
  },
  {
    "id": "core_041",
    "name": "Hội tụ năng lượng",
    "description": "Giảm thời gian tụ Laser 1,8 giây → từ 2s → 0,2s, đồng thời Laser Hủy Diệt gây thêm 10% sát thương Laser Hủy Diệt mỗi nhịp",
    "system": "skill",
    "icon": "core:core_041",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "phantom"
    ],
    "skillSlot": 2,
    "skillId": "focus_laser"
  },
  {
    "id": "core_042",
    "name": "Năng lượng tối",
    "description": "Giảm 25 Điện tiêu hao của Laser Hủy Diệt, còn 20 Điện.",
    "system": "skill",
    "icon": "core:core_042",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "phantom"
    ],
    "skillSlot": 2,
    "skillId": "focus_laser"
  },
  {
    "id": "core_043",
    "name": "Hệ thống pin tiên tiến",
    "description": "HawkEye tiêu hao ít hơn 1 Điện mỗi giây, còn 3 Điện mỗi giây.",
    "system": "skill",
    "icon": "core:core_043",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "phantom"
    ],
    "skillSlot": 3,
    "skillId": "escort_drone"
  },
  {
    "id": "core_044",
    "name": "HawkEye hiếu chiến",
    "description": "Sau 7 giây HawkEye hoạt động, Cuồng Nộ 3 giây: HawkEye nhận +120% tốc độ bắn riêng (×2,2), Phantom nhận +105% Tốc Độ Bắn Cộng Thêm. Chu kỳ 7 giây bắt đầu lại khi Cuồng Nộ kết thúc.",
    "system": "skill",
    "icon": "core:core_044",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "phantom"
    ],
    "skillSlot": 3,
    "skillId": "escort_drone"
  },
  {
    "id": "core_045",
    "name": "Liên kết bền chặt",
    "description": "HawkEye kế thừa thêm 20% chỉ số Phantom → từ 55% → 75%.",
    "system": "skill",
    "icon": "core:core_045",
    "category": "skill",
    "tiers": [
      "diamond"
    ],
    "aircraftIds": [
      "phantom"
    ],
    "skillSlot": 3,
    "skillId": "escort_drone"
  },
  {
    "id": "core_046",
    "name": "Càng đánh càng hăng",
    "description": "Mỗi mạng hạ gục quái thường cho +0,5 Hỏa Lực, Tinh Anh/Boss ×5, vĩnh viễn trong lượt chơi.",
    "system": "attack",
    "icon": "core:core_046",
    "category": "offense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7  · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_047",
    "name": "Thích ứng phòng ngự",
    "description": "Mỗi mạng hạ gục quái thường cho +0,25 Giáp, Tinh Anh/Boss ×5, vĩnh viễn trong lượt chơi.",
    "system": "defense",
    "icon": "core:core_047",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_048",
    "name": "Trường Sinh",
    "description": "Mỗi mạng hạ gục quái thường cho +3 Máu Tối Đa, Tinh Anh/Boss ×5, vĩnh viễn trong lượt chơi.",
    "system": "defense",
    "icon": "core:core_048",
    "category": "offense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_049",
    "name": "Bất động minh vương",
    "description": "Đứng yên 2,5 giây nhận +60% Giáp và +30% Hỏa Lực. Di chuyển mất hiệu ứng.",
    "system": "utility",
    "icon": "core:core_049",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_050",
    "name": "Chuyển đổi: Vàng",
    "description": "Nhận 1 Lõi Vàng ngẫu nhiên.",
    "system": "utility",
    "icon": "core:core_050",
    "category": "resource",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Chỉ được offer khi còn ít nhất 1 Lõi Vàng unseen/hợp lệ để cấp."
  },
  {
    "id": "core_051",
    "name": "Chuyển đổi: Kim Cương",
    "description": "Nhận 1 Lõi Kim Cương ngẫu nhiên.",
    "system": "utility",
    "icon": "core:core_051",
    "category": "resource",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Chỉ được offer khi còn ít nhất 1 Lõi Kim Cương unseen/hợp lệ để cấp."
  },
  {
    "id": "core_052",
    "name": "Chuyển đổi: Hỗn Loạn",
    "description": "Nhận 2 Lõi ngẫu nhiên.",
    "system": "utility",
    "icon": "core:core_052",
    "category": "resource",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Chỉ được offer khi hệ thống có thể commit đủ 2 Lõi ngẫu nhiên unseen/hợp lệ trong cùng batch.<br>Giữ nguyên sức mạnh và tính ngẫu nhiên hiện tại."
  },
  {
    "id": "core_053",
    "name": "Găng bảo thạch",
    "description": "+25% Tỷ Lệ Chí Mạng; kỹ năng có thể chí mạng. Có Mắt Tempest: +25% Sát Thương Chí Mạng; có Thiên Nhãn Raijin: +50% Sát Thương Chí Mạng.",
    "system": "attack",
    "icon": "core:core_053",
    "category": "offense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Synergy chỉ áp dụng một lần theo family."
  },
  {
    "id": "core_054",
    "name": "Chậm mà chắc",
    "description": "Tốc Độ Bắn thường bị khóa tối đa ở 1,8 phát/giây. Tốc Độ Bắn hiệu lực trước khóa, tối đa 12, được chuyển thành Basic Damage theo tỷ lệ Tốc Độ Bắn / 1,8. Mỗi 0,1 Tốc Độ Bắn vượt 1,8 tương đương khoảng +5,56% Basic Damage.",
    "system": "utility",
    "icon": "core:core_054",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_055",
    "name": "Kính Ngắm Hiệu Chỉnh",
    "description": "+15% Tỷ Lệ Chí Mạng, +35% Sát Thương Chí Mạng.",
    "system": "attack",
    "icon": "core:core_055",
    "category": "offense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_056",
    "name": "Đầu đạn cân chỉnh",
    "description": "Nhận +3% Tỷ Lệ Chí Mạng và +22% Sát Thương Chí Mạng.",
    "system": "attack",
    "icon": "core:core_056",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_057",
    "name": "Xuyên thủng",
    "description": "Mọi sát thương bỏ qua 20% Giáp của mục tiêu.",
    "system": "attack",
    "icon": "core:core_057",
    "category": "offense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_058",
    "name": "Quá Tải Nòng Súng",
    "description": "Sau khi dùng Skill, các phát bắn thường kế tiếp trong 3 giây gây +50% Basic Damage và xuyên thêm 1 mục tiêu.",
    "system": "attack",
    "icon": "core:core_058",
    "category": "offense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. <br>Làm mới thời gian hiệu ứng, không cộng dồn"
  },
  {
    "id": "core_059",
    "name": "Phát bắn tích điện",
    "description": "Mỗi phát bắn thường thứ 8 gây 230% Basic Damage.",
    "system": "attack",
    "icon": "core:core_059",
    "category": "weapon",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_060",
    "name": "Nòng súng ổn định",
    "description": "Sau 3 giây không nhận sát thương, Basic Damage tăng 20%. Hiệu ứng mất khi nhận sát thương.",
    "system": "attack",
    "icon": "core:core_060",
    "category": "weapon",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_061",
    "name": "Giáp phản ứng nhanh",
    "description": "Khi nhận sát thương: +45 Giáp trong 5 giây. Hồi nội tại 10 giây sau khi hiệu ứng kết thúc.",
    "system": "defense",
    "icon": "core:core_061",
    "category": "offense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_062",
    "name": "Van sinh tồn",
    "description": "Khi dưới 22% Máu, hồi 1% máu đã mất mỗi giây cho tới khi đạt 22% Máu.",
    "system": "defense",
    "icon": "core:core_062",
    "category": "defense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_063",
    "name": "Máu nóng",
    "description": "Dưới 35% Máu: +50 Hỏa Lực và +35 Giáp.",
    "system": "utility",
    "icon": "core:core_063",
    "category": "defense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_064",
    "name": "Hút Hồn",
    "description": "Mỗi 10 điểm hạ gục hồi 5% Máu Tối Đa; quái thường tính 1, Tinh Anh/Boss tính 5.",
    "system": "defense",
    "icon": "core:core_064",
    "category": "defense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_065",
    "name": "Khung chống va đập",
    "description": "Giảm 40% sát thương va chạm/đòn lao trực tiếp. Sau khi bị va chạm hoặc trúng đòn lao, +12% mọi sát thương trong 3 giây. Hiệu ứng chỉ làm mới thời gian chứ không cộng dồn.",
    "system": "defense",
    "icon": "core:core_065",
    "category": "defense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_066",
    "name": "Combo săn mồi",
    "description": "Hạ gục liên tiếp cách nhau không quá 4 giây cho +4% mọi sát thương mỗi stack, tối đa 5 stack (+20%). Quá 4 giây không hạ gục mất toàn bộ stack.",
    "system": "attack",
    "icon": "core:core_066",
    "category": "offense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_067",
    "name": "Đánh dấu Tinh Anh",
    "description": "+18% mọi sát thương lên Tinh Anh/Boss.",
    "system": "attack",
    "icon": "core:core_067",
    "category": "offense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_068",
    "name": "Kết liễu gọn",
    "description": "Gây thêm 30% mọi sát thương lên mục tiêu dưới 30% Máu.",
    "system": "attack",
    "icon": "core:core_068",
    "category": "offense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_069",
    "name": "Phủ đầu",
    "description": "Gây thêm 30% mọi sát thương lên mục tiêu trên 70% Máu.",
    "system": "attack",
    "icon": "core:core_069",
    "category": "offense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_070",
    "name": "Tái kích hoạt",
    "description": "Mỗi 5 hạ gục giảm trực tiếp 3 giây Hồi Chiêu còn lại của 3 kỹ năng cơ bản (ngoại trừ kỹ năng Ultimate).",
    "system": "utility",
    "icon": "core:core_070",
    "category": "resource",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_071",
    "name": "Nhịp chiến thuật",
    "description": "Sau khi dùng Skill, nhận +36% Tốc Độ Bắn Cộng Thêm trong 6 giây. Hiệu ứng chỉ làm mới thời gian chứ không cộng dồn.",
    "system": "attack",
    "icon": "core:core_071",
    "category": "resource",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_072",
    "name": "Thép lạnh",
    "description": "Sau 4 giây không nhận sát thương, 3 đòn kế tiếp trúng bạn bị giảm 70% sát thương; sau khi đỡ 3 đòn, nhận +25 Giáp trong 3 giây rồi bắt đầu tích lại.",
    "system": "defense",
    "icon": "core:core_072",
    "category": "defense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_073",
    "name": "Đạn Phân Mảnh",
    "description": "Hạ địch gây nổ bằng 100% Hỏa Lực quanh mục tiêu bán kính 40 px.",
    "system": "attack",
    "icon": "core:core_073",
    "category": "weapon",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_074",
    "name": "Bạo Kích Hồi Tiếp",
    "description": "+15% Chí Mạng. Mỗi đòn chí mạng giảm 0,3 giây hồi chiêu còn lại của 3 kỹ năng cơ bản (ngoại trừ kỹ năng Ultimate)",
    "system": "utility",
    "icon": "core:core_074",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_075",
    "name": "Nhịp Sát Phạt",
    "description": "Mỗi 1 hạ gục +4% Hỏa Lực, tối đa 5 stack. Nhận sát thương mất 1 stack.",
    "system": "attack",
    "icon": "core:core_075",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_076",
    "name": "Lá Chắn Phản Ứng",
    "description": "Khi nhận sát thương vượt 10% Máu Tối Đa trong vòng 3 giây gần nhất, tạo Khiên bằng 15% Máu Tối Đa trong 3 giây. Hồi 10 giây sau khi kết thúc hiệu ứng.",
    "system": "defense",
    "icon": "core:core_076",
    "category": "defense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_077",
    "name": "Hồi Phục Chiến Trường",
    "description": "Hạ Tinh Anh/Boss hồi 18% Máu Tối Đa và giảm 5 giây hồi chiêu còn lại của mọi Skill.",
    "system": "utility",
    "icon": "core:core_077",
    "category": "defense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_078",
    "name": "Tiếp Sức Lò Phản Ứng",
    "description": "Hạ 5 kẻ địch trong 4 giây hồi ngay 5% Tài Nguyên Tối Đa và nhận +50% Hồi Tài Nguyên trong 6 giây. Hiệu ứng chỉ làm mới thời gian chứ không cộng dồn.",
    "system": "resource",
    "icon": "core:core_078",
    "category": "resource",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_079",
    "name": "Tam Liên Pháo",
    "description": "Mỗi Basic thứ 3 tạo thêm một viên đạn phụ tự nhắm mục tiêu gần nhất, gây 70% Basic Damage.",
    "system": "attack",
    "icon": "core:core_079",
    "category": "weapon",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_080",
    "name": "Dội Xạ Chiến Thuật",
    "description": "Basic có 50% cơ hội nảy sang mục tiêu khác gây 60% Basic Damage. Nếu không có mục tiêu phụ hợp lệ, dội lại 25% Basic Damage lên mục tiêu chính.",
    "system": "attack",
    "icon": "core:core_080",
    "category": "weapon",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_081",
    "name": "Lá chắn kỹ năng",
    "description": "Dùng Skill tạo lá chắn bằng 12% Máu Tối Đa trong 4 giây. Hồi nội tại 10 giây sau khi kết thúc hiệu ứng. Hiệu ứng chỉ làm mới thời gian chứ không cộng dồn.",
    "system": "defense",
    "icon": "core:core_081",
    "category": "resource",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_082",
    "name": "Áp Lực Liên Tục",
    "description": "Không bị trúng đòn trong 4 giây sẽ nhận +72% Tốc Độ Bắn Cộng Thêm cho tới khi bị trúng đòn.",
    "system": "attack",
    "icon": "core:core_082",
    "category": "weapon",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_083",
    "name": "Phản Công Tức Thời",
    "description": "Sau khi nhận sát thương, Basic Damage tăng 45% trong 5 giây. Hồi nội tại 15 giây sau khi hiệu ứng kết thúc.",
    "system": "attack",
    "icon": "core:core_083",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_084",
    "name": "Miễn Phí Có Điều Kiện",
    "description": "Mỗi kỹ năng thứ 4 sử dụng không tiêu hao tài nguyên nhưng Hồi Chiêu của lần cast đó tăng 10% sau khi áp Điểm Hồi Kỹ Năng.",
    "system": "resource",
    "icon": "core:core_084",
    "category": "resource",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_085",
    "name": "Pháo Đổi Giáp",
    "description": "+70 Hỏa Lực nhưng đội lại bị -45 Giáp.",
    "system": "utility",
    "icon": "core:core_085",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_086",
    "name": "Pin Xung Kích",
    "description": "Giảm 50% Tài Nguyên Tối Đa, nhưng nhận +80% Hồi Tài Nguyên.",
    "system": "resource",
    "icon": "core:core_086",
    "category": "resource",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_087",
    "name": "Mắt thần chiến trường",
    "description": "+40% Tỷ Lệ Chí Mạng, +100% Sát Thương Chí Mạng.",
    "system": "attack",
    "icon": "core:core_087",
    "category": "offense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_088",
    "name": "Xuyên phá tuyệt đối",
    "description": "Mọi sát thương bỏ qua 40% Giáp của mục tiêu. Gây thêm 10% mọi sát thương lên Tinh Anh/Boss có từ 80 Giáp trở lên.",
    "system": "attack",
    "icon": "core:core_088",
    "category": "offense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_089",
    "name": "Đạn xuyên vô tận",
    "description": "Đòn basic chính gây thêm 20% sát thương lên mục tiêu đầu tiên và xuyên tất cả mục tiêu; các mục tiêu bị xuyên lần lượt nhận 70% / 50% / 30% từ mục tiêu thứ 3 trở đi sát thương phát gốc.",
    "system": "attack",
    "icon": "core:core_089",
    "category": "weapon",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_090",
    "name": "Từ chối tử thần",
    "description": "Một lần mỗi lượt, sát thương chí tử để lại bạn ở 1 Máu, cho 2 giây miễn sát thương và hồi 35% Máu Tối Đa.",
    "system": "defense",
    "icon": "core:core_090",
    "category": "defense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_091",
    "name": "Không khuất phục",
    "description": "Mỗi 1% Máu đã mất tăng 0,8% mọi sát thương gây ra, tối đa +80%.",
    "system": "attack",
    "icon": "core:core_091",
    "category": "defense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_092",
    "name": "Tái Tạo Sinh Học",
    "description": "Sau 4 giây không nhận sát thương, hồi 1,5% Máu Tối Đa mỗi giây.",
    "system": "defense",
    "icon": "core:core_092",
    "category": "defense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_093",
    "name": "Đại Pháp Sư",
    "description": "Khi cast một Skill: giảm trực tiếp Hồi Chiêu còn lại của các Basic Skill khác bằng 15% Hồi Chiêu Cơ Bản của từng Skill; với Ultimate khác, giảm bằng 5% Hồi Chiêu Cơ Bản.",
    "system": "utility",
    "icon": "core:core_093",
    "category": "resource",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_094",
    "name": "Khế Ước Quỷ Quyệt",
    "description": "-40% Máu Tối Đa, +50% Hỏa Lực, +25% Chí Mạng.",
    "system": "utility",
    "icon": "core:core_094",
    "category": "offense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_095",
    "name": "Nghịch Lý Bạo Kích",
    "description": "Khóa Tỷ Lệ Chí Mạng ở 25%; bù lại nhận +300% Sát Thương Chí Mạng.",
    "system": "utility",
    "icon": "core:core_095",
    "category": "offense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_096",
    "name": "Hợp Đồng Huyết Năng",
    "description": "+67 Điểm Hồi Kỹ Năng. Mỗi lần dùng kỹ năng mất 5% Máu hiện tại, không thể tự hạ gục.",
    "system": "utility",
    "icon": "core:core_096",
    "category": "offense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_097",
    "name": "Tập trung chuyên môn",
    "description": "Không thể chủ động sử dụng Ultimate. Ba Kỹ Năng cơ bản nhận +30% Sát Thương Kỹ Năng, -25% Hồi Chiêu Cơ Bản và -20% Chi Phí Tài Nguyên. Nội tại/đầu tư Ultimate vẫn hoạt động.",
    "system": "utility",
    "icon": "core:core_097",
    "category": "offense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_098",
    "name": "Bộ Lọc Nhiễu",
    "description": "+20 Giáp, giảm 30% thời gian hiệu ứng bất lợi. Khi một debuff kết thúc, +25% mọi sát thương gây ra trong 4 giây; Hiệu ứng chỉ làm mới thời gian chứ không cộng dồn.",
    "system": "defense",
    "icon": "core:core_098",
    "category": "defense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_099",
    "name": "Kíp Phòng Thủ",
    "description": "Khi tài nguyên còn dưới 15%, nhận lá chắn bằng 12% máu tối đa trong 4 giây, hồi nội tại 15s. Hiệu ứng chỉ làm mới thời gian chứ không cộng dồn.",
    "system": "defense",
    "icon": "core:core_099",
    "category": "defense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_100",
    "name": "Cân Bằng Chiến Trường",
    "description": "Trên 70% Máu: +45 Hỏa Lực; dưới 30%: +45 Giáp; còn lại +22 Hỏa Lực và +22 Giáp.",
    "system": "utility",
    "icon": "core:core_100",
    "category": "offense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_101",
    "name": "Hỏa Lực Cự Ly Gần",
    "description": "Basic Damage tăng 20% ở cự ly gần — dưới 1/3 chiều cao vùng chiến đấu.",
    "system": "attack",
    "icon": "core:core_101",
    "category": "weapon",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_102",
    "name": "Nén Xung Kỹ Năng",
    "description": "Nếu 4 giây chưa sử dụng Skill nào kể từ khi hiệu lực của Skill cuối cùng kết thúc, Skill gây damage kế tiếp nhận +20% Skill Damage. Bonus áp dụng cho toàn bộ cast gây damage đó.",
    "system": "attack",
    "icon": "core:core_102",
    "category": "weapon",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_103",
    "name": "Bản Năng Sinh Tồn",
    "description": "Dưới 30% Máu: giảm 25% sát thương nhận vào.",
    "system": "defense",
    "icon": "core:core_103",
    "category": "defense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_104",
    "name": "Hồi Máu Tràn trề",
    "description": "Khi đầy máu, lượng hồi máu dư ra sẽ chuyển thành lá chắn, tối đa 20% Máu Tối Đa. Hồi Máu tự nhiên khi đang đầy Máu vẫn có thể nuôi lớp Khiên này.",
    "system": "defense",
    "icon": "core:core_104",
    "category": "defense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_105",
    "name": "Bão Sét Bạo Kích",
    "description": "+25% Tỷ Lệ Chí Mạng. Đòn chí mạng phóng sét sang tối đa 5 mục tiêu khác, mỗi mục tiêu nhận 270% Hỏa Lực. Một mục tiêu chỉ nhận sét mỗi 0,5 giây.",
    "system": "attack",
    "icon": "core:core_105",
    "category": "offense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_106",
    "name": "Tên lửa Tomahawk",
    "description": "Mỗi 2 giây phóng tối đa 3 Tomahawk vào 3 mục tiêu, mỗi quả gây sát thương 360% Hỏa Lực.",
    "system": "attack",
    "icon": "core:core_106",
    "category": "offense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_107",
    "name": "Lướt Sát Tử Thần",
    "description": "Đạn địch lướt qua trong 8px quanh hitbox mà không trúng tính là 1 Graze. Mỗi 5 Graze hồi 15% Max Resource.",
    "system": "resource",
    "icon": "core:core_107",
    "category": "defense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_108",
    "name": "Thu Gom Mảnh Vỡ",
    "description": "Kẻ địch bị hạ có 18% cơ hội rơi Scrap. Thu Scrap hồi 5% Máu Tối Đa. Scrap biến mất sau 4 giây.",
    "system": "defense",
    "icon": "core:core_108",
    "category": "defense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_109",
    "name": "Giáp Cánh",
    "description": "Mỗi cánh có hồi nội tại riêng 8 giây. Đòn đầu tiên trúng một cánh bị giảm 50% sát thương tại cánh đó.",
    "system": "defense",
    "icon": "core:core_109",
    "category": "defense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_110",
    "name": "Giáp Chống Nổ",
    "description": "Giảm 45% sát thương nhận từ Bom, vụ nổ và vùng nổ diện rộng.",
    "system": "defense",
    "icon": "core:core_110",
    "category": "defense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_111",
    "name": "Đạn Vượt Âm",
    "description": "+200% tốc độ projectile Basic và +15% Basic Damage.",
    "system": "attack",
    "icon": "core:core_111",
    "category": "offense",
    "tiers": [
      "silver"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_112",
    "name": "Lưới Giao Hỏa",
    "description": "Bắn trúng 2 mục tiêu khác nhau trong 0,75 giây tạo Lưới Giao Hỏa trong 2 giây. Kẻ địch khác chạm lưới nhận 240% Hỏa Lực; tối đa 2 kẻ địch khác có thể nhận sát thương từ mỗi lưới.",
    "system": "attack",
    "icon": "core:core_112",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_113",
    "name": "Vay Nợ Tương Lai",
    "description": "Mỗi 18 giây, có thể dùng ngay một kỹ năng đang hồi chiêu với 100% hiệu lực; sau đó kỹ năng đó nhận thêm 50% Hồi Chiêu Cơ Bản theo cấp kỹ năng như khoản nợ, không giảm bởi Điểm Hồi Kỹ Năng.",
    "system": "utility",
    "icon": "core:core_113",
    "category": "defense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_114",
    "name": "Nhịp Bắn Gia Tốc",
    "description": "Mỗi 5 Basic chính liên tiếp trúng cùng 1 kẻ địch cho 1 tầng Nhịp Bắn trong 3 giây, tối đa 4 tầng, mỗi tầng +25% Tốc Độ Bắn Cộng Thêm. Basic chính trúng địch làm mới 3 giây; quá 3 giây không trúng hoặc chuyển sang kẻ địch mới sẽ mất toàn bộ stack",
    "system": "attack",
    "icon": "core:core_114",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_115",
    "name": "Cô Lập Mục Tiêu",
    "description": "Nếu không có kẻ địch khác trong 80px quanh mục tiêu, gây thêm 30% mọi sát thương. Với Boss, mức tăng là 20%.",
    "system": "attack",
    "icon": "core:core_115",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_116",
    "name": "Hỏa Lực Hội Tụ",
    "description": "Mỗi 5 Basic chính liên tiếp trúng cùng 1 kẻ địch cho 1 tầng Hội Tụ trong 3 giây, tối đa 4 tầng, mỗi tầng +4% Basic Damage và +4% Skill Damage.  Basic chính trúng địch làm mới 3 giây; quá 3 giây không trúng hoặc chuyển sang kẻ địch mới sẽ mất toàn bộ stack",
    "system": "attack",
    "icon": "core:core_116",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_117",
    "name": "Phát Đạn Khai Màn",
    "description": "Đòn bắn thường đầu tiên lên mỗi kẻ địch sẽ chắc chắn chí mạng và gây sát thương chuẩn (bỏ qua 100% giáp của kẻ địch)",
    "system": "attack",
    "icon": "core:core_117",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_118",
    "name": "Càng Đông Càng Vui",
    "description": "+2% mọi sát thương cho mỗi kẻ địch vượt quân số phe người chơi, tối đa +24%.",
    "system": "attack",
    "icon": "core:core_118",
    "category": "offense",
    "tiers": [
      "gold"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_119",
    "name": "Kéo Dãn Thời Gian",
    "description": "+15% sát thương kỹ năng. Sau khi dùng kỹ năng, giảm trực tiếp 7 giây Hồi Chiêu còn lại cho 1 kỹ năng cơ bản khác đang có thời gian hồi chiêu dài nhất (ngoại trừ Ultimate) và +35% Hồi Tài Nguyên trong 4 giây. Dùng kỹ năng mới làm mới thời gian.",
    "system": "defense",
    "icon": "core:core_119",
    "category": "defense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_120",
    "name": "Đoạt Quyền Điều Khiển",
    "description": "Chiếm quyền tối đa 5 địch thường 12 giây hoặc 1 Tinh Anh 9 giây. Boss bị choáng 2 giây. Hồi nội tại 13 giây sau khi hiệu ứng kết thúc.",
    "system": "utility",
    "icon": "core:core_120",
    "category": "defense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_121",
    "name": "Kho Phản Vật Chất",
    "description": "Tích 60% sát thương dư khi hạ địch thường và 3% sát thương thực tế lên Tinh Anh/Boss, tối đa 500% Hỏa Lực. Dùng kỹ năng xả toàn bộ kho thành xung chấn toàn màn hình.",
    "system": "attack",
    "icon": "core:core_121",
    "category": "offense",
    "tiers": [
      "diamond"
    ],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
{
  "id": "core_122",
  "name": "Thu Hồi Nhiệt Dư",
  "description": SKILL_CORE_DESCRIPTIONS[122],
  "system": "skill",
  "icon": "skill:decoy",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "black_eagle"
  ],
  "skillId": "decoy",
  "skillSlot": 1
},
{
  "id": "core_123",
  "name": "Mồi Phản Chấn",
  "description": SKILL_CORE_DESCRIPTIONS[123],
  "system": "skill",
  "icon": "skill:decoy",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "black_eagle"
  ],
  "skillId": "decoy",
  "skillSlot": 1
},
{
  "id": "core_124",
  "name": "Màn Che Nhiệt",
  "description": SKILL_CORE_DESCRIPTIONS[124],
  "system": "skill",
  "icon": "skill:decoy",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "black_eagle"
  ],
  "skillId": "decoy",
  "skillSlot": 1
},
{
  "id": "core_125",
  "name": "Hăng Hái Chiến Đấu",
  "description": SKILL_CORE_DESCRIPTIONS[125],
  "system": "skill",
  "icon": "skill:afterburner",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "black_eagle"
  ],
  "skillId": "afterburner",
  "skillSlot": 2
},
{
  "id": "core_126",
  "name": "Hạ Nhiệt Chủ Động",
  "description": SKILL_CORE_DESCRIPTIONS[126],
  "system": "skill",
  "icon": "skill:afterburner",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "black_eagle"
  ],
  "skillId": "afterburner",
  "skillSlot": 2
},
{
  "id": "core_127",
  "name": "Đạn Nảy Tăng Áp",
  "description": SKILL_CORE_DESCRIPTIONS[127],
  "system": "skill",
  "icon": "skill:afterburner",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "black_eagle"
  ],
  "skillId": "afterburner",
  "skillSlot": 2
},
{
  "id": "core_128",
  "name": "Đáp Ứng Nhanh",
  "description": SKILL_CORE_DESCRIPTIONS[128],
  "system": "skill",
  "icon": "skill:missile_swarm",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "black_eagle"
  ],
  "skillId": "missile_swarm",
  "skillSlot": 3
},
{
  "id": "core_129",
  "name": "Hệ Thống Đánh Chặn",
  "description": SKILL_CORE_DESCRIPTIONS[129],
  "system": "skill",
  "icon": "skill:missile_swarm",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "black_eagle"
  ],
  "skillId": "missile_swarm",
  "skillSlot": 3
},
{
  "id": "core_130",
  "name": "Dữ Liệu Chiến Thuật",
  "description": SKILL_CORE_DESCRIPTIONS[130],
  "system": "skill",
  "icon": "skill:missile_swarm",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "black_eagle"
  ],
  "skillId": "missile_swarm",
  "skillSlot": 3
},
{
  "id": "core_131",
  "name": "Xung Điện EMP",
  "description": SKILL_CORE_DESCRIPTIONS[131],
  "system": "skill",
  "icon": "skill:armor_shield",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "breaker"
  ],
  "skillId": "armor_shield",
  "skillSlot": 1
},
{
  "id": "core_132",
  "name": "Thu Hồi Năng Lượng",
  "description": SKILL_CORE_DESCRIPTIONS[132],
  "system": "skill",
  "icon": "skill:armor_shield",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "breaker"
  ],
  "skillId": "armor_shield",
  "skillSlot": 1
},
{
  "id": "core_133",
  "name": "Phước Lành Hộ Vệ",
  "description": SKILL_CORE_DESCRIPTIONS[133],
  "system": "skill",
  "icon": "skill:armor_shield",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "breaker"
  ],
  "skillId": "armor_shield",
  "skillSlot": 1
},
{
  "id": "core_134",
  "name": "Dư Chấn",
  "description": SKILL_CORE_DESCRIPTIONS[134],
  "system": "skill",
  "icon": "skill:heavy_bomb",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "breaker"
  ],
  "skillId": "heavy_bomb",
  "skillSlot": 2
},
{
  "id": "core_135",
  "name": "Dấu Ấn Trọng Pháo",
  "description": SKILL_CORE_DESCRIPTIONS[135],
  "system": "skill",
  "icon": "skill:heavy_bomb",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "breaker"
  ],
  "skillId": "heavy_bomb",
  "skillSlot": 2
},
{
  "id": "core_136",
  "name": "Hố Đen",
  "description": SKILL_CORE_DESCRIPTIONS[136],
  "system": "skill",
  "icon": "skill:heavy_bomb",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "breaker"
  ],
  "skillId": "heavy_bomb",
  "skillSlot": 2
},
{
  "id": "core_137",
  "name": "Chuyển Đổi Thần Tốc",
  "description": SKILL_CORE_DESCRIPTIONS[137],
  "system": "skill",
  "icon": "skill:sweeping_cannon",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "breaker"
  ],
  "skillId": "sweeping_cannon",
  "skillSlot": 3
},
{
  "id": "core_138",
  "name": "Mưa Đỏ",
  "description": SKILL_CORE_DESCRIPTIONS[138],
  "system": "skill",
  "icon": "skill:sweeping_cannon",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "breaker"
  ],
  "skillId": "sweeping_cannon",
  "skillSlot": 3
},
{
  "id": "core_139",
  "name": "Bộ Ổn Định Pháo",
  "description": SKILL_CORE_DESCRIPTIONS[139],
  "system": "skill",
  "icon": "skill:sweeping_cannon",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "breaker"
  ],
  "skillId": "sweeping_cannon",
  "skillSlot": 3
},
{
  "id": "core_140",
  "name": "Dư Ảnh Phản Kích",
  "description": SKILL_CORE_DESCRIPTIONS[140],
  "system": "skill",
  "icon": "skill:invisibility",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "phantom"
  ],
  "skillId": "invisibility",
  "skillSlot": 1
},
{
  "id": "core_141",
  "name": "Ảnh Lưu",
  "description": SKILL_CORE_DESCRIPTIONS[141],
  "system": "skill",
  "icon": "skill:invisibility",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "phantom"
  ],
  "skillId": "invisibility",
  "skillSlot": 1
},
{
  "id": "core_142",
  "name": "Đòn Xuất Hiện",
  "description": SKILL_CORE_DESCRIPTIONS[142],
  "system": "skill",
  "icon": "skill:invisibility",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "phantom"
  ],
  "skillId": "invisibility",
  "skillSlot": 1
},
{
  "id": "core_143",
  "name": "Lưỡi Hái Tử Thần",
  "description": SKILL_CORE_DESCRIPTIONS[143],
  "system": "skill",
  "icon": "skill:focus_laser",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "phantom"
  ],
  "skillId": "focus_laser",
  "skillSlot": 2
},
{
  "id": "core_144",
  "name": "Phá Giáp",
  "description": SKILL_CORE_DESCRIPTIONS[144],
  "system": "skill",
  "icon": "skill:focus_laser",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "phantom"
  ],
  "skillId": "focus_laser",
  "skillSlot": 2
},
{
  "id": "core_145",
  "name": "Tia Sáng Chói Lòa",
  "description": SKILL_CORE_DESCRIPTIONS[145],
  "system": "skill",
  "icon": "skill:focus_laser",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "phantom"
  ],
  "skillId": "focus_laser",
  "skillSlot": 2
},
{
  "id": "core_146",
  "name": "Đồng Bộ Mục Tiêu",
  "description": SKILL_CORE_DESCRIPTIONS[146],
  "system": "skill",
  "icon": "skill:escort_drone",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "phantom"
  ],
  "skillId": "escort_drone",
  "skillSlot": 3
},
{
  "id": "core_147",
  "name": "Hộ Vệ Điện Tử",
  "description": SKILL_CORE_DESCRIPTIONS[147],
  "system": "skill",
  "icon": "skill:escort_drone",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "phantom"
  ],
  "skillId": "escort_drone",
  "skillSlot": 3
},
{
  "id": "core_148",
  "name": "Thu Hồi Thông Minh",
  "description": SKILL_CORE_DESCRIPTIONS[148],
  "system": "skill",
  "icon": "skill:escort_drone",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "phantom"
  ],
  "skillId": "escort_drone",
  "skillSlot": 3
}
,
{
  "id": "core_149",
  "name": "Thợ Săn Tiền Thưởng",
  "description": "Mỗi 20 giây, Đánh dấu mục tiêu ưu tiên trong 5 giây; mục tiêu nhận thêm 20% mọi sát thương. Hạ mục tiêu bị đánh dấu nhận ngẫu nhiên 1 trong 8 phần thưởng vĩnh viễn, mỗi loại 12,5%: +15 Hỏa Lực; +15 Giáp; +80 Máu Tối Đa; +4 Điểm Hồi Kỹ Năng; +0,6 Hồi Máu/s; +4% Tỷ Lệ Chí Mạng; +10% Sát Thương Chí Mạng; +15% Tốc Độ Bắn Cộng Thêm.",
  "system": "utility",
  "icon": "core:core_149",
  "category": "offense",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 · Không xuất hiện tại Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_150",
  "name": "Vành Đai Mở Rộng",
  "description": "Phản Quỹ Đạo tăng bán kính từ 72px lên 92px và tăng giới hạn bắt giữ từ 16 lên 22 projectile.",
  "system": "skill",
  "icon": "skill:orbit_reversal",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "orbit_reversal",
  "skillSlot": 1
},
{
  "id": "core_151",
  "name": "Phản Xạ Cường Hóa",
  "description": "Tinh Đạn của Phản Quỹ Đạo gây 70% Hỏa Lực thay vì 30% Hỏa Lực.",
  "system": "skill",
  "icon": "skill:orbit_reversal",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "orbit_reversal",
  "skillSlot": 1
},
{
  "id": "core_152",
  "name": "Thu Hồi Thiên Năng",
  "description": "Mỗi projectile bắt giữ thành công hồi 2,5% Mana Tối Đa, tối đa 30% Mana Tối Đa mỗi lần dùng Phản Quỹ Đạo.",
  "system": "skill",
  "icon": "skill:orbit_reversal",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "orbit_reversal",
  "skillSlot": 1
},
{
  "id": "core_153",
  "name": "Vành Đai Bảo Hộ",
  "description": "Khi Phản Quỹ Đạo đang tồn tại, Astra giảm 60% sát thương nhận vào. Hiệu ứng duy trì cả trong giai đoạn Tinh Đạn hội tụ và bắn trả, kết thúc khi chuỗi giải phóng Tinh Đạn hoàn tất.",
  "system": "skill",
  "icon": "skill:orbit_reversal",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "orbit_reversal",
  "skillSlot": 1
},
{
  "id": "core_154",
  "name": "Tái Khởi Động Quỹ Đạo",
  "description": "Hồi Chiêu Phản Quỹ Đạo giảm từ 22 giây xuống 13 giây trước khi áp Điểm Hồi Kỹ Năng và các modifier Hồi Chiêu khác.",
  "system": "skill",
  "icon": "skill:orbit_reversal",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "orbit_reversal",
  "skillSlot": 1
},
{
  "id": "core_155",
  "name": "Hố Trắng",
  "description": "Nếu Phản Quỹ Đạo giải phóng ít nhất 1 Tinh Đạn, các phát bắn thường của Astra gây thêm 60% sát thương đạn thường trong 5 giây sau khi kỹ năng kết thúc.",
  "system": "skill",
  "icon": "skill:orbit_reversal",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "orbit_reversal",
  "skillSlot": 1
},
{
  "id": "core_156",
  "name": "Tụ Quang Siêu Tốc",
  "description": "Thời gian tụ lực của Thương Tinh Tú giảm từ 0,6 giây xuống 0,2 giây.",
  "system": "skill",
  "icon": "skill:stellar_lance",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "stellar_lance",
  "skillSlot": 2
},
{
  "id": "core_157",
  "name": "Lõi Siêu Mật",
  "description": "Thương Tinh Tú gây 1.050% Hỏa Lực lên mục tiêu đầu tiên và 930% Hỏa Lực lên mỗi mục tiêu tiếp theo trước bonus chuỗi liên tiếp.",
  "system": "skill",
  "icon": "skill:stellar_lance",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "stellar_lance",
  "skillSlot": 2
},
{
  "id": "core_158",
  "name": "Mũi Giáo Xuyên Giáp",
  "description": "Thương Tinh Tú bỏ qua 30% Giáp của mục tiêu.",
  "system": "skill",
  "icon": "skill:stellar_lance",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "stellar_lance",
  "skillSlot": 2
},
{
  "id": "core_159",
  "name": "Tinh Tú Tử Thần",
  "description": "Phát bắn của Thương Tinh Tú gây thêm 40% sát thương Thương Tinh Tú cho các mục tiêu dưới 30% Máu.",
  "system": "skill",
  "icon": "skill:stellar_lance",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "stellar_lance",
  "skillSlot": 2
},
{
  "id": "core_160",
  "name": "Ngọn Giáo Sao Băng",
  "description": "Sau khi viên đạn của Thương Tinh Tú bay hết màn hình, chờ 0,75 giây rồi tạo một đường track cảnh báo trên chính đường bay cũ trong 0,6 giây. Sau đó một tia laser bắn từ dưới màn hình lên theo đường track, xuyên tất cả mục tiêu và gây 320% Hỏa Lực. Laser rộng 200% hitbox viên đạn gốc, tồn tại 1 giây; mỗi mục tiêu chỉ nhận sát thương ở lần đầu tia chạm phải và tuân theo chí mạng kỹ năng hiện có.",
  "system": "skill",
  "icon": "skill:stellar_lance",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "stellar_lance",
  "skillSlot": 2
},
{
  "id": "core_161",
  "name": "Chu Kỳ Thiên Thương",
  "description": "Mana cơ bản của Thương Tinh Tú giảm từ 60 xuống 45 và lượng Mana tăng thêm mỗi stack giảm từ 60 xuống 45.",
  "system": "skill",
  "icon": "skill:stellar_lance",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "stellar_lance",
  "skillSlot": 2
},
{
  "id": "core_162",
  "name": "Sao Neutron",
  "description": "Mỗi thiên thạch của Sao Rơi gây 265% Hỏa Lực thay vì 210% Hỏa Lực.",
  "system": "skill",
  "icon": "skill:starfall",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "starfall",
  "skillSlot": 3
},
{
  "id": "core_163",
  "name": "Hủy Diệt Hàng Loạt",
  "description": "Bán kính nổ của mỗi thiên thạch Sao Rơi tăng từ 35px lên 55px.",
  "system": "skill",
  "icon": "skill:starfall",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "starfall",
  "skillSlot": 3
},
{
  "id": "core_164",
  "name": "Thu Hồi Tàn Tích",
  "description": "Mỗi kẻ địch bị Sao Rơi tiêu diệt hồi 5% Mana Tối Đa cho Astra, tối đa 35% Mana Tối Đa mỗi lần dùng.",
  "system": "skill",
  "icon": "skill:starfall",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "starfall",
  "skillSlot": 3
},
{
  "id": "core_165",
  "name": "Chu Kỳ Tận Diệt",
  "description": "Hồi Chiêu Sao Rơi giảm từ 34 giây xuống 23 giây trước khi áp Điểm Hồi Kỹ Năng và các modifier Hồi Chiêu khác. Hồi Chiêu vẫn chỉ bắt đầu sau khi thiên thạch cuối cùng hoàn tất.",
  "system": "skill",
  "icon": "skill:starfall",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "starfall",
  "skillSlot": 3
},
{
  "id": "core_166",
  "name": "Vết Nứt Thiên Sao",
  "description": "Kẻ địch trúng Sao Rơi bị giảm 30% Giáp trong 6 giây. Hiệu ứng không cộng dồn; trúng lại làm mới thời gian.",
  "system": "skill",
  "icon": "skill:starfall",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "starfall",
  "skillSlot": 3
},
{
  "id": "core_167",
  "name": "Sao Cháy",
  "description": "Mỗi thiên thạch Sao Rơi để lại vùng cháy trong 4 giây với bán kính bằng vụ nổ, gây 60% Hỏa Lực mỗi 0,5 giây. Nếu nhiều vùng cháy chồng nhau, mỗi kẻ địch chỉ nhận sát thương từ vùng cháy mới nhất đang tác động lên nó.",
  "system": "skill",
  "icon": "skill:starfall",
  "category": "skill",
  "tiers": [
    "diamond"
  ],
  "aircraftIds": [
    "astra"
  ],
  "skillId": "starfall",
  "skillSlot": 3
}
,
{
  "id": "core_168",
  "name": "Chuyển Nhịp",
  "description": "Mỗi 10 quái thường bị tiêu diệt hoặc mỗi 40 đòn Basic chính trúng Tinh Anh/Boss, Skill tiếp theo trong 5 giây được giảm 15% Resource Cost. Làm mới thời gian hiệu ứng chứ không cộng dồn.",
  "system": "resource",
  "icon": "core:core_168",
  "category": "offense",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_169",
  "name": "Bộ Điều Áp",
  "description": "Resource >70%: +40 Hỏa Lực; Resource <30%: +2,5 Hồi Máu/s; còn lại +32,5% Tốc Độ Bắn Cộng Thêm.",
  "system": "utility",
  "icon": "core:core_169",
  "category": "weapon",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_170",
  "name": "Báo Động Sớm",
  "description": "Khi phát hiện cảnh báo nguy hiểm: +50 Giáp trong 3 giây. Hồi nội tại 10 giây.",
  "system": "defense",
  "icon": "core:core_170",
  "category": "defense",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_171",
  "name": "Chốt An Toàn",
  "description": "Trong 2 giây sau khi dùng Skill, đòn gây sát thương đầu tiên trúng người chơi bị giảm 40% sát thương.  Làm mới thời gian hiệu ứng chứ không cộng dồn.",
  "system": "defense",
  "icon": "core:core_171",
  "category": "defense",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_172",
  "name": "Tụ Điện Trống",
  "description": "Giữ Resource ở 100% liên tục 2 giây tích 1 Tụ Điện; Skill kế tiếp tiêu Tụ Điện, hoàn lại 25% Resource Cost và nhận +15% Skill Damage cho cast đó.",
  "system": "resource",
  "icon": "core:core_172",
  "category": "resource",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_173",
  "name": "Dây Chằng Khẩn",
  "description": "Khi hiệu lực của một lá chắn kết thúc hoặc bị phá vỡ, hồi máu bằng 35% giá trị của lá chắn đó.",
  "system": "defense",
  "icon": "core:core_173",
  "category": "defense",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_174",
  "name": "Đệm Xung",
  "description": "Khi mất trên 8% Máu Tối Đa trong 2 giây gần nhất, hồi 12% Max Resource và nhận +20% Resource Regen trong 4 giây. Hồi chiêu 15 giây.",
  "system": "resource",
  "icon": "core:core_174",
  "category": "resource",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_175",
  "name": "Tần Số Xen Kẽ",
  "description": "Sau khi dùng 1 skill, dùng thêm ít nhất một Skill khác trong cửa sổ 5 giây cho +20% mọi sát thương trong 5 giây. Hồi chiêu 20 giây.",
  "system": "attack",
  "icon": "core:core_175",
  "category": "offense",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_176",
  "name": "Khoảng Thở",
  "description": "Khi không có hỏa lực địch hoặc kẻ địch trong bán kính 150px, hồi 1% Máu Tối Đa/s và +25% Resource Regen. Dừng ngay khi có nguy hiểm vào vùng.",
  "system": "defense",
  "icon": "core:core_176",
  "category": "defense",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_177",
  "name": "Vỏ Bọc Chống Điện",
  "description": "Giảm 45% sát thương nhận từ projectile tự dẫn, Beam và EMP.",
  "system": "defense",
  "icon": "core:core_177",
  "category": "defense",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_178",
  "name": "Phanh Từ",
  "description": "Định kỳ mỗi 20 giây, phát một xung điện ra khung quanh chiến cơ bán kính 150px, xung điện này có khả năng giảm 50% tốc độ bay của tất cả đạn đạo và tên lửa tự dẫn của kẻ địch trong 3 giây.",
  "system": "utility",
  "icon": "core:core_178",
  "category": "weapon",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_179",
  "name": "Bộ Hiệu Chỉnh Sai Số",
  "description": "Nếu 1 đòn bắn thường không chí mạng, nhận +2% tỷ lệ chí mạng cho đến khi  có 1 đòn bắn thường chí mạng.<br><br>Ghi chú: reset về ban đầu khi gây được đòn chí mạng",
  "system": "attack",
  "icon": "core:core_179",
  "category": "offense",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_180",
  "name": "Phá Khiên",
  "description": "Basic gây thêm 30% sát thương lên Shield địch. Khi phá Shield của mục tiêu, +20% mọi sát thương lên mục tiêu đó trong 4 giây.",
  "system": "attack",
  "icon": "core:core_180",
  "category": "offense",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_181",
  "name": "Van Xả Kỹ Năng",
  "description": "Khi hiệu ứng Skill chính kết thúc, +45% Resource Regen trong 4 giây.  Làm mới thời gian hiệu ứng chứ không cộng dồn.",
  "system": "resource",
  "icon": "core:core_181",
  "category": "resource",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_182",
  "name": "Bình Năng Lượng Mở Rộng",
  "description": "+15% Max Resource. Khi Resource >70%, +10% Skill Damage. Điện của Phantom vẫn có thể vượt mức tối đa 100 như bình thường.",
  "system": "resource",
  "icon": "core:core_182",
  "category": "resource",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_183",
  "name": "Giáp Độ Sâu",
  "description": "+20 Giáp. Nhận thêm +20 Giáp cho mỗi loại debuff đang hoạt động trên người chơi, tổng bonus từ lõi tối đa +60 Giáp.",
  "system": "defense",
  "icon": "core:core_183",
  "category": "defense",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_184",
  "name": "Bảo Hộ Linh Hồn",
  "description": "Sau 15 giây, đòn tấn công/khống chế kế tiếp bị vô hiệu hoàn toàn và kích hoạt 3 giây miễn toàn bộ sát thương/khống chế. Hồi chiêu bắt đầu sau hiệu ứng.",
  "system": "defense",
  "icon": "core:core_184",
  "category": "defense",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_185",
  "name": "Đánh Dấu Sơ Bộ",
  "description": "Basic chính đầu tiên trúng mục tiêu đánh dấu 4 giây; Skill damage kế tiếp lên mục tiêu +30% và tiêu dấu. Hồi chiêu mỗi mục tiêu 10 giây.",
  "system": "attack",
  "icon": "core:core_185",
  "category": "offense",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_186",
  "name": "Hợp Lưu Hỏa Lực",
  "description": "Dùng 2 Skill khác nhau trong 4 giây cho +45% Basic Damage trong 8 giây. Hồi chiêu 16 giây.",
  "system": "attack",
  "icon": "core:core_186",
  "category": "offense",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_187",
  "name": "Tụ Năng Phản Chấn",
  "description": "Lưu 40% sát thương thực tế đã nhận, tối đa 300% Hỏa Lực; Skill gây damage kế tiếp giải phóng lượng đã lưu.",
  "system": "attack",
  "icon": "core:core_187",
  "category": "offense",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_188",
  "name": "Nhắm Vào Yếu Điểm",
  "description": "+15% Tỷ Lệ Chí Mạng, +50% Sát Thương Chí Mạng.",
  "system": "attack",
  "icon": "core:core_188",
  "category": "offense",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_189",
  "name": "Đạn Truy Kích",
  "description": "Khi đạn thường hạ mục tiêu, phóng một mảnh đạn tự tìm tới địch gần nhất gây 150% Hỏa Lực.",
  "system": "attack",
  "icon": "core:core_189",
  "category": "offense",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_190",
  "name": "Nén Năng Lượng",
  "description": "+30% Skill Damage, +10% Resource Cost.",
  "system": "attack",
  "icon": "core:core_190",
  "category": "offense",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_191",
  "name": "Hỏa Lực Luân Phiên",
  "description": "Đạn thường hạ địch cường hóa kỹ năng kế tiếp +25% trong 5s; kỹ năng hạ địch cường hóa đạn thường +25% trong 4s.",
  "system": "attack",
  "icon": "core:core_191",
  "category": "offense",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_192",
  "name": "Áo Giáp Xoay Pha",
  "description": "Khi đang có Shield: +20% mọi sát thương. Khi không có Shield: +25 Giáp.",
  "system": "utility",
  "icon": "core:core_192",
  "category": "weapon",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_193",
  "name": "Nhịp Ba Kỹ Năng",
  "description": "Dùng bất kỳ 3 kỹ năng khác nhau trong bộ 4 kỹ năng trong 8s: giảm trực tiếp 3s Hồi Chiêu còn lại của cả 4 kỹ năng và +30% Hồi Tài Nguyên trong 5s.",
  "system": "resource",
  "icon": "core:core_193",
  "category": "resource",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_194",
  "name": "Phá Khóa Chí Mạng",
  "description": "+15% Tỷ Lệ Chí Mạng. Chí mạng lên bất kỳ mục tiêu nào làm +70% Sát Thương Chí Mạng lên chính mục tiêu đó trong 4 giây;",
  "system": "attack",
  "icon": "core:core_194",
  "category": "offense",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_195",
  "name": "Hộp Đen Cứu Sinh",
  "description": "Nếu mất ít nhất 12% Máu Tối Đa trong 2 giây, hồi dần 12% Máu Tối Đa trong 4 giây. Hồi chiêu 18 giây sau khi hiệu ứng kết thúc.",
  "system": "defense",
  "icon": "core:core_195",
  "category": "defense",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_196",
  "name": "Dấu Son Bạo Kích",
  "description": "+10% Tỷ Lệ Chí Mạng. Mỗi 5 đòn chí mạng trực tiếp cho +5% Sát Thương Chí Mạng vĩnh viễn trong run, tối đa +75%. Đòn chí mạng trực tiếp lên Tinh Anh/Boss tính 2 tiến độ; cùng một mục tiêu chỉ có thể đóng góp tiến độ tối đa 1 lần mỗi 0,5 giây.",
  "system": "attack",
  "icon": "core:core_196",
  "category": "offense",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_197",
  "name": "Chịu Đau",
  "description": "35% sát thương đáng lẽ trừ Máu trở thành Sát Thương Trì Hoãn và được trả dần trong 4 giây. Dùng Skill xóa 20% lượng Sát Thương Trì Hoãn còn lại, tối đa 1 lần mỗi 5 giây. Mỗi 15 quái thường hoặc 1 Tinh Anh/Boss bị hạ sẽ xóa toàn bộ Sát Thương Trì Hoãn còn lại và hồi 3% Máu Tối Đa.",
  "system": "utility",
  "icon": "core:core_197",
  "category": "weapon",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_198",
  "name": "Vệ Tinh Hộ Mệnh",
  "description": "Dùng Skill tạo tối đa 3 Vệ Tinh Hộ Mệnh trong 5 giây. Mỗi vệ tinh chặn 1 projectile địch có thể chặn; khi chặn projectile hoặc hết hạn mà chưa được dùng, vệ tinh bắn địch gần nhất gây 120% Hỏa Lực. Nếu cast Skill khi vệ tinh đang hoạt động, làm mới thời gian 5 giây và bổ sung 1 vệ tinh đã mất, tối đa 3.",
  "system": "utility",
  "icon": "core:core_198",
  "category": "weapon",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_199",
  "name": "Mạch Quá Tải",
  "description": "Mỗi Skill +1 Overclock. Skill kế tiếp +18% Skill Damage mỗi stack, tối đa 3; ở 3 stack Skill nhận +54% và phát xung toàn màn hình 250% Hỏa Lực rồi reset.",
  "system": "attack",
  "icon": "core:core_199",
  "category": "offense",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_200",
  "name": "Tái Chế Lá Chắn",
  "description": "+50% sức mạnh Shield. Nếu cast Skill khi không có Shield tạm thời, tạo Shield bằng 8% Max HP trong 4 giây, hồi nội tại 6 giây. Khi Shield bị phá/hết hạn, nổ bán kính 120px gây 160% tổng lượng damage lớp Shield đó đã hấp thụ.",
  "system": "utility",
  "icon": "core:core_200",
  "category": "weapon",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_201",
  "name": "Cộng Hưởng Kho Vũ Khí",
  "description": "Mỗi Hệ Lõi hiện diện cho gói: Tấn Công +15% Basic Damage; Tài Nguyên +15% Skill Damage; Phòng Thủ -10% sát thương nhận; Đa Dụng +8% Basic Damage, +8% Skill Damage, +8% Resource Regen. Lõi này tính là Đa Dụng.",
  "system": "utility",
  "icon": "core:core_201",
  "category": "weapon",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_202",
  "name": "Học Thuyết Một Mũi Nhọn",
  "description": "Chọn 1 trong 4 kỹ năng, kể cả Ultimate hoặc Cấp 0: +30% Skill Damage, -20% chi phí và -20% hồi chiêu cơ bản. Không đổi cấp kỹ năng.",
  "system": "attack",
  "icon": "core:core_202",
  "category": "offense",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_203",
  "name": "Nhiễu Chủ Động",
  "description": "+10% mọi sát thương nền. Debuff trên người chơi kéo dài +20%; vẫn có thể bắn/cast khi hard CC (chỉ khóa di chuyển). Khi có ít nhất 1 debuff: giảm 25% sát thương nhận và +35% mọi sát thương.",
  "system": "utility",
  "icon": "core:core_203",
  "category": "weapon",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_204",
  "name": "Phản Lực Giáp",
  "description": "Mỗi khi Armor/Shield tích lũy ngăn được lượng damage tương đương 25% Max HP, phóng shockwave gây 250% Hỏa Lực và hồi 5% Max Resource. Phần tiến độ vượt ngưỡng được giữ lại; tối đa 1 lần kích hoạt cho mỗi lần nhận damage.",
  "system": "defense",
  "icon": "core:core_204",
  "category": "defense",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Chỉ tính lượng damage thực sự được Armor, Shield tạm thời hoặc Khiên Năng Lượng của Titan ngăn lại; các nguồn giảm damage chung khác không tính."
},
{
  "id": "core_205",
  "name": "Dao 2 lưỡi",
  "description": "+40% mọi sát thương gây ra, nhưng +20% sát thương nhận vào.",
  "system": "attack",
  "icon": "core:core_205",
  "category": "offense",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_206",
  "name": "Đạn Siêu Nặng",
  "description": "Basic chính +70% Basic Damage và xuyên thêm 1 mục tiêu, nhưng -10% Tổng Tốc Độ Bắn và tốc độ đạn -20%.",
  "system": "attack",
  "icon": "core:core_206",
  "category": "offense",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_207",
  "name": "Pha Đối Nghịch",
  "description": "+25% Chí Mạng. Basic crit tạo Pha Kỹ Năng 5 giây; Skill kế tiếp tiêu dấu +45% Skill Damage. Skill trúng mục tiêu không có Pha Kỹ Năng tạo Pha Súng; Basic chính kế tiếp tiêu dấu +45% Basic Damage.",
  "system": "attack",
  "icon": "core:core_207",
  "category": "offense",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_208",
  "name": "Tế Bào Song Năng",
  "description": "+2 Hồi Máu/s và +20% Resource Regen nền. Bonus Hồi Máu/s chuyển thêm 60% sang Resource Regen; bonus Resource Regen chuyển thêm 60% sang Hồi Máu/s; không feedback qua lại.",
  "system": "resource",
  "icon": "core:core_208",
  "category": "resource",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_209",
  "name": "Chế Độ Tử Thủ",
  "description": "Dưới 35% Máu: +150 Giáp, +40% Hồi Tài Nguyên, -25 Điểm Hồi Kỹ Năng (tối thiểu 0) và -15% mọi sát thương gây ra. Rời trạng thái khi Máu vượt 35%.",
  "system": "utility",
  "icon": "core:core_209",
  "category": "weapon",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_210",
  "name": "Tự Sửa Đường Ngắm",
  "description": "Basic chính có homing nhẹ trong tối đa 0,6 giây. Mỗi 6 Basic chính trúng địch, 3 Basic chính kế tiếp gây +60% Basic Damage và +30% tốc độ projectile. Sau khi bắn hết 3 phát cường hóa, tiến độ bắt đầu lại từ đầu.",
  "system": "attack",
  "icon": "core:core_210",
  "category": "offense",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_211",
  "name": "Bộ Lọc Reroll",
  "description": "+10% mọi sát thương. Khi reroll một card Lõi, ưu tiên ứng viên thuộc Hệ khác với card vừa bị thay nếu còn ứng viên hợp lệ.",
  "system": "utility",
  "icon": "core:core_211",
  "category": "weapon",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 · Không xuất hiện tại Lv15 · One-time encounter; đã từng được offer thì không xuất hiện lại."
},
{
  "id": "core_212",
  "name": "Phiếu Reroll Dự Phòng",
  "description": "+12% mọi sát thương. Nhận ngay +1 Reroll Dự Trữ. Mỗi lượt Core Selection tương lai có đúng 1 reroll phụ cho một ô.",
  "system": "utility",
  "icon": "core:core_212",
  "category": "weapon",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 · Không xuất hiện tại Lv15 · One-time encounter; đã từng được offer thì không xuất hiện lại."
},
{
  "id": "core_213",
  "name": "Ghi Nhớ Từ Chối",
  "description": "Một lõi thường bị loại bằng reroll sẽ không xuất hiện lại trong 2 lượt chọn Lõi thường kế tiếp. Chỉ ghi nhớ ID đã từ chối, không thay đổi tỷ lệ Bậc và không áp dụng Skill Core.",
  "system": "utility",
  "icon": "core:core_213",
  "category": "weapon",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_214",
  "name": "Bản Đồ Dự Thảo",
  "description": "+15% mọi sát thương. Mọi lượt Core Selection sau khi sở hữu hiển thị 5 card thay vì 3, mỗi ô có reroll riêng. Không thay đổi lượt đang chọn.",
  "system": "utility",
  "icon": "core:core_214",
  "category": "weapon",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 · Không xuất hiện tại Lv15 · One-time encounter; đã từng được offer thì không xuất hiện lại."
},
{
  "id": "core_215",
  "name": "Chuyên Tuyến Lõi",
  "description": "Khi nhận, chọn 1 Hệ Lõi dùng chung. Trong mọi lượt chọn Lõi thường sau đó, đúng 1 ô được bảo đảm thuộc Hệ đã chọn nếu có ứng viên hợp lệ. Các ô còn lại và tỷ lệ Bậc giữ nguyên.",
  "system": "utility",
  "icon": "core:core_215",
  "category": "weapon",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_216",
  "name": "Hộp Pandora",
  "description": "Không tự biến đổi chính Hộp Pandora; lõi này vẫn nằm trong danh sách Lõi đã chọn. Khi chọn, biến đổi 1:1 toàn bộ Lõi thường hợp lệ đã sở hữu trước đó thành các Lõi Kim Cương ngẫu nhiên unseen/hợp lệ. Core050/051/052 và Hộp Pandora không bị chuyển đổi; giữ các chỉ số vĩnh viễn đã kiếm được từ lõi cũ.",
  "system": "utility",
  "icon": "core:core_216",
  "category": "weapon",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv7 / Lv11 / Lv15 · Không xuất hiện ở lượt Core đầu tiên. One-time encounter. Chỉ được offer khi còn đủ Lõi Kim Cương unseen/hợp lệ để thay thế 1:1 toàn bộ Core trước đó có thể chuyển đổi."
},
{
  "id": "core_217",
  "name": "Thao Túng Bậc Lõi",
  "description": "+10% mọi sát thương gây ra. Lượt Core Selection chính kế tiếp chắc chắn là Bậc Kim Cương. Sau lượt bảo đảm đó, các lượt Core Selection còn lại dùng tỷ lệ 20% Bạc / 40% Vàng / 40% Kim Cương. Random grant/conversion không tiêu hao lượt Diamond bảo đảm.",
  "system": "utility",
  "icon": "core:core_217",
  "category": "weapon",
  "tiers": [
    "diamond"
  ],
  "availability": "Chỉ Lv1 hoặc Lv7 · One-time encounter; đã từng được offer thì không xuất hiện lại."
},
{
  "id": "core_218",
  "name": "Dư Chấn Tối Hậu",
  "description": "Sau khi Ultimate fully resolves: +35% mọi damage và +35% Resource Regen trong 8 giây. Không giảm Ultimate cooldown. Core097 và Core218 được phép cùng tồn tại; nếu Core097 khóa Ultimate thì Core218 tự nhiên không thể kích hoạt.",
  "system": "attack",
  "icon": "core:core_218",
  "category": "weapon",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv7 / Lv11 / Lv15 · Không xuất hiện tại Lv1 · One-time encounter. Không có rule loại trừ với Core097."
},
{
  "id": "core_219",
  "name": "Nòng Súng Đỏ Rực",
  "description": "Dùng Skill +20 Nhiệt; Skill duy trì +2 Nhiệt/s; mỗi Basic +0,025 Nhiệt. 50–99 Nhiệt: +25% mọi sát thương. 100 Nhiệt: quá nhiệt khóa 3 giây rồi reset. Không dùng Skill 10 giây thì -15 Nhiệt/s.",
  "system": "attack",
  "icon": "core:core_219",
  "category": "offense",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_220",
  "name": "Bóng Sống Ngắn",
  "description": "Mỗi 10 giây, Skill cast tiếp theo để lại một Bóng trong 3,5 giây. Bóng bắn theo Fire Rate hiệu lực hiện tại, mỗi viên gây 60% Hỏa Lực; không crit/proc/cast/target/block.",
  "system": "attack",
  "icon": "core:core_220",
  "category": "offense",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_221",
  "name": "Dấu Ấn Tử Thần",
  "description": "Mỗi 16 giây đánh dấu mục tiêu trong 4 giây. Khi dấu kết thúc, nổ gây raw damage bằng 200% Hỏa Lực +60% tổng sát thương thực tế mục tiêu đã nhận trong thời gian dấu. Nếu vụ nổ đủ kết liễu thì nổ sớm và cooldown kế tiếp của lõi giảm 50%.",
  "system": "attack",
  "icon": "core:core_221",
  "category": "offense",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_222",
  "name": "Nâng Cấp Bất Ổn",
  "description": "Nhận ngay 1 trong 2 hiệu ứng và mỗi 60 giây. Thu Nhỏ: -50% size/hitbox, +33 Điểm Hồi Kỹ Năng, +50% Hồi Tài Nguyên. Khổng Lồ: +50% size/hitbox, +30% Máu Tối Đa, +30% Hỏa Lực.",
  "system": "utility",
  "icon": "core:core_222",
  "category": "weapon",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_223",
  "name": "Mảnh Ghép May Mắn",
  "description": "Nhận 2 Trang Bị Thành Phần ngẫu nhiên.",
  "system": "utility",
  "icon": "core:core_223",
  "category": "weapon",
  "tiers": [
    "silver"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Không xuất hiện nếu Core228 đã khóa các nguồn nhận Trang Bị."
},
{
  "id": "core_224",
  "name": "Thích Chơi Xác Suất",
  "description": "Nhận ngay 1 Trang Bị Thành Phần ngẫu nhiên. Tăng 75% xác suất rơi Nam Châm Ma Thuật / Thành Phần / Hoàn Chỉnh / Huyền Thoại",
  "system": "utility",
  "icon": "core:core_224",
  "category": "weapon",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Không xuất hiện nếu Core228 đã khóa các nguồn nhận Trang Bị."
},
{
  "id": "core_225",
  "name": "Ăn Chắc Mặc Bền",
  "description": "Nhận 3 Trang Bị Thành Phần ngẫu nhiên.",
  "system": "utility",
  "icon": "core:core_225",
  "category": "weapon",
  "tiers": [
    "gold"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Không xuất hiện nếu Core228 đã khóa các nguồn nhận Trang Bị."
},
{
  "id": "core_226",
  "name": "Rương Báu Vật",
  "description": "Nhận 6 Trang Bị Thành Phần ngẫu nhiên và 1 Nam Châm Ma Thuật.",
  "system": "utility",
  "icon": "core:core_226",
  "category": "weapon",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Không xuất hiện nếu Core228 đã khóa các nguồn nhận Trang Bị."
},
{
  "id": "core_227",
  "name": "Chờ Đợi Xứng Đáng?",
  "description": "Đếm ngược 500 giây combat; mỗi quái thường bị hạ giảm 1 giây, mỗi Tinh Anh bị hạ giảm 8 giây, Boss không giảm. Khi hết giờ, nhận ngẫu nhiên 1 gói: 40% nhận 3 Trang Bị Hoàn Chỉnh; 30% nhận 4 Trang Bị Hoàn Chỉnh; 20% nhận 1 Huyền Thoại + 2 Hoàn Chỉnh; 8% nhận 2 Huyền Thoại; 2% nhận 3 Huyền Thoại + 1 Nam Châm Ma Thuật.",
  "system": "utility",
  "icon": "core:core_227",
  "category": "weapon",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 · Không xuất hiện tại Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Đồng hồ chỉ chạy khi combat thực sự đang diễn ra. Không xuất hiện nếu Core228 đã khóa các nguồn nhận Trang Bị."
},
{
  "id": "core_228",
  "name": "Cái Giá Phải Trả",
  "description": "Xóa toàn bộ Trang Bị đang mang, trong kho, đang ghép và dưới đất; nhận 2 Trang Bị Huyền Thoại ngẫu nhiên thuộc 2 family khác nhau rồi khóa mọi nguồn nhận Trang Bị tới hết run. Giữ Nam Châm Ma Thuật; hủy Chờ Đợi Xứng Đáng? nếu chưa nhận thưởng.",
  "system": "utility",
  "icon": "core:core_228",
  "category": "weapon",
  "tiers": [
    "diamond"
  ],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Không được nằm cùng một conversion/random-grant batch với Core223–227."
}
];
