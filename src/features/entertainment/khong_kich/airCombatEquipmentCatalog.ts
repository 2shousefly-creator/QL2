export type EquipmentDefinitionId = `TP${string}` | `TH${string}` | `HL${string}`;
export type EquipmentFamilyId = `TH${string}`;
export type EquipmentRarity = "component" | "completed" | "legendary";
export interface EquipmentDefinition { readonly id: EquipmentDefinitionId; readonly name: string; readonly rarity: EquipmentRarity; readonly family?: EquipmentFamilyId; readonly recipe?: readonly EquipmentDefinitionId[]; readonly statsText: string; readonly effect: string; readonly stats: Readonly<Partial<Record<"firepower"|"armor"|"fireRate"|"maxHp"|"hpRegen"|"resourceRegenPct"|"cooldownReduction"|"criticalChance", number>>>; }
const definitions: EquipmentDefinition[] = [
  {
    "id": "TP01",
    "name": "Tinh Thiết",
    "rarity": "component",
    "statsText": "+20 Hỏa Lực",
    "effect": "Tăng trực tiếp Hỏa Lực của chiến cơ.",
    "stats": {
      "firepower": 20
    }
  },
  {
    "id": "TP02",
    "name": "Phong Luân",
    "rarity": "component",
    "statsText": "+0,35 Tốc Độ Bắn",
    "effect": "Tăng số lần khai hỏa đạn thường mỗi giây.",
    "stats": {
      "fireRate": 0.35
    }
  },
  {
    "id": "TP03",
    "name": "Hắc Giáp",
    "rarity": "component",
    "statsText": "+18 Giáp",
    "effect": "Tăng Giáp và giảm sát thương nhận vào theo công thức Giáp hiện hành.",
    "stats": {
      "armor": 18
    }
  },
  {
    "id": "TP04",
    "name": "Cốt Titan",
    "rarity": "component",
    "statsText": "+250 Máu Tối Đa",
    "effect": "Tăng Máu Tối Đa.",
    "stats": {
      "maxHp": 250
    }
  },
  {
    "id": "TP05",
    "name": "Sinh Mạch",
    "rarity": "component",
    "statsText": "+1,3 Hồi Máu/s",
    "effect": "Tăng lượng HP tự hồi mỗi giây.",
    "stats": {
      "hpRegen": 1.3
    }
  },
  {
    "id": "TP06",
    "name": "Tụ Bão",
    "rarity": "component",
    "statsText": "+15% Hồi Tài Nguyên/s",
    "effect": "Tăng tốc độ hồi Mana/Điện tùy chiến cơ.",
    "stats": {
      "resourceRegenPct": 0.15
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
    "effect": "Mọi sát thương trực tiếp tăng 8%.",
    "stats": {
      "firepower": 40
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
    "effect": "Mọi sát thương trực tiếp tăng 16%.",
    "stats": {
      "firepower": 80
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
    "statsText": "+20 Hỏa Lực; +0,35 Tốc Độ Bắn",
    "effect": "Đạn thường trúng: +0,5 cộng dồn; dùng kỹ năng: +4. Tối đa 30 cộng dồn, mỗi cộng dồn +0,015 Tốc Độ Bắn trong 4 giây; nhận sát thương mất 5 cộng dồn.",
    "stats": {
      "firepower": 20,
      "fireRate": 0.35
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
    "statsText": "+40 Hỏa Lực; +0,7 Tốc Độ Bắn",
    "effect": "Đạn thường trúng: +0,5 cộng dồn; dùng kỹ năng: +4. Tối đa 30 cộng dồn, mỗi cộng dồn +0,03 Tốc Độ Bắn trong 4 giây; nhận sát thương mất 5 cộng dồn.",
    "stats": {
      "firepower": 40,
      "fireRate": 0.7
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
    "statsText": "+20 Hỏa Lực; +18 Giáp",
    "effect": "Khi HP dưới 40%: không thể bị chỉ định trong 1,5 giây và hồi 10% Máu đã mất trong thời gian này. Hồi chiêu 60 giây từ khi hiệu ứng kết thúc.",
    "stats": {
      "firepower": 20,
      "armor": 18
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
    "statsText": "+40 Hỏa Lực; +36 Giáp",
    "effect": "Khi HP dưới 40%: không thể bị chỉ định trong 1,5 giây và hồi 20% Máu đã mất trong thời gian này. Hồi chiêu 60 giây từ khi hiệu ứng kết thúc.",
    "stats": {
      "firepower": 40,
      "armor": 36
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
    "statsText": "+20 Hỏa Lực; +250 Máu Tối Đa",
    "effect": "Khi HP dưới 60%: tạo lá chắn bằng 10% Máu Tối Đa trong 8 giây. Hồi chiêu 60 giây từ khi hiệu ứng kết thúc.",
    "stats": {
      "firepower": 20,
      "maxHp": 250
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
    "statsText": "+40 Hỏa Lực; +500 Máu Tối Đa",
    "effect": "Khi HP dưới 60%: tạo lá chắn bằng 20% Máu Tối Đa trong 8 giây. Hồi chiêu 60 giây từ khi hiệu ứng kết thúc.",
    "stats": {
      "firepower": 40,
      "maxHp": 500
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
    "statsText": "+20 Hỏa Lực; +1,3 Hồi Máu/s",
    "effect": "Mỗi 10 giây, sát thương kỹ năng kế tiếp đặt Hỏa Ấn trong 8 giây. 6 đòn thường kích nổ 180% Hỏa Lực lên mục tiêu và 120% Hỏa Lực lên mục tiêu khác trong bán kính 100.",
    "stats": {
      "firepower": 20,
      "hpRegen": 1.3
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
    "statsText": "+40 Hỏa Lực; +2,6 Hồi Máu/s",
    "effect": "Mỗi 10 giây, sát thương kỹ năng kế tiếp đặt Hỏa Ấn trong 8 giây. 6 đòn thường kích nổ 360% Hỏa Lực lên mục tiêu và 240% Hỏa Lực lên mục tiêu khác trong bán kính 100.",
    "stats": {
      "firepower": 40,
      "hpRegen": 2.6
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
    "statsText": "+20 Hỏa Lực; +15% Hồi Tài Nguyên/s",
    "effect": "Mỗi 10 đòn thường trúng hồi 2% Tài Nguyên Tối Đa.",
    "stats": {
      "firepower": 20,
      "resourceRegenPct": 0.15
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
    "statsText": "+40 Hỏa Lực; +30% Hồi Tài Nguyên/s",
    "effect": "Mỗi 10 đòn thường trúng hồi 4% Tài Nguyên Tối Đa.",
    "stats": {
      "firepower": 40,
      "resourceRegenPct": 0.3
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
    "statsText": "+20 Hỏa Lực; +7% Giảm Hồi Chiêu",
    "effect": "+6% Sát Thương Kỹ Năng; kỹ năng trúng khiến mục tiêu nhận thêm 8% mọi sát thương trong 3 giây.",
    "stats": {
      "firepower": 20,
      "cooldownReduction": 0.07
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
    "statsText": "+40 Hỏa Lực; +14% Giảm Hồi Chiêu",
    "effect": "+12% Sát Thương Kỹ Năng; kỹ năng trúng khiến mục tiêu nhận thêm 16% mọi sát thương trong 3 giây.",
    "stats": {
      "firepower": 40,
      "cooldownReduction": 0.14
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
    "statsText": "+20 Hỏa Lực; +10% Tỷ Lệ Chí Mạng",
    "effect": "Kỹ năng có thể chí mạng. Khi có Găng Bảo Thạch: +25% Sát Thương Chí Mạng; chỉ áp dụng một lần theo family.",
    "stats": {
      "firepower": 20,
      "criticalChance": 0.1
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
    "statsText": "+40 Hỏa Lực; +20% Tỷ Lệ Chí Mạng",
    "effect": "Kỹ năng có thể chí mạng. Khi có Găng Bảo Thạch: +50% Sát Thương Chí Mạng; chỉ áp dụng một lần theo family.",
    "stats": {
      "firepower": 40,
      "criticalChance": 0.2
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
    "statsText": "+0,7 Tốc Độ Bắn",
    "effect": "+12% tổng Tốc Độ Bắn; đạn thường thêm 1% HP hiện tại của mục tiêu, giới hạn 20% Hỏa Lực với Tinh Anh/Boss.",
    "stats": {
      "fireRate": 0.7
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
    "statsText": "+1,4 Tốc Độ Bắn",
    "effect": "+24% tổng Tốc Độ Bắn; đạn thường thêm 2% HP hiện tại của mục tiêu, giới hạn 40% Hỏa Lực với Tinh Anh/Boss.",
    "stats": {
      "fireRate": 1.4
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
    "statsText": "+0,35 Tốc Độ Bắn; +18 Giáp",
    "effect": "Nhận sát thương tích tối đa 10 cộng dồn. Đủ cộng dồn: +30 Giáp, +0,2 Tốc Độ Bắn, +0,6 Hồi Máu/s; giữ 5 giây rồi giảm dần.",
    "stats": {
      "fireRate": 0.35,
      "armor": 18
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
    "statsText": "+0,7 Tốc Độ Bắn; +36 Giáp",
    "effect": "Nhận sát thương tích tối đa 10 cộng dồn. Đủ cộng dồn: +60 Giáp, +0,4 Tốc Độ Bắn, +1,2 Hồi Máu/s; giữ 5 giây rồi giảm dần.",
    "stats": {
      "fireRate": 0.7,
      "armor": 36
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
    "statsText": "+0,35 Tốc Độ Bắn; +250 Máu Tối Đa",
    "effect": "Dùng kỹ năng: +0,4 Tốc Độ Bắn trong 5 giây, làm mới thời gian.",
    "stats": {
      "fireRate": 0.35,
      "maxHp": 250
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
    "statsText": "+0,7 Tốc Độ Bắn; +500 Máu Tối Đa",
    "effect": "Dùng kỹ năng: +0,8 Tốc Độ Bắn trong 5 giây, làm mới thời gian.",
    "stats": {
      "fireRate": 0.7,
      "maxHp": 500
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
    "statsText": "+0,35 Tốc Độ Bắn; +1,3 Hồi Máu/s",
    "effect": "Đòn thường thứ 7 tạo 2 tàn ảnh, mỗi tàn ảnh gây 60% Hỏa Lực. Không có mục tiêu phụ: hợp nhất gây 90% Hỏa Lực.",
    "stats": {
      "fireRate": 0.35,
      "hpRegen": 1.3
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
    "statsText": "+0,7 Tốc Độ Bắn; +2,6 Hồi Máu/s",
    "effect": "Đòn thường thứ 7 tạo 2 tàn ảnh, mỗi tàn ảnh gây 120% Hỏa Lực. Không có mục tiêu phụ: hợp nhất gây 180% Hỏa Lực.",
    "stats": {
      "fireRate": 0.7,
      "hpRegen": 2.6
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
    "statsText": "+0,35 Tốc Độ Bắn; +15% Hồi Tài Nguyên/s",
    "effect": "Di chuyển và đạn thường tích Điện Năng. Đạt 100: đòn thường tiếp theo tạo chuỗi sét tối đa 4 mục tiêu, mỗi mục tiêu chịu 75% Hỏa Lực.",
    "stats": {
      "fireRate": 0.35,
      "resourceRegenPct": 0.15
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
    "statsText": "+0,7 Tốc Độ Bắn; +30% Hồi Tài Nguyên/s",
    "effect": "Di chuyển và đạn thường tích Điện Năng. Đạt 100: đòn thường tiếp theo tạo chuỗi sét tối đa 4 mục tiêu, mỗi mục tiêu chịu 150% Hỏa Lực.",
    "stats": {
      "fireRate": 0.7,
      "resourceRegenPct": 0.3
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
    "statsText": "+0,35 Tốc Độ Bắn; +7% Giảm Hồi Chiêu",
    "effect": "Kỹ năng hạ địch: +0,4 Tốc Độ Bắn và +25 Hỏa Lực trong 6 giây.",
    "stats": {
      "fireRate": 0.35,
      "cooldownReduction": 0.07
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
    "statsText": "+0,7 Tốc Độ Bắn; +14% Giảm Hồi Chiêu",
    "effect": "Kỹ năng hạ địch: +0,8 Tốc Độ Bắn và +50 Hỏa Lực trong 6 giây.",
    "stats": {
      "fireRate": 0.7,
      "cooldownReduction": 0.14
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
    "statsText": "+0,35 Tốc Độ Bắn; +10% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng giảm 6 Giáp mục tiêu trong 4 giây, tối đa 3 cộng dồn.",
    "stats": {
      "fireRate": 0.35,
      "criticalChance": 0.1
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
    "statsText": "+0,7 Tốc Độ Bắn; +20% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng giảm 12 Giáp mục tiêu trong 4 giây, tối đa 3 cộng dồn.",
    "stats": {
      "fireRate": 0.7,
      "criticalChance": 0.2
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
    "statsText": "+36 Giáp",
    "effect": "Giảm 8% sát thương nhận và phản lại 100% lượng sát thương đã giảm.",
    "stats": {
      "armor": 36
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
    "statsText": "+72 Giáp",
    "effect": "Giảm 16% sát thương nhận và phản lại 100% lượng sát thương đã giảm.",
    "stats": {
      "armor": 72
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
    "statsText": "+18 Giáp; +250 Máu Tối Đa",
    "effect": "Mỗi 12 giây, lần mất HP đầu tạo lá chắn 7% Máu Tối Đa trong 4 giây.",
    "stats": {
      "armor": 18,
      "maxHp": 250
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
    "statsText": "+36 Giáp; +500 Máu Tối Đa",
    "effect": "Mỗi 12 giây, lần mất HP đầu tạo lá chắn 14% Máu Tối Đa trong 4 giây.",
    "stats": {
      "armor": 36,
      "maxHp": 500
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
    "statsText": "+18 Giáp; +1,3 Hồi Máu/s",
    "effect": "Lưu 20% HP đã mất, tối đa 12% Máu Tối Đa. Sau 3 giây an toàn, hồi 40% bộ đệm.",
    "stats": {
      "armor": 18,
      "hpRegen": 1.3
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
    "statsText": "+36 Giáp; +2,6 Hồi Máu/s",
    "effect": "Lưu 20% HP đã mất, tối đa 12% Máu Tối Đa. Sau 3 giây an toàn, hồi 80% bộ đệm.",
    "stats": {
      "armor": 36,
      "hpRegen": 2.6
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
    "statsText": "+18 Giáp; +15% Hồi Tài Nguyên/s",
    "effect": "Mất HP: hồi 4% Tài Nguyên Tối Đa, hồi chiêu nội tại 5 giây.",
    "stats": {
      "armor": 18,
      "resourceRegenPct": 0.15
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
    "statsText": "+36 Giáp; +30% Hồi Tài Nguyên/s",
    "effect": "Mất HP: hồi 8% Tài Nguyên Tối Đa, hồi chiêu nội tại 5 giây.",
    "stats": {
      "armor": 36,
      "resourceRegenPct": 0.3
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
    "statsText": "+18 Giáp; +7% Giảm Hồi Chiêu",
    "effect": "Dùng kỹ năng: +30 Giáp trong 5 giây.",
    "stats": {
      "armor": 18,
      "cooldownReduction": 0.07
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
    "statsText": "+36 Giáp; +14% Giảm Hồi Chiêu",
    "effect": "Dùng kỹ năng: +60 Giáp trong 5 giây.",
    "stats": {
      "armor": 36,
      "cooldownReduction": 0.14
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
    "statsText": "+18 Giáp; +10% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng: +2,5% Giảm Sát Thương trong 3 giây, tối đa 3 cộng dồn.",
    "stats": {
      "armor": 18,
      "criticalChance": 0.1
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
    "statsText": "+36 Giáp; +20% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng: +5% Giảm Sát Thương trong 3 giây, tối đa 3 cộng dồn.",
    "stats": {
      "armor": 36,
      "criticalChance": 0.2
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
    "statsText": "+500 Máu Tối Đa",
    "effect": "+8% Máu Tối Đa; đạn thường thêm sát thương bằng 0,4% Máu Tối Đa của chiến cơ.",
    "stats": {
      "maxHp": 500
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
    "statsText": "+1000 Máu Tối Đa",
    "effect": "+16% Máu Tối Đa; đạn thường thêm sát thương bằng 0,8% Máu Tối Đa của chiến cơ.",
    "stats": {
      "maxHp": 1000
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
    "statsText": "+250 Máu Tối Đa; +1,3 Hồi Máu/s",
    "effect": "Mỗi lần mất cộng dồn 12% Máu Tối Đa tạo ngọc hồi 4% Máu Tối Đa hoặc lá chắn 6% Máu Tối Đa trong 4 giây.",
    "stats": {
      "maxHp": 250,
      "hpRegen": 1.3
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
    "statsText": "+500 Máu Tối Đa; +2,6 Hồi Máu/s",
    "effect": "Mỗi lần mất cộng dồn 12% Máu Tối Đa tạo ngọc hồi 8% Máu Tối Đa hoặc lá chắn 12% Máu Tối Đa trong 4 giây.",
    "stats": {
      "maxHp": 500,
      "hpRegen": 2.6
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
    "statsText": "+250 Máu Tối Đa; +15% Hồi Tài Nguyên/s",
    "effect": "Mỗi 40% Tài Nguyên Tối Đa đã tiêu thụ gọi thiên thạch gây 160% Hỏa Lực trong bán kính 70, làm chậm 25% trong 2 giây.",
    "stats": {
      "maxHp": 250,
      "resourceRegenPct": 0.15
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
    "statsText": "+500 Máu Tối Đa; +30% Hồi Tài Nguyên/s",
    "effect": "Mỗi 40% Tài Nguyên Tối Đa đã tiêu thụ gọi thiên thạch gây 320% Hỏa Lực trong bán kính 70, làm chậm 25% trong 2 giây.",
    "stats": {
      "maxHp": 500,
      "resourceRegenPct": 0.3
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
    "statsText": "+250 Máu Tối Đa; +7% Giảm Hồi Chiêu",
    "effect": "Mỗi 40 giây khi HP dưới 30%: giảm 3 giây hồi chiêu còn lại của cả 4 kỹ năng và tạo lá chắn 8% Máu Tối Đa trong 4 giây.",
    "stats": {
      "maxHp": 250,
      "cooldownReduction": 0.07
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
    "statsText": "+500 Máu Tối Đa; +14% Giảm Hồi Chiêu",
    "effect": "Mỗi 40 giây khi HP dưới 30%: giảm 6 giây hồi chiêu còn lại của cả 4 kỹ năng và tạo lá chắn 16% Máu Tối Đa trong 4 giây.",
    "stats": {
      "maxHp": 500,
      "cooldownReduction": 0.14
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
    "statsText": "+250 Máu Tối Đa; +10% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng: +2% mọi sát thương trong 5 giây, tối đa 5 cộng dồn.",
    "stats": {
      "maxHp": 250,
      "criticalChance": 0.1
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
    "statsText": "+500 Máu Tối Đa; +20% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng: +4% mọi sát thương trong 5 giây, tối đa 5 cộng dồn.",
    "stats": {
      "maxHp": 500,
      "criticalChance": 0.2
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
    "statsText": "+2,6 Hồi Máu/s",
    "effect": "Hồi thêm 1% Máu đã mất mỗi giây.",
    "stats": {
      "hpRegen": 2.6
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
    "statsText": "+5,2 Hồi Máu/s",
    "effect": "Hồi thêm 2% Máu đã mất mỗi giây.",
    "stats": {
      "hpRegen": 5.2
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
    "statsText": "+1,3 Hồi Máu/s; +15% Hồi Tài Nguyên/s",
    "effect": "HP và Tài Nguyên đều trên 50%: +7% mọi sát thương. Ngược lại, tăng 15% tốc độ hồi thanh có tỷ lệ thấp hơn.",
    "stats": {
      "hpRegen": 1.3,
      "resourceRegenPct": 0.15
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
    "statsText": "+2,6 Hồi Máu/s; +30% Hồi Tài Nguyên/s",
    "effect": "HP và Tài Nguyên đều trên 50%: +14% mọi sát thương. Ngược lại, tăng 30% tốc độ hồi thanh có tỷ lệ thấp hơn.",
    "stats": {
      "hpRegen": 2.6,
      "resourceRegenPct": 0.3
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
    "statsText": "+1,3 Hồi Máu/s; +7% Giảm Hồi Chiêu",
    "effect": "Khi hiệu ứng kỹ năng kết thúc, hồi 4% Máu Tối Đa trong 3 giây. Hồi nội tại 4 giây.",
    "stats": {
      "hpRegen": 1.3,
      "cooldownReduction": 0.07
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
    "statsText": "+2,6 Hồi Máu/s; +14% Giảm Hồi Chiêu",
    "effect": "Khi hiệu ứng kỹ năng kết thúc, hồi 8% Máu Tối Đa trong 3 giây. Hồi nội tại 4 giây.",
    "stats": {
      "hpRegen": 2.6,
      "cooldownReduction": 0.14
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
    "statsText": "+1,3 Hồi Máu/s; +10% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng hồi 0,15% Máu Tối Đa, giới hạn 0,45% mỗi giây. Gấp đôi khi HP dưới 30%.",
    "stats": {
      "hpRegen": 1.3,
      "criticalChance": 0.1
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
    "statsText": "+2,6 Hồi Máu/s; +20% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng hồi 0,3% Máu Tối Đa, giới hạn 0,9% mỗi giây. Gấp đôi khi HP dưới 30%.",
    "stats": {
      "hpRegen": 2.6,
      "criticalChance": 0.2
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
    "statsText": "+24% Hồi Tài Nguyên/s",
    "effect": "+8 Tài Nguyên Tối Đa; giảm 10% chi phí kỹ năng. Phantom có thể vượt 100 Điện.",
    "stats": {
      "resourceRegenPct": 0.24
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
    "statsText": "+48% Hồi Tài Nguyên/s",
    "effect": "+16 Tài Nguyên Tối Đa; giảm 20% chi phí kỹ năng. Phantom có thể vượt 100 Điện.",
    "stats": {
      "resourceRegenPct": 0.48
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
    "statsText": "+15% Hồi Tài Nguyên/s; +7% Giảm Hồi Chiêu",
    "effect": "Hạ địch: +20% Hồi Tài Nguyên trong 5 giây.",
    "stats": {
      "resourceRegenPct": 0.15,
      "cooldownReduction": 0.07
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
    "statsText": "+30% Hồi Tài Nguyên/s; +14% Giảm Hồi Chiêu",
    "effect": "Hạ địch: +40% Hồi Tài Nguyên trong 5 giây.",
    "stats": {
      "resourceRegenPct": 0.3,
      "cooldownReduction": 0.14
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
    "statsText": "+15% Hồi Tài Nguyên/s; +10% Tỷ Lệ Chí Mạng",
    "effect": "HP từ 50%: +6% Hỏa Lực; HP dưới 50%: hồi Máu bằng 1% sát thương gây ra.",
    "stats": {
      "resourceRegenPct": 0.15,
      "criticalChance": 0.1
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
    "statsText": "+30% Hồi Tài Nguyên/s; +20% Tỷ Lệ Chí Mạng",
    "effect": "HP từ 50%: +12% Hỏa Lực; HP dưới 50%: hồi Máu bằng 2% sát thương gây ra.",
    "stats": {
      "resourceRegenPct": 0.3,
      "criticalChance": 0.2
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
    "statsText": "+14% Giảm Hồi Chiêu",
    "effect": "+8% Sát Thương Kỹ Năng; dùng kỹ năng giảm 1 giây hồi chiêu 3 kỹ năng còn lại.",
    "stats": {
      "cooldownReduction": 0.14
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
    "statsText": "+28% Giảm Hồi Chiêu",
    "effect": "+16% Sát Thương Kỹ Năng; dùng kỹ năng giảm 2 giây hồi chiêu 3 kỹ năng còn lại.",
    "stats": {
      "cooldownReduction": 0.28
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
    "statsText": "+7% Giảm Hồi Chiêu; +10% Tỷ Lệ Chí Mạng",
    "effect": "Đạn thường giảm 0,12 giây hồi chiêu dài nhất; chí mạng giảm 0,4 giây. Giới hạn 0,75 giây mỗi giây.",
    "stats": {
      "cooldownReduction": 0.07,
      "criticalChance": 0.1
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
    "statsText": "+14% Giảm Hồi Chiêu; +20% Tỷ Lệ Chí Mạng",
    "effect": "Đạn thường giảm 0,24 giây hồi chiêu dài nhất; chí mạng giảm 0,8 giây. Giới hạn 1,5 giây mỗi giây.",
    "stats": {
      "cooldownReduction": 0.14,
      "criticalChance": 0.2
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
    "statsText": "+20% Tỷ Lệ Chí Mạng",
    "effect": "+25% Sát Thương Chí Mạng. Chí mạng gây Chảy Máu 25% Hỏa Lực/s trong 4 giây, tối đa 2 cộng dồn.",
    "stats": {
      "criticalChance": 0.2
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
    "statsText": "+40% Tỷ Lệ Chí Mạng",
    "effect": "+50% Sát Thương Chí Mạng. Chí mạng gây Chảy Máu 50% Hỏa Lực/s trong 4 giây, tối đa 2 cộng dồn.",
    "stats": {
      "criticalChance": 0.4
    }
  }
];

export function equipmentRecipeStats(id:EquipmentDefinitionId):EquipmentDefinition["stats"] {
 const d=definitions.find(d=>d.id===id)!;
 if(d.rarity==="component"||d.family==="TH31")return d.stats;
 const result:Partial<Record<keyof EquipmentDefinition["stats"],number>>={};
 for(const id of d.recipe??[])for(const [key,value] of Object.entries(definitions.find(c=>c.id===id)!.stats)){
  const stat=key as keyof EquipmentDefinition["stats"];result[stat]=(result[stat]??0)+value*(d.rarity==="legendary"?2:1);
 }
 return result;
}
export const EQUIPMENT_CATALOG = Object.freeze(Object.fromEntries(definitions.map(d => [d.id, Object.freeze({...d, stats:Object.freeze(equipmentRecipeStats(d.id)), recipe:d.recipe && Object.freeze(d.recipe)})]))) as Readonly<Record<EquipmentDefinitionId, EquipmentDefinition>>;
export const EQUIPMENT_DEFINITIONS = Object.freeze(definitions);
export function equipmentRecipe(a: EquipmentDefinitionId, b: EquipmentDefinitionId): EquipmentDefinitionId | null { return definitions.find(d => d.rarity === "completed" && d.recipe && [...d.recipe].sort().join("+") === [a,b].sort().join("+"))?.id ?? null; }
export const EQUIPMENT_NAME_COLORS = {component:"#ffffff",completed:"#c084fc",legendary:"#fb923c",item:"#60a5fa"} as const;
