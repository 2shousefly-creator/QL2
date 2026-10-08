import { CommandMenuProvider } from "../../components/core-visual/CommandMenuContext";
import { CoreVfx } from "../../components/core-visual/CoreVfx";
import React, { useState, useEffect, useRef } from "react";
import { Award, Sparkles, Compass } from "lucide-react";
import { RankPresentation } from "../../components/RankPresentation";
import { RankDetailSheet } from "../../components/RankDetailSheet";
import { HomeXpJourney } from "../../components/HomeXpJourney";
import { HomeJourneyBackdrop } from "../../components/HomeJourneyBackdrop";
import { RankActivityTicker } from "../../components/RankActivityTicker";
import { DisplayedMedalColumn } from "../../components/DisplayedMedal";
import { MedalInspectModal } from "../../components/MedalInspectModal";
import { getEtaDetailsToFullBar } from "../../game/xpEngine";
import { ensureEnergyState, getEnergyMultiplier, isEnergyActive } from "../../game/energyEngine";
import { getPlayerRank, getXpProgressDetails } from "../../game/selectors";
import { getJourneyChapterForRank } from "../../game/etaEngine";
import { getRankRole } from "../../game/rankRoles";
import { soundManager } from "../../game/audio";
import { GameState } from "../../game/types";
import { RANK_STEPS } from "../../game/rankBuilder";
import type { MedalDefinition } from "../../game/medals/medalCatalog";

type HomeScreenProps = {
  state: GameState;
  onStartChallenge: () => void;
  onDetailSheetToggle?: (isOpen: boolean) => void;
  onNavigateToJourney?: () => void;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  state,
  onStartChallenge,
  onDetailSheetToggle,
  onNavigateToJourney,
}) => {
  const [homeModal, setHomeModal] = useState<
    { type: "rank"; rankIndex: number } | { type: "medal"; medal: MedalDefinition } | null
  >(null);
  const selectedRankIndexForDetail = homeModal?.type === "rank" ? homeModal.rankIndex : null;
  const inspectingMedal = homeModal?.type === "medal" ? homeModal.medal : null;
  const setSelectedRankIndexForDetail = (rankIndex: number | null) =>
    setHomeModal(rankIndex === null ? null : { type: "rank", rankIndex });
  const setInspectingMedal = (medal: MedalDefinition | null) =>
    setHomeModal(medal === null ? null : { type: "medal", medal });
  const [nowMs, setNowMs] = useState(Date.now());
  const currentRank = getPlayerRank(state);
  const xpDetails = getXpProgressDetails(state);
  const roleInfo = getRankRole(currentRank.rankIndex);

  const currentChapter = getJourneyChapterForRank(currentRank.rankIndex);

  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [levelUpKey, setLevelUpKey] = useState(0);
  const prevRankIndexRef = useRef<number>(currentRank.rankIndex);

  // Update clock tick for real time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentRank.rankIndex > prevRankIndexRef.current) {
      setIsLevelingUp(true);
      setLevelUpKey((k) => k + 1);
      soundManager.playPromotionFanfare();
      soundManager.triggerHaptic("heavy");
      const timer = setTimeout(() => {
        setIsLevelingUp(false);
      }, 4000);
      prevRankIndexRef.current = currentRank.rankIndex;
      return () => clearTimeout(timer);
    }
    prevRankIndexRef.current = currentRank.rankIndex;
  }, [currentRank.rankIndex]);


  const selectedMedalIds = state.medals?.selectedMedalIds || [];
  const leftMedalIds = selectedMedalIds.slice(0, 3);
  const rightMedalIds = selectedMedalIds.slice(3, 6);
  const isOnline = state.time.currentEarningMode === "direct_online";
  const energyState = ensureEnergyState(state, nowMs);
  const etaDetails = getEtaDetailsToFullBar(state, nowMs);

  return (
    <CommandMenuProvider reducedMotion={state.settings.reducedMotion}>
    <div data-core-motion={state.settings.reducedMotion ? "reduced" : undefined} className="command-art-menu home-screen relative h-full min-h-0 w-full overflow-hidden touch-pan-y select-none">
      {/* Dynamic Chapter Backdrop */}
      <HomeJourneyBackdrop
        chapterId={currentChapter.id}
        reducedMotion={state.settings.reducedMotion}
      />

      <div className="home-scroll-viewport relative z-10 h-full min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y">
        <div className="home-content-shell mx-auto min-h-full w-full max-w-md">
        {/* Top Status & Chapter Tag Bar */}
        <div className="home-top-zone w-full shrink-0 flex items-center justify-end gap-2">
          {/* Chapter Badge Tag & Link */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onNavigateToJourney?.();
            }}
            className="status-tag theme-badge theme-focus flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all active:scale-[0.98] shadow-md focus:outline-none"
            title="Mở bản đồ hành trình"
          >
            <Compass className={`w-3.5 h-3.5 ${state.settings.reducedMotion ? "" : "animate-spin-slow"}`} />
            <span>{currentChapter.shortTitle}</span>
            <span className="text-[10px] opacity-75 hidden sm:inline">· Xem hành trình</span>
          </button>
        </div>

        {/* Main Central Container: Hero Badge & XP Group */}
        <div className="home-content-body">
          {/* Main Hero Badge Stack */}
          <div className="home-hero-zone relative w-full flex flex-col items-center justify-center">
            {/* Background Ambient Radial Glow Rays when leveling up */}
            {isLevelingUp && (
              <CoreVfx key={levelUpKey} type="spark" intensity="medium" reducedMotion={state.settings.reducedMotion} />
            )}

            {/* Level Up Banner Tag */}
            {isLevelingUp && (
              <div className="status-tag z-20 mb-1 px-4 py-1 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider animate-level-up-banner flex items-center gap-1.5 border border-amber-200">
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Thăng Cấp Thành Công!</span>
              </div>
            )}

            <div
              key={levelUpKey}
              role="button"
              tabIndex={0}
              onClick={() => {
                soundManager.playClick();
                setSelectedRankIndexForDetail(currentRank.rankIndex);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  soundManager.playClick();
                  setSelectedRankIndexForDetail(currentRank.rankIndex);
                }
              }}
              className={`home-rank-hero theme-focus w-full flex flex-col items-center justify-center cursor-pointer group hover:scale-[1.01] active:scale-[0.98] transition-all focus:outline-none rounded-3xl relative z-10 ${
                isLevelingUp ? "animate-level-up-pop" : ""
              }`}
              aria-label="Xem chi tiết và mô tả cấp bậc"
            >
              <CoreVfx type="shine" reducedMotion={state.settings.reducedMotion} className="home-hero-shine" />
              <RankPresentation
                rankStep={currentRank}
                badgeSize={224}
                className="home-rank-presentation"
                isCurrent={true}
                showTierLabel={false}
                showName={true}
                animateNewTier={isLevelingUp}
                leftMedalsNode={leftMedalIds.length > 0 ? (
                  <DisplayedMedalColumn
                    medalIds={leftMedalIds}
                    onSelectMedal={setInspectingMedal}
                  />
                ) : null}
                rightMedalsNode={rightMedalIds.length > 0 ? (
                  <DisplayedMedalColumn
                    medalIds={rightMedalIds}
                    onSelectMedal={setInspectingMedal}
                  />
                ) : null}
              />
            </div>

            {/* Current Position / Role Block (Hidden when XP is full to give clear focus to Promotion CTA) */}
            {!xpDetails.isFull && (
              <div className="home-personnel-plate theme-card-accent w-full max-w-sm mx-auto mt-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/70 border backdrop-blur-xs text-center transition-all animate-fadeIn">
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="theme-badge inline-block px-3 py-1 rounded-xl border font-extrabold text-sm sm:text-base tracking-wide shadow-inner">
                    {roleInfo.primaryTitle}
                  </div>
                  {roleInfo.secondaryTitle && (
                    <div className="theme-text-accent text-xs font-semibold opacity-90 tracking-normal">
                      {roleInfo.secondaryTitle}
                    </div>
                  )}
                </div>
                {roleInfo.unitDisplayName && (
                  <div className="theme-text-accent text-[11px] font-medium mt-1 tracking-tight">
                    {roleInfo.unitDisplayName}
                  </div>
                )}
                <p className="text-[11px] text-slate-300/90 mt-1 leading-snug font-normal line-clamp-2">
                  {roleInfo.shortDescription}
                </p>
              </div>
            )}
          </div>

          {/* Home XP Journey (with comfortable breathing room below rank display) */}
          <div className="home-progression-zone w-full space-y-1">
            {(() => {
              const active = isEnergyActive(state, state.time.currentEarningMode);
              const currentMult = isOnline ? getEnergyMultiplier(energyState.percent, active) : 1;
              const hasEnergyBoost = currentMult > 1;

              return (
                <HomeXpJourney
                  state={state}
                  reducedMotion={state.settings.reducedMotion}
                  hasEnergyBoost={hasEnergyBoost}
                  onOpenRankDetail={(rankIdx) => setSelectedRankIndexForDetail(rankIdx)}
                />
              );
            })()}

            {/* ETA & Rate Details */}
            {(!xpDetails.isMaxRank || !xpDetails.isFull) && (() => {
              const active = isEnergyActive(state, state.time.currentEarningMode);
              const currentMult = isOnline ? getEnergyMultiplier(energyState.percent, active) : 1;
              const hasEnergyBoost = currentMult > 1;
              const currentRateText = `${Math.round(currentMult * 1)} XP/phút`;

              return (
                <div className="home-rate-readout flex flex-col items-center justify-center text-[11px] sm:text-xs text-slate-400 font-medium text-center space-y-0.5 pt-0.5">
                  <div className="flex items-center justify-center gap-1">
                    <span>⚡️</span>
                    <strong
                      className={
                        hasEnergyBoost
                          ? "text-amber-300 font-extrabold drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]"
                          : "text-slate-200 font-bold"
                      }
                    >
                      {currentRateText}
                    </strong>
                  </div>
                  {etaDetails.message ? (
                    <div className="text-slate-400 text-[10px] sm:text-[11px]">
                      {etaDetails.message}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-slate-400 flex-wrap">
                      <span>⏱️</span>
                      <span
                        className={
                          etaDetails.hasBoost
                            ? "line-through text-slate-500 font-medium"
                            : "text-slate-300 font-medium"
                        }
                      >
                        {etaDetails.delegationEta}
                      </span>
                      {etaDetails.hasBoost && etaDetails.onlineEta && (
                        <span className="text-amber-300 font-bold drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]">
                          {etaDetails.onlineEta}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Activity Ticker (Rank-specific work status) */}
            <RankActivityTicker
              rank={currentRank}
              reducedMotion={state.settings.reducedMotion}
            />
          </div>
        </div>

        <div className="home-action-zone w-full shrink-0">
          {/* Primary Action Section */}
          {xpDetails.isMaxRank ? (
            xpDetails.isFull ? (
              <div className="w-full pt-1">
                <div className="command-panel w-full py-4 px-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-center flex items-center justify-center gap-2 shadow-lg">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Đã Hoàn Tất Toàn Bộ Hành Trình</span>
                </div>
              </div>
            ) : null
          ) : xpDetails.isFull ? (
            <div className="w-full pt-1">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onStartChallenge();
                }}
                className="promotion-command-button theme-button-primary theme-focus w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
              >
                <Award className="w-5 h-5" />
                <span>Sát Hạch Thăng Cấp</span>
              </button>
            </div>
          ) : null}
        </div>
        </div>
      </div>

      <MedalInspectModal medal={inspectingMedal} onClose={() => setInspectingMedal(null)} />

      {/* Rank Detail Modal Sheet */}
      {selectedRankIndexForDetail !== null && (
        <RankDetailSheet
          rankStep={RANK_STEPS[selectedRankIndexForDetail] || currentRank}
          currentRankIndex={currentRank.rankIndex}
          onClose={() => setSelectedRankIndexForDetail(null)}
          onOpenChange={onDetailSheetToggle}
        />
      )}
    </div>
    </CommandMenuProvider>
  );
};
