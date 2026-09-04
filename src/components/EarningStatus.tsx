import React from "react";
import { EarningMode } from "../game/types";

type EarningStatusProps = {
  mode: EarningMode;
  isFull: boolean;
  isMaxRank?: boolean;
  energyPercent?: number;
  className?: string;
};

export const EarningStatus: React.FC<EarningStatusProps> = ({
  mode,
  isFull,
  isMaxRank = false,
  energyPercent = 100,
  className = "",
}) => {
  if (isMaxRank && isFull) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold ${className}`}>
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        Đã hoàn tất hành trình
      </div>
    );
  }

  if (isFull) {
    return (
      <div className={`status-tag inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-200 text-xs sm:text-sm font-bold shadow-md animate-pulse ${className}`}>
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#facc15]" />
        Đã dừng tích lũy · Sẵn sàng xét thăng cấp
      </div>
    );
  }

  const isDirect = mode === "direct_online";
  const totalMult = energyPercent >= 67 ? 4 : energyPercent >= 33 ? 3 : energyPercent > 0 ? 2 : 1;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${
        isDirect
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          : "bg-sky-500/10 border-sky-500/30 text-sky-300"
      } ${className}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isDirect ? "bg-emerald-400" : "bg-sky-400"
        }`}
      />
      <span>
        {isDirect
          ? `Đang online trực tiếp · x${totalMult} XP (${Math.round(energyPercent)}% Energy)`
          : "Đang ủy thác (chạy nền/mất kết nối) · x1,0 XP"}
      </span>
    </div>
  );
};
