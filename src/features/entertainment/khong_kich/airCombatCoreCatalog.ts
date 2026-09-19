import { SKILL_CORE_DESCRIPTIONS } from "./airCombatSkillCores";
import type { CoreDefinition } from "./airCombatTypes";

// Canonical Appendix B, workbook row numbers are stable run-local identifiers.
export const CORE_DEFINITIONS: readonly CoreDefinition[] = [
  {
    "id": "core_001",
    "name": "Đạn hạng nhẹ",
    "description": "Nhận +12 Hỏa Lực.",
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Chung",
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
    "system": "Viper · Skill 1",
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
    "system": "Viper · Skill 1",
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
    "description": "Sau đợt Mồi Bẫy cuối cùng, gây thêm 30% sát thương trong 5 giây.",
    "system": "Viper · Skill 1",
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
    "system": "Viper · Skill 2",
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
    "description": "Điên Cuồng nhận thêm +35% Tốc Độ Bắn, nâng tổng hiệu ứng lên +75%.",
    "system": "Viper · Skill 2",
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
    "system": "Viper · Skill 2",
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
    "system": "Viper · Skill 3",
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
    "system": "Viper · Skill 3",
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
    "system": "Viper · Skill 3",
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
    "system": "Titan · Skill 1",
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
    "system": "Titan · Skill 1",
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
    "system": "Titan · Skill 1",
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
    "system": "Titan · Skill 2",
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
    "system": "Titan · Skill 2",
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
    "system": "Titan · Skill 2",
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
    "system": "Titan · Skill 3",
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
    "system": "Titan · Skill 3",
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
    "system": "Titan · Skill 3",
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
    "system": "Phantom · Skill 1",
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
    "system": "Phantom · Skill 1",
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
    "system": "Phantom · Skill 1",
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
    "system": "Phantom · Skill 2",
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
    "description": "Giảm thời gian tụ Laser 1,8 giây → từ 2s → 0,2s, đồng thời laser gây thêm 10% sát thương",
    "system": "Phantom · Skill 2",
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
    "system": "Phantom · Skill 2",
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
    "system": "Phantom · Skill 3",
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
    "system": "Phantom · Skill 3",
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
    "system": "Phantom · Skill 3",
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
    "system": "Khủng Long Cộng Dồn",
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
    "system": "Khủng Long Cộng Dồn",
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
    "system": "Khủng Long Cộng Dồn",
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
    "system": "Đặc Biệt",
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
    "system": "Tay Bạc",
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
    "system": "Tay Bạc",
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
    "system": "Tay Bạc",
    "icon": "core:core_052",
    "category": "resource",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_053",
    "name": "Găng bảo thạch",
    "description": "Nhận +25% Tỷ Lệ Chí Mạng. Kỹ năng của bạn có thể chí mạng.",
    "system": "Đặc Biệt",
    "icon": "core:core_053",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_054",
    "name": "Chậm mà chắc",
    "description": "Khóa Tốc Độ Bắn ở 1,2/s. Mỗi 0,1 Tốc Độ Bắn vượt giới hạn chuyển thành +8 Hỏa Lực.",
    "system": "Đặc biệt",
    "icon": "core:core_054",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_055",
    "name": "Kính ngắm chiến trường",
    "description": "+8% Crit Chance",
    "system": "Chí Mạng",
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
    "system": "Chí Mạng",
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
    "system": "Xuyên Giáp",
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
    "system": "Xuyên Giáp",
    "icon": "core:core_058",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_059",
    "name": "Phát bắn tích điện",
    "description": "Mỗi phát bắn thường thứ 10 gây 180% sát thương.",
    "system": "Vũ Khí",
    "icon": "core:core_059",
    "category": "weapon",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_060",
    "name": "Nòng súng ổn định",
    "description": "Sau 4 giây không nhận sát thương, đòn bắn thường gây thêm 15% sát thương. Hiệu ứng mất khi bạn nhận sát thương.",
    "system": "Vũ Khí",
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
    "system": "Phản Kích",
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
    "system": "Sinh Tồn",
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
    "system": "Sinh Tồn",
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
    "system": "Hồi Phục",
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
    "system": "Phòng Thủ",
    "icon": "core:core_065",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_066",
    "name": "Combo săn mồi",
    "description": "Hạ gục liên tiếp cách nhau không quá 3 giây tăng 2,5% sát thương mỗi cộng dồn, tối đa 5 (12,5%). Mất toàn bộ khi quá 3 giây không hạ gục.",
    "system": "Combo",
    "icon": "core:core_066",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_067",
    "name": "Đánh dấu Tinh Anh",
    "description": "Gây thêm 8% sát thương lên Tinh Anh và Boss.",
    "system": "Săn Boss",
    "icon": "core:core_067",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_068",
    "name": "Kết liễu gọn",
    "description": "Gây thêm 12% sát thương lên mục tiêu dưới 25% Máu.",
    "system": "Kết Liễu",
    "icon": "core:core_068",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_069",
    "name": "Phủ đầu",
    "description": "Gây thêm 12% sát thương lên mục tiêu trên 70% Máu.",
    "system": "Hỏa Lực",
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
    "system": "Kỹ Năng Chung",
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
    "system": "Kỹ Năng Chung",
    "icon": "core:core_071",
    "category": "resource",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_072",
    "name": "Thép lạnh",
    "description": "Sau 5 giây không nhận sát thương, đòn đánh kế tiếp trúng bạn gây ít hơn 40% sát thương. Sau đó hiệu ứng bắt đầu tích lại.",
    "system": "Phòng Thủ",
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
    "system": "Vũ khí",
    "icon": "core:core_073",
    "category": "weapon",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_074",
    "name": "Bạo Kích Hồi Tiếp",
    "description": "Mỗi đòn chí mạng giảm 0,1 giây hồi chiêu của cả 3 kỹ năng, tối đa 1 giây mỗi giây.",
    "system": "Chí mạng",
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
    "system": "Combo",
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
    "system": "Phòng thủ",
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
    "system": "Sinh tồn",
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
    "system": "Tài nguyên",
    "icon": "core:core_078",
    "category": "resource",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_079",
    "name": "Tam Liên Pháo",
    "description": "Mỗi phát bắn thường thứ 3 tạo thêm một viên đạn phụ gây 40% sát thương, viên đạn này sẽ có đường bay độc lập và tự nhắm vào mục tiêu gần nhất (không khóa mục tiêu)",
    "system": "Vũ khí",
    "icon": "core:core_079",
    "category": "weapon",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_080",
    "name": "Dội Xạ Chiến Thuật",
    "description": "Đạn thường có 30% cơ hội nảy sang một mục tiêu khác, gây 40% sát thương.",
    "system": "Vũ khí",
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
    "system": "Kỹ năng",
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
    "system": "Vũ khí",
    "icon": "core:core_082",
    "category": "weapon",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_083",
    "name": "Phản Công Tức Thời",
    "description": "Sau khi nhận sát thương, những phát bắn thường tiếp theo trong vòng 4 giây gây thêm 20% sát thương. Hồi nội bộ 9 giây (bắt đầu hồi chiêu sau khi kết thúc hiệu ứng).",
    "system": "Phản kích",
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
    "system": "Kỹ năng",
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
    "system": "Đặc Biệt",
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
    "system": "Tài nguyên",
    "icon": "core:core_086",
    "category": "resource",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_087",
    "name": "Mắt thần chiến trường",
    "description": "+20% Crit Chance, +40% Crit Damage",
    "system": "Chí Mạng",
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
    "system": "Xuyên Giáp",
    "icon": "core:core_088",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_089",
    "name": "Đạn xuyên vô tận",
    "description": "Đạn thường xuyên thêm tối đa 3 mục tiêu, lần lượt gây 70% / 50% / 30% sát thương.",
    "system": "Vũ Khí",
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
    "system": "Sinh Tồn",
    "icon": "core:core_090",
    "category": "defense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_091",
    "name": "Không khuất phục",
    "description": "Mỗi 2% Máu đã mất tăng 1% sát thương, tối đa +40%.",
    "system": "Sinh Tồn",
    "icon": "core:core_091",
    "category": "defense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_092",
    "name": "Bộ tái tạo sinh học",
    "description": "Sau 5 giây không nhận sát thương, hồi 0,8% Máu Tối Đa mỗi giây. Hiệu ứng tiếp tục hoạt động khi đã đầy Máu.",
    "system": "Hồi Phục",
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
    "system": "Kỹ Năng Chung",
    "icon": "core:core_093",
    "category": "resource",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_094",
    "name": "Khế Ước Quỷ Quyệt",
    "description": "Mất 35% Máu Tối Đa để nhận +40% Hỏa Lực và +10% Tỷ Lệ Chí Mạng.",
    "system": "Đặc Biệt",
    "icon": "core:core_094",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_095",
    "name": "Nghịch Lý Bạo Kích",
    "description": "Khóa Tỷ Lệ Chí Mạng ở 25%; nhận +140% Sát Thương Chí Mạng.",
    "system": "Đặc Biệt",
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
    "system": "Đặc Biệt",
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
    "system": "Đặc Biệt",
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
    "system": "Kháng Hiệu Ứng",
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
    "system": "Sinh Tồn",
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
    "system": "Thích Ứng",
    "icon": "core:core_100",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_101",
    "name": "Hỏa Lực Cự Ly Gần",
    "description": "Đòn bắn thường gây thêm 12% sát thương ở cự ly gần — dưới 1/3 chiều cao vùng chiến đấu.",
    "system": "Vũ Khí",
    "icon": "core:core_101",
    "category": "weapon",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_102",
    "name": "Hỏa Lực Cự Ly Xa",
    "description": "Đòn bắn thường gây thêm 6% sát thương ở cự ly xa — trên 2/3 chiều cao vùng chiến đấu.",
    "system": "Vũ Khí",
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
    "system": "Sinh Tồn",
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
    "system": "Sinh Tồn",
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
    "system": "Chí Mạng",
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
    "system": "Hỏa Lực Tự Động",
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
    "system": "Chiến Thuật",
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
    "system": "Chiến Thuật",
    "icon": "core:core_108",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_109",
    "name": "Giáp Cánh",
    "description": "Mỗi cánh có hồi nội tại riêng 12 giây. Đòn đầu tiên trúng một cánh gây ít hơn 30% sát thương.",
    "system": "Chiến Thuật",
    "icon": "core:core_109",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_110",
    "name": "Giáp Chống Nổ",
    "description": "Giảm 25% sát thương từ Bom, vụ nổ và vùng nổ diện rộng.",
    "system": "Chiến Thuật",
    "icon": "core:core_110",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_111",
    "name": "Đạn Siêu Âm",
    "description": "Đạn thường bay nhanh hơn 100% và gây thêm 4% sát thương. Hitbox không đổi.",
    "system": "Chiến Thuật",
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
    "system": "Chiến Thuật",
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
    "system": "Chiến Thuật",
    "icon": "core:core_113",
    "category": "defense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_114",
    "name": "Nối Nhịp Hỏa Lực",
    "description": "Sau khi dùng kỹ năng, 3 phát bắn thường kế tiếp gây thêm 80% sát thương.",
    "system": "Chiến Thuật",
    "icon": "core:core_114",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_115",
    "name": "Cô Lập Mục Tiêu",
    "description": "Nếu không có kẻ địch khác trong phạm vi 80px quanh mục tiêu, gây thêm 25% sát thương lên mục tiêu đó. Với Boss, mức tăng là 10%.",
    "system": "Chiến Thuật",
    "icon": "core:core_115",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_116",
    "name": "Comeback",
    "description": "Giảm 10% thời gian hiệu ứng bất lợi. Khi một hiệu ứng bất lợi kết thúc, gây thêm 25% sát thương trong 4 giây. Hiệu ứng khác kết thúc làm mới thời gian.",
    "system": "Chiến Thuật",
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
    "system": "Chiến Thuật",
    "icon": "core:core_117",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_118",
    "name": "Càng Đông Càng Vui",
    "description": "Gây thêm 1,5% sát thương cho mỗi kẻ địch vượt quân số phe người chơi, tối đa 18%.",
    "system": "Chiến Thuật",
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
    "system": "Chiến Thuật",
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
    "system": "Chiến Thuật",
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
    "system": "Chiến Thuật",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Đặc Biệt",
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
  "system": "Kỹ Năng",
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
  "description": "Tinh Đạn của Phản Quỹ Đạo gây 45% Hỏa Lực thay vì 30%.",
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "description": "Nếu Phản Quỹ Đạo giải phóng ít nhất 1 Tinh Đạn, các phát bắn thường của Astra gây thêm 60% sát thương trong 5 giây sau khi kỹ năng kết thúc.",
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "name": "Vệt Sao Đôi",
  "description": "Sau phát Thương Tinh Tú chính 0,35 giây, một Vệt Sao lặp lại đúng quỹ đạo cũ và gây 25% sát thương của phát chính. Vệt Sao không tốn Mana, không tăng stack và không làm mới cửa sổ chuỗi 15 giây.",
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "description": "Mỗi thiên thạch của Sao Rơi gây 265% Hỏa Lực thay vì 210%.",
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
  "system": "Kỹ Năng",
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
];
