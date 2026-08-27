import React, { useEffect, useId, useRef } from "react";
import { HeartPulse, Shield, Sparkles, Swords, Timer, X, Zap } from "lucide-react";
import { getTroopStats, TROOP_BY_TYPE } from "../troopCatalog";
import { formatStatValue, getDisplayStatRatio, getStatQuality, type DisplayStatKey } from "../statDisplay";
import { getUltimateConfig } from "../ultimateConfig";
import type { TroopType } from "../types";
import { getSpeedTier, TROOP_STRATEGY_COPY } from "../uxPresentation";
import { TroopIcon } from "./TroopIcon";

interface TroopDetailModalProps {
  troopType: TroopType;
  level: number;
  readyCount: number;
  onClose: () => void;
  actions?: React.ReactNode;
}

export const TroopDetailModal: React.FC<TroopDetailModalProps> = ({
  troopType,
  level,
  readyCount,
  onClose,
  actions,
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  const troop = TROOP_BY_TYPE[troopType];
  const stats = getTroopStats(troopType, level);
  const ultimate = getUltimateConfig(troopType);
  const strategy = TROOP_STRATEGY_COPY[troopType];
  const statRows: Array<{ label: string; key: DisplayStatKey; value: number; icon: typeof HeartPulse; color: string; bar: string }> = [
    { label: "HP", key: "maxHp", value: stats.maxHp, icon: HeartPulse, color: "text-emerald-600", bar: "bg-emerald-500" },
    { label: "ATK", key: "attack", value: stats.attack, icon: Swords, color: "text-orange-500", bar: "bg-orange-500" },
    { label: "DEF", key: "defense", value: stats.defense, icon: Shield, color: "text-sky-600", bar: "bg-sky-500" },
    { label: "CRIT", key: "critChance", value: stats.critChance, icon: Sparkles, color: "text-fuchsia-500", bar: "bg-fuchsia-500" },
    { label: "SPEED", key: "speed", value: stats.speed, icon: Zap, color: "text-cyan-600", bar: "bg-cyan-500" },
  ];

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable: HTMLElement[] = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )) as HTMLElement[];
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[240] flex items-end justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section ref={dialogRef} tabIndex={-1} className="ct-v2-pop-in max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-[2rem] border-4 border-white bg-[#fffaf0] p-4 text-slate-800 shadow-[0_18px_0_rgba(15,23,42,.18)]">
        <div className="flex items-start gap-3">
          <TroopIcon troopType={troopType} size="large" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-[.18em]" style={{ color: troop.color }}>{troop.role}</div>
            <h3 id={titleId} className="truncate text-xl font-black">{troop.name}</h3>
            <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] font-black">
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-white">Lv{level}</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">Sẵn sàng: {readyCount}</span>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">{troop.targetPriority === "back_first" ? "Đánh hàng sau" : "Đánh hàng trước"}</span>
            </div>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Đóng chi tiết binh chủng" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-600 active:scale-95"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>

        <div className="mt-4 grid gap-2 rounded-2xl border-2 border-slate-100 bg-white p-3 shadow-sm">
          {statRows.map((row) => {
            const Icon = row.icon;
            const ratio = getDisplayStatRatio(row.value, level, row.key);
            const currentPercent = ratio * 100;
            const formattedValue = formatStatValue(row.key, row.value);
            return (
              <div key={row.label} className="grid grid-cols-[18px_48px_1fr_auto] items-center gap-2" aria-label={`${row.label} ${formattedValue}, ${getStatQuality(ratio)}`} title={row.key === "speed" ? `SPEED ${getSpeedTier(stats.speed)}. Quân này thường quay lại Thanh Thứ Tự ${stats.speed >= 65 ? "rất sớm" : stats.speed >= 50 ? "sớm" : "chậm hơn"}.` : undefined}>
                <Icon className={`h-4 w-4 ${row.color}`} />
                <span className="text-[9px] font-black text-slate-500">{row.label}</span>
                <span className="relative h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                  <i className={`absolute inset-y-0 left-0 ${row.bar}`} style={{ width: `${currentPercent}%` }} />
                </span>
                <strong className="min-w-[58px] text-right text-[10px] text-slate-800">{formattedValue}</strong>
              </div>
            );
          })}
        </div>
        {troopType === "martial_artist" && (
          <p className="mt-2 rounded-xl bg-orange-50 px-3 py-2 text-[10px] font-bold leading-relaxed text-orange-900">
            Mỗi cấp: +51 HP · +7 ATK · +1.5 DEF. CRIT 25% và SPEED 54 giữ nguyên.
          </p>
        )}
        <p className="mt-2 rounded-xl bg-cyan-50 px-3 py-2 text-[10px] font-semibold leading-relaxed text-cyan-900"><strong>⚡ {getSpeedTier(stats.speed)}.</strong> SPEED quyết định tốc độ quân quay lại Thanh Thứ Tự sau khi hành động. SPEED càng cao, quân càng có nhiều cơ hội ra đòn trong trận.</p>

        <div className="ct-v2-strength-grid mt-3">
          <section>
            <strong>ĐIỂM MẠNH</strong>
            {strategy.strengths.map((item) => <span key={item}>+ {item}</span>)}
          </section>
          <section>
            <strong>ĐIỂM YẾU</strong>
            {strategy.weaknesses.map((item) => <span key={item}>− {item}</span>)}
          </section>
        </div>

        <div className="mt-3 rounded-2xl border-2 border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2 text-xs font-black text-amber-900"><Timer className="h-4 w-4" /> NỘI TẠI — {troop.passive.name}</div>
          <p id={descriptionId} className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-600">{troop.passive.description}</p>
        </div>

        {ultimate.implemented && ultimate.name && ultimate.description && (
          <div className="mt-3 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-violet-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black text-blue-900"><Zap className="h-4 w-4 fill-current" /> ULTIMATE · {ultimate.name}</div>
              <span className="shrink-0 rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-black text-white">Nộ {ultimate.ultimateRageRequired}</span>
            </div>
            <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-slate-600">{ultimate.description}</p>
          </div>
        )}

        {actions && <div className="mt-3 grid gap-2 sm:grid-cols-2">{actions}</div>}
      </section>
    </div>
  );
};
