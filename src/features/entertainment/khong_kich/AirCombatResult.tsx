import React from "react";
import {
  ArrowLeft,
  Coins,
  Crosshair,
  Flame,
  Gauge,
  HeartPulse,
  Medal,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Timer,
  Trophy,
} from "lucide-react";
import { AIRCRAFT_CONFIGS } from "./airCombatConfig";
import { AirCombatReward, AirCombatRunSummary } from "./airCombatTypes";
import { AircraftGlyph } from "./AircraftGlyph";

interface AirCombatResultProps {
  summary: AirCombatRunSummary;
  reward: AirCombatReward;
  previousHighScore: number;
  onReplay: () => void;
  onBack: () => void;
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function ResultStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-950/55 p-2.5 text-center">
      <div className="mb-1 flex items-center justify-center gap-1 text-[8px] font-extrabold uppercase tracking-wide text-slate-500">
        {icon}{label}
      </div>
      <div className="text-sm font-black tabular-nums text-slate-100">{value}</div>
    </div>
  );
}

export const AirCombatResult: React.FC<AirCombatResultProps> = ({
  summary,
  reward,
  previousHighScore,
  onReplay,
  onBack,
}) => {
  const aircraft = AIRCRAFT_CONFIGS[summary.aircraftId];
  const isNewRecord = summary.score > previousHighScore;

  return (
    <div className="command-screen battle-result-screen mx-auto flex w-full max-w-md flex-col gap-3 px-3 pb-5 pt-3" data-air-combat-result="true" data-run-rank={summary.rank}>
      <section className="relative overflow-hidden rounded-[28px] border border-sky-400/25 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-5 text-center shadow-2xl shadow-sky-950/40">
        <div className="pointer-events-none absolute -left-12 top-2 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 top-16 h-32 w-32 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mx-auto w-fit">
          <AircraftGlyph color={aircraft.color} accent={aircraft.accent} className="h-20 w-20" />
          <span className="absolute -right-5 -top-2 grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/50 bg-cyan-950 text-2xl font-black text-cyan-200 shadow-lg">{summary.rank}</span>
        </div>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-sky-300">Báo cáo nhiệm vụ</p>
        <h2 className="mt-1 text-2xl font-black text-white">
          {summary.bossDefeated ? "Pháo Đài Đã Bị Hạ" : summary.destroyed ? "Chiến Cơ Bị Hạ" : "Hết Thời Gian Xuất Kích"}
        </h2>
        <p className="mt-1 text-xs text-slate-400">{aircraft.code} · {aircraft.name} · Combat Lv.{summary.combatLevel}</p>

        <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-400/5 px-4 py-3">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase text-amber-300"><Trophy className="h-3.5 w-3.5" /> Tổng điểm</div>
          <div className="mt-0.5 text-4xl font-black tabular-nums text-amber-300">{summary.score.toLocaleString("vi-VN")}</div>
          {isNewRecord && <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-[10px] font-black text-fuchsia-300"><Sparkles className="h-3 w-3" /> Kỷ lục mới</div>}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <ResultStat icon={<Crosshair className="h-3 w-3" />} label="Tiêu diệt" value={summary.enemiesDefeated} />
          <ResultStat icon={<ShieldAlert className="h-3 w-3" />} label="Elite" value={summary.elitesDefeated} />
          <ResultStat icon={<Flame className="h-3 w-3" />} label="Combo cao nhất" value={summary.maxCombo} />
          <ResultStat icon={<Timer className="h-3 w-3" />} label="Sinh tồn" value={formatTime(summary.survivalSeconds)} />
          <ResultStat icon={<Gauge className="h-3 w-3" />} label="Sát thương gây" value={Math.round(summary.damageDealt).toLocaleString("vi-VN")} />
          <ResultStat icon={<HeartPulse className="h-3 w-3" />} label="Sát thương nhận" value={Math.round(summary.damageTaken).toLocaleString("vi-VN")} />
          <ResultStat icon={<Medal className="h-3 w-3" />} label="Hỏa lực cuối" value={summary.finalFirepower.toFixed(0)} />
          <ResultStat icon={<ShieldAlert className="h-3 w-3" />} label="Số lần trúng" value={summary.hitsReceived} />
        </div>

        <div className={`mt-2 rounded-xl border px-3 py-2 text-xs font-black ${summary.bossDefeated ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-slate-700 bg-slate-900/70 text-slate-400"}`}>
          Boss: {summary.bossDefeated ? `Đã tiêu diệt · ${summary.bossClearSeconds === null ? "--" : formatTime(summary.bossClearSeconds)}` : "Chưa tiêu diệt"}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-400/20 bg-slate-900/85 p-3.5">
        <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Thưởng nhiệm vụ · hệ số {Math.round(reward.rewardRate * 100)}%</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 py-3 text-amber-300"><Coins className="h-4 w-4" /><strong>+{reward.gold} Vàng</strong></div>
          <div className="flex items-center justify-center gap-2 rounded-xl border border-fuchsia-400/25 bg-fuchsia-400/10 py-3 text-fuchsia-300"><Sparkles className="h-4 w-4" /><strong>+{reward.xp} XP</strong></div>
        </div>
        <p className="mt-2 text-center text-[10px] leading-relaxed text-slate-500">
          Thưởng giảm dần theo số lượt trong ngày; điểm và combo không nhân phần thưởng.{reward.dailyCapReached ? " Đã đạt giới hạn thưởng hôm nay." : ""}
        </p>
      </section>

      <div className="grid grid-cols-[1fr_1.4fr] gap-2">
        <button type="button" onClick={onBack} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 text-xs font-black text-slate-200 active:scale-[.98]"><ArrowLeft className="h-4 w-4" /> Giải Trí</button>
        <button type="button" onClick={onReplay} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 text-sm font-black text-slate-950 shadow-lg shadow-sky-500/20 active:scale-[.98]"><RefreshCw className="h-4 w-4" /> Xuất Kích Lại</button>
      </div>
    </div>
  );
};
