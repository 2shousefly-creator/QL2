import { RankStep, GameState } from "./types";
import { createDefaultFarmState } from "../features/tang_gia/farmEngine";

export type RewardItem = {
  id: string;
  category: "seeds" | "animals" | "feed" | "fertilizer";
  name: string;
  icon: string;
  quantity: number;
};

const FAMILY_REWARDS: Record<string, RewardItem[]> = {
  enlisted_1: [
    { id: "chicken", category: "animals", name: "Gà", icon: "🐓", quantity: 1 },
    { id: "feed_normal", category: "feed", name: "Thức ăn loại thường", icon: "🌾", quantity: 2 },
  ],
  enlisted_2: [
    { id: "duck", category: "animals", name: "Vịt", icon: "🦆", quantity: 1 },
    { id: "feed_normal", category: "feed", name: "Thức ăn loại thường", icon: "🌾", quantity: 2 },
  ],
  enlisted_3: [
    { id: "feed_normal", category: "feed", name: "Thức ăn loại thường", icon: "🌾", quantity: 5 },
  ],
  nco_1: [
    { id: "quail", category: "animals", name: "Chim Cút", icon: "🐦", quantity: 1 },
    { id: "feed_good", category: "feed", name: "Thức ăn loại tốt", icon: "🌾", quantity: 7 },
  ],
  nco_2: [
    { id: "corn", category: "seeds", name: "Ngô", icon: "🌽", quantity: 1 },
    { id: "fertilizer_nutrition_medium", category: "fertilizer", name: "Phân Dinh Dưỡng Loại Vừa", icon: "🌱", quantity: 1 },
    { id: "feed_good", category: "feed", name: "Thức ăn loại tốt", icon: "🌾", quantity: 5 },
  ],
  nco_3: [
    { id: "goose", category: "animals", name: "Ngỗng", icon: "🪿", quantity: 1 },
    { id: "feed_good", category: "feed", name: "Thức ăn loại tốt", icon: "🌾", quantity: 7 },
  ],
  junior_1: [
    { id: "watermelon", category: "seeds", name: "Dưa Hấu", icon: "🍉", quantity: 1 },
    { id: "fertilizer_nutrition_good", category: "fertilizer", name: "Phân Dinh Dưỡng Loại Tốt", icon: "🌱", quantity: 1 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 7 },
  ],
  junior_2: [
    { id: "muscovy_duck", category: "animals", name: "Ngan", icon: "🦆", quantity: 2 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 17 },
  ],
  junior_3: [
    { id: "banana", category: "seeds", name: "Chuối", icon: "🍌", quantity: 2 },
    { id: "fertilizer_growth_good", category: "fertilizer", name: "Phân Tăng Trưởng Loại Tốt", icon: "⏱", quantity: 2 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 14 },
  ],
  junior_4: [
    { id: "turkey", category: "animals", name: "Gà Tây", icon: "🦃", quantity: 2 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 26 },
  ],
  field_1: [
    { id: "mango", category: "seeds", name: "Xoài", icon: "🥭", quantity: 3 },
    { id: "fertilizer_nutrition_super", category: "fertilizer", name: "Phân Dinh Dưỡng Loại Siêu Tốt", icon: "🌱", quantity: 18 },
    { id: "fertilizer_growth_super", category: "fertilizer", name: "Phân Tăng Trưởng Loại Siêu Tốt", icon: "⏱", quantity: 15 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 27 },
  ],
  field_2: [
    { id: "guinea_fowl", category: "animals", name: "Gà Sao", icon: "🐥", quantity: 2 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 42 },
    { id: "fertilizer_nutrition_super", category: "fertilizer", name: "Phân Dinh Dưỡng Loại Siêu Tốt", icon: "🌱", quantity: 20 },
    { id: "fertilizer_growth_super", category: "fertilizer", name: "Phân Tăng Trưởng Loại Siêu Tốt", icon: "⏱", quantity: 16 },
  ],
  field_3: [
    { id: "pear", category: "seeds", name: "Lê", icon: "🍐", quantity: 5 },
    { id: "fertilizer_nutrition_super", category: "fertilizer", name: "Phân Dinh Dưỡng Loại Siêu Tốt", icon: "🌱", quantity: 30 },
    { id: "fertilizer_growth_super", category: "fertilizer", name: "Phân Tăng Trưởng Loại Siêu Tốt", icon: "⏱", quantity: 25 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 45 },
  ],
  field_4: [
    { id: "pheasant", category: "animals", name: "Chim Trĩ", icon: "🕊️", quantity: 2 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 63 },
    { id: "fertilizer_premium_3", category: "fertilizer", name: "Phân Cao Cấp Loại 3", icon: "✨", quantity: 63 },
  ],
  general_1: [
    { id: "dragon_fruit", category: "seeds", name: "Lúa", icon: "🌾", quantity: 7 },
    { id: "fertilizer_premium_3", category: "fertilizer", name: "Phân Cao Cấp Loại 3", icon: "✨", quantity: 84 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 84 },
  ],
  general_2: [
    { id: "peafowl", category: "animals", name: "Công", icon: "🦚", quantity: 2 },
    { id: "fertilizer_premium_2", category: "fertilizer", name: "Phân Cao Cấp Loại 2", icon: "✨", quantity: 100 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 100 },
  ],
  general_3: [
    { id: "durian", category: "seeds", name: "Sầu Riêng", icon: "🍈", quantity: 9 },
    { id: "fertilizer_premium_2", category: "fertilizer", name: "Phân Cao Cấp Loại 2", icon: "✨", quantity: 108 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 108 },
  ],
  general_4: [
    { id: "mangosteen", category: "seeds", name: "Măng Cụt", icon: "🟣", quantity: 10 },
    { id: "ostrich", category: "animals", name: "Đà Điểu", icon: "🦤", quantity: 2 },
    { id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 125 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 125 },
  ],
  endgame_1: [
    { id: "mangosteen", category: "seeds", name: "Măng Cụt", icon: "🟣", quantity: 12 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 215 },
    { id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 215 },
  ],
  endgame_grand_marshal: [
    { id: "mangosteen", category: "seeds", name: "Măng Cụt", icon: "🟣", quantity: 16 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 295 },
    { id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 295 },
  ],
  endgame_2: [
    { id: "mangosteen", category: "seeds", name: "Măng Cụt", icon: "🟣", quantity: 20 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 370 },
    { id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 370 },
  ],
  endgame_3: [
    { id: "mangosteen", category: "seeds", name: "Măng Cụt", icon: "🟣", quantity: 30 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 610 },
    { id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 610 },
  ],
  endgame_4: [
    { id: "mangosteen", category: "seeds", name: "Măng Cụt", icon: "🟣", quantity: 50 },
    { id: "feed_super", category: "feed", name: "Thức ăn siêu tốt", icon: "🌾", quantity: 50 },
    { id: "fertilizer_premium_1", category: "fertilizer", name: "Phân Cao Cấp Loại 1", icon: "✨", quantity: 50 },
  ],
};

export function getPromotionRewards(rank: RankStep): RewardItem[] {
  return FAMILY_REWARDS[rank.familyId] ?? [];
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
