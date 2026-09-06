import React, { useEffect } from "react";
import { Award, ChevronRight, X, BellRing } from "lucide-react";
import { soundManager } from "../game/audio";
import { ModalButton, OverlayPortal } from "./overlay/AppOverlay";

type RankUpNotificationBannerProps = {
  rankName: string;
  onOpenJourney: () => void;
  onDismiss: () => void;
};

export const RankUpNotificationBanner: React.FC<RankUpNotificationBannerProps> = ({
  rankName,
  onOpenJourney,
  onDismiss,
}) => {
  useEffect(() => {
    soundManager.playXpFull();
    soundManager.triggerHaptic("heavy");
  }, []);

  return (
    <OverlayPortal>
    <div className="app-overlay-toast modal-design" data-modal-archetype="ceremony" data-modal-status="reward" data-interactive="true" role="status">
      <div className="modal-toast relative flex flex-wrap items-center gap-3 sm:flex-nowrap">
        <div className="modal-status-icon"><Award /></div>

        {/* Content */}
        <div className="min-w-0 flex-1 pr-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 uppercase tracking-wider">
            <BellRing className="w-3.5 h-3.5 text-amber-400" />
            <span>Thanh XP Đã Đầy 100%!</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-semibold mt-0.5">
            Sẵn sàng thăng cấp bậc <span className="text-amber-300 font-semibold">{rankName}</span>
          </p>
          <p className="modal-meta leading-tight mt-0.5">
            Nhấn vào đây để tiến hành làm thử thách xét duyệt thăng cấp mới.
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full shrink-0 items-center justify-end gap-1.5 sm:w-auto">
          <ModalButton
            onClick={() => {
              soundManager.playClick();
              onOpenJourney();
            }}
            variant="primary"
          >
            <span>Thử Thách</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </ModalButton>

          <ModalButton
            onClick={() => {
              soundManager.playClick();
              onDismiss();
            }}
            variant="icon"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </ModalButton>
        </div>
      </div>
    </div>
    </OverlayPortal>
  );
};
