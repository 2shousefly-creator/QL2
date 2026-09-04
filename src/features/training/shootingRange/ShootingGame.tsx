import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, ArrowLeft, Crosshair, Clock, Trophy, Percent, Flame, SlidersHorizontal } from "lucide-react";
import { TrainingDifficulty } from "../../../game/types";
import {
  ShootingTarget,
  ShootingRunState,
  ShootingRunResult,
} from "../../../game/training/shootingRange/shootingTypes";
import { SHOOTING_DIFFICULTY_CONFIGS } from "../../../game/training/shootingRange/shootingConfig";
import { soundManager } from "../../../game/audio";

type ShootingGameProps = {
  difficulty: TrainingDifficulty;
  onFinishRun: (run: ShootingRunState, result: ShootingRunResult) => void;
  onExitRun: () => void;
};

type FloatingText = {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  createdAtPerfMs: number;
};

type SensitivityLevel = "low" | "medium" | "high";

const SENSITIVITY_MAP: Record<SensitivityLevel, { label: string; mult: number }> = {
  low: { label: "Thấp", mult: 0.7 },
  medium: { label: "Vừa", mult: 1.0 },
  high: { label: "Cao", mult: 1.5 },
};

export const ShootingGame: React.FC<ShootingGameProps> = ({
  difficulty,
  onFinishRun,
  onExitRun,
}) => {
  const config = SHOOTING_DIFFICULTY_CONFIGS[difficulty];

  // Game state
  const [runState, setRunState] = useState<ShootingRunState>(() => ({
    id: `shooting_run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    difficulty,
    status: "ready",
    startedAtPerfMs: null,
    score: 0,
    shotsFired: 0,
    hits: 0,
    targetsSpawned: 0,
    targetsDestroyed: 0,
    lastShotPerfMs: null,
    targets: [],
  }));

  const [timeLeftSec, setTimeLeftSec] = useState<number>(Math.ceil(config.durationMs / 1000));
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState<number>(0);

  // Sensitivity level
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>("medium");
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Aim crosshair coordinates in percentages (0 to 100)
  const [aimPos, setAimPos] = useState<{ x: number; y: number }>({ x: 50, y: 40 });

  // Gun animation state
  const [isRecoiling, setIsRecoiling] = useState<boolean>(false);
  const [showMuzzleFlash, setShowMuzzleFlash] = useState<boolean>(false);

  // Floating text popups (+10, +8, MISS)
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Refs for animation loop & touch tracking
  const playAreaRef = useRef<HTMLDivElement>(null);
  const runStateRef = useRef<ShootingRunState>(runState);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const lastShotTimeRef = useRef<number>(0);
  const aimTouchIdRef = useRef<number | null>(null);
  const touchStartPosRef = useRef<{ startX: number; startY: number; aimX: number; aimY: number } | null>(null);
  const finishTriggeredRef = useRef<boolean>(false);
  const aimPosRef = useRef(aimPos);
  const sensitivityRef = useRef(sensitivity);

  useEffect(() => {
    runStateRef.current = runState;
  }, [runState]);

  useEffect(() => {
    aimPosRef.current = aimPos;
  }, [aimPos]);

  useEffect(() => {
    sensitivityRef.current = sensitivity;
  }, [sensitivity]);

  // Helper to create a new target
  const createTarget = useCallback((spawnIndex: number): ShootingTarget => {
    const depth = 0.25 + Math.random() * 0.75;
    const radiusPx = 16 + depth * 28;

    const x = 12 + Math.random() * 76;
    const y = 18 + Math.random() * 45;

    const speedMult = config.targetSpeedMultiplier;
    const baseSpeed = 12 + Math.random() * 16;
    const angle = Math.random() * Math.PI * 2;

    const velocityX = Math.cos(angle) * baseSpeed * speedMult;
    const velocityY = Math.sin(angle) * baseSpeed * speedMult * 0.7;

    return {
      id: `target_${spawnIndex}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      x,
      y,
      depth,
      radiusPx,
      velocityX,
      velocityY,
    };
  }, [config.targetSpeedMultiplier]);

  // Initialize targets
  useEffect(() => {
    const initialTargets: ShootingTarget[] = [];
    for (let i = 0; i < config.initialTargets; i++) {
      initialTargets.push(createTarget(i + 1));
    }

    const startPerfMs = performance.now();
    setRunState((prev) => ({
      ...prev,
      status: "playing",
      startedAtPerfMs: startPerfMs,
      targetsSpawned: config.initialTargets,
      targets: initialTargets,
    }));
  }, [config.initialTargets, createTarget]);

  // Handle Shot Fire
  const handleFire = useCallback(() => {
    const nowPerf = performance.now();
    const state = runStateRef.current;

    if (state.status !== "playing") return;

    // Synchronous cooldown check using ref to prevent duplicate triggers in same frame
    if (nowPerf - lastShotTimeRef.current < config.fireCooldownMs) {
      return; // Still in cooldown
    }
    lastShotTimeRef.current = nowPerf;

    // Sound FX & Haptic
    soundManager.playGunshot();
    soundManager.triggerHaptic("heavy");

    // Recoil & Muzzle flash
    setIsRecoiling(true);
    setShowMuzzleFlash(true);
    setTimeout(() => setShowMuzzleFlash(false), 80);
    setTimeout(() => setIsRecoiling(false), 140);

    // Crosshair target area calculation
    const playAreaEl = playAreaRef.current;
    let crosshairPx = { x: 0, y: 0 };
    let areaWidth = 400;
    let areaHeight = 300;

    const currentAim = aimPosRef.current;

    if (playAreaEl) {
      const rect = playAreaEl.getBoundingClientRect();
      areaWidth = rect.width;
      areaHeight = rect.height;
      crosshairPx = {
        x: (currentAim.x / 100) * rect.width,
        y: (currentAim.y / 100) * rect.height,
      };
    }

    const activeTargets = state.targets.filter((t) => !t.isBreaking);

    type HitCandidate = {
      target: ShootingTarget;
      distancePx: number;
      normalizedDist: number;
      scoreRing: number;
    };

    const candidates: HitCandidate[] = [];

    activeTargets.forEach((t) => {
      const targetPxX = (t.x / 100) * areaWidth;
      const targetPxY = (t.y / 100) * areaHeight;

      const dx = crosshairPx.x - targetPxX;
      const dy = crosshairPx.y - targetPxY;
      const distPx = Math.sqrt(dx * dx + dy * dy);

      if (distPx <= t.radiusPx) {
        const normDist = distPx / t.radiusPx;
        let ringScore = 0;

        if (normDist <= 0.1) ringScore = 10;
        else if (normDist <= 0.2) ringScore = 9;
        else if (normDist <= 0.3) ringScore = 8;
        else if (normDist <= 0.4) ringScore = 7;
        else if (normDist <= 0.5) ringScore = 6;
        else if (normDist <= 0.6) ringScore = 5;
        else if (normDist <= 0.7) ringScore = 4;
        else if (normDist <= 0.8) ringScore = 3;
        else if (normDist <= 0.9) ringScore = 2;
        else if (normDist <= 1.0) ringScore = 1;

        if (ringScore > 0) {
          candidates.push({
            target: t,
            distancePx: distPx,
            normalizedDist: normDist,
            scoreRing: ringScore,
          });
        }
      }
    });

    let newShotsFired = state.shotsFired + 1;
    let newHits = state.hits;
    let newScore = state.score;
    let newTargetsDestroyed = state.targetsDestroyed;
    let newTargetsSpawned = state.targetsSpawned;
    let updatedTargets = [...state.targets];

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.target.depth - a.target.depth);
      const hitResult = candidates[0];
      const hitTarget = hitResult.target;

      soundManager.playTargetHit();

      newHits += 1;
      newScore += hitResult.scoreRing;
      newTargetsDestroyed += 1;

      const popId = `pop_${Date.now()}_${Math.random()}`;
      setFloatingTexts((prev) => [
        ...prev,
        {
          id: popId,
          x: hitTarget.x,
          y: hitTarget.y,
          text: `+${hitResult.scoreRing}${hitResult.scoreRing === 10 ? " HỒNG TÂM!" : ""}`,
          color: hitResult.scoreRing >= 9 ? "#f59e0b" : hitResult.scoreRing >= 6 ? "#06b6d4" : "#10b981",
          createdAtPerfMs: nowPerf,
        },
      ]);

      let newTargetObj: ShootingTarget | null = null;
      if (newTargetsSpawned < config.maxTargetsSpawned) {
        newTargetsSpawned += 1;
        newTargetObj = createTarget(newTargetsSpawned);
      }

      updatedTargets = updatedTargets.map((t) => {
        if (t.id === hitTarget.id) {
          return {
            ...t,
            isBreaking: true,
            breakProgress: 0,
            hitPointsRing: hitResult.scoreRing,
            hitTimeMs: nowPerf,
          };
        }
        return t;
      });

      if (newTargetObj) {
        updatedTargets.push(newTargetObj);
      }
    } else {
      soundManager.playTargetMiss();

      const popId = `pop_miss_${Date.now()}`;
      setFloatingTexts((prev) => [
        ...prev,
        {
          id: popId,
          x: currentAim.x,
          y: currentAim.y,
          text: "TRƯỢT",
          color: "#f43f5e",
          createdAtPerfMs: nowPerf,
        },
      ]);
    }

    setRunState((prev) => ({
      ...prev,
      shotsFired: newShotsFired,
      hits: newHits,
      score: newScore,
      targetsDestroyed: newTargetsDestroyed,
      targetsSpawned: newTargetsSpawned,
      lastShotPerfMs: nowPerf,
      targets: updatedTargets,
    }));
  }, [config.fireCooldownMs, config.maxTargetsSpawned, createTarget]);

  // Keyboard Spacebar input for firing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleFire();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFire]);

  // Main Animation Loop
  useEffect(() => {
    const updateGame = (nowPerf: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = nowPerf;
      }
      const dt = Math.min((nowPerf - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = nowPerf;

      const state = runStateRef.current;

      if (state.status === "playing" && state.startedAtPerfMs !== null) {
        const elapsedMs = nowPerf - state.startedAtPerfMs;
        const remainMs = Math.max(0, config.durationMs - elapsedMs);
        const remainSec = Math.ceil(remainMs / 1000);
        setTimeLeftSec(remainSec);

        if (state.lastShotPerfMs !== null) {
          const cdLeft = Math.max(0, config.fireCooldownMs - (nowPerf - state.lastShotPerfMs));
          setCooldownRemainingMs(cdLeft);
        }

        const allTargetsFinished =
          state.targetsSpawned >= config.maxTargetsSpawned &&
          (state.targetsDestroyed >= config.maxTargetsSpawned || state.targets.length === 0);

        if ((remainMs <= 0 || allTargetsFinished) && !finishTriggeredRef.current) {
          finishTriggeredRef.current = true;

          const shots = state.shotsFired;
          const hits = state.hits;
          const accuracy = shots > 0 ? hits / shots : 0;

          const reqScore = config.minScoreToWin;
          const reqAcc = config.minAccuracyToWin;
          const victory = state.score >= reqScore && accuracy >= reqAcc;
          const perfectWin = victory && accuracy === 1.0;

          const finalResult: ShootingRunResult = {
            score: state.score,
            accuracy,
            hits,
            shotsFired: shots,
            targetsDestroyed: state.targetsDestroyed,
            targetsSpawned: state.targetsSpawned,
            elapsedRealMs: elapsedMs,
            victory,
            perfectWin,
          };

          const finalState: ShootingRunState = {
            ...state,
            status: victory ? "won" : "lost",
          };

          setRunState(finalState);
          onFinishRun(finalState, finalResult);
          return;
        }

        setRunState((prev) => {
          if (prev.status !== "playing") return prev;

          const updated = prev.targets
            .map((target) => {
              if (target.isBreaking) {
                const age = nowPerf - (target.hitTimeMs || nowPerf);
                const progress = Math.min(1, age / 350);
                if (progress >= 1) return null;
                return { ...target, breakProgress: progress };
              }

              let nextX = target.x + target.velocityX * dt;
              let nextY = target.y + target.velocityY * dt;
              let vx = target.velocityX;
              let vy = target.velocityY;

              if (nextX <= 6) {
                nextX = 6;
                vx = Math.abs(vx);
              } else if (nextX >= 94) {
                nextX = 94;
                vx = -Math.abs(vx);
              }

              if (nextY <= 15) {
                nextY = 15;
                vy = Math.abs(vy);
              } else if (nextY >= 65) {
                nextY = 65;
                vy = -Math.abs(vy);
              }

              return {
                ...target,
                x: nextX,
                y: nextY,
                velocityX: vx,
                velocityY: vy,
              };
            })
            .filter((t): t is ShootingTarget => t !== null);

          return { ...prev, targets: updated };
        });

        setFloatingTexts((prev) => prev.filter((ft) => nowPerf - ft.createdAtPerfMs < 750));
      }

      animFrameRef.current = requestAnimationFrame(updateGame);
    };

    animFrameRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [config.durationMs, config.minAccuracyToWin, config.minScoreToWin, config.fireCooldownMs, onFinishRun]);

  // Touch handlers to drag aim anywhere on screen with multi-touch identifier support
  const handleTouchStart = (e: React.TouchEvent) => {
    // If touched button or UI controls, skip dragging aim
    if ((e.target as HTMLElement).closest("button")) return;

    if (aimTouchIdRef.current === null && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      aimTouchIdRef.current = touch.identifier;
      touchStartPosRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        aimX: aimPosRef.current.x,
        aimY: aimPosRef.current.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (aimTouchIdRef.current === null || !touchStartPosRef.current || !playAreaRef.current) return;

    let aimTouch: React.Touch | undefined;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === aimTouchIdRef.current) {
        aimTouch = e.touches[i];
        break;
      }
    }

    if (aimTouch) {
      const dx = aimTouch.clientX - touchStartPosRef.current.startX;
      const dy = aimTouch.clientY - touchStartPosRef.current.startY;

      const rect = playAreaRef.current.getBoundingClientRect();
      const mult = SENSITIVITY_MAP[sensitivityRef.current].mult;

      const pctX = (dx / rect.width) * 100 * mult;
      const pctY = (dy / rect.height) * 100 * mult;

      const newAimX = Math.max(5, Math.min(95, touchStartPosRef.current.aimX + pctX));
      const newAimY = Math.max(12, Math.min(72, touchStartPosRef.current.aimY + pctY));

      setAimPos({ x: newAimX, y: newAimY });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (aimTouchIdRef.current !== null) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === aimTouchIdRef.current) {
          aimTouchIdRef.current = null;
          touchStartPosRef.current = null;
          break;
        }
      }
    }
  };

  // Mouse move over play area for desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (playAreaRef.current) {
      const rect = playAreaRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
      const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(5, Math.min(95, mouseX));
      const clampedY = Math.max(12, Math.min(72, mouseY));

      setAimPos({ x: clampedX, y: clampedY });
    }
  };

  const accuracyPct = runState.shotsFired > 0 ? Math.round((runState.hits / runState.shotsFired) * 100) : 0;
  const cooldownPct = Math.min(100, Math.round((cooldownRemainingMs / config.fireCooldownMs) * 100));

  const gunAngleDeg = (aimPos.x - 50) * 0.45;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col select-none overflow-hidden animate-fadeIn touch-none"
    >
      {/* Top HUD Header */}
      <div className="shrink-0 w-full bg-slate-900 border-b border-slate-800 p-2.5 px-3 sm:px-5 flex items-center justify-between gap-2 text-slate-100 z-30 shadow-md">
        {/* Left: Exit button & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playClick();
              setShowExitConfirm(true);
            }}
            className="p-1.5 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
            title="Thoát trò chơi"
          >
            <ArrowLeft className="w-4 h-4 text-rose-400" />
            <span>Thoát</span>
          </button>
          <h2 className="font-extrabold text-sm sm:text-base text-slate-100 tracking-wide whitespace-nowrap">
            Bắn Súng
          </h2>
        </div>

        {/* Right: Essential HUD Metrics */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-bold">
          <div className="flex items-center gap-1 bg-slate-950/90 px-2.5 py-1 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className={timeLeftSec <= 10 ? "text-rose-400 font-black animate-pulse" : "text-slate-100 font-extrabold"}>
              {timeLeftSec}s
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950/90 px-2.5 py-1 rounded-xl border border-slate-800">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-amber-300 font-black">{runState.score}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950/90 px-2.5 py-1 rounded-xl border border-slate-800">
            <Percent className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-cyan-300 font-black">{accuracyPct}%</span>
          </div>
        </div>
      </div>

      {/* Main Play Area Stage */}
      <div
        ref={playAreaRef}
        onMouseMove={handleMouseMove}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          handleFire();
        }}
        className="relative flex-1 w-full min-h-0 bg-gradient-to-b from-sky-950 via-slate-900 to-amber-950/40 overflow-hidden cursor-crosshair"
      >
        {/* Background FPS Shooting Range Environment with 3D Grass Field, Mountains & Trees */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Sky Gradient */}
          <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-sky-950 via-sky-900/80 to-emerald-950/40" />

          {/* Sun / Ambient Horizon Glow */}
          <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[60vw] h-24 bg-amber-500/10 rounded-full blur-3xl" />

          {/* Layer 1: Far Mountain Range */}
          <div className="absolute top-[15%] inset-x-0 h-[25%] opacity-70">
            <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full text-slate-900 fill-current">
              <path d="M0,200 L0,120 L80,90 L160,130 L280,60 L400,140 L520,70 L650,130 L780,50 L900,120 L1020,80 L1120,110 L1200,70 L1200,200 Z" />
            </svg>
          </div>

          {/* Layer 2: Mid Mountain & Hill Range with Pine Trees */}
          <div className="absolute top-[22%] inset-x-0 h-[20%] opacity-90">
            <svg viewBox="0 0 1200 160" preserveAspectRatio="none" className="w-full h-full text-emerald-950 fill-current">
              <path d="M0,160 L0,80 Q100,50 200,90 Q320,40 450,100 Q600,30 750,85 Q900,45 1050,90 Q1150,60 1200,80 L1200,160 Z" />
            </svg>
          </div>

          {/* Layer 3: Tree Line along the Horizon */}
          <div className="absolute top-[32%] inset-x-0 h-[10%] flex items-end justify-between px-2 opacity-80 z-10">
            <svg viewBox="0 0 1000 60" preserveAspectRatio="none" className="w-full h-full text-green-950 fill-current">
              {/* Tree Silhouettes Pattern */}
              <path d="
                M0,60 L5,40 L10,60 L15,30 L20,60 L28,25 L35,60 L42,35 L50,60
                L60,20 L70,60 L85,30 L100,60 L115,22 L130,60 L145,35 L160,60
                L180,18 L200,60 L220,30 L240,60 L260,15 L280,60 L300,35 L320,60
                L340,20 L360,60 L385,25 L410,60 L435,15 L460,60 L485,30 L510,60
                L535,20 L560,60 L585,35 L610,60 L635,18 L660,60 L685,30 L710,60
                L735,22 L760,60 L785,38 L810,60 L835,15 L860,60 L885,28 L910,60
                L935,18 L960,60 L980,30 L1000,60 Z
              " />
            </svg>
          </div>

          {/* 3D Perspective Grass Field Ground (Horizon at top-[38%]) */}
          <div className="absolute top-[38%] inset-x-0 bottom-0 bg-gradient-to-b from-emerald-950 via-emerald-900 to-green-950 border-t-2 border-emerald-600/30 overflow-hidden">
            {/* 3D Grass Perspective Stripes / Lawn Lines */}
            <div
              className="absolute inset-0 opacity-40 origin-top"
              style={{
                perspective: "600px",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="w-full h-[200%] -top-[50%] absolute"
                style={{
                  transform: "rotateX(72deg)",
                  backgroundImage: `
                    repeating-linear-gradient(90deg, rgba(16, 185, 129, 0.25) 0px, rgba(16, 185, 129, 0.25) 40px, transparent 40px, transparent 80px),
                    repeating-linear-gradient(0deg, rgba(52, 211, 153, 0.15) 0px, rgba(52, 211, 153, 0.15) 20px, transparent 20px, transparent 60px)
                  `,
                }}
              />
            </div>

            {/* Field Shading Depth Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-transparent to-slate-950/90 pointer-events-none" />

            {/* Soft Field Sunlight Highlights */}
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-amber-400/10 to-transparent" />
          </div>
        </div>

        {/* TARGETS RENDERING */}
        {[...runState.targets]
          .sort((a, b) => a.depth - b.depth)
          .map((target) => {
          const isBreaking = target.isBreaking;
          const breakProgress = target.breakProgress || 0;

          const depthScale = target.depth;
          const zIndex = Math.round(depthScale * 100);

          return (
            <div
              key={target.id}
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                width: `${target.radiusPx * 2}px`,
                height: `${target.radiusPx * 2}px`,
                transform: "translate(-50%, -50%)",
                zIndex,
                opacity: isBreaking ? 1 - breakProgress : 1,
              }}
              className="absolute pointer-events-none flex items-center justify-center transition-opacity"
            >
              <svg
                viewBox="0 0 100 100"
                className={`w-full h-full drop-shadow-xl ${isBreaking ? "animate-ping opacity-80" : ""}`}
              >
                <circle cx="50" cy="50" r="48" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                <circle cx="50" cy="50" r="43.2" fill="#0284c7" />
                <circle cx="50" cy="50" r="38.4" fill="#f8fafc" />
                <circle cx="50" cy="50" r="33.6" fill="#0284c7" />
                <circle cx="50" cy="50" r="28.8" fill="#f8fafc" />
                <circle cx="50" cy="50" r="24" fill="#dc2626" />
                <circle cx="50" cy="50" r="19.2" fill="#f8fafc" />
                <circle cx="50" cy="50" r="14.4" fill="#dc2626" />
                <circle cx="50" cy="50" r="9.6" fill="#f8fafc" />
                <circle cx="50" cy="50" r="4.8" fill="#f59e0b" />
                <circle cx="50" cy="50" r="1.5" fill="#1e293b" />
              </svg>

              {isBreaking && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-amber-400/40 rounded-full animate-ping" />
                </div>
              )}
            </div>
          );
        })}

        {/* FLOATING TEXT POPUPS */}
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            style={{
              left: `${ft.x}%`,
              top: `${ft.y}%`,
              color: ft.color,
            }}
            className="absolute -translate-x-1/2 -translate-y-full font-black text-sm sm:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pointer-events-none animate-bounce z-50"
          >
            {ft.text}
          </div>
        ))}

        {/* CROSSHAIR - ALWAYS ON TOP OF ALL TARGETS (z-[200]) */}
        <div
          style={{
            left: `${aimPos.x}%`,
            top: `${aimPos.y}%`,
            zIndex: 200,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
        >
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-amber-400/90 shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-md" />
            <div className="absolute top-0 w-0.5 h-3 bg-amber-400" />
            <div className="absolute bottom-0 w-0.5 h-3 bg-amber-400" />
            <div className="absolute left-0 h-0.5 w-3 bg-amber-400" />
            <div className="absolute right-0 h-0.5 w-3 bg-amber-400" />
          </div>
        </div>

        {/* FPS RIFLE & MUZZLE FLASH */}
        <div
          style={{
            transform: `translateX(-50%) rotate(${gunAngleDeg}deg) ${
              isRecoiling ? "translateY(16px) scale(0.96)" : "translateY(0)"
            }`,
          }}
          className="absolute bottom-0 left-1/2 pointer-events-none z-30 transition-transform duration-100 ease-out origin-bottom"
        >
          {showMuzzleFlash && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-20 h-20 bg-amber-400/90 rounded-full blur-md animate-ping" />
          )}

          <div className="relative w-48 sm:w-64 h-32 flex flex-col items-center">
            <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-2xl">
              <rect x="95" y="10" width="10" height="40" fill="#334155" />
              <rect x="92" y="5" width="16" height="8" fill="#1e293b" />
              <polygon points="85,35 115,35 118,70 82,70" fill="#78350f" />
              <line x1="85" y1="45" x2="115" y2="45" stroke="#451a03" strokeWidth="2" />
              <line x1="85" y1="55" x2="115" y2="55" stroke="#451a03" strokeWidth="2" />
              <rect x="75" y="70" width="50" height="30" fill="#1e293b" rx="2" />
              <path d="M 105 85 Q 120 105 110 120 L 95 120 Q 105 105 95 85 Z" fill="#92400e" />
              <rect x="94" y="62" width="12" height="8" fill="#0f172a" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Mobile Control Bar */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 px-3 sm:px-4 flex items-center justify-between gap-2.5 sm:gap-4 z-30">
        {/* Left Side: Sensitivity Selector Control (Height h-28 matches Bắn button) */}
        <div className="flex-1 bg-slate-950/90 border border-amber-500/30 rounded-3xl p-2.5 sm:p-3 h-28 flex flex-col justify-between shadow-inner select-none min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between text-xs font-extrabold text-amber-300">
            <span className="flex items-center gap-1.5 truncate">
              <SlidersHorizontal className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">ĐỘ NHẠY TÂM NGẮM</span>
            </span>
            <span className="text-amber-400 font-black text-[11px] sm:text-xs bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30 shrink-0 ml-1">
              {SENSITIVITY_MAP[sensitivity].label} ({SENSITIVITY_MAP[sensitivity].mult}x)
            </span>
          </div>

          {/* 3-Level Segmented Slider Buttons */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800/80">
            {(["low", "medium", "high"] as SensitivityLevel[]).map((lvl) => {
              const active = sensitivity === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundManager.playClick();
                    setSensitivity(lvl);
                  }}
                  className={`py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none truncate ${
                    active
                      ? "bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {SENSITIVITY_MAP[lvl].label}
                </button>
              );
            })}
          </div>

          {/* Bottom Sub-hint */}
          <div className="text-[10px] text-slate-400 text-center font-medium truncate">
            Chạm chọn mức để chỉnh tốc độ kéo ngắm
          </div>
        </div>

        {/* Right Side Primary Fire Button */}
        <div className="relative shrink-0">
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFire();
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleFire();
            }}
            className={`w-40 sm:w-60 md:w-72 h-28 rounded-3xl font-black text-xl sm:text-2xl flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-2xl cursor-pointer select-none active:scale-95 ${
              cooldownRemainingMs > 0
                ? "bg-slate-800 text-slate-500 border border-slate-700 opacity-80 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-slate-950 border-2 border-amber-300 shadow-amber-500/30"
            }`}
          >
            <Flame className={`w-7 h-7 sm:w-8 sm:h-8 ${cooldownRemainingMs > 0 ? "text-slate-600" : "text-slate-950 animate-bounce"}`} />
            <span>{cooldownRemainingMs > 0 ? `${(cooldownRemainingMs / 1000).toFixed(1)}s` : "BẮN"}</span>
          </button>

          {cooldownRemainingMs > 0 && (
            <div
              style={{ width: `${cooldownPct}%` }}
              className="absolute bottom-0 left-0 h-1.5 bg-amber-400 rounded-b-3xl transition-all duration-75"
            />
          )}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
              <Crosshair className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-100">Thoát Lượt Chơi?</h3>
              <p className="text-xs text-slate-400">
                Bạn có chắc chắn muốn thoát khỏi lượt chơi Tập Bắn Súng hiện tại không?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Tiếp Tục Chơi
              </button>
              <button
                type="button"
                onClick={onExitRun}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                Xác Nhận Thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
