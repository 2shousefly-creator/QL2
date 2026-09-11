import type { Boss, Skill } from '../types';
const skill = (id: string, name: string, cooldown: number, windup: number, coefficients: number[], options: Partial<Skill> = {}): Skill => ({ id, heroId: id.split('-')[0], slot: 1, name, mana: 0, cooldown, windup, coefficients, description: name, aiDescription: 'Tự động theo hồi chiêu', damageType: 'magic', crit: false, target: 'nearest', shape: 'single', radius: 1.2, aiPriority: 200, condition: 'enemy', vfx: 'lightning', ...options });
export const BOSSES: Boss[] = [
  { id: 'B001', name: 'Thạch Giáp Cự Tướng', baseline: 'H003', level: 10, hp: 4.2, atk: 1.6, armor: 1.15, mr: 1.1, crit: .1, ccMultiplier: .7, attackInterval: 1.2, range: 1, moveSpeed: .85, enrage: 'stone', skills: [
    skill('B001-1', 'Toái Thạch Hoành Tảo', 7, .7, [1.5], { shape: 'cone', radius: 2, damageType: 'physical', vfx: 'slash', effects: [{ kind: 'knockback', value: .35, duration: .3 }] }),
    skill('B001-2', 'Địa Liệt Chấn', 12, 1.2, [1.8], { shape: 'all', damageType: 'physical', vfx: 'earth', effects: [{ kind: 'knockup', value: 1, duration: 1 }] }),
  ] },
  { id: 'B002', name: 'Xích Viêm Hỏa Kỳ Lân', baseline: 'H017', level: 20, hp: 5, atk: 1.55, armor: 1.1, mr: 1.2, crit: .1, ccMultiplier: .6, attackInterval: 1.1, range: 2, moveSpeed: .95, enrage: 'fire', skills: [
    skill('B002-1', 'Hỏa Vũ Liên Châu', 8, .65, [.6, .6, .6, .6], { shape: 'rain', radius: .65, vfx: 'fire' }),
    skill('B002-2', 'Liệt Diệm Phun Trào', 11, .9, [1.8], { shape: 'line', radius: 8, vfx: 'fire', effects: [{ kind: 'burn', value: .2, duration: 4 }] }),
  ] },
  { id: 'B003', name: 'Cửu Tiêu Lôi Long', baseline: 'H016', level: 30, hp: 6, atk: 1.7, armor: 1.2, mr: 1.25, crit: .12, ccMultiplier: .5, attackInterval: 1, range: 2, moveSpeed: 1, enrage: 'thunder', skills: [
    skill('B003-1', 'Lôi Liên Cửu Tiêu', 7, .65, [1.4, 1.05, .8], { shape: 'chain', radius: 10 }),
    skill('B003-2', 'Lôi Vực', 12, 1, [2], { target: 'highestRange', shape: 'circle', radius: 1.2, effects: [{ kind: 'stun', value: 1, duration: 1.2 }] }),
    skill('B003-3', 'Thiên Phạt', 16, 1.3, [2.2], { shape: 'all' }),
  ] },
];
