import React from "react";
import { BrainCircuit, Check, Eye, Fingerprint, Layers, ShieldCheck } from "lucide-react";
import { soundManager } from "../../game/audio";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../components/overlay/AppOverlay";

type SignalCommandTutorialModalProps = {
  onClose: () => void;
};

export const SignalCommandTutorialModal: React.FC<SignalCommandTutorialModalProps> = ({ onClose }) => {
  return (
    <AppModal archetype="info"
      onClose={onClose}
      labelledBy="signal-command-tutorial-title"
    >
        <OverlayHeader className="flex items-center">
          <div className="modal-status-icon">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 id="signal-command-tutorial-title" className="modal-title">Hướng Dẫn Mật Lệnh Tín Hiệu</h3>
            <p className="modal-copy">Quy tắc ghi nhớ & nhập chuỗi tín hiệu</p>
          </div>
        </OverlayHeader>

        <OverlayBody className="flex flex-col text-xs text-[var(--modal-text)]">
          <div className="modal-section flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-xl bg-cyan-500/10 text-[var(--modal-info)] flex items-center justify-center shrink-0 font-bold text-xs">1</div>
            <div>
              <strong className="text-[var(--modal-text)] block mb-0.5 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[var(--modal-info)]" />
                Pha Trình Diễn
              </strong>
              Quan sát kĩ bảng tín hiệu khi các ô phát sáng theo trình tự. Mọi thao tác chạm trong pha này sẽ tự động bị bỏ qua.
            </div>
          </div>

          <div className="modal-section flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-xl bg-cyan-500/10 text-[var(--modal-info)] flex items-center justify-center shrink-0 font-bold text-xs">2</div>
            <div>
              <strong className="text-[var(--modal-text)] block mb-0.5 flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-[var(--modal-info)]" />
                Pha Nhập Lệnh
              </strong>
              Khi dòng "Nhập Mật Lệnh" xuất hiện, chạm lại các ô theo đúng chuỗi đã ghi nhớ trước khi thanh thời gian cạn kiệt.
            </div>
          </div>

          <div className="modal-section flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-xl bg-cyan-500/10 text-[var(--modal-info)] flex items-center justify-center shrink-0 font-bold text-xs">3</div>
            <div>
              <strong className="text-[var(--modal-text)] block mb-0.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--modal-info)]" />
                Tín Hiệu Đôi & Giao Thức Ngược
              </strong>
              Ở mức Vừa/Khó, hai ô có thể sáng cùng lúc. Ở mức Khó, mật lệnh có thể yêu cầu nhập <strong className="text-[var(--modal-reward)]">NGƯỢC</strong> từ đuôi về đầu.
            </div>
          </div>

          {/* Victory Conditions Grid */}
          <div className="modal-section flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-[var(--modal-info)]">
              <ShieldCheck className="w-4 h-4" />
              <span>Điều Kiện Chiến Thắng</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="modal-section">
                <span className="font-semibold text-[var(--modal-text)] block">Dễ</span>
                <span className="text-[var(--modal-info)] font-bold">5 Vòng</span>
                <span className="text-[var(--modal-muted)] block text-xs">Sửa sai: 2 lần</span>
              </div>
              <div className="modal-section">
                <span className="font-semibold text-[var(--modal-text)] block">Vừa</span>
                <span className="text-[var(--modal-info)] font-bold">7 Vòng</span>
                <span className="text-[var(--modal-muted)] block text-xs">Sửa sai: 1 lần</span>
              </div>
              <div className="modal-section">
                <span className="font-semibold text-[var(--modal-text)] block">Khó</span>
                <span className="text-[var(--modal-info)] font-bold">8 Vòng</span>
                <span className="text-[var(--modal-danger)] block text-xs">Không sửa sai</span>
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
          Đã Hiểu — Bắt Đầu Ngay
        </ModalButton>
        </OverlayFooter>
    </AppModal>
  );
};
