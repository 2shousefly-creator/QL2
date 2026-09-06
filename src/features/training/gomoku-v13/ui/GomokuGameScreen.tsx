import React, { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Flag, ZoomIn, ZoomOut, Focus, Target, Loader2, Sparkles } from "lucide-react";
import { GameState } from "../../../../game/types";
import {
  BoardPoint,
  GomokuDifficulty,
  GomokuMark,
  GomokuMatchState,
  GomokuResult,
} from "../domain/gomokuTypes";
import { createInitialMatchState, matchReducer } from "../domain/MatchReducer";
import { SparseGomokuBoard } from "../domain/SparseBoard";
import { ViewportController } from "../world/ViewportController";
import { CanvasSurface } from "../render/CanvasSurface";
import { GomokuSceneRenderer } from "../render/GomokuSceneRenderer";
import { RenderScheduler } from "../render/RenderScheduler";
import { selectWinningFive, StoneDrawAnimations, WIN_CELEBRATION_MS, WinCelebration } from "../render/GomokuPresentation";
import { PointerGestureController } from "../input/PointerGestureController";
import { KeyboardController } from "../input/KeyboardController";
import { AiWorkerClient } from "../ai/AiWorkerClient";
import { processGomokuResultReward } from "../integration/gomokuRewardAdapter";
import { recordTrainingRunForMasteryAndMedals } from "../../../../game/medals/medalEngine";
import { GomokuResultModal } from "./GomokuResultModal";
import { soundManager } from "../../../../game/audio";
import { ConfirmationDialog, ExclusiveFullscreenOverlay, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../../components/overlay/AppOverlay";

interface GomokuGameScreenProps {
  gameState: GameState;
  difficulty: GomokuDifficulty;
  playerMark: GomokuMark;
  onUpdateGameState: (updater: (draft: GameState) => void) => void;
  onExit?: () => void;
  onExitRun?: () => void;
}

export const GomokuGameScreen: React.FC<GomokuGameScreenProps> = ({
  gameState,
  difficulty,
  playerMark,
  onUpdateGameState,
  onExit,
  onExitRun,
}) => {
  const handleExitAction = useCallback(() => {
    if (onExit) onExit();
    if (onExitRun) onExitRun();
  }, [onExit, onExitRun]);
  // Match state
  const [matchState, setMatchState] = useState<GomokuMatchState>(() =>
    createInitialMatchState(difficulty, playerMark)
  );

  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [starterText, setStarterText] = useState<string>("");
  const [systemReducedMotion, setSystemReducedMotion] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const reducedMotion = gameState.settings.reducedMotion || systemReducedMotion;
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;
  const stoneAnimationsRef = useRef(new StoneDrawAnimations());
  const celebrationRef = useRef<WinCelebration | null>(null);
  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const committedMatchRef = useRef<string | null>(null);
  const completedAtRef = useRef<number | null>(null);
  const modalOpenRef = useRef(false);
  modalOpenRef.current = showResultModal || showExitConfirm;

  // Canvas & Engine Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const viewportControllerRef = useRef<ViewportController | null>(null);
  const surfaceRef = useRef<CanvasSurface | null>(null);
  const rendererRef = useRef<GomokuSceneRenderer | null>(null);
  const schedulerRef = useRef<RenderScheduler | null>(null);
  const gestureControllerRef = useRef<PointerGestureController | null>(null);
  const keyboardControllerRef = useRef<KeyboardController | null>(null);
  const aiClientRef = useRef<AiWorkerClient>(new AiWorkerClient());
  const pendingAiStartRef = useRef<(() => void) | null>(null);

  const matchStateRef = useRef<GomokuMatchState>(matchState);
  matchStateRef.current = matchState;

  // 1. Render triggering callback
  const requestRender = useCallback(() => {
    if (schedulerRef.current) {
      schedulerRef.current.request();
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => requestRender(), [reducedMotion, requestRender]);

  // 2. Handle Player Move
  const handlePlayerPlace = useCallback((point: BoardPoint) => {
    const current = matchStateRef.current;
    if (current.phase !== "player_turn" || modalOpenRef.current) return;

    soundManager.playClick();
    setMatchState((prev) => matchReducer(prev, { type: "PLAYER_PLACE", point }));
  }, []);

  // 3. Setup Engine & Canvas Surface
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const viewportController = new ViewportController();
    viewportControllerRef.current = viewportController;

    const surface = new CanvasSurface(canvas);
    surfaceRef.current = surface;

    const renderer = new GomokuSceneRenderer(surface);
    rendererRef.current = renderer;

    let frameCount = 0;

    const drawFrame = () => {
      if (!surfaceRef.current || !rendererRef.current || !viewportControllerRef.current) return;
      surfaceRef.current.resize();

      const ms = matchStateRef.current;
      const vp = viewportControllerRef.current.getSnapshot();
      const now = performance.now();
      const stoneDraws = stoneAnimationsRef.current.snapshot(ms.matchId, ms.stones, now, reducedMotionRef.current);
      const celebration = celebrationRef.current;
      const celebrating = celebration?.matchId === ms.matchId && now - celebration.startedAtMs < WIN_CELEBRATION_MS;
      const winningHighlight = celebrating ? {
        points: celebration.points,
        pulse: reducedMotionRef.current ? 0.5 : (1 - Math.cos((now - celebration.startedAtMs) / WIN_CELEBRATION_MS * Math.PI * 4)) / 2,
      } : undefined;

      frameCount++;
      rendererRef.current.render({
        frameId: frameCount,
        surfaceRevision: surfaceRef.current.surfaceRevision,
        cameraRevision: vp.revision,
        cssWidth: surfaceRef.current.cssWidth,
        cssHeight: surfaceRef.current.cssHeight,
        dpr: surfaceRef.current.dpr,
        worldToCss: vp.worldToCss,
        stones: ms.stones,
        lastMove: ms.lastMove,
        cursor: keyboardControllerRef.current?.getCursor() || null,
        winningLine: ms.winningLine,
        stoneDraws,
        winningHighlight,
        phase: ms.phase,
        isAiThinking: ms.phase === "ai_turn",
      });
      // Reuse the coalescing scheduler only while a stroke or pulse is active.
      if (stoneDraws.size > 0 || (celebrating && !reducedMotionRef.current)) {
        schedulerRef.current?.request();
      }
      if (stoneDraws.size === 0 && ms.phase === "ai_turn" && pendingAiStartRef.current) {
        const startAi = pendingAiStartRef.current;
        pendingAiStartRef.current = null;
        startAi();
      }
    };

    const scheduler = new RenderScheduler(drawFrame);
    schedulerRef.current = scheduler;

    const gestureController = new PointerGestureController(
      canvas,
      viewportController,
      handlePlayerPlace,
      requestRender
    );
    gestureControllerRef.current = gestureController;

    const keyboardController = new KeyboardController(
      viewportController,
      handlePlayerPlace,
      () => {},
      () => {
        const board = new SparseGomokuBoard(matchStateRef.current.stones);
        const bounds = board.getBounds();
        viewportController.fitWorldBounds(bounds, surface.cssWidth, surface.cssHeight);
        requestRender();
      },
      () => {
        if (matchStateRef.current.lastMove) {
          viewportController.centerWorldPoint(
            matchStateRef.current.lastMove,
            surface.cssWidth,
            surface.cssHeight
          );
          requestRender();
        }
      },
      requestRender
    );
    keyboardControllerRef.current = keyboardController;

    // Initial positioning: Center on (0,0)
    const rect = container.getBoundingClientRect();
    viewportController.centerWorldPoint({ x: 0, y: 0 }, rect.width, rect.height);
    requestRender();

    const handleResize = () => {
      if (surfaceRef.current && viewportControllerRef.current) {
        const oldW = surfaceRef.current.cssWidth;
        const oldH = surfaceRef.current.cssHeight;
        surfaceRef.current.resize();
        viewportControllerRef.current.resizeViewport(
          oldW,
          oldH,
          surfaceRef.current.cssWidth,
          surfaceRef.current.cssHeight
        );
        requestRender();
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalOpenRef.current || (e.target instanceof HTMLElement && e.target.closest("button, input, textarea, select, [contenteditable=true]"))) return;
      if (keyboardControllerRef.current?.handleKeyDown(e)) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      resizeObserver.disconnect();
      gestureController.detach();
      scheduler.cancel();
      schedulerRef.current = null;
      aiClientRef.current.cancelActiveRequest();
    };
  }, [handlePlayerPlace, requestRender]);

  // Request render when matchState changes
  useEffect(() => {
    requestRender();
  }, [matchState, requestRender]);

  // 4. Starter Reveal Timer
  useEffect(() => {
    if (matchState.phase === "starter_reveal") {
      const isPlayerFirst = matchState.startingActor === "player";
      setStarterText(
        isPlayerFirst
          ? `Lượt Đánh: BẠN Đi Trước (${matchState.playerMark})`
          : `Lượt Đánh: MÁY Đi Trước (${matchState.aiMark})`
      );

      const timer = setTimeout(() => {
        setMatchState((prev) => matchReducer(prev, { type: "FINISH_STARTER_REVEAL" }));
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [matchState.phase, matchState.startingActor, matchState.playerMark, matchState.aiMark]);

  // 5. AI Turn Processing
  useEffect(() => {
    if (matchState.phase === "ai_turn") {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const startAi = () => aiClientRef.current
        .computeMove(
          matchState.matchId,
          matchState.stones,
          matchState.aiMark,
          matchState.playerMark,
          matchState.difficulty,
          requestId
        )
        .then(({ requestId: resReqId, move }) => {
          if (matchStateRef.current.matchId === matchState.matchId && matchStateRef.current.phase === "ai_turn") {
            soundManager.playClick();
            setMatchState((prev) =>
              matchReducer(prev, {
                type: "AI_PLACE",
                point: move,
                requestId: resReqId,
              })
            );
          }
        });
      // Search currently runs on the main thread. Let the player's ink finish
      // before starting that work; the search algorithm and budgets stay intact.
      if (matchState.stones.length > 0) {
        pendingAiStartRef.current = startAi;
        requestRender();
      } else {
        startAi();
      }
      return () => {
        pendingAiStartRef.current = null;
        aiClientRef.current.cancelActiveRequest();
      };
    }
  }, [matchState.phase, matchState.matchId, matchState.stones, matchState.aiMark, matchState.playerMark, matchState.difficulty, requestRender]);

  // 6. Handle Game Finish (Result & Reward)
  useEffect(() => {
    if (
      (matchState.phase === "player_won" ||
        matchState.phase === "ai_won" ||
        matchState.phase === "resigned") &&
      !matchState.resultCommitted && committedMatchRef.current !== matchState.matchId
    ) {
      committedMatchRef.current = matchState.matchId;
      completedAtRef.current = Date.now();
      setMatchState((prev) => ({ ...prev, resultCommitted: true }));

      const isVictory = matchState.phase === "player_won";
      onUpdateGameState((draft) => {
        const claimRes = processGomokuResultReward(
          draft,
          matchState.matchId,
          matchState.difficulty,
          isVictory
        );

        recordTrainingRunForMasteryAndMedals(draft, "gomoku_infinite", matchState.difficulty, isVictory);
        // The host applies this updater asynchronously. Read XP after the claim,
        // outside the host's render, and never carry it into a restarted match.
        const creditedXp = claimRes.status === "claimed" ? claimRes.nominalRewardXp : 0;
        queueMicrotask(() => {
          if (schedulerRef.current && matchStateRef.current.matchId === matchState.matchId) {
            setEarnedXp(creditedXp);
          }
        });
      });

      if (isVictory) {
        soundManager.playPromotionFanfare();
      }
    }
  }, [matchState.phase, matchState.resultCommitted, matchState.matchId, matchState.difficulty, onUpdateGameState]);

  // Reward persistence above happens immediately. Only the result presentation waits.
  useEffect(() => {
    const { phase, matchId, winningLine, lastMove } = matchStateRef.current;
    if (phase === "resigned") {
      celebrationRef.current = null;
      setShowExitConfirm(false);
      setShowResultModal(true);
      return;
    }
    if (phase !== "player_won" && phase !== "ai_won") return;

    setShowExitConfirm(false);
    setShowResultModal(false);
    if (celebrationRef.current?.matchId !== matchId) {
      celebrationRef.current = {
        matchId,
        startedAtMs: performance.now(),
        points: selectWinningFive(winningLine, lastMove),
      };
    }
    const celebration = celebrationRef.current;
    requestRender();
    const timer = setTimeout(() => {
      if (matchStateRef.current.matchId !== matchId || celebrationRef.current !== celebration) return;
      celebrationRef.current = null;
      celebrationTimerRef.current = null;
      setShowResultModal(true);
      requestRender();
    }, Math.max(0, WIN_CELEBRATION_MS - (performance.now() - celebration.startedAtMs)));
    celebrationTimerRef.current = timer;
    return () => {
      clearTimeout(timer);
      if (celebrationTimerRef.current === timer) celebrationTimerRef.current = null;
    };
  }, [matchState.phase, matchState.matchId, requestRender]);

  // Camera toolbar helpers
  const handleZoomIn = () => {
    if (viewportControllerRef.current && surfaceRef.current) {
      viewportControllerRef.current.zoomAtCss(
        surfaceRef.current.cssWidth / 2,
        surfaceRef.current.cssHeight / 2,
        1.25
      );
      requestRender();
    }
  };

  const handleZoomOut = () => {
    if (viewportControllerRef.current && surfaceRef.current) {
      viewportControllerRef.current.zoomAtCss(
        surfaceRef.current.cssWidth / 2,
        surfaceRef.current.cssHeight / 2,
        1 / 1.25
      );
      requestRender();
    }
  };

  const handleCenter = () => {
    if (viewportControllerRef.current && surfaceRef.current) {
      const board = new SparseGomokuBoard(matchState.stones);
      const bounds = board.getBounds();
      viewportControllerRef.current.fitWorldBounds(
        bounds,
        surfaceRef.current.cssWidth,
        surfaceRef.current.cssHeight
      );
      requestRender();
    }
  };

  const handleLatestMove = () => {
    if (matchState.lastMove && viewportControllerRef.current && surfaceRef.current) {
      viewportControllerRef.current.centerWorldPoint(
        matchState.lastMove,
        surfaceRef.current.cssWidth,
        surfaceRef.current.cssHeight
      );
      requestRender();
    }
  };

  const handleResign = () => {
    soundManager.playClick();
    setMatchState((prev) => matchReducer(prev, { type: "RESIGN" }));
  };

  const handleRestart = () => {
    if (celebrationTimerRef.current !== null) clearTimeout(celebrationTimerRef.current);
    celebrationTimerRef.current = null;
    celebrationRef.current = null;
    completedAtRef.current = null;
    aiClientRef.current.cancelActiveRequest();
    schedulerRef.current?.cancel();
    const nextMatch = createInitialMatchState(difficulty, playerMark);
    matchStateRef.current = nextMatch;
    setMatchState(nextMatch);
    setEarnedXp(0);
    setShowExitConfirm(false);
    setShowResultModal(false);
  };

  const isCelebrating = (matchState.phase === "player_won" || matchState.phase === "ai_won") && !showResultModal;
  const handleRequestExit = () => {
    if (!isCelebrating) setShowExitConfirm(true);
  };

  const currentResult: GomokuResult = {
    matchId: matchState.matchId,
    gameId: "gomoku_infinite",
    difficulty: matchState.difficulty,
    outcome:
      matchState.phase === "player_won"
        ? "player_win"
        : matchState.phase === "ai_won"
        ? "ai_win"
        : "resigned",
    playerMark: matchState.playerMark,
    aiMark: matchState.aiMark,
    startingActor: matchState.startingActor,
    totalMoves: matchState.stones.length,
    playerMoves: matchState.stones.filter((s) => s.actor === "player").length,
    aiMoves: matchState.stones.filter((s) => s.actor === "ai").length,
    winningLine: matchState.winningLine,
    completedAtEpochMs: completedAtRef.current ?? Date.now(),
    activeDurationMs: (completedAtRef.current ?? Date.now()) - matchState.startedAtEpochMs,
  };

  return (
    <ExclusiveFullscreenOverlay
      ariaLabel="Cờ Caro V13"
      onEscape={handleRequestExit}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      className="gomoku-paper-screen bg-[#f5efdf] flex flex-col select-none touch-none overflow-hidden"
    >
      {/* Top Header HUD */}
      <div className="shrink-0 w-full flex items-center justify-between gap-2 p-2 sm:p-3 bg-[#faf5e9] border-b border-[#d8cbb3] z-30">
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            handleRequestExit();
          }}
          disabled={isCelebrating}
          aria-label="Thoát ván cờ"
          className="shrink-0 p-2 rounded-xl bg-[#eee4d1] text-[#574c3c] hover:text-[#2f2922] disabled:opacity-40"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Turn Status Badge */}
        <div className="min-w-0 flex-1 flex flex-wrap justify-center items-center gap-1.5" aria-live="polite">
          {matchState.phase === "starter_reveal" ? (
            <span className="text-xs font-bold text-[#946b22] bg-[#ebd8a9]/40 border border-[#c7a45f]/40 px-2 sm:px-3 py-1 rounded-full text-center motion-safe:animate-pulse">
              {starterText}
            </span>
          ) : matchState.phase === "ai_turn" ? (
            <span className="text-xs font-bold text-[#b33e3e] bg-[#c94a4a]/10 border border-[#c94a4a]/25 px-2 sm:px-3 py-1 rounded-full text-center flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 motion-safe:animate-spin" /> Máy Đang Tính...
            </span>
          ) : matchState.phase === "player_turn" ? (
            <span className="text-xs font-bold text-[#245aa8] bg-[#245aa8]/10 border border-[#245aa8]/25 px-2 sm:px-3 py-1 rounded-full text-center">
              Lượt Bạn ({matchState.playerMark})
            </span>
          ) : (
            <span className="text-xs font-bold text-[#574c3c] bg-[#eee4d1] px-2 sm:px-3 py-1 rounded-full text-center">
              {isCelebrating ? "Chuỗi 5 quân chiến thắng" : "Trận Đấu Kết Thúc"}
            </span>
          )}

          <span className="text-[11px] font-mono text-[#746653] bg-[#f5efdf] px-2.5 py-1 rounded-full border border-[#d8cbb3]">
            Nước: {matchState.stones.length}
          </span>
        </div>

        <button
          type="button"
          onClick={handleResign}
          disabled={matchState.phase === "player_won" || matchState.phase === "ai_won" || matchState.phase === "resigned"}
          className="p-2 rounded-xl bg-[#c94a4a]/10 border border-[#c94a4a]/25 text-[#b33e3e] hover:bg-[#c94a4a]/15 disabled:opacity-40"
          title="Đầu hàng"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive Canvas Area */}
      <div ref={containerRef} className="relative flex-1 w-full min-h-0 bg-[#f5efdf] overflow-hidden shadow-inner shadow-[#806744]/10">
        <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" aria-label="Bàn cờ Caro: chạm ô trống để đặt quân, kéo để di chuyển" />

        {/* Floating Camera Controls */}
        <div className="absolute bottom-3 right-2 sm:bottom-6 sm:right-4 z-30 flex flex-col gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2.5 sm:p-3 rounded-2xl bg-[#fffaf0]/95 border border-[#d8cbb3] text-[#494033] shadow-md shadow-[#806744]/10 hover:bg-[#eee4d1] active:scale-95 transition-all"
            title="Phóng to"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2.5 sm:p-3 rounded-2xl bg-[#fffaf0]/95 border border-[#d8cbb3] text-[#494033] shadow-md shadow-[#806744]/10 hover:bg-[#eee4d1] active:scale-95 transition-all"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleCenter}
            className="p-2.5 sm:p-3 rounded-2xl bg-[#fffaf0]/95 border border-[#d8cbb3] text-[#946b22] shadow-md shadow-[#806744]/10 hover:bg-[#eee4d1] active:scale-95 transition-all"
            title="Về trung tâm bàn cờ"
          >
            <Focus className="w-5 h-5" />
          </button>
          {matchState.lastMove && (
            <button
              type="button"
              onClick={handleLatestMove}
              className="p-2.5 sm:p-3 rounded-2xl bg-[#fffaf0]/95 border border-[#d8cbb3] text-[#245aa8] shadow-md shadow-[#806744]/10 hover:bg-[#eee4d1] active:scale-95 transition-all"
              title="Tới nước mới nhất"
            >
              <Target className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {showResultModal && (
        <GomokuResultModal
          result={currentResult}
          earnedXp={earnedXp}
          reducedMotion={reducedMotion}
          onRestart={handleRestart}
          onExit={handleExitAction}
        />
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <ConfirmationDialog status="warning" theme="paper"
          onClose={() => setShowExitConfirm(false)}
          layer="exclusive-dialog"
          layout="viewport-safe"
          labelledBy="gomoku-exit-title"
          panelClassName="text-center"
        >
          <OverlayHeader className="flex flex-col items-center text-center">
            <div className="modal-status-icon">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 id="gomoku-exit-title" className="modal-title">Thoát Lượt Chơi?</h3>
          </OverlayHeader>

          <OverlayBody>
            <p className="text-center text-xs text-[var(--modal-muted)]">
              Bạn có chắc chắn muốn thoát khỏi ván cờ Gomoku hiện tại không?
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
                onClick={handleExitAction}
              >
                Xác Nhận Thoát
              </ModalButton>
          </OverlayFooter>
        </ConfirmationDialog>
      )}
    </ExclusiveFullscreenOverlay>
  );
};
