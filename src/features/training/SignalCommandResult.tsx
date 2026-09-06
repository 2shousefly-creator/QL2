import React from "react";
import { Trophy, XCircle, RotateCcw, ListCheck, CheckCircle2, AlertCircle, Award, Target, Zap, Clock, ShieldCheck } from "lucide-react";
import { TrainingDifficulty } from "../../game/types";
import { SignalCommandResult } from "../../game/training/signalCommand/signalCommandTypes";
import { DailyTrainingClaimResult } from "../../game/training/dailyTrainingReward";
import { getSignalCommandConfig } from "../../game/training/signalCommand/signalCommandConfig";
import { soundManager } from "../../game/audio";
import { GameResultModal, ModalActions, ModalButton, OverlayBody, ResultHero } from "../../components/overlay/AppOverlay";

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
    <GameResultModal status={result.victory ? "success" : "danger"}
      onClose={onExit}
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy="signal-command-result-title"
    >
        {/* Banner Header */}
        <ResultHero className="flex flex-col items-center text-center">
          {isVictory ? (
            <div className="modal-status-icon">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="modal-status-icon">
              <XCircle className="w-8 h-8" />
            </div>
          )}

          <div>
            <h2 id="signal-command-result-title" className="modal-title">
              {isVictory ? "Mật Lệnh Hoàn Thành!" : "Mật Lệnh Chưa Hoàn Thành"}
            </h2>
            <p className="modal-copy mt-0.5">
              Mật Lệnh Tín Hiệu · <span className="text-[var(--modal-info)] font-bold">{config.label}</span>
            </p>
          </div>
        </ResultHero>

        <OverlayBody className="flex flex-col">
        {/* Claim Result Banner */}
        {isVictory && (
          <div className="w-full">
            {claimResult?.status === "claimed" ? (
              <div className="bg-emerald-950/80 border border-emerald-500/40 p-3.5 rounded-2xl flex flex-col gap-1 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[var(--modal-success)] font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[var(--modal-success)]" />
                  <span>Chiến thắng đầu tiên hôm nay!</span>
                </div>
                <div className="text-2xl font-semibold text-[var(--modal-reward)] my-0.5">
                  +{claimResult.nominalRewardXp} XP
                </div>
                <div className="text-xs text-[var(--modal-success)]">
                  Phần thưởng đã được cộng trực tiếp vào thanh cấp bậc của bạn.
                </div>
              </div>
            ) : claimResult?.status === "already_claimed" ? (
              <div className="modal-section flex flex-col gap-1 text-center text-xs">
                <div className="flex items-center justify-center gap-1.5 text-[var(--modal-text)] font-bold">
                  <Award className="w-4 h-4 text-[var(--modal-reward)]" />
                  <span>Chiến thắng luyện tập tự do</span>
                </div>
                <p className="text-xs text-[var(--modal-muted)]">
                  Phần thưởng thắng đầu tiên hôm nay đã được nhận trước đó. Lượt này không cộng thêm XP.
                </p>
              </div>
            ) : claimResult?.status === "xp_bar_full_not_consumed" ? (
              <div className="bg-amber-950/50 border border-amber-500/30 p-3 rounded-2xl flex flex-col gap-1 text-center text-xs">
                <div className="flex items-center justify-center gap-1.5 text-[var(--modal-reward)] font-bold">
                  <AlertCircle className="w-4 h-4 text-[var(--modal-reward)]" />
                  <span>Thanh XP hiện đã đầy</span>
                </div>
                <p className="text-xs text-[var(--modal-reward)]">
                  Quyền nhận thưởng hôm nay chưa bị tiêu hao. Bạn có thể thăng cấp rồi quay lại chiến thắng để nhận XP!
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Score & Key Stats Grid */}
        <div className="modal-section flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-xs text-[var(--modal-muted)] font-semibold">Điểm lượt chơi</span>
            <span className="text-lg font-semibold text-[var(--modal-info)] font-mono">{result.score} / 1000</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="modal-section flex flex-col gap-0.5">
              <span className="text-xs text-[var(--modal-muted)] flex items-center gap-1">
                <ListCheck className="w-3 h-3 text-[var(--modal-info)]" />
                Vòng hoàn thành
              </span>
              <span className="text-sm font-bold text-[var(--modal-text)] font-mono">
                {result.completedRounds} / {result.totalRounds}
              </span>
            </div>

            <div className="modal-section flex flex-col gap-0.5">
              <span className="text-xs text-[var(--modal-muted)] flex items-center gap-1">
                <Target className="w-3 h-3 text-[var(--modal-success)]" />
                Độ chính xác
              </span>
              <span className="text-sm font-bold text-[var(--modal-text)] font-mono">
                {accuracyPct}%
              </span>
            </div>

            <div className="modal-section flex flex-col gap-0.5">
              <span className="text-xs text-[var(--modal-muted)] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[var(--modal-reward)]" />
                Thời gian thực hiện
              </span>
              <span className="text-sm font-bold text-[var(--modal-text)] font-mono">
                {formattedTime}s
              </span>
            </div>

            <div className="modal-section flex flex-col gap-0.5">
              <span className="text-xs text-[var(--modal-muted)] flex items-center gap-1">
                <Zap className="w-3 h-3 text-purple-400" />
                Chuỗi dài nhất
              </span>
              <span className="text-sm font-bold text-[var(--modal-text)] font-mono">
                {result.longestSequenceCompleted} tín hiệu
              </span>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--modal-muted)] border-t border-slate-800/80">
            <span>Tín hiệu đôi: <strong className="text-[var(--modal-text)]">{result.pairTokensCompleted}</strong></span>
            <span>Vòng Ngược: <strong className="text-[var(--modal-text)]">{result.reverseRoundsCompleted}</strong></span>
            <span>Sửa lỗi đã dùng: <strong className="text-[var(--modal-text)]">{result.recoveriesUsed}</strong></span>
          </div>

          {result.perfectWin && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-center text-[var(--modal-reward)] font-bold text-xs flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--modal-reward)]" />
              <span>LƯỢT HOÀN HẢO — Không một sai sót!</span>
            </div>
          )}
        </div>
        </OverlayBody>

        {/* Buttons */}
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
            Chơi Lại ({config.label})
          </ModalButton>

          <div className="modal-action-row">
            <ModalButton variant="ghost"
              type="button"
              onClick={() => {
                soundManager.playClick();
                onChangeDifficulty();
              }}
            >
              Đổi Độ Khó
            </ModalButton>

            <ModalButton variant="ghost"
              type="button"
              onClick={() => {
                soundManager.playClick();
                onExit();
              }}
            >
              Về Khu Huấn Luyện
            </ModalButton>
          </div>
        </ModalActions>
    </GameResultModal>
  );
};
