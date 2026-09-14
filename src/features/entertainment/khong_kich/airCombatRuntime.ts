import { COMBAT_WAVES, createWaveQueue, isElite } from "./airCombatWaves";
import { armorPenetration, coreId, dispatchCoreEvent, hasCore, negativeStatusDuration, outgoingCoreMultiplier } from "./airCombatCoreEffects";
import type { CoreContext, CoreTarget, DamageSource } from "./airCombatCoreEffects";
import { calculateDamage, endAircraftSkill, healAircraft } from "./airCombatAircraft";
import { AIR_COMBAT_WORLD, ENEMY_CONFIGS, GAMEPLAY_SAFE_RECT, SKILL_CONFIGS, } from "./airCombatConfig";
import { applyCore, applyDamageToAircraft, resolvePlayerDamage, calculateRunRank, canAcquirePlayerTarget, castSkill, clampCircleToGameplayRect, createAircraftCombatState, gainCombatXp, generateCoreChoices, getComboMultiplier, getEffectiveAircraftStats, getSkillRuntimeValues, getTargetPriority, requiredCombatXp, resolveBasicProjectileMultipliers, shouldAutoFire, tickAircraftState, } from "./airCombatEngine";
import { AirCombatHudSnapshot, AirCombatRunSummary, AircraftCombatState, AircraftId, CoreCard, EnemyType, SkillCastResult, SkillId, } from "./airCombatTypes";
export interface EnemyEntity {
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
export interface ProjectileEntity {
    id: number;
    owner: "player" | "enemy" | "drone";
    /** Presentation metadata only; collision and damage never consult this field. */
    appearance?: "dangerous" | "boss";
    source: DamageSource;
    skillId?: SkillId;
    lifetime: number;
    volleyId: number;
    volleyHits?: Map<number, number>;
    initialDamage: number;
    previousX: number;
    previousY: number;
    bigBang: boolean;
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
export interface WarningZone {
    id: number;
    kind: "enemy_bomb" | "elite_lock" | "boss_strike" | "player_bomb" | "rail" | "acid" | "pulse" | "dash";
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
    kind: "hit" | "explosion" | "bomb" | "player_hit" | "absorb" | "lightning" | "drone_hit";
});
type NewVisualEvent = CombatVisualEvent extends infer E ? E extends CombatVisualEvent ? Omit<E, "id"> : never : never;
function emitVisual(world: CombatWorld, event: NewVisualEvent): void {
    world.visualEvents.push({ ...event, id: world.nextVisualId++ });
    if (world.visualEvents.length > 96)
        world.visualEvents.shift();
}
export interface CombatWorld {
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
export function createCombatWorld(aircraftId: AircraftId, random: () => number = Math.random): CombatWorld {
    // Separate deterministic stream: visual density must never consume combat rolls.
    let visualSeed = 0x41c6ce57;
    const visualRandom = () => {
        visualSeed = (Math.imul(visualSeed, 1664525) + 1013904223) >>> 0;
        return visualSeed / 0x100000000;
    };
    const initial = clampCircleToGameplayRect(AIR_COMBAT_WORLD.width / 2, GAMEPLAY_SAFE_RECT.bottom - 52, 10);
    const droneInitial = clampCircleToGameplayRect(initial.x - 28, initial.y + 8, 9);
    return {
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
        pauseReasons: new Set(), waveIndex: 0, waveState: "announcement", waveTimer: 1.15, spawnQueue: createWaveQueue(0, random), spawnedInWave: 0,
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
    if (enemy && world.pools.enemies.length < AIR_COMBAT_WORLD.maxEnemies) {
        world.pools.enemies.push(enemy);
    }
}
function acquireProjectile(world: CombatWorld): ProjectileEntity {
    return world.pools.projectiles.pop() || {
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
        world.pools.projectiles.push(projectile);
    }
}
function acquireParticle(world: CombatWorld): ParticleEntity {
    return world.pools.particles.pop() || {
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
    const radar = type === "radar_hunter";
    const hpScale = radar ? 1 : wave.hp, armorScale = radar ? 1 : wave.armor;
    const x = GAMEPLAY_SAFE_RECT.left + config.radius + world.random() * (GAMEPLAY_SAFE_RECT.width - config.radius * 2);
    Object.assign(enemy, { id: world.nextId++, type, x, y: GAMEPLAY_SAFE_RECT.top + config.radius, baseX: x, vx: 0, vy: config.speed, radius: config.radius,
        hp: config.baseHp * hpScale, maxHp: config.baseHp * hpScale, armor: config.baseArmor * armorScale, age: 0, fireCooldown: 1.2 + world.random() * .8,
        phaseSeed: world.random() * Math.PI * 2, wave: wave.normal, dashCharge: 1.2, xp: wave.elite ? wave.xp : Math.round(config.combatXp * wave.xp),
        damageScale: radar ? 1 : wave.damage, eliteWave: wave.elite, stun: 0, burn: 0, burnDamage: 0, burnTick: 0, weakHits: 0, weakUntil: 0, lightningUntil: 0,
        shield: 0, shieldUntil: 0, shieldSource: 0, abilityCd: type === "jammer" ? 4.5 : type === "iron_fortress" ? 10 : 7.5, secondaryCd: 10, tertiaryCd: 10,
        burst: 0, burstCd: 0, burstAngle: 0, attackCount: 0, targetId: null, deathHandled: false, dashRemaining: 0, dashStartX: 0, dashStartY: 0, dashEndX: 0, dashEndY: 0,
        aegisUntil: 0, aegisReady: 0 });
    enemy.recentDamage.length = 0;
    if (type === "boss") {
        enemy.x = AIR_COMBAT_WORLD.width / 2;
        enemy.baseX = enemy.x;
        enemy.y = GAMEPLAY_SAFE_RECT.top + 60;
        world.bossSpawned = true;
        world.bossStartedAt = world.elapsed;
        world.bossPhase = 1;
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
    if (ownerCount >= limit)
        return null;
    const projectile = acquireProjectile(world);
    Object.assign(projectile, {
        id: world.nextId++,
        owner: values.owner,
        appearance: values.appearance,
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
        const angle = -Math.PI / 2 + offset * (sweeping ? Math.PI / 10 : 0.06);
        const ricochet = hasCore(state, 80) && world.random() < .15;
        addProjectile(world, { owner: "player", source: extra ? "basic" : source, skillId: sweeping && !extra ? "sweeping_cannon" : undefined,
            x: world.playerX + offset * 4, y: world.playerY - 17, vx: Math.cos(angle) * 480, vy: Math.sin(angle) * 480, radius: 3.2,
            rawDamage: stats.firepower * multiplier * context.rawMultiplier, volleyId, volleyHits: extra ? undefined : volleyHits,
            penetrationRemaining: hasCore(state, 89) ? 3 : 0,
            bounceRemaining: afterburner ? 2 : ricochet ? 1 : 0, bounceMultiplier: afterburner ? .75 : .55,
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
    if (world.decoys.length > 0 && (homing || !canAcquirePlayerTarget(world.aircraft) || world.random() < 0.68)) {
        const decoy = world.decoys[Math.floor(world.random() * world.decoys.length)];
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
    const decoy = world.decoys.find((candidate) => candidate.id === targetId);
    return decoy ? { x: decoy.x, y: decoy.y } : null;
}
function fireEnemyBullet(world: CombatWorld, enemy: EnemyEntity, angle: number, speed: number, rawDamage: number, homing = false): void {
    const adjustedSpeed = speed;
    addProjectile(world, {
        owner: "enemy",
        appearance: enemy.type === "boss" ? "boss" : homing ? "dangerous" : undefined,
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
function addWarning(world: CombatWorld, kind: WarningZone["kind"], x: number, y: number, radius: number, duration: number, rawDamage: number, owner: WarningZone["owner"]): void {
    if (world.warnings.length >= AIR_COMBAT_WORLD.maxWarnings)
        return;
    const clamped = clampCircleToGameplayRect(x, y, radius);
    world.warnings.push({
        id: world.nextId++,
        kind,
        x: clamped.x,
        y: clamped.y,
        radius,
        remaining: duration,
        totalDuration: duration,
        rawDamage,
        owner,
    });
}
function fireEnemy(world: CombatWorld, enemy: EnemyEntity): void {
    const config = ENEMY_CONFIGS[enemy.type], damage = config.projectileDamage * enemy.damageScale, aim = aimAtCurrentTarget(world, enemy);
    const target = targetPosition(world, chooseEnemyTarget(world, false));
    enemy.attackCount++;
    switch (enemy.type) {
        case "bomber":
            if (target)
                addWarning(world, "enemy_bomb", target.x, target.y, 34, 1, damage, "enemy");
            break;
        case "fighter":
        case "elite":
            if (aim !== null) {
                enemy.burst = 3;
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
                addWarning(world, "elite_lock", enemy.x, enemy.y, 32, .6, 0, "enemy");
            }
            break;
        case "acid_bomber":
            if (target) {
                addWarning(world, "acid", target.x, target.y, 42, 1.1, damage, "enemy");
                if (enemy.eliteWave === 2)
                    addWarning(world, "acid", target.x + (enemy.attackCount % 2 ? 58 : -58), target.y - 35, 42, 1.7, damage, "enemy");
            }
            break;
        case "sniper":
        case "radar_hunter":
            if (enemy.type === "radar_hunter" && enemy.attackCount % 2 === 0 && aim !== null) {
                fireEnemyBullet(world, enemy, aim - .2, 155, 120, true);
                fireEnemyBullet(world, enemy, aim + .2, 155, 120, true);
            }
            else if (target)
                addLineWarning(world, enemy, "rail", target.x, target.y, 1.2, damage);
            break;
        case "boss":
            if (aim !== null) {
                const side = enemy.attackCount % 2 ? -1 : 1;
                const p = addProjectile(world, { owner: "enemy", appearance: "boss", x: enemy.x + side * 27, y: enemy.y + 20,
                    vx: Math.cos(aim) * 175, vy: Math.sin(aim) * 175, rawDamage: 140, radius: 5 });
                if (p)
                    p.targetId = chooseEnemyTarget(world, false);
            }
            break;
        default: if (aim !== null)
            fireEnemyBullet(world, enemy, aim, 155, damage);
    }
    const faster = enemy.type === "elite" && enemy.hp < enemy.maxHp * .5 ? .8 : enemy.type === "boss" && enemy.hp < enemy.maxHp * .15 ? .75 : 1;
    enemy.fireCooldown = config.fireInterval * faster;
}
function fireFan(world: CombatWorld, enemy: EnemyEntity, count: number, damage: number, angle = Math.PI / 2, spacing = .19): void {
    for (let i = 0; i < count; i++)
        fireEnemyBullet(world, enemy, angle + (i - (count - 1) / 2) * spacing, 145, damage);
}
function addLineWarning(world: CombatWorld, enemy: EnemyEntity, kind: "rail" | "dash", x: number, y: number, duration: number, damage: number): void {
    if (world.warnings.length >= AIR_COMBAT_WORLD.maxWarnings)
        return;
    const warning: WarningZone = { id: world.nextId++, kind, x, y, fromX: enemy.x, fromY: enemy.y, radius: kind === "dash" ? enemy.radius * .8 : 7,
        remaining: duration, totalDuration: duration, rawDamage: damage, owner: "enemy", enemyId: enemy.id };
    world.warnings.push(warning);
}
function launchNextMissile(world: CombatWorld): boolean {
    if (world.missilesPending <= 0 || world.missileSalvoTotal <= 0)
        return false;
    const stats = getEffectiveAircraftStats(world.aircraft);
    const values = getSkillRuntimeValues(world.aircraft, "missile_swarm");
    const index = world.missileLaunchIndex;
    const target = nearestEnemy(world, world.playerX, world.playerY, [], true);
    const angle = -Math.PI / 2 + (index % 2 ? 0.6 : -0.6);
    const side = index % 2 === 0 ? -1 : 1;
    const launch = clampCircleToGameplayRect(world.playerX + side * 14, world.playerY - 12 + (index % 3) * 2, 4.5);
    const projectile = addProjectile(world, {
        owner: "player",
        x: launch.x,
        y: launch.y,
        vx: Math.cos(angle) * 260,
        vy: Math.sin(angle) * 260,
        radius: 4.5,
        rawDamage: stats.firepower * values.damageMultiplier,
        source: "skill", skillId: "missile_swarm", lifetime: 6,
        homing: true,
        targetId: target?.id ?? null,
        turnRate: 3.2,
        color: "#fb923c",
    });
    if (!projectile)
        return false;
    world.missilesPending -= 1;
    world.missileLaunchIndex += 1;
    return true;
}
function updateMissileSalvo(world: CombatWorld, dt: number): void {
    if (world.missilesPending <= 0)
        return;
    world.missileLaunchCooldown -= dt;
    while (world.missilesPending > 0 && world.missileLaunchCooldown <= 0) {
        if (!launchNextMissile(world)) {
            world.missileLaunchCooldown = 0.05;
            return;
        }
        if (world.missileLaunchIndex % 2 === 0)
            world.missileLaunchCooldown += 0.25;
    }
}
function queueMissileSwarm(world: CombatWorld): void {
    const count = getSkillRuntimeValues(world.aircraft, "missile_swarm").count;
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
    Object.assign(decoy, { id: world.nextId++, x: world.playerX, y: world.playerY, radius: clone ? 12 : 6, remaining: duration, life: duration,
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
    if (world.ended || world.pauseReasons.size || world.pendingCoreSelections || world.currentCoreChoices)
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
            addProjectile(world, { owner: "player", source: "skill", skillId, bigBang: true, lifetime: 3,
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
    if (!world.playerInputActive || world.pauseReasons.size || world.ended || world.currentCoreChoices || world.pendingCoreSelections > 0 ||
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
        // Only player contacts: do not repeat weapon damage or advance enemy AI.
        for (let index = world.projectiles.length - 1; index >= 0; index--) {
            const p = world.projectiles[index];
            if (p.owner === "enemy" && world.decoys.some(d => circleHit(p.x, p.y, p.radius, d.x, d.y, d.radius))) {
                emitVisual(world, { kind: "absorb", x: p.x, y: p.y, size: 24 });
                recycleProjectile(world, index);
                continue;
            }
            if (p.owner === "enemy" && circleHit(p.x, p.y, p.radius, world.playerX, world.playerY, world.playerRadius)) {
                hitPlayer(world, p.rawDamage);
                recycleProjectile(world, index);
            }
        }
        updateEnemyPlayerCollisions(world);
    }
    if (world.aircraft.currentHp <= 0)
        world.ended = true;
    enterCountdownIfClear(world);
}
function updateDroneMovement(world: CombatWorld, dt: number): void {
    if (!world.aircraft.droneActive) {
        world.droneTargetId = null;
        return;
    }
    let target = world.enemies.find((enemy) => enemy.id === world.droneTargetId && enemy.hp > 0) || null;
    if (!target) {
        target = nearestEnemy(world, world.droneX, world.droneY, [], true);
        world.droneTargetId = target?.id ?? null;
    }
    world.droneOrbitAngle = (world.droneOrbitAngle + dt * 1.9) % (Math.PI * 2);
    const desired = target
        ? {
            x: target.x + Math.cos(world.droneOrbitAngle) * (target.radius + 44),
            y: target.y + target.radius + 48 + Math.sin(world.droneOrbitAngle) * 16,
        }
        : { x: world.playerX - 28, y: world.playerY + 8 };
    for (const p of world.projectiles) {
        if (p.owner !== "enemy")
            continue;
        const px = p.x + p.vx * .28, py = p.y + p.vy * .28, dist = Math.hypot(px - world.droneX, py - world.droneY);
        if (dist < 48) {
            desired.x += (world.droneX < px ? -1 : 1) * (48 - dist) * 2;
            desired.y -= 18;
        }
    }
    const stats = getEffectiveAircraftStats(world.aircraft), ratio = getSkillRuntimeValues(world.aircraft, "escort_drone").damageMultiplier;
    const newMax = stats.maxHp * ratio;
    world.droneHp = Math.min(newMax, world.droneHp + Math.max(0, newMax - world.droneMaxHp) + stats.hpRegen * ratio * dt);
    world.droneMaxHp = newMax;
    world.droneArmor = stats.armor * ratio;
    world.droneInvulnerability = Math.max(0, world.droneInvulnerability - dt);
    const clampedDesired = clampCircleToGameplayRect(desired.x, desired.y, 9);
    const dx = clampedDesired.x - world.droneX;
    const dy = clampedDesired.y - world.droneY;
    const distance = Math.hypot(dx, dy);
    if (distance <= 0.05)
        return;
    const maxDistance = (target ? 235 : 300) * dt;
    const movementRatio = Math.min(1, maxDistance / distance);
    const next = clampCircleToGameplayRect(world.droneX + dx * movementRatio, world.droneY + dy * movementRatio, 9);
    world.droneX = next.x;
    world.droneY = next.y;
}
function clearHostileObjects(world: CombatWorld): void {
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
        enemy.shieldUntil = world.aircraft.coreState.time + 4;
        enemy.abilityCd = 10;
    }
    if (enemy.type !== "boss")
        return;
    const ratio = enemy.hp / enemy.maxHp, cadence = ratio < .15 ? .85 * .8 : world.bossPhase === 3 ? .85 : 1;
    if (enemy.abilityCd <= 0) {
        fireFan(world, enemy, 7, 110, Math.PI / 2, .21);
        enemy.abilityCd = 7.5 * cadence;
        if (world.bossPhase === 3)
            enemy.secondaryCd = Math.min(enemy.secondaryCd, 1.3);
    }
    if (enemy.secondaryCd <= 0) {
        addWarning(world, "pulse", enemy.x, enemy.y, 24, 1.2, 240, "enemy");
        enemy.secondaryCd = 10 * cadence;
        if (world.bossPhase === 3)
            enemy.abilityCd = Math.min(enemy.abilityCd, 3.2);
    }
    if (world.bossPhase >= 2 && enemy.tertiaryCd <= 0 && enemy.dashRemaining <= 0) {
        const target = targetPosition(world, chooseEnemyTarget(world, false));
        if (target)
            addLineWarning(world, enemy, "dash", target.x, Math.min(GAMEPLAY_SAFE_RECT.bottom - enemy.radius, target.y), 1.2, 350);
        enemy.tertiaryCd = 10 * cadence;
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
        if (enemy.stun > 0) {
            enemy.stun = Math.max(0, enemy.stun - dt);
            continue;
        }
        enemy.age += dt;
        enemy.fireCooldown -= dt;
        const top = GAMEPLAY_SAFE_RECT.top + enemy.radius;
        const holdingTelegraph = world.warnings.some(w => w.enemyId === enemy.id && (w.kind === "rail" || w.kind === "dash"));
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
                if (segmentDistance(world.playerX, world.playerY, startX, startY, enemy.x, enemy.y) < enemy.radius * .8 + world.playerRadius)
                    hitPlayer(world, 350, "collision");
            }
            else {
                const desiredX = 180 + Math.sin(enemy.age * .55) * 92, desiredY = GAMEPLAY_SAFE_RECT.top + 60 + Math.sin(enemy.age * .7) * 8;
                enemy.x += (desiredX - enemy.x) * Math.min(1, dt * 2);
                enemy.y += (desiredY - enemy.y) * Math.min(1, dt * 2);
            }
        }
        else if (enemy.type === "kamikaze") {
            if (enemy.dashCharge > 0) {
                if (enemy.targetId === null || !targetPosition(world, enemy.targetId))
                    enemy.targetId = chooseEnemyTarget(world, true);
                const target = targetPosition(world, enemy.targetId);
                if (target) {
                    enemy.dashEndX = target.x;
                    enemy.dashEndY = target.y;
                }
                enemy.dashCharge = Math.max(0, enemy.dashCharge - dt);
                if (enemy.dashCharge === 0) {
                    const angle = Math.atan2(enemy.dashEndY - enemy.y, enemy.dashEndX - enemy.x);
                    enemy.vx = Math.cos(angle) * 270;
                    enemy.vy = Math.sin(angle) * 270;
                }
            }
            else {
                enemy.x += enemy.vx * dt;
                enemy.y += enemy.vy * dt;
                if (enemy.x < 16 || enemy.x > 344 || enemy.y < top || enemy.y > GAMEPLAY_SAFE_RECT.bottom - enemy.radius) {
                    enemy.dashCharge = 1.2;
                    enemy.targetId = null;
                }
                const decoy = world.decoys.find(d => circleHit(enemy.x, enemy.y, enemy.radius, d.x, d.y, d.radius));
                if (decoy)
                    enemy.hp = 0;
            }
        }
        else {
            const holdY = top + (enemy.type === "sniper" ? 32 : enemy.type === "bomber" ? 100 : isElite(enemy.type) ? 100 : 55 + (enemy.id % 4) * 42);
            enemy.y += (holdY - enemy.y) * Math.min(1, dt * (enemy.type === "attacker" ? .6 : 1.4));
            const amplitude = enemy.type === "fighter" || enemy.type === "elite" ? 62 : enemy.type === "attacker" ? 22 : 34;
            enemy.x = enemy.baseX + Math.sin(enemy.age * (enemy.type === "fighter" ? 2.2 : 1.1) + enemy.phaseSeed) * amplitude;
            if (enemy.type === "sniper" && Math.hypot(enemy.x - world.playerX, enemy.y - world.playerY) < 130)
                enemy.y -= 45 * dt;
        }
        const point = clampCircleToGameplayRect(enemy.x, enemy.y, enemy.radius);
        enemy.x = point.x;
        enemy.y = point.y;
        updateEnemyAbilities(world, enemy, dt);
        if (enemy.fireCooldown <= 0 && enemy.type !== "kamikaze" && enemy.dashRemaining <= 0)
            fireEnemy(world, enemy);
        if (enemy.burst > 0) {
            enemy.burstCd -= dt;
            if (enemy.burstCd <= 0) {
                if (enemy.type === "iron_fortress")
                    fireFan(world, enemy, 5, ENEMY_CONFIGS[enemy.type].projectileDamage * enemy.damageScale, enemy.burstAngle, .22);
                else
                    fireEnemyBullet(world, enemy, enemy.burstAngle, 180, ENEMY_CONFIGS[enemy.type].projectileDamage * enemy.damageScale);
                enemy.burst--;
                enemy.burstCd += .18;
                if (enemy.burst === 0 && enemy.type === "elite" && enemy.eliteWave === 2) {
                    enemy.secondaryCd = .55;
                }
            }
        }
        if (enemy.type === "elite" && enemy.eliteWave === 2 && enemy.secondaryCd <= 0) {
            fireFan(world, enemy, 5, 80 * enemy.damageScale, aimAtCurrentTarget(world, enemy) ?? Math.PI / 2);
            enemy.secondaryCd = Infinity;
        }
    }
    resolveDeathsAndEffects(world);
}
function segmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
    const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
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
            const ids: number[] = [];
            for (let i = 0; i < 3; i++) {
                const target = nearestEnemy(world, world.playerX, world.playerY, ids, true);
                if (!target)
                    break;
                ids.push(target.id);
                addProjectile(world, { owner: "player", source: "weapon", homing: true, targetId: target.id, turnRate: 4, lifetime: 6,
                    x: world.playerX + (i - 1) * 10, y: world.playerY - 15, vx: (i - 1) * 65, vy: -230, radius: 4.5,
                    rawDamage: getEffectiveAircraftStats(world.aircraft).firepower * 2.5, color: "#67e8f9" });
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
        state.currentResource = Math.min(100, state.currentResource + 1);
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
function hitPlayer(world: CombatWorld, rawDamage: number, kind: "projectile" | "collision" | "hazard" = "projectile"): void {
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
        const touches = (x: number, y: number, radius: number) => segmentDistance(x, y, p.previousX, p.previousY, p.x, p.y) <= p.radius + radius;
        if (p.owner === "enemy") {
            // Every hostile projectile can be absorbed, regardless of its original target.
            if (world.decoys.some(d => touches(d.x, d.y, d.radius))) {
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
                hitPlayer(world, p.rawDamage);
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
            p.hitIds.push(enemy.id);
            applyDamageToEnemy(world, enemy, p.rawDamage, p.color, p.source, p.skillId, p.volleyHits);
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
        if (world.aircraft.droneActive && circleHit(enemy.x, enemy.y, enemy.radius * .78, world.droneX, world.droneY, 9))
            hitDrone(world, ENEMY_CONFIGS[enemy.type].collisionDamage * enemy.damageScale);
        if (!circleHit(enemy.x, enemy.y, enemy.radius * .78, world.playerX, world.playerY, world.playerRadius))
            continue;
        hitPlayer(world, (enemy.dashRemaining > 0 ? 350 : ENEMY_CONFIGS[enemy.type].collisionDamage) * enemy.damageScale, "collision");
        if (enemy.type === "kamikaze")
            enemy.hp = 0;
    }
    resolveDeathsAndEffects(world);
}
function detonateBigBang(world: CombatWorld, projectile: ProjectileEntity): void {
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
    const enemy = world.enemies.find(e => e.id === w.enemyId && e.hp > 0);
    if (w.kind === "rail") {
        if (!enemy)
            return;
        const angle = Math.atan2(w.y - (w.fromY ?? enemy.y), w.x - (w.fromX ?? enemy.x));
        addProjectile(world, { owner: "enemy", appearance: "dangerous", x: w.fromX ?? enemy.x, y: w.fromY ?? enemy.y,
            vx: Math.cos(angle) * 650, vy: Math.sin(angle) * 650, rawDamage: w.rawDamage, radius: 4 });
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
        return;
    }
    if (w.kind === "acid" || w.kind === "pulse") {
        w.stage = "active";
        w.age = 0;
        w.tick = 1;
        w.ticksRemaining = 3;
        w.remaining = w.kind === "acid" ? 3 : 3.2;
        w.hitPlayer = false;
        return;
    }
    emitVisual(world, { kind: "bomb", x: w.x, y: w.y, size: w.radius * 2 });
    addParticles(world, w.x, w.y, "#ef4444", 14);
    if (Math.hypot(world.playerX - w.x, world.playerY - w.y) <= w.radius + world.playerRadius)
        hitPlayer(world, w.rawDamage, "hazard");
    if (world.aircraft.droneActive && Math.hypot(world.droneX - w.x, world.droneY - w.y) <= w.radius + 10)
        hitDrone(world, w.rawDamage);
}
function updateWarnings(world: CombatWorld, dt: number): void {
    for (let i = world.warnings.length - 1; i >= 0; i--) {
        const w = world.warnings[i];
        // A stun holds an unfinished targeted telegraph; it never discards BigBang's stun.
        if (w.enemyId && world.enemies.some(e => e.id === w.enemyId && e.stun > 0))
            continue;
        w.remaining -= dt;
        if (w.stage === "active") {
            w.age = (w.age || 0) + dt;
            if (w.kind === "acid") {
                const inside = Math.hypot(world.playerX - w.x, world.playerY - w.y) <= w.radius + world.playerRadius;
                if (inside) {
                    const duration = negativeStatusDuration(world.aircraft, 1.1);
                    if (duration > 0)
                        world.aircraft.coreState.timers.acidArmor = world.aircraft.coreState.time + duration;
                }
                w.tick = (w.tick || 0) - dt;
                if (w.tick <= 1e-8 && (w.ticksRemaining || 0) > 0) {
                    w.tick += 1;
                    w.ticksRemaining!--;
                    if (inside)
                        hitPlayer(world, w.rawDamage, "hazard");
                    if (world.aircraft.droneActive && Math.hypot(world.droneX - w.x, world.droneY - w.y) <= w.radius + 10)
                        hitDrone(world, w.rawDamage);
                }
            }
            else if (w.kind === "pulse") {
                const radius = w.age * 190, previous = Math.max(0, radius - dt * 190);
                const distance = Math.hypot(world.playerX - w.x, world.playerY - w.y);
                if (!w.hitPlayer && distance >= previous - world.playerRadius - 8 && distance <= radius + world.playerRadius + 8) {
                    hitPlayer(world, w.rawDamage, "hazard");
                    w.hitPlayer = true;
                }
            }
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
        if (p.bigBang) {
            p.y = Math.max(GAMEPLAY_SAFE_RECT.top + p.radius, p.y);
            continue;
        }
        const outside = p.x < -20 || p.x > 380 || p.y < GAMEPLAY_SAFE_RECT.top - 20 || p.y > 660;
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
        d.remaining -= dt;
        if (d.remaining <= 0) {
            world.pools.decoys.push(d);
            world.decoys.splice(i, 1);
            continue;
        }
        if (!d.clone) {
            const t = Math.min(1, (d.life - d.remaining) / .4);
            const point = clampCircleToGameplayRect(d.originX + d.side * (18 + d.lane * 11) * Math.sin(t * Math.PI / 2), d.originY - (24 + d.lane * 9) * t - 10 * Math.sin(t * Math.PI), d.radius);
            d.x = point.x;
            d.y = point.y;
        }
    }
}
function updatePlayerDash(world: CombatWorld, dt: number): void {
    if (world.dashRemaining <= 0)
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
    if (shouldAutoFire(world.aircraft) && world.laserCharge <= 0 && world.laserTicksRemaining <= 0 && world.playerFireCooldown <= 0) {
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
