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
import { GameResultScreen, ModalActions, ModalButton, OverlayBody, ResultHero } from "../../../components/overlay/AppOverlay";

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
    <div className="modal-section">
      <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--modal-muted)]">{icon}{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
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
    <GameResultScreen status={summary.victory ? "success" : "danger"} data-tank-battle-phase="result">
      <OverlayBody>
      <ResultHero>
        <Trophy className={`mx-auto h-9 w-9 ${summary.victory ? "text-[var(--modal-reward)]" : "text-[var(--modal-muted)]"}`} />
        <div className={`mt-2 text-xs font-semibold uppercase tracking-[0.24em] ${summary.victory ? "text-[var(--modal-success)]" : "text-[var(--modal-danger)]"}`}>{summary.victory ? "Chiến thắng" : "Nhiệm vụ thất bại"}</div>
        <h2 className="modal-title">{headline}</h2>
        <div className="mt-3 flex items-end justify-center gap-3">
          <div>
            <div className="text-xs font-semibold uppercase text-[var(--modal-muted)]">Xếp hạng</div>
            <div className={`text-3xl font-semibold leading-none ${rankIndex >= 3 ? "text-[var(--modal-reward)]" : summary.victory ? "text-[var(--modal-success)]" : "text-slate-300"}`}>{summary.rank}</div>
          </div>
          <div className="mb-1 h-12 w-px bg-slate-700" />
          <div className="mb-1 text-left">
            <div className="text-xs font-semibold uppercase text-[var(--modal-muted)]">Tổng điểm</div>
            <div className="text-2xl font-semibold text-slate-100">{summary.score.toLocaleString("vi-VN")}</div>
            {isRecord && <div className="text-xs font-semibold uppercase text-[var(--modal-reward)]">Kỷ lục mới</div>}
          </div>
        </div>
      </ResultHero>

      <section className="modal-section">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--modal-muted)]">Báo cáo chiến trường</div>
        <div className="grid grid-cols-2 gap-2">
          <Metric icon={<Target className="h-3 w-3" />} label="Địch / Tinh nhuệ" value={`${summary.enemiesDefeated} / ${summary.elitesDefeated}`} />
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
        <section className="modal-section">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--modal-muted)]">Đội hình nâng cấp</div>
          <div className="flex flex-wrap gap-1.5">
            {summary.upgrades.map((id, index) => (
              <span key={`${id}-${index}`} className="rounded-lg border border-amber-300/20 bg-amber-400/10 px-2 py-1 text-xs font-bold text-[var(--modal-reward)]">{UPGRADE_BY_ID[id].icon} {UPGRADE_BY_ID[id].name}</span>
            ))}
          </div>
        </section>
      )}

      <section className="modal-section">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--modal-muted)]">Thưởng nhiệm vụ · hệ số {Math.round(reward.rewardRate * 100)}%</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 py-3 text-[var(--modal-reward)]"><Coins className="h-4 w-4" /><strong>+{reward.gold} Vàng</strong></div>
          <div className="flex items-center justify-center gap-2 rounded-xl border border-fuchsia-400/25 bg-fuchsia-400/10 py-3 text-fuchsia-300"><Sparkles className="h-4 w-4" /><strong>+{reward.xp} XP</strong></div>
        </div>
        <p className="mt-2 text-center text-xs leading-relaxed text-[var(--modal-muted)]">Phần thưởng nhỏ và giảm dần theo số lượt trong ngày; không cộng Giờ Chiến Thuật.{reward.dailyCapReached ? " Đã đạt giới hạn thưởng hôm nay." : ""}</p>
      </section>

      </OverlayBody>
      <ModalActions>
        <ModalButton type="button" onClick={onBack} variant="ghost"><ArrowLeft className="h-4 w-4" /> Giải Trí</ModalButton>
        <ModalButton type="button" onClick={onReplay} variant="primary"><RefreshCw className="h-4 w-4" /> Xuất Kích Lại</ModalButton>
      </ModalActions>
    </GameResultScreen>
  );
};
