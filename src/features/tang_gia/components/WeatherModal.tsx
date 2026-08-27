import React from "react";
import {
  CanonicalWeatherSlot,
  WEATHER_METADATA,
  WeatherType,
} from "../weatherEngine";
import { X, CloudRain, Sun, Moon, Wind, Clock, Sparkles, CheckCircle2 } from "lucide-react";

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

  const formatRemaining = (ms: number): string => {
    const totalMins = Math.floor(ms / 60000);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hours} giờ ${mins} phút`;
  };

  const isDay = currentSlot.phase === "day";
  const meta = WEATHER_METADATA[currentSlot.weather];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-sky-600 flex items-center justify-center text-xl shadow-md">
              🌤️
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100">
                Thời Tiết & Ngày Đêm
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Chu kỳ tự nhiên Tăng Gia (Asia/Ho_Chi_Minh)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Status Card */}
        <div
          className={`rounded-2xl p-4 border bg-gradient-to-br ${meta.bgClass} border-slate-700/80 flex flex-col gap-3 shadow-inner`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{meta.icon}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-slate-100">
                    {meta.name}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      isDay
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                    }`}
                  >
                    {isDay ? "Ban Ngày" : "Ban Đêm"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {meta.shortDesc}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Chuyển trạng thái sau:</span>
            </div>
            <span className="font-mono font-bold text-amber-300">
              {formatRemaining(currentSlot.remainingMs)}
            </span>
          </div>
        </div>

        {/* 4 Weather Catalog Details */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
            Các Trạng Thái Thời Tiết
          </h3>

          {/* Sunny */}
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
            <span className="text-2xl mt-0.5">☀️</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-black text-amber-300">
                  Nắng (Ban Ngày - 60%)
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Rút ngắn 2% TG
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Tăng tốc độ sinh trưởng của cây trồng theo tỷ lệ thời gian tiếp xúc
                với ánh nắng.
              </p>
            </div>
          </div>

          {/* Rain */}
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-sky-500/30 flex items-start gap-3">
            <span className="text-2xl mt-0.5">🌧</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-black text-sky-300">
                  Mưa (Ngày & Đêm - 20%)
                </span>
                <span className="text-[10px] font-bold text-emerald-400">
                  +5% Vàng & Tự Tưới
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Tưới mát toàn bộ đồng ruộng. Khi cây đến các mốc cần chăm sóc
                (20%, 50%, 80%), trời mưa sẽ{" "}
                <span className="text-sky-300 font-bold">tự động tưới</span> giúp
                nhận đủ điểm thưởng. Tăng tối đa 5% Vàng khi thu hoạch.
              </p>
            </div>
          </div>

          {/* Cool */}
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
            <span className="text-2xl mt-0.5">🍃</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-black text-emerald-300">
                  Mát (Ban Ngày - 20%)
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Ôn hòa
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Không khí mát dịu, hỗ trợ tích lũy sinh trưởng chất lượng cao
                (chuẩn bị cho hệ thống Phẩm Chất).
              </p>
            </div>
          </div>

          {/* Calm */}
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
            <span className="text-2xl mt-0.5">🌙</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-black text-indigo-300">
                  Yên Ắng (Ban Đêm - 80%)
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Rút ngắn 2% TG
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Đêm quân ngũ tĩnh lặng, cây trồng đón sương đêm phát triển nhanh
                hơn 2%.
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Cycle Rule Note */}
        <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-600/30 text-amber-200/90 text-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-300">Chu kỳ 6 tiếng:</span>{" "}
            00:00–06:00 (Đêm) • 06:00–12:00 (Ngày) • 12:00–18:00 (Đêm) •
            18:00–24:00 (Ngày). Chu kỳ đồng bộ toàn bộ người chơi, lưu trữ
            offline ổn định.
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs shadow-md active:scale-95 transition-all"
        >
          Đã Hiểu
        </button>
      </div>
    </div>
  );
};
