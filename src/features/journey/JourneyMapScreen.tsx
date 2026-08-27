import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Compass, Info, Lock, MapPin, Zap } from "lucide-react";
import { GameState, RankFamily } from "../../game/types";
import { buildJourneyMapViewModel } from "../../game/journeySelectors";
import { RankBadge } from "../../components/RankBadge";
import { RankTierProgress } from "../../components/RankTierProgress";
import { JourneyDutySheet } from "../../components/JourneyDutySheet";
import { soundManager } from "../../game/audio";

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
          behavior: "smooth",
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
    <div className="w-full max-w-lg mx-auto pb-24 px-4 pt-4 text-slate-100 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-amber-400 leading-tight">
              Bản Đồ Hành Trình
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Vị trí hiện tại: <span className="text-slate-200 font-semibold">{vm.currentRankName}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            setShowEtaInfoModal(true);
          }}
          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 transition-colors"
          title="Giải thích cách tính ETA"
        >
          <Info className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Tính ETA</span>
        </button>
      </div>

      {/* Chapters Vertical Roadmap */}
      <div className="relative space-y-6">
        {/* Connecting Vertical Spine Line */}
        <div className="absolute left-6 sm:left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-amber-500/80 via-sky-500/50 to-slate-800 -z-0" />

        {vm.chapters.map((chapter) => {
          const isCurrent = chapter.status === "current";
          const isCompleted = chapter.status === "completed";

          return (
            <div
              key={chapter.id}
              ref={isCurrent ? currentChapterRef : null}
              className={`relative pl-12 sm:pl-16 transition-all duration-200 ${
                isCurrent ? "scale-[1.01]" : ""
              }`}
            >
              {/* Chapter Node Marker on Spine - Centered on track line and vertically centered relative to card frame */}
              <div
                className={`absolute left-6 sm:left-8 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center font-bold shadow-lg border transition-all z-10 ${
                  isCurrent
                    ? "w-8 h-8 bg-amber-500 text-slate-950 border-amber-300 ring-4 ring-amber-500/30 shadow-amber-500/20 scale-110"
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
                className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                  isCurrent
                    ? "bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-amber-500/50 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/20"
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
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        <MapPin className="w-3 h-3" /> Vị trí hiện tại
                      </span>
                    )}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Đã hoàn thành
                      </span>
                    )}
                    {!isCurrent && !isCompleted && (
                      <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/60">
                        Sắp tới
                      </span>
                    )}
                  </div>
                </div>

                {/* Chapter Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">Tiến độ chương:</span>
                    <span className="font-bold text-amber-400">{chapter.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? "bg-emerald-400"
                          : "bg-gradient-to-r from-amber-500 to-yellow-400"
                      }`}
                      style={{ width: `${chapter.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Milestone Info for Current Chapter */}
                {isCurrent && chapter.milestoneStatusLabel && (
                  <div className="mb-4 p-3 bg-slate-950/90 border border-amber-500/30 rounded-xl text-xs flex items-start gap-2.5 shadow-inner">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed font-medium text-slate-100">
                      {chapter.nextFamilyName ? (
                        <>
                          <span>Quân hàm tiếp theo: </span>
                          <strong className="text-amber-400 font-bold">{chapter.nextFamilyName}</strong>
                          {chapter.tierLabel && <span> · {chapter.tierLabel}</span>}
                          {chapter.etaLabel && (
                            <>
                              <span> · Dự kiến khoảng </span>
                              <span className="text-amber-300 font-bold">{chapter.etaLabel}</span>
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
                        type="button"
                        onClick={() => handleSelectFamilyNode(node.family)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center relative group ${
                          node.isCurrent
                            ? "bg-amber-500/10 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30 scale-102"
                            : node.isCompleted
                            ? "bg-slate-900/90 border-slate-700/80 hover:border-slate-500 opacity-90"
                            : "bg-slate-950/80 border-slate-800/60 opacity-60 hover:opacity-80"
                        }`}
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Cơ Chế Dự Kiến Thời Gian (ETA)
              </h3>
              <button
                type="button"
                onClick={() => setShowEtaInfoModal(false)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
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
            </div>

            <button
              type="button"
              onClick={() => setShowEtaInfoModal(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
