import { TERRA_UPGRADE_ICONS } from './airCombatTerraArt';
import { SYLVA_UPGRADE_ICONS } from './airCombatSylvaArt';
import { ARGENT_UPGRADE_ICONS } from './airCombatArgentArt';
import { PassiveDetails } from './AirCombatPassive';
import { PASSIVES } from './airCombatPassives';
import { SkillIcon } from './SkillIcon';
import React, { useContext, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { ModalButton, OverlayBody, OverlayHeader } from "../../../components/overlay/AppOverlay";
import { AirCombatModal, AirCombatMotionContext } from "./AirCombatMotion";
import { AircraftPreview } from "./AircraftPreview";
import { CombatUiIcon } from "./CombatUiIcon";
import { CoreDescription } from "./CoreDescription";
import { createAircraftCombatState } from "./airCombatAircraft";
import { AIRCRAFT_CONFIGS, AIRCRAFT_ORDER, SKILL_CONFIGS } from "./airCombatConfig";
import { formatCooldownSeconds, getSkillTooltipModel } from "./airCombatPresentation";
import { AIRCRAFT_POWER_BARS, AIRCRAFT_SELECTION_PROFILES } from "./airCombatSelectionProfiles";
import { isUltimate } from "./airCombatSkillRanks";
import type { AircraftId, SkillId } from "./airCombatTypes";

type SelectionProps = {
  side: "player" | "ai";
  selected: AircraftId | "secret" | null;
  onSelect: (id: AircraftId) => void;
  onSelectSecret?: () => void;
  onConfirm: () => void;
};

export function AircraftSelection({ side, selected, onSelect, onSelectSecret, onConfirm }: SelectionProps) {
  const config = selected && selected !== "secret" ? AIRCRAFT_CONFIGS[selected] : null;
  return <div className="air-selection" style={config ? {
    "--aircraft-color": config.color, "--aircraft-accent": config.accent,
  } as React.CSSProperties : undefined}>
    <div className="air-selection-grid" role="group" aria-label={side === "player" ? "Chiến cơ Người Chơi" : "Chiến cơ Đối Thủ AI"}>
      {AIRCRAFT_ORDER.map(id => <button type="button" key={id} className="air-selection-tile"
        aria-label={AIRCRAFT_CONFIGS[id].name} aria-pressed={selected === id} data-aircraft-option={id}
        style={{ "--aircraft-color": AIRCRAFT_CONFIGS[id].color, "--aircraft-accent": AIRCRAFT_CONFIGS[id].accent } as React.CSSProperties}
        onClick={() => onSelect(id)}>
        <span aria-hidden="true"><AircraftPreview aircraftId={id} className="air-selection-sprite" /></span>
      </button>)}
      {side === "ai" && onSelectSecret && <button type="button" className="air-selection-tile air-selection-secret"
        aria-label="Bí Mật" aria-pressed={selected === "secret"} onClick={onSelectSecret}
        style={{ "--aircraft-color": "#cbd5e1", "--aircraft-accent": "#f8fafc" } as React.CSSProperties}>
        <span aria-hidden="true">?</span>
      </button>}
    </div>
    <div className="air-selection-panel" aria-live="polite" aria-atomic="true">
      {!selected ? <p className="air-selection-empty">Chọn một chiến cơ để xem thông tin</p>
        : selected === "secret" ? <div className="air-selection-empty"><h3>BÍ MẬT</h3><p>Chiến cơ đối thủ sẽ lộ diện trong đấu trường</p></div>
        : <AircraftSelectionDetails side={side} aircraftId={selected} />}
    </div>
    <button type="button" className="air-selection-confirm" disabled={!selected} onClick={onConfirm}>
      {side === "player" ? "XÁC NHẬN CHỌN CHIẾN CƠ PLAYER" : "XÁC NHẬN CHỌN CHIẾN CƠ AI"}
    </button>
  </div>;
}

function AircraftSelectionDetails({ aircraftId, side }: { aircraftId: AircraftId; side: SelectionProps["side"] }) {
  const config = AIRCRAFT_CONFIGS[aircraftId];
  const profile = AIRCRAFT_SELECTION_PROFILES[aircraftId];

  return <>
    <div className="air-selection-identity">
      <AircraftPreview key={aircraftId} aircraftId={aircraftId} className="air-selection-portrait" />
      <div><span className="air-selection-code">{config.code}{aircraftId==='terra'?' · Hành Thổ':aircraftId==='sylva'?' · Hành Mộc':aircraftId==='argent'?' · Ngân Dực · Hành Kim':aircraftId==='riptide'?' · Hành Thủy':''}</span><h3>{config.name}</h3><p className="air-selection-role">{profile.role}</p></div>
    </div>
    <p className="air-selection-description">{profile.description}</p>
    <AircraftSelectionPower power={profile.power} />
    <AircraftSelectionSkills key={`${side}:${aircraftId}`} aircraftId={aircraftId} />
  </>;
}

function AircraftSelectionPower({ power }: { power: readonly [number, number, number, number] }) {
  const container = useRef<HTMLDivElement>(null);
  const gameReducedMotion = useContext(AirCombatMotionContext);
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = gameReducedMotion || !!systemReducedMotion;

  useLayoutEffect(() => {
    const fills = Array.from(container.current!.querySelectorAll<HTMLDivElement>(".air-selection-power-fill"));
    const animations = fills.map((fill, index) => {
      // The previous cleanup freezes the in-flight fill before cancelling it.
      // Retarget all four persistent elements together for a full 450 ms.
      const from = getComputedStyle(fill).transform;
      const to = `scaleX(${power[index] / 100})`;
      fill.style.transform = to;
      return reducedMotion ? null : fill.animate([{ transform: from }, { transform: to }], {
        duration: 450,
        easing: "ease-out",
      });
    });
    return () => {
      fills.forEach((fill, index) => {
        fill.style.transform = getComputedStyle(fill).transform;
        animations[index]?.cancel();
      });
    };
  }, [power, reducedMotion]);

  return <div ref={container} className="air-selection-power">
    {AIRCRAFT_POWER_BARS.map(bar => <div className="air-selection-power-row" key={bar.label}>
      <span>{bar.label}</span>
      <div className="air-selection-power-track" aria-hidden="true"><div className="air-selection-power-fill" style={{ backgroundColor: bar.color }} /></div>
    </div>)}
  </div>;
}

function AircraftSelectionSkills({ aircraftId }: { aircraftId: AircraftId }) {
  const config = AIRCRAFT_CONFIGS[aircraftId];
  const [passiveOpen,setPassiveOpen]=useState(false);
  const [detailSkill, setDetailSkill] = useState<SkillId | null>(null);
  const titleId = useId();
  // A detached level-one preview; it never enters a run or a saved profile.
  const preview = useMemo(() => {
    const state = createAircraftCombatState(aircraftId);
    for (const id of AIRCRAFT_CONFIGS[aircraftId].skillIds) state.skillRanks[id] = 1;
    return state;
  }, [aircraftId]);
  const model = detailSkill ? getSkillTooltipModel(preview, detailSkill) : null;

  return <>
    <button type="button" className="air-selection-skill air-selection-passive" onClick={()=>setPassiveOpen(true)}><SkillIcon id={PASSIVES[aircraftId].id} className="!h-9 !w-9"/><span><small>Nội Tại</small><strong>{PASSIVES[aircraftId].name}</strong></span></button>
    {passiveOpen&&<AirCombatModal archetype="info" layer="exclusive-dialog" onClose={()=>setPassiveOpen(false)} labelledBy={titleId}><OverlayHeader className="flex items-start justify-between gap-3"><div><p className="text-xs text-[var(--modal-muted)]">{config.name} · Nội Tại · Cấp chiến cơ {preview.level}</p><h3 id={titleId} className="modal-title">{PASSIVES[aircraftId].name}</h3></div><ModalButton variant="icon" aria-label="Đóng chi tiết nội tại" onClick={()=>setPassiveOpen(false)}><X className="h-4 w-4"/></ModalButton></OverlayHeader><OverlayBody><div className="space-y-3 text-sm leading-relaxed text-[var(--modal-text)]"><PassiveDetails state={preview} heading={false}/></div></OverlayBody></AirCombatModal>}
    <div className="air-selection-skills">
      {config.skillIds.map(id => <button type="button" key={id} className="air-selection-skill" onClick={() => setDetailSkill(id)}
        aria-label={`Xem chi tiết ${isUltimate(id) ? "kỹ năng tối thượng" : "kỹ năng"} ${SKILL_CONFIGS[id].name}`}>
        <CombatUiIcon kind="skill" id={id} fallback={SKILL_CONFIGS[id].icon} className="!h-9 !w-9 shrink-0" />
        <span><small>{isUltimate(id) ? "Tối thượng" : "Kỹ năng"}</small><strong>{SKILL_CONFIGS[id].name}</strong><small className="air-selection-detail-link">Xem chi tiết →</small></span>
      </button>)}
    </div>
    {detailSkill && model && <AirCombatModal archetype="info" layer="exclusive-dialog" onClose={() => setDetailSkill(null)} labelledBy={titleId}>
      <OverlayHeader className="flex items-start justify-between gap-3">
        <div><p className="text-xs text-[var(--modal-muted)]">{config.name} · {isUltimate(detailSkill) ? "Kỹ năng tối thượng" : "Kỹ năng cơ bản"} · Cấp 1</p><h3 id={titleId} className="modal-title">{model.title}</h3></div>
        <ModalButton variant="icon" aria-label="Đóng chi tiết kỹ năng" onClick={() => setDetailSkill(null)}><X className="h-4 w-4" /></ModalButton>
      </OverlayHeader>
      <OverlayBody>
        <div className="space-y-3 text-sm leading-relaxed text-[var(--modal-text)]">
          <p><CoreDescription text={model.description} /></p>
          <div>{model.detailRows.map(row => <p key={row}><CoreDescription text={row} /></p>)}<p>Hồi chiêu: {formatCooldownSeconds(model.cooldown)}</p></div>
          {model.rankRows.map(row => <section key={row.rank}><h4 className="font-bold">{({...TERRA_UPGRADE_ICONS,...ARGENT_UPGRADE_ICONS,...SYLVA_UPGRADE_ICONS})[detailSkill as string]&&<SkillIcon id={({...TERRA_UPGRADE_ICONS,...ARGENT_UPGRADE_ICONS,...SYLVA_UPGRADE_ICONS})[detailSkill as string][row.rank-1]} className="air-argent-upgrade-icon"/>}Cấp {row.rank} — {row.name}</h4><p className="whitespace-pre-line"><CoreDescription text={row.displayDescription} /></p></section>)}
        </div>
      </OverlayBody>
    </AirCombatModal>}
  </>;
}
