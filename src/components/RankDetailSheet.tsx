import React, { useEffect } from "react";
import { X, CheckCircle, Lock, BookOpen } from "lucide-react";
import { RankPresentation } from "./RankPresentation";
import { getRankStepStory } from "../game/rankStories";
import { RANK_FAMILIES } from "../game/rankFamilies";
import { getRequiredXpForTransition } from "../game/xpEngine";
import { RANK_STEPS } from "../game/rankBuilder";
import { soundManager } from "../game/audio";
import { RankStep } from "../game/types";

const CATEGORY_NAMES: Record<string, string> = {
  academy: "Khối Đào Tạo & Nhập Ngũ",
  enlisted: "Khối Binh Sĩ",
  nco: "Khối Hạ Sĩ Quan",
  junior_officer: "Khối Sĩ Quan Cấp Úy",
  field_officer: "Khối Sĩ Quan Cấp Tá",
  general: "Khối Tướng Lĩnh",
  endgame: "Khối Chỉ Huy Tối Cao",
};

type RankDetailSheetProps = {
  rankStep?: RankStep;
  rankIndex?: number;
  currentRankIndex: number;
  onClose: () => void;
  onOpenChange?: (isOpen: boolean) => void;
};

export const RankDetailSheet: React.FC<RankDetailSheetProps> = ({
  rankStep,
  rankIndex,
  currentRankIndex,
  onClose,
  onOpenChange,
}) => {
  const step =
    rankStep ||
    (rankIndex !== undefined ? RANK_STEPS[rankIndex] : undefined) ||
    RANK_STEPS[currentRankIndex] ||
    RANK_STEPS[0];

  useEffect(() => {
    onOpenChange?.(true);
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
      onOpenChange?.(false);
    };
  }, [onOpenChange]);

  const isAchieved = step.rankIndex < currentRankIndex;
  const isCurrent = step.rankIndex === currentRankIndex;
  const isLocked = step.rankIndex > currentRankIndex;

  const family = RANK_FAMILIES.find((f) => f.id === step.familyId);
  const categoryName = family ? (CATEGORY_NAMES[family.category] || "Khối Binh Nghiệp") : "Khối Binh Nghiệp";
  const story = getRankStepStory(step.rankIndex);
  const requiredXp = getRequiredXpForTransition(step.rankIndex);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fadeIn overscroll-none touch-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundManager.playClick();
          onClose();
        }
      }}
    >
      <div className="military-sheet theme-card-accent w-full max-w-lg bg-slate-900 border-t sm:border rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[85vh] sm:max-h-[85vh] overflow-hidden">
        {/* Header & Close */}
        <div className="theme-divider shrink-0 flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            {isAchieved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle className="w-3.5 h-3.5" /> Đã đạt
              </span>
            )}
            {isCurrent && (
              <span className="theme-badge inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border animate-pulse">
                Hiện tại
              </span>
            )}
            {isLocked && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                <Lock className="w-3.5 h-3.5" /> Khóa
              </span>
            )}
            <span className="text-xs text-sky-400 font-medium px-2 py-0.5 rounded-full bg-sky-950/50 border border-sky-800/60">
              {categoryName}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="theme-focus p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white transition-colors cursor-pointer focus:outline-none"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Presentation with tier progress bar */}
        <div className="shrink-0 my-3 flex flex-col items-center">
          <RankPresentation
            rankStep={step}
            badgeSize={96}
            isCurrent={isCurrent}
            isLocked={false}
            showProgress={true}
            showTierLabel={false}
            customName={step.displayName}
          />
        </div>

        {/* XP Requirement for next rank if current */}
        {isCurrent && requiredXp > 0 && (
          <div className="shrink-0 p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-center text-xs text-slate-300 mb-2">
            Yêu cầu để thăng cấp tiếp theo: <span className="theme-text-accent font-bold">{requiredXp.toLocaleString("vi-VN")} XP</span>
          </div>
        )}

        {/* Story Section */}
        <div className="flex-1 min-h-0 flex flex-col my-1 overflow-hidden">
          <h4 className="theme-text-accent shrink-0 font-bold text-sm flex items-center gap-2 mb-2 px-1">
            <BookOpen className="theme-icon-accent w-4 h-4" />
            <span>Câu Chuyện Cấp Bậc</span>
          </h4>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-3.5 sm:p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-3">
            {story ? (
              <>
                {/* Story Title & Subtitle */}
                <div className="theme-story-accent border-l-4 p-3 rounded-r-xl">
                  <h5 className="theme-text-accent font-bold text-sm sm:text-base leading-snug">
                    {story.title}
                  </h5>
                  {story.subtitle && (
                    <p className="text-xs text-slate-400 mt-1 italic">
                      {story.subtitle}
                    </p>
                  )}
                </div>

                {/* Story Paragraphs */}
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {story.paragraphs.map((para, idx) => (
                    <p
                      key={idx}
                      className="text-justify indent-4 leading-relaxed text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/60"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">
                Chưa có dữ liệu câu chuyện cho cấp bậc này.
              </div>
            )}
          </div>
        </div>

        {/* Fictional Disclaimer */}
        <p className="shrink-0 text-[11px] text-slate-400 italic text-center mt-2 pt-2 border-t border-slate-800">
          Đây là trò chơi mô phỏng hư cấu, không đại diện và không có liên hệ chính thức với bất kỳ cơ quan hoặc tổ chức quân sự nào.
        </p>
      </div>
    </div>
  );
};
