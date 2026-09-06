import React, { useState } from "react";
import { Download, RefreshCw, AlertCircle, ShieldCheck } from "lucide-react";
import { soundManager } from "../game/audio";
import { performAppUpdate } from "./appUpdateService";
import { AppUpdateState } from "./updateTypes";
import { GameState } from "../game/types";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../components/overlay/AppOverlay";

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
    <AppModal size="compact" archetype="info" status={isError ? "danger" : "info"}
      layer="system"
      layout="viewport-safe"
      closeOnEscape={false}
      labelledBy="mandatory-update-title"
      describedBy="mandatory-update-desc"
      panelClassName="text-center"
      panelProps={{ role: "alertdialog" }}
    >
        <OverlayHeader className="relative z-10 flex flex-col items-center">
          {/* Top Icon Badge */}
          <div className="modal-status-icon">
            {isProcessing ? (
              <RefreshCw className="w-8 h-8 text-[var(--modal-reward)]" />
            ) : isError ? (
              <AlertCircle className="w-8 h-8 text-[var(--modal-danger)]" />
            ) : (
              <Download className="w-8 h-8 text-[var(--modal-reward)]" />
            )}
          </div>
          <h2 id="mandatory-update-title" className="modal-title">
            Đã có phiên bản mới
          </h2>
        </OverlayHeader>

        <OverlayBody className="relative z-10">
          <p id="mandatory-update-desc" className="text-sm font-medium text-[var(--modal-text)] leading-relaxed">
            {isError && "message" in updateState
              ? updateState.message
              : "Bạn cần cập nhật lên phiên bản mới để trò chơi được ổn định và có thêm các tính năng mới thú vị hơn."}
          </p>
          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-[var(--modal-success)] text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[var(--modal-success)]" />
            <span>Tiến trình game được sao lưu tự động an toàn</span>
          </div>
        </OverlayBody>

        <OverlayFooter className="relative z-10">
        <ModalButton variant="primary"
          type="button"
          onClick={handleUpdateClick}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing && <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
          <span>{getButtonText()}</span>
        </ModalButton>
        </OverlayFooter>
    </AppModal>
  );
};
