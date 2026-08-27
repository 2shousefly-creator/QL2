import React from "react";
import { Play, Zap, RotateCw, Sparkles, HelpCircle } from "lucide-react";
import { GameState, TrainingDifficulty } from "../../../game/types";
import { FORMATION_CONFIGS } from "../../../game/training/formationAssembly/formationConfig";
import { isDailyTrainingRewardAvailable } from "../../../game/training/dailyTrainingReward";
import { soundManager } from "../../../game/audio";
import { MinigameMasteryProgress } from "../MinigameMasteryProgress";

type FormationAssemblyCardProps = {
  gameState: GameState;
  selectedDifficulty: TrainingDifficulty;
  onSelectDifficulty: (diff: TrainingDifficulty) => void;
  onStartGame: () => void;
  onOpenTutorial?: () => void;
};

export const FormationAssemblyCard: React.FC<FormationAssemblyCardProps> = ({
  gameState,
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
  onOpenTutorial,
}) => {
  const isRewardAvailable = isDailyTrainingRewardAvailable(gameState);
  const currentConfig = FORMATION_CONFIGS[selectedDifficulty];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl backdrop-blur-md">
      {/* Game Header */}
      <div className="flex items-start justify-between border-b border-slate-800/80 pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-slate-100">Xếp Đội Hình</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Quan sát & Ghi nhớ
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-snug">
            Ghi nhớ đội hình mẫu rồi phục dựng lại chính xác vị trí & hướng quân.
          </p>
        </div>

        {/* Right Header Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenTutorial && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onOpenTutorial();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700/80 transition-all flex items-center gap-1 text-xs font-bold active:scale-95"
              title="Xem hướng dẫn chơi"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Hướng dẫn</span>
            </button>
          )}

          {/* Reward Status Tag */}
          <div className="flex flex-col items-end">
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-extrabold text-xs border ${
                isRewardAvailable
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{currentConfig.rewardXp} XP</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {isRewardAvailable ? "Thưởng hôm nay" : "Đã nhận hôm nay"}
            </span>
          </div>
        </div>
      </div>

      {/* Difficulty Tabs */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-300">Chọn Độ Khó</label>
        <div className="grid grid-cols-3 gap-2">
          {(["easy", "medium", "hard"] as TrainingDifficulty[]).map((diff) => {
            const cfg = FORMATION_CONFIGS[diff];
            const isSelected = selectedDifficulty === diff;

            return (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onSelectDifficulty(diff);
                }}
                className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? "bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/30 text-slate-100 shadow-md"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <span className="font-extrabold text-xs">{cfg.label}</span>
                <span className={`text-[10px] font-semibold ${isSelected ? "text-amber-300" : "text-slate-400"}`}>
                  {cfg.gridRows}×{cfg.gridColumns} grid · {cfg.rewardXp} XP
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Details & Specs */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Lưới {currentConfig.gridRows}×{currentConfig.gridColumns} ({currentConfig.roundCount} Vòng)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RotateCw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{currentConfig.orientationEnabled ? "Có xoay hướng" : "Không xoay hướng"}</span>
        </div>
      </div>

      {/* Mastery Progress Card */}
      <MinigameMasteryProgress gameState={gameState} gameId="formation_assembly" />

      {/* Primary Start Action */}
      <button
        type="button"
        onClick={() => {
          soundManager.playClick();
          onStartGame();
        }}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>BẮT ĐẦU HUẤN LUYỆN ({currentConfig.label})</span>
      </button>
    </div>
  );
};
