import React from 'react';
import viper from '../../../assets/khong-kich/upgrades/viper.png';
import titan from '../../../assets/khong-kich/upgrades/titan.png';
import phantom from '../../../assets/khong-kich/upgrades/phantom.png';
import astra from '../../../assets/khong-kich/upgrades/astra.png';
import cinder from '../../../assets/khong-kich/upgrades/cinder.png';
import riptide from '../../../assets/khong-kich/upgrades/riptide.png';
import { ARGENT_UPGRADE_ICONS } from './airCombatArgentArt';
import { SYLVA_UPGRADE_ICONS } from './airCombatSylvaArt';
import { TERRA_UPGRADE_ICONS } from './airCombatTerraArt';
import { SkillIcon } from './SkillIcon';
import { SpriteAtlasIcon } from './SpriteAtlasIcon';
import type { SkillId } from './airCombatTypes';

const namedIcons: Partial<Record<SkillId, readonly string[]>> = {
  ...ARGENT_UPGRADE_ICONS, ...SYLVA_UPGRADE_ICONS, ...TERRA_UPGRADE_ICONS,
};
// Four upgrades for each basic skill, then two for the ultimate, in row-major order.
const sheets: readonly { atlas: string; skills: readonly SkillId[] }[] = [
  {atlas:viper,skills:['decoy','afterburner','predator_lock','missile_swarm']},
  {atlas:titan,skills:['armor_shield','heavy_bomb','gravity_anchor','sweeping_cannon']},
  {atlas:phantom,skills:['invisibility','focus_laser','electronic_interference','escort_drone']},
  {atlas:astra,skills:['orbit_reversal','stellar_lance','twin_reflection','starfall']},
  {atlas:cinder,skills:['cinder_fire_shield','cinder_fuel_barrage','cinder_heat_wave','cinder_inferno_beam']},
  {atlas:riptide,skills:['riptide_wellspring','riptide_tidal_blades','riptide_confluence','riptide_waterform']},
];
const cells = new Map(sheets.flatMap(({atlas,skills}) => skills.map((id,index) =>
  [id,{atlas,offset:index*4,maxRank:index===3?3:5}] as const)));

/** Shared by selection and battle tooltips, so every rank uses the same illustration. */
export function SkillUpgradeIcon({skillId,rank,className='air-skill-upgrade-icon'}:{skillId:SkillId;rank:number;className?:string}) {
  const named=namedIcons[skillId]?.[rank-1];
  if(named)return <SkillIcon id={named} className={className}/>;
  const cell=cells.get(skillId);
  if(!cell||rank<2||rank>cell.maxRank)return <SkillIcon id={skillId} className={className}/>;
  const index=cell.offset+rank-2;
  return <SpriteAtlasIcon atlas={cell.atlas} columns={4} rows={4} column={index%4} row={Math.floor(index/4)} className={className} fallback={<SkillIcon id={skillId}/>}/>;
}
