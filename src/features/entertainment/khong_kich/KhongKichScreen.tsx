import { AnimatePresence, MotionConfig } from "motion/react";
import { AirCombatModal as AppModal, AirCombatMotionContext } from "./AirCombatMotion";
import { AirCombatMainMenu, AirCombatStageSelect } from "./AirCombatCampaign";
import { canLaunchStage, defaultSelectedStage, getAirCombatStage } from "./airCombatStages";
import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Crosshair,
  Trophy,
  X,
} from "lucide-react";
import { soundManager } from "../../../game/audio";
import { gameConfig } from "../../../game/config";
import { GameState } from "../../../game/types";
import { applyEarnedXpCapped } from "../../../game/xpEngine";
import { createDefaultFarmState } from "../../tang_gia/farmEngine";
import {
  AIR_COMBAT_WORLD,
  AIRCRAFT_CONFIGS,
  AIRCRAFT_ORDER,
  SKILL_CONFIGS,
} from "./airCombatConfig";
import {
  createAircraftCombatState,
  getEffectiveAircraftStats,
} from "./airCombatEngine";
import {
  settleAirCombatRun,
  loadAirCombatProfile,
  saveAirCombatProfile,
} from "./airCombatStorage";
import {
  AirCombatProfile,
  AirCombatReward,
  AirCombatRunSummary,
  AircraftId,
} from "./airCombatTypes";
import { AirCombatBattle } from "./AirCombatBattle";
import { AirCombatResult } from "./AirCombatResult";
import { AircraftPreview } from "./AircraftPreview";
import { CoreDescription } from "./CoreDescription";
import { getSkillTooltipModel } from "./airCombatPresentation";
import { CombatUiIcon } from "./CombatUiIcon";
import { AircraftSelectionStats } from "./CombatStatReadout";
import "./combat-ui.css";
import { ExclusiveFullscreenOverlay, ModalButton, OverlayBody, OverlayHeader } from "../../../components/overlay/AppOverlay";

interface KhongKichScreenProps {
  gameState: GameState;
  onUpdateGameState: (updater: ((draft: GameState) => void) | GameState) => void;
  onBack: () => void;
}

type Phase = "menu" | "stages" | "select" | "playing" | "result";

interface AircraftPressState {
  aircraftId: AircraftId;
  pointerId: number;
  startedAt: number;
  startX: number;
  startY: number;
  timer: number | null;
  held: boolean;
  cancelled: boolean;
}


const KhongKichContent: React.FC<KhongKichScreenProps> = ({
  gameState,
  onUpdateGameState,
  onBack,
}) => {
  const [phase, commitPhase] = useState<Phase>("menu");
  const [leaving,setLeaving]=useState(false);
  const routeTimer=useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(()=>()=>clearTimeout(routeTimer.current),[]);
  const navigate=(action:()=>void)=>{
    if(routeTimer.current)return;
    setLeaving(true);
    routeTimer.current=setTimeout(()=>{action();setLeaving(false);routeTimer.current=undefined;},gameState.settings.reducedMotion?100:180);
  };
  const setPhase=(next:Phase)=>navigate(()=>commitPhase(next));
  const motionClass=`air-screen-motion ${leaving?"air-screen-exit":""} ${gameState.settings.reducedMotion?"air-motion-reduced":""}`;
  const [profile, setProfile] = useState<AirCombatProfile>(() => loadAirCombatProfile());
  const [selectedStage, setSelectedStage] = useState(() => defaultSelectedStage(profile.campaign));
  const stage = getAirCombatStage(selectedStage)!;
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftId | null>(profile.preferredAircraft);
  const [previewAircraft, setPreviewAircraft] = useState<AircraftId | null>(null);
  const aircraftPressRef = useRef<AircraftPressState | null>(null);
  const [completedRun, setCompletedRun] = useState<{
    summary: AirCombatRunSummary;
    reward: AirCombatReward;
    previousHighScore: number;
    newlyUnlockedStage?: number;
  } | null>(null);

  useEffect(() => {
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "auto" });
  }, [phase]);

  const startRun = () => {
    if (!selectedAircraft || !canLaunchStage(selectedStage, loadAirCombatProfile().campaign)) {
      soundManager.playError();
      soundManager.triggerHaptic("light");
      return;
    }
    soundManager.playChallengeStart();
    soundManager.triggerHaptic("medium");
    const nextProfile = { ...loadAirCombatProfile(), preferredAircraft: selectedAircraft };
    nextProfile.campaign = { ...nextProfile.campaign, lastSelectedStage: selectedStage };
    saveAirCombatProfile(nextProfile);
    setProfile(nextProfile);
    navigate(() => { setCompletedRun(null); commitPhase("playing"); });
  };

  const chooseAircraft = (aircraftId: AircraftId) => {
    soundManager.playClick();
    setSelectedAircraft(aircraftId);
  };

  const beginAircraftPress = (
    event: React.PointerEvent<HTMLButtonElement>,
    aircraftId: AircraftId
  ) => {
    const previousPress = aircraftPressRef.current;
    if (previousPress?.timer !== null && previousPress?.timer !== undefined) {
      window.clearTimeout(previousPress.timer);
      previousPress.cancelled = true;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    const press: AircraftPressState = {
      aircraftId,
      pointerId: event.pointerId,
      startedAt: performance.now(),
      startX: event.clientX,
      startY: event.clientY,
      timer: null,
      held: false,
      cancelled: false,
    };
    press.timer = window.setTimeout(() => {
      if (aircraftPressRef.current !== press || press.cancelled) return;
      press.held = true;
      setPreviewAircraft(aircraftId);
      soundManager.triggerHaptic("light");
    }, AIR_COMBAT_WORLD.longPressMs);
    aircraftPressRef.current = press;
  };

  const moveAircraftPress = (event: React.PointerEvent<HTMLButtonElement>) => {
    const press = aircraftPressRef.current;
    if (!press || press.pointerId !== event.pointerId || press.cancelled) return;
    if (Math.hypot(event.clientX - press.startX, event.clientY - press.startY) <= 12) return;
    press.cancelled = true;
    if (press.timer !== null) window.clearTimeout(press.timer);
  };

  const finishAircraftPress = (
    event: React.PointerEvent<HTMLButtonElement>,
    cancelled = false
  ) => {
    const press = aircraftPressRef.current;
    if (!press || press.pointerId !== event.pointerId) return;
    if (press.timer !== null) window.clearTimeout(press.timer);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    aircraftPressRef.current = null;
    if (cancelled || press.cancelled) return;
    if (press.held || performance.now() - press.startedAt >= AIR_COMBAT_WORLD.longPressMs) {
      setPreviewAircraft(press.aircraftId);
      return;
    }
    chooseAircraft(press.aircraftId);
  };

  const finishRun = (summary: AirCombatRunSummary) => {
    const { reward, nextProfile, previousHighScore, firstClear } = settleAirCombatRun(summary);
    const newlyUnlockedStage = firstClear && getAirCombatStage(summary.stageId + 1) ? summary.stageId + 1 : undefined;
    setProfile(nextProfile);
    setCompletedRun({ summary, reward, previousHighScore, newlyUnlockedStage });

    onUpdateGameState((draft) => {
      if (!draft.farm) draft.farm = createDefaultFarmState();
      draft.farm.gold = Math.max(0, draft.farm.gold || 0) + reward.gold;
      if (reward.xp > 0) {
        applyEarnedXpCapped(draft, reward.xp * gameConfig.xpTicksPerXp);
      }
    });

    if (summary.bossDefeated || summary.score > previousHighScore) {
      soundManager.playSuccess();
      soundManager.triggerHaptic("heavy");
    }
    setPhase("result");
  };

  if (phase === "playing" && selectedAircraft) {
    return (
      <ExclusiveFullscreenOverlay
        ariaLabel="Không Kích"
        className={`${motionClass} tactical-battle-screen air-combat-surface flex select-none touch-none items-center justify-center overflow-hidden bg-slate-950 px-1.5 py-1.5`}
        style={{
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          touchAction: "none",
          paddingTop: "max(6px, env(safe-area-inset-top))",
          paddingRight: "max(6px, env(safe-area-inset-right))",
          paddingBottom: "max(6px, env(safe-area-inset-bottom))",
          paddingLeft: "max(6px, env(safe-area-inset-left))",
        }}
        onContextMenu={(e) => e.preventDefault()}
        data-khong-kich-phase="playing"
      >
        <AirCombatBattle
          stageId={selectedStage}
          aircraftId={selectedAircraft}
          reducedMotion={gameState.settings.reducedMotion}
          onComplete={finishRun}
          onExit={() => {
            setPhase("stages");
          }}
        />
      </ExclusiveFullscreenOverlay>
    );
  }

  const previewConfig = previewAircraft ? AIRCRAFT_CONFIGS[previewAircraft] : null;

  if (phase === "result" && completedRun) {
    return (
      <ExclusiveFullscreenOverlay
        ariaLabel="Kết quả Không Kích"
        className={`${motionClass} bg-slate-950`}
      >
        <AirCombatResult
          {...completedRun}
          onReplay={startRun}
          onBack={() => setPhase("stages")}
          onNext={getAirCombatStage(completedRun.summary.stageId + 1) && completedRun.summary.stageVictory ? () => { setSelectedStage(completedRun.summary.stageId + 1); setPhase("stages"); } : undefined}
        />
      </ExclusiveFullscreenOverlay>
    );
  }

  if (phase === "menu") return <ExclusiveFullscreenOverlay ariaLabel="Menu Không Kích" className={`${motionClass} air-campaign-fullscreen`}><AirCombatMainMenu reducedMotion={gameState.settings.reducedMotion} onBack={()=>navigate(onBack)} onStart={() => { setSelectedStage(defaultSelectedStage(profile.campaign)); setPhase("stages"); }} /></ExclusiveFullscreenOverlay>;
  if (phase === "stages") return <div key={phase} className={`${motionClass} air-stage-motion`}><AirCombatStageSelect progress={profile.campaign} selected={selectedStage} onSelect={setSelectedStage} onBack={() => setPhase("menu")} onAircraft={id => {
    if (!canLaunchStage(id, loadAirCombatProfile().campaign)) return;
    setSelectedStage(id); setPhase("select");
  }} /></div>;

  return (
    <div
      className={`${motionClass} command-screen tactical-battle-screen mx-auto w-full max-w-lg flex flex-col justify-start flex-1 min-h-0 px-2.5 sm:px-4 py-[clamp(6px,1.4dvh,16px)] select-none`}
      key={phase}
      data-khong-kich-phase="select"
    >
      {/* Compact Top Navigation Bar */}
      <div className="tactical-battle-header mb-[clamp(4px,1dvh,10px)] flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2">
        <button
          type="button"
          onClick={() => setPhase("stages")}
          className="flex h-[clamp(28px,3.8dvh,34px)] items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/90 px-[clamp(6px,1vw,10px)] text-[clamp(10.5px,1.4dvh,12px)] font-bold text-slate-200 transition-colors hover:bg-slate-800 active:scale-95"
        >
          <ArrowLeft className="h-[clamp(11px,1.5dvh,14px)] w-[clamp(11px,1.5dvh,14px)]" />
          <span>Chọn màn</span>
        </button>

        <div className="flex items-center gap-1 text-[clamp(10.5px,1.4dvh,13px)] font-black uppercase tracking-wider text-sky-300">
          <Crosshair className="h-[clamp(12px,1.6dvh,15px)] w-[clamp(12px,1.6dvh,15px)] text-sky-400" />
          <span>MÀN {String(stage.id).padStart(2, "0")} · {stage.localizedName || stage.displayName}</span>
        </div>

        <div className="flex items-center gap-2 text-right">
          {profile.bestRank && profile.bestRank !== "-" && (
            <div className="text-[clamp(8.5px,1.15dvh,10px)] font-bold text-slate-400">
              <span className="text-[clamp(7px,0.95dvh,8.5px)] font-bold uppercase text-slate-500 mr-1">Hạng</span>
              <span className="font-black text-cyan-300">{profile.bestRank}</span>
            </div>
          )}
          <div className="flex items-center gap-0.5 text-[clamp(9.5px,1.3dvh,11.5px)] font-black text-amber-300">
            <Trophy className="h-[clamp(11px,1.5dvh,13px)] w-[clamp(11px,1.5dvh,13px)] text-amber-400" />
            <span>{profile.highScore.toLocaleString("vi-VN")}</span>
          </div>
        </div>
      </div>

      <h2 className="text-center text-sm font-black text-white">CHỌN CHIẾN CƠ</h2>
      {/* Aircraft Cards Container */}
      <div className="aircraft-selection-grid">
        {AIRCRAFT_ORDER.map((aircraftId) => {
          const config = AIRCRAFT_CONFIGS[aircraftId];
          const stats = getEffectiveAircraftStats(createAircraftCombatState(aircraftId));
          const selected = selectedAircraft === aircraftId;
          return (
            <button
              key={aircraftId}
              type="button"
              onPointerDown={(event) => beginAircraftPress(event, aircraftId)}
              onPointerMove={moveAircraftPress}
              onPointerUp={(event) => finishAircraftPress(event)}
              onPointerCancel={(event) => finishAircraftPress(event, true)}
              onClick={(event) => {
                if (event.detail === 0) chooseAircraft(aircraftId);
              }}
              onContextMenu={(event) => event.preventDefault()}
              data-aircraft-option={aircraftId}
              aria-pressed={selected}
              className={`tactical-card relative w-full touch-pan-y select-none overflow-hidden rounded-xl border p-[clamp(7px,1.3dvh,14px)] text-left transition-all active:scale-[.99] ${
                selected
                  ? "border-sky-300/80 bg-sky-400/10 shadow-md shadow-sky-950/40"
                  : "border-slate-800 bg-slate-900/80 hover:bg-slate-900"
              }`}
            >
              <div
                className="pointer-events-none absolute -left-4 -top-4 h-20 w-20 rounded-full blur-2xl"
                style={{ backgroundColor: `${config.color}18` }}
              />
              <div className="aircraft-selection-card-body">
                <div className="flex flex-col items-center">
                  <AircraftPreview
                    aircraftId={aircraftId}
                    className="h-[clamp(46px,6.8dvh,64px)] w-[clamp(46px,6.8dvh,64px)]"
                  />
                  <span
                    className="status-tag rounded-full border px-[clamp(5px,0.8vw,8px)] py-[clamp(1px,0.2dvh,2.5px)] text-[clamp(7px,1dvh,8.5px)] font-black leading-tight mt-[clamp(2px,0.4dvh,4px)]"
                    style={{
                      color: config.color,
                      borderColor: `${config.color}55`,
                      backgroundColor: `${config.color}12`,
                    }}
                  >
                    {config.role}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <div
                        className="text-[clamp(7.5px,1.05dvh,9px)] font-black uppercase tracking-wider leading-none"
                        style={{ color: config.color }}
                      >
                        {config.code}
                      </div>
                      <h3
                        className="text-[clamp(12.5px,1.7dvh,15px)] font-black leading-tight truncate"
                        style={{ color: selected ? config.accent : "#e2e8f0" }}
                      >
                        {config.name}
                      </h3>
                    </div>
                    {selected && (
                      <span className="shrink-0 rounded-full bg-sky-300 px-[clamp(5px,0.8vw,8px)] py-[clamp(1.5px,0.3dvh,3px)] text-[clamp(7px,1dvh,8.5px)] font-black uppercase text-slate-950">
                        Đã chọn
                      </span>
                    )}
                  </div>
                  <p className="mt-[clamp(1px,0.3dvh,3px)] line-clamp-1 text-[clamp(7.5px,1.05dvh,9.5px)] leading-tight text-slate-400">
                    {config.description}
                  </p>

                </div>
              </div>
              <AircraftSelectionStats stats={stats} />
              <div className="relative mt-[clamp(4px,0.8dvh,8px)] grid grid-cols-3 gap-[clamp(3px,0.6vw,6px)] border-t border-slate-700/60 pt-[clamp(4px,0.8dvh,8px)]">
                {config.skillIds.map((skillId) => {
                  const skill = SKILL_CONFIGS[skillId];
                  return (
                    <div
                      key={skillId}
                      className="min-w-0 rounded-md bg-slate-950/60 px-[clamp(3px,0.6vw,6px)] py-[clamp(1.5px,0.35dvh,4px)] text-center"
                    >
                      <CombatUiIcon kind="skill" id={skillId} fallback={skill.icon} className="!h-7 !w-7" />
                      <div className="mt-[clamp(1px,0.2dvh,2px)] truncate text-[clamp(7px,0.95dvh,8.5px)] font-black text-slate-300">
                        {skill.shortName}
                      </div>
                      <div className="text-[clamp(6px,0.85dvh,7.5px)] font-bold text-sky-400">
                        {skill.id === "escort_drone" ? "≥5" : skill.cost} · {skill.cooldown}s
                      </div>
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Button: XUẤT KÍCH */}
      <button
        type="button"
        onClick={startRun}
        disabled={!selectedAircraft}
        data-start-air-combat={selectedAircraft ?? "none"}
        className={`mt-[clamp(6px,1.2dvh,14px)] flex h-[clamp(42px,5.8dvh,54px)] w-full items-center justify-center gap-1.5 rounded-xl text-[clamp(13px,1.7dvh,16px)] font-black transition active:scale-[.98] ${
          selectedAircraft
            ? "bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 text-slate-950 shadow-lg shadow-sky-500/25"
            : "cursor-not-allowed border border-slate-800 bg-slate-900/90 text-slate-500"
        }`}
      >
        <span>{selectedAircraft ? "XUẤT KÍCH" : "Chọn chiến cơ để xuất kích"}</span>
        <ChevronRight className="h-[clamp(14px,1.9dvh,18px)] w-[clamp(14px,1.9dvh,18px)]" />
      </button>

      {/* Skill Preview Modal */}
      <AnimatePresence>{previewConfig && (
        <AppModal key="preview" archetype="info"
          onClose={() => setPreviewAircraft(null)}
          labelledBy="aircraft-preview-title"
          panelProps={{ "data-aircraft-preview": previewConfig.id } as React.HTMLAttributes<HTMLElement>}
        >
            <OverlayHeader className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--modal-info)]">
                  Xem trước kỹ năng · {previewConfig.code}
                </div>
                <h3 id="aircraft-preview-title" className="modal-title">{previewConfig.name}</h3>
              </div>
              <ModalButton variant="icon"
                type="button"
                aria-label="Đóng xem trước kỹ năng"
                onClick={() => setPreviewAircraft(null)}
              >
                <X className="h-4 w-4" />
              </ModalButton>
            </OverlayHeader>
            <OverlayBody>
              <p className="text-xs leading-relaxed text-[var(--modal-muted)]">
                {previewConfig.description}
              </p>
            <AircraftSelectionStats stats={getEffectiveAircraftStats(createAircraftCombatState(previewConfig.id))} />
            <div className="mt-3 space-y-1.5">
              {previewConfig.skillIds.map((skillId, index) => {
                const skill = SKILL_CONFIGS[skillId];
                return (
                  <article
                    key={skillId}
                    data-aircraft-preview-skill={skillId}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-400/10 text-lg">
                        <CombatUiIcon kind="skill" id={skillId} fallback={skill.icon} className="!h-8 !w-8" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold uppercase text-[var(--modal-info)]">
                          Skill {index + 1}
                        </div>
                        <div className="font-semibold text-xs text-[var(--modal-text)]">{skill.name}</div>
                      </div>
                      <div className="ml-auto text-right text-xs font-bold text-[var(--modal-muted)]">
                        <div>{skill.id === "escort_drone" ? "Cần ≥5 Điện · bật không trừ phí" : `${skill.cost} ${previewConfig.resourceKind === "mana" ? "Mana" : "Điện"}`}</div>
                        <div>{skill.cooldown}s hồi chiêu</div>
                      </div>
                    </div>
                    <p className="mt-1 text-[9.5px] leading-relaxed text-[var(--modal-text)]">
                      <CoreDescription text={getSkillTooltipModel(createAircraftCombatState(previewConfig.id),skillId).description}/>
                    </p>
                  </article>
                );
              })}
            </div>
            </OverlayBody>
        </AppModal>
      )}</AnimatePresence>

      <p className="mt-2 text-center text-[10px] text-slate-400">Giữ và kéo trên chiến trường để lái · thả tay để đứng yên.<br />Dùng ngón tay thứ hai để kích hoạt kỹ năng.</p>

    </div>
  );
};

export const KhongKichScreen: React.FC<KhongKichScreenProps> = props => <AirCombatMotionContext.Provider value={props.gameState.settings.reducedMotion}><MotionConfig reducedMotion={props.gameState.settings.reducedMotion?"always":"user"}><KhongKichContent {...props}/></MotionConfig></AirCombatMotionContext.Provider>;
