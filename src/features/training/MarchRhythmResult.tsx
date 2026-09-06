import React from "react";
import { Activity, ArrowLeft, CheckCircle2, RotateCcw, XCircle, Zap } from "lucide-react";
import { TrainingDifficulty } from "../../game/types";
import { MarchRhythmGameResult } from "../../game/training/marchRhythmJudgement";
import { TRAINING_DIFFICULTIES } from "../../game/training/trainingConfig";
import { DailyTrainingClaimResult } from "../../game/training/dailyTrainingReward";
import { soundManager } from "../../game/audio";
import { GameResultModal, ModalActions, ModalButton, OverlayBody, ResultHero } from "../../components/overlay/AppOverlay";

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
    <GameResultModal status={result.victory ? "success" : "danger"}
      onClose={onExit}
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy="march-rhythm-result-title"
    >
        {/* Banner Header */}
        <ResultHero className="flex flex-col items-center text-center">
          {isVictory ? (
            <div className="modal-status-icon">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : (
            <div className="modal-status-icon">
              <XCircle className="w-10 h-10" />
            </div>
          )}

          <h2 id="march-rhythm-result-title" className="modal-title">
            {isVictory ? (
              <span className="text-[var(--modal-success)]">Hoàn Thành Nhiệm Vụ</span>
            ) : (
              <span className="text-[var(--modal-danger)]">Chưa Đạt Yêu Cầu</span>
            )}
          </h2>
          <span className="text-xs text-[var(--modal-muted)]">
            Mức độ: <strong className="text-[var(--modal-reward)]">{diffConfig.label}</strong>
          </span>
        </ResultHero>

        <OverlayBody className="flex flex-col">
        {/* XP Reward Status Box */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
          isVictory && claimResult?.status === "claimed"
            ? "bg-amber-500/10 border-amber-500/40 text-[var(--modal-reward)]"
            : "modal-section text-[var(--modal-text)]"
        }`}>
          <div className="flex items-center gap-2 text-xs">
            <Zap className="w-4 h-4 text-[var(--modal-reward)] shrink-0" />
            <span className="leading-tight">{rewardMessage}</span>
          </div>
          {rewardBadge && (
            <span className="text-xs font-semibold font-mono text-[var(--modal-reward)] bg-slate-900 px-2.5 py-1 rounded-full border border-amber-500/30 shrink-0">
              {rewardBadge}
            </span>
          )}
        </div>

        {/* Key Stats Overview */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="modal-section">
            <span className="text-xs text-[var(--modal-muted)]">Điểm số</span>
            <div className="text-base font-bold font-mono text-[var(--modal-reward)]">{result.score}</div>
          </div>
          <div className="modal-section">
            <span className="text-xs text-[var(--modal-muted)]">Chính xác</span>
            <div className="text-base font-bold font-mono text-[var(--modal-success)]">{result.accuracy}%</div>
          </div>
          <div className="modal-section">
            <span className="text-xs text-[var(--modal-muted)]">Combo cao nhất</span>
            <div className="text-base font-bold font-mono text-[var(--modal-info)]">{result.maxCombo}</div>
          </div>
        </div>

        {/* Detailed Judgement Breakdown */}
        <div className="modal-section flex flex-col gap-2 text-xs">
          <span className="text-xs font-bold text-[var(--modal-muted)] uppercase tracking-wider">Chi tiết lượt đánh</span>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex justify-between p-1.5 bg-slate-900/80 rounded-lg">
              <span className="text-[var(--modal-reward)] font-bold">Hoàn hảo:</span>
              <span>{result.perfectCount}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-900/80 rounded-lg">
              <span className="text-[var(--modal-success)] font-bold">Tốt:</span>
              <span>{result.goodCount}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-900/80 rounded-lg">
              <span className="text-[var(--modal-danger)] font-bold">Trượt:</span>
              <span>{result.missCount}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-900/80 rounded-lg">
              <span className="text-[var(--modal-muted)] font-bold">Chạm nhầm:</span>
              <span>{result.strayInputCount}</span>
            </div>
          </div>

          {(result.holdsAttempted > 0 || result.chordsAttempted > 0) && (
            <div className="pt-1 border-t border-slate-800/80 flex justify-around text-xs text-[var(--modal-text)]">
              {result.holdsAttempted > 0 && (
                <span>Giữ: <strong className="text-[var(--modal-reward)]">{result.holdCompletionRate}%</strong> ({result.holdsCompleted}/{result.holdsAttempted})</span>
              )}
              {result.chordsAttempted > 0 && (
                <span>Chạm đồng thời: <strong className="text-[var(--modal-reward)]">{result.chordCompletionRate}%</strong> ({result.chordsCompleted}/{result.chordsAttempted})</span>
              )}
            </div>
          )}
        </div>
        </OverlayBody>

        {/* Action Buttons */}
        <ModalActions className="flex flex-col">
          <ModalButton variant="primary"
            type="button"
            onClick={() => {
              soundManager.playClick();
              onReplay();
            }}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4" />
            Chơi Lại ({diffConfig.label})
          </ModalButton>

          <div className="modal-action-row">
            <ModalButton variant="ghost"
              type="button"
              onClick={() => {
                soundManager.playClick();
                onChangeDifficulty();
              }}
            >
              <Activity className="w-3.5 h-3.5 text-[var(--modal-reward)]" />
              Đổi Độ Khó
            </ModalButton>
            <ModalButton variant="ghost"
              type="button"
              onClick={() => {
                soundManager.playClick();
                onExit();
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[var(--modal-muted)]" />
              Về Khu Huấn Luyện
            </ModalButton>
          </div>
        </ModalActions>
    </GameResultModal>
  );
};
