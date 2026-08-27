import {
  getTankBattleRewardDateKey,
  loadTankBattleProfile,
  saveTankBattleProfile,
} from "./tankBattleStorage";

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

console.log("=== TANK BATTLE STORAGE TESTS ===\n");

values.set("quan_lo_tank_battle_v1", JSON.stringify({
  version: 1,
  highScore: 12_500,
  bestRank: "S",
  bestBossClearSeconds: 74.2,
  bestAccuracy: 0.81,
  totalRuns: 8,
  bossClears: 3,
  tutorialSeen: true,
  aimAssistEnabled: false,
  lastRewardDate: "2026-08-18",
  rewardedRunsToday: 2,
  goldRewardedToday: 8,
  xpRewardedToday: 5,
}));
const loaded = loadTankBattleProfile();
assert(loaded.highScore === 12_500 && loaded.bestRank === "S", "score and rank persist locally");
assert(loaded.bestBossClearSeconds === 74.2 && loaded.bestAccuracy === 0.81, "Boss time and accuracy persist locally");
assert(loaded.tutorialSeen && !loaded.aimAssistEnabled, "tutorial/settings persist without leaking run state");

saveTankBattleProfile({ ...loaded, highScore: 14_000, bestRank: "SS" });
const reloaded = loadTankBattleProfile();
assert(reloaded.highScore === 14_000 && reloaded.bestRank === "SS", "updated profile survives save/reload");

values.set("quan_lo_tank_battle_v1", "{broken");
const recovered = loadTankBattleProfile();
assert(recovered.version === 1 && recovered.highScore === 0, "corrupt local save falls back safely");
assert(getTankBattleRewardDateKey(new Date(2026, 7, 9)) === "2026-08-09", "daily reward date uses local YYYY-MM-DD");

console.log("\nALL TANK BATTLE STORAGE TESTS PASSED");
