import type { CombatWorld } from "./airCombatRuntime";
import type { CombatAnnouncement } from "./airCombatTypes";

export const COMBAT_NOTICE_DURATION_MS = 3000;
export function createCombatNotice(serial: number, text: string): CombatAnnouncement {
  return { serial, text, durationMs: COMBAT_NOTICE_DURATION_MS, expiresAtMs: performance.now() + COMBAT_NOTICE_DURATION_MS };
}
/** Presentation deadline uses wall time, so pause/occlusion never prolong a notice. */
export function publishCombatNotice(world: CombatWorld, text: string): void {
  world.latestMessage = text;
  world.messageUntil = world.elapsed + COMBAT_NOTICE_DURATION_MS / 1000;
  world.announcement = createCombatNotice(world.announcement.serial + 1, text);
}
