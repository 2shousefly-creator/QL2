import React from "react";
import { BrainCircuit, Eye, Fingerprint, Layers, RotateCcw, ShieldCheck, Check } from "lucide-react";
import { soundManager } from "../../game/audio";
import { AppModal, OverlayBody, OverlayFooter, OverlayHeader } from "../../components/overlay/AppOverlay";

type SignalCommandTutorialModalProps = {
  onClose: () => void;
};

export const SignalCommandTutorialModal: React.FC<SignalCommandTutorialModalProps> = ({ onClose }) => {
  return (
    <AppModal
      onClose={onClose}
      labelledBy="signal-command-tutorial-title"
      panelClassName="max-w-md border-slate-800 bg-slate-900 text-slate-100"
    >
        <OverlayHeader className="flex items-center gap-3 border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 id="signal-command-tutorial-title" className="font-extrabold text-base text-slate-100">Hướng Dẫn Mật Lệnh Tín Hiệu</h3>
            <p className="text-xs text-slate-400">Quy tắc ghi nhớ & nhập chuỗi tín hiệu</p>
          </div>
        </OverlayHeader>

        <OverlayBody className="flex flex-col gap-2.5 text-xs text-slate-300">
          <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800/80 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 font-bold text-xs">1</div>
            <div>
              <strong className="text-slate-100 block mb-0.5 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                Pha Trình Diễn
              </strong>
              Quan sát kĩ bảng tín hiệu khi các ô phát sáng theo trình tự. Mọi thao tác chạm trong pha này sẽ tự động bị bỏ qua.
            </div>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800/80 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 font-bold text-xs">2</div>
            <div>
              <strong className="text-slate-100 block mb-0.5 flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                Pha Nhập Lệnh
              </strong>
              Khi dòng "Nhập Mật Lệnh" xuất hiện, chạm lại các ô theo đúng chuỗi đã ghi nhớ trước khi thanh thời gian cạn kiệt.
            </div>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800/80 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 font-bold text-xs">3</div>
            <div>
              <strong className="text-slate-100 block mb-0.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Tín Hiệu Đôi & Giao Thức Ngược
              </strong>
              Ở mức Vừa/Khó, hai ô có thể sáng cùng lúc. Ở mức Khó, mật lệnh có thể yêu cầu nhập <strong className="text-amber-400">NGƯỢC</strong> từ đuôi về đầu.
            </div>
          </div>

          {/* Victory Conditions Grid */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-extrabold text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Điều Kiện Chiến Thắng</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="font-extrabold text-slate-200 block">Dễ</span>
                <span className="text-cyan-400 font-bold">5 Vòng</span>
                <span className="text-slate-400 block text-[9px]">Sửa sai: 2 lần</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="font-extrabold text-slate-200 block">Vừa</span>
                <span className="text-cyan-400 font-bold">7 Vòng</span>
                <span className="text-slate-400 block text-[9px]">Sửa sai: 1 lần</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="font-extrabold text-slate-200 block">Khó</span>
                <span className="text-cyan-400 font-bold">8 Vòng</span>
                <span className="text-rose-400 block text-[9px]">Không sửa sai</span>
              </div>
            </div>
          </div>
        </OverlayBody>

        <OverlayFooter className="border-slate-800 bg-slate-900">
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all"
        >
          <Check className="w-4 h-4" />
          Đã Hiểu — Bắt Đầu Ngay
        </button>
        </OverlayFooter>
    </AppModal>
  );
};
