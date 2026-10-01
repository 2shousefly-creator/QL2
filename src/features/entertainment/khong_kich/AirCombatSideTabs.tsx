import React from "react";

export type CombatInspectionSide = "player" | "ai";
export function AirCombatSideTabs({ value, onChange, panelId }: {
  value: CombatInspectionSide; onChange: (side: CombatInspectionSide) => void; panelId: string;
}) {
  return <div className="air-combat-side-tabs" role="tablist" aria-label="Chiến cơ đang xem">
    {(["player", "ai"] as const).map(side => <button key={side} type="button" role="tab"
      id={panelId + "-" + side} aria-controls={panelId} aria-selected={value === side} tabIndex={value === side ? 0 : -1}
      onClick={() => onChange(side)} onKeyDown={event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? "player" : event.key === "End" ? "ai" : side === "player" ? "ai" : "player";
        onChange(next);
        requestAnimationFrame(() => document.getElementById(panelId + "-" + next)?.focus());
      }}>{side === "player" ? "Người Chơi" : "AI"}</button>)}
  </div>;
}
