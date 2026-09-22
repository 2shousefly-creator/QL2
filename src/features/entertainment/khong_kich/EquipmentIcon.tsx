import React from "react";
import { EQUIPMENT_ART, equipmentIconIndex } from "./airCombatEquipmentArt";
import { SpriteAtlasIcon } from "./SpriteAtlasIcon";
import type { EquipmentRewardId } from "./airCombatEquipmentState";
export function EquipmentIcon({id,className=""}:{id:EquipmentRewardId;className?:string}) {
  const i=equipmentIconIndex(id);
  return <SpriteAtlasIcon atlas={EQUIPMENT_ART.icons} columns={9} rows={9} column={i%9} row={Math.floor(i/9)} className={`equipment-icon ${className}`}/>;
}
