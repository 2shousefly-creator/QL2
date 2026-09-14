import {
  AircraftConfig,
  AircraftId,
  CoreDefinition,
  CoreId,
  CoreTier,
  EnemyConfig,
  EnemyType,
  GameplaySafeRect,
  SkillConfig,
  SkillId,
} from "./airCombatTypes";

export const AIR_COMBAT_WORLD = {
  width: 360,
  height: 640,
  hudHeight: 92,
  safeGap: 12,
  playerBottomClearance: 50,
  maxDeltaSeconds: 1 / 30,
  maxEnemies: 44,
  maxPlayerProjectiles: 512,
  maxEnemyProjectiles: 256,
  maxParticles: 110,
  maxWarnings: 40,
  playerInvulnerabilitySeconds: 0.62,
  longPressMs: 400,
} as const;

export const GAMEPLAY_SAFE_RECT: GameplaySafeRect = {
  left: 14,
  top: AIR_COMBAT_WORLD.hudHeight + AIR_COMBAT_WORLD.safeGap,
  right: AIR_COMBAT_WORLD.width - 14,
  bottom: AIR_COMBAT_WORLD.height - 12,
  width: AIR_COMBAT_WORLD.width - 28,
  height:
    AIR_COMBAT_WORLD.height -
    AIR_COMBAT_WORLD.hudHeight -
    AIR_COMBAT_WORLD.safeGap -
    12,
};

export const AIR_COMBAT_LIMITS = {
  cooldownReduction: 0.80,
  criticalChance: 1,
  criticalDamageMultiplier: 10,
  baseCriticalDamageMultiplier: 1.70,
  phantomMaxEnergy: 100,
  minimumDisplayedDamage: 1,
  maxFireRate: 12,
  maxComboMultiplier: 5,
} as const;

export const AIRCRAFT_CONFIGS: Record<AircraftId, AircraftConfig> = {
  black_eagle: {
    id: "black_eagle",
    code: "X-07",
    name: "Viper",
    hpRegen: { base: 1.2, growth: 0.07 },
    role: "Burst DPS · Tốc xạ",
    description: "Tốc xạ, sát thương bùng nổ và bầy tên lửa; dùng Mana để nối chuỗi kỹ năng.",
    color: "#38bdf8",
    accent: "#e0f2fe",
    resourceKind: "mana",
    baseStats: {
      criticalChance: 0.05,
      criticalDamageMultiplier: 1.70,
      maxHp: 1250,
      armor: 28,
      firepower: 118,
      fireRate: 4.2,
      maxResource: 340,
      resourceRegen: 1.5,
    },
    growth: {
      criticalChance: 0,
      criticalDamageMultiplier: 0,
      maxHp: 18,
      armor: 1,
      firepower: 4,
      fireRate: 0.05,
      maxResource: 15,
      resourceRegen: 0.25,
    },
    skillIds: ["decoy", "afterburner", "missile_swarm"],
  },
  breaker: {
    id: "breaker",
    code: "A-12",
    name: "Titan",
    hpRegen: { base: 2.2, growth: 0.12 },
    role: "Heavy Tank · AoE",
    description: "Pháo đài bay bền bỉ với khiên, bom nặng và hỏa lực quét.",
    color: "#f59e0b",
    accent: "#fef3c7",
    resourceKind: "mana",
    baseStats: {
      criticalChance: 0.05,
      criticalDamageMultiplier: 1.70,
      maxHp: 2050,
      armor: 55,
      firepower: 104,
      fireRate: 3.1,
      maxResource: 320,
      resourceRegen: 1.5,
    },
    growth: {
      criticalChance: 0,
      criticalDamageMultiplier: 0,
      maxHp: 45,
      armor: 2,
      firepower: 2,
      fireRate: 0.02,
      maxResource: 16,
      resourceRegen: 0.27,
    },
    skillIds: ["armor_shield", "heavy_bomb", "sweeping_cannon"],
  },
  phantom: {
    id: "phantom",
    code: "NX-03",
    name: "Phantom",
    hpRegen: { base: 1.6, growth: 0.09 },
    role: "Hybrid · Quản trị Energy",
    description: "Tàng hình, laser và drone hộ tống với Energy luôn giới hạn 100.",
    color: "#a78bfa",
    accent: "#f3e8ff",
    resourceKind: "energy",
    baseStats: {
      criticalChance: 0.05,
      criticalDamageMultiplier: 1.70,
      maxHp: 1600,
      armor: 40,
      firepower: 112,
      fireRate: 3.7,
      maxResource: 100,
      resourceRegen: 2,
    },
    growth: {
      criticalChance: 0,
      criticalDamageMultiplier: 0,
      maxHp: 30,
      armor: 1,
      firepower: 3,
      fireRate: 0.03,
      maxResource: 0,
      resourceRegen: 0,
    },
    skillIds: ["invisibility", "focus_laser", "escort_drone"],
  },
};

export const AIRCRAFT_ORDER: AircraftId[] = [
  "black_eagle",
  "breaker",
  "phantom",
];

export const SKILL_CONFIGS: Record<SkillId, SkillConfig> = {
  "decoy": {
    "id": "decoy",
    "aircraftId": "black_eagle",
    "name": "Mồi Bẫy",
    "shortName": "Mồi Bẫy",
    "description": "3 đợt, cách 0,75s; mỗi đợt 5 mồi mỗi bên. Mồi hút mục tiêu và hấp thụ đạn trong 1,5s.",
    "icon": "✦",
    "cost": 140,
    "cooldown": 22,
    "duration": 1.5,
    "damageMultiplier": 0
  },
  "afterburner": {
    "id": "afterburner",
    "aircraftId": "black_eagle",
    "name": "Điên Cuồng",
    "shortName": "Điên Cuồng",
    "description": "7s: +80% tốc độ bắn. Đạn thường nảy thêm 2 mục tiêu với 75% rồi 56,25% sát thương.",
    "icon": "➤",
    "cost": 160,
    "cooldown": 24,
    "duration": 7,
    "damageMultiplier": 0
  },
  "missile_swarm": {
    "id": "missile_swarm",
    "aircraftId": "black_eagle",
    "name": "Mưa Tên Lửa",
    "shortName": "Tên lửa",
    "description": "6 tên lửa mỗi bên (12 tổng), phóng theo cặp. Mỗi cặp lơ lửng 0,35s trước khi tìm mục tiêu; cặp tiếp theo xuất hiện khi cặp trước bắt đầu bay. Mỗi quả gây 245% Hỏa lực.",
    "icon": "▲",
    "cost": 220,
    "cooldown": 33,
    "duration": 0,
    "damageMultiplier": 2.45
  },
  "armor_shield": {
    "id": "armor_shield",
    "aircraftId": "breaker",
    "name": "Khiên Năng Lượng",
    "shortName": "Khiên",
    "description": "Giảm 65% sát thương sau Giáp trong 6 giây.",
    "icon": "◆",
    "cost": 170,
    "cooldown": 22,
    "duration": 6,
    "damageMultiplier": 0
  },
  "heavy_bomb": {
    "id": "heavy_bomb",
    "aircraftId": "breaker",
    "name": "BigBang",
    "shortName": "BigBang",
    "description": "Tên lửa chậm nổ sau 3s hoặc khi chạm địch; gây 1400% Hỏa lực lên mọi địch trong màn hình.",
    "icon": "●",
    "cost": 200,
    "cooldown": 26,
    "duration": 0,
    "damageMultiplier": 14
  },
  "sweeping_cannon": {
    "id": "sweeping_cannon",
    "aircraftId": "breaker",
    "name": "Oanh Tạc",
    "shortName": "Oanh Tạc",
    "description": "18s: thay đạn thường bằng quạt 5 tia, 60% Hỏa lực. Đạn cùng loạt trúng thêm chỉ gây 15% viên đầu. Bấm lại để kết thúc, sau đó mới hồi chiêu.",
    "icon": "⋔",
    "cost": 180,
    "cooldown": 30,
    "duration": 18,
    "damageMultiplier": 0.6
  },
  "invisibility": {
    "id": "invisibility",
    "aircraftId": "phantom",
    "name": "Phân Ảnh",
    "shortName": "Phân Ảnh",
    "description": "Tàng hình và để lại phân thân hút đạn trong 2s; lướt theo hướng di chuyển cuối. Không có hướng thì lướt lên.",
    "icon": "◌",
    "cost": 25,
    "cooldown": 20,
    "duration": 2,
    "damageMultiplier": 0
  },
  "focus_laser": {
    "id": "focus_laser",
    "aircraftId": "phantom",
    "name": "Laser Hủy Diệt",
    "shortName": "Laser",
    "description": "Tụ 2s, bắn xuyên 2s, mỗi 0,25s gây 300% Hỏa lực. Ngừng bắn thường trong toàn bộ kỹ năng.",
    "icon": "┃",
    "cost": 45,
    "cooldown": 15,
    "duration": 2,
    "damageMultiplier": 3
  },
  "escort_drone": {
    "id": "escort_drone",
    "aircraftId": "phantom",
    "name": "Giúp Nào HawkEye!",
    "shortName": "HawkEye",
    "description": "Cần ít nhất 5 Điện để bật, không trừ phí ban đầu; duy trì 4 Điện/s. Một drone kế thừa 55% chỉ số. Bấm lại để thu hồi; hồi chiêu 24s khi kết thúc.",
    "icon": "◇",
    "cost": 5,
    "cooldown": 24,
    "duration": 0,
    "damageMultiplier": 0.55
  }
};

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  "scout": {
    "type": "scout",
    "name": "Scout Drone",
    "baseHp": 160,
    "baseArmor": 8,
    "speed": 62,
    "radius": 11,
    "score": 110,
    "combatXp": 24,
    "projectileDamage": 78,
    "collisionDamage": 120,
    "fireInterval": 2.8,
    "color": "#fb7185"
  },
  "fighter": {
    "type": "fighter",
    "name": "Interceptor",
    "baseHp": 260,
    "baseArmor": 14,
    "speed": 90,
    "radius": 14,
    "score": 170,
    "combatXp": 30,
    "projectileDamage": 55,
    "collisionDamage": 150,
    "fireInterval": 2.7,
    "color": "#f43f5e"
  },
  "attacker": {
    "type": "attacker",
    "name": "Heavy Gunship",
    "baseHp": 620,
    "baseArmor": 30,
    "speed": 34,
    "radius": 19,
    "score": 320,
    "combatXp": 38,
    "projectileDamage": 75,
    "collisionDamage": 210,
    "fireInterval": 2.4,
    "color": "#f97316"
  },
  "kamikaze": {
    "type": "kamikaze",
    "name": "Kamikaze Drone",
    "baseHp": 220,
    "baseArmor": 5,
    "speed": 270,
    "radius": 11,
    "score": 210,
    "combatXp": 28,
    "projectileDamage": 0,
    "collisionDamage": 260,
    "fireInterval": 99,
    "color": "#fbbf24"
  },
  "bomber": {
    "type": "bomber",
    "name": "Bomber",
    "baseHp": 480,
    "baseArmor": 18,
    "speed": 38,
    "radius": 18,
    "score": 290,
    "combatXp": 44,
    "projectileDamage": 180,
    "collisionDamage": 190,
    "fireInterval": 3.8,
    "color": "#fb923c"
  },
  "sniper": {
    "type": "sniper",
    "name": "Sniper Aircraft",
    "baseHp": 340,
    "baseArmor": 12,
    "speed": 48,
    "radius": 15,
    "score": 310,
    "combatXp": 46,
    "projectileDamage": 240,
    "collisionDamage": 160,
    "fireInterval": 4.2,
    "color": "#e879f9"
  },
  "jammer": {
    "type": "jammer",
    "name": "Jammer Drone",
    "baseHp": 400,
    "baseArmor": 20,
    "speed": 42,
    "radius": 15,
    "score": 310,
    "combatXp": 48,
    "projectileDamage": 85,
    "collisionDamage": 170,
    "fireInterval": 3,
    "color": "#2dd4bf"
  },
  "elite": {
    "type": "elite",
    "name": "Crimson Ace",
    "baseHp": 3600,
    "baseArmor": 32,
    "speed": 90,
    "radius": 23,
    "score": 1500,
    "combatXp": 230,
    "projectileDamage": 95,
    "collisionDamage": 240,
    "fireInterval": 2.4,
    "color": "#f43f5e"
  },
  "iron_fortress": {
    "type": "iron_fortress",
    "name": "Iron Fortress",
    "baseHp": 5200,
    "baseArmor": 60,
    "speed": 25,
    "radius": 28,
    "score": 1500,
    "combatXp": 230,
    "projectileDamage": 70,
    "collisionDamage": 280,
    "fireInterval": 2.8,
    "color": "#94a3b8"
  },
  "acid_bomber": {
    "type": "acid_bomber",
    "name": "Acid Bomber",
    "baseHp": 4200,
    "baseArmor": 38,
    "speed": 38,
    "radius": 25,
    "score": 1500,
    "combatXp": 230,
    "projectileDamage": 90,
    "collisionDamage": 240,
    "fireInterval": 3.8,
    "color": "#a3e635"
  },
  "radar_hunter": {
    "type": "radar_hunter",
    "name": "Radar Hunter",
    "baseHp": 4800,
    "baseArmor": 42,
    "speed": 62,
    "radius": 24,
    "score": 1500,
    "combatXp": 320,
    "projectileDamage": 260,
    "collisionDamage": 260,
    "fireInterval": 4.2,
    "color": "#38bdf8"
  },
  "boss": {
    "type": "boss",
    "name": "PHÁO ĐÀI BAY LEVIATHAN X-99",
    "baseHp": 85000,
    "baseArmor": 50,
    "speed": 30,
    "radius": 43,
    "score": 12000,
    "combatXp": 0,
    "projectileDamage": 140,
    "collisionDamage": 450,
    "fireInterval": 1.4,
    "color": "#dc2626"
  }
};

export const CORE_TIER_CHANCES: Record<CoreTier, number> = {
  silver: 0.4,
  gold: 0.4,
  diamond: 0.2,
};

export const CORE_TIER_LABELS: Record<CoreTier, string> = {
  silver: "Bạc",
  gold: "Vàng",
  diamond: "Kim Cương",
};

export { CORE_DEFINITIONS } from "./airCombatCoreCatalog";
import { CORE_DEFINITIONS } from "./airCombatCoreCatalog";

export const AIR_COMBAT_REWARD_CONFIG = {
  dailyGoldCap: 16,
  dailyXpCap: 12,
  rewardRates: [1, 0.55, 0.25, 0] as const,
  maxGoldPerRun: 7,
  maxXpPerRun: 5,
} as const;

export const AIR_COMBAT_RANK_ORDER = ["C", "B", "A", "S", "SS"] as const;

export function getCoreDefinition(id: CoreId): CoreDefinition {
  const definition = CORE_DEFINITIONS.find((core) => core.id === id);
  if (!definition) return { id, name: "Lõi cũ", description: "Lõi không còn thuộc danh mục hiện tại; không áp dụng hiệu ứng.", system: "Lưu cũ", icon: "◇", category: "offense", tiers: ["silver"] };
  return definition;
}
