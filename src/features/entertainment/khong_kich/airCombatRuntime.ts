import { getMissileVisual, missileRenderRotation } from "./airCombatAmmo";
import { applyPlayerStatus, addStatusMark, playerStunned, playerSkillLocked } from "./airCombatStatus";
import type { AttackMetadata, AttackTag, StatusPayload } from "./airCombatStatus";
import { bossMinCenterY } from "./airCombatHudLayout";
import { getBossTuning, SONIC_RING_SPEED, SONIC_RING_THICKNESS, SONIC_ACTIVE_SECONDS, LANE_ACTIVE_SECONDS } from "./airCombatBoss";
import type { BossAttackState, BossMajorAttack } from "./airCombatBoss";
import { COMBAT_WAVES, createWaveQueue, isElite } from "./airCombatWaves";
import { armorPenetration, coreId, dispatchCoreEvent, hasCore, negativeStatusDuration, outgoingCoreMultiplier } from "./airCombatCoreEffects";
import type { CoreContext, CoreTarget, DamageSource } from "./airCombatCoreEffects";
import { calculateDamage, endAircraftSkill, healAircraft } from "./airCombatAircraft";
import { AIR_COMBAT_WORLD, ENEMY_CONFIGS, GAMEPLAY_SAFE_RECT, SKILL_CONFIGS, } from "./airCombatConfig";
import { applyCore, applyDamageToAircraft, resolvePlayerDamage, calculateRunRank, canAcquirePlayerTarget, castSkill, clampCircleToGameplayRect, createAircraftCombatState, gainCombatXp, generateCoreChoices, getComboMultiplier, getEffectiveAircraftStats, getSkillRuntimeValues, getTargetPriority, requiredCombatXp, resolveBasicProjectileMultipliers, shouldAutoFire, tickAircraftState, } from "./airCombatEngine";
import { AirCombatHudSnapshot, AirCombatRunSummary, AircraftCombatState, AircraftId, CoreCard, EnemyType, SkillCastResult, SkillId, } from "./airCombatTypes";
export interface EnemyEntity {
    bossAttack?: BossAttackState;
    kamikazeState?: "approach" | "charge_1" | "dash_1" | "recover" | "charge_2" | "dash_2" | "shrapnel" | "resolved";
    lockedX?: number; lockedY?: number;
    dashDirX?: number; dashDirY?: number;
    dashTravelled?: number; dashPlannedDistance?: number;
    stateTimer?: number; attackAge?: number; hitResolved?: boolean;
    executionRecovery?: number;
    retaliationReady?: boolean;
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
    fuseStarted: boolean;
    fuseRemaining: number;
    id: number;
    owner: "player" | "enemy" | "drone";
    /** Presentation metadata only; collision and damage never consult this field. */
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
    ringSpeed?: number;
    insideTimer?: number;
    droneInsideTimer?: number;
    id: number;
    kind: "enemy_bomb" | "elite_lock" | "boss_strike" | "player_bomb" | "rail" | "acid" | "sonic" | "lane_laser" | "dash" | "emp" | "shock_clamp" | "retaliation";
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
export type CombatVisualEvent = DamageNumberEvent | (VisualEventBase & {
    kind: "hit" | "explosion" | "bomb" | "player_hit" | "absorb" | "lightning" | "drone_hit" | "missile_impact" | "flare_burst" | "emp_pulse" | "shield_ripple";
});
type NewVisualEvent = CombatVisualEvent extends infer E ? E extends CombatVisualEvent ? Omit<E, "id"> : never : never;
function emitVisual(world: CombatWorld, event: NewVisualEvent): void {
    world.visualEvents.push({ ...event, id: world.nextVisualId++ });
    if (world.visualEvents.length > 96)
        world.visualEvents.shift();
}
export interface CombatWorld {
    threats: { enemyId: number; cost: number; until: number }[];
    scheduledAttacks: { at: number; enemyId: number; kind: "needle" | "rail" | "execution" | "clamp" | "retaliation" | "radar_followup" | "acid_cage"; angle?: number; x?: number; y?: number }[];
    nextEliteControlAt: number;
    lastEliteControlStart: number;
    eliteSpecials: { enemyId: number; until: number; control: boolean }[];
    aircraft: AircraftCombatState;
    playerX: number;
    playerY: number;
    visualEvents: CombatVisualEvent[];
    nextVisualId: number;
    playerInputActive: boolean;
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
    missileLaunchIndex: number;
    missileSalvoTotal: number;
    missileLaunchCooldown: number;
    missilePairIds: number[];
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
        threats: [], scheduledAttacks: [], nextEliteControlAt: 0, lastEliteControlStart: -Infinity, eliteSpecials: [],
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
        missileLaunchIndex: 0,
        missileSalvoTotal: 0,
        missileLaunchCooldown: 0,
        missilePairIds: [],
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
        targetId: null, deathHandled: false, dashRemaining: 0, dashStartX: 0, dashStartY: 0, dashEndX: 0, dashEndY: 0, aegisUntil: 0, aegisReady: 0, recentDamage: [],
    };
}
function recycleEnemy(world: CombatWorld, index: number): void {
    const [enemy] = world.enemies.splice(index, 1);
    if (enemy) world.threats = world.threats.filter(t => t.enemyId !== enemy.id);
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
        aegisUntil: 0, aegisReady: 0, bossAttack: undefined, kamikazeState: type === "kamikaze" ? "approach" : undefined, lockedX: 0, lockedY: 0, dashDirX: 0, dashDirY: 1, dashTravelled: 0, dashPlannedDistance: 0, stateTimer: 0, attackAge: 0, hitResolved: false, executionRecovery: 0, retaliationReady: false });
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
        appearance: values.appearance,
        sourceEnemyId: values.sourceEnemyId, sourceEnemyType: values.sourceEnemyType, attackTag: values.attackTag, majorBossAttack: values.majorBossAttack, payload: values.payload,
        criticalAttack: values.criticalAttack ?? false,
        suppressive: values.suppressive ?? false, allowOffscreenEntry: values.allowOffscreenEntry ?? false, corridorEdge: values.corridorEdge, corridorSide: values.corridorSide,
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
    world.projectiles.push(projectile);
    return projectile;
}
function nearestEnemy(world: CombatWorld, x: number, y: number, excludedIds: readonly number[] = [], priority = false): EnemyEntity | null {
    let selected: EnemyEntity | null = null;
    let best = Number.POSITIVE_INFINITY;
    for (const enemy of world.enemies) {
        if (excludedIds.includes(enemy.id) || enemy.hp <= 0)
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
        addProjectile(world, { owner: "player", source: extra ? "basic" : source, skillId: sweeping && !extra ? "sweeping_cannon" : undefined,
            x: world.playerX + offset * 4, y: world.playerY - 17, vx: Math.cos(angle) * 480, vy: Math.sin(angle) * 480, radius: 3.2,
            rawDamage: stats.firepower * multiplier * context.rawMultiplier, volleyId, volleyHits: extra ? undefined : volleyHits,
            penetrationRemaining: hasCore(state, 89) ? 3 : 0,
            bounceRemaining: afterburner ? 2 : ricochet ? 1 : 0, bounceMultiplier: afterburner ? .50 : .40,
            color: playerProjectileColor(state.aircraftId, multiplier > 1.1) });
    };
    multipliers.forEach((multiplier, i) => spawn(multiplier, i - (multipliers.length - 1) / 2));
    if (context.extraShot)
        spawn(context.extraShot, 1, true);
}
function fireDrone(world: CombatWorld): void {
    const target = world.enemies.find(e => e.id === world.droneTargetId && e.hp > 0) || nearestEnemy(world, world.droneX, world.droneY, [], true);
    if (!target)
        return;
    world.droneTargetId = target.id;
    const stats = getEffectiveAircraftStats(world.aircraft), ratio = getSkillRuntimeValues(world.aircraft, "escort_drone").damageMultiplier;
    const angle = Math.atan2(target.y - world.droneY, target.x - world.droneX);
    addProjectile(world, { owner: "drone", source: "skill", skillId: "escort_drone", x: world.droneX, y: world.droneY,
        vx: Math.cos(angle) * 390, vy: Math.sin(angle) * 390, rawDamage: stats.firepower * ratio, radius: 2.8, color: "#d8b4fe" });
}
function chooseEnemyTarget(world: CombatWorld, homing: boolean): number | null {
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
    const decoy = world.decoys.find((candidate) => candidate.id === targetId && candidate.active);
    return decoy ? { x: decoy.x, y: decoy.y } : null;
}
function fireEnemyBullet(world: CombatWorld, enemy: EnemyEntity, angle: number, speed: number, rawDamage: number, homing = false, tag: AttackTag = "basic"): void {
    const adjustedSpeed = speed;
    addProjectile(world, {
        owner: "enemy",
        sourceEnemyId: enemy.id, sourceEnemyType: enemy.type, attackTag: tag, majorBossAttack: enemy.type === "boss" && tag !== "boss_wing" && tag !== "basic",
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
        targetId: chooseEnemyTarget(world, homing),
        turnRate: homing ? 1.1 : 0,
        color: homing ? "#fbbf24" : "#fb7185",
    });
}
function aimAtCurrentTarget(world: CombatWorld, enemy: EnemyEntity): number | null {
    const id = chooseEnemyTarget(world, false);
    const target = targetPosition(world, id);
    return target ? Math.atan2(target.y - enemy.y, target.x - enemy.x) : null;
}
function addWarning(world: CombatWorld, kind: WarningZone["kind"], x: number, y: number, radius: number, duration: number, rawDamage: number, owner: WarningZone["owner"], enemyId?: number, metadata: AttackMetadata = {}): void {
    if (world.warnings.length >= AIR_COMBAT_WORLD.maxWarnings)
        return;
    const clamped = clampCircleToGameplayRect(x, y, radius);
    world.warnings.push({
        id: world.nextId++,
        kind,
        ...metadata, sourceEnemyId: enemyId,
        enemyId,
        x: clamped.x,
        y: clamped.y,
        radius,
        remaining: duration,
        totalDuration: duration,
        rawDamage,
        owner,
    });
}
function reserveThreat(world: CombatWorld, enemy: EnemyEntity, cost: number, duration: number): boolean {
    world.threats = world.threats.filter(t => t.until > world.elapsed && world.enemies.some(e => e.id === t.enemyId && e.hp > 0));
    if (world.threats.reduce((n,t) => n+t.cost,0)+cost > Math.max(1, enemy.wave)) return false;
    world.threats.push({ enemyId: enemy.id, cost, until: world.elapsed+duration });
    return true;
}
function scheduleAttack(world: CombatWorld, enemy: EnemyEntity, kind: CombatWorld["scheduledAttacks"][number]["kind"], delay: number, extra: Partial<CombatWorld["scheduledAttacks"][number]> = {}): void {
    if (world.scheduledAttacks.length < 32) world.scheduledAttacks.push({ ...extra, at: world.elapsed+delay, enemyId: enemy.id, kind });
}
function queueEliteSpecial(world: CombatWorld, enemy: EnemyEntity, kind: CombatWorld["scheduledAttacks"][number]["kind"], delay: number, control: boolean): void {
    if (world.scheduledAttacks.some(a => a.enemyId === enemy.id && a.kind === kind)) return;
    world.eliteSpecials = world.eliteSpecials.filter(a => a.until > world.elapsed);
    const cap = enemy.eliteWave === 2 ? 2 : 1;
    let at = world.elapsed+delay;
    for(let guard=0;guard<32;guard++) {
        const overlapping=world.eliteSpecials.filter(a=>a.until>at);
        if(overlapping.length<cap)break;
        at=Math.min(...overlapping.map(a=>a.until));
    }
    if (control) at = Math.max(at, world.nextEliteControlAt);
    if (control) world.nextEliteControlAt = at + (enemy.eliteWave === 2 ? .2 : .85);
    world.eliteSpecials.push({ enemyId: enemy.id, until: at+1.7, control });
    scheduleAttack(world, enemy, kind, at-world.elapsed);
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
    if(enemy.type==="iron_fortress" && (attack.attackTag==="basic" || attack.attackTag==="burst") && addStatusMark(state,"suppression",4,enemy.id)>=(enemy.eliteWave===2?3:4)) {
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
        if(a.at>world.elapsed || enemy.stun>0) continue;
        if(["clamp","execution","retaliation","acid_cage"].includes(a.kind)) {
            const active=new Set(world.warnings.filter(w=>w.enemyId && ["shock_clamp","dash","retaliation","acid"].includes(w.kind)).map(w=>w.enemyId));
            for(const e of world.enemies)if(isElite(e.type)&&(e.dashRemaining>0||(e.executionRecovery??0)>0))active.add(e.id);
            if(active.has(enemy.id) || active.size >= (enemy.eliteWave===2?2:1)) {a.at=world.elapsed+.2;continue;}
            if(a.kind==="clamp") {
                if(world.elapsed-world.lastEliteControlStart<.2){a.at=world.elapsed+.2;continue;}
                world.lastEliteControlStart=world.elapsed;
            }
        }
        world.scheduledAttacks.splice(i,1);
        const damage=ENEMY_CONFIGS[enemy.type].projectileDamage*enemy.damageScale;
        if(a.kind==="needle") fireEnemyBullet(world,enemy,a.angle??Math.PI/2,285,damage*.45,false,"needle_pair");
        if(a.kind==="rail") {
            const point=clampCircleToGameplayRect(world.playerX+world.moveDirectionX*30,world.playerY+world.moveDirectionY*30,10);
            addLineWarning(world,enemy,"rail",point.x,point.y,.75,damage*.85);
        }
        if(a.kind==="execution") { addLineWarning(world,enemy,"dash",world.playerX,world.playerY,.7,ENEMY_CONFIGS[enemy.type].collisionDamage*enemy.damageScale); setMessage(world,"CRIMSON · LAO HÀNH QUYẾT",.7); }
        if(a.kind==="clamp") addWarning(world,"shock_clamp",world.playerX,world.playerY,44,.8,damage*.65,"enemy",enemy.id,{attackTag:"shock_clamp",payload:{stun:enemy.eliteWave===2?1.75:1.25}});
        if(a.kind==="retaliation") addWarning(world,"retaliation",enemy.x,enemy.y,35,.5,damage,"enemy",enemy.id,{attackTag:"burst"});
        if(a.kind==="radar_followup") { const aim=aimAtCurrentTarget(world,enemy); if(aim!==null) for(const offset of [-.3,0,.3]) fireEnemyBullet(world,enemy,aim+offset,180,damage*.8,true,"radar_lock"); }
        if(a.kind==="acid_cage") fireEnemy(world,enemy);
    }
}
function fireEnemy(world: CombatWorld, enemy: EnemyEntity): void {
    const config = ENEMY_CONFIGS[enemy.type], damage = config.projectileDamage * enemy.damageScale, aim = aimAtCurrentTarget(world, enemy);
    const target = targetPosition(world, chooseEnemyTarget(world, false));
    if(enemy.type==="acid_bomber") {
        const active=new Set(world.warnings.filter(w=>w.enemyId && ["shock_clamp","dash","retaliation","acid"].includes(w.kind)).map(w=>w.enemyId));
        for(const e of world.enemies)if(isElite(e.type)&&(e.dashRemaining>0||(e.executionRecovery??0)>0))active.add(e.id);
        if(active.has(enemy.id)||active.size>=(enemy.eliteWave===2?2:1)){enemy.fireCooldown=.2;return;}
    }
    enemy.attackCount++;
    if (tryNormalSpecial(world, enemy, damage, aim, target)) { enemy.fireCooldown = config.fireInterval; return; }
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
        : enemy.type === "acid_bomber" && enemy.eliteWave === 2 ? 4.8 : config.fireInterval * faster;
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
    const warning: WarningZone = { id: world.nextId++, kind, x, y, fromX: enemy.x, fromY: enemy.y, radius: kind === "dash" ? enemy.radius * .8 : 7,
        remaining: duration, totalDuration: duration, rawDamage: damage, owner: "enemy", enemyId: enemy.id, sourceEnemyId: enemy.id, sourceEnemyType: enemy.type, attackTag: kind === "rail" ? "rail" : enemy.type === "boss" ? "boss_dash" : "elite_execution", majorBossAttack: enemy.type === "boss" };
    world.warnings.push(warning);
}
function launchNextMissile(world: CombatWorld): boolean {
    if (world.missilesPending <= 0 || world.missileSalvoTotal <= 0)
        return false;
    const stats = getEffectiveAircraftStats(world.aircraft);
    const values = getSkillRuntimeValues(world.aircraft, "missile_swarm");
    const index = world.missileLaunchIndex;
    const angle = -Math.PI / 2 + (index % 2 ? 0.6 : -0.6);
    const side = index % 2 === 0 ? -1 : 1;
    const launch = clampCircleToGameplayRect(world.playerX + side * 32, world.playerY - 12, 4.5);
    const projectile = addProjectile(world, {
        owner: "player",
        x: launch.x,
        y: launch.y,
        vx: Math.cos(angle) * 260,
        vy: Math.sin(angle) * 260,
        radius: 4.5,
        rawDamage: stats.firepower * values.damageMultiplier,
        source: "skill", skillId: "missile_swarm", lifetime: 6,
        projectileKind: "missile",
        anchorX: side * 32,
        anchorY: -12,
        turnRate: 3.2,
        color: "#fb923c",
    });
    if (!projectile)
        return false;
    world.missilePairIds.push(projectile.id);
    world.missilesPending -= 1;
    world.missileLaunchIndex += 1;
    return true;
}
function updateMissileSalvo(world: CombatWorld, dt: number): void {
    if (world.missilesPending <= 0)
        return;
    world.missileLaunchCooldown = Math.max(0, world.missileLaunchCooldown - dt);
    if (world.missileLaunchCooldown > 0) return;
    if (world.missileLaunchIndex % 2 === 0) {
        if (world.missilePairIds.some(id => world.projectiles.some(p => p.id === id && p.missileState !== "powered"))) return;
        world.missilePairIds.length = 0;
        // Reserve both slots so a capped pool cannot create a half-pair.
        if (world.projectiles.filter(p => p.owner !== "enemy").length > AIR_COMBAT_WORLD.maxPlayerProjectiles - 2) return;
    }
    do {
        if (!launchNextMissile(world)) { world.missileLaunchCooldown = .05; return; }
    } while (world.missilesPending > 0 && world.missileLaunchIndex % 2 !== 0);
}
function queueMissileSwarm(world: CombatWorld): void {
    const count = getSkillRuntimeValues(world.aircraft, "missile_swarm").count;
    world.missilePairIds.length = 0;
    world.missilesPending = count;
    world.missileLaunchIndex = 0;
    world.missileSalvoTotal = count;
    world.missileLaunchCooldown = 0;
    updateMissileSalvo(world, 0);
}
function addDecoy(world: CombatWorld, clone: boolean, side = 0, lane = 0): void {
    if (world.decoys.length >= 64)
        return;
    const duration = getSkillRuntimeValues(world.aircraft, clone ? "invisibility" : "decoy").duration;
    const decoy = world.pools.decoys.pop() || {} as DecoyEntity;
    Object.assign(decoy, { id: world.nextId++, x: world.playerX, y: world.playerY, radius: clone ? 12 : 6, remaining: duration, life: duration, flightAge: 0, active: clone,
        originX: world.playerX, originY: world.playerY, side, lane, clone });
    world.decoys.push(decoy);
}
function updateDecoySalvo(world: CombatWorld, dt: number): void {
    if (world.decoyVolleys <= 0)
        return;
    world.decoyVolleyCd -= dt;
    while (world.decoyVolleys > 0 && world.decoyVolleyCd <= 0) {
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
    world.decoyVolleys = 0;
    world.laserCharge = 0;
    world.laserRemaining = 0;
    world.laserTicksRemaining = 0;
    world.dashRemaining = 0;
    for (const key of ["decoyCounter", "shieldArmor", "hawkRage"])
        delete world.aircraft.coreState.timers[key];
    while (world.decoys.length)
        world.pools.decoys.push(world.decoys.pop()!);
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
    if (hasCore(world.aircraft, 93))
        for (const id of SKILL_IDS)
            if (id !== skillId && (world.aircraft.cooldowns[id] || 0) > 0)
                world.aircraft.cooldowns[id] = Math.max(0, world.aircraft.cooldowns[id]! - SKILL_CONFIGS[id].cooldown * .15);
    switch (skillId) {
        case "decoy":
            world.decoyVolleys = values.count;
            world.decoyVolleyCd = 0;
            updateDecoySalvo(world, 0);
            break;
        case "missile_swarm":
            queueMissileSwarm(world);
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
            addDecoy(world, true);
            if (hasCore(world.aircraft, 38))
                healAircraft(world.aircraft, (getEffectiveAircraftStats(world.aircraft).maxHp - world.aircraft.currentHp) * .18);
            world.dashRemaining = .16;
            world.dashStartX = world.playerX;
            world.dashStartY = world.playerY;
            const end = clampCircleToGameplayRect(world.playerX + world.moveDirectionX * 88, world.playerY + world.moveDirectionY * 88, world.playerRadius);
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
    const end = clampCircleToGameplayRect(startX + dx, startY + dy, world.playerRadius);
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
        for (const w of world.warnings) if (w.kind === "acid" && Math.hypot(world.playerX-w.x, world.playerY-w.y) > w.radius+world.playerRadius) w.insideTimer = undefined;
        // Only player contacts: do not repeat weapon damage or advance enemy AI.
        for (let index = world.projectiles.length - 1; index >= 0; index--) {
            const p = world.projectiles[index];
            if (p.projectileKind !== "bullet" && p.missileState !== "powered") continue;
            if (p.owner === "enemy" && world.decoys.some(d => d.active && circleHit(p.x, p.y, p.radius, d.x, d.y, d.radius))) {
                emitVisual(world, { kind: "absorb", x: p.x, y: p.y, size: 24 });
                recycleProjectile(world, index);
                continue;
            }
            if (p.owner === "enemy" && circleHit(p.x, p.y, p.radius, world.playerX, world.playerY, world.playerRadius)) {
                if(p.projectileKind==="boss_missile")emitVisual(world,{kind:"missile_impact",x:p.x,y:p.y,size:42,missileFamily:"boss"});
                hitPlayer(world, p.rawDamage, "projectile", p);
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
    const target = world.enemies.find(enemy => enemy.id === world.droneTargetId && enemy.hp > 0)
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
        if (p.owner !== "enemy") continue;
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
    if (enemy.type === "jammer" && enemy.abilityCd <= 0) {
        for (const ally of world.enemies)
            if (ally.shieldSource === enemy.id) {
                ally.shield = 0;
                ally.shieldUntil = 0;
            }
        const allies = world.enemies.filter(e => e.id !== enemy.id && e.hp > 0 && Math.hypot(e.x - enemy.x, e.y - enemy.y) < 240);
        allies.sort((a, b) => Number(!["attacker", "bomber", "sniper"].includes(a.type)) - Number(!["attacker", "bomber", "sniper"].includes(b.type)) || Math.hypot(a.x - enemy.x, a.y - enemy.y) - Math.hypot(b.x - enemy.x, b.y - enemy.y));
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
        enemy.abilityCd = 10;
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
        if(world.warnings.length<AIR_COMBAT_WORLD.maxWarnings) world.warnings.push({id:world.nextId++,kind:"sonic",enemyId:enemy.id,sourceEnemyId:enemy.id,attackTag:"boss_sonic",majorBossAttack:true,owner:"enemy",
            x:enemy.x,y:enemy.y,radius:24,ringRadius:0,ringIndex:index,ringSpeed:tuning.ringSpeed,safeAngle,safeArc:tuning.safeArc*Math.PI/180,stage:"warning",remaining:tuning.sonicWarning,totalDuration:tuning.sonicWarning,rawDamage:tuning.sonic});
        state.patternTimer=tuning.ringInterval;
    } else if(attack==="lane_laser") {
        const width=GAMEPLAY_SAFE_RECT.width/tuning.laneCount, safe=Math.floor(world.random()*tuning.laneCount);
        for(let lane=0;lane<tuning.laneCount;lane++) if(lane!==safe && world.warnings.length<AIR_COMBAT_WORLD.maxWarnings)
            world.warnings.push({id:world.nextId++,kind:"lane_laser",enemyId:enemy.id,sourceEnemyId:enemy.id,attackTag:"boss_lane",majorBossAttack:true,owner:"enemy",x:GAMEPLAY_SAFE_RECT.left+(lane+.5)*width,y:GAMEPLAY_SAFE_RECT.top,radius:0,laneIndex:lane,laneWidth:width,stage:"warning",remaining:tuning.laneWarning,totalDuration:tuning.laneWarning,activeDuration:tuning.laneActive,rawDamage:tuning.lane});
        state.patternWaiting=true;
        state.patternTimer=tuning.laneRecovery;
    } else if(attack==="dash") {
        const target=targetPosition(world,chooseEnemyTarget(world,false));
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
    state.crossfireWidth=enrage?42:world.bossPhase>=3?54:74;
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
    const target=targetPosition(world,chooseEnemyTarget(world,false));
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
/** A miss transfers its XP budget without creating a kill; impacts use the normal death path. */
function resolveKamikaze(world: CombatWorld, enemy: EnemyEntity, impact: boolean): void {
    if (enemy.kamikazeState === "resolved") return;
    enemy.kamikazeState = "resolved";
    world.threats = world.threats.filter(t => t.enemyId !== enemy.id);
    if (!impact) {
        const recipient = world.enemies.find(e => e !== enemy && e.hp > 0);
        if (recipient) recipient.xp += enemy.xp;
        else if (world.spawnQueue.length) world.xpBudgetRemaining += enemy.xp;
        else { gainCombatXp(world.aircraft, enemy.xp); world.pendingCoreSelections = world.aircraft.pendingMilestones.length; }
        enemy.xp = 0; enemy.deathHandled = true;
    }
    enemy.hp = 0;
}
function updateKamikaze(world: CombatWorld, enemy: EnemyEntity, dt: number): void {
    enemy.attackAge = (enemy.attackAge ?? 0) + dt;
    // Corrupt state guard, far beyond either authored route (never the normal dash timer).
    if (enemy.attackAge > 30 || !Number.isFinite(enemy.x + enemy.y)) { resolveKamikaze(world, enemy, false); return; }
    const state = enemy.kamikazeState ?? "approach";
    if (state === "resolved") return;
    if (state === "approach" || state === "recover") {
        enemy.stateTimer = Math.max(0, (enemy.stateTimer ?? 0) - dt);
        if (enemy.stateTimer > 0) return;
        const target = targetPosition(world, chooseEnemyTarget(world, true));
        if (!target) return;
        if (state === "approach" && !reserveThreat(world, enemy, 1, 30)) return;
        enemy.lockedX = target.x; enemy.lockedY = target.y;
        enemy.dashEndX = target.x; enemy.dashEndY = target.y;
        enemy.kamikazeState = state === "approach" ? "charge_1" : "charge_2";
        enemy.stateTimer = state === "approach" ? 1.2 : .7;
        enemy.dashCharge = enemy.stateTimer;
        return;
    }
    if (state === "charge_1" || state === "charge_2") {
        enemy.stateTimer = Math.max(0, (enemy.stateTimer ?? 0) - dt);
        enemy.dashCharge = enemy.stateTimer;
        if (enemy.stateTimer > 0) return;
        const dx = enemy.lockedX! - enemy.x, dy = enemy.lockedY! - enemy.y, distance = Math.hypot(dx, dy);
        enemy.dashStartX = enemy.x; enemy.dashStartY = enemy.y;
        enemy.dashDirX = distance > .001 ? dx / distance : 0;
        enemy.dashDirY = distance > .001 ? dy / distance : 1;
        enemy.dashTravelled = 0; enemy.dashPlannedDistance = distance + 110;
        enemy.vx = enemy.dashDirX * 270; enemy.vy = enemy.dashDirY * 270;
        enemy.kamikazeState = state === "charge_1" ? "dash_1" : "dash_2";
        return;
    }
    if (state === "shrapnel") {
        fireFan(world, enemy, 5, ENEMY_CONFIGS.kamikaze.collisionDamage * enemy.damageScale * .3,
            Math.atan2(world.playerY - enemy.y, world.playerX - enemy.x), .35, 165, "kamikaze_dash");
        resolveKamikaze(world, enemy, false); return;
    }
    const oldX = enemy.x, oldY = enemy.y;
    const step = Math.min(270 * dt, Math.max(0, enemy.dashPlannedDistance! - enemy.dashTravelled!));
    enemy.x += enemy.dashDirX! * step; enemy.y += enemy.dashDirY! * step;
    enemy.dashTravelled! += step;
    // Earliest segment-circle entry wins, so a flare/drone can intercept before the player.
    let hit = Infinity, targetKind: string = "player";
    const consider = (x: number, y: number, radius: number, kind: "player" | "decoy" | "drone") => {
        const dx = enemy.x-oldX, dy = enemy.y-oldY, ox = oldX-x, oy = oldY-y;
        const r = enemy.radius * .78 + radius, a = dx*dx+dy*dy, c = ox*ox+oy*oy;
        const b = ox*dx+oy*dy, discriminant = b*b-a*c;
        const t = c <= 0 ? 0 : a > 0 && discriminant >= 0 ? (-b-Math.sqrt(discriminant))/a : Infinity;
        if (t >= 0 && t <= 1 && t < hit) { hit=t; targetKind=kind; }
    };
    for (const d of world.decoys) if (d.active) consider(d.x,d.y,d.radius,"decoy");
    if (world.aircraft.droneActive) consider(world.droneX,world.droneY,9,"drone");
    consider(world.playerX,world.playerY,world.playerRadius,"player");
    if (hit !== Infinity && !enemy.hitResolved) {
        enemy.hitResolved = true;
        enemy.x = oldX + (enemy.x-oldX)*hit; enemy.y = oldY + (enemy.y-oldY)*hit;
        const damage = ENEMY_CONFIGS.kamikaze.collisionDamage * enemy.damageScale;
        if (targetKind === "player") hitPlayer(world,damage,"collision",{sourceEnemyId:enemy.id,sourceEnemyType:"kamikaze",attackTag:"kamikaze_dash"});
        else if (targetKind === "drone") hitDrone(world,damage);
        emitVisual(world,{kind:"explosion",x:enemy.x,y:enemy.y,size:38});
        resolveKamikaze(world,enemy,true); return;
    }
    if (enemy.dashTravelled! >= enemy.dashPlannedDistance!) {
        enemy.vx = 0; enemy.vy = 0;
        if (state === "dash_1" && enemy.wave >= 4) { enemy.kamikazeState="recover"; enemy.stateTimer=.55; }
        else if (state === "dash_2" && enemy.wave >= 5) enemy.kamikazeState="shrapnel";
        else resolveKamikaze(world,enemy,false);
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
        const holdingTelegraph = (enemy.type === "boss" && (enemy.bossAttack?.crossfirePending ?? 0)>0 && !enemy.bossAttack?.patternWaiting) || world.warnings.some(w => w.enemyId === enemy.id && (w.kind === "rail" || w.kind === "dash" || w.kind === "sonic" || w.kind === "retaliation"));
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
                if (!attack.dashHitPlayer && segmentDistance(world.playerX, world.playerY, startX, startY, enemy.x, enemy.y) < enemy.radius * .8 + world.playerRadius) {
                    hitPlayer(world, attack.dashDamage, "collision", { sourceEnemyId: enemy.id, attackTag: "boss_dash", majorBossAttack: true });
                    attack.dashHitPlayer = true;
                }
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
            if (segmentDistance(world.playerX, world.playerY, oldX, oldY, enemy.x, enemy.y) < enemy.radius+world.playerRadius)
                hitPlayer(world, ENEMY_CONFIGS[enemy.type].collisionDamage*enemy.damageScale, "collision", { sourceEnemyId: enemy.id, attackTag: "elite_execution" });
            if (enemy.dashRemaining === 0) enemy.executionRecovery = .45;
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
        // Kamikaze owns its route, including the bounded 110px overshoot outside the arena.
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
        if (enemy.type === "elite" && enemy.eliteWave === 2 && enemy.secondaryCd <= 0) {
            fireFan(world, enemy, 7, 80 * enemy.damageScale, aimAtCurrentTarget(world, enemy) ?? Math.PI / 2);
            enemy.secondaryCd = Infinity;
        }
        if (enemy.type === "radar_hunter" && enemy.secondaryCd <= 0) {
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
    const current = world.enemies.find(e => e.id === p.targetId && e.hp > 0);
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
    if (projectile.owner === "enemy") {
        target = targetPosition(world, projectile.targetId);
        if (!target || (projectile.targetId === PLAYER_TARGET_ID && !canAcquirePlayerTarget(world.aircraft))) {
            projectile.targetId = chooseEnemyTarget(world, true);
            target = targetPosition(world, projectile.targetId);
        }
    }
    else {
        const enemy = world.enemies.find((candidate) => candidate.id === projectile.targetId && candidate.hp > 0) ||
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
function coreContext(world: CombatWorld, extra: Partial<CoreContext> = {}): CoreContext {
    return { state: world.aircraft, stats: getEffectiveAircraftStats(world.aircraft), rawMultiplier: 1,
        heal: amount => { healAircraft(world.aircraft, amount); },
        reduceCooldowns: (seconds, except) => { for (const id of SKILL_IDS)
            if (id !== except && (world.aircraft.cooldowns[id] || 0) > 0)
                world.aircraft.cooldowns[id] = Math.max(0, world.aircraft.cooldowns[id]! - seconds); },
        explode: (target, raw) => { world.effectQueue.push({ kind: "explosion", target, raw }); },
        lightning: (target, raw) => { world.effectQueue.push({ kind: "lightning", target, raw }); },
        tomahawk: () => {
            // Preserve the existing count (up to three live enemies), but defer locks.
            const count = Math.min(3, world.enemies.reduce((n, e) => n + (e.hp > 0 ? 1 : 0), 0));
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
function applyDamageToEnemy(world: CombatWorld, enemy: EnemyEntity, rawDamage: number, color = "#fde68a", source: DamageSource = "weapon", skillId?: SkillId, volleyHits?: Map<number, number>): number {
    if (enemy.hp <= 0 || rawDamage <= 0 || world.bossDefeated)
        return 0;
    const state = world.aircraft, time = state.coreState.time, stats = getEffectiveAircraftStats(state), target = targetMetadata(enemy);
    const canCrit = source !== "lightning" && ((!skillId && source !== "skill" && source !== "burn") || hasCore(state, 53));
    const effectiveStats = canCrit ? stats : { ...stats, criticalChance: 0 };
    const armor = enemy.armor * (enemy.burn > 0 ? .7 : 1) * (enemy.weakUntil > time ? .92 : 1) * (1 - armorPenetration(state));
    const multiplier = outgoingCoreMultiplier(state, target, source, Math.hypot(enemy.x - world.playerX, enemy.y - world.playerY), GAMEPLAY_SAFE_RECT.height);
    const firstVolleyDamage = volleyHits?.get(enemy.id);
    // Snapshot the first projectile after outgoing modifiers/crit, before target mitigation.
    // Later projectiles in this same fan retain exactly 15% of that value, without a second crit multiplier.
    const resolved = firstVolleyDamage === undefined
        ? resolvePlayerDamage(rawDamage * multiplier, armor, effectiveStats, world.random)
        : { actualDamage: calculateDamage(firstVolleyDamage * .15, armor), critical: false, multiplier: 1 };
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
    damage = Math.min(enemy.hp, damage);
    enemy.hp = Math.max(0, enemy.hp - damage);
    if (damage + absorbed > 0) {
        emitVisual(world, { kind: "damage_number", x: enemy.x, y: enemy.y, size: enemy.radius, amount: damage + absorbed, target: "enemy", critical: resolved.critical, shielded: aegis || absorbed > 0, entityId: enemy.id });
        emitVisual(world, { kind: "hit", x: enemy.x, y: enemy.y, size: enemy.radius, entityId: enemy.id });
        world.damageDealt += damage;
        addParticles(world, enemy.x, enemy.y, color, 2);
        const ctx = coreContext(world, { target, damage, source });
        if (source !== "burn" && source !== "lightning")
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
                if (enemy.hp > 0 && Math.hypot(enemy.x - effect.target.x, enemy.y - effect.target.y) <= 46 + enemy.radius)
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
}
function applySecondaryHits(world: CombatWorld, projectile: ProjectileEntity, primary: EnemyEntity): void {
    if (projectile.bounceRemaining <= 0)
        return;
    const next = nearestEnemy(world, primary.x, primary.y, projectile.hitIds);
    if (!next)
        return;
    const angle = Math.atan2(next.y - primary.y, next.x - primary.x);
    const bounced = addProjectile(world, { owner: projectile.owner, source: projectile.source, skillId: projectile.skillId,
        x: primary.x, y: primary.y, vx: Math.cos(angle) * 460, vy: Math.sin(angle) * 460, radius: projectile.radius,
        rawDamage: projectile.rawDamage * projectile.bounceMultiplier, homing: true, targetId: next.id, turnRate: 7,
        bounceRemaining: projectile.bounceRemaining - 1, bounceMultiplier: projectile.bounceMultiplier, color: "#c4b5fd" });
    if (bounced)
        bounced.hitIds.push(...projectile.hitIds);
}
function hitPlayer(world: CombatWorld, rawDamage: number, kind: "projectile" | "collision" | "hazard" = "projectile", attack: AttackMetadata & { x?:number; y?:number; previousX?:number; previousY?:number } = {}): void {
    const state = world.aircraft, c = state.coreState, stats = getEffectiveAircraftStats(state);
    if (world.ended || world.playerInvulnerability > 0 || state.currentHp <= 0 || rawDamage <= 0 || world.waveState !== "combat")
        return;
    let multiplier = (state.activeEffects.armor_shield || 0) > 0 ? getSkillRuntimeValues(state, "armor_shield").damageTakenMultiplier : 1;
    if (kind === "collision" && hasCore(state, 65))
        multiplier *= .8;
    if (kind === "projectile" && hasCore(state, 103) && state.currentHp < stats.maxHp * .3)
        multiplier *= .88;
    if (hasCore(state, 72) && c.time - c.lastDamage >= 5)
        multiplier *= .6;
    let damage = calculateDamage(rawDamage, stats.armor, multiplier), absorbed = 0;
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
        const dx=(attack.previousX ?? attack.x ?? source?.x ?? world.playerX)-world.playerX;
        const dy=(attack.previousY ?? attack.y ?? source?.y ?? world.playerY-1)-world.playerY;
        const titan=state.aircraftId==="breaker" && (state.activeEffects.armor_shield??0)>0;
        const rx=titan?46:30,ry=titan?54:30,denom=Math.hypot(dx/rx,dy/ry);
        const localX=denom>.0001?dx/denom:0,localY=denom>.0001?dy/denom:-ry;
        emitVisual(world,{kind:"shield_ripple",x:world.playerX+localX,y:world.playerY+localY,fromX:localX,fromY:localY,attachedToPlayer:true,size:18});
    }
    if (damage <= 0) {
        if (absorbed > 0)
            emitVisual(world, { kind: "damage_number", x: world.playerX, y: world.playerY, size: 36, amount: absorbed, target: "player", critical: false, shielded: true });
        return;
    }
    let survived = false;
    if (damage >= state.currentHp && hasCore(state, 90) && !c.consumed.has(coreId(90))) {
        c.consumed.add(coreId(90));
        damage = Math.max(0, state.currentHp - 1);
        state.currentHp = 1;
        survived = true;
        world.playerInvulnerability = 2;
        healAircraft(state, stats.maxHp * .35);
        setMessage(world, "TỪ CHỐI TỬ THẦN · ĐÃ KÍCH HOẠT", 2);
    }
    else {
        damage = Math.min(state.currentHp, damage);
        state.currentHp = Math.max(0, state.currentHp - damage);
    }
    if (damage > 0) onHostileDamage(world, attack);
    c.lastDamage = c.time;
    dispatchCoreEvent("damageTaken", coreContext(world, { damage }));
    emitVisual(world, { kind: "damage_number", x: world.playerX, y: world.playerY, size: 36, amount: damage, target: "player", critical: false, shielded: multiplier < 1 || absorbed > 0 });
    emitVisual(world, { kind: "player_hit", x: world.playerX, y: world.playerY, size: 36 });
    world.damageTaken += damage;
    world.hitsReceived++;
    world.comboKills = 0;
    world.comboTimer = 0;
    if (!survived)
        world.playerInvulnerability = AIR_COMBAT_WORLD.playerInvulnerabilitySeconds;
    addParticles(world, world.playerX, world.playerY, "#fb7185", 13);
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
function updateProjectileCollisions(world: CombatWorld): void {
    // New child projectiles are visited next tick, never recursively in their birth tick.
    for (let i = world.projectiles.length - 1; i >= 0; i--) {
        const p = world.projectiles[i];
        if (!p || world.ended)
            break;
        if (p.projectileKind !== "bullet" && p.missileState !== "powered" && !p.bigBang)
            continue;
        const touches = (x: number, y: number, radius: number) => p.bigBang && p.missileState!=="powered" ? circleHit(p.x,p.y,p.radius,x,y,radius) : segmentDistance(x, y, p.previousX, p.previousY, p.x, p.y) <= p.radius + radius;
        if (p.owner === "enemy") {
            // Every hostile projectile can be absorbed, regardless of its original target.
            if (world.decoys.some(d => d.active && touches(d.x, d.y, d.radius))) {
                emitVisual(world, { kind: "absorb", x: p.x, y: p.y, size: 24 });
                recycleProjectile(world, i);
                continue;
            }
            if (world.aircraft.droneActive && touches(world.droneX, world.droneY, 10)) {
                hitDrone(world, p.rawDamage);
                recycleProjectile(world, i);
                continue;
            }
            if (touches(world.playerX, world.playerY, world.playerRadius)) {
                if(p.projectileKind==="boss_missile")emitVisual(world,{kind:"missile_impact",x:p.x,y:p.y,size:42,missileFamily:"boss"});
                hitPlayer(world, p.rawDamage, "projectile", p);
                recycleProjectile(world, i);
            }
            continue;
        }
        let consumed = false;
        // Sort along this segment to give piercing hits an unambiguous near-to-far order.
        const hits = world.enemies.filter(e => e.hp > 0 && !p.hitIds.includes(e.id) && touches(e.x, e.y, e.radius));
        hits.sort((a, b) => Math.hypot(a.x - p.previousX, a.y - p.previousY) - Math.hypot(b.x - p.previousX, b.y - p.previousY));
        for (const enemy of hits) {
            if (p.bigBang) {
                detonateBigBang(world, p);
                consumed = true;
                break;
            }
            if (p.projectileKind === "missile") emitVisual(world, { kind:"missile_impact", x:p.x, y:p.y, size:32, missileFamily:p.skillId==="missile_swarm"?"viper":"tomahawk" });
            p.hitIds.push(enemy.id);
            const shieldBefore=enemy.shield;
            applyDamageToEnemy(world, enemy, p.rawDamage, p.color, p.source, p.skillId, p.volleyHits);
            if(enemy.shield<shieldBefore)emitVisual(world,{kind:"shield_ripple",x:p.x,y:p.y,size:23});
            applySecondaryHits(world, p, enemy);
            if (p.penetrationRemaining > 0) {
                p.penetrationRemaining--;
                const fraction = [.7, .5, .3][2 - p.penetrationRemaining] ?? .3;
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
        if (enemy.hp <= 0)
            continue;
        if (enemy.type === "kamikaze" && (enemy.kamikazeState === "dash_1" || enemy.kamikazeState === "dash_2")) { updateKamikaze(world,enemy,0); continue; }
        if (world.aircraft.droneActive && circleHit(enemy.x, enemy.y, enemy.radius * .78, world.droneX, world.droneY, 9))
            hitDrone(world, ENEMY_CONFIGS[enemy.type].collisionDamage * enemy.damageScale);
        if (!circleHit(enemy.x, enemy.y, enemy.radius * .78, world.playerX, world.playerY, world.playerRadius))
            continue;
        // Share the one-hit dash guard with swept boss motion and pointer movement.
        if (enemy.type === "boss" && enemy.bossAttack?.majorAttack === "dash") {
            if (enemy.dashRemaining > 0 && !enemy.bossAttack.dashHitPlayer) {
                hitPlayer(world, enemy.bossAttack.dashDamage, "collision", { sourceEnemyId: enemy.id, attackTag: "boss_dash", majorBossAttack: true });
                enemy.bossAttack.dashHitPlayer = true;
            }
        } else
            hitPlayer(world, ENEMY_CONFIGS[enemy.type].collisionDamage * enemy.damageScale, "collision", { sourceEnemyId: enemy.id, sourceEnemyType: enemy.type, attackTag: enemy.type === "kamikaze" ? "kamikaze_dash" : "elite_execution" });
        if (enemy.type === "kamikaze") resolveKamikaze(world, enemy, true);
    }
    resolveDeathsAndEffects(world);
}
function detonateBigBang(world: CombatWorld, projectile: ProjectileEntity): void {
    emitVisual(world,{kind:"missile_impact",x:projectile.x,y:projectile.y,size:90,missileFamily:"bigbang"});
    emitVisual(world, { kind: "bomb", x: projectile.x, y: projectile.y, size: 360 });
    for (const enemy of world.enemies) {
        if (enemy.hp <= 0 || enemy.x + enemy.radius < 0 || enemy.x - enemy.radius > AIR_COMBAT_WORLD.width || enemy.y + enemy.radius < 0 || enemy.y - enemy.radius > AIR_COMBAT_WORLD.height)
            continue;
        applyDamageToEnemy(world, enemy, projectile.rawDamage, "#fbbf24", "skill", "heavy_bomb");
        if (hasCore(world.aircraft, 33))
            enemy.stun = Math.max(enemy.stun, 4);
    }
}
function detonateWarning(world: CombatWorld, w: WarningZone): void {
    // Iron Fortress's follow-up shot owns the damage; this is only its telegraph.
    if (w.kind === "elite_lock")
        return;
    const enemy = world.enemies.find(e => e.id === w.enemyId && e.hp > 0);
    if (w.kind === "retaliation") {
        if (enemy) {
            const safe=Math.floor(world.random()*12);
            for(let i=0;i<12;i++) if(i!==safe && i!==(safe+6)%12) fireEnemyBullet(world,enemy,i*Math.PI/6,155,w.rawDamage,false,"burst");
        }
        return;
    }
    if (w.kind === "rail") {
        if (!enemy)
            return;
        const angle = Math.atan2(w.y - (w.fromY ?? enemy.y), w.x - (w.fromX ?? enemy.x));
        addProjectile(world, { owner: "enemy", appearance: "dangerous", criticalAttack: true, x: w.fromX ?? enemy.x, y: w.fromY ?? enemy.y,
            vx: Math.cos(angle) * 650, vy: Math.sin(angle) * 650, rawDamage: w.rawDamage, radius: 4, sourceEnemyId: enemy.id, sourceEnemyType: enemy.type, attackTag: "rail" });
        return;
    }
    if (w.kind === "dash") {
        if (!enemy)
            return;
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
    if (Math.hypot(world.playerX - w.x, world.playerY - w.y) <= w.radius + world.playerRadius)
        hitPlayer(world, w.rawDamage, "hazard", w);
    if (world.aircraft.droneActive && Math.hypot(world.droneX - w.x, world.droneY - w.y) <= w.radius + 10)
        hitDrone(world, w.rawDamage);
}
function hitBossWarningPlayer(world: CombatWorld, w: WarningZone, previousRadius = w.ringRadius ?? 0): void {
    if (w.stage !== "active" || w.hitPlayer) return;
    if (w.kind === "sonic") {
        const angle = Math.atan2(world.playerY - w.y, world.playerX - w.x);
        const insideGap = Math.abs(shortestAngle(angle - (w.safeAngle ?? Math.PI / 2))) <= (w.safeArc ?? 0) / 2;
        if (insideGap) return;
        const distance = Math.hypot(world.playerX - w.x, world.playerY - w.y);
        const thickness = world.playerRadius + SONIC_RING_THICKNESS / 2;
        if (distance < previousRadius - thickness || distance > (w.ringRadius ?? 0) + thickness) return;
    } else if (w.kind === "lane_laser") {
        if (Math.abs(world.playerX - w.x) > (w.laneWidth ?? 0) / 2 + world.playerRadius) return;
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
        // A stun holds an unfinished targeted telegraph; it never discards BigBang's stun.
        if (w.enemyId && world.enemies.some(e => e.id === w.enemyId && e.stun > 0))
            continue;
        w.remaining -= dt;
        if (w.stage === "active") {
            w.age = (w.age || 0) + dt;
            if (w.kind === "acid") {
                const inside = Math.hypot(world.playerX - w.x, world.playerY - w.y) <= w.radius + world.playerRadius;
                if (!inside) w.insideTimer = undefined;
                else {
                    w.insideTimer = (w.insideTimer ?? .25) - dt;
                    if (w.insideTimer <= 1e-8) { w.insideTimer += 1; hitPlayer(world, w.rawDamage, "hazard", w); }
                }
                const droneInside = world.aircraft.droneActive && Math.hypot(world.droneX-w.x, world.droneY-w.y) <= w.radius+10;
                if (!droneInside) w.droneInsideTimer = undefined;
                else {
                    w.droneInsideTimer = (w.droneInsideTimer ?? .25) - dt;
                    if (w.droneInsideTimer <= 1e-8) { w.droneInsideTimer += 1; hitDrone(world, w.rawDamage); }
                }
            }
            else if (w.kind === "sonic") {
                const speed = w.ringSpeed ?? SONIC_RING_SPEED;
                const radius = w.age * speed, previous = Math.max(0, radius - dt * speed);
                w.ringRadius = radius;
                hitBossWarningPlayer(world, w, previous);
            }
            else if (w.kind === "lane_laser") hitBossWarningPlayer(world, w);
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
            if (enemy.hp > 0 && enemy.y < world.playerY && Math.abs(enemy.x - world.playerX) <= enemy.radius + 16)
                applyDamageToEnemy(world, enemy, raw, "#c4b5fd", "skill", "focus_laser");
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
        p.x += p.vx * dt;
        p.y += p.vy * dt;
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
    for (let i = world.decoys.length - 1; i >= 0; i--) {
        const d = world.decoys[i];
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
}
function updatePlayerDash(world: CombatWorld, dt: number): void {
    if (playerStunned(world.aircraft) || world.dashRemaining <= 0)
        return;
    world.dashRemaining = Math.max(0, world.dashRemaining - dt);
    const t = 1 - world.dashRemaining / .16;
    world.playerX = world.dashStartX + (world.dashEndX - world.dashStartX) * t;
    world.playerY = world.dashStartY + (world.dashEndY - world.dashStartY) * t;
    world.aircraft.coreState.lastMove = world.aircraft.coreState.time;
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
    tickAircraftState(world.aircraft, dt, true);
    updateEncounter(world, dt);
    world.playerInvulnerability = Math.max(0, world.playerInvulnerability - dt);
    world.comboTimer = Math.max(0, world.comboTimer - dt);
    if (world.comboTimer <= 0)
        world.comboKills = 0;
    dispatchCoreEvent("tick", coreContext(world, { dt }));
    updatePlayerDash(world, dt);
    updateScheduledAttacks(world);
    updateEnemies(world, dt);
    if (world.pendingCoreSelections || world.ended) {
        enterCountdownIfClear(world);
        return;
    }
    updateDroneMovement(world, dt);
    updateDecoys(world, dt);
    updateDecoySalvo(world, dt);
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
    updateProjectileCollisions(world);
    updateEnemyPlayerCollisions(world);
    updateParticles(world, dt);
    if (world.aircraft.currentHp <= 0 || world.bossDefeated) {
        world.ended = true;
        world.pauseReasons.add("result");
    }
    enterCountdownIfClear(world);
}
export function ensureCoreSelection(world: CombatWorld): CoreCard[] | null {
    world.pendingCoreSelections = world.aircraft.pendingMilestones.length;
    while (world.pendingCoreSelections > 0) {
        if (!world.currentCoreChoices)
            world.currentCoreChoices = generateCoreChoices(world.aircraft, world.coreSelectionCount + 1, world.random);
        if (world.currentCoreChoices.length) {
            world.pauseReasons.add("core");
            return world.currentCoreChoices;
        }
        // Exhausted finite catalog: consume only this milestone and continue safely.
        world.aircraft.pendingMilestones.shift();
        world.pendingCoreSelections = world.aircraft.pendingMilestones.length;
        world.coreSelectionCount++;
        world.currentCoreChoices = null;
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
