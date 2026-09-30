import React, { useEffect, useRef, useState } from "react";
import { AIRCRAFT_CONFIGS, SKILL_CONFIGS, AIR_COMBAT_WORLD, GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import { getEffectiveAircraftStats } from "./airCombatAircraft";
import { canAllocateSkill, skillRank } from "./airCombatSkillRanks";
import { bestAvailableRerollSource, getWorldSkillAvailability } from "./airCombatRuntime";
import { getSkillTooltipModel, formatSkillCellCooldown } from "./airCombatPresentation";
import { equipmentState } from "./airCombatEquipmentState";
import { EQUIPMENT_CATALOG } from "./airCombatEquipmentCatalog";
import { equipmentEffectDescription } from "./airCombatEquipmentPresentation";
import { releaseState } from "./airCombatReleaseState";
import { moveSoloPlayer, castSoloSkill, updateSoloMatch, upgradeSoloSkill, selectSoloCore, selectSoloPrimary, rerollSoloCore, type SoloMatch } from "./airCombatDuelRuntime";
import { AirCombatCoreTransition } from "./AirCombatCoreTransition";
import { AirCombatCoreList } from "./AirCombatCoreList";
import { AirCombatModal } from "./AirCombatMotion";
import { ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";
import { AircraftPreview } from "./AircraftPreview";
import { CombatUiIcon } from "./CombatUiIcon";
import { CoreDescription } from "./CoreDescription";
import { createLegacyPresentation } from "./pixi/AirCombatPixiStage";
import type { AirCombatPresentation } from "./pixi/airCombatPixiTypes";
import type { SkillId } from "./airCombatTypes";

export function AirCombatSoloBattle({ match, reducedMotion, onComplete, onMenu }: { match: SoloMatch; reducedMotion: boolean; onComplete: () => void; onMenu: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [, redraw] = useState(0);
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false), [retry, setRetry] = useState(0);
  const [dialog, setDialog] = useState<"exit" | "equipment" | "cores" | SkillId | null>(null);
  const paused = useRef(false); paused.current = dialog !== null;
  const done = useRef(onComplete); done.current = onComplete;
  const control = useRef<{ id: number; x: number; y: number } | null>(null);
  const refresh = () => redraw(v => v + 1);
  useEffect(() => {
    let cancelled = false, frame = 0, presentation: AirCombatPresentation | undefined;
    let last = performance.now(), lastHud = 0, legacy = false;
    setReady(false); setFailed(false);
    const load = async () => {
      try {
        if (legacy) presentation = await createLegacyPresentation(host.current!, 0);
        else { const { AirCombatPixiRenderer } = await import("./pixi/AirCombatPixiRenderer"); presentation = await AirCombatPixiRenderer.create(host.current!); }
        if (cancelled) { presentation.destroy(); return; }
        setReady(true); last = performance.now();
      } catch {
        if (cancelled) return;
        if (!legacy) { legacy = true; await load(); } else setFailed(true);
      }
    };
    const loop = (now: number) => {
      if (cancelled) return;
      const delta = Math.min(.12, Math.max(0, (now - last) / 1000)); last = now;
      if (presentation && !document.hidden) {
        if (!paused.current) {
          let remaining = delta;
          while (remaining > 0 && match.phase !== "match_result") {
            const dt = Math.min(AIR_COMBAT_WORLD.maxDeltaSeconds, remaining);
            updateSoloMatch(match, dt); remaining -= dt;
          }
        }
        try { presentation.render(match.world, paused.current ? 0 : delta, reducedMotion); }
        catch {
          presentation.destroy(); presentation = undefined; setReady(false);
          if (!legacy) { legacy = true; void load(); } else setFailed(true);
        }
        if (now - lastHud >= 80) { redraw(v => v + 1); lastHud = now; }
        if (match.phase === "match_result") { done.current(); return; }
      }
      frame = requestAnimationFrame(loop);
    };
    const resetClock = () => { last = performance.now(); control.current = null; match.world.playerInputActive = false; };
    document.addEventListener("visibilitychange", resetClock);
    window.addEventListener("blur", resetClock);
    void load(); frame = requestAnimationFrame(loop);
    return () => { cancelled = true; cancelAnimationFrame(frame); presentation?.destroy(); document.removeEventListener("visibilitychange", resetClock); window.removeEventListener("blur", resetClock); };
  }, [match, reducedMotion, retry]);
  const player = match.world.aircraft, opponent = match.opponent.aircraft;
  const skills = AIRCRAFT_CONFIGS[player.aircraftId].skillIds;
  const time = Math.max(0, Math.ceil(180 - match.roundElapsed));
  const playing = match.phase === "combat" || match.phase === "sudden_death";
  const skillDetail = dialog && skills.includes(dialog as SkillId) ? getSkillTooltipModel(player, dialog as SkillId) : null;
  const equipment = equipmentState(player).equipped;
  const equipmentRow = <div className="air-solo-equipment">{equipment.map((item, i) => <span key={i} title={item ? EQUIPMENT_CATALOG[item.definitionId].name : `Slot ${i + 1}`}>
    {item ? <><CombatUiIcon fallback="" kind="equipment" id={item.definitionId} className="!h-8 !w-8" /><small>{item.definitionId}</small></> : <small>{i + 1}</small>}
  </span>)}</div>;
  return <section className="air-solo-battle" data-phase={match.phase}>
    <nav><button onClick={() => setDialog("exit")}>MENU CHÍNH</button><strong>HIỆP {match.round} / 9</strong><time>{Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}</time></nav>
    <div className="air-solo-score">PLAYER {match.playerWins} — {match.opponentWins} AI</div>
    <div className="air-solo-health">{[player, opponent].map((state, i) => {
      const stats = getEffectiveAircraftStats(state);
      return <div key={i}><span>{i ? "AI" : "PLAYER"} · {i && !ready ? "???" : AIRCRAFT_CONFIGS[state.aircraftId].name} · Lv{state.level}</span>
        <meter aria-label={i ? "HP AI" : "HP Player"} min={0} max={stats.maxHp} value={state.currentHp} /><small>{Math.ceil(state.currentHp)} / {Math.ceil(stats.maxHp)} HP</small>
        <meter aria-label={i ? "Tài Nguyên AI" : "Tài Nguyên Player"} min={0} max={stats.maxResource} value={state.currentResource} /><small>{Math.floor(state.currentResource)} / {Math.ceil(stats.maxResource)} {stats.resourceKind === "mana" ? "Mana" : "Điện"}</small></div>;
    })}</div>
    <div className="air-solo-arena" onPointerDown={e => {
      if (!ready || paused.current || control.current || (!playing && match.phase !== "countdown")) return;
      e.currentTarget.setPointerCapture(e.pointerId); control.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    }} onPointerMove={e => {
      const c = control.current; if (!c || c.id !== e.pointerId || paused.current) return;
      const rect = host.current!.getBoundingClientRect();
      moveSoloPlayer(match, (e.clientX - c.x) * 360 / rect.width, (e.clientY - c.y) * 640 / rect.height);
      c.x = e.clientX; c.y = e.clientY;
    }} onPointerUp={e => { if (control.current?.id === e.pointerId) { control.current = null; match.world.playerInputActive = false; } }}
      onPointerCancel={() => { control.current = null; match.world.playerInputActive = false; }}>
      <div ref={host} className="air-solo-renderer" />
      {!ready && <div className="air-solo-announcement">{failed ? <><strong>Không thể tải đấu trường</strong><button onClick={() => setRetry(v => v + 1)}>THỬ LẠI</button></> : "ĐANG TẢI ĐẤU TRƯỜNG…"}</div>}
      {ready && match.phase === "reveal" && <div className="air-solo-announcement"><span>ĐỐI THỦ</span><AircraftPreview aircraftId={opponent.aircraftId} className="h-24 w-24" /><strong>{AIRCRAFT_CONFIGS[opponent.aircraftId].name}</strong></div>}
      {match.phase === "countdown" && <><div className="air-solo-midline" style={{top: `${(GAMEPLAY_SAFE_RECT.top + GAMEPLAY_SAFE_RECT.height / 2) / 640 * 100}%`}} /><div className="air-solo-announcement"><span>HIỆP {match.round}</span><strong>{Math.ceil(match.countdownRemaining)}</strong><small>Di chuyển trong nửa sân · Cộng Điểm Kỹ Năng</small></div></>}
      {playing && match.roundElapsed < 1 && <div className="air-solo-announcement"><strong>CHIẾN ĐẤU!</strong></div>}
      {match.phase === "round_result" && <div className="air-solo-announcement"><strong>{match.roundWinner === "player" ? "BẠN THẮNG HIỆP" : "AI THẮNG HIỆP"}</strong></div>}
      {playing && match.roundElapsed >= 120 && <div className="air-solo-escalation">{match.suddenDeath ? "SUDDEN DEATH · KHÔNG THỂ HỒI MÁU" : match.roundElapsed >= 150 ? "TỬ CHIẾN · +100% SÁT THƯƠNG" : "CUỒNG CHIẾN · +50% SÁT THƯƠNG"}</div>}
      {match.suddenDeath && match.roundElapsed < 120 && <div className="air-solo-escalation">SUDDEN DEATH · KHÔNG THỂ HỒI MÁU</div>}
    </div>
    <div className="air-solo-build-buttons"><button onClick={() => setDialog("equipment")}>TRANG BỊ {equipment.filter(Boolean).length}/6</button><span>ĐIỂM KỸ NĂNG: {player.skillPoints}</span><button onClick={() => setDialog("cores")}>LÕI {player.selectedCores.length}</button></div>
    <div className="air-solo-skills">{skills.map(id => {
      const available = getWorldSkillAvailability(match.world, id), rank = skillRank(player, id);
      return <div key={id}>
        <button className="air-solo-skill" disabled={!playing || !available.available} onClick={() => { castSoloSkill(match, id); refresh(); }}>
          <CombatUiIcon fallback="" kind="skill" id={id} className="!h-8 !w-8" /><strong>{SKILL_CONFIGS[id].shortName}</strong><small>R{rank} · {(player.cooldowns[id] ?? 0) > 0 ? formatSkillCellCooldown(player.cooldowns[id]!) : rank ? available.manualAction ? "Kích hoạt lần 2" : "Sẵn sàng" : "Chưa học"}</small>
        </button>
        <div><button aria-label={`Nâng ${SKILL_CONFIGS[id].name}`} disabled={!ready || !canAllocateSkill(player, id) || (!playing && match.phase !== "countdown")} onClick={() => { upgradeSoloSkill(match, id); refresh(); }}>＋</button><button aria-label={`Chi tiết ${SKILL_CONFIGS[id].name}`} onClick={() => setDialog(id)}>ⓘ</button></div>
      </div>;
    })}</div>
    {match.phase === "core_selection" && !dialog && <AirCombatModal archetype="transaction" layer="exclusive-dialog" layout="viewport-safe" closeOnEscape={false} labelledBy="solo-core-title">
      <OverlayHeader><h2 id="solo-core-title">HIỆP {match.round} · CHỌN LÕI</h2><p>Trang Bị hiện tại</p>{equipmentRow}<button onClick={() => setDialog("equipment")}>CHI TIẾT TRANG BỊ</button><button onClick={() => setDialog("exit")}>MENU CHÍNH</button></OverlayHeader>
      <OverlayBody>{match.world.currentCoreChoices?.length ? <div className="air-solo-core-cards">{match.world.currentCoreChoices.map((card, slot) => {
        const source = bestAvailableRerollSource(match.world, slot);
        return <article key={card.id} data-core-tier={card.tier}><AirCombatCoreTransition card={card} detail />
          <div><button disabled={!source} onClick={() => { if (source) rerollSoloCore(match, slot, source); refresh(); }}>↻ ĐỔI LẠI</button><button onClick={() => { selectSoloCore(match, card); refresh(); }}>CHỌN LÕI</button></div>
        </article>;
      })}</div> : releaseState(player).followups.includes("primary") ? <div><h3>CHỌN KỸ NĂNG CHỦ LỰC</h3>{skills.map((id, slot) => <button key={id} onClick={() => { selectSoloPrimary(match, slot); refresh(); }}><CombatUiIcon fallback="" kind="skill" id={id} />{SKILL_CONFIGS[id].name}</button>)}</div> : null}</OverlayBody>
    </AirCombatModal>}
    {dialog === "cores" && <AirCombatCoreList state={player} onClose={() => setDialog(null)} />}
    {dialog && dialog !== "cores" && <AirCombatModal archetype={dialog === "exit" ? "confirm" : "info"} layer="exclusive-dialog" layout="viewport-safe" onClose={() => setDialog(null)} labelledBy="solo-dialog-title">
      <OverlayHeader><h2 id="solo-dialog-title">{dialog === "exit" ? "RỜI TRẬN ĐẤU?" : dialog === "equipment" ? "TRANG BỊ SOLO" : skillDetail?.title}</h2></OverlayHeader>
      <OverlayBody>{dialog === "exit" ? <p>Hủy Match và trở về Menu Chính. Không phần thưởng, không thành tích, không hình phạt.</p> : dialog === "equipment" ? <>{equipmentRow}{equipment.filter(Boolean).map(item => <article key={item!.instanceId}><h3>{EQUIPMENT_CATALOG[item!.definitionId].name}</h3><CoreDescription text={EQUIPMENT_CATALOG[item!.definitionId].statsText} /><CoreDescription text={equipmentEffectDescription(player, item!.definitionId)} /></article>)}</> : skillDetail && <><CoreDescription text={skillDetail.description} />{[...skillDetail.detailRows, ...skillDetail.coreRows].map(line => <p key={line}>{line}</p>)}{skillDetail.rankRows.map(row => <p key={row.rank}>R{row.rank}: <CoreDescription text={row.displayDescription} /></p>)}</>}</OverlayBody>
      <OverlayFooter><ModalButton onClick={() => setDialog(null)}>{dialog === "exit" ? "Ở LẠI" : "ĐÓNG"}</ModalButton>{dialog === "exit" && <ModalButton onClick={onMenu}>VỀ MENU CHÍNH</ModalButton>}</OverlayFooter>
    </AirCombatModal>}
  </section>;
}
