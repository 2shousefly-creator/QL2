import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Coins,
  Sprout,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GameState, TabType } from "../../../game/types";
import { soundManager } from "../../../game/audio";
import { BauCuaBets, BauCuaRound, BauCuaSymbol } from "../types";
import {
  BAU_CUA_SYMBOLS,
  BAU_CUA_BOARD_LAYOUT,
  BAU_CUA_SYMBOL_INFO,
  calculateAvailableGold,
  calculateTotalBets,
  countOccurrences,
  createEmptyBets,
  getBauCuaWinType,
  rollBauCuaDice,
  settleBauCuaRound,
} from "./bauCuaEngine";
import { BauCuaBetModal } from "./BauCuaBetModal";
import { BauCuaResultModal } from "./BauCuaResultModal";
import { createDefaultFarmState } from "../../tang_gia/farmEngine";

interface BauCuaScreenProps {
  gameState: GameState;
  onUpdateGameState: (
    updater: ((draft: GameState) => void) | GameState
  ) => void;
  onBack: () => void;
  onNavigateTab: (tab: TabType) => void;
}

export const BauCuaScreen: React.FC<BauCuaScreenProps> = ({
  gameState,
  onUpdateGameState,
  onBack,
  onNavigateTab,
}) => {
  // Current real gold from single source of truth (farm.gold)
  const currentGold = gameState.farm?.gold ?? 0;
  const isReducedMotion = Boolean(gameState.settings?.reducedMotion);

  // In-memory draft bets for the upcoming round
  const [draftBets, setDraftBets] = useState<BauCuaBets>(createEmptyBets);
  const [previousRoundBets, setPreviousRoundBets] = useState<BauCuaBets>(createEmptyBets);

  // Modal editing state
  const [editingDoor, setEditingDoor] = useState<BauCuaSymbol | null>(null);
  const [modalResultRound, setModalResultRound] = useState<BauCuaRound | null>(null);

  // Round animation & settlement state
  // Stage: 'idle' | 'shaking' | 'ready_to_open' | 'revealing'
  const [roundStage, setRoundStage] = useState<
    "idle" | "shaking" | "ready_to_open" | "revealing"
  >("idle");
  const [roundId, setRoundId] = useState<number>(() => Date.now());
  const [pendingRound, setPendingRound] = useState<BauCuaRound | null>(null);
  const [displayedDice, setDisplayedDice] = useState<[BauCuaSymbol, BauCuaSymbol, BauCuaSymbol]>([
    "bau",
    "cua",
    "tom",
  ]);
  const [revealedDiceCount, setRevealedDiceCount] = useState<number>(3);
  const [lastSettledRound, setLastSettledRound] = useState<BauCuaRound | null>(null);

  // Rolling animation & reveal timer references
  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const revealTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllRevealTimeouts = () => {
    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }
    if (rollTimeoutRef.current) {
      clearTimeout(rollTimeoutRef.current);
      rollTimeoutRef.current = null;
    }
    revealTimeoutsRef.current.forEach((t) => clearTimeout(t));
    revealTimeoutsRef.current = [];
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearAllRevealTimeouts();
    };
  }, []);

  const isBusy = roundStage !== "idle";
  const totalDraftBets = calculateTotalBets(draftBets);
  const availableGold = calculateAvailableGold(currentGold, draftBets);

  // Reset bets if wallet drops below draft bets (e.g. external mutation)
  useEffect(() => {
    if (totalDraftBets > currentGold && !isBusy) {
      setDraftBets(createEmptyBets());
    }
  }, [currentGold, totalDraftBets, isBusy]);

  const handleOpenBetModal = (door: BauCuaSymbol) => {
    if (isBusy) return;
    soundManager.playClick();
    setEditingDoor(door);
  };

  const handleConfirmBet = (door: BauCuaSymbol, amount: number) => {
    setDraftBets((prev) => ({
      ...prev,
      [door]: amount,
    }));
  };

  const handleClearBet = (door: BauCuaSymbol) => {
    setDraftBets((prev) => ({
      ...prev,
      [door]: 0,
    }));
  };

  const handleCloseResultModal = () => {
    setModalResultRound(null);
    setLastSettledRound(null);
    setRevealedDiceCount(3);
  };

  /**
   * Main Shake ("Lắc") Handler:
   * 1. Snapshot gold & bets.
   * 2. Clear old modal & highlights cleanly.
   * 3. Roll dice & settle payout deterministically in memory.
   * 4. Hold settlement in `pendingRound` WITHOUT mutating game wallet gold yet.
   * 5. Cover dice area with lid showing "Đang lắc".
   * 6. When shake finishes, transform cover into "Mở Bát" button.
   */
  const handleRollDice = () => {
    if (isBusy || totalDraftBets <= 0 || totalDraftBets > currentGold) {
      return;
    }

    clearAllRevealTimeouts();
    soundManager.playClick();
    soundManager.playChallengeStart();

    const newRoundId = Date.now();
    setRoundId(newRoundId);
    setModalResultRound(null);
    setLastSettledRound(null);
    setRevealedDiceCount(0);
    setRoundStage("shaking");

    // 1. Snapshot currentGold and draft bets
    const snapshotGold = currentGold;
    const snapshotBets = { ...draftBets };
    setPreviousRoundBets(snapshotBets);

    // 2. Generate unbiased dice result ONCE
    const finalDice = rollBauCuaDice();

    // 3. Settle round & calculate payout
    const { round } = settleBauCuaRound(
      snapshotGold,
      snapshotBets,
      finalDice
    );

    // Keep final result ready behind the cover (Gold will be synced upon opening)
    setPendingRound(round);

    // 4. Run dice shake animation with cover closed
    if (isReducedMotion) {
      setDisplayedDice(finalDice);
      setRoundStage("ready_to_open");
      return;
    }

    // Dynamic shuffling animation behind cover
    rollIntervalRef.current = setInterval(() => {
      const randomFaces: [BauCuaSymbol, BauCuaSymbol, BauCuaSymbol] = [
        BAU_CUA_SYMBOLS[Math.floor(Math.random() * 6)],
        BAU_CUA_SYMBOLS[Math.floor(Math.random() * 6)],
        BAU_CUA_SYMBOLS[Math.floor(Math.random() * 6)],
      ];
      setDisplayedDice(randomFaces);
    }, 75);

    rollTimeoutRef.current = setTimeout(() => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
        rollIntervalRef.current = null;
      }
      setDisplayedDice(finalDice);
      setRoundStage("ready_to_open");
    }, 2500);
  };

  /**
   * User clicks "Mở Bát":
   * 1. Lift the cover smoothly with all 3 dice in mystery / hidden state.
   * 2. Flip Die 1 at t = 800ms.
   * 3. Flip Die 2 at t = 1600ms.
   * 4. Flip Die 3 at t = 2400ms.
   * 5. Highlight winning doors step-by-step as each die flips open.
   * 6. Show result popup at t = 3600ms (1.2s after Die 3) with celebratory audio & gold sync.
   */
  const handleOpenCover = () => {
    if (roundStage !== "ready_to_open" || !pendingRound) return;

    clearAllRevealTimeouts();
    soundManager.playClick();
    setRoundStage("revealing");

    const settledRound = pendingRound;
    const winType = getBauCuaWinType(settledRound);

    setDisplayedDice(settledRound.result);
    // When cover lifts, dice start completely covered in mystery state
    setRevealedDiceCount(0);

    // Step 1: Reveal Die 1 at t = 800ms
    const timer1 = setTimeout(() => {
      setRevealedDiceCount(1);
      soundManager.playBubblePop();
    }, 800);
    revealTimeoutsRef.current.push(timer1);

    // Step 2: Reveal Die 2 at t = 1600ms
    const timer2 = setTimeout(() => {
      setRevealedDiceCount(2);
      soundManager.playBubblePop();
    }, 1600);
    revealTimeoutsRef.current.push(timer2);

    // Step 3: Reveal Die 3 at t = 2400ms
    const timer3 = setTimeout(() => {
      setRevealedDiceCount(3);
      soundManager.playBubblePop();
    }, 2400);
    revealTimeoutsRef.current.push(timer3);

    // Step 4: Display Result Modal at t = 3600ms (1.2s after Die 3)
    const finalTimer = setTimeout(() => {
      // 1. Synchronize gold balance to single source of truth at the moment popup appears
      onUpdateGameState((draft) => {
        if (!draft.farm) {
          draft.farm = createDefaultFarmState();
        }
        draft.farm.gold = settledRound.postGold;
      });

      // 2. Sound effect tailored to outcome tier
      if (winType === "perfect_win") {
        soundManager.playPromotionFanfare();
      } else if (winType === "big_win") {
        soundManager.playXpFull();
      } else if (winType === "regular_win") {
        soundManager.playSuccess();
      } else if (winType === "draw") {
        soundManager.playClick();
      } else {
        soundManager.playError();
      }

      // 3. Display summary popup modal & keep settledRound for highlights until modal closed
      setDisplayedDice(settledRound.result);
      setLastSettledRound(settledRound);
      setModalResultRound(settledRound);
      setPendingRound(null);
      setDraftBets(createEmptyBets());
      setRoundStage("idle");
      setRevealedDiceCount(3);
    }, 3600);
    revealTimeoutsRef.current.push(finalTimer);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex-1 flex flex-col min-h-0 px-3 sm:px-4 py-2 sm:py-2.5 space-y-2 sm:space-y-2.5 select-none pb-6 sm:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onBack();
            }}
            disabled={isBusy}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors disabled:opacity-50"
            title="Quay lại Giải Trí"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-100 uppercase tracking-wide leading-tight">
              BẦU CUA TÔM CÁ
            </h2>
            <span className="text-[10px] text-slate-400">
              Dân gian truyền thống
            </span>
          </div>
        </div>

        {/* Available Gold Counter (Synchronized with active bets) */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-400 text-xs font-extrabold shadow-inner"
          title={`Vàng khả dụng: ${availableGold.toLocaleString("vi-VN")} Vàng`}
        >
          <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{availableGold.toLocaleString("vi-VN")}</span>
          <span className="text-[10px] text-amber-500/80">Vàng</span>
        </div>
      </div>

      {/* Zero Gold Warning Banner */}
      {currentGold === 0 && !isBusy && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold">Bạn đã hết Vàng.</p>
              <p className="text-[10px] sm:text-[11px] text-rose-300/80">
                Hãy thu hoạch hoặc bán sản phẩm ở Tăng Gia để tiếp tục.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onNavigateTab("tang_gia");
            }}
            className="px-2.5 py-1 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold shrink-0 transition-colors flex items-center gap-1 shadow-md"
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Đến Tăng Gia</span>
          </button>
        </div>
      )}

      {/* Result Display & Dice Rolling Stage with Suspenseful Cover */}
      <div className="relative bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col items-center justify-center min-h-[140px] sm:min-h-[160px] overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        {/* 3 Dice Bowl / Rolling Container (Strictly vertically & horizontally centered) */}
        <div className="flex items-center justify-center gap-3 sm:gap-4.5 w-full my-auto z-10">
          {displayedDice.map((sym, index) => {
            const isRevealed =
              roundStage === "idle" ||
              (roundStage === "revealing" && index < revealedDiceCount);
            const info = BAU_CUA_SYMBOL_INFO[sym];

            return (
              <div
                key={`dice-container-${index}`}
                className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0"
              >
                <AnimatePresence mode="wait">
                  {isRevealed ? (
                    <motion.div
                      key={`revealed-${roundId}-${sym}-${index}`}
                      initial={{ scale: 0.4, rotateY: 90, opacity: 0 }}
                      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                      transition={{ type: "spring", damping: 14, stiffness: 220 }}
                      className={`w-full h-full rounded-2xl bg-gradient-to-br ${info.bgGradient} border-2 ${info.borderColor} flex items-center justify-center shadow-lg transition-colors`}
                    >
                      <span className="text-4xl sm:text-5xl filter drop-shadow-md leading-none select-none">
                        {info.emoji}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`hidden-${roundId}-${index}`}
                      initial={{ scale: 0.8, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full rounded-2xl bg-slate-950/90 border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center p-1 shadow-inner"
                    >
                      <span className="text-2xl sm:text-3xl text-amber-400 font-extrabold animate-pulse">
                        🎲
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-black text-amber-500/80 uppercase tracking-wider mt-0.5">
                        Số {index + 1}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* SUSPENSEFUL COVER BOWL (NẮP ĐẬY BÁT KÍN) */}
        <AnimatePresence>
          {(roundStage === "shaking" || roundStage === "ready_to_open") && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 z-20 overflow-hidden rounded-2xl flex flex-col items-center justify-center p-3"
            >
              {/* Shaking Bowl Surface Background */}
              <motion.div
                animate={
                  roundStage === "shaking"
                    ? {
                        rotate: [0, -3, 3, -2, 2, 0],
                        scale: [1, 1.02, 0.98, 1.01, 1],
                        x: [0, -8, 8, -6, 6, -3, 3, 0],
                      }
                    : { rotate: 0, scale: 1, x: 0 }
                }
                transition={
                  roundStage === "shaking"
                    ? {
                        rotate: { duration: 0.25, repeat: Infinity, ease: "easeInOut" },
                        scale: { duration: 0.25, repeat: Infinity, ease: "easeInOut" },
                        x: { duration: 0.22, repeat: Infinity },
                      }
                    : {}
                }
                className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md"
              />

              {/* Fixed Stationary Content Overlay (Text & Spinner remain non-shaking at center) */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                {roundStage === "shaking" ? (
                  <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      className="w-7 h-7 mx-auto rounded-full border-2 border-amber-400 border-t-transparent shadow-lg"
                    />
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-black text-amber-300 tracking-wider animate-pulse flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>ĐANG LẮC...</span>
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400">
                        Đang xóc 3 xúc xắc trong bát kín
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenCover}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.6)] ring-2 ring-amber-300 cursor-pointer"
                  >
                    <span className="text-base">✨</span>
                    <span>MỞ BÁT</span>
                    <span className="text-base">👉</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Betting Board (Grid 2 rows × 3 cols: Top: Nai, Bầu, Gà | Bottom: Tôm, Cua, Cá) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
        {BAU_CUA_BOARD_LAYOUT.map((sym) => {
          const info = BAU_CUA_SYMBOL_INFO[sym];
          const betAmount = draftBets[sym] || 0;
          const hasBet = betAmount > 0;
          const cannotBetMore = availableGold <= 0 && !hasBet;

          // Check if highlight mode is active (during sequential reveal or while modal is open)
          const activeRound = pendingRound || modalResultRound;
          const isHighlightActive =
            (roundStage === "revealing" || modalResultRound !== null) &&
            activeRound !== null;

          let isHit = false;
          let hitCount = 0;
          let userBetOnThis = false;

          if (isHighlightActive && activeRound) {
            const revealedDice = modalResultRound
              ? activeRound.result
              : activeRound.result.slice(0, revealedDiceCount);
            hitCount = revealedDice.filter((s) => s === sym).length;
            isHit = hitCount > 0;
            userBetOnThis = (activeRound.bets[sym] || 0) > 0;
          }

          const currentBetValue = isHighlightActive && activeRound ? (activeRound.bets[sym] || 0) : betAmount;
          const displayHasBet = hasBet || (isHighlightActive && userBetOnThis);

          return (
            <div
              key={sym}
              onClick={() => {
                if (!isBusy && !isHighlightActive && (!cannotBetMore || hasBet)) {
                  handleOpenBetModal(sym);
                }
              }}
              className={`relative group flex flex-col justify-between p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer select-none ${
                isHighlightActive
                  ? isHit
                    ? userBetOnThis
                      ? "ring-2 sm:ring-4 ring-emerald-400 border-emerald-400 bg-emerald-950/90 shadow-[0_0_25px_rgba(16,185,129,0.7)] scale-[1.03] z-10"
                      : "ring-2 sm:ring-4 ring-rose-500 border-rose-500 bg-rose-950/90 shadow-[0_0_25px_rgba(244,63,94,0.7)] scale-[1.03] z-10"
                    : "opacity-35 grayscale-[25%] bg-slate-900/60 border-slate-800"
                  : `bg-gradient-to-br ${info.bgGradient} ${
                      hasBet
                        ? info.activeBorderColor + " bg-slate-900 shadow-md scale-[1.01]"
                        : info.borderColor + " bg-slate-900/75 hover:bg-slate-900/90"
                    } ${
                      isBusy || (cannotBetMore && !hasBet)
                        ? "opacity-60 cursor-not-allowed"
                        : "active:scale-95"
                    }`
              }`}
            >
              {/* Highlight Winner Badge on Door */}
              {isHighlightActive && isHit && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-black tracking-wider shadow-md flex items-center justify-center ${
                      userBetOnThis
                        ? "bg-emerald-400 text-slate-950 ring-2 ring-emerald-300"
                        : "bg-rose-500 text-white ring-2 ring-rose-300"
                    }`}
                  >
                    x{hitCount}
                  </span>
                </div>
              )}

              {/* Active Bet Indicator Badge */}
              {!isHighlightActive && hasBet && (
                <div className="absolute -top-1 -right-1 z-10">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,1)]" />
                  </span>
                </div>
              )}

              {/* Large Animal Icon */}
              <div className="flex items-center justify-center text-center py-2 sm:py-2.5">
                <span className="text-4xl sm:text-5xl filter drop-shadow-md transition-transform group-hover:scale-105 select-none leading-none">
                  {info.emoji}
                </span>
              </div>

              {/* Door Bet Action / Active Bet Badge Footer */}
              <div className="mt-0.5 pt-1 border-t border-slate-800/80 flex flex-col items-center justify-center">
                {displayHasBet ? (
                  <div className="w-full min-h-[26px] sm:min-h-[28px] px-1.5 py-0.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black transition-all flex items-center justify-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                    <Coins className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">
                      Đã cược {currentBetValue.toLocaleString("vi-VN")} V
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenBetModal(sym);
                    }}
                    disabled={isBusy || isHighlightActive || cannotBetMore}
                    className={`w-full min-h-[26px] sm:min-h-[28px] px-1.5 py-0.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1 ${
                      cannotBetMore || isBusy || isHighlightActive
                        ? "bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 shadow-sm"
                    }`}
                  >
                    <span>+ Đặt cược</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer & Main Action Button */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl space-y-2">
        {/* Bets & Availability Summary */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs px-0.5">
          <div className="flex items-center gap-1 text-slate-300">
            <span>Đang cược:</span>
            <span className="font-extrabold text-amber-400">
              {totalDraftBets.toLocaleString("vi-VN")} Vàng
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <span>Còn khả dụng:</span>
            <span
              className={`font-extrabold ${
                availableGold === 0 && totalDraftBets > 0
                  ? "text-rose-400"
                  : "text-emerald-400"
              }`}
            >
              {availableGold.toLocaleString("vi-VN")} Vàng
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {totalDraftBets > 0 && !isBusy && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setDraftBets(createEmptyBets());
              }}
              className="h-11 sm:h-12 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
              title="Hủy toàn bộ cược"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hủy</span>
            </button>
          )}

          {/* Unified Primary Action Button */}
          {(() => {
            if (roundStage === "ready_to_open") {
              return (
                <button
                  type="button"
                  onClick={handleOpenCover}
                  className="flex-1 h-11 sm:h-12 py-2 px-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 active:scale-98 text-slate-950 shadow-amber-500/25 cursor-pointer animate-pulse ring-2 ring-amber-300 select-none overflow-hidden"
                >
                  <Sparkles className="w-4 h-4 text-slate-950 shrink-0" />
                  <span className="truncate whitespace-nowrap leading-none text-center">
                    MỞ BÁT (XEM KẾT QUẢ)
                  </span>
                </button>
              );
            }

            if (roundStage === "revealing") {
              return (
                <button
                  type="button"
                  disabled
                  className="flex-1 h-11 sm:h-12 py-2 px-3 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 bg-slate-800 text-amber-300 border border-amber-500/30 cursor-wait select-none overflow-hidden"
                >
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                  <span className="truncate whitespace-nowrap leading-none text-center">
                    ĐANG CÔNG BỐ KẾT QUẢ...
                  </span>
                </button>
              );
            }

            if (roundStage === "shaking") {
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

            const canRoll = !isBusy && totalDraftBets > 0 && totalDraftBets <= currentGold;
            return (
              <button
                type="button"
                onClick={handleRollDice}
                disabled={!canRoll}
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

      {/* Betting Modal */}
      <BauCuaBetModal
        isOpen={editingDoor !== null}
        door={editingDoor}
        currentGold={currentGold}
        currentBets={draftBets}
        previousRoundBet={editingDoor ? previousRoundBets[editingDoor] : 0}
        onConfirmBet={handleConfirmBet}
        onClearBet={handleClearBet}
        onClose={() => setEditingDoor(null)}
      />

      {/* Result Announcement Popup */}
      <BauCuaResultModal
        round={modalResultRound}
        onClose={handleCloseResultModal}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
