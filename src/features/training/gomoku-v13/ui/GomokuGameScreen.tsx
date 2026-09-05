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
import { PointerGestureController } from "../input/PointerGestureController";
import { KeyboardController } from "../input/KeyboardController";
import { AiWorkerClient } from "../ai/AiWorkerClient";
import { processGomokuResultReward } from "../integration/gomokuRewardAdapter";
import { recordTrainingRunForMasteryAndMedals } from "../../../../game/medals/medalEngine";
import { GomokuResultModal } from "./GomokuResultModal";
import { soundManager } from "../../../../game/audio";
import { AppModal, ExclusiveFullscreenOverlay, OverlayBody, OverlayFooter, OverlayHeader } from "../../../../components/overlay/AppOverlay";

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

  const matchStateRef = useRef<GomokuMatchState>(matchState);
  matchStateRef.current = matchState;

  // 1. Render triggering callback
  const requestRender = useCallback(() => {
    if (schedulerRef.current) {
      schedulerRef.current.request();
    }
  }, []);

  // 2. Handle Player Move
  const handlePlayerPlace = useCallback((point: BoardPoint) => {
    const current = matchStateRef.current;
    if (current.phase !== "player_turn") return;

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
        phase: ms.phase,
        isAiThinking: ms.phase === "ai_turn",
      });
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

      aiClientRef.current
        .computeMove(
          matchState.matchId,
          matchState.stones,
          matchState.aiMark,
          matchState.playerMark,
          matchState.difficulty,
          requestId
        )
        .then(({ requestId: resReqId, move }) => {
          if (matchStateRef.current.phase === "ai_turn") {
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
    }
  }, [matchState.phase, matchState.matchId, matchState.stones, matchState.aiMark, matchState.playerMark, matchState.difficulty]);

  // 6. Handle Game Finish (Result & Reward)
  useEffect(() => {
    if (
      (matchState.phase === "player_won" ||
        matchState.phase === "ai_won" ||
        matchState.phase === "resigned") &&
      !matchState.resultCommitted
    ) {
      setMatchState((prev) => ({ ...prev, resultCommitted: true }));

      const isVictory = matchState.phase === "player_won";
      let rewardCreditedXp = 0;

      onUpdateGameState((draft) => {
        const claimRes = processGomokuResultReward(
          draft,
          matchState.matchId,
          matchState.difficulty,
          isVictory
        );

        if (claimRes.status === "claimed") {
          rewardCreditedXp = claimRes.nominalRewardXp;
        }

        recordTrainingRunForMasteryAndMedals(draft, "gomoku_infinite", matchState.difficulty, isVictory);
      });

      if (isVictory) {
        soundManager.playPromotionFanfare();
      }

      setEarnedXp(rewardCreditedXp);
      setShowResultModal(true);
    }
  }, [matchState.phase, matchState.resultCommitted, matchState.matchId, matchState.difficulty, onUpdateGameState]);

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
    setMatchState(createInitialMatchState(difficulty, playerMark));
    setShowResultModal(false);
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
    completedAtEpochMs: Date.now(),
    activeDurationMs: Date.now() - matchState.startedAtEpochMs,
  };

  return (
    <ExclusiveFullscreenOverlay
      ariaLabel="Cờ Caro V13"
      onEscape={() => setShowExitConfirm(true)}
      className="bg-slate-950 flex flex-col select-none touch-none overflow-hidden"
    >
      {/* Top Header HUD */}
      <div className="shrink-0 w-full flex items-center justify-between p-2.5 sm:p-3 bg-slate-900 border-b border-slate-800 z-30">
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            setShowExitConfirm(true);
          }}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Turn Status Badge */}
        <div className="flex items-center gap-2">
          {matchState.phase === "starter_reveal" ? (
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full animate-pulse">
              {starterText}
            </span>
          ) : matchState.phase === "ai_turn" ? (
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Máy Đang Tính...
            </span>
          ) : matchState.phase === "player_turn" ? (
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
              Lượt Bạn ({matchState.playerMark})
            </span>
          ) : (
            <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full">
              Trận Đấu Kết Thúc
            </span>
          )}

          <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
            Nước: {matchState.stones.length}
          </span>
        </div>

        <button
          type="button"
          onClick={handleResign}
          disabled={matchState.phase === "player_won" || matchState.phase === "ai_won" || matchState.phase === "resigned"}
          className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 disabled:opacity-40"
          title="Đầu hàng"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive Canvas Area */}
      <div ref={containerRef} className="relative flex-1 w-full min-h-0 bg-slate-950 overflow-hidden">
        <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />

        {/* Floating Camera Controls */}
        <div className="absolute bottom-6 right-4 z-30 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
            title="Phóng to"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleCenter}
            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-amber-400 shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
            title="Về trung tâm bàn cờ"
          >
            <Focus className="w-5 h-5" />
          </button>
          {matchState.lastMove && (
            <button
              type="button"
              onClick={handleLatestMove}
              className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-cyan-400 shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
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
          onRestart={handleRestart}
          onExit={handleExitAction}
        />
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <AppModal
          onClose={() => setShowExitConfirm(false)}
          layer="exclusive-dialog"
          layout="viewport-safe"
          labelledBy="gomoku-exit-title"
          panelClassName="max-w-sm border-slate-800 bg-slate-900 text-center text-slate-100"
        >
          <OverlayHeader className="flex flex-col items-center gap-3 border-slate-800 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 id="gomoku-exit-title" className="text-base font-black text-slate-100">Thoát Lượt Chơi?</h3>
          </OverlayHeader>

          <OverlayBody>
            <p className="text-center text-xs text-slate-400">
              Bạn có chắc chắn muốn thoát khỏi ván cờ Gomoku hiện tại không?
            </p>
          </OverlayBody>

          <OverlayFooter className="grid grid-cols-2 gap-2 border-slate-800 bg-slate-900">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Tiếp Tục Chơi
              </button>
              <button
                type="button"
                onClick={handleExitAction}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                Xác Nhận Thoát
              </button>
          </OverlayFooter>
        </AppModal>
      )}
    </ExclusiveFullscreenOverlay>
  );
};
