import React, { useState } from 'react';
import { combatGraphicsQuality, setCombatGraphicsQuality, type CombatGraphicsQuality } from './airCombatGraphics';

export function CombatGraphicsControl() {
  const [quality,setQuality]=useState(combatGraphicsQuality);
  return <label className="mt-4 flex items-center justify-between gap-3 text-xs text-[var(--modal-text)]">
    <span>Đồ họa</span><select aria-label="Chất lượng đồ họa" value={quality} className="rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-white"
      onChange={event=>{const value=event.target.value as CombatGraphicsQuality;setCombatGraphicsQuality(value);setQuality(value);}}>
      <option value="low">Thấp</option><option value="medium">Vừa</option><option value="high">Cao</option>
    </select>
  </label>;
}
