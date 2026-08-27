import React from "react";
import { X, BookOpen, AlertTriangle, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { soundManager } from "../../../game/audio";

interface BigSmallRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BigSmallRulesModal: React.FC<BigSmallRulesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

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

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 26, stiffness: 340 }}
          className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-100 uppercase tracking-wide">
                  LUẬT CHƠI SỐ LỚN SỐ NHỎ
                </h3>
                <p className="text-xs text-slate-400">
                  Quy tắc 3 xúc xắc & 2 cửa đặt cược
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

          {/* Body Content */}
          <div className="space-y-3.5 text-xs text-slate-300">
            {/* Intro */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
              <p className="leading-relaxed">
                Trò chơi sử dụng <strong className="text-slate-100">3 xúc xắc 6 mặt</strong> (từ 1 đến 6). Sau khi lắc, kết quả thắng thua được tính dựa trên <strong className="text-amber-400">tổng điểm của cả 3 viên xúc xắc</strong> (từ 3 đến 18 điểm).
              </p>
            </div>

            {/* 2 Bet Doors Breakdown */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>2 CỬA ĐẶT CƯỢC & TỶ LỆ TRẢ THƯỞNG</span>
              </h4>

              <div className="space-y-2">
                <div className="bg-slate-950/70 border border-sky-500/30 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-sky-300 text-sm">1. SỐ NHỎ (Tổng 3 – 10 Điểm)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                      1 ăn 1
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Thắng khi tổng điểm trên 3 viên xúc xắc rơi vào từ <strong className="text-sky-300 font-bold">3 đến 10 điểm</strong> (bao gồm cả trường hợp bộ ba 1-1-1, 2-2-2, 3-3-3).
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-amber-300 text-sm">2. SỐ LỚN (Tổng 11 – 18 Điểm)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                      1 ăn 1
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Thắng khi tổng điểm trên 3 viên xúc xắc rơi vào từ <strong className="text-amber-300 font-bold">11 đến 18 điểm</strong> (bao gồm cả trường hợp bộ ba 4-4-4, 5-5-5, 6-6-6).
                  </p>
                </div>
              </div>
            </div>

            {/* Fair Rule Summary */}
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3 space-y-1 text-emerald-200">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-[11px] uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>LUẬT TÍNH ĐIỂM MINH BẠCH</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-200/90">
                Tính trực tiếp theo tổng điểm thực tế của 3 xúc xắc, rơi trúng điểm ở cửa nào thì cửa đó thắng trọn vẹn, không áp dụng luật loại trừ bộ ba.
              </p>
            </div>

            {/* RNG Safety */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-start gap-2 text-slate-400 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Toàn bộ xúc xắc được sinh ngẫu nhiên độc lập bằng bộ tạo số ngẫu nhiên an toàn (RNG), đảm bảo hoàn toàn công bằng và minh bạch.
              </span>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold transition-all text-center border border-slate-700"
            >
              Đã hiểu
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
