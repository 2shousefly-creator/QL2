import { EquipmentIcon } from "./EquipmentIcon";
import type { EquipmentRewardId } from "./airCombatEquipmentState";
import { ASTRA_ART, ASTRA_SKILL_CELLS } from "./airCombatAstraArt";
import { CoreSemanticIcon } from "./CoreSemanticIcon";
import { Crosshair, Zap, Shield, Rocket, Bomb, Layers, Focus, Radar, Orbit, Flame } from "lucide-react";
import React, { useState } from "react";
import skillAtlas from "../../../assets/khong-kich/v2/skills-refined.svg";
import type { CoreId, SkillId } from "./airCombatTypes";

type IconCell = readonly [column: number, row: number];
export const SKILL_ICON_CELLS: Record<SkillId, IconCell> = {
  orbit_reversal:[0,0],stellar_lance:[1,0],starfall:[2,0],
  decoy: [0, 0], afterburner: [1, 0], missile_swarm: [2, 0],
  armor_shield: [0, 1], heavy_bomb: [1, 1], sweeping_cannon: [2, 1],
  invisibility: [0, 2], focus_laser: [1, 2], escort_drone: [2, 2],
};
type IconProps = ({ kind: "skill"; id: SkillId } | { kind: "core"; id: CoreId } | { kind: "equipment" | "item"; id: EquipmentRewardId }) & {
  fallback: string;
  className?: string;
};

/** Feature-local hashed assets; no bootstrap preload or runtime CDN. */
export function CombatUiIcon(props: IconProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if(props.kind === "equipment" || props.kind === "item")return <EquipmentIcon id={props.id} className={props.className}/>;
  if(props.kind === "core") return <CoreSemanticIcon id={props.id} className={props.className}/>;
  const FallbackIcon=({decoy:Radar,afterburner:Zap,missile_swarm:Rocket,armor_shield:Shield,heavy_bomb:Bomb,sweeping_cannon:Crosshair,invisibility:Layers,focus_laser:Focus,escort_drone:Radar,orbit_reversal:Orbit,stellar_lance:Zap,starfall:Flame})[props.id] ?? Crosshair;
  const astra=props.id in ASTRA_SKILL_CELLS;
  const grid = 3;
  const cell = SKILL_ICON_CELLS[props.id];
  const [column, row] = cell || [0,0];
  return <span aria-hidden="true" className={`combat-ui-icon ${props.className || ""}`}>
    {(!loaded || failed || !cell) && <span className="combat-ui-icon-fallback"><FallbackIcon size="80%" /></span>}
    {!failed && cell && <img src={astra?ASTRA_ART.skills:skillAtlas} alt="" draggable={false}
      onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
      style={{ width: `${grid * 100}%`, height: `${astra?100:grid * 100}%`, left: `${-column * 100}%`, top: `${-row * 100}%`, opacity: loaded ? 1 : 0 }} />}
  </span>;
}
