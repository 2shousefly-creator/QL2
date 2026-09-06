import React from "react";
import { BookOpen, CheckCircle2, ShieldCheck, Sparkles, X } from "lucide-react";
import { soundManager } from "../../../game/audio";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";

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
    <AppModal archetype="info"
      onClose={onClose}
      closeOnBackdrop
      labelledBy="big-small-rules-title"
    >
          {/* Header */}
          <OverlayHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[var(--modal-reward)]">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 id="big-small-rules-title" className="modal-title">
                  LUẬT CHƠI SỐ LỚN SỐ NHỎ
                </h3>
                <p className="modal-copy">
                  Quy tắc 3 xúc xắc & 2 cửa đặt cược
                </p>
              </div>
            </div>

            <ModalButton variant="icon"
              type="button"
              onClick={onClose}
              aria-label="Đóng luật chơi Số Lớn Số Nhỏ"
            >
              <X className="w-3.5 h-3.5" />
            </ModalButton>
          </OverlayHeader>

          {/* Body Content */}
          <OverlayBody className="text-xs text-[var(--modal-text)]">
            {/* Intro */}
            <div className="modal-section space-y-1">
              <p className="leading-relaxed">
                Trò chơi sử dụng <strong className="text-[var(--modal-text)]">3 xúc xắc 6 mặt</strong> (từ 1 đến 6). Sau khi lắc, kết quả thắng thua được tính dựa trên <strong className="text-[var(--modal-reward)]">tổng điểm của cả 3 viên xúc xắc</strong> (từ 3 đến 18 điểm).
              </p>
            </div>

            {/* 2 Bet Doors Breakdown */}
            <div className="space-y-2">
              <h4 className="font-semibold text-[var(--modal-reward)] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>2 CỬA ĐẶT CƯỢC & TỶ LỆ TRẢ THƯỞNG</span>
              </h4>

              <div className="space-y-2">
                <div className="modal-section space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[var(--modal-info)] text-sm">1. SỐ NHỎ (Tổng 3 – 10 Điểm)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[var(--modal-success)] border border-emerald-500/30 text-xs font-semibold">
                      1 ăn 1
                    </span>
                  </div>
                  <p className="text-[var(--modal-text)] text-xs leading-relaxed">
                    Thắng khi tổng điểm trên 3 viên xúc xắc rơi vào từ <strong className="text-[var(--modal-info)] font-bold">3 đến 10 điểm</strong> (bao gồm cả trường hợp bộ ba 1-1-1, 2-2-2, 3-3-3).
                  </p>
                </div>

                <div className="modal-section space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[var(--modal-reward)] text-sm">2. SỐ LỚN (Tổng 11 – 18 Điểm)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[var(--modal-success)] border border-emerald-500/30 text-xs font-semibold">
                      1 ăn 1
                    </span>
                  </div>
                  <p className="text-[var(--modal-text)] text-xs leading-relaxed">
                    Thắng khi tổng điểm trên 3 viên xúc xắc rơi vào từ <strong className="text-[var(--modal-reward)] font-bold">11 đến 18 điểm</strong> (bao gồm cả trường hợp bộ ba 4-4-4, 5-5-5, 6-6-6).
                  </p>
                </div>
              </div>
            </div>

            {/* Fair Rule Summary */}
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3 space-y-1 text-[var(--modal-success)]">
              <div className="flex items-center gap-1.5 font-bold text-[var(--modal-success)] text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>LUẬT TÍNH ĐIỂM MINH BẠCH</span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--modal-success)]">
                Tính trực tiếp theo tổng điểm thực tế của 3 xúc xắc, rơi trúng điểm ở cửa nào thì cửa đó thắng trọn vẹn, không áp dụng luật loại trừ bộ ba.
              </p>
            </div>

            {/* RNG Safety */}
            <div className="modal-section flex items-start gap-2 text-[var(--modal-muted)] text-xs">
              <ShieldCheck className="w-4 h-4 text-[var(--modal-success)] shrink-0 mt-0.5" />
              <span>
                Toàn bộ xúc xắc được sinh ngẫu nhiên độc lập bằng bộ tạo số ngẫu nhiên an toàn (RNG), đảm bảo hoàn toàn công bằng và minh bạch.
              </span>
            </div>
          </OverlayBody>

          {/* Footer CTA */}
          <OverlayFooter>
            <ModalButton variant="ghost"
              type="button"
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="w-full"
            >
              Đã hiểu
            </ModalButton>
          </OverlayFooter>
    </AppModal>
  );
};
