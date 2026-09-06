import React from "react";
import { Award, ChevronRight, Clock, Droplets, Egg, ShieldCheck, Sparkles, Sprout, Zap } from "lucide-react";
import { DelegationReportData } from "../game/types";
import { formatDurationVi } from "../game/xpEngine";
import { soundManager } from "../game/audio";
import { GameResultModal, ModalActions, ModalButton, OverlayBody, ResultHero } from "./overlay/AppOverlay";

type DelegationReportModalProps = {
  report: DelegationReportData;
  onAction: (action: DelegationReportData["topPriority"]) => void;
  onDismiss: () => void;
};

export const DelegationReportModal: React.FC<DelegationReportModalProps> = ({
  report,
  onAction,
  onDismiss,
}) => {
  // Opening contextual sentence
  let contextSentence = "Trong thời gian vắng mặt, mọi hoạt động vẫn tiếp tục.";
  if (report.isFullNow || report.wasFullBefore) {
    contextSentence = "Đã đủ XP. Thử thách thăng cấp đang chờ.";
  } else if (
    report.readyCropCount > 0 ||
    report.pendingWateringCount > 0 ||
    report.eggInventoryTotal > 0
  ) {
    contextSentence = "Tăng Gia đang có nông sản cần xử lý.";
  } else if (report.newlyUnlockedMedals && report.newlyUnlockedMedals.length > 0) {
    contextSentence = "Bạn đã mở khóa mốc thưởng / huân chương mới.";
  }

  // Priority text
  let priorityLabel = "Tiếp tục hành trình";
  if (report.topPriority === "xp_full") {
    priorityLabel = "Thực hiện thử thách thăng cấp";
  } else if (report.topPriority === "watering") {
    priorityLabel = `${report.pendingWateringCount} ô đất đang thiếu nước`;
  } else if (report.topPriority === "harvest") {
    priorityLabel = `${report.readyCropCount} cây đã sẵn sàng thu hoạch`;
  } else if (report.topPriority === "animal_egg") {
    priorityLabel = `${report.eggInventoryTotal} trứng đang chờ bán`;
  } else if (report.topPriority === "medals") {
    priorityLabel = "Xem huân chương vừa mở khóa";
  }

  const handlePrimaryClick = () => {
    soundManager.playClick();
    onAction(report.topPriority);
  };

  const handleSecondaryClick = () => {
    soundManager.playClick();
    onDismiss();
  };

  return (
    <GameResultModal status={"info"}
      onClose={handleSecondaryClick}
      labelledBy="delegation-report-title"
    >
        {/* Header */}
        <ResultHero className="theme-divider flex items-start">
          <div className="theme-badge p-2.5 rounded-xl border shrink-0 mt-0.5">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 id="delegation-report-title" className="modal-title flex items-center gap-2">
                <span>📨</span> BÁO CÁO TRỞ LẠI
              </h3>
            </div>
            <p className="modal-copy theme-text-accent font-semibold mt-0.5">
              Vắng mặt: {formatDurationVi(report.elapsedMs)}
            </p>
            <p className="modal-copy text-[var(--modal-text)] mt-1.5 italic">
              “{contextSentence}”
            </p>
          </div>
        </ResultHero>

        {/* Content Body Cards */}
        <OverlayBody>
          {/* CARD 1: XP / Ủy Thác */}
          {report.isFullNow || report.wasFullBefore ? (
            <div className="bg-amber-950/40 border border-amber-500/50 p-4 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--modal-reward)] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--modal-reward)]" />
                  ⭐ XP ĐÃ ĐẦY
                </span>
                <span className="text-xs font-bold text-[var(--modal-reward)]">Đã đầy 100%</span>
              </div>
              <div className="text-2xl font-semibold text-[var(--modal-reward)]">
                +{report.earnedXp} XP
              </div>
              <div className="text-xs font-semibold text-[var(--modal-reward)]">
                Đã đạt giới hạn thăng cấp
              </div>
              <div className="text-xs text-[var(--modal-reward)]">
                XP đã đầy trong thời gian bạn vắng mặt. Thực hiện thử thách thăng cấp ngay!
              </div>
            </div>
          ) : (
            <div className="modal-section space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--modal-info)] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[var(--modal-info)]" />
                  ⚡ KẾT QUẢ ỦY THÁC
                </span>
                <span className="text-xs text-[var(--modal-muted)]">{report.currentRankName}</span>
              </div>
              <div className="theme-text-accent text-xl font-semibold flex items-center gap-1.5">
                +{report.earnedXp} XP
              </div>
              <div className="text-xs text-[var(--modal-muted)]">
                Tích lũy trong {formatDurationVi(report.elapsedMs)}
              </div>
            </div>
          )}

          {/* CARD 2: Vườn cây */}
          {(report.readyCropCount > 0 ||
            report.pendingWateringCount > 0 ||
            (report.growingCropCount > 0 && report.elapsedMs >= 3_600_000)) && (
            <div className="modal-section space-y-1.5">
              <div className="text-xs font-bold text-[var(--modal-success)] uppercase tracking-wider flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-[var(--modal-success)]" />
                🌾 VƯỜN CÂY
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                {report.readyCropCount > 0 && (
                  <div className="text-[var(--modal-success)] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {report.readyCropCount} cây có thể Thu Hoạch
                  </div>
                )}
                {report.pendingWateringCount > 0 && (
                  <div className="text-[var(--modal-info)] font-semibold flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-[var(--modal-info)] shrink-0" />
                    {report.pendingWateringCount} ô đất đang thiếu nước
                  </div>
                )}
                {report.growingCropCount > 0 &&
                  report.readyCropCount === 0 &&
                  report.pendingWateringCount === 0 && (
                    <div className="text-[var(--modal-text)] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                      {report.growingCropCount} ô đang phát triển
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* CARD 3: Chuồng nuôi */}
          {(report.eggInventoryTotal > 0 || report.feedEmpty) && (
            <div className="modal-section space-y-1.5">
              <div className="text-xs font-bold text-[var(--modal-reward)] uppercase tracking-wider flex items-center gap-1.5">
                <Egg className="w-3.5 h-3.5 text-[var(--modal-reward)]" />
                🥚 CHUỒNG NUÔI
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                {report.eggInventoryTotal > 0 && (
                  <div className="text-[var(--modal-reward)] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {report.eggInventoryTotal} trứng đang chờ bán
                  </div>
                )}
                {report.feedEmpty && (
                  <div className="text-[var(--modal-muted)] text-xs flex items-center gap-1.5 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    Máng ăn đã hết (vật nuôi sản xuất ở tốc độ thường)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CARD 4: Huân chương mới */}
          {report.newlyUnlockedMedals && report.newlyUnlockedMedals.length > 0 && (
            <div className="modal-section space-y-2">
              <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                🎖️ {report.newlyUnlockedMedals.length > 1 ? `${report.newlyUnlockedMedals.length} HUÂN CHƯƠNG MỚI` : "CỘT MỐC MỚI"}
              </div>
              <div className="space-y-1.5">
                {report.newlyUnlockedMedals.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2.5 bg-purple-950/30 p-2 rounded-lg border border-purple-500/20"
                  >
                    <span className="text-xl">{m.iconSymbol}</span>
                    <div>
                      <div className="font-bold text-xs text-purple-200">{m.name}</div>
                      {m.description && (
                        <div className="text-xs text-purple-300/80">{m.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CARD 5: Ưu tiên tiếp theo */}
          <div className="theme-surface border p-3 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="theme-text-accent font-bold shrink-0">⭐ Ưu tiên:</span>
              <span className="font-semibold text-[var(--modal-text)] line-clamp-1">{priorityLabel}</span>
            </div>
          </div>
        </OverlayBody>

        {/* Buttons */}
        <ModalActions>
          {/* Primary CTA */}
          {report.topPriority === "xp_full" && (
            <ModalButton variant="primary"
              type="button"
              onClick={handlePrimaryClick}
              className="w-full"
            >
              <Sparkles className="w-4 h-4" />
              <span>Thăng Cấp Ngay</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </ModalButton>
          )}

          {report.topPriority === "watering" && (
            <ModalButton variant="primary"
              type="button"
              onClick={handlePrimaryClick}
              className="w-full"
            >
              <Droplets className="w-4 h-4" />
              <span>Đến Vườn Cây</span>
            </ModalButton>
          )}

          {report.topPriority === "harvest" && (
            <ModalButton variant="primary"
              type="button"
              onClick={handlePrimaryClick}
              className="w-full"
            >
              <Sprout className="w-4 h-4" />
              <span>Đến Vườn Cây</span>
            </ModalButton>
          )}

          {report.topPriority === "animal_egg" && (
            <ModalButton variant="primary"
              type="button"
              onClick={handlePrimaryClick}
              className="w-full"
            >
              <Egg className="w-4 h-4" />
              <span>Đến Chuồng Nuôi</span>
            </ModalButton>
          )}

          {report.topPriority === "medals" && (
            <ModalButton variant="primary"
              type="button"
              onClick={handlePrimaryClick}
              className="w-full"
            >
              <Award className="w-4 h-4" />
              <span>Xem Huân Chương</span>
            </ModalButton>
          )}

          {report.topPriority === "continue" && (
            <ModalButton variant="ghost"
              type="button"
              onClick={handleSecondaryClick}
              className="w-full"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Tiếp Tục Chơi</span>
            </ModalButton>
          )}

          {/* Secondary CTA when topPriority is not continue */}
          {report.topPriority !== "continue" && (
            <ModalButton variant="primary"
              type="button"
              onClick={handleSecondaryClick}
              className="w-full"
            >
              Tiếp Tục
            </ModalButton>
          )}
        </ModalActions>
    </GameResultModal>
  );
};
