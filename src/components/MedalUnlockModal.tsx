import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Sparkles, Check } from "lucide-react";
import { GameState } from "../game/types";
import { getMedalById } from "../game/medals/medalCatalog";
import { soundManager } from "../game/audio";

type MedalUnlockModalProps = {
  gameState: GameState;
  onUpdateState: (updater: (draft: GameState) => void) => void;
};

export const MedalUnlockModal: React.FC<MedalUnlockModalProps> = ({ gameState, onUpdateState }) => {
  const pendingMedalId = gameState.ui?.pendingMedalUnlockPopup;
  if (!pendingMedalId) return null;

  const medal = getMedalById(pendingMedalId);
  if (!medal) return null;

  const handleClose = () => {
    soundManager.playClick();
    onUpdateState((draft) => {
      draft.ui.pendingMedalUnlockPopup = null;
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          className={`military-modal relative w-full max-w-sm rounded-3xl border p-6 text-center shadow-2xl bg-gradient-to-b ${medal.bgGradient} ${medal.borderColor}`}
          style={{ boxShadow: `0 0 30px ${medal.glowColor}` }}
        >
          {/* Top Sparkles / Crown */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-amber-400 border-2 border-amber-200 text-slate-950 flex items-center justify-center shadow-lg animate-bounce">
            <Award className="w-7 h-7" />
          </div>

          <div className="pt-4 space-y-3">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Huân Chương Mới!</span>
            </div>

            <h3 className="text-xl font-black text-slate-100">
              Chúc mừng đã đạt được
            </h3>

            {/* Emblem Artwork */}
            <div className="my-4 flex justify-center">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center border text-4xl shadow-2xl bg-slate-900/90 ${medal.borderColor}`}
                style={{ boxShadow: `0 0 25px ${medal.glowColor}` }}
              >
                <span>{medal.iconSymbol}</span>
              </div>
            </div>

            <h4 className={`text-lg font-black ${medal.textColor}`}>
              {medal.name}
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              {medal.description}
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Nhận Huân Chương</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
