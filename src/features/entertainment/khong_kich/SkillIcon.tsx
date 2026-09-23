import React from "react";
import { TriangleAlert } from "lucide-react";
import skillAtlas from "../../../assets/khong-kich/v2/skills-refined.svg";
import type { SkillId } from "./airCombatTypes";
import { SpriteAtlasIcon } from "./SpriteAtlasIcon";

// Restored 26.11.1 artwork: nine original cells and the three Astra cells.
export const SKILL_ICON_CELLS: Record<SkillId, readonly [number, number]> = {
  decoy: [0, 0], afterburner: [1, 0], missile_swarm: [2, 0],
  armor_shield: [0, 1], heavy_bomb: [1, 1], sweeping_cannon: [2, 1],
  invisibility: [0, 2], focus_laser: [1, 2], escort_drone: [2, 2],
  orbit_reversal: [0, 3], stellar_lance: [1, 3], starfall: [2, 3],
};

export function SkillIcon({ id, className }: { id: SkillId; className?: string }) {
  const cell = SKILL_ICON_CELLS[id];
  if (!cell) return <span className={`combat-ui-icon ${className ?? ""}`} aria-hidden="true"><TriangleAlert /></span>;
  return <SpriteAtlasIcon atlas={skillAtlas} columns={3} rows={4} column={cell[0]} row={cell[1]} className={className} fallback={<TriangleAlert />} />;
}
