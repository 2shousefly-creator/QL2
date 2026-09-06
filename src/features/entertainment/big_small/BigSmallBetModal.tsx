import React, { useState, useEffect } from "react";
import { X, Trash2, Coins, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { BigSmallBetId, BigSmallBets } from "../types";
import {
  BIG_SMALL_DOOR_INFO,
  calculateTotalBigSmallBets,
  getMaxBetForBigSmallDoor,
  validateBet,
} from "./bigSmallEngine";
import { soundManager } from "../../../game/audio";
import { BetAmountControl } from "../BetAmountControl";
import { adjustBetInput, clampBetInput, getInitialBetInput } from "../betAmountInput";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";

interface BigSmallBetModalProps {
  isOpen: boolean;
  door: BigSmallBetId | null;
  currentGold: number;
  currentBets: BigSmallBets;
  previousRoundBet: number;
  onConfirmBet: (door: BigSmallBetId, amount: number) => void;
  onClearBet: (door: BigSmallBetId) => void;
  onClose: () => void;
}

export const BigSmallBetModal: React.FC<BigSmallBetModalProps> = ({
  isOpen,
  door,
  currentGold,
  currentBets,
  previousRoundBet,
  onConfirmBet,
  onClearBet,
  onClose,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const doorInfo = door ? BIG_SMALL_DOOR_INFO[door] : null;
  const currentDoorBet = door ? currentBets[door] || 0 : 0;
  const totalBets = calculateTotalBigSmallBets(currentBets);
  const otherDoorsBet = totalBets - currentDoorBet;
  const maxBet = door
    ? getMaxBetForBigSmallDoor(currentGold, currentBets, door)
    : 0;

  useEffect(() => {
    if (!isOpen || !door) return;
    setInputValue(getInitialBetInput(currentDoorBet, previousRoundBet, maxBet));
    setErrorMessage(null);
  }, [isOpen, door]);

  useEffect(() => {
    if (!isOpen || !door) return;
    setInputValue((currentValue) => clampBetInput(currentValue, maxBet));
  }, [isOpen, door, maxBet]);

  if (!isOpen || !door || !doorInfo) return null;

  const handleInputChange = (value: string) => {
    const raw = value;
    const cleaned = raw.replace(/[^\d]/g, "");
    setInputValue(cleaned);
    setErrorMessage(null);
  };

  const handleQuickAdjust = (delta: number) => {
    soundManager.playClick();
    setInputValue((currentValue) => adjustBetInput(currentValue, delta, maxBet));
    setErrorMessage(null);
  };

  const handleConfirm = () => {
    soundManager.playClick();
    const validation = validateBet(inputValue, maxBet);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Số Vàng cược không hợp lệ.");
      return;
    }

    if (validation.sanitizedAmount !== undefined) {
      onConfirmBet(door, validation.sanitizedAmount);
      onClose();
    }
  };

  const handleClear = () => {
    soundManager.playClick();
    onClearBet(door);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AppModal size="compact" archetype="transaction"
      onClose={onClose}
      closeOnBackdrop
      labelledBy="big-small-bet-title"
    >
          {/* Header */}
          <OverlayHeader className="flex items-center justify-between">
            <div>
              <h3 id="big-small-bet-title" className="modal-title">
                {doorInfo.name}
              </h3>
            </div>

            <ModalButton variant="icon"
              type="button"
              onClick={onClose}
              aria-label="Đóng đặt cược Số Lớn Số Nhỏ"
            >
              <X className="w-3.5 h-3.5" />
            </ModalButton>
          </OverlayHeader>

          <OverlayBody>
          {/* Breakdown Stats */}
          <div className="modal-section space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-[var(--modal-text)]">
              <span>Vàng hiện có:</span>
              <span className="font-bold text-[var(--modal-reward)] flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-[var(--modal-reward)]" />
                {currentGold.toLocaleString("vi-VN")} Vàng
              </span>
            </div>

            <div className="flex justify-between items-center text-[var(--modal-muted)] text-xs">
              <span>Đang cược cửa khác:</span>
              <span className="font-semibold text-[var(--modal-text)]">
                {otherDoorsBet.toLocaleString("vi-VN")} Vàng
              </span>
            </div>

            <div className="flex justify-between items-center text-[var(--modal-text)] pt-1 border-t border-slate-800/80 font-bold">
              <span>Có thể cược tối đa:</span>
              <span className="text-[var(--modal-success)]">
                {maxBet.toLocaleString("vi-VN")} Vàng
              </span>
            </div>
          </div>

          {/* Input Box */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--modal-text)] block">
              Số Vàng cược:
            </label>
            <BetAmountControl
              value={inputValue}
              maxBet={maxBet}
              onChange={handleInputChange}
              onQuickAdjust={handleQuickAdjust}
              onKeyDown={handleKeyDown}
            />

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-xs text-[var(--modal-danger)] font-medium pt-0.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </div>

          {/* Quick max bet helper */}
          {maxBet > 0 && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setInputValue(String(maxBet));
                  setErrorMessage(null);
                }}
                className="modal-control text-xs font-semibold text-[var(--modal-reward)] hover:text-[var(--modal-reward)] underline underline-offset-2 transition-colors py-0.5"
              >
                Cược tối đa ({maxBet.toLocaleString("vi-VN")})
              </button>
            </div>
          )}
          </OverlayBody>

          {/* Action Buttons */}
          <OverlayFooter
            className={` ${
              currentDoorBet > 0 ? "grid-cols-4" : ""
            } `}
          >
            <ModalButton variant="ghost"
              type="button"
              onClick={onClose}
            >
              Hủy
            </ModalButton>

            {currentDoorBet > 0 && (
              <ModalButton variant="primary"
                type="button"
                onClick={handleClear}
                title="Xóa cược cửa này"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span>Xóa</span>
              </ModalButton>
            )}

            <ModalButton variant="primary"
              type="button"
              onClick={handleConfirm}
            >
              Xác nhận
            </ModalButton>
          </OverlayFooter>
    </AppModal>
  );
};
