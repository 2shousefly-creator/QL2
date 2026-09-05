import React from "react";
import { X, Eye, CheckCircle2, Lightbulb } from "lucide-react";
import { soundManager } from "../../../game/audio";
import { AppModal, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";

type Props = {
  onClose: () => void;
};

export const RadarTrackingTutorialModal: React.FC<Props> = ({ onClose }) => {
  return (
    <AppModal
      onClose={onClose}
      labelledBy="radar-tutorial-title"
      panelClassName="max-w-sm border-emerald-500/30 bg-slate-900 text-slate-100"
    >
        {/* Header */}
        <OverlayHeader className="flex items-center justify-between border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 id="radar-tutorial-title" className="font-extrabold text-sm text-emerald-300">
                Mắt Thần Radar
              </h3>
              <p className="text-[10px] text-slate-400">Hướng dẫn nhanh kỹ năng theo dõi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Đóng hướng dẫn radar"
          >
            <X className="w-4 h-4" />
          </button>
        </OverlayHeader>

        <OverlayBody className="flex flex-col gap-3">
        {/* Streamlined Steps */}
        <div className="flex flex-col gap-2">
          {/* Step 1 */}
          <div className="flex items-center gap-2.5 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-xs">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs shrink-0">
              1
            </span>
            <div className="leading-tight">
              <span className="font-extrabold text-emerald-300">Ghi nhớ: </span>
              <span className="text-slate-300">Định vị các mục tiêu có <strong className="text-amber-400">vòng viền sáng</strong> lúc bắt đầu.</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-2.5 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-xs">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-black text-xs shrink-0">
              2
            </span>
            <div className="leading-tight">
              <span className="font-extrabold text-cyan-300">Theo vết: </span>
              <span className="text-slate-300">Giữ mắt theo dõi khi tín hiệu di chuyển và lướt qua nhau.</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-2.5 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-xs">
            <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black text-xs shrink-0">
              3
            </span>
            <div className="leading-tight">
              <span className="font-extrabold text-purple-300">Chạm chọn: </span>
              <span className="text-slate-300">Khi radar dừng, chọn đúng các mục tiêu rồi nhấn <strong className="text-emerald-400">Xác nhận</strong>.</span>
            </div>
          </div>
        </div>

        {/* Victory Requirements Grid */}
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5 text-xs">
          <span className="font-extrabold text-emerald-400">Điều Kiện Chiến Thắng:</span>
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <span className="font-extrabold text-slate-200 block">Dễ</span>
              <span className="text-emerald-400 font-bold">5 Vòng</span>
              <span className="text-slate-400 block text-[9px]">2 mục tiêu</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <span className="font-extrabold text-slate-200 block">Vừa</span>
              <span className="text-emerald-400 font-bold">6 Vòng</span>
              <span className="text-slate-400 block text-[9px]">3 mục tiêu</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <span className="font-extrabold text-slate-200 block">Khó</span>
              <span className="text-emerald-400 font-bold">7 Vòng</span>
              <span className="text-slate-400 block text-[9px]">4-5 mục tiêu</span>
            </div>
          </div>
        </div>

        {/* Compact Tip */}
        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-slate-300 leading-snug">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>Mẹo: Quan sát bao quát cả nhóm thay vì nhìn một điểm. Mức <strong>Khó</strong> có thêm vùng nhiễu che khuất.</span>
        </div>
        </OverlayBody>

        {/* Submit Button */}
        <OverlayFooter className="border-slate-800 bg-slate-900">
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 border border-emerald-400/30 transition-all flex items-center justify-center gap-1.5 mt-0.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Đã Hiểu - Sẵn Sàng</span>
        </button>
        </OverlayFooter>
    </AppModal>
  );
};
