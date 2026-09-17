// Shared static frames for the battle renderer and release-note thumbnails.
import { STAGE2_ENEMY_ART } from "./airCombatStage2Art";
import type { EnemyType } from "./airCombatTypes";
import type { AtlasFrame } from "./pixi/airCombatPixiTypes";
const cell = (atlas: AtlasFrame["atlas"], x: number, y: number): AtlasFrame => ({ atlas, rect: [x / 4, y / 4, .25, .25] });
export const ENEMY_VISUALS: Record<EnemyType, AtlasFrame> = {
  prism_sovereign: STAGE2_ENEMY_ART.prism_sovereign!,
  mine_warden: STAGE2_ENEMY_ART.mine_warden!,
  polarity_warden: STAGE2_ENEMY_ART.polarity_warden!,
  swarm_overlord: STAGE2_ENEMY_ART.swarm_overlord!,
  arc_reaver_prime: STAGE2_ENEMY_ART.arc_reaver_prime!,
  orbit_wasp: STAGE2_ENEMY_ART.orbit_wasp!,
  arc_reaver: STAGE2_ENEMY_ART.arc_reaver!,
  mine_seeder: STAGE2_ENEMY_ART.mine_seeder!,
  magnetic_leech: STAGE2_ENEMY_ART.magnetic_leech!,
  prism_manta: STAGE2_ENEMY_ART.prism_manta!,
  swarm_carrier: STAGE2_ENEMY_ART.swarm_carrier!,
  micro_drone: STAGE2_ENEMY_ART.micro_drone!,
  cyclone_ace: STAGE2_ENEMY_ART.cyclone_ace!,
  grid_architect: STAGE2_ENEMY_ART.grid_architect!,
  satellite: STAGE2_ENEMY_ART.satellite!,
  scout: cell("aircraft", 3, 1), fighter: cell("aircraft", 3, 2),
  attacker: cell("aircraft", 0, 3), kamikaze: cell("aircraft", 1, 3),
  bomber: cell("aircraft", 2, 3), elite: cell("aircraft", 3, 3),
  // The generated fortress spans 56% of the sheet; explicit trims avoid clipping its wings.
  boss: { atlas: "fortress", rect: [0, 0, 0.56, 0.51] },
  sniper: cell("aircraft",3,2), jammer: cell("aircraft",3,1),
  iron_fortress: { atlas: "fortress", rect: [0.56, 0, 0.44, 0.51] },
  acid_bomber:cell("aircraft",2,3), radar_hunter:cell("aircraft",3,3),
};
