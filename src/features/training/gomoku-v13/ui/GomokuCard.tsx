import React from "react";
import { HelpCircle, Play } from "lucide-react";
import { GameState } from "../../../../game/types";
import { GomokuDifficulty, GomokuMark } from "../domain/gomokuTypes";
import { soundManager } from "../../../../game/audio";
import { MinigameMasteryProgress } from "../../MinigameMasteryProgress";
import { TRAINING_DIFFICULTIES } from "../../../../game/training/trainingConfig";

interface GomokuCardProps {
  gameState: GameState;
  selectedDifficulty: GomokuDifficulty;
  selectedMark: GomokuMark;
  onSelectDifficulty: (diff: GomokuDifficulty) => void;
  onSelectMark: (mark: GomokuMark) => void;
  onStartGame: () => void;
  onOpenTutorial: () => void;
}

export const GomokuCard: React.FC<GomokuCardProps> = ({
  gameState,
  selectedDifficulty,
  selectedMark,
  onSelectDifficulty,
  onSelectMark,
  onStartGame,
  onOpenTutorial,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
      {/* Title & Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg">
            #
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-1.5">
              Cờ Caro Vô Hạn
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                V13
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Thi đấu Cờ Caro trên bàn cờ vô hạn với máy
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onOpenTutorial();
          }}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          title="Hướng dẫn"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span>Chọn Độ Khó</span>
          <span className="text-[11px] text-amber-400 font-mono">
            {TRAINING_DIFFICULTIES[selectedDifficulty].rewardXp} XP
          </span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {(["easy", "medium", "hard"] as GomokuDifficulty[]).map((diff) => {
            const isSelected = selectedDifficulty === diff;
            const label = diff === "easy" ? "Dễ" : diff === "medium" ? "Vừa" : "Khó";
            const xp = `${TRAINING_DIFFICULTIES[diff].rewardXp} XP`;

            return (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onSelectDifficulty(diff);
                }}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-lg shadow-amber-500/10"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="text-xs">{label}</div>
                <div className="text-[10px] opacity-80">{xp}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side Selection (X / O) */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-300">Chọn Quân Cờ</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onSelectMark("X");
            }}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
              selectedMark === "X"
                ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-extrabold shadow-lg shadow-cyan-500/10"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <span className="text-base font-black">X</span>
            <span className="text-xs">Quân Cyan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onSelectMark("O");
            }}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
              selectedMark === "O"
                ? "bg-rose-500/20 border-rose-500/60 text-rose-300 font-extrabold shadow-lg shadow-rose-500/10"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <span className="text-base font-black">O</span>
            <span className="text-xs">Quân Đỏ</span>
          </button>
        </div>
      </div>

      {/* Mastery Progress Card */}
      <MinigameMasteryProgress gameState={gameState} gameId="gomoku_infinite" />

      {/* Start Button */}
      <button
        type="button"
        onClick={() => {
          soundManager.playClick();
          onStartGame();
        }}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.99] transition-all"
      >
        <Play className="w-4 h-4 fill-slate-950" />
        Vào Trận Ngay
      </button>
    </div>
  );
};
