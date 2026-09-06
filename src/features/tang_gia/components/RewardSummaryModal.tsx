import React from "react";
import { Check, Egg, Sparkles, Sprout, X } from "lucide-react";
import { ItemQuality, QualityBreakdown } from "../farmTypes";
import { QUALITY_CONFIG } from "../weatherEngine";
import { GameResultModal, ModalActions, ModalButton, OverlayBody, ResultHero } from "../../../components/overlay/AppOverlay";

export interface RewardSummaryItem {
  name?: string;
  count?: number;
  icon?: string;
  quality?: ItemQuality;
}

export interface RewardSummaryData {
  title: string;
  iconType: "harvest" | "egg_sale" | "general";
  itemsSummary?: RewardSummaryItem[];
  goldEarned: number;
  xpEarned: number;
  fertilizerBonusXp?: number;
  rainBonusGold?: number;
  droughtPenaltyGold?: number;
  soldByQuality?: Record<ItemQuality, number>;
  qualityBreakdown?: QualityBreakdown;
  message?: string;
}

interface RewardSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RewardSummaryData | null;
}

const QUALITY_ORDER: ItemQuality[] = ["thuong", "tot", "hiem", "hoan_my"];

export const RewardSummaryModal: React.FC<RewardSummaryModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;

  const isHarvest = data.iconType === "harvest";
  const hasFertilizerBonus = (data.fertilizerBonusXp ?? 0) > 0;
  const hasRainBonus = (data.rainBonusGold ?? 0) > 0;
  const hasDroughtPenalty = (data.droughtPenaltyGold ?? 0) > 0;
  const totalXpBonus = data.fertilizerBonusXp || 0;

  const activeQualityTiers = QUALITY_ORDER.filter(
    (q) => (data.qualityBreakdown?.[q]?.quantity ?? 0) > 0
  );

  return (
    <GameResultModal status={"reward"} theme="farm"
      onClose={onClose}
      closeOnBackdrop
      labelledBy="reward-summary-title"
      panelClassName="text-center"
    >
        <ResultHero className="flex flex-col items-center text-center">
        {/* Background glow */}

        {/* Close Button */}
        <ModalButton variant="icon"
          onClick={onClose}
          className="absolute right-3 top-3"
          aria-label="Đóng tổng kết phần thưởng"
        >
          <X className="w-4 h-4" />
        </ModalButton>

        {/* Main Header Icon */}
        <div
          className="modal-status-icon"
        >
          {isHarvest ? <Sprout className="w-8 h-8 text-[var(--modal-success)]" /> : <Egg className="w-8 h-8 text-[var(--modal-reward)]" />}
        </div>

        {/* Title */}
        <h3 id="reward-summary-title" className="modal-title">
          {data.title}
        </h3>
        <p className="modal-copy">
          {data.message || (isHarvest ? "Thu hoạch nông sản thành công!" : "Giao dịch bán trứng thành công!")}
        </p>
        </ResultHero>

        <OverlayBody className="w-full">

        {/* Items list */}
        {data.itemsSummary && data.itemsSummary.length > 0 && (
          <div className="w-full modal-section space-y-1.5 text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--modal-muted)] block mb-1">
              Chi tiết vật phẩm:
            </span>
            {data.itemsSummary.map((item, idx) => {
              const qualityConfig = item.quality
                ? QUALITY_CONFIG[item.quality]
                : null;

              return (
                <div key={idx} className="flex items-center justify-between gap-2 text-xs font-bold text-[var(--modal-text)]">
                  <span className="flex items-center gap-1.5 min-w-0">
                    {item.icon && <span>{item.icon}</span>}
                    <span className="truncate">{item.name}</span>
                    {qualityConfig && (
                      <span className={`inline-flex items-center gap-1 rounded-lg border px-1.5 py-0.5 text-xs font-semibold shrink-0 ${qualityConfig.badgeClass}`}>
                        <span>{qualityConfig.icon}</span>
                        <span>{qualityConfig.name}</span>
                        <span>×{qualityConfig.multiplier}</span>
                      </span>
                    )}
                  </span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[var(--modal-success)] font-semibold shrink-0">x{item.count}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Quality Breakdown if present */}
        {activeQualityTiers.length > 0 && (
          <div className="w-full modal-section text-left space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--modal-reward)] block flex items-center gap-1">
              <span>✨</span>
              <span>Chi Tiết Theo Phẩm Chất:</span>
            </span>
            <div className="space-y-1.5">
              {activeQualityTiers.map((q) => {
                const tierData = data.qualityBreakdown![q];
                const config = QUALITY_CONFIG[q];
                return (
                  <div
                    key={q}
                    className="flex items-center justify-between rounded-xl border px-2.5 py-1.5 text-xs"
                    style={{
                      borderColor: config.color,
                      backgroundColor: config.surfaceColor,
                      boxShadow: `0 0 12px ${config.glowColor}`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-semibold ${config.badgeClass}`}>
                        <span>{config.icon}</span>
                        <span>{config.name}</span>
                        <span>×{config.multiplier}</span>
                      </span>
                      <span className="text-[var(--modal-text)] font-semibold text-xs">
                        x{tierData.quantity}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-end gap-x-2.5 gap-y-0.5 text-xs font-semibold text-right">
                      <span className="text-[var(--modal-reward)]">
                        +{tierData.baseGold.toLocaleString()} 🪙{" "}
                        <strong style={{ color: config.color }}>
                          (+{tierData.qualityBonusGold.toLocaleString()})
                        </strong>
                      </span>
                      <span className="text-purple-300">
                        +{tierData.baseXp.toLocaleString()} XP{" "}
                        <strong style={{ color: config.color }}>
                          (+{tierData.qualityBonusXp.toLocaleString()})
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reward Stats Badge (Tổng Gold và Tổng XP) */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {/* Gold Badge */}
          <div className="modal-section flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 text-[var(--modal-reward)] text-xs font-bold mb-0.5">
              <span>🪙</span>
              <span>Tổng Vàng</span>
            </div>
            <span className="font-semibold text-xl text-[var(--modal-reward)]">
              +{data.goldEarned.toLocaleString()}
            </span>
            {(data.rainBonusGold ?? 0) > 0 && (
              <span className="text-xs font-semibold text-[var(--modal-info)] mt-0.5">
                (🌧 Buff +{(data.rainBonusGold || 0).toLocaleString()})
              </span>
            )}
          </div>

          {/* XP Badge */}
          <div className="modal-section flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold mb-0.5">
              <Sparkles className="w-4 h-4" />
              <span>Tổng XP</span>
            </div>
            <span className="font-semibold text-xl text-purple-300">
              +{data.xpEarned.toLocaleString()}
            </span>
            {totalXpBonus > 0 && (
              <span className="text-xs font-semibold text-purple-300 mt-0.5">
                (⚡ Buff +{totalXpBonus})
              </span>
            )}
          </div>
        </div>

        {/* Detailed Buff Breakdown if present */}
        {(hasFertilizerBonus || hasRainBonus || hasDroughtPenalty) && (
          <div className="w-full modal-section text-left space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--modal-reward)] block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Chi Tiết Thưởng Buff:
            </span>
            {hasRainBonus && (
              <div className="text-xs font-bold text-[var(--modal-info)] flex items-center gap-1.5">
                <span>🌧</span>
                <span>
                  Mưa Tăng Vàng: +{data.rainBonusGold || 0} 🪙 Vàng
                </span>
              </div>
            )}
            {hasFertilizerBonus && (
              <div className="text-xs font-bold text-[var(--modal-reward)] flex items-center gap-1.5">
                <span>✨</span>
                <span>Phân Bón: +{data.fertilizerBonusXp} XP</span>
              </div>
            )}
            {hasDroughtPenalty && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--modal-danger)]">
                <span>🔴</span>
                <span>Khô cằn: -{data.droughtPenaltyGold} 🪙 Vàng</span>
              </div>
            )}
          </div>
        )}
        </OverlayBody>

        {/* Action Button */}
        <ModalActions>
          <ModalButton variant="primary"
            onClick={onClose}
            className="w-full"
          >
            <Check className="w-4 h-4" />
            <span>Xác Nhận & Nhận Quà</span>
          </ModalButton>
        </ModalActions>
    </GameResultModal>
  );
};
