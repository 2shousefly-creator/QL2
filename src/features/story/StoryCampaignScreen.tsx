import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Eye,
  EyeOff,
  History,
  Lock,
  Play,
  Radio,
  RotateCcw,
  ScrollText,
  Shield,
  Sparkles,
  Trophy,
  Unlock,
  Users,
  X,
} from "lucide-react";
import { ArchiveScene } from "../profile/pixi/ArchiveScene";
import { CommandHeader } from "../../components/military/MilitaryUI";
import { soundManager } from "../../game/audio";
import type { GameState } from "../../game/types";
import { loadStoryChapter, STORY_CHAPTER_GROUPS, STORY_EPISODES_META } from "./storyCatalog";
import {
  advanceLinearNode,
  applyChoiceToSave,
  createFreshCampaignSave,
  evalCondition,
  restoreCheckpointInSave,
  startChapterCleanOrFromSnapshot,
  transitionToNextChapter,
} from "./storyEngine";
import { clearStoryCampaignSave, loadStoryCampaignSave, saveStoryCampaignSave } from "./storyStorage";
import type { CharacterId, RelicId, StatId, StoryCampaignSave, StoryChapter, StoryChoice, StoryNode } from "./storyTypes";
import {
  CHARACTER_STATUS_LABELS,
  STORY_CHARACTERS_META,
  STORY_ENDINGS,
  STORY_RELICS_META,
  STORY_STATS_META,
} from "./storyVariables";

type StoryCampaignScreenProps = {
  state: GameState;
  onBack: () => void;
  onReaderActiveChange: (active: boolean) => void;
};

type NotebookTab = "stats" | "journal" | "flowchart";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0]?.slice(0, 2).toUpperCase() || "QL";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\r?\n\r?\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export const StoryCampaignScreen: React.FC<StoryCampaignScreenProps> = ({
  state,
  onBack,
  onReaderActiveChange,
}) => {
  const [viewMode, setViewMode] = useState<"hub" | "reader">("hub");
  const [save, setSave] = useState<StoryCampaignSave | null>(() => loadStoryCampaignSave());
  const [activeChapter, setActiveChapter] = useState<StoryChapter | null>(null);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedChapterNum, setExpandedChapterNum] = useState<number>(() => {
    const initialSave = loadStoryCampaignSave();
    const ep = STORY_EPISODES_META.find((item) => item.id === initialSave?.currentChapterId);
    return ep?.chapterNumber ?? 1;
  });

  const [notebookTab, setNotebookTab] = useState<NotebookTab>("stats");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: number; text: string }>>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [timerProgressPct, setTimerProgressPct] = useState(100);

  const feedEndRef = useRef<HTMLDivElement>(null);
  const toastCounter = useRef(0);
  const saveRef = useRef<StoryCampaignSave | null>(save);
  saveRef.current = save;

  const pushNotices = useCallback((notices: string[]) => {
    if (!saveRef.current?.showStatsAndHints || notices.length === 0) return;
    const created = notices.slice(0, 3).map((text) => ({
      id: ++toastCounter.current,
      text,
    }));
    setToasts((prev) => [...prev, ...created].slice(-4));
    created.forEach((item) => {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== item.id));
      }, 2400);
    });
  }, []);

  useEffect(() => {
    onReaderActiveChange(viewMode === "reader");
    return () => onReaderActiveChange(false);
  }, [viewMode, onReaderActiveChange]);

  const persistSave = useCallback((next: StoryCampaignSave) => {
    setSave(next);
    saveStoryCampaignSave(next);
  }, []);

  const nodeMap = useMemo(() => {
    const map = new Map<string, StoryNode>();
    if (activeChapter) {
      for (const n of activeChapter.nodes) {
        map.set(n.id, n);
      }
    }
    return map;
  }, [activeChapter]);

  const currentNode = save ? nodeMap.get(save.currentNodeId) ?? null : null;

  // Scroll to newest node in reader
  useEffect(() => {
    if (viewMode === "reader") {
      feedEndRef.current?.scrollIntoView({ behavior: state.settings.reducedMotion ? "auto" : "smooth" });
    }
  }, [viewMode, save?.history.length, state.settings.reducedMotion]);

  const openChapterInReader = useCallback(
    async (chapterId: string, mode: "resume" | "snapshot" | "fresh") => {
      soundManager.playClick();
      setIsLoadingChapter(true);
      setLoadError(null);
      try {
        const chapter = await loadStoryChapter(chapterId);
        let nextSave = saveRef.current;
        if (!nextSave) {
          const ch1 = chapter.id === "ch1_ep1" ? chapter : await loadStoryChapter("ch1_ep1");
          nextSave = createFreshCampaignSave(ch1);
          if (chapter.id !== "ch1_ep1") {
            nextSave = startChapterCleanOrFromSnapshot(nextSave, chapter, false);
          }
        } else if (mode === "fresh") {
          nextSave = startChapterCleanOrFromSnapshot(nextSave, chapter, false);
        } else if (mode === "snapshot") {
          nextSave = startChapterCleanOrFromSnapshot(nextSave, chapter, true);
        } else if (nextSave.currentChapterId !== chapter.id) {
          nextSave = startChapterCleanOrFromSnapshot(nextSave, chapter, true);
        }

        if (!chapter.nodes.some((n) => n.id === nextSave.currentNodeId)) {
          nextSave = {
            ...nextSave,
            currentChapterId: chapter.id,
            currentNodeId: chapter.entryNodeId,
            history: [{ kind: "node", nodeId: chapter.entryNodeId }],
          };
        }

        setActiveChapter(chapter);
        setExpandedChapterNum(chapter.chapterNumber);
        persistSave(nextSave);
        setViewMode("reader");
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Không thể tải chương cốt truyện.");
      } finally {
        setIsLoadingChapter(false);
      }
    },
    [persistSave]
  );

  const handleAdvance = useCallback(() => {
    if (!save || !activeChapter) return;
    soundManager.playClick();
    const { nextSave, notices } = advanceLinearNode(save, activeChapter, nodeMap);
    persistSave(nextSave);
    pushNotices(notices);
  }, [save, activeChapter, nodeMap, persistSave, pushNotices]);

  const handlePickChoice = useCallback(
    (choice: StoryChoice) => {
      if (!save || !activeChapter) return;
      soundManager.playClick();
      const { nextSave, notices } = applyChoiceToSave(save, activeChapter, nodeMap, choice);
      persistSave(nextSave);
      pushNotices(notices);
    },
    [save, activeChapter, nodeMap, persistSave, pushNotices]
  );

  const handleGoNextChapter = useCallback(async () => {
    if (!save || !activeChapter?.nextChapterId) return;
    soundManager.playClick();
    setIsLoadingChapter(true);
    try {
      const nextChapter = await loadStoryChapter(activeChapter.nextChapterId);
      const { nextSave, notices } = transitionToNextChapter(save, nextChapter);
      setActiveChapter(nextChapter);
      persistSave(nextSave);
      pushNotices(notices);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Không thể chuyển sang chương tiếp theo.");
    } finally {
      setIsLoadingChapter(false);
    }
  }, [save, activeChapter, persistSave, pushNotices]);

  const handleRestoreCheckpoint = useCallback(
    async (checkpointIdx: number) => {
      if (!save) return;
      const targetCp = save.checkpoints[checkpointIdx];
      if (!targetCp) return;
      soundManager.playClick();
      setIsLoadingChapter(true);
      try {
        if (!activeChapter || activeChapter.id !== targetCp.chapterId) {
          const ch = await loadStoryChapter(targetCp.chapterId);
          setActiveChapter(ch);
        }
        const restored = restoreCheckpointInSave(save, checkpointIdx);
        persistSave(restored);
        setIsDrawerOpen(false);
        setViewMode("reader");
        pushNotices(["Đã quay lại điểm ký ức"]);
      } finally {
        setIsLoadingChapter(false);
      }
    },
    [save, activeChapter, persistSave, pushNotices]
  );

  const handleResetWholeCampaign = useCallback(async () => {
    soundManager.playClick();
    clearStoryCampaignSave();
    setIsLoadingChapter(true);
    try {
      const ch1 = await loadStoryChapter("ch1_ep1");
      const fresh = createFreshCampaignSave(ch1);
      setActiveChapter(ch1);
      setExpandedChapterNum(1);
      persistSave(fresh);
      setViewMode("reader");
    } finally {
      setIsLoadingChapter(false);
    }
  }, [persistSave]);

  const availableChoices = useMemo(() => {
    if (!save || !currentNode || currentNode.type !== "choice") return [];
    return (currentNode.choices ?? []).filter((c) => evalCondition(c.condition, save));
  }, [save, currentNode]);

  // Timed choice countdown
  useEffect(() => {
    if (
      viewMode !== "reader" ||
      !save?.timerEnabled ||
      !currentNode ||
      currentNode.type !== "choice" ||
      !currentNode.timedSeconds ||
      availableChoices.length === 0
    ) {
      setRemainingSeconds(null);
      setTimerProgressPct(100);
      return;
    }

    const totalMs = currentNode.timedSeconds * 1000;
    const startedAt = Date.now();
    setRemainingSeconds(currentNode.timedSeconds);
    setTimerProgressPct(100);

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const leftMs = Math.max(0, totalMs - elapsed);
      setTimerProgressPct((leftMs / totalMs) * 100);
      setRemainingSeconds(Math.ceil(leftMs / 1000));

      if (leftMs <= 0) {
        window.clearInterval(intervalId);
        const timeoutChoice =
          availableChoices.find((c) => c.id === currentNode.timeoutChoiceId) ||
          availableChoices[availableChoices.length - 1];
        if (timeoutChoice) {
          handlePickChoice(timeoutChoice);
        }
      }
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [viewMode, save?.timerEnabled, currentNode?.id, currentNode?.timedSeconds, availableChoices, handlePickChoice]);

  // Keyboard shortcuts in reader mode
  useEffect(() => {
    if (viewMode !== "reader" || !currentNode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (currentNode.type === "choice") {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= availableChoices.length) {
          e.preventDefault();
          handlePickChoice(availableChoices[num - 1]);
        }
      } else if (!currentNode.isChapterEnd && currentNode.type !== "ending") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleAdvance();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewMode, currentNode, availableChoices, handleAdvance, handlePickChoice]);

  const unlockedChapterNumbers = useMemo(() => {
    const set = new Set<number>([1]);
    if (!save) return set;
    const curMeta = STORY_EPISODES_META.find((c) => c.id === save.currentChapterId);
    if (curMeta) {
      for (let i = 1; i <= curMeta.chapterNumber; i++) set.add(i);
    }
    for (const doneId of save.completedChapterIds) {
      const doneMeta = STORY_EPISODES_META.find((c) => c.id === doneId);
      if (doneMeta) {
        set.add(doneMeta.chapterNumber);
        if (doneMeta.nextChapterId) {
          const nextEp = STORY_EPISODES_META.find((c) => c.id === doneMeta.nextChapterId);
          if (nextEp) set.add(nextEp.chapterNumber);
        }
      }
    }
    return set;
  }, [save]);

  const unlockedEpisodeOrders = useMemo(() => {
    const set = new Set<number>([1]);
    if (!save) return set;
    const curMeta = STORY_EPISODES_META.find((c) => c.id === save.currentChapterId);
    if (curMeta) {
      for (let i = 1; i <= curMeta.episodeOrder; i++) set.add(i);
    }
    for (const doneId of save.completedChapterIds) {
      const doneMeta = STORY_EPISODES_META.find((c) => c.id === doneId);
      if (doneMeta) {
        set.add(doneMeta.episodeOrder);
        if (doneMeta.episodeOrder < 24) set.add(doneMeta.episodeOrder + 1);
      }
    }
    return set;
  }, [save]);

  // === HUB VIEW (inside Hồ Sơ Quân Vụ) ===
  if (viewMode === "hub") {
    const currentMeta = STORY_EPISODES_META.find((c) => c.id === save?.currentChapterId) ?? STORY_EPISODES_META[0];
    const completedEpisodesCount = save?.completedChapterIds.length ?? 0;
    const unlockedEndingsCount = save?.unlockedEndingIds.length ?? 0;
    const visitedCount = save?.visitedNodeIds.length ?? 0;
    const totalEndingsCount = STORY_ENDINGS.length;

    return (
      <ArchiveScene
        rankIndex={state.progression.currentRankIndex}
        variant="journal"
        reducedMotion={state.settings.reducedMotion}
        className="command-screen journal-command-screen w-full max-w-lg mx-auto p-4 select-none pb-28 space-y-4"
      >
        <CommandHeader
          title="Chiến Dịch Cốt Truyện"
          subtitle="Phân nhánh 8 chương · 24 hồi · ~24–30 giờ khám phá"
          icon={<BookOpen />}
          action={
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onBack();
              }}
              className="theme-focus flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-bold text-slate-200 hover:bg-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Hồ Sơ</span>
            </button>
          }
        />

        {loadError && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200">
            {loadError}
          </div>
        )}

        {/* Primary Resume / Start Card */}
        <div className="command-panel theme-card-accent rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/95 border p-4 shadow-xl space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                {save ? `Đang tiến hành · Hồi ${currentMeta.episodeOrder}/24` : "Bắt đầu hành trình mới"}
              </span>
              <h2 className="text-base font-extrabold text-slate-100 mt-0.5">
                {currentMeta.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">{currentMeta.summary}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-center">
              <div className="text-sm font-black text-amber-300">{completedEpisodesCount}/24</div>
              <div className="text-[10px] text-slate-400 font-semibold">Hồi hoàn tất</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-center">
              <div className="text-sm font-black text-emerald-300">
                {unlockedEndingsCount}/{totalEndingsCount}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">Kết cục đã mở</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-center">
              <div className="text-sm font-black text-sky-300">{visitedCount}</div>
              <div className="text-[10px] text-slate-400 font-semibold">Cảnh đã đọc</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={isLoadingChapter}
              onClick={() => openChapterInReader(currentMeta.id, "resume")}
              className="theme-button-primary flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{save ? "Tiếp Tục Cốt Truyện" : "Bắt Đầu Từ Chương I · Hồi 1"}</span>
            </button>

            {save && (
              <button
                type="button"
                disabled={isLoadingChapter}
                onClick={handleResetWholeCampaign}
                className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-bold text-slate-300 hover:text-rose-300 hover:border-rose-500/40 flex items-center gap-1.5"
                title="Chơi lại từ đầu Chương I (vẫn giữ các Kết cục đã khám phá)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chơi Lại</span>
              </button>
            )}
          </div>
        </div>

        {/* 8-Chapter / 24-Episode Roadmap */}
        <div className="command-panel rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Lộ Trình 8 Chương · 24 Hồi</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                if (!save) return;
                persistSave({ ...save, freeExploreUnlocked: !save.freeExploreUnlocked });
              }}
              disabled={!save}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
                save?.freeExploreUnlocked
                  ? "bg-amber-500/15 border-amber-400/50 text-amber-300"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title="Bật để đọc thử tự do bất kỳ hồi nào"
            >
              {save?.freeExploreUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              <span>{save?.freeExploreUnlocked ? "Đọc tự do: Bật" : "Mở khóa đọc tự do"}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {STORY_CHAPTER_GROUPS.map((group) => {
              const episodes = group.episodeIds
                .map((id) => STORY_EPISODES_META.find((ep) => ep.id === id))
                .filter((ep): ep is NonNullable<typeof ep> => Boolean(ep));
              const groupDoneCount = episodes.filter((ep) => save?.completedChapterIds.includes(ep.id)).length;
              const isGroupCurrent = episodes.some((ep) => ep.id === save?.currentChapterId);
              const isGroupUnlocked =
                Boolean(save?.freeExploreUnlocked) || unlockedChapterNumbers.has(group.chapterNumber);
              const isExpanded = expandedChapterNum === group.chapterNumber;

              return (
                <div
                  key={group.chapterNumber}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isGroupCurrent
                      ? "bg-amber-950/20 border-amber-500/45"
                      : isGroupUnlocked
                        ? "bg-slate-950/70 border-slate-800"
                        : "bg-slate-950/35 border-slate-800/50 opacity-65"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setExpandedChapterNum((prev) => (prev === group.chapterNumber ? -1 : group.chapterNumber));
                    }}
                    className="w-full text-left p-3 flex items-start justify-between gap-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-extrabold text-amber-400">
                          CHƯƠNG {group.chapterNumber}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
                          {group.rankRange}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400">
                          {groupDoneCount}/{episodes.length} hồi
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-100 mt-1">{group.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{group.summary}</div>
                    </div>
                    <div className="shrink-0 text-slate-400 mt-1">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-800/70 space-y-2">
                      {episodes.map((ep) => {
                        const isEpUnlocked =
                          Boolean(save?.freeExploreUnlocked) || unlockedEpisodeOrders.has(ep.episodeOrder);
                        const isEpCompleted = save?.completedChapterIds.includes(ep.id);
                        const isEpCurrent = save?.currentChapterId === ep.id;

                        return (
                          <button
                            key={ep.id}
                            type="button"
                            disabled={!isEpUnlocked || isLoadingChapter}
                            onClick={() => openChapterInReader(ep.id, isEpCurrent ? "resume" : "snapshot")}
                            className={`w-full text-left p-2.5 rounded-lg border transition flex items-start justify-between gap-2.5 ${
                              isEpCurrent
                                ? "bg-amber-950/35 border-amber-400/60 hover:bg-amber-950/45"
                                : isEpUnlocked
                                  ? "bg-slate-900/85 border-slate-800 hover:border-slate-600"
                                  : "bg-slate-950/40 border-slate-800/50 opacity-50 cursor-not-allowed"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-extrabold text-sky-300 uppercase">
                                  Hồi {ep.episodeOrder}
                                </span>
                                <span className="text-[10px] text-slate-400">· {ep.rankRange}</span>
                                {isEpCompleted && (
                                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                    <CheckCircle2 className="w-3 h-3" /> Xong
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-bold text-slate-100 mt-0.5 truncate">{ep.shortTitle}</div>
                              <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{ep.summary}</div>
                            </div>
                            <div className="shrink-0 text-right">
                              {isEpUnlocked ? (
                                <span className="text-[10px] font-mono text-slate-400">~{ep.estimatedMinutes}p</span>
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-slate-500 mt-1" />
                              )}
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
        </div>

        {/* Discovered Endings Only (hidden until unlocked) */}
        {unlockedEndingsCount > 0 && (
          <div className="command-panel rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>
                  Kết Cục Đã Khám Phá ({unlockedEndingsCount}/{totalEndingsCount})
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {STORY_ENDINGS.filter((end) => save?.unlockedEndingIds.includes(end.id)).map((end) => (
                <div key={end.id} className="p-3 rounded-xl border bg-emerald-950/20 border-emerald-500/35">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-300">{end.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-semibold">
                      {end.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{end.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </ArchiveScene>
    );
  }

  // === IMMERSIVE READER VIEW ===
  if (!save || !activeChapter || !currentNode) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-slate-300 text-sm">
        Đang chuẩn bị kịch bản...
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0 flex flex-col bg-slate-950 text-slate-100 select-text">
      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed top-14 right-4 z-50 flex flex-col gap-1.5 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="px-3 py-1.5 rounded-lg bg-slate-900/95 border border-amber-500/45 text-amber-200 text-xs font-bold shadow-xl"
            >
              {t.text}
            </div>
          ))}
        </div>
      )}

      {/* Reader Top Bar */}
      <header className="shrink-0 bg-slate-900/95 border-b border-slate-800 px-3 py-2.5 flex items-center justify-between gap-2 flex-wrap z-20">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setViewMode("hub");
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chiến Dịch</span>
          </button>
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-slate-100 truncate">{activeChapter.title}</div>
            <div className="text-[11px] font-semibold text-amber-400 truncate">{activeChapter.rankRange}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              persistSave({ ...save, showStatsAndHints: !save.showStatsAndHints });
            }}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 ${
              save.showStatsAndHints
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900 border-slate-700 text-slate-400"
            }`}
            title="Ẩn/hiện chỉ số chiến dịch"
          >
            {save.showStatsAndHints ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Chỉ số</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              persistSave({ ...save, timerEnabled: !save.timerEnabled });
            }}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 ${
              save.timerEnabled
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                : "bg-slate-900 border-slate-700 text-slate-400"
            }`}
            title="Bật/tắt đồng hồ đếm ngược khẩn cấp"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đếm ngược</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setIsDrawerOpen(true);
            }}
            className="lg:hidden px-2.5 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-200 text-[11px] font-bold flex items-center gap-1"
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Sổ Xanh</span>
          </button>
        </div>
      </header>

      {/* Main Reader Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_350px]">
        {/* Story Column */}
        <div className="min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3.5">
            <div className="max-w-2xl mx-auto space-y-3.5">
              {save.history.map((item, idx) => {
                if (item.kind === "picked") {
                  return (
                    <div key={`picked-${idx}`} className="flex justify-end">
                      <div className="max-w-[85%] rounded-xl bg-emerald-950/50 border border-emerald-600/40 px-3.5 py-2 text-xs text-emerald-100">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">
                          Lựa chọn của bạn
                        </span>
                        {item.label}
                      </div>
                    </div>
                  );
                }

                const node = item.nodeId ? nodeMap.get(item.nodeId) : undefined;
                if (!node) return null;

                if (node.type === "dialogue") {
                  const charMeta = node.speaker ? STORY_CHARACTERS_META[node.speaker] : undefined;
                  const speakerLabel = node.speakerTitle || charMeta?.displayName || node.speaker || "Nhân vật";
                  const avatarColor = charMeta?.color || "#94a3b8";
                  const paragraphs = splitParagraphs(node.text);

                  return (
                    <article
                      key={node.id}
                      className="rounded-2xl bg-slate-900/95 border border-slate-700/80 border-l-4 p-4 flex gap-3.5 items-start shadow-lg"
                      style={{ borderLeftColor: avatarColor }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-xs text-slate-950 shadow-sm mt-0.5"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {getInitials(charMeta?.displayName || speakerLabel)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-800/80 pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-extrabold tracking-tight" style={{ color: avatarColor }}>
                              {speakerLabel}
                            </span>
                            {charMeta?.region && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 font-semibold">
                                {charMeta.region}
                              </span>
                            )}
                          </div>
                          {node.location && (
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                              {node.location}
                            </span>
                          )}
                        </div>
                        <div className="space-y-3 text-[15px] leading-7 text-slate-50 font-medium">
                          {paragraphs.map((para, pIdx) => (
                            <p key={pIdx} className="whitespace-pre-line">
                              {para}
                            </p>
                          ))}
                        </div>
                      </div>
                    </article>
                  );
                }

                if (node.type === "dispatch") {
                  const paragraphs = splitParagraphs(node.text);
                  return (
                    <article
                      key={node.id}
                      className="rounded-xl bg-slate-950 border border-dashed border-amber-500/70 p-4 font-mono text-xs text-amber-200 shadow-inner space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-bold tracking-wider">
                          <Radio className="w-3 h-3" />
                          <span>CÔNG ĐIỆN / VÔ TUYẾN</span>
                        </div>
                        {node.location && (
                          <div className="text-[10px] uppercase tracking-wider text-slate-400">
                            {node.location}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2.5 leading-relaxed">
                        {paragraphs.map((para, pIdx) => (
                          <p key={pIdx} className="whitespace-pre-line">
                            {para}
                          </p>
                        ))}
                      </div>
                    </article>
                  );
                }

                if (node.type === "choice") {
                  const paragraphs = splitParagraphs(node.text);
                  return (
                    <article
                      key={node.id}
                      className="rounded-2xl bg-amber-950/25 border border-amber-500/45 p-4 text-[14.5px] text-amber-100 leading-7 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                          TÌNH HUỐNG QUYẾT ĐỊNH
                        </span>
                        {node.location && (
                          <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-bold">
                            {node.location}
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        {paragraphs.map((para, pIdx) => (
                          <p key={pIdx} className="whitespace-pre-line">
                            {para}
                          </p>
                        ))}
                      </div>
                    </article>
                  );
                }

                const narrationParagraphs = splitParagraphs(node.text);
                return (
                  <article
                    key={node.id}
                    className={`rounded-2xl border p-4 sm:p-5 space-y-2.5 shadow-sm ${
                      node.mood === "urgent"
                        ? "bg-rose-950/20 border-rose-500/40 text-slate-200"
                        : node.mood === "warm"
                          ? "bg-slate-900/55 border-amber-500/30 text-slate-200"
                          : "bg-slate-900/50 border-slate-800/90 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-800/60 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        DẪN CHUYỆN
                      </span>
                      {node.location && (
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                          {node.location}
                        </span>
                      )}
                    </div>
                    <div className="space-y-3 text-[14.5px] leading-7">
                      {narrationParagraphs.map((para, pIdx) => (
                        <p key={pIdx} className="whitespace-pre-line">
                          {para}
                        </p>
                      ))}
                    </div>
                  </article>
                );
              })}

              {/* End of Chapter / Ending Summary Card */}
              {(currentNode.isChapterEnd || currentNode.type === "ending") && (
                <section className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/50 p-4 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {currentNode.type === "ending"
                        ? `KẾT CỤC: ${currentNode.endingTitle || currentNode.endingId}`
                        : `HOÀN THÀNH ${activeChapter.title.toUpperCase()}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.entries(STORY_STATS_META) as Array<[StatId, (typeof STORY_STATS_META)[StatId]]>).map(
                      ([sId, meta]) => (
                        <div
                          key={sId}
                          className="rounded-lg bg-slate-950/80 border border-slate-800 px-2.5 py-1.5 flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-400">{meta.label}</span>
                          <strong className="text-amber-300">{save.stats[sId] ?? meta.initial}</strong>
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentNode.isChapterEnd && activeChapter.nextChapterId && (
                      <button
                        type="button"
                        disabled={isLoadingChapter}
                        onClick={handleGoNextChapter}
                        className="theme-button-primary flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold"
                      >
                        Sang Hồi Tiếp Theo →
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openChapterInReader(activeChapter.id, "snapshot")}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200"
                    >
                      Chơi Lại Hồi Này
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode("hub")}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300"
                    >
                      Về Chiến Dịch
                    </button>
                  </div>
                </section>
              )}

              <div ref={feedEndRef} />
            </div>
          </div>

          {/* Urgent Countdown Bar */}
          {remainingSeconds !== null && (
            <div className="shrink-0 bg-rose-950/60 border-t border-rose-500/50 px-4 py-2">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-rose-200 mb-1">
                  <span>TÌNH HUỐNG KHẨN CẤP</span>
                  <span>{remainingSeconds}s</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-100"
                    style={{ width: `${timerProgressPct}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Dock */}
          <div className="shrink-0 bg-slate-900/95 border-t border-slate-800 px-4 py-3">
            <div className="max-w-2xl mx-auto space-y-2">
              {currentNode.type === "choice" ? (
                availableChoices.map((choice, idx) => (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => handlePickChoice(choice)}
                    className="w-full text-left rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-700/80 hover:border-amber-400/70 px-3.5 py-2.5 flex items-start gap-3 transition"
                  >
                    <span className="w-6 h-6 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs sm:text-sm font-bold text-slate-100 leading-snug">
                        {choice.label}
                      </span>
                    </span>
                  </button>
                ))
              ) : currentNode.isChapterEnd || currentNode.type === "ending" ? (
                <div className="flex gap-2">
                  {currentNode.isChapterEnd && activeChapter.nextChapterId ? (
                    <button
                      type="button"
                      disabled={isLoadingChapter}
                      onClick={handleGoNextChapter}
                      className="theme-button-primary flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold"
                    >
                      {(() => {
                        const nextEp = STORY_EPISODES_META.find((ep) => ep.id === activeChapter.nextChapterId);
                        if (!nextEp) return "Sang Hồi Tiếp Theo →";
                        return nextEp.chapterNumber === activeChapter.chapterNumber
                          ? `Tiếp Tục Sang Hồi ${nextEp.episodeOrder} →`
                          : `Sang Chương ${nextEp.chapterNumber} · Hồi ${nextEp.episodeOrder} →`;
                      })()}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setViewMode("hub")}
                      className="theme-button-primary flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold"
                    >
                      Về Chiến Dịch &amp; Lộ Trình
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAdvance}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-100 font-extrabold text-xs sm:text-sm transition"
                >
                  Tiếp tục (Enter)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Side Panel + Mobile Slide-over Drawer: Cuốn Sổ Bìa Xanh */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        <aside
          className={`${
            isDrawerOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          } fixed lg:static top-0 right-0 bottom-0 w-[min(350px,90vw)] lg:w-auto bg-slate-900 border-l border-slate-800 z-50 lg:z-auto flex flex-col min-h-0 transition-transform duration-200`}
          aria-label="Cuốn Sổ Bìa Xanh"
        >
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-6 rounded-sm bg-blue-600 border border-blue-400" />
              <div>
                <h2 className="text-sm font-extrabold text-blue-200">Cuốn Sổ Bìa Xanh</h2>
                <p className="text-[11px] text-slate-400">Hồ sơ đơn vị &amp; Sơ đồ Ký ức</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300"
              aria-label="Đóng sổ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold">
            {(
              [
                ["stats", "Chỉ số", Shield],
                ["journal", "Nhật ký", ScrollText],
                ["flowchart", "Ký ức", History],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setNotebookTab(id);
                }}
                className={`py-2.5 flex items-center justify-center gap-1 border-b-2 transition ${
                  notebookTab === id
                    ? "border-amber-400 text-amber-300 bg-amber-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {notebookTab === "stats" && (
              <>
                <div className="space-y-2.5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    5 Trục Chỉ Số Đơn Vị
                  </h3>
                  {(Object.entries(STORY_STATS_META) as Array<[StatId, (typeof STORY_STATS_META)[StatId]]>).map(
                    ([sId, meta]) => {
                      const val = save.stats[sId] ?? meta.initial;
                      const pct = Math.round((val / meta.max) * 100);
                      return (
                        <div key={sId} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-semibold">{meta.label}</span>
                            <strong className="text-amber-300">
                              {save.showStatsAndHints ? `${val}/${meta.max}` : "Ẩn"}
                            </strong>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all"
                              style={{ width: save.showStatsAndHints ? `${pct}%` : "0%" }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Nhân Vật Liên Quan</span>
                  </h3>
                  {(Object.entries(STORY_CHARACTERS_META) as Array<[CharacterId, (typeof STORY_CHARACTERS_META)[CharacterId]]>)
                    .filter(([id, def]) => id !== "player" && def.introducedInChapter <= activeChapter.chapterNumber)
                    .map(([charId, def]) => {
                      const st = save.characterStates[charId] ?? "alive";
                      const stUi = CHARACTER_STATUS_LABELS[st];
                      const relVal = save.relationships[charId];
                      return (
                        <div
                          key={charId}
                          className="rounded-lg bg-slate-950/70 border border-slate-800 p-2.5 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-100 truncate">{def.displayName}</div>
                            <div className="text-[11px] text-slate-400">
                              {def.region}
                              {save.showStatsAndHints && charId !== "hac_ung"
                                ? ` · Tin cậy ${relVal > 0 ? `+${relVal}` : relVal}`
                                : ""}
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${stUi.badgeClass}`}>
                            {stUi.label}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </>
            )}

            {notebookTab === "journal" && (
              <>
                <div className="space-y-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Kỷ Vật Đã Mở Khóa
                  </h3>
                  {save.relics.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Chưa có kỷ vật nào.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {save.relics.map((rId: RelicId) => (
                        <div key={rId} className="rounded-lg bg-blue-950/25 border border-blue-500/30 p-2.5">
                          <div className="text-xs font-bold text-blue-200">
                            {STORY_RELICS_META[rId]?.name ?? rId}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {STORY_RELICS_META[rId]?.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Trang Ghi Chép ({save.journal.length})
                  </h3>
                  {save.journal.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Sổ bìa xanh đang còn trống.</p>
                  ) : (
                    save.journal.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-lg bg-slate-950/80 border-l-2 border-blue-500 p-2.5 space-y-1"
                      >
                        <div className="text-xs font-bold text-blue-200">{entry.title}</div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{entry.entry}</p>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {notebookTab === "flowchart" && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Sơ Đồ Ký Ức ({save.checkpoints.length})
                </h3>
                {save.checkpoints.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Chưa có điểm rẽ nhánh nào được lưu. Khi bạn đưa ra lựa chọn, nút quay lại sẽ hiện ở đây.
                  </p>
                ) : (
                  [...save.checkpoints]
                    .reverse()
                    .map((cp, revIdx) => {
                      const realIdx = save.checkpoints.length - 1 - revIdx;
                      return (
                        <div
                          key={`${cp.chapterId}-${cp.nodeId}-${realIdx}`}
                          className="rounded-lg bg-slate-950/80 border border-slate-800 p-2.5 space-y-1.5"
                        >
                          <div className="text-xs font-bold text-amber-300">
                            Điểm #{realIdx + 1}: {cp.chosenLabel}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2">{cp.promptPreview}</p>
                          <button
                            type="button"
                            onClick={() => handleRestoreCheckpoint(realIdx)}
                            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200"
                          >
                            Quay lại điểm này
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
