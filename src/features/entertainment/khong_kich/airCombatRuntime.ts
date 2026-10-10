import { reduceRunningSkillCooldown, coreCooldownReady, deferCoreCooldown } from "./airCombatCooldowns";
import { playerBasicProjectileSpeed, phantomLaserBounds, HAWKEYE_PROJECTILE_RADIUS } from './airCombatPhantom';
import { statusExpiry, extendStatusRemaining, extendStatusExpiry } from './airCombatStatusTiming';
import { getHealingSummary } from './airCombatHealingSummary';
import { isTerraSkill } from './airCombatTerraConfig';
import { beginTerraSkill, tickTerra, cancelTerra, terraAllowed, terraIncomingHp, terraAbsorb, terraState, terraMovement, terraSuppression, terraKnockbackImmune, clearTerraTarget, terraFx, terraHud, type TerraHooks } from './airCombatTerraRuntime';
import { clearSylvaTarget } from './airCombatSylvaRuntime';
import { isSylvaSkill } from './airCombatSylvaConfig';
import { sylvaState, sylvaGrayHealth, sylvaAllowed, sylvaRecastReady, sylvaHud, sylvaIncomingHp, sylvaArmor, sylvaOutgoing, sylvaMovement, sylvaFireRate, sylvaAcidHit, sylvaMuzzle, sylvaDealt, beginSylvaSkill, tickSylva, cancelSylva, endSylvaSymbiosis, clearSylvaSlow, type SylvaHooks } from './airCombatSylvaRuntime';
import { argentArrayActive, argentPrimaryFired, argentArmorMultiplier, argentThreatNearby, argentState, argentHud, argentWaiting, argentIncoming, argentPrimaryHit, beginArgentSkill, tickArgent, cancelArgent, argentMovement, clearArgentSlow, type ArgentHooks } from './airCombatArgentRuntime';
import { isArgentSkill } from './airCombatArgentConfig';
import { beginRiptideSkill, tickRiptide, riptideAfterwash, riptideMovement, riptideIncoming, riptideRecastReady, endRiptideWaterform, cancelRiptide, riptideState, riptideThreatNearby, clearRiptideSlow, type RiptideHooks } from './airCombatRiptideRuntime';
import { isRiptideSkill } from './airCombatRiptideConfig';
import { recordPassiveDamage } from "./airCombatPassives";
import { gravityAnchorValues } from "./airCombatGravityAnchor";
import { registerNegativeStatusSource, externalNegativeStatusTypes } from './airCombatNegativeStatuses';
import { bigBangStep, type BigBangCast } from './airCombatBigBang';
import { beginCinderSkill, tickCinder, passiveHit, cinderMovement, cinderMovementLocked, cinderSkillAllowed, cinderShieldFactor, cinderShieldAbsorbed, cancelCinder, cinderState, cinderThreatNearby, type CinderHooks, type IntrinsicDamage } from './airCombatCinderRuntime';
import { isCinderSkill } from './airCombatCinderConfig';
import { createCombatNotice, publishCombatNotice, COMBAT_NOTICE_DURATION_MS } from "./airCombatNotices";
import { canTargetEnemy, preferredDuelDecoy } from "./airCombatTargetability";
import { activeShieldAmount } from "./airCombatFeedback";
import { mirrorPoint, mirrorVector } from "./airCombatMirrorTransform";
import { createMirageState, initializeMirageEnemy, updateMirageEnemy, updateMirageProjectile, updateMirage, resetMirage, resolveMirageContacts, mirageEnemyDestroyed, mirageShieldBlocks, mirageFx, type MirageWorldState, type MirageEnemyState } from "./airCombatMirage";
import type { MirageVisualKey } from "./airCombatStage4Art";
import { createMirrorState, createMirrorAI, syncMirrorBuild, type MirrorCombatant } from "./airCombatMirrorCombatant";
import { updateMirrorAI, observeMirrorCast } from "./airCombatMirrorAI";
import { createStormbreakerState, initializeStormEnemy, updateStormbreakerEnemy, updateStormbreaker, updateStormbreakerProjectile, resetStormbreaker, onStormEnemyDamage, stormEnemyDestroyed, stormDamageTakenMultiplier, isStormObjective, stormFx, type StormbreakerWorldState, type StormbreakerEnemyState, type StormbreakerHooks } from "./airCombatStormbreaker";
import type { StormbreakerVfxKey } from "./airCombatStage3Art";
import { EQUIPMENT_POWER as P } from "./airCombatEquipmentBalance";
import type { UltimateVisualKey } from "./airCombatUltimateArt";
import { INTERFERENCE_WAVE_SPEED, INTERFERENCE_WAVE_THICKNESS, beginRankSkill, collapseAnchor, tickRankSkills, rankRuntime, rankEnemyMovement, rankEnemyFireRate, rankProjectileSpeed, rankDirectMultiplier, rankArmorMultiplier, predatorBasicHit, rankProjectileHit, echoTwinShot, type RankEffect, type RankRuntime, type RankRuntimeHooks } from "./airCombatRankRuntime";
import { isUltimate, ultimateCastDisabled } from "./airCombatSkillRanks";
import { rankValues, skillRank } from "./airCombatSkillRanks";
import { equipmentState, equipmentScale, equipmentEffect, equipmentMetric } from "./airCombatEquipmentState";
import { canSkillsCrit, equipmentUntargetable } from "./airCombatEquipmentStats";
import { advanceWaitingChest, claimWaitingChest } from "./airCombatEquipmentRewards";
import { tickEquipment, flushEquipmentDrops, equipmentOnHit, equipmentOnCast, equipmentOnDamage, equipmentOnKill, equipmentPreventedDamage, equipmentConsumeSkillBonus, equipmentOutgoing, equipmentArmor, equipmentIncoming, equipmentSlow, equipmentFx, type EquipmentHooks } from "./airCombatEquipmentRuntime";
import { getHealingReceivedMultiplier, getShieldReceivedMultiplier } from "./airCombatRecovery";
import { releaseState, playerAirframeScale, overheated } from "./airCombatReleaseState";
import { closeCoreSelection, spendReroll, rollUnstableMode, type RerollSource } from "./airCombatSelectionRules";
import { syncEffectiveMaxHp, getSkillAvailability, startDeferredSkillCooldown } from "./airCombatAircraft";
import { tickCoreTelemetry } from "./airCombatReleaseTelemetry";
import { expansionState, expansionActive, expansionOutgoing, expansionIncoming, celestialProtection, activeNegativeStatusTypes, hasAbsorbShield, prepareAbsorbShield, finishAbsorbShield, finishExpansionSkill, createAbsorbShield, type ExpansionCast } from "./airCombatExpansion";
import { castExpansion, tickExpansion, refreshBreathingRoom, expansionHpLoss, deferExpansionDamage, expansionKill, settleExpansionShields, satellitePositions, slowExpansionProjectile, type ExpansionHooks } from "./airCombatExpansionRuntime";
import { astraOrbitProtectionActive, exitStellarLance, meteorSpearEndpoints, type StellarLancePath, astraMetric, beginAstraSkill, updateAstra, captureAstraProjectiles, releaseOrbit, freezeAstraTarget, isAstraSkill, type AstraRuntime, type AstraHooks } from "./airCombatAstra";
import { BOUNTY_REWARDS } from "./airCombatTelemetry";
import { stageEnemyConfig } from "./airCombatConfig";
import type { MagneticVfxKey } from "./airCombatStage2Art";
import { getAirCombatStage, type AirCombatStageDefinition } from "./airCombatStages";
import { assertStageLaunch, persistStageVictory } from "./airCombatStorage";
import { magneticFx, updateMagneticEnemy, updateMagneticHazards, updateMagneticProjectile, resetMagneticHazards, guardianMultiplier, guardianDestroyed, guardianSlots, positionMagneticGuardian, initializeTempestGuardians, type MagneticWorldState, type MagneticEnemyState, type MagneticProjectileState, type MagneticHooks } from "./airCombatMagnetic";
import { recordCoreMetric } from "./airCombatTelemetry";
import { SKILL_BASE_VALUES as B, SKILL_CORE_VALUES as V, createSkillCoreRuntime, type SkillCoreRuntime, type MissileSalvo } from "./airCombatSkillCores";
import { createCoreSelectionEvent, getRerollCandidates, makeCoreCard, type CoreSelectionEvent } from "./airCombatCoreSelection";
import { getPlayerHitbox, getEnemyHitbox, createHitResult, segmentVsAircraft, circleVsAircraft, aircraftVsAircraft, sweepAircraft, hitboxProjectionExtent, clampHitboxToGameplayRect, rectVsAircraft, ringVsAircraft, aircraftInsideWedge } from "./airCombatHitboxes";
import { wingDamageMultiplier } from "./airCombatHitboxes";
import type { AirframeHitZone } from "./airCombatHitboxes";
import type { Allegiance, DamageDelivery } from "./airCombatStatus";
import type { HitResult, AircraftHitbox } from "./airCombatHitboxes";
import { BASIC_AMMO_KEYS } from "./airCombatAmmo";
import type { AmmoVisualKey } from "./airCombatAmmo";
import { getMissileVisual, isImmediateMissile, missileRenderRotation } from "./airCombatAmmo";
import { clearMissilePose } from "./airCombatMissilePresentation";
import { hardControlImmune, clearAircraftNegativeStatuses, applyPlayerStatus, addStatusMark, playerStunned, playerSkillLocked } from "./airCombatStatus";
import type { AttackMetadata, AttackTag, StatusPayload } from "./airCombatStatus";
import { bossMinCenterY } from "./airCombatHudLayout";
import { BOSS_DAMAGE_MULTIPLIER, getBossTuning, SONIC_RING_SPEED, SONIC_RING_THICKNESS, SONIC_ACTIVE_SECONDS, LANE_ACTIVE_SECONDS } from "./airCombatBoss";
import type { BossAttackState, BossMajorAttack } from "./airCombatBoss";
import { createWaveQueue, isElite } from "./airCombatWaves";
import { combineArmorPenetration, armorPenetration, coreId, dispatchCoreEvent, hasCore, negativeStatusDuration, outgoingCoreMultiplier } from "./airCombatCoreEffects";
import type { CoreContext, CoreTarget, DamageSource } from "./airCombatCoreEffects";
import { calculateDamage, endAircraftSkill, healAircraft } from "./airCombatAircraft";
import { AIR_COMBAT_WORLD, ENEMY_CONFIGS, GAMEPLAY_SAFE_RECT, SKILL_CONFIGS, } from "./airCombatConfig";
import { applyCore, applyDamageToAircraft, resolvePlayerDamage, calculateRunRank, canAcquirePlayerTarget, castSkill, clampCircleToGameplayRect, createAircraftCombatState, gainCombatXp, generateCoreChoices, getComboMultiplier, getEffectiveAircraftStats, getSkillRuntimeValues, getTargetPriority, requiredCombatXp, resolveBasicProjectileMultipliers, shouldAutoFire, tickAircraftState, } from "./airCombatEngine";
import { CombatAnnouncement, AirCombatHudSnapshot, AirCombatRunSummary, AircraftCombatState, AircraftId, CoreCard, EnemyType, SkillCastResult, SkillId, } from "./airCombatTypes";
export interface EnemyEntity {
    /** Target adapter only. The aircraft owns HP, Skills, Core/Equipment and AI. */
    aircraftTarget?: { world: CombatWorld; attackerWorld: CombatWorld; rotated: boolean };
    mirage?: MirageEnemyState;
    hackedFacing?: number;
    hackedTargetId?: number;
    expansionMarks?: Record<string, number>;
    expansionKillingHit?: { primary: boolean; basic: boolean; skill: boolean; direct: boolean; critical: boolean; elite: boolean };
    burnCast?: ExpansionCast;
    bodyHitAt?:Record<number,number>;
    inheritedAllegiance?:Allegiance; attackAllegiance?:Allegiance;
    stormbreaker?: StormbreakerEnemyState;
    magnetic?: MagneticEnemyState;
    auxiliary?: boolean;
    rewardless?: boolean;
    killProcEligible?: boolean;
    expiresAt?: number;
    noWaveWait?: boolean;
    hackedUntil?:number; dashAllegiance?:Allegiance; dashCommitted?:boolean;
    skillLockedUntil?:number; armorBrokenUntil?:number;
    combatMarks?:Record<string,{count:number;until:number}>;

    bossAttack?: BossAttackState;
    kamikazeState?: "approach" | "charge" | "dash" | "recover" | "shrapnel" | "resolved";
    missedDashCount?: number; airframeRotation?: number;
    lockedX?: number; lockedY?: number;
    dashDirX?: number; dashDirY?: number;
    dashTravelled?: number; dashPlannedDistance?: number;
    stateTimer?: number; attackAge?: number; hitResolved?: boolean;
    /** Absolute Rift queue slot; never rescheduled when another unit dies. */
    riftAttackReadyAt?: number;
    riftWait?: { spawnedAt:number; x:number; y:number; phase:number };
    executionRecovery?: number;
    retaliationReady?: boolean;
    elitePatternCd?: number; elitePatternIndex?: number; eliteSequenceUntil?: number;
    id: number;
    type: EnemyType;
    x: number;
    y: number;
    baseX: number;
    vx: number;
    vy: number;
    radius: number;
    hp: number;
    maxHp: number;
    armor: number;
    age: number;
    fireCooldown: number;
    phaseSeed: number;
    wave: number;
    dashCharge: number;
    xp: number;
    damageScale: number;
    eliteWave: number;
    stun: number;
    burn: number;
    burnDamage: number;
    burnTick: number;
    weakReadyAt?: number;
    weakDebuffUntil?: number;
    burnArmorUntil?: number;
    weakHits: number;
    weakUntil: number;
    lightningUntil: number;
    shield: number;
    shieldUntil: number;
    shieldSource: number;
    abilityCd: number;
    secondaryCd: number;
    tertiaryCd: number;
    burst: number;
    burstCd: number;
    burstAngle: number;
    burstAllegiance?: Allegiance;
    secondaryAllegiance?: Allegiance;
    recoveryAllegiance?: Allegiance;
    attackCount: number;
    targetId: number | null;
    deathHandled: boolean;
    dashRemaining: number;
    dashStartX: number;
    dashStartY: number;
    dashEndX: number;
    dashEndY: number;
    aegisUntil: number;
    aegisReady: number;
    recentDamage: {
        time: number;
        damage: number;
    }[];
}

/** A target view adapts the existing target resolver; it never owns aircraft HP,
 * damage formulas, Skills or rewards. Enemy-only hack/kill effects have no PvP
 * meaning and are deliberately disabled instead of granting either side a buff. */
export function aircraftTargetView(host: CombatWorld, actor: CombatWorld): EnemyEntity {
    // SOLO uses a non-owning resolver view; it never spawns a Campaign enemy.
    const adapter = host.duel ? acquireEnemy(host) : spawnEnemy(host, "scout", true)!;
    if(host.duel){adapter.id=host.nextId++;adapter.auxiliary=true;host.enemies.push(adapter);}
    adapter.mirage = undefined; adapter.stormbreaker = undefined; adapter.magnetic = undefined;
    adapter.aircraftTarget = { world: actor, attackerWorld: host, rotated: true };
    adapter.noWaveWait = true; adapter.rewardless = true; adapter.killProcEligible = false; adapter.xp = 0;
    adapter.radius = 17;
    const stats = () => getEffectiveAircraftStats(actor.aircraft);
    Object.defineProperties(adapter, {
        x: { configurable: true, get: () => mirrorPoint(actor.playerX, actor.playerY).x,
            set: (value: number) => { actor.playerX = mirrorPoint(value, 0).x; } },
        y: { configurable: true, get: () => mirrorPoint(actor.playerX, actor.playerY).y,
            set: (value: number) => { actor.playerY = mirrorPoint(0, value).y; } },
        hp: { configurable: true, get: () => actor.aircraft.currentHp,
            set: (value: number) => { const amount = actor.aircraft.currentHp - value;
                if (amount > 0) receiveAircraftTargetDamage(adapter, amount, "area_hazard"); } },
        maxHp: { configurable: true, get: () => stats().maxHp },
        armor: { configurable: true, get: () => stats().armor },
        // Queries see real shield capacity; only the incoming resolver may consume it.
        shield: { configurable: true, get: () => activeShieldAmount(actor.aircraft), set: (_value: number) => {} },
        shieldUntil: { configurable: true, get: () => activeShieldAmount(actor.aircraft) > 0 ? Infinity : 0, set: (_value: number) => {} },
        hackedUntil: { configurable: true, get: () => 0, set: (_value: number) => {} },
        skillLockedUntil: { configurable: true, get: () => host.elapsed + Math.max(0, actor.aircraft.status.skillLockedUntil - actor.aircraft.coreState.time),
            set: (value: number) => { if (value > host.elapsed) applyPlayerStatus(actor.aircraft, { skillLock: value - host.elapsed }); } },
        stun: { configurable: true, get: () => Math.max(0, actor.aircraft.status.stunnedUntil - actor.aircraft.coreState.time),
            set: (value: number) => { if (value > 0) applyPlayerStatus(actor.aircraft, { stun: value }); } },
        armorBrokenUntil: { configurable: true, get: () => host.elapsed + Math.max(0, actor.aircraft.status.armorBrokenUntil - actor.aircraft.coreState.time),
            set: (value: number) => { if (value > host.elapsed) applyPlayerStatus(actor.aircraft, { armorBreak: value - host.elapsed }); } },
    });
    const p = mirrorPoint(actor.playerX, actor.playerY); adapter.x = p.x; adapter.y = p.y;
    const targetId = adapter.id;
    registerNegativeStatusSource(actor.aircraft, host, () =>
        adapter.id === targetId && adapter.aircraftTarget?.world === actor && host.enemies.includes(adapter)
            ? targetNegativeStatusTypes(host, adapter) : []);
    return adapter;
}

/** Debuffs and CC share semantic types: multiple burns/slows count once.
 * Read only effect state here: querying derived aircraft stats would recurse. */
function targetNegativeStatusTypes(w: CombatWorld, e: EnemyEntity): Set<string> {
    const result = new Set<string>(), now = w.elapsed, cinder = cinderState(w).targets.get(e.id);
    if (e.hp <= 0) return result;
    const terra=terraState(w).targets.get(e.id);if(terra?.entity===e){if(terra.rootUntil>now)result.add('root');if(terra.stunUntil>now)result.add('stunnedUntil');if(terra.suppressUntil>now)result.add('weaken');if(terra.markUntil>now)result.add('fissure');}
    const sylva=sylvaState(w).targets.get(e.id);
    if(sylva?.entity===e){if(sylva.flatUntil>now||sylva.acidUntil>now)result.add('armorBrokenUntil');if(sylva.rootUntil>now)result.add('root');if(sylva.slowUntil>now||sylva.suppressUntil>now)result.add('slow');if(sylva.markUntil>now)result.add('vulnerability');}
    if(argentArmorMultiplier(w,e)<1)result.add('armorBrokenUntil');
    const metal=argentState(w).controls.get(e.id);
    if(metal?.entity===e){if(metal.rootUntil>now)result.add('root');if(metal.slowUntil>now)result.add('slow');}
    if (riptideMovement(w,e)<1) result.add('slow');
    if (e.burn > 0 || cinder && cinder.entity === e && cinder.burn > 0 && cinder.until > now) result.add('burn');
    if (cinder?.entity === e) {
        if (cinder.slowUntil > now) result.add('slow');
        if (cinder.rootUntil > now) result.add('root');
        if (cinder.blazeUntil > now) result.add('blaze');
        if (cinder.markUntil > now) result.add('stellarMark');
    }
    const ranks = w.rankRuntime, interference = ranks?.interference.get(e.id), anchor = ranks?.anchor;
    if (interference && interference.until > now) {
        if (interference.movement < 1) result.add('slow');
        if (interference.firing < 1) result.add('fireRateReduction');
        if (interference.projectile < 1) result.add('projectileSlow');
    }
    if (anchor && anchor.until > now && Math.hypot(e.x-anchor.x,e.y-anchor.y) <= gravityAnchorValues(anchor.rank).radius) result.add('slow');
    const marks = equipmentState(w.aircraft).marks[e.id], time = w.aircraft.coreState.time;
    if (marks?.[24]?.until > time) result.add('slow');
    if (marks?.[36]?.until > time && marks[36].stacks > 0) result.add('bleed');
    if (marks?.[5]?.until > time) result.add('fuelMark');
    if (marks?.[7]?.until > time) result.add('vulnerability');
    const fx = w.skillCores.enemyEffects.get(e.id);
    if ((fx?.weakenUntil ?? 0) > now) result.add('weaken');
    if ((fx?.markUntil ?? 0) > now) result.add('titanMark');
    if ((fx?.armorUntil ?? 0) > now || (e.burnArmorUntil ?? 0) > now || e.weakUntil > now
        || (e.weakDebuffUntil ?? 0) > now || (e.expansionMarks?.gravityArmorUntil ?? 0) > now
        || marks?.[15]?.until > time && marks[15].stacks > 0) result.add('armorBrokenUntil');
    // Only active marks count; their proc counters and cooldowns never do.
    for (const key of ['preliminary','skillPhase','gunPhase','criticalLock','shieldBroken','controlWeakness'])
        if ((e.expansionMarks?.[key] ?? 0) > time) result.add(key);
    const deathMark = w.aircraft.coreState.release?.mark;
    if (deathMark?.target === e.id && deathMark.until > time) result.add('deathMark');
    if (w.astra?.burns.some(z => z.until > now && circleVsAircraft(z.x,z.y,z.radius,getEnemyHitbox(e)))) result.add('burn');
    return result;
}

export interface DuelDamageResolution { damage: number; absorbed: number }
export interface DuelDamageRequest {
    attackerWorld: CombatWorld;
    defenderWorld: CombatWorld;
    /** Attacker-side armor, penetration, crit and hit-zone have already resolved once. */
    damageAfterArmor: number;
    delivery: DamageDelivery;
    zone?: AirframeHitZone;
    resolvedArmor?: number;
    shieldFactor?: number;
    homing?: boolean;
    damageOverTime?: boolean; trueDamage?: boolean; reflection?: boolean;
}

/** Canonical aircraft-vs-aircraft incoming contract, shared by both allegiances.
 * The defender owns mitigation, invulnerability, shields, feedback and death;
 * the explicit owner receives actual HP loss + shield depletion, never overkill.
 * Per-delivery cadence lives at the caller, independently of PvE contact grace. */
export function resolveDuelDamage({ attackerWorld, defenderWorld: actor, damageAfterArmor: amount,
    delivery, zone, resolvedArmor = 0, shieldFactor = 1, homing = false, trueDamage = false, damageOverTime = false, reflection = false }: DuelDamageRequest): DuelDamageResolution {
    if (attackerWorld.aftermath || actor.aftermath || actor.destruction || attackerWorld === actor || (actor.aircraftDamageDepth ?? 0) >= 2) return { damage: 0, absorbed: 0 };
    const opponent = actor.enemies.find(e => e.aircraftTarget?.world === attackerWorld);
    actor.aircraftDamageDepth = (actor.aircraftDamageDepth ?? 0) + 1;
    try {
        const kind = delivery === "direct_projectile" ? "projectile" : delivery === "aircraft_collision" ? "collision" : "hazard";
        return hitPlayer(actor, amount, kind, { damageOwner: attackerWorld, aircraftDelivery: true, trueDamage, damageOverTime, reflection,
            armorResolved: true, armorPrevented: Math.max(0,amount*resolvedArmor/100), shieldFactor, homing,
            zoneResolved: true, delivery, sourceEnemyId: opponent?.id },
            zone ? { ...createHitResult(), hit: true, zone, x: actor.playerX, y: actor.playerY } : undefined);
    } finally { actor.aircraftDamageDepth--; }
}
function receiveAircraftTargetDamage(target: EnemyEntity, amount: number, delivery: DamageDelivery,
    zone?: AirframeHitZone, resolvedArmor = 0, shieldFactor = 1, homing = false, trueDamage = false, damageOverTime = false, reflection = false): DuelDamageResolution {
    const targetState = target.aircraftTarget!;
    return resolveDuelDamage({ attackerWorld: targetState.attackerWorld, defenderWorld: targetState.world,
        damageAfterArmor: amount, delivery, zone, resolvedArmor, shieldFactor, homing, trueDamage, damageOverTime, reflection });
}

function spawnMirror(world: CombatWorld): MirrorCombatant {
    prepareMirrorDuel(world);
    const context = createCombatWorld(world.aircraft.aircraftId, createCombatRandom((world.nextId * 2654435761) >>> 0), 4);
    context.mirage = undefined; context.mirrorContext = true; context.initialCoreQueued = true;
    context.spawnQueue = []; context.waveState = "combat"; context.waveIndex = 7;
    context.elapsed = world.elapsed; context.aircraft = createMirrorState(world.aircraft);
    context.aircraft.coreState.time = world.aircraft.coreState.time;
    const spawn = mirrorPoint(GAMEPLAY_SAFE_RECT.left + GAMEPLAY_SAFE_RECT.width / 2, GAMEPLAY_SAFE_RECT.top + 90);
    context.playerX = spawn.x; context.playerY = spawn.y;
    const target = aircraftTargetView(world, context), playerTarget = aircraftTargetView(context, world);
    const mirror: MirrorCombatant = { state: context.aircraft, context: { world: context, allegiance: "hostile", facing: 180 },
        ai: createMirrorAI(target.x, target.y), target, playerTarget, buildSignature: "", incoming: new Map(), outgoing: new Map() };
    syncMirrorBuild(world.aircraft, mirror, true);
    mirror.ai.lastPlayer={x:world.playerX,y:world.playerY};
    mirror.ai.lastHp=mirror.state.currentHp;mirror.ai.lastPlayerHp=world.aircraft.currentHp;
    mirageFx(world, "mirrorAircraftSpawn", target.x, target.y, 85, .8);
    return mirror;
}

/** Executes the same actor routines as the player, with private proc/telemetry,
 * projectile, effect, cooldown and target state. It never advances a wave or save. */
export function tickDuelActor(actor: CombatWorld, dt: number): void {
    if (actor.ended || (actor.duel && !actor.duel.combatEnabled)) return;
    revalidateAircraftTargets(actor);
    if (actor.aircraft.currentHp <= 0) {
        cancelTerra(actor); cancelSylva(actor); cancelArgent(actor); cancelRiptide(actor); cancelCinder(actor); actor.bigBang=undefined;
        // Finish already committed attacks before same-tick KO arbitration.
        updateSkillCoreEffects(actor,dt); updateWarnings(actor,dt); updateLaser(actor,dt);
        updateProjectiles(actor,dt); updateProjectileCollisions(actor); updateParticles(actor,dt); return;
    }
    refreshBreathingRoom(actor, expansionHooks);
    tickAircraftState(actor.aircraft, dt, true);
    tickReleaseCores(actor, dt); tickEquipment(actor, dt, equipmentHooks);
    syncEffectiveMaxHp(actor.aircraft); tickExpansion(actor, dt, expansionHooks);
    tickCoreTelemetry(actor.aircraft, dt); updateTacticalCores(actor, dt);
    actor.playerInvulnerability = Math.max(0, actor.playerInvulnerability - dt);
    dispatchCoreEvent("tick", coreContext(actor, { dt }));
    updateEnemies(actor, dt); // Burn/target debuffs; aircraft adapters skip enemy AI.
    updatePlayerDash(actor, dt); updateAstra(actor, dt, astraHooks); tickRankSkills(actor, dt, rankHooks);
    updateCrossfireGrids(actor); updateDroneMovement(actor, dt); updateDecoys(actor, dt);
    updateDecoySalvo(actor, dt); updateSkillCoreEffects(actor, dt); updateWarnings(actor, dt);
    updateLaser(actor, dt); updateMissileSalvo(actor, dt);
    tickCinder(actor, dt, cinderHooks); tickRiptide(actor, dt, riptideHooks);
    tickBasicFire(actor,dt); tickArgent(actor, dt, argentHooks); tickSylva(actor, dt, sylvaHooks); tickTerra(actor, dt, terraHooks);
    actor.droneFireCooldown -= dt;
    if (droneCombatActive(actor) && actor.droneFireCooldown <= 0) {
        fireDrone(actor);
        const ratio = getSkillRuntimeValues(actor.aircraft, "escort_drone").damageMultiplier;
        actor.droneFireCooldown = 1 / (getEffectiveAircraftStats(actor.aircraft, true, undefined, true).fireRate * ratio);
    }
    updateProjectiles(actor, dt); interceptAircraftDefenses(actor); interceptMissiles(actor); captureAstraProjectiles(actor, astraHooks);
    updateProjectileCollisions(actor); settleMissileSalvos(actor); resolveDeathsAndEffects(actor);
    updateParticles(actor, dt);
    refreshBreathingRoom(actor, expansionHooks);
    actor.visualEvents = actor.visualEvents.filter(v => (v.at ?? actor.elapsed) > actor.elapsed - 1).slice(-96);
}

function updateMirrorEncounter(world: CombatWorld, dt: number): void {
    const s = world.mirage!;
    if (world.ended || world.aircraft.currentHp <= 0) return;
    if (s.mirrorPhase === "inactive") { s.mirror = spawnMirror(world); s.mirrorPhase = "duel"; setMessage(world, "THE OTHER SELF · BẢN NGÃ PHẢN CHIẾU", 2); return; }
    const mirror = s.mirror;
    if (s.mirrorPhase === "duel" && mirror) {
        syncMirrorBuild(world.aircraft, mirror);
        tickDuelOpponent(world, mirror, dt);
        // Player defeat has precedence; the boss never appears after a lost duel.
        if (world.ended || world.aircraft.currentHp <= 0) return;
        if (!world.destruction) finishMirrorDuel(world);
    }
    if (s.mirrorPhase === "boss_delay" && world.elapsed >= s.bossAt) {
        if (spawnEnemy(world, "boss")) s.mirrorPhase = "boss";
    }
}
export function tickDuelOpponent(world: CombatWorld, mirror: MirrorCombatant, dt: number): void {
        const actor = mirror.context.world;
        actor.elapsed = world.elapsed;
        // Commit player interception/capture against the previous exposed views.
        for (const [id,view] of mirror.outgoing) {
            const index=actor.projectiles.findIndex(p=>p.id===id);
            if(index<0){mirror.outgoing.delete(id);continue;}
            if(!world.projectiles.includes(view)||view.lifetime<=0){recycleProjectile(actor,index);mirror.outgoing.delete(id);}
            else actor.projectiles[index].mirrorSlow=rankProjectileSpeed(world,view,rankHooks)*slowExpansionProjectile(world,view);
        }
        world.projectiles=world.projectiles.filter(p=>!p.mirrorBorrowed);
        const opponent = mirrorPoint(world.playerX, world.playerY);
        mirror.playerTarget.x = opponent.x; mirror.playerTarget.y = opponent.y;
        const current = mirrorPoint(actor.playerX, actor.playerY);
        const decision = updateMirrorAI(world, mirror.ai, mirror.state, current, dt, actor);
        if (!playerStunned(mirror.state) && actor.dashRemaining <= 0) {
            const moved = mirrorPoint(decision.x, decision.y);
            actor.moveDirectionX = -mirror.ai.vx / Math.max(1, Math.hypot(mirror.ai.vx, mirror.ai.vy));
            actor.moveDirectionY = -mirror.ai.vy / Math.max(1, Math.hypot(mirror.ai.vx, mirror.ai.vy));
            const slow = (cinderMovementLocked(actor)?0:1)*Math.min(sylvaMovement(world,mirror.target),argentMovement(world,mirror.target),riptideMovement(world,mirror.target),cinderMovement(world,mirror.target)*rankEnemyMovement(world, mirror.target) * equipmentSlow(world.aircraft, mirror.target));
            const bounded = clampHitboxToGameplayRect(actor.playerX + (moved.x - actor.playerX) * slow, actor.playerY + (moved.y - actor.playerY) * slow, getPlayerHitbox(actor));
            actor.playerX = bounded.x; actor.playerY = bounded.y;
            if (Math.hypot(mirror.ai.vx, mirror.ai.vy) > 1) actor.aircraft.coreState.lastMove = actor.aircraft.coreState.time;
        }
        // Incoming shots are views for interception/decoy/capture hooks. The outer
        // world's hull contact remains the only damage authority for these shots.
        const visible = world.projectiles.filter(p => p.owner !== "enemy" && p.lifetime > 0).slice(0, AIR_COMBAT_WORLD.maxPlayerProjectiles);
        const visibleIds = new Set(visible.map(p => p.id));
        for (const id of mirror.incoming.keys()) if (!visibleIds.has(id)) mirror.incoming.delete(id);
        for (const p of visible) {
            let view = mirror.incoming.get(p.id);
            if (!view) { view = { ...p, id: actor.nextId++, hitIds: [], mirrorBorrowed: true }; mirror.incoming.set(p.id, view); }
            const position = mirrorPoint(p.x,p.y), previous = mirrorPoint(p.previousX,p.previousY);
            Object.assign(view,{...position,previousX:previous.x,previousY:previous.y,vx:mirrorVector(p.vx,p.vy).x,vy:mirrorVector(p.vx,p.vy).y,owner:"enemy",allegiance:"hostile",targetId:PLAYER_TARGET_ID,
                sourceEnemyId:mirror.playerTarget.id,lifetime:p.lifetime,rawDamage:p.rawDamage,homing:p.homing,expansionSlowUntil:p.expansionSlowUntil});
            actor.projectiles.push(view);
        }
        if (decision.skill && castWorldSkill(actor, decision.skill).cast) {
            mirror.ai.lastCast = decision.skill;
            mirror.ai.lastCastAt = world.elapsed;
        }
        tickDuelActor(actor, dt);
        const retained = new Set(actor.projectiles);
        for (const original of visible) {
            const view=mirror.incoming.get(original.id)!;
            if(!retained.has(view) || view.lifetime<=0) {
                const i=world.projectiles.indexOf(original);if(i>=0)recycleProjectile(world,i);mirror.incoming.delete(original.id);
            } else { original.expansionSlowUntil=view.expansionSlowUntil; original.mirrorSlow=rankProjectileSpeed(actor,view,rankHooks)*slowExpansionProjectile(actor,view); }
        }
        actor.projectiles=actor.projectiles.filter(p=>!p.mirrorBorrowed);
        const liveOutgoing = new Set(actor.projectiles.map(p => p.id));
        for (const [id, view] of mirror.outgoing) if (!liveOutgoing.has(id)) {
            world.projectiles = world.projectiles.filter(p => p !== view);
            mirror.outgoing.delete(id);
        }
        for(const p of actor.projectiles){
            let view=mirror.outgoing.get(p.id);
            if(!view){view={...p,id:world.nextId++,hitIds:[],mirrorBorrowed:true};mirror.outgoing.set(p.id,view);}
            const position=mirrorPoint(p.x,p.y),previous=mirrorPoint(p.previousX,p.previousY);
            Object.assign(view,{...position,previousX:previous.x,previousY:previous.y,vx:mirrorVector(p.vx,p.vy).x,vy:mirrorVector(p.vx,p.vy).y,owner:"enemy",allegiance:"hostile",targetId:PLAYER_TARGET_ID,sourceEnemyId:mirror.target.id,lifetime:p.lifetime,rawDamage:p.rawDamage,homing:p.homing});
            if(!world.projectiles.includes(view))world.projectiles.push(view);
        }
        const p = mirrorPoint(actor.playerX, actor.playerY); mirror.target.x = p.x; mirror.target.y = p.y;
}
function finishMirrorDuel(world: CombatWorld): void {
    const s=world.mirage,mirror=s?.mirror;
    if(!s||!mirror||mirror.state.currentHp>0||world.ended||world.aircraft.currentHp<=0)return;
    const actor=mirror.context.world,p=mirrorPoint(actor.playerX,actor.playerY);
    mirageFx(world,"mirrorAircraftDeath",p.x,p.y,110,.85);
    world.enemies=world.enemies.filter(e=>e!==mirror.target);
    world.projectiles=world.projectiles.filter(p=>!p.mirrorBorrowed);
    for(const projectile of world.projectiles)projectile.mirrorSlow=undefined;
    actor.projectiles.length=actor.warnings.length=actor.decoys.length=actor.effectQueue.length=actor.particles.length=0;
    actor.bigBang=undefined;cancelTerra(actor); cancelSylva(actor);cancelRiptide(actor); cancelCinder(actor);
    actor.enemies.length=0;actor.rankRuntime=undefined;actor.astra=undefined;actor.tactical=undefined;
    mirror.incoming.clear();mirror.outgoing.clear();mirror.ai.history.length=0;
    s.mirror=undefined;s.mirrorPhase="boss_delay";s.bossAt=world.elapsed+3;
    mirageFx(world,"bossFracture",GAMEPLAY_SAFE_RECT.left+GAMEPLAY_SAFE_RECT.width/2,GAMEPLAY_SAFE_RECT.top+GAMEPLAY_SAFE_RECT.height/2,640,3);
    const stats=getEffectiveAircraftStats(world.aircraft);
    if(world.aircraft.aircraftId==='riptide')healAircraft(world.aircraft,stats.maxHp*.5);
    else world.aircraft.currentHp=Math.min(stats.maxHp,world.aircraft.currentHp+stats.maxHp*.5);
    world.aircraft.currentResource=Math.min(stats.maxResource,world.aircraft.currentResource+stats.maxResource*.5);
    setMessage(world,"ẢO ẢNH TAN VỠ · PARALLAX ZERO",3);
}

/** Resolve the defender's interception before the attacker's aircraft contact.
 * Transformed views never become another damage authority. */
function interceptAircraftDefenses(attacker:CombatWorld):void {
    const outer=attacker.mirrorContext?attacker.enemies.find(e=>e.aircraftTarget)?.aircraftTarget?.world:attacker;
    const mirror=(outer?.duelOpponent ?? outer?.mirage?.mirror);if(!mirror)return;
    const defender=attacker===outer?mirror.context.world:outer!;
    const mapping=attacker===outer?mirror.incoming:mirror.outgoing;
    const target=attacker===outer?mirror.playerTarget:mirror.target;
    const shots=attacker.projectiles.filter(p=>p.owner!=="enemy"&&!p.mirrorBorrowed&&p.lifetime>0),views:ProjectileEntity[]=[];
    for(const p of shots){
        let view=mapping.get(p.id);
        if(!view){view={...p,id:defender.nextId++,hitIds:[],mirrorBorrowed:true};mapping.set(p.id,view);}
        const id=view.id,slow=view.expansionSlowUntil,position=mirrorPoint(p.x,p.y),previous=mirrorPoint(p.previousX,p.previousY);
        Object.assign(view,p,{id,hitIds:[],mirrorBorrowed:true,...position,previousX:previous.x,previousY:previous.y,
            vx:mirrorVector(p.vx,p.vy).x,vy:mirrorVector(p.vx,p.vy).y,owner:"enemy",allegiance:"hostile",sourceEnemyId:target.id,targetId:PLAYER_TARGET_ID,
            expansionSlowUntil:Math.max(slow??0,p.expansionSlowUntil??0)});
        if(!defender.projectiles.includes(view))defender.projectiles.push(view);
        views.push(view);
    }
    interceptMissiles(defender);captureAstraProjectiles(defender,astraHooks);
    for(const [shotIndex,view] of views.entries()){
        const index=defender.projectiles.indexOf(view);if(index<0)continue;
        if(view.projectileKind!=="bullet"&&view.missileState!=="powered"&&!view.bigBang)continue;
        const touches=(x:number,y:number,radius:number)=>segmentDistance(x,y,view.previousX,view.previousY,view.x,view.y)<=view.radius+radius;
        let absorbed=false;
        if(isHostileBallisticProjectile(view)){
            if(satellitePositions(defender).some(pos=>touches(pos.x,pos.y,8))){
                defender.aircraft.coreState.stacks.satellites--;recordCoreMetric(defender.aircraft,198,"blocked",1);
                absorbed=true;
            }else{
                const decoy=defender.decoys.find(d=>d.active&&touches(d.x,d.y,d.radius));
                if(decoy){onDecoyAbsorb(defender,decoy);absorbed=true;}
            }
        }
        if(!absorbed&&droneCombatActive(defender)&&touches(defender.droneX,defender.droneY,10)){
            hitDrone(defender,view.rawDamage*enemyOutputMultiplier(defender,view.sourceEnemyId));absorbed=true;
        }
        if(absorbed){emitVisual(defender,{kind:"absorb",x:view.x,y:view.y,size:24});recycleProjectile(defender,index);}
        else if(hasCore(defender.aircraft,107) && ordinaryHostileBullet(view)
            && segmentVsAircraft(view.previousX,view.previousY,view.x,view.y,view.radius+8,getPlayerHitbox(defender),projectileContact).hit){
            // Only the owning projectile may settle this candidate on retirement.
            const shot=shots[shotIndex];
            shot.duelGraze ??= { defender, contact:attacker.enemies.some(e=>e.aircraftTarget?.world===defender && shot.hitIds.includes(e.id)) };
        }
    }
    const retained=new Set(defender.projectiles);
    for(let index=0;index<shots.length;index++){
        const p=shots[index],view=views[index];
        if(!retained.has(view)||view.lifetime<=0){
            const own=attacker.projectiles.indexOf(p);if(own>=0)recycleProjectile(attacker,own);mapping.delete(p.id);
        }else p.mirrorSlow=rankProjectileSpeed(defender,view,rankHooks)*slowExpansionProjectile(defender,view);
    }
    if(defender.mirrorContext)defender.projectiles=defender.projectiles.filter(p=>!p.mirrorBorrowed);
}

function aircraftFireRateMultiplier(world:CombatWorld):number {
    const mirror=(world.duelOpponent ?? world.mirage?.mirror);
    if(mirror)return rankEnemyFireRate(mirror.context.world,mirror.playerTarget);
    if(world.mirrorContext){
        const other=world.enemies.find(e=>e.aircraftTarget)?.aircraftTarget?.world;
        const target=(other?.duelOpponent ?? other?.mirage?.mirror)?.target;
        if(other&&target)return rankEnemyFireRate(other,target);
    }
    return 1;
}
export type EnemyProjectileSpeedClass = "standard" | "fan" | "special";
const ENEMY_PROJECTILE_SPEED_MULTIPLIERS = { standard: 1.5, fan: 1.35, special: 1 } as const;
const PLAYER_BASIC_PROJECTILE_SPEED_MULTIPLIER = 2;
export interface ProjectileEntity extends AttackMetadata {
    duelDecoy?: { world: CombatWorld; id: number };
    mirageOrbit?: { ownerId:number; angle:number; radius:number; until:number };
    /** A bounded transformed view, never a second damage authority. */
    mirrorBorrowed?: boolean;
    mirrorSlow?: number;
    enemySpeedClass?: EnemyProjectileSpeedClass;
    rankCast?: number; rankVolley?: number; twinSide?: number; procFree?: boolean; aimBonus?: boolean; echoScale?: number;
    aimCorrectionUntil?: number;
    mainBasicMiss?: boolean;
    extraPierceOrdinal?: number;
    expansionCast?: ExpansionCast; expansionSlowUntil?: number;
    /** Weapon share of pre-Gatling raw damage; inherited by basic derivatives. */
    weaponFraction?: number;
    firedAt?: number;
    sylvaAcidRound?: boolean;
    primaryShot?: { resolved: boolean; afterwashHits?:Set<number>; argentGenesisEligible?:boolean; aimEmpowered?:boolean };
    astraLance?:{later:number;followup?:StellarLancePath};
    mirageVisual?: MirageVisualKey;
    stormbreakerVisual?: StormbreakerVfxKey;
    stormbreakerSalvo?: number;
    stormbreakerSplit?: { at: number; count: number; factor: number; radial: boolean };
    stormbreakerGrace?: Map<number, number>;
    magnetic?: MagneticProjectileState;
    magneticAreaId?: number;
    magneticVisual?: MagneticVfxKey;
    salvoId?: number;
    interceptCount?: number;
    /** Additional cannon pierce keeps the existing same-volley attenuation. */
    corePierce?: boolean; stabilizedPierce?: boolean;
    bounceBasis?: number;
    bounceSecondMultiplier?: number;
    telemetryCore?: number;
    grazeCandidate?:boolean; playerContact?:boolean;
    duelGraze?: { defender: CombatWorld; contact: boolean };
    fuseStarted: boolean;
    fuseRemaining: number;
    id: number;
    owner: "player" | "enemy" | "drone";
    /** Presentation metadata only; collision and damage never consult this field. */
    ammoVisualKey?: AmmoVisualKey;
    appearance?: "dangerous" | "boss";
    /** Critical hostile attacks may replace ordinary bullets when their pool is full. */
    criticalAttack?: boolean;
    suppressive?: boolean;
    allowOffscreenEntry?: boolean;
    corridorEdge?: number; corridorSide?: number;
    source: DamageSource;
    skillId?: SkillId;
    lifetime: number;
    volleyId: number;
    volleyTargets?: Set<number>;
    volleyHits?: Map<number, number>;
    initialDamage: number;
    previousX: number;
    previousY: number;
    bigBang: boolean;
    projectileKind: "bullet" | "missile" | "bigbang" | "boss_missile";
    missileState: "loiter" | "turning" | "powered" | null;
    missileAge: number;
    heading: number;
    angularVelocity: number;
    missileLaunchHeading: number | null;
    speed: number;
    cruiseSpeed: number;
    angularAcceleration: number;
    acceleration: number;
    anchorX: number;
    anchorY: number;
    smokeDistanceAccumulator: number;
    secondarySmokeDistanceAccumulator: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    rawDamage: number;
    homing: boolean;
    targetId: number | null;
    turnRate: number;
    penetrationRemaining: number;
    penetrationMultiplier: number;
    telemetryBonuses?: [number,number][];
    telemetryExtraCores?: number[];
    splashMultiplier: number;
    coreRicochet?: boolean;
    bounceRemaining: number;
    bounceMultiplier: number;
    hitIds: number[];
    color: string;
}
export interface DecoyEntity {
    expansionCast?: ExpansionCast;
    castId: number; volleyId: number; clonePhase?: "linger" | "dash"; dashTarget?: number | null;
    flightAge: number;
    active: boolean;
    id: number;
    x: number;
    y: number;
    radius: number;
    remaining: number;
    life: number;
    originX: number;
    originY: number;
    side: number;
    lane: number;
    clone: boolean;
}
export interface WarningZone extends AttackMetadata {
    victimTimers?:Map<number,number>;
    barrage?: { angles:number[]; index:number; gap:number; next:number };
    elitePattern?: "crimson_barrage" | "iron_suppression" | "acid_bombing" | "radar_bombardment";
    ringSpeed?: number;
    insideTimer?: number;
    droneInsideTimer?: number;
    id: number;
    kind: "elite_barrage" | "enemy_bomb" | "elite_lock" | "boss_strike" | "player_bomb" | "rail" | "acid" | "sonic" | "lane_laser" | "dash" | "emp" | "shock_clamp" | "retaliation";
    safeAngle?: number;
    safeArc?: number;
    ringIndex?: number;
    ringRadius?: number;
    laneIndex?: number;
    laneWidth?: number;
    activeDuration?: number;
    fromX?: number;
    fromY?: number;
    enemyId?: number;
    stage?: "warning" | "active";
    age?: number;
    tick?: number;
    ticksRemaining?: number;
    hitPlayer?: boolean;
    x: number;
    y: number;
    radius: number;
    remaining: number;
    totalDuration: number;
    rawDamage: number;
    owner: "player" | "enemy";
}
export interface ParticleEntity {
    id: number;
    kind: "spark" | "missile_smoke";
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
}
interface RuntimePools {
    enemies: EnemyEntity[];
    projectiles: ProjectileEntity[];
    particles: ParticleEntity[];
    decoys: DecoyEntity[];
}
interface VisualEventBase {
    basicImpact?: boolean;
    tint?: string;
    killTier?: "normal" | "elite" | "boss";
    ultimateEffect?:UltimateVisualKey;
    rankEffect?: RankEffect;
    at?:number;
    skillId?: SkillId;
    directContact?: boolean;
    attachedToPlayer?: boolean;
    missileFamily?: "viper" | "tomahawk" | "bigbang" | "boss";
    id: number;
    x: number;
    y: number;
    size: number;
    entityId?: number;
    boss?: boolean;
    magneticDeath?: boolean;
    fromX?: number;
    fromY?: number;
}
export interface DamageNumberEvent extends VisualEventBase {
    kind: "damage_number";
    provenance?: { source:"cinder_burn"; ownerId:number; targetId:number; session:number };
    genericShieldAbsorbed?: number;
    hpDamage: number;
    shieldAbsorbed: number;
    target: "player" | "enemy";
    critical: boolean;
}
type HealSource = "core" | "skill" | "skill_core";
export type CombatVisualEvent = DamageNumberEvent | (VisualEventBase & {
    kind: "player_heal";
    amount: number;
    healSource: HealSource;
}) | (VisualEventBase & {
    kind: "aircraft_destroyed" | "ultimate_effect" | "rank_effect" | "astra_lance_impact" | "astra_starfall_impact" | "bullet_impact" | "hit" | "explosion" | "bomb" | "player_hit" | "absorb" | "lightning" | "drone_hit" | "missile_impact" | "flare_burst" | "emp_pulse" | "shield_ripple";
});
type NewVisualEvent = CombatVisualEvent extends infer E ? E extends CombatVisualEvent ? Omit<E, "id"> : never : never;
function emitVisual(world: CombatWorld, event: NewVisualEvent): void {
    world.visualEvents.push({ ...event, at:world.elapsed, id: world.nextVisualId++ });
    if (world.visualEvents.length > 96)
        world.visualEvents.shift();
}
export interface TacticalCoreState {
    scraps:{id:number;x:number;y:number;until:number}[];
    grids:{id:number;a:number;b:number;until:number;raw:number;hits:Set<number>}[];
    lastWeaponHit?:{id:number;time:number}; openingHits:Map<number, number>;
    previousStatuses:Set<string>; hackTargets:number[]; hackEnd:number;
    hackMode?: "normal" | "elite" | "boss_stun";
}
export interface CombatWorld {
    bigBang?: BigBangCast;
    destruction?: { at: number; x: number; y: number };
    aftermath?: { remaining: number };
    defeatSummary?: AirCombatRunSummary;
    /** Separate SOLO orchestrator owns the match clock, gates and outcome. */
    duel?: { combatEnabled: boolean; multiplier: number; damageDealt: number; opponent?: CombatWorld; onResolution?: (hpLoss: number) => void };
    duelOpponent?: MirrorCombatant;
    aircraftDamageDepth?: number;
    mirage?: MirageWorldState;
    mirrorContext?: boolean;
    rankRuntime?: RankRuntime;
    playerTargetId?: number;
    dpsSamples?: { at: number; amount: number }[];
    astra?: AstraRuntime;
    stageId: number;
    stage: Omit<AirCombatStageDefinition, "runtime"> & { runtime: AirCombatStageDefinition["runtime"] | "duel" };
    stormbreaker?: StormbreakerWorldState;
    magnetic?: MagneticWorldState;
    stageVictory: boolean;
    stageFirstClear: boolean;
    skillCores: SkillCoreRuntime;
    coreSelectionEvent: CoreSelectionEvent | null;
    nextContinuousHealVisualAt?: number;
    tactical?:TacticalCoreState;

    threats: { enemyId: number; cost: number; until: number }[];
    scheduledAttacks: { allegiance?:Allegiance; at: number; enemyId: number; kind: "needle" | "rail" | "execution" | "clamp" | "retaliation" | "radar_followup" | "acid_cage" | "crimson_barrage" | "iron_suppression" | "acid_bombing" | "radar_bombardment"; control?:boolean; angle?: number; x?: number; y?: number }[];
    eliteSpecials: { enemyId: number; until: number; control: boolean; allegiance:Allegiance }[];
    eliteResolve: number; eliteComboCooldown: number; eliteComboIndex: number; eliteCorridorSide?: -1 | 1;
    aircraft: AircraftCombatState;
    playerX: number;
    playerY: number;
    visualEvents: CombatVisualEvent[];
    nextVisualId: number;
    playerInputActive: boolean;
    /** Legacy compatibility field; aircraft damage and clamps use airCombatHitboxes. */
    playerRadius: number;
    playerInvulnerability: number;
    playerDamageGraceUntil: number;
    droneX: number;
    droneY: number;
    droneTargetId: number | null;
    droneOrbitAngle: number;
    elapsed: number;
    score: number;
    comboKills: number;
    comboTimer: number;
    maxCombo: number;
    enemiesDefeated: number;
    elitesDefeated: number;
    damageDealt: number;
    damageTaken: number;
    hitsReceived: number;
    bossSpawned: boolean;
    bossDefeated: boolean;
    bossStartedAt: number | null;
    bossClearSeconds: number | null;
    bossPhase: number;
    pauseReasons: Set<string>;
    waveIndex: number;
    waveState: "combat" | "countdown" | "announcement";
    waveTimer: number;
    spawnQueue: EnemyType[];
    xpBudgetRemaining: number;
    xpWeightRemaining: number;
    spawnedInWave: number;
    decoyVolleys: number;
    decoyVolleyCd: number;
    droneHp: number;
    droneMaxHp: number;
    droneArmor: number;
    droneInvulnerability: number;
    moveDirectionX: number;
    moveDirectionY: number;
    stationaryAnchorX: number;
    stationaryAnchorY: number;
    dashRemaining: number;
    dashStartX: number;
    dashStartY: number;
    dashEndX: number;
    dashEndY: number;
    laserTicksRemaining: number;
    effectQueue: {
        kind: "explosion" | "lightning";
        target: CoreTarget;
        raw: number;
    }[];
    enemySpawnCooldown: number;
    playerFireCooldown: number;
    droneFireCooldown: number;
    missilesPending: number;
    laserCharge: number;
    laserRemaining: number;
    laserTickCooldown: number;
    nextId: number;
    scroll: number;
    enemies: EnemyEntity[];
    projectiles: ProjectileEntity[];
    decoys: DecoyEntity[];
    warnings: WarningZone[];
    particles: ParticleEntity[];
    pendingCoreSelections: number;
    initialCoreQueued?: boolean;
    coreSelectionCount: number;
    currentCoreChoices: CoreCard[] | null;
    latestMessage: string | null;
    messageUntil: number;
    announcement: CombatAnnouncement;
    ended: boolean;
    pools: RuntimePools;
    random: () => number;
    visualRandom: () => number;
}
const PLAYER_TARGET_ID = 0;
// Applied on every acquisition and recycle, including generic homing/bounce bullets.
const MISSILE_DEFAULTS = {
    magnetic: undefined,
    telemetryCore: undefined, salvoId: undefined, interceptCount: 0, stabilizedPierce: false, bounceBasis: undefined, bounceSecondMultiplier: undefined,
    ammoVisualKey: undefined,
    fuseStarted: false, fuseRemaining: 0,
    projectileKind: "bullet" as const, missileState: null, missileAge: 0,
    heading: 0, angularVelocity: 0, missileLaunchHeading: null, speed: 0, cruiseSpeed: 0,
    angularAcceleration: 0, acceleration: 0, anchorX: 0, anchorY: 0, smokeDistanceAccumulator: 0, secondarySmokeDistanceAccumulator: 0,
};
function circleHit(ax: number, ay: number, ar: number, bx: number, by: number, br: number): boolean {
    const dx = ax - bx;
    const dy = ay - by;
    const radius = ar + br;
    return dx * dx + dy * dy <= radius * radius;
}
function setMessage(world: CombatWorld, message: string, _seconds = 3): void {
    // Keep hook signatures compatible; every transient notice now has one duration.
    publishCombatNotice(world, message);
}
export function createCombatRandom(seed = Date.now() >>> 0): () => number {
    return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 0x100000000; };
}
export function createCombatWorld(aircraftId: AircraftId, random: () => number = createCombatRandom(), stageId: number = 1): CombatWorld {
    return createAircraftWorld(aircraftId, random, stageId, false);
}
export function createDuelCombatWorld(aircraftId: AircraftId, random: () => number): CombatWorld {
    const world = createAircraftWorld(aircraftId, random, 0, true);
    world.duel = { combatEnabled: false, multiplier: 1, damageDealt: 0 };
    world.aircraft.duel = { selectionLevel: 1, healingBlocked: false };
    world.initialCoreQueued = true;
    return world;
}
function createAircraftWorld(aircraftId: AircraftId, random: () => number, stageId: number, solo: boolean): CombatWorld {
    if (!solo) assertStageLaunch(stageId);
    // Inert presentation metadata for combat primitives, absent from the Campaign catalog.
    const stage: CombatWorld["stage"] = solo ? {id:0,key:"solo",displayName:"SOLO 1v1",localizedName:"SOLO 1v1",shortDescription:"",bossName:"",unlockAfterStage:null,theme:"SOLO",accent:"#cbd5e1",available:true,runtime:"duel",waves:[]} : getAirCombatStage(stageId)!;
    // Separate deterministic stream: visual density must never consume combat rolls.
    let visualSeed = 0x41c6ce57;
    const visualRandom = () => {
        visualSeed = (Math.imul(visualSeed, 1664525) + 1013904223) >>> 0;
        return visualSeed / 0x100000000;
    };
    const initial = clampCircleToGameplayRect(AIR_COMBAT_WORLD.width / 2, GAMEPLAY_SAFE_RECT.bottom - 52, 10);
    const droneInitial = clampCircleToGameplayRect(initial.x - 28, initial.y + 8, 9);
    const spawnQueue = solo ? [] : createWaveQueue(0, random, stage.waves);
    return {
        stageId, stage, mirage: stage.runtime === "mirage" ? createMirageState() : undefined, stageVictory: false, stageFirstClear: false, stormbreaker: stage.runtime === "stormbreaker" ? createStormbreakerState() : undefined, magnetic: stage.runtime === "magnetic" ? { mines: [] } : undefined,
        skillCores: createSkillCoreRuntime(), coreSelectionEvent: null,
        threats: [], scheduledAttacks: [], eliteSpecials: [], eliteResolve:0, eliteComboCooldown:9, eliteComboIndex:0,
        aircraft: createAircraftCombatState(aircraftId, stageId === 4),
        playerX: initial.x,
        playerY: initial.y,
        visualEvents: [],
        nextVisualId: 1,
        playerInputActive: false,
        playerRadius: 9,
        playerInvulnerability: 0, playerDamageGraceUntil: 0,
        droneX: droneInitial.x,
        droneY: droneInitial.y,
        droneTargetId: null,
        droneOrbitAngle: 0,
        elapsed: 0,
        score: 0,
        comboKills: 0,
        comboTimer: 0,
        maxCombo: 0,
        enemiesDefeated: 0,
        elitesDefeated: 0,
        damageDealt: 0,
        damageTaken: 0,
        hitsReceived: 0,
        bossSpawned: false,
        bossDefeated: false,
        bossStartedAt: null,
        bossClearSeconds: null,
        bossPhase: 0,
        pauseReasons: new Set(), waveIndex: 0, waveState: solo ? "combat" : "announcement", waveTimer: 1.15, spawnQueue, spawnedInWave: 0,
        xpBudgetRemaining: solo ? 0 : stage.waves[0].xpBudget,
        xpWeightRemaining: spawnQueue.reduce((sum, type) => sum + ENEMY_CONFIGS[type].combatXp, 0),
        decoyVolleys: 0, decoyVolleyCd: 0, droneHp: 0, droneMaxHp: 0, droneArmor: 0, droneInvulnerability: 0,
        moveDirectionX: 0, moveDirectionY: -1, stationaryAnchorX: initial.x, stationaryAnchorY: initial.y, dashRemaining: 0, dashStartX: 0, dashStartY: 0, dashEndX: 0, dashEndY: 0,
        laserTicksRemaining: 0, effectQueue: [],
        enemySpawnCooldown: 0.55,
        playerFireCooldown: 0,
        droneFireCooldown: 0,
        missilesPending: 0,
        laserCharge: 0,
        laserRemaining: 0,
        laserTickCooldown: 0,
        nextId: 1,
        scroll: 0,
        enemies: [],
        projectiles: [],
        decoys: [],
        warnings: [],
        particles: [],
        pendingCoreSelections: 0,
        coreSelectionCount: 0,
        currentCoreChoices: null,
        latestMessage: "ĐỢT 1",
        messageUntil: COMBAT_NOTICE_DURATION_MS / 1000,
        announcement: createCombatNotice(1, "ĐỢT 1"),
        ended: false,
        pools: { enemies: [], projectiles: [], particles: [], decoys: [] },
        random,
        visualRandom,
    };
}
function acquireEnemy(world: CombatWorld): EnemyEntity {
    return world.pools.enemies.pop() || {
        id: 0,
        type: "scout",
        x: 0,
        y: 0,
        baseX: 0,
        vx: 0,
        vy: 0,
        radius: 0,
        hp: 0,
        maxHp: 0,
        armor: 0,
        age: 0,
        fireCooldown: 0,
        phaseSeed: 0,
        wave: 1,
        dashCharge: 0, xp: 0, damageScale: 1, eliteWave: 0, stun: 0, burn: 0, burnDamage: 0, burnTick: 0, weakReadyAt: 0, weakDebuffUntil: 0, burnArmorUntil: 0, weakHits: 0, weakUntil: 0, lightningUntil: 0,
        shield: 0, shieldUntil: 0, shieldSource: 0, abilityCd: 0, secondaryCd: 0, tertiaryCd: 0, burst: 0, burstCd: 0, burstAngle: 0, burstAllegiance:undefined, secondaryAllegiance:undefined, recoveryAllegiance:undefined, attackCount: 0,
        targetId: null, deathHandled: false, dashRemaining: 0, dashStartX: 0, dashStartY: 0, dashEndX: 0, dashEndY: 0, hackedFacing:undefined,hackedTargetId:undefined,riftAttackReadyAt:undefined,riftWait:undefined,bodyHitAt:undefined,inheritedAllegiance:undefined,attackAllegiance:undefined,hackedUntil: 0, dashAllegiance: undefined, dashCommitted: false, skillLockedUntil:0, armorBrokenUntil:0, combatMarks:{}, aegisUntil: 0, aegisReady: 0, recentDamage: [],
    };
}
function recycleEnemy(world: CombatWorld, index: number): void {
    freezeAstraTarget(world,world.enemies[index]);
    const [enemy] = world.enemies.splice(index, 1);
    if (enemy) {
        world.threats = world.threats.filter(t => t.enemyId !== enemy.id);
        world.skillCores.enemyEffects.delete(enemy.id);
        world.tactical?.openingHits.delete(enemy.id);
        world.skillCores.syncLockouts.delete(enemy.id);
    if(world.skillCores.syncTarget===enemy.id){world.skillCores.syncTarget=null;world.skillCores.syncUntil=0;}
    }
    if (enemy && world.pools.enemies.length < AIR_COMBAT_WORLD.maxEnemies) {
        world.pools.enemies.push(enemy);
    }
}
function acquireProjectile(world: CombatWorld): ProjectileEntity {
    return world.pools.projectiles.pop() || {
        ...MISSILE_DEFAULTS,
        id: 0,
        owner: "player",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 0,
        rawDamage: 0,
        homing: false,
        targetId: null,
        turnRate: 0,
        penetrationRemaining: 0,
        penetrationMultiplier: 0,
        splashMultiplier: 0,
        bounceRemaining: 0,
        bounceMultiplier: 0,
        hitIds: [], source: "weapon", lifetime: 6, volleyId: 0, initialDamage: 0, previousX: 0, previousY: 0, bigBang: false,
        color: "#fff",
    };
}
function awardProjectileGraze(world: CombatWorld): void {
    if(world.ended || world.aftermath || world.destruction || world.aircraft.currentHp<=0 || !hasCore(world.aircraft,107))return;
    const c=world.aircraft.coreState;
    if((c.timers.grazeReady??0)>c.time)return;c.timers.grazeReady=c.time+.15;
    c.stacks.graze=(c.stacks.graze??0)+1;recordCoreMetric(world.aircraft,107,"grazes",1);
    if(c.stacks.graze>=4){
        c.stacks.graze-=4;
        const max=getEffectiveAircraftStats(world.aircraft).maxResource,restored=Math.min(max-world.aircraft.currentResource,max*.12);
        const sh=createAbsorbShield(world.aircraft,"grazeGuard",getEffectiveAircraftStats(world.aircraft).maxHp*.04,3);sh.coreRow=107;recordCoreMetric(world.aircraft,107,"shieldCreated",sh.amount);
        world.aircraft.currentResource+=restored;recordCoreMetric(world.aircraft,107,"resource",restored);setMessage(world,"GRAZE · +12% tài nguyên",.8);
    }
}
function recycleProjectile(world: CombatWorld, index: number): void {
    const [projectile] = world.projectiles.splice(index, 1);
    if(projectile?.mirrorBorrowed)return;
    if(projectile)clearMissilePose(projectile);
    if(!world.aftermath && !world.destruction && projectile?.astraLance && !projectile.procFree && projectile.skillId==="stellar_lance")endAircraftSkill(world.aircraft,"stellar_lance");
    if (projectile?.salvoId) world.skillCores.salvos.find(s => s.id === projectile.salvoId)?.live.delete(projectile.id);
    // Award only when the projectile is retired: it can no longer hit later.
    if(projectile?.grazeCandidate && !projectile.playerContact)awardProjectileGraze(world);
    if(projectile?.duelGraze && !projectile.duelGraze.contact)awardProjectileGraze(projectile.duelGraze.defender);
    if(projectile)projectile.duelGraze=undefined;
    if (projectile && world.pools.projectiles.length < 768) {
        projectile.hitIds.length = 0;
        Object.assign(projectile, MISSILE_DEFAULTS, { targetId: null, duelDecoy: undefined, homing: false, bigBang: false, turnRate: 0, lifetime: 0 });
        world.pools.projectiles.push(projectile);
    }
}
function acquireParticle(world: CombatWorld): ParticleEntity {
    return world.pools.particles.pop() || {
        id: 0, kind: "spark",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0,
        size: 0,
        color: "#fff",
    };
}
function recycleParticle(world: CombatWorld, index: number): void {
    const [particle] = world.particles.splice(index, 1);
    if (particle && world.pools.particles.length < AIR_COMBAT_WORLD.maxParticles) {
        world.pools.particles.push(particle);
    }
}
function addParticles(world: CombatWorld, x: number, y: number, color: string, amount: number): void {
    const available = Math.max(0, AIR_COMBAT_WORLD.maxParticles - world.particles.length);
    for (let index = 0; index < Math.min(amount, available); index++) {
        const particle = acquireParticle(world);
        const angle = world.visualRandom() * Math.PI * 2;
        const speed = 30 + world.visualRandom() * 85;
        const life = 0.22 + world.visualRandom() * 0.34;
        Object.assign(particle, {
            id: world.nextVisualId++, kind: "spark",
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life,
            maxLife: life,
            size: 1.2 + world.visualRandom() * 3.2,
            color,
        });
        world.particles.push(particle);
    }
}
function spawnEnemy(world: CombatWorld, type: EnemyType, auxiliary = false): EnemyEntity | null {
    if ((type === "magnetic_leech" || type === "swarm_carrier" || type === "micro_drone") &&
        world.enemies.filter(e => e.type === type && e.hp > 0).length >= (type === "micro_drone" ? 12 : 5)) return null;
    if (world.enemies.length >= AIR_COMBAT_WORLD.maxEnemies)
        return null;
    const config = stageEnemyConfig(type, world.stageId), wave = world.stage.waves[world.waveIndex], enemy = acquireEnemy(world);
    const exactMagneticDurability = world.stageId === 2 && (isElite(type) || type === "satellite" || (auxiliary && type === "kamikaze"));
    const exactDurability = (world.stage.runtime === "mirage" && (isElite(type) || type === "boss")) || exactMagneticDurability || world.stage.runtime === "stormbreaker" && (isElite(type) || type === "boss" || type === "omega_storm_node" || type === "storm_conductor");
    const hpScale = wave.normalPower ?? (exactDurability ? 1 : wave.hp), armorScale = wave.normalPower ?? (exactDurability ? 1 : wave.armor);
    // Stage 2 rewards are exact per kill, independent of archetype weights.
    const xp = auxiliary || type === "boss" || type === "satellite" || type === "micro_drone" ? 0
        : wave.xpPerKill ?? (world.spawnQueue.length === 1 ? world.xpBudgetRemaining
        : Math.min(world.xpBudgetRemaining, Math.round(world.xpBudgetRemaining * config.combatXp / Math.max(1, world.xpWeightRemaining))));
    world.xpBudgetRemaining -= xp;
    if (!auxiliary) world.xpWeightRemaining = Math.max(0, world.xpWeightRemaining - config.combatXp);
    const x = GAMEPLAY_SAFE_RECT.left + config.radius + world.random() * (GAMEPLAY_SAFE_RECT.width - config.radius * 2);
    Object.assign(enemy, { aircraftTarget: undefined, mirage: undefined, expansionMarks: undefined, expansionKillingHit: undefined, burnCast: undefined, auxiliary, noWaveWait: false, rewardless: auxiliary, killProcEligible: !auxiliary || type === "satellite", expiresAt: auxiliary && type === "kamikaze" ? world.elapsed + 20 : undefined, magnetic: undefined, stormbreaker: undefined, id: world.nextId++, type, x, y: GAMEPLAY_SAFE_RECT.top + config.radius, baseX: x, vx: 0, vy: config.speed, radius: config.radius,
        hp: config.baseHp * hpScale, maxHp: config.baseHp * hpScale, armor: config.baseArmor * armorScale, age: 0, fireCooldown: 1.2 + world.random() * .8,
        phaseSeed: world.random() * Math.PI * 2, wave: wave.normal, dashCharge: 1.2, xp,
        damageScale: wave.damage, eliteWave: wave.elite, stun: 0, burn: 0, burnDamage: 0, burnTick: 0, weakReadyAt: 0, weakDebuffUntil: 0, burnArmorUntil: 0, weakHits: 0, weakUntil: 0, lightningUntil: 0,
        shield: 0, shieldUntil: 0, shieldSource: 0, abilityCd: type === "jammer" ? 4.5 : type === "iron_fortress" ? 10 : 7.5, secondaryCd: 10, tertiaryCd: 10,
        burst: 0, burstCd: 0, burstAngle: 0, burstAllegiance:undefined, secondaryAllegiance:undefined, recoveryAllegiance:undefined, attackCount: 0, targetId: null, deathHandled: false, dashRemaining: 0, dashStartX: 0, dashStartY: 0, dashEndX: 0, dashEndY: 0,
        riftAttackReadyAt:undefined,riftWait:undefined,bodyHitAt:undefined,inheritedAllegiance:undefined,attackAllegiance:undefined,hackedUntil: 0, dashAllegiance: undefined, dashCommitted: false, skillLockedUntil:0, armorBrokenUntil:0, combatMarks:{}, aegisUntil: 0, aegisReady: 0, bossAttack: undefined, kamikazeState: type === "kamikaze" ? "approach" : undefined, lockedX: 0, lockedY: 0, dashDirX: 0, dashDirY: 1, dashTravelled: 0, dashPlannedDistance: 0, stateTimer: 0, attackAge: 0, missedDashCount: 0, airframeRotation: Math.PI, hitResolved: false, executionRecovery: 0, retaliationReady: false, elitePatternCd:type==="elite"?7.8:type==="iron_fortress"?8.5:8, elitePatternIndex:0, eliteSequenceUntil:0 });
    if(type==="kamikaze") {const point=clampHitboxToGameplayRect(enemy.x,enemy.y,getEnemyHitbox(enemy),true);enemy.x=point.x;enemy.y=point.y;}
    enemy.recentDamage.length = 0;
    if (type === "elite" || type === "radar_hunter") enemy.secondaryCd = Infinity;
    if (type === "boss") {
        enemy.x = AIR_COMBAT_WORLD.width / 2;
        enemy.baseX = enemy.x;
        enemy.y = bossMinCenterY(enemy.radius) + 8;
        world.bossSpawned = true;
        world.bossStartedAt = world.elapsed;
        world.bossPhase = 1;
        if (world.stage.runtime === "leviathan") enemy.bossAttack = { majorAttack: null, majorCooldown: 9, majorAge: 0, sequenceStep: 0,
            fanCount: 0, missilesPending: 0, missileIndex: 0, missileCooldown: 0,
            missileTuning: getBossTuning(1), dashDamage: 0, dashHitPlayer: false };
        setMessage(world, world.stage.bossName.toUpperCase(), 2.5);
    }
    if (world.magnetic) enemy.magnetic = { clock: 0, attack: 0, anchorX: enemy.x, anchorY: enemy.y, angle: enemy.phaseSeed };
    if (world.stormbreaker) initializeStormEnemy(world, enemy);
    if (world.mirage) initializeMirageEnemy(world, enemy);
    world.enemies.push(enemy);
    if (world.magnetic && type === "boss") initializeTempestGuardians(world, enemy, magneticHooks);
    return enemy;
}
function addProjectile(world: CombatWorld, values: Partial<ProjectileEntity> & Pick<ProjectileEntity, "owner" | "x" | "y" | "vx" | "vy" | "rawDamage">): ProjectileEntity | null {
    const ownerCount = world.projectiles.reduce((count, projectile) => {
        const sharesPool = values.owner === "enemy"
            ? projectile.owner === "enemy"
            : projectile.owner !== "enemy";
        return count + (sharesPool ? 1 : 0);
    }, 0);
    const limit = values.owner === "enemy"
        ? AIR_COMBAT_WORLD.maxEnemyProjectiles
        : AIR_COMBAT_WORLD.maxPlayerProjectiles;
    if (ownerCount >= limit) {
        // Preserve rail/homing/boss shots by recycling an ordinary hostile bullet first.
        const replace = values.owner === "player" && (values.skillId==="orbit_reversal"||values.skillId==="stellar_lance")
            ? world.projectiles.findIndex(p=>p.owner==="player"&&p.source==="basic")
            : values.owner === "enemy" && values.criticalAttack
            ? (world.projectiles.findIndex(p => p.suppressive) >= 0 ? world.projectiles.findIndex(p => p.suppressive) : world.projectiles.findIndex(p => p.owner === "enemy" && !p.criticalAttack && !p.homing)) : -1;
        // Captured ammunition is already earned. Permit its bounded release reserve
        // when the normal pool contains only other special shots; never discard it.
        if (replace < 0 && !(values.owner==="player" && values.skillId==="orbit_reversal")) return null;
        if (replace >= 0) recycleProjectile(world, replace);
    }
    // Call sites classify the authored volley; special shots opt out by default.
    const speedMultiplier = values.owner === "enemy" ? ENEMY_PROJECTILE_SPEED_MULTIPLIERS[values.enemySpeedClass ?? "special"] : 1;
    const projectile = acquireProjectile(world);
    Object.assign(projectile, {
        ...MISSILE_DEFAULTS,
        id: world.nextId++,
        owner: values.owner,
        allegiance: values.allegiance ?? (values.owner === "enemy" ? enemyAllegiance(world,world.enemies.find(e=>e.id===values.sourceEnemyId)) : "player"),
        // Capability follows delivery, never Boss origin; capture checks live allegiance.
        expansionCast: values.expansionCast ?? (values.skillId ? expansionState(world.aircraft).casts[values.skillId] : undefined), expansionSlowUntil: undefined, primaryShot: values.primaryShot, weaponFraction:values.weaponFraction, firedAt:values.firedAt, sylvaAcidRound:values.sylvaAcidRound,
        rankCast:values.rankCast, rankVolley:values.rankVolley, twinSide:values.twinSide, procFree:values.procFree, aimBonus:false, echoScale:values.echoScale,
        mainBasicMiss:false, aimCorrectionUntil:undefined, extraPierceOrdinal:undefined, astraLance:undefined, capturable:values.capturable??((values.delivery??"direct_projectile")==="direct_projectile"),
        delivery:values.delivery??"direct_projectile", grazeCandidate:false, playerContact:false, duelGraze:undefined,
        mirrorBorrowed: undefined, mirrorSlow: undefined, mirageOrbit: values.mirageOrbit, mirageVisual: values.mirageVisual, stormbreakerVisual: values.stormbreakerVisual, stormbreakerSalvo: values.stormbreakerSalvo, stormbreakerSplit: values.stormbreakerSplit, stormbreakerGrace: values.stormbreakerGrace,
        magneticVisual: values.magneticVisual, magneticAreaId: values.magneticAreaId, appearance: values.appearance, ammoVisualKey: values.ammoVisualKey,
        sourceEnemyId: values.sourceEnemyId, sourceEnemyType: values.sourceEnemyType, attackTag: values.attackTag, majorBossAttack: values.majorBossAttack, payload: values.payload,
        criticalAttack: values.criticalAttack ?? false,
        suppressive: values.suppressive ?? false, allowOffscreenEntry: values.allowOffscreenEntry ?? false, corridorEdge: values.corridorEdge, corridorSide: values.corridorSide,
        telemetryCore: values.telemetryCore, salvoId: values.salvoId, interceptCount: 0, corePierce: values.corePierce, stabilizedPierce: values.stabilizedPierce,
        bounceBasis: values.bounceBasis, bounceSecondMultiplier: values.bounceSecondMultiplier,
        source: values.source ?? "weapon", skillId: values.skillId, lifetime: values.lifetime ?? 6,
        volleyId: values.volleyId ?? 0, volleyTargets:values.volleyTargets, volleyHits: values.volleyHits, initialDamage: values.initialDamage ?? values.rawDamage,
        previousX: values.x, previousY: values.y, bigBang: values.bigBang ?? false,
        x: values.x,
        y: values.y,
        enemySpeedClass: values.enemySpeedClass,
        vx: values.vx * speedMultiplier,
        vy: values.vy * speedMultiplier,
        radius: (values.radius ?? 3) * (values.owner === "enemy" && world.stageId === 2 ? 1.4 : 1),
        rawDamage: values.rawDamage,
        homing: values.homing ?? false,
        targetId: values.targetId ?? null,
        turnRate: values.turnRate ?? 0,
        penetrationRemaining: values.penetrationRemaining ?? 0,
        penetrationMultiplier: values.penetrationMultiplier ?? 0,
        telemetryBonuses: values.telemetryBonuses, telemetryExtraCores: values.telemetryExtraCores,
        splashMultiplier: values.splashMultiplier ?? 0,
        coreRicochet: values.coreRicochet ?? false,
        bounceRemaining: values.bounceRemaining ?? 0,
        bounceMultiplier: values.bounceMultiplier ?? 0,
        color: values.color ?? (values.owner === "enemy" ? "#fb7185" : "#67e8f9"),
    });
    if (values.projectileKind === "missile") {
        Object.assign(projectile, {
            projectileKind: values.projectileKind, missileState: "loiter", targetId: null, homing: false,
            heading: Math.atan2(values.vy, values.vx), cruiseSpeed: Math.hypot(values.vx, values.vy),
            turnRate: values.turnRate ?? 3.2,
            angularAcceleration: values.skillId === "missile_swarm" ? 12 : 10,
            acceleration: values.skillId === "missile_swarm" ? 600 : 300,
            anchorX: values.anchorX ?? values.x - world.playerX,
            anchorY: values.anchorY ?? values.y - world.playerY,
            vx: 0, vy: 0,
        });
    }
    // Predator Lock / Radar Lock keep their immediate launch and bullet collision
    // classification, but share finite steering and presentation with other missiles.
    if(isImmediateMissile(projectile))Object.assign(projectile,{
        heading:Math.atan2(projectile.vy,projectile.vx),angularAcceleration:values.skillId==="predator_lock"?12:4,missileState:"powered",
        speed:Math.hypot(projectile.vx,projectile.vy),cruiseSpeed:Math.hypot(projectile.vx,projectile.vy),
    });
    projectile.hitIds.length = 0;
    if(projectile.allegiance==="friendly_hacked")projectile.color="#67e8f9";
    world.projectiles.push(projectile);
    const ultimateEffect:UltimateVisualKey|undefined=values.skillId==="missile_swarm"?"ultimateViperLaunch":values.skillId==="sweeping_cannon"?"ultimateTitanMuzzle":undefined;
    if(ultimateEffect)emitVisual(world,{kind:"ultimate_effect",ultimateEffect,x:values.x,y:values.y,size:values.skillId==="sweeping_cannon"?(skillRank(world.aircraft,"sweeping_cannon")>=2?29:23):29});
    return projectile;
}
function nearestEnemy(world: CombatWorld, x: number, y: number, excludedIds: readonly number[] = [], priority = false): EnemyEntity | null {
    let selected: EnemyEntity | null = null;
    let best = Number.POSITIVE_INFINITY;
    for (const enemy of world.enemies) {
        if (excludedIds.includes(enemy.id) || !isHostileToPlayer(world,enemy) || !canTargetEnemy(world,enemy))
            continue;
        const distance = Math.hypot(enemy.x - x, enemy.y - y);
        const score = priority ? getTargetPriority(enemy.type) * 10000 + distance : distance;
        if (score < best) {
            selected = enemy;
            best = score;
        }
    }
    return selected;
}
function playerProjectileColor(aircraftId: AircraftId, empowered: boolean): string {
    if(aircraftId === "cinder")return empowered?"#fff1af":"#ff6418";
    if (aircraftId === "breaker")
        return empowered ? "#fde68a" : "#fb923c";
    if (aircraftId === "phantom")
        return empowered ? "#ddd6fe" : "#a78bfa";
    return empowered ? "#bae6fd" : "#22d3ee";
}
function fireBasic(world: CombatWorld, firedAt = world.elapsed): boolean {
    if(world.projectiles.filter(p=>p.owner!=="enemy").length>=AIR_COMBAT_WORLD.maxPlayerProjectiles)return false;
    const state = world.aircraft, stats = getEffectiveAircraftStats(state);
    state.basicShotsFired++;
    const reappearance = (state.coreState.timers.reappearanceBuff || 0) > state.coreState.time;
    if(reappearance)recordCoreMetric(state,142,"shots",1);
    const primaryShot = { resolved: false, aimEmpowered: !!releaseState(state).aimReady, argentGenesisEligible: !argentArrayActive(world,firedAt) };
    let mainSpawned = false;
    const bulletSpeed = playerBasicProjectileSpeed(state);
    const context = coreContext(world);
    dispatchCoreEvent("basic", context);
    const syncShot=hasCore(state,1)&&!!state.coreState.stacks.syncReady;
    const primaryOnlyMultiplier=(syncShot?1.4:1)*(hasCore(state,59)&&state.basicShotsFired%5===0?2.25:1);
    if(syncShot){context.rawMultiplier*=1.4;state.coreState.stacks.syncReady=0;recordCoreMetric(state,1,"procs",1);}
    const sweeping = (state.activeEffects.sweeping_cannon || 0) > 0;
    const afterburner = (state.activeEffects.afterburner || 0) > 0;
    const multipliers = resolveBasicProjectileMultipliers(state, state.basicShotsFired);
    const volleyId = world.nextId++, volleyHits = sweeping ? new Map<number, number>() : undefined;
    const source: DamageSource = "basic";
    const spawn = (multiplier: number, offset: number, extra = false) => {
        const isPrimary=!extra&&(offset===0||state.aircraftId==="riptide"||state.aircraftId==="argent");
        const shotMultiplier=context.rawMultiplier/(isPrimary?1:primaryOnlyMultiplier);
        const target=extra?nearestEnemy(world,world.playerX,world.playerY,[],true):null;
        const angle = extra ? target?Math.atan2(target.y-(world.playerY-17*playerAirframeScale(world.aircraft)),target.x-world.playerX):-Math.PI/2 : -Math.PI / 2 + offset * (sweeping ? ((skillRank(state, "sweeping_cannon") >= 3)?3.5*Math.PI/180:Math.PI/36) : 0.06);
        const ricochet = hasCore(state, 80) && world.random() < .50;
        const spawned=addProjectile(world, { owner: "player", sylvaAcidRound:state.aircraftId==='sylva', primaryShot: isPrimary ? primaryShot : undefined, source: extra ? "basic" : source, ammoVisualKey: BASIC_AMMO_KEYS[state.aircraftId], skillId: sweeping && !extra ? "sweeping_cannon" : undefined,
            x: world.playerX + (extra?0:offset*4)*playerAirframeScale(state), y: world.playerY - 17*playerAirframeScale(world.aircraft), vx: Math.cos(angle) * bulletSpeed * (sweeping && !extra && (skillRank(state, "sweeping_cannon") >= 3) ? 1 + V.cannonSpeedBonus : 1), vy: Math.sin(angle) * bulletSpeed * (sweeping && !extra && (skillRank(state, "sweeping_cannon") >= 3) ? 1 + V.cannonSpeedBonus : 1), radius: 3.2,
            weaponFraction: 1 / Math.max(Number.EPSILON, shotMultiplier * (reappearance ? V.reappearanceDamage : 1)), firedAt,
            rawDamage: stats.firepower * multiplier * shotMultiplier * (reappearance ? V.reappearanceDamage : 1), volleyId, volleyHits: extra ? undefined : volleyHits,
            penetrationRemaining: (isPrimary && hasCore(state,59)&&state.basicShotsFired%5===0 ? 1 : 0) + (!extra && hasCore(state,206) ? 1 : 0) + (!extra && hasCore(state, 89) ? Infinity : 0) + (!extra && expansionActive(state,"overloadedBarrel") ? 1 : 0) + (sweeping && !extra && (skillRank(state, "sweeping_cannon") >= 3) ? 2 : 0),
            corePierce: !extra && hasCore(state,89), stabilizedPierce: sweeping && !extra && (skillRank(state, "sweeping_cannon") >= 3), telemetryCore:extra?79:undefined,
            telemetryBonuses: basicTelemetryBonuses(state,sweeping,extra,reappearance),
            extraPierceOrdinal: !extra&&hasCore(state,206)?2+(hasCore(state,89)?3:0)+(sweeping&&(skillRank(state, "sweeping_cannon") >= 3)?2:0):undefined,
            telemetryExtraCores:sweeping&&!extra&&(skillRank(state, "sweeping_cannon") >= 2)&&Math.abs(offset)===4?[36]:undefined,
            bounceBasis: stats.firepower * multiplier * shotMultiplier * (reappearance?V.reappearanceDamage:1),
            bounceSecondMultiplier: afterburner && (skillRank(state, "afterburner") >= 4) ? V.bounceSecond : undefined,
            coreRicochet: ricochet, bounceRemaining: afterburner ? 2 : 0, bounceMultiplier: afterburner ? (skillRank(state, "afterburner") >= 4) ? V.bounceFirst : B.bounceFirst : .60,
            color: playerProjectileColor(state.aircraftId, multiplier > 1.1) });
        if(spawned){
            if(!extra)mainSpawned=true;
            if(!extra)echoTwinShot(world,spawned,rankHooks);
            if(isPrimary && hasCore(state,210)) {
                spawned.mainBasicMiss=true;spawned.aimCorrectionUntil=world.elapsed+.6;
                const release=releaseState(state);
                if(primaryShot.aimEmpowered){spawned.aimCorrectionUntil=world.elapsed+.6;spawned.vx*=1.30;spawned.vy*=1.30;spawned.aimBonus=true;}
            }
            if(extra)recordCoreMetric(state,79,"extraProjectiles",1);
            if(spawned.telemetryExtraCores?.includes(36))recordCoreMetric(state,36,"extraProjectiles",1);
            recordCoreMetric(state,111,"shots",1);
            if(afterburner)recordCoreMetric(state,23,"shots",1);
        }
    };
    multipliers.forEach((multiplier, i) => spawn(multiplier, i - (multipliers.length - 1) / 2));
    if(mainSpawned&&primaryShot.aimEmpowered){const r=releaseState(state);r.aimShots=Math.max(0,(r.aimShots??3)-1);r.aimReady=r.aimShots>0;}
    if (mainSpawned) recordCoreMetric(state,229,"shots",1);
    if (mainSpawned) {sylvaMuzzle(world);if(state.aircraftId==='terra')terraFx(world,'muzzle',world.playerX,world.playerY-20,25,.13);}
    if (mainSpawned) argentPrimaryFired(world,primaryShot,argentHooks,firedAt);
    if (context.extraShot)
        spawn(context.extraShot, 1, true);
    addHeat(world,.06,"heatBasic");
    return mainSpawned;
}
function tickBasicFire(world:CombatWorld,dt:number):void {
    const state=world.aircraft;
    const allowed=state.currentHp>0&&(!playerStunned(state)||hasCore(state,203))&&shouldAutoFire(state);
    if(!allowed){world.playerFireCooldown=Math.max(0,world.playerFireCooldown);return;}
    const rate=getEffectiveAircraftStats(state).fireRate, speed=aircraftFireRateMultiplier(world);
    if(!Number.isFinite(rate)||rate<=0||!Number.isFinite(speed)||speed<=0)return;
    const interval=1/rate;
    world.playerFireCooldown=Math.max(0,world.playerFireCooldown)-dt*speed;
    while(world.playerFireCooldown<=0){
        const at=Math.max(world.elapsed-dt,world.elapsed+world.playerFireCooldown/speed);
        const fired=fireBasic(world,at);
        world.playerFireCooldown+=interval;
        if(!fired){world.playerFireCooldown=interval;break;}
    }
}
function fireDrone(world: CombatWorld): void {
    const target = preferredDuelDecoy(world) ?? world.enemies.find(e => e.id === world.droneTargetId && isHostileToPlayer(world,e) && canTargetEnemy(world,e)) ?? nearestEnemy(world, world.droneX, world.droneY, [], true);
    if (!target)
        return;
    world.droneTargetId = "world" in target ? null : target.id;
    const stats = getEffectiveAircraftStats(world.aircraft), ratio = getSkillRuntimeValues(world.aircraft, "escort_drone").damageMultiplier;
    const angle = Math.atan2(target.y - world.droneY, target.x - world.droneX);
    addProjectile(world, { owner: "drone", source: "skill", skillId: "escort_drone", x: world.droneX, y: world.droneY,
        vx: Math.cos(angle) * playerBasicProjectileSpeed(world.aircraft), vy: Math.sin(angle) * playerBasicProjectileSpeed(world.aircraft), rawDamage: stats.firepower * ratio, radius: HAWKEYE_PROJECTILE_RADIUS, color: "#d8b4fe" });
}
function chooseEnemyTarget(world: CombatWorld, homing: boolean, attacker?:EnemyEntity): number | null {
    if(attacker && enemyAllegiance(world,attacker)==="friendly_hacked"){
        const target=nearestEnemy(world,attacker.x,attacker.y,[attacker.id],true);attacker.hackedTargetId=target?.id;
        if(target&&!(attacker.type==="kamikaze"&&attacker.kamikazeState==="dash"))attacker.hackedFacing=Math.atan2(target.y-attacker.y,target.x-attacker.x)+Math.PI/2;
        return target?.id??null;
    }
    const ally=world.enemies.find(e=>e.hp>0 && enemyAllegiance(world,e)==="friendly_hacked" && e.id!==attacker?.id);
    if(ally)return ally.id;

    if (world.decoys.some(d => d.active) && (homing || !canAcquirePlayerTarget(world.aircraft) || world.random() < 0.68)) {
        const active = world.decoys.filter(d => d.active);
        const decoy = active[Math.floor(world.random() * active.length)];
        return decoy?.id ?? null;
    }
    return canAcquirePlayerTarget(world.aircraft) ? PLAYER_TARGET_ID : null;
}
function targetPosition(world: CombatWorld, targetId: number | null): {
    x: number;
    y: number;
} | null {
    if (targetId === PLAYER_TARGET_ID)
        return canAcquirePlayerTarget(world.aircraft) ? { x: world.playerX, y: world.playerY } : null;
    const unit=world.enemies.find(e=>e.id===targetId && e.hp>0);
    if(unit&&canTargetEnemy(world,unit))return unit;
    const decoy = world.decoys.find((candidate) => candidate.id === targetId && candidate.active);
    return decoy ? { x: decoy.x, y: decoy.y } : null;
}
function fireEnemyBullet(world: CombatWorld, enemy: EnemyEntity, angle: number, speed: number, rawDamage: number, homing = false, tag: AttackTag = "basic", allegiance?:Allegiance, speedClass: EnemyProjectileSpeedClass = "standard"): void {
    const adjustedSpeed = speed;
    const facing=enemy.hackedFacing ?? Math.PI;
    addProjectile(world, {
        owner: "enemy", enemySpeedClass: homing ? "special" : speedClass,
        allegiance, sourceEnemyId: enemy.id, sourceEnemyType: enemy.type, attackTag: tag, majorBossAttack: enemy.type === "boss" && tag !== "boss_wing" && tag !== "basic",
        appearance: enemy.type === "boss" ? "boss" : homing ? "dangerous" : undefined,
        criticalAttack: enemy.type === "boss" || isElite(enemy.type) || homing,
        allowOffscreenEntry: tag === "kamikaze_dash",
        x: enemy.x + Math.sin(facing) * enemy.radius * .65,
        y: enemy.y - Math.cos(facing) * enemy.radius * .65,
        vx: Math.cos(angle) * adjustedSpeed,
        vy: Math.sin(angle) * adjustedSpeed,
        rawDamage,
        radius: homing ? 5 : 4,
        homing,
        lifetime: homing && tag === "radar_lock" ? 12 : undefined,
        targetId: chooseEnemyTarget(world, homing, enemy),
        turnRate: homing ? 1.1 : 0,
        color: homing ? "#fbbf24" : "#fb7185",
    });
}
function aimAtCurrentTarget(world: CombatWorld, enemy: EnemyEntity): number | null {
    const id = chooseEnemyTarget(world, false, enemy);
    const target = targetPosition(world, id);
    if(target && enemy.type!=="boss" && enemyAllegiance(world,enemy)==="friendly_hacked")enemy.hackedFacing=Math.atan2(target.y-enemy.y,target.x-enemy.x)+Math.PI/2;
    return target ? Math.atan2(target.y - enemy.y, target.x - enemy.x) : null;
}
function addWarning(world: CombatWorld, kind: WarningZone["kind"], x: number, y: number, radius: number, duration: number, rawDamage: number, owner: WarningZone["owner"], enemyId?: number, metadata: AttackMetadata = {}): WarningZone | undefined {
    if (world.warnings.length >= AIR_COMBAT_WORLD.maxWarnings)
        return;
    const clamped = clampCircleToGameplayRect(x, y, radius);
    const warning:WarningZone={
        id: world.nextId++,
        kind,
        ...metadata, sourceEnemyId: enemyId,
        allegiance:metadata.allegiance??(owner==="player"?"player":enemyAllegiance(world,world.enemies.find(e=>e.id===enemyId))),
        delivery:metadata.delivery??(kind==="enemy_bomb"||kind==="boss_strike"||kind==="player_bomb"?"explosive_aoe":"area_hazard"),
        enemyId,
        x: clamped.x,
        y: clamped.y,
        radius,
        remaining: duration,
        totalDuration: duration,
        rawDamage,
        owner,
    };
    world.warnings.push(warning);
    return warning;
}
function reserveThreat(world: CombatWorld, enemy: EnemyEntity, cost: number, duration: number): boolean {
    if(enemyAllegiance(world,enemy)==="friendly_hacked")return true;
    world.threats = world.threats.filter(t => t.until > world.elapsed && world.enemies.some(e => e.id === t.enemyId && e.hp > 0));
    if (world.threats.reduce((n,t) => n+t.cost,0)+cost > Math.max(1, enemy.wave)) return false;
    world.threats.push({ enemyId: enemy.id, cost, until: world.elapsed+duration });
    return true;
}
function scheduleAttack(world: CombatWorld, enemy: EnemyEntity, kind: CombatWorld["scheduledAttacks"][number]["kind"], delay: number, extra: Partial<CombatWorld["scheduledAttacks"][number]> = {}): void {
    if (world.scheduledAttacks.length < 32) world.scheduledAttacks.push({ ...extra, allegiance:enemyAllegiance(world,enemy), at: world.elapsed+delay, enemyId: enemy.id, kind });
}
type ElitePattern = NonNullable<WarningZone["elitePattern"]>;
const ELITE_PATTERNS:readonly string[]=["crimson_barrage","iron_suppression","acid_bombing","radar_bombardment"];
function eliteResolveStacks(world:CombatWorld,enemy:EnemyEntity):number {
    return world.stage.waves[world.waveIndex]?.elite&&isElite(enemy.type)&&isHostileToPlayer(world,enemy)?world.eliteResolve:0;
}
function getEliteAttackInterval(world:CombatWorld,enemy:EnemyEntity,base:number):number {
    return base/(1+.10*eliteResolveStacks(world,enemy));
}
function getEliteSpecialInterval(world:CombatWorld,enemy:EnemyEntity,base:number):number {
    return base*Math.max(.70,1-.10*eliteResolveStacks(world,enemy));
}
function eliteActivity(world:CombatWorld):Map<number,boolean> {
    world.eliteSpecials=world.eliteSpecials.filter(a=>a.until>world.elapsed);
    const active=new Map<number,boolean>();
    const include=(id:number,control:boolean)=>active.set(id,Boolean(active.get(id))||control);
    for(const a of world.eliteSpecials)if(a.allegiance==="hostile")include(a.enemyId,a.control);
    for(const w of world.warnings)if(w.allegiance!=="friendly_hacked"&&w.enemyId&&
        (w.elitePattern||["shock_clamp","dash","retaliation","acid","rail"].includes(w.kind))&&
        (w.sourceEnemyType&&isElite(w.sourceEnemyType)||world.enemies.some(e=>e.id===w.enemyId&&isElite(e.type))))
        include(w.enemyId,w.kind==="shock_clamp"||w.sourceEnemyType==="radar_hunter"&&w.kind==="rail");
    // Radar's lock missiles can trigger control after their firing warning has ended.
    for(const p of world.projectiles)if(p.allegiance!=="friendly_hacked"&&p.sourceEnemyType==="radar_hunter"&&p.sourceEnemyId&&["rail","radar_lock"].includes(p.attackTag??""))include(p.sourceEnemyId,true);
    for(const e of world.enemies)if(isElite(e.type)&&isHostileToPlayer(world,e)&&(e.dashRemaining>0||(e.executionRecovery??0)>0))include(e.id,false);
    return active;
}
function canStartEliteSpecial(world:CombatWorld,enemy:EnemyEntity,control:boolean,area=false):boolean {
    if(world.duel)return false;
    if(!world.stage.waves[world.waveIndex].elite)return true;
    // A unit never starts two independent specials over its own warning.
    if(world.warnings.some(w=>w.enemyId===enemy.id&&w.kind!=="elite_lock")||enemy.dashRemaining>0||(enemy.executionRecovery??0)>0)return false;
    if(enemyAllegiance(world,enemy)==="friendly_hacked")return true;
    const active=eliteActivity(world),controlActive=[...active.values()].some(Boolean);
    if(active.has(enemy.id)||active.size>=(enemy.eliteWave===2?3:2))return false;
    // Scheduling fairness only: no change to status duration, immunity or Core 024.
    if(control&&(controlActive||playerStunned(world.aircraft)||world.warnings.some(w=>w.allegiance!=="friendly_hacked"&&w.kind==="acid")))return false;
    if(area&&(controlActive||playerStunned(world.aircraft)))return false;
    return true;
}
function canContinueRadarSequence(world:CombatWorld,enemy:EnemyEntity):boolean {
    if(enemyAllegiance(world,enemy)==="friendly_hacked")return true;
    const active=eliteActivity(world);
    return (active.has(enemy.id)||active.size<(enemy.eliteWave===2?3:2))&&
        ![...active].some(([id,control])=>id!==enemy.id&&control)&&
        !world.warnings.some(w=>w.kind==="acid"&&w.allegiance!=="friendly_hacked");
}
function reserveEliteSpecial(world:CombatWorld,enemy:EnemyEntity,control:boolean,duration:number):void {
    world.eliteSpecials.push({enemyId:enemy.id,until:world.elapsed+duration,control,allegiance:enemyAllegiance(world,enemy)});
}
function queueEliteSpecial(world: CombatWorld, enemy: EnemyEntity, kind: CombatWorld["scheduledAttacks"][number]["kind"], delay: number, control: boolean): void {
    if(world.scheduledAttacks.some(a=>a.enemyId===enemy.id&&a.kind===kind))return;
    // Delayed attacks retain the allegiance captured when their sequence starts.
    scheduleAttack(world,enemy,kind,delay,{control});
}
function elitePatternFor(enemy:EnemyEntity):ElitePattern|undefined {
    return enemy.type==="elite"?"crimson_barrage":enemy.type==="iron_fortress"?"iron_suppression":enemy.type==="acid_bomber"?"acid_bombing":enemy.type==="radar_hunter"&&enemy.eliteWave===2?"radar_bombardment":undefined;
}
function elitePatternInterval(enemy:EnemyEntity):number {
    return enemy.type==="elite"?7.8:enemy.type==="iron_fortress"?8.5:enemy.type==="acid_bomber"?(enemy.eliteWave===2?4.7:6.25):8;
}
/** A shared open side is kept until all hostile acid has expired. Successive
 * carpets therefore cannot close each other's corridor, even with Resolve. */
function eliteBombPoint(world:CombatWorld,x:number,y:number,radius:number,hostile:boolean):{x:number;y:number} {
    if(!hostile)return clampCircleToGameplayRect(x,y,radius);
    const corridor=100;
    const minX=GAMEPLAY_SAFE_RECT.left+radius+(world.eliteCorridorSide===-1?corridor:0);
    const maxX=GAMEPLAY_SAFE_RECT.right-radius-(world.eliteCorridorSide===1?corridor:0);
    return clampCircleToGameplayRect(Math.max(minX,Math.min(maxX,x)),y,radius);
}
function startElitePattern(world:CombatWorld,enemy:EnemyEntity,kind:ElitePattern,target:{x:number;y:number}):boolean {
    const count=kind==="acid_bombing"?(enemy.eliteWave===2?5:3):kind==="radar_bombardment"?3:1;
    if(world.warnings.length+count>AIR_COMBAT_WORLD.maxWarnings)return false;
    const hostile=isHostileToPlayer(world,enemy),index=enemy.elitePatternIndex??0,direction=index%2===0?1:-1;
    const damage=stageEnemyConfig(enemy.type, world.stageId).projectileDamage*enemy.damageScale;
    if(kind==="crimson_barrage"||kind==="iron_suppression"){
        const crimson=kind==="crimson_barrage",warning=crimson?.7:.65;
        const offsets=crimson?(enemy.eliteWave===2?[-.24,0,.24,-.38]:[-.24,0,.24]):enemy.eliteWave===2?[-.3,0,.3]:[-.3,.3];
        const angle=Math.atan2(target.y-enemy.y,target.x-enemy.x),gap=crimson?.21:.35;
        const w=addWarning(world,"elite_barrage",enemy.x,enemy.y,32,warning,damage,"enemy",enemy.id,{sourceEnemyType:enemy.type,attackTag:crimson?"crimson_barrage":"iron_suppression"});
        if(!w)return false;
        w.fromX=enemy.x;w.fromY=enemy.y+enemy.radius*.65;w.elitePattern=kind;
        w.barrage={angles:offsets.map(offset=>angle+offset*direction),index:0,gap,next:0};
        const duration=warning+(offsets.length-1)*gap;
        reserveEliteSpecial(world,enemy,false,duration+.7);
        enemy.eliteSequenceUntil=world.elapsed+duration+.7;
    }else{
        if(hostile&&!world.warnings.some(w=>w.kind==="acid"&&w.allegiance!=="friendly_hacked"))
            world.eliteCorridorSide=target.x<(GAMEPLAY_SAFE_RECT.left+GAMEPLAY_SAFE_RECT.right)/2?1:-1;
        const acid=kind==="acid_bombing",radius=acid?42:30;
        // Movement prediction is a fixed snapshot, never a homing zone.
        const dx=hostile?world.moveDirectionX:0,dy=hostile?world.moveDirectionY:0;
        const offsets=acid&&count===5?[[0,0],[-48*direction,-65],[48*direction,-130],[-48*direction,-195],[48*direction,-260]]
            :[[0,0],[dx*58+direction*28,dy*58-48],[-dx*48-direction*28,-dy*48-96]];
        offsets.forEach(([x,y],i)=>{
            const point=eliteBombPoint(world,target.x+x,target.y+y,radius,hostile);
            const w=addWarning(world,acid?"acid":"enemy_bomb",point.x,point.y,radius,(acid?.9:.8)+i*.32,damage*(acid?1:.75),"enemy",enemy.id,{sourceEnemyType:enemy.type,attackTag:acid?"acid":"radar_bombardment"});
            if(w)w.elitePattern=kind;
        });
        // Keep a short gap after acid so pending Clamp/Radar sequences get a turn.
        reserveEliteSpecial(world,enemy,false,(acid?.9+3+.65:.8)+.32*(count-1));
    }
    enemy.elitePatternIndex=index+1;
    const interval=getEliteSpecialInterval(world,enemy,elitePatternInterval(enemy));
    if(kind==="acid_bombing")enemy.fireCooldown=interval;
    else enemy.elitePatternCd=interval;
    return true;
}
function updateEliteDirector(world:CombatWorld,dt:number):void {
    if (world.magnetic || world.stormbreaker || world.mirage || world.mirrorContext) return;
    const wave=world.stage.waves[world.waveIndex];
    if(!wave.elite||world.waveState!=="combat")return;
    for(const enemy of world.enemies){
        if(enemy.hp<=0||!isElite(enemy.type)||enemy.type==="acid_bomber"||enemy.stun>0||(enemy.skillLockedUntil??0)>world.elapsed)continue;
        enemy.elitePatternCd=(enemy.elitePatternCd??elitePatternInterval(enemy))-dt;
        const kind=elitePatternFor(enemy);
        if(kind&&enemy.elitePatternCd<=0)queueEliteSpecial(world,enemy,kind,0,false);
    }
    world.eliteComboCooldown=Math.max(0,world.eliteComboCooldown-dt);
    if(world.eliteComboCooldown>0)return;
    const live=world.enemies.filter(e=>isElite(e.type)&&e.hp>0&&e.stun<=0&&(e.skillLockedUntil??0)<=world.elapsed).sort((a,b)=>a.id-b.id);
    if(live.length<2)return;
    type ComboStep={type:EnemyType;kind:ElitePattern|"rail";control?:boolean};
    const templates:ComboStep[][]=wave.elite===2?[
        [{type:"radar_hunter",kind:"radar_bombardment"},{type:"elite",kind:"crimson_barrage"}],
        [{type:"acid_bomber",kind:"acid_bombing"},{type:"iron_fortress",kind:"iron_suppression"}],
        [{type:"radar_hunter",kind:"rail",control:true},{type:"elite",kind:"crimson_barrage"}],
        [{type:"iron_fortress",kind:"iron_suppression"},{type:"radar_hunter",kind:"radar_bombardment"}],
    ]:[
        [{type:"acid_bomber",kind:"acid_bombing"},{type:"iron_fortress",kind:"iron_suppression"}],
        [{type:"elite",kind:"crimson_barrage"},{type:"iron_fortress",kind:"iron_suppression"}],
        [{type:"iron_fortress",kind:"iron_suppression"},{type:"acid_bomber",kind:"acid_bombing"}],
    ];
    const valid=templates.filter(pair=>pair.every(step=>live.some(e=>e.type===step.type)));
    const steps:ComboStep[]=valid.length?valid[world.eliteComboIndex%valid.length]:live.slice(0,2).map(e=>({type:e.type,kind:elitePatternFor(e)!}));
    const pair=steps.map(step=>({step,enemy:live.find(e=>e.type===step.type)!}));
    // Skip a busy beat rather than accumulate a large delayed combo backlog.
    if(!pair.every(({enemy,step})=>canStartEliteSpecial(world,enemy,Boolean(step.control),step.kind==="acid_bombing"||step.kind==="radar_bombardment")))return;
    if(eliteActivity(world).size+pair.length>(wave.elite===2?3:2))return;
    pair.forEach(({enemy,step},i)=>queueEliteSpecial(world,enemy,step.kind,i*.18,Boolean(step.control)));
    world.eliteComboIndex++;
    world.eliteComboCooldown=wave.elite===2?7:9;
}
function tryNormalSpecial(world: CombatWorld, enemy: EnemyEntity, damage: number, aim: number | null, target: {x:number;y:number} | null): boolean {
    if (isElite(enemy.type) || enemy.type === "boss" || enemy.wave < 3 || !target || aim === null) return false;
    const eligible = enemy.type === "scout" ? enemy.attackCount % 3 === 0
        : enemy.wave >= 5 ? enemy.attackCount % 2 === 0 : enemy.attackCount % 3 === 0;
    if (!eligible) return false;
    const heavy = ["attacker", "bomber", "sniper", "jammer"].includes(enemy.type);
    if (enemy.wave < 4 && heavy && enemy.type !== "bomber") return false;
    if (!reserveThreat(world, enemy, heavy ? 2 : 1, heavy ? 2.7 : 1.2)) return false;
    if (enemy.type === "scout") {
        if (enemy.wave === 5 && world.random() < .4) {
            for (let i=0;i<3;i++) scheduleAttack(world, enemy, "needle", i*.12, {angle: aim});
        } else for (const offset of [-.07,.07]) fireEnemyBullet(world,enemy,aim+offset,285,damage*.65,false,"needle_pair",undefined,"fan");
    } else if (enemy.type === "fighter") {
        for (const side of [-1,1]) {
            const x=enemy.x+side*30, y=enemy.y+12, angle=Math.atan2(target.y-y,target.x-x);
            addProjectile(world,{owner:"enemy",enemySpeedClass:"standard",x,y,vx:Math.cos(angle)*220,vy:Math.sin(angle)*220,rawDamage:damage*.8,
                sourceEnemyId:enemy.id,sourceEnemyType:enemy.type,attackTag:"scissor",color:"#ff475f",radius:3});
        }
    } else if (enemy.type === "attacker") {
        const gap=1+Math.floor(world.random()*5);
        for(let i=0;i<7;i++) if(i!==gap) fireEnemyBullet(world,enemy,aim+(i-3)*.22,160,damage*.75,false,"suppressive_gate",undefined,"fan");
    } else if (enemy.type === "bomber") {
        const count=enemy.wave===5?5:enemy.wave===4?3:2;
        for(let i=0;i<count;i++) {
            const t=i-(count-1)/2;
            addWarning(world,"enemy_bomb",target.x+world.moveDirectionX*t*39,target.y+world.moveDirectionY*t*39,26,.9+i*.2,damage*.65,"enemy",enemy.id,{sourceEnemyType:enemy.type,attackTag:"carpet_bomb"});
        }
    } else if (enemy.type === "sniper") {
        addLineWarning(world,enemy,"rail",target.x,target.y,.95,damage);
        scheduleAttack(world,enemy,"rail",.45);
    } else if (enemy.type === "jammer") {
        addWarning(world,"emp",target.x,target.y,46,.9,damage*.65,"enemy",enemy.id,{sourceEnemyType:enemy.type,attackTag:"emp",payload:{skillLock:1,resourceJam:2.5,resourceMultiplier:.5}});
    } else return false;
    return true;
}
function onHostileDamage(world: CombatWorld, attack: AttackMetadata): void {
    const state=world.aircraft, now=state.coreState.time;
    if (attack.payload) {
        applyPlayerStatus(state,attack.payload);
        if(attack.payload.healingReduction)magneticFx(world,"acidSplash",world.playerX,world.playerY,55,.4);
        else emitVisual(world,{kind:"emp_pulse",x:world.playerX,y:world.playerY,size:48});
    }
    const enemy=world.enemies.find(e=>e.id===attack.sourceEnemyId && e.hp>0);
    if (attack.attackTag==="acid") {
        if(addStatusMark(state,"corrosion",6,undefined)>=3) {
            delete state.status.marks.corrosion;
            applyPlayerStatus(state,{armorBreak:4,regenDisable:4,resourceJam:4,resourceMultiplier:.5});
            setMessage(world,"THỦNG VỎ · ĂN MÒN",1.2);
            if(enemy?.eliteWave===2) queueEliteSpecial(world,enemy,"acid_cage",1.2,false);
        }
    }
    if (!enemy) return;
    if(enemy.type==="elite" && addStatusMark(state,"hunterMark",enemy.eliteWave===2?3.5:4,enemy.id)>=(enemy.eliteWave===2?2:3)) {
        delete state.status.marks.hunterMark;
        queueEliteSpecial(world,enemy,"execution",.1,false);
    }
    if(enemy.type==="iron_fortress" && (attack.attackTag==="basic" || attack.attackTag==="burst" || attack.attackTag==="iron_suppression") && addStatusMark(state,"suppression",4,enemy.id)>=(enemy.eliteWave===2?3:4)) {
        delete state.status.marks.suppression;
        queueEliteSpecial(world,enemy,"clamp",.1,true);
    }
    if(enemy.type==="radar_hunter") {
        if(attack.attackTag==="rail") addStatusMark(state,"targetLock",4,enemy.id);
        else if(attack.attackTag==="radar_lock" && (state.status.marks.targetLock?.until??0)>now) {
            delete state.status.marks.targetLock;
            applyPlayerStatus(state,{stun:1.5,skillLock:2.2,resourceJam:2.5,resourceMultiplier:.4});
            queueEliteSpecial(world,enemy,"radar_followup",.6,false);
        }
    }
    if(world.stage.runtime==="leviathan" && enemy.type==="boss" && world.bossPhase>=3 && attack.majorBossAttack && addStatusMark(state,"hunted",5,enemy.id)>=2) {
        delete state.status.marks.hunted;
        // Punishment's field locks NOW and always gives its own avoidable warning.
        castBossEmp(world,enemy,true);
        if(enemy.bossAttack) enemy.bossAttack.punishmentFollowup=world.elapsed+1.35;
    }
}
function updateScheduledAttacks(world: CombatWorld): void {
    for(let i=world.scheduledAttacks.length-1;i>=0;i--) {
        const a=world.scheduledAttacks[i], enemy=world.enemies.find(e=>e.id===a.enemyId && e.hp>0);
        if(!enemy) {world.scheduledAttacks.splice(i,1);continue;}
        if(a.at>world.elapsed || enemy.stun>0 || (enemy.skillLockedUntil??0)>world.elapsed) continue;
        const pattern=ELITE_PATTERNS.includes(a.kind);
        const special=pattern||a.kind==="rail"&&enemy.type==="radar_hunter"||["clamp","execution","retaliation","acid_cage","radar_followup"].includes(a.kind);
        const control=Boolean(a.control)||a.kind==="clamp"||a.kind==="radar_followup"||a.kind==="rail"&&enemy.type==="radar_hunter";
        if(special){
            if(a.kind==="execution"&&(enemy.eliteSequenceUntil??0)>world.elapsed){a.at=enemy.eliteSequenceUntil!;continue;}
            if(!canStartEliteSpecial(world,enemy,control,a.kind==="acid_cage"||a.kind==="acid_bombing"||a.kind==="radar_bombardment")){a.at=world.elapsed+.2;continue;}
        }
        world.scheduledAttacks.splice(i,1);
        const prior=enemy.attackAllegiance;enemy.attackAllegiance=a.allegiance;
        try {
        const target=targetPosition(world,chooseEnemyTarget(world,false,enemy));
        if(!target)continue;
        const damage=stageEnemyConfig(enemy.type, world.stageId).projectileDamage*enemy.damageScale;
        if(pattern||a.kind==="acid_cage"){
            if(!startElitePattern(world,enemy,a.kind==="acid_cage"?"acid_bombing":a.kind as ElitePattern,target))scheduleAttack(world,enemy,a.kind,.2);
            continue;
        }
        if(special)reserveEliteSpecial(world,enemy,control,a.kind==="execution"?2.1:a.kind==="clamp"?.8+(enemy.eliteWave===2?1.75:1.25):1.2);
        if(a.kind==="needle") fireEnemyBullet(world,enemy,enemyAllegiance(world,enemy)==="friendly_hacked" ? Math.atan2(target.y-enemy.y,target.x-enemy.x) : a.angle??Math.PI/2,285,damage*.45,false,"needle_pair");
        if(a.kind==="rail") {
            const point=clampCircleToGameplayRect(target.x+world.moveDirectionX*30,target.y+world.moveDirectionY*30,10);
            addLineWarning(world,enemy,"rail",point.x,point.y,.75,damage*.85);
        }
        if(a.kind==="execution") { addLineWarning(world,enemy,"dash",target.x,target.y,.7,stageEnemyConfig(enemy.type, world.stageId).collisionDamage*enemy.damageScale); setMessage(world,"CRIMSON · LAO HÀNH QUYẾT",.7); }
        if(a.kind==="clamp") addWarning(world,"shock_clamp",target.x,target.y,44,.8,damage*.65,"enemy",enemy.id,{sourceEnemyType:enemy.type,attackTag:"shock_clamp",payload:{stun:enemy.eliteWave===2?1.75:1.25}});
        if(a.kind==="retaliation") addWarning(world,"retaliation",enemy.x,enemy.y,35,.5,damage,"enemy",enemy.id,{sourceEnemyType:enemy.type,attackTag:"burst"});
        if(a.kind==="radar_followup") { const aim=aimAtCurrentTarget(world,enemy); if(aim!==null) for(const offset of [-.3,0,.3]) fireEnemyBullet(world,enemy,aim+offset,180,damage*.8,true,"radar_lock"); }
        } finally {enemy.attackAllegiance=prior;}
    }
}
function fireEnemy(world: CombatWorld, enemy: EnemyEntity): void {
    const config = stageEnemyConfig(enemy.type, world.stageId), damage = config.projectileDamage * enemy.damageScale, aim = aimAtCurrentTarget(world, enemy);
    const target = targetPosition(world, chooseEnemyTarget(world, false, enemy));
    if(enemyAllegiance(world,enemy)==="friendly_hacked"&&!target)return;
    if(world.stage.waves[world.waveIndex].elite&&(enemy.type==="acid_bomber"||enemy.type==="radar_hunter")){
        if(!canStartEliteSpecial(world,enemy,enemy.type==="radar_hunter",enemy.type==="acid_bomber")){enemy.fireCooldown=.2;return;}
        if(enemy.type==="acid_bomber"){
            if(target&&startElitePattern(world,enemy,"acid_bombing",target))enemy.attackCount++;
            else enemy.fireCooldown=.2;
            return;
        }
        reserveEliteSpecial(world,enemy,true,1.5);
    }
    enemy.attackCount++;
    if ((enemy.skillLockedUntil??0)<=world.elapsed && tryNormalSpecial(world, enemy, damage, aim, target)) { enemy.fireCooldown = config.fireInterval; return; }
    switch (enemy.type) {
        case "bomber":
            if (target)
                addWarning(world, "enemy_bomb", target.x, target.y, 34, 1, damage, "enemy", enemy.id, { sourceEnemyType: enemy.type, attackTag: "carpet_bomb" });
            break;
        case "fighter":
        case "elite":
            if (aim !== null) {
                enemy.burst = enemy.type === "elite" && enemy.eliteWave === 2 ? 4 : 3;
                enemy.burstCd = 0;
                enemy.burstAngle = aim;
                enemy.burstAllegiance = enemyAllegiance(world,enemy);
            }
            if (enemy.type === "elite" && enemy.attackCount % 2 === 0 && enemy.eliteWave === 1)
                fireFan(world, enemy, 5, 62.4 * enemy.damageScale, aim ?? Math.PI / 2);
            break;
        case "attacker":
            fireFan(world, enemy, 3, damage, aim ?? Math.PI / 2, Math.PI / 10);
            break;
        case "iron_fortress":
            fireFan(world, enemy, 5, damage, aim ?? Math.PI / 2, .22);
            if (enemy.eliteWave === 2) {
                enemy.burst = 1;
                enemy.burstCd = .65;
                enemy.burstAngle = aim ?? Math.PI / 2;
                enemy.burstAllegiance = enemyAllegiance(world,enemy);
                addWarning(world, "elite_lock", enemy.x, enemy.y, 32, .6, 0, "enemy", enemy.id);
            }
            break;
        case "acid_bomber":
            if (target) {
                if (enemy.eliteWave === 2) {
                    // A fixed free corridor on the far side; all three disks stay in a 180px cluster.
                    // This cast ends before the next, so old acid cannot close that corridor.
                    const centerX = Math.max(104, Math.min(256, target.x));
                    addWarning(world, "acid", centerX, target.y, 42, 1.1, damage, "enemy", enemy.id, { attackTag: "acid" });
                    addWarning(world, "acid", centerX - 48, target.y - 65, 42, 1.35, damage, "enemy", enemy.id, { attackTag: "acid" });
                    addWarning(world, "acid", centerX + 48, target.y - 130, 42, 1.6, damage, "enemy", enemy.id, { attackTag: "acid" });
                } else addWarning(world, "acid", target.x, target.y, 42, 1.1, damage, "enemy", enemy.id, { attackTag: "acid" });
            }
            break;
        case "sniper":
        case "radar_hunter":
            if (enemy.type === "radar_hunter" && enemy.attackCount % 2 === 0 && aim !== null) {
                fireEnemyBullet(world, enemy, aim - .2, 155, 93.6 * enemy.damageScale, true, "radar_lock");
                fireEnemyBullet(world, enemy, aim + .2, 155, 93.6 * enemy.damageScale, true, "radar_lock");
            }
            else if (target) {
                addLineWarning(world, enemy, "rail", target.x, target.y, 1.2, damage);
                if (enemy.type === "radar_hunter" && enemy.attackCount % 4 === 3) {
                    enemy.secondaryAllegiance=enemyAllegiance(world,enemy);
                    enemy.secondaryCd = 1.75;
                } // Rail resolves at 1.2s, then one staggered missile.
            }
            break;
        case "boss": break; // Separate suppressive scheduler owns wing fire.
        default: if (aim !== null)
            fireEnemyBullet(world, enemy, aim, 155, damage);
    }
    const faster = enemy.type === "elite" && enemy.hp < enemy.maxHp * .5 ? .8 : enemy.type === "boss" && enemy.hp < enemy.maxHp * .15 ? .75 : 1;
    const tuning = getBossTuning(enemy.hp / enemy.maxHp);
    enemy.fireCooldown = enemy.type === "boss" ? tuning.wingInterval * tuning.cadence
        : getEliteAttackInterval(world,enemy,enemy.type === "acid_bomber" && enemy.eliteWave === 2 ? 4.8 : config.fireInterval * faster);
}
function reserveBossVolley(world:CombatWorld,count:number):boolean {
    let live=world.projectiles.reduce((n,p)=>n+Number(p.owner==="enemy"),0);
    while(live+count>AIR_COMBAT_WORLD.maxEnemyProjectiles) {
        let index=world.projectiles.findIndex(p=>p.suppressive);
        if(index<0)index=world.projectiles.findIndex(p=>p.owner==="enemy"&&!p.criticalAttack&&!p.homing);
        if(index<0)return false;
        recycleProjectile(world,index);live--;
    }
    return true;
}
function fireFan(world: CombatWorld, enemy: EnemyEntity, count: number, damage: number, angle = Math.PI / 2, spacing = .19, speed = 145, tag: AttackTag = enemy.type === "boss" ? "boss_fan" : "burst", allegiance?:Allegiance): boolean {
    if(enemy.type==="boss" && !reserveBossVolley(world,count))return false;
    for (let i = 0; i < count; i++)
        fireEnemyBullet(world, enemy, angle + (i - (count - 1) / 2) * spacing, speed, damage, false, tag, allegiance, count > 1 ? "fan" : "standard");
    return true;
}
function addLineWarning(world: CombatWorld, enemy: EnemyEntity, kind: "rail" | "dash", x: number, y: number, duration: number, damage: number): void {
    if (world.warnings.length >= AIR_COMBAT_WORLD.maxWarnings)
        return;
    const warning: WarningZone = { allegiance:enemyAllegiance(world,enemy), delivery:kind==="dash"?"aircraft_collision":"direct_projectile", id: world.nextId++, kind, x, y, fromX: enemy.x, fromY: enemy.y, radius: kind === "dash" ? enemy.radius * .8 : 7,
        remaining: duration, totalDuration: duration, rawDamage: damage, owner: "enemy", enemyId: enemy.id, sourceEnemyId: enemy.id, sourceEnemyType: enemy.type, attackTag: kind === "rail" ? "rail" : enemy.type === "boss" ? "boss_dash" : "elite_execution", majorBossAttack: enemy.type === "boss" };
    world.warnings.push(warning);
}
function launchNextMissile(world: CombatWorld, salvo: MissileSalvo): boolean {
    const values = getSkillRuntimeValues(world.aircraft, "missile_swarm"), side = salvo.launchIndex % 2 === 0 ? -1 : 1;
    const launch = clampCircleToGameplayRect(world.playerX + side * 32*playerAirframeScale(world.aircraft), world.playerY - 12*playerAirframeScale(world.aircraft), 4.5);
    const p = addProjectile(world, {owner:"player",source:"skill",skillId:"missile_swarm",salvoId:salvo.id,expansionCast:salvo.expansionCast,
        x:launch.x,y:launch.y,vx:0,vy:-520,radius:4.5,rawDamage:getEffectiveAircraftStats(world.aircraft).firepower*values.damageMultiplier,
        lifetime:24,projectileKind:"missile",anchorX:side*32,anchorY:-12,turnRate:3.2*1.7,color:"#fb923c"});
    if (!p) return false;
    if(salvo.launchIndex>=14)recordCoreMetric(world.aircraft,25,"extraProjectiles",1);
    salvo.live.add(p.id); salvo.pairIds.push(p.id); salvo.pending--; salvo.launchIndex++;
    return true;
}
function updateMissileSalvo(world: CombatWorld, _dt: number): void {
    for (const salvo of world.skillCores.salvos) {
        if (!salvo.pending) continue;
        if (salvo.launchIndex % 2 === 0) {
            if (salvo.pairIds.some(id => world.projectiles.some(p => p.id === id && p.missileState !== "powered"))) continue;
            if (world.projectiles.filter(p => p.owner !== "enemy").length > AIR_COMBAT_WORLD.maxPlayerProjectiles - 2) continue;
            salvo.pairIds.length = 0;
        }
        do { if (!launchNextMissile(world, salvo)) break; } while (salvo.pending > 0 && salvo.launchIndex % 2 !== 0);
        if(!salvo.pending){finishExpansionSkill(world.aircraft,salvo.expansionCast);startDeferredSkillCooldown(world.aircraft,"missile_swarm");}
    }
    world.missilesPending = world.skillCores.salvos.reduce((n,s) => n+s.pending,0);
}
function queueMissileSwarm(world: CombatWorld): void {
    const count = getSkillRuntimeValues(world.aircraft,"missile_swarm").count;
    world.skillCores.salvos.push({expansionCast:expansionState(world.aircraft).casts.missile_swarm,id:world.nextId++,pending:count,total:count,launchIndex:0,pairIds:[],live:new Set(),data:0});
    updateMissileSalvo(world,0);
}
function addDecoy(world: CombatWorld, clone: boolean, side = 0, lane = 0): void {
    if (world.decoys.length >= 64)
        return;
    const duration = getSkillRuntimeValues(world.aircraft, clone ? "invisibility" : "decoy").duration;
    const decoy = world.pools.decoys.pop() || {} as DecoyEntity;
    Object.assign(decoy, { expansionCast: expansionState(world.aircraft).casts[clone ? "invisibility" : "decoy"], id: world.nextId++, x: world.playerX, y: world.playerY, radius: clone ? 12 : 6, remaining: duration, life: duration, flightAge: 0, active: clone,
        originX: world.playerX, originY: world.playerY, side, lane, clone, castId:clone?world.skillCores.invisibilityCastId:world.skillCores.decoyCastId, volleyId:world.skillCores.decoyVolleyId, clonePhase:undefined, dashTarget:undefined });
    world.decoys.push(decoy);
    if(!clone&&world.decoyVolleys===1&&(skillRank(world.aircraft, "decoy") >= 2))recordCoreMetric(world.aircraft,19,"extraProjectiles",1);
}
function updateDecoySalvo(world: CombatWorld, dt: number): void {
    if (world.decoyVolleys <= 0)
        return;
    world.decoyVolleyCd -= dt;
    while (world.decoyVolleys > 0 && world.decoyVolleyCd <= 0) {
        world.skillCores.decoyVolleyId = world.nextId++;
        world.skillCores.volleyHits.set(world.skillCores.decoyVolleyId,new Set());
        for (const side of [-1, 1])
            for (let lane = 0; lane < B.decoysPerVolley / 2; lane++)
                addDecoy(world, false, side, lane);
        world.decoyVolleys--;
        world.decoyVolleyCd += B.decoyVolleyInterval;
        if (world.decoyVolleys === 0 && (skillRank(world.aircraft, "decoy") >= 5)){
            world.aircraft.coreState.timers.decoyCounter = world.aircraft.coreState.time + 5;recordCoreMetric(world.aircraft,21,"procs",1);
        }
    }
}
function stopAllSkills(world: CombatWorld, preserveControl = false): void {
    world.bigBang=undefined;
    world.aircraft.coreState.stacks.cancellingSkills=1;
    cancelTerra(world); cancelSylva(world); cancelArgent(world); cancelRiptide(world);
    for (const id of SKILL_IDS)
        endAircraftSkill(world.aircraft, id);
    world.rankRuntime=undefined;
    if(world.astra){world.astra.orbit=undefined;world.astra.charge=undefined;world.astra.starfall=undefined;world.astra.burns=[];world.astra.meteorSpears=[];}
    for(const cast of expansionState(world.aircraft).liveCasts)finishExpansionSkill(world.aircraft,cast);
    for(const id of SKILL_IDS)startDeferredSkillCooldown(world.aircraft,id);
    world.missilesPending = 0;
    delete world.aircraft.coreState.stacks.cancellingSkills;
    const bounty=world.skillCores;
    world.skillCores = {...createSkillCoreRuntime(),bountyTarget:bounty.bountyTarget,bountyUntil:bounty.bountyUntil,bountyReady:bounty.bountyReady};
    world.decoyVolleys = 0;
    world.laserCharge = 0;
    world.laserRemaining = 0;
    world.laserTicksRemaining = 0;
    world.dashRemaining = 0;
    for(const key of ["cloneEndPending","shieldEmpPending","thermalMaintained","tacticalData","shieldRefund"])delete world.aircraft.coreState.stacks[key];
    for (const key of ["decoyCounter", "shieldArmor", "hawkRage","hawkRageReady", "thermalCover", "activeCooling", "tacticalData",  "reappearanceBuff"])
        delete world.aircraft.coreState.timers[key];
    while (world.decoys.length)
        world.pools.decoys.push(world.decoys.pop()!);
    for (let i = world.projectiles.length - 1; i >= 0; i--)
        if (world.projectiles[i].skillId || world.projectiles[i].source === "skill" || world.projectiles[i].source === "burn")
            recycleProjectile(world, i);
    for (const enemy of world.enemies) {
        enemy.burn = 0;
        if(!preserveControl)enemy.stun = 0;
    }
}
const SKILL_IDS = Object.keys(SKILL_CONFIGS) as SkillId[];
export function getWorldSkillAvailability(world: CombatWorld, skillId: SkillId) {
    let manual: "toggle" | "detonate" | "pending" | undefined;

    if(skillId==='sylva_symbiosis'&&sylvaHud(world))manual=sylvaRecastReady(world)?'detonate':'pending';
    if(skillId==='riptide_waterform'&&riptideState(world).waterform)manual=riptideRecastReady(world)?'detonate':'pending';
    if(skillId==="gravity_anchor"&&world.rankRuntime?.anchor&&skillRank(world.aircraft,skillId)>=5)manual="detonate";
    if(skillId==="orbit_reversal"&&world.astra?.orbit)manual="toggle";
    const availability=getSkillAvailability(world.aircraft,skillId,manual);
    if(skillId==="heavy_bomb"&&world.bigBang&&!world.bigBang.resolved)return {...availability,available:false,reason:"invalid" as const};
    if(skillId==='argent_blade_recall'&&argentWaiting(world)===0)return {...availability,available:false,reason:'invalid' as const};
    if(!terraAllowed(world,skillId,terraHooks))return {...availability,available:false,reason:'invalid' as const};
    if(!sylvaAllowed(world,skillId,sylvaHooks))return {...availability,available:false,reason:'invalid' as const};
    if(!cinderSkillAllowed(world,skillId))return {...availability,available:false,reason:"invalid" as const};
    if(world.aftermath||world.destruction||(world.duel && !world.duel.combatEnabled)||world.aircraft.currentHp<=0||world.ended||world.pauseReasons.size||world.pendingCoreSelections||world.currentCoreChoices)
      return {...availability,available:false,reason:"invalid" as const};
    return availability;
}
export function castWorldSkill(world: CombatWorld, skillId: SkillId): SkillCastResult {
    if(world.duel && !world.duel.combatEnabled)return { cast: false, reason: "invalid", resourceSpent: 0 };
    const availability=getWorldSkillAvailability(world,skillId);
    if(!availability.available){
      if(availability.reason==="resource"&&skillId==="stellar_lance")astraMetric(world,"lance.insufficientMana");
      return {cast:false,reason:availability.reason,resourceSpent:0};
    }
    if(skillId==='sylva_symbiosis'&&sylvaRecastReady(world)){endSylvaSymbiosis(world,sylvaHooks);return {cast:true,resourceSpent:0,toggledOff:true};}
    if(skillId==='riptide_waterform'&&riptideRecastReady(world)){endRiptideWaterform(world,riptideHooks);return {cast:true,resourceSpent:0,toggledOff:true};}
    if(skillId==="gravity_anchor"&&world.rankRuntime?.anchor&&skillRank(world.aircraft,skillId)>=5){collapseAnchor(world,rankHooks,false);return {cast:true,resourceSpent:0,toggledOff:true};}
    if(skillId==="orbit_reversal"&&world.astra?.orbit){releaseOrbit(world,astraHooks,true);return {cast:true,resourceSpent:0,toggledOff:true};}
    if (skillId === "predator_lock" && !preferredDuelDecoy(world) && !nearestEnemy(world, world.playerX, world.playerY, [], true)) return { cast: false, reason: "invalid", resourceSpent: 0 };
    const result = castSkill(world.aircraft, skillId);
    if(!result.cast&&result.reason==="resource"&&skillId==="stellar_lance")astraMetric(world,"lance.insufficientMana");
    if (!result.cast)
        return result;
    if (result.toggledOff) {
        world.droneTargetId = null;
        setMessage(world, `${SKILL_CONFIGS[skillId].name.toUpperCase()} · KẾT THÚC`, 1);
        return result;
    }
    const observer = world.duelOpponent ?? world.mirage?.mirror;
    if (observer) observeMirrorCast(observer.ai, skillId, world.elapsed);
    const values = getSkillRuntimeValues(world.aircraft, skillId);
    const expansionCast=castExpansion(world, skillId, result.resourceSpent, expansionHooks);
    if(isTerraSkill(skillId))beginTerraSkill(world,skillId,terraHooks);
    equipmentOnCast(world,equipmentHooks,skillId);
    beginRankSkill(world,skillId,rankHooks);
    const release=releaseState(world.aircraft);
    if(hasCore(world.aircraft,220)&&!release.ghosts.length&&world.elapsed>=release.ghostReady){
        release.ghosts.push({id:world.nextId++,x:world.playerX,y:world.playerY,angle:0,until:world.elapsed+4,fireIn:0});
        release.ghostReady=0;recordCoreMetric(world.aircraft,220,"procs",1);
    }
    release.hadActiveSkill=true;release.lastCast=world.elapsed;
    addHeat(world,20,"heatCast");
    const beforeCastHp = world.aircraft.currentHp;
    dispatchCoreEvent("skillCast", coreContext(world, { skillId }));
    if(world.aircraft.coreState.stacks.skillShieldCast===world.aircraft.coreState.skillCasts)expansionCast.skillShieldUntil=world.elapsed+6;
    
    activateTacticalCores(world,skillId);
    if(world.ended)return result;
    if (hasCore(world.aircraft, 93))
        for (const id of SKILL_IDS)
            if (id !== skillId && (world.aircraft.cooldowns[id] || 0) > 0) {
                const before=world.aircraft.cooldowns[id]!;
                reduceRunningSkillCooldown(world.aircraft,id,rankValues(world.aircraft,id).cooldown * (isUltimate(id)?.05:.20));
                recordCoreMetric(world.aircraft,93,"cooldown",before-world.aircraft.cooldowns[id]!);
            }
    if(isSylvaSkill(skillId))beginSylvaSkill(world,skillId,sylvaHooks);
    if(isArgentSkill(skillId))beginArgentSkill(world,skillId,argentHooks);
    if(isRiptideSkill(skillId))beginRiptideSkill(world,skillId,riptideHooks);
    if(isCinderSkill(skillId))beginCinderSkill(world,skillId,cinderHooks);
    if(isAstraSkill(skillId))beginAstraSkill(world,skillId,result.resourceSpent,astraHooks);
    switch (skillId) {
        case "decoy":
            world.skillCores.decoyCastId = world.nextId++;
            world.skillCores.decoyCasts.set(world.skillCores.decoyCastId,{restored:0,dashIds:new Set()});
            world.decoyVolleys = values.count;
            world.decoyVolleyCd = 0;
            updateDecoySalvo(world, 0);
            break;
        case "missile_swarm":
            queueMissileSwarm(world);
            break;
        case "armor_shield":
            world.aircraft.coreState.stacks.shieldRefund = 0;
            break;
        case "heavy_bomb":
            world.bigBang = {id:world.nextId++,at:world.elapsed,fallAt:world.elapsed+2.75,impactAt:world.elapsed+3,
                x:(GAMEPLAY_SAFE_RECT.left+GAMEPLAY_SAFE_RECT.right)/2,y:(GAMEPLAY_SAFE_RECT.top+GAMEPLAY_SAFE_RECT.bottom)/2,
                rank:skillRank(world.aircraft,skillId),rawDamage:getEffectiveAircraftStats(world.aircraft).firepower*values.damageMultiplier,
                expansionCast:expansionState(world.aircraft).casts[skillId],resolved:false};
            break;
        case "focus_laser":
            world.laserCharge = values.charge;
            world.laserRemaining = values.duration;
            world.laserTicksRemaining = Math.round(values.duration / B.laserTick);
            world.laserTickCooldown = B.laserTick;
            break;
        case "invisibility": {
            world.skillCores.invisibilityCastId=world.nextId++;
            addDecoy(world, true);
            world.dashRemaining = .16;
            world.dashStartX = world.playerX;
            world.dashStartY = world.playerY;
            const end = clampHitboxToGameplayRect(world.playerX + world.moveDirectionX * 88, world.playerY + world.moveDirectionY * 88, getPlayerHitbox(world));
            world.dashEndX = end.x;
            world.dashEndY = Math.min(end.y, AIR_COMBAT_WORLD.height - AIR_COMBAT_WORLD.playerBottomClearance*playerAirframeScale(world.aircraft));
            for (const p of world.projectiles)
                if (p.owner === "enemy" && p.homing && p.targetId === PLAYER_TARGET_ID)
                    p.targetId = chooseEnemyTarget(world, true);
            for (const enemy of world.enemies) if (enemy.aircraftTarget) revalidateAircraftTargets(enemy.aircraftTarget.world);
            break;
        }
        case "escort_drone": {
            droneNavigation.delete(world);
            const point = {x:world.playerX,y:world.playerY};
            world.droneX = point.x;
            world.droneY = point.y;
            const stats = getEffectiveAircraftStats(world.aircraft);
            world.droneMaxHp = stats.maxHp * values.damageMultiplier;
            world.droneHp = world.droneMaxHp;
            world.droneArmor = stats.armor * values.damageMultiplier;
            world.droneInvulnerability = 0;
            world.droneTargetId = null;
            world.droneFireCooldown = 0;
            break;
        }
    }
    setMessage(world, SKILL_CONFIGS[skillId].name.toUpperCase(), 1.2);
    return result;
}
export function setPlayerInputActive(world: CombatWorld, active: boolean): void {
    world.playerInputActive = active && !world.destruction && !world.aftermath && world.aircraft.currentHp > 0;
}
// Apply each coalesced pointer segment immediately. Subdivision checks the full
// displacement without advancing time, limiting speed, or changing invulnerability.
export function movePlayerByDelta(world: CombatWorld, dx: number, dy: number): void {
    if(cinderMovementLocked(world))return;
    if (world.destruction || world.aftermath || world.aircraft.currentHp <= 0 || playerStunned(world.aircraft) || !world.playerInputActive || world.pauseReasons.size || world.ended || world.currentCoreChoices || world.pendingCoreSelections > 0 ||
        !Number.isFinite(dx) || !Number.isFinite(dy))
        return;
    const mirror=(world.duelOpponent ?? world.mirage?.mirror);
    if(mirror){const actor=mirror.context.world,factor=Math.min(sylvaMovement(actor,mirror.playerTarget),argentMovement(actor,mirror.playerTarget),riptideMovement(actor,mirror.playerTarget),cinderMovement(actor,mirror.playerTarget)*rankEnemyMovement(actor,mirror.playerTarget)*equipmentSlow(actor.aircraft,mirror.playerTarget));dx*=factor;dy*=factor;}
    const startX = world.playerX;
    const startY = world.playerY;
    const end = clampHitboxToGameplayRect(startX + dx, startY + dy, getPlayerHitbox(world));
    // Common visual clearance for all aircraft: the tail and both bars stay on-screen.
    end.y = Math.min(end.y, AIR_COMBAT_WORLD.height - AIR_COMBAT_WORLD.playerBottomClearance*playerAirframeScale(world.aircraft));
    const distance = Math.hypot(end.x - startX, end.y - startY);
    if (distance > .01) {
        world.moveDirectionX = (end.x - startX) / distance;
        world.moveDirectionY = (end.y - startY) / distance;
    }
    if (Math.hypot(end.x - world.stationaryAnchorX, end.y - world.stationaryAnchorY) > .75) {
        world.aircraft.coreState.lastMove = world.aircraft.coreState.time;
        world.stationaryAnchorX = end.x;
        world.stationaryAnchorY = end.y;
    }
    const steps = Math.max(1, Math.ceil(distance / 2));
    const duelCombatMove = !!world.duel?.combatEnabled;
    for (let step = 1; step <= steps; step++) {
        if(duelCombatMove && !world.duel?.combatEnabled)break;
        world.playerX = startX + (end.x - startX) * step / steps;
        world.playerY = startY + (end.y - startY) * step / steps;
        if(world.duel?.combatEnabled && world.duel.opponent){
            interceptAircraftDefenses(world.duel.opponent);
            updateProjectileCollisions(world.duel.opponent);
        }
        collectScrap(world);
        captureAstraProjectiles(world,astraHooks);
        for (const w of world.warnings) if (w.kind === "acid" && !circleVsAircraft(w.x,w.y,w.radius,getPlayerHitbox(world))) w.insideTimer = undefined;
        // Only player contacts: do not repeat weapon damage or advance enemy AI.
        for (let index = world.projectiles.length - 1; index >= 0; index--) {
            const p = world.projectiles[index];
            if (p.projectileKind !== "bullet" && p.missileState !== "powered") continue;
            const absorbedBy = isHostileBallisticProjectile(p) ? world.decoys.find(d => d.active && circleHit(p.x,p.y,p.radius,d.x,d.y,d.radius)) : undefined;
            if (absorbedBy) {
                onDecoyAbsorb(world, absorbedBy);
                emitVisual(world, { kind: "absorb", x: p.x, y: p.y, size: 24 });
                recycleProjectile(world, index);
                continue;
            }
            if (p.owner === "enemy" && !(world.duel && p.mirrorBorrowed) && p.allegiance!=="friendly_hacked" && segmentVsAircraft(p.x,p.y,p.x,p.y,p.radius,getPlayerHitbox(world),projectileContact).hit) {
                if(p.projectileKind==="boss_missile")emitVisual(world,{kind:"missile_impact",x:p.x,y:p.y,size:42,missileFamily:"boss"});
                if (p.mirageVisual && !p.mirrorBorrowed) mirageFx(world, "explosion", p.x, p.y, 24, .4);
                p.playerContact=true;
                if (!p.stormbreakerGrace || (p.stormbreakerGrace.get(-1) ?? -Infinity) + .3 <= world.elapsed) {
                    p.stormbreakerGrace?.set(-1, world.elapsed);
                    hitPlayer(world, p.rawDamage, "projectile", p, projectileContact);
                }
                recycleProjectile(world, index);
            }
        }
        for (const warning of world.warnings) hitBossWarningPlayer(world, warning);
        updateMagneticHazards(world, 0, magneticHooks);
        resolveStormbreakerContacts(world);
        if (world.mirage) resolveMirageContacts(world, stormbreakerHooks);
        updateEnemyPlayerCollisions(world);
    }
    if (world.aircraft.currentHp <= 0 && !world.duel) latchAircraftDestruction(world);
    enterCountdownIfClear(world);
}
interface DroneNavigation {
    vx: number; vy: number; side: number; dodgeX: number; dodgeY: number;
    dodgeUntil: number; threatId: number; threatRisk: number;
}
const droneNavigation = new WeakMap<CombatWorld, DroneNavigation>();
function updateDroneMovement(world: CombatWorld, dt: number): void {
    if (!world.aircraft.droneActive) {
        world.droneTargetId = null;
        droneNavigation.delete(world);
        return;
    }
    // Attack selection is independent of the navigation anchor.
    const state=world.aircraft;
    if(state.dronePhase!=="active") {
        world.droneTargetId=null;
        const remaining=state.droneTransitionRemaining??0, t=Math.min(1,dt/Math.max(dt,remaining));
        const target=state.dronePhase==="returning"?{x:world.playerX,y:world.playerY}:clampCircleToGameplayRect(world.playerX-28,world.playerY+8,9);
        world.droneX+=(target.x-world.droneX)*t;world.droneY+=(target.y-world.droneY)*t;
        state.droneTransitionRemaining=Math.max(0,remaining-dt);
        if(state.droneTransitionRemaining===0) {
            if(state.dronePhase==="returning") {
                emitVisual(world,{kind:"ultimate_effect",ultimateEffect:"ultimateHawkDock",x:world.playerX,y:world.playerY,size:62});
                endAircraftSkill(state,"escort_drone");
            } else {
                state.dronePhase="active";
                state.coreState.timers.hawkRageReady=state.coreState.time+7;
            }
        }
        return;
    }
    const target = world.enemies.find(enemy => enemy.id === world.droneTargetId && isHostileToPlayer(world,enemy) && canTargetEnemy(world,enemy))
        || nearestEnemy(world, world.droneX, world.droneY, [], true);
    world.droneTargetId = target?.id ?? null;
    let nav = droneNavigation.get(world);
    if (!nav) {
        nav = { vx: 0, vy: 0, side: -1, dodgeX: 0, dodgeY: 0, dodgeUntil: 0, threatId: -1, threatRisk: 0 };
        droneNavigation.set(world, nav);
    }
    // Change escort side only near an edge, with a wide hysteresis band.
    if (world.playerX < GAMEPLAY_SAFE_RECT.left + 48) nav.side = 1;
    else if (world.playerX > GAMEPLAY_SAFE_RECT.right - 48) nav.side = -1;
    const anchor = clampCircleToGameplayRect(world.playerX + nav.side * 37, world.playerY + 13, 9);
    if (!Number.isFinite(world.droneX) || !Number.isFinite(world.droneY)) {
        world.droneX = anchor.x; world.droneY = anchor.y; nav.vx = nav.vy = 0;
    }
    world.droneOrbitAngle = (world.droneOrbitAngle + dt * 1.9) % (Math.PI * 2);
    const leashX = world.droneX - world.playerX, leashY = world.droneY - world.playerY;
    const leash = Math.hypot(leashX, leashY);
    const returnWeight = Math.max(0, Math.min(1, (leash - 60) / 30));
    const gain = 5 + returnWeight * 8;
    let desiredVx = (anchor.x - world.droneX) * gain;
    let desiredVy = (anchor.y - world.droneY) * gain;
    // Cosmetic bob disappears as the leash tightens.
    desiredVx += Math.cos(world.droneOrbitAngle) * 9 * (1 - returnWeight);
    desiredVy += Math.sin(world.droneOrbitAngle) * 7 * (1 - returnWeight);
    const horizon = .55;
    const threats: { id: number; vx: number; vy: number; x: number; y: number; radius: number; time: number; risk: number }[] = [];
    for (const p of world.projectiles) {
        if (p.owner !== "enemy" || p.allegiance==="friendly_hacked") continue;
        const radius = 9 + p.radius + 10;
        const dx = world.droneX - p.x, dy = world.droneY - p.y;
        // Swept AABB rejects most bullets before closest-approach work.
        if (Math.abs(dx) > Math.abs(p.vx) * horizon + radius || Math.abs(dy) > Math.abs(p.vy) * horizon + radius) continue;
        const speedSquared = p.vx * p.vx + p.vy * p.vy;
        if (speedSquared < 1) continue;
        const approach = (dx * p.vx + dy * p.vy) / speedSquared;
        if (approach < 0) continue;
        const time = Math.min(horizon, approach);
        const missSquared = (dx - p.vx * time) ** 2 + (dy - p.vy * time) ** 2;
        if (missSquared >= radius * radius) continue;
        const risk = (1 - Math.sqrt(missSquared) / radius) / (.07 + time);
        let index = 0;
        while (index < threats.length && threats[index].risk >= risk) index++;
        if (index >= 4) continue;
        threats.splice(index, 0, { id: p.id, vx: p.vx, vy: p.vy, x: p.x, y: p.y, radius, time, risk });
        if (threats.length > 4) threats.pop();
    }
    const first = threats[0];
    if (first) {
        let dodgeX = 0, dodgeY = 0, totalWeight = 0, primaryX = 0, primaryY = 0;
        for (const threat of threats) {
            const speed = Math.hypot(threat.vx, threat.vy);
            const nx = -threat.vy / speed, ny = threat.vx / speed;
            const step = threat.radius + 16;
            const score = (sign: number) => {
                const x = world.droneX + nx * sign * step, y = world.droneY + ny * sign * step;
                const bounded = clampCircleToGameplayRect(x, y, 9);
                const boundaryCost = Math.hypot(x - bounded.x, y - bounded.y) * 14;
                const leashCost = Math.max(0, Math.hypot(x - world.playerX, y - world.playerY) - 90) * 12;
                const clearance = Math.abs((x - threat.x) * nx + (y - threat.y) * ny);
                const commitment = nav!.dodgeUntil > world.elapsed ? (nx * sign * nav!.dodgeX + ny * sign * nav!.dodgeY) * 14 : 0;
                return clearance * 2 - boundaryCost - leashCost - Math.hypot(x - anchor.x, y - anchor.y) * .3 + commitment;
            };
            const sign = score(1) > score(-1) ? 1 : -1;
            if (threat === first) { primaryX = nx * sign; primaryY = ny * sign; }
            dodgeX += nx * sign * threat.risk; dodgeY += ny * sign * threat.risk; totalWeight += threat.risk;
        }
        // Commit briefly to a side; a substantially riskier new threat can override it.
        if (world.elapsed >= nav.dodgeUntil || first.id !== nav.threatId && first.risk > nav.threatRisk * 1.5) {
            // Opposing threats must not cancel the most urgent escape completely.
            if (Math.hypot(dodgeX, dodgeY) < totalWeight * .2) { dodgeX = primaryX; dodgeY = primaryY; }
            const length = Math.hypot(dodgeX, dodgeY);
            if (length > .01) {
                nav.dodgeX = dodgeX / length; nav.dodgeY = dodgeY / length;
                nav.dodgeUntil = world.elapsed + .16;
                nav.threatId = first.id; nav.threatRisk = first.risk;
            }
        }
        const urgency = Math.max(.25, Math.min(1, totalWeight / 5));
        const escortWeight = first.time < .18 ? .2 : .65;
        desiredVx = desiredVx * escortWeight + nav.dodgeX * 280 * urgency;
        desiredVy = desiredVy * escortWeight + nav.dodgeY * 280 * urgency;
    } else if (world.elapsed < nav.dodgeUntil) {
        desiredVx += nav.dodgeX * 100; desiredVy += nav.dodgeY * 100;
    }
    if (leash > 75) {
        const outward = (desiredVx * leashX + desiredVy * leashY) / leash;
        const allowed = Math.max(-300, (90 - leash) * 9);
        if (outward > allowed) {
            desiredVx -= leashX / leash * (outward - allowed);
            desiredVy -= leashY / leash * (outward - allowed);
        }
    }
    const speed = Math.hypot(desiredVx, desiredVy);
    if (speed > 300) { desiredVx *= 300 / speed; desiredVy *= 300 / speed; }
    const acceleration = first?.time < .18 ? 2400 : 1500;
    const dvx = desiredVx - nav.vx, dvy = desiredVy - nav.vy;
    const steering = Math.min(1, acceleration * dt / (Math.hypot(dvx, dvy) || 1));
    nav.vx += dvx * steering; nav.vy += dvy * steering;
    // Brake outward momentum near the hard leash; player dashes can stretch it temporarily.
    if (leash > 75) {
        const outward = (nav.vx * leashX + nav.vy * leashY) / leash;
        const allowed = Math.max(0, (90 - leash) / Math.max(dt, .001));
        if (outward > allowed) { nav.vx -= leashX / leash * (outward - allowed); nav.vy -= leashY / leash * (outward - allowed); }
    }
    const nextX = world.droneX + nav.vx * dt, nextY = world.droneY + nav.vy * dt;
    const next = clampCircleToGameplayRect(nextX, nextY, 9);
    if (next.x !== nextX) nav.vx = 0;
    if (next.y !== nextY) nav.vy = 0;
    world.droneX = next.x; world.droneY = next.y;
    // Keep inherited combat stats, regeneration and collision authority unchanged.
    const stats = getEffectiveAircraftStats(world.aircraft), ratio = getSkillRuntimeValues(world.aircraft, "escort_drone").damageMultiplier;
    const newMax = stats.maxHp * ratio;
    world.droneHp = Math.min(newMax, world.droneHp + stats.hpRegen * ratio * dt);
    world.droneMaxHp = newMax;
    world.droneArmor = stats.armor * ratio;
    world.droneInvulnerability = Math.max(0, world.droneInvulnerability - dt);
}
function clearHostileObjects(world: CombatWorld): void {
    resetMirage(world);
    resetMagneticHazards(world);
    resetStormbreaker(world);
    world.threats.length=0;world.scheduledAttacks.length=0;world.eliteSpecials.length=0;
    for (let i = world.projectiles.length - 1; i >= 0; i--)
        if (world.projectiles[i].owner === "enemy")
            recycleProjectile(world, i);
    for (let i = world.warnings.length - 1; i >= 0; i--)
        if (world.warnings[i].owner === "enemy") world.warnings.splice(i, 1);
}
/** Cancel through the normal lifecycle, then remove every Wave-7 damage owner.
 * Called at clear and again immediately before snapshot (countdown permits casts). */
function clearDuelTransients(world: CombatWorld): void {
    cancelTerra(world); cancelSylva(world); cancelArgent(world); cancelRiptide(world); cancelCinder(world); world.bigBang=undefined;
    stopAllSkills(world);
    clearHostileObjects(world);
    while (world.projectiles.length) recycleProjectile(world, world.projectiles.length - 1);
    while (world.particles.length) recycleParticle(world, world.particles.length - 1);
    world.warnings.length = world.effectQueue.length = world.visualEvents.length = 0;
    world.rankRuntime = undefined;
    // Includes released Orbit bullets and pending Starfall/meteor followups.
    if (world.astra) world.astra = { metrics: world.astra.metrics, flashes: [], burns: [], impacts: [] };
    world.tactical = undefined;
    world.skillCores = createSkillCoreRuntime();
    world.droneTargetId = null;
    world.droneHp = world.droneMaxHp = world.droneInvulnerability = 0;
    world.playerInvulnerability = world.playerDamageGraceUntil = 0;
    world.playerFireCooldown = world.droneFireCooldown = world.laserTickCooldown = world.decoyVolleyCd = 0;
    const equipment = equipmentState(world.aircraft);
    equipment.orb = undefined; equipment.fireCast = undefined;
    equipment.meteors.length = equipment.visuals.length = equipment.endedSkills.length = 0;
    equipment.marks = {}; equipment.effects = {}; equipment.presentationGate = {};
}
export function prepareMirrorDuel(world: CombatWorld): void {
    cancelTerra(world); cancelSylva(world); cancelArgent(world); cancelRiptide(world); cancelCinder(world); world.bigBang=undefined;
    clearDuelTransients(world);
    const state = world.aircraft, c = state.coreState;
    // Acquisition progress, consumed one-shot Cores and permanent build survive.
    const permanent = ["core_046", "core_047", "core_048", "crimsonCrit", ...(world.duel ? ["crimsonProgress"] : [])];
    c.stacks = Object.fromEntries(permanent.filter(key => key in c.stacks).map(key => [key, c.stacks[key]]));
    c.timers = {}; c.shields = {}; c.emergencyRepair = undefined;
    c.killTimes = []; c.lastKill = -Infinity; c.lastDamage = c.lastMove = c.time;
    const expansion = expansionState(state);
    c.expansion = { sequence: [], casts: {}, liveCasts: [], hpLoss: [], debt: [], charges: [], returns: [], endedShields: [],
        primarySkill: expansion.primarySkill, primaryPending: expansion.primaryPending };
    const release = releaseState(state);
    Object.assign(release, { heat: 0, overheatUntil: 0, ghosts: [], ghostReady: hasCore(state,220) ? c.time : Infinity,
        mark: undefined, markReady: hasCore(state,221) ? c.time + 16 : Infinity, hadActiveSkill: false, lastSkillEnd: c.time,
        aimShots: 0, aimBonusReady: false, misses: 0, aimReady: false, mode: undefined, nextMode: hasCore(state,222) ? c.time + 60 : Infinity });
    clearAircraftNegativeStatuses(state);
    state.cooldowns = {}; c.skillCooldownDurations = {}; c.deferredCooldowns = {};
    const stats = getEffectiveAircraftStats(state);
    c.syncedMaxHp = stats.maxHp;
    state.currentHp = stats.maxHp; state.currentResource = stats.maxResource;
}
function enterCountdownIfClear(world: CombatWorld): void {
    if (world.duel || world.ended || world.destruction || world.aftermath || world.waveState !== "combat" || world.spawnQueue.length || world.enemies.length)
        return;
    if (world.mirage && world.waveIndex === 7) return;
    if (world.mirage && world.waveIndex === 6) clearDuelTransients(world);
    else clearHostileObjects(world);
    world.waveState = "countdown";
    world.waveTimer = 3;
    world.latestMessage = null;
}
function updateEncounter(world: CombatWorld, dt: number): void {
    if (world.waveState !== "combat") {
        world.waveTimer = Math.max(0, world.waveTimer - dt);
        if (world.waveTimer > 0) return;
        if (world.waveState === "countdown") {
            if (!world.stage.waves[world.waveIndex + 1]) return;
            world.waveIndex++;
            world.spawnQueue = createWaveQueue(world.waveIndex, world.random, world.stage.waves);
            world.xpBudgetRemaining = world.stage.waves[world.waveIndex].xpBudget;
            world.xpWeightRemaining = world.spawnQueue.reduce((sum, type) => sum + ENEMY_CONFIGS[type].combatXp, 0);
            world.spawnedInWave = 0;
            world.eliteResolve=0;world.eliteComboIndex=0;world.eliteComboCooldown=world.stage.waves[world.waveIndex].elite===2?7:9;world.eliteCorridorSide=undefined;
            setMessage(world, world.stage.waves[world.waveIndex].label.toUpperCase(), 1.15);
        }
        // The wave banner is cosmetic: spawn and simulation resume immediately at zero.
        world.waveState = "combat";
        world.enemySpawnCooldown = 0;
    }
    if (world.mirage && world.waveIndex === 7) { updateMirrorEncounter(world, dt); return; }
    const wave = world.stage.waves[world.waveIndex];
    const mainAlive = world.enemies.filter(e => e.hp > 0 && !e.auxiliary);
    if (!world.spawnQueue.length && !mainAlive.length && world.stormbreaker) {
        for (let i = world.enemies.length - 1; i >= 0; i--) if (world.enemies[i].noWaveWait) recycleEnemy(world, i);
    }
    if (!world.spawnQueue.length && !mainAlive.length && world.magnetic) {
        // Surviving carrier drones complete their bounded, zero-reward final dive.
        for (let i = world.enemies.length - 1; i >= 0; i--) if (world.enemies[i].auxiliary && (world.enemies[i].type !== "micro_drone" || world.enemies[i].noWaveWait)) recycleEnemy(world, i);
    }
    if (!world.spawnQueue.length && !world.enemies.length && !world.bossDefeated) {
        enterCountdownIfClear(world);
        return;
    }
    world.enemySpawnCooldown -= dt;
    if (!world.spawnQueue.length || mainAlive.length >= wave.cap || world.enemySpawnCooldown > 0) return;
    if (world.stageId === 2 && wave.elite) {
        const batch = Math.min(world.spawnQueue.length, wave.cap - mainAlive.length);
        for (let i = 0; i < batch; i++) {
            const enemy = spawnEnemy(world, world.spawnQueue[0]);
            if (!enemy) break;
            enemy.magnetic = { clock: 0, attack: 0, anchorX: enemy.x, anchorY: enemy.y,
                angle: enemy.phaseSeed, slot: world.spawnedInWave, openerDelay: i * .3 };
            world.spawnQueue.shift(); world.spawnedInWave++;
        }
        world.enemySpawnCooldown = wave.interval;
        return;
    }
    let entry = spawnEnemy(world, world.spawnQueue[0]), queueIndex = 0;
    if (!entry && world.magnetic) {
        for (let i = 1; i < world.spawnQueue.length; i++) {
            if (world.spawnQueue[i] === world.spawnQueue[0]) continue;
            entry = spawnEnemy(world, world.spawnQueue[i]);
            if (entry) { queueIndex = i; break; }
        }
    }
    if (entry) {
        if ((world.magnetic || world.stormbreaker || world.mirage) && entry.type !== "boss") {
            const lane = world.spawnedInWave % 6;
            entry.x = GAMEPLAY_SAFE_RECT.left + 32 + lane * (GAMEPLAY_SAFE_RECT.width - 64) / 5;
            entry.phaseSeed = lane * Math.PI / 3;
        }
        world.spawnQueue.splice(queueIndex, 1);
        world.spawnedInWave++;
        world.enemySpawnCooldown = wave.interval;
        if (wave.groups) {
            let boundary = 0;
            for (const group of wave.groups) {
                boundary += group.length;
                if (boundary === world.spawnedInWave) { world.enemySpawnCooldown = .8; break; }
            }
        }
    }
}
function updateBossPhase(world: CombatWorld): void {
    const boss = world.enemies.find(e => e.type === "boss");
    if (!boss)
        return;
    const ratio = boss.hp / boss.maxHp, next = world.mirage ? (ratio > .7 ? 1 : ratio > .4 ? 2 : ratio >= .15 ? 3 : 4) : world.stormbreaker ? (ratio > .7 ? 1 : ratio > .35 ? 2 : ratio >= .15 ? 3 : 4) : world.magnetic ? (ratio > .75 ? 1 : ratio > .5 ? 2 : ratio > .25 ? 3 : ratio > .1 ? 4 : 5) : ratio >= .7 ? 1 : ratio >= .35 ? 2 : 3;
    if (next !== world.bossPhase) {
        world.bossPhase = next;
        setMessage(world, `${world.stage.bossName.toUpperCase()} · GIAI ĐOẠN ${next}`, 2);
    }
    while (boss.recentDamage.length && boss.recentDamage[0].time < world.aircraft.coreState.time - 1) boss.recentDamage.shift();
    if (ratio < .15)
        boss.aegisUntil = 0;
}
function updateEnemyAbilities(world: CombatWorld, enemy: EnemyEntity, dt: number): void {
    const attackDt=dt*rankEnemyFireRate(world,enemy)*sylvaFireRate(world,enemy);
    enemy.abilityCd -= attackDt;
    enemy.secondaryCd -= attackDt;
    enemy.tertiaryCd -= attackDt;
    if((enemy.skillLockedUntil??0)>world.elapsed)return;
    if (enemy.type === "jammer" && enemy.abilityCd <= 0) {
        for (const ally of world.enemies)
            if (ally.shieldSource === enemy.id) {
                ally.shield = 0;
                ally.shieldUntil = 0;
            }
        const allies = world.enemies.filter(e => e.id !== enemy.id && e.hp > 0 && enemyAllegiance(world,e)===enemyAllegiance(world,enemy) && Math.hypot(e.x - enemy.x, e.y - enemy.y) < 240);
        allies.sort((a, b) => Number(!["attacker", "bomber", "sniper"].includes(a.type)) - Number(!["attacker", "bomber", "sniper"].includes(b.type)) || Math.hypot(a.x - enemy.x, a.y - enemy.y) - Math.hypot(b.x - enemy.x, b.y - enemy.y));
        if(!allies[0]&&enemyAllegiance(world,enemy)==="friendly_hacked")createAbsorbShield(world.aircraft,`jammer:${enemy.id}`,getEffectiveAircraftStats(world.aircraft).maxHp*.25,3);
        if (allies[0]) {
            allies[0].shield = allies[0].maxHp * .25;
            allies[0].shieldUntil = world.aircraft.coreState.time + 3;
            allies[0].shieldSource = enemy.id;
        }
        enemy.abilityCd = 4.5;
    }
    if (enemy.type === "iron_fortress" && enemy.abilityCd <= 0) {
        enemy.shield = enemy.maxHp * (enemy.eliteWave === 2 ? .3 : .2);
        enemy.retaliationReady = true;
        enemy.shieldUntil = world.aircraft.coreState.time + 4;
        enemy.abilityCd = getEliteSpecialInterval(world,enemy,10);
    }
    if (enemy.type !== "boss")
        return;
    updateBossAttacks(world, enemy, dt);
}
function castBossEmp(world: CombatWorld, enemy: EnemyEntity, punishment=false): void {
    const enrage=enemy.hp/enemy.maxHp<.15, phase3=world.bossPhase>=3;
    const radius=enrage?72:phase3?64:56, warning=punishment?.75:enrage?.52:phase3?.62:.75;
    const payload: StatusPayload=punishment?{stun:2,skillLock:3,resourceJam:3.5,resourceMultiplier:.25}
        :{stun:enrage?2:phase3?1.8:1.4,skillLock:enrage?3:phase3?2.5:2,resourceJam:enrage?3.5:phase3?3:2.5,resourceMultiplier:enrage?.3:phase3?.35:.4};
    addWarning(world,"emp",world.playerX,world.playerY,radius,warning,112,"enemy",enemy.id,{sourceEnemyType:"boss",attackTag:"boss_emp",majorBossAttack:true,payload});
    setMessage(world,punishment?"TRUY SÁT · GIAO THỨC TRỪNG PHẠT":"LEVIATHAN · NGỤC EMP",warning);
}
function spawnBossPatternStep(world: CombatWorld, enemy: EnemyEntity): void {
    const state=enemy.bossAttack!, tuning=getBossTuning(enemy.hp/enemy.maxHp), attack=state.majorAttack;
    const index=state.patternIndex??0;
    if(attack==="sonic") {
        // Each ring draws its own continuous angle only when its warning begins.
        const lowerY=GAMEPLAY_SAFE_RECT.bottom-60;
        const left=Math.atan2(lowerY-enemy.y,GAMEPLAY_SAFE_RECT.left+30-enemy.x);
        const right=Math.atan2(lowerY-enemy.y,GAMEPLAY_SAFE_RECT.right-30-enemy.x);
        const safeAngle=right+world.random()*(left-right);
        if(world.warnings.length<AIR_COMBAT_WORLD.maxWarnings) world.warnings.push({id:world.nextId++,kind:"sonic",enemyId:enemy.id,sourceEnemyId:enemy.id,sourceEnemyType:"boss",attackTag:"boss_sonic",majorBossAttack:true,owner:"enemy",
            x:enemy.x,y:enemy.y,radius:24,ringRadius:0,ringIndex:index,ringSpeed:tuning.ringSpeed,safeAngle,safeArc:Math.max(tuning.safeArc*Math.PI/180,2*Math.atan2(hitboxProjectionExtent(getPlayerHitbox(world),-Math.sin(safeAngle),Math.cos(safeAngle))+2.5,Math.max(1,(lowerY-enemy.y)/Math.sin(safeAngle)-hitboxProjectionExtent(getPlayerHitbox(world),Math.cos(safeAngle),Math.sin(safeAngle))))),stage:"warning",remaining:tuning.sonicWarning,totalDuration:tuning.sonicWarning,rawDamage:tuning.sonic});
        state.patternTimer=tuning.ringInterval;
    } else if(attack==="lane_laser") {
        const width=GAMEPLAY_SAFE_RECT.width/tuning.laneCount, safe=Math.floor(world.random()*tuning.laneCount);
        const clearance=Math.max(width,hitboxProjectionExtent(getPlayerHitbox(world),1,0)*2+5);
        const centre=Math.max(GAMEPLAY_SAFE_RECT.left+clearance/2,Math.min(GAMEPLAY_SAFE_RECT.right-clearance/2,GAMEPLAY_SAFE_RECT.left+(safe+.5)*width));
        for(let lane=0;lane<tuning.laneCount;lane++) if(lane!==safe && world.warnings.length<AIR_COMBAT_WORLD.maxWarnings) {
            const left=Math.max(GAMEPLAY_SAFE_RECT.left+lane*width,lane>safe?centre+clearance/2:GAMEPLAY_SAFE_RECT.left);
            const right=Math.min(GAMEPLAY_SAFE_RECT.left+(lane+1)*width,lane<safe?centre-clearance/2:GAMEPLAY_SAFE_RECT.right);
            if(right<=left)continue;
            world.warnings.push({id:world.nextId++,kind:"lane_laser",enemyId:enemy.id,sourceEnemyId:enemy.id,sourceEnemyType:"boss",attackTag:"boss_lane",majorBossAttack:true,owner:"enemy",x:(left+right)/2,y:GAMEPLAY_SAFE_RECT.top,radius:0,laneIndex:lane,laneWidth:right-left,stage:"warning",remaining:tuning.laneWarning,totalDuration:tuning.laneWarning,activeDuration:tuning.laneActive,rawDamage:tuning.lane});
        }
        state.patternWaiting=true;
        state.patternTimer=tuning.laneRecovery;
    } else if(attack==="dash") {
        const target=targetPosition(world,chooseEnemyTarget(world,false,enemy));
        const warning=index===0?tuning.dashWarning:enemy.hp/enemy.maxHp<.15?.48:.54;
        if(target) { const point=clampCircleToGameplayRect(target.x,target.y,enemy.radius); addLineWarning(world,enemy,"dash",point.x,Math.max(bossMinCenterY(enemy.radius),point.y),warning,tuning.dash); }
        state.patternWaiting=true;
        state.patternTimer=enemy.hp/enemy.maxHp<.15?.39:.46;
    }
    state.patternRemaining=Math.max(0,(state.patternRemaining??0)-1); state.patternIndex=index+1;
}
function startBossMajor(world: CombatWorld, enemy: EnemyEntity, attack: BossMajorAttack): void {
    const state=enemy.bossAttack!, tuning=getBossTuning(enemy.hp/enemy.maxHp);
    state.majorAttack=attack;state.majorAge=0;state.patternRemaining=0;state.patternIndex=0;state.patternWaiting=false;state.stepResolved=false;
    if(attack==="fan") {
        state.fanPending=world.bossPhase===1?1:world.bossPhase===2?3:5;
        state.fanIndex=0;state.fanTimer=0;state.fanReverse=world.random()<.5;
        return;
    }
    if(attack==="sonic" || attack==="lane_laser" || attack==="dash") {
        state.patternRemaining=attack==="sonic"?tuning.rings:attack==="lane_laser"?tuning.laneSteps:(world.bossPhase>=3?2:1);
        spawnBossPatternStep(world,enemy);
        setMessage(world,attack==="sonic"?"SÓNG ÂM PHÂN CỰC":attack==="lane_laser"?"CHUYỂN LÀN HỎA LỰC":"LEVIATHAN · ĐỘT KÍCH",1);
    } else if(attack==="crossfire_curtain") {
        state.crossfirePending=enemy.hp/enemy.maxHp<.15?4:world.bossPhase>=3?3:2;
        chargeCrossfire(world,enemy);
    } else if(attack==="emp") castBossEmp(world,enemy);
    else {
        state.missilesPending=tuning.missiles;state.missileIndex=0;state.missileCooldown=0;state.missileTuning=tuning;
        setMessage(world,"TÊN LỬA GỌNG KÌM",1);
    }
}
function launchBossMissile(world: CombatWorld, enemy: EnemyEntity): void {
    const state = enemy.bossAttack!, tuning = state.missileTuning;
    const side = state.missileIndex % 2 ? 1 : -1;
    const heading = Math.PI / 2 - side * .65;
    const p = addProjectile(world, { owner: "enemy", enemySpeedClass:"special", appearance: "boss", criticalAttack: true, x: enemy.x + side * 30, y: enemy.y + 20,
        vx: 0, vy: 0, rawDamage: tuning.missile, radius: 5, homing: true,
        targetId: chooseEnemyTarget(world, true), turnRate: side<0?(world.bossPhase>=3?1.2:1.15):(world.bossPhase>=3?.7:.75), lifetime: 9, color: "#ff526e", sourceEnemyId: enemy.id, sourceEnemyType: "boss", attackTag: "boss_missile", majorBossAttack: true });
    if (!p) return;
    Object.assign(p, { projectileKind: "boss_missile", missileState: "loiter", heading,
        cruiseSpeed: (side<0?tuning.missileSpeed:world.bossPhase>=3?245:225) * tuning.speedScale, speed: 0, acceleration: 220, angularAcceleration: 4 });
    state.missileIndex++;
    state.missilesPending--;
    state.missileCooldown = .26 * tuning.cadence;
}
/** Corridor is authored before the wing cue. Bullets bank away at its edge;
 * neither their center nor radius can invade the advertised vertical corridor. */
function chargeCrossfire(world: CombatWorld, enemy: EnemyEntity): void {
    const state=enemy.bossAttack!, enrage=enemy.hp/enemy.maxHp<.15;
    state.crossfireWidth=Math.max(enrage?42:world.bossPhase>=3?54:74,hitboxProjectionExtent(getPlayerHitbox(world),1,0)*2+5);
    const half=state.crossfireWidth/2;
    state.crossfireCenter=Math.max(GAMEPLAY_SAFE_RECT.left+half+12,Math.min(GAMEPLAY_SAFE_RECT.right-half-12,enemy.x+(world.random()-.5)*32));
    state.crossfireTimer=.33;
    setMessage(world,"MÀN ĐẠN GIAO THOA",.8);
}
function fireCrossfire(world: CombatWorld, enemy: EnemyEntity): void {
    const state=enemy.bossAttack!, tuning=getBossTuning(enemy.hp/enemy.maxHp);
    const count=enemy.hp/enemy.maxHp<.15?11:world.bossPhase>=3?9:7;
    const half=state.crossfireWidth!/2;
    if(!reserveBossVolley(world,count*2))return;
    for(const side of [-1,1]) {
        const edge=state.crossfireCenter!+side*half;
        const wingX=side<0?Math.min(enemy.x-64,edge-7):Math.max(enemy.x+64,edge+7);
        for(let i=0;i<count;i++) {
            // Parallel diagonal rows form the curtain; no random aim or CC payload.
            const angle=Math.PI/2+side*(.28+i*.055), speed=155+i*3;
            addProjectile(world,{owner:"enemy",enemySpeedClass:"fan",appearance:"boss",criticalAttack:true,sourceEnemyId:enemy.id,sourceEnemyType:"boss",attackTag:"boss_crossfire",majorBossAttack:true,
                x:wingX,y:enemy.y+18-i*6,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,radius:3.5,rawDamage:tuning.fan*.8,lifetime:3.2,corridorEdge:edge,corridorSide:side});
        }
    }
    state.crossfirePending!--;
    if(state.crossfirePending!>0) { state.crossfireTimer=.42; state.patternWaiting=true; }
}
function fireSuppressiveWing(world: CombatWorld, enemy: EnemyEntity, side: number, count: number): void {
    const tuning=getBossTuning(enemy.hp/enemy.maxHp);
    let live=world.projectiles.reduce((n,p)=>n+Number(p.suppressive),0);
    const hostileCount=world.projectiles.reduce((n,p)=>n+Number(p.owner==="enemy"),0);
    if(hostileCount>=AIR_COMBAT_WORLD.maxEnemyProjectiles-80) return; // reserve a complete major volley
    const target=targetPosition(world,chooseEnemyTarget(world,false,enemy));
    if(!target)return;
    const x=enemy.x+side*38,y=enemy.y+20, aim=Math.atan2(target.y-y,target.x-x);
    for(let i=0;i<count && live<tuning.suppressiveBudget;i++,live++) {
        const angle=aim+(i-(count-1)/2)*.18;
        addProjectile(world,{owner:"enemy",enemySpeedClass:count>1?"fan":"standard",appearance:"boss",suppressive:true,x,y,vx:Math.cos(angle)*150,vy:Math.sin(angle)*150,radius:3,
            rawDamage:tuning.wing*.55,sourceEnemyId:enemy.id,sourceEnemyType:"boss",attackTag:"boss_suppressive",lifetime:5});
    }
}
function updateBossSuppressive(world: CombatWorld, enemy: EnemyEntity, dt:number):void {
    const state=enemy.bossAttack!, tuning=getBossTuning(enemy.hp/enemy.maxHp), enrage=enemy.hp/enemy.maxHp<.15;
    // Locked ram geometry keeps its wing cues clear. Sonic deliberately uses sparse pressure.
    if(state.majorAttack==="dash" && !state.stepResolved)return;
    if((state.oppositeShotTimer??0)>0) {
        state.oppositeShotTimer!-=dt;
        if(state.oppositeShotTimer!<=0)fireSuppressiveWing(world,enemy,state.oppositeSide??1,1);
    }
    state.suppressiveClock=(state.suppressiveClock??.4)-dt;
    if(state.suppressiveClock>0)return;
    state.suppressiveClock=tuning.wingInterval;
    const index=state.suppressiveIndex??0, side=index%2?1:-1;
    const sparse=state.majorAttack==="sonic";
    const count=sparse?1:enrage?5:world.bossPhase>=3?(index%2?3:5):world.bossPhase===2?(index%3===2?3:1):1;
    fireSuppressiveWing(world,enemy,side,count);
    if(!sparse && (world.bossPhase>=3 || index%4===3))fireSuppressiveWing(world,enemy,-side,world.bossPhase>=3?count:1);
    if(enrage && !sparse && index%3===2){state.oppositeShotTimer=.2;state.oppositeSide=-side;}
    state.suppressiveIndex=index+1;
}
function updateBossAttacks(world: CombatWorld, enemy: EnemyEntity, dt: number): void {
    const state=enemy.bossAttack!, tuning=getBossTuning(enemy.hp/enemy.maxHp), enrage=enemy.hp/enemy.maxHp<.15;
    state.majorAge+=dt;
    updateBossSuppressive(world,enemy,dt);
    if(state.missilesPending>0) {state.missileCooldown-=dt;if(state.missileCooldown<=0)launchBossMissile(world,enemy);}
    if((state.patternRemaining??0)>0) {
        const activeStep=enemy.dashRemaining>0 || world.warnings.some(w=>w.enemyId===enemy.id && w.kind===state.majorAttack);
        if(!state.patternWaiting || !activeStep) {
            state.patternTimer=(state.patternTimer??0)-dt;
            if(state.patternTimer<=0)spawnBossPatternStep(world,enemy);
        }
    }
    if((state.crossfirePending??0)>0) {
        state.crossfireTimer!-=dt;
        if(state.crossfireTimer!<=0) {
            if(state.patternWaiting){state.patternWaiting=false;state.crossfireTimer=.33;}
            else fireCrossfire(world,enemy);
        }
    }
    if((state.fanPending??0)>0) {
        state.fanTimer=(state.fanTimer??0)-dt;
        if(state.fanTimer<=0) {
            const count=world.bossPhase===1?1:world.bossPhase===2?3:5, index=state.fanIndex??0;
            const degrees=count===1?0:count===3?-12+index*12:-16+index*8;
            if(fireFan(world,enemy,tuning.fanCount,tuning.fan,Math.PI/2+degrees*Math.PI/180*(state.fanReverse?-1:1),1.26/(tuning.fanCount-1),155*tuning.speedScale,"boss_fan")) {
                state.fanIndex=index+1;state.fanPending!--;state.fanTimer=enrage?.125:world.bossPhase>=3?.15:.18;
            }
        }
    }
    const busy=(state.patternRemaining??0)>0 || (state.crossfirePending??0)>0 || (state.fanPending??0)>0 || state.missilesPending>0 || enemy.dashRemaining>0
        || world.warnings.some(w=>w.enemyId===enemy.id && ["sonic","lane_laser","dash","emp"].includes(w.kind));
    if(busy)return;
    // Resolution, not elapsed combo timestamps, arms the intentional follow-up delay.
    if(state.majorAttack && !state.stepResolved) {
        state.stepResolved=true;
        state.followupRemaining=enrage?.28:world.bossPhase>=3?(state.majorAttack==="dash"?.4:.35):state.majorAttack==="sonic"?.5:.45;
        if(!state.comboSteps?.length && !state.punishmentFollowup){state.majorAttack=null;state.majorCooldown=tuning.recovery;}
        return;
    }
    if(state.punishmentFollowup && world.elapsed>=state.punishmentFollowup) {
        state.punishmentFollowup=undefined;
        state.comboSteps=["homing_missiles",...(state.comboSteps??[])];
    }
    if(state.comboSteps?.length) {
        state.followupRemaining=(state.followupRemaining??0)-dt;
        if(state.followupRemaining>0)return;
        const next=state.comboSteps[0];
        // Only contradictory authored geometry waits; ordinary fan/missiles keep travelling.
        if((next==="sonic" || next==="lane_laser") && world.projectiles.some(p=>p.sourceEnemyId===enemy.id && p.attackTag==="boss_crossfire"))return;
        startBossMajor(world,enemy,state.comboSteps.shift()!);return;
    }
    state.majorCooldown-=dt;
    if(state.majorCooldown>0)return;
    const advanced=world.bossPhase>=3;
    const choices: NonNullable<BossAttackState["comboId"]>[]=world.bossPhase===1?["sonic_wing","fan_wing"]:advanced?["pincer_sweep","lane_ram","sonic_crossfire","emp_pincer","ram_curtain"]:["pincer_sweep","lane_wing","crossfire_hunt","sonic_emp","ram_sweep"];
    state.comboId=choices[Math.floor(world.random()*choices.length)];
    const decks:Record<NonNullable<BossAttackState["comboId"]>,BossMajorAttack[]>={
        sonic_wing:["sonic"],fan_wing:["fan"],
        pincer_sweep:advanced?["homing_missiles","fan","emp"]:["homing_missiles","fan"],
        lane_wing:["lane_laser","emp"],crossfire_hunt:["crossfire_curtain","dash"],
        sonic_emp:["sonic","emp"],ram_sweep:["dash","fan"],lane_ram:["lane_laser","dash"],
        sonic_crossfire:["sonic","crossfire_curtain"],emp_pincer:["emp","homing_missiles","fan"],ram_curtain:["dash","crossfire_curtain"],
    };
    state.comboSteps=decks[state.comboId];
    // Never start a contradictory major field over a surviving Crossfire curtain.
    if(["sonic","lane_laser"].includes(state.comboSteps[0]) && world.projectiles.some(p=>p.sourceEnemyId===enemy.id && p.attackTag==="boss_crossfire")) {state.followupRemaining=0;return;}
    startBossMajor(world,enemy,state.comboSteps.shift()!);
}
/** Unit allegiance expires immediately; committed attacks keep their own snapshot. */
export function enemyAllegiance(world:CombatWorld,enemy?:EnemyEntity):Allegiance {
    if(enemy?.attackAllegiance)return enemy.attackAllegiance;
    if(enemy && enemy.type!=="boss" && enemy.type!=="satellite" && !isStormObjective(enemy.type) && (enemy.hackedUntil??0)>world.elapsed)return "friendly_hacked";
    return enemy?.inheritedAllegiance??"hostile";
}
export const isHostileToPlayer=(world:CombatWorld,e:EnemyEntity)=>e.hp>0 && enemyAllegiance(world,e)==="hostile";
/** Shared live value for Core 118 damage and its status badge; 18% cap. */
export function crowdDamageBonus(world: CombatWorld): number {
    let hostile = 0, friendly = 1 + Number(droneCombatActive(world));
    for (const enemy of world.enemies) if (enemy.hp > 0) {
        if (isHostileToPlayer(world, enemy)) hostile++;
        else friendly++;
    }
    return Math.min(.24, .04+Math.max(0, hostile - friendly) * .02);
}
function canAttackEnemy(world:CombatWorld,allegiance:Allegiance,e:EnemyEntity,sourceId?:number):boolean {
    return e.hp>0 && e.id!==sourceId && (allegiance==="hostile" ? enemyAllegiance(world,e)==="friendly_hacked" : isHostileToPlayer(world,e));
}
function tacticalState(world:CombatWorld):TacticalCoreState {
    return world.tactical??={scraps:[],grids:[],openingHits:new Map(),previousStatuses:new Set(),hackTargets:[],hackEnd:0};
}
const ordinaryHostileBullet=(p:ProjectileEntity)=>p.owner==="enemy" && p.allegiance!=="friendly_hacked" && p.projectileKind==="bullet" && !p.homing && p.attackTag!=="rail";
function cBank(state:AircraftCombatState,gain:number):void {state.coreState.stacks.antimatter=Math.min(getEffectiveAircraftStats(state).firepower*4.5,(state.coreState.stacks.antimatter??0)+gain);}
function recordCrossfire(world:CombatWorld,e:EnemyEntity):void {
    if(!hasCore(world.aircraft,112))return;
    const t=tacticalState(world),last=t.lastWeaponHit;
    if(last && last.id!==e.id && world.elapsed-last.time<=1.2 && !t.grids.some(g=>g.until>world.elapsed&&((g.a===last.id&&g.b===e.id)||(g.b===last.id&&g.a===e.id))) && t.grids.length<32 && world.enemies.some(a=>a.id===last.id&&isHostileToPlayer(world,a)))
        t.grids.push({id:world.nextId++,a:last.id,b:e.id,until:world.elapsed+3,raw:getEffectiveAircraftStats(world.aircraft).firepower*3,hits:new Set()});
    t.lastWeaponHit={id:e.id,time:world.elapsed};
}
function activateTacticalCores(world:CombatWorld,usedSkill:SkillId):void {
    const state=world.aircraft,t=tacticalState(world),c=state.coreState;
    if(hasCore(state,119)){state.coreState.timers.timeRecovery=world.elapsed+4;const other=AIRCRAFT_CONFIGS[state.aircraftId].skillIds.filter(id=>id!==usedSkill&&!isUltimate(id)).sort((a,b)=>(state.cooldowns[b]??0)-(state.cooldowns[a]??0))[0];if(other){const before=state.cooldowns[other]??0;reduceRunningSkillCooldown(state,other,7);recordCoreMetric(state,119,"cooldown",before-state.cooldowns[other]!);}}
    const units=c.stacks.antimatter??0;
    if(hasCore(state,121)&&units>0){
        c.stacks.antimatter=0;
        const raw=Math.min(getEffectiveAircraftStats(state).firepower*4.5,units);
        emitVisual(world,{kind:"emp_pulse",x:world.playerX,y:world.playerY,size:900});
        c.timers.antimatterWave=c.time+.65;
        for(const e of world.enemies)if(isHostileToPlayer(world,e))applyDamageToEnemy(world,e,raw,"#a5f3fc","core",undefined,undefined,undefined,"shockwave",false,true,121);
        resolveDeathsAndEffects(world);
    }
}
function activeNegativeStatuses(world:CombatWorld):Set<string> {
    return activeNegativeStatusTypes(world.aircraft);
}
function observeComeback(world:CombatWorld):void {
    const t=tacticalState(world),active=activeNegativeStatuses(world);
    const s=world.aircraft;
    if(hasCore(s,183)&&[...t.previousStatuses].some(key=>!active.has(key))&&coreCooldownReady(s,"depthGuard")){
      const sh=createAbsorbShield(s,"depthGuard",getEffectiveAircraftStats(s).maxHp*.05,3);sh.coreRow=183;deferCoreCooldown(s,"depthGuard");recordCoreMetric(s,183,"shieldCreated",sh.amount);
    }
    if(hasCore(world.aircraft,98)&&[...t.previousStatuses].some(key=>!active.has(key))){world.aircraft.coreState.timers.comeback=world.aircraft.coreState.time+5;recordCoreMetric(world.aircraft,98,"procs",1);}
    t.previousStatuses=active;
}
function rearmAllegiance(world:CombatWorld,e:EnemyEntity):void {
    world.threats=world.threats.filter(t=>t.enemyId!==e.id);
    delete world.aircraft.coreState.shields[`jammer:${e.id}`];
    for(const ally of world.enemies)if(ally.shieldSource===e.id&&enemyAllegiance(world,ally)!==enemyAllegiance(world,e)){ally.shield=0;ally.shieldUntil=0;}
    // Warnings/hazards/dashes already committed retain their ownership and timing.
    if(e.riftAttackReadyAt!==undefined && world.elapsed<e.riftAttackReadyAt)return;
    const target=targetPosition(world,chooseEnemyTarget(world,true,e));
    // Preserve committed burst/dash aim; only uncommitted movement may retarget.
    if(target){
        if(e.burst<=0)e.burstAngle=Math.atan2(target.y-e.y,target.x-e.x);
        if(e.kamikazeState==="charge"){e.lockedX=target.x;e.lockedY=target.y;}
    }
}
function collectScrap(world:CombatWorld):void {
    if(!world.tactical?.scraps.length)return;
    const t=world.tactical,state=world.aircraft,now=world.elapsed;
    t.scraps=t.scraps.filter(scrap=>{
        if(scrap.until<=now)return false;
        if(Math.hypot(scrap.x-world.playerX,scrap.y-world.playerY)<=100 || circleVsAircraft(scrap.x,scrap.y,5,getPlayerHitbox(world))){healPlayerWithFeedback(world,getEffectiveAircraftStats(state).maxHp*.03,"core",false,64);recordCoreMetric(state,64,"scraps",1);emitVisual(world,{kind:"absorb",x:scrap.x,y:scrap.y,size:18});return false;}return true;
    });
}
/** The queue is the only spawn source, including delayed interval spawns.
 * Called after spawning and death resolution as well as before target acquisition. */
function settleControlOverride(world:CombatWorld):void {
    const t=world.tactical;
    if(!t?.hackMode)return;
    t.hackTargets=t.hackTargets.filter(id=>world.enemies.some(e=>e.id===id&&e.hp>0));
    const fullySpawned=world.waveState==="combat"&&world.spawnQueue.length===0;
    const lastAllies=t.hackMode!=="boss_stun"&&t.hackTargets.length>0&&fullySpawned&&
        !world.enemies.some(e=>isHostileToPlayer(world,e));
    const cohortDefeated=t.hackMode!=="boss_stun"&&t.hackTargets.length===0;
    if(world.elapsed<t.hackEnd&&!lastAllies&&!cohortDefeated)return;
    const endedAt=Math.min(world.elapsed,t.hackEnd);
    const survivors=world.enemies.filter(e=>t.hackTargets.includes(e.id)&&e.hp>0);
    for(const e of survivors)e.hackedUntil=0;
    for(const e of survivors)rearmAllegiance(world,e);
    t.hackTargets=[];t.hackMode=undefined;t.hackEnd=0;
    world.aircraft.coreState.timers.controlOverride=world.aircraft.coreState.time-(world.elapsed-endedAt)+13;
}
function updateTacticalCores(world:CombatWorld,dt:number):void {
    const t=tacticalState(world),state=world.aircraft,c=state.coreState,now=world.elapsed;
    observeComeback(world);
    collectScrap(world);
    settleControlOverride(world);
    if(hasCore(state,120)&&!t.hackMode&&(c.timers.controlOverride??0)<=c.time&&world.waveState==="combat"){
        const eliteWave=world.stage.waves[world.waveIndex].elite>0;
        const bossWave=Boolean(world.stage.waves[world.waveIndex].counts.boss);
        const candidates=world.enemies.filter(e=>!e.aircraftTarget && isHostileToPlayer(world,e) && canTargetEnemy(world,e) && e.type!=="satellite" && !isStormObjective(e.type) &&
            (bossWave?e.type==="boss":eliteWave?isElite(e.type):e.type!=="boss"&&!isElite(e.type)));
        candidates.sort((a,b)=>b.hp/b.maxHp-a.hp/a.maxHp||a.id-b.id);
        const cohort=candidates.slice(0,bossWave||eliteWave?1:5);
        if(cohort.length){
            recordCoreMetric(state,120,bossWave?"bossStuns":"hacked",cohort.length);
            t.hackMode=bossWave?"boss_stun":eliteWave?"elite":"normal";
            t.hackEnd=now+(bossWave?2:eliteWave?9:12);
            t.hackTargets=bossWave?[]:cohort.map(e=>e.id);
            // Assign the entire cohort before retargeting any member.
            for(const e of cohort){
                if(bossWave){e.stun=extendStatusRemaining(e,"stun",e.stun,2,now);(e.expansionMarks??={}).controlWeakness=now+4;}
                else e.hackedUntil=t.hackEnd;
            }
            for(const e of cohort){
                if(!bossWave)rearmAllegiance(world,e);
                emitVisual(world,{kind:"emp_pulse",x:e.x,y:e.y,size:60});
            }
            settleControlOverride(world);
        }
    }
    // Persistent hazards hit opposing aircraft under their spawn-time ownership.
    for(const w of world.warnings)if(w.stage==="active"&&w.kind==="acid"){
        const timers=w.victimTimers??=new Map<number,number>();
        for(const e of world.enemies)if(canAttackEnemy(world,w.allegiance??"hostile",e,w.sourceEnemyId)){
            if(!circleVsAircraft(w.x,w.y,w.radius,getEnemyHitbox(e))){timers.delete(e.id);continue;}
            const remaining=(timers.get(e.id)??.25)-dt;timers.set(e.id,remaining<=0?remaining+1:remaining);
            if(remaining<=0)damageEnemyAttack(world,e,w.rawDamage,w);
        }
    }
}
function updateCrossfireGrids(world:CombatWorld):void {
    const t=tacticalState(world),now=world.elapsed;
    t.grids=t.grids.filter(g=>{
        const a=world.enemies.find(e=>e.id===g.a&&isHostileToPlayer(world,e)&&canTargetEnemy(world,e)),b=world.enemies.find(e=>e.id===g.b&&isHostileToPlayer(world,e)&&canTargetEnemy(world,e));
        if(g.until<=now||!a||!b)return false;
        for(const e of world.enemies)if(isHostileToPlayer(world,e)&&g.hits.size<3&&!g.hits.has(e.id)&&segmentVsAircraft(a.x,a.y,b.x,b.y,2,getEnemyHitbox(e),projectileContact).hit){g.hits.add(e.id);applyDamageToEnemy(world,e,g.raw,"#67e8f9","core",undefined,undefined,undefined,"area_hazard",true,true,112);}
        return a.hp>0&&b.hp>0;
    });
    resolveDeathsAndEffects(world);
}
function damageEnemyAttack(world:CombatWorld,target:EnemyEntity,raw:number,attack:AttackMetadata,contact?:{x:number;y:number;zone?:AirframeHitZone}):number {
    const allegiance=attack.allegiance??"hostile";
    raw *= enemyOutputMultiplier(world,attack.sourceEnemyId)*(allegiance==="friendly_hacked"?1.30:1);
    if(!canAttackEnemy(world,allegiance,target,attack.sourceEnemyId))return 0;
    let damage:number;
    if(allegiance!=="hostile")damage=applyDamageToEnemy(world,target,raw,"#67e8f9","core",undefined,undefined,contact,attack.delivery??(contact?"direct_projectile":"area_hazard"),true,false);
    else {
        damage=calculateDamage(raw*(contact?wingDamageMultiplier(contact.zone):1),sylvaArmor(world,target,target.armor*((target.armorBrokenUntil??0)>world.elapsed?.7:1)))*stormDamageTakenMultiplier(world,target);
        const shieldBefore=target.shield,absorbed=Math.min(target.shield,damage);target.shield-=absorbed;damage=Math.min(target.hp,damage-absorbed);target.hp-=damage;
        if(world.stormbreaker)onStormEnemyDamage(world,target,damage,shieldBefore,stormbreakerHooks);
        accumulateDeathMark(world,target,damage+absorbed);
        emitVisual(world,{kind:"damage_number",x:target.x,y:target.y,size:target.radius,hpDamage:damage,shieldAbsorbed:absorbed,target:"enemy",critical:false,entityId:target.id});
        if(absorbed>0&&target.shield<=0&&target.type==="iron_fortress"&&target.retaliationReady){target.retaliationReady=false;queueEliteSpecial(world,target,"retaliation",.01,false);}
    }
    if(damage<=0)return damage;
    const now=world.elapsed,source=world.enemies.find(e=>e.id===attack.sourceEnemyId),marks=target.combatMarks??={};
    const mark=(key:string,duration:number,threshold:number)=>{const m=marks[key];const count=m&&m.until>now?m.count+1:1;marks[key]={count,until:now+duration};statusExpiry(marks[key],'until',now,duration);if(count>=threshold){delete marks[key];return true;}return false;};
    const payload=attack.payload;
    if(payload?.stun)target.stun=extendStatusRemaining(target,"stun",target.stun,payload.stun,world.elapsed);
    if(payload?.skillLock)target.skillLockedUntil=extendStatusExpiry(target,"skillLockedUntil",target.skillLockedUntil??0,now+payload.skillLock,now);
    if(payload?.armorBreak)target.armorBrokenUntil=extendStatusExpiry(target,"armorBrokenUntil",target.armorBrokenUntil??0,now+payload.armorBreak,now);
    if(attack.attackTag==="acid"&&mark("corrosion",6,3)){target.armorBrokenUntil=statusExpiry(target,"armorBrokenUntil",now,4);if(source?.eliteWave===2)queueEliteSpecial(world,source,"acid_cage",1.2,false);}
    if(source?.type==="elite"&&mark("hunterMark",source.eliteWave===2?3.5:4,source.eliteWave===2?2:3))queueEliteSpecial(world,source,"execution",.1,false);
    if(source?.type==="iron_fortress"&&(attack.attackTag==="basic"||attack.attackTag==="burst")&&mark("suppression",4,source.eliteWave===2?3:4))queueEliteSpecial(world,source,"clamp",.1,true);
    if(source?.type==="radar_hunter"){
        if(attack.attackTag==="rail")marks.targetLock={count:1,until:now+4};
        else if(attack.attackTag==="radar_lock"&&(marks.targetLock?.until??0)>now){delete marks.targetLock;target.stun=extendStatusRemaining(target,"stun",target.stun,1.5,now);target.skillLockedUntil=statusExpiry(target,"skillLockedUntil",now,2.2);queueEliteSpecial(world,source,"radar_followup",.6,false);}
    }
    return damage;
}
function rayToHunterEdge(enemy:EnemyEntity,ux:number,uy:number):number {
    const far=2000,h=getEnemyHitbox(enemy),end=clampHitboxToGameplayRect(enemy.x+ux*far,enemy.y+uy*far,h,true);
    let distance=far;
    if(Math.abs(ux)>1e-8)distance=Math.min(distance,Math.max(0,(end.x-enemy.x)/ux));
    if(Math.abs(uy)>1e-8)distance=Math.min(distance,Math.max(0,(end.y-enemy.y)/uy));
    return distance;
}
/** Only an actual body impact resolves a living hunter. Misses never award XP. */
function resolveKamikaze(world: CombatWorld, enemy: EnemyEntity): void {
    if (enemy.kamikazeState === "resolved") return;
    enemy.kamikazeState = "resolved";
    world.threats = world.threats.filter(t => t.enemyId !== enemy.id);
    enemy.hp = 0;
}
const bodyContact=createHitResult(), projectileContact=createHitResult();
const interceptor:AircraftHitbox={x:0,y:0,radius:0,shapes:[{kind:"capsule",ax:0,ay:0,bx:0,by:0,r:0}]};
function updateKamikaze(world: CombatWorld, enemy: EnemyEntity, dt: number): void {
    if(world.ended || enemy.hp<=0)return;
    const state=enemy.kamikazeState??"approach";
    if(state==="resolved")return;
    if(state==="approach" && enemy.riftWait && enemy.riftAttackReadyAt!==undefined && world.elapsed<enemy.riftAttackReadyAt) {
        // Roam around the spawn formation without acquiring a target or showing charge.
        const wait=enemy.riftWait, age=world.elapsed-wait.spawnedAt, angle=wait.phase+age*1.4;
        const x=wait.x+18*(Math.cos(angle)-Math.cos(wait.phase));
        const y=wait.y+14*(Math.sin(angle)-Math.sin(wait.phase));
        const point=clampHitboxToGameplayRect(x,y,getEnemyHitbox(enemy),true);
        enemy.x=point.x;enemy.y=point.y;
        return;
    }
    if(state==="approach" || state==="recover") {
        enemy.stateTimer=Math.max(0,(enemy.stateTimer??0)-dt);
        if(enemy.stateTimer>0)return;
        const target=targetPosition(world,chooseEnemyTarget(world,true,enemy));
        if(!target)return;
        enemy.lockedX=target.x;enemy.lockedY=target.y;
        const angle=Math.atan2(target.y-enemy.y,target.x-enemy.x),ux=Math.cos(angle),uy=Math.sin(angle),travel=rayToHunterEdge(enemy,ux,uy);
        enemy.dashEndX=enemy.x+ux*travel;enemy.dashEndY=enemy.y+uy*travel;
        enemy.kamikazeState="charge";enemy.stateTimer=state==="approach"?1.2:.7;
        enemy.dashCharge=enemy.stateTimer;enemy.attackAge=0;
        return;
    }

    if(state==="charge") {
        const target=targetPosition(world,chooseEnemyTarget(world,true,enemy));
        if(target){enemy.lockedX=target.x;enemy.lockedY=target.y;
            const angle=Math.atan2(target.y-enemy.y,target.x-enemy.x),ux=Math.cos(angle),uy=Math.sin(angle),travel=rayToHunterEdge(enemy,ux,uy);
            enemy.dashEndX=enemy.x+ux*travel;enemy.dashEndY=enemy.y+uy*travel;
        }
        enemy.stateTimer=Math.max(0,(enemy.stateTimer??0)-dt);enemy.dashCharge=enemy.stateTimer;
        if(enemy.stateTimer>0)return;
        const dx=enemy.lockedX!-enemy.x,dy=enemy.lockedY!-enemy.y,distance=Math.hypot(dx,dy);
        let ux=distance>.001?dx/distance:0,uy=distance>.001?dy/distance:1;
        enemy.airframeRotation=Math.atan2(uy,ux)+Math.PI/2;
        let travel=rayToHunterEdge(enemy,ux,uy);
        // A target can fit closer to the boundary than the hunter. Launch inward
        // when its aimed ray has no navigable length; never teleport the hunter.
        if(travel<1){ux=-ux;uy=-uy;enemy.airframeRotation=Math.atan2(uy,ux)+Math.PI/2;travel=rayToHunterEdge(enemy,ux,uy);}
        enemy.dashStartX=enemy.x;enemy.dashStartY=enemy.y;
        enemy.dashDirX=ux;enemy.dashDirY=uy;enemy.dashTravelled=0;enemy.dashPlannedDistance=travel;
        enemy.dashCommitted=false;enemy.dashAllegiance=enemyAllegiance(world,enemy);
        enemy.dashEndX=enemy.x+ux*travel;enemy.dashEndY=enemy.y+uy*travel;
        enemy.vx=ux*270;enemy.vy=uy*270;enemy.kamikazeState="dash";
        return;
    }
    if(state==="shrapnel") {
        fireFan(world,enemy,5,ENEMY_CONFIGS.kamikaze.collisionDamage*enemy.damageScale*.3,
            aimAtCurrentTarget(world,enemy)??Math.PI/2,.35,165,"kamikaze_dash");
        enemy.kamikazeState="recover";enemy.stateTimer=.55;
        world.threats=world.threats.filter(t=>t.enemyId!==enemy.id);return;
    }
    const oldX=enemy.x,oldY=enemy.y;
    let heading=Math.atan2(enemy.dashDirY!,enemy.dashDirX!);
    const homingDistance=(enemy.dashPlannedDistance??0)*.20;
    if(!enemy.dashCommitted && (enemy.dashTravelled??0)<homingDistance){
        const target=targetPosition(world,chooseEnemyTarget(world,true,enemy));
        if(target){const delta=shortestAngle(Math.atan2(target.y-enemy.y,target.x-enemy.x)-heading);heading+=Math.max(-2.4*dt,Math.min(2.4*dt,delta));}
        enemy.dashDirX=Math.cos(heading);enemy.dashDirY=Math.sin(heading);enemy.airframeRotation=heading+Math.PI/2;
        const distance=rayToHunterEdge(enemy,enemy.dashDirX,enemy.dashDirY);
        enemy.dashEndX=enemy.x+enemy.dashDirX*distance;enemy.dashEndY=enemy.y+enemy.dashDirY*distance;
    }
    const remaining=Math.hypot(enemy.dashEndX-enemy.x,enemy.dashEndY-enemy.y);
    const step=Math.min(270*dt*sylvaMovement(world,enemy),remaining,enemy.dashCommitted?Infinity:Math.max(0,homingDistance-(enemy.dashTravelled??0)));
    enemy.vx=enemy.dashDirX!*270;enemy.vy=enemy.dashDirY!*270;
    enemy.x+=enemy.dashDirX!*step;enemy.y+=enemy.dashDirY!*step;enemy.dashTravelled!+=Math.hypot(enemy.x-oldX,enemy.y-oldY);
    if(!enemy.dashCommitted && enemy.dashTravelled!>=homingDistance-1e-8){
        enemy.dashCommitted=true;
        // Both renderers keep this entire projected line fixed for the final 80%.
        enemy.dashStartX=enemy.x;enemy.dashStartY=enemy.y;
        const distance=rayToHunterEdge(enemy,enemy.dashDirX!,enemy.dashDirY!);
        enemy.dashEndX=enemy.x+enemy.dashDirX!*distance;enemy.dashEndY=enemy.y+enemy.dashDirY!*distance;
    }
    const h=getEnemyHitbox(enemy),dx=enemy.x-oldX,dy=enemy.y-oldY;
    let hit=Infinity,targetKind:"player"|"decoy"|"drone"|"enemy"="player",targetEnemy:EnemyEntity|undefined,interceptedDecoy:DecoyEntity|undefined,zone:AirframeHitZone|undefined,contactX=enemy.x,contactY=enemy.y;
    // Existing flare/drone interception priority is retained; earliest contact wins.
    const consider=(x:number,y:number,r:number,kind:"decoy"|"drone")=>{
        interceptor.x=x;interceptor.y=y;interceptor.radius=r;
        const c=interceptor.shapes[0];c.ax=c.bx=x;c.ay=c.by=y;c.r=r;
        sweepAircraft(h,dx,dy,interceptor,bodyContact);
        if(bodyContact.hit&&bodyContact.t<hit){hit=bodyContact.t;targetKind=kind;}
    };
    if(enemy.dashAllegiance!=="friendly_hacked")for(const d of world.decoys)if(d.active){const before=hit;consider(d.x,d.y,d.radius,"decoy");if(hit<before)interceptedDecoy=d;}
    if(enemy.dashAllegiance!=="friendly_hacked"&&droneCombatActive(world))consider(world.droneX,world.droneY,9,"drone");
    sweepAircraft(h,dx,dy,getPlayerHitbox(world),bodyContact);
    if(enemy.dashAllegiance!=="friendly_hacked"&&bodyContact.hit&&bodyContact.t<hit){hit=bodyContact.t;targetKind="player";zone=bodyContact.zone;contactX=bodyContact.x;contactY=bodyContact.y;}
    for(const e of world.enemies)if(canAttackEnemy(world,enemy.dashAllegiance??"hostile",e,enemy.id)){
        sweepAircraft(h,dx,dy,getEnemyHitbox(e),bodyContact);
        if(bodyContact.hit&&bodyContact.t<hit){hit=bodyContact.t;targetKind="enemy";targetEnemy=e;zone=bodyContact.zone;contactX=bodyContact.x;contactY=bodyContact.y;}
    }
    if(hit!==Infinity&&!enemy.hitResolved) {
        enemy.hitResolved=true;enemy.x=oldX+dx*hit;enemy.y=oldY+dy*hit;
        const damage=ENEMY_CONFIGS.kamikaze.collisionDamage*enemy.damageScale;
        if(targetKind==="player")hitPlayer(world,damage,"collision",{sourceEnemyId:enemy.id,sourceEnemyType:"kamikaze",attackTag:"kamikaze_dash"}, {hit:true,t:hit,shapeIndex:-1,x:contactX,y:contactY,zone});
        else if(targetKind==="drone")hitDrone(world,damage*enemyOutputMultiplier(world,enemy.id));
        else if(targetKind==="decoy"&&interceptedDecoy)onDecoyAbsorb(world,interceptedDecoy,`${enemy.id}:${enemy.missedDashCount??0}`);
        else if(targetEnemy)damageEnemyAttack(world,targetEnemy,damage,{sourceEnemyId:enemy.id,allegiance:enemy.dashAllegiance,delivery:"aircraft_collision"},{x:enemy.x,y:enemy.y,zone});
        resolveKamikaze(world,enemy);return;
    }
    if(Math.hypot(enemy.dashEndX-enemy.x,enemy.dashEndY-enemy.y)<=1e-6) {
        enemy.dashAllegiance=undefined;
        enemy.vx=enemy.vy=0;enemy.missedDashCount=(enemy.missedDashCount??0)+1;
        enemy.kamikazeState=enemy.wave>=5&&enemy.missedDashCount%2===0?"shrapnel":"recover";
        enemy.stateTimer=.55;
        if(enemy.kamikazeState==="recover")world.threats=world.threats.filter(t=>t.enemyId!==enemy.id);
    }
}
function updateEnemies(world: CombatWorld, dt: number): void {
    const equipmentPositions = new Map(world.enemies.map(e=>[e.id,{x:e.x,y:e.y,sylvaDash:e.dashRemaining>0||e.type==="kamikaze"&&e.kamikazeState==="dash"}]));
    updateBossPhase(world);

    for (const enemy of world.enemies) {
        if(enemy.type!=="boss" && enemyAllegiance(world,enemy)==="friendly_hacked") {
            const target=nearestEnemy(world,enemy.x,enemy.y,[enemy.id],true);
            enemy.hackedTargetId=target?.id;
            if(target && !(enemy.type==="kamikaze"&&enemy.kamikazeState==="dash"))enemy.hackedFacing=Math.atan2(target.y-enemy.y,target.x-enemy.x)+Math.PI/2;
            if(enemy.magnetic?.elite)enemy.hackedFacing=enemy.magnetic.elite.aim+Math.PI/2;
            else if(enemy.burst>0)enemy.hackedFacing=enemy.burstAngle+Math.PI/2;
        } else {enemy.hackedFacing=undefined;enemy.hackedTargetId=undefined;}
        if (enemy.expiresAt !== undefined && world.elapsed >= enemy.expiresAt) { enemy.hp = 0; enemy.deathHandled = true; }
        if (enemy.hp <= 0)
            continue;
        if (enemy.burn > 0) {
            enemy.burnTick -= dt;
            if (enemy.burnTick <= 1e-8) {
                enemy.burnTick += 1;
                applyDamageToEnemy(world, enemy, enemy.burnDamage, "#fb923c", "burn","missile_swarm",undefined,undefined,"area_hazard",true,true,27,1,[],enemy.burnCast);
            }
            enemy.burn = Math.max(0, enemy.burn - dt);
        }
        if (enemy.hp <= 0)
            continue;
        if (enemy.shieldUntil <= world.aircraft.coreState.time) {
            enemy.shield = 0;
            if (enemy.stormbreaker) { enemy.stormbreaker.lastShield=0; enemy.stormbreaker.shieldArmed=false; }
        }
        if (enemy.aircraftTarget) continue;
        if (enemy.type === "boss") enemy.y = Math.max(enemy.y, bossMinCenterY(enemy.radius));
        if (enemy.type === "satellite") positionMagneticGuardian(world, enemy);
        if (enemy.stun > 0) {
            enemy.stun = Math.max(0, enemy.stun - dt);
            continue;
        }
        enemy.age += dt;
        enemy.fireCooldown -= dt * rankEnemyFireRate(world,enemy) * sylvaFireRate(world,enemy);
        if (updateMirageEnemy(world, enemy, dt, stormbreakerHooks)) continue;
        if (updateStormbreakerEnemy(world, enemy, dt, stormbreakerHooks)) continue;
        if (updateMagneticEnemy(world, enemy, dt, magneticHooks)) continue;
        const top = GAMEPLAY_SAFE_RECT.top + enemy.radius;
        const holdingTelegraph = (enemy.type === "boss" && (enemy.bossAttack?.crossfirePending ?? 0)>0 && !enemy.bossAttack?.patternWaiting) || world.warnings.some(w => w.enemyId === enemy.id && (w.kind === "rail" || w.kind === "dash" || w.kind === "sonic" || w.kind === "retaliation" || w.kind === "elite_barrage"));
        if (holdingTelegraph) {
            // Keep the visual origin and the actual attack lane aligned during the warning.
        }
        else if (enemy.type === "boss") {
            if (enemy.dashRemaining > 0) {
                enemy.dashRemaining = Math.max(0, enemy.dashRemaining - dt*sylvaMovement(world,enemy));
                const progress = 1 - enemy.dashRemaining / .65;
                const startX = enemy.x, startY = enemy.y;
                enemy.x = enemy.dashStartX + (enemy.dashEndX - enemy.dashStartX) * progress;
                enemy.y = enemy.dashStartY + (enemy.dashEndY - enemy.dashStartY) * progress;
                const attack = enemy.bossAttack!;
                if (!attack.dashHitPlayer && sweepAircraft(getEnemyHitbox(enemy),enemy.x-startX,enemy.y-startY,getPlayerHitbox(world),bodyContact).hit) {
                    hitPlayer(world, attack.dashDamage, "collision", { sourceEnemyId: enemy.id, sourceEnemyType: "boss", attackTag: "boss_dash", majorBossAttack: true },bodyContact);
                    attack.dashHitPlayer = true;
                }
                for(const e of world.enemies)if(canAttackEnemy(world,"hostile",e,enemy.id)&&!enemy.hitResolved&&sweepAircraft(getEnemyHitbox(enemy),enemy.x-startX,enemy.y-startY,getEnemyHitbox(e),bodyContact).hit){enemy.hitResolved=true;damageEnemyAttack(world,e,attack.dashDamage,{allegiance:"hostile",sourceEnemyId:enemy.id,delivery:"aircraft_collision"},bodyContact);}
            }
            else {
                const desiredX = 180 + Math.sin(enemy.age * .55) * 92, desiredY = bossMinCenterY(enemy.radius) + 8 + Math.sin(enemy.age * .7) * 8;
                enemy.x += (desiredX - enemy.x) * Math.min(1, dt * 2);
                enemy.y += (desiredY - enemy.y) * Math.min(1, dt * 2);
            }
        }
        else if (enemy.dashRemaining > 0) {
            enemy.dashRemaining = Math.max(0, enemy.dashRemaining - dt*sylvaMovement(world,enemy));
            const t = 1 - enemy.dashRemaining / .65, oldX = enemy.x, oldY = enemy.y;
            enemy.x = enemy.dashStartX + (enemy.dashEndX-enemy.dashStartX)*t;
            enemy.y = enemy.dashStartY + (enemy.dashEndY-enemy.dashStartY)*t;
            if (enemy.dashAllegiance!=="friendly_hacked" && sweepAircraft(getEnemyHitbox(enemy),enemy.x-oldX,enemy.y-oldY,getPlayerHitbox(world),bodyContact).hit)
                hitPlayer(world, stageEnemyConfig(enemy.type, world.stageId).collisionDamage*enemy.damageScale, "collision", { sourceEnemyId: enemy.id, attackTag: "elite_execution" },bodyContact);
            for(const e of world.enemies)if(canAttackEnemy(world,enemy.dashAllegiance??"hostile",e,enemy.id)&&sweepAircraft(getEnemyHitbox(enemy),enemy.x-oldX,enemy.y-oldY,getEnemyHitbox(e),bodyContact).hit && !enemy.hitResolved){
                enemy.hitResolved=true;damageEnemyAttack(world,e,stageEnemyConfig(enemy.type, world.stageId).collisionDamage*enemy.damageScale,{allegiance:enemy.dashAllegiance,sourceEnemyId:enemy.id,delivery:"aircraft_collision"},bodyContact);
            }
            if (enemy.dashRemaining === 0){enemy.executionRecovery = .45;enemy.recoveryAllegiance=enemy.dashAllegiance;enemy.dashAllegiance=undefined;}
        }
        else if ((enemy.executionRecovery ?? 0) > 0) {
            enemy.executionRecovery! -= dt;
            if (enemy.executionRecovery! <= 0) {
                const prior=enemy.attackAllegiance;enemy.attackAllegiance=enemy.recoveryAllegiance;
                const aim=aimAtCurrentTarget(world,enemy);
                if(aim!==null)fireFan(world, enemy, 7, stageEnemyConfig(enemy.type, world.stageId).projectileDamage*enemy.damageScale, aim, .22, 185, "elite_execution");
                enemy.attackAllegiance=prior;
            }
        }
        else if (enemy.type === "kamikaze") {
            updateKamikaze(world, enemy, dt);
        }
        else {
            const holdY = top + (enemy.type === "sniper" ? 32 : enemy.type === "bomber" ? 100 : isElite(enemy.type) ? 100 : 55 + (enemy.id % 4) * 42);
            enemy.y += (holdY - enemy.y) * Math.min(1, dt * (enemy.type === "attacker" ? .6 : 1.4));
            const amplitude = enemy.type === "fighter" || enemy.type === "elite" ? 62 : enemy.type === "attacker" ? 22 : 34;
            enemy.x = enemy.baseX + Math.sin(enemy.age * (enemy.type === "fighter" ? 2.2 : 1.1) + enemy.phaseSeed) * amplitude;
            if (enemy.type === "sniper" && Math.hypot(enemy.x - world.playerX, enemy.y - world.playerY) < 130)
                enemy.y -= 45 * dt;
        }
        // The persistent hunter owns its endpoint and never returns to its base.
        if (enemy.type !== "kamikaze") {
            const point = clampCircleToGameplayRect(enemy.x, enemy.y, enemy.radius);
            enemy.x = point.x;
            enemy.y = enemy.type === "boss" ? Math.max(point.y, bossMinCenterY(enemy.radius)) : point.y;
        }
        updateEnemyAbilities(world, enemy, dt);
        if (enemy.fireCooldown <= 0 && enemy.type !== "kamikaze" && enemy.dashRemaining <= 0 && enemy.type !== "boss")
            fireEnemy(world, enemy);
        if (enemy.burst > 0) {
            enemy.burstCd -= dt*rankEnemyFireRate(world,enemy)*sylvaFireRate(world,enemy);
            if (enemy.burstCd <= 0) {
                if (enemy.type === "iron_fortress")
                    fireFan(world, enemy, 5, stageEnemyConfig(enemy.type, world.stageId).projectileDamage * enemy.damageScale, enemy.burstAngle, .22,145,"burst",enemy.burstAllegiance);
                else
                    fireEnemyBullet(world, enemy, enemy.burstAngle, 180, stageEnemyConfig(enemy.type, world.stageId).projectileDamage * enemy.damageScale,false,"basic",enemy.burstAllegiance);
                enemy.burst--;
                enemy.burstCd += enemy.type === "elite" && enemy.eliteWave === 2 ? .16 : .18;
                if (enemy.burst === 0 && enemy.type === "elite" && enemy.eliteWave === 2) {
                    enemy.secondaryCd = .5;
                    enemy.secondaryAllegiance=enemy.burstAllegiance;
                }
            }
        }
        const previousAttackAllegiance=enemy.attackAllegiance;
        enemy.attackAllegiance=enemy.secondaryAllegiance;
        if ((enemy.skillLockedUntil??0)<=world.elapsed && enemy.type === "elite" && enemy.eliteWave === 2 && enemy.secondaryCd <= 0) {
            fireFan(world, enemy, 7, 62.4 * enemy.damageScale, aimAtCurrentTarget(world, enemy) ?? Math.PI / 2);
            enemy.secondaryCd = Infinity;
        }
        if ((enemy.skillLockedUntil??0)<=world.elapsed && enemy.type === "radar_hunter" && enemy.secondaryCd <= 0 && canContinueRadarSequence(world,enemy)) {
            const aim = aimAtCurrentTarget(world, enemy);
            if (aim !== null) fireEnemyBullet(world, enemy, aim, 155, 93.6 * enemy.damageScale, true, "radar_lock");
            enemy.secondaryCd = Infinity;
        }
        enemy.attackAllegiance=previousAttackAllegiance;
    }
    for (let i = world.enemies.length-1; i >= 0; i--) if (world.enemies[i].deathHandled && world.enemies[i].hp <= 0) recycleEnemy(world, i);
    resolveDeathsAndEffects(world);
    for(const enemy of world.enemies){if(enemy.stormbreaker||enemy.mirage||enemy.aircraftTarget)continue;const start=equipmentPositions.get(enemy.id),factor=Math.min(start?.sylvaDash?1:sylvaMovement(world,enemy),argentMovement(world,enemy),riptideMovement(world,enemy),cinderMovement(world,enemy)*equipmentSlow(world.aircraft,enemy)*rankEnemyMovement(world,enemy));if(start&&factor<1){enemy.x=start.x+(enemy.x-start.x)*factor;enemy.y=start.y+(enemy.y-start.y)*factor;}}

}
function segmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
    const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
const shortestAngle = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));
const approach = (value: number, target: number, step: number) => value + Math.max(-step, Math.min(step, target - value));

function steerMissileHeading(p:ProjectileEntity,desired:number,dt:number):void {
    const error=shortestAngle(desired-p.heading);
    const velocity=Math.max(-p.turnRate,Math.min(p.turnRate,error*4));
    p.angularVelocity=approach(p.angularVelocity,velocity,p.angularAcceleration*dt);
    // Keep a continuous angle through +/- PI; all comparisons use shortestAngle.
    p.heading+=p.angularVelocity*dt;
}

function followMissileAnchor(world: CombatWorld, p: ProjectileEntity, dt: number): void {
    const heavy = p.projectileKind === "bigbang";
    const bob = Math.sin(p.missileAge * 4 + p.id * 1.7) * (heavy ? .7 : 1.8);
    const anchor = clampCircleToGameplayRect(world.playerX + p.anchorX, world.playerY + p.anchorY + bob, p.radius);
    const easing = 1 - Math.exp(-dt * (heavy ? 8 : 12));
    p.x += (anchor.x - p.x) * easing;
    p.y += (anchor.y - p.y) * easing;
}

function acquireMissileTarget(world: CombatWorld, p: ProjectileEntity): { x: number; y: number } | null {
    const decoy = preferredDuelDecoy(world, p.duelDecoy);
    p.duelDecoy = decoy ? { world: decoy.world, id: decoy.id } : undefined;
    if (decoy) { p.targetId = null; return decoy; }
    const current = world.enemies.find(e => e.id === p.targetId && isHostileToPlayer(world,e) && canTargetEnemy(world,e,"homing"));
    if (current) return current;
    if(p.skillId==="missile_swarm") {
        // Every rank reacquires from the missile, including after a targetless search.
        // Keep the authored initial lock preference only before launch turning.
        if(p.targetId!==null || p.missileState!=="loiter") {
            const target=nearestEnemy(world,p.x,p.y,p.hitIds,false);
            p.targetId=target?.id??null;
            return target;
        }
        const preferredId=world.rankRuntime?.lock?.target??world.playerTargetId;
        const preferred=world.enemies.find(e=>e.id===preferredId&&isHostileToPlayer(world,e)&&canTargetEnemy(world,e,"homing")&&!p.hitIds.includes(e.id));
        if(preferred){p.targetId=preferred.id;return preferred;}
    }
    // Tomahawk's volley keeps its existing spread across distinct live enemies.
    const excluded = p.volleyId ? world.projectiles
        .filter(other => other !== p && other.volleyId === p.volleyId && other.targetId !== null)
        .map(other => other.targetId!) : p.hitIds;
    const target = nearestEnemy(world,p.x,p.y,[...excluded,...(p.volleyTargets??[])],true) || (p.telemetryCore===106?null:nearestEnemy(world,p.x,p.y,p.hitIds,true));
    p.targetId = target?.id ?? null;
    return target;
}

function addMissileSmoke(world: CombatWorld, p: ProjectileEntity, previousHeading: number): void {
    const visual=getMissileVisual(p); if(!visual)return;
    const smoke=visual.smoke, oldRotation=missileRenderRotation(previousHeading), rotation=missileRenderRotation(p.heading);
    const oldCos=Math.cos(oldRotation),oldSin=Math.sin(oldRotation),cos=Math.cos(rotation),sin=Math.sin(rotation);
    const distance=Math.hypot(p.x-p.previousX,p.y-p.previousY);
    if(distance<=0)return;
    for(let nozzleIndex=0;nozzleIndex<visual.engineNozzles.length;nozzleIndex++) {
        const nozzle=visual.engineNozzles[nozzleIndex];
        const accumulator=nozzleIndex===0?p.smokeDistanceAccumulator:p.secondarySmokeDistanceAccumulator;
        const ax=p.previousX+nozzle.x*oldCos-nozzle.y*oldSin,ay=p.previousY+nozzle.x*oldSin+nozzle.y*oldCos;
        const bx=p.x+nozzle.x*cos-nozzle.y*sin,by=p.y+nozzle.x*sin+nozzle.y*cos;
        const nozzleDistance=Math.hypot(bx-ax,by-ay);
        for(let sample=smoke.spacing-accumulator;sample<=nozzleDistance;sample+=smoke.spacing) {
            if(world.particles.length>=AIR_COMBAT_WORLD.maxParticles-22) {
                const oldest=world.particles.findIndex(q=>q.kind==="missile_smoke");
                if(oldest<0)break;recycleParticle(world,oldest);
            }
            const t=sample/nozzleDistance, particle=acquireParticle(world);
            const heading=previousHeading+shortestAngle(p.heading-previousHeading)*t;
            const sampleRotation=missileRenderRotation(heading),c=Math.cos(sampleRotation),s=Math.sin(sampleRotation);
            const lateral=(world.visualRandom()-.5)*1.5,drift=p.speed*.12-smoke.drift;
            Object.assign(particle,{id:world.nextVisualId++,kind:"missile_smoke",
                x:p.previousX+(p.x-p.previousX)*t+nozzle.x*c-nozzle.y*s,
                y:p.previousY+(p.y-p.previousY)*t+nozzle.x*s+nozzle.y*c,
                vx:Math.cos(heading)*drift-Math.sin(heading)*lateral,vy:Math.sin(heading)*drift+Math.cos(heading)*lateral,
                life:smoke.life,maxLife:smoke.life,size:smoke.size,color:smoke.color});
            world.particles.push(particle);
        }
        const remainder=(accumulator+nozzleDistance)%smoke.spacing;
        if(nozzleIndex===0)p.smokeDistanceAccumulator=remainder;else p.secondarySmokeDistanceAccumulator=remainder;
    }
}

/** Only powered motion spends the existing lifetime/fuse and enables collisions. */
function updateMissile(world: CombatWorld, p: ProjectileEntity, dt: number, speedScale=1): boolean {
    p.missileAge += dt;
    if (p.missileState === "loiter") {
        followMissileAnchor(world, p, dt);
        if (p.missileAge < (p.skillId === "missile_swarm" ? B.swarmHover : 1)) return true;
        if (acquireMissileTarget(world, p) || p.skillId === "missile_swarm") p.missileState = "turning";
        // No enemies: keep hovering, but never retain an unpowered missile indefinitely.
        return p.missileAge < 8;
    }
    const powered = p.missileState === "powered";
    if (!powered) {
        followMissileAnchor(world, p, dt);
        if (p.missileAge >= 8) return false;
    }
    const target = acquireMissileTarget(world, p);
    if (!target && !powered && p.skillId !== "missile_swarm") {
        p.missileState = "loiter";
        p.angularVelocity = approach(p.angularVelocity, 0, p.angularAcceleration * dt);
        return true;
    }
    const previousHeading = p.heading;
    // A deterministic virtual steering point keeps searching Viper missiles near
    // combat without a fake target, combat RNG, or a reset of motion/lifetime.
    const searchPhase=p.id*2.399963229728653+p.missileAge*.55;
    const searchX=p.skillId==="missile_swarm"
        ? (GAMEPLAY_SAFE_RECT.left+GAMEPLAY_SAFE_RECT.right)/2+Math.cos(searchPhase)*GAMEPLAY_SAFE_RECT.width*.18 : world.playerX;
    const searchY=p.skillId==="missile_swarm"
        ? (GAMEPLAY_SAFE_RECT.top+GAMEPLAY_SAFE_RECT.bottom)/2+Math.sin(searchPhase)*GAMEPLAY_SAFE_RECT.height*.18 : world.playerY-100;
    const noDuelTarget = !target && world.enemies.some(e => !!e.aircraftTarget);
    const desired = noDuelTarget ? p.heading : Math.atan2((target?.y ?? searchY) - p.y, (target?.x ?? searchX) - p.x);
    if (noDuelTarget) { p.angularVelocity = 0; p.targetId = null; }
    else steerMissileHeading(p,desired,dt);
    if (!powered) {
        if ((Math.abs(shortestAngle(desired - p.heading)) <= Math.PI / 9 && Math.abs(p.angularVelocity) <= p.turnRate * .6) || (p.skillId === "missile_swarm" && p.missileAge >= 1.85)) {
            p.missileState = "powered";
            // Anchor movement is staging, so it must not become a swept damage segment.
            p.previousX = p.x;
            p.previousY = p.y;
        }
        return true;
    }
    p.lifetime -= dt;
    if (p.lifetime <= 0) return false;
    p.speed = approach(p.speed, p.cruiseSpeed, p.acceleration * dt);
    p.vx = Math.cos(p.heading) * p.speed;
    p.vy = Math.sin(p.heading) * p.speed;
    p.x += p.vx * dt * speedScale;
    p.y += p.vy * dt * speedScale;
    addMissileSmoke(world, p, previousHeading);
    return true;
}

function updateHoming(world: CombatWorld, projectile: ProjectileEntity, dt: number): void {
    if (!projectile.homing)
        return;
    let target: {
        x: number;
        y: number;
    } | null = null;
    if (projectile.owner === "enemy" && projectile.allegiance!=="friendly_hacked") {
        target = targetPosition(world, projectile.targetId);
        const targetUnit=world.enemies.find(e=>e.id===projectile.targetId);
        if(targetUnit&&enemyAllegiance(world,targetUnit)!=="friendly_hacked")target=null;
        if (!target || (projectile.targetId === PLAYER_TARGET_ID && !canAcquirePlayerTarget(world.aircraft))) {
            projectile.targetId = chooseEnemyTarget(world, true);
            target = targetPosition(world, projectile.targetId);
        }
    }
    else {
        const decoy = preferredDuelDecoy(world, projectile.duelDecoy);
        projectile.duelDecoy = decoy ? { world: decoy.world, id: decoy.id } : undefined;
        const enemy = decoy ? null : world.enemies.find(candidate => candidate.id === projectile.targetId && isHostileToPlayer(world,candidate) && canTargetEnemy(world,candidate,"homing")) ||
            nearestEnemy(world, projectile.x, projectile.y, projectile.hitIds, true);
        projectile.targetId = enemy?.id ?? null;
        target = decoy ?? enemy;
    }
    if(projectile.projectileKind==="boss_missile" || isImmediateMissile(projectile)) {
        if (target) steerMissileHeading(projectile,Math.atan2(target.y-projectile.y,target.x-projectile.x),dt);
        else { projectile.targetId = null; projectile.angularVelocity = 0; }
        const speed=Math.max(1,Math.hypot(projectile.vx,projectile.vy));
        projectile.vx=Math.cos(projectile.heading)*speed;projectile.vy=Math.sin(projectile.heading)*speed;
        return;
    }
    if (!target) { projectile.targetId = null; return; }
    const desired = Math.atan2(target.y - projectile.y, target.x - projectile.x);
    const current = Math.atan2(projectile.vy, projectile.vx);
    let delta = ((desired - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    delta = Math.max(-projectile.turnRate * dt, Math.min(projectile.turnRate * dt, delta));
    const speed = Math.max(1, Math.hypot(projectile.vx, projectile.vy));
    const next = current + delta;
    projectile.vx = Math.cos(next) * speed;
    projectile.vy = Math.sin(next) * speed;
}
function updateBossMissile(world: CombatWorld, p: ProjectileEntity, dt: number, movementMultiplier = 1): boolean {
    p.missileAge += dt;
    if (p.missileState === "loiter") {
        // A visible ignition at the wing, then finite-turn flight. No player-anchor following.
        if (p.missileAge < .55) return true;
        p.missileState = "powered";
        p.speed = 70;
        p.vx = Math.cos(p.heading) * p.speed;
        p.vy = Math.sin(p.heading) * p.speed;
    }
    p.lifetime -= dt;
    if (p.lifetime <= 0) return false;
    const previousHeading = p.heading;
    updateHoming(world, p, dt);
    p.speed = approach(p.speed, p.cruiseSpeed, p.acceleration * dt);
    p.vx = Math.cos(p.heading) * p.speed;
    p.vy = Math.sin(p.heading) * p.speed;
    p.x += p.vx * dt * movementMultiplier;
    p.y += p.vy * dt * movementMultiplier;
    addMissileSmoke(world, p, previousHeading);
    return p.x >= -20 && p.x <= AIR_COMBAT_WORLD.width + 20 && p.y >= GAMEPLAY_SAFE_RECT.top - 20 && p.y <= AIR_COMBAT_WORLD.height + 20;
}
function targetMetadata(enemy: EnemyEntity): CoreTarget {
    return { id: enemy.id, hp: enemy.hp, maxHp: enemy.maxHp, armor: enemy.armor, x: enemy.x, y: enemy.y, elite: isElite(enemy.type), boss: enemy.type === "boss" };
}
function emitPlayerHealing(world: CombatWorld, effective: number, source: HealSource, continuous: boolean): void {
    if (effective <= 0) return;
    const now = world.aircraft.coreState.time;
    if (continuous && now < (world.nextContinuousHealVisualAt ?? 0)) return;
    world.nextContinuousHealVisualAt = now + .25;
    emitVisual(world, { kind: "player_heal", x: world.playerX, y: world.playerY,
        size: 10, amount: effective, healSource: source });
}
/** Direct Core/Skill healing retains overheal handling; only restored HP emits crosses. */
export function healPlayerWithFeedback(world: CombatWorld, amount: number, source: HealSource, continuous = false, coreRow?: number, originSkill?: SkillId): number {
    const effective = healAircraft(world.aircraft, amount,true,Infinity,originSkill);
    recordCoreMetric(world.aircraft, coreRow, "healed", effective);
    emitPlayerHealing(world, effective, source, continuous);
    return effective;
}
function coreContext(world: CombatWorld, extra: Partial<CoreContext> = {}): CoreContext {
    const ctx: CoreContext = { state: world.aircraft, stats: getEffectiveAircraftStats(world.aircraft), rawMultiplier: 1,
        heal: amount => { healPlayerWithFeedback(world, amount, extra.skillId ? "skill_core" : "core", (extra.dt ?? 0) > 0, ctx.coreRow); },
        reduceCooldowns: (seconds, except) => { for (const id of SKILL_IDS)
            if (id !== except && (![70,74].includes(ctx.coreRow??0)||!isUltimate(id)) && (world.aircraft.cooldowns[id] || 0) > 0) {
                const before = world.aircraft.cooldowns[id]!;
                reduceRunningSkillCooldown(world.aircraft,id,seconds);
                recordCoreMetric(world.aircraft, ctx.coreRow, "cooldown", before - world.aircraft.cooldowns[id]!);
            } },
        explode: (target, raw) => { world.effectQueue.push({ kind: "explosion", target, raw }); },
        lightning: (target, raw) => { world.effectQueue.push({ kind: "lightning", target, raw }); },
        tomahawk: () => {
            // Preserve the existing count (up to three live enemies), but defer locks.
            const count = Math.min(3, world.enemies.reduce((n, e) => n + (isHostileToPlayer(world,e) ? 1 : 0), 0));
            const volleyId = world.nextId; const volleyTargets=new Set<number>();
            for (let i = 0; i < count; i++) {
                const missile = addProjectile(world, { owner: "player", source: "weapon", telemetryCore: 106, projectileKind: "missile", volleyId, volleyTargets, turnRate: 8, lifetime: 12,
                    anchorX: (i - 1) * 25, anchorY: -24,
                    x: world.playerX + (i - 1) * 10, y: world.playerY - 15, vx: (i - 1) * 65, vy: -230, radius: 4.5,
                    rawDamage: getEffectiveAircraftStats(world.aircraft).firepower * 3.6, color: "#67e8f9" });
                if (missile) {missile.cruiseSpeed*=2;missile.acceleration*=2;recordCoreMetric(world.aircraft,106,"launched",1);}
            }
        },
        weaken: target => { const enemy = world.enemies.find(e => e.id === target.id); if (enemy) {
            const now = world.aircraft.coreState.time;
            if (now < (enemy.weakReadyAt || 0)) return;
            if (++enemy.weakHits >= 4) {
                recordCoreMetric(world.aircraft,58,"procs",1);recordCoreMetric(world.aircraft,58,"targets",1);
                enemy.weakHits = 0; enemy.weakDebuffUntil = statusExpiry(enemy,"weakDebuffUntil",now,5); enemy.weakReadyAt = enemy.weakDebuffUntil + 15;
            }
        } },
        stopSkills: () => stopAllSkills(world), ...extra };
    return ctx;
}
function recordDpsDamage(world: CombatWorld, amount: number) {
    if (amount <= 0) return;
    const samples = world.dpsSamples ??= [];
    const last = samples[samples.length - 1];
    if (last?.at === world.elapsed) last.amount += amount;
    else samples.push({ at: world.elapsed, amount });
}
function rollingDps(world: CombatWorld): number {
    const samples = world.dpsSamples ??= [];
    while (samples.length && samples[0].at < world.elapsed - 5) samples.shift();
    return samples.reduce((sum, hit) => sum + hit.amount, 0) / 5;
}
/** Debt is already post-armor HP damage. Only current reduction/shields apply again;
 * no hostile payload, grace, combo, lastDamage or damageTaken event is dispatched. */
function repayExpansionDebt(world: CombatWorld, amount: number, sourceEnemyId?:number, reflection=false) {
    if(world.duel && !world.duel.combatEnabled)return;
    const state = world.aircraft, c = state.coreState, stats = getEffectiveAircraftStats(state);
    let reduction = expansionIncoming(state);
    if ((c.timers.celestial ?? 0) > c.time) reduction = 0;
    if ((state.activeEffects.armor_shield ?? 0) > 0) reduction *= getSkillRuntimeValues(state,"armor_shield").damageTakenMultiplier;
    if (hasCore(state,103) && state.currentHp < stats.maxHp * .30) reduction *= .75;
    if ((skillRank(state, "afterburner") >= 5) && (state.activeEffects.afterburner ?? 0) > 0) reduction *= .85;
    if (expansionActive(state,"thermalCover")) reduction *= 1 - V.thermalReduction;
    reduction *= equipmentIncoming(state);
    if(astraOrbitProtectionActive(world)) {
        const capacity=state.currentHp+Object.values(c.shields).filter(sh=>sh.until>c.time).reduce((n,sh)=>n+sh.amount,0);
        recordCoreMetric(state,153,"prevented",Math.min(capacity,amount*reduction)-Math.min(capacity,amount*reduction*.65));
        reduction*=.65;
    }
    let damage = amount * reduction, absorbed = 0;
    for (const [key,shield] of Object.entries(c.shields)) {
        if (shield.until <= c.time || shield.amount <= 0) continue;
        prepareAbsorbShield(state,shield);
        const part = Math.min(shield.amount,damage);
        shield.amount -= part; shield.absorbed = (shield.absorbed ?? 0) + part;
        if(reflection)shield.reflectedAbsorbed=(shield.reflectedAbsorbed??0)+part;
        absorbed += part; damage -= part;
        if(key.startsWith("equipment:"))equipmentMetric(state,Number(key.slice(10)),"shieldAbsorbed",part);
        if (shield.amount <= 0) finishAbsorbShield(state,shield);
    }
    const debtSource=world.enemies.find(e=>e.aircraftTarget?.world===(world.duel?.opponent??world.mirage?.mirror?.context.world??world.duelOpponent?.context.world));
    const terraAbsorbed=terraAbsorb(world,damage,sourceEnemyId??debtSource?.id,reflection);damage-=terraAbsorbed;absorbed+=terraAbsorbed;
    damage = Math.min(state.currentHp,damage);
    state.currentHp -= damage; world.damageTaken += damage;
    terraIncomingHp(world,damage,reflection);
    sylvaIncomingHp(world,damage);
    const sylvaDebtOwner=world.duel?.opponent??world.mirage?.mirror?.context.world??world.duelOpponent?.context.world;
    const sylvaDebtTarget=sylvaDebtOwner?.enemies.find(e=>e.aircraftTarget?.world===world);
    if(sylvaDebtOwner&&sylvaDebtTarget)sylvaDealt(sylvaDebtOwner,sylvaDebtTarget,damage,damage+absorbed,undefined,sylvaHooks);
    // Debt already contains the outgoing multiplier; only actual repayment is attributed.
    if(world.duel?.opponent?.duel) {
        const owner = world.duel.opponent;
        owner.duel!.damageDealt += damage + absorbed;
        owner.damageDealt += damage; recordDpsDamage(owner, damage + absorbed);
    }
    if(damage+absorbed>0)equipmentOnDamage(world,equipmentHooks,damage,damage+absorbed);
    // Any HP loss cancels a pending shield return, including debt repayment.
    if (damage > 0) expansionState(state).returns.length = 0;
    if (damage + absorbed > 0) emitVisual(world,{kind:"damage_number",x:world.playerX,y:world.playerY,size:36,hpDamage:damage,shieldAbsorbed:absorbed,target:"player",critical:false});
    if (state.currentHp <= 0 && !world.duel) latchAircraftDestruction(world);
    else settleExpansionShields(world,expansionHooks);
    world.duel?.onResolution?.(damage);
}
function warningThreatNearby(z: WarningZone, x: number, y: number, radius: number): boolean {
    if (z.rawDamage <= 0 || (z.stage !== "active" && z.remaining > 0)) return false;
    if (z.kind === "rail" || z.kind === "dash")
        return segmentDistance(x,y,z.fromX ?? z.x,z.fromY ?? z.y,z.x,z.y) <= radius+z.radius;
    if (z.kind === "lane_laser") return Math.abs(x-z.x) <= radius+(z.laneWidth ?? z.radius)/2;
    if (z.kind === "sonic") return Math.abs(Math.hypot(x-z.x,y-z.y)-(z.ringRadius ?? 0)) <= radius+SONIC_RING_THICKNESS;
    return Math.hypot(x-z.x,y-z.y) <= radius+z.radius;
}

/** Query the other aircraft's authoritative attacks in its own coordinates.
 * Borrowed projectile views serve interception/rendering and are not a complete
 * threat registry (beams and persistent Skill/Core zones never enter that pool).
 * Hidden aircraft still occupy space; target-acquisition rules do not grant safety. */
function opposingAircraftThreatNearby(world: CombatWorld, radius: number, bodies: boolean): boolean {
    const opponent = world.duel?.opponent ?? world.duelOpponent?.context.world ?? world.mirage?.mirror?.context.world
        ?? (world.mirrorContext ? world.enemies.find(e=>e.aircraftTarget)?.aircraftTarget?.world : undefined);
    if (!opponent) return false;
    const { x, y } = mirrorPoint(world.playerX, world.playerY), now = opponent.elapsed;
    if(opponent.bigBang&&!opponent.bigBang.resolved&&opponent.bigBang.impactAt-opponent.elapsed<=.65)return true;
    if(argentThreatNearby(opponent,x,y,radius)||riptideThreatNearby(opponent,x,y,radius)||cinderThreatNearby(opponent,x,y,radius))return true;
    if (opponent.aircraft.currentHp > 0 && (bodies || opponent.dashRemaining > 0)
        && circleVsAircraft(x,y,radius,getPlayerHitbox(opponent))) return true;
    if (opponent.projectiles.some(p=>p.owner!=="enemy" && !p.mirrorBorrowed && p.lifetime>0 && p.rawDamage>0
        && segmentDistance(x,y,p.previousX,p.previousY,p.x,p.y)<=radius+p.radius)) return true;
    if (opponent.warnings.some(z=>z.owner==="player" && warningThreatNearby(z,x,y,radius))) return true;
    if (opponent.laserCharge <= 0 && opponent.laserTicksRemaining > 0
        && segmentDistance(x,y,opponent.playerX,GAMEPLAY_SAFE_RECT.top,opponent.playerX,opponent.playerY)<=radius+16) return true;
    const anchor = opponent.rankRuntime?.anchor;
    if (anchor && anchor.until>now && Math.hypot(x-anchor.x,y-anchor.y)<=radius+gravityAnchorValues(anchor.rank).radius) return true;
    if (opponent.rankRuntime?.waves.some(w=>w.startsAt<=now && w.radius<=w.maxRadius
        && Math.abs(Math.hypot(x-w.originX,y-w.originY)-w.radius)<=radius+INTERFERENCE_WAVE_THICKNESS/2)) return true;
    const astra = opponent.astra;
    if (astra?.burns.some(z=>z.until>=now && Math.hypot(x-z.x,y-z.y)<=radius+z.radius)) return true;
    if (astra?.starfall?.pending.some(m=>now>=m.at-m.fallDuration && now<=m.at
        && Math.hypot(x-m.x,y-m.y)<=radius+(m.doom?110:astra.starfall!.rank>=2?65:45))) return true;
    if (astra?.meteorSpears?.some(beam=>{
        if (now<beam.beamStartsAt || now>=beam.beamEndsAt || beam.rawDamageBasis<=0) return false;
        const { start, end } = meteorSpearEndpoints(beam);
        return segmentDistance(x,y,start.x,start.y,end.x,end.y)<=radius+beam.projectileHitboxWidth;
    })) return true;
    return false;
}

function expansionThreatNearby(world: CombatWorld, radius: number, bodies: boolean): boolean {
    const x = world.playerX, y = world.playerY;
    if (opposingAircraftThreatNearby(world,radius,bodies)) return true;
    if (world.projectiles.some(p => !p.mirrorBorrowed && p.owner === "enemy" && p.allegiance !== "friendly_hacked" && p.lifetime > 0 && p.rawDamage > 0 && segmentDistance(x,y,p.previousX,p.previousY,p.x,p.y) <= radius+p.radius)) return true;
    for (const e of world.enemies) if (isHostileToPlayer(world,e)) {
        if (bodies && circleVsAircraft(x,y,radius,getEnemyHitbox(e))) return true;
        if ((e.dashRemaining > 0 || e.kamikazeState === "dash" || e.magnetic?.elite?.mode === "dash"
            || e.mirage?.dash && world.elapsed>=e.mirage.dash.at || e.stormbreaker?.dash && world.elapsed>=e.stormbreaker.dash.start)
            && circleVsAircraft(x,y,radius,getEnemyHitbox(e))) return true;
        if (e.magnetic?.tether && (e.magnetic.tetherAllegiance ?? "hostile") === "hostile" && (e.magnetic.tetherUntil ?? 0) > world.elapsed) return true;
    }
    if (world.warnings.some(z=>z.owner==="enemy" && z.allegiance!=="friendly_hacked" && warningThreatNearby(z,x,y,radius))) return true;
    const nearShape = (a: { start: { x:number; y:number }; end?: { x:number; y:number }; radius:number }) =>
        segmentDistance(x,y,a.start.x,a.start.y,a.end?.x??a.start.x,a.end?.y??a.start.y)<=radius+a.radius;
    if (world.mirage?.hazards.some(a=>a.real && a.allegiance!=="friendly_hacked" && a.raw>0
        && world.elapsed>=a.hitAt && world.elapsed<a.until && nearShape(a))) return true;
    if (world.stormbreaker?.hazards.some(a=>!a.decoy && a.allegiance!=="friendly_hacked" && a.damage>0
        && world.elapsed>=a.hitAt && world.elapsed<a.until
        && (!a.conditionalOwner || world.enemies.some(e=>e.id===a.conditionalOwner && e.hp>0)) && nearShape(a))) return true;
    const m = world.magnetic;
    if (m?.beams?.some(b=>b.active && segmentDistance(x,y,b.from.x,b.from.y,b.end.x,b.end.y)<=radius+b.radius)) return true;
    if (m?.lanes?.some(l=>l.allegiance!=="friendly_hacked" && l.age>=l.warning && l.age<l.warning+l.duration && segmentDistance(x,y,l.from.x,l.from.y,l.end.x,l.end.y)<=radius+l.width)) return true;
    if (m?.trails?.some(t=>t.allegiance!=="friendly_hacked" && t.until>world.elapsed && t.damage>0 && segmentDistance(x,y,t.from.x,t.from.y,t.end.x,t.end.y)<=radius+13)) return true;
    if (m?.mines.some(mine=>mine.allegiance!=="friendly_hacked" && !mine.exploded && mine.damage>0 && Math.hypot(x-mine.x,y-mine.y)<=radius+40)) return true;
    return false;
}

function sylvaReadOnlyAircraft(state:AircraftCombatState):AircraftCombatState {
 const copy=structuredClone(state),statuses=externalNegativeStatusTypes(state);
 registerNegativeStatusSource(copy,copy,()=>statuses);
 return copy;
}
// Sylva's detonation preview and real delivery share this non-consuming budget.
// No critical roll, telemetry, shield depletion or one-shot buff consumption here.
function sylvaDetonationBudget(w:CombatWorld,e:EnemyEntity,raw:number):number {
 // Derived-stat/equipment readers can populate caches: confine these writes to copies.
 const state=sylvaReadOnlyAircraft(w.aircraft),time=state.coreState.time,id='sylva_deathbloom' as const;
 const view={...w,aircraft:state},targetView=Object.create(e) as EnemyEntity;
 if(e.aircraftTarget){const stats=getEffectiveAircraftStats(sylvaReadOnlyAircraft(e.aircraftTarget.world.aircraft));Object.defineProperties(targetView,{armor:{value:stats.armor},maxHp:{value:stats.maxHp}});}
 const cast=expansionState(state).casts[id],marks=e.expansionMarks;
 const equipment=equipmentOutgoing(state,targetView,false,true,true);
 let multiplier=expansionOutgoing(state,false,true)*outgoingCoreMultiplier(state,targetMetadata(targetView),'skill',Math.hypot(e.x-w.playerX,e.y-w.playerY),GAMEPLAY_SAFE_RECT.height);
 multiplier*=1+(cast?.overclock??0);
 if(expansionState(state).primarySkill===id)multiplier*=1.25;
 if((marks?.preliminary??0)>time)multiplier*=1.2;
 if(hasCore(state,207)&&(marks?.skillPhase??0)>time)multiplier*=1.3;
 if((marks?.shieldBroken??0)>time)multiplier*=1.14;
 multiplier*=rankDirectMultiplier(view,targetView,id);
 if(cast){
  const fire=equipmentEffect(state,5),clock=equipmentEffect(state,35);
  const pending=((fire.bonusUntil??0)>time?1+P[5].skill*equipmentScale(state,5):1)*(clock.empowered?1+P[35].skill*equipmentScale(state,35):1);
  multiplier*=(cast.compressed?1.14:1)*(cast.capacitor?1.1:1)*(cast.equipmentBonus??pending);
 }
 if(w.skillCores.bountyTarget===e.id&&w.skillCores.bountyUntil>w.elapsed)multiplier*=1.1;
 if(hasCore(state,115)&&!w.enemies.some(other=>other.id!==e.id&&isHostileToPlayer(w,other)&&Math.hypot(other.x-e.x,other.y-e.y)<=80))multiplier*=e.type==='boss'?1.2:1.3;
 if((state.coreState.timers.comeback??0)>time)multiplier*=1.20;
 if(hasCore(state,118))multiplier*=1+crowdDamageBonus(w);
 multiplier*=equipment.multiplier*sylvaOutgoing(w,e);
 const recoil=hasCore(state,187)?Math.min(state.coreState.stacks.recoil??0,getEffectiveAircraftStats(state).firepower*3):0;
 return calculateDamage(raw+equipment.bonus+recoil,resolvedEnemyArmor(w,e,armorPenetration(state),state,targetView),multiplier)*guardianMultiplier(w,e)*stormDamageTakenMultiplier(w,e)*(e.type==='boss'&&e.hp/targetView.maxHp>=.15&&e.aegisUntil>time?.6:1);
}
/** Guaranteed non-critical HP loss; reads shield capacities without preparing/consuming them. */
function sylvaDetonationLethal(w:CombatWorld,e:EnemyEntity,raw:number):boolean {
 if(!canTargetEnemy(w,e,'untargeted')||e.hp<=0)return false;
 let damage=sylvaDetonationBudget(w,e,raw);
 const actor=e.aircraftTarget?.world;
 if(!actor)return Math.max(0,damage-e.shield)>=e.hp;
 const state=sylvaReadOnlyAircraft(actor.aircraft),c=state.coreState,stats=getEffectiveAircraftStats(state);
 const contactGrace=actor.playerInvulnerability<=Math.max(0,actor.playerDamageGraceUntil-actor.elapsed)+1e-8;
 if(actor.ended||actor.destruction||actor.aftermath||actor.waveState!=='combat'||actor.duel&&!actor.duel.combatEnabled||actor.playerInvulnerability>0&&!contactGrace||equipmentUntargetable(state)||celestialProtection(state))return false;
 // A ready death refusal cannot be bypassed by an assumed execute.
 if(hasCore(state,90)&&!c.consumed.has(coreId(90)))return false;
 const source=actor.enemies.find(t=>t.aircraftTarget?.world===w);
 damage*=w.duel?.multiplier??1;
 damage*=enemyOutputMultiplier(actor,source?.id);
 let factor=(state.activeEffects.armor_shield??0)>0?getSkillRuntimeValues(state,'armor_shield').damageTakenMultiplier:1;
 if(hasCore(state,103)&&state.currentHp<stats.maxHp*.3)factor*=.75;
 if(skillRank(state,'afterburner')>=5&&(state.activeEffects.afterburner??0)>0)factor*=.85;
 if(hasCore(state,72)&&(c.stacks.coldCharges??0)>0)factor*=.3;
 if((c.timers.thermalCover??0)>c.time)factor*=1-V.thermalReduction;
 if(astraOrbitProtectionActive(actor))factor*=.65;
 factor*=riptideIncoming(actor,source?.id)*expansionIncoming(state)*equipmentIncoming(state);
 if(expansionActive(state,'safetyLatch'))factor*=.6;
 const guard=argentHud(actor).guard;
 if(guard&&actor.elapsed<guard.until&&(guard.remaining>0||actor.elapsed<guard.beatUntil))factor*=.01;
 damage=calculateDamage(damage,0,factor);
 for(const [key,shield] of Object.entries(c.shields))if(shield.until>c.time&&shield.amount>0){const shieldFactor=key==='cinder'?cinderShieldFactor(actor,source?.id,false):1;const capacity=shield.amount*(shield.capacity===undefined?getShieldReceivedMultiplier(state,Number.isFinite(shield.until)):1);damage-=Math.min(capacity,damage*shieldFactor)/shieldFactor;}
 const terra=terraState(actor).armor;if(terra&&actor.elapsed<terra.until)damage-=Math.min(terra.reserve,damage*(.4+.05*(terra.rank-1)));
 if(hasCore(state,197))damage*=.65;
 return damage>=state.currentHp;
}
const terraHooks:TerraHooks={
 hostile:isHostileToPlayer,elite:e=>isElite(e.type),displace:displaceEnemy,
 damage:(w,e,raw,id,castId,trueDamage,reflection=false)=>{const receipt={hp:0,total:0};applyDamageToEnemy(w,e,raw,'#F4B544','skill',id,undefined,undefined,'area_hazard',!reflection,true,undefined,1,[],expansionState(w.aircraft).casts[id],undefined,reflection,undefined,{trueDamage,castId,reflection,noCrit:reflection,preserveModifiers:true},receipt);return receipt;},
 heal:(w,raw,id)=>{const n=healAircraft(w.aircraft,raw,true,Infinity,id);if(n>0)emitPlayerHealing(w,n,'skill_core',false);return n;},cleanse:cleanseTerra,
 controlled:(w,e)=>e.stun>0||terraMovement(w,e)===0||sylvaMovement(w,e)===0||argentMovement(w,e)===0||cinderMovement(w,e)===0||!!e.aircraftTarget&&playerStunned(e.aircraftTarget.world.aircraft),
};
function cleanseTerra(w:CombatWorld){
 const a=w.aircraft,skillExhaust=a.coreState.timers.skillExhaust;clearAircraftNegativeStatuses(a);
 // Mana strain is a self cost, not a hostile status.
 if(skillExhaust!==undefined)a.coreState.timers.skillExhaust=skillExhaust;
 for(const key of ['sylvaFireSlow'])delete a.coreState.timers[key];
 const owners=new Set<CombatWorld>();for(const e of w.enemies)if(e.aircraftTarget)owners.add(e.aircraftTarget.world);
 for(const owner of [w.duel?.opponent,w.duelOpponent?.context.world,w.mirage?.mirror?.context.world])if(owner)owners.add(owner);
 for(const owner of owners)for(const e of owner.enemies)if(e.aircraftTarget?.world===w){
  clearSylvaTarget(owner,e);clearTerraTarget(owner,e);argentState(owner).controls.delete(e.id);argentState(owner).armorMarks.delete(e.id);clearRiptideSlow(owner,e);cinderState(owner).targets.delete(e.id);
  owner.rankRuntime?.interference.delete(e.id);owner.rankRuntime?.anchor?.inner.delete(e.id);
  if(owner.rankRuntime?.lock?.target===e.id){owner.rankRuntime.lock=undefined;endAircraftSkill(owner.aircraft,"predator_lock");}
  if(owner.skillCores.syncTarget===e.id){owner.skillCores.syncTarget=null;owner.skillCores.syncUntil=0;}
  if(owner.skillCores.bountyTarget===e.id){owner.skillCores.bountyTarget=null;owner.skillCores.bountyUntil=0;}
  owner.skillCores.enemyEffects.delete(e.id);delete equipmentState(owner.aircraft).marks[e.id];
  e.burn=0;e.burnDamage=0;e.burnArmorUntil=0;e.stun=0;e.weakUntil=0;e.weakDebuffUntil=0;e.armorBrokenUntil=0;e.expansionMarks={};
  const release=releaseState(owner.aircraft);if(release.mark?.target===e.id)release.mark=undefined;
 }
}
const sylvaHooks:SylvaHooks={
 hostile:isHostileToPlayer,elite:e=>isElite(e.type),armor:(w,e)=>resolvedEnemyArmor(w,e),
 damage:(w,e,raw,id,bonus=false)=>{const receipt={hp:0,total:0};applyDamageToEnemy(w,e,raw,'#BDFB67','skill',id,undefined,undefined,'area_hazard',true,true,undefined,1,[],expansionState(w.aircraft).casts[id],undefined,bonus,undefined,undefined,receipt,undefined,false,bonus);return receipt;},
 lethal:sylvaDetonationLethal,
 heal:(w,raw,id)=>{const n=healAircraft(w.aircraft,raw,true,Infinity,id);if(n>0)emitPlayerHealing(w,n,'skill_core',false);return n;},
};

const argentHooks:ArgentHooks={hostile:isHostileToPlayer,elite:e=>isElite(e.type),damage:(w,e,raw,skill,castId)=>{
 const receipt={hp:0,total:0};
 applyDamageToEnemy(w,e,raw,'#E8C878',skill?'skill':'core',skill,undefined,undefined,'area_hazard',true,true,undefined,1,[],skill?expansionState(w.aircraft).casts[skill]:undefined,undefined,!skill,undefined,skill?undefined:{trueDamage:false,castId,passive:true},receipt);
 return receipt;
}};
const riptideHooks:RiptideHooks={
 hostile:isHostileToPlayer,elite:e=>isElite(e.type),displace:(w,e,dx,dy)=>displaceEnemy(w,e,dx,dy,false),
 damage:(w,e,raw,skill,castId)=>{const receipt={hp:0,total:0};
  applyDamageToEnemy(w,e,raw,'#63e3d6',skill?'skill':'core',skill,undefined,undefined,'area_hazard',true,true,undefined,1,[],skill?expansionState(w.aircraft).casts[skill]:undefined,undefined,!skill,undefined,skill?undefined:{trueDamage:false,castId,passive:true},receipt);
  return receipt;},
 heal:(w,raw,id)=>{const healed=healAircraft(w.aircraft,raw,true,Infinity,id);if(healed>0)emitPlayerHealing(w,healed,'skill_core',false);return healed;},
 cleanseSlow:w=>{const opponent=w.duel?.opponent??w.mirage?.mirror?.context.world??w.duelOpponent?.context.world;
  if(!opponent)return;const e=opponent.enemies.find(e=>e.aircraftTarget?.world===w);if(!e)return;
  clearSylvaSlow(opponent,e);clearArgentSlow(opponent,e);clearRiptideSlow(opponent,e);const c=cinderState(opponent).targets.get(e.id);if(c)c.slowUntil=0;
  const interference=opponent.rankRuntime?.interference.get(e.id);if(interference)interference.movement=1;
  const marks=equipmentState(opponent.aircraft).marks[e.id];if(marks)delete marks[24];
 }
};
const cinderHooks:CinderHooks={
 hostile:isHostileToPlayer,
 stun:(w,e)=>{
  if(e.hp<=0||!isHostileToPlayer(w,e))return;
  // Aircraft use their status adapter directly: immunity and Core duration apply once.
  const actor=e.aircraftTarget?.world;
  if(actor)applyPlayerStatus(actor.aircraft,{stun:2});
  else e.stun=extendStatusRemaining(e,'stun',e.stun,e.type==='boss'?1:isElite(e.type)?1.5:2,w.elapsed);
 },
 damage:(w,e,raw,skill,provenance,receipt)=>applyDamageToEnemy(w,e,raw,provenance.trueDamage?'#fff1af':'#ff9b45',provenance.trueDamage?'burn':skill?'skill':'core',skill,undefined,undefined,'area_hazard',false,true,undefined,1,[],undefined,undefined,true,undefined,provenance,receipt),
};
const expansionHooks: ExpansionHooks = {
    hostile: isHostileToPlayer, threat: expansionThreatNearby, debt: repayExpansionDebt,
    heal: (w, amount, row) => { if (w.aircraft.currentHp > 0) healPlayerWithFeedback(w,amount,"core",true,row); },
    area: (w,x,y,radius,raw,row) => {
        emitVisual(w,{kind:radius===Infinity?"emp_pulse":"explosion",x,y,size:radius===Infinity?720:radius*2});
        for (const e of w.enemies) if (isHostileToPlayer(w,e) && (radius===Infinity ? e.x+e.radius>=0 && e.x-e.radius<=AIR_COMBAT_WORLD.width && e.y+e.radius>=0 && e.y-e.radius<=AIR_COMBAT_WORLD.height : circleVsAircraft(x,y,radius,getEnemyHitbox(e))))
            applyDamageToEnemy(w,e,raw,"#fde68a","core",undefined,undefined,undefined,"area_hazard",false,true,row,1,[],undefined,undefined,true,undefined,row===200?{trueDamage:false,castId:0,reflection:true,noCrit:true,preserveModifiers:true}:undefined);
    },
    shard: (w,x,y,raw,row) => {
        const target=nearestEnemy(w,x,y); if (!target) return;
        const angle=Math.atan2(target.y-y,target.x-x);
        const projectile=addProjectile(w,{owner:"player",source:"core",telemetryCore:row,procFree:true,x,y,vx:Math.cos(angle)*390,vy:Math.sin(angle)*390,rawDamage:raw,homing:true,targetId:target.id,turnRate:7,radius:4,color:"#fde68a"});
        if(projectile)recordCoreMetric(w.aircraft,row,"launched",1);
    },
};
const volleyWeaponComponents=new WeakMap<Map<number,number>,Map<number,number>>();
function applyDamageToEnemy(world: CombatWorld, enemy: EnemyEntity, rawDamage: number, color = "#fde68a", source: DamageSource = "weapon", skillId?: SkillId, volleyHits?: Map<number, number>, contact?:{x:number;y:number;zone?:AirframeHitZone}, delivery:DamageDelivery=contact?"direct_projectile":"area_hazard", chargeAntimatter=true, directPlayer=true, telemetryCore?: number, penetrationScale=1, shotBonuses:readonly [number,number][] = [], cast?: ExpansionCast, primaryShot?: { resolved: boolean; afterwashHits?:Set<number>; argentGenesisEligible?:boolean; aimEmpowered?:boolean }, procFree=false, echoScale?:number, intrinsic?:IntrinsicDamage, receipt?:{hp:number;total:number}, weaponFraction?:number, sylvaBasic=false, sylvaBonus=false): number {
    if (world.aftermath || world.destruction) return 0;
    if (!isHostileToPlayer(world,enemy) || rawDamage <= 0 || world.bossDefeated)
        return 0;
    if(telemetryCore===220 || telemetryCore===221)return resolveReleaseDamage(world,enemy,rawDamage,telemetryCore);
    const deathbloomBudget=skillId==='sylva_deathbloom'?sylvaDetonationBudget(world,enemy,rawDamage):undefined;
    const state = world.aircraft, time = state.coreState.time, target = targetMetadata(enemy);
    const basic = directPlayer && source === "basic", skillHit = directPlayer && echoScale===undefined && (!!skillId || source === "skill");
    const primary = basic && !!primaryShot;
    const firstPrimaryHit = primary && !primaryShot!.resolved;
    if(firstPrimaryHit&&(hasCore(state,114)||hasCore(state,116))&&(state.coreState.stacks.sameTargetId!==enemy.id||(state.coreState.timers.sameTarget??0)<time))state.coreState.stacks.sameTargetHits=0;
    const stats=getEffectiveAircraftStats(state);
    const sameTargetBonus=expansionActive(state,"sameTarget")?1+.03*Math.min(4,Math.floor((state.coreState.stacks.sameTargetHits??0)/4)):1;
    const marks = enemy.expansionMarks ??= {};
    if((marks.preliminary??0)>0&&(marks.preliminary??0)<=time){marks.preliminaryReady=marks.preliminary+10;marks.preliminary=0;}
    const preliminary=skillHit&&(marks.preliminary??0)>time;
    const skillPhase=skillHit&&hasCore(state,207)&&(marks.skillPhase??0)>time;
    const gunPhase=primary&&(marks.gunPhase??0)>time;
    const criticalLock=directPlayer&&(marks.criticalLock??0)>time;
    cast ??= skillId ? expansionState(state).casts[skillId] : undefined;
    let expansionMultiplier = directPlayer ? expansionOutgoing(state, basic, skillHit&&source!=="burn", primary||echoScale!==undefined) : heatMultiplier(state);
    let hitMultiplier = 1, recoilDamage = 0;
    if (skillHit && !procFree) {
        expansionMultiplier *= 1 + (cast?.overclock ?? 0);
        if (skillId && expansionState(state).primarySkill === skillId) expansionMultiplier *= 1.25;
        if ((marks.preliminary ?? 0) > time) { hitMultiplier *= 1.20; marks.preliminary = 0; marks.preliminaryReady = time + 10; }
        if (hasCore(state,207)) {
            if ((marks.skillPhase ?? 0) > time) { hitMultiplier *= 1.30; marks.skillPhase = 0; }
            else {marks.gunPhase = time + 5;recordCoreMetric(state,207,"gunPhases",1);}
        }
        if (hasCore(state,187) && (state.coreState.stacks.recoil ?? 0) > 0) {
            recoilDamage = Math.min(state.coreState.stacks.recoil, stats.firepower * 5); state.coreState.stacks.recoil = 0;const sh=createAbsorbShield(state,"recoilGuard",recoilDamage*.2,4);sh.coreRow=187;recordCoreMetric(state,187,"shieldCreated",sh.amount);
            recordCoreMetric(state,187,"procs",1);
        }
    }
    if (directPlayer && (marks.shieldBroken ?? 0) > time) expansionMultiplier *= 1.20;
    if (primary && (marks.gunPhase ?? 0) > time) { hitMultiplier *= 1.30; marks.gunPhase = 0; }
    const canCrit = !intrinsic?.noCrit && (!intrinsic || (!!skillId && !intrinsic.trueDamage)) && source !== "core" && source !== "lightning" && (echoScale!==undefined || (!skillId && source !== "skill" && source !== "burn") || canSkillsCrit(state));
    const opening=!procFree && primary && hasCore(state,117) && (tacticalState(world).openingHits.get(enemy.id) ?? -Infinity) <= time;
    if(opening)tacticalState(world).openingHits.set(enemy.id, time+25);
    const guaranteed=primary&&hasCore(state,87)&&(target.elite||target.boss)&&(state.coreState.stacks.eliteCritHits??0)>=5;
    let effectiveStats = opening || guaranteed ? {...stats,criticalChance:1} : canCrit ? stats : { ...stats, criticalChance: 0 };
    const skillEffects = world.skillCores.enemyEffects.get(enemy.id);
    if((marks.controlWeakness??0)>time)expansionMultiplier*=1.25;
    if(skillHit&&hasCore(state,182)&&(cast?.resourceRatio??0)>.6)expansionMultiplier*=1.10;
    if(skillHit&&hasCore(state,81)&&cast?.skillShieldUntil && (!["escort_drone","sweeping_cannon"].includes(skillId??"")||time<cast.skillShieldUntil))expansionMultiplier*=1.15;
    if(skillId&&hasCore(state,97)&&!isUltimate(skillId))expansionMultiplier*=1.35;
    if(directPlayer&&source!=="burn"&&source!=="core"&&source!=="lightning")expansionMultiplier*=rankDirectMultiplier(world,enemy,skillId);
    if(procFree&&skillId){expansionMultiplier*=1+(cast?.overclock??0);if(expansionState(state).primarySkill===skillId)expansionMultiplier*=1.25;}
    const skillPen=skillId==="stellar_lance"&&(skillRank(state, "stellar_lance") >= 4)?.30:0;
    const armor = intrinsic?.trueDamage || opening ? 0 : resolvedEnemyArmor(world,enemy,combineArmorPenetration(skillPen,armorPenetration(state)));
    if (directPlayer && (marks.criticalLock ?? 0) > time) effectiveStats = { ...effectiveStats, criticalDamageMultiplier: effectiveStats.criticalDamageMultiplier + .20 };
    if(skillHit&&cast){if(source!=="burn")cast.equipmentBonus??=equipmentConsumeSkillBonus(state);expansionMultiplier*=(cast.compressed?1.14:1)*(cast.capacitor?1.10:1)*(cast.equipmentBonus??1);}
    
    const whiteHole=source==="basic"&&(state.coreState.timers.whiteHole??0)>time;
    let multiplier = expansionMultiplier * (whiteHole?1.6:1)*outgoingCoreMultiplier(state, target, source, Math.hypot(enemy.x - world.playerX, enemy.y - world.playerY), GAMEPLAY_SAFE_RECT.height);
    if (directPlayer && (source === "basic" || source === "weapon" || source === "skill") && state.aircraftId === "breaker" && (skillEffects?.markUntil || 0)>time) multiplier *= 1 + V.markBonus;
    if (directPlayer && (source === "basic" || source === "weapon" || source === "skill") && state.aircraftId === "phantom" && world.skillCores.syncTarget === enemy.id && world.skillCores.syncUntil>time) multiplier *= 1 + V.syncBonus;
    if(directPlayer && world.skillCores.bountyTarget===enemy.id && world.skillCores.bountyUntil>world.elapsed)multiplier*=1.10;
    const zoneMultiplier=delivery==="direct_projectile"||delivery==="aircraft_collision"?wingDamageMultiplier(contact?.zone):1;
    if(hasCore(state,115) && !world.enemies.some(e=>e.id!==enemy.id && isHostileToPlayer(world,e) && Math.hypot(e.x-enemy.x,e.y-enemy.y)<=80))multiplier*=enemy.type==="boss"?1.2:1.3;
    if((state.coreState.timers.comeback??0)>time)multiplier*=1.20;
    const crowdBonus=hasCore(state,118)?crowdDamageBonus(world):0;
    if(hasCore(state,118))multiplier*=1+crowdBonus;
    const equipmentDirect=directPlayer && source!=="burn" && source!=="core" && source!=="lightning" && (basic || source==="weapon" || skillHit);
    const equipmentDamage=equipmentOutgoing(state,enemy,basic,skillHit&&equipmentDirect,equipmentDirect);
    const equipmentBaseRaw=rawDamage;
    if(!intrinsic)rawDamage+=equipmentDamage.bonus;
    multiplier*=equipmentDamage.multiplier*(echoScale??1);
    if(intrinsic && !intrinsic.preserveModifiers && (!skillId || intrinsic.trueDamage)){multiplier=1;hitMultiplier=1;recoilDamage=0;}
    const firstVolleyDamage = volleyHits?.get(enemy.id);
    const gatling=hasCore(state,229)&&(weaponFraction!==undefined||intrinsic?.weapon===true);
    const weaponRaw=intrinsic?.weapon?rawDamage:equipmentBaseRaw*(weaponFraction??0);
    const weaponBeforeCrit=weaponRaw*(echoScale??1)*Math.min(1,multiplier/Math.max(Number.EPSILON,echoScale??1)*hitMultiplier);
    const unpenalizedBeforeCrit=(rawDamage+recoilDamage)*multiplier*hitMultiplier;
    const penalizedBeforeCrit=unpenalizedBeforeCrit-(gatling?.45*weaponBeforeCrit:0);
    const firstVolleyWeapon=volleyHits?volleyWeaponComponents.get(volleyHits)?.get(enemy.id)??0:0;
    // Preserve the fan's 15% baseline without copying consumed, one-hit Core bonuses.
    // Each hit resolves its own mark/capacitor once, including later fan projectiles.
    const resolved = firstVolleyDamage === undefined
        ? resolvePlayerDamage(penalizedBeforeCrit * zoneMultiplier * sylvaOutgoing(world,enemy), armor, effectiveStats, world.random)
        : { actualDamage: calculateDamage(((firstVolleyDamage-(gatling?.45*firstVolleyWeapon:0)) * .15 + recoilDamage * multiplier) * hitMultiplier * zoneMultiplier * sylvaOutgoing(world,enemy), armor), critical: false, multiplier: 1 };
    if (volleyHits && firstVolleyDamage === undefined){
        volleyHits.set(enemy.id, rawDamage * multiplier * resolved.multiplier);
        let parts=volleyWeaponComponents.get(volleyHits);if(!parts){parts=new Map();volleyWeaponComponents.set(volleyHits,parts);}
        parts.set(enemy.id,weaponBeforeCrit/Math.max(Number.EPSILON,hitMultiplier)*resolved.multiplier);
    }
    let damage = resolved.actualDamage * penetrationScale * guardianMultiplier(world, enemy) * stormDamageTakenMultiplier(world, enemy);
    const aegis = enemy.type === "boss" && enemy.hp / enemy.maxHp >= .15 && enemy.aegisUntil > time;
    if (aegis && !intrinsic?.trueDamage)
        damage *= .6;
    if(intrinsic?.trueDamage && !intrinsic.preserveModifiers && guardianMultiplier(world,enemy)>0 && stormDamageTakenMultiplier(world,enemy)>0)damage=rawDamage*sylvaOutgoing(world,enemy);
    if(deathbloomBudget!==undefined)damage=deathbloomBudget*resolved.multiplier;
    if(gatling)recordCoreMetric(state,229,"weaponDamageReduced",calculateDamage(.45*(firstVolleyDamage===undefined?weaponBeforeCrit*resolved.multiplier:firstVolleyWeapon*.15*hitMultiplier)*zoneMultiplier,armor)*penetrationScale*guardianMultiplier(world,enemy)*stormDamageTakenMultiplier(world,enemy)*(aegis?.6:1));
    const resolvedBeforeShield=damage,shieldBeforeHit=enemy.shield;
    // Extra shield damage is confined to the absorb pool; overflow uses the original HP budget.
    const shieldFactor = basic && hasCore(state,180) ? 1.50 : 1;
    let absorbed = enemy.aircraftTarget ? 0 : Math.min(enemy.shield, damage * shieldFactor);
    if (!enemy.aircraftTarget) enemy.shield -= absorbed;
    if(!enemy.aircraftTarget&&basic&&hasCore(state,180))recordCoreMetric(state,180,"shieldBonus",absorbed-Math.min(shieldBeforeHit,resolvedBeforeShield));
    if (absorbed > 0 && enemy.shield <= 0 && enemy.type === "iron_fortress" && enemy.retaliationReady) {
        enemy.retaliationReady = false;
        queueEliteSpecial(world, enemy, "retaliation", .01, false);
    }
    damage = Math.max(0, damage - absorbed / shieldFactor);
    if (directPlayer && absorbed > 0 && enemy.shield <= 0 && hasCore(state,180)) {marks.shieldBroken = time + 6;recordCoreMetric(state,180,"shieldBreaks",1);}
    const potential=damage,hpBefore=enemy.hp;
    damage = Math.min(enemy.hp, damage);
    if(hasCore(state,121) && chargeAntimatter && !procFree){
        const gain=(target.elite||target.boss?damage*.02:Math.max(0,potential-hpBefore)*.42);
        cBank(state,gain);
    }
    if (enemy.aircraftTarget) {
        const received = receiveAircraftTargetDamage(enemy, potential, delivery, contact?.zone, armor, shieldFactor, skillId==="missile_swarm"||skillId==="predator_lock", intrinsic?.trueDamage,source==="burn",!!intrinsic?.reflection);
        damage = received.damage; absorbed += received.absorbed;
        if(basic&&hasCore(state,180)&&absorbed>0&&!hasAbsorbShield(enemy.aircraftTarget.world.aircraft)){marks.shieldBroken=time+6;recordCoreMetric(state,180,"shieldBreaks",1);}
    } else enemy.hp = Math.max(0, enemy.hp - damage);
    if(sylvaBasic && damage+absorbed>0)sylvaAcidHit(world,enemy,sylvaHooks);
    if(basic&&state.aircraftId==='terra'&&damage+absorbed>0)terraFx(world,'impact',enemy.x,enemy.y,26,.22);
    sylvaDealt(world,enemy,damage,damage+absorbed,skillId,sylvaHooks,sylvaBonus);
    // Capture this delivery before secondary equipment/Core effects can change the target.
    if(receipt){receipt.hp=damage;receipt.total=damage+absorbed;}
    if (world.stormbreaker) onStormEnemyDamage(world, enemy, damage, shieldBeforeHit,stormbreakerHooks);
    if(directPlayer&&damage+absorbed>0)recordDpsDamage(world,damage+absorbed);
    if(intrinsic?.passive || intrinsic?.source==="cinder_burn")recordPassiveDamage(state,damage,absorbed,intrinsic.source==="cinder_burn");
    if(procFree&&enemy.hp<=0){enemy.expansionKillingHit=undefined;enemy.killProcEligible=false;}
    if (directPlayer && !procFree && damage + absorbed > 0) {
        if(basic||skillHit)world.playerTargetId=enemy.id;
        if (firstPrimaryHit) {
            predatorBasicHit(world,enemy,rankHooks,hpBefore<enemy.maxHp*.4);
            argentPrimaryHit(world,primaryShot!,enemy.x,enemy.y);
            primaryShot!.resolved = true;
            const c=state.coreState;
            if(hasCore(state,87)&&(target.elite||target.boss))c.stacks.eliteCritHits=guaranteed?0:(c.stacks.eliteCritHits??0)+1;
            core28PrimaryHit(world,enemy);
            if(hasCore(state,114)||hasCore(state,116)){const before=c.stacks.sameTargetHits??0;c.stacks.sameTargetId=enemy.id;c.stacks.sameTargetHits=Math.min(16,before+1);c.timers.sameTarget=time+3;if(Math.floor(c.stacks.sameTargetHits/4)>Math.floor(before/4)){recordCoreMetric(state,114,"stacks",1);recordCoreMetric(state,116,"stacks",1);}}
            if(hasCore(state,210)){const r=releaseState(state);if(!r.aimReady&&!primaryShot?.aimEmpowered)r.misses++;if(!r.aimReady&&r.misses>=9){r.misses=0;r.aimReady=true;r.aimShots=(r.aimShots??0)+3;}}
            if (hasCore(state,168)&&(target.elite||target.boss)) {c.stacks.microHits=(c.stacks.microHits??0)+1;if(c.stacks.microHits>=40){c.stacks.microHits-=40;c.timers.shiftDiscount=time+5;recordCoreMetric(state,168,"procs",1);}}
            if (hasCore(state,179)) {const before=state.coreState.stacks.error??0;state.coreState.stacks.error = resolved.critical ? 0 : before+1;recordCoreMetric(state,179,resolved.critical?"consumed":"stacks",resolved.critical?1:state.coreState.stacks.error-before);const entry=state.coreState.telemetry.core_179??={};entry.peak=Math.max(entry.peak??0,state.coreState.stacks.error);}
        }
        if((basic||skillHit)&&resolved.critical&&hasCore(state,55)&&!marks.calibrated){marks.calibrated=1;core28Damage(world,enemy,stats.firepower*.4,55);}
        if(primary&&hasCore(state,68)&&!marks.feast){marks.feast=1;core28Damage(world,enemy,stats.firepower*.5,68);}
        if (primary) {
            if (hasCore(state,185) && (marks.preliminary??0)<=time && (marks.preliminaryReady ?? 0) <= time) { marks.preliminary = time + 4; delete marks.preliminaryReady;recordCoreMetric(state,185,"marks",1); }
            if (hasCore(state,207) && resolved.critical) {marks.skillPhase = time + 5;recordCoreMetric(state,207,"skillPhases",1);}
        }
        if(hasCore(state,188)&&resolved.critical&&!marks.criticalCounted&&(basic||skillHit)&&source!=="burn"){marks.criticalLock=time+5;marks.criticalCounted=1;recordCoreMetric(state,188,"procs",1);}
        if(hasCore(state,196)&&resolved.critical&&basic&&source!=="burn"&&(marks.crimsonReady??0)<=time){marks.crimsonReady=time+.5;const c=state.coreState;c.stacks.crimsonProgress=(c.stacks.crimsonProgress??0)+1;while(c.stacks.crimsonProgress>=4){c.stacks.crimsonProgress-=4;c.stacks.crimsonCrit=Math.min(10,(c.stacks.crimsonCrit??0)+1);recordCoreMetric(state,196,"procs",1);}}
        if (enemy.hp <= 0) enemy.expansionKillingHit = { primary, basic, skill: skillHit, critical: resolved.critical, direct: directPlayer && source !== "burn" && source !== "core" && source !== "lightning" && (delivery === "direct_projectile" || skillHit), elite: isElite(enemy.type) };
    }
    if(directPlayer) {
        // Counterfactual HP damage after the SAME crit, mitigation, shields and overkill clamp.
        // Never reroll combat RNG to attribute a modifier.
        const bonus=(row:number,fraction:number)=>{
            const budget=resolvedBeforeShield*(1-Math.max(0,Math.min(1,fraction))),shield=Math.min(shieldBeforeHit,budget*shieldFactor);
            const contribution=damage+absorbed-shield-Math.min(hpBefore,Math.max(0,budget-shield/shieldFactor));
            recordCoreMetric(state,row,"bonusDamage",contribution);return Math.max(0,contribution);
        };
        // Effect components retain their pre-Gatling amount. Attribute their share
        // against the reduced total, using this hit's existing crit/mitigation.
        const effectShare=(fraction:number)=>fraction*(gatling?unpenalizedBeforeCrit/Math.max(Number.EPSILON,penalizedBeforeCrit):1);
        const factor=(row:number,value:number)=>{if(hasCore(state,row))bonus(row,effectShare(1-1/value));};
        if(whiteHole){const contribution=bonus(155,effectShare(.6/1.6));astraMetric(world,"orbit.whiteHoleBonusDamage",contribution);}
        if(skillPen)bonus(158,Math.max(0,1-(100+Math.max(-80,armor))/(100+Math.max(-80,resolvedEnemyArmor(world,enemy,armorPenetration(state))))));
        for(const [row,fraction] of shotBonuses)bonus(row,effectShare(fraction));
        const equipmentContribution=(family:number,fraction:number,key="bonusDamage")=>{
          const budget=resolvedBeforeShield*(1-Math.max(0,Math.min(1,fraction))),shield=Math.min(shieldBeforeHit,budget*shieldFactor);
          equipmentMetric(state,family,key,damage+absorbed-shield-Math.min(hpBefore,Math.max(0,budget-shield/shieldFactor)));
        };
        for(const [family,factor] of equipmentDamage.factors)equipmentContribution(family,effectShare(1-1/factor));
        for(const [family,value] of equipmentDamage.bonuses)equipmentContribution(family,value*multiplier*hitMultiplier/Math.max(Number.EPSILON,penalizedBeforeCrit));
        if(equipmentEffect(state,14).until>time)equipmentContribution(14,P[14].firepower*equipmentScale(state,14)*equipmentEffect(state,14).value/Math.max(1,stats.firepower));
        if(preliminary){recordCoreMetric(state,185,"consumed",1);factor(185,1.20);}
        if(skillPhase||gunPhase){recordCoreMetric(state,207,"consumed",1);factor(207,1.30);}
        if(expansionActive(state,"alternating"))factor(175,1.14);
        if((marks.shieldBroken??0)>time&&shieldBeforeHit===0)factor(180,1.14);
        if(basic&&expansionActive(state,"confluence"))factor(186,1.30);
        if(primary)factor(206,1.85);
        if(skillHit){factor(190,1.25);if(expansionState(state).primarySkill===skillId)factor(202,1.25);if(cast?.overclock)factor(199,1+cast.overclock);}
        if(hasAbsorbShield(state))factor(192,1.25);
        factor(203,activeNegativeStatusTypes(state).size?1.30:1.12);
        factor(205,1.55);
        if(criticalLock&&resolved.critical)bonus(188,.20/effectiveStats.criticalDamageMultiplier);
        if(recoilDamage>0)recordCoreMetric(state,187,"damage",bonus(187,recoilDamage/(rawDamage+recoilDamage)));
        if(state.coreState.time-state.coreState.lastKill<=6)factor(66,1+.05*(state.coreState.stacks.combo??0));
        factor(91,1+Math.min(.8,.1+Math.max(0,1-state.currentHp/stats.maxHp)*.7));
        if(expansionActive(state,"comeback"))factor(98,1.20);
        if((state.coreState.timers.decoyCounter??0)>time)factor(21,1.3);
        if(target.elite||target.boss)factor(67,1.22);
        factor(68,hpBefore<enemy.maxHp*.30||hpBefore>enemy.maxHp*.70?1.30:1.08);
        if(hpBefore>enemy.maxHp*.7)factor(69,1.30);
        factor(212,1.08);
        if(expansionActive(state,"ultimateAftershock"))factor(218,1.35);
        if(basic){factor(111,1.12);if(hasCore(state,54)){const conversion=state.coreState.stacks.fireRateConversion??1;bonus(54,unpenalizedBeforeCrit*(1-1/conversion)/Math.max(Number.EPSILON,penalizedBeforeCrit));}factor(58,expansionActive(state,"overloadedBarrel")?1.15:1.08);}
        if(basic||skillHit)factor(114,1+.03*Math.min(4,Math.floor((state.coreState.stacks.sameTargetHits??0)/4)));
        if(skillHit){factor(119,1.15);if(cast?.capacitor)factor(172,1.10);if((cast?.resourceRatio??0)>.6)factor(182,1.10);}
        if((target.elite||target.boss)&&hpBefore<enemy.maxHp*.5)factor(88,1.15);
        const distance=Math.hypot(enemy.x-world.playerX,enemy.y-world.playerY);
        if(basic)factor(101,distance<GAMEPLAY_SAFE_RECT.height/3?1.20:1.08);
        if(skillHit&&cast?.compressed)factor(102,1.14);
        if(hasCore(state,115)&&!world.enemies.some(e=>e.id!==enemy.id&&isHostileToPlayer(world,e)&&Math.hypot(e.x-enemy.x,e.y-enemy.y)<=80))factor(115,enemy.type==="boss"?1.2:1.3);
        factor(118,1+crowdBonus);
        const direct=source==="basic"||source==="weapon"||source==="skill";
        if(direct&&state.aircraftId==="breaker"&&(skillEffects?.markUntil??0)>time)factor(135,1+V.markBonus);
        if(direct&&state.aircraftId==="phantom"&&world.skillCores.syncTarget===enemy.id&&world.skillCores.syncUntil>world.elapsed)factor(146,1+V.syncBonus);
        if(world.skillCores.bountyTarget===enemy.id&&world.skillCores.bountyUntil>world.elapsed)factor(149,1.10);
        if(skillId==="focus_laser")factor(41,getSkillRuntimeValues(state,"focus_laser").damageMultiplier);
        if(skillId==="orbit_reversal")factor(151,.70/.30);
        if(skillId==="starfall"&&source!=="burn")factor(162,getSkillRuntimeValues(state,"starfall").damageMultiplier/2.75);
        if(skillId==="escort_drone"&&(skillRank(state, "escort_drone") >= 2))factor(45,getSkillRuntimeValues(state,"escort_drone").damageMultiplier/.7);
        if(skillId==="missile_swarm"&&source!=="burn")factor(26,getSkillRuntimeValues(state,"missile_swarm").damageMultiplier/2);
        if(skillId==="heavy_bomb"&&!telemetryCore)factor(32,19/(SKILL_CONFIGS.heavy_bomb.damageMultiplier??1));
        if(resolved.critical){
            if(skillId||source==="skill"){recordCoreMetric(state,53,"procs",1);bonus(53,1-1/resolved.multiplier);}
            recordCoreMetric(state,56,"crits",1);
        }
        if(opening)recordCoreMetric(state,117,"procs",1);
        
        for(const [row,pen] of [[57,.20],[88,.40]])if(hasCore(state,row)) {
            const without=intrinsic?.trueDamage || opening ? 0 : resolvedEnemyArmor(world,enemy,combineArmorPenetration(skillPen,armorPenetration(state,row)));
            bonus(row,Math.max(0,1-(100+Math.max(-80,armor))/(100+Math.max(-80,without))));
        }
    }
    if(heatMultiplier(state)>1){
        const without=resolvedBeforeShield/heatMultiplier(state),shield=Math.min(shieldBeforeHit,without*shieldFactor);
        recordCoreMetric(state,219,"bonusDamage",damage+absorbed-shield-Math.min(hpBefore,Math.max(0,without-shield/shieldFactor)));
    }
    recordCoreMetric(state, telemetryCore, "damage", damage+absorbed);
    if (damage + absorbed > 0) recordCoreMetric(state, telemetryCore, "hits", 1);
    if(damage>0&&skillId==="sweeping_cannon")emitVisual(world,{kind:"ultimate_effect",ultimateEffect:"ultimateTitanImpact",x:contact?.x??enemy.x,y:contact?.y??enemy.y,size:28});
    if (damage > 0 && skillId === "sweeping_cannon" && skillRank(state, "sweeping_cannon") >= 3 && cast) {
        const received=getHealingReceivedMultiplier(state);
        // Spend healing entitlement, including overheal, before Core104 can convert it.
        const amount=Math.min(damage*V.cannonHeal,Math.max(0,stats.maxHp*.30-(cast.cannonHealingSpent??0))/Math.max(Number.EPSILON,received));
        cast.cannonHealingSpent=(cast.cannonHealingSpent??0)+amount*received;
        healPlayerWithFeedback(world,amount,"skill_core",true,138,"sweeping_cannon");
    }
    if (damage + absorbed > 0 && directPlayer && (delivery==="direct_projectile"||delivery==="beam") && (skillRank(state, "escort_drone") >= 3) && source !== "burn" && source !== "core" && source !== "lightning") recordTargetSync(world,enemy,skillId === "escort_drone");
    if (damage + absorbed > 0) {
        if (world.magnetic && enemy.magnetic && world.elapsed >= (enemy.magnetic.hitFxAt ?? 0)) {
            magneticFx(world, enemy.type === "boss" ? "weakpointFlash" : absorbed > 0 ? "shieldFlare" : "electricImpact",
                contact?.x ?? enemy.x, contact?.y ?? enemy.y, enemy.type === "boss" ? 34 : 18, .16);
            enemy.magnetic.hitFxAt = world.elapsed + .12;
        }
        emitVisual(world, { kind: "damage_number", x: enemy.x, y: enemy.y, size: enemy.radius, hpDamage: damage, shieldAbsorbed: absorbed, target: "enemy", critical: resolved.critical, entityId: enemy.id, provenance:intrinsic?.source==="cinder_burn"?{source:"cinder_burn",ownerId:intrinsic.ownerId!,targetId:enemy.id,session:intrinsic.burnSession!}:undefined, genericShieldAbsorbed:enemy.aircraftTarget?0:absorbed });
        emitVisual(world, { kind: "hit", x: contact?.x??enemy.x, y: contact?.y??enemy.y, size: enemy.radius, entityId: enemy.id, directContact:!!contact, skillId });
        world.damageDealt += damage;
        if(!contact)addParticles(world, enemy.x, enemy.y, color, 2);
        if(!procFree && contact && (source==="basic"||source==="weapon"))recordCrossfire(world,enemy);
        const ctx = coreContext(world, { target, damage, source });
        if (!procFree && source !== "burn" && source !== "lightning" && source !== "core")
            dispatchCoreEvent("hit", ctx);
        if (resolved.critical && !procFree)
            dispatchCoreEvent("critical", ctx);
    }
    if (skillId === "missile_swarm" && source !== "burn" && (skillRank(state, "missile_swarm") >= 3) && enemy.hp > 0) {
        enemy.burnCast = cast;
        enemy.burn = statusExpiry(enemy,"burn",0,5);
        enemy.burnArmorUntil = statusExpiry(enemy,"burnArmorUntil",time,6);
        enemy.burnDamage = stats.firepower * .9;
        if (enemy.burnTick <= 0)
            enemy.burnTick = 1;
    }
    if(!procFree&&damage+absorbed>0)equipmentOnHit(world,equipmentHooks,{enemy,basic,primary:firstPrimaryHit,skill:skillHit&&equipmentDirect,critical:resolved.critical,direct:equipmentDirect,damage:damage+absorbed,skillId,cast});
    if(!intrinsic && damage+absorbed>0)passiveHit(world,enemy,{
      primary:primary&&!procFree,
      skillDirect:!!skillId&&source!=="burn"&&source!=="core"&&source!=="lightning",
      critical:resolved.critical,beforeCrit:rawDamage*multiplier*hitMultiplier*zoneMultiplier
    },cinderHooks);
    if(!intrinsic && primary && !procFree && damage+absorbed>0 && primaryShot)
      riptideAfterwash(world,enemy,rawDamage*multiplier*hitMultiplier,primaryShot,contact?.x??enemy.x,contact?.y??enemy.y,riptideHooks);
    observeBossDamage(world,enemy,damage);
    if(!procFree)accumulateDeathMark(world,enemy,damage+absorbed);
    return damage;
}
function observeBossDamage(world:CombatWorld,enemy:EnemyEntity,damage:number):void {
    const time=world.aircraft.coreState.time;
    if (world.stage.runtime === "leviathan" && enemy.type === "boss" && enemy.hp > 0) {
        enemy.recentDamage.push({ time, damage });
        while (enemy.recentDamage.length && enemy.recentDamage[0].time < time - 1)
            enemy.recentDamage.shift();
        const ratio = enemy.hp / enemy.maxHp;
        if (ratio < .15) enemy.aegisUntil = 0;
        if (ratio < .7 && ratio >= .15 && time >= enemy.aegisReady && enemy.recentDamage.reduce((n, h) => n + h.damage, 0) >= 600) {
            enemy.aegisUntil = time + 3;
            enemy.aegisReady = time + 22;
            enemy.recentDamage.length = 0;
            setMessage(world, "LEVIATHAN · KHIÊN PHẢN ỨNG", 1.5);
        }
    }
}
function destroyEnemy(world: CombatWorld, enemyIndex: number): void {
    const enemy = world.enemies[enemyIndex];
    if (world.destruction || world.aftermath || !enemy || enemy.aircraftTarget || enemy.deathHandled)
        return;
    if (world.stormbreaker && isStormObjective(enemy.type)) { enemy.killProcEligible=false; enemy.expansionKillingHit=undefined; }
    if(world.rankRuntime?.lock?.target===enemy.id)world.rankRuntime.lock.killed=true;
    equipmentOnKill(world,equipmentHooks,enemy);
    expansionKill(world, enemy, expansionHooks);
    if(enemy.killProcEligible!==false)settleBountyKill(world,enemy);
    guardianDestroyed(world, enemy);
    enemy.deathHandled = true;
    world.skillCores.enemyEffects.delete(enemy.id);
    world.skillCores.syncLockouts.delete(enemy.id);
    if(world.skillCores.syncTarget===enemy.id){world.skillCores.syncTarget=null;world.skillCores.syncUntil=0;}
    const eliteWave=world.stage.waves[world.waveIndex].elite;
    if(eliteWave&&isElite(enemy.type))world.eliteResolve=Math.min(eliteWave===2?3:2,world.eliteResolve+1);
    const tactical=tacticalState(world);tactical.openingHits.delete(enemy.id);
    tactical.grids=tactical.grids.filter(g=>g.a!==enemy.id&&g.b!==enemy.id);
    tactical.hackTargets=tactical.hackTargets.filter(id=>id!==enemy.id);
    if(enemy.killProcEligible !== false && hasCore(world.aircraft,64) && world.random()<.20 && tactical.scraps.length<64)tactical.scraps.push({id:world.nextId++,x:enemy.x,y:enemy.y,until:world.elapsed+8});
    const target = targetMetadata(enemy), config = stageEnemyConfig(enemy.type, world.stageId), state = world.aircraft, c = state.coreState;
    if (world.stormbreaker) stormEnemyDestroyed(world, enemy,stormbreakerHooks);
    if (world.mirage) mirageEnemyDestroyed(world, enemy);
    if (world.magnetic) {
        magneticFx(world, target.boss ? "bossBurst" : target.elite ? "plasmaImpact" : "smallBurst", enemy.x, enemy.y, enemy.radius * 3, target.boss ? 1.8 : .5);
        if (target.boss) {
            magneticFx(world, "magneticBurst", enemy.x, enemy.y, 210, 1.6);
            for (let i = 0; i < 4; i++) magneticFx(world, "bossBurst", enemy.x + (i % 2 ? 30 : -30), enemy.y + (i < 2 ? -25 : 25), 80, .65, 0, .12 + i * .16);
        }
    }
    emitVisual(world, { kind: "explosion", x: enemy.x, y: enemy.y, size: enemy.radius * 3, boss: target.boss, killTier: target.boss ? "boss" : target.elite ? "elite" : "normal", magneticDeath: !!world.magnetic || !!world.stormbreaker || !!world.mirage });
    if (!enemy.rewardless) {
        world.score += config.score * getComboMultiplier(world.comboKills);
        world.comboKills++; world.comboTimer = 4;
        world.maxCombo = Math.max(world.maxCombo, world.comboKills);
    }
    if (!world.mirage) addParticles(world, enemy.x, enemy.y, config.color, target.boss ? 36 : target.elite ? 20 : 9);
    if (!enemy.rewardless && state.aircraftId === "phantom")
        state.currentResource = Math.min(getEffectiveAircraftStats(state).maxResource, state.currentResource + 1);
    if (enemy.killProcEligible !== false) {
    c.kills++;
    c.killTimes.push(c.time);
    while (c.killTimes.length > 5)
        c.killTimes.shift();
    dispatchCoreEvent("kill", coreContext(world, { target }));
    syncEffectiveMaxHp(state);
    c.lastKill = c.time;
    }
    if (target.boss) {
        world.bossDefeated = true;
        world.ended = true;
        if (world.stormbreaker) resetStormbreaker(world);
        world.pauseReasons.add("result");
        world.bossClearSeconds = world.bossStartedAt === null ? null : world.elapsed - world.bossStartedAt;
        setMessage(world, `${world.stage.bossName.toUpperCase()} ĐÃ BỊ HẠ`, 3);
        clearHostileObjects(world);
        if (world.magnetic || world.stormbreaker) for (const helper of world.enemies) if (helper.auxiliary) { helper.hp = 0; helper.deathHandled = true; }
        world.effectQueue.length = 0;
    }
    else {
        if (!enemy.auxiliary) world.enemiesDefeated++;
        if (target.elite)
            world.elitesDefeated++;
        const level = gainCombatXp(state, enemy.xp, world.stageId);
        world.pendingCoreSelections = world.initialCoreQueued ? state.pendingMilestones.length : 0;
        if (level.levelsGained)
            setMessage(world, `CẤP CHIẾN ĐẤU ${state.level}`, 1.5);
    }
    recycleEnemy(world, enemyIndex);
}
/** Iterative kill/proc queue: fragmentation can chain; lightning cannot re-proc itself. */
function resolveDeathsAndEffects(world: CombatWorld): void {
    if (world.destruction || world.aftermath) return;
    while (true) {
        for (let i = world.enemies.length - 1; i >= 0; i--)
            if (world.enemies[i].hp <= 0 && !world.enemies[i].aircraftTarget)
                destroyEnemy(world, i);
        const effect = world.effectQueue.shift();
        if (!effect || world.bossDefeated)
            break;
        if (effect.kind === "explosion") {
            emitVisual(world, { kind: "explosion", x: effect.target.x, y: effect.target.y, size: 92 });
            for (const enemy of world.enemies)
                if (enemy.hp > 0 && circleVsAircraft(effect.target.x,effect.target.y,40,getEnemyHitbox(enemy)))
                    applyDamageToEnemy(world, enemy, effect.raw, "#fb923c", "weapon",undefined,undefined,undefined,"area_hazard",true,true,73);
        }
        else {
            const targets=world.enemies.filter(e=>e.id!==effect.target.id&&isHostileToPlayer(world,e)&&canTargetEnemy(world,e)&&e.lightningUntil<=world.elapsed)
              .sort((a,b)=>Math.hypot(a.x-effect.target.x,a.y-effect.target.y)-Math.hypot(b.x-effect.target.x,b.y-effect.target.y)).slice(0,5);
            if(!targets.length){const original=world.enemies.find(e=>e.id===effect.target.id&&isHostileToPlayer(world,e)&&e.lightningUntil<=world.elapsed);if(original)targets.push(original);}
            for(const target of targets){target.lightningUntil=world.elapsed+.5;applyDamageToEnemy(world,target,effect.raw,"#67e8f9","lightning",undefined,undefined,undefined,"area_hazard",true,true,105);
              emitVisual(world,{kind:"lightning",x:target.x,y:target.y,fromX:effect.target.x,fromY:effect.target.y,size:target.radius*3});}

        }
    }
    settleControlOverride(world);
    if (!world.stageVictory && world.bossDefeated && world.ended && world.aircraft.currentHp > 0 && !world.enemies.some(e => e.type === "boss") && world.effectQueue.length === 0) {
        world.stageVictory = true;
        world.stageFirstClear = persistStageVictory(world.stageId);
    }
}
function applySecondaryHits(world: CombatWorld, projectile: ProjectileEntity, primary: EnemyEntity): void {
    if(projectile.coreRicochet){
        projectile.coreRicochet=false;
        const next=nearestEnemy(world,primary.x,primary.y,projectile.hitIds);
        if(next){
            const angle=Math.atan2(next.y-primary.y,next.x-primary.x),speed=PLAYER_BASIC_PROJECTILE_SPEED_MULTIPLIER*460*(hasCore(world.aircraft,111)?3:1)*(hasCore(world.aircraft,206)?.8:1);
            const bounced=addProjectile(world,{owner:"player",source:"basic",sylvaAcidRound:projectile.sylvaAcidRound,ammoVisualKey:projectile.ammoVisualKey,weaponFraction:projectile.weaponFraction,telemetryCore:80,x:primary.x,y:primary.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,rawDamage:projectile.rawDamage*.42,radius:projectile.radius,homing:true,targetId:next.id,turnRate:7,color:"#c4b5fd"});
            if(bounced)bounced.hitIds.push(...projectile.hitIds);
        }else applyDamageToEnemy(world,primary,projectile.rawDamage*.18,"#c4b5fd","basic",undefined,undefined,undefined,"direct_projectile",true,true,80);
        recordCoreMetric(world.aircraft,80,"procs",1);
    }
    if (projectile.bounceRemaining <= 0)
        return;
    const next = nearestEnemy(world, primary.x, primary.y, projectile.hitIds);
    if (!next)
        return;
    // A bounce picks its direction once; misses leave the screen as ordinary bullets.
    const angle = Math.atan2(next.y - primary.y, next.x - primary.x);
    const bounceSpeed=(projectile.source==="basic"?PLAYER_BASIC_PROJECTILE_SPEED_MULTIPLIER:1)*(projectile.source==="basic"&&hasCore(world.aircraft,111)?1380:460)*(projectile.source==="basic"&&hasCore(world.aircraft,206)?.8:1);
    const bounced = addProjectile(world, { owner: projectile.owner, sylvaAcidRound:projectile.sylvaAcidRound, weaponFraction:projectile.weaponFraction, expansionCast: projectile.expansionCast, allegiance:projectile.allegiance, source: projectile.source, telemetryCore: projectile.telemetryCore, ammoVisualKey: projectile.ammoVisualKey, skillId: projectile.skillId,
        x: primary.x, y: primary.y, vx: Math.cos(angle) * bounceSpeed, vy: Math.sin(angle) * bounceSpeed, radius: projectile.radius,
        rawDamage: projectile.bounceSecondMultiplier !== undefined && projectile.bounceRemaining === 1 ? (projectile.bounceBasis || 0) * projectile.bounceSecondMultiplier : projectile.rawDamage * projectile.bounceMultiplier,
        telemetryBonuses: [...(projectile.telemetryBonuses??[]),...(projectile.bounceSecondMultiplier!==undefined&&(skillRank(world.aircraft, "afterburner") >= 4)?[[127,projectile.bounceRemaining===1?1-B.bounceSecond/V.bounceSecond:1-B.bounceFirst/V.bounceFirst] as [number,number]]:[])],
        telemetryExtraCores:projectile.telemetryExtraCores,
        bounceBasis: projectile.bounceBasis, bounceSecondMultiplier: projectile.bounceSecondMultiplier, homing: false, targetId: null, turnRate: 0,
        bounceRemaining: projectile.bounceRemaining - 1, bounceMultiplier: projectile.bounceMultiplier, color: "#c4b5fd" });
    if (bounced){
        bounced.hitIds.push(...projectile.hitIds);
    }
}
function hitPlayer(world: CombatWorld, rawDamage: number, kind: "projectile" | "collision" | "hazard" = "projectile", attack: AttackMetadata & { trueDamage?: boolean; damageOwner?: CombatWorld; aircraftDelivery?: boolean; armorResolved?: boolean; armorPrevented?: number; shieldFactor?: number; zoneResolved?: boolean; stormbreakerVisual?: StormbreakerVfxKey; homing?: boolean; x?:number; y?:number; previousX?:number; previousY?:number; projectileKind?:ProjectileEntity["projectileKind"] } = {}, contact?:HitResult): DuelDamageResolution {
    if(world.aftermath || world.destruction || (world.duel && !world.duel.combatEnabled))return { damage: 0, absorbed: 0 };
    const state = world.aircraft, c = state.coreState, stats = getEffectiveAircraftStats(state);
    const damageOwner = attack.damageOwner ?? world.duel?.opponent;
    if(world.duel)rawDamage *= damageOwner?.duel?.multiplier ?? 1;
    const defenseArmor = attack.trueDamage || attack.armorResolved ? 0 : stats.armor;
    // Tempest beams own a 0.20s tick schedule. Ordinary contact grace must not
    // turn that into 0.62s DPS; independently granted invulnerability still wins.
    if(equipmentUntargetable(state))return { damage: 0, absorbed: 0 };
    const scheduledBeam = world.stageId === 2 && attack.sourceEnemyType === "boss" && attack.delivery === "beam";
    const contactGrace = world.playerInvulnerability <= Math.max(0,world.playerDamageGraceUntil-world.elapsed)+1e-8;
    if (attack.allegiance==="friendly_hacked" || world.ended || (world.playerInvulnerability > 0 && (!(scheduledBeam || attack.aircraftDelivery) || !contactGrace)) || state.currentHp <= 0 || rawDamage <= 0 || world.waveState !== "combat")
        return { damage: 0, absorbed: 0 };
    const celestial=celestialProtection(state);
    // All hostile projectile, body, dash and hazard impacts converge here.
    // Config/tuning already contain concrete stage damage; retain only the existing boss impact rule.
    const sourceType = attack.sourceEnemyType ?? world.enemies.find(e => e.id === attack.sourceEnemyId)?.type;
    if (sourceType === "boss" && world.stageId === 1) rawDamage *= BOSS_DAMAGE_MULTIPLIER;
    if(!attack.trueDamage)rawDamage *= enemyOutputMultiplier(world,attack.sourceEnemyId);
    else {const source=world.enemies.find(e=>e.id===attack.sourceEnemyId);if(source)rawDamage*=terraSuppression(world,source);}
    if(kind==="collision"&&!contact){const source=world.enemies.find(e=>e.id===attack.sourceEnemyId);if(source)contact={...sweepAircraft(getEnemyHitbox(source),0,0,getPlayerHitbox(world),bodyContact)};}
    const hitZoneMultiplier=(kind==="projectile"||kind==="collision")?wingDamageMultiplier(contact?.zone):1;
    let zoneMultiplier=attack.zoneResolved?1:hitZoneMultiplier;
    let wingProtection=false;
    if(hitZoneMultiplier<1 && hasCore(state,109)){
        const key=`wing:${contact!.zone}`;
        if((c.timers[key]??0)<=c.time&&!celestial){wingProtection=true;zoneMultiplier*=.35;c.timers[key]=c.time+6;
            const scale=playerAirframeScale(state),x=world.playerX+(contact!.zone==="left_wing"?-11:11)*scale,y=world.playerY+5*scale;
            emitVisual(world,{kind:"shield_ripple",x,y,fromX:x-world.playerX,fromY:5*scale,attachedToPlayer:true,size:12*scale});
        }
    }
    const hazardGuard=hasCore(state,110)&&(attack.delivery==="explosive_aoe"||attack.homing||attack.delivery==="beam"||attack.attackTag==="emp"||attack.attackTag==="boss_emp");
    if(hazardGuard)zoneMultiplier*=.60;
    let multiplier = (state.activeEffects.armor_shield || 0) > 0 ? getSkillRuntimeValues(state, "armor_shield").damageTakenMultiplier : 1;
    if (kind === "collision" && hasCore(state, 65))
        multiplier *= .50;
    if (hasCore(state,103))multiplier*=state.currentHp<stats.maxHp*.35?.75:.92;
    if(hasCore(state,62)&&state.currentHp<stats.maxHp*.22)multiplier*=.90;
    if(hasCore(state,91)&&state.currentHp<stats.maxHp*.35)multiplier*=.90;
    if(hasCore(state,61)&&expansionActive(state,"reactiveArmor"))multiplier*=.90;
    if(hasCore(state,118)&&crowdDamageBonus(world)>=.24)multiplier*=.90;
    const attackingEnemy=world.enemies.find(e=>e.id===attack.sourceEnemyId);
    if(hasCore(state,101)&&attackingEnemy&&Math.hypot(attackingEnemy.x-world.playerX,attackingEnemy.y-world.playerY)<GAMEPLAY_SAFE_RECT.height/3)multiplier*=.90;
    if ((skillRank(state, "afterburner") >= 5) && (state.activeEffects.afterburner || 0) > 0) multiplier *= .85;
    const coldTrigger=hasCore(state,72)&&(c.stacks.coldCharges??0)>0;
    const cold=hasCore(state,72)&&(coldTrigger||expansionActive(state,"coldGuard"));
    if(cold)multiplier*=.30;
    if ((c.timers.thermalCover || 0)>c.time) multiplier *= 1 - V.thermalReduction;
    const orbitProtection=astraOrbitProtectionActive(world);
    if(orbitProtection)multiplier*=.65;
    multiplier *= riptideIncoming(world,attack.sourceEnemyId);
    multiplier *= expansionIncoming(state);
    const electric=hasCore(state,177)&&(attack.homing||attack.delivery==="beam"||attack.attackTag==="emp"||attack.attackTag==="boss_emp");
    const latch=expansionActive(state,"safetyLatch");
    if (hasCore(state,177) && (attack.homing || attack.delivery === "beam" || attack.attackTag === "emp" || attack.attackTag === "boss_emp")) multiplier *= .55;
    if (latch) { multiplier *= .60;if(!celestial)c.timers.safetyLatch = 0; }
    if(celestial){
        const capacity=state.currentHp+Object.values(c.shields).filter(sh=>sh.until>c.time).reduce((n,sh)=>n+sh.amount,0);
        recordCoreMetric(state,184,"prevented",Math.min(capacity,calculateDamage(rawDamage*zoneMultiplier,defenseArmor,multiplier)));
        if(attack.payload||attack.attackTag==="emp"||attack.attackTag==="boss_emp")recordCoreMetric(state,184,"controlBlocked",1);
        return { damage: 0, absorbed: 0 };
    }
    multiplier *= argentIncoming(world,attack,argentHooks);
    if(coldTrigger){c.stacks.coldCharges=0;c.timers.coldGuard=c.time+2.5;recordCoreMetric(state,72,"procs",1);}
    if(kind==="collision"&&hasCore(state,65))c.timers.collisionCounter=c.time+5;
    const shieldMultiplier = (state.activeEffects.armor_shield || 0)>0 ? getSkillRuntimeValues(state,"armor_shield").damageTakenMultiplier : 1;
    if (!attack.trueDamage && (skillRank(state, "armor_shield") >= 4) && shieldMultiplier < 1) {
        const prevented = calculateDamage(rawDamage*zoneMultiplier,defenseArmor,multiplier/shieldMultiplier) * (1-shieldMultiplier) * equipmentIncoming(state);
        const restored = refundResource(world,prevented*V.shieldConversion,c.stacks.shieldRefund || 0,132);
        c.stacks.shieldRefund = (c.stacks.shieldRefund || 0)+restored;
    }
    const equipmentIncomingFactor=equipmentIncoming(state);
    const equipmentPreDamage=calculateDamage(rawDamage*zoneMultiplier,defenseArmor,multiplier);
    multiplier*=equipmentIncomingFactor;
    let damage = attack.trueDamage ? rawDamage*riptideIncoming(world,attack.sourceEnemyId) : calculateDamage(rawDamage*zoneMultiplier, defenseArmor, multiplier), absorbed = 0, temporaryAbsorbed=0, genericShieldAbsorbed=0;
    const mitigationWithoutTitan=multiplier/shieldMultiplier;
    const armorPrevented=attack.trueDamage?0:(attack.armorPrevented??Math.max(0,rawDamage*zoneMultiplier-calculateDamage(rawDamage*zoneMultiplier,defenseArmor)))*mitigationWithoutTitan;
    const titanPrevented=!attack.trueDamage&&state.aircraftId==="breaker"?calculateDamage(rawDamage*zoneMultiplier,defenseArmor)*mitigationWithoutTitan*(1-shieldMultiplier):0;
    const incomingBudget=damage;
    const incomingShields=Object.values(c.shields).filter(sh=>sh.until>c.time);
    for(const shield of incomingShields)prepareAbsorbShield(state,shield);
    const shieldCapacity=incomingShields.reduce((n,sh)=>n+sh.amount,0);
    const incomingCapacity=state.currentHp+shieldCapacity;
    const gorgon=1-P[16].reduction*equipmentScale(state,16),aegisEquipment=equipmentIncomingFactor/gorgon;
    if(!attack.reflection)equipmentPreventedDamage(world,equipmentHooks,Math.max(0,damage/gorgon-damage));
    equipmentMetric(state,21,"prevented",Math.min(incomingCapacity,damage/aegisEquipment)-Math.min(incomingCapacity,damage));
    const exactPrevented=(row:number,factor:number)=>recordCoreMetric(state,row,"prevented",Math.min(incomingCapacity,damage/factor)-Math.min(incomingCapacity,damage));
    if(orbitProtection){exactPrevented(153,.65);recordCoreMetric(state,153,"protectedHits",1);}
    if(wingProtection){recordCoreMetric(state,109,"hits",1);exactPrevented(109,.35);}
    if(electric){recordCoreMetric(state,177,"hits",1);exactPrevented(177,.55);}
    if(latch){recordCoreMetric(state,171,"procs",1);exactPrevented(171,.60);}
    if(activeNegativeStatusTypes(state).size)exactPrevented(203,.75);
    for(const row of [61,170,183,192,209])if(hasCore(state,row)){
        const without=getEffectiveAircraftStats({...state,selectedCores:state.selectedCores.filter(id=>id!==coreId(row)),coreState:{...c,stacks:{...c.stacks}}});
        recordCoreMetric(state,row,"prevented",Math.min(incomingCapacity,calculateDamage(rawDamage*zoneMultiplier,without.armor,multiplier))-Math.min(incomingCapacity,damage));
    }
    const prevented=(row:number,factor:number)=>recordCoreMetric(state,row,"prevented",damage/factor-damage);
    if(hazardGuard)prevented(110,.60);
    if(kind==="collision")prevented(65,.50);
    prevented(103,state.currentHp<stats.maxHp*.35?.75:.92);
    if((state.activeEffects.afterburner??0)>0)prevented(24,.9);
    if(cold)prevented(72,.30);
    if((c.timers.thermalCover??0)>c.time)prevented(124,1-V.thermalReduction);
    if((state.activeEffects.armor_shield??0)>0)recordCoreMetric(state,28,"prevented",damage*(.45/getSkillRuntimeValues(state,"armor_shield").damageTakenMultiplier-1));
    if((state.activeEffects.sweeping_cannon??0)>0 && (skillRank(state, "sweeping_cannon") >= 2))recordCoreMetric(state,35,"prevented",Math.max(0,calculateDamage(rawDamage*zoneMultiplier,stats.armor/1.4,multiplier)-damage));
    for (const [key, shield] of Object.entries(c.shields)) {
        if (shield.until <= c.time)
            continue;
        prepareAbsorbShield(state, shield);
        const shieldFactor=(attack.shieldFactor??1)*(key==="cinder"?cinderShieldFactor(world,attack.sourceEnemyId,!!attack.trueDamage):1);
        const amount = Math.min(shield.amount, damage*shieldFactor);
        shield.amount -= amount;
        damage -= amount/shieldFactor;
        absorbed += amount;
        if(key==="cinder")cinderShieldAbsorbed(world,amount,cinderHooks);else genericShieldAbsorbed+=amount;
        if(Number.isFinite(shield.until))temporaryAbsorbed+=amount;
        shield.absorbed = (shield.absorbed ?? 0) + amount;
        if(attack.reflection)shield.reflectedAbsorbed=(shield.reflectedAbsorbed??0)+amount;
        if(key==="terraSeismic"&&amount>0)terraFx(world,shield.amount>0?"shieldHit":"shieldEnd",world.playerX,world.playerY,78,.35);
        if(key.startsWith("equipment:"))equipmentMetric(state,Number(key.slice(10)),"shieldAbsorbed",amount);
        if (shield.amount <= 0) {
          finishAbsorbShield(state, shield);
        }
        recordCoreMetric(state, shield.coreRow ?? ({reactive:76,skill:81,reserve:99,overheal:104} as Record<string,number>)[key], "shieldAbsorbed", amount);
        if(Number.isFinite(shield.until))recordCoreMetric(state,200,"shieldAbsorbed",amount);
        if(shield.returned)recordCoreMetric(state,204,"shieldAbsorbed",amount);
    }
    const terraAbsorbed=terraAbsorb(world,damage,attack.sourceEnemyId,!!attack.reflection);damage-=terraAbsorbed;absorbed+=terraAbsorbed;temporaryAbsorbed+=terraAbsorbed;
    if(hasCore(state,204)&&!attack.reflection){const prevented=armorPrevented+titanPrevented+temporaryAbsorbed;c.stacks.armorMeter=(c.stacks.armorMeter??0)+prevented;recordCoreMetric(state,204,"prevented",prevented);const threshold=stats.maxHp*.25;if(c.stacks.armorMeter>=threshold){c.stacks.armorMeter-=threshold;recordCoreMetric(state,204,"procs",1);expansionHooks.area(world,world.playerX,world.playerY,150,stats.firepower*2.5,204);const gained=Math.min(stats.maxResource-state.currentResource,stats.maxResource*.05);state.currentResource+=gained;recordCoreMetric(state,204,"resource",gained);}}
    settleExpansionShields(world, expansionHooks);
    if(!attack.trueDamage)damage = deferExpansionDamage(world, damage,attack.sourceEnemyId,!!attack.reflection);
    if(hasCore(state,205)){
        const withoutBudget=incomingBudget/1.25,withoutShield=Math.min(shieldCapacity,withoutBudget);
        const withoutHp=Math.max(0,withoutBudget-withoutShield)*(hasCore(state,197)?.65:1);
        recordCoreMetric(state,205,"extraDamage",absorbed+Math.min(state.currentHp,damage)-withoutShield-Math.min(state.currentHp,withoutHp));
    }
    if ((state.activeEffects.armor_shield ?? 0) > 0 || genericShieldAbsorbed > 0) {
        const source=world.enemies.find(e=>e.id===attack.sourceEnemyId);
        const dx=(contact?.x ?? attack.previousX ?? attack.x ?? source?.x ?? world.playerX)-world.playerX;
        const dy=(contact?.y ?? attack.previousY ?? attack.y ?? source?.y ?? world.playerY-1)-world.playerY;
        const titan=state.aircraftId==="breaker" && (state.activeEffects.armor_shield??0)>0;
        const rx=(titan?38:30)*playerAirframeScale(state),ry=(titan?38:30)*playerAirframeScale(state),denom=Math.hypot(dx/rx,dy/ry);
        const localX=denom>.0001?dx/denom:0,localY=denom>.0001?dy/denom:-ry;
        emitVisual(world,{kind:"shield_ripple",x:world.playerX+localX,y:world.playerY+localY,fromX:localX,fromY:localY,attachedToPlayer:true,size:18});
    }
    if(damage+absorbed>0){
      c.lastDamage=c.time;
      if(hazardGuard&&coreCooldownReady(state,"hazardGuard")){const sh=createAbsorbShield(state,"hazardGuard",stats.maxHp*.05,3);sh.coreRow=110;deferCoreCooldown(state,"hazardGuard");recordCoreMetric(state,110,"shieldCreated",sh.amount);}
    }
    if (damage <= 0) {
        if(absorbed>0&&!attack.reflection)dispatchCoreEvent("damageTaken",coreContext(world,{damage:0}));
        terraIncomingHp(world,0,!!attack.reflection);
        if(damageOwner?.duel)damageOwner.duel.damageDealt += absorbed;
        if(absorbed>0)equipmentOnDamage(world,equipmentHooks,0,absorbed);
        if (absorbed > 0)
            emitVisual(world, { kind: "damage_number", x: world.playerX, y: world.playerY, size: 36, hpDamage: 0, shieldAbsorbed: absorbed, genericShieldAbsorbed, target: "player", critical: false });
        return { damage: 0, absorbed };
    }
    const hpBeforeResolution = state.currentHp;
    let survived = false;
    if (damage >= state.currentHp && hasCore(state, 90) && !c.consumed.has(coreId(90))) {
        c.consumed.add(coreId(90));
        damage = Math.max(0, state.currentHp - 1);
        state.currentHp = Math.min(state.currentHp,1);
        survived = true;
        world.playerInvulnerability = 3;
        c.timers.deathRefusalInvulnerability=c.time+3;c.timers.deathRefusalHeal=c.time+3;c.timers.deathRefusalDamage=c.time+8;
        
        recordCoreMetric(state, 90, "procs", 1);
        setMessage(world, "TỪ CHỐI TỬ THẦN · ĐÃ KÍCH HOẠT", 2);
    }
    else {
        damage = Math.min(state.currentHp, damage);
        state.currentHp = Math.max(0, state.currentHp - damage);
    }
    terraIncomingHp(world,survived?Math.max(0,hpBeforeResolution-1):damage,!!attack.reflection);
    sylvaIncomingHp(world,survived?Math.max(0,hpBeforeResolution-1):damage);
    if(damageOwner?.duel)damageOwner.duel.damageDealt += (survived ? Math.max(0,hpBeforeResolution-1) : damage) + absorbed;
    if(damage+absorbed>0)equipmentOnDamage(world,equipmentHooks,damage,damage+absorbed);
    if (damage > 0) expansionHpLoss(world, damage);
    if (damage > 0) { onHostileDamage(world, attack);observeComeback(world); }
    c.lastDamage = c.time;
    if(!attack.reflection)dispatchCoreEvent("damageTaken", coreContext(world, { damage }));
    emitVisual(world, { kind: "damage_number", x: world.playerX, y: world.playerY, size: 36, hpDamage: damage, shieldAbsorbed: absorbed, genericShieldAbsorbed, target: "player", critical: false });
    if (damage > 0) emitVisual(world, { kind: "player_hit", x: contact?.x ?? (Number.isFinite(attack.x) ? attack.x! : world.playerX), y: contact?.y ?? (Number.isFinite(attack.y) ? attack.y! : world.playerY), size: 36, directContact:!!contact });
    world.damageTaken += damage;
    world.hitsReceived++;
    world.comboKills = 0;
    world.comboTimer = 0;
    if (!survived && !attack.aircraftDelivery) {
        world.playerInvulnerability = AIR_COMBAT_WORLD.playerInvulnerabilitySeconds;
        world.playerDamageGraceUntil = world.elapsed + AIR_COMBAT_WORLD.playerInvulnerabilitySeconds;
    }
    if(!contact && !(state.aircraftId==="breaker" && (state.activeEffects.armor_shield??0)>0)) addParticles(world, contact?.x??world.playerX, contact?.y??world.playerY, "#fb7185", 13);
    if (state.currentHp <= 0 && !world.duel) latchAircraftDestruction(world);
    world.duel?.onResolution?.(survived ? Math.max(0,hpBeforeResolution-1) : damage);
    return { damage: survived ? Math.max(0,hpBeforeResolution-1) : damage, absorbed };
}
function hitDrone(world: CombatWorld, rawDamage: number): void {
    if (!droneCombatActive(world) || world.droneInvulnerability > 0)
        return;
    world.droneHp = Math.max(0, world.droneHp - calculateDamage(rawDamage, world.droneArmor));
    world.droneInvulnerability = .3;
    emitVisual(world, { kind: "drone_hit", x: world.droneX, y: world.droneY, size: 32 });
    addParticles(world, world.droneX, world.droneY, "#c4b5fd", 5);
    if (world.droneHp <= 0) {
        emitVisual(world,{kind:"explosion",x:world.droneX,y:world.droneY,size:55});
        emitVisual(world,{kind:"emp_pulse",x:world.droneX,y:world.droneY,size:45});
        addParticles(world,world.droneX,world.droneY,"#ddd6fe",14);
        endAircraftSkill(world.aircraft, "escort_drone");
        setMessage(world, "HAWKEYE BỊ PHÁ HỦY", 1.5);
    }
}
const projectileHitPool:{enemy:EnemyEntity;x:number;y:number;t:number;zone?:AirframeHitZone}[]=[],projectileHits:typeof projectileHitPool=[];
function updateProjectileCollisions(world: CombatWorld): void {
    // New child projectiles are visited next tick, never recursively in their birth tick.
    for (let i = world.projectiles.length - 1; i >= 0; i--) {
        const p = world.projectiles[i];
        if (!p || world.ended || (world.duel && !world.duel.combatEnabled))
            break;
        if (p.projectileKind !== "bullet" && p.missileState !== "powered" && !p.bigBang)
            continue;
        const touches = (x: number, y: number, radius: number) => p.bigBang && p.missileState!=="powered" ? circleHit(p.x,p.y,p.radius,x,y,radius) : segmentDistance(x, y, p.previousX, p.previousY, p.x, p.y) <= p.radius + radius;
        if (p.owner === "enemy" && p.allegiance!=="friendly_hacked") {
            if (isHostileBallisticProjectile(p) && satellitePositions(world).some(pos => touches(pos.x, pos.y, 8))) {
                recordCoreMetric(world.aircraft,198,"blocked",1);
                world.aircraft.coreState.stacks.satellites--;recordCoreMetric(world.aircraft,198,"blocked",1);emitVisual(world,{kind:"absorb",x:p.x,y:p.y,size:20}); recycleProjectile(world,i); continue;
            }
            const ally=world.enemies.find(e=>e.hp>0 && enemyAllegiance(world,e)==="friendly_hacked" && segmentVsAircraft(p.previousX,p.previousY,p.x,p.y,p.radius,getEnemyHitbox(e),projectileContact).hit);
            if(ally){damageEnemyAttack(world,ally,p.rawDamage,p,projectileContact);recycleProjectile(world,i);resolveDeathsAndEffects(world);continue;}
            // Every hostile projectile can be absorbed, regardless of its original target.
            const absorbedBy = isHostileBallisticProjectile(p) ? world.decoys.find(d => d.active && touches(d.x,d.y,d.radius)) : undefined;
            if (absorbedBy) {
                onDecoyAbsorb(world, absorbedBy);
                emitVisual(world, { kind: "absorb", x: p.x, y: p.y, size: 24 });
                recycleProjectile(world, i);
                continue;
            }
            if (droneCombatActive(world) && touches(world.droneX, world.droneY, 10)) {
                hitDrone(world, p.rawDamage*enemyOutputMultiplier(world,p.sourceEnemyId));
                recycleProjectile(world, i);
                continue;
            }
            if(p.mirrorBorrowed)continue;
            if (!equipmentUntargetable(world.aircraft) && segmentVsAircraft(p.previousX,p.previousY,p.x,p.y,p.radius,getPlayerHitbox(world),projectileContact).hit) {
                if(p.projectileKind==="boss_missile")emitVisual(world,{kind:"missile_impact",x:p.x,y:p.y,size:42,missileFamily:"boss"});
                if (p.mirageVisual && !p.mirrorBorrowed) mirageFx(world, "explosion", p.x, p.y, 24, .4);
                p.playerContact=true;
                if (!p.stormbreakerGrace || (p.stormbreakerGrace.get(-1) ?? -Infinity) + .3 <= world.elapsed) {
                    p.stormbreakerGrace?.set(-1, world.elapsed);
                    hitPlayer(world, p.rawDamage, "projectile", p, projectileContact);
                }
                recycleProjectile(world, i);
            }
            if(world.projectiles[i]===p && hasCore(world.aircraft,107) && ordinaryHostileBullet(p) && !p.playerContact && segmentVsAircraft(p.previousX,p.previousY,p.x,p.y,p.radius+8,getPlayerHitbox(world),projectileContact).hit)p.grazeCandidate=true;
            continue;
        }
        let consumed = false;
        // Sort along this segment to give piercing hits an unambiguous near-to-far order.
        projectileHits.length=0;
        for(const e of world.enemies) {
            if(!isHostileToPlayer(world,e) || p.hitIds.includes(e.id) || (p.skillId==="predator_lock"&&p.targetId!==null&&p.targetId!==e.id))continue;
            const hit=segmentVsAircraft(p.bigBang&&p.missileState!=="powered"?p.x:p.previousX,p.bigBang&&p.missileState!=="powered"?p.y:p.previousY,p.x,p.y,p.radius,getEnemyHitbox(e),projectileContact);
            if(hit.hit){const slot=projectileHitPool[projectileHits.length]??(projectileHitPool[projectileHits.length]={enemy:e,x:0,y:0,t:0});slot.enemy=e;slot.x=hit.x;slot.y=hit.y;slot.t=hit.t;slot.zone=hit.zone;projectileHits.push(slot);}
        }
        projectileHits.sort((a,b)=>a.t-b.t || a.enemy.id-b.enemy.id);
        for (const contact of projectileHits) {
            const enemy=contact.enemy;

            if(p.skillId==="missile_swarm")emitVisual(world,{kind:"ultimate_effect",ultimateEffect:"ultimateViperImpact",x:contact.x,y:contact.y,size:skillRank(world.aircraft,"missile_swarm")>=3?60:42});
            else if (p.projectileKind === "missile") emitVisual(world, { kind:"missile_impact", x:contact.x, y:contact.y, size:32, missileFamily:"tomahawk" });
            p.hitIds.push(enemy.id);
            if(p.duelGraze && p.duelGraze.defender===enemy.aircraftTarget?.world)p.duelGraze.contact=true;

            if (mirageShieldBlocks(world, enemy, p)) { recycleProjectile(world, i); break; }
            const shieldBefore=enemy.shield;
            // Evaluate HP immediately before EACH pierced hit; never alter the shot baseline.
            const deathLance=!!p.astraLance && enemy.hp>0 && enemy.hp/enemy.maxHp<.30 && (skillRank(world.aircraft, "stellar_lance") >= 4);
            const aim=p.aimBonus;
            const raw=(p.corePierce?p.initialDamage*([1.2,.7,.5][p.hitIds.length-1]??.3):p.stabilizedPierce?p.initialDamage:p.rawDamage)*(deathLance?1.4:1)*(aim?1.2:1);
            const bonuses:[number,number][]|undefined=deathLance?[...(p.telemetryBonuses??[]),[159,1-1/1.4]]:p.telemetryBonuses;
            if(deathLance)recordCoreMetric(world.aircraft,159,"procs",1);
            if(p.telemetryCore===106){if(p.volleyTargets?.has(enemy.id))continue;p.volleyTargets?.add(enemy.id);}
            const dealt=p.allegiance==="friendly_hacked"?damageEnemyAttack(world,enemy,p.rawDamage,p,contact):applyDamageToEnemy(world, enemy, raw, p.color, p.source, p.skillId, p.volleyHits, contact, "direct_projectile", true, true, p.telemetryCore, p.stabilizedPierce&&!p.corePierce?p.rawDamage/Math.max(Number.EPSILON,p.initialDamage):1, bonuses, p.expansionCast, p.primaryShot, p.procFree, p.echoScale, undefined, undefined, p.weaponFraction===undefined?undefined:p.weaponFraction/(aim?1.2:1), !!p.sylvaAcidRound);
            if(p.salvoId&&(dealt>0||enemy.shield<shieldBefore)){
                const salvo=world.skillCores.salvos.find(s=>s.id===p.salvoId);if(salvo)salvo.data=Math.min(V.dataLimit,salvo.data+1);
            }
            if(dealt>0||enemy.shield<shieldBefore)rankProjectileHit(world,p,enemy,rankHooks);
            if((dealt>0 || enemy.shield<shieldBefore) && p.projectileKind==="bullet" && !p.astraLance)emitVisual(world,{kind:"bullet_impact",basicImpact:p.source==="basic" && dealt>0,tint:dealt>0?p.color:"#c9f3ff",x:contact.x,y:contact.y,size:enemy.type==="boss"||isElite(enemy.type)?16:enemy.type==="scout"||enemy.type==="kamikaze"?10:12});
            if(!enemy.aircraftTarget&&enemy.shield<shieldBefore)emitVisual(world,{kind:"shield_ripple",x:contact.x,y:contact.y,size:23});
            if(p.extraPierceOrdinal===p.hitIds.length){recordCoreMetric(world.aircraft,206,"extraPierce",1);recordCoreMetric(world.aircraft,206,"extraPierceDamage",dealt+shieldBefore-enemy.shield);}
            for(const row of p.telemetryExtraCores??[])recordCoreMetric(world.aircraft,row,"damage",dealt);
            if(!p.astraLance&&p.hitIds.length>1&&p.rawDamage<p.initialDamage){
                if(p.stabilizedPierce&&p.hitIds.length<=3){const second=p.hitIds.length===3;recordCoreMetric(world.aircraft,139,second?"pierceTwo":"pierceOne",1);recordCoreMetric(world.aircraft,139,second?"pierceTwoDamage":"pierceOneDamage",dealt);}
                else {recordCoreMetric(world.aircraft,89,"hits",1);recordCoreMetric(world.aircraft,89,"damage",dealt);}
            }
            if(p.skillId==="orbit_reversal"){astraMetric(world,"orbit.hits");astraMetric(world,"orbit.damage",dealt);}
            if(p.astraLance){
                emitVisual(world,{kind:"astra_lance_impact",skillId:"stellar_lance",x:contact.x,y:contact.y,size:enemy.type==="boss"||isElite(enemy.type)?28:23});
                astraMetric(world,`lance.${p.hitIds.length===1?"firstHits":"penetratedHits"}`);astraMetric(world,"lance.damage",dealt);
                p.rawDamage=p.astraLance.later;p.telemetryBonuses=(skillRank(world.aircraft, "stellar_lance") >= 3)?[[157,1-4/(4+.5*(skillRank(world.aircraft,"stellar_lance")-1))]]:undefined;continue;
            }
            if(!p.procFree&&p.skillId!=="predator_lock")applySecondaryHits(world, p, enemy);
            if (p.penetrationRemaining > 0) {
                p.penetrationRemaining--;
                const coreFractions=p.corePierce?[.7,.5,.3]:[.7,.5,.3];
                const fractions=p.corePierce?coreFractions:p.stabilizedPierce?[.75,.45,...coreFractions]:coreFractions;
                const fraction = p.twinSide!==undefined ? .6 : fractions[p.hitIds.length-1] ?? coreFractions[2];
                p.rawDamage = p.initialDamage * fraction;
            }
            else {
                consumed = true;
                break;
            }
        }
        if (consumed)
            recycleProjectile(world, i);
        else if(p.mainBasicMiss&&(p.x+p.radius<0||p.x-p.radius>AIR_COMBAT_WORLD.width||p.y+p.radius<GAMEPLAY_SAFE_RECT.top||p.y-p.radius>AIR_COMBAT_WORLD.height)){
            recycleProjectile(world,i);
        }
        resolveDeathsAndEffects(world);
    }
}
function updateEnemyPlayerCollisions(world: CombatWorld): void {
    if (world.waveState !== "combat")
        return;
    for (const enemy of world.enemies) {
        if (enemy.aircraftTarget || enemy.mirage?.dash) continue;
        if (world.stormbreaker && (isStormObjective(enemy.type) || (enemy.stormbreaker?.bodyUntil ?? 0) > world.elapsed)) continue;
        if ((enemy.type === "micro_drone" && (enemy.magnetic?.clock ?? 0) < (enemy.magnetic?.diveAt ?? 2.8)) || (enemy.type === "satellite" && (enemy.magnetic?.clock ?? 0) < 1.4)) continue;
        if(enemy.hp>0&&enemy.type==="kamikaze"&&enemy.kamikazeState==="dash"&&enemyAllegiance(world,enemy)==="friendly_hacked")updateKamikaze(world,enemy,0);
        if(enemy.hp>0&&enemy.type!=="kamikaze") {
            const allegiance=enemy.dashAllegiance??enemy.magnetic?.elite?.allegiance??enemyAllegiance(world,enemy);
            for(const target of world.enemies)if(canAttackEnemy(world,allegiance,target,enemy.id)&&aircraftVsAircraft(getEnemyHitbox(enemy),getEnemyHitbox(target))&&(enemy.bodyHitAt?.[target.id]??0)<=world.elapsed){
                (enemy.bodyHitAt??={})[target.id]=world.elapsed+.62;
                damageEnemyAttack(world,target,stageEnemyConfig(enemy.type,world.stageId).collisionDamage*enemy.damageScale,{allegiance,sourceEnemyId:enemy.id,sourceEnemyType:enemy.type,delivery:"aircraft_collision"});
            }
            if(allegiance==="friendly_hacked")continue;
        }
        if (!isHostileToPlayer(world,enemy) && enemy.dashAllegiance!=="hostile" && enemy.magnetic?.elite?.allegiance!=="hostile")
            continue;
        if (world.magnetic && enemy.type === "boss") continue;
        if (enemy.auxiliary && enemy.type === "kamikaze" && enemy.kamikazeState !== "dash") continue;
        if (enemy.type === "kamikaze" && enemy.kamikazeState === "dash") { updateKamikaze(world,enemy,0); continue; }
        if (enemy.dashRemaining>0&&enemy.dashAllegiance==="friendly_hacked")continue;
        if (droneCombatActive(world) && circleVsAircraft(world.droneX,world.droneY,9,getEnemyHitbox(enemy)))
            hitDrone(world, stageEnemyConfig(enemy.type, world.stageId).collisionDamage * enemy.damageScale*enemyOutputMultiplier(world,enemy.id));
        if (!aircraftVsAircraft(getEnemyHitbox(enemy),getPlayerHitbox(world)))
            continue;
        // Share the one-hit dash guard with swept boss motion and pointer movement.
        if (enemy.type === "boss" && enemy.bossAttack?.majorAttack === "dash") {
            if (enemy.dashRemaining > 0 && !enemy.bossAttack.dashHitPlayer) {
                hitPlayer(world, enemy.bossAttack.dashDamage, "collision", { sourceEnemyId: enemy.id, sourceEnemyType: "boss", attackTag: "boss_dash", majorBossAttack: true });
                enemy.bossAttack.dashHitPlayer = true;
            }
        } else
            hitPlayer(world, stageEnemyConfig(enemy.type, world.stageId).collisionDamage * enemy.damageScale, "collision", { sourceEnemyId: enemy.id, sourceEnemyType: enemy.type, attackTag: enemy.type === "kamikaze" ? "kamikaze_dash" : "elite_execution" });
        if (enemy.type === "kamikaze") resolveKamikaze(world, enemy);
    }
    resolveDeathsAndEffects(world);
}
/** The sweep retires live shots only. It never touches a salvo, warning or attack scheduler. */
function sweepBigBangProjectiles(caster: CombatWorld): void {
    const opponents = [...new Set(caster.enemies.flatMap(e=>e.aircraftTarget?[e.aircraftTarget.world]:[]))];
    const worlds = [caster,...opponents];
    const inside = (x:number,y:number,r:number)=>x+r>=GAMEPLAY_SAFE_RECT.left&&x-r<=GAMEPLAY_SAFE_RECT.right&&y+r>=GAMEPLAY_SAFE_RECT.top&&y-r<=GAMEPLAY_SAFE_RECT.bottom;
    const mirrors = [...new Set(worlds.flatMap(w=>[w.duelOpponent,w.mirage?.mirror].filter((m):m is MirrorCombatant=>!!m)))];
    const retire = (w:CombatWorld,p:ProjectileEntity) => {
        // Remove non-owning adapter views before recycling their canonical object.
        for(const mirror of mirrors)for(const mapping of [mirror.incoming,mirror.outgoing])for(const [id,view] of mapping){
            const owner=mapping===mirror.incoming?worlds.find(v=>v!==mirror.context.world):mirror.context.world;
            if(view===p||(owner===w&&id===p.id)){
                for(const host of worlds){const index=host.projectiles.indexOf(view);if(index>=0){view.grazeCandidate=false;view.duelGraze=undefined;recycleProjectile(host,index);}}
                mapping.delete(id);
            }
        }
        const index=w.projectiles.indexOf(p);
        if(index>=0){p.grazeCandidate=false;p.duelGraze=undefined;recycleProjectile(w,index);}
    };
    // Canonical hostile aircraft shots first; borrowed copies are removed with them.
    for(const w of [...opponents,caster])for(const p of [...w.projectiles]){
        if(p.mirrorBorrowed||p.lifetime<=0)continue;
        const hostile=w===caster?p.owner==='enemy'&&p.allegiance!=='player'&&p.allegiance!=='friendly_hacked':p.owner!=='enemy'||p.allegiance==='friendly_hacked';
        // Moving projectile families include Boss missiles and explosive payloads.
        // Placed mines, beams and damage fields live in separate runtime collections.
        if(!hostile || (p.delivery&&p.delivery!=='direct_projectile'&&p.delivery!=='explosive_aoe'))continue;
        const pos=w===caster?p:mirrorPoint(p.x,p.y);
        if(inside(pos.x,pos.y,p.radius))retire(w,p);
    }
    for(const w of opponents)cinderState(w).followups=cinderState(w).followups.filter(p=>{const pos=mirrorPoint(p.x,p.y);return !inside(pos.x,pos.y,2.5);});
}

export function resolveScheduledBigBang(world: CombatWorld): void {
    const cast=world.bigBang;
    if(!cast)return;
    if(world.ended||world.aftermath||world.destruction){world.bigBang=undefined;return;}
    if(cast.resolved){if(world.elapsed>=cast.impactAt+.65)world.bigBang=undefined;return;}
    if(world.elapsed+1e-8<cast.impactAt)return;
    cast.resolved=true;
    // Snapshot the already-launched hostile ordnance before a kill can recycle actors.
    if(cast.rank>=5)sweepBigBangProjectiles(world);
    if(cast.rank>=3)world.skillCores.aftershocks.push({x:cast.x,y:cast.y,at:cast.impactAt+V.aftershockDelay,expansionCast:cast.expansionCast});
    emitVisual(world,{kind:'bomb',x:cast.x,y:cast.y,size:360,skillId:'heavy_bomb'});
    if(world.mirrorContext){const root=world.enemies.find(e=>e.aircraftTarget)?.aircraftTarget?.world;if(root)emitVisual(root,{kind:'bomb',...mirrorPoint(cast.x,cast.y),size:360,skillId:'heavy_bomb'});}
    for(const enemy of world.enemies){
        if(!isHostileToPlayer(world,enemy)||enemy.x+enemy.radius<GAMEPLAY_SAFE_RECT.left||enemy.x-enemy.radius>GAMEPLAY_SAFE_RECT.right||enemy.y+enemy.radius<GAMEPLAY_SAFE_RECT.top||enemy.y-enemy.radius>GAMEPLAY_SAFE_RECT.bottom)continue;
        applyDamageToEnemy(world,enemy,cast.rawDamage,'#fbbf24','skill','heavy_bomb',undefined,undefined,'area_hazard',true,true,undefined,1,[],cast.expansionCast);
        if(cast.rank>=4&&enemy.hp>0)skillEnemyEffects(world,enemy.id).markUntil=cast.impactAt+V.markDuration;
    }
    finishExpansionSkill(world.aircraft,cast.expansionCast);
    startDeferredSkillCooldown(world.aircraft,'heavy_bomb');
}

function fireEliteBarrageVolley(world:CombatWorld,w:WarningZone):void {
    const barrage=w.barrage;
    if(!barrage||barrage.index>=barrage.angles.length)return;
    const angle=barrage.angles[barrage.index++];
    for(let i=0;i<7;i++){
        const a=angle+(i-3)*.14;
        addProjectile(world,{owner:"enemy",enemySpeedClass:"fan",allegiance:w.allegiance,sourceEnemyId:w.sourceEnemyId,sourceEnemyType:w.sourceEnemyType,
            attackTag:w.attackTag,criticalAttack:true,x:w.fromX??w.x,y:w.fromY??w.y,
            vx:Math.cos(a)*180,vy:Math.sin(a)*180,rawDamage:w.rawDamage,radius:4,color:"#fb7185"});
    }
}
function detonateWarning(world: CombatWorld, w: WarningZone): void {
    // Iron Fortress's follow-up shot owns the damage; this is only its telegraph.
    if (w.kind === "elite_lock")
        return;
    const enemy = world.enemies.find(e => e.id === w.enemyId && e.hp > 0);
    if(w.kind==="elite_barrage"&&w.barrage){
        fireEliteBarrageVolley(world,w);
        w.stage="active";w.age=0;w.barrage.next=w.barrage.gap;
        w.remaining=(w.barrage.angles.length-1)*w.barrage.gap+.01;
        return;
    }
    if (w.kind === "retaliation") {
        if (enemy) {
            const safe=Math.floor(world.random()*12);
            for(let i=0;i<12;i++) if(i!==safe && i!==(safe+6)%12) fireEnemyBullet(world,enemy,i*Math.PI/6,155,w.rawDamage,false,"burst",w.allegiance,"fan");
        }
        return;
    }
    if (w.kind === "rail") {
        if (!enemy)
            return;
        const angle = Math.atan2(w.y - (w.fromY ?? enemy.y), w.x - (w.fromX ?? enemy.x));
        addProjectile(world, { owner: "enemy", enemySpeedClass:"special", allegiance:w.allegiance, appearance: "dangerous", criticalAttack: true, x: w.fromX ?? enemy.x, y: w.fromY ?? enemy.y,
            vx: Math.cos(angle) * 650, vy: Math.sin(angle) * 650, rawDamage: w.rawDamage, radius: 4, sourceEnemyId: enemy.id, sourceEnemyType: enemy.type, attackTag: "rail" });
        return;
    }
    if (w.kind === "dash") {
        if (!enemy)
            return;
        enemy.dashAllegiance=w.allegiance;enemy.hitResolved=false;
        enemy.dashRemaining = .65;
        enemy.dashStartX = enemy.x;
        enemy.dashStartY = enemy.y;
        enemy.dashEndX = w.x;
        enemy.dashEndY = w.y;
        if (enemy.bossAttack) {
            enemy.bossAttack.dashDamage = w.rawDamage;
            enemy.bossAttack.dashHitPlayer = false;
        }
        return;
    }
    if (w.kind === "acid" || w.kind === "sonic" || w.kind === "lane_laser") {
        w.stage = "active";
        w.age = 0;
        w.tick = 1;
        w.ticksRemaining = 3;
        w.remaining = w.kind === "acid" ? 3 : w.kind === "sonic" ? SONIC_ACTIVE_SECONDS : (w.activeDuration ?? LANE_ACTIVE_SECONDS);
        w.hitPlayer = false;
        return;
    }
    emitVisual(world, { kind: w.kind==="emp"||w.kind==="shock_clamp"?"emp_pulse":"bomb", x: w.x, y: w.y, size: w.radius * 2 });
    addParticles(world, w.x, w.y, "#ef4444", 14);
    for(const e of world.enemies)if(canAttackEnemy(world,w.allegiance??"hostile",e,w.sourceEnemyId)&&circleVsAircraft(w.x,w.y,w.radius,getEnemyHitbox(e)))damageEnemyAttack(world,e,w.rawDamage,w);
    if (w.allegiance!=="friendly_hacked" && circleVsAircraft(w.x,w.y,w.radius,getPlayerHitbox(world)))
        hitPlayer(world, w.rawDamage, "hazard", w);
    if (w.allegiance!=="friendly_hacked" && droneCombatActive(world) && Math.hypot(world.droneX - w.x, world.droneY - w.y) <= w.radius + 10)
        hitDrone(world, w.rawDamage*enemyOutputMultiplier(world,w.sourceEnemyId));
}
function hitBossWarningEnemies(world:CombatWorld,w:WarningZone,previousRadius=w.ringRadius??0):void {
    const hits=w.victimTimers??=new Map<number,number>();
    for(const e of world.enemies)if(canAttackEnemy(world,w.allegiance??"hostile",e,w.sourceEnemyId)&&!hits.has(e.id)){
        const h=getEnemyHitbox(e);
        const touches=w.kind==="sonic"?!aircraftInsideWedge(h,w.x,w.y,w.safeAngle??Math.PI/2,w.safeArc??0)&&ringVsAircraft(w.x,w.y,Math.max(0,previousRadius-SONIC_RING_THICKNESS/2),(w.ringRadius??0)+SONIC_RING_THICKNESS/2,h):rectVsAircraft(w.x-(w.laneWidth??0)/2,GAMEPLAY_SAFE_RECT.top,w.x+(w.laneWidth??0)/2,GAMEPLAY_SAFE_RECT.bottom,h);
        if(touches){hits.set(e.id,1);damageEnemyAttack(world,e,w.rawDamage,w);}
    }
}
function hitBossWarningPlayer(world: CombatWorld, w: WarningZone, previousRadius = w.ringRadius ?? 0): void {
    if (w.stage !== "active" || w.hitPlayer) return;
    if (w.kind === "sonic") {
        const h=getPlayerHitbox(world);
        if(aircraftInsideWedge(h,w.x,w.y,w.safeAngle??Math.PI/2,w.safeArc??0))return;
        if(!ringVsAircraft(w.x,w.y,Math.max(0,previousRadius-SONIC_RING_THICKNESS/2),(w.ringRadius??0)+SONIC_RING_THICKNESS/2,h))return;
    } else if (w.kind === "lane_laser") {
        if(!rectVsAircraft(w.x-(w.laneWidth??0)/2,GAMEPLAY_SAFE_RECT.top,w.x+(w.laneWidth??0)/2,GAMEPLAY_SAFE_RECT.bottom,getPlayerHitbox(world)))return;
    } else return;
    hitPlayer(world, w.rawDamage, "hazard", w);
    w.hitPlayer = true;
}
function updateWarnings(world: CombatWorld, dt: number): void {
    for (let i = world.warnings.length - 1; i >= 0; i--) {
        const w = world.warnings[i];
        if ((w.kind === "sonic" || w.kind === "lane_laser" || w.kind === "dash") && !world.enemies.some(e => e.id === w.enemyId && e.hp > 0)) {
            world.warnings.splice(i, 1);
            continue;
        }
        if (w.kind === "elite_lock") {
            const enemy = world.enemies.find(e => e.id === w.enemyId && e.hp > 0);
            if (!enemy) { world.warnings.splice(i, 1); continue; }
            w.x = enemy.x;
            w.y = enemy.y;
        }
        if(w.allegiance==="friendly_hacked" && w.stage!=="active" && !world.enemies.some(e=>isHostileToPlayer(world,e)))continue;
        // A stun holds an unfinished targeted telegraph; it never discards BigBang's stun.
        if (w.enemyId && world.enemies.some(e => e.id === w.enemyId && e.stun > 0))
            continue;
        w.remaining -= dt;
        if (w.stage === "active") {
            w.age = (w.age || 0) + dt;
            if(w.kind==="elite_barrage"&&w.barrage){
                w.barrage.next-=dt;
                while(w.barrage.next<=0&&w.barrage.index<w.barrage.angles.length){fireEliteBarrageVolley(world,w);w.barrage.next+=w.barrage.gap;}
            }
            else if (w.kind === "acid") {
                const inside = w.allegiance!=="friendly_hacked" && circleVsAircraft(w.x,w.y,w.radius,getPlayerHitbox(world));
                if (!inside) w.insideTimer = undefined;
                else {
                    w.insideTimer = (w.insideTimer ?? .25) - dt;
                    if (w.insideTimer <= 1e-8) { w.insideTimer += 1; hitPlayer(world, w.rawDamage, "hazard", {...w,damageOverTime:true}); }
                }
                const droneInside = w.allegiance!=="friendly_hacked" && droneCombatActive(world) && Math.hypot(world.droneX-w.x, world.droneY-w.y) <= w.radius+10;
                if (!droneInside) w.droneInsideTimer = undefined;
                else {
                    w.droneInsideTimer = (w.droneInsideTimer ?? .25) - dt;
                    if (w.droneInsideTimer <= 1e-8) { w.droneInsideTimer += 1; hitDrone(world, w.rawDamage*enemyOutputMultiplier(world,w.sourceEnemyId)); }
                }
            }
            else if (w.kind === "sonic") {
                const speed = w.ringSpeed ?? SONIC_RING_SPEED;
                const radius = w.age * speed, previous = Math.max(0, radius - dt * speed);
                w.ringRadius = radius;
                hitBossWarningEnemies(world,w,previous);
                hitBossWarningPlayer(world, w, previous);
            }
            else if (w.kind === "lane_laser") {hitBossWarningEnemies(world,w);hitBossWarningPlayer(world, w);}
            if (w.remaining <= 0)
                world.warnings.splice(i, 1);
        }
        else if (w.remaining <= 0) {
            detonateWarning(world, w);
            if (w.stage !== "active")
                world.warnings.splice(i, 1);
        }
    }
}
function updateLaser(world: CombatWorld, dt: number): void {
    if(world.laserCharge>0||world.laserTicksRemaining>0)world.aircraft.activeEffects.focus_laser=Math.max(.001,world.laserCharge+world.laserRemaining);
    if (world.laserCharge > 0) {
        world.laserCharge = Math.max(0, world.laserCharge - dt);
        world.aircraft.laserPhase=world.laserCharge>0?"charge":"firing";
        return;
    }
    if (world.laserTicksRemaining <= 0) {
        world.laserRemaining = 0;
        endAircraftSkill(world.aircraft,"focus_laser");
        return;
    }
    world.laserRemaining = Math.max(0, world.laserRemaining - dt);
    world.laserTickCooldown -= dt;
    while (world.laserTickCooldown <= 1e-8 && world.laserTicksRemaining > 0) {
        world.laserTickCooldown += B.laserTick;
        world.laserTicksRemaining--;
        const extended=(skillRank(world.aircraft, "focus_laser") >= 3)&&world.laserTicksRemaining<Math.round((getSkillRuntimeValues(world.aircraft,"focus_laser").duration-(SKILL_CONFIGS.focus_laser.duration??0))/B.laserTick);
        if(extended)recordCoreMetric(world.aircraft,40,"shots",1);
        const raw = getEffectiveAircraftStats(world.aircraft).firepower * getSkillRuntimeValues(world.aircraft, "focus_laser").damageMultiplier;
        const beam = phantomLaserBounds(world.playerX, world.playerY);
        for (const enemy of world.enemies)
            if (isHostileToPlayer(world,enemy) && rectVsAircraft(beam.left,beam.top,beam.right,beam.bottom,getEnemyHitbox(enemy))) {
                const dealt=applyDamageToEnemy(world, enemy, raw, "#c4b5fd", "skill", "focus_laser", undefined, undefined, enemy.aircraftTarget ? "beam" : "area_hazard");
                if(extended)recordCoreMetric(world.aircraft,40,"damage",dealt);
                if(enemy.hp>0 && (skillRank(world.aircraft, "focus_laser") >= 4)){const fx=skillEnemyEffects(world,enemy.id);if((fx.armorUntil??0)<=world.elapsed)recordCoreMetric(world.aircraft,144,"targets",1);fx.armorUntil=world.elapsed+V.laserArmorDuration;}
                // Enemy-class execution thresholds have no aircraft equivalent in a duel.
                if(!enemy.aircraftTarget && enemy.hp>0 && (skillRank(world.aircraft, "focus_laser") >= 5) && enemy.hp<=enemy.maxHp*(enemy.type === "boss" ? V.executeBossThreshold : isElite(enemy.type) ? V.executeEliteThreshold : V.executeThreshold)){
                    const executionDamage=enemy.hp*guardianMultiplier(world,enemy);
                    world.damageDealt+=executionDamage; recordDpsDamage(world,executionDamage);
                    if (executionDamage >= enemy.hp) enemy.expansionKillingHit = {primary:false,basic:false,skill:true,direct:false,critical:false,elite:isElite(enemy.type)};
                    recordCoreMetric(world.aircraft,143,"executes",1);
                    emitVisual(world,{kind:"damage_number",x:enemy.x,y:enemy.y,size:enemy.radius,hpDamage:executionDamage,shieldAbsorbed:0,target:"enemy",critical:false,entityId:enemy.id});
                    enemy.hp=Math.max(0,enemy.hp-executionDamage);
                }
            }
    }
    if (world.laserTicksRemaining === 0){
        world.laserRemaining = 0;endAircraftSkill(world.aircraft,"focus_laser");
    }
    resolveDeathsAndEffects(world);
}
function updateProjectiles(world: CombatWorld, dt: number): void {
    for (let i = world.projectiles.length - 1; i >= 0; i--) {
        const p = world.projectiles[i];
        if(p.mirrorBorrowed)continue;
        const motionDt = Math.min(dt,p.firedAt===undefined?dt:Math.max(0,world.elapsed-p.firedAt)) * (p.mirrorSlow ?? 1) * slowExpansionProjectile(world, p) * rankProjectileSpeed(world,p,rankHooks);
        if (p.lifetime <= 0) { recycleProjectile(world, i); continue; }
        p.previousX = p.x;
        p.previousY = p.y;
        updateStormbreakerProjectile(world, p, stormbreakerHooks);
        if (updateMirageProjectile(world,p,dt,motionDt)) { if(p.lifetime<=0)recycleProjectile(world,i); continue; }
        if (p.lifetime <= 0) { recycleProjectile(world, i); continue; }
        if (updateMagneticProjectile(world, p, motionDt, magneticHooks)) { if (p.lifetime <= 0) recycleProjectile(world, i); continue; }
        if (p.projectileKind === "boss_missile") {
            if (!updateBossMissile(world, p, dt, motionDt/dt)) recycleProjectile(world, i);
            continue;
        }
        if (p.projectileKind !== "bullet") {
            if (!updateMissile(world, p, dt, motionDt/dt)) recycleProjectile(world, i);
            continue;
        }
        p.lifetime -= dt;
        if (p.lifetime <= 0) {
            recycleProjectile(world, i);
            continue;
        }
        if((p.aimCorrectionUntil??0)>world.elapsed && !p.hitIds.length){
            const target=nearestEnemy(world,p.x,p.y);if(target){const speed=Math.hypot(p.vx,p.vy),angle=Math.atan2(p.vy,p.vx),turn=shortestAngle(Math.atan2(target.y-p.y,target.x-p.x)-angle),next=angle+Math.max(-1.5*dt,Math.min(1.5*dt,turn));p.vx=Math.cos(next)*speed;p.vy=Math.sin(next)*speed;}
        }
        const previousMissileHeading=p.heading;
        if(isImmediateMissile(p))p.missileAge+=dt;
        updateHoming(world, p, dt);
        p.x += p.vx * motionDt;
        p.y += p.vy * motionDt;
        if(isImmediateMissile(p) && p.lifetime>0)addMissileSmoke(world,p,previousMissileHeading);
        if (p.corridorEdge !== undefined && p.corridorSide !== undefined) {
            const boundary=p.corridorEdge+p.corridorSide*p.radius;
            if((p.x-boundary)*p.corridorSide<0) {
                p.x=boundary+(boundary-p.x); p.vx=p.corridorSide*Math.min(30,Math.abs(p.vx)*.25);
            }
        }
        const outside = p.x < -20 || p.x > 380 || p.y < GAMEPLAY_SAFE_RECT.top - 20 || p.y > 660;
        if (p.allowOffscreenEntry) {
            if (!outside) p.allowOffscreenEntry=false;
            else if (p.x>=-180 && p.x<=540 && p.y>=GAMEPLAY_SAFE_RECT.top-180 && p.y<=820
                && (p.x>=-20 || p.vx>0) && (p.x<=380 || p.vx<0)
                && (p.y>=GAMEPLAY_SAFE_RECT.top-20 || p.vy>0) && (p.y<=660 || p.vy<0)) continue;
        }
        if (outside && p.homing && p.owner !== "enemy") {
            const point = clampCircleToGameplayRect(p.x, p.y, p.radius);
            p.x = point.x;
            p.y = point.y;
            if (p.x <= GAMEPLAY_SAFE_RECT.left + p.radius || p.x >= GAMEPLAY_SAFE_RECT.right - p.radius)
                p.vx = -p.vx;
            if (p.y <= GAMEPLAY_SAFE_RECT.top + p.radius || p.y >= GAMEPLAY_SAFE_RECT.bottom - p.radius)
                p.vy = -p.vy;
        }
        else if (outside){
            if(p.astraLance && p.vy<0 && p.y<GAMEPLAY_SAFE_RECT.top-20 && p.x>=-20 && p.x<=380)exitStellarLance(world,p);
            // Primary shots settle their last swept contact before counting a miss.
            if(p.mainBasicMiss)continue;
            recycleProjectile(world, i);
        }
    }
    resolveDeathsAndEffects(world);
}
function updateDecoys(world: CombatWorld, dt: number): void {
    const state=world.aircraft,c=state.coreState;
    if(c.stacks.cloneEndPending){
        delete c.stacks.cloneEndPending;
        for(const d of world.decoys)if(d.clone&&!d.clonePhase&&d.castId===world.skillCores.invisibilityCastId){
            if((skillRank(state, "invisibility") >= 4)){d.clonePhase="linger";d.remaining=V.cloneLinger+dt;d.life=V.cloneLinger;}
        }
    }
    for (let i = world.decoys.length - 1; i >= 0; i--) {
        const d = world.decoys[i];
        if(d.clonePhase==="dash"){
            const target=world.enemies.find(e=>e.id===d.dashTarget&&isHostileToPlayer(world,e)&&canTargetEnemy(world,e));
            if(target){const dx=target.x-d.x,dy=target.y-d.y,distance=Math.hypot(dx,dy),step=Math.min(distance,620*dt);if(distance>0){d.x+=dx/distance*step;d.y+=dy/distance*step;}if(distance-step<=target.radius||d.remaining<=dt)explodeClone(world,d);}
            else explodeClone(world,d);
        }
        if (!d.active) {
            d.flightAge += dt;
            const t = Math.min(1, d.flightAge / .45), angle = d.side * (.16 + d.lane * .16);
            const distance = 70 + d.lane * 8;
            const endX = d.originX + Math.sin(angle) * distance, endY = d.originY - Math.cos(angle) * distance;
            const controlX = d.originX + Math.sin(angle * .5) * distance * .35, controlY = d.originY - distance * .7;
            const point = clampCircleToGameplayRect((1-t)*(1-t)*d.originX + 2*(1-t)*t*controlX + t*t*endX,
                (1-t)*(1-t)*d.originY + 2*(1-t)*t*controlY + t*t*endY, d.radius);
            d.x = point.x; d.y = point.y;
            if (t >= 1) {
                d.active = true;
                emitVisual(world, { kind: "flare_burst", x: d.x, y: d.y, size: 25 });
                addParticles(world, d.x, d.y, "#ffe5a1", 4);
                for (const p of world.projectiles) if (p.owner === "enemy" && p.homing && p.targetId === PLAYER_TARGET_ID) p.targetId = chooseEnemyTarget(world, true);
            }
        } else {
            if(d.clonePhase==="linger")recordCoreMetric(state,141,"extraTime",Math.min(dt,d.remaining));
            if(!d.clone&&d.remaining<=1)recordCoreMetric(state,19,"extraTime",Math.min(dt,d.remaining));
            d.remaining -= dt;
        }
        if(d.remaining<=0&&d.clonePhase==="linger"){d.clonePhase="dash";d.remaining=1;d.dashTarget=nearestEnemy(world,d.x,d.y)?.id??null;}
        if (d.remaining <= 0) { world.pools.decoys.push(d); world.decoys.splice(i, 1); }
    }
    if(world.decoyVolleys<=0&&!world.decoys.some(d=>!d.clone)){finishExpansionSkill(state,expansionState(state).casts.decoy);startDeferredSkillCooldown(state,"decoy");}
}
function updatePlayerDash(world: CombatWorld, dt: number): void {
    if (playerStunned(world.aircraft) || world.dashRemaining <= 0)
        return;
    const opponent=world.duel?.opponent ?? (world.duelOpponent??world.mirage?.mirror)?.context.world ?? world.enemies.find(e=>e.aircraftTarget)?.aircraftTarget?.world;
    const target=opponent?.enemies.find(e=>e.aircraftTarget?.world===world);
    const movement=(cinderMovementLocked(world)?0:1)*(opponent&&target?Math.min(sylvaMovement(opponent,target),argentMovement(opponent,target),riptideMovement(opponent,target),cinderMovement(opponent,target)):1);
    if(movement===0){world.dashRemaining=0;return;}
    world.dashRemaining = Math.max(0, world.dashRemaining - dt);
    const t = 1 - world.dashRemaining / .16;
    world.playerX = world.dashStartX + (world.dashEndX - world.dashStartX) * t;
    world.playerY = world.dashStartY + (world.dashEndY - world.dashStartY) * t;
    world.aircraft.coreState.lastMove = world.aircraft.coreState.time;
    collectScrap(world);
    addParticles(world, world.playerX, world.playerY, "#c4b5fd", 1);
}
function updateParticles(world: CombatWorld, dt: number): void {
    for (let index = world.particles.length - 1; index >= 0; index--) {
        const particle = world.particles[index];
        particle.life -= dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vx *= 0.96;
        particle.vy *= 0.96;
        if (particle.life <= 0)
            recycleParticle(world, index);
    }
}
/** Revalidate before tick work and immediately at an invisibility cast. */
export function revalidateAircraftTargets(world: CombatWorld): void {
    const legal = (id: number | null | undefined) => world.enemies.find(e => e.id === id && canTargetEnemy(world,e,"hard_lock"));
    const lock = world.rankRuntime?.lock;
    if (lock) {
        const decoy=preferredDuelDecoy(world,lock.decoy);
        if(decoy) { lock.decoy=decoy; lock.target=-2; }
        else if(lock.decoy) {
            const target=nearestEnemy(world,world.playerX,world.playerY,[],true);
            if(target) { lock.decoy=undefined; lock.target=target.id; lock.stacks=0; }
            else { world.rankRuntime!.lock=undefined; endAircraftSkill(world.aircraft,"predator_lock"); }
        } else if(world.enemies.some(e=>e.id===lock.target&&e.aircraftTarget&&!canTargetEnemy(world,e,"hard_lock"))) {
            world.rankRuntime!.lock=undefined; endAircraftSkill(world.aircraft,"predator_lock");
        }
    }
    if (world.droneTargetId !== null && !legal(world.droneTargetId)) world.droneTargetId = null;
    if (world.playerTargetId !== undefined && !legal(world.playerTargetId)) world.playerTargetId = undefined;
    if (world.skillCores.syncTarget !== null && !legal(world.skillCores.syncTarget)) { world.skillCores.syncTarget = null; world.skillCores.syncUntil = 0; }
    const release=releaseState(world.aircraft);
    if (release.mark && !legal(release.mark.target)) { release.mark=undefined; release.markReady=world.elapsed+16; }
    for (const projectile of world.projectiles) if(projectile.homing && !projectile.mirrorBorrowed && projectile.owner !== "enemy") {
        if (projectile.targetId !== null && !legal(projectile.targetId)) {
            const decoy=preferredDuelDecoy(world,projectile.duelDecoy);
            projectile.targetId=null; projectile.duelDecoy=decoy?{world:decoy.world,id:decoy.id}:undefined;
            if(!decoy)projectile.angularVelocity=0;
        }
    }
    for (const meteor of world.astra?.starfall?.pending ?? []) if (!meteor.decoy && !legal(meteor.target)) meteor.frozen = true;
}

export const AIRCRAFT_AFTERMATH_SECONDS = 3;
/** SOLO calls only after same-tick KO arbitration; Campaign calls at the lethal hit. */
export function latchAircraftDestruction(world: CombatWorld): void {
    if (world.destruction || world.aircraft.currentHp > 0) return;
    cancelTerra(world); cancelSylva(world); cancelArgent(world); cancelRiptide(world); cancelCinder(world); world.bigBang=undefined;
    world.playerInputActive = false;
    world.destruction = { at: world.elapsed, x: world.playerX, y: world.playerY };
    if (!world.duel) {
        world.stageVictory = false; world.stageFirstClear = false;
        world.defeatSummary = summarizeCombatWorld(world);
    }
    emitVisual(world,{kind:"aircraft_destroyed",x:world.playerX,y:world.playerY,size:110});
    if (world.mirrorContext) {
        const root = world.enemies.find(e=>e.aircraftTarget)?.aircraftTarget?.world;
        if (root) { const point = mirrorPoint(world.playerX,world.playerY); emitVisual(root,{kind:"aircraft_destroyed",...point,size:110}); }
    }
    world.aircraft.activeEffects = {}; world.aircraft.droneActive = false;
    world.dashRemaining = 0; world.droneTargetId = null;
    world.laserCharge = world.laserRemaining = world.laserTicksRemaining = 0;
    delete world.aircraft.laserPhase;
    if (world.astra) { world.astra.charge = undefined; world.astra.orbit = undefined; world.astra.orbitReleases = []; }
    if (world.rankRuntime) world.rankRuntime.lock = undefined;
    for (const enemy of world.enemies) if (enemy.aircraftTarget) revalidateAircraftTargets(enemy.aircraftTarget.world);
    if (!world.duel) {
        world.aftermath = { remaining: AIRCRAFT_AFTERMATH_SECONDS };
        world.pendingCoreSelections = 0; world.currentCoreChoices = null; world.coreSelectionEvent = null;
        world.pauseReasons.delete("core");
        const mirror = world.mirage?.mirror?.context.world;
        if (mirror) mirror.aftermath = {remaining:AIRCRAFT_AFTERMATH_SECONDS};
        world.pauseReasons.delete("result"); world.ended = false;
    }
}
/** Presentation continuation has no damage, targeting, reward, spawn or progression authority. */
export function updateCombatAftermath(world: CombatWorld, dt: number): void {
    const aftermath = world.aftermath;
    if (!aftermath || dt <= 0) return;
    dt = Math.min(dt, aftermath.remaining);
    aftermath.remaining = Math.max(0, aftermath.remaining - dt);
    world.elapsed += dt; world.scroll = (world.scroll + dt * 52) % 80;
    for (const id of SKILL_IDS) {
        const remaining=world.aircraft.activeEffects[id];
        if(remaining!==undefined)world.aircraft.activeEffects[id]=Math.max(0,remaining-dt);
    }
    world.playerInvulnerability=Math.max(0,world.playerInvulnerability-dt);
    world.droneInvulnerability=Math.max(0,world.droneInvulnerability-dt);
    for (const enemy of world.enemies) if (!enemy.aircraftTarget && enemy.hp > 0) {
        enemy.age += dt; enemy.x += enemy.vx * dt; enemy.y += enemy.vy * dt;
    }
    for (let i = world.projectiles.length - 1; i >= 0; i--) {
        const p = world.projectiles[i];
        if (p.mirrorBorrowed) continue;
        p.targetId = null; p.duelDecoy = undefined; p.homing = false; p.angularVelocity = 0;
        p.previousX = p.x; p.previousY = p.y; p.x += p.vx * dt; p.y += p.vy * dt;
        p.missileAge += dt; p.lifetime -= dt;
        if (p.projectileKind !== "bullet" || isImmediateMissile(p)) addMissileSmoke(world,p,p.heading);
        if (p.lifetime <= 0 || (p.bigBang && p.missileAge >= B.bombFuse)) {
            if (p.projectileKind !== "bullet" || isImmediateMissile(p)) emitVisual(world,{kind:"missile_impact",x:p.x,y:p.y,size:p.bigBang?90:22,missileFamily:p.bigBang?"bigbang":"viper"});
            recycleProjectile(world,i);
        }
    }
    for (let i = world.warnings.length - 1; i >= 0; i--) {
        const warning = world.warnings[i]; warning.remaining -= dt; warning.age = (warning.age ?? 0) + dt;
        if (warning.kind === "sonic") warning.ringRadius = warning.age * (warning.ringSpeed ?? SONIC_RING_SPEED);
        if (warning.remaining <= 0 && warning.stage !== "active" && ["acid","sonic","lane_laser"].includes(warning.kind)) {
            warning.stage="active"; warning.age=0;
            warning.remaining=warning.kind==="acid"?3:warning.kind==="sonic"?SONIC_ACTIVE_SECONDS:warning.activeDuration??LANE_ACTIVE_SECONDS;
        } else if (warning.remaining <= 0) {
            emitVisual(world,{kind:"explosion",x:warning.x,y:warning.y,size:Math.min(100,warning.radius*2)});
            world.warnings.splice(i,1);
        }
    }
    for (const decoy of world.decoys) decoy.remaining = Math.max(0,decoy.remaining-dt);
    world.decoys = world.decoys.filter(decoy=>decoy.remaining>0);
    world.laserCharge = Math.max(0,world.laserCharge-dt); world.laserRemaining = Math.max(0,world.laserRemaining-dt);
    if (world.astra) {
        const astra = world.astra;
        if (astra.starfall) {
            astra.starfall.stopped = true;
            for (let i=astra.starfall.pending.length-1;i>=0;i--) {
                const meteor=astra.starfall.pending[i]; meteor.frozen=true;
                if (meteor.at<=world.elapsed) {
                    const radius=meteor.doom?110:astra.starfall.rank>=2?65:45;
                    astra.impacts.push({id:world.nextId++,x:meteor.x,y:meteor.y,radius,at:world.elapsed,doom:meteor.doom});
                    emitVisual(world,{kind:"astra_starfall_impact",x:meteor.x,y:meteor.y,size:radius*2});
                    astra.starfall.pending.splice(i,1);
                }
            }
        }
        astra.burns=astra.burns.filter(b=>b.until>world.elapsed);
        astra.impacts=astra.impacts.filter(i=>world.elapsed-i.at<1.2);
        astra.charge=undefined; astra.orbit=undefined;
    }
    const rank=world.rankRuntime;
    if(rank) {
        if(rank.anchor && rank.anchor.until<=world.elapsed) {
            emitVisual(world,{kind:"rank_effect",rankEffect:"anchor_collapse",x:rank.anchor.x,y:rank.anchor.y,size:240}); rank.anchor=undefined;
        }
        rank.pulses=[]; // No new offensive emissions after outcome lock.
        for(const wave of rank.waves) { wave.previousRadius=wave.radius; wave.radius+=INTERFERENCE_WAVE_SPEED*dt; }
        rank.waves=rank.waves.filter(w=>w.radius<=w.maxRadius);
    }
    const equipment=equipmentState(world.aircraft);
    for(let i=equipment.meteors.length-1;i>=0;i--) {
        const meteor=equipment.meteors[i];
        if(meteor.at<=world.elapsed) { emitVisual(world,{kind:"explosion",x:meteor.x,y:meteor.y,size:100}); equipment.meteors.splice(i,1); }
    }
    equipment.visuals=equipment.visuals.filter(v=>v.start+v.duration>world.elapsed);
    const release=releaseState(world.aircraft); release.ghosts=release.ghosts.filter(g=>g.until>world.elapsed);
    const mirror = !world.duel ? world.mirage?.mirror?.context.world : undefined;
    if (mirror?.aftermath) updateCombatAftermath(mirror,dt);
    updateParticles(world,dt);
    world.visualEvents = world.visualEvents.filter(event=>(event.at??world.elapsed)>world.elapsed-1).slice(-96);
    if (!world.duel && aftermath.remaining <= 0) { world.ended = true; world.pauseReasons.add("result"); }
}

export function updateCombatWorld(world: CombatWorld, deltaSeconds: number): void {
    if (world.aftermath) {
        if (!world.pauseReasons.size && !world.ended) updateCombatAftermath(world, Math.min(AIR_COMBAT_WORLD.maxDeltaSeconds, Math.max(0, deltaSeconds)));
        return;
    }
    revalidateAircraftTargets(world);
    if (world.ended) { resetMirage(world); return; }
    if (world.pauseReasons.size || world.currentCoreChoices || world.pendingCoreSelections > 0 || deltaSeconds <= 0)
        return;
    const capped = Math.min(AIR_COMBAT_WORLD.maxDeltaSeconds, deltaSeconds);
    const actors=[world,...world.enemies.flatMap(e=>e.aircraftTarget?[e.aircraftTarget.world]:[])];
    const dt=bigBangStep(actors,capped);
    if(dt<capped-1e-8){updateCombatWorld(world,dt);updateCombatWorld(world,capped-dt);return;}
    try {
    if(world.waveState==="combat")advanceWaitingChest(world.aircraft,dt);
    world.elapsed += dt;
    if(!world.initialCoreQueued && world.elapsed>=2){world.initialCoreQueued=true;world.aircraft.pendingMilestones.unshift(1);world.pendingCoreSelections=world.aircraft.pendingMilestones.length;return;}
    world.scroll = (world.scroll + dt * 52) % 80;
    if (world.latestMessage && world.elapsed >= world.messageUntil)
        world.latestMessage = null;
    refreshBreathingRoom(world, expansionHooks);
    tickAircraftState(world.aircraft, dt, true, (effective, source) => emitPlayerHealing(world, effective, source, true));
    tickReleaseCores(world,dt);
    tickEquipment(world,dt,equipmentHooks);
    syncEffectiveMaxHp(world.aircraft);
    tickExpansion(world, dt, expansionHooks);
    tickCoreTelemetry(world.aircraft,dt);
    if (world.ended || world.destruction) return;
    updateBounty(world);
    updateTacticalCores(world,dt);
    if(hasCore(world.aircraft,118)){const entry=world.aircraft.coreState.telemetry.core_118??={};entry.peakBonus=Math.max(entry.peakBonus??0,crowdDamageBonus(world)*100);}
    updateEncounter(world, dt);
    settleControlOverride(world);
    world.playerInvulnerability = Math.max(0, world.playerInvulnerability - dt);
    world.comboTimer = Math.max(0, world.comboTimer - dt);
    if (world.comboTimer <= 0)
        world.comboKills = 0;
    dispatchCoreEvent("tick", coreContext(world, { dt }));
    updatePlayerDash(world, dt);
    updateEliteDirector(world,dt);
    updateScheduledAttacks(world);
    updateAstra(world,dt,astraHooks);
    tickRankSkills(world,dt,rankHooks);
    updateEnemies(world, dt);
    updateCrossfireGrids(world);
    updateMagneticHazards(world, dt, magneticHooks);
    updateStormbreaker(world, dt, stormbreakerHooks);
    updateMirage(world, dt, stormbreakerHooks);
    if (world.pendingCoreSelections || world.ended || world.destruction) {
        enterCountdownIfClear(world);
        return;
    }
    updateDroneMovement(world, dt);
    updateDecoys(world, dt);
    updateDecoySalvo(world, dt);
    updateSkillCoreEffects(world,dt);
    if(world.pendingCoreSelections || world.ended || world.destruction){enterCountdownIfClear(world);return;}
    updateWarnings(world, dt);
    updateLaser(world, dt);
    if (world.pendingCoreSelections || world.ended || world.destruction) {
        enterCountdownIfClear(world);
        return;
    }
    updateMissileSalvo(world, dt);
    tickCinder(world, dt, cinderHooks); tickRiptide(world, dt, riptideHooks);
    tickBasicFire(world,dt); tickArgent(world, dt, argentHooks); tickSylva(world, dt, sylvaHooks); tickTerra(world, dt, terraHooks);
    world.droneFireCooldown -= dt;
    if (droneCombatActive(world) && world.droneFireCooldown <= 0) {
        fireDrone(world);
        const state = world.aircraft, stats = getEffectiveAircraftStats(state,true,undefined,true), ratio = getSkillRuntimeValues(state, "escort_drone").damageMultiplier;
        world.droneFireCooldown = 1 / (stats.fireRate * ratio);
    }
    updateProjectiles(world, dt);
    interceptAircraftDefenses(world);
    interceptMissiles(world);
    captureAstraProjectiles(world,astraHooks);
    updateProjectileCollisions(world);
    settleMissileSalvos(world);
    for(const actor of actors)resolveScheduledBigBang(actor);
    updateEnemyPlayerCollisions(world);
    updateParticles(world, dt);
    if (world.aircraft.currentHp <= 0) latchAircraftDestruction(world);
    else if (world.bossDefeated) {
        delete world.aircraft.coreState.emergencyRepair;
        const tactical=tacticalState(world);tactical.grids.length=0;tactical.scraps.length=0;
        world.ended = true;
        if (world.stormbreaker) resetStormbreaker(world);
        world.pauseReasons.add("result");
    }
    enterCountdownIfClear(world);
    } finally {
      if (!world.destruction) finishMirrorDuel(world);
      if (world.ended) resetMirage(world);
      refreshBreathingRoom(world, expansionHooks);
      if (!world.destruction) {
        flushEquipmentDrops(world);
        claimWaitingChest(world.aircraft,world.random);
      }
    }
}
export function ensureCoreSelection(world: CombatWorld): CoreCard[] | null {
    if (world.destruction || world.aftermath) return null;
    if(equipmentState(world.aircraft).rewardChoices?.length){world.pauseReasons.add("equipmentReward");return null;}
    if(!world.initialCoreQueued||releaseState(world.aircraft).followups.length)return null;
    world.pendingCoreSelections = world.aircraft.pendingMilestones.length;
    while (world.pendingCoreSelections > 0) {
        if (!world.currentCoreChoices) {
            world.currentCoreChoices = generateCoreChoices(world.aircraft, world.coreSelectionCount + 1, world.random);
            world.coreSelectionEvent = world.currentCoreChoices.length ? createCoreSelectionEvent(world.aircraft,world.currentCoreChoices) : null;
        }
        if (world.currentCoreChoices.length) {
            world.pauseReasons.add("core");
            return world.currentCoreChoices;
        }
        // Exhausted finite catalog: consume only this milestone and continue safely.
        world.aircraft.pendingMilestones.shift();
        world.pendingCoreSelections = world.aircraft.pendingMilestones.length;
        world.coreSelectionCount++;
        world.currentCoreChoices = null;
        world.coreSelectionEvent = null;
    }
    world.pauseReasons.delete("core");
    return null;
}
export function selectCore(world: CombatWorld, card: CoreCard): boolean {
    if (!world.currentCoreChoices?.some(c => c.id === card.id && c.tier === card.tier))
        return false;
    if(world.coreSelectionEvent)closeCoreSelection(world.aircraft,world.coreSelectionEvent,world.currentCoreChoices.findIndex(c=>c.id===card.id));
    if (!applyCore(world.aircraft, card, world.random, id => dispatchCoreEvent("acquire", coreContext(world), id), ids=>removeWorldCores(world,ids)))
        return false;
    world.coreSelectionCount++;
    world.aircraft.pendingMilestones.shift();
    world.pendingCoreSelections = world.aircraft.pendingMilestones.length;
    world.currentCoreChoices = null;
    world.coreSelectionEvent = null;
    if(equipmentState(world.aircraft).rewardChoices?.length)world.pauseReasons.add("equipmentReward");
    if (releaseState(world.aircraft).followups.length) {
        expansionState(world.aircraft).primaryPending = true; world.pauseReasons.add("primarySkill");
    }
    if (hasCore(world.aircraft,184) && world.aircraft.coreState.timers.celestialReady === undefined && !world.aircraft.coreState.stacks["cooldownPending:celestialReady"]) world.aircraft.coreState.timers.celestialReady = world.elapsed;
    if (world.pendingCoreSelections === 0)
        world.pauseReasons.delete("core");

    return true;
}
export function makeHudSnapshot(world: CombatWorld, paused: boolean, pauseLabel: string | null): AirCombatHudSnapshot {
    const boss = world.enemies.find((enemy) => enemy.type === "boss");
    const mirror=(world.duelOpponent ?? world.mirage?.mirror), mirrorStats=mirror?getEffectiveAircraftStats(mirror.state):undefined;
    return {
        healing:getHealingSummary(world),
        grayHealth:sylvaGrayHealth(world),
        mirror:mirror&&mirrorStats?{grayHealth:sylvaGrayHealth(mirror.context.world),hp:mirror.state.currentHp,maxHp:mirrorStats.maxHp,resource:mirror.state.currentResource,maxResource:mirrorStats.maxResource}:undefined,
        stats: sylvaDisplayStats(world),
        score: Math.max(0, Math.round(world.score)),
        dps: rollingDps(world),
        comboKills: world.comboKills,
        comboMultiplier: getComboMultiplier(world.comboKills),
        elapsedSeconds: world.elapsed,
        waveLabel: world.duel ? "SOLO 1v1" : `${world.stage.waves[world.waveIndex].label}${world.waveState === "countdown" ? " · Đợt tiếp theo sau " + Math.ceil(world.waveTimer) + "s" : ""}`,
        waveIndex: world.waveIndex, waveState: world.waveState, guardianSlots: guardianSlots(world, boss?.id),
        waveCountdown: world.waveState === "countdown" ? Math.ceil(world.waveTimer) : 0,
        combatXpRequired: requiredCombatXp(world.aircraft.level, world.stageId),
        bossHp: boss?.hp || 0,
        bossMaxHp: boss?.maxHp || 0,
        bossPhase: world.bossPhase,
        paused,
        pauseLabel,
        cooldowns: { ...world.aircraft.cooldowns },
        droneActive: world.aircraft.droneActive,
        latestMessage: world.latestMessage,
        announcement: world.announcement,
    };
}
export function summarizeCombatWorld(world: CombatWorld): AirCombatRunSummary {
    if (world.defeatSummary) return world.defeatSummary;
    const stats = getEffectiveAircraftStats(world.aircraft);
    const withoutRank: Omit<AirCombatRunSummary, "rank"> = {
        stageId: world.stageId, stageVictory: world.stageVictory, stageFirstClear: world.stageFirstClear,
        aircraftId: world.aircraft.aircraftId,
        score: Math.max(0, Math.round(world.score)),
        enemiesDefeated: world.enemiesDefeated,
        elitesDefeated: world.elitesDefeated,
        bossDefeated: world.bossDefeated,
        maxCombo: world.maxCombo,
        survivalSeconds: world.destruction?.at ?? world.elapsed,
        combatLevel: world.aircraft.level,
        finalFirepower: stats.firepower,
        damageDealt: world.damageDealt,
        damageTaken: world.damageTaken,
        hitsReceived: world.hitsReceived,
        bossClearSeconds: world.bossClearSeconds,
        destroyed: world.aircraft.currentHp <= 0,
    };
    return { ...withoutRank, rank: calculateRunRank(withoutRank), astraTelemetry:world.astra?{...world.astra.metrics}:undefined };
}

export function canRerollCore(world:CombatWorld,slot:number,source:RerollSource="main"):boolean {
 return !!world.currentCoreChoices&&!!world.coreSelectionEvent&&getRerollCandidates(world.aircraft,world.coreSelectionEvent,slot,source).length>0;
}
/** One canonical priority for both selection surfaces; eligibility/telemetry stay in rerollCore. */
export function bestAvailableRerollSource(world: CombatWorld, slot: number): RerollSource | null {
    for (const source of ["main", "extra", "reserve"] as const) if (canRerollCore(world, slot, source)) return source;
    return null;
}
export function rerollCore(world:CombatWorld,slot:number,source:RerollSource="main"):CoreCard[]|null {
 if(!world.coreSelectionEvent||!world.currentCoreChoices)return null;
 const card=spendReroll(world.aircraft,world.coreSelectionEvent,slot,source,world.random);if(!card)return null;
 world.currentCoreChoices=world.currentCoreChoices.map((c,i)=>i===slot?card:c);return world.currentCoreChoices;
}

/** Shared predicate for EMP, missile intercept, interference wave and Gravity Anchor. */
export function isHostileBallisticProjectile(p:ProjectileEntity):boolean {
    return p.owner === "enemy" && p.allegiance !== "friendly_hacked" && p.allegiance !== "player"
        && !p.bigBang && p.projectileKind !== "bigbang" && (p.delivery === undefined || p.delivery === "direct_projectile");
}
function skillEnemyEffects(world:CombatWorld,id:number) {
    let entry=world.skillCores.enemyEffects.get(id);
    if(!entry){entry={};world.skillCores.enemyEffects.set(id,entry);}
    return entry;
}
function enemyOutputMultiplier(world:CombatWorld,id?:number):number {
    const e=world.enemies.find(e=>e.id===id);return (e?terraSuppression(world,e):1)*(id !== undefined && (world.skillCores.enemyEffects.get(id)?.weakenUntil || 0)>world.elapsed ? 1-V.weakenReduction : 1);
}
function refundResource(world:CombatWorld,amount:number,restored:number,coreRow:number):number {
    const state=world.aircraft,max=getEffectiveAircraftStats(state).maxResource;
    const actual=Math.max(0,Math.min(amount,max*(coreRow === 122 ? V.decoyRefundCap : V.manaRefundCap)-restored,max-state.currentResource));
    state.currentResource+=actual;
    recordCoreMetric(state,coreRow,"resource",actual);
    return actual;
}
function onDecoyAbsorb(world:CombatWorld,d:DecoyEntity,dashId?:string):void {
    if(d.clone)return;
    const state=world.aircraft,cast=world.skillCores.decoyCasts.get(d.castId);
    if(cast && (skillRank(state, "decoy") >= 3) && (!dashId || !cast.dashIds.has(dashId))){
        if(dashId)cast.dashIds.add(dashId);
        cast.restored+=refundResource(world,getEffectiveAircraftStats(state).maxResource*V.heatRecovery,cast.restored,122);
    }
    if(!dashId && (skillRank(state, "decoy") >= 4)) {
        emitVisual(world,{kind:"emp_pulse",x:d.x,y:d.y,size:V.decoyPulseRadius*2});
        for(const enemy of world.enemies)if(isHostileToPlayer(world,enemy) && circleVsAircraft(d.x,d.y,V.decoyPulseRadius,getEnemyHitbox(enemy))){
            applyDamageToEnemy(world,enemy,getEffectiveAircraftStats(state).firepower*V.decoyPulseDamage,"#fbbf24","skill","decoy",undefined,undefined,"area_hazard",true,true,123,1,[],d.expansionCast);
        }
    }
}
function recordTargetSync(world:CombatWorld,enemy:EnemyEntity,hawk:boolean):void {
    if(!canTargetEnemy(world,enemy,"hard_lock"))return;
    const effects=skillEnemyEffects(world,enemy.id),now=world.elapsed;
    if(hawk)effects.hawkHit=now;else effects.phantomHit=now;
    const r=world.skillCores;
    if(r.syncTarget!==null || (r.syncLockouts.get(enemy.id)??0)>now)return;
    if(effects.hawkHit!==undefined && effects.phantomHit!==undefined && now-effects.hawkHit<=V.syncWindow && now-effects.phantomHit<=V.syncWindow){
        world.skillCores.syncTarget=enemy.id;world.skillCores.syncUntil=now+V.syncDuration;
        effects.hawkHit=undefined;effects.phantomHit=undefined;
        recordCoreMetric(world.aircraft,146,"procs",1);
        if(!r.syncedTargets.has(enemy.id)){r.syncedTargets.add(enemy.id);recordCoreMetric(world.aircraft,146,"targets",1);}
    }
}
function settleMissileSalvos(world:CombatWorld):void {
    const state=world.aircraft;
    world.skillCores.salvos=world.skillCores.salvos.filter(s=>{
        if(s.pending || s.live.size)return true;
        if((skillRank(state, "missile_swarm") >= 3) && !world.ended){
            // A later completed empty salvo also replaces the previous buff.
            recordCoreMetric(state,130,"stacks",s.data);
            if(s.data>0)emitVisual(world,{kind:"ultimate_effect",ultimateEffect:"ultimateViperData",x:world.playerX,y:world.playerY,size:65});
            state.coreState.stacks.tacticalData=s.data;
            state.coreState.timers.tacticalData=s.data>0?state.coreState.time+V.dataDuration:0;
        }
        return false;
    });
}
function interceptMissiles(world:CombatWorld):void {
    if(!(skillRank(world.aircraft, "missile_swarm") >= 2))return;
    const removed=new Set<number>();
    for(const missile of world.projectiles){
        if(missile.mirrorBorrowed || missile.skillId!=="missile_swarm" || missile.missileState!=="powered" || (missile.interceptCount??0)>=V.interceptLimit)continue;
        for(const hostile of world.projectiles){
            if(!isHostileBallisticProjectile(hostile) || removed.has(hostile.id))continue;
            // Relative swept segment tests simultaneous intersection, not an eraser radius.
            const distance=segmentDistance(0,0,missile.previousX-hostile.previousX,missile.previousY-hostile.previousY,missile.x-hostile.x,missile.y-hostile.y);
            if(distance>missile.radius+hostile.radius)continue;
            removed.add(hostile.id);recordCoreMetric(world.aircraft,129,"blocked",1);missile.interceptCount=(missile.interceptCount || 0)+1;
            emitVisual(world,{kind:"ultimate_effect",ultimateEffect:"ultimateViperIntercept",x:hostile.x,y:hostile.y,size:25});
            if(missile.interceptCount>=V.interceptLimit)break;
        }
    }
    for(let i=world.projectiles.length-1;i>=0;i--)if(removed.has(world.projectiles[i].id))recycleProjectile(world,i);
}
function displaceEnemy(world:CombatWorld,e:EnemyEntity,dx:number,dy:number,knockback=true):void {
    if(e.aircraftTarget&&((knockback&&terraKnockbackImmune(e.aircraftTarget.world.aircraft))||celestialProtection(e.aircraftTarget.world.aircraft)||hardControlImmune(e.aircraftTarget.world.aircraft)))return;
    const point=clampHitboxToGameplayRect(e.x+dx,e.y+dy,getEnemyHitbox(e));
    const appliedX=point.x-e.x,appliedY=point.y-e.y;
    const defender=e.aircraftTarget?.world;
    if (defender && (appliedX !== 0 || appliedY !== 0)) tacticalState(defender).previousStatuses.add('displacement');
    e.x=point.x;e.y=point.y;e.baseX+=appliedX;
    if (defender && (appliedX !== 0 || appliedY !== 0)) observeComeback(defender);
    // Keep committed dash trajectories attached to the translated airframe.
    if(e.dashRemaining>0 || e.kamikazeState==="dash"){
        e.dashStartX+=appliedX;e.dashStartY+=appliedY;e.dashEndX+=appliedX;e.dashEndY+=appliedY;
    }
}
function explodeClone(world:CombatWorld,d:DecoyEntity):void {
    emitVisual(world,{kind:"explosion",x:d.x,y:d.y,size:V.cloneExplosionRadius*2});
    const raw=getEffectiveAircraftStats(world.aircraft).firepower*V.cloneExplosionDamage;
    for(const e of world.enemies)if(isHostileToPlayer(world,e)&&circleVsAircraft(d.x,d.y,V.cloneExplosionRadius,getEnemyHitbox(e)))applyDamageToEnemy(world,e,raw,"#c4b5fd","skill","invisibility",undefined,undefined,"area_hazard",true,true,140,1,[],d.expansionCast);
    d.remaining=0;
}
function updateSkillCoreEffects(world:CombatWorld,dt:number):void {
    const state=world.aircraft,c=state.coreState,r=world.skillCores,now=world.elapsed;
    if(c.stacks.shieldEmpPending){
        delete c.stacks.shieldEmpPending;
        emitVisual(world,{kind:"emp_pulse",x:world.playerX,y:world.playerY,size:720});
        for(let i=world.projectiles.length-1;i>=0;i--)if(ordinaryHostileBullet(world.projectiles[i])){recordCoreMetric(state,131,"blocked",1);recycleProjectile(world,i);}
    }
    if((skillRank(state, "decoy") >= 4)){
        const maintained=world.decoys.some(d=>!d.clone&&d.active&&d.remaining>0);
        if(maintained)c.timers.thermalCover=Infinity;
        else if(c.stacks.thermalMaintained)c.timers.thermalCover=c.time+V.thermalTail;
        c.stacks.thermalMaintained=Number(maintained);
    }
    for(const [id] of r.decoyCasts)if(!(world.decoyVolleys>0&&id===r.decoyCastId)&&!world.decoys.some(d=>!d.clone&&d.castId===id))r.decoyCasts.delete(id);
    for(const [id] of r.volleyHits)if(!world.decoys.some(d=>!d.clone&&d.volleyId===id))r.volleyHits.delete(id);
    r.aftershocks=r.aftershocks.filter(a=>{
        if(a.at>now)return true;
        emitVisual(world,{kind:"bomb",x:a.x,y:a.y,size:360});
        for(const e of world.enemies){
            if(!isHostileToPlayer(world,e) || (!e.aircraftTarget && (e.x+e.radius<0 || e.x-e.radius>AIR_COMBAT_WORLD.width || e.y+e.radius<0 || e.y-e.radius>AIR_COMBAT_WORLD.height)))continue;
            applyDamageToEnemy(world,e,getEffectiveAircraftStats(state).firepower*V.aftershockDamage,"#fbbf24","skill","heavy_bomb",undefined,undefined,"area_hazard",true,true,134,1,[],a.expansionCast);
            if(e.hp<=0)continue;
            skillEnemyEffects(world,e.id).weakenUntil=now+V.weakenDuration;
            let dx=e.x-a.x,dy=e.y-a.y,length=Math.hypot(dx,dy);
            if(length<.001){dx=e.x-world.playerX;dy=e.y-world.playerY;length=Math.hypot(dx,dy);}
            if(length<.001){dx=0;dy=-1;length=1;}
            const distance=e.type==="boss"?V.knockbackBoss:isElite(e.type)?V.knockbackElite:V.knockbackNormal;
            displaceEnemy(world,e,dx/length*distance,dy/length*distance);
        }
        return false;
    });
    if(r.syncTarget!==null && (r.syncUntil<=now || !world.enemies.some(e=>e.id===r.syncTarget&&isHostileToPlayer(world,e)))) {
        if(r.syncUntil<=now && world.enemies.some(e=>e.id===r.syncTarget&&isHostileToPlayer(world,e)))r.syncLockouts.set(r.syncTarget,r.syncUntil+12);
        r.syncTarget=null;r.syncUntil=0;
    }
    for(const [id,until] of r.syncLockouts)if(until<=now || !world.enemies.some(e=>e.id===id&&e.hp>0))r.syncLockouts.delete(id);
    for(const id of r.syncedTargets)if(!world.enemies.some(e=>e.id===id&&e.hp>0))r.syncedTargets.delete(id);
    for(const [id,e] of r.enemyEffects){
        if((e.weakenUntil||0)<=now)delete e.weakenUntil;
        if((e.markUntil||0)<=now)delete e.markUntil;
        if((e.armorUntil||0)<=now)delete e.armorUntil;
        if((e.phantomHit??-Infinity)<now-V.syncWindow)delete e.phantomHit;
        if((e.hawkHit??-Infinity)<now-V.syncWindow)delete e.hawkHit;
        if(!Object.keys(e).length)r.enemyEffects.delete(id);
    }
    resolveDeathsAndEffects(world);
}

function resolveStormbreakerContacts(w: CombatWorld) {
    if (!w.stormbreaker || w.ended) return;
    for (const a of w.stormbreaker.hazards) {
        if (a.decoy || w.elapsed < a.hitAt || w.elapsed >= a.until || a.conditionalOwner && !w.enemies.some(e => e.id === a.conditionalOwner && e.hp > 0)) continue;
        const insulated = a.environmental !== undefined && a.delivery === "area_hazard" && w.stormbreaker.fields.some(f => f.until > w.elapsed && f.cycle === a.environmental && Math.hypot(w.playerX-f.x,w.playerY-f.y) <= f.radius);
        stormbreakerHooks.area(w,a.damage,a,{...a.start,end:a.end,radius:a.radius},a.hits,a.grace,insulated);
    }
    for (const e of w.enemies) {
        const d=e.stormbreaker?.dash;
        if (!d || e.hp<=0 || w.elapsed<d.start || d.progress>=d.duration) continue;
        stormbreakerHooks.area(w,d.damage,{sourceEnemyId:e.id,sourceEnemyType:e.type,allegiance:d.allegiance,delivery:"aircraft_collision"},
            {x:e.x,y:e.y,radius:e.radius*.65},d.hits,Infinity);
    }
}
const stormbreakerHooks: StormbreakerHooks = {
    movement:(w,e)=>Math.min(sylvaMovement(w,e),argentMovement(w,e),riptideMovement(w,e),cinderMovement(w,e)*equipmentSlow(w.aircraft,e)*rankEnemyMovement(w,e)),
    spawn: spawnEnemy, projectile: addProjectile, allegiance: enemyAllegiance, message: setMessage,
    target: (w,e,allegiance) => {
        if ((allegiance ?? enemyAllegiance(w,e)) === "hostile") return {x:w.playerX,y:w.playerY};
        return nearestEnemy(w,e.x,e.y,[e.id],true);
    },
    area: (w,raw,attack,shape,hits,grace,insulated=false) => {
        if (w.ended || raw<=0) return;
        const touches=(box:AircraftHitbox)=>shape.end?segmentVsAircraft(shape.x,shape.y,shape.end.x,shape.end.y,shape.radius,box,projectileContact).hit:circleVsAircraft(shape.x,shape.y,shape.radius,box);
        const ready=(id:number)=>!hits.has(id)||w.elapsed-hits.get(id)!>=grace;
        for(const e of w.enemies) if(canAttackEnemy(w,attack.allegiance??"hostile",e,attack.sourceEnemyId)&&ready(e.id)&&touches(getEnemyHitbox(e))) {
            hits.set(e.id,w.elapsed); damageEnemyAttack(w,e,raw,attack);
        }
        if((attack.allegiance??"hostile")==="hostile") {
            if(!insulated&&ready(-1)&&touches(getPlayerHitbox(w))) {hits.set(-1,w.elapsed);hitPlayer(w,raw,attack.delivery==="aircraft_collision"?"collision":"hazard",attack);}
            if(!w.ended&&droneCombatActive(w)&&ready(-2)) {
                const drone={x:w.droneX,y:w.droneY,radius:9,shapes:[{kind:"capsule" as const,ax:w.droneX,ay:w.droneY,bx:w.droneX,by:w.droneY,r:9}]};
                if(touches(drone)){hits.set(-2,w.elapsed);hitDrone(w,raw*enemyOutputMultiplier(w,attack.sourceEnemyId));}
            }
        }
    },
};
const magneticHooks: MagneticHooks = {
    spawn: spawnEnemy, projectile: addProjectile, hostile: isHostileToPlayer, message: setMessage,
    allegiance:enemyAllegiance,target:(w,e,allegiance)=>{
      if((allegiance??e.magnetic?.elite?.allegiance??enemyAllegiance(w,e))==="hostile")return {x:w.playerX,y:w.playerY};
      const target=nearestEnemy(w,e.x,e.y,[e.id],true);
      e.hackedTargetId=target?.id;
      if(target&&e.type!=="boss"&&!e.magnetic?.elite)e.hackedFacing=Math.atan2(target.y-e.y,target.x-e.x)+Math.PI/2;
      return target;
    },
    area:(w,raw,attack,shape)=>{
        const touches=(box:AircraftHitbox)=>shape.end?segmentVsAircraft(shape.x,shape.y,shape.end.x,shape.end.y,shape.radius,box,projectileContact).hit:circleVsAircraft(shape.x,shape.y,shape.radius,box);
        for(const e of w.enemies)if(canAttackEnemy(w,attack.allegiance??"hostile",e,attack.sourceEnemyId)&&touches(getEnemyHitbox(e)))damageEnemyAttack(w,e,raw,attack);
        if((attack.allegiance??"hostile")==="hostile") {
            if(touches(getPlayerHitbox(w)))hitPlayer(w,raw,"hazard",attack);
            if(droneCombatActive(w)&&Math.hypot(w.droneX-shape.x,w.droneY-shape.y)<=shape.radius+10)hitDrone(w,raw);
        }
    },
    hit: (world, raw, owner, sourceType, delivery = "area_hazard", payload) => hitPlayer(world, raw, "hazard", { sourceEnemyId: owner, sourceEnemyType: sourceType, delivery, payload }),
};

function droneCombatActive(world:CombatWorld):boolean { return world.aircraft.droneActive && world.aircraft.dronePhase==="active"; }
function basicTelemetryBonuses(state:AircraftCombatState,sweeping:boolean,extra:boolean,reappearance:boolean):[number,number][] {
    const result:[number,number][]=[];
    if(!extra&&hasCore(state,59)&&state.basicShotsFired%5===0)result.push([59,1.25/2.25]);
    if(hasCore(state,60)){const factor=state.coreState.time-state.coreState.lastDamage>=3||expansionActive(state,"stableBarrelGrace")?1.30:1.10;result.push([60,1-1/factor]);}
    if((state.coreState.timers.counterActive??0)>state.coreState.time)result.push([83,.30/1.30]);
    if(reappearance)result.push([142,1-1/V.reappearanceDamage]);
    if(sweeping&&!extra&&(skillRank(state, "sweeping_cannon") >= 2))result.push([34,(getSkillRuntimeValues(state,"sweeping_cannon").damageMultiplier-.7)/getSkillRuntimeValues(state,"sweeping_cannon").damageMultiplier]);
    return result;
}

function addHeat(w:CombatWorld,amount:number,source:"heatCast"|"heatToggle"|"heatBasic") {
    const s=w.aircraft,r=releaseState(s);
    if(!hasCore(s,219)||overheated(s))return;
    const gained=Math.min(amount,100-r.heat);r.heat+=gained;recordCoreMetric(s,219,source,gained);
    if(r.heat>=100){
        r.heat=100;r.overheatUntil=s.coreState.time+3;
        recordCoreMetric(s,219,"overheats",1);
    }
}
function heatMultiplier(s:AircraftCombatState){const heat=releaseState(s).heat;return hasCore(s,219)&&!overheated(s)&&heat>=50&&heat<100?1.30:1;}
/** Pure preview and actual resolution share the exact same mitigation path. */
function releaseDamageBudget(w:CombatWorld,e:EnemyEntity,raw:number,row:220|221){
    const s=w.aircraft,t=s.coreState.time,fx=w.skillCores.enemyEffects.get(e.id);
    const armor=resolvedEnemyArmor(w,e,armorPenetration(s));
    let multiplier=expansionOutgoing(s,false,false)*outgoingCoreMultiplier(s,targetMetadata(e),"core",Math.hypot(e.x-w.playerX,e.y-w.playerY),GAMEPLAY_SAFE_RECT.height);
    if(hasCore(s,115)&&!w.enemies.some(other=>other.id!==e.id&&isHostileToPlayer(w,other)&&Math.hypot(other.x-e.x,other.y-e.y)<=80))multiplier*=e.type==="boss"?1.2:1.3;
    if(expansionActive(s,"comeback"))multiplier*=1.20;
    if(hasCore(s,118))multiplier*=1+crowdDamageBonus(w);
    if(w.skillCores.bountyTarget===e.id&&w.skillCores.bountyUntil>w.elapsed)multiplier*=1.10;
    if((e.expansionMarks?.shieldBroken??0)>t)multiplier*=1.20;
    if((e.expansionMarks?.controlWeakness??0)>t)multiplier*=1.25;
    multiplier*=equipmentOutgoing(s,e,false,false,false).multiplier*sylvaOutgoing(w,e);
    return calculateDamage(raw,armor,multiplier)*guardianMultiplier(w,e)*stormDamageTakenMultiplier(w,e)*(e.type==="boss"&&e.hp/e.maxHp>=.15&&e.aegisUntil>t?.6:1);
}
function resolveReleaseDamage(w:CombatWorld,e:EnemyEntity,raw:number,row:220|221,settled=0){
    if (w.aftermath || w.destruction) return 0;
    if(!isHostileToPlayer(w,e)||raw<=0)return 0;
    const budget=releaseDamageBudget(w,e,raw,row)+settled,shieldBefore=e.shield;let absorbed=Math.min(e.shield,budget),damage=Math.min(e.hp,Math.max(0,budget-absorbed));
    if (!e.aircraftTarget) e.shield-=absorbed;
    if(e.aircraftTarget){const received=receiveAircraftTargetDamage(e,budget,"area_hazard");damage=received.damage;absorbed=received.absorbed;}else e.hp-=damage;
    sylvaDealt(w,e,damage,damage+absorbed,undefined,sylvaHooks);
    if(w.stormbreaker)onStormEnemyDamage(w,e,damage,shieldBefore,stormbreakerHooks);
    if(absorbed>0&&e.shield<=0&&e.type==="iron_fortress"&&e.retaliationReady){e.retaliationReady=false;queueEliteSpecial(w,e,"retaliation",.01,false);}
    if(e.hp<=0&&!e.aircraftTarget){e.killProcEligible=row!==220;e.expansionKillingHit=row===220?undefined:{primary:false,basic:false,skill:false,direct:false,critical:false,elite:isElite(e.type)};}
    recordDpsDamage(w,damage+absorbed);w.damageDealt+=damage;
    recordCoreMetric(w.aircraft,row,"damage",damage+absorbed);recordCoreMetric(w.aircraft,row,"hits",damage+absorbed>0?1:0);
    emitVisual(w,{kind:"damage_number",x:e.x,y:e.y,size:e.radius,hpDamage:damage,shieldAbsorbed:absorbed,target:"enemy",critical:false,entityId:e.id});
    observeBossDamage(w,e,damage);
    if(row===220)accumulateDeathMark(w,e,damage+absorbed,false);
    if(heatMultiplier(w.aircraft)>1){const without=budget/1.3;recordCoreMetric(w.aircraft,219,"bonusDamage",damage+absorbed-Math.min(e.hp+damage+e.shield+absorbed,without));}
    return damage;
}
function finishDeathMark(w:CombatWorld,early=false){
    const s=w.aircraft,r=releaseState(s),mark=r.mark;if(!mark)return;
    const target=w.enemies.find(e=>e.id===mark.target&&isHostileToPlayer(w,e)&&canTargetEnemy(w,e,"hard_lock"));
    r.mark=undefined;r.markReady=w.elapsed+16;
    if(!target)return;
    const raw=getEffectiveAircraftStats(s).firepower*.5;
    resolveReleaseDamage(w,target,raw,221,mark.damage*.5);
    if(early&&target.hp<=0){r.markReady=w.elapsed+8;recordCoreMetric(s,221,"earlyDetonations",1);recordCoreMetric(s,221,"executes",1);recordCoreMetric(s,221,"cooldown",8);}
    else recordCoreMetric(s,221,"detonations",1);
}
function accumulateDeathMark(w:CombatWorld,e:EnemyEntity,actual:number,allowEarly=true){
    const s=w.aircraft,r=releaseState(s),mark=r.mark;
    if(!hasCore(s,221)||!mark||mark.target!==e.id)return;
    mark.damage+=actual;recordCoreMetric(s,221,"accumulated",actual);
    if(e.hp<=0){r.mark=undefined;r.markReady=w.elapsed+16;return;}
    const raw=getEffectiveAircraftStats(s).firepower*.5;
    if(allowEarly&&releaseDamageBudget(w,e,raw,221)+mark.damage*.5>=e.shield+e.hp)finishDeathMark(w,true);
}
function tickReleaseCores(w:CombatWorld,dt:number){
    const s=w.aircraft,r=releaseState(s),now=s.coreState.time;
    if(hasCore(s,178)&&s.coreState.stacks.magneticErase){
      const targets=w.projectiles.filter(p=>isHostileBallisticProjectile(p)&&Math.hypot(p.x-w.playerX,p.y-w.playerY)<=170).sort((a,b)=>Math.hypot(a.x-w.playerX,a.y-w.playerY)-Math.hypot(b.x-w.playerX,b.y-w.playerY)).slice(0,3);
      for(const p of targets){const i=w.projectiles.indexOf(p);if(i>=0){p.grazeCandidate=false;recycleProjectile(w,i);recordCoreMetric(s,178,"blocked",1);}}s.coreState.stacks.magneticErase=0;
    }
    if(hasCore(s,222)){
        recordCoreMetric(s,222,r.mode==="small"?"smallTime":"giantTime",dt);
        if(now>=r.nextMode)rollUnstableMode(s,w.random);
    }
    const box=getPlayerHitbox(w),point=clampHitboxToGameplayRect(w.playerX,w.playerY,box);
    w.playerX=point.x;w.playerY=Math.min(point.y,AIR_COMBAT_WORLD.height-AIR_COMBAT_WORLD.playerBottomClearance*playerAirframeScale(s));w.playerRadius=box.radius;
    if(hasCore(s,219)){
        if(r.overheatUntil>now-dt){
            recordCoreMetric(s,219,"overheatTime",Math.min(dt,Math.max(0,r.overheatUntil-(now-dt))));
            r.heat=Math.max(0,100*(r.overheatUntil-now)/3);
        } else {
            const active=s.droneActive||Object.values(s.activeEffects).some(t=>(t??0)>0)||expansionState(s).liveCasts.some(c=>!c.ended);
            if(r.hadActiveSkill&&!active&&r.lastSkillEnd<now-dt)r.lastSkillEnd=now;
            r.hadActiveSkill=active;
            if(s.droneActive||(s.activeEffects.sweeping_cannon??0)>0)addHeat(w,2*dt,"heatToggle");
            if(now-(r.lastCast??0)>=10)r.heat=Math.max(0,r.heat-15*Math.min(dt,now-(r.lastCast??0)-10));
            if(r.heat>=50&&r.heat<100)recordCoreMetric(s,219,"uptime",dt);
        }
    }
    if(hasCore(s,220)){
        for(const ghost of r.ghosts){
            const step=Math.max(0,Math.min(dt,ghost.until-(now-dt)));recordCoreMetric(s,220,"uptime",step);
            if(ghost.until<=now){r.ghostReady=ghost.until+10;continue;}
            const angle=ghost.angle-Math.PI/2;
            ghost.fireIn-=dt;
            if(ghost.fireIn<=0){const stats=getEffectiveAircraftStats(s);ghost.fireIn+=1/stats.fireRate;
                const p=addProjectile(w,{owner:"player",source:"core",telemetryCore:220,x:ghost.x,y:ghost.y,vx:Math.cos(angle)*480,vy:Math.sin(angle)*480,rawDamage:stats.firepower*.50,radius:2.8,color:"#a5f3fc"});
                if(p)recordCoreMetric(s,220,"shots",1);
            }
        }
        r.ghosts=r.ghosts.filter(g=>g.until>now);
    }
    if(hasCore(s,221)){
        if(r.mark){if(!w.enemies.some(e=>e.id===r.mark!.target&&isHostileToPlayer(w,e)&&canTargetEnemy(w,e,"hard_lock"))) {r.mark=undefined;r.markReady=now+16;}
            else if(now>=r.mark.until)finishDeathMark(w);
        } else if(now>=r.markReady){const target=currentPlayerTarget(w);if(target){r.mark={target:target.id,until:now+5,damage:0};recordCoreMetric(s,221,"marks",1);}}
    }
}
function currentPlayerTarget(w:CombatWorld){return w.enemies.find(e=>e.id===w.playerTargetId&&isHostileToPlayer(w,e)&&canTargetEnemy(w,e))??nearestEnemy(w,w.playerX,w.playerY,[],true);}

/** Pandora removes all ordinary passives together. Keep skill-owned state and hostile statuses. */
function removeWorldCores(w:CombatWorld,ids:string[]){
    const s=w.aircraft,c=s.coreState,removed=new Set(ids.map(id=>Number(id.slice(5))));
    if(removed.has(90)&&(c.timers.deathRefusalInvulnerability??0)>c.time)w.playerInvulnerability=Math.min(w.playerInvulnerability,Math.max(0,w.playerDamageGraceUntil-w.elapsed));
    if(removed.has(113))for(const skill of SKILL_IDS){
        if(c.stacks[`debtNormal:${skill}`]!==undefined)s.cooldowns[skill]=c.stacks[`debtNormal:${skill}`];
        else s.cooldowns[skill]=Math.max(0,(s.cooldowns[skill]??0)-(c.stacks[`paidDebt:${skill}`]??0));
    }
    for(const id of ids)if(id!==coreId(90))c.consumed.delete(id);
    const skillKeys=new Set(["lanceChain","lanceStack","lanceCastStack","whiteHole","shieldArmor","hawkRage","hawkRageReady","decoyCounter","activeCooling","shieldEmpPending","cloneEndPending","thermalCover","thermalMaintained","tacticalData","reappearanceBuff","shieldRefund","acidArmor"]);
    for(const key of Object.keys(c.stacks))if(!skillKeys.has(key)&&!key.startsWith("bountyReward:"))delete c.stacks[key];
    for(const key of Object.keys(c.timers))if(!skillKeys.has(key))delete c.timers[key];
    c.shields={};
    const r=expansionState(s);r.charges=[];r.returns=[];r.endedShields=[];r.debt=[];r.sequence=[];r.hpLoss=[];r.fullSince=undefined;r.lastSkill=undefined;r.resourceRatio=undefined;r.primarySkill=undefined;r.primaryPending=false;
    for(const cast of r.liveCasts)cast.overclock=0;
    for(let i=w.projectiles.length-1;i>=0;i--){const p=w.projectiles[i];if((p.telemetryCore&&removed.has(p.telemetryCore))||(!p.skillId&&(p.source==="core"||p.source==="lightning")))recycleProjectile(w,i);else{p.aimCorrectionUntil=undefined;p.mainBasicMiss=false;}}
    w.effectQueue.length=0;
    if(w.tactical){w.tactical.grids=[];w.tactical.scraps=[];w.tactical.openingHits.clear();w.tactical.hackTargets=[];w.tactical.hackEnd=0;w.tactical.hackMode=undefined;w.tactical.lastWeaponHit=undefined;w.tactical.previousStatuses.clear();}
    for(const e of w.enemies){e.expansionMarks={gravityArmor:e.expansionMarks?.gravityArmor??0,gravityArmorUntil:e.expansionMarks?.gravityArmorUntil??0};e.weakHits=0;e.weakUntil=0;e.weakDebuffUntil=0;e.weakReadyAt=undefined;e.lightningUntil=0;
        if((e.hackedUntil??0)>w.elapsed){e.hackedUntil=0;e.hackedFacing=undefined;e.hackedTargetId=undefined;rearmAllegiance(w,e);}}
    // Pending hack-owned ordnance is owned exclusively by the removed Core120.
    if(removed.has(120)){
        for(let i=w.projectiles.length-1;i>=0;i--)if(w.projectiles[i].allegiance==="friendly_hacked")recycleProjectile(w,i);
        w.warnings=w.warnings.filter(zone=>zone.allegiance!=="friendly_hacked");
        w.scheduledAttacks=w.scheduledAttacks.filter(attack=>attack.allegiance!=="friendly_hacked");
        w.eliteSpecials=w.eliteSpecials.filter(attack=>attack.allegiance!=="friendly_hacked");
        for(let i=w.enemies.length-1;i>=0;i--)if(w.enemies[i].inheritedAllegiance==="friendly_hacked")recycleEnemy(w,i);
        for(const e of w.enemies){if(e.burstAllegiance==="friendly_hacked"){e.burst=0;e.burstAllegiance=undefined;}if(e.dashAllegiance==="friendly_hacked"){e.dashRemaining=0;e.dashAllegiance=undefined;}if(e.magnetic?.elite?.allegiance==="friendly_hacked")e.magnetic.elite=undefined;}
        if(w.magnetic){w.magnetic.lanes=w.magnetic.lanes?.filter(l=>l.allegiance!=="friendly_hacked");w.magnetic.trails=w.magnetic.trails?.filter(t=>t.allegiance!=="friendly_hacked");w.magnetic.mines=w.magnetic.mines.filter(m=>m.allegiance!=="friendly_hacked");}
    }
    s.cooldowns={...s.cooldowns};
}
function finishBounty(world:CombatWorld) {
    const r=world.skillCores;r.bountyTarget=null;r.bountyUntil=0;r.bountyReady=world.elapsed+20;
    world.aircraft.coreState.timers.bountyMark=0;world.aircraft.coreState.timers.bountyCooldown=r.bountyReady;
}
function updateBounty(world:CombatWorld) {
    const r=world.skillCores,state=world.aircraft;
    if(!hasCore(state,149))return;
    if(r.bountyTarget!==null) {
        if(world.elapsed>=r.bountyUntil || !world.enemies.some(e=>e.id===r.bountyTarget&&isHostileToPlayer(world,e)))finishBounty(world);
        return;
    }
    if(r.bountyReady===0){r.bountyReady=world.elapsed+20;state.coreState.timers.bountyCooldown=r.bountyReady;}
    if(world.elapsed<r.bountyReady || world.waveState!=="combat")return;
    const targets=world.enemies.filter(e=>isHostileToPlayer(world,e)&&!e.auxiliary&&!e.rewardless&&e.killProcEligible!==false);
    if(!targets.length)return;
    targets.sort((a,b)=>getTargetPriority(a.type)-getTargetPriority(b.type)||b.hp-a.hp);
    r.bountyTarget=targets[0].id;r.bountyUntil=world.elapsed+5;r.bountyReady=0;delete state.coreState.timers.bountyCooldown;
    state.coreState.timers.bountyMark=state.coreState.time+5;recordCoreMetric(state,149,"marks",1);
}
function settleBountyKill(world:CombatWorld,enemy:EnemyEntity) {
    const r=world.skillCores,state=world.aircraft;
    if(r.bountyTarget!==enemy.id)return;
    if(world.elapsed<r.bountyUntil && !enemy.auxiliary&&!enemy.rewardless&&enemy.killProcEligible!==false) {
        const index=Math.min(7,Math.floor(world.random()*8));
        const reward=BOUNTY_REWARDS[index];state.modifiers[reward.key]+=reward.amount;
        state.coreState.acquisitions.push({id:state.coreState.nextAcquisitionId++,createdAtMs:performance.now(),kind:'reward',coreId:'core_149',source:'Truy Nã',name:'+'+(reward.amount*('percent' in reward?100:1)).toLocaleString('vi-VN')+('percent' in reward?'%':'')+' '+reward.label});
        const key=`bountyReward:${index}`;state.coreState.stacks[key]=(state.coreState.stacks[key]??0)+1;
        syncEffectiveMaxHp(state);
        recordCoreMetric(state,149,"successes",1);recordCoreMetric(state,149,"rewards",1);
    }
    finishBounty(world);
}

const astraHooks:AstraHooks={impact:(w,x,y,radius,_doom)=>emitVisual(w,{kind:"astra_starfall_impact",skillId:"starfall",x,y,size:radius*2}),projectile:addProjectile,hostile:isHostileToPlayer,remove:recycleProjectile,
    damage:(w,e,raw,skill,burn,cast,beam)=>applyDamageToEnemy(w,e,raw,"#ff943f",burn?"burn":"skill",skill,undefined,undefined,beam?"beam":"explosive_aoe",true,true,undefined,1,[],cast)};

/** Equipment procs share enemy mitigation, shields, overkill, boss feedback and DPS,
 * but cannot recursively dispatch hit/critical/Core proc hooks. */
function resolveEquipmentDamage(w:CombatWorld,e:EnemyEntity,raw:number,family:number):number {
    if (w.aftermath || w.destruction) return 0;
    if(!isHostileToPlayer(w,e)||raw<=0)return 0;
    const s=w.aircraft,t=s.coreState.time,fx=w.skillCores.enemyEffects.get(e.id);
    const armor=resolvedEnemyArmor(w,e,armorPenetration(s));
    const outgoing=equipmentOutgoing(s,e,false,false,false);
    let coreMultiplier=expansionOutgoing(s,false,false)*outgoingCoreMultiplier(s,targetMetadata(e),"core",Math.hypot(e.x-w.playerX,e.y-w.playerY),GAMEPLAY_SAFE_RECT.height);
    if(hasCore(s,115)&&!w.enemies.some(other=>other.id!==e.id&&isHostileToPlayer(w,other)&&Math.hypot(other.x-e.x,other.y-e.y)<=80))coreMultiplier*=e.type==="boss"?1.2:1.3;
    if(expansionActive(s,"comeback"))coreMultiplier*=1.20;
    if(hasCore(s,118))coreMultiplier*=1+crowdDamageBonus(w);
    if(w.skillCores.bountyTarget===e.id&&w.skillCores.bountyUntil>w.elapsed)coreMultiplier*=1.10;
    if((e.expansionMarks?.shieldBroken??0)>t)coreMultiplier*=1.20;
    if((e.expansionMarks?.controlWeakness??0)>t)coreMultiplier*=1.25;
    const budget=calculateDamage(raw,armor,outgoing.multiplier*coreMultiplier*sylvaOutgoing(w,e))*guardianMultiplier(w,e)*stormDamageTakenMultiplier(w,e)*(e.type==="boss"&&e.hp/e.maxHp>=.15&&e.aegisUntil>t?.6:1);
    const shieldBefore=e.shield;let absorbed=Math.min(e.shield,budget),hpDamage=Math.min(e.hp,Math.max(0,budget-absorbed));
    if (!e.aircraftTarget) e.shield-=absorbed;
    if(e.aircraftTarget){const received=receiveAircraftTargetDamage(e,budget,"area_hazard",undefined,0,1,false,false,family===36);hpDamage=received.damage;absorbed=received.absorbed;}else e.hp-=hpDamage;
    sylvaDealt(w,e,hpDamage,hpDamage+absorbed,undefined,sylvaHooks);
    if(w.stormbreaker)onStormEnemyDamage(w,e,hpDamage,shieldBefore,stormbreakerHooks);
    if(absorbed>0&&e.shield<=0&&e.type==="iron_fortress"&&e.retaliationReady){e.retaliationReady=false;queueEliteSpecial(w,e,"retaliation",.01,false);}
    if(e.hp<=0&&!e.aircraftTarget){e.killProcEligible=family!==12&&family!==16;e.expansionKillingHit={primary:false,basic:false,skill:false,direct:false,critical:false,elite:isElite(e.type)};}
    recordDpsDamage(w,hpDamage+absorbed);w.damageDealt+=hpDamage;
    emitVisual(w,{kind:"damage_number",x:e.x,y:e.y,size:e.radius,hpDamage,shieldAbsorbed:absorbed,target:"enemy",critical:false,entityId:e.id});
    observeBossDamage(w,e,hpDamage);
    const actual=hpDamage+absorbed;
    if(family!==12&&family!==16){
      if(equipmentScale(s,33)&&s.currentHp<getEffectiveAircraftStats(s).maxHp*.5)equipmentMetric(s,33,"healed",healPlayerWithFeedback(w,actual*P[33].heal*equipmentScale(s,33),"core",true));
      accumulateDeathMark(w,e,actual,false);
    }
    for(const [f,factor] of outgoing.factors)equipmentMetric(s,f,"bonusDamage",actual-Math.min(e.hp+hpDamage+e.shield+absorbed,budget/factor));
    return actual;
}
const equipmentHooks:EquipmentHooks={damage:resolveEquipmentDamage,heal:(w,n)=>w.aircraft.currentHp>0?healPlayerWithFeedback(w,n,"core",true):0,hostile:isHostileToPlayer,elite:e=>isElite(e.type)};

/** All percentage Armor reduction is capped before penetration. Flat equipment shred remains flat. */
function resolvedEnemyArmor(w:CombatWorld,e:EnemyEntity,penetration=0,state=w.aircraft,armorEntity=e):number {
 const t=w.elapsed,fx=w.skillCores.enemyEffects.get(e.id);
 const reduction=argentArmorMultiplier(w,e)*((fx?.armorUntil??0)>t?.75:1)*(!e.aircraftTarget&&(e.armorBrokenUntil??0)>t?.7:1)*((e.burnArmorUntil??0)>t?.7:1)*(e.weakUntil>t?.92:1)*((e.weakDebuffUntil??0)>t?.85:1)*rankArmorMultiplier(w,e);
 return sylvaArmor(w,e,equipmentArmor(state,armorEntity)*Math.max(.5,reduction))*(1-Math.min(1,Math.max(0,penetration)));
}
const rankHooks:RankRuntimeHooks={hostile:isHostileToPlayer,elite:e=>isElite(e.type),priority:w=>nearestEnemy(w,w.playerX,w.playerY,[],true),projectile:addProjectile,
 damage:(w,e,raw,id,procFree=false)=>applyDamageToEnemy(w,e,raw,"#fde68a","skill",id,undefined,undefined,"area_hazard",true,true,undefined,1,[],expansionState(w.aircraft).casts[id],undefined,procFree),
 remove:recycleProjectile,blockable:isHostileBallisticProjectile,displace:displaceEnemy,effect:(w,x,y,size,rankEffect)=>emitVisual(w,{kind:"rank_effect",x,y,size,rankEffect})};

function sylvaDisplayStats(world:CombatWorld){
 const stats=getEffectiveAircraftStats(world.aircraft),opponent=world.duel?.opponent??world.mirage?.mirror?.context.world??world.duelOpponent?.context.world;
 const e=opponent?.enemies.find(e=>e.aircraftTarget?.world===world);
 return opponent&&e?{...stats,armor:sylvaArmor(opponent,e,stats.armor)}:stats;
}

/** Secondary Core damage never feeds hit/critical/kill proc loops. */
function core28Damage(w:CombatWorld,e:EnemyEntity,raw:number,row:number){
 return applyDamageToEnemy(w,e,raw,"#fde68a","core",undefined,undefined,undefined,"area_hazard",false,true,row,1,[],undefined,undefined,true);
}
function core28PrimaryHit(w:CombatWorld,e:EnemyEntity){
 const s=w.aircraft,c=s.coreState,stats=getEffectiveAircraftStats(s);
 if(hasCore(s,1)){c.stacks.syncHits=(c.stacks.syncHits??0)+1;if(c.stacks.syncHits>=6){c.stacks.syncHits=0;c.stacks.syncReady=1;}}
 if(hasCore(s,7)){c.stacks.boostHits=(c.stacks.boostHits??0)+1;if(c.stacks.boostHits>=6){c.stacks.boostHits=0;
   const angle=Math.atan2(e.y-w.playerY,e.x-w.playerX);addProjectile(w,{owner:"player",source:"core",telemetryCore:7,procFree:true,homing:true,targetId:e.id,turnRate:7,x:w.playerX,y:w.playerY-17,vx:Math.cos(angle)*480,vy:Math.sin(angle)*480,radius:3.2,rawDamage:stats.firepower,color:"#fde68a"});recordCoreMetric(s,7,"procs",1);
 }}
 if(hasCore(s,13)){
  if((c.stacks.foundationHits??0)>=5){c.stacks.foundationHits=0;core28Damage(w,e,stats.firepower,13);
   for(const other of w.enemies.slice())if(other.id!==e.id&&isHostileToPlayer(w,other)&&Math.hypot(other.x-e.x,other.y-e.y)<=70)core28Damage(w,other,stats.firepower,13);
   emitVisual(w,{kind:"explosion",x:e.x,y:e.y,size:140});recordCoreMetric(s,13,"procs",1);
  }else c.stacks.foundationHits=(c.stacks.foundationHits??0)+1;
 }
 if(hasCore(s,78)&&(isElite(e.type)||e.type==="boss")){
  c.stacks.reactorHits=(c.stacks.reactorHits??0)+1;if(c.stacks.reactorHits>=20){c.stacks.reactorHits=0;const gain=Math.min(stats.maxResource*.05,stats.maxResource-s.currentResource);s.currentResource+=gain;recordCoreMetric(s,78,"resource",gain);}
 }
 if(hasCore(s,206)&&(c.timers.heavyRoundBlast??0)<=c.time){
  c.timers.heavyRoundBlast=c.time+4;for(const other of w.enemies.slice())if(other.id!==e.id&&isHostileToPlayer(w,other)&&Math.hypot(other.x-e.x,other.y-e.y)<=60)core28Damage(w,other,stats.firepower,206);
  emitVisual(w,{kind:"explosion",x:e.x,y:e.y,size:120});recordCoreMetric(s,206,"procs",1);
 }
}
