import { coreHealingRate } from './airCombatHealingRates';
import { coreCooldownReady, deferCoreCooldown } from "./airCombatCooldowns";
import { skillRank } from "./airCombatSkillRanks";
import { createAbsorbShield } from "./airCombatExpansion";
import { recordCoreMetric } from "./airCombatTelemetry";
import type { AircraftCombatState, CoreId, EffectiveAircraftStats, SkillId } from "./airCombatTypes";
export const coreId = (row: number): CoreId => `core_${String(row).padStart(3, "0")}`;
export const hasCore = (state: AircraftCombatState, row: number): boolean => state.selectedCores.includes(coreId(row));
export const SPECIALIZATION_CORE_ID: CoreId = "core_097";
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
const ready = coreCooldownReady;
const arm = (s: AircraftCombatState, key: string, seconds: number) => { s.coreState.timers[key] = s.coreState.time + seconds; };
const shield = (ctx: CoreContext, key: string, fraction: number, seconds: number) => {
    const old = ctx.state.coreState.shields[key];
    const previous = old && old.until > ctx.state.coreState.time ? old.amount : 0;
    const shield = createAbsorbShield(ctx.state, key, ctx.stats.maxHp * fraction, seconds);
    recordCoreMetric(ctx.state, ctx.coreRow, "shieldCreated", Math.max(0, shield.amount - previous));
};
export const FLAT_CORE_STATS: Record<string, {key:keyof EffectiveAircraftStats;amount:number}> = {};
const flat = (row: number, key: keyof EffectiveAircraftStats, amount: number) => {
    FLAT_CORE_STATS[coreId(row)] = {key,amount};
    register(row, { stats: (_s, stats) => { (stats[key] as number) += amount; } });
};
for (const [row,fp,rate,hp,armor,regen,haste,resource] of [[1,30,.45,350,30,2,15,.12],[7,45,.75,550,50,3,25,.25],[13,75,1.10,800,75,5,40,.40]]) {
 register(row,{stats:(_s,t)=>{t.firepower+=fp;t.bonusFireRatePct+=rate;}});
 register(row+1,{stats:(_s,t)=>{t.maxHp+=hp;t.armor+=armor;}});
 register(row+4,{stats:(_s,t)=>{t.hpRegen+=regen;t.permanentHpRegenBonus+=regen;t.skillHaste+=haste;t.bonusResourceRegenPct+=resource;t.permanentResourceRegenPct+=resource;}});
}
for (const [row, amount] of [[3,.18],[9,.29],[15,.72]] as const) flat(row, "bonusFireRatePct", amount);
for (const [row, amount] of [[6,6],[12,12],[18,25]] as const) flat(row, "skillHaste", amount);
for (const [row, key, gain] of [[46, "firepower", .65], [47, "armor", .35], [48, "maxHp", 4]] as const)
    register(row, {
        stats: (s, stats) => { stats[key] += (row===48?200:25)+(s.coreState.stacks[coreId(row)] || 0); if(row===46)stats.bonusFireRatePct+=Math.floor((s.coreState.stacks[coreId(row)]||0)/50)*.1; },
        hooks: { kill: ctx => {
                const amount = gain * (ctx.target?.elite || ctx.target?.boss ? 5 : 1);
                const stacks = ctx.state.coreState.stacks;
                stacks[coreId(row)] = (stacks[coreId(row)] || 0) + amount;
                recordCoreMetric(ctx.state,row,"procs",1);
            } },
    });
register(49, {stats:(_s,t)=>{t.armor+=15;}, hooks:{tick:ctx=>{if(ctx.state.coreState.time-ctx.state.coreState.lastMove>=2)arm(ctx.state,"stationaryGrace",1.5);}}, finalStats: (s, stats) => { if (s.coreState.time - s.coreState.lastMove >= 2 || active(s,"stationaryGrace")) {
        stats.armor *= 1.6;
        stats.firepower *= 1.4;
    } } });
flat(53, "criticalChance", .30);
// Applied after the central Fire Rate resolver, including its global cap.
// Gatling resolves once in the shared fire-rate resolver and damage components.
register(229, {});
register(54, { finalStats: (s, stats) => { s.coreState.stacks.fireRateConversion = 1+Math.max(0,stats.fireRate-1.8)*.4; stats.fireRate = Math.min(stats.fireRate,1.8); } });
register(55,{stats:(_s,t)=>{t.criticalChance+=.12;t.criticalDamageMultiplier+=.15;}});
register(56, { stats: (_s, stats) => { stats.criticalChance += .03; stats.criticalDamageMultiplier += .22; } });
flat(98, "armor", 30);
register(58, {finalStats:(s,t)=>{if(active(s,"overloadedBarrel"))t.bonusFireRatePct+=.45;}, hooks: { skillCast: ctx => {arm(ctx.state,"overloadedBarrel",6);recordCoreMetric(ctx.state,58,"procs",1);} } });
register(59, { hooks: { basic: ctx => { if (ctx.state.basicShotsFired % 5 === 0){
            ctx.rawMultiplier *= 2.25;recordCoreMetric(ctx.state,59,"shots",1);} } } });
register(60, { hooks: { basic: ctx => {
    const c=ctx.state.coreState;
    ctx.rawMultiplier *= c.time-c.lastDamage>=3 || active(ctx.state,"stableBarrelGrace") ? 1.30 : 1.10;
}, damageTaken: ctx => {
    if(ctx.state.coreState.stacks.stableBarrelReady)arm(ctx.state,"stableBarrelGrace",1);
    ctx.state.coreState.stacks.stableBarrelReady=0;
}, tick: ctx => { if(ctx.state.coreState.time-ctx.state.coreState.lastDamage>=3)ctx.state.coreState.stacks.stableBarrelReady=1; } } });
register(61, { stats: (s, stats) => { if (active(s, "reactiveArmor"))
        stats.armor += 50; }, hooks: { damageTaken: ctx => {
            if (ready(ctx.state, "reactiveArmorCd")) {
                arm(ctx.state, "reactiveArmor", 5);
                deferCoreCooldown(ctx.state, "reactiveArmorCd");
                recordCoreMetric(ctx.state,61,"procs",1);
            }
        } } });
register(62, { hooks: { tick: ctx => { if (ctx.state.status.regenDisabledUntil <= ctx.state.coreState.time && ctx.state.currentHp < ctx.stats.maxHp * .22)
            ctx.heal(Math.min(coreHealingRate(ctx.state,ctx.stats,62) * (ctx.dt || 0), ctx.stats.maxHp * .22 - ctx.state.currentHp)); } } });
register(63, { stats: (s, stats) => { stats.firepower+=15;stats.armor+=10; if (s.currentHp < stats.maxHp * .35) {
        stats.firepower += 50;
        stats.armor += 35;
    } } });
register(64, { hooks: { kill: ctx => { const c=ctx.state.coreState;c.stacks.soulKills=(c.stacks.soulKills??0)+(ctx.target?.elite||ctx.target?.boss?5:1);while(c.stacks.soulKills>=10){c.stacks.soulKills-=10;ctx.heal(ctx.stats.maxHp*.05);} } } });
register(66, { hooks: { kill: ctx => {
            const c = ctx.state.coreState;
            const before = c.time - c.lastKill <= 6 ? c.stacks.combo || 0 : 0;
            c.stacks.combo = Math.min(5, before + 1);
            recordCoreMetric(ctx.state,66,"stacks",c.stacks.combo-before);
        } } });
register(70, {stats:(_s,t)=>{t.skillHaste+=8;},hooks:{kill:ctx=>{
 const c=ctx.state.coreState;c.stacks.reactivation=(c.stacks.reactivation??0)+(ctx.target?.elite||ctx.target?.boss?5:1);
 while(c.stacks.reactivation>=5){c.stacks.reactivation-=5;ctx.reduceCooldowns(6);}
}}});
register(71, { stats: (s, stats) => { if (active(s, "tacticalRate"))
        stats.bonusFireRatePct += .36; }, hooks: { skillCast: ctx => {arm(ctx.state, "tacticalRate", 6);recordCoreMetric(ctx.state,71,"procs",1);} } });
register(73, { hooks: { kill: ctx => { if (ctx.target)
            ctx.explode(ctx.target, ctx.stats.firepower * 1); } } });
register(74, { stats: (_s, stats) => { stats.criticalChance += .15; }, hooks: { critical: ctx => ctx.reduceCooldowns(.4) } });
register(75, { finalStats:(s,t)=>{if(active(s,"slaying"))t.firepower*=1+.08*(s.coreState.stacks.slaying??0);},hooks:{
 kill:ctx=>{const c=ctx.state.coreState;c.stacks.slaying=Math.min(5,(active(ctx.state,"slaying")?c.stacks.slaying??0:0)+1);arm(ctx.state,"slaying",8);recordCoreMetric(ctx.state,75,"stacks",1);},
 tick:ctx=>{if(!active(ctx.state,"slaying"))ctx.state.coreState.stacks.slaying=0;}
}});
register(76,{stats:(_s,t)=>{t.maxHp+=200;},hooks:{damageTaken:ctx=>{
 if((ctx.state.coreState.stacks.recentThreeSecondLoss??0)>=ctx.stats.maxHp*.1 && ready(ctx.state,"reactiveShieldCd")){
 shield(ctx,"reactive",.18,4);arm(ctx.state,"blackBox",4);deferCoreCooldown(ctx.state,"reactiveShieldCd");recordCoreMetric(ctx.state,76,"procs",1);
 }
}}});
register(77, { hooks: { kill: ctx => { if ((ctx.target?.elite || ctx.target?.boss)) {
            ctx.heal(ctx.stats.maxHp * .18);
            ctx.reduceCooldowns(5);
        } } } });
register(78,{stats:(_s,t)=>{t.bonusResourceRegenPct+=.2;t.permanentResourceRegenPct+=.2;},finalStats:(s,t)=>{if(active(s,"reactor"))t.bonusResourceRegenPct+=.3;},hooks:{kill:ctx=>{
 if(ctx.target?.elite||ctx.target?.boss)return;const c=ctx.state.coreState;c.stacks.reactorKills=(c.stacks.reactorKills??0)+1;
 if(c.stacks.reactorKills>=5){c.stacks.reactorKills-=5;const gain=Math.min(ctx.stats.maxResource*.05,ctx.stats.maxResource-ctx.state.currentResource);ctx.state.currentResource+=gain;recordCoreMetric(ctx.state,78,"resource",gain);}
}}});
register(79, { hooks: { basic: ctx => { if (ctx.state.basicShotsFired % 3 === 0)
            ctx.extraShot = 1; } } });
register(81, { stats:(_s,t)=>{t.armor+=15;}, hooks: { skillCast: ctx => { if (ready(ctx.state, "skillShieldCd")) {
            shield(ctx, "skill", .18, 5);
            ctx.state.coreState.stacks.skillShieldCast=ctx.state.coreState.skillCasts;
            deferCoreCooldown(ctx.state, "skillShieldCd");
        } } } });
register(82, { finalStats: (s, stats) => { if (s.coreState.time - s.coreState.lastDamage >= 4)
        stats.bonusFireRatePct += .72; } });
register(83, { hooks: { damageTaken: ctx => { if (ready(ctx.state, "counterCd")) {
            arm(ctx.state, "counterActive", 5);
            deferCoreCooldown(ctx.state, "counterCd");
            recordCoreMetric(ctx.state,83,"procs",1);
        } }, basic: ctx => {
            if (active(ctx.state,"counterActive")) {
                ctx.rawMultiplier *= 1.30;
                recordCoreMetric(ctx.state,83,"shots",1);
            }
        } } });
register(85, { stats: (_s, stats) => { stats.firepower += 100; stats.armor -= 50; } });
register(86, { finalStats: (_s, stats) => {
        stats.maxResource *= .5;
        stats.bonusResourceRegenPct += 1.2; stats.permanentResourceRegenPct += 1.2;
    } });
register(87, { stats: (_s, stats) => { stats.criticalChance += .30; stats.criticalDamageMultiplier += .60; } });
register(92, { hooks: { tick: ctx => { if (ctx.state.status.regenDisabledUntil <= ctx.state.coreState.time)
            ctx.heal(coreHealingRate(ctx.state,ctx.stats,92) * (ctx.dt || 0)); } } });
register(94, { stats: (_s, stats) => { stats.criticalChance += .30; }, finalStats: (_s, stats) => { stats.maxHp *= .65; stats.firepower *= 1.5; } });
register(95, { finalStats: (_s, stats) => { stats.criticalDamageMultiplier += 1.2; } });
register(96, { stats: (_s, stats) => { stats.skillHaste += 90; }, hooks: { skillCast: ctx => { const before=ctx.state.currentHp;ctx.state.currentHp = Math.max(Number.EPSILON, before * .95);recordCoreMetric(ctx.state,96,"hpPaid",before-ctx.state.currentHp); } } });

register(99,{stats:(_s,t)=>{t.bonusResourceRegenPct+=.15;t.permanentResourceRegenPct+=.15;},finalStats:(s,t)=>{if(active(s,"reserveRegen"))t.bonusResourceRegenPct+=.15;},hooks:{tick:ctx=>{
 if((ctx.state.currentResource<ctx.stats.maxResource*.15||(ctx.state.coreState.stacks.recentTwoSecondLoss??0)>ctx.stats.maxHp*.08)&&ready(ctx.state,"reserveShieldCd")){
 shield(ctx,"reserve",.10,4);arm(ctx.state,"reserveRegen",4);const gain=Math.min(ctx.stats.maxResource*.08,ctx.stats.maxResource-ctx.state.currentResource);ctx.state.currentResource+=gain;recordCoreMetric(ctx.state,99,"resource",gain);recordCoreMetric(ctx.state,99,"procs",1);deferCoreCooldown(ctx.state,"reserveShieldCd");
 }
}}});
register(100,{stats:(s,t)=>{const high=s.currentHp>t.maxHp*.7,low=s.currentHp<t.maxHp*.3;t.firepower+=high?55:low?15:35;t.armor+=high?10:low?55:35;}});
register(105, { stats: (_s, stats) => { stats.criticalChance += .30; }, hooks: { critical: ctx => { if (ctx.target && ctx.source !== "lightning")
            ctx.lightning(ctx.target, ctx.stats.firepower * 1.5); } } });
register(106, { hooks: { tick: ctx => { if (ready(ctx.state, "tomahawk")) {
            ctx.tomahawk();
            arm(ctx.state, "tomahawk", 2);
        } }, acquire: ctx => arm(ctx.state, "tomahawk", 2) } });
// Shared baseline contributions; temporary branches stay in their original resolver.
for(const [row,armor] of [[61,15],[65,15],[109,15],[110,20],[178,10],[192,15],[209,40]]){
 const previous=effects[coreId(row)]??{};register(row,{...previous,stats:(s,t)=>{previous.stats?.(s,t);t.armor+=armor;}});
}
for(const [row,regen] of [[62,1],[104,2]]){const previous=effects[coreId(row)]??{};register(row,{...previous,stats:(s,t)=>{previous.stats?.(s,t);t.hpRegen+=regen;t.permanentHpRegenBonus+=regen;}});}
for(const [row,bonus] of [[93,.2],[107,.15]])register(row,{stats:(_s,t)=>{t.bonusResourceRegenPct+=bonus;t.permanentResourceRegenPct+=bonus;}});
register(90,{finalStats:(_s,t)=>{t.maxHp*=1.1;}});
register(179,{stats:(_s,t)=>{t.criticalChance+=.10;}});
register(67,{hooks:{kill:ctx=>{if(ctx.target?.elite||ctx.target?.boss)ctx.heal(ctx.stats.maxHp*.05);}}});
for(const [row,fraction,cooldown] of [[5,.01,6],[11,.02,5],[17,.03,8]]){
 const previous=effects[coreId(row)];register(row,{...previous,hooks:{skillCast:ctx=>{
  if(!ready(ctx.state,`regenCast:${row}`))return;arm(ctx.state,`regenCast:${row}`,cooldown);ctx.heal(ctx.stats.maxHp*fraction);
  if(row===17){const gain=Math.min(ctx.stats.maxResource*.03,ctx.stats.maxResource-ctx.state.currentResource);ctx.state.currentResource+=gain;recordCoreMetric(ctx.state,row,"resource",gain);}recordCoreMetric(ctx.state,row,"procs",1);
 }}});
}
const transientStatCores = new Set([49, 61, 63, 71, 75, 78, 82, 100].map(coreId));
export function applyCoreStatEffects(state: AircraftCombatState, stats: EffectiveAircraftStats, includeTemporary = true, finalHp:(hp:number)=>number=hp=>hp): void {
    // Max HP first, so HP conditions use the final maximum rather than acquisition order.
    for (const id of state.selectedCores)
        if (id !== coreId(63) && id !== coreId(100) && (includeTemporary || !transientStatCores.has(id)))
            effects[id]?.stats?.(state, stats);
    const hpBefore=stats.maxHp;
    stats.maxHp=finalHp(hpBefore*(hasCore(state,94)?.65:1)*(hasCore(state,90)?1.1:1)*(includeTemporary&&hasCore(state,222)&&state.coreState.release?.mode==="giant"?1.4:1));
    applyCoreHpConditions(state,stats,includeTemporary);
    stats.maxHp=hpBefore;
    for (const id of state.selectedCores)
        if (id !== coreId(54) && (includeTemporary || !transientStatCores.has(id)))
            effects[id]?.finalStats?.(state, stats);
}
export function applyCoreHpConditions(state:AircraftCombatState, stats:EffectiveAircraftStats, includeTemporary=true):void {
    if(hasCore(state,63)) {stats.firepower+=15;stats.armor+=10;if(includeTemporary&&state.currentHp<stats.maxHp*.35){stats.firepower+=50;stats.armor+=35;}}
    if(includeTemporary&&hasCore(state,100)){const high=state.currentHp>stats.maxHp*.7,low=state.currentHp<stats.maxHp*.3;stats.firepower+=high?55:low?15:35;stats.armor+=high?10:low?55:35;}
}
export function applyFireRateLock(state: AircraftCombatState, stats: EffectiveAircraftStats): void {
    if (hasCore(state, 54)) {
        effects[coreId(54)].finalStats?.(state, stats);
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
        m *= 1.3;
    if (hasCore(state, 66) && c.time - c.lastKill <= 6)
        m *= 1 + .05 * (c.stacks.combo || 0);
    if (hasCore(state, 67) && (target.elite || target.boss))
        m *= 1.22;
    if (hasCore(state, 68)) m *= target.hp < target.maxHp*.30 || target.hp > target.maxHp*.70 ? 1.30 : 1.08;
    if (hasCore(state, 69) && target.hp > target.maxHp * .7)
        m *= 1.30;
    if (hasCore(state, 91))
        m *= 1 + Math.min(.8, .1+Math.max(0,1-state.currentHp/getMaxHpForDamage(state))*.7);
    if (hasCore(state,88)&&(target.elite||target.boss)&&target.hp<target.maxHp*.5)m*=1.15;
    if (active(state,"collisionCounter"))m*=1.12;
    if(hasCore(state,90)&&active(state,"deathRefusalDamage"))m*=1.30;
    if (source === "basic") {
        if (hasCore(state, 101)) m *= distance < screenHeight/3 ? 1.20 : 1.08;
        if (hasCore(state, 111)) m *= 1.12;
        if (hasCore(state,54)) m *= c.stacks.fireRateConversion ?? 1;
        if (hasCore(state,58)) m *= active(state,"overloadedBarrel") ? 1.15 : 1.08;
        if(hasCore(state,180))m*=1.08;
        if(hasCore(state,169)&&state.currentResource>=state.coreState.stacks.effectiveMaxResource*.3&&state.currentResource<=state.coreState.stacks.effectiveMaxResource*.7)m*=1.08;
        if(hasCore(state,75)&&(c.stacks.slaying??0)>=5)m*=1.10;
    }
    return m;
}
// Populated by the authoritative stats calculation; only used during resolved hits.
function getMaxHpForDamage(state: AircraftCombatState): number { return state.coreState.stacks.effectiveMaxHp || state.currentHp || 1; }
export function combineArmorPenetration(...sources: number[]): number {
    return 1 - sources.reduce((remaining, source) => remaining * (1 - Math.max(0, Math.min(1, source))), 1);
}
export function armorPenetration(state: AircraftCombatState, omitted?: number): number {
    return combineArmorPenetration(hasCore(state,57) && omitted!==57 ? .20 : 0, hasCore(state,88) && omitted!==88 ? .40 : 0);
}
export function negativeStatusDuration(state: AircraftCombatState, seconds: number): number {
    return seconds * ((state.coreState.timers.terraUltimate??0)>state.coreState.time&&(state.coreState.stacks.terraUltimateRank??0)>=2?.7:1) * (hasCore(state, 203) ? 1.35 : 1) * (hasCore(state, 98) ? .60 : 1);
}
export function coreStackLabel(state: AircraftCombatState, id: CoreId): string | null {
    const c = state.coreState;
    const labels: Record<string, string> = { [coreId(46)]: "Hỏa lực", [coreId(47)]: "Giáp", [coreId(48)]: "HP tối đa" };
    if (labels[id]) return `Đã cộng: +${(c.stacks[id] || 0).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} ${labels[id]}`;
    const remaining = (key: string) => Math.max(0, (c.timers[key] || 0) - c.time).toFixed(1).replace(".", ",");
    const shieldStatus = (key: string, cooldown?: string) => {
        const shield = c.shields[key];
        const amount = shield && shield.until > c.time ? Math.max(0, shield.amount) : 0;
        return `Khiên hiện tại: ${Math.round(amount)}${cooldown ? amount > 0 ? " · Hồi Chiêu bắt đầu khi Lá Chắn kết thúc" : ` · Hồi lại sau ${remaining(cooldown)}s` : ""}`;
    };
    switch (id) {
        case "core_229": return "Tổng tốc độ bắn ×2 · Đạn thường/đạn phụ 55% · Hiệu ứng cộng thêm giữ nguyên";
        case "core_049": return c.time - c.lastMove >= 2 ? "Đang tăng Hỏa lực và Giáp" : `Kích hoạt sau ${Math.max(0, 2 - c.time + c.lastMove).toFixed(1).replace(".", ",")}s đứng yên`;
        case "core_059": return `Tiến độ đòn cường hóa: ${state.basicShotsFired % 5} / 5`;
        case "core_060": return c.time-c.lastDamage>=3?"+30% Sát Thương Đòn Đánh Thường":`Còn ${Math.max(0,3-c.time+c.lastDamage).toFixed(1)}s`;
        case "core_082": return c.time - c.lastDamage >= 4 ? "Hiệu ứng không nhận sát thương đang hoạt động" : `Kích hoạt sau ${Math.max(0, 4 - c.time + c.lastDamage).toFixed(1).replace(".", ",")}s không nhận sát thương`;
        case "core_061": return active(state,"reactiveArmor") ? `Giáp phản ứng: còn ${remaining("reactiveArmor")}s · Hồi Chiêu bắt đầu sau hiệu ứng` : `Hồi lại sau ${remaining("reactiveArmorCd")}s`;
        case "core_064": return `Tiến độ hồi HP: ${c.stacks.soulKills??0} / 10 điểm`;
        case "core_066": return `Chuỗi hiện tại: ${c.time - c.lastKill <= 6 ? c.stacks.combo || 0 : 0} / 5`;
        case "core_070": return `Tiến độ giảm hồi chiêu: ${c.stacks.reactivation??0} / 5 điểm`;
        case "core_071": return `Tăng tốc bắn: còn ${remaining("tacticalRate")}s`;
        case "core_074": return "Mỗi chí mạng: giảm 0,4s hồi chiêu ba Skill cơ bản";
        case "core_075": return `Cộng dồn: ${c.stacks.slaying || 0} / 5 · +${(c.stacks.slaying || 0) * 8}% Hỏa lực`;
        case "core_076": return shieldStatus("reactive", "reactiveShieldCd");
        case "core_078": return `Tăng hồi tài nguyên: còn ${remaining("reactor")}s`;
        case "core_079": return `Tiến độ bắn thêm: ${state.basicShotsFired % 3} / 3`;
        case "core_081": return shieldStatus("skill", "skillShieldCd");
        case "core_083": return active(state,"counterActive") ? `Đang phản công: ${remaining("counterActive")}s` : `Hồi lại sau ${remaining("counterCd")}s`;
        case "core_092": return c.time-c.lastDamage>=3.5?"Hồi 1,8% Máu Tối Đa/s":"Hồi 0,2% Máu Tối Đa/s";
        case "core_099": return shieldStatus("reserve", "reserveShieldCd");
        case "core_104": return shieldStatus("overheal");
        case "core_107": return `Graze: ${c.stacks.graze??0}/4`;
        case "core_109": return `Cánh trái: ${remaining("wing:left_wing")}s · Cánh phải: ${remaining("wing:right_wing")}s`;
        case "core_113": return c.stacks.borrowPending ? "Đang vay · trả nợ khi kỹ năng kết thúc" : `Có thể vay sau ${remaining("futureDebt")}s`;
        case "core_114": { const stacks=active(state,"sameTarget")?Math.min(4,Math.floor((c.stacks.sameTargetHits??0)/4)):0; return `Nhịp Bắn ${stacks}/4 · +${stacks*25}% Tốc Độ Bắn Cộng Thêm · ${remaining("sameTarget")}s`; }
        case "core_116": return `Cùng mục tiêu: ${active(state,"sameTarget")?Math.min(4,Math.floor((c.stacks.sameTargetHits??0)/4)):0}/4 tầng · ${active(state,"sameTarget")?(c.stacks.sameTargetHits??0)%5:0}/5 hit · ${remaining("sameTarget")}s`;
        case "core_168": return `Quái thường: ${c.stacks.shiftKills??0}/10 · Basic Elite/Boss: ${c.stacks.microHits??0}/40 · Giảm phí: ${remaining("shiftDiscount")}s`;
        case "core_196": return `Tiến độ chí mạng: ${c.stacks.crimsonProgress??0}/4 · +${Math.min(50,(c.stacks.crimsonCrit??0)*5)}% Sát Thương Chí Mạng`;
        case "core_204": return `Damage Armor/Shield đã ngăn: ${Math.round(c.stacks.armorMeter??0)}/${Math.round((c.stacks.effectiveMaxHp??1)*.25)}`;
        case "core_217": return state.coreState.release?.pendingGuaranteedDiamondSelection?"Lượt milestone kế tiếp: 100% Kim Cương":"Tỷ lệ: 20% Bạc / 30% Vàng / 50% Kim Cương";
        case "core_218": return `Dư chấn tối hậu: ${remaining("ultimateAftershock")}s`;
        case "core_120": return (c.timers.controlOverride??0)>c.time ? `Hồi chiêu: ${remaining("controlOverride")}s` : "Hack tối đa 5 địch thường 12s / 1 Tinh Anh 9s / choáng Boss 2s; hồi 13s sau khi hiệu ứng kết thúc. Theo dõi trạng thái trên biểu tượng Lõi.";
        case "core_121": return `Phản Vật Chất: ${Math.round(c.stacks.antimatter??0)} sát thương / 450% Hỏa Lực`;
        case "core_106": return `Loạt Tomahawk tiếp theo sau ${remaining("tomahawk")}s`;
        default: return null;
    }
}
