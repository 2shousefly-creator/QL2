import atlas0 from '../../../assets/khong-kich/26.31.2/skills-viper-titan-phantom.png';
import atlas1 from '../../../assets/khong-kich/26.31.2/skills-astra-cinder-riptide.png';
import atlas2 from '../../../assets/khong-kich/26.31.2/skills-argent-sylva-terra.png';
import bomb from '../../../assets/khong-kich/titan/bigbang.png';
import blades from '../../../assets/khong-kich/argent/vfx.png';
import water from '../../../assets/khong-kich/riptide/vfx.png';
import canister from '../../../assets/khong-kich/cinder/projectiles.png';
import acid from '../../../assets/khong-kich/sylva/acid.png';
import seeds from '../../../assets/khong-kich/sylva/life.png';
import type { SkillId } from './airCombatTypes';
import type { AtlasFrame } from './pixi/airCombatPixiTypes';

export const SKILL_RADIANCE_SOURCES={skillRadiance0:atlas0,skillRadiance1:atlas1,skillRadiance2:atlas2};
const groups:readonly (readonly SkillId[])[]=[
 ['decoy','afterburner','predator_lock','missile_swarm','armor_shield','heavy_bomb','gravity_anchor','sweeping_cannon','invisibility','focus_laser','electronic_interference','escort_drone'],
 ['orbit_reversal','stellar_lance','twin_reflection','starfall','cinder_fire_shield','cinder_fuel_barrage','cinder_heat_wave','cinder_inferno_beam','riptide_wellspring','riptide_tidal_blades','riptide_confluence','riptide_waterform'],
 ['argent_guard_stance','argent_blade_cast','argent_blade_recall','argent_heavenly_blade_array','sylva_symbiosis','sylva_acid_burst','sylva_parasitic_seed','sylva_deathbloom','terra_reactive_rock_armor','terra_seismic_cannon','terra_strata_clamp','terra_geocore_overdrive'],
];
// Effect-only raster frames: no caster airframe is baked into any cell.
export const SKILL_VFX_FRAMES=Object.fromEntries(groups.flatMap((skills,group)=>skills.map((id,index)=>[id,
 Array.from({length:4},(_,phase):AtlasFrame=>({atlas:('skillRadiance'+group) as AtlasFrame['atlas'],rect:[((index%2)*4+phase)/8,Math.floor(index/2)/6,1/8,1/6]}))
]))) as Record<SkillId,AtlasFrame[]>;
export const skillVfxFrame=(id:SkillId,phase=1)=>SKILL_VFX_FRAMES[id][phase];

interface CleanSkillArt { url:string; rect:AtlasFrame['rect'] }
/** Retire 26.25.0 skill illustrations from combat, including direct generated()
 * callers. Those illustrations contain full caster airframes. Hawk is a real
 * summoned aircraft; its BODY keeps the rig, while its ignition uses the atlas. */
export const CLEAN_SKILL_ART:Record<string,CleanSkillArt>=Object.fromEntries(
 Object.entries(SKILL_VFX_FRAMES).filter(([id])=>id!=='escort_drone').map(([id,frames])=>{
  const frame=frames[1];
  return [id,{url:SKILL_RADIANCE_SOURCES[frame.atlas as keyof typeof SKILL_RADIANCE_SOURCES],rect:frame.rect}];
 })
);
// Physical falling bomb, not the old illustration of Titan carrying a bomb.
CLEAN_SKILL_ART.heavy_bomb={url:bomb,rect:[.5,0,.5,.5]};
// Reuse inspected, isolated projectile art where an object silhouette matters.
CLEAN_SKILL_ART.argent_blade_cast={url:blades,rect:[.25,0,.25,.2]};
CLEAN_SKILL_ART.argent_blade_recall=CLEAN_SKILL_ART.argent_blade_cast;
CLEAN_SKILL_ART.riptide_tidal_blades={url:water,rect:[.5,0,.5,.5]};
CLEAN_SKILL_ART.cinder_fuel_barrage={url:canister,rect:[0,.5,.25,.5]};
CLEAN_SKILL_ART.sylva_acid_burst={url:acid,rect:[0,1/3,.25,1/3]};
CLEAN_SKILL_ART.sylva_parasitic_seed={url:seeds,rect:[.25,1/3,.25,1/3]};
