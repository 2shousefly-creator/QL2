import React from "react";
import {
  Trophy,
  RotateCcw,
  Sliders,
  LogOut,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  RefreshCw,
  Award,
} from "lucide-react";
import { TrainingDifficulty } from "../../../game/types";
import { FormationResult } from "../../../game/training/formationAssembly/formationTypes";
import { DailyTrainingClaimResult } from "../../../game/training/dailyTrainingReward";
import { FORMATION_CONFIGS } from "../../../game/training/formationAssembly/formationConfig";
import { soundManager } from "../../../game/audio";

type FormationAssemblyResultProps = {
  difficulty: TrainingDifficulty;
  result: FormationResult;
  claimResult: DailyTrainingClaimResult | null;
  onReplay: () => void;
  onChangeDifficulty: () => void;
  onExit: () => void;
};

export const FormationAssemblyResultModal: React.FC<FormationAssemblyResultProps> = ({
  difficulty,
  result,
  claimResult,
  onReplay,
  onChangeDifficulty,
  onExit,
}) => {
  const config = FORMATION_CONFIGS[difficulty];

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col gap-5 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Banner Status */}
        <div className="flex flex-col items-center text-center gap-2">
          {result.victory ? (
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20">
              <XCircle className="w-8 h-8" />
            </div>
          )}

          <div>
            <h2 className="font-black text-xl text-slate-100">
              {result.victory ? "CHIẾN THẮNG HUẤN LUYỆN!" : "ĐỘI HÌNH CHƯA HOÀN THÀNH"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Xếp Đội Hình · Mức độ <strong>{config.label}</strong>
            </p>
          </div>
        </div>

        {/* Daily Reward Claim Card */}
        {result.victory && (
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-extrabold text-xs text-amber-300">
                  Phần Thưởng Huấn Luyện
                </span>
              </div>
              <span className="text-[10px] text-slate-400">1 lần / ngày</span>
            </div>

            {claimResult?.status === "claimed" ? (
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                <span className="text-xs font-bold text-slate-200">
                  Thắng đầu tiên hôm nay!
                </span>
                <span className="font-black text-sm text-amber-400">
                  +{claimResult.nominalRewardXp} XP
                </span>
              </div>
            ) : claimResult?.status === "already_claimed" ? (
              <p className="text-xs text-slate-400 italic">
                Bạn đã nhận phần thưởng huấn luyện hôm nay. Lượt thắng này ghi nhận thành tích (0 XP).
              </p>
            ) : claimResult?.status === "xp_bar_full_not_consumed" ? (
              <p className="text-xs text-amber-400/90 italic">
                Thanh XP đang đầy nên chưa thể nhận thưởng. Quyền thưởng vẫn còn sau khi thăng cấp!
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Lượt này hoàn thành nhiệm vụ luyện tập.
              </p>
            )}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[11px] text-slate-400">Điểm Số</span>
            <span className="font-black text-xl text-amber-400 mt-0.5">
              {result.score}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[11px] text-slate-400">Vòng Hoàn Thành</span>
            <span className="font-black text-xl text-cyan-400 mt-0.5">
              {result.completedRounds} / {result.totalRounds}
            </span>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3 flex flex-col gap-2 text-xs text-slate-300">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Thời Gian Trận</span>
            </div>
            <span className="font-bold text-slate-100">{formatTime(result.elapsedRealMs)}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Số Lần Đổi Chỗ (Swap)</span>
            </div>
            <span className="font-bold text-slate-100">{result.swapsPerformed}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Số Lần Xoay Quân</span>
            </div>
            <span className="font-bold text-slate-100">{result.rotationsPerformed}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Award className="w-3.5 h-3.5" />
              <span>Lượt Sửa Đã Dùng</span>
            </div>
            <span className="font-bold text-slate-100">
              {result.recoveriesUsed} / {config.recoveryCharges}
            </span>
          </div>
        </div>

        {result.perfectWin && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-emerald-300 font-extrabold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>PERFECT WIN — Hoàn Hảo Không Lỗi!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onReplay();
            }}
            className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>CHƠI LẠI ({config.label})</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onChangeDifficulty();
              }}
              className="py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Đổi Độ Khó</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onExit();
              }}
              className="py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Về Sảnh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
