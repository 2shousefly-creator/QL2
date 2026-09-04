import React from "react";
import {
  Coins,
  Sparkles,
  Trophy,
  Star,
  Scale,
  Frown,
  ArrowRight,
  Sprout,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BigSmallBetId, BigSmallRound, BigSmallWinType } from "../types";
import {
  BIG_SMALL_DOOR_INFO,
  calculateDoorReturn,
  getBigSmallWinType,
  isBetWon,
} from "./bigSmallEngine";
import { DiceFace } from "./DiceFace";
import { soundManager } from "../../../game/audio";
import { TabType } from "../../../game/types";

interface BigSmallResultModalProps {
  isOpen: boolean;
  round: BigSmallRound | null;
  onClose: () => void;
  onNavigateTab: (tab: TabType) => void;
}

export const BigSmallResultModal: React.FC<BigSmallResultModalProps> = ({
  isOpen,
  round,
  onClose,
  onNavigateTab,
}) => {
  if (!isOpen || !round) return null;

  const winType: BigSmallWinType = getBigSmallWinType(round);

  // Extract placed bets for display
  const placedBetIds = (Object.keys(round.bets) as BigSmallBetId[]).filter(
    (id) => (round.bets[id] || 0) > 0
  );

  const placedBets = placedBetIds.map((id) => {
    const bet = round.bets[id] || 0;
    const won = isBetWon(id, round.dice);
    const winPayout = calculateDoorReturn(id, bet, round.dice);
    const info = BIG_SMALL_DOOR_INFO[id];
    return {
      id,
      info,
      bet,
      won,
      winPayout,
    };
  });

  const wonBetsCount = placedBets.filter((item) => item.won).length;

  const config = (() => {
    // 1. Hòa vốn
    if (round.net === 0) {
      return {
        title: "HOÀ VỐN",
        subtitle: `Tổng ${round.total} điểm (${round.total <= 10 ? "3–10" : "11–18"}) — Bảo toàn số Vàng đặt cược.`,
        badge: "⚖️ Hoà Vốn",
        icon: Scale,
        iconColor: "text-slate-300",
        iconBg: "bg-slate-800 border-slate-700",
        glowGradient: "from-slate-700/20 via-slate-800/10 to-transparent",
        modalBorder: "border-slate-700 shadow-xl",
        netBadgeBg: "bg-slate-800/90 border-slate-600 text-slate-200",
        buttonGradient:
          "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600",
      };
    }

    // 2. Thua cược (Màu chủ đạo đỏ)
    if (round.net < 0) {
      return {
        title: round.winningDoor === "small" ? "SỐ NHỎ" : "SỐ LỚN",
        subtitle: `Tổng ${round.total} điểm (${round.total <= 10 ? "3–10" : "11–18"}) — Rất tiếc, chúc bạn may mắn lần sau!`,
        badge: "💔 Thua Cược",
        icon: Frown,
        iconColor: "text-rose-400",
        iconBg:
          "bg-rose-500/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]",
        glowGradient: "from-rose-500/25 via-rose-950/20 to-transparent",
        modalBorder:
          "border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.3)]",
        netBadgeBg: "bg-rose-950/90 border-rose-500/60 text-rose-300",
        buttonGradient:
          "bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 hover:from-rose-400 hover:to-red-400 text-white shadow-rose-500/30",
      };
    }

    // 3. Thắng cược / Thắng lớn (Màu chủ đạo xanh lá cây)
    const isBigWin = winType === "big_win";
    return {
      title: round.winningDoor === "small" ? "SỐ NHỎ" : "SỐ LỚN",
      subtitle: `Tổng ${round.total} điểm (${round.total <= 10 ? "3–10" : "11–18"}) — Chúc mừng bạn đã dự đoán chính xác!`,
      badge: isBigWin ? "🌟 Thắng Lớn" : "🎉 Thắng Cược",
      icon: isBigWin ? Star : Trophy,
      iconColor: "text-emerald-400",
      iconBg:
        "bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.4)]",
      glowGradient: "from-emerald-500/25 via-teal-500/15 to-transparent",
      modalBorder:
        "border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.3)]",
      netBadgeBg: "bg-emerald-950/90 border-emerald-500/60 text-emerald-300",
      buttonGradient:
        "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-emerald-500/30",
    };
  })();

  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 24, stiffness: 320 }}
          className={`relative z-10 w-full max-w-sm sm:max-w-md bg-slate-900 border rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3 sm:space-y-4 max-h-[88vh] overflow-y-auto ${config.modalBorder}`}
        >
          {/* Top Atmospheric Glow */}
          <div
            className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${config.glowGradient} pointer-events-none`}
          />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Icon & Title */}
          <div className="relative flex flex-col items-center text-center space-y-2 pt-1">
            <div
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl ${config.iconBg}`}
            >
              <IconComponent className={`w-7 h-7 ${config.iconColor}`} />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-100 tracking-wide uppercase">
                {config.title}
              </h3>
            </div>
          </div>

          {/* 3 Result Dice Showcase */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5">
            <div className="flex items-center justify-center gap-3.5 sm:gap-4 py-1">
              {round.dice.map((val, idx) => (
                <DiceFace
                  key={idx}
                  value={val}
                  size="md"
                  isWinner={false}
                />
              ))}
            </div>
          </div>

          {/* Placed Bets Comparison Section */}
          {placedBets.length > 0 && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-0.5">
                <span>CỬA BẠN ĐÃ ĐẶT:</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {placedBets.length} cửa đã cược
                </span>
              </div>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-0.5">
                {placedBets.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                      item.won
                        ? "bg-emerald-950/40 border-emerald-500/40 text-slate-100"
                        : "bg-slate-900/60 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-1.5 leading-tight">
                        <span>{item.info.name}</span>
                        {item.won ? (
                          <span className="px-1.5 py-0.2 rounded-md text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                            Trúng
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-md text-[9px] font-semibold bg-slate-800 text-slate-400 border border-slate-700/60">
                            Không trúng
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Cược:{" "}
                        <strong className="text-amber-400">
                          {item.bet.toLocaleString("vi-VN")} Vàng
                        </strong>
                      </span>
                    </div>

                    <div className="text-right font-extrabold">
                      {item.won ? (
                        <div className="text-emerald-400 text-xs">
                          +{item.winPayout.toLocaleString("vi-VN")} V
                        </div>
                      ) : (
                        <div className="text-rose-400/90 text-xs">
                          -{item.bet.toLocaleString("vi-VN")} V
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ledger Financial Breakdown */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Tổng tiền đã cược:</span>
              <span className="font-semibold text-slate-200">
                {round.totalBet.toLocaleString("vi-VN")} Vàng
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Tổng tiền thu về:</span>
              <span className="font-semibold text-slate-200">
                {round.totalReturn.toLocaleString("vi-VN")} Vàng
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="font-bold text-slate-200">Kết quả ròng:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${config.netBadgeBg}`}
              >
                {round.net > 0 ? `+${round.net.toLocaleString("vi-VN")}` : round.net.toLocaleString("vi-VN")}{" "}
                Vàng
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-slate-300">
              <span className="flex items-center gap-1 font-semibold">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Số dư hiện tại:
              </span>
              <span className="font-black text-amber-400">
                {round.postGold.toLocaleString("vi-VN")} Vàng
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-1 flex items-center gap-2">
            {round.postGold === 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                  }}
                  className="flex-1 min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all text-center"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                    onNavigateTab("tang_gia");
                  }}
                  className="flex-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all text-center"
                >
                  <Sprout className="w-4 h-4" />
                  <span>Đến Tăng Gia Kiếm Vàng</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                }}
                className={`w-full min-h-[44px] px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wide active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 ${config.buttonGradient}`}
              >
                <span>TIẾP TỤC CHƠI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
