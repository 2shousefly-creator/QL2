import React from "react";
import { X } from "lucide-react";
import type { MedalDefinition } from "../game/medals/medalCatalog";

type MedalInspectModalProps = {
  medal: MedalDefinition | null;
  onClose: () => void;
};

export const MedalInspectModal: React.FC<MedalInspectModalProps> = ({ medal, onClose }) => {
  if (!medal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div
        className={`military-modal relative w-full max-w-xs rounded-3xl border p-5 text-center shadow-2xl bg-gradient-to-b ${medal.bgGradient} ${medal.borderColor}`}
        style={{ boxShadow: `0 0 25px ${medal.glowColor}` }}
      >
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

        <h4 className={`text-base font-black ${medal.textColor}`}>{medal.name}</h4>
        <p className="text-xs text-amber-300 font-bold mt-0.5">{medal.categoryName}</p>

        <p className="text-xs text-slate-300 mt-2 font-medium bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          {medal.description}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
