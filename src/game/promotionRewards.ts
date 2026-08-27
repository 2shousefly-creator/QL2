import { RankStep, GameState } from "./types";
import { createDefaultFarmState } from "../features/tang_gia/farmEngine";

export type RewardItem = {
  id: string;
  category: "seeds" | "animals" | "feed" | "fertilizer";
  name: string;
  icon: string;
  quantity: number;
};

/**
 * Gets the Tang Gia rewards for a specific RankStep.
 */
export function getPromotionRewards(rank: RankStep): RewardItem[] {
  const familyId = rank.familyId;
  const tier = rank.tier;

  const rewards: RewardItem[] = [];

  switch (familyId) {
    case "enlisted_1": // Binh Bét
      if (tier === 1) {
        rewards.push({ id: "chicken", category: "animals", name: "Gà", icon: "🐓", quantity: 1 });
        rewards.push({ id: "feed_normal", category: "feed", name: "Thức ăn loại thường", icon: "🌾", quantity: 1 });
      } else if (tier === 2) {
        rewards.push({ id: "feed_normal", category: "feed", name: "Thức ăn loại thường", icon: "🌾", quantity: 1 });
      }
      break;

    case "enlisted_2": // Binh Nhì
      if (tier === 1) {
        rewards.push({ id: "duck", category: "animals", name: "Vịt", icon: "🦆", quantity: 1 });
        rewards.push({ id: "feed_normal", category: "feed", name: "Thức ăn loại thường", icon: "🌾", quantity: 1 });
      } else if (tier === 2) {
        rewards.push({ id: "feed_normal", category: "feed", name: "Thức ăn loại thường", icon: "🌾", quantity: 1 });
      }
      break;

    case "enlisted_3": // Binh Nhất
      if (tier === 1) {
        rewards.push({ id: "feed_normal", category: "feed", name: "Thức ăn loại thường", icon: "🌾", quantity: 2 });
      } else if (tier >= 2 && tier <= 4) {
        rewards.push({ id: "feed_normal", category: "feed", name: "Thức ăn loại thường", icon: "🌾", quantity: 1 });
      }
      break;

    case "nco_1": // Hạ Sĩ
      if (tier === 1) {
        rewards.push({ id: "quail", category: "animals", name: "Chim Cút", icon: "🐦", quantity: 1 });
        rewards.push({ id: "feed_good", category: "feed", name: "Thức ăn loại tốt", icon: "🌾", quantity: 2 });
      } else if (tier >= 2 && tier <= 6) {
        rewards.push({ id: "feed_good", category: "feed", name: "Thức ăn loại tốt", icon: "🌾", quantity: 1 });
      }
      break;

    case "nco_2": // Trung Sĩ
      if (tier === 1) {
        rewards.push({ id: "corn", category: "seeds", name: "Ngô", icon: "🌽", quantity: 1 });
        rewards.push({ id: "fertilizer_nutrition_medium", category: "fertilizer", name: "Phân Dinh Dưỡng Loại Vừa", icon: "🌱", quantity: 1 });
      } else if (tier >= 2 && tier <= 6) {
        rewards.push({ id: "feed_good", category: "feed", name: "Thức ăn loại tốt", icon: "🌾", quantity: 1 });
      }
      break;

    case "nco_3": // Thượng Sĩ
      if (tier === 1) {
        rewards.push({ id: "goose", category: "animals", name: "Ngỗng", icon: "🪿", quantity: 1 });
        rewards.push({ id: "feed_good", category: "feed", name: "Thức ăn loại tốt", icon: "🌾", quantity: 2 });
      } else if (tier >= 2 && tier <= 6) {
        rewards.push({ id: "feed_good", category: "feed", name: "Thức ăn loại tốt", icon: "🌾", quantity: 1 });
      }
      break;

    case "junior_1": // Thiếu Úy
      if (tier === 1) {
        rewards.push({ id: "watermelon", category: "seeds", name: "Dưa Hấu", icon: "🍉", quantity: 1 });
        rewards.push({ id: "fertilizer_nutrition_good", category: "fertilizer", name: "Phân Dinh Dưỡng Loại Tốt", icon: "🌱", quantity: 1 });
      } else if (tier >= 2 && tier <= 8) {
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 1 });
      }
      break;

    case "junior_2": // Trung Úy
      if (tier === 1) {
        rewards.push({ id: "muscovy_duck", category: "animals", name: "Ngan", icon: "🦆", quantity: 2 });
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 3 });
      } else if (tier >= 2 && tier <= 8) {
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 2 });
      }
      break;

    case "junior_3": // Thượng Úy
      if (tier === 1) {
        rewards.push({ id: "banana", category: "seeds", name: "Chuối", icon: "🍌", quantity: 2 });
        rewards.push({ id: "fertilizer_growth_good", category: "fertilizer", name: "Phân Tăng Trưởng Loại Tốt", icon: "⏱", quantity: 2 });
      } else if (tier >= 2 && tier <= 8) {
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 2 });
      }
      break;

    case "junior_4": // Đại Úy
      if (tier === 1) {
        rewards.push({ id: "turkey", category: "animals", name: "Gà Tây", icon: "🦃", quantity: 2 });
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 5 });
      } else if (tier >= 2 && tier <= 8) {
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 3 });
      }
      break;

    case "field_1": // Thiếu Tá
      if (tier === 1) {
        rewards.push({ id: "mango", category: "seeds", name: "Xoài", icon: "🥭", quantity: 3 });
        rewards.push({ id: "fertilizer_nutrition_super", category: "fertilizer", name: "Phân Dinh Dưỡng Loại Siêu Tốt", icon: "🌱", quantity: 3 });
        rewards.push({ id: "fertilizer_growth_super", category: "fertilizer", name: "Phân Tăng Trưởng Loại Siêu Tốt", icon: "⏱", quantity: 3 });
      } else if (tier !== null && tier >= 2 && tier <= 10) {
        if (tier % 2 === 0) {
          rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 3 });
          rewards.push({ id: "fertilizer_nutrition_super", category: "fertilizer", name: "Phân Dinh Dưỡng Loại Siêu Tốt", icon: "🌱", quantity: 3 });
        } else {
          rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 3 });
          rewards.push({ id: "fertilizer_growth_super", category: "fertilizer", name: "Phân Tăng Trưởng Loại Siêu Tốt", icon: "⏱", quantity: 3 });
        }
      }
      break;

    case "field_2": // Trung Tá
      if (tier === 1) {
        rewards.push({ id: "guinea_fowl", category: "animals", name: "Gà Sao", icon: "🐥", quantity: 2 });
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 6 });
      } else if (tier !== null && tier >= 2 && tier <= 10) {
        if (tier % 2 === 0) {
          rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 4 });
          rewards.push({ id: "fertilizer_nutrition_super", category: "fertilizer", name: "Phân Dinh Dưỡng Loại Siêu Tốt", icon: "🌱", quantity: 4 });
        } else {
          rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 4 });
          rewards.push({ id: "fertilizer_growth_super", category: "fertilizer", name: "Phân Tăng Trưởng Loại Siêu Tốt", icon: "⏱", quantity: 4 });
        }
      }
      break;

    case "field_3": // Thượng Tá
      if (tier === 1) {
        rewards.push({ id: "pear", category: "seeds", name: "Lê", icon: "🍐", quantity: 5 });
        rewards.push({ id: "fertilizer_nutrition_super", category: "fertilizer", name: "Phân Dinh Dưỡng Loại Siêu Tốt", icon: "🌱", quantity: 5 });
        rewards.push({ id: "fertilizer_growth_super", category: "fertilizer", name: "Phân Tăng Trưởng Loại Siêu Tốt", icon: "⏱", quantity: 5 });
      } else if (tier !== null && tier >= 2 && tier <= 10) {
        if (tier % 2 === 0) {
          rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 5 });
          rewards.push({ id: "fertilizer_nutrition_super", category: "fertilizer", name: "Phân Dinh Dưỡng Loại Siêu Tốt", icon: "🌱", quantity: 5 });
        } else {
          rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 5 });
          rewards.push({ id: "fertilizer_growth_super", category: "fertilizer", name: "Phân Tăng Trưởng Loại Siêu Tốt", icon: "⏱", quantity: 5 });
        }
      }
      break;

    case "field_4": // Đại Tá
      if (tier === 1) {
        rewards.push({ id: "pheasant", category: "animals", name: "Chim Trĩ", icon: "🕊️", quantity: 2 });
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 9 });
        rewards.push({ id: "fertilizer_premium_3", category: "fertilizer", name: "Phân Cao Cấp Loại 3", icon: "✨", quantity: 9 });
      } else if (tier >= 2 && tier <= 10) {
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 6 });
        rewards.push({ id: "fertilizer_premium_3", category: "fertilizer", name: "Phân Cao Cấp Loại 3", icon: "✨", quantity: 6 });
      }
      break;

    case "general_1": // Thiếu Tướng
      if (tier === 1) {
        rewards.push({ id: "dragon_fruit", category: "seeds", name: "Lúa", icon: "🌾", quantity: 7 });
        rewards.push({ id: "fertilizer_premium_3", category: "fertilizer", name: "Phân Cao Cấp Loại 3", icon: "✨", quantity: 7 });
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 7 });
      } else if (tier >= 2 && tier <= 12) {
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 7 });
        rewards.push({ id: "fertilizer_premium_3", category: "fertilizer", name: "Phân Cao Cấp Loại 3", icon: "✨", quantity: 7 });
      }
      break;

    case "general_2": // Trung Tướng
      if (tier === 1) {
        rewards.push({ id: "peafowl", category: "animals", name: "Công", icon: "🦚", quantity: 2 });
        rewards.push({ id: "fertilizer_premium_2", category: "fertilizer", name: "Phân Cao Cấp Loại 2", icon: "✨", quantity: 12 });
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 12 });
      } else if (tier >= 2 && tier <= 12) {
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 8 });
        rewards.push({ id: "fertilizer_premium_2", category: "fertilizer", name: "Phân Cao Cấp Loại 2", icon: "✨", quantity: 8 });
      }
      break;

    case "general_3": // Thượng Tướng
      if (tier === 1) {
        rewards.push({ id: "durian", category: "seeds", name: "Sầu Riêng", icon: "🍈", quantity: 9 });
        rewards.push({ id: "fertilizer_premium_2", category: "fertilizer", name: "Phân Cao Cấp Loại 2", icon: "✨", quantity: 9 });
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 9 });
      } else if (tier >= 2 && tier <= 12) {
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 9 });
        rewards.push({ id: "fertilizer_premium_2", category: "fertilizer", name: "Phân Cao Cấp Loại 2", icon: "✨", quantity: 9 });
      }
      break;

    case "general_4": // Đại Tướng
      if (tier === 1) {
        rewards.push({ id: "mangosteen", category: "seeds", name: "Măng Cụt", icon: "🟣", quantity: 10 });
        rewards.push({ id: "ostrich", category: "animals", name: "Đà Điểu", icon: "🦤", quantity: 2 });
        rewards.push({ id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 15 });
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 15 });
      } else if (tier >= 2 && tier <= 12) {
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 10 });
        rewards.push({ id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 10 });
      }
      break;

    case "endgame_1": // Thống Soái
      if (tier === 1) {
        rewards.push({ id: "mangosteen", category: "seeds", name: "Măng Cụt", icon: "🟣", quantity: 12 });
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 20 });
        rewards.push({ id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 20 });
      } else if (tier >= 2 && tier <= 14) {
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 15 });
        rewards.push({ id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 15 });
      }
      break;

    case "endgame_grand_marshal": // Đại Thống Soái
      if (tier === 1) {
        rewards.push({
          id: "mangosteen",
          category: "seeds",
          name: "Măng Cụt",
          icon: "🟣",
          quantity: 16,
        });

        rewards.push({
          id: "feed_super",
          category: "feed",
          name: "Thức ăn siêu tốt",
          icon: "🌾",
          quantity: 25,
        });

        rewards.push({
          id: "fertilizer_premium_1",
          category: "fertilizer",
          name: "Phân Cao Cấp Loại 1",
          icon: "✨",
          quantity: 25,
        });
      } else if (tier >= 2 && tier <= 16) {
        rewards.push({
          id: "feed_super",
          category: "feed",
          name: "Thức ăn siêu tốt",
          icon: "🌾",
          quantity: 18,
        });

        rewards.push({
          id: "fertilizer_premium_1",
          category: "fertilizer",
          name: "Phân Cao Cấp Loại 1",
          icon: "✨",
          quantity: 18,
        });
      }
      break;

    case "endgame_2": // Nguyên Soái
      if (tier === 1) {
        rewards.push({ id: "mangosteen", category: "seeds", name: "Măng Cụt", icon: "🟣", quantity: 20 });
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 30 });
        rewards.push({ id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 30 });
      } else if (tier >= 2 && tier <= 18) {
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 20 });
        rewards.push({ id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 20 });
      }
      break;

    case "endgame_3": // Đại Nguyên Soái
      if (tier === 1) {
        rewards.push({ id: "mangosteen", category: "seeds", name: "Măng Cụt", icon: "🟣", quantity: 30 });
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 40 });
        rewards.push({ id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 40 });
      } else if (tier >= 2 && tier <= 20) {
        rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 30 });
        rewards.push({ id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 30 });
      }
      break;

    case "endgame_4": // Tổng Tư Lệnh (Single tier, tier is null or 1)
      rewards.push({ id: "mangosteen", category: "seeds", name: "Măng Cụt", icon: "🟣", quantity: 50 });
      rewards.push({ id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 50 });
      rewards.push({ id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 50 });
      break;

    default:
      break;
  }

  return rewards;
}

/**
 * Grants rewards directly into the player's farm inventory.
 */
export function applyPromotionRewards(state: GameState, rank: RankStep): RewardItem[] {
  const rewards = getPromotionRewards(rank);
  if (rewards.length === 0) return [];

  if (!state.farm) {
    state.farm = createDefaultFarmState();
  }

  const inventory = state.farm.inventory;

  for (const reward of rewards) {
    const { id, category, quantity } = reward;
    switch (category) {
      case "seeds":
        inventory.seeds[id as any] = (inventory.seeds[id as any] || 0) + quantity;
        break;
      case "animals":
        inventory.animals[id as any] = (inventory.animals[id as any] || 0) + quantity;
        break;
      case "feed":
        inventory.feed[id as any] = (inventory.feed[id as any] || 0) + quantity;
        break;
      case "fertilizer":
        inventory.fertilizer[id as any] = (inventory.fertilizer[id as any] || 0) + quantity;
        break;
    }
  }

  return rewards;
}
