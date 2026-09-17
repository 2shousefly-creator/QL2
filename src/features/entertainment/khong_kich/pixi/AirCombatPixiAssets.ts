import { STAGE2_ART_URLS, STAGE2_ENEMY_ART, STAGE2_VFX_ART, TEMPEST_WEAKPOINT_ART } from "../airCombatStage2Art";
import { PLAYER_STANDARD_AIRFRAME_SIZE } from "../airCombatHitboxes";
import { PLAYER_ARTWORK } from "../airCombatArtwork";
import phantomBeamUrl from "../../../../assets/khong-kich/v2/phantom-firing-beam.svg";
import basicAmmoUrl from "../../../../assets/khong-kich/v2/player-basic-ammo-atlas.svg";
import healingCrossUrl from "../../../../assets/khong-kich/v2/healing-cross.svg";
import bigbangUrl from "../../../../assets/khong-kich/v2/bigbang-missile.svg";
import flameUrl from "../../../../assets/khong-kich/v2/missile-engine-flame.svg";
import ammoUrl from "../../../../assets/khong-kich/v2/hardcore-ammo-atlas.svg";
import { AMMO_VISUALS } from "../airCombatAmmo";
import type { AmmoVisualKey } from "../airCombatAmmo";
import { Assets, Rectangle, Texture } from "pixi.js";
import aircraftUrl from "../../../../assets/khong-kich/v2/aircraft-atlas.png";
import fortressUrl from "../../../../assets/khong-kich/v2/fortress-clouds-atlas.png";
import vfxUrl from "../../../../assets/khong-kich/v2/vfx-atlas.png";
import type { AircraftId, EnemyType } from "../airCombatTypes";
import type { AircraftVisualDefinition, AtlasFrame } from "./airCombatPixiTypes";

const cell = (atlas: AtlasFrame["atlas"], x: number, y: number): AtlasFrame => ({ atlas, rect: [x / 4, y / 4, 0.25, 0.25] });
export const AIRCRAFT_VISUALS: Record<AircraftId, AircraftVisualDefinition> = {
  black_eagle: { neutral: cell("aircraft", 0, 0), left: cell("aircraft", 1, 0), right: cell("aircraft", 2, 0), size: PLAYER_STANDARD_AIRFRAME_SIZE, artwork: PLAYER_ARTWORK.black_eagle, tint: 0x67e8f9 },
  breaker: { neutral: cell("aircraft", 0, 1), left: cell("aircraft", 1, 1), right: cell("aircraft", 2, 1), size: PLAYER_STANDARD_AIRFRAME_SIZE, artwork: PLAYER_ARTWORK.breaker, tint: 0xfbbf24 },
  phantom: { neutral: cell("aircraft", 0, 2), left: cell("aircraft", 1, 2), right: cell("aircraft", 2, 2), size: PLAYER_STANDARD_AIRFRAME_SIZE, artwork: PLAYER_ARTWORK.phantom, tint: 0xc4b5fd },
};
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
const ammoFrames = Object.fromEntries(Object.entries(AMMO_VISUALS).map(([key,v]) => [key,key.endsWith("_basic_ammo")?{atlas:"basicAmmo",rect:[v.cell[0]/3,0,1/3,1/2]}:cell("ammo",v.cell[0],v.cell[1])])) as Record<AmmoVisualKey,AtlasFrame>;
export const VFX_VISUALS = {
  ...STAGE2_VFX_ART,
  healingCross: { atlas: "healingCross", rect: [0, 0, 1, 1] } as AtlasFrame,
  ...ammoFrames,
  basicAmmoTrail: { atlas: "basicAmmo", rect: [0, 1/2, 1/3, 1/2] } as AtlasFrame,
  muzzle: cell("vfx", 0, 0), tracer: cell("vfx", 1, 0), enemyTracer: cell("vfx", 2, 0), missile: cell("vfx", 3, 0),
  smallExplosion: cell("vfx", 0, 1), mediumExplosion: cell("vfx", 1, 1), largeExplosion: cell("vfx", 2, 1), bossExplosion: cell("vfx", 3, 1),
  sparks: cell("vfx", 0, 2), smoke: cell("vfx", 1, 2), damageSmoke: cell("vfx", 2, 2), fire: cell("vfx", 3, 2),
  shield: cell("vfx", 0, 3), charge: cell("vfx", 1, 3), laser: cell("vfx", 2, 3), shockwave: cell("vfx", 3, 3),
  drone: cell("aircraft", 3, 0),
  cloud: { atlas: "fortress", rect: [0, 0.51, 0.51, 0.49] } as AtlasFrame,
  haze: { atlas: "fortress", rect: [0.51, 0.51, 0.49, 0.49] } as AtlasFrame,
};
export type VisualKey = keyof typeof VFX_VISUALS;

/** Each renderer owns its frame views. Assets owns cached shared source textures. */
export async function loadAirCombatAssets() {
  const [aircraft, fortress, vfx, ammo, bigbang, engineFlame, basicAmmo, phantomBeam, healingCross, stage2Enemy, stage2Vfx, magneticStorm, stage2Elite] = await Promise.all([
    Assets.load<Texture>(aircraftUrl), Assets.load<Texture>(fortressUrl), Assets.load<Texture>(vfxUrl), Assets.load<Texture>(ammoUrl), Assets.load<Texture>(bigbangUrl), Assets.load<Texture>(flameUrl), Assets.load<Texture>(basicAmmoUrl),
    Assets.load<Texture>(phantomBeamUrl),
    Assets.load<Texture>(healingCrossUrl),
    Assets.load<Texture>(STAGE2_ART_URLS.enemy), Assets.load<Texture>(STAGE2_ART_URLS.vfx), Assets.load<Texture>(STAGE2_ART_URLS.storm), Assets.load<Texture>(STAGE2_ART_URLS.elite),
  ]);
  const sources = { aircraft, fortress, vfx, ammo, basicAmmo, healingCross, stage2Enemy, stage2Vfx, stage2Elite };
  const frames = new Map<AtlasFrame, Texture>();
  const texture = (definition: AtlasFrame) => {
    const cached = frames.get(definition);
    if (cached) return cached;
    const source = sources[definition.atlas];
    if (!source || source.width < 16 || source.height < 16) throw new Error("Missing Không Kích production atlas");
    const [x, y, w, h] = definition.rect;
    const left = Math.round(x * source.width), top = Math.round(y * source.height);
    const frame = new Rectangle(left, top, Math.round((x + w) * source.width) - left, Math.round((y + h) * source.height) - top);
    const result = new Texture({ source: source.source, frame });
    frames.set(definition, result);
    return result;
  };
  // Resolve every mandatory frame before permitting the V2 renderer to start.
  Object.values(AIRCRAFT_VISUALS).forEach(v => { texture(v.neutral); texture(v.left); texture(v.right); });
  Object.values(ENEMY_VISUALS).forEach(texture);
  Object.values(VFX_VISUALS).forEach(texture);
  Object.values(STAGE2_ENEMY_ART).forEach(texture);
  texture(TEMPEST_WEAKPOINT_ART);
  return { texture, magneticStorm, engineFlame, phantomBeam, effect: (key: VisualKey) => key === "bigbang_missile" ? bigbang : texture(VFX_VISUALS[key]), destroy: () => { frames.forEach(t => t.destroy(false)); frames.clear(); } };
}
export type AirCombatAssets = Awaited<ReturnType<typeof loadAirCombatAssets>>;
