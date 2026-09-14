import React, { useState } from "react";
import skillAtlas from "../../../assets/khong-kich/v2/combat-ui-icons-atlas.png";
import coreAtlas from "../../../assets/khong-kich/v2/core-icons-atlas.png";
import type { CoreId, SkillId } from "./airCombatTypes";
import { CORE_DEFINITIONS } from "./airCombatCoreCatalog";

type IconCell = readonly [column: number, row: number];
export const SKILL_ICON_CELLS: Record<SkillId, IconCell> = {
  decoy: [0, 0], afterburner: [1, 0], missile_swarm: [2, 0],
  armor_shield: [0, 1], heavy_bomb: [1, 1], sweeping_cannon: [2, 1],
  invisibility: [0, 2], focus_laser: [1, 2], escort_drone: [2, 2],
};
const SKILL_CORE_CELLS: Record<SkillId, IconCell> = {
  decoy:[3,2],afterburner:[4,2],missile_swarm:[5,2],armor_shield:[0,3],heavy_bomb:[1,3],
  sweeping_cannon:[2,3],invisibility:[3,3],focus_laser:[4,3],escort_drone:[5,3],
};
// Reuse the shipped atlas by effect family; no new raster dependencies.
export const CORE_ICON_CELLS: Partial<Record<CoreId, IconCell>> = Object.fromEntries(CORE_DEFINITIONS.map(core=>{
  const row=Number(core.id.slice(5));
  const cell:IconCell=core.skillId?SKILL_CORE_CELLS[core.skillId]:row<=18?[(row-1)%6,0]:
    core.system.toLocaleLowerCase("vi").includes("chí mạng")?[0,4]:
    core.category==="defense"?[1,0]:core.category==="resource"?[1,1]:core.category==="weapon"?[3,1]:[0,0];
  return [core.id,cell];
}));

type IconProps = ({ kind: "skill"; id: SkillId } | { kind: "core"; id: CoreId }) & {
  fallback: string;
  className?: string;
};

/** Feature-local hashed assets; no bootstrap preload or runtime CDN. */
export function CombatUiIcon(props: IconProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const grid = props.kind === "skill" ? 3 : 6;
  const cell = props.kind === "skill" ? SKILL_ICON_CELLS[props.id] : CORE_ICON_CELLS[props.id];
  const [column, row] = cell || [0,0];
  return <span aria-hidden="true" className={`combat-ui-icon ${props.className || ""}`}>
    {(!loaded || failed || !cell) && <span className="combat-ui-icon-fallback">{props.fallback}</span>}
    {!failed && cell && <img src={props.kind === "skill" ? skillAtlas : coreAtlas} alt="" draggable={false}
      onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
      style={{ width: `${grid * 100}%`, height: `${grid * 100}%`, left: `${-column * 100}%`, top: `${-row * 100}%`, opacity: loaded ? 1 : 0 }} />}
  </span>;
}
