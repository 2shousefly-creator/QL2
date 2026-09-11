export type HeroClass = 'Đỡ Đòn' | 'Đấu Sĩ' | 'Sát Thủ' | 'Xạ Thủ' | 'Pháp Sư' | 'Hỗ Trợ';
export type Rarity = 'C' | 'B' | 'A' | 'S';
export type Slot = 'Mũ' | 'Giáp' | 'Vũ Khí' | 'Giày';
export type DamageType = 'physical' | 'magic';
export interface Stats { atk: number; hp: number; armor: number; mr: number; crit: number; critDamage: number; armorPen: number; magicPen: number; }
export interface Hero extends Stats { id: string; name: string; class: HeroClass; damageType: DamageType; range: number; attackInterval: number; moveSpeed: number; maxMana: number; }
export interface Equipment { id: string; name: string; slot: Slot; rarity: Rarity; color: string; weapon: string; class: HeroClass | 'Tất cả'; atk: number; hp: number; armor: number; mr: number; }
export interface Material { id: string; name: string; region: string; rarity: Rarity; description: string; }
export interface Recipe { id: string; itemId: string; gold: number; materials: { id: string; quantity: number }[]; }
export type StatusKind = 'taunt' | 'stun' | 'freeze' | 'silence' | 'knockback' | 'knockup' | 'attackSpeed' | 'moveSpeed' | 'atk' | 'armor' | 'armorPct' | 'mr' | 'reduction' | 'damageBonus' | 'damageDown' | 'shield' | 'burn' | 'untargetable' | 'crit' | 'reflect' | 'mark' | 'eagleEye';
export interface Effect { kind: StatusKind; value: number; duration: number; atkScale?: number; hpScale?: number; linkedShield?: boolean; }
export type TargetRule = 'nearest' | 'farthest' | 'lowestEnemy' | 'marked' | 'backline' | 'cluster' | 'self' | 'lowestAlly' | 'twoLowest' | 'allAllies' | 'topAttack' | 'debuffAlly' | 'highestRange';
export type Shape = 'single' | 'circle' | 'selfCircle' | 'cone' | 'line' | 'chain' | 'rain' | 'all';
export interface Skill {
  id: string; heroId: string; slot: number; name: string; mana: number; cooldown: number; description: string; aiDescription: string;
  damageType: DamageType; crit: boolean; coefficients: number[]; target: TargetRule; shape: Shape; radius: number;
  aiPriority: number; condition: string; ignoreTaunt?: boolean; dive?: boolean; projectile?: boolean; windup: number;
  effects?: Effect[]; selfEffects?: Effect[]; healAtk?: number; healTargetHp?: number; healSelfHp?: number; healMissingHp?: number;
  shieldAtk?: number; shieldHp?: number; shieldDuration?: number; shieldArmor?: number; shieldMr?: number; shieldReflect?: number;
  splashCoefficient?: number; armorPen?: number; executeThreshold?: number; executeMultiplier?: number; resetOnKill?: string;
  cleanse?: boolean; cleanReduction?: number; tauntCount?: number; tauntDuration?: number; freezeIfSlow?: boolean; lastHitEffect?: Effect;
  castUntargetable?: number; vfx: string;
}
export interface Stage { id: string; region: number; name: string; level: number; bossId?: string; enemies: string[]; heroXp: number; rewardId: string; min: number; max: number; firstBottles: number; firstTickets: number; equipmentRarities: Rarity[]; }
export interface Boss { id: string; name: string; baseline: string; level: number; hp: number; atk: number; armor: number; mr: number; crit: number; ccMultiplier: number; attackInterval: number; range: number; moveSpeed: number; skills: Skill[]; enrage: string; }
export interface OwnedHero { level: number; xp: number; star: number; equipment: Partial<Record<Slot, string>>; }
export interface RewardItem { id: string; name: string; quantity: number; rarity?: Rarity; heroId?: string; }
export interface BattleReceipt { id: string; stageId: string; victory: boolean; firstClear: boolean; items: RewardItem[]; heroXp: number; levels: { heroId: string; before: number; after: number }[]; }
export interface GameProfile {
  schemaVersion: 1; ownedHeroes: Record<string, OwnedHero>; shards: Record<string, number>; materials: Record<string, number>; equipment: Record<string, number>; consumables: Record<string, number>;
  summonTickets: number; clearedStages: string[]; firstClearClaimed: string[]; unlockedStage: string; unlockedRegion: number; formation: string[];
  settings: { speed: 1 | 2; quality: 'high' | 'medium' | 'low' };
  activeBattle?: { id: string; stageId: string; formation: string[] }; lastBattle?: BattleReceipt;
  lastAction?: { id: string; ok: boolean; message: string; items?: RewardItem[] };
}
