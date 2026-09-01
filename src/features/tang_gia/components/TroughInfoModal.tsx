import React from "react";
import { FEED_CATALOG } from "../farmCatalog";
import { PenAnimalState } from "../farmTypes";
import {
  getLivingAnimalCount,
  getPenDangerRatio,
  getStarvationDeadlineAt,
} from "../animalLifecycle";
import { AlertTriangle, HeartPulse, Info, X, Zap, Utensils, Clock, ShieldCheck, Sparkles } from "lucide-react";

interface TroughInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center p-3 sm:p-4 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px)+0.5rem)] bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-md max-h-[85vh] sm:max-h-[88vh] shadow-2xl flex flex-col cursor-default overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100 leading-tight">
                Thông Tin Máng Ăn
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Trạng thái hoạt động và cơ chế vận hành của Máng Ăn gia cầm.
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

        {/* Scrollable Content Body with smooth vertical scroll */}
        <div className="p-3.5 sm:p-4 space-y-3.5 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {/* SECTION 1: TRẠNG THÁI HIỆN TẠI */}
          <div className={`rounded-2xl border p-3.5 space-y-2.5 ${
            isDangerMode
              ? "border-red-800/80 bg-red-950/25 shadow-[0_0_16px_rgba(239,68,68,0.18)]"
              : "border-slate-800 bg-slate-950/80"
          }`}>
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800/80 pb-2">
              <span className="text-amber-400 flex items-center gap-1.5">
                <Utensils className="w-4 h-4" />
                <span>{isDangerMode ? "Nguy Hiểm Còn Lại" : "Trạng Thái Máng Ăn Hiện Tại"}</span>
              </span>
              <span
                className={`font-mono font-black ${
                  isDangerMode
                    ? "text-red-400"
                    : currentBuff > 0
                    ? "text-emerald-400"
                    : "text-amber-500"
                }`}
              >
                {Math.round((isDangerMode ? dangerRatio : currentBuff / 100) * 100)}% / 100%
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
                style={{
                  width: `${Math.round(
                    (isDangerMode ? dangerRatio : currentBuff / 100) * 100
                  )}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[10px] text-slate-400">Vật nuôi trong chuồng</div>
                <div className="font-bold text-slate-200 mt-0.5">
                  🐓 {livingAnimalCount} sống{deadAnimalCount > 0 ? ` · ${deadAnimalCount} chết` : ""}
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[10px] text-slate-400">Tốc độ đẻ trứng</div>
                <div className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {activeSpeed > 0 ? `+${activeSpeed}% tốc độ` : "Chưa có buff"}
                </div>
              </div>
            </div>

            {/* Remaining Food Duration */}
            <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {isDangerMode ? "Thời gian nguy hiểm còn lại:" : "Thời gian thức ăn còn lại:"}
                </span>
                <span className="font-bold text-amber-300 font-mono">
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
                <p className="text-[10.5px] text-amber-300/90 italic pt-0.5">
                  ℹ️ Chuồng chưa có vật nuôi: Thức ăn trong Máng Ăn sẽ được bảo lưu và chưa bị tiêu hao cho đến khi bạn thả vật nuôi vào chuồng.
                </p>
              )}
            </div>
          </div>

          {/* SECTION 2: CƠ CHẾ TIÊU HAO THEO SỐ VẬT NUÔI */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Cơ Chế Tiêu Hao Theo Số Lượng Vật Nuôi</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
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
                  className={`p-1.5 rounded-xl border text-[10px] ${
                    livingAnimalCount === item.count
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                      : "bg-slate-900/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="font-semibold">{item.count} con</div>
                  <div className="text-[9px] font-mono text-slate-300">{item.hours}h</div>
                </div>
              ))}
            </div>
            {livingAnimalCount > 0 && (
              <p className="text-[10.5px] text-emerald-400 pt-1">
                👉 Hiện chuồng có <strong>{livingAnimalCount} con còn sống</strong>: 100% thức ăn sẽ tiêu hao hết trong <strong>{13 - animalCount} giờ</strong>. Vật Nuôi chết vẫn chiếm ô nhưng không tiêu hao thức ăn.
              </p>
            )}
          </div>

          <div className="space-y-2 rounded-2xl border border-red-800/80 bg-red-950/35 p-3.5 text-[11px] leading-relaxed text-red-100">
            <h4 className="flex items-center gap-1.5 text-xs font-black text-red-300">
              <AlertTriangle className="h-4 w-4" />
              NGUY HIỂM KHI HẾT THỨC ĂN
            </h4>
            <p>
              Khi Máng Ăn về 0%, thanh Máng chuyển sang màu đỏ và bắt đầu đếm ngược 12 giờ. Nếu không nạp thêm thức ăn trước khi hết thời gian, toàn bộ Vật Nuôi còn sống trong chuồng sẽ chết. Nạp thức ăn kịp thời sẽ hủy trạng thái nguy hiểm.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-emerald-800/80 bg-emerald-950/30 p-3.5 text-[11px] leading-relaxed text-emerald-100">
            <h4 className="flex items-center gap-1.5 text-xs font-black text-emerald-300">
              <HeartPulse className="h-4 w-4" />
              TUỔI THỌ VẬT NUÔI
            </h4>
            <p>
              Mỗi loài có tuổi thọ riêng. Vật Nuôi sẽ lớn dần theo tuổi, di chuyển chậm hơn khi già và chết khi thanh tuổi thọ về 0%. Vật Nuôi chết không còn đẻ trứng và cần được Dọn để giải phóng ô chuồng.
            </p>
          </div>

          {/* SECTION 3: CÁC LOẠI THỨC ĂN TRONG CATALOG */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Các Loại Thức Ăn & Tỷ Lệ Tăng Tốc</span>
            </h4>

            <div className="space-y-2">
              {FEED_CATALOG.map((feed) => (
                <div
                  key={feed.id}
                  className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🌾</span>
                    <div>
                      <div className="font-bold text-slate-100">{feed.name}</div>
                      <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                        +{feed.buffAmount}% dung tích máng / bao
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono">
                    ⚡ +{feed.speedBonusPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: NGUYÊN TẮC NÂNG CẤP & BẢO TOÀN BUFF */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-[11px] text-slate-300 leading-relaxed">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nguyên Tắc Nâng Cấp & Bảo Toàn Buff</span>
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
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
        </div>

        {/* Footer (Fixed) */}
        <div className="p-3 sm:p-3.5 bg-slate-800/80 border-t border-slate-800 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-bold text-xs transition-all cursor-pointer"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
