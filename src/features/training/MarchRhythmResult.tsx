import React from "react";
import { Award, RotateCcw, ArrowLeft, CheckCircle2, XCircle, Zap, Activity } from "lucide-react";
import { TrainingDifficulty } from "../../game/types";
import { MarchRhythmGameResult } from "../../game/training/marchRhythmJudgement";
import { TRAINING_DIFFICULTIES } from "../../game/training/trainingConfig";
import { DailyTrainingClaimResult } from "../../game/training/dailyTrainingReward";
import { soundManager } from "../../game/audio";
import { AppModal, OverlayBody, OverlayFooter, OverlayHeader } from "../../components/overlay/AppOverlay";

type MarchRhythmResultProps = {
  difficulty: TrainingDifficulty;
  result: MarchRhythmGameResult;
  claimResult: DailyTrainingClaimResult | null;
  onReplay: () => void;
  onChangeDifficulty: () => void;
  onExit: () => void;
};

export const MarchRhythmResult: React.FC<MarchRhythmResultProps> = ({
  difficulty,
  result,
  claimResult,
  onReplay,
  onChangeDifficulty,
  onExit,
}) => {
  const diffConfig = TRAINING_DIFFICULTIES[difficulty];
  const isVictory = result.victory;

  let rewardMessage = "";
  let rewardBadge = "";

  if (isVictory) {
    if (claimResult?.status === "claimed") {
      const nominal = claimResult.nominalRewardXp;
      const credited = Math.round(claimResult.creditedXpTicks / 600000);

      if (credited === nominal) {
        rewardMessage = `Chiến thắng đầu tiên hôm nay! Bạn nhận được +${credited} XP.`;
        rewardBadge = `+${credited} XP`;
      } else {
        rewardMessage = `Phần thưởng danh nghĩa ${nominal} XP. Bạn nhận được +${credited} XP thực tế vì thanh đã gần đầy.`;
        rewardBadge = `+${credited} XP`;
      }
    } else if (claimResult?.status === "already_claimed") {
      rewardMessage = "Chiến thắng luyện tập! Phần thưởng hôm nay đã được nhận trước đó (0 XP).";
      rewardBadge = "Luyện tập · 0 XP";
    } else if (claimResult?.status === "xp_bar_full_not_consumed") {
      rewardMessage = "Thanh XP hiện đã đầy nên chưa thể cộng thêm XP. Quyền thưởng hôm nay chưa bị tiêu hao!";
      rewardBadge = "0 XP (Thanh đầy)";
    } else {
      rewardMessage = "Chiến thắng lượt chơi luyện tập.";
      rewardBadge = "0 XP";
    }
  } else {
    rewardMessage = "Chưa đạt điều kiện chiến thắng. Quyền nhận thưởng hôm nay vẫn được giữ nguyên!";
    rewardBadge = "0 XP";
  }

  return (
    <AppModal
      onClose={onExit}
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy="march-rhythm-result-title"
      panelClassName="max-w-md select-none border-slate-700 bg-slate-900 text-slate-100"
    >
        {/* Banner Header */}
        <OverlayHeader className="flex flex-col items-center gap-2 border-slate-800 text-center">
          {isVictory ? (
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
              <XCircle className="w-10 h-10" />
            </div>
          )}

          <h2 id="march-rhythm-result-title" className="text-xl font-extrabold tracking-tight">
            {isVictory ? (
              <span className="text-emerald-400">Hoàn Thành Nhiệm Vụ</span>
            ) : (
              <span className="text-rose-400">Chưa Đạt Yêu Cầu</span>
            )}
          </h2>
          <span className="text-xs text-slate-400">
            Mức độ: <strong className="text-amber-400">{diffConfig.label}</strong>
          </span>
        </OverlayHeader>

        <OverlayBody className="flex flex-col gap-4">
        {/* XP Reward Status Box */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
          isVictory && claimResult?.status === "claimed"
            ? "bg-amber-500/10 border-amber-500/40 text-amber-200"
            : "bg-slate-950/80 border-slate-800 text-slate-300"
        }`}>
          <div className="flex items-center gap-2 text-xs">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="leading-tight">{rewardMessage}</span>
          </div>
          {rewardBadge && (
            <span className="text-xs font-extrabold font-mono text-amber-400 bg-slate-900 px-2.5 py-1 rounded-full border border-amber-500/30 shrink-0">
              {rewardBadge}
            </span>
          )}
        </div>

        {/* Key Stats Overview */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400">Điểm số</span>
            <div className="text-base font-bold font-mono text-amber-400">{result.score}</div>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400">Chính xác</span>
            <div className="text-base font-bold font-mono text-emerald-400">{result.accuracy}%</div>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400">Combo cao nhất</span>
            <div className="text-base font-bold font-mono text-cyan-400">{result.maxCombo}</div>
          </div>
        </div>

        {/* Detailed Judgement Breakdown */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chi tiết lượt đánh</span>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="flex justify-between p-1.5 bg-slate-900/80 rounded-lg">
              <span className="text-amber-400 font-bold">Hoàn hảo:</span>
              <span>{result.perfectCount}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-900/80 rounded-lg">
              <span className="text-emerald-400 font-bold">Tốt:</span>
              <span>{result.goodCount}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-900/80 rounded-lg">
              <span className="text-rose-400 font-bold">Trượt:</span>
              <span>{result.missCount}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-900/80 rounded-lg">
              <span className="text-slate-400 font-bold">Chạm nhầm:</span>
              <span>{result.strayInputCount}</span>
            </div>
          </div>

          {(result.holdsAttempted > 0 || result.chordsAttempted > 0) && (
            <div className="pt-1 border-t border-slate-800/80 flex justify-around text-[11px] text-slate-300">
              {result.holdsAttempted > 0 && (
                <span>Giữ: <strong className="text-amber-400">{result.holdCompletionRate}%</strong> ({result.holdsCompleted}/{result.holdsAttempted})</span>
              )}
              {result.chordsAttempted > 0 && (
                <span>Chạm đồng thời: <strong className="text-amber-400">{result.chordCompletionRate}%</strong> ({result.chordsCompleted}/{result.chordsAttempted})</span>
              )}
            </div>
          )}
        </div>
        </OverlayBody>

        {/* Action Buttons */}
        <OverlayFooter className="flex flex-col gap-2 border-slate-800 bg-slate-900">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onReplay();
            }}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Chơi Lại ({diffConfig.label})
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onChangeDifficulty();
              }}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Đổi Độ Khó
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onExit();
              }}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              Về Khu Huấn Luyện
            </button>
          </div>
        </OverlayFooter>
    </AppModal>
  );
};
