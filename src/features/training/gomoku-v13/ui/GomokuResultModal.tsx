import React from "react";
import { Trophy, RefreshCw, XCircle, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { GomokuResult } from "../domain/gomokuTypes";
import { soundManager } from "../../../../game/audio";

interface GomokuResultModalProps {
  result: GomokuResult;
  earnedXp: number;
  onRestart: () => void;
  onExit: () => void;
}

export const GomokuResultModal: React.FC<GomokuResultModalProps> = ({
  result,
  earnedXp,
  onRestart,
  onExit,
}) => {
  const isPlayerWon = result.outcome === "player_win";
  const isResigned = result.outcome === "resigned";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-5 relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center gap-2">
          {isPlayerWon ? (
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
          ) : isResigned ? (
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <XCircle className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <XCircle className="w-8 h-8" />
            </div>
          )}

          <h2 className="text-xl font-black text-slate-100">
            {isPlayerWon
              ? "Chiến Thắng!"
              : isResigned
              ? "Đã Đầu Hàng"
              : "Thất Bại"}
          </h2>
          <p className="text-xs text-slate-400">
            {isPlayerWon
              ? "Bạn đã hoàn thành chuỗi 5 quân thắng máy"
              : isResigned
              ? "Trận đấu dừng do bạn đầu hàng"
              : "Máy đã tạo chuỗi 5 quân thắng trước"}
          </p>
        </div>

        {/* Stats Summary */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Tổng số nước đi:</span>
            <span className="font-bold text-slate-100">{result.totalMoves} nước</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Độ khó:</span>
            <span className="font-bold uppercase text-amber-400">
              {result.difficulty === "easy" ? "Dễ" : result.difficulty === "medium" ? "Vừa" : "Khó"}
            </span>
          </div>

          {earnedXp > 0 && (
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-emerald-400 font-extrabold text-sm">
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Thưởng Thắng:
              </span>
              <span>+{earnedXp} XP</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-[0.99] transition-all"
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
            className="w-full py-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Về Sảnh Huấn Luyện
          </button>
        </div>
      </div>
    </div>
  );
};
