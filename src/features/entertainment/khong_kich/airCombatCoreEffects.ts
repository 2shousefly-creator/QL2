import { recordCoreMetric } from "./airCombatTelemetry";
import type { AircraftCombatState, CoreId, EffectiveAircraftStats, SkillId } from "./airCombatTypes";
export const coreId = (row: number): CoreId => `core_${String(row).padStart(3, "0")}`;
export const hasCore = (state: AircraftCombatState, row: number): boolean => state.selectedCores.includes(coreId(row));
export const SPECIALIZATION_CORE_ID: CoreId = "core_097";
export const skillsLocked = (state: AircraftCombatState): boolean => state.selectedCores.includes(SPECIALIZATION_CORE_ID);
export type DamageSource = "basic" | "weapon" | "skill" | "lightning" | "burn" | "core";
export type CoreEvent = "acquire" | "basic" | "hit" | "critical" | "kill" | "damageTaken" | "skillCast" | "tick";
export interface CoreTarget {
    id: number;
    hp: number;
    maxHp: number;
    armor: number;
    x: number;
    y: number;
    elite: boolean;
    boss: boolean;
}
export interface CoreContext {
    state: AircraftCombatState;
    stats: EffectiveAircraftStats;
    dt?: number;
    target?: CoreTarget;
    skillId?: SkillId;
    damage?: number;
    source?: DamageSource;
    coreRow?: number;
    rawMultiplier: number;
    extraShot?: number;
    heal: (amount: number) => void;
    reduceCooldowns: (seconds: number, except?: SkillId) => void;
    explode: (target: CoreTarget, raw: number) => void;
    lightning: (target: CoreTarget, raw: number) => void;
    tomahawk: () => void;
    weaken: (target: CoreTarget) => void;
    stopSkills: () => void;
}
type StatEffect = (state: AircraftCombatState, stats: EffectiveAircraftStats) => void;
type Hook = (ctx: CoreContext) => void;
interface CoreEffect {
    stats?: StatEffect;
    finalStats?: StatEffect;
    hooks?: Partial<Record<CoreEvent, Hook>>;
}
const effects: Record<string, CoreEffect> = {};
const register = (row: number, effect: CoreEffect) => { effects[coreId(row)] = effect; };
const active = (s: AircraftCombatState, key: string) => (s.coreState.timers[key] || 0) > s.coreState.time;
const ready = (s: AircraftCombatState, key: string) => !active(s, key);
const arm = (s: AircraftCombatState, key: string, seconds: number) => { s.coreState.timers[key] = s.coreState.time + seconds; };
const shield = (ctx: CoreContext, key: string, fraction: number, seconds: number) => {
    const old = ctx.state.coreState.shields[key];
    const previous = old && old.until > ctx.state.coreState.time ? old.amount : 0;
    ctx.state.coreState.shields[key] = { amount: ctx.stats.maxHp * fraction, until: ctx.state.coreState.time + seconds };
    recordCoreMetric(ctx.state, ctx.coreRow, "shieldCreated", Math.max(0, ctx.stats.maxHp * fraction - previous));
};
export const FLAT_CORE_STATS: Record<string, {key:keyof EffectiveAircraftStats;amount:number}> = {};
const flat = (row: number, key: keyof EffectiveAircraftStats, amount: number) => {
    FLAT_CORE_STATS[coreId(row)] = {key,amount};
    register(row, { stats: (_s, stats) => { (stats[key] as number) += amount; } });
};
for (const [row, fp, armor, rate, hp, regen, cdr] of [
    [1, 12, 12, .15, 110, .7, .04], [7, 20, 20, .4, 220, 1.7, .09], [13, 50, 50, 1.0, 420, 4, .2],
]) {
    flat(row, "firepower", fp);
    flat(row + 1, "armor", armor);
    flat(row + 2, "fireRate", rate);
    flat(row + 3, "maxHp", hp);
    flat(row + 4, "hpRegen", regen);
    flat(row + 5, "cooldownReduction", cdr);
}
for (const [row, key, gain] of [[46, "firepower", .4], [47, "armor", .3], [48, "maxHp", 3]] as const)
    register(row, {
        stats: (s, stats) => { stats[key] += s.coreState.stacks[coreId(row)] || 0; },
        hooks: { kill: ctx => {
                const amount = gain * (ctx.target?.elite || ctx.target?.boss ? 5 : 1);
                const stacks = ctx.state.coreState.stacks;
                stacks[coreId(row)] = (stacks[coreId(row)] || 0) + amount;
                if (key === "maxHp")
                    ctx.state.currentHp += amount;
            } },
    });
register(49, { finalStats: (s, stats) => { if (s.coreState.time - s.coreState.lastMove >= 3) {
        stats.armor *= 1.8;
        stats.firepower *= 1.4;
    } } });
flat(53, "criticalChance", .25);
// Applied last after all flat, conditional, percentage and skill Fire Rate buffs.
register(54, { finalStats: (_s, stats) => { stats.firepower += Math.max(0, stats.fireRate - 1.2) * 150; stats.fireRate = 1.2; } });
flat(55, "criticalChance", .05);
flat(56, "criticalDamageMultiplier", .1);
register(58, { hooks: { hit: ctx => { if (ctx.target)
            ctx.weaken(ctx.target); } } });
register(59, { hooks: { basic: ctx => { if (ctx.state.basicShotsFired % 10 === 0)
            ctx.rawMultiplier *= 1.8; } } });
register(60, { hooks: { basic: ctx => { if (ctx.state.coreState.time - ctx.state.coreState.lastDamage >= 4)
            ctx.rawMultiplier *= 1.15; } } });
register(61, { stats: (s, stats) => { if (active(s, "reactiveArmor"))
        stats.armor += 15; }, hooks: { damageTaken: ctx => {
            if (ready(ctx.state, "reactiveArmorCd")) {
                arm(ctx.state, "reactiveArmor", 4);
                arm(ctx.state, "reactiveArmorCd", 12);
            }
        } } });
register(62, { hooks: { tick: ctx => { if (ctx.state.status.regenDisabledUntil <= ctx.state.coreState.time && ctx.state.currentHp < ctx.stats.maxHp * .2)
            ctx.heal(Math.min(ctx.stats.maxHp * .005 * (ctx.dt || 0), ctx.stats.maxHp * .2 - ctx.state.currentHp)); } } });
register(63, { stats: (s, stats) => { if (s.currentHp < stats.maxHp * .35) {
        stats.firepower += 20;
        stats.armor += 20;
    } } });
register(64, { hooks: { kill: ctx => { if (ctx.state.coreState.kills % 10 === 0)
            ctx.heal(ctx.stats.maxHp * .02); } } });
register(66, { hooks: { kill: ctx => {
            const c = ctx.state.coreState;
            c.stacks.combo = c.time - c.lastKill <= 3 ? Math.min(5, (c.stacks.combo || 0) + 1) : 0;
        } } });
register(70, { hooks: { kill: ctx => { if (ctx.state.coreState.kills % 8 === 0)
            ctx.reduceCooldowns(.5); } } });
register(71, { stats: (s, stats) => { if (active(s, "tacticalRate"))
        stats.fireRate += .15; }, hooks: { skillCast: ctx => arm(ctx.state, "tacticalRate", 4) } });
register(73, { hooks: { kill: ctx => { if (ctx.target)
            ctx.explode(ctx.target, ctx.stats.firepower * .2); } } });
register(74, { hooks: { critical: ctx => {
            const c = ctx.state.coreState;
            if (c.time - c.criticalWindow >= 1) {
                c.criticalWindow = c.time;
                c.criticalBudget = 1;
            }
            const reduction = Math.min(.1, c.criticalBudget);
            c.criticalBudget = Math.max(0, c.criticalBudget - reduction);
            ctx.reduceCooldowns(reduction);
        } } });
register(75, { finalStats: (s, stats) => { stats.firepower *= 1 + .03 * (s.coreState.stacks.slaying || 0); }, hooks: {
        kill: ctx => { const c = ctx.state.coreState; if (c.kills % 5 === 0)
            c.stacks.slaying = Math.min(5, (c.stacks.slaying || 0) + 1); },
        damageTaken: ctx => { const c = ctx.state.coreState; c.stacks.slaying = Math.max(0, (c.stacks.slaying || 0) - 1); },
    } });
register(76, { hooks: { damageTaken: ctx => { if ((ctx.damage || 0) > ctx.stats.maxHp * .1 && ready(ctx.state, "reactiveShieldCd")) {
            shield(ctx, "reactive", .12, 3);
            arm(ctx.state, "reactiveShieldCd", 10);
        } } } });
register(77, { hooks: { kill: ctx => { if (ctx.target?.elite) {
            ctx.heal(ctx.stats.maxHp * .18);
            ctx.reduceCooldowns(4);
        } } } });
register(78, { finalStats: (s, stats) => { if (active(s, "reactor"))
        stats.resourceRegen *= 1.35; }, hooks: { kill: ctx => {
            const c = ctx.state.coreState;
            if (c.killTimes.length >= 5 && c.time - c.killTimes[c.killTimes.length - 5] <= 4)
                arm(ctx.state, "reactor", 6);
        } } });
register(79, { hooks: { basic: ctx => { if (ctx.state.basicShotsFired % 3 === 0)
            ctx.extraShot = .4; } } });
register(81, { hooks: { skillCast: ctx => { if (ready(ctx.state, "skillShieldCd")) {
            shield(ctx, "skill", .08, 3);
            arm(ctx.state, "skillShieldCd", 6);
        } } } });
register(82, { finalStats: (s, stats) => { if (s.coreState.time - s.coreState.lastDamage >= 4)
        stats.fireRate *= 1.2; } });
register(83, { hooks: { damageTaken: ctx => { if (ready(ctx.state, "counterCd")) {
            ctx.state.coreState.stacks.counter = 3;
            arm(ctx.state, "counterCd", 6);
        } }, basic: ctx => {
            if ((ctx.state.coreState.stacks.counter || 0) > 0) {
                ctx.rawMultiplier *= 1.2;
                ctx.state.coreState.stacks.counter--;
            }
        } } });
register(85, { stats: (_s, stats) => { stats.firepower += 35; stats.armor -= 18; } });
register(86, { finalStats: (_s, stats) => {
        stats.maxResource *= .65;
        stats.resourceRegen *= 1.7;
    } });
register(87, { stats: (_s, stats) => { stats.criticalChance += .2; stats.criticalDamageMultiplier += .3; } });
register(92, { hooks: { tick: ctx => { if (ctx.state.status.regenDisabledUntil <= ctx.state.coreState.time && ctx.state.coreState.time - ctx.state.coreState.lastDamage >= 5)
            ctx.heal(ctx.stats.maxHp * .008 * (ctx.dt || 0)); } } });
register(94, { stats: (_s, stats) => { stats.criticalChance += .1; }, finalStats: (_s, stats) => { stats.maxHp *= .65; stats.firepower *= 1.4; } });
register(95, { finalStats: (_s, stats) => { stats.criticalChance = .25; stats.criticalDamageMultiplier += 3; } });
register(96, { stats: (_s, stats) => { stats.cooldownReduction += .4; }, hooks: { skillCast: ctx => { ctx.state.currentHp = Math.max(Number.EPSILON, ctx.state.currentHp * .94); } } });
register(97, { finalStats: (_s, stats) => { stats.firepower *= 1.6; stats.maxHp *= 1.4; stats.armor *= 1.4; }, hooks: { acquire: ctx => ctx.stopSkills() } });
register(99, { hooks: { tick: ctx => { if (ctx.state.currentResource < ctx.stats.maxResource * .1 && ready(ctx.state, "reserveShieldCd")) {
            shield(ctx, "reserve", .08, 4);
            arm(ctx.state, "reserveShieldCd", 20);
        } } } });
register(100, { stats: (s, stats) => { if (s.currentHp > stats.maxHp * .7)
        stats.firepower += 20;
    else if (s.currentHp < stats.maxHp * .3)
        stats.armor += 20; } });
register(105, { stats: (_s, stats) => { stats.criticalChance += .15; }, hooks: { critical: ctx => { if (ctx.target && ctx.source !== "lightning")
            ctx.lightning(ctx.target, ctx.stats.firepower * .7); } } });
register(106, { hooks: { tick: ctx => { if (ready(ctx.state, "tomahawk")) {
            ctx.tomahawk();
            arm(ctx.state, "tomahawk", 1.5);
        } }, acquire: ctx => arm(ctx.state, "tomahawk", 1.5) } });
const transientStatCores = new Set([49, 61, 63, 71, 75, 78, 82, 100].map(coreId));
export function applyCoreStatEffects(state: AircraftCombatState, stats: EffectiveAircraftStats, includeTemporary = true): void {
    // Max HP first, so HP conditions use the final maximum rather than acquisition order.
    for (const id of state.selectedCores)
        if (id !== coreId(63) && id !== coreId(100) && (includeTemporary || !transientStatCores.has(id)))
            effects[id]?.stats?.(state, stats);
    const hpBefore = stats.maxHp;
    if (hasCore(state, 94))
        stats.maxHp *= .65;
    if (skillsLocked(state))
        stats.maxHp *= 1.4;
    // HP conditions run after all max-HP changes, independent of acquisition order.
    for (const row of [63, 100])
        if (includeTemporary && hasCore(state, row)) {
            effects[coreId(row)]?.stats?.(state, stats);
        }
    stats.maxHp = hpBefore;
    for (const id of state.selectedCores)
        if (id !== coreId(54) && (includeTemporary || !transientStatCores.has(id)))
            effects[id]?.finalStats?.(state, stats);
}
export function applyFireRateLock(state: AircraftCombatState, stats: EffectiveAircraftStats): void {
    if (hasCore(state, 54)) {
        const before = stats.firepower;
        effects[coreId(54)].finalStats?.(state, stats);
        state.coreState.stacks.fireRateConversion = stats.firepower - before;
    }
}
export function dispatchCoreEvent(event: CoreEvent, ctx: CoreContext, only?: CoreId): void {
    const previous = ctx.coreRow;
    try {
        for (const id of only ? [only] : ctx.state.selectedCores) {
            ctx.coreRow = Number(id.slice(5));
            effects[id]?.hooks?.[event]?.(ctx);
        }
    } finally { ctx.coreRow = previous; }
}
export function outgoingCoreMultiplier(state: AircraftCombatState, target: CoreTarget, source: DamageSource, distance: number, screenHeight: number): number {
    let m = 1;
    const c = state.coreState;
    if (active(state, "decoyCounter"))
        m *= 1.2;
    if (hasCore(state, 66) && c.time - c.lastKill <= 3)
        m *= 1 + .02 * (c.stacks.combo || 0);
    if (hasCore(state, 67) && (target.elite || target.boss))
        m *= 1.06;
    if (hasCore(state, 68) && target.hp < target.maxHp * .25)
        m *= 1.08;
    if (hasCore(state, 69) && target.hp > target.maxHp * .7)
        m *= 1.1;
    if (hasCore(state, 91))
        m *= 1 + Math.min(.4, Math.floor((1 - state.currentHp / getMaxHpForDamage(state)) / .02) * .01);
    if (source === "basic") {
        if (hasCore(state, 101) && distance < screenHeight / 3)
            m *= 1.12;
        if (hasCore(state, 102) && distance > screenHeight * 2 / 3)
            m *= 1.12;
    }
    return m;
}
// Populated by the authoritative stats calculation; only used during resolved hits.
function getMaxHpForDamage(state: AircraftCombatState): number { return state.coreState.stacks.effectiveMaxHp || state.currentHp || 1; }
export function armorPenetration(state: AircraftCombatState): number {
    return Math.min(.95, (hasCore(state, 57) ? .05 : 0) + (hasCore(state, 88) ? .25 : 0));
}
export function negativeStatusDuration(state: AircraftCombatState, seconds: number): number {
    if (hasCore(state, 24) && (state.activeEffects.afterburner || 0) > 0)
        return 0;
    return seconds * (hasCore(state, 98) ? .75 : 1);
}
export function coreStackLabel(state: AircraftCombatState, id: CoreId): string | null {
    const c = state.coreState;
    const labels: Record<string, string> = { [coreId(46)]: "Hỏa lực", [coreId(47)]: "Giáp", [coreId(48)]: "HP tối đa" };
    if (labels[id]) return `Đã cộng: +${(c.stacks[id] || 0).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} ${labels[id]}`;
    const remaining = (key: string) => Math.max(0, (c.timers[key] || 0) - c.time).toFixed(1).replace(".", ",");
    const shieldStatus = (key: string, cooldown?: string) => {
        const shield = c.shields[key];
        const amount = shield && shield.until > c.time ? Math.max(0, shield.amount) : 0;
        return `Khiên hiện tại: ${Math.floor(amount)}${cooldown ? ` · Hồi lại sau ${remaining(cooldown)}s` : ""}`;
    };
    switch (id) {
        case "core_049": return c.time - c.lastMove >= 3 ? "Đang tăng Hỏa lực và Giáp" : `Kích hoạt sau ${Math.max(0, 3 - c.time + c.lastMove).toFixed(1).replace(".", ",")}s đứng yên`;
        case "core_059": return `Tiến độ đòn cường hóa: ${state.basicShotsFired % 10} / 10`;
        case "core_060": case "core_082": return c.time - c.lastDamage >= 4 ? "Hiệu ứng không nhận sát thương đang hoạt động" : `Kích hoạt sau ${Math.max(0, 4 - c.time + c.lastDamage).toFixed(1).replace(".", ",")}s không nhận sát thương`;
        case "core_061": return `Giáp phản ứng: còn ${remaining("reactiveArmor")}s · Hồi lại sau ${remaining("reactiveArmorCd")}s`;
        case "core_064": return `Tiến độ hồi HP: ${c.kills % 10} / 10 hạ gục`;
        case "core_066": return `Chuỗi hiện tại: ${c.time - c.lastKill <= 3 ? c.stacks.combo || 0 : 0} / 5`;
        case "core_070": return `Tiến độ giảm hồi chiêu: ${c.kills % 8} / 8 hạ gục`;
        case "core_071": return `Tăng tốc bắn: còn ${remaining("tacticalRate")}s`;
        case "core_074": return `Ngân sách giảm hồi chiêu còn: ${(c.time - c.criticalWindow >= 1 ? 1 : c.criticalBudget).toFixed(1).replace(".", ",")}s`;
        case "core_075": return `Cộng dồn: ${c.stacks.slaying || 0} / 5 · +${(c.stacks.slaying || 0) * 3}% Hỏa lực`;
        case "core_076": return shieldStatus("reactive", "reactiveShieldCd");
        case "core_078": return `Tăng hồi tài nguyên: còn ${remaining("reactor")}s`;
        case "core_079": return `Tiến độ bắn thêm: ${state.basicShotsFired % 3} / 3`;
        case "core_081": return shieldStatus("skill", "skillShieldCd");
        case "core_083": return `Đòn phản kích còn: ${c.stacks.counter || 0} · Hồi lại sau ${remaining("counterCd")}s`;
        case "core_092": return c.time - c.lastDamage >= 5 ? "Đang hồi HP" : `Hồi HP sau ${Math.max(0, 5 - c.time + c.lastDamage).toFixed(1).replace(".", ",")}s không nhận sát thương`;
        case "core_099": return shieldStatus("reserve", "reserveShieldCd");
        case "core_104": return shieldStatus("overheal");
        case "core_107": return `Graze: ${c.stacks.graze??0}/6`;
        case "core_109": return `Cánh trái: ${remaining("wing:left_wing")}s · Cánh phải: ${remaining("wing:right_wing")}s`;
        case "core_113": return c.stacks.borrowPending ? "Đang vay · trả nợ khi kỹ năng kết thúc" : `Có thể vay sau ${remaining("futureDebt")}s`;
        case "core_114": return `Còn ${c.stacks.linkedShots??0}/3 phát bắn cường hóa`;
        case "core_116": return `Comeback còn ${remaining("comeback")}s`;
        case "core_120": return (c.timers.controlOverride??0)>c.time ? `Hồi chiêu: ${remaining("controlOverride")}s` : "Hack 6s / choáng Boss 2,5s; hồi 16s sau khi hiệu ứng kết thúc. Theo dõi trạng thái trên biểu tượng Lõi.";
        case "core_121": return `Phản Vật Chất: ${Math.round((c.stacks.antimatter??0)*100)}% / 600%`;
        case "core_106": return `Loạt Tomahawk tiếp theo sau ${remaining("tomahawk")}s`;
        default: return null;
    }
}
