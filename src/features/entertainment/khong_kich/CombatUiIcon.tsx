import { EquipmentIcon } from "./EquipmentIcon";
import type { EquipmentRewardId } from "./airCombatEquipmentState";
import { SkillIcon } from "./SkillIcon";
import { CoreSemanticIcon } from "./CoreSemanticIcon";
import React from "react";
import type { CoreId, SkillId } from "./airCombatTypes";

type IconProps = ({ kind: "skill"; id: SkillId } | { kind: "core"; id: CoreId } | { kind: "equipment" | "item"; id: EquipmentRewardId }) & {
  fallback: string;
  className?: string;
};

/** Feature-local hashed assets; no bootstrap preload or runtime CDN. */
export function CombatUiIcon(props: IconProps) {
  if(props.kind === "equipment" || props.kind === "item")return <EquipmentIcon id={props.id} className={props.className}/>;
  if(props.kind === "core") return <CoreSemanticIcon id={props.id} className={props.className}/>;
  return <SkillIcon id={props.id} className={props.className} />;
}
