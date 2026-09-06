import React, { useEffect, useRef, useState, useCallback } from "react";
import { Pause, Play, RefreshCw, CheckCircle2, ShieldAlert, Eye, Volume2, VolumeX, X } from "lucide-react";
import { GameState, TrainingDifficulty } from "../../../game/types";
import { createRadarRunResult, generateRoundData, getRadarRoundConfig, updateRadarPhysics } from "../../../game/training/radarTracking/radarEngine";
import {
  OcclusionZone,
  RadarObject,
  RadarRoundConfig,
  RadarRoundPhase,
  RadarRunResult,
  RadarRunState,
  ScheduledDirectionChange,
} from "../../../game/training/radarTracking/radarTypes";
import { soundManager } from "../../../game/audio";
import { ConfirmationDialog, ExclusiveFullscreenOverlay, GameResultModal, ModalActions, ModalButton, OverlayBody, OverlayFooter, OverlayHeader, ResultHero } from "../../../components/overlay/AppOverlay";

type Props = {
  gameState: GameState;
  difficulty: TrainingDifficulty;
  onFinishRun: (runState: RadarRunState, result: RadarRunResult) => void;
  onExitRun: () => void;
};

export const RadarTrackingGame: React.FC<Props> = ({
  gameState,
  difficulty,
  onFinishRun,
  onExitRun,
}) => {
  // Config & Run Setup
  const roundCount = difficulty === "easy" ? 5 : difficulty === "medium" ? 6 : 7;
  const initialRecoveries = difficulty === "easy" ? 2 : difficulty === "medium" ? 1 : 0;

  // React State
  const [phase, setPhase] = useState<RadarRoundPhase>("target_cue");
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [recoveryChargesLeft, setRecoveryChargesLeft] = useState<number>(initialRecoveries);
  const [selectedObjectIds, setSelectedObjectIds] = useState<Set<string>>(new Set());
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);
  const [resumeCountdown, setResumeCountdown] = useState<number | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState<boolean>(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState<boolean>(false);
  const [radarFeedbackModal, setRadarFeedbackModal] = useState<{
    show: boolean;
    correct: boolean;
    correctCount: number;
    targetCount: number;
    onProceed: () => void;
  } | null>(null);
  const [soundMuted, setSoundMuted] = useState<boolean>(!soundManager.isEnabled());

  // Run stats tracking
  const runStateRef = useRef<RadarRunState>({
    id: `run_radar_${Date.now()}`,
    difficulty,
    currentRoundIndex: 0,
    totalRounds: roundCount,
    recoveryChargesLeft: initialRecoveries,
    initialRecoveryCharges: initialRecoveries,
    trialSeed: Date.now(),
    trialCountForRound: 1,
    completedRounds: 0,
    correctSelectionsTotal: 0,
    possibleTargetsTotal: 0,
    startTimeMs: Date.now(),
  });

  // Canvas & Physics Refs (Mutable state outside React re-render cycle)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const objectsRef = useRef<RadarObject[]>([]);
  const targetIdsRef = useRef<Set<string>>(new Set());
  const directionChangesRef = useRef<ScheduledDirectionChange[]>([]);
  const occlusionZonesRef = useRef<OcclusionZone[]>([]);
  const currentConfigRef = useRef<RadarRoundConfig>(getRadarRoundConfig(difficulty, 0));

  const trackingTimeElapsedRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const sweepAngleRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const roundPhaseRef = useRef<RadarRoundPhase>("target_cue");
  const isPausedRef = useRef<boolean>(false);
  const cueTimerRef = useRef<NodeJS.Timeout | null>(null);
  const neutralTimerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedObjectIdsRef = useRef<Set<string>>(selectedObjectIds);

  // Sync refs with React state
  useEffect(() => {
    roundPhaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    selectedObjectIdsRef.current = selectedObjectIds;
  }, [selectedObjectIds]);

  // Canvas drawing loop
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background (Dark Military Radar Obsidian)
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radarRadius = Math.min(width, height) * 0.44;

    // Outer Radar Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radarRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#030712";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = "#059669";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radarRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Concentric Radar Rings
    ctx.strokeStyle = "#065f46";
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;
    for (let r = 0.25; r < 1; r += 0.25) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radarRadius * r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Grid Crosshairs
    ctx.strokeStyle = "#047857";
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(centerX - radarRadius, centerY);
    ctx.lineTo(centerX + radarRadius, centerY);
    ctx.moveTo(centerX, centerY - radarRadius);
    ctx.lineTo(centerX, centerY + radarRadius);
    ctx.stroke();

    // Decorative Sweep Beam
    const sweepAngle = sweepAngleRef.current;
    ctx.save();
    ctx.globalAlpha = 0.15;
    const gradient = ctx.createConicGradient(sweepAngle, centerX, centerY);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.4)");
    gradient.addColorStop(0.12, "rgba(16, 185, 129, 0.05)");
    gradient.addColorStop(0.2, "transparent");
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radarRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.globalAlpha = 1.0;

    // Render Occlusion Zones (Hard Mode)
    if (currentConfigRef.current.hasOcclusion && occlusionZonesRef.current.length > 0) {
      for (const zone of occlusionZonesRef.current) {
        const zx = centerX + (zone.x - 0.5) * (radarRadius * 2);
        const zy = centerY + (zone.y - 0.5) * (radarRadius * 2);
        const zr = zone.radius * radarRadius * 2;

        ctx.save();
        ctx.fillStyle = "#022c22";
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.arc(zx, zy, zr, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#064e3b";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Render Objects
    const curPhase = roundPhaseRef.current;
    const currentSelectedIds = selectedObjectIdsRef.current;

    for (const obj of objectsRef.current) {
      // Convert normalized coords (0..1) to canvas coords
      const px = centerX + (obj.x - 0.5) * (radarRadius * 2);
      const py = centerY + (obj.y - 0.5) * (radarRadius * 2);
      const pr = obj.radius * radarRadius * 2;

      // Occlusion check
      let isInOcclusion = false;
      if (curPhase === "tracking" && currentConfigRef.current.hasOcclusion) {
        for (const zone of occlusionZonesRef.current) {
          const zx = centerX + (zone.x - 0.5) * (radarRadius * 2);
          const zy = centerY + (zone.y - 0.5) * (radarRadius * 2);
          const zr = zone.radius * radarRadius * 2;
          if (Math.hypot(px - zx, py - zy) < zr * 0.9) {
            isInOcclusion = true;
            break;
          }
        }
      }

      ctx.save();

      if (isInOcclusion) {
        ctx.globalAlpha = 0.15; // Softly obscured under radar noise
      }

      // Base Signal Dot
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = "#10b981"; // Emerald dot core
      ctx.fill();

      // Core glow
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, pr * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = "#a7f3d0";
      ctx.fill();
      ctx.shadowBlur = 0;

      // 1. TARGET CUE PHASE: Highlight targets clearly
      if (curPhase === "target_cue") {
        if (targetIdsRef.current.has(obj.id)) {
          // Pulsing target halo ring
          const pulse = (Math.sin(performance.now() * 0.008) + 1) * 0.5;
          ctx.strokeStyle = "#f59e0b"; // Gold amber target cue
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(px, py, pr + 6 + pulse * 4, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(px, py, pr + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 2. SELECTION SELECTION RING (When user selects object during selection phase)
      if (curPhase === "selection" || curPhase === "feedback") {
        if (currentSelectedIds.has(obj.id)) {
          ctx.strokeStyle = "#38bdf8"; // Cyan selection ring
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(px, py, pr + 7, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 3. FEEDBACK PHASE: Reveal correct vs wrong
      if (curPhase === "feedback") {
        const isTarget = targetIdsRef.current.has(obj.id);
        const isSelected = currentSelectedIds.has(obj.id);

        if (isTarget && isSelected) {
          // Correctly guessed target (Green ring with checkmark)
          ctx.strokeStyle = "#10b981";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(px, py, pr + 8, 0, Math.PI * 2);
          ctx.stroke();
        } else if (!isTarget && isSelected) {
          // Incorrectly selected distractor (Red ring)
          ctx.strokeStyle = "#f43f5e";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(px, py, pr + 8, 0, Math.PI * 2);
          ctx.stroke();
        } else if (isTarget && !isSelected) {
          // Missed target (Gold ring)
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(px, py, pr + 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // Pause Blur Overlay on Canvas
    if (isPausedRef.current || showPauseModal) {
      ctx.fillStyle = "rgba(2, 6, 23, 0.85)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "800 14px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("TẠM DỪNG HOẠT ĐỘNG RADAR", centerX, centerY);
    }

    ctx.restore();
  }, [showPauseModal]);

  // Main Animation Loop
  useEffect(() => {
    const loop = (time: number) => {
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = time;
      const dt = (time - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = time;

      if (!isPausedRef.current && !showPauseModal) {
        // Rotate sweep beam
        sweepAngleRef.current += Math.PI * 0.8 * dt;

        // Physics update during tracking phase
        if (roundPhaseRef.current === "tracking") {
          trackingTimeElapsedRef.current += dt * 1000;

          updateRadarPhysics(
            objectsRef.current,
            dt,
            trackingTimeElapsedRef.current,
            directionChangesRef.current,
            0.40
          );

          // Check if tracking duration ended
          if (trackingTimeElapsedRef.current >= currentConfigRef.current.trackingMs) {
            setPhase("selection");
          }
        }
      }

      drawScene();
      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [drawScene, showPauseModal]);

  // Start a new Round / Trial
  const startRound = useCallback(
    (rIndex: number, seed: number) => {
      if (cueTimerRef.current) clearTimeout(cueTimerRef.current);
      if (neutralTimerRef.current) clearTimeout(neutralTimerRef.current);

      const roundData = generateRoundData(difficulty, rIndex, seed);
      currentConfigRef.current = roundData.config;
      objectsRef.current = roundData.objects;
      targetIdsRef.current = roundData.targetIds;
      directionChangesRef.current = roundData.directionChanges;
      occlusionZonesRef.current = roundData.occlusionZones;

      setSelectedObjectIds(new Set());
      trackingTimeElapsedRef.current = 0;
      lastFrameTimeRef.current = 0;

      setRoundIndex(rIndex);
      setPhase("target_cue");

      // Cue Phase timer
      cueTimerRef.current = setTimeout(() => {
        // Neutral Phase (targets look identical to distractors)
        setPhase("neutral");

        neutralTimerRef.current = setTimeout(() => {
          // Tracking Phase (motion begins)
          trackingTimeElapsedRef.current = 0;
          lastFrameTimeRef.current = performance.now();
          setPhase("tracking");
        }, 280);
      }, roundData.config.cueMs);
    },
    [difficulty]
  );

  // Initialize first round on mount
  useEffect(() => {
    startRound(0, runStateRef.current.trialSeed);

    return () => {
      if (cueTimerRef.current) clearTimeout(cueTimerRef.current);
      if (neutralTimerRef.current) clearTimeout(neutralTimerRef.current);
    };
  }, [startRound]);

  // Tab visibility auto-pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && roundPhaseRef.current === "tracking") {
        isPausedRef.current = true;
        setShowPauseModal(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Canvas Pointer Event for Reliable Touch & Mouse Target Selection
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "selection") return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const tapCanvasX = e.clientX - rect.left;
    const tapCanvasY = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radarRadius = Math.min(width, height) * 0.44;

    // Direct pixel-distance hit detection (~72px touch target area)
    let closestObj: RadarObject | null = null;
    let minHitDistPx = 36; // 36 CSS pixels radius for effortless touch selection

    for (const obj of objectsRef.current) {
      const px = centerX + (obj.x - 0.5) * (radarRadius * 2);
      const py = centerY + (obj.y - 0.5) * (radarRadius * 2);
      const dist = Math.hypot(px - tapCanvasX, py - tapCanvasY);
      if (dist <= minHitDistPx) {
        minHitDistPx = dist;
        closestObj = obj;
      }
    }

    if (closestObj) {
      soundManager.playClick();
      setSelectedObjectIds((prev) => {
        const next = new Set(prev);
        if (next.has(closestObj.id)) {
          next.delete(closestObj.id);
        } else {
          if (next.size < currentConfigRef.current.targetCount) {
            next.add(closestObj.id);
          } else if (currentConfigRef.current.targetCount === 1) {
            // Replaces selection if single target
            next.clear();
            next.add(closestObj.id);
          }
        }
        return next;
      });
    }
  };

  // Submit Selections & Feedback Phase
  const handleSubmitSelection = () => {
    if (phase !== "selection") return;

    const targetCount = currentConfigRef.current.targetCount;
    if (selectedObjectIds.size !== targetCount) return;

    setPhase("feedback");

    // Calculate match correctness
    let correctCount = 0;
    selectedObjectIds.forEach((id) => {
      if (targetIdsRef.current.has(id)) {
        correctCount++;
      }
    });

    const isSuccess = correctCount === targetCount;

    // Update run stats
    runStateRef.current.correctSelectionsTotal += correctCount;
    runStateRef.current.possibleTargetsTotal += targetCount;

    if (isSuccess) {
      soundManager.playSuccess();
    } else {
      soundManager.playError();
    }

    const proceedFn = () => {
      setRadarFeedbackModal(null);
      if (isSuccess) {
        runStateRef.current.completedRounds = roundIndex + 1;
        const nextRoundIndex = roundIndex + 1;
        if (nextRoundIndex >= roundCount) {
          setPhase("complete");
          const res = createRadarRunResult(runStateRef.current, true);
          onFinishRun(runStateRef.current, res);
        } else {
          runStateRef.current.currentRoundIndex = nextRoundIndex;
          startRound(nextRoundIndex, runStateRef.current.trialSeed + nextRoundIndex * 777);
        }
      } else {
        if (recoveryChargesLeft > 0) {
          setShowRecoveryModal(true);
        } else {
          setPhase("failed");
          const res = createRadarRunResult(runStateRef.current, false);
          onFinishRun(runStateRef.current, res);
        }
      }
    };

    setRadarFeedbackModal({
      show: true,
      correct: isSuccess,
      correctCount,
      targetCount,
      onProceed: proceedFn,
    });
  };

  // Recovery handling
  const handleUseRecovery = () => {
    if (recoveryChargesLeft <= 0) return;
    soundManager.playClick();

    const newCharges = recoveryChargesLeft - 1;
    setRecoveryChargesLeft(newCharges);
    runStateRef.current.recoveryChargesLeft = newCharges;
    runStateRef.current.trialCountForRound += 1;
    setShowRecoveryModal(false);

    // Regenerate new trial for SAME round index with derived seed
    const newSeed = runStateRef.current.trialSeed + roundIndex * 999 + runStateRef.current.trialCountForRound * 123;
    startRound(roundIndex, newSeed);
  };

  const handleDeclineRecovery = () => {
    setShowRecoveryModal(false);
    setPhase("failed");
    const res = createRadarRunResult(runStateRef.current, false);
    onFinishRun(runStateRef.current, res);
  };

  // Pause & Resume Control
  const handlePause = () => {
    soundManager.playClick();
    isPausedRef.current = true;
    setShowPauseModal(true);
  };

  const handleResume = () => {
    soundManager.playClick();
    setShowPauseModal(false);
    setResumeCountdown(3);

    const timer = setInterval(() => {
      setResumeCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          isPausedRef.current = false;
          lastFrameTimeRef.current = performance.now();
          return null;
        }
        return prev - 1;
      });
    }, 800);
  };

  const targetCount = currentConfigRef.current.targetCount;
  const isSubmitEnabled = selectedObjectIds.size === targetCount;

  return (
    <ExclusiveFullscreenOverlay
      ariaLabel="Mắt Thần Radar"
      onEscape={() => setShowExitConfirmModal(true)}
      className="bg-slate-950 flex flex-col items-center justify-between p-3 sm:p-4 select-none font-sans overflow-hidden"
    >
      {/* Top Header HUD */}
      <div className="w-full max-w-md flex items-center justify-between bg-slate-900 border border-emerald-500/30 rounded-2xl p-2.5 sm:p-3 shadow-lg shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-xs text-slate-100 flex items-center gap-1.5 leading-none">
              Mắt Thần Radar
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                {difficulty === "easy" ? "Dễ" : difficulty === "medium" ? "Vừa" : "Khó"}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Vòng <span className="font-bold text-slate-200">{roundIndex + 1}</span> / {roundCount}
            </p>
          </div>
        </div>

        {/* Right HUD Controls */}
        <div className="flex items-center gap-2">
          {recoveryChargesLeft > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-1 rounded-xl">
              <span>Cứu:</span>
              <span className="font-black text-amber-400">{recoveryChargesLeft}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              const muted = soundManager.toggleMute();
              setSoundMuted(!muted);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={handlePause}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Pause className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setShowExitConfirmModal(true);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Thoát"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Phase Instructions Banner */}
      <div className="w-full max-w-md my-2 text-center">
        {phase === "target_cue" && (
          <div className="bg-amber-950/60 border border-amber-500/40 rounded-2xl py-2 px-3 text-amber-300 text-xs font-bold animate-pulse">
            🎯 Ghi nhớ <span className="font-black text-amber-200">{targetCount}</span> tín hiệu mục tiêu được đánh dấu!
          </div>
        )}

        {phase === "neutral" && (
          <div className="bg-slate-900/80 border border-slate-700 rounded-2xl py-2 px-3 text-slate-300 text-xs font-bold">
            👁️ Chuẩn bị... Các tín hiệu sắp di chuyển!
          </div>
        )}

        {phase === "tracking" && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl py-2 px-3 text-emerald-300 text-xs font-bold">
            👀 Giữ mắt theo dõi vết các mục tiêu ban đầu!
          </div>
        )}

        {phase === "selection" && (
          <div className="bg-cyan-950/60 border border-cyan-500/40 rounded-2xl py-2 px-3 text-cyan-200 text-xs font-bold flex items-center justify-between">
            <span>Chạm chọn lại đúng các mục tiêu:</span>
            <span className="font-extrabold text-sm px-2 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
              {selectedObjectIds.size} / {targetCount}
            </span>
          </div>
        )}

        {phase === "feedback" && (
          <div className="bg-slate-900/90 border border-slate-700 rounded-2xl py-2 px-3 text-xs font-bold text-slate-200">
            Kiểm tra kết quả...
          </div>
        )}
      </div>

      {/* Main Radar Arena Canvas */}
      <div className="relative w-full max-w-[340px] sm:max-w-[420px] aspect-square flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          className="w-full h-full rounded-full border-2 border-slate-800 shadow-2xl cursor-pointer touch-none bg-slate-950"
        />

        {/* Resume Countdown Overlay */}
        {resumeCountdown !== null && (
          <div className="absolute inset-0 z-20 rounded-full bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
            <span className="text-6xl font-black text-emerald-400 animate-ping">
              {resumeCountdown}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Action Area / Submit Button */}
      <div className="w-full max-w-md mt-2 flex flex-col gap-2">
        {phase === "selection" ? (
          <button
            type="button"
            disabled={!isSubmitEnabled}
            onClick={handleSubmitSelection}
            className={`w-full py-3.5 rounded-2xl font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
              isSubmitEnabled
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25 border border-emerald-400/30"
                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50 opacity-60"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Xác Nhận ({selectedObjectIds.size} / {targetCount})</span>
          </button>
        ) : (
          <div className="h-12 flex items-center justify-center text-xs text-slate-500 font-semibold">
            {phase === "target_cue" && "Đang hiển thị mục tiêu..."}
            {phase === "tracking" && "Radar đang di chuyển..."}
            {phase === "feedback" && "Đang tổng hợp kết quả..."}
          </div>
        )}
      </div>

      {/* Pause Modal */}
      {showPauseModal && (
        <ConfirmationDialog status="warning"
          onClose={handleResume}
          layer="exclusive-dialog"
          layout="viewport-safe"
          labelledBy="radar-pause-title"
          panelClassName="text-center"
        >
          <OverlayHeader className="justify-center text-center">
            <h3 id="radar-pause-title" className="modal-title">Đã Tạm Dừng</h3>
          </OverlayHeader>
          <OverlayBody>
            <p className="text-xs text-[var(--modal-muted)]">Tín hiệu radar tạm thời che khuất để đảm bảo tính công bằng.</p>
          </OverlayBody>
          <OverlayFooter className="flex flex-col">
              <ModalButton variant="primary"
                type="button"
                onClick={handleResume}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Tiếp Tục</span>
              </ModalButton>
              <ModalButton variant="primary"
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onExitRun();
                }}
              >
                Thoát Lượt Chơi
              </ModalButton>
          </OverlayFooter>
        </ConfirmationDialog>
      )}

      {/* Recovery Offer Modal */}
      {showRecoveryModal && (
        <ConfirmationDialog status="warning"
          layer="exclusive-dialog"
          layout="viewport-safe"
          closeOnEscape={false}
          labelledBy="radar-recovery-title"
          panelClassName="text-center"
        >
          <OverlayHeader className="flex flex-col items-center text-center">
            <div className="modal-status-icon">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 id="radar-recovery-title" className="modal-title">Mất Dấu Mục Tiêu!</h3>
          </OverlayHeader>

          <OverlayBody>
            <p className="text-center text-xs text-[var(--modal-text)]">
              Bạn còn <span className="font-semibold text-[var(--modal-reward)]">{recoveryChargesLeft}</span> lượt cứu sinh.
              Bạn có muốn dùng 1 lượt để thử lại vòng chơi này với bố cục mới?
            </p>
          </OverlayBody>

          <OverlayFooter>
              <ModalButton variant="primary"
                type="button"
                onClick={handleUseRecovery}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Dùng Cứu Sinh</span>
              </ModalButton>
              <ModalButton variant="primary"
                type="button"
                onClick={handleDeclineRecovery}
              >
                Chấp Nhận Thua
              </ModalButton>
          </OverlayFooter>
        </ConfirmationDialog>
      )}

      {/* Confirmation Feedback Modal */}
      {radarFeedbackModal?.show && (
        <GameResultModal status={radarFeedbackModal.correct ? "success" : "danger"}
          layer="exclusive-dialog"
          layout="viewport-safe"
          closeOnEscape={false}
          labelledBy="radar-feedback-title"
          panelClassName="text-center"
        >
          <ResultHero className="flex flex-col items-center text-center">
            <div
              className="modal-status-icon"
            >
              {radarFeedbackModal.correct ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <ShieldAlert className="w-10 h-10" />
              )}
            </div>

            <div className="space-y-1">
              <h3 id="radar-feedback-title" className="modal-title">
                {radarFeedbackModal.correct ? "CHÍNH XÁC!" : "CHƯA CHÍNH XÁC!"}
              </h3>
            </div>
          </ResultHero>

          <OverlayBody>
            <p className="text-center text-xs text-[var(--modal-text)]">
              {radarFeedbackModal.correct
                ? `Đã khoanh vùng chính xác toàn bộ ${radarFeedbackModal.targetCount} mục tiêu radar!`
                : `Bạn chỉ khoanh vùng đúng ${radarFeedbackModal.correctCount}/${radarFeedbackModal.targetCount} mục tiêu.`}
            </p>
          </OverlayBody>

          <ModalActions>
            <ModalButton variant="primary"
              type="button"
              onClick={radarFeedbackModal.onProceed}
              className="w-full"
            >
              Tiếp Tục
            </ModalButton>
          </ModalActions>
        </GameResultModal>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirmModal && (
        <ConfirmationDialog status="warning"
          onClose={() => setShowExitConfirmModal(false)}
          layer="exclusive-dialog"
          layout="viewport-safe"
          labelledBy="radar-exit-title"
          panelClassName="text-center"
        >
          <OverlayHeader className="flex flex-col items-center text-center">
            <div className="modal-status-icon">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 id="radar-exit-title" className="modal-title">Thoát Lượt Chơi?</h3>
          </OverlayHeader>

          <OverlayBody>
            <p className="text-center text-xs text-[var(--modal-muted)]">
              Bạn có chắc chắn muốn thoát khỏi lượt chơi Mắt Thần Radar hiện tại không?
            </p>
          </OverlayBody>

          <OverlayFooter>
              <ModalButton variant="ghost"
                type="button"
                onClick={() => setShowExitConfirmModal(false)}
              >
                Tiếp Tục Chơi
              </ModalButton>
              <ModalButton variant="danger"
                type="button"
                onClick={onExitRun}
              >
                Xác Nhận Thoát
              </ModalButton>
          </OverlayFooter>
        </ConfirmationDialog>
      )}
    </ExclusiveFullscreenOverlay>
  );
};
