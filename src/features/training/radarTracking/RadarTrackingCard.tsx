import React from "react";
import { Eye, HelpCircle, Play } from "lucide-react";
import { GameState, TrainingDifficulty } from "../../../game/types";
import { soundManager } from "../../../game/audio";
import { MinigameMasteryProgress } from "../MinigameMasteryProgress";

type Props = {
  gameState: GameState;
  selectedDifficulty: TrainingDifficulty;
  onSelectDifficulty: (diff: TrainingDifficulty) => void;
  onStartGame: () => void;
  onOpenTutorial: () => void;
};

export const RadarTrackingCard: React.FC<Props> = ({
  gameState,
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
  onOpenTutorial,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-5 shadow-xl flex flex-col gap-5 text-slate-100 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base leading-snug text-slate-100 flex items-center gap-2">
              Mắt Thần Radar
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                Thị Giác & Tập Trung
              </span>
            </h3>
            <p className="text-xs text-slate-400">Theo dõi nhiều tín hiệu di chuyển cùng lúc</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onOpenTutorial();
          }}
          className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 hover:text-emerald-300 rounded-xl border border-emerald-500/20 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm"
          title="Hướng dẫn chơi Mắt Thần Radar"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Hướng Dẫn</span>
        </button>
      </div>

      {/* Difficulty Tabs */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold text-slate-300">Chọn Độ Khó</div>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "easy", label: "Dễ", color: "emerald", desc: "2 Mục tiêu / 5 Vòng" },
              { id: "medium", label: "Vừa", color: "cyan", desc: "3 Mục tiêu / 6 Vòng" },
              { id: "hard", label: "Khó", color: "amber", desc: "4-5 Mục tiêu / 7 Vòng + Nhiễu" },
            ] as const
          ).map((diff) => {
            const isSelected = selectedDifficulty === diff.id;
            return (
              <button
                key={diff.id}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onSelectDifficulty(diff.id);
                }}
                className={`py-2.5 px-2 rounded-2xl border transition-all flex flex-col items-center gap-0.5 text-center ${
                  isSelected
                    ? "bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-300 font-extrabold shadow-lg"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-xs font-black">{diff.label}</span>
                <span className="text-[9px] text-slate-400 font-normal">{diff.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mastery Progress Card */}
      <MinigameMasteryProgress gameState={gameState} gameId="radar_tracking" />

      {/* Start Button */}
      <button
        type="button"
        onClick={() => {
          soundManager.playClick();
          onStartGame();
        }}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-500/20 border border-emerald-400/30 transition-all flex items-center justify-center gap-2.5 group"
      >
        <Play className="w-4 h-4 fill-white transition-transform group-hover:scale-110" />
        <span>Bắt Đầu Thử Thách</span>
      </button>
    </div>
  );
};
