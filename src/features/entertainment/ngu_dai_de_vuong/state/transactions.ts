import type { GameState } from '../../../../game/types';
import { spendSharedGold } from '../../chien_tuyen/sharedGold';
import { CONSUMABLES, EQUIPMENT, HEROES, MATERIALS, RECIPES, SUMMON_TABLE, equipmentById, heroById, stageById } from '../data';
import { awardXp, createProfile, freshHero, levelCap, sortFormation, stageUnlocked, updateUnlock } from './profile';
import type { BattleReceipt, GameProfile, RewardItem, Slot } from '../types';
import { pickUniform, unitRandom, weightedReward } from './summon';

export type Action =
  | { type: 'equip'; heroId: string; slot: Slot; itemId?: string }
  | { type: 'bottle'; heroId: string; count?: number }
  | { type: 'star' | 'unlock'; heroId: string }
  | { type: 'craft'; recipeId: string }
  | { type: 'summon'; count: 1 | 10; payment: 'tickets' | 'gold' }
  | { type: 'chest'; itemId: string };
export const randomValues = (n: number) => Array.from(crypto.getRandomValues(new Uint32Array(n)), x => x / 4294967296);
const add = (stacks: Record<string, number>, id: string, n: number) => { stacks[id] = (stacks[id] || 0) + n; };
const pick = pickUniform;
export function transact(draft: GameState, id: string, action: Action, rolls: number[]) {
  const p = draft.nguDaiDeVuong ??= createProfile();
  if (p.lastAction?.id === id) return;
  let cursor = 0;
  const roll = () => unitRandom(rolls[cursor++]);
  const finish = (ok: boolean, message: string, items?: RewardItem[]) => { p.lastAction = { id, ok, message, items }; };
  if (p.activeBattle) return finish(false, 'Hãy hoàn thành trận đấu trước.');
  if (action.type === 'equip') {
    const h = p.ownedHeroes[action.heroId], e = action.itemId ? equipmentById[action.itemId] : undefined;
    if (!h || (action.itemId && (!e || !p.equipment[e.id] || e.slot !== action.slot || (e.class !== 'Tất cả' && e.class !== heroById[action.heroId].class)))) return finish(false, 'Trang bị không phù hợp hoặc không còn trong kho.');
    const old = h.equipment[action.slot];
    if (old) add(p.equipment, old, 1);
    if (e) { p.equipment[e.id]--; h.equipment[action.slot] = e.id; } else delete h.equipment[action.slot];
    return finish(true, e ? `Đã trang bị ${e.name}.` : 'Đã tháo trang bị.');
  }
  if (action.type === 'unlock') {
    if (!heroById[action.heroId] || p.ownedHeroes[action.heroId] || (p.shards[action.heroId] || 0) < 25) return finish(false, 'Cần 25 mảnh để chiêu mộ tướng.');
    p.shards[action.heroId] -= 25; p.ownedHeroes[action.heroId] = freshHero();
    return finish(true, `Đã chiêu mộ ${heroById[action.heroId].name}.`);
  }
  if (action.type === 'bottle' || action.type === 'star') {
    const h = p.ownedHeroes[action.heroId];
    if (!h) return finish(false, 'Bạn chưa sở hữu tướng.');
    if (action.type === 'bottle') {
      if (h.level >= levelCap(h) || !p.consumables.CON001) return finish(false, 'Cần thăng sao hoặc bổ sung Bình EXP.');
      const requested = action.count ?? 1;
      if (!Number.isInteger(requested) || requested < 1) return finish(false, 'Số bình không hợp lệ.');
      let consumed = 0;
      const limit = Math.min(requested, p.consumables.CON001);
      while (consumed < limit && h.level < levelCap(h)) { p.consumables.CON001--; consumed++; awardXp(h, 10); }
      return finish(true, `+${consumed * 10} Hero EXP · ${consumed} bình.`);
    }
    const cost = h.star * 25;
    if (h.star >= 5 || h.level < levelCap(h) || (p.shards[action.heroId] || 0) < cost) return finish(false, 'Chưa đủ cấp hoặc mảnh để thăng sao.');
    p.shards[action.heroId] -= cost; h.star++; return finish(true, `Đã mở giới hạn cấp ${levelCap(h)}.`);
  }
  if (action.type === 'craft') {
    const recipe = RECIPES.find(r => r.id === action.recipeId);
    if (!recipe || recipe.materials.some(m => (p.materials[m.id] || 0) < m.quantity)) return finish(false, 'Chưa đủ nguyên liệu chế tạo.');
    if (!spendSharedGold(draft, recipe.gold)) return finish(false, 'Chưa đủ Vàng.');
    for (const m of recipe.materials) p.materials[m.id] -= m.quantity;
    add(p.equipment, recipe.itemId, 1);
    return finish(true, `Đã chế tạo ${equipmentById[recipe.itemId].name}.`);
  }
  if (action.type === 'chest') {
    const chest = CONSUMABLES.find(c => c.id === action.itemId && c.id.startsWith('BOX'));
    if (!chest || !p.consumables[chest.id]) return finish(false, 'Không có rương trong kho.');
    const e = pick(EQUIPMENT.filter(e => e.rarity === chest.rarity), roll());
    if (!e) return finish(false, 'Rương chưa có vật phẩm.');
    p.consumables[chest.id]--; add(p.equipment, e.id, 1);
    return finish(true, `Nhận ${e.name}.`, [{ id: e.id, name: e.name, quantity: 1, rarity: e.rarity }]);
  }
  if (action.type === 'summon') {
    if (action.count !== 1 && action.count !== 10) return finish(false, 'Số lượt không hợp lệ.');
    // Two independent draws per roll: reward type, then the uniform pool member.
    // Validate before debiting currency; never manufacture a zero on cursor exhaustion.
    if (rolls.length < action.count * 2) return finish(false, 'Chưa chuẩn bị đủ lượt triệu hồi.');
    for (const value of rolls.slice(0, action.count * 2)) unitRandom(value);
    weightedReward(rolls[0]);
    if (action.payment === 'tickets') {
      if (p.summonTickets < action.count) return finish(false, 'Chưa đủ Vé Triệu Hồi.');
      p.summonTickets -= action.count;
    } else if (!spendSharedGold(draft, action.count * 30)) return finish(false, 'Chưa đủ Vàng.');
    const items: RewardItem[] = [];
    for (let i = 0; i < action.count; i++) {
      const row = weightedReward(roll()), poolRoll = roll();
      if (row.id === 'hero' || row.id === 'shard') {
        const h = pick(HEROES, poolRoll);
        if (row.id === 'hero' && !p.ownedHeroes[h.id]) { p.ownedHeroes[h.id] = freshHero(); items.push({ id: h.id, heroId: h.id, name: h.name, quantity: 1, rarity: 'S' }); }
        else { const n = row.id === 'hero' ? 25 : 1; add(p.shards, h.id, n); items.push({ id: `SH${h.id.slice(1)}`, heroId: h.id, name: `Mảnh ${h.name}`, quantity: n }); }
      } else if (row.id === 'bottles') { add(p.consumables, 'CON001', 5); items.push({ id: 'CON001', name: 'Bình EXP', quantity: 5 }); }
      else { const e = pick(EQUIPMENT.filter(e => e.rarity === row.id), poolRoll); add(p.equipment, e.id, 1); items.push({ id: e.id, name: e.name, quantity: 1, rarity: e.rarity }); }
    }
    return finish(true, `Đã triệu hồi ${action.count} lần.`, items);
  }
}
export function beginBattle(p: GameProfile, id: string, stageId: string, formation: string[]) {
  const team = sortFormation(formation.filter(h => p.ownedHeroes[h]));
  if (p.activeBattle || !stageUnlocked(p, stageId) || team.length !== 4) return;
  p.formation = team; p.activeBattle = { id, stageId, formation: team };
}
export function settleBattle(p: GameProfile, id: string, victory: boolean, rewardRoll: number): BattleReceipt | undefined {
  if (p.lastBattle?.id === id) return p.lastBattle;
  const battle = p.activeBattle;
  if (!battle || battle.id !== id) return;
  const stage = stageById[battle.stageId];
  const firstClear = victory && !p.firstClearClaimed.includes(stage.id);
  const receipt: BattleReceipt = { id, stageId: stage.id, victory, firstClear, items: [], heroXp: victory ? stage.heroXp : 0, levels: [] };
  if (victory) {
    const n = stage.min + Math.min(stage.max - stage.min, Math.floor(rewardRoll * (stage.max - stage.min + 1)));
    const target = stage.rewardId.startsWith('MAT') ? p.materials : stage.rewardId.startsWith('EQ') ? p.equipment : p.consumables;
    add(target, stage.rewardId, n);
    receipt.items.push({ id: stage.rewardId, name: [...MATERIALS, ...CONSUMABLES, ...EQUIPMENT].find(m => m.id === stage.rewardId)!.name, quantity: n });
    if (firstClear) {
      p.firstClearClaimed.push(stage.id);
      if (stage.firstBottles) { add(p.consumables, 'CON001', stage.firstBottles); receipt.items.push({ id: 'CON001', name: 'Bình EXP', quantity: stage.firstBottles }); }
      if (stage.firstTickets) { p.summonTickets += stage.firstTickets; receipt.items.push({ id: 'CON002', name: 'Vé Triệu Hồi · Lần đầu', quantity: stage.firstTickets, rarity: 'S' }); }
    }
    if (!p.clearedStages.includes(stage.id)) p.clearedStages.push(stage.id);
    for (const heroId of battle.formation) { const h = p.ownedHeroes[heroId], before = h.level; awardXp(h, stage.heroXp); receipt.levels.push({ heroId, before, after: h.level }); }
    updateUnlock(p);
  }
  delete p.activeBattle; p.lastBattle = receipt; return receipt;
}
