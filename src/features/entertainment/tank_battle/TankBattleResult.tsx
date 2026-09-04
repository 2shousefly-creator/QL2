import React from "react";
import {
  Activity,
  ArrowLeft,
  Bomb,
  BrickWall,
  Clock3,
  Coins,
  Crosshair,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { TANK_BATTLE_RANK_ORDER, UPGRADE_BY_ID } from "./tankBattleConfig";
import { TankBattleReward, TankBattleRunSummary } from "./tankBattleTypes";

interface TankBattleResultProps {
  summary: TankBattleRunSummary;
  reward: TankBattleReward;
  previousHighScore: number;
  onReplay: () => void;
  onBack: () => void;
}

function formatTime(seconds: number | null): string {
  if (seconds === null) return "--";
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
      <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-slate-500">{icon}{label}</div>
      <div className="mt-1 text-sm font-black text-slate-100">{value}</div>
    </div>
  );
}

export const TankBattleResult: React.FC<TankBattleResultProps> = ({
  summary,
  reward,
  previousHighScore,
  onReplay,
  onBack,
}) => {
  const isRecord = summary.score > previousHighScore;
  const rankIndex = TANK_BATTLE_RANK_ORDER.indexOf(summary.rank);
  const headline = summary.victory
    ? "Sở Chỉ Huy Được Bảo Vệ"
    : summary.defeatReason === "hq"
      ? "Sở Chỉ Huy Thất Thủ"
      : "Báo Thép Bị Phá Hủy";
  const accent = summary.victory ? "emerald" : "red";

  return (
    <div className="command-screen battle-result-screen mx-auto w-full max-w-lg space-y-3 px-3 pb-6 pt-3" data-tank-battle-phase="result">
      <section className={`relative overflow-hidden rounded-3xl border p-5 text-center shadow-2xl ${summary.victory ? "border-emerald-400/35 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950" : "border-red-400/30 bg-gradient-to-br from-red-950/70 via-slate-900 to-slate-950"}`}>
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent ${summary.victory ? "via-emerald-300" : "via-red-300"} to-transparent`} />
        <Trophy className={`mx-auto h-9 w-9 ${summary.victory ? "text-amber-300" : "text-slate-500"}`} />
        <div className={`mt-2 text-[10px] font-black uppercase tracking-[0.24em] ${summary.victory ? "text-emerald-300" : "text-red-300"}`}>{summary.victory ? "Chiến thắng" : "Nhiệm vụ thất bại"}</div>
        <h2 className="mt-1 text-xl font-black text-white">{headline}</h2>
        <div className="mt-3 flex items-end justify-center gap-3">
          <div>
            <div className="text-[9px] font-black uppercase text-slate-500">Xếp hạng</div>
            <div className={`text-5xl font-black leading-none ${rankIndex >= 3 ? "text-amber-300" : summary.victory ? "text-emerald-300" : "text-slate-300"}`}>{summary.rank}</div>
          </div>
          <div className="mb-1 h-12 w-px bg-slate-700" />
          <div className="mb-1 text-left">
            <div className="text-[9px] font-black uppercase text-slate-500">Tổng điểm</div>
            <div className="text-2xl font-black text-slate-100">{summary.score.toLocaleString("vi-VN")}</div>
            {isRecord && <div className="text-[9px] font-black uppercase text-amber-300">Kỷ lục mới</div>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/85 p-3.5">
        <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Báo cáo chiến trường</div>
        <div className="grid grid-cols-2 gap-2">
          <Metric icon={<Target className="h-3 w-3" />} label="Địch / Elite" value={`${summary.enemiesDefeated} / ${summary.elitesDefeated}`} />
          <Metric icon={<Crosshair className="h-3 w-3" />} label="Pháo trúng" value={`${summary.cannonHits}/${summary.cannonShots} · ${Math.round(summary.cannonAccuracy * 100)}%`} />
          <Metric icon={<Bomb className="h-3 w-3" />} label="Hạ bằng mìn" value={summary.mineKills.toLocaleString("vi-VN")} />
          <Metric icon={<Activity className="h-3 w-3" />} label="Gây / nhận" value={`${Math.round(summary.damageDealt)} / ${Math.round(summary.damageTaken)}`} />
          <Metric icon={<Shield className="h-3 w-3" />} label="HP Sở Chỉ Huy" value={`${Math.ceil(summary.hqHpRemaining)}/${Math.round(summary.hqMaxHp)}`} />
          <Metric icon={<Activity className="h-3 w-3" />} label="Sát thương HQ" value={Math.round(summary.hqDamageTaken).toLocaleString("vi-VN")} />
          <Metric icon={<BrickWall className="h-3 w-3" />} label="Tường ta / địch phá" value={`${summary.wallsDestroyedByPlayer} / ${summary.wallsDestroyedByEnemy}`} />
          <Metric icon={<Clock3 className="h-3 w-3" />} label="Trận / Boss" value={`${formatTime(summary.runSeconds)} / ${formatTime(summary.bossClearSeconds)}`} />
        </div>
      </section>

      {summary.upgrades.length > 0 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/85 p-3.5">
          <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Đội hình nâng cấp</div>
          <div className="flex flex-wrap gap-1.5">
            {summary.upgrades.map((id, index) => (
              <span key={`${id}-${index}`} className="rounded-lg border border-amber-300/20 bg-amber-400/10 px-2 py-1 text-[9px] font-bold text-amber-200">{UPGRADE_BY_ID[id].icon} {UPGRADE_BY_ID[id].name}</span>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-emerald-400/20 bg-slate-900/85 p-3.5">
        <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Thưởng nhiệm vụ · hệ số {Math.round(reward.rewardRate * 100)}%</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 py-3 text-amber-300"><Coins className="h-4 w-4" /><strong>+{reward.gold} Vàng</strong></div>
          <div className="flex items-center justify-center gap-2 rounded-xl border border-fuchsia-400/25 bg-fuchsia-400/10 py-3 text-fuchsia-300"><Sparkles className="h-4 w-4" /><strong>+{reward.xp} XP</strong></div>
        </div>
        <p className="mt-2 text-center text-[10px] leading-relaxed text-slate-500">Phần thưởng nhỏ và giảm dần theo số lượt trong ngày; không cộng Giờ Chiến Thuật.{reward.dailyCapReached ? " Đã đạt giới hạn thưởng hôm nay." : ""}</p>
      </section>

      <div className="grid grid-cols-[1fr_1.4fr] gap-2">
        <button type="button" onClick={onBack} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 text-xs font-black text-slate-200 active:scale-[.98]"><ArrowLeft className="h-4 w-4" /> Giải Trí</button>
        <button type="button" onClick={onReplay} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${accent === "emerald" ? "from-emerald-400 to-lime-300" : "from-amber-400 to-orange-400"} text-sm font-black text-slate-950 shadow-lg active:scale-[.98]`}><RefreshCw className="h-4 w-4" /> Xuất Kích Lại</button>
      </div>
    </div>
  );
};
