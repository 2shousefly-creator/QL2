import React, { useRef } from "react";
import { Coins, Timer, X } from "lucide-react";
import { formatChienTuyenDurationMs } from "../durationFormat";
import { ConfirmationDialog, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../../components/overlay/AppOverlay";

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
    <ConfirmationDialog status="warning"
      onClose={onCancel}
      closeOnBackdrop
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy="ct-quick-finish-title"
      describedBy="ct-quick-finish-description"
      panelProps={{ "data-quick-finish-confirm": "required" } as React.HTMLAttributes<HTMLElement>}
      initialFocusRef={cancelRef}
    >
      <OverlayHeader className="relative flex-col items-center text-center">
        <ModalButton variant="icon"
          type="button"
          onClick={onCancel}
          className="absolute right-3 top-3"
          aria-label="Hủy hoàn thành nhanh"
        >
          <X className="h-5 w-5" />
        </ModalButton>
        <div className="modal-status-icon">
          <Timer className="h-7 w-7" />
        </div>
        <h2
          id="ct-quick-finish-title"
          className="modal-title"
        >
          {confirmation.title}
        </h2>
      </OverlayHeader>

      <OverlayBody>
        <p
          id="ct-quick-finish-description"
          className="text-center text-xs font-semibold leading-relaxed text-[var(--modal-text)]"
        >
          Hoàn thành ngay {confirmation.subject} với{" "}
          <strong>{confirmation.costGold.toLocaleString("vi-VN")} Vàng</strong>?
        </p>

        <dl className="grid gap-2 text-sm">
          {confirmation.currentLevel !== undefined &&
            confirmation.targetLevel !== undefined && (
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold text-[var(--modal-muted)]">Cấp</dt>
                <dd className="font-semibold text-[var(--modal-text)]">
                  Lv{confirmation.currentLevel} → Lv{confirmation.targetLevel}
                </dd>
              </div>
            )}
          <div className="flex items-center justify-between gap-3">
            <dt className="font-semibold text-[var(--modal-muted)]">Thời gian còn lại</dt>
            <dd className="font-semibold text-[var(--modal-text)]">
              {formatChienTuyenDurationMs(confirmation.remainingMs)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="font-semibold text-[var(--modal-muted)]">Chi phí</dt>
            <dd className="flex items-center gap-1 font-semibold text-[var(--modal-reward)]">
              {confirmation.costGold.toLocaleString("vi-VN")}
              <Coins className="h-4 w-4" />
            </dd>
          </div>
        </dl>
      </OverlayBody>

      <OverlayFooter>
          <ModalButton variant="ghost"
            ref={cancelRef}
            type="button"
            onClick={onCancel}
          >
            HỦY
          </ModalButton>
          <ModalButton variant="primary"
            type="button"
            onClick={confirmation.onConfirm}
            data-quick-finish-charge="after-confirm"
          >
            XÁC NHẬN
          </ModalButton>
      </OverlayFooter>
    </ConfirmationDialog>
  );
};
