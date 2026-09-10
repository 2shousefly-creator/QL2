import { CoreScene } from "../../components/core-visual/CoreScene";
import "../../styles/core-journey.css";
import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Compass, Info, Lock, MapPin, Zap } from "lucide-react";
import { GameState, RankFamily } from "../../game/types";
import { buildJourneyMapViewModel } from "../../game/journeySelectors";
import { RankBadge } from "../../components/RankBadge";
import { RankTierProgress } from "../../components/RankTierProgress";
import { JourneyDutySheet } from "../../components/JourneyDutySheet";
import { CommandHeader } from "../../components/military/MilitaryUI";
import { soundManager } from "../../game/audio";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../components/overlay/AppOverlay";

type JourneyMapScreenProps = {
  gameState: GameState;
  onOpenRankDetail?: (rankIndex: number) => void;
};

export const JourneyMapScreen: React.FC<JourneyMapScreenProps> = ({
  gameState,
}) => {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [selectedFamily, setSelectedFamily] = useState<RankFamily | null>(null);
  const [showEtaInfoModal, setShowEtaInfoModal] = useState(false);

  const currentChapterRef = useRef<HTMLDivElement | null>(null);
  const hasAutoScrolledRef = useRef(false);

  // Refresh nowMs periodically for live ETA
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 10_000);
    return () => clearInterval(interval);
  }, []);

  const vm = buildJourneyMapViewModel(gameState, nowMs);

  // Auto-scroll to current chapter on mount
  useEffect(() => {
    if (!hasAutoScrolledRef.current && currentChapterRef.current) {
      hasAutoScrolledRef.current = true;
      setTimeout(() => {
        currentChapterRef.current?.scrollIntoView({
          behavior: gameState.settings.reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "center",
        });
      }, 200);
    }
  }, [vm.currentChapterId]);

  const handleSelectFamilyNode = (family: RankFamily) => {
    soundManager.playClick();
    setSelectedFamily(family);
  };

  return (
    <CoreScene variant="journey" reducedMotion={gameState.settings.reducedMotion} className="command-screen journey-command-screen w-full max-w-lg mx-auto pb-24 px-4 pt-4 text-slate-100 animate-fadeIn">
      {/* Header Banner */}
      <CommandHeader
        className="mb-6"
        title="Bản Đồ Hành Trình"
        subtitle={<>Vị trí hiện tại: <strong className="text-slate-200">{vm.currentRankName}</strong></>}
        icon={<Compass />}
        action={(
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setShowEtaInfoModal(true);
            }}
            className="military-button military-button--icon theme-focus focus:outline-none"
            title="Giải thích cách tính ETA"
            aria-label="Giải thích cách tính ETA"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      />

      {/* Chapters Vertical Roadmap */}
      <div className="journey-route relative space-y-6">
        {/* Connecting Vertical Spine Line */}
        <div className="theme-journey-spine absolute left-6 sm:left-8 top-8 bottom-8 w-0.5 -z-0" />

        {vm.chapters.map((chapter) => {
          const isCurrent = chapter.status === "current";
          const isCompleted = chapter.status === "completed";

          return (
            <div
              key={chapter.id}
              ref={isCurrent ? currentChapterRef : null}
              data-sector-state={chapter.status}
              className={`journey-sector relative pl-12 sm:pl-16 transition-all duration-200 ${
                isCurrent ? "scale-[1.01]" : ""
              }`}
            >
              {/* Chapter Node Marker on Spine - Centered on track line and vertically centered relative to card frame */}
              <div
                className={`absolute left-6 sm:left-8 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center font-bold shadow-lg border transition-all z-10 ${
                  isCurrent
                    ? "theme-node-current w-8 h-8 scale-110"
                    : isCompleted
                    ? "w-7 h-7 bg-emerald-500 text-slate-950 border-emerald-400"
                    : "w-7 h-7 bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <MapPin className="w-4 h-4" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Chapter Card */}
              <div
                className={`journey-sector__panel tactical-card rounded-2xl p-4 sm:p-5 border transition-all ${
                  isCurrent
                    ? "theme-selected-card bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 shadow-2xl"
                    : isCompleted
                    ? "bg-slate-900/80 border-emerald-500/30 opacity-90"
                    : "bg-slate-950/60 border-slate-800/80 opacity-75"
                }`}
              >
                {/* Chapter Title & Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-100">
                        {chapter.title}
                      </h2>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {chapter.rankRangeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div>
                    {isCurrent && (
                      <span className={`status-tag theme-badge inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${gameState.settings.reducedMotion ? "" : "animate-pulse"}`}>
                        <MapPin className="w-3 h-3" /> Vị trí hiện tại
                      </span>
                    )}
                    {isCompleted && (
                      <span className="status-tag inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Đã hoàn thành
                      </span>
                    )}
                    {!isCurrent && !isCompleted && (
                      <span className="status-tag text-[11px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/60">
                        Sắp tới
                      </span>
                    )}
                  </div>
                </div>

                {/* Chapter Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">Tiến độ chương:</span>
                    <span className={isCompleted ? "font-bold text-emerald-400" : "theme-text-accent font-bold"}>{chapter.progressPercent}%</span>
                  </div>
                  <div
                    className="continuous-progress-track theme-progress-track w-full h-2 rounded-full overflow-hidden border p-0.5"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={chapter.progressPercent}
                    aria-label={`Tiến độ ${chapter.title}: ${chapter.progressPercent}%`}
                  >
                    <div
                      className={`continuous-progress-fill h-full rounded-full transition-[width] duration-300 ease-out ${
                        isCompleted
                          ? "bg-emerald-400"
                          : "theme-progress-fill"
                      }`}
                      style={{ width: `${chapter.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Milestone Info for Current Chapter */}
                {isCurrent && chapter.milestoneStatusLabel && (
                  <div className="theme-surface mb-4 p-3 bg-slate-950/90 border rounded-xl text-xs flex items-start gap-2.5 shadow-inner">
                    <Zap className="theme-icon-accent w-4 h-4 shrink-0 mt-0.5" />
                    <div className="leading-relaxed font-medium text-slate-100">
                      {chapter.nextFamilyName ? (
                        <>
                          <span>Quân hàm tiếp theo: </span>
                          <strong className="theme-text-accent font-bold">{chapter.nextFamilyName}</strong>
                          {chapter.tierLabel && <span> · {chapter.tierLabel}</span>}
                          {chapter.etaLabel && (
                            <>
                              <span> · Dự kiến khoảng </span>
                              <span className="theme-text-accent font-bold">{chapter.etaLabel}</span>
                            </>
                          )}
                        </>
                      ) : (
                        <span>{chapter.milestoneStatusLabel}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* RankFamily Nodes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {chapter.familyNodes.map((node) => {
                    return (
                      <button
                        key={node.family.id}
                        data-node-state={node.isCurrent ? "current" : node.isCompleted ? "completed" : "upcoming"}
                        type="button"
                        onClick={() => handleSelectFamilyNode(node.family)}
                        className={`journey-family-node tactical-card flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center relative group ${
                          node.isCurrent
                            ? "theme-selected-card shadow-lg scale-102"
                            : node.isCompleted
                            ? "bg-slate-900/90 border-slate-700/80 hover:border-slate-500 opacity-90"
                            : "bg-slate-950/80 border-slate-800/60 opacity-60 hover:opacity-80"
                        } theme-focus focus:outline-none`}
                      >
                        {/* Node Badge Icon */}
                        <div className="relative my-1">
                          <RankBadge
                            badge={node.family.badge}
                            size={56}
                            isLocked={node.isUpcoming}
                          />

                          {/* Completed checkmark overlay */}
                          {node.isCompleted && (
                            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow-md">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        {/* Tier Bar if Multi-tier */}
                        {node.family.tierCount > 1 && (
                          <div className="my-0.5 flex flex-col items-center">
                            <RankTierProgress
                              currentTier={node.currentTier}
                              tierCount={node.family.tierCount}
                              badge={node.family.badge}
                              badgeSize={56}
                              size="sm"
                            />
                          </div>
                        )}

                        {/* Name */}
                        <span className="text-xs font-semibold text-slate-200 line-clamp-1 mt-0.5">
                          {node.family.name}
                        </span>

                        {/* Tier indicator text */}
                        <span className="text-[10px] text-slate-400">
                          {node.family.tierCount > 1 ? `${node.family.tierCount} bậc` : "1 cột mốc"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Journey Rank Duty Sheet */}
      {selectedFamily !== null && (
        <JourneyDutySheet
          family={selectedFamily}
          gameState={gameState}
          onClose={() => setSelectedFamily(null)}
        />
      )}

      {/* ETA Info Explanation Modal */}
      {showEtaInfoModal && (
        <AppModal archetype="info"
          onClose={() => setShowEtaInfoModal(false)}
          closeOnBackdrop
          labelledBy="eta-info-title"
        >
            <OverlayHeader className="flex items-center justify-between">
              <h3 id="eta-info-title" className="modal-title flex items-center gap-2">
                <Info className="w-5 h-5" />
                Cơ Chế Dự Kiến Thời Gian (ETA)
              </h3>
              <ModalButton variant="icon"
                type="button"
                onClick={() => setShowEtaInfoModal(false)}
                aria-label="Đóng giải thích ETA"
              >
                ✕
              </ModalButton>
            </OverlayHeader>

            <OverlayBody className="text-xs sm:text-sm text-[var(--modal-text)] leading-relaxed">
              <p>
                • <strong>Tốc độ kiếm XP:</strong> Tính toán dựa trên tốc độ cơ bản (1,0 XP/phút) kết hợp với hệ số tăng tốc từ Năng Lượng (lên đến x4 XP) khi chơi trực tiếp.
              </p>
              <p>
                • <strong>Sẵn sàng thử thách:</strong> Giả định bạn sẽ bấm bắt đầu thử thách ngay khi thanh XP làm đầy 100%.
              </p>
              <p>
                • <strong>Thời gian thử thách:</strong> Bao gồm thời lượng danh nghĩa của các bài thử thách cần vượt qua (+2 phút thăng bậc, +3 phút thăng quân hàm).
              </p>
              <p>
                • <strong>Bong bóng may mắn:</strong> Mỗi lần chạm bong bóng trong thử thách rút ngắn thêm 1 giây, giúp bạn đạt mốc nhanh hơn thực tế.
              </p>
            </OverlayBody>

            <OverlayFooter>
              <ModalButton variant="ghost"
                type="button"
                onClick={() => setShowEtaInfoModal(false)}
                className="w-full"
              >
                Đã hiểu
              </ModalButton>
            </OverlayFooter>
        </AppModal>
      )}
    </CoreScene>
  );
};
