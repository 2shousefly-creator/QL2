import { CoreSemanticIcon } from "./CoreSemanticIcon";
import React, { useState } from "react";
import skillAtlas from "../../../assets/khong-kich/v2/combat-ui-icons-atlas.png";
import type { CoreId, SkillId } from "./airCombatTypes";

type IconCell = readonly [column: number, row: number];
export const SKILL_ICON_CELLS: Record<SkillId, IconCell> = {
  decoy: [0, 0], afterburner: [1, 0], missile_swarm: [2, 0],
  armor_shield: [0, 1], heavy_bomb: [1, 1], sweeping_cannon: [2, 1],
  invisibility: [0, 2], focus_laser: [1, 2], escort_drone: [2, 2],
};
type IconProps = ({ kind: "skill"; id: SkillId } | { kind: "core"; id: CoreId }) & {
  fallback: string;
  className?: string;
};

/** Feature-local hashed assets; no bootstrap preload or runtime CDN. */
export function CombatUiIcon(props: IconProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if(props.kind === "core") return <CoreSemanticIcon id={props.id} className={props.className}/>;
  const grid = 3;
  const cell = SKILL_ICON_CELLS[props.id];
  const [column, row] = cell || [0,0];
  return <span aria-hidden="true" className={`combat-ui-icon ${props.className || ""}`}>
    {(!loaded || failed || !cell) && <span className="combat-ui-icon-fallback">{props.fallback}</span>}
    {!failed && cell && <img src={skillAtlas} alt="" draggable={false}
      onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
      style={{ width: `${grid * 100}%`, height: `${grid * 100}%`, left: `${-column * 100}%`, top: `${-row * 100}%`, opacity: loaded ? 1 : 0 }} />}
  </span>;
}
