import React, { useId, useMemo, useState } from "react";
import { ArrowRight, BarChart3, Castle, RotateCcw, Shield, Skull, Trophy, X } from "lucide-react";
import { MAX_TOWER_FLOOR } from "../config";
import type { BattleResult, BattleSide, BattleUnitStatistics } from "../types";
import { AppModal, GameResultScreen, ModalActions, ModalButton, OverlayBody, OverlayHeader, ResultHero, ResultStat, ResultStats } from "../../../../components/overlay/AppOverlay";

interface CampaignResultProps {
  result: BattleResult;
  rewardGold: number;
  firstClear: boolean;
  nextFloor: number;
  onContinue: () => void;
  onRetry: () => void;
  onBarracks: () => void;
  onTower: () => void;
}

type Metric = "damageDealt" | "damageTaken" | "shieldCreated" | "healingDone";
type UtilityMetric = "actionsTaken" | "ultimatesCast" | "kills" | "stunsApplied" | "actionsDenied" | "debuffsApplied";

const METRICS: ReadonlyArray<{ key: Metric; label: string; className: string }> = [
  { key: "damageDealt", label: "Sát thương gây ra", className: "is-damage-dealt" },
  { key: "damageTaken", label: "Sát thương nhận vào", className: "is-damage-taken" },
  { key: "shieldCreated", label: "Lá chắn tạo ra", className: "is-shield" },
  { key: "healingDone", label: "Máu đã hồi", className: "is-heal" },
];

const UTILITY_METRICS: ReadonlyArray<{ key: UtilityMetric; label: string; icon: string; always?: boolean }> = [
  { key: "actionsTaken", label: "Số Lượt Hành Động", icon: "⚡", always: true },
  { key: "ultimatesCast", label: "Ultimate", icon: "✦" },
  { key: "kills", label: "Kết liễu", icon: "☠" },
  { key: "stunsApplied", label: "Choáng", icon: "💫" },
  { key: "actionsDenied", label: "Lượt cản", icon: "⊘" },
  { key: "debuffsApplied", label: "Hiệu ứng xấu", icon: "☣" },
];

function StatisticsPanel({ result, onClose }: { result: BattleResult; onClose: () => void }) {
  const [tab, setTab] = useState<BattleSide>("player");
  const titleId = useId();
  const statistics = useMemo(
    () => Array.isArray(result.unitStatistics) ? result.unitStatistics : [],
    [result.unitStatistics]
  );
  const maxima = useMemo(() => Object.fromEntries(
    METRICS.map(({ key }) => [key, Math.max(0, ...statistics.map((unit) => unit[key]))])
  ) as Record<Metric, number>, [statistics]);
  const units = useMemo(() => statistics.filter((unit) => unit.side === tab), [statistics, tab]);

  return (
    <AppModal archetype="info"
      onClose={onClose}
      closeOnBackdrop
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy={titleId}
    >
        <OverlayHeader>
          <div><div className="ct-v2-eyebrow">BÁO CÁO CHIẾN ĐẤU</div><h3 className="modal-title" id={titleId}>THỐNG KÊ</h3></div>
          <ModalButton variant="icon" type="button" onClick={onClose} aria-label="Đóng thống kê"><X className="h-5 w-5" /></ModalButton>
        </OverlayHeader>
        <OverlayBody>
        <div className="ct-v2-stat-tabs" role="tablist" aria-label="Phe thống kê">
          <button className="modal-control" id="ct-stat-tab-player" type="button" role="tab" aria-selected={tab === "player"} aria-controls="ct-stat-panel" tabIndex={tab === "player" ? 0 : -1} onClick={() => setTab("player")}>QUÂN TA</button>
          <button className="modal-control" id="ct-stat-tab-enemy" type="button" role="tab" aria-selected={tab === "enemy"} aria-controls="ct-stat-panel" tabIndex={tab === "enemy" ? 0 : -1} onClick={() => setTab("enemy")}>KẺ ĐỊCH</button>
        </div>
        <div id="ct-stat-panel" className="ct-v2-stat-unit-list" role="tabpanel" aria-labelledby={tab === "player" ? "ct-stat-tab-player" : "ct-stat-tab-enemy"}>
          {units.map((unit: BattleUnitStatistics) => (
            <article className="ct-v2-stat-unit" key={unit.instanceId}>
              <div className="ct-v2-stat-unit-head"><span>{unit.icon}</span><div><strong>{unit.name}</strong><small>Lv{unit.level}</small></div></div>
              {METRICS.map(({ key, label, className }) => {
                const max = maxima[key];
                const value = unit[key];
                const width = max > 0 ? Math.min(100, (value / max) * 100) : 0;
                return (
                  <div className="ct-v2-metric" key={key}>
                    <div><span>{label}</span><strong>{Math.round(value).toLocaleString()}</strong></div>
                    <i className={className}><b style={{ width: `${width}%` }} /></i>
                  </div>
                );
              })}
              <div className="ct-v2-utility-metrics" aria-label={`Đóng góp chiến thuật của ${unit.name}`}>
                {UTILITY_METRICS.filter(({ key, always }) => always || Number(unit[key] ?? 0) > 0).map(({ key, label, icon }) => (
                  <span key={key} aria-label={`${label}: ${Number(unit[key] ?? 0)}`}><b aria-hidden="true">{icon}</b><small>{label}</small><strong>{Number(unit[key] ?? 0).toLocaleString("vi-VN")}</strong></span>
                ))}
              </div>
            </article>
          ))}
        </div>
        </OverlayBody>
    </AppModal>
  );
}

export const CampaignResult: React.FC<CampaignResultProps> = ({
  result,
  rewardGold,
  firstClear,
  onContinue,
  onRetry,
  onBarracks,
  onTower,
}) => {
  const [showStatistics, setShowStatistics] = useState(false);
  const victory = result.outcome === "player_victory";
  return (
    <GameResultScreen status={victory ? "success" : result.outcome === "draw" ? "warning" : "danger"} data-chien-tuyen-phase="result">
      <OverlayBody>
        <ResultHero>
          <div className="modal-status-icon">{victory ? <Trophy /> : <Skull />}</div>
          <div className="modal-meta">CHIẾN TUYẾN · TẦNG {result.floorNumber}</div>
          <h2 className="modal-title">{victory ? "CHIẾN THẮNG" : result.outcome === "draw" ? "BẤT PHÂN THẮNG BẠI" : "THẤT BẠI"}</h2>
          <p className="modal-copy">{victory ? "Tuyến phòng thủ đã bị phá vỡ. Tầng tiếp theo đang chờ bạn." : "Hãy bổ sung quân số, nâng cấp binh chủng và thử một đội hình khác."}</p>
        </ResultHero>
        <ResultStats>
          <ResultStat label="Số Lượt Trận" value={result.rounds} />
          <ResultStat label="Sống sót" value={result.survivorInstanceIds.length} />
          <ResultStat label="Tử trận" value={result.casualtyInstanceIds.length} />
        </ResultStats>
        <section className="modal-section">
          <h3 className="flex items-center gap-2 font-semibold"><Shield className="h-5 w-5" /> Báo cáo sau trận</h3>
          <p className="modal-copy">Đơn vị sống sót đã trở về kho quân với đầy đủ quân số. Đơn vị tử trận đã bị trừ vĩnh viễn.</p>
          {victory && <ResultStats><ResultStat status="reward" label={firstClear ? "THƯỞNG VƯỢT LẦN ĐẦU" : "TẦNG ĐÃ NHẬN THƯỞNG"} value={firstClear ? `+${rewardGold} Vàng` : "Không nhận thêm Vàng"} /></ResultStats>}
        </section>
      </OverlayBody>
      <ModalActions>
        {victory && result.floorNumber < MAX_TOWER_FLOOR && <ModalButton onClick={onContinue} variant="primary"><Castle className="h-5 w-5" /> Tầng tiếp theo <ArrowRight className="h-5 w-5" /></ModalButton>}
        {!victory && <ModalButton onClick={onRetry} variant="primary"><RotateCcw className="h-5 w-5" /> Thử lại</ModalButton>}
        <div className="modal-action-row">
          <ModalButton onClick={() => setShowStatistics(true)} variant="ghost"><BarChart3 className="h-5 w-5" /> Thống kê</ModalButton>
          <ModalButton onClick={onBarracks} variant="ghost"><Shield className="h-5 w-5" /> Doanh Trại</ModalButton>
          <ModalButton onClick={onTower} variant={victory && result.floorNumber >= MAX_TOWER_FLOOR ? "primary" : "ghost"}><Castle className="h-5 w-5" /> Về Tháp</ModalButton>
        </div>
      </ModalActions>
      {showStatistics && <StatisticsPanel result={result} onClose={() => setShowStatistics(false)} />}
    </GameResultScreen>
  );
};
