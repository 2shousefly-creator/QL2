import React, { useEffect, useId, useRef } from "react";
import { ArrowRight, ArrowUp, Coins, FastForward, HeartPulse, Shield, Swords, Timer, X } from "lucide-react";
import { MAX_BARRACKS_LEVEL, getLevelUpgradeCost, getQuickFinishCost, getTroopUpgradeDurationMs } from "../config";
import { getTroopStats, TROOP_BY_TYPE } from "../troopCatalog";
import { formatUpgradeStat } from "../statDisplay";
import { formatChienTuyenDurationMs } from "../durationFormat";
import type { TroopType, TroopUpgradeJob } from "../types";
import { getTroopUpgradeLockCopy } from "../uxPresentation";
import { TroopIcon } from "./TroopIcon";

interface TroopUpgradeModalProps {
  troopType: TroopType;
  level: number;
  barracksLevel: number;
  gold: number;
  upgradeJob?: TroopUpgradeJob | null;
  now?: number;
  onConfirm: () => void;
  onQuickFinish?: () => void;
  onClose: () => void;
}

export const TroopUpgradeModal: React.FC<TroopUpgradeModalProps> = ({
  troopType,
  level,
  barracksLevel,
  gold,
  upgradeJob,
  now = Date.now(),
  onConfirm,
  onQuickFinish,
  onClose,
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  const troop = TROOP_BY_TYPE[troopType];
  const atAbsoluteCap = level >= MAX_BARRACKS_LEVEL;
  const canUpgrade = !atAbsoluteCap && level < barracksLevel && !upgradeJob;
  const targetLevel = upgradeJob ? upgradeJob.targetLevel : Math.min(MAX_BARRACKS_LEVEL, level + 1);
  const lockCopy = getTroopUpgradeLockCopy(level, barracksLevel);
  const cost = getLevelUpgradeCost(targetLevel);
  const duration = getTroopUpgradeDurationMs(troopType, targetLevel);
  const current = getTroopStats(troopType, level);
  const upgraded = getTroopStats(troopType, targetLevel);
  const rows = [
    { label: "HP", before: current.maxHp, after: upgraded.maxHp, icon: HeartPulse, color: "text-emerald-600" },
    { label: "ATK", before: current.attack, after: upgraded.attack, icon: Swords, color: "text-orange-500" },
    { label: "DEF", before: current.defense, after: upgraded.defense, icon: Shield, color: "text-sky-600" },
  ].filter((row) => row.after > row.before);

  const isUpgrading = Boolean(upgradeJob);
  const remainingMs = upgradeJob ? Math.max(0, upgradeJob.completeAt - now) : 0;
  const isComplete = upgradeJob ? remainingMs <= 0 : false;
  const quickCost = upgradeJob ? (isComplete ? 0 : getQuickFinishCost(remainingMs)) : 0;
  const durationMs = upgradeJob ? Math.max(1, upgradeJob.completeAt - upgradeJob.startedAt) : 1;
  const progress = upgradeJob ? (isComplete ? 100 : Math.max(0, Math.min(100, ((now - upgradeJob.startedAt) / durationMs) * 100))) : 0;

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')) as HTMLElement[];
      if (focusable.length === 0) return;
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
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[245] flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section ref={dialogRef} tabIndex={-1} className="ct-v2-pop-in max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-[2rem] border-4 border-white bg-[#fffaf0] p-4 text-slate-800 shadow-[0_18px_0_rgba(15,23,42,.18)]">
        <div className="flex items-start gap-3">
          <TroopIcon troopType={troopType} size="large" />
          <div className="min-w-0 flex-1">
            <div className="ct-v2-eyebrow">NÂNG CẤP BINH CHỦNG</div>
            <h3 id={titleId} className="truncate text-xl font-black">{troop.name}</h3>
            <span className="mt-1 inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-black text-white">
              Lv{level}{targetLevel > level ? ` → Lv${targetLevel}` : ""}
            </span>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Đóng bảng nâng cấp" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-600 active:scale-95"><X className="h-5 w-5" /></button>
        </div>

        {isUpgrading ? (
          <>
            <div className="mt-4 rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-3 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-amber-900">
                <span className="flex items-center gap-1.5"><Timer className="h-4 w-4 text-amber-600 animate-pulse" /> Đang nâng cấp lên Lv{targetLevel}</span>
                <span>{isComplete ? "Hoàn tất" : `Còn ${formatChienTuyenDurationMs(remainingMs)}`}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-amber-200/80">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border-2 border-slate-100 bg-white p-3 shadow-sm">
              <div className="mb-2 grid grid-cols-[62px_1fr_18px_1fr] items-center gap-2 px-1 text-center text-[8px] font-black uppercase tracking-wider text-slate-400">
                <span>Chỉ số</span><span>Trước</span><span /><span>Sau</span>
              </div>
              <div className="grid gap-1.5">
                {rows.map((row) => {
                  const Icon = row.icon;
                  const { beforeStr, afterStr, diffStr } = formatUpgradeStat(row.before, row.after);
                  return <div key={row.label} className="grid grid-cols-[62px_1fr_18px_1fr] items-center gap-2 rounded-xl bg-slate-50 px-2 py-2">
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-500"><Icon className={`h-3.5 w-3.5 ${row.color}`} />{row.label}</span>
                    <strong className="text-center text-[11px] text-slate-700">{beforeStr}</strong>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                    <strong className="text-center text-[11px] text-emerald-700">{afterStr} <small className="block text-[8px]">{diffStr}</small></strong>
                  </div>;
                })}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 text-amber-900">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-600" />
                <div>
                  <span className="block text-[8px] font-black uppercase text-amber-700">Chi phí hoàn thành nhanh</span>
                  <strong className="text-sm">{quickCost} Vàng</strong>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500">Số dư: {gold} Vàng</span>
            </div>

            {gold < quickCost && <p className="mt-2 text-center text-[10px] font-black text-rose-600">Chưa đủ Vàng để hoàn thành nhanh.</p>}

            <button
              type="button"
              disabled={gold < quickCost}
              onClick={() => {
                onQuickFinish?.();
                onClose();
              }}
              className="ct-v2-primary-button mt-3 w-full"
              aria-label={isComplete ? "Hoàn tất nâng cấp miễn phí" : `Hoàn thành nhanh nâng cấp với ${quickCost} Vàng`}
            >
              {isComplete ? <><Timer className="h-4 w-4" /><span>HOÀN TẤT NGAY (MIỄN PHÍ)</span></> : <><FastForward className="h-4 w-4" aria-hidden="true" /><strong>{quickCost}</strong></>}
            </button>
          </>
        ) : !canUpgrade ? (
          <div className="mt-4 rounded-2xl border-2 border-slate-200 bg-white p-4 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><Shield className="h-7 w-7" /></div>
            <h4 className="mt-3 text-sm font-black">{lockCopy.title}</h4>
            <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-600">{lockCopy.description}</p>
            <button type="button" onClick={onClose} className="ct-v2-secondary-button mt-4 w-full">ĐÃ HIỂU</button>
          </div>
        ) : (
          <>
            <div className="mt-4 overflow-hidden rounded-2xl border-2 border-slate-100 bg-white p-3 shadow-sm">
              <div className="mb-2 grid grid-cols-[62px_1fr_18px_1fr] items-center gap-2 px-1 text-center text-[8px] font-black uppercase tracking-wider text-slate-400">
                <span>Chỉ số</span><span>Trước</span><span /><span>Sau</span>
              </div>
              <div className="grid gap-1.5">
                {rows.map((row) => {
                  const Icon = row.icon;
                  const { beforeStr, afterStr, diffStr } = formatUpgradeStat(row.before, row.after);
                  return <div key={row.label} className="grid grid-cols-[62px_1fr_18px_1fr] items-center gap-2 rounded-xl bg-slate-50 px-2 py-2">
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-500"><Icon className={`h-3.5 w-3.5 ${row.color}`} />{row.label}</span>
                    <strong className="text-center text-[11px] text-slate-700">{beforeStr}</strong>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                    <strong className="text-center text-[11px] text-emerald-700">{afterStr} <small className="block text-[8px]">{diffStr}</small></strong>
                  </div>;
                })}
              </div>
            </div>

            <p className="ct-v2-fixed-stats">Chỉ số cố định · CRIT {Math.round(current.critChance * 100)}% · SPEED {current.speed}</p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 text-amber-800"><Coins className="h-5 w-5" /><div><span className="block text-[8px] font-black uppercase">Chi phí</span><strong className="text-sm">{cost} Vàng</strong></div></div>
              <div className="flex items-center gap-2 rounded-2xl border-2 border-sky-200 bg-sky-50 p-3 text-sky-800"><Timer className="h-5 w-5" /><div><span className="block text-[8px] font-black uppercase">Thời gian</span><strong className="text-sm">{formatChienTuyenDurationMs(duration)}</strong></div></div>
            </div>

            {gold < cost && <p className="mt-3 text-center text-[10px] font-black text-rose-600">Chưa đủ Vàng để nâng cấp.</p>}
            <button type="button" disabled={gold < cost} onClick={() => { onConfirm(); onClose(); }} className="ct-v2-primary-button mt-3 w-full"><ArrowUp className="h-4 w-4" /> XÁC NHẬN NÂNG CẤP · {cost} <Coins className="h-4 w-4" /></button>
          </>
        )}
      </section>
    </div>
  );
};
