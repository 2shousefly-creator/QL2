import React from "react";
import { Activity, Target, Zap, ShieldCheck, Layers, Check } from "lucide-react";
import { soundManager } from "../../game/audio";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../components/overlay/AppOverlay";

type MarchRhythmTutorialModalProps = {
  onClose: () => void;
};

export const MarchRhythmTutorialModal: React.FC<MarchRhythmTutorialModalProps> = ({ onClose }) => {
  return (
    <AppModal archetype="info"
      onClose={onClose}
      labelledBy="march-rhythm-tutorial-title"
    >
        <OverlayHeader className="flex items-center">
          <div className="modal-status-icon">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 id="march-rhythm-tutorial-title" className="modal-title">Hướng Dẫn Nhịp Hành Quân</h3>
            <p className="modal-copy">Quy tắc căn nhịp & điều khiển các làn</p>
          </div>
        </OverlayHeader>

        <OverlayBody className="flex flex-col text-xs text-[var(--modal-text)]">
          <div className="modal-section flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-[var(--modal-reward)] flex items-center justify-center shrink-0 font-bold">1</div>
            <div>
              <strong className="text-[var(--modal-text)] block mb-0.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[var(--modal-reward)]" />
                Căn Nhịp Chuẩn
              </strong>
              Chạm vào làn cảm ứng đúng thời điểm ký hiệu rơi đến vạch nhịp chuẩn ở phía dưới màn hình.
            </div>
          </div>

          <div className="modal-section flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-[var(--modal-reward)] flex items-center justify-center shrink-0 font-bold">2</div>
            <div>
              <strong className="text-[var(--modal-text)] block mb-0.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--modal-reward)]" />
                Lối Chơi & Tốc Độ
              </strong>
              <p className="text-[var(--modal-text)] leading-relaxed">
                Tất cả ký hiệu đều dùng thao tác <span className="text-[var(--modal-reward)] font-semibold">chạm đơn</span>. Ở mức <span className="text-orange-400 font-semibold">Vừa</span> và <span className="text-[var(--modal-danger)] font-semibold">Khó</span>, tốc độ rơi tăng cùng tần suất nốt, đòi hỏi phản xạ nhanh hơn.
              </p>
            </div>
          </div>

          <div className="modal-section flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-[var(--modal-reward)] flex items-center justify-center shrink-0 font-bold">3</div>
            <div>
              <strong className="text-[var(--modal-text)] block mb-0.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[var(--modal-reward)]" />
                Chỉ Số & Combo
              </strong>
              Căn thời gian càng chính xác sẽ nhận đánh giá cao và duy trì chuỗi Combo để đạt điểm tối đa.
            </div>
          </div>

          <div className="modal-section flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-[var(--modal-reward)]">
              <ShieldCheck className="w-4 h-4" />
              <span>Điều Kiện Chiến Thắng</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="modal-section">
                <span className="font-semibold text-[var(--modal-text)] block">Dễ</span>
                <span className="text-[var(--modal-reward)] font-bold">Chính xác ≥70%</span>
                <span className="text-[var(--modal-muted)] block text-xs">Trượt ≤ 6</span>
              </div>
              <div className="modal-section">
                <span className="font-semibold text-[var(--modal-text)] block">Vừa</span>
                <span className="text-[var(--modal-reward)] font-bold">Chính xác ≥80%</span>
                <span className="text-[var(--modal-muted)] block text-xs">Trượt ≤ 7</span>
              </div>
              <div className="modal-section">
                <span className="font-semibold text-[var(--modal-text)] block">Khó</span>
                <span className="text-[var(--modal-reward)] font-bold">Chính xác ≥88%</span>
                <span className="text-[var(--modal-muted)] block text-xs">Trượt ≤ 5</span>
              </div>
            </div>
          </div>
        </OverlayBody>

        <OverlayFooter>
        <ModalButton variant="ghost"
          type="button"
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full"
        >
          <Check className="w-4 h-4" />
          Đã Hiểu - Bắt Đầu
        </ModalButton>
        </OverlayFooter>
    </AppModal>
  );
};
