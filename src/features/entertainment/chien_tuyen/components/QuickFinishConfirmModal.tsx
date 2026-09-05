import React, { useRef } from "react";
import { Coins, Timer, X } from "lucide-react";
import { formatChienTuyenDurationMs } from "../durationFormat";
import { AppModal, OverlayBody, OverlayFooter, OverlayHeader } from "../../../../components/overlay/AppOverlay";

export interface QuickFinishConfirmation {
  id: string;
  title: string;
  subject: string;
  currentLevel?: number;
  targetLevel?: number;
  remainingMs: number;
  costGold: number;
  onConfirm: () => void;
}

interface QuickFinishConfirmModalProps {
  confirmation: QuickFinishConfirmation;
  onCancel: () => void;
}

export const QuickFinishConfirmModal: React.FC<
  QuickFinishConfirmModalProps
> = ({ confirmation, onCancel }) => {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  return (
    <AppModal
      onClose={onCancel}
      closeOnBackdrop
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy="ct-quick-finish-title"
      describedBy="ct-quick-finish-description"
      panelClassName="ct-v2-modal max-w-sm"
      panelProps={{ "data-quick-finish-confirm": "required" } as React.HTMLAttributes<HTMLElement>}
      initialFocusRef={cancelRef}
    >
      <OverlayHeader className="ct-v2-modal-header relative flex-col items-center text-center">
        <button
          type="button"
          onClick={onCancel}
          className="ct-v2-icon-button app-overlay__close absolute right-3 top-3"
          aria-label="Hủy hoàn thành nhanh"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-amber-300/70 bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950 shadow-lg shadow-orange-950/40">
          <Timer className="h-7 w-7" />
        </div>
        <h2
          id="ct-quick-finish-title"
          className="mt-3 text-center text-lg font-black text-white"
        >
          {confirmation.title}
        </h2>
      </OverlayHeader>

      <OverlayBody>
        <p
          id="ct-quick-finish-description"
          className="text-center text-xs font-semibold leading-relaxed text-slate-300"
        >
          Hoàn thành ngay {confirmation.subject} với{" "}
          <strong>{confirmation.costGold.toLocaleString("vi-VN")} Vàng</strong>?
        </p>

        <dl className="mt-4 grid gap-2 rounded-2xl border border-amber-300/30 bg-slate-950/70 p-3 text-xs">
          {confirmation.currentLevel !== undefined &&
            confirmation.targetLevel !== undefined && (
              <div className="flex items-center justify-between gap-3">
                <dt className="font-black text-slate-400">Cấp</dt>
                <dd className="font-black text-slate-100">
                  Lv{confirmation.currentLevel} → Lv{confirmation.targetLevel}
                </dd>
              </div>
            )}
          <div className="flex items-center justify-between gap-3">
            <dt className="font-black text-slate-400">Thời gian còn lại</dt>
            <dd className="font-black text-slate-100">
              {formatChienTuyenDurationMs(confirmation.remainingMs)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="font-black text-slate-400">Chi phí</dt>
            <dd className="flex items-center gap-1 font-black text-amber-300">
              {confirmation.costGold.toLocaleString("vi-VN")}
              <Coins className="h-4 w-4" />
            </dd>
          </div>
        </dl>
      </OverlayBody>

      <OverlayFooter className="ct-v2-modal-footer grid grid-cols-2 gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="ct-v2-secondary-button"
          >
            HỦY
          </button>
          <button
            type="button"
            onClick={confirmation.onConfirm}
            className="ct-v2-primary-button"
            data-quick-finish-charge="after-confirm"
          >
            XÁC NHẬN
          </button>
      </OverlayFooter>
    </AppModal>
  );
};
