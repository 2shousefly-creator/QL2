export type EquipmentDefinitionId = `TP${string}` | `TH${string}` | `HL${string}`;
export type EquipmentFamilyId = `TH${string}`;
export type EquipmentRarity = "component" | "completed" | "legendary";
export interface EquipmentDefinition { readonly id: EquipmentDefinitionId; readonly name: string; readonly rarity: EquipmentRarity; readonly family?: EquipmentFamilyId; readonly recipe?: readonly EquipmentDefinitionId[]; readonly statsText: string; readonly effect: string; readonly stats: Readonly<Partial<Record<"firepower"|"armor"|"bonusFireRatePct"|"maxHp"|"hpRegen"|"resourceRegenPct"|"skillHaste"|"criticalChance", number>>>; }
const definitions: EquipmentDefinition[] = [
  {
    "id": "TP01",
    "name": "Tinh Thiết",
    "rarity": "component",
    "statsText": "+20 Hỏa Lực",
    "effect": "",
    "stats": {
      "firepower": 20.0
    }
  },
  {
    "id": "TP02",
    "name": "Phong Luân",
    "rarity": "component",
    "statsText": "+22,5% Tốc Độ Bắn Cộng Thêm",
    "effect": "",
    "stats": {
      "bonusFireRatePct": 0.225
    }
  },
  {
    "id": "TP03",
    "name": "Hắc Giáp",
    "rarity": "component",
    "statsText": "+17 Giáp",
    "effect": "",
    "stats": {
      "armor": 17.0
    }
  },
  {
    "id": "TP04",
    "name": "Cốt Titan",
    "rarity": "component",
    "statsText": "+225 Máu Tối Đa",
    "effect": "",
    "stats": {
      "maxHp": 225.0
    }
  },
  {
    "id": "TP05",
    "name": "Sinh Mạch",
    "rarity": "component",
    "statsText": "+1,25 Hồi Máu/s",
    "effect": "",
    "stats": {
      "hpRegen": 1.25
    }
  },
  {
    "id": "TP06",
    "name": "Tụ Bão",
    "rarity": "component",
    "statsText": "+14% Hồi Tài Nguyên/s",
    "effect": "",
    "stats": {
      "resourceRegenPct": 0.14
    }
  },
  {
    "id": "TP07",
    "name": "Thời Phiến",
    "rarity": "component",
    "statsText": "+8 Điểm Hồi Kỹ Năng",
    "effect": "",
    "stats": {
      "skillHaste": 8.0
    }
  },
  {
    "id": "TP08",
    "name": "Tinh Nhãn",
    "rarity": "component",
    "statsText": "+10% Tỷ Lệ Chí Mạng",
    "effect": "",
    "stats": {
      "criticalChance": 0.1
    }
  },
  {
    "id": "TH01",
    "name": "Pháo Hắc Tinh",
    "rarity": "completed",
    "statsText": "+40 Hỏa Lực",
    "effect": "Gây thêm 12,5% sát thương trực tiếp.",
    "family": "TH01",
    "recipe": [
      "TP01",
      "TP01"
    ],
    "stats": {
      "firepower": 40.0
    }
  },
  {
    "id": "TH02",
    "name": "Luân Cuồng Phong",
    "rarity": "completed",
    "statsText": "+20 Hỏa Lực; +22,5% Tốc Độ Bắn Cộng Thêm",
    "effect": "Đòn đánh thường trúng cho 1 cộng dồn; thi triển kỹ năng cho 5 cộng dồn. Mỗi cộng dồn cho +1,25% Tốc Độ Bắn Cộng Thêm trong 4 giây, tối đa 20 cộng dồn. Khi nhận sát thương, mất 5 cộng dồn. Ở 20 cộng dồn, nhận thêm 14% Sát Thương Đòn Đánh Thường.",
    "family": "TH02",
    "recipe": [
      "TP01",
      "TP02"
    ],
    "stats": {
      "firepower": 20.0,
      "bonusFireRatePct": 0.225
    }
  },
  {
    "id": "TH03",
    "name": "Màn Hư Không",
    "rarity": "completed",
    "statsText": "+20 Hỏa Lực; +17 Giáp",
    "effect": "Khi Máu dưới 40%, trở nên không thể bị chỉ định trong 1,5 giây và hồi 10% Máu đã mất. Khi hiệu ứng kết thúc, gây thêm 10% mọi sát thương trong 4 giây. Hồi Chiêu: 40 giây.",
    "family": "TH03",
    "recipe": [
      "TP01",
      "TP03"
    ],
    "stats": {
      "firepower": 20.0,
      "armor": 17.0
    }
  },
  {
    "id": "TH04",
    "name": "Khiên Huyết Tinh",
    "rarity": "completed",
    "statsText": "+20 Hỏa Lực; +225 Máu Tối Đa",
    "effect": "Khi Máu dưới 60%, tạo Lá Chắn bằng 18% Máu Tối Đa trong 8 giây. Hồi Chiêu: 60 giây sau khi Lá Chắn kết thúc.",
    "family": "TH04",
    "recipe": [
      "TP01",
      "TP04"
    ],
    "stats": {
      "firepower": 20.0,
      "maxHp": 225.0
    }
  },
  {
    "id": "TH05",
    "name": "Lò Prometheus",
    "rarity": "completed",
    "statsText": "+20 Hỏa Lực; +1,25 Hồi Máu/s",
    "effect": "Kỹ năng gây sát thương đặt Hỏa Ấn trong 8 giây. Sau 4 đòn đánh thường trúng mục tiêu có Hỏa Ấn, kích nổ gây 210% Hỏa Lực lên mục tiêu và 140% Hỏa Lực trong bán kính 100 px. Sau khi kích nổ, kỹ năng gây sát thương kế tiếp trong 4 giây gây thêm 17,5% Sát Thương Kỹ Năng.",
    "family": "TH05",
    "recipe": [
      "TP01",
      "TP05"
    ],
    "stats": {
      "firepower": 20.0,
      "hpRegen": 1.25
    }
  },
  {
    "id": "TH06",
    "name": "Bình Tụ Aether",
    "rarity": "completed",
    "statsText": "+20 Hỏa Lực; +14% Hồi Tài Nguyên/s",
    "effect": "Mỗi 8 đòn đánh thường chính trúng kẻ địch, hồi 4% Tài Nguyên Tối Đa. Kỹ năng kế tiếp được thi triển trong 4 giây sau đó giảm 10% Chi Phí Tài Nguyên.",
    "family": "TH06",
    "recipe": [
      "TP01",
      "TP06"
    ],
    "stats": {
      "firepower": 20.0,
      "resourceRegenPct": 0.14
    }
  },
  {
    "id": "TH07",
    "name": "Ấn Hắc Nguyệt",
    "rarity": "completed",
    "statsText": "+20 Hỏa Lực; +8 Điểm Hồi Kỹ Năng",
    "effect": "Nhận +10% Sát Thương Kỹ Năng. Kỹ năng trúng mục tiêu khiến mục tiêu đó nhận thêm 10% mọi sát thương trong 4 giây.",
    "family": "TH07",
    "recipe": [
      "TP01",
      "TP07"
    ],
    "stats": {
      "firepower": 20.0,
      "skillHaste": 8.0
    }
  },
  {
    "id": "TH08",
    "name": "Mắt Tempest",
    "rarity": "completed",
    "statsText": "+20 Hỏa Lực; +10% Tỷ Lệ Chí Mạng",
    "effect": "Kỹ năng có thể chí mạng. Khi có Găng Bảo Thạch, nhận thêm 12,5% Sát Thương Chí Mạng. Hiệu ứng kết hợp chỉ được áp dụng một lần.",
    "family": "TH08",
    "recipe": [
      "TP01",
      "TP08"
    ],
    "stats": {
      "firepower": 20.0,
      "criticalChance": 0.1
    }
  },
  {
    "id": "TH09",
    "name": "Nanh Lôi Ảnh",
    "rarity": "completed",
    "statsText": "+45% Tốc Độ Bắn Cộng Thêm",
    "effect": "+10% Tổng Tốc Độ Bắn. Đòn đánh thường gây thêm sát thương bằng 1% Máu hiện tại của mục tiêu; với Tinh Anh/Boss, sát thương cộng thêm tối đa bằng 25% Hỏa Lực mỗi khi trúng.",
    "family": "TH09",
    "recipe": [
      "TP02",
      "TP02"
    ],
    "stats": {
      "bonusFireRatePct": 0.45
    }
  },
  {
    "id": "TH10",
    "name": "Giáp Colossus",
    "rarity": "completed",
    "statsText": "+22,5% Tốc Độ Bắn Cộng Thêm; +17 Giáp",
    "effect": "Mỗi lần nhận sát thương cho 1 cộng dồn, tối đa 6. Khi đạt 6 cộng dồn, kích hoạt Colossus trong 8 giây, nhận +42 Giáp, +25% Tốc Độ Bắn Cộng Thêm, +1 Hồi Máu/s và +14% mọi sát thương. Trong Colossus, không thể tích thêm cộng dồn; mỗi lần trúng đòn kéo dài 0,5 giây, tối đa thêm 3 giây.",
    "family": "TH10",
    "recipe": [
      "TP02",
      "TP03"
    ],
    "stats": {
      "bonusFireRatePct": 0.225,
      "armor": 17.0
    }
  },
  {
    "id": "TH11",
    "name": "Cánh Valkyrie",
    "rarity": "completed",
    "statsText": "+22,5% Tốc Độ Bắn Cộng Thêm; +225 Máu Tối Đa",
    "effect": "Khi thi triển kỹ năng, nhận +30% Tốc Độ Bắn Cộng Thêm và +10,5% Sát Thương Đòn Đánh Thường trong 6 giây. Hiệu ứng không cộng dồn; chỉ làm mới thời gian.",
    "family": "TH11",
    "recipe": [
      "TP02",
      "TP04"
    ],
    "stats": {
      "bonusFireRatePct": 0.225,
      "maxHp": 225.0
    }
  },
  {
    "id": "TH12",
    "name": "Tâm Cơ Giới",
    "rarity": "completed",
    "statsText": "+22,5% Tốc Độ Bắn Cộng Thêm; +1,25 Hồi Máu/s",
    "effect": "Mỗi đòn đánh thường thứ 5 tạo 2 Tàn Ảnh. Mỗi Tàn Ảnh gây 55% Hỏa Lực lên mục tiêu phụ. Nếu không có mục tiêu phụ, cả hai hợp nhất vào mục tiêu chính và gây tổng 100% Hỏa Lực.",
    "family": "TH12",
    "recipe": [
      "TP02",
      "TP05"
    ],
    "stats": {
      "bonusFireRatePct": 0.225,
      "hpRegen": 1.25
    }
  },
  {
    "id": "TH13",
    "name": "Luân Plasma",
    "rarity": "completed",
    "statsText": "+22,5% Tốc Độ Bắn Cộng Thêm; +14% Hồi Tài Nguyên/s",
    "effect": "Di chuyển và đòn đánh thường tích Điện Năng. Khi đạt 100 Điện Năng, đòn đánh thường kế tiếp tạo chuỗi sét tối đa 4 lần, mỗi lần gây 100% Hỏa Lực. Nếu không còn mục tiêu phụ, các lần nảy còn lại quay về mục tiêu chính và gây 35% sát thương.",
    "family": "TH13",
    "recipe": [
      "TP02",
      "TP06"
    ],
    "stats": {
      "bonusFireRatePct": 0.225,
      "resourceRegenPct": 0.14
    }
  },
  {
    "id": "TH14",
    "name": "Tù Và Ares",
    "rarity": "completed",
    "statsText": "+22,5% Tốc Độ Bắn Cộng Thêm; +8 Điểm Hồi Kỹ Năng",
    "effect": "Khi kỹ năng hạ gục kẻ địch, nhận +30% Tốc Độ Bắn Cộng Thêm, +25 Hỏa Lực và +10,5% Sát Thương Kỹ Năng trong 8 giây. Kỹ năng trực tiếp trúng Tinh Anh/Boss cũng kích hoạt hiệu ứng với 50% sức mạnh. Hiệu ứng không cộng dồn; chỉ làm mới thời gian.",
    "family": "TH14",
    "recipe": [
      "TP02",
      "TP07"
    ],
    "stats": {
      "bonusFireRatePct": 0.225,
      "skillHaste": 8.0
    }
  },
  {
    "id": "TH15",
    "name": "Nanh Fenrir",
    "rarity": "completed",
    "statsText": "+22,5% Tốc Độ Bắn Cộng Thêm; +10% Tỷ Lệ Chí Mạng",
    "effect": "Đòn chí mạng giảm 5 Giáp mục tiêu trong 5 giây, tối đa 4 cộng dồn. Ở 4 cộng dồn, mục tiêu nhận thêm 7,5% mọi sát thương từ chiến cơ.",
    "family": "TH15",
    "recipe": [
      "TP02",
      "TP08"
    ],
    "stats": {
      "bonusFireRatePct": 0.225,
      "criticalChance": 0.1
    }
  },
  {
    "id": "TH16",
    "name": "Giáp Gorgon",
    "rarity": "completed",
    "statsText": "+34 Giáp",
    "effect": "Giảm 8,5% sát thương phải nhận. Tích trữ lượng sát thương đã ngăn chặn; mỗi khi tích đủ 12% Máu Tối Đa, phát sóng xung kích gây 210% Hỏa Lực. Giữ phần tiến độ vượt ngưỡng.",
    "family": "TH16",
    "recipe": [
      "TP03",
      "TP03"
    ],
    "stats": {
      "armor": 34.0
    }
  },
  {
    "id": "TH17",
    "name": "Khiên Atlas",
    "rarity": "completed",
    "statsText": "+17 Giáp; +225 Máu Tối Đa",
    "effect": "Mỗi 10 giây, lần mất Máu đầu tiên tạo một Lá Chắn bằng 8,5% Máu Tối Đa trong 5 giây. Trong khi Lá Chắn còn tồn tại, gây thêm 7% mọi sát thương.",
    "family": "TH17",
    "recipe": [
      "TP03",
      "TP04"
    ],
    "stats": {
      "armor": 17.0,
      "maxHp": 225.0
    }
  },
  {
    "id": "TH18",
    "name": "Giáp Gaia",
    "rarity": "completed",
    "statsText": "+17 Giáp; +1,25 Hồi Máu/s",
    "effect": "25% lượng Máu đã mất được lưu vào Bộ Đệm, tối đa 12,5% Máu Tối Đa. Sau 2,5 giây không mất Máu, hồi 52,5% lượng đang lưu; sau khi hồi, gây thêm 7% mọi sát thương trong 4 giây.",
    "family": "TH18",
    "recipe": [
      "TP03",
      "TP05"
    ],
    "stats": {
      "armor": 17.0,
      "hpRegen": 1.25
    }
  },
  {
    "id": "TH19",
    "name": "Tụ Phản Lực",
    "rarity": "completed",
    "statsText": "+17 Giáp; +14% Hồi Tài Nguyên/s",
    "effect": "Khi mất Máu, hồi 5% Tài Nguyên Tối Đa. Hồi Chiêu: 4 giây. Khi Máu dưới 50%, nhận +17,5% Hồi Tài Nguyên.",
    "family": "TH19",
    "recipe": [
      "TP03",
      "TP06"
    ],
    "stats": {
      "armor": 17.0,
      "resourceRegenPct": 0.14
    }
  },
  {
    "id": "TH20",
    "name": "Khung Hộ Vệ",
    "rarity": "completed",
    "statsText": "+17 Giáp; +8 Điểm Hồi Kỹ Năng",
    "effect": "Khi thi triển kỹ năng, nhận +32 Giáp và giảm 7% sát thương phải nhận trong 5 giây. Hiệu ứng không cộng dồn; chỉ làm mới thời gian.",
    "family": "TH20",
    "recipe": [
      "TP03",
      "TP07"
    ],
    "stats": {
      "armor": 17.0,
      "skillHaste": 8.0
    }
  },
  {
    "id": "TH21",
    "name": "Lăng Kính Aegis",
    "rarity": "completed",
    "statsText": "+17 Giáp; +10% Tỷ Lệ Chí Mạng",
    "effect": "Đòn chí mạng cho +2% Giảm Sát Thương trong 3,5 giây, tối đa 4 cộng dồn. Ở 4 cộng dồn, gây thêm 5% mọi sát thương.",
    "family": "TH21",
    "recipe": [
      "TP03",
      "TP08"
    ],
    "stats": {
      "armor": 17.0,
      "criticalChance": 0.1
    }
  },
  {
    "id": "TH22",
    "name": "Tim Behemoth",
    "rarity": "completed",
    "statsText": "+450 Máu Tối Đa",
    "effect": "Nhận +8,5% Máu Tối Đa. Đòn đánh thường gây thêm sát thương bằng 0,5% Máu Tối Đa của chiến cơ.",
    "family": "TH22",
    "recipe": [
      "TP04",
      "TP04"
    ],
    "stats": {
      "maxHp": 450.0
    }
  },
  {
    "id": "TH23",
    "name": "Chén Elysia",
    "rarity": "completed",
    "statsText": "+225 Máu Tối Đa; +1,25 Hồi Máu/s",
    "effect": "Mỗi khi tổng lượng Máu đã mất đạt 10% Máu Tối Đa, tạo 1 ngọc: hồi 4% Máu Tối Đa hoặc tạo Lá Chắn 7% Máu Tối Đa trong 5 giây. Nhặt ngọc giúp gây thêm 7% mọi sát thương trong 4 giây.",
    "family": "TH23",
    "recipe": [
      "TP04",
      "TP05"
    ],
    "stats": {
      "maxHp": 225.0,
      "hpRegen": 1.25
    }
  },
  {
    "id": "TH24",
    "name": "Lõi Tinh Vân",
    "rarity": "completed",
    "statsText": "+225 Máu Tối Đa; +14% Hồi Tài Nguyên/s",
    "effect": "Mỗi khi tiêu tổng cộng 30% Tài Nguyên Tối Đa, gọi một thiên thạch gây 210% Hỏa Lực trong bán kính 80 px và làm chậm 21% trong 2 giây. Nếu trúng ít nhất 1 mục tiêu, hồi 4% Tài Nguyên Tối Đa.",
    "family": "TH24",
    "recipe": [
      "TP04",
      "TP06"
    ],
    "stats": {
      "maxHp": 225.0,
      "resourceRegenPct": 0.14
    }
  },
  {
    "id": "TH25",
    "name": "Đồng Hồ Lazarus",
    "rarity": "completed",
    "statsText": "+225 Máu Tối Đa; +8 Điểm Hồi Kỹ Năng",
    "effect": "Mỗi 25 giây, nếu Máu dưới 35%, giảm 3,5 giây Hồi Chiêu Còn Lại của cả 4 kỹ năng; tạo Lá Chắn 10,5% Máu Tối Đa trong 5 giây; đồng thời gây thêm 10,5% mọi sát thương trong 6 giây.",
    "family": "TH25",
    "recipe": [
      "TP04",
      "TP07"
    ],
    "stats": {
      "maxHp": 225.0,
      "skillHaste": 8.0
    }
  },
  {
    "id": "TH26",
    "name": "Trống Khaos",
    "rarity": "completed",
    "statsText": "+225 Máu Tối Đa; +10% Tỷ Lệ Chí Mạng",
    "effect": "Mỗi đòn chí mạng cho +1,5% mọi sát thương trong 6 giây, tối đa 6 cộng dồn. Ở 6 cộng dồn, nhận thêm 10% Sát Thương Chí Mạng.",
    "family": "TH26",
    "recipe": [
      "TP04",
      "TP08"
    ],
    "stats": {
      "maxHp": 225.0,
      "criticalChance": 0.1
    }
  },
  {
    "id": "TH27",
    "name": "Suối Yggdrasil",
    "rarity": "completed",
    "statsText": "+2,5 Hồi Máu/s",
    "effect": "Mỗi giây, hồi thêm 1% Máu đã mất.",
    "family": "TH27",
    "recipe": [
      "TP05",
      "TP05"
    ],
    "stats": {
      "hpRegen": 2.5
    }
  },
  {
    "id": "TH28",
    "name": "Song Tâm Gemini",
    "rarity": "completed",
    "statsText": "+1,25 Hồi Máu/s; +14% Hồi Tài Nguyên/s",
    "effect": "Khi cả Máu và Tài Nguyên đều trên 50%, gây thêm 10,5% mọi sát thương. Nếu không, tăng 25% tốc độ hồi của thanh đang có tỷ lệ thấp hơn.",
    "family": "TH28",
    "recipe": [
      "TP05",
      "TP06"
    ],
    "stats": {
      "hpRegen": 1.25,
      "resourceRegenPct": 0.14
    }
  },
  {
    "id": "TH29",
    "name": "Bình Ambrosia",
    "rarity": "completed",
    "statsText": "+1,25 Hồi Máu/s; +8 Điểm Hồi Kỹ Năng",
    "effect": "Khi hiệu ứng của kỹ năng kết thúc, hồi 4% Máu Tối Đa trong 3 giây; phần hồi dư chuyển thành Lá Chắn tối đa 3,5% Máu Tối Đa. Hồi Chiêu: 3 giây.",
    "family": "TH29",
    "recipe": [
      "TP05",
      "TP07"
    ],
    "stats": {
      "hpRegen": 1.25,
      "skillHaste": 8.0
    }
  },
  {
    "id": "TH30",
    "name": "Vuốt Morana",
    "rarity": "completed",
    "statsText": "+1,25 Hồi Máu/s; +10% Tỷ Lệ Chí Mạng",
    "effect": "Đòn chí mạng hồi 0,125% Máu Tối Đa, giới hạn 0,375% mỗi giây. Khi Máu dưới 30%, giới hạn hồi tăng thành 0,75% mỗi giây.",
    "family": "TH30",
    "recipe": [
      "TP05",
      "TP08"
    ],
    "stats": {
      "hpRegen": 1.25,
      "criticalChance": 0.1
    }
  },
  {
    "id": "TH31",
    "name": "Lõi Ouroboros",
    "rarity": "completed",
    "statsText": "+28% Hồi Tài Nguyên/s",
    "effect": "Nhận +14 Tài Nguyên Tối Đa; giảm 14% Chi Phí Tài Nguyên của kỹ năng. Khi Tài Nguyên trên 80%, nhận +7% Sát Thương Kỹ Năng. Phantom có thể vượt 100 Điện.",
    "family": "TH31",
    "recipe": [
      "TP06",
      "TP06"
    ],
    "stats": {
      "resourceRegenPct": 0.28
    }
  },
  {
    "id": "TH32",
    "name": "Miện Hư Không",
    "rarity": "completed",
    "statsText": "+14% Hồi Tài Nguyên/s; +8 Điểm Hồi Kỹ Năng",
    "effect": "Hạ gục kẻ địch cho +28% Hồi Tài Nguyên trong 6 giây. Kỹ năng trực tiếp trúng Tinh Anh/Boss cho +14% trong 6 giây. Trong khi hiệu ứng tăng cường đang hoạt động, nhận +7% Sát Thương Kỹ Năng.",
    "family": "TH32",
    "recipe": [
      "TP06",
      "TP07"
    ],
    "stats": {
      "resourceRegenPct": 0.14,
      "skillHaste": 8.0
    }
  },
  {
    "id": "TH33",
    "name": "Mặt Nạ Janus",
    "rarity": "completed",
    "statsText": "+14% Hồi Tài Nguyên/s; +10% Tỷ Lệ Chí Mạng",
    "effect": "Khi Máu từ 50% trở lên, gây thêm 7,5% mọi sát thương. Khi Máu dưới 50%, hồi Máu bằng 1% sát thương gây ra và giảm 5% sát thương phải nhận.",
    "family": "TH33",
    "recipe": [
      "TP06",
      "TP08"
    ],
    "stats": {
      "resourceRegenPct": 0.14,
      "criticalChance": 0.1
    }
  },
  {
    "id": "TH34",
    "name": "Đồng Hồ Chronos",
    "rarity": "completed",
    "statsText": "+21 Điểm Hồi Kỹ Năng",
    "effect": "Nhận +10% Sát Thương Kỹ Năng. Mỗi khi thi triển kỹ năng, giảm 1 giây Hồi Chiêu Còn Lại của 3 kỹ năng còn lại.",
    "family": "TH34",
    "recipe": [
      "TP07",
      "TP07"
    ],
    "stats": {
      "skillHaste": 21.0
    }
  },
  {
    "id": "TH35",
    "name": "Nanh Thời Gian",
    "rarity": "completed",
    "statsText": "+8 Điểm Hồi Kỹ Năng; +10% Tỷ Lệ Chí Mạng",
    "effect": "Đòn đánh thường trúng giảm 0,09 giây Hồi Chiêu dài nhất; chí mạng giảm 0,3 giây. Tổng mức giảm tối đa 0,6 giây mỗi giây. Sau mỗi 4 giây Hồi Chiêu đã giảm, kỹ năng gây sát thương kế tiếp nhận +5% Sát Thương Kỹ Năng.",
    "family": "TH35",
    "recipe": [
      "TP07",
      "TP08"
    ],
    "stats": {
      "skillHaste": 8.0,
      "criticalChance": 0.1
    }
  },
  {
    "id": "TH36",
    "name": "Mắt Huyết Nguyệt",
    "rarity": "completed",
    "statsText": "+20% Tỷ Lệ Chí Mạng",
    "effect": "Nhận +20% Sát Thương Chí Mạng. Đòn chí mạng gây Chảy Máu, gây 20% Hỏa Lực mỗi giây trong 4 giây, tối đa 3 cộng dồn. Mục tiêu có đủ 3 cộng dồn nhận thêm 4% mọi sát thương.",
    "family": "TH36",
    "recipe": [
      "TP08",
      "TP08"
    ],
    "stats": {
      "criticalChance": 0.2
    }
  },
  {
    "id": "HL01",
    "name": "Tinh Vong Pháo",
    "rarity": "legendary",
    "statsText": "+80 Hỏa Lực",
    "effect": "Gây thêm 25% sát thương trực tiếp.",
    "family": "TH01",
    "recipe": [
      "TP01",
      "TP01"
    ],
    "stats": {
      "firepower": 80.0
    }
  },
  {
    "id": "HL02",
    "name": "Luân Thiên Bạo",
    "rarity": "legendary",
    "statsText": "+40 Hỏa Lực; +45% Tốc Độ Bắn Cộng Thêm",
    "effect": "Đòn đánh thường trúng cho 1 cộng dồn; thi triển kỹ năng cho 5 cộng dồn. Mỗi cộng dồn cho +2,5% Tốc Độ Bắn Cộng Thêm trong 4 giây, tối đa 20 cộng dồn. Khi nhận sát thương, mất 5 cộng dồn. Ở 20 cộng dồn, nhận thêm 28% Sát Thương Đòn Đánh Thường.",
    "family": "TH02",
    "recipe": [
      "TP01",
      "TP02"
    ],
    "stats": {
      "firepower": 40.0,
      "bonusFireRatePct": 0.45
    }
  },
  {
    "id": "HL03",
    "name": "Áo Choàng Nyx",
    "rarity": "legendary",
    "statsText": "+40 Hỏa Lực; +34 Giáp",
    "effect": "Khi Máu dưới 40%, trở nên không thể bị chỉ định trong 1,5 giây và hồi 20% Máu đã mất. Khi hiệu ứng kết thúc, gây thêm 20% mọi sát thương trong 4 giây. Hồi Chiêu: 40 giây.",
    "family": "TH03",
    "recipe": [
      "TP01",
      "TP03"
    ],
    "stats": {
      "firepower": 40.0,
      "armor": 34.0
    }
  },
  {
    "id": "HL04",
    "name": "Thiên Thuẫn Helios",
    "rarity": "legendary",
    "statsText": "+40 Hỏa Lực; +450 Máu Tối Đa",
    "effect": "Khi Máu dưới 60%, tạo Lá Chắn bằng 36% Máu Tối Đa trong 8 giây. Hồi Chiêu: 60 giây sau khi Lá Chắn kết thúc.",
    "family": "TH04",
    "recipe": [
      "TP01",
      "TP04"
    ],
    "stats": {
      "firepower": 40.0,
      "maxHp": 450.0
    }
  },
  {
    "id": "HL05",
    "name": "Tim Phượng Hoàng",
    "rarity": "legendary",
    "statsText": "+40 Hỏa Lực; +2,5 Hồi Máu/s",
    "effect": "Kỹ năng gây sát thương đặt Hỏa Ấn trong 8 giây. Sau 4 đòn đánh thường trúng mục tiêu có Hỏa Ấn, kích nổ gây 420% Hỏa Lực lên mục tiêu và 280% Hỏa Lực trong bán kính 100 px. Sau khi kích nổ, kỹ năng gây sát thương kế tiếp trong 4 giây gây thêm 35% Sát Thương Kỹ Năng.",
    "family": "TH05",
    "recipe": [
      "TP01",
      "TP05"
    ],
    "stats": {
      "firepower": 40.0,
      "hpRegen": 2.5
    }
  },
  {
    "id": "HL06",
    "name": "Giếng Vô Tận",
    "rarity": "legendary",
    "statsText": "+40 Hỏa Lực; +28% Hồi Tài Nguyên/s",
    "effect": "Mỗi 8 đòn đánh thường chính trúng kẻ địch, hồi 8% Tài Nguyên Tối Đa. Kỹ năng kế tiếp được thi triển trong 4 giây sau đó giảm 20% Chi Phí Tài Nguyên.",
    "family": "TH06",
    "recipe": [
      "TP01",
      "TP06"
    ],
    "stats": {
      "firepower": 40.0,
      "resourceRegenPct": 0.28
    }
  },
  {
    "id": "HL07",
    "name": "Vương Ấn Erebus",
    "rarity": "legendary",
    "statsText": "+40 Hỏa Lực; +16 Điểm Hồi Kỹ Năng",
    "effect": "Nhận +20% Sát Thương Kỹ Năng. Kỹ năng trúng mục tiêu khiến mục tiêu đó nhận thêm 20% mọi sát thương trong 4 giây.",
    "family": "TH07",
    "recipe": [
      "TP01",
      "TP07"
    ],
    "stats": {
      "firepower": 40.0,
      "skillHaste": 16.0
    }
  },
  {
    "id": "HL08",
    "name": "Thiên Nhãn Raijin",
    "rarity": "legendary",
    "statsText": "+40 Hỏa Lực; +20% Tỷ Lệ Chí Mạng",
    "effect": "Kỹ năng có thể chí mạng. Khi có Găng Bảo Thạch, nhận thêm 25% Sát Thương Chí Mạng. Hiệu ứng kết hợp chỉ được áp dụng một lần.",
    "family": "TH08",
    "recipe": [
      "TP01",
      "TP08"
    ],
    "stats": {
      "firepower": 40.0,
      "criticalChance": 0.2
    }
  },
  {
    "id": "HL09",
    "name": "Nanh Thiên Lôi",
    "rarity": "legendary",
    "statsText": "+90% Tốc Độ Bắn Cộng Thêm",
    "effect": "+20% Tổng Tốc Độ Bắn. Đòn đánh thường gây thêm sát thương bằng 2% Máu hiện tại của mục tiêu; với Tinh Anh/Boss, sát thương cộng thêm tối đa bằng 50% Hỏa Lực mỗi khi trúng.",
    "family": "TH09",
    "recipe": [
      "TP02",
      "TP02"
    ],
    "stats": {
      "bonusFireRatePct": 0.9
    }
  },
  {
    "id": "HL10",
    "name": "Vương Giáp Colossus",
    "rarity": "legendary",
    "statsText": "+45% Tốc Độ Bắn Cộng Thêm; +34 Giáp",
    "effect": "Mỗi lần nhận sát thương cho 1 cộng dồn, tối đa 6. Khi đạt 6 cộng dồn, kích hoạt Colossus trong 8 giây, nhận +84 Giáp, +50% Tốc Độ Bắn Cộng Thêm, +2 Hồi Máu/s và +28% mọi sát thương. Trong Colossus, không thể tích thêm cộng dồn; mỗi lần trúng đòn kéo dài 0,5 giây, tối đa thêm 3 giây.",
    "family": "TH10",
    "recipe": [
      "TP02",
      "TP03"
    ],
    "stats": {
      "bonusFireRatePct": 0.45,
      "armor": 34.0
    }
  },
  {
    "id": "HL11",
    "name": "Thiên Dực Valkyrie",
    "rarity": "legendary",
    "statsText": "+45% Tốc Độ Bắn Cộng Thêm; +450 Máu Tối Đa",
    "effect": "Khi thi triển kỹ năng, nhận +60% Tốc Độ Bắn Cộng Thêm và +21% Sát Thương Đòn Đánh Thường trong 6 giây. Hiệu ứng không cộng dồn; chỉ làm mới thời gian.",
    "family": "TH11",
    "recipe": [
      "TP02",
      "TP04"
    ],
    "stats": {
      "bonusFireRatePct": 0.45,
      "maxHp": 450.0
    }
  },
  {
    "id": "HL12",
    "name": "Trái Tim Titan",
    "rarity": "legendary",
    "statsText": "+45% Tốc Độ Bắn Cộng Thêm; +2,5 Hồi Máu/s",
    "effect": "Mỗi đòn đánh thường thứ 5 tạo 2 Tàn Ảnh. Mỗi Tàn Ảnh gây 110% Hỏa Lực lên mục tiêu phụ. Nếu không có mục tiêu phụ, cả hai hợp nhất vào mục tiêu chính và gây tổng 200% Hỏa Lực.",
    "family": "TH12",
    "recipe": [
      "TP02",
      "TP05"
    ],
    "stats": {
      "bonusFireRatePct": 0.45,
      "hpRegen": 2.5
    }
  },
  {
    "id": "HL13",
    "name": "Vòng Möbius",
    "rarity": "legendary",
    "statsText": "+45% Tốc Độ Bắn Cộng Thêm; +28% Hồi Tài Nguyên/s",
    "effect": "Di chuyển và đòn đánh thường tích Điện Năng. Khi đạt 100 Điện Năng, đòn đánh thường kế tiếp tạo chuỗi sét tối đa 4 lần, mỗi lần gây 200% Hỏa Lực. Nếu không còn mục tiêu phụ, các lần nảy còn lại quay về mục tiêu chính và gây 70% sát thương.",
    "family": "TH13",
    "recipe": [
      "TP02",
      "TP06"
    ],
    "stats": {
      "bonusFireRatePct": 0.45,
      "resourceRegenPct": 0.28
    }
  },
  {
    "id": "HL14",
    "name": "Kèn Ngày Tận",
    "rarity": "legendary",
    "statsText": "+45% Tốc Độ Bắn Cộng Thêm; +16 Điểm Hồi Kỹ Năng",
    "effect": "Khi kỹ năng hạ gục kẻ địch, nhận +60% Tốc Độ Bắn Cộng Thêm, +50 Hỏa Lực và +21% Sát Thương Kỹ Năng trong 8 giây. Kỹ năng trực tiếp trúng Tinh Anh/Boss cũng kích hoạt hiệu ứng với 50% sức mạnh. Hiệu ứng không cộng dồn; chỉ làm mới thời gian.",
    "family": "TH14",
    "recipe": [
      "TP02",
      "TP07"
    ],
    "stats": {
      "bonusFireRatePct": 0.45,
      "skillHaste": 16.0
    }
  },
  {
    "id": "HL15",
    "name": "Hàm Sói Fenrir",
    "rarity": "legendary",
    "statsText": "+45% Tốc Độ Bắn Cộng Thêm; +20% Tỷ Lệ Chí Mạng",
    "effect": "Đòn chí mạng giảm 10 Giáp mục tiêu trong 5 giây, tối đa 4 cộng dồn. Ở 4 cộng dồn, mục tiêu nhận thêm 15% mọi sát thương từ chiến cơ.",
    "family": "TH15",
    "recipe": [
      "TP02",
      "TP08"
    ],
    "stats": {
      "bonusFireRatePct": 0.45,
      "criticalChance": 0.2
    }
  },
  {
    "id": "HL16",
    "name": "Vương Giáp Gorgon",
    "rarity": "legendary",
    "statsText": "+68 Giáp",
    "effect": "Giảm 17% sát thương phải nhận. Tích trữ lượng sát thương đã ngăn chặn; mỗi khi tích đủ 12% Máu Tối Đa, phát sóng xung kích gây 420% Hỏa Lực. Giữ phần tiến độ vượt ngưỡng.",
    "family": "TH16",
    "recipe": [
      "TP03",
      "TP03"
    ],
    "stats": {
      "armor": 68.0
    }
  },
  {
    "id": "HL17",
    "name": "Thành Trì Atlas",
    "rarity": "legendary",
    "statsText": "+34 Giáp; +450 Máu Tối Đa",
    "effect": "Mỗi 10 giây, lần mất Máu đầu tiên tạo một Lá Chắn bằng 17% Máu Tối Đa trong 5 giây. Trong khi Lá Chắn còn tồn tại, gây thêm 14% mọi sát thương.",
    "family": "TH17",
    "recipe": [
      "TP03",
      "TP04"
    ],
    "stats": {
      "armor": 34.0,
      "maxHp": 450.0
    }
  },
  {
    "id": "HL18",
    "name": "Thánh Giáp Gaia",
    "rarity": "legendary",
    "statsText": "+34 Giáp; +2,5 Hồi Máu/s",
    "effect": "50% lượng Máu đã mất được lưu vào Bộ Đệm, tối đa 25% Máu Tối Đa. Sau 2,5 giây không mất Máu, hồi 105% lượng đang lưu; sau khi hồi, gây thêm 14% mọi sát thương trong 4 giây.",
    "family": "TH18",
    "recipe": [
      "TP03",
      "TP05"
    ],
    "stats": {
      "armor": 34.0,
      "hpRegen": 2.5
    }
  },
  {
    "id": "HL19",
    "name": "Lò Nghịch Biến",
    "rarity": "legendary",
    "statsText": "+34 Giáp; +28% Hồi Tài Nguyên/s",
    "effect": "Khi mất Máu, hồi 10% Tài Nguyên Tối Đa. Hồi Chiêu: 4 giây. Khi Máu dưới 50%, nhận +35% Hồi Tài Nguyên.",
    "family": "TH19",
    "recipe": [
      "TP03",
      "TP06"
    ],
    "stats": {
      "armor": 34.0,
      "resourceRegenPct": 0.28
    }
  },
  {
    "id": "HL20",
    "name": "Pháo Đài Argus",
    "rarity": "legendary",
    "statsText": "+34 Giáp; +16 Điểm Hồi Kỹ Năng",
    "effect": "Khi thi triển kỹ năng, nhận +64 Giáp và giảm 14% sát thương phải nhận trong 5 giây. Hiệu ứng không cộng dồn; chỉ làm mới thời gian.",
    "family": "TH20",
    "recipe": [
      "TP03",
      "TP07"
    ],
    "stats": {
      "armor": 34.0,
      "skillHaste": 16.0
    }
  },
  {
    "id": "HL21",
    "name": "Thánh Kính Aegis",
    "rarity": "legendary",
    "statsText": "+34 Giáp; +20% Tỷ Lệ Chí Mạng",
    "effect": "Đòn chí mạng cho +4% Giảm Sát Thương trong 3,5 giây, tối đa 4 cộng dồn. Ở 4 cộng dồn, gây thêm 10% mọi sát thương.",
    "family": "TH21",
    "recipe": [
      "TP03",
      "TP08"
    ],
    "stats": {
      "armor": 34.0,
      "criticalChance": 0.2
    }
  },
  {
    "id": "HL22",
    "name": "Hạch Behemoth",
    "rarity": "legendary",
    "statsText": "+900 Máu Tối Đa",
    "effect": "Nhận +17% Máu Tối Đa. Đòn đánh thường gây thêm sát thương bằng 1% Máu Tối Đa của chiến cơ.",
    "family": "TH22",
    "recipe": [
      "TP04",
      "TP04"
    ],
    "stats": {
      "maxHp": 900.0
    }
  },
  {
    "id": "HL23",
    "name": "Thánh Tích Elysia",
    "rarity": "legendary",
    "statsText": "+450 Máu Tối Đa; +2,5 Hồi Máu/s",
    "effect": "Mỗi khi tổng lượng Máu đã mất đạt 10% Máu Tối Đa, tạo 1 ngọc: hồi 8% Máu Tối Đa hoặc tạo Lá Chắn 14% Máu Tối Đa trong 5 giây. Nhặt ngọc giúp gây thêm 14% mọi sát thương trong 4 giây.",
    "family": "TH23",
    "recipe": [
      "TP04",
      "TP05"
    ],
    "stats": {
      "maxHp": 450.0,
      "hpRegen": 2.5
    }
  },
  {
    "id": "HL24",
    "name": "Hạch Thiên Hà",
    "rarity": "legendary",
    "statsText": "+450 Máu Tối Đa; +28% Hồi Tài Nguyên/s",
    "effect": "Mỗi khi tiêu tổng cộng 30% Tài Nguyên Tối Đa, gọi một thiên thạch gây 420% Hỏa Lực trong bán kính 80 px và làm chậm 42% trong 2 giây. Nếu trúng ít nhất 1 mục tiêu, hồi 8% Tài Nguyên Tối Đa.",
    "family": "TH24",
    "recipe": [
      "TP04",
      "TP06"
    ],
    "stats": {
      "maxHp": 450.0,
      "resourceRegenPct": 0.28
    }
  },
  {
    "id": "HL25",
    "name": "Thời Khắc Lazarus",
    "rarity": "legendary",
    "statsText": "+450 Máu Tối Đa; +16 Điểm Hồi Kỹ Năng",
    "effect": "Mỗi 25 giây, nếu Máu dưới 35%, giảm 7 giây Hồi Chiêu Còn Lại của cả 4 kỹ năng; tạo Lá Chắn 21% Máu Tối Đa trong 5 giây; đồng thời gây thêm 21% mọi sát thương trong 6 giây.",
    "family": "TH25",
    "recipe": [
      "TP04",
      "TP07"
    ],
    "stats": {
      "maxHp": 450.0,
      "skillHaste": 16.0
    }
  },
  {
    "id": "HL26",
    "name": "Trống Tận Thế",
    "rarity": "legendary",
    "statsText": "+450 Máu Tối Đa; +20% Tỷ Lệ Chí Mạng",
    "effect": "Mỗi đòn chí mạng cho +3% mọi sát thương trong 6 giây, tối đa 6 cộng dồn. Ở 6 cộng dồn, nhận thêm 20% Sát Thương Chí Mạng.",
    "family": "TH26",
    "recipe": [
      "TP04",
      "TP08"
    ],
    "stats": {
      "maxHp": 450.0,
      "criticalChance": 0.2
    }
  },
  {
    "id": "HL27",
    "name": "Mạch Thế Giới",
    "rarity": "legendary",
    "statsText": "+5 Hồi Máu/s",
    "effect": "Mỗi giây, hồi thêm 2% Máu đã mất.",
    "family": "TH27",
    "recipe": [
      "TP05",
      "TP05"
    ],
    "stats": {
      "hpRegen": 5.0
    }
  },
  {
    "id": "HL28",
    "name": "Song Cực Gemini",
    "rarity": "legendary",
    "statsText": "+2,5 Hồi Máu/s; +28% Hồi Tài Nguyên/s",
    "effect": "Khi cả Máu và Tài Nguyên đều trên 50%, gây thêm 21% mọi sát thương. Nếu không, tăng 50% tốc độ hồi của thanh đang có tỷ lệ thấp hơn.",
    "family": "TH28",
    "recipe": [
      "TP05",
      "TP06"
    ],
    "stats": {
      "hpRegen": 2.5,
      "resourceRegenPct": 0.28
    }
  },
  {
    "id": "HL29",
    "name": "Chén Elysium",
    "rarity": "legendary",
    "statsText": "+2,5 Hồi Máu/s; +16 Điểm Hồi Kỹ Năng",
    "effect": "Khi hiệu ứng của kỹ năng kết thúc, hồi 8% Máu Tối Đa trong 3 giây; phần hồi dư chuyển thành Lá Chắn tối đa 7% Máu Tối Đa. Hồi Chiêu: 3 giây.",
    "family": "TH29",
    "recipe": [
      "TP05",
      "TP07"
    ],
    "stats": {
      "hpRegen": 2.5,
      "skillHaste": 16.0
    }
  },
  {
    "id": "HL30",
    "name": "Nanh Huyết Thần",
    "rarity": "legendary",
    "statsText": "+2,5 Hồi Máu/s; +20% Tỷ Lệ Chí Mạng",
    "effect": "Đòn chí mạng hồi 0,25% Máu Tối Đa, giới hạn 0,75% mỗi giây. Khi Máu dưới 30%, giới hạn hồi tăng thành 1,5% mỗi giây.",
    "family": "TH30",
    "recipe": [
      "TP05",
      "TP08"
    ],
    "stats": {
      "hpRegen": 2.5,
      "criticalChance": 0.2
    }
  },
  {
    "id": "HL31",
    "name": "Tâm Vĩnh Cửu",
    "rarity": "legendary",
    "statsText": "+56% Hồi Tài Nguyên/s",
    "effect": "Nhận +28 Tài Nguyên Tối Đa; giảm 28% Chi Phí Tài Nguyên của kỹ năng. Khi Tài Nguyên trên 80%, nhận +14% Sát Thương Kỹ Năng. Phantom có thể vượt 100 Điện.",
    "family": "TH31",
    "recipe": [
      "TP06",
      "TP06"
    ],
    "stats": {
      "resourceRegenPct": 0.56
    }
  },
  {
    "id": "HL32",
    "name": "Thánh Miện Aether",
    "rarity": "legendary",
    "statsText": "+28% Hồi Tài Nguyên/s; +16 Điểm Hồi Kỹ Năng",
    "effect": "Hạ gục kẻ địch cho +56% Hồi Tài Nguyên trong 6 giây. Kỹ năng trực tiếp trúng Tinh Anh/Boss cho +28% trong 6 giây. Trong khi hiệu ứng tăng cường đang hoạt động, nhận +14% Sát Thương Kỹ Năng.",
    "family": "TH32",
    "recipe": [
      "TP06",
      "TP07"
    ],
    "stats": {
      "resourceRegenPct": 0.28,
      "skillHaste": 16.0
    }
  },
  {
    "id": "HL33",
    "name": "Thánh Diện Janus",
    "rarity": "legendary",
    "statsText": "+28% Hồi Tài Nguyên/s; +20% Tỷ Lệ Chí Mạng",
    "effect": "Khi Máu từ 50% trở lên, gây thêm 15% mọi sát thương. Khi Máu dưới 50%, hồi Máu bằng 2% sát thương gây ra và giảm 10% sát thương phải nhận.",
    "family": "TH33",
    "recipe": [
      "TP06",
      "TP08"
    ],
    "stats": {
      "resourceRegenPct": 0.28,
      "criticalChance": 0.2
    }
  },
  {
    "id": "HL34",
    "name": "Vương Miện Chronos",
    "rarity": "legendary",
    "statsText": "+42 Điểm Hồi Kỹ Năng",
    "effect": "Nhận +20% Sát Thương Kỹ Năng. Mỗi khi thi triển kỹ năng, giảm 2 giây Hồi Chiêu Còn Lại của 3 kỹ năng còn lại.",
    "family": "TH34",
    "recipe": [
      "TP07",
      "TP07"
    ],
    "stats": {
      "skillHaste": 42.0
    }
  },
  {
    "id": "HL35",
    "name": "Thương Xé Thời",
    "rarity": "legendary",
    "statsText": "+16 Điểm Hồi Kỹ Năng; +20% Tỷ Lệ Chí Mạng",
    "effect": "Đòn đánh thường trúng giảm 0,18 giây Hồi Chiêu dài nhất; chí mạng giảm 0,6 giây. Tổng mức giảm tối đa 1,2 giây mỗi giây. Sau mỗi 4 giây Hồi Chiêu đã giảm, kỹ năng gây sát thương kế tiếp nhận +10% Sát Thương Kỹ Năng.",
    "family": "TH35",
    "recipe": [
      "TP07",
      "TP08"
    ],
    "stats": {
      "skillHaste": 16.0,
      "criticalChance": 0.2
    }
  },
  {
    "id": "HL36",
    "name": "Nguyệt Thực Huyết",
    "rarity": "legendary",
    "statsText": "+40% Tỷ Lệ Chí Mạng",
    "effect": "Nhận +40% Sát Thương Chí Mạng. Đòn chí mạng gây Chảy Máu, gây 40% Hỏa Lực mỗi giây trong 4 giây, tối đa 3 cộng dồn. Mục tiêu có đủ 3 cộng dồn nhận thêm 8% mọi sát thương.",
    "family": "TH36",
    "recipe": [
      "TP08",
      "TP08"
    ],
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
