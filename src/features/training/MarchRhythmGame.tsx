import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, X, AlertTriangle, Zap } from "lucide-react";
import { GameState, TrainingDifficulty } from "../../game/types";
import { createMarchRhythmChart } from "../../game/training/marchRhythmChart";
import {
  ActiveNoteState,
  ActiveRunState,
  createActiveRun,
  processLaneInput,
  resolveExpiredNotes,
  updateHoldState,
  compileGameResult,
} from "../../game/training/marchRhythmEngine";
import { MarchRhythmGameResult } from "../../game/training/marchRhythmJudgement";
import { soundManager } from "../../game/audio";

type MarchRhythmGameProps = {
  gameState: GameState;
  difficulty: TrainingDifficulty;
  onFinishRun: (run: ActiveRunState, result: MarchRhythmGameResult) => void;
  onExitRun: () => void;
};

export const MarchRhythmGame: React.FC<MarchRhythmGameProps> = ({
  gameState,
  difficulty,
  onFinishRun,
  onExitRun,
}) => {
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(!gameState.settings.soundEnabled);
  const [, setRenderTick] = useState<number>(0);

  const activeRunRef = useRef<ActiveRunState | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const activePointersRef = useRef<Map<number, number>>(new Map()); // pointerId -> laneIndex
  const activeKeysRef = useRef<Map<string, number>>(new Map()); // key -> laneIndex
  const lanePressStateRef = useRef<boolean[]>([false, false, false, false]);

  const timingOffsetMs = gameState.training?.trainingTimingOffsetMs || 0;

  // Initialize chart & active run on mount
  useEffect(() => {
    const seed = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const chart = createMarchRhythmChart(difficulty, seed);
    const startPerf = performance.now();
    const run = createActiveRun(chart, startPerf);
    activeRunRef.current = run;
    setRenderTick(startPerf);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [difficulty]);

  // Main high-performance 60 FPS game loop
  useEffect(() => {
    let lastMetronomeBeat = -1;

    const gameLoop = (nowPerf: number) => {
      const run = activeRunRef.current;
      if (!run) return;

      const deltaMs = Math.min(50, nowPerf - lastFrameTimeRef.current);
      lastFrameTimeRef.current = nowPerf;

      const totalElapsedMs = nowPerf - run.startedAtPerformanceMs;

      // Phase 1: Countdown Pre-roll (2400ms total)
      if (totalElapsedMs < 2400) {
        if (totalElapsedMs >= 1800 && run.phase === "countdown") {
          run.phase = "playing";
        }
      } else if (run.phase === "playing") {
        const gameElapsedMs = totalElapsedMs - 1800;

        // Metronome audio beat check
        const currentBeat = Math.floor(gameElapsedMs / (60000 / run.config.bpmSegments[0]));
        if (currentBeat > lastMetronomeBeat && currentBeat >= 0) {
          lastMetronomeBeat = currentBeat;
          soundManager.playMetronomeBeat(currentBeat % 4 === 0);
        }

        // Resolve notes that passed the target line
        resolveExpiredNotes(run, gameElapsedMs, timingOffsetMs);

        // Check completion condition
        let allNotesResolved = true;
        for (const state of run.activeNotesMap.values()) {
          if (state.judgement === "pending") {
            allNotesResolved = false;
            break;
          }
        }

        if (allNotesResolved || gameElapsedMs > run.chart.durationMs + 1000) {
          run.phase = "resolving";
          const finalResult = compileGameResult(run);
          run.phase = "result";
          onFinishRun(run, finalResult);
          return;
        }
      }

      // Update lane visual press states for receptors
      const newPressStates = Array(run.config.laneCount).fill(false);
      for (const laneIdx of activePointersRef.current.values()) {
        if (laneIdx >= 0 && laneIdx < run.config.laneCount) newPressStates[laneIdx] = true;
      }
      for (const laneIdx of activeKeysRef.current.values()) {
        if (laneIdx >= 0 && laneIdx < run.config.laneCount) newPressStates[laneIdx] = true;
      }
      lanePressStateRef.current = newPressStates;

      setRenderTick(nowPerf);
      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [onFinishRun, timingOffsetMs]);

  // Tab visibility change handler (interrupt run if user switches apps)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && activeRunRef.current && activeRunRef.current.phase === "playing") {
        activeRunRef.current.phase = "interrupted";
        onExitRun();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [onExitRun]);

  // Pointer input handlers
  const handlePointerDown = (laneIndex: number, pointerId: number) => {
    const run = activeRunRef.current;
    if (!run || run.phase !== "playing") return;

    activePointersRef.current.set(pointerId, laneIndex);
    const elapsedMs = performance.now() - run.startedAtPerformanceMs - 1800;

    const jType = processLaneInput(run, laneIndex, elapsedMs, timingOffsetMs);
    if (jType !== "stray") {
      soundManager.playRhythmHit(jType);
    }
  };

  const handlePointerUp = (pointerId: number) => {
    const laneIdx = activePointersRef.current.get(pointerId);
    if (laneIdx !== undefined && activeRunRef.current) {
      const elapsedMs = performance.now() - activeRunRef.current.startedAtPerformanceMs - 1800;
      updateHoldState(activeRunRef.current, laneIdx, false, elapsedMs, 0);
    }
    activePointersRef.current.delete(pointerId);
  };

  // Keyboard controls listener for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const run = activeRunRef.current;
      if (!run || run.phase !== "playing") return;

      let laneIdx = -1;
      if (run.config.laneCount === 2) {
        if (e.code === "KeyD" || e.code === "ArrowLeft") laneIdx = 0;
        else if (e.code === "KeyK" || e.code === "ArrowRight") laneIdx = 1;
      } else if (run.config.laneCount === 3) {
        if (e.code === "KeyD" || e.code === "ArrowLeft") laneIdx = 0;
        else if (e.code === "Space" || e.code === "ArrowDown") laneIdx = 1;
        else if (e.code === "KeyK" || e.code === "ArrowRight") laneIdx = 2;
      } else if (run.config.laneCount === 4) {
        if (e.code === "KeyD") laneIdx = 0;
        else if (e.code === "KeyF") laneIdx = 1;
        else if (e.code === "KeyJ") laneIdx = 2;
        else if (e.code === "KeyK") laneIdx = 3;
      }

      if (laneIdx >= 0) {
        e.preventDefault();
        activeKeysRef.current.set(e.code, laneIdx);
        const elapsedMs = performance.now() - run.startedAtPerformanceMs - 1800;
        const jType = processLaneInput(run, laneIdx, elapsedMs, timingOffsetMs);
        if (jType !== "stray") {
          soundManager.playRhythmHit(jType);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const laneIdx = activeKeysRef.current.get(e.code);
      if (laneIdx !== undefined && activeRunRef.current) {
        const elapsedMs = performance.now() - activeRunRef.current.startedAtPerformanceMs - 1800;
        updateHoldState(activeRunRef.current, laneIdx, false, elapsedMs, 0);
      }
      activeKeysRef.current.delete(e.code);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [timingOffsetMs]);

  const run = activeRunRef.current;
  if (!run) return null;

  const config = run.config;
  const now = performance.now();
  const totalElapsedMs = now - run.startedAtPerformanceMs;
  const gameElapsedMs = Math.max(0, totalElapsedMs - 1800);
  const spawnTravelMs = config.spawnTravelMs;

  const progressPercent = Math.min(100, Math.round((gameElapsedMs / run.chart.durationMs) * 100));

  // Determine current countdown overlay text
  let countdownOverlayText = "";
  if (totalElapsedMs < 600) {
    countdownOverlayText = "3";
  } else if (totalElapsedMs < 1200) {
    countdownOverlayText = "2";
  } else if (totalElapsedMs < 1800) {
    countdownOverlayText = "1";
  } else if (totalElapsedMs < 2400) {
    countdownOverlayText = "BẮT ĐẦU!";
  }

  const targetYPercent = 80; // Hit line is at 80% from top of playfield

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col select-none overflow-hidden touch-none font-sans"
      onPointerUp={(e) => handlePointerUp(e.pointerId)}
      onPointerCancel={(e) => handlePointerUp(e.pointerId)}
    >
      {/* Header HUD Bar */}
      <div className="shrink-0 h-14 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="font-extrabold text-sm text-slate-100 tracking-wide">Nhịp Hành Quân</span>
          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {config.label}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-xs mx-2 sm:mx-4">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-75 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsMuted(!isMuted);
              soundManager.setEnabled(isMuted);
            }}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-xl bg-slate-800/80 border border-slate-700/60"
            aria-label="Tắt/Bật âm thanh"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setShowExitConfirm(true);
            }}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-xl bg-slate-800/80 border border-slate-700/60"
            aria-label="Thoát lượt chơi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Sub-bar */}
      <div className="shrink-0 px-4 py-2 bg-slate-950/90 border-b border-slate-900 flex items-center justify-between text-xs font-mono z-30">
        <div className="flex items-center gap-4">
          <span>
            Điểm: <strong className="text-amber-400 font-bold text-sm">{run.score}</strong>
          </span>
          <span>
            Combo: <strong className="text-cyan-400 font-bold text-sm">{run.combo}</strong>
          </span>
        </div>
        <div>
          <span>Tiến độ: <strong className="text-slate-300">{progressPercent}%</strong></span>
        </div>
      </div>

      {/* Playfield Area */}
      <div className="flex-1 relative w-full min-h-0 max-w-md mx-auto bg-slate-950 border-x border-slate-800/60 flex flex-col overflow-hidden">
        {/* Countdown / GO Banner Overlay */}
        {countdownOverlayText !== "" && (
          <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center pointer-events-none transition-all duration-200">
            <span
              key={countdownOverlayText}
              className="text-6xl sm:text-7xl font-black text-amber-400 tracking-wider drop-shadow-[0_0_25px_rgba(245,158,11,0.9)] animate-pulse"
            >
              {countdownOverlayText}
            </span>
          </div>
        )}

        {/* Target Hit Line */}
        <div
          className="absolute left-0 right-0 h-2 bg-gradient-to-r from-amber-500/20 via-amber-400 to-amber-500/20 border-y border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.9)] z-20 pointer-events-none"
          style={{ top: `${targetYPercent}%` }}
        >
          <div className="absolute -top-3.5 left-2 text-[9px] font-mono text-amber-400 font-bold uppercase tracking-widest">
            Vạch Nhịp
          </div>
        </div>

        {/* Vertical Lanes Grid */}
        <div className="flex-1 relative flex">
          {Array.from({ length: config.laneCount }).map((_, laneIdx) => {
            const isPressed = lanePressStateRef.current[laneIdx];

            return (
              <div
                key={`lane_${laneIdx}`}
                className={`flex-1 relative border-r last:border-r-0 border-slate-800/50 transition-colors duration-75 ${
                  isPressed ? "bg-amber-500/10" : ""
                }`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePointerDown(laneIdx, e.pointerId);
                }}
              >
                {/* Lane Keyboard Label (Desktop) */}
                <div className="absolute top-2 inset-x-0 text-center text-[10px] font-mono text-slate-500 font-semibold pointer-events-none">
                  {config.keyboardLabels[laneIdx]}
                </div>

                {/* Target Receptor Indicator at Hit Line */}
                <div
                  className={`absolute inset-x-2 -translate-y-1/2 h-8 rounded-2xl border-2 transition-all duration-75 pointer-events-none flex items-center justify-center ${
                    isPressed
                      ? "border-amber-400 bg-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-105"
                      : "border-slate-800 bg-slate-900/40"
                  }`}
                  style={{ top: `${targetYPercent}%` }}
                >
                  <div className={`w-3 h-3 rounded-full ${isPressed ? "bg-amber-300 shadow-[0_0_10px_#f59e0b]" : "bg-slate-700/50"}`} />
                </div>

                {/* Falling Notes for this lane */}
                {Array.from(run.activeNotesMap.values()).map((state: ActiveNoteState) => {
                  if (!state.note.laneIndices.includes(laneIdx)) return null;
                  if (state.judgement !== "pending") return null;

                  const scheduledMs = state.note.scheduledHitTimeMs + timingOffsetMs;
                  const timeDiffMs = scheduledMs - gameElapsedMs;

                  if (timeDiffMs > spawnTravelMs + 200 || timeDiffMs < -300) return null;

                  const progress = 1 - timeDiffMs / spawnTravelMs;
                  const yPercent = progress * targetYPercent;

                  return (
                    <div
                      key={`${state.note.id}_lane_${laneIdx}`}
                      className="absolute inset-x-2 rounded-xl border -translate-y-1/2 shadow-lg transition-transform h-6 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 border-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.9)] z-10"
                      style={{
                        top: `${yPercent}%`,
                      }}
                    >
                      {/* Note Highlight Glow Core */}
                      <div className="w-full h-full rounded-xl bg-white/20 flex items-center justify-center">
                        <div className="h-1 rounded-full w-8 bg-amber-100" />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Judgement Text Popups */}
        {run.lastJudgementText && (
          <div
            key={run.lastJudgementText.key}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce"
          >
            <span className={`text-2xl font-black font-mono tracking-wider ${run.lastJudgementText.color} drop-shadow-lg`}>
              {run.lastJudgementText.text}
            </span>
          </div>
        )}

        {/* Bottom Touch Receptor Buttons */}
        <div className="h-24 bg-slate-900 border-t border-slate-800 flex z-30 shrink-0">
          {Array.from({ length: config.laneCount }).map((_, laneIdx) => {
            const isPressed = lanePressStateRef.current[laneIdx];

            return (
              <button
                key={`touch_lane_${laneIdx}`}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePointerDown(laneIdx, e.pointerId);
                }}
                className={`flex-1 h-full border-r last:border-r-0 border-slate-800/80 flex items-center justify-center touch-none select-none transition-colors duration-75 ${
                  isPressed ? "bg-amber-500/25" : "hover:bg-slate-800/50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-mono font-bold text-xs transition-all duration-75 ${
                    isPressed
                      ? "border-amber-400 bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.9)] scale-95"
                      : "border-slate-700 bg-slate-950/80 text-slate-300"
                  }`}
                >
                  {config.keyboardLabels[laneIdx]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl text-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Xác Nhận Thoát?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tiến trình lượt chơi hiện tại sẽ bị hủy. Quyền thưởng hôm nay của bạn vẫn được giữ nguyên.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Tiếp Tục Chơi
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onExitRun();
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-slate-100 text-xs font-bold rounded-xl"
              >
                Thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
