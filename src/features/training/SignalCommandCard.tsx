import React from "react";
import { Play, Grid, Layers, BrainCircuit, HelpCircle } from "lucide-react";
import { GameState, TrainingDifficulty } from "../../game/types";
import { getSignalCommandConfig } from "../../game/training/signalCommand/signalCommandConfig";
import { isDailyTrainingRewardAvailable } from "../../game/training/dailyTrainingReward";
import { soundManager } from "../../game/audio";
import { getXpProgressDetails } from "../../game/selectors";
import { MinigameMasteryProgress } from "./MinigameMasteryProgress";

type SignalCommandCardProps = {
  gameState: GameState;
  selectedDifficulty: TrainingDifficulty;
  onSelectDifficulty: (diff: TrainingDifficulty) => void;
  onStartGame: () => void;
  onOpenTutorial?: () => void;
};

export const SignalCommandCard: React.FC<SignalCommandCardProps> = ({
  gameState,
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
  onOpenTutorial,
}) => {
  const isRewardAvailable = isDailyTrainingRewardAvailable(gameState);
  const xpDetails = getXpProgressDetails(gameState);
  const diffConfig = getSignalCommandConfig(selectedDifficulty);

  const handleDifficultyClick = (diff: TrainingDifficulty) => {
    soundManager.playClick();
    onSelectDifficulty(diff);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-100">Mật Lệnh Tín Hiệu</h3>
            <p className="text-xs text-slate-400">Ghi nhớ chuỗi tín hiệu rồi nhập lại chính xác theo mật lệnh của vòng.</p>
          </div>
        </div>

        {onOpenTutorial && (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenTutorial();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700/80 transition-all flex items-center gap-1 text-xs font-bold shrink-0 active:scale-95"
            title="Xem hướng dẫn chơi"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Hướng dẫn</span>
          </button>
        )}
      </div>

      {/* Skill Tags */}
      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
        <span className="bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800 text-cyan-300">Ghi nhớ</span>
        <span className="bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800 text-blue-300">Tập trung</span>
        <span className="bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800 text-indigo-300">Trình tự</span>
      </div>

      {/* Difficulty Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
        {(["easy", "medium", "hard"] as TrainingDifficulty[]).map((diffKey) => {
          const cfg = getSignalCommandConfig(diffKey);
          const isSelected = selectedDifficulty === diffKey;

          return (
            <button
              key={diffKey}
              type="button"
              onClick={() => handleDifficultyClick(diffKey)}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                isSelected
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <span>{cfg.label}</span>
              <span className={`text-[10px] font-mono ${isSelected ? "text-slate-900" : "text-cyan-400"}`}>
                {isRewardAvailable && !xpDetails.isFull ? `+${cfg.rewardXp} XP` : "0 XP"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Difficulty Specifications */}
      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <Grid className="w-3.5 h-3.5 text-cyan-400" />
          <span>Bảng {diffConfig.boardRows}×{diffConfig.boardColumns} ({diffConfig.signalCount} ô)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>{diffConfig.roundCount} vòng thử thách</span>
        </div>
      </div>

      {/* Mastery Progress Card */}
      <MinigameMasteryProgress gameState={gameState} gameId="signal_command" />

      {/* Start Button */}
      <button
        type="button"
        onClick={() => {
          soundManager.playClick();
          onStartGame();
        }}
        className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all"
      >
        <Play className="w-4 h-4 fill-slate-950" />
        Bắt Đầu Mật Lệnh ({diffConfig.label})
      </button>
    </div>
  );
};
