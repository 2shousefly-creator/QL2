import React from "react";
import { TriangleAlert } from "lucide-react";
import coreAtlas from "../../../assets/khong-kich/v2/core-semantic-icons.svg";
import { SpriteAtlasIcon } from "./SpriteAtlasIcon";
import { SkillIcon } from "./SkillIcon";
import { CORE_DEFINITIONS } from "./airCombatCoreCatalog";
import { CORE_VISUAL_SEMANTIC_BY_ID } from "./airCombatCoreVisuals";

type Semantic = typeof CORE_VISUAL_SEMANTIC_BY_ID[keyof typeof CORE_VISUAL_SEMANTIC_BY_ID];
const SEMANTIC_CELLS: Record<Semantic, readonly [number, number]> = {
  growth: [0, 0], firepower: [1, 0], rapid_fire: [2, 0], critical: [3, 0], crit_damage: [4, 0],
  penetration: [0, 1], burst: [1, 1], multi_hit: [2, 1], execute: [3, 1], defense: [4, 1],
  barrier: [0, 2], vitality: [1, 2], sustain: [2, 2], cooldown: [3, 2], resource: [4, 2],
  control: [0, 3], mark: [1, 3], loot: [2, 3], chance: [3, 3], follow_up: [4, 3],
  summon: [0, 4], conversion: [1, 4], selection: [2, 4],
};
const cores = new Map(CORE_DEFINITIONS.map(core => [core.id, core]));

/** Skill binding wins; non-skill art comes exclusively from the locked ID map. */
export function CoreSemanticIcon({ id, className = "" }: { id: string; className?: string }) {
  const core = cores.get(id);
  if (core?.skillId) return <SkillIcon id={core.skillId} className={className} />;
  const semantic = CORE_VISUAL_SEMANTIC_BY_ID[id as keyof typeof CORE_VISUAL_SEMANTIC_BY_ID];
  if (!core || !semantic) return <span className={`combat-ui-icon ${className}`} aria-hidden="true"><TriangleAlert /></span>;
  const [column, row] = SEMANTIC_CELLS[semantic];
  return <SpriteAtlasIcon atlas={coreAtlas} columns={5} rows={5} column={column} row={row} className={`core-semantic-icon ${className}`} fallback={<TriangleAlert />}/>;
}
