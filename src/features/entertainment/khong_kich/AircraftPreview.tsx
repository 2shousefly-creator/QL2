import { ASTRA_ART } from "./airCombatAstraArt";
import React, { useState } from "react";
import aircraftUrl from "../../../assets/khong-kich/v2/aircraft-atlas.png";
import { AIRCRAFT_CONFIGS } from "./airCombatConfig";
import { AircraftGlyph } from "./AircraftGlyph";
import type { AircraftId } from "./airCombatTypes";

export function AircraftPreview({ aircraftId, className = "" }: { aircraftId: AircraftId; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const config = AIRCRAFT_CONFIGS[aircraftId];
  const row = aircraftId === "black_eagle" ? 0 : aircraftId === "breaker" ? 1 : 2;
  return <span className={`relative block overflow-hidden ${className}`}>
    {(!loaded || failed) && <AircraftGlyph color={config.color} accent={config.accent} className="absolute inset-0 h-full w-full" />}
    {!failed && <img src={aircraftId==="astra"?ASTRA_ART.aircraft:aircraftUrl} alt={`Chiến cơ ${config.name}`} draggable={false}
      onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
      className="pointer-events-none absolute max-w-none"
      style={{ width: aircraftId==="astra"?"300%":"400%", height: aircraftId==="astra"?"100%":"400%", left: 0, top: aircraftId==="astra"?0:`${-row * 100}%`, opacity: loaded ? 1 : 0 }} />}
  </span>;
}
