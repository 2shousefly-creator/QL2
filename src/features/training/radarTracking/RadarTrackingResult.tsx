import React from "react";
import { Trophy, RefreshCw, LogOut, CheckCircle2, XCircle, Award, Sparkles, ShieldCheck } from "lucide-react";
import { TrainingDifficulty } from "../../../game/types";
import { DailyTrainingClaimResult } from "../../../game/training/dailyTrainingReward";
import { RadarRunResult } from "../../../game/training/radarTracking/radarTypes";
import { soundManager } from "../../../game/audio";

type Props = {
  difficulty: TrainingDifficulty;
  result: RadarRunResult;
  claimResult: DailyTrainingClaimResult | null;
  onReplay: () => void;
  onChangeDifficulty: () => void;
  onExit: () => void;
};

export const RadarTrackingResultModal: React.FC<Props> = ({
  difficulty,
  result,
  claimResult,
  onReplay,
  onChangeDifficulty,
  onExit,
}) => {
  const diffLabel = difficulty === "easy" ? "Dễ" : difficulty === "medium" ? "Vừa" : "Khó";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-slate-100 text-center">
        {/* Banner header */}
        <div className="flex flex-col items-center gap-2 pt-2">
          {result.victory ? (
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/30">
              <XCircle className="w-8 h-8" />
            </div>
          )}

          <h2 className="font-black text-xl text-slate-100 mt-1">
            {result.victory ? "Hoàn Thành Thử Thách!" : "Thất Bại Lượt Theo Dõi"}
          </h2>
          <p className="text-xs text-slate-400">
            Độ khó: <span className="font-bold text-emerald-300">{diffLabel}</span>
          </p>
        </div>

        {/* Claim Reward Banner */}
        {claimResult && claimResult.status === "claimed" && (
          <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/40 rounded-2xl p-3 flex items-center gap-3 text-left">
            <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold text-amber-300 block">
                Thưởng Hằng Ngày +{claimResult.nominalRewardXp} XP
              </span>
              <span className="text-[11px] text-slate-300">
                Đã ghi nhận phần thưởng huấn luyện hôm nay!
              </span>
            </div>
          </div>
        )}

        {/* Stats Summary Table */}
        <div className="grid grid-cols-2 gap-2.5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-slate-400 font-semibold">Tổng Điểm</span>
            <span className="font-black text-lg text-amber-400 mt-0.5">
              {result.score}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-slate-400 font-semibold">Tỷ Lệ Chính Xác</span>
            <span className="font-black text-lg text-cyan-400 mt-0.5">
              {result.accuracy}%
            </span>
          </div>

          <div className="flex flex-col items-center pt-2 border-t border-slate-800">
            <span className="text-slate-400 font-semibold">Vòng Hoàn Thành</span>
            <span className="font-extrabold text-slate-200 mt-0.5">
              {result.completedRounds} / {result.totalRounds}
            </span>
          </div>

          <div className="flex flex-col items-center pt-2 border-t border-slate-800">
            <span className="text-slate-400 font-semibold">Cứu Sinh Đã Dùng</span>
            <span className="font-extrabold text-slate-200 mt-0.5">
              {result.recoveriesUsed} lần
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onReplay();
            }}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 border border-emerald-400/30 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Thử Lại Độ Khó Này</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onChangeDifficulty();
              }}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl border border-slate-700 transition-all"
            >
              Đổi Độ Khó
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onExit();
              }}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Thoát</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
