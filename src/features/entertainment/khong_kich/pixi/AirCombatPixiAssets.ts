import { generatedFrame, generatedFrameId, generatedEffectId } from '../airCombatGeneratedArt';
import { loadGeneratedTextures } from './GeneratedArtTextures';
import type { CombatWorld } from '../airCombatRuntime';
import { TERRA_SOURCES, TERRA_FRAMES } from '../airCombatTerraArt';
import { SYLVA_SOURCES, SYLVA_FRAMES } from '../airCombatSylvaArt';
import { ARGENT_ART, ARGENT_FRAMES, argentPose, argentShake, paintArgent, ARGENT_SPRITE_BUDGET } from '../airCombatArgentArt';
import { RIPTIDE_ART, RIPTIDE_FRAMES } from '../airCombatRiptideArt';
import { BIGBANG_ART, BIGBANG_FRAMES } from '../airCombatBigBangArt';
import { CINDER_ART, CINDER_FRAMES } from '../airCombatCinderArt';
import soloArenaUrl from "../../../../assets/khong-kich/solo/solo-duel-arena.png";
import { STAGE4_ART_URLS, STAGE4_VFX_ART, PARALLAX_BOSS_ART, MIRAGE_HELPER_ART } from "../airCombatStage4Art";
import { STAGE3_ART_URLS, STAGE3_ENEMY_ART, STAGE3_EMISSIVE_ART, STAGE3_VFX_ART, STORMBREAKER_BOSS_ART } from "../airCombatStage3Art";
import { ULTIMATE_ART, ULTIMATE_FRAMES } from "../airCombatUltimateArt";
import { RANKED_ART, RANKED_VFX_FRAMES } from "../airCombatRankArt";
import { EQUIPMENT_ART } from "../airCombatEquipmentArt";
import { ASTRA_ART, ASTRA_VFX_FRAMES } from "../airCombatAstraArt";
import { ENEMY_VISUALS } from "../airCombatEnemyArt";
import { STAGE2_ART_URLS, STAGE2_ENEMY_ART, STAGE2_VFX_ART, TEMPEST_WEAKPOINT_ART } from "../airCombatStage2Art";
import { PLAYER_STANDARD_AIRFRAME_SIZE } from "../airCombatHitboxes";
import { PLAYER_ARTWORK } from "../airCombatArtwork";
import phantomBeamUrl from "../../../../assets/khong-kich/26.25.0/compat/v2-phantom-firing-beam.png";
import basicAmmoUrl from "../../../../assets/khong-kich/26.25.0/compat/v2-player-basic-ammo-atlas.png";
import healingCrossUrl from "../../../../assets/khong-kich/26.25.0/compat/v2-healing-cross.png";
import bigbangUrl from "../../../../assets/khong-kich/26.25.0/compat/v2-bigbang-missile.png";
import flameUrl from "../../../../assets/khong-kich/26.25.0/compat/v2-missile-engine-flame.png";
import ammoUrl from "../../../../assets/khong-kich/26.25.0/compat/v2-hardcore-ammo-atlas.png";
import { AMMO_VISUALS } from "../airCombatAmmo";
import type { AmmoVisualKey } from "../airCombatAmmo";
import { Assets, Rectangle, Texture } from "pixi.js";
import aircraftUrl from "../../../../assets/khong-kich/v2/aircraft-atlas.png";
import fortressUrl from "../../../../assets/khong-kich/v2/fortress-clouds-atlas.png";
import vfxUrl from "../../../../assets/khong-kich/v2/vfx-atlas.png";
import type { AircraftId } from "../airCombatTypes";
import type { AircraftVisualDefinition, AtlasFrame } from "./airCombatPixiTypes";

const cell = (atlas: AtlasFrame["atlas"], x: number, y: number): AtlasFrame => ({ atlas, rect: [x / 4, y / 4, 0.25, 0.25] });
export const AIRCRAFT_VISUALS: Record<AircraftId, AircraftVisualDefinition> = {
  terra:{neutral:TERRA_FRAMES.terra_body,left:TERRA_FRAMES.terra_body,right:TERRA_FRAMES.terra_body,size:PLAYER_STANDARD_AIRFRAME_SIZE,artwork:PLAYER_ARTWORK.terra,tint:0xf4b544},
  sylva:{neutral:SYLVA_FRAMES.sylva_body,left:SYLVA_FRAMES.sylva_body,right:SYLVA_FRAMES.sylva_body,size:PLAYER_STANDARD_AIRFRAME_SIZE,artwork:PLAYER_ARTWORK.sylva,tint:0xbdfb67},
  argent:{neutral:ARGENT_FRAMES.argent_body,left:ARGENT_FRAMES.argent_left,right:ARGENT_FRAMES.argent_right,size:PLAYER_STANDARD_AIRFRAME_SIZE,artwork:PLAYER_ARTWORK.argent,tint:0xe8c878},
  riptide:{neutral:RIPTIDE_FRAMES.riptide_body,left:RIPTIDE_FRAMES.riptide_body,right:RIPTIDE_FRAMES.riptide_body,size:PLAYER_STANDARD_AIRFRAME_SIZE,artwork:PLAYER_ARTWORK.riptide,tint:0x63e3d6},
  cinder:{neutral:{atlas:'cinderAircraft',rect:[0,0,1/3,1]},left:{atlas:'cinderAircraft',rect:[1/3,0,1/3,1]},right:{atlas:'cinderAircraft',rect:[2/3,0,1/3,1]},size:PLAYER_STANDARD_AIRFRAME_SIZE,artwork:PLAYER_ARTWORK.cinder,tint:0xff6418},
  astra:{neutral:{atlas:"astraAircraft",rect:[0,0,1/3,1]},left:{atlas:"astraAircraft",rect:[1/3,0,1/3,1]},right:{atlas:"astraAircraft",rect:[2/3,0,1/3,1]},size:PLAYER_STANDARD_AIRFRAME_SIZE,artwork:PLAYER_ARTWORK.astra,tint:0xffa64d},
  black_eagle: { neutral: cell("aircraft", 0, 0), left: cell("aircraft", 1, 0), right: cell("aircraft", 2, 0), size: PLAYER_STANDARD_AIRFRAME_SIZE, artwork: PLAYER_ARTWORK.black_eagle, tint: 0x67e8f9 },
  breaker: { neutral: cell("aircraft", 0, 1), left: cell("aircraft", 1, 1), right: cell("aircraft", 2, 1), size: PLAYER_STANDARD_AIRFRAME_SIZE, artwork: PLAYER_ARTWORK.breaker, tint: 0xfbbf24 },
  phantom: { neutral: cell("aircraft", 0, 2), left: cell("aircraft", 1, 2), right: cell("aircraft", 2, 2), size: PLAYER_STANDARD_AIRFRAME_SIZE, artwork: PLAYER_ARTWORK.phantom, tint: 0xc4b5fd },
};
for (const [id, visual] of Object.entries(AIRCRAFT_VISUALS)) { visual.neutral=generatedFrame(id);visual.left=visual.neutral;visual.right=visual.neutral; }
export { ENEMY_VISUALS } from "../airCombatEnemyArt";
const ammoFrames = Object.fromEntries(Object.entries(AMMO_VISUALS).map(([key,v]) => [key,key.endsWith("_basic_ammo")?{atlas:"basicAmmo",rect:[v.cell[0]/3,0,1/3,1/2]}:cell("ammo",v.cell[0],v.cell[1])])) as Record<AmmoVisualKey,AtlasFrame>;
export const VFX_VISUALS = {
  ...ULTIMATE_FRAMES,
  ...RANKED_VFX_FRAMES,
  ...ASTRA_VFX_FRAMES,
  ...STAGE2_VFX_ART,
  ...STAGE3_VFX_ART,
  healingCross: { atlas: "healingCross", rect: [0, 0, 1, 1] } as AtlasFrame,
  ...ammoFrames,
  ...BIGBANG_FRAMES,
  ...CINDER_FRAMES,
  ...RIPTIDE_FRAMES,
  ...ARGENT_FRAMES,
  ...TERRA_FRAMES,
  ...SYLVA_FRAMES,
  astra_basic_ammo:{atlas:"astraEffects",rect:[0,0,1/3,1]} as AtlasFrame,
  astra_lance:{atlas:"astraEffects",rect:[1/3,0,1/3,1]} as AtlasFrame,
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
export async function loadAirCombatAssets(world?:CombatWorld) {
  const generated = await loadGeneratedTextures(world);
  const [aircraft, fortress, vfx, ammo, bigbang, engineFlame, basicAmmo, phantomBeam, healingCross, stage2Enemy, stage2Vfx, magneticStorm, stage2Elite] = await Promise.all([
    Assets.load<Texture>(aircraftUrl), Assets.load<Texture>(fortressUrl), Assets.load<Texture>(vfxUrl), Assets.load<Texture>(ammoUrl), Assets.load<Texture>(bigbangUrl), Assets.load<Texture>(flameUrl), Assets.load<Texture>(basicAmmoUrl),
    Assets.load<Texture>(phantomBeamUrl),
    Assets.load<Texture>(healingCrossUrl),
    Assets.load<Texture>(STAGE2_ART_URLS.enemy), Assets.load<Texture>(STAGE2_ART_URLS.vfx), Assets.load<Texture>(STAGE2_ART_URLS.storm), Assets.load<Texture>(STAGE2_ART_URLS.elite),
  ]);
  const [astraAircraft,astraEffects,astraVfx]=await Promise.all([Assets.load<Texture>(ASTRA_ART.aircraft),Assets.load<Texture>(ASTRA_ART.effects),Assets.load<Texture>(ASTRA_ART.combatVfx)]);
  const [equipmentIcons,equipmentVfx]=await Promise.all([Assets.load<Texture>(EQUIPMENT_ART.icons),Assets.load<Texture>(EQUIPMENT_ART.vfx)]);
  const [rankedVfx,rankedProjectiles]=await Promise.all([Assets.load<Texture>(RANKED_ART.vfx),Assets.load<Texture>(RANKED_ART.projectiles)]);
  const soloArena=await Assets.load<Texture>(soloArenaUrl);
  const ultimateVfx=await Assets.load<Texture>(ULTIMATE_ART);
  const [stage3Enemy,stage3Boss,stage3Vfx,stormbreakerSky,stage3Emissive] = await Promise.all([Assets.load<Texture>(STAGE3_ART_URLS.enemy),Assets.load<Texture>(STAGE3_ART_URLS.boss),Assets.load<Texture>(STAGE3_ART_URLS.vfx),Assets.load<Texture>(STAGE3_ART_URLS.sky),Assets.load<Texture>(STAGE3_ART_URLS.emissive)]);
  const [stage4Enemy,stage4Boss,stage4Vfx,mirageSky] = await Promise.all([Assets.load<Texture>(STAGE4_ART_URLS.enemy),Assets.load<Texture>(STAGE4_ART_URLS.boss),Assets.load<Texture>(STAGE4_ART_URLS.vfx),Assets.load<Texture>(STAGE4_ART_URLS.sky)]);
  const [cinderAircraft,cinderVfx,cinderProjectiles,cinderIcons,cinderFeedback]=await Promise.all([CINDER_ART.aircraft,CINDER_ART.vfx,CINDER_ART.projectiles,CINDER_ART.icons,CINDER_ART.feedback].map(url=>Assets.load<Texture>(url)));
  const bigBangVfx=await Assets.load<Texture>(BIGBANG_ART);
  const guardianVfx=await Assets.load<Texture>(CINDER_ART.guardianVfx);
  const [riptideAircraft,riptideIcons,riptideVfx]=await Promise.all([RIPTIDE_ART.aircraft,RIPTIDE_ART.icons,RIPTIDE_ART.vfx].map(url=>Assets.load<Texture>(url)));
  const [argentAircraft,argentIcons,argentVfx,argentPortrait]=await Promise.all([ARGENT_ART.aircraft,ARGENT_ART.icons,ARGENT_ART.vfx,ARGENT_ART.portrait].map(url=>Assets.load<Texture>(url)));
  const [sylvaAircraft,sylvaPortrait,sylvaIcons,sylvaAcid,sylvaLife,sylvaDeath,sylvaDeathNew]=await Promise.all(Object.values(SYLVA_SOURCES).map(url=>Assets.load<Texture>(url)));
  const terraSources=Object.fromEntries(await Promise.all(Object.entries(TERRA_SOURCES).map(async([key,url])=>[key,await Assets.load<Texture>(url)])));
  const sources = {...terraSources,sylvaAircraft,sylvaPortrait,sylvaIcons,sylvaAcid,sylvaLife,sylvaDeath,sylvaDeathNew,argentAircraft,argentIcons,argentVfx,argentPortrait, riptideAircraft,riptideIcons,riptideVfx, guardianVfx,bigBangVfx,cinderFeedback,cinderAircraft,cinderVfx,cinderProjectiles,cinderIcons, stage4Enemy,stage4Boss,stage4Vfx, stage3Enemy,stage3Boss,stage3Vfx,stage3Emissive, ultimateVfx,rankedVfx,rankedProjectiles, equipmentIcons,equipmentVfx,astraVfx,astraAircraft,astraEffects,aircraft, fortress, vfx, ammo, basicAmmo, healingCross, stage2Enemy, stage2Vfx, stage2Elite };
  const frames = new Map<AtlasFrame, Texture>();
  const texture = (definition: AtlasFrame) => {
    const id=generatedFrameId(definition),replacement=id&&generated.texture(id);
    if(replacement)return replacement;
    const cached = frames.get(definition);
    if (cached) return cached;
    const source = sources[definition.atlas as keyof typeof sources];
    if (!source || source.width < 16 || source.height < 16) throw new Error("Missing Không Kích production atlas");
    const [x, y, w, h] = definition.rect;
    const left = Math.round(x * source.width), top = Math.round(y * source.height);
    const frame = new Rectangle(left, top, Math.round((x + w) * source.width) - left, Math.round((y + h) * source.height) - top);
    const result = new Texture({ source: source.source, frame });
    frames.set(definition, result);
    return result;
  };
  return { texture, soloArena, mirageSky, magneticStorm, stormbreakerSky, engineFlame:generated.texture('shared_flame')??engineFlame, phantomBeam:generated.texture('focus_laser')??phantomBeam, generated:(id:string)=>generated.texture(id), effect: (key: VisualKey) => generated.texture(generatedEffectId(key)) ?? (key === "bigbang_missile" ? bigbang : texture(VFX_VISUALS[key])), destroy: () => { frames.forEach(t => t.destroy(false)); frames.clear(); generated.destroy(); } };
}
export type AirCombatAssets = Awaited<ReturnType<typeof loadAirCombatAssets>>;
