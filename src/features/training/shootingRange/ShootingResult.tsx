import React from "react";
import { Trophy, RefreshCw, LogOut, XCircle, Sparkles, Crosshair, Target } from "lucide-react";
import { TrainingDifficulty } from "../../../game/types";
import { DailyTrainingClaimResult } from "../../../game/training/dailyTrainingReward";
import { ShootingRunResult } from "../../../game/training/shootingRange/shootingTypes";
import { SHOOTING_DIFFICULTY_CONFIGS } from "../../../game/training/shootingRange/shootingConfig";
import { soundManager } from "../../../game/audio";
import { AppModal, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";

type ShootingResultProps = {
  difficulty: TrainingDifficulty;
  result: ShootingRunResult;
  claimResult: DailyTrainingClaimResult | null;
  onReplay: () => void;
  onChangeDifficulty: () => void;
  onExit: () => void;
};

export const ShootingResult: React.FC<ShootingResultProps> = ({
  difficulty,
  result,
  claimResult,
  onReplay,
  onChangeDifficulty,
  onExit,
}) => {
  const config = SHOOTING_DIFFICULTY_CONFIGS[difficulty];
  const diffLabel = config.label;
  const accuracyPct = Math.round(result.accuracy * 100);

  const reqScore = config.minScoreToWin;
  const reqAccPct = Math.round(config.minAccuracyToWin * 100);

  const missingScore = result.score < reqScore;
  const missingAcc = accuracyPct < reqAccPct;

  return (
    <AppModal
      onClose={onExit}
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy="shooting-result-title"
      panelClassName="max-w-sm border-amber-500/40 bg-slate-900 text-center text-slate-100"
    >
        {/* Banner header */}
        <OverlayHeader className="flex flex-col items-center gap-2 border-slate-800 text-center">
          {result.victory ? (
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/30">
              <XCircle className="w-8 h-8" />
            </div>
          )}

          <h2 id="shooting-result-title" className="font-black text-xl text-slate-100 mt-1">
            {result.victory ? "ĐẠT YÊU CẦU" : "CHƯA ĐẠT"}
          </h2>
          <p className="text-xs text-slate-400">
            Hoàn thành Bắn Súng · <span className="font-bold text-amber-300">{diffLabel}</span>
          </p>
        </OverlayHeader>

        <OverlayBody className="flex flex-col gap-4">
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

        {/* Requirements info if not victorious */}
        {!result.victory && (
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3 text-xs text-rose-300 text-left flex flex-col gap-1">
            <span className="font-bold">Yêu cầu đạt chuẩn:</span>
            <div className="flex justify-between">
              <span>• Điểm: {reqScore} điểm</span>
              <span className={missingScore ? "font-extrabold text-rose-400" : "text-emerald-400 font-bold"}>
                ({result.score}/{reqScore})
              </span>
            </div>
            <div className="flex justify-between">
              <span>• Độ chính xác: {reqAccPct}%</span>
              <span className={missingAcc ? "font-extrabold text-rose-400" : "text-emerald-400 font-bold"}>
                ({accuracyPct}%/{reqAccPct}%)
              </span>
            </div>
          </div>
        )}

        {/* Stats Summary Table */}
        <div className="grid grid-cols-2 gap-2.5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-amber-400" /> Điểm Số
            </span>
            <span className="font-black text-lg text-amber-400 mt-0.5">
              {result.score}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> Chính Xác
            </span>
            <span className="font-black text-lg text-cyan-400 mt-0.5">
              {accuracyPct}%
            </span>
          </div>

          <div className="flex flex-col items-center pt-2 border-t border-slate-800">
            <span className="text-slate-400 font-semibold">Trúng Đạn</span>
            <span className="font-extrabold text-slate-200 mt-0.5">
              {result.hits} / {result.shotsFired} phát
            </span>
          </div>

          <div className="flex flex-col items-center pt-2 border-t border-slate-800">
            <span className="text-slate-400 font-semibold">Bia Đã Phá</span>
            <span className="font-extrabold text-slate-200 mt-0.5">
              {result.targetsDestroyed} / {result.targetsSpawned}
            </span>
          </div>
        </div>
        </OverlayBody>

        {/* Actions */}
        <OverlayFooter className="flex flex-col gap-2 border-slate-800 bg-slate-900">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onReplay();
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Chơi Lại</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onChangeDifficulty();
              }}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl border border-slate-700 transition-all cursor-pointer"
            >
              Đổi Độ Khó
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onExit();
              }}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Về Huấn Luyện</span>
            </button>
          </div>
        </OverlayFooter>
    </AppModal>
  );
};
