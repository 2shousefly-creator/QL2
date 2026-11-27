import type { StoryCampaignSave } from "./storyTypes";

export const STORY_STORAGE_KEY = "quan_lo_story_campaign_v1";
const MAX_CHECKPOINTS_STORED = 48;

export function loadStoryCampaignSave(): StoryCampaignSave | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoryCampaignSave;
    if (!parsed || typeof parsed !== "object" || !parsed.currentChapterId || !parsed.currentNodeId) {
      return null;
    }
    return parsed;
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
    // Fallback compaction if localStorage quota is tight
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
