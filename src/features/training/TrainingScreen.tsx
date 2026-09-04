import React, { useState, useRef } from "react";
import { Sliders, Target, Activity, BrainCircuit, Grid3X3, HelpCircle, Swords, Eye, Crown } from "lucide-react";
import { GameState, TrainingDifficulty, TrainingGameId } from "../../game/types";
import { TrainingRewardCard } from "./TrainingRewardCard";
import { MarchRhythmCard } from "./MarchRhythmCard";
import { MarchRhythmGame } from "./MarchRhythmGame";
import { MarchRhythmResult } from "./MarchRhythmResult";
import { MarchRhythmTutorialModal } from "./MarchRhythmTutorialModal";
import { SignalCommandCard } from "./SignalCommandCard";
import { SignalCommandGame } from "./SignalCommandGame";
import { SignalCommandResultModal } from "./SignalCommandResult";
import { SignalCommandTutorialModal } from "./SignalCommandTutorialModal";
import { FormationAssemblyCard } from "./formationAssembly/FormationAssemblyCard";
import { FormationAssemblyGame } from "./formationAssembly/FormationAssemblyGame";
import { FormationAssemblyResultModal } from "./formationAssembly/FormationAssemblyResult";
import { FormationTutorialModal } from "./formationAssembly/FormationTutorialModal";
import { GomokuCard } from "./gomoku-v13/ui/GomokuCard";
import { GomokuGameScreen } from "./gomoku-v13/ui/GomokuGameScreen";
import { GomokuTutorialModal } from "./gomoku-v13/ui/GomokuTutorialModal";
import { GomokuMark } from "./gomoku-v13/domain/gomokuTypes";
import { RadarTrackingCard } from "./radarTracking/RadarTrackingCard";
import { RadarTrackingGame } from "./radarTracking/RadarTrackingGame";
import { RadarTrackingResultModal } from "./radarTracking/RadarTrackingResult";
import { RadarTrackingTutorialModal } from "./radarTracking/RadarTrackingTutorialModal";
import { ShootingCard } from "./shootingRange/ShootingCard";
import { ShootingGame } from "./shootingRange/ShootingGame";
import { ShootingResult } from "./shootingRange/ShootingResult";
import { ShootingTutorialModal } from "./shootingRange/ShootingTutorialModal";
import { ShootingRunState, ShootingRunResult } from "../../game/training/shootingRange/shootingTypes";
import { TimingCalibrationModal } from "./TimingCalibrationModal";
import { ActiveRunState } from "../../game/training/marchRhythmEngine";
import { MarchRhythmGameResult } from "../../game/training/marchRhythmJudgement";
import { SignalCommandRun, SignalCommandResult } from "../../game/training/signalCommand/signalCommandTypes";
import { FormationRun, FormationResult } from "../../game/training/formationAssembly/formationTypes";
import { RadarRunResult, RadarRunState } from "../../game/training/radarTracking/radarTypes";
import { createEmptyRadarTrackingStats, createEmptyShootingRangeStats } from "../../game/training/trainingDefaults";
import { claimDailyTrainingReward, DailyTrainingClaimResult } from "../../game/training/dailyTrainingReward";
import { recordTrainingRunForMasteryAndMedals } from "../../game/medals/medalEngine";
import { soundManager } from "../../game/audio";

type TrainingScreenProps = {
  gameState: GameState;
  onUpdateGameState: (updater: (draft: GameState) => void) => void;
  onGameActiveChange?: (active: boolean) => void;
};

export const TrainingScreen: React.FC<TrainingScreenProps> = ({
  gameState,
  onUpdateGameState,
  onGameActiveChange,
}) => {
  const [selectedGameId, setSelectedGameId] = useState<TrainingGameId | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<TrainingDifficulty>("easy");
  const [selectedGomokuMark, setSelectedGomokuMark] = useState<GomokuMark>("X");

  const [isPlayingGame, setIsPlayingGame] = useState<boolean>(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);
  const [showMarchTutorial, setShowMarchTutorial] = useState<boolean>(false);
  const [showSignalTutorial, setShowSignalTutorial] = useState<boolean>(false);
  const [showFormationTutorial, setShowFormationTutorial] = useState<boolean>(false);
  const [showGomokuTutorial, setShowGomokuTutorial] = useState<boolean>(false);
  const [showRadarTutorial, setShowRadarTutorial] = useState<boolean>(false);
  const [showShootingTutorial, setShowShootingTutorial] = useState<boolean>(false);

  const pendingAutoStartRef = useRef<boolean>(false);
  const gameDetailRef = useRef<HTMLDivElement>(null);

  const handleSelectGame = (gameId: TrainingGameId) => {
    soundManager.playClick();
    setSelectedGameId(gameId);
    setTimeout(() => {
      gameDetailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const [completedMarchRun, setCompletedMarchRun] = useState<{
    run: ActiveRunState;
    result: MarchRhythmGameResult;
    claimResult: DailyTrainingClaimResult | null;
  } | null>(null);

  const [completedSignalRun, setCompletedSignalRun] = useState<{
    run: SignalCommandRun;
    result: SignalCommandResult;
    claimResult: DailyTrainingClaimResult | null;
  } | null>(null);

  const [completedFormationRun, setCompletedFormationRun] = useState<{
    run: FormationRun;
    result: FormationResult;
    claimResult: DailyTrainingClaimResult | null;
  } | null>(null);

  const [completedRadarRun, setCompletedRadarRun] = useState<{
    run: RadarRunState;
    result: RadarRunResult;
    claimResult: DailyTrainingClaimResult | null;
  } | null>(null);

  const [completedShootingRun, setCompletedShootingRun] = useState<{
    run: ShootingRunState;
    result: ShootingRunResult;
    claimResult: DailyTrainingClaimResult | null;
  } | null>(null);

  const handleStartGame = () => {
    if (!selectedGameId) return;

    setCompletedMarchRun(null);
    setCompletedSignalRun(null);
    setCompletedFormationRun(null);
    setCompletedRadarRun(null);
    setCompletedShootingRun(null);

    if (selectedGameId === "march_rhythm") {
      const easyStats = gameState.training?.marchRhythm?.easy;
      const mediumStats = gameState.training?.marchRhythm?.medium;
      const hardStats = gameState.training?.marchRhythm?.hard;

      const totalPlays = (easyStats?.plays || 0) + (mediumStats?.plays || 0) + (hardStats?.plays || 0);

      if (totalPlays === 0) {
        pendingAutoStartRef.current = true;
        setShowMarchTutorial(true);
        return;
      }
    }

    if (selectedGameId === "signal_command") {
      const easyStats = gameState.training?.signalCommand?.easy;
      const mediumStats = gameState.training?.signalCommand?.medium;
      const hardStats = gameState.training?.signalCommand?.hard;

      const totalStarted = (easyStats?.runsStarted || 0) + (mediumStats?.runsStarted || 0) + (hardStats?.runsStarted || 0);

      if (totalStarted === 0) {
        pendingAutoStartRef.current = true;
        setShowSignalTutorial(true);
        return;
      }
    }

    if (selectedGameId === "formation_assembly") {
      const easyStats = gameState.training?.formationAssembly?.easy;
      const mediumStats = gameState.training?.formationAssembly?.medium;
      const hardStats = gameState.training?.formationAssembly?.hard;

      const totalFinished = (easyStats?.runsFinished || 0) + (mediumStats?.runsFinished || 0) + (hardStats?.runsFinished || 0);

      if (totalFinished === 0) {
        pendingAutoStartRef.current = true;
        setShowFormationTutorial(true);
        return;
      }
    }

    if (selectedGameId === "gomoku_infinite") {
      const easyStats = gameState.training?.gomoku?.easy;
      const mediumStats = gameState.training?.gomoku?.medium;
      const hardStats = gameState.training?.gomoku?.hard;

      const totalStarted = (easyStats?.matchesStarted || 0) + (mediumStats?.matchesStarted || 0) + (hardStats?.matchesStarted || 0);

      if (totalStarted === 0) {
        pendingAutoStartRef.current = true;
        setShowGomokuTutorial(true);
        return;
      }
    }

    if (selectedGameId === "radar_tracking") {
      const easyStats = gameState.training?.radarTracking?.easy;
      const mediumStats = gameState.training?.radarTracking?.medium;
      const hardStats = gameState.training?.radarTracking?.hard;

      const totalStarted = (easyStats?.runsStarted || 0) + (mediumStats?.runsStarted || 0) + (hardStats?.runsStarted || 0);

      if (totalStarted === 0) {
        pendingAutoStartRef.current = true;
        setShowRadarTutorial(true);
        return;
      }
    }

    if (selectedGameId === "shooting_range") {
      const easyStats = gameState.training?.shootingRange?.easy;
      const mediumStats = gameState.training?.shootingRange?.medium;
      const hardStats = gameState.training?.shootingRange?.hard;

      const totalStarted = (easyStats?.runsStarted || 0) + (mediumStats?.runsStarted || 0) + (hardStats?.runsStarted || 0);

      if (totalStarted === 0) {
        pendingAutoStartRef.current = true;
        setShowShootingTutorial(true);
        return;
      }
    }

    setIsPlayingGame(true);
    onGameActiveChange?.(true);
  };

  const handleCloseRadarTutorial = () => {
    setShowRadarTutorial(false);
    if (pendingAutoStartRef.current) {
      pendingAutoStartRef.current = false;
      setIsPlayingGame(true);
      onGameActiveChange?.(true);
    }
  };

  const handleCloseShootingTutorial = () => {
    setShowShootingTutorial(false);
    if (pendingAutoStartRef.current) {
      pendingAutoStartRef.current = false;
      setIsPlayingGame(true);
      onGameActiveChange?.(true);
    }
  };

  const handleCloseMarchTutorial = () => {
    setShowMarchTutorial(false);
    if (pendingAutoStartRef.current) {
      pendingAutoStartRef.current = false;
      setIsPlayingGame(true);
      onGameActiveChange?.(true);
    }
  };

  const handleCloseSignalTutorial = () => {
    setShowSignalTutorial(false);
    if (pendingAutoStartRef.current) {
      pendingAutoStartRef.current = false;
      setIsPlayingGame(true);
      onGameActiveChange?.(true);
    }
  };

  const handleCloseFormationTutorial = () => {
    setShowFormationTutorial(false);
    if (pendingAutoStartRef.current) {
      pendingAutoStartRef.current = false;
      setIsPlayingGame(true);
      onGameActiveChange?.(true);
    }
  };

  const handleCloseGomokuTutorial = () => {
    setShowGomokuTutorial(false);
    if (pendingAutoStartRef.current) {
      pendingAutoStartRef.current = false;
      setIsPlayingGame(true);
      onGameActiveChange?.(true);
    }
  };

  const handleOpenTutorialManual = (gameId: TrainingGameId) => {
    pendingAutoStartRef.current = false;
    if (gameId === "march_rhythm") setShowMarchTutorial(true);
    if (gameId === "signal_command") setShowSignalTutorial(true);
    if (gameId === "formation_assembly") setShowFormationTutorial(true);
    if (gameId === "gomoku_infinite") setShowGomokuTutorial(true);
    if (gameId === "radar_tracking") setShowRadarTutorial(true);
    if (gameId === "shooting_range") setShowShootingTutorial(true);
  };

  const handleFinishShootingRun = (run: ShootingRunState, result: ShootingRunResult) => {
    let claimRes: DailyTrainingClaimResult | null = null;

    onUpdateGameState((draft) => {
      if (!draft.training.shootingRange) {
        draft.training.shootingRange = createEmptyShootingRangeStats();
      }
      if (draft.training.shootingRange.lastRecordedRunId === run.id) {
        return;
      }
      draft.training.shootingRange.lastRecordedRunId = run.id;

      const diffKey = run.difficulty;
      const stats = draft.training.shootingRange[diffKey];
      stats.runsStarted++;
      stats.runsFinished++;
      stats.lastPlayedAt = Date.now();
      stats.targetsDestroyed += result.targetsDestroyed;

      if (result.score > stats.bestScore) stats.bestScore = result.score;
      if (result.accuracy > stats.bestAccuracy) stats.bestAccuracy = result.accuracy;

      if (result.victory) {
        stats.wins++;
        stats.lastWonAt = Date.now();
        if (result.perfectWin) stats.perfectWins++;
        if (stats.fastestWinningRunMs === null || result.elapsedRealMs < stats.fastestWinningRunMs) {
          stats.fastestWinningRunMs = result.elapsedRealMs;
        }

        claimRes = claimDailyTrainingReward(draft, {
          runId: run.id,
          gameId: "shooting_range",
          difficulty: run.difficulty,
          completedAtEpochMs: Date.now(),
          victory: true,
        });
      } else {
        stats.failures++;
      }

      recordTrainingRunForMasteryAndMedals(draft, "shooting_range", run.difficulty, result.victory);
    });

    setIsPlayingGame(false);
    onGameActiveChange?.(false);
    setCompletedShootingRun({ run, result, claimResult: claimRes });
  };

  const handleFinishRadarRun = (run: RadarRunState, result: RadarRunResult) => {
    let claimRes: DailyTrainingClaimResult | null = null;

    onUpdateGameState((draft) => {
      if (!draft.training.radarTracking) {
        draft.training.radarTracking = createEmptyRadarTrackingStats();
      }
      if (draft.training.radarTracking.lastRecordedRunId === run.id) {
        return;
      }
      draft.training.radarTracking.lastRecordedRunId = run.id;

      const diffKey = run.difficulty;
      const stats = draft.training.radarTracking[diffKey];
      stats.runsStarted++;
      stats.runsFinished++;
      stats.lastPlayedAt = Date.now();

      if (result.score > stats.bestScore) stats.bestScore = result.score;
      if (result.accuracy > stats.bestAccuracy) stats.bestAccuracy = result.accuracy;
      if (result.completedRounds > stats.mostRoundsCompleted) {
        stats.mostRoundsCompleted = result.completedRounds;
      }

      if (result.victory) {
        stats.wins++;
        stats.lastWonAt = Date.now();
        if (result.perfectWin) stats.perfectWins++;
        if (stats.fastestWinningRunMs === null || result.elapsedRealMs < stats.fastestWinningRunMs) {
          stats.fastestWinningRunMs = result.elapsedRealMs;
        }

        claimRes = claimDailyTrainingReward(draft, {
          runId: run.id,
          gameId: "radar_tracking",
          difficulty: run.difficulty,
          completedAtEpochMs: Date.now(),
          victory: true,
        });
      } else {
        stats.failures++;
      }

      recordTrainingRunForMasteryAndMedals(draft, "radar_tracking", run.difficulty, result.victory);
    });

    setIsPlayingGame(false);
    onGameActiveChange?.(false);
    setCompletedRadarRun({ run, result, claimResult: claimRes });
  };

  const handleExitGame = () => {
    setIsPlayingGame(false);
    onGameActiveChange?.(false);
  };

  const handleFinishMarchRun = (run: ActiveRunState, result: MarchRhythmGameResult) => {
    let claimRes: DailyTrainingClaimResult | null = null;

    onUpdateGameState((draft) => {
      const diffKey = run.difficulty;
      const stats = draft.training.marchRhythm[diffKey];
      stats.plays++;
      stats.lastPlayedAt = Date.now();

      if (result.score > stats.bestScore) stats.bestScore = result.score;
      if (result.accuracy > stats.bestAccuracy) stats.bestAccuracy = result.accuracy;
      if (result.hitRate > stats.bestHitRate) stats.bestHitRate = result.hitRate;
      if (result.maxCombo > stats.bestCombo) stats.bestCombo = result.maxCombo;

      if (result.victory) {
        stats.wins++;
        stats.lastWonAt = Date.now();

        claimRes = claimDailyTrainingReward(draft, {
          runId: run.runId,
          gameId: "march_rhythm",
          difficulty: run.difficulty,
          completedAtEpochMs: Date.now(),
          victory: true,
        });
      }

      recordTrainingRunForMasteryAndMedals(draft, "march_rhythm", run.difficulty, result.victory);
    });

    setIsPlayingGame(false);
    onGameActiveChange?.(false);
    setCompletedMarchRun({ run, result, claimResult: claimRes });
  };

  const handleFinishSignalRun = (run: SignalCommandRun, result: SignalCommandResult) => {
    let claimRes: DailyTrainingClaimResult | null = null;

    onUpdateGameState((draft) => {
      if (draft.training.signalCommand.lastRecordedRunId === run.id) {
        return;
      }
      draft.training.signalCommand.lastRecordedRunId = run.id;

      const diffKey = run.difficulty;
      const stats = draft.training.signalCommand[diffKey];
      stats.runsStarted++;
      stats.runsFinished++;
      stats.lastPlayedAt = Date.now();

      if (result.score > stats.bestScore) stats.bestScore = result.score;
      if (result.accuracy > stats.bestAccuracy) stats.bestAccuracy = result.accuracy;
      if (result.longestSequenceCompleted > stats.longestSequenceCompleted) {
        stats.longestSequenceCompleted = result.longestSequenceCompleted;
      }
      if (result.completedRounds > stats.mostRoundsCompleted) {
        stats.mostRoundsCompleted = result.completedRounds;
      }

      if (result.victory) {
        stats.wins++;
        stats.lastWonAt = Date.now();
        if (result.perfectWin) stats.perfectWins++;
        if (stats.fastestWinningRunMs === null || result.elapsedRealMs < stats.fastestWinningRunMs) {
          stats.fastestWinningRunMs = result.elapsedRealMs;
        }

        claimRes = claimDailyTrainingReward(draft, {
          runId: run.id,
          gameId: "signal_command",
          difficulty: run.difficulty,
          completedAtEpochMs: Date.now(),
          victory: true,
        });
      } else {
        stats.failures++;
      }

      recordTrainingRunForMasteryAndMedals(draft, "signal_command", run.difficulty, result.victory);
    });

    setIsPlayingGame(false);
    onGameActiveChange?.(false);
    setCompletedSignalRun({ run, result, claimResult: claimRes });
  };

  const handleFinishFormationRun = (run: FormationRun, result: FormationResult) => {
    let claimRes: DailyTrainingClaimResult | null = null;

    onUpdateGameState((draft) => {
      if (!draft.training.formationAssembly) return;

      const diffKey = run.difficulty;
      const stats = draft.training.formationAssembly[diffKey];
      stats.runsStarted++;
      stats.runsFinished++;
      stats.lastPlayedAt = Date.now();

      if (result.score > stats.bestScore) stats.bestScore = result.score;
      if (result.completedRounds > stats.mostRoundsCompleted) {
        stats.mostRoundsCompleted = result.completedRounds;
      }

      if (result.victory) {
        stats.wins++;
        stats.lastWonAt = Date.now();
        if (result.perfectWin) stats.perfectWins++;
        if (stats.fastestWinningRunMs === null || result.elapsedRealMs < stats.fastestWinningRunMs) {
          stats.fastestWinningRunMs = result.elapsedRealMs;
        }

        claimRes = claimDailyTrainingReward(draft, {
          runId: run.id,
          gameId: "formation_assembly",
          difficulty: run.difficulty,
          completedAtEpochMs: Date.now(),
          victory: true,
        });
      } else {
        stats.failures++;
      }

      recordTrainingRunForMasteryAndMedals(draft, "formation_assembly", run.difficulty, result.victory);
    });

    setIsPlayingGame(false);
    onGameActiveChange?.(false);
    setCompletedFormationRun({ run, result, claimResult: claimRes });
  };

  const handleSaveTimingOffset = (newOffsetMs: number) => {
    onUpdateGameState((draft) => {
      draft.training.trainingTimingOffsetMs = newOffsetMs;
    });
  };

  return (
    <div className="command-screen training-command-screen w-full max-w-lg mx-auto pb-24 pt-4 px-4 flex flex-col gap-5 animate-fadeIn">
      {/* Top Header */}
      <div className="command-header">
        <div className="command-header__icon">
          <Target />
        </div>
        <div className="command-header__copy">
          <h1 className="command-header__title">Khu Huấn Luyện</h1>
          <p className="command-header__subtitle">Thưởng XP hằng ngày & luyện tập</p>
        </div>

        <div className="command-header__action flex items-center gap-2">
          {selectedGameId === "shooting_range" && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setShowShootingTutorial(true);
              }}
              className="theme-focus p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 flex items-center gap-1.5 text-xs font-semibold shadow-sm cursor-pointer focus:outline-none"
              title="Hướng dẫn chơi Bắn Súng"
            >
              <HelpCircle className="theme-icon-accent w-4 h-4" />
              <span className="hidden sm:inline">Hướng Dẫn</span>
            </button>
          )}

          {selectedGameId === "radar_tracking" && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setShowRadarTutorial(true);
              }}
              className="theme-focus p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 flex items-center gap-1.5 text-xs font-semibold shadow-sm focus:outline-none"
              title="Hướng dẫn chơi Mắt Thần Radar"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Hướng Dẫn</span>
            </button>
          )}

          {selectedGameId === "gomoku_infinite" && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setShowGomokuTutorial(true);
              }}
              className="theme-focus p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 flex items-center gap-1.5 text-xs font-semibold shadow-sm focus:outline-none"
              title="Hướng dẫn chơi Cờ Caro"
            >
              <HelpCircle className="theme-icon-accent w-4 h-4" />
              <span className="hidden sm:inline">Hướng Dẫn</span>
            </button>
          )}

          {selectedGameId === "formation_assembly" && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setShowFormationTutorial(true);
              }}
              className="theme-focus p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 flex items-center gap-1.5 text-xs font-semibold shadow-sm focus:outline-none"
              title="Hướng dẫn chơi Xếp Đội Hình"
            >
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Hướng Dẫn</span>
            </button>
          )}

          {selectedGameId === "signal_command" && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setShowSignalTutorial(true);
              }}
              className="theme-focus p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 flex items-center gap-1.5 text-xs font-semibold shadow-sm focus:outline-none"
              title="Hướng dẫn chơi Mật Lệnh Tín Hiệu"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Hướng Dẫn</span>
            </button>
          )}

          {selectedGameId === "march_rhythm" && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setShowCalibrationModal(true);
              }}
              className="theme-focus p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 flex items-center gap-1.5 text-xs font-semibold shadow-sm focus:outline-none"
              title="Hiệu chỉnh độ lệch nhịp"
            >
              <Sliders className="theme-icon-accent w-4 h-4" />
              <span className="hidden sm:inline">Hiệu Chỉnh</span>
            </button>
          )}
        </div>
      </div>

      {/* Daily Reward Status Card */}
      <TrainingRewardCard gameState={gameState} />

      {/* Mini-Game Catalog Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
          <span className="technical-label">Môn luyện tập</span>
          <span className="status-tag text-[11px] text-slate-400">6 Môn</span>
        </div>

        <div className="training-program-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {/* Game 1: Nhịp Hành Quân */}
          <button
            type="button"
            onClick={() => handleSelectGame("march_rhythm")}
            data-training-code="TR-01"
            className={`training-program-card theme-focus p-2.5 rounded-2xl border transition-all flex flex-col items-start gap-1 text-left focus:outline-none ${
              selectedGameId === "march_rhythm"
                ? "theme-selected-card bg-slate-900"
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="theme-badge w-6 h-6 rounded-lg border flex items-center justify-center">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                selectedGameId === "march_rhythm" ? "theme-badge border" : "bg-slate-800 text-slate-400"
              }`}>
                Phản xạ
              </span>
            </div>

            <div className="mt-1">
              <h4 className="font-extrabold text-[11px] text-slate-100 leading-tight">Nhịp Hành Quân</h4>
              <p className="text-[9px] text-slate-400 leading-tight line-clamp-1 mt-0.5">
                Cảm nhịp giai điệu
              </p>
            </div>
          </button>

          {/* Game 2: Mật Lệnh Tín Hiệu */}
          <button
            type="button"
            onClick={() => handleSelectGame("signal_command")}
            data-training-code="TR-02"
            className={`training-program-card theme-focus p-2.5 rounded-2xl border transition-all flex flex-col items-start gap-1 text-left focus:outline-none ${
              selectedGameId === "signal_command"
                ? "theme-selected-card bg-slate-900"
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <BrainCircuit className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                selectedGameId === "signal_command" ? "theme-badge border" : "bg-slate-800 text-slate-400"
              }`}>
                Ghi nhớ
              </span>
            </div>

            <div className="mt-1">
              <h4 className="font-extrabold text-[11px] text-slate-100 leading-tight">Mật Lệnh Tín Hiệu</h4>
              <p className="text-[9px] text-slate-400 leading-tight line-clamp-1 mt-0.5">
                Nhập chuỗi tín hiệu
              </p>
            </div>
          </button>

          {/* Game 3: Xếp Đội Hình */}
          <button
            type="button"
            onClick={() => handleSelectGame("formation_assembly")}
            data-training-code="TR-03"
            className={`training-program-card theme-focus p-2.5 rounded-2xl border transition-all flex flex-col items-start gap-1 text-left focus:outline-none ${
              selectedGameId === "formation_assembly"
                ? "theme-selected-card bg-slate-900"
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Grid3X3 className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                selectedGameId === "formation_assembly" ? "theme-badge border" : "bg-slate-800 text-slate-400"
              }`}>
                Thị giác
              </span>
            </div>

            <div className="mt-1">
              <h4 className="font-extrabold text-[11px] text-slate-100 leading-tight">Xếp Đội Hình</h4>
              <p className="text-[9px] text-slate-400 leading-tight line-clamp-1 mt-0.5">
                Phục dựng đội hình
              </p>
            </div>
          </button>

          {/* Game 4: Mắt Thần Radar */}
          <button
            type="button"
            onClick={() => handleSelectGame("radar_tracking")}
            data-training-code="TR-04"
            className={`training-program-card theme-focus p-2.5 rounded-2xl border transition-all flex flex-col items-start gap-1 text-left focus:outline-none ${
              selectedGameId === "radar_tracking"
                ? "theme-selected-card bg-slate-900"
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Eye className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                selectedGameId === "radar_tracking" ? "theme-badge border" : "bg-slate-800 text-slate-400"
              }`}>
                Tập trung
              </span>
            </div>

            <div className="mt-1">
              <h4 className="font-extrabold text-[11px] text-slate-100 leading-tight">Mắt Thần Radar</h4>
              <p className="text-[9px] text-slate-400 leading-tight line-clamp-1 mt-0.5">
                Theo vết mục tiêu
              </p>
            </div>
          </button>

          {/* Game 5: Cờ Caro */}
          <button
            type="button"
            onClick={() => handleSelectGame("gomoku_infinite")}
            data-training-code="TR-05"
            className={`training-program-card theme-focus p-2.5 rounded-2xl border transition-all flex flex-col items-start gap-1 text-left focus:outline-none ${
              selectedGameId === "gomoku_infinite"
                ? "theme-selected-card bg-slate-900"
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="theme-badge w-6 h-6 rounded-lg border flex items-center justify-center">
                <Swords className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                selectedGameId === "gomoku_infinite" ? "theme-badge border" : "bg-slate-800 text-slate-400"
              }`}>
                Đối đầu
              </span>
            </div>

            <div className="mt-1">
              <h4 className="font-extrabold text-[11px] text-slate-100 leading-tight">Cờ Caro</h4>
              <p className="text-[9px] text-slate-400 leading-tight line-clamp-1 mt-0.5">
                Đấu cờ caro 5 quân
              </p>
            </div>
          </button>

          {/* Game 6: Bắn Súng */}
          <button
            type="button"
            onClick={() => handleSelectGame("shooting_range")}
            data-training-code="TR-06"
            className={`training-program-card theme-focus p-2.5 rounded-2xl border transition-all flex flex-col items-start gap-1 text-left cursor-pointer focus:outline-none ${
              selectedGameId === "shooting_range"
                ? "theme-selected-card bg-slate-900"
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="theme-badge w-6 h-6 rounded-lg border flex items-center justify-center">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                selectedGameId === "shooting_range" ? "theme-badge border" : "bg-slate-800 text-slate-400"
              }`}>
                Ngắm bắn
              </span>
            </div>

            <div className="mt-1">
              <h4 className="font-extrabold text-[11px] text-slate-100 leading-tight">Bắn Súng</h4>
              <p className="text-[9px] text-slate-400 leading-tight line-clamp-1 mt-0.5">
                Bắn bia tập ngắm
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Game Card for Selected Game or Selection Prompt */}
      <div ref={gameDetailRef} className="scroll-mt-4 pt-1">
        {selectedGameId === null ? (
          <div className="command-panel bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 text-center flex flex-col items-center gap-3">
            <div className="theme-badge w-12 h-12 rounded-2xl border flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-200">Chọn Bộ Môn Huấn Luyện</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Chạm vào một trong 6 mini-game ở danh mục phía trên để chọn độ khó và bắt đầu rèn luyện kỹ năng.
              </p>
            </div>
          </div>
        ) : selectedGameId === "march_rhythm" ? (
          <MarchRhythmCard
            gameState={gameState}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            onStartGame={handleStartGame}
            onOpenTutorial={() => handleOpenTutorialManual("march_rhythm")}
          />
        ) : selectedGameId === "signal_command" ? (
          <SignalCommandCard
            gameState={gameState}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            onStartGame={handleStartGame}
            onOpenTutorial={() => handleOpenTutorialManual("signal_command")}
          />
        ) : selectedGameId === "formation_assembly" ? (
          <FormationAssemblyCard
            gameState={gameState}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            onStartGame={handleStartGame}
            onOpenTutorial={() => handleOpenTutorialManual("formation_assembly")}
          />
        ) : selectedGameId === "radar_tracking" ? (
          <RadarTrackingCard
            gameState={gameState}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            onStartGame={handleStartGame}
            onOpenTutorial={() => handleOpenTutorialManual("radar_tracking")}
          />
        ) : selectedGameId === "shooting_range" ? (
          <ShootingCard
            gameState={gameState}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            onStartGame={handleStartGame}
            onOpenTutorial={() => handleOpenTutorialManual("shooting_range")}
          />
        ) : selectedGameId === "gomoku_infinite" ? (
          <GomokuCard
            gameState={gameState}
            selectedDifficulty={selectedDifficulty}
            selectedMark={selectedGomokuMark}
            onSelectDifficulty={setSelectedDifficulty}
            onSelectMark={setSelectedGomokuMark}
            onStartGame={handleStartGame}
            onOpenTutorial={() => handleOpenTutorialManual("gomoku_infinite")}
          />
        ) : null}
      </div>

      {/* Active Fullscreen Gameplay */}
      {isPlayingGame && selectedGameId === "march_rhythm" && (
        <MarchRhythmGame
          gameState={gameState}
          difficulty={selectedDifficulty}
          onFinishRun={handleFinishMarchRun}
          onExitRun={handleExitGame}
        />
      )}

      {isPlayingGame && selectedGameId === "signal_command" && (
        <SignalCommandGame
          gameState={gameState}
          difficulty={selectedDifficulty}
          onFinishRun={handleFinishSignalRun}
          onExitRun={handleExitGame}
        />
      )}

      {isPlayingGame && selectedGameId === "formation_assembly" && (
        <FormationAssemblyGame
          gameState={gameState}
          difficulty={selectedDifficulty}
          onFinishRun={handleFinishFormationRun}
          onExitRun={handleExitGame}
        />
      )}

      {isPlayingGame && selectedGameId === "radar_tracking" && (
        <RadarTrackingGame
          gameState={gameState}
          difficulty={selectedDifficulty}
          onFinishRun={handleFinishRadarRun}
          onExitRun={handleExitGame}
        />
      )}

      {isPlayingGame && selectedGameId === "gomoku_infinite" && (
        <GomokuGameScreen
          gameState={gameState}
          difficulty={selectedDifficulty}
          playerMark={selectedGomokuMark}
          onUpdateGameState={onUpdateGameState}
          onExitRun={handleExitGame}
        />
      )}

      {isPlayingGame && selectedGameId === "shooting_range" && (
        <ShootingGame
          difficulty={selectedDifficulty}
          onFinishRun={handleFinishShootingRun}
          onExitRun={handleExitGame}
        />
      )}

      {/* Game Result Modals */}
      {completedMarchRun && (
        <MarchRhythmResult
          difficulty={completedMarchRun.run.difficulty}
          result={completedMarchRun.result}
          claimResult={completedMarchRun.claimResult}
          onReplay={handleStartGame}
          onChangeDifficulty={() => setCompletedMarchRun(null)}
          onExit={() => setCompletedMarchRun(null)}
        />
      )}

      {completedSignalRun && (
        <SignalCommandResultModal
          difficulty={completedSignalRun.run.difficulty}
          result={completedSignalRun.result}
          claimResult={completedSignalRun.claimResult}
          onReplay={handleStartGame}
          onChangeDifficulty={() => setCompletedSignalRun(null)}
          onExit={() => setCompletedSignalRun(null)}
        />
      )}

      {completedFormationRun && (
        <FormationAssemblyResultModal
          difficulty={completedFormationRun.run.difficulty}
          result={completedFormationRun.result}
          claimResult={completedFormationRun.claimResult}
          onReplay={handleStartGame}
          onChangeDifficulty={() => setCompletedFormationRun(null)}
          onExit={() => setCompletedFormationRun(null)}
        />
      )}

      {completedRadarRun && (
        <RadarTrackingResultModal
          difficulty={completedRadarRun.run.difficulty}
          result={completedRadarRun.result}
          claimResult={completedRadarRun.claimResult}
          onReplay={handleStartGame}
          onChangeDifficulty={() => setCompletedRadarRun(null)}
          onExit={() => setCompletedRadarRun(null)}
        />
      )}

      {completedShootingRun && (
        <ShootingResult
          difficulty={completedShootingRun.run.difficulty}
          result={completedShootingRun.result}
          claimResult={completedShootingRun.claimResult}
          onReplay={handleStartGame}
          onChangeDifficulty={() => setCompletedShootingRun(null)}
          onExit={() => setCompletedShootingRun(null)}
        />
      )}

      {/* Tutorial Modals */}
      {showMarchTutorial && (
        <MarchRhythmTutorialModal
          onClose={handleCloseMarchTutorial}
        />
      )}

      {showSignalTutorial && (
        <SignalCommandTutorialModal
          onClose={handleCloseSignalTutorial}
        />
      )}

      {showFormationTutorial && (
        <FormationTutorialModal
          onClose={handleCloseFormationTutorial}
        />
      )}

      {showRadarTutorial && (
        <RadarTrackingTutorialModal
          onClose={handleCloseRadarTutorial}
        />
      )}

      {showGomokuTutorial && (
        <GomokuTutorialModal
          onClose={handleCloseGomokuTutorial}
        />
      )}

      {showShootingTutorial && (
        <ShootingTutorialModal
          onClose={handleCloseShootingTutorial}
        />
      )}

      {/* Calibration Modal */}
      {showCalibrationModal && (
        <TimingCalibrationModal
          currentOffsetMs={gameState.training?.trainingTimingOffsetMs || 0}
          onSave={handleSaveTimingOffset}
          onClose={() => setShowCalibrationModal(false)}
        />
      )}
    </div>
  );
};
