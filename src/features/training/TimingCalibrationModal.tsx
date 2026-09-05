import React, { useState } from "react";
import { Sliders, Check, X, Volume2 } from "lucide-react";
import { soundManager } from "../../game/audio";
import { AppModal, OverlayBody, OverlayFooter, OverlayHeader } from "../../components/overlay/AppOverlay";

type TimingCalibrationModalProps = {
  currentOffsetMs: number;
  onSave: (newOffsetMs: number) => void;
  onClose: () => void;
};

export const TimingCalibrationModal: React.FC<TimingCalibrationModalProps> = ({
  currentOffsetMs,
  onSave,
  onClose,
}) => {
  const [offsetMs, setOffsetMs] = useState<number>(currentOffsetMs);
  const [testTaps, setTestTaps] = useState<number[]>([]);

  const handleTestTap = () => {
    soundManager.playRhythmHit("perfect");
    const now = performance.now();
    setTestTaps((prev) => [...prev.slice(-4), now]);
  };

  return (
    <AppModal
      onClose={onClose}
      labelledBy="timing-calibration-title"
      panelClassName="max-w-md border-slate-700 bg-slate-900 text-slate-100"
    >
        <OverlayHeader className="flex items-center justify-between border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 id="timing-calibration-title" className="font-bold text-base text-amber-300">Hiệu Chỉnh Độ Lệch Nhịp</h3>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg"
            aria-label="Đóng hiệu chỉnh nhịp"
          >
            <X className="w-5 h-5" />
          </button>
        </OverlayHeader>

        <OverlayBody className="flex flex-col gap-5">
        <p className="text-xs text-slate-300 leading-relaxed">
          Nếu nốt rơi lệch âm thanh hoặc thiết bị có độ trễ, hãy điều chỉnh thời gian dưới đây:
        </p>

        {/* Offset Slider */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Độ lệch nhịp</span>
            <span className="text-sm font-mono font-bold text-amber-400">
              {offsetMs > 0 ? `+${offsetMs}` : offsetMs} ms
            </span>
          </div>
          <input
            type="range"
            min="-150"
            max="150"
            step="5"
            value={offsetMs}
            onChange={(e) => setOffsetMs(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>-150 ms (Chậm)</span>
            <span>0 ms (Mặc định)</span>
            <span>+150 ms (Nhanh)</span>
          </div>
        </div>

        {/* Test Tap Button */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleTestTap}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-amber-300 active:scale-98 transition-all"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            Chạm Thử Âm Nhịp
          </button>
          {testTaps.length > 0 && (
            <span className="text-[11px] text-slate-400">
              Đã ghi nhận {testTaps.length} nhịp thử nghiệm.
            </span>
          )}
        </div>
        </OverlayBody>

        {/* Action Buttons */}
        <OverlayFooter className="flex items-center gap-3 border-slate-800 bg-slate-900">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onSave(offsetMs);
              onClose();
            }}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Check className="w-4 h-4" />
            Lưu
          </button>
        </OverlayFooter>
    </AppModal>
  );
};
