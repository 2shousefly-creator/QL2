import { PASSIVES } from './airCombatPassives';
import { PassiveCell, PassiveDetails } from './AirCombatPassive';
import { publishCombatNotice } from "./airCombatNotices";
import { skillRank, SKILL_RANKS, isUltimate, canAllocateSkill, allocateSkillPoint, ultimateCastDisabled } from "./airCombatSkillRanks";
import { AirCombatCoreDetail } from "./AirCombatCoreDetail";
import { AirCombatCoreTransition } from "./AirCombatCoreTransition";
import { AirCombatTooltipPortal } from "./AirCombatTooltipPortal";
import { AirCombatEquipmentInventory } from "./AirCombatEquipmentInventory";
import { EquipmentTooltip, type EquipmentTooltipAnchor } from "./EquipmentTooltip";
import { expansionState } from "./airCombatExpansion";
import { releaseState } from "./airCombatReleaseState";
import { reserveCap } from "./airCombatSelectionRules";
import { CORE_SYSTEM_LABELS } from "./airCombatCoreSystems";
import { AirCombatTacticalHud, type HubTooltip } from "./AirCombatTacticalHud";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AirCombatModal as AppModal, AirCombatConfirmation as ConfirmationDialog, airTooltipMotion } from "./AirCombatMotion";
import { getAirCombatStage } from "./airCombatStages";
import { playerSkillLocked } from "./airCombatStatus";
import { AirCombatStatusStrip, type StatusStripHandle } from "./AirCombatStatusStrip";
import { formatCooldownSeconds, formatSkillCellCooldown, getActiveSkillDuration, getSkillTooltipModel } from "./airCombatPresentation";
import { BOSS_HUD_HEIGHT } from "./airCombatHudLayout";
import { AirCombatOverlayFeedback } from "./AirCombatOverlayFeedback";
import { CoreDescription } from "./CoreDescription";
import { AirCombatCoreList } from "./AirCombatCoreList";
import { hasCore } from "./airCombatCoreEffects";
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
import { ArrowLeft, Pause, Play, X, Droplet, Zap } from "lucide-react";
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
  bestAvailableRerollSource,
  getWorldSkillAvailability,
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

export interface AirCombatBattleProps {
  runtime?: AirCombatBattleRuntime;
  stageId: number;
  aircraftId: AircraftId;
  reducedMotion: boolean;
  onComplete: (summary: AirCombatRunSummary) => void;
  onExit: () => void;
}

/** Ruleset callbacks; presentation, controls and modal ownership have one implementation. */
export interface AirCombatBattleRuntime {
  getWorld(): CombatWorld;
  getOpponentWorld?(): CombatWorld;
  getPhase(): string;
  canMove(): boolean;
  takeAnnouncements(): { text: string; durationMs: number; createdAtMs?: number }[];
  advance(delta: number): void;
  move(dx: number, dy: number): void;
  cast(skill: SkillId): ReturnType<typeof castWorldSkill>;
  upgrade(skill: SkillId): boolean;
  select(card: CoreCard): boolean;
  reroll(slot: number, source: NonNullable<Parameters<typeof rerollCore>[2]>): ReturnType<typeof rerollCore>;
  selectPrimary(skill: SkillId): void;
  score(): { playerWins: number; opponentWins: number };
  overlay(): React.ReactNode;
  finished(): boolean;
  complete(): void;
}

type PauseReason = "loading" | "user" | "core" | "tooltip" | "exit" | "hidden" | "coreList" | "primarySkill" | "equipment";
const STATUS_UI_INTERVAL_MS = 100;

interface SkillPressState {
  skillId: SkillId;
  pointerId: number;
  startedAt: number;
  timer: number | null;
  held: boolean;
  target: HTMLButtonElement;
}

interface PlayerControlState {
  pointerId: number;
  target: HTMLDivElement;
  originX: number;
  originY: number;
}

function pauseLabel(reasons: ReadonlySet<string>): string | null {
  if (reasons.has("core")) return "Chọn lõi";
  if (reasons.has("equipment")) return "Kho Trang Bị";
  if (reasons.has("coreList")) return "Danh sách lõi";
  if (reasons.has("tooltip")) return "Xem thông tin";
  if (reasons.has("exit")) return "Xác nhận thoát";
  if (reasons.has("hidden")) return "Ứng dụng tạm ẩn";
  if (reasons.has("user")) return "Tạm dừng";
  return null;
}

export const AirCombatBattleShell: React.FC<AirCombatBattleProps> = ({
  runtime,
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
  const [world] = useState(() => {
    const initial = runtime?.getWorld() ?? createCombatWorld(aircraftId, undefined, stageId);
    initial.pauseReasons.add("loading");
    return initial;
  });
  const worldRef = useRef<CombatWorld>(world);
  if (runtime) worldRef.current = runtime.getWorld();
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);
  const draggingRef = useRef(false);
  const playerControlRef = useRef<PlayerControlState | null>(null);
  const activePointers = useRef(new Map<number, string>());
  const suppressedPointers = useRef(new Set<number>());
  const coreSelectingRef = useRef(false);
  const pressRef = useRef<SkillPressState | null>(null);
  const lowHpWarnedRef = useRef(false);
  const announcementRef = useRef(0);
  const [pauseState, setPauseState] = useState({ paused: false, label: null as string | null });
  const toastHostRef = useRef<HTMLDivElement>(null);
  const bossHpRef = useRef<HTMLDivElement>(null);
  const bossChipRef = useRef<HTMLDivElement>(null);
  const bossShieldRef = useRef<HTMLDivElement>(null);
  const [hud, setHud] = useState<AirCombatHudSnapshot>(() => makeHudSnapshot(worldRef.current, false, null));
  const [detailSlot, setDetailSlot] = useState<number | null>(null);
  const systemReducedMotion=useReducedMotion();
  const rerollTimer=useRef<number|null>(null);
  const [rerollTransition,setRerollTransition]=useState<{slot:number;origin:"list"|"detail";previous:CoreCard}|null>(null);
  useEffect(()=>()=>{if(rerollTimer.current!==null)window.clearTimeout(rerollTimer.current);},[]);
  const [coreChoices, setCoreChoices] = useState<CoreCard[] | null>(null);
  // Draft state changes only on a new selection or committed reroll, not on HUD ticks.
  const rerollSources=useMemo(()=>coreChoices?.map((_,slot)=>bestAvailableRerollSource(worldRef.current,slot))??[],[coreChoices]);
  const [hubTooltip, setHubTooltip] = useState<(HubTooltip & {id:string}) | null>(null);
  const [hubEquipmentTooltip, setHubEquipmentTooltip] = useState<EquipmentTooltipAnchor | null>(null);
  const tooltipOwner = useRef<"hub"|"skill"|"status"|"equipment"|"passive"|null>(null);
  const [primaryChoice, setPrimaryChoice] = useState<SkillId | null>(null);
  const [showPrimaryChoice, setShowPrimaryChoice] = useState(false);
  const [tooltipPassive,setTooltipPassive]=useState(false);
  const [tooltipSkill, setTooltipSkill] = useState<SkillId | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showCoreList, setShowCoreList] = useState(false);
  const [showEquipment,setShowEquipment]=useState(false);

  const aircraft = AIRCRAFT_CONFIGS[aircraftId];
  const skillIds = useMemo(() => [...aircraft.skillIds], [aircraft.skillIds]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const resetPlayerControl = useCallback((pointerId?: number) => {
    const control = playerControlRef.current;
    if (pointerId !== undefined && control && control.pointerId !== pointerId) return;
    draggingRef.current = false;
    playerControlRef.current = null;
    setPlayerInputActive(worldRef.current, false);
    if (control) {
      activePointers.current.delete(control.pointerId);
      suppressedPointers.current.delete(control.pointerId);
      try {
        if (control.target.hasPointerCapture(control.pointerId)) control.target.releasePointerCapture(control.pointerId);
      } catch { /* The browser may already have cancelled/unmounted the capture target. */ }
    }
  }, []);
  const resetSkillPress = useCallback(() => {
    const press = pressRef.current;
    pressRef.current = null;
    if (!press) return;
    if (press.timer !== null) window.clearTimeout(press.timer);
    try {
      if (press.target.hasPointerCapture(press.pointerId)) press.target.releasePointerCapture(press.pointerId);
    } catch { /* Capture may already have ended. */ }
  }, []);
  const setPauseReason = useCallback((reason: PauseReason, enabled: boolean) => {
    const reasons = worldRef.current.pauseReasons;
    const had = reasons.has(reason);
    if (enabled && !had) {
      reasons.add(reason);
      // Tooltip pauses simulation but preserves an existing movement gesture.
      if (reason !== "tooltip") { resetPlayerControl(); resetSkillPress(); }
    } else if (!enabled && had) reasons.delete(reason);
    // Runtime selection code can already have changed this same canonical Set.
    const next = { paused: reasons.size > 0, label: pauseLabel(reasons) };
    setPauseState(previous => previous.paused === next.paused && previous.label === next.label ? previous : next);
  }, [resetPlayerControl, resetSkillPress]);

  const activateTooltip = useCallback((owner: "hub"|"skill"|"status"|"equipment"|"passive") => {
    if (owner !== "hub" && owner !== "status") resetPlayerControl();
    tooltipOwner.current = owner;
    if(owner!=="passive")setTooltipPassive(false);
    setPauseReason("tooltip", true);
    if (owner !== "status") statusStripRef.current?.close();
    if (owner !== "skill") { resetSkillPress(); setTooltipSkill(null); }
    if (owner !== "hub") setHubTooltip(null);
    if (owner !== "equipment") setHubEquipmentTooltip(null);
  }, [setPauseReason, resetSkillPress, resetPlayerControl]);
  const closeAllTooltips = useCallback(() => {
    tooltipOwner.current = null;setTooltipPassive(false);
    resetSkillPress();
    statusStripRef.current?.close(); setTooltipSkill(null); setHubTooltip(null); setHubEquipmentTooltip(null);
    setPauseReason("tooltip", false);
  }, [setPauseReason, resetSkillPress]);
  const onStatusTooltip = useCallback((open: boolean) => {
    if (open) {
      if (tooltipOwner.current !== "status") activateTooltip("status");
    }
    else if (tooltipOwner.current === "status") closeAllTooltips();
  }, [activateTooltip, closeAllTooltips]);
  const inspectHub = (id: string, tooltip: HubTooltip) => {
    if (tooltipOwner.current === "hub" && hubTooltip?.id === id) { closeAllTooltips(); return; }
    activateTooltip("hub"); setHubTooltip({ id, ...tooltip });
  };
  const inspectEquipment = (id: EquipmentTooltipAnchor["id"], source: HTMLElement) => {
    if (tooltipOwner.current === "equipment" && hubEquipmentTooltip?.source === source) { closeAllTooltips(); return; }
    activateTooltip("equipment"); setHubEquipmentTooltip({ id, source });
  };
  useEffect(() => {
    const endTimers = new Set<number>();
    const pointerDown = (event: PointerEvent) => {
      const dismissTooltip = tooltipOwner.current !== null && !(event.target as Element).closest?.("[data-combat-tooltip-trigger], [data-combat-tooltip-panel]");
      // A new primary contact proves earlier contacts of this type have ended,
      // even if the WebView lost their terminal events. Other touch fingers stay owned.
      for (const [id, type] of activePointers.current) {
        if (id === event.pointerId || (event.isPrimary && type === event.pointerType)) {
          activePointers.current.delete(id);
          suppressedPointers.current.delete(id);
        }
      }
      const owner = playerControlRef.current;
      if (owner && !activePointers.current.has(owner.pointerId)) resetPlayerControl();
      const press = pressRef.current;
      if (press && !activePointers.current.has(press.pointerId)) {
        resetSkillPress();
      }
      activePointers.current.set(event.pointerId, event.pointerType);
      if (dismissTooltip) {
        suppressedPointers.current.add(event.pointerId);
        closeAllTooltips();
      }
    };
    const pointerEnd = (event: PointerEvent) => {
      activePointers.current.delete(event.pointerId);
      suppressedPointers.current.delete(event.pointerId);
      resetPlayerControl(event.pointerId);
      // Let the skill button handle a normal release/cast first, then cancel any
      // orphaned press even if propagation never reaches document's bubble phase.
      const press = pressRef.current;
      if (press?.pointerId === event.pointerId) {
        const timer = window.setTimeout(() => {
          endTimers.delete(timer);
          if (pressRef.current !== press) return;
          resetSkillPress();
        }, 0);
        endTimers.add(timer);
      }
    };
    const resetPointers = () => {
      activePointers.current.clear(); suppressedPointers.current.clear();
      resetPlayerControl(); resetSkillPress(); closeAllTooltips();
    };
    const visibility = () => {
      resetPointers();
      setPauseReason("hidden", document.hidden);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") closeAllTooltips(); };
    document.addEventListener("pointerdown", pointerDown, true);
    document.addEventListener("pointerup", pointerEnd, true);
    document.addEventListener("pointercancel", pointerEnd, true);
    document.addEventListener("keydown", escape);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", resetPointers);
    window.addEventListener("resize", resetPointers);
    window.addEventListener("orientationchange", resetPointers);
    setPauseReason("hidden", document.hidden);
    return () => {
      endTimers.forEach(timer => window.clearTimeout(timer));
      document.removeEventListener("pointerdown", pointerDown, true);
      document.removeEventListener("pointerup", pointerEnd, true);
      document.removeEventListener("pointercancel", pointerEnd, true);
      document.removeEventListener("keydown", escape);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", resetPointers);
      window.removeEventListener("resize", resetPointers);
      window.removeEventListener("orientationchange", resetPointers);
      activePointers.current.clear(); suppressedPointers.current.clear();
      resetPlayerControl(); resetSkillPress();
    };
  }, [closeAllTooltips, resetPlayerControl, resetSkillPress, setPauseReason]);

  useEffect(() => {
    const host = stageRef.current;
    if (!host) return;
    let world = worldRef.current;
    let phase = runtime?.getPhase();
    let movementAllowed = runtime?.canMove() ?? false;
    const syncRuleset = () => {
      if (!runtime) return;
      const next = runtime.getWorld(), nextPhase = runtime.getPhase();
      const nextMovementAllowed = runtime.canMove();
      if (world !== next || phase !== nextPhase || movementAllowed !== nextMovementAllowed) {
        // Keep the captured drag and its last pointer position across countdown -> combat.
        // A new world or a phase that blocks movement still ends the gesture.
        const preserveMovement = world === next && movementAllowed && nextMovementAllowed;
        if (!preserveMovement) {
          setPlayerInputActive(world, false);
          resetPlayerControl();
          activePointers.current.clear(); suppressedPointers.current.clear();
          setPlayerInputActive(next, false);
        }
        resetSkillPress();
        world = next; worldRef.current = next; phase = nextPhase;
        movementAllowed = nextMovementAllowed;
      }
      setCoreChoices(previous => previous === next.currentCoreChoices ? previous : next.currentCoreChoices);
      setPauseReason("core", !!next.currentCoreChoices);
      const primary = !!expansionState(next.aircraft).primaryPending;
      setShowPrimaryChoice(primary);
      setPauseReason("primarySkill", primary);
    };
    const overlayFeedback = toastHostRef.current ? new AirCombatOverlayFeedback(toastHostRef.current) : null;
    let cancelled = false;
    let animationFrame = 0;
    let presentation: AirCombatPresentation | null = null;
    let usingLegacy = false;
    let lastTime = performance.now();
    let lastHudUpdate = 0;
    let lastStatusUiUpdate = -Infinity;
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
      syncRuleset();
      const wallDelta = Math.max(0, now - lastTime);
      const elapsed = Math.min(0.12, wallDelta / 1000);
      lastTime = now;
      if (world.destruction || world.aftermath || [...world.pauseReasons].some(reason => reason !== "tooltip")) {
        resetPlayerControl(); resetSkillPress();
      } else if (!playerControlRef.current) setPlayerInputActive(world, false);
      const paused = world.pauseReasons.size > 0;
      if (!document.hidden && presentation) {
        if (runtime) {
          if (!paused) { runtime.advance(elapsed); syncRuleset(); }
          if (runtime.finished() && !completedRef.current) {
            completedRef.current = true; runtime.complete(); return;
          }
        } else if (!paused && !world.ended) {
          let remaining = elapsed;
          while (remaining > 0 && !world.ended && (world.aftermath || !world.pendingCoreSelections)) {
            const step = Math.min(AIR_COMBAT_WORLD.maxDeltaSeconds, remaining);
            updateCombatWorld(world, step); remaining -= step;
          }
          const choices = ensureCoreSelection(world);
          if (choices) {
            setCoreChoices(choices); setPauseReason("core", true);
            soundManager.playXpFull(); soundManager.triggerHaptic("medium");
          }
        }
        // The result reason stops runtime; the final explosion still finishes visually.
        const presentationPaused = [...world.pauseReasons].some(reason => reason !== "result");
        const visualDelta = presentationPaused ? 0 : elapsed;
        overlayFeedback?.render(world, visualDelta, presentationPaused, reducedMotion,
          bossHpRef.current, bossChipRef.current, bossShieldRef.current, runtime?.takeAnnouncements());
        // Selection may have paused the world earlier in this frame. Freeze the
        // snapshot for every pause reason and refresh on the first resumed tick.
        if (world.pauseReasons.size > 0) lastStatusUiUpdate = -Infinity;
        else if (now - lastStatusUiUpdate >= STATUS_UI_INTERVAL_MS) {
          statusStripRef.current?.update(world);
          lastStatusUiUpdate = now;
        }
        for (const id of skillIds) {
          const node = durationNodes.current[id], timer = getActiveSkillDuration(world, id);
          if (node) { node.hidden = !timer; node.style.setProperty("--skill-duration", String(timer ? timer.progress ?? 1 : 0)); }
        }
        try { presentation.render(world, visualDelta, reducedMotion); }
        catch {
          if (!usingLegacy) void fallback();
          else { presentation.destroy(); presentation = null; setRendererState("failed"); setPauseReason("loading", true); }
        }
        if (now - lastHudUpdate >= 90 || publishedWaveState !== world.waveState || publishedWaveIndex !== world.waveIndex) {
          publishedWaveState = world.waveState; publishedWaveIndex = world.waveIndex;
          setHud(makeHudSnapshot(world, worldRef.current.pauseReasons.size > 0, pauseLabel(worldRef.current.pauseReasons)));
          lastHudUpdate = now;
        }
        // Present the final explosion after gameplay ends without advancing runtime time.
        if (!runtime && world.ended && !presentationPaused && presentation) {
          endedAt ??= now;
          if (now - endedAt >= (world.destruction ? 0 : reducedMotion ? 180 : 850) && !completedRef.current) {
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
      resetPlayerControl(); resetSkillPress();
    };
  }, [aircraftId, reducedMotion, runtime, setPauseReason, resetPlayerControl, resetSkillPress]);


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
    if (event.buttons === 0) { resetPlayerControl(event.pointerId); return; }
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const coalesced = event.nativeEvent.getCoalescedEvents?.() || [];
    const samples = coalesced.length ? coalesced : [event.nativeEvent];
    for (const sample of samples) {
      const x = ((sample.clientX - rect.left) / rect.width) * AIR_COMBAT_WORLD.width;
      const y = ((sample.clientY - rect.top) / rect.height) * AIR_COMBAT_WORLD.height;
      if (!worldRef.current.pauseReasons.size) {
        if (runtime) runtime.move(x - control.originX, y - control.originY);
        else movePlayerByDelta(worldRef.current, x - control.originX, y - control.originY);
      }
      control.originX = x; control.originY = y;
    }
  };

  const onCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (runtime && !runtime.canMove()) return;
    const owner = playerControlRef.current;
    if (!owner || !activePointers.current.has(owner.pointerId) || !owner.target.hasPointerCapture(owner.pointerId)) resetPlayerControl();
    if (event.button !== 0 || suppressedPointers.current.has(event.pointerId) || worldRef.current.pauseReasons.size > 0 || playerControlRef.current || worldRef.current.ended || worldRef.current.destruction || worldRef.current.aftermath) return;
    event.preventDefault();
    const point = pointFromEvent(event);
    draggingRef.current = true;
    playerControlRef.current = {
      pointerId: event.pointerId,
      target: event.currentTarget,
      originX: point.x,
      originY: point.y,
    };
    setPlayerInputActive(worldRef.current, true);
    try { event.currentTarget.setPointerCapture(event.pointerId); }
    catch { resetPlayerControl(); }
  };

  const onSkillPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    skillId: SkillId
  ) => {
    if (suppressedPointers.current.has(event.pointerId) || [...worldRef.current.pauseReasons].some(reason=>reason!=="tooltip") || worldRef.current.ended || worldRef.current.destruction || worldRef.current.aftermath || pressRef.current) return;
    event.preventDefault();
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { return; }
    const press: SkillPressState = {
      skillId,
      pointerId: event.pointerId,
      startedAt: performance.now(),
      timer: null,
      held: false,
      target: event.currentTarget,
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
    resetSkillPress();
    if (press.held || classification === "hold") {
      return;
    }
    if (!shouldCastSkillPress(durationMs, press.held, cancelled) || worldRef.current.pauseReasons.size > 0 || worldRef.current.ended || worldRef.current.destruction || worldRef.current.aftermath) return;
    const result = runtime ? runtime.cast(press.skillId) : castWorldSkill(worldRef.current, press.skillId);
    if (!result.cast) {
      soundManager.playError();
      soundManager.triggerHaptic("light");
      publishCombatNotice(worldRef.current, result.reason === "resource" ? "Không đủ tài nguyên" : "Kỹ năng đang hồi");
    } else {
      soundManager.playClick();
      soundManager.triggerHaptic(press.skillId === "heavy_bomb" ? "medium" : "light");
    }
  };

  const chooseCore = (card: CoreCard) => {
    if (coreSelectingRef.current || rerollTimer.current!==null) return;
    coreSelectingRef.current = true;
    const applied = runtime ? runtime.select(card) : selectCore(worldRef.current, card);
    if (applied) {
      soundManager.playBubblePop();
      soundManager.triggerHaptic("medium");
      setDetailSlot(null);
      setCoreChoices(null);
      const primaryPending = expansionState(worldRef.current.aircraft).primaryPending;
      if (primaryPending) {
        setPauseReason("primarySkill", true); setShowPrimaryChoice(true);
      }
      setPauseReason("core", false);
      if (!runtime && !primaryPending && worldRef.current.pendingCoreSelections > 0) {
        const next=ensureCoreSelection(worldRef.current);
        if (next) { setCoreChoices(next);setPauseReason("core",true); }
        else if (expansionState(worldRef.current.aircraft).primaryPending) { setPauseReason("primarySkill",true);setShowPrimaryChoice(true); }
      }
    }
    window.setTimeout(() => {
      coreSelectingRef.current = false;
    }, 160);
  };

  const rerollSlot = (slot: number, origin: "list" | "detail") => {
    if(rerollTimer.current!==null)return;
    const previous=worldRef.current.currentCoreChoices?.[slot];
    const source = bestAvailableRerollSource(worldRef.current, slot);
    if (!source || !previous) return;
    const choices = runtime ? runtime.reroll(slot, source) : rerollCore(worldRef.current, slot, source);
    if (choices) {
      setCoreChoices([...choices]);setRerollTransition({slot,origin,previous});
      // Timeout is independent of animation events (including reduced/disabled motion).
      rerollTimer.current=window.setTimeout(()=>{rerollTimer.current=null;setRerollTransition(null);},reducedMotion||systemReducedMotion?180:960);
    }
  };
  const bonusRerollAvailable=()=>Boolean(worldRef.current.coreSelectionEvent?.extraAvailable&&!worldRef.current.coreSelectionEvent.extraUsed)||releaseState(worldRef.current.aircraft).reserve>0;
  const rankSkill=(skillId:SkillId)=>{
    const current=worldRef.current;
    if(current.ended||current.pauseReasons.size)return;
    if(runtime ? runtime.upgrade(skillId) : allocateSkillPoint(current.aircraft,skillId))setHud(makeHudSnapshot(current,false,null));
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
    const event = hud.announcement;
    if (event.expiresAtMs <= performance.now() || event.serial === announcementRef.current) return;
    const message = event.text;
    announcementRef.current = event.serial;
    if (/RADAR|TRÙM|GIAI ĐOẠN|PHÁO ĐÀI/.test(message)) {
      soundManager.playSignalTone(8, 9);
      soundManager.triggerHaptic("heavy");
    } else if (/CẤP CHIẾN ĐẤU/.test(message)) {
      soundManager.playBubblePop();
      soundManager.triggerHaptic("medium");
    }
  }, [hud.announcement]);

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
      data-ruleset={runtime ? "solo" : "campaign"}
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
          resetPlayerControl(event.pointerId);
        }}
        onPointerCancel={(event) => resetPlayerControl(event.pointerId)}
        onLostPointerCapture={(event) => resetPlayerControl(event.pointerId)}
      />

      {rendererState === "loading" && <div role="status" className="pointer-events-none absolute inset-0 z-30 grid place-items-center bg-slate-950 text-sm text-cyan-100">Đang chuẩn bị chiến trường…</div>}
      {rendererState === "failed" && <div role="alert" className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-slate-950 text-sm text-white"><p>Không thể mở chiến trường trên thiết bị này.</p><button type="button" onClick={onExit} className="rounded-xl border border-cyan-300 px-5 py-3">Quay lại</button></div>}
      {rendererState === "legacy" && <span className="pointer-events-none absolute right-2 top-[13%] z-10 text-[8px] text-slate-400">Hiển thị tương thích</span>}
      {hpRatio < 0.3 && <div className="pointer-events-none absolute inset-0 z-[5] rounded-2xl" style={{ boxShadow: "inset 0 0 55px rgba(225,29,72," + ((0.3 - hpRatio) * 1.6) + ")" }} />}
      <section className="air-combat-hud absolute inset-x-0 top-0 z-10 border-b border-cyan-300/30 bg-slate-950/95 text-white" style={{ height: AIR_COMBAT_WORLD.hudHeight / 720 * 100 + "%" }} data-hud-region="fixed">
        <AirCombatTacticalHud soloScore={runtime?.score()} world={worldRef.current} hud={hud} reducedMotion={reducedMotion} coreChoice={!!coreChoices || showEquipment || showCoreList || showPrimaryChoice || showExitConfirm}
          onEquipmentInspect={inspectEquipment}
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
            <div ref={bossShieldRef} className="absolute inset-y-0 left-0 z-[1] bg-slate-200" />
            <div ref={bossChipRef} className="absolute inset-y-0 left-0 bg-white" />
            {(stageId === 2 ? [.75,.5,.25,.1] : stageId === 4 ? [.7,.4,.15] : [.7,.35,.15]).map(mark => <i key={mark} className="air-boss-phase-marker" style={{left:`${mark*100}%`}} />)}
            <div ref={bossHpRef} className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-700 via-rose-500 to-orange-300" />
          </div>
        </div>
      )}

      {!runtime && hud.mirror && <div className="air-boss-hud" style={{top:`${AIR_COMBAT_WORLD.hudHeight/720*100}%`,height:`${BOSS_HUD_HEIGHT/720*100}%`}}>
        <div className="flex justify-between text-[7px] font-black text-slate-100"><span>THE OTHER SELF</span><span>HP {Math.ceil(hud.mirror.hp).toLocaleString("vi-VN")} · {resourceLabel} {Math.floor(hud.mirror.resource)}</span></div>
        <progress className="mt-1 h-1.5 w-full accent-slate-100" aria-label="Máu Chiến Cơ Ảo Ảnh" value={hud.mirror.hp} max={hud.mirror.maxHp} />
      </div>}
      <AirCombatStatusStrip ref={statusStripRef} onTooltipChange={onStatusTooltip} top={AIR_COMBAT_WORLD.hudHeight + (hud.bossMaxHp > 0 || (!runtime && hud.mirror) ? BOSS_HUD_HEIGHT : 0)} />

      <div className="absolute inset-x-0 bottom-0 z-20 grid h-[11.1111%] grid-cols-4 gap-1 border-t border-cyan-900/50 bg-slate-950 p-1.5" data-skill-rail="bottom">
        <PassiveCell world={worldRef.current} onInspect={()=>{if(tooltipPassive){closeAllTooltips();return;}activateTooltip("passive");setTooltipPassive(true);}}/>
        {worldRef.current.aircraft.skillPoints > 0 && <span className="air-skill-points" aria-live="polite">Điểm kỹ năng: {worldRef.current.aircraft.skillPoints}</span>}
        {skillIds.map((skillId) => {
          const skill = SKILL_CONFIGS[skillId];
          const values = getSkillRuntimeValues(worldRef.current.aircraft, skillId);
          const availability=getWorldSkillAvailability(worldRef.current,skillId);
          const {cooldown,borrow,free}=availability;
          const active = skillId === "escort_drone" ? hud.droneActive : (worldRef.current.aircraft.activeEffects[skillId] || 0) > 0 || worldRef.current.aircraft.coreState.deferredCooldowns[skillId]!==undefined;
          const state=worldRef.current.aircraft, rank=skillRank(state,skillId), allocatable=canAllocateSkill(state,skillId);
          const locked = rank===0 || ultimateCastDisabled(state,skillId) || playerSkillLocked(state);
          const manualDetonate=availability.manualAction==="detonate";
          const unavailable=!availability.available;
          const blockingCooldown=availability.reason==="cooldown"&&cooldown>0;
          const missingResource=availability.reason==="resource";
          const statusLabel=locked ? rank===0?(isUltimate(skillId)&&state.level<6?"Khóa đến Lv6":"Chưa học"):"Đã khóa" : manualDetonate ? "Kích nổ" : active ? "Đang bật" : borrow&&availability.available ? "Có thể vay dùng ngay" : blockingCooldown ? `Đang hồi ${formatCooldownSeconds(cooldown)}` : missingResource ? `Thiếu ${resourceLabel}` : unavailable ? "Chưa thể dùng" : "Sẵn sàng";
          return (
            <div className="air-ranked-skill" key={skillId}>
            <button
              key={skillId}
              type="button"
              data-skill-id={skillId}
              data-combat-tooltip-trigger="skill"
              data-primary-skill={expansionState(worldRef.current.aircraft).primarySkill === skillId}
              data-skill-cost={values.cost}
              data-borrow-ready={borrow && availability.available}
              data-reduced-motion={reducedMotion}
              aria-label={`${skill.name}, ${skillId === "escort_drone" ? `yêu cầu triệu hồi ${values.cost} Điện, không tiêu hao khi triệu hồi` : `tốn ${free ? 0 : Math.round(values.cost)} ${resourceLabel}`}, ${statusLabel}`}
              aria-disabled={unavailable}
              aria-pressed={active}
              onPointerDown={(event) => onSkillPointerDown(event, skillId)}
              onPointerUp={(event) => finishSkillPress(event)}
              onPointerCancel={(event) => finishSkillPress(event, true)}
              onLostPointerCapture={(event) => finishSkillPress(event, true)}
              onContextMenu={(event) => event.preventDefault()}
              style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none", touchAction: "none" }}
              className={`relative flex w-full h-full min-h-11 touch-none select-none flex-col items-center justify-center overflow-hidden rounded-none border text-center shadow-lg backdrop-blur transition-transform active:scale-95 ${active ? "border-emerald-200 bg-emerald-500/30 text-emerald-50 shadow-emerald-500/20" : unavailable ? "border-slate-700 bg-black/80 text-slate-500" : "border-cyan-200/70 bg-gradient-to-br from-cyan-950/95 to-indigo-950/95 text-cyan-50 shadow-cyan-500/15"}`}
            >
              <span className={`absolute left-1 top-1 z-20 rounded px-1 text-[11px] font-black ${hud.stats.resourceKind === "mana" ? "bg-sky-950/90 text-sky-200" : "bg-violet-950/90 text-violet-200"}`}>{skillId === "escort_drone" ? `${Number(values.upkeepPerSecond.toFixed(1))}/s` : free ? 0 : Math.round(values.cost)}</span>
              {skillId === "escort_drone" && active && <span className="absolute right-1 top-1 z-20 text-[6px] font-black text-violet-200">-{values.upkeepPerSecond}/s</span>}
              <span className="air-skill-duration" ref={node => { durationNodes.current[skillId] = node; }} hidden aria-hidden="true"/>
              <span className="air-skill-icon-wrap">
              <CombatUiIcon kind="skill" id={skillId} fallback={skill.icon} className="combat-skill-icon relative z-10" />
              </span>
              <span className="air-rank-nodes" aria-label={`Cấp ${rank}/${SKILL_RANKS[skillId].length}`}>{SKILL_RANKS[skillId].map(row=><i key={`${row.rank}:${rank}`} data-earned={row.rank<=rank} data-next={allocatable&&row.rank===rank+1} data-new={row.rank===rank&&state.coreState.time-(state.skillUpAt[skillId]??-Infinity)<2}/>)}</span>
              {rank>0&&<span key={`up:${rank}`} className="air-skill-up-vfx" aria-hidden="true"/>}
              {locked&&<span className="air-skill-lock" aria-hidden="true">🔒</span>}
              {blockingCooldown&&<span className="air-skill-block-overlay" aria-label={`Hồi chiêu ${formatCooldownSeconds(cooldown)}`}>
                <span className="air-skill-cooldown-mask" style={{"--skill-cooldown-progress":availability.cooldownProgress} as React.CSSProperties}/>
                <strong className="air-skill-cooldown-number">{formatSkillCellCooldown(cooldown)}</strong>
              </span>}
              {missingResource&&<span className="air-skill-resource-overlay" aria-label={`Thiếu ${resourceLabel}`}>
                {hud.stats.resourceKind==="mana"?<Droplet aria-hidden="true"/>:<Zap aria-hidden="true"/>}<strong>!</strong>
              </span>}
            </button>
            {allocatable&&<button type="button" className="air-skill-plus" aria-label={`Nâng ${skill.name} lên cấp ${rank+1}`}
              onPointerDown={e=>{e.preventDefault();e.stopPropagation();if(e.button===0&&!suppressedPointers.current.has(e.pointerId))rankSkill(skillId);}}
              onPointerUp={e=>{e.preventDefault();e.stopPropagation();}} onPointerCancel={e=>e.stopPropagation()}
              onClick={e=>{e.preventDefault();e.stopPropagation();if(e.detail===0&&!(e.nativeEvent as PointerEvent).pointerType)rankSkill(skillId);}}>+</button>}
            </div>
          );
        })}

      </div>

      {runtime?.overlay()}
      {!runtime && hud.waveState === "countdown" && hud.waveCountdown > 0 && <div className="air-wave-countdown">Đợt tiếp theo sau<strong>{hud.waveCountdown}</strong></div>}
      {hubEquipmentTooltip && <AirCombatTooltipPortal anchor={stageRef}>
        <EquipmentTooltip anchor={hubEquipmentTooltip} state={worldRef.current.aircraft} onClose={closeAllTooltips}/>
      </AirCombatTooltipPortal>}
      <AnimatePresence>
      {hubTooltip && <motion.aside key="hub-tooltip" {...airTooltipMotion} className="air-hub-tooltip" data-combat-tooltip-panel="hub" role="status">
        <div className="air-tooltip-heading"><strong>{hubTooltip.title}</strong><button type="button" aria-label="Đóng thông tin" onClick={closeAllTooltips}><X/></button></div>
        <p>{hubTooltip.text}</p>
      </motion.aside>}
      {tooltipPassive&&<AirCombatTooltipPortal anchor={stageRef}><motion.aside {...airTooltipMotion} className="air-skill-tooltip" data-combat-tooltip-panel="passive" onPointerMove={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()} onPointerCancel={e=>e.stopPropagation()}><div className="air-tooltip-heading"><h3>{PASSIVES[worldRef.current.aircraft.aircraftId].name}</h3><button type="button" onClick={closeAllTooltips} aria-label="Đóng nội tại"><X/></button></div><PassiveDetails state={worldRef.current.aircraft} world={worldRef.current} heading={false}/></motion.aside></AirCombatTooltipPortal>}
      {tooltipSkill && tooltipModel && (
        <AirCombatTooltipPortal key="skill-tooltip" anchor={stageRef}><motion.aside {...airTooltipMotion} transition={{...airTooltipMotion.transition,duration:reducedMotion?.1:.28}} className="air-skill-tooltip" data-combat-tooltip-panel="skill" data-skill-tooltip={tooltipSkill} onPointerDown={event => event.stopPropagation()} onPointerMove={event => event.stopPropagation()}>
          <div className="air-tooltip-heading"><h3>{tooltipModel.title}</h3><strong className="air-tooltip-cooldown">{formatCooldownSeconds(tooltipModel.cooldown)}</strong></div>
          <p><CoreDescription text={tooltipModel.description}/></p>
          <div className="air-tooltip-details">{tooltipModel.detailRows.map(row => <div key={row}><CoreDescription text={row}/></div>)}</div>
          {tooltipModel.coreRows.map(row=><p key={row} style={{color:"#fde047"}}><CoreDescription text={row}/></p>)}
          <div className="air-rank-preview">{tooltipModel.rankRows.map(row=><section key={row.rank} data-unlocked={row.rank<=tooltipModel.rank} data-current={row.rank===tooltipModel.rank}><strong>◆ Cấp {row.rank} — {row.name}</strong><p style={{whiteSpace:"pre-line"}}><CoreDescription text={row.displayDescription}/></p></section>)}</div>
        </motion.aside></AirCombatTooltipPortal>
      )}

      <div key="core-toasts" ref={toastHostRef} className="air-core-toasts" aria-live="polite" aria-atomic="true" aria-label="Thông báo trận đấu" />
      {coreChoices && !showEquipment && !showExitConfirm && (
        <AppModal key="core-choice" exitDuration={90} archetype="transaction" layer="exclusive-dialog" layout="viewport-safe" closeOnEscape={false}
          reducedMotion={reducedMotion} labelledBy={detailSlot === null ? "air-core-choice-title" : "air-core-detail-title"} overlayClassName="air-upgrade-overlay" panelClassName="air-upgrade-panel">
          <h2 id="air-core-choice-title">CHỌN MỘT NÂNG CẤP</h2>
          {runtime && <div className="flex justify-center gap-2"><ModalButton onClick={() => { setShowEquipment(true); setPauseReason("equipment", true); }}>Kho Trang Bị</ModalButton><ModalButton onClick={openExit}>Menu Chính</ModalButton></div>}
          {worldRef.current.coreSelectionEvent?.context.kind==="normal"&&<div className="air-selection-rules">
            <p className="air-core-once-rule">Mỗi Lõi chỉ xuất hiện một lần trong mỗi lượt chơi. Lõi bị bỏ qua hoặc Đổi Lại sẽ không trở lại.</p>
            {hasCore(worldRef.current.aircraft,211)&&<span>Lọc reroll: ưu tiên Hệ khác</span>}
            {hasCore(worldRef.current.aircraft,212)&&<span>Reroll Dự Phòng: {worldRef.current.coreSelectionEvent?.extraAvailable&&!worldRef.current.coreSelectionEvent?.extraUsed?"1":"0"}</span>}
            {hasCore(worldRef.current.aircraft,217)&&<span>Bạc 20% · Vàng 35% · Kim Cương 45%</span>}
            {hasCore(worldRef.current.aircraft,212)&&<span>Reroll Dự Trữ: {releaseState(worldRef.current.aircraft).reserve} / {reserveCap(worldRef.current.aircraft)}</span>}
          </div>}
          <div key={worldRef.current.coreSelectionCount} className="air-upgrade-choices" data-core-selection="open" onPointerDown={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()} onTouchMove={e=>e.stopPropagation()} data-reduced-motion={reducedMotion}>
            {coreChoices.map((card, slot) => <div className="air-upgrade-row" key={slot} style={{"--slot":slot} as React.CSSProperties}>
              <button type="button" disabled={detailSlot !== null||!!rerollTransition} onClick={() => setDetailSlot(slot)} aria-label={`Xem ${card.name}`} data-core-slot={slot} data-core-choice={card.id} data-core-tier={card.tier} data-core-system={card.system}
                className="combat-core-card air-upgrade-card">
                <AirCombatCoreTransition card={card} previous={rerollTransition?.origin==="list"&&rerollTransition.slot===slot?rerollTransition.previous:undefined}/>
              </button>
              <button type="button" className="air-core-reroll" data-bonus={bonusRerollAvailable()} aria-label={`Đổi lại lựa chọn ${slot+1}`}
                disabled={detailSlot !== null || !!rerollTransition || !rerollSources[slot]} onClick={() => rerollSlot(slot,"list")}>
                <span aria-hidden="true">↻</span>
              </button>
            </div>)}
          </div>
          <AnimatePresence>
            {detailSlot !== null && coreChoices[detailSlot] && <AirCombatCoreDetail key="detail" card={coreChoices[detailSlot]} slot={detailSlot}
              previous={rerollTransition?.origin==="detail"&&rerollTransition.slot===detailSlot?rerollTransition.previous:undefined} busy={!!rerollTransition} bonus={bonusRerollAvailable()}
              reducedMotion={reducedMotion} canReroll={!!rerollSources[detailSlot]}
              onClose={() => setDetailSlot(null)} onSelect={() => chooseCore(coreChoices[detailSlot])} onReroll={() => rerollSlot(detailSlot,"detail")} />}
          </AnimatePresence>
        </AppModal>
      )}

      {showPrimaryChoice && !coreChoices && !showEquipment && !showExitConfirm && <AppModal key="primary-skill" archetype="transaction" layer="exclusive-dialog" layout="viewport-safe" closeOnEscape={false} labelledBy="air-primary-title" panelClassName="air-primary-panel" reducedMotion={reducedMotion}>
        <OverlayHeader><h2 id="air-primary-title" className="modal-title">CHỌN KỸ NĂNG CHỦ LỰC</h2><p>Lựa chọn áp dụng khi còn sở hữu Lõi</p>
          {runtime && <div className="flex justify-center gap-2"><ModalButton onClick={() => { setShowEquipment(true); setPauseReason("equipment", true); }}>Kho Trang Bị</ModalButton><ModalButton onClick={openExit}>Menu Chính</ModalButton></div>}
        </OverlayHeader>
        <OverlayBody><div className="air-primary-choices">{skillIds.map(id=><button key={id} type="button" aria-pressed={primaryChoice===id} onClick={()=>setPrimaryChoice(id)}>
          <CombatUiIcon kind="skill" id={id} fallback={SKILL_CONFIGS[id].icon}/><strong>{SKILL_CONFIGS[id].name}</strong><p>{SKILL_CONFIGS[id].description}</p>
        </button>)}</div><p>+30% sát thương · -20% chi phí Tài Nguyên · -20% Hồi Chiêu cơ bản</p></OverlayBody>
        <OverlayFooter><ModalButton variant="primary" type="button" disabled={!primaryChoice} onClick={()=>{
          if (!primaryChoice) return;
          if (runtime) {
            runtime.selectPrimary(primaryChoice); setPrimaryChoice(null);
            const pending = !!expansionState(worldRef.current.aircraft).primaryPending;
            setShowPrimaryChoice(pending); setPauseReason("primarySkill", pending);
            setCoreChoices(worldRef.current.currentCoreChoices);
            setHud(makeHudSnapshot(worldRef.current,worldRef.current.pauseReasons.size>0,pauseLabel(worldRef.current.pauseReasons)));
            return;
          }
          const state=expansionState(worldRef.current.aircraft);state.primarySkill=primaryChoice;state.primaryPending=false;
          const release=releaseState(worldRef.current.aircraft);release.followups.shift();setPrimaryChoice(null);
          if(release.followups.length){state.primaryPending=true;setHud(makeHudSnapshot(worldRef.current,true,pauseLabel(worldRef.current.pauseReasons)));return;}
          const next=ensureCoreSelection(worldRef.current);
          if (next) {setCoreChoices(next);setPauseReason("core",true);}
          setShowPrimaryChoice(false);setPauseReason("primarySkill",false);setHud(makeHudSnapshot(worldRef.current,worldRef.current.pauseReasons.size>0,pauseLabel(worldRef.current.pauseReasons)));
        }}>Xác nhận</ModalButton></OverlayFooter>
      </AppModal>}
      {showEquipment && (!coreChoices || runtime) && <AirCombatEquipmentInventory opponentWorld={runtime?.getOpponentWorld?.()} readOnly={!!runtime} key="equipment" world={worldRef.current} onChange={()=>setHud(makeHudSnapshot(worldRef.current,true,pauseLabel(worldRef.current.pauseReasons)))} onClose={()=>{setShowEquipment(false);setPauseReason("equipment",false);}}/>}
      {showCoreList && !coreChoices && <AirCombatCoreList opponentState={runtime?.getOpponentWorld?.().aircraft} key="core-list" state={worldRef.current.aircraft} onClose={() => { setShowCoreList(false); setPauseReason("coreList", false); }} />}

      {worldRef.current.pauseReasons.has("user") && !coreChoices && !showExitConfirm && !showCoreList && !showPrimaryChoice && !showEquipment && (
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
      {pauseState.paused && pauseState.label && worldRef.current.pauseReasons.has("hidden") && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/90 px-3 py-1 text-[8px] font-bold text-slate-300">{pauseState.label}</div>
      )}
    </div>
  );
};
