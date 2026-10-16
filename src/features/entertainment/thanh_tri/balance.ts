import type {Owner} from './content';

/** V1.1 coefficients. Secondary hits and DoTs scale from the same authored base. */
export const LEGACY_DAMAGE:Record<Owner,number>={archer:100,crossbow:60,fire:140,ice:100,lightning:80,wind:160,earth:60,poison:60,sniper:330,scythe:120,stars:70};
export const BALANCE={
 cooldownFloor:.55, heavyBonus:.4, heavyCooldown:.2, fastReduction:.3, fastPenalty:.2,
 bossBonus:.5, executeBonus:.45, openingBonus:.5,
 iceSlow:.4, iceSlowSeconds:2.5, iceFreezeEvery:3, iceFreezeSeconds:.65,
 earthHalfWidth:14, earthPulseInterval:.22, earthStun:.2,
 lightningUnusedHopBonus:.2,
} as const;
