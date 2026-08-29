import React from "react";
import {
  CanonicalWeatherSlot,
  getWeatherMoistureDescription,
  getWeatherPresentation,
  SEASON_METADATA,
} from "../weatherEngine";

interface WeatherHUDProps {
  currentSlot: CanonicalWeatherSlot;
  onOpenWeatherModal: () => void;
}

export const WeatherHUD: React.FC<WeatherHUDProps> = ({
  currentSlot,
  onOpenWeatherModal,
}) => {
  const isDay = currentSlot.phase === "day";
  const weather = getWeatherPresentation(currentSlot.weather, currentSlot.season);
  const season = SEASON_METADATA[currentSlot.season];

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onOpenWeatherModal();
      }}
      className={`min-w-[126px] px-2.5 py-1.5 rounded-xl border flex flex-col items-start cursor-pointer transition-all active:scale-95 shadow-sm hover:brightness-110 ${
        isDay
          ? "bg-slate-850/90 border-amber-500/40 text-amber-200"
          : "bg-slate-850/90 border-indigo-500/40 text-indigo-200"
      }`}
      title="Nhấn để xem chi tiết Mùa và Thời Tiết"
    >
      <span className="text-[10px] font-black leading-tight text-slate-100">
        {season.icon} {season.name}
      </span>
      <span className="text-[9px] font-bold leading-tight text-slate-200">
        {isDay ? "☀️ Ban ngày" : "🌙 Ban đêm"}
      </span>
      <span className="text-[9px] font-bold leading-tight text-slate-200">
        {weather.icon} {weather.name}
      </span>
      <span className="max-w-[150px] text-[8px] font-semibold leading-tight text-slate-400">
        {getWeatherMoistureDescription(
          currentSlot.season,
          currentSlot.phase,
          currentSlot.weather
        )}
      </span>
    </div>
  );
};
