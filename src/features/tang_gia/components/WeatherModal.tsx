import React from "react";
import { Clock, Sparkles, X } from "lucide-react";
import {
  CanonicalWeatherSlot,
  getSoilMoistureRatePerHour,
  getWeatherMoistureDescription,
  getWeatherPresentation,
  SEASON_METADATA,
} from "../weatherEngine";
import { AppModal, ModalButton, OverlayBody, OverlayHeader } from "../../../components/overlay/AppOverlay";

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
    <AppModal theme="farm" archetype="info"
      onClose={onClose}
      closeOnBackdrop
      labelledBy="weather-modal-title"
    >
        <OverlayHeader className="flex items-start justify-between">
          <div>
            <h2 id="weather-modal-title" className="modal-title">Mùa & Thời Tiết</h2>
            <p className="modal-copy">Chu kỳ chung theo UTC+7</p>
          </div>
          <ModalButton variant="icon"
            onClick={onClose}
            aria-label="Đóng thông tin thời tiết"
          >
            <X className="h-4 w-4" />
          </ModalButton>
        </OverlayHeader>

        <OverlayBody>

        <div className={`space-y-2 rounded-2xl border border-slate-700 bg-gradient-to-br ${weather.bgClass} p-4`}>
          <div className="text-sm font-semibold">{season.icon} {season.name}</div>
          <div className="text-sm font-bold">
            {currentSlot.phase === "day" ? "☀️ Ban ngày" : "🌙 Ban đêm"}
          </div>
          <div className="text-sm font-bold">{weather.icon} {weather.name}</div>
          <div className="text-xs font-semibold text-[var(--modal-text)]">
            {getWeatherMoistureDescription(
              currentSlot.season,
              currentSlot.phase,
              currentSlot.weather
            )}
          </div>
          <div className="flex items-center justify-between border-t border-slate-700/60 pt-2 text-xs text-[var(--modal-muted)]">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Slot còn lại</span>
            <span className="font-mono font-bold text-[var(--modal-reward)]">
              {Math.floor(remainingMinutes / 60)}h {String(remainingMinutes % 60).padStart(2, "0")}m
            </span>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-700 bg-slate-800/60 p-3 text-xs text-[var(--modal-text)]">
          <div className="font-semibold text-[var(--modal-reward)]">Tác động hiện tại</div>
          <p>{weather.fullDesc}</p>
          <p className="font-semibold text-[var(--modal-info)]">
            Tốc độ độ ẩm: {moistureRate > 0 ? "+" : ""}{moistureRate}/giờ
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-2xl border border-amber-600/30 bg-amber-950/30 p-3 text-xs text-[var(--modal-reward)]">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--modal-reward)]" />
          <span>Mỗi mùa dài 7 ngày thực. Weather đổi theo slot 6 giờ và tiếp tục chạy khi offline.</span>
        </div>
        </OverlayBody>
    </AppModal>
  );
};
