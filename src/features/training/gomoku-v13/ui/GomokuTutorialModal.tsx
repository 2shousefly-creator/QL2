import React from "react";
import { X, CheckCircle2, Hand, Move, Award } from "lucide-react";
import { soundManager } from "../../../../game/audio";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../../components/overlay/AppOverlay";

interface GomokuTutorialModalProps {
  onClose: () => void;
}

export const GomokuTutorialModal: React.FC<GomokuTutorialModalProps> = ({ onClose }) => {
  return (
    <AppModal theme="paper" archetype="info"
      onClose={onClose}
      labelledBy="gomoku-tutorial-title"
    >
        <OverlayHeader className="flex items-center justify-between">
          <h2 id="gomoku-tutorial-title" className="modal-title flex items-center gap-2">
            Luật Chơi & Thao Tác Cờ Caro V13
          </h2>
          <ModalButton variant="icon"
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            aria-label="Đóng hướng dẫn cờ Caro"
          >
            <X className="w-5 h-5" />
          </ModalButton>
        </OverlayHeader>

        <OverlayBody className="text-xs text-[var(--modal-text)] leading-relaxed">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[var(--modal-success)] shrink-0 mt-0.5" />
            <p>
              <strong>Luật Thắng:</strong> Tạo được chuỗi 5 quân liên tiếp (hoặc dài hơn) theo hàng ngang, hàng dọc hoặc đường chéo.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Hand className="w-4 h-4 text-[var(--modal-warning)] shrink-0 mt-0.5" />
            <p>
              <strong>Thao Tác Bàn Cờ:</strong> Vuốt 1 ngón để di chuyển (Pan), chụm 2 ngón để Phóng to / Thu nhỏ (Pinch Zoom). Chạm vào ô trống để vẽ quân vào giữa ô.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Move className="w-4 h-4 text-[var(--modal-info)] shrink-0 mt-0.5" />
            <p>
              <strong>Điều Hướng Nhanh:</strong> Nút <strong>Trung Tâm</strong> di chuyển bàn cờ về vùng giao tranh; Nút <strong>Nước Mới Nhất</strong> đưa góc nhìn tới nước vừa đánh.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Award className="w-4 h-4 text-[var(--modal-reward)] shrink-0 mt-0.5" />
            <p>
              <strong>Thưởng XP:</strong> Thắng trận đầu tiên trong ngày nhận thưởng XP theo độ khó chọn (Dễ: +10 XP, Vừa: +30 XP, Khó: +50 XP).
            </p>
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
          Đã Hiểu
        </ModalButton>
        </OverlayFooter>
    </AppModal>
  );
};
