import React from "react";
import { TriangleAlert } from "lucide-react";
import coreAtlas from "../../../assets/khong-kich/v2/core-icons-refined.svg";
import { SpriteAtlasIcon } from "./SpriteAtlasIcon";

/** One illustrated hero object per cell; system/tier treatment belongs to the card. */
export function CoreSemanticIcon({ id, className = "" }: { id: string; className?: string }) {
  const number = /^core_\d{3}$/.test(id) ? Number(id.slice(5)) : 0;
  if (number < 1 || number > 226) return <span className={`combat-ui-icon ${className}`} aria-hidden="true"><TriangleAlert /></span>;
  const index = number - 1;
  return <SpriteAtlasIcon atlas={coreAtlas} columns={15} rows={16} column={index%15} row={Math.floor(index/15)} className={`core-semantic-icon ${className}`} fallback={<TriangleAlert />}/>;
}
