import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Flame, FlaskConical, Shield, ShieldMinus, Zap, Lock, BatteryWarning, HeartOff, Crosshair, Radar } from "lucide-react";
import { CombatUiIcon } from "./CombatUiIcon";
import { getStatusPresentations, type StatusPresentation } from "./airCombatPresentation";
import type { CombatWorld } from "./airCombatRuntime";

export interface StatusStripHandle { update(world: CombatWorld): void }
const genericIcons = { burn: Flame, acid: FlaskConical, armor: ShieldMinus, shield: Shield, stun: Zap, skill_lock:Lock, resource_jam:BatteryWarning, regen_off:HeartOff, mark:Crosshair, radar:Radar };
const timeLabel = (value: number) => Number.isFinite(value) ? `${Math.max(0, value).toFixed(1).replace(".", ",")}s` : "Đang hiệu lực";
const progressRatio = (status?: StatusPresentation) => {
  const value = status?.progress ?? (status && status.duration > 0 ? status.remaining / status.duration : 1);
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1;
};

/** Membership renders only when it changes. Timers use the existing combat frame loop. */
export const AirCombatStatusStrip = React.memo(forwardRef<StatusStripHandle, { top: number }>(({ top }, ref) => {
  const host = useRef<HTMLDivElement>(null), signature = useRef("");
  const current = useRef<StatusPresentation[]>([]);
  const [items, setItems] = useState<StatusPresentation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const tooltip = useRef<HTMLElement>(null);
  const close = () => { selectedRef.current = null; setSelected(null); };
  useEffect(() => {
    const outside = (e: PointerEvent) => { if (!host.current?.contains(e.target as Node)) close(); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("pointerdown", outside, true); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside, true); document.removeEventListener("keydown", escape); };
  }, []);
  useImperativeHandle(ref, () => ({ update(world) {
    current.current = getStatusPresentations(world);
    const surface=host.current?.closest<HTMLElement>(".air-combat-surface");
    if(surface)surface.dataset.empJam=String(world.aircraft.status.resourceJammedUntil>world.aircraft.coreState.time);
    const nextSignature = current.current.map(s => s.id).join("|");
    if (signature.current !== nextSignature) { signature.current = nextSignature; setItems(current.current); }
    for (const node of host.current?.querySelectorAll<HTMLElement>("[data-status-id]") || []) {
      const status = current.current.find(s => s.id === node.dataset.statusId);
      const ratio = progressRatio(status);
      node.style.setProperty("--status-elapsed", `${(1 - ratio) * 360}deg`);
      const timer = node.querySelector<HTMLElement>("[data-status-timer]");
      if (timer) {
        timer.hidden = Boolean(status?.badgeText);
        timer.textContent = status && Number.isFinite(status.remaining) ? status.remaining.toFixed(1).replace(".", ",") : "";
      }
      const badge = node.querySelector<HTMLElement>("[data-status-value]");
      if (badge) {
        badge.hidden = !status?.badgeText;
        if (badge.textContent !== (status?.badgeText ?? "")) badge.textContent = status?.badgeText ?? "";
      }
      if (status) node.setAttribute("aria-label", `${status.name}${status.badgeText ? ` · ${status.badgeText}` : ""}`);
    }
    const active = current.current.find(s => s.id === selectedRef.current);
    if (selectedRef.current && !active) close();
    if (active && tooltip.current) {
      const time = tooltip.current.querySelector("[data-status-time]");
      const description = tooltip.current.querySelector("[data-status-description]");
      const source = tooltip.current.querySelector("[data-status-source]");
      if (time) time.textContent = active.timeLabel ?? timeLabel(active.remaining);
      if (description) description.textContent = active.description;
      if (source) source.textContent = `Nguồn: ${active.source}${active.badgeText ? ` · ${active.badgeText}` : ""}`;
    }
  } }), []);
  const active = current.current.find(s => s.id === selected);
  return <div ref={host} className="air-status-strip" style={{ top: `${top / 720 * 100}%` }} aria-label="Hiệu ứng chiến đấu">
    {(["buff", "debuff"] as const).map(group => {
      const all = items.filter(s => s.group === group), shown = all.length > 10 ? all.slice(0, 9) : all;
      return <div key={group} className={`air-status-group air-status-group--${group}`} aria-label={group === "buff" ? "Buff" : "Debuff"}>
        {shown.map(item => {
          const status = current.current.find(s => s.id === item.id) || item;
          const Generic = status.icon.kind === "status" ? genericIcons[status.icon.id] : null;
          return <button key={status.id} type="button" data-status-id={status.id} className="air-status-icon"
            style={{ "--status-elapsed": `${(1 - progressRatio(status)) * 360}deg` } as React.CSSProperties}
            aria-label={`${status.name}${status.badgeText ? ` · ${status.badgeText}` : ""}`} aria-pressed={selected === status.id}
            onClick={() => { const next = selected === status.id ? null : status.id; selectedRef.current = next; setSelected(next); }}>
            {status.icon.kind === "status" ? Generic && <Generic aria-hidden="true" /> : <CombatUiIcon {...status.icon} fallback="◆" />}
            <span className="air-status-radial" />
            <small className="air-status-timer" data-status-timer hidden={Boolean(status.badgeText)}>{Number.isFinite(status.remaining)?status.remaining.toFixed(1).replace(".",","):""}</small>
            <b className="air-status-value-badge" data-status-value hidden={!status.badgeText}>{status.badgeText}</b>
          </button>;
        })}
        {all.length > 10 && <span className="air-status-overflow" title={all.slice(9).map(s => s.name).join(" · ")}>+{all.length - 9}</span>}
      </div>;
    })}
    {active && <aside ref={tooltip} className="air-status-tooltip" role="status">
      <div className="air-tooltip-heading"><strong>{active.name}</strong><span data-status-time>{active.timeLabel ?? timeLabel(active.remaining)}</span></div>
      <p data-status-description>{active.description}</p>
      <small data-status-source>Nguồn: {active.source}{active.badgeText ? ` · ${active.badgeText}` : ""}</small>
    </aside>}
  </div>;
}));
