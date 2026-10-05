import { ARGENT_ART } from './airCombatArgentArt';
import { RIPTIDE_ART } from './airCombatRiptideArt';
import { CINDER_ART } from './airCombatCinderArt';
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
  if(aircraftId==='argent')return <span className={'relative block overflow-hidden '+className}><img src={className.includes('portrait')?ARGENT_ART.portrait:ARGENT_ART.aircraft} alt="Argent — Ngân Dực" draggable={false} className="pointer-events-none absolute max-w-none" style={{width:className.includes('portrait')?'100%':'500%',height:'100%',left:0,top:0}}/></span>;
  return <span className={`relative block overflow-hidden ${className}`}>
    {aircraftId!=="riptide" && aircraftId!=="cinder" && (!loaded || failed) && <AircraftGlyph color={config.color} accent={config.accent} className="absolute inset-0 h-full w-full" />}
    {!failed && <img src={aircraftId==="riptide"?RIPTIDE_ART.aircraft:aircraftId==="cinder"?CINDER_ART.aircraft:aircraftId==="astra"?ASTRA_ART.aircraft:aircraftUrl} alt={`Chiến cơ ${config.name}`} draggable={false}
      onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
      className="pointer-events-none absolute max-w-none"
      style={{ width: aircraftId==="riptide"?"100%":(aircraftId==="astra"||aircraftId==="cinder")?"300%":"400%", height: aircraftId==="riptide"?"100%":(aircraftId==="astra"||aircraftId==="cinder")?"100%":"400%", left: 0, top: aircraftId==="riptide"?0:(aircraftId==="astra"||aircraftId==="cinder")?0:`${-row * 100}%`, opacity: loaded ? 1 : 0 }} />}
  </span>;
}
