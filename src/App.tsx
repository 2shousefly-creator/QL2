import { acquireGameWriter, isGameWriter } from "./storage/gameWriter";
import { cloneEarningState } from "./game/cloneEarningState";
import { UiSkinProvider } from "./components/core-visual/UiSkinContext";
import { CoreScreenTransition } from "./components/core-visual/CoreScreenTransition";
import { FARM_MOBILE_REQUESTED } from "./features/tang_gia/mobile/mobileGate";
import { ScreenLoadBoundary } from "./components/ScreenLoadBoundary";
import { useOverlayBusy } from "./components/overlay/AppOverlay";
import { ModalButton, OverlayHost, OverlayPortal, useAppChromeMetrics } from "./components/overlay/AppOverlay";
import React, { lazy, Suspense, useEffect, useState, useRef, useCallback } from "react";
import { HomeScreen } from "./features/home/HomeScreen";
import { MedalUnlockModal } from "./components/MedalUnlockModal";
import { PromotionChallenge } from "./components/PromotionChallenge";
import { PromotionCeremony } from "./components/PromotionCeremony";
import { DelegationReportModal } from "./components/DelegationReportModal";
import { HubNavigation } from "./components/HubNavigation";
import { Avatar } from "./components/Avatar";
import {
  createInitialGameState,
} from "./storage/GameRepository";
import { localGameRepository } from "./storage/LocalGameRepository";
import { settleEarning } from "./game/xpEngine";
import { captureDelegationStart, createDelegationReport } from "./game/delegationReport";
import { ensureEnergyState, getEnergyMultiplier, getEnergyVisuals, isEnergyActive } from "./game/energyEngine";
import { registerServiceWorker, sendRankUpReadyNotification, isRankAlreadyNotified, markRankAsNotified } from "./game/notifications";
import { ensurePushRegistration, syncXpFullPushSchedule } from "./game/pushManager";
import { canStartPromotionChallenge, completePromotionChallenge, dismissPromotionCeremony } from "./game/promotionEngine";
import { getPlayerNextRank, getPlayerRank, getXpProgressDetails } from "./game/selectors";
import { getJourneyChapterForRank } from "./game/etaEngine";
import { getStageTheme, getStageThemeCssVariables } from "./game/stageThemes";
import { soundManager } from "./game/audio";
import { DelegationReportData, EarningMode, GameState, TabType } from "./game/types";
import { RANK_STEPS } from "./game/rankBuilder";
import { Zap, Sparkles } from "lucide-react";
import { MandatoryUpdateModal } from "./app-update/MandatoryUpdateModal";
import { checkForAppUpdate } from "./app-update/versionService";
import { recoverPendingAppUpdate } from "./app-update/updateBackupService";
import { StartupGate } from "./app-update/updateTypes";

const JourneyMapScreen = lazy(() => import("./features/journey/JourneyMapScreen").then(m => ({ default: m.JourneyMapScreen })));
const TrainingScreen = lazy(() => import("./features/training/TrainingScreen").then(m => ({ default: m.TrainingScreen })));
const RanksScreen = lazy(() => import("./features/ranks/RanksScreen").then(m => ({ default: m.RanksScreen })));
const ProfileScreen = lazy(() => import("./features/profile/ProfileScreen").then(m => ({ default: m.ProfileScreen })));
const MedalsScreen = lazy(() => import("./features/profile/MedalsScreen").then(m => ({ default: m.MedalsScreen })));
const MasteryScreen = lazy(() => import("./features/profile/MasteryScreen").then(m => ({ default: m.MasteryScreen })));
const IdCardScreen = lazy(() => import("./features/profile/IdCardScreen").then(m => ({ default: m.IdCardScreen })));
const JournalScreen = lazy(() => import("./features/profile/JournalScreen").then(m => ({ default: m.JournalScreen })));
const UniformScreen = lazy(() => import("./features/profile/UniformScreen").then(m => ({ default: m.UniformScreen })));
const StoryCampaignScreen = lazy(() => import("./features/story/StoryCampaignScreen").then(m => ({ default: m.StoryCampaignScreen })));
const TangGiaScreen = lazy(() => import("./features/tang_gia/TangGiaScreen").then(m => ({ default: m.TangGiaScreen })));
const EntertainmentHubScreen = lazy(() => import("./features/entertainment/EntertainmentHubScreen").then(m => ({ default: m.EntertainmentHubScreen })));

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
  const overlayBusy = useOverlayBusy();
  const [writerBlocked, setWriterBlocked] = useState(false);
  const bootStarted = useRef(false);
  const [offlineLoadingProgress, setOfflineLoadingProgress] = useState<number | null>(null);
  const [pushNotice, setPushNotice] = useState<{ title: string; body: string; destination: string } | null>(null);
  const [pushFarmTarget, setPushFarmTarget] = useState<{ section: 'garden' | 'pen'; nonce: number } | null>(null);
  const lastPushProjectionAt = useRef(0);
  const navigatePush = useCallback((destination: string) => {
    if (destination === 'crop-ready' || destination === 'feed-empty') {
      setPushFarmTarget({ section: destination === 'crop-ready' ? 'garden' : 'pen', nonce: Date.now() });
      setActiveTab('tang_gia');
    } else if (destination === 'xp-ready' || destination === 'test') setActiveTab('home');
    setPushNotice(null);
  }, []);
  useEffect(() => {
    const present = (payload: any, fromServer: boolean) => {
      if (!payload || !['xp_ready','crop_ready','feed_empty','test'].includes(payload.type) || typeof payload.title !== 'string' || typeof payload.body !== 'string') return;
      const settings = gameStateRef.current?.settings;
      const preference = { xp_ready: 'xpReady', crop_ready: 'cropReady', feed_empty: 'feedEmpty' }[payload.type] as 'xpReady' | 'cropReady' | 'feedEmpty' | undefined;
      if (payload.type !== 'test' && (!settings?.notificationsEnabled || (preference && settings.notificationPreferences?.[preference] === false))) return;
      if (fromServer && payload.type === 'xp_ready' && Number.isInteger(payload.rankIndex)) {
        if (isRankAlreadyNotified(payload.rankIndex)) return;
        markRankAsNotified(payload.rankIndex);
      }
      setPushNotice({ title: payload.title.slice(0, 160), body: payload.body.slice(0, 1000), destination: { xp_ready: 'xp-ready', crop_ready: 'crop-ready', feed_empty: 'feed-empty', test: 'test' }[payload.type]! });
    };
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'QL2_PUSH_NAVIGATE') navigatePush(event.data.destination);
      if (event.data?.type === 'QL2_PUSH_EVENT' && gameStateRef.current) {
        present(event.data.payload, true);
        event.ports[0]?.postMessage('handled');
      }
    };
    const onLocal = (event: Event) => present((event as CustomEvent).detail, false);
    navigator.serviceWorker?.addEventListener('message', onMessage);
    window.addEventListener('QL2_PUSH_EVENT', onLocal);
    const url = new URL(window.location.href);
    const destination = url.searchParams.get('push');
    if (destination) { navigatePush(destination); url.searchParams.delete('push'); window.history.replaceState(window.history.state, '', url); }
    return () => {
      navigator.serviceWorker?.removeEventListener('message', onMessage);
      window.removeEventListener('QL2_PUSH_EVENT', onLocal);
    };
  }, [navigatePush]);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const [isRankDetailOpen, setIsRankDetailOpen] = useState(false);
  const [isTrainingGameActive, setIsTrainingGameActive] = useState(false);
  const [isTroughInfoActive, setIsTroughInfoActive] = useState(false);
  const [isStoryReaderActive, setIsStoryReaderActive] = useState(false);
  const [delegationReport, setDelegationReport] = useState<DelegationReportData | null>(null);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [startupGate, setStartupGate] = useState<StartupGate>("checking-version");
  const [latestBuildId, setLatestBuildId] = useState<string | null>(null);

  const gameStateRef = useRef<GameState | null>(null);
  gameStateRef.current = gameState;

  useAppChromeMetrics(
    `${Boolean(gameState)}:${isChallengeActive}:${Boolean(gameState?.ui.pendingPromotionCeremony)}:${isTrainingGameActive}:${isTroughInfoActive}:${activeTab}`,
  );

  // Reset trough info & story reader active status when tab changes
  useEffect(() => {
    setIsTroughInfoActive(false);
    if (activeTab !== "story") {
      setIsStoryReaderActive(false);
    }
  }, [activeTab]);

  // 1. Initial Load & Version Gate
  useEffect(() => {
    async function init() {
      if (bootStarted.current) return;
      bootStarted.current = true;
      if (!await acquireGameWriter()) { setWriterBlocked(true); return; }
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
      const beforeWorker = state.farm?.worker ? { ...state.farm.worker.totals } : null;
      const offlineFrom = state.time.lastSettledAt;
      const reportStart = captureDelegationStart(state);
      do {
        settleEarning(state, now, "delegation");
        if (state.time.lastSettledAt < now) {
          setOfflineLoadingProgress(Math.floor(100 * (state.time.lastSettledAt - offlineFrom) / Math.max(1, now - offlineFrom)));
          await localGameRepository.save(state);
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      } while (state.time.lastSettledAt < now);
      setOfflineLoadingProgress(null);
      const reportData = createDelegationReport(state, reportStart);
      if (beforeWorker && state.farm?.worker && now - offlineFrom > 60_000) {
        const w = state.farm.worker, after = w.totals;
        w.offlineSummary = { from: offlineFrom, to: now, actions: after.actions - beforeWorker.actions, gold: after.gold - beforeWorker.gold, xp: after.xp - beforeWorker.xp, supplies: after.supplies - beforeWorker.supplies, wages: after.wages - beforeWorker.wages, departedAt: w.departedAt };
      }
      
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
    if (!gameState || startupGate !== "normal-startup") return;

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

        const draft = cloneEarningState(prev);
        const { reportData } = settleEarning(draft, now, prevMode);
        if (draft.time.lastSettledAt >= now) draft.time.currentEarningMode = targetMode;
        localGameRepository.save(draft);
        void syncXpFullPushSchedule(draft, true);

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
  }, [gameState !== null, startupGate]);

  // 3. Real-time Ticking Loop
  useEffect(() => {
    if (!gameState || startupGate !== "normal-startup") return;

    const interval = setInterval(() => {
      let pendingReport: DelegationReportData | null = null;
      setGameState((prev) => {
        if (!prev) return prev;
        const now = Date.now();
        const active = isUserActiveOnline();
        const targetMode: EarningMode = active ? "direct_online" : "delegation";

        const draft = cloneEarningState(prev);
        const { reportData } = settleEarning(draft, now, prev.time.currentEarningMode);
        if (draft.time.lastSettledAt >= now) draft.time.currentEarningMode = targetMode;
        const transactionChanged = (draft.farm?.worker?.revision ?? 0) !== (prev.farm?.worker?.revision ?? 0) || draft.progression.xpIntoCurrentRankTicks !== prev.progression.xpIntoCurrentRankTicks;
        localGameRepository.save(draft, transactionChanged ? "transaction" : "checkpoint");

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
  }, [gameState !== null, startupGate]);

  useEffect(() => {
    if (!gameState || startupGate !== "normal-startup" || !isGameWriter() || Date.now() - gameState.time.lastSettledAt < 5000) return;
    const timer = setTimeout(() => setGameState(prev => {
      if (!prev) return prev;
      const draft = cloneEarningState(prev);
      settleEarning(draft, Date.now(), prev.time.currentEarningMode);
      localGameRepository.save(draft);
      return draft;
    }), 0);
    return () => clearTimeout(timer);
  }, [gameState?.time.lastSettledAt, startupGate]);

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
      ensurePushRegistration().then(ok => { if (ok && gameStateRef.current) void syncXpFullPushSchedule(gameStateRef.current, true); });
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
      if (notificationsEnabled && gameState.settings.notificationPreferences?.xpReady !== false) {
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
    gameState?.settings.notificationPreferences?.xpReady,
    gameState?.settings.notificationPreferences?.cropReady,
    gameState?.settings.notificationPreferences?.feedEmpty,
  ]);

  useEffect(() => {
    if (gameState && Date.now() - lastPushProjectionAt.current >= 30000) {
      lastPushProjectionAt.current = Date.now();
      void syncXpFullPushSchedule(gameState);
    }
  }, [gameState]);

  // Sync server schedule whenever user closes/hides tab, locks screen, or unload
  useEffect(() => {
    const handleSyncOnExit = () => {
      if (gameStateRef.current) {
        syncXpFullPushSchedule(gameStateRef.current, true);
      }
    };

    const handleVisibilityChange = () => {
      handleSyncOnExit();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleSyncOnExit);
    window.addEventListener("pageshow", handleSyncOnExit);
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
      window.removeEventListener("online", handleSyncOnExit);
      window.removeEventListener("pageshow", handleSyncOnExit);
      window.removeEventListener("pagehide", handleSyncOnExit);
      window.removeEventListener("beforeunload", handleSyncOnExit);
      clearInterval(heartbeatTimer);
    };
  }, []);

  // Helper to update state cleanly (supports function updater or direct GameState object)
  const handleUpdateState = useCallback((updater: ((draft: GameState) => void) | GameState) => {
    let deferred = false;
    queueMicrotask(() => {
      setGameState((prev) => {
        if (!prev) return prev;
        if (typeof updater === "function") {
          const draft = structuredClone(prev);
          const targetAt = Date.now();
          settleEarning(draft, targetAt, draft.time.currentEarningMode);
          if (draft.time.lastSettledAt < targetAt) {
            localGameRepository.save(draft);
            if (!deferred) { deferred = true; setTimeout(() => handleUpdateState(updater), 0); }
            return draft;
          }
          updater(draft);
          localGameRepository.save(draft);
          void syncXpFullPushSchedule(draft, true);
          return draft;
        } else if (updater && typeof updater === "object") {
          localGameRepository.save(updater);
          void syncXpFullPushSchedule(updater, true);
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
    handleUpdateState(draft => {
      completePromotionChallenge(draft, Math.max(completedAtEpochMs, draft.time.lastSettledAt), completedChallengeStats);
    });
    setIsChallengeActive(false);
  };

  // Cancel Challenge
  const handleChallengeCancel = (reason: string) => {
    if (reason === "Rớt sát hạch") {
      setGameState((prev) => {
        if (!prev) return prev;
        const draft = structuredClone(prev);
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
    handleUpdateState(draft => {
      dismissPromotionCeremony(draft, draft.time.lastSettledAt);
    });
  };

  // Handle Delegation Report Actions
  const handleDismissReport = useCallback(() => {
    if (!delegationReport) return;
    const reportId = delegationReport.id;
    setDelegationReport(null);
    setGameState((prev) => {
      if (!prev) return prev;
      const draft = structuredClone(prev);
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
      const draft = structuredClone(prev);
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

  if (writerBlocked) return <div className="min-h-screen bg-slate-950 text-white p-8" role="status">Quân Lộ đang mở ở tab khác. Đóng tab đó rồi <button onClick={() => location.reload()}>tải lại trang này</button>.</div>;

  if (!gameState) {
    return (
      <div className="military-ui min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-extrabold text-amber-300 tracking-wider uppercase">
            {offlineLoadingProgress === null ? "Đang tải dữ liệu quân hàm..." : `Đang cập nhật tiến trình vắng mặt · ${offlineLoadingProgress}%`}
          </span>
        </div>
      </div>
    );
  }

  const currentRank = getPlayerRank(gameState);
  const currentChapter = getJourneyChapterForRank(gameState.progression.currentRankIndex);
  const currentStageTheme = getStageTheme(currentChapter.themeId);
  const chapterThemeStyle = getStageThemeCssVariables(currentStageTheme) as React.CSSProperties;
  const xpDetails = getXpProgressDetails(gameState);
  const pendingCeremony = gameState.ui.pendingPromotionCeremony;
  const promotedRank = pendingCeremony
    ? RANK_STEPS[pendingCeremony.promotedRankIndex]
    : null;
  const previousRank = pendingCeremony && pendingCeremony.promotedRankIndex > 0
    ? RANK_STEPS[pendingCeremony.promotedRankIndex - 1]
    : currentRank;
  const isExclusivePromotionFlow = isChallengeActive || Boolean(pendingCeremony && promotedRank);

  return (
    <div
      className="military-ui chapter-theme-root h-screen h-[100dvh] bg-slate-950 text-white font-sans overflow-hidden relative flex flex-col"
      data-ui-skin={activeTab === "uniform" ? "legacy" : "flat"}
      data-stage-theme={currentStageTheme.id}
      data-farm-mobile={activeTab === 'tang_gia' && FARM_MOBILE_REQUESTED ? 'true' : undefined}
      data-reduced-motion={gameState.settings.reducedMotion ? "true" : "false"}
      style={chapterThemeStyle}
    >
      {startupGate === "normal-startup" && Date.now() - gameState.time.lastSettledAt > 5000 && <div className="fixed inset-0 z-[10000] bg-slate-950/95 flex items-center justify-center p-8" role="status" aria-live="polite">Đang cập nhật tiến trình vắng mặt. Các thao tác sẽ tiếp tục khi dữ liệu đã cập nhật.</div>}
      {/* Game World Ambient Glow Backgrounds */}
      <div className="theme-world-ambient fixed inset-0 z-0 pointer-events-none opacity-50" />

      {/* Single portal target for every shared overlay. */}
      <OverlayHost />

      {/* Top Gaming HUD Header (Auto-hidden when in Minigames, Challenge, Story Reader, or Trough Info Modal) */}
      {!isTrainingGameActive && !isExclusivePromotionFlow && !isTroughInfoActive && !isStoryReaderActive && (
        <header data-app-hud data-command-shell="hud" className="theme-header-shell command-status-hud relative z-10 shrink-0 bg-slate-900/70 backdrop-blur-md border-b px-4 pb-2">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab("profile");
                }}
                className="theme-focus relative focus:outline-none rounded-full"
                title="Mở Hồ Sơ & Cài Đặt"
              >
                <Avatar seed={gameState.player.avatarSeed} size={44} />
              </button>

              <div className="command-status-hud__identity">
                <div className="flex items-center gap-2">
                  <span className="command-status-hud__name line-clamp-1">
                    {gameState.player.displayName}
                  </span>
                </div>
                <div className="command-status-hud__rank line-clamp-1">
                  {currentRank.displayName}
                </div>
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
                  <div className="command-status-hud__energy flex flex-col items-end gap-1" aria-label={`Năng lượng ${Math.round(energyPercent)} phần trăm`}>
                    <div className="flex items-center gap-1.5 text-xs font-extrabold">
                      <span className="technical-label hidden sm:inline">Năng lượng</span>
                      <Zap className={`w-3.5 h-3.5 ${energyVisuals.textColor} ${active && energyMult > 1 ? "fill-current animate-pulse" : "opacity-80"}`} />
                      <span className={`data-readout ${energyVisuals.textColor}`}>
                        {Math.round(energyPercent)}%
                      </span>
                      <span className={`status-tag max-w-[74px] truncate ${energyVisuals.borderColor} ${energyVisuals.textColor} bg-slate-950/80`} title={active ? `Hệ số XP x${energyMult.toFixed(1).replace(".", ",")}` : "Hệ số XP tạm dừng"}>
                        {active ? `x${energyMult.toFixed(1).replace(".", ",")}` : "Tạm dừng"}
                      </span>
                    </div>

                    {/* Energy Progress Bar */}
                    <div className="command-energy-track w-20 sm:w-24">
                      <div
                        className={`h-full transition-all duration-300 ${energyVisuals.bgColor}`}
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
      {!isExclusivePromotionFlow && <main className={`relative z-10 flex-1 min-h-0 flex flex-col ${activeTab === "home" || (activeTab === "tang_gia" && FARM_MOBILE_REQUESTED) || (activeTab === "story" && isStoryReaderActive) ? "app-main-with-hub-navigation overflow-hidden" : isTrainingGameActive ? "overflow-y-auto" : "overflow-y-auto pb-28"}`}>
        <CoreScreenTransition
          enabled={activeTab !== "training" && activeTab !== "entertainment"}
          reducedMotion={activeTab !== "training" && activeTab !== "entertainment" && gameState.settings.reducedMotion}
          key={activeTab}
          className="w-full h-full flex-1 min-h-0 flex flex-col"
        >
          <ScreenLoadBoundary key={activeTab} onBack={() => setActiveTab("home")}>
          <Suspense fallback={<div role="status" className="flex-1 min-h-64 p-6 text-center text-slate-400">Đang tải…</div>}>
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
          {activeTab === "story" && (
            <StoryCampaignScreen
              state={gameState}
              onBack={() => setActiveTab("profile")}
              onReaderActiveChange={setIsStoryReaderActive}
            />
          )}
          {activeTab === "uniform" && (
            <UiSkinProvider skin="legacy"><UniformScreen
              state={gameState}
              onBack={() => setActiveTab("profile")}
            /></UiSkinProvider>
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
              pushTarget={pushFarmTarget}
              gameState={gameState}
              onUpdateGameState={handleUpdateState}
              onTroughInfoToggle={setIsTroughInfoActive}
            />
          )}
          </Suspense>
          </ScreenLoadBoundary>
        </CoreScreenTransition>
      </main>}

      {/* Hub Bottom Navigation */}
      {!isExclusivePromotionFlow && (
        <HubNavigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isHidden={isRankDetailOpen || isTrainingGameActive || isStoryReaderActive}
          gameState={gameState}
        />
      )}

      {/* Active Promotion Challenge Screen */}
      {isChallengeActive && (
        <PromotionChallenge
          currentRank={currentRank}
          nextRank={RANK_STEPS[gameState.progression.currentRankIndex + 1]}
          onComplete={handleChallengeComplete}
          onCancel={handleChallengeCancel}
        />
      )}

      {/* Pending Promotion Ceremony Screen */}
      {!isChallengeActive && pendingCeremony && promotedRank && (
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
      {!isExclusivePromotionFlow && startupGate === "normal-startup" && delegationReport && (
        <DelegationReportModal
          report={delegationReport}
          onAction={handleReportAction}
          onDismiss={handleDismissReport}
        />
      )}

      {/* Medal Unlock Congratulatory Modal */}
      {!isExclusivePromotionFlow && startupGate === "normal-startup" && !delegationReport && !overlayBusy && (
        <MedalUnlockModal
          gameState={gameState}
          onUpdateState={handleUpdateState}
        />
      )}

      {!isExclusivePromotionFlow && pushNotice && (
        <OverlayPortal>
          <div className="app-overlay-toast modal-design modal-toast flex items-center gap-3" role="status" data-interactive="true">
            <div className="min-w-0"><strong>{pushNotice.title}</strong><p className="text-sm">{pushNotice.body}</p></div>
            <ModalButton onClick={() => navigatePush(pushNotice.destination)}>
              {pushNotice.destination === 'crop-ready' ? 'Đến vườn' : pushNotice.destination === 'feed-empty' ? 'Đến chuồng nuôi' : 'Xem thăng cấp'}
            </ModalButton>
            <ModalButton variant="icon" aria-label="Đóng thông báo" onClick={() => setPushNotice(null)}>✕</ModalButton>
          </div>
        </OverlayPortal>
      )}

      {/* Manual Update Success Toast */}
      {!isExclusivePromotionFlow && showUpdateToast && (
        <OverlayPortal>
          <div className="app-overlay-toast modal-design modal-toast flex items-center justify-between gap-3" data-modal-archetype="info" role="status" data-interactive="true">
            <div className="flex min-w-0 items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Đã cập nhật lên phiên bản mới nhất! Tiến trình chơi được bảo toàn.</span>
            </div>
            <ModalButton variant="icon"
              type="button"
              onClick={() => setShowUpdateToast(false)}
              aria-label="Đóng thông báo cập nhật"
            >
              ✕
            </ModalButton>
          </div>
        </OverlayPortal>
      )}
    </div>
  );
}
