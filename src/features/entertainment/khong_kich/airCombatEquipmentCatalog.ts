export type EquipmentDefinitionId = `TP${string}` | `TH${string}` | `HL${string}`;
export type EquipmentFamilyId = `TH${string}`;
export type EquipmentRarity = "component" | "completed" | "legendary";
export interface EquipmentDefinition { readonly id: EquipmentDefinitionId; readonly name: string; readonly rarity: EquipmentRarity; readonly family?: EquipmentFamilyId; readonly recipe?: readonly EquipmentDefinitionId[]; readonly statsText: string; readonly effect: string; readonly stats: Readonly<Partial<Record<"firepower"|"armor"|"fireRate"|"maxHp"|"hpRegen"|"resourceRegenPct"|"cooldownReduction"|"criticalChance", number>>>; }
const definitions: EquipmentDefinition[] = [
  {
    "id": "TP01",
    "name": "Tinh Thiết",
    "rarity": "component",
    "statsText": "+15 Hỏa Lực",
    "effect": "Tăng trực tiếp Hỏa Lực của chiến cơ.",
    "stats": {
      "firepower": 15.0
    }
  },
  {
    "id": "TP02",
    "name": "Phong Luân",
    "rarity": "component",
    "statsText": "+0,30 Tốc Độ Bắn",
    "effect": "Tăng số lần khai hỏa đạn thường mỗi giây.",
    "stats": {
      "fireRate": 0.3
    }
  },
  {
    "id": "TP03",
    "name": "Hắc Giáp",
    "rarity": "component",
    "statsText": "+15 Giáp",
    "effect": "Tăng Giáp và giảm sát thương nhận vào theo công thức Giáp hiện hành.",
    "stats": {
      "armor": 15.0
    }
  },
  {
    "id": "TP04",
    "name": "Cốt Titan",
    "rarity": "component",
    "statsText": "+180 Máu Tối Đa",
    "effect": "Tăng Máu Tối Đa.",
    "stats": {
      "maxHp": 180.0
    }
  },
  {
    "id": "TP05",
    "name": "Sinh Mạch",
    "rarity": "component",
    "statsText": "+1,1 Hồi Máu/s",
    "effect": "Tăng lượng HP tự hồi mỗi giây.",
    "stats": {
      "hpRegen": 1.1
    }
  },
  {
    "id": "TP06",
    "name": "Tụ Bão",
    "rarity": "component",
    "statsText": "+10% tốc độ hồi tài nguyên mỗi giây",
    "effect": "Tăng tốc độ hồi Mana/Điện tùy chiến cơ.",
    "stats": {
      "resourceRegenPct": 0.1
    }
  },
  {
    "id": "TP07",
    "name": "Thời Phiến",
    "rarity": "component",
    "statsText": "+7% Giảm Hồi Chiêu",
    "effect": "Tăng CDR theo điểm phần trăm",
    "stats": {
      "cooldownReduction": 0.07
    }
  },
  {
    "id": "TP08",
    "name": "Tinh Nhãn",
    "rarity": "component",
    "statsText": "+10% Tỷ Lệ Chí Mạng",
    "effect": "Tăng xác suất chí mạng của các đòn có thể chí mạng.",
    "stats": {
      "criticalChance": 0.1
    }
  },
  {
    "id": "TH01",
    "name": "Pháo Hắc Tinh",
    "rarity": "completed",
    "family": "TH01",
    "recipe": [
      "TP01",
      "TP01"
    ],
    "statsText": "+40 Hỏa Lực",
    "effect": "Tử Thần: Mọi sát thương trực tiếp do chiến cơ gây ra tăng 16%.",
    "stats": {
      "firepower": 40.0
    }
  },
  {
    "id": "HL01",
    "name": "Tinh Vong Pháo",
    "rarity": "legendary",
    "family": "TH01",
    "recipe": [
      "TP01",
      "TP01"
    ],
    "statsText": "+80 Hỏa Lực",
    "effect": "Tử Thần: Mọi sát thương trực tiếp do chiến cơ gây ra tăng 32%.",
    "stats": {
      "firepower": 80.0
    }
  },
  {
    "id": "TH02",
    "name": "Luân Cuồng Phong",
    "rarity": "completed",
    "family": "TH02",
    "recipe": [
      "TP01",
      "TP02"
    ],
    "statsText": "+23 Hỏa Lực; +0,45 Tốc Độ Bắn",
    "effect": "Hăng Hái Chiến Đấu: Mỗi đòn bắn thường trúng kẻ địch sẽ tăng 0,5 cộng dồn Hăng Hái, mỗi lần dùng kỹ năng tăng 5 cộng dồn Hăng Hái. Hăng Hái tồn tại tối đa trong 4 giây, mỗi cộng dồn Hăng Hái cho chiến cơ +0,03 tốc độ bắn. Làm mới thời gian tồn tại và có thể cộng dồn lên tới 60 Hăng Hái. Mỗi lần nhận sát thương từ kẻ địch sẽ làm mất 5 cộng dồn Hăng Hái.",
    "stats": {
      "firepower": 23.0,
      "fireRate": 0.45
    }
  },
  {
    "id": "HL02",
    "name": "Luân Thiên Bạo",
    "rarity": "legendary",
    "family": "TH02",
    "recipe": [
      "TP01",
      "TP02"
    ],
    "statsText": "+46 Hỏa Lực; +0,9 Tốc Độ Bắn",
    "effect": "Hăng Hái Chiến Đấu: Mỗi đòn bắn thường trúng kẻ địch sẽ tăng 0,5 cộng dồn Hăng Hái, mỗi lần dùng kỹ năng tăng 5 cộng dồn Hăng Hái. Hăng Hái tồn tại tối đa trong 4 giây, mỗi cộng dồn Hăng Hái cho chiến cơ +0,06 tốc độ bắn. Làm mới thời gian tồn tại và có thể cộng dồn lên tới 60 Hăng Hái. Mỗi lần nhận sát thương từ kẻ địch sẽ làm mất 5 cộng dồn Hăng Hái.",
    "stats": {
      "firepower": 46.0,
      "fireRate": 0.9
    }
  },
  {
    "id": "TH03",
    "name": "Màn Hư Không",
    "rarity": "completed",
    "family": "TH03",
    "recipe": [
      "TP01",
      "TP03"
    ],
    "statsText": "+23 Hỏa Lực; +23 Giáp",
    "effect": "Tan Biến: Nếu nhận sát thương làm máu giảm xuống dưới mốc 40%, chiến cơ sẽ trở nên tàng hình và không thể bị chỉ định trong 2 giây và hồi lại 12% máu đã mất từ từ trong thời gian này. Hồi chiêu 60 giây tính từ khi kết thúc hiệu ứng.\n\nGhi chú - Không thể chỉ định: Chiến cơ sẽ không thể bị chọn làm mục tiêu, các đòn tấn công đang chọn chiến cơ làm mục tiêu sẽ mất dấu mục tiêu. Các đạn thường bắn vào chiến cơ sẽ bay xuyên qua mà không gây sát thương.",
    "stats": {
      "firepower": 23.0,
      "armor": 23.0
    }
  },
  {
    "id": "HL03",
    "name": "Áo Choàng Nyx",
    "rarity": "legendary",
    "family": "TH03",
    "recipe": [
      "TP01",
      "TP03"
    ],
    "statsText": "+46 Hỏa Lực; +46 Giáp",
    "effect": "Tan Biến: Nếu nhận sát thương làm máu giảm xuống dưới mốc 40%, chiến cơ sẽ trở nên tàng hình và không thể bị chỉ định trong 2 giây và hồi lại 24% máu đã mất từ từ trong thời gian này. Hồi chiêu 60 giây tính từ khi kết thúc hiệu ứng.\n\nGhi chú - Không thể chỉ định: Chiến cơ sẽ không thể bị chọn làm mục tiêu, các đòn tấn công đang chọn chiến cơ làm mục tiêu sẽ mất dấu mục tiêu. Các đạn thường bắn vào chiến cơ sẽ bay xuyên qua mà không gây sát thương.",
    "stats": {
      "firepower": 46.0,
      "armor": 46.0
    }
  },
  {
    "id": "TH04",
    "name": "Khiên Huyết Tinh",
    "rarity": "completed",
    "family": "TH04",
    "recipe": [
      "TP01",
      "TP04"
    ],
    "statsText": "+23 Hỏa Lực; +270 Máu Tối Đa",
    "effect": "Lá Chắn Chiến Trường: Lần đầu nhận  sát thương khiến máu tụt xuống dưới 60% máu, nhận lá chắn hấp thụ sát thương bằng 15% máu tối đa trong 8 giây. Hồi chiêu 60 giây sau tính từ khi kết thúc hiệu ứng",
    "stats": {
      "firepower": 23.0,
      "maxHp": 270.0
    }
  },
  {
    "id": "HL04",
    "name": "Thiên Thuẫn Helios",
    "rarity": "legendary",
    "family": "TH04",
    "recipe": [
      "TP01",
      "TP04"
    ],
    "statsText": "+46 Hỏa Lực; +540 Máu Tối Đa",
    "effect": "Lá Chắn Chiến Trường: Lần đầu nhận  sát thương khiến máu tụt xuống dưới 60% máu, nhận lá chắn hấp thụ sát thương bằng 30% máu tối đa trong 8 giây. Hồi chiêu 60 giây sau tính từ khi kết thúc hiệu ứng",
    "stats": {
      "firepower": 46.0,
      "maxHp": 540.0
    }
  },
  {
    "id": "TH05",
    "name": "Lò Prometheus",
    "rarity": "completed",
    "family": "TH05",
    "recipe": [
      "TP01",
      "TP05"
    ],
    "statsText": "+23 Hỏa Lực; +1,7 Hồi Máu/s",
    "effect": "Hỏa Ấn: Mỗi 10 giây, kỹ năng gây sát thương kế tiếp trúng kẻ địch sẽ đặt Hỏa Ấn lên tất cả mục tiêu trúng phải trong 8 giây. Mỗi đòn bắn thường chính trúng mục tiêu bị Hỏa Ấn tích 1 Nhiệt, tối đa 6. Ở 6 Nhiệt, Hỏa Ấn phát nổ, gây 240% Hỏa Lực lên mục tiêu và 180% Hỏa Lực lên các kẻ địch khác trong bán kính 100px, sau đó kết thúc. Nếu Hỏa Ấn hết thời gian trước khi đủ 6 Nhiệt thì biến mất.",
    "stats": {
      "firepower": 23.0,
      "hpRegen": 1.7
    }
  },
  {
    "id": "HL05",
    "name": "Tim Phượng Hoàng",
    "rarity": "legendary",
    "family": "TH05",
    "recipe": [
      "TP01",
      "TP05"
    ],
    "statsText": "+46 Hỏa Lực; +3,4 Hồi Máu/s",
    "effect": "Hỏa Ấn: Mỗi 10 giây, kỹ năng gây sát thương kế tiếp trúng kẻ địch sẽ đặt Hỏa Ấn lên tất cả mục tiêu trúng phải trong 8 giây. Mỗi đòn bắn thường chính trúng mục tiêu bị Hỏa Ấn tích 1 Nhiệt, tối đa 6. Ở 6 Nhiệt, Hỏa Ấn phát nổ, gây 480% Hỏa Lực lên mục tiêu và 360% Hỏa Lực lên các kẻ địch khác trong bán kính 100px, sau đó kết thúc. Nếu Hỏa Ấn hết thời gian trước khi đủ 6 Nhiệt thì biến mất.",
    "stats": {
      "firepower": 46.0,
      "hpRegen": 3.4
    }
  },
  {
    "id": "TH06",
    "name": "Bình Tụ Aether",
    "rarity": "completed",
    "family": "TH06",
    "recipe": [
      "TP01",
      "TP06"
    ],
    "statsText": "+23 Hỏa Lực; +17% tốc độ Hồi Tài Nguyên/s",
    "effect": "Thác Chảy: Mỗi 10 đòn bắn thường trúng kẻ địch sẽ hồi lại 2,5% tài nguyên tối đa.",
    "stats": {
      "firepower": 23.0,
      "resourceRegenPct": 0.17
    }
  },
  {
    "id": "HL06",
    "name": "Giếng Vô Tận",
    "rarity": "legendary",
    "family": "TH06",
    "recipe": [
      "TP01",
      "TP06"
    ],
    "statsText": "+46 Hỏa Lực; +34% tốc độ Hồi Tài Nguyên/s",
    "effect": "Thác Chảy: Mỗi 10 đòn bắn thường trúng kẻ địch sẽ hồi lại 5% tài nguyên tối đa.",
    "stats": {
      "firepower": 46.0,
      "resourceRegenPct": 0.34
    }
  },
  {
    "id": "TH07",
    "name": "Ấn Hắc Nguyệt",
    "rarity": "completed",
    "family": "TH07",
    "recipe": [
      "TP01",
      "TP07"
    ],
    "statsText": "+23 Hỏa Lực; +11% Giảm Hồi Chiêu",
    "effect": "Phù Thủy Hắc Ám: Tăng thêm +6% sát thương kỹ năng. Khi một kỹ năng gây sát thương trúng kẻ địch, nếu kẻ địch đó vẫn còn sống thì sẽ nhận thêm 12% sát thương nhận vào trong 3 giây sau đó.",
    "stats": {
      "firepower": 23.0,
      "cooldownReduction": 0.11
    }
  },
  {
    "id": "HL07",
    "name": "Vương Ấn Erebus",
    "rarity": "legendary",
    "family": "TH07",
    "recipe": [
      "TP01",
      "TP07"
    ],
    "statsText": "+46 Hỏa Lực; +22% Giảm Hồi Chiêu",
    "effect": "Phù Thủy Hắc Ám: Tăng thêm +12% sát thương kỹ năng. Khi một kỹ năng gây sát thương trúng kẻ địch, nếu kẻ địch đó vẫn còn sống thì sẽ nhận thêm 24% sát thương nhận vào trong 3 giây sau đó.",
    "stats": {
      "firepower": 46.0,
      "cooldownReduction": 0.22
    }
  },
  {
    "id": "TH08",
    "name": "Mắt Tempest",
    "rarity": "completed",
    "family": "TH08",
    "recipe": [
      "TP01",
      "TP08"
    ],
    "statsText": "+23 Hỏa Lực; +15% Tỷ Lệ Chí Mạng",
    "effect": "Xung Kích Bão Tố: Kỹ năng của chiến cơ có thể gây chí mạng. Nếu kỹ năng đã có thể gây chí mạng từ trước đó nhờ có lõi nâng cấp Găng Bảo Thạch thì bù lại sẽ tăng thêm 50% sát thương chí mạng.",
    "stats": {
      "firepower": 23.0,
      "criticalChance": 0.15
    }
  },
  {
    "id": "HL08",
    "name": "Thiên Nhãn Raijin",
    "rarity": "legendary",
    "family": "TH08",
    "recipe": [
      "TP01",
      "TP08"
    ],
    "statsText": "+46 Hỏa Lực; +30% Tỷ Lệ Chí Mạng",
    "effect": "Xung Kích Bão Tố: Kỹ năng của chiến cơ có thể gây chí mạng. Nếu kỹ năng đã có thể gây chí mạng từ trước đó nhờ có lõi nâng cấp Găng Bảo Thạch thì bù lại sẽ tăng thêm 100% sát thương chí mạng.",
    "stats": {
      "firepower": 46.0,
      "criticalChance": 0.3
    }
  },
  {
    "id": "TH09",
    "name": "Nanh Lôi Ảnh",
    "rarity": "completed",
    "family": "TH09",
    "recipe": [
      "TP02",
      "TP02"
    ],
    "statsText": "+0,85 Tốc Độ Bắn",
    "effect": "Tia Chớp Đen: Nhận thêm +25% tổng tốc độ bắn, đòn bắn thường gây thêm sát thương bằng 3% máu hiện tại của mục tiêu ( Đối với Tinh Anh và Boss, sát thương theo máu hiện tại của mục tiêu không vượt quá 40% Hỏa lực của chiến cơ)",
    "stats": {
      "fireRate": 0.85
    }
  },
  {
    "id": "HL09",
    "name": "Nanh Thiên Lôi",
    "rarity": "legendary",
    "family": "TH09",
    "recipe": [
      "TP02",
      "TP02"
    ],
    "statsText": "+1,7 Tốc Độ Bắn",
    "effect": "Tia Chớp Đen: Nhận thêm +50% tổng tốc độ bắn, đòn bắn thường gây thêm sát thương bằng 6% máu hiện tại của mục tiêu ( Đối với Tinh Anh và Boss, sát thương theo máu hiện tại của mục tiêu không vượt quá 80% Hỏa lực của chiến cơ)",
    "stats": {
      "fireRate": 1.7
    }
  },
  {
    "id": "TH10",
    "name": "Giáp Colossus",
    "rarity": "completed",
    "family": "TH10",
    "recipe": [
      "TP02",
      "TP03"
    ],
    "statsText": "+23 Giáp; +0,45 Tốc Độ Bắn",
    "effect": "Quyền Năng Bất Diệt: Mỗi lần chiến cơ nhận sát thương, nhận 1 cộng dồn Quyền Năng trong 5 giây. Khi đạt tối đa 15 cộng dồn, tăng thêm +40 giáp, +0,35 tốc độ bắn và +1 hồi máu/s. Hiệu ứng sẽ làm mới thời gian mỗi khi nhận sát thương, sau 5 giây không nhận sát thương, mất dần 1 cộng dồn mỗi 0,5 giây.",
    "stats": {
      "armor": 23.0,
      "fireRate": 0.45
    }
  },
  {
    "id": "HL10",
    "name": "Vương Giáp Colossus",
    "rarity": "legendary",
    "family": "TH10",
    "recipe": [
      "TP02",
      "TP03"
    ],
    "statsText": "+46 Giáp; +0,9 Tốc Độ Bắn",
    "effect": "Quyền Năng Bất Diệt: Mỗi lần chiến cơ nhận sát thương, nhận 1 cộng dồn Quyền Năng trong 5 giây. Khi đạt tối đa 15 cộng dồn, tăng thêm +80 giáp, +0,7 tốc độ bắn và +2 hồi máu/s. Hiệu ứng sẽ làm mới thời gian mỗi khi nhận sát thương, sau 5 giây không nhận sát thương, mất dần 1 cộng dồn mỗi 0,5 giây.",
    "stats": {
      "armor": 46.0,
      "fireRate": 0.9
    }
  },
  {
    "id": "TH11",
    "name": "Cánh Valkyrie",
    "rarity": "completed",
    "family": "TH11",
    "recipe": [
      "TP02",
      "TP04"
    ],
    "statsText": "+0,45 Tốc Độ Bắn; +270 Máu Tối Đa",
    "effect": "Nhịp Nhàng: Sau khi dùng kỹ năng, nhận +0,6 Tốc Độ Bắn trong 5 giây. Làm mới thời gian hiệu ứng chứ không cộng dồn",
    "stats": {
      "fireRate": 0.45,
      "maxHp": 270.0
    }
  },
  {
    "id": "HL11",
    "name": "Thiên Dực Valkyrie",
    "rarity": "legendary",
    "family": "TH11",
    "recipe": [
      "TP02",
      "TP04"
    ],
    "statsText": "+0,9 Tốc Độ Bắn; +540 Máu Tối Đa",
    "effect": "Nhịp Nhàng: Sau khi dùng kỹ năng, nhận +1,2 Tốc Độ Bắn trong 5 giây. Làm mới thời gian hiệu ứng chứ không cộng dồn",
    "stats": {
      "fireRate": 0.9,
      "maxHp": 540.0
    }
  },
  {
    "id": "TH12",
    "name": "Tâm Cơ Giới",
    "rarity": "completed",
    "family": "TH12",
    "recipe": [
      "TP02",
      "TP05"
    ],
    "statsText": "+0,45 Tốc Độ Bắn; +1,7 Hồi Máu/s",
    "effect": "Ảnh Xạ: Mỗi đòn bắn thường chính thứ 7 trúng kẻ địch sẽ tạo 2 Tàn Ảnh từ hai bên chiến cơ. Mỗi Tàn Ảnh tự tìm một mục tiêu khác trong bán kính 180px và gây 75% Hỏa Lực. Nếu không có mục tiêu phụ, hai Tàn Ảnh hợp nhất thành một phát vào mục tiêu chính gây 110% Hỏa Lực. Tàn Ảnh không thể chí mạng và không kích hoạt hiệu ứng trang bị/lõi khác.",
    "stats": {
      "fireRate": 0.45,
      "hpRegen": 1.7
    }
  },
  {
    "id": "HL12",
    "name": "Trái Tim Titan",
    "rarity": "legendary",
    "family": "TH12",
    "recipe": [
      "TP02",
      "TP05"
    ],
    "statsText": "+0,9 Tốc Độ Bắn; +3,4 Hồi Máu/s",
    "effect": "Ảnh Xạ: Mỗi đòn bắn thường chính thứ 7 trúng kẻ địch sẽ tạo 2 Tàn Ảnh từ hai bên chiến cơ. Mỗi Tàn Ảnh tự tìm một mục tiêu khác trong bán kính 180px và gây 150% Hỏa Lực. Nếu không có mục tiêu phụ, hai Tàn Ảnh hợp nhất thành một phát vào mục tiêu chính gây 220% Hỏa Lực. Tàn Ảnh không thể chí mạng và không kích hoạt hiệu ứng trang bị/lõi khác.",
    "stats": {
      "fireRate": 0.9,
      "hpRegen": 3.4
    }
  },
  {
    "id": "TH13",
    "name": "Luân Plasma",
    "rarity": "completed",
    "family": "TH13",
    "recipe": [
      "TP02",
      "TP06"
    ],
    "statsText": "+0,45 Tốc Độ Bắn; +17% tốc độ Hồi Tài Nguyên/s",
    "effect": "Dòng Phóng Điện: Di chuyển tích Điện Năng với tốc độ 1 điểm mỗi 6px di chuyển; mỗi đòn bắn thường chính trúng kẻ địch cộng thêm 8 Điện Năng, tối đa 100. Khi đạt 100, đòn bắn thường chính kế tiếp tiêu toàn bộ Điện Năng để phóng tia sét dây chuyền qua tối đa 4 mục tiêu, mỗi mục tiêu chịu 90% Hỏa Lực. Tia sét ưu tiên mục tiêu chưa bị trúng gần nhất và mỗi mục tiêu chỉ bị đánh một lần trong cùng chuỗi.",
    "stats": {
      "fireRate": 0.45,
      "resourceRegenPct": 0.17
    }
  },
  {
    "id": "HL13",
    "name": "Vòng Möbius",
    "rarity": "legendary",
    "family": "TH13",
    "recipe": [
      "TP02",
      "TP06"
    ],
    "statsText": "+0,9 Tốc Độ Bắn; +34% tốc độ Hồi Tài Nguyên/s",
    "effect": "Dòng Phóng Điện: Di chuyển tích Điện Năng với tốc độ 1 điểm mỗi 6px di chuyển; mỗi đòn bắn thường chính trúng kẻ địch cộng thêm 8 Điện Năng, tối đa 100. Khi đạt 100, đòn bắn thường chính kế tiếp tiêu toàn bộ Điện Năng để phóng tia sét dây chuyền qua tối đa 8 mục tiêu, mỗi mục tiêu chịu 180% Hỏa Lực. Tia sét ưu tiên mục tiêu chưa bị trúng gần nhất và mỗi mục tiêu chỉ bị đánh một lần trong cùng chuỗi.",
    "stats": {
      "fireRate": 0.9,
      "resourceRegenPct": 0.34
    }
  },
  {
    "id": "TH14",
    "name": "Tù Và Ares",
    "rarity": "completed",
    "family": "TH14",
    "recipe": [
      "TP02",
      "TP07"
    ],
    "statsText": "+0,45 Tốc Độ Bắn; +11% Giảm Hồi Chiêu",
    "effect": "Hưng Phấn: Khi kỹ năng tiêu diệt được ít nhất 1 mục tiêu, nhận +0,7 tốc độ bắn và +35 hỏa lực trong 6 giây. Làm mới thời gian hiệu ứng chứ không cộng dồn.",
    "stats": {
      "fireRate": 0.45,
      "cooldownReduction": 0.11
    }
  },
  {
    "id": "HL14",
    "name": "Kèn Ngày Tận",
    "rarity": "legendary",
    "family": "TH14",
    "recipe": [
      "TP02",
      "TP07"
    ],
    "statsText": "+0,9 Tốc Độ Bắn; +22% Giảm Hồi Chiêu",
    "effect": "Hưng Phấn: Khi kỹ năng tiêu diệt được ít nhất 1 mục tiêu, nhận +1,4 tốc độ bắn và +70 hỏa lực trong 6 giây. Làm mới thời gian hiệu ứng chứ không cộng dồn.",
    "stats": {
      "fireRate": 0.9,
      "cooldownReduction": 0.22
    }
  },
  {
    "id": "TH15",
    "name": "Nanh Fenrir",
    "rarity": "completed",
    "family": "TH15",
    "recipe": [
      "TP02",
      "TP08"
    ],
    "statsText": "+0,45 Tốc Độ Bắn; +15% Tỷ Lệ Chí Mạng",
    "effect": "Mềm Xương: Đòn chí mạng sẽ làm giảm giáp của mục tiêu đi 10% trong 4 giây, lam mới thời gian hiệu ứng và cộng dồn lên tới 3 lần.",
    "stats": {
      "fireRate": 0.45,
      "criticalChance": 0.15
    }
  },
  {
    "id": "HL15",
    "name": "Hàm Sói Fenrir",
    "rarity": "legendary",
    "family": "TH15",
    "recipe": [
      "TP02",
      "TP08"
    ],
    "statsText": "+0,9 Tốc Độ Bắn; +30% Tỷ Lệ Chí Mạng",
    "effect": "Mềm Xương: Đòn chí mạng sẽ làm giảm giáp của mục tiêu đi 20% trong 4 giây, lam mới thời gian hiệu ứng và cộng dồn lên tới 3 lần.",
    "stats": {
      "fireRate": 0.9,
      "criticalChance": 0.3
    }
  },
  {
    "id": "TH16",
    "name": "Giáp Gorgon",
    "rarity": "completed",
    "family": "TH16",
    "recipe": [
      "TP03",
      "TP03"
    ],
    "statsText": "+40 Giáp",
    "effect": "Giáp Gai Phản Kích: Giảm 12% sát thương nhận vào và phản lại sát thương cho kẻ gây ra bằng với lượng đã giảm.\n\nGhi chú: Kẻ địch sẽ nhận sát thương phản kích ngay lập tức khi gây sát thương cho player, sát thương từ phản kích không thể chí mạng cũng như không kích hoạt các hiệu ứng lõi khác.",
    "stats": {
      "armor": 40.0
    }
  },
  {
    "id": "HL16",
    "name": "Vương Giáp Gorgon",
    "rarity": "legendary",
    "family": "TH16",
    "recipe": [
      "TP03",
      "TP03"
    ],
    "statsText": "+80 Giáp",
    "effect": "Giáp Gai Phản Kích: Giảm 24% sát thương nhận vào và phản lại sát thương cho kẻ gây ra bằng với lượng đã giảm. Sát thương phản kích không thể chí mạng và không kích hoạt hiệu ứng Lõi khác.",
    "stats": {
      "armor": 80.0
    }
  },
  {
    "id": "TH17",
    "name": "Khiên Atlas",
    "rarity": "completed",
    "family": "TH17",
    "recipe": [
      "TP03",
      "TP04"
    ],
    "statsText": "+23 Giáp; +270 Máu Tối Đa",
    "effect": "Chở Che: Mỗi 12 giây, lần đầu mất HP do địch tạo Lá Chắn bằng 9% Máu Tối Đa trong 4 giây.",
    "stats": {
      "armor": 23.0,
      "maxHp": 270.0
    }
  },
  {
    "id": "HL17",
    "name": "Thành Trì Atlas",
    "rarity": "legendary",
    "family": "TH17",
    "recipe": [
      "TP03",
      "TP04"
    ],
    "statsText": "+46 Giáp; +540 Máu Tối Đa",
    "effect": "Chở Che: Mỗi 12 giây, lần đầu mất HP do địch tạo Lá Chắn bằng 18% Máu Tối Đa trong 4 giây.",
    "stats": {
      "armor": 46.0,
      "maxHp": 540.0
    }
  },
  {
    "id": "TH18",
    "name": "Giáp Gaia",
    "rarity": "completed",
    "family": "TH18",
    "recipe": [
      "TP03",
      "TP05"
    ],
    "statsText": "+23 Giáp; +1,7 Hồi Máu/s",
    "effect": "Dư Chấn Sinh Học: 20% lượng HP thực tế bị mất do kẻ địch được lưu vào Bộ Đệm Phản Ứng, tối đa bằng 12% Máu Tối Đa. Nếu 3 giây liên tục không mất HP do kẻ địch, Bộ Đệm xả toàn bộ: hồi Máu bằng 50% lượng đã lưu. Sau khi xả, Bộ Đệm trở về 0.",
    "stats": {
      "armor": 23.0,
      "hpRegen": 1.7
    }
  },
  {
    "id": "HL18",
    "name": "Thánh Giáp Gaia",
    "rarity": "legendary",
    "family": "TH18",
    "recipe": [
      "TP03",
      "TP05"
    ],
    "statsText": "+46 Giáp; +3,4 Hồi Máu/s",
    "effect": "Dư Chấn Sinh Học: 20% lượng HP thực tế bị mất do kẻ địch được lưu vào Bộ Đệm Phản Ứng, tối đa bằng 12% Máu Tối Đa. Nếu 3 giây liên tục không mất HP do kẻ địch, Bộ Đệm xả toàn bộ: hồi Máu bằng 100% lượng đã lưu. Sau khi xả, Bộ Đệm trở về 0.",
    "stats": {
      "armor": 46.0,
      "hpRegen": 3.4
    }
  },
  {
    "id": "TH19",
    "name": "Tụ Phản Lực",
    "rarity": "completed",
    "family": "TH19",
    "recipe": [
      "TP03",
      "TP06"
    ],
    "statsText": "+23 Giáp; 17% tốc độ Hồi Tài Nguyên/s",
    "effect": "Cố Đấm Ăn Xôi: Khi mất HP do địch, hồi 6% Tài Nguyên Tối Đa. Hồi nội tại 5 giây.",
    "stats": {
      "armor": 23.0,
      "resourceRegenPct": 0.17
    }
  },
  {
    "id": "HL19",
    "name": "Lò Nghịch Biến",
    "rarity": "legendary",
    "family": "TH19",
    "recipe": [
      "TP03",
      "TP06"
    ],
    "statsText": "+46 Giáp; 34% tốc độ Hồi Tài Nguyên/s",
    "effect": "Cố Đấm Ăn Xôi: Khi mất HP do địch, hồi 12% Tài Nguyên Tối Đa. Hồi nội tại 5 giây.",
    "stats": {
      "armor": 46.0,
      "resourceRegenPct": 0.34
    }
  },
  {
    "id": "TH20",
    "name": "Khung Hộ Vệ",
    "rarity": "completed",
    "family": "TH20",
    "recipe": [
      "TP03",
      "TP07"
    ],
    "statsText": "+23 Giáp; +11% Giảm Hồi Chiêu",
    "effect": "Hậu Phương Vững Chắc: Sau khi dùng kỹ năng, nhận +40 Giáp trong 5 giây. Làm mới thời gian vào không cộng dồn",
    "stats": {
      "armor": 23.0,
      "cooldownReduction": 0.11
    }
  },
  {
    "id": "HL20",
    "name": "Pháo Đài Argus",
    "rarity": "legendary",
    "family": "TH20",
    "recipe": [
      "TP03",
      "TP07"
    ],
    "statsText": "+46 Giáp; +22% Giảm Hồi Chiêu",
    "effect": "Hậu Phương Vững Chắc: Sau khi dùng kỹ năng, nhận +80 Giáp trong 5 giây. Làm mới thời gian vào không cộng dồn",
    "stats": {
      "armor": 46.0,
      "cooldownReduction": 0.22
    }
  },
  {
    "id": "TH21",
    "name": "Lăng Kính Aegis",
    "rarity": "completed",
    "family": "TH21",
    "recipe": [
      "TP03",
      "TP08"
    ],
    "statsText": "+23 Giáp; +15% Tỷ Lệ Chí Mạng",
    "effect": "Song Thủ: Mỗi đòn chí mạng cho 4% Giảm Sát Thương nhận vào  trong 3 giây; làm mới thời gian và cộng dồn tối đa 3 lần.",
    "stats": {
      "armor": 23.0,
      "criticalChance": 0.15
    }
  },
  {
    "id": "HL21",
    "name": "Thánh Kính Aegis",
    "rarity": "legendary",
    "family": "TH21",
    "recipe": [
      "TP03",
      "TP08"
    ],
    "statsText": "+46 Giáp; +30% Tỷ Lệ Chí Mạng",
    "effect": "Song Thủ: Mỗi đòn chí mạng cho 8% Giảm Sát Thương nhận vào  trong 3 giây; làm mới thời gian và cộng dồn tối đa 3 lần.",
    "stats": {
      "armor": 46.0,
      "criticalChance": 0.3
    }
  },
  {
    "id": "TH22",
    "name": "Tim Behemoth",
    "rarity": "completed",
    "family": "TH22",
    "recipe": [
      "TP04",
      "TP04"
    ],
    "statsText": "+490 Máu Tối Đa",
    "effect": "Cơ Thể Thượng Nhân : Tăng thêm 15% Máu Tối Đa. Đòn bắn thường gây thêm sát thương bằng 1% máu tối đa của bản thân",
    "stats": {
      "maxHp": 490.0
    }
  },
  {
    "id": "HL22",
    "name": "Hạch Behemoth",
    "rarity": "legendary",
    "family": "TH22",
    "recipe": [
      "TP04",
      "TP04"
    ],
    "statsText": "+980 Máu Tối Đa",
    "effect": "Cơ Thể Thượng Nhân : Tăng thêm 30% Máu Tối Đa. Đòn bắn thường gây thêm sát thương bằng 2% máu tối đa của bản thân",
    "stats": {
      "maxHp": 980.0
    }
  },
  {
    "id": "TH23",
    "name": "Chén Elysia",
    "rarity": "completed",
    "family": "TH23",
    "recipe": [
      "TP04",
      "TP05"
    ],
    "statsText": "+270 Máu Tối Đa; +1,7 Hồi Máu/s",
    "effect": "Song Châu Sinh Mệnh: Cứ mỗi khi tổng lượng HP thực tế bị mất do kẻ địch tích lũy đạt 12% Máu Tối Đa, tạo ngẫu nhiên 1 Sinh Châu hoặc 1 Hộ Châu tại vị trí cách chiến cơ 45–85px, tồn tại 7 giây. Bay qua để nhặt: Sinh Châu hồi 4% Máu Tối Đa; Hộ Châu tạo Lá Chắn bằng 6% Máu Tối Đa trong 4 giây. Sau khi tạo châu, bộ đếm sát thương mất về 0. Tối đa chỉ có 1 châu từ hiệu ứng này tồn tại cùng lúc.",
    "stats": {
      "maxHp": 270.0,
      "hpRegen": 1.7
    }
  },
  {
    "id": "HL23",
    "name": "Thánh Tích Elysia",
    "rarity": "legendary",
    "family": "TH23",
    "recipe": [
      "TP04",
      "TP05"
    ],
    "statsText": "+540 Máu Tối Đa; +3,4 Hồi Máu/s",
    "effect": "Song Châu Sinh Mệnh: Cứ mỗi khi tổng lượng HP thực tế bị mất do kẻ địch tích lũy đạt 12% Máu Tối Đa, tạo ngẫu nhiên 1 Sinh Châu hoặc 1 Hộ Châu tại vị trí cách chiến cơ 45–85px, tồn tại 7 giây. Bay qua để nhặt: Sinh Châu hồi 8% Máu Tối Đa; Hộ Châu tạo Lá Chắn bằng 12% Máu Tối Đa trong 4 giây. Sau khi tạo châu, bộ đếm sát thương mất về 0. Tối đa chỉ có 1 châu từ hiệu ứng này tồn tại cùng lúc.",
    "stats": {
      "maxHp": 540.0,
      "hpRegen": 3.4
    }
  },
  {
    "id": "TH24",
    "name": "Lõi Tinh Vân",
    "rarity": "completed",
    "family": "TH24",
    "recipe": [
      "TP04",
      "TP06"
    ],
    "statsText": "+270 Máu Tối Đa; +17% tốc độ Hồi Tài Nguyên/s",
    "effect": "Tinh Vũ: Cứ mỗi 35% Tài Nguyên Tối Đa đã tiêu hao cộng dồn, khóa kẻ địch đang có lượng Máu hiện tại cao nhất và sau 0,6 giây giáng một thiên thạch xuống vị trí của mục tiêu tại thời điểm khóa, gây 220% Hỏa Lực trong bán kính 70px và làm chậm kẻ địch trúng phải 25% trong 2 giây. Sau khi kích hoạt, reset bộ đếm về 0. Nếu chưa có mục tiêu hợp lệ, mốc được giữ lại cho đến khi kẻ địch xuất hiện.",
    "stats": {
      "maxHp": 270.0,
      "resourceRegenPct": 0.17
    }
  },
  {
    "id": "HL24",
    "name": "Hạch Thiên Hà",
    "rarity": "legendary",
    "family": "TH24",
    "recipe": [
      "TP04",
      "TP06"
    ],
    "statsText": "+540 Máu Tối Đa; +34% tốc độ Hồi Tài Nguyên/s",
    "effect": "Tinh Vũ: Cứ mỗi 35% Tài Nguyên Tối Đa đã tiêu hao cộng dồn, khóa kẻ địch đang có lượng Máu hiện tại cao nhất và sau 0,6 giây giáng một thiên thạch xuống vị trí của mục tiêu tại thời điểm khóa, gây 440% Hỏa Lực trong bán kính 70px và làm chậm kẻ địch trúng phải 50% trong 2 giây. Sau khi kích hoạt, reset bộ đếm về 0. Nếu chưa có mục tiêu hợp lệ, mốc được giữ lại cho đến khi kẻ địch xuất hiện.",
    "stats": {
      "maxHp": 540.0,
      "resourceRegenPct": 0.34
    }
  },
  {
    "id": "TH25",
    "name": "Đồng Hồ Lazarus",
    "rarity": "completed",
    "family": "TH25",
    "recipe": [
      "TP04",
      "TP07"
    ],
    "statsText": "+270 Máu Tối Đa; +11% Giảm Hồi Chiêu",
    "effect": "Bảo Hiểm Khẩn Cấp: Mỗi 40 giây, lần đầu Máu tụt dưới 30%, giảm 6 giây hồi chiêu còn lại của cả 3 kỹ năng và tạo Lá Chắn bằng 10% Máu Tối Đa trong 4 giây.",
    "stats": {
      "maxHp": 270.0,
      "cooldownReduction": 0.11
    }
  },
  {
    "id": "HL25",
    "name": "Thời Khắc Lazarus",
    "rarity": "legendary",
    "family": "TH25",
    "recipe": [
      "TP04",
      "TP07"
    ],
    "statsText": "+540 Máu Tối Đa; +22% Giảm Hồi Chiêu",
    "effect": "Bảo Hiểm Khẩn Cấp: Mỗi 40 giây, lần đầu Máu tụt dưới 30%, giảm 12 giây hồi chiêu còn lại của cả 3 kỹ năng và tạo Lá Chắn bằng 20% Máu Tối Đa trong 4 giây.",
    "stats": {
      "maxHp": 540.0,
      "cooldownReduction": 0.22
    }
  },
  {
    "id": "TH26",
    "name": "Trống Khaos",
    "rarity": "completed",
    "family": "TH26",
    "recipe": [
      "TP04",
      "TP08"
    ],
    "statsText": "+270 Máu Tối Đa; +15% Tỷ Lệ Chí Mạng",
    "effect": "Nhịp Điệu Chí Mạng: Đòn chí mạng sẽ +3% mọi sát thương gây ra trong 5 giây, cộng dồn tối đa 5 lần.",
    "stats": {
      "maxHp": 270.0,
      "criticalChance": 0.15
    }
  },
  {
    "id": "HL26",
    "name": "Trống Tận Thế",
    "rarity": "legendary",
    "family": "TH26",
    "recipe": [
      "TP04",
      "TP08"
    ],
    "statsText": "+540 Máu Tối Đa; +30% Tỷ Lệ Chí Mạng",
    "effect": "Nhịp Điệu Chí Mạng: Đòn chí mạng sẽ +6% mọi sát thương gây ra trong 5 giây, cộng dồn tối đa 5 lần.",
    "stats": {
      "maxHp": 540.0,
      "criticalChance": 0.3
    }
  },
  {
    "id": "TH27",
    "name": "Suối Yggdrasil",
    "rarity": "completed",
    "family": "TH27",
    "recipe": [
      "TP05",
      "TP05"
    ],
    "statsText": "+3 Hồi Máu/s",
    "effect": "Suối Nguồn Sự Sống: Hồi lại 2% máu đã mất mỗi giây",
    "stats": {
      "hpRegen": 3.0
    }
  },
  {
    "id": "HL27",
    "name": "Mạch Thế Giới",
    "rarity": "legendary",
    "family": "TH27",
    "recipe": [
      "TP05",
      "TP05"
    ],
    "statsText": "+6 Hồi Máu/s",
    "effect": "Suối Nguồn Sự Sống: Hồi lại 4% máu đã mất mỗi giây",
    "stats": {
      "hpRegen": 6.0
    }
  },
  {
    "id": "TH28",
    "name": "Song Tâm Gemini",
    "rarity": "completed",
    "family": "TH28",
    "recipe": [
      "TP05",
      "TP06"
    ],
    "statsText": "+1,7 Hồi Máu/s; +17% tốc độ Hồi Tài Nguyên/s",
    "effect": "Module Song Song: Khi cả Máu và Tài Nguyên đều trên 50%, gây thêm 10% mọi sát thương. Nếu một trong hai không đạt 50%, chỉ số hồi của thanh có tỷ lệ thấp hơn được tăng 15%.",
    "stats": {
      "hpRegen": 1.7,
      "resourceRegenPct": 0.17
    }
  },
  {
    "id": "HL28",
    "name": "Song Cực Gemini",
    "rarity": "legendary",
    "family": "TH28",
    "recipe": [
      "TP05",
      "TP06"
    ],
    "statsText": "+3,4 Hồi Máu/s; +34% tốc độ Hồi Tài Nguyên/s",
    "effect": "Module Song Song: Khi cả Máu và Tài Nguyên đều trên 50%, gây thêm 20% mọi sát thương. Nếu một trong hai không đạt 50%, chỉ số hồi của thanh có tỷ lệ thấp hơn được tăng 30%.",
    "stats": {
      "hpRegen": 3.4,
      "resourceRegenPct": 0.34
    }
  },
  {
    "id": "TH29",
    "name": "Bình Ambrosia",
    "rarity": "completed",
    "family": "TH29",
    "recipe": [
      "TP05",
      "TP07"
    ],
    "statsText": "+1,7 Hồi Máu/s; +11% Giảm Hồi Chiêu",
    "effect": "Dòng Chảy Sinh Lực: Mỗi khi hiệu lực chính của một kỹ năng kết thúc, hồi dần 5% Máu Tối Đa trong 3 giây. Làm mới thời gian hiệu ứng chứ không cộng dồn.",
    "stats": {
      "hpRegen": 1.7,
      "cooldownReduction": 0.11
    }
  },
  {
    "id": "HL29",
    "name": "Chén Elysium",
    "rarity": "legendary",
    "family": "TH29",
    "recipe": [
      "TP05",
      "TP07"
    ],
    "statsText": "+3,4 Hồi Máu/s; +22% Giảm Hồi Chiêu",
    "effect": "Dòng Chảy Sinh Lực: Mỗi khi hiệu lực chính của một kỹ năng kết thúc, hồi dần 10% Máu Tối Đa trong 3 giây. Làm mới thời gian hiệu ứng chứ không cộng dồn.",
    "stats": {
      "hpRegen": 3.4,
      "cooldownReduction": 0.22
    }
  },
  {
    "id": "TH30",
    "name": "Vuốt Morana",
    "rarity": "completed",
    "family": "TH30",
    "recipe": [
      "TP05",
      "TP08"
    ],
    "statsText": "+1,7 Hồi Máu/s; +15% Tỷ Lệ Chí Mạng",
    "effect": "Huyết Trảo: Đòn chí mạng hồi 0,2% Máu Tối Đa, tối đa hồi 0,6% Máu Tối Đa mỗi giây. Khả năng và giới hạn hồi máu tăng gấp đôi khi chiến cơ còn dưới 30% máu (hồi 0,4% Máu tối đa và tối đa 1,2% Máu tối đa mỗi giây)",
    "stats": {
      "hpRegen": 1.7,
      "criticalChance": 0.15
    }
  },
  {
    "id": "HL30",
    "name": "Nanh Huyết Thần",
    "rarity": "legendary",
    "family": "TH30",
    "recipe": [
      "TP05",
      "TP08"
    ],
    "statsText": "+3,4 Hồi Máu/s; +30% Tỷ Lệ Chí Mạng",
    "effect": "Huyết Trảo: Đòn chí mạng hồi 0,4% Máu Tối Đa, tối đa hồi 1,2% Máu Tối Đa mỗi giây. Khả năng và giới hạn hồi máu tăng gấp đôi khi chiến cơ còn dưới 30% máu (hồi 0,8% Máu tối đa và tối đa 2,4% Máu tối đa mỗi giây)",
    "stats": {
      "hpRegen": 3.4,
      "criticalChance": 0.3
    }
  },
  {
    "id": "TH31",
    "name": "Lõi Ouroboros",
    "rarity": "completed",
    "family": "TH31",
    "recipe": [
      "TP06",
      "TP06"
    ],
    "statsText": "+28% tốc độ Hồi Tài Nguyên/s",
    "effect": "Tăng thêm 12% Tài Nguyên Tối Đa.\nBậc Thượng Lưu: Giảm 15% chi phí Tài Nguyên của mọi kỹ năng.\n\nGhi chú: với Phantom, Điện tối đa vẫn có thể vượt mốc ngoài 100 khi mang 1 hoặc nhiều trang bị này.",
    "stats": {
      "resourceRegenPct": 0.28
    }
  },
  {
    "id": "HL31",
    "name": "Tâm Vĩnh Cửu",
    "rarity": "legendary",
    "family": "TH31",
    "recipe": [
      "TP06",
      "TP06"
    ],
    "statsText": "+56% tốc độ Hồi Tài Nguyên/s",
    "effect": "Tăng thêm 24% Tài Nguyên Tối Đa.\nBậc Thượng Lưu: Giảm 30% chi phí Tài Nguyên của mọi kỹ năng.\n\n\nGhi chú: với Phantom, Điện tối đa vẫn có thể vượt mốc ngoài 100 khi mang 1 hoặc nhiều trang bị này.",
    "stats": {
      "resourceRegenPct": 0.56
    }
  },
  {
    "id": "TH32",
    "name": "Miện Hư Không",
    "rarity": "completed",
    "family": "TH32",
    "recipe": [
      "TP06",
      "TP07"
    ],
    "statsText": "+17% tốc độ Hồi Tài Nguyên/s; +11% Giảm Hồi Chiêu",
    "effect": "Tuần Hoàn: Khi tiêu diệt được 1 kẻ địch, tăng 30% tốc độ hồi phục tài nguyên trong 5 giây, làm mới thời gian hiệu ứng nếu tiêu diệt thêm kẻ thù.",
    "stats": {
      "resourceRegenPct": 0.17,
      "cooldownReduction": 0.11
    }
  },
  {
    "id": "HL32",
    "name": "Thánh Miện Aether",
    "rarity": "legendary",
    "family": "TH32",
    "recipe": [
      "TP06",
      "TP07"
    ],
    "statsText": "+34% tốc độ Hồi Tài Nguyên/s; +22% Giảm Hồi Chiêu",
    "effect": "Tuần Hoàn: Khi tiêu diệt được 1 kẻ địch, tăng 60% tốc độ hồi phục tài nguyên trong 5 giây, làm mới thời gian hiệu ứng nếu tiêu diệt thêm kẻ thù.",
    "stats": {
      "resourceRegenPct": 0.34,
      "cooldownReduction": 0.22
    }
  },
  {
    "id": "TH33",
    "name": "Mặt Nạ Janus",
    "rarity": "completed",
    "family": "TH33",
    "recipe": [
      "TP06",
      "TP08"
    ],
    "statsText": "+17% tốc độ Hồi Tài Nguyên/ss; +15% Tỷ Lệ Chí Mạng",
    "effect": "Ứng Biến: Khi chiến cơ từ 50% máu trở lên, nhận thêm 10% hỏa lực, khi chiến cơ còn dưới 50% máu, hồi lại máu bằng 2% tất cả sát thương gây ra cho kẻ thù.",
    "stats": {
      "resourceRegenPct": 0.17,
      "criticalChance": 0.15
    }
  },
  {
    "id": "HL33",
    "name": "Thánh Diện Janus",
    "rarity": "legendary",
    "family": "TH33",
    "recipe": [
      "TP06",
      "TP08"
    ],
    "statsText": "+34% tốc độ Hồi Tài Nguyên/ss; +30% Tỷ Lệ Chí Mạng",
    "effect": "Ứng Biến: Khi chiến cơ từ 50% máu trở lên, nhận thêm 20% hỏa lực, khi chiến cơ còn dưới 50% máu, hồi lại máu bằng 4% tất cả sát thương gây ra cho kẻ thù.",
    "stats": {
      "resourceRegenPct": 0.34,
      "criticalChance": 0.3
    }
  },
  {
    "id": "TH34",
    "name": "Đồng Hồ Chronos",
    "rarity": "completed",
    "family": "TH34",
    "recipe": [
      "TP07",
      "TP07"
    ],
    "statsText": "+18% Giảm Hồi Chiêu",
    "effect": "Tăng 12% sát thương kỹ năng\nBậc Thầy Combo: Sau khi dùng 1 kỹ năng, giảm 3 giây hồi chiêu cho 2 kỹ năng còn lại nếu đang trong thời gian hồi.",
    "stats": {
      "cooldownReduction": 0.18
    }
  },
  {
    "id": "HL34",
    "name": "Vương Miện Chronos",
    "rarity": "legendary",
    "family": "TH34",
    "recipe": [
      "TP07",
      "TP07"
    ],
    "statsText": "+36% Giảm Hồi Chiêu",
    "effect": "Tăng 24% sát thương kỹ năng\nBậc Thầy Combo: Sau khi dùng 1 kỹ năng, giảm 6 giây hồi chiêu cho 2 kỹ năng còn lại nếu đang trong thời gian hồi.",
    "stats": {
      "cooldownReduction": 0.36
    }
  },
  {
    "id": "TH35",
    "name": "Nanh Thời Gian",
    "rarity": "completed",
    "family": "TH35",
    "recipe": [
      "TP07",
      "TP08"
    ],
    "statsText": "+11% Giảm Hồi Chiêu; +15% Tỷ Lệ Chí Mạng",
    "effect": "Gấp Rút: Mỗi đòn bắn thường giảm 0,25 giây hồi chiêu còn lại của kỹ năng đang có hồi chiêu dài nhất. Nếu đòn bắn thường gây chí mạng sẽ giảm gấp 4 lần (1 giây).",
    "stats": {
      "cooldownReduction": 0.11,
      "criticalChance": 0.15
    }
  },
  {
    "id": "HL35",
    "name": "Thương Xé Thời",
    "rarity": "legendary",
    "family": "TH35",
    "recipe": [
      "TP07",
      "TP08"
    ],
    "statsText": "+22% Giảm Hồi Chiêu; +30% Tỷ Lệ Chí Mạng",
    "effect": "Gấp Rút: Mỗi đòn bắn thường giảm 0,5 giây hồi chiêu còn lại của kỹ năng đang có hồi chiêu dài nhất. Nếu đòn bắn thường gây chí mạng sẽ giảm gấp 4 lần (2 giây).",
    "stats": {
      "cooldownReduction": 0.22,
      "criticalChance": 0.3
    }
  },
  {
    "id": "TH36",
    "name": "Mắt Huyết Nguyệt",
    "rarity": "completed",
    "family": "TH36",
    "recipe": [
      "TP08",
      "TP08"
    ],
    "statsText": "+28% Tỷ Lệ Chí Mạng",
    "effect": "Nhận thêm +45% Sát Thương Chí Mạng.\nRách Da: Đòn chí mạng đặt 1 cộng dồn Chảy Máu lên mục tiêu trong 5 giây, gây sát thương bằng 45% hỏa lực mỗi giây với mỗi cộng dồn, tối đa 3 cộng dồn. Làm mới thời gian hiệu ứng khi trúng thêm đòn chí mạng",
    "stats": {
      "criticalChance": 0.28
    }
  },
  {
    "id": "HL36",
    "name": "Nguyệt Thực Huyết",
    "rarity": "legendary",
    "family": "TH36",
    "recipe": [
      "TP08",
      "TP08"
    ],
    "statsText": "+56% Tỷ Lệ Chí Mạng",
    "effect": "Nhận thêm +90% Sát Thương Chí Mạng.\nRách Da: Đòn chí mạng đặt 1 cộng dồn Chảy Máu lên mục tiêu trong 5 giây, gây sát thương bằng 90% hỏa lực mỗi giây với mỗi cộng dồn, tối đa 3 cộng dồn. Làm mới thời gian hiệu ứng khi trúng thêm đòn chí mạng",
    "stats": {
      "criticalChance": 0.56
    }
  }
];
export const EQUIPMENT_CATALOG = Object.freeze(Object.fromEntries(definitions.map(d => [d.id, Object.freeze({...d, stats:Object.freeze(d.stats), recipe:d.recipe && Object.freeze(d.recipe)})]))) as Readonly<Record<EquipmentDefinitionId, EquipmentDefinition>>;
export const EQUIPMENT_DEFINITIONS = Object.freeze(definitions);
export function equipmentRecipe(a: EquipmentDefinitionId, b: EquipmentDefinitionId): EquipmentDefinitionId | null { return definitions.find(d => d.rarity === "completed" && d.recipe && [...d.recipe].sort().join("+") === [a,b].sort().join("+"))?.id ?? null; }
export const EQUIPMENT_NAME_COLORS = {component:"#ffffff",completed:"#c084fc",legendary:"#fb923c",item:"#60a5fa"} as const;
