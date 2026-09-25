export type EquipmentDefinitionId = `TP${string}` | `TH${string}` | `HL${string}`;
export type EquipmentFamilyId = `TH${string}`;
export type EquipmentRarity = "component" | "completed" | "legendary";
export interface EquipmentDefinition { readonly id: EquipmentDefinitionId; readonly name: string; readonly rarity: EquipmentRarity; readonly family?: EquipmentFamilyId; readonly recipe?: readonly EquipmentDefinitionId[]; readonly statsText: string; readonly effect: string; readonly stats: Readonly<Partial<Record<"firepower"|"armor"|"bonusFireRatePct"|"maxHp"|"hpRegen"|"resourceRegenPct"|"skillHaste"|"criticalChance", number>>>; }
const definitions: EquipmentDefinition[] = [
  {
    "id": "TP01",
    "name": "Tinh Thiết",
    "rarity": "component",
    "statsText": "+28 Hỏa Lực",
    "effect": "",
    "stats": {
      "firepower": 28
    }
  },
  {
    "id": "TP02",
    "name": "Phong Luân",
    "rarity": "component",
    "statsText": "+32,5% Tốc Độ Bắn Cộng Thêm",
    "effect": "",
    "stats": {
      "bonusFireRatePct": .325
    }
  },
  {
    "id": "TP03",
    "name": "Hắc Giáp",
    "rarity": "component",
    "statsText": "+24 Giáp",
    "effect": "",
    "stats": {
      "armor": 24
    }
  },
  {
    "id": "TP04",
    "name": "Cốt Titan",
    "rarity": "component",
    "statsText": "+320 Máu Tối Đa",
    "effect": "",
    "stats": {
      "maxHp": 320
    }
  },
  {
    "id": "TP05",
    "name": "Sinh Mạch",
    "rarity": "component",
    "statsText": "+1,8 Hồi Máu/s",
    "effect": "",
    "stats": {
      "hpRegen": 1.8
    }
  },
  {
    "id": "TP06",
    "name": "Tụ Bão",
    "rarity": "component",
    "statsText": "+20% Hồi Tài Nguyên/s",
    "effect": "",
    "stats": {
      "resourceRegenPct": 0.2
    }
  },
  {
    "id": "TP07",
    "name": "Thời Phiến",
    "rarity": "component",
    "statsText": "+12 Điểm Hồi Kỹ Năng",
    "effect": "",
    "stats": {
      "skillHaste": 12
    }
  },
  {
    "id": "TP08",
    "name": "Tinh Nhãn",
    "rarity": "component",
    "statsText": "+12% Tỷ Lệ Chí Mạng",
    "effect": "",
    "stats": {
      "criticalChance": 0.12
    }
  },
  {
    "id": "TH01",
    "name": "Pháo Hắc Tinh",
    "rarity": "completed",
    "statsText": "+56 Hỏa Lực",
    "effect": "Mọi sát thương trực tiếp tăng 18%.",
    "family": "TH01",
    "recipe": [
      "TP01",
      "TP01"
    ],
    "stats": {
      "firepower": 56
    }
  },
  {
    "id": "TH02",
    "name": "Luân Cuồng Phong",
    "rarity": "completed",
    "statsText": "+28 Hỏa Lực; +32,5% Tốc Độ Bắn Cộng Thêm",
    "effect": "Đạn thường trúng +1 cộng dồn; dùng Skill +5 cộng dồn. Tối đa 20 cộng dồn, mỗi cộng dồn +1,8% Tốc Độ Bắn Cộng Thêm trong 4 giây; nhận sát thương mất 5 cộng dồn. Khi đủ 20 cộng dồn, tăng thêm 20% Basic Damage.",
    "family": "TH02",
    "recipe": [
      "TP01",
      "TP02"
    ],
    "stats": {
      "firepower": 28,
      "bonusFireRatePct": .325
    }
  },
  {
    "id": "TH03",
    "name": "Màn Hư Không",
    "rarity": "completed",
    "statsText": "+28 Hỏa Lực; +24 Giáp",
    "effect": "Khi HP dưới 40%: không thể bị chỉ định trong 2 giây, hồi 15% Máu đã mất và nhận +15% mọi sát thương gây ra trong 4 giây sau khi hiệu ứng kết thúc. Hồi chiêu 40 giây.",
    "family": "TH03",
    "recipe": [
      "TP01",
      "TP03"
    ],
    "stats": {
      "firepower": 28,
      "armor": 24
    }
  },
  {
    "id": "TH04",
    "name": "Khiên Huyết Tinh",
    "rarity": "completed",
    "statsText": "+28 Hỏa Lực; +320 Máu Tối Đa",
    "effect": "Khi HP dưới 60%: tạo Shield bằng 25% Máu Tối Đa trong 8 giây. Hồi chiêu 60 giây sau khi Shield kết thúc.",
    "family": "TH04",
    "recipe": [
      "TP01",
      "TP04"
    ],
    "stats": {
      "firepower": 28,
      "maxHp": 320
    }
  },
  {
    "id": "TH05",
    "name": "Lò Prometheus",
    "rarity": "completed",
    "statsText": "+28 Hỏa Lực; +1,8 Hồi Máu/s",
    "effect": "Sát thương Skill đặt Hỏa Ấn trong 8 giây. 4 Basic hit lên mục tiêu có Hỏa Ấn kích nổ gây 300% Hỏa Lực lên mục tiêu và 200% Hỏa Lực AoE bán kính 100. Sau khi kích nổ, Skill gây damage kế tiếp trong 4 giây nhận +25% Skill Damage.",
    "family": "TH05",
    "recipe": [
      "TP01",
      "TP05"
    ],
    "stats": {
      "firepower": 28,
      "hpRegen": 1.8
    }
  },
  {
    "id": "TH06",
    "name": "Bình Tụ Aether",
    "rarity": "completed",
    "statsText": "+28 Hỏa Lực; +20% Hồi Tài Nguyên/s",
    "effect": "Mỗi 8 Basic chính trúng địch hồi 6% Tài Nguyên Tối Đa; Skill kế tiếp dùng trong 4 giây sau khi kích hoạt được giảm 15% Resource Cost.",
    "family": "TH06",
    "recipe": [
      "TP01",
      "TP06"
    ],
    "stats": {
      "firepower": 28,
      "resourceRegenPct": 0.2
    }
  },
  {
    "id": "TH07",
    "name": "Ấn Hắc Nguyệt",
    "rarity": "completed",
    "statsText": "+28 Hỏa Lực; +12 Điểm Hồi Kỹ Năng",
    "effect": "+15% Skill Damage. Skill trúng khiến mục tiêu nhận thêm 15% mọi sát thương trong 4 giây.",
    "family": "TH07",
    "recipe": [
      "TP01",
      "TP07"
    ],
    "stats": {
      "firepower": 28,
      "skillHaste": 12
    }
  },
  {
    "id": "TH08",
    "name": "Mắt Tempest",
    "rarity": "completed",
    "statsText": "+28 Hỏa Lực; +12% Tỷ Lệ Chí Mạng",
    "effect": "Skill có thể chí mạng và nhận +30% Sát Thương Chí Mạng của Skill. Khi có Găng Bảo Thạch, tăng thêm +25% Sát Thương Chí Mạng của Skill; synergy chỉ áp dụng một lần theo family.",
    "family": "TH08",
    "recipe": [
      "TP01",
      "TP08"
    ],
    "stats": {
      "firepower": 28,
      "criticalChance": 0.12
    }
  },
  {
    "id": "TH09",
    "name": "Nanh Lôi Ảnh",
    "rarity": "completed",
    "statsText": "+65% Tốc Độ Bắn Cộng Thêm",
    "effect": "+54% Tốc Độ Bắn Cộng Thêm; Basic gây thêm sát thương bằng 1,5% HP hiện tại của mục tiêu, với Tinh Anh/Boss giới hạn 35% Hỏa Lực mỗi hit.",
    "family": "TH09",
    "recipe": [
      "TP02",
      "TP02"
    ],
    "stats": {
      "bonusFireRatePct": .65
    }
  },
  {
    "id": "TH10",
    "name": "Giáp Colossus",
    "rarity": "completed",
    "statsText": "+32,5% Tốc Độ Bắn Cộng Thêm; +24 Giáp",
    "effect": "Nhận sát thương +1 cộng dồn, tối đa 6. Đủ 6 cộng dồn kích hoạt Colossus 8 giây: +60 Giáp, +36% Tốc Độ Bắn Cộng Thêm, +1,5 Hồi Máu/s và +20% mọi sát thương. Trong Colossus không tích stack; mỗi lần nhận hit kéo dài 0,5 giây, tối đa thêm 3 giây.",
    "family": "TH10",
    "recipe": [
      "TP02",
      "TP03"
    ],
    "stats": {
      "bonusFireRatePct": .325,
      "armor": 24
    }
  },
  {
    "id": "TH11",
    "name": "Cánh Valkyrie",
    "rarity": "completed",
    "statsText": "+32,5% Tốc Độ Bắn Cộng Thêm; +320 Máu Tối Đa",
    "effect": "Dùng Skill: +43,5% Tốc Độ Bắn Cộng Thêm và +15% Basic Damage trong 6 giây; làm mới thời gian, không cộng dồn.",
    "family": "TH11",
    "recipe": [
      "TP02",
      "TP04"
    ],
    "stats": {
      "bonusFireRatePct": .325,
      "maxHp": 320
    }
  },
  {
    "id": "TH12",
    "name": "Tâm Cơ Giới",
    "rarity": "completed",
    "statsText": "+32,5% Tốc Độ Bắn Cộng Thêm; +1,8 Hồi Máu/s",
    "effect": "Mỗi Basic thứ 5 tạo 2 Tàn Ảnh, mỗi Tàn Ảnh gây 80% Hỏa Lực lên mục tiêu phụ. Nếu không có mục tiêu phụ, hai Tàn Ảnh hợp nhất vào mục tiêu chính gây tổng 140% Hỏa Lực.",
    "family": "TH12",
    "recipe": [
      "TP02",
      "TP05"
    ],
    "stats": {
      "bonusFireRatePct": .325,
      "hpRegen": 1.8
    }
  },
  {
    "id": "TH13",
    "name": "Luân Plasma",
    "rarity": "completed",
    "statsText": "+32,5% Tốc Độ Bắn Cộng Thêm; +20% Hồi Tài Nguyên/s",
    "effect": "Di chuyển và Basic tích Điện Năng. Đạt 100: Basic kế tiếp tạo chuỗi sét tối đa 4 lần, mỗi lần gây 140% Hỏa Lực. Nếu thiếu mục tiêu phụ, các lượt nhảy chưa dùng quay lại mục tiêu chính với 50% sát thương.",
    "family": "TH13",
    "recipe": [
      "TP02",
      "TP06"
    ],
    "stats": {
      "bonusFireRatePct": .325,
      "resourceRegenPct": 0.2
    }
  },
  {
    "id": "TH14",
    "name": "Tù Và Ares",
    "rarity": "completed",
    "statsText": "+32,5% Tốc Độ Bắn Cộng Thêm; +12 Điểm Hồi Kỹ Năng",
    "effect": "Skill hạ địch: +43,5% Tốc Độ Bắn Cộng Thêm, +35 Hỏa Lực và +15% Skill Damage trong 8 giây. Skill trực tiếp trúng Tinh Anh/Boss cũng kích hoạt với 50% hiệu lực. Làm mới thời gian, không cộng dồn.",
    "family": "TH14",
    "recipe": [
      "TP02",
      "TP07"
    ],
    "stats": {
      "bonusFireRatePct": .325,
      "skillHaste": 12
    }
  },
  {
    "id": "TH15",
    "name": "Nanh Fenrir",
    "rarity": "completed",
    "statsText": "+32,5% Tốc Độ Bắn Cộng Thêm; +12% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng giảm 10 Giáp mục tiêu trong 5 giây, tối đa 4 stack. Ở 4 stack, mục tiêu nhận thêm 15% mọi sát thương từ chiến cơ.",
    "family": "TH15",
    "recipe": [
      "TP02",
      "TP08"
    ],
    "stats": {
      "bonusFireRatePct": .325,
      "criticalChance": 0.12
    }
  },
  {
    "id": "TH16",
    "name": "Giáp Gorgon",
    "rarity": "completed",
    "statsText": "+48 Giáp",
    "effect": "Giảm 12% sát thương nhận. Lượng damage được hiệu ứng này ngăn chặn được tích lại; mỗi khi tích đủ 12% Máu Tối Đa, phát shockwave 300% Hỏa Lực. Giữ phần tiến độ vượt ngưỡng.",
    "family": "TH16",
    "recipe": [
      "TP03",
      "TP03"
    ],
    "stats": {
      "armor": 48
    }
  },
  {
    "id": "TH17",
    "name": "Khiên Atlas",
    "rarity": "completed",
    "statsText": "+24 Giáp; +320 Máu Tối Đa",
    "effect": "Mỗi 10 giây, lần mất HP đầu tiên tạo Shield bằng 12% Máu Tối Đa trong 5 giây. Khi Shield còn tồn tại, +10% mọi sát thương.",
    "family": "TH17",
    "recipe": [
      "TP03",
      "TP04"
    ],
    "stats": {
      "armor": 24,
      "maxHp": 320
    }
  },
  {
    "id": "TH18",
    "name": "Giáp Gaia",
    "rarity": "completed",
    "statsText": "+24 Giáp; +1,8 Hồi Máu/s",
    "effect": "35% HP đã mất được lưu vào Bộ Đệm, tối đa 18% Máu Tối Đa. Sau 2,5 giây không mất HP, hồi 75% lượng đang lưu; sau khi hồi nhận +10% mọi sát thương trong 4 giây.",
    "family": "TH18",
    "recipe": [
      "TP03",
      "TP05"
    ],
    "stats": {
      "armor": 24,
      "hpRegen": 1.8
    }
  },
  {
    "id": "TH19",
    "name": "Tụ Phản Lực",
    "rarity": "completed",
    "statsText": "+24 Giáp; +20% Hồi Tài Nguyên/s",
    "effect": "Mất HP hồi 7% Tài Nguyên Tối Đa, hồi nội tại 4 giây. Khi HP dưới 50%, +25% Hồi Tài Nguyên.",
    "family": "TH19",
    "recipe": [
      "TP03",
      "TP06"
    ],
    "stats": {
      "armor": 24,
      "resourceRegenPct": 0.2
    }
  },
  {
    "id": "TH20",
    "name": "Khung Hộ Vệ",
    "rarity": "completed",
    "statsText": "+24 Giáp; +12 Điểm Hồi Kỹ Năng",
    "effect": "Dùng Skill: +45 Giáp và giảm 10% sát thương nhận trong 5 giây. Làm mới thời gian, không cộng dồn.",
    "family": "TH20",
    "recipe": [
      "TP03",
      "TP07"
    ],
    "stats": {
      "armor": 24,
      "skillHaste": 12
    }
  },
  {
    "id": "TH21",
    "name": "Lăng Kính Aegis",
    "rarity": "completed",
    "statsText": "+24 Giáp; +12% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng cho +4% Giảm Sát Thương trong 3,5 giây, tối đa 4 stack. Ở 4 stack, +10% mọi sát thương.",
    "family": "TH21",
    "recipe": [
      "TP03",
      "TP08"
    ],
    "stats": {
      "armor": 24,
      "criticalChance": 0.12
    }
  },
  {
    "id": "TH22",
    "name": "Tim Behemoth",
    "rarity": "completed",
    "statsText": "+640 Máu Tối Đa",
    "effect": "+12% Máu Tối Đa. Basic gây thêm sát thương bằng 0,7% Máu Tối Đa của chiến cơ.",
    "family": "TH22",
    "recipe": [
      "TP04",
      "TP04"
    ],
    "stats": {
      "maxHp": 640
    }
  },
  {
    "id": "TH23",
    "name": "Chén Elysia",
    "rarity": "completed",
    "statsText": "+320 Máu Tối Đa; +1,8 Hồi Máu/s",
    "effect": "Mỗi khi cộng dồn mất 10% Máu Tối Đa, tạo 1 ngọc: hồi 6% Máu Tối Đa hoặc tạo Shield 10% Máu Tối Đa trong 5 giây. Nhặt ngọc cho +10% mọi sát thương trong 4 giây.",
    "family": "TH23",
    "recipe": [
      "TP04",
      "TP05"
    ],
    "stats": {
      "maxHp": 320,
      "hpRegen": 1.8
    }
  },
  {
    "id": "TH24",
    "name": "Lõi Tinh Vân",
    "rarity": "completed",
    "statsText": "+320 Máu Tối Đa; +20% Hồi Tài Nguyên/s",
    "effect": "Mỗi khi tiêu tổng cộng 30% Tài Nguyên Tối Đa, gọi thiên thạch gây 300% Hỏa Lực trong bán kính 80 và làm chậm 30% trong 2 giây. Nếu trúng ít nhất 1 mục tiêu, hồi 6% Tài Nguyên Tối Đa.",
    "family": "TH24",
    "recipe": [
      "TP04",
      "TP06"
    ],
    "stats": {
      "maxHp": 320,
      "resourceRegenPct": 0.2
    }
  },
  {
    "id": "TH25",
    "name": "Đồng Hồ Lazarus",
    "rarity": "completed",
    "statsText": "+320 Máu Tối Đa; +12 Điểm Hồi Kỹ Năng",
    "effect": "Mỗi 25 giây khi HP dưới 35%: giảm 5 giây hồi chiêu còn lại của cả 4 Skill, tạo Shield 15% Máu Tối Đa trong 5 giây và +15% mọi sát thương trong 6 giây.",
    "family": "TH25",
    "recipe": [
      "TP04",
      "TP07"
    ],
    "stats": {
      "maxHp": 320,
      "skillHaste": 12
    }
  },
  {
    "id": "TH26",
    "name": "Trống Khaos",
    "rarity": "completed",
    "statsText": "+320 Máu Tối Đa; +12% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng: +3% mọi sát thương trong 6 giây, tối đa 6 stack. Ở 6 stack, nhận thêm +25% Sát Thương Chí Mạng.",
    "family": "TH26",
    "recipe": [
      "TP04",
      "TP08"
    ],
    "stats": {
      "maxHp": 320,
      "criticalChance": 0.12
    }
  },
  {
    "id": "TH27",
    "name": "Suối Yggdrasil",
    "rarity": "completed",
    "statsText": "+3,6 Hồi Máu/s",
    "effect": "Hồi thêm 1,5% Máu đã mất mỗi giây.",
    "family": "TH27",
    "recipe": [
      "TP05",
      "TP05"
    ],
    "stats": {
      "hpRegen": 3.6
    }
  },
  {
    "id": "TH28",
    "name": "Song Tâm Gemini",
    "rarity": "completed",
    "statsText": "+1,8 Hồi Máu/s; +20% Hồi Tài Nguyên/s",
    "effect": "HP và Tài Nguyên đều trên 50%: +15% mọi sát thương. Nếu không thỏa, tăng 35% tốc độ hồi của thanh đang có tỷ lệ thấp hơn.",
    "family": "TH28",
    "recipe": [
      "TP05",
      "TP06"
    ],
    "stats": {
      "hpRegen": 1.8,
      "resourceRegenPct": 0.2
    }
  },
  {
    "id": "TH29",
    "name": "Bình Ambrosia",
    "rarity": "completed",
    "statsText": "+1,8 Hồi Máu/s; +12 Điểm Hồi Kỹ Năng",
    "effect": "Khi hiệu ứng Skill kết thúc, hồi 6% Máu Tối Đa trong 3 giây; phần hồi dư chuyển thành Shield tối đa 5% Máu Tối Đa. Hồi nội tại 3 giây.",
    "family": "TH29",
    "recipe": [
      "TP05",
      "TP07"
    ],
    "stats": {
      "hpRegen": 1.8,
      "skillHaste": 12
    }
  },
  {
    "id": "TH30",
    "name": "Vuốt Morana",
    "rarity": "completed",
    "statsText": "+1,8 Hồi Máu/s; +12% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng hồi 0,25% Máu Tối Đa, giới hạn 0,75% mỗi giây. Khi HP dưới 30%, giới hạn tăng thành 1,5% mỗi giây.",
    "family": "TH30",
    "recipe": [
      "TP05",
      "TP08"
    ],
    "stats": {
      "hpRegen": 1.8,
      "criticalChance": 0.12
    }
  },
  {
    "id": "TH31",
    "name": "Lõi Ouroboros",
    "rarity": "completed",
    "statsText": "+40% Hồi Tài Nguyên/s",
    "effect": "+20 Tài Nguyên Tối Đa; giảm 20% Resource Cost của Skill. Khi Resource trên 80%, +10% Skill Damage. Phantom có thể vượt 100 Điện.",
    "family": "TH31",
    "recipe": [
      "TP06",
      "TP06"
    ],
    "stats": {
      "resourceRegenPct": 0.4
    }
  },
  {
    "id": "TH32",
    "name": "Miện Hư Không",
    "rarity": "completed",
    "statsText": "+20% Hồi Tài Nguyên/s; +12 Điểm Hồi Kỹ Năng",
    "effect": "Hạ địch: +40% Hồi Tài Nguyên trong 6 giây. Skill trực tiếp trúng Tinh Anh/Boss cho +20% trong 6 giây. Khi buff đang hoạt động, +10% Skill Damage.",
    "family": "TH32",
    "recipe": [
      "TP06",
      "TP07"
    ],
    "stats": {
      "resourceRegenPct": 0.2,
      "skillHaste": 12
    }
  },
  {
    "id": "TH33",
    "name": "Mặt Nạ Janus",
    "rarity": "completed",
    "statsText": "+20% Hồi Tài Nguyên/s; +12% Tỷ Lệ Chí Mạng",
    "effect": "HP từ 50% trở lên: +15% mọi sát thương. HP dưới 50%: hồi Máu bằng 2% sát thương gây ra và giảm 10% sát thương nhận.",
    "family": "TH33",
    "recipe": [
      "TP06",
      "TP08"
    ],
    "stats": {
      "resourceRegenPct": 0.2,
      "criticalChance": 0.12
    }
  },
  {
    "id": "TH34",
    "name": "Đồng Hồ Chronos",
    "rarity": "completed",
    "statsText": "+30 Điểm Hồi Kỹ Năng",
    "effect": "+15% Skill Damage. Dùng Skill giảm 1,5 giây hồi chiêu còn lại của 3 Skill còn lại.",
    "family": "TH34",
    "recipe": [
      "TP07",
      "TP07"
    ],
    "stats": {
      "skillHaste": 30
    }
  },
  {
    "id": "TH35",
    "name": "Nanh Thời Gian",
    "rarity": "completed",
    "statsText": "+12 Điểm Hồi Kỹ Năng; +12% Tỷ Lệ Chí Mạng",
    "effect": "Basic trúng giảm 0,18 giây hồi chiêu dài nhất; chí mạng giảm 0,6 giây. Giới hạn 1,2 giây mỗi giây. Mỗi khi tổng cộng giảm được 4 giây, Skill gây damage kế tiếp nhận +10% Skill Damage.",
    "family": "TH35",
    "recipe": [
      "TP07",
      "TP08"
    ],
    "stats": {
      "skillHaste": 12,
      "criticalChance": 0.12
    }
  },
  {
    "id": "TH36",
    "name": "Mắt Huyết Nguyệt",
    "rarity": "completed",
    "statsText": "+24% Tỷ Lệ Chí Mạng",
    "effect": "+40% Sát Thương Chí Mạng. Chí mạng gây Chảy Máu 40% Hỏa Lực/s trong 4 giây, tối đa 3 stack. Mục tiêu đủ 3 stack nhận thêm 8% mọi sát thương.",
    "family": "TH36",
    "recipe": [
      "TP08",
      "TP08"
    ],
    "stats": {
      "criticalChance": 0.24
    }
  },
  {
    "id": "HL01",
    "name": "Tinh Vong Pháo",
    "rarity": "legendary",
    "statsText": "+112 Hỏa Lực",
    "effect": "Mọi sát thương trực tiếp tăng 36%.",
    "family": "TH01",
    "recipe": [
      "TP01",
      "TP01"
    ],
    "stats": {
      "firepower": 112
    }
  },
  {
    "id": "HL02",
    "name": "Luân Thiên Bạo",
    "rarity": "legendary",
    "statsText": "+56 Hỏa Lực; +65% Tốc Độ Bắn Cộng Thêm",
    "effect": "Đạn thường trúng +1 cộng dồn; dùng Skill +5 cộng dồn. Tối đa 20 cộng dồn, mỗi cộng dồn +3,6% Tốc Độ Bắn Cộng Thêm trong 4 giây; nhận sát thương mất 5 cộng dồn. Khi đủ 20 cộng dồn, tăng thêm 40% Basic Damage.",
    "family": "TH02",
    "recipe": [
      "TP01",
      "TP02"
    ],
    "stats": {
      "firepower": 56,
      "bonusFireRatePct": .65
    }
  },
  {
    "id": "HL03",
    "name": "Áo Choàng Nyx",
    "rarity": "legendary",
    "statsText": "+56 Hỏa Lực; +48 Giáp",
    "effect": "Khi HP dưới 40%: không thể bị chỉ định trong 2 giây, hồi 30% Máu đã mất và nhận +30% mọi sát thương gây ra trong 4 giây sau khi hiệu ứng kết thúc. Hồi chiêu 40 giây.",
    "family": "TH03",
    "recipe": [
      "TP01",
      "TP03"
    ],
    "stats": {
      "firepower": 56,
      "armor": 48
    }
  },
  {
    "id": "HL04",
    "name": "Thiên Thuẫn Helios",
    "rarity": "legendary",
    "statsText": "+56 Hỏa Lực; +640 Máu Tối Đa",
    "effect": "Khi HP dưới 60%: tạo Shield bằng 50% Máu Tối Đa trong 8 giây. Hồi chiêu 60 giây sau khi Shield kết thúc.",
    "family": "TH04",
    "recipe": [
      "TP01",
      "TP04"
    ],
    "stats": {
      "firepower": 56,
      "maxHp": 640
    }
  },
  {
    "id": "HL05",
    "name": "Tim Phượng Hoàng",
    "rarity": "legendary",
    "statsText": "+56 Hỏa Lực; +3,6 Hồi Máu/s",
    "effect": "Sát thương Skill đặt Hỏa Ấn trong 8 giây. 4 Basic hit lên mục tiêu có Hỏa Ấn kích nổ gây 600% Hỏa Lực lên mục tiêu và 400% Hỏa Lực AoE bán kính 100. Sau khi kích nổ, Skill gây damage kế tiếp trong 4 giây nhận +50% Skill Damage.",
    "family": "TH05",
    "recipe": [
      "TP01",
      "TP05"
    ],
    "stats": {
      "firepower": 56,
      "hpRegen": 3.6
    }
  },
  {
    "id": "HL06",
    "name": "Giếng Vô Tận",
    "rarity": "legendary",
    "statsText": "+56 Hỏa Lực; +40% Hồi Tài Nguyên/s",
    "effect": "Mỗi 8 Basic chính trúng địch hồi 12% Tài Nguyên Tối Đa; Skill kế tiếp dùng trong 4 giây sau khi kích hoạt được giảm 30% Resource Cost.",
    "family": "TH06",
    "recipe": [
      "TP01",
      "TP06"
    ],
    "stats": {
      "firepower": 56,
      "resourceRegenPct": 0.4
    }
  },
  {
    "id": "HL07",
    "name": "Vương Ấn Erebus",
    "rarity": "legendary",
    "statsText": "+56 Hỏa Lực; +24 Điểm Hồi Kỹ Năng",
    "effect": "+30% Skill Damage. Skill trúng khiến mục tiêu nhận thêm 30% mọi sát thương trong 4 giây.",
    "family": "TH07",
    "recipe": [
      "TP01",
      "TP07"
    ],
    "stats": {
      "firepower": 56,
      "skillHaste": 24
    }
  },
  {
    "id": "HL08",
    "name": "Thiên Nhãn Raijin",
    "rarity": "legendary",
    "statsText": "+56 Hỏa Lực; +24% Tỷ Lệ Chí Mạng",
    "effect": "Skill có thể chí mạng và nhận +60% Sát Thương Chí Mạng của Skill. Khi có Găng Bảo Thạch, tăng thêm +50% Sát Thương Chí Mạng của Skill; synergy chỉ áp dụng một lần theo family.",
    "family": "TH08",
    "recipe": [
      "TP01",
      "TP08"
    ],
    "stats": {
      "firepower": 56,
      "criticalChance": 0.24
    }
  },
  {
    "id": "HL09",
    "name": "Nanh Thiên Lôi",
    "rarity": "legendary",
    "statsText": "+130% Tốc Độ Bắn Cộng Thêm",
    "effect": "+108% Tốc Độ Bắn Cộng Thêm; Basic gây thêm sát thương bằng 3% HP hiện tại của mục tiêu, với Tinh Anh/Boss giới hạn 70% Hỏa Lực mỗi hit.",
    "family": "TH09",
    "recipe": [
      "TP02",
      "TP02"
    ],
    "stats": {
      "bonusFireRatePct": 1.3
    }
  },
  {
    "id": "HL10",
    "name": "Vương Giáp Colossus",
    "rarity": "legendary",
    "statsText": "+65% Tốc Độ Bắn Cộng Thêm; +48 Giáp",
    "effect": "Nhận sát thương +1 cộng dồn, tối đa 6. Đủ 6 cộng dồn kích hoạt Colossus 8 giây: +120 Giáp, +72% Tốc Độ Bắn Cộng Thêm, +3 Hồi Máu/s và +40% mọi sát thương. Trong Colossus không tích stack; mỗi lần nhận hit kéo dài 0,5 giây, tối đa thêm 3 giây.",
    "family": "TH10",
    "recipe": [
      "TP02",
      "TP03"
    ],
    "stats": {
      "bonusFireRatePct": .65,
      "armor": 48
    }
  },
  {
    "id": "HL11",
    "name": "Thiên Dực Valkyrie",
    "rarity": "legendary",
    "statsText": "+65% Tốc Độ Bắn Cộng Thêm; +640 Máu Tối Đa",
    "effect": "Dùng Skill: +87% Tốc Độ Bắn Cộng Thêm và +30% Basic Damage trong 6 giây; làm mới thời gian, không cộng dồn.",
    "family": "TH11",
    "recipe": [
      "TP02",
      "TP04"
    ],
    "stats": {
      "bonusFireRatePct": .65,
      "maxHp": 640
    }
  },
  {
    "id": "HL12",
    "name": "Trái Tim Titan",
    "rarity": "legendary",
    "statsText": "+65% Tốc Độ Bắn Cộng Thêm; +3,6 Hồi Máu/s",
    "effect": "Mỗi Basic thứ 5 tạo 2 Tàn Ảnh, mỗi Tàn Ảnh gây 160% Hỏa Lực lên mục tiêu phụ. Nếu không có mục tiêu phụ, hai Tàn Ảnh hợp nhất vào mục tiêu chính gây tổng 280% Hỏa Lực.",
    "family": "TH12",
    "recipe": [
      "TP02",
      "TP05"
    ],
    "stats": {
      "bonusFireRatePct": .65,
      "hpRegen": 3.6
    }
  },
  {
    "id": "HL13",
    "name": "Vòng Möbius",
    "rarity": "legendary",
    "statsText": "+65% Tốc Độ Bắn Cộng Thêm; +40% Hồi Tài Nguyên/s",
    "effect": "Di chuyển và Basic tích Điện Năng. Đạt 100: Basic kế tiếp tạo chuỗi sét tối đa 4 lần, mỗi lần gây 280% Hỏa Lực. Nếu thiếu mục tiêu phụ, các lượt nhảy chưa dùng quay lại mục tiêu chính với 50% sát thương.",
    "family": "TH13",
    "recipe": [
      "TP02",
      "TP06"
    ],
    "stats": {
      "bonusFireRatePct": .65,
      "resourceRegenPct": 0.4
    }
  },
  {
    "id": "HL14",
    "name": "Kèn Ngày Tận",
    "rarity": "legendary",
    "statsText": "+65% Tốc Độ Bắn Cộng Thêm; +24 Điểm Hồi Kỹ Năng",
    "effect": "Skill hạ địch: +87% Tốc Độ Bắn Cộng Thêm, +70 Hỏa Lực và +30% Skill Damage trong 8 giây. Skill trực tiếp trúng Tinh Anh/Boss cũng kích hoạt với 50% hiệu lực. Làm mới thời gian, không cộng dồn.",
    "family": "TH14",
    "recipe": [
      "TP02",
      "TP07"
    ],
    "stats": {
      "bonusFireRatePct": .65,
      "skillHaste": 24
    }
  },
  {
    "id": "HL15",
    "name": "Hàm Sói Fenrir",
    "rarity": "legendary",
    "statsText": "+65% Tốc Độ Bắn Cộng Thêm; +24% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng giảm 20 Giáp mục tiêu trong 5 giây, tối đa 4 stack. Ở 4 stack, mục tiêu nhận thêm 30% mọi sát thương từ chiến cơ.",
    "family": "TH15",
    "recipe": [
      "TP02",
      "TP08"
    ],
    "stats": {
      "bonusFireRatePct": .65,
      "criticalChance": 0.24
    }
  },
  {
    "id": "HL16",
    "name": "Vương Giáp Gorgon",
    "rarity": "legendary",
    "statsText": "+96 Giáp",
    "effect": "Giảm 24% sát thương nhận. Lượng damage được hiệu ứng này ngăn chặn được tích lại; mỗi khi tích đủ 12% Máu Tối Đa, phát shockwave 600% Hỏa Lực. Giữ phần tiến độ vượt ngưỡng.",
    "family": "TH16",
    "recipe": [
      "TP03",
      "TP03"
    ],
    "stats": {
      "armor": 96
    }
  },
  {
    "id": "HL17",
    "name": "Thành Trì Atlas",
    "rarity": "legendary",
    "statsText": "+48 Giáp; +640 Máu Tối Đa",
    "effect": "Mỗi 10 giây, lần mất HP đầu tiên tạo Shield bằng 24% Máu Tối Đa trong 5 giây. Khi Shield còn tồn tại, +20% mọi sát thương.",
    "family": "TH17",
    "recipe": [
      "TP03",
      "TP04"
    ],
    "stats": {
      "armor": 48,
      "maxHp": 640
    }
  },
  {
    "id": "HL18",
    "name": "Thánh Giáp Gaia",
    "rarity": "legendary",
    "statsText": "+48 Giáp; +3,6 Hồi Máu/s",
    "effect": "70% HP đã mất được lưu vào Bộ Đệm, tối đa 36% Máu Tối Đa. Sau 2,5 giây không mất HP, hồi 150% lượng đang lưu; sau khi hồi nhận +20% mọi sát thương trong 4 giây.",
    "family": "TH18",
    "recipe": [
      "TP03",
      "TP05"
    ],
    "stats": {
      "armor": 48,
      "hpRegen": 3.6
    }
  },
  {
    "id": "HL19",
    "name": "Lò Nghịch Biến",
    "rarity": "legendary",
    "statsText": "+48 Giáp; +40% Hồi Tài Nguyên/s",
    "effect": "Mất HP hồi 14% Tài Nguyên Tối Đa, hồi nội tại 4 giây. Khi HP dưới 50%, +50% Hồi Tài Nguyên.",
    "family": "TH19",
    "recipe": [
      "TP03",
      "TP06"
    ],
    "stats": {
      "armor": 48,
      "resourceRegenPct": 0.4
    }
  },
  {
    "id": "HL20",
    "name": "Pháo Đài Argus",
    "rarity": "legendary",
    "statsText": "+48 Giáp; +24 Điểm Hồi Kỹ Năng",
    "effect": "Dùng Skill: +90 Giáp và giảm 20% sát thương nhận trong 5 giây. Làm mới thời gian, không cộng dồn.",
    "family": "TH20",
    "recipe": [
      "TP03",
      "TP07"
    ],
    "stats": {
      "armor": 48,
      "skillHaste": 24
    }
  },
  {
    "id": "HL21",
    "name": "Thánh Kính Aegis",
    "rarity": "legendary",
    "statsText": "+48 Giáp; +24% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng cho +8% Giảm Sát Thương trong 3,5 giây, tối đa 4 stack. Ở 4 stack, +20% mọi sát thương.",
    "family": "TH21",
    "recipe": [
      "TP03",
      "TP08"
    ],
    "stats": {
      "armor": 48,
      "criticalChance": 0.24
    }
  },
  {
    "id": "HL22",
    "name": "Hạch Behemoth",
    "rarity": "legendary",
    "statsText": "+1.280 Máu Tối Đa",
    "effect": "+24% Máu Tối Đa. Basic gây thêm sát thương bằng 1,4% Máu Tối Đa của chiến cơ.",
    "family": "TH22",
    "recipe": [
      "TP04",
      "TP04"
    ],
    "stats": {
      "maxHp": 1280
    }
  },
  {
    "id": "HL23",
    "name": "Thánh Tích Elysia",
    "rarity": "legendary",
    "statsText": "+640 Máu Tối Đa; +3,6 Hồi Máu/s",
    "effect": "Mỗi khi cộng dồn mất 10% Máu Tối Đa, tạo 1 ngọc: hồi 12% Máu Tối Đa hoặc tạo Shield 20% Máu Tối Đa trong 5 giây. Nhặt ngọc cho +20% mọi sát thương trong 4 giây.",
    "family": "TH23",
    "recipe": [
      "TP04",
      "TP05"
    ],
    "stats": {
      "maxHp": 640,
      "hpRegen": 3.6
    }
  },
  {
    "id": "HL24",
    "name": "Hạch Thiên Hà",
    "rarity": "legendary",
    "statsText": "+640 Máu Tối Đa; +40% Hồi Tài Nguyên/s",
    "effect": "Mỗi khi tiêu tổng cộng 30% Tài Nguyên Tối Đa, gọi thiên thạch gây 600% Hỏa Lực trong bán kính 80 và làm chậm 60% trong 2 giây. Nếu trúng ít nhất 1 mục tiêu, hồi 12% Tài Nguyên Tối Đa.",
    "family": "TH24",
    "recipe": [
      "TP04",
      "TP06"
    ],
    "stats": {
      "maxHp": 640,
      "resourceRegenPct": 0.4
    }
  },
  {
    "id": "HL25",
    "name": "Thời Khắc Lazarus",
    "rarity": "legendary",
    "statsText": "+640 Máu Tối Đa; +24 Điểm Hồi Kỹ Năng",
    "effect": "Mỗi 25 giây khi HP dưới 35%: giảm 10 giây hồi chiêu còn lại của cả 4 Skill, tạo Shield 30% Máu Tối Đa trong 5 giây và +30% mọi sát thương trong 6 giây.",
    "family": "TH25",
    "recipe": [
      "TP04",
      "TP07"
    ],
    "stats": {
      "maxHp": 640,
      "skillHaste": 24
    }
  },
  {
    "id": "HL26",
    "name": "Trống Tận Thế",
    "rarity": "legendary",
    "statsText": "+640 Máu Tối Đa; +24% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng: +6% mọi sát thương trong 6 giây, tối đa 6 stack. Ở 6 stack, nhận thêm +50% Sát Thương Chí Mạng.",
    "family": "TH26",
    "recipe": [
      "TP04",
      "TP08"
    ],
    "stats": {
      "maxHp": 640,
      "criticalChance": 0.24
    }
  },
  {
    "id": "HL27",
    "name": "Mạch Thế Giới",
    "rarity": "legendary",
    "statsText": "+7,2 Hồi Máu/s",
    "effect": "Hồi thêm 3% Máu đã mất mỗi giây.",
    "family": "TH27",
    "recipe": [
      "TP05",
      "TP05"
    ],
    "stats": {
      "hpRegen": 7.2
    }
  },
  {
    "id": "HL28",
    "name": "Song Cực Gemini",
    "rarity": "legendary",
    "statsText": "+3,6 Hồi Máu/s; +40% Hồi Tài Nguyên/s",
    "effect": "HP và Tài Nguyên đều trên 50%: +30% mọi sát thương. Nếu không thỏa, tăng 70% tốc độ hồi của thanh đang có tỷ lệ thấp hơn.",
    "family": "TH28",
    "recipe": [
      "TP05",
      "TP06"
    ],
    "stats": {
      "hpRegen": 3.6,
      "resourceRegenPct": 0.4
    }
  },
  {
    "id": "HL29",
    "name": "Chén Elysium",
    "rarity": "legendary",
    "statsText": "+3,6 Hồi Máu/s; +24 Điểm Hồi Kỹ Năng",
    "effect": "Khi hiệu ứng Skill kết thúc, hồi 12% Máu Tối Đa trong 3 giây; phần hồi dư chuyển thành Shield tối đa 10% Máu Tối Đa. Hồi nội tại 3 giây.",
    "family": "TH29",
    "recipe": [
      "TP05",
      "TP07"
    ],
    "stats": {
      "hpRegen": 3.6,
      "skillHaste": 24
    }
  },
  {
    "id": "HL30",
    "name": "Nanh Huyết Thần",
    "rarity": "legendary",
    "statsText": "+3,6 Hồi Máu/s; +24% Tỷ Lệ Chí Mạng",
    "effect": "Chí mạng hồi 0,5% Máu Tối Đa, giới hạn 1,5% mỗi giây. Khi HP dưới 30%, giới hạn tăng thành 3% mỗi giây.",
    "family": "TH30",
    "recipe": [
      "TP05",
      "TP08"
    ],
    "stats": {
      "hpRegen": 3.6,
      "criticalChance": 0.24
    }
  },
  {
    "id": "HL31",
    "name": "Tâm Vĩnh Cửu",
    "rarity": "legendary",
    "statsText": "+80% Hồi Tài Nguyên/s",
    "effect": "+40 Tài Nguyên Tối Đa; giảm 40% Resource Cost của Skill. Khi Resource trên 80%, +20% Skill Damage. Phantom có thể vượt 100 Điện.",
    "family": "TH31",
    "recipe": [
      "TP06",
      "TP06"
    ],
    "stats": {
      "resourceRegenPct": 0.8
    }
  },
  {
    "id": "HL32",
    "name": "Thánh Miện Aether",
    "rarity": "legendary",
    "statsText": "+40% Hồi Tài Nguyên/s; +24 Điểm Hồi Kỹ Năng",
    "effect": "Hạ địch: +80% Hồi Tài Nguyên trong 6 giây. Skill trực tiếp trúng Tinh Anh/Boss cho +40% trong 6 giây. Khi buff đang hoạt động, +20% Skill Damage.",
    "family": "TH32",
    "recipe": [
      "TP06",
      "TP07"
    ],
    "stats": {
      "resourceRegenPct": 0.4,
      "skillHaste": 24
    }
  },
  {
    "id": "HL33",
    "name": "Thánh Diện Janus",
    "rarity": "legendary",
    "statsText": "+40% Hồi Tài Nguyên/s; +24% Tỷ Lệ Chí Mạng",
    "effect": "HP từ 50% trở lên: +30% mọi sát thương. HP dưới 50%: hồi Máu bằng 4% sát thương gây ra và giảm 20% sát thương nhận.",
    "family": "TH33",
    "recipe": [
      "TP06",
      "TP08"
    ],
    "stats": {
      "resourceRegenPct": 0.4,
      "criticalChance": 0.24
    }
  },
  {
    "id": "HL34",
    "name": "Vương Miện Chronos",
    "rarity": "legendary",
    "statsText": "+60 Điểm Hồi Kỹ Năng",
    "effect": "+30% Skill Damage. Dùng Skill giảm 3 giây hồi chiêu còn lại của 3 Skill còn lại.",
    "family": "TH34",
    "recipe": [
      "TP07",
      "TP07"
    ],
    "stats": {
      "skillHaste": 60
    }
  },
  {
    "id": "HL35",
    "name": "Thương Xé Thời",
    "rarity": "legendary",
    "statsText": "+24 Điểm Hồi Kỹ Năng; +24% Tỷ Lệ Chí Mạng",
    "effect": "Basic trúng giảm 0,36 giây hồi chiêu dài nhất; chí mạng giảm 1,2 giây. Giới hạn 2,4 giây mỗi giây. Mỗi khi tổng cộng giảm được 4 giây, Skill gây damage kế tiếp nhận +20% Skill Damage.",
    "family": "TH35",
    "recipe": [
      "TP07",
      "TP08"
    ],
    "stats": {
      "skillHaste": 24,
      "criticalChance": 0.24
    }
  },
  {
    "id": "HL36",
    "name": "Nguyệt Thực Huyết",
    "rarity": "legendary",
    "statsText": "+48% Tỷ Lệ Chí Mạng",
    "effect": "+80% Sát Thương Chí Mạng. Chí mạng gây Chảy Máu 80% Hỏa Lực/s trong 4 giây, tối đa 3 stack. Mục tiêu đủ 3 stack nhận thêm 16% mọi sát thương.",
    "family": "TH36",
    "recipe": [
      "TP08",
      "TP08"
    ],
    "stats": {
      "criticalChance": 0.48
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
