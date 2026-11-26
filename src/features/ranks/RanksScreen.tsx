import { ArchiveScene } from "../profile/pixi/ArchiveScene";
import "../../styles/core-records.css";
import React, { useState } from "react";
import { ChevronRight, Award } from "lucide-react";
import { RANK_FAMILIES } from "../../game/rankFamilies";
import { RANK_STEPS } from "../../game/rankBuilder";
import { RankBadge } from "../../components/RankBadge";
import { RankDetailSheet } from "../../components/RankDetailSheet";
import { soundManager } from "../../game/audio";
import { GameState, RankStep } from "../../game/types";
import { CommandHeader } from "../../components/military/MilitaryUI";

type RanksScreenProps = {
  state: GameState;
  onDetailSheetToggle?: (isOpen: boolean) => void;
};

export const RanksScreen: React.FC<RanksScreenProps> = ({ state, onDetailSheetToggle }) => {
  const currentRankIndex = state.progression.currentRankIndex;
  const [selectedStep, setSelectedStep] = useState<RankStep | null>(null);


  return (
    <ArchiveScene rankIndex={state.progression.currentRankIndex} variant="ranks" reducedMotion={state.settings.reducedMotion} className="command-screen rank-archive-screen w-full max-w-lg mx-auto p-4 select-none pb-24 space-y-4">
      {/* Header Progress Banner */}
      <CommandHeader
        title="Cấp Bậc"
        subtitle="Hồ sơ 24 quân hàm"
        icon={<Award />}
        action={(
          <span className="status-tag">
            {currentRankIndex + 1} / {RANK_STEPS.length}
          </span>
        )}
      />

      <div className="space-y-2">
        {RANK_STEPS.map(step => {
          const current = currentRankIndex === step.rankIndex;
          const achieved = step.rankIndex < currentRankIndex;
          return (
            <button key={step.id} type="button"
              data-rank-state={current ? "current" : achieved ? "completed" : "locked"}
              className="rank-archive-card tactical-card theme-focus flex w-full items-center gap-3 rounded-xl border p-3 text-left"
              onClick={() => { soundManager.playClick(); setSelectedStep(step); }}>
              <RankBadge badge={RANK_FAMILIES[step.rankIndex].badge} size={52} isCurrent={current} isLocked={!current && !achieved} />
              <span className="flex-1 font-bold">{step.displayName}</span>
              <span className="text-xs">{current ? "Hiện tại" : achieved ? "Đã đạt" : step.rankIndex === currentRankIndex + 1 ? "Kế tiếp" : "Chưa mở"}</span>
              <ChevronRight size={16} />
            </button>
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
    </ArchiveScene>
  );
};
