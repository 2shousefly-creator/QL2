import React from "react";
import "./gomokuPaper.css";
import { Trophy, RefreshCw, XCircle, ArrowLeft, Sparkles } from "lucide-react";
import { GomokuResult } from "../domain/gomokuTypes";
import { soundManager } from "../../../../game/audio";
import { AppModal, OverlayBody, OverlayFooter, OverlayHeader } from "../../../../components/overlay/AppOverlay";

interface GomokuResultModalProps {
  result: GomokuResult;
  earnedXp: number;
  reducedMotion?: boolean;
  onRestart: () => void;
  onExit: () => void;
}

export const GomokuResultModal: React.FC<GomokuResultModalProps> = ({
  result,
  earnedXp,
  reducedMotion = false,
  onRestart,
  onExit,
}) => {
  const isPlayerWon = result.outcome === "player_win";
  const isResigned = result.outcome === "resigned";

  return (
    <AppModal
      onClose={onExit}
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy="gomoku-result-title"
      overlayClassName={`gomoku-result-overlay${reducedMotion ? " is-reduced-motion" : ""}`}
      panelClassName="gomoku-paper-dialog gomoku-result-panel max-w-sm border-[#d8cbb3] bg-[#faf5e9] text-center text-[#2f2922]"
    >
        {/* Glow Header */}
        <OverlayHeader className="relative flex flex-col items-center gap-2 overflow-hidden border-[#d8cbb3] text-center">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#ebd8a9]/40 rounded-full blur-3xl pointer-events-none" />
          {isPlayerWon ? (
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[#946b22] shadow-lg shadow-amber-500/20">
              <Trophy className="w-8 h-8" />
            </div>
          ) : isResigned ? (
            <div className="w-16 h-16 rounded-2xl bg-[#eee4d1] border border-[#d8cbb3] flex items-center justify-center text-[#746653]">
              <XCircle className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-[#b33e3e]">
              <XCircle className="w-8 h-8" />
            </div>
          )}

          <h2 id="gomoku-result-title" className="relative text-xl font-black text-[#2f2922]">
            {isPlayerWon
              ? "Chiến Thắng!"
              : isResigned
              ? "Đã Đầu Hàng"
              : "Thất Bại"}
          </h2>
          <p className="text-xs text-[#746653]">
            {isPlayerWon
              ? "Bạn đã hoàn thành chuỗi 5 quân thắng máy"
              : isResigned
              ? "Trận đấu dừng do bạn đầu hàng"
              : "Máy đã tạo chuỗi 5 quân thắng trước"}
          </p>
        </OverlayHeader>

        <OverlayBody className="space-y-5">
        {/* Stats Summary */}
        <div className="bg-[#eee4d1]/60 p-3.5 rounded-2xl border border-[#d8cbb3] space-y-2 text-xs">
          <div className="flex justify-between text-[#574c3c]">
            <span>Tổng số nước đi:</span>
            <span className="font-bold text-[#2f2922]">{result.totalMoves} nước</span>
          </div>
          <div className="flex justify-between text-[#574c3c]">
            <span>Độ khó:</span>
            <span className="font-bold uppercase text-[#946b22]">
              {result.difficulty === "easy" ? "Dễ" : result.difficulty === "medium" ? "Vừa" : "Khó"}
            </span>
          </div>

          {earnedXp > 0 && (
            <div className="pt-2 border-t border-[#d8cbb3] flex justify-between items-center text-[#387448] font-extrabold text-sm">
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Thưởng Thắng:
              </span>
              <span>+{earnedXp} XP</span>
            </div>
          )}
        </div>
        </OverlayBody>

        {/* Action Buttons */}
        <OverlayFooter className="flex-col space-y-2 border-[#d8cbb3] bg-[#faf5e9]">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full py-3 rounded-2xl bg-amber-500 text-[#2f2922] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-[0.99] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Thách Đấu Trận Mới
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onExit();
            }}
            className="w-full py-3 rounded-2xl bg-[#eee4d1] text-[#574c3c] hover:text-[#2f2922] hover:bg-[#e4d6bc] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Về Sảnh Huấn Luyện
          </button>
        </OverlayFooter>
    </AppModal>
  );
};
