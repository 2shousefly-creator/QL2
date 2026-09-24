import React from "react";
import { TriangleAlert } from "lucide-react";
import skillAtlas from "../../../assets/khong-kich/v2/skills-refined.svg";
import type { SkillId } from "./airCombatTypes";
import { SpriteAtlasIcon } from "./SpriteAtlasIcon";

// Restored 26.11.1 artwork: nine original cells and the three Astra cells.
export const SKILL_ICON_CELLS: Partial<Record<SkillId, readonly [number, number]>> = {
  decoy: [0, 0], afterburner: [1, 0], missile_swarm: [2, 0],
  armor_shield: [0, 1], heavy_bomb: [1, 1], sweeping_cannon: [2, 1],
  invisibility: [0, 2], focus_laser: [1, 2], escort_drone: [2, 2],
  orbit_reversal: [0, 3], stellar_lance: [1, 3], starfall: [2, 3],
};

export function SkillIcon({ id, className }: { id: SkillId; className?: string }) {
  const paths:Partial<Record<SkillId,React.ReactNode>>={
    predator_lock:<><circle cx="24" cy="24" r="13"/><path d="M24 5v10m0 18v10M5 24h10m18 0h10M21 27l3-12 3 12-3-2z"/></>,
    gravity_anchor:<><ellipse cx="24" cy="24" rx="19" ry="9" transform="rotate(-30 24 24)"/><circle cx="24" cy="24" r="6"/><path d="M24 3v11m0 20v11M18 8l6 6 6-6m-12 32 6-6 6 6"/></>,
    electronic_interference:<><path d="m4 26 6-8 6 16 8-22 8 22 6-16 6 8M8 9a23 23 0 0 1 32 0M8 40a23 23 0 0 0 32 0"/></>,
    twin_reflection:<><path d="m12 9 7 15-7 15-7-15zM36 9l7 15-7 15-7-15zM19 24h10M24 4v10m0 20v10"/><circle cx="24" cy="24" r="3"/></>,
  };
  if(paths[id])return <span className={`combat-ui-icon ${className??""}`} aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke={id==="gravity_anchor"?"#fbbf24":id==="electronic_interference"?"#c4b5fd":id==="twin_reflection"?"#fdba74":"#7dd3fc"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{paths[id]}</svg></span>;
  const cell = SKILL_ICON_CELLS[id];
  if (!cell) return <span className={`combat-ui-icon ${className ?? ""}`} aria-hidden="true"><TriangleAlert /></span>;
  return <SpriteAtlasIcon atlas={skillAtlas} columns={3} rows={4} column={cell[0]} row={cell[1]} className={className} fallback={<TriangleAlert />} />;
}
