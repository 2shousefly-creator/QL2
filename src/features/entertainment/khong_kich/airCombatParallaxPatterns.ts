/** Stage 4 only. Angles are the full fan width; every basic ray is real. */
export const PARALLAX_FANS = [
  { count: 9, degrees: 96 },
  { count: 11, degrees: 80 },
  { count: 13, degrees: 64 },
  { count: 15, degrees: 48 },
] as const;
export const parallaxPhase = (ratio: number) => ratio > .7 ? 1 : ratio > .4 ? 2 : ratio >= .15 ? 3 : 4;
export const parallaxFan = (phase: number) => PARALLAX_FANS[Math.max(0, Math.min(3, phase - 1))];

export type ParallaxSkill = 'split' | 'barrage' | 'horizon' | 'cage' | 'rush' | 'swap'
  | 'replay' | 'future' | 'grid' | 'rail' | 'veil' | 'nova' | 'sweep' | 'crossrail' | 'echo' | 'doubleRush';

// 7 / 9 / 9 / 19 slots, versus 3 / 4 / 4 / 9. Phase entry starts its own cycle.
export const PARALLAX_SKILL_CYCLES: readonly (readonly ParallaxSkill[])[] = [
  ['split', 'rail', 'barrage', 'nova', 'horizon', 'echo', 'sweep'],
  ['cage', 'echo', 'rush', 'crossrail', 'swap', 'barrage', 'nova', 'veil', 'sweep'],
  ['replay', 'echo', 'future', 'crossrail', 'grid', 'nova', 'barrage', 'doubleRush', 'sweep'],
  ['split', 'nova', 'cage', 'echo', 'barrage', 'crossrail', 'rush', 'horizon', 'rail',
    'replay', 'future', 'swap', 'sweep', 'grid', 'veil', 'doubleRush', 'nova', 'echo', 'barrage'],
];
/** Twice the previous 1.5 / .9 second cast cadence, before fire-rate debuffs. */
export const parallaxCastInterval = (phase: number) => phase === 4 ? .45 : .75;
