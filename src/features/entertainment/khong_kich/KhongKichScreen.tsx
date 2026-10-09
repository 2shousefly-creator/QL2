import { AirCombatModeSelect } from "./AirCombatModeSelect";
import { AirCombatSoloSetup } from "./AirCombatSoloSetup";
import { AirCombatSoloBattle } from "./AirCombatSoloBattle";
import { AirCombatSoloResult } from "./AirCombatSoloResult";
import { createSoloMatch, type SoloMatch, type SoloSetup } from "./airCombatDuelRuntime";
import { MotionConfig } from "motion/react";
import { AirCombatMotionContext } from "./AirCombatMotion";
import { AirCombatMainMenu, AirCombatStageSelect } from "./AirCombatCampaign";
import { canLaunchStage, defaultSelectedStage, getAirCombatStage } from "./airCombatStages";
import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Crosshair,
  Trophy,
} from "lucide-react";
import { soundManager } from "../../../game/audio";
import { gameConfig } from "../../../game/config";
import { GameState } from "../../../game/types";
import { applyEarnedXpCapped } from "../../../game/xpEngine";
import { createDefaultFarmState } from "../../tang_gia/farmEngine";
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
import { AircraftSelection } from "./AircraftSelection";
import "./combat-ui.css";
import { ExclusiveFullscreenOverlay } from "../../../components/overlay/AppOverlay";

interface KhongKichScreenProps {
  gameState: GameState;
  onUpdateGameState: (updater: ((draft: GameState) => void) | GameState) => void;
  onBack: () => void;
}

type Phase = "mode" | "solo_setup" | "solo_match" | "solo_result" | "menu" | "stages" | "select" | "playing" | "result";

const KhongKichContent: React.FC<KhongKichScreenProps> = ({
  gameState,
  onUpdateGameState,
  onBack,
}) => {
  const [solo, setSolo] = useState<SoloMatch | null>(null);
  const [phase, commitPhase] = useState<Phase>("menu");
  const [leaving,setLeaving]=useState(false);
  const routeTimer=useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(()=>()=>clearTimeout(routeTimer.current),[]);
  const navigate=(action:()=>void)=>{
    if(routeTimer.current)return;
    setLeaving(true);
    routeTimer.current=setTimeout(()=>{action();setLeaving(false);routeTimer.current=undefined;},gameState.settings.reducedMotion?100:180);
  };
  const setPhase=(next:Phase)=>navigate(()=>{if(next==="select")setSelectedAircraft(null);commitPhase(next);});
  const motionClass=`air-screen-motion ${leaving?"air-screen-exit":""} ${gameState.settings.reducedMotion?"air-motion-reduced":""}`;
  const [profile, setProfile] = useState<AirCombatProfile>(() => loadAirCombatProfile());
  const [selectedStage, setSelectedStage] = useState(() => defaultSelectedStage(profile.campaign));
  const stage = getAirCombatStage(selectedStage)!;
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftId | null>(null);
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

  const launchSolo = (setup: SoloSetup) => { setSolo(createSoloMatch(setup)); setPhase("solo_match"); };
  const soloMenu = () => { setSolo(null); setPhase("menu"); };
  if (phase === "mode" || phase === "solo_setup" || phase === "solo_result") return <ExclusiveFullscreenOverlay ariaLabel="Không Kích SOLO" className={motionClass + " air-solo-fullscreen" + (phase !== "solo_result" ? " air-solo-selection-surface" : "")} data-solo-screen={phase}>
    {phase === "mode" && <AirCombatModeSelect onCampaign={() => { setSelectedStage(defaultSelectedStage(profile.campaign)); setPhase("stages"); }} onSolo={() => setPhase("solo_setup")} onBack={() => setPhase("menu")} />}
    {phase === "solo_setup" && <AirCombatSoloSetup onStart={launchSolo} onBack={() => setPhase("mode")} onMenu={soloMenu} />}
    {phase === "solo_result" && solo && <AirCombatSoloResult match={solo} onRematch={() => launchSolo(solo.setup)} onMenu={soloMenu} />}
  </ExclusiveFullscreenOverlay>;

  if ((phase === "playing" && selectedAircraft) || (phase === "solo_match" && solo)) {
    return (
      <ExclusiveFullscreenOverlay
        ariaLabel="Không Kích"
        data-ui-skin="legacy" className={`${motionClass} tactical-battle-screen air-combat-surface flex select-none touch-none items-center justify-center overflow-hidden bg-slate-950 px-1.5 py-1.5`}
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
        {phase === "solo_match" && solo ? <AirCombatSoloBattle match={solo} reducedMotion={gameState.settings.reducedMotion} onComplete={() => setPhase("solo_result")} onMenu={soloMenu} /> : <AirCombatBattle
          stageId={selectedStage}
          aircraftId={selectedAircraft!}
          reducedMotion={gameState.settings.reducedMotion}
          onComplete={finishRun}
          onExit={() => {
            setPhase("stages");
          }}
        />}
      </ExclusiveFullscreenOverlay>
    );
  }

  if (phase === "result" && completedRun) {
    return (
      <ExclusiveFullscreenOverlay
        ariaLabel="Kết quả Không Kích"
        data-ui-skin="legacy" className={`${motionClass} bg-slate-950`}
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

  if (phase === "menu") return <ExclusiveFullscreenOverlay ariaLabel="Menu Không Kích" data-ui-skin="legacy" className={`${motionClass} air-campaign-fullscreen`}><AirCombatMainMenu reducedMotion={gameState.settings.reducedMotion} onBack={()=>navigate(onBack)} onStart={() => setPhase("mode")} /></ExclusiveFullscreenOverlay>;
  if (phase === "stages") return <div key={phase} data-ui-skin="legacy" className={`${motionClass} air-stage-motion`}><AirCombatStageSelect progress={profile.campaign} selected={selectedStage} onSelect={setSelectedStage} onBack={() => setPhase("menu")} onAircraft={id => {
    if (!canLaunchStage(id, loadAirCombatProfile().campaign)) return;
    setSelectedStage(id); setPhase("select");
  }} /></div>;

  return (
    <div
      data-ui-skin="legacy" className={`${motionClass} command-screen tactical-battle-screen air-campaign-selection mx-auto w-full max-w-lg flex flex-col justify-start flex-1 min-h-0 px-2.5 sm:px-4 py-[clamp(6px,1.4dvh,16px)] select-none`}
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
      <AircraftSelection side="player" selected={selectedAircraft} onSelect={chooseAircraft} onConfirm={startRun} />

      <p className="mt-2 text-center text-[10px] text-slate-400">Giữ và kéo trên chiến trường để lái · thả tay để đứng yên.<br />Dùng ngón tay thứ hai để kích hoạt kỹ năng.</p>

    </div>
  );
};

export const KhongKichScreen: React.FC<KhongKichScreenProps> = props => <AirCombatMotionContext.Provider value={props.gameState.settings.reducedMotion}><MotionConfig reducedMotion={props.gameState.settings.reducedMotion?"always":"user"}><KhongKichContent {...props}/></MotionConfig></AirCombatMotionContext.Provider>;
