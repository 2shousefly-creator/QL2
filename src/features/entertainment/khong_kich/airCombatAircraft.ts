import { settleCoreCooldowns, coreCooldownReady, deferCoreCooldown } from "./airCombatCooldowns";
import { getHealingReceivedMultiplier, getRecoveryReceivedMultiplier } from "./airCombatRecovery";
import { resolveFireRate, resolveSkillCooldown } from "./airCombatStatResolvers";
import { EQUIPMENT_POWER as P } from "./airCombatEquipmentBalance";
import { skillRank, rankValues, isUltimate, ultimateCastDisabled, COMBAT_LEVEL_CAP, CORE_MILESTONES } from "./airCombatSkillRanks";
import { applyEquipmentStats, equipmentUntargetable } from "./airCombatEquipmentStats";
import { equipmentState, equipmentScale, equipmentEffect, equipmentMetric } from "./airCombatEquipmentState";
import { equipmentResourceSpent } from "./airCombatEquipmentRuntime";
import { applyExpansionStats, expansionState, expansionActive, expansionSkillCost, finishExpansionSkill, finishAbsorbShield, createAbsorbShield, observeExpansionResource } from "./airCombatExpansion";
import { recordCoreMetric } from "./airCombatTelemetry";
import { releaseState, overheated } from "./airCombatReleaseState";
import { SKILL_BASE_VALUES as B, SKILL_CORE_VALUES as V } from "./airCombatSkillCores";
import { createPlayerStatus, playerSkillLocked, tickPlayerStatus } from "./airCombatStatus";
import { AIRCRAFT_CONFIGS, SKILL_CONFIGS } from "./airCombatConfig";
import { applyCoreStatEffects, applyFireRateLock, hasCore } from "./airCombatCoreEffects";
import type { AircraftCombatState, AircraftId, EffectiveAircraftStats, LevelUpResult, SkillCastResult, SkillId, WeaponModifiers } from "./airCombatTypes";
const isAstraSkill=(id:SkillId)=>id==="orbit_reversal"||id==="stellar_lance"||id==="starfall";
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
export function createAircraftCombatState(aircraftId: AircraftId, fractureResolve = false): AircraftCombatState {
    const config = AIRCRAFT_CONFIGS[aircraftId];
    return { status: createPlayerStatus(fractureResolve), aircraftId, level: 1, combatXp: 0, skillRanks: {}, skillPoints: 1, skillUpAt: {}, currentHp: config.baseStats.maxHp, currentResource: config.baseStats.maxResource,
        modifiers: { criticalChanceFlat: 0, criticalDamageMultiplierFlat: 0, maxHpFlat: 0, armorFlat: 0, firepowerFlat: 0, bonusFireRatePct: 0, hpRegen: 0,
            skillHaste: 0, maxResourceFlat: 0, resourceRegenFlat: 0, weapon: { ...DEFAULT_WEAPON } },
        cooldowns: {}, selectedCores: [], activeEffects: {}, droneActive: false, basicShotsFired: 0, pendingMilestones: [],
        coreState: { syncedMaxHp: config.baseStats.maxHp, acquisitions: [], nextAcquisitionId: 1, healingTotal: 0, telemetry: {}, time: 0, lastDamage: 0, lastMove: 0, lastKill: -Infinity, kills: 0, skillCasts: 0, killTimes: [], stacks: {}, timers: {}, shields: {},
            encounteredCoreIds: new Set(), skillCooldownDurations: {}, consumed: new Set(), criticalBudget: .75, criticalWindow: 0, deferredCooldowns: {} },
    };
}
export function getEffectiveAircraftStats(state: AircraftCombatState, includeTemporary = true, omittedEquipmentEffect?: number, omitHawkRage = false): EffectiveAircraftStats {
    const config = AIRCRAFT_CONFIGS[state.aircraftId], n = Math.min(17, Math.max(0, state.level - 1)), m = state.modifiers;
    const stats: EffectiveAircraftStats = {
        maxHp: config.baseStats.maxHp + config.growth.maxHp * n + m.maxHpFlat,
        armor: config.baseStats.armor + config.growth.armor * n + m.armorFlat,
        firepower: config.baseStats.firepower + config.growth.firepower * n + m.firepowerFlat,
        fireRate: config.baseStats.fireRate,
        baseFireRate: config.baseStats.fireRate, fireRateRatio: config.fireRateRatio, fireRateGrowthPct: config.fireRateGrowthPct,
        bonusFireRatePct: n * config.fireRateGrowthPct + m.bonusFireRatePct, totalFireRateMultiplier: 1,
        criticalChance: config.baseStats.criticalChance + m.criticalChanceFlat,
        criticalDamageMultiplier: config.baseStats.criticalDamageMultiplier + m.criticalDamageMultiplierFlat,
        maxResource: config.baseStats.maxResource + config.growth.maxResource * n + m.maxResourceFlat,
        resourceRegen: config.baseStats.resourceRegen + config.growth.resourceRegen * n + m.resourceRegenFlat,
        skillHaste: m.skillHaste, hpRegen: config.hpRegen.base + config.hpRegen.growth * n + m.hpRegen, resourceKind: config.resourceKind,
        bonusResourceRegenPct: 0, permanentResourceRegenPct: 0, permanentHpRegenBonus: m.hpRegen,
        totalResourceRegenMultiplier: 1, totalHpRegenMultiplier: 1,
        currentHp: state.currentHp, currentResource: state.currentResource, weapon: { ...m.weapon },
    };
    applyCoreStatEffects(state, stats, includeTemporary);
    const c = state.coreState;
    if (includeTemporary && (state.activeEffects.afterburner || 0) > 0)
        stats.bonusFireRatePct += skillRank(state, "afterburner") >= 3 ? B.upgradedAfterburnerRate : skillRank(state, "afterburner") === 2 ? B.rankTwoAfterburnerRate : B.afterburnerRate;
    if (includeTemporary && !omitHawkRage && (c.timers.hawkRage || 0) > c.time)
        stats.bonusFireRatePct += 1.05;
    if (includeTemporary && (c.timers.shieldArmor || 0) > c.time)
        stats.armor *= 1.6;
    if (includeTemporary && (state.activeEffects.sweeping_cannon || 0) > 0 && (skillRank(state, "sweeping_cannon") >= 2))
        stats.armor *= 1.4;
    if (includeTemporary && (c.timers.acidArmor || 0) > c.time)
        stats.armor *= .7;
    if (includeTemporary && hasCore(state, 222)) {
        if (releaseState(state).mode === "small") { stats.skillHaste += 33; stats.bonusResourceRegenPct += .4; }
        if (releaseState(state).mode === "giant") { stats.maxHp *= 1.3; stats.firepower *= 1.3; }
    }
    applyExpansionStats(state, stats, includeTemporary);
    applyEquipmentStats(state, stats, includeTemporary, omittedEquipmentEffect);
    // Snapshot live bonuses above the natural aircraft baseline before either conversion.
    // Temporary recovery multipliers contribute to the input without feeding conversion back.
    if (hasCore(state, 208)) {
        const naturalHp = config.hpRegen.base + config.hpRegen.growth * n;
        const naturalResource = config.baseStats.resourceRegen + config.growth.resourceRegen * n;
        const hp = Math.max(0, stats.hpRegen * stats.totalHpRegenMultiplier - naturalHp);
        const resource = Math.max(0, stats.resourceRegen * (1 + stats.bonusResourceRegenPct) * stats.totalResourceRegenMultiplier - naturalResource);
        stats.dualHpBonus = resource * .4;
        stats.dualResourceBonus = hp * .4;
        stats.hpRegen += stats.dualHpBonus;
    }
    stats.resourceRegen = (stats.resourceRegen * (1 + stats.bonusResourceRegenPct) + (stats.dualResourceBonus ?? 0)) * stats.totalResourceRegenMultiplier;
    stats.hpRegen *= stats.totalHpRegenMultiplier;
    if (includeTemporary) {
        const status = state.status;
        if (status.armorBrokenUntil > c.time) stats.armor *= .65;
        if (status.regenDisabledUntil > c.time) stats.hpRegen = 0;
        stats.resourceRegen *= Math.min(1, ...status.jams.filter(j => j.until > c.time).map(j => j.multiplier));
    }
    if (includeTemporary && (c.timers.tacticalData || 0) > c.time && !hasCore(state, 95)) stats.criticalChance += (c.stacks.tacticalData || 0) * V.dataCrit;
    stats.fireRate = resolveFireRate(stats);
    applyFireRateLock(state, stats);
    if(hasCore(state,95))stats.criticalChance=.25;
    stats.criticalChance = Math.max(0, Math.min(1, stats.criticalChance));
    stats.criticalDamageMultiplier = Math.max(1.7, Math.min(10, stats.criticalDamageMultiplier));
    stats.skillHaste = Math.max(0, stats.skillHaste);
    stats.armor = Math.max(-80, stats.armor);
    stats.maxHp = Math.max(1, stats.maxHp);
    stats.firepower = Math.max(0, stats.firepower);
    stats.hpRegen = Math.max(0, stats.hpRegen);
    stats.currentHp = Math.min(state.currentHp, stats.maxHp);
    state.coreState.stacks.resourceRatio=state.currentResource/stats.maxResource;
    stats.currentResource = Math.min(state.currentResource, stats.maxResource);
    if (includeTemporary) c.stacks.effectiveMaxHp = stats.maxHp;
    return stats;
}
/** Capacity adjustment, deliberately separate from healing and from stat reads. */
export function syncEffectiveMaxHp(state: AircraftCombatState): void {
    const maxHp = getEffectiveAircraftStats(state).maxHp;
    const previous = state.coreState.syncedMaxHp ?? maxHp;
    state.currentHp = Math.min(maxHp, state.currentHp + (state.duel && (state.duel.healingBlocked || state.currentHp <= 0) ? 0 : Math.max(0, maxHp - previous)));
    state.coreState.syncedMaxHp = maxHp;
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
// Remap cumulative old XP using interpolation; endpoints remain exactly 9874 / 2668.
const XP_CURVES = [1,2].map(stage => {
 const old=[0]; for(let n=0;n<29;n++)old.push(old[n]+(stage===2?36+4*n:Math.round(45+8*n+.69*n*n)));
 const cumulative=Array.from({length:18},(_,i)=>{const x=i*29/17,lo=Math.floor(x);return Math.round(old[lo]+(old[Math.min(29,lo+1)]-old[lo])*(x-lo));});
 return cumulative.slice(1).map((value,i)=>value-cumulative[i]);
});
// Stage 4 reaches its final milestone at the end of its authored 3,455 XP ledger.
const MIRAGE_XP_CURVE = XP_CURVES[1].map((_value,index) => {
 const before=XP_CURVES[1].slice(0,index).reduce((sum,value)=>sum+value,0);
 return Math.round((before+XP_CURVES[1][index])*3455/2668)-Math.round(before*3455/2668);
});
export function requiredCombatXp(level:number,stageId=1):number {return level>=COMBAT_LEVEL_CAP?0:(stageId===4?MIRAGE_XP_CURVE:XP_CURVES[stageId===2||stageId===3?1:0])[Math.max(0,level-1)];}
export function gainCombatXp(state: AircraftCombatState, amount: number, stageId = 1): LevelUpResult {
    let remaining = Math.max(0, amount), levelsGained = 0, coreSelectionsDue = 0;
    while (remaining > 0 && state.level < COMBAT_LEVEL_CAP) {
        const needed = requiredCombatXp(state.level, stageId) - state.combatXp;
        if (remaining < needed) {
            state.combatXp += remaining;
            break;
        }
        remaining -= needed;
        state.combatXp = 0;
        levelUpAircraft(state);
        levelsGained++;
        if (CORE_MILESTONES.some(level=>level===state.level)) {
            state.pendingMilestones.push(state.level);
            coreSelectionsDue++;
        }
    }
    if (state.level >= COMBAT_LEVEL_CAP)
        state.combatXp = 0;
    return { levelsGained, coreSelectionsDue };
}
export function levelUpAircraft(state: AircraftCombatState): void {
    if (state.level >= COMBAT_LEVEL_CAP)
        return;
    const before = getEffectiveAircraftStats(state);
    state.level++;
    state.skillPoints++;
    const after = getEffectiveAircraftStats(state);
    syncEffectiveMaxHp(state);
    state.currentResource = Math.min(after.maxResource, state.currentResource + Math.max(0, after.maxResource - before.maxResource));
}
export function getSkillRuntimeValues(state: AircraftCombatState, skillId: SkillId): RuntimeSkillValues {
    const skill = SKILL_CONFIGS[skillId];
    const v: RuntimeSkillValues = { cost: skill.cost, cooldown: skill.cooldown, duration: skill.duration || 0, damageMultiplier: skill.damageMultiplier || 0,
        count: 0, upkeepPerSecond: 0, sideProjectileMultiplier: .15, radiusMultiplier: 1, damageTakenMultiplier: 1, charge: 0 };
    Object.assign(v, rankValues(state,skillId));
    const specialized=hasCore(state,97)&&!isUltimate(skillId);
    const costMultiplier=Math.max(.4, expansionSkillCost(state,skillId)*(specialized?.8:1)*(1-P[31].discount*equipmentScale(state,31)));
    const shift=expansionActive(state,"shiftDiscount")?.85:1;
    const aether=(equipmentEffect(state,6).bonusUntil??0)>state.coreState.time?1-P[6].discount*equipmentScale(state,6):1;
    v.cost*=costMultiplier*shift*aether;
    v.upkeepPerSecond*=costMultiplier;
    if(specialized)v.cooldown*=.75;
    if(expansionState(state).primarySkill===skillId)v.cooldown*=.8;
    return v;
}
export function canBorrowSkill(state: AircraftCombatState, skillId: SkillId): boolean {
    const c=state.coreState;
    return hasCore(state,113) && (state.cooldowns[skillId]??0)>0 && (c.timers.futureDebt??0)<=c.time && !c.stacks.borrowPending;
}
/** Read-only cast rules shared by the transaction and Skill HUD. */
export function getSkillAvailability(state: AircraftCombatState, skillId: SkillId, manualAction?: "toggle" | "detonate" | "pending") {
    const skill=SKILL_CONFIGS[skillId],values=getSkillRuntimeValues(state,skillId);
    const free=hasCore(state,84)&&(state.coreState.skillCasts+1)%4===0;
    const cost=skillId==="escort_drone"||free?0:values.cost;
    const cooldown=Math.max(0,state.cooldowns[skillId]??0);
    const duration=state.coreState.skillCooldownDurations[skillId]??resolveSkillCooldown(values.cooldown, getEffectiveAircraftStats(state).skillHaste, state.coreState.deferredCooldowns[skillId] ?? (free ? 1.1 : 1));
    const borrow=canBorrowSkill(state,skillId);
    const toggle=skillId==="escort_drone"&&state.droneActive;
    let reason: SkillCastResult["reason"];
    if(!skill||skill.aircraftId!==state.aircraftId||overheated(state)||skillRank(state,skillId)===0||ultimateCastDisabled(state,skillId)||playerSkillLocked(state))reason="invalid";
    else if(manualAction==="pending")reason="invalid";
    else if(manualAction)reason=undefined;
    else if(toggle){if(skillId==="escort_drone"&&state.dronePhase==="returning")reason="invalid";}
    else if((isAstraSkill(skillId)||skillId==="sweeping_cannon")&&(state.activeEffects[skillId]??0)>0)reason="invalid";
    else if(state.coreState.deferredCooldowns[skillId]!==undefined)reason="invalid";
    else if(state.coreState.stacks[`debt:${skillId}`]||(cooldown>0&&!borrow))reason="cooldown";
    else if(state.currentResource+Number.EPSILON<(skillId==="escort_drone"?values.cost:cost))reason="resource";
    return {reason,available:!reason,free,cost,borrow,cooldown,duration,
      cooldownProgress:Math.max(0,Math.min(1,duration>0?cooldown/duration:0)),manualAction,toggle};
}
function beginDebt(state: AircraftCombatState, skillId: SkillId): void {
    const c=state.coreState;
    state.cooldowns[skillId]=(state.cooldowns[skillId]??0)+rankValues(state,skillId).cooldown*.5;
    state.coreState.skillCooldownDurations[skillId]=state.cooldowns[skillId];
    recordCoreMetric(state,113,"extraCooldown",rankValues(state,skillId).cooldown*.5);
    c.stacks[`paidDebt:${skillId}`]=(c.stacks[`paidDebt:${skillId}`]??0)+rankValues(state,skillId).cooldown*.5;
    c.timers.futureDebt=c.time+18;delete c.stacks.borrowPending;delete c.stacks[`debt:${skillId}`];
}
/** One settlement point for cast modifiers, duration tracking, telemetry and borrowed debt. */
export function startDeferredSkillCooldown(state:AircraftCombatState,skillId:SkillId):void {
    const factor=state.coreState.deferredCooldowns[skillId];
    if(factor===undefined)return;
    state.cooldowns[skillId]=resolveSkillCooldown(getSkillRuntimeValues(state,skillId).cooldown, getEffectiveAircraftStats(state).skillHaste, factor);
    state.coreState.skillCooldownDurations[skillId]=state.cooldowns[skillId];
    recordCooldownTelemetry(state,skillId,factor);
    delete state.coreState.deferredCooldowns[skillId];
    if(isUltimate(skillId)&&hasCore(state,218)&&!ultimateCastDisabled(state,skillId)&&!state.coreState.stacks.cancellingSkills){state.coreState.timers.ultimateAftershock=state.coreState.time+15;recordCoreMetric(state,218,"procs",1);}
    if(state.coreState.stacks[`debt:${skillId}`])beginDebt(state,skillId);
}
export function endAircraftSkill(state: AircraftCombatState, skillId: SkillId): void {
    if (skillId === "invisibility") delete state.coreState.emergencyRepair;
    const wasActive = skillId === "escort_drone" ? state.droneActive : (state.activeEffects[skillId] || 0) > 0;
    if (skillId === "escort_drone") {
        state.droneActive = false;
        state.dronePhase = undefined; state.droneTransitionRemaining = 0;
        delete state.coreState.timers.hawkRage;
        delete state.coreState.timers.hawkRageReady;
        delete state.coreState.stacks["cooldownPending:hawkRageReady"];
    }
    delete state.activeEffects[skillId];
    if (state.activeEffectDurations) delete state.activeEffectDurations[skillId];
    if (!wasActive && state.coreState.deferredCooldowns[skillId] === undefined)
        return;
    if (!["decoy", "missile_swarm", "heavy_bomb"].includes(skillId)) finishExpansionSkill(state, expansionState(state).casts[skillId]);
    if (skillId === "afterburner" && (skillRank(state, "afterburner") >= 4)) state.coreState.timers.activeCooling = state.coreState.time + V.coolingDuration;
    if (skillId === "armor_shield" && (skillRank(state, "armor_shield") >= 5)) state.coreState.stacks.shieldEmpPending = 1;
    if (skillId === "invisibility") {
        state.coreState.stacks.cloneEndPending = 1;
        if ((skillRank(state, "invisibility") >= 5)) state.coreState.timers.reappearanceBuff = state.coreState.time + V.reappearanceDuration;
    }
    startDeferredSkillCooldown(state,skillId);
    if (skillId === "armor_shield" && (skillRank(state, "armor_shield") >= 5)){
        state.coreState.timers.shieldArmor = state.coreState.time + 6;recordCoreMetric(state,30,"procs",1);
    }
}
export function castSkill(state: AircraftCombatState, skillId: SkillId): SkillCastResult {
    const skill = SKILL_CONFIGS[skillId];
    const availability=getSkillAvailability(state,skillId);
    if(!availability.available)return {cast:false,reason:availability.reason,resourceSpent:0};
    if (skillId === "escort_drone" && state.droneActive) {
        state.dronePhase="returning";state.droneTransitionRemaining=.38;
        delete state.coreState.timers.hawkRage;
        delete state.coreState.timers.hawkRageReady;
        delete state.coreState.stacks["cooldownPending:hawkRageReady"];
        return {cast:true,resourceSpent:0,toggledOff:true};
    }
    const borrowed=availability.borrow;
    const v = getSkillRuntimeValues(state, skillId);
    const {free,cost}=availability;
    state.currentResource = Math.max(0, state.currentResource - cost);
    equipmentResourceSpent(state,cost);
    if(expansionActive(state,"shiftDiscount")){recordCoreMetric(state,168,"saved",cost/.85-cost);state.coreState.timers.shiftDiscount=0;}
    equipmentEffect(state,6).bonusUntil=0;
    const equipmentCost = 1-P[31].discount*equipmentScale(state,31);
    equipmentMetric(state,31,"saved",cost/equipmentCost-cost);
    observeExpansionResource(state, getEffectiveAircraftStats(state).maxResource);
    state.coreState.skillCasts++;
    if(isAstraSkill(skillId)) {
        state.activeEffects[skillId]=skillId==="orbit_reversal"?v.duration:skillId==="stellar_lance"?v.charge:(v.count-1)*.5+(skillRank(state,skillId)>=3?2:1);
        (state.activeEffectDurations??={})[skillId]=state.activeEffects[skillId];
    }
    if(skillId==="stellar_lance"){
        const c=state.coreState,stack=(c.timers.lanceChain??0)>c.time?(c.stacks.lanceStack??0):0;
        c.stacks.lanceCastStack=stack;c.stacks.lanceStack=Math.min(4,stack+1);c.timers.lanceChain=c.time+15;
    }
    if(borrowed){state.coreState.stacks.borrowPending=1;state.coreState.stacks[`debt:${skillId}`]=1;recordCoreMetric(state,113,"procs",1);}
    if(free){recordCoreMetric(state,84,"procs",1);recordCoreMetric(state,84,"saved",skillId==="escort_drone"?0:v.cost);}
    const savingRow=skillId==="invisibility"?39:skillId==="focus_laser"?42:undefined;
    if(!free)recordCoreMetric(state,savingRow,"saved",Math.max(0,skill.cost-v.cost));
    if(!free&&skillId!=="escort_drone"){
        if(hasCore(state,190))recordCoreMetric(state,190,"extraResource",cost-cost/1.10);
        if(expansionState(state).primarySkill===skillId)recordCoreMetric(state,202,"saved",cost/.8-cost);
    }
    if(skillId==="focus_laser")recordCoreMetric(state,41,"chargeSaved",1.8);
    state.coreState.deferredCooldowns[skillId] = free ? 1.1 : 1;
    state.cooldowns[skillId] = 0;
    delete state.coreState.skillCooldownDurations[skillId];
    if (v.duration > 0 && skillId !== "decoy") {
        state.activeEffects[skillId] = v.duration + (skillId === "focus_laser" ? v.charge : 0);
        (state.activeEffectDurations ??= {})[skillId] = state.activeEffects[skillId];
        if (skillId === "invisibility") {
            delete state.coreState.emergencyRepair;
            if ((skillRank(state, "invisibility") >= 3)) state.coreState.emergencyRepair = {
                remaining: Math.max(0, getEffectiveAircraftStats(state).maxHp - state.currentHp) * .25,
                durationRemaining: v.duration,
            };
        }
    }
    if (skillId === "escort_drone") {
        state.droneActive = true;
        state.dronePhase="deploying";state.droneTransitionRemaining=.4;
        delete state.coreState.timers.hawkRageReady;
    }
    return { cast: true, resourceSpent: cost };
}
export function healAircraft(state: AircraftCombatState, amount: number, allowOverhealShield = true): number {
    if(state.duel && (state.duel.healingBlocked || state.currentHp <= 0))return 0;
    const maxHp = getEffectiveAircraftStats(state).maxHp;
    const healing = Math.max(0, amount) * getHealingReceivedMultiplier(state), effective = Math.min(healing, Math.max(0, maxHp - state.currentHp));
    state.currentHp = Math.min(maxHp, state.currentHp + effective);
    state.coreState.healingTotal += effective;
    if (allowOverhealShield && hasCore(state, 104) && healing > effective) {
        const old = state.coreState.shields.overheal;
        const current = old && old.until > state.coreState.time && !old.settled ? old.amount : 0;
        if(old && !current)finishAbsorbShield(state,old);
        const shield = current ? old! : createAbsorbShield(state,"overheal",0,6);
        // Surplus already includes Behemoth's received bonus; do not multiply it twice.
        const amplification = getRecoveryReceivedMultiplier(state);
        shield.amount = Math.min(maxHp * .15 * amplification, current + healing - effective);
        shield.capacity = Math.max(shield.capacity ?? 0, shield.amount);
        shield.until = state.coreState.time + 6;
        shield.duration = 6;
        recordCoreMetric(state, 104, "shieldCreated", Math.max(0, state.coreState.shields.overheal.amount - current));
    }
    return effective;
}
export function tickAircraftState(state: AircraftCombatState, deltaSeconds: number, gameplayRunning: boolean,
    onHealing?: (effective: number, source: "core" | "skill_core") => void): void {
    if (!gameplayRunning || deltaSeconds <= 0)
        return;
    const dt = deltaSeconds;
    for(const [row,key,extra] of [[22,"afterburner",10-(SKILL_CONFIGS.afterburner.duration??0)],[29,"armor_shield",9-(SKILL_CONFIGS.armor_shield.duration??0)],[37,"invisibility",3.5-(SKILL_CONFIGS.invisibility.duration??0)]] as const){
        const remaining=state.activeEffects[key]??0;if(remaining<=extra)recordCoreMetric(state,row,"extraTime",Math.min(dt,remaining));
    }
    recordCoreMetric(state,30,"uptime",Math.min(dt,Math.max(0,(state.coreState.timers.shieldArmor??0)-state.coreState.time)));
    if(state.coreState.time-state.coreState.lastDamage>=4)recordCoreMetric(state,82,"uptime",dt);
    for (const key of Object.keys(state.cooldowns) as SkillId[]) {
        const before=state.cooldowns[key]||0,extra=0;
        state.cooldowns[key] = Math.max(0,before-dt-extra);
        recordCoreMetric(state,119,"cooldown",Math.max(0,before-dt)-state.cooldowns[key]!);
        const debtKey=`paidDebt:${key}`,debt=state.coreState.stacks[debtKey]??0;
        const remaining=Math.min(debt,state.cooldowns[key]!);
        recordCoreMetric(state,113,"debtPaid",debt-remaining);
        if(remaining>0)state.coreState.stacks[debtKey]=remaining;
        else delete state.coreState.stacks[debtKey];
    }
    const coolingStep = Math.max(0, Math.min(dt, (state.coreState.timers.activeCooling || 0) - state.coreState.time));
    if (coolingStep > 0) {
        const max = getEffectiveAircraftStats(state).maxResource;
        const gain = Math.min(max - state.currentResource, max * V.coolingMana * coolingStep / V.coolingDuration);
        state.currentResource += gain; recordCoreMetric(state, 126, "resource", gain);
    }
    state.coreState.time += dt;
    settleCoreCooldowns(state);
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
            recordCoreMetric(state, 38, "healed", effective);
            repair.remaining = Math.max(0, repair.remaining - planned);
            repair.durationRemaining = Math.max(0, repair.durationRemaining - step);
            if (effective > 0) onHealing?.(effective, "skill_core");
        }
    }
    for (const key of Object.keys(state.activeEffects) as SkillId[]) {
        if(isAstraSkill(key)||key==="predator_lock"||key==="gravity_anchor"||key==="electronic_interference"||key==="focus_laser")continue; // World-owned completion includes delayed impacts.
        const next = (state.activeEffects[key] || 0) - dt;
        if (next <= 0)
            endAircraftSkill(state, key);
        else
            state.activeEffects[key] = next;
    }
    if (state.droneActive && state.dronePhase === "active" && (skillRank(state, "escort_drone") >= 3)) {
        const c=state.coreState;
        if(c.timers.hawkRageReady===undefined&&!c.stacks["cooldownPending:hawkRageReady"])c.timers.hawkRageReady=c.time+7;
        if(coreCooldownReady(state,"hawkRageReady") && (c.timers.hawkRage??0)<=c.time){
            c.timers.hawkRage=c.time+3;
            deferCoreCooldown(state,"hawkRageReady");
            recordCoreMetric(state,44,"procs",1);
        }
    }

    for (const [key, shield] of Object.entries(state.coreState.shields))
        if (shield.until <= state.coreState.time)
            { finishAbsorbShield(state, shield); delete state.coreState.shields[key]; }
    const stats = getEffectiveAircraftStats(state);
    syncEffectiveMaxHp(state);
    const resourceWithout=new Map<number,number>();
    let hpWithoutDual = stats.hpRegen;
    for(const row of [119,174,176,181,208,209,218,222])if(hasCore(state,row)){
        const without=getEffectiveAircraftStats({...state,selectedCores:state.selectedCores.filter(id=>id!==`core_${row}`),coreState:{...state.coreState,stacks:{...state.coreState.stacks}}});
        resourceWithout.set(row,without.resourceRegen);
        if(row===208)hpWithoutDual=without.hpRegen;
    }
    const equipmentRegenWithout = new Map<number, EffectiveAircraftStats>();
    for(const family of [28,32])if(equipmentScale(state,family))equipmentRegenWithout.set(family,getEffectiveAircraftStats(state,true,family));
    const missingHp = Math.max(0, stats.maxHp - state.currentHp);
    const healed = healAircraft(state, stats.hpRegen * dt, false);
    const healingMultiplier = getHealingReceivedMultiplier(state);
    recordCoreMetric(state, 208, "healed", healed - Math.min(missingHp, Math.max(0, hpWithoutDual) * dt * healingMultiplier));
    const upkeep = state.droneActive && state.dronePhase === "active" ? getSkillRuntimeValues(state, "escort_drone").upkeepPerSecond : 0;
    const available = Math.max(0, state.currentResource + stats.resourceRegen * dt);
    const spent = Math.min(available, upkeep * dt);
    equipmentResourceSpent(state,spent);
    equipmentMetric(state,31,"saved",Math.min(available,upkeep/(1-P[31].discount*equipmentScale(state,31))*dt)-spent);
    if(upkeep>0)recordCoreMetric(state,43,"saved",Math.min(available,4*dt)-spent);
    const resourceBefore = state.currentResource;
    state.currentResource = Math.max(0, Math.min(stats.maxResource, available - spent));
    for(const [row,regen] of resourceWithout){
        const counterfactual=Math.max(0,Math.min(stats.maxResource,resourceBefore+regen*dt-spent));
        recordCoreMetric(state,row,"resource",state.currentResource-counterfactual);
    }
    if(upkeep>0){
        if(hasCore(state,190))recordCoreMetric(state,190,"extraResource",spent-Math.min(available,upkeep/1.10*dt));
        if(expansionState(state).primarySkill==="escort_drone")recordCoreMetric(state,202,"saved",Math.min(available,upkeep/.8*dt)-spent);
    }
    for(const [family,without] of equipmentRegenWithout){
      equipmentMetric(state,family,"extraHealing",healed-Math.min(missingHp,without.hpRegen*dt*healingMultiplier));
      equipmentMetric(state,family,"extraResource",state.currentResource-Math.max(0,Math.min(stats.maxResource,resourceBefore+without.resourceRegen*dt-spent)));
    }
    observeExpansionResource(state, stats.maxResource);
    if (state.droneActive && state.dronePhase === "active" && state.currentResource <= 0)
        endAircraftSkill(state, "escort_drone");
}
export function isPlayerInvisible(state: AircraftCombatState): boolean { return (state.activeEffects.invisibility || 0) > 0; }
export function canAcquirePlayerTarget(state: AircraftCombatState): boolean { return !isPlayerInvisible(state) && !equipmentUntargetable(state); }
export function shouldAutoFire(state: AircraftCombatState): boolean {
    const sweepingCannonActive=(state.activeEffects.sweeping_cannon||0)>0;
    return (!overheated(state)||sweepingCannonActive) && (state.activeEffects.focus_laser || 0) <= 0 && (state.activeEffects.stellar_lance || 0) <= 0;
}
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

function recordCooldownTelemetry(state:AircraftCombatState,skillId:SkillId,penalty:number) {
    const haste=getEffectiveAircraftStats(state).skillHaste;
    const cooldown=(base:number,castMultiplier=penalty)=>resolveSkillCooldown(base,haste,castMultiplier);
    const sources:Partial<Record<SkillId,readonly [number,number][]>>={
        orbit_reversal:[[154,9]],starfall:[[165,11]],
        decoy:[[20,SKILL_CONFIGS.decoy.cooldown-11]],heavy_bomb:[[31,SKILL_CONFIGS.heavy_bomb.cooldown-15]],
        afterburner:[[125,V.afterburnerCooldownReduction]],missile_swarm:[[128,V.swarmCooldownReduction]],
        armor_shield:[[133,V.shieldCooldownReduction]],sweeping_cannon:[[137,V.cannonCooldownReduction]],
    };
    for(const [row,seconds] of sources[skillId]??[])recordCoreMetric(state,row,"cooldown",cooldown(seconds));
    if(penalty>1)recordCoreMetric(state,84,"extraCooldown",cooldown(getSkillRuntimeValues(state,skillId).cooldown,penalty-1));
    if(expansionState(state).primarySkill===skillId)recordCoreMetric(state,202,"cooldown",cooldown(getSkillRuntimeValues(state,skillId).cooldown*(1/.8-1)));
    for(const row of [209,222])if(hasCore(state,row)){
        const without=getEffectiveAircraftStats({...state,selectedCores:state.selectedCores.filter(id=>id!==`core_${row}`),coreState:{...state.coreState,stacks:{...state.coreState.stacks}}});
        recordCoreMetric(state,row,"cooldown",Math.abs(resolveSkillCooldown(getSkillRuntimeValues(state,skillId).cooldown,without.skillHaste,penalty)-cooldown(getSkillRuntimeValues(state,skillId).cooldown)));
    }
}

export function getCore208Contribution(state: AircraftCombatState) {
    if (!hasCore(state,208)) return {hpRegen:0,resourceRegen:0};
    const withCore = structuredClone(state), withoutCore = structuredClone(state);
    withoutCore.selectedCores = withoutCore.selectedCores.filter(id=>id!=="core_208");
    const current = getEffectiveAircraftStats(withCore), without = getEffectiveAircraftStats(withoutCore);
    return {hpRegen:current.hpRegen-without.hpRegen,resourceRegen:current.resourceRegen-without.resourceRegen};
}
