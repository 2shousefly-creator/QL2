import { AirCombatEquipmentInventory } from "./AirCombatEquipmentInventory";
import { expansionState } from "./airCombatExpansion";
import { releaseState, overheated } from "./airCombatReleaseState";
import { reserveCap } from "./airCombatSelectionRules";
import { CORE_SYSTEM_LABELS } from "./airCombatCoreSystems";
import { AirCombatTacticalHud, type HubTooltip } from "./AirCombatTacticalHud";
import { CoreSystemTag } from "./CoreSystemTag";
import { AnimatePresence, motion } from "motion/react";
import { AirCombatModal as AppModal, AirCombatConfirmation as ConfirmationDialog, airTooltipMotion } from "./AirCombatMotion";
import { getAirCombatStage } from "./airCombatStages";
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
import "./combat-ui.css";
import { ArrowLeft, Pause, Play, X } from "lucide-react";
import { soundManager } from "../../../game/audio";
import { ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";
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
  stageId: number;
  aircraftId: AircraftId;
  reducedMotion: boolean;
  onComplete: (summary: AirCombatRunSummary) => void;
  onExit: () => void;
}

type PauseReason = "loading" | "user" | "core" | "tooltip" | "exit" | "hidden" | "coreList" | "motion" | "primarySkill" | "equipment";

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

function pauseLabel(reasons: ReadonlySet<PauseReason>): string | null {
  if (reasons.has("core")) return "Chọn lõi";
  if (reasons.has("equipment")) return "Kho Trang Bị";
  if (reasons.has("coreList")) return "Danh sách lõi";
  if (reasons.has("tooltip")) return "Xem thông tin";
  if (reasons.has("exit")) return "Xác nhận thoát";
  if (reasons.has("hidden")) return "Ứng dụng tạm ẩn";
  if (reasons.has("user")) return "Tạm dừng";
  return null;
}

export const AirCombatBattle: React.FC<AirCombatBattleProps> = ({
  aircraftId,
  stageId,
  reducedMotion,
  onComplete,
  onExit,
}) => {
  const statusStripRef = useRef<StatusStripHandle>(null);
  const durationNodes = useRef<Partial<Record<SkillId, HTMLSpanElement | null>>>({});
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [rendererState, setRendererState] = useState<"loading" | "pixi" | "legacy" | "failed">("loading");
  const [world] = useState(() => createCombatWorld(aircraftId, undefined, stageId));
  const worldRef = useRef<CombatWorld>(world);
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
  const [hubTooltip, setHubTooltip] = useState<(HubTooltip & {id:string}) | null>(null);
  const tooltipOwner = useRef<"hub"|"skill"|"status"|null>(null);
  const [primaryChoice, setPrimaryChoice] = useState<SkillId | null>(null);
  const [showPrimaryChoice, setShowPrimaryChoice] = useState(false);
  const [tooltipSkill, setTooltipSkill] = useState<SkillId | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showCoreList, setShowCoreList] = useState(false);
  const [showEquipment,setShowEquipment]=useState(false);
  const skillFeedbackUntil = useRef(0);
  const [skillFeedback, setSkillFeedback] = useState<string | null>(null);

  const aircraft = AIRCRAFT_CONFIGS[aircraftId];
  const skillIds = useMemo(() => [...aircraft.skillIds], [aircraft.skillIds]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const motionPauseTimer=useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(()=>()=>clearTimeout(motionPauseTimer.current),[]);
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
      if (["user","tooltip","exit","coreList","primarySkill","equipment"].includes(reason)) {
        reasons.add("motion");worldRef.current.pauseReasons.add("motion");
        clearTimeout(motionPauseTimer.current);
        motionPauseTimer.current=setTimeout(()=>{
          reasons.delete("motion");worldRef.current.pauseReasons.delete("motion");
          setPauseState({paused:reasons.size>0,label:pauseLabel(reasons)});
        },reducedMotion?100:280);
      }
    }
    setPauseState({ paused: reasons.size > 0, label: pauseLabel(reasons) });
  }, [reducedMotion]);

  const activateTooltip = useCallback((owner: "hub"|"skill"|"status") => {
    tooltipOwner.current = owner;
    setPauseReason("tooltip", true);
    if (owner !== "status") statusStripRef.current?.close();
    if (owner !== "skill") setTooltipSkill(null);
    if (owner !== "hub") setHubTooltip(null);
  }, [setPauseReason]);
  const closeAllTooltips = useCallback(() => {
    tooltipOwner.current = null;
    statusStripRef.current?.close(); setTooltipSkill(null); setHubTooltip(null);
    setPauseReason("tooltip", false);
  }, [setPauseReason]);
  const onStatusTooltip = useCallback((open: boolean) => {
    if (open) activateTooltip("status");
    else if (tooltipOwner.current === "status") closeAllTooltips();
  }, [activateTooltip, closeAllTooltips]);
  const inspectHub = (id: string, tooltip: HubTooltip) => {
    if (tooltipOwner.current === "hub" && hubTooltip?.id === id) { closeAllTooltips(); return; }
    activateTooltip("hub"); setHubTooltip({ id, ...tooltip });
  };
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!(event.target as Element).closest?.("[data-combat-tooltip-trigger], [data-combat-tooltip-panel]")) closeAllTooltips();
    };
    const escape = (event: KeyboardEvent) => { if(event.key === "Escape") closeAllTooltips(); };
    document.addEventListener("pointerdown", outside, true); document.addEventListener("keydown", escape);
    return () => {document.removeEventListener("pointerdown", outside, true);document.removeEventListener("keydown", escape);};
  }, [closeAllTooltips]);

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
    let publishedWaveState = world.waveState, publishedWaveIndex = world.waveIndex;
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
        const legacy = await createLegacyPresentation(host, world.stageId);
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
        if (now - lastHudUpdate >= 90 || publishedWaveState !== world.waveState || publishedWaveIndex !== world.waveIndex) {
          publishedWaveState = world.waveState; publishedWaveIndex = world.waveIndex;
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
    if (tooltipOwner.current === "skill") closeAllTooltips();
  }, [closeAllTooltips]);

  const onSkillPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    skillId: SkillId
  ) => {
    if ([...pauseReasonsRef.current].some(reason=>reason!=="tooltip" && reason!=="motion") || worldRef.current.ended || pressRef.current) return;
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
      activateTooltip("skill");
      setTooltipSkill(skillId);
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
      const primaryPending = expansionState(worldRef.current.aircraft).primaryPending;
      if (primaryPending) {
        setPauseReason("primarySkill", true); setShowPrimaryChoice(true);
      }
      setPauseReason("core", false);
      if (!primaryPending && worldRef.current.pendingCoreSelections > 0) {
        const next=ensureCoreSelection(worldRef.current);
        if (next) { setCoreChoices(next);setPauseReason("core",true); }
        else if (expansionState(worldRef.current.aircraft).primaryPending) { setPauseReason("primarySkill",true);setShowPrimaryChoice(true); }
      }
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
        <AirCombatTacticalHud world={worldRef.current} hud={hud} reducedMotion={reducedMotion} coreChoice={!!coreChoices || showEquipment || showCoreList || showPrimaryChoice || showExitConfirm}
          onEquipment={()=>{setPauseReason("equipment",true);closeAllTooltips();setShowEquipment(true);}}
          onInspect={inspectHub} onCores={()=>{setPauseReason("coreList",true);closeAllTooltips();setShowCoreList(true);}}
          onPause={()=>{setPauseReason("user",true);closeAllTooltips();}}/>
        <span className="sr-only">HP {Math.round(hud.stats.currentHp)}/{Math.round(hud.stats.maxHp)}; {resourceLabel} {Math.round(hud.stats.currentResource)}/{Math.round(hud.stats.maxResource)}</span>
      </section>

      {hud.bossMaxHp > 0 && (
        <div className="air-boss-hud" style={{ top: `${AIR_COMBAT_WORLD.hudHeight / 720 * 100}%`, height: `${BOSS_HUD_HEIGHT / 720 * 100}%` }} data-boss-phase={hud.bossPhase}>
          <div className="flex justify-between text-[7px] font-black uppercase text-rose-200"><span>{getAirCombatStage(stageId)?.bossName} · Giai đoạn {hud.bossPhase}</span><span>{Math.round(hud.bossHp).toLocaleString("vi-VN")}</span></div>
          {stageId === 2 && <div className="air-guardian-hud"><span>VỆ TINH: {hud.guardianSlots.map((alive,slot)=><i key={slot} data-alive={alive}>●</i>)}</span><span>{hud.guardianSlots.some(Boolean) ? "BẢO HỘ: -35% SÁT THƯƠNG" : "BẢO HỘ ĐÃ PHÁ"}</span></div>}
          <div className="air-boss-health relative mt-1 h-1.5 overflow-hidden bg-black">
            <div ref={bossShieldRef} className="absolute inset-y-0 left-0 bg-slate-200" />
            <div ref={bossChipRef} className="absolute inset-y-0 left-0 bg-white" />
            {(stageId === 2 ? [.75,.5,.25,.1] : [.7,.35,.15]).map(mark => <i key={mark} className="air-boss-phase-marker" style={{left:`${mark*100}%`}} />)}
            <div ref={bossHpRef} className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-700 via-rose-500 to-orange-300" />
          </div>
        </div>
      )}

      <AirCombatStatusStrip ref={statusStripRef} onTooltipChange={onStatusTooltip} top={AIR_COMBAT_WORLD.hudHeight + (hud.bossMaxHp > 0 ? BOSS_HUD_HEIGHT : 0)} />

      <div className="absolute inset-x-0 bottom-0 z-20 grid h-[11.1111%] grid-cols-3 gap-2 border-t border-cyan-900/50 bg-slate-950 p-1.5" data-skill-rail="bottom">
        {skillIds.map((skillId) => {
          const skill = SKILL_CONFIGS[skillId];
          const values = getSkillRuntimeValues(worldRef.current.aircraft, skillId);
          const cooldown = hud.cooldowns[skillId] || 0;
          const borrow=canBorrowSkill(worldRef.current.aircraft,skillId);
          const active = skillId === "escort_drone" ? hud.droneActive : (worldRef.current.aircraft.activeEffects[skillId] || 0) > 0;
          const locked = skillsLocked(worldRef.current.aircraft) || playerSkillLocked(worldRef.current.aircraft);
          const free = hasCore(worldRef.current.aircraft,84) && (worldRef.current.aircraft.coreState.skillCasts+1)%4===0;
          const toggleActive = (skillId === "orbit_reversal" || skillId === "escort_drone" || skillId === "sweeping_cannon") && active;
          const unavailable = overheated(worldRef.current.aircraft) || locked || (!toggleActive && (Boolean(worldRef.current.aircraft.coreState.stacks[`debt:${skillId}`]) || cooldown > 0 && !borrow || (!free || skillId === "escort_drone") && hud.stats.currentResource < values.cost));
          return (
            <button
              key={skillId}
              type="button"
              data-skill-id={skillId}
              data-combat-tooltip-trigger="skill"
              data-primary-skill={expansionState(worldRef.current.aircraft).primarySkill === skillId}
              data-skill-cost={values.cost}
              data-borrow-ready={borrow && !locked}
              data-reduced-motion={reducedMotion}
              aria-label={`${skill.name}, ${skillId === "escort_drone" ? "cần ít nhất 5 Điện, không trừ phí bật" : `tốn ${free ? 0 : Math.round(values.cost)} ${resourceLabel}`}`}
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
              <span className={`absolute left-1 top-1 z-20 rounded px-1 text-[6px] font-black ${hud.stats.resourceKind === "mana" ? "bg-sky-950/90 text-sky-200" : "bg-violet-950/90 text-violet-200"}`}>{skillId === "escort_drone" ? "≥5" : free ? 0 : Math.round(values.cost)}</span>
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

      {hud.waveState === "countdown" && hud.waveCountdown > 0 && <div className="air-wave-countdown">Đợt tiếp theo sau<strong>{hud.waveCountdown}</strong></div>}
      <AnimatePresence>
      {hubTooltip && <motion.aside key="hub-tooltip" {...airTooltipMotion} className="air-hub-tooltip" data-combat-tooltip-panel="hub" role="status">
        <div className="air-tooltip-heading"><strong>{hubTooltip.title}</strong><button type="button" aria-label="Đóng thông tin" onClick={closeAllTooltips}><X/></button></div>
        <p>{hubTooltip.text}</p>
      </motion.aside>}
      {tooltipSkill && tooltipModel && (
        <motion.aside key="skill-tooltip" {...airTooltipMotion} transition={{...airTooltipMotion.transition,duration:reducedMotion?.1:.28}} className="air-skill-tooltip" data-combat-tooltip-panel="skill" data-skill-tooltip={tooltipSkill} onPointerDown={event => event.stopPropagation()} onPointerMove={event => event.stopPropagation()}>
          <div className="air-tooltip-heading"><h3>{tooltipModel.title}</h3><strong style={{color:"#fde047"}}>Hồi chiêu: {tooltipModel.cooldown.toFixed(1).replace(".", ",")}s</strong></div>
          <p><CoreDescription text={tooltipModel.description}/></p>
          <div className="air-tooltip-details">{tooltipModel.detailRows.map(row => <div key={row}><CoreDescription text={row}/></div>)}</div>
          {tooltipModel.coreRows.map(row=><p key={row} style={{color:"#fde047"}}><CoreDescription text={row}/></p>)}
        </motion.aside>
      )}

      <div key="core-toasts" ref={toastHostRef} className="air-core-toasts" aria-live="polite" aria-label="Lõi vừa nhận" />
      {(hud.latestMessage || skillFeedback) && !coreChoices && (
        <div key="combat-message" className="pointer-events-none absolute left-1/2 top-[21%] z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-300/40 bg-black/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-cyan-100 shadow-lg shadow-cyan-950/30">{skillFeedback || hud.latestMessage}</div>
      )}


      {coreChoices && (
        <AppModal key="core-choice" exitDuration={90} archetype="transaction" layer="exclusive-dialog" layout="viewport-safe" closeOnEscape={false}
          reducedMotion={reducedMotion} labelledBy="air-core-choice-title" overlayClassName="air-upgrade-overlay" panelClassName="air-upgrade-panel">
          <h2 id="air-core-choice-title">CHỌN MỘT NÂNG CẤP</h2>
          {worldRef.current.coreSelectionEvent?.context.kind==="normal"&&<div className="air-selection-rules">
            {hasCore(worldRef.current.aircraft,211)&&<span>Lọc reroll: ưu tiên Hệ khác</span>}
            {hasCore(worldRef.current.aircraft,212)&&<span>Reroll Dự Phòng: {worldRef.current.coreSelectionEvent?.extraAvailable&&!worldRef.current.coreSelectionEvent?.extraUsed?"1":"0"}</span>}
            {hasCore(worldRef.current.aircraft,213)&&<span>Đang nhớ {Object.keys(releaseState(worldRef.current.aircraft).refused).length} ID từ chối</span>}
            {hasCore(worldRef.current.aircraft,215)&&<span>Chuyên tuyến: {CORE_SYSTEM_LABELS[releaseState(worldRef.current.aircraft).system??"utility"]}</span>}
            {hasCore(worldRef.current.aircraft,217)&&<span>Bạc 25% · Vàng 40% · Kim Cương 35%</span>}
            {hasCore(worldRef.current.aircraft,218)&&<span>Reroll Dự Trữ: {releaseState(worldRef.current.aircraft).reserve} / {reserveCap(worldRef.current.aircraft)}</span>}
          </div>}
          <div key={worldRef.current.coreSelectionCount} className="air-upgrade-choices" data-core-selection="open" data-reduced-motion={reducedMotion}>
            {coreChoices.map((card, slot) => <div className="air-upgrade-row" key={slot} style={{"--slot":slot} as React.CSSProperties}>
              <button key={card.id} type="button" data-core-choice={card.id} data-core-tier={card.tier} data-core-system={card.system}
                data-rerolled={worldRef.current.coreSelectionEvent?.rerollUsedBySlot[slot] || false}
                onClick={() => chooseCore(card)} className="combat-core-card air-upgrade-card">
                <CombatUiIcon kind="core" id={card.id} fallback={card.icon} className="combat-core-icon" />
                <span className="air-upgrade-copy"><strong className="combat-core-name">{card.name}</strong>
                  <CoreSystemTag system={card.system} tier={card.tier} />
                  {worldRef.current.coreSelectionEvent?.guaranteedSlot===slot&&<small>Ô bảo đảm Chuyên Tuyến</small>}
                  <span className="air-upgrade-description"><CoreDescription text={card.description} /></span></span>
              </button>
              <div className="air-reroll-controls"><button type="button" className="air-core-reroll" aria-label={`Đổi lựa chọn ${slot+1}`}
                disabled={!canRerollCore(worldRef.current,slot)} data-used={worldRef.current.coreSelectionEvent?.rerollUsedBySlot[slot] || false}
                onClick={() => { const choices=rerollCore(worldRef.current,slot); if(choices)setCoreChoices([...choices]); }}>
                <span aria-hidden="true">🔄️</span>
              </button>
              {worldRef.current.coreSelectionEvent?.context.kind==="normal"&&(["extra","reserve"] as const).filter(source=>hasCore(worldRef.current.aircraft,source==="extra"?212:218)).map(source=>
                <button key={source} type="button" className="air-core-reroll air-extra-reroll" aria-label={(source==="extra"?"Dùng Reroll Dự Phòng":"Dùng Reroll Dự Trữ")+` cho ô ${slot+1}`}
                  disabled={!canRerollCore(worldRef.current,slot,source)} onClick={()=>{const choices=rerollCore(worldRef.current,slot,source);if(choices)setCoreChoices([...choices]);}}>{source==="extra"?"Phụ":"Kho"}</button>)}
              </div>
            </div>)}
          </div>
        </AppModal>
      )}

      {showPrimaryChoice && !coreChoices && <AppModal key="primary-skill" archetype="transaction" layer="exclusive-dialog" layout="viewport-safe" closeOnEscape={false} labelledBy="air-primary-title" panelClassName="air-primary-panel" reducedMotion={reducedMotion}>
        <OverlayHeader><h2 id="air-primary-title" className="modal-title">{releaseState(worldRef.current.aircraft).followups[0]==="system"?"CHỌN HỆ CHUYÊN TUYẾN":"CHỌN KỸ NĂNG CHỦ LỰC"}</h2><p>Lựa chọn áp dụng khi còn sở hữu Lõi</p></OverlayHeader>
        {releaseState(worldRef.current.aircraft).followups[0]==="system"?<OverlayBody><div className="air-primary-choices">{(["attack","defense","resource","utility"] as const).map(system=><button key={system} type="button" onClick={()=>{
          const state=worldRef.current.aircraft,r=releaseState(state);r.system=system;r.followups.shift();
          expansionState(state).primaryPending=r.followups.length>0;setPrimaryChoice(null);
          if(!r.followups.length){setShowPrimaryChoice(false);setPauseReason("primarySkill",false);const next=ensureCoreSelection(worldRef.current);if(next){setCoreChoices(next);setPauseReason("core",true);}}
          setHud(makeHudSnapshot(worldRef.current,true,pauseLabel(pauseReasonsRef.current)));
        }}><strong>{CORE_SYSTEM_LABELS[system]}</strong><p>Bảo đảm một ô thuộc Hệ này khi còn ứng viên hợp lệ.</p></button>)}</div></OverlayBody>:<>
        <OverlayBody><div className="air-primary-choices">{skillIds.map(id=><button key={id} type="button" aria-pressed={primaryChoice===id} onClick={()=>setPrimaryChoice(id)}>
          <CombatUiIcon kind="skill" id={id} fallback={SKILL_CONFIGS[id].icon}/><strong>{SKILL_CONFIGS[id].name}</strong><p>{SKILL_CONFIGS[id].description}</p>
        </button>)}</div><p>+22% sát thương · -15% chi phí Tài Nguyên · -15% Hồi Chiêu cơ bản</p></OverlayBody>
        <OverlayFooter><ModalButton variant="primary" type="button" disabled={!primaryChoice} onClick={()=>{
          if (!primaryChoice) return;
          const state=expansionState(worldRef.current.aircraft);state.primarySkill=primaryChoice;state.primaryPending=false;
          const release=releaseState(worldRef.current.aircraft);release.followups.shift();setPrimaryChoice(null);
          if(release.followups.length){state.primaryPending=true;setHud(makeHudSnapshot(worldRef.current,true,pauseLabel(pauseReasonsRef.current)));return;}
          const next=ensureCoreSelection(worldRef.current);
          if (next) {setCoreChoices(next);setPauseReason("core",true);}
          setShowPrimaryChoice(false);setPauseReason("primarySkill",false);setHud(makeHudSnapshot(worldRef.current,pauseReasonsRef.current.size>0,pauseLabel(pauseReasonsRef.current)));
        }}>Xác nhận</ModalButton></OverlayFooter></>}
      </AppModal>}
      {showEquipment && !coreChoices && <AirCombatEquipmentInventory key="equipment" world={worldRef.current} onChange={()=>setHud(makeHudSnapshot(worldRef.current,true,pauseLabel(pauseReasonsRef.current)))} onClose={()=>{setShowEquipment(false);setPauseReason("equipment",false);}}/>}
      {showCoreList && !coreChoices && <AirCombatCoreList key="core-list" state={worldRef.current.aircraft} onClose={() => { setShowCoreList(false); setPauseReason("coreList", false); }} />}

      {pauseReasonsRef.current.has("user") && !coreChoices && !showExitConfirm && !showCoreList && !showPrimaryChoice && !showEquipment && (
        <ConfirmationDialog key="pause" status="warning" layer="exclusive-dialog" layout="viewport-safe" onClose={() => setPauseReason("user", false)} labelledBy="air-paused-title" panelClassName="text-center">
          <OverlayHeader><Pause className="mx-auto h-8 w-8 text-[var(--modal-info)]" /><h2 id="air-paused-title" className="modal-title">Đã tạm dừng</h2></OverlayHeader>
          <OverlayBody data-pause-overlay="user"><p className="text-xs text-[var(--modal-text)]">Hồi tài nguyên, hồi chiêu và thời gian trận đều đứng yên.</p></OverlayBody>
          <OverlayFooter data-stack-actions="true"><ModalButton variant="primary" type="button" onClick={() => setPauseReason("user", false)} className="w-full"><Play className="h-4 w-4" /> Tiếp tục</ModalButton><ModalButton variant="ghost" type="button" className="text-rose-300" onClick={openExit}>Thoát Game</ModalButton></OverlayFooter>
        </ConfirmationDialog>
      )}

      {showExitConfirm && (
        <ConfirmationDialog key="exit" status="warning" layer="exclusive-dialog" layout="viewport-safe" onClose={closeExit} labelledBy="air-exit-title" panelClassName="text-center">
          <OverlayHeader><ArrowLeft className="mx-auto h-8 w-8 text-[var(--modal-danger)]" /><h2 id="air-exit-title" className="modal-title">Bạn có chắc chắn muốn rời đi?</h2></OverlayHeader>
          <OverlayBody data-exit-confirm="open"><p className="text-xs leading-relaxed text-[var(--modal-text)]">Lượt hiện tại sẽ kết thúc và không nhận thưởng.</p></OverlayBody>
          <OverlayFooter data-stack-actions="true"><ModalButton variant="primary" type="button" autoFocus onClick={closeExit}>Ở Lại</ModalButton><ModalButton variant="ghost" type="button" className="text-rose-300" onClick={onExit}>Thoát Game</ModalButton></OverlayFooter>
        </ConfirmationDialog>
      )}

      </AnimatePresence>
      {pauseState.paused && pauseState.label && pauseReasonsRef.current.has("hidden") && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/90 px-3 py-1 text-[8px] font-bold text-slate-300">{pauseState.label}</div>
      )}
    </div>
  );
};
