import type { StoryCampaignSave } from "./storyTypes";
import { STORY_CHARACTERS_META, STORY_RELATIONSHIPS_META } from "./storyVariables";

export const STORY_STORAGE_KEY = "quan_lo_story_campaign_v1";
const MAX_CHECKPOINTS_STORED = 48;

const LEGACY_CHAPTER_ID_MAP: Record<string, string> = {
  ch1_khoi_dau: "ch1_ep1",
  ch2_binh_si: "ch2_ep1",
  ch3_ha_si_quan: "ch3_ep1",
  ch4_cap_uy: "ch4_ep1",
  ch5_cap_ta: "ch5_ep1",
  ch6_cap_tuong: "ch6_ep1",
  ch7_tu_tinh_thu_ho: "ch7_ep1",
  ch8_chi_huy_toi_thuong: "ch8_ep1",
};

function migrateSaveIfNeeded(parsed: StoryCampaignSave): StoryCampaignSave {
  let next = parsed;
  if (LEGACY_CHAPTER_ID_MAP[next.currentChapterId]) {
    const mappedId = LEGACY_CHAPTER_ID_MAP[next.currentChapterId];
    next = {
      ...next,
      currentChapterId: mappedId,
      currentNodeId: `${mappedId}_01`,
      history: [],
    };
  }

  // Backfill newly introduced character states & relationships cleanly
  const characterStates = { ...next.characterStates };
  for (const [charId, def] of Object.entries(STORY_CHARACTERS_META)) {
    if (!characterStates[charId as keyof typeof characterStates]) {
      characterStates[charId as keyof typeof characterStates] = def.initialState;
    }
  }

  const relationships = { ...next.relationships };
  for (const [relId, def] of Object.entries(STORY_RELATIONSHIPS_META)) {
    if (typeof relationships[relId as keyof typeof relationships] !== "number") {
      relationships[relId as keyof typeof relationships] = def.initial;
    }
  }

  return {
    ...next,
    schemaVersion: 2,
    characterStates,
    relationships,
  };
}

export function loadStoryCampaignSave(): StoryCampaignSave | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoryCampaignSave;
    if (!parsed || typeof parsed !== "object" || !parsed.currentChapterId || !parsed.currentNodeId) {
      return null;
    }
    return migrateSaveIfNeeded(parsed);
  } catch {
    return null;
  }
}

export function saveStoryCampaignSave(save: StoryCampaignSave): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const compact: StoryCampaignSave =
      save.checkpoints.length > MAX_CHECKPOINTS_STORED
        ? { ...save, checkpoints: save.checkpoints.slice(-MAX_CHECKPOINTS_STORED) }
        : save;
    window.localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(compact));
  } catch {
    try {
      const trimmed: StoryCampaignSave = {
        ...save,
        checkpoints: save.checkpoints.slice(-12),
      };
      window.localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Ignore storage failure cleanly
    }
  }
}

export function clearStoryCampaignSave(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORY_STORAGE_KEY);
  } catch {
    // Ignore storage error
  }
}
