import React, { useState, useEffect, useRef } from "react";
import { FEED_CATALOG } from "../farmCatalog";
import { FeedTypeId, FarmInventory, FeedDefinition } from "../farmTypes";
import { Wheat, X, Plus, Minus, Zap, Utensils, ChevronLeft, ArrowRight } from "lucide-react";
import { adjustIntegerQuantity } from "../../../utils/quantityInput";

interface FeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: FarmInventory;
  penFeedBuffValue: number;
  activeFeedSpeedBonus?: number;
  onSelectFeed: (feedId: FeedTypeId, quantity: number) => void;
  onOpenStore?: () => void;
}

export const FeedModal: React.FC<FeedModalProps> = ({
  isOpen,
  onClose,
  inventory,
  penFeedBuffValue = 0,
  activeFeedSpeedBonus = 0,
  onSelectFeed,
  onOpenStore,
}) => {
  const [selectedFeed, setSelectedFeed] = useState<FeedDefinition | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const quantityPristineRef = useRef(true);

  // Reset local state whenever modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFeed(null);
      setQuantity(1);
      setIsSubmitting(false);
      quantityPristineRef.current = true;
    }
  }, [isOpen]);

  const currentBuff = Math.max(0, Math.min(100, penFeedBuffValue || 0));

  // Compute maximum quantity allowed for a specific feed
  const getMaxQuantity = (feed: FeedDefinition): number => {
    const ownedCount = inventory.feed?.[feed.id] || 0;
    if (ownedCount <= 0 || feed.buffAmount <= 0) return 0;
    if (currentBuff >= 100) return 0;
    const remaining = Math.max(0, 100 - currentBuff);
    const capacityQty = Math.ceil(remaining / feed.buffAmount);
    return Math.max(0, Math.min(ownedCount, capacityQty));
  };

  const selectedMaxQty = selectedFeed ? getMaxQuantity(selectedFeed) : 0;

  useEffect(() => {
    if (!isOpen || !selectedFeed || selectedMaxQty <= 0) return;
    setQuantity((current) =>
      adjustIntegerQuantity(current, 0, 1, selectedMaxQty)
    );
  }, [isOpen, selectedFeed?.id, selectedMaxQty]);

  if (!isOpen) return null;

  const handleOpenQuantitySelector = (feed: FeedDefinition) => {
    const maxQty = getMaxQuantity(feed);
    if (maxQty <= 0) return;
    setSelectedFeed(feed);
    setQuantity(1);
    quantityPristineRef.current = true;
  };

  const handleQuantityQuickAdjust = (delta: number, maxQty: number) => {
    const wasPristine = quantityPristineRef.current;
    quantityPristineRef.current = false;
    setQuantity((current) =>
      adjustIntegerQuantity(
        wasPristine && delta > 0 ? 0 : current,
        delta,
        1,
        maxQty
      )
    );
  };

  const handleConfirmFeed = () => {
    if (!selectedFeed || isSubmitting) return;
    const maxQty = getMaxQuantity(selectedFeed);
    const validQty = Math.max(1, Math.min(maxQty, Math.floor(quantity)));

    if (validQty <= 0) return;

    setIsSubmitting(true);
    try {
      onSelectFeed(selectedFeed.id, validQty);
      setSelectedFeed(null);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalOwnedFeed = (Object.values(inventory.feed || {}) as number[]).reduce(
    (a, b) => a + (b || 0),
    0
  );

  const activeSpeed = currentBuff > 0 ? activeFeedSpeedBonus : 0;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-md max-h-[82vh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col cursor-default my-auto"
      >
        {/* Modal Header (Fixed) */}
        <div className="p-3.5 sm:p-4 bg-slate-850 border-b border-slate-750 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100 leading-tight">
                {selectedFeed ? `Nạp ${selectedFeed.name}` : "Nạp Thức Ăn Vào Máng Ăn"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedFeed
                  ? "Chọn số lượng bao thức ăn muốn nạp vào Máng Ăn."
                  : "Nạp thức ăn giúp tăng tốc độ đẻ trứng ở vật nuôi chuồng."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Trough Status Bar (Fixed) */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              <span>Dung Lượng Máng Ăn:</span>
            </span>
            <div className="flex items-center gap-2">
              {activeSpeed > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  ⚡ +{activeSpeed}% tốc độ
                </span>
              )}
              <span
                className={`font-mono font-black ${
                  currentBuff > 0 ? "text-emerald-400" : "text-amber-500"
                }`}
              >
                {Math.round(currentBuff)}% / 100%
              </span>
            </div>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                currentBuff > 0
                  ? "bg-gradient-to-r from-amber-500 to-emerald-400"
                  : "bg-slate-700"
              }`}
              style={{ width: `${Math.round(currentBuff)}%` }}
            />
          </div>
        </div>

        {/* Modal Body with smooth vertical scroll */}
        {!selectedFeed ? (
          /* View 1: Feed Selection List */
          <div className="p-3.5 sm:p-4 space-y-2.5 flex-1 min-h-0 overflow-y-auto overscroll-contain">
            {totalOwnedFeed === 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-2.5 my-auto">
                <p className="text-xs text-amber-300 font-extrabold">
                  Chưa có thức ăn nào trong kho!
                </p>
                {onOpenStore && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenStore();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    Mua Thức Ăn Tại Cửa Hàng
                  </button>
                )}
              </div>
            )}

            {FEED_CATALOG.map((feed) => {
              const count = inventory.feed?.[feed.id] || 0;
              if (count <= 0) return null;

              const maxQty = getMaxQuantity(feed);
              const isTroughFullForThis = maxQty <= 0;

              return (
                <div
                  key={feed.id}
                  onClick={() => {
                    if (!isTroughFullForThis) {
                      handleOpenQuantitySelector(feed);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border w-full flex items-center justify-between text-left transition-all relative overflow-hidden shadow-sm ${
                    isTroughFullForThis
                      ? "bg-slate-850/60 border-slate-800 text-slate-400 opacity-75 cursor-not-allowed"
                      : "bg-slate-850 hover:bg-slate-800 border-slate-700 hover:border-amber-500/50 text-slate-100 active:scale-[0.98] cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌾</span>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-100">
                        {feed.name}
                      </h4>
                      <div className="text-[10px] text-emerald-400 font-extrabold mt-0.5 space-y-0.5">
                        <div>• Nạp máng: +{feed.buffAmount}% / bao</div>
                        <div>• Tốc độ đẻ trứng: +{feed.speedBonusPercent}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl border bg-amber-500/20 text-amber-300 border-amber-500/30">
                      Kho: {count}
                    </span>

                    {isTroughFullForThis ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                        {currentBuff >= 100 ? "Máng đã đầy" : "Không đủ dung tích máng"}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                        Tối đa nạp: {maxQty} <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View 2: Quantity Configuration View */
          <div className="p-3.5 sm:p-4 space-y-3.5 flex-1 min-h-0 overflow-y-auto overscroll-contain">
            {/* Stepper & Quantity Picker */}
            {(() => {
              const maxQty = getMaxQuantity(selectedFeed);
              const addedFill = selectedFeed.buffAmount * quantity;
              const nextBuff = Math.min(100, Math.round(currentBuff + addedFill));
              const willUpgradeSpeed = selectedFeed.speedBonusPercent > activeSpeed;

              return (
                <div className="space-y-3">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">Số lượng nạp:</span>
                      <span className="text-[11px] text-slate-400">
                        Số lượng tối đa có thể nạp:{" "}
                        <strong className="text-amber-300 font-mono">
                          {maxQty} bao
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          quantityPristineRef.current = false;
                          setQuantity((q) => Math.max(1, q - 1));
                        }}
                        disabled={quantity <= 1}
                        aria-label="Giảm 1 bao thức ăn"
                        className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-bold flex items-center justify-center border border-slate-700 transition-all active:scale-95 cursor-pointer shrink-0"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 border border-slate-750 rounded-xl py-1.5">
                        <input
                          type="number"
                          min={1}
                          max={maxQty}
                          value={quantity}
                          onChange={(e) => {
                            quantityPristineRef.current = false;
                            const val = parseInt(e.target.value, 10);
                            if (isNaN(val)) {
                              setQuantity(1);
                            } else {
                              setQuantity(adjustIntegerQuantity(val, 0, 1, maxQty));
                            }
                          }}
                          className="w-full text-center bg-transparent font-black text-xl text-amber-300 font-mono outline-none"
                        />
                        <span className="text-[9px] text-slate-400 font-bold">bao thức ăn</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          quantityPristineRef.current = false;
                          setQuantity((q) => Math.min(maxQty, q + 1));
                        }}
                        disabled={quantity >= maxQty}
                        aria-label="Tăng 1 bao thức ăn"
                        className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-bold flex items-center justify-center border border-slate-700 transition-all active:scale-95 cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick adjustment buttons */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[-10, -5, 5, 10].map((delta) => (
                        <button
                          key={delta}
                          type="button"
                          disabled={delta < 0 ? quantity <= 1 : quantity >= maxQty}
                          onClick={() => handleQuantityQuickAdjust(delta, maxQty)}
                          aria-label={`${delta < 0 ? "Giảm" : "Tăng"} ${Math.abs(delta)} bao thức ăn`}
                          className="min-h-10 rounded-xl border border-slate-700 bg-slate-800 px-2 text-xs font-bold text-slate-300 transition-all hover:bg-slate-750 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          {delta > 0 ? "+" : ""}{delta}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={maxQty <= 0 || quantity >= maxQty}
                      onClick={() => {
                        quantityPristineRef.current = false;
                        setQuantity(maxQty);
                      }}
                      aria-label={`Chọn tối đa ${maxQty} bao thức ăn`}
                      className="min-h-10 w-full rounded-xl border border-amber-500/40 bg-amber-500/20 px-2 text-xs font-bold text-amber-300 transition-all hover:bg-amber-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Tối đa ({maxQty})
                    </button>
                  </div>

                  {/* Impact Calculation Preview */}
                  <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Máng Ăn sau nạp:</span>
                      <span className="font-bold font-mono text-emerald-400">
                        {Math.round(currentBuff)}% ➔ {nextBuff}% (+{addedFill}%)
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80 p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-200"
                        style={{ width: `${nextBuff}%` }}
                      />
                    </div>

                    <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-400">Tốc độ đẻ trứng:</span>
                      <span className="font-bold flex items-center gap-1 text-amber-300">
                        <Zap className="w-3 h-3 text-amber-400" />
                        {willUpgradeSpeed ? (
                          <span className="text-emerald-400">
                            +{activeSpeed}% ➔ +{selectedFeed.speedBonusPercent}% (Nâng cấp)
                          </span>
                        ) : activeSpeed > 0 ? (
                          <span>+{activeSpeed}% (Duy trì)</span>
                        ) : (
                          <span className="text-emerald-400">+{selectedFeed.speedBonusPercent}% (Kích hoạt)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setSelectedFeed(null)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Chọn lại</span>
                    </button>
                    <button
                      type="button"
                      disabled={quantity <= 0 || quantity > maxQty || isSubmitting}
                      onClick={handleConfirmFeed}
                      className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Wheat className="w-4 h-4" />
                      <span>
                        {isSubmitting ? "Đang Nạp..." : `Xác Nhận Nạp (${quantity} bao)`}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
