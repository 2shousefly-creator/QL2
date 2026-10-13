import { SKILL_CORE_DESCRIPTIONS } from "./airCombatSkillCores";
import type { CoreDefinition } from "./airCombatTypes";

// Canonical 26.16.0 Appendix B. Retired IDs remain stable but are excluded by eligibility.
export const CORE_DEFINITIONS: readonly CoreDefinition[] = [
  {
    "id": "core_001",
    "name": "Hỏa Lực Đồng Bộ",
    "description": "+30 Hỏa Lực và +45% Tốc Độ Bắn Cộng Thêm. Mỗi 6 đòn đánh thường chính trúng mục tiêu, đòn chính kế tiếp gây thêm 40% sát thương thường.",
    "system": "attack",
    "icon": "core:core_001",
    "category": "offense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_002",
    "name": "Khung Hộ Vệ",
    "description": "+350 Máu Tối Đa và +30 Giáp. Khi sẵn sàng, tạo lá chắn 5% Máu Tối Đa trong 4 giây. Hồi 15 giây sau khi lá chắn bị phá hoặc hết hạn; lần đầu sẵn sàng ngay.",
    "system": "defense",
    "icon": "core:core_002",
    "category": "offense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_003",
    "name": "Tinh Chỉnh Cò Súng",
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
    "name": "Khung Thân Gia Cố",
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
    "description": "+2 Hồi Máu/s, +15 Điểm Hồi Kỹ Năng và +12% Hồi Tài Nguyên. Khi thi triển kỹ năng, hồi 1% Máu Tối Đa. Hồi nội tại: 6 giây.",
    "system": "defense",
    "icon": "core:core_005",
    "category": "offense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_006",
    "name": "Tái Tạo",
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
    "description": "+45 Hỏa Lực và +75% Tốc Độ Bắn Cộng Thêm. Mỗi 6 đòn chính trúng, bắn thêm một đạn tự dẫn gây 100% Hỏa Lực vào mục tiêu hiện tại.",
    "system": "attack",
    "icon": "core:core_007",
    "category": "offense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_008",
    "name": "Khung Hợp Kim Chiến Đấu",
    "description": "+550 Máu Tối Đa và +50 Giáp. Mỗi 12 giây sau khi khiên trước kết thúc, tạo khiên 8% Máu Tối Đa trong 3 giây.",
    "system": "defense",
    "icon": "core:core_008",
    "category": "offense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_009",
    "name": "Bộ Nạp Liên Thanh",
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
    "name": "Khung Thân Chiến Đấu",
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
    "description": "+3 Hồi Máu/s, +25 Điểm Hồi Kỹ Năng và +25% Hồi Tài Nguyên. Thi triển kỹ năng hồi 2% Máu Tối Đa, hồi nội tại 5 giây.",
    "system": "defense",
    "icon": "core:core_011",
    "category": "offense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_012",
    "name": "Rút Ngắn Thời Gian",
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
    "description": "+75 Hỏa Lực và +110% Tốc Độ Bắn Cộng Thêm. Mỗi 5 đòn bắn thường chính trúng mục tiêu, đòn chính kế tiếp gây thêm 100% Hỏa Lực và phát nổ trong 70 px, vụ nổ gây 100% Hỏa Lực lên các mục tiêu khác.",
    "system": "attack",
    "icon": "core:core_013",
    "category": "offense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_014",
    "name": "Pháo Đài Kim Cương",
    "description": "+800 Máu Tối Đa và +75 Giáp. Mỗi 12 giây sau khi khiên kết thúc, tạo khiên 12% Máu Tối Đa trong 5 giây. Khi khiên bị phá, phát xung 200% Hỏa Lực trong 120 px.",
    "system": "defense",
    "icon": "core:core_014",
    "category": "offense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_015",
    "name": "Buồng Bắn Siêu Tốc",
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
    "name": "Khung Thân Bất Hoại",
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
    "description": "+5 Hồi Máu/s, +40 Điểm Hồi Kỹ Năng và +40% Hồi Tài Nguyên. Thi triển kỹ năng hồi 3% Máu Tối Đa và 3% Tài Nguyên Tối Đa, hồi nội tại 8 giây.",
    "system": "defense",
    "icon": "core:core_017",
    "category": "offense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_018",
    "name": "Đồng Hồ Nghịch Thời",
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
    "name": "Nâng Cấp Mồi Bẫy",
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
    "name": "Chuẩn Bị Bẫy",
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
    "name": "Phản Công",
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
    "name": "Tên Lửa Hủy Diệt",
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
    "name": "Tên Lửa Tầm Nhiệt",
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
    "name": "Bất Tử Hộ Thân",
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
    "name": "Tử Thần Cận Kề",
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
    "name": "Pháo Đài Kiên Cố",
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
    "name": "Bắn Mọi Ngóc Ngách",
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
    "name": "Sửa Chữa Khẩn Cấp",
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
    "name": "Thống Khổ Kéo Dài",
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
    "name": "Hội Tụ Năng Lượng",
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
    "name": "Năng Lượng Tối",
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
    "name": "Hệ Thống Pin Tiên Tiến",
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
    "name": "HawkEye Hiếu Chiến",
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
    "name": "Liên Kết Bền Chặt",
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
    "name": "Càng Đánh Càng Hăng",
    "description": "Nhận ngay +25 Hỏa Lực. Quái thường cho +0,65 Hỏa Lực, Tinh Anh/Boss +3,25. Mỗi 50 Hỏa Lực kiếm từ tiến độ nhận thêm +10% Tốc Độ Bắn Cộng Thêm.",
    "system": "attack",
    "icon": "core:core_046",
    "category": "offense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7  · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_047",
    "name": "Thích Ứng Phòng Ngự",
    "description": "Nhận ngay +25 Giáp. Quái thường cho +0,35 Giáp, Tinh Anh/Boss +1,75 Giáp.",
    "system": "defense",
    "icon": "core:core_047",
    "category": "offense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_048",
    "name": "Trường Sinh",
    "description": "Nhận ngay +200 Máu Tối Đa. Mỗi quái thường bị hạ cho +4 Máu Tối Đa, Tinh Anh/Boss cho +20 Máu Tối Đa",
    "system": "defense",
    "icon": "core:core_048",
    "category": "offense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_049",
    "name": "Bất Động Minh Vương",
    "description": "+15 Giáp. Sau khi đứng yên 2 giây nhận +60% Giáp và +40% Hỏa Lực. Khi di chuyển, giữ hiệu lực thêm 1,5 giây rồi kết thúc.",
    "system": "utility",
    "icon": "core:core_049",
    "category": "offense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_050",
    "name": "Chuyển Đổi: Vàng",
    "description": "Nhận 1 Lõi Vàng ngẫu nhiên.",
    "system": "utility",
    "icon": "core:core_050",
    "category": "resource",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Chỉ được offer khi còn ít nhất 1 Lõi Vàng unseen/hợp lệ để cấp."
  },
  {
    "id": "core_051",
    "name": "Chuyển Đổi: Kim Cương",
    "description": "Nhận 1 Lõi Kim Cương ngẫu nhiên.",
    "system": "utility",
    "icon": "core:core_051",
    "category": "resource",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Chỉ được offer khi còn ít nhất 1 Lõi Kim Cương unseen/hợp lệ để cấp."
  },
  {
    "id": "core_052",
    "name": "Chuyển Đổi: Hỗn Loạn",
    "description": "Nhận 2 lõi ngẫu nhiên hợp lệ với tỷ lệ Bạc/Vàng/Kim Cương là 20%/30%/50%",
    "system": "utility",
    "icon": "core:core_052",
    "category": "resource",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Chỉ được offer khi hệ thống có thể commit đủ 2 Lõi ngẫu nhiên unseen/hợp lệ trong cùng batch.<br>Giữ nguyên sức mạnh và tính ngẫu nhiên hiện tại."
  },
  {
    "id": "core_053",
    "name": "Găng Bảo Thạch",
    "description": "Nhận +30% Tỷ Lệ Chí Mạng và cho phép kỹ năng gây chí mạng. Nếu có Kính Xạ Kỹ Tervi, nhận thêm +12,5% Sát Thương Chí Mạng; nếu có Mặt Nạ Xạ Kích Rael, nhận thêm +25% Sát Thương Chí Mạng.",
    "system": "attack",
    "icon": "core:core_053",
    "category": "offense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Synergy chỉ áp dụng một lần theo family."
  },
  {
    "id": "core_054",
    "name": "Chậm Mà Chắc",
    "description": "Tốc Độ Bắn thường bị giới hạn ở 1,8 phát/giây và +50% tốc độ đạn. Mỗi 0,1 Tốc Độ Bắn vượt 1,8 sẽ tăng +4% Sát Thương Đòn Đánh Thường.",
    "system": "utility",
    "icon": "core:core_054",
    "category": "offense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_055",
    "name": "Kính Ngắm Hiệu Chỉnh",
    "description": "+12% Tỷ Lệ Chí Mạng và +15% Sát Thương Chí Mạng. Đòn chí mạng trực tiếp đầu tiên lên mỗi mục tiêu gây thêm sát thương bằng 40% Hỏa Lực.",
    "system": "attack",
    "icon": "core:core_055",
    "category": "offense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_056",
    "name": "Đầu Đạn Cân Chỉnh",
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
    "name": "Xuyên Thủng",
    "description": "+20% Xuyên Giáp",
    "system": "attack",
    "icon": "core:core_057",
    "category": "offense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_058",
    "name": "Nòng Súng Chiến Thuật",
    "description": "+8% sát thương đòn bắn thường. Sau khi thi triển kỹ năng, trong 6 giây nhận +45% Tốc Độ Bắn Cộng Thêm, tổng thưởng sát thương thường tăng thành +15% và đòn chính xuyên thêm 1 mục tiêu.",
    "system": "attack",
    "icon": "core:core_058",
    "category": "offense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. <br>Làm mới thời gian hiệu ứng, không cộng dồn"
  },
  {
    "id": "core_059",
    "name": "Phát Bắn Tích Điện",
    "description": "Mỗi phát bắn thường chính thứ 5 gây 225% sát thương thường và xuyên thêm 1 mục tiêu.",
    "system": "attack",
    "icon": "core:core_059",
    "category": "weapon",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_060",
    "name": "Nòng Súng Ổn Định",
    "description": "+10% sát thương đòn bắn thường. Sau 3 giây không nhận sát thương, tổng thưởng tăng thành +30%. Khi nhận sát thương, mất phần thưởng có điều kiện sau 1 giây.",
    "system": "attack",
    "icon": "core:core_060",
    "category": "weapon",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_061",
    "name": "Giáp Cảnh Giới",
    "description": "+15 Giáp. Khi nguy hiểm tiến vào vùng cảnh giới hoặc sau khi nhận sát thương, nhận thêm +50 Giáp và giảm 10% sát thương phải nhận trong 5 giây. Hồi 8 giây sau hiệu lực.",
    "system": "defense",
    "icon": "core:core_061",
    "category": "offense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_062",
    "name": "Van Sinh Tồn",
    "description": "+1 Hồi Máu/s. Khi dưới 22% Máu, hồi thêm 1% Máu đã mất mỗi giây cho đến khi đạt 22% Máu và giảm 10% sát thương nhận trong lúc ở dưới ngưỡng.",
    "system": "defense",
    "icon": "core:core_062",
    "category": "defense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_063",
    "name": "Máu Nóng",
    "description": "+15 Hỏa Lực và +10 Giáp. Khi dưới 35% Máu, tổng thưởng của lõi tăng thành +65 Hỏa Lực và +45 Giáp.",
    "system": "utility",
    "icon": "core:core_063",
    "category": "defense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_064",
    "name": "Bội Thu Sinh Lực",
    "description": "Mỗi 10 điểm hạ gục hồi 5% Máu Tối Đa, quái thường 1 điểm và Tinh Anh/Boss 5 điểm. Kẻ địch bị hạ có 20% rơi Mảnh Vỡ hồi 3% Máu Tối Đa, tồn tại 8 giây và tự hút trong 100 px.",
    "system": "defense",
    "icon": "core:core_064",
    "category": "defense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_065",
    "name": "Khung Chống Va Đập",
    "description": "+15 Giáp. Giảm 50% sát thương va chạm và đòn lao. Sau khi bị va chạm/đòn lao, +12% mọi sát thương trong 5 giây.",
    "system": "defense",
    "icon": "core:core_065",
    "category": "defense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_066",
    "name": "Combo Săn Mồi",
    "description": "Mỗi mạng hạ gục nhận +5% mọi sát thương trong 6 giây, tối đa 5 tầng. Làm mới thời gian tồn tại khi có mạng hạ gục mới.",
    "system": "attack",
    "icon": "core:core_066",
    "category": "offense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_067",
    "name": "Đánh Dấu Tinh Anh",
    "description": "+22% mọi sát thương lên Tinh Anh/Boss. Hạ Tinh Anh/Boss hồi 5% Máu Tối Đa.",
    "system": "attack",
    "icon": "core:core_067",
    "category": "offense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_068",
    "name": "Bữa Tiệc Hoành Tráng",
    "description": "+8% mọi sát thương. Với mục tiêu trên 70% hoặc dưới 30% Máu, tổng thưởng tăng thành +30%. Đòn chính đầu tiên lên mỗi mục tiêu gây thêm 50% Hỏa Lực.",
    "system": "attack",
    "icon": "core:core_068",
    "category": "offense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_069",
    "name": "Phủ Đầu",
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
    "name": "Tái Kích Hoạt",
    "description": "+8 Điểm Hồi Kỹ Năng. Mỗi 5 điểm hạ gục sẽ giảm 6 giây hồi còn lại của ba kỹ năng cơ bản. Quái thường cho 1 điểm, Tinh Anh/Boss 5 điểm.",
    "system": "utility",
    "icon": "core:core_070",
    "category": "resource",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_071",
    "name": "Nhịp Chiến Thuật",
    "description": "Sau khi thi triển kỹ năng, nhận +36% Tốc Độ Bắn Cộng Thêm trong 6 giây. Hiệu ứng không cộng dồn; chỉ làm mới thời gian.",
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
    "name": "Thép Lạnh",
    "description": "Sau 4 giây không nhận sát thương, sẵn sàng cường hóa giáp. Đòn gây sát thương kế tiếp kích hoạt giảm 70% sát thương nhận trong 2,5 giây, áp dụng ngay cho đòn đó. Khi hiệu lực kết thúc, bắt đầu lại bộ đếm 4 giây không nhận sát thương.",
    "system": "defense",
    "icon": "core:core_072",
    "category": "defense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_073",
    "name": "Xác Nổ",
    "description": "Hạ gục kẻ địch khiến mục tiêu phát nổ, gây 100% Hỏa Lực trong bán kính 40 px.",
    "system": "attack",
    "icon": "core:core_073",
    "category": "weapon",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_074",
    "name": "Bạo Kích Hồi Tiếp",
    "description": "Nhận +15% Tỷ Lệ Chí Mạng. Mỗi đòn chí mạng giảm 0,4 giây Hồi Chiêu còn lại của 3 kỹ năng cơ bản. Không ảnh hưởng Kỹ Năng Tối Thượng.",
    "system": "utility",
    "icon": "core:core_074",
    "category": "offense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_075",
    "name": "Nhịp Sát Phạt",
    "description": "Mỗi mạng hạ gục nhận +8% Hỏa Lực trong 8 giây, tối đa 5 tầng. Đủ 5 tầng nhận thêm +10% sát thương đòn bắn thường.",
    "system": "attack",
    "icon": "core:core_075",
    "category": "offense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_076",
    "name": "Hộp Đen Phản Ứng",
    "description": "+200 Máu Tối Đa. Nếu mất ít nhất 10% Máu Tối Đa trong 3 giây, tạo khiên 18% Máu Tối Đa trong 4 giây và hồi 10% Máu Tối Đa trong 4 giây. Hồi 12 giây sau khi cả khiên và hồi phục kết thúc.",
    "system": "defense",
    "icon": "core:core_076",
    "category": "defense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_077",
    "name": "Hồi Phục Chiến Trường",
    "description": "Hạ gục Tinh Anh/Boss hồi 18% Máu Tối Đa và giảm 5 giây Hồi Chiêu còn lại của mọi kỹ năng.",
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
    "name": "Lò Phản Ứng Tuần Hoàn",
    "description": "+20% Hồi Tài Nguyên. Khi hiệu lực chính của kỹ năng kết thúc, tăng thưởng lên thành +50% Hồi Tài Nguyên trong 5 giây. Mỗi 5 quái thường bị hạ hoặc 20 đòn chính trúng Tinh Anh/Boss hồi ngay 5% Tài Nguyên Tối Đa.",
    "system": "resource",
    "icon": "core:core_078",
    "category": "resource",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_079",
    "name": "Tam Liên Pháo",
    "description": "Mỗi đòn đánh thường thứ 3 tạo thêm một viên đạn phụ tự nhắm mục tiêu gần nhất, gây 100% Sát Thương Đòn Đánh Thường.",
    "system": "attack",
    "icon": "core:core_079",
    "category": "weapon",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_080",
    "name": "Dội Xạ Chiến Thuật",
    "description": "Đòn đánh thường có 50% cơ hội nảy sang một mục tiêu khác, gây 42% Sát Thương Đòn Đánh Thường. Nếu không có mục tiêu phụ hợp lệ, gây thêm 18% Sát Thương Đòn Đánh Thường lên mục tiêu chính.",
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
    "name": "Lá Chắn Kỹ Năng",
    "description": "+15 Giáp. Thi triển kỹ năng tạo khiên 18% Máu Tối Đa trong 5 giây. Hồi 8 giây sau khi khiên kết thúc. Khi tạo khiên, kỹ năng vừa thi triển nhận +15% sát thương, với kỹ năng dạng bật/tắt sẽ có giới hạn tối đa 6 giây.",
    "system": "defense",
    "icon": "core:core_081",
    "category": "resource",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_082",
    "name": "Áp Lực Liên Tục",
    "description": "Sau 4 giây không bị trúng đòn, nhận +72% Tốc Độ Bắn Cộng Thêm cho đến khi bị trúng đòn.",
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
    "description": "Sau khi nhận sát thương, tăng 30% Sát Thương Đòn Đánh Thường trong 5 giây. Hồi Chiêu: 15 giây sau khi hiệu ứng kết thúc.",
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
    "description": "Mỗi kỹ năng thứ 3 được thi triển mà không tốn Tài Nguyên, nhưng Hồi Chiêu của lần dùng đó tăng 10% sau khi áp dụng Điểm Hồi Kỹ Năng.",
    "system": "resource",
    "icon": "core:core_084",
    "category": "resource",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_085",
    "name": "Pháo Đổi Giáp",
    "description": "Nhận +100 Hỏa Lực, nhưng mất 50 Giáp.",
    "system": "utility",
    "icon": "core:core_085",
    "category": "offense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_086",
    "name": "Pin Xung Kích",
    "description": "Giảm 50% Tài Nguyên Tối Đa, nhưng nhận +120% Hồi Tài Nguyên.",
    "system": "resource",
    "icon": "core:core_086",
    "category": "resource",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_087",
    "name": "Mắt Thần Chiến Trường",
    "description": "+30% Tỷ Lệ Chí Mạng, +60% Sát Thương Chí Mạng. Mỗi 5 đòn bắn thường lên Tinh Anh/Boss, đòn chính kế tiếp chắc chắn chí mạng.",
    "system": "attack",
    "icon": "core:core_087",
    "category": "offense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_088",
    "name": "Xuyên Phá Tuyệt Đối",
    "description": "+40% Xuyên Giáp. Gây thêm 15% mọi sát thương lên Tinh Anh/Boss còn dưới 50% máu.",
    "system": "attack",
    "icon": "core:core_088",
    "category": "offense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_089",
    "name": "Đạn Xuyên Vô Tận",
    "description": "Đòn đánh thường chính xuyên qua mọi mục tiêu. So với sát thương phát đạn gốc, mục tiêu thứ nhất nhận 120%, mục tiêu thứ hai nhận 70%, mục tiêu thứ ba nhận 50%; từ mục tiêu thứ tư trở đi nhận 30%.",
    "system": "attack",
    "icon": "core:core_089",
    "category": "weapon",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_090",
    "name": "Từ Chối Tử Thần",
    "description": "+10% Máu Tối Đa. Một lần mỗi lượt chơi, sát thương chí tử khiến bạn còn lại 1 Máu thay vì bị hạ gục, đồng thời miễn nhiễm sát thương 3 giây và hồi 40% Máu Tối Đa trong thời gian này. Sau cứu mạng, +30% mọi sát thương gây ra trong 8 giây.",
    "system": "defense",
    "icon": "core:core_090",
    "category": "defense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_091",
    "name": "Không Khuất Phục",
    "description": "+10% mọi sát thương gây ra. Mỗi 1% Máu đã mất cho thêm +0,7% sát thương gây ra, tổng thưởng tối đa +80%. Khi dưới 35% Máu, giảm 10% sát thương nhận vào.",
    "system": "attack",
    "icon": "core:core_091",
    "category": "defense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_092",
    "name": "Tái Tạo Sinh Học",
    "description": "Hồi phục 0,2% Máu Tối Đa mỗi giây. Sau 3,5 giây không nhận sát thương, tổng hồi từ lõi tăng thành 1,8% Máu Tối Đa mỗi giây.",
    "system": "defense",
    "icon": "core:core_092",
    "category": "defense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_093",
    "name": "Đại Pháp Sư",
    "description": "+20% Hồi Tài Nguyên. Khi thi triển một kỹ năng, giảm Hồi Chiêu còn lại của các kỹ năng cơ bản khác bằng 20% Hồi Chiêu Cơ Bản của chúng. Với Kỹ Năng Tối Thượng, mức giảm là 5% Hồi Chiêu Cơ Bản.",
    "system": "utility",
    "icon": "core:core_093",
    "category": "resource",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_094",
    "name": "Khế Ước Quỷ Quyệt",
    "description": "Giảm 35% Máu Tối Đa; đổi lại, nhận +50% Hỏa Lực và +30% Tỷ Lệ Chí Mạng.",
    "system": "utility",
    "icon": "core:core_094",
    "category": "offense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_095",
    "name": "Nghịch Lý Bạo Kích",
    "description": "Khóa Tỷ Lệ Chí Mạng ở 25%; bù lại nhận +120% Sát Thương Chí Mạng. Mọi điểm % Tỷ Lệ Chí Mạng cộng thêm, có trước hoặc sau khi nhận lõi, được đổi thành Sát Thương Chí Mạng theo tỷ lệ 1:1. Các đòn được bảo đảm chí mạng vẫn chắc chắn chí mạng.",
    "system": "utility",
    "icon": "core:core_095",
    "category": "offense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_096",
    "name": "Hợp Đồng Huyết Năng",
    "description": "Nhận +90 Điểm Hồi Kỹ Năng. Mỗi khi thi triển kỹ năng, mất 5% Máu hiện tại; hiệu ứng này không thể tự hạ gục bạn.",
    "system": "utility",
    "icon": "core:core_096",
    "category": "offense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_097",
    "name": "Tập Trung Chuyên Môn",
    "description": "Không thể chủ động sử dụng Kỹ Năng Tối Thượng. Ba kỹ năng cơ bản nhận +35% Sát Thương Kỹ Năng, -25% Hồi Chiêu Cơ Bản và -20% Chi Phí Tài Nguyên. Các nội tại và nâng cấp liên quan Kỹ Năng Tối Thượng vẫn hoạt động.",
    "system": "utility",
    "icon": "core:core_097",
    "category": "offense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_098",
    "name": "Bộ Lọc Nhiễu",
    "description": "+30 Giáp, giảm 40% thời gian debuff và khống chế. Khi một debuff kết thúc, +20% mọi sát thương và +20% Hồi Tài Nguyên trong 5 giây.",
    "system": "defense",
    "icon": "core:core_098",
    "category": "defense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_099",
    "name": "Kíp Sinh Tồn",
    "description": "+15% Hồi Tài Nguyên. Khi tài nguyên xuống dưới 15% hoặc mất hơn 8% Máu Tối Đa trong 2 giây: tạo khiên 10% Máu Tối Đa trong 4 giây, hồi ngay 8% Tài Nguyên Tối Đa và nhận thêm +15% Hồi Tài Nguyên trong 4 giây. Hồi 15 giây sau khi cả khiên và buff hồi tài nguyên kết thúc.",
    "system": "defense",
    "icon": "core:core_099",
    "category": "defense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_100",
    "name": "Cân Bằng Chiến Trường",
    "description": "Trên 70% Máu: +55 Hỏa Lực và +10 Giáp. Dưới 30% Máu: +15 Hỏa Lực và +55 Giáp. Khoảng giữa: +35 Hỏa Lực và +35 Giáp.",
    "system": "utility",
    "icon": "core:core_100",
    "category": "offense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_101",
    "name": "Hỏa Lực Cự Ly Gần",
    "description": "+8% sát thương đòn bắn thường. Khi mục tiêu ở gần hơn 1/3 chiều cao vùng chiến đấu, tổng thưởng sát thương thường tăng thành +20% và giảm 10% sát thương từ chính mục tiêu đó.",
    "system": "attack",
    "icon": "core:core_101",
    "category": "weapon",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_102",
    "name": "Nén Xung Kỹ Năng",
    "description": "Sau 4 giây kể từ khi hiệu ứng của kỹ năng cuối cùng kết thúc mà chưa thi triển kỹ năng khác, kỹ năng gây sát thương kế tiếp nhận +14% Sát Thương Kỹ Năng cho toàn bộ lần dùng.",
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
    "description": "Giảm 8% sát thương nhận vào. Khi dưới 35% Máu, tổng giảm sát thương từ lõi tăng thành 25%. Mỗi lần rơi xuống ngưỡng này, tạo khiên 8% Máu Tối Đa trong 4 giây, hồi 18 giây sau khi khiên kết thúc.",
    "system": "defense",
    "icon": "core:core_103",
    "category": "defense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_104",
    "name": "Hồi Máu Tràn Trề",
    "description": "+2 Hồi Máu/s. Ở đầy Máu, hồi dư hợp lệ từ kỹ năng/lõi/trang bị chuyển thành khiên tối đa 20% Máu Tối Đa, tồn tại 8 giây. Khi không có nguồn hồi dư, mỗi giây đầy Máu tự nạp khiên bằng 0,5% Máu Tối Đa, tối đa 8% Máu Tối Đa từ nhánh tự nạp.",
    "system": "defense",
    "icon": "core:core_104",
    "category": "defense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_105",
    "name": "Bão Sét Bạo Kích",
    "description": "Nhận +30% Tỷ Lệ Chí Mạng. Đòn chí mạng phóng sét sang tối đa 5 mục tiêu khác, mỗi mục tiêu nhận 150% Hỏa Lực. Cùng một mục tiêu chỉ có thể nhận sét mỗi 0,5 giây. Nếu không có mục tiêu phụ hợp lệ, sét gây 150% Hỏa Lực lên mục tiêu gốc, tối đa mỗi 0,5 giây.",
    "system": "attack",
    "icon": "core:core_105",
    "category": "offense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_106",
    "name": "Tên Lửa Tomahawk",
    "description": "Mỗi 2 giây, phóng tối đa 3 tên lửa Tomahawk vào tối đa 3 mục tiêu. Mỗi tên lửa gây 360% Hỏa Lực, ưu tiên các mục tiêu khác nhau.",
    "system": "attack",
    "icon": "core:core_106",
    "category": "offense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_107",
    "name": "Lướt Sát Tử Thần",
    "description": "+15% Hồi Tài Nguyên. Mỗi 4 Lướt Đạn hồi 12% Tài Nguyên Tối Đa và tạo lá chắn 4% Máu Tối Đa trong 3 giây.",
    "system": "resource",
    "icon": "core:core_107",
    "category": "defense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_108",
    "name": "Thu Gom Mảnh Vỡ",
    "description": "Kẻ địch bị hạ có 15% cơ hội rơi Mảnh Vỡ. Nhặt Mảnh Vỡ hồi 4% Máu Tối Đa. Mảnh Vỡ biến mất sau 4 giây.",
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
    "description": "+15 Giáp. Mỗi cánh giảm 65% sát thương của đòn đầu tiên trúng cánh đó, hồi riêng 6 giây.",
    "system": "defense",
    "icon": "core:core_109",
    "category": "defense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_110",
    "name": "Giáp Kháng Hỏa Lực",
    "description": "+20 Giáp. Giảm 40% sát thương từ bom/vụ nổ/vùng nổ, đạn tự dẫn, tia năng lượng và EMP. Khi nhận một nguồn thuộc nhóm này, nhận khiên 5% Máu Tối Đa trong 3 giây, hồi 12 giây sau khi khiên kết thúc.",
    "system": "defense",
    "icon": "core:core_110",
    "category": "defense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_111",
    "name": "Đạn Vượt Âm",
    "description": "Nhận +200% tốc độ đạn đánh thường và +12% Sát Thương Đòn Đánh Thường.",
    "system": "attack",
    "icon": "core:core_111",
    "category": "offense",
    "tiers": ["silver"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_112",
    "name": "Lưới Giao Hỏa",
    "description": "Bắn trúng 2 mục tiêu khác nhau trong 1,2 giây tạo lưới 3 giây. Mỗi mục tiêu chạm lưới chịu 300% Hỏa Lực, tối đa 3 mục tiêu, mỗi mục tiêu chỉ trúng 1 lần/lưới. Tối đa một lưới đang hoạt động trên cùng một cặp mục tiêu.",
    "system": "attack",
    "icon": "core:core_112",
    "category": "offense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_113",
    "name": "Vay Nợ Tương Lai",
    "description": "Mỗi 16 giây, có thể thi triển ngay một kỹ năng đang Hồi Chiêu với 100% hiệu lực. Sau đó, kỹ năng đó nhận thêm 35% Hồi Chiêu Cơ Bản theo cấp kỹ năng như khoản nợ; khoản nợ không giảm bởi Điểm Hồi Kỹ Năng hoặc các hiệu ứng giảm Hồi Chiêu trực tiếp.",
    "system": "utility",
    "icon": "core:core_113",
    "category": "defense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_114",
    "name": "Hỏa Lực Hội Tụ",
    "description": "Mỗi 4 đòn chính liên tiếp trúng cùng mục tiêu nhận 1 tầng trong 3 giây, tối đa 4 tầng. Mỗi tầng cho +25% Tốc Độ Bắn Cộng Thêm, +3% sát thương thường và +3% sát thương kỹ năng. Đòn đánh thường chính trúng mục tiêu làm mới thời gian; không trúng trong 3 giây hoặc đổi mục tiêu sẽ mất toàn bộ cộng dồn.",
    "system": "attack",
    "icon": "core:core_114",
    "category": "offense",
    "tiers": ["gold"],
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
    "description": "Mỗi 5 đòn đánh thường chính liên tiếp trúng cùng một kẻ địch cho 1 cộng dồn Hội Tụ trong 3 giây, tối đa 4. Mỗi cộng dồn cho +3% Sát Thương Đòn Đánh Thường và +3% Sát Thương Kỹ Năng. Đòn đánh thường chính trúng mục tiêu làm mới thời gian; không trúng trong 3 giây hoặc đổi mục tiêu sẽ mất toàn bộ cộng dồn.",
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
    "description": "Đòn đánh thường đầu tiên lên mỗi kẻ địch chắc chắn chí mạng và gây sát thương chuẩn, bỏ qua toàn bộ Giáp của mục tiêu. Hiệu ứng khai màn hồi lại sau mỗi 25 giây trên cùng mục tiêu.",
    "system": "attack",
    "icon": "core:core_117",
    "category": "offense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_118",
    "name": "Càng Đông Càng Vui",
    "description": "+4% mọi sát thương gây ra. Mỗi kẻ địch vượt quân số người chơi cho thêm +2%, tổng thưởng tối đa +24%. Khi đạt tổng +24%, giảm 10% sát thương nhận vào.",
    "system": "attack",
    "icon": "core:core_118",
    "category": "offense",
    "tiers": ["gold"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_119",
    "name": "Rút Ngắn Thời Gian",
    "description": "Nhận +15% Sát Thương Kỹ Năng. Sau khi thi triển kỹ năng, giảm 7 giây Hồi Chiêu còn lại của một kỹ năng cơ bản khác đang có Hồi Chiêu dài nhất và nhận +45% Hồi Tài Nguyên trong 4 giây. Không ảnh hưởng Kỹ Năng Tối Thượng; thi triển kỹ năng mới chỉ làm mới thời gian hồi Tài Nguyên.",
    "system": "defense",
    "icon": "core:core_119",
    "category": "defense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_120",
    "name": "Đoạt Quyền Điều Khiển",
    "description": "Chiếm quyền tối đa 5 kẻ địch thường trong 12 giây hoặc 1 Tinh Anh trong 9 giây. Boss thay vào đó bị choáng 2 giây. Hồi Chiêu: 13 giây sau khi hiệu ứng kết thúc. Địch bị chiếm quyền gây thêm 30% sát thương. Với Boss: Khi bị choáng từ lõi này, nó sẽ bị Suy Yếu khiến Boss chịu thêm 25% mọi sát thương trong 4 giây kể từ lúc bị choáng.",
    "system": "utility",
    "icon": "core:core_120",
    "category": "defense",
    "tiers": ["diamond"],
    "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
  },
  {
    "id": "core_121",
    "name": "Kho Phản Vật Chất",
    "description": "Tích 42% sát thương dư khi hạ gục kẻ địch thường và 2% sát thương thực tế gây lên Tinh Anh/Boss, tối đa 450% Hỏa Lực. Thi triển kỹ năng tiêu toàn bộ lượng đã tích để gây một xung chấn toàn màn hình.",
    "system": "attack",
    "icon": "core:core_121",
    "category": "offense",
    "tiers": ["diamond"],
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
  "description": "Đánh dấu một mục tiêu ưu tiên tối đa 5 giây, khiến mục tiêu nhận thêm 10% mọi sát thương. Hạ gục mục tiêu bị đánh dấu nhận ngẫu nhiên 1 phần thưởng vĩnh viễn, mỗi loại có 12,5% cơ hội: +12 Hỏa Lực; +12 Giáp; +80 Máu Tối Đa; +6 Điểm Hồi Kỹ Năng; +0,7 Hồi Máu/s; +5% Tỷ Lệ Chí Mạng; +5% Sát Thương Chí Mạng; hoặc +20% Tốc Độ Bắn Cộng Thêm. Hồi Chiêu: 20 giây sau khi dấu kết thúc hoặc mục tiêu bị hạ/biến mất.",
  "system": "utility",
  "icon": "core:core_149",
  "category": "offense",
  "tiers": ["gold"],
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
  "description": "Mỗi 10 quái thường bị hạ hoặc mỗi 40 đòn đánh thường chính trúng Tinh Anh/Boss, kỹ năng kế tiếp trong 5 giây được giảm 15% Chi Phí Tài Nguyên. Hiệu ứng không cộng dồn; chỉ làm mới thời gian.",
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
  "description": "Tài nguyên trên 70%: +50 Hỏa Lực. Dưới 30%: +4 Hồi Máu/s và +25% Hồi Tài Nguyên. Khoảng giữa: +50% Tốc Độ Bắn Cộng Thêm và +8% sát thương đòn bắn thường.",
  "system": "utility",
  "icon": "core:core_169",
  "category": "weapon",
  "tiers": ["silver"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_170",
  "name": "Báo Động Sớm",
  "description": "Khi xuất hiện cảnh báo nguy hiểm, nhận +50 Giáp trong 3 giây. Hồi Chiêu: 10 giây sau khi hiệu ứng kết thúc.",
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
  "description": "Trong 2 giây sau khi thi triển kỹ năng, đòn gây sát thương đầu tiên trúng bạn bị giảm 40% sát thương. Hiệu ứng không cộng dồn; chỉ làm mới thời gian.",
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
  "description": "Giữ Tài Nguyên ở 100% liên tục trong 2 giây tích 1 Tụ Điện. Kỹ năng kế tiếp tiêu Tụ Điện, hoàn lại 25% Chi Phí Tài Nguyên và nhận +10% Sát Thương Kỹ Năng cho lần dùng đó.",
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
  "description": "Khi Lá Chắn bị phá hoặc hết hiệu lực, hồi Máu bằng 25% lượng sát thương Lá Chắn đó thực sự đã hấp thụ.",
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
  "description": "Nếu mất hơn 8% Máu Tối Đa trong 2 giây, hồi 12% Tài Nguyên Tối Đa và nhận +20% Hồi Tài Nguyên trong 4 giây. Hồi Chiêu: 15 giây sau khi hiệu ứng tăng Hồi Tài Nguyên kết thúc.",
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
  "description": "Sau khi thi triển một kỹ năng, nếu thi triển thêm ít nhất một kỹ năng khác trong vòng 5 giây, gây thêm 14% mọi sát thương trong 5 giây. Hồi Chiêu: 20 giây sau khi hiệu ứng kết thúc.",
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
  "description": "Khi không có kẻ địch hoặc hỏa lực địch trong bán kính 150 px, hồi 1% Máu Tối Đa mỗi giây và nhận +25% Hồi Tài Nguyên. Hiệu ứng dừng ngay khi có nguy hiểm đi vào vùng.",
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
  "description": "Giảm 45% sát thương phải nhận từ đạn tự dẫn, tia năng lượng và EMP.",
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
  "description": "+10 Giáp. Khi có đạn/tên lửa địch trong 170 px, tạo vùng Phanh Từ 3 giây, giảm 60% tốc độ đạn trong vùng, gồm cả đạn đi vào sau. Khi vùng bắt đầu, xóa tối đa 3 viên đạn có thể chặn gần chiến cơ nhất. Hồi 12 giây sau hiệu lực.",
  "system": "utility",
  "icon": "core:core_178",
  "category": "weapon",
  "tiers": ["silver"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_179",
  "name": "Bộ Hiệu Chỉnh Sai Số",
  "description": "+10% Tỷ Lệ Chí Mạng. Mỗi đòn chính không chí mạng tích thêm +2% chí mạng cho đến khi một đòn đánh thường chí mạng. Sau khi chí mạng, Tỷ Lệ Chí Mạng trở về mức ban đầu.",
  "system": "attack",
  "icon": "core:core_179",
  "category": "offense",
  "tiers": ["silver"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_180",
  "name": "Phá Khiên",
  "description": "+8% sát thương đòn bắn thường. Đòn bắn thường gây thêm 50% sát thương lên Lá Chắn. Phá lá chắn đánh dấu mục tiêu 6 giây, khiến mục tiêu chịu thêm 20% mọi sát thương.",
  "system": "attack",
  "icon": "core:core_180",
  "category": "offense",
  "tiers": ["silver"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_181",
  "name": "Van Xả Kỹ Năng",
  "description": "Khi hiệu ứng chính của một kỹ năng kết thúc, nhận +45% Hồi Tài Nguyên trong 4 giây. Hiệu ứng không cộng dồn; chỉ làm mới thời gian.",
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
  "description": "Nhận +20% Tài Nguyên Tối Đa. Khi Tài Nguyên trên 60%, nhận +10% Sát Thương Kỹ Năng. Điện của Phantom vẫn có thể vượt quá 100 như bình thường.",
  "system": "resource",
  "icon": "core:core_182",
  "category": "resource",
  "tiers": ["gold"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_183",
  "name": "Giáp Độ Sâu",
  "description": "+25 Giáp. Mỗi loại debuff/khống chế đang chịu cho thêm +20 Giáp, tối đa tổng +85 Giáp. Khi một debuff kết thúc, nhận khiên 5% Máu Tối Đa trong 3 giây, hồi 8 giây sau khi khiên kết thúc.",
  "system": "defense",
  "icon": "core:core_183",
  "category": "defense",
  "tiers": ["silver"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_184",
  "name": "Bảo Hộ Linh Hồn",
  "description": "Sau 22 giây, đòn tấn công hoặc hiệu ứng khống chế kế tiếp trúng bạn bị vô hiệu hoàn toàn, sau đó bạn miễn toàn bộ sát thương và khống chế trong 3,5 giây. Hồi Chiêu bắt đầu sau khi hiệu ứng miễn nhiễm kết thúc. Khi nhận lõi, lần bảo hộ đầu tiên sẵn sàng ngay.",
  "system": "defense",
  "icon": "core:core_184",
  "category": "defense",
  "tiers": ["diamond"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_185",
  "name": "Đánh Dấu Sơ Bộ",
  "description": "Đòn đánh thường chính đầu tiên trúng mục tiêu sẽ đánh dấu mục tiêu tối đa 4 giây. Kỹ năng kế tiếp gây sát thương lên mục tiêu gây thêm 20% Sát Thương Kỹ Năng và tiêu dấu. Hồi Chiêu riêng của mục tiêu: 10 giây sau khi dấu bị tiêu hoặc kết thúc.",
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
  "name": "Hợp Lưu Chiến Thuật",
  "description": "+8% sát thương bắn thường và +4% sát thương kỹ năng. Dùng 2 kỹ năng khác nhau trong 4 giây nâng tổng thưởng lên +30% sát thương thường và +15% sát thương kỹ năng trong 8 giây, đồng thời hồi 8% Tài Nguyên Tối Đa. Hồi 12 giây sau hiệu lực.",
  "system": "attack",
  "icon": "core:core_186",
  "category": "offense",
  "tiers": ["gold"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_187",
  "name": "Tụ Năng Phản Chấn",
  "description": "+8% sát thương kỹ năng. Lưu 50% sát thương Máu thực nhận, tối đa 500% Hỏa Lực. Kỹ năng gây sát thương kế tiếp xả toàn bộ lượng lưu vào mục tiêu đầu tiên, đồng thời tạo khiên bằng 20% lượng lưu trong 4 giây.",
  "system": "attack",
  "icon": "core:core_187",
  "category": "offense",
  "tiers": ["gold"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_188",
  "name": "Dấu Ngắm Bạo Kích",
  "description": "+20% Tỷ Lệ Chí Mạng và +25% Sát Thương Chí Mạng. Chí mạng trực tiếp đánh dấu mục tiêu 5 giây, cho thêm +20% Sát Thương Chí Mạng lên mục tiêu đó. Mỗi mục tiêu chỉ có thể đánh dấu 1 lần, không làm mới thời gian.",
  "system": "attack",
  "icon": "core:core_188",
  "category": "offense",
  "tiers": ["gold"],
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
  "description": "+25% sát thương kỹ năng nhưng sẽ tiêu hao thêm 10% chi phí tài nguyên.",
  "system": "attack",
  "icon": "core:core_190",
  "category": "offense",
  "tiers": ["gold"],
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
  "description": "+15 Giáp. Khi có lá chắn, +25% mọi sát thương gây ra. Khi không có lá chắn, nhận thêm +25 Giáp. Mỗi 12 giây không có lá chắn, tạo lá chắn bằng 6% Máu Tối Đa trong 4 giây.",
  "system": "utility",
  "icon": "core:core_192",
  "category": "weapon",
  "tiers": ["gold"],
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
  "description": "Nhận +15% Tỷ Lệ Chí Mạng. Khi gây chí mạng lên một mục tiêu, nhận +20% Sát Thương Chí Mạng lên chính mục tiêu đó trong 4 giây.",
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
  "description": "Nếu mất ít nhất 12% Máu Tối Đa trong 2 giây, hồi dần 12% Máu Tối Đa trong 4 giây. Hồi Chiêu: 18 giây sau khi hiệu ứng kết thúc.",
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
  "description": "+20% Tỷ Lệ Chí Mạng. Mỗi 4 đòn bắn thường chí mạng trực tiếp cho +5% Sát Thương Chí Mạng vĩnh viễn, tối đa +50%.",
  "system": "attack",
  "icon": "core:core_196",
  "category": "offense",
  "tiers": ["gold"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_197",
  "name": "Chịu Đau",
  "description": "35% sát thương lẽ ra trừ Máu được chuyển thành Sát Thương Trì Hoãn và trả dần trong 4 giây. Thi triển kỹ năng xóa 20% lượng Sát Thương Trì Hoãn còn lại, tối đa một lần mỗi 5 giây. Mỗi 15 quái thường hoặc 1 Tinh Anh/Boss bị hạ sẽ xóa toàn bộ Sát Thương Trì Hoãn còn lại và hồi 4% Máu Tối Đa.",
  "system": "utility",
  "icon": "core:core_197",
  "category": "weapon",
  "tiers": ["gold"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_198",
  "name": "Vệ Tinh Hộ Mệnh",
  "description": "Thi triển kỹ năng tạo tối đa 5 Vệ Tinh Hộ Mệnh trong 6 giây. Mỗi Vệ Tinh chặn 1 viên đạn địch có thể chặn; khi hết hạn mà chưa được dùng, Vệ Tinh bắn kẻ địch gần nhất gây 160% Hỏa Lực. Thi triển kỹ năng khi Vệ Tinh đang hoạt động làm mới thời gian tồn tại và bổ sung 1 Vệ Tinh đã mất, tối đa 5.",
  "system": "utility",
  "icon": "core:core_198",
  "category": "weapon",
  "tiers": ["diamond"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_199",
  "name": "Mạch Quá Tải",
  "description": "Mỗi lần thi triển kỹ năng nhận 1 Quá Tải. Kỹ năng kế tiếp nhận +12% Sát Thương Kỹ Năng mỗi cộng dồn, tối đa 3. Ở 3 cộng dồn, kỹ năng nhận +36% Sát Thương Kỹ Năng và phát xung toàn màn hình gây 250% Hỏa Lực, sau đó đặt lại cộng dồn.",
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
  "name": "Lá Chắn Sinh Năng",
  "description": "Nhận +50% sức mạnh Hồi Máu và Lá Chắn. Nếu thi triển kỹ năng khi không có Lá Chắn tạm thời, tạo Lá Chắn bằng 8% Máu Tối Đa trong 4 giây. Hồi Chiêu: 6 giây sau khi Lá Chắn bị phá hoặc hết hiệu lực. Khi Lá Chắn bị phá hoặc hết hạn, nó phát nổ trong bán kính 120 px, gây sát thương bằng 160% tổng sát thương mà Lá Chắn đó đã hấp thụ.",
  "system": "utility",
  "icon": "core:core_200",
  "category": "weapon",
  "tiers": ["diamond"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_201",
  "name": "Cộng Hưởng Kho Vũ Khí",
  "description": "Mỗi Hệ Lõi đang sở hữu cung cấp thêm hiệu ứng: Tấn Công cho +18% Sát Thương Đòn Đánh Thường; Tài Nguyên cho +18% Sát Thương Kỹ Năng; Phòng Thủ giảm 12% sát thương phải nhận; Đa Dụng cho +9% Sát Thương Đòn Đánh Thường, +9% Sát Thương Kỹ Năng và +15% Hồi Tài Nguyên. Lõi này được tính là Đa Dụng.",
  "system": "utility",
  "icon": "core:core_201",
  "category": "weapon",
  "tiers": ["diamond"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_202",
  "name": "Học Thuyết Một Mũi Nhọn",
  "description": "Chọn 1 trong 4 kỹ năng, kể cả Kỹ Năng Tối Thượng hoặc kỹ năng Cấp 0. Kỹ năng được chọn nhận +25% Sát Thương Kỹ Năng, -25% Chi Phí Tài Nguyên, -25% Hồi Chiêu Cơ Bản và +25% sức mạnh hồi máu và lá chắn. Không thay đổi cấp kỹ năng. Khi có #097, chỉ được chọn một trong ba kỹ năng cơ bản.",
  "system": "attack",
  "icon": "core:core_202",
  "category": "offense",
  "tiers": ["diamond"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_203",
  "name": "Ý Chí Bất Khuất",
  "description": "+12% mọi sát thương gây ra. Các hiệu ứng bất lợi (debuff và khống chế) trên bạn kéo dài thêm 35%, nhưng bạn vẫn có thể bắn và thi triển kỹ năng khi bị khống chế cứng; chỉ di chuyển bị khóa. Khi đang chịu ít nhất 1 hiệu ứng bất lợi, giảm 25% sát thương phải nhận và tăng thưởng sát thương gây ra của lõi này thành +30% mọi sát thương gây ra.",
  "system": "utility",
  "icon": "core:core_203",
  "category": "weapon",
  "tiers": ["diamond"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_204",
  "name": "Phản Lực Giáp",
  "description": "Mỗi khi Giáp và Lá Chắn cộng dồn ngăn được lượng sát thương bằng 25% Máu Tối Đa, phát một sóng xung kích gây 250% Hỏa Lực và hồi 5% Tài Nguyên Tối Đa. Tiến độ vượt ngưỡng được giữ lại; mỗi lần nhận sát thương chỉ có thể kích hoạt tối đa một lần.",
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
  "name": "Dao 2 Lưỡi",
  "description": "Chiến cơ của bạn tăng 55% mọi sát thương gây ra, nhưng bù lại sẽ tăng 25% mọi sát thương phải nhận vào.",
  "system": "attack",
  "icon": "core:core_205",
  "category": "offense",
  "tiers": ["diamond"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_206",
  "name": "Đạn Siêu Nặng",
  "description": "Đòn bắn thường chính gây thêm +85% sát thương và xuyên thêm 1 mục tiêu, nhưng giảm 10% tổng tốc độ bắn và 20% tốc độ đạn. Mục tiêu đầu bị trúng mỗi 4 giây tạo một vụ nổ 100% Hỏa Lực trong 60 px lên các địch khác.",
  "system": "attack",
  "icon": "core:core_206",
  "category": "offense",
  "tiers": ["diamond"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_207",
  "name": "Pha Đối Nghịch",
  "description": "Nhận +25% Tỷ Lệ Chí Mạng. Đòn đánh thường chí mạng tạo Pha Kỹ Năng trong 5 giây; kỹ năng kế tiếp tiêu dấu để nhận +30% Sát Thương Kỹ Năng. Kỹ năng trúng mục tiêu không có Pha Kỹ Năng tạo Pha Súng; đòn đánh thường chính kế tiếp tiêu dấu để nhận +30% Sát Thương Đòn Đánh Thường.",
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
  "description": "Nhận +3 Hồi Máu/s và +30% Hồi Tài Nguyên. Chuyển 50% Hồi Máu/s cộng thêm thành Hồi Tài Nguyên/s và 50% Hồi Tài Nguyên/s cộng thêm thành Hồi Máu/s. Hai chuyển đổi không kích hoạt lẫn nhau. Các hiệu ứng tăng hồi phục tạm thời vẫn được tính vào chuyển đổi.",
  "system": "resource",
  "icon": "core:core_208",
  "category": "resource",
  "tiers": ["diamond"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_209",
  "name": "Chế Độ Tử Thủ",
  "description": "+40 Giáp. Khi còn dưới 35% Máu, nhận +250 Giáp, +40% Hồi Tài Nguyên và +5 Hồi Máu/s, nhưng mất 25 Điểm Hồi Kỹ Năng (không thể xuống dưới 0) và giảm 10% mọi sát thương gây ra. Hiệu ứng kết thúc khi Máu vượt 35%.",
  "system": "utility",
  "icon": "core:core_209",
  "category": "weapon",
  "tiers": ["diamond"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_210",
  "name": "Tự Sửa Đường Ngắm",
  "description": "Đòn đánh thường chính có khả năng tự dẫn nhẹ trong tối đa 0,6 giây. Mỗi 9 đòn đánh thường chính trúng kẻ địch, 3 đòn tiếp theo gây thêm 20% Sát Thương Đòn Đánh Thường và có +30% tốc độ đạn. Sau 3 phát cường hóa, tiến độ bắt đầu lại.",
  "system": "attack",
  "icon": "core:core_210",
  "category": "offense",
  "tiers": ["silver"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_211",
  "name": "Bộ Lọc Reroll",
  "description": "Nhận +10% mọi sát thương. Khi đổi lại một thẻ Lõi, ưu tiên đưa ra Lõi thuộc Hệ khác với thẻ vừa thay nếu còn lựa chọn hợp lệ.",
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
  "name": "Phiếu Đổi Lõi Dự Phòng",
  "description": "Tăng +8% mọi sát thương gây ra và +1 lượt đổi lại dự trữ. Mỗi lượt chọn Lõi trong tương lai có thêm đúng 1 lượt đổi lại cho một ô.",
  "system": "utility",
  "icon": "core:core_212",
  "category": "weapon",
  "tiers": ["gold"],
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
  "description": "Các lượt chọn Lõi sau khi sở hữu Lõi này hiển thị 5 thẻ thay vì 3, mỗi ô có lượt đổi lại riêng. Không ảnh hưởng lượt đang chọn.",
  "system": "utility",
  "icon": "core:core_214",
  "category": "weapon",
  "tiers": ["diamond"],
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
  "description": "Khi chọn, biến đổi 1:1 toàn bộ Lõi thường hợp lệ đã sở hữu trước đó thành các Lõi Kim Cương ngẫu nhiên chưa xuất hiện. Hộp Pandora không tự biến đổi; Chuyển đổi: Vàng, Chuyển đổi: Kim Cương và Chuyển đổi: Hỗn Loạn cũng không bị chuyển đổi. Giữ nguyên mọi chỉ số vĩnh viễn đã kiếm được từ các Lõi cũ.",
  "system": "utility",
  "icon": "core:core_216",
  "category": "weapon",
  "tiers": ["diamond"],
  "availability": "Lv7 / Lv11 / Lv15 · Không xuất hiện ở lượt Core đầu tiên. One-time encounter. Chỉ được offer khi còn đủ Lõi Kim Cương unseen/hợp lệ để thay thế 1:1 toàn bộ Core trước đó có thể chuyển đổi."
},
{
  "id": "core_217",
  "name": "Thao Túng Bậc Lõi",
  "description": "Lượt chọn Lõi chính kế tiếp chắc chắn chỉ có Lõi Kim Cương. Sau lượt bảo đảm này, các lượt chọn Lõi còn lại có tỷ lệ 20% Bạc / 30% Vàng / 50% Kim Cương. Các nguồn cấp hoặc chuyển đổi Lõi ngẫu nhiên không tiêu hao lượt bảo đảm.",
  "system": "utility",
  "icon": "core:core_217",
  "category": "weapon",
  "tiers": ["diamond"],
  "availability": "Chỉ Lv1 hoặc Lv7 · One-time encounter; đã từng được offer thì không xuất hiện lại."
},
{
  "id": "core_218",
  "name": "Dư Chấn Tối Hậu",
  "description": "+12% sát thương kỹ năng. Sau khi Kỹ Năng Tối Thượng kết thúc hoàn toàn, tăng +35% mọi sát thương gây ra và +90% Hồi Tài Nguyên trong 15 giây.",
  "system": "attack",
  "icon": "core:core_218",
  "category": "weapon",
  "tiers": ["diamond"],
  "availability": "Lv7 / Lv11 / Lv15 · Không xuất hiện tại Lv1 · One-time encounter. Không có rule loại trừ với Core097."
},
{
  "id": "core_219",
  "name": "Nòng Súng Đỏ Rực",
  "description": "Thi triển kỹ năng cho +20 Nhiệt; kỹ năng duy trì cho +2 Nhiệt mỗi giây; mỗi đòn đánh thường cho +0,06 Nhiệt. Ở 50–99 Nhiệt, gây thêm 30% mọi sát thương. Khi đạt 100 Nhiệt, Quá Nhiệt trong 3 giây rồi đặt lại. Trong Quá Nhiệt, chiến cơ ngừng bắn thường và không thể thi triển kỹ năng mới; các kỹ năng đang hoạt động không bị hủy và tiếp tục hiệu lực. Nếu không thi triển kỹ năng trong 10 giây, mất 15 Nhiệt mỗi giây.",
  "system": "attack",
  "icon": "core:core_219",
  "category": "offense",
  "tiers": ["gold"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_220",
  "name": "Ảnh Pháo",
  "description": "Khi sẵn sàng, lần thi triển kỹ năng kế tiếp để lại một Bóng trong 4 giây. Bóng bắn theo Tốc Độ Bắn hiệu lực hiện tại; mỗi viên gây 50% Hỏa Lực. Bóng không thể chí mạng, kích hoạt hiệu ứng, thi triển kỹ năng, khóa mục tiêu hoặc chặn đạn. Hồi Chiêu: 10 giây sau khi Bóng kết thúc.",
  "system": "attack",
  "icon": "core:core_220",
  "category": "offense",
  "tiers": ["gold"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_221",
  "name": "Dấu Ấn Tử Thần",
  "description": "Đánh dấu một mục tiêu trong 5 giây. Khi dấu kết thúc, dấu ấn phát nổ, gây sát thương bằng 50% Hỏa Lực + 50% tổng sát thương thực tế đã nhận trong thời gian bị đánh dấu. Hồi Chiêu: 16 giây sau khi dấu kết thúc. Nếu vụ nổ đủ để kết liễu, nó kích nổ sớm và Hồi Chiêu kế tiếp của Lõi giảm 50%.",
  "system": "attack",
  "icon": "core:core_221",
  "category": "offense",
  "tiers": ["gold"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_222",
  "name": "Nâng Cấp Bất Ổn",
  "description": "Nhận ngay một trong hai trạng thái và đổi trạng thái mỗi 60 giây. Thu Nhỏ: -50% kích thước/hitbox, +45 Điểm Hồi Kỹ Năng, +60% Hồi Tài Nguyên. Khổng Lồ: +50% kích thước/hitbox, +40% Máu Tối Đa, +40% Hỏa Lực. Mỗi lần đổi trạng thái nhận khiên 10% Máu Tối Đa trong 4 giây.",
  "system": "utility",
  "icon": "core:core_222",
  "category": "weapon",
  "tiers": ["diamond"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run."
},
{
  "id": "core_223",
  "name": "Mảnh Ghép May Mắn",
  "description": "Nhận 2 Trang Bị Thành Phần. Với mỗi món, chọn 1 trong 3 thành phần ngẫu nhiên.",
  "system": "utility",
  "icon": "core:core_223",
  "category": "weapon",
  "tiers": ["silver"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Không xuất hiện nếu Core228 đã khóa các nguồn nhận Trang Bị."
},
{
  "id": "core_224",
  "name": "Thích Chơi Xác Suất",
  "description": "Nhận ngay 2 Trang Bị Thành Phần ngẫu nhiên và tăng 100% xác suất rơi Nam Châm Ma Thuật, Trang Bị Thành Phần, Hoàn Chỉnh và Huyền Thoại.",
  "system": "utility",
  "icon": "core:core_224",
  "category": "weapon",
  "tiers": ["gold"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Không xuất hiện nếu Core228 đã khóa các nguồn nhận Trang Bị."
},
{
  "id": "core_225",
  "name": "Ăn Chắc Mặc Bền",
  "description": "Nhận 4 Trang Bị Thành Phần. Hai món đầu chọn riêng từ 3 phương án ngẫu nhiên, hai món sau cho ngẫu nhiên.",
  "system": "utility",
  "icon": "core:core_225",
  "category": "weapon",
  "tiers": ["gold"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Không xuất hiện nếu Core228 đã khóa các nguồn nhận Trang Bị."
},
{
  "id": "core_226",
  "name": "Rương Báu Vật",
  "description": "Nhận 6 Trang Bị Thành Phần và 1 Nam Châm Ma Thuật. Ba thành phần đầu được chọn riêng từ 3 phương án ngẫu nhiên, ba món còn lại ngẫu nhiên.",
  "system": "utility",
  "icon": "core:core_226",
  "category": "weapon",
  "tiers": ["diamond"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Không xuất hiện nếu Core228 đã khóa các nguồn nhận Trang Bị."
},
{
  "id": "core_227",
  "name": "Chờ Đợi Xứng Đáng?",
  "description": "Nhận ngay 1 Trang Bị Thành Phần ngẫu nhiên. Bắt đầu đếm ngược 500 giây giao chiến. Hạ quái thường giảm 1 giây; hạ Tinh Anh giảm 8 giây; Boss không giảm thời gian. Khi hết giờ, nhận ngẫu nhiên một gói thưởng: 40% — 3 Trang Bị Hoàn Chỉnh; 30% — 4 Trang Bị Hoàn Chỉnh; 20% — 1 Huyền Thoại + 2 Hoàn Chỉnh; 8% — 2 Huyền Thoại; 2% — 3 Huyền Thoại + 1 Nam Châm Ma Thuật.",
  "system": "utility",
  "icon": "core:core_227",
  "category": "weapon",
  "tiers": ["diamond"],
  "availability": "Lv1 / Lv7 / Lv11 · Không xuất hiện tại Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Đồng hồ chỉ chạy khi combat thực sự đang diễn ra. Không xuất hiện nếu Core228 đã khóa các nguồn nhận Trang Bị."
},
{
  "id": "core_228",
  "name": "Cái Giá Phải Trả",
  "description": "Xóa toàn bộ Trang Bị đang mang, trong kho, đang ghép và dưới đất, sau đó nhận 3 Trang Bị Huyền  Thoại tùy chọn từ danh sách 10 trang bị Huyền Thoại ngẫu nhiên. Từ đó khóa mọi nguồn nhận Trang Bị đến hết lượt chơi. Giữ lại Nam Châm Ma Thuật và hủy Chờ Đợi Xứng Đáng? nếu chưa nhận thưởng.",
  "system": "utility",
  "icon": "core:core_228",
  "category": "weapon",
  "tiers": ["diamond"],
  "availability": "Lv1 / Lv7 / Lv11 / Lv15 · One-time encounter: đã từng được offer (kể cả bị reroll/bỏ qua) thì không xuất hiện lại trong run. Không được nằm cùng một conversion/random-grant batch với Core223–227."
},
{
  "id": "core_229",
  "name": "Gatlingun",
  "description": "Nhân đôi tổng tốc độ bắn và bỏ giới hạn tốc độ bắn tối đa chung. Đổi lại, sát thương bắn thường và các viên đạn phụ phát sinh từ nó chỉ còn 55%. Sát thương cộng thêm từ hiệu ứng phụ và sát thương kỹ năng giữ nguyên",
  "system": "attack",
  "icon": "core:core_229",
  "category": "weapon",
  "tiers": ["diamond"],
  "availability": "Cấp 1 / 7 / 11 / 15. Chỉ được đề nghị một lần mỗi trận; dùng chung cho các chiến cơ. Có thể kết hợp Chậm Mà Chắc."
}
];
