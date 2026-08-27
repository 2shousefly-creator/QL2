import React from "react";
import {
  CanonicalWeatherSlot,
  WEATHER_METADATA,
} from "../weatherEngine";
import { Info, Clock } from "lucide-react";

interface WeatherHUDProps {
  currentSlot: CanonicalWeatherSlot;
  onOpenWeatherModal: () => void;
}

export const WeatherHUD: React.FC<WeatherHUDProps> = ({
  currentSlot,
  onOpenWeatherModal,
}) => {
  const isDay = currentSlot.phase === "day";
  const meta = WEATHER_METADATA[currentSlot.weather];

  const formatCountdown = (ms: number): string => {
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return `${hours}h ${mins.toString().padStart(2, "0")}m`;
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onOpenWeatherModal();
      }}
      className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm hover:brightness-110 ${
        isDay
          ? "bg-slate-850/90 border-amber-500/40 text-amber-200"
          : "bg-slate-850/90 border-indigo-500/40 text-indigo-200"
      }`}
      title="Nhấn để xem chi tiết Thời Tiết & Chu kỳ Ngày/Đêm"
    >
      <span className="text-base select-none">{meta.icon}</span>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1 leading-none">
          <span className="text-[11px] font-black text-slate-100">
            {meta.name}
          </span>
          <span className="text-[9px] text-slate-400 font-bold">
            ({isDay ? "Ngày" : "Đêm"})
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-medium text-slate-400 mt-0.5 leading-none">
          <Clock className="w-2.5 h-2.5 text-amber-400/80" />
          <span className="font-mono text-amber-300/90 font-bold">
            {formatCountdown(currentSlot.remainingMs)}
          </span>
        </div>
      </div>

      <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 ml-0.5">
        <Info className="w-2.5 h-2.5" />
      </div>
    </div>
  );
};
