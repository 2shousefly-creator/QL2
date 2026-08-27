import React from "react";
import { Play, Activity, Layers, Clock, HelpCircle } from "lucide-react";
import { GameState, TrainingDifficulty } from "../../game/types";
import { TRAINING_DIFFICULTIES } from "../../game/training/trainingConfig";
import { isDailyTrainingRewardAvailable } from "../../game/training/dailyTrainingReward";
import { soundManager } from "../../game/audio";
import { MinigameMasteryProgress } from "./MinigameMasteryProgress";

type MarchRhythmCardProps = {
  gameState: GameState;
  selectedDifficulty: TrainingDifficulty;
  onSelectDifficulty: (diff: TrainingDifficulty) => void;
  onStartGame: () => void;
  onOpenTutorial?: () => void;
};

export const MarchRhythmCard: React.FC<MarchRhythmCardProps> = ({
  gameState,
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
  onOpenTutorial,
}) => {
  const isRewardAvailable = isDailyTrainingRewardAvailable(gameState);
  const diffConfig = TRAINING_DIFFICULTIES[selectedDifficulty];

  const handleDifficultyClick = (diff: TrainingDifficulty) => {
    soundManager.playClick();
    onSelectDifficulty(diff);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-100">Nhịp Hành Quân</h3>
            <p className="text-xs text-slate-400">Chạm đúng làn khi ký hiệu tiến đến vạch nhịp chuẩn.</p>
          </div>
        </div>

        {onOpenTutorial && (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenTutorial();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80 transition-all flex items-center gap-1 text-xs font-bold shrink-0 active:scale-95"
            title="Xem hướng dẫn chơi"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Hướng dẫn</span>
          </button>
        )}
      </div>

      {/* Difficulty Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
        {(["easy", "medium", "hard"] as TrainingDifficulty[]).map((diffKey) => {
          const cfg = TRAINING_DIFFICULTIES[diffKey];
          const isSelected = selectedDifficulty === diffKey;

          return (
            <button
              key={diffKey}
              type="button"
              onClick={() => handleDifficultyClick(diffKey)}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                isSelected
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <span>{cfg.label}</span>
              <span className={`text-[10px] font-mono ${isSelected ? "text-slate-900" : "text-amber-400"}`}>
                {isRewardAvailable ? `+${cfg.rewardXp} XP` : "0 XP"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Difficulty Specifications */}
      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>{diffConfig.laneCount} làn cảm ứng</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Thời lượng: ~{Math.round(diffConfig.activeDurationRangeMs[0] / 1000)}s</span>
        </div>
      </div>

      {/* Mastery Progress Card */}
      <MinigameMasteryProgress gameState={gameState} gameId="march_rhythm" />

      {/* Start Button */}
      <button
        type="button"
        onClick={() => {
          soundManager.playClick();
          onStartGame();
        }}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
      >
        <Play className="w-4 h-4 fill-slate-950" />
        Bắt Đầu Lượt Chơi ({diffConfig.label})
      </button>
    </div>
  );
};
