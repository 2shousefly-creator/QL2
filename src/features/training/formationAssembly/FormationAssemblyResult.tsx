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
import { GameResultModal, ModalActions, ModalButton, OverlayBody, ResultHero } from "../../../components/overlay/AppOverlay";

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
    <GameResultModal status={result.victory ? "success" : "danger"}
      onClose={onExit}
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy="formation-result-title"
    >
        {/* Banner Status */}
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

          <div>
            <h2 id="formation-result-title" className="modal-title">
              {result.victory ? "CHIẾN THẮNG HUẤN LUYỆN!" : "ĐỘI HÌNH CHƯA HOÀN THÀNH"}
            </h2>
            <p className="modal-copy mt-0.5">
              Xếp Đội Hình · Mức độ <strong>{config.label}</strong>
            </p>
          </div>
        </ResultHero>

        <OverlayBody className="flex flex-col">
        {/* Daily Reward Claim Card */}
        {result.victory && (
          <div className="modal-section flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--modal-reward)]" />
                <span className="font-semibold text-xs text-[var(--modal-reward)]">
                  Phần Thưởng Huấn Luyện
                </span>
              </div>
              <span className="text-xs text-[var(--modal-muted)]">1 lần / ngày</span>
            </div>

            {claimResult?.status === "claimed" ? (
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                <span className="text-xs font-bold text-[var(--modal-text)]">
                  Thắng đầu tiên hôm nay!
                </span>
                <span className="font-semibold text-sm text-[var(--modal-reward)]">
                  +{claimResult.nominalRewardXp} XP
                </span>
              </div>
            ) : claimResult?.status === "already_claimed" ? (
              <p className="text-xs text-[var(--modal-muted)] italic">
                Bạn đã nhận phần thưởng huấn luyện hôm nay. Lượt thắng này ghi nhận thành tích (0 XP).
              </p>
            ) : claimResult?.status === "xp_bar_full_not_consumed" ? (
              <p className="text-xs text-[var(--modal-reward)] italic">
                Thanh XP đang đầy nên chưa thể nhận thưởng. Quyền thưởng vẫn còn sau khi thăng cấp!
              </p>
            ) : (
              <p className="text-xs text-[var(--modal-muted)] italic">
                Lượt này hoàn thành nhiệm vụ luyện tập.
              </p>
            )}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="modal-section flex flex-col items-center">
            <span className="text-xs text-[var(--modal-muted)]">Điểm Số</span>
            <span className="font-semibold text-xl text-[var(--modal-reward)] mt-0.5">
              {result.score}
            </span>
          </div>

          <div className="modal-section flex flex-col items-center">
            <span className="text-xs text-[var(--modal-muted)]">Vòng Hoàn Thành</span>
            <span className="font-semibold text-xl text-[var(--modal-info)] mt-0.5">
              {result.completedRounds} / {result.totalRounds}
            </span>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="modal-section flex flex-col gap-2 text-xs text-[var(--modal-text)]">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <div className="flex items-center gap-1.5 text-[var(--modal-muted)]">
              <Clock className="w-3.5 h-3.5" />
              <span>Thời Gian Trận</span>
            </div>
            <span className="font-bold text-[var(--modal-text)]">{formatTime(result.elapsedRealMs)}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <div className="flex items-center gap-1.5 text-[var(--modal-muted)]">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Số Lần Đổi Chỗ</span>
            </div>
            <span className="font-bold text-[var(--modal-text)]">{result.swapsPerformed}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <div className="flex items-center gap-1.5 text-[var(--modal-muted)]">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Số Lần Xoay Quân</span>
            </div>
            <span className="font-bold text-[var(--modal-text)]">{result.rotationsPerformed}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[var(--modal-muted)]">
              <Award className="w-3.5 h-3.5" />
              <span>Lượt Sửa Đã Dùng</span>
            </div>
            <span className="font-bold text-[var(--modal-text)]">
              {result.recoveriesUsed} / {config.recoveryCharges}
            </span>
          </div>
        </div>

        {result.perfectWin && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-[var(--modal-success)] font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>CHIẾN THẮNG HOÀN HẢO — Không lỗi!</span>
          </div>
        )}
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
            <span>CHƠI LẠI ({config.label})</span>
          </ModalButton>

          <div className="modal-action-row">
            <ModalButton variant="ghost"
              type="button"
              onClick={() => {
                soundManager.playClick();
                onChangeDifficulty();
              }}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Đổi Độ Khó</span>
            </ModalButton>

            <ModalButton variant="ghost"
              type="button"
              onClick={() => {
                soundManager.playClick();
                onExit();
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Về Sảnh</span>
            </ModalButton>
          </div>
        </ModalActions>
    </GameResultModal>
  );
};
