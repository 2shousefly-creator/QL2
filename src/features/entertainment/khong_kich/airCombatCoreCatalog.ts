import type { CoreDefinition } from "./airCombatTypes";

// Canonical Appendix B, workbook row numbers are stable run-local identifiers.
export const CORE_DEFINITIONS: readonly CoreDefinition[] = [
  {
    "id": "core_001",
    "name": "Đạn hạng nhẹ",
    "description": "+12 Hỏa lực.",
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
    "description": "+12 Giáp.",
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
    "description": "+0,15 Tốc độ bắn.",
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
    "description": "+110 HP tối đa.",
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
    "description": "+0,7 HP hồi/s.",
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
    "description": "Giảm 4% thời gian hồi chiêu.",
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
    "description": "+20 Hỏa lực.",
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
    "description": "+20 Giáp.",
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
    "description": "+0,4 Tốc độ bắn.",
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
    "description": "+220 HP tối đa.",
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
    "description": "+1,7 HP hồi/s.",
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
    "description": "Giảm 9% thời gian hồi chiêu.",
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
    "description": "+50 Hỏa lực.",
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
    "description": "+50 Giáp.",
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
    "description": "+1 Tốc độ bắn.",
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
    "description": "+420 HP tối đa.",
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
    "description": "+4 HP hồi/s.",
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
    "description": "Giảm 20% thời gian hồi chiêu.",
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
    "description": "Mồi Bẫy: +1 đợt phóng; +1s hút mục tiêu sau khi pháo sáng bung (2,5s).",
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
    "description": "Mồi Bẫy: -13s hồi chiêu.",
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
    "description": "Phóng xong đợt mồi cuối: +20% sát thương trong 4s.",
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
    "description": "Điên Cuồng: +3s duy trì.",
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
    "description": "Điên Cuồng: +35% Tốc độ bắn.",
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
    "description": "Điên Cuồng: miễn nhiễm khống chế trong thời gian hiệu lực.",
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
    "description": "Tên lửa Bầy Đàn: +6 tên lửa (tổng 18).",
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
    "description": "Tên lửa Bầy Đàn: +50% Hỏa lực mỗi tên lửa.",
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
    "description": "Tên lửa gây đốt: 70% Hỏa lực/s và -30% Giáp mục tiêu trong 5s. Trúng tiếp làm mới thời gian.",
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
    "description": "Khiên Năng Lượng: +25% giảm sát thương.",
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
    "description": "Khiên Năng Lượng: +3s duy trì.",
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
    "description": "Khiên Năng Lượng kết thúc: +50% Giáp trong 5s.",
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
    "description": "BigBang: -13s hồi chiêu.",
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
    "description": "BigBang: +500% Hỏa lực.",
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
    "description": "BigBang phát nổ: choáng mọi mục tiêu trong 4s.",
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
    "description": "Oanh Tạc: +20% Hỏa lực mỗi viên đạn.",
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
    "description": "Oanh Tạc: +35% Giáp khi đang bật.",
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
    "description": "Oanh Tạc: +2 tia (tổng 7 tia/đợt).",
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
    "description": "Phản Ảnh: +1,5s tàng hình và phân thân.",
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
    "description": "Phản Ảnh: hồi dần 18% HP đã mất tại lúc kích hoạt trong suốt thời gian tàng hình.",
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
    "description": "Phản Ảnh: -15 Điện tiêu hao.",
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
    "description": "Laser Hủy Diệt: +1s bắn.",
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
    "description": "Laser Hủy Diệt: -1,5s tụ năng lượng.",
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
    "description": "Laser Hủy Diệt: -25 Điện tiêu hao.",
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
    "description": "HawkEye: -1 Điện tiêu hao/s.",
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
    "description": "Sau mỗi 8s: HawkEye +100%, Phantom +30% Tốc độ bắn trong 3s. Đếm lại khi hiệu ứng hết.",
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
    "description": "HawkEye: +15% sức mạnh kế thừa.",
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
    "description": "Hạ địch: +0,4 Hỏa lực trong lượt. Hạ Tinh Anh/Boss nhận gấp 5.",
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
    "description": "Hạ địch: +0,3 Giáp trong lượt. Hạ Tinh Anh/Boss nhận gấp 5.",
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
    "description": "Hạ địch: +3 HP tối đa trong lượt. Hạ Tinh Anh/Boss nhận gấp 5.",
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
    "description": "Đứng yên 3s: +80% Giáp, +40% Hỏa lực. Di chuyển sẽ mất hiệu ứng.",
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
    "description": "Nhận 1 lõi Vàng ngẫu nhiên.",
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
    "description": "Nhận 1 lõi Kim Cương ngẫu nhiên.",
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
    "description": "Nhận 2 lõi ngẫu nhiên.",
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
    "description": "+25% Tỷ lệ chí mạng. Kỹ năng có thể chí mạng.",
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
    "description": "Khóa Tốc độ bắn ở 1,2. Mỗi 0,1 Tốc độ bắn dư chuyển thành +15 Hỏa lực.",
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
    "description": "+5% Tỷ lệ chí mạng.",
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
    "description": "+10% Sát thương chí mạng.",
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
    "description": "Mọi sát thương bỏ qua 5% Giáp mục tiêu.",
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
    "description": "Trúng cùng mục tiêu 5 lần: -8% Giáp trong 4s. Trúng tiếp làm mới thời gian.",
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
    "description": "Mỗi phát bắn thường thứ 10: gây 180% sát thương.",
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
    "description": "Không trúng đòn 4s: +15% sát thương bắn thường. Mất khi nhận sát thương.",
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
    "description": "Nhận sát thương: +15 Giáp trong 4s. Hồi nội tại 12s.",
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
    "description": "Dưới 20% HP: hồi 0,5% HP tối đa/s, dừng khi đạt 20%.",
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
    "description": "Dưới 35% HP: +20 Hỏa lực, +20 Giáp.",
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
    "description": "Mỗi 10 mạng: hồi 2% HP tối đa.",
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
    "description": "Giảm 20% sát thương va chạm với địch.",
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
    "description": "Hạ địch trong 3s từ mạng trước: +2% sát thương, tối đa 5 cộng dồn. Không hạ địch 3s: mất hết.",
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
    "description": "+6% sát thương lên Tinh Anh và Boss.",
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
    "description": "+8% sát thương lên địch dưới 25% HP.",
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
    "description": "+10% sát thương lên địch trên 70% HP.",
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
    "description": "Mỗi 8 mạng: -0,5s hồi chiêu còn lại của mọi kỹ năng đang hồi.",
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
    "description": "Dùng kỹ năng: +0,15 Tốc độ bắn trong 4s.",
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
    "description": "Không nhận sát thương 5s: giảm 40% sát thương đòn nhận tiếp theo, rồi đếm lại.",
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
    "description": "Hạ địch: phát nổ gây 20% Hỏa lực lên mục tiêu xung quanh.",
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
    "description": "Chí mạng: -0,1s hồi chiêu cả 3 kỹ năng; tối đa giảm 1s mỗi giây.",
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
    "description": "Mỗi 5 mạng: +3% Hỏa lực, tối đa 5 cộng dồn. Trúng đòn mất 1 cộng dồn.",
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
    "description": "Nhận đòn trên 10% HP tối đa: khiên 12% HP tối đa trong 3s. Hồi nội tại 10s.",
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
    "description": "Hạ Tinh Anh: hồi 18% HP tối đa, -4s hồi chiêu mọi kỹ năng.",
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
    "description": "Hạ 5 địch trong 4s: +35% hồi tài nguyên trong 6s.",
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
    "description": "Mỗi phát bắn thường thứ 3: thêm 1 đạn phụ gây 40% sát thương.",
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
    "description": "Đạn thường có 30% cơ hội nảy sang 1 mục tiêu khác, gây 40% sát thương.",
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
    "description": "Dùng kỹ năng: khiên 8% HP tối đa trong 3s. Hồi nội tại 6s.",
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
    "description": "Không trúng đòn 4s: +20% Tốc độ bắn. Mất khi trúng đòn.",
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
    "description": "Nhận sát thương: 3 phát thường tiếp theo +20% sát thương. Hồi nội tại 6s.",
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
    "description": "Mỗi lần dùng kỹ năng thứ 4: miễn tài nguyên, nhưng +20% hồi chiêu lần đó.",
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
    "description": "+35 Hỏa lực; -18 Giáp.",
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
    "description": "-35% tài nguyên tối đa; +70% hồi tài nguyên.",
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
    "description": "+20% Tỷ lệ chí mạng; +30% Sát thương chí mạng.",
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
    "description": "Mọi sát thương bỏ qua 25% Giáp mục tiêu.",
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
    "description": "Đạn thường xuyên thêm tối đa 3 mục tiêu, gây lần lượt 70%, 50%, 30% sát thương.",
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
    "description": "Một lần/lượt: đòn chí tử để lại 1 HP; miễn sát thương 2s và hồi 35% HP tối đa.",
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
    "description": "Mỗi 2% HP đã mất: +1% sát thương, tối đa +40%.",
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
    "description": "Sau 5s không nhận sát thương: hồi 0,8% HP tối đa/s.",
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
    "description": "Dùng kỹ năng: giảm hồi chiêu còn lại của 2 kỹ năng kia bằng 15% hồi chiêu cơ bản.",
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
    "description": "-35% HP tối đa; +40% Hỏa lực; +10% Tỷ lệ chí mạng.",
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
    "description": "Khóa Tỷ lệ chí mạng ở 25%; +300% Sát thương chí mạng (170% thành 470%).",
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
    "description": "Dùng kỹ năng mất 6% HP hiện tại; +40% giảm hồi chiêu.",
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
    "description": "Khóa cả 3 kỹ năng; +60% Hỏa lực, +40% HP tối đa, +40% Giáp.",
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
    "description": "Giảm 25% thời gian hiệu ứng bất lợi tác động lên chiến cơ.",
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
    "description": "Tài nguyên dưới 10%: khiên 8% HP tối đa trong 4s. Hồi nội tại 20s.",
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
    "description": "HP trên 70%: +20 Hỏa lực. HP dưới 30%: +20 Giáp. Không cùng hiệu lực.",
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
    "description": "Bắn thường: +12% sát thương khi khoảng cách hai tâm nhỏ hơn 1/3 chiều cao vùng chơi.",
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
    "description": "Bắn thường: +12% sát thương khi khoảng cách hai tâm lớn hơn 2/3 chiều cao vùng chơi.",
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
    "description": "HP dưới 30%: giảm 12% sát thương đạn địch.",
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
    "description": "Hồi HP dư chuyển thành khiên, tối đa 12% HP tối đa.",
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
    "description": "+15% Tỷ lệ chí mạng. Chí mạng: sét lan tối đa 3 mục tiêu khác, gây 70% Hỏa lực/mục tiêu. Mỗi mục tiêu nhận sét tối đa 1 lần/0,5s.",
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
    "description": "Mỗi 1,5s: phóng tối đa 3 Tomahawk. Mỗi quả gây 195% Hỏa lực.",
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
    "description": "Đạn địch đi sát hitbox trong phạm vi 8px nhưng không trúng được tính 1 Graze. Mỗi 6 Graze hồi 10% tài nguyên tối đa.",
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
    "description": "Kẻ địch bị hạ có 6% rơi Scrap tại vị trí mục tiêu, bay chạm Scrap hồi 1.25% HP tối đa. Scrap mất sau 4s.",
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
    "description": "Mỗi bên cánh có cooldown riêng 12s. Đòn đầu tiên trúng một cánh được giảm 30% sát thương.",
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
    "description": "Giảm 15% sát thương nhận vào từ Bomb, Explosion và các AoE nổ.",
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
    "description": "Đạn thường bay nhanh hơn 100% (Không tăng damage/hitbox).",
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
    "description": "Bắn trúng 2 mục tiêu khác nhau trong 0.75s tạo một đường năng lượng nối hai mục tiêu trong 1.5s. Địch khác chạm đường nhận 90% Hỏa lực, tối đa 1 lần/lưới. Hai mục tiêu tạo lưới không nhận sát thương từ chính lưới. Nếu một trong hai mục tiêu chết, lưới biến mất ngay.",
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
    "description": "Mỗi 18s, kỹ năng đang hồi chiêu có thể được dùng ngay ở 100% hiệu lực. Sau đó kỹ năng đó nhận thêm 50% hồi chiêu cơ bản như trả nợ.",
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
    "description": "Nếu không có enemy khác trong phạm vi 80px quanh mục tiêu, mọi sát thương lên nó +25%. Riêng Boss chỉ chịu thêm 10% sát thương.",
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
    "description": "Sau khi một hiệu ứng bất lợi trên Player kết thúc: +25% sát thương trong 4s. Nếu có thêm hiệu ứng bất lợi kết thúc trong thời gian này, làm mới thời gian.",
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
    "description": "Phát bắn thường đầu tiên trúng mỗi enemy luôn gây chí mạng.",
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
    "description": "Gây thêm 1.5% sát thương với mỗi quái vật xuất hiện nhiều hơn phe người chơi.",
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
    "description": "Dùng kỹ năng tạo Chrono Field bán kính 55px trong 3s tại vị trí cast. Đạn thường của địch đi vào bị chậm 40%.",
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
    "description": "Mỗi 20s, hack quái vật có % HP cao nhất trong 5s. Quái bị hack đổi phe và dùng chính đòn đánh/kỹ năng của nó tấn công phe địch. Boss không bị hack mà bị choáng 2.5s. Hồi chiêu lõi bắt đầu sau khi hiệu ứng kết thúc.",
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
    "description": "Tích 50% Overkill từ quái thường; Tinh Anh/Boss tích 2% sát thương nhận vào. Một kho chung, tối đa 600% Hỏa lực. Dùng kỹ năng xả toàn bộ thành shockwave toàn màn hình rồi reset.",
    "system": "Chiến Thuật",
    "icon": "core:core_121",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  }
];
