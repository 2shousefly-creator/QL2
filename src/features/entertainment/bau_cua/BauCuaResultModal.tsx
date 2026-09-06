import React from "react";
import { ArrowRight, Coins, Crown, Frown, Scale, Sprout, Star, Trophy, X } from "lucide-react";
import { BauCuaRound, BauCuaWinType } from "../types";
import {
  BAU_CUA_BOARD_LAYOUT,
  BAU_CUA_SYMBOL_INFO,
  countOccurrences,
  getBauCuaWinType,
} from "./bauCuaEngine";
import { soundManager } from "../../../game/audio";
import { TabType } from "../../../game/types";
import { GameResultModal, ModalActions, ModalButton, OverlayBody, ResultHero } from "../../../components/overlay/AppOverlay";

interface BauCuaResultModalProps {
  round: BauCuaRound | null;
  onClose: () => void;
  onNavigateTab: (tab: TabType) => void;
}

export const BauCuaResultModal: React.FC<BauCuaResultModalProps> = ({
  round,
  onClose,
  onNavigateTab,
}) => {
  if (!round) return null;

  const winType: BauCuaWinType = getBauCuaWinType(round);
  const occurrences = countOccurrences(round.result);

  // Extract all doors the player placed a bet on in this round
  const placedBets = BAU_CUA_BOARD_LAYOUT.filter(
    (sym) => (round.bets[sym] || 0) > 0
  ).map((sym) => {
    const bet = round.bets[sym] || 0;
    const matchCount = occurrences[sym] || 0;
    const winPayout = matchCount > 0 ? bet * (matchCount + 1) : 0;
    return {
      sym,
      info: BAU_CUA_SYMBOL_INFO[sym],
      bet,
      matchCount,
      winPayout,
    };
  });

  const matchedBets = placedBets.filter((item) => item.matchCount > 0);
  const matchedCount = matchedBets.length;
  const totalMatchedDice = placedBets.reduce(
    (sum, item) => sum + item.matchCount,
    0
  );

  // Configure theme styling and titles based on exact user rules
  const config = (() => {
    // 1. Hòa vốn
    if (round.net === 0) {
      return {
        title: "HOÀ VỐN",
        subtitle: "Bảo toàn số Vàng đặt cược.",
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

    // 2. Thua cược (Không trúng cửa nào HOẶC trúng ít nhất 1 cửa nhưng tổng lợi nhuận vẫn lỗ)
    if (round.net < 0) {
      const isPartialHit = matchedCount > 0;
      return {
        title: "THUA CƯỢC",
        subtitle: isPartialHit
          ? `Trúng ${matchedCount} cửa nhưng tổng lợi nhuận vẫn lỗ.`
          : "Không trúng cửa nào trong ván này.",
        badge: "💥 Thua Cược",
        icon: Frown,
        iconColor: "text-rose-400",
        iconBg:
          "bg-rose-500/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]",
        glowGradient: "from-rose-500/20 via-rose-950/20 to-transparent",
        modalBorder:
          "border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.25)]",
        netBadgeBg: "bg-rose-950/80 border-rose-500/50 text-rose-300",
        buttonGradient:
          "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
      };
    }

    // 3. Trúng cả 3 cửa / 3 xúc xắc -> Hoàn hảo
    if (matchedCount >= 3 || totalMatchedDice >= 3) {
      return {
        title: "HOÀN HẢO",
        subtitle: "Trúng cả 3 xúc xắc — Thắng tuyệt đối!",
        badge: "🎉 Hoàn Hảo",
        icon: Crown,
        iconColor: "text-amber-300",
        iconBg:
          "bg-amber-500/20 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.5)]",
        glowGradient: "from-amber-500/25 via-emerald-500/20 to-transparent",
        modalBorder:
          "border-amber-400/70 shadow-[0_0_35px_rgba(245,158,11,0.35)]",
        netBadgeBg:
          "bg-emerald-950/90 border-emerald-400/60 text-emerald-300",
        buttonGradient:
          "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 hover:brightness-110 shadow-amber-500/40",
      };
    }

    // 4. Trúng 2 cửa và có lãi -> Thắng 2 cửa
    if (matchedCount >= 2 || totalMatchedDice >= 2) {
      return {
        title: "THẮNG 2 CỬA",
        subtitle: "Dự đoán chính xác 2 mặt xúc xắc có lãi lớn!",
        badge: "🌟 Thắng 2 Cửa",
        icon: Star,
        iconColor: "text-amber-400",
        iconBg:
          "bg-amber-500/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.4)]",
        glowGradient: "from-amber-500/20 via-orange-500/15 to-transparent",
        modalBorder:
          "border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)]",
        netBadgeBg: "bg-emerald-950/80 border-emerald-500/50 text-emerald-300",
        buttonGradient:
          "bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:from-amber-400 hover:to-amber-300 shadow-amber-500/30",
      };
    }

    // 5. Trúng 1 cửa và có lãi -> Thắng cược
    return {
      title: "THẮNG CƯỢC",
      subtitle: "Dự đoán chính xác — Thu về lợi nhuận!",
      badge: "✨ Thắng Cược",
      icon: Trophy,
      iconColor: "text-emerald-400",
      iconBg:
        "bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
      glowGradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      modalBorder:
        "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
      netBadgeBg: "bg-emerald-950/80 border-emerald-500/50 text-emerald-300",
      buttonGradient:
        "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/30",
    };
  })();

  const IconComponent = config.icon;

  return (
    <GameResultModal status={round.net > 0 ? "success" : round.net < 0 ? "danger" : "warning"}
      onClose={onClose}
      closeOnBackdrop
      labelledBy="bau-cua-result-title"
    >
          <ResultHero className="relative flex-col items-center overflow-hidden text-center">
          {/* Top Atmospheric Glow */}

          {/* Close button */}
          <ModalButton variant="icon"
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3"
            aria-label="Đóng kết quả Bầu Cua"
          >
            <X className="w-4 h-4" />
          </ModalButton>

          {/* Header Icon & Main Title */}
          <div className="relative flex flex-col items-center text-center space-y-2 pt-1">
            <div
              className="modal-status-icon"
            >
              <IconComponent className={`w-7 h-7 ${config.iconColor}`} />
            </div>

            <div>
              <h3 id="bau-cua-result-title" className="modal-title">
                {config.title}
              </h3>
            </div>
          </div>
          </ResultHero>

          <OverlayBody>
          {/* 3 Result Dice Showcase */}
          <div className="modal-section">
            <div className="grid grid-cols-3 gap-2">
              {round.result.map((sym, idx) => {
                const info = BAU_CUA_SYMBOL_INFO[sym];
                const betOnThis = round.bets[sym] || 0;
                const isMatchedBet = betOnThis > 0;

                return (
                  <div
                    key={idx}
                    className={`relative rounded-xl border p-2.5 flex flex-col items-center justify-center bg-gradient-to-b ${
                      info.bgGradient
                    }  ${
                      isMatchedBet
                        ? "border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/40"
                        : "border-slate-800"
                    }`}
                  >
                    <span className="text-3xl filter drop-shadow-sm leading-none">
                      {info.emoji}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Placed Bets Comparison Section */}
          {placedBets.length > 0 && (
            <div className="modal-section space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--modal-muted)] px-0.5">
                <span>CỬA BẠN ĐÃ ĐẶT:</span>
                <span className="text-xs text-[var(--modal-muted)] font-normal">
                  {placedBets.length} cửa đã cược
                </span>
              </div>

              <div className="space-y-1.5">
                {placedBets.map((item) => (
                  <div
                    key={item.sym}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                      item.matchCount > 0
                        ? "bg-emerald-950/40 border-emerald-500/40 text-[var(--modal-text)]"
                        : "modal-section text-[var(--modal-muted)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl filter drop-shadow-sm">
                        {item.info.emoji}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 leading-tight">
                          {item.matchCount > 0 ? (
                            <span className="px-1.5 py-0.2 rounded-md text-xs font-semibold bg-emerald-500/20 text-[var(--modal-success)] border border-emerald-500/30 uppercase">
                              Trúng x{item.matchCount}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded-md text-xs font-semibold bg-slate-800 text-[var(--modal-muted)] border border-slate-700/60">
                              Không trúng
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[var(--modal-muted)] mt-0.5 block">
                          Cược:{" "}
                          <strong className="text-[var(--modal-reward)]">
                            {item.bet.toLocaleString("vi-VN")} Vàng
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-semibold">
                      {item.matchCount > 0 ? (
                        <div className="text-[var(--modal-success)] text-xs">
                          +{item.winPayout.toLocaleString("vi-VN")} V
                        </div>
                      ) : (
                        <div className="text-[var(--modal-danger)] text-xs">
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
          <div className="modal-section space-y-2 text-xs">
            <div className="flex justify-between items-center text-[var(--modal-muted)]">
              <span>Tổng tiền đã cược:</span>
              <span className="font-semibold text-[var(--modal-text)]">
                {round.totalBet.toLocaleString("vi-VN")} Vàng
              </span>
            </div>

            <div className="flex justify-between items-center text-[var(--modal-muted)]">
              <span>Tổng tiền thu về:</span>
              <span className="font-semibold text-[var(--modal-text)]">
                {round.totalReturn.toLocaleString("vi-VN")} Vàng
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="font-bold text-[var(--modal-text)]">Kết quả ròng:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.netBadgeBg}`}
              >
                {round.net > 0 ? `+${round.net.toLocaleString("vi-VN")}` : round.net.toLocaleString("vi-VN")}{" "}
                Vàng
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-[var(--modal-text)]">
              <span className="flex items-center gap-1 font-semibold">
                <Coins className="w-3.5 h-3.5 text-[var(--modal-reward)]" />
                Số dư hiện tại:
              </span>
              <span className="font-semibold text-[var(--modal-reward)]">
                {round.postGold.toLocaleString("vi-VN")} Vàng
              </span>
            </div>
          </div>
          </OverlayBody>

          {/* Action CTAs */}
          <ModalActions className="flex items-center">
            {round.postGold === 0 ? (
              <>
                <ModalButton variant="ghost"
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                  }}
                  className="flex-1"
                >
                  Đóng
                </ModalButton>
                <ModalButton variant="primary"
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                    onNavigateTab("tang_gia");
                  }}
                >
                  <Sprout className="w-4 h-4" />
                  <span>Đến Tăng Gia Kiếm Vàng</span>
                </ModalButton>
              </>
            ) : (
              <ModalButton variant="primary"
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                }}
                className="w-full"
              >
                <span>TIẾP TỤC CHƠI</span>
                <ArrowRight className="w-4 h-4" />
              </ModalButton>
            )}
          </ModalActions>
    </GameResultModal>
  );
};
