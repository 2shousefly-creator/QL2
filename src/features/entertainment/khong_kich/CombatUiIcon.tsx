import { EquipmentIcon } from "./EquipmentIcon";
import type { EquipmentRewardId } from "./airCombatEquipmentState";
import { SpriteAtlasIcon } from "./SpriteAtlasIcon";
import { CoreSemanticIcon } from "./CoreSemanticIcon";
import { Crosshair, Zap, Shield, Rocket, Bomb, Layers, Focus, Radar, Orbit, Flame } from "lucide-react";
import React from "react";
import skillAtlas from "../../../assets/khong-kich/v2/skills-refined.svg";
import type { CoreId, SkillId } from "./airCombatTypes";

type IconCell = readonly [column: number, row: number];
export const SKILL_ICON_CELLS: Record<SkillId, IconCell> = {
  orbit_reversal:[0,3],stellar_lance:[1,3],starfall:[2,3],
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
  if(props.kind === "equipment" || props.kind === "item")return <EquipmentIcon id={props.id} className={props.className}/>;
  if(props.kind === "core") return <CoreSemanticIcon id={props.id} className={props.className}/>;
  const FallbackIcon=({decoy:Radar,afterburner:Zap,missile_swarm:Rocket,armor_shield:Shield,heavy_bomb:Bomb,sweeping_cannon:Crosshair,invisibility:Layers,focus_laser:Focus,escort_drone:Radar,orbit_reversal:Orbit,stellar_lance:Zap,starfall:Flame})[props.id] ?? Crosshair;
  const [column, row] = SKILL_ICON_CELLS[props.id];
  return <SpriteAtlasIcon atlas={skillAtlas} columns={3} rows={4} column={column} row={row} className={props.className} fallback={<FallbackIcon size="80%" />}/>;
}
