import React from "react";
import { Clock, Sparkles, X } from "lucide-react";
import {
  CanonicalWeatherSlot,
  getSoilMoistureRatePerHour,
  getWeatherMoistureDescription,
  getWeatherPresentation,
  SEASON_METADATA,
} from "../weatherEngine";
import { AppModal, OverlayBody, OverlayHeader } from "../../../components/overlay/AppOverlay";

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlot: CanonicalWeatherSlot;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  isOpen,
  onClose,
  currentSlot,
}) => {
  if (!isOpen) return null;

  const season = SEASON_METADATA[currentSlot.season];
  const weather = getWeatherPresentation(currentSlot.weather, currentSlot.season);
  const remainingMinutes = Math.max(0, Math.floor(currentSlot.remainingMs / 60_000));
  const moistureRate = getSoilMoistureRatePerHour(
    currentSlot.season,
    currentSlot.phase,
    currentSlot.weather
  );

  return (
    <AppModal
      onClose={onClose}
      closeOnBackdrop
      labelledBy="weather-modal-title"
      panelClassName="app-overlay--spaced w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 text-slate-200 shadow-2xl"
    >
        <OverlayHeader className="flex items-start justify-between gap-3">
          <div>
            <h2 id="weather-modal-title" className="text-base font-black text-slate-100">Mùa & Thời Tiết</h2>
            <p className="text-xs text-slate-400">Chu kỳ chung theo UTC+7</p>
          </div>
          <button
            onClick={onClose}
            className="app-overlay-button app-overlay-button--icon flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Đóng thông tin thời tiết"
          >
            <X className="h-4 w-4" />
          </button>
        </OverlayHeader>

        <OverlayBody className="space-y-4">

        <div className={`space-y-2 rounded-2xl border border-slate-700 bg-gradient-to-br ${weather.bgClass} p-4`}>
          <div className="text-sm font-black">{season.icon} {season.name}</div>
          <div className="text-sm font-bold">
            {currentSlot.phase === "day" ? "☀️ Ban ngày" : "🌙 Ban đêm"}
          </div>
          <div className="text-sm font-bold">{weather.icon} {weather.name}</div>
          <div className="text-xs font-semibold text-slate-300">
            {getWeatherMoistureDescription(
              currentSlot.season,
              currentSlot.phase,
              currentSlot.weather
            )}
          </div>
          <div className="flex items-center justify-between border-t border-slate-700/60 pt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Slot còn lại</span>
            <span className="font-mono font-bold text-amber-300">
              {Math.floor(remainingMinutes / 60)}h {String(remainingMinutes % 60).padStart(2, "0")}m
            </span>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-700 bg-slate-800/60 p-3 text-xs text-slate-300">
          <div className="font-black text-amber-300">Tác động hiện tại</div>
          <p>{weather.fullDesc}</p>
          <p className="font-semibold text-sky-300">
            Tốc độ độ ẩm: {moistureRate > 0 ? "+" : ""}{moistureRate}/giờ
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-2xl border border-amber-600/30 bg-amber-950/30 p-3 text-xs text-amber-200/90">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <span>Mỗi mùa dài 7 ngày thực. Weather đổi theo slot 6 giờ và tiếp tục chạy khi offline.</span>
        </div>
        </OverlayBody>
    </AppModal>
  );
};
