import React, { useState } from "react";
import { TriangleAlert } from "lucide-react";
import coreAtlas from "../../../assets/khong-kich/v2/core-icons-refined.svg";

/** 128px illustrated cells include their filled 37% semantic badge (4% inset).
 * A single shared atlas serves cards, inventory and release-note entity icons.
 */
export function CoreSemanticIcon({ id, className = "" }: { id: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const row = /^core_\d{3}$/.test(id) ? Number(id.slice(5)) : 0;
  const valid = row >= 1 && row <= 226;
  const index = row - 1;
  return <span aria-hidden="true" className={`combat-ui-icon core-semantic-icon ${className}`} data-core-art={id}>
    {failed || !valid ? <TriangleAlert /> : <img className="core-refined-art" src={coreAtlas} alt="" draggable={false}
      onError={() => setFailed(true)} style={{ width: "1500%", height: "1600%", left: `${-(index % 15) * 100}%`, top: `${-Math.floor(index / 15) * 100}%` }} />}
  </span>;
}
