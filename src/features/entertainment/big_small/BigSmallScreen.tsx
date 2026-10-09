import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Coins,
  BookOpen,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Sprout,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  BigSmallBetId,
  BigSmallBets,
  BigSmallRound,
} from "../types";
import {
  BIG_SMALL_DOOR_INFO,
  calculateAvailableGold,
  calculateTotalBigSmallBets,
  createEmptyBigSmallBets,
  isBetWon,
  settleBigSmallRound,
} from "./bigSmallEngine";
import { DiceFace } from "./DiceFace";
import { BigSmallBetModal } from "./BigSmallBetModal";
import { BigSmallResultModal } from "./BigSmallResultModal";
import { BigSmallRulesModal } from "./BigSmallRulesModal";
import { soundManager } from "../../../game/audio";
import { GameState, TabType } from "../../../game/types";
import { createDefaultFarmState } from "../../tang_gia/farmEngine";

interface BigSmallScreenProps {
  gameState?: GameState;
  onUpdateGameState?: (
    updater: ((draft: GameState) => void) | GameState
  ) => void;
  currentGold?: number;
  onUpdateGold?: (newGold: number) => void;
  onBackToHub: () => void;
  onNavigateTab: (tab: TabType) => void;
}

type RoundPhase = "idle" | "shaking" | "ready_to_open" | "revealing";

export const BigSmallScreen: React.FC<BigSmallScreenProps> = ({
  gameState,
  onUpdateGameState,
  currentGold: propGold,
  onUpdateGold,
  onBackToHub,
  onNavigateTab,
}) => {
  const currentGold =
    propGold !== undefined
      ? propGold
      : gameState?.farm?.gold ?? 0;

  const [bets, setBets] = useState<BigSmallBets>(createEmptyBigSmallBets());
  const [previousRoundBets, setPreviousRoundBets] = useState<BigSmallBets>(
    createEmptyBigSmallBets,
  );
  const [roundPhase, setRoundPhase] = useState<RoundPhase>("idle");
  const [roundId, setRoundId] = useState<number>(() => Date.now());
  const [lastRound, setLastRound] = useState<BigSmallRound | null>(null);
  const [winningHighlightDoor, setWinningHighlightDoor] = useState<BigSmallBetId | null>(null);
  const [pendingSettlement, setPendingSettlement] = useState<{
    round: BigSmallRound;
    postRoundGold: number;
  } | null>(null);
  const [revealedDiceCount, setRevealedDiceCount] = useState<number>(3);

  const [modal, setModal] = useState<{ type: "bet"; door: BigSmallBetId } | { type: "rules" | "result" } | null>(null);
  const activeModalDoor = modal?.type === "bet" ? modal.door : null;
  const isRulesOpen = modal?.type === "rules";
  const isResultOpen = modal?.type === "result";

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Dice to display on the mat
  const activeDice: [number, number, number] =
    pendingSettlement?.round.dice || lastRound?.dice || [1, 2, 3];

  const totalBets = calculateTotalBigSmallBets(bets);
  const availableGold = calculateAvailableGold(currentGold, bets);

  // Close Result Modal & Clear previous winning door highlights
  const handleCloseResultModal = () => {
    soundManager.playClick();
    setModal(null);
    setWinningHighlightDoor(null);
    setRevealedDiceCount(3);
  };

  // Bet door modal handlers
  const handleOpenBetModal = (door: BigSmallBetId) => {
    if (roundPhase !== "idle") return;
    soundManager.playClick();
    setModal({ type: "bet", door });
  };

  const handleConfirmBet = (door: BigSmallBetId, amount: number) => {
    setBets((prev) => ({
      ...prev,
      [door]: amount,
    }));
  };

  const handleClearDoorBet = (door: BigSmallBetId) => {
    setBets((prev) => ({
      ...prev,
      [door]: 0,
    }));
  };

  const handleClearAllBets = () => {
    if (roundPhase !== "idle" || totalBets === 0) return;
    soundManager.playClick();
    setBets(createEmptyBigSmallBets());
  };

  // 1. Trigger Shaking (2.5 seconds shake with bowl cover)
  const handleStartRoll = () => {
    if (roundPhase !== "idle") return;
    if (totalBets <= 0) return;
    if (totalBets > currentGold) return;

    clearAllTimers();
    soundManager.playClick();
    soundManager.playChallengeStart(); // sound effect for shaking

    const newRoundId = Date.now();
    setRoundId(newRoundId);
    setModal(null);
    setLastRound(null);
    setWinningHighlightDoor(null);
    setRevealedDiceCount(0);

    // Settle outcomes immediately in memory, but DO NOT update wallet gold until result modal shows
    const snapshotBets = { ...bets };
    setPreviousRoundBets(snapshotBets);
    const settlement = settleBigSmallRound(currentGold, snapshotBets);
    setPendingSettlement(settlement);
    setRoundPhase("shaking");

    // Exactly 2.5 seconds of shaking effect
    const shakeTimer = setTimeout(() => {
      setRoundPhase("ready_to_open");
    }, 2500);

    timersRef.current.push(shakeTimer);
  };

  // 2. Open Bowl & Sequential Reveal (800ms delay each, then popup after 3rd die + 1.2s)
  const handleOpenBowl = () => {
    if (roundPhase !== "ready_to_open" || !pendingSettlement) return;
    clearAllTimers();
    soundManager.playClick();
    setRoundPhase("revealing");
    setRevealedDiceCount(0);
    setWinningHighlightDoor(null);

    const settlement = pendingSettlement;

    // Die #1 revealed after 800ms
    const t1 = setTimeout(() => {
      setRevealedDiceCount(1);
      soundManager.playBubblePop();
    }, 800);

    // Die #2 revealed after 1600ms (800ms after Die 1)
    const t2 = setTimeout(() => {
      setRevealedDiceCount(2);
      soundManager.playBubblePop();
    }, 1600);

    // Die #3 revealed after 2400ms (800ms after Die 2)
    const t3 = setTimeout(() => {
      setRevealedDiceCount(3);
      soundManager.playBubblePop();
      // Light up winning door immediately when 3rd die is shown
      setWinningHighlightDoor(settlement.round.winningDoor);
    }, 2400);

    // Summary Modal delayed 1.2s after 3rd die (at 3600ms from open)
    // Synchronize gold at the exact moment popup appears
    const tModal = setTimeout(() => {
      setLastRound(settlement.round);

      // Play outcome sound
      if (settlement.round.net > 0) {
        soundManager.playSuccess();
      } else if (settlement.round.net < 0) {
        soundManager.playError();
      } else {
        soundManager.playClick();
      }

      if (onUpdateGameState) {
        onUpdateGameState((draft) => {
          if (!draft.farm) {
            draft.farm = createDefaultFarmState();
          }
          draft.farm.gold = settlement.postRoundGold;
        });
      }
      onUpdateGold?.(settlement.postRoundGold);

      setModal({ type: "result" });
      setRoundPhase("idle");
      setBets(createEmptyBigSmallBets());
      setPendingSettlement(null);
      setRevealedDiceCount(3);
    }, 3600);

    timersRef.current.push(t1, t2, t3, tModal);
  };

  // Calculate live cumulative sum of revealed dice
  const revealedSum = activeDice
    .slice(0, revealedDiceCount)
    .reduce((sum, val) => sum + val, 0);

  return (
    <div className="command-screen recreation-game-screen w-full max-w-lg mx-auto flex flex-col px-3 sm:px-3.5 py-2 space-y-3 select-none pb-12">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-lg shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onBackToHub();
            }}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors active:scale-95"
            title="Trở về Trung tâm Giải Trí"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-100 uppercase tracking-wide">
                Số Lớn Số Nhỏ
              </h2>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Sic Bo
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Dự đoán tổng điểm 3 xúc xắc
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Rules button */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setModal({ type: "rules" });
            }}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors active:scale-95"
            title="Xem Luật Chơi"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
          </button>

          {/* Current Gold Wallet Badge */}
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs font-black text-amber-400">
              {availableGold.toLocaleString("vi-VN")}
            </span>
          </div>
        </div>
      </div>

      {/* Zero Gold Warning Banner */}
      {currentGold === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-2.5 flex items-center justify-between gap-2 text-amber-200 shrink-0"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-[11px]">
              <strong className="block font-bold text-amber-300">
                Bạn đã hết Vàng!
              </strong>
              <span>Hãy qua tab Tăng Gia để thu hoạch thêm Vàng.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onNavigateTab("tang_gia");
            }}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1 shadow-md active:scale-95 transition-all"
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Tăng Gia</span>
          </button>
        </motion.div>
      )}

      {/* 2. Dice Cup Stage (Shaking / Bowl / Dice Display) */}
      <div data-game-surface="true" className="relative bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-xl overflow-hidden text-center space-y-2 shrink-0">
        {/* Stage Header without result text */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] sm:text-[11px] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ĐĨA XÚC XẮC</span>
          </span>
        </div>

        {/* The Dice Mat & Interactive Bowl Cover */}
        <div className="relative mx-auto w-full max-w-xs sm:max-w-sm min-h-[132px] sm:min-h-[142px] py-3 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col items-center justify-center shadow-inner overflow-hidden">
          {/* Concentric plate pattern */}
          <div className="absolute w-44 h-44 rounded-full border border-slate-800/40 pointer-events-none" />
          <div className="absolute w-28 h-28 rounded-full border border-amber-500/10 pointer-events-none" />

          {/* 3 Dice Elements with Sequential Reveal */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 z-10">
            {activeDice.map((val, idx) => {
              const isRevealed =
                roundPhase === "idle" ||
                (roundPhase === "revealing" && idx < revealedDiceCount);

              return (
                <div
                  key={`dice-slot-${idx}`}
                  className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0"
                >
                  <AnimatePresence mode="wait">
                    {isRevealed ? (
                      <motion.div
                        key={`revealed-${roundId}-${idx}-${val}`}
                        initial={{ scale: 0.3, rotateY: 90, opacity: 0 }}
                        animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                        transition={{ type: "spring", damping: 14, stiffness: 220 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <DiceFace
                          value={val}
                          size="lg"
                          isWinner={false}
                          isMystery={false}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`hidden-${roundId}-${idx}`}
                        initial={{ scale: 0.8, opacity: 0.6 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full rounded-2xl bg-slate-950/90 border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center p-1 shadow-inner"
                      >
                        <span className="text-xl sm:text-2xl text-amber-400 font-extrabold animate-pulse">
                          🎲
                        </span>
                        <span className="text-[9px] font-black text-amber-500/80 uppercase tracking-wider mt-0.5">
                          Số {idx + 1}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Real-time cumulative score indicator during reveal (Fixed static display showing only [X điểm]) */}
          {roundPhase === "revealing" && revealedDiceCount > 0 && (
            <div className="z-10 mt-2.5 px-3.5 py-1 rounded-full bg-slate-900/95 border border-amber-500/40 shadow-lg flex items-center justify-center backdrop-blur-md">
              <span className="text-sm font-black text-amber-400">
                {revealedSum} điểm
              </span>
            </div>
          )}

          {/* Shaking & Ready Bowl Cover */}
          <AnimatePresence>
            {(roundPhase === "shaking" || roundPhase === "ready_to_open") && (
              <motion.div
                initial={{ y: -120, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -150, opacity: 0, scale: 0.8 }}
                transition={
                  roundPhase === "shaking"
                    ? { y: { duration: 0.25 } }
                    : { type: "spring", damping: 20, stiffness: 260 }
                }
                onClick={roundPhase === "ready_to_open" ? handleOpenBowl : undefined}
                className={`absolute inset-0 z-20 overflow-hidden rounded-2xl flex flex-col items-center justify-center ${
                  roundPhase === "ready_to_open"
                    ? "cursor-pointer ring-2 ring-amber-400/30"
                    : ""
                }`}
              >
                {/* Shaking Bowl Background & Surface */}
                <motion.div
                  animate={{
                    x:
                      roundPhase === "shaking"
                        ? [0, -10, 10, -8, 8, -4, 4, 0]
                        : 0,
                    rotate:
                      roundPhase === "shaking"
                        ? [0, -6, 6, -4, 4, -2, 2, 0]
                        : 0,
                  }}
                  transition={
                    roundPhase === "shaking"
                      ? {
                          x: { repeat: Infinity, duration: 0.22 },
                          rotate: { repeat: Infinity, duration: 0.22 },
                        }
                      : {}
                  }
                  className={`absolute inset-0 bg-gradient-to-b from-slate-855 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl shadow-2xl backdrop-blur-sm ${
                    roundPhase === "ready_to_open" ? "hover:border-amber-400" : ""
                  }`}
                />

                {/* Fixed Non-Shaking Content Overlay (Text & Spinner remain perfectly stationary) */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  {roundPhase === "shaking" ? (
                    <div className="space-y-1.5 text-center pointer-events-none">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        className="w-7 h-7 mx-auto rounded-full border-2 border-amber-400 border-t-transparent shadow-lg"
                      />
                      <p className="text-xs font-black text-amber-400 uppercase tracking-widest animate-pulse">
                        ĐANG LẮC XÚC XẮC...
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-2 flex flex-col items-center">
                      <button
                        type="button"
                        onClick={handleOpenBowl}
                        className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xl shadow-amber-500/30 border border-amber-200 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>✨</span>
                        <span>MỞ BÁT</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. 2 Large Betting Doors (Số Nhỏ: 3–10 & Số Lớn: 11–18) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        {/* Door 1: Số Nhỏ (3–10) */}
        {(() => {
          const info = BIG_SMALL_DOOR_INFO.small;
          const bet = bets.small || 0;
          const isWon = winningHighlightDoor === "small";

          return (
            <motion.button
              key="small"
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleOpenBetModal("small")}
              className={`relative p-3.5 sm:p-4.5 rounded-2xl border text-center transition-all flex flex-col justify-between min-h-[150px] sm:min-h-[170px] shadow-lg group overflow-hidden ${
                isWon
                  ? "bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400"
                  : bet > 0
                  ? "bg-gradient-to-b from-slate-850 to-slate-900 border-amber-400 shadow-md ring-2 ring-amber-400/50"
                  : "bg-gradient-to-b from-slate-900/90 to-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              {/* Background ambient badge glow */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />

              {/* Door Centered Info: Title & Score Range */}
              <div className="w-full flex flex-col items-center justify-center text-center my-auto py-1 z-10">
                <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-wide uppercase group-hover:text-amber-300 transition-colors">
                  {info.name}
                </h3>
                <div className="mt-2 inline-flex items-center justify-center px-3 py-1 rounded-xl bg-sky-950/50 border border-sky-500/30 text-sky-300">
                  <span className="text-xs sm:text-sm font-black tracking-wide">
                    3 – 10 ĐIỂM
                  </span>
                </div>
              </div>

              {/* Door Bottom: Bet status or Tap to bet */}
              <div className="w-full pt-2 border-t border-slate-800/80 z-10">
                {bet > 0 ? (
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
                    <span className="text-[11px] font-bold text-amber-300/90 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Đã cược:</span>
                    </span>
                    <span className="text-xs sm:text-sm font-black">
                      {bet.toLocaleString("vi-VN")} V
                    </span>
                  </div>
                ) : (
                  <div className="w-full py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-[11px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                    + Đặt cược
                  </div>
                )}
              </div>
            </motion.button>
          );
        })()}

        {/* Door 2: Số Lớn (11–18) */}
        {(() => {
          const info = BIG_SMALL_DOOR_INFO.big;
          const bet = bets.big || 0;
          const isWon = winningHighlightDoor === "big";

          return (
            <motion.button
              key="big"
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleOpenBetModal("big")}
              className={`relative p-3.5 sm:p-4.5 rounded-2xl border text-center transition-all flex flex-col justify-between min-h-[150px] sm:min-h-[170px] shadow-lg group overflow-hidden ${
                isWon
                  ? "bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400"
                  : bet > 0
                  ? "bg-gradient-to-b from-slate-850 to-slate-900 border-amber-400 shadow-md ring-2 ring-amber-400/50"
                  : "bg-gradient-to-b from-slate-900/90 to-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              {/* Background ambient badge glow */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

              {/* Door Centered Info: Title & Score Range */}
              <div className="w-full flex flex-col items-center justify-center text-center my-auto py-1 z-10">
                <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-wide uppercase group-hover:text-amber-300 transition-colors">
                  {info.name}
                </h3>
                <div className="mt-2 inline-flex items-center justify-center px-3 py-1 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-300">
                  <span className="text-xs sm:text-sm font-black tracking-wide">
                    11 – 18 ĐIỂM
                  </span>
                </div>
              </div>

              {/* Door Bottom: Bet status or Tap to bet */}
              <div className="w-full pt-2 border-t border-slate-800/80 z-10">
                {bet > 0 ? (
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
                    <span className="text-[11px] font-bold text-amber-300/90 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Đã cược:</span>
                    </span>
                    <span className="text-xs sm:text-sm font-black">
                      {bet.toLocaleString("vi-VN")} V
                    </span>
                  </div>
                ) : (
                  <div className="w-full py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-[11px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                    + Đặt cược
                  </div>
                )}
              </div>
            </motion.button>
          );
        })()}
      </div>

      {/* 4. Action Summary Card (Always accessible via scroll) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl space-y-2 shrink-0">
        {/* Bets & Availability Summary */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs px-0.5">
          <div className="flex items-center gap-1 text-slate-300">
            <span>Đang cược:</span>
            <span className="font-extrabold text-amber-400">
              {totalBets.toLocaleString("vi-VN")} Vàng
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <span>Còn khả dụng:</span>
            <span
              className={`font-extrabold ${
                availableGold === 0 && totalBets > 0
                  ? "text-rose-400"
                  : "text-emerald-400"
              }`}
            >
              {availableGold.toLocaleString("vi-VN")} Vàng
            </span>
          </div>
        </div>

        {/* Action Controls (Clear + Roll/Open Bowl) */}
        <div className="flex items-center gap-2">
          {totalBets > 0 && roundPhase === "idle" && (
            <button
              type="button"
              onClick={handleClearAllBets}
              className="h-11 sm:h-12 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
              title="Hủy toàn bộ cược"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hủy</span>
            </button>
          )}

          {/* Unified Primary Action Button */}
          {(() => {
            if (roundPhase === "ready_to_open") {
              return (
                <button
                  type="button"
                  onClick={handleOpenBowl}
                  className="flex-1 h-11 sm:h-12 py-2 px-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 active:scale-98 text-slate-950 shadow-amber-500/25 cursor-pointer animate-pulse ring-2 ring-amber-300 select-none overflow-hidden"
                >
                  <Sparkles className="w-4 h-4 text-slate-950 shrink-0" />
                  <span className="truncate whitespace-nowrap leading-none text-center">
                    MỞ BÁT (XEM KẾT QUẢ)
                  </span>
                </button>
              );
            }

            if (roundPhase === "revealing") {
              return (
                <button
                  type="button"
                  disabled
                  className="flex-1 h-11 sm:h-12 py-2 px-3 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 bg-slate-800 text-amber-300 border border-amber-500/30 cursor-wait select-none overflow-hidden"
                >
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                  <span className="truncate whitespace-nowrap leading-none text-center">
                    ĐANG MỞ TỪNG VIÊN XÚC XẮC...
                  </span>
                </button>
              );
            }

            if (roundPhase === "shaking") {
              return (
                <button
                  type="button"
                  disabled
                  className="flex-1 h-11 sm:h-12 py-2 px-3 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 bg-slate-800 text-amber-300 border border-amber-500/30 cursor-wait select-none overflow-hidden"
                >
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                  <span className="truncate whitespace-nowrap leading-none text-center">
                    ĐANG LẮC...
                  </span>
                </button>
              );
            }

            const canRoll = totalBets > 0 && currentGold > 0;
            return (
              <button
                type="button"
                disabled={!canRoll}
                onClick={handleStartRoll}
                className={`flex-1 h-11 sm:h-12 py-2 px-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 select-none overflow-hidden ${
                  canRoll
                    ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 active:scale-98 text-slate-950 shadow-amber-500/25 cursor-pointer animate-pulse"
                    : "bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed"
                }`}
              >
                <span className="text-base leading-none select-none">🎲</span>
                <span className="truncate whitespace-nowrap leading-none text-center">
                  LẮC
                </span>
              </button>
            );
          })()}
        </div>
      </div>

      {/* Modals */}
      <BigSmallBetModal
        isOpen={activeModalDoor !== null}
        door={activeModalDoor}
        currentGold={currentGold}
        currentBets={bets}
        previousRoundBet={activeModalDoor ? previousRoundBets[activeModalDoor] : 0}
        onConfirmBet={handleConfirmBet}
        onClearBet={handleClearDoorBet}
        onClose={() => setModal(null)}
      />

      <BigSmallRulesModal
        isOpen={isRulesOpen}
        onClose={() => setModal(null)}
      />

      <BigSmallResultModal
        isOpen={isResultOpen}
        round={lastRound}
        onClose={handleCloseResultModal}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
