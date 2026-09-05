import React from "react";
import { X } from "lucide-react";
import type { MedalDefinition } from "../game/medals/medalCatalog";
import { AppModal, OverlayBody, OverlayFooter, OverlayHeader } from "./overlay/AppOverlay";

type MedalInspectModalProps = {
  medal: MedalDefinition | null;
  onClose: () => void;
};

export const MedalInspectModal: React.FC<MedalInspectModalProps> = ({ medal, onClose }) => {
  if (!medal) return null;

  return (
    <AppModal
      onClose={onClose}
      labelledBy="medal-inspect-title"
      panelClassName={`w-full max-w-xs rounded-3xl border text-center shadow-2xl bg-gradient-to-b ${medal.bgGradient} ${medal.borderColor}`}
      panelProps={{ style: { boxShadow: `0 0 25px ${medal.glowColor}` } }}
    >
        <OverlayHeader className="relative p-5 pb-2">
          <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 text-slate-400 hover:text-white flex items-center justify-center"
          aria-label="Đóng chi tiết Huân Chương"
        >
          <X className="w-4 h-4" />
          </button>

          <div className="flex justify-center my-3">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border text-3xl shadow-lg bg-slate-900/90 ${medal.borderColor}`}>
              <span>{medal.iconSymbol}</span>
            </div>
          </div>

          <h4 id="medal-inspect-title" className={`text-base font-black ${medal.textColor}`}>{medal.name}</h4>
          <p className="text-xs text-amber-300 font-bold mt-0.5">{medal.categoryName}</p>
        </OverlayHeader>

        <OverlayBody className="px-5 py-2">
          <p className="text-xs text-slate-300 font-medium bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            {medal.description}
          </p>
        </OverlayBody>

        <OverlayFooter className="p-5 pt-2">
          <button type="button" onClick={onClose} className="w-full min-h-11 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors">
            Đóng
          </button>
        </OverlayFooter>
    </AppModal>
  );
};
