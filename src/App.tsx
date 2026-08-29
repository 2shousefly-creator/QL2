import React, { useEffect, useState, useRef, useCallback } from "react";
import { HomeScreen } from "./features/home/HomeScreen";
import { JourneyMapScreen } from "./features/journey/JourneyMapScreen";
import { TrainingScreen } from "./features/training/TrainingScreen";
import { RanksScreen } from "./features/ranks/RanksScreen";
import { ProfileScreen } from "./features/profile/ProfileScreen";
import { MedalsScreen } from "./features/profile/MedalsScreen";
import { MasteryScreen } from "./features/profile/MasteryScreen";
import { IdCardScreen } from "./features/profile/IdCardScreen";
import { JournalScreen } from "./features/profile/JournalScreen";
import { UniformScreen } from "./features/profile/UniformScreen";
import { MedalUnlockModal } from "./components/MedalUnlockModal";
import { TangGiaScreen } from "./features/tang_gia/TangGiaScreen";
import { EntertainmentHubScreen } from "./features/entertainment/EntertainmentHubScreen";
import { PromotionChallenge } from "./components/PromotionChallenge";
import { PromotionCeremony } from "./components/PromotionCeremony";
import { DelegationReportModal } from "./components/DelegationReportModal";
import { HubNavigation } from "./components/HubNavigation";
import { Avatar } from "./components/Avatar";
import {
  createInitialGameState,
} from "./storage/GameRepository";
import { localGameRepository } from "./storage/LocalGameRepository";
import { settleEarning, getRequiredXpTicksForTransition } from "./game/xpEngine";
import { ensureEnergyState, getEnergyMultiplier, getEnergyVisuals, isEnergyActive } from "./game/energyEngine";
import { registerServiceWorker, sendRankUpReadyNotification } from "./game/notifications";
import { ensurePushRegistration, syncXpFullPushSchedule } from "./game/pushManager";
import { canStartPromotionChallenge, completePromotionChallenge, dismissPromotionCeremony } from "./game/promotionEngine";
import { getPlayerNextRank, getPlayerRank, getXpProgressDetails } from "./game/selectors";
import { gameConfig } from "./game/config";
import { soundManager } from "./game/audio";
import { DelegationReportData, EarningMode, GameState, TabType } from "./game/types";
import { RANK_STEPS } from "./game/rankBuilder";
import { Zap, Sparkles } from "lucide-react";
import { MandatoryUpdateModal } from "./app-update/MandatoryUpdateModal";
import { checkForAppUpdate } from "./app-update/versionService";
import { recoverPendingAppUpdate } from "./app-update/updateBackupService";
import { StartupGate } from "./app-update/updateTypes";

function isUserActiveOnline(): boolean {
  if (typeof document === "undefined") return true;
  const isVisible = document.visibilityState === "visible";
  const isOnline = typeof navigator !== "undefined" && typeof navigator.onLine === "boolean" ? navigator.onLine : true;
  if (!isVisible || !isOnline) return false;
  
  if (typeof document.hasFocus === "function") {
    return document.hasFocus();
  }
  return true;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const [isRankDetailOpen, setIsRankDetailOpen] = useState(false);
  const [isTrainingGameActive, setIsTrainingGameActive] = useState(false);
  const [isTroughInfoActive, setIsTroughInfoActive] = useState(false);
  const [delegationReport, setDelegationReport] = useState<DelegationReportData | null>(null);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [startupGate, setStartupGate] = useState<StartupGate>("checking-version");
  const [latestBuildId, setLatestBuildId] = useState<string | null>(null);

  const gameStateRef = useRef<GameState | null>(null);
  gameStateRef.current = gameState;

  // Reset trough info active status when tab changes
  useEffect(() => {
    setIsTroughInfoActive(false);
  }, [activeTab]);

  // 1. Initial Load & Version Gate
  useEffect(() => {
    async function init() {
      console.log("[UPDATE] bootstrap started");

      // Step A: Check and recover from pending update backup if present
      const recoveryResult = await recoverPendingAppUpdate();
      if (recoveryResult.restored && recoveryResult.restoredState) {
        console.log("[UPDATE] pending update backup recovered successfully");
        setShowUpdateToast(true);
        setTimeout(() => setShowUpdateToast(false), 6000);
      } else if (typeof window !== "undefined" && window.localStorage?.getItem("quan_lo_just_updated") === "true") {
        window.localStorage.removeItem("quan_lo_just_updated");
        setShowUpdateToast(true);
        setTimeout(() => setShowUpdateToast(false), 6000);
      }

      // Step B: Mandatory Version Check against persistent installedBuildId vs latest server version
      const versionResult = await checkForAppUpdate();
      if (versionResult.status === "update-required") {
        console.log("[UPDATE] mandatory update required on bootstrap gate");
        let state = await localGameRepository.load();
        if (!state) state = createInitialGameState();
        setGameState(state);
        setLatestBuildId(versionResult.latestBuildId);
        setStartupGate("mandatory-update");
        return; // HARD BLOCK: Do not process offline progress or enter normal startup yet
      }

      // Step C: Normal Startup
      let state = await localGameRepository.load();
      if (!state) {
        state = createInitialGameState();
      }

      const now = Date.now();
      // Calculate delegation settlement for elapsed time since last session
      const { reportData } = settleEarning(state, now, "delegation");
      
      // Determine real-time active state upon launch
      const active = isUserActiveOnline();
      state.time.currentEarningMode = active ? "direct_online" : "delegation";

      await localGameRepository.save(state);
      setGameState({ ...state });

      if (reportData) {
        setDelegationReport(reportData);
      }

      setStartupGate("normal-startup");
    }
    init();
  }, []);

  // 2. Real-time Focus, Visibility & Connection State Listeners
  useEffect(() => {
    if (!gameState) return;

    const handleActivityChange = () => {
      setGameState((prev) => {
        if (!prev) return prev;
        const now = Date.now();
        const active = isUserActiveOnline();
        const prevMode = prev.time.currentEarningMode;
        const targetMode: EarningMode = active ? "direct_online" : "delegation";

        if (prevMode === targetMode && now - prev.time.lastSettledAt < 500) {
          return prev;
        }

        const draft = JSON.parse(JSON.stringify(prev)) as GameState;
        const { reportData } = settleEarning(draft, now, prevMode);
        draft.time.currentEarningMode = targetMode;
        localGameRepository.save(draft);

        if (reportData && active && prevMode === "delegation") {
          setDelegationReport(reportData);
        }

        return draft;
      });
    };

    const onVisibilityChange = () => handleActivityChange();
    const onFocus = () => handleActivityChange();
    const onBlur = () => handleActivityChange();
    const onOnline = () => handleActivityChange();
    const onOffline = () => handleActivityChange();
    const onBeforeUnload = () => handleActivityChange();
    const onPageHide = () => handleActivityChange();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [gameState !== null]);

  // 3. Real-time Ticking Loop
  useEffect(() => {
    if (!gameState) return;

    const interval = setInterval(() => {
      let pendingReport: DelegationReportData | null = null;
      setGameState((prev) => {
        if (!prev) return prev;
        const now = Date.now();
        const active = isUserActiveOnline();
        const targetMode: EarningMode = active ? "direct_online" : "delegation";

        const draft = JSON.parse(JSON.stringify(prev)) as GameState;
        const { reportData } = settleEarning(draft, now, targetMode);
        localGameRepository.save(draft);

        if (reportData && active && targetMode === "direct_online") {
          pendingReport = reportData;
        }
        return draft;
      });

      if (pendingReport) {
        setTimeout(() => {
          setDelegationReport(pendingReport);
        }, 0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState !== null]);

  // 3.5. Register Service Worker on Mount & SW waiting listener
  useEffect(() => {
    registerServiceWorker(async () => {
      console.log("[UPDATE] SW state: waiting worker detected -> triggering version check");
      const res = await checkForAppUpdate(true);
      if (res.status === "update-required") {
        console.log("[UPDATE] mandatory update required via SW waiting event");
        setLatestBuildId(res.latestBuildId);
        setStartupGate("mandatory-update");
      }
    });
  }, []);

  // 3.6. Foreground Version Recheck Listener (visibilitychange, pageshow, focus, online)
  const lastForegroundCheckRef = useRef<number>(0);
  const FOREGROUND_COOLDOWN_MS = 15_000;

  useEffect(() => {
    const runForegroundRecheck = async () => {
      const now = Date.now();
      if (now - lastForegroundCheckRef.current < FOREGROUND_COOLDOWN_MS) {
        return;
      }
      lastForegroundCheckRef.current = now;

      if (document.visibilityState === "visible") {
        console.log("[UPDATE] visibility became visible");
      }
      console.log("[UPDATE] foreground recheck");

      const res = await checkForAppUpdate(true);
      if (res.status === "update-required") {
        console.log("[UPDATE] mandatory update required during foreground recheck");
        setLatestBuildId(res.latestBuildId);
        setStartupGate("mandatory-update");
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        runForegroundRecheck();
      }
    };

    const onPageShow = () => runForegroundRecheck();
    const onFocus = () => runForegroundRecheck();
    const onOnline = () => runForegroundRecheck();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  // 4. Ensure Web Push registration when notification setting is enabled
  useEffect(() => {
    if (!gameState) return;
    if (gameState.settings.notificationsEnabled) {
      ensurePushRegistration();
    }
  }, [gameState?.settings.notificationsEnabled]);

  // 4.5. In-app / foreground notification when XP bar fills up
  useEffect(() => {
    if (!gameState) return;
    const xpDetails = getXpProgressDetails(gameState);
    const currentRankIndex = gameState.progression.currentRankIndex;
    const currentRank = getPlayerRank(gameState);
    const nextRank = getPlayerNextRank(gameState);
    const notificationsEnabled = gameState.settings.notificationsEnabled;

    if (xpDetails.isFull && !xpDetails.isMaxRank) {
      if (notificationsEnabled) {
        sendRankUpReadyNotification(currentRank.displayName, nextRank?.displayName, currentRankIndex);
      }
    }
  }, [
    gameState?.progression.xpIntoCurrentRankTicks,
  ]);

  // Sync server schedule on rank change or notification toggle (not on every XP tick)
  useEffect(() => {
    if (!gameState) return;
    syncXpFullPushSchedule(gameState);
  }, [
    gameState?.progression.currentRankIndex,
    gameState?.settings.notificationsEnabled,
  ]);

  // Sync server schedule whenever user closes/hides tab, locks screen, or unload
  useEffect(() => {
    const handleSyncOnExit = () => {
      if (gameStateRef.current) {
        syncXpFullPushSchedule(gameStateRef.current, true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleSyncOnExit();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handleSyncOnExit);
    window.addEventListener("beforeunload", handleSyncOnExit);

    // Heartbeat every 5 minutes while app is visible
    const heartbeatTimer = setInterval(() => {
      if (document.visibilityState === "visible" && gameStateRef.current) {
        syncXpFullPushSchedule(gameStateRef.current);
      }
    }, 300_000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleSyncOnExit);
      window.removeEventListener("beforeunload", handleSyncOnExit);
      clearInterval(heartbeatTimer);
    };
  }, []);

  // Helper to update state cleanly (supports function updater or direct GameState object)
  const handleUpdateState = useCallback((updater: ((draft: GameState) => void) | GameState) => {
    queueMicrotask(() => {
      setGameState((prev) => {
        if (!prev) return prev;
        if (typeof updater === "function") {
          const draft = JSON.parse(JSON.stringify(prev)) as GameState;
          updater(draft);
          localGameRepository.save(draft);
          return draft;
        } else if (updater && typeof updater === "object") {
          localGameRepository.save(updater);
          return updater;
        }
        return prev;
      });
    });
  }, []);

  const handleResetGame = async () => {
    soundManager.playClick();
    await localGameRepository.clear();
    const fresh = createInitialGameState();
    await localGameRepository.save(fresh);
    setGameState(fresh);
    setActiveTab("home");
    setIsChallengeActive(false);
  };

  // Start Promotion Challenge
  const handleStartChallenge = () => {
    if (!gameState) return;
    if (canStartPromotionChallenge(gameState)) {
      setIsChallengeActive(true);
    }
  };

  // Challenge Completed
  const handleChallengeComplete = (
    completedAtEpochMs: number,
    completedChallengeStats: {
      configuredDurationMs: number;
      elapsedRealMs: number;
      bubbleHitCount: number;
      bubbleReductionMs: number;
      correctCount?: number;
      totalQuestions?: number;
    }
  ) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const draft = JSON.parse(JSON.stringify(prev)) as GameState;
      completePromotionChallenge(draft, completedAtEpochMs, completedChallengeStats);
      localGameRepository.save(draft);
      return draft;
    });
    setIsChallengeActive(false);
  };

  // Cancel Challenge
  const handleChallengeCancel = (reason: string) => {
    if (reason === "Rớt sát hạch") {
      setGameState((prev) => {
        if (!prev) return prev;
        const draft = JSON.parse(JSON.stringify(prev)) as GameState;
        const targetRank = draft.progression.currentRankIndex + 1;
        if (!draft.progression.rankRetries) {
          draft.progression.rankRetries = {};
        }
        draft.progression.rankRetries[targetRank] = (draft.progression.rankRetries[targetRank] || 0) + 1;
        localGameRepository.save(draft);
        return draft;
      });
    }
    setIsChallengeActive(false);
  };

  // Dismiss Promotion Ceremony
  const handleDismissCeremony = () => {
    setGameState((prev) => {
      if (!prev) return prev;
      const draft = JSON.parse(JSON.stringify(prev)) as GameState;
      dismissPromotionCeremony(draft, Date.now());
      localGameRepository.save(draft);
      return draft;
    });
  };

  // Handle Delegation Report Actions
  const handleDismissReport = useCallback(() => {
    if (!delegationReport) return;
    const reportId = delegationReport.id;
    setDelegationReport(null);
    setGameState((prev) => {
      if (!prev) return prev;
      const draft = JSON.parse(JSON.stringify(prev)) as GameState;
      draft.ui.lastSeenDelegationReportAt = reportId;
      localGameRepository.save(draft);
      return draft;
    });
  }, [delegationReport]);

  const handleReportAction = useCallback((action: DelegationReportData["topPriority"]) => {
    if (!delegationReport) return;
    const reportId = delegationReport.id;
    setDelegationReport(null);

    setGameState((prev) => {
      if (!prev) return prev;
      const draft = JSON.parse(JSON.stringify(prev)) as GameState;
      draft.ui.lastSeenDelegationReportAt = reportId;

      localGameRepository.save(draft);
      return draft;
    });

    soundManager.playClick();

    if (action === "xp_full") {
      if (gameStateRef.current && canStartPromotionChallenge(gameStateRef.current)) {
        setIsChallengeActive(true);
      } else {
        setActiveTab("home");
      }
    } else if (action === "watering" || action === "harvest" || action === "animal_egg") {
      setActiveTab("tang_gia");
    } else if (action === "medals") {
      setActiveTab("medals");
    }
  }, [delegationReport]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-amber-300 tracking-wider uppercase">
            Đang tải dữ liệu quân hàm...
          </span>
        </div>
      </div>
    );
  }

  const currentRank = getPlayerRank(gameState);
  const xpDetails = getXpProgressDetails(gameState);
  const pendingCeremony = gameState.ui.pendingPromotionCeremony;
  const promotedRank = pendingCeremony
    ? RANK_STEPS[pendingCeremony.promotedRankIndex]
    : null;
  const previousRank = pendingCeremony && pendingCeremony.promotedRankIndex > 0
    ? RANK_STEPS[pendingCeremony.promotedRankIndex - 1]
    : currentRank;

  return (
    <div className="h-screen h-[100dvh] bg-slate-950 text-white font-sans overflow-hidden relative flex flex-col">
      {/* Game World Ambient Glow Backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950" />
        <div className="absolute bottom-0 w-full h-1/2 bg-emerald-950/20 blur-3xl" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-[130px]" />
      </div>

      {/* Top Gaming HUD Header (Auto-hidden when in Minigames, Challenge, or Trough Info Modal) */}
      {!isTrainingGameActive && !isChallengeActive && !isTroughInfoActive && (
        <header className="relative z-10 bg-slate-900/70 backdrop-blur-md border-b border-white/10 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab("profile");
                }}
                className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-full"
                title="Mở Hồ Sơ & Cài Đặt"
              >
                <Avatar seed={gameState.player.avatarSeed} size={48} />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {gameState.player.displayName}
                  </span>
                </div>
                <h1 className="text-sm font-extrabold text-slate-100 line-clamp-1">
                  {currentRank.displayName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(() => {
                const energyState = ensureEnergyState(gameState);
                const energyPercent = Math.max(0, Math.min(100, energyState.percent));
                const isOnline = gameState.time.currentEarningMode === "direct_online";
                const active = isEnergyActive(gameState, gameState.time.currentEarningMode);
                const energyMult = getEnergyMultiplier(energyPercent, active);
                const energyVisuals = getEnergyVisuals(energyPercent, active);

                return (
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1 text-xs font-extrabold">
                      <Zap className={`w-3.5 h-3.5 ${energyVisuals.textColor} ${active && energyMult > 1 ? "fill-current animate-pulse" : "opacity-80"}`} />
                      <span className={`font-extrabold ${energyVisuals.textColor}`}>
                        {Math.round(energyPercent)}%
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-black border ${energyVisuals.borderColor} ${energyVisuals.textColor} bg-slate-950/80`}>
                        {active ? `${energyMult},0x` : "Boost tạm dừng"}
                      </span>
                    </div>

                    {/* Energy Progress Bar */}
                    <div className="w-20 sm:w-24 h-2.5 rounded-full bg-slate-950 border border-slate-700/80 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${energyVisuals.bgColor} ${energyVisuals.glowColor}`}
                        style={{ width: `${Math.max(2, energyPercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </header>
      )}

      {/* Main Interactive Body Area */}
      <main className={`relative z-10 flex-1 min-h-0 flex flex-col ${activeTab === "home" ? "overflow-hidden" : isTrainingGameActive ? "overflow-y-auto" : "overflow-y-auto pb-28"}`}>
        <div
          key={activeTab}
          className="w-full h-full flex-1 min-h-0 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {activeTab === "home" && (
            <HomeScreen
              state={gameState}
              onStartChallenge={handleStartChallenge}
              onDetailSheetToggle={setIsRankDetailOpen}
              onNavigateToJourney={() => setActiveTab("journey")}
            />
          )}
          {activeTab === "journey" && (
            <JourneyMapScreen
              gameState={gameState}
            />
          )}
          {activeTab === "training" && (
            <TrainingScreen
              gameState={gameState}
              onUpdateGameState={handleUpdateState}
              onGameActiveChange={setIsTrainingGameActive}
            />
          )}
          {activeTab === "ranks" && (
            <RanksScreen
              state={gameState}
              onDetailSheetToggle={setIsRankDetailOpen}
            />
          )}
          {activeTab === "profile" && (
            <ProfileScreen
              state={gameState}
              onUpdateState={handleUpdateState}
              onResetGame={handleResetGame}
            />
          )}
          {activeTab === "medals" && (
            <MedalsScreen
              state={gameState}
              onUpdateState={handleUpdateState}
              onBack={() => setActiveTab("profile")}
            />
          )}
          {activeTab === "mastery" && (
            <MasteryScreen
              state={gameState}
              onBack={() => setActiveTab("profile")}
            />
          )}
          {activeTab === "idCard" && (
            <IdCardScreen
              state={gameState}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}
          {activeTab === "journal" && (
            <JournalScreen
              state={gameState}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}
          {activeTab === "uniform" && (
            <UniformScreen
              state={gameState}
              onBack={() => setActiveTab("profile")}
            />
          )}
          {activeTab === "entertainment" && (
            <EntertainmentHubScreen
              gameState={gameState}
              onUpdateGameState={handleUpdateState}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onGameActiveChange={setIsTrainingGameActive}
            />
          )}
          {activeTab === "tang_gia" && (
            <TangGiaScreen
              gameState={gameState}
              onUpdateGameState={handleUpdateState}
              onTroughInfoToggle={setIsTroughInfoActive}
            />
          )}
        </div>
      </main>

      {/* Hub Bottom Navigation */}
      <HubNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isHidden={isRankDetailOpen || isChallengeActive || isTrainingGameActive}
        gameState={gameState}
      />

      {/* Active Promotion Challenge Screen */}
      {isChallengeActive && (
        <PromotionChallenge
          currentRank={currentRank}
          nextRank={RANK_STEPS[gameState.progression.currentRankIndex + 1]}
          durationMs={
            currentRank.familyId !== RANK_STEPS[gameState.progression.currentRankIndex + 1]?.familyId
              ? 60_000
              : 30_000
          }
          onComplete={handleChallengeComplete}
          onCancel={handleChallengeCancel}
        />
      )}

      {/* Pending Promotion Ceremony Screen */}
      {pendingCeremony && promotedRank && (
        <PromotionCeremony
          promotedRank={promotedRank}
          previousRank={previousRank}
          promotionKind={pendingCeremony.promotionKind}
          onDismiss={handleDismissCeremony}
        />
      )}

      {/* PRIORITY 1: Mandatory App Update Modal */}
      {startupGate === "mandatory-update" && latestBuildId && (
        <MandatoryUpdateModal
          latestBuildId={latestBuildId}
          currentState={gameState}
        />
      )}

      {/* Offline Delegation Report Modal (Only rendered after normal startup gate) */}
      {startupGate === "normal-startup" && delegationReport && (
        <DelegationReportModal
          report={delegationReport}
          onAction={handleReportAction}
          onDismiss={handleDismissReport}
        />
      )}

      {/* Medal Unlock Congratulatory Modal */}
      {startupGate === "normal-startup" && (
        <MedalUnlockModal
          gameState={gameState}
          onUpdateState={handleUpdateState}
        />
      )}

      {/* Manual Update Success Toast */}
      {showUpdateToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12 bg-emerald-950/95 border border-emerald-500/80 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-xs font-semibold animate-bounce">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Đã cập nhật lên phiên bản mới nhất! Tiến trình chơi được bảo toàn.</span>
          </div>
          <button
            onClick={() => setShowUpdateToast(false)}
            className="text-emerald-400 hover:text-emerald-100 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
