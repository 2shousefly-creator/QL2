import React, { useState } from "react";
import { Eye, MousePointerClick, RotateCw, ShieldAlert, Sparkles, ShieldCheck, ArrowRight, Check } from "lucide-react";
import { soundManager } from "../../../game/audio";

type FormationTutorialModalProps = {
  onClose: () => void;
};

export const FormationTutorialModal: React.FC<FormationTutorialModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<number>(0);

  const steps = [
    {
      icon: Eye,
      title: "1. Quan Sát Đội Hình",
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
      borderColor: "border-amber-500/30",
      description:
        "Khi bắt đầu vòng, hệ thống hiển thị một đội hình mẫu trên lưới trong thời gian ngắn. Quan sát kỹ vị trí, ký hiệu và hướng của từng quân cờ.",
    },
    {
      icon: MousePointerClick,
      title: "2. Triển Khai & Phục Dựng",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      borderColor: "border-cyan-500/30",
      description:
        "Sau khi mẫu ẩn đi, hãy kéo thả quân cờ từ khay Dự Bị lên lưới, hoặc chạm chọn một quân cờ rồi chạm ô đích để đặt hoặc đổi chỗ.",
    },
    {
      icon: RotateCw,
      title: "3. Xoay Hướng Quân Cờ",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      description:
        "Ở độ khó Vừa và Khó, các quân cờ có hướng. Chọn một quân cờ trên lưới hoặc khay và bấm nút xoay để điều chỉnh hướng 90° chính xác.",
    },
    {
      icon: ShieldAlert,
      title: "4. Ô Khóa & Mật Lệnh",
      color: "text-rose-400",
      bgColor: "bg-rose-500/20",
      borderColor: "border-rose-500/30",
      description:
        "Không đặt quân vào ô Khóa. Ở mức Khó, thực hiện phép biến đổi (Xoay 90°, Lật đối xứng...) lên mẫu đã ghi nhớ trước khi xếp.",
    },
    {
      icon: ShieldCheck,
      title: "5. Điều Kiện Chiến Thắng",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      borderColor: "border-emerald-500/30",
      description:
        "Hoàn thành tất cả các vòng mẫu: Dễ (5 vòng, sửa 2 lần), Vừa (6 vòng, sửa 1 lần), Khó (7 vòng, 0 lần sửa sai).",
    },
  ];

  const currentStep = steps[step];
  const IconComponent = currentStep.icon;

  const handleNext = () => {
    soundManager.playClick();
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col gap-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-100 uppercase tracking-wider">
              Hướng Dẫn Huấn Luyện
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Xếp Đội Hình
            </span>
          </div>
          <span className="text-xs font-extrabold text-slate-400">
            {step + 1} / {steps.length}
          </span>
        </div>

        {/* Step Body */}
        <div className="flex flex-col items-center text-center gap-3 my-2">
          <div
            className={`w-16 h-16 rounded-2xl ${currentStep.bgColor} border ${currentStep.borderColor} flex items-center justify-center ${currentStep.color} shadow-lg`}
          >
            <IconComponent className="w-8 h-8" />
          </div>

          <h3 className="font-extrabold text-base text-slate-100">
            {currentStep.title}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {currentStep.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === step
                  ? "w-6 bg-purple-500"
                  : idx < step
                  ? "w-2 bg-purple-500/40"
                  : "w-2 bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setStep(step - 1);
              }}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              Quay lại
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs"
            >
              Bỏ qua
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-1.5"
          >
            {step < steps.length - 1 ? (
              <>
                <span>Tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Hiểu Rõ — Bắt Đầu</span>
                <Check className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
