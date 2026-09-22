import { SKILL_CORE_DESCRIPTIONS } from "./airCombatSkillCores";
import type { CoreDefinition } from "./airCombatTypes";

// Canonical Appendix B, workbook row numbers are stable run-local identifiers.
export const CORE_DEFINITIONS: readonly CoreDefinition[] = [
  {
    "id": "core_001",
    "name": "Đạn hạng nhẹ",
    "description": "Nhận +12 Hỏa Lực.",
    "system": "attack",
    "icon": "core:core_001",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_002",
    "name": "Lớp giáp phụ",
    "description": "Nhận +12 Giáp.",
    "system": "defense",
    "icon": "core:core_002",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_003",
    "name": "Tinh chỉnh cò súng",
    "description": "+0.25 Tốc Độ Bắn",
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
    "name": "Bộ sửa chữa cơ bản",
    "description": "+0.9 Hồi Máu/giây",
    "system": "defense",
    "icon": "core:core_005",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_006",
    "name": "Tái tạo",
    "description": "+5% Giảm Hồi Chiêu",
    "system": "utility",
    "icon": "core:core_006",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_007",
    "name": "Đạn xuyên giáp",
    "description": "Nhận +20 Hỏa Lực.",
    "system": "attack",
    "icon": "core:core_007",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_008",
    "name": "Giáp hợp kim",
    "description": "Nhận +20 Giáp.",
    "system": "defense",
    "icon": "core:core_008",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_009",
    "name": "Bộ nạp liên thanh",
    "description": "Nhận +0,4 Tốc Độ Bắn.",
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
    "name": "Sửa chữa Nano",
    "description": "Nhận +1,7 Hồi Máu mỗi giây.",
    "system": "defense",
    "icon": "core:core_011",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_012",
    "name": "Rút ngắn thời gian",
    "description": "+10% Giảm Hồi Chiêu",
    "system": "utility",
    "icon": "core:core_012",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_013",
    "name": "Chúng sinh bình đẳng",
    "description": "Nhận +50 Hỏa Lực.",
    "system": "attack",
    "icon": "core:core_013",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_014",
    "name": "Pháo đài kim cương",
    "description": "Nhận +50 Giáp.",
    "system": "defense",
    "icon": "core:core_014",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_015",
    "name": "Buồng bắn siêu tốc",
    "description": "Nhận +1 Tốc Độ Bắn.",
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
    "name": "Tái tạo lượng tử",
    "description": "Nhận +4 Hồi Máu mỗi giây.",
    "system": "defense",
    "icon": "core:core_017",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_018",
    "name": "Đồng hồ nghịch thời",
    "description": "Nhận 20% Giảm Hồi Chiêu.",
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
    "description": "Hồi Chiêu Mồi Bẫy còn 11 giây trước các hiệu ứng Giảm Hồi Chiêu khác.",
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
    "description": "Điên Cuồng nhận thêm +35% Tốc Độ Bắn, nâng tổng hiệu ứng lên +75% Tốc Độ Bắn.",
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
    "description": "Hồi Chiêu BigBang còn 15 giây trước các hiệu ứng Giảm Hồi Chiêu khác.",
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
    "description": "Sau mỗi 8 giây HawkEye hoạt động, HawkEye nhận +100% Tốc Độ Bắn và Phantom nhận +30% Tốc Độ Bắn trong 3 giây. Chu kỳ mới bắt đầu khi hiệu ứng kết thúc.",
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
    "description": "Mỗi kẻ địch bị hạ cho +0,4 Hỏa Lực trong lượt. Tinh Anh và Boss cho lượng tăng gấp 5 lần.",
    "system": "attack",
    "icon": "core:core_046",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_047",
    "name": "Thích ứng phòng ngự",
    "description": "Mỗi hạ gục tăng vĩnh viễn 0,2 Giáp trong lượt chơi. Tinh Anh/Boss tính gấp 5.",
    "system": "defense",
    "icon": "core:core_047",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_048",
    "name": "Trường Sinh",
    "description": "Mỗi hạ gục tăng vĩnh viễn 2 Máu Tối Đa trong lượt chơi. Tinh Anh/Boss tính gấp 5.",
    "system": "defense",
    "icon": "core:core_048",
    "category": "offense",
    "tiers": [
      "silver"
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  },
  {
    "id": "core_053",
    "name": "Găng bảo thạch",
    "description": "Nhận +25% Tỷ Lệ Chí Mạng. Kỹ năng của bạn có thể chí mạng. Nếu đồng thời mang Mắt Tempest: +50 điểm phần trăm Sát Thương Chí Mạng toàn cục; Thiên Nhãn Raijin: +100 điểm phần trăm Sát Thương Chí Mạng toàn cục. Synergy chỉ áp dụng một lần theo family.",
    "system": "attack",
    "icon": "core:core_053",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_054",
    "name": "Chậm mà chắc",
    "description": "Khóa Tốc Độ Bắn ở 1,2/s. Mỗi 0,1 Tốc Độ Bắn vượt giới hạn chuyển thành +10 Hỏa Lực.",
    "system": "utility",
    "icon": "core:core_054",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_055",
    "name": "Kính ngắm chiến trường",
    "description": "+8% Tỷ Lệ Chí Mạng",
    "system": "attack",
    "icon": "core:core_055",
    "category": "offense",
    "tiers": [
      "silver"
    ]
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
    "description": "Mọi sát thương bỏ qua 10% Giáp.",
    "system": "attack",
    "icon": "core:core_057",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_058",
    "name": "Dấu ngắm yếu điểm",
    "description": "Đánh trúng cùng mục tiêu 4 lần làm giảm 15% Giáp trong 5 giây. Khi hiệu ứng kết thúc, mục tiêu đó có hồi nội tại 15 giây. Không tích hit trong thời gian giảm Giáp hoặc hồi nội tại; hết hồi nội tại bắt đầu chu kỳ mới.",
    "system": "attack",
    "icon": "core:core_058",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_059",
    "name": "Phát bắn tích điện",
    "description": "Mỗi phát bắn thường thứ 10 gây 180% sát thương của phát bắn thường.",
    "system": "attack",
    "icon": "core:core_059",
    "category": "weapon",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_060",
    "name": "Nòng súng ổn định",
    "description": "Sau 4 giây không nhận sát thương, đòn bắn thường gây thêm 15% sát thương đạn thường. Hiệu ứng mất khi bạn nhận sát thương.",
    "system": "attack",
    "icon": "core:core_060",
    "category": "weapon",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_061",
    "name": "Giáp phản ứng nhanh",
    "description": "Khi nhận sát thương, nhận +25 Giáp trong 5 giây. Hồi nội tại 10 giây.",
    "system": "defense",
    "icon": "core:core_061",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_062",
    "name": "Van sinh tồn",
    "description": "Khi dưới 20% Máu, hồi 0,8% Máu Tối Đa mỗi giây, dừng khi đạt 20%.",
    "system": "defense",
    "icon": "core:core_062",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_063",
    "name": "Máu nóng",
    "description": "Khi dưới 35% Máu, nhận +20 Hỏa Lực và +20 Giáp.",
    "system": "utility",
    "icon": "core:core_063",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_064",
    "name": "Hút Hồn",
    "description": "Mỗi 10 hạ gục hồi 3% Máu Tối Đa.",
    "system": "defense",
    "icon": "core:core_064",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_065",
    "name": "Khung chống va đập",
    "description": "Giảm 35% sát thương va chạm và các đòn lao trực tiếp.",
    "system": "defense",
    "icon": "core:core_065",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_066",
    "name": "Combo săn mồi",
    "description": "Hạ gục liên tiếp cách nhau không quá 3 giây tăng 2,5% mọi sát thương mỗi cộng dồn, tối đa 5 cộng dồn (+12,5% mọi sát thương). Mất toàn bộ khi quá 3 giây không hạ gục.",
    "system": "attack",
    "icon": "core:core_066",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_067",
    "name": "Đánh dấu Tinh Anh",
    "description": "Gây thêm 8% mọi sát thương lên Tinh Anh và Boss.",
    "system": "attack",
    "icon": "core:core_067",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_068",
    "name": "Kết liễu gọn",
    "description": "Gây thêm 12% mọi sát thương lên mục tiêu dưới 25% Máu.",
    "system": "attack",
    "icon": "core:core_068",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_069",
    "name": "Phủ đầu",
    "description": "Gây thêm 12% mọi sát thương lên mục tiêu trên 70% Máu.",
    "system": "attack",
    "icon": "core:core_069",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_070",
    "name": "Tái kích hoạt",
    "description": "Mỗi 6 hạ gục giảm 0,75 giây hồi chiêu còn lại của mọi kỹ năng đang hồi.",
    "system": "utility",
    "icon": "core:core_070",
    "category": "resource",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_071",
    "name": "Nhịp chiến thuật",
    "description": "Sau khi dùng kỹ năng, nhận +0,30 Tốc Độ Bắn trong 5 giây.",
    "system": "attack",
    "icon": "core:core_071",
    "category": "resource",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_072",
    "name": "Thép lạnh",
    "description": "Sau 5 giây không nhận sát thương, đòn đánh kế tiếp trúng bạn bị giảm 40% sát thương nhận vào. Sau đó hiệu ứng bắt đầu tích lại.",
    "system": "defense",
    "icon": "core:core_072",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_073",
    "name": "Đạn Phân Mảnh",
    "description": "Kẻ địch bị hạ phát nổ gây 35% Hỏa Lực lên kẻ địch xung quanh.",
    "system": "attack",
    "icon": "core:core_073",
    "category": "weapon",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_074",
    "name": "Bạo Kích Hồi Tiếp",
    "description": "Nhận +10% Tỷ Lệ Chí Mạng, mỗi đòn chí mạng giảm 0,2 giây hồi chiêu của cả 3 kỹ năng, tối đa 1 giây mỗi giây.",
    "system": "utility",
    "icon": "core:core_074",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_075",
    "name": "Nhịp Sát Phạt",
    "description": "Mỗi 5 kẻ địch bị hạ cho +3% Hỏa Lực, tối đa 5 cộng dồn. Nhận sát thương làm mất 1 cộng dồn.",
    "system": "attack",
    "icon": "core:core_075",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_076",
    "name": "Lá Chắn Phản Ứng",
    "description": "Khi một đòn gây sát thương lớn hơn 10% Máu Tối Đa, nhận khiên bằng 12% Máu Tối Đa trong 3 giây. Hồi nội tại 10 giây.",
    "system": "defense",
    "icon": "core:core_076",
    "category": "defense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_077",
    "name": "Hồi Phục Chiến Trường",
    "description": "Hạ Tinh Anh hồi 15% Máu Tối Đa và giảm 3 giây hồi chiêu còn lại của mọi kỹ năng.",
    "system": "utility",
    "icon": "core:core_077",
    "category": "defense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_078",
    "name": "Tiếp Sức Lò Phản Ứng",
    "description": "Hạ 5 kẻ địch trong 4 giây hồi ngay 5% Tài Nguyên Tối Đa và nhận +50% Hồi Tài Nguyên trong 6 giây.",
    "system": "resource",
    "icon": "core:core_078",
    "category": "resource",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_079",
    "name": "Tam Liên Pháo",
    "description": "Mỗi phát bắn thường thứ 3 tạo thêm một viên đạn phụ gây 40% sát thương của phát bắn thường cơ bản (trước hệ số riêng của loại đạn), viên đạn này sẽ có đường bay độc lập và tự nhắm vào mục tiêu gần nhất (không khóa mục tiêu)",
    "system": "attack",
    "icon": "core:core_079",
    "category": "weapon",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_080",
    "name": "Dội Xạ Chiến Thuật",
    "description": "Đạn thường có 30% cơ hội nảy sang một mục tiêu khác, gây 40% sát thương đạn gốc.",
    "system": "attack",
    "icon": "core:core_080",
    "category": "weapon",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_081",
    "name": "Lá chắn kỹ năng",
    "description": "Dùng kỹ năng cho một khiên bằng 8% Máu Tối Đa trong 3 giây. Hồi nội tại 6 giây.",
    "system": "defense",
    "icon": "core:core_081",
    "category": "resource",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_082",
    "name": "Áp Lực Liên Tục",
    "description": "Không bị trúng đòn trong 4 giây sẽ nhận +1 Tốc độ bắn cho tới khi bị trúng đòn",
    "system": "attack",
    "icon": "core:core_082",
    "category": "weapon",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_083",
    "name": "Phản Công Tức Thời",
    "description": "Sau khi nhận sát thương, những phát bắn thường tiếp theo trong vòng 4 giây gây thêm 20% sát thương đạn thường. Hồi nội bộ 9 giây (bắt đầu hồi chiêu sau khi kết thúc hiệu ứng).",
    "system": "attack",
    "icon": "core:core_083",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_084",
    "name": "Miễn Phí Có Điều Kiện",
    "description": "Mỗi kỹ năng thứ 4 sử dụng sẽ không tiêu hao tài nguyên nhưng lần dùng đó có hồi chiêu tăng 10%",
    "system": "resource",
    "icon": "core:core_084",
    "category": "resource",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_085",
    "name": "Pháo Đổi Giáp",
    "description": "+48 Firepower, -24 Armor",
    "system": "utility",
    "icon": "core:core_085",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_086",
    "name": "Pin Xung Kích",
    "description": "Giảm 35% Tài Nguyên Tối Đa, nhưng nhận +70% Hồi Tài Nguyên.",
    "system": "resource",
    "icon": "core:core_086",
    "category": "resource",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_087",
    "name": "Mắt thần chiến trường",
    "description": "+35% Tỷ Lệ Chí Mạng, +70% Sát Thương Chí Mạng.",
    "system": "attack",
    "icon": "core:core_087",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_088",
    "name": "Xuyên phá tuyệt đối",
    "description": "Mọi sát thương của bạn bỏ qua 25% Giáp của mục tiêu.",
    "system": "attack",
    "icon": "core:core_088",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_089",
    "name": "Đạn xuyên vô tận",
    "description": "Đạn thường xuyên thêm tối đa 3 mục tiêu; ba mục tiêu xuyên thêm lần lượt nhận 70%, 50% và 30% sát thương của phát bắn gốc.",
    "system": "attack",
    "icon": "core:core_089",
    "category": "weapon",
    "tiers": [
      "diamond"
    ]
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
    ]
  },
  {
    "id": "core_091",
    "name": "Không khuất phục",
    "description": "Mỗi 2% Máu đã mất tăng 1% mọi sát thương, tối đa +40% mọi sát thương.",
    "system": "attack",
    "icon": "core:core_091",
    "category": "defense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_092",
    "name": "Tái Tạo Sinh Học",
    "description": "Sau 5 giây không nhận sát thương, hồi 1% Máu Tối Đa mỗi giây.",
    "system": "defense",
    "icon": "core:core_092",
    "category": "defense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_093",
    "name": "Đại Pháp Sư",
    "description": "Dùng một kỹ năng giảm hồi chiêu còn lại của 2 kỹ năng khác bằng 15% Hồi Chiêu cơ bản của chúng.",
    "system": "utility",
    "icon": "core:core_093",
    "category": "resource",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_094",
    "name": "Khế Ước Quỷ Quyệt",
    "description": "Mất 35% Máu Tối Đa để nhận +40% Hỏa Lực và +25% Tỷ Lệ Chí Mạng.",
    "system": "utility",
    "icon": "core:core_094",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_095",
    "name": "Nghịch Lý Bạo Kích",
    "description": "Khóa Tỷ Lệ Chí Mạng ở 25%; bù lại nhận +200% Sát Thương Chí Mạng.",
    "system": "utility",
    "icon": "core:core_095",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_096",
    "name": "Hợp Đồng Huyết Năng",
    "description": "Nhận +30% Giảm Hồi Chiêu. Mỗi lần dùng kỹ năng mất 5% Máu hiện tại, không thể tự hạ gục.",
    "system": "utility",
    "icon": "core:core_096",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_097",
    "name": "Tập trung chuyên môn",
    "description": "Khóa cả 3 kỹ năng; nhận +40% Hỏa Lực, +30% Máu Tối Đa và +30% Giáp. Các mốc 9/18/27 chuyển sang lựa chọn Lõi Vàng thường.",
    "system": "utility",
    "icon": "core:core_097",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_098",
    "name": "Bộ Lọc Nhiễu",
    "description": "Nhận +15 Giáp và giảm 30% thời gian hiệu ứng bất lợi.",
    "system": "defense",
    "icon": "core:core_098",
    "category": "defense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_099",
    "name": "Kíp Phòng Thủ",
    "description": "Khi tài nguyên xuống dưới 15%, nhận Khiên bằng 10% HP tối đa trong 4 giây. Hồi nội tại 20 giây.",
    "system": "defense",
    "icon": "core:core_099",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_100",
    "name": "Cân Bằng Chiến Trường",
    "description": "Trên 70% Máu: +20 Hỏa Lực. Dưới 30% Máu: +20 Giáp. Từ 30% đến 70%: +8 Hỏa Lực và +8 Giáp.",
    "system": "utility",
    "icon": "core:core_100",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_101",
    "name": "Hỏa Lực Cự Ly Gần",
    "description": "Đòn bắn thường gây thêm 12% sát thương đạn thường ở cự ly gần — dưới 1/3 chiều cao vùng chiến đấu.",
    "system": "attack",
    "icon": "core:core_101",
    "category": "weapon",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_102",
    "name": "Hỏa Lực Cự Ly Xa",
    "description": "Đòn bắn thường gây thêm 6% sát thương đạn thường ở cự ly xa — trên 2/3 chiều cao vùng chiến đấu.",
    "system": "attack",
    "icon": "core:core_102",
    "category": "weapon",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_103",
    "name": "Bản Năng Sinh Tồn",
    "description": "Khi dưới 35% Máu, giảm 15% sát thương nhận từ kẻ địch.",
    "system": "defense",
    "icon": "core:core_103",
    "category": "defense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_104",
    "name": "Tràn trề",
    "description": "Lượng hồi Máu vượt quá Máu Tối Đa chuyển thành Khiên, tối đa bằng 12% Máu Tối Đa.",
    "system": "defense",
    "icon": "core:core_104",
    "category": "defense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_105",
    "name": "Bão Sét Bạo Kích",
    "description": "Nhận +25% Tỷ Lệ Chí Mạng. Đòn chí mạng phóng sét sang tối đa 3 mục tiêu khác, mỗi mục tiêu nhận 70% Hỏa Lực. Một mục tiêu chỉ có thể nhận sét mỗi 0,5 giây.",
    "system": "attack",
    "icon": "core:core_105",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_106",
    "name": "Tên lửa Tomahawk",
    "description": "Mỗi 2 giây phóng tối đa 3 Tomahawk, mỗi quả gây 160% Hỏa Lực.",
    "system": "attack",
    "icon": "core:core_106",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_107",
    "name": "Lướt Sát Tử Thần",
    "description": "Đạn địch lướt qua trong phạm vi 8px quanh hitbox mà không trúng được tính là 1 Graze. Mỗi 6 Graze hồi 10% Tài Nguyên Tối Đa.",
    "system": "resource",
    "icon": "core:core_107",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_108",
    "name": "Thu Gom Mảnh Vỡ",
    "description": "Kẻ địch bị hạ có 12% cơ hội rơi Scrap. Thu thập Scrap hồi 2,5% Máu Tối Đa. Scrap biến mất sau 4 giây.",
    "system": "defense",
    "icon": "core:core_108",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_109",
    "name": "Giáp Cánh",
    "description": "Mỗi cánh có hồi nội tại riêng 12 giây. Đòn đầu tiên trúng một cánh bị giảm 30% sát thương nhận vào tại cánh đó.",
    "system": "defense",
    "icon": "core:core_109",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_110",
    "name": "Giáp Chống Nổ",
    "description": "Giảm 25% sát thương nhận vào từ Bom, vụ nổ và vùng nổ diện rộng.",
    "system": "defense",
    "icon": "core:core_110",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_111",
    "name": "Đạn Siêu Âm",
    "description": "Đạn thường bay nhanh hơn 100% và gây thêm 4% sát thương đạn thường. Hitbox không đổi.",
    "system": "attack",
    "icon": "core:core_111",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_112",
    "name": "Lưới Giao Hỏa",
    "description": "Bắn trúng 2 mục tiêu khác nhau trong 0,75 giây tạo Lưới Giao Hỏa giữa chúng trong 2 giây. Kẻ địch khác chạm lưới nhận 120% Hỏa Lực, tối đa 1 lần mỗi lưới. Hai mục tiêu tạo lưới không nhận sát thương từ chính lưới. Lưới biến mất nếu một trong hai mục tiêu bị hạ.",
    "system": "attack",
    "icon": "core:core_112",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_113",
    "name": "Vay Nợ Tương Lai",
    "description": "Mỗi 18 giây, bạn có thể dùng ngay một kỹ năng đang hồi chiêu với 100% hiệu lực. Sau đó kỹ năng đó nhận thêm 50% Hồi Chiêu cơ bản như khoản nợ phải trả.",
    "system": "utility",
    "icon": "core:core_113",
    "category": "defense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_114",
    "name": "Nối Nhịp Hỏa Lực",
    "description": "Sau khi dùng kỹ năng, 3 phát bắn thường kế tiếp gây thêm 80% sát thương đạn thường.",
    "system": "attack",
    "icon": "core:core_114",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_115",
    "name": "Cô Lập Mục Tiêu",
    "description": "Nếu không có kẻ địch khác trong phạm vi 80px quanh mục tiêu, gây thêm 25% mọi sát thương lên mục tiêu đó. Với Boss, mức tăng là 10% mọi sát thương.",
    "system": "attack",
    "icon": "core:core_115",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_116",
    "name": "Comeback",
    "description": "Giảm 10% thời gian hiệu ứng bất lợi. Khi một hiệu ứng bất lợi kết thúc, gây thêm 25% mọi sát thương trong 4 giây. Hiệu ứng khác kết thúc làm mới thời gian.",
    "system": "utility",
    "icon": "core:core_116",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_117",
    "name": "Phát Đạn Khai Màn",
    "description": "Phát bắn thường đầu tiên trúng mỗi địch thường luôn chí mạng. Với Tinh Anh và Boss, quyền chí mạng này được làm mới sau 10 giây trên cùng mục tiêu.",
    "system": "attack",
    "icon": "core:core_117",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_118",
    "name": "Càng Đông Càng Vui",
    "description": "Gây thêm 1,5% mọi sát thương cho mỗi kẻ địch vượt quân số phe người chơi, tối đa 18% mọi sát thương.",
    "system": "attack",
    "icon": "core:core_118",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_119",
    "name": "Kéo Dãn Thời Gian",
    "description": "Dùng kỹ năng tạo Chrono Field bán kính 80px trong 4 giây, đi theo người chơi. Đạn thường của địch trong vùng giảm 45% tốc độ.",
    "system": "defense",
    "icon": "core:core_119",
    "category": "defense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_120",
    "name": "Đoạt Quyền Điều Khiển",
    "description": "Chiếm quyền tối đa 5 địch thường trong 10 giây hoặc 1 Tinh Anh trong 8 giây. Boss bị choáng 1,25 giây. Hồi nội tại 13 giây bắt đầu sau khi hiệu ứng kết thúc.",
    "system": "utility",
    "icon": "core:core_120",
    "category": "defense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_121",
    "name": "Kho Phản Vật Chất",
    "description": "Tích 60% sát thương dư khi hạ địch thường và 3% sát thương thực tế lên Tinh Anh/Boss vào kho, tối đa 500% Hỏa Lực. Dùng kỹ năng xả toàn bộ kho thành xung chấn toàn màn hình.",
    "system": "attack",
    "icon": "core:core_121",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
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
  "description": "Đánh dấu ngẫu nhiên một quái vật trong 4 giây. Mục tiêu bị đánh dấu chịu thêm 5% sát thương từ người chơi. Nếu tiêu diệt mục tiêu được đánh dấu trong thời gian này, nhận 1 phần thưởng vĩnh viễn ngẫu nhiên trong lượt chơi hiện tại. Hồi nội bộ 14 giây, bắt đầu sau khi hiệu ứng kết thúc hoặc mục tiêu bị tiêu diệt.",
  "system": "utility",
  "icon": "core:core_149",
  "category": "offense",
  "tiers": [
    "gold"
  ]
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
  "name": "Xuyên Sao",
  "description": "Tinh Đạn của Phản Quỹ Đạo bỏ qua 25% Giáp của mục tiêu.",
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
  "description": "Hồi Chiêu Phản Quỹ Đạo giảm từ 22 giây xuống 13 giây trước các hiệu ứng Giảm Hồi Chiêu khác.",
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
  "name": "Trục Ngắm Mở Rộng",
  "description": "Hành lang trúng đòn của Thương Tinh Tú rộng hơn 55% và tốc độ projectile tăng 35%.",
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
  "description": "Hồi Chiêu Sao Rơi giảm từ 34 giây xuống 23 giây trước các hiệu ứng Giảm Hồi Chiêu khác. Hồi Chiêu vẫn chỉ bắt đầu sau khi thiên thạch cuối cùng hoàn tất.",
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
  "name": "Kíp Nổ Trễ",
  "description": "Mỗi phát bắn thường thứ 8 trúng mục tiêu sẽ gắn một vi kíp. Sau 0,6 giây, vi kíp nổ gây sát thương tất cả mục tiêu bằng 45% Hỏa Lực trong bán kính 50px.",
  "system": "attack",
  "icon": "core:core_168",
  "category": "offense",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_169",
  "name": "Bộ Điều Áp",
  "description": "Khi Tài Nguyên trên 70%: +10 Hỏa Lực. Khi Tài Nguyên dưới 30%: +0,7 Hồi Máu mỗi giây. Khoảng 30–70% +0,2 tốc độ bắn.",
  "system": "utility",
  "icon": "core:core_169",
  "category": "weapon",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_170",
  "name": "Báo Động Sớm",
  "description": "Khi các đòn tấn công của địch đi vào phạm vi bán kính 70px quanh chiến cơ, nhận +18 Giáp trong 1,5 giây. Hồi chiêu 15 giây.",
  "system": "defense",
  "icon": "core:core_170",
  "category": "defense",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_171",
  "name": "Chốt An Toàn",
  "description": "Trong 1,5 giây sau khi dùng kỹ năng, đòn gây sát thương đầu tiên trúng người chơi bị giảm 25% sát thương nhận vào.",
  "system": "defense",
  "icon": "core:core_171",
  "category": "defense",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_172",
  "name": "Tụ Điện Trống",
  "description": "Giữ Tài Nguyên ở mức 100% liên tục 3 giây sẽ tích một lần Tụ Điện; kỹ năng kế tiếp tiêu hao Tụ Điện để hoàn lại 15% Tài Nguyên của kỹ năng đó.",
  "system": "resource",
  "icon": "core:core_172",
  "category": "resource",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_173",
  "name": "Dây Chằng Khẩn",
  "description": "Khi một lớp Lá chắn tạm thời bị phá hoặc tự hết hạn, hồi lại 2,5% Máu Tối Đa (chỉ áp dụng cho các lá chắn hấp thụ sát thương - Máu ảo)",
  "system": "defense",
  "icon": "core:core_173",
  "category": "defense",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_174",
  "name": "Đệm Xung",
  "description": "Khi mất trên 8% máu tối đa trong vòng 2 giây gần nhất, hồi lại 8% tài nguyên tối đa. Hồi chiêu 15 giây.",
  "system": "resource",
  "icon": "core:core_174",
  "category": "resource",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_175",
  "name": "Tần Số Xen Kẽ",
  "description": "Dùng một kỹ năng khác kỹ năng vừa dùng gần nhất trong vòng 5 giây sẽ cho +12% mọi sát thương trong 4 giây (kể cả bắn thường)",
  "system": "attack",
  "icon": "core:core_175",
  "category": "offense",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_176",
  "name": "Khoảng Thở",
  "description": "Khi không có hỏa lực địch hoặc kẻ địch trong phạm vi bán kính 100px quanh chiến cơ, hồi 0,75% Máu Tối Đa mỗi giây. Hiệu ứng dừng ngay khi hỏa lực địch hoặc kẻ địch tiến vào vùng.",
  "system": "defense",
  "icon": "core:core_176",
  "category": "defense",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_177",
  "name": "Vỏ Bọc Chống Điện",
  "description": "Giảm 25% sát thương nhận từ projectile tự dẫn, Beam và EMP.",
  "system": "defense",
  "icon": "core:core_177",
  "category": "defense",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_178",
  "name": "Phanh Từ",
  "description": "Mỗi 12 giây, projectile địch đầu tiên tiến vào phạm vi bán kính 40px quanh chiến cơ bị giảm 60% tốc độ trong 1,2 giây.",
  "system": "utility",
  "icon": "core:core_178",
  "category": "weapon",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_179",
  "name": "Bộ Hiệu Chỉnh Sai Số",
  "description": "Mỗi đòn bắn thường không chí mạng cho 1 cộng dồn Sai Số, mỗi cộng dồn tăng +2% Tỷ Lệ Chí Mạng, lên tới tối đa 10 cộng dồn. Khi một phát bắn thường gây chí mạng, mất toàn bộ cộng dồn Sai Số và sẽ tích lại từ đầu.",
  "system": "attack",
  "icon": "core:core_179",
  "category": "offense",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_180",
  "name": "Phá Khiên",
  "description": "Đạn thường gây thêm 18% sát thương đạn thường lên Lá Chắn của kẻ địch. Khi mục tiêu bị người chơi phá vỡ lá chắn, mục tiêu chịu thêm 8% sát thương từ đạn thường trong 3 giây.",
  "system": "attack",
  "icon": "core:core_180",
  "category": "offense",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_181",
  "name": "Van Xả Kỹ Năng",
  "description": "Sau khi hiệu lực chính của một kỹ năng kết thúc, nhận +25% Hồi Tài Nguyên trong 3 giây.",
  "system": "resource",
  "icon": "core:core_181",
  "category": "resource",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_182",
  "name": "Pin Dự Phòng",
  "description": "Khi Tài Nguyên tụt xuống dưới 20%, hồi dần 20% Tài Nguyên Tối Đa trong 4 giây. Hồi chiêu 18 giây sau khi kết thúc hiệu ứng",
  "system": "resource",
  "icon": "core:core_182",
  "category": "resource",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_183",
  "name": "Giáp Độ Sâu",
  "description": "Nhận +20 Giáp cho mỗi loại hiệu ứng bất lợi đang hoạt động trên người chơi, tối đa +40 Giáp.",
  "system": "defense",
  "icon": "core:core_183",
  "category": "defense",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_184",
  "name": "Bảo Hộ Linh Hồn",
  "description": "Sau khi hồi đủ 18 giây, đòn tấn công hoặc hiệu ứng khống chế kế tiếp trúng chiến cơ bị vô hiệu hoàn toàn và kích hoạt Bảo Hộ Thiên Giới: miễn toàn bộ sát thương và hiệu ứng khống chế trong 2,5 giây. Hồi chiêu bắt đầu sau khi hiệu ứng kết thúc.",
  "system": "defense",
  "icon": "core:core_184",
  "category": "defense",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_185",
  "name": "Đánh Dấu Sơ Bộ",
  "description": "Phát đạn thường chính đầu tiên trúng một mục tiêu sẽ đánh dấu 4 giây; lần gây sát thương kỹ năng kế tiếp lên mục tiêu đó nhận +12% sát thương kỹ năng và tiêu dấu. Hồi chiêu mỗi mục tiêu 12s",
  "system": "attack",
  "icon": "core:core_185",
  "category": "offense",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_186",
  "name": "Hợp Lưu Hỏa Lực",
  "description": "Dùng 2 kỹ năng khác nhau trong vòng 4 giây sẽ cho +35% sát thương đạn thường trong 6 giây. Hồi chiêu 20s",
  "system": "attack",
  "icon": "core:core_186",
  "category": "offense",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_187",
  "name": "Tụ Năng Phản Chấn",
  "description": "Tích 20% sát thương thực tế đã nhận sau giảm trừ vào bộ tụ, tối đa bằng 120% Hỏa Lực. Kỹ năng gây sát thương kế tiếp cộng lượng đã tích vào lần gây sát thương đầu tiên rồi xóa kho.",
  "system": "attack",
  "icon": "core:core_187",
  "category": "offense",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_188",
  "name": "Nhắm vào yếu điểm",
  "description": "Nhận +15% tỷ lệ chí mạng",
  "system": "attack",
  "icon": "core:core_188",
  "category": "offense",
  "tiers": [
    "gold"
  ]
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
  "description": "Nhận +22% sát thương kỹ năng, nhưng mọi kỹ năng tiêu tốn thêm 15% Tài Nguyên.",
  "system": "attack",
  "icon": "core:core_190",
  "category": "offense",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_191",
  "name": "Hỏa Lực Luân Phiên",
  "description": "Hạ địch bằng đạn thường cho +20% sát thương kỹ năng kế tiếp trong 5 giây. Hạ địch bằng kỹ năng cho +20% sát thương đạn thường trong 4 giây. Hai trạng thái không cộng dồn.",
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
  "description": "Khi đang có lá chắn: +15% mọi sát thương. Khi không có lá chắn: +14 Giáp.",
  "system": "utility",
  "icon": "core:core_192",
  "category": "weapon",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_193",
  "name": "Nhịp Ba Kỹ Năng",
  "description": "Dùng đủ cả 3 kỹ năng khác nhau trong 7 giây sẽ giảm 3 giây hồi chiêu còn lại của cả 3 kỹ năng và cho +25% hồi phục tài nguyên trong 5 giây.",
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
  "description": "Nhận +10% tỷ lệ chí mạng. Đòn chí mạng lên mục tiêu đang bị giảm Giáp sẽ làm Sát Thương Chí Mạng lên chính mục tiêu đó tăng thêm 35% trong 4 giây.",
  "system": "attack",
  "icon": "core:core_194",
  "category": "offense",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_195",
  "name": "Hộp Đen Cứu Sinh",
  "description": "Nếu mất ít nhất 15% Máu Tối Đa trong 2 giây gần nhất, hồi dần 10% Máu Tối Đa trong 4 giây. Hồi chiêu 20s sau khi kết thúc hiệu ứng",
  "system": "defense",
  "icon": "core:core_195",
  "category": "defense",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_196",
  "name": "Dấu Son Bạo Kích",
  "description": "Mỗi kẻ địch bị hạ bởi một đòn chí mạng trực tiếp sẽ cho +2,5% Sát Thương Chí Mạng vĩnh viễn trong suốt lượt chơi, tối đa kiếm được +50% sát thương chí mạng.",
  "system": "attack",
  "icon": "core:core_196",
  "category": "offense",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_197",
  "name": "Chịu Đau",
  "description": "Chuyển hóa 25% sát thương đáng lẽ trừ trực tiếp vào Máu thành Sát Thương Trì Hoãn và trả dần mỗi giây trong 3 giây. Sát thương trả nợ không được xem là một lần nhận sát thương mới và không kích hoạt các proc “khi nhận/mất sát thương”. Mỗi 12 quái thường bị hạ, hoặc khi hạ 1 Tinh Anh/Boss, xóa toàn bộ Sát Thương Trì Hoãn đang còn và hồi 2% Máu Tối Đa.",
  "system": "utility",
  "icon": "core:core_197",
  "category": "weapon",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_198",
  "name": "Vệ Tinh Hộ Mệnh",
  "description": "Dùng kỹ năng tạo tối đa 3 mảnh vệ tinh bay quanh người chơi trong 4 giây. Mỗi mảnh chặn tối đa 1 projectile địch có thể chặn; nếu hết thời gian mà chưa chặn, mảnh đó bắn vào địch gần nhất gây 90% Hỏa Lực. Sử dụng tiếp kỹ năng khi vẫn còn vệ tinh thì sẽ làm mới thời gian hiệu lực chứ không tạo thêm vệ tinh.",
  "system": "utility",
  "icon": "core:core_198",
  "category": "weapon",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_199",
  "name": "Mạch Quá Tải",
  "description": "Mỗi lần dùng kỹ năng nhận 1 Overclock. Kỹ năng kế tiếp gây thêm 18% sát thương kỹ năng cho mỗi cộng dồn, tối đa 3. Khi dùng kỹ năng ở 3 cộng dồn, kỹ năng đó nhận +54% sát thương kỹ năng, đồng thời phát xung toàn màn hình gây 250% Hỏa Lực rồi reset Overclock.",
  "system": "attack",
  "icon": "core:core_199",
  "category": "offense",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_200",
  "name": "Tái Chế Lá Chắn",
  "description": "Tăng 50% sức mạnh của lá chắn, khi lá chắn bị phá hoặc hết hạn, phát nổ trên một vùng rộng bán kính 120px xung quanh chiến cơ, gây sát thương bằng 160% tổng lượng sát thương lớp lá chắn đó đã hấp thụ.",
  "system": "utility",
  "icon": "core:core_200",
  "category": "weapon",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_201",
  "name": "Cộng Hưởng Kho Vũ Khí",
  "description": "Mỗi Lõi Tấn Công khác nhau đang sở hữu cho +5% sát thương đạn thường (tối đa +30% sát thương đạn thường); mỗi Lõi Tài Nguyên cho +5% sát thương kỹ năng (tối đa +30% sát thương kỹ năng); mỗi Lõi Phòng Thủ cho +4% Giảm Sát Thương (tối đa 24% Giảm Sát Thương); mỗi Lõi Đa Dụng cho +2% sát thương đạn thường, +2% sát thương kỹ năng và +2% Giảm Sát Thương (tối đa +12% sát thương đạn thường, +12% sát thương kỹ năng và +12% Giảm Sát Thương). Lõi Kỹ Năng không được tính. Bản thân Cộng Hưởng Kho Vũ Khí được tính là 1 Lõi Đa Dụng.",
  "system": "utility",
  "icon": "core:core_201",
  "category": "weapon",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_202",
  "name": "Học Thuyết Một Mũi Nhọn",
  "description": "Sau khi nhận lõi, chọn 1 Kỹ năng để trở thành Kỹ Năng Chủ Lực tới hết lượt chơi, kỹ năng Chủ Lực sẽ được: +22% sát thương kỹ năng Chủ Lực, -15% chi phí Tài Nguyên và -15% Hồi Chiêu cơ bản",
  "system": "attack",
  "icon": "core:core_202",
  "category": "offense",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_203",
  "name": "Nhiễu Chủ Động",
  "description": "Thời lượng hiệu ứng bất lợi trên người chơi tăng thêm 20%. Đổi lại, chiến cơ giờ đây vẫn có thể bắn thường và sử dụng kỹ năng trong khi bị khống chế cứng (chỉ còn bị khoá di chuyển), đồng thời trong khi đang chịu ít nhất 1 hiệu ứng bất lợi, giảm 25% sát thương phải nhận và gây thêm 35% mọi sát thương cho đến khi hiệu ứng bất lợi kết thúc.",
  "system": "utility",
  "icon": "core:core_203",
  "category": "weapon",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_204",
  "name": "Khiên Hồi Quy",
  "description": "Khi lá chắn bị phá hoặc hết hiệu lực, nếu trong 2 giây tiếp theo người chơi không mất thêm Máu, tái tạo Khiên bằng 50% dung lượng ban đầu của lớp Khiên vừa vỡ. Tối đa tái tạo 1 lần với mỗi lần sử dụng.",
  "system": "defense",
  "icon": "core:core_204",
  "category": "defense",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_205",
  "name": "Dao 2 lưỡi",
  "description": "Tăng thêm 25% mọi sát thương gây ra nhưng đổi lại bạn sẽ chịu thêm 18% sát thương nhận vào",
  "system": "attack",
  "icon": "core:core_205",
  "category": "offense",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_206",
  "name": "Đạn Siêu Nặng",
  "description": "Đạn bắn thường chính gây thêm 70% sát thương đạn thường và xuyên thêm 1 mục tiêu, nhưng tổng Tốc Độ Bắn giảm 20% và tốc độ đạn bay giảm 30%.",
  "system": "attack",
  "icon": "core:core_206",
  "category": "offense",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_207",
  "name": "Pha Đối Nghịch",
  "description": "Nhận +25% tỷ lệ chí mạng. Đòn bắn thường chí mạng đánh dấu mục tiêu 5 giây bằng “Pha Kỹ Năng”; kỹ năng kế tiếp trúng mục tiêu tiêu dấu để gây thêm 45% sát thương kỹ năng. Một kỹ năng trúng mục tiêu không có Pha Kỹ Năng sẽ tạo “Pha Súng”; phát đạn thường chính kế tiếp tiêu dấu để gây thêm 45% sát thương đạn thường.",
  "system": "attack",
  "icon": "core:core_207",
  "category": "offense",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_208",
  "name": "Tế Bào Song Năng",
  "description": "Khi nhận thêm chỉ số Hồi Máu mỗi giây, nhận thêm Hồi Tài Nguyên mỗi giây bằng 60% lượng đó. Khi nhận thêm chỉ số Hồi Tài Nguyên mỗi giây, nhận thêm Hồi Máu mỗi giây bằng 60% lượng đó. Lượng bonus không cộng dồn qua lại với nhau.",
  "system": "resource",
  "icon": "core:core_208",
  "category": "resource",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_209",
  "name": "Chế Độ Tử Thủ",
  "description": "Khi Máu xuống dưới 35%, chiến cơ kích hoạt chế độ Tử Thủ: +150 Giáp, +40% Hồi Tài Nguyên và giảm 20% Hồi Chiêu, nhưng mọi sát thương gây ra giảm 15%. Chỉ rời trạng thái khi Máu vượt 35%.",
  "system": "utility",
  "icon": "core:core_209",
  "category": "weapon",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_210",
  "name": "Tự Sửa Đường Ngắm",
  "description": "Nếu 3 viên đạn bắn thường chính liên tiếp bay hết màn hình chơi mà không chạm bất kỳ mục tiêu nào, viên kế tiếp được tự chỉnh hướng nhẹ về mục tiêu gần nhất trong tối đa 0,45 giây đầu. Trúng hoặc hết 0,45 giây sẽ mất dẫn hướng.",
  "system": "attack",
  "icon": "core:core_210",
  "category": "offense",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_211",
  "name": "Bộ Lọc Reroll",
  "description": "Khi reroll một ô trong lựa chọn Lõi thường, lõi thay thế sẽ tránh cùng Hệ Lõi với lõi vừa bỏ nếu trong cùng Bậc còn lõi hợp lệ thuộc Hệ khác. Không thay đổi Bậc Lõi và không tác động lựa chọn Skill Core.",
  "system": "utility",
  "icon": "core:core_211",
  "category": "weapon",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_212",
  "name": "Phiếu Reroll Dự Phòng",
  "description": "Khi nhận lõi này, các lượt chọn Lõi thường (ngoại trừ Skill Core) kế tiếp có thêm đúng 1 lần Reroll Dự Phòng dùng cho một ô bất kỳ.",
  "system": "utility",
  "icon": "core:core_212",
  "category": "weapon",
  "tiers": [
    "gold"
  ]
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
  "description": "Mọi lượt chọn Lõi thường hiển thị 4 thẻ thay vì 3; thẻ lõi thứ 4 cũng có nút reroll như bình thường. Các mốc Skill Core vẫn hiển thị 3 thẻ và giữ logic reroll Skill Core hiện tại.",
  "system": "utility",
  "icon": "core:core_214",
  "category": "weapon",
  "tiers": [
    "diamond"
  ]
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
  "description": "Chuyển đổi tất cả Lõi Nâng Cấp thường người chơi đang sở hữu tại thời điểm kích hoạt thành các Lõi Kim Cương ngẫu nhiên, ngoại trừ Lõi Kỹ Năng, các Lõi Chuyển Đổi 050/051/052 và chính Hộp Pandora. Các Lõi thường từng nhận thông qua Lõi Chuyển Đổi vẫn là mục tiêu hợp lệ. Hiệu ứng của lõi cũ phải được tháo sạch; các giá trị vĩnh viễn đã thực sự kiếm được từ lõi cũ được bảo toàn.",
  "system": "utility",
  "icon": "core:core_216",
  "category": "weapon",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_217",
  "name": "Thao Túng Bậc Lõi",
  "description": "Tỷ lệ Bậc của các lượt chọn Lõi thường đổi từ 40% Bạc / 40% Vàng / 20% Kim Cương thành 25% Bạc / 40% Vàng / 35% Kim Cương. Mốc Skill Core 9/18/27 không đổi.",
  "system": "utility",
  "icon": "core:core_217",
  "category": "weapon",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_218",
  "name": "Bảo Toàn Cơ Hội",
  "description": "Khi một lượt chọn Lõi thường kết thúc, mỗi reroll chính theo ô chưa dùng sẽ chuyển thành 1 Reroll Dự Trữ. Nếu sở hữu Phiếu Reroll Dự Phòng, reroll phụ chưa dùng của lượt đó cũng chuyển thành 1 Reroll Dự Trữ. Kho tối đa 3, hoặc tối đa 4 khi đồng thời sở hữu Phiếu Reroll Dự Phòng. Reroll Dự Trữ chỉ sinh ra và sử dụng trong lựa chọn Lõi thường.",
  "system": "utility",
  "icon": "core:core_218",
  "category": "weapon",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_219",
  "name": "Nòng Súng Đỏ Rực",
  "description": "Mỗi kỹ năng cast tạo 25 Nhiệt; kỹ năng dạng bật/tắt đang hoạt động tạo 2,5 Nhiệt mỗi giây; mỗi phát bắn thường tạo 0,025 Nhiệt. Nếu không có kỹ năng nào hoạt động trong 10 giây kể từ lần kết thúc kỹ năng gần nhất, Nhiệt giảm 15/giây. Ở 50–99 Nhiệt, gây thêm 20% mọi sát thương. Chạm 100 Nhiệt gây Quá Nhiệt 3 giây: ngừng bắn thường, không thể dùng kỹ năng, tắt ngay kỹ năng đang hoạt động và Nhiệt giảm dần về 0 trong đúng 3 giây.",
  "system": "attack",
  "icon": "core:core_219",
  "category": "offense",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_220",
  "name": "Bóng Sống Ngắn",
  "description": "Mỗi 10 giây, kỹ năng cast tiếp theo để lại một Bóng của Chiến Cơ tại vị trí cast trong 3 giây. Bóng ưu tiên mục tiêu hiện tại của chiến cơ chính, tự quay theo mục tiêu và bắn theo Tốc Độ Bắn effective hiện tại của chiến cơ chính. Mỗi viên gây 35% Hỏa Lực, không chí mạng, không kích hoạt bất kỳ hiệu ứng Lõi khác, không sao chép kỹ năng, không bị target và không chặn đòn.",
  "system": "attack",
  "icon": "core:core_220",
  "category": "offense",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_221",
  "name": "Dấu Ấn Tử Thần",
  "description": "Mỗi 20 giây, đánh dấu một mục tiêu trong 3 giây. Khi hết thời gian, dấu nổ gây raw damage bằng 120% Hỏa Lực + 45% tổng sát thương thực tế mục tiêu đã nhận trong thời gian dấu tồn tại. Nếu damage nổ sau khi tính Giáp và các lớp hấp thụ hiện hành đủ hạ mục tiêu thì nổ ngay, đồng thời cooldown kế tiếp của lõi giảm 50%. Cooldown bắt đầu khi dấu kết thúc/nổ.",
  "system": "attack",
  "icon": "core:core_221",
  "category": "offense",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_222",
  "name": "Nâng Cấp Bất Ổn",
  "description": "Roll ngay khi nhận và mỗi 60 giây, độc lập 50/50. Thu Nhỏ: -50% kích thước và hitbox, +25 điểm phần trăm Giảm Hồi Chiêu (vẫn cap 80%), +50% Hồi Tài Nguyên/s. Khổng Lồ: +50% kích thước và hitbox, +30% Máu Tối Đa, +30% Hỏa Lực. Roll cùng trạng thái không cộng dồn lại; đổi trạng thái phải gỡ sạch bonus cũ trước khi áp bonus mới.",
  "system": "utility",
  "icon": "core:core_222",
  "category": "weapon",
  "tiers": [
    "diamond"
  ]
},
{
  "id": "core_223",
  "name": "Mảnh Ghép May Mắn",
  "description": "Nhận 1 trang bị thành phần ngẫu nhiên",
  "system": "utility",
  "icon": "core:core_223",
  "category": "weapon",
  "tiers": [
    "silver"
  ]
},
{
  "id": "core_224",
  "name": "Thích Chơi Xác Suất",
  "description": "Tăng xác suất quái vật rơi ra trang bị thành phần khi bị tiêu diệt từ 2% lên 3%. Quái Tinh Anh tiêu diệt thứ 2 trở đi trong wave tăng xác suất rơi trang bị thành phần từ 20% lên 30%.",
  "system": "utility",
  "icon": "core:core_224",
  "category": "weapon",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_225",
  "name": "Ăn Chắc Mặc Bền",
  "description": "Nhận 1 trang bị hoàn chỉnh ngẫu nhiên",
  "system": "utility",
  "icon": "core:core_225",
  "category": "weapon",
  "tiers": [
    "gold"
  ]
},
{
  "id": "core_226",
  "name": "Rương Báu Vật",
  "description": "Nhận 1 trang Bị Huyền Thoại ngẫu nhiên",
  "system": "utility",
  "icon": "core:core_226",
  "category": "weapon",
  "tiers": [
    "diamond"
  ]
}
];
