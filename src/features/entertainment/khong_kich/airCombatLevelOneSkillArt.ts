import type { SkillId } from './airCombatTypes';
import atlas0 from '../../../assets/khong-kich/26.29.0/skills-viper-titan-phantom.png';
import atlas1 from '../../../assets/khong-kich/26.29.0/skills-astra-cinder-riptide.png';
import atlas2 from '../../../assets/khong-kich/26.29.0/skills-argent-sylva-terra.png';

type SkillIconFrame = { atlas: string; rect: readonly [number, number, number, number] };
/** Explicit semantic cells; inset excludes generated atlas separator lines. */
export const LEVEL_ONE_SKILL_ART = {
  decoy: { atlas: atlas0, rect: [2/1448, 2/1086, 358/1448, 342/1086] },
  afterburner: { atlas: atlas0, rect: [364/1448, 2/1086, 358/1448, 342/1086] },
  predator_lock: { atlas: atlas0, rect: [726/1448, 2/1086, 358/1448, 342/1086] },
  missile_swarm: { atlas: atlas0, rect: [1088/1448, 2/1086, 358/1448, 342/1086] },
  armor_shield: { atlas: atlas0, rect: [2/1448, 348/1086, 358/1448, 349/1086] },
  heavy_bomb: { atlas: atlas0, rect: [364/1448, 348/1086, 358/1448, 349/1086] },
  gravity_anchor: { atlas: atlas0, rect: [726/1448, 348/1086, 358/1448, 349/1086] },
  sweeping_cannon: { atlas: atlas0, rect: [1088/1448, 348/1086, 358/1448, 349/1086] },
  invisibility: { atlas: atlas0, rect: [2/1448, 701/1086, 358/1448, 383/1086] },
  focus_laser: { atlas: atlas0, rect: [364/1448, 701/1086, 358/1448, 383/1086] },
  electronic_interference: { atlas: atlas0, rect: [726/1448, 701/1086, 358/1448, 383/1086] },
  escort_drone: { atlas: atlas0, rect: [1088/1448, 701/1086, 358/1448, 383/1086] },
  orbit_reversal: { atlas: atlas1, rect: [2/1448, 2/1086, 358/1448, 358/1086] },
  stellar_lance: { atlas: atlas1, rect: [364/1448, 2/1086, 358/1448, 358/1086] },
  twin_reflection: { atlas: atlas1, rect: [726/1448, 2/1086, 358/1448, 358/1086] },
  starfall: { atlas: atlas1, rect: [1088/1448, 2/1086, 358/1448, 358/1086] },
  cinder_fire_shield: { atlas: atlas1, rect: [2/1448, 364/1086, 358/1448, 344/1086] },
  cinder_fuel_barrage: { atlas: atlas1, rect: [364/1448, 364/1086, 358/1448, 344/1086] },
  cinder_heat_wave: { atlas: atlas1, rect: [726/1448, 364/1086, 358/1448, 344/1086] },
  cinder_inferno_beam: { atlas: atlas1, rect: [1088/1448, 364/1086, 358/1448, 344/1086] },
  riptide_wellspring: { atlas: atlas1, rect: [2/1448, 712/1086, 358/1448, 372/1086] },
  riptide_tidal_blades: { atlas: atlas1, rect: [364/1448, 712/1086, 358/1448, 372/1086] },
  riptide_confluence: { atlas: atlas1, rect: [726/1448, 712/1086, 358/1448, 372/1086] },
  riptide_waterform: { atlas: atlas1, rect: [1088/1448, 712/1086, 358/1448, 372/1086] },
  argent_guard_stance: { atlas: atlas2, rect: [2/1448, 2/1086, 358/1448, 344/1086] },
  argent_blade_cast: { atlas: atlas2, rect: [364/1448, 2/1086, 358/1448, 344/1086] },
  argent_blade_recall: { atlas: atlas2, rect: [726/1448, 2/1086, 358/1448, 344/1086] },
  argent_heavenly_blade_array: { atlas: atlas2, rect: [1088/1448, 2/1086, 358/1448, 344/1086] },
  sylva_symbiosis: { atlas: atlas2, rect: [2/1448, 350/1086, 358/1448, 364/1086] },
  sylva_acid_burst: { atlas: atlas2, rect: [364/1448, 350/1086, 358/1448, 364/1086] },
  sylva_parasitic_seed: { atlas: atlas2, rect: [726/1448, 350/1086, 358/1448, 364/1086] },
  sylva_deathbloom: { atlas: atlas2, rect: [1088/1448, 350/1086, 358/1448, 364/1086] },
  terra_reactive_rock_armor: { atlas: atlas2, rect: [2/1448, 718/1086, 358/1448, 366/1086] },
  terra_seismic_cannon: { atlas: atlas2, rect: [364/1448, 718/1086, 358/1448, 366/1086] },
  terra_strata_clamp: { atlas: atlas2, rect: [726/1448, 718/1086, 358/1448, 366/1086] },
  terra_geocore_overdrive: { atlas: atlas2, rect: [1088/1448, 718/1086, 358/1448, 366/1086] },
} satisfies Record<SkillId, SkillIconFrame>;
