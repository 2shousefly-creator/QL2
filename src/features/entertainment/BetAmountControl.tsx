import React from "react";

interface BetAmountControlProps {
  value: string;
  maxBet: number;
  onChange: (value: string) => void;
  onQuickAdjust: (delta: number) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const QUICK_BUTTON_CLASS =
  "h-11 w-10 sm:w-11 rounded-xl border border-slate-700 bg-slate-800 text-[11px] sm:text-xs font-black text-slate-200 hover:border-amber-500/60 hover:bg-slate-700 hover:text-amber-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-slate-700 disabled:hover:bg-slate-800 disabled:hover:text-slate-200 transition-all";

export const BetAmountControl: React.FC<BetAmountControlProps> = ({
  value,
  maxBet,
  onChange,
  onQuickAdjust,
  onKeyDown,
}) => {
  const currentAmount = /^\d+$/u.test(value) ? Number.parseInt(value, 10) : 0;
  const canDecrease = currentAmount > 0;
  const canIncrease = currentAmount < maxBet;

  return (
    <div className="flex items-stretch gap-1.5">
      <button
        type="button"
        onClick={() => onQuickAdjust(-10)}
        disabled={!canDecrease}
        className={QUICK_BUTTON_CLASS}
        aria-label="Giảm 10 Vàng"
      >
        -10
      </button>
      <button
        type="button"
        onClick={() => onQuickAdjust(-5)}
        disabled={!canDecrease}
        className={QUICK_BUTTON_CLASS}
        aria-label="Giảm 5 Vàng"
      >
        -5
      </button>

      <div className="relative min-w-0 flex-1">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/[^\d]/gu, ""))}
          onKeyDown={onKeyDown}
          placeholder="0"
          aria-label="Số Vàng cược"
          className="h-11 w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-2.5 pr-7 text-center text-base font-extrabold text-amber-400 placeholder-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          V
        </span>
      </div>

      <button
        type="button"
        onClick={() => onQuickAdjust(5)}
        disabled={!canIncrease}
        className={QUICK_BUTTON_CLASS}
        aria-label="Tăng 5 Vàng"
      >
        +5
      </button>
      <button
        type="button"
        onClick={() => onQuickAdjust(10)}
        disabled={!canIncrease}
        className={QUICK_BUTTON_CLASS}
        aria-label="Tăng 10 Vàng"
      >
        +10
      </button>
    </div>
  );
};
