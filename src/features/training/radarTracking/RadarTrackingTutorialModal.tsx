import React from "react";
import { X, Eye, CheckCircle2, Lightbulb } from "lucide-react";
import { soundManager } from "../../../game/audio";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";

type Props = {
  onClose: () => void;
};

export const RadarTrackingTutorialModal: React.FC<Props> = ({ onClose }) => {
  return (
    <AppModal archetype="info"
      onClose={onClose}
      labelledBy="radar-tutorial-title"
    >
        {/* Header */}
        <OverlayHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[var(--modal-success)]">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 id="radar-tutorial-title" className="modal-title">
                Mắt Thần Radar
              </h3>
              <p className="modal-copy">Hướng dẫn nhanh kỹ năng theo dõi</p>
            </div>
          </div>
          <ModalButton variant="icon"
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            aria-label="Đóng hướng dẫn radar"
          >
            <X className="w-4 h-4" />
          </ModalButton>
        </OverlayHeader>

        <OverlayBody className="flex flex-col">
        {/* Streamlined Steps */}
        <div className="flex flex-col gap-2">
          {/* Step 1 */}
          <div className="modal-section flex items-center gap-2.5 text-xs">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-[var(--modal-success)] border border-emerald-500/30 flex items-center justify-center font-semibold text-xs shrink-0">
              1
            </span>
            <div className="leading-tight">
              <span className="font-semibold text-[var(--modal-success)]">Ghi nhớ: </span>
              <span className="text-[var(--modal-text)]">Định vị các mục tiêu có <strong className="text-[var(--modal-reward)]">vòng viền sáng</strong> lúc bắt đầu.</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="modal-section flex items-center gap-2.5 text-xs">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-[var(--modal-info)] border border-cyan-500/30 flex items-center justify-center font-semibold text-xs shrink-0">
              2
            </span>
            <div className="leading-tight">
              <span className="font-semibold text-[var(--modal-info)]">Theo vết: </span>
              <span className="text-[var(--modal-text)]">Giữ mắt theo dõi khi tín hiệu di chuyển và lướt qua nhau.</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="modal-section flex items-center gap-2.5 text-xs">
            <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-semibold text-xs shrink-0">
              3
            </span>
            <div className="leading-tight">
              <span className="font-semibold text-purple-300">Chạm chọn: </span>
              <span className="text-[var(--modal-text)]">Khi radar dừng, chọn đúng các mục tiêu rồi nhấn <strong className="text-[var(--modal-success)]">Xác nhận</strong>.</span>
            </div>
          </div>
        </div>

        {/* Victory Requirements Grid */}
        <div className="modal-section flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-[var(--modal-success)]">Điều Kiện Chiến Thắng:</span>
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            <div className="modal-section">
              <span className="font-semibold text-[var(--modal-text)] block">Dễ</span>
              <span className="text-[var(--modal-success)] font-bold">5 Vòng</span>
              <span className="text-[var(--modal-muted)] block text-xs">2 mục tiêu</span>
            </div>
            <div className="modal-section">
              <span className="font-semibold text-[var(--modal-text)] block">Vừa</span>
              <span className="text-[var(--modal-success)] font-bold">6 Vòng</span>
              <span className="text-[var(--modal-muted)] block text-xs">3 mục tiêu</span>
            </div>
            <div className="modal-section">
              <span className="font-semibold text-[var(--modal-text)] block">Khó</span>
              <span className="text-[var(--modal-success)] font-bold">7 Vòng</span>
              <span className="text-[var(--modal-muted)] block text-xs">4-5 mục tiêu</span>
            </div>
          </div>
        </div>

        {/* Compact Tip */}
        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-2.5 flex items-start gap-2 text-xs text-[var(--modal-text)] leading-snug">
          <Lightbulb className="w-4 h-4 text-[var(--modal-reward)] shrink-0 mt-0.5" />
          <span>Mẹo: Quan sát bao quát cả nhóm thay vì nhìn một điểm. Mức <strong>Khó</strong> có thêm vùng nhiễu che khuất.</span>
        </div>
        </OverlayBody>

        {/* Submit Button */}
        <OverlayFooter>
        <ModalButton variant="ghost"
          type="button"
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Đã Hiểu - Sẵn Sàng</span>
        </ModalButton>
        </OverlayFooter>
    </AppModal>
  );
};
