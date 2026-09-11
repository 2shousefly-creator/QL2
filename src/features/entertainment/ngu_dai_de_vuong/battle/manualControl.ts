import type { Skill } from '../types';
import type { Actor } from './types';
import { BATTLE } from '../data/config';
import { distance, hardCC, has } from './stats';
export type CombatMode = 'auto' | 'manual';
export type ManualSkillState = 'ready' | 'queued' | 'mana' | 'cooldown' | 'locked' | 'dead' | 'ended' | 'casting' | 'noTarget';
export function skillReach(a: Actor, skill: Skill, target: Actor): number {
  if (target.side === a.side || a.boss || skill.dive || skill.ignoreTaunt) return Infinity;
  return (skill.shape === 'cone' || skill.shape === 'selfCircle' ? skill.radius : a.hero.range) * BATTLE.rangeUnit + BATTLE.hitTolerance;
}
export const withinSkillRange = (a: Actor, skill: Skill, target: Actor) => distance(a, target) <= skillReach(a, skill, target);
export function resourceState(a: Actor, skill: Skill): ManualSkillState {
  if (a.hp <= 0) return 'dead';
  if (hardCC(a) || has(a, 'silence')) return 'locked';
  if ((a.cooldowns[skill.id] || 0) > 0) return 'cooldown';
  if (a.mana < skill.mana) return 'mana';
  if (a.action?.skill?.id === skill.id) return 'casting';
  return 'ready';
}
