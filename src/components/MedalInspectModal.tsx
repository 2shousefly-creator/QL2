import React from "react";
import { X } from "lucide-react";
import type { MedalDefinition } from "../game/medals/medalCatalog";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "./overlay/AppOverlay";

type MedalInspectModalProps = {
  medal: MedalDefinition | null;
  onClose: () => void;
};

export const MedalInspectModal: React.FC<MedalInspectModalProps> = ({ medal, onClose }) => {
  if (!medal) return null;

  return (
    <AppModal archetype="info"
      onClose={onClose}
      labelledBy="medal-inspect-title"
      panelClassName="text-center"

    >
        <OverlayHeader className="relative">
          <ModalButton variant="icon"
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3"
          aria-label="Đóng chi tiết Huân Chương"
        >
          <X className="w-4 h-4" />
          </ModalButton>

          <div className="flex justify-center my-3">
            <div className="modal-status-icon">
              <span>{medal.iconSymbol}</span>
            </div>
          </div>

          <h4 id="medal-inspect-title" className="modal-title">{medal.name}</h4>
          <p className="modal-copy text-[var(--modal-reward)] font-bold mt-0.5">{medal.categoryName}</p>
        </OverlayHeader>

        <OverlayBody>
          <p className="modal-section text-xs text-[var(--modal-text)] font-medium">
            {medal.description}
          </p>
        </OverlayBody>

        <OverlayFooter>
          <ModalButton variant="ghost" type="button" onClick={onClose} className="w-full">
            Đóng
          </ModalButton>
        </OverlayFooter>
    </AppModal>
  );
};
