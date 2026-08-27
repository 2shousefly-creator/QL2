import React, { useState } from "react";
import { Download, RefreshCw, AlertCircle, ShieldCheck } from "lucide-react";
import { soundManager } from "../game/audio";
import { performAppUpdate } from "./appUpdateService";
import { AppUpdateState } from "./updateTypes";
import { GameState } from "../game/types";

interface MandatoryUpdateModalProps {
  latestBuildId: string;
  currentState: GameState | null;
}

export const MandatoryUpdateModal: React.FC<MandatoryUpdateModalProps> = ({
  latestBuildId,
  currentState,
}) => {
  const [updateState, setUpdateState] = useState<AppUpdateState>({
    status: "required",
    installedBuildId: "",
    latestBuildId,
  });

  const handleUpdateClick = () => {
    soundManager.playClick();
    if (
      updateState.status === "backing-up" ||
      updateState.status === "installing" ||
      updateState.status === "reloading"
    ) {
      return;
    }

    performAppUpdate({
      targetBuildId: latestBuildId,
      currentState,
      onStateChange: (newState) => {
        setUpdateState(newState);
      },
    });
  };

  const isProcessing =
    updateState.status === "backing-up" ||
    updateState.status === "installing" ||
    updateState.status === "reloading";

  const isError = updateState.status === "error";

  const getButtonText = () => {
    switch (updateState.status) {
      case "backing-up":
        return "Đang sao lưu tiến trình...";
      case "installing":
        return "Đang tải phiên bản mới...";
      case "reloading":
        return "Đang hoàn tất cập nhật...";
      case "error":
        return "Thử cập nhật lại";
      default:
        return "Cập nhật lên phiên bản mới";
    }
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="mandatory-update-title"
      aria-describedby="mandatory-update-desc"
      tabIndex={-1}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none animate-fade-in"
      onKeyDown={(e) => {
        // Prevent dismissal with Escape
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 p-6 text-center shadow-2xl overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Icon Badge */}
        <div className="relative z-10 mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 shadow-inner">
          {isProcessing ? (
            <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
          ) : isError ? (
            <AlertCircle className="w-8 h-8 text-rose-400" />
          ) : (
            <Download className="w-8 h-8 text-amber-400" />
          )}
        </div>

        {/* Title */}
        <h2
          id="mandatory-update-title"
          className="relative z-10 text-xl font-black text-slate-100 tracking-wide mb-2"
        >
          Đã có phiên bản mới
        </h2>

        {/* Body Text */}
        <p
          id="mandatory-update-desc"
          className="relative z-10 text-sm font-medium text-slate-300 leading-relaxed mb-6"
        >
          {isError && "message" in updateState
            ? updateState.message
            : "Bạn cần cập nhật lên phiên bản mới để trò chơi được ổn định và có thêm các tính năng mới thú vị hơn."}
        </p>

        {/* Progress guarantee notice */}
        <div className="relative z-10 mb-6 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Tiến trình game được sao lưu tự động an toàn</span>
        </div>

        {/* Update Button */}
        <button
          type="button"
          onClick={handleUpdateClick}
          disabled={isProcessing}
          className={`relative z-10 w-full py-3.5 px-4 rounded-xl font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            isProcessing
              ? "bg-amber-600/60 text-amber-100 cursor-not-allowed opacity-90"
              : isError
              ? "bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/50"
              : "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 border border-amber-300/40 shadow-amber-500/20"
          }`}
        >
          {isProcessing && <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
          <span>{getButtonText()}</span>
        </button>
      </div>
    </div>
  );
};
