import React, { useEffect, useState } from "react";
import { Gift, Clock, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { GameState } from "../../game/types";
import { getFormattedResetCountdown, getTrainingDateKey } from "../../game/training/trainingClock";
import { getXpProgressDetails } from "../../game/selectors";
import { TRAINING_DIFFICULTIES } from "../../game/training/trainingConfig";

type TrainingRewardCardProps = {
  gameState: GameState;
};

export const TrainingRewardCard: React.FC<TrainingRewardCardProps> = ({ gameState }) => {
  const [resetCountdown, setResetCountdown] = useState<string>("");

  const nowMs = Date.now();
  const currentDateKey = getTrainingDateKey(nowMs);
  const dailyReward = gameState.training.dailyReward;
  const isClaimedToday = dailyReward.lastClaimDateKey === currentDateKey;
  const xpDetails = getXpProgressDetails(gameState);

  useEffect(() => {
    const updateCountdown = () => {
      setResetCountdown(getFormattedResetCountdown());
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 30_000);
    return () => clearInterval(timer);
  }, []);

  let claimedGameLabel = "";
  if (dailyReward.lastClaimedGameId === "signal_command") {
    claimedGameLabel = "Mật Lệnh Tín Hiệu";
  } else if (dailyReward.lastClaimedGameId === "march_rhythm") {
    claimedGameLabel = "Nhịp Hành Quân";
  }

  let claimedDifficultyLabel = "";
  if (dailyReward.lastClaimedDifficulty) {
    claimedDifficultyLabel = TRAINING_DIFFICULTIES[dailyReward.lastClaimedDifficulty]?.label || "";
  }

  let claimedTimeStr = "";
  if (dailyReward.lastClaimedAt) {
    const d = new Date(dailyReward.lastClaimedAt);
    claimedTimeStr = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="command-panel w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl relative overflow-hidden">
      <span className="command-kicker mb-2">Lệnh huấn luyện ngày</span>

      {/* State A: Claimed Today */}
      {isClaimedToday ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <h3 className="font-bold text-xs sm:text-sm text-emerald-300">Đã nhận thưởng hôm nay</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              Đặt lại: {resetCountdown}
            </span>
          </div>

          <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-emerald-500/20 text-xs text-slate-200 flex items-center justify-between">
            <span>Đã nhận: <strong className="text-amber-400">{claimedGameLabel || "Huấn Luyện"} · {claimedDifficultyLabel}</strong></span>
            <span className="text-emerald-400 font-extrabold">+{dailyReward.lastNominalRewardXp} XP</span>
          </div>
        </div>
      ) : xpDetails.isFull ? (
        /* State C: XP Bar Full */
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <h3 className="font-bold text-xs sm:text-sm text-amber-300">Thanh XP đã đầy</h3>
          </div>
          <span className="text-xs text-slate-400">Thăng cấp để tiếp tục nhận XP</span>
        </div>
      ) : (
        /* State B: Not Claimed Today */
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-4.5 h-4.5 text-amber-400 shrink-0" />
              <h3 className="font-bold text-xs sm:text-sm text-amber-300">Thưởng thắng trận đầu tiên</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              Đặt lại 00:00
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950/80 py-1.5 px-2 rounded-xl border border-slate-800 text-center flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Dễ</span>
              <span className="text-xs font-extrabold text-amber-400">+{TRAINING_DIFFICULTIES.easy.rewardXp} XP</span>
            </div>
            <div className="bg-slate-950/80 py-1.5 px-2 rounded-xl border border-slate-800 text-center flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Vừa</span>
              <span className="text-xs font-extrabold text-amber-400">+{TRAINING_DIFFICULTIES.medium.rewardXp} XP</span>
            </div>
            <div className="bg-slate-950/80 py-1.5 px-2 rounded-xl border border-slate-800 text-center flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Khó</span>
              <span className="text-xs font-extrabold text-amber-400">+{TRAINING_DIFFICULTIES.hard.rewardXp} XP</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
