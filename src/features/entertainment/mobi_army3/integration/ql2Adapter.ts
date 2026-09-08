import type { GameState } from "../../../../game/types";
import { gameConfig } from "../../../../game/config";
import { applyEarnedXpCapped } from "../../../../game/xpEngine";
import { createDefaultFarmState } from "../../../tang_gia/farmMigration";
import { BALANCE } from "../config";
import { defaultProfile, settleInternal } from "../profile/profileEngine";
import type { ArmyProfile, RunResult } from "../types";
export type UpdateGameState = (
  updater: ((draft: GameState) => void) | GameState,
) => void;
export function withProfile(draft: GameState, edit: (p: ArmyProfile) => void) {
  if (draft.mobiArmy3 && draft.mobiArmy3.version !== 1) return;
  draft.mobiArmy3 ??= defaultProfile();
  edit(draft.mobiArmy3);
}
/** One latest-state draft contains both the receipt and all currency changes. No stale whole-state replacement. */
export function settleArmyRun(
  draft: GameState,
  result: RunResult,
  date: string,
) {
  withProfile(draft, (p) => {
    const receipt = settleInternal(p, result);
    if (!receipt || !receipt.won) return;
    if (date > p.rewards.date) p.rewards = { date, gold: 0, xp: 0 };
    // Clock rollback cannot reopen the daily budget.
    if (date !== p.rewards.date) return;
    receipt.gold = Math.max(
      0,
      Math.min(BALANCE.sharedGold, BALANCE.dailyGoldCap - p.rewards.gold),
    );
    const requestedXp = Math.max(
      0,
      Math.min(BALANCE.sharedXp, BALANCE.dailyXpCap - p.rewards.xp),
    );
    draft.farm ??= createDefaultFarmState();
    draft.farm.gold += receipt.gold;
    const credited = applyEarnedXpCapped(
      draft,
      requestedXp * gameConfig.xpTicksPerXp,
    ).creditedTicks;
    receipt.sharedXp = credited / gameConfig.xpTicksPerXp;
    p.rewards.gold += receipt.gold;
    p.rewards.xp += requestedXp;
    // No tactical time or parallel XP accounting: applyEarnedXpCapped owns rank limits.
  });
}
export function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
