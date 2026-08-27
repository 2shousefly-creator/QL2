import {
  getLocalRewardDateKey,
  loadAirCombatProfile,
  saveAirCombatProfile,
} from "./airCombatStorage";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`✓ ${message}`);
}

const values = new Map<string, string>();
const localStorage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
  removeItem: (key: string) => values.delete(key),
  clear: () => values.clear(),
  key: (index: number) => [...values.keys()][index] ?? null,
  get length() { return values.size; },
};

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { localStorage },
});

console.log("=== AIR COMBAT STORAGE MIGRATION TESTS ===\n");

values.set("quan_lo_air_combat_v1", JSON.stringify({
  version: 1,
  highScore: 12_345,
  highestCombo: 18,
  totalRuns: 7,
  bossClears: 2,
  lastRewardDate: "2026-08-18",
  rewardedRunsToday: 3,
  goldRewardedToday: 9,
  xpRewardedToday: 6,
}));
const migrated = loadAirCombatProfile();
assert(migrated.version === 2, "legacy v1 save migrates to profile v2 in place");
assert(migrated.highScore === 12_345 && migrated.highestCombo === 18, "migration preserves score and combo history");
assert(migrated.totalRuns === 7 && migrated.bossClears === 2, "migration preserves run and Boss history");
assert(migrated.bestRank === "C" && migrated.bestBossClearSeconds === null, "new rank and Boss-time fields receive safe defaults");
assert(migrated.preferredAircraft === "black_eagle", "legacy aircraft selection maps to a valid new aircraft");
assert(migrated.goldRewardedToday === 9 && migrated.xpRewardedToday === 6, "migration preserves daily reward counters");

const saved = {
  ...migrated,
  bestRank: "S" as const,
  bestBossClearSeconds: 73.25,
  preferredAircraft: "phantom" as const,
};
saveAirCombatProfile(saved);
const reloaded = loadAirCombatProfile();
assert(reloaded.bestRank === "S" && reloaded.bestBossClearSeconds === 73.25, "v2 rank and Boss time persist across reload");
assert(reloaded.preferredAircraft === "phantom", "preferred new aircraft persists across reload");

values.set("quan_lo_air_combat_v1", "{broken-json");
const recovered = loadAirCombatProfile();
assert(recovered.version === 2 && recovered.highScore === 0, "corrupt local save falls back without blocking the game");
assert(getLocalRewardDateKey(new Date(2026, 7, 9)) === "2026-08-09", "daily reward key uses stable local YYYY-MM-DD format");

console.log("\nALL AIR COMBAT STORAGE MIGRATION TESTS PASSED");
