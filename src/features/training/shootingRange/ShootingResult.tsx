import React from "react";
import { Trophy, RefreshCw, LogOut, XCircle, Sparkles, Crosshair, Target } from "lucide-react";
import { TrainingDifficulty } from "../../../game/types";
import { DailyTrainingClaimResult } from "../../../game/training/dailyTrainingReward";
import { ShootingRunResult } from "../../../game/training/shootingRange/shootingTypes";
import { SHOOTING_DIFFICULTY_CONFIGS } from "../../../game/training/shootingRange/shootingConfig";
import { soundManager } from "../../../game/audio";
import { GameResultModal, ModalActions, ModalButton, OverlayBody, ResultHero } from "../../../components/overlay/AppOverlay";

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
    <GameResultModal status={result.victory ? "success" : "danger"}
      onClose={onExit}
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy="shooting-result-title"
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

          <h2 id="shooting-result-title" className="modal-title">
            {result.victory ? "ĐẠT YÊU CẦU" : "CHƯA ĐẠT"}
          </h2>
          <p className="modal-copy">
            Hoàn thành Bắn Súng · <span className="font-bold text-[var(--modal-reward)]">{diffLabel}</span>
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

        {/* Requirements info if not victorious */}
        {!result.victory && (
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3 text-xs text-[var(--modal-danger)] text-left flex flex-col gap-1">
            <span className="font-bold">Yêu cầu đạt chuẩn:</span>
            <div className="flex justify-between">
              <span>• Điểm: {reqScore} điểm</span>
              <span className={missingScore ? "font-semibold text-[var(--modal-danger)]" : "text-[var(--modal-success)] font-bold"}>
                ({result.score}/{reqScore})
              </span>
            </div>
            <div className="flex justify-between">
              <span>• Độ chính xác: {reqAccPct}%</span>
              <span className={missingAcc ? "font-semibold text-[var(--modal-danger)]" : "text-[var(--modal-success)] font-bold"}>
                ({accuracyPct}%/{reqAccPct}%)
              </span>
            </div>
          </div>
        )}

        {/* Stats Summary Table */}
        <div className="modal-section grid grid-cols-2 gap-2.5 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-[var(--modal-muted)] font-semibold flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-[var(--modal-reward)]" /> Điểm Số
            </span>
            <span className="font-semibold text-lg text-[var(--modal-reward)] mt-0.5">
              {result.score}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[var(--modal-muted)] font-semibold flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-[var(--modal-info)]" /> Chính Xác
            </span>
            <span className="font-semibold text-lg text-[var(--modal-info)] mt-0.5">
              {accuracyPct}%
            </span>
          </div>

          <div className="flex flex-col items-center pt-2 border-t border-slate-800">
            <span className="text-[var(--modal-muted)] font-semibold">Trúng Đạn</span>
            <span className="font-semibold text-[var(--modal-text)] mt-0.5">
              {result.hits} / {result.shotsFired} phát
            </span>
          </div>

          <div className="flex flex-col items-center pt-2 border-t border-slate-800">
            <span className="text-[var(--modal-muted)] font-semibold">Bia Đã Phá</span>
            <span className="font-semibold text-[var(--modal-text)] mt-0.5">
              {result.targetsDestroyed} / {result.targetsSpawned}
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
            <span>Chơi Lại</span>
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
              <LogOut className="w-3.5 h-3.5" />
              <span>Về Huấn Luyện</span>
            </ModalButton>
          </div>
        </ModalActions>
    </GameResultModal>
  );
};
