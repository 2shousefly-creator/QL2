import React from "react";
import { Trophy, XCircle, RotateCcw, ListCheck, CheckCircle2, AlertCircle, Award, Target, Zap, Clock, ShieldCheck } from "lucide-react";
import { TrainingDifficulty } from "../../game/types";
import { SignalCommandResult } from "../../game/training/signalCommand/signalCommandTypes";
import { DailyTrainingClaimResult } from "../../game/training/dailyTrainingReward";
import { getSignalCommandConfig } from "../../game/training/signalCommand/signalCommandConfig";
import { soundManager } from "../../game/audio";

type SignalCommandResultProps = {
  difficulty: TrainingDifficulty;
  result: SignalCommandResult;
  claimResult: DailyTrainingClaimResult | null;
  onReplay: () => void;
  onChangeDifficulty: () => void;
  onExit: () => void;
};

export const SignalCommandResultModal: React.FC<SignalCommandResultProps> = ({
  difficulty,
  result,
  claimResult,
  onReplay,
  onChangeDifficulty,
  onExit,
}) => {
  const config = getSignalCommandConfig(difficulty);
  const isVictory = result.victory;

  const formattedTime = (result.elapsedRealMs / 1000).toFixed(1);
  const accuracyPct = Math.round(result.accuracy * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 my-auto">
        {/* Banner Header */}
        <div className="flex flex-col items-center text-center gap-2">
          {isVictory ? (
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/10">
              <XCircle className="w-8 h-8" />
            </div>
          )}

          <div>
            <h2 className="text-xl font-extrabold text-slate-100">
              {isVictory ? "Mật Lệnh Hoàn Thành!" : "Mật Lệnh Chưa Hoàn Thành"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mật Lệnh Tín Hiệu · <span className="text-cyan-400 font-bold">{config.label}</span>
            </p>
          </div>
        </div>

        {/* Claim Result Banner */}
        {isVictory && (
          <div className="w-full">
            {claimResult?.status === "claimed" ? (
              <div className="bg-emerald-950/80 border border-emerald-500/40 p-3.5 rounded-2xl flex flex-col gap-1 text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-extrabold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Chiến thắng đầu tiên hôm nay!</span>
                </div>
                <div className="text-2xl font-black text-amber-400 my-0.5">
                  +{claimResult.nominalRewardXp} XP
                </div>
                <div className="text-[11px] text-emerald-200/80">
                  Phần thưởng đã được cộng trực tiếp vào thanh cấp bậc của bạn.
                </div>
              </div>
            ) : claimResult?.status === "already_claimed" ? (
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex flex-col gap-1 text-center text-xs">
                <div className="flex items-center justify-center gap-1.5 text-slate-300 font-bold">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Chiến thắng luyện tập tự do</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Phần thưởng thắng đầu tiên hôm nay đã được nhận trước đó. Lượt này không cộng thêm XP.
                </p>
              </div>
            ) : claimResult?.status === "xp_bar_full_not_consumed" ? (
              <div className="bg-amber-950/50 border border-amber-500/30 p-3 rounded-2xl flex flex-col gap-1 text-center text-xs">
                <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Thanh XP hiện đã đầy</span>
                </div>
                <p className="text-[11px] text-amber-200/80">
                  Quyền nhận thưởng hôm nay chưa bị tiêu hao. Bạn có thể thăng cấp rồi quay lại chiến thắng để nhận XP!
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Score & Key Stats Grid */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-xs text-slate-400 font-semibold">Điểm Đánh Giá Run</span>
            <span className="text-lg font-black text-cyan-400 font-mono">{result.score} / 1000</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ListCheck className="w-3 h-3 text-cyan-400" />
                Vòng hoàn thành
              </span>
              <span className="text-sm font-bold text-slate-100 font-mono">
                {result.completedRounds} / {result.totalRounds}
              </span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Target className="w-3 h-3 text-emerald-400" />
                Độ chính xác
              </span>
              <span className="text-sm font-bold text-slate-100 font-mono">
                {accuracyPct}%
              </span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Thời gian thực hiện
              </span>
              <span className="text-sm font-bold text-slate-100 font-mono">
                {formattedTime}s
              </span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-purple-400" />
                Chuỗi dài nhất
              </span>
              <span className="text-sm font-bold text-slate-100 font-mono">
                {result.longestSequenceCompleted} tín hiệu
              </span>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-800/80">
            <span>Tín hiệu đôi: <strong className="text-slate-200">{result.pairTokensCompleted}</strong></span>
            <span>Vòng Ngược: <strong className="text-slate-200">{result.reverseRoundsCompleted}</strong></span>
            <span>Sửa lỗi đã dùng: <strong className="text-slate-200">{result.recoveriesUsed}</strong></span>
          </div>

          {result.perfectWin && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-center text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>PERFECT RUN — Không một sai sót!</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onReplay();
            }}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Chơi Lại ({config.label})
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onChangeDifficulty();
              }}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all text-center"
            >
              Đổi Độ Khó
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onExit();
              }}
              className="py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-all text-center"
            >
              Về Khu Huấn Luyện
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
