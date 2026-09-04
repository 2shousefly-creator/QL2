import React, { useEffect } from "react";
import { Award, BookOpen, CheckCircle2 } from "lucide-react";
import { RankPresentation } from "./RankPresentation";
import { PROMOTION_TRANSITION_STORIES } from "../game/promotionStories";
import { RANK_STEP_STORIES } from "../game/rankStories";
import { soundManager } from "../game/audio";
import { RankStep } from "../game/types";
import { RANK_FAMILIES } from "../game/rankFamilies";
import { RANK_STEPS } from "../game/rankBuilder";
import { getPromotionRewards } from "../game/promotionRewards";
import { getRankRole, isRolePromotion } from "../game/rankRoles";

type PromotionCeremonyProps = {
  promotedRank: RankStep;
  previousRank: RankStep;
  promotionKind: "minor" | "major";
  onDismiss: () => void;
};

export const PromotionCeremony: React.FC<PromotionCeremonyProps> = ({
  promotedRank,
  previousRank,
  promotionKind,
  onDismiss,
}) => {
  useEffect(() => {
    soundManager.playPromotionFanfare();
    soundManager.triggerHaptic("heavy");
  }, []);

  const transitionKey = `${previousRank.familyId}->${promotedRank.familyId}`;
  const transitionStory = PROMOTION_TRANSITION_STORIES[transitionKey];
  const rankStory = RANK_STEP_STORIES[promotedRank.rankIndex];

  const currentFamily = RANK_FAMILIES.find((f) => f.id === promotedRank.familyId);
  const rewards = getPromotionRewards(promotedRank);

  const previousRole = getRankRole(previousRank.rankIndex);
  const promotedRole = getRankRole(promotedRank.rankIndex);
  const rolePromoted = isRolePromotion(previousRank.rankIndex, promotedRank.rankIndex);

  const isPrimaryChanged = previousRole.primaryTitle !== promotedRole.primaryTitle;
  const prevSec = previousRole.secondaryTitle?.trim() || null;
  const promotedSec = promotedRole.secondaryTitle?.trim() || null;
  const isSecondaryChanged = prevSec !== promotedSec;

  return (
    <div className="command-screen promotion-ceremony-screen fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg text-slate-100 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto select-none animate-fadeIn">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.15)_0%,transparent_70%)]" />

      {/* Header Badge */}
      <div className="w-full max-w-xl mx-auto text-center mt-2 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs sm:text-sm font-bold tracking-widest uppercase mb-3 shadow-lg">
          <Award className="w-4 h-4" />
          <span>
            {promotionKind === "major" ? "Lễ Thăng Quân Hàm" : "Thăng Bậc Thành Công"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-wide">
          {promotedRank.displayName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {currentFamily?.name} · Cấp {promotedRank.ordinal}/{RANK_STEPS.length}
        </p>
      </div>

      {/* Hero Badge Presentation */}
      <div className="w-full max-w-xl mx-auto my-6 flex flex-col items-center justify-center z-10">
        <RankPresentation
          rankStep={promotedRank}
          badgeSize={140}
          animateNewTier={true}
          showName={false}
        />
      </div>

      {/* Role Promotion Card (Only shown if there is a role change/promotion) */}
      {rolePromoted && (
        <div className="command-panel w-full max-w-xl mx-auto bg-gradient-to-b from-amber-500/15 via-slate-900/90 to-slate-900/90 border border-amber-500/40 p-4 sm:p-5 rounded-2xl my-2 shadow-2xl z-10 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Bổ Nhiệm Chức Danh Mới</span>
          </div>

          {/* Chức Danh Chính (Được đóng khung, giữ nguyên chữ đậm, kích thước to rõ ràng) */}
          <div className="pt-1 flex flex-col items-center justify-center gap-2">
            <div className="inline-flex items-center justify-center gap-2 sm:gap-3 flex-wrap px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-400/40 shadow-inner">
              {isPrimaryChanged ? (
                <>
                  <span className="text-slate-400 line-through text-xs sm:text-sm font-medium">
                    {previousRole.primaryTitle}
                  </span>
                  <span className="text-amber-400 font-bold text-sm">➔</span>
                  <span className="text-amber-300 font-black text-base sm:text-lg tracking-wide drop-shadow">
                    {promotedRole.primaryTitle}
                  </span>
                </>
              ) : (
                <span className="text-amber-300 font-black text-base sm:text-lg tracking-wide drop-shadow">
                  {promotedRole.primaryTitle}
                </span>
              )}
            </div>

            {/* Chức Danh Phụ (Luôn nằm dưới chức danh chính, KHÔNG còn đóng khung, có hiệu ứng gạch ngang nếu thay đổi) */}
            {(promotedSec || prevSec) && (
              <div className="text-xs sm:text-sm font-medium tracking-normal text-amber-200/90 flex items-center justify-center gap-2 flex-wrap">
                {isSecondaryChanged ? (
                  prevSec && promotedSec ? (
                    <>
                      <span className="text-slate-400 line-through">
                        {prevSec}
                      </span>
                      <span className="text-amber-400/80 font-bold">➔</span>
                      <span className="text-amber-200 font-semibold">
                        {promotedSec}
                      </span>
                    </>
                  ) : promotedSec ? (
                    <span className="text-amber-200 font-semibold">
                      {promotedSec}
                    </span>
                  ) : (
                    <span className="text-slate-400 line-through">
                      {prevSec}
                    </span>
                  )
                ) : (
                  <span>{promotedSec}</span>
                )}
              </div>
            )}
          </div>

          {promotedRole.unitDisplayName && (
            <div className="text-xs font-semibold text-sky-300">
              Đơn vị: <span className="text-sky-200">{promotedRole.unitDisplayName}</span>
            </div>
          )}

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-justify">
            {promotedRole.shortDescription}
          </p>
        </div>
      )}

      {/* Rewards Section */}
      {rewards.length > 0 && (
        <div className="command-panel w-full max-w-xl mx-auto bg-slate-900/90 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl my-2 shadow-2xl z-10 text-center">
          <h3 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
            ✨ PHẦN THƯỞNG TĂNG GIA QUÂN NGŨ ✨
          </h3>
          <div className="flex flex-col items-center gap-2">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-slate-100 bg-slate-950/80 px-4 py-1.5 rounded-full border border-slate-800"
              >
                <span>{reward.icon}</span>
                <span>{reward.name}</span>
                <span className="text-emerald-400 font-black">x{reward.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stories Section */}
      <div className="command-panel w-full max-w-xl mx-auto bg-slate-900/90 border border-amber-500/30 p-4 sm:p-5 rounded-2xl my-2 shadow-2xl z-10 space-y-4">
        {/* Major Transition Story if available */}
        {promotionKind === "major" && transitionStory && (
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-sm sm:text-base font-bold text-amber-400 flex items-center gap-2 mb-2">
              <Award className="w-4 h-4" />
              {transitionStory.title}
            </h3>
            {transitionStory.paragraphs.map((para, i) => (
              <p key={i} className="text-xs sm:text-sm text-slate-300 leading-relaxed my-1.5">
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Current Rank Step Story */}
        {rankStory && (
          <div>
            <h3 className="text-sm sm:text-base font-bold text-sky-400 flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4" />
              {rankStory.title}
            </h3>
            {rankStory.paragraphs.map((para, i) => (
              <p key={i} className="text-xs sm:text-sm text-slate-300 leading-relaxed my-1.5">
                {para}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="w-full max-w-xl mx-auto text-center my-4 z-10">
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onDismiss();
          }}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Tiếp Tục Hành Trình</span>
        </button>
      </div>
    </div>
  );
};
