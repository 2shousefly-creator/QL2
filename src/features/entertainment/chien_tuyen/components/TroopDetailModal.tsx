import React, { useId, useRef } from "react";
import { HeartPulse, Shield, Sparkles, Swords, Timer, X, Zap } from "lucide-react";
import { getTroopStats, TROOP_BY_TYPE } from "../troopCatalog";
import { formatStatValue, getDisplayStatRatio, getStatQuality, type DisplayStatKey } from "../statDisplay";
import { getUltimateConfig } from "../ultimateConfig";
import type { TroopType } from "../types";
import { getSpeedTier, TROOP_STRATEGY_COPY } from "../uxPresentation";
import { TroopIcon } from "./TroopIcon";
import { AppModal, OverlayBody, OverlayFooter, OverlayHeader } from "../../../../components/overlay/AppOverlay";

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
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const troop = TROOP_BY_TYPE[troopType];
  const stats = getTroopStats(troopType, level);
  const ultimate = getUltimateConfig(troopType);
  const strategy = TROOP_STRATEGY_COPY[troopType];
  const statRows: Array<{ label: string; key: DisplayStatKey; value: number; icon: typeof HeartPulse; color: string; bar: string }> = [
    { label: "HP", key: "maxHp", value: stats.maxHp, icon: HeartPulse, color: "text-emerald-400", bar: "bg-emerald-500" },
    { label: "ATK", key: "attack", value: stats.attack, icon: Swords, color: "text-orange-500", bar: "bg-orange-500" },
    { label: "DEF", key: "defense", value: stats.defense, icon: Shield, color: "text-sky-400", bar: "bg-sky-500" },
    { label: "CRIT", key: "critChance", value: stats.critChance, icon: Sparkles, color: "text-fuchsia-500", bar: "bg-fuchsia-500" },
    { label: "SPEED", key: "speed", value: stats.speed, icon: Zap, color: "text-cyan-400", bar: "bg-cyan-500" },
  ];

  return (
    <AppModal
      onClose={onClose}
      closeOnBackdrop
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy={titleId}
      describedBy={descriptionId}
      panelClassName="ct-v2-modal max-w-md"
      initialFocusRef={closeButtonRef}
    >
      <OverlayHeader className="ct-v2-modal-header flex items-start gap-3">
          <TroopIcon troopType={troopType} size="large" state="ally" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-[.18em]" style={{ color: troop.color }}>{troop.role}</div>
            <h3 id={titleId} className="truncate text-xl font-black text-white">{troop.name}</h3>
            <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] font-black">
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-white">Lv{level}</span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-emerald-300">Sẵn sàng: {readyCount}</span>
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-amber-300">{troop.targetPriority === "back_first" ? "Đánh hàng sau" : "Đánh hàng trước"}</span>
            </div>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Đóng chi tiết binh chủng" className="ct-v2-icon-button app-overlay__close"><X className="h-5 w-5" aria-hidden="true" /></button>
      </OverlayHeader>

      <OverlayBody className="space-y-3">
        <div className="grid gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 p-3 shadow-sm">
          {statRows.map((row) => {
            const Icon = row.icon;
            const ratio = getDisplayStatRatio(row.value, level, row.key);
            const currentPercent = ratio * 100;
            const formattedValue = formatStatValue(row.key, row.value);
            return (
              <div key={row.label} className="grid grid-cols-[18px_48px_1fr_auto] items-center gap-2" aria-label={`${row.label} ${formattedValue}, ${getStatQuality(ratio)}`} title={row.key === "speed" ? `SPEED ${getSpeedTier(stats.speed)}. Quân này thường quay lại Thanh Thứ Tự ${stats.speed >= 65 ? "rất sớm" : stats.speed >= 50 ? "sớm" : "chậm hơn"}.` : undefined}>
                <Icon className={`h-4 w-4 ${row.color}`} />
                <span className="text-[9px] font-black text-slate-300">{row.label}</span>
                <span className="relative h-2.5 overflow-hidden rounded-full bg-slate-800" aria-hidden="true">
                  <i className={`absolute inset-y-0 left-0 ${row.bar}`} style={{ width: `${currentPercent}%` }} />
                </span>
                <strong className="min-w-[58px] text-right text-[10px] text-slate-100">{formattedValue}</strong>
              </div>
            );
          })}
        </div>
        {troopType === "martial_artist" && (
          <p className="rounded-xl border border-orange-400/30 bg-orange-400/10 px-3 py-2 text-[10px] font-bold leading-relaxed text-orange-200">
            Mỗi cấp: +51 HP · +7 ATK · +1.5 DEF. CRIT 25% và SPEED 54 giữ nguyên.
          </p>
        )}
        <p className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[10px] font-semibold leading-relaxed text-cyan-100"><strong>⚡ {getSpeedTier(stats.speed)}.</strong> SPEED quyết định tốc độ quân quay lại Thanh Thứ Tự sau khi hành động. SPEED càng cao, quân càng có nhiều cơ hội ra đòn trong trận.</p>

        <div className="ct-v2-strength-grid">
          <section>
            <strong>ĐIỂM MẠNH</strong>
            {strategy.strengths.map((item) => <span key={item}>+ {item}</span>)}
          </section>
          <section>
            <strong>ĐIỂM YẾU</strong>
            {strategy.weaknesses.map((item) => <span key={item}>− {item}</span>)}
          </section>
        </div>

        <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3">
          <div className="flex items-center gap-2 text-xs font-black text-amber-200"><Timer className="h-4 w-4" /> NỘI TẠI — {troop.passive.name}</div>
          <p id={descriptionId} className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-300">{troop.passive.description}</p>
        </div>

        {ultimate.implemented && ultimate.name && ultimate.description && (
          <div className="rounded-2xl border border-violet-300/30 bg-gradient-to-br from-blue-500/10 to-violet-500/10 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black text-violet-200"><Zap className="h-4 w-4 fill-current" /> ULTIMATE · {ultimate.name}</div>
              <span className="shrink-0 rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-black text-white">Nộ {ultimate.ultimateRageRequired}</span>
            </div>
            <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-slate-300">{ultimate.description}</p>
          </div>
        )}

      </OverlayBody>
      {actions && <OverlayFooter className="ct-v2-modal-footer grid gap-2 sm:grid-cols-2">{actions}</OverlayFooter>}
    </AppModal>
  );
};
