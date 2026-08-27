import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, BarChart3, Castle, Coins, RotateCcw, Shield, Skull, Sparkles, Trophy, Users, X } from "lucide-react";
import { MAX_TOWER_FLOOR } from "../config";
import type { BattleResult, BattleSide, BattleUnitStatistics } from "../types";

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
  const panelRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const statistics = useMemo(
    () => Array.isArray(result.unitStatistics) ? result.unitStatistics : [],
    [result.unitStatistics]
  );
  const maxima = useMemo(() => Object.fromEntries(
    METRICS.map(({ key }) => [key, Math.max(0, ...statistics.map((unit) => unit[key]))])
  ) as Record<Metric, number>, [statistics]);
  const units = useMemo(() => statistics.filter((unit) => unit.side === tab), [statistics, tab]);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')) as HTMLElement[];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); previouslyFocused?.focus(); };
  }, [onClose]);

  return (
    <div className="ct-v2-statistics-backdrop" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={panelRef} tabIndex={-1} className="ct-v2-statistics-panel">
        <header>
          <div><div className="ct-v2-eyebrow">BÁO CÁO CHIẾN ĐẤU</div><h3 id={titleId}>THỐNG KÊ</h3></div>
          <button ref={closeRef} type="button" className="ct-v2-icon-button" onClick={onClose} aria-label="Đóng thống kê"><X className="h-5 w-5" /></button>
        </header>
        <div className="ct-v2-stat-tabs" role="tablist" aria-label="Phe thống kê">
          <button id="ct-stat-tab-player" type="button" role="tab" aria-selected={tab === "player"} aria-controls="ct-stat-panel" tabIndex={tab === "player" ? 0 : -1} onClick={() => setTab("player")}>QUÂN TA</button>
          <button id="ct-stat-tab-enemy" type="button" role="tab" aria-selected={tab === "enemy"} aria-controls="ct-stat-panel" tabIndex={tab === "enemy" ? 0 : -1} onClick={() => setTab("enemy")}>KẺ ĐỊCH</button>
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
      </section>
    </div>
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
    <div className={`ct-v2-result-shell ${victory ? "is-victory" : "is-defeat"}`} data-chien-tuyen-phase="result">
      <div className="ct-v2-result-scroll">
        <section className="ct-v2-result-hero">
          <div className="ct-v2-result-emblem">{victory ? <Trophy className="h-12 w-12" /> : <Skull className="h-12 w-12" />}</div>
          <div className="ct-v2-eyebrow">CHIẾN TUYẾN · TẦNG {result.floorNumber}</div>
          <h2>{victory ? "CHIẾN THẮNG" : result.outcome === "draw" ? "BẤT PHÂN THẮNG BẠI" : "THẤT BẠI"}</h2>
          <p>{victory ? "Tuyến phòng thủ đã bị phá vỡ. Tầng tiếp theo đang chờ bạn." : "Hãy bổ sung quân số, nâng cấp binh chủng và thử một đội hình khác."}</p>
        </section>

        <section className="ct-v2-result-stats">
          <div><Sparkles className="h-5 w-5" /><span>Số Lượt Trận</span><strong>{result.rounds}</strong></div>
          <div><Users className="h-5 w-5" /><span>Sống sót</span><strong>{result.survivorInstanceIds.length}</strong></div>
          <div><Skull className="h-5 w-5" /><span>Tử trận</span><strong>{result.casualtyInstanceIds.length}</strong></div>
        </section>

        <section className="ct-v2-result-report">
          <h3><Shield className="h-5 w-5" /> Báo cáo sau trận</h3>
          <p>Đơn vị sống sót đã trở về kho quân với đầy đủ quân số. Đơn vị tử trận đã bị trừ vĩnh viễn.</p>
          {victory && (
            <div className={`ct-v2-reward-box ${firstClear ? "is-first-clear" : ""}`}>
              <Coins className="h-6 w-6" />
              <div><span>{firstClear ? "THƯỞNG VƯỢT LẦN ĐẦU" : "TẦNG ĐÃ NHẬN THƯỞNG"}</span><strong>{firstClear ? `+${rewardGold} Vàng` : "Không nhận thêm Vàng"}</strong></div>
            </div>
          )}
        </section>

        <div className="ct-v2-result-actions">
          {victory && result.floorNumber < MAX_TOWER_FLOOR && <button type="button" onClick={onContinue} className="ct-v2-primary-button"><Castle className="h-5 w-5" /> Tầng tiếp theo <ArrowRight className="h-5 w-5" /></button>}
          {!victory && <button type="button" onClick={onRetry} className="ct-v2-primary-button"><RotateCcw className="h-5 w-5" /> Thử lại</button>}
          <button type="button" onClick={() => setShowStatistics(true)} className="ct-v2-secondary-button"><BarChart3 className="h-5 w-5" /> Thống kê</button>
          <button type="button" onClick={onBarracks} className="ct-v2-secondary-button"><Shield className="h-5 w-5" /> Doanh Trại</button>
          <button type="button" onClick={onTower} className="ct-v2-ghost-button"><Castle className="h-5 w-5" /> Về Tháp</button>
        </div>
      </div>
      {showStatistics && <StatisticsPanel result={result} onClose={() => setShowStatistics(false)} />}
    </div>
  );
};
