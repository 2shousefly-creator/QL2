import React from "react";
import { X, CheckCircle2, Hand, Move, Award } from "lucide-react";
import { soundManager } from "../../../../game/audio";
import { AppModal, OverlayBody, OverlayFooter, OverlayHeader } from "../../../../components/overlay/AppOverlay";

interface GomokuTutorialModalProps {
  onClose: () => void;
}

export const GomokuTutorialModal: React.FC<GomokuTutorialModalProps> = ({ onClose }) => {
  return (
    <AppModal
      onClose={onClose}
      labelledBy="gomoku-tutorial-title"
      panelClassName="max-w-md border-slate-800 bg-slate-900 text-slate-100"
    >
        <OverlayHeader className="flex items-center justify-between border-slate-800">
          <h2 id="gomoku-tutorial-title" className="text-base font-extrabold text-slate-100 flex items-center gap-2">
            Luật Chơi & Thao Tác Cờ Caro V13
          </h2>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Đóng hướng dẫn cờ Caro"
          >
            <X className="w-5 h-5" />
          </button>
        </OverlayHeader>

        <OverlayBody className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong>Luật Thắng:</strong> Tạo được chuỗi 5 quân liên tiếp (hoặc dài hơn) theo hàng ngang, hàng dọc hoặc đường chéo.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Hand className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Thao Tác Bàn Cờ:</strong> Vuốt 1 ngón để di chuyển (Pan), chụm 2 ngón để Phóng to / Thu nhỏ (Pinch Zoom). Chạm vào ô trống để vẽ quân vào giữa ô.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Move className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>Điều Hướng Nhanh:</strong> Nút <strong>Trung Tâm</strong> di chuyển bàn cờ về vùng giao tranh; Nút <strong>Nước Mới Nhất</strong> đưa góc nhìn tới nước vừa đánh.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Award className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <p>
              <strong>Thưởng XP:</strong> Thắng trận đầu tiên trong ngày nhận thưởng XP theo độ khó chọn (Dễ: +10 XP, Vừa: +30 XP, Khó: +50 XP).
            </p>
          </div>
        </OverlayBody>

        <OverlayFooter className="border-slate-800 bg-slate-900">
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition-all"
        >
          Đã Hiểu
        </button>
        </OverlayFooter>
    </AppModal>
  );
};
