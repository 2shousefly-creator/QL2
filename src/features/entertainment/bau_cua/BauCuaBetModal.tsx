import React, { useState, useEffect } from "react";
import { X, Trash2, Coins, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BauCuaBets, BauCuaSymbol } from "../types";
import {
  BAU_CUA_SYMBOL_INFO,
  calculateTotalBets,
  getMaxBetForDoor,
  validateBet,
} from "./bauCuaEngine";
import { soundManager } from "../../../game/audio";
import { BetAmountControl } from "../BetAmountControl";
import { adjustBetInput, clampBetInput, getInitialBetInput } from "../betAmountInput";

interface BauCuaBetModalProps {
  isOpen: boolean;
  door: BauCuaSymbol | null;
  currentGold: number;
  currentBets: BauCuaBets;
  previousRoundBet: number;
  onConfirmBet: (door: BauCuaSymbol, amount: number) => void;
  onClearBet: (door: BauCuaSymbol) => void;
  onClose: () => void;
}

export const BauCuaBetModal: React.FC<BauCuaBetModalProps> = ({
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

  const doorInfo = door ? BAU_CUA_SYMBOL_INFO[door] : null;
  const currentDoorBet = door ? currentBets[door] || 0 : 0;
  const totalBets = calculateTotalBets(currentBets);
  const otherDoorsBet = totalBets - currentDoorBet;
  const maxBet = door ? getMaxBetForDoor(currentGold, currentBets, door) : 0;

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
    // Allow typing only digits
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm"
        />

        {/* Modal Dialog (Centered & Compact) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 26, stiffness: 340 }}
          className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-700/90 rounded-2xl p-4 sm:p-4.5 shadow-2xl space-y-3 max-h-[88vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                {doorInfo.emoji}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-100 uppercase tracking-wide">
                  ĐẶT CƯỢC — {doorInfo.name}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Nhập số Vàng muốn cược cho cửa này
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Breakdown Stats */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Vàng hiện có:</span>
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {currentGold.toLocaleString("vi-VN")} Vàng
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Đang cược cửa khác:</span>
              <span className="font-semibold text-slate-200">
                {otherDoorsBet.toLocaleString("vi-VN")} Vàng
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-200 pt-1 border-t border-slate-800/80 font-bold">
              <span>Có thể cược tối đa:</span>
              <span className="text-emerald-400">
                {maxBet.toLocaleString("vi-VN")} Vàng
              </span>
            </div>
          </div>

          {/* Input Box */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">
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
                className="flex items-center gap-1.5 text-xs text-rose-400 font-medium pt-0.5"
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
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors py-0.5"
              >
                Cược tối đa ({maxBet.toLocaleString("vi-VN")})
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div
            className={`pt-1.5 grid ${
              currentDoorBet > 0 ? "grid-cols-4" : "grid-cols-2"
            } gap-2`}
          >
            <button
              type="button"
              onClick={onClose}
              className="col-span-1 min-h-[40px] px-2 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs sm:text-sm font-bold transition-all flex items-center justify-center text-center"
            >
              Hủy
            </button>

            {currentDoorBet > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="col-span-1 min-h-[40px] px-2 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all text-center"
                title="Xóa cược cửa này"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span>Xóa</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              className={`${
                currentDoorBet > 0 ? "col-span-2" : "col-span-1"
              } min-h-[40px] px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 text-xs sm:text-sm font-extrabold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center text-center`}
            >
              Xác nhận
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
