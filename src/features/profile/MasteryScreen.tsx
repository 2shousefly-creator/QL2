import { CoreScene } from "../../components/core-visual/CoreScene";
import "../../styles/core-records.css";
import React from "react";
import { Target, Activity, BrainCircuit, Grid3X3, Eye, Swords, ChevronLeft, Award, Crown, CheckCircle2, Flame } from "lucide-react";
import { GameState, TrainingGameId, MinigameMasteryState } from "../../game/types";
import { MASTERY_CONFIGS, getMasteryTitleForMinigame } from "../../game/mastery/masteryConfig";
import { soundManager } from "../../game/audio";
import { CommandHeader } from "../../components/military/MilitaryUI";

type MasteryScreenProps = {
  state: GameState;
  onBack?: () => void;
};

const MINIGAME_ICONS: Record<TrainingGameId, React.ComponentType<{ className?: string }>> = {
  march_rhythm: Activity,
  signal_command: BrainCircuit,
  formation_assembly: Grid3X3,
  radar_tracking: Eye,
  gomoku_infinite: Swords,
  shooting_range: Target,
};

export const MasteryScreen: React.FC<MasteryScreenProps> = ({ state, onBack }) => {
  const mastery = state.mastery || {};

  // Count minigames that reached Level 5
  const masterVCount = (Object.values(mastery) as (MinigameMasteryState | undefined)[]).filter(
    (m): m is MinigameMasteryState => !!m && m.level >= 5
  ).length;

  const minigameList: TrainingGameId[] = [
    "march_rhythm",
    "signal_command",
    "formation_assembly",
    "radar_tracking",
    "gomoku_infinite",
    "shooting_range",
  ];

  return (
    <CoreScene variant="mastery" reducedMotion={state.settings.reducedMotion} className="command-screen mastery-command-screen w-full max-w-lg mx-auto p-4 select-none pb-28 space-y-4">
      {/* Header Banner */}
      <CommandHeader
        title="Tinh Thông"
        subtitle={`Đã tinh thông ${masterVCount} / 6 môn · Cấp tối đa Mastery V`}
        icon={<Crown />}
        action={onBack ? (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onBack();
              }}
              className="military-button military-button--icon theme-focus focus:outline-none"
              aria-label="Quay lại Hồ Sơ"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : undefined}
      />

      {/* Cards List for 6 Minigames */}
      <div className="space-y-3.5">
        {minigameList.map((gameId) => {
          const cfg = MASTERY_CONFIGS[gameId];
          const IconComp = MINIGAME_ICONS[gameId] || Target;
          const mState = mastery[gameId] || {
            level: 0,
            stageSuccessfulCount: 0,
            stageMediumOrHigherCount: 0,
            stageHardCount: 0,
            currentHardWinStreak: 0,
          };

          const level = mState.level || 0;
          const masteryTitle = getMasteryTitleForMinigame(gameId, level);
          const isMax = level >= 5;

          const targetStage = Math.min(5, level + 1);
          const stageCfg = cfg.stages[targetStage];

          return (
            <div
              key={gameId}
              className={`tactical-card mastery-qualification-card relative rounded-2xl border p-4 transition-all bg-gradient-to-br ${
                isMax
                  ? "from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/50 shadow-xl"
                  : level > 0
                  ? "from-slate-900/90 via-slate-900 to-slate-950 border-indigo-500/40 shadow-md"
                  : "from-slate-900/60 to-slate-950/80 border-slate-800/80"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-md ${
                    isMax
                      ? "bg-amber-500/20 text-amber-300 border-amber-400/60"
                      : level > 0
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/50"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  <IconComp className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-black text-sm sm:text-base text-slate-100 truncate">
                      {cfg.gameName}
                    </h3>
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        isMax
                          ? "bg-amber-500/20 text-amber-300 border-amber-400/50 animate-pulse"
                          : level > 0
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/40"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {masteryTitle}
                    </span>
                  </div>

                  {/* Requirements display for current stage */}
                  {isMax ? (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Đã đạt đỉnh cao tinh thông (Mastery V)!</span>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="text-[11px] font-extrabold text-slate-300 flex items-center justify-between">
                        <span>Mục tiêu: {stageCfg.stageName}</span>
                        <span className="text-amber-400 font-bold">{stageCfg.title}</span>
                      </div>

                      {/* 1. Successful Runs requirement */}
                      {stageCfg.targetSuccessfulCount > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                            <span>Lượt thắng</span>
                            <span className="text-slate-200">
                              {mState.stageSuccessfulCount || 0} / {stageCfg.targetSuccessfulCount}
                            </span>
                          </div>
                          <div className="continuous-progress-track w-full h-1.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                            <div
                              className="continuous-progress-fill h-full bg-indigo-500 rounded-full transition-[width] duration-300 ease-out"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.floor(((mState.stageSuccessfulCount || 0) / stageCfg.targetSuccessfulCount) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* 2. Medium or Higher requirement */}
                      {stageCfg.targetMediumOrHigherCount > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                            <span>Thắng mức Vừa hoặc cao hơn</span>
                            <span className="text-slate-200">
                              {mState.stageMediumOrHigherCount || 0} / {stageCfg.targetMediumOrHigherCount}
                            </span>
                          </div>
                          <div className="continuous-progress-track w-full h-1.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                            <div
                              className="continuous-progress-fill h-full bg-cyan-500 rounded-full transition-[width] duration-300 ease-out"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.floor(((mState.stageMediumOrHigherCount || 0) / stageCfg.targetMediumOrHigherCount) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* 3. Hard requirement */}
                      {stageCfg.targetHardCount > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                            <span>Thắng mức Khó</span>
                            <span className="text-slate-200">
                              {mState.stageHardCount || 0} / {stageCfg.targetHardCount}
                            </span>
                          </div>
                          <div className="continuous-progress-track w-full h-1.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                            <div
                              className="continuous-progress-fill h-full bg-rose-500 rounded-full transition-[width] duration-300 ease-out"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.floor(((mState.stageHardCount || 0) / stageCfg.targetHardCount) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* 4. Hard streak requirement for Stage 5 */}
                      {stageCfg.targetHardWinStreak > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-amber-400 font-bold">
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                              Chuỗi thắng Khó liên tiếp
                            </span>
                            <span>
                              {mState.hasAchieved20HardStreakInStage5
                                ? "20 / 20 (Đã xong)"
                                : `${mState.currentHardWinStreak || 0} / ${stageCfg.targetHardWinStreak}`}
                            </span>
                          </div>
                          <div className="continuous-progress-track w-full h-1.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                            <div
                              className="continuous-progress-fill h-full bg-amber-400 rounded-full transition-[width] duration-300 ease-out"
                              style={{
                                width: `${Math.min(
                                  100,
                                  mState.hasAchieved20HardStreakInStage5
                                    ? 100
                                    : Math.floor(((mState.currentHardWinStreak || 0) / stageCfg.targetHardWinStreak) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CoreScene>
  );
};
