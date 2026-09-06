import React, { useEffect } from "react";
import { X, CheckCircle, Lock, BookOpen } from "lucide-react";
import { RankPresentation } from "./RankPresentation";
import { getRankStepStory } from "../game/rankStories";
import { RANK_FAMILIES } from "../game/rankFamilies";
import { getRequiredXpForTransition } from "../game/xpEngine";
import { RANK_STEPS } from "../game/rankBuilder";
import { soundManager } from "../game/audio";
import { RankStep } from "../game/types";
import { AppBottomSheet, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "./overlay/AppOverlay";

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
    return () => {
      onOpenChange?.(false);
    };
  }, [onOpenChange]);

  const requestClose = () => {
    soundManager.playClick();
    onClose();
  };

  const isAchieved = step.rankIndex < currentRankIndex;
  const isCurrent = step.rankIndex === currentRankIndex;
  const isLocked = step.rankIndex > currentRankIndex;

  const family = RANK_FAMILIES.find((f) => f.id === step.familyId);
  const categoryName = family ? (CATEGORY_NAMES[family.category] || "Khối Binh Nghiệp") : "Khối Binh Nghiệp";
  const story = getRankStepStory(step.rankIndex);
  const requiredXp = getRequiredXpForTransition(step.rankIndex);

  return (
    <AppBottomSheet archetype="info"
      onClose={requestClose}
      closeOnBackdrop
      ariaLabel={`Chi tiết cấp bậc ${step.displayName}`}
    >
        {/* Header & Close */}
        <OverlayHeader className="theme-divider flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAchieved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[var(--modal-success)] border border-emerald-500/30">
                <CheckCircle className="w-3.5 h-3.5" /> Đã đạt
              </span>
            )}
            {isCurrent && (
              <span className="theme-badge inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border">
                Hiện tại
              </span>
            )}
            {isLocked && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-[var(--modal-muted)] border border-slate-700">
                <Lock className="w-3.5 h-3.5" /> Khóa
              </span>
            )}
            <span className="text-xs text-[var(--modal-info)] font-medium px-2 py-0.5 rounded-full bg-sky-950/50 border border-sky-800/60">
              {categoryName}
            </span>
          </div>

          <ModalButton variant="icon"
            type="button"
            onClick={() => {
              requestClose();
            }}
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </ModalButton>
        </OverlayHeader>

        <OverlayBody>

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
          <div className="modal-section shrink-0 text-center text-xs text-[var(--modal-text)] mb-2">
            Yêu cầu để thăng cấp tiếp theo: <span className="theme-text-accent font-bold">{requiredXp.toLocaleString("vi-VN")} XP</span>
          </div>
        )}

        {/* Story Section */}
        <div className="flex flex-col my-1">
          <h4 className="theme-text-accent shrink-0 font-bold text-sm flex items-center gap-2 mb-2 px-1">
            <BookOpen className="theme-icon-accent w-4 h-4" />
            <span>Câu Chuyện Cấp Bậc</span>
          </h4>

          <div className="modal-section space-y-3">
            {story ? (
              <>
                {/* Story Title & Subtitle */}
                <div className="theme-story-accent border-l-4 p-3 rounded-r-xl">
                  <h5 className="theme-text-accent font-bold text-sm sm:text-base leading-snug">
                    {story.title}
                  </h5>
                  {story.subtitle && (
                    <p className="text-xs text-[var(--modal-muted)] mt-1 italic">
                      {story.subtitle}
                    </p>
                  )}
                </div>

                {/* Story Paragraphs */}
                <div className="space-y-2.5 text-xs sm:text-sm text-[var(--modal-text)] leading-relaxed">
                  {story.paragraphs.map((para, idx) => (
                    <p
                      key={idx}
                      className="modal-section text-justify indent-4 leading-relaxed text-[var(--modal-text)]"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-xs text-[var(--modal-muted)] text-center py-6">
                Chưa có dữ liệu câu chuyện cho cấp bậc này.
              </div>
            )}
          </div>
        </div>
        </OverlayBody>

        {/* Fictional Disclaimer */}
        <OverlayFooter className="text-xs text-[var(--modal-muted)] italic text-center mt-2">
          Đây là trò chơi mô phỏng hư cấu, không đại diện và không có liên hệ chính thức với bất kỳ cơ quan hoặc tổ chức quân sự nào.
        </OverlayFooter>
    </AppBottomSheet>
  );
};
