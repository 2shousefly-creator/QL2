import { heroById, SKILLS } from '../data';
import { BOSSES } from '../data/bosses';
import { BATTLE } from '../data/config';
import { enemyLoadout, sortFormation, statsFor } from '../state/profile';
import type { Effect, GameProfile, Skill, Stage } from '../types';
import type { Actor, AnimationCommand, AnimationEvent, AnimationName, Projectile, VisualEvent } from './types';
import { attack, clamp, distance, hardCC, has, hpRatio, interval, isDebuff, modifier, resistanceMultiplier, valid } from './stats';
import { areaTargets, chooseTargets, conditionMet, enemiesOf, nearest } from './targeting';
import { resourceState, skillReach, withinSkillRange, type CombatMode, type ManualSkillState } from './manualControl';
import { HERO_VISUAL_PROFILES } from '../data/heroVisualProfiles';

export class BattleEngine {
  actors: Actor[] = [];
  projectiles: Projectile[] = [];
  commands: AnimationCommand[] = [];
  visuals: VisualEvent[] = [];
  elapsed = 0;
  outcome?: 'victory' | 'defeat';
  mode: CombatMode = 'auto';
  private manualQueue = new Map<string, string>();
  constructor(public stage: Stage, profile: GameProfile, formation: string[], private random: () => number = Math.random) {
    const addActor = (heroId: string, side: Actor['side'], slot: number, bossId?: string) => {
      const boss = BOSSES.find(b => b.id === bossId);
      const baseline = heroById[boss?.baseline || heroId];
      const level = side === 'player' ? profile.ownedHeroes[heroId].level : stage.level;
      const owned = side === 'player' ? profile.ownedHeroes[heroId] : enemyLoadout(baseline, level, stage.equipmentRarities);
      const stats = statsFor(baseline, owned);
      const hero = { ...baseline };
      if (boss) { stats.hp *= boss.hp; stats.atk *= boss.atk; stats.armor *= boss.armor; stats.mr *= boss.mr; stats.crit = boss.crit; hero.range = boss.range; hero.moveSpeed = boss.moveSpeed; hero.name = boss.name; }
      const actor: Actor = { id: `${side}-${boss?.id || heroId}`, hero, boss, side, slot, level, stats, hp: stats.hp, mana: 0, x: side === 'player' ? 590 - slot * 135 : 1330 + slot * 135, y: 570 + (slot % 2) * 85 - Math.floor(slot / 2) * 45, facing: side === 'player' ? 1 : -1, skills: boss?.skills || SKILLS.filter(s => s.heroId === heroId), cooldowns: {}, statuses: [], attackCooldown: 0, aiCooldown: 0, token: 0, pose: 'idle', moveMultiplier: 0, enraged: false, damageDone: 0 };
      if (boss) { actor.x = 1380; actor.y = 590; for (const s of actor.skills) actor.cooldowns[s.id] = s.cooldown; }
      this.actors.push(actor);
    };
    sortFormation(formation).forEach((id, i) => addActor(id, 'player', i));
    if (stage.bossId) addActor('', 'enemy', 0, stage.bossId);
    else sortFormation(stage.enemies).forEach((id, i) => addActor(id, 'enemy', i));
  }
  get(id: string) { return this.actors.find(a => a.id === id); }
  setMode(mode: CombatMode) {
    this.mode = mode;
    if (mode === 'auto') this.manualQueue.clear();
  }
  manualSkillState(actorId: string, skillId: string): ManualSkillState {
    if (this.outcome) return 'ended';
    const a = this.get(actorId), skill = a?.skills.find(s => s.id === skillId);
    if (!a || a.side !== 'player' || !skill) return 'dead';
    const state = resourceState(a, skill);
    if (state !== 'ready') return state;
    if (!chooseTargets(a, this.actors, skill).length) return 'noTarget';
    return this.manualQueue.get(actorId) === skillId ? 'queued' : 'ready';
  }
  requestManualSkill(actorId: string, skillId: string): boolean {
    if (this.mode !== 'manual' || this.manualSkillState(actorId, skillId) !== 'ready') return false;
    this.manualQueue.set(actorId, skillId);
    return true;
  }
  private pose(a: Actor, name: AnimationName) {
    if (a.pose === name) return;
    a.pose = name;
    this.commands.push({ actorId: a.id, name, token: a.token, duration: name === 'death' ? 1.1 : 1, impact: 0, hits: 0, projectile: false });
  }
  private interrupt(a: Actor) { if (a.action) { a.action = undefined; a.token++; } }
  private shield(a: Actor, source: Actor, value: number, duration: number, armor = 0, mr = 0, reflect = 0, key = 'shield') {
    this.applyStatus(a, source, { kind: 'shield', value, duration }, key);
    const shield = a.statuses.find(s => s.key === `${source.id}:${key}:shield`)!;
    for (const [kind, n] of [['armor', armor], ['mr', mr], ['reflect', reflect]] as const) if (n) {
      this.applyStatus(a, source, { kind, value: n, duration }, `${key}-linked`);
      a.statuses.find(s => s.key === `${source.id}:${key}-linked:${kind}`)!.shieldKey = shield.key;
    }
    this.visuals.push({ kind: 'shield', x: a.x, y: a.y - 110, amount: value });
  }
  applyStatus(a: Actor, source: Actor, effect: Effect, key: string) {
    if (a.hp <= 0) return;
    let duration = effect.duration;
    if (['stun', 'freeze', 'taunt', 'silence', 'knockback', 'knockup'].includes(effect.kind)) duration *= a.boss?.ccMultiplier ?? 1;
    const statusKey = `${source.id}:${key}:${effect.kind}`;
    const value = effect.value + (effect.atkScale || 0) * attack(source) + (effect.hpScale || 0) * source.stats.hp;
    const existing = a.statuses.find(s => s.key === statusKey);
    if (existing) { existing.remaining = duration; existing.duration = duration; if (Math.abs(value) >= Math.abs(existing.value)) { existing.value = value; existing.snapshotAtk = attack(source); } }
    else a.statuses.push({ ...effect, value, duration, source: source.id, key: statusKey, remaining: duration, tick: 0, snapshotAtk: attack(source), damageType: source.hero.damageType });
    if (['stun', 'freeze', 'knockback', 'knockup'].includes(effect.kind)) { this.interrupt(a); this.pose(a, effect.kind.startsWith('knock') ? 'knockback' : 'stun'); }
    if (effect.kind === 'knockback') {
      const oldX = a.x, oldY = a.y;
      const d = distance(a, source) || 1;
      a.x = clamp(a.x + (a.x - source.x) / d * effect.value * BATTLE.rangeUnit, 85, 1835);
      a.y = clamp(a.y + (a.y - source.y) / d * effect.value * BATTLE.rangeUnit, BATTLE.floorMin, BATTLE.floorMax);
      this.visuals.push({ kind: 'knockback', x: oldX, y: oldY - 90, toX: a.x, toY: a.y - 90 });
    }
  }
  private heal(a: Actor, value: number) {
    if (a.hp <= 0 || value <= 0) return;
    const healed = Math.min(value, a.stats.hp - a.hp);
    a.hp += healed;
    if (healed > 0) this.visuals.push({ kind: 'heal', x: a.x, y: a.y - 150, amount: healed });
  }
  private damage(source: Actor, target: Actor, raw: number, type: 'physical' | 'magic', critAllowed: boolean, basic: boolean, extraPen = 0, reflected = false): number {
    if (target.hp <= 0) return 0;
    const resist = type === 'physical' ? (target.stats.armor + modifier(target, 'armor')) * (1 + modifier(target, 'armorPct')) : target.stats.mr + modifier(target, 'mr');
    const pen = clamp((type === 'physical' ? source.stats.armorPen : source.stats.magicPen) + extraPen, 0, 1);
    const crit = critAllowed && this.random() < clamp(source.stats.crit + modifier(source, 'crit'), 0, 1);
    const preMitigation = raw * (reflected ? 1 : Math.max(.1, 1 + modifier(source, 'damageBonus') - modifier(source, 'damageDown'))) * (crit ? source.stats.critDamage : 1);
    let amount = Math.max(1, preMitigation * resistanceMultiplier(resist * (1 - pen)) * (1 - clamp(modifier(target, 'reduction'), 0, .9)));
    const total = amount, reflect = basic ? modifier(target, 'reflect') : 0;
    let shieldHit = false;
    for (const shield of target.statuses.filter(s => s.kind === 'shield').sort((a, b) => a.remaining - b.remaining)) {
      shieldHit = true;
      const absorbed = Math.min(shield.value, amount); shield.value -= absorbed; amount -= absorbed;
      if (amount <= 0) break;
    }
    const dealt = Math.min(target.hp, amount);
    target.hp = Math.max(0, target.hp - amount); source.damageDone += total;
    this.cleanShields(target);
    if (shieldHit) this.visuals.push({kind:'shieldRipple',x:target.x,y:target.y-105});
    this.visuals.push({ kind: amount <= 0 ? 'absorb' : type, x: target.x, y: target.y - (target.boss ? 300 : 165), amount: total, crit });
    const mark = target.statuses.find(s => s.kind === 'mark' && s.source === source.id);
    if (mark && !reflected) this.heal(source, total * mark.value);
    if (target.hp <= 0) { this.interrupt(target); target.statuses = []; this.pose(target, 'death'); }
    else if (!target.action && !hardCC(target)) this.pose(target, 'hit');
    if (basic && reflect > 0 && source.hp > 0 && !reflected) this.damage(target, source, preMitigation * reflect, 'physical', false, false, 0, true);
    return dealt;
  }
  private cleanShields(a: Actor) {
    a.statuses = a.statuses.filter(s => s.remaining > 0 && (s.kind !== 'shield' || s.value > 0));
    const shieldKeys = new Set(a.statuses.filter(s => s.kind === 'shield').map(s => s.key));
    a.statuses = a.statuses.filter(s => !s.shieldKey || shieldKeys.has(s.shieldKey));
  }
  private updateStatuses(a: Actor, dt: number) {
    for (const s of [...a.statuses]) {
      const elapsed = Math.min(dt, s.remaining); s.remaining -= dt;
      if (s.kind === 'burn') {
        s.tick += elapsed;
        while (s.tick >= 1 - 1e-8 && a.hp > 0) { s.tick -= 1; const source = this.get(s.source); if (source) this.damage(source, a, s.value * (s.snapshotAtk || attack(source)), s.damageType || source.hero.damageType, false, false); }
      }
    }
    this.cleanShields(a);
  }
  private enrage(a: Actor) {
    if (!a.boss || a.enraged || hpRatio(a) > .5 || a.hp <= 0) return;
    a.enraged = true;
    this.visuals.push({ kind: 'enrage', x: a.x, y: a.y - 160, text: a.boss.enrage === 'stone' ? 'Thạch Giáp Phản Kích' : a.boss.enrage === 'fire' ? 'Xích Viêm Cuồng Nộ' : 'Long Nộ' });
    if (a.boss.enrage === 'stone') this.shield(a, a, a.stats.hp * .15, 8, 25, 0, .15, 'enrage');
    else if (a.boss.enrage === 'fire') { this.applyStatus(a, a, { kind: 'attackSpeed', value: .2, duration: Infinity }, 'enrage'); this.applyStatus(a, a, { kind: 'damageBonus', value: .15, duration: Infinity }, 'enrage'); }
    else { a.statuses = a.statuses.filter(s => !['stun', 'freeze', 'knockback', 'knockup'].includes(s.kind)); this.applyStatus(a, a, { kind: 'atk', value: .2, duration: Infinity }, 'enrage'); for (const key in a.cooldowns) a.cooldowns[key] *= .85; }
  }
  private cast(a: Actor, target: Actor, skill?: Skill) {
    const hits = Math.max(1, skill?.coefficients.length || 1);
    const impact = skill?.windup ?? interval(a) * .38;
    const duration = skill ? impact + (hits - 1) * .13 + .3 : interval(a) * .85;
    const token = ++a.token;
    const targetIds = skill ? chooseTargets(a, this.actors, skill).map(t => t.id) : undefined;
    a.action = { token, skill, targetId: target.id, center: { x: target.x, y: target.y }, elapsed: 0, duration, impact, hits, resolved: [], targetIds };
    a.facing = target.side !== a.side ? (target.x >= a.x ? 1 : -1) : a.facing;
    const name: AnimationName = skill?.dive ? 'jump' : skill ? (skill.slot === 1 ? 'skill1' : 'skill2') : 'basicAttack';
    a.pose = name;
    if (skill) {
      a.mana -= a.boss ? 0 : skill.mana; a.cooldowns[skill.id] = skill.cooldown;
      if (skill.castUntargetable) this.applyStatus(a, a, { kind: 'untargetable', value: 1, duration: skill.castUntargetable }, skill.id);
      this.visuals.push({ kind: 'cast', x: a.x, y: a.y - 220, text: skill.name, skillId: skill.id, heroId: a.hero.id, actorId: a.id, phase: 'cast', duration: impact });
      if (a.boss) {
        const targets = skill.shape === 'rain' ? enemiesOf(a, this.actors) : [target];
        if (skill.shape === 'rain') {
          a.action.targetIds = skill.coefficients.map(() => targets[Math.floor(this.random() * targets.length)].id);
          a.action.points = a.action.targetIds.map(id => { const t = this.get(id)!; return { x: t.x, y: t.y }; });
        }
        for (const t of skill.shape === 'rain' ? a.action.targetIds!.map(id => this.get(id)!) : targets) this.visuals.push({ kind: 'telegraph', x: skill.shape === 'line' || skill.shape === 'cone' ? a.x : t.x, y: skill.shape === 'line' || skill.shape === 'cone' ? a.y : t.y, toX: t.x, toY: t.y, duration: impact, shape: skill.shape, radius: skill.radius * BATTLE.rangeUnit });
      }
    } else a.attackCooldown = interval(a);
    this.commands.push({ actorId: a.id, name, token, duration, impact, hits, projectile: skill ? Boolean(skill.projectile) : a.hero.range > 1 });
  }
  // The renderer calls this ONLY from named animation events (Spine or the fallback rig).
  animationEvent(actorId: string, token: number, event: AnimationEvent, hitIndex: number) {
    const a = this.get(actorId), action = a?.action;
    if (!a || a.hp <= 0 || !action || action.token !== token || hardCC(a) || action.resolved.includes(hitIndex) || this.outcome) return;
    if (event === 'vfx_burst') { this.visuals.push({ kind: action.skill?.vfx || 'slash', x: a.x, y: a.y - 100 }); return; }
    if (!['basic_hit', 'skill_hit', 'projectile_spawn'].includes(event)) return;
    action.resolved.push(hitIndex);
    const skill = action.skill;
    const anchor = HERO_VISUAL_PROFILES[a.hero.id]?.weaponAnchor || [55,-130];
    this.visuals.push({kind:'release',x:a.x+anchor[0]*a.facing,y:a.y+anchor[1],skillId:skill?.id,heroId:a.hero.id,actorId:a.id,phase:'release'});
    let target = this.get(action.targetId);
    if (skill?.dive && hitIndex === 0 && valid(target)) { a.x = clamp(target.x - a.facing * 85, 85, 1835); a.y = clamp(target.y + 38, BATTLE.floorMin, BATTLE.floorMax); }
    if (!skill) {
      if (!valid(target)) return;
      if (a.hero.range > 1) this.launch(a, target, 1, undefined, true, true);
      else if (distance(a, target) <= a.hero.range * BATTLE.rangeUnit + BATTLE.hitTolerance) this.impact(a, target, 1, undefined, true, true);
      return;
    }
    const friendly = ['self', 'lowestAlly', 'twoLowest', 'allAllies', 'topAttack', 'debuffAlly'].includes(skill.target);
    if (friendly) {
      if (hitIndex === 0) for (const t of (action.targetIds || []).map(id => this.get(id)).filter((t): t is Actor => Boolean(t && t.hp > 0))) this.support(a, t, skill);
    } else {
      const coefficient = skill.coefficients[hitIndex] ?? skill.coefficients[0] ?? 0;
      let targets: Actor[] = [];
      if (skill.shape === 'single') targets = valid(target) ? [target] : [];
      else if (skill.shape === 'chain') {
        if (skill.target === 'backline') { const ids = action.targetIds || []; target = this.get(ids[hitIndex % ids.length]); }
        else {
          const previous = hitIndex > 0 ? this.get(action.targetIds?.[hitIndex - 1] || '') : undefined;
          const used = (action.targetIds || []).slice(0, hitIndex);
          target = hitIndex === 0 ? target : nearest(previous || a, enemiesOf(a, this.actors).filter(t => !used.includes(t.id) && distance(previous || a, t) <= skill.radius * BATTLE.rangeUnit))[0];
          if (target) (action.targetIds ??= [])[hitIndex] = target.id;
        }
        targets = valid(target) ? [target] : [];
      } else if (skill.shape === 'rain') {
        if (a.boss && action.points?.[hitIndex]) targets = areaTargets(a, action.points[hitIndex], this.actors, skill);
        else { const candidates = areaTargets(a, action.center, this.actors, skill); if (candidates.length) targets = [candidates[Math.floor(this.random() * candidates.length)]]; }
      } else targets = areaTargets(a, a.boss ? action.center : target || action.center, this.actors, skill);
      for (const t of targets) {
        const c = skill.splashCoefficient !== undefined && t.id !== action.targetId ? skill.splashCoefficient : coefficient;
        const previous = skill.shape === 'chain' && hitIndex > 0 ? this.get(action.targetIds?.[hitIndex-1] || '') : undefined;
        if (skill.shape === 'chain') this.visuals.push({kind:'chain',x:(previous||a).x,y:(previous||a).y-115,toX:t.x,toY:t.y-115,skillId:skill.id,heroId:a.hero.id});
        if (skill.projectile) this.launch(a, t, c, skill, false, hitIndex === action.hits - 1, previous);
        else this.impact(a, t, c, skill, false, hitIndex === action.hits - 1);
      }
    }
    if (hitIndex === action.hits - 1 && a.hp > 0) {
      for (const effect of skill.selfEffects || []) {
        if (effect.kind === 'shield') this.shield(a, a, effect.value + (effect.hpScale || 0) * a.stats.hp + (effect.atkScale || 0) * attack(a), effect.duration, 0, 0, 0, skill.id);
        else this.applyStatus(a, a, effect, skill.id);
      }
      if (skill.healSelfHp) this.heal(a, a.stats.hp * skill.healSelfHp);
    }
  }
  private support(a: Actor, target: Actor, skill: Skill) {
    const wasDebuffed = target.statuses.some(isDebuff);
    if (skill.cleanse) { target.statuses = target.statuses.filter(s => !isDebuff(s)); if (!wasDebuffed && skill.cleanReduction) this.applyStatus(target, a, { kind: 'reduction', value: skill.cleanReduction, duration: 4 }, skill.id); }
    this.heal(target, (skill.healAtk || 0) * attack(a) + (skill.healTargetHp || 0) * target.stats.hp + (skill.healMissingHp || 0) * (target.stats.hp - target.hp));
    if (skill.shieldDuration) this.shield(target, a, (skill.shieldAtk || 0) * attack(a) + (skill.shieldHp || 0) * a.stats.hp, skill.shieldDuration, skill.shieldArmor, skill.shieldMr, skill.shieldReflect, skill.id);
    for (const effect of skill.effects || []) this.applyStatus(target, a, effect, skill.id);
    if (skill.tauntCount) for (const enemy of nearest(a, enemiesOf(a, this.actors)).slice(0, skill.tauntCount)) this.applyStatus(enemy, a, { kind: 'taunt', value: 1, duration: skill.tauntDuration! }, skill.id);
    this.visuals.push({ kind: skill.vfx, x: target.x, y: target.y - 90, skillId:skill.id,heroId:a.hero.id,actorId:target.id,phase:'impact' });
  }
  private impact(a: Actor, t: Actor, coefficient: number, skill: Skill | undefined, basic: boolean, lastHit: boolean) {
    if (!valid(t) || a.hp <= 0) return;
    if (basic) {
      this.damage(a, t, attack(a) * coefficient, a.hero.damageType, true, true);
      if (!a.boss && a.hp > 0) a.mana = Math.min(10, a.mana + 1);
    } else if (skill) {
      const wasSlow = t.statuses.some(s => s.kind === 'attackSpeed' && s.value < 0);
      const execute = skill.executeThreshold && hpRatio(t) < skill.executeThreshold ? skill.executeMultiplier || 1 : 1;
      if (coefficient > 0) this.damage(a, t, attack(a) * coefficient * execute, skill.damageType, skill.crit, false, skill.armorPen);
      if (t.hp > 0) {
        for (const effect of skill.effects || []) this.applyStatus(t, a, effect, skill.id);
        if (skill.freezeIfSlow) this.applyStatus(t, a, wasSlow ? { kind: 'freeze', value: 1, duration: 2 } : { kind: 'attackSpeed', value: -.3, duration: 4 }, skill.id);
        if (lastHit && skill.lastHitEffect) this.applyStatus(t, a, skill.lastHitEffect, skill.id);
      } else if (skill.resetOnKill) a.cooldowns[skill.resetOnKill] = 0;
    }
    this.visuals.push({ kind: skill?.vfx || (a.hero.damageType === 'magic' ? 'magic' : 'slash'), x: t.x, y: t.y - 95, toX: a.x, toY: a.y - 100,skillId:skill?.id,heroId:a.hero.id,actorId:t.id,phase:'impact' });
  }
  private launch(a: Actor, target: Actor, coefficient: number, skill: Skill | undefined, basic: boolean, lastHit: boolean, previous?: Actor) {
    let p = this.projectiles.find(p => !p.active);
    const anchor = HERO_VISUAL_PROFILES[a.hero.id]?.weaponAnchor || [50,-100];
    const data: Projectile = { active: true, sourceId: a.id, targetId: target.id, x: previous?.x ?? a.x+anchor[0]*a.facing, y: previous ? previous.y-100 : a.y+anchor[1], coefficient, skill, basic, lastHit, vfx: skill?.vfx || (a.hero.damageType === 'magic' ? 'magic' : 'arrow'),heroId:a.hero.id,rotation:Math.atan2(target.y-a.y,target.x-a.x) };
    if (p) Object.assign(p, data); else this.projectiles.push(data);
    this.visuals.push({ kind: 'projectile', x: a.x, y: a.y - 100 });
  }
  step(dt: number) {
    if (this.outcome) return;
    this.elapsed += dt;
    for (const a of this.actors) {
      if (a.hp <= 0) continue;
      this.updateStatuses(a, dt); if (a.hp <= 0) continue;
      this.enrage(a);
      for (const id in a.cooldowns) a.cooldowns[id] = Math.max(0, a.cooldowns[id] - dt);
      a.attackCooldown = Math.max(0, a.attackCooldown - dt); a.aiCooldown -= dt;
      if (hardCC(a)) { this.pose(a, has(a, 'knockup') || has(a, 'knockback') ? 'knockback' : 'stun'); continue; }
      if (a.action) { a.action.elapsed += dt; if (a.action.elapsed >= a.action.duration + .05) { a.action = undefined; this.pose(a, 'idle'); } else continue; }
      let target = chooseTargets(a, this.actors)[0];
      let pendingReach: number | undefined;
      if (this.mode === 'manual' && a.side === 'player') {
        const pending = a.skills.find(s => s.id === this.manualQueue.get(a.id));
        if (pending) {
          const skillTarget = chooseTargets(a, this.actors, pending)[0];
          // AI predicates deliberately do not participate in player requests.
          if (resourceState(a, pending) === 'ready' && skillTarget) {
            if (withinSkillRange(a, pending, skillTarget)) {
              this.manualQueue.delete(a.id);
              this.cast(a, skillTarget, pending);
              continue;
            }
            target = skillTarget;
            pendingReach = skillReach(a, pending, skillTarget);
          }
        }
      }
      a.targetId = target?.id;
      if (!target) { this.pose(a, 'idle'); continue; }
      if (a.aiCooldown <= 0) {
        a.aiCooldown = BATTLE.aiCadence;
        if (!has(a, 'silence') && (a.side === 'enemy' || this.mode === 'auto')) {
          for (const skill of [...a.skills].sort((x, y) => y.aiPriority - x.aiPriority || y.slot - x.slot)) {
            if ((a.cooldowns[skill.id] || 0) > 0 || (!a.boss && a.mana < skill.mana)) continue;
            const skillTarget = chooseTargets(a, this.actors, skill)[0];
            if (!skillTarget || !conditionMet(a, skillTarget, this.actors, skill)) continue;
            const offensive = skillTarget.side !== a.side;
            const reach = skill.shape === 'cone' || skill.shape === 'selfCircle' ? skill.radius : a.hero.range;
            if (offensive && !a.boss && !skill.dive && !skill.ignoreTaunt && distance(a, skillTarget) > reach * BATTLE.rangeUnit + BATTLE.hitTolerance) continue;
            this.cast(a, skillTarget, skill); break;
          }
        }
        if (a.action) continue;
      }
      const dist = distance(a, target), range = pendingReach ?? a.hero.range * BATTLE.rangeUnit;
      a.facing = target.x >= a.x ? 1 : -1;
      if (dist > range) {
        a.moveMultiplier = Math.max(.1, a.hero.moveSpeed * (1 + modifier(a, 'moveSpeed')));
        const step = Math.min(dist - range + .1, BATTLE.moveSpeed * a.moveMultiplier * dt);
        a.x += (target.x - a.x) / dist * step; a.y += (target.y - a.y) / dist * step; this.pose(a, 'move');
      } else { a.moveMultiplier = 0; if (a.attackCooldown <= 0) this.cast(a, target); else this.pose(a, 'idle'); }
    }
    // Gentle depth separation without collision walls or body blocking.
    const alive = this.actors.filter(a => a.hp > 0);
    for (let i = 0; i < alive.length; i++) for (let j = i + 1; j < alive.length; j++) {
      const a = alive[i], b = alive[j], d = distance(a, b);
      if (d < BATTLE.separation) { const shift = (BATTLE.separation - d) * Math.min(.15, dt * 2); a.y = clamp(a.y - shift, BATTLE.floorMin, BATTLE.floorMax); b.y = clamp(b.y + shift, BATTLE.floorMin, BATTLE.floorMax); }
    }
    for (const p of this.projectiles) {
      if (!p.active) continue;
      const a = this.get(p.sourceId), target = this.get(p.targetId);
      if (!a || a.hp <= 0 || !valid(target)) { p.active = false; continue; }
      const point = { x: target.x, y: target.y - 100 }, dist = distance(p, point), step = BATTLE.projectileSpeed * dt;
      p.rotation = Math.atan2(point.y-p.y,point.x-p.x);
      if (dist <= step) { p.active = false; this.impact(a, target, p.coefficient, p.skill, p.basic, p.lastHit); }
      else { p.x += (point.x - p.x) / dist * step; p.y += (point.y - p.y) / dist * step; }
    }
    if (!this.actors.some(a => a.side === 'player' && a.hp > 0)) this.outcome = 'defeat';
    else if (!this.actors.some(a => a.side === 'enemy' && a.hp > 0)) this.outcome = 'victory';
    if (this.outcome) { for (const p of this.projectiles) p.active = false; for (const a of this.actors) if (a.hp > 0) { this.interrupt(a); this.pose(a, 'victory'); } }
  }
  destroy() { this.manualQueue.clear(); this.commands.length = 0; this.visuals.length = 0; this.projectiles.length = 0; this.actors.length = 0; }
}
