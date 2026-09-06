import React, { useState } from "react";
import { Sliders, Check, X, Volume2 } from "lucide-react";
import { soundManager } from "../../game/audio";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../components/overlay/AppOverlay";

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
    <AppModal size="compact" archetype="info"
      onClose={onClose}
      labelledBy="timing-calibration-title"
    >
        <OverlayHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[var(--modal-reward)]" />
            <h3 id="timing-calibration-title" className="modal-title">Hiệu Chỉnh Độ Lệch Nhịp</h3>
          </div>
          <ModalButton variant="icon"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            aria-label="Đóng hiệu chỉnh nhịp"
          >
            <X className="w-5 h-5" />
          </ModalButton>
        </OverlayHeader>

        <OverlayBody className="flex flex-col">
        <p className="text-xs text-[var(--modal-text)] leading-relaxed">
          Nếu nốt rơi lệch âm thanh hoặc thiết bị có độ trễ, hãy điều chỉnh thời gian dưới đây:
        </p>

        {/* Offset Slider */}
        <div className="modal-section flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--modal-text)]">Độ lệch nhịp</span>
            <span className="text-sm font-mono font-bold text-[var(--modal-reward)]">
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
          <div className="flex justify-between text-xs font-mono text-[var(--modal-muted)]">
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
            className="modal-control w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[var(--modal-reward)] active:scale-98 transition-all"
          >
            <Volume2 className="w-4 h-4 text-[var(--modal-reward)]" />
            Chạm Thử Âm Nhịp
          </button>
          {testTaps.length > 0 && (
            <span className="text-xs text-[var(--modal-muted)]">
              Đã ghi nhận {testTaps.length} nhịp thử nghiệm.
            </span>
          )}
        </div>
        </OverlayBody>

        {/* Action Buttons */}
        <OverlayFooter className="flex items-center">
          <ModalButton variant="ghost"
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="flex-1"
          >
            Hủy
          </ModalButton>
          <ModalButton variant="primary"
            type="button"
            onClick={() => {
              soundManager.playClick();
              onSave(offsetMs);
              onClose();
            }}
            className="flex-1"
          >
            <Check className="w-4 h-4" />
            Lưu
          </ModalButton>
        </OverlayFooter>
    </AppModal>
  );
};
