import { TERRA_ART, TERRA_ICON_CELLS } from './airCombatTerraArt';
import { SYLVA_ART, SYLVA_ICON_CELLS } from './airCombatSylvaArt';
import { ARGENT_ART, ARGENT_ICON_CELLS } from './airCombatArgentArt';
import { RIPTIDE_ART, RIPTIDE_ICON_CELLS } from './airCombatRiptideArt';
import type { PassiveId } from './airCombatTypes';
import React from "react";
import myriad from "../../../assets/khong-kich/argent/myriad-26-22-2.png";
import arrayReturn from "../../../assets/khong-kich/argent/array-return-26-22-2.png";
import { TriangleAlert } from "lucide-react";
import skillAtlas from "../../../assets/khong-kich/v2/aircraft-skills-lowpoly.png";
import type { SkillId } from "./airCombatTypes";
import { SpriteAtlasIcon } from "./SpriteAtlasIcon";

// Explicit IDs keep HUD, Core cards, selection and tooltips on the same artwork.
export const SKILL_ICON_CELLS: Record<SkillId | PassiveId, readonly [number, number]> = {
  terra_geopressure_core:[0,0],terra_reactive_rock_armor:[1,0],terra_seismic_cannon:[1,1],terra_strata_clamp:[1,2],terra_geocore_overdrive:[1,3],
  sylva_acid_rounds:[0,0],sylva_symbiosis:[1,0],sylva_acid_burst:[2,0],sylva_parasitic_seed:[3,0],sylva_deathbloom:[4,0],
  ...RIPTIDE_ICON_CELLS,
  ...ARGENT_ICON_CELLS,
  viper_follow_up:[0,0], decoy:[1,0], afterburner:[2,0], predator_lock:[3,0], missile_swarm:[4,0],
  titan_alloy_rounds:[0,1], armor_shield:[1,1], heavy_bomb:[2,1], gravity_anchor:[3,1], sweeping_cannon:[4,1],
  phantom_backup_battery:[0,2], invisibility:[1,2], focus_laser:[2,2], electronic_interference:[3,2], escort_drone:[4,2],
  astra_stellar_mark:[0,3], orbit_reversal:[1,3], stellar_lance:[2,3], twin_reflection:[3,3], starfall:[4,3],
  cinder_thermal_round:[0,4], cinder_fire_shield:[1,4], cinder_fuel_barrage:[2,4], cinder_heat_wave:[3,4], cinder_inferno_beam:[4,4],
};

export function SkillIcon({ id, className }: { id: string; className?: string }) {
  if(id === "argent_myriad" || id === "argent_array_return") return <SpriteAtlasIcon atlas={id === "argent_myriad" ? myriad : arrayReturn} columns={1} rows={1} column={0} row={0} className={className} fallback={<TriangleAlert/>}/>;
  const terra=TERRA_ICON_CELLS[id];
  if(terra)return <SpriteAtlasIcon atlas={TERRA_ART.icons} columns={5} rows={4} column={terra[0]} row={terra[1]} className={className} fallback={<TriangleAlert/>}/>;
  const sylva=SYLVA_ICON_CELLS[id];
  if(sylva)return <SpriteAtlasIcon atlas={SYLVA_ART.icons} columns={5} rows={4} column={sylva[0]} row={sylva[1]} className={className} fallback={<TriangleAlert/>}/>;
  const argent=ARGENT_ICON_CELLS[id as keyof typeof ARGENT_ICON_CELLS];
  if(argent)return <SpriteAtlasIcon atlas={ARGENT_ART.icons} columns={5} rows={4} column={argent[0]} row={argent[1]} className={className} fallback={<TriangleAlert/>}/>;
  const riptide=RIPTIDE_ICON_CELLS[id as keyof typeof RIPTIDE_ICON_CELLS];
  if(riptide)return <SpriteAtlasIcon atlas={RIPTIDE_ART.icons} columns={3} rows={2} column={riptide[0]} row={riptide[1]} className={className} fallback={<TriangleAlert />} />;
  const cell = SKILL_ICON_CELLS[id as SkillId | PassiveId];
  if (!cell) return <span className={`combat-ui-icon ${className ?? ""}`} aria-hidden="true"><TriangleAlert /></span>;
  return <SpriteAtlasIcon atlas={skillAtlas} columns={5} rows={5} column={cell[0]} row={cell[1]} className={className} fallback={<TriangleAlert />} />;
}
