import { AnimatePresence, motion } from "motion/react";
import { airTooltipMotion } from "./AirCombatMotion";
import React, { forwardRef, useCallback, useLayoutEffect, useImperativeHandle, useRef, useState } from "react";
import { Flame, FlaskConical, Shield, ShieldMinus, Zap, Lock, BatteryWarning, HeartOff, Crosshair, Radar } from "lucide-react";
import { CoreDescription } from "./CoreDescription";
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
  const group=id.endsWith("debuff")?"debuff":"buff",all=items.filter(s=>s.group===group);
  if (all.length <= 10) return;
  const hidden=all.slice(9);
  return {...hidden[0],id,name:"Hiệu ứng bổ sung",description:hidden.map(s=>`${s.name}: ${s.description}`).join("\n\n"),remaining:Infinity,duration:Infinity,badgeText:undefined,timeLabel:`${hidden.length} hiệu ứng`};
}
function sameSnapshot(previous: StatusPresentation[], next: StatusPresentation[]): boolean {
  return previous.length === next.length && previous.every((status, index) => {
    const other = next[index];
    return status.id === other.id && status.group === other.group && status.name === other.name
      && status.icon.kind === other.icon.kind && status.icon.id === other.icon.id
      && status.description === other.description && status.source === other.source
      && status.stacks === other.stacks && status.badgeText === other.badgeText
      && status.badgeKind === other.badgeKind && status.timerKind === other.timerKind
      && status.timeLabel === other.timeLabel && status.showNumericTimer === other.showNumericTimer
      && status.rewardMessage === other.rewardMessage && status.duration === other.duration
      && status.remaining.toFixed(1) === other.remaining.toFixed(1)
      && Math.round(progressRatio(status) * 360) === Math.round(progressRatio(other) * 360);
  });
}
/** React owns the entire status snapshot; Battle supplies unpaused updates at 10 Hz. */
export const AirCombatStatusStrip = React.memo(forwardRef<StatusStripHandle, { top: number; onTooltipChange: (open: boolean) => void }>(({ top, onTooltipChange }, ref) => {
  const host = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<StatusPresentation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const tooltipChange = useRef(onTooltipChange); tooltipChange.current = onTooltipChange;
  const close = useCallback(() => { if (selectedRef.current === null) return; selectedRef.current = null; setSelected(null); tooltipChange.current(false); }, []);
  const toggle = (id: string) => {
    const wasOpen = selectedRef.current !== null;
    const next = selectedRef.current === id ? null : id;
    selectedRef.current = next;
    setSelected(next);
    if (wasOpen !== (next !== null)) tooltipChange.current(next !== null);
  };
  // Battle owns outside-dismiss, Escape and dismiss-pointer suppression.
  useImperativeHandle(ref, () => ({ close, update(world) {
    if (world.pauseReasons.size > 0) return;
    const next = getStatusPresentations(world);
    const surface=host.current?.closest<HTMLElement>(".air-combat-surface");
    const empJam = String(world.aircraft.status.resourceJammedUntil > world.aircraft.coreState.time);
    if (surface && surface.dataset.empJam !== empJam) surface.dataset.empJam = empJam;
    setItems(previous => sameSnapshot(previous, next) ? previous : next);
  } }), [close]);
  const active = items.find(s => s.id === selected) ?? overflowStatus(selected, items);
  useLayoutEffect(() => {
    if (selected !== null && !active) close();
  }, [selected, active, close]);
  return <div ref={host} className="air-status-strip" style={{ top: `${top / 720 * 100}%` }} aria-label="Hiệu ứng chiến đấu">
    {(["buff", "debuff"] as const).map(group => {
      const all = items.filter(s => s.group === group), shown = all.length > 10 ? all.slice(0, 9) : all;
      return <div key={group} className={`air-status-group air-status-group--${group}`} aria-label={group === "buff" ? "Buff" : "Debuff"}>
        {shown.map(status => {
          const Generic = status.icon.kind === "status" ? genericIcons[status.icon.id] : null;
          return <button key={status.id} type="button" data-status-id={status.id} data-timer-kind={status.timerKind ?? "active"} className="air-status-icon" data-combat-tooltip-trigger="status"
            style={{ "--status-elapsed": `${(1 - progressRatio(status)) * 360}deg` } as React.CSSProperties}
            aria-label={`${status.name}${status.badgeText ? ` · ${status.badgeText}` : ""}`} aria-pressed={selected === status.id}
            onClick={() => toggle(status.id)}>
            {status.icon.kind === "status" ? Generic && <Generic aria-hidden="true" /> : <CombatUiIcon {...status.icon} fallback="◆" />}
            <span className="air-status-radial" />
            <small className="air-status-timer" data-status-timer hidden={!showTimer(status)}>{Number.isFinite(status.remaining)?status.remaining.toFixed(1).replace(".",","):""}</small>
            <b className="air-status-value-badge" data-status-value hidden={!status.badgeText}>{status.badgeText}</b>
          </button>;
        })}
        {all.length > 10 && <button type="button" className="air-status-overflow" data-combat-tooltip-trigger="status" aria-label={`Xem thêm ${all.length-9} hiệu ứng`} aria-pressed={selected === `overflow:${group}`} onClick={() => toggle(`overflow:${group}`)}>+{all.length - 9}</button>}
      </div>;
    })}
    <AnimatePresence>{active && <motion.aside key="status" {...airTooltipMotion} className="air-status-tooltip" data-combat-tooltip-panel="status" role="status">
      <div className="air-tooltip-heading"><strong>{active.name}</strong><span data-status-time>{active.timeLabel ?? timeLabel(active.remaining)}</span></div>
      <p data-status-description><CoreDescription text={active.description} /></p>
      <strong className="air-status-reward" data-status-reward hidden={!active.rewardMessage}>{active.rewardMessage}</strong>
      <small data-status-source>Nguồn: {active.source}{active.badgeText ? ` · ${active.badgeText}` : ""}</small>
    </motion.aside>}</AnimatePresence>
  </div>;
}));
