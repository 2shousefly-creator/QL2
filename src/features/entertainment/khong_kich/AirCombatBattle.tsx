import { canBorrowSkill } from "./airCombatAircraft";
import { playerSkillLocked } from "./airCombatStatus";
import { AirCombatStatusStrip, type StatusStripHandle } from "./AirCombatStatusStrip";
import { getActiveSkillDuration, getSkillTooltipModel } from "./airCombatPresentation";
import { BOSS_HUD_HEIGHT } from "./airCombatHudLayout";
import { AirCombatOverlayFeedback } from "./AirCombatOverlayFeedback";
import { CoreDescription } from "./CoreDescription";
import { AirCombatCoreList } from "./AirCombatCoreList";
import { hasCore, skillsLocked } from "./airCombatCoreEffects";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AirCombatPixiStage, createLegacyPresentation } from "./pixi/AirCombatPixiStage";
import type { AirCombatPresentation } from "./pixi/airCombatPixiTypes";
import { CombatUiIcon } from "./CombatUiIcon";
import { CombatStatChips } from "./CombatStatReadout";
import "./combat-ui.css";
import { ArrowLeft, Layers, Pause, Play, X } from "lucide-react";
import { soundManager } from "../../../game/audio";
import { AppModal, ConfirmationDialog, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";
import {
  AIR_COMBAT_WORLD,
  AIRCRAFT_CONFIGS,
  GAMEPLAY_SAFE_RECT,
  getCoreDefinition,
  SKILL_CONFIGS,
} from "./airCombatConfig";
import {
  classifySkillPress,
  getEffectiveAircraftStats,
  getSkillRuntimeValues,
  shouldCastSkillPress,
} from "./airCombatEngine";
import {
  canRerollCore,
  rerollCore,
  castWorldSkill,
  CombatWorld,
  createCombatWorld,
  ensureCoreSelection,
  makeHudSnapshot,
  selectCore,
  setPlayerInputActive,
  movePlayerByDelta,
  summarizeCombatWorld,
  updateCombatWorld,
} from "./airCombatRuntime";
import {
  AirCombatHudSnapshot,
  AirCombatRunSummary,
  AircraftId,
  CoreCard,
  SkillId,
} from "./airCombatTypes";

interface AirCombatBattleProps {
  aircraftId: AircraftId;
  reducedMotion: boolean;
  onComplete: (summary: AirCombatRunSummary) => void;
  onExit: () => void;
}

type PauseReason = "loading" | "user" | "core" | "tooltip" | "exit" | "hidden" | "coreList";

interface SkillPressState {
  skillId: SkillId;
  pointerId: number;
  startedAt: number;
  timer: number | null;
  held: boolean;
}

interface PlayerControlState {
  pointerId: number;
  originX: number;
  originY: number;
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function pauseLabel(reasons: ReadonlySet<PauseReason>): string | null {
  if (reasons.has("core")) return "Chọn lõi";
  if (reasons.has("coreList")) return "Danh sách lõi";
  if (reasons.has("tooltip")) return "Xem kỹ năng";
  if (reasons.has("exit")) return "Xác nhận thoát";
  if (reasons.has("hidden")) return "Ứng dụng tạm ẩn";
  if (reasons.has("user")) return "Tạm dừng";
  return null;
}

export const AirCombatBattle: React.FC<AirCombatBattleProps> = ({
  aircraftId,
  reducedMotion,
  onComplete,
  onExit,
}) => {
  const statusStripRef = useRef<StatusStripHandle>(null);
  const durationNodes = useRef<Partial<Record<SkillId, HTMLSpanElement | null>>>({});
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [rendererState, setRendererState] = useState<"loading" | "pixi" | "legacy" | "failed">("loading");
  const worldRef = useRef<CombatWorld>(createCombatWorld(aircraftId));
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);
  const draggingRef = useRef(false);
  const playerControlRef = useRef<PlayerControlState | null>(null);
  const pauseReasonsRef = useRef<Set<PauseReason>>(new Set(["loading"]));
  const coreSelectingRef = useRef(false);
  const pressRef = useRef<SkillPressState | null>(null);
  const lowHpWarnedRef = useRef(false);
  const announcementRef = useRef<string | null>(null);
  const [pauseState, setPauseState] = useState({ paused: false, label: null as string | null });
  const toastHostRef = useRef<HTMLDivElement>(null);
  const bossHpRef = useRef<HTMLDivElement>(null);
  const bossChipRef = useRef<HTMLDivElement>(null);
  const bossShieldRef = useRef<HTMLDivElement>(null);
  const [hud, setHud] = useState<AirCombatHudSnapshot>(() => makeHudSnapshot(worldRef.current, false, null));
  const [coreChoices, setCoreChoices] = useState<CoreCard[] | null>(null);
  const [tooltipSkill, setTooltipSkill] = useState<SkillId | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showCoreList, setShowCoreList] = useState(false);
  const skillFeedbackUntil = useRef(0);
  const [skillFeedback, setSkillFeedback] = useState<string | null>(null);

  const aircraft = AIRCRAFT_CONFIGS[aircraftId];
  const skillIds = useMemo(() => [...aircraft.skillIds], [aircraft.skillIds]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const setPauseReason = useCallback((reason: PauseReason, enabled: boolean) => {
    const reasons = pauseReasonsRef.current;
    if (enabled) worldRef.current.pauseReasons.add(reason);
    else worldRef.current.pauseReasons.delete(reason);
    if (enabled === reasons.has(reason)) return;
    if (enabled) {
      reasons.add(reason);
      draggingRef.current = false;
      const pointer = playerControlRef.current?.pointerId;
      playerControlRef.current = null;
      if (pointer !== undefined && stageRef.current?.hasPointerCapture(pointer)) stageRef.current.releasePointerCapture(pointer);
      setPlayerInputActive(worldRef.current, false);
    } else {
      reasons.delete(reason);
    }
    setPauseState({ paused: reasons.size > 0, label: pauseLabel(reasons) });
  }, []);

  useEffect(() => {
    const handleVisibility = () => setPauseReason("hidden", document.hidden);
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [setPauseReason]);

  useEffect(() => {
    const host = stageRef.current;
    if (!host) return;
    const world = worldRef.current;
    const overlayFeedback = toastHostRef.current ? new AirCombatOverlayFeedback(toastHostRef.current) : null;
    let cancelled = false;
    let animationFrame = 0;
    let presentation: AirCombatPresentation | null = null;
    let usingLegacy = false;
    let lastTime = performance.now();
    let lastHudUpdate = 0;
    let endedAt: number | null = null;
    const resetClock = () => { lastTime = performance.now(); };
    document.addEventListener("visibilitychange", resetClock);
    setPauseReason("loading", true);
    setRendererState("loading");
    const fallback = async () => {
      presentation?.destroy(); presentation = null;
      usingLegacy = true;
      setPauseReason("loading", true);
      try {
        const legacy = await createLegacyPresentation(host);
        if (cancelled) { legacy.destroy(); return; }
        presentation = legacy;
        setRendererState("legacy"); setPauseReason("loading", false);
        lastTime = performance.now();
      } catch { if (!cancelled) setRendererState("failed"); }
    };
    const frame = (now: number) => {
      if (cancelled) return;
      const elapsed = Math.min(0.12, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      const paused = pauseReasonsRef.current.size > 0;
      if (!document.hidden && presentation) {
        if (!paused && !world.ended) {
          let remaining = elapsed;
          while (remaining > 0 && !world.ended && !world.pendingCoreSelections) {
            const step = Math.min(AIR_COMBAT_WORLD.maxDeltaSeconds, remaining);
            updateCombatWorld(world, step); remaining -= step;
          }
          const choices = ensureCoreSelection(world);
          if (choices) {
            setCoreChoices(choices); setPauseReason("core", true);
            soundManager.playXpFull(); soundManager.triggerHaptic("medium");
          }
        }
        const visualDelta = pauseReasonsRef.current.size > 0 ? 0 : elapsed;
        overlayFeedback?.render(world, visualDelta, pauseReasonsRef.current.size > 0, reducedMotion,
          bossHpRef.current, bossChipRef.current, bossShieldRef.current);
        statusStripRef.current?.update(world);
        for (const id of skillIds) {
          const node = durationNodes.current[id], timer = getActiveSkillDuration(world, id);
          if (node) { node.hidden = !timer; node.style.setProperty("--skill-duration", String(timer?.progress ?? 0)); }
        }
        try { presentation.render(world, visualDelta, reducedMotion); }
        catch {
          if (!usingLegacy) void fallback();
          else { presentation.destroy(); presentation = null; setRendererState("failed"); setPauseReason("loading", true); }
        }
        if (skillFeedbackUntil.current > 0 && world.elapsed >= skillFeedbackUntil.current) {
          skillFeedbackUntil.current = 0; setSkillFeedback(null);
        }
        if (now - lastHudUpdate >= 90) {
          setHud(makeHudSnapshot(world, pauseReasonsRef.current.size > 0, pauseLabel(pauseReasonsRef.current)));
          lastHudUpdate = now;
        }
        // Present the final explosion after gameplay ends without advancing runtime time.
        if (world.ended && !paused && presentation) {
          endedAt ??= now;
          if (now - endedAt >= (reducedMotion ? 180 : 850) && !completedRef.current) {
            completedRef.current = true;
            onCompleteRef.current(summarizeCombatWorld(world)); return;
          }
        }
      }
      animationFrame = requestAnimationFrame(frame);
    };
    void (async () => {
      try {
        const { AirCombatPixiRenderer } = await import("./pixi/AirCombatPixiRenderer");
        if (cancelled) return;
        const renderer = await AirCombatPixiRenderer.create(host);
        if (cancelled) { renderer.destroy(); return; }
        presentation = renderer;
        setRendererState("pixi"); setPauseReason("loading", false);
      } catch { if (!cancelled) await fallback(); }
      if (!cancelled) { lastTime = performance.now(); animationFrame = requestAnimationFrame(frame); }
    })();
    return () => {
      cancelled = true;
      overlayFeedback?.destroy(); cancelAnimationFrame(animationFrame); presentation?.destroy();
      document.removeEventListener("visibilitychange", resetClock);
      const press = pressRef.current;
      if (press?.timer != null) window.clearTimeout(press.timer);
    };
  }, [aircraftId, reducedMotion, setPauseReason]);


  const pointFromEvent = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * AIR_COMBAT_WORLD.width,
      y: ((event.clientY - rect.top) / rect.height) * AIR_COMBAT_WORLD.height,
    };
  };

  const updatePlayerControl = (event: React.PointerEvent<HTMLDivElement>) => {
    const control = playerControlRef.current;
    if (!control || control.pointerId !== event.pointerId) return;
    if (pauseReasonsRef.current.size > 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const coalesced = event.nativeEvent.getCoalescedEvents?.() || [];
    const samples = coalesced.length ? coalesced : [event.nativeEvent];
    for (const sample of samples) {
      const x = ((sample.clientX - rect.left) / rect.width) * AIR_COMBAT_WORLD.width;
      const y = ((sample.clientY - rect.top) / rect.height) * AIR_COMBAT_WORLD.height;
      movePlayerByDelta(worldRef.current, x - control.originX, y - control.originY);
      control.originX = x; control.originY = y;
    }
  };

  const onCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pauseReasonsRef.current.size > 0 || playerControlRef.current) return;
    event.preventDefault();
    const point = pointFromEvent(event);
    draggingRef.current = true;
    playerControlRef.current = {
      pointerId: event.pointerId,
      originX: point.x,
      originY: point.y,
    };
    setPlayerInputActive(worldRef.current, true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const stopPlayerInput = (pointerId?: number) => {
    const control = playerControlRef.current;
    if (pointerId !== undefined && control && control.pointerId !== pointerId) return;
    draggingRef.current = false;
    playerControlRef.current = null;
    setPlayerInputActive(worldRef.current, false);
  };

  const closeTooltip = useCallback(() => {
    setTooltipSkill(null);
    setPauseReason("tooltip", false);
  }, [setPauseReason]);

  const onSkillPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    skillId: SkillId
  ) => {
    if (pauseReasonsRef.current.size > 0 || worldRef.current.ended || pressRef.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const press: SkillPressState = {
      skillId,
      pointerId: event.pointerId,
      startedAt: performance.now(),
      timer: null,
      held: false,
    };
    press.timer = window.setTimeout(() => {
      if (pressRef.current !== press) return;
      press.held = true;
      setTooltipSkill(skillId);
      setPauseReason("tooltip", true);
    }, AIR_COMBAT_WORLD.longPressMs);
    pressRef.current = press;
  };

  const finishSkillPress = (
    event: React.PointerEvent<HTMLButtonElement>,
    cancelled = false
  ) => {
    const press = pressRef.current;
    if (!press || press.pointerId !== event.pointerId) return;
    if (press.timer !== null) window.clearTimeout(press.timer);
    const durationMs = performance.now() - press.startedAt;
    const classification = classifySkillPress(durationMs);
    pressRef.current = null;
    if (press.held || classification === "hold") {
      closeTooltip();
      return;
    }
    if (!shouldCastSkillPress(durationMs, press.held, cancelled) || pauseReasonsRef.current.size > 0 || worldRef.current.ended) return;
    const result = castWorldSkill(worldRef.current, press.skillId);
    if (!result.cast) {
      soundManager.playError();
      soundManager.triggerHaptic("light");
      skillFeedbackUntil.current = worldRef.current.elapsed + 1.3;
      setSkillFeedback(result.reason === "resource" ? "Không đủ tài nguyên" : "Kỹ năng đang hồi");
    } else {
      soundManager.playClick();
      soundManager.triggerHaptic(press.skillId === "heavy_bomb" ? "medium" : "light");
    }
  };

  const chooseCore = (card: CoreCard) => {
    if (coreSelectingRef.current) return;
    coreSelectingRef.current = true;
    const applied = selectCore(worldRef.current, card);
    if (applied) {
      soundManager.playBubblePop();
      soundManager.triggerHaptic("medium");
      setCoreChoices(null);
      setPauseReason("core", false);
    }
    window.setTimeout(() => {
      coreSelectingRef.current = false;
    }, 160);
  };

  const openExit = () => {
    setShowExitConfirm(true);
    setPauseReason("exit", true);
  };

  const closeExit = () => {
    setShowExitConfirm(false);
    setPauseReason("exit", false);
  };

  const resourceLabel = hud.stats.resourceKind === "mana" ? "Mana" : "Energy";
  const hpRatio = Math.max(0, Math.min(1, hud.stats.currentHp / hud.stats.maxHp));
  const xpRatio = hud.combatXpRequired > 0 ? Math.max(0, Math.min(1, worldRef.current.aircraft.combatXp / hud.combatXpRequired)) : 1;
  const tooltipModel = tooltipSkill ? getSkillTooltipModel(worldRef.current.aircraft, tooltipSkill) : null;

  useEffect(() => {
    const message = hud.latestMessage;
    if (!message || message === announcementRef.current) return;
    announcementRef.current = message;
    if (/RADAR|TRÙM|GIAI ĐOẠN|PHÁO ĐÀI/.test(message)) {
      soundManager.playSignalTone(8, 9);
      soundManager.triggerHaptic("heavy");
    } else if (/CẤP CHIẾN ĐẤU/.test(message)) {
      soundManager.playBubblePop();
      soundManager.triggerHaptic("medium");
    }
  }, [hud.latestMessage]);

  useEffect(() => {
    if (hpRatio <= 0.25 && !lowHpWarnedRef.current) {
      lowHpWarnedRef.current = true;
      soundManager.playSignalError();
      soundManager.triggerHaptic("heavy");
    } else if (hpRatio > 0.4) {
      lowHpWarnedRef.current = false;
    }
  }, [hpRatio]);

  return (
    <div
      className="air-combat-surface relative aspect-[1/2] w-full max-w-[min(460px,calc((100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-12px)*0.5))] select-none touch-none overflow-hidden rounded-none border border-cyan-400/30 bg-black shadow-2xl shadow-black/80"
      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none", touchAction: "none" }}
      onContextMenu={(e) => e.preventDefault()}
      data-air-combat-runtime="big-update-pixi"
      data-renderer={rendererState}
      data-gameplay-safe-top={GAMEPLAY_SAFE_RECT.top}
      data-aircraft={aircraftId}
      data-player-x={worldRef.current.playerX.toFixed(2)}
      data-player-y={worldRef.current.playerY.toFixed(2)}
      data-player-control="relative-drag"
      data-aircraft-heading="up"
      data-player-input={worldRef.current.playerInputActive ? "active" : "idle"}
      data-drone-x={worldRef.current.droneX.toFixed(2)}
      data-drone-y={worldRef.current.droneY.toFixed(2)}
      data-drone-target={worldRef.current.droneTargetId ?? "none"}
      data-missiles-pending={worldRef.current.missilesPending}
      data-shield-active={(worldRef.current.aircraft.activeEffects.armor_shield || 0) > 0}
      data-player-bombs={worldRef.current.warnings.filter((warning) => warning.kind === "player_bomb").length}
    >
      <AirCombatPixiStage
        ref={stageRef}
        className="air-combat-surface absolute inset-x-0 top-0 h-[88.8889%] w-full select-none touch-none"
        style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none", touchAction: "none" }}
        aria-label="Chiến trường Không Kích"
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={onCanvasPointerDown}
        onPointerMove={(event) => draggingRef.current && updatePlayerControl(event)}
        onPointerUp={(event) => {
          updatePlayerControl(event);
          stopPlayerInput(event.pointerId);
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={(event) => stopPlayerInput(event.pointerId)}
        onLostPointerCapture={(event) => stopPlayerInput(event.pointerId)}
      />

      {rendererState === "loading" && <div role="status" className="pointer-events-none absolute inset-0 z-30 grid place-items-center bg-slate-950 text-sm text-cyan-100">Đang chuẩn bị chiến trường…</div>}
      {rendererState === "failed" && <div role="alert" className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-slate-950 text-sm text-white"><p>Không thể mở chiến trường trên thiết bị này.</p><button type="button" onClick={onExit} className="rounded-xl border border-cyan-300 px-5 py-3">Quay lại</button></div>}
      {rendererState === "legacy" && <span className="pointer-events-none absolute right-2 top-[13%] z-10 text-[8px] text-slate-400">Hiển thị tương thích</span>}
      {hpRatio < 0.3 && <div className="pointer-events-none absolute inset-0 z-[5] rounded-2xl" style={{ boxShadow: "inset 0 0 55px rgba(225,29,72," + ((0.3 - hpRatio) * 1.6) + ")" }} />}
      <section className="air-combat-hud absolute inset-x-0 top-0 z-10 border-b border-cyan-300/30 bg-slate-950/95 text-white" style={{ height: AIR_COMBAT_WORLD.hudHeight / 720 * 100 + "%" }} data-hud-region="fixed">
        <div className="air-combat-hud-heading">
          <div className="min-w-0">
            <div className="truncate font-black" style={{ color: aircraft.color }}>{aircraft.code} · {aircraft.name}</div>
            <div className="mt-0.5 text-slate-300">{hud.waveLabel} · {formatTime(hud.elapsedSeconds)}</div>
          </div>
          <div className="text-right tabular-nums">
            <strong className="text-[3.8cqw] text-amber-300" data-hud-score={hud.score}>{hud.score.toLocaleString("vi-VN")}</strong>
            <div className="text-amber-200">{hud.comboKills} COMBO ×{hud.comboMultiplier}</div>
          </div>
          <div className="flex gap-1">
            <button type="button" aria-label="Danh sách lõi" title="Danh sách lõi" disabled={!!coreChoices} className="air-core-list-button" onClick={() => { setShowCoreList(true); setPauseReason("coreList", true); }}><Layers aria-hidden="true"/><span>Lõi</span></button>
            <button type="button" aria-label={pauseReasonsRef.current.has("user") ? "Tiếp tục" : "Tạm dừng"} onClick={() => setPauseReason("user", !pauseReasonsRef.current.has("user"))}>{pauseReasonsRef.current.has("user") ? <Play /> : <Pause />}</button>
            <button type="button" aria-label="Thoát trận" onClick={openExit} className="text-rose-300"><X /></button>
          </div>
        </div>
        <CombatStatChips stats={hud.stats} baseline={getEffectiveAircraftStats(worldRef.current.aircraft, false)} />
        <div className="flex items-center gap-2 text-lime-200 tabular-nums">
          <span className="shrink-0">Cấp {worldRef.current.aircraft.level}</span>
          <div role="progressbar" aria-label="Kinh nghiệm chiến đấu" aria-valuenow={Math.floor(worldRef.current.aircraft.combatXp)} aria-valuemin={0} aria-valuemax={Math.max(1,hud.combatXpRequired)} className="air-xp-bar h-1 flex-1 overflow-hidden bg-emerald-950"><div className="h-full bg-lime-300" style={{ width: xpRatio * 100 + "%" }} /></div>
          <span>{worldRef.current.aircraft.level >= 30 ? "TỐI ĐA" : `${Math.floor(worldRef.current.aircraft.combatXp)}/${hud.combatXpRequired} XP`}</span>
        </div>
        <span className="sr-only">HP {Math.ceil(hud.stats.currentHp)}/{hud.stats.maxHp}; {resourceLabel} {Math.floor(hud.stats.currentResource)}/{hud.stats.maxResource}</span>
      </section>

      {hud.bossMaxHp > 0 && (
        <div className="air-boss-hud" style={{ top: `${AIR_COMBAT_WORLD.hudHeight / 720 * 100}%`, height: `${BOSS_HUD_HEIGHT / 720 * 100}%` }} data-boss-phase={hud.bossPhase}>
          <div className="flex justify-between text-[7px] font-black uppercase text-rose-200"><span>Leviathan X-99 · Giai đoạn {hud.bossPhase}</span><span>{Math.ceil(hud.bossHp).toLocaleString("vi-VN")}</span></div>
          <div className="air-boss-health relative mt-1 h-1.5 overflow-hidden bg-black">
            <div ref={bossShieldRef} className="absolute inset-y-0 left-0 bg-slate-200" />
            <div ref={bossChipRef} className="absolute inset-y-0 left-0 bg-white" />
            {[.7,.35,.15].map(mark => <i key={mark} className="air-boss-phase-marker" style={{left:`${mark*100}%`}} />)}
            <div ref={bossHpRef} className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-700 via-rose-500 to-orange-300" />
          </div>
        </div>
      )}

      <AirCombatStatusStrip ref={statusStripRef} top={AIR_COMBAT_WORLD.hudHeight + (hud.bossMaxHp > 0 ? BOSS_HUD_HEIGHT : 0)} />

      <div className="absolute inset-x-0 bottom-0 z-20 grid h-[11.1111%] grid-cols-3 gap-2 border-t border-cyan-900/50 bg-slate-950 p-1.5" data-skill-rail="bottom">
        {skillIds.map((skillId) => {
          const skill = SKILL_CONFIGS[skillId];
          const values = getSkillRuntimeValues(worldRef.current.aircraft, skillId);
          const cooldown = hud.cooldowns[skillId] || 0;
          const borrow=canBorrowSkill(worldRef.current.aircraft,skillId);
          const active = skillId === "escort_drone" ? hud.droneActive : (worldRef.current.aircraft.activeEffects[skillId] || 0) > 0;
          const locked = skillsLocked(worldRef.current.aircraft) || playerSkillLocked(worldRef.current.aircraft);
          const free = hasCore(worldRef.current.aircraft,84) && (worldRef.current.aircraft.coreState.skillCasts+1)%4===0;
          const toggleActive = (skillId === "escort_drone" || skillId === "sweeping_cannon") && active;
          const unavailable = locked || (!toggleActive && (Boolean(worldRef.current.aircraft.coreState.stacks[`debt:${skillId}`]) || cooldown > 0 && !borrow || (!free || skillId === "escort_drone") && hud.stats.currentResource < values.cost));
          return (
            <button
              key={skillId}
              type="button"
              data-skill-id={skillId}
              data-skill-cost={values.cost}
              data-borrow-ready={borrow && !locked}
              data-reduced-motion={reducedMotion}
              aria-label={`${skill.name}, ${skillId === "escort_drone" ? "cần ít nhất 5 Điện, không trừ phí bật" : `tốn ${free ? 0 : values.cost} ${resourceLabel}`}`}
              aria-disabled={unavailable}
              aria-pressed={active}
              onPointerDown={(event) => onSkillPointerDown(event, skillId)}
              onPointerUp={(event) => finishSkillPress(event)}
              onPointerCancel={(event) => finishSkillPress(event, true)}
              onLostPointerCapture={(event) => finishSkillPress(event, true)}
              onContextMenu={(event) => event.preventDefault()}
              style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none", touchAction: "none" }}
              className={`relative flex h-full min-h-11 touch-none select-none flex-col items-center justify-center overflow-hidden rounded-none border text-center shadow-lg backdrop-blur transition-transform active:scale-95 ${active ? "border-emerald-200 bg-emerald-500/30 text-emerald-50 shadow-emerald-500/20" : unavailable ? "border-slate-700 bg-black/80 text-slate-500" : "border-cyan-200/70 bg-gradient-to-br from-cyan-950/95 to-indigo-950/95 text-cyan-50 shadow-cyan-500/15"}`}
            >
              {cooldown > 0 && !borrow && <span className="pointer-events-none absolute inset-0 z-0" style={{ background: `conic-gradient(rgba(2,6,23,.42) ${(Math.min(1, cooldown / (values.cooldown * (1 - hud.stats.cooldownReduction)))) * 360}deg, transparent 0deg)` }} />}
              <span className={`absolute left-1 top-1 z-20 rounded px-1 text-[6px] font-black ${hud.stats.resourceKind === "mana" ? "bg-sky-950/90 text-sky-200" : "bg-violet-950/90 text-violet-200"}`}>{skillId === "escort_drone" ? "≥5" : free ? 0 : values.cost}</span>
              {skillId === "escort_drone" && active && <span className="absolute right-1 top-1 z-20 text-[6px] font-black text-violet-200">-{values.upkeepPerSecond}/s</span>}
              <span className="air-skill-icon-wrap">
              <span className="air-skill-duration" ref={node => { durationNodes.current[skillId] = node; }} hidden><span /></span>
              <CombatUiIcon kind="skill" id={skillId} fallback={skill.icon} className="combat-skill-icon relative z-10" />
              </span>
              <span className="relative z-10 mt-0.5 max-w-[52px] truncate text-[7px] font-black uppercase">{skill.shortName}</span>
              <span className={`relative z-10 text-[7px] font-black tabular-nums ${active ? "text-emerald-200" : unavailable ? "text-slate-500" : "text-cyan-200"}`}>{locked ? "ĐÃ KHÓA" : borrow ? "Có thể dùng ngay" : worldRef.current.aircraft.coreState.stacks[`debt:${skillId}`] ? "ĐANG BẬT" : cooldown > 0 ? cooldown.toFixed(1) : active ? "ĐANG BẬT" : unavailable ? "THIẾU " + resourceLabel.toUpperCase() : "SẴN SÀNG"}</span>
            </button>
          );
        })}

      </div>

      {tooltipSkill && tooltipModel && (
        <aside className="air-skill-tooltip" data-skill-tooltip={tooltipSkill} onPointerDown={event => event.stopPropagation()} onPointerMove={event => event.stopPropagation()}>
          <div className="air-tooltip-heading"><h3>{tooltipModel.title}</h3><strong>{tooltipModel.cooldown.toFixed(1).replace(".", ",")}s</strong></div>
          <p>{tooltipModel.description}</p>
          <div className="air-tooltip-details">{tooltipModel.detailRows.map(row => <div key={row}>{row}</div>)}</div>
        </aside>
      )}

      <div ref={toastHostRef} className="air-core-toasts" aria-live="polite" aria-label="Lõi vừa nhận" />
      {hud.waveCountdown > 0 && !hud.paused && <div className="air-wave-countdown">Đợt tiếp theo sau<strong>{hud.waveCountdown}</strong></div>}
      {(hud.latestMessage || skillFeedback) && !coreChoices && (
        <div className="pointer-events-none absolute left-1/2 top-[21%] z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-300/40 bg-black/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-cyan-100 shadow-lg shadow-cyan-950/30">{skillFeedback || hud.latestMessage}</div>
      )}


      {coreChoices && (
        <AppModal archetype="transaction" layer="exclusive-dialog" layout="viewport-safe" closeOnEscape={false}
          reducedMotion={reducedMotion} labelledBy="air-core-choice-title" overlayClassName="air-upgrade-overlay" panelClassName="air-upgrade-panel">
          <h2 id="air-core-choice-title">CHỌN MỘT NÂNG CẤP</h2>
          <div key={worldRef.current.coreSelectionCount} className="air-upgrade-choices" data-core-selection="open" data-reduced-motion={reducedMotion}>
            {coreChoices.map((card, slot) => <div className="air-upgrade-row" key={slot} style={{"--slot":slot} as React.CSSProperties}>
              <button key={card.id} type="button" data-core-choice={card.id} data-core-tier={card.tier}
                data-rerolled={worldRef.current.coreSelectionEvent?.rerollUsedBySlot[slot] || false}
                onClick={() => chooseCore(card)} className="combat-core-card air-upgrade-card">
                <CombatUiIcon kind="core" id={card.id} fallback={card.icon} className="combat-core-icon" />
                <span className="air-upgrade-copy"><strong className="combat-core-name">{card.name}</strong>
                  <span className="air-upgrade-description"><CoreDescription text={card.description} /></span></span>
              </button>
              <button type="button" className="air-core-reroll" aria-label={`Đổi lựa chọn ${slot+1}`}
                disabled={!canRerollCore(worldRef.current,slot)} data-used={worldRef.current.coreSelectionEvent?.rerollUsedBySlot[slot] || false}
                onClick={() => { const choices=rerollCore(worldRef.current,slot); if(choices)setCoreChoices([...choices]); }}>
                <span aria-hidden="true">🔄️</span>
              </button>
            </div>)}
          </div>
        </AppModal>
      )}

      {showCoreList && !coreChoices && <AirCombatCoreList state={worldRef.current.aircraft} onClose={() => { setShowCoreList(false); setPauseReason("coreList", false); }} />}

      {pauseReasonsRef.current.has("user") && !coreChoices && !showExitConfirm && !showCoreList && (
        <ConfirmationDialog status="warning" layer="exclusive-dialog" layout="viewport-safe" onClose={() => setPauseReason("user", false)} labelledBy="air-paused-title" panelClassName="text-center">
          <OverlayHeader><Pause className="mx-auto h-8 w-8 text-[var(--modal-info)]" /><h2 id="air-paused-title" className="modal-title">Đã tạm dừng</h2></OverlayHeader>
          <OverlayBody data-pause-overlay="user"><p className="text-xs text-[var(--modal-text)]">Hồi tài nguyên, hồi chiêu và thời gian trận đều đứng yên.</p></OverlayBody>
          <OverlayFooter><ModalButton variant="primary" type="button" onClick={() => setPauseReason("user", false)} className="w-full"><Play className="h-4 w-4" /> Tiếp tục</ModalButton></OverlayFooter>
        </ConfirmationDialog>
      )}

      {showExitConfirm && (
        <ConfirmationDialog status="warning" layer="exclusive-dialog" layout="viewport-safe" onClose={closeExit} labelledBy="air-exit-title" panelClassName="text-center">
          <OverlayHeader><ArrowLeft className="mx-auto h-8 w-8 text-[var(--modal-danger)]" /><h2 id="air-exit-title" className="modal-title">Rời lượt xuất kích?</h2></OverlayHeader>
          <OverlayBody data-exit-confirm="open"><p className="text-xs leading-relaxed text-[var(--modal-text)]">Lượt hiện tại sẽ kết thúc và không nhận thưởng.</p></OverlayBody>
          <OverlayFooter data-stack-actions="true"><ModalButton variant="ghost" type="button" onClick={closeExit}>Ở lại</ModalButton><ModalButton variant="danger" type="button" onClick={onExit}>Rời trận</ModalButton></OverlayFooter>
        </ConfirmationDialog>
      )}

      {pauseState.paused && pauseState.label && pauseReasonsRef.current.has("hidden") && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/90 px-3 py-1 text-[8px] font-bold text-slate-300">{pauseState.label}</div>
      )}
    </div>
  );
};
