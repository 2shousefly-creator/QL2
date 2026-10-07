import React from 'react';
import { AIRCRAFT_CONFIGS } from './airCombatConfig';
import { generatedPortrait } from './airCombatGeneratedArt';
export function AircraftGlyph({color,className}:{color:string;accent:string;className?:string}) {
 const aircraft=Object.values(AIRCRAFT_CONFIGS).find(a=>a.color.toLowerCase()===color.toLowerCase())??AIRCRAFT_CONFIGS.black_eagle;
 return <img src={generatedPortrait(aircraft.id)??undefined} alt="" aria-hidden="true" draggable={false} className={className} style={{objectFit:'contain'}} />;
}
