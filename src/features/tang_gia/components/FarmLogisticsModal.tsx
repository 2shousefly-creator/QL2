import { Bird, CheckCircle2, ClipboardCheck, Coins, Droplets, RefreshCw, Sparkles, Wheat, X } from "lucide-react";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";
import { FEED_CATALOG, FERTILIZER_CATALOG } from "../farmCatalog";
import { DAILY_LOGISTICS_BONUS, MAX_DAILY_ORDER_REROLLS, ensureLogisticsOrders } from "../farmEnhancements";
import type { FarmLogisticsOrder, FarmSaveState } from "../farmTypes";

interface FarmLogisticsModalProps {
  isOpen: boolean;
  farm: FarmSaveState;
  now: number;
  onClose: () => void;
  onClaimOrder: (orderId: string) => void;
  onRerollOrder: (orderId: string) => void;
  onClaimDailyBonus: () => void;
}

function getSupplyName(order: FarmLogisticsOrder): string | null {
  if (!order.bonusSupply) return null;
  if (order.bonusSupply.category === "fertilizer") {
    return FERTILIZER_CATALOG.find((entry) => entry.id === order.bonusSupply?.id)?.name ?? "Phân bón";
  }
  return FEED_CATALOG.find((entry) => entry.id === order.bonusSupply?.id)?.name ?? "Cám";
}

function OrderKindIcon({ kind }: { kind: FarmLogisticsOrder["kind"] }) {
  if (kind === "harvest") return <Wheat className="h-5 w-5 text-amber-300" />;
  if (kind === "care") return <Droplets className="h-5 w-5 text-sky-300" />;
  return <Bird className="h-5 w-5 text-emerald-300" />;
}

export function FarmLogisticsModal({
  isOpen,
  farm,
  now,
  onClose,
  onClaimOrder,
  onRerollOrder,
  onClaimDailyBonus,
}: FarmLogisticsModalProps) {
  if (!isOpen) return null;

  const logistics = ensureLogisticsOrders(farm, now);
  const claimedCount = logistics.orders.filter((order) => order.claimed).length;
  const remainingRerolls = Math.max(0, MAX_DAILY_ORDER_REROLLS - logistics.rerollsUsed);
  const allClaimed = logistics.orders.length === 3 && claimedCount === 3;

  return (
    <AppModal
      theme="farm"
      archetype="transaction"
      size="standard"
      onClose={onClose}
      closeOnBackdrop
      labelledBy="farm-logistics-title"
    >
      <OverlayHeader className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="modal-status-icon flex items-center justify-center rounded-xl border border-amber-300/35 bg-amber-400/15 p-2 text-amber-200">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 id="farm-logistics-title" className="text-base font-extrabold text-amber-50 truncate">
              Đơn Hàng Hậu Cần
            </h2>
            <p className="text-xs text-emerald-100/80">
              Ngày {logistics.dateKey} · Đổi đơn còn: <strong>{remainingRerolls}</strong>
            </p>
          </div>
        </div>
        <ModalButton variant="icon" aria-label="Đóng đơn hậu cần" onClick={onClose}>
          <X className="h-4 w-4" />
        </ModalButton>
      </OverlayHeader>

      <OverlayBody className="space-y-3">
        <div className="rounded-xl border border-amber-300/30 bg-emerald-950/55 p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-amber-200">
                <Sparkles className="h-4 w-4" />
                <span>Thưởng Tổng Kết ({claimedCount}/3 đơn)</span>
              </div>
              <p className="mt-0.5 text-xs text-emerald-100/85">
                +{DAILY_LOGISTICS_BONUS.gold} Vàng · +{DAILY_LOGISTICS_BONUS.xp} EXP · +{DAILY_LOGISTICS_BONUS.fertilizerCount} Phân Dinh Dưỡng Tốt
              </p>
            </div>
            {logistics.bonusClaimed ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/25 px-2.5 py-1.5 text-xs font-bold text-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Đã nhận
              </span>
            ) : (
              <ModalButton
                variant="primary"
                disabled={!allClaimed}
                onClick={onClaimDailyBonus}
                className="!min-h-0 !px-3 !py-1.5 !text-xs"
              >
                Nhận 3/3
              </ModalButton>
            )}
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${(claimedCount / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          {logistics.orders.map((order) => {
            const pct = Math.min(100, Math.round((order.progress / Math.max(1, order.target)) * 100));
            const ready = !order.claimed && order.progress >= order.target;
            const supplyName = getSupplyName(order);
            return (
              <div
                key={order.id}
                className={`rounded-xl border p-3 transition ${
                  order.claimed
                    ? "border-emerald-500/30 bg-emerald-950/35 opacity-80"
                    : ready
                      ? "border-amber-300/60 bg-emerald-900/55 shadow-md"
                      : "border-emerald-200/20 bg-emerald-950/45"
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/25">
                      <OrderKindIcon kind={order.kind} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-amber-50">{order.title}</h3>
                        <span className="rounded-md bg-black/35 px-1.5 py-0.5 text-[11px] font-bold text-emerald-100">
                          {order.progress}/{order.target}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-emerald-100/80">{order.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-amber-200">
                        <span className="inline-flex items-center gap-1 rounded bg-black/25 px-1.5 py-0.5">
                          <Coins className="h-3 w-3" /> +{order.rewardGold} Vàng
                        </span>
                        <span className="rounded bg-black/25 px-1.5 py-0.5 text-sky-200">
                          +{order.rewardXp} EXP
                        </span>
                        {supplyName && order.bonusSupply && (
                          <span className="rounded bg-black/25 px-1.5 py-0.5 text-emerald-200">
                            +{order.bonusSupply.count} {supplyName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/45">
                    <div
                      className={`h-full rounded-full transition-all ${
                        ready || order.claimed ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {!order.claimed && remainingRerolls > 0 && !ready && (
                    <button
                      type="button"
                      onClick={() => onRerollOrder(order.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/30 px-2.5 py-1 text-xs font-semibold text-emerald-100 hover:bg-black/50"
                      title="Đổi nhiệm vụ khác"
                    >
                      <RefreshCw className="h-3 w-3" /> Đổi
                    </button>
                  )}
                  {order.claimed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Đã giao
                    </span>
                  ) : (
                    <ModalButton
                      variant={ready ? "primary" : "ghost"}
                      disabled={!ready}
                      onClick={() => onClaimOrder(order.id)}
                      className="!min-h-0 !px-3 !py-1 !text-xs"
                    >
                      {ready ? "Nhận thưởng" : `${pct}%`}
                    </ModalButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </OverlayBody>

      <OverlayFooter className="flex justify-end">
        <ModalButton variant="ghost" onClick={onClose}>
          Đóng
        </ModalButton>
      </OverlayFooter>
    </AppModal>
  );
}
