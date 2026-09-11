import { EQUIPMENT, HEROES, STAGES, heroById, equipmentById, stageById } from '../data';
import { STARTER_IDS } from '../data/hardOverrides';
import { SLOTS } from '../data/config';
import type { GameProfile, OwnedHero, Stats, Hero, Rarity } from '../types';
export const xpToNext = (level: number) => 10 + 3 * (level - 1);
export const levelCap = (hero: OwnedHero) => hero.star * 20;
export const freshHero = (): OwnedHero => ({ level: 1, xp: 0, star: 1, equipment: {} });
export function sortFormation(ids: string[]): string[] {
  return [...new Set(ids)].filter(id => heroById[id]).sort((a, b) => heroById[a].range - heroById[b].range || heroById[a].name.localeCompare(heroById[b].name, 'vi') || a.localeCompare(b)).slice(0, 4);
}
export function createProfile(): GameProfile {
  return { schemaVersion: 1, ownedHeroes: Object.fromEntries(STARTER_IDS.map(id => [id, freshHero()])), shards: {}, materials: {}, equipment: {}, consumables: {}, summonTickets: 0, clearedStages: [], firstClearClaimed: [], unlockedStage: '1-1', unlockedRegion: 1, formation: sortFormation(STARTER_IDS), settings: { speed: 1, quality: 'high' } };
}
const record = (x: unknown): Record<string, any> => x && typeof x === 'object' && !Array.isArray(x) ? x as Record<string, any> : {};
const count = (x: unknown) => Number.isFinite(Number(x)) ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(Number(x)))) : 0;
const stacks = (raw: unknown, valid: (id: string) => boolean) => Object.fromEntries(Object.entries(record(raw)).filter(([id]) => valid(id)).map(([id, n]) => [id, count(n)]));
export function sanitizeProfile(raw: unknown): GameProfile {
  if (!raw || typeof raw !== 'object') return createProfile();
  const r = record(raw), p = createProfile();
  p.ownedHeroes = {};
  for (const [id, data] of Object.entries(record(r.ownedHeroes))) {
    if (!heroById[id]) continue;
    const h = record(data);
    const star = Math.max(1, Math.min(5, count(h.star)));
    const level = Math.max(1, Math.min(star * 20, count(h.level)));
    const equipment = Object.fromEntries(Object.entries(record(h.equipment)).filter(([slot, itemId]) => { const e = equipmentById[String(itemId)]; return e && e.slot === slot && (e.class === 'Tất cả' || e.class === heroById[id].class); }));
    p.ownedHeroes[id] = { star, level, xp: Math.min(count(h.xp), xpToNext(level) - 1), equipment };
  }
  for (const id of STARTER_IDS) p.ownedHeroes[id] ??= freshHero();
  p.shards = stacks(r.shards, id => Boolean(heroById[id]));
  p.materials = stacks(r.materials, id => /^MAT0(0[1-9]|1[0-2])$/.test(id));
  p.equipment = stacks(r.equipment, id => Boolean(equipmentById[id]));
  p.consumables = stacks(r.consumables, id => id === 'CON001' || /^BOX00[1-4]$/.test(id));
  p.summonTickets = count(r.summonTickets);
  const validStages = (v: unknown) => [...new Set(Array.isArray(v) ? v.filter(id => typeof id === 'string' && stageById[id]) as string[] : [])];
  p.clearedStages = validStages(r.clearedStages);
  p.firstClearClaimed = [...new Set([...validStages(r.firstClearClaimed), ...p.clearedStages])];
  updateUnlock(p);
  p.formation = sortFormation((Array.isArray(r.formation) ? r.formation : STARTER_IDS).filter(id => p.ownedHeroes[id]));
  const settings = record(r.settings);
  p.settings = { speed: settings.speed === 2 ? 2 : 1, quality: ['high', 'medium', 'low'].includes(settings.quality) ? settings.quality : 'high' };
  // An interrupted battle costs nothing and yields nothing. Persisted receipts prevent duplicate claims.
  if (r.lastBattle && typeof r.lastBattle.id === 'string' && stageById[r.lastBattle.stageId]) p.lastBattle = r.lastBattle;
  if (r.lastAction && typeof r.lastAction.id === 'string') p.lastAction = r.lastAction;
  return p;
}
export function updateUnlock(p: GameProfile) {
  const next = STAGES.find(s => !p.clearedStages.includes(s.id)) || STAGES[STAGES.length - 1];
  p.unlockedStage = next.id; p.unlockedRegion = next.region;
}
export const stageUnlocked = (p: GameProfile, id: string) => Boolean(stageById[id]) && (p.clearedStages.includes(id) || p.unlockedStage === id);
export function awardXp(hero: OwnedHero, amount: number) {
  hero.xp += Math.max(0, amount);
  while (hero.level < levelCap(hero) && hero.xp >= xpToNext(hero.level)) { hero.xp -= xpToNext(hero.level); hero.level++; }
  if (hero.level >= levelCap(hero)) hero.xp = Math.min(hero.xp, xpToNext(hero.level) - 1);
}
export function statsFor(hero: Hero, owned: OwnedHero): Stats {
  const level = owned.level - 1;
  const s: Stats = { atk: hero.atk + level * 3, hp: hero.hp + level * 25, armor: hero.armor + level * 1.2, mr: hero.mr + level, crit: hero.crit, critDamage: hero.critDamage, armorPen: hero.armorPen, magicPen: hero.magicPen };
  for (const id of Object.values(owned.equipment)) { const e = equipmentById[id]; if (e) { s.atk += e.atk; s.hp += e.hp; s.armor += e.armor; s.mr += e.mr; } }
  return s;
}
export function enemyLoadout(hero: Hero, level: number, rarities: Rarity[]): OwnedHero {
  const rarity = (['S', 'A', 'B', 'C'] as const).find(r => rarities.includes(r)) || 'C';
  return { level, xp: 0, star: Math.ceil(level / 20), equipment: Object.fromEntries(SLOTS.map(slot => [slot, EQUIPMENT.find(e => e.rarity === rarity && e.slot === slot && (e.class === 'Tất cả' || e.class === hero.class))!.id])) };
}
export function power(hero: Hero, owned: OwnedHero) { const s = statsFor(hero, owned); return Math.round(s.atk * 5 + s.hp + (s.armor + s.mr) * 8); }
