import React from "react";
import { Award, Sparkles, Check } from "lucide-react";
import { GameState } from "../game/types";
import { getMedalById } from "../game/medals/medalCatalog";
import { soundManager } from "../game/audio";
import { AppModal, ModalActions, ModalButton, OverlayBody, ResultHero } from "./overlay/AppOverlay";

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
    <AppModal status={"reward"} archetype="ceremony"
      notification
      onClose={handleClose}
      labelledBy="medal-unlock-title"
      panelClassName="text-center"

    >
          <ResultHero className="flex flex-col items-center">
          {/* Top Sparkles / Crown */}
          <div className="modal-status-icon">
            <Award className="w-7 h-7" />
          </div>

            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-[var(--modal-reward)] font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Huân Chương Mới!</span>
            </div>

            <h3 id="medal-unlock-title" className="modal-title">
              Chúc mừng đã đạt được
            </h3>
          </ResultHero>

          <OverlayBody>
            {/* Emblem Artwork */}
            <div className="flex justify-center">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center border text-4xl shadow-2xl bg-slate-900/90 ${medal.borderColor}`}
                style={{ boxShadow: `0 0 25px ${medal.glowColor}` }}
              >
                <span>{medal.iconSymbol}</span>
              </div>
            </div>

            <h4 className={`text-lg font-semibold ${medal.textColor}`}>
              {medal.name}
            </h4>

            <p className="modal-section text-xs text-[var(--modal-text)] leading-relaxed font-medium">
              {medal.description}
            </p>
          </OverlayBody>

          <ModalActions>
            <ModalButton variant="primary"
              type="button"
              onClick={handleClose}
              className="w-full"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Nhận Huân Chương</span>
            </ModalButton>
          </ModalActions>
    </AppModal>
  );
};
