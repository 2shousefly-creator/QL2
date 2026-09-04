import React from "react";
import { Activity, Target, Zap, ShieldCheck, Layers, Check } from "lucide-react";
import { soundManager } from "../../game/audio";

type MarchRhythmTutorialModalProps = {
  onClose: () => void;
};

export const MarchRhythmTutorialModal: React.FC<MarchRhythmTutorialModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 my-auto">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-100">Hướng Dẫn Nhịp Hành Quân</h3>
            <p className="text-xs text-slate-400">Quy tắc căn nhịp & điều khiển các làn</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-xs text-slate-300">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bold">1</div>
            <div>
              <strong className="text-slate-100 block mb-0.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                Căn Nhịp Chuẩn
              </strong>
              Chạm vào làn cảm ứng đúng thời điểm ký hiệu rơi đến vạch nhịp chuẩn ở phía dưới màn hình.
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bold">2</div>
            <div>
              <strong className="text-slate-100 block mb-0.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Lối Chơi & Tốc Độ
              </strong>
              <p className="text-slate-300 leading-relaxed">
                Tất cả ký hiệu đều dùng thao tác <span className="text-amber-300 font-semibold">chạm đơn</span>. Ở mức <span className="text-orange-400 font-semibold">Vừa</span> và <span className="text-rose-400 font-semibold">Khó</span>, tốc độ rơi tăng cùng tần suất nốt, đòi hỏi phản xạ nhanh hơn.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bold">3</div>
            <div>
              <strong className="text-slate-100 block mb-0.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Chỉ Số & Combo
              </strong>
              Căn thời gian càng chính xác sẽ nhận đánh giá cao và duy trì chuỗi Combo để đạt điểm tối đa.
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-extrabold text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Điều Kiện Chiến Thắng</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="font-extrabold text-slate-200 block">Dễ</span>
                <span className="text-amber-400 font-bold">Chính xác ≥70%</span>
                <span className="text-slate-400 block text-[9px]">Trượt ≤ 6</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="font-extrabold text-slate-200 block">Vừa</span>
                <span className="text-amber-400 font-bold">Chính xác ≥80%</span>
                <span className="text-slate-400 block text-[9px]">Trượt ≤ 7</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="font-extrabold text-slate-200 block">Khó</span>
                <span className="text-amber-400 font-bold">Chính xác ≥88%</span>
                <span className="text-slate-400 block text-[9px]">Trượt ≤ 5</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
        >
          <Check className="w-4 h-4" />
          Đã Hiểu - Bắt Đầu
        </button>
      </div>
    </div>
  );
};
