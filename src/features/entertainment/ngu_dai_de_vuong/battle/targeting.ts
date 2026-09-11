import type { Actor } from './types';
import type { Skill } from '../types';
import { BATTLE } from '../data/config';
import { attack, distance, has, hpRatio, isDebuff, valid } from './stats';
const tie = (a: Actor, b: Actor) => a.slot - b.slot || a.id.localeCompare(b.id);
export const nearest = (actor: Actor, list: Actor[]) => [...list].sort((a, b) => { const d = distance(actor, a) - distance(actor, b); return Math.abs(d) > .01 ? d : tie(a, b); });
export const enemiesOf = (a: Actor, all: Actor[]) => all.filter(b => b.side !== a.side && valid(b));
export const alliesOf = (a: Actor, all: Actor[]) => all.filter(b => b.side === a.side && b.hp > 0);
export function chooseTargets(a: Actor, all: Actor[], skill?: Skill): Actor[] {
  const enemies = nearest(a, enemiesOf(a, all)), allies = alliesOf(a, all).sort((x, y) => hpRatio(x) - hpRatio(y) || tie(x, y));
  const target = skill?.target || 'nearest';
  if (target === 'self') return [a];
  if (target === 'allAllies') return allies;
  if (target === 'lowestAlly') return allies.slice(0, 1);
  if (target === 'twoLowest') return allies.slice(0, 2);
  if (target === 'topAttack') return [...allies].sort((x, y) => attack(y) - attack(x) || tie(x, y)).slice(0, 2);
  if (target === 'debuffAlly') return [allies.find(b => b.statuses.some(isDebuff)) || allies[0]].filter(Boolean);
  const taunt = a.statuses.filter(s => s.kind === 'taunt').map(s => enemies.find(b => b.id === s.source)).find(Boolean);
  if (taunt && !skill?.ignoreTaunt) return [taunt];
  if (!skill && has(a, 'eagleEye')) { const candidates = enemies.filter(b => distance(a, b) <= a.hero.range * BATTLE.rangeUnit).sort((x, y) => hpRatio(x) - hpRatio(y) || tie(x, y)); if (candidates.length) return candidates.slice(0, 1); }
  if (target === 'farthest' || target === 'backline') return [...enemies].sort((x, y) => { const d = distance(a, y) - distance(a, x); return Math.abs(d) > .01 ? d : tie(x, y); }).slice(0, target === 'backline' ? 3 : 1);
  if (target === 'lowestEnemy') return enemies.sort((x, y) => hpRatio(x) - hpRatio(y) || tie(x, y)).slice(0, 1);
  if (target === 'marked') return [enemies.find(b => b.statuses.some(s => s.kind === 'mark' && s.source === a.id)) || [...enemies].sort((x, y) => hpRatio(x) - hpRatio(y) || tie(x, y))[0]].filter(Boolean);
  if (target === 'highestRange') return enemies.sort((x, y) => y.hero.range - x.hero.range || tie(x, y)).slice(0, 1);
  if (target === 'cluster') {
    const score = (b: Actor) => enemies.filter(c => distance(b, c) <= skill!.radius * BATTLE.rangeUnit).reduce((n, c) => n + 10 + (skill?.freezeIfSlow && c.statuses.some(s => s.kind === 'attackSpeed' && s.value < 0) ? 1 : 0), 0);
    return [...enemies].sort((x, y) => score(y) - score(x) || tie(x, y)).slice(0, 1);
  }
  return enemies.slice(0, 1);
}
export function areaTargets(a: Actor, target: { x: number; y: number }, all: Actor[], skill: Skill): Actor[] {
  const enemies = enemiesOf(a, all), radius = skill.radius * BATTLE.rangeUnit;
  if (skill.shape === 'all') return enemies;
  if (skill.shape === 'selfCircle') return enemies.filter(b => distance(a, b) <= radius);
  if (skill.shape === 'circle' || skill.shape === 'rain') return enemies.filter(b => distance(target, b) <= radius);
  const dx = target.x - a.x, dy = target.y - a.y, length = Math.hypot(dx, dy) || 1;
  if (skill.shape === 'line') return enemies.filter(b => { const projection = ((b.x - a.x) * dx + (b.y - a.y) * dy) / length; const perpendicular = Math.abs((b.x - a.x) * dy - (b.y - a.y) * dx) / length; return projection >= -25 && projection <= radius && perpendicular <= 75; });
  if (skill.shape === 'cone') return enemies.filter(b => { const d = distance(a, b); return d <= radius && ((b.x - a.x) * dx + (b.y - a.y) * dy) / (length * (d || 1)) >= .3; });
  return [];
}
export function conditionMet(a: Actor, target: Actor, all: Actor[], skill: Skill) {
  const enemies = enemiesOf(a, all), allies = alliesOf(a, all), area = areaTargets(a, target, all, skill).length;
  const inRange = enemies.some(b => distance(a, b) <= a.hero.range * BATTLE.rangeUnit);
  const below = (n: number) => allies.filter(b => hpRatio(b) <= n).length;
  const marked = enemies.some(b => b.statuses.some(s => s.kind === 'mark' && s.source === a.id));
  const warning = enemies.some(b => b.boss && b.action?.skill);
  const boss = enemies.some(b => b.boss);
  switch (skill.condition) {
    case 'enemy': return enemies.length > 0;
    case 'inRange': return inRange;
    case 'self60OrTwoAttackers': return hpRatio(a) <= .6 || enemies.filter(b => b.targetId === a.id).length >= 2;
    case 'self70': return hpRatio(a) <= .7;
    case 'self80OrArea2': return hpRatio(a) <= .8 || area >= 2;
    case 'area2OrSelf65': return area >= 2 || hpRatio(a) <= .65;
    case 'self60OrBoss': return hpRatio(a) <= .6 || boss;
    case 'distance03': return distance(a, target) > .3 * BATTLE.rangeUnit;
    case 'area1': return area >= 1;
    case 'area2': return area >= 2;
    case 'enemies2': return enemies.length >= 2;
    case 'area2OrBoss': return area >= 2 || boss;
    case 'targetAbove40': return hpRatio(target) > .4;
    case 'noStun': return !has(target, 'stun');
    case 'noArmorDown': return !has(target, 'armorPct');
    case 'noBurn': return !has(target, 'burn');
    case 'noMark': return !target.statuses.some(s => s.kind === 'mark' && s.source === a.id);
    case 'noSlow': return !target.statuses.some(s => s.kind === 'attackSpeed' && s.value < 0);
    case 'enemy50': return hpRatio(target) <= .5;
    case 'enemy60': return hpRatio(target) <= .6;
    case 'markOrEnemy35': return marked || hpRatio(target) <= .35;
    case 'backlineFar': return target.hero.range > 1 && distance(a, target) > BATTLE.rangeUnit;
    case 'backline': return target.hero.range > 1;
    case 'ally50': return below(.5) >= 1;
    case 'ally75': return below(.75) >= 1;
    case 'ally85': return below(.85) >= 1;
    case 'twoAllies70': return below(.7) >= 2;
    case 'twoAllies70OrWarning': return below(.7) >= 2 || warning;
    case 'debuffOrAlly60': return allies.some(b => b.statuses.some(isDebuff)) || below(.6) >= 1;
    case 'allies2': return allies.length >= 2;
    default: return false;
  }
}
