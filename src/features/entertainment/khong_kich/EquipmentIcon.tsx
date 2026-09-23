import React from "react";
import { EQUIPMENT_ART, equipmentIconIndex } from "./airCombatEquipmentArt";
import { SpriteAtlasIcon } from "./SpriteAtlasIcon";
import type { EquipmentRewardId } from "./airCombatEquipmentState";
export function EquipmentIcon({id,className="",inventory=false}:{id:EquipmentRewardId;className?:string;inventory?:boolean}) {
  const i=equipmentIconIndex(id);
  // Keep context sizing on the wrapper; the atlas always paints one complete cell.
  // Explicit context also follows drag/craft representations through body portals.
  return <span aria-hidden="true" className={`combat-ui-icon equipment-icon ${inventory && id !== "VP01" ? "equipment-icon-inventory" : ""} ${className}`}>
    <SpriteAtlasIcon atlas={EQUIPMENT_ART.icons} columns={9} rows={9} column={i%9} row={Math.floor(i/9)} className="equipment-icon-art"/>
  </span>;
}
