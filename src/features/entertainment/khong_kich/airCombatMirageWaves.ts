import type { EnemyType } from "./airCombatTypes";
import type { WaveDefinition } from "./airCombatWaves";

function wave(label: string, counts: Partial<Record<EnemyType, number>>, cap: number,
  interval: number, xpPerKill: number, normal: number, elite = 0): WaveDefinition {
  return { label, counts, cap, interval, xpPerKill, normal, elite,
    hp: elite || normal === 1 ? 1 : normal === 2 ? 1.15 : normal === 3 ? 1.35 : normal === 4 ? 1.6 : 1.9,
    armor: elite || normal === 1 ? 1 : normal === 2 ? 1.05 : normal === 3 ? 1.1 : normal === 4 ? 1.18 : 1.25,
    damage: elite === 1 ? 1.15 : elite === 2 ? 1.45 : normal === 1 ? 1 : normal === 2 ? 1.1 : normal === 3 ? 1.2 : normal === 4 ? 1.35 : 1.5,
    xpBudget: Object.values(counts).reduce((sum, count) => sum + count, 0) * xpPerKill };
}

// Helpers and the independent aircraft duel never enter the main-enemy ledger.
export const MIRAGE_WAVES: readonly WaveDefinition[] = [
  wave("FIRST REFLECTION", { mirage_wisp: 14, parallax_lancer: 10, veil_weaver: 8, echo_hunter: 8 }, 14, .21, 7, 1),
  wave("BROKEN IMAGE", { mirage_wisp: 10, parallax_lancer: 10, holo_bastion: 8, veil_weaver: 9, echo_hunter: 10, phantom_carrier: 8 }, 16, .19, 7, 2),
  wave("HALL OF MIRRORS", { mirror_arbiter: 1, null_jailer: 1, refraction_ace: 1, glass_monarch: 1 }, 4, .34, 75, 2, 1),
  wave("FALSE HORIZON", { mirage_wisp: 10, parallax_lancer: 12, holo_bastion: 10, veil_weaver: 12, echo_hunter: 14, phantom_carrier: 12 }, 19, .18, 8, 3),
  wave("FRACTURED REALITY", { mirage_wisp: 10, parallax_lancer: 14, holo_bastion: 13, veil_weaver: 16, echo_hunter: 17, phantom_carrier: 15 }, 21, .165, 8, 4),
  wave("PARALLAX COURT", { phantom_executioner: 1, veil_architect: 1, echo_bastion_prime: 1, parallax_seraph: 1, fracture_sovereign: 1 }, 5, .28, 90, 4, 2),
  wave("MIRAGE COLLAPSE", { mirage_wisp: 12, parallax_lancer: 16, holo_bastion: 16, veil_weaver: 18, echo_hunter: 20, phantom_carrier: 18 }, 23, .15, 8, 5),
  { label: "THE OTHER SELF", counts: {}, cap: 1, interval: 1, xpPerKill: 0, xpBudget: 0, normal: 5, elite: 0, hp: 1, armor: 1, damage: 1 },
];
