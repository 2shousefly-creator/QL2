import React, { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle, CheckCircle, Clock, Inbox, Lock, RotateCw, ShieldCheck, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { GameState, TrainingDifficulty } from "../../../game/types";
import { FormationCell, FormationResult, FormationRun } from "../../../game/training/formationAssembly/formationTypes";
import { FORMATION_CONFIGS } from "../../../game/training/formationAssembly/formationConfig";
import {
  applyFormationRecoveryOrFail,
  calculateFormationResult,
  createFormationRun,
  createInitialFormationBoard,
  evaluateFormation,
  placeFormationPiece,
  rotateFormationPiece,
  selectFormationPiece,
} from "../../../game/training/formationAssembly/formationEngine";
import {
  getProtocolLabel,
  transformRoundTargets,
} from "../../../game/training/formationAssembly/formationTransforms";
import { FormationPieceView } from "./FormationPieceView";
import { soundManager } from "../../../game/audio";
import { ConfirmationDialog, ExclusiveFullscreenOverlay, GameResultModal, ModalActions, ModalButton, OverlayBody, OverlayFooter, OverlayHeader, ResultHero } from "../../../components/overlay/AppOverlay";

type FormationAssemblyGameProps = {
  gameState: GameState;
  difficulty: TrainingDifficulty;
  onFinishRun: (run: FormationRun, result: FormationResult) => void;
  onExitRun: () => void;
};

export const FormationAssemblyGame: React.FC<FormationAssemblyGameProps> = ({
  gameState,
  difficulty,
  onFinishRun,
  onExitRun,
}) => {
  const [run, setRun] = useState<FormationRun>(() => createFormationRun(difficulty));
  const [soundOn, setSoundOn] = useState<boolean>(gameState.settings.soundEnabled);
  const [countdownSec, setCountdownSec] = useState<number>(3);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [dragOverCellKey, setDragOverCellKey] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [evalFeedback, setEvalFeedback] = useState<{
    show: boolean;
    correct: boolean;
    scorePct: number;
    onProceed: () => void;
  } | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const currentConfig = FORMATION_CONFIGS[difficulty];
  const currentRound = run.scenario.rounds[run.currentRoundIndex];
  const { transformedPlacements, transformedLockedCells } = transformRoundTargets(currentRound);

  // Sound sync
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundManager.setEnabled(next);
  };

  // 1. Initial Countdown 3..2..1
  useEffect(() => {
    if (run.status !== "countdown") return;

    setCountdownSec(3);
    const interval = setInterval(() => {
      setCountdownSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRun((draft) => {
            const next = { ...draft };
            next.status = "previewing";
            next.phaseStartedAtPerformanceMs = performance.now();
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [run.status, run.currentRoundIndex]);

  // 2. Main game clock loop for Previewing & Assembling phases
  useEffect(() => {
    if (run.status !== "previewing" && run.status !== "assembling" && run.status !== "recovering") {
      return;
    }

    const tick = () => {
      const now = performance.now();
      const elapsed = now - (run.phaseStartedAtPerformanceMs || now);

      if (run.status === "previewing") {
        const totalMs = currentRound.previewMs;
        const left = Math.max(0, totalMs - elapsed);
        setRemainingMs(left);

        if (left <= 0) {
          // Transition from preview to assembling
          setRun((draft) => {
            const next = { ...draft };
            next.status = "assembling";
            next.phaseStartedAtPerformanceMs = performance.now();
            return next;
          });
        }
      } else if (run.status === "recovering") {
        const totalMs = Math.round(currentRound.previewMs * 0.5);
        const left = Math.max(0, totalMs - elapsed);
        setRemainingMs(left);

        if (left <= 0) {
          setRun((draft) => {
            const next = { ...draft };
            next.status = "assembling";
            next.phaseStartedAtPerformanceMs = performance.now();
            next.recoveryNotice = null;
            return next;
          });
        }
      } else if (run.status === "assembling") {
        const totalMs = currentRound.assembleMs;
        const left = Math.max(0, totalMs - elapsed);
        setRemainingMs(left);

        if (left <= 0) {
          // Assembling timeout!
          handleConfirmOrTimeout(true);
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [run.status, run.phaseStartedAtPerformanceMs, run.currentRoundIndex]);

  // Handle visibility change interrupt
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && run.status === "assembling") {
        setRun((draft) => {
          const next = { ...draft };
          next.status = "interrupted";
          next.resetReason = "App rời màn hình giữa trận";
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [run.status]);

  // Confirmation or Timeout handler
  const handleConfirmOrTimeout = useCallback(
    (isTimeout: boolean = false) => {
      const evalRes = evaluateFormation(run.boardState, currentRound);

      const proceedFn = () => {
        setEvalFeedback(null);
        if (evalRes.correct) {
          const nextCompletedRounds = run.completedRounds + 1;
          const isFinalRound = nextCompletedRounds === currentConfig.roundCount;

          if (isFinalRound) {
            const updatedRun: FormationRun = {
              ...run,
              status: "won",
              completedRounds: nextCompletedRounds,
              completedAtPerformanceMs: performance.now(),
            };
            const res = calculateFormationResult(updatedRun);
            onFinishRun(updatedRun, res);
          } else {
            // Advance to next round
            const nextRoundIndex = run.currentRoundIndex + 1;
            const nextRoundDef = run.scenario.rounds[nextRoundIndex];
            const nextBoard = createInitialFormationBoard(nextRoundDef, difficulty, run.seed);

            setRun({
              ...run,
              status: "countdown",
              currentRoundIndex: nextRoundIndex,
              completedRounds: nextCompletedRounds,
              boardState: nextBoard,
              selectedPieceId: null,
              phaseStartedAtPerformanceMs: performance.now(),
            });
          }
        } else {
          const updatedRun = { ...run };
          const { isFailed } = applyFormationRecoveryOrFail(
            updatedRun,
            evalRes,
            performance.now()
          );

          if (isFailed) {
            const res = calculateFormationResult(updatedRun);
            onFinishRun(updatedRun, res);
          } else {
            updatedRun.phaseStartedAtPerformanceMs = performance.now();
            setRun(updatedRun);
          }
        }
      };

      if (evalRes.correct) {
        soundManager.playFormationSuccess();
        soundManager.triggerHaptic("medium");
      } else {
        soundManager.playSignalError();
        soundManager.triggerHaptic("heavy");
      }

      const totalExpected = currentRound.piecesToPlace.length;
      const scorePct = totalExpected > 0 ? Math.round((evalRes.correctPlacements / totalExpected) * 100) : 0;

      setEvalFeedback({
        show: true,
        correct: evalRes.correct,
        scorePct,
        onProceed: proceedFn,
      });
    },
    [run, currentRound, currentConfig, difficulty, onFinishRun]
  );

  // Interaction handlers
  const handlePieceClick = (pieceId: string) => {
    soundManager.playPiecePick();
    soundManager.triggerHaptic("light");
    setRun((draft) => {
      const next = { ...draft };
      selectFormationPiece(next, pieceId);
      return next;
    });
  };

  const handleCellClick = (cell: FormationCell) => {
    if (!run.selectedPieceId) return;

    soundManager.playPiecePlace();
    soundManager.triggerHaptic("light");
    setRun((draft) => {
      const next = { ...draft };
      placeFormationPiece(next, draft.selectedPieceId!, cell, false);
      return next;
    });
  };

  const handleRotatePiece = (pieceId: string) => {
    soundManager.playPieceRotate();
    soundManager.triggerHaptic("light");
    setRun((draft) => {
      const next = { ...draft };
      rotateFormationPiece(next, pieceId);
      return next;
    });
  };

  const handleReturnToTray = (pieceId: string) => {
    soundManager.playPiecePlace();
    soundManager.triggerHaptic("light");
    setRun((draft) => {
      const next = { ...draft };
      placeFormationPiece(next, pieceId, null, false);
      return next;
    });
  };

  // Pieces in reserve tray
  const trayPieces = currentRound.pieces.filter((p) => {
    const pl = run.boardState.placements[p.id];
    return !pl || pl.cell === null;
  });

  // Calculate cell dimensions
  const rows = currentRound.rows;
  const cols = currentRound.columns;

  const lockedCellSet = new Set(transformedLockedCells.map((c) => `${c.row},${c.column}`));

  const formatSecLeft = (ms: number) => (ms / 1000).toFixed(1);

  return (
    <ExclusiveFullscreenOverlay
      ariaLabel="Xếp Đội Hình"
      onEscape={() => setShowExitConfirm(true)}
      className="bg-slate-950 flex flex-col justify-between overflow-hidden animate-fadeIn select-none"
    >
      {/* Top HUD Bar */}
      <div className="p-2.5 sm:p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 w-full z-30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Thoát trận"
          >
            <X className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-extrabold text-sm text-slate-100">Xếp Đội Hình</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {currentConfig.label}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Vòng {run.currentRoundIndex + 1} / {currentConfig.roundCount}
            </p>
          </div>
        </div>

        {/* Center Timer Display */}
        <div className="flex items-center gap-2">
          {run.status === "assembling" && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-amber-500/30 text-amber-400 font-extrabold text-xs">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{formatSecLeft(remainingMs)}s</span>
            </div>
          )}

          {(run.status === "previewing" || run.status === "recovering") && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Mẫu: {formatSecLeft(remainingMs)}s</span>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {currentConfig.recoveryCharges > 0 && (
            <div
              className="flex items-center gap-1 text-[11px] font-extrabold px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
              title="Lượt sửa còn lại"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{run.recoveriesRemaining}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Protocol Banner (Hard Mode) */}
      {difficulty === "hard" && (
        <div className="bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-900/60 border-b border-purple-500/30 px-3 py-1.5 text-center text-xs font-black text-amber-300 tracking-wide flex items-center justify-center gap-2 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{getProtocolLabel(currentRound.protocol)}</span>
        </div>
      )}

      {/* Main Grid Viewport */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden">
        {/* Countdown overlay */}
        {run.status === "countdown" && (
          <div className="absolute inset-0 z-30 bg-slate-950/90 flex flex-col items-center justify-center gap-3 animate-fadeIn">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Sẵn Sàng Quan Sát Vòng {run.currentRoundIndex + 1}
            </span>
            <span className="text-6xl font-black text-amber-400 animate-ping">
              {countdownSec > 0 ? countdownSec : "BẮT ĐẦU!"}
            </span>
          </div>
        )}

        {/* Recovery Toast Notice */}
        {run.recoveryNotice && (
          <div className="absolute top-4 z-40 bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs font-extrabold px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md animate-bounce flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{run.recoveryNotice}</span>
          </div>
        )}

        {/* Phase Banners */}
        {(run.status === "previewing" || run.status === "recovering") && (
          <div className="mb-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-extrabold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Ghi nhớ vị trí & hướng của đội hình mẫu</span>
          </div>
        )}

        {run.status === "assembling" && (
          <div className="mb-2 text-xs font-bold text-slate-400 flex items-center gap-2">
            <span>Đặt các quân cờ từ khay vào đúng vị trí</span>
          </div>
        )}

        {/* Dynamic Grid Container */}
        <div
          style={{
            display: "grid",
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
          data-game-surface="true" className="w-full max-w-[340px] aspect-square bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-2 gap-2 shadow-2xl relative"
        >
          {Array.from({ length: rows }).flatMap((_, rIdx) =>
            Array.from({ length: cols }).map((__, cIdx) => {
              const cellKey = `${rIdx},${cIdx}`;
              const isLocked = lockedCellSet.has(cellKey);

              // Find target piece placement for Preview phase
              const targetPlacement = transformedPlacements.find(
                (p) => p.cell.row === rIdx && p.cell.column === cIdx
              );
              const targetPieceDef = targetPlacement
                ? currentRound.pieces.find((p) => p.id === targetPlacement.pieceId)
                : null;

              // Find active player placement for Assembling phase
              const activePieceId = Object.keys(run.boardState.placements).find((id) => {
                const p = run.boardState.placements[id];
                return p.cell && p.cell.row === rIdx && p.cell.column === cIdx;
              });
              const activePieceState = activePieceId ? run.boardState.placements[activePieceId] : null;
              const activePieceDef = activePieceId ? currentRound.pieces.find((p) => p.id === activePieceId) : null;

              const isSelected = activePieceId === run.selectedPieceId;

              return (
                <div
                  key={cellKey}
                  onClick={() => {
                    if (run.status === "assembling") {
                      if (activePieceId && !run.selectedPieceId) {
                        handlePieceClick(activePieceId);
                      } else {
                        handleCellClick({ row: rIdx, column: cIdx });
                      }
                    }
                  }}
                  className={`relative rounded-2xl border transition-all flex items-center justify-center cursor-pointer ${
                    isLocked
                      ? "bg-slate-950 border-slate-800/80 cursor-not-allowed opacity-60"
                      : isSelected
                      ? "bg-purple-950/80 border-purple-500 ring-2 ring-purple-500/40"
                      : activePieceDef
                      ? "bg-slate-800/80 border-slate-700 hover:border-purple-400"
                      : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  {/* Locked Cell Icon */}
                  {isLocked && (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}

                  {/* Preview & Recovering Phase Pattern Rendering */}
                  {(run.status === "previewing" || run.status === "recovering") && targetPlacement && targetPieceDef && (
                    <FormationPieceView
                      shapeId={targetPieceDef.shapeId}
                      orientation={targetPlacement.orientation}
                      isOrientable={targetPieceDef.orientable}
                      sizePx={Math.min(52, Math.floor(300 / cols) - 12)}
                    />
                  )}

                  {/* Assembling Phase Active Piece Rendering */}
                  {run.status === "assembling" && activePieceDef && activePieceState && (
                    <FormationPieceView
                      shapeId={activePieceDef.shapeId}
                      orientation={activePieceState.orientation}
                      isOrientable={activePieceDef.orientable}
                      isSelected={isSelected}
                      isDecoy={activePieceDef.isDecoy}
                      sizePx={Math.min(52, Math.floor(300 / cols) - 12)}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Selected Piece Action Controls */}
        {run.status === "assembling" && run.selectedPieceId && (
          <div className="mt-3 flex items-center justify-center gap-2 animate-fadeIn">
            {currentRound.pieces.find((p) => p.id === run.selectedPieceId)?.orientable && (
              <button
                type="button"
                onClick={() => handleRotatePiece(run.selectedPieceId!)}
                className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Xoay 90°</span>
              </button>
            )}

            {run.boardState.placements[run.selectedPieceId]?.cell !== null && (
              <button
                type="button"
                onClick={() => handleReturnToTray(run.selectedPieceId!)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5"
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Về Khay Dự Bị</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Reserve Tray & Action Bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-col gap-2.5 shrink-0">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
          <div className="flex items-center gap-1.5">
            <Inbox className="w-4 h-4 text-purple-400" />
            <span>Khay Dự Bị ({trayPieces.length} quân)</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {currentConfig.decoyPieceCounts[run.currentRoundIndex] > 0
              ? "Giữ quân mồi ở khay này"
              : "Chọn quân để đặt"}
          </span>
        </div>

        {/* Tray Pieces Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 min-h-[60px] px-1 no-scrollbar">
          {trayPieces.length === 0 ? (
            <span className="text-xs text-slate-400 italic mx-auto">Tất cả quân cờ đã lên lưới</span>
          ) : (
            trayPieces.map((p) => {
              const pState = run.boardState.placements[p.id];
              const isSelected = p.id === run.selectedPieceId;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePieceClick(p.id)}
                  className={`p-1.5 rounded-2xl border shrink-0 transition-all ${
                    isSelected
                      ? "bg-purple-950/80 border-purple-500 ring-2 ring-purple-500/40"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <FormationPieceView
                    shapeId={p.shapeId}
                    orientation={pState?.orientation || 0}
                    isOrientable={p.orientable}
                    isSelected={isSelected}
                    sizePx={40}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          disabled={run.status !== "assembling"}
          onClick={() => handleConfirmOrTimeout(false)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <CheckCircle className="w-4 h-4" />
          <span>XÁC NHẬN ĐỘI HÌNH</span>
        </button>
      </div>

      {/* Confirmation Feedback Modal */}
      {evalFeedback?.show && (
        <GameResultModal status={evalFeedback.correct ? "success" : "danger"}
          layer="exclusive-dialog"
          layout="viewport-safe"
          closeOnEscape={false}
          labelledBy="formation-feedback-title"
          panelClassName="text-center"
        >
          <ResultHero className="flex flex-col items-center text-center">
            <div
              className="modal-status-icon"
            >
              {evalFeedback.correct ? (
                <CheckCircle className="w-10 h-10" />
              ) : (
                <AlertTriangle className="w-10 h-10" />
              )}
            </div>

            <div className="space-y-1">
              <h3 id="formation-feedback-title" className="modal-title">
                {evalFeedback.correct ? "CHÍNH XÁC!" : "CHƯA CHÍNH XÁC!"}
              </h3>
            </div>
          </ResultHero>

          <OverlayBody>
            <p className="text-center text-xs text-[var(--modal-text)]">
              {evalFeedback.correct
                ? "Đội hình đã ghép hoàn toàn đúng vị trí và hướng quân!"
                : `Đội hình chưa đúng hoàn toàn vị trí hoặc hướng xoay (${evalFeedback.scorePct}% chính xác).`}
            </p>
          </OverlayBody>

          <ModalActions>
            <ModalButton variant="primary"
              type="button"
              onClick={evalFeedback.onProceed}
              className="w-full"
            >
              Tiếp Tục
            </ModalButton>
          </ModalActions>
        </GameResultModal>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <ConfirmationDialog status="warning"
          onClose={() => setShowExitConfirm(false)}
          layer="exclusive-dialog"
          layout="viewport-safe"
          labelledBy="formation-exit-title"
          panelClassName="text-center"
        >
          <OverlayHeader className="flex flex-col items-center text-center">
            <div className="modal-status-icon">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 id="formation-exit-title" className="modal-title">Thoát Lượt Chơi?</h3>
          </OverlayHeader>

          <OverlayBody>
            <p className="text-center text-xs text-[var(--modal-muted)]">
              Bạn có chắc chắn muốn thoát khỏi lượt chơi Xếp Đội Hình hiện tại không?
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
