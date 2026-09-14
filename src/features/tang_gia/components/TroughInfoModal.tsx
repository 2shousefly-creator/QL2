import React from "react";
import { FEED_CATALOG } from "../farmCatalog";
import { PenAnimalState } from "../farmTypes";
import {
  getLivingAnimalCount,
  getPenDangerRatio,
  getStarvationDeadlineAt,
} from "../animalLifecycle";
import { formatFeedPercentage } from "../farmPresentation";
import { AlertTriangle, HeartPulse, Info, X, Zap, Utensils, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";

interface TroughInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFeed?: () => void;
  penAnimals: PenAnimalState[];
  penFeedBuffValue: number;
  penFeedEmptyAt?: number | null;
  activeFeedSpeedBonus?: number;
  penStarvationStartedAt?: number | null;
  now?: number;
}

export const TroughInfoModal: React.FC<TroughInfoModalProps> = ({
  isOpen,
  onClose,
  onFeed,
  penAnimals,
  penFeedBuffValue = 0,
  penFeedEmptyAt = null,
  activeFeedSpeedBonus = 0,
  penStarvationStartedAt = null,
  now = Date.now(),
}) => {
  if (!isOpen) return null;

  const currentBuff = Math.max(0, Math.min(100, penFeedBuffValue));
  const livingAnimalCount = getLivingAnimalCount(penAnimals);
  const deadAnimalCount = penAnimals.length - livingAnimalCount;
  const animalCount = Math.min(5, Math.max(1, livingAnimalCount));
  // 1 animal -> 12h, 2 -> 11h, 3 -> 10h, 4 -> 9h, 5 -> 8h
  const remainingFeedMs =
    livingAnimalCount > 0 && currentBuff > 0 && Number.isFinite(penFeedEmptyAt)
      ? Math.max(0, penFeedEmptyAt! - now)
      : 0;
  const starvationDeadlineAt = getStarvationDeadlineAt(penStarvationStartedAt);
  const dangerRatio = getPenDangerRatio(penStarvationStartedAt, now);
  const dangerRemainingMs = starvationDeadlineAt === null
    ? 0
    : Math.max(0, starvationDeadlineAt - now);
  const isDangerMode =
    currentBuff <= 0 && livingAnimalCount > 0 && starvationDeadlineAt !== null;
  const troughProgressPercent = isDangerMode
    ? dangerRatio * 100
    : currentBuff;

  const formatRemainingHours = (ms: number) => {
    if (ms <= 0) return "0 phút";
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ""}`.trim();
    }
    return `${minutes} phút`;
  };

  const activeSpeed = currentBuff > 0 ? activeFeedSpeedBonus : 0;

  return (
    <AppModal theme="farm" archetype="info"
      onClose={onClose}
      closeOnBackdrop
      labelledBy="trough-info-title"
    >
        {/* Header */}
        <OverlayHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="modal-status-icon">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 id="trough-info-title" className="modal-title">
                Thông Tin Máng Ăn
              </h3>
              <p className="modal-copy mt-0.5">
                Trạng thái hoạt động và cơ chế vận hành của Máng Ăn gia cầm.
              </p>
            </div>
          </div>

          <ModalButton variant="icon"
            type="button"
            onClick={onClose}
            aria-label="Đóng thông tin máng ăn"
          >
            <X className="w-4 h-4" />
          </ModalButton>
        </OverlayHeader>

        {/* Scrollable Content Body with smooth vertical scroll */}
        <OverlayBody>
          {/* SECTION 1: TRẠNG THÁI HIỆN TẠI */}
          <div className={`rounded-2xl border p-3.5 space-y-2.5 ${
            isDangerMode
              ? "border-red-800/80 bg-red-950/25 shadow-[0_0_16px_rgba(239,68,68,0.18)]"
              : "modal-section "
          }`}>
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800/80 pb-2">
              <span className="text-[var(--modal-reward)] flex items-center gap-1.5">
                <Utensils className="w-4 h-4" />
                <span>{isDangerMode ? "Nguy Hiểm Còn Lại" : "Trạng Thái Máng Ăn Hiện Tại"}</span>
              </span>
              <span
                className={`font-mono font-semibold ${
                  isDangerMode
                    ? "text-[var(--modal-danger)]"
                    : currentBuff > 0
                    ? "text-[var(--modal-success)]"
                    : "text-amber-500"
                }`}
              >
                {isDangerMode
                  ? `${Math.round(dangerRatio * 100)}%`
                  : formatFeedPercentage(currentBuff)} / 100%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isDangerMode
                    ? "bg-gradient-to-r from-red-700 via-red-500 to-rose-300 animate-pulse"
                    : currentBuff > 0
                    ? "bg-gradient-to-r from-amber-500 to-emerald-400"
                    : "bg-slate-700"
                }`}
                style={{ width: `${troughProgressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="modal-section">
                <div className="text-xs text-[var(--modal-muted)]">Vật nuôi trong chuồng</div>
                <div className="font-bold text-[var(--modal-text)] mt-0.5">
                  🐓 {livingAnimalCount} sống{deadAnimalCount > 0 ? ` · ${deadAnimalCount} chết` : ""}
                </div>
              </div>

              <div className="modal-section">
                <div className="text-xs text-[var(--modal-muted)]">Tốc độ đẻ trứng</div>
                <div className="font-bold text-[var(--modal-success)] mt-0.5 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[var(--modal-reward)]" />
                  {activeSpeed > 0 ? `+${activeSpeed}% tốc độ` : "Chưa có buff"}
                </div>
              </div>
            </div>

            {/* Remaining Food Duration */}
            <div className="modal-section text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[var(--modal-muted)] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[var(--modal-reward)]" />
                  {isDangerMode ? "Thời gian nguy hiểm còn lại:" : "Thời gian thức ăn còn lại:"}
                </span>
                <span className="font-bold text-[var(--modal-reward)] font-mono">
                  {livingAnimalCount > 0
                    ? isDangerMode
                      ? formatRemainingHours(dangerRemainingMs)
                      : currentBuff > 0
                      ? Number.isFinite(penFeedEmptyAt)
                        ? formatRemainingHours(remainingFeedMs)
                        : "Được bảo lưu sau khi vật nuôi chết"
                      : "0 phút (Hết thức ăn)"
                    : "Chưa có vật nuôi sống"}
                </span>
              </div>

              {livingAnimalCount === 0 && (
                <p className="text-[10.5px] text-[var(--modal-reward)] italic pt-0.5">
                  ℹ️ Chuồng chưa có vật nuôi: Thức ăn trong Máng Ăn sẽ được bảo lưu và chưa bị tiêu hao cho đến khi bạn thả vật nuôi vào chuồng.
                </p>
              )}
            </div>
          </div>

          {/* SECTION 2: CƠ CHẾ TIÊU HAO THEO SỐ VẬT NUÔI */}
          <div className="modal-section space-y-2">
            <h4 className="text-xs font-bold text-[var(--modal-text)] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--modal-reward)]" />
              <span>Cơ Chế Tiêu Hao Theo Số Lượng Vật Nuôi</span>
            </h4>
            <p className="text-xs text-[var(--modal-muted)] leading-relaxed">
              Dung tích tối đa của Máng Ăn là <strong>100%</strong>. Càng nuôi nhiều vật nuôi trong chuồng, Máng Ăn tiêu hao càng nhanh:
            </p>
            <div className="grid grid-cols-5 gap-1 pt-1 text-center">
              {[
                { count: 1, hours: 12 },
                { count: 2, hours: 11 },
                { count: 3, hours: 10 },
                { count: 4, hours: 9 },
                { count: 5, hours: 8 },
              ].map((item) => (
                <div
                  key={item.count}
                  className={`p-1.5 rounded-xl border text-xs ${
                    livingAnimalCount === item.count
                      ? "bg-amber-500/20 border-amber-500/50 text-[var(--modal-reward)] font-bold"
                      : "modal-section text-[var(--modal-muted)]"
                  }`}
                >
                  <div className="font-semibold">{item.count} con</div>
                  <div className="text-xs font-mono text-[var(--modal-text)]">{item.hours}h</div>
                </div>
              ))}
            </div>
            {livingAnimalCount > 0 && (
              <p className="text-[10.5px] text-[var(--modal-success)] pt-1">
                👉 Hiện chuồng có <strong>{livingAnimalCount} con còn sống</strong>: 100% thức ăn sẽ tiêu hao hết trong <strong>{13 - animalCount} giờ</strong>. Vật Nuôi chết vẫn chiếm ô nhưng không tiêu hao thức ăn.
              </p>
            )}
          </div>

          <div className="space-y-2 rounded-2xl border border-red-800/80 bg-red-950/35 p-3.5 text-xs leading-relaxed text-[var(--modal-danger)]">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-[var(--modal-danger)]">
              <AlertTriangle className="h-4 w-4" />
              NGUY HIỂM KHI HẾT THỨC ĂN
            </h4>
            <p>
              Khi Máng Ăn về 0%, thanh Máng chuyển sang màu đỏ và bắt đầu đếm ngược 12 giờ. Nếu không nạp thêm thức ăn trước khi hết thời gian, toàn bộ Vật Nuôi còn sống trong chuồng sẽ chết. Nạp thức ăn kịp thời sẽ hủy trạng thái nguy hiểm.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-emerald-800/80 bg-emerald-950/30 p-3.5 text-xs leading-relaxed text-[var(--modal-success)]">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-[var(--modal-success)]">
              <HeartPulse className="h-4 w-4" />
              TUỔI THỌ VẬT NUÔI
            </h4>
            <p>
              Mỗi loài có tuổi thọ riêng. Vật Nuôi sẽ lớn dần theo tuổi, di chuyển chậm hơn khi già và chết khi thanh tuổi thọ về 0%. Vật Nuôi chết không còn đẻ trứng và cần được Dọn để giải phóng ô chuồng.
            </p>
          </div>

          {/* SECTION 3: CÁC LOẠI THỨC ĂN TRONG CATALOG */}
          <div className="modal-section space-y-2.5">
            <h4 className="text-xs font-bold text-[var(--modal-text)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--modal-reward)]" />
              <span>Các Loại Thức Ăn & Tỷ Lệ Tăng Tốc</span>
            </h4>

            <div className="space-y-2">
              {FEED_CATALOG.map((feed) => (
                <div
                  key={feed.id}
                  className="modal-section flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🌾</span>
                    <div>
                      <div className="font-bold text-[var(--modal-text)]">{feed.name}</div>
                      <div className="text-xs text-[var(--modal-success)] font-medium mt-0.5">
                        +{feed.buffAmount}% dung tích máng / bao
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-950 text-[var(--modal-success)] border border-emerald-700 font-mono">
                    ⚡ +{feed.speedBonusPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: NGUYÊN TẮC NÂNG CẤP & BẢO TOÀN BUFF */}
          <div className="modal-section space-y-2 text-xs text-[var(--modal-text)] leading-relaxed">
            <h4 className="text-xs font-bold text-[var(--modal-text)] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--modal-success)]" />
              <span>Nguyên Tắc Nâng Cấp & Bảo Toàn Buff</span>
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-[var(--modal-text)]">
              <li>
                <strong>Nâng cấp tốc độ:</strong> Nếu nạp loại thức ăn có buff cao hơn buff hiện tại (vd: đang +10% nạp loại +25%), buff sẽ được <strong>nâng cấp ngay lập tức</strong> lên mức cao hơn.
              </li>
              <li>
                <strong>Bảo toàn buff cao:</strong> Nếu Máng Ăn đang có buff cao (vd: +25%) rồi nạp thức ăn loại thường (+10%), <strong>tốc độ +25% vẫn được giữ nguyên</strong> không bị hạ.
              </li>
              <li>
                <strong>Thời hạn buff:</strong> Tăng tốc chỉ có hiệu lực khi Máng Ăn còn thức ăn (&gt; 0%). Khi Máng Ăn về 0%, buff sẽ kết thúc cho đến khi bạn nạp thức ăn mới.
              </li>
            </ul>
          </div>
        </OverlayBody>

        {/* Footer (Fixed) */}
        <OverlayFooter className="flex items-center justify-end">
          {onFeed && <ModalButton variant="primary" type="button" onClick={onFeed} className="w-full">
            <Utensils className="h-4 w-4" /> Nạp Thức Ăn
          </ModalButton>}
          <ModalButton variant="ghost"
            type="button"
            onClick={onClose}
            className="w-full"
          >
            Đã Hiểu
          </ModalButton>
        </OverlayFooter>
    </AppModal>
  );
};
