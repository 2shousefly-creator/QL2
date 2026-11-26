import { RANK_FAMILIES } from "./rankFamilies";
import { PROMOTION_TRANSITION_STORIES } from "./promotionStories";
import { RANK_STEP_STORIES } from "./rankStories";
import { RankStep } from "./types";

export function buildRankSteps(): RankStep[] {
  return RANK_FAMILIES.map((family, rankIndex) => ({
    id: `rank_${rankIndex}`, rankIndex, ordinal: rankIndex + 1,
    familyId: family.id, familyName: family.name, tier: null, tierCount: 1,
    displayName: family.name, shortName: family.name, storyId: `story_${rankIndex}`,
  }));
}

export const RANK_STEPS: RankStep[] = buildRankSteps();

export function validateRankCatalog(): boolean {
  if (RANK_FAMILIES.length !== 24) {
    throw new Error(`Expected 24 RankFamilies, got ${RANK_FAMILIES.length}`);
  }

  if (RANK_STEPS.length !== 24) {
    throw new Error(`Expected 24 RankSteps, got ${RANK_STEPS.length}`);
  }

  if (RANK_STEPS[0].displayName !== "Học Viên") {
    throw new Error(`First rank must be Học Viên, got ${RANK_STEPS[0].displayName}`);
  }

  if (RANK_STEPS[23].displayName !== "Tổng Tư Lệnh") {
    throw new Error(`Last rank must be Tổng Tư Lệnh, got ${RANK_STEPS[23].displayName}`);
  }

  // Check unique IDs and ordinals
  const ids = new Set<string>();
  const ordinals = new Set<number>();

  for (let i = 0; i < RANK_STEPS.length; i++) {
    const step = RANK_STEPS[i];
    if (step.rankIndex !== i) {
      throw new Error(`Mismatched rankIndex at position ${i}: step has ${step.rankIndex}`);
    }
    if (step.ordinal !== i + 1) {
      throw new Error(`Mismatched ordinal at position ${i}: step has ${step.ordinal}`);
    }
    if (ids.has(step.id)) {
      throw new Error(`Duplicate rank step ID: ${step.id}`);
    }
    if (ordinals.has(step.ordinal)) {
      throw new Error(`Duplicate ordinal: ${step.ordinal}`);
    }
    ids.add(step.id);
    ordinals.add(step.ordinal);
  }

  // Check badge definition constraints (no tier inside badge)
  for (const family of RANK_FAMILIES) {
    const badge = family.badge;
    if ("tier" in badge || "tierCount" in badge || "currentTier" in badge) {
      throw new Error(`BadgeDefinition for family ${family.id} contains prohibited tier fields`);
    }
  }

  return true;
}

export function validateRankStories(): boolean {
  if (RANK_STEP_STORIES.length !== 24) {
    throw new Error(`Expected 24 RankStep stories, got ${RANK_STEP_STORIES.length}`);
  }

  for (let i = 0; i < 24; i++) {
    const story = RANK_STEP_STORIES[i];
    if (story.rankIndex !== i) {
      throw new Error(`Story index mismatch at ${i}, got ${story.rankIndex}`);
    }
  }

  // Every promotion has a transition story.
  const keys = Object.keys(PROMOTION_TRANSITION_STORIES);
  if (keys.length !== RANK_STEPS.length - 1) {
    throw new Error(`Expected 23 promotion transition stories, got ${keys.length}`);
  }

  return true;
}

// Run validation immediately
validateRankCatalog();
validateRankStories();
