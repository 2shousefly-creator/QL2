import React, { useState } from "react";
import { ArrowUp, Coins, Construction, FastForward, Gift, LockKeyhole, Sparkles, Timer, Users } from "lucide-react";
import { RANK_STEPS } from "../../../../game/rankBuilder";
import {
  MAX_BARRACKS_LEVEL,
  getBarracksUpgradeDurationMs,
  getLevelUpgradeCost,
  getQuickFinishCost,
  getRequiredRankIndexForBarracksLevel,
  getTrainingCost,
  getTrainingDurationMs,
  getTrainingSlotCount,
} from "../config";
import { canUseEmergencyTraining, getTrainingCountForTroop } from "../profileEngine";
import { formatChienTuyenDurationForAriaMs, formatChienTuyenDurationMs } from "../durationFormat";
import { TROOP_CATALOG_LIST, TROOP_BY_TYPE } from "../troopCatalog";
import type { ChienTuyenProfileV2, TroopType } from "../types";
import { getPrimaryRolePresentation } from "../uxPresentation";
import { TroopDetailModal } from "./TroopDetailModal";
import { TroopIcon } from "./TroopIcon";
import { TroopUpgradeModal } from "./TroopUpgradeModal";

interface BarracksViewProps {
  profile: ChienTuyenProfileV2;
  gold: number;
  maxBarracksLevel: number;
  now: number;
  onTrain: (troopType: TroopType) => void;
  onQuickFinishTraining: (jobId: string) => void;
  onQuickFinishBarracks: () => void;
  onQuickFinishTroopUpgrade: (troopType: TroopType) => void;
  onUpgradeTroop: (troopType: TroopType) => void;
  onUpgradeBarracks: () => void;
  onClaimEmergency: () => void;
}

function rankNameForBarracksLevel(level: number): string {
  return RANK_STEPS[getRequiredRankIndexForBarracksLevel(level)]?.displayName ?? "cấp bậc tiếp theo";
}

export const BarracksView: React.FC<BarracksViewProps> = ({
  profile,
  gold,
  maxBarracksLevel,
  now,
  onTrain,
  onQuickFinishTraining,
  onQuickFinishBarracks,
  onQuickFinishTroopUpgrade,
  onUpgradeTroop,
  onUpgradeBarracks,
  onClaimEmergency,
}) => {
  const [detail, setDetail] = useState<TroopType | null>(null);
  const [upgradeSelection, setUpgradeSelection] = useState<TroopType | null>(null);
  const trainingSlots = getTrainingSlotCount(profile.barracksLevel);
  const trainingFull = profile.trainingJobs.length >= trainingSlots;
  const canEmergency = canUseEmergencyTraining(profile, gold);
  const barracksTarget = Math.min(MAX_BARRACKS_LEVEL, profile.barracksLevel + 1);
  const barracksCost = getLevelUpgradeCost(barracksTarget);
  const barracksAtJourneyCap = profile.barracksLevel >= maxBarracksLevel;
  const barracksAtAbsoluteCap = profile.barracksLevel >= MAX_BARRACKS_LEVEL;
  const barracksTargetSlots = getTrainingSlotCount(barracksTarget);
  const barracksSlotDelta = Math.max(0, barracksTargetSlots - trainingSlots);
  const nextSlotLevel = Array.from({ length: MAX_BARRACKS_LEVEL }, (_, index) => index + 1).find(
    (level) => level > profile.barracksLevel && getTrainingSlotCount(level) > trainingSlots
  );
  const nextSlotRankName = nextSlotLevel ? rankNameForBarracksLevel(nextSlotLevel) : null;
  const nextBarracksRankName = rankNameForBarracksLevel(barracksTarget);
  const barracksJob = profile.barracksUpgradeJob;
  const barracksRemainingMs = barracksJob
    ? Math.max(0, barracksJob.completeAt - now)
    : 0;
  const barracksJobDurationMs = barracksJob
    ? Math.max(1, barracksJob.completeAt - barracksJob.startedAt)
    : 1;
  const barracksProgress = barracksJob
    ? Math.max(0, Math.min(100, ((now - barracksJob.startedAt) / barracksJobDurationMs) * 100))
    : 0;
  const barracksQuickCost = barracksJob
    ? barracksRemainingMs <= 0 ? 0 : getQuickFinishCost(barracksRemainingMs)
    : 0;

  return (
    <div className="ct-v2-view" data-chien-tuyen-view="barracks">
      <section className="ct-v2-hero-card ct-v2-hero-card--orange ct-v2-hero-card--compact">
        <div className="ct-v2-hero-orb" aria-hidden="true"><Construction className="h-8 w-8" /></div>
        <div className="min-w-0 flex-1">
          <div className="ct-v2-eyebrow">TRUNG TÂM HUẤN LUYỆN</div>
          <h2>Doanh Trại Lv{profile.barracksLevel}</h2>
        </div>
        <div className="ct-v2-progress-ring ct-v2-progress-ring--orange"><strong>{profile.trainingJobs.length}</strong><span>/{trainingSlots} ô</span></div>
      </section>

      <section className="ct-v2-panel">
        <div className="flex items-start gap-3">
          <div className="ct-v2-panel-icon"><ArrowUp className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <div className="ct-v2-eyebrow">NÂNG CẤP DOANH TRẠI</div>
            <h3>{barracksAtAbsoluteCap ? "Đã đạt cấp tối đa" : `Lv${profile.barracksLevel} → Lv${barracksTarget}`}</h3>
          </div>
        </div>
        {barracksJob ? (
          <div className="ct-v2-job-row ct-v2-barracks-upgrade-job mt-3" data-job-type="barracks-upgrade">
            <Timer className="h-5 w-5 text-orange-500" />
            <div className="min-w-0 flex-1">
              <strong>Lv{barracksJob.fromLevel} → Lv{barracksJob.targetLevel}</strong>
              <span>Còn {formatChienTuyenDurationMs(barracksRemainingMs)}</span>
            </div>
            <div className="ct-v2-barracks-quick-finish">
              <i aria-label={`Tiến độ ${Math.round(barracksProgress)} phần trăm`}>
                <b style={{ width: `${barracksProgress}%` }} />
              </i>
              <button
                type="button"
                disabled={gold < barracksQuickCost}
                onClick={onQuickFinishBarracks}
                data-action-kind="quick-finish-warning"
                aria-label={`Hoàn thành nhanh Doanh Trại với ${barracksQuickCost} Vàng`}
              >
                <FastForward className="h-3.5 w-3.5" aria-hidden="true" />
                <strong>{barracksQuickCost}</strong>
              </button>
            </div>
          </div>
        ) : (
          <>
            {!barracksAtAbsoluteCap && !barracksAtJourneyCap && (
              <div className="ct-v2-barracks-unlocks">
                <span>Giới hạn quân <strong>Lv{barracksTarget}</strong></span>
                {barracksSlotDelta > 0 && <span>Ô đào tạo <strong>+{barracksSlotDelta}</strong></span>}
              </div>
            )}
            <button
              type="button"
              disabled={barracksAtAbsoluteCap || barracksAtJourneyCap || gold < barracksCost}
              onClick={onUpgradeBarracks}
              className="ct-v2-secondary-button mt-3 w-full"
              data-action="upgrade-barracks"
              data-action-kind="upgrade-secondary"
            >
              {barracksAtJourneyCap && !barracksAtAbsoluteCap ? <><LockKeyhole className="h-4 w-4" /> Mở tại {nextBarracksRankName}</> : barracksAtAbsoluteCap ? "Cấp tối đa" : <><ArrowUp className="h-4 w-4" /> {barracksCost} <Coins className="h-4 w-4" /> · {formatChienTuyenDurationMs(getBarracksUpgradeDurationMs(barracksTarget))}</>}
            </button>
          </>
        )}
      </section>

      {canEmergency && (
        <section className="ct-v2-emergency-card" data-emergency-training>
          <div className="flex items-start gap-3"><Gift className="h-6 w-6 shrink-0" /><div><strong>Tiếp viện khẩn cấp</strong><p>Quân số quá thấp và chưa đủ Vàng. Nhận 1 Bộ Binh miễn phí sau 60 giây.</p></div></div>
          <button type="button" onClick={onClaimEmergency} className="ct-v2-primary-button mt-3 w-full"><Sparkles className="h-4 w-4" aria-hidden="true" /> Đào tạo miễn phí</button>
        </section>
      )}

      <section className="ct-v2-panel">
        <div className="mb-2 flex items-end justify-between gap-2">
          <div><div className="ct-v2-eyebrow">HÀNG ĐỢI</div><h3>Ô đào tạo</h3><p className="ct-v2-helper mt-1">{nextSlotRankName ? `Mở ô đào tạo tiếp theo ở ${nextSlotRankName}.` : "Đã mở tối đa 12 ô đào tạo."}</p></div>
          <span className="text-[10px] font-black text-slate-500">{profile.trainingJobs.length}/{trainingSlots}</span>
        </div>
        <div className="ct-v2-training-grid">
          {Array.from({ length: trainingSlots }, (_, index) => {
            const job = profile.trainingJobs[index];
            if (!job) return <div key={`empty-${index}`} className="ct-v2-empty-job"><b aria-hidden="true">+</b><strong>TRỐNG</strong><small>Ô {index + 1}</small></div>;
            const troop = TROOP_BY_TYPE[job.troopType];
            const remainingMs = job.completeAt - now;
            const isComplete = remainingMs <= 0;
            const quickCost = isComplete ? 0 : getQuickFinishCost(remainingMs);
            const durationMs = Math.max(1, job.completeAt - job.startedAt);
            const progress = isComplete ? 100 : Math.max(0, Math.min(100, ((now - job.startedAt) / durationMs) * 100));
            return (
              <div key={job.id} className={`ct-v2-training-job ${isComplete ? "is-complete" : ""}`} data-training-job={job.id}>
                <TroopIcon troopType={job.troopType} size="medium" className="ct-v2-training-job-icon" />
                <div className="min-w-0 flex-1"><strong>{troop.shortName}</strong><span>{isComplete ? "HOÀN TẤT" : `${job.emergency ? "Tiếp viện · " : "Còn "}${formatChienTuyenDurationMs(remainingMs)}`}</span><i className="ct-v2-training-progress" aria-label={`Tiến độ ${Math.round(progress)} phần trăm`}><b style={{ width: `${progress}%` }} /></i></div>
                <button
                  type="button"
                  disabled={!isComplete && gold < quickCost}
                  onClick={() => onQuickFinishTraining(job.id)}
                  aria-label={isComplete ? `Nhận ${troop.name} đã đào tạo xong` : `Hoàn tất nhanh ${troop.name} với ${quickCost} Vàng`}
                >
                  {isComplete ? "NHẬN" : <><FastForward className="h-3.5 w-3.5" aria-hidden="true" /><strong>{quickCost}</strong></>}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="ct-v2-panel">
        <div className="mb-3"><div className="ct-v2-eyebrow">BINH CHỦNG</div><h3>Đào tạo & nâng cấp</h3><p className="ct-v2-helper">Tất cả binh chủng đã mở từ đầu. Giới hạn cấp bằng cấp Doanh Trại.</p></div>
        <div className="ct-v2-barracks-grid">
          {TROOP_CATALOG_LIST.map((troop) => {
            const level = profile.troopLevels[troop.id];
            const count = profile.readyCounts[troop.id];
            const trainingCost = getTrainingCost(troop.id);
            const trainingDurationMs = getTrainingDurationMs(troop.id, level);
            const trainingCount = getTrainingCountForTroop(profile, troop.id);
            const upgradeJob = profile.troopUpgradeJobs[troop.id];
            const cardState = upgradeJob
              ? "upgrading"
              : trainingCount > 0
              ? "training"
              : "ready";
            const canUpgrade = level < profile.barracksLevel && !upgradeJob;
            const upgradeCost = getLevelUpgradeCost(level + 1);
            const primaryRole = getPrimaryRolePresentation(troop.id);

            const upgradeRemainingMs = upgradeJob ? Math.max(0, upgradeJob.completeAt - now) : 0;
            const isUpgradeComplete = upgradeJob ? upgradeRemainingMs <= 0 : false;
            const upgradeQuickCost = upgradeJob ? (isUpgradeComplete ? 0 : getQuickFinishCost(upgradeRemainingMs)) : 0;
            const upgradeDuration = upgradeJob ? Math.max(1, upgradeJob.completeAt - upgradeJob.startedAt) : 1;
            const upgradeProgress = upgradeJob
              ? (isUpgradeComplete ? 100 : Math.max(0, Math.min(100, ((now - upgradeJob.startedAt) / upgradeDuration) * 100)))
              : 0;

            return (
              <article key={troop.id} className="ct-v2-barracks-card" data-troop-type={troop.id}>
                <button type="button" onClick={() => setDetail(troop.id)} className="ct-v2-barracks-card-head" aria-haspopup="dialog" aria-label={`Xem chi tiết ${troop.name}`}>
                  <TroopIcon troopType={troop.id} size="medium" />
                  <span className="min-w-0"><strong className="block truncate text-xs text-slate-800">{troop.name}</strong><small className="block text-[10px] font-black" style={{ color: troop.color }}>Lv{level} · Sẵn sàng ×{count}</small></span>
                </button>
                <div className="ct-v2-barracks-card-meta">
                  <span className="ct-v2-role-chip"><b aria-hidden="true">{primaryRole.icon}</b>{primaryRole.label}</span>
                  <span
                    className={`ct-v2-card-state is-${cardState}`}
                    data-card-state={cardState}
                  >
                    {cardState === "upgrading"
                      ? "Đang Nâng Cấp"
                      : cardState === "training"
                      ? `Đang Đào Tạo ×${trainingCount}`
                      : `Sẵn Sàng ×${count}`}
                  </span>
                </div>
                {upgradeJob ? (
                  <div className="ct-v2-upgrade-progress" onClick={() => setUpgradeSelection(troop.id)} style={{ cursor: "pointer" }}>
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="flex items-center gap-1 font-bold text-[8px] text-amber-900">
                        <Timer className="h-3 w-3 text-amber-600 animate-pulse" /> Lv{upgradeJob.targetLevel} · {isUpgradeComplete ? "HOÀN TẤT" : `Còn ${formatChienTuyenDurationMs(upgradeRemainingMs)}`}
                      </span>
                      <span className="text-[7px] font-black text-amber-800">{Math.round(upgradeProgress)}%</span>
                    </div>
                    <i className="ct-v2-upgrade-progress-bar" aria-label={`Tiến độ ${Math.round(upgradeProgress)} phần trăm`}>
                      <b style={{ width: `${upgradeProgress}%` }} />
                    </i>
                  </div>
                ) : null}
                <div className="ct-v2-barracks-card-actions">
                  {upgradeJob ? (
                    <button
                      type="button"
                      disabled={!isUpgradeComplete && gold < upgradeQuickCost}
                      onClick={() => onQuickFinishTroopUpgrade(troop.id)}
                      className="ct-v2-barracks-upgrade-button ct-v2-barracks-quick-finish-button"
                      data-action={`quick-finish-upgrade-${troop.id}`}
                      data-action-kind="quick-finish-warning"
                      aria-label={`Hoàn thành nhanh nâng cấp ${troop.name} với ${upgradeQuickCost} Vàng`}
                    >
                      {isUpgradeComplete ? <span>NHẬN NGAY</span> : <><FastForward className="h-3.5 w-3.5" aria-hidden="true" /><strong>{upgradeQuickCost}</strong></>}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canUpgrade}
                      onClick={() => setUpgradeSelection(troop.id)}
                      className="ct-v2-barracks-upgrade-button"
                      data-action={`preview-upgrade-${troop.id}`}
                      data-action-kind="upgrade-secondary"
                      aria-label={canUpgrade ? `Nâng cấp ${troop.name} lên cấp ${level + 1}, giá ${upgradeCost} Vàng` : level >= MAX_BARRACKS_LEVEL ? `${troop.name} đã đạt cấp tối đa` : `${troop.name} cần Doanh Trại cấp ${level + 1}`}
                    >
                      {canUpgrade ? <><ArrowUp className="h-3.5 w-3.5" /> NÂNG CẤP</> : level >= MAX_BARRACKS_LEVEL ? "CẤP TỐI ĐA" : <><LockKeyhole className="h-3.5 w-3.5" /> CẦN Lv{level + 1}</>}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={trainingFull || gold < trainingCost}
                    onClick={() => onTrain(troop.id)}
                    className="ct-v2-train-button ct-v2-train-button--phase6"
                    data-action={`train-${troop.id}`}
                    data-action-kind="train-primary"
                    data-training-count={trainingCount}
                    data-training-cost={trainingCost}
                    data-training-time={trainingDurationMs}
                    aria-label={`Đào tạo ${troop.name}, giá ${trainingCost} Vàng, thời gian ${formatChienTuyenDurationForAriaMs(trainingDurationMs)}, hiện có ${trainingCount} ${troop.name} đang đào tạo.`}
                  >
                    <span className="ct-v2-train-button-main"><Users className="h-4 w-4" aria-hidden="true" /><span>ĐÀO TẠO</span></span>
                    <span className="ct-v2-train-button-meta"><span><Coins className="h-3 w-3" />{trainingCost}</span><span><Timer className="h-3 w-3" />{formatChienTuyenDurationMs(trainingDurationMs)}</span></span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {detail && (
        <TroopDetailModal
          troopType={detail}
          level={profile.troopLevels[detail]}
          readyCount={profile.readyCounts[detail]}
          onClose={() => setDetail(null)}
        />
      )}
      {upgradeSelection && (
        <TroopUpgradeModal
          troopType={upgradeSelection}
          level={profile.troopLevels[upgradeSelection]}
          barracksLevel={profile.barracksLevel}
          gold={gold}
          upgradeJob={profile.troopUpgradeJobs[upgradeSelection]}
          now={now}
          onConfirm={() => onUpgradeTroop(upgradeSelection)}
          onQuickFinish={() => onQuickFinishTroopUpgrade(upgradeSelection)}
          onClose={() => setUpgradeSelection(null)}
        />
      )}
    </div>
  );
};
