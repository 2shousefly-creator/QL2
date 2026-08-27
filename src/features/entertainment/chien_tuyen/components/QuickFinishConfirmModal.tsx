import React, { useEffect, useRef } from "react";
import { Coins, Timer, X } from "lucide-react";
import { formatChienTuyenDurationMs } from "../durationFormat";

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

  useEffect(() => {
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[290] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ct-quick-finish-title"
      aria-describedby="ct-quick-finish-description"
      data-quick-finish-confirm="required"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section className="ct-v2-pop-in max-h-[calc(100dvh-1.5rem)] w-[min(90vw,360px)] overflow-y-auto rounded-[2rem] border-4 border-white bg-[#fffaf0] p-5 text-slate-800 shadow-2xl">
        <button
          type="button"
          onClick={onCancel}
          className="ct-v2-icon-button ml-auto"
          aria-label="Hủy hoàn thành nhanh"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-[0_6px_0_#c55a16]">
          <Timer className="h-7 w-7" />
        </div>
        <h2
          id="ct-quick-finish-title"
          className="mt-4 text-center text-lg font-black"
        >
          {confirmation.title}
        </h2>
        <p
          id="ct-quick-finish-description"
          className="mt-2 text-center text-xs font-semibold leading-relaxed text-slate-600"
        >
          Hoàn thành ngay {confirmation.subject} với{" "}
          <strong>{confirmation.costGold.toLocaleString("vi-VN")} Vàng</strong>?
        </p>

        <dl className="mt-4 grid gap-2 rounded-2xl border-2 border-amber-100 bg-white p-3 text-xs">
          {confirmation.currentLevel !== undefined &&
            confirmation.targetLevel !== undefined && (
              <div className="flex items-center justify-between gap-3">
                <dt className="font-black text-slate-500">Cấp</dt>
                <dd className="font-black text-slate-800">
                  Lv{confirmation.currentLevel} → Lv{confirmation.targetLevel}
                </dd>
              </div>
            )}
          <div className="flex items-center justify-between gap-3">
            <dt className="font-black text-slate-500">Thời gian còn lại</dt>
            <dd className="font-black text-slate-800">
              {formatChienTuyenDurationMs(confirmation.remainingMs)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="font-black text-slate-500">Chi phí</dt>
            <dd className="flex items-center gap-1 font-black text-amber-700">
              {confirmation.costGold.toLocaleString("vi-VN")}
              <Coins className="h-4 w-4" />
            </dd>
          </div>
        </dl>

        <div className="mt-4 grid grid-cols-2 gap-2">
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
        </div>
      </section>
    </div>
  );
};
