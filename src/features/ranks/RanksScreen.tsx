import React, { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Lock, Award } from "lucide-react";
import { RANK_FAMILIES } from "../../game/rankFamilies";
import { RANK_STEPS } from "../../game/rankBuilder";
import { RankBadge } from "../../components/RankBadge";
import { RankTierProgress } from "../../components/RankTierProgress";
import { RankDetailSheet } from "../../components/RankDetailSheet";
import { soundManager } from "../../game/audio";
import { GameState, RankStep } from "../../game/types";

type RanksScreenProps = {
  state: GameState;
  onDetailSheetToggle?: (isOpen: boolean) => void;
};

export const RanksScreen: React.FC<RanksScreenProps> = ({ state, onDetailSheetToggle }) => {
  const currentRankIndex = state.progression.currentRankIndex;
  const currentStep = RANK_STEPS[currentRankIndex];

  // Accordion open states (default open current family)
  const [openFamilyId, setOpenFamilyId] = useState<string>(currentStep.familyId);
  const [selectedStep, setSelectedStep] = useState<RankStep | null>(null);

  const toggleFamily = (id: string) => {
    soundManager.playClick();
    setOpenFamilyId((prev) => (prev === id ? "" : id));
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 select-none pb-24 space-y-4">
      {/* Header Progress Banner */}
      <div className="theme-card-accent bg-slate-900 border p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div>
          <h2 className="font-bold text-slate-100 text-base">Hệ Thống Cấp Bậc</h2>
          <p className="text-xs text-slate-400">{RANK_FAMILIES.length} Nhóm Quân Hàm · {RANK_STEPS.length} Cấp Bậc</p>
        </div>
        <div className="theme-badge flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-bold text-xs">
          <Award className="w-4 h-4" />
          <span>{currentRankIndex + 1} / {RANK_STEPS.length} Cấp</span>
        </div>
      </div>

      {/* Accordion Grouped by RankFamilies */}
      <div className="space-y-3">
        {RANK_FAMILIES.map((family) => {
          const familySteps = RANK_STEPS.filter((s) => s.familyId === family.id);
          const isOpen = openFamilyId === family.id;
          const containsCurrent = familySteps.some((s) => s.rankIndex === currentRankIndex);
          const isFullyAchieved = familySteps.every((s) => s.rankIndex < currentRankIndex);

          return (
            <div
              key={family.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                containsCurrent
                  ? "theme-selected-card bg-slate-900/90"
                  : "bg-slate-900/60 border-slate-800/80"
              }`}
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleFamily(family.id)}
                className="theme-focus w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors focus:outline-none"
              >
                <div className="flex items-center gap-3.5">
                  <RankBadge badge={family.badge} size={56} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                        {family.name}
                      </h3>
                      {containsCurrent && (
                        <span className="theme-badge text-[10px] font-bold px-2 py-0.5 rounded-full border">
                          Đang ở nhóm này
                        </span>
                      )}
                      {isFullyAchieved && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {family.tierCount === 1 ? "Cấp đơn" : `${family.tierCount} bậc nhỏ`}
                    </p>
                  </div>
                </div>

                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {/* Accordion Steps List */}
              {isOpen && (
                <div className="border-t border-slate-800/80 divide-y divide-slate-800/50 bg-slate-950/40">
                  {familySteps.map((step) => {
                    const isAchieved = step.rankIndex < currentRankIndex;
                    const isCurrent = step.rankIndex === currentRankIndex;
                    const isNext = step.rankIndex === currentRankIndex + 1;

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedStep(step);
                        }}
                        className={`theme-focus w-full p-3 px-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors text-left focus:outline-none ${
                          isCurrent ? "theme-selected-row" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isAchieved ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : isCurrent ? (
                            <div className="theme-current-rank-dot w-5 h-5 rounded-full shrink-0 flex items-center justify-center font-bold text-xs">
                              ★
                            </div>
                          ) : (
                            <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                          )}

                          {/* Mini Badge for Sub-rank with Tier Progress directly underneath */}
                          <div className="flex flex-col items-center shrink-0">
                            <RankBadge
                              badge={family.badge}
                              size={38}
                              isCurrent={isCurrent}
                              isLocked={!isAchieved && !isCurrent}
                            />
                            {step.tierCount > 1 && step.tier !== null && (
                              <div className="mt-0.5">
                                <RankTierProgress
                                  currentTier={step.tier}
                                  tierCount={step.tierCount}
                                  badgeSize={38}
                                  size="list"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center">
                            <span
                              className={`font-semibold text-sm ${
                                isCurrent
                                  ? "theme-text-accent font-bold"
                                  : isAchieved
                                  ? "text-slate-200"
                                  : "text-slate-400"
                              }`}
                            >
                              {step.displayName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isNext && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              Tiếp theo
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-mono">
                            Cấp {step.ordinal}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Bottom Sheet */}
      {selectedStep && (
        <RankDetailSheet
          rankStep={selectedStep}
          currentRankIndex={currentRankIndex}
          onClose={() => setSelectedStep(null)}
          onOpenChange={onDetailSheetToggle}
        />
      )}
    </div>
  );
};
