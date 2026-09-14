import { AIRCRAFT_CONFIGS, CORE_DEFINITIONS, CORE_TIER_CHANCES } from "./airCombatConfig";
import { getEffectiveAircraftStats } from "./airCombatAircraft";
import type { AircraftCombatState, CoreCard, CoreDefinition, CoreTier } from "./airCombatTypes";
const TIERS: CoreTier[] = ["silver", "gold", "diamond"];
const pick = <T>(pool: readonly T[], random: () => number): T | undefined => pool[Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))];
function weightedTier(valid: CoreTier[], random: () => number): CoreTier | undefined {
    let roll = random() * valid.reduce((n, t) => n + CORE_TIER_CHANCES[t], 0);
    for (const tier of valid) {
        roll -= CORE_TIER_CHANCES[tier];
        if (roll < 0)
            return tier;
    }
    return valid[valid.length - 1];
}
export function rollCoreTier(_selectionNumber: number, random: () => number = Math.random): CoreTier { return weightedTier(TIERS, random)!; }
const eligible = (state: AircraftCombatState, tier?: CoreTier) => CORE_DEFINITIONS.filter(c => !c.skillId && !state.selectedCores.includes(c.id) && (!tier || c.tiers[0] === tier));
export function makeCoreCard(definition: CoreDefinition): CoreCard {
    return { id: definition.id, name: definition.name, description: definition.description, system: definition.system, skillSlot: definition.skillSlot,
        icon: definition.icon, category: definition.category, tier: definition.tiers[0], valueLabel: definition.skillSlot ? `Kỹ năng ${definition.skillSlot}` : definition.system };
}
/** selectionNumber retained for callers; queued level is the authority. */
export function generateCoreChoices(state: AircraftCombatState, selectionNumber: number, random: () => number = Math.random): CoreCard[] {
    const level = state.pendingMilestones[0] ?? selectionNumber * 3;
    if (level === 9 || level === 18 || level === 27) {
        const skill = AIRCRAFT_CONFIGS[state.aircraftId].skillIds[level / 9 - 1];
        return CORE_DEFINITIONS.filter(c => c.skillId === skill).map(makeCoreCard);
    }
    let tier: CoreTier | undefined = rollCoreTier(selectionNumber, random);
    if (eligible(state, tier).length < 3)
        tier = weightedTier(TIERS.filter(t => eligible(state, t).length >= 3), random);
    const pool = eligible(state, tier), chosen: CoreCard[] = [];
    while (pool.length && chosen.length < 3) {
        const core = pick(pool, random)!;
        pool.splice(pool.indexOf(core), 1);
        chosen.push(makeCoreCard(core));
    }
    return chosen;
}
/** Ownership precedes callbacks; explicit work stack resolves nested conversions immediately. */
export function applyCore(state: AircraftCombatState, card: CoreCard, random: () => number = Math.random, onAcquire?: (id: string) => void): boolean {
    const first = CORE_DEFINITIONS.find(c => c.id === card.id);
    if (!first || first.tiers[0] !== card.tier || state.selectedCores.includes(first.id))
        return false;
    if (first.skillId && (!first.aircraftIds?.includes(state.aircraftId) || state.modifiers.skillCores[first.skillId]))
        return false;
    type Work = {
        core: CoreDefinition;
    } | {
        tier?: CoreTier;
    };
    const work: Work[] = [{ core: first }];
    while (work.length) {
        const item = work.pop()!;
        let core: CoreDefinition | undefined;
        if ("core" in item)
            core = item.core;
        else {
            const tier = item.tier ?? weightedTier(TIERS.filter(t => eligible(state, t).length > 0), random);
            if (!tier)
                continue;
            core = pick(eligible(state, tier), random);
        }
        if (!core || state.selectedCores.includes(core.id))
            continue;
        const before = getEffectiveAircraftStats(state);
        state.selectedCores.push(core.id);
        if (core.skillId)
            state.modifiers.skillCores[core.skillId] = core.id;
        const after = getEffectiveAircraftStats(state);
        state.currentHp = Math.min(after.maxHp, state.currentHp + Math.max(0, after.maxHp - before.maxHp));
        state.currentResource = Math.min(after.maxResource, state.currentResource);
        onAcquire?.(core.id);
        if (core.id === "core_050")
            work.push({ tier: "gold" });
        if (core.id === "core_051")
            work.push({ tier: "diamond" });
        if (core.id === "core_052")
            work.push({}, {});
    }
    return true;
}
