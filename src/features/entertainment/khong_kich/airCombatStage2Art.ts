import eliteUrl from "../../../assets/khong-kich/26.25.0/compat/stage2-stage2-elite-atlas.png";
import enemyUrl from "../../../assets/khong-kich/stage2/stage2-enemy-atlas.png";
import vfxUrl from "../../../assets/khong-kich/stage2/stage2-vfx-atlas.png";
import stormUrl from "../../../assets/khong-kich/stage2/magnetic-storm.png";
import menuUrl from "../../../assets/khong-kich/stage2/main-menu-sky.png";
import type { AtlasFrame } from "./pixi/airCombatPixiTypes";
import type { EnemyType } from "./airCombatTypes";

export const STAGE2_ART_URLS = { elite: eliteUrl, enemy: enemyUrl, vfx: vfxUrl, storm: stormUrl, menu: menuUrl };
// Explicit generated-source trims, rather than assuming that painted ships
// occupy identical grid cells. Original alpha is retained in the committed PNG.
const ship = (x: number, y: number, w: number, h: number): AtlasFrame =>
  ({ atlas: "stage2Enemy", rect: [x / 1086, y / 1448, w / 1086, h / 1448] });
// 26.8.1 aircraft redraw retains the five existing cells and all collision dimensions.
export const STAGE2_ENEMY_ART: Partial<Record<EnemyType, AtlasFrame>> = {
  prism_sovereign: { atlas: "stage2Elite", rect: [0/5, 0, 1/5, 1/2] },
  mine_warden: { atlas: "stage2Elite", rect: [1/5, 0, 1/5, 1/2] },
  polarity_warden: { atlas: "stage2Elite", rect: [2/5, 0, 1/5, 1/2] },
  swarm_overlord: { atlas: "stage2Elite", rect: [3/5, 0, 1/5, 1/2] },
  arc_reaver_prime: { atlas: "stage2Elite", rect: [4/5, 0, 1/5, 1/2] },
  orbit_wasp: ship(18, 0, 328, 333), arc_reaver: ship(360, 0, 362, 340), mine_seeder: ship(745, 0, 326, 331),
  magnetic_leech: ship(66, 370, 237, 291), prism_manta: ship(350, 339, 388, 340), swarm_carrier: ship(744, 333, 334, 350),
  micro_drone: ship(52, 749, 254, 196), cyclone_ace: ship(365, 679, 368, 305), grid_architect: ship(773, 699, 293, 284),
  satellite: ship(8, 1000, 347, 397), boss: ship(358, 984, 363, 431),
};
export const TEMPEST_WEAKPOINT_ART = ship(723, 984, 362, 431);
const fx = (col: number, row: number): AtlasFrame => ({ atlas: "stage2Vfx", rect: [col / 5, row / 6, 1 / 5, 1 / 6] });
export const STAGE2_VFX_ART = {
  acidDrop: { atlas: "stage2Elite", rect: [32/640, 1/2, 64/640, 1/2] } as AtlasFrame,
  acidSplash: { atlas: "stage2Elite", rect: [1/5, 1/2, 1/5, 1/2] } as AtlasFrame,
  needleBolt: fx(0,0), arcBolt: fx(1,0), prismOrb: fx(2,0), prismShard: fx(3,0), returningDisc: fx(4,0),
  magneticMine: fx(0,1), nodeCapsule: fx(1,1), microSpark: fx(2,1), crownBolt: fx(3,1), satelliteOrb: fx(4,1),
  smallMuzzle: fx(0,2), eliteMuzzle: fx(1,2), electricImpact: fx(2,2), plasmaImpact: fx(3,2), mineArming: fx(4,2),
  mineShockwave: fx(0,3), droneSpawn: fx(1,3), shieldFlare: fx(2,3), beamCharge: fx(3,3), magneticBeam: fx(4,3),
  gridBeam: fx(0,4), pulseRing: fx(1,4), smallBurst: fx(2,4), bossBurst: fx(3,4), bladeSlash: fx(4,4),
  weakpointFlash: fx(0,5), tetherPulse: fx(2,5), warningPulse: fx(3,5), magneticBurst: fx(4,5),
} as const;
export type MagneticVfxKey = keyof typeof STAGE2_VFX_ART;
