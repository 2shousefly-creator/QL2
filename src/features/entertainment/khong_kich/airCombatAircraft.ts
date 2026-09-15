import { createPlayerStatus, playerSkillLocked, tickPlayerStatus } from "./airCombatStatus";
import { AIRCRAFT_CONFIGS, AIR_COMBAT_LIMITS, SKILL_CONFIGS } from "./airCombatConfig";
import { applyCoreStatEffects, applyFireRateLock, hasCore, skillsLocked } from "./airCombatCoreEffects";
import type { AircraftCombatState, AircraftId, EffectiveAircraftStats, LevelUpResult, SkillCastResult, SkillId, WeaponModifiers } from "./airCombatTypes";
const DEFAULT_WEAPON: WeaponModifiers = {
    penetration: 0, penetrationDamageMultiplier: 0, splashDamageMultiplier: 0, chargedEvery: 0, chargedMultiplier: 1,
    projectileCount: 1, perProjectileMultiplier: 1, bounceCount: 0, bounceDamageMultiplier: 0, annihilatorEvery: 0, annihilatorMultiplier: 1,
};
export interface RuntimeSkillValues {
    cost: number;
    cooldown: number;
    duration: number;
    damageMultiplier: number;
    count: number;
    upkeepPerSecond: number;
    sideProjectileMultiplier: number;
    radiusMultiplier: number;
    damageTakenMultiplier: number;
    charge: number;
}
export function createAircraftCombatState(aircraftId: AircraftId): AircraftCombatState {
    const config = AIRCRAFT_CONFIGS[aircraftId];
    return { status: createPlayerStatus(), aircraftId, level: 1, combatXp: 0, currentHp: config.baseStats.maxHp, currentResource: config.baseStats.maxResource,
        modifiers: { criticalChanceFlat: 0, criticalDamageMultiplierFlat: 0, maxHpFlat: 0, armorFlat: 0, firepowerFlat: 0, fireRateFlat: 0, hpRegen: 0,
            cooldownReduction: 0, maxResourceFlat: 0, resourceRegenFlat: 0, weapon: { ...DEFAULT_WEAPON }, skillCores: {} },
        cooldowns: {}, selectedCores: [], activeEffects: {}, droneActive: false, basicShotsFired: 0, pendingMilestones: [],
        coreState: { acquisitions: [], nextAcquisitionId: 1, healingTotal: 0, time: 0, lastDamage: 0, lastMove: 0, lastKill: -Infinity, kills: 0, skillCasts: 0, killTimes: [], stacks: {}, timers: {}, shields: {},
            consumed: new Set(), criticalBudget: 1, criticalWindow: 0, droneCycle: 0, deferredCooldowns: {} },
    };
}
export function getEffectiveAircraftStats(state: AircraftCombatState, includeTemporary = true): EffectiveAircraftStats {
    const config = AIRCRAFT_CONFIGS[state.aircraftId], n = Math.min(29, Math.max(0, state.level - 1)), m = state.modifiers;
    const stats: EffectiveAircraftStats = {
        maxHp: config.baseStats.maxHp + config.growth.maxHp * n + m.maxHpFlat,
        armor: config.baseStats.armor + config.growth.armor * n + m.armorFlat,
        firepower: config.baseStats.firepower + config.growth.firepower * n + m.firepowerFlat,
        fireRate: config.baseStats.fireRate + config.growth.fireRate * n + m.fireRateFlat,
        criticalChance: config.baseStats.criticalChance + m.criticalChanceFlat,
        criticalDamageMultiplier: config.baseStats.criticalDamageMultiplier + m.criticalDamageMultiplierFlat,
        maxResource: config.baseStats.maxResource + config.growth.maxResource * n + m.maxResourceFlat,
        resourceRegen: config.baseStats.resourceRegen + config.growth.resourceRegen * n + m.resourceRegenFlat,
        cooldownReduction: m.cooldownReduction, hpRegen: config.hpRegen.base + config.hpRegen.growth * n + m.hpRegen, resourceKind: config.resourceKind,
        currentHp: state.currentHp, currentResource: state.currentResource, weapon: { ...m.weapon },
    };
    applyCoreStatEffects(state, stats, includeTemporary);
    const c = state.coreState;
    if (includeTemporary && (state.activeEffects.afterburner || 0) > 0)
        stats.fireRate *= hasCore(state, 23) ? 1.75 : 1.4;
    if (includeTemporary && (c.timers.hawkRage || 0) > c.time)
        stats.fireRate *= 1.3;
    if (includeTemporary && (c.timers.shieldArmor || 0) > c.time)
        stats.armor *= 1.5;
    if (includeTemporary && (state.activeEffects.sweeping_cannon || 0) > 0 && hasCore(state, 35))
        stats.armor *= 1.35;
    if (includeTemporary && (c.timers.acidArmor || 0) > c.time)
        stats.armor *= .7;
    if (includeTemporary) {
        const status = state.status;
        if (status.armorBrokenUntil > c.time) stats.armor *= .65;
        if (status.regenDisabledUntil > c.time) stats.hpRegen = 0;
        stats.resourceRegen *= Math.min(1, ...status.jams.filter(j => j.until > c.time).map(j => j.multiplier));
    }
    applyFireRateLock(state, stats);
    stats.fireRate = hasCore(state, 54) ? 1.2 : Math.min(AIR_COMBAT_LIMITS.maxFireRate, Math.max(.1, stats.fireRate));
    stats.criticalChance = Math.max(0, Math.min(1, stats.criticalChance));
    stats.criticalDamageMultiplier = Math.max(1.7, Math.min(10, stats.criticalDamageMultiplier));
    stats.cooldownReduction = Math.max(0, Math.min(.8, stats.cooldownReduction));
    stats.armor = Math.max(-80, stats.armor);
    stats.maxHp = Math.max(1, stats.maxHp);
    stats.firepower = Math.max(0, stats.firepower);
    stats.hpRegen = Math.max(0, stats.hpRegen);
    stats.currentHp = Math.min(state.currentHp, stats.maxHp);
    stats.currentResource = Math.min(state.currentResource, stats.maxResource);
    if (includeTemporary) c.stacks.effectiveMaxHp = stats.maxHp;
    return stats;
}
export function calculateDamage(rawDamage: number, targetArmor: number, additionalDamageTakenMultiplier = 1): number {
    return Math.max(0, rawDamage) * 100 / (100 + Math.max(-80, targetArmor)) * Math.max(0, additionalDamageTakenMultiplier);
}
export function applyDamageToAircraft(state: AircraftCombatState, rawDamage: number, multiplier = 1): number {
    const damage = Math.min(state.currentHp, calculateDamage(rawDamage, getEffectiveAircraftStats(state).armor, multiplier));
    state.currentHp = Math.max(0, state.currentHp - damage);
    return damage;
}
export function resolvePlayerDamage(rawDamage: number, targetArmor: number, stats: EffectiveAircraftStats, random: () => number) {
    const chance = Math.max(0, Math.min(1, stats.criticalChance));
    const critical = rawDamage > 0 && (chance >= 1 || (chance > 0 && random() < chance));
    const multiplier = critical ? Math.max(1.7, Math.min(10, stats.criticalDamageMultiplier)) : 1;
    return { actualDamage: calculateDamage(rawDamage * multiplier, targetArmor), critical, multiplier };
}
export function requiredCombatXp(level: number): number {
    if (level >= 30)
        return 0;
    const n = Math.max(0, level - 1);
    return Math.round(45 + 8 * n + .69 * n * n);
}
export function gainCombatXp(state: AircraftCombatState, amount: number): LevelUpResult {
    let remaining = Math.max(0, amount), levelsGained = 0, coreSelectionsDue = 0;
    while (remaining > 0 && state.level < 30) {
        const needed = requiredCombatXp(state.level) - state.combatXp;
        if (remaining < needed) {
            state.combatXp += remaining;
            break;
        }
        remaining -= needed;
        state.combatXp = 0;
        levelUpAircraft(state);
        levelsGained++;
        if (state.level % 3 === 0) {
            state.pendingMilestones.push(state.level);
            coreSelectionsDue++;
        }
    }
    if (state.level >= 30)
        state.combatXp = 0;
    return { levelsGained, coreSelectionsDue };
}
export function levelUpAircraft(state: AircraftCombatState): void {
    if (state.level >= 30)
        return;
    const before = getEffectiveAircraftStats(state);
    state.level++;
    const after = getEffectiveAircraftStats(state);
    state.currentHp = Math.min(after.maxHp, state.currentHp + Math.max(0, after.maxHp - before.maxHp));
    state.currentResource = Math.min(after.maxResource, state.currentResource + Math.max(0, after.maxResource - before.maxResource));
}
export function getSkillRuntimeValues(state: AircraftCombatState, skillId: SkillId): RuntimeSkillValues {
    const skill = SKILL_CONFIGS[skillId];
    const v: RuntimeSkillValues = { cost: skill.cost, cooldown: skill.cooldown, duration: skill.duration || 0, damageMultiplier: skill.damageMultiplier || 0,
        count: 0, upkeepPerSecond: 0, sideProjectileMultiplier: .15, radiusMultiplier: 1, damageTakenMultiplier: 1, charge: 0 };
    switch (skillId) {
        case "decoy":
            v.count = hasCore(state, 19) ? 4 : 3;
            v.duration = hasCore(state, 19) ? 2.5 : 1.5;
            if (hasCore(state, 20))
                v.cooldown = 9;
            break;
        case "afterburner":
            if (hasCore(state, 22))
                v.duration = 10;
            break;
        case "missile_swarm":
            v.count = hasCore(state, 25) ? 18 : 12;
            if (hasCore(state, 26))
                v.damageMultiplier += .5;
            break;
        case "armor_shield":
            v.damageTakenMultiplier = hasCore(state, 28) ? .1 : .35;
            if (hasCore(state, 29))
                v.duration = 9;
            break;
        case "heavy_bomb":
            if (hasCore(state, 31))
                v.cooldown = 13;
            if (hasCore(state, 32))
                v.damageMultiplier = 19;
            break;
        case "sweeping_cannon":
            v.count = hasCore(state, 36) ? 7 : 5;
            if (hasCore(state, 34))
                v.damageMultiplier = .8;
            break;
        case "invisibility":
            if (hasCore(state, 37))
                v.duration = 3.5;
            if (hasCore(state, 39))
                v.cost = 10;
            break;
        case "focus_laser":
            v.charge = hasCore(state, 41) ? .5 : 2;
            if (hasCore(state, 40))
                v.duration = 3;
            if (hasCore(state, 42))
                v.cost = 20;
            break;
        case "escort_drone":
            v.upkeepPerSecond = hasCore(state, 43) ? 3 : 4;
            v.damageMultiplier = hasCore(state, 45) ? .7 : .55;
            break;
    }
    return v;
}
export function canBorrowSkill(state: AircraftCombatState, skillId: SkillId): boolean {
    const c=state.coreState;
    return hasCore(state,113) && (state.cooldowns[skillId]??0)>0 && (c.timers.futureDebt??0)<=c.time && !c.stacks.borrowPending;
}
export function finishBorrowedDuration(state:AircraftCombatState,skillId:SkillId):void {
    const c=state.coreState;
    if(!c.stacks[`debt:${skillId}`])return;
    state.cooldowns[skillId]=c.stacks[`debtNormal:${skillId}`]??0;
    delete c.stacks[`debtNormal:${skillId}`];beginDebt(state,skillId);
}
function beginDebt(state: AircraftCombatState, skillId: SkillId): void {
    const c=state.coreState;
    state.cooldowns[skillId]=(state.cooldowns[skillId]??0)+SKILL_CONFIGS[skillId].cooldown*.5;
    c.timers.futureDebt=c.time+18;delete c.stacks.borrowPending;delete c.stacks[`debt:${skillId}`];
}
export function endAircraftSkill(state: AircraftCombatState, skillId: SkillId): void {
    if (skillId === "invisibility") delete state.coreState.emergencyRepair;
    const wasActive = skillId === "escort_drone" ? state.droneActive : (state.activeEffects[skillId] || 0) > 0;
    if (skillId === "escort_drone") {
        state.droneActive = false;
        delete state.coreState.timers.hawkRage;
    }
    delete state.activeEffects[skillId];
    if (state.activeEffectDurations) delete state.activeEffectDurations[skillId];
    if (!wasActive)
        return;
    if (skillId === "sweeping_cannon" || skillId === "escort_drone") {
        state.cooldowns[skillId] = getSkillRuntimeValues(state, skillId).cooldown * (1 - getEffectiveAircraftStats(state).cooldownReduction) * (state.coreState.deferredCooldowns[skillId] ?? 1);
        delete state.coreState.deferredCooldowns[skillId];
        if(state.coreState.stacks[`debt:${skillId}`])beginDebt(state,skillId);
    }
    if(skillId!=="sweeping_cannon"&&skillId!=="escort_drone")finishBorrowedDuration(state,skillId);
    if (skillId === "armor_shield" && hasCore(state, 30) && !skillsLocked(state))
        state.coreState.timers.shieldArmor = state.coreState.time + 5;
}
export function castSkill(state: AircraftCombatState, skillId: SkillId): SkillCastResult {
    const skill = SKILL_CONFIGS[skillId];
    if (!skill || skill.aircraftId !== state.aircraftId || (skillsLocked(state) || playerSkillLocked(state)))
        return { cast: false, reason: "invalid", resourceSpent: 0 };
    if ((skillId === "escort_drone" && state.droneActive) || (skillId === "sweeping_cannon" && (state.activeEffects.sweeping_cannon || 0) > 0)) {
        endAircraftSkill(state, skillId);
        return { cast: true, resourceSpent: 0, toggledOff: true };
    }
    if(state.coreState.stacks[`debt:${skillId}`])return {cast:false,reason:"cooldown",resourceSpent:0};
    const borrowed=canBorrowSkill(state,skillId);
    if ((state.cooldowns[skillId] || 0) > 0 && !borrowed)
        return { cast: false, reason: "cooldown", resourceSpent: 0 };
    const v = getSkillRuntimeValues(state, skillId);
    const free = hasCore(state, 84) && (state.coreState.skillCasts + 1) % 4 === 0;
    const cost = skillId === "escort_drone" ? 0 : free ? 0 : v.cost;
    if (state.currentResource + Number.EPSILON < (skillId === "escort_drone" ? 5 : cost))
        return { cast: false, reason: "resource", resourceSpent: 0 };
    state.currentResource = Math.max(0, state.currentResource - cost);
    state.coreState.skillCasts++;
    if(borrowed){state.coreState.stacks.borrowPending=1;state.coreState.stacks[`debt:${skillId}`]=1;}
    const cooldown = v.cooldown * (1 - getEffectiveAircraftStats(state).cooldownReduction) * (free ? 1.2 : 1);
    if (skillId === "sweeping_cannon" || skillId === "escort_drone")
        state.coreState.deferredCooldowns[skillId] = free ? 1.2 : 1;
    else
        state.cooldowns[skillId] = cooldown;
    if(borrowed && skillId!=="sweeping_cannon" && skillId!=="escort_drone"){
        if(v.duration>0){state.coreState.stacks[`debtNormal:${skillId}`]=cooldown;state.cooldowns[skillId]=0;}
        else beginDebt(state,skillId);
    }
    if (v.duration > 0 && skillId !== "decoy") {
        state.activeEffects[skillId] = v.duration + (skillId === "focus_laser" ? v.charge : 0);
        (state.activeEffectDurations ??= {})[skillId] = state.activeEffects[skillId];
        if (skillId === "invisibility") {
            delete state.coreState.emergencyRepair;
            if (hasCore(state, 38)) state.coreState.emergencyRepair = {
                remaining: Math.max(0, getEffectiveAircraftStats(state).maxHp - state.currentHp) * .18,
                durationRemaining: v.duration,
            };
        }
    }
    if (skillId === "escort_drone") {
        state.droneActive = true;
        state.coreState.droneCycle = 0;
    }
    return { cast: true, resourceSpent: cost };
}
export function healAircraft(state: AircraftCombatState, amount: number): number {
    const maxHp = getEffectiveAircraftStats(state).maxHp;
    const healing = Math.max(0, amount), effective = Math.min(healing, Math.max(0, maxHp - state.currentHp));
    state.currentHp = Math.min(maxHp, state.currentHp + effective);
    state.coreState.healingTotal += effective;
    if (hasCore(state, 104) && healing > effective) {
        const current = state.coreState.shields.overheal?.amount || 0;
        state.coreState.shields.overheal = { amount: Math.min(maxHp * .12, current + healing - effective), until: Infinity };
    }
    return effective;
}
export function tickAircraftState(state: AircraftCombatState, deltaSeconds: number, gameplayRunning: boolean,
    onHealing?: (effective: number, source: "core" | "skill_core") => void): void {
    if (!gameplayRunning || deltaSeconds <= 0)
        return;
    const dt = deltaSeconds;
    for (const key of Object.keys(state.cooldowns) as SkillId[])
        state.cooldowns[key] = Math.max(0, (state.cooldowns[key] || 0) - dt);
    state.coreState.time += dt;
    tickPlayerStatus(state);
    const repair = state.coreState.emergencyRepair;
    if (repair) {
        const active = state.activeEffects.invisibility || 0;
        if (active <= 0 || state.currentHp <= 0 || repair.durationRemaining <= 0) {
            delete state.coreState.emergencyRepair;
        } else {
            // Settle the final active fraction before skill expiry clears this budget.
            const step = Math.min(dt, active, repair.durationRemaining);
            const planned = step >= repair.durationRemaining - 1e-9
                ? repair.remaining : repair.remaining * step / repair.durationRemaining;
            const effective = healAircraft(state, planned);
            repair.remaining = Math.max(0, repair.remaining - planned);
            repair.durationRemaining = Math.max(0, repair.durationRemaining - step);
            if (effective > 0) onHealing?.(effective, "skill_core");
        }
    }
    for (const key of Object.keys(state.activeEffects) as SkillId[]) {
        const next = (state.activeEffects[key] || 0) - dt;
        if (next <= 0)
            endAircraftSkill(state, key);
        else
            state.activeEffects[key] = next;
    }
    if (state.droneActive && hasCore(state, 44)) {
        state.coreState.droneCycle += dt;
        if (state.coreState.droneCycle >= 11)
            state.coreState.droneCycle -= 11;
        if (state.coreState.droneCycle >= 8)
            state.coreState.timers.hawkRage = state.coreState.time + (11 - state.coreState.droneCycle);
    }
    for (const [key, shield] of Object.entries(state.coreState.shields))
        if (shield.until <= state.coreState.time)
            delete state.coreState.shields[key];
    const stats = getEffectiveAircraftStats(state);
    const regenerated = healAircraft(state, stats.hpRegen * dt);
    if (regenerated > 0 && (hasCore(state, 5) || hasCore(state, 11) || hasCore(state, 17)))
        onHealing?.(regenerated, "core");
    const upkeep = state.droneActive ? getSkillRuntimeValues(state, "escort_drone").upkeepPerSecond : 0;
    state.currentResource = Math.max(0, Math.min(stats.maxResource, state.currentResource + (stats.resourceRegen - upkeep) * dt));
    if (state.droneActive && state.currentResource <= 0)
        endAircraftSkill(state, "escort_drone");
}
export function isPlayerInvisible(state: AircraftCombatState): boolean { return (state.activeEffects.invisibility || 0) > 0; }
export function canAcquirePlayerTarget(state: AircraftCombatState): boolean { return !isPlayerInvisible(state); }
export function shouldAutoFire(state: AircraftCombatState): boolean { return (state.activeEffects.focus_laser || 0) <= 0; }
export function classifySkillPress(durationMs: number, longPressMs = 400): "tap" | "hold" { return durationMs >= longPressMs ? "hold" : "tap"; }
export function shouldCastSkillPress(durationMs: number, holdActivated: boolean, cancelled: boolean, longPressMs = 400): boolean {
    return !cancelled && !holdActivated && classifySkillPress(durationMs, longPressMs) === "tap";
}
export function resolveBasicProjectileMultipliers(state: AircraftCombatState, _shotNumber: number): number[] {
    if ((state.activeEffects.sweeping_cannon || 0) > 0) {
        const v = getSkillRuntimeValues(state, "sweeping_cannon");
        return Array.from({ length: v.count }, () => v.damageMultiplier);
    }
    return [1];
}
