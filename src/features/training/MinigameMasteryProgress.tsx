import React from "react";
import { Crown, Trophy, CheckCircle2 } from "lucide-react";
import { GameState, TrainingGameId } from "../../game/types";
import { MASTERY_CONFIGS, getMasteryTitleForMinigame } from "../../game/mastery/masteryConfig";

type MinigameMasteryProgressProps = {
  gameState: GameState;
  gameId: TrainingGameId;
};

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V"];

export const MinigameMasteryProgress: React.FC<MinigameMasteryProgressProps> = ({
  gameState,
  gameId,
}) => {
  const mState = gameState.mastery?.[gameId] || {
    level: 0,
    stageSuccessfulCount: 0,
    stageMediumOrHigherCount: 0,
    stageHardCount: 0,
    currentHardWinStreak: 0,
  };

  const level = mState.level || 0;
  const cfg = MASTERY_CONFIGS[gameId];
  const isMax = level >= 5;
  const targetStage = Math.min(5, level + 1);
  const nextStageCfg = cfg?.stages?.[targetStage];

  const masteryTitle = getMasteryTitleForMinigame(gameId, level);

  const targetCount = nextStageCfg?.targetSuccessfulCount || 10;
  const currentCount = mState.stageSuccessfulCount || 0;
  const progressPct = Math.min(100, Math.round((currentCount / targetCount) * 100));

  return (
    <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3 flex flex-col gap-2 shadow-md">
      {/* Danh hiệu Mastery hiện tại */}
      <div className="flex items-center justify-between text-xs font-bold text-amber-300">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{masteryTitle}</span>
        </div>
        {!isMax && (
          <span className="text-[11px] font-bold text-amber-400 font-mono">
            {currentCount} / {targetCount} trận thắng
          </span>
        )}
      </div>

      {/* Thanh tiến trình Mastery kế tiếp */}
      {!isMax && nextStageCfg ? (
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold pt-0.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Đã đạt cấp Tinh Thông tối đa (Mastery V)</span>
        </div>
      )}
    </div>
  );
};
