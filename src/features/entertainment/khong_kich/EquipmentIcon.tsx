import React from "react";
import { EQUIPMENT_ART, equipmentIconIndex } from "./airCombatEquipmentArt";
import type { EquipmentRewardId } from "./airCombatEquipmentState";
export function EquipmentIcon({id,className=""}:{id:EquipmentRewardId;className?:string}) {
  const i=equipmentIconIndex(id);
  return <span className={`combat-ui-icon equipment-icon ${className}`} aria-hidden="true"><img src={EQUIPMENT_ART.icons} alt="" draggable={false} style={{width:"900%",height:"900%",left:`${-i%9*100}%`,top:`${-Math.floor(i/9)*100}%`}}/></span>;
}
