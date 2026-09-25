import type { EnemyType } from "./airCombatTypes";
import type { WaveDefinition } from "./airCombatWaves";

// Authored introductions consume the SAME count ledger as subsequent mixed groups.
function wave(label: string, counts: Partial<Record<EnemyType, number>>, normal: number,
  cap: number, xpPerKill: number, interval: number, elite = 0, intros: EnemyType[][] = []): WaveDefinition {
  const remaining = { ...counts }, groups: EnemyType[][] = [];
  for (const intro of intros) {
    const group: EnemyType[] = [];
    for (const type of intro) if ((remaining[type] ?? 0) > 0) { group.push(type); remaining[type]!--; }
    if (group.length) groups.push(group);
  }
  const types = Object.keys(counts) as EnemyType[], size = normal === 1 ? 6 : normal === 2 ? 7 : 8;
  let ordinal = 0;
  while (types.some(type => (remaining[type] ?? 0) > 0)) {
    const group: EnemyType[] = [];
    while (group.length < size && types.some(type => (remaining[type] ?? 0) > 0)) {
      const type = types[ordinal++ % types.length];
      if ((remaining[type] ?? 0) > 0) { group.push(type); remaining[type]!--; }
    }
    groups.push(group);
  }
  const hp = elite || counts.boss ? 1 : normal === 1 ? 1 : normal === 2 ? 1.15 : normal === 3 ? 1.35 : 1.9;
  const armor = elite || counts.boss ? 1 : normal === 1 ? 1 : normal === 2 ? 1.05 : normal === 3 ? 1.1 : 1.25;
  const damage = counts.boss ? 1 : elite === 1 ? 1.15 : elite === 2 ? 1.45 : normal === 1 ? 1 : normal === 2 ? 1.1 : normal === 3 ? 1.2 : 1.5;
  return { label, counts, normal, elite, cap, xpPerKill, interval, hp, armor, damage,
    xpBudget: Object.values(counts).reduce((n, c) => n + c, 0) * xpPerKill,
    groups: elite || counts.boss ? undefined : groups };
}
export const STORMBREAKER_WAVES: readonly WaveDefinition[] = [
  wave("STATIC FRONT", { spark_wasp: 18, volt_lancer: 14, storm_capacitor: 12 }, 1, 13, 8, .23, 0,
    [Array(6).fill("spark_wasp"), Array(6).fill("volt_lancer"), Array(6).fill("storm_capacitor")]),
  wave("BUILDING CHARGE", { spark_wasp: 15, volt_lancer: 13, storm_capacitor: 11, storm_weaver: 9, thunderhead: 8 }, 2, 15, 9, .22, 0,
    [["storm_weaver", "storm_capacitor", "spark_wasp"], ["thunderhead", "spark_wasp", "volt_lancer"]]),
  wave("THUNDER COUNCIL", { storm_herald: 1, volt_executioner: 1, capacitor_prime: 1 }, 2, 3, 80, .4, 1),
  wave("EYE WALL", { spark_wasp: 14, volt_lancer: 12, storm_capacitor: 11, storm_weaver: 10, thunderhead: 11, ion_hunter: 11 }, 3, 18, 10, .20, 0,
    [["ion_hunter", "spark_wasp", "spark_wasp"]]),
  wave("EYE OF THE STORM", { ion_arbiter: 1, thunder_bastion: 1, arc_seraph: 1, storm_weaver_prime: 1 }, 4, 4, 110, .25, 2),
  wave("PERPETUAL STORM", { spark_wasp: 20, volt_lancer: 17, storm_capacitor: 15, storm_weaver: 12, thunderhead: 12, ion_hunter: 12 }, 5, 21, 11, .18),
  wave("STORMBREAKER Ω", { boss: 1 }, 5, 1, 0, 1),
];
