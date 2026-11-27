import { STORY_CHARACTERS_META, STORY_RELATIONSHIPS_META, STORY_STATS_META } from "./storyVariables";
import type {
  CharacterId,
  CharacterState,
  ConditionExpr,
  EffectOp,
  RelicId,
  StatId,
  StoryCampaignSave,
  StoryChapter,
  StoryChoice,
  StoryNode,
  StoryRunSnapshot,
} from "./storyTypes";

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function createInitialStats(): Record<StatId, number> {
  const res = {} as Record<StatId, number>;
  for (const [k, def] of Object.entries(STORY_STATS_META)) {
    res[k as StatId] = def.initial;
  }
  return res;
}

export function createInitialRelationships(): Record<CharacterId, number> {
  const res = { player: 0, hac_ung: 0 } as Record<CharacterId, number>;
  for (const [k, def] of Object.entries(STORY_RELATIONSHIPS_META)) {
    res[k as CharacterId] = def.initial;
  }
  return res;
}

export function createInitialCharStates(): Record<CharacterId, CharacterState> {
  const res = {} as Record<CharacterId, CharacterState>;
  for (const [k, def] of Object.entries(STORY_CHARACTERS_META)) {
    res[k as CharacterId] = def.initialState;
  }
  return res;
}

export function createFreshCampaignSave(firstChapter: StoryChapter): StoryCampaignSave {
  const entry = firstChapter.nodes.find((n) => n.id === firstChapter.entryNodeId);
  const base: StoryCampaignSave = {
    schemaVersion: 2,
    currentChapterId: firstChapter.id,
    currentNodeId: firstChapter.entryNodeId,
    stats: createInitialStats(),
    relationships: createInitialRelationships(),
    characterStates: createInitialCharStates(),
    flags: {},
    relics: [],
    journal: [],
    history: [],
    checkpoints: [],
    chapterStartSnapshots: {},
    completedChapterIds: [],
    unlockedEndingIds: [],
    visitedNodeIds: [],
    showStatsAndHints: true,
    timerEnabled: true,
    freeExploreUnlocked: false,
  };

  if (entry) {
    recordNodeVisit(base, firstChapter.id, entry);
  }
  base.chapterStartSnapshots[firstChapter.id] = captureSnapshot(base);
  return base;
}

export function captureSnapshot(save: StoryCampaignSave): StoryRunSnapshot {
  return deepClone({
    chapterId: save.currentChapterId,
    currentNodeId: save.currentNodeId,
    stats: save.stats,
    relationships: save.relationships,
    characterStates: save.characterStates,
    flags: save.flags,
    relics: save.relics,
    journal: save.journal,
    history: save.history,
  });
}

export function evalCondition(cond: ConditionExpr | undefined, state: Pick<StoryCampaignSave, "stats" | "relationships" | "characterStates" | "flags" | "relics">): boolean {
  if (!cond) return true;
  if ("flag" in cond) return Boolean(state.flags[cond.flag]);
  if ("notFlag" in cond) return !state.flags[cond.notFlag];
  if ("statMin" in cond) return (state.stats[cond.statMin.stat] ?? 0) >= cond.statMin.value;
  if ("statMax" in cond) return (state.stats[cond.statMax.stat] ?? 0) <= cond.statMax.value;
  if ("relMin" in cond) return (state.relationships[cond.relMin.char] ?? 0) >= cond.relMin.value;
  if ("relMax" in cond) return (state.relationships[cond.relMax.char] ?? 0) <= cond.relMax.value;
  if ("charAlive" in cond) return state.characterStates[cond.charAlive] === "alive";
  if ("charDead" in cond) return state.characterStates[cond.charDead] === "dead";
  if ("charState" in cond) return state.characterStates[cond.charState.char] === cond.charState.state;
  if ("hasRelic" in cond) return state.relics.includes(cond.hasRelic);
  if ("all" in cond) return cond.all.every((c) => evalCondition(c, state));
  if ("any" in cond) return cond.any.some((c) => evalCondition(c, state));
  return true;
}

export function applyEffects(
  effects: EffectOp[] | undefined,
  state: StoryCampaignSave,
  chapterId: string
): string[] {
  const notices: string[] = [];
  if (!Array.isArray(effects)) return notices;

  for (const ef of effects) {
    if ("setFlag" in ef) {
      state.flags[ef.setFlag] = true;
    } else if ("clearFlag" in ef) {
      delete state.flags[ef.clearFlag];
    } else if ("addStat" in ef) {
      const { stat, delta } = ef.addStat;
      const meta = STORY_STATS_META[stat];
      if (meta) {
        state.stats[stat] = Math.max(meta.min, Math.min(meta.max, (state.stats[stat] ?? meta.initial) + delta));
        if (delta !== 0) {
          notices.push(`${meta.label} ${delta > 0 ? "+" : ""}${delta}`);
        }
      }
    } else if ("addRel" in ef) {
      const { char, delta } = ef.addRel;
      const meta = STORY_RELATIONSHIPS_META[char as keyof typeof STORY_RELATIONSHIPS_META];
      if (meta) {
        state.relationships[char] = Math.max(meta.min, Math.min(meta.max, (state.relationships[char] ?? meta.initial) + delta));
        if (delta !== 0) {
          notices.push(`Tin cậy ${meta.label} ${delta > 0 ? "+" : ""}${delta}`);
        }
      }
    } else if ("setCharState" in ef) {
      const { char, state: nextCharState } = ef.setCharState;
      state.characterStates[char] = nextCharState;
      const info = STORY_CHARACTERS_META[char];
      if (info) {
        notices.push(`${info.displayName}: cập nhật trạng thái`);
      }
    } else if ("unlockRelic" in ef) {
      if (!state.relics.includes(ef.unlockRelic)) {
        state.relics.push(ef.unlockRelic);
        notices.push(`Kỷ vật mới`);
      }
    } else if ("addJournal" in ef) {
      if (!state.journal.some((j) => j.id === ef.addJournal.id)) {
        state.journal.unshift({
          id: ef.addJournal.id,
          chapterId,
          title: ef.addJournal.title,
          entry: ef.addJournal.entry,
        });
        notices.push(`Ghi sổ: ${ef.addJournal.title}`);
      }
    }
  }

  return notices;
}

export function resolveNextNodeId(node: StoryNode, state: StoryCampaignSave): string | null {
  if (Array.isArray(node.branches)) {
    for (const br of node.branches) {
      if (evalCondition(br.condition, state)) {
        return br.next;
      }
    }
  }
  return node.next ?? null;
}

export function recordNodeVisit(save: StoryCampaignSave, chapterId: string, node: StoryNode): string[] {
  const notices = applyEffects(node.effects, save, chapterId);
  const last = save.history[save.history.length - 1];
  if (!last || last.kind !== "node" || last.nodeId !== node.id) {
    save.history.push({ kind: "node", nodeId: node.id });
  }
  if (!save.visitedNodeIds.includes(node.id)) {
    save.visitedNodeIds.push(node.id);
  }
  if (node.isChapterEnd && !save.completedChapterIds.includes(chapterId)) {
    save.completedChapterIds.push(chapterId);
  }
  if (node.type === "ending") {
    if (!save.completedChapterIds.includes(chapterId)) {
      save.completedChapterIds.push(chapterId);
    }
    const endId = node.endingId || node.id;
    if (!save.unlockedEndingIds.includes(endId)) {
      save.unlockedEndingIds.push(endId);
    }
  }
  return notices;
}

export function advanceLinearNode(
  save: StoryCampaignSave,
  chapter: StoryChapter,
  nodeMap: Map<string, StoryNode>
): { nextSave: StoryCampaignSave; notices: string[] } {
  const nextSave = deepClone(save);
  const current = nodeMap.get(nextSave.currentNodeId);
  if (!current || current.type === "choice" || current.type === "ending" || current.isChapterEnd) {
    return { nextSave, notices: [] };
  }
  const nextId = resolveNextNodeId(current, nextSave);
  if (!nextId) return { nextSave, notices: [] };
  const nextNode = nodeMap.get(nextId);
  if (!nextNode) return { nextSave, notices: [] };

  nextSave.currentNodeId = nextId;
  const notices = recordNodeVisit(nextSave, chapter.id, nextNode);
  return { nextSave, notices };
}

export function applyChoiceToSave(
  save: StoryCampaignSave,
  chapter: StoryChapter,
  nodeMap: Map<string, StoryNode>,
  choice: StoryChoice
): { nextSave: StoryCampaignSave; notices: string[] } {
  const nextSave = deepClone(save);
  const current = nodeMap.get(nextSave.currentNodeId);
  if (!current) return { nextSave, notices: [] };

  const snapshot = captureSnapshot(nextSave);
  const preview = current.text.slice(0, 90) + (current.text.length > 90 ? "..." : "");
  const existingIdx = nextSave.checkpoints.findIndex((cp) => cp.nodeId === current.id && cp.chapterId === chapter.id);
  const cpEntry = {
    nodeId: current.id,
    chapterId: chapter.id,
    promptPreview: preview,
    chosenLabel: choice.label,
    snapshot,
  };
  if (existingIdx >= 0) {
    nextSave.checkpoints[existingIdx] = cpEntry;
  } else {
    nextSave.checkpoints.push(cpEntry);
  }

  const notices = applyEffects(choice.effects, nextSave, chapter.id);
  nextSave.history.push({ kind: "picked", label: choice.label });

  const nextNode = nodeMap.get(choice.next);
  if (nextNode) {
    nextSave.currentNodeId = nextNode.id;
    notices.push(...recordNodeVisit(nextSave, chapter.id, nextNode));
  }

  return { nextSave, notices };
}

export function transitionToNextChapter(
  save: StoryCampaignSave,
  nextChapter: StoryChapter
): { nextSave: StoryCampaignSave; notices: string[] } {
  const nextSave = deepClone(save);
  nextSave.currentChapterId = nextChapter.id;
  nextSave.currentNodeId = nextChapter.entryNodeId;
  nextSave.history = [];
  // Keep checkpoints across chapters (capped safely in storage) so player can jump back
  const entry = nextChapter.nodes.find((n) => n.id === nextChapter.entryNodeId);
  nextSave.chapterStartSnapshots[nextChapter.id] = captureSnapshot(nextSave);
  const notices = entry ? recordNodeVisit(nextSave, nextChapter.id, entry) : [];
  return { nextSave, notices };
}

export function startChapterCleanOrFromSnapshot(
  save: StoryCampaignSave,
  targetChapter: StoryChapter,
  useSavedSnapshot: boolean
): StoryCampaignSave {
  const nextSave = deepClone(save);
  const snap = useSavedSnapshot ? nextSave.chapterStartSnapshots[targetChapter.id] : undefined;

  if (snap) {
    nextSave.currentChapterId = targetChapter.id;
    nextSave.currentNodeId = targetChapter.entryNodeId;
    nextSave.stats = deepClone(snap.stats);
    nextSave.relationships = deepClone(snap.relationships);
    nextSave.characterStates = deepClone(snap.characterStates);
    nextSave.flags = deepClone(snap.flags);
    nextSave.relics = deepClone(snap.relics);
    nextSave.journal = deepClone(snap.journal);
    nextSave.history = [];
  } else {
    nextSave.currentChapterId = targetChapter.id;
    nextSave.currentNodeId = targetChapter.entryNodeId;
    nextSave.stats = createInitialStats();
    nextSave.relationships = createInitialRelationships();
    nextSave.characterStates = createInitialCharStates();
    nextSave.flags = {};
    nextSave.relics = targetChapter.chapterNumber > 1 ? ["so_bia_xanh"] : [];
    nextSave.journal = [];
    nextSave.history = [];
    if (targetChapter.chapterNumber === 1) {
      nextSave.checkpoints = [];
    }
  }

  const entry = targetChapter.nodes.find((n) => n.id === targetChapter.entryNodeId);
  if (entry) {
    recordNodeVisit(nextSave, targetChapter.id, entry);
  }
  return nextSave;
}

export function restoreCheckpointInSave(
  save: StoryCampaignSave,
  checkpointIndex: number
): StoryCampaignSave {
  const cp = save.checkpoints[checkpointIndex];
  if (!cp) return save;
  const nextSave = deepClone(save);
  const snap = deepClone(cp.snapshot);
  nextSave.currentChapterId = snap.chapterId;
  nextSave.currentNodeId = snap.currentNodeId;
  nextSave.stats = snap.stats;
  nextSave.relationships = snap.relationships;
  nextSave.characterStates = snap.characterStates;
  nextSave.flags = snap.flags;
  nextSave.relics = snap.relics;
  nextSave.journal = snap.journal;
  nextSave.history = snap.history;
  nextSave.checkpoints = nextSave.checkpoints.slice(0, checkpointIndex);
  return nextSave;
}
