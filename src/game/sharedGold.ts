import type { GameState } from "./types";
import { createDefaultFarmState } from "../features/tang_gia/farmEngine";

export type SharedGoldState = Pick<GameState, "farm">;

function normalizeGold(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.floor(numeric));
}

/** farm.gold is the only persisted and gameplay-facing Gold balance. */
export function getSharedGold(state: SharedGoldState): number {
  return normalizeGold(state.farm?.gold);
}

export function setSharedGold(draft: SharedGoldState, amount: number): number {
  const nextGold = normalizeGold(amount);
  if (!draft.farm) {
    draft.farm = createDefaultFarmState();
  }
  draft.farm.gold = nextGold;
  if (draft.farm.inventory && "gold" in draft.farm.inventory) {
    delete (draft.farm.inventory as typeof draft.farm.inventory & {
      gold?: number;
    }).gold;
  }
  return nextGold;
}

export function canAffordSharedGold(state: SharedGoldState, amount: number): boolean {
  if (!Number.isFinite(amount) || amount < 0 || !Number.isInteger(amount)) return false;
  return getSharedGold(state) >= amount;
}

/** Call from the latest functional GameState draft for an atomic debit. */
export function spendSharedGold(draft: SharedGoldState, amount: number): boolean {
  if (!canAffordSharedGold(draft, amount)) return false;
  setSharedGold(draft, getSharedGold(draft) - amount);
  return true;
}

/** Call from the latest functional GameState draft for an atomic credit. */
export function creditSharedGold(draft: SharedGoldState, amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return setSharedGold(draft, getSharedGold(draft));
  return setSharedGold(draft, getSharedGold(draft) + Math.floor(amount));
}
