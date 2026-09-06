import React from "react";
import { X, Target, Crosshair, Hand, ShieldCheck } from "lucide-react";
import { soundManager } from "../../../game/audio";
import { SHOOTING_DIFFICULTY_CONFIGS } from "../../../game/training/shootingRange/shootingConfig";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";

type ShootingTutorialModalProps = {
  onClose: () => void;
};

export const ShootingTutorialModal: React.FC<ShootingTutorialModalProps> = ({ onClose }) => {
  return (
    <AppModal archetype="info"
      onClose={onClose}
      labelledBy="shooting-tutorial-title"
    >
        {/* Header */}
        <OverlayHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[var(--modal-reward)]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 id="shooting-tutorial-title" className="modal-title">Hướng Dẫn Bắn Súng</h3>
              <p className="modal-copy">Thao trường ngắm bắn bia di động</p>
            </div>
          </div>

          <ModalButton variant="icon"
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            aria-label="Đóng hướng dẫn bắn súng"
          >
            <X className="w-4 h-4" />
          </ModalButton>
        </OverlayHeader>

        {/* Streamlined Content */}
        <OverlayBody className="flex flex-col text-xs text-[var(--modal-text)] leading-relaxed">
          {/* Controls */}
          <div className="modal-section flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-semibold text-[var(--modal-reward)]">
              <Hand className="w-4 h-4" />
              <span>Thao Tác Điều Khiển</span>
            </div>
            <ul className="space-y-1 text-[var(--modal-text)] text-xs">
              <li>• <strong>Ngắm bắn:</strong> Chạm giữ &amp; vuốt ở bất kỳ đâu trên màn hình.</li>
              <li>• <strong>Bóp cò:</strong> Nhấn nút <span className="text-[var(--modal-reward)] font-bold">BẮN</span> màu cam (hồi 1 giây/phát).</li>
              <li>• <strong>Độ nhạy:</strong> Tùy chỉnh tốc độ ngắm (Thấp / Vừa / Cao) ở thanh trên.</li>
            </ul>
          </div>

          {/* Scoring & Rules */}
          <div className="modal-section flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-semibold text-[var(--modal-info)]">
              <Crosshair className="w-4 h-4" />
              <span>Quy Tắc Tính Điểm</span>
            </div>
            <p className="text-xs text-[var(--modal-text)]">
              Bia có 10 vòng điểm (hồng tâm 10đ). Càng ngắm chuẩn tâm điểm càng cao. Trận kéo dài 60s với tối đa 10 bia xuất hiện.
            </p>
          </div>

          {/* Victory Requirements */}
          <div className="modal-section flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-semibold text-[var(--modal-success)]">
              <ShieldCheck className="w-4 h-4" />
              <span>Yêu Cầu Đạt Chuẩn</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs pt-0.5">
              <div className="modal-section">
                <span className="font-semibold text-[var(--modal-text)] block">Dễ</span>
                <span className="text-[var(--modal-reward)] font-bold">
                  ≥{SHOOTING_DIFFICULTY_CONFIGS.easy.minScoreToWin}đ &amp; ≥
                  {Math.round(SHOOTING_DIFFICULTY_CONFIGS.easy.minAccuracyToWin * 100)}%
                </span>
              </div>
              <div className="modal-section">
                <span className="font-semibold text-[var(--modal-text)] block">Vừa</span>
                <span className="text-[var(--modal-reward)] font-bold">
                  ≥{SHOOTING_DIFFICULTY_CONFIGS.medium.minScoreToWin}đ &amp; ≥
                  {Math.round(SHOOTING_DIFFICULTY_CONFIGS.medium.minAccuracyToWin * 100)}%
                </span>
              </div>
              <div className="modal-section">
                <span className="font-semibold text-[var(--modal-text)] block">Khó</span>
                <span className="text-[var(--modal-reward)] font-bold">
                  ≥{SHOOTING_DIFFICULTY_CONFIGS.hard.minScoreToWin}đ &amp; ≥
                  {Math.round(SHOOTING_DIFFICULTY_CONFIGS.hard.minAccuracyToWin * 100)}%
                </span>
              </div>
            </div>
          </div>
        </OverlayBody>

        {/* Footer */}
        <OverlayFooter>
          <ModalButton variant="primary"
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-full"
          >
            ĐÃ HIỂU, BẮT ĐẦU
          </ModalButton>
        </OverlayFooter>
    </AppModal>
  );
};

