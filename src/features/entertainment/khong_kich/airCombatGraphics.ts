export type CombatGraphicsQuality='low'|'medium'|'high';
const KEY='ql2.airCombat.graphics.26.25';
let quality:CombatGraphicsQuality='medium';
try { const value=localStorage.getItem(KEY);if(value==='low'||value==='high')quality=value; } catch { /* Storage may be unavailable. */ }
export const combatGraphicsQuality=()=>quality;
export function setCombatGraphicsQuality(value:CombatGraphicsQuality) {
  quality=value;try{localStorage.setItem(KEY,value);}catch { /* Visual preference only. */ }
}
