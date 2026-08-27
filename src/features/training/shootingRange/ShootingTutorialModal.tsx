import React from "react";
import { X, Target, Crosshair, Hand, ShieldCheck } from "lucide-react";
import { soundManager } from "../../../game/audio";
import { SHOOTING_DIFFICULTY_CONFIGS } from "../../../game/training/shootingRange/shootingConfig";

type ShootingTutorialModalProps = {
  onClose: () => void;
};

export const ShootingTutorialModal: React.FC<ShootingTutorialModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-sm w-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm">Hướng Dẫn Bắn Súng</h3>
              <p className="text-[11px] text-slate-400">Thao trường ngắm bắn bia di động</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Streamlined Content */}
        <div className="p-4 flex flex-col gap-3 text-xs text-slate-300 leading-relaxed">
          {/* Controls */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-extrabold text-amber-400">
              <Hand className="w-4 h-4" />
              <span>Thao Tác Điều Khiển</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• <strong>Ngắm bắn:</strong> Chạm giữ &amp; vuốt ở bất kỳ đâu trên màn hình.</li>
              <li>• <strong>Bóp cò:</strong> Nhấn nút <span className="text-amber-400 font-bold">BẮN</span> màu cam (hồi 1 giây/phát).</li>
              <li>• <strong>Độ nhạy:</strong> Tùy chỉnh tốc độ ngắm (Thấp / Vừa / Cao) ở thanh trên.</li>
            </ul>
          </div>

          {/* Scoring & Rules */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-extrabold text-cyan-400">
              <Crosshair className="w-4 h-4" />
              <span>Quy Tắc Tính Điểm</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Bia có 10 vòng điểm (hồng tâm 10đ). Càng ngắm chuẩn tâm điểm càng cao. Trận kéo dài 60s với tối đa 10 bia xuất hiện.
            </p>
          </div>

          {/* Victory Requirements */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-extrabold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Yêu Cầu Đạt Chuẩn</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] pt-0.5">
              <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                <span className="font-extrabold text-slate-200 block">Dễ</span>
                <span className="text-amber-400 font-bold">
                  ≥{SHOOTING_DIFFICULTY_CONFIGS.easy.minScoreToWin}đ &amp; ≥
                  {Math.round(SHOOTING_DIFFICULTY_CONFIGS.easy.minAccuracyToWin * 100)}%
                </span>
              </div>
              <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                <span className="font-extrabold text-slate-200 block">Vừa</span>
                <span className="text-amber-400 font-bold">
                  ≥{SHOOTING_DIFFICULTY_CONFIGS.medium.minScoreToWin}đ &amp; ≥
                  {Math.round(SHOOTING_DIFFICULTY_CONFIGS.medium.minAccuracyToWin * 100)}%
                </span>
              </div>
              <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                <span className="font-extrabold text-slate-200 block">Khó</span>
                <span className="text-amber-400 font-bold">
                  ≥{SHOOTING_DIFFICULTY_CONFIGS.hard.minScoreToWin}đ &amp; ≥
                  {Math.round(SHOOTING_DIFFICULTY_CONFIGS.hard.minAccuracyToWin * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            ĐÃ HIỂU, BẮT ĐẦU
          </button>
        </div>
      </div>
    </div>
  );
};

