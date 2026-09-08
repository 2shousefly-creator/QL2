import { BALANCE, clamp } from "../config";
import { CLASSES, ITEMS, WEAPONS } from "../content/equipment";
import { STAGES } from "../content/stages";
import type {
  ArmyProfile,
  ItemId,
  Loadout,
  Receipt,
  RunResult,
  RunTicket,
} from "../types";
export function defaultProfile(): ArmyProfile {
  return {
    version: 1,
    xp: 0,
    coins: 100,
    upgrade: 0,
    loadout: {
      classId: "gunner",
      weaponId: "standard",
      items: ["heal", "shield", "boost"],
      cosmetic: "olive",
    },
    inventory: Object.fromEntries(
      ITEMS.map((i) => [
        i.id,
        ["heal", "shield", "boost"].includes(i.id) ? 3 : 0,
      ]),
    ) as Record<ItemId, number>,
    records: {},
    nextRun: 1,
    activeRun: null,
    receipt: null,
    rewards: { date: "", gold: 0, xp: 0 },
    tutorialDone: false,
    settings: {
      volume: 0.45,
      reducedMotion: false,
      quality: "high",
      aimAssist: true,
      difficulty: "normal",
    },
  };
}
export const clears = (p: ArmyProfile) =>
  STAGES.filter((s) => p.records[s.id]?.clears > 0).length;
export const level = (p: ArmyProfile) =>
  Math.min(BALANCE.maxLevel, 1 + Math.floor(p.xp / BALANCE.xpPerLevel));
export function stageUnlocked(p: ArmyProfile, id: string) {
  const index = STAGES.findIndex((s) => s.id === id);
  return (
    index === 0 ||
    (index > 0 && Boolean(p.records[STAGES[index - 1].id]?.clears))
  );
}
export function loadoutValid(p: ArmyProfile, l: Loadout): boolean {
  const count = clears(p),
    c = CLASSES.find((c) => c.id === l.classId),
    w = WEAPONS.find((w) => w.id === l.weaponId);
  return Boolean(
    c &&
      w &&
      c.unlock <= count &&
      w.unlock <= count &&
      ["olive", "steel", "amber"].includes(l.cosmetic) &&
      l.items.length <= BALANCE.itemSlots &&
      new Set(l.items).size === l.items.length &&
      l.items.every((id) =>
        ITEMS.some((i) => i.id === id && i.unlock <= count),
      ),
  );
}
export function equip(p: ArmyProfile, l: Loadout): boolean {
  if (p.activeRun || !loadoutValid(p, l)) return false;
  p.loadout = structuredClone(l);
  return true;
}
export function buyItem(p: ArmyProfile, id: ItemId): boolean {
  const item = ITEMS.find((i) => i.id === id);
  if (
    p.activeRun ||
    !item ||
    clears(p) < item.unlock ||
    p.coins < item.cost ||
    p.inventory[id] >= BALANCE.itemStack
  )
    return false;
  p.coins -= item.cost;
  p.inventory[id]++;
  return true;
}
export function upgrade(p: ArmyProfile): boolean {
  const cost = BALANCE.upgradeCost * (p.upgrade + 1);
  if (p.activeRun || p.upgrade >= BALANCE.maxUpgrade || p.coins < cost)
    return false;
  p.coins -= cost;
  p.upgrade++;
  return true;
}
export function makeTicket(
  p: ArmyProfile,
  stageId: string,
  playerId: string,
  seed: number,
  now: number,
): RunTicket | null {
  if (p.activeRun || !stageUnlocked(p, stageId) || !loadoutValid(p, p.loadout))
    return null;
  return {
    id: `${playerId}:army:${p.nextRun}`,
    sequence: p.nextRun,
    stageId,
    seed: seed >>> 0 || 1234567,
    loadout: {
      ...structuredClone(p.loadout),
      items: p.loadout.items.filter((id) => p.inventory[id] > 0),
    },
    upgrade: p.upgrade,
    level: level(p),
    startedAt: now,
  };
}
export function reserveRun(p: ArmyProfile, t: RunTicket): boolean {
  if (
    p.activeRun ||
    t.sequence !== p.nextRun ||
    !stageUnlocked(p, t.stageId) ||
    !loadoutValid(p, t.loadout) ||
    t.loadout.items.some((id) => p.inventory[id] < 1)
  )
    return false;
  for (const id of t.loadout.items) p.inventory[id]--;
  p.activeRun = structuredClone(t);
  p.nextRun++;
  p.receipt = null;
  return true;
}
export function settleInternal(
  p: ArmyProfile,
  result: RunResult,
): Receipt | null {
  if (
    !p.activeRun ||
    p.activeRun.id !== result.runId ||
    p.activeRun.stageId !== result.stageId
  )
    return null;
  const stage = STAGES.find((s) => s.id === result.stageId);
  if (
    !stage ||
    !Number.isFinite(result.rounds + result.hpRatio) ||
    result.rounds < 1 ||
    result.rounds > stage.maxRounds + 1
  )
    return null;
  const first = result.won && !p.records[stage.id]?.clears;
  const stars = result.won
    ? 1 + (result.rounds <= stage.par ? 1 : 0) + (result.hpRatio >= 0.5 ? 1 : 0)
    : 0;
  const receipt: Receipt = {
    ...result,
    first,
    stars,
    coins: result.won ? (first ? BALANCE.firstCoins : BALANCE.replayCoins) : 0,
    xp: result.won ? (first ? BALANCE.firstXp : BALANCE.replayXp) : 0,
    gold: 0,
    sharedXp: 0,
  };
  if (result.won) {
    const record = p.records[stage.id];
    p.records[stage.id] = {
      stars: Math.max(record?.stars ?? 0, stars),
      clears: Math.min(999999, (record?.clears ?? 0) + 1),
      bestRounds: Math.min(record?.bestRounds ?? Infinity, result.rounds),
    };
    receipt.coins = Math.min(999999 - p.coins, receipt.coins);
    receipt.xp = Math.min(
      BALANCE.xpPerLevel * (BALANCE.maxLevel - 1) - p.xp,
      receipt.xp,
    );
    p.coins += receipt.coins;
    p.xp += receipt.xp;
    if (stage.tutorial) p.tutorialDone = true;
  }
  p.activeRun = null;
  p.receipt = receipt;
  return receipt;
}
const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
const integer = (v: unknown, max: number, fallback = 0) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.floor(clamp(v, 0, max))
    : fallback;
/** Additive optional save field. Unknown future versions are preserved and blocked in the shell. */
export function sanitizeArmyProfile(raw: unknown): ArmyProfile | undefined {
  if (raw === undefined || raw === null) return undefined;
  const r = record(raw);
  if (typeof r.version === "number" && r.version > 1) return raw as ArmyProfile;
  const p = defaultProfile();
  p.xp = integer(r.xp, 2520);
  p.coins = integer(r.coins, 999999, 100);
  p.upgrade = integer(r.upgrade, 3);
  const inventory = record(r.inventory);
  for (const item of ITEMS)
    p.inventory[item.id] = integer(
      inventory[item.id],
      BALANCE.itemStack,
      p.inventory[item.id],
    );
  const records = record(r.records);
  for (const stage of STAGES) {
    const s = record(records[stage.id]);
    if (integer(s.clears, 999999) > 0)
      p.records[stage.id] = {
        stars: Math.max(1, integer(s.stars, 3)),
        clears: integer(s.clears, 999999),
        bestRounds: Math.max(
          1,
          integer(s.bestRounds, stage.maxRounds, stage.maxRounds),
        ),
      };
  }
  const l = record(r.loadout);
  const candidate: Loadout = {
    classId: l.classId as Loadout["classId"],
    weaponId: l.weaponId as Loadout["weaponId"],
    cosmetic: l.cosmetic as Loadout["cosmetic"],
    items: Array.isArray(l.items)
      ? l.items
          .filter(
            (v): v is ItemId =>
              typeof v === "string" && ITEMS.some((i) => i.id === v),
          )
          .slice(0, 3)
      : [],
  };
  if (loadoutValid(p, candidate)) p.loadout = candidate;
  p.nextRun = Math.max(1, integer(r.nextRun, Number.MAX_SAFE_INTEGER - 1, 1));
  p.tutorialDone = r.tutorialDone === true;
  const settings = record(r.settings);
  p.settings = {
    volume:
      typeof settings.volume === "number" ? clamp(settings.volume, 0, 1) : 0.45,
    reducedMotion: settings.reducedMotion === true,
    quality: settings.quality === "low" ? "low" : "high",
    aimAssist: settings.aimAssist !== false,
    difficulty: ["easy", "hard"].includes(String(settings.difficulty))
      ? (settings.difficulty as "easy" | "hard")
      : "normal",
  };
  const rewards = record(r.rewards);
  p.rewards = {
    date: typeof rewards.date === "string" ? rewards.date.slice(0, 10) : "",
    gold: integer(rewards.gold, BALANCE.dailyGoldCap),
    xp: integer(rewards.xp, BALANCE.dailyXpCap),
  };
  // Interrupted runs remain reserved for explicit abandonment, never replayed on reload.
  const active = record(r.activeRun);
  if (
    typeof active.id === "string" &&
    active.id.length < 180 &&
    STAGES.some((s) => s.id === active.stageId) &&
    typeof active.sequence === "number"
  ) {
    const seq = integer(active.sequence, Number.MAX_SAFE_INTEGER - 2);
    p.activeRun = {
      id: active.id,
      sequence: seq,
      stageId: String(active.stageId),
      seed: integer(active.seed, 4294967295, 1234567),
      loadout: structuredClone(p.loadout),
      upgrade: p.upgrade,
      level: level(p),
      startedAt: integer(active.startedAt, Number.MAX_SAFE_INTEGER),
    };
    p.nextRun = Math.max(p.nextRun, seq + 1);
  }
  // Receipt is presentation-only. A fresh load does not replay settlement.
  return p;
}
