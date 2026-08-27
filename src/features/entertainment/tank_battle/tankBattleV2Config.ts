import type { CoreDefinition, LaneId, Point } from "./tankBattleV2Types";

// Logical simulation runs left -> right, then Canvas rotates it into a portrait
// battlefield so all three lanes run vertically from player HQ (bottom) to enemy HQ (top).
export const TANK_V2_VIEWPORT = {
  width: 720,
  height: 360,
  hudHeight: 88,
} as const;

export const TANK_V2_DISPLAY = {
  width: 360,
  height: 720,
  mapWidth: 720,
  mapHeight: 1440,
} as const;

export const TANK_V2_MAP = {
  width: 1440,
  height: 720,
  oldWidth: 720,
  oldHeight: 360,
  cameraDeadZoneX: 118,
  cameraDeadZoneY: 72,
  cameraSmoothing: 10,
} as const;

export const TANK_V2_PLAYER = {
  radius: 15,
  baseMaxHp: 600,
  baseAtk: 50,
  baseDef: 30,
  baseMoveSpeed: 184,
  fireCooldown: 0.9,
  projectileSpeed: 330,
  attackRange: 270,
  levelCap: 18,
  levelHpGain: 60,
  levelAtkGain: 4,
  levelDefGain: 3,
  respawnSeconds: 15,
  spawnProtectionSeconds: 2,
  joystickDeadZoneRatio: 0.19,
  boostSpeedMultiplier: 1.5,
  boostDuration: 2.5,
  boostCooldown: 13,
} as const;

export const TANK_V2_AI = {
  spawnIntervalSeconds: 30,
  unitsPerLanePerWave: 3,
  laneSoftCapPerFaction: 12,
  globalSoftCapPerFaction: 36,
  baseHp: 300,
  maxHp: 1500,
  baseAtk: 40,
  maxAtk: 100,
  baseDef: 30,
  maxDef: 70,
  scaleCapSeconds: 600,
  moveSpeed: 68,
  fireCooldown: 1.75,
  projectileSpeed: 235,
  attackRange: 135,
  visionMultiplier: 2,
  senseIntervalMin: 0.25,
  senseIntervalMax: 0.5,
  chaseTetherMultiplier: 1.5,
} as const;

export const TANK_V2_STRUCTURE = {
  towerHp: 8000,
  towerDef: 65,
  towerAtk: 140,
  towerRange: 190,
  towerCooldown: 1.2,
  hqHp: 12000,
  hqDef: 75,
  hqAtk: 160,
  hqRange: 165,
  hqCooldown: 1.3,
  siege10StructureMultiplier: 1.2,
  siege12StructureMultiplier: 1.4,
} as const;

export const TANK_V2_XP = {
  kill: 50,
  assist: 25,
  tower: 100,
  assistWindowSeconds: 6,
  coreLevels: [3, 6, 9, 12, 15, 18] as const,
  rarity: { silver: 0.5, gold: 0.35, diamond: 0.15 } as const,
} as const;

// These are logical Y coordinates. After the portrait rotation they become
// three vertical lane X positions at 60 / 180 / 300 px in the starting viewport.
export const LANE_Y: Record<LaneId, number> = {
  top: 240,
  mid: 360,
  bottom: 480,
};

export const LANE_IDS: readonly LaneId[] = ["top", "mid", "bottom"];

// Logical left side becomes the bottom of the portrait battlefield.
export const PLAYER_HQ: Point = { x: 120, y: 360 };
export const ENEMY_HQ: Point = { x: 1320, y: 360 };

export const PLAYER_TOWER_X = { t3: 250, t2: 430, t1: 610 } as const;
export const ENEMY_TOWER_X = { t1: 830, t2: 1010, t3: 1190 } as const;

// Logical vertical connectors become horizontal connectors on the portrait map.
export const CONNECTOR_X = [430, 720, 1010] as const;

export const POWERUP_POINTS: readonly Point[] = [
  { x: 720, y: 240 },
  { x: 720, y: 360 },
  { x: 720, y: 480 },
  { x: 430, y: 300 },
  { x: 1010, y: 420 },
];

export const CORE_CATALOG: readonly CoreDefinition[] = [
  { id: "reinforced_barrel", name: "Nòng Pháo Gia Cố", icon: "◉", description: "+12 ATK.", rarity: "silver", category: "offense", unique: false, stackable: true },
  { id: "aux_armor", name: "Giáp Phụ", icon: "♥", description: "+120 Max HP và hồi 120 HP.", rarity: "silver", category: "defense", unique: false, stackable: true },
  { id: "hardened_steel", name: "Thép Cường Hóa", icon: "◆", description: "+8 DEF.", rarity: "silver", category: "defense", unique: false, stackable: true },
  { id: "fuel_tank", name: "Bình Nhiên Liệu", icon: "➤", description: "Boost kéo dài thêm 0.75 giây.", rarity: "silver", category: "mobility", unique: false, stackable: true },
  { id: "cooling_unit", name: "Bộ Làm Mát", icon: "❄", description: "Boost cooldown giảm 1 giây.", rarity: "silver", category: "mobility", unique: false, stackable: true },
  { id: "optimized_mag", name: "Băng Đạn Tối Ưu", icon: "↻", description: "Giảm 0.08 giây hồi pháo chính.", rarity: "silver", category: "offense", unique: false, stackable: true },

  { id: "piercing_round", name: "Đạn Xuyên", icon: "⇧", description: "+15 ATK, đạn xuyên 1 tank.", rarity: "gold", category: "offense", unique: true, stackable: false },
  { id: "reactive_armor", name: "Giáp Phản Ứng", icon: "⬡", description: "+150 HP; dưới 30% HP nhận 250 Shield mỗi mạng.", rarity: "gold", category: "defense", unique: true, stackable: false },
  { id: "military_turbo", name: "Bộ Tăng Áp Quân Sự", icon: "⚡", description: "Boost +1 giây và cooldown -1.5 giây.", rarity: "gold", category: "mobility", unique: true, stackable: false },
  { id: "siege_round", name: "Đạn Công Thành", icon: "▣", description: "+10 ATK; +35 sát thương trực tiếp lên Tower/HQ.", rarity: "gold", category: "offense", unique: true, stackable: false },
  { id: "charge_shield", name: "Khiên Xung Kích", icon: "◈", description: "Mỗi Boost nhận 150 Shield trong thời gian Boost.", rarity: "gold", category: "defense", unique: true, stackable: false },
  { id: "combat_absorption", name: "Hấp Thu Chiến Đấu", icon: "+", description: "Kill trực tiếp hồi 30 HP.", rarity: "gold", category: "utility", unique: true, stackable: false },
  { id: "field_repair", name: "Sửa Chữa Dã Chiến", icon: "✚", description: "+180 Max HP và hồi 180 HP ngay.", rarity: "gold", category: "defense", unique: true, stackable: false },
  { id: "high_velocity_round", name: "Đạn Cao Tốc", icon: "➠", description: "+60 tốc độ projectile, giúp bắn xa ổn định hơn.", rarity: "gold", category: "offense", unique: true, stackable: false },

  { id: "dual_cannon", name: "Pháo Kép", icon: "Ⅱ", description: "Mỗi phát thứ 4 bắn thêm một projectile.", rarity: "diamond", category: "offense", unique: true, stackable: false },
  { id: "explosive_warhead", name: "Đầu Đạn Nổ", icon: "✹", description: "Hit gây thêm 70 AoE trong bán kính 70.", rarity: "diamond", category: "offense", unique: true, stackable: false },
  { id: "mobile_fortress", name: "Pháo Đài Di Động", icon: "▦", description: "+350 HP, +20 DEF; đứng yên 1.5s nhận thêm 15 DEF.", rarity: "diamond", category: "defense", unique: true, stackable: false },
  { id: "overdrive", name: "Overdrive", icon: "∞", description: "Boost có 2 charge, mỗi charge hồi độc lập.", rarity: "diamond", category: "mobility", unique: true, stackable: false },
  { id: "battle_regeneration", name: "Tái Tạo Chiến Trường", icon: "✚", description: "Kill hồi 40 HP; nếu đầy HP chuyển thành Shield, cap 300.", rarity: "diamond", category: "utility", unique: true, stackable: false },
  { id: "armor_breaker", name: "Đạn Phá Giáp", icon: "⌁", description: "Hit giảm 15 DEF trong 4 giây.", rarity: "diamond", category: "offense", unique: true, stackable: false },
  { id: "titanium_core", name: "Lõi Titanium", icon: "⬢", description: "+25 ATK và +12 DEF.", rarity: "diamond", category: "defense", unique: true, stackable: false },
  { id: "blitz_engine", name: "Động Cơ Blitz", icon: "»", description: "+40 tốc độ di chuyển cơ bản.", rarity: "diamond", category: "mobility", unique: true, stackable: false },
];