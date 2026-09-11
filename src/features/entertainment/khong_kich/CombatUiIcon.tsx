import React, { useState } from "react";
import skillAtlas from "../../../assets/khong-kich/v2/combat-ui-icons-atlas.png";
import coreAtlas from "../../../assets/khong-kich/v2/core-icons-atlas.png";
import type { CoreId, SkillId } from "./airCombatTypes";

type IconCell = readonly [column: number, row: number];
export const SKILL_ICON_CELLS: Record<SkillId, IconCell> = {
  decoy: [0, 0], afterburner: [1, 0], missile_swarm: [2, 0],
  armor_shield: [0, 1], heavy_bomb: [1, 1], sweeping_cannon: [2, 1],
  invisibility: [0, 2], focus_laser: [1, 2], escort_drone: [2, 2],
};
export const CORE_ICON_CELLS: Record<CoreId, IconCell> = {
  firepower: [0, 0], armor: [1, 0], max_hp: [2, 0], fire_rate: [3, 0], repair: [4, 0], cooldown: [5, 0],
  mana_capacity: [0, 1], mana_regen: [1, 1], energy_regen: [2, 1], penetration: [3, 1], explosive_rounds: [4, 1], charged_round: [5, 1],
  dual_cannon: [0, 2], ricochet: [1, 2], annihilator_round: [2, 2], black_eagle_decoy: [3, 2], black_eagle_afterburner: [4, 2], black_eagle_missile: [5, 2],
  breaker_shield: [0, 3], breaker_bomb: [1, 3], breaker_sweep: [2, 3], phantom_invisibility: [3, 3], phantom_laser: [4, 3], phantom_drone: [5, 3],
  critical_chance: [0, 4], critical_damage: [1, 4],
};

type IconProps = ({ kind: "skill"; id: SkillId } | { kind: "core"; id: CoreId }) & {
  fallback: string;
  className?: string;
};

/** Feature-local hashed assets; no bootstrap preload or runtime CDN. */
export function CombatUiIcon(props: IconProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const grid = props.kind === "skill" ? 3 : 6;
  const [column, row] = props.kind === "skill" ? SKILL_ICON_CELLS[props.id] : CORE_ICON_CELLS[props.id];
  return <span aria-hidden="true" className={`combat-ui-icon ${props.className || ""}`}>
    {(!loaded || failed) && <span className="combat-ui-icon-fallback">{props.fallback}</span>}
    {!failed && <img src={props.kind === "skill" ? skillAtlas : coreAtlas} alt="" draggable={false}
      onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
      style={{ width: `${grid * 100}%`, height: `${grid * 100}%`, left: `${-column * 100}%`, top: `${-row * 100}%`, opacity: loaded ? 1 : 0 }} />}
  </span>;
}
