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
import { GameResultScreen, ModalActions, ModalButton, OverlayBody, ResultHero } from "../../../components/overlay/AppOverlay";

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
    <div className="modal-section text-center">
      <div className="mb-1 flex items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--modal-muted)]">
        {icon}{label}
      </div>
      <div className="text-sm font-semibold tabular-nums text-slate-100">{value}</div>
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
    <GameResultScreen status={summary.bossDefeated ? "success" : summary.destroyed ? "danger" : "warning"} data-air-combat-result="true" data-run-rank={summary.rank}>
      <OverlayBody>
      <ResultHero>

        <div className="relative mx-auto w-fit">
          <AircraftGlyph color={aircraft.color} accent={aircraft.accent} className="h-12 w-12" />
          <span className="absolute -right-5 -top-2 grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/50 bg-cyan-950 text-2xl font-semibold text-[var(--modal-info)] shadow-lg">{summary.rank}</span>
        </div>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--modal-info)]">Báo cáo nhiệm vụ</p>
        <h2 className="modal-title">
          {summary.bossDefeated ? "Pháo Đài Đã Bị Hạ" : summary.destroyed ? "Chiến Cơ Bị Hạ" : "Hết Thời Gian Xuất Kích"}
        </h2>
        <p className="mt-1 text-xs text-[var(--modal-muted)]">{aircraft.code} · {aircraft.name} · Cấp chiến đấu {summary.combatLevel}</p>

        <div className="mt-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase text-[var(--modal-reward)]"><Trophy className="h-3.5 w-3.5" /> Tổng điểm</div>
          <div className="mt-0.5 text-3xl font-semibold tabular-nums text-[var(--modal-reward)]">{summary.score.toLocaleString("vi-VN")}</div>
          {isNewRecord && <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-xs font-semibold text-fuchsia-300"><Sparkles className="h-3 w-3" /> Kỷ lục mới</div>}
        </div>

        <div className="mt-3 grid w-full grid-cols-2 gap-2">
          <ResultStat icon={<Crosshair className="h-3 w-3" />} label="Tiêu diệt" value={summary.enemiesDefeated} />
          <ResultStat icon={<ShieldAlert className="h-3 w-3" />} label="Tinh nhuệ" value={summary.elitesDefeated} />
          <ResultStat icon={<Flame className="h-3 w-3" />} label="Combo cao nhất" value={summary.maxCombo} />
          <ResultStat icon={<Timer className="h-3 w-3" />} label="Sinh tồn" value={formatTime(summary.survivalSeconds)} />
          <ResultStat icon={<Gauge className="h-3 w-3" />} label="Sát thương gây" value={Math.round(summary.damageDealt).toLocaleString("vi-VN")} />
          <ResultStat icon={<HeartPulse className="h-3 w-3" />} label="Sát thương nhận" value={Math.round(summary.damageTaken).toLocaleString("vi-VN")} />
          <ResultStat icon={<Medal className="h-3 w-3" />} label="Hỏa lực cuối" value={summary.finalFirepower.toFixed(0)} />
          <ResultStat icon={<ShieldAlert className="h-3 w-3" />} label="Số lần trúng" value={summary.hitsReceived} />
        </div>

        <div className={`mt-2 rounded-xl border px-3 py-2 text-xs font-semibold ${summary.bossDefeated ? "border-emerald-400/25 bg-emerald-400/10 text-[var(--modal-success)]" : "border-slate-700 bg-slate-900/70 text-[var(--modal-muted)]"}`}>
          Boss: {summary.bossDefeated ? `Đã tiêu diệt · ${summary.bossClearSeconds === null ? "--" : formatTime(summary.bossClearSeconds)}` : "Chưa tiêu diệt"}
        </div>
      </ResultHero>

      <section className="modal-section">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--modal-muted)]">Thưởng nhiệm vụ · hệ số {Math.round(reward.rewardRate * 100)}%</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 py-3 text-[var(--modal-reward)]"><Coins className="h-4 w-4" /><strong>+{reward.gold} Vàng</strong></div>
          <div className="flex items-center justify-center gap-2 rounded-xl border border-fuchsia-400/25 bg-fuchsia-400/10 py-3 text-fuchsia-300"><Sparkles className="h-4 w-4" /><strong>+{reward.xp} XP</strong></div>
        </div>
        <p className="mt-2 text-center text-xs leading-relaxed text-[var(--modal-muted)]">
          Thưởng giảm dần theo số lượt trong ngày; điểm và combo không nhân phần thưởng.{reward.dailyCapReached ? " Đã đạt giới hạn thưởng hôm nay." : ""}
        </p>
      </section>

      </OverlayBody>
      <ModalActions>
        <ModalButton type="button" onClick={onBack} variant="ghost"><ArrowLeft className="h-4 w-4" /> Giải Trí</ModalButton>
        <ModalButton type="button" onClick={onReplay} variant="primary"><RefreshCw className="h-4 w-4" /> Xuất Kích Lại</ModalButton>
      </ModalActions>
    </GameResultScreen>
  );
};
