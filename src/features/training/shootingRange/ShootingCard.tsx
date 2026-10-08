import React from "react";
import { Target, HelpCircle, Crosshair, Zap, Clock } from "lucide-react";
import { GameState, TrainingDifficulty } from "../../../game/types";
import { SHOOTING_DIFFICULTY_CONFIGS } from "../../../game/training/shootingRange/shootingConfig";
import { soundManager } from "../../../game/audio";
import { MinigameMasteryProgress } from "../MinigameMasteryProgress";

type ShootingCardProps = {
  gameState: GameState;
  selectedDifficulty: TrainingDifficulty;
  onSelectDifficulty: (difficulty: TrainingDifficulty) => void;
  onStartGame: () => void;
  onOpenTutorial: () => void;
};

export const ShootingCard: React.FC<ShootingCardProps> = ({
  gameState,
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
  onOpenTutorial,
}) => {
  const config = SHOOTING_DIFFICULTY_CONFIGS[selectedDifficulty];

  return (
    <div className="training-detail-panel bg-slate-900/90 border border-amber-500/30 rounded-3xl p-5 flex flex-col gap-5 shadow-2xl backdrop-blur-md">
      {/* Title Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
            <Target className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg text-slate-100">Bắn Súng</h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Thao trường FPS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Thao trường ngắm bắn 10 vòng điểm. Thử thách phản xạ & độ chính xác.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onOpenTutorial();
          }}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm"
          title="Hướng dẫn chơi Bắn Súng"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Hướng Dẫn</span>
        </button>
      </div>

      {/* Difficulty Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Chọn Mức Độ Huấn Luyện</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {(["easy", "medium", "hard"] as TrainingDifficulty[]).map((diff) => {
            const isSelected = selectedDifficulty === diff;
            const diffConf = SHOOTING_DIFFICULTY_CONFIGS[diff];

            return (
              <button
                key={diff}
                data-command-selected={isSelected}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onSelectDifficulty(diff);
                }}
                className={`py-3 px-2 rounded-2xl border transition-all flex flex-col items-center gap-1 text-center ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-500 text-amber-200 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400"
                }`}
              >
                <span className="font-extrabold text-sm capitalize">{diffConf.label}</span>
                <span className="text-[10px] opacity-80">
                  Tốc độ ×{diffConf.targetSpeedMultiplier.toFixed(1)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Specifications Strip */}
      <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800/90 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Thời lượng: 60 giây</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>Thử thách: 10 bia bắn</span>
        </div>
      </div>

      {/* Mastery Progress Card */}
      <MinigameMasteryProgress gameState={gameState} gameId="shooting_range" />

      {/* Start Button */}
      <button
        type="button"
        onClick={() => {
          soundManager.playClick();
          onStartGame();
        }}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
      >
        <Crosshair className="w-5 h-5" />
        <span>BẮT ĐẦU VÀO THAO TRƯỜNG</span>
      </button>
    </div>
  );
};
