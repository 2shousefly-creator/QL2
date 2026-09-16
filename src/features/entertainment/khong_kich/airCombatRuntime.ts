import { SKILL_CORE_VALUES as V, createSkillCoreRuntime, type SkillCoreRuntime, type MissileSalvo } from "./airCombatSkillCores";
import { createCoreSelectionEvent, getRerollCandidates, makeCoreCard, type CoreSelectionEvent } from "./airCombatCoreSelection";
import { getPlayerHitbox, getEnemyHitbox, createHitResult, segmentVsAircraft, circleVsAircraft, aircraftVsAircraft, sweepAircraft, hitboxProjectionExtent, clampHitboxToGameplayRect, rectVsAircraft, ringVsAircraft, aircraftInsideWedge } from "./airCombatHitboxes";
import { wingDamageMultiplier } from "./airCombatHitboxes";
import type { AirframeHitZone } from "./airCombatHitboxes";
import type { Allegiance, DamageDelivery } from "./airCombatStatus";
import type { HitResult, AircraftHitbox } from "./airCombatHitboxes";
import { BASIC_AMMO_KEYS } from "./airCombatAmmo";
import type { AmmoVisualKey } from "./airCombatAmmo";
import { getMissileVisual, missileRenderRotation } from "./airCombatAmmo";
import { applyPlayerStatus, addStatusMark, playerStunned, playerSkillLocked } from "./airCombatStatus";
import type { AttackMetadata, AttackTag, StatusPayload } from "./airCombatStatus";
import { bossMinCenterY } from "./airCombatHudLayout";
import { BOSS_DAMAGE_MULTIPLIER, getBossTuning, SONIC_RING_SPEED, SONIC_RING_THICKNESS, SONIC_ACTIVE_SECONDS, LANE_ACTIVE_SECONDS } from "./airCombatBoss";
import type { BossAttackState, BossMajorAttack } from "./airCombatBoss";
import { COMBAT_WAVES, createWaveQueue, isElite } from "./airCombatWaves";
import { armorPenetration, coreId, dispatchCoreEvent, hasCore, negativeStatusDuration, outgoingCoreMultiplier } from "./airCombatCoreEffects";
import type { CoreContext, CoreTarget, DamageSource } from "./airCombatCoreEffects";
import { calculateDamage, endAircraftSkill, healAircraft, finishBorrowedDuration } from "./airCombatAircraft";
import { AIR_COMBAT_WORLD, ENEMY_CONFIGS, GAMEPLAY_SAFE_RECT, SKILL_CONFIGS, } from "./airCombatConfig";
import { applyCore, applyDamageToAircraft, resolvePlayerDamage, calculateRunRank, canAcquirePlayerTarget, castSkill, clampCircleToGameplayRect, createAircraftCombatState, gainCombatXp, generateCoreChoices, getComboMultiplier, getEffectiveAircraftStats, getSkillRuntimeValues, getTargetPriority, requiredCombatXp, resolveBasicProjectileMultipliers, shouldAutoFire, tickAircraftState, } from "./airCombatEngine";
import { AirCombatHudSnapshot, AirCombatRunSummary, AircraftCombatState, AircraftId, CoreCard, EnemyType, SkillCastResult, SkillId, } from "./airCombatTypes";
export interface EnemyEntity {
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
export interface ProjectileEntity extends AttackMetadata {
    salvoId?: number;
    interceptCount?: number;
    capturedBy?: number;
    capturedMotion?: Pick<ProjectileEntity, "vx" | "vy" | "speed" | "heading" | "angularVelocity" | "homing" | "targetId" | "turnRate" | "lifetime" | "missileState" | "missileAge" | "cruiseSpeed" | "angularAcceleration" | "acceleration" | "anchorX" | "anchorY" | "fuseStarted" | "fuseRemaining" | "allowOffscreenEntry" | "corridorEdge" | "corridorSide">;
    /** Additional cannon pierce keeps the existing same-volley attenuation. */
    stabilizedPierce?: boolean;
    bounceBasis?: number;
    bounceSecondMultiplier?: number;
    grazeCandidate?:boolean; playerContact?:boolean;
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
    splashMultiplier: number;
    bounceRemaining: number;
    bounceMultiplier: number;
    hitIds: number[];
    color: string;
}
export interface DecoyEntity {
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
    fromX?: number;
    fromY?: number;
}
export interface DamageNumberEvent extends VisualEventBase {
    kind: "damage_number";
    amount: number;
    target: "player" | "enemy";
    critical: boolean;
    shielded: boolean;
}
type HealSource = "core" | "skill" | "skill_core";
export type CombatVisualEvent = DamageNumberEvent | (VisualEventBase & {
    kind: "player_heal";
    amount: number;
    healSource: HealSource;
}) | (VisualEventBase & {
    kind: "bullet_impact" | "hit" | "explosion" | "bomb" | "player_hit" | "absorb" | "lightning" | "drone_hit" | "missile_impact" | "flare_burst" | "emp_pulse" | "shield_ripple";
});
type NewVisualEvent = CombatVisualEvent extends infer E ? E extends CombatVisualEvent ? Omit<E, "id"> : never : never;
function emitVisual(world: CombatWorld, event: NewVisualEvent): void {
    world.visualEvents.push({ ...event, id: world.nextVisualId++ });
    if (world.visualEvents.length > 96)
        world.visualEvents.shift();
}
export interface TacticalCoreState {
    scraps:{id:number;x:number;y:number;until:number}[];
    fields:{id:number;x:number;y:number;until:number}[];
    grids:{id:number;a:number;b:number;until:number;raw:number;hits:Set<number>}[];
    lastWeaponHit?:{id:number;time:number}; openingHits:Set<number>;
    previousStatuses:Set<string>; hackTargets:number[]; hackEnd:number;
    hackMode?: "normal" | "elite" | "boss_stun";
}
export interface CombatWorld {
    skillCores: SkillCoreRuntime;
    coreSelectionEvent: CoreSelectionEvent | null;
    nextContinuousHealVisualAt?: number;
    tactical?:TacticalCoreState;

    threats: { enemyId: number; cost: number; until: number }[];
    scheduledAttacks: { at: number; enemyId: number; kind: "needle" | "rail" | "execution" | "clamp" | "retaliation" | "radar_followup" | "acid_cage" | "crimson_barrage" | "iron_suppression" | "acid_bombing" | "radar_bombardment"; control?:boolean; angle?: number; x?: number; y?: number }[];
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
    coreSelectionCount: number;
    currentCoreChoices: CoreCard[] | null;
    latestMessage: string | null;
    messageUntil: number;
    ended: boolean;
    pools: RuntimePools;
    random: () => number;
    visualRandom: () => number;
}
const PLAYER_TARGET_ID = 0;
// Applied on every acquisition and recycle, including generic homing/bounce bullets.
const MISSILE_DEFAULTS = {
    salvoId: undefined, interceptCount: 0, capturedBy: undefined, capturedMotion: undefined, stabilizedPierce: false, bounceBasis: undefined, bounceSecondMultiplier: undefined,
    ammoVisualKey: undefined,
    fuseStarted: false, fuseRemaining: 0,
    projectileKind: "bullet" as const, missileState: null, missileAge: 0,
    heading: 0, angularVelocity: 0, speed: 0, cruiseSpeed: 0,
    angularAcceleration: 0, acceleration: 0, anchorX: 0, anchorY: 0, smokeDistanceAccumulator: 0, secondarySmokeDistanceAccumulator: 0,
};
function circleHit(ax: number, ay: number, ar: number, bx: number, by: number, br: number): boolean {
    const dx = ax - bx;
    const dy = ay - by;
    const radius = ar + br;
    return dx * dx + dy * dy <= radius * radius;
}
function setMessage(world: CombatWorld, message: string, seconds = 1.6): void {
    world.latestMessage = message;
    world.messageUntil = world.elapsed + seconds;
}
function createCombatRandom(seed = Date.now() >>> 0): () => number {
    return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 0x100000000; };
}
export function createCombatWorld(aircraftId: AircraftId, random: () => number = createCombatRandom()): CombatWorld {
    // Separate deterministic stream: visual density must never consume combat rolls.
    let visualSeed = 0x41c6ce57;
    const visualRandom = () => {
        visualSeed = (Math.imul(visualSeed, 1664525) + 1013904223) >>> 0;
        return visualSeed / 0x100000000;
    };
    const initial = clampCircleToGameplayRect(AIR_COMBAT_WORLD.width / 2, GAMEPLAY_SAFE_RECT.bottom - 52, 10);
    const droneInitial = clampCircleToGameplayRect(initial.x - 28, initial.y + 8, 9);
    const spawnQueue = createWaveQueue(0, random);
    return {
        skillCores: createSkillCoreRuntime(), coreSelectionEvent: null,
        threats: [], scheduledAttacks: [], eliteSpecials: [], eliteResolve:0, eliteComboCooldown:9, eliteComboIndex:0,
        aircraft: createAircraftCombatState(aircraftId),
        playerX: initial.x,
        playerY: initial.y,
        visualEvents: [],
        nextVisualId: 1,
        playerInputActive: false,
        playerRadius: 9,
        playerInvulnerability: 0,
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
        pauseReasons: new Set(), waveIndex: 0, waveState: "announcement", waveTimer: 1.15, spawnQueue, spawnedInWave: 0,
        xpBudgetRemaining: COMBAT_WAVES[0].xpBudget,
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
        messageUntil: 1.5,
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
        dashCharge: 0, xp: 0, damageScale: 1, eliteWave: 0, stun: 0, burn: 0, burnDamage: 0, burnTick: 0, weakHits: 0, weakUntil: 0, lightningUntil: 0,
        shield: 0, shieldUntil: 0, shieldSource: 0, abilityCd: 0, secondaryCd: 0, tertiaryCd: 0, burst: 0, burstCd: 0, burstAngle: 0, attackCount: 0,
        targetId: null, deathHandled: false, dashRemaining: 0, dashStartX: 0, dashStartY: 0, dashEndX: 0, dashEndY: 0, hackedUntil: 0, dashAllegiance: undefined, dashCommitted: false, skillLockedUntil:0, armorBrokenUntil:0, combatMarks:{}, aegisUntil: 0, aegisReady: 0, recentDamage: [],
    };
}
function recycleEnemy(world: CombatWorld, index: number): void {
    const [enemy] = world.enemies.splice(index, 1);
    if (enemy) {
        world.threats = world.threats.filter(t => t.enemyId !== enemy.id);
        world.skillCores.enemyEffects.delete(enemy.id);
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
function recycleProjectile(world: CombatWorld, index: number): void {
    const [projectile] = world.projectiles.splice(index, 1);
    if (projectile?.salvoId) world.skillCores.salvos.find(s => s.id === projectile.salvoId)?.live.delete(projectile.id);
    // Award only when the projectile is retired: it can no longer hit later.
    if(projectile?.grazeCandidate && !projectile.playerContact && !world.ended && hasCore(world.aircraft,107)){
        const c=world.aircraft.coreState;c.stacks.graze=(c.stacks.graze??0)+1;
        if(c.stacks.graze>=6){c.stacks.graze-=6;const max=getEffectiveAircraftStats(world.aircraft).maxResource;world.aircraft.currentResource=Math.min(max,world.aircraft.currentResource+max*.1);setMessage(world,"GRAZE · +10% tài nguyên",.8);}
    }
    if (projectile && world.pools.projectiles.length < 768) {
        projectile.hitIds.length = 0;
        Object.assign(projectile, MISSILE_DEFAULTS, { targetId: null, homing: false, bigBang: false, turnRate: 0, lifetime: 0 });
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
function spawnEnemy(world: CombatWorld, type: EnemyType): EnemyEntity | null {
    if (world.enemies.length >= AIR_COMBAT_WORLD.maxEnemies)
        return null;
    const config = ENEMY_CONFIGS[type], wave = COMBAT_WAVES[world.waveIndex], enemy = acquireEnemy(world);
    const hpScale = wave.hp, armorScale = wave.armor;
    // Allocate once, at spawn; rounding remainder belongs to the final enemy.
    // The Lv30 curve stays unchanged (~9874 total); 7585 before W5 leaves ~90% of its budget.
    const xp = type === "boss" ? 0 : world.spawnQueue.length === 1 ? world.xpBudgetRemaining
        : Math.min(world.xpBudgetRemaining, Math.round(world.xpBudgetRemaining * config.combatXp / Math.max(1, world.xpWeightRemaining)));
    world.xpBudgetRemaining -= xp;
    world.xpWeightRemaining = Math.max(0, world.xpWeightRemaining - config.combatXp);
    const x = GAMEPLAY_SAFE_RECT.left + config.radius + world.random() * (GAMEPLAY_SAFE_RECT.width - config.radius * 2);
    Object.assign(enemy, { id: world.nextId++, type, x, y: GAMEPLAY_SAFE_RECT.top + config.radius, baseX: x, vx: 0, vy: config.speed, radius: config.radius,
        hp: config.baseHp * hpScale, maxHp: config.baseHp * hpScale, armor: config.baseArmor * armorScale, age: 0, fireCooldown: 1.2 + world.random() * .8,
        phaseSeed: world.random() * Math.PI * 2, wave: wave.normal, dashCharge: 1.2, xp,
        damageScale: wave.damage, eliteWave: wave.elite, stun: 0, burn: 0, burnDamage: 0, burnTick: 0, weakHits: 0, weakUntil: 0, lightningUntil: 0,
        shield: 0, shieldUntil: 0, shieldSource: 0, abilityCd: type === "jammer" ? 4.5 : type === "iron_fortress" ? 10 : 7.5, secondaryCd: 10, tertiaryCd: 10,
        burst: 0, burstCd: 0, burstAngle: 0, attackCount: 0, targetId: null, deathHandled: false, dashRemaining: 0, dashStartX: 0, dashStartY: 0, dashEndX: 0, dashEndY: 0,
        hackedUntil: 0, dashAllegiance: undefined, dashCommitted: false, skillLockedUntil:0, armorBrokenUntil:0, combatMarks:{}, aegisUntil: 0, aegisReady: 0, bossAttack: undefined, kamikazeState: type === "kamikaze" ? "approach" : undefined, lockedX: 0, lockedY: 0, dashDirX: 0, dashDirY: 1, dashTravelled: 0, dashPlannedDistance: 0, stateTimer: 0, attackAge: 0, missedDashCount: 0, airframeRotation: Math.PI, hitResolved: false, executionRecovery: 0, retaliationReady: false, elitePatternCd:type==="elite"?7.8:type==="iron_fortress"?8.5:8, elitePatternIndex:0, eliteSequenceUntil:0 });
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
        enemy.bossAttack = { majorAttack: null, majorCooldown: 9, majorAge: 0, sequenceStep: 0,
            fanCount: 0, missilesPending: 0, missileIndex: 0, missileCooldown: 0,
            missileTuning: getBossTuning(1), dashDamage: 0, dashHitPlayer: false };
        setMessage(world, "PHÁO ĐÀI BAY LEVIATHAN X-99", 2.5);
    }
    world.enemies.push(enemy);
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
        const replace = values.owner === "enemy" && values.criticalAttack
            ? (world.projectiles.findIndex(p => p.suppressive) >= 0 ? world.projectiles.findIndex(p => p.suppressive) : world.projectiles.findIndex(p => p.owner === "enemy" && !p.criticalAttack && !p.homing)) : -1;
        if (replace < 0) return null;
        recycleProjectile(world, replace);
    }
    const projectile = acquireProjectile(world);
    Object.assign(projectile, {
        ...MISSILE_DEFAULTS,
        id: world.nextId++,
        owner: values.owner,
        allegiance: values.allegiance ?? (values.owner === "enemy" ? enemyAllegiance(world,world.enemies.find(e=>e.id===values.sourceEnemyId)) : "player"),
        delivery:values.delivery??"direct_projectile", grazeCandidate:false, playerContact:false,
        appearance: values.appearance, ammoVisualKey: values.ammoVisualKey,
        sourceEnemyId: values.sourceEnemyId, sourceEnemyType: values.sourceEnemyType, attackTag: values.attackTag, majorBossAttack: values.majorBossAttack, payload: values.payload,
        criticalAttack: values.criticalAttack ?? false,
        suppressive: values.suppressive ?? false, allowOffscreenEntry: values.allowOffscreenEntry ?? false, corridorEdge: values.corridorEdge, corridorSide: values.corridorSide,
        salvoId: values.salvoId, interceptCount: 0, capturedBy: undefined, stabilizedPierce: values.stabilizedPierce,
        bounceBasis: values.bounceBasis, bounceSecondMultiplier: values.bounceSecondMultiplier,
        source: values.source ?? "weapon", skillId: values.skillId, lifetime: values.lifetime ?? 6,
        volleyId: values.volleyId ?? 0, volleyHits: values.volleyHits, initialDamage: values.initialDamage ?? values.rawDamage,
        previousX: values.x, previousY: values.y, bigBang: values.bigBang ?? false,
        x: values.x,
        y: values.y,
        vx: values.vx,
        vy: values.vy,
        radius: values.radius ?? 3,
        rawDamage: values.rawDamage,
        homing: values.homing ?? false,
        targetId: values.targetId ?? null,
        turnRate: values.turnRate ?? 0,
        penetrationRemaining: values.penetrationRemaining ?? 0,
        penetrationMultiplier: values.penetrationMultiplier ?? 0,
        splashMultiplier: values.splashMultiplier ?? 0,
        bounceRemaining: values.bounceRemaining ?? 0,
        bounceMultiplier: values.bounceMultiplier ?? 0,
        color: values.color ?? (values.owner === "enemy" ? "#fb7185" : "#67e8f9"),
    });
    if (values.projectileKind === "missile" || values.projectileKind === "bigbang") {
        const heavy = values.projectileKind === "bigbang";
        Object.assign(projectile, {
            projectileKind: values.projectileKind, missileState: "loiter", targetId: null, homing: false,
            heading: Math.atan2(values.vy, values.vx), cruiseSpeed: Math.hypot(values.vx, values.vy),
            turnRate: heavy ? 1.8 : values.turnRate ?? 3.2,
            angularAcceleration: heavy ? 4 : values.skillId === "missile_swarm" ? 12 : 10,
            acceleration: heavy ? 65 : 300,
            anchorX: values.anchorX ?? values.x - world.playerX,
            anchorY: values.anchorY ?? values.y - world.playerY,
            vx: 0, vy: 0,
        });
    }
    projectile.hitIds.length = 0;
    if(projectile.allegiance==="friendly_hacked")projectile.color="#67e8f9";
    world.projectiles.push(projectile);
    return projectile;
}
function nearestEnemy(world: CombatWorld, x: number, y: number, excludedIds: readonly number[] = [], priority = false): EnemyEntity | null {
    let selected: EnemyEntity | null = null;
    let best = Number.POSITIVE_INFINITY;
    for (const enemy of world.enemies) {
        if (excludedIds.includes(enemy.id) || !isHostileToPlayer(world,enemy))
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
    if (aircraftId === "breaker")
        return empowered ? "#fde68a" : "#fb923c";
    if (aircraftId === "phantom")
        return empowered ? "#ddd6fe" : "#a78bfa";
    return empowered ? "#bae6fd" : "#22d3ee";
}
function fireBasic(world: CombatWorld): void {
    const state = world.aircraft, stats = getEffectiveAircraftStats(state);
    state.basicShotsFired++;
    const empowered=(state.coreState.stacks.linkedShots??0)>0;
    if(empowered)state.coreState.stacks.linkedShots--;
    const reappearance = (state.coreState.stacks.reappearanceShots || 0) > 0;
    if (reappearance) state.coreState.stacks.reappearanceShots--;
    const bulletSpeed=(hasCore(state,111)?960:480) * (reappearance ? 1 + V.reappearanceSpeedBonus : 1);
    const context = coreContext(world);
    dispatchCoreEvent("basic", context);
    const sweeping = (state.activeEffects.sweeping_cannon || 0) > 0;
    const afterburner = (state.activeEffects.afterburner || 0) > 0;
    const multipliers = resolveBasicProjectileMultipliers(state, state.basicShotsFired);
    const volleyId = world.nextId++, volleyHits = sweeping ? new Map<number, number>() : undefined;
    const source: DamageSource = "basic";
    const spawn = (multiplier: number, offset: number, extra = false) => {
        const angle = -Math.PI / 2 + offset * (sweeping ? Math.PI / 36 : 0.06);
        const ricochet = hasCore(state, 80) && world.random() < .30;
        addProjectile(world, { owner: "player", source: extra ? "basic" : source, ammoVisualKey: BASIC_AMMO_KEYS[state.aircraftId], skillId: sweeping && !extra ? "sweeping_cannon" : undefined,
            x: world.playerX + offset * 4, y: world.playerY - 17, vx: Math.cos(angle) * bulletSpeed * (sweeping && !extra && hasCore(state,139) ? 1 + V.cannonSpeedBonus : 1), vy: Math.sin(angle) * bulletSpeed * (sweeping && !extra && hasCore(state,139) ? 1 + V.cannonSpeedBonus : 1), radius: 3.2,
            rawDamage: stats.firepower * multiplier * context.rawMultiplier * (empowered?1.8:1) * (reappearance ? V.reappearanceDamage : 1), volleyId, volleyHits: extra ? undefined : volleyHits,
            penetrationRemaining: (hasCore(state, 89) ? 3 : 0) + (sweeping && !extra && hasCore(state,139) ? 1 : 0),
            stabilizedPierce: sweeping && !extra && hasCore(state,139),
            bounceBasis: stats.firepower * multiplier * context.rawMultiplier * (empowered?1.8:1) * (reappearance?V.reappearanceDamage:1),
            bounceSecondMultiplier: afterburner && hasCore(state,127) ? V.bounceSecond : undefined,
            bounceRemaining: afterburner ? 2 : ricochet ? 1 : 0, bounceMultiplier: afterburner ? hasCore(state,127) ? V.bounceFirst : .50 : .40,
            color: playerProjectileColor(state.aircraftId, multiplier > 1.1) });
    };
    multipliers.forEach((multiplier, i) => spawn(multiplier, i - (multipliers.length - 1) / 2));
    if (context.extraShot)
        spawn(context.extraShot, 1, true);
}
function fireDrone(world: CombatWorld): void {
    const target = world.enemies.find(e => e.id === world.droneTargetId && isHostileToPlayer(world,e)) || nearestEnemy(world, world.droneX, world.droneY, [], true);
    if (!target)
        return;
    world.droneTargetId = target.id;
    const stats = getEffectiveAircraftStats(world.aircraft), ratio = getSkillRuntimeValues(world.aircraft, "escort_drone").damageMultiplier;
    const angle = Math.atan2(target.y - world.droneY, target.x - world.droneX);
    addProjectile(world, { owner: "drone", source: "skill", skillId: "escort_drone", x: world.droneX, y: world.droneY,
        vx: Math.cos(angle) * 390, vy: Math.sin(angle) * 390, rawDamage: stats.firepower * ratio, radius: 2.8, color: "#d8b4fe" });
}
function chooseEnemyTarget(world: CombatWorld, homing: boolean, attacker?:EnemyEntity): number | null {
    if(attacker && enemyAllegiance(world,attacker)==="friendly_hacked")return nearestEnemy(world,attacker.x,attacker.y,[attacker.id],true)?.id??null;
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
    if(unit)return unit;
    const decoy = world.decoys.find((candidate) => candidate.id === targetId && candidate.active);
    return decoy ? { x: decoy.x, y: decoy.y } : null;
}
function fireEnemyBullet(world: CombatWorld, enemy: EnemyEntity, angle: number, speed: number, rawDamage: number, homing = false, tag: AttackTag = "basic", allegiance?:Allegiance): void {
    const adjustedSpeed = speed;
    addProjectile(world, {
        owner: "enemy",
        allegiance, sourceEnemyId: enemy.id, sourceEnemyType: enemy.type, attackTag: tag, majorBossAttack: enemy.type === "boss" && tag !== "boss_wing" && tag !== "basic",
        appearance: enemy.type === "boss" ? "boss" : homing ? "dangerous" : undefined,
        criticalAttack: enemy.type === "boss" || isElite(enemy.type) || homing,
        allowOffscreenEntry: tag === "kamikaze_dash",
        x: enemy.x,
        y: enemy.y + enemy.radius * 0.65,
        vx: Math.cos(angle) * adjustedSpeed,
        vy: Math.sin(angle) * adjustedSpeed,
        rawDamage,
        radius: homing ? 5 : 4,
        homing,
        targetId: chooseEnemyTarget(world, homing, enemy),
        turnRate: homing ? 1.1 : 0,
        color: homing ? "#fbbf24" : "#fb7185",
    });
}
function aimAtCurrentTarget(world: CombatWorld, enemy: EnemyEntity): number | null {
    const id = chooseEnemyTarget(world, false, enemy);
    const target = targetPosition(world, id);
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
    if (world.scheduledAttacks.length < 32) world.scheduledAttacks.push({ ...extra, at: world.elapsed+delay, enemyId: enemy.id, kind });
}
type ElitePattern = NonNullable<WarningZone["elitePattern"]>;
const ELITE_PATTERNS:readonly string[]=["crimson_barrage","iron_suppression","acid_bombing","radar_bombardment"];
function eliteResolveStacks(world:CombatWorld,enemy:EnemyEntity):number {
    return COMBAT_WAVES[world.waveIndex].elite&&isElite(enemy.type)&&isHostileToPlayer(world,enemy)?world.eliteResolve:0;
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
    if(!COMBAT_WAVES[world.waveIndex].elite)return true;
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
    // Intent has no allegiance yet; it acquires ownership when its warning spawns.
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
    const damage=ENEMY_CONFIGS[enemy.type].projectileDamage*enemy.damageScale;
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
    const wave=COMBAT_WAVES[world.waveIndex];
    if(!wave.elite||world.waveState!=="combat")return;
    for(const enemy of world.enemies){
        if(enemy.hp<=0||!isElite(enemy.type)||enemy.type==="acid_bomber"||enemy.stun>0||(enemy.skillLockedUntil??0)>world.elapsed)continue;
        enemy.elitePatternCd=(enemy.elitePatternCd??elitePatternInterval(enemy))-dt;
        const kind=elitePatternFor(enemy);
        if(kind&&enemy.elitePatternCd<=0)queueEliteSpecial(world,enemy,kind,0,false);
    }
    world.eliteComboCooldown=Math.max(0,world.eliteComboCooldown-dt);
    if(world.eliteComboCooldown>0)return;
    const live=world.enemies.filter(e=>isElite(e.type)&&isHostileToPlayer(world,e)&&e.stun<=0&&(e.skillLockedUntil??0)<=world.elapsed).sort((a,b)=>a.id-b.id);
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
        } else for (const offset of [-.07,.07]) fireEnemyBullet(world,enemy,aim+offset,285,damage*.65,false,"needle_pair");
    } else if (enemy.type === "fighter") {
        for (const side of [-1,1]) {
            const x=enemy.x+side*30, y=enemy.y+12, angle=Math.atan2(target.y-y,target.x-x);
            addProjectile(world,{owner:"enemy",x,y,vx:Math.cos(angle)*220,vy:Math.sin(angle)*220,rawDamage:damage*.8,
                sourceEnemyId:enemy.id,sourceEnemyType:enemy.type,attackTag:"scissor",color:"#ff475f",radius:3});
        }
    } else if (enemy.type === "attacker") {
        const gap=1+Math.floor(world.random()*5);
        for(let i=0;i<7;i++) if(i!==gap) fireEnemyBullet(world,enemy,aim+(i-3)*.22,160,damage*.75,false,"suppressive_gate");
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
    if (attack.payload) { applyPlayerStatus(state,attack.payload); emitVisual(world,{kind:"emp_pulse",x:world.playerX,y:world.playerY,size:48}); }
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
    if(enemy.type==="boss" && world.bossPhase>=3 && attack.majorBossAttack && addStatusMark(state,"hunted",5,enemy.id)>=2) {
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
        const target=targetPosition(world,chooseEnemyTarget(world,false,enemy));
        if(!target)continue;
        const damage=ENEMY_CONFIGS[enemy.type].projectileDamage*enemy.damageScale;
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
        if(a.kind==="execution") { addLineWarning(world,enemy,"dash",target.x,target.y,.7,ENEMY_CONFIGS[enemy.type].collisionDamage*enemy.damageScale); setMessage(world,"CRIMSON · LAO HÀNH QUYẾT",.7); }
        if(a.kind==="clamp") addWarning(world,"shock_clamp",target.x,target.y,44,.8,damage*.65,"enemy",enemy.id,{sourceEnemyType:enemy.type,attackTag:"shock_clamp",payload:{stun:enemy.eliteWave===2?1.75:1.25}});
        if(a.kind==="retaliation") addWarning(world,"retaliation",enemy.x,enemy.y,35,.5,damage,"enemy",enemy.id,{sourceEnemyType:enemy.type,attackTag:"burst"});
        if(a.kind==="radar_followup") { const aim=aimAtCurrentTarget(world,enemy); if(aim!==null) for(const offset of [-.3,0,.3]) fireEnemyBullet(world,enemy,aim+offset,180,damage*.8,true,"radar_lock"); }
    }
}
function fireEnemy(world: CombatWorld, enemy: EnemyEntity): void {
    const config = ENEMY_CONFIGS[enemy.type], damage = config.projectileDamage * enemy.damageScale, aim = aimAtCurrentTarget(world, enemy);
    const target = targetPosition(world, chooseEnemyTarget(world, false, enemy));
    if(enemyAllegiance(world,enemy)==="friendly_hacked"&&!target)return;
    if(COMBAT_WAVES[world.waveIndex].elite&&(enemy.type==="acid_bomber"||enemy.type==="radar_hunter")){
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
            }
            if (enemy.type === "elite" && enemy.attackCount % 2 === 0 && enemy.eliteWave === 1)
                fireFan(world, enemy, 5, 80 * enemy.damageScale, aim ?? Math.PI / 2);
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
                fireEnemyBullet(world, enemy, aim - .2, 155, 120 * enemy.damageScale, true, "radar_lock");
                fireEnemyBullet(world, enemy, aim + .2, 155, 120 * enemy.damageScale, true, "radar_lock");
            }
            else if (target) {
                addLineWarning(world, enemy, "rail", target.x, target.y, 1.2, damage);
                if (enemy.type === "radar_hunter" && enemy.attackCount % 4 === 3)
                    enemy.secondaryCd = 1.75; // Rail resolves at 1.2s, then one staggered missile.
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
function fireFan(world: CombatWorld, enemy: EnemyEntity, count: number, damage: number, angle = Math.PI / 2, spacing = .19, speed = 145, tag: AttackTag = enemy.type === "boss" ? "boss_fan" : "burst"): boolean {
    if(enemy.type==="boss" && !reserveBossVolley(world,count))return false;
    for (let i = 0; i < count; i++)
        fireEnemyBullet(world, enemy, angle + (i - (count - 1) / 2) * spacing, speed, damage, false, tag);
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
    const launch = clampCircleToGameplayRect(world.playerX + side * 32, world.playerY - 12, 4.5);
    const p = addProjectile(world, {owner:"player",source:"skill",skillId:"missile_swarm",salvoId:salvo.id,
        x:launch.x,y:launch.y,vx:0,vy:-260,radius:4.5,rawDamage:getEffectiveAircraftStats(world.aircraft).firepower*values.damageMultiplier,
        lifetime:6,projectileKind:"missile",anchorX:side*32,anchorY:-12,turnRate:3.2,color:"#fb923c"});
    if (!p) return false;
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
    }
    world.missilesPending = world.skillCores.salvos.reduce((n,s) => n+s.pending,0);
}
function queueMissileSwarm(world: CombatWorld): void {
    const count = getSkillRuntimeValues(world.aircraft,"missile_swarm").count;
    world.skillCores.salvos.push({id:world.nextId++,pending:count,total:count,launchIndex:0,pairIds:[],live:new Set(),data:0});
    updateMissileSalvo(world,0);
}
function addDecoy(world: CombatWorld, clone: boolean, side = 0, lane = 0): void {
    if (world.decoys.length >= 64)
        return;
    const duration = getSkillRuntimeValues(world.aircraft, clone ? "invisibility" : "decoy").duration;
    const decoy = world.pools.decoys.pop() || {} as DecoyEntity;
    Object.assign(decoy, { id: world.nextId++, x: world.playerX, y: world.playerY, radius: clone ? 12 : 6, remaining: duration, life: duration, flightAge: 0, active: clone,
        originX: world.playerX, originY: world.playerY, side, lane, clone, castId:clone?world.skillCores.invisibilityCastId:world.skillCores.decoyCastId, volleyId:world.skillCores.decoyVolleyId, clonePhase:undefined, dashTarget:undefined });
    world.decoys.push(decoy);
}
function updateDecoySalvo(world: CombatWorld, dt: number): void {
    if (world.decoyVolleys <= 0)
        return;
    world.decoyVolleyCd -= dt;
    while (world.decoyVolleys > 0 && world.decoyVolleyCd <= 0) {
        world.skillCores.decoyVolleyId = world.nextId++;
        world.skillCores.volleyHits.set(world.skillCores.decoyVolleyId,new Set());
        for (const side of [-1, 1])
            for (let lane = 0; lane < 5; lane++)
                addDecoy(world, false, side, lane);
        world.decoyVolleys--;
        world.decoyVolleyCd += .75;
        if (world.decoyVolleys === 0 && hasCore(world.aircraft, 21))
            world.aircraft.coreState.timers.decoyCounter = world.aircraft.coreState.time + 4;
    }
}
function stopAllSkills(world: CombatWorld): void {
    for (const id of SKILL_IDS)
        endAircraftSkill(world.aircraft, id);
    world.missilesPending = 0;
    world.skillCores = createSkillCoreRuntime();
    world.decoyVolleys = 0;
    world.laserCharge = 0;
    world.laserRemaining = 0;
    world.laserTicksRemaining = 0;
    world.dashRemaining = 0;
    for(const key of ["cloneEndPending","shieldEmpPending","reappearanceShots","thermalMaintained","tacticalData","shieldRefund"])delete world.aircraft.coreState.stacks[key];
    for (const key of ["decoyCounter", "shieldArmor", "hawkRage", "thermalCover", "activeCooling", "tacticalData", "electronicGuard"])
        delete world.aircraft.coreState.timers[key];
    while (world.decoys.length)
        world.pools.decoys.push(world.decoys.pop()!);
    finishBorrowedDuration(world.aircraft,"decoy");
    for (let i = world.projectiles.length - 1; i >= 0; i--)
        if (world.projectiles[i].skillId || world.projectiles[i].source === "skill" || world.projectiles[i].source === "burn")
            recycleProjectile(world, i);
    for (const enemy of world.enemies) {
        enemy.burn = 0;
        enemy.stun = 0;
    }
}
const SKILL_IDS = Object.keys(SKILL_CONFIGS) as SkillId[];
export function castWorldSkill(world: CombatWorld, skillId: SkillId): SkillCastResult {
    if (playerSkillLocked(world.aircraft) || world.ended || world.pauseReasons.size || world.pendingCoreSelections || world.currentCoreChoices)
        return { cast: false, reason: "invalid", resourceSpent: 0 };
    const result = castSkill(world.aircraft, skillId);
    if (!result.cast)
        return result;
    if (result.toggledOff) {
        world.droneTargetId = null;
        setMessage(world, `${SKILL_CONFIGS[skillId].name.toUpperCase()} · KẾT THÚC`, 1);
        return result;
    }
    const values = getSkillRuntimeValues(world.aircraft, skillId);
    dispatchCoreEvent("skillCast", coreContext(world, { skillId }));
    activateTacticalCores(world);
    if(world.ended)return result;
    if (hasCore(world.aircraft, 93))
        for (const id of SKILL_IDS)
            if (id !== skillId && (world.aircraft.cooldowns[id] || 0) > 0)
                world.aircraft.cooldowns[id] = Math.max(0, world.aircraft.cooldowns[id]! - SKILL_CONFIGS[id].cooldown * .15);
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
            addProjectile(world, { owner: "player", source: "skill", skillId, bigBang: true, projectileKind: "bigbang", lifetime: 3,
                x: world.playerX, y: world.playerY - 20, vx: 0, vy: -58, radius: 9, rawDamage: getEffectiveAircraftStats(world.aircraft).firepower * values.damageMultiplier, color: "#fbbf24" });
            break;
        case "focus_laser":
            world.laserCharge = values.charge;
            world.laserRemaining = values.duration;
            world.laserTicksRemaining = Math.round(values.duration / .25);
            world.laserTickCooldown = .25;
            break;
        case "invisibility": {
            world.skillCores.invisibilityCastId=world.nextId++;
            addDecoy(world, true);
            world.dashRemaining = .16;
            world.dashStartX = world.playerX;
            world.dashStartY = world.playerY;
            const end = clampHitboxToGameplayRect(world.playerX + world.moveDirectionX * 88, world.playerY + world.moveDirectionY * 88, getPlayerHitbox(world));
            world.dashEndX = end.x;
            world.dashEndY = Math.min(end.y, AIR_COMBAT_WORLD.height - AIR_COMBAT_WORLD.playerBottomClearance);
            for (const p of world.projectiles)
                if (p.owner === "enemy" && p.homing && p.targetId === PLAYER_TARGET_ID)
                    p.targetId = chooseEnemyTarget(world, true);
            break;
        }
        case "escort_drone": {
            droneNavigation.delete(world);
            const point = clampCircleToGameplayRect(world.playerX - 28, world.playerY + 8, 9);
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
    world.playerInputActive = active;
}
// Apply each coalesced pointer segment immediately. Subdivision checks the full
// displacement without advancing time, limiting speed, or changing invulnerability.
export function movePlayerByDelta(world: CombatWorld, dx: number, dy: number): void {
    if (playerStunned(world.aircraft) || !world.playerInputActive || world.pauseReasons.size || world.ended || world.currentCoreChoices || world.pendingCoreSelections > 0 ||
        !Number.isFinite(dx) || !Number.isFinite(dy))
        return;
    const startX = world.playerX;
    const startY = world.playerY;
    const end = clampHitboxToGameplayRect(startX + dx, startY + dy, getPlayerHitbox(world));
    // Common visual clearance for all aircraft: the tail and both bars stay on-screen.
    end.y = Math.min(end.y, AIR_COMBAT_WORLD.height - AIR_COMBAT_WORLD.playerBottomClearance);
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
    for (let step = 1; step <= steps; step++) {
        world.playerX = startX + (end.x - startX) * step / steps;
        world.playerY = startY + (end.y - startY) * step / steps;
        collectScrap(world);
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
            if (p.owner === "enemy" && p.allegiance!=="friendly_hacked" && segmentVsAircraft(p.x,p.y,p.x,p.y,p.radius,getPlayerHitbox(world),projectileContact).hit) {
                if(p.projectileKind==="boss_missile")emitVisual(world,{kind:"missile_impact",x:p.x,y:p.y,size:42,missileFamily:"boss"});
                p.playerContact=true;
                hitPlayer(world, p.rawDamage, "projectile", p, projectileContact);
                recycleProjectile(world, index);
            }
        }
        for (const warning of world.warnings) hitBossWarningPlayer(world, warning);
        updateEnemyPlayerCollisions(world);
    }
    if (world.aircraft.currentHp <= 0)
        world.ended = true;
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
    const target = world.enemies.find(enemy => enemy.id === world.droneTargetId && isHostileToPlayer(world,enemy))
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
    world.droneHp = Math.min(newMax, world.droneHp + Math.max(0, newMax - world.droneMaxHp) + stats.hpRegen * ratio * dt);
    world.droneMaxHp = newMax;
    world.droneArmor = stats.armor * ratio;
    world.droneInvulnerability = Math.max(0, world.droneInvulnerability - dt);
}
function clearHostileObjects(world: CombatWorld): void {
    world.threats.length=0;world.scheduledAttacks.length=0;world.eliteSpecials.length=0;
    for (let i = world.projectiles.length - 1; i >= 0; i--)
        if (world.projectiles[i].owner === "enemy")
            recycleProjectile(world, i);
    for (let i = world.warnings.length - 1; i >= 0; i--)
        if (world.warnings[i].owner === "enemy") world.warnings.splice(i, 1);
}
function enterCountdownIfClear(world: CombatWorld): void {
    if (world.ended || world.waveState !== "combat" || world.spawnQueue.length || world.enemies.length)
        return;
    clearHostileObjects(world);
    world.waveState = "countdown";
    world.waveTimer = 3;
    world.latestMessage = null;
}
function updateEncounter(world: CombatWorld, dt: number): void {
    if (world.waveState !== "combat") {
        world.waveTimer = Math.max(0, world.waveTimer - dt);
        if (world.waveTimer > 0) return;
        if (world.waveState === "countdown") {
            if (!COMBAT_WAVES[world.waveIndex + 1]) return;
            world.waveIndex++;
            world.spawnQueue = createWaveQueue(world.waveIndex, world.random);
            world.xpBudgetRemaining = COMBAT_WAVES[world.waveIndex].xpBudget;
            world.xpWeightRemaining = world.spawnQueue.reduce((sum, type) => sum + ENEMY_CONFIGS[type].combatXp, 0);
            world.spawnedInWave = 0;
            world.eliteResolve=0;world.eliteComboIndex=0;world.eliteComboCooldown=COMBAT_WAVES[world.waveIndex].elite===2?7:9;world.eliteCorridorSide=undefined;
            setMessage(world, COMBAT_WAVES[world.waveIndex].label.toUpperCase(), 1.15);
        }
        // The wave banner is cosmetic: spawn and simulation resume immediately at zero.
        world.waveState = "combat";
        world.enemySpawnCooldown = 0;
    }
    const wave = COMBAT_WAVES[world.waveIndex];
    if (!world.spawnQueue.length && !world.enemies.length && !world.bossDefeated) {
        enterCountdownIfClear(world);
        return;
    }
    world.enemySpawnCooldown -= dt;
    if (world.spawnQueue.length && world.enemies.length < wave.cap && world.enemySpawnCooldown <= 0) {
        if (spawnEnemy(world, world.spawnQueue[0])) {
            world.spawnQueue.shift();
            world.spawnedInWave++;
            world.enemySpawnCooldown = wave.interval;
        }
    }
}
function updateBossPhase(world: CombatWorld): void {
    const boss = world.enemies.find(e => e.type === "boss");
    if (!boss)
        return;
    const ratio = boss.hp / boss.maxHp, next = ratio >= .7 ? 1 : ratio >= .35 ? 2 : 3;
    if (next !== world.bossPhase) {
        world.bossPhase = next;
        setMessage(world, `LEVIATHAN · GIAI ĐOẠN ${next}`, 2);
    }
    if (ratio < .15)
        boss.aegisUntil = 0;
}
function updateEnemyAbilities(world: CombatWorld, enemy: EnemyEntity, dt: number): void {
    enemy.abilityCd -= dt;
    enemy.secondaryCd -= dt;
    enemy.tertiaryCd -= dt;
    if((enemy.skillLockedUntil??0)>world.elapsed)return;
    if (enemy.type === "jammer" && enemy.abilityCd <= 0) {
        for (const ally of world.enemies)
            if (ally.shieldSource === enemy.id) {
                ally.shield = 0;
                ally.shieldUntil = 0;
            }
        const allies = world.enemies.filter(e => e.id !== enemy.id && e.hp > 0 && enemyAllegiance(world,e)===enemyAllegiance(world,enemy) && Math.hypot(e.x - enemy.x, e.y - enemy.y) < 240);
        allies.sort((a, b) => Number(!["attacker", "bomber", "sniper"].includes(a.type)) - Number(!["attacker", "bomber", "sniper"].includes(b.type)) || Math.hypot(a.x - enemy.x, a.y - enemy.y) - Math.hypot(b.x - enemy.x, b.y - enemy.y));
        if(!allies[0]&&enemyAllegiance(world,enemy)==="friendly_hacked")world.aircraft.coreState.shields[`jammer:${enemy.id}`]={amount:getEffectiveAircraftStats(world.aircraft).maxHp*.25,until:world.aircraft.coreState.time+3};
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
    addWarning(world,"emp",world.playerX,world.playerY,radius,warning,140,"enemy",enemy.id,{sourceEnemyType:"boss",attackTag:"boss_emp",majorBossAttack:true,payload});
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
    const p = addProjectile(world, { owner: "enemy", appearance: "boss", criticalAttack: true, x: enemy.x + side * 30, y: enemy.y + 20,
        vx: 0, vy: 0, rawDamage: tuning.missile, radius: 5, homing: true,
        targetId: chooseEnemyTarget(world, true), turnRate: side<0?(world.bossPhase>=3?1.2:1.15):(world.bossPhase>=3?.7:.75), lifetime: 4.5, color: "#ff526e", sourceEnemyId: enemy.id, sourceEnemyType: "boss", attackTag: "boss_missile", majorBossAttack: true });
    if (!p) return;
    Object.assign(p, { projectileKind: "boss_missile", missileState: "loiter", heading,
        cruiseSpeed: (side<0?tuning.missileSpeed:world.bossPhase>=3?245:225) * tuning.speedScale, speed: 0, acceleration: 220 });
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
            addProjectile(world,{owner:"enemy",appearance:"boss",criticalAttack:true,sourceEnemyId:enemy.id,sourceEnemyType:"boss",attackTag:"boss_crossfire",majorBossAttack:true,
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
        addProjectile(world,{owner:"enemy",appearance:"boss",suppressive:true,x,y,vx:Math.cos(angle)*150,vy:Math.sin(angle)*150,radius:3,
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
    return enemy && enemy.type!=="boss" && (enemy.hackedUntil??0)>world.elapsed ? "friendly_hacked" : "hostile";
}
export const isHostileToPlayer=(world:CombatWorld,e:EnemyEntity)=>e.hp>0 && enemyAllegiance(world,e)==="hostile";
/** Shared live value for Core 118 damage and its status badge; no cap. */
export function crowdDamageBonus(world: CombatWorld): number {
    let hostile = 0, friendly = 1 + Number(world.aircraft.droneActive);
    for (const enemy of world.enemies) if (enemy.hp > 0) {
        if (isHostileToPlayer(world, enemy)) hostile++;
        else friendly++;
    }
    return Math.max(0, hostile - friendly) * .015;
}
function canAttackEnemy(world:CombatWorld,allegiance:Allegiance,e:EnemyEntity,sourceId?:number):boolean {
    return e.hp>0 && e.id!==sourceId && (allegiance==="hostile" ? enemyAllegiance(world,e)==="friendly_hacked" : isHostileToPlayer(world,e));
}
function tacticalState(world:CombatWorld):TacticalCoreState {
    return world.tactical??={scraps:[],fields:[],grids:[],openingHits:new Set(),previousStatuses:new Set(),hackTargets:[],hackEnd:0};
}
const ordinaryHostileBullet=(p:ProjectileEntity)=>p.owner==="enemy" && p.allegiance!=="friendly_hacked" && p.projectileKind==="bullet" && !p.homing && p.attackTag!=="rail";
function cBank(state:AircraftCombatState,gain:number):void {state.coreState.stacks.antimatter=Math.min(6,(state.coreState.stacks.antimatter??0)+gain);}
function recordCrossfire(world:CombatWorld,e:EnemyEntity):void {
    if(!hasCore(world.aircraft,112))return;
    const t=tacticalState(world),last=t.lastWeaponHit;
    if(last && last.id!==e.id && world.elapsed-last.time<=.75 && t.grids.length<32 && world.enemies.some(a=>a.id===last.id&&isHostileToPlayer(world,a)))
        t.grids.push({id:world.nextId++,a:last.id,b:e.id,until:world.elapsed+1.5,raw:getEffectiveAircraftStats(world.aircraft).firepower*.9,hits:new Set()});
    t.lastWeaponHit={id:e.id,time:world.elapsed};
}
function activateTacticalCores(world:CombatWorld):void {
    const state=world.aircraft,t=tacticalState(world),c=state.coreState;
    if(hasCore(state,114))c.stacks.linkedShots=3;
    if(hasCore(state,119)){if(t.fields.length>=32)t.fields.shift();t.fields.push({id:world.nextId++,x:world.playerX,y:world.playerY,until:world.elapsed+3});}
    const units=c.stacks.antimatter??0;
    if(hasCore(state,121)&&units>0){
        c.stacks.antimatter=0;
        const raw=getEffectiveAircraftStats(state).firepower*units;
        emitVisual(world,{kind:"emp_pulse",x:world.playerX,y:world.playerY,size:900});
        c.timers.antimatterWave=c.time+.65;
        for(const e of world.enemies)if(isHostileToPlayer(world,e))applyDamageToEnemy(world,e,raw,"#a5f3fc","core",undefined,undefined,undefined,"shockwave",false);
        resolveDeathsAndEffects(world);
    }
}
function activeNegativeStatuses(world:CombatWorld):Set<string> {
    const s=world.aircraft.status,now=world.aircraft.coreState.time,result=new Set<string>();
    for(const key of ["stunnedUntil","skillLockedUntil","resourceJammedUntil","armorBrokenUntil","regenDisabledUntil"] as const)if(s[key]>now)result.add(key);
    for(const [key,mark] of Object.entries(s.marks))if(mark&&mark.until>now)result.add(key);
    if((world.aircraft.coreState.timers.acidArmor??0)>now)result.add("acidArmor");
    return result;
}
function observeComeback(world:CombatWorld):void {
    const t=tacticalState(world),active=activeNegativeStatuses(world);
    if(hasCore(world.aircraft,116)&&[...t.previousStatuses].some(key=>!active.has(key)))world.aircraft.coreState.timers.comeback=world.aircraft.coreState.time+4;
    t.previousStatuses=active;
}
function rearmAllegiance(world:CombatWorld,e:EnemyEntity):void {
    world.threats=world.threats.filter(t=>t.enemyId!==e.id);
    delete world.aircraft.coreState.shields[`jammer:${e.id}`];
    for(const ally of world.enemies)if(ally.shieldSource===e.id&&enemyAllegiance(world,ally)!==enemyAllegiance(world,e)){ally.shield=0;ally.shieldUntil=0;}
    // Warnings/hazards/dashes already committed retain their ownership and timing.
    const target=targetPosition(world,chooseEnemyTarget(world,true,e));
    // A burst is a sequence of newly spawned attacks; subsequent shots retarget.
    if(target){
        e.burstAngle=Math.atan2(target.y-e.y,target.x-e.x);
        if(e.kamikazeState==="charge"){e.lockedX=target.x;e.lockedY=target.y;}
    }
}
function collectScrap(world:CombatWorld):void {
    if(!world.tactical?.scraps.length)return;
    const t=world.tactical,state=world.aircraft,now=world.elapsed;
    t.scraps=t.scraps.filter(scrap=>{
        if(scrap.until<=now)return false;
        if(circleVsAircraft(scrap.x,scrap.y,5,getPlayerHitbox(world))){healPlayerWithFeedback(world,getEffectiveAircraftStats(state).maxHp*.0125,"core");emitVisual(world,{kind:"absorb",x:scrap.x,y:scrap.y,size:18});return false;}return true;
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
    world.aircraft.coreState.timers.controlOverride=world.aircraft.coreState.time-(world.elapsed-endedAt)+16;
}
function updateTacticalCores(world:CombatWorld,dt:number):void {
    const t=tacticalState(world),state=world.aircraft,c=state.coreState,now=world.elapsed;
    observeComeback(world);
    t.fields=t.fields.filter(f=>f.until>now);
    collectScrap(world);
    settleControlOverride(world);
    if(hasCore(state,120)&&!t.hackMode&&(c.timers.controlOverride??0)<=c.time&&world.waveState==="combat"){
        const eliteWave=COMBAT_WAVES[world.waveIndex].elite>0;
        const bossWave=Boolean(COMBAT_WAVES[world.waveIndex].counts.boss);
        const candidates=world.enemies.filter(e=>isHostileToPlayer(world,e) &&
            (bossWave?e.type==="boss":eliteWave?isElite(e.type):e.type!=="boss"&&!isElite(e.type)));
        candidates.sort((a,b)=>b.hp/b.maxHp-a.hp/a.maxHp||a.id-b.id);
        const cohort=candidates.slice(0,bossWave||eliteWave?1:3);
        if(cohort.length){
            t.hackMode=bossWave?"boss_stun":eliteWave?"elite":"normal";
            t.hackEnd=now+(bossWave?2.5:6);
            t.hackTargets=bossWave?[]:cohort.map(e=>e.id);
            // Assign the entire cohort before retargeting any member.
            for(const e of cohort){
                if(bossWave)e.stun=Math.max(e.stun,2.5);
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
        const a=world.enemies.find(e=>e.id===g.a&&isHostileToPlayer(world,e)),b=world.enemies.find(e=>e.id===g.b&&isHostileToPlayer(world,e));
        if(g.until<=now||!a||!b)return false;
        for(const e of world.enemies)if(e.id!==a.id&&e.id!==b.id&&isHostileToPlayer(world,e)&&!g.hits.has(e.id)&&segmentVsAircraft(a.x,a.y,b.x,b.y,2,getEnemyHitbox(e),projectileContact).hit){g.hits.add(e.id);applyDamageToEnemy(world,e,g.raw,"#67e8f9","core");}
        return a.hp>0&&b.hp>0;
    });
    resolveDeathsAndEffects(world);
}
function damageEnemyAttack(world:CombatWorld,target:EnemyEntity,raw:number,attack:AttackMetadata,contact?:{x:number;y:number;zone?:AirframeHitZone}):number {
    const allegiance=attack.allegiance??"hostile";
    raw *= enemyOutputMultiplier(world,attack.sourceEnemyId);
    if(!canAttackEnemy(world,allegiance,target,attack.sourceEnemyId))return 0;
    let damage:number;
    if(allegiance!=="hostile")damage=applyDamageToEnemy(world,target,raw,"#67e8f9","core",undefined,undefined,contact,attack.delivery??(contact?"direct_projectile":"area_hazard"),true,false);
    else {
        damage=calculateDamage(raw*(contact?wingDamageMultiplier(contact.zone):1),target.armor*((target.armorBrokenUntil??0)>world.elapsed?.7:1));
        const absorbed=Math.min(target.shield,damage);target.shield-=absorbed;damage=Math.min(target.hp,damage-absorbed);target.hp-=damage;
        emitVisual(world,{kind:"damage_number",x:target.x,y:target.y,size:target.radius,amount:damage+absorbed,target:"enemy",critical:false,shielded:absorbed>0,entityId:target.id});
        if(absorbed>0&&target.shield<=0&&target.type==="iron_fortress"&&target.retaliationReady){target.retaliationReady=false;queueEliteSpecial(world,target,"retaliation",.01,false);}
    }
    if(damage<=0)return damage;
    const now=world.elapsed,source=world.enemies.find(e=>e.id===attack.sourceEnemyId),marks=target.combatMarks??={};
    const mark=(key:string,duration:number,threshold:number)=>{const m=marks[key];const count=m&&m.until>now?m.count+1:1;marks[key]={count,until:now+duration};if(count>=threshold){delete marks[key];return true;}return false;};
    const payload=attack.payload;
    if(payload?.stun)target.stun=Math.max(target.stun,payload.stun);
    if(payload?.skillLock)target.skillLockedUntil=Math.max(target.skillLockedUntil??0,now+payload.skillLock);
    if(payload?.armorBreak)target.armorBrokenUntil=Math.max(target.armorBrokenUntil??0,now+payload.armorBreak);
    if(attack.attackTag==="acid"&&mark("corrosion",6,3)){target.armorBrokenUntil=now+4;if(source?.eliteWave===2)queueEliteSpecial(world,source,"acid_cage",1.2,false);}
    if(source?.type==="elite"&&mark("hunterMark",source.eliteWave===2?3.5:4,source.eliteWave===2?2:3))queueEliteSpecial(world,source,"execution",.1,false);
    if(source?.type==="iron_fortress"&&(attack.attackTag==="basic"||attack.attackTag==="burst")&&mark("suppression",4,source.eliteWave===2?3:4))queueEliteSpecial(world,source,"clamp",.1,true);
    if(source?.type==="radar_hunter"){
        if(attack.attackTag==="rail")marks.targetLock={count:1,until:now+4};
        else if(attack.attackTag==="radar_lock"&&(marks.targetLock?.until??0)>now){delete marks.targetLock;target.stun=Math.max(target.stun,1.5);target.skillLockedUntil=now+2.2;queueEliteSpecial(world,source,"radar_followup",.6,false);}
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
    const step=Math.min(270*dt,remaining,enemy.dashCommitted?Infinity:Math.max(0,homingDistance-(enemy.dashTravelled??0)));
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
    if(enemy.dashAllegiance!=="friendly_hacked"&&world.aircraft.droneActive)consider(world.droneX,world.droneY,9,"drone");
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
    updateBossPhase(world);
    for (const enemy of world.enemies) {
        if (enemy.hp <= 0)
            continue;
        if (enemy.burn > 0) {
            enemy.burnTick -= dt;
            if (enemy.burnTick <= 1e-8) {
                enemy.burnTick += 1;
                applyDamageToEnemy(world, enemy, enemy.burnDamage, "#fb923c", "burn");
            }
            enemy.burn = Math.max(0, enemy.burn - dt);
        }
        if (enemy.hp <= 0)
            continue;
        if (enemy.shieldUntil <= world.aircraft.coreState.time)
            enemy.shield = 0;
        if (enemy.type === "boss") enemy.y = Math.max(enemy.y, bossMinCenterY(enemy.radius));
        if (enemy.stun > 0) {
            enemy.stun = Math.max(0, enemy.stun - dt);
            continue;
        }
        enemy.age += dt;
        enemy.fireCooldown -= dt;
        const top = GAMEPLAY_SAFE_RECT.top + enemy.radius;
        const holdingTelegraph = (enemy.type === "boss" && (enemy.bossAttack?.crossfirePending ?? 0)>0 && !enemy.bossAttack?.patternWaiting) || world.warnings.some(w => w.enemyId === enemy.id && (w.kind === "rail" || w.kind === "dash" || w.kind === "sonic" || w.kind === "retaliation" || w.kind === "elite_barrage"));
        if (holdingTelegraph) {
            // Keep the visual origin and the actual attack lane aligned during the warning.
        }
        else if (enemy.type === "boss") {
            if (enemy.dashRemaining > 0) {
                enemy.dashRemaining = Math.max(0, enemy.dashRemaining - dt);
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
            enemy.dashRemaining = Math.max(0, enemy.dashRemaining - dt);
            const t = 1 - enemy.dashRemaining / .65, oldX = enemy.x, oldY = enemy.y;
            enemy.x = enemy.dashStartX + (enemy.dashEndX-enemy.dashStartX)*t;
            enemy.y = enemy.dashStartY + (enemy.dashEndY-enemy.dashStartY)*t;
            if (enemy.dashAllegiance!=="friendly_hacked" && sweepAircraft(getEnemyHitbox(enemy),enemy.x-oldX,enemy.y-oldY,getPlayerHitbox(world),bodyContact).hit)
                hitPlayer(world, ENEMY_CONFIGS[enemy.type].collisionDamage*enemy.damageScale, "collision", { sourceEnemyId: enemy.id, attackTag: "elite_execution" },bodyContact);
            for(const e of world.enemies)if(canAttackEnemy(world,enemy.dashAllegiance??"hostile",e,enemy.id)&&sweepAircraft(getEnemyHitbox(enemy),enemy.x-oldX,enemy.y-oldY,getEnemyHitbox(e),bodyContact).hit && !enemy.hitResolved){
                enemy.hitResolved=true;damageEnemyAttack(world,e,ENEMY_CONFIGS[enemy.type].collisionDamage*enemy.damageScale,{allegiance:enemy.dashAllegiance,sourceEnemyId:enemy.id,delivery:"aircraft_collision"},bodyContact);
            }
            if (enemy.dashRemaining === 0){enemy.executionRecovery = .45;enemy.dashAllegiance=undefined;}
        }
        else if ((enemy.executionRecovery ?? 0) > 0) {
            enemy.executionRecovery! -= dt;
            if (enemy.executionRecovery! <= 0) fireFan(world, enemy, 7, ENEMY_CONFIGS[enemy.type].projectileDamage*enemy.damageScale, aimAtCurrentTarget(world, enemy) ?? -Math.PI/2, .22, 185, "elite_execution");
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
            enemy.burstCd -= dt;
            if (enemy.burstCd <= 0) {
                if (enemy.type === "iron_fortress")
                    fireFan(world, enemy, 5, ENEMY_CONFIGS[enemy.type].projectileDamage * enemy.damageScale, enemy.burstAngle, .22);
                else
                    fireEnemyBullet(world, enemy, enemy.burstAngle, 180, ENEMY_CONFIGS[enemy.type].projectileDamage * enemy.damageScale);
                enemy.burst--;
                enemy.burstCd += enemy.type === "elite" && enemy.eliteWave === 2 ? .16 : .18;
                if (enemy.burst === 0 && enemy.type === "elite" && enemy.eliteWave === 2) {
                    enemy.secondaryCd = .5;
                }
            }
        }
        if ((enemy.skillLockedUntil??0)<=world.elapsed && enemy.type === "elite" && enemy.eliteWave === 2 && enemy.secondaryCd <= 0) {
            fireFan(world, enemy, 7, 80 * enemy.damageScale, aimAtCurrentTarget(world, enemy) ?? Math.PI / 2);
            enemy.secondaryCd = Infinity;
        }
        if ((enemy.skillLockedUntil??0)<=world.elapsed && enemy.type === "radar_hunter" && enemy.secondaryCd <= 0 && canContinueRadarSequence(world,enemy)) {
            const aim = aimAtCurrentTarget(world, enemy);
            if (aim !== null) fireEnemyBullet(world, enemy, aim, 155, 120 * enemy.damageScale, true, "radar_lock");
            enemy.secondaryCd = Infinity;
        }
    }
    for (let i = world.enemies.length-1; i >= 0; i--) if (world.enemies[i].deathHandled && world.enemies[i].hp <= 0) recycleEnemy(world, i);
    resolveDeathsAndEffects(world);
}
function segmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
    const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
const shortestAngle = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));
const approach = (value: number, target: number, step: number) => value + Math.max(-step, Math.min(step, target - value));

function followMissileAnchor(world: CombatWorld, p: ProjectileEntity, dt: number): void {
    const heavy = p.projectileKind === "bigbang";
    const bob = Math.sin(p.missileAge * 4 + p.id * 1.7) * (heavy ? .7 : 1.8);
    const anchor = clampCircleToGameplayRect(world.playerX + p.anchorX, world.playerY + p.anchorY + bob, p.radius);
    const easing = 1 - Math.exp(-dt * (heavy ? 8 : 12));
    p.x += (anchor.x - p.x) * easing;
    p.y += (anchor.y - p.y) * easing;
}

function acquireMissileTarget(world: CombatWorld, p: ProjectileEntity): EnemyEntity | null {
    const current = world.enemies.find(e => e.id === p.targetId && isHostileToPlayer(world,e));
    if (current) return current;
    // Tomahawk's volley keeps its existing spread across distinct live enemies.
    const excluded = p.volleyId ? world.projectiles
        .filter(other => other !== p && other.volleyId === p.volleyId && other.targetId !== null)
        .map(other => other.targetId!) : p.hitIds;
    const target = nearestEnemy(world, p.x, p.y, excluded, true) || nearestEnemy(world, p.x, p.y, p.hitIds, true);
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
            Object.assign(particle,{id:world.nextVisualId++,kind:"missile_smoke",x:ax+(bx-ax)*t,y:ay+(by-ay)*t,
                vx:-Math.cos(p.heading)*smoke.drift+(world.visualRandom()-.5)*3,vy:-Math.sin(p.heading)*smoke.drift+(world.visualRandom()-.5)*3,
                life:smoke.life,maxLife:smoke.life,size:smoke.size,color:smoke.color});
            world.particles.push(particle);
        }
        const remainder=(accumulator+nozzleDistance)%smoke.spacing;
        if(nozzleIndex===0)p.smokeDistanceAccumulator=remainder;else p.secondarySmokeDistanceAccumulator=remainder;
    }
}

/** Only powered motion spends the existing lifetime/fuse and enables collisions. */
function updateMissile(world: CombatWorld, p: ProjectileEntity, dt: number): boolean {
    p.missileAge += dt;
    if (p.missileState === "loiter") {
        followMissileAnchor(world, p, dt);
        if (p.missileAge < (p.skillId === "missile_swarm" ? .35 : 1)) return true;
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
    // With no remaining target in powered flight, arc back toward the playfield.
    const desired = Math.atan2((target?.y ?? world.playerY - 100) - p.y, (target?.x ?? world.playerX) - p.x);
    const error = shortestAngle(desired - p.heading);
    const desiredAngularVelocity = Math.max(-p.turnRate, Math.min(p.turnRate, error * 4));
    p.angularVelocity = approach(p.angularVelocity, desiredAngularVelocity, p.angularAcceleration * dt);
    p.heading = shortestAngle(p.heading + p.angularVelocity * dt);
    if (!powered) {
        if ((Math.abs(shortestAngle(desired - p.heading)) <= Math.PI / 9 && Math.abs(p.angularVelocity) <= p.turnRate * .6) || (p.skillId === "missile_swarm" && p.missileAge >= 1.85)) {
            p.missileState = "powered";
            if (p.bigBang) { p.fuseStarted = true; p.fuseRemaining = 3; }
            // Anchor movement is staging, so it must not become a swept damage segment.
            p.previousX = p.x;
            p.previousY = p.y;
        }
        return true;
    }
    p.lifetime -= dt;
    if (p.fuseStarted) p.fuseRemaining -= dt;
    if (p.bigBang ? p.fuseStarted && p.fuseRemaining <= 0 : p.lifetime <= 0) {
        if (p.bigBang) detonateBigBang(world, p);
        return false;
    }
    p.speed = approach(p.speed, p.cruiseSpeed, p.acceleration * dt);
    p.vx = Math.cos(p.heading) * p.speed;
    p.vy = Math.sin(p.heading) * p.speed;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
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
        const enemy = world.enemies.find((candidate) => candidate.id === projectile.targetId && isHostileToPlayer(world,candidate)) ||
            nearestEnemy(world, projectile.x, projectile.y, projectile.hitIds, true);
        if (enemy) {
            projectile.targetId = enemy.id;
            target = { x: enemy.x, y: enemy.y };
        }
    }
    if (!target)
        return;
    const desired = Math.atan2(target.y - projectile.y, target.x - projectile.x);
    const current = Math.atan2(projectile.vy, projectile.vx);
    let delta = ((desired - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    delta = Math.max(-projectile.turnRate * dt, Math.min(projectile.turnRate * dt, delta));
    const speed = Math.max(1, Math.hypot(projectile.vx, projectile.vy));
    const next = current + delta;
    projectile.vx = Math.cos(next) * speed;
    projectile.vy = Math.sin(next) * speed;
}
function updateBossMissile(world: CombatWorld, p: ProjectileEntity, dt: number): boolean {
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
    p.heading = Math.atan2(p.vy, p.vx);
    p.speed = approach(p.speed, p.cruiseSpeed, p.acceleration * dt);
    p.vx = Math.cos(p.heading) * p.speed;
    p.vy = Math.sin(p.heading) * p.speed;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
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
export function healPlayerWithFeedback(world: CombatWorld, amount: number, source: HealSource, continuous = false): number {
    const effective = healAircraft(world.aircraft, amount);
    emitPlayerHealing(world, effective, source, continuous);
    return effective;
}
function coreContext(world: CombatWorld, extra: Partial<CoreContext> = {}): CoreContext {
    return { state: world.aircraft, stats: getEffectiveAircraftStats(world.aircraft), rawMultiplier: 1,
        heal: amount => { healPlayerWithFeedback(world, amount, extra.skillId ? "skill_core" : "core", (extra.dt ?? 0) > 0); },
        reduceCooldowns: (seconds, except) => { for (const id of SKILL_IDS)
            if (id !== except && (world.aircraft.cooldowns[id] || 0) > 0)
                world.aircraft.cooldowns[id] = Math.max(0, world.aircraft.cooldowns[id]! - seconds); },
        explode: (target, raw) => { world.effectQueue.push({ kind: "explosion", target, raw }); },
        lightning: (target, raw) => { world.effectQueue.push({ kind: "lightning", target, raw }); },
        tomahawk: () => {
            // Preserve the existing count (up to three live enemies), but defer locks.
            const count = Math.min(3, world.enemies.reduce((n, e) => n + (isHostileToPlayer(world,e) ? 1 : 0), 0));
            const volleyId = world.nextId;
            for (let i = 0; i < count; i++) {
                addProjectile(world, { owner: "player", source: "weapon", projectileKind: "missile", volleyId, turnRate: 4, lifetime: 6,
                    anchorX: (i - 1) * 25, anchorY: -24,
                    x: world.playerX + (i - 1) * 10, y: world.playerY - 15, vx: (i - 1) * 65, vy: -230, radius: 4.5,
                    rawDamage: getEffectiveAircraftStats(world.aircraft).firepower * 1.95, color: "#67e8f9" });
            }
        },
        weaken: target => { const enemy = world.enemies.find(e => e.id === target.id); if (enemy) {
            enemy.weakHits++;
            if (enemy.weakHits >= 5)
                enemy.weakUntil = world.aircraft.coreState.time + 4;
        } },
        stopSkills: () => stopAllSkills(world), ...extra };
}
function applyDamageToEnemy(world: CombatWorld, enemy: EnemyEntity, rawDamage: number, color = "#fde68a", source: DamageSource = "weapon", skillId?: SkillId, volleyHits?: Map<number, number>, contact?:{x:number;y:number;zone?:AirframeHitZone}, delivery:DamageDelivery=contact?"direct_projectile":"area_hazard", chargeAntimatter=true, directPlayer=true): number {
    if (!isHostileToPlayer(world,enemy) || rawDamage <= 0 || world.bossDefeated)
        return 0;
    const state = world.aircraft, time = state.coreState.time, stats = getEffectiveAircraftStats(state), target = targetMetadata(enemy);
    const canCrit = source !== "core" && source !== "lightning" && ((!skillId && source !== "skill" && source !== "burn") || hasCore(state, 53));
    const opening=source==="basic" && hasCore(state,117) && !tacticalState(world).openingHits.has(enemy.id);
    if(opening)tacticalState(world).openingHits.add(enemy.id);
    const effectiveStats = opening ? {...stats,criticalChance:1} : canCrit ? stats : { ...stats, criticalChance: 0 };
    const skillEffects = world.skillCores.enemyEffects.get(enemy.id);
    const armor = enemy.armor * ((skillEffects?.armorUntil || 0)>time ? 1 - V.laserArmorReduction : 1) * ((enemy.armorBrokenUntil??0)>world.elapsed?.7:1) * (enemy.burn > 0 ? .7 : 1) * (enemy.weakUntil > time ? .92 : 1) * (1 - armorPenetration(state));
    let multiplier = outgoingCoreMultiplier(state, target, source, Math.hypot(enemy.x - world.playerX, enemy.y - world.playerY), GAMEPLAY_SAFE_RECT.height);
    if (directPlayer && (source === "basic" || source === "weapon" || source === "skill") && state.aircraftId === "breaker" && (skillEffects?.markUntil || 0)>time) multiplier *= 1 + V.markBonus;
    if (directPlayer && (source === "basic" || source === "weapon" || source === "skill") && state.aircraftId === "phantom" && world.skillCores.syncTarget === enemy.id && world.skillCores.syncUntil>time) multiplier *= 1 + V.syncBonus;
    const zoneMultiplier=delivery==="direct_projectile"||delivery==="aircraft_collision"?wingDamageMultiplier(contact?.zone):1;
    if(hasCore(state,115) && !world.enemies.some(e=>e.id!==enemy.id && isHostileToPlayer(world,e) && Math.hypot(e.x-enemy.x,e.y-enemy.y)<=80))multiplier*=enemy.type==="boss"?1.1:1.25;
    if((state.coreState.timers.comeback??0)>time)multiplier*=1.25;
    if(hasCore(state,118))multiplier*=1+crowdDamageBonus(world);
    const firstVolleyDamage = volleyHits?.get(enemy.id);
    // Snapshot the first projectile after outgoing modifiers/crit, before target mitigation.
    // Later projectiles in this same fan retain exactly 15% of that value, without a second crit multiplier.
    const resolved = firstVolleyDamage === undefined
        ? resolvePlayerDamage(rawDamage * multiplier * zoneMultiplier, armor, effectiveStats, world.random)
        : { actualDamage: calculateDamage(firstVolleyDamage * .15 * zoneMultiplier, armor), critical: false, multiplier: 1 };
    if (volleyHits && firstVolleyDamage === undefined)
        volleyHits.set(enemy.id, rawDamage * multiplier * resolved.multiplier);
    let damage = resolved.actualDamage;
    const aegis = enemy.type === "boss" && enemy.hp / enemy.maxHp >= .15 && enemy.aegisUntil > time;
    if (aegis)
        damage *= .4;
    const absorbed = Math.min(enemy.shield, damage);
    enemy.shield -= absorbed;
    if (absorbed > 0 && enemy.shield <= 0 && enemy.type === "iron_fortress" && enemy.retaliationReady) {
        enemy.retaliationReady = false;
        queueEliteSpecial(world, enemy, "retaliation", .01, false);
    }
    damage -= absorbed;
    const potential=damage,hpBefore=enemy.hp;
    damage = Math.min(enemy.hp, damage);
    if(hasCore(state,121) && chargeAntimatter){
        const gain=(target.elite||target.boss?damage*.02:Math.max(0,potential-hpBefore)*.5)/Math.max(Number.EPSILON,stats.firepower);
        cBank(state,gain);
    }
    enemy.hp = Math.max(0, enemy.hp - damage);
    if (damage > 0 && skillId === "sweeping_cannon" && hasCore(state,138)) healPlayerWithFeedback(world, damage*V.cannonHeal,"skill_core",true);
    if (damage > 0 && directPlayer && hasCore(state,146) && source !== "burn" && source !== "core" && source !== "lightning") recordTargetSync(world,enemy,skillId === "escort_drone");
    if (damage + absorbed > 0) {
        emitVisual(world, { kind: "damage_number", x: enemy.x, y: enemy.y, size: enemy.radius, amount: damage + absorbed, target: "enemy", critical: resolved.critical, shielded: aegis || absorbed > 0, entityId: enemy.id });
        emitVisual(world, { kind: "hit", x: contact?.x??enemy.x, y: contact?.y??enemy.y, size: enemy.radius, entityId: enemy.id, directContact:!!contact, skillId });
        world.damageDealt += damage;
        if(!contact)addParticles(world, enemy.x, enemy.y, color, 2);
        if(contact && (source==="basic"||source==="weapon"))recordCrossfire(world,enemy);
        const ctx = coreContext(world, { target, damage, source });
        if (source !== "burn" && source !== "lightning" && source !== "core")
            dispatchCoreEvent("hit", ctx);
        if (resolved.critical)
            dispatchCoreEvent("critical", ctx);
    }
    if (skillId === "missile_swarm" && hasCore(state, 27) && enemy.hp > 0) {
        enemy.burn = 5;
        enemy.burnDamage = stats.firepower * .7;
        if (enemy.burnTick <= 0)
            enemy.burnTick = 1;
    }
    if (enemy.type === "boss" && enemy.hp > 0) {
        enemy.recentDamage.push({ time, damage });
        while (enemy.recentDamage.length && enemy.recentDamage[0].time < time - 2)
            enemy.recentDamage.shift();
        const ratio = enemy.hp / enemy.maxHp;
        if (ratio < .7 && ratio >= .15 && time >= enemy.aegisReady && enemy.recentDamage.reduce((n, h) => n + h.damage, 0) >= enemy.maxHp * .1) {
            enemy.aegisUntil = time + 3;
            enemy.aegisReady = time + 12;
            enemy.recentDamage.length = 0;
            setMessage(world, "LEVIATHAN · KHIÊN PHẢN ỨNG", 1.5);
        }
    }
    return damage;
}
function destroyEnemy(world: CombatWorld, enemyIndex: number): void {
    const enemy = world.enemies[enemyIndex];
    if (!enemy || enemy.deathHandled)
        return;
    enemy.deathHandled = true;
    world.skillCores.enemyEffects.delete(enemy.id);
    if(world.skillCores.syncTarget===enemy.id){world.skillCores.syncTarget=null;world.skillCores.syncUntil=0;}
    const eliteWave=COMBAT_WAVES[world.waveIndex].elite;
    if(eliteWave&&isElite(enemy.type))world.eliteResolve=Math.min(eliteWave===2?3:2,world.eliteResolve+1);
    const tactical=tacticalState(world);tactical.openingHits.delete(enemy.id);
    tactical.grids=tactical.grids.filter(g=>g.a!==enemy.id&&g.b!==enemy.id);
    tactical.hackTargets=tactical.hackTargets.filter(id=>id!==enemy.id);
    if(hasCore(world.aircraft,108) && world.random()<.06 && tactical.scraps.length<64)tactical.scraps.push({id:world.nextId++,x:enemy.x,y:enemy.y,until:world.elapsed+4});
    const target = targetMetadata(enemy), config = ENEMY_CONFIGS[enemy.type], state = world.aircraft, c = state.coreState;
    emitVisual(world, { kind: "explosion", x: enemy.x, y: enemy.y, size: enemy.radius * 3, boss: target.boss });
    world.score += config.score * getComboMultiplier(world.comboKills);
    world.comboKills++;
    world.comboTimer = 4;
    world.maxCombo = Math.max(world.maxCombo, world.comboKills);
    addParticles(world, enemy.x, enemy.y, config.color, target.boss ? 36 : target.elite ? 20 : 9);
    c.kills++;
    c.killTimes.push(c.time);
    while (c.killTimes.length > 5)
        c.killTimes.shift();
    if (state.aircraftId === "phantom")
        state.currentResource = Math.min(getEffectiveAircraftStats(state).maxResource, state.currentResource + 1);
    dispatchCoreEvent("kill", coreContext(world, { target }));
    c.lastKill = c.time;
    if (target.boss) {
        world.bossDefeated = true;
        world.ended = true;
        world.pauseReasons.add("result");
        world.bossClearSeconds = world.bossStartedAt === null ? null : world.elapsed - world.bossStartedAt;
        setMessage(world, "LEVIATHAN X-99 ĐÃ BỊ HẠ", 3);
        clearHostileObjects(world);
    }
    else {
        world.enemiesDefeated++;
        if (target.elite)
            world.elitesDefeated++;
        const level = gainCombatXp(state, enemy.xp);
        world.pendingCoreSelections = state.pendingMilestones.length;
        if (level.levelsGained)
            setMessage(world, `CẤP CHIẾN ĐẤU ${state.level}`, 1.5);
    }
    recycleEnemy(world, enemyIndex);
}
/** Iterative kill/proc queue: fragmentation can chain; lightning cannot re-proc itself. */
function resolveDeathsAndEffects(world: CombatWorld): void {
    while (true) {
        for (let i = world.enemies.length - 1; i >= 0; i--)
            if (world.enemies[i].hp <= 0)
                destroyEnemy(world, i);
        const effect = world.effectQueue.shift();
        if (!effect || world.bossDefeated)
            break;
        if (effect.kind === "explosion") {
            emitVisual(world, { kind: "explosion", x: effect.target.x, y: effect.target.y, size: 92 });
            for (const enemy of world.enemies)
                if (enemy.hp > 0 && circleVsAircraft(effect.target.x,effect.target.y,46,getEnemyHitbox(enemy)))
                    applyDamageToEnemy(world, enemy, effect.raw, "#fb923c", "weapon");
        }
        else {
            const ids = [effect.target.id];
            for (let i = 0; i < 3; i++) {
                const target = nearestEnemy(world, effect.target.x, effect.target.y, ids);
                if (!target)
                    break;
                ids.push(target.id);
                if (target.lightningUntil > world.aircraft.coreState.time)
                    continue;
                target.lightningUntil = world.aircraft.coreState.time + .5;
                applyDamageToEnemy(world, target, effect.raw, "#67e8f9", "lightning");
                emitVisual(world, { kind: "lightning", x: target.x, y: target.y, fromX: effect.target.x, fromY: effect.target.y, size: target.radius * 3 });
            }
        }
    }
    settleControlOverride(world);
}
function applySecondaryHits(world: CombatWorld, projectile: ProjectileEntity, primary: EnemyEntity): void {
    if (projectile.bounceRemaining <= 0)
        return;
    const next = nearestEnemy(world, primary.x, primary.y, projectile.hitIds);
    if (!next)
        return;
    const angle = Math.atan2(next.y - primary.y, next.x - primary.x);
    const bounceSpeed=projectile.source==="basic"&&hasCore(world.aircraft,111)?920:460;
    const bounced = addProjectile(world, { owner: projectile.owner, allegiance:projectile.allegiance, source: projectile.source, ammoVisualKey: projectile.ammoVisualKey, skillId: projectile.skillId,
        x: primary.x, y: primary.y, vx: Math.cos(angle) * bounceSpeed, vy: Math.sin(angle) * bounceSpeed, radius: projectile.radius,
        rawDamage: projectile.bounceSecondMultiplier !== undefined && projectile.bounceRemaining === 1 ? (projectile.bounceBasis || 0) * projectile.bounceSecondMultiplier : projectile.rawDamage * projectile.bounceMultiplier,
        bounceBasis: projectile.bounceBasis, bounceSecondMultiplier: projectile.bounceSecondMultiplier, homing: true, targetId: next.id, turnRate: 7,
        bounceRemaining: projectile.bounceRemaining - 1, bounceMultiplier: projectile.bounceMultiplier, color: "#c4b5fd" });
    if (bounced)
        bounced.hitIds.push(...projectile.hitIds);
}
function hitPlayer(world: CombatWorld, rawDamage: number, kind: "projectile" | "collision" | "hazard" = "projectile", attack: AttackMetadata & { x?:number; y?:number; previousX?:number; previousY?:number; projectileKind?:ProjectileEntity["projectileKind"] } = {}, contact?:HitResult): void {
    const state = world.aircraft, c = state.coreState, stats = getEffectiveAircraftStats(state);
    if (attack.allegiance==="friendly_hacked" || world.ended || world.playerInvulnerability > 0 || state.currentHp <= 0 || rawDamage <= 0 || world.waveState !== "combat")
        return;
    // All hostile projectile, body, dash and hazard impacts converge here.
    // Keep config/tuning and stored attack damage unscaled to prevent stacking.
    const sourceType = attack.sourceEnemyType ?? world.enemies.find(e => e.id === attack.sourceEnemyId)?.type;
    if (sourceType === "boss") rawDamage *= BOSS_DAMAGE_MULTIPLIER;
    rawDamage *= enemyOutputMultiplier(world,attack.sourceEnemyId);
    if(kind==="collision"&&!contact){const source=world.enemies.find(e=>e.id===attack.sourceEnemyId);if(source)contact={...sweepAircraft(getEnemyHitbox(source),0,0,getPlayerHitbox(world),bodyContact)};}
    let zoneMultiplier=(kind==="projectile"||kind==="collision")?wingDamageMultiplier(contact?.zone):1;
    if(zoneMultiplier<1 && hasCore(state,109)){
        const key=`wing:${contact!.zone}`;
        if((c.timers[key]??0)<=c.time){zoneMultiplier*=.7;c.timers[key]=c.time+12;
            const x=world.playerX+(contact!.zone==="left_wing"?-11:11),y=world.playerY+5;
            emitVisual(world,{kind:"shield_ripple",x,y,fromX:x-world.playerX,fromY:5,attachedToPlayer:true,size:12});
        }
    }
    if(attack.delivery==="explosive_aoe"&&hasCore(state,110))zoneMultiplier*=.85;
    let multiplier = (state.activeEffects.armor_shield || 0) > 0 ? getSkillRuntimeValues(state, "armor_shield").damageTakenMultiplier : 1;
    if (kind === "collision" && hasCore(state, 65))
        multiplier *= .8;
    if (kind === "projectile" && hasCore(state, 103) && state.currentHp < stats.maxHp * .3)
        multiplier *= .88;
    if (hasCore(state, 72) && c.time - c.lastDamage >= 5)
        multiplier *= .6;
    if ((c.timers.thermalCover || 0)>c.time) multiplier *= 1 - V.thermalReduction;
    const shieldMultiplier = (state.activeEffects.armor_shield || 0)>0 ? getSkillRuntimeValues(state,"armor_shield").damageTakenMultiplier : 1;
    if (hasCore(state,132) && shieldMultiplier < 1) {
        const prevented = calculateDamage(rawDamage*zoneMultiplier,stats.armor,multiplier/shieldMultiplier) * (1-shieldMultiplier);
        const restored = refundResource(world,prevented*V.shieldConversion,c.stacks.shieldRefund || 0);
        c.stacks.shieldRefund = (c.stacks.shieldRefund || 0)+restored;
    }
    let damage = calculateDamage(rawDamage*zoneMultiplier, stats.armor, multiplier), absorbed = 0;
    for (const shield of Object.values(c.shields)) {
        if (shield.until <= c.time)
            continue;
        const amount = Math.min(shield.amount, damage);
        shield.amount -= amount;
        damage -= amount;
        absorbed += amount;
    }
    if ((state.activeEffects.armor_shield ?? 0) > 0 || absorbed > 0) {
        const source=world.enemies.find(e=>e.id===attack.sourceEnemyId);
        const dx=(contact?.x ?? attack.previousX ?? attack.x ?? source?.x ?? world.playerX)-world.playerX;
        const dy=(contact?.y ?? attack.previousY ?? attack.y ?? source?.y ?? world.playerY-1)-world.playerY;
        const titan=state.aircraftId==="breaker" && (state.activeEffects.armor_shield??0)>0;
        const rx=titan?38:30,ry=titan?38:30,denom=Math.hypot(dx/rx,dy/ry);
        const localX=denom>.0001?dx/denom:0,localY=denom>.0001?dy/denom:-ry;
        emitVisual(world,{kind:"shield_ripple",x:world.playerX+localX,y:world.playerY+localY,fromX:localX,fromY:localY,attachedToPlayer:true,size:18});
    }
    if (damage <= 0) {
        if (absorbed > 0)
            emitVisual(world, { kind: "damage_number", x: world.playerX, y: world.playerY, size: 36, amount: absorbed, target: "player", critical: false, shielded: true });
        return;
    }
    if(kind==="projectile" && attack.projectileKind==="bullet" && contact && !((state.activeEffects.armor_shield??0)>0 && state.aircraftId==="breaker"))
        emitVisual(world,{kind:"bullet_impact",x:contact.x,y:contact.y,size:14});
    let survived = false;
    if (damage >= state.currentHp && hasCore(state, 90) && !c.consumed.has(coreId(90))) {
        c.consumed.add(coreId(90));
        damage = Math.max(0, state.currentHp - 1);
        state.currentHp = 1;
        survived = true;
        world.playerInvulnerability = 2;
        healPlayerWithFeedback(world, stats.maxHp * .35, "core");
        setMessage(world, "TỪ CHỐI TỬ THẦN · ĐÃ KÍCH HOẠT", 2);
    }
    else {
        damage = Math.min(state.currentHp, damage);
        state.currentHp = Math.max(0, state.currentHp - damage);
    }
    if (damage > 0) { onHostileDamage(world, attack);observeComeback(world); }
    c.lastDamage = c.time;
    dispatchCoreEvent("damageTaken", coreContext(world, { damage }));
    emitVisual(world, { kind: "damage_number", x: world.playerX, y: world.playerY, size: 36, amount: damage, target: "player", critical: false, shielded: multiplier < 1 || absorbed > 0 });
    emitVisual(world, { kind: "player_hit", x: contact?.x??world.playerX, y: contact?.y??world.playerY, size: 36, directContact:!!contact });
    world.damageTaken += damage;
    world.hitsReceived++;
    world.comboKills = 0;
    world.comboTimer = 0;
    if (!survived)
        world.playerInvulnerability = AIR_COMBAT_WORLD.playerInvulnerabilitySeconds;
    if(!contact && !(state.aircraftId==="breaker" && (state.activeEffects.armor_shield??0)>0)) addParticles(world, contact?.x??world.playerX, contact?.y??world.playerY, "#fb7185", 13);
    if (state.currentHp <= 0) {
        world.ended = true;
        world.pauseReasons.add("result");
    }
}
function hitDrone(world: CombatWorld, rawDamage: number): void {
    if (!world.aircraft.droneActive || world.droneInvulnerability > 0)
        return;
    world.droneHp = Math.max(0, world.droneHp - calculateDamage(rawDamage, world.droneArmor));
    world.droneInvulnerability = .3;
    emitVisual(world, { kind: "drone_hit", x: world.droneX, y: world.droneY, size: 32 });
    addParticles(world, world.droneX, world.droneY, "#c4b5fd", 5);
    if (world.droneHp <= 0) {
        endAircraftSkill(world.aircraft, "escort_drone");
        setMessage(world, "HAWKEYE BỊ PHÁ HỦY", 1.5);
    }
}
const projectileHitPool:{enemy:EnemyEntity;x:number;y:number;t:number;zone?:AirframeHitZone}[]=[],projectileHits:typeof projectileHitPool=[];
function updateProjectileCollisions(world: CombatWorld): void {
    // New child projectiles are visited next tick, never recursively in their birth tick.
    for (let i = world.projectiles.length - 1; i >= 0; i--) {
        const p = world.projectiles[i];
        if (!p || world.ended)
            break;
        if (p.projectileKind !== "bullet" && p.missileState !== "powered" && !p.bigBang)
            continue;
        const touches = (x: number, y: number, radius: number) => p.bigBang && p.missileState!=="powered" ? circleHit(p.x,p.y,p.radius,x,y,radius) : segmentDistance(x, y, p.previousX, p.previousY, p.x, p.y) <= p.radius + radius;
        if (p.owner === "enemy" && p.allegiance!=="friendly_hacked") {
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
            if (world.aircraft.droneActive && touches(world.droneX, world.droneY, 10)) {
                hitDrone(world, p.rawDamage*enemyOutputMultiplier(world,p.sourceEnemyId));
                recycleProjectile(world, i);
                continue;
            }
            if (segmentVsAircraft(p.previousX,p.previousY,p.x,p.y,p.radius,getPlayerHitbox(world),projectileContact).hit) {
                if(p.projectileKind==="boss_missile")emitVisual(world,{kind:"missile_impact",x:p.x,y:p.y,size:42,missileFamily:"boss"});
                p.playerContact=true;
                hitPlayer(world, p.rawDamage, "projectile", p, projectileContact);
                recycleProjectile(world, i);
            }
            if(world.projectiles[i]===p && hasCore(world.aircraft,107) && ordinaryHostileBullet(p) && !p.playerContact && segmentVsAircraft(p.previousX,p.previousY,p.x,p.y,p.radius+8,getPlayerHitbox(world),projectileContact).hit)p.grazeCandidate=true;
            continue;
        }
        let consumed = false;
        // Sort along this segment to give piercing hits an unambiguous near-to-far order.
        projectileHits.length=0;
        for(const e of world.enemies) {
            if(!isHostileToPlayer(world,e) || p.hitIds.includes(e.id))continue;
            const hit=segmentVsAircraft(p.bigBang&&p.missileState!=="powered"?p.x:p.previousX,p.bigBang&&p.missileState!=="powered"?p.y:p.previousY,p.x,p.y,p.radius,getEnemyHitbox(e),projectileContact);
            if(hit.hit){const slot=projectileHitPool[projectileHits.length]??(projectileHitPool[projectileHits.length]={enemy:e,x:0,y:0,t:0});slot.enemy=e;slot.x=hit.x;slot.y=hit.y;slot.t=hit.t;slot.zone=hit.zone;projectileHits.push(slot);}
        }
        projectileHits.sort((a,b)=>a.t-b.t || a.enemy.id-b.enemy.id);
        for (const contact of projectileHits) {
            const enemy=contact.enemy;
            if (p.bigBang) {
                detonateBigBang(world, p);
                consumed = true;
                break;
            }
            if (p.projectileKind === "missile") emitVisual(world, { kind:"missile_impact", x:contact.x, y:contact.y, size:32, missileFamily:p.skillId==="missile_swarm"?"viper":"tomahawk" });
            p.hitIds.push(enemy.id);
            if(p.salvoId){const salvo=world.skillCores.salvos.find(s=>s.id===p.salvoId);if(salvo)salvo.data=Math.min(V.dataLimit,salvo.data+1);}
            const shieldBefore=enemy.shield;
            const dealt=p.allegiance==="friendly_hacked"?damageEnemyAttack(world,enemy,p.rawDamage,p,contact):applyDamageToEnemy(world, enemy, p.rawDamage, p.color, p.source, p.skillId, p.volleyHits, contact);
            if((dealt>0 || enemy.shield<shieldBefore) && p.projectileKind==="bullet" && p.skillId!=="sweeping_cannon")emitVisual(world,{kind:"bullet_impact",x:contact.x,y:contact.y,size:enemy.type==="boss"||isElite(enemy.type)?16:enemy.type==="scout"||enemy.type==="kamikaze"?10:12});
            if(enemy.shield<shieldBefore)emitVisual(world,{kind:"shield_ripple",x:contact.x,y:contact.y,size:23});
            applySecondaryHits(world, p, enemy);
            if (p.penetrationRemaining > 0) {
                p.penetrationRemaining--;
                const fraction = p.stabilizedPierce ? (p.hitIds.length === 1 ? V.cannonPierceDamage : [.5,.3,.3][p.hitIds.length-2] ?? .3) : [.7, .5, .3][2 - p.penetrationRemaining] ?? .3;
                p.rawDamage = p.initialDamage * fraction;
            }
            else {
                consumed = true;
                break;
            }
        }
        if (consumed)
            recycleProjectile(world, i);
        resolveDeathsAndEffects(world);
    }
}
function updateEnemyPlayerCollisions(world: CombatWorld): void {
    if (world.waveState !== "combat")
        return;
    for (const enemy of world.enemies) {
        if(enemy.hp>0&&enemy.type==="kamikaze"&&enemy.kamikazeState==="dash"&&enemyAllegiance(world,enemy)==="friendly_hacked")updateKamikaze(world,enemy,0);
        if (!isHostileToPlayer(world,enemy))
            continue;
        if (enemy.type === "kamikaze" && enemy.kamikazeState === "dash") { updateKamikaze(world,enemy,0); continue; }
        if (enemy.dashRemaining>0&&enemy.dashAllegiance==="friendly_hacked")continue;
        if (world.aircraft.droneActive && circleVsAircraft(world.droneX,world.droneY,9,getEnemyHitbox(enemy)))
            hitDrone(world, ENEMY_CONFIGS[enemy.type].collisionDamage * enemy.damageScale*enemyOutputMultiplier(world,enemy.id));
        if (!aircraftVsAircraft(getEnemyHitbox(enemy),getPlayerHitbox(world)))
            continue;
        // Share the one-hit dash guard with swept boss motion and pointer movement.
        if (enemy.type === "boss" && enemy.bossAttack?.majorAttack === "dash") {
            if (enemy.dashRemaining > 0 && !enemy.bossAttack.dashHitPlayer) {
                hitPlayer(world, enemy.bossAttack.dashDamage, "collision", { sourceEnemyId: enemy.id, sourceEnemyType: "boss", attackTag: "boss_dash", majorBossAttack: true });
                enemy.bossAttack.dashHitPlayer = true;
            }
        } else
            hitPlayer(world, ENEMY_CONFIGS[enemy.type].collisionDamage * enemy.damageScale, "collision", { sourceEnemyId: enemy.id, sourceEnemyType: enemy.type, attackTag: enemy.type === "kamikaze" ? "kamikaze_dash" : "elite_execution" });
        if (enemy.type === "kamikaze") resolveKamikaze(world, enemy);
    }
    resolveDeathsAndEffects(world);
}
function detonateBigBang(world: CombatWorld, projectile: ProjectileEntity): void {
    if(hasCore(world.aircraft,134))world.skillCores.aftershocks.push({x:projectile.x,y:projectile.y,at:world.elapsed+V.aftershockDelay});
    if(hasCore(world.aircraft,136))world.skillCores.blackHoles.push({id:world.nextId++,x:projectile.x,y:projectile.y,until:world.elapsed+V.holeDuration});
    emitVisual(world,{kind:"missile_impact",x:projectile.x,y:projectile.y,size:90,missileFamily:"bigbang"});
    emitVisual(world, { kind: "bomb", x: projectile.x, y: projectile.y, size: 360 });
    for (const enemy of world.enemies) {
        if (!isHostileToPlayer(world,enemy) || enemy.x + enemy.radius < 0 || enemy.x - enemy.radius > AIR_COMBAT_WORLD.width || enemy.y + enemy.radius < 0 || enemy.y - enemy.radius > AIR_COMBAT_WORLD.height)
            continue;
        applyDamageToEnemy(world, enemy, projectile.rawDamage, "#fbbf24", "skill", "heavy_bomb");
        if (hasCore(world.aircraft,135) && enemy.hp>0) skillEnemyEffects(world,enemy.id).markUntil=world.elapsed+V.markDuration;
        if (hasCore(world.aircraft, 33))
            enemy.stun = Math.max(enemy.stun, 4);
    }
}
function fireEliteBarrageVolley(world:CombatWorld,w:WarningZone):void {
    const barrage=w.barrage;
    if(!barrage||barrage.index>=barrage.angles.length)return;
    const angle=barrage.angles[barrage.index++];
    for(let i=0;i<7;i++){
        const a=angle+(i-3)*.14;
        addProjectile(world,{owner:"enemy",allegiance:w.allegiance,sourceEnemyId:w.sourceEnemyId,sourceEnemyType:w.sourceEnemyType,
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
            for(let i=0;i<12;i++) if(i!==safe && i!==(safe+6)%12) fireEnemyBullet(world,enemy,i*Math.PI/6,155,w.rawDamage,false,"burst",w.allegiance);
        }
        return;
    }
    if (w.kind === "rail") {
        if (!enemy)
            return;
        const angle = Math.atan2(w.y - (w.fromY ?? enemy.y), w.x - (w.fromX ?? enemy.x));
        addProjectile(world, { owner: "enemy", allegiance:w.allegiance, appearance: "dangerous", criticalAttack: true, x: w.fromX ?? enemy.x, y: w.fromY ?? enemy.y,
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
    if (w.allegiance!=="friendly_hacked" && world.aircraft.droneActive && Math.hypot(world.droneX - w.x, world.droneY - w.y) <= w.radius + 10)
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
                    if (w.insideTimer <= 1e-8) { w.insideTimer += 1; hitPlayer(world, w.rawDamage, "hazard", w); }
                }
                const droneInside = w.allegiance!=="friendly_hacked" && world.aircraft.droneActive && Math.hypot(world.droneX-w.x, world.droneY-w.y) <= w.radius+10;
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
    if (world.laserCharge > 0) {
        world.laserCharge = Math.max(0, world.laserCharge - dt);
        return;
    }
    if (world.laserTicksRemaining <= 0) {
        world.laserRemaining = 0;
        return;
    }
    world.laserRemaining = Math.max(0, world.laserRemaining - dt);
    world.laserTickCooldown -= dt;
    while (world.laserTickCooldown <= 1e-8 && world.laserTicksRemaining > 0) {
        world.laserTickCooldown += .25;
        world.laserTicksRemaining--;
        const raw = getEffectiveAircraftStats(world.aircraft).firepower * getSkillRuntimeValues(world.aircraft, "focus_laser").damageMultiplier;
        for (const enemy of world.enemies)
            if (isHostileToPlayer(world,enemy) && rectVsAircraft(world.playerX-16,GAMEPLAY_SAFE_RECT.top,world.playerX+16,world.playerY,getEnemyHitbox(enemy))) {
                applyDamageToEnemy(world, enemy, raw, "#c4b5fd", "skill", "focus_laser");
                if(enemy.hp>0 && hasCore(world.aircraft,144))skillEnemyEffects(world,enemy.id).armorUntil=world.elapsed+V.laserArmorDuration;
                if(enemy.hp>0 && hasCore(world.aircraft,143) && enemy.hp<=enemy.maxHp*V.executeThreshold){
                    world.damageDealt+=enemy.hp;
                    emitVisual(world,{kind:"damage_number",x:enemy.x,y:enemy.y,size:enemy.radius,amount:enemy.hp,target:"enemy",critical:false,shielded:false,entityId:enemy.id});
                    enemy.hp=0;
                }
            }
    }
    if (world.laserTicksRemaining === 0)
        world.laserRemaining = 0;
    resolveDeathsAndEffects(world);
}
function updateProjectiles(world: CombatWorld, dt: number): void {
    for (let i = world.projectiles.length - 1; i >= 0; i--) {
        const p = world.projectiles[i];
        p.previousX = p.x;
        p.previousY = p.y;
        if (updateCapturedProjectile(world,p,dt)) { if(p.lifetime<=0)recycleProjectile(world,i); continue; }
        if (p.projectileKind === "boss_missile") {
            if (!updateBossMissile(world, p, dt)) recycleProjectile(world, i);
            continue;
        }
        if (p.projectileKind !== "bullet") {
            if (!updateMissile(world, p, dt)) recycleProjectile(world, i);
            continue;
        }
        p.lifetime -= dt;
        if (p.lifetime <= 0) {
            if (p.bigBang)
                detonateBigBang(world, p);
            recycleProjectile(world, i);
            continue;
        }
        updateHoming(world, p, dt);
        const speedScale=ordinaryHostileBullet(p) && tacticalState(world).fields.some(f=>Math.hypot(p.x-f.x,p.y-f.y)<=55)?.6:1;
        p.x += p.vx * dt * speedScale;
        p.y += p.vy * dt * speedScale;
        if (p.corridorEdge !== undefined && p.corridorSide !== undefined) {
            const boundary=p.corridorEdge+p.corridorSide*p.radius;
            if((p.x-boundary)*p.corridorSide<0) {
                p.x=boundary+(boundary-p.x); p.vx=p.corridorSide*Math.min(30,Math.abs(p.vx)*.25);
            }
        }
        if (p.bigBang) {
            p.y = Math.max(GAMEPLAY_SAFE_RECT.top + p.radius, p.y);
            continue;
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
        else if (outside)
            recycleProjectile(world, i);
    }
    resolveDeathsAndEffects(world);
}
function updateDecoys(world: CombatWorld, dt: number): void {
    const state=world.aircraft,c=state.coreState;
    if(c.stacks.cloneEndPending){
        delete c.stacks.cloneEndPending;
        for(const d of world.decoys)if(d.clone&&!d.clonePhase&&d.castId===world.skillCores.invisibilityCastId){
            if(hasCore(state,140)){d.clonePhase="dash";d.remaining=1;d.dashTarget=nearestEnemy(world,d.x,d.y)?.id??null;}
            else if(hasCore(state,141)){d.clonePhase="linger";d.remaining=V.cloneLinger+dt;d.life=V.cloneLinger;}
        }
    }
    for (let i = world.decoys.length - 1; i >= 0; i--) {
        const d = world.decoys[i];
        if(d.clonePhase==="dash"){
            const target=world.enemies.find(e=>e.id===d.dashTarget&&isHostileToPlayer(world,e));
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
        } else d.remaining -= dt;
        if (d.remaining <= 0) { world.pools.decoys.push(d); world.decoys.splice(i, 1); }
    }
    if(world.decoyVolleys<=0&&!world.decoys.some(d=>!d.clone))finishBorrowedDuration(world.aircraft,"decoy");
}
function updatePlayerDash(world: CombatWorld, dt: number): void {
    if (playerStunned(world.aircraft) || world.dashRemaining <= 0)
        return;
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
export function updateCombatWorld(world: CombatWorld, deltaSeconds: number): void {
    if (world.ended || world.pauseReasons.size || world.currentCoreChoices || world.pendingCoreSelections > 0 || deltaSeconds <= 0)
        return;
    const dt = Math.min(AIR_COMBAT_WORLD.maxDeltaSeconds, deltaSeconds);
    world.elapsed += dt;
    world.scroll = (world.scroll + dt * 52) % 80;
    if (world.latestMessage && world.elapsed >= world.messageUntil)
        world.latestMessage = null;
    tickAircraftState(world.aircraft, dt, true, (effective, source) => emitPlayerHealing(world, effective, source, true));
    updateTacticalCores(world,dt);
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
    updateEnemies(world, dt);
    updateCrossfireGrids(world);
    if (world.pendingCoreSelections || world.ended) {
        enterCountdownIfClear(world);
        return;
    }
    updateDroneMovement(world, dt);
    updateDecoys(world, dt);
    updateDecoySalvo(world, dt);
    updateSkillCoreEffects(world,dt);
    if(world.pendingCoreSelections || world.ended){enterCountdownIfClear(world);return;}
    updateWarnings(world, dt);
    updateLaser(world, dt);
    if (world.pendingCoreSelections || world.ended) {
        enterCountdownIfClear(world);
        return;
    }
    updateMissileSalvo(world, dt);
    world.playerFireCooldown -= dt;
    if (!playerStunned(world.aircraft) && shouldAutoFire(world.aircraft) && world.laserCharge <= 0 && world.laserTicksRemaining <= 0 && world.playerFireCooldown <= 0) {
        fireBasic(world);
        world.playerFireCooldown = 1 / getEffectiveAircraftStats(world.aircraft).fireRate;
    }
    world.droneFireCooldown -= dt;
    if (world.aircraft.droneActive && world.droneFireCooldown <= 0) {
        fireDrone(world);
        const state = world.aircraft, stats = getEffectiveAircraftStats(state), ratio = getSkillRuntimeValues(state, "escort_drone").damageMultiplier;
        const rage = (state.coreState.timers.hawkRage || 0) > state.coreState.time;
        world.droneFireCooldown = 1 / (stats.fireRate * ratio * (rage ? 2 : 1));
    }
    updateProjectiles(world, dt);
    interceptMissiles(world);
    updateProjectileCollisions(world);
    settleMissileSalvos(world);
    updateEnemyPlayerCollisions(world);
    updateParticles(world, dt);
    if (world.aircraft.currentHp <= 0 || world.bossDefeated) {
        delete world.aircraft.coreState.emergencyRepair;
        const tactical=tacticalState(world);tactical.fields.length=0;tactical.grids.length=0;tactical.scraps.length=0;
        world.ended = true;
        world.pauseReasons.add("result");
    }
    enterCountdownIfClear(world);
}
export function ensureCoreSelection(world: CombatWorld): CoreCard[] | null {
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
    if (!applyCore(world.aircraft, card, world.random, id => dispatchCoreEvent("acquire", coreContext(world), id)))
        return false;
    world.coreSelectionCount++;
    world.aircraft.pendingMilestones.shift();
    world.pendingCoreSelections = world.aircraft.pendingMilestones.length;
    world.currentCoreChoices = null;
    world.coreSelectionEvent = null;
    if (world.pendingCoreSelections === 0)
        world.pauseReasons.delete("core");

    return true;
}
export function makeHudSnapshot(world: CombatWorld, paused: boolean, pauseLabel: string | null): AirCombatHudSnapshot {
    const boss = world.enemies.find((enemy) => enemy.type === "boss");
    return {
        stats: getEffectiveAircraftStats(world.aircraft),
        score: Math.max(0, Math.round(world.score)),
        comboKills: world.comboKills,
        comboMultiplier: getComboMultiplier(world.comboKills),
        elapsedSeconds: world.elapsed,
        waveLabel: `${COMBAT_WAVES[world.waveIndex].label}${world.waveState === "countdown" ? " · Đợt tiếp theo sau " + Math.ceil(world.waveTimer) + "s" : ""}`,
        waveCountdown: world.waveState === "countdown" ? Math.ceil(world.waveTimer) : 0,
        combatXpRequired: requiredCombatXp(world.aircraft.level),
        bossHp: boss?.hp || 0,
        bossMaxHp: boss?.maxHp || 0,
        bossPhase: world.bossPhase,
        paused,
        pauseLabel,
        cooldowns: { ...world.aircraft.cooldowns },
        droneActive: world.aircraft.droneActive,
        latestMessage: world.latestMessage,
    };
}
export function summarizeCombatWorld(world: CombatWorld): AirCombatRunSummary {
    const stats = getEffectiveAircraftStats(world.aircraft);
    const withoutRank: Omit<AirCombatRunSummary, "rank"> = {
        aircraftId: world.aircraft.aircraftId,
        score: Math.max(0, Math.round(world.score)),
        enemiesDefeated: world.enemiesDefeated,
        elitesDefeated: world.elitesDefeated,
        bossDefeated: world.bossDefeated,
        maxCombo: world.maxCombo,
        survivalSeconds: world.elapsed,
        combatLevel: world.aircraft.level,
        finalFirepower: stats.firepower,
        damageDealt: world.damageDealt,
        damageTaken: world.damageTaken,
        hitsReceived: world.hitsReceived,
        bossClearSeconds: world.bossClearSeconds,
        destroyed: world.aircraft.currentHp <= 0,
    };
    return { ...withoutRank, rank: calculateRunRank(withoutRank) };
}

export function canRerollCore(world:CombatWorld,slot:number):boolean {
    return !!world.currentCoreChoices && !!world.coreSelectionEvent && getRerollCandidates(world.aircraft,world.coreSelectionEvent,slot).length>0;
}
export function rerollCore(world:CombatWorld,slot:number):CoreCard[]|null {
    const event=world.coreSelectionEvent;
    if(!event || !world.currentCoreChoices)return null;
    const candidates=getRerollCandidates(world.aircraft,event,slot);
    if(!candidates.length)return null;
    const core=candidates[Math.min(candidates.length-1,Math.max(0,Math.floor(world.random()*candidates.length)))];
    event.rerollUsedBySlot[slot]=true;event.currentChoiceIds[slot]=core.id;
    world.currentCoreChoices=world.currentCoreChoices.map((c,i)=>i===slot?makeCoreCard(core):c);
    return world.currentCoreChoices;
}

/** Shared predicate for EMP, missile intercept, electronic guard and black holes. */
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
    return id !== undefined && (world.skillCores.enemyEffects.get(id)?.weakenUntil || 0)>world.elapsed ? 1-V.weakenReduction : 1;
}
function refundResource(world:CombatWorld,amount:number,restored:number):number {
    const state=world.aircraft,max=getEffectiveAircraftStats(state).maxResource;
    const actual=Math.max(0,Math.min(amount,max*V.manaRefundCap-restored,max-state.currentResource));
    state.currentResource+=actual;
    return actual;
}
function onDecoyAbsorb(world:CombatWorld,d:DecoyEntity,dashId?:string):void {
    if(d.clone)return;
    const state=world.aircraft,cast=world.skillCores.decoyCasts.get(d.castId);
    if(cast && hasCore(state,122) && (!dashId || !cast.dashIds.has(dashId))){
        if(dashId)cast.dashIds.add(dashId);
        cast.restored+=refundResource(world,getEffectiveAircraftStats(state).maxResource*V.heatRecovery,cast.restored);
    }
    if(!dashId && hasCore(state,123)) {
        const hits=world.skillCores.volleyHits.get(d.volleyId);
        if(!hits)return;
        emitVisual(world,{kind:"emp_pulse",x:d.x,y:d.y,size:V.decoyPulseRadius*2});
        for(const enemy of world.enemies)if(isHostileToPlayer(world,enemy) && !hits.has(enemy.id) && circleVsAircraft(d.x,d.y,V.decoyPulseRadius,getEnemyHitbox(enemy))){
            hits.add(enemy.id);applyDamageToEnemy(world,enemy,getEffectiveAircraftStats(state).firepower*V.decoyPulseDamage,"#fbbf24","skill","decoy");
        }
    }
}
function recordTargetSync(world:CombatWorld,enemy:EnemyEntity,hawk:boolean):void {
    if(enemy.hp<=0)return;
    const effects=skillEnemyEffects(world,enemy.id),now=world.elapsed;
    if(hawk)effects.hawkHit=now;else effects.phantomHit=now;
    if(effects.hawkHit!==undefined && effects.phantomHit!==undefined && Math.abs(effects.hawkHit-effects.phantomHit)<=V.syncWindow){
        world.skillCores.syncTarget=enemy.id;world.skillCores.syncUntil=now+V.syncDuration;
    }
}
function settleMissileSalvos(world:CombatWorld):void {
    const state=world.aircraft;
    world.skillCores.salvos=world.skillCores.salvos.filter(s=>{
        if(s.pending || s.live.size)return true;
        if(hasCore(state,130) && !world.ended){
            // A later completed empty salvo also replaces the previous buff.
            state.coreState.stacks.tacticalData=s.data;
            state.coreState.timers.tacticalData=s.data>0?state.coreState.time+V.dataDuration:0;
        }
        return false;
    });
}
function interceptMissiles(world:CombatWorld):void {
    if(!hasCore(world.aircraft,129))return;
    const removed=new Set<number>();
    for(const missile of world.projectiles){
        if(missile.skillId!=="missile_swarm" || missile.missileState!=="powered")continue;
        for(const hostile of world.projectiles){
            if(!isHostileBallisticProjectile(hostile) || removed.has(hostile.id))continue;
            // Relative swept segment tests simultaneous intersection, not an eraser radius.
            const distance=segmentDistance(0,0,missile.previousX-hostile.previousX,missile.previousY-hostile.previousY,missile.x-hostile.x,missile.y-hostile.y);
            if(distance>missile.radius+hostile.radius)continue;
            removed.add(hostile.id);missile.interceptCount=(missile.interceptCount || 0)+1;
            emitVisual(world,{kind:"absorb",x:hostile.x,y:hostile.y,size:16});
            if(missile.interceptCount>=V.interceptLimit){removed.add(missile.id);break;}
        }
    }
    for(let i=world.projectiles.length-1;i>=0;i--)if(removed.has(world.projectiles[i].id))recycleProjectile(world,i);
}
function updateCapturedProjectile(world:CombatWorld,p:ProjectileEntity,dt:number):boolean {
    if(!isHostileBallisticProjectile(p)){
        if(p.capturedMotion)Object.assign(p,p.capturedMotion);
        p.capturedMotion=undefined;p.capturedBy=undefined;return false;
    }
    let hole=world.skillCores.blackHoles.find(h=>h.id===p.capturedBy && h.until>world.elapsed);
    if(!hole){
        if(p.capturedMotion){Object.assign(p,p.capturedMotion);p.capturedMotion=undefined;}
        p.capturedBy=undefined;
        hole=world.skillCores.blackHoles.find(h=>h.until>world.elapsed && Math.hypot(p.x-h.x,p.y-h.y)<=V.holeRadius);
        if(hole){
            p.capturedBy=hole.id;
            p.capturedMotion={vx:p.vx,vy:p.vy,speed:p.speed,heading:p.heading,angularVelocity:p.angularVelocity,homing:p.homing,targetId:p.targetId,
                turnRate:p.turnRate,lifetime:p.lifetime,missileState:p.missileState,missileAge:p.missileAge,cruiseSpeed:p.cruiseSpeed,
                angularAcceleration:p.angularAcceleration,acceleration:p.acceleration,anchorX:p.anchorX,anchorY:p.anchorY,
                fuseStarted:p.fuseStarted,fuseRemaining:p.fuseRemaining,allowOffscreenEntry:p.allowOffscreenEntry,corridorEdge:p.corridorEdge,corridorSide:p.corridorSide};
        }
    }
    if(!hole)return false;
    // Only this controller moves the projectile. Original movement and remaining
    // lifetime are restored on release; position, damage and allegiance are not rewound.
    const dx=hole.x-p.x,dy=hole.y-p.y,distance=Math.hypot(dx,dy);
    const step=Math.min(distance,(28+132*Math.pow(Math.max(0,1-distance/V.holeRadius),1.5))*dt);
    if(distance>0){p.x+=dx/distance*step;p.y+=dy/distance*step;}
    if(distance-step<=V.holeCoreRadius)p.lifetime=0;
    return true;
}
function displaceEnemy(world:CombatWorld,e:EnemyEntity,dx:number,dy:number):void {
    const point=clampHitboxToGameplayRect(e.x+dx,e.y+dy,getEnemyHitbox(e));
    const appliedX=point.x-e.x,appliedY=point.y-e.y;
    e.x=point.x;e.y=point.y;e.baseX+=appliedX;
    // Keep committed dash trajectories attached to the translated airframe.
    if(e.dashRemaining>0 || e.kamikazeState==="dash"){
        e.dashStartX+=appliedX;e.dashStartY+=appliedY;e.dashEndX+=appliedX;e.dashEndY+=appliedY;
    }
}
function explodeClone(world:CombatWorld,d:DecoyEntity):void {
    emitVisual(world,{kind:"explosion",x:d.x,y:d.y,size:V.cloneExplosionRadius*2});
    const raw=getEffectiveAircraftStats(world.aircraft).firepower*V.cloneExplosionDamage;
    for(const e of world.enemies)if(isHostileToPlayer(world,e)&&circleVsAircraft(d.x,d.y,V.cloneExplosionRadius,getEnemyHitbox(e)))applyDamageToEnemy(world,e,raw,"#c4b5fd","skill","invisibility");
    d.remaining=0;
}
function updateSkillCoreEffects(world:CombatWorld,dt:number):void {
    const state=world.aircraft,c=state.coreState,r=world.skillCores,now=world.elapsed;
    if(c.stacks.shieldEmpPending){
        delete c.stacks.shieldEmpPending;
        emitVisual(world,{kind:"emp_pulse",x:world.playerX,y:world.playerY,size:720});
        for(let i=world.projectiles.length-1;i>=0;i--)if(isHostileBallisticProjectile(world.projectiles[i]))recycleProjectile(world,i);
    }
    if(hasCore(state,124)){
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
            if(!isHostileToPlayer(world,e) || e.x+e.radius<0 || e.x-e.radius>AIR_COMBAT_WORLD.width || e.y+e.radius<0 || e.y-e.radius>AIR_COMBAT_WORLD.height)continue;
            applyDamageToEnemy(world,e,getEffectiveAircraftStats(state).firepower*V.aftershockDamage,"#fbbf24","skill","heavy_bomb");
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
    r.blackHoles=r.blackHoles.filter(h=>h.until>now);
    for(const h of r.blackHoles)for(const e of world.enemies){
        if(!isHostileToPlayer(world,e))continue;
        const dx=h.x-e.x,dy=h.y-e.y,distance=Math.hypot(dx,dy);
        if(distance<=V.holeRadius && distance>.001 && e.type!=="boss"){
            const step=Math.min(distance,(10+22*Math.pow(1-distance/V.holeRadius,1.5))*dt);
            displaceEnemy(world,e,dx/distance*step,dy/distance*step);
        }
        if(circleVsAircraft(h.x,h.y,V.holeCoreRadius,getEnemyHitbox(e)))applyDamageToEnemy(world,e,getEffectiveAircraftStats(state).firepower*V.holeDamagePerSecond*dt,"#a78bfa","skill","heavy_bomb");
    }
    if(state.droneActive && hasCore(state,147) && (c.timers.electronicGuard || 0)<=c.time){
        c.timers.electronicGuard=c.time+V.guardCycle;
        emitVisual(world,{kind:"emp_pulse",x:world.droneX,y:world.droneY,size:V.guardRadius*2});
        for(let i=world.projectiles.length-1;i>=0;i--){const p=world.projectiles[i];if(isHostileBallisticProjectile(p)&&Math.hypot(p.x-world.droneX,p.y-world.droneY)<=V.guardRadius)recycleProjectile(world,i);}
    }
    if(r.syncUntil<=now || !world.enemies.some(e=>e.id===r.syncTarget&&isHostileToPlayer(world,e))){r.syncTarget=null;r.syncUntil=0;}
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
