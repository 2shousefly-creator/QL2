import { ArchiveScene } from "../profile/pixi/ArchiveScene";
import "../../styles/core-records.css";
import React, { useState } from "react";
import { 
  ScrollText, 
  Filter, 
  Calendar, 
  Shield, 
  Award, 
  Crown, 
  Target, 
  Sprout, 
  X, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  BookOpen 
} from "lucide-react";
import { GameState, JournalCategory, JournalEvent, TabType } from "../../game/types";
import { soundManager } from "../../game/audio";
import { RankBadge } from "../../components/RankBadge";
import { RankTierProgress } from "../../components/RankTierProgress";
import { RANK_STEPS } from "../../game/rankBuilder";
import { RANK_FAMILIES } from "../../game/rankFamilies";
import { RANK_STEP_STORIES } from "../../game/rankStories";
import { CommandHeader } from "../../components/military/MilitaryUI";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../components/overlay/AppOverlay";

type JournalScreenProps = {
  state: GameState;
  onNavigateTab: (tab: TabType) => void;
};

type FilterType = "all" | JournalCategory;

const getCategoryDetails = (category: string | undefined, type: string | undefined) => {
  const cat = category || type || "system";
  switch (cat) {
    case "promotion":
    case "rank":
      return {
        label: "Thăng quân hàm",
        icon: Shield,
        colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        iconColor: "text-amber-400",
        bgColor: "from-amber-950/25 to-slate-900",
      };
    case "training":
      return {
        label: "Huấn luyện quân sự",
        icon: Target,
        colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/30",
        iconColor: "text-blue-400",
        bgColor: "from-blue-950/25 to-slate-900",
      };
    case "tang_gia":
    case "farm":
    case "agriculture":
      return {
        label: "Tăng gia sản xuất",
        icon: Sprout,
        colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        iconColor: "text-emerald-400",
        bgColor: "from-emerald-950/25 to-slate-900",
      };
    case "medal":
    case "achievement":
      return {
        label: "Huy chương & Chiến công",
        icon: Award,
        colorClass: "text-orange-400 bg-orange-500/10 border-orange-500/30",
        iconColor: "text-orange-400",
        bgColor: "from-orange-950/25 to-slate-900",
      };
    default:
      return {
        label: "Thông tin chung",
        icon: ScrollText,
        colorClass: "text-slate-400 bg-slate-500/10 border-slate-500/30",
        iconColor: "text-slate-400",
        bgColor: "from-slate-950/25 to-slate-900",
      };
  }
};

const formatFullDateTime = (ts: number | null | undefined): string => {
  if (!ts) return "Không rõ thời gian";
  const date = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  return `${hours}:${minutes}:${seconds} - Ngày ${day}/${month}/${year}`;
};

export const JournalScreen: React.FC<JournalScreenProps> = ({ state }) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [selectedEvent, setSelectedEvent] = useState<JournalEvent | null>(null);

  const events = state.journal?.events || [];

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (selectedFilter === "all") return true;
    return e.category === selectedFilter;
  });

  // Separate timed vs historical backfill events
  const timedEvents: JournalEvent[] = [];
  const historicalEvents: JournalEvent[] = [];

  for (const ev of filteredEvents) {
    if (ev.occurredAt && !ev.dateUnknown) {
      timedEvents.push(ev);
    } else {
      historicalEvents.push(ev);
    }
  }

  // Sort timed events descending
  timedEvents.sort((a, b) => (b.occurredAt || 0) - (a.occurredAt || 0));

  // Helper to format date key
  const getDateGroupKey = (timestamp: number): string => {
    const eventDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (eventDate.toDateString() === today.toDateString()) {
      return "HÔM NAY";
    }
    if (eventDate.toDateString() === yesterday.toDateString()) {
      return "HÔM QUA";
    }
    return eventDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Group timed events by date
  const groupedTimedEvents: Record<string, JournalEvent[]> = {};
  for (const ev of timedEvents) {
    if (!ev.occurredAt) continue;
    const groupKey = getDateGroupKey(ev.occurredAt);
    if (!groupedTimedEvents[groupKey]) {
      groupedTimedEvents[groupKey] = [];
    }
    groupedTimedEvents[groupKey].push(ev);
  }

  const categoryFilters: { id: FilterType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "all", label: "Tất Cả", icon: Filter },
    { id: "rank", label: "Cấp Bậc", icon: Shield },
    { id: "medal", label: "Huân Chương", icon: Award },
    { id: "mastery", label: "Mastery", icon: Crown },
    { id: "training", label: "Huấn Luyện", icon: Target },
    { id: "farm", label: "Tăng Gia", icon: Sprout },
  ];

  const handleSelectEvent = (event: JournalEvent) => {
    soundManager.playClick();
    setSelectedEvent(event);
  };

  return (
    <ArchiveScene rankIndex={state.progression.currentRankIndex} variant="journal" reducedMotion={state.settings.reducedMotion} className="command-screen journal-command-screen w-full max-w-lg mx-auto p-4 select-none pb-28 space-y-4">
      {/* Title */}
      <CommandHeader
        title="Nhật Ký Binh Nghiệp"
        subtitle="Dấu mốc và chiến công đã đạt"
        icon={<ScrollText />}
      />

      {/* Filter Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categoryFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive = selectedFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => {
                soundManager.playClick();
                setSelectedFilter(filter.id);
              }}
              className={`journal-filter-control theme-focus flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-[0.98] focus:outline-none ${
                isActive
                  ? "theme-button-primary shadow-md"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {/* Timed Events Grouped by Date */}
        {Object.keys(groupedTimedEvents).length > 0 && (
          <div className="space-y-5">
            {Object.entries(groupedTimedEvents).map(([dateLabel, groupList]) => (
              <div key={dateLabel} className="space-y-2.5">
                <div className="theme-text-accent flex items-center gap-2 text-xs font-bold tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dateLabel}</span>
                  <div className="theme-active-marker flex-1 h-px" />
                </div>

                <div className="relative pl-4 space-y-3 border-l-2 border-slate-800">
                  {groupList.map((item) => (
                    <JournalEntryCard 
                      key={item.id} 
                      item={item} 
                      onSelect={handleSelectEvent}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Historical Backfill Section */}
        {historicalEvents.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider border-t border-slate-800 pt-4">
              <span>DẤU MỐC TRƯỚC BẢN CẬP NHẬT</span>
              <span className="theme-badge text-[10px] px-2 py-0.5 rounded-full border font-medium">
                Phiên chơi trước
              </span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            <div className="relative pl-4 space-y-3 border-l-2 border-slate-800/60">
              {historicalEvents.map((item) => (
                <JournalEntryCard 
                  key={item.id} 
                  item={item} 
                  isHistorical 
                  onSelect={handleSelectEvent}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
            <ScrollText className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">Chưa có nhật ký nào</p>
            <p className="text-xs text-slate-500">
              Các dấu mốc thăng cấp, huân chương và huấn luyện sẽ tự động lưu lại tại đây.
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <JournalDetailModal 
        isOpen={selectedEvent !== null} 
        onClose={() => setSelectedEvent(null)} 
        event={selectedEvent} 
      />
    </ArchiveScene>
  );
};

type JournalEntryCardProps = {
  item: JournalEvent;
  isHistorical?: boolean;
  onSelect: (item: JournalEvent) => void;
};

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ item, isHistorical, onSelect }) => {
  const formattedTime = item.occurredAt
    ? new Date(item.occurredAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const isRankEvent = item.category === "rank" || item.type === "promotion";

  // Parse rank step and family if it's a rank event
  let rankStep = null;
  let family = null;

  if (isRankEvent) {
    const rankIndex = item.relatedId ? parseInt(item.relatedId, 10) : NaN;
    if (!isNaN(rankIndex) && RANK_STEPS[rankIndex]) {
      rankStep = RANK_STEPS[rankIndex];
    } else {
      // Find rank step by matching title
      const cleanTitle = item.title.replace(/^⭐\s*/, "").trim();
      const found = RANK_STEPS.find((s) => s.displayName === cleanTitle);
      if (found) rankStep = found;
    }

    if (rankStep) {
      family = RANK_FAMILIES.find((f) => f.id === rankStep.familyId) || RANK_FAMILIES[0];
    }
  }

  const cleanTitleText = item.title.replace(/^⭐\s*/, "");

  return (
    <div className="relative group">
      {/* Timeline Node Bullet - Centered Vertically */}
      <div className="theme-active-dot absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ring-4 ring-slate-950 transition-all group-hover:scale-125" />

      {/* Event Card */}
      <div 
        onClick={() => onSelect(item)}
        className="journal-field-report theme-hover-border p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md transition-all cursor-pointer active:scale-[0.99] hover:bg-slate-800/60"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {isRankEvent && family ? (
              <div className="flex flex-col items-center shrink-0">
                <RankBadge badge={family.badge} size={36} />
                {rankStep && rankStep.tierCount > 1 && rankStep.tier !== null && (
                  <div className="mt-0.5">
                    <RankTierProgress
                      currentTier={rankStep.tier}
                      tierCount={rankStep.tierCount}
                      badge={family.badge}
                      badgeSize={36}
                      size="list"
                    />
                  </div>
                )}
              </div>
            ) : null}
            <div>
              <span className="font-bold text-sm text-slate-100">{cleanTitleText}</span>
              {isRankEvent && family && (
                <div className="theme-text-accent text-[10px] font-semibold">{family.name}</div>
              )}
            </div>
          </div>

          <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {isHistorical ? "Đã đạt trước bản cập nhật" : formattedTime}
          </span>
        </div>

        <p className="text-xs text-slate-300 mt-1.5 line-clamp-2">{item.description}</p>
      </div>
    </div>
  );
};

const JournalDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  event: JournalEvent | null;
}> = ({ isOpen, onClose, event }) => {
  if (!isOpen || !event) return null;

  const catDetails = getCategoryDetails(event.category, event.type);
  const IconComponent = catDetails.icon;

  const isRankEvent = event.category === "rank" || event.type === "promotion";
  let rankStep = null;
  let family = null;
  let story = null;

  if (isRankEvent) {
    const rankIndex = event.relatedId ? parseInt(event.relatedId, 10) : NaN;
    if (!isNaN(rankIndex) && RANK_STEPS[rankIndex]) {
      rankStep = RANK_STEPS[rankIndex];
    } else {
      const cleanTitle = event.title.replace(/^⭐\s*/, "").trim();
      const found = RANK_STEPS.find((s) => s.displayName === cleanTitle);
      if (found) rankStep = found;
    }

    if (rankStep) {
      family = RANK_FAMILIES.find((f) => f.id === rankStep.familyId) || RANK_FAMILIES[0];
      story = RANK_STEP_STORIES.find((s) => s.rankIndex === rankStep?.rankIndex);
    }
  }

  const cleanTitleText = event.title.replace(/^⭐\s*/, "");

  // Metadata
  const correctCount = event.metadata?.correctCount;
  const totalQuestions = event.metadata?.totalQuestions;
  const retries = event.metadata?.retries;

  return (
    <AppModal archetype="info"
      onClose={onClose}
      closeOnBackdrop
      labelledBy="journal-detail-title"
    >
          {/* Header Graphic Background */}
          <OverlayHeader className="relative">
            {/* Close button */}
            <ModalButton variant="icon"
              onClick={onClose}
              className="absolute right-3 top-3"
              aria-label="Đóng chi tiết nhật ký"
            >
              <X className="w-4 h-4" />
            </ModalButton>

            {/* Floating Category Icon or Badge */}
            <div className="flex items-center gap-3 pr-10">
              {isRankEvent && family ? (
                <div className="flex items-end gap-3">
                  <div className="theme-card-accent bg-slate-950 border-2 rounded-2xl p-2 shadow-xl shrink-0 flex flex-col items-center">
                    <RankBadge badge={family.badge} size={56} />
                    {rankStep && rankStep.tierCount > 1 && rankStep.tier !== null && (
                      <div className="mt-1 w-full">
                        <RankTierProgress
                          currentTier={rankStep.tier}
                          tierCount={rankStep.tierCount}
                          badge={family.badge}
                          badgeSize={56}
                          size="list"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="modal-status-icon">
                  <IconComponent className={`w-7 h-7 ${catDetails.iconColor}`} />
                </div>
              )}
            </div>
          </OverlayHeader>

          {/* Content Area */}
          <OverlayBody>
            {/* Title & Metadata Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${catDetails.colorClass}`}>
                  {catDetails.label}
                </span>
                {isRankEvent && family && (
                  <span className="theme-badge text-xs border px-2.5 py-1 rounded-full font-bold">
                    {family.name}
                  </span>
                )}
              </div>
              <h3 id="journal-detail-title" className="text-xl font-semibold text-[var(--modal-text)] mt-2.5 leading-tight">
                {cleanTitleText}
              </h3>
              <div className="flex items-center gap-1.5 text-[var(--modal-muted)] text-xs mt-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-[var(--modal-muted)]" />
                <span>{formatFullDateTime(event.occurredAt)}</span>
              </div>
            </div>

            {/* Event Description Card */}
            <div className="modal-section journal-field-report">
              <p className="text-sm text-[var(--modal-text)] leading-relaxed font-medium">
                {event.description}
              </p>
            </div>

            {/* Special Section: Promotion Exam Score & Retries */}
            {isRankEvent && correctCount !== undefined && totalQuestions !== undefined && (
              <div className="modal-section space-y-3.5">
                <div className="text-xs font-bold text-[var(--modal-muted)] tracking-wider uppercase">
                  Báo cáo sát hạch quân ngũ
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="modal-section flex flex-col items-center justify-center text-center space-y-1">
                    <div className="text-xs font-semibold text-[var(--modal-muted)] uppercase tracking-wider">
                      Kết quả thi
                    </div>
                    <div className="text-2xl font-semibold text-[var(--modal-reward)]">
                      {correctCount}/{totalQuestions}
                    </div>
                    <div className="text-xs font-bold text-[var(--modal-text)] bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      {correctCount === totalQuestions ? "Thủ Khoa" : "Đạt Sát Hạch"}
                    </div>
                  </div>

                  <div className="modal-section flex flex-col items-center justify-center text-center space-y-1">
                    <div className="text-xs font-semibold text-[var(--modal-muted)] uppercase tracking-wider">
                      Số lần thi lại
                    </div>
                    {retries && retries > 0 ? (
                      <>
                        <div className="text-2xl font-semibold text-[var(--modal-danger)]">
                          {retries} lần
                        </div>
                        <div className="text-xs font-bold text-[var(--modal-danger)] bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>Cần ôn luyện thêm</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-semibold text-[var(--modal-success)]">
                          0 lần
                        </div>
                        <div className="text-xs font-bold text-[var(--modal-success)] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 shrink-0" />
                          <span>Xuất Sắc</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Question dots representation */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {Array.from({ length: totalQuestions }).map((_, i) => {
                    const isCorrect = i < correctCount;
                    return (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full ${
                          isCorrect
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                            : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Memoir / Story Section */}
            {isRankEvent && story && (
              <div className="theme-divider space-y-2.5 border-t pt-4">
                <div className="theme-text-accent text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Binh nghiệp ký sự</span>
                </div>
                {story.subtitle && (
                  <div className="text-xs italic text-[var(--modal-muted)] font-medium">
                    "{story.subtitle}"
                  </div>
                )}
                <div className="space-y-3">
                  {story.paragraphs.map((p, index) => (
                    <p key={index} className="text-xs text-[var(--modal-text)] leading-relaxed text-justify indent-4">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </OverlayBody>

          {/* Footer Action */}
          <OverlayFooter className="theme-divider flex justify-end">
            <ModalButton variant="ghost"
              onClick={onClose}
            >
              Đóng
            </ModalButton>
          </OverlayFooter>
    </AppModal>
  );
};
