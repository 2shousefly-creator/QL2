import React, { useEffect } from "react";
import { Award, ChevronRight, X, BellRing } from "lucide-react";
import { soundManager } from "../game/audio";

type RankUpNotificationBannerProps = {
  rankName: string;
  onOpenJourney: () => void;
  onDismiss: () => void;
};

export const RankUpNotificationBanner: React.FC<RankUpNotificationBannerProps> = ({
  rankName,
  onOpenJourney,
  onDismiss,
}) => {
  useEffect(() => {
    soundManager.playXpFull();
    soundManager.triggerHaptic("heavy");
  }, []);

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg animate-in slide-in-from-top-6 duration-300 pointer-events-auto">
      <div className="command-toast relative overflow-hidden rounded-2xl bg-slate-900/95 border-2 border-amber-400/80 shadow-[0_10px_30px_rgba(245,158,11,0.3)] backdrop-blur-xl p-3.5 sm:p-4 text-slate-100 flex items-center gap-3.5">
        {/* Glow ambient background effect */}
        <div className="absolute -left-10 -top-10 w-28 h-28 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Animated Icon Badge */}
        <div className="relative shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md animate-bounce">
          <Award className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <BellRing className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Thanh XP Đã Đầy 100%!</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-semibold truncate mt-0.5">
            Sẵn sàng thăng cấp bậc <span className="text-amber-300 font-bold">{rankName}</span>
          </p>
          <p className="text-[11px] text-slate-300/90 leading-tight line-clamp-1 mt-0.5">
            Nhấn vào đây để tiến hành làm thử thách xét duyệt thăng cấp mới.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenJourney();
            }}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span>Thử Thách</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onDismiss();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
