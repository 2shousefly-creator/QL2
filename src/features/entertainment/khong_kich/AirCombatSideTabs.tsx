import React from "react";
import { AircraftPreview } from './AircraftPreview';
import { AIRCRAFT_CONFIGS } from './airCombatConfig';
import type { AircraftId } from './airCombatTypes';

export type CombatInspectionSide = "player" | "ai" | "ally1" | "ally2";
export interface CombatInspectionTab { side:CombatInspectionSide; label:string; aircraftId?:AircraftId }
const SOLO_TABS:readonly CombatInspectionTab[]=[{side:"player",label:"Người Chơi"},{side:"ai",label:"AI"}];
export function AirCombatSideTabs({ value, onChange, panelId, tabs = SOLO_TABS }: {
  value: CombatInspectionSide; onChange: (side: CombatInspectionSide) => void; panelId: string; tabs?:readonly CombatInspectionTab[];
}) {
  return <div className="air-combat-side-tabs" role="tablist" aria-label="Chiến cơ đang xem">
    {tabs.map(({side,label,aircraftId},index) => <button key={side} type="button" role="tab"
      id={panelId + "-" + side} aria-controls={panelId} aria-selected={value === side} tabIndex={value === side ? 0 : -1}
      onClick={() => onChange(side)} onKeyDown={event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = tabs[event.key === "Home" ? 0 : event.key === "End" ? tabs.length-1 : (index+(event.key === "ArrowRight" ? 1 : tabs.length-1))%tabs.length].side;
        onChange(next);
        requestAnimationFrame(() => document.getElementById(panelId + "-" + next)?.focus());
      }}>{aircraftId&&<AircraftPreview aircraftId={aircraftId} className="air-inspection-tab-portrait"/>}<span>{label}{aircraftId&&<small>{AIRCRAFT_CONFIGS[aircraftId].code}</small>}</span></button>)}
  </div>;
}
