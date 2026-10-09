import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, X, Zap, RotateCcw, BrainCircuit, Eye, Fingerprint } from "lucide-react";
import { GameState, TrainingDifficulty } from "../../game/types";
import { SignalCommandResult, SignalCommandRun, SignalId } from "../../game/training/signalCommand/signalCommandTypes";
import { SIGNAL_TILE_DEFINITIONS, getSignalCommandConfig } from "../../game/training/signalCommand/signalCommandConfig";
import {
  advanceSignalCommandRound,
  checkSignalCommandTimeouts,
  compileSignalCommandResult,
  createSignalCommandRun,
  getExpectedTokensForRound,
  getSignalCommandPresentationState,
  processSignalCommandInput,
  startRoundPresentation,
  startSignalCommandInputPhase,
  startSignalCommandRun,
} from "../../game/training/signalCommand/signalCommandEngine";
import { soundManager } from "../../game/audio";
import { ConfirmationDialog, ExclusiveFullscreenOverlay, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../components/overlay/AppOverlay";

type SignalCommandGameProps = {
  gameState: GameState;
  difficulty: TrainingDifficulty;
  onFinishRun: (run: SignalCommandRun, result: SignalCommandResult) => void;
  onExitRun: () => void;
};

// Render Geometric Icons for Signal Tiles
const SignalIcon: React.FC<{ id: SignalId; className?: string }> = ({ id, className = "w-8 h-8" }) => {
  switch (id) {
    case "circle":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "triangle":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,3 21,19 3,19" />
        </svg>
      );
    case "diamond":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,2 22,12 12,22 2,12" />
        </svg>
      );
    case "square":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      );
    case "hexagon":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
        </svg>
      );
    case "hollow_circle":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
    case "star_8":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,2 14.5,8.5 21,6 17,12 21,18 14.5,15.5 12,22 9.5,15.5 3,18 7,12 3,6 9.5,8.5" />
        </svg>
      );
    case "chevron":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 16 12 8 20 16" />
        </svg>
      );
    case "rounded_plus":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
        </svg>
      );
    default:
      return null;
  }
};

export const SignalCommandGame: React.FC<SignalCommandGameProps> = ({
  gameState,
  difficulty,
  onFinishRun,
  onExitRun,
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    gameState.settings?.soundEnabled !== false
  );
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  const config = getSignalCommandConfig(difficulty);

  const runRef = useRef<SignalCommandRun>(createSignalCommandRun(difficulty));
  const [, setRenderTrigger] = useState<number>(0);

  const activeFlashIdsRef = useRef<SignalId[]>([]);
  const lastFlashedIndexRef = useRef<number | null>(null);
  const pressedTileRef = useRef<SignalId | null>(null);
  const countdownNumberRef = useRef<number>(3);

  const forceRender = () => setRenderTrigger((n) => n + 1);

  // Initialize and run game timing loop
  useEffect(() => {
    const run = createSignalCommandRun(difficulty);
    runRef.current = run;

    let animFrameId: number;
    let countdownIntervalId: NodeJS.Timeout;

    // Start countdown
    startSignalCommandRun(run, performance.now());
    countdownNumberRef.current = 3;
    forceRender();

    countdownIntervalId = setInterval(() => {
      countdownNumberRef.current -= 1;
      if (countdownNumberRef.current <= 0) {
        clearInterval(countdownIntervalId);
        startRoundPresentation(runRef.current, performance.now());
        forceRender();
      } else {
        forceRender();
      }
    }, 800);

    // Animation frame tick loop for presentation state and timeout checks
    const loop = () => {
      const currentRun = runRef.current;
      const now = performance.now();

      if (currentRun.status === "presenting") {
        const pres = getSignalCommandPresentationState(currentRun, now);

        if (pres.isComplete) {
          // Transition to input phase
          startSignalCommandInputPhase(currentRun, now);
          activeFlashIdsRef.current = [];
          lastFlashedIndexRef.current = null;
          forceRender();
        } else {
          // Check sound trigger for flashing
          if (pres.activeTokenIndex !== lastFlashedIndexRef.current && !pres.isGap) {
            lastFlashedIndexRef.current = pres.activeTokenIndex;
            if (pres.activeSignalIds.length > 0) {
              const signalIdx = currentRun.scenario.signalIds.indexOf(pres.activeSignalIds[0]);
              soundManager.playSignalTone(signalIdx >= 0 ? signalIdx : 0);
            }
          }
          activeFlashIdsRef.current = pres.activeSignalIds;
          forceRender();
        }
      } else if (currentRun.status === "awaiting_input") {
        // Check timeouts
        const res = checkSignalCommandTimeouts(currentRun, now);
        if (res.timedOut) {
          soundManager.playSignalError();
          soundManager.triggerHaptic("heavy");
          if (currentRun.status === "recovering") {
            // Replay round
            setTimeout(() => {
              startRoundPresentation(currentRun, performance.now());
              forceRender();
            }, 1200);
          } else if (currentRun.status === "failed") {
            const result = compileSignalCommandResult(currentRun);
            onFinishRun(currentRun, result);
            return;
          }
          forceRender();
        } else {
          forceRender();
        }
      } else if (currentRun.status === "round_intro") {
        // Short pause before presentation
        if (now - (currentRun.phaseStartedAtPerformanceMs || now) > 700) {
          startRoundPresentation(currentRun, now);
          forceRender();
        }
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);

    // Visibility / unload safety
    const handleVisibilityChange = () => {
      if (document.hidden && runRef.current.status !== "won" && runRef.current.status !== "failed") {
        runRef.current.status = "interrupted";
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animFrameId);
      clearInterval(countdownIntervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [difficulty]);

  // Handle Tile Press
  const handleTilePress = (signalId: SignalId) => {
    const run = runRef.current;
    if (run.status !== "awaiting_input") return;

    pressedTileRef.current = signalId;
    setTimeout(() => {
      if (pressedTileRef.current === signalId) pressedTileRef.current = null;
    }, 150);

    const tileIdx = run.scenario.signalIds.indexOf(signalId);
    soundManager.playSignalTone(tileIdx >= 0 ? tileIdx : 0);
    soundManager.triggerHaptic("light");

    const res = processSignalCommandInput(run, signalId, performance.now());

    if (res.outcome === "wrong") {
      soundManager.playSignalError();
      soundManager.triggerHaptic("heavy");

      if (run.status === "recovering") {
        // Replay round after short pause
        setTimeout(() => {
          startRoundPresentation(run, performance.now());
          forceRender();
        }, 1200);
      } else if (run.status === "failed") {
        const result = compileSignalCommandResult(run);
        onFinishRun(run, result);
        return;
      }
    } else if (res.isRoundComplete) {
      if (res.isVictory) {
        soundManager.playPromotionFanfare();
        const result = compileSignalCommandResult(run);
        onFinishRun(run, result);
        return;
      } else {
        // Advance round after short success pause
        setTimeout(() => {
          advanceSignalCommandRound(run, performance.now());
          forceRender();
        }, 600);
      }
    }

    forceRender();
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const run = runRef.current;
      if (run.status !== "awaiting_input") return;

      const key = e.key.toUpperCase();
      const signalIds = run.scenario.signalIds;

      let matchedSignalId: SignalId | null = null;
      signalIds.forEach((sid) => {
        const def = SIGNAL_TILE_DEFINITIONS[sid];
        if (def && (def.shortcutNum === key || def.shortcutKey === key)) {
          matchedSignalId = sid;
        }
      });

      if (matchedSignalId) {
        e.preventDefault();
        handleTilePress(matchedSignalId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const run = runRef.current;
  const currentRound = run.scenario.rounds[run.currentRoundIndex] || run.scenario.rounds[0];
  const totalRounds = run.scenario.rounds.length;

  const expectedTokens = getExpectedTokensForRound(currentRound);
  const currentExpectedTokenCount = expectedTokens.length;

  // Time remaining calculation for input phase
  let inputTimeProgress = 1;
  if (run.status === "awaiting_input" && run.inputDeadlineAtPerformanceMs && run.phaseStartedAtPerformanceMs) {
    const totalDuration = run.inputDeadlineAtPerformanceMs - run.phaseStartedAtPerformanceMs;
    const remaining = Math.max(0, run.inputDeadlineAtPerformanceMs - performance.now());
    inputTimeProgress = Math.max(0, Math.min(1, remaining / totalDuration));
  }

  // Determine Grid Template Columns
  const gridColsClass =
    config.boardColumns === 2
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <ExclusiveFullscreenOverlay
      ariaLabel="Mật Lệnh Tín Hiệu"
      onEscape={() => setShowExitConfirm(true)}
      className="bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-5 select-none animate-fadeIn overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between border-b border-slate-800/80 pb-3 shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-slate-100">Mật Lệnh Tín Hiệu</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                {config.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Vòng <span className="text-amber-400 font-bold">{run.currentRoundIndex + 1}</span> / {totalRounds}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              soundManager.setEnabled(next);
            }}
            className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
            title="Bật/Tắt âm thanh"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Exit Button */}
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="p-2 bg-slate-900 hover:bg-rose-950/60 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-300 transition-all"
            title="Thoát lượt chơi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="w-full max-w-md mx-auto my-auto flex flex-col items-center gap-4 py-2">
        {/* Status & Protocol Indicator Banner */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col items-center gap-2 shadow-xl text-center relative overflow-hidden">
          {run.status === "countdown" ? (
            <div className="flex flex-col items-center py-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Chuẩn bị mật lệnh</span>
              <span className="text-4xl font-black text-cyan-400 font-mono my-1 animate-pulse">
                {countdownNumberRef.current}
              </span>
            </div>
          ) : run.status === "presenting" ? (
            <div className="flex flex-col items-center w-full gap-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-extrabold text-xs uppercase tracking-widest bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30 animate-pulse">
                <Eye className="w-3.5 h-3.5" />
                <span>Quan sát tín hiệu</span>
              </div>
              <span className="text-xs text-slate-300 font-medium">Ghi nhớ trình tự phát sáng...</span>
            </div>
          ) : run.status === "awaiting_input" ? (
            <div className="flex flex-col items-center w-full gap-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-xs uppercase tracking-widest bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Nhập mật lệnh</span>
              </div>

              {/* Protocol Banner for Hard Mode */}
              {difficulty === "hard" && (
                <div className={`text-[11px] font-black px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
                  currentRound.protocol === "reverse"
                    ? "bg-rose-950/80 text-rose-300 border-rose-500/40"
                    : "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                }`}>
                  <RotateCcw className={`w-3 h-3 ${currentRound.protocol === "reverse" ? "rotate-180" : ""}`} />
                  <span>MẬT LỆNH: {currentRound.protocol === "reverse" ? "NGƯỢC (Đảo Chuỗi)" : "XUÔI"}</span>
                </div>
              )}

              {/* Input Progress Details */}
              <div className="flex items-center justify-between w-full text-[11px] text-slate-400 font-mono px-1">
                <span>
                  Tiến độ: <strong className="text-slate-100">{run.expectedTokenIndex}</strong> / {currentExpectedTokenCount}
                </span>
                {run.pendingPair !== null && (
                  <span className="text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 animate-pulse">
                    Tín hiệu đôi: 1/2
                  </span>
                )}
              </div>

              {/* Input Timer Bar */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-75 ${
                    inputTimeProgress < 0.25 ? "bg-rose-500" : inputTimeProgress < 0.5 ? "bg-amber-400" : "bg-cyan-400"
                  }`}
                  style={{ width: `${inputTimeProgress * 100}%` }}
                />
              </div>
            </div>
          ) : run.status === "recovering" ? (
            <div className="flex flex-col items-center py-2 text-amber-300 gap-1">
              <span className="text-xs font-bold">{run.lastJudgementText?.text}</span>
              <span className="text-[11px] text-slate-400">Đang phát lại vòng...</span>
            </div>
          ) : run.status === "round_success" ? (
            <div className="flex flex-col items-center py-2 text-emerald-400 gap-1">
              <span className="text-xs font-bold">Chính xác! Hoàn thành vòng {run.currentRoundIndex + 1}</span>
            </div>
          ) : null}
        </div>

        {/* Signal Board Grid */}
        <div data-game-surface="true" className={`w-full grid ${gridColsClass} gap-3 sm:gap-4 aspect-square max-w-[340px] mx-auto p-2 bg-slate-950/80 rounded-3xl border border-slate-800 shadow-2xl relative`}>
          {run.scenario.signalIds.map((sid) => {
            const def = SIGNAL_TILE_DEFINITIONS[sid];
            if (!def) return null;

            const isFlashing = activeFlashIdsRef.current.includes(sid);
            const isPressed = pressedTileRef.current === sid;
            const isPendingFirst = run.pendingPair !== null && run.pendingPair.firstSignalId === sid;

            const isHighlighted = isFlashing || isPressed || isPendingFirst;

            return (
              <button
                key={sid}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleTilePress(sid);
                }}
                disabled={run.status !== "awaiting_input"}
                className={`relative rounded-2xl border-2 transition-all duration-100 flex flex-col items-center justify-center p-2 active:scale-95 touch-none ${
                  isHighlighted
                    ? `${def.bgActive} text-slate-950 border-white shadow-xl scale-105 z-10`
                    : `${def.bgNormal} text-slate-200 ${def.borderNormal} hover:border-slate-600`
                }`}
                style={{
                  boxShadow: isHighlighted ? `0 0 25px ${def.glowColor}` : "none",
                }}
              >
                {/* Tile Icon */}
                <SignalIcon id={sid} className="w-9 h-9 sm:w-11 sm:h-11" />

                {/* Tile Short Label */}
                <span className={`text-[10px] font-bold mt-1 ${isHighlighted ? "text-slate-950" : "text-slate-400"}`}>
                  {def.shortName}
                </span>

                {/* Keyboard Hint */}
                <span className="absolute top-1.5 right-2 text-[9px] font-mono text-slate-500 opacity-60 hidden sm:inline">
                  [{def.shortcutNum}]
                </span>
              </button>
            );
          })}
        </div>

        {/* Recovery Badges Indicator */}
        {config.recoveryCharges > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Sửa lỗi còn lại:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: config.recoveryCharges }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full border ${
                    i < run.recoveriesRemaining
                      ? "bg-amber-400 border-amber-300 shadow-sm shadow-amber-400/50"
                      : "bg-slate-800 border-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Tip */}
      <div className="w-full max-w-md mx-auto text-center text-[10px] text-slate-500 border-t border-slate-800/80 pt-2 shrink-0">
        Mật Lệnh Tín Hiệu · local-first 60 FPS
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <ConfirmationDialog status="warning"
          onClose={() => setShowExitConfirm(false)}
          layer="exclusive-dialog"
          layout="viewport-safe"
          labelledBy="signal-command-exit-title"
          panelClassName="text-center"
        >
          <OverlayHeader className="flex flex-col items-center text-center">
            <div className="modal-status-icon">
              <BrainCircuit className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 id="signal-command-exit-title" className="modal-title">Thoát Lượt Chơi?</h3>
            </div>
          </OverlayHeader>

          <OverlayBody>
            <p className="text-center text-xs text-[var(--modal-muted)]">
              Bạn có chắc chắn muốn thoát khỏi lượt chơi Mật Lệnh Tín Hiệu hiện tại không?
            </p>
          </OverlayBody>

          <OverlayFooter>
              <ModalButton variant="ghost"
                type="button"
                onClick={() => setShowExitConfirm(false)}
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
