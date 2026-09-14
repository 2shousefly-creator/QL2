import type { CoreDefinition } from "./airCombatTypes";

// Canonical Appendix B, workbook row numbers are stable run-local identifiers.
export const CORE_DEFINITIONS: readonly CoreDefinition[] = [
  {
    "id": "core_001",
    "name": "Đạn hạng nhẹ",
    "description": "12 Hỏa lực",
    "system": "Chung",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_002",
    "name": "Lớp giáp phụ",
    "description": "12 Giáp.",
    "system": "Chung",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_003",
    "name": "Tinh chỉnh cò súng",
    "description": "0.15 Tốc độ bắn.",
    "system": "Chung",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_004",
    "name": "Khung thân gia cố",
    "description": "110 HP tối đa.",
    "system": "Chung",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_005",
    "name": "Bộ sửa chữa cơ bản",
    "description": "0,6 HP hồi mỗi giây.",
    "system": "Chung",
    "icon": "◆",
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
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_007",
    "name": "Đạn xuyên giáp",
    "description": "20 Hỏa lực.",
    "system": "Chung",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_008",
    "name": "Giáp hợp kim",
    "description": "20 Giáp.",
    "system": "Chung",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_009",
    "name": "Bộ nạp liên thanh",
    "description": "0.4 Tốc độ bắn.",
    "system": "Chung",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_010",
    "name": "Khung thân chiến đấu",
    "description": "220 HP tối đa.",
    "system": "Chung",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_011",
    "name": "Sửa chữa Nano",
    "description": "1.3 HP hồi mỗi giây.",
    "system": "Chung",
    "icon": "◆",
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
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_013",
    "name": "Chúng sinh bình đẳng",
    "description": "50 Hỏa lực.",
    "system": "Chung",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_014",
    "name": "Pháo đài kim cương",
    "description": "50 Giáp",
    "system": "Chung",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_015",
    "name": "Buồng bắn siêu tốc",
    "description": "1.2 Tốc độ bắn.",
    "system": "Chung",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_016",
    "name": "Khung thân bất hoại",
    "description": "420 HP tối đa.",
    "system": "Chung",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_017",
    "name": "Tái tạo lượng tử",
    "description": "3 HP hồi mỗi giây.",
    "system": "Chung",
    "icon": "◆",
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
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_019",
    "name": "Nâng cấp Mồi Bẫy",
    "description": "Mồi Bẫy +1 đợt bắn và +1 giây hiệu lực.",
    "system": "Viper · Skill 1",
    "icon": "◆",
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
    "description": "Mồi Bẫy giảm 13 giây hồi chiêu",
    "system": "Viper · Skill 1",
    "icon": "◆",
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
    "description": "Sau khi kết thúc phóng mồi bẫy, Viper tăng 20% sát thương gây ra trong 4 giây",
    "system": "Viper · Skill 1",
    "icon": "◆",
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
    "description": "Thời gian duy trì Điên Cuồng +3 giây.",
    "system": "Viper · Skill 2",
    "icon": "◆",
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
    "description": "Điên Cuồng +50% Tốc độ bắn",
    "system": "Viper · Skill 2",
    "icon": "◆",
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
    "description": "Miễn nhiễm khống chế trong thời gian hiệu lực",
    "system": "Viper · Skill 2",
    "icon": "◆",
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
    "description": "Phóng ra thêm 6 tên lửa (tổng 18 tên lửa).",
    "system": "Viper · Skill 3",
    "icon": "◆",
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
    "description": "Tăng 50% Hỏa lực mỗi tên lửa.",
    "system": "Viper · Skill 3",
    "icon": "◆",
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
    "description": "Mỗi tên lửa gây thiêu đốt mục tiêu bằng 70% hỏa lực mỗi giây trong 5 giây và giảm 30% giáp của mục tiêu trong thời gian thiêu đốt. Làm mới thời gian khi trúng nhiều tên lửa",
    "system": "Viper · Skill 3",
    "icon": "◆",
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
    "description": "Khiên Năng Lượng +25% giảm sát thương.",
    "system": "Titan · Skill 1",
    "icon": "◆",
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
    "description": "Thời gian duy trì Khiên Năng Lượng +3 giây.",
    "system": "Titan · Skill 1",
    "icon": "◆",
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
    "description": "Tăng 50% giáp trong 5 giây sau khi khiên năng lượng biến mất",
    "system": "Titan · Skill 1",
    "icon": "◆",
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
    "description": "BigBang giảm 13 giây hồi chiêu.",
    "system": "Titan · Skill 2",
    "icon": "◆",
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
    "description": "BigBang +500% hỏa lực",
    "system": "Titan · Skill 2",
    "icon": "◆",
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
    "description": "Làm choáng tất cả mục tiêu trong 4 giây khi phát nổ",
    "system": "Titan · Skill 2",
    "icon": "◆",
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
    "description": "Oanh Tạc +20% Hỏa lực cho mỗi viên đạn.",
    "system": "Titan · Skill 3",
    "icon": "◆",
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
    "description": "Tăng thêm 35% Giáp trong chế độ Oanh Tạc.",
    "system": "Titan · Skill 3",
    "icon": "◆",
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
    "description": "Tăng 2 tia đạn trong chế độ Oanh Tạc (tổng 7 tia mỗi đợt)",
    "system": "Titan · Skill 3",
    "icon": "◆",
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
    "description": "Phản Ảnh: thời gian tàng hình và phân thân +1,5 giây.",
    "system": "Phantom · Skill 1",
    "icon": "◆",
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
    "description": "Hồi lại 18% máu đã mất trong thời gian tàng hình",
    "system": "Phantom · Skill 1",
    "icon": "◆",
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
    "description": "Giảm 15 Điện tiêu hao",
    "system": "Phantom · Skill 1",
    "icon": "◆",
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
    "description": "Laser Hủy Diệt +1 giây bắn",
    "system": "Phantom · Skill 2",
    "icon": "◆",
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
    "description": "Laser Hủy Diệt giảm 1,5 giây tụ năng lượng",
    "system": "Phantom · Skill 2",
    "icon": "◆",
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
    "description": "Giảm 25 Điện tiêu hao",
    "system": "Phantom · Skill 2",
    "icon": "◆",
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
    "description": "HawkEye -1 Điện tiêu hao mỗi giây.",
    "system": "Phantom · Skill 3",
    "icon": "◆",
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
    "description": "Sau mỗi 8 giây, HawkEye tăng 100% tốc độ bắn trong 3 giây và cũng tăng cho chủ nhân Phantom 30% tốc độ bắn trong thời gian hiệu lực. Hồi chiêu sẽ bắt đầu tính sau khi hiệu ứng kết thúc",
    "system": "Phantom · Skill 3",
    "icon": "◆",
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
    "description": "HawkEye +15% sức mạnh thừa hưởng.",
    "system": "Phantom · Skill 3",
    "icon": "◆",
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
    "description": "Tiêu diệt 1 kẻ địch nhận +0.4 Hỏa lực vĩnh viễn; lượng nhận được ×5 nếu tiêu diệt Tinh Anh hoặc Boss.",
    "system": "Khủng Long Cộng Dồn",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_047",
    "name": "Thích ứng phòng ngự",
    "description": "Tiêu diệt 1 kẻ địch nhận +0.3 Giáp vĩnh viễn; lượng nhận được ×5 nếu tiêu diệt Tinh Anh hoặc Boss.",
    "system": "Khủng Long Cộng Dồn",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_048",
    "name": "Trường Sinh",
    "description": "Tiêu diệt 1 kẻ địch nhận +3 máu tối đa vĩnh viễn; lượng nhận được ×5 nếu tiêu diệt Tinh Anh hoặc Boss.",
    "system": "Khủng Long Cộng Dồn",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_049",
    "name": "Bất động minh vương",
    "description": "Nếu không di chuyển trong 3 giây, nhận +80% Giáp và +40% Hỏa lực. Di chuyển sẽ kết thúc hiệu ứng.",
    "system": "Đặc Biệt",
    "icon": "◆",
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
    "icon": "✦",
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
    "icon": "✦",
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
    "icon": "✦",
    "category": "resource",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_053",
    "name": "Găng bảo thạch",
    "description": "Kỹ năng giờ đây có thể chí mạng, nhận thêm 25% tỷ lệ chí mạng",
    "system": "Đặc Biệt",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_054",
    "name": "Chậm mà chắc",
    "description": "Tốc độ bắn giờ sẽ bị khóa ở 1.2 và lượng tốc độ bắn tăng thêm hoặc dư ra sẽ chuyển thành hỏa lực với tỷ lệ 0,1 tốc độ bắn = 15 hỏa lực",
    "system": "Đặc biệt",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_055",
    "name": "Kính ngắm chiến trường",
    "description": "Tăng 5% tỷ lệ chí mạng.",
    "system": "Chí Mạng",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_056",
    "name": "Đầu đạn cân chỉnh",
    "description": "Tăng 10% sát thương chí mạng.",
    "system": "Chí Mạng",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_057",
    "name": "Xuyên thủng",
    "description": "Mọi sát thương gây ra bỏ qua 5% Giáp của mục tiêu.",
    "system": "Xuyên Giáp",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_058",
    "name": "Dấu ngắm yếu điểm",
    "description": "Đánh trúng cùng một mục tiêu 5 lần sẽ giảm 8% Giáp của mục tiêu trong 4 giây; tiếp tục đánh trúng sẽ làm mới thời gian.",
    "system": "Xuyên Giáp",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_059",
    "name": "Phát bắn tích điện",
    "description": "Mỗi phát đánh thường thứ 10 gây 180% sát thương",
    "system": "Vũ Khí",
    "icon": "⇧",
    "category": "weapon",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_060",
    "name": "Nòng súng ổn định",
    "description": "Nếu không bị trúng đạn trong 4 giây, sát thương đánh thường tăng 15%; hiệu ứng mất ngay khi nhận sát thương.",
    "system": "Vũ Khí",
    "icon": "⇧",
    "category": "weapon",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_061",
    "name": "Giáp phản ứng nhanh",
    "description": "Sau khi nhận sát thương, nhận +15 Giáp trong 4 giây. Hồi nội tại 12 giây.",
    "system": "Phản Kích",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_062",
    "name": "Van sinh tồn",
    "description": "Khi HP dưới 20%, hồi 0,5% HP tối đa mỗi giây cho đến khi HP đạt 20%.",
    "system": "Sinh Tồn",
    "icon": "♥",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_063",
    "name": "Máu nóng",
    "description": "Khi HP dưới 35%, nhận +20 Hỏa lực và +20 Giáp.",
    "system": "Sinh Tồn",
    "icon": "♥",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_064",
    "name": "Hút Hồn",
    "description": "Mỗi 10 kẻ địch bị tiêu diệt, hồi 2% HP tối đa.",
    "system": "Hồi Phục",
    "icon": "♥",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_065",
    "name": "Khung chống va đập",
    "description": "Giảm 20% sát thương nhận phải do va chạm với kẻ địch",
    "system": "Phòng Thủ",
    "icon": "♥",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_066",
    "name": "Combo săn mồi",
    "description": "Mỗi kẻ địch tiêu diệt trong vòng 3 giây kể từ lần hạ gục trước tăng 2% sát thương, cộng dồn tối đa 5 lần; mất toàn bộ cộng dồn nếu 3 giây không hạ gục mục tiêu.",
    "system": "Combo",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_067",
    "name": "Đánh dấu Tinh Anh",
    "description": "Gây thêm 6% sát thương lên Tinh Anh và Boss.",
    "system": "Săn Boss",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_068",
    "name": "Kết liễu gọn",
    "description": "Gây thêm 8% sát thương lên kẻ địch còn dưới 25% HP.",
    "system": "Kết Liễu",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_069",
    "name": "Phủ đầu",
    "description": "Gây thêm 10% sát thương lên kẻ địch còn trên 70% HP.",
    "system": "Hỏa Lực",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_070",
    "name": "Tái kích hoạt",
    "description": "Mỗi 8 kẻ địch bị tiêu diệt, giảm 0,5 giây hồi chiêu còn lại của tất cả kỹ năng đang hồi.",
    "system": "Kỹ Năng Chung",
    "icon": "✦",
    "category": "resource",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_071",
    "name": "Nhịp chiến thuật",
    "description": "Sau khi sử dụng một kỹ năng, nhận +0,15 Tốc độ bắn trong 4 giây.",
    "system": "Kỹ Năng Chung",
    "icon": "✦",
    "category": "resource",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_072",
    "name": "Thép lạnh",
    "description": "Nếu không nhận sát thương trong 5 giây, đòn đánh tiếp theo nhận phải được giảm 40% sát thương; hiệu ứng sau đó cần tích lại.",
    "system": "Phòng Thủ",
    "icon": "♥",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_073",
    "name": "Đạn Phân Mảnh",
    "description": "Kẻ địch bị tiêu diệt phát nổ, gây 20% Hỏa lực lên các mục tiêu xung quanh.",
    "system": "Vũ khí",
    "icon": "⇧",
    "category": "weapon",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_074",
    "name": "Bạo Kích Hồi Tiếp",
    "description": "Mỗi đòn chí mạng giảm 0.1 giây hồi chiêu của cả 3 kỹ năng. Giới hạn tối đa giảm 1 giây mỗi giây.",
    "system": "Chí mạng",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_075",
    "name": "Nhịp Sát Phạt",
    "description": "Cứ 5 mạng hạ gục nhận +3% Hỏa lực, tối đa 5 cộng dồn. Bị trúng đòn mất 1 cộng dồn.",
    "system": "Combo",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_076",
    "name": "Lá Chắn Phản Ứng",
    "description": "Nếu nhận một đòn gây trên 10% HP tối đa, nhận khiên bằng 12% HP tối đa trong 3 giây. Hồi nội bộ 10 giây.",
    "system": "Phòng thủ",
    "icon": "♥",
    "category": "defense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_077",
    "name": "Hồi Phục Chiến Trường",
    "description": "Hạ Elite hồi 18% HP tối đa và giảm 4 giây hồi chiêu tất cả kỹ năng",
    "system": "Sinh tồn",
    "icon": "♥",
    "category": "defense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_078",
    "name": "Tiếp Sức Lò Phản Ứng",
    "description": "Hạ 5 địch trong vòng 4 giây tăng 35% tốc độ hồi tài nguyên trong 6 giây.",
    "system": "Tài nguyên",
    "icon": "✦",
    "category": "resource",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_079",
    "name": "Tam Liên Pháo",
    "description": "Mỗi phát bắn thường thứ 3 tạo thêm một viên đạn phụ gây 40% sát thương.",
    "system": "Vũ khí",
    "icon": "⇧",
    "category": "weapon",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_080",
    "name": "Dội Xạ Chiến Thuật",
    "description": "Đạn thường có 15% cơ hội nảy sang một mục tiêu khác với 55% sát thương.",
    "system": "Vũ khí",
    "icon": "⇧",
    "category": "weapon",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_081",
    "name": "Lá chắn kỹ năng",
    "description": "Mỗi khi dùng kỹ năng, nhận khiên bằng 8% HP tối đa trong 3 giây. Hồi nội bộ 6 giây.",
    "system": "Kỹ năng",
    "icon": "✦",
    "category": "resource",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_082",
    "name": "Áp Lực Liên Tục",
    "description": "Không bị trúng đòn trong 4 giây sẽ nhận +20% Tốc độ bắn cho tới khi bị trúng đòn.",
    "system": "Vũ khí",
    "icon": "⇧",
    "category": "weapon",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_083",
    "name": "Phản Công Tức Thời",
    "description": "Sau khi nhận sát thương, 3 phát bắn thường tiếp theo gây thêm 20% sát thương. Hồi nội bộ 6 giây.",
    "system": "Phản kích",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_084",
    "name": "Miễn Phí Có Điều Kiện",
    "description": "Mỗi kỹ năng thứ 4 sử dụng không tiêu hao tài nguyên nhưng lần dùng đó có hồi chiêu tăng 20%.",
    "system": "Kỹ năng",
    "icon": "✦",
    "category": "resource",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_085",
    "name": "Pháo Đổi Giáp",
    "description": "tăng 35 Hỏa lực nhưng -18 Giáp",
    "system": "Đặc Biệt",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_086",
    "name": "Pin Xung Kích",
    "description": "Giảm 20% tài nguyên tối đa nhưng tăng 70% tốc độ hồi tài nguyên.",
    "system": "Tài nguyên",
    "icon": "✦",
    "category": "resource",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_087",
    "name": "Mắt thần chiến trường",
    "description": "Tăng 20% tỷ lệ chí mạng và 30% sát thương chí mạng.",
    "system": "Chí Mạng",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_088",
    "name": "Xuyên phá tuyệt đối",
    "description": "Mọi sát thương gây ra bỏ qua 25% Giáp của mục tiêu.",
    "system": "Xuyên Giáp",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_089",
    "name": "Đạn xuyên vô tận",
    "description": "Đạn đánh thường xuyên qua tối đa 3 mục tiêu bổ sung; các mục tiêu tiếp theo lần lượt nhận 70%, 50% và 30% sát thương.",
    "system": "Vũ Khí",
    "icon": "⇧",
    "category": "weapon",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_090",
    "name": "Từ chối tử thần",
    "description": "Một lần duy nhất trong mỗi lượt chơi, sát thương chí tử khiến HP còn 1 thay vì bị hạ gục; sau đó miễn nhiễm sát thương 2 giây và hồi 35% HP tối đa.",
    "system": "Sinh Tồn",
    "icon": "♥",
    "category": "defense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_091",
    "name": "Không khuất phục",
    "description": "Mỗi 2% HP đã mất tăng 1% sát thương gây ra, tối đa +40%.",
    "system": "Sinh Tồn",
    "icon": "♥",
    "category": "defense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_092",
    "name": "Bộ tái tạo sinh học",
    "description": "Nếu không nhận sát thương trong 5 giây, bắt đầu hồi 2% HP tối đa mỗi giây; hiệu ứng dừng ngay khi nhận sát thương.",
    "system": "Hồi Phục",
    "icon": "♥",
    "category": "defense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_093",
    "name": "Đại Pháp Sư",
    "description": "Mỗi khi sử dụng một kỹ năng, giảm hồi chiêu còn lại của 2 kỹ năng còn lại bằng 15% hồi chiêu cơ bản của chúng.",
    "system": "Kỹ Năng Chung",
    "icon": "✦",
    "category": "resource",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_094",
    "name": "Khế Ước Quỷ Quyệt",
    "description": "Giảm 35% HP tối đa nhưng tăng 40% Hỏa lực và 10% tỷ lệ chí mạng.",
    "system": "Đặc Biệt",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_095",
    "name": "Nghịch Lý Bạo Kích",
    "description": "Tỷ lệ chí mạng bị cố định ở 25%, nhưng sát thương chí mạng tăng thêm 300% (ví dụ 170% tăng thành 470%)",
    "system": "Đặc Biệt",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_096",
    "name": "Hợp Đồng Huyết Năng",
    "description": "Mỗi lần dùng kỹ năng mất 6% HP hiện tại; đổi lại giảm thêm 40% hồi chiêu",
    "system": "Đặc Biệt",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_097",
    "name": "Tập trung chuyên môn",
    "description": "Khóa cả 3 kỹ năng. Đổi lại tăng 60% hỏa lực, 40% máu tối đa và 40% giáp",
    "system": "Đặc Biệt",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_098",
    "name": "Bộ Lọc Nhiễu",
    "description": "Giảm 25% thời gian tồn tại của các hiệu ứng bất lợi tác động lên chiến cơ.",
    "system": "Kháng Hiệu Ứng",
    "icon": "♥",
    "category": "defense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_099",
    "name": "Kíp Phòng Thủ",
    "description": "Khi tài nguyên xuống dưới 10%, nhận Khiên bằng 8% HP tối đa trong 4 giây. Hồi nội tại 20 giây.",
    "system": "Sinh Tồn",
    "icon": "♥",
    "category": "defense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_100",
    "name": "Cân Bằng Chiến Trường",
    "description": "Khi HP trên 70% nhận +20 Hỏa lực; khi HP dưới 30% nhận +20 Giáp. Hai hiệu ứng không cùng tồn tại.",
    "system": "Thích Ứng",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_101",
    "name": "Hỏa Lực Cự Ly Gần",
    "description": "Đòn đánh thường gây thêm 12% sát thương lên mục tiêu ở cự ly gần (cự ly gần được tính là khoảng cách từ tâm chiến đấu cơ đến tâm quái vật mục tiêu nhỏ hơn độ dài của 1/3 màn hình chơi)",
    "system": "Vũ Khí",
    "icon": "⇧",
    "category": "weapon",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_102",
    "name": "Hỏa Lực Cự Ly Xa",
    "description": "Đòn đánh thường gây thêm 12% sát thương lên mục tiêu ở cự ly xa (cự ly xa được tính là khoảng cách từ tâm chiến đấu cơ đến tâm quái vật mục tiêu dài hơn độ dài của 2/3 màn hình chơi)",
    "system": "Vũ Khí",
    "icon": "⇧",
    "category": "weapon",
    "tiers": [
      "silver"
    ]
  },
  {
    "id": "core_103",
    "name": "Bản Năng Sinh Tồn",
    "description": "Khi HP dưới 30%, sát thương nhận từ đạn của địch giảm 12%.",
    "system": "Sinh Tồn",
    "icon": "♥",
    "category": "defense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_104",
    "name": "Tràn trề",
    "description": "Lượng hồi HP vượt quá HP tối đa được chuyển thành Khiên, tối đa bằng 12% HP tối đa.",
    "system": "Sinh Tồn",
    "icon": "♥",
    "category": "defense",
    "tiers": [
      "gold"
    ]
  },
  {
    "id": "core_105",
    "name": "Bão Sét Bạo Kích",
    "description": "Mỗi đòn chí mạng gọi sét lan tới tối đa 3 mục tiêu khác, mỗi mục tiêu nhận 70% Hỏa lực. Cùng một mục tiêu chỉ có thể bị sét đánh 1 lần mỗi 0,5 giây.",
    "system": "Chí Mạng",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  },
  {
    "id": "core_106",
    "name": "Tên lửa Tomahawk",
    "description": "Mỗi 1,5 giây, hệ thống tự khóa tối đa 3 mục tiêu và phóng một tên lửa vào mỗi mục tiêu, mỗi tên lửa gây 250% Hỏa lực.",
    "system": "Hỏa Lực Tự Động",
    "icon": "◆",
    "category": "offense",
    "tiers": [
      "diamond"
    ]
  }
];
