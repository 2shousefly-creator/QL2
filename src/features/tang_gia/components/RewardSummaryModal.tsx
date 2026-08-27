import React from "react";
import { Coins, Sparkles, X, Check, Sprout, Egg } from "lucide-react";
import { ItemQuality, QualityBreakdown } from "../farmTypes";
import { QUALITY_CONFIG } from "../weatherEngine";

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
  wateredBonusGold?: number;
  wateredBonusXp?: number;
  fertilizerBonusXp?: number;
  rainBonusGold?: number;
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
  const hasWateringBonus =
    ((data.wateredBonusGold ?? 0) > 0) ||
    ((data.wateredBonusXp ?? 0) > 0);
  const hasFertilizerBonus = (data.fertilizerBonusXp ?? 0) > 0;
  const hasRainBonus = (data.rainBonusGold ?? 0) > 0;
  const totalXpBonus =
    (data.wateredBonusXp || 0) + (data.fertilizerBonusXp || 0);

  const activeQualityTiers = QUALITY_ORDER.filter(
    (q) => (data.qualityBreakdown?.[q]?.quantity ?? 0) > 0
  );

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col items-center text-center p-5 relative cursor-default"
      >
        {/* Background glow */}
        <div
          className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isHarvest ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Main Header Icon */}
        <div
          className={`w-16 h-16 rounded-3xl border flex items-center justify-center text-3xl mb-3 shadow-lg ${
            isHarvest
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
              : "bg-amber-500/20 border-amber-500/40 text-amber-400"
          }`}
        >
          {isHarvest ? <Sprout className="w-8 h-8 text-emerald-400" /> : <Egg className="w-8 h-8 text-amber-400" />}
        </div>

        {/* Title */}
        <h3 className="font-black text-lg text-slate-100 uppercase tracking-wide">
          {data.title}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5 mb-4">
          {data.message || (isHarvest ? "Thu hoạch nông sản thành công!" : "Giao dịch bán trứng thành công!")}
        </p>

        {/* Items list */}
        {data.itemsSummary && data.itemsSummary.length > 0 && (
          <div className="w-full bg-slate-850 border border-slate-750/80 rounded-2xl p-3 mb-3 space-y-1.5 text-left">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Chi tiết vật phẩm:
            </span>
            {data.itemsSummary.map((item, idx) => {
              const qualityConfig = item.quality
                ? QUALITY_CONFIG[item.quality]
                : null;

              return (
                <div key={idx} className="flex items-center justify-between gap-2 text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 min-w-0">
                    {item.icon && <span>{item.icon}</span>}
                    <span className="truncate">{item.name}</span>
                    {qualityConfig && (
                      <span className={`inline-flex items-center gap-1 rounded-lg border px-1.5 py-0.5 text-[10px] font-extrabold shrink-0 ${qualityConfig.badgeClass}`}>
                        <span>{qualityConfig.icon}</span>
                        <span>{qualityConfig.name}</span>
                        <span>×{qualityConfig.multiplier}</span>
                      </span>
                    )}
                  </span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-emerald-400 font-black shrink-0">x{item.count}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Quality Breakdown if present */}
        {activeQualityTiers.length > 0 && (
          <div className="w-full bg-slate-850 border border-slate-750/80 rounded-2xl p-3 mb-3 text-left space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block flex items-center gap-1">
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
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-extrabold ${config.badgeClass}`}>
                        <span>{config.icon}</span>
                        <span>{config.name}</span>
                        <span>×{config.multiplier}</span>
                      </span>
                      <span className="text-slate-300 font-extrabold text-xs">
                        x{tierData.quantity}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-end gap-x-2.5 gap-y-0.5 text-[11px] font-extrabold text-right">
                      <span className="text-amber-300">
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
        <div className="grid grid-cols-2 gap-3 w-full mb-3">
          {/* Gold Badge */}
          <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/30 rounded-2xl p-3 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-0.5">
              <span>🪙</span>
              <span>Tổng Vàng</span>
            </div>
            <span className="font-black text-xl text-amber-300">
              +{data.goldEarned.toLocaleString()}
            </span>
            {((data.wateredBonusGold ?? 0) > 0 || (data.rainBonusGold ?? 0) > 0) && (
              <span className="text-[10px] font-extrabold text-sky-400 mt-0.5">
                (💧 Buff +{((data.wateredBonusGold || 0) + (data.rainBonusGold || 0)).toLocaleString()})
              </span>
            )}
          </div>

          {/* XP Badge */}
          <div className="bg-gradient-to-br from-purple-500/15 to-purple-600/5 border border-purple-500/30 rounded-2xl p-3 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold mb-0.5">
              <Sparkles className="w-4 h-4" />
              <span>Tổng XP</span>
            </div>
            <span className="font-black text-xl text-purple-300">
              +{data.xpEarned.toLocaleString()}
            </span>
            {totalXpBonus > 0 && (
              <span className="text-[10px] font-extrabold text-purple-300 mt-0.5">
                (⚡ Buff +{totalXpBonus})
              </span>
            )}
          </div>
        </div>

        {/* Detailed Buff Breakdown if present */}
        {(hasWateringBonus || hasFertilizerBonus || hasRainBonus) && (
          <div className="w-full bg-slate-850 border border-slate-750/80 rounded-2xl p-3 mb-4 text-left space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Chi Tiết Thưởng Buff:
            </span>
            {hasWateringBonus && (
              <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <span>💧</span>
                <span>
                  Tưới Nước: +{data.wateredBonusGold || 0} 🪙 Vàng & +{data.wateredBonusXp || 0} XP
                </span>
              </div>
            )}
            {hasRainBonus && (
              <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <span>🌧</span>
                <span>
                  Mưa Tăng Vàng: +{data.rainBonusGold || 0} 🪙 Vàng
                </span>
              </div>
            )}
            {hasFertilizerBonus && (
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>✨</span>
                <span>Phân Bón: +{data.fertilizerBonusXp} XP</span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Xác Nhận & Nhận Quà</span>
        </button>
      </div>
    </div>
  );
};
