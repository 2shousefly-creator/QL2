import React, { useLayoutEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CoreCard } from "./airCombatTypes";
import { CombatUiIcon } from "./CombatUiIcon";
import { CoreSystemTag } from "./CoreSystemTag";
import { CoreDescription } from "./CoreDescription";

/** A detail layer of the existing mandatory transaction, never another dialog owner. */
export function AirCombatCoreDetail({ card, slot, reducedMotion: requestedReducedMotion, canReroll, onClose, onSelect, onReroll }: {
  card: CoreCard; slot: number; reducedMotion: boolean; canReroll: boolean;
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
        <AnimatePresence mode="wait" initial={false}>
          <motion.article key={card.id} className="air-core-detail-card" data-core-tier={card.tier}
            initial={{ opacity: 0, x: reducedMotion ? 0 : 18, filter: reducedMotion ? "none" : "blur(2px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: reducedMotion ? 0 : -14, filter: reducedMotion ? "none" : "blur(2px)" }}
            transition={{ duration: reducedMotion ? .1 : .13 }}>
            <CombatUiIcon kind="core" id={card.id} fallback={card.icon} className="combat-core-icon" />
            <h3 id="air-core-detail-title">{card.name}</h3>
            <CoreSystemTag system={card.system} tier={card.tier} />
            <div className="air-core-detail-description"><CoreDescription text={card.description} statLines /></div>
          </motion.article>
        </AnimatePresence>
      </div>
      <div className="air-core-detail-actions">
        <button ref={select} type="button" className="air-core-pick" onClick={onSelect}>CHỌN</button>
        <button type="button" className="air-core-reroll" disabled={!canReroll} onClick={onReroll}>ĐỔI LẠI</button>
      </div>
    </motion.div>
  </motion.div>;
}
