export interface Motion {
  anticipation: number; release: number; recovery: number; lean: number; weapon: number;
  arm: number; lunge: number; lift: number; recoil: number; twist: number;
}
export interface HeroAnimationProfile {
  idle: { rate: number; bob: number; sway: number; breath: number };
  move: { rate: number; stride: number; bounce: number; lean: number; wing: number };
  basicAttack: Motion; skill1: Motion; skill2: Motion;
  secondary: { rate: number; amplitude: number; drag: number };
  hitReaction: number; death: 'fall' | 'kneel' | 'dissolve' | 'fold' | 'crumble'; victory: 'raise' | 'bow' | 'float' | 'roar';
}
type Row = [number, number, number, number, number, number, number, number, number, number, number, number, HeroAnimationProfile['death'], HeroAnimationProfile['victory']];
// Unique movement and action curves for every hero. These tune visual poses only;
// impact time and total action duration remain the authoritative combat command.
const rows: Record<string, Row> = {
  H001: [1.1, .7, .009, 5.2, 4, 2, -.09, .78, 32, 0, .025, .18, 'crumble', 'roar'],
  H002: [1.7, 1.9, .022, 7.3, 8, 2.4, -.05, -.55, 15, 3, .05, .25, 'kneel', 'bow'],
  H003: [2.3, 1.2, .036, 10.8, 14, 6.5, .14, .95, 39, 19, .045, .32, 'fold', 'roar'],
  H004: [.85, .5, .013, 4.8, 3.8, 1.2, .03, -.32, 9, 0, .018, .14, 'crumble', 'bow'],
  H005: [1.9, 1.4, .028, 8.4, 13, 3.8, .09, 1.6, 27, 2, .1, .6, 'fall', 'raise'],
  H006: [3.2, 1.1, .047, 11.5, 12, 2.1, .12, -.95, 22, 0, .16, .78, 'kneel', 'roar'],
  H007: [1.4, 1, .008, 7.6, 10, 1.7, .015, 1.3, 18, 0, .07, .2, 'kneel', 'raise'],
  H008: [2.7, 2.8, .067, 9.7, 15, 7, .03, -1.7, 24, 18, .12, .92, 'fold', 'bow'],
  H009: [3.4, .8, .053, 13.4, 18, 3, .2, -.72, 45, 11, .19, .84, 'dissolve', 'bow'],
  H010: [1.6, 1.3, .019, 8.1, 9, 1.3, -.04, 1.08, 26, 1, .14, .43, 'fold', 'raise'],
  H011: [1.2, 5.8, .043, 4.5, 0, 1, -.025, -.25, 5, 6, .06, .27, 'dissolve', 'float'],
  H012: [1.85, 1.6, .021, 8.8, 10.5, 2.6, -.07, -.39, -9, 1, .11, .3, 'kneel', 'raise'],
  H013: [3.6, 2.3, .048, 12.6, 17, 8.4, .11, -.66, 10, 15, .13, .65, 'fold', 'roar'],
  H014: [1.05, .6, .011, 6.4, 7.4, 1, -.02, -.18, -5, 0, .045, .16, 'crumble', 'raise'],
  H015: [2.1, 6.5, .058, 5.6, 0, 2.2, -.08, .48, 4, 13, .08, .5, 'dissolve', 'float'],
  H016: [1.3, 4.3, .025, 5.1, 0, 1.7, -.03, -.79, 7, 7, .06, .4, 'dissolve', 'raise'],
  H017: [2.8, 3.1, .042, 9.2, 6, 4, .14, 1.17, 16, 17, .09, .88, 'dissolve', 'roar'],
  H018: [1.15, 3.6, .032, 5.9, 2, 1.1, -.045, -.9, 6, 4, .07, .47, 'fold', 'bow'],
  H019: [2.45, 4.7, .064, 7, 1, 3.5, .045, 1.24, 10, 9, .095, .73, 'dissolve', 'float'],
  H020: [2.05, 1.8, .038, 10.2, 13, 5.8, .065, -1.45, 15, 12, .085, .56, 'fold', 'raise'],
};
export const HERO_ANIMATION_PROFILES: Record<string, HeroAnimationProfile> = Object.fromEntries(Object.entries(rows).map(([id, r], i) => {
  const base: Motion = { anticipation: .62 + (i % 4) * .06, release: .07 + (i % 3) * .02, recovery: .67 + (i % 5) * .035, lean: r[6], weapon: r[7], arm: r[7] * .56, lunge: r[8], lift: r[9], recoil: r[10], twist: r[11] };
  return [id, { idle: { rate: r[0], bob: r[1], sway: r[2], breath: .006 + i % 3 * .002 }, move: { rate: r[3], stride: r[4], bounce: r[5], lean: r[6], wing: r[11] }, basicAttack: base,
    skill1: { ...base, weapon: base.weapon * 1.22, lean: base.lean * 1.25, lunge: base.lunge * 1.2, lift: base.lift + 5, twist: base.twist * 1.15 },
    skill2: { ...base, weapon: -base.weapon * 1.45, arm: -base.arm * 1.3, lift: base.lift + 15, lunge: base.lunge * .8, twist: base.twist * 1.5, anticipation: .78 },
    secondary: { rate: 1.3 + i * .12, amplitude: .022 + r[11] * .13, drag: .2 + i % 4 * .17 }, hitReaction: r[10], death: r[12], victory: r[13] }];
}));
export const animationProfile = (id: string) => HERO_ANIMATION_PROFILES[id] || HERO_ANIMATION_PROFILES.H001;
