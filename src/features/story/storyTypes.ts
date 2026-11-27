export type StatId =
  | "SiKhi"
  | "KyLuat"
  | "TinhDongDoi"
  | "TiepTe"
  | "NhanTamDan";

export type CharacterId =
  | "player"
  | "khang"
  | "vinh"
  | "nam"
  | "loc"
  | "quang"
  | "bay"
  | "linh"
  | "dung"
  | "gia_lang"
  | "son"
  | "tam"
  | "thao"
  | "ha"
  | "hung"
  | "hac_ung";

export type CharacterState =
  | "alive"
  | "injured"
  | "dead"
  | "discharged"
  | "estranged"
  | "rival";

export type RelicId =
  | "so_bia_xanh"
  | "bang_morse_linh"
  | "dong_ho_nut"
  | "bat_lua_khang"
  | "ho_so_mat_thao"
  | "ban_do_thien_lang";

export type StoryNodeType =
  | "narration"
  | "dialogue"
  | "dispatch"
  | "choice"
  | "ending";

export type ConditionExpr =
  | { flag: string }
  | { notFlag: string }
  | { statMin: { stat: StatId; value: number } }
  | { statMax: { stat: StatId; value: number } }
  | { relMin: { char: CharacterId; value: number } }
  | { relMax: { char: CharacterId; value: number } }
  | { charAlive: CharacterId }
  | { charDead: CharacterId }
  | { charState: { char: CharacterId; state: CharacterState } }
  | { hasRelic: RelicId }
  | { all: ConditionExpr[] }
  | { any: ConditionExpr[] };

export type EffectOp =
  | { setFlag: string }
  | { clearFlag: string }
  | { addStat: { stat: StatId; delta: number } }
  | { addRel: { char: CharacterId; delta: number } }
  | { setCharState: { char: CharacterId; state: CharacterState } }
  | { unlockRelic: RelicId }
  | {
      addJournal: {
        id: string;
        title: string;
        entry: string;
      };
    };

export interface StoryChoice {
  id: string;
  label: string;
  hint?: string;
  condition?: ConditionExpr;
  effects?: EffectOp[];
  next: string;
}

export interface StoryBranchRule {
  condition: ConditionExpr;
  next: string;
}

export interface StoryNode {
  id: string;
  type: StoryNodeType;
  location?: string;
  speaker?: CharacterId;
  speakerTitle?: string;
  mood?: "calm" | "tense" | "urgent" | "somber" | "warm";
  text: string;
  condition?: ConditionExpr;
  effects?: EffectOp[];
  next?: string;
  branches?: StoryBranchRule[];
  choices?: StoryChoice[];
  timedSeconds?: number;
  timeoutChoiceId?: string;
  isChapterEnd?: boolean;
  endingId?: string;
  endingTitle?: string;
}

export interface StoryChapter {
  id: string;
  episodeOrder?: number;
  chapterNumber: number;
  title: string;
  ql2ChapterId:
    | "beginning"
    | "soldier"
    | "nco"
    | "company_officer"
    | "field_officer"
    | "general"
    | "supreme_command"
    | "supreme_sovereign";
  rankRange: string;
  entryNodeId: string;
  nextChapterId?: string;
  summary: string;
  initialDeadCharacters?: CharacterId[];
  nodes: StoryNode[];
}

export interface StoryHistoryItem {
  kind: "node" | "picked";
  nodeId?: string;
  label?: string;
}

export interface StoryJournalEntry {
  id: string;
  chapterId: string;
  title: string;
  entry: string;
}

export interface StoryRunSnapshot {
  chapterId: string;
  currentNodeId: string;
  stats: Record<StatId, number>;
  relationships: Record<CharacterId, number>;
  characterStates: Record<CharacterId, CharacterState>;
  flags: Record<string, boolean>;
  relics: RelicId[];
  journal: StoryJournalEntry[];
  history: StoryHistoryItem[];
}

export interface StoryCheckpoint {
  nodeId: string;
  chapterId: string;
  promptPreview: string;
  chosenLabel: string;
  snapshot: StoryRunSnapshot;
}

export interface StoryCampaignSave {
  schemaVersion: number;
  currentChapterId: string;
  currentNodeId: string;
  stats: Record<StatId, number>;
  relationships: Record<CharacterId, number>;
  characterStates: Record<CharacterId, CharacterState>;
  flags: Record<string, boolean>;
  relics: RelicId[];
  journal: StoryJournalEntry[];
  history: StoryHistoryItem[];
  checkpoints: StoryCheckpoint[];
  chapterStartSnapshots: Record<string, StoryRunSnapshot>;
  completedChapterIds: string[];
  unlockedEndingIds: string[];
  visitedNodeIds: string[];
  showStatsAndHints: boolean;
  timerEnabled: boolean;
  freeExploreUnlocked: boolean;
}

export interface StoryEpisodeMeta {
  id: string;
  episodeOrder: number;
  chapterNumber: number;
  title: string;
  shortTitle: string;
  rankRange: string;
  summary: string;
  estimatedWords: number;
  estimatedMinutes: number;
  nextChapterId?: string;
}

export interface StoryChapterGroup {
  chapterNumber: number;
  title: string;
  rankRange: string;
  summary: string;
  episodeIds: string[];
}

export interface StoryEndingMeta {
  id: string;
  title: string;
  tag: string;
  summary: string;
}
