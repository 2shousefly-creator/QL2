import React from 'react';

export type FarmTool = 'store' | 'warehouse' | 'plant' | 'pest' | 'water' | 'fertilizer' | 'harvest' | 'clear' | 'herd' | 'feed' | 'egg' | 'dismiss';
/** Original vector pictograms: same footprint as the previous icons, no new controls. */
  const art: Record<FarmTool, React.ReactNode> = {
    store: <><path d="M4 11h16v10H4z" fill="#f6cd82"/><path d="M3 11l3-8h12l3 8z" fill="#64bf65"/><path d="M8 3l-1 8m5-8v8m4-8l1 8" stroke="#fff6cd" strokeWidth="2.6"/><path d="M8 21v-6h4v6m3-6h3v3h-3z" fill="#b97e40"/></>,
    warehouse: <><path d="M3 8l9-5 9 5v12H3z" fill="#edbd75"/><path d="M3 8h18M8 8v12m8-12v12" stroke="#b67d3e"/><path d="M2 8l10-6 10 6" stroke="#65ab55" strokeWidth="3"/><path d="M9 12h6v5H9z" fill="#fff3bd"/></>,
    plant: <><path d="M5 20h14" stroke="#c18846" strokeWidth="4"/><path d="M12 19V8" stroke="#32934a" strokeWidth="2.2"/><path d="M12 13Q2 14 3 5q10-1 9 8" fill="#75d967"/><path d="M12 9q0-8 9-7 1 8-9 7" fill="#a4e779"/></>,
    pest: <><path d="M6 8L3 5m15 3l3-3M5 12H2m17 0h3M6 16l-3 3m15-3l3 3" stroke="#6e9345"/><ellipse cx="12" cy="12" rx="6" ry="8" fill="#a6dd64"/><path d="M9 8h6m-7 4h8m-7 4h6" stroke="#68b64d"/><circle cx="10" cy="6" r="1" fill="#395a37"/><path d="M4 20L20 4" stroke="#ec8254" strokeWidth="2.4"/></>,
    water: <><path d="M9 2Q-2 15 6 20q9 5 10-5Q16 10 9 2z" fill="#65d3ef"/><path d="M19 9q-7 8-2 11 7 3 6-4z" fill="#a2eaf6"/><path d="M6 13q-2 4 2 5" stroke="#efffff" strokeWidth="2"/></>,
    fertilizer: <><path d="M7 3h10l-1 4 4 13H4L8 7z" fill="#ffe0a0"/><path d="M8 7h8" stroke="#b98446" strokeWidth="2"/><path d="M12 17v-7m0 4q-6 0-5-5 5 0 5 5m0-2q0-5 5-5 1 5-5 5" fill="#79c767" stroke="#429452"/></>,
    harvest: <><path d="M3 11h18l-3 10H6z" fill="#edb765"/><path d="M6 11Q7 0 12 3q5-3 6 8" stroke="#af783c" strokeWidth="2"/><circle cx="9" cy="9" r="4" fill="#ff8060"/><circle cx="16" cy="10" r="4" fill="#ffd058"/><path d="M8 5l3-2m5 3l2-3" stroke="#5eb45f" strokeWidth="2"/><path d="M5 15h14m-12 3h10" stroke="#fff0b7"/></>,
    clear: <><path d="M17 2l4 3-3 4-4-3z" fill="#f0c578"/><path d="M16 7L8 17" stroke="#bd8a51" strokeWidth="3"/><path d="M7 13l6 5q-8 8-11 2z" fill="#a4d6d8"/><path d="M5 19l3-3" stroke="#efffff"/></>,
    herd: <><ellipse cx="11" cy="14" rx="8" ry="6" fill="#ffe8ad"/><path d="M5 11L2 5l7 4" fill="#eebd68"/><circle cx="17" cy="8" r="5" fill="#fff1cf"/><path d="M14 4l1-3 2 2 3-2 1 4" fill="#fa8563"/><path d="M21 8l3 2-3 2" fill="#f5b440"/><circle cx="18" cy="7" r="1" fill="#405842"/><path d="M8 19v3m7-3v3" stroke="#c08b43" strokeWidth="2"/></>,
    feed: <><path d="M12 22V3" stroke="#91ac48" strokeWidth="2"/>{[7,12,17].map(y => <g key={y}><ellipse cx="8" cy={y} rx="3.5" ry="2" transform={`rotate(30 8 ${y})`} fill="#ffdb69"/><ellipse cx="16" cy={y-2} rx="3.5" ry="2" transform={`rotate(-30 16 ${y-2})`} fill="#f4bb4c"/></g>)}</>,
    egg: <><path d="M12 2C5 2 1 17 7 21c4 3 12 0 13-5 1-5-4-14-8-14z" fill="#fff1cf"/><path d="M8 9q-3 5-1 7" stroke="#fffdf1" strokeWidth="2.5"/><path d="M5 20q8 5 15-3" stroke="#d5a86a"/></>,
    dismiss: <><path d="M5 3h12v18H5z" fill="#f2cc87"/><path d="M10 8l5 4-5 4m5-4H2" stroke="#d17b47" strokeWidth="2.4"/><path d="M19 5v14" stroke="#8eba64" strokeWidth="2"/></>,
  };
export function FarmToolIcon({ name, mobile, legacy, className = 'h-4 w-4 shrink-0' }: {
  name: FarmTool; mobile: boolean; legacy: React.ReactNode; className?: string;
}) {
  if (!mobile) return <>{legacy}</>;
  return <svg aria-hidden="true" focusable="false" className={`farm-tool-icon ${className}`} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">{art[name]}</svg>;
}
