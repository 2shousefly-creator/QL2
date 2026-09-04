import React from "react";
import {
  Clock,
  Zap,
  Sprout,
  Droplets,
  Egg,
  AlertTriangle,
  Award,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { DelegationReportData } from "../game/types";
import { formatDurationVi } from "../game/xpEngine";
import { soundManager } from "../game/audio";

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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn overflow-y-auto">
      <div className="military-modal theme-card-accent w-full max-w-md bg-slate-900/95 border rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col space-y-4 my-auto">
        {/* Header */}
        <div className="theme-divider flex items-start gap-3 border-b pb-3.5">
          <div className="theme-badge p-2.5 rounded-xl border shrink-0 mt-0.5">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-100 tracking-wide uppercase flex items-center gap-2">
                <span>📨</span> BÁO CÁO TRỞ LẠI
              </h3>
            </div>
            <p className="theme-text-accent text-xs font-semibold mt-0.5">
              Vắng mặt: {formatDurationVi(report.elapsedMs)}
            </p>
            <p className="text-xs text-slate-300 mt-1.5 italic">
              “{contextSentence}”
            </p>
          </div>
        </div>

        {/* Content Body Cards */}
        <div className="space-y-3">
          {/* CARD 1: XP / Ủy Thác */}
          {report.isFullNow || report.wasFullBefore ? (
            <div className="bg-amber-950/40 border border-amber-500/50 p-4 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  ⭐ XP ĐÃ ĐẦY
                </span>
                <span className="text-xs font-bold text-amber-300/80">100% Bar</span>
              </div>
              <div className="text-2xl font-black text-amber-300">
                +{report.earnedXp} XP
              </div>
              <div className="text-xs font-semibold text-amber-200">
                Đã đạt giới hạn thăng cấp
              </div>
              <div className="text-[11px] text-amber-300/70">
                XP đã đầy trong thời gian bạn vắng mặt. Thực hiện thử thách thăng cấp ngay!
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  ⚡ KẾT QUẢ ỦY THÁC
                </span>
                <span className="text-xs text-slate-400">{report.currentRankName}</span>
              </div>
              <div className="theme-text-accent text-xl font-extrabold flex items-center gap-1.5">
                +{report.earnedXp} XP
              </div>
              <div className="text-xs text-slate-400">
                Tích lũy trong {formatDurationVi(report.elapsedMs)}
              </div>
            </div>
          )}

          {/* CARD 2: Vườn cây */}
          {(report.readyCropCount > 0 ||
            report.pendingWateringCount > 0 ||
            (report.growingCropCount > 0 && report.elapsedMs >= 3_600_000)) && (
            <div className="bg-slate-950/60 border border-emerald-500/30 p-3.5 rounded-xl space-y-1.5">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                🌾 VƯỜN CÂY
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                {report.readyCropCount > 0 && (
                  <div className="text-emerald-300 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {report.readyCropCount} cây có thể Thu Hoạch
                  </div>
                )}
                {report.pendingWateringCount > 0 && (
                  <div className="text-sky-300 font-semibold flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    {report.pendingWateringCount} ô đất đang thiếu nước
                  </div>
                )}
                {report.growingCropCount > 0 &&
                  report.readyCropCount === 0 &&
                  report.pendingWateringCount === 0 && (
                    <div className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                      {report.growingCropCount} ô đang phát triển
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* CARD 3: Chuồng nuôi */}
          {(report.eggInventoryTotal > 0 || report.feedEmpty) && (
            <div className="bg-slate-950/60 border border-amber-500/30 p-3.5 rounded-xl space-y-1.5">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Egg className="w-3.5 h-3.5 text-amber-400" />
                🥚 CHUỒNG NUÔI
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                {report.eggInventoryTotal > 0 && (
                  <div className="text-amber-200 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {report.eggInventoryTotal} trứng đang chờ bán
                  </div>
                )}
                {report.feedEmpty && (
                  <div className="text-slate-400 text-xs flex items-center gap-1.5 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    Máng ăn đã hết (vật nuôi sản xuất ở tốc độ thường)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CARD 4: Huân chương mới */}
          {report.newlyUnlockedMedals && report.newlyUnlockedMedals.length > 0 && (
            <div className="bg-slate-950/60 border border-purple-500/40 p-3.5 rounded-xl space-y-2">
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
                        <div className="text-[11px] text-purple-300/80">{m.description}</div>
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
              <span className="font-semibold text-slate-200 line-clamp-1">{priorityLabel}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          {/* Primary CTA */}
          {report.topPriority === "xp_full" && (
            <button
              type="button"
              onClick={handlePrimaryClick}
              className="theme-button-primary theme-focus w-full py-3 rounded-xl font-black text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99] focus:outline-none"
            >
              <Sparkles className="w-4 h-4" />
              <span>Thăng Cấp Ngay</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}

          {report.topPriority === "watering" && (
            <button
              type="button"
              onClick={handlePrimaryClick}
              className="theme-focus w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] focus:outline-none"
            >
              <Droplets className="w-4 h-4" />
              <span>Đến Vườn Cây</span>
            </button>
          )}

          {report.topPriority === "harvest" && (
            <button
              type="button"
              onClick={handlePrimaryClick}
              className="theme-focus w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] focus:outline-none"
            >
              <Sprout className="w-4 h-4" />
              <span>Đến Vườn Cây</span>
            </button>
          )}

          {report.topPriority === "animal_egg" && (
            <button
              type="button"
              onClick={handlePrimaryClick}
              className="theme-focus w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] focus:outline-none"
            >
              <Egg className="w-4 h-4" />
              <span>Đến Chuồng Nuôi</span>
            </button>
          )}

          {report.topPriority === "medals" && (
            <button
              type="button"
              onClick={handlePrimaryClick}
              className="theme-focus w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] focus:outline-none"
            >
              <Award className="w-4 h-4" />
              <span>Xem Huân Chương</span>
            </button>
          )}

          {report.topPriority === "continue" && (
            <button
              type="button"
              onClick={handleSecondaryClick}
              className="theme-focus w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.99] focus:outline-none"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Tiếp Tục Chơi</span>
            </button>
          )}

          {/* Secondary CTA when topPriority is not continue */}
          {report.topPriority !== "continue" && (
            <button
              type="button"
              onClick={handleSecondaryClick}
              className="theme-focus w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-semibold text-xs tracking-wide transition-colors focus:outline-none"
            >
              Tiếp Tục
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
