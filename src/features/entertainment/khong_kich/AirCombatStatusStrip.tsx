import { AnimatePresence, motion } from "motion/react";
import { airTooltipMotion } from "./AirCombatMotion";
import React, { forwardRef, useEffect, useLayoutEffect, useImperativeHandle, useRef, useState } from "react";
import { Flame, FlaskConical, Shield, ShieldMinus, Zap, Lock, BatteryWarning, HeartOff, Crosshair, Radar } from "lucide-react";
import { CombatStatIconTemplates, updateCombatRichText } from "./CoreDescription";
import { CombatUiIcon } from "./CombatUiIcon";
import { getStatusPresentations, type StatusPresentation } from "./airCombatPresentation";
import type { CombatWorld } from "./airCombatRuntime";

export interface StatusStripHandle { update(world: CombatWorld): void; close(): void }
const genericIcons = { burn: Flame, acid: FlaskConical, armor: ShieldMinus, shield: Shield, stun: Zap, skill_lock:Lock, resource_jam:BatteryWarning, regen_off:HeartOff, mark:Crosshair, radar:Radar };
const timeLabel = (value: number) => Number.isFinite(value) ? `${Math.max(0, value).toFixed(1).replace(".", ",")}s` : "Đang hiệu lực";
const showTimer = (status?: StatusPresentation) => Boolean(status && Number.isFinite(status.remaining) && (status.showNumericTimer ?? !status.badgeText));
const progressRatio = (status?: StatusPresentation) => {
  const value = status?.progress ?? (status && status.duration > 0 ? status.remaining / status.duration : 1);
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1;
};

function overflowStatus(id:string|null, items:StatusPresentation[]):StatusPresentation|undefined {
  if (!id?.startsWith("overflow:")) return;
  const group=id.endsWith("debuff")?"debuff":"buff",hidden=items.filter(s=>s.group===group).slice(9);
  if (!hidden.length) return;
  return {...hidden[0],id,name:"Hiệu ứng bổ sung",description:hidden.map(s=>`${s.name}: ${s.description}`).join("\n\n"),remaining:Infinity,duration:Infinity,badgeText:undefined,timeLabel:`${hidden.length} hiệu ứng`};
}
/** Membership renders only when it changes. Timers use the existing combat frame loop. */
export const AirCombatStatusStrip = React.memo(forwardRef<StatusStripHandle, { top: number; onTooltipChange: (open: boolean) => void }>(({ top, onTooltipChange }, ref) => {
  const host = useRef<HTMLDivElement>(null), signature = useRef("");
  const current = useRef<StatusPresentation[]>([]);
  const [items, setItems] = useState<StatusPresentation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const tooltip = useRef<HTMLElement>(null);
  const tooltipChange = useRef(onTooltipChange); tooltipChange.current = onTooltipChange;
  const close = () => { if (!selectedRef.current) return; selectedRef.current = null; setSelected(null); tooltipChange.current(false); };
  useEffect(() => {
    const outside = (e: PointerEvent) => { if (!host.current?.contains(e.target as Node) && !(e.target as Element).closest?.("[data-combat-tooltip-trigger]")) close(); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("pointerdown", outside, true); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside, true); document.removeEventListener("keydown", escape); };
  }, []);
  useImperativeHandle(ref, () => ({ close, update(world) {
    current.current = getStatusPresentations(world);
    const surface=host.current?.closest<HTMLElement>(".air-combat-surface");
    if(surface)surface.dataset.empJam=String(world.aircraft.status.resourceJammedUntil>world.aircraft.coreState.time);
    const nextSignature = current.current.map(s => s.id).join("|");
    if (signature.current !== nextSignature) { signature.current = nextSignature; setItems(current.current); }
    for (const node of host.current?.querySelectorAll<HTMLElement>("[data-status-id]") || []) {
      const status = current.current.find(s => s.id === node.dataset.statusId);
      const ratio = progressRatio(status);
      node.style.setProperty("--status-elapsed", `${(1 - ratio) * 360}deg`);
      node.dataset.timerKind = status?.timerKind ?? "active";
      const timer = node.querySelector<HTMLElement>("[data-status-timer]");
      if (timer) {
        timer.hidden = !showTimer(status);
        timer.textContent = status && Number.isFinite(status.remaining) ? status.remaining.toFixed(1).replace(".", ",") : "";
      }
      const badge = node.querySelector<HTMLElement>("[data-status-value]");
      if (badge) {
        badge.hidden = !status?.badgeText;
        if (badge.textContent !== (status?.badgeText ?? "")) badge.textContent = status?.badgeText ?? "";
      }
      if (status) node.setAttribute("aria-label", `${status.name}${status.badgeText ? ` · ${status.badgeText}` : ""}`);
    }
    const active = current.current.find(s => s.id === selectedRef.current) ?? overflowStatus(selectedRef.current, current.current);
    if (selectedRef.current && !active) close();
    if (active && tooltip.current) {
      const time = tooltip.current.querySelector("[data-status-time]");
      const description = tooltip.current.querySelector("[data-status-description]");
      const source = tooltip.current.querySelector("[data-status-source]");
      const reward = tooltip.current.querySelector<HTMLElement>("[data-status-reward]");
      if(reward){reward.hidden=!active.rewardMessage;reward.textContent=active.rewardMessage??"";}
      if (time) time.textContent = active.timeLabel ?? timeLabel(active.remaining);
      if (description) updateCombatRichText(description, active.description, tooltip.current);
      if (source) source.textContent = `Nguồn: ${active.source}${active.badgeText ? ` · ${active.badgeText}` : ""}`;
    }
  } }), []);
  const active = current.current.find(s => s.id === selected) ?? overflowStatus(selected, current.current);
  useLayoutEffect(() => {
    const node=tooltip.current?.querySelector("[data-status-description]");
    if(node && tooltip.current && active)updateCombatRichText(node,active.description,tooltip.current);
  });
  return <div ref={host} className="air-status-strip" style={{ top: `${top / 720 * 100}%` }} aria-label="Hiệu ứng chiến đấu">
    {(["buff", "debuff"] as const).map(group => {
      const all = items.filter(s => s.group === group), shown = all.length > 10 ? all.slice(0, 9) : all;
      return <div key={group} className={`air-status-group air-status-group--${group}`} aria-label={group === "buff" ? "Buff" : "Debuff"}>
        {shown.map(item => {
          const status = current.current.find(s => s.id === item.id) || item;
          const Generic = status.icon.kind === "status" ? genericIcons[status.icon.id] : null;
          return <button key={status.id} type="button" data-status-id={status.id} data-timer-kind={status.timerKind ?? "active"} className="air-status-icon" data-combat-tooltip-trigger="status"
            style={{ "--status-elapsed": `${(1 - progressRatio(status)) * 360}deg` } as React.CSSProperties}
            aria-label={`${status.name}${status.badgeText ? ` · ${status.badgeText}` : ""}`} aria-pressed={selected === status.id}
            onClick={() => { const next = selected === status.id ? null : status.id; selectedRef.current = next; setSelected(next); tooltipChange.current(!!next); }}>
            {status.icon.kind === "status" ? Generic && <Generic aria-hidden="true" /> : <CombatUiIcon {...status.icon} fallback="◆" />}
            <span className="air-status-radial" />
            <small className="air-status-timer" data-status-timer hidden={!showTimer(status)}>{Number.isFinite(status.remaining)?status.remaining.toFixed(1).replace(".",","):""}</small>
            <b className="air-status-value-badge" data-status-value hidden={!status.badgeText}>{status.badgeText}</b>
          </button>;
        })}
        {all.length > 10 && <button type="button" className="air-status-overflow" data-combat-tooltip-trigger="status" aria-label={`Xem thêm ${all.length-9} hiệu ứng`} onClick={()=>{const next=selected===`overflow:${group}`?null:`overflow:${group}`;selectedRef.current=next;setSelected(next);tooltipChange.current(!!next);}}>+{all.length - 9}</button>}
      </div>;
    })}
    <AnimatePresence>{active && <motion.aside key="status" {...airTooltipMotion} ref={tooltip} className="air-status-tooltip" data-combat-tooltip-panel="status" role="status">
      <div className="air-tooltip-heading"><strong>{active.name}</strong><span data-status-time>{active.timeLabel ?? timeLabel(active.remaining)}</span></div>
      <CombatStatIconTemplates/><p data-status-description/>
      <strong className="air-status-reward" data-status-reward hidden={!active.rewardMessage}>{active.rewardMessage}</strong>
      <small data-status-source>Nguồn: {active.source}{active.badgeText ? ` · ${active.badgeText}` : ""}</small>
    </motion.aside>}</AnimatePresence>
  </div>;
}));
