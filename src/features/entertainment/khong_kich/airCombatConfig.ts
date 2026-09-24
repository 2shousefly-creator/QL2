import { SKILL_RANKS } from "./airCombatSkillRanks";
import { SKILL_BASE_VALUES as B } from "./airCombatSkillCores";
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
  cooldownReduction: 0.60,
  criticalChance: 1,
  criticalDamageMultiplier: 10,
  baseCriticalDamageMultiplier: 1.70,
  phantomMaxEnergy: 100,
  minimumDisplayedDamage: 1,
  maxFireRate: 12,
  maxComboMultiplier: 5,
} as const;

export const AIRCRAFT_CONFIGS: Record<AircraftId, AircraftConfig> = {
  astra: {
    id:"astra", name:"Astra", code:"AS-04", role:"Precision Control · Mana",
    description:"Kiểm soát projectile, xuyên tuyến bằng Thương Tinh Tú và không kích thiên thạch.",
    color:"#ff8b35", accent:"#fff4d8", resourceKind:"mana", hpRegen:{base:3.3,growth:.13},
    baseStats:{maxHp:1760,armor:39,firepower:124,fireRate:3.9,criticalChance:.05,criticalDamageMultiplier:1.7,maxResource:330,resourceRegen:1.5},
    growth:{maxHp:34,armor:1.6,firepower:4,fireRate:.045,criticalChance:0,criticalDamageMultiplier:0,maxResource:15,resourceRegen:.24},
    skillIds:["orbit_reversal","stellar_lance","twin_reflection","starfall"],
  },
  black_eagle: {
    id: "black_eagle",
    code: "X-07",
    name: "Viper",
    hpRegen: { base: 3.2, growth: 0.12 },
    role: "Burst DPS · Tốc xạ",
    description: "Tốc xạ, sát thương bùng nổ và bầy tên lửa; dùng Mana để nối chuỗi kỹ năng.",
    color: "#38bdf8",
    accent: "#e0f2fe",
    resourceKind: "mana",
    baseStats: {
      criticalChance: 0.05,
      criticalDamageMultiplier: 1.70,
      maxHp: 1694,
      armor: 38,
      firepower: 118,
      fireRate: 4.0,
      maxResource: 340,
      resourceRegen: 1.5,
    },
    growth: {
      criticalChance: 0,
      criticalDamageMultiplier: 0,
      maxHp: 32,
      armor: 1.5,
      firepower: 4,
      fireRate: 0.05,
      maxResource: 15,
      resourceRegen: 0.25,
    },
    skillIds: ["decoy", "afterburner", "predator_lock", "missile_swarm"],
  },
  breaker: {
    id: "breaker",
    code: "A-12",
    name: "Titan",
    hpRegen: { base: 3.6, growth: 0.18 },
    role: "Heavy Tank · AoE",
    description: "Pháo đài bay bền bỉ với khiên, bom nặng và hỏa lực quét.",
    color: "#f59e0b",
    accent: "#fef3c7",
    resourceKind: "mana",
    baseStats: {
      criticalChance: 0.05,
      criticalDamageMultiplier: 1.70,
      maxHp: 2067,
      armor: 46,
      firepower: 104,
      fireRate: 3.8,
      maxResource: 320,
      resourceRegen: 1.5,
    },
    growth: {
      criticalChance: 0,
      criticalDamageMultiplier: 0,
      maxHp: 42,
      armor: 2.1,
      firepower: 2,
      fireRate: 0.044,
      maxResource: 14,
      resourceRegen: 0.20,
    },
    skillIds: ["armor_shield", "heavy_bomb", "gravity_anchor", "sweeping_cannon"],
  },
  phantom: {
    id: "phantom",
    code: "NX-03",
    name: "Phantom",
    hpRegen: { base: 3.4, growth: 0.15 },
    role: "Hybrid · Quản trị Energy",
    description: "Tàng hình, laser và drone hộ tống với 100 Energy cơ bản; Trang Bị có thể tăng giới hạn.",
    color: "#a78bfa",
    accent: "#f3e8ff",
    resourceKind: "energy",
    baseStats: {
      criticalChance: 0.05,
      criticalDamageMultiplier: 1.70,
      maxHp: 1839,
      armor: 41,
      firepower: 112,
      fireRate: 3.9,
      maxResource: 100,
      resourceRegen: 2,
    },
    growth: {
      criticalChance: 0,
      criticalDamageMultiplier: 0,
      maxHp: 37,
      armor: 1.8,
      firepower: 3,
      fireRate: 0.047,
      maxResource: 0,
      resourceRegen: 0,
    },
    skillIds: ["invisibility", "focus_laser", "electronic_interference", "escort_drone"],
  },
};


const LEVEL_18_TARGETS = {"black_eagle": [2884.2, 89.65, 257.4, 5.995, 7.348, 852.5, 9.625], "breaker": [3613.5, 117.59, 178.2, 5.5836, 9.702, 920, 8.5], "phantom": [3203.2, 102.52, 218.9, 5.7893, 8.525, 100, 2], "astra": [3020.6, 93.94, 264, 5.7255, 7.777, 841.5, 9.306]} as const;
for (const id of Object.keys(LEVEL_18_TARGETS) as AircraftId[]) {
 const c=AIRCRAFT_CONFIGS[id], t=LEVEL_18_TARGETS[id];
 const keys=["maxHp","armor","firepower","fireRate","maxResource","resourceRegen"] as const;
 const values=[t[0],t[1],t[2],t[3],t[5],t[6]];
 keys.forEach((key,i)=>{c.growth[key]=(values[i]-c.baseStats[key])/17;});
 c.hpRegen.growth=(t[4]-c.hpRegen.base)/17;
}

export const AIRCRAFT_ORDER: AircraftId[] = [
  "black_eagle",
  "breaker",
  "phantom",
  "astra",
];

export const SKILL_CONFIGS: Record<SkillId, SkillConfig> = {
  predator_lock: {id:"predator_lock",aircraftId:"black_eagle",name:"Khóa Săn Mồi",shortName:"Khóa Săn Mồi",description:"Khóa Săn Mồi",icon:"✦",cost:110,cooldown:18,duration:8},
  gravity_anchor: {id:"gravity_anchor",aircraftId:"breaker",name:"Neo Trọng Lực",shortName:"Neo Trọng Lực",description:"Neo Trọng Lực",icon:"✦",cost:140,cooldown:20,duration:5},
  electronic_interference: {id:"electronic_interference",aircraftId:"phantom",name:"Nhiễu Điện Tử",shortName:"Nhiễu Điện Tử",description:"Nhiễu Điện Tử",icon:"✦",cost:30,cooldown:18,duration:1.6},
  twin_reflection: {id:"twin_reflection",aircraftId:"astra",name:"Song Tinh Phản Xạ",shortName:"Song Tinh Phản Xạ",description:"Song Tinh Phản Xạ",icon:"✦",cost:120,cooldown:20,duration:6},
  orbit_reversal:{id:"orbit_reversal",aircraftId:"astra",name:"Phản Quỹ Đạo",shortName:"Quỹ Đạo",icon:"",cost:170,cooldown:22,duration:2,damageMultiplier:.3,
    description:"Tạo vùng 72px theo Astra trong 2 giây, bắt tối đa 16 projectile thù địch. Bấm lại để kết thúc sớm, không tốn thêm Mana. Khi kết thúc, Tinh Đạn lần lượt hội tụ về phía trước Astra rồi phóng lên trong một hành lang 20px, không tự tìm mục tiêu, không homing hay retarget; mỗi viên gây 30% Hỏa Lực lên địch đầu tiên. Không bắt Beam, AoE, Bomb/Mine, va chạm thân và Boss mechanic không thể bắt. Hồi chiêu bắt đầu khi trạng thái bắt giữ kết thúc và Tinh Đạn bắt đầu hội tụ."},
  stellar_lance:{id:"stellar_lance",aircraftId:"astra",name:"Thương Tinh Tú",shortName:"Tinh Tú",icon:"",cost:60,cooldown:3,damageMultiplier:8,
    description:"Tụ 0,6s, vẫn di chuyển nhưng ngừng bắn thường. Phóng thẳng phía trước, xuyên mọi địch: mục tiêu đầu 800% Hỏa Lực, mục tiêu sau 680% Hỏa Lực. Mỗi lần dùng thành công trong 15s tăng cost kế tiếp 60 Mana và +10% sát thương Thương Tinh Tú, cộng dồn theo phép cộng, tối đa 4 stack: 300 Mana / +40% sát thương Thương Tinh Tú. Hết 15s trở về ban đầu. Hồi chiêu sau phát chính."},
  starfall:{id:"starfall",aircraftId:"astra",name:"Sao Rơi",shortName:"Sao Rơi",icon:"",cost:200,cooldown:34,damageMultiplier:2.1,
    description:"Mỗi 0,5s khóa một địch, tối đa 10 lần trong 5s, ưu tiên mục tiêu chưa đánh dấu. Sau 1s, thiên thạch rơi vào marker, gây 210% Hỏa Lực trong 35px. Marker bám địch sống, giữ vị trí chết và không retarget. Hết mục tiêu thì ngừng khóa mới; thiên thạch đã hẹn vẫn rơi. Hồi chiêu chỉ bắt đầu sau impact cuối (~5,5s)."},
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
    "description": "7s: +40% tốc độ bắn. Đạn thường nảy thêm 2 mục tiêu: mục tiêu nảy thứ nhất nhận 50% sát thương đạn gốc, mục tiêu nảy thứ hai nhận 25% sát thương đạn gốc.",
    "icon": "➤",
    "cost": 160,
    "cooldown": B.afterburnerCooldown,
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
    "cooldown": B.swarmCooldown,
    "duration": 0,
    "damageMultiplier": 2.45
  },
  "armor_shield": {
    "id": "armor_shield",
    "aircraftId": "breaker",
    "name": "Khiên Năng Lượng",
    "shortName": "Khiên",
    "description": "Giảm 65% sát thương nhận vào sau Giáp trong 6 giây.",
    "icon": "◆",
    "cost": 170,
    "cooldown": B.shieldCooldown,
    "duration": 6,
    "damageMultiplier": 0
  },
  "heavy_bomb": {
    "id": "heavy_bomb",
    "aircraftId": "breaker",
    "name": "BigBang",
    "shortName": "BigBang",
    "description": "Phát nổ sau 3s kể từ khi khai hỏa, hoặc ngay khi va chạm; gây 1400% Hỏa lực lên mọi địch trong màn hình.",
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
    "description": "18s: thay đạn thường bằng quạt 5 tia, 60% Hỏa lực. Tia bổ sung trúng cùng mục tiêu chỉ gây 15% sát thương của tia đầu tiên. Bấm lại để kết thúc, sau đó mới hồi chiêu.",
    "icon": "⋔",
    "cost": 180,
    "cooldown": B.cannonCooldown,
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
for(const id of Object.keys(SKILL_CONFIGS) as SkillId[]){SKILL_CONFIGS[id].cost=SKILL_RANKS[id][0].cost;SKILL_CONFIGS[id].description=SKILL_RANKS[id][0].description;}


/** Stage 2 power correction; exact scaled config values below are before wave progression. */
export const STAGE2_POWER_MULTIPLIER = 1.5;

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  prism_sovereign: {"type":"prism_sovereign","name":"PRISM SOVEREIGN","baseHp":7306.2,"baseArmor":47.355,"speed":44,"radius":24,"score":1500,"combatXp":230,"projectileDamage":124.488,"collisionDamage":314.496,"fireInterval":99,"color":"#a78bfa"},
  mine_warden: {"type":"mine_warden","name":"MINE WARDEN","baseHp":7306.2,"baseArmor":47.355,"speed":32,"radius":25,"score":1500,"combatXp":230,"projectileDamage":124.488,"collisionDamage":314.496,"fireInterval":99,"color":"#a78bfa"},
  polarity_warden: {"type":"polarity_warden","name":"POLARITY WARDEN","baseHp":10553.4,"baseArmor":89.298,"speed":38,"radius":27,"score":1500,"combatXp":230,"projectileDamage":91.728,"collisionDamage":366.912,"fireInterval":99,"color":"#a78bfa"},
  swarm_overlord: {"type":"swarm_overlord","name":"SWARM OVERLORD","baseHp":10553.4,"baseArmor":89.298,"speed":30,"radius":29,"score":1500,"combatXp":230,"projectileDamage":91.728,"collisionDamage":366.912,"fireInterval":99,"color":"#a78bfa"},
  arc_reaver_prime: {"type":"arc_reaver_prime","name":"ARC REAVER PRIME","baseHp":10553.4,"baseArmor":89.298,"speed":50,"radius":25,"score":1500,"combatXp":230,"projectileDamage":91.728,"collisionDamage":366.912,"fireInterval":99,"color":"#a78bfa"},
  orbit_wasp: {"type": "orbit_wasp", "name": "ORBIT WASP · ONG QUỸ ĐẠO", "baseHp": 205.92, "baseArmor": 10.296, "speed": 74, "radius": 11, "score": 110, "combatXp": 24, "projectileDamage": 66.528, "collisionDamage": 145.152, "fireInterval": 3, "color": "#67e8f9"},
  arc_reaver: {"type": "arc_reaver", "name": "ARC REAVER · KẺ SĂN BOOMERANG", "baseHp": 334.62, "baseArmor": 18.018, "speed": 50, "radius": 14, "score": 170, "combatXp": 30, "projectileDamage": 66.528, "collisionDamage": 181.44, "fireInterval": 4.8, "color": "#a78bfa"},
  mine_seeder: {"type": "mine_seeder", "name": "MINE SEEDER · MÁY RẢI MÌN", "baseHp": 617.76, "baseArmor": 23.166, "speed": 38, "radius": 18, "score": 290, "combatXp": 44, "projectileDamage": 108.864, "collisionDamage": 217.728, "fireInterval": 3.8, "color": "#818cf8"},
  magnetic_leech: {"type": "magnetic_leech", "name": "MAGNETIC LEECH · ĐỈA TỪ", "baseHp": 437.58, "baseArmor": 15.444, "speed": 45, "radius": 12, "score": 210, "combatXp": 32, "projectileDamage": 33.8688, "collisionDamage": 145.152, "fireInterval": 4, "color": "#22d3ee"},
  prism_manta: {"type": "prism_manta", "name": "PRISM MANTA · CÁ ĐUỐI LĂNG KÍNH", "baseHp": 617.76, "baseArmor": 23.166, "speed": 40, "radius": 18, "score": 290, "combatXp": 44, "projectileDamage": 78.624, "collisionDamage": 205.632, "fireInterval": 3.8, "color": "#c084fc"},
  swarm_carrier: {"type": "swarm_carrier", "name": "SWARM CARRIER · TÀU MẸ BẦY ĐÀN", "baseHp": 797.94, "baseArmor": 38.61, "speed": 30, "radius": 19, "score": 320, "combatXp": 38, "projectileDamage": 36.288, "collisionDamage": 217.728, "fireInterval": 7, "color": "#818cf8"},
  micro_drone: {"type": "micro_drone", "name": "MICRO DRONE", "baseHp": 94.185, "baseArmor": 0, "speed": 60, "radius": 7, "score": 0, "combatXp": 0, "projectileDamage": 0, "collisionDamage": 78.624, "fireInterval": 99, "color": "#a5f3fc"},
  cyclone_ace: {"type": "cyclone_ace", "name": "CYCLONE ACE · BẬC THẦY QUỸ ĐẠO", "baseHp": 7306.2, "baseArmor": 47.355, "speed": 62, "radius": 23, "score": 1500, "combatXp": 230, "projectileDamage": 124.488, "collisionDamage": 314.496, "fireInterval": 4, "color": "#22d3ee"},
  grid_architect: {"type": "grid_architect", "name": "GRID ARCHITECT · KIẾN TRÚC SƯ TỪ TRƯỜNG", "baseHp": 10553.4, "baseArmor": 89.298, "speed": 25, "radius": 28, "score": 1500, "combatXp": 230, "projectileDamage": 91.728, "collisionDamage": 366.912, "fireInterval": 7, "color": "#c084fc"},
  satellite: {"type": "satellite", "name": "MAGNETIC SATELLITE", "baseHp": 35062.5, "baseArmor": 33.66, "speed": 0, "radius": 10, "score": 0, "combatXp": 0, "projectileDamage": 188.16, "collisionDamage": 120.96, "fireInterval": 1.35, "color": "#67e8f9"},
  "scout": {
    "type": "scout",
    "name": "Scout Drone",
    "baseHp": 187.2,
    "baseArmor": 9.36,
    "speed": 62,
    "radius": 11,
    "score": 110,
    "combatXp": 24,
    "projectileDamage": 84.24,
    "collisionDamage": 129.6,
    "fireInterval": 2.8,
    "color": "#fb7185"
  },
  "fighter": {
    "type": "fighter",
    "name": "Interceptor",
    "baseHp": 304.2,
    "baseArmor": 16.38,
    "speed": 90,
    "radius": 14,
    "score": 170,
    "combatXp": 30,
    "projectileDamage": 59.4,
    "collisionDamage": 162,
    "fireInterval": 2.7,
    "color": "#f43f5e"
  },
  "attacker": {
    "type": "attacker",
    "name": "Heavy Gunship",
    "baseHp": 725.4,
    "baseArmor": 35.1,
    "speed": 34,
    "radius": 19,
    "score": 320,
    "combatXp": 38,
    "projectileDamage": 81,
    "collisionDamage": 226.8,
    "fireInterval": 2.4,
    "color": "#f97316"
  },
  "kamikaze": {
    "type": "kamikaze",
    "name": "Kamikaze Drone",
    "baseHp": 257.4,
    "baseArmor": 5.85,
    "speed": 270,
    "radius": 11,
    "score": 210,
    "combatXp": 28,
    "projectileDamage": 0,
    "collisionDamage": 280.8,
    "fireInterval": 99,
    "color": "#fbbf24"
  },
  "bomber": {
    "type": "bomber",
    "name": "Bomber",
    "baseHp": 561.6,
    "baseArmor": 21.06,
    "speed": 38,
    "radius": 18,
    "score": 290,
    "combatXp": 44,
    "projectileDamage": 194.4,
    "collisionDamage": 205.2,
    "fireInterval": 3.8,
    "color": "#fb923c"
  },
  "sniper": {
    "type": "sniper",
    "name": "Sniper Aircraft",
    "baseHp": 397.8,
    "baseArmor": 14.04,
    "speed": 48,
    "radius": 15,
    "score": 310,
    "combatXp": 46,
    "projectileDamage": 259.2,
    "collisionDamage": 172.8,
    "fireInterval": 4.2,
    "color": "#e879f9"
  },
  "jammer": {
    "type": "jammer",
    "name": "Jammer Drone",
    "baseHp": 468,
    "baseArmor": 23.4,
    "speed": 42,
    "radius": 15,
    "score": 310,
    "combatXp": 48,
    "projectileDamage": 91.8,
    "collisionDamage": 183.6,
    "fireInterval": 3,
    "color": "#2dd4bf"
  },
  "elite": {
    "type": "elite",
    "name": "Crimson Ace",
    "baseHp": 6642,
    "baseArmor": 43.05,
    "speed": 90,
    "radius": 23,
    "score": 1500,
    "combatXp": 230,
    "projectileDamage": 111.15,
    "collisionDamage": 280.8,
    "fireInterval": 2.4,
    "color": "#f43f5e"
  },
  "iron_fortress": {
    "type": "iron_fortress",
    "name": "Iron Fortress",
    "baseHp": 9594,
    "baseArmor": 81.18,
    "speed": 25,
    "radius": 28,
    "score": 1500,
    "combatXp": 230,
    "projectileDamage": 81.9,
    "collisionDamage": 327.6,
    "fireInterval": 2.8,
    "color": "#94a3b8"
  },
  "acid_bomber": {
    "type": "acid_bomber",
    "name": "Acid Bomber",
    "baseHp": 7749,
    "baseArmor": 51.66,
    "speed": 38,
    "radius": 25,
    "score": 1500,
    "combatXp": 230,
    "projectileDamage": 105.3,
    "collisionDamage": 280.8,
    "fireInterval": 3.8,
    "color": "#a3e635"
  },
  "radar_hunter": {
    "type": "radar_hunter",
    "name": "Radar Hunter",
    "baseHp": 6559.59,
    "baseArmor": 49.2,
    "speed": 62,
    "radius": 24,
    "score": 1500,
    "combatXp": 320,
    "projectileDamage": 304.2,
    "collisionDamage": 304.2,
    "fireInterval": 4.2,
    "color": "#38bdf8"
  },
  "boss": {
    "type": "boss",
    "name": "PHÁO ĐÀI BAY LEVIATHAN X-99",
    "baseHp": 159375,
    "baseArmor": 153,
    "speed": 30,
    "radius": 43,
    "score": 12000,
    "combatXp": 0,
    "projectileDamage": 168,
    "collisionDamage": 600,
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
  if (!definition) return { id, name: "Lõi cũ", description: "Lõi không còn thuộc danh mục hiện tại; không áp dụng hiệu ứng.", system: "utility", icon: "◇", category: "offense", tiers: ["silver"] };
  return definition;
}

/** Concrete Magnetic Storm boss stats, before wave progression. */
export const TEMPEST_CONFIG: EnemyConfig = { ...ENEMY_CONFIGS.boss, name: "TEMPEST CROWN", baseHp: 175312.5, baseArmor: 168.3, projectileDamage: 188.16, collisionDamage: 672 };
export const stageEnemyConfig = (type: EnemyType, stageId: number): EnemyConfig => type === "boss" && stageId === 2 ? TEMPEST_CONFIG : ENEMY_CONFIGS[type];
