import React, { useLayoutEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CoreCard } from "./airCombatTypes";
import { AirCombatCoreTransition, type CorePresentation } from "./AirCombatCoreTransition";

/** A detail layer of the existing mandatory transaction, never another dialog owner. */
export function AirCombatCoreDetail({ card, previous, busy, bonus, slot, reducedMotion: requestedReducedMotion, canReroll, onClose, onSelect, onReroll, presentation, hideReroll=false }: {
  card: CoreCard; slot: number; reducedMotion: boolean; canReroll: boolean;
  previous?: CoreCard; busy: boolean; bonus: boolean;
  presentation?: CorePresentation; hideReroll?:boolean;
  onClose(): void; onSelect(): void; onReroll(): void;
}) {
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = requestedReducedMotion || !!systemReducedMotion;
  const panel = useRef<HTMLDivElement>(null);
  const select = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    select.current?.focus({ preventScroll: true });
    // A reroll replaces the original button; restore its current slot successor.
    return () => { document.querySelector<HTMLButtonElement>(`[data-core-slot="${slot}"]`)?.focus({ preventScroll: true }); };
  }, [slot]);
  return <motion.div className="air-core-detail-backdrop" data-reduced-motion={reducedMotion}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .16 }}
    onPointerDown={e => e.stopPropagation()} onPointerMove={e => e.stopPropagation()}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    onKeyDown={e => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); }
      if (e.key === "Tab") {
        e.preventDefault(); e.stopPropagation();
        const buttons = Array.from(panel.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        buttons[(index + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
      }
    }}>
    <motion.div ref={panel} className="air-core-detail" data-core-tier={card.tier}
      initial={{ opacity: 0, scale: reducedMotion ? 1 : .9, y: reducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: reducedMotion ? 1 : .96, transition: { duration: .14 } }}
      transition={reducedMotion ? { duration: .12 } : { type: "spring", duration: .28, bounce: .16 }}>
      <button className="air-core-detail-close" type="button" aria-label="Trở lại danh sách Lõi" onClick={onClose}>×</button>
      <div className="air-core-detail-scroll">
        <AirCombatCoreTransition card={card} previous={previous} detail presentation={presentation}/>
      </div>
      <div className="air-core-detail-actions" style={hideReroll?{gridTemplateColumns:'1fr'}:undefined}>
        <button ref={select} type="button" className="air-core-pick" disabled={busy} onClick={onSelect}>CHỌN</button>
        {!hideReroll&&<button type="button" className="air-core-reroll" data-bonus={bonus} disabled={busy||!canReroll} onClick={onReroll}>ĐỔI LẠI</button>}
      </div>
    </motion.div>
  </motion.div>;
}
