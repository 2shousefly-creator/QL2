import React from 'react';
import { AIRCRAFT_CONFIGS } from './airCombatConfig';
import { generatedPortrait } from './airCombatGeneratedArt';
import type { AircraftId } from './airCombatTypes';

export function AircraftPreview({aircraftId,className=''}:{aircraftId:AircraftId;className?:string}) {
 return <span className={'relative block overflow-hidden '+className}><img src={generatedPortrait(aircraftId)??undefined} alt={AIRCRAFT_CONFIGS[aircraftId].name} draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain" /></span>;
}
