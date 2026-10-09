import React from "react";
import { Sparkles } from "lucide-react";
import { formatXp } from "../game/xpEngine";

type XpProgressBarProps = {
  currentTicks: number;
  requiredTicks: number;
  isFull: boolean;
  isMaxRank?: boolean;
  reducedMotion?: boolean;
  className?: string;
};

export const XpProgressBar: React.FC<XpProgressBarProps> = ({
  currentTicks,
  requiredTicks,
  isFull,
  isMaxRank = false,
  reducedMotion = false,
  className = "",
}) => {
  if (isMaxRank) {
    return (
      <div data-ui-protected="true" className={`w-full max-w-lg mx-auto ${className}`}>
        <div className="relative h-9 rounded-xl bg-slate-900 border border-amber-500/40 p-1 flex items-center justify-center shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20" />
          <span className="relative z-10 font-bold text-amber-300 text-sm tracking-wide">
            Đã Hoàn Tất Hành Trình – Tổng XP: {formatXp(currentTicks)}
          </span>
        </div>
      </div>
    );
  }

  const percentage =
    requiredTicks > 0
      ? Math.min(100, Math.floor((currentTicks / requiredTicks) * 100))
      : 100;

  const currentXpStr = formatXp(currentTicks);
  const requiredXpStr = formatXp(requiredTicks);

  return (
    <div data-ui-protected="true" className={`w-full max-w-lg mx-auto ${className}`}>
      {/* Label Row */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-1.5 px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 tracking-wide">Tích Lũy Kinh Nghiệm (XP)</span>
        </div>
        <span
          className={
            isFull
              ? "text-amber-300 font-bold animate-pulse"
              : "text-amber-400"
          }
        >
          {percentage}% {isFull ? "(Đầy)" : ""}
        </span>
      </div>

      {/* Main Track */}
      <div
        className={`xp-command-track continuous-progress-track relative h-9 rounded-xl bg-slate-950 border ${
          isFull
            ? "border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(250,204,21,0.5)]"
            : "border-slate-800"
        } p-0.5 overflow-hidden transition-all duration-300 shadow-inner`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        {/* Fill Bar */}
        <div
          className={`continuous-progress-fill h-full rounded-lg transition-[width] duration-300 ease-out relative overflow-hidden ${
            isFull
              ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300"
              : "bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400"
          }`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer / Energy flow overlay */}
          {!reducedMotion && !isFull && (
            <div
              className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]"
            />
          )}

          {/* Glint at the tip */}
          {percentage > 2 && percentage < 100 && (
            <div className="absolute top-0 right-0 bottom-0 w-2.5 bg-white/90 shadow-[0_0_10px_#ffffff]" />
          )}
        </div>

        {/* Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center font-bold text-xs sm:text-sm tracking-wide text-slate-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] pointer-events-none gap-1.5">
          {isFull ? (
            <span className="text-amber-100 font-extrabold uppercase tracking-wider">
              Sẵn Sàng Xét Thăng Cấp
            </span>
          ) : (
            <span>
              {currentXpStr} / {requiredXpStr}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
