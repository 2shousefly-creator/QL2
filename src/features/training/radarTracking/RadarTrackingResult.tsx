import React from "react";
import { LogOut, RefreshCw, Sparkles, Trophy, XCircle } from "lucide-react";
import { TrainingDifficulty } from "../../../game/types";
import { DailyTrainingClaimResult } from "../../../game/training/dailyTrainingReward";
import { RadarRunResult } from "../../../game/training/radarTracking/radarTypes";
import { soundManager } from "../../../game/audio";
import { GameResultModal, ModalActions, ModalButton, OverlayBody, ResultHero } from "../../../components/overlay/AppOverlay";

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
    <GameResultModal status={result.victory ? "success" : "danger"}
      onClose={onExit}
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy="radar-result-title"
      panelClassName="text-center"
    >
        {/* Banner header */}
        <ResultHero className="flex flex-col items-center text-center">
          {result.victory ? (
            <div className="modal-status-icon">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="modal-status-icon">
              <XCircle className="w-8 h-8" />
            </div>
          )}

          <h2 id="radar-result-title" className="modal-title">
            {result.victory ? "Hoàn Thành Thử Thách!" : "Thất Bại Lượt Theo Dõi"}
          </h2>
          <p className="modal-copy">
            Độ khó: <span className="font-bold text-[var(--modal-success)]">{diffLabel}</span>
          </p>
        </ResultHero>

        <OverlayBody className="flex flex-col">
        {/* Claim Reward Banner */}
        {claimResult && claimResult.status === "claimed" && (
          <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/40 rounded-2xl p-3 flex items-center gap-3 text-left">
            <Sparkles className="w-6 h-6 text-[var(--modal-reward)] shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-[var(--modal-reward)] block">
                Thưởng Hằng Ngày +{claimResult.nominalRewardXp} XP
              </span>
              <span className="text-xs text-[var(--modal-text)]">
                Đã ghi nhận phần thưởng huấn luyện hôm nay!
              </span>
            </div>
          </div>
        )}

        {/* Stats Summary Table */}
        <div className="modal-section grid grid-cols-2 gap-2.5 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-[var(--modal-muted)] font-semibold">Tổng Điểm</span>
            <span className="font-semibold text-lg text-[var(--modal-reward)] mt-0.5">
              {result.score}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[var(--modal-muted)] font-semibold">Tỷ Lệ Chính Xác</span>
            <span className="font-semibold text-lg text-[var(--modal-info)] mt-0.5">
              {result.accuracy}%
            </span>
          </div>

          <div className="flex flex-col items-center pt-2 border-t border-slate-800">
            <span className="text-[var(--modal-muted)] font-semibold">Vòng Hoàn Thành</span>
            <span className="font-semibold text-[var(--modal-text)] mt-0.5">
              {result.completedRounds} / {result.totalRounds}
            </span>
          </div>

          <div className="flex flex-col items-center pt-2 border-t border-slate-800">
            <span className="text-[var(--modal-muted)] font-semibold">Cứu Sinh Đã Dùng</span>
            <span className="font-semibold text-[var(--modal-text)] mt-0.5">
              {result.recoveriesUsed} lần
            </span>
          </div>
        </div>
        </OverlayBody>

        {/* Actions */}
        <ModalActions className="flex flex-col">
          <ModalButton variant="primary"
            type="button"
            onClick={() => {
              soundManager.playClick();
              onReplay();
            }}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Thử Lại Độ Khó Này</span>
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

            <ModalButton variant="primary"
              type="button"
              onClick={() => {
                soundManager.playClick();
                onExit();
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Thoát</span>
            </ModalButton>
          </div>
        </ModalActions>
    </GameResultModal>
  );
};
